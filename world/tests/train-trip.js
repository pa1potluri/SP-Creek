import * as THREE from 'three';
import { sampleTrainTrip } from '../src/life.js';
import { sampleTrainTrack, TRAIN_HALTS, TRAIN_SPUR_LENGTH, terrainHeight } from '../src/world.js';
import { VIDEO_PRESETS } from '../src/presets.js';
export function runTrainTripTests(){
 const a=window.__app,d=a.director,w=a.world,original=a.projectData(),loop=a.timeline.loop,results=[];
 const check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 try{
  a.timeline.stop();a.life.settings.train=1;a.life.apply();const train=a.life.train;for(const on of [false,true]){w.setHamlet(on);train.updateTrip(110);const f=sampleTrainTrack(TRAIN_HALTS[0].distance);check(terrainHeight(f.pos.x,f.pos.z)<f.pos.y+0.05,'Rail grade survives Hamlet toggle '+on);}d.playShot(0,{cut:true});a.step(0);
  check(['All aboard','Window view','Seaside halt'].every((name,i)=>d.shots[56+i].name===name),'Three train shots append after balloon shot 55');
  check(w.trainSpur.halts.length===2&&w.trainSpur.halts.every(h=>h.platform.isMesh),'Both new sheltered halts exist');
  check(sampleTrainTrip(0).distance===0&&sampleTrainTrip(110).distance===TRAIN_HALTS[0].distance&&sampleTrainTrip(240).distance===TRAIN_SPUR_LENGTH,'Train pauses at station, Willow Creek and seaside');
  let finite=true,dry=true,step=0,last=sampleTrainTrip(0).pos,maxBurial=-Infinity;for(let t=0;t<=240;t+=0.5){const f=sampleTrainTrip(t);finite&&=f.pos.toArray().every(Number.isFinite);dry&&=!w.inPond(f.pos.x,f.pos.z,2);step=Math.max(step,last.distanceTo(f.pos));last=f.pos;for(const off of [11.4,21.4,31.4]){const p=sampleTrainTrack(f.distance-off);for(const end of [-4.4,4.4]){const x=p.pos.x+Math.sin(p.yaw)*end,z=p.pos.z+Math.cos(p.yaw)*end;maxBurial=Math.max(maxBurial,terrainHeight(x,z)-(p.pos.y+1.05));}}}check(finite&&dry,'Complete trip is finite and stays outside the pond');check(step<5,'Route progresses gently with bounded motion');check(maxBurial<0.05,'Coach floors stay above the graded track ground: '+maxBurial);
  const seek=t=>{const index=t<30?56:t<180?57:58;d.playShot(index,{cut:true});d.t=t-d.shot.trainPhase;a.step(0);};
  for(const t of [0,15,28,80,110,160,220]){seek(t);check(train.friends.every(p=>p.g.visible&&p.model.isSkinnedMesh),'Both original models present at trip time '+t);check(train.cars[2].boardingSteps.visible===(t<25)&&train.cars[2].doors[0].visible===(t>=25),'Steps and lower doors safe at trip time '+t);}
  seek(80);const p=train.friends[0].g.position.clone();seek(220);seek(80);check(p.distanceTo(train.friends[0].g.position)<1e-8,'Seeking returns to identical passenger poses and position');
  d.playShot(0,{cut:true});a.step(0);check(train.friends.every(p=>!p.g.visible)&&a.life.stars.pavi.g.visible,'Leaving trip restores normal stars and hides passengers '+JSON.stringify({friends:train.friends.map(p=>p.g.visible),pavi:a.life.stars.pavi.g.visible,active:w.trainTripActive,hidden:a.life.trainHidden&&[...a.life.trainHidden].map(([p,v])=>[p.outfit.star,v]),shot:d.index,train:!!a.life.train}));
  check(Object.values(w.sunsetCove.siblings).every(p=>p.g.visible),'Leaving trip restores Cove siblings too');
  check(VIDEO_PRESETS.trainTrip.clips.reduce((n,c)=>n+c.seconds,0)===240,'Train preset lasts four minutes');const button=[...document.querySelectorAll('#videoPresets button')].find(b=>b.textContent.includes(VIDEO_PRESETS.trainTrip.label));button.click();a.timeline.loop=false;d.locked=true;for(let i=0;i<479;i++){a.timeline.update(0.5);d.update(0.5);a.life.train.update(0.5);}d.locked=false;check(a.life.train.cars[2].g.position.distanceTo(sampleTrainTrack(TRAIN_SPUR_LENGTH-11.4).pos)<1e-8,'Last rendered preset frame is parked at the seaside halt');check(a.audio.ctx===null,'Train checks never start sound');
  console.log('Train route:',JSON.stringify({length:TRAIN_SPUR_LENGTH,maxHalfSecondStep:step,maxBurial}));return {passed:results.length,length:TRAIN_SPUR_LENGTH,maxBurial,results};
 }finally{a.timeline.stop();a.timeline.loop=loop;document.querySelector("#tlLoop").checked=loop;d.locked=false;a.loadProject(original);d.playShot(0,{cut:true});a.step(0);}
}
