import * as THREE from 'three';
import { STYLES } from '../src/styles.js';
import { terrainHeight } from '../src/world.js';

export async function runMoreBuildingTests() {
  const a = window.__app, w = a.world, original = a.projectData();
  const storage = new Map(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)]));
  const results = [], check = (ok, msg) => { if (!ok) throw Error(msg); results.push(msg); };
  const click = id => document.querySelector(id).click();
  const key = code => window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
  const groundClick = (x, z, height = 0) => {
    const y = terrainHeight(x,z) + height, c = document.querySelector('#view');
    a.camera.position.set(x+2,y+50,z+25); a.camera.lookAt(x,y,z); a.camera.updateMatrixWorld(true);
    const p = new THREE.Vector3(x,y,z).project(a.camera), r = c.getBoundingClientRect();
    const e = { clientX:r.left+(p.x+1)*r.width/2, clientY:r.top+(1-p.y)*r.height/2, button:0, bubbles:true };
    for (const t of ['pointermove','pointerdown','pointerup']) c.dispatchEvent(new PointerEvent(t,e));
  };
  try {
    a.loadProject({ ...original, layout: [] });
    const base = { flames: w.flames.length, emitters: w.emitters.length, lights: w.pool.filter(p=>p.used).length, segs:w.colliders.segs.length };
    for (const style of Object.keys(STYLES)) {
      console.log('More buildings:', style);
      a.applyStyle(style);
      for (const [i,type] of ['cabin','brick','blacksmith','hitch'].entries()) {
        click(`[data-build="${type}"]`); groundClick(-210+i*24,20); key('Escape');
        const e = w.buildings.at(-1);
        check(e.spec.type === type, `${style}/${type}: canvas placement`);
        check(e.additions.rects.length > 0, `${style}/${type}: collider`);
        check(Math.abs(terrainHeight(e.pad.x,e.pad.z)-e.pad.y)<1e-6, `${style}/${type}: flattened pad`);
        check(w.buildingPOIs.includes(e.poi) === (type!=='hitch'), `${style}/${type}: building destination only`);
        if (type==='cabin' || type==='brick') {
          const source = type==='cabin'?'log_wall':'brick_wall', mats=[];
          e.obj.traverse(o=>{if(o.material)mats.push(...[].concat(o.material));});
          const m=mats.find(m=>m.userData.sets?.oil?.image===w.painted.oil[source]);
          check(!!m && (w.textureSet==='flat' ? !m.map : m.map.image===w.painted[w.textureSet][source]), `${style}/${type}: correct wall map`);
          check(e.additions.windowMats.length>0, `${style}/${type}: painted facade`);
        }
        if (type==='blacksmith') {
          check(e.spec.sign==='BLACKSMITH' && e.additions.flames.length===1 && e.additions.emitters.length===2, `${style}: forge flame, smoke, embers and default sign`);
          check(!!e.light, `${style}: forge pooled light`);
          w.lanternLevel=1; w.update(0.016,1,a.camera);
          check(e.light.light.intensity>0, `${style}: forge glows at night`);
        }
      }
      const fence=w.addFence([[-210,44],[-201,44],[-196,49]]);
      check(fence.segs.length===2 && fence.obj.material===w.mat.wood, `${style}: fence renders with styled wood and segment colliders`);
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      w.removeFence(fence);
      for(const e of [...w.buildings]) w.removeBuilding(e);
    }
    click('#drawFence'); groundClick(-190,45); groundClick(-180,45); key('Escape');
    check(!w.fences.length && w.colliders.segs.length===base.segs,'Fence cancel leaves no geometry or physics');
    click('#drawFence'); groundClick(-190,45); groundClick(-180,45); key('Enter');
    check(w.fences.length===1 && w.colliders.segs.length===base.segs+1,'Fence Enter commits collider');
    const seg=w.fences[0].segs[0];
    a.game.pos.set(-185,terrainHeight(-185,45),47);
    for(let i=0;i<80;i++) a.game._move(0,-0.05,0.35);
    check(a.game.pos.z>=seg.az+0.34,'Fence blocks player');
    for(const [i,type] of ['cabin','brick','blacksmith','hitch'].entries()) w.placeBuilding({type,x:-210+i*24,z:20});
    const saved=JSON.stringify(a.projectData()); a.loadProject(JSON.parse(saved));
    check(JSON.stringify(a.projectData())===saved,'Exact project round trip for new pieces and fence');
    check(JSON.parse(localStorage.getItem('dh.layout')).some(e=>e.kind==='fence'),'Fence saved in localStorage');
    click('#undoFence'); check(!w.fences.length,'Remove last fence');
    click('#drawFence'); groundClick(-190,45); groundClick(-180,45); document.querySelector('#view').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));
    check(w.fences.length===1,'Fence double click finishes');
    groundClick(-185,45,1.05); check(!document.querySelector('#deleteBuilding').disabled,'Fence selectable');
    key('Delete'); check(!w.fences.length,'Selected fence deleted');
    for(const e of [...w.buildings]) w.removeBuilding(e);
    check(w.flames.length===base.flames && w.emitters.length===base.emitters && w.pool.filter(p=>p.used).length===base.lights && w.colliders.segs.length===base.segs,'Cleanup restores emitters, flames, lights and fence colliders');
    check(a.audio.ctx===null,'Tests never unlock audio');
    return {passed:results.length,results};
  } finally {
    a.loadProject(original); localStorage.clear(); for(const [k,v] of storage) localStorage.setItem(k,v);
  }
}
