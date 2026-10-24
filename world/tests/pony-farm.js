import * as THREE from 'three';
import { FARM_PIECES } from '../src/areas/pony-farm.js';
import { VIDEO_PRESETS } from '../src/presets.js';
export function runPonyFarmTests(){
 const a=window.__app,w=a.world,f=w.ponyFarm,original=a.projectData(),results=[];const check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 try{
  check(f&&a.life.ponyFarm===f&&f.root.parent===w.root,'Farm registered through the animal lifecycle');check(f.ponies.length===3&&f.babies.length===11,'Three ponies and eleven small farm animals');for(const kind of ['lamb','calf','piglet','chick','duck'])check(f.babies.some(p=>p.kind===kind),kind+' present');check(f.stars.every(p=>p.model.isSkinnedMesh&&p.model.material.map),'Original textured stars retained');
  const pose=()=>JSON.stringify([...f.ponies.map(p=>[...p.g.position.toArray(),p.neck.rotation.x]),...f.babies.map(p=>[...p.g.position.toArray(),p.head.rotation.y])]);f.update(12,a.camera);const first=pose();f.update(90,a.camera);f.update(12,a.camera);check(first===pose(),'Seeking world time reproduces animal poses');
  let pen=true,pond=true;for(let t=0;t<=240;t+=0.5){f.update(t,a.camera);for(const p of f.ponies)if(p.g.position.x<0.5||p.g.position.x>17.5||p.g.position.z< -10.5||p.g.position.z>8.6)pen=false;for(const p of f.babies)if(p.kind==='duck'){const v=p.g.position;if(((v.x-13)/3)**2+((v.z-15)/2.4)**2>0.8)pond=false;}else if(p.g.position.x< -12.6||p.g.position.x> -1.4||p.g.position.z<2.4||p.g.position.z>9.6)pen=false;}
  check(pen,'All walking animals stay inside their fenced fields');check(pond,'Ducks stay within the pond');check(w.colliders.circles.some(p=>p.x===-167&&p.z===-65&&p.r>=3.3),'Pond has an approach barrier');check(f.stars.every(p=>{const v=p.g.getWorldPosition(new THREE.Vector3());return !w.inPond(v.x,v.z,0.5);}), 'Both stars stay on dry land');
  a.loadProject({...original,layout:[]});const before=w.colliders.rects.length;for(const [i,type]of Object.keys(FARM_PIECES).entries()){check(!!document.querySelector(`[data-build="${type}"]`),type+' appears in Build mode');const ghost=w.makeBuilding({type,x:100+i*12,z:85,w:10},true);check(w.colliders.rects.length===before+i,type+' preview adds no physics');w.disposeBuilding(ghost);const e=w.placeBuilding({type,x:100+i*12,z:85,w:10});check(e.additions.rects.length===1,type+' places with a safe compact boundary');}
  const saved=JSON.stringify(w.layout());w.loadLayout(JSON.parse(saved));check(JSON.stringify(w.layout())===saved,'Farm Build pieces round-trip through project layout');
  check(['Little pony farm','Feeding the ponies','Gentle lamb friends'].every((name,i)=>a.director.shots[61+i].name===name),'Three farm views append after reserved camping views');check(VIDEO_PRESETS.ponyFarm.clips.reduce((n,p)=>n+p.seconds,0)===300,'Farm preset lasts five minutes');check(a.audio.ctx===null,'Farm smoke never starts sound');return {passed:results.length,results};
 }finally{a.loadProject(original);}
}
