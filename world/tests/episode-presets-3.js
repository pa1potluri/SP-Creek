import { VIDEO_PRESETS } from '../src/presets.js';
export async function runEpisodePresets3Tests(){
 const a=window.__app,original=a.projectData(),results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 try{
  a.timeline.stop();a.director.auto=false;
  for(const [key,wide]of [['episode10Snow',92],['episode11Kites',93],['episode12Picnic',94],['episode13CoveNight',95]]){
   const p=VIDEO_PRESETS[key];check(p.clips.reduce((n,c)=>n+c.seconds,0)===180,key+': exactly three minutes');
   check(p.clips[0].shot===wide&&p.clips.at(-1).shot===wide&&p.clips.at(-1).seconds>=30,key+': wide opening and held ending');
   check(p.style==='film'&&p.clips.every(c=>c.natural&&Number.isInteger(c.shot)&&a.director.shots[c.shot]),key+': existing natural timing and valid appended shots');
   a.setSeason(p.season);a.applyStyle(p.style);
   for(const c of p.clips){a.atmos.setPreset(c.mood,true);a.director.playShot(c.shot,{cut:true});a.director.paused=true;a.director.t=Math.min(c.seconds*.5,a.director.shot.duration);a.step(0);check(a.camera.position.toArray().every(Number.isFinite),key+'/'+c.shot+': midpoint renders');}
  }
  check(VIDEO_PRESETS.episode10Snow.season==='winter','Snow episode retains winter');
  check(VIDEO_PRESETS.episode13CoveNight.clips.every(c=>c.mood==='night'),'Cove episode stays under the stars');
  check(a.audio.ctx===null,'Episode checks never start sound');
  return {passed:results.length,results};
 }finally{a.director.playShot(0,{cut:true});a.loadProject(original);a.step(0);}
}
