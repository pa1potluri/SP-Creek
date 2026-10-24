import { buildCamping } from '../src/areas/camping.js';
import { VIDEO_PRESETS } from '../src/presets.js';
export function runCampingTests(){
 const a=window.__app,w=a.world,c=buildCamping(w),results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 check(c===buildCamping(w),'Camping factory is idempotent');check(c.tents.length===2&&c.grownups.length===2,'Two warm tents and two nearby grown-ups');check(c.siblings.every(p=>p.model.isSkinnedMesh),'Both supplied textured models sit on the log');check(w.colliders.circles.some(p=>p.x===-200&&p.z===58&&p.r>=1.65),'Fire has a soft approach barrier');check(!w.inPond(-200,58,18),'Clearing is outside deep water');
 c.update(12,a.camera,{stars:1});const matrix=Array.from(c.flies.instanceMatrix.array);c.update(50,a.camera,{stars:1});c.update(12,a.camera,{stars:1});check(JSON.stringify(matrix)===JSON.stringify(Array.from(c.flies.instanceMatrix.array)),'World-time seeks restore firefly positions');check(matrix.every(Number.isFinite),'Firefly matrices stay finite');check(c.flies.visible&&c.flies.count===48,'Small fixed firefly population at night');
 c.update(31,a.camera,{stars:1});check(c.star.material.opacity>0,'One soft shooting star during its scheduled pass');c.update(34,a.camera,{stars:1});check(c.star.material.opacity===0,'Shooting star fades fully away');c.update(12,a.camera,{stars:0});check(!c.flies.visible,'Fireflies rest in daytime');
 check(a.director.shots[59].name==='Cosy camping clearing'&&a.director.shots[60].name==='Stars above camp','Two camping views append after train shot 58');check(VIDEO_PRESETS.camping.clips.reduce((n,p)=>n+p.seconds,0)===1200,'Camping preset lasts twenty minutes');check(a.audio.ctx===null,'Camping smoke never starts sound');return {passed:results.length,results};
}
