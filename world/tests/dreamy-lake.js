import { LAKE } from '../src/areas/meadow-lake.js';
import { PRESETS } from '../src/atmosphere.js';
import { VIDEO_PRESETS } from '../src/presets.js';
import { terrainHeight, coastX } from '../src/world.js';
export function runDreamyLakeTests(){
 const a=window.__app,d=a.dreamyLake,results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 const inLake=(x,z,r)=>Math.hypot((x-LAKE.x)/LAKE.rx,(z-LAKE.z)/LAKE.rz)<r;
 check(d&&d.house&&d.lanterns.length===9&&d.lilies.length>=12,'Cottage, nine lanterns and lily pads are built');
 check(!inLake(d.house.position.x,d.house.position.z,1.4),'Cottage stands on the shore, clear of the water');
 const pose=t=>{d.update(t,a.camera,{stars:1});return JSON.stringify(d.lanterns.map(l=>l.g.position.toArray()));};
 const at40=pose(40);pose(900);check(pose(40)===at40,'World-time seeks restore lantern positions');
 for(const t of [0,600,1800,2700]){pose(t);check(d.lanterns.every(l=>inLake(l.g.position.x,l.g.position.z,0.92)&&Math.abs(l.g.position.y-d.waterY)<0.1),`Lanterns float inside the lake at ${t}s`);}
 check(d.flies.material.opacity>0.5,'Fireflies glow at night');d.update(0,a.camera,{stars:0});check(d.flies.material.opacity===0,'Fireflies rest in daytime');
 check(PRESETS.dreamyNight&&PRESETS.dreamyNight.stars===1&&PRESETS.dreamyNight.fireflies>0,'Dreamy blue night mood exists with stars and fireflies');
 const shot=a.director.shots[98];check(shot?.name==='Dreamy lake from the dock'&&a.director.shots[97].name==='Forest clearing stream','Dreamy lake shot appends as shot 98');
 const out={pos:new (a.camera.position.constructor)(),look:new (a.camera.position.constructor)()};let low=Infinity,move=0,first=null;
 for(let i=0;i<=120;i++){shot.sample(i/120*shot.duration,out);low=Math.min(low,out.pos.y-terrainHeight(out.pos.x,out.pos.z));if(!first)first=out.pos.clone();move=Math.max(move,out.pos.distanceTo(first));}
 check(low>1.5&&move<1,'Camera stays above the dock and barely drifts');
 const p=VIDEO_PRESETS.dreamyLake,secs=p.clips.reduce((n,c)=>n+c.seconds,0);check(p.clips.every(c=>c.shot===98&&c.mood==='dreamyNight')&&secs>=1800&&secs<=3600,'Dreamy lake preset is a 30-60 minute calm loop');
 check(Object.keys(VIDEO_PRESETS).slice(-2).join()==='dreamyLake,dreamyCove','Both dreamy presets append at the end');
 const c=a.dreamyCove;check(c&&c.tower&&c.lanterns.length===9,'Cove lighthouse and nine lanterns are built');
 for(const t of [0,900,2700]){c.update(t,a.camera,{stars:1});check(c.lanterns.every(l=>l.g.position.x<coastX(l.g.position.z)-3&&Math.abs(l.g.position.z-30)>3)&&c.lanterns.every(l=>Math.abs(l.g.position.y-c.waterY)<0.1),`Cove lanterns float on the sea, clear of the pier, at ${t}s`);}
 const cove=a.director.shots[99];check(cove?.name==='Dreamy cove from the pier','Dreamy cove shot appends as shot 99');
 cove.sample(0,out);const start=out.pos.clone();cove.sample(120,out);check(out.pos.distanceTo(start)<1&&out.pos.y>2.5,'Cove camera stays on the pier and barely drifts');
 check(VIDEO_PRESETS.dreamyCove.clips.every(c=>c.shot===99&&c.mood==='dreamyNight'),'Dreamy cove preset uses shot 99 in the dreamy night');
 check(a.audio.ctx===null,'Dreamy lake check never starts sound');
 return {passed:results.length,results};
}
