import * as THREE from 'three';
import { CAST, randomTownsfolk } from '../src/characters.js';
import { sampleStarRoute } from '../src/life.js';
import { VIDEO_PRESETS } from '../src/presets.js';
import { STYLES } from '../src/styles.js';
export async function runPaviSiriTests(){
  const a=window.__app,w=a.world,life=a.life,original=a.projectData(),offset=w.starsOffset||0,results=[];
  const check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  try {
    w.starsOffset=0;
    for(const role of ['pavi','siri']){
      check(randomTownsfolk(role).shirt===CAST[role].shirt&&randomTownsfolk(role).hair===CAST[role].hair,`${role}: reference wardrobe never randomised`);
      const person=life.stars[role];person.g.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(person.g);
      check(box.max.y-box.min.y>1.5&&box.max.y-box.min.y<1.9,`${role}: child proportions`);
      let dry=true;for(let t=0;t<=680;t+=2){const p=sampleStarRoute(t,role,w).pos;if(w.inPond(p.x,p.z,0.65))dry=false;}
      check(dry,`${role}: entire route stays outside deep water`);
      check(sampleStarRoute(100,role,w).pos.distanceTo(sampleStarRoute(780,role,w).pos)<1e-8,`${role}: route repeats exactly`);
    }
    check(life.stars.siri.g.getObjectByName('Thick side braid')!=null,'Siri has side braid');
    check(life.stars.siri.skirt.children.some(m=>m.material.map?.isCanvasTexture),'Siri has patterned skirt');
    const pose=()=>Object.values(life.stars).flatMap(p=>[...p.g.position.toArray(),p.g.rotation.y,...p.arms.flatMap(a=>a.rotation.toArray().slice(0,3))]);
    life.updateStars(48);const first=JSON.stringify(pose());life.updateStars(380);life.updateStars(48);check(JSON.stringify(pose())===first,'Seeking world time reproduces sibling poses');
    check(sampleStarRoute(100,'pavi',w).pos.z>sampleStarRoute(100,'siri',w).pos.z,'Pavi runs ahead and waits');
    for(const on of [false,true]){a.setFamilyMode(on);check(life.stars.pavi.g.visible&&life.stars.siri.g.visible,`Both siblings remain child-safe in family mode ${on}`);}
    for(const style of Object.keys(STYLES)){a.applyStyle(style);await new Promise(resolve=>requestAnimationFrame(resolve));check(life.stars.pavi.g.visible&&life.stars.siri.g.visible,`${style}: siblings render`);}
    check(a.director.shots[37].name==='Pavi & Siri walk'&&a.director.shots[38].name==='Pavi & Siri at the pond','Two shots appended after 36');
    check(VIDEO_PRESETS.paviSiri.clips.reduce((t,c)=>t+c.seconds,0)===680,'Sibling preset covers one full routine');
    check(a.audio.ctx===null,'Audio stays locked');return {passed:results.length,results};
  }finally{w.starsOffset=offset;a.loadProject(original);}
}
