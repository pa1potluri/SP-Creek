import {getStarsEnabled,setStarsEnabled,makeCharacter,CAST} from '../src/characters.js';
export async function runAdventureOne(){
 const a=__app,old=getStarsEnabled(),checks=[];const ok=(v,m)=>{if(!v)throw Error(m);checks.push(m);};
 try{
 setStarsEnabled(false);
 for(const shot of [0,16,37,50,54,56,70,80,98,99]){a.director.playShot(shot,{cut:true});a.step(0);const stars=[];a.world.root.parent.traverse(o=>{if(o.userData.storyStar)stars.push(o);});ok(stars.length>8&&stars.every(o=>o.layers.mask===0),'All sibling appearances hidden at shot '+shot);}
 const p=makeCharacter(CAST.brother);p.g.visible=true;ok(p.g.layers.mask===0,'Choreography cannot bypass switch');setStarsEnabled(true);ok(p.g.visible&&p.g.layers.mask!==0,'Switch restores requested appearance');p.g.visible=false;ok(!p.g.visible,'Opt-in preserves scene-specific hiding');
 const neighbour=makeCharacter(CAST.cowboy);setStarsEnabled(false);ok(neighbour.g.visible,'Ordinary residents and player unaffected');ok(!a.audio.ctx,'No automatic audio');
 return {passed:checks.length,results:checks};
 }finally{setStarsEnabled(old);a.director.playShot(0,{cut:true});a.step(0);}
}

