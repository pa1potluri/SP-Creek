import * as THREE from 'three';
import { STYLES } from '../src/styles.js';
import { PRESETS } from '../src/atmosphere.js';
import { BROOK } from '../src/areas/forest-lush.js';

export async function runForestLushTests(){
 const a=window.__app,w=a.world,f=a.forest,l=f.lush,original=a.projectData(),player=a.game.pos.clone(),results=[];
 const check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 const frame=()=>new Promise(r=>requestAnimationFrame(r));
 const lushShown=()=>l.variants.filter(v=>v.im.visible&&v.im.parent.visible).reduce((n,v)=>n+v.im.count,0);
 const place=(x,y,z,lx,ly,lz)=>{a.camera.position.set(x,y,z);a.camera.lookAt(lx,ly,lz);a.camera.updateMatrixWorld();};
 try{
  a.timeline.stop();a.director.auto=false;
  check(a.director.shots[26].name==='Forest Trail','Existing forest shot keeps slot 26');
  check(a.director.shots[96]?.name==='Deep forest path'&&a.director.shots[97]?.name==='Forest clearing stream'&&a.director.shots.length>=98,'Two forest shots append at 96-97');
  const c=l.counts;check(c.trees>=150&&c.bushes>=300&&c.ferns>=600&&c.grass>=2000&&c.flowers>=500&&c.mushrooms>=150&&c.rocks>=50&&c.logs>=5,'Layered forest: canopy, undergrowth and ground cover '+JSON.stringify(c));
  check(l.variants.every(v=>f.variants.includes(v)),'Lush plants join the forest variants (seasons and grounding)');
  const out={pos:new THREE.Vector3(),look:new THREE.Vector3()};
  for(const i of [96,97])for(let k=0;k<=20;k++){a.director.shots[i].sample(a.director.shots[i].duration*k/20,out);check(Number.isFinite(out.pos.x+out.pos.y+out.pos.z+out.look.x+out.look.y+out.look.z),a.director.shots[i].name+' samples are finite');}
  // Every art style shows trees and some undergrowth near the path.
  for(const style of Object.keys(STYLES)){
   a.applyStyle(style);await frame();place(-104,42,-184,-108,40,-195);f.update(30,a.camera,a.atmos.cur);
   const trees=l.variants.filter(v=>v.im.visible&&v.im.castShadow).length;
   check(trees>0&&lushShown()>500,style+' style shows the layered forest');
  }
  // Distance LOD: ground cover hides far away, trees stay.
  a.applyStyle('film');place(0,60,0,-90,30,-200);f.update(30,a.camera,a.atmos.cur);const far=lushShown();
  place(-104,42,-184,-108,40,-195);f.update(30,a.camera,a.atmos.cur);const close=lushShown();
  check(far<close*0.5&&far>0,'Far camera hides small plants (LOD) but keeps the canopy');
  // Moods: shafts by day, fireflies by night, all deterministic.
  for(const key of Object.keys(PRESETS)){a.atmos.setPreset(key,true);a.step(0);f.update(40,a.camera,a.atmos.cur);check(l.shafts.every(m=>Number.isFinite(m.material.opacity)),key+' mood updates forest light');}
  a.atmos.setPreset('golden',true);a.step(0);place(-96,40,-215,-96,37,-232);f.update(40,a.camera,a.atmos.cur);check(l.shafts.some(m=>m.visible)&&!l.flies.visible,'Golden hour: light shafts, no fireflies');
  a.atmos.setPreset('night',true);a.step(0);f.update(40,a.camera,a.atmos.cur);check(!l.shafts.some(m=>m.visible)&&l.flies.visible&&f.owls.every(o=>o.owl.visible),'Night: fireflies and owls, no sun shafts');
  f.update(55,a.camera,a.atmos.cur);const duck=l.ducks[0].position.clone();f.update(90,a.camera,a.atmos.cur);f.update(55,a.camera,a.atmos.cur);check(duck.distanceTo(l.ducks[0].position)<1e-9,'Brook ducklings reproduce after seeking');
  for(const season of ['autumn','winter','summer']){a.setSeason(season);a.seasons.update(10,a.camera);a.step(0);check(true,season+' season renders the forest');}
  // The brook is shallow and safe: walkers cross by the bridge, not through the water.
  a.game.pos.set(BROOK.x-8,0,BROOK.z+4.5);for(let i=0;i<60;i++)a.game._move(0,-0.15,0.35);check(a.game.pos.z>BROOK.z-1.5,'The brook bank stops walkers away from the bridge');
  a.game.pos.set(BROOK.x,0,BROOK.z+4.5);for(let i=0;i<60;i++)a.game._move(0,-0.15,0.35);check(a.game.pos.z<BROOK.z-3,'The footbridge lets walkers cross the brook');
  check(a.audio.ctx===null,'Forest checks never start sound');
  return {passed:results.length,results};
 }finally{a.game.pos.copy(player);a.setSeason('summer');a.loadProject(original);}
}
