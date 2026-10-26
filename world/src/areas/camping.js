import * as THREE from 'three';
import { terrainHeight } from '../world.js';
import { makeCharacter, CAST, animatePerson, seat } from '../characters.js';
import {makeCanvasTent} from '../props/canvas-tent.js';

export const CAMPING={x:-200,z:58};
export let campingReady=false;
export function buildCamping(world){
 if(world.camping)return world.camping;
 const root=new THREE.Group();root.name='Cosy camping clearing';const y=terrainHeight(CAMPING.x,CAMPING.z);root.position.set(CAMPING.x,y,CAMPING.z);world.root.add(root);
 world.registerAreaPad({...CAMPING,y,hx:16,hz:14,blend:5});world.registerAreaPad({...CAMPING,hx:21,hz:19,blend:1,clearOnly:true});world.updateTerrain();
 const mat=(color,glow=0)=>new THREE.MeshLambertMaterial({color,emissive:color,emissiveIntensity:glow,side:THREE.DoubleSide});
 const m={grass:mat('#9bad7d',0.06),wood:mat('#ad855f',0.06),stone:mat('#c4b6a2',0.1),cream:mat('#f4e0bc',0.1),blue:mat('#a8c9d2',0.12),pink:mat('#dcb5b7',0.12),amber:mat('#f6d99c',0.55),brown:mat('#9c7859',0.1),white:mat('#f4ead7',0.1),ink:mat('#45443e')};
 const mesh=(parent,geo,material,x=0,py=0,z=0)=>{const o=new THREE.Mesh(geo,material);o.position.set(x,py,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 const sphere=(parent,r,material,x,py,z,s=[1,1,1])=>{const o=mesh(parent,new THREE.SphereGeometry(r,16,10),material,x,py,z);o.scale.set(...s);return o;};
 const lightCanvas=document.createElement('canvas');lightCanvas.width=lightCanvas.height=64;const lc=lightCanvas.getContext('2d'),fade=lc.createRadialGradient(32,32,0,32,32,32);fade.addColorStop(0,'rgba(255,220,160,0.2)');fade.addColorStop(1,'rgba(255,220,160,0)');lc.fillStyle=fade;lc.fillRect(0,0,64,64);const lightMap=new THREE.CanvasTexture(lightCanvas);lightMap.colorSpace=THREE.SRGBColorSpace;const ground=mesh(root,new THREE.PlaneGeometry(28,25),new THREE.MeshBasicMaterial({map:lightMap,transparent:true,depthWrite:false}),0,0.04,0);ground.rotation.x=-Math.PI/2;
 const tents=[];
 for(const [i,x,z]of [[0,-7,-4],[1,7,-4]]){
  const g=makeCanvasTent(i);g.position.set(x,0,z);g.rotation.y=Math.atan2(-x,-z);root.add(g);tents.push({root:g});
  world.colliders.circles.push({x:CAMPING.x+x,z:CAMPING.z+z,r:2.7});
 }
 const fire=new THREE.Group();fire.name='Small guarded campfire';root.add(fire);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;sphere(fire,0.22,m.stone,Math.cos(a)*0.95,0.17,Math.sin(a)*0.95,[1,0.7,1]);}
 for(const a of [-0.5,0.7]){const log=mesh(fire,new THREE.CylinderGeometry(0.12,0.12,1.35,12),m.wood,0,0.16,0);log.rotation.set(0,a,Math.PI/2);}
 const flames=new THREE.Group();fire.add(flames);for(let i=0;i<3;i++)sphere(flames,0.18,new THREE.MeshBasicMaterial({color:i?'#f2b76f':'#ffe3a6'}),(i-1)*0.18,0.4,0,[0.8,1.6-i*0.2,0.8]);
 world.colliders.circles.push({x:CAMPING.x,z:CAMPING.z,r:1.65});
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:world.haloMat.map,color:'#efbf7e',transparent:true,opacity:0.25,depthWrite:false,blending:THREE.AdditiveBlending}));halo.position.set(0,0.5,0);halo.scale.set(5.5,3.3,1);root.add(halo);
 const log=mesh(root,new THREE.CylinderGeometry(0.24,0.24,3,16),m.wood,0,0.27,3.6);log.rotation.z=Math.PI/2;
 const siblings=['pavi','siri'].map((role,i)=>{const p=makeCharacter(CAST[role]);root.add(p.g);p.g.position.set(i?0.48:-0.48,0.51-(i?0.56:0.43)*1.42,3.6);p.g.rotation.y=Math.PI;return p;});
 const blanket=mesh(root,new THREE.PlaneGeometry(2,1.1,8,4),m.blue,0,0.58,3.18);blanket.rotation.x=-Math.PI/2;
 const grownups=[CAST.neighbour,CAST.cafeHost].map((outfit,i)=>{const p=makeCharacter(outfit);root.add(p.g);p.g.position.set(i?2.8:-2.8,0.05,1.6);p.g.rotation.y=i?-2:2;return p;});
 const perch=mesh(root,new THREE.CylinderGeometry(0.17,0.24,2.5,12),m.wood,8,1.25,1);const owl=new THREE.Group();owl.position.set(8,2.65,1);root.add(owl);sphere(owl,0.35,m.brown,0,0.22,0,[0.85,1,0.8]);const head=new THREE.Group();owl.add(head);sphere(head,0.28,m.brown,0,0.65,0);for(const x of [-0.12,0.12]){sphere(head,0.11,m.white,x,0.68,0.22,[1,1,0.4]);sphere(head,0.045,m.ink,x,0.68,0.265,[1,1,0.4]);}sphere(head,0.055,m.amber,0,0.57,0.27,[0.8,0.65,0.65]);for(const x of [-0.3,0.3])sphere(owl,0.18,m.brown,x,0.23,0,[0.5,1,0.65]);
 const flies=new THREE.InstancedMesh(new THREE.SphereGeometry(0.025,6,4),new THREE.MeshBasicMaterial({color:'#ffe6a1',transparent:true,opacity:0.7}),48);flies.frustumCulled=false;root.add(flies);const matrix=new THREE.Matrix4();
 const starGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),star=new THREE.Line(starGeo,new THREE.LineBasicMaterial({color:'#fff0d3',transparent:true,opacity:0}));star.frustumCulled=false;root.add(star);
 const path=world._ribbon([[-144,90],[-174,90],[-185,80],[CAMPING.x,73]],2,world._pathMaterial(),{lift:0.07});
 const area={root,tents,fire,flames,halo,siblings,grownups,owl,flies,star,y,update(t,camera,cur){
  const night=THREE.MathUtils.clamp(cur.stars,0,1);m.amber.emissiveIntensity=0.35+night*0.35;flames.scale.y=1+Math.sin(t*1.4)*0.025;halo.material.opacity=0.17+night*0.12;
  siblings.forEach((p,i)=>{animatePerson(p,t*0.4+i,0);seat(p,false,1);p.headPitch=-0.18+Math.sin(t*0.13+i)*0.025;p.headYaw=Math.sin(t*0.11+i)*0.08;});grownups.forEach((p,i)=>{animatePerson(p,t*0.3+i,0);p.headYaw=Math.sin(t*0.1+i)*0.12;});head.rotation.y=Math.sin(t*0.12)*0.15;blanket.rotation.z=Math.sin(t*0.45)*0.008;
  flies.visible=night>0.1;for(let i=0;i<48;i++){const a=i*2.399+t*(0.04+(i%3)*0.01),r=5+(i%9);flies.setMatrixAt(i,matrix.makeTranslation(Math.cos(a)*r,0.7+(i%5)*0.4+Math.sin(t*0.5+i)*0.2,Math.sin(a)*r*0.8));}flies.instanceMatrix.needsUpdate=true;
  const phase=((t%120)+120)%120,u=(phase-30)/2;star.material.opacity=u>=0&&u<=1?Math.sin(u*Math.PI)*night*0.45:0;const p=starGeo.attributes.position;for(let i=0;i<2;i++)p.setXYZ(i,-55+u*85-i*4,49-u*8+i*0.4,-150+u*6);p.needsUpdate=true;
 }};world.camping=area;campingReady=true;area.update(0,null,{stars:0});return area;
}
export function campingViews(){return [
 {name:'Cosy camping clearing',group:'Camping night',duration:120,loop:true,clearance:1.5,sample(t,out){const a=t/120*Math.PI*2,x=CAMPING.x+13+Math.sin(a)*0.8,z=CAMPING.z+16;out.pos.set(x,Math.max(terrainHeight(CAMPING.x,CAMPING.z)+4.5,terrainHeight(x,z)+1.8),z);out.look.set(CAMPING.x,terrainHeight(CAMPING.x,CAMPING.z)+1,CAMPING.z);}},
 {name:'Stars above camp',group:'Camping night',duration:120,loop:true,clearance:1.5,sample(t,out){out.pos.set(CAMPING.x-4,terrainHeight(CAMPING.x,CAMPING.z)+5,CAMPING.z+24);out.look.set(CAMPING.x,terrainHeight(CAMPING.x,CAMPING.z)+7,CAMPING.z-18);}}
];}
