import * as THREE from 'three';
import { terrainHeight } from '../src/world.js';
export async function runReviewFeedbackTests(){
 const a=window.__app,w=a.world,results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);},ray=new THREE.Raycaster(),matrix=new THREE.Matrix4();
 let maxError=0;
 for(let i=0;i<80;i++){
  const x=-390+(i*73.17)%690,z=-270+(i*41.13)%520;
  ray.set(new THREE.Vector3(x,300,z),new THREE.Vector3(0,-1,0));const expected=(w.riverBanks?ray.intersectObject(w.riverBanks)[0]?.point.y:null)??ray.intersectObject(w.ground)[0]?.point.y??terrainHeight(x,z),error=Math.abs(w.groundY(x,z)-expected);maxError=Math.max(maxError,error);check(error<.0002,'Terrain triangle sample '+i+' matches the rendered mesh');
 }
 for(const floor of w.floors.slice(0,12)){
  const x=floor.cx,z=floor.cz;ray.set(new THREE.Vector3(x,300,z),new THREE.Vector3(0,-1,0));const old=ray.intersectObjects(w.walkables,false)[0]?.point.y??terrainHeight(x,z);check(Math.abs(w.surfaceY(x,z)-old)<.0002,'Raised walkable keeps its original surface height');
 }
 a.timeline.stop();a.director.auto=false;a.director.playShot(35,{cut:true});a.step(0);
 let maxGap=-Infinity;for(const {im}of a.forest.variants)for(let i=0;i<im.count;i++){im.getMatrixAt(i,matrix);const gap=matrix.elements[13]-w.groundY(matrix.elements[12],matrix.elements[14]);maxGap=Math.max(maxGap,gap);}
 check(maxGap<.001,'Forest roots no longer float above rendered terrain');
 let nativeError=0;for(const record of w.plantInstances)for(let i=0;i<record.mesh.count;i+=Math.max(1,Math.floor(record.mesh.count/8))){record.mesh.getMatrixAt(i,matrix);if(matrix.getMaxScaleOnAxis()===0)continue;const x=record.matrices[i*16+12],z=record.matrices[i*16+14],expected=record.matrices[i*16+13]+w.groundFootY(x,z,(record.mesh.userData.rootRadius||0)*matrix.getMaxScaleOnAxis())-record.heights[i];nativeError=Math.max(nativeError,Math.abs(matrix.elements[13]-expected));}
 check(nativeError<.0002,'Native plant roots retain their offset on rendered terrain');
 check(a.forest.deer.every(({x,z})=>Math.abs(x+65)<=10&&Math.abs(z+201)<=12),'Deer family has a clear viewing glade');
 check(a.audio.ctx===null,'Feedback checks never start sound');
 const oldStyle=a.projectData().style;
 try {
  a.applyStyle('film');const versions=[...w.surfaces].map(m=>m.version);
  a.applyStyle('film');check([...w.surfaces].every((m,i)=>m.version===versions[i]),'Repeated Film presets reuse unchanged material programs');
 } finally {a.applyStyle(oldStyle);}
 const output=document.querySelector('#outputSize'),oldOutput=output.value;
 try {
  output.value='window';output.dispatchEvent(new Event('change'));
  const canvas=document.querySelector('canvas');check(canvas.width<=1600&&canvas.height<=900,'Fit-window review bounds render resolution');
  output.value='1080p';output.dispatchEvent(new Event('change'));
  check(canvas.width===1920&&canvas.height===1080,'Explicit 1080p output keeps exact dimensions');
 } finally {output.value=oldOutput;output.dispatchEvent(new Event('change'));}
 const walker=a.life.hamletWalkers[0],saved={state:walker.state,seat:walker.seat,wait:walker.wait};
 try {
  for(const state of ['toSeat','sitDown','sit','getUp']) {
   const bench={x:walker.pos.x,z:walker.pos.z,y:walker.pos.y+0.5,yaw:0,who:walker};
   walker.state=state;walker.seat=bench;walker.leaveSeat();
   check(walker.seat===null&&bench.who===null,'Inactive '+state+' walker releases its bench');
   check(walker.state==='wait'&&walker.wait>0,'Inactive '+state+' walker cancels seating before reactivation');
   walker.update(0,0);check(walker.pos.toArray().every(Number.isFinite),'Reactivated '+state+' walker updates without a null-seat crash');
  }
 } finally {Object.assign(walker,saved);}
 const kid=a.life.townKids[0],oldPeople=a.life.settings.people,oldFamily=a.life.familyMode,kidState={state:kid.state,seat:kid.seat,wait:kid.wait};
 try {
  a.life.familyMode=true;
  const bench={x:kid.pos.x,z:kid.pos.z,y:kid.pos.y+0.5,yaw:0,who:kid};
  kid.state='sit';kid.seat=bench;a.life.settings.people=0;a.life.update(0,0,a.camera);
  check(kid.seat===null&&kid.state==='wait','Hiding town children cancels an occupied bench state');
  a.life.settings.people=4;a.life.update(0,0,a.camera);
  check(kid.p.g.visible&&kid.pos.toArray().every(Number.isFinite),'Reactivating town children keeps the complete Life update running');
 } finally {a.life.settings.people=oldPeople;a.life.familyMode=oldFamily;Object.assign(kid,kidState);a.life.update(0,0,a.camera);}
 return {passed:results.length,maxTerrainError:maxError,maxRootGap:maxGap,maxNativeHeightError:nativeError,results};
}
