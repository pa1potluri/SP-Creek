import * as THREE from 'three';

export async function runRelease3Tests(){
 const a=window.__app,farm=a.life.ponyFarm,results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 check(farm?.interactables.length===14,'Pony farm exposes three ponies and eleven little animal friends for gentle taps');
 farm.update(20,a.camera);
 const pony=farm.ponies[0],ponyMesh=pony.g.getObjectByProperty('isMesh',true)||pony.g.children[0];
 check(farm.react(ponyMesh)==='pony','Tapping a pony maps to its calm nuzzle');
 farm.update(20.8,a.camera);
 check(pony.reactAt===20&&pony.g.position.y>0,'Pony nuzzle is a small gentle movement');
 const lamb=farm.babies.find(p=>p.kind==='lamb'),lambMesh=lamb.g.getObjectByProperty('isMesh',true)||lamb.g.children[0];
 check(farm.react(lambMesh)==='lamb','Tapping a little farm animal maps to its friendly hop');
 farm.update(21.25,a.camera);
 check(lamb.g.position.y>lamb.home.y,'Friendly animal response stays low and soft');
 const ghost=a.ghostTown.ghosts[0],ghostMesh=ghost.g.getObjectByProperty('isMesh',true)||ghost.g.children[0];
 a.ghostTown.update(30,null,a.atmos.cur);check(a.ghostTown.react(ghostMesh),'Friendly cube ghost accepts a tap');a.ghostTown.update(30.8,null,a.atmos.cur);
 check(ghost.arms[1].rotation.z>.22,'Ghost answers with a gentle wave');
 check(a.audio.ctx===null,'Interaction checks never start sound without a real click');
 return {passed:results.length,results};
}
