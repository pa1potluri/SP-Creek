import { makeCharacter, CAST, addRainGear, animatePerson } from '../src/characters.js';
import { STYLES } from '../src/styles.js';

export async function runPublicReadyTests(){
  const a=window.__app,original=a.projectData(),results=[];
  const check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  try{
    for(const role of ['pavi','siri']){
      const p=makeCharacter(CAST[role]);
      check(p.outfit.star===role&&p.arms.length===2&&p.feet.length===2,role+': complete animation rig with optional model');
      const gear=addRainGear(p);gear.setVisible(true);animatePerson(p,2,0.5);p.g.updateMatrixWorld(true);
      check(p.g.matrixWorld.elements.every(Number.isFinite)&&gear.boots.every(b=>b.parent),role+': rain gear and animation work');
      gear.setVisible(false);check(gear.boots.every(b=>!b.parent)&&!gear.umbrella.parent,role+': removable props clean up');
    }
    a.timeline.stop();a.director.auto=false;
    for(const style of Object.keys(STYLES)){
      a.applyStyle(style);a.director.playShot(40,{cut:true});a.step(0);
      check(a.camera.position.toArray().every(Number.isFinite),style+': static-file Cove view renders');
    }
    check(a.audio.ctx===null,'Public startup never starts sound');
    return {passed:results.length,privateModels:!!a.life.stars.pavi.model&&!!a.life.stars.siri.model,results};
  }finally{a.loadProject(original);}
}
