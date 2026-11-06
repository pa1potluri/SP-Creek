import * as THREE from 'three';

// A small personal home kept separate from the editable Build layout. Its choices live in
// local storage, so loading somebody else's project never removes a child's cottage.
const KEY = 'sp-creek.my-cottage.v1';
// A small clear meadow just beyond the town, close enough to reach without crossing water or rails.
const HOME = { x: -40, z: 35, yaw: Math.PI, w: 8 };
const PALETTES = {
  wall: [[48, 34, 82], [28, 38, 78], [8, 38, 84], [320, 25, 86]],
  roof: ['#a94d3e', '#456b85', '#6f7d48', '#8a623f'],
  door: ['#8a4f2d', '#4e7790', '#6e7f45', '#8d4e6d'],
};
const defaults = { wall: 0, roof: 0, door: 0, flowers: false, bench: false };

const read = () => {
  try { return { ...defaults, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; }
  catch { return { ...defaults }; }
};
const write = (state) => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private browsing */ } };

export function buildMyCottage(world) {
  let state = read(), home = null, garden = [], visible = true;
  // Keep a small front garden and its arrival view clear in every vegetation style.
  world.registerAreaPad({x:HOME.x+4,z:HOME.z-7,hx:16,hz:20,blend:0,clearOnly:true});
  const remove = () => {
    if (home) {
      // It deliberately stays out of the editable Build collection, so temporarily restore it
      // only while World performs its normal collider/light cleanup.
      if (!world.buildings.includes(home)) world.buildings.push(home);
      world.removeBuilding(home); home = null;
    }
    for (const piece of garden) world._remove(piece);
    garden = [];
  };
  const roofAndDoor = () => {
    const roof = PALETTES.roof[state.roof], door = PALETTES.door[state.door];
    home.obj.traverse((node) => {
      if (!node.isMesh || node.geometry.type !== 'CylinderGeometry') return;
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats[0] = mats[0].clone(); mats[0].color.set(roof); node.material = mats;
    });
    // The little overlay makes the chosen door colour clear without changing shared building materials.
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.25, 2.35, 0.08), new THREE.MeshLambertMaterial({ color: door }));
    panel.name = 'My Cottage chosen door'; panel.position.set(0, 1.32, 0.19); panel.castShadow = true; home.obj.add(panel);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf1cb65 }));
    knob.position.set(0.36, 1.33, 0.245); home.obj.add(knob);
  };
  const decorate = () => {
    if (state.flowers) {
      garden.push(world.placeProp('flowerBox', HOME.x - 2.7, HOME.z + 2.15, 0, false));
      garden.push(world.placeProp('flowerBox', HOME.x + 2.7, HOME.z + 2.15, 0, false));
    }
    if (state.bench) garden.push(world.placeProp('gardenBench', HOME.x + 4.7, HOME.z + 0.4, -Math.PI / 2, false));
  };
  const rebuild = () => {
    remove();
    home = world.placeBuilding({ type: 'house', ...HOME, wall: PALETTES.wall[state.wall], sign: 'MY COTTAGE', signCustom: true });
    home.cottage = true;
    // This personal save must not alter Build mode's shared layout or its undo/count behaviour.
    world.buildings.splice(world.buildings.indexOf(home), 1);
    roofAndDoor(); decorate(); world.updateTerrain();
    home.obj.visible=visible;for(const piece of garden)piece.obj.visible=visible;
    return home;
  };
  const change = (key, value) => { state = { ...state, [key]: value }; write(state); rebuild(); };
  rebuild();
  return {
    get state() { return { ...state }; },
    setVisible(on) { visible=!!on;home.obj.visible=visible;for(const piece of garden)piece.obj.visible=visible; },
    rebuild,
    setWall: (value) => change('wall', value),
    setRoof: (value) => change('roof', value),
    setDoor: (value) => change('door', value),
    setFlowers: (value) => change('flowers', !!value),
    setBench: (value) => change('bench', !!value),
    get home() { return home; },
  };
}
