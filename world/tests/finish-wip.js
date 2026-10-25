import * as THREE from 'three';
import { VIDEO_PRESETS } from '../src/presets.js';
export function runFinishWipTests(){
 const a=window.__app,w=a.world,original=a.projectData(),results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 try{
  check(!!w.camping&&w.camping.root.parent===w.root,'Camping exists in normal startup without a test factory');
  const c=w.camping,update=c.update;let calls=0;c.update=function(...args){calls++;return update.apply(this,args);};try{a.step(0.2);check(calls===1,'Normal world step advances camping');}finally{c.update=update;}
  a.timeline.stop();a.director.playShot(57,{cut:true});a.director.t=100;a.director.update(0);a.life.update(0,30,a.camera);const train=a.life.train,pos=train.cars[0].g.getWorldPosition(new THREE.Vector3()),sound=a.listener().train;
  check(sound&&Math.abs(sound.x-pos.x)<1e-8&&Math.abs(sound.z-pos.z)<1e-8,'Train listener follows actual locomotive world position');check(Math.abs(sound.x-70)>20,'Branch train sound leaves the old north-south rail line');
  const play=id=>{const p=VIDEO_PRESETS[id];[...document.querySelectorAll('#videoPresets button')].find(b=>b.textContent.includes(p.label)).click();a.timeline.loop=false;a.director.sway=0;return p;};
  const welcome=play('episode1Welcome');check(welcome.clips.length===1&&a.timeline.total===180,'Welcome uses one uninterrupted three-minute take');
  let previous=null,previousActor=null,maxCameraStep=0,maxActorStep=0,minTownsperson=Infinity,dry=true,behind=true;
  for(let i=0;i<1800;i++){a.timeline.update(i?0.1:0);a.director.update(i?0.1:0);w.sunsetCove.update(30+i*0.1,a.camera,a.atmos.cur);const p=w.sunsetCove.siblings.siri.g,cp=a.camera.position;if(previous)maxCameraStep=Math.max(maxCameraStep,previous.distanceTo(cp));if(previousActor)maxActorStep=Math.max(maxActorStep,previousActor.distanceTo(p.position));previous=cp.clone();previousActor=p.position.clone();if(w.inPond(p.position.x,p.position.z,0.4))dry=false;const forward=new THREE.Vector3(Math.sin(p.rotation.y),0,Math.cos(p.rotation.y));if(cp.clone().sub(p.position).dot(forward)>=0)behind=false;for(const walker of w.sunsetCove.walkers)if(walker.g.visible)minTownsperson=Math.min(minTownsperson,walker.g.position.distanceTo(cp));}
  check(maxCameraStep<1,'Welcome camera has no cut or flight reset over all 1800 frames');check(maxActorStep<0.2,'Welcome siblings never teleport between staging routines');check(dry&&behind,'Welcome remains behind the siblings on dry beach');check(minTownsperson>=6,'Welcome keeps visible townsfolk at least six metres away');
  const camp=play('episode4Camping');check(a.timeline.total===180&&camp.clips[0].shot===59&&camp.clips.at(-1).shot===59,'Episode 4 starts and ends with a wide camp view');check(camp.clips.every(c=>c.natural&&c.mood==='night'),'Episode 4 uses calm natural pacing and night moods');a.step(0.1);check(w.camping.siblings.every(p=>p.model.isSkinnedMesh),'Live camping retains both original models');check(a.audio.ctx===null,'All WIP integration checks leave sound locked');
  return {passed:results.length,maxCameraStep,maxActorStep,minTownsperson,results};
 }finally{a.loadProject(original);}
}
