import { VIDEO_PRESETS } from '../src/presets.js';
import { STYLES } from '../src/styles.js';
export async function runKitePicnicTests(){
 const a=window.__app,original=a.projectData(),results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 const stage=(shot,t)=>{a.director.playShot(shot,{cut:true});a.director.paused=true;a.director.t=t;a.step(0);};
 const snapshot=()=>JSON.stringify({stars:Object.values(a.life.stars).map(p=>[p.g.position.toArray(),p.arms.map(g=>g.quaternion.toArray())]),kites:a.world.meadowOuting.kites.map(k=>k.g.position.toArray()),ducks:a.world.meadowOuting.ducks.map(g=>g.position.toArray())});
 try{
  a.timeline.stop();a.director.auto=false;a.setSeason('summer');a.applyStyle('film');
  for(const key of ['kiteDay','waterfallPicnic'])check(VIDEO_PRESETS[key].clips.reduce((n,c)=>n+c.seconds,0)===240,key+': four-minute preset');
  check(a.world.meadowOuting.kites.length===5,'Five rounded festival kites');
  check(a.world.meadowOuting.fruit.length===9&&a.world.meadowOuting.ducks.length===3,'Fruit and three picnic ducks');
  for(const shot of [86,87,88,89,90,91]){
   stage(shot,25);const before=snapshot();stage(shot,50);stage(shot,25);check(snapshot()===before,shot+': poses and props reproduce after seeking');
   check(a.camera.position.toArray().every(Number.isFinite),shot+': finite camera');
   check(Object.values(a.life.stars).every(p=>!a.world.inPond(p.g.position.x,p.g.position.z,.8)),shot+': stars remain on dry ground');
  }
  stage(89,30);a.world.meadowOuting.root.updateMatrixWorld(true);
  const T=await import('three');check(a.world.meadowOuting.ducks.every(g=>{const p=g.getWorldPosition(new T.Vector3());return !a.world.inPond(p.x,p.z,.5);}),'Picnic ducks stay on the dry grass');
  check(a.life.outingFriends.every(p=>p.g.visible),'Three friendly neighbours join the outing');
  for(const style of Object.keys(STYLES)){a.applyStyle(style);stage(86,30);check(a.world.meadowOuting.root.visible,style+': outing renders');}
  stage(0,0);check(!a.world.meadowOuting.root.visible&&a.life.outingFriends.every(p=>!p.g.visible),'Props and extra neighbours release outside outing shots');
  check(a.audio.ctx===null,'Outing checks never start sound');
  return {passed:results.length,results};
 }finally{a.loadProject(original);}
}
