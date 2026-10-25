import * as THREE from 'three';
import { coastX, walkHeight } from '../src/world.js';
import { VIDEO_PRESETS } from '../src/presets.js';
import { STYLES } from '../src/styles.js';
export async function runBoatTripTests(){
 const a=window.__app,d=a.director,w=a.world,original=a.projectData(),results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 try{
  a.timeline.stop();d.auto=false;d.paused=true;
  check(d.shots[72].rowing==='lake'&&d.shots[73].rowingPhase===80&&d.shots[74].rowing==='cove','Three boating shots append at 72-74');
  const preset=VIDEO_PRESETS.boatTrip;check(preset.clips.reduce((n,c)=>n+c.seconds,0)===240,'Boat preset is four minutes');
  const seek=(shot,t)=>{d.playShot(shot,{cut:true});d.t=t;a.step(0);};seek(72,20);
  const lake=w.meadowBoat,cove=w.sunsetCove.rowingBoat;check(!!lake&&!!cove,'Both boats register through existing area modules');
  check(lake.riders.every(p=>p.g.visible&&p.model.isSkinnedMesh&&p.model.material.map&&p.lifeJacket.children.length===5),'Both original models wear bright life jackets');
  check(!Object.values(a.life.stars).some(p=>p.g.visible),'Normal stars hide during boating');
  check(lake.ducks.length===3&&lake.fish.length===3,'Small duck and fish populations');
  let wet=true,near=true,smooth=true,ground=true,fish=false,previous;
  const state={pos:new THREE.Vector3(),look:new THREE.Vector3()};
  for(const shot of [72,73,74]){previous=null;for(let t=0;t<=80;t+=0.5){seek(shot,t);const area=shot===74?cove:lake,p=area.boat.position;
   if(shot===74){const distance=coastX(p.z)-p.x;wet&&=distance>3;near&&=distance<8;}else{const water=w.colliders.water.find(q=>q.x===-240);wet&&=((p.x-water.x)/water.rx)**2+((p.z-water.z)/water.rz)**2<0.85;near&&=p.z>-16;}
   if(previous)smooth&&=previous.distanceTo(p)<0.2;previous=p.clone();d.shots[shot].sample(t,state);ground&&=state.pos.y-walkHeight(state.pos.x,state.pos.z)>1.49;fish||=area.fish.some(g=>g.visible);}}
  check(wet&&near,'Both paths remain on calm water near their shores');check(smooth,'Pure-time routes move gently without reversals');check(ground,'Camera routes stay clear of ground');check(fish,'Tiny fish jump during the trip');
  seek(73,35);const snapshot=()=>JSON.stringify([...lake.boat.position.toArray(),lake.boat.rotation.y,...lake.paddles.map(g=>g.rotation.y)]),first=snapshot();seek(74,60);seek(73,35);check(first===snapshot(),'Boat and oars reproduce exact seeks');
  for(const style of Object.keys(STYLES)){a.applyStyle(style);await new Promise(r=>requestAnimationFrame(r));check(lake.riders.every(p=>p.g.visible),style+': original boat riders remain visible');}
  seek(74,30);check(cove.riders.every(p=>p.g.visible)&&lake.riders.every(p=>!p.g.visible),'Only the current boat carries the protagonists');
  for(const shot of [54,56,37])seek(shot,1);check(!a.life.rowHidden&&Object.values(a.life.stars).every(p=>p.g.visible),'Boat to balloon to train to walk restores stars');check([lake,cove].every(g=>g.riders.every(p=>!p.g.visible)),'Boat riders hide outside their scene');check(a.audio.ctx===null,'Boat tests never start sound');
  return {passed:results.length,results};
 }finally{a.loadProject(original);d.playShot(0,{cut:true});a.step(0);}
}
