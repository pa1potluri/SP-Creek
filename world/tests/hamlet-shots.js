import * as THREE from 'three';
import { terrainHeight, walkHeight } from '../src/world.js';
import { VIDEO_PRESETS } from '../src/presets.js';
import { PRESETS } from '../src/atmosphere.js';

export async function runHamletShotTests() {
  const a=window.__app, d=a.director, w=a.world, original=a.projectData();
  const saved=new Map(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]));
  const controls={paused:d.paused,sway:d.sway,speed:d.speed,auto:d.auto};
  const restartMusic=a.audio.restartMusic; a.audio.restartMusic=()=>{};
  const results=[], check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  const buildings=[], trees=[], matrix=new THREE.Matrix4();
  let samples=0, minGround=Infinity, minTree=Infinity;
  const visible=o=>{while(o){if(!o.visible)return false;o=o.parent;}return true;};
  const verify=(p,label)=>{
    samples++;
    const ground=p.y-Math.max(terrainHeight(p.x,p.z),walkHeight(p.x,p.z));minGround=Math.min(minGround,ground);
    if(ground<1.5)throw Error(`${label}: ground clearance ${ground.toFixed(3)} at ${p.toArray()}`);
    for(const {rect,top} of buildings) {
      const dx=p.x-rect.cx,dz=p.z-rect.cz;
      if(Math.abs(dx*rect.ax+dz*rect.az)<rect.hx+0.6 && Math.abs(dx*rect.bx+dz*rect.bz)<rect.hz+0.6 && p.y<top+1.5)throw Error(`${label}: inside building/roof clearance volume at ${p.toArray()}`);
    }
    for(const box of trees) if(p.x>box.min.x-0.6 && p.x<box.max.x+0.6 && p.z>box.min.z-0.6 && p.z<box.max.z+0.6) {
      minTree=Math.min(minTree,p.y-box.max.y);
      if(p.y<box.max.y+1.5)throw Error(`${label}: tree canopy clearance at ${p.toArray()}`);
    }
  };
  try {
    a.loadProject({...original,layout:[]});w.setHamlet(true);a.applyStyle('oil');
    for(const e of w.hamlet.buildings) {
      const top=new THREE.Box3().setFromObject(e.obj).max.y;
      for(const rect of e.additions.rects)buildings.push({rect,top});
    }
    for(const {mesh:m} of w.plantInstances) {
      if(!visible(m))continue;
      m.geometry.computeBoundingBox();m.updateMatrixWorld(true);
      for(let i=0;i<m.count;i++) {
        m.getMatrixAt(i,matrix);matrix.premultiply(m.matrixWorld);
        const box=m.geometry.boundingBox.clone().applyMatrix4(matrix);
        if(box.max.y-box.min.y>2.5 && box.max.x>-180 && box.min.x<-55 && box.max.z>20 && box.min.z<100)trees.push(box);
      }
    }
    check(buildings.length===7 && trees.length>0,'Building colliders and nearby visible tree canopies collected');
    const state={pos:new THREE.Vector3(),look:new THREE.Vector3()};
    for(const shot of d.shots.filter(s=>s.group==='Willow Creek')) {
      for(let i=0;i<=1000;i++){shot.sample(shot.duration*i/1000,state);verify(state.pos,shot.name);}
      check(true,`${shot.name}: 1,001 samples clear ground, buildings and trees`);
    }
    d.sway=2;d.paused=true;d.locked=false;
    for(const [from,to] of [[21,22],[22,23],[23,21]]) {
      d.shots[from].sample(d.shots[from].duration,d.state);d.playShot(to,{cut:false,fitTo:90});
      const f=d.flight;check(!!f,`${from} → ${to}: flight created (including optional fly-back)`);
      for(let i=0;i<=1000;i++) {
        f.t=f.dur*i/1000;d.update(0);verify(d.state.pos,`${from} → ${to} raw flight`);verify(a.camera.position,`${from} → ${to} rendered flight`);
      }
      check(true,`${from} → ${to}: 1,001 flight samples clear obstacles, with maximum camera sway`);
    }
    const preset=VIDEO_PRESETS.villageDusk;
    check(preset.clips.length===3 && preset.clips.reduce((n,c)=>n+c.seconds,0)===270 && preset.clips[0].move==='cut','Village preset retains indices, duration and first cut');
    check(preset.clips.every(c=>c.mood==='villageDusk'),'Every village clip explicitly keeps the same warm dusk');
    // dusk was deliberately lifted for young viewers (review batch 1); it must stay a dusk, and stay readable
    check(PRESETS.dusk.sunElev<0 && PRESETS.dusk.lanterns===1 && PRESETS.dusk.hemiIntensity>=1.2,'Dusk mood stays dusk and readable');
    a.atmos.setPreset('night',true);
    [...document.querySelectorAll('#videoPresets button')].find(b=>b.textContent.includes('Village at dusk')).click();
    check(a.atmos.key==='villageDusk' && a.atmos.cur.hemiIntensity>=1.7 && a.atmos.cur.lanterns===1,'Preset immediately replaces night with readable dusk and lit windows');
    const light=JSON.stringify(a.atmos.cur), transitions=[], t=a.timeline;
    let last=t.index;
    for(let frame=0;frame<18000;frame++) {
      t.update(1/30);d.update(1/30);a.atmos.update(1/30,frame/30,a.camera);
      verify(a.camera.position,`10-minute render frame ${frame}`);
      if(last!==t.index){transitions.push(t.index);last=t.index;}
      if(frame%600===0) {
        check(a.atmos.key==='villageDusk' && Math.abs(a.atmos.cur.sunIntensity-1.8)<1e-9 && Math.abs(a.atmos.cur.hemiIntensity-1.8)<1e-9 && Math.abs(a.atmos.cur.exposure-1.45)<1e-9,`${frame/30}s: dusk illumination and exposure remain constant`);
      }
    }
    check(transitions.join(',')==='1,2,0,1,2,0','Ten-minute 30 fps playback crosses two full loops and returns to Approach');
    check(Math.abs(a.atmos.cur.sunIntensity-JSON.parse(light).sunIntensity)<1e-9 && a.atmos.cur.skyHorizon.equals(new THREE.Color(PRESETS.villageDusk.skyHorizon)),'End-of-render sky and light match the beginning');
    check(a.audio.ctx===null,'Tests never start audio');
    return {passed:results.length,samples,minGround,minTree:Number.isFinite(minTree)?minTree:null,results};
  } finally {
    a.audio.restartMusic=restartMusic;a.timeline.stop();a.loadProject(original);Object.assign(d,controls);
    localStorage.clear();for(const [k,v] of saved)localStorage.setItem(k,v);
  }
}
