import * as THREE from 'three';
import { terrainHeight, coastX, walkHeight } from '../src/world.js';
import { STYLES } from '../src/styles.js';
import { beachWalk } from '../src/areas/sunset-cove.js';
import { VIDEO_PRESETS } from '../src/presets.js';
export async function runSunsetCoveTests(){
 const a=window.__app,w=a.world,c=w.sunsetCove,original=a.projectData(),position=a.game.pos.clone(),results=[];
 const check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 try{
  check(c.cottages.length===15,'Fifteen cove cottages');check(c.palms.length===2&&c.palms.every(m=>m.isInstancedMesh&&m.count===18),'Palms use two instanced batches');
  check(w.colliders.water.includes(c.water)&&c.water.sea,'Sea registered as water');
  for(const z of [-75,0,75,150]){check(w.inPond(coastX(z)-5,z)&&!w.inPond(coastX(z)+5,z),`Sea boundary at z ${z}`);}
  const z=-45,edge=coastX(z);a.game.pos.set(edge+5,terrainHeight(edge+5,z),z);for(let i=0;i<200;i++)a.game._move(-0.1,0,0.35);check(a.game.pos.x>edge+0.25,'Waterline wall stops walking into sea');
  a.game.pos.set(-351,1.2,30);for(let i=0;i<180;i++)a.game._move(-0.2,0,0.35);check(a.game.pos.x<-380&&Math.abs(walkHeight(-380,30)-1.2)<1e-8,'Pier deck is safely walkable over water');
  for(let i=0;i<120;i++)a.game._move(-0.2,0,0.35);check(a.game.pos.x>-396,'Pier end rail prevents walking off');for(let i=0;i<60;i++)a.game._move(0,0.2,0.35);check(a.game.pos.z<32.5,'Pier side rail prevents walking off');
  let dry=true,clear=true;for(let t=0;t<=320;t+=2){const p=beachWalk(t);if(w.inPond(p.x,p.z,0.6))dry=false;if(p.z>27&&p.z<33&&p.x<-349)clear=false;}check(dry,'Sibling beach walk stays dry');check(clear,'Sibling path goes around the landward pier entrance and rails');
  const first=beachWalk(25),repeated=beachWalk(185);check(Math.abs(first.x-repeated.x)<1e-8&&first.z===repeated.z,'Beach routine repeats from world time');
  c.update(25,a.camera,a.atmos.cur);const boat=c.boats[0].position.y;c.update(60,a.camera,a.atmos.cur);c.update(25,a.camera,a.atmos.cur);check(c.boats[0].position.y===boat,'Boat rocking reproduces after seeking');
  a.setSeason('winter');a.step(0);check(!a.seasons.hooked.has(c.sand),'Winter leaves sand outside the snow shader');
  for(const style of Object.keys(STYLES)){a.applyStyle(style);await new Promise(resolve=>requestAnimationFrame(resolve));check(c.root.visible&&c.palms[0].visible,`${style}: cove and palms render`);}
  check(VIDEO_PRESETS.sunsetCove.clips.reduce((n,p)=>n+p.seconds,0)===1200,'Cove preset lasts twenty minutes');
  check([39,40,41].every(i=>a.director.shots[i].group==='Sunset Cove'),'Three cove shots appended after siblings');check(a.audio.ctx===null,'Audio never unlocked');
  return {passed:results.length,results};
 }finally{a.game.pos.copy(position);a.loadProject(original);}
}
