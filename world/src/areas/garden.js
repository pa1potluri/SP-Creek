import * as THREE from 'three';
import { terrainHeight, walkHeight, batchRigidParts } from '../world.js';
export const GARDEN={x:-151,z:10};
export const GARDEN_PIECES={seedBed:{label:'Little seed bed',bounds:[2.8,1.8]},sunflowerBed:{label:'Sunflower bed',bounds:[2.8,1.8]},carrotBed:{label:'Carrot bed',bounds:[2.8,1.8]},pumpkinBed:{label:'Pumpkin bed',bounds:[2.8,1.8]},flowerBed:{label:'Flower garden bed',bounds:[2.8,1.8]}};
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const material=color=>new THREE.MeshLambertMaterial({color,emissive:color,emissiveIntensity:0.07});
const colors={wood:'#c3a17b',soil:'#92785d',green:'#94b77a',yellow:'#f3cf72',orange:'#e6ab6b',pink:'#dfb2ce',cream:'#f6e5b8',blue:'#a9cbd1'};
function makeBed(type,m){
 const root=new THREE.Group(),plants=[],fruits=[];
 const add=(geo,mat,x,y,z,parent=root)=>{const g=new THREE.Mesh(geo,mat);g.position.set(x,y,z);g.castShadow=g.receiveShadow=true;parent.add(g);return g;};
 add(new THREE.BoxGeometry(5.2,0.12,3.2),m.soil,0,0.09,0);
 for(const x of [-2.65,2.65])add(new THREE.CapsuleGeometry(0.09,3.2,3,8).rotateX(Math.PI/2),m.wood,x,0.15,0);
 for(const z of [-1.65,1.65])add(new THREE.CapsuleGeometry(0.09,5.2,3,8).rotateZ(Math.PI/2),m.wood,0,0.15,z);
 for(let i=0;i<8;i++){
  const plant=new THREE.Group();plant.position.set(-1.8+(i%4)*1.2,0.15,i<4?-0.8:0.8);root.add(plant);plants.push(plant);
  if(type==='seedBed'){add(new THREE.SphereGeometry(0.06,8,6),m.cream,0,0.03,0,plant);continue;}
  const tall=type==='sunflowerBed',h=tall?1.8:type==='flowerBed'?0.65:0.3;
  add(new THREE.CapsuleGeometry(0.026,h,3,6),m.green,0,h/2,0,plant);
  for(const side of [-1,1]){const leaf=add(new THREE.SphereGeometry(0.19,8,6).scale(1.4,0.3,0.7),m.green,side*0.14,h*0.45,0,plant);leaf.rotation.z=side*0.25;}
  if(tall||type==='flowerBed'){
   const flower=new THREE.Group();flower.position.y=h;plant.add(flower);
   for(let k=0;k<8;k++){const a=k/8*Math.PI*2;add(new THREE.SphereGeometry(tall?0.13:0.085,8,6).scale(0.8,1.5,0.45),tall?m.yellow:m.pink,Math.sin(a)*(tall?0.21:0.13),Math.cos(a)*(tall?0.21:0.13),0,flower).rotation.z=-a;}
   add(new THREE.SphereGeometry(tall?0.14:0.08,10,8).scale(1,1,0.5),tall?m.soil:m.yellow,0,0,0.04,flower);
  }else{
   const fruit=new THREE.Group();plant.add(fruit);fruits.push(fruit);
   if(type==='pumpkinBed'){for(let k=0;k<6;k++){const a=k/6*Math.PI*2;add(new THREE.SphereGeometry(0.24,10,8).scale(0.8,0.8,1),m.orange,Math.sin(a)*0.1,0.2,Math.cos(a)*0.1,fruit);}add(new THREE.CapsuleGeometry(0.035,0.1,3,6),m.green,0,0.42,0,fruit);}
   else{add(new THREE.CapsuleGeometry(0.09,0.18,4,10),m.orange,0,0.07,0,fruit);for(let k=0;k<3;k++){const leaf=add(new THREE.CapsuleGeometry(0.025,0.27,3,6),m.green,0,0.33,0,fruit);leaf.rotation.z=(k-1)*0.4;}}
  }
  batchRigidParts(plant);
 }
 batchRigidParts(root);
 return {root,plants,fruits,update(k,picked=false){plants.forEach((g,i)=>{g.scale.setScalar(Math.max(0.015,k));g.visible=k>0.01;});fruits.forEach((g,i)=>{g.visible=k>0.5&&!(picked&&i===0);});}};
}
export function buildGarden(world){
 if(world.garden)return world.garden;
 const root=new THREE.Group();root.name='Pavi and Siri little garden';const pad=world.registerAreaPad({...GARDEN,hx:14,hz:12,blend:4});root.position.set(GARDEN.x,pad.y,GARDEN.z);world.root.add(root);world.registerAreaPad({...GARDEN,hx:17,hz:15,blend:1,clearOnly:true});world.updateTerrain();
 const m=Object.fromEntries(Object.entries(colors).map(([k,c])=>[k,material(c)]));
 world.extraBuildPieces??={};for(const [type,spec]of Object.entries(GARDEN_PIECES)){world.extraBuildPieces[type]={...spec,build:g=>g.add(makeBed(type,m).root)};const b=document.createElement('button');b.dataset.build=type;b.textContent=spec.label;document.querySelector('#buildCatalogue').append(b);}
 const beds=['sunflowerBed','carrotBed','pumpkinBed','flowerBed'].map((type,i)=>{const bed=makeBed(type,m);bed.root.position.set(i%2?5:-5,0,i<2?-4:4);root.add(bed.root);return bed;});
 root.updateMatrixWorld(true);for(const bed of beds)world.colliders.rects.push(world._rectOf(bed.root,0,0,2.75,1.75));
 world._ribbon([[-145,45],[-140,30],[-151,24],[GARDEN.x,GARDEN.z]],2.3,world._pathMaterial(),{lift:0.07});
 const add=(geo,mat,x,y,z,parent=root)=>{const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const basket=new THREE.Group();basket.position.set(0,0.28,6);root.add(basket);add(new THREE.SphereGeometry(1,12,8,0,Math.PI*2,Math.PI/2,Math.PI/2).scale(0.5,0.4,0.35),m.wood,0,0,0,basket);add(new THREE.TorusGeometry(0.32,0.03,5,18),m.wood,0,0.25,0,basket);const harvest=[];for(let i=0;i<5;i++)harvest.push(add(new THREE.SphereGeometry(0.12,8,6),m.orange,-0.25+i*0.12,0.05,(i%2)*0.1,basket));
 const can=new THREE.Group();can.name='Rounded watering can';add(new THREE.SphereGeometry(1,12,10).scale(0.23,0.22,0.18),m.blue,0,0,0,can);add(new THREE.CapsuleGeometry(0.045,0.36,3,8).rotateZ(-0.8),m.blue,0.27,0.08,0,can);add(new THREE.TorusGeometry(0.18,0.03,5,18),m.blue,-0.19,0.03,0,can);root.add(can);
 const drops=Array.from({length:9},()=>add(new THREE.SphereGeometry(0.024,6,6),m.blue,0,0,0));
 const pickedCarrot=new THREE.Group();pickedCarrot.name='Freshly picked carrot';root.add(pickedCarrot);add(new THREE.CapsuleGeometry(0.07,0.18,4,8),m.orange,0,0,0,pickedCarrot);for(const x of [-0.05,0,0.05])add(new THREE.CapsuleGeometry(0.018,0.14,3,6),m.green,x,0.2,0,pickedCarrot);
 const seeds=Array.from({length:8},()=>add(new THREE.SphereGeometry(0.025,6,6),m.cream,0,0,0));
 const insects=Array.from({length:10},(_,i)=>{const g=new THREE.Group();root.add(g);add(new THREE.SphereGeometry(i<4?0.045:0.025,8,6).scale(1,1,1.5),i<4?m.yellow:m.wood,0,0,0,g);const wings=[-1,1].map(side=>{const wing=add(new THREE.SphereGeometry(0.06,8,6).scale(1.7,0.15,1),i<4?m.cream:m.pink,side*0.06,0.02,0,g);return wing;});return {g,wings};});
 const area={root,pad,beds,basket,can,drops,seeds,pickedCarrot,harvest,insects,k:0,phase:0,update(t){const phase=Math.max(0,Math.min(240,t));this.phase=phase;const k=THREE.MathUtils.smoothstep(phase,25,160);this.k=k;beds.forEach(b=>b.update(k,phase>190));harvest.forEach(g=>g.visible=phase>210);insects.forEach(({g,wings},i)=>{g.visible=k>0.3;g.position.set(Math.sin(t*0.12+i)*8,0.8+Math.sin(t*0.3+i)*0.3,Math.cos(t*0.1+i)*7);wings.forEach((wing,j)=>wing.rotation.z=Math.sin(t*(i<4?12:4)+i)*(j?1:-1)*0.6);});}};
 world.garden=area;area.update(0);return area;
}
export function gardenViews(){return [['Planting a little garden',0,80],['Watch the garden grow',80,80],['Watering and harvest',160,80]].map(([name,phase,duration],i)=>({name,phase,gardenPhase:phase,duration,loop:false,group:"Let's grow a garden",clearance:1.5,sample(t,out){const h=terrainHeight(GARDEN.x,GARDEN.z);out.pos.set(GARDEN.x+(i===0?21:8),h+(i===0?17:5),GARDEN.z+(i===0?22:12));out.pos.y=Math.max(out.pos.y,walkHeight(out.pos.x,out.pos.z)+1.8);out.look.set(GARDEN.x,h+0.7,GARDEN.z);}}));}
