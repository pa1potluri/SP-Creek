import * as THREE from 'three';
import { sampleBalloonRide } from '../src/areas/crystal-mine.js';
import { walkHeight } from '../src/world.js';
import { VIDEO_PRESETS } from '../src/presets.js';
export function runBalloonRideTests(){
 const a=window.__app,d=a.director,m=a.crystalMine,original=a.projectData(),loop=a.timeline.loop,results=[];
 const check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 try{
  a.timeline.stop();d.auto=false;
  check(['Lift off','Over the valley','Coming home'].every((n,i)=>d.shots[53+i].name===n),'Three balloon shots append after moment shot 52');
  const home=sampleBalloonRide(0);check(home.distanceTo(sampleBalloonRide(240))<1e-9&&Math.abs(home.y-m.top.y-0.2)<1e-8,'Ride starts and lands on hilltop');
  check(home.distanceTo(sampleBalloonRide(0.1))<0.001&&home.distanceTo(sampleBalloonRide(239.9))<0.001,'Lift and landing have soft zero-speed endpoints');
  let finite=true,clear=true,speed=0,prior=home;for(let t=0.1;t<=240;t+=0.1){const p=sampleBalloonRide(t);finite&&=p.toArray().every(Number.isFinite);clear&&=p.y>=walkHeight(p.x,p.z)+0.19;speed=Math.max(speed,p.distanceTo(prior)/0.1);prior=p;}check(finite&&clear,'Full route keeps basket above ground');check(speed<20,'Flight has bounded speed without teleporting');
  const out=()=>({pos:new THREE.Vector3(),look:new THREE.Vector3()});for(const [left,right]of [[53,54],[54,55]]){const p=out(),q=out();d.shots[left].sample(d.shots[left].duration,p);d.shots[right].sample(0,q);check(p.pos.distanceTo(q.pos)<1e-8&&p.look.distanceTo(q.look)<1e-8,'Adjacent shots '+left+'/'+right+' have continuous camera poses');}
  for(const index of [53,54,55]){d.playShot(index,{cut:true});d.t=d.shots[index].duration/2;m.update(12,a.atmos.cur);a.life.updateBalloonRiders(12);check(m.balloon.position.distanceTo(sampleBalloonRide(d.shots[index].balloonPhase+d.t))<1e-8,'Shot '+index+' synchronizes balloon and camera clock');check(a.life.balloonRiders.every(p=>p.g.visible&&p.model.isSkinnedMesh&&p.g.parent===m.balloon&&Math.abs(p.g.position.x)<0.5),'Shot '+index+' keeps original characters inside rim');check(m.ropes.every(r=>!r.line.visible),'Shot '+index+' releases ground tethers');}
  d.playShot(0,{cut:true});m.update(12,a.atmos.cur);a.life.updateBalloonRiders(12);check(a.life.balloonRiders.every(p=>!p.g.visible)&&a.life.stars.pavi.g.visible&&m.ropes.every(r=>r.line.visible),'Leaving ride hides riders and restores normal stars and tethers');
  check(VIDEO_PRESETS.balloonRide.clips.reduce((n,c)=>n+c.seconds,0)===240,'Balloon preset lasts four minutes');const button=[...document.querySelectorAll('#videoPresets button')].find(b=>b.textContent.includes(VIDEO_PRESETS.balloonRide.label));button.click();a.timeline.loop=false;d.locked=true;let last=sampleBalloonRide(0),jump=0;for(let i=0;i<2400;i++){a.timeline.update(0.1);d.update(0.1);m.update(i*0.1,a.atmos.cur);a.life.updateBalloonRiders(i*0.1);jump=Math.max(jump,last.distanceTo(m.balloon.position));last=m.balloon.position.clone();}d.locked=false;check(jump<2&&m.balloon.position.distanceTo(home)<0.01,'Complete preset playback returns home without camera-stage teleporting');check(a.audio.ctx===null,'Ride tests never unlock sound');return {passed:results.length,maxSpeed:speed,results};
 }finally{a.timeline.stop();a.timeline.loop=loop;document.querySelector('#tlLoop').checked=loop;d.locked=false;a.loadProject(original);d.playShot(0,{cut:true});a.step(0);}
}
