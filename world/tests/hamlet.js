import { HAMLET } from '../src/hamlet.js';
import { VIDEO_PRESETS } from '../src/presets.js';

export async function runHamletTests() {
  const a = window.__app, life = window.__life, w = a.world, h = w.hamlet;
  const original = a.projectData(), saved = new Map(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)]));
  const restartMusic = a.audio.restartMusic;
  a.audio.restartMusic = () => {}; // A preset must not restart a user's loaded track during tests.
  const results = [], check = (ok, message) => { if (!ok) throw new Error(message); results.push(message); };
  const toggle = on => { const el = document.querySelector('[data-life-check="hamlet"]'); el.checked = on; el.dispatchEvent(new Event('change')); };
  try {
    toggle(true);
    check(h.visible && h.buildings.length === 7 && h.props.filter(p => p.type === 'bench').length === 2, 'Hamlet enabled with seven buildings and two benches');
    check(w.layout().every(e => !HAMLET.buildings.some(s => e.x === s.x && e.z === s.z)), 'Built-in hamlet excluded from saved layout');
    for (const e of h.buildings) {
      check(!w._reserved(e.spec.x, e.spec.z, 10), `${e.spec.type}: clear of reserved landmarks`);
      check(e.additions.rects.length + e.additions.circles.length > 0, `${e.spec.type}: colliders present`);
      w.removeBuilding(e);
      check(e.obj.parent && e.obj.visible, `${e.spec.type}: protected from user deletion`);
    }
    check(life.hamletWalkers.length === 6 && life.hamletWalkers.every(p => p.pois === h.pois), 'Six walkers use only hamlet destinations');
    for (let frame = 0; frame < 3600; frame++) for (const p of life.hamletWalkers) p.update(1 / 30, frame / 30);
    check(life.hamletWalkers.every(p => Math.hypot(p.pos.x - HAMLET.x, p.pos.z - HAMLET.z) < 55), 'Walkers stay in hamlet over two simulated minutes');
    const rects = w.colliders.rects.length, floors = w.floors.length;
    toggle(false);
    check(h.buildings.every(e => !e.obj.visible) && h.props.every(e => !e.obj.visible) && h.roads.every(e => !e.obj.visible), 'Toggle hides all hamlet scenery');
    check(life.hamletWalkers.every(p => !p.p.g.visible), 'Toggle hides hamlet walkers');
    check(h.props.filter(p => p.light).every(p => !p.light.light.visible), 'Toggle switches off hamlet lantern lights');
    check(w.colliders.rects.length < rects && w.floors.length < floors, 'Hidden hamlet removes physics');
    toggle(true);
    check(w.colliders.rects.length === rects && w.floors.length === floors, 'Toggle restores physics exactly');
    w.loadLayout(w.layout());
    check(h.buildings.every(e => e.obj.parent && e.obj.visible), 'Project layout reload preserves hamlet');
    const oldNames = ['Town Square 360°','Arrival','Saloon → Sheriff','Boardwalk Stroll','Church Approach','Crane Reveal','Golden Orbit','Hilltop Vista','Mill Wheel','Bridge Crossing','River Drift','Station Platform','Trackside','Ranch Overlook','Corral Orbit','Forest Camp','Valley Journey','Through the Doors','At the Bar','Card Game','Meet the Cast'];
    check(oldNames.every((n,i) => a.director.shots[i].name === n), 'All original shot indices unchanged');
    check(a.director.shots.slice(21).length === 3 && a.director.shots.slice(21).every(s => s.group === 'Willow Creek'), 'Three appended hamlet shots');
    check(VIDEO_PRESETS.villageDusk.clips.reduce((n,c) => n+c.seconds,0) === 270, 'Village preset lasts four and a half minutes');
    // Synthetic click deliberately does not unlock audio.
    [...document.querySelectorAll('#videoPresets button')].find(b => b.textContent.includes('Village at dusk')).click();
    check(a.timeline.playing && a.director.index === 21 && a.atmos.key === 'villageDusk', 'Preset button loads and starts dusk timeline');
    a.timeline.update(91);
    check(a.director.index === 22, 'Preset advances to chapel arc');
    a.timeline.update(91);
    check(a.director.index === 23, 'Preset advances to establishing pan');
    return { passed: results.length, results };
  } finally {
    a.audio.restartMusic = restartMusic;
    a.timeline.stop(); a.loadProject(original);
    for (const k of Object.keys(localStorage)) if (!saved.has(k)) localStorage.removeItem(k);
    for (const [k,v] of saved) localStorage.setItem(k,v);
  }
}
