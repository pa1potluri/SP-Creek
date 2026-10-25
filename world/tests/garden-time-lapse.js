import * as THREE from 'three';
import { GARDEN, GARDEN_PIECES } from '../src/areas/garden.js';
import { VIDEO_PRESETS } from '../src/presets.js';
import { terrainHeight } from '../src/world.js';
import { STYLES } from '../src/styles.js';
export async function runGardenTests(){
 const a=window.__app,w=a.world,d=a.director,g=w.garden,original=a.projectData(),results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 try{
  a.timeline.stop();d.auto=false;d.paused=true;const seek=(shot,t)=>{d.playShot(shot,{cut:true});d.hold=true;d.t=t;a.step(0);};
  check(!!g&&g.beds.length===4,'Garden registers normally with four different beds');check(g.beds.every(b=>{const p=b.root.getWorldPosition(new THREE.Vector3());return Math.abs(p.y-terrainHeight(p.x,p.z))<0.05;}),'All bed floors match final terrain after later areas register');check(!w.inPond(GARDEN.x,GARDEN.z,15),'Garden occupies dry free grass');check(d.shots[75].gardenPhase===0&&d.shots[76].gardenPhase===80&&d.shots[77].gardenPhase===160,'Three views append at 75-77');
  const preset=VIDEO_PRESETS.gardenTimeLapse;check(preset.clips.reduce((n,c)=>n+c.seconds,0)===240,'Garden story is four minutes');
  seek(75,10);check(g.k===0&&g.seeds.every(o=>o.visible),'Children plant visible seeds before sprouts');check(Object.values(a.life.stars).every(p=>p.model.isSkinnedMesh&&p.model.material.map&&p.g.visible),'Garden uses original protagonist models and textures');
  const levels=[];for(const [shot,t]of [[75,40],[76,20],[77,0]]){seek(shot,t);levels.push(g.k);}check(levels[0]>0&&levels[0]<levels[1]&&levels[1]<levels[2]&&levels[2]===1,'Scrubbed growth progresses deterministically from sprouts to full plants');
  check(g.can.visible&&g.drops.every(o=>o.visible),'Watering can and gentle droplets appear after planting');check(g.insects.length===10&&g.insects.every(o=>o.g.visible),'Small bee and butterfly population visits grown flowers');
  seek(77,40);check(g.pickedCarrot.visible&&!g.beds[1].fruits[0].visible,'Picked carrot leaves its bed and appears in hand');seek(77,60);check(!g.pickedCarrot.visible&&g.harvest.every(o=>o.visible),'Harvest reaches the basket');
  const snapshot=()=>JSON.stringify([g.k,...g.beds.flatMap(b=>b.plants.map(p=>p.scale.x)),...g.insects[0].g.position.toArray(),...a.life.stars.pavi.g.position.toArray()]);seek(76,30);const first=snapshot();seek(77,60);seek(76,30);check(snapshot()===first,'Growth insects and character poses reproduce after seeks');
  check(Object.values(a.life.stars).every(p=>!w.inPond(p.g.position.x,p.g.position.z,.5)),'Working positions stay dry and outside water');
  const layout=w.layout();w.loadLayout([]);for(const [i,type]of Object.keys(GARDEN_PIECES).entries()){check(!!document.querySelector(`[data-build="${type}"]`),type+' appears in Build catalogue');const n=w.colliders.rects.length,ghost=w.makeBuilding({type,x:100+i*10,z:85,w:10},true);check(w.colliders.rects.length===n,type+' ghost has no physics');w.disposeBuilding(ghost);const item=w.placeBuilding({type,x:100+i*10,z:85,w:10});check(item.additions.rects.length===1,type+' places with a safe boundary');}const built=JSON.stringify(w.layout());w.loadLayout(JSON.parse(built));check(JSON.stringify(w.layout())===built,'Garden pieces save and reload');w.loadLayout(layout);
  seek(76,40);for(const style of Object.keys(STYLES)){a.applyStyle(style);await new Promise(r=>requestAnimationFrame(r));check(g.root.visible&&g.beds.every(b=>b.plants.every(p=>p.visible)),style+': garden remains grown and visible');}
  for(const shot of [74,54,56,37])seek(shot,1);check(!a.life.gardenHidden&&Object.values(a.life.stars).every(p=>p.g.visible),'Garden to boat to balloon to train to walk restores stars');check(!g.can.visible&&!g.pickedCarrot.visible&&g.drops.every(p=>!p.visible)&&g.seeds.every(p=>!p.visible),'Garden hand props hide outside their story');check(a.audio.ctx===null,'Garden checks never start sound');
  return {passed:results.length,results};
 }finally{a.loadProject(original);d.playShot(0,{cut:true});a.step(0);}
}
