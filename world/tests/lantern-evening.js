import * as THREE from 'three';
import { STYLES } from '../src/styles.js';
import { VIDEO_PRESETS } from '../src/presets.js';
export async function runLanternEveningTests(){
 const a=window.__app,w=a.world,town=a.townCenter.festival,lake=a.meadowLake.festival,original=a.projectData(),loop=a.timeline.loop,results=[],matrix=new THREE.Matrix4();
 const check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 try{
  a.setFestival(false);a.step(0);check(!town.root.visible&&!lake.root.visible,'Festival off hides town and lake staging');
  const toggle=document.querySelector('#festival');toggle.checked=true;toggle.dispatchEvent(new Event('change'));a.step(0);check(a.atmos.festival&&w.festival&&town.root.visible&&lake.root.visible,'Festival switch enables both areas');check(JSON.parse(localStorage.getItem('dh.festival'))===true,'Festival preference is saved');
  check(town.lanterns.isInstancedMesh&&town.lanterns.count===48&&lake.lanterns.isInstancedMesh&&lake.lanterns.count===36,'Town and lake paper lanterns are instanced');
  check(town.hanging.every(p=>p.y>4.5),'Street lanterns stay above walking and coach height');let lights=0;for(const root of [town.root,lake.root])root.traverse(o=>{if(o.isPointLight)lights++;});check(lights===0,'Festival adds no point lights');
  lake.update(25,a.camera,a.atmos.cur);const first=Array.from(lake.lanterns.instanceMatrix.array),reflected=Array.from(lake.reflections.instanceMatrix.array);lake.update(60,a.camera,a.atmos.cur);lake.update(25,a.camera,a.atmos.cur);check(JSON.stringify(first)===JSON.stringify(Array.from(lake.lanterns.instanceMatrix.array)),'Floating lantern positions reproduce after seeking');check(JSON.stringify(reflected)===JSON.stringify(Array.from(lake.reflections.instanceMatrix.array)),'Reflections reproduce after seeking');
  lake.update(10,a.camera,a.atmos.cur);lake.lanterns.getMatrixAt(0,matrix);const low=matrix.elements[13];lake.update(20,a.camera,a.atmos.cur);lake.lanterns.getMatrixAt(0,matrix);check(Math.abs(matrix.elements[13]-low-2.125)<1e-6,'Paper lights rise gently at a fixed world-time rate');
  check(Array.from(lake.flies.geometry.attributes.position.array).every(Number.isFinite)&&lake.flies.geometry.attributes.position.getY(0)>a.meadowLake.lake.y,'Fireflies follow the elevated lake rather than valley zero');
  check(lake.crowd.length===4&&lake.crowd.every(p=>!w.inPond(p.g.position.x,p.g.position.z,0.6)),'Four friends gather on dry shore');
  const out={pos:new THREE.Vector3(),look:new THREE.Vector3()},center=new THREE.Vector3();for(const index of [24,27]){let safe=true;for(let j=0;j<=100;j++){const t=j/100*a.director.shots[index].duration;a.director.shots[index].sample(t,out);lake.update(t,a.camera,a.atmos.cur);const bodies=index===24?town.lanterns:lake.lanterns;for(let i=0;i<bodies.count;i++){bodies.getMatrixAt(i,matrix);center.setFromMatrixPosition(matrix);if(center.distanceTo(out.pos)<0.4)safe=false;}}check(safe,'Festival shot '+index+' avoids lantern bodies');}
  for(const style of Object.keys(STYLES)){a.applyStyle(style);await new Promise(r=>requestAnimationFrame(r));a.step(0);check(town.root.visible&&lake.root.visible&&lake.lanterns.count===36,style+' keeps both festival scenes');}
  const saved=a.projectData();check(saved.festival===true,'Project includes festival state');a.setFestival(false);a.loadProject(saved);a.step(0);check(a.atmos.festival&&toggle.checked&&town.root.visible,'Project reload restores festival switch');
  const legacy={...saved};delete legacy.festival;a.loadProject(legacy);a.step(0);check(!a.atmos.festival&&!lake.root.visible,'Older projects default to festival off');
  const preset=VIDEO_PRESETS.lanternEvening;check(preset.festival&&preset.clips.reduce((n,c)=>n+c.seconds,0)===1200,'Lantern evening preset is a twenty-minute festival');const button=[...document.querySelectorAll('#videoPresets button')].find(b=>b.textContent.includes(preset.label));button.click();a.step(0);check(a.atmos.festival&&a.timeline.playing&&a.timeline.total===1200,'Ready-made video preset activates festival and timeline');
  const episode=[...document.querySelectorAll('#videoPresets button')].find(b=>b.textContent.includes(VIDEO_PRESETS.episode1Welcome.label));episode.click();check(!a.atmos.festival,'Other video presets reset festival state');check(a.audio.ctx===null,'Festival never starts sound');
  return {passed:results.length,results};
 }finally{a.timeline.stop();a.loadProject(original);a.timeline.loop=loop;document.querySelector('#tlLoop').checked=loop;}
}
