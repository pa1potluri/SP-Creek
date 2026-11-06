import * as THREE from 'three';
import { sampleBalloonRide } from '../src/areas/crystal-mine.js';

export async function runRelease4Tests(){
 const a=window.__app,g=a.game,ride=a.world.balloonRide,results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 const original={active:g.active,balloon:g.balloon,pos:g.pos.clone()};
 try{
  check(ride?.viewStar?.parent,'A valley collectible belongs to the balloon route');
  g.active=true;g.horse=null;g.pos.set(202,ride.top.y+.15,-142.5);g._boardBalloon();
  check(!!g.balloon&&g.balloon.game,'Play mode boards the existing gentle balloon');
  a.crystalMine.update(0,a.atmos.cur);const reward=ride.viewStar.position.clone();
  check(ride.viewStar.visible&&reward.distanceTo(sampleBalloonRide(112))>2,'Valley star floats visibly above its scenic route point');
  g._flyBalloon(112);a.crystalMine.update(112,a.atmos.cur);
  check(g.balloon?.valleyStar===true&&!ride.viewStar.visible,'Passing the scenic viewpoint collects the valley star once');
  check(g.prompt.includes('valley star found'),'Play prompt celebrates the calm collectible');
  g._landBalloon();
  check(!g.balloon&&g.pos.distanceTo(new THREE.Vector3(202,ride.top.y+.15,-142.5))<.01,'Ride returns softly to the safe boarding deck');
  check(a.audio.ctx===null,'Balloon checks never start sound');
  return {passed:results.length,results};
 }finally{g.active=original.active;if(g.balloon)g._landBalloon();g.pos.copy(original.pos);}
}
