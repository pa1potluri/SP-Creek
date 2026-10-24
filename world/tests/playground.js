import * as THREE from 'three';
import { PLAY_PIECES } from '../src/areas/playground.js';
import { STYLES } from '../src/styles.js';
export async function runPlaygroundTests(){
 const a=window.__app,w=a.world,p=w.playground,original=a.projectData(),player=a.game.pos.clone(),results=[];
 const check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 try{
  check(Object.keys(p.pieces).length===5,'Five native playground equipment pieces');check(p.kids.length===3&&p.kids[0].outfit.star==='pavi'&&p.kids[1].outfit.star==='siri','Pavi and Siri join a third cartoon child');
  a.game.pos.set(38,0,53);for(let i=0;i<60;i++)a.game._move(0.1,0,0.35);check(a.game.pos.x<39.1,'Sandbox collider stops walking through its rim');a.game.pos.set(18,0,51);for(let i=0;i<80;i++)a.game._move(0.1,0,0.35);check(a.game.pos.x>24,'Entrance path passes through the low-fence gap');
  p.update(25,a.camera);const angle=p.pieces.playSwing.userData.swingPivot.rotation.x,slide=p.kids[2].g.position.clone();p.update(60,a.camera);p.update(25,a.camera);check(p.pieces.playSwing.userData.swingPivot.rotation.x===angle&&p.kids[2].g.position.distanceTo(slide)<1e-8,'Play motions reproduce after seeking');
  let gentle=true,dry=true,continuous=true,last=null;for(let t=0;t<=64;t+=0.05){p.update(t,a.camera);if(Math.abs(p.pieces.playSwing.userData.swingPivot.rotation.x)>0.121)gentle=false;const pos=p.kids[2].g.position;if(last&&last.distanceTo(pos)>0.12)continuous=false;last=pos.clone();for(const kid of p.kids){const v=kid.g.getWorldPosition(new THREE.Vector3());if(w.inPond(v.x,v.z,0.4))dry=false;}}
  check(gentle,'Swing remains slow and shallow');check(continuous,'Slide routine has no position jumps at phase boundaries');check(dry,'All playground children stay on dry land');p.update(8,a.camera);const first=p.kids[2].g.position.clone();p.update(40,a.camera);check(first.distanceTo(p.kids[2].g.position)<1e-8,'Slide routine closes its 32-second loop');
  a.loadProject({...original,layout:[]});const before=w.colliders.rects.length;
  for(const [i,type]of Object.keys(PLAY_PIECES).entries()){check(!!document.querySelector(`[data-build="${type}"]`),type+' joins the existing Build catalogue');const ghost=w.makeBuilding({type,x:90+i*8,z:85,w:10},true);check(w.colliders.rects.length===before+i,'Play piece preview has no physics');w.disposeBuilding(ghost);const e=w.placeBuilding({type,x:90+i*8,z:85,w:10,yaw:0.2});check(e.additions.rects.length===1&&e.obj.userData.buildPiece,type+' places with a compact collider');}
  const saved=JSON.stringify(w.layout());w.loadLayout(JSON.parse(saved));check(JSON.stringify(w.layout())===saved,'Playground Build pieces round trip exactly');
  for(const style of Object.keys(STYLES)){a.applyStyle(style);await new Promise(r=>requestAnimationFrame(r));p.update(25,a.camera);check(w.buildings.length===5&&p.root.visible,style+' keeps playground and placed pieces');}
  w.beginBuildReplay(2);w.updateBuildReplay(1.1);p.update(25,a.camera);w.endBuildReplay();check(JSON.stringify(w.layout())===saved,'Animated playground pieces survive build replay');
  for(const e of [...w.buildings])w.removeBuilding(e,false);w.updateTerrain();check(w.colliders.rects.length===before,'Removing placed play pieces cleans physics without removing the park');
  check(a.director.shots[45]?.name==='Playground','Playground shot appended at slot 45');check(a.audio.ctx===null,'Playground never starts sound');return {passed:results.length,results};
 }finally{a.game.pos.copy(player);a.loadProject(original);}
}
