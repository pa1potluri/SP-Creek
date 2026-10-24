import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { terrainHeight } from '../world.js';
import { makeCharacter, CAST, animatePerson, pointCharacterArm } from '../characters.js';
export const PONY_FARM={x:-180,z:-80};
export const FARM_PIECES={farmBarn:{label:'Pony farm barn',bounds:[4.8,4]},ponyRail:{label:'Rounded paddock rail',bounds:[3,0.25]},farmHay:{label:'Little hay bale',bounds:[0.8,0.65]},farmVegetables:{label:'Vegetable bed',bounds:[2.2,1.8]},farmPond:{label:'Little duck pond',bounds:[3.3,2.8]}};
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
function materials(){return Object.fromEntries(Object.entries({red:'#c57570',roof:'#8d9185',cream:'#f3dfba',wood:'#ad8c61',hay:'#d8bd7b',soil:'#8e7257',green:'#91ad70',orange:'#dba576',water:'#8fc9cd'}).map(([k,color])=>[k,new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide,emissive:color,emissiveIntensity:k==='cream'?0.08:0})]));}
function makeFarmPiece(g,type,m){
 const add=(geo,mat,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;};
 const box=(w,h,d,x,y,z,mat=m.wood)=>add(new THREE.BoxGeometry(w,h,d),mat,x,y,z);
 if(type==='farmBarn'){
  box(8,4.4,6,0,2.2,0,m.red);const roof=new THREE.CylinderGeometry(1,1,7,3,1);roof.rotateX(-Math.PI/2);roof.scale(9/1.732,1.8/1.5,1);roof.translate(0,1.8/3,0);add(roof,m.roof,0,4.3,0);
  box(3,3,0.12,0,1.5,3.07,m.cream);for(const x of [-1.55,1.55])box(0.14,3.15,0.14,x,1.55,3.17,m.wood);box(3.2,0.14,0.14,0,3.1,3.17,m.wood);box(0.1,3,0.1,0,1.5,3.18,m.wood);
  for(const x of [-2.7,2.7]){box(1.1,1.2,0.1,x,2.5,3.08,m.cream);box(0.06,1.25,0.1,x,2.5,3.17,m.wood);box(1.15,0.06,0.1,x,2.5,3.17,m.wood);}
 }else if(type==='ponyRail'){
  for(const x of [-2.8,0,2.8])add(new THREE.CapsuleGeometry(0.08,0.85,4,8),m.cream,x,0.5,0);for(const y of [0.35,0.75])add(new THREE.CapsuleGeometry(0.055,5.6,4,8),m.cream,0,y,0).rotation.z=Math.PI/2;
 }else if(type==='farmHay'){
  add(new THREE.CapsuleGeometry(0.6,0.4,5,12),m.hay,0,0.6,0).rotation.z=Math.PI/2;for(const x of [-0.35,0.35])add(new THREE.TorusGeometry(0.6,0.025,6,24),m.wood,x,0.6,0).rotation.y=Math.PI/2;
 }else if(type==='farmVegetables'){
  box(4.2,0.2,3.2,0,0.1,0,m.soil);for(const z of [-1.7,1.7])box(4.5,0.3,0.12,0,0.15,z);for(const x of [-2.2,2.2])box(0.12,0.3,3.5,x,0.15,0);
  for(let row=0;row<3;row++)for(let col=0;col<5;col++){const x=-1.6+col*0.8,z=-1.05+row*1.05;add(new THREE.SphereGeometry(0.14,8,6),m.orange,x,0.23,z);const leaf=add(new THREE.SphereGeometry(0.2,8,6),m.green,x,0.4,z);leaf.scale.set(1.2,0.45,1);}
 }else if(type==='farmPond'){
  const pool=add(new THREE.CircleGeometry(3.1,48),m.water,0,0.1,0);pool.rotation.x=-Math.PI/2;pool.scale.y=0.8;
  for(let i=0;i<20;i++){const a=i/20*Math.PI*2;add(new THREE.SphereGeometry(0.2,10,8),m.cream,Math.cos(a)*3.1,0.12,Math.sin(a)*2.48).scale.set(1,0.6,1);}
 }
 const batches=new Map();for(const o of [...g.children])if(o.isMesh){o.updateMatrix();const list=batches.get(o.material)||[];list.push(o.geometry.clone().applyMatrix4(o.matrix));batches.set(o.material,list);g.remove(o);o.geometry.dispose();}for(const [mat,geos]of batches){const o=new THREE.Mesh(mergeGeometries(geos),mat);o.castShadow=o.receiveShadow=true;g.add(o);for(const geo of geos)geo.dispose();}return g;
}
export function buildPonyFarm(world,animals){
 if(world.ponyFarm)return world.ponyFarm;const y=terrainHeight(PONY_FARM.x,PONY_FARM.z),root=new THREE.Group();root.name='Little pony farm';root.position.set(PONY_FARM.x,y,PONY_FARM.z);world.root.add(root);const m=materials();
 world.registerAreaPad({...PONY_FARM,y,hx:24,hz:22,blend:5});world.registerAreaPad({...PONY_FARM,hx:29,hz:26,blend:1,clearOnly:true});world.updateTerrain();
 world.extraBuildPieces??={};for(const [type,spec]of Object.entries(FARM_PIECES)){world.extraBuildPieces[type]={...spec,build:g=>makeFarmPiece(g,type,m)};const b=document.createElement('button');b.dataset.build=type;b.textContent=spec.label;document.querySelector('#buildCatalogue').append(b);}
 const place=(type,x,z,rot=0)=>{const g=makeFarmPiece(new THREE.Group(),type,m);g.position.set(x,0,z);g.rotation.y=rot;root.add(g);return g;};
 const barn=place('farmBarn',-10,-10);root.updateMatrixWorld(true);world.colliders.rects.push(world._rectOf(barn,0,0,4.4,3.4));place('farmHay',-14,-3);place('farmHay',-11,-2);place('farmVegetables',-16,10);place('farmVegetables',-16,15);const pond=place('farmPond',13,15);world.colliders.circles.push({x:PONY_FARM.x+13,z:PONY_FARM.z+15,r:3.35});
 const rails=[];const rail=(x,z,yaw=0)=>{const g=place('ponyRail',x,z,yaw);root.updateMatrixWorld(true);world.colliders.rects.push(world._rectOf(g,0,0,3,0.15));rails.push(g);};
 for(const z of [-11,9])for(const x of [3,9,15])rail(x,z);for(const x of [0,18])for(const z of [-8,-2,4])rail(x,z,Math.PI/2);
 for(const z of [2,10])for(const x of [-10,-4])rail(x,z);for(const x of [-13,-1])rail(x,6,Math.PI/2);
 // Every fixed rail has the same geometry; retain groups for the recorded collider transforms.
 const railSource=rails[0].children[0],railInstances=new THREE.InstancedMesh(railSource.geometry,railSource.material,rails.length);
 railInstances.castShadow=railInstances.receiveShadow=true;
 rails.forEach((g,i)=>{g.updateMatrix();railInstances.setMatrixAt(i,g.matrix);const mesh=g.children[0];g.remove(mesh);if(mesh!==railSource)mesh.geometry.dispose();});
 railInstances.computeBoundingSphere();root.add(railInstances);
 const tray=new THREE.Mesh(new THREE.SphereGeometry(0.45,12,8),m.hay);tray.scale.set(1.6,0.25,1);tray.position.set(7,1.0,9.05);root.add(tray);
 const ponies=[0,1,2].map(i=>{const p=animals.makePony();p.g.scale.setScalar(0.68);p.g.position.set(i?5+i*4:7,0,i?-5+i*2:8.05);root.add(p.g);return p;});
 const babies=[];for(const [kind,x,z]of [['lamb',-5.8,9.4],['lamb',-8,5.5],['calf',-5,5],['piglet',-10,6],['piglet',-11,4],['chick',-8.5,8],['chick',-9,8.5],['chick',-10,8],['chick',-11,8.5],['duck',12,15],['duck',14,15]]){const p=animals.makeBaby(kind);p.kind=kind;p.home=V(x,kind==='duck'?0.12:0,z);p.g.position.copy(p.home);root.add(p.g);babies.push(p);}
 const stars=['pavi','siri'].map((role,i)=>{const p=makeCharacter(CAST[role]);p.g.position.set(i?-6.1:7,0.04,i?10.5:9.8);p.g.rotation.y=Math.PI;root.add(p.g);return p;});
 world._ribbon([[-125,-55],[-145,-42],[-164,-43],[PONY_FARM.x,-57]],2.7,world._pathMaterial(),{lift:0.07});
 const area={root,barn,pond,rails,ponies,babies,stars,y,update(t,camera){
  ponies.forEach((p,i)=>{animals.animatePony(p,t*0.65+i,0.03);if(i===0){p.neck.rotation.x=0.55+Math.sin(t*0.4)*0.08;}else{p.g.position.x=5+i*4+Math.sin(t*0.07+i)*0.7;p.g.position.z=-5+i*2+Math.cos(t*0.06+i)*0.7;p.g.rotation.y=Math.sin(t*0.04+i)*0.3;}});
  babies.forEach((p,i)=>{const pet=i===0,duck=p.kind==='duck';p.g.position.copy(p.home);if(!pet){p.g.position.x+=Math.sin(t*0.09+i)*0.3;p.g.position.z+=Math.cos(t*0.08+i)*0.3;}if(duck)p.g.position.y+=Math.sin(t*0.7+i)*0.015;animals.animateBaby(p,t*0.7+i,pet?0:0.15);});
  const [pavi,siri]=stars;animatePerson(pavi,t*0.5,0);pavi.arms[1].rotation.set(-1.0+Math.sin(t*0.4)*0.04,0,-0.1);pavi.elbows[1].rotation.x=-0.3;pavi.headPitch=0.1;
  animatePerson(siri,t*0.4,0);siri.upper.rotation.x=0.28;siri.knees.forEach(k=>k.rotation.x=0.5);siri.headPitch=0.16;root.updateWorldMatrix(true,false);pointCharacterArm(siri,0,root.localToWorld(V(-5.8,0.75,9.9)),0.8+Math.sin(t*0.5)*0.04);
 }};world.ponyFarm=area;area.update(0,null);return area;
}
export function farmViews(){const ground=()=>terrainHeight(PONY_FARM.x,PONY_FARM.z);return [
 {name:'Little pony farm',group:'Pony farm',duration:100,loop:true,clearance:1.5,sample(t,out){const a=t/100*Math.PI*2;out.pos.set(PONY_FARM.x+30+Math.sin(a),ground()+20,PONY_FARM.z+28);out.look.set(PONY_FARM.x,ground()+1.5,PONY_FARM.z);}},
 {name:'Feeding the ponies',group:'Pony farm',duration:100,loop:true,clearance:1.5,sample(t,out){out.pos.set(PONY_FARM.x+1,ground()+3.2,PONY_FARM.z+17);out.look.set(PONY_FARM.x+7,ground()+1.1,PONY_FARM.z+8.3);}},
 {name:'Gentle lamb friends',group:'Pony farm',duration:100,loop:true,clearance:1.5,sample(t,out){out.pos.set(PONY_FARM.x-10,ground()+2.6,PONY_FARM.z+16);out.look.set(PONY_FARM.x-5.8,ground()+0.8,PONY_FARM.z+10);}}
];}
