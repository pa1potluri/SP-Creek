import * as THREE from 'three';
import { terrainHeight, walkHeight, LEFT, RIGHT } from '../src/world.js';
import { STYLES } from '../src/styles.js';

// Run in the browser: await (await import('/tests/build-mode.js')).runBuildTests()
export async function runBuildTests() {
  const app = window.__app, { world, camera, director, game } = app;
  const original = JSON.parse(JSON.stringify(app.projectData()));
  const originalLayout = localStorage.getItem('dh.layout'), originalTitle = document.title;
  const results = [];
  const check = (ok, message) => { if (!ok) throw new Error(message); results.push(message); if(results.length % 50 === 0) console.log('Build checks:',results.length); };
  const key = (code) => window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
  const click = (selector) => document.querySelector(selector).click();
  const canvas = document.querySelector('#view');
  const groundClick = (x, z, y = terrainHeight(x, z), move = true) => {
    camera.position.set(x + 2, y + 50, z + 25); camera.lookAt(x, y, z); camera.updateMatrixWorld(true);
    const point = new THREE.Vector3(x, y, z).project(camera), r = canvas.getBoundingClientRect();
    const event = { clientX: r.left + (point.x + 1) / 2 * r.width, clientY: r.top + (1 - point.y) / 2 * r.height, button: 0, bubbles: true };
    if (move) canvas.dispatchEvent(new PointerEvent('pointermove', event));
    canvas.dispatchEvent(new PointerEvent('pointerdown', event));
    canvas.dispatchEvent(new PointerEvent('pointerup', event));
  };
  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  try {
    app.loadProject({ ...original, layout: [] });
    // Compare actual facade canvases, including the flat fallback and protected doors.
    for (const s of [...LEFT, ...RIGHT]) {
      const spec = { ...s, fh: s.floors === 2 ? 8 : 5.4, seed: 123 };
      const before = world._frontMaterial(spec), after = world._frontMaterial({ ...spec, mainStreet: true });
      const pixels = (texture) => texture.image.toDataURL();
      check(pixels(before.userData.sets.flat.map) === pixels(after.userData.sets.flat.map), `${s.sign}: flat facade unchanged`);
      for (const set of ['oil', 'clean']) {
        const a = after.userData.sets[set], b = before.userData.sets[set];
        check((pixels(a.map) !== pixels(b.map)) === !s.barn, `${s.sign}/${set}: painted openings, barn doors preserved`);
        const c = a.emissive.image, ctx = c.getContext('2d');
        check(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3).every(v => v === 0), `${s.sign}/${set}: walls do not emit`);
        if (!s.batwing) check(ctx.getImageData(Math.floor(c.width / 2), c.height - 5, 1, 1).data.slice(0, 3).every(v => v === 0), `${s.sign}/${set}: door does not emit`);
      }
      for (const m of [before, after]) {
        world.surfaces.delete(m); world.windowMats.splice(world.windowMats.indexOf(m), 1);
        for (const set of Object.values(m.userData.sets)) { set.map.dispose(); set.emissive.dispose(); }
        m.dispose();
      }
    }
    const base = { rects: world.colliders.rects.length, circles: world.colliders.circles.length, floors: world.floors.length,
      walkables: world.walkables.length, emitters: world.emitters.length, spinners: world.spinners.length, windows: world.windowMats.length, pois: window.__life.pois.length, surfaces: world.surfaces.size };
    const types = ['shop', 'hotel', 'house', 'barn', 'chapel', 'tower', 'windmill'];
    let initialYaw = null;
    for (const style of Object.keys(STYLES)) {
      document.title = `Build tests: ${style}`;
      app.applyStyle(style);
      for (const [i, type] of types.entries()) {
        const x = -180 + i * 25, z = 35;
        click(`[data-build="${type}"]`);
        if (!i) { initialYaw ??= world.root.children.at(-1).rotation.y; key('KeyR'); canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, cancelable: true })); }
        groundClick(x, z);
        key('Escape');
        const e = world.buildings.at(-1);
        check(e?.spec.type === type && world.buildings.length === i + 1, `${style}/${type}: placed through canvas`);
        const wallName = { shop: 'wall_boards', hotel: 'wall_boards', house: 'house_boards', barn: 'barn_boards', chapel: 'chapel_boards' }[type];
        if (wallName) {
          const materials = new Set();
          e.obj.traverse((m) => { if (m.material) for (const mat of [].concat(m.material)) materials.add(mat); });
          const wall = [...materials].find((m) => m.userData.sets?.oil?.image === world.painted.oil[wallName]);
          check(!!wall, `${style}/${type}: correct painted wall source`);
          check(world.textureSet === 'flat' ? wall.map === null : wall.map.image === world.painted[world.textureSet][wallName], `${style}/${type}: wall switches with style`);
          check(!!world.painted.oil.window && !!world.painted.clean.door, `${style}/${type}: painted openings loaded`);
          const front = e.additions.windowMats[0];
          const pixels = front.emissiveMap.image.getContext('2d').getImageData(0, 0, front.emissiveMap.image.width, front.emissiveMap.image.height).data;
          check(pixels.some((v, i) => i % 4 !== 3 && v > 0) && pixels[0] === 0, `${style}/${type}: glow mask lights openings, not walls`);
        }
        check(e.additions.rects.length + e.additions.circles.length > 0, `${style}/${type}: collider`);
        check(Math.abs(terrainHeight(e.pad.x, e.pad.z) - e.pad.y) < 1e-6, `${style}/${type}: flat centre`);
        check(window.__life.pois.includes(e.poi), `${style}/${type}: live destination`);
        for (const f of e.additions.floors) check(Math.abs(walkHeight(f.cx, f.cz) - f.y) < 1e-5, `${style}/${type}: walkable porch`);
        for (const m of e.additions.windowMats) check(m.map === m.userData.sets[world.textureSet]?.map || world.textureSet === 'flat', `${style}/${type}: facade texture set`);
      }
      await nextFrame(); // Compile/render every style with every catalogue model present.
      if (style !== 'pixel') for (const e of [...world.buildings]) world.removeBuilding(e);
    }
    const shop = world.buildings[0];
    check(Math.abs(shop.spec.yaw - initialYaw - Math.PI) < 1e-6, 'R and wheel rotation persisted');
    const instance = world.plantInstances.find(({ mesh }) => mesh.count > 100);
    const matrix = new THREE.Matrix4();
    const plantIndex = Array.from({ length: instance.mesh.count }, (_, i) => i).find((i) => {
      matrix.fromArray(instance.matrices, i * 16);
      return Math.abs(matrix.elements[12]) > 40 && Math.abs(matrix.elements[14] - 150) > 40;
    });
    matrix.fromArray(instance.matrices, plantIndex * 16);
    const px = matrix.elements[12], pz = matrix.elements[14];
    const testPlant = world.placeBuilding({ type: 'tower', x: px, z: pz, w: 7 });
    instance.mesh.getMatrixAt(plantIndex, matrix);
    check(matrix.elements[0] === 0 && matrix.elements[5] === 0, 'Plant instance inside footprint hidden');
    world.removeBuilding(testPlant);
    instance.mesh.getMatrixAt(plantIndex, matrix);
    check(Math.abs(matrix.elements[0] - instance.matrices[plantIndex * 16]) < 1e-6, 'Plant instance restored on delete');
    click('#drawRoad'); groundClick(-175, 53); groundClick(-145, 55); groundClick(-115, 52); key('Enter');
    check(world.roads.length === 1 && world.roads[0].points.length === 3, 'Road finished with Enter');
    click('#drawRoad'); groundClick(-110, 53); groundClick(-85, 53); canvas.dispatchEvent(new MouseEvent('dblclick'));
    check(world.roads.length === 2, 'Road finished with double-click');
    click('#drawRoad'); groundClick(-75, 52); groundClick(-60, 52); key('Escape');
    check(world.roads.length === 2, 'Esc cancels unfinished road');
    click('#undoRoad'); check(world.roads.length === 1, 'Remove last road');
    const road = world.roads[0].obj.geometry.attributes.position;
    check(Math.abs(road.getY(6) - terrainHeight(road.getX(6), road.getZ(6)) - 0.06) < 1e-4, 'Road follows terrain');
    key('KeyG');
    check(game.active, 'G enters play mode');
    const rect = shop.additions.rects[0];
    game.pos.set(rect.cx + rect.bx * (rect.hz + 2), shop.pad.y, rect.cz + rect.bz * (rect.hz + 2));
    for (let i = 0; i < 180; i++) game._move(-rect.bx * 0.05, -rect.bz * 0.05, 0.35);
    const distance = (game.pos.x - rect.cx) * rect.bx + (game.pos.z - rect.cz) * rect.bz;
    check(distance >= rect.hz + 0.34, 'Player walking into rotated shop is stopped at wall');
    key('KeyG'); check(!game.active, 'G exits play mode');
    world.placeProp('crate', -150, 60, 0.3);
    const saved = JSON.stringify(app.projectData());
    click('#projSave');
    const file = new File([saved], 'build-mode-test.json', { type: 'application/json' });
    const transfer = new DataTransfer(); transfer.items.add(file);
    const input = document.querySelector('#projFile'); input.files = transfer.files;
    await input.onchange({ target: input });
    check(world.buildings.length === 7 && world.roads.length === 1 && world.placed.some((p) => p.type === 'crate'), 'Save project + reopen file handler restores buildings, road and prop');
    check(JSON.stringify(app.projectData().layout) === JSON.stringify(JSON.parse(saved).layout), 'Project layout exact round trip');
    check(JSON.parse(localStorage.getItem('dh.layout')).length === 9, 'Local storage contains all layout types');
    const target = world.buildings[3];
    groundClick(target.spec.x, target.spec.z - 3, target.pad.y + 2, false);
    check(!document.querySelector('#deleteBuilding').disabled, 'Click selects placed building');
    key('Delete'); check(world.buildings.length === 6, 'Delete key removes selection');
    const target2 = world.buildings[2];
    groundClick(target2.spec.x, target2.spec.z - 3, target2.pad.y + 2, false);
    click('#deleteBuilding'); check(world.buildings.length === 5, 'Delete button removes selection');
    app.loadProject({ ...original, layout: [] });
    check(world.colliders.rects.length === base.rects && world.colliders.circles.length === base.circles && world.floors.length === base.floors && world.walkables.length === base.walkables && world.emitters.length === base.emitters && world.spinners.length === base.spinners && world.windowMats.length === base.windows && window.__life.pois.length === base.pois, 'Deletion/reload cleans up physics, porches, smoke, spinners, windows and destinations');
    const details=['gardenFence','vegetablePatch','flowerBox','laundryLine','waterWell','woodPile','mailbox','lanternString','gardenBench','snowman','pumpkinPile','littleBridge'];
    app.applyStyle('film');
    const countPhysics=()=>[world.colliders.rects.length,world.colliders.circles.length,world.floors.length,world.walkables.length,window.__life.pois.length].join(',');
    const clean=countPhysics();
    for(const [i,type]of details.entries()) {
      const before=countPhysics();click(`[data-build="${type}"]`);
      check(countPhysics()===before,`${type}: preview does not register physics`);
      key('KeyR');groundClick(-170+i%4*12,118+Math.floor(i/4)*10);key('Escape');
      const e=world.buildings.at(-1);
      check(e.spec.type===type&&e.spec.yaw!==0,`${type}: editor places and rotates`);
      check(e.additions.rects.length>0&&!window.__life.pois.includes(e.poi),`${type}: collider without a doorway destination`);
      check(e.pad.hx<5&&e.pad.hz<6,`${type}: compact footprint`);
      if(type==='littleBridge')check(e.additions.walkables.length===1&&Math.abs(walkHeight(e.spec.x,e.spec.z)-e.additions.floors[0].y)<1e-6,'Little bridge: deck is walkable between side rails');
    }
    await nextFrame();
    const detailLayout=JSON.stringify(world.layout()), savedDetails=app.projectData();app.loadProject(savedDetails);
    check(JSON.stringify(world.layout())===detailLayout,'All twelve detail types round trip through project layout');
    for(const style of Object.keys(STYLES)){app.applyStyle(style);await nextFrame();check(world.buildings.length===12,`${style}: all detail pieces remain present`);}
    const selected=world.buildings.find(e=>e.spec.type==='mailbox');world.removeBuilding(selected);
    check(world.buildings.length===11&&!world.colliders.rects.includes(selected.additions.rects[0]),'Individual detail removal cleans collider');
    const confirm=window.confirm;try{window.confirm=()=>true;click('#clearBuilt');}finally{window.confirm=confirm;}
    check(world.buildings.length===0&&countPhysics()===clean,'Remove all built clears detail physics, bridge floors and walkables');
    await checkBuildReplay(app,check);
    return { passed: results.length, results };
  } finally {
    document.title = originalTitle;
    app.loadProject(original);
    if (originalLayout === null) localStorage.removeItem('dh.layout'); else localStorage.setItem('dh.layout', originalLayout);
  }
}

export async function checkBuildReplay(app=window.__app,report) {
  const {world:w,director:d,timeline:tl}=app,original=app.projectData(),previousShot=d.customShot,results=[],oldSpeed=localStorage.getItem('dh.replaySpeed'),speedInput=document.querySelector('#replaySpeed'),speedBefore=speedInput.value,loopBefore=tl.loop;
  const check=(ok,message)=>{if(!ok)throw Error(message);results.push(message);report?.(ok,message);};
  try {
    app.loadProject({...original,layout:[]});
    w.placeProp('crate',-130,-110,0.3);w.addRoad([[-136,-100],[-116,-100]],3);w.placeBuilding({type:'flowerBox',x:-120,z:-110,w:10});w.addFence([[-138,-115],[-110,-115]]);
    const saved=JSON.stringify(w.layout());check(w.layout().map(e=>e.kind||e.type).join(',')==='crate,road,building,fence','Replay saves mixed chronological placement order');
    w.loadLayout(JSON.parse(saved));check(JSON.stringify(w.layout())===saved,'Replay order survives exact mixed layout round trip');
    const legacy=[{kind:'road',points:[[-136,-100],[-116,-100]],width:3},{type:'crate',x:-130,z:-110,yaw:0},{kind:'building',type:'flowerBox',x:-120,z:-110,w:10}];
    w.loadLayout(legacy);check(w.layout().map(e=>e.kind||e.type).join(',')==='road,crate,building','Legacy layout order follows saved array order');w.loadLayout(JSON.parse(saved));
    const entries=w.buildEntries(),transforms=entries.map(e=>({parent:e.obj.parent,p:e.obj.position.clone(),q:e.obj.quaternion.clone(),s:e.obj.scale.clone()}));
    const keys=['rects','circles','segs','floors','walkables','emitters','spinners','windowMats','benches','buildingPOIs'],physics=keys.map(k=>[k,[...w._replayList(k)]]);
    check(w.beginBuildReplay(2),'Replay begins with placed pieces');
    check(w.buildReplay.items.every(i=>!i.wrapper.visible),'Replay initially hides every built object');
    check(w.buildReplay.physics.every(p=>!w._replayList(p.key).includes(p.value)),'Hidden pieces remove their owned physics and destinations');
    w.updateBuildReplay(0.6);check(w.buildReplay.items.filter(i=>i.wrapper.visible).length===1&&w.buildSparkles.count>0,'First piece appears alone with soft sparkles');
    w.updateBuildReplay(2.5);check(w.buildReplay.items.every(i=>i.wrapper.visible&&Math.abs(i.wrapper.scale.x-1)<1e-9),'Every piece settles at original scale');
    check(w.buildReplay.physics.every(p=>p.index<0||w._replayList(p.key).includes(p.value)),'Revealed pieces restore their owned physics');
    w.updateBuildReplay(0.4);const seek=[w.buildReplay.items[0].wrapper.scale.x,...w.buildSparkles.instanceMatrix.array.slice(0,w.buildSparkles.count*16)];w.updateBuildReplay(1.4);w.updateBuildReplay(0.4);
    check(JSON.stringify(seek)===JSON.stringify([w.buildReplay.items[0].wrapper.scale.x,...w.buildSparkles.instanceMatrix.array.slice(0,w.buildSparkles.count*16)]),'Replay seeking exactly reproduces pop and sparkles');
    let gentle=true;for(let t=0.25;t<1;t+=0.025){w.updateBuildReplay(t);if(w.buildReplay.items[0].wrapper.scale.x>1.15)gentle=false;}check(gentle,'Settle bounce stays small');
    w.endBuildReplay();check(JSON.stringify(w.layout())===saved,'Stopping replay preserves saved layout');
    check(entries.every((e,i)=>e.obj.parent===transforms[i].parent&&e.obj.position.distanceTo(transforms[i].p)<1e-8&&e.obj.quaternion.angleTo(transforms[i].q)<1e-7&&e.obj.scale.distanceTo(transforms[i].s)<1e-8),'Stopping replay restores exact transforms and parents');
    check(physics.every(([k,a])=>a.length===w._replayList(k).length&&a.every((v,i)=>v===w._replayList(k)[i])),'Stopping replay restores physics arrays in their original order');
    const custom={name:'Saved camera',duration:10,sample(t,out){out.pos.set(0,20,0);out.look.set(0,0,10);}};d.customShot=custom;const keysBefore=JSON.stringify(app.projectData().keys);
    tl.loop=false;tl.clips=[{shot:0,seconds:0.5,mood:'golden',move:'cut'},{shot:'buildReplay',seconds:1,replaySpeed:3,mood:'keep',move:'cut'},{shot:2,seconds:0.5,mood:'keep',move:'cut'}];tl.start(1);
    check(tl.index===1&&d.shot.name==='Replay build','Replay starts without replacing other timeline clips');
    check(d.state.pos.distanceTo(d.state.look)>10,'Replay camera focuses at the actual build distance');
    tl.update(0.4);d.update(0);const camera=d.state.pos.clone();tl.t=1.3;tl.update(0);d.update(0);tl.t=0.9;tl.update(0);d.update(0);check(d.state.pos.distanceTo(camera)<1e-8,'Replay camera seek is deterministic');
    check(tl.toJSON()[1].replaySpeed===3&&Math.abs(tl.duration(tl.clips[1])-(4/3+1))<1e-8,'Render clip preserves speed and derives exact duration');
    tl.t=0.5+tl.duration(tl.clips[1])+0.1;tl.update(0);check(tl.index===2&&d.index===2&&d.customShot===custom&&!w.buildReplay,'Ordinary clip after replay restores custom camera');tl.stop();
    check(JSON.stringify(app.projectData().keys)===keysBefore,'Replay preserves user camera keys');
    tl.clips=[{shot:0,seconds:0.5,mood:'keep',move:'cut'}];document.querySelector('#replayBuild').click();check(tl.playing&&tl.clips.length===2&&tl.clips[1].shot==='buildReplay','Replay button appends a clip while preserving the timeline');
    speedInput.value=5;speedInput.dispatchEvent(new Event('input'));check(tl.clips[1].replaySpeed===5&&Math.abs(tl.duration(tl.clips[1])-1.8)<1e-8,'Replay speed slider updates rate and duration');
    const replayProject=app.projectData();app.loadProject(replayProject);check(tl.clips[1].replaySpeed===5&&tl.clips[1].shot==='buildReplay','Replay clip survives project save/load');
    document.querySelector('#replayBuild').click();check(tl.playing&&tl.clips.length===2,'Replay button reuses the saved replay clip');document.querySelector('#replayBuild').click();check(!tl.playing&&!w.buildReplay&&d.customShot===custom,'Stop replay button restores the saved camera');
    let clipShot=document.querySelector('#clips [data-k=shot]');clipShot.value='buildReplay';clipShot.dispatchEvent(new Event('change'));check(document.querySelector('#clips [data-k=seconds]').disabled,'Selecting replay clip makes its duration automatic');clipShot=document.querySelector('#clips [data-k=shot]');clipShot.value='0';clipShot.dispatchEvent(new Event('change'));check(!document.querySelector('#clips [data-k=seconds]').disabled,'Selecting ordinary shot makes seconds editable again');
    w.loadLayout([]);const road=w.addRoad([[-136,-100],[-116,-100]],3);tl.clips=[{shot:'buildReplay',replaySpeed:2,seconds:1,mood:'keep',move:'cut'}];tl.start();
    const confirm=window.confirm;try{window.confirm=()=>true;document.querySelector('#clearBuilt').click();}finally{window.confirm=confirm;}
    check(!w.roads.length&&!road.obj.parent&&!w.buildReplay,'Remove all safely clears a road-only replay');tl.update(0);
    const road2=w.addRoad([[-136,-100],[-116,-100]],3);tl.start();document.querySelector('#undoRoad').click();check(!w.roads.length&&!road2.obj.parent&&!w.buildReplay,'Undo road safely removes its replay wrapper');tl.update(0);
    const prop=w.placeProp('crate',-130,-110);tl.start();w.undo();check(!w.placed.includes(prop)&&!prop.obj.parent&&!w.buildReplay,'Undo prop works during replay');tl.update(0);
    w.placeProp('crate',-130,-110);tl.start();w.updateTerrain();check(!w.buildReplay&&w.placed[0].obj.parent===w.root,'Terrain updates restore temporary replay transforms first');tl.update(0);
    check(app.audio.ctx===null,'Replay never starts sound');return {passed:results.length,results};
  } finally {tl.stop();d.customShot=previousShot;app.loadProject(original);tl.loop=loopBefore;speedInput.value=speedBefore;speedInput.nextElementSibling.textContent=speedBefore;if(oldSpeed===null)localStorage.removeItem('dh.replaySpeed');else localStorage.setItem('dh.replaySpeed',oldSpeed);}
}
