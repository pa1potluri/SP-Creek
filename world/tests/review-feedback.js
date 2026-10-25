import * as THREE from 'three';
import { terrainHeight } from '../src/world.js';
export async function runReviewFeedbackTests(){
 const a=window.__app,w=a.world,results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);},ray=new THREE.Raycaster(),matrix=new THREE.Matrix4();
 let maxError=0;
 for(let i=0;i<80;i++){
  const x=-390+(i*73.17)%690,z=-270+(i*41.13)%520;
  ray.set(new THREE.Vector3(x,300,z),new THREE.Vector3(0,-1,0));const expected=ray.intersectObject(w.ground)[0]?.point.y??terrainHeight(x,z),error=Math.abs(w.groundY(x,z)-expected);maxError=Math.max(maxError,error);check(error<.0002,'Terrain triangle sample '+i+' matches the rendered mesh');
 }
 for(const floor of w.floors.slice(0,12)){
  const x=floor.cx,z=floor.cz;ray.set(new THREE.Vector3(x,300,z),new THREE.Vector3(0,-1,0));const old=ray.intersectObjects(w.walkables,false)[0]?.point.y??terrainHeight(x,z);check(Math.abs(w.surfaceY(x,z)-old)<.0002,'Raised walkable keeps its original surface height');
 }
 a.timeline.stop();a.director.auto=false;a.director.playShot(35,{cut:true});a.step(0);
 let maxGap=-Infinity;for(const {im}of a.forest.variants)for(let i=0;i<im.count;i++){im.getMatrixAt(i,matrix);const gap=matrix.elements[13]-w.groundY(matrix.elements[12],matrix.elements[14]);maxGap=Math.max(maxGap,gap);}
 check(maxGap<.001,'Forest roots no longer float above rendered terrain');
 let nativeError=0;for(const record of w.plantInstances)for(let i=0;i<record.mesh.count;i+=Math.max(1,Math.floor(record.mesh.count/8))){record.mesh.getMatrixAt(i,matrix);if(matrix.getMaxScaleOnAxis()===0)continue;const x=record.matrices[i*16+12],z=record.matrices[i*16+14],expected=record.matrices[i*16+13]+w.groundY(x,z)-record.heights[i];nativeError=Math.max(nativeError,Math.abs(matrix.elements[13]-expected));}
 check(nativeError<.0002,'Native plant roots retain their offset on rendered terrain');
 check(a.forest.deer.every(({x,z})=>Math.abs(x+65)<=10&&Math.abs(z+201)<=12),'Deer family has a clear viewing glade');
 check(a.audio.ctx===null,'Feedback checks never start sound');
 return {passed:results.length,maxTerrainError:maxError,maxRootGap:maxGap,maxNativeHeightError:nativeError,results};
}
