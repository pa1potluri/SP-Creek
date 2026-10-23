import * as THREE from 'three';
import { terrainHeight } from '../src/world.js';

export function runAreaShotTests() {
  const a=window.__app,w=a.world,trees=[],matrix=new THREE.Matrix4(),worldMatrix=new THREE.Matrix4();
  const meshes=[...w.plantInstances.map(p=>p.mesh),...a.forest.variants.filter(v=>v.im.visible).map(v=>v.im),...a.meadowLake.plants.filter(m=>m.visible)];
  for(const m of meshes){if(!m.visible||!m.parent.visible)continue;m.geometry.computeBoundingBox();const box=m.geometry.boundingBox;if(box.max.y-box.min.y<3)continue;m.updateWorldMatrix(true,false);for(let i=0;i<m.count;i++){m.getMatrixAt(i,matrix);if(matrix.getMaxScaleOnAxis()===0)continue;worldMatrix.multiplyMatrices(m.matrixWorld,matrix);trees.push(box.clone().applyMatrix4(worldMatrix));}}
  const props=w.props.filter(p=>p.obj.visible).map(p=>new THREE.Box3().setFromObject(p.obj));
  for(const g of a.forest.root.children)if(g.isGroup)props.push(new THREE.Box3().setFromObject(g));
  const out={pos:new THREE.Vector3(),look:new THREE.Vector3()},results=[];
  for(const index of [26,27]){
    let ground=Infinity,tree=Infinity,prop=Infinity;
    const shot=a.director.shots[index];
    for(let i=0;i<=200;i++){shot.sample(i/200*shot.duration,out);ground=Math.min(ground,out.pos.y-terrainHeight(out.pos.x,out.pos.z));for(const b of trees)tree=Math.min(tree,b.distanceToPoint(out.pos));for(const b of props)prop=Math.min(prop,b.distanceToPoint(out.pos));}
    results.push({index,name:shot.name,samples:201,minGround:ground,minTree:tree,minProp:prop});
  }
  for(const r of results)if(r.minGround<1.2||r.minTree<1.5||r.minProp<1.5)throw Error(JSON.stringify(results));
  if(a.audio.ctx!==null)throw Error('Smoke check activated sound');
  return {passed:7,results};
}
