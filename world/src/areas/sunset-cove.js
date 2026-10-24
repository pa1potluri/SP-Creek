import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { terrainHeight, walkHeight, coastX, WATER_Y } from '../world.js';
import { makeCharacter, CAST, randomTownsfolk, animatePerson } from '../characters.js';
import { imageTexture } from '../textures.js';

let coveWorld=null,groundHeight=terrainHeight,laneHeight=terrainHeight;
export function beachWalk(t= coveWorld?.waterUniforms.uWaterTime.value||0){const phase=((t%160)+160)%160,u=phase<80?phase/80:2-phase/80,z=-25+u*90,x=coastX(z)+8+18*Math.exp(-Math.pow((z-30)/7,4));return {x,z,y:groundHeight(x,z),yaw:phase<80?0:Math.PI};}
// Camera and actors sample the same local clip time, including when seeking.
export function episodeWalk(kind,t){
  const u=THREE.MathUtils.clamp(t/(kind==='lane'?35:70),0,1);
  let x,z,yaw;
  if(kind==='lane'){x=-300-45*u;z=20;yaw=-Math.PI/2;}
  else {z=-68+30*u;x=coastX(z)+26-22*u;yaw=Math.atan2(-22+(coastX(z+0.1)-coastX(z))*300,30);}
  return {x,z,y:kind==='lane'?Math.max(groundHeight(x,z),laneHeight(x)+0.16):groundHeight(x,z),yaw};
}
export function stageCove(kind,t){if(coveWorld?.sunsetCove)coveWorld.sunsetCove.stage={kind,t};return episodeWalk(kind,t);}
export async function buildSunsetCove(world,life){
  const images={oil:{},clean:{}},load=src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Missing cove art: '+src));image.src=src;});
  await Promise.all(['oil','clean'].flatMap(set=>['plaster_wall','terracotta_roof','cobblestones','beach_sand','palm','bougainvillea'].map(async name=>{const foliage=name==='palm'||name==='bougainvillea';images[set][name]=await load(`assets/${foliage?'foliage':'textures'}/${set}/${name}.png`);if(!foliage)world.painted[set][name]=images[set][name];})));
  const horizons=await Promise.all([1,2].map(i=>load(`assets/backdrop_tiles/sea_horizon_${i}.png`)));

  coveWorld=world;
  // Interpolate the existing ground triangles directly; per-vertex raycasts stall startup.
  groundHeight=(x,z)=>{const g=world.ground.geometry,n=g.parameters.widthSegments,m=g.parameters.heightSegments,a=g.attributes.position,px=(x+800)/1600*n,pz=(z+800)/1600*m,i=Math.max(0,Math.min(n-1,Math.floor(px))),j=Math.max(0,Math.min(m-1,Math.floor(pz))),u=px-i,v=pz-j,k=j*(n+1)+i,h00=a.getY(k),h10=a.getY(k+1),h01=a.getY(k+n+1),h11=a.getY(k+n+2);return u+v<=1?h00+(h10-h00)*u+(h01-h00)*v:h11+(h01-h11)*(1-u)+(h10-h11)*(1-v);};
  const root=new THREE.Group();root.name='Sunset Cove';world.root.add(root);
  const mat=color=>new THREE.MeshLambertMaterial({color}),white=world.paintedMaterial('plaster_wall',2,2,{color:'#ffffff'})||mat('#fff3d7'),roof=world.paintedMaterial('terracotta_roof',3,3,{color:'#ffffff'})||mat('#c47a51');
  const sand=world.paintedMaterial('beach_sand',6,6,{color:'#ffffff'})||mat('#e7c585'),wood=world.mat.wood,green=mat('#729269'),pink=mat('#d988b0'),cream=mat('#f2dcad'),blue=mat('#71b7c6');
  world.registerAreaPad({x:-325,z:25,hx:43,hz:90,blend:1,clearOnly:true});
  const windowMat=new THREE.MeshLambertMaterial({color:'#f1c06f',emissive:'#ffd39b',emissiveIntensity:0.1});
  const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),scale=new THREE.Vector3(),batches=[];
  function add(geo,m,x,y,z,sx=1,sy=1,sz=1,parent=root){const mesh=new THREE.Mesh(geo,m);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function instances(geo,m,items){const mesh=new THREE.InstancedMesh(geo,m,items.length);items.forEach(([x,y,z,sx=1,sy=1,sz=1,yaw=0],i)=>{q.setFromAxisAngle(v.set(0,1,0),yaw);mesh.setMatrixAt(i,matrix.compose(v.set(x,y,z),q,scale.set(sx,sy,sz)));});mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);batches.push(mesh);return mesh;}
  const laneMaterial=world.paintedMaterial('cobblestones',1,1,{vertexColors:true,transparent:true,side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
  const laneBefore=laneMaterial.onBeforeCompile;laneMaterial.onBeforeCompile=(shader,r)=>{laneBefore.call(laneMaterial,shader,r);shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying float vCoveAcross;').replace('#include <begin_vertex>','#include <begin_vertex>\nvCoveAcross=uv.y;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vCoveAcross;').replace('#include <opaque_fragment>','diffuseColor.a *= smoothstep(0.0,0.06,vCoveAcross)*(1.0-smoothstep(0.94,1.0,vCoveAcross));\n#include <opaque_fragment>');};laneMaterial.customProgramCacheKey=()=> 'cove-lane-v1';
  const cottages=[];
  for(let row=0;row<5;row++)for(let col=0;col<3;col++){
    const seed=row*3+col,x=-303-col*15+Math.sin(seed*2.4)*2,z=-38+row*23+(col%2)*2+Math.cos(seed*1.9)*3,y=terrainHeight(x,z),yaw=Math.sin(seed*1.7)*0.16,size=0.88+(seed%4)*0.07;
    world.registerAreaPad({x,z,hx:5.2,hz:5.2,blend:2,y});cottages.push({x,y,z,yaw,size});
    world.colliders.rects.push({cx:x,cz:z,ax:Math.cos(yaw),az:-Math.sin(yaw),bx:Math.sin(yaw),bz:Math.cos(yaw),hx:3.7*size,hz:3.5*size});
  }
  for(let z=-100;z<=175;z+=16)world.registerAreaPad({x:coastX(z)+11,z,hx:8,hz:9,blend:2,y:terrainHeight(coastX(z)+11,z)});
  const laneTop=terrainHeight(-297,20),laneBottom=terrainHeight(-350,20);laneHeight=x=>THREE.MathUtils.lerp(laneTop,laneBottom,THREE.MathUtils.clamp((-297-x)/53,0,1));
  world.registerAreaPad({x:-323.5,z:20,hx:26.5,hz:2.7,blend:1,y:(laneTop+laneBottom)/2,slopeX:(laneTop-laneBottom)/53});
  const deckFloor={cx:-373,cz:30,ax:1,az:0,bx:0,bz:1,hx:23,hz:2.5,y:1.2};
  const sea=world.createSea([deckFloor]);world.updateTerrain();
  instances(new THREE.BoxGeometry(7.4,4.4,7),white,cottages.map(p=>[p.x,p.y+2.2*p.size,p.z,p.size,p.size,p.size,p.yaw]));
  const roofGeo=new THREE.ConeGeometry(1,1,4);roofGeo.rotateY(Math.PI/4);
  instances(roofGeo,roof,cottages.map(p=>[p.x,p.y+5.1*p.size,p.z,6*p.size,2.3*p.size,5.8*p.size,p.yaw]));
  const doors=[],windows=[],flowers=[],pots=[],lanterns=[],vines=[];
  for(const p of cottages){
    const starts=[doors,windows,flowers,pots,lanterns,vines].map(a=>a.length);
    doors.push([p.x-1.6,p.y+1.3,p.z+3.53,1.2,2.5,0.08]);
    for(const dx of [0.5,2.3])windows.push([p.x+dx,p.y+2.4,p.z+3.55,1.1,1.2,0.08]);
    for(let k=0;k<9;k++){const x=p.x-3.2+Math.sin(k*1.5)*0.5,y=p.y+1+k*0.38,z=p.z+3.65;vines.push([x,y,z,0.18,0.30,0.15]);flowers.push([x+0.15,y+0.05,z+0.1,0.21,0.17,0.16]);}
    for(const dx of [-3.2,3.2]){pots.push([p.x+dx,p.y+0.25,p.z+4,0.32,0.5,0.32]);for(let k=0;k<4;k++)flowers.push([p.x+dx+Math.cos(k*1.57)*0.22,p.y+0.65,p.z+4+Math.sin(k*1.57)*0.22,0.16,0.16,0.16]);}
    lanterns.push([p.x-0.5,p.y+2.7,p.z+3.75,0.18,0.3,0.18]);const halo=new THREE.Sprite(world.haloMat);halo.position.set(p.x-0.5,p.y+2.7,p.z+3.85);halo.scale.setScalar(1.8);root.add(halo);
    const transform=a=>{const dx=(a[0]-p.x)*p.size,dz=(a[2]-p.z)*p.size;a[0]=p.x+Math.cos(p.yaw)*dx+Math.sin(p.yaw)*dz;a[2]=p.z-Math.sin(p.yaw)*dx+Math.cos(p.yaw)*dz;a[1]=p.y+(a[1]-p.y)*p.size;for(let k=3;k<6;k++)a[k]=(a[k]??1)*p.size;a[6]=(a[6]||0)+p.yaw;return a;};
    [doors,windows,flowers,pots,lanterns,vines].forEach((a,k)=>{for(let j=starts[k];j<a.length;j++)transform(a[j]);});const h=transform([p.x-0.5,p.y+2.7,p.z+3.85]);halo.position.set(...h.slice(0,3));
  }
  instances(new THREE.BoxGeometry(1,1,1),world.mat.darkWood,doors);instances(new THREE.BoxGeometry(1,1,1),windowMat,windows);
  instances(new THREE.SphereGeometry(1,8,6),green,vines);instances(new THREE.SphereGeometry(1,8,6),pink,flowers);instances(new THREE.CylinderGeometry(0.8,1,1,10),roof,pots);instances(new THREE.SphereGeometry(1,10,8),world.mat.lantern,lanterns);
  // A warm sand ribbon covers the ground shader so winter leaves the beach unfrozen.
  const pos=[],uv=[],colors=[],source=world.ground.geometry,vertices=source.attributes.position,indices=source.index;
  // Reuse the ground's exact triangles, so resampling cannot expose grass along grid creases.
  for(let k=0;k<indices.count;k+=3){const ids=[indices.getX(k),indices.getX(k+1),indices.getX(k+2)],x=ids.reduce((v,i)=>v+vertices.getX(i),0)/3,z=ids.reduce((v,i)=>v+vertices.getZ(i),0)/3;
    if(x<-420||x>-290||z<-115||z>195)continue;const d=x-coastX(z);if(d<-5||d>30)continue;
    for(const i of ids){const px=vertices.getX(i),pz=vertices.getZ(i),edge=px-coastX(pz);pos.push(px,vertices.getY(i)+0.045,pz);uv.push(px/20,pz/20);colors.push(1,1,1,1-THREE.MathUtils.smoothstep(edge,23,30));}}
  const sandGeo=new THREE.BufferGeometry();sandGeo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));sandGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));sandGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));sandGeo.computeVertexNormals();const shoreSand=sand.clone();shoreSand.userData={...sand.userData};world.surfaces.add(shoreSand);
  sand.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vSandPoint;').replace('#include <begin_vertex>','#include <begin_vertex>\nvSandPoint=position;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vSandPoint;').replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nfloat edge=-350.0-18.0*exp(-pow((vSandPoint.z-35.0)/115.0,2.0))+8.0*sin(vSandPoint.z*0.007);if(vSandPoint.y < -1.0 || vSandPoint.x<edge+8.0) discard;');};sand.vertexColors=true;sand.transparent=true;sand.depthWrite=false;sand.polygonOffset=true;sand.polygonOffsetFactor=-2;const beach=add(sandGeo,sand,0,0,0);beach.name='Warm winter-safe beach sand';
  // A metre-spaced strip replaces the coarse terrain only at the water's edge.
  const shorePos=[],shoreUV=[],shoreIndex=[];for(let j=0;j<=310;j++){const z=-115+j;for(let i=0;i<=26;i++){const d=-5+i*0.5,x=coastX(z)+d,y=THREE.MathUtils.lerp(terrainHeight(x,z),groundHeight(x,z),THREE.MathUtils.smoothstep(d,4,8));shorePos.push(x,y+0.05,z);shoreUV.push(x/20,z/20);}}
  for(let j=0;j<310;j++)for(let i=0;i<26;i++){const a=j*27+i,b=a+27;shoreIndex.push(a,b,a+1,b,b+1,a+1);}
  const shoreGeo=new THREE.BufferGeometry();shoreGeo.setAttribute('position',new THREE.Float32BufferAttribute(shorePos,3));shoreGeo.setAttribute('uv',new THREE.Float32BufferAttribute(shoreUV,2));shoreGeo.setIndex(shoreIndex);shoreGeo.computeVertexNormals();shoreSand.transparent=false;shoreSand.vertexColors=false;const shoreline=add(shoreGeo,shoreSand,0,0,0);shoreline.name='Smooth rounded sand shoreline';

  for(const [points,width]of [[[[ -269,0],[-285,10],[-296,20],[-350,20]],5],[[[-308,-55],[-308,70]],3],[[[-327,-55],[-327,70]],3]]){const road=world._ribbon(points,width,laneMaterial,{lift:0.08,step:1});root.attach(road);}
  for(const p of cottages){const lane=world._ribbon([[p.x,p.z+5],[p.x+5,p.z+7],[-317,p.z+7]],1.5,laneMaterial,{lift:0.09,step:1});root.attach(lane);}
  const steps=[];for(let i=0;i<88;i++){const x=-297-i*0.6;steps.push([x,laneHeight(x)+0.04,20,0.65,0.12,5]);}instances(new THREE.BoxGeometry(1,1,1),white,steps);
  const squareY=terrainHeight(-317,-4);add(new THREE.CylinderGeometry(4.2,4.4,0.15,32),white,-317,squareY+0.04,-4);add(new THREE.CylinderGeometry(1.3,1.5,0.7,24),white,-317,squareY+0.4,-4);add(new THREE.CylinderGeometry(1.25,1.25,0.06,24),blue,-317,squareY+0.78,-4);add(new THREE.SphereGeometry(0.45,12,8),cream,-317,squareY+1.4,-4,1,0.45,1);world.colliders.circles.push({x:-317,z:-4,r:1.7});
  const palmSites=[];for(let i=0;i<18;i++){const z=-83+i*14,x=coastX(z)+21+(i%3)*4;palmSites.push([x,terrainHeight(x,z),z,0.8+(i%3)*0.12,0.8+(i%3)*0.12,0.8+(i%3)*0.12,i*2.399]);world.colliders.circles.push({x,z,r:0.3});}
  for(const [x,z]of [[-316,-26],[-335,-13],[-315,9],[-334,43]]){palmSites.push([x,terrainHeight(x,z),z,0.65,0.65,0.65,0]);world.colliders.circles.push({x,z,r:0.3});for(let j=0;j<6;j++)flowers.push([x+Math.cos(j)*0.8,terrainHeight(x,z)+0.2,z+Math.sin(j)*0.8,0.3,0.2,0.3]);}
  instances(new THREE.SphereGeometry(1,8,6),pink,flowers.slice(-24));
  const palm=world.palmGeometry(),palmLeaf=new THREE.MeshLambertMaterial({color:'#71965e',side:THREE.DoubleSide});
  const before=palmLeaf.onBeforeCompile;palmLeaf.onBeforeCompile=(shader,r)=>{before.call(palmLeaf,shader,r);shader.uniforms.uPalmTime=world.waterUniforms.uWaterTime;shader.uniforms.uPalmWind=world.waterUniforms.uWaterWind;shader.vertexShader='uniform float uPalmTime,uPalmWind;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x += sin(uPalmTime*0.65+position.y)*0.10*uPalmWind;');};palmLeaf.customProgramCacheKey=()=> 'cove-palm-v1';
  const palms=[instances(palm.trunk,wood,palmSites),instances(palm.leaves,palmLeaf,palmSites)];
  function cutoutMaterial(name){const sets={oil:imageTexture(images.oil[name]),clean:imageTexture(images.clean[name])},material=new THREE.MeshLambertMaterial({map:sets.clean,alphaTest:0.35,side:THREE.DoubleSide,emissive:0xffffff,emissiveMap:sets.clean,emissiveIntensity:0.08});material.userData.sets=sets;world.surfaces.add(material);return material;}
  const palmPaint=cutoutMaterial('palm'),palmPlane=new THREE.PlaneGeometry(8.4,11.2,3,6);palmPlane.translate(0,5.6,0);
  const paintedPalms=instances(palmPlane,palmPaint,palmSites);paintedPalms.name='Painted cove palms';paintedPalms.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:palmPaint.map,alphaTest:0.35});
  const palmBefore=palmPaint.onBeforeCompile;palmPaint.onBeforeCompile=(shader,r)=>{palmBefore.call(palmPaint,shader,r);shader.uniforms.uPalmTime=world.waterUniforms.uWaterTime;shader.uniforms.uPalmWind=world.waterUniforms.uWaterWind;shader.vertexShader='uniform float uPalmTime,uPalmWind;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x += sin(uPalmTime*0.65+position.y*0.8)*max(0.0,position.y-1.0)*0.018*uPalmWind;');};palmPaint.customProgramCacheKey=()=> 'cove-painted-palm-v1';
  const flowerPaint=cutoutMaterial('bougainvillea'),paintedFlowers=instances(new THREE.PlaneGeometry(3.5,4.6),flowerPaint,cottages.map(p=>[p.x-2.6*Math.cos(p.yaw)+3.8*Math.sin(p.yaw),p.y+2.3*p.size,p.z+2.6*Math.sin(p.yaw)+3.8*Math.cos(p.yaw),p.size,p.size,p.size,p.yaw]));paintedFlowers.name='Painted bougainvillea';
  const panorama=document.createElement('canvas');panorama.width=horizons[0].width+horizons[1].width;panorama.height=horizons[0].height;const pc=panorama.getContext('2d');pc.drawImage(horizons[0],0,0);pc.drawImage(horizons[1],horizons[0].width,0);
  const horizonMap=new THREE.CanvasTexture(panorama);horizonMap.colorSpace=THREE.SRGBColorSpace;horizonMap.wrapS=THREE.RepeatWrapping;horizonMap.repeat.x=-1;
  const horizonHeight=1800*Math.PI/(panorama.width/panorama.height),horizonRatio=0.565;
  const horizonMaterial=new THREE.MeshBasicMaterial({map:horizonMap,transparent:true,depthWrite:false,side:THREE.BackSide,fog:false});
  horizonMaterial.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vSeaPicture;').replace('#include <begin_vertex>','#include <begin_vertex>\nvSeaPicture=uv;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vSeaPicture;').replace('#include <opaque_fragment>','diffuseColor.a *= smoothstep(0.0,0.06,vSeaPicture.x)*(1.0-smoothstep(0.94,1.0,vSeaPicture.x))*(1.0-smoothstep(0.58,0.88,vSeaPicture.y));\n#include <opaque_fragment>');};
  const seaBackdrop=new THREE.Mesh(new THREE.CylinderGeometry(1800,1800,horizonHeight,128,1,true,Math.PI,Math.PI),horizonMaterial);seaBackdrop.name='Cove-only west sea horizon';seaBackdrop.rotation.y=-0.16;seaBackdrop.renderOrder=-4;seaBackdrop.frustumCulled=false;root.add(seaBackdrop);
  sea.sea.material.userData.covePicture={uCovePicture:{value:horizonMap},uCoveTint:{value:horizonMaterial.color},uCoveRotation:{value:seaBackdrop.rotation.y},uCoveHeight:{value:horizonHeight},uCoveFade:{value:1}};
  const rocks=[];for(let i=0;i<25;i++){const z=-100+i*12,x=coastX(z)+(i%2?1:18);rocks.push([x,terrainHeight(x,z)+0.3,z,0.7+i%3*0.4,0.7+i%2*0.6,1.1,i]);if(x>coastX(z)+2)world.colliders.circles.push({x,z,r:1});}instances(new THREE.IcosahedronGeometry(1,1),white,rocks);
  const printCanvas=document.createElement('canvas');printCanvas.width=printCanvas.height=64;const ctx=printCanvas.getContext('2d'),fade=ctx.createRadialGradient(32,32,5,32,32,31);fade.addColorStop(0,'rgba(164,126,75,0.28)');fade.addColorStop(0.55,'rgba(182,143,89,0.16)');fade.addColorStop(1,'rgba(206,171,112,0)');ctx.fillStyle=fade;ctx.fillRect(0,0,64,64);
  const prints=[];for(let i=0;i<90;i++){const z=-25+i,edge=coastX(z)+8;for(const side of [-1,1])prints.push([edge+side*0.17,groundHeight(edge+side*0.17,z)+0.05,z+side*0.22,0.12,1,0.23]);}const printGeo=new THREE.PlaneGeometry(2,2);printGeo.rotateX(-Math.PI/2);const footprints=instances(printGeo,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(printCanvas),transparent:true,opacity:0.65,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3}),prints);footprints.castShadow=false;
  footprints.material.onBeforeCompile=shader=>{shader.uniforms.uPrintTime=world.waterUniforms.uWaterTime;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying float vPrintZ;').replace('#include <begin_vertex>','#include <begin_vertex>\nvPrintZ=instanceMatrix[3].z;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uPrintTime;varying float vPrintZ;').replace('#include <opaque_fragment>','diffuseColor.a *= 1.0-smoothstep(8.0,55.0,mod(uPrintTime-vPrintZ*0.8+160.0,160.0));\n#include <opaque_fragment>');};
  const pier=add(new THREE.BoxGeometry(46,0.25,5),wood,-373,1.075,30);world.walkables.push(pier);
  const railParts=[];for(const side of [-1,1]){for(let x=-395;x<=-350;x+=3)railParts.push(new THREE.BoxGeometry(0.14,1.3,0.14).translate(x,1.8,30+side*2.45));railParts.push(new THREE.BoxGeometry(46,0.12,0.12).translate(-373,2.35,30+side*2.45));world.colliders.segs.push({ax:-396,az:30+side*2.45,bx:-350,bz:30+side*2.45});}world.colliders.segs.push({ax:-395.7,az:27.5,bx:-395.7,bz:32.5});railParts.push(new THREE.BoxGeometry(0.12,0.12,5).translate(-395.7,2.35,30));add(mergeGeometries(railParts),wood,0,0,0);
  const boats=[];for(let i=0;i<3;i++){const g=new THREE.Group();g.position.set(-380-i*9,-0.6,38+i*6);root.add(g);add(new THREE.SphereGeometry(1,16,10,0,Math.PI*2,Math.PI/2,Math.PI/2),i%2?blue:wood,0,0,0,1,0.6,2.7,g);add(new THREE.BoxGeometry(1.6,0.13,0.5),wood,0,0.10,0,1,1,1,g);if(i===2){add(new THREE.CylinderGeometry(0.05,0.07,5,8),wood,0,2.4,0,1,1,1,g);const sailGeo=new THREE.BufferGeometry();sailGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,4.7,0,0,0.6,0,0,0.6,2.3],3));sailGeo.computeVertexNormals();add(sailGeo,new THREE.MeshLambertMaterial({color:'#f3dfb3',side:THREE.DoubleSide}),0,0,0,1,1,1,g);}boats.push(g);}
  const actors=new THREE.Group();actors.name='Cove strolls';root.add(actors);const siblings={pavi:makeCharacter(CAST.pavi),siri:makeCharacter(CAST.siri)};for(const p of Object.values(siblings))actors.add(p.g);
  const walkers=Array.from({length:4},(_,i)=>{const p=makeCharacter(randomTownsfolk(i%2?'townswoman':'shopkeeper'));actors.add(p.g);return p;});
  const area={root,sea:sea.sea,water:sea.area,beach,shoreline,sand,roof,cottages,palms,paintedPalms,paintedFlowers,seaBackdrop,horizonHeight,horizonRatio,images,footprints,boats,actors,siblings,walkers,update(t,camera,cur){
    const focus=camera.position.x<-280;actors.visible=focus;
    const valley=world.root.parent.children.find(o=>o.geometry?.type==='CylinderGeometry'&&o.material?.map&&!o.material.fog);if(focus&&valley){if(area.valleyBackdrop?.mesh!==valley){if(area.valleyBackdrop)area.valleyBackdrop.mesh.visible=area.valleyBackdrop.visible;area.valleyBackdrop={mesh:valley,visible:valley.visible};}valley.visible=false;}else if(area.valleyBackdrop){area.valleyBackdrop.mesh.visible=area.valleyBackdrop.visible;area.valleyBackdrop=null;}
    const sky=world.root.parent.children.find(o=>o.material?.uniforms?.uSunSize);if(focus&&sky)sky.material.uniforms.uSunSize.value=0;
    const painted=world.textureSet!=='flat',set=world.textureSet==='oil'?'oil':'clean';palms.forEach(p=>p.visible=!painted);paintedPalms.visible=painted;paintedFlowers.visible=painted;
    palmPaint.emissiveMap=palmPaint.userData.sets[set];flowerPaint.emissiveMap=flowerPaint.userData.sets[set];paintedPalms.customDepthMaterial.map=palmPaint.map;
    palmSites.forEach(([x,y,z,sx,sy,sz],i)=>{q.setFromAxisAngle(v.set(0,1,0),Math.atan2(camera.position.x-x,camera.position.z-z));paintedPalms.setMatrixAt(i,matrix.compose(v.set(x,y,z),q,scale.set(sx,sy,sz)));});paintedPalms.instanceMatrix.needsUpdate=true;
    seaBackdrop.visible=focus;seaBackdrop.position.set(camera.position.x,camera.position.y+(horizonRatio-0.5)*horizonHeight,camera.position.z);horizonMaterial.opacity=1-0.92*cur.stars;sea.sea.material.userData.covePicture.uCoveFade.value=horizonMaterial.opacity;horizonMaterial.color.set(0xffffff).lerp(cur.fogColor,0.2*cur.stars).multiplyScalar(1-0.65*cur.stars);

    windowMat.emissiveIntensity=0.1+world.lanternLevel*1.4;
    footprints.material.opacity=0.6;
    boats.forEach((g,i)=>{g.position.y=-0.6+Math.sin(t*0.7+i)*0.06;g.rotation.z=Math.sin(t*0.4+i)*0.035;});
    const staged=area.stage;area.stage=null;
    for(const [role,p]of Object.entries(siblings)){const point=staged?episodeWalk(staged.kind,staged.t):beachWalk(t+(role==='pavi'?1.2:0)),side=role==='pavi'?-0.36:0.36,px=point.x+Math.cos(point.yaw)*side,pz=point.z-Math.sin(point.yaw)*side;p.g.position.set(px,(staged?.kind==='lane'?point.y:groundHeight(px,pz))+0.02,pz);p.g.rotation.y=point.yaw;animatePerson(p,(staged?staged.t:t)*4.5,0.5);if(staged){const arm=role==='pavi'?1:0;p.arms[arm].rotation.set(0,0,role==='pavi'?0.35:-0.35);p.elbows[arm].rotation.set(-0.15,0,0);}else if(role==='siri'){p.arms[0].rotation.set(-0.3,0,0.15);p.arms[1].rotation.set(-0.3,0,-0.15);p.elbows[0].rotation.set(-0.8,0,0.8);p.elbows[1].rotation.set(-0.8,0,-0.8);}}
    walkers.forEach((p,i)=>{p.g.visible=!staged;const x=-323+Math.sin(t*0.017+i*1.7)*24,z=20+(i%2?1.4:-1.4);p.g.position.set(x,terrainHeight(x,z),z);p.g.rotation.y=Math.cos(t*0.017+i*1.7)>0?Math.PI/2:-Math.PI/2;animatePerson(p,t*3.5+i,0.6);});
  }};world.sunsetCove=area;return area;
}
