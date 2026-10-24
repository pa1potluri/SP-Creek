import * as THREE from 'three';
import { terrainHeight, coastX, walkHeight } from '../src/world.js';
import { STYLES } from '../src/styles.js';
import { beachWalk, episodeWalk, stageCove } from '../src/areas/sunset-cove.js';
import { VIDEO_PRESETS } from '../src/presets.js';
export async function runSunsetCoveTests(){
 const a=window.__app,w=a.world,c=w.sunsetCove,original=a.projectData(),position=a.game.pos.clone(),results=[];
 const check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 try{
  check(c.cottages.length===15,'Fifteen cove cottages');check(c.palms.length===2&&c.palms.every(m=>m.isInstancedMesh&&m.count>=18),'Palms use two instanced batches');
  check(w.colliders.water.includes(c.water)&&c.water.sea,'Sea registered as water');
  for(const z of [-75,0,75,150]){check(w.inPond(coastX(z)-5,z)&&!w.inPond(coastX(z)+5,z),`Sea boundary at z ${z}`);}
  const z=-45,edge=coastX(z);a.game.pos.set(edge+5,terrainHeight(edge+5,z),z);for(let i=0;i<200;i++)a.game._move(-0.1,0,0.35);check(a.game.pos.x>edge+0.25,'Waterline wall stops walking into sea');
  a.game.pos.set(-351,1.2,30);for(let i=0;i<180;i++)a.game._move(-0.2,0,0.35);check(a.game.pos.x<-380&&Math.abs(walkHeight(-380,30)-1.2)<1e-8,'Pier deck is safely walkable over water');
  for(let i=0;i<120;i++)a.game._move(-0.2,0,0.35);check(a.game.pos.x>-396,'Pier end rail prevents walking off');for(let i=0;i<60;i++)a.game._move(0,0.2,0.35);check(a.game.pos.z<32.5,'Pier side rail prevents walking off');
  let dry=true,clear=true;for(let t=0;t<=320;t+=2){const p=beachWalk(t);if(w.inPond(p.x,p.z,0.6))dry=false;if(p.z>27&&p.z<33&&p.x<-349)clear=false;}check(dry,'Sibling beach walk stays dry');check(clear,'Sibling path goes around the landward pier entrance and rails');
  const first=beachWalk(25),repeated=beachWalk(185);check(Math.abs(first.x-repeated.x)<1e-8&&first.z===repeated.z,'Beach routine repeats from world time');
  c.update(25,a.camera,a.atmos.cur);const boat=c.boats[0].position.y;c.update(60,a.camera,a.atmos.cur);c.update(25,a.camera,a.atmos.cur);check(c.boats[0].position.y===boat,'Boat rocking reproduces after seeking');
  a.setSeason('winter');a.step(0);check(!a.seasons.hooked.has(c.sand),'Winter leaves sand outside the snow shader');
  for(const style of Object.keys(STYLES)){a.applyStyle(style);await new Promise(resolve=>requestAnimationFrame(resolve));check(c.root.visible&&(w.textureSet==='flat'?c.palms[0].visible:c.paintedPalms.visible),`${style}: correct cove palm variant renders`);}
  check(['plaster_wall','terracotta_roof','cobblestones','beach_sand'].every(name=>w.painted.oil[name]&&w.painted.clean[name]),'All approved surface texture sets loaded');
  check(c.images.oil.palm&&c.images.clean.bougainvillea,'Approved foliage cutouts loaded');
  const view=a.camera.clone();view.position.set(-330,12,20);c.update(25,view,a.atmos.cur);check(c.seaBackdrop.visible,'Sea panorama visible at cove');
  check(Math.abs(c.seaBackdrop.position.y+(0.5-c.horizonRatio)*c.horizonHeight-view.position.y)<1e-6,'Painted sea horizon aligned at 56.5 percent');
  view.position.x=0;c.update(25,view,a.atmos.cur);check(!c.seaBackdrop.visible,'Sea panorama absent from main valley');
  view.position.x=-330;c.update(25,view,a.atmos.cur);for(const style of ['oil','film']){a.applyStyle(style);await Promise.resolve();c.update(25,view,a.atmos.cur);}view.position.x=0;c.update(25,view,a.atmos.cur);const valley=w.root.parent.children.find(o=>o.geometry?.type==='CylinderGeometry'&&o.material?.map&&!o.material.fog);check(valley?.visible,'Main valley panorama restored after switching styles at the cove');
  check(VIDEO_PRESETS.sunsetCove.clips.reduce((n,p)=>n+p.seconds,0)===1200,'Cove preset lasts twenty minutes');
  check([39,40,41].every(i=>a.director.shots[i].group==='Sunset Cove'),'Three cove shots appended after siblings');check([42,43,44].map(i=>a.director.shots[i].name).join('|')==='Walking into the sunset|Two small friends on a big beach|Down the lantern lane','Episode shots appended without renumbering');
  const ep=VIDEO_PRESETS.episode1Welcome;check(ep.clips.reduce((n,p)=>n+p.seconds,0)===180&&ep.clips.map(p=>p.shot).join(',')==='39,43,44,41,42','Episode 1 lasts three minutes in the requested order, without front-facing shot');
  for(const kind of ['beach','lane']){let dry=true,behind=true;for(let t=0;t<=70;t++){const p=episodeWalk(kind,t);if(w.inPond(p.x,p.z,0.6))dry=false;const out={pos:new THREE.Vector3(),look:new THREE.Vector3()};a.director.shots[kind==='beach'?42:44].sample(t,out);if((out.pos.x-p.x)*Math.sin(p.yaw)+(out.pos.z-p.z)*Math.cos(p.yaw)>=0)behind=false;}check(dry,kind+' episode route remains dry');check(behind,kind+' episode camera remains behind');}
  stageCove('beach',25);c.update(0,a.camera,a.atmos.cur);const pose=c.siblings.pavi.g.position.clone();stageCove('beach',60);c.update(0,a.camera,a.atmos.cur);stageCove('beach',25);c.update(0,a.camera,a.atmos.cur);check(c.siblings.pavi.g.position.distanceTo(pose)<1e-8,'Episode actors reproduce after seeking');
  check(new Set(c.cottages.map(p=>p.yaw)).size>5&&new Set(c.cottages.map(p=>p.size)).size>2,'Cottages have deterministic rotation and size variety');
  check(c.footprints.material.transparent&&!c.footprints.castShadow,'Footprint dents have soft alpha and no stone-like shadows');
  check(a.audio.ctx===null,'Audio never unlocked');
  return {passed:results.length,results};
 }finally{a.game.pos.copy(position);a.loadProject(original);}
}
