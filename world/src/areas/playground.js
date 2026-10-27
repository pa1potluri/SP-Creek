import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { terrainHeight } from '../world.js';
import { makeCharacter, CAST } from '../characters.js';
import { posePlaygroundChild } from '../life.js';

export const PLAY_PIECES={playSwing:{label:'Gentle swings',bounds:[2.5,1.8]},playSlide:{label:'Little slide',bounds:[0.9,2.3]},playSeesaw:{label:'Seesaw',bounds:[2.8,0.7]},playSandbox:{label:'Sandbox',bounds:[2.6,2.1]},playClimber:{label:'Low climbing frame',bounds:[1.5,1.3]}};
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);

function makePiece(g,type,m){
  const mesh=(geo,mat,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;};
  const box=(x,y,z,w,h,d,mat=m.wood)=>mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z);
  const ball=(x,y,z,r,mat)=>mesh(new THREE.SphereGeometry(r,10,7),mat,x,y,z);
  const bar=(a,b,r=0.055,mat=m.wood)=>{const delta=V().subVectors(b,a),length=delta.length(),o=mesh(new THREE.CapsuleGeometry(r,Math.max(0.01,length-2*r),4,8),mat);o.position.copy(a).add(b).multiplyScalar(0.5);o.quaternion.setFromUnitVectors(V(0,1,0),delta.normalize());return o;};
  g.userData.playMotion=[];
  if(type==='playSwing'){
    for(const x of [-2,2])for(const z of [-1,1])bar(V(x,0.05,z),V(x,2.6,0),0.09,m.green);
    bar(V(-2.3,2.6,0),V(2.3,2.6,0),0.1,m.green);
    const pivot=new THREE.Group();pivot.position.y=2.45;g.add(pivot);
    for(const x of [-0.42,0.42]){const rope=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,1.8,8),m.cream);rope.position.set(x,-0.9,0);pivot.add(rope);}
    const seat=new THREE.Mesh(new THREE.BoxGeometry(1.05,0.12,0.5),m.pink);seat.position.y=-1.8;seat.castShadow=true;pivot.add(seat);g.userData.playMotion.push({pivot,kind:'swing'});g.userData.swingPivot=pivot;
  }else if(type==='playSlide'){
    for(const x of [-0.5,0.5])bar(V(x,0,-1.3),V(x,1.15,-1.3),0.07,m.green);
    box(0,1.05,-1.35,1.1,0.12,0.8,m.blue);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-0.5,1.1,-1,0.5,1.1,-1,-0.5,0.15,1.9,0.5,0.15,1.9],3));geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,1,1,1],2));geo.setIndex([0,2,1,2,3,1]);geo.computeVertexNormals();mesh(geo,m.blue);
    for(const side of [-1,1]){const path=new THREE.CatmullRomCurve3([V(side*0.54,1.2,-1.65),V(side*0.54,1.22,-0.9),V(side*0.54,0.55,1),V(side*0.54,0.25,2)]);mesh(new THREE.TubeGeometry(path,20,0.045,7,false),m.cream);}
    for(let i=0;i<5;i++)box(0,0.12+i*0.2,-2.1+i*0.18,0.85,0.12,0.32,m.wood);
    bar(V(-0.55,0.2,1.9),V(0.55,0.2,1.9),0.07,m.blue);
  }else if(type==='playSeesaw'){
    mesh(new THREE.SphereGeometry(0.45,12,8),m.green,0,0.25,0);
    const pivot=new THREE.Group();pivot.position.y=0.7;g.add(pivot);const plank=new THREE.Mesh(new THREE.BoxGeometry(5,0.16,0.55),m.pink);plank.castShadow=true;pivot.add(plank);
    for(const x of [-2,2]){const h=new THREE.Mesh(new THREE.TorusGeometry(0.16,0.035,6,12),m.cream);h.position.set(x,0.32,0);pivot.add(h);}
    g.userData.playMotion.push({pivot,kind:'seesaw'});
  }else if(type==='playSandbox'){
    box(0,0.04,0,5,0.1,4,m.sand);for(const z of [-2,2])bar(V(-2.5,0.16,z),V(2.5,0.16,z),0.15,m.wood);for(const x of [-2.5,2.5])bar(V(x,0.16,-2),V(x,0.16,2),0.15,m.wood);
    for(const [x,z,colour]of [[-1.2,0.8,m.blue],[1.4,-0.7,m.pink]]){mesh(new THREE.CylinderGeometry(0.22,0.16,0.3,12,1,true),colour,x,0.23,z);const handle=mesh(new THREE.TorusGeometry(0.19,0.025,6,14,Math.PI),m.cream,x,0.4,z);handle.rotation.y=Math.PI/2;}
    for(let i=0;i<4;i++)ball(-0.6+i*0.4,0.12,-0.4,0.18,m.sand);
  }else if(type==='playClimber'){
    for(const x of [-1.2,1.2])for(const z of [-1,1]){bar(V(x,0,z),V(x,1.35,z),0.07,m.green);ball(x,1.35,z,0.11,m.pink);}
    for(const x of [-1.2,1.2])for(const y of [0.25,0.6,0.95,1.3])bar(V(x,y,-1),V(x,y,1),0.055,m.blue);
    for(const z of [-1,1])bar(V(-1.2,1.3,z),V(1.2,1.3,z),0.065,m.cream);
    for(const x of [-0.6,0,0.6])bar(V(x,1.3,-1),V(x,1.3,1),0.05,m.wood);
  }
  // Merge static pieces by material; moving pivots remain separate.
  const batches=new Map();for(const o of [...g.children])if(o.isMesh){o.updateMatrix();const a=batches.get(o.material)||[];a.push(o.geometry.clone().applyMatrix4(o.matrix));batches.set(o.material,a);g.remove(o);o.geometry.dispose();}
  for(const [material,geos]of batches){const o=new THREE.Mesh(mergeGeometries(geos),material);o.castShadow=o.receiveShadow=true;g.add(o);geos.forEach(geo=>geo.dispose());}
  return g;
}

export function buildPlayground(world,life){
  const m={wood:world.mat.wood,...Object.fromEntries(Object.entries({green:'#9aba8c',pink:'#e7adc0',blue:'#a8ccd8',cream:'#f7e5bc',sand:'#ead6a2'}).map(([key,color])=>[key,new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide})]))};
  world.extraBuildPieces??={};for(const [type,spec]of Object.entries(PLAY_PIECES)){world.extraBuildPieces[type]={...spec,build:g=>makePiece(g,type,m)};const button=document.createElement('button');button.dataset.build=type;button.textContent=spec.label;document.querySelector('#buildCatalogue').append(button);}
  const root=new THREE.Group();root.name='Town playground';root.position.set(36,terrainHeight(36,48),48);world.root.add(root);world.registerAreaPad({x:36,z:48,hx:14,hz:13,blend:3,y:root.position.y});world.registerAreaPad({x:38,z:51,hx:24,hz:26,blend:1,clearOnly:true});world.updateTerrain();
  const surface=document.createElement('canvas');surface.width=surface.height=128;const ctx=surface.getContext('2d'),pixels=ctx.createImageData(128,128);
  for(let i=0;i<128*128;i++){const grain=228+((Math.imul(i+713,1103515245)>>>16)%24);pixels.data.set([grain,grain,grain,255],i*4);}ctx.putImageData(pixels,0,0);
  const sandMap=new THREE.CanvasTexture(surface);sandMap.colorSpace=THREE.SRGBColorSpace;sandMap.wrapS=sandMap.wrapT=THREE.RepeatWrapping;sandMap.repeat.set(8,8);
  const groundMaterial=new THREE.MeshLambertMaterial({map:sandMap,color:'#e5d4ad'});groundMaterial.userData.sets={oil:sandMap,clean:sandMap};world.surfaces.add(groundMaterial);
  const ground=new THREE.Mesh(new THREE.CylinderGeometry(13.5,13.5,0.08,64),groundMaterial);ground.scale.z=0.95;ground.position.y=0.025;ground.receiveShadow=true;root.add(ground);
  const positions={playSwing:[-6,-5],playSlide:[-5,5],playSeesaw:[5,-5],playSandbox:[6,5],playClimber:[1,0]},pieces={},safetySurfaces=[];
  for(const [i,[type,[x,z]]]of Object.entries(positions).entries()){const bounds=PLAY_PIECES[type].bounds,patch=new THREE.Mesh(new THREE.CircleGeometry(1,48),[m.cream,m.blue,m.pink,m.cream,m.green][i]);patch.rotation.x=-Math.PI/2;patch.scale.set(bounds[0]+.45,bounds[1]+.45,1);patch.position.set(x,.075,z);patch.receiveShadow=true;root.add(patch);safetySurfaces.push(patch);}
  for(const [type,[x,z]]of Object.entries(positions)){const g=makePiece(new THREE.Group(),type,m);g.position.set(x,0.08,z);root.add(g);pieces[type]=g;const b=PLAY_PIECES[type].bounds;world.colliders.rects.push(world._rectOf(g,0,0,...b));}
  const fences=[];for(const z of [-13,13])fences.push([[-14,z],[14,z]]);fences.push([[14,-13],[14,13]],[[-14,-13],[-14,-1]],[[-14,7],[-14,13]]);
  for(const points of fences){const worldPoints=points.map(([x,z])=>[x+36,z+48]);const fence=world._fence(worldPoints,true);root.attach(fence);fence.scale.y=0.65;}
  for(const [x,z,yaw]of [[-10,-6,Math.PI/2],[11,8,-Math.PI/2]]){const bench=world.makeProp('bench');bench.position.set(x,0.08,z);bench.rotation.y=yaw;root.add(bench);world.colliders.rects.push(world._rectOf(bench,0,0,0.9,0.3));}
  for(const z of [-1,7]){const post=new THREE.Mesh(new THREE.CapsuleGeometry(0.07,1.4,4,8),m.wood);post.position.set(-13,0.75,z);root.add(post);const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.2,12,8),world.mat.lantern);lamp.position.set(-13,1.6,z);root.add(lamp);const halo=new THREE.Sprite(world.haloMat);halo.position.copy(lamp.position);halo.scale.setScalar(1.6);root.add(halo);}
  const flowers=new THREE.InstancedMesh(new THREE.SphereGeometry(0.13,8,5),m.pink,36),stems=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.025,0.025,0.24,6),m.green,36),beds=new THREE.InstancedMesh(new THREE.SphereGeometry(1,12,7),m.wood,6),matrix=new THREE.Matrix4();
  for(let i=0;i<6;i++){const angle=i/6*Math.PI*2,x=Math.cos(angle)*11.8,z=Math.sin(angle)*10.8;beds.setMatrixAt(i,matrix.makeScale(0.85,0.08,0.65).setPosition(x,0.1,z));for(let k=0;k<6;k++){const n=i*6+k,px=x+Math.cos(k*2.4)*0.5,pz=z+Math.sin(k*2.4)*0.38;flowers.setMatrixAt(n,matrix.makeTranslation(px,0.43,pz));stems.setMatrixAt(n,matrix.makeTranslation(px,0.27,pz));}}
  root.add(flowers,stems,beds);
  const accessRoutes=[[[0,64],[18,64],[18,51],[24,51],[27.5,49.5],[29,48]]],accessPaths=[];
  for(const [i,points]of accessRoutes.entries()){const path=world._ribbon(points,i?1.5:2.8,world._pathMaterial(),{lift:.1,step:.5,fitGround:true});root.attach(path);accessPaths.push(path);}
  const pavi=makeCharacter(CAST.pavi),siri=makeCharacter(CAST.siri),slider=makeCharacter({...CAST.kid,shirt:'#a9cfd8',pants:'#c3a78b',hat:null});pieces.playSwing.userData.swingPivot.add(pavi.g);root.add(siri.g,slider.g);pavi.g.position.set(0,-2.55,0);siri.g.position.set(6,-0.1,5.1);siri.g.rotation.y=-0.5;
  const area={root,pieces,ground,safetySurfaces,accessRoutes,accessPaths,kids:[pavi,siri,slider],update(t,camera){
    const focus=camera.position.x>20&&camera.position.x<80&&camera.position.z>20&&camera.position.z<90;pavi.g.visible=siri.g.visible=focus;if(focus){area.hiddenStars??=Object.values(life.stars).map(p=>({p,visible:p.g.visible}));for(const p of Object.values(life.stars))p.g.visible=false;}else if(area.hiddenStars){for(const {p,visible}of area.hiddenStars)p.g.visible=visible;area.hiddenStars=null;}
    for(const g of [...Object.values(pieces),...world.buildings.map(e=>e.obj)])for(const motion of g.userData.playMotion||[]){if(motion.kind==='swing')motion.pivot.rotation.x=Math.sin(t*0.65)*0.12;else motion.pivot.rotation.z=Math.sin(t*0.4)*0.07;}
    posePlaygroundChild(pavi,'swing',t);posePlaygroundChild(siri,'dig',t);
    const phase=((t%32)+32)%32;let x=-5,z,y;
    if(phase<10){const u=phase/10;x=-3+Math.sin(u*Math.PI)*1.1;z=7-4*u;y=0.08;}
    else if(phase<18){const u=(phase-10)/8;x=-3-2*u;z=3+0.65*u;y=0.08+1.05*u;}
    else if(phase<22){x=-5;const u=THREE.MathUtils.smoothstep(phase,20,22);z=3.65+0.35*u;y=1.13+0.05*u;}
    else if(phase<28){const u=(phase-22)/6;x=-5;z=4+2.9*u;y=1.18-0.95*u;}
    else{const u=(phase-28)/4;x=-5+2*u;z=6.9+0.1*u;y=0.23-0.15*u;}
    const offset=posePlaygroundChild(slider,'slide',phase);slider.g.position.set(x,y-offset,z);slider.g.rotation.y=phase<10?Math.atan2(Math.cos(phase/10*Math.PI)*0.346,-0.4):phase<18?Math.atan2(-2,0.65):phase<20?Math.atan2(-2,0.65)*(1-THREE.MathUtils.smoothstep(phase,18,20)):phase<28?0:Math.atan2(2,0.1);
  }};world.playground=area;return area;
}
