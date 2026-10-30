import * as THREE from 'three';
import { terrainHeight } from '../src/world.js';
import { STYLES } from '../src/styles.js';

// Run in the browser: await (await import('/tests/props-placeable.js')).runPropsPlaceableTests()
// Every picture-collection card that is not a whole-scene artwork places a real piece.
export async function runPropsPlaceableTests() {
  const app = window.__app, { world, camera } = app;
  const original = JSON.parse(JSON.stringify(app.projectData())), originalLayout = localStorage.getItem('dh.layout');
  const results = [], check = (ok, message) => { if (!ok) throw new Error(message); results.push(message); };
  const canvas = document.querySelector('#view'), key = code => window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
  const groundClick = (x, z) => {
    const y = terrainHeight(x, z);
    camera.position.set(x + 2, y + 50, z + 25); camera.lookAt(x, y, z); camera.updateMatrixWorld(true);
    const p = new THREE.Vector3(x, y, z).project(camera), r = canvas.getBoundingClientRect();
    const event = { clientX: r.left + (p.x + 1) / 2 * r.width, clientY: r.top + (1 - p.y) / 2 * r.height, button: 0, bubbles: true };
    for (const type of ['pointermove', 'pointerdown', 'pointerup']) canvas.dispatchEvent(new PointerEvent(type, event));
  };
  const physics = () => [world.colliders.rects, world.colliders.circles, world.floors, world.walkables, world.emitters, world.flames].map(a => a.length).join();
  const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  try {
    app.loadProject({ ...original, layout: [] });
    const entries = await (await fetch('/assets/ui/asset-pack/catalogue.json')).json();
    const art = entries.filter(e => e.artwork), cards = entries.filter(e => !e.artwork);
    check(art.length === 6 && cards.every(e => e.build), `${cards.length} cards have a piece, ${art.length} are scene pictures`);
    const clean = physics(), x = -180, z = 35;
    let rotated = false;
    for (const item of cards) {
      const button = document.querySelector(`#buildCatalogue [data-build="${item.build}"]`);
      check(!!button, `${item.label}: Build button`);
      button.click();
      if (!rotated) { key('KeyR'); canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, cancelable: true })); rotated = true; }
      groundClick(x, z); key('Escape');
      const e = world.buildings.at(-1);
      check(world.buildings.length === 1 && e.spec.type === item.build, `${item.label}: placed through canvas`);
      check(Math.abs(e.spec.yaw) > 0.1 && Math.abs(e.obj.rotation.y - e.spec.yaw) < 1e-6, `${item.label}: rotates with R/wheel`);
      const box = new THREE.Box3().setFromObject(e.obj);
      check(box.min.y < e.pad.y + 0.35 && box.min.y > e.pad.y - 3 && box.max.y > e.pad.y + 0.05, `${item.label}: sits on the ground, not floating`);
      // Ground cover (flowers, mushrooms, a little stump) is walk-through on purpose.
      check(e.additions.rects.length + e.additions.circles.length + e.additions.floors.length > 0 || ['meadowFlowers', 'mushrooms', 'smallStump'].includes(item.build), `${item.label}: collider or walkable top`);
      for (const f of e.additions.floors) check(f.y >= e.pad.y && f.y < e.pad.y + 3, `${item.label}: sensible walkable top`);
      const layout = world.layout();
      world.loadLayout(JSON.parse(JSON.stringify(layout)));
      const again = world.buildings.at(-1);
      check(world.buildings.length === 1 && again.spec.type === item.build && Math.abs(again.spec.yaw - e.spec.yaw) < 1e-9, `${item.label}: saves and reloads`);
      world.removeBuilding(again);
      check(world.buildings.length === 0 && physics() === clean, `${item.label}: removes cleanly`);
    }
    // All pieces together render in every art style and replay as a build.
    cards.forEach((item, i) => world.placeBuilding({ type: item.build, x: -200 + (i % 8) * 7, z: 20 + Math.floor(i / 8) * 7, yaw: i * 0.4 }, false));
    world.updateTerrain();
    for (const style of Object.keys(STYLES)) { app.applyStyle(style); await frame(); }
    check(true, 'All pieces render in every art style');
    check(world.beginBuildReplay(4) && world.replayDuration(4) > cards.length / 4, 'Build replay includes every piece');
    world.endBuildReplay();
    return { passed: results.length, results };
  } finally {
    app.loadProject(original);
    if (originalLayout === null) localStorage.removeItem('dh.layout'); else localStorage.setItem('dh.layout', originalLayout);
  }
}
