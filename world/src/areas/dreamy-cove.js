import * as THREE from 'three';
import { WATER_Y } from '../world.js';
import { dreamyGlow } from './dreamy-lake.js';

// A small striped lighthouse on a rock past the Sunset Cove pier, with lanterns floating either side.
export const DREAMY_COVE={x:-402,z:30};
const PIER_VIEW={x:-357,y:3.4,z:30};
export function buildDreamyCove(world){
 const root=new THREE.Group();root.name='Dreamy cove lighthouse';world.root.add(root);
 const spots=[[-372,24],[-378,20],[-385,23.5],[-391,19.5],[-397,23],[-405,22.5],[-373,36],[-392,36],[-406,37]];
 const glow=dreamyGlow(world,root,{waterY:WATER_Y,spots,flyArea:{x:-385,z:30,rx:16,rz:10}}),halo=glow.halo;
 const mat=(color,g=0)=>new THREE.MeshLambertMaterial({color,emissive:color,emissiveIntensity:g});
 const m={rock:mat('#7f8aa0',0.04),white:mat('#f4efe4',0.06),red:mat('#e06a5a',0.06),door:mat('#6d4230'),window:mat('#ffc56b',0.9),lamp:mat('#ffe2a0',1)};
 const tower=new THREE.Group();tower.position.set(DREAMY_COVE.x,0,DREAMY_COVE.z);root.add(tower);
 const add=(geo,material,y,x=0,z=0)=>{const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;tower.add(o);return o;};
 add(new THREE.DodecahedronGeometry(3.2,1).scale(1,0.55,1),m.rock,-1.3);add(new THREE.CylinderGeometry(2.4,2.6,0.6,20),m.rock,0.6);
 add(new THREE.CylinderGeometry(1,1.4,8,20),m.white,4.9);
 for(const y of [2.9,6.3])add(new THREE.CylinderGeometry(1.22-(y-0.9)*0.05+0.03,1.27-(y-0.9)*0.05+0.03,1.1,20),m.red,y);
 add(new THREE.CylinderGeometry(1.55,1.55,0.2,20),m.red,9);add(new THREE.CylinderGeometry(0.85,0.85,1.2,16),m.lamp,9.7);add(new THREE.ConeGeometry(1.2,1,16),m.red,10.8);
 // The lamp glows softly and never sweeps: a calm light for bedtime videos.
 halo(tower,0,9.7,0,7,'#ffd08a');
 add(new THREE.BoxGeometry(0.12,1.6,0.9),m.door,1.7,1.38);
 for(const [y,a] of [[3.9,0],[5.4,0.9],[7.4,-0.5],[7.4,Math.PI]]){const r=1.32-(y-0.9)*0.05,x=Math.cos(a)*r,z=-Math.sin(a)*r,w=add(new THREE.BoxGeometry(0.1,0.6,0.42),m.window,y,x,z);w.rotation.y=a;halo(tower,x*1.3,y,z*1.3,1.8);}
 const area={root,tower,lanterns:glow.lanterns,flies:glow.flies,waterY:WATER_Y,update(t,camera,cur){
  const night=THREE.MathUtils.clamp(cur.stars,0,1);
  m.window.emissiveIntensity=0.35+night*0.9;m.lamp.emissiveIntensity=0.5+night*0.7*(1+Math.sin(t*0.4)*0.06);glow.update(t,night);
 }};
 area.update(0,null,{stars:0});world.dreamyCove=area;return area;
}
// Fixed view along the pier to the lighthouse, with a barely-there drift.
export function dreamyCoveViews(){return [
 {name:'Dreamy cove from the pier',group:'Dreamy cove',duration:240,loop:true,clearance:1.5,sample(t,out){const a=t/240*Math.PI*2;out.pos.set(PIER_VIEW.x+Math.sin(a*2)*0.1,PIER_VIEW.y+Math.sin(a)*0.05,PIER_VIEW.z+Math.sin(a)*0.3);out.look.set(DREAMY_COVE.x,4.6,DREAMY_COVE.z);}}
];}
