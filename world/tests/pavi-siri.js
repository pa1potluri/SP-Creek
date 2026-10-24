import * as THREE from 'three';
import { CAST, randomTownsfolk, makeCharacter, animatePerson, gesture } from '../src/characters.js';
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
    for(const role of ['pavi','siri']){
      const p=life.stars[role],m=p.model,geo=m.geometry,index=geo.attributes.skinIndex,weight=geo.attributes.skinWeight;
      check(m.isSkinnedMesh&&m.castShadow&&m.receiveShadow,role+': original textured skin casts and receives shadows');
      check(m.skeleton.bones.length===18&&['hips','spine','chest','neck','head','armR','armL','elbowR','elbowL','legR','legL','kneeR','kneeL'].every(name=>m.skeleton.getBoneByName(name)),role+': independent complete skeleton');
      let valid=true,blended=0;for(let i=0;i<weight.count;i++){let sum=0,n=0;for(let k=0;k<4;k++){const w=weight.array[i*4+k],b=index.array[i*4+k];if(!Number.isFinite(w)||w<0||b>=18)valid=false;sum+=w;if(w>0.001)n++;}if(Math.abs(sum-1)>1e-5)valid=false;if(n>1)blended++;}check(valid&&blended>20,role+': normalized smooth skin weights with at most four influences');
      let feetSafe=true;for(let i=0;i<weight.count;i++)if(geo.attributes.position.getY(i)<0.1)for(let k=0;k<4;k++)if(weight.array[i*4+k]>0&&[5,6,7,8].includes(index.array[i*4+k]))feetSafe=false;check(feetSafe,role+': feet never receive arm weights');
      m.skeleton.pose();p.g.updateMatrixWorld(true);m.skeleton.update();let error=0;const v=new THREE.Vector3(),base=new THREE.Vector3();for(let i=0;i<geo.attributes.position.count;i+=113){base.fromBufferAttribute(geo.attributes.position,i);v.copy(base);m.applyBoneTransform(i,v);error=Math.max(error,v.distanceTo(base));}check(error<1e-5,role+': bind pose preserves supplied mesh positions');
      const duplicate=makeCharacter(CAST[role]);check(duplicate.model.geometry===geo&&duplicate.model.material.map===m.material.map&&duplicate.model.skeleton!==m.skeleton,role+': geometry and original texture reused with separate skeleton');duplicate.model.skeleton.dispose();
      const textures=m.material.map;for(const style of Object.keys(STYLES)){a.applyStyle(style);await new Promise(r=>requestAnimationFrame(r));check(m.material.map===textures,role+': '+style+' preserves original colour texture');}
      animatePerson(p,1,0.7);gesture(p,'wave',0.5,1);p.g.updateMatrixWorld(true);m.skeleton.update();const sample=new THREE.Vector3().fromBufferAttribute(geo.attributes.position,Math.floor(weight.count/3));m.applyBoneTransform(Math.floor(weight.count/3),sample);check(sample.toArray().every(Number.isFinite),role+': walk and wave yield finite skinned positions');
    }
    check(w.sunsetCove.siblings.pavi.model.isSkinnedMesh&&w.sunsetCove.siblings.siri.model.isSkinnedMesh&&w.playground.kids[0].model.isSkinnedMesh&&a.meadowLake.festival.crowd[1].model.isSkinnedMesh,'Original models replace every staged sibling appearance');
    check(life.stars.siri.g.getObjectByName('Thick side braid')!=null,'Siri has side braid');
    check(life.stars.siri.model.material.map?.isTexture&&life.stars.siri.skirt.isBone,'Siri retains her original textured skirt');
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
