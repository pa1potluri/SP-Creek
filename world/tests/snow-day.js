import { VIDEO_PRESETS } from '../src/presets.js';
import { STYLES } from '../src/styles.js';
export async function runSnowDayTests(){
 const a=window.__app,original=a.projectData(),results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 const stage=(shot,t)=>{a.director.playShot(shot,{cut:true});a.director.paused=true;a.director.t=t;a.step(0);};
 const snapshot=()=>JSON.stringify(Object.values(a.life.stars).map(p=>[p.g.position.toArray(),p.g.rotation.toArray(),p.arms.map(j=>j.rotation.toArray()),p.legs.map(j=>j.rotation.toArray())]));
 try{
  a.timeline.stop();a.director.auto=false;a.setSeason('winter');a.applyStyle('film');
  const preset=VIDEO_PRESETS.snowDay;check(preset.season==='winter'&&preset.clips.reduce((n,c)=>n+c.seconds,0)===240,'Four-minute winter preset');
  check(preset.clips.map(c=>c.shot).join(',')==='82,83,84,85','Four appended snow-day IDs');
  for(const shot of [82,83,84,85]){
   stage(shot,25);const before=snapshot();stage(shot,45);stage(shot,25);
   check(before===snapshot(),shot+': scene poses reproduce after seeking');
   check(a.camera.position.toArray().every(Number.isFinite),shot+': finite camera');
   check(Object.values(a.life.stars).every(p=>p.g.visible),shot+': original stars visible');
   check(a.world.snowDay.groups[a.director.shot.snowDay].visible,shot+': correct props visible');
  }
  stage(84,10);check(a.life.snowAdults.every(p=>p.g.visible&&p.g.position.distanceTo(a.life.stars.pavi.g.position)<7),'Sled has two nearby grown-ups');
  let safe=true,maxSpeed=0,previous=null;for(let t=0;t<=20;t+=.5){stage(84,t);const p=a.world.snowDay.sled.position;if(Math.abs(p.z)>3.001||p.y<0.3)safe=false;if(previous)maxSpeed=Math.max(maxSpeed,p.distanceTo(previous)/.5);previous=p.clone();}
  check(safe&&maxSpeed<1,'Short gentle sled path below one metre per second');
  for(const style of Object.keys(STYLES)){a.applyStyle(style);stage(82,30);check(a.world.snowDay.root.visible,style+': snow props render');}
  stage(83,10);stage(0,0);check(!a.world.snowDay.root.visible&&!a.world.snowDay.groups.cocoa.visible,'Props hide after leaving snow shots');
  check(Object.values(a.life.stars).every(p=>p.g.rotation.x===0&&p.g.rotation.z===0&&p.legs.every(j=>j.rotation.z===0)),'Snow angel and seated poses release cleanly');
  check(a.life.snowAdults.every(p=>!p.g.visible),'Supervisors hide outside snow scenes');
  check(a.audio.ctx===null,'Snow tests never start sound');
  return {passed:results.length,maxSledSpeed:maxSpeed,results};
 }finally{a.loadProject(original);}
}
