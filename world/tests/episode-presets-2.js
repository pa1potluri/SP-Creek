import * as THREE from 'three';
import { VIDEO_PRESETS } from '../src/presets.js';
import { walkHeight } from '../src/world.js';
export function runEpisodePresets2Tests(){
 const a=window.__app,d=a.director,original=a.projectData(),results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 try{
  const episodes=[['episode6Rain',78,79],['episode7Market',69,69],['episode8Boat',72,80],['episode9Garden',75,81]];
  a.timeline.stop();d.auto=false;d.paused=true;
  check(d.shots[65].name==='Welcome to SP Creek: one cove walk'&&d.shots[69].name==='Market day in the square'&&d.shots[77].name==='Watering and harvest','All previous shot numbers remain stable');
  check(d.shots.slice(78,82).map(s=>s.name).join('|')==='Rain over SP Creek|A wide clearing rainbow|Cove boat from above|A garden full of good things','Four establishing views append at 78-81');
  for(const [id,start,end]of episodes){const p=VIDEO_PRESETS[id];check(p.clips.reduce((n,c)=>n+c.seconds,0)===180,id+': three-minute duration');check(p.clips[0].shot===start&&p.clips.at(-1).shot===end,id+': wide opening and ending');check(p.clips.every(c=>c.natural&&c.move==='cut'&&d.shots[c.shot]),id+': valid natural-pace quiet cuts');[...document.querySelectorAll('#videoPresets button')].find(b=>b.textContent.includes(p.label)).click();a.timeline.loop=false;a.step(0);check(a.timeline.playing&&a.timeline.total===180,id+': preset button starts the live timeline');a.timeline.stop();}
  const sample={pos:new THREE.Vector3(),look:new THREE.Vector3()};for(const id of [78,79,80,81]){let safe=true;for(const t of [0,10,20,39.9]){d.shots[id].sample(t,sample);safe&&=sample.pos.toArray().every(Number.isFinite)&&sample.pos.y-walkHeight(sample.pos.x,sample.pos.z)>=1.799;}check(safe,'Wide view '+id+' clears final walk surfaces');}
  d.playShot(81,{cut:true});d.t=30;a.step(0);check(a.world.garden.k===1&&a.world.garden.harvest.every(g=>g.visible),'Garden end card holds the completed harvest');
  check(VIDEO_PRESETS.episode6Rain.weather==='clearing'&&VIDEO_PRESETS.episode7Market.market,'Rain and market episodes retain their scene settings');check(a.audio.ctx===null,'Episode checks never start sound');
  return {passed:results.length,results};
 }finally{a.timeline.stop();a.loadProject(original);d.playShot(0,{cut:true});a.step(0);}
}
