import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CAMP, terrainHeight, smoothstep } from '../world.js';
import { rng, signTexture } from '../textures.js';

export const FOREST = { x:CAMP.x-28, z:CAMP.z-32 };
export function buildForest(world) {
  const root=new THREE.Group();root.name='Firefly forest';world.root.add(root);
  const pad=world.registerAreaPad({...FOREST,hx:10,hz:10,blend:8}),y=pad.y,r=rng(307);
  const route=[[-72,-179],[-86,-179],[-108,-185],[-111,-202],[-99,-214],[FOREST.x,FOREST.z]];
  const curve=new THREE.CatmullRomCurve3(route.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal');
  const startY=terrainHeight(...route[0]),steps=Math.ceil(curve.getLength()/2);
  const routeSamples=[];
  for(let i=0;i<=steps;i++) {
    const u=i/steps,p=curve.getPointAt(u),tangent=curve.getTangentAt(u);routeSamples.push(p);
    world.registerAreaPad({x:p.x,z:p.z,y:startY+(y-startY)*u,yaw:Math.atan2(tangent.x,tangent.z),hx:6,hz:3.5,blend:3});
  }
  const v=(x,h,z)=>new THREE.Vector3(x,h,z),m=color=>new THREE.MeshLambertMaterial({color});
  const bark=m('#8c7056'),moss=m('#759b6f'),cream=m('#f5ebd5'),dark=m('#455c62'),pink=m('#e8b6cb');
  const glows=['#a4ded8','#e6b8d7','#f4dda1'].map(color=>new THREE.MeshLambertMaterial({color,emissive:color,emissiveIntensity:0.1}));
  const buckets=new Map(),variants=[],owls=[],butterflies=[],deer=[];
  function solid(geo,mat,x,h,z,parent=root,rot=null){if(rot)geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rot)));geo.translate(x,h,z);const key=parent.uuid+mat.uuid;if(!buckets.has(key))buckets.set(key,{parent,mat,geos:[]});buckets.get(key).geos.push(geo.index?geo.toNonIndexed():geo);}
  const box=(w,h,d,mat,x,py,z,g=root)=>solid(new THREE.BoxGeometry(w,h,d),mat,x,py,z,g);
  const ball=(radius,mat,x,h,z,g=root,scale=[1,1,1])=>solid(new THREE.SphereGeometry(radius,12,8).scale(...scale),mat,x,h,z,g);
  function group(x,h,z,parent=root){const g=new THREE.Group();g.position.set(x,h,z);parent.add(g);return g;}
  world.updateTerrain();
  const trail=world._ribbon(route,2.4,world._pathMaterial(),{step:1});root.attach(trail);
  // Copy the existing plant variants and sway materials so every art style keeps its own trees.
  const spots=[];
  for(let i=0;i<65;i++){
    const a=r()*Math.PI*2,d=13+r()*28,x=FOREST.x+Math.cos(a)*d,z=FOREST.z+Math.sin(a)*d;
    if(Math.hypot(x-CAMP.x,z-CAMP.z)<19||routeSamples.some(p=>Math.hypot(x-p.x,z-p.z)<8))continue;
    spots.push([x,terrainHeight(x,z)-0.1,z,0.85+r()*0.5]);world.colliders.circles.push({x,z,r:0.45});
  }
  function instances(source,list,visibleSource){if(!source||!list.length)return;const im=new THREE.InstancedMesh(source.geometry,source.material,list.length),matrix=new THREE.Matrix4();list.forEach(([x,h,z,s],i)=>im.setMatrixAt(i,matrix.makeScale(s,s,s).setPosition(x,h,z)));im.castShadow=source.castShadow;im.receiveShadow=true;im.computeBoundingSphere();root.add(im);variants.push({im,source:visibleSource});}
  for(const set of ['oil','clean']){
    const g=world.foliage?.[set];if(!g)continue;
    instances(g.children[1]||g.children[0],spots,g);
    const bushes=spots.filter((_,i)=>i%2===0).map(([x,h,z])=>[x+1,h,z+0.7,0.8]);
    instances(g.children[4],bushes,g);
  }
  const low={geometry:world.treeGeos[3],material:world.mat.foliage,castShadow:true};instances(low,spots,world.lowPoly[0]);
  instances(world.blocky[3]||world.blocky[0],spots,world.blocky[0]);
  for(let i=0;i<34;i++){
    const a=r()*Math.PI*2,d=6+r()*23,x=FOREST.x+Math.cos(a)*d,z=FOREST.z+Math.sin(a)*d,h=terrainHeight(x,z);
    const rock=new THREE.DodecahedronGeometry(0.7+r()*0.5,0).scale(1.5,0.5,1);solid(rock,moss,x,h+0.2,z);
    for(let k=0;k<5;k++){const angle=k*1.257;solid(new THREE.SphereGeometry(0.25,6,4).scale(0.4,0.17,2.1),moss,x+Math.cos(angle)*0.4,h+0.15,z+Math.sin(angle)*0.4,root,[0,-angle,0.25]);}
  }
  for(const [x,z]of [[-88,-175],[-115,-190],[-105,-216]]){
    const g=group(x,terrainHeight(x,z),z);box(0.1,2.3,0.1,bark,0,1.15,0,g);box(0.25,0.4,0.25,world.mat.lantern,0,2.1,0,g);
    const halo=new THREE.Sprite(world.haloMat);halo.position.y=2.1;halo.scale.setScalar(2);g.add(halo);world.colliders.circles.push({x,z,r:0.15});
  }
  const sign=group(CAMP.x-7,terrainHeight(CAMP.x-7,CAMP.z-7),CAMP.z-7);
  box(0.13,2,0.13,bark,0,1,0,sign);solid(new THREE.BoxGeometry(2.8,0.6,0.12),new THREE.MeshLambertMaterial({map:signTexture('FOREST TRAIL',768,192,[70,22,80],'#47654f')}),0,1.85,0,sign);
  const log=group(FOREST.x-1,y,FOREST.z-2);
  solid(new THREE.CylinderGeometry(0.5,0.57,4.3,12),bark,0,0.5,0,log,[0,0,Math.PI/2]);
  solid(new THREE.CylinderGeometry(0.51,0.51,0.03,16),cream,2.16,0.5,0,log,[0,0,Math.PI/2]);
  for(let i=0;i<8;i++)ball(0.3,moss,-1.6+i*0.45,0.86,0,log,[1.2,0.4,0.8]);
  world.colliders.circles.push({x:FOREST.x-1,z:FOREST.z-2,r:1});
  for(const dx of [-0.6,0.6])world.benches.push({x:FOREST.x-1+dx,y:y+0.95,z:FOREST.z-1.85,yaw:0,who:null});
  const stump=group(FOREST.x+5,y,FOREST.z-3);
  solid(new THREE.CylinderGeometry(0.7,0.9,1.1,12),bark,0,0.55,0,stump);solid(new THREE.CylinderGeometry(0.7,0.7,0.06,12),cream,0,1.13,0,stump);
  solid(new THREE.SphereGeometry(0.34,12,8).scale(0.85,1.25,0.15),glows[1],0,0.43,0.78,stump);ball(0.05,cream,0.16,0.4,0.84,stump);
  world.colliders.circles.push({x:FOREST.x+5,z:FOREST.z-3,r:0.9});
  for(let i=0;i<36;i++){
    const a=i*Math.PI*2/18,d=i<18?4.4:7.7,x=FOREST.x+Math.cos(a)*d,z=FOREST.z+Math.sin(a)*d,h=terrainHeight(x,z),s=0.7+(i%4)*0.16;
    solid(new THREE.CylinderGeometry(0.06*s,0.09*s,0.45*s,8),cream,x,h+0.23*s,z);
    solid(new THREE.SphereGeometry(0.3*s,12,8,0,Math.PI*2,0,Math.PI/2),glows[i%3],x,h+0.43*s,z);
    for(let j=0;j<3;j++)ball(0.04,cream,x+Math.cos(j*2.094)*0.15*s,h+0.64*s,z+Math.sin(j*2.094)*0.15*s);
  }
  for(let i=0;i<3;i++){
    const x=FOREST.x-8+i*8,z=FOREST.z-15,h=terrainHeight(x,z),perch=group(x,h,z);
    solid(new THREE.CylinderGeometry(0.22,0.35,4,8),bark,0,2,0,perch);box(2,0.15,0.2,bark,0.5,3.8,0,perch);
    const owl=group(0.65,4.15,0,perch);ball(0.38,bark,0,0.25,0,owl,[0.9,1.2,0.8]);ball(0.3,cream,0,0.25,0.19,owl,[0.8,1.1,0.4]);
    const head=group(0,0.67,0,owl),eyes=[];ball(0.38,bark,0,0,0,head,[1.1,1,0.9]);
    for(const sx of [-1,1]){ball(0.17,cream,sx*0.17,0.02,0.28,head);const eye=new THREE.Mesh(new THREE.SphereGeometry(0.09,12,8),dark);eye.position.set(sx*0.17,0.02,0.43);head.add(eye);eyes.push(eye);}
    ball(0.065,glows[2],0,-0.12,0.36,head);owls.push({owl,head,eyes,x,z});
  }
  const deerCoat=m('#b58a62');deerCoat.emissive.set('#b58a62');deerCoat.emissiveIntensity=0.08;
  for(const [i,[x,z,scale]] of [[-67,-204,1],[-64,-206,0.95],[-66,-208,0.62]].entries()){
    const g=group(x,terrainHeight(x,z),z);g.scale.setScalar(scale);g.rotation.y=-0.6+i*0.35;
    ball(0.6,deerCoat,0,1.05,0,g,[0.85,0.7,1.4]);
    for(const sx of [-1,1])for(const sz of [-1,1])ball(0.095,deerCoat,sx*0.29,0.43,sz*0.5,g,[1,4.4,1]);
    const head=group(0,1.4,0.55,g);ball(0.29,deerCoat,0,0,0.12,head,[0.9,1,1.25]);ball(0.15,cream,0,-0.08,0.37,head,[1,0.7,0.9]);
    for(const sx of [-1,1]){ball(0.12,deerCoat,sx*0.22,0.3,0,head,[1,1.8,0.5]);ball(0.07,cream,sx*0.22,0.07,0.25,head);ball(0.037,dark,sx*0.23,0.07,0.3,head);}
    ball(0.16,cream,0,1.1,-0.75,g,[0.8,0.7,1.5]);
    if(i===2)for(const sx of [-1,1])for(const dz of [-0.25,0,0.25])ball(0.055,cream,sx*0.48,1.17,dz,g,[0.3,1,1]);
    deer.push({g,head,x,z});
  }
  const rabbit=group(FOREST.x-4,y,FOREST.z+2);
  ball(0.34,cream,0,0.35,0,rabbit,[0.85,0.9,1.3]);ball(0.23,cream,0,0.65,0.32,rabbit);
  for(const sx of [-1,1]){ball(0.09,cream,sx*0.12,1,0.3,rabbit,[0.8,2.8,1]);ball(0.03,dark,sx*0.12,0.7,0.51,rabbit);ball(0.05,pink,sx*0.12,1,0.38,rabbit,[0.7,3,0.4]);}ball(0.13,cream,0,0.4,-0.4,rabbit);
  for(let i=0;i<7;i++){
    const g=group(0,0,0),wings=[];for(const sx of [-1,1]){const wing=new THREE.Mesh(new THREE.CircleGeometry(0.17,12),glows[i%3]);wing.material.side=THREE.DoubleSide;wing.position.x=sx*0.13;wing.scale.set(1,1.4,1);g.add(wing);wings.push(wing);}butterflies.push({g,wings});
  }
  const fp=new Float32Array(90*3),fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(fp,3));
  const fireflies=new THREE.Points(fg,new THREE.PointsMaterial({color:'#fff5b8',size:0.14,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));fireflies.frustumCulled=false;root.add(fireflies);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d'),grad=ctx.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,'rgba(255,248,210,0.5)');grad.addColorStop(1,'rgba(255,248,210,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,64,64);const tex=new THREE.CanvasTexture(canvas);
  const shafts=[];for(let i=0;i<4;i++){const g=new THREE.Mesh(new THREE.PlaneGeometry(3,14),new THREE.MeshBasicMaterial({map:tex,color:'#fff0b7',transparent:true,opacity:0.08,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));g.position.set(FOREST.x-9+i*6,y+7,FOREST.z-2+i%2*5);root.add(g);shafts.push(g);}
  const nightGlow=new THREE.Mesh(new THREE.PlaneGeometry(22,22),new THREE.MeshBasicMaterial({map:tex,color:'#a4cbbb',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));nightGlow.rotation.x=-Math.PI/2;nightGlow.position.set(FOREST.x,y+0.07,FOREST.z);root.add(nightGlow);
  for(const {parent,mat,geos}of buckets.values()){const mesh=new THREE.Mesh(mergeGeometries(geos),mat);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);for(const g of geos)g.dispose();}
  root.updateMatrixWorld(true);
  return {root,pad,owls,rabbit,deer,fireflies,variants,trail,update(t,camera,atmos){
    const night=Math.max(atmos.stars,world.lanternLevel*0.8),day=1-smoothstep(0.2,0.75,night);
    variants.forEach(({im,source})=>im.visible=source.visible);
    glows.forEach(mat=>mat.emissiveIntensity=0.1+night*0.9);fireflies.material.opacity=night*0.8;
    for(let i=0;i<90;i++){const a=i*2.399,d=4+(i%11)*1.5;fp[i*3]=FOREST.x+Math.cos(a)*d+Math.sin(t*0.23+i)*0.8;fp[i*3+1]=y+0.7+(i%7)*0.45+Math.sin(t*0.5+i)*0.35;fp[i*3+2]=FOREST.z+Math.sin(a)*d+Math.cos(t*0.2+i)*0.8;}fg.attributes.position.needsUpdate=true;
    owls.forEach(({owl,head,eyes},i)=>{owl.visible=night>0.2;head.rotation.y=Math.sin(t*0.25+i)*0.25;const blink=(t+i*3)%11;eyes.forEach(e=>e.scale.y=blink<0.22?0.12:1);});
    deer.forEach(({g,head},i)=>{head.rotation.x=0.3+Math.sin(t*0.37+i)*0.18;head.rotation.y=Math.sin(t*0.19+i)*0.08;g.visible=true;});
    rabbit.visible=day>0.2;const hop=Math.max(0,Math.sin((t%14)*1.6))*((t%14)<4?1:0);rabbit.position.set(FOREST.x-4+Math.sin(t*0.2)*1.2,y+hop*0.22,FOREST.z+2);rabbit.rotation.y=Math.sin(t*0.2)*0.4;
    butterflies.forEach(({g,wings},i)=>{g.visible=day>0.3;g.position.set(FOREST.x+Math.sin(t*0.25+i)*4,y+1.3+Math.sin(t*0.6+i)*0.6,FOREST.z+Math.cos(t*0.23+i)*4);wings.forEach((w,k)=>w.rotation.y=Math.sin(t*6+i)*(k?1:-1)*0.7);});
    shafts.forEach((s,i)=>{s.rotation.set(0,Math.atan2(camera.position.x-s.position.x,camera.position.z-s.position.z),-0.22);s.material.opacity=day*0.065*(0.7+0.3*Math.abs(Math.sin(t*0.05+i)));});nightGlow.material.opacity=night*0.15;
  }};
}
