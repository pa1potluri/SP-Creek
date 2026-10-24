import { MOMENTS } from '../src/areas/pavi-siri-moments.js';
import { VIDEO_PRESETS } from '../src/presets.js';
export async function runMomentTests(){
 const a=window.__app,w=a.world,original=a.projectData(),results=[];
 const check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 try{
  a.timeline.stop();a.director.auto=false;
  const keys=Object.keys(MOMENTS),pose=()=>JSON.stringify(Object.values(a.life.stars).map(p=>[...p.g.position.toArray(),p.g.rotation.y,...p.arms.map(arm=>arm.quaternion.toArray())]));
  check(keys.length===7&&a.director.shots.slice(46).length===7,'Seven moments append after original shot 45');
  for(const [i,kind]of keys.entries()){
   check(a.director.shots[46+i].moment===kind,kind+': stable appended shot');a.director.playShot(46+i,{cut:true});a.life.updateMoments(12);const first=pose();a.life.updateMoments(60);a.life.updateMoments(12);
   check(pose()===first,kind+': world-time seeking restores exact poses');
   check(Object.values(a.life.stars).every(p=>p.g.visible&&p.model.isSkinnedMesh&&!w.inPond(p.g.position.x,p.g.position.z,0.5)),kind+': both original models on dry ground');
   check(Object.values(w.sunsetCove.siblings).every(p=>!p.g.visible),kind+': no duplicate Cove stars');
  }
  a.director.playShot(46,{cut:true});a.life.updateMoments(12);check(a.life.stars.siri.skirt.rotation.x<-.8,'Bench drapes skirt over seated legs');
  a.director.playShot(52,{cut:true});a.life.updateMoments(12);check(a.life.stars.siri.skirt.rotation.x===0,'Next scene clears seated skirt pose');
  check(w.momentProps.birds.length===3&&w.momentProps.crumbs.count===16,'Three gentle pond ducks and bounded crumb instances');
  const preset=VIDEO_PRESETS.paviSiriLittleDay;check(preset.clips.reduce((n,c)=>n+c.seconds,0)===300&&preset.clips.every((c,i)=>c.shot===46+i),'Five-minute preset covers all seven moments in order');
  a.director.playShot(0,{cut:true});a.life.updateMoments(12);check(w.activeMoment===null&&!w.momentProps.crumbs.visible,'Leaving moment restores normal scene state');
  check(a.audio.ctx===null,'Moment shots never start sound');return {passed:results.length,results};
 }finally{a.loadProject(original);a.director.playShot(0,{cut:true});a.step(0);}
}
