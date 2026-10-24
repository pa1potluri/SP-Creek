import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { terrainHeight, walkHeight, coastX, WATER_Y } from '../world.js';
import { makeCharacter, CAST, randomTownsfolk, animatePerson } from '../characters.js';

let coveWorld=null;
export function beachWalk(t= coveWorld?.waterUniforms.uWaterTime.value||0){const phase=((t%160)+160)%160,u=phase<80?phase/80:2-phase/80,z=-25+u*90;return {x:coastX(z)+8,z,y:terrainHeight(coastX(z)+8,z),yaw:phase<80?0:Math.PI};}
export function buildSunsetCove(world,life){
  coveWorld=world;const root=new THREE.Group();root.name='Sunset Cove';world.root.add(root);
  const mat=color=>new THREE.MeshLambertMaterial({color}),white=world.paintedMaterial('stone',2,2,{color:'#fff3d7'})||mat('#fff3d7'),roof=world.paintedMaterial('roof',3,3,{color:'#c47a51'})||mat('#c47a51');
  const sand=world.paintedMaterial('stone',6,6,{color:'#e7c585'})||mat('#e7c585'),wood=world.mat.wood,green=mat('#729269'),pink=mat('#d988b0'),cream=mat('#f2dcad'),blue=mat('#71b7c6');
  const windowMat=new THREE.MeshLambertMaterial({color:'#f1c06f',emissive:'#ffd39b',emissiveIntensity:0.1});
  const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),scale=new THREE.Vector3(),batches=[];
  function add(geo,m,x,y,z,sx=1,sy=1,sz=1,parent=root){const mesh=new THREE.Mesh(geo,m);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function instances(geo,m,items){const mesh=new THREE.InstancedMesh(geo,m,items.length);items.forEach(([x,y,z,sx=1,sy=1,sz=1,yaw=0],i)=>{q.setFromAxisAngle(v.set(0,1,0),yaw);mesh.setMatrixAt(i,matrix.compose(v.set(x,y,z),q,scale.set(sx,sy,sz)));});mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);batches.push(mesh);return mesh;}
  const cottages=[];
  for(let row=0;row<5;row++)for(let col=0;col<3;col++){
    const x=-303-col*15,z=-38+row*23+(col%2)*2,y=terrainHeight(x,z);
    world.registerAreaPad({x,z,hx:4.4,hz:4.2,blend:3,y});cottages.push({x,y,z});
    world.colliders.rects.push({cx:x,cz:z,ax:1,az:0,bx:0,bz:1,hx:3.7,hz:3.5});
  }
  for(let z=-100;z<=175;z+=16)world.registerAreaPad({x:coastX(z)+11,z,hx:8,hz:9,blend:2,y:terrainHeight(coastX(z)+11,z)});
  const deckFloor={cx:-373,cz:30,ax:1,az:0,bx:0,bz:1,hx:23,hz:2.5,y:1.2};
  const sea=world.createSea([deckFloor]);world.updateTerrain();
  instances(new THREE.BoxGeometry(7.4,4.4,7),white,cottages.map(p=>[p.x,p.y+2.2,p.z]));
  const roofGeo=new THREE.ConeGeometry(1,1,4);roofGeo.rotateY(Math.PI/4);
  instances(roofGeo,roof,cottages.map(p=>[p.x,p.y+5.1,p.z,6,2.3,5.8]));
  const doors=[],windows=[],flowers=[],pots=[],lanterns=[],vines=[];
  for(const p of cottages){
    doors.push([p.x-1.6,p.y+1.3,p.z+3.53,1.2,2.5,0.08]);
    for(const dx of [0.5,2.3])windows.push([p.x+dx,p.y+2.4,p.z+3.55,1.1,1.2,0.08]);
    for(let k=0;k<9;k++){const x=p.x-3.2+Math.sin(k*1.5)*0.5,y=p.y+1+k*0.38,z=p.z+3.65;vines.push([x,y,z,0.18,0.30,0.15]);flowers.push([x+0.15,y+0.05,z+0.1,0.21,0.17,0.16]);}
    for(const dx of [-3.2,3.2]){pots.push([p.x+dx,p.y+0.25,p.z+4,0.32,0.5,0.32]);for(let k=0;k<4;k++)flowers.push([p.x+dx+Math.cos(k*1.57)*0.22,p.y+0.65,p.z+4+Math.sin(k*1.57)*0.22,0.16,0.16,0.16]);}
    lanterns.push([p.x-0.5,p.y+2.7,p.z+3.75,0.18,0.3,0.18]);const halo=new THREE.Sprite(world.haloMat);halo.position.set(p.x-0.5,p.y+2.7,p.z+3.85);halo.scale.setScalar(1.8);root.add(halo);
  }
  instances(new THREE.BoxGeometry(1,1,1),world.mat.darkWood,doors);instances(new THREE.BoxGeometry(1,1,1),windowMat,windows);
  instances(new THREE.SphereGeometry(1,8,6),green,vines);instances(new THREE.SphereGeometry(1,8,6),pink,flowers);instances(new THREE.CylinderGeometry(0.8,1,1,10),roof,pots);instances(new THREE.SphereGeometry(1,10,8),world.mat.lantern,lanterns);
  // A warm sand ribbon covers the ground shader so winter leaves the beach unfrozen.
  const pos=[],uv=[],idx=[];for(let j=0;j<=150;j++){const z=-110+j*2,edge=coastX(z);for(let i=0;i<=8;i++){const x=edge-0.5+i*3.2;pos.push(x,terrainHeight(x,z)+0.045,z);uv.push(i/3,j/10);}}
  for(let j=0;j<150;j++)for(let i=0;i<8;i++){const a=j*9+i,b=a+9;idx.push(a,b,a+1,b,b+1,a+1);}const sandGeo=new THREE.BufferGeometry();sandGeo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));sandGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));sandGeo.setIndex(idx);sandGeo.computeVertexNormals();const beach=add(sandGeo,sand,0,0,0);beach.name='Warm winter-safe beach sand';
  for(const [points,width]of [[[[ -269,0],[-285,10],[-296,20],[-350,20]],5],[[[-308,-55],[-308,70]],3],[[[-327,-55],[-327,70]],3]]){const road=world._ribbon(points,width,world._pathMaterial(),{lift:0.08,step:1});root.attach(road);}
  const steps=[];for(let i=0;i<21;i++){const x=-300-i*2.4;steps.push([x,terrainHeight(x,20)+0.04,20,2.45,0.12,5]);}instances(new THREE.BoxGeometry(1,1,1),white,steps);
  const squareY=terrainHeight(-317,-4);add(new THREE.CylinderGeometry(4.2,4.4,0.15,32),white,-317,squareY+0.04,-4);add(new THREE.CylinderGeometry(1.3,1.5,0.7,24),white,-317,squareY+0.4,-4);add(new THREE.CylinderGeometry(1.25,1.25,0.06,24),blue,-317,squareY+0.78,-4);add(new THREE.SphereGeometry(0.45,12,8),cream,-317,squareY+1.4,-4,1,0.45,1);world.colliders.circles.push({x:-317,z:-4,r:1.7});
  const palmSites=[];for(let i=0;i<18;i++){const z=-83+i*14,x=coastX(z)+21+(i%3)*4;palmSites.push([x,terrainHeight(x,z),z,0.8+(i%3)*0.12,0.8+(i%3)*0.12,0.8+(i%3)*0.12,i*2.399]);world.colliders.circles.push({x,z,r:0.3});}
  const palm=world.palmGeometry(),palmLeaf=new THREE.MeshLambertMaterial({color:'#71965e',side:THREE.DoubleSide});
  const before=palmLeaf.onBeforeCompile;palmLeaf.onBeforeCompile=(shader,r)=>{before.call(palmLeaf,shader,r);shader.uniforms.uPalmTime=world.waterUniforms.uWaterTime;shader.uniforms.uPalmWind=world.waterUniforms.uWaterWind;shader.vertexShader='uniform float uPalmTime,uPalmWind;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x += sin(uPalmTime*0.65+position.y)*0.10*uPalmWind;');};palmLeaf.customProgramCacheKey=()=> 'cove-palm-v1';
  const palms=[instances(palm.trunk,wood,palmSites),instances(palm.leaves,palmLeaf,palmSites)];
  const rocks=[];for(let i=0;i<25;i++){const z=-100+i*12,x=coastX(z)+(i%2?1:18);rocks.push([x,terrainHeight(x,z)+0.3,z,0.7+i%3*0.4,0.7+i%2*0.6,1.1,i]);if(x>coastX(z)+2)world.colliders.circles.push({x,z,r:1});}instances(new THREE.IcosahedronGeometry(1,1),white,rocks);
  const prints=[];for(let i=0;i<90;i++){const z=-25+i,edge=coastX(z)+8;for(const side of [-1,1])prints.push([edge+side*0.17,terrainHeight(edge+side*0.17,z)+0.06,z+side*0.22,0.10,1,0.23]);}const printGeo=new THREE.CircleGeometry(1,10);printGeo.rotateX(-Math.PI/2);instances(printGeo,mat('#b79b6d'),prints);
  const pier=add(new THREE.BoxGeometry(46,0.25,5),wood,-373,1.075,30);world.walkables.push(pier);
  const railParts=[];for(const side of [-1,1]){for(let x=-395;x<=-350;x+=3)railParts.push(new THREE.BoxGeometry(0.14,1.3,0.14).translate(x,1.8,30+side*2.45));railParts.push(new THREE.BoxGeometry(46,0.12,0.12).translate(-373,2.35,30+side*2.45));world.colliders.segs.push({ax:-396,az:30+side*2.45,bx:-350,bz:30+side*2.45});}world.colliders.segs.push({ax:-395.7,az:27.5,bx:-395.7,bz:32.5});railParts.push(new THREE.BoxGeometry(0.12,0.12,5).translate(-395.7,2.35,30));add(mergeGeometries(railParts),wood,0,0,0);
  const boats=[];for(let i=0;i<3;i++){const g=new THREE.Group();g.position.set(-380-i*9,-0.6,38+i*6);root.add(g);add(new THREE.SphereGeometry(1,16,10,0,Math.PI*2,Math.PI/2,Math.PI/2),i%2?blue:wood,0,0,0,1,0.6,2.7,g);add(new THREE.BoxGeometry(1.6,0.13,0.5),wood,0,0.10,0,1,1,1,g);if(i===2){add(new THREE.CylinderGeometry(0.05,0.07,5,8),wood,0,2.4,0,1,1,1,g);const sailGeo=new THREE.BufferGeometry();sailGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,4.7,0,0,0.6,0,0,0.6,2.3],3));sailGeo.computeVertexNormals();add(sailGeo,new THREE.MeshLambertMaterial({color:'#f3dfb3',side:THREE.DoubleSide}),0,0,0,1,1,1,g);}boats.push(g);}
  add(new THREE.IcosahedronGeometry(1,2),white,-470,0,-60,13,5,10);add(new THREE.CylinderGeometry(1.6,2.2,13,20),white,-470,10,-60);add(new THREE.CylinderGeometry(2.1,2.1,1.5,16),world.mat.lantern,-470,17,-60);add(new THREE.ConeGeometry(2.6,2,20),roof,-470,18.7,-60);
  const beamRoot=new THREE.Group();beamRoot.position.set(-470,17,-60);root.add(beamRoot);const beam=add(new THREE.ConeGeometry(7,75,24,1,true),new THREE.MeshBasicMaterial({color:'#fff1bb',transparent:true,opacity:0.035,depthWrite:false,side:THREE.DoubleSide}),37.5,0,0,1,1,1,beamRoot);beam.rotation.z=Math.PI/2;
  const actors=new THREE.Group();actors.name='Cove strolls';root.add(actors);const siblings={pavi:makeCharacter(CAST.pavi),siri:makeCharacter(CAST.siri)};for(const p of Object.values(siblings))actors.add(p.g);
  const walkers=Array.from({length:4},(_,i)=>{const p=makeCharacter(randomTownsfolk(i%2?'townswoman':'shopkeeper'));actors.add(p.g);return p;});
  const area={root,sea:sea.sea,water:sea.area,beach,sand,roof,cottages,palms,boats,actors,siblings,walkers,update(t,camera,cur){
    const focus=camera.position.x<-280;actors.visible=focus;for(const p of Object.values(life.stars))p.g.visible=!focus;
    windowMat.emissiveIntensity=0.1+world.lanternLevel*1.4;beamRoot.visible=cur.stars>0.15;beamRoot.rotation.y=t*0.025;
    boats.forEach((g,i)=>{g.position.y=-0.6+Math.sin(t*0.7+i)*0.06;g.rotation.z=Math.sin(t*0.4+i)*0.035;});
    for(const [role,p]of Object.entries(siblings)){const point=beachWalk(t+(role==='pavi'?4:0));p.g.position.set(point.x+(role==='pavi'?-0.4:0.4),point.y+0.02,point.z);p.g.rotation.y=point.yaw;animatePerson(p,t*(role==='pavi'?7:4.5),role==='pavi'?0.9:0.5);if(role==='siri'){p.arms[0].rotation.set(-0.3,0,0.15);p.arms[1].rotation.set(-0.3,0,-0.15);p.elbows[0].rotation.set(-0.8,0,0.8);p.elbows[1].rotation.set(-0.8,0,-0.8);}}
    walkers.forEach((p,i)=>{const x=-323+Math.sin(t*0.017+i*1.7)*24,z=20+(i%2?1.4:-1.4);p.g.position.set(x,terrainHeight(x,z),z);p.g.rotation.y=Math.cos(t*0.017+i*1.7)>0?Math.PI/2:-Math.PI/2;animatePerson(p,t*3.5+i,0.6);});
  }};world.sunsetCove=area;return area;
}
