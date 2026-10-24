import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { TexturePass } from 'three/addons/postprocessing/TexturePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { World, riverZ, RAIL_X, terrainHeight } from './world.js';
import { createSky, createMountains } from './sky.js';
import { Atmosphere, PRESETS } from './atmosphere.js';
import { OilShader, LookShader, FinalShader } from './painterly.js';
import { STYLES } from './styles.js';
import { Seasons } from './seasons.js';
import { buildSunsetCove } from './areas/sunset-cove.js';
import { buildPlayground } from './areas/playground.js';
import * as T from './textures.js';
import { Director } from './camera.js';
import { AudioEngine } from './audio.js';
import { Recorder } from './recorder.js';
import { Timeline } from './timeline.js';
import { Life } from './life.js';
import { Game } from './game.js';
import { CafeInterior } from './interior.js';
import { tickCharacters } from './characters.js';
import { VIDEO_PRESETS, BASE_LIFE } from './presets.js';
import { encodeVideo } from './exporter.js';
import { putFile, getFile, deleteFile } from './store.js';
import { DEFAULT_FAMILY_MODE } from './family.js';
import { buildTownCenter } from './areas/town-center.js';
import { buildGhostTown } from './areas/ghost-town.js';
import { buildForest } from './areas/forest.js';
import { buildMeadowLake } from './areas/meadow-lake.js';
import { buildCrystalMine } from './areas/crystal-mine.js';

const $ = (s) => document.querySelector(s);
const LS = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

// ---------- scene ----------
const canvas = $('#view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 4000);
const sky = createSky();
const mountains = createMountains();
scene.add(sky, mountains.group);
// Painted textures (e.g. made in ChatGPT) in assets/textures/oil/ and assets/textures/clean/
// replace the built-in ones; the art style picks which set is shown.
const painted = { oil: {}, clean: {} };
const TEXTURE_NAMES = ['log_wall', 'brick_wall', 'barn_boards', 'chapel_boards', 'house_boards', 'window', 'door', 'wall_boards', 'wallpaper', 'floor', 'roof', 'dark_wood', 'meadow', 'road', 'boards', 'stone', 'backdrop'];
await Promise.all(Object.keys(painted).flatMap((set) => TEXTURE_NAMES.map((name) => new Promise((done) => {
  const img = new Image();
  img.onload = () => { painted[set][name] = img; done(); };
  img.onerror = done; // not there yet: keep the code-made texture
  img.src = `assets/textures/${set}/${name}.png`;
}))));
// painted plant cut-outs: assets/foliage/<set>/<name>.png
await Promise.all(Object.keys(painted).flatMap((set) => ['cottonwood', 'pine', 'bush', 'grass', 'flowers', 'cactus'].map((name) => new Promise((done) => {
  const img = new Image();
  img.onload = () => { (painted[set].foliage ??= {})[name] = img; done(); };
  img.onerror = done;
  img.src = `assets/foliage/${set}/${name}.png`;
}))));
const world = new World(scene, painted);
const atmos = new Atmosphere(scene, renderer, world, sky, mountains);
const director = new Director(camera, canvas);
const audio = new AudioEngine();
const recorder = new Recorder();
const timeline = new Timeline(director, atmos);
const life = new Life(scene, world);
const game = new Game({ scene, camera, canvas, world, life, director });
const cafe = new CafeInterior(world);
const townCenter = buildTownCenter(world, life);
const ghostTown = buildGhostTown(world);
const forest = buildForest(world);
const meadowLake = await buildMeadowLake(world);
const crystalMine = buildCrystalMine(world);
const sunsetCove=await buildSunsetCove(world,life);
const playground=buildPlayground(world,life);
const seasons=new Seasons(world,atmos,{forest,meadowLake});
function setSeason(key,save=false){seasons.set(key);$('#season').value=seasons.key;if(save)LS.set('dh.season',seasons.key);}
$('#season').onchange=()=>setSeason($('#season').value,true);
setSeason(LS.get('dh.season')||'summer');
function setWeather(key,save=false){atmos.setWeather(key);$('#weather').value=atmos.weather;if(save)LS.set('dh.weather',atmos.weather);}
$('#weather').onchange=()=>setWeather($('#weather').value,true);
setWeather(LS.get('dh.weather')||'auto');
function setFestival(on,save=false){atmos.festival=world.festival=!!on;$('#festival').checked=atmos.festival;if(save)LS.set('dh.festival',atmos.festival);}
$('#festival').onchange=()=>setFestival($('#festival').checked,true);
setFestival(LS.get('dh.festival')??false);
let familyMode = DEFAULT_FAMILY_MODE;
// Saved only when the user flips the switch, so the default can still change later. (The old key
// 'dh.familyMode' was written on every load, not chosen, so it is ignored.)
function setFamilyMode(on, save = false) {
  familyMode = !!on;
  $('#familyMode').checked = familyMode;
  world.setFamilyMode(familyMode); life.setFamilyMode(familyMode); cafe.setFamilyMode(familyMode);
  townCenter.setFamilyMode(familyMode);
  if (save) LS.set('dh.familyChoice', familyMode);
  document.dispatchEvent(new Event('familymodechange'));
}
$('#familyMode').onchange = () => setFamilyMode($('#familyMode').checked, true);
setFamilyMode(LS.get('dh.familyChoice') ?? DEFAULT_FAMILY_MODE);

// The scene renders into its own target so the style passes can also read its depth.
// render → tone map → brush (Kuwahara) → art style → anti-alias → finish & grade
const sceneRT = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, depthTexture: new THREE.DepthTexture(2, 2) });
const composer = new EffectComposer(renderer);
composer.addPass(new TexturePass(sceneRT.texture));
composer.addPass(new OutputPass());
const oil = new ShaderPass(OilShader);
const look = new ShaderPass(LookShader);
const fxaa = new ShaderPass(FXAAShader);
const fin = new ShaderPass(FinalShader);
look.uniforms.tDepth.value = sceneRT.depthTexture;
look.uniforms.uNear.value = camera.near;
look.uniforms.uFar.value = camera.far;
composer.addPass(oil);
composer.addPass(look);
composer.addPass(fxaa);
composer.addPass(fin);

let outputSize = 'window';
// fw/fh force an exact size (used while rendering a video)
function resize(fw, fh) {
  let w, h;
  if (fw) {
    [w, h] = [fw, fh];
    const s = Math.min(innerWidth / w, innerHeight / h);
    Object.assign(canvas.style, { width: `${w * s}px`, height: `${h * s}px`, left: `${(innerWidth - w * s) / 2}px`, top: `${(innerHeight - h * s) / 2}px` });
  } else if (outputSize === 'window') {
    w = Math.max(2, innerWidth);
    h = Math.max(2, innerHeight);
    Object.assign(canvas.style, { width: '100vw', height: '100vh', left: '0px', top: '0px' });
  } else {
    [w, h] = outputSize === '1080p' ? [1920, 1080] : [1280, 720];
    const s = Math.min(innerWidth / w, innerHeight / h);
    Object.assign(canvas.style, { width: `${w * s}px`, height: `${h * s}px`, left: `${(innerWidth - w * s) / 2}px`, top: `${(innerHeight - h * s) / 2}px` });
  }
  renderer.setSize(w, h, false);
  sceneRT.setSize(w, h);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  for (const p of [oil, look, fin]) p.uniforms.uRes.value.set(w, h);
  fxaa.uniforms.resolution.value.set(1 / w, 1 / h);
  atmos.setViewport(h, camera.fov);
}
addEventListener('resize', () => { if (!exporting) resize(); });

// Painted cut-outs (transparent PNGs from ChatGPT) in assets/cutouts/ stand around the cafe.
const CUTOUTS = [
  { file: 'lady', x: 6.4, z: 13.2, h: 1.72 },
  { file: 'horse', x: 2.6, z: 13.8, h: 2.2 },
];
for (const c of CUTOUTS) {
  const img = new Image();
  img.onload = () => {
    const tex = T.imageTexture(img);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; // no bleeding at the transparent edges
    world.placeCutout(tex, img.width / img.height, c.x, c.z, c.h);
  };
  img.src = `assets/cutouts/${c.file}.png`; // missing files are simply skipped
}

// ---------- saved state ----------
world.loadLayout(LS.get('dh.layout') || []);
for (const [pos, look] of LS.get('dh.keys') || []) director.custom.push({ pos: new THREE.Vector3(...pos), look: new THREE.Vector3(...look) });
const saveLayout = () => LS.set('dh.layout', world.layout());
const saveKeys = () => LS.set('dh.keys', director.custom.map((k) => [k.pos.toArray(), k.look.toArray()]));

// ---------- sliders ----------
function bind(selector, attr, target, onChange) {
  document.querySelectorAll(selector).forEach((inp) => {
    const key = inp.dataset[attr], out = inp.parentElement.querySelector('output');
    const decimals = (inp.step.split('.')[1] || '').length;
    const apply = () => {
      target[key] = parseFloat(inp.value);
      if (out) out.textContent = (+inp.value).toFixed(decimals);
      if (onChange) onChange(key, target[key]);
    };
    inp.addEventListener('input', apply);
    apply();
  });
}
const paint = {};
bind('[data-paint]', 'paint', paint);
bind('[data-cam]', 'cam', director);
$('#cloudShadows').value = LS.get('dh.cloudShadows') ?? 0.6;
bind('[data-atmos]', 'atmos', atmos.mult, (k,v) => { if (k === 'cloudShadows') LS.set('dh.cloudShadows',v); });
const audioLevels = {};
bind('[data-audio]', 'audio', audioLevels, (k, v) => (k === 'music' ? audio.setMusicVolume(v) : k === 'ambience' ? audio.setAmbience(v) : audio.setWind(v)));
// browsers only allow sound after a click: start the wind on the first one
// (only a real click: tests and automation dispatch synthetic events and must stay silent)
const startSound = (e) => {
  if (!e.isTrusted) return;
  removeEventListener('pointerdown', startSound);
  audio.ensure();
  audio.setWind(audioLevels.wind);
};
addEventListener('pointerdown', startSound);

// ---------- town life ----------
const lifeCheck = (k) => document.querySelector(`[data-life-check="${k}"]`);
function saveLife() { LS.set('dh.life', life.settings); }
function setLife(settings) {
  for (const [k, v] of Object.entries(settings || {})) {
    if (lifeCheck(k)) lifeCheck(k).checked = !!v;
    else setSlider('life', k, v);
    life.settings[k] = v;
  }
  life.apply();
  saveLife();
}
bind('[data-life]', 'life', life.settings, () => { life.apply(); saveLife(); });
document.querySelectorAll('[data-life-check]').forEach((el) => (el.onchange = () => {
  life.settings[el.dataset.lifeCheck] = el.checked ? 1 : 0;
  life.apply();
  saveLife();
}));

$('#castLineup').onchange = (e) => life.showCast(e.target.checked);
$('#meetCast').onclick = () => {
  $('#castLineup').checked = true;
  life.showCast(true);
  director.auto = false;
  director.play(director.shots.findIndex((s) => s.name === 'Meet the Cast'));
  refreshCamera();
};
$('#callTrain').onclick = () => {
  if (!life.train) return flash('Turn the steam train on first');
  life.train.call();
  flash('The train is on its way to the station');
};

// ---------- art style ----------
const lookParams = {};
bind('[data-look]', 'look', lookParams);
function setSlider(attr, key, value) {
  const inp = document.querySelector(`[data-${attr}="${key}"]`);
  if (!inp) return;
  inp.value = value;
  inp.dispatchEvent(new Event('input'));
}
let styleKey = 'oil';
const styleButtons = Object.entries(STYLES).map(([key, s]) => {
  const b = document.createElement('button');
  b.textContent = s.label;
  b.onclick = () => { applyStyle(key); LS.set('dh.styleChoice', key); };
  $('#styles').append(b);
  return [key, b];
});
function applyStyle(key) {
  const s = STYLES[key] || STYLES.oil;
  styleKey = STYLES[key] ? key : 'oil';
  for (const [k, v] of Object.entries(s.paint)) setSlider('paint', k, v);
  for (const [k, v] of Object.entries(s.look)) if (k !== 'mode') setSlider('look', k, v);
  look.uniforms.uMode.value = s.look.mode;
  look.enabled = s.look.mode !== 0;
  oil.enabled = s.paint.strength > 0;
  fxaa.enabled = s.fxaa;
  fin.uniforms.uWeave.value = s.weave;
  applyTextures();
  styleButtons.forEach(([k, b]) => b.classList.toggle('on', k === styleKey));
  document.querySelectorAll('[data-for]').forEach((row) => row.classList.toggle('off', !row.dataset.for.split(' ').includes(styleKey)));
}
// texture set: 'auto' follows the style; or force oil / clean / flat for every style
let textureSet = 'oil';
function applyTextures() {
  const choice = $('#texSet').value;
  textureSet = choice === 'auto' ? STYLES[styleKey].textures : choice;
  world.setTextureSet(textureSet);
  world.setPlants(STYLES[styleKey].plants, textureSet);
  LS.set('dh.texSet', choice);
  document.dispatchEvent(new Event('artstylechange'));
  queueMicrotask(updateStyleBackdrop); // the backdrop code further down may not have run yet
}
$('#texSet').value = LS.get('dh.texSet') || 'auto';
$('#texSet').onchange = applyTextures;
document.querySelector('[data-paint="strength"]').addEventListener('input', (e) => (oil.enabled = +e.target.value > 0));
// The kids' channel opens in the Animated-film look; a style is remembered only when the user picks
// one (the old key 'dh.style' was written on every load and by presets, so it is ignored).
applyStyle(LS.get('dh.styleChoice') || 'film');
setLife(LS.get('dh.life'));

// ---------- camera ----------
const shotButtons = director.shots.map((s, i) => {
  if (s.group !== director.shots[i - 1]?.group) {
    const h = document.createElement('div');
    h.className = 'group';
    h.textContent = s.group;
    $('#shots').append(h);
  }
  const b = document.createElement('button');
  b.textContent = `${i + 1}. ${s.name}`;
  b.onclick = () => { game.exit(); director.auto = false; director.play(i); };
  $('#shots').append(b);
  return b;
});
function refreshCamera() {
  shotButtons.forEach((b, i) => b.classList.toggle('on', director.mode === 'shot' && director.index === i));
  $('#freeBtn').classList.toggle('on', director.mode === 'free');
  $('#autoBtn').classList.toggle('on', director.auto);
  $('#pauseBtn').classList.toggle('on', director.paused);
  $('#keyCount').textContent = `${director.custom.length} key${director.custom.length === 1 ? '' : 's'} saved`;
  $('#shotName').textContent = director.label;
}
director.onChange = refreshCamera;
const toggleFree = () => {
  if (game.active) return game.exit(); // leaving the game lands in the free camera
  director.auto = false;
  director.setFree(director.mode !== 'free');
};
const togglePause = () => { director.paused = !director.paused; refreshCamera(); };
const addKey = () => { director.addKey(); saveKeys(); refreshCamera(); flash(`Key ${director.custom.length} added`); };
$('#freeBtn').onclick = toggleFree;
$('#pauseBtn').onclick = togglePause;
$('#autoBtn').onclick = () => {
  director.auto = !director.auto;
  if (director.auto && director.mode === 'free') director.setFree(false);
  refreshCamera();
};
$('#addKey').onclick = addKey;
$('#playKeys').onclick = () => { if (!director.playCustom()) flash('Add at least 2 keys first'); };
$('#clearKeys').onclick = () => { director.custom.length = 0; saveKeys(); refreshCamera(); };

// ---------- atmosphere ----------
const presetButtons = Object.entries(PRESETS).map(([key, p]) => {
  const b = document.createElement('button');
  b.textContent = p.label;
  b.onclick = () => { atmos.setPreset(key); presetButtons.forEach((x) => x.classList.toggle('on', x === b)); };
  $('#presets').append(b);
  if (key === atmos.key) b.classList.add('on');
  return b;
});

// ---------- placing objects ----------
let tool = null, cutout = null, down = null;
const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
const propButtons = [...document.querySelectorAll('[data-prop]')];
function setTool(t) {
  clearBuildPreview();
  roadPoints = [];
  tool = tool === t ? null : t;
  selectBuilding(null);
  buildButtons.forEach((b) => b.classList.toggle('on', `build:${b.dataset.build}` === tool));
  $('#drawRoad').classList.toggle('on', tool === 'road');
  $('#drawFence').classList.toggle('on', tool === 'fence');
  if (tool?.startsWith('build:')) refreshBuildGhost();
  propButtons.forEach((b) => b.classList.toggle('on', b.dataset.prop === tool));
  canvas.classList.toggle('placing', !!tool);
  showToolHint();
}
function showToolHint() {
  if (tool === 'road' || tool === 'fence') { $('#hint').textContent = 'Click ground points · Enter/double-click to finish · Esc to cancel'; return; }
  if (tool?.startsWith('build:')) { $('#hint').textContent = 'Click ground to build · R/wheel rotates · Esc stops'; return; }
  $('#hint').textContent = tool ? `Click the ground to place: ${tool === 'cutout' ? 'cut-out' : tool} (Esc to stop)` : '';
}
propButtons.forEach((b) => (b.onclick = () => setTool(b.dataset.prop)));
canvas.addEventListener('pointerdown', (e) => (down = { x: e.clientX, y: e.clientY }));
canvas.addEventListener('pointerup', (e) => {
  if (game.active || e.button !== 0 || !down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  if (!tool) {
    const selected = raycaster.intersectObjects([...world.buildings, ...world.fences].map((b) => b.obj), true)[0];
    selectBuilding(selected ? [...world.buildings, ...world.fences].find((b) => { let o = selected.object; while (o && o !== b.obj) o = o.parent; return o === b.obj; }) : null);
    return;
  }
  const hit = raycaster.intersectObjects(tool.startsWith('build:') || (tool === 'road' || tool === 'fence') ? [world.ground] : world.walkables, false)[0];
  if (!hit) return;
  if (tool.startsWith('build:')) {
    world.placeBuilding(buildSpec(hit.point)); saveLayout(); return;
  }
  if (tool === 'road' || tool === 'fence') {
    if (e.detail < 2 && (!roadPoints.length || Math.hypot(hit.point.x - roadPoints.at(-1)[0], hit.point.z - roadPoints.at(-1)[1]) > 0.2)) roadPoints.push([hit.point.x, hit.point.z]);
    previewRoad(); return;
  }
  if (tool === 'cutout') {
    if (cutout) {
      const e = world.placeCutout(cutout.tex, cutout.aspect, hit.point.x, hit.point.z, +$('#cutoutHeight').value);
      if ($('#cutoutWander').checked) e.obj.userData.wander = {};
    }
  } else {
    world.placeProp(tool, hit.point.x, hit.point.z, Math.random() * Math.PI * 2);
    saveLayout();
  }
});
$('#undoProp').onclick = () => { world.undo(); saveLayout(); };
$('#clearProps').onclick = () => { world.clearPlaced(); saveLayout(); };
const cutH = $('#cutoutHeight');
cutH.oninput = () => (cutH.nextElementSibling.textContent = (+cutH.value).toFixed(1));
cutH.oninput();

function loadImage(file, done) {
  const img = new Image();
  img.onload = () => {
    const tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    done(tex, img.width / img.height);
  };
  img.src = URL.createObjectURL(file);
}
$('#cutoutFile').onchange = (e) => {
  const f = e.target.files[0];
  if (!f) return;
  loadImage(f, (tex, aspect) => {
    cutout = { tex, aspect };
    tool = null;
    setTool('cutout');
  });
  e.target.value = '';
};

// ---------- build tools ----------
const buildButtons = [...document.querySelectorAll('[data-build]')];
document.addEventListener('familymodechange', () => { if (tool?.startsWith('build:')) refreshBuildGhost(); });
document.addEventListener('artstylechange', () => { if (tool?.startsWith('build:')) refreshBuildGhost(); });
let buildSignCustom = false;
let ghost = null, buildYaw = 0, groundPoint = null, selectedBuilding = null, selectionBox = null;
let roadPoints = [], roadPreview = null;
function buildSpec(p = { x: 0, z: 0 }) {
  return { type: tool.slice(6), x: p.x, z: p.z, yaw: buildYaw, w: +$('#buildWidth').value,
    floors: +$('#buildFloors').value, wall: $('#buildWall').value.split(',').map(Number), sign: $('#buildSign').value, signCustom: buildSignCustom };
}
function clearBuildPreview() {
  if (ghost) world.disposeBuilding(ghost);
  ghost = null;
  if (roadPreview) { world.root.remove(roadPreview); roadPreview.geometry.dispose(); roadPreview = null; }
}
function refreshBuildGhost() {
  clearBuildPreview();
  if (!tool?.startsWith('build:')) return;
  ghost = world.makeBuilding(buildSpec(groundPoint || undefined), true);
  ghost.obj.visible = !!groundPoint;
}
function rotateBuild(delta) { buildYaw += delta; refreshBuildGhost(); }
function selectBuilding(e) {
  if (selectionBox) { scene.remove(selectionBox); selectionBox.geometry.dispose(); selectionBox.material.dispose(); }
  selectedBuilding = e; selectionBox = null;
  $('#deleteBuilding').disabled = !e;
  $('#buildSelection').textContent = e ? `Selected: ${e.spec.sign || e.spec.type}` : 'No building selected';
  if (e) { selectionBox = new THREE.BoxHelper(e.obj, 0xe2a24a); scene.add(selectionBox); }
}
function deleteBuilding() {
  if (!selectedBuilding) return;
  if (selectedBuilding.spec.type === 'fence') world.removeFence(selectedBuilding); else world.removeBuilding(selectedBuilding); selectBuilding(null); saveLayout();
}
function previewRoad(cursor) {
  if (roadPreview) { world.root.remove(roadPreview); roadPreview.geometry.dispose(); roadPreview = null; }
  const pts = [...roadPoints];
  if (cursor && (!pts.length || Math.hypot(cursor.x - pts.at(-1)[0], cursor.z - pts.at(-1)[1]) > 0.2)) pts.push([cursor.x, cursor.z]);
  if (pts.length < 2) return;
  world.userRoadMat ??= world._pathMaterial();
  if (tool === 'fence') {
    const n = world.colliders.segs.length; roadPreview = world._fence(pts, true); world.colliders.segs.splice(n);
  } else roadPreview = world._ribbon(pts, +$('#roadWidth').value, world.userRoadMat, { lift: 0.12, step: 1 });
  world.setTextureSet(world.textureSet || 'oil');
}
function finishRoad() {
  if (roadPoints.length < 2) return flash('Click at least two different road points');
  if (tool === 'fence') world.addFence(roadPoints); else world.addRoad(roadPoints, +$('#roadWidth').value);
  setTool(null); saveLayout();
}
buildButtons.forEach((b) => { b.onclick = () => {
  if (b.dataset.build === 'hotel') $('#buildFloors').value = 2;
  $('#buildFloors').nextElementSibling.textContent = $('#buildFloors').value;
  const signs = { shop: 'GENERAL STORE', hotel: 'HOTEL', house: 'HOMESTEAD', barn: 'LIVERY STABLE', chapel: '', tower: '', windmill: '', cabin: '', brick: 'GENERAL STORE', blacksmith: 'BLACKSMITH', hitch: '' };
  $('#buildSign').value = signs[b.dataset.build] || '';  buildSignCustom = false;
  setTool(`build:${b.dataset.build}`);
}; });
for (const id of ['buildWidth', 'buildFloors', 'buildWall', 'buildSign', 'roadWidth']) {
  const inp = $('#' + id);
  inp.addEventListener('input', () => {
    if (id === 'buildSign') buildSignCustom = true;
    if (inp.nextElementSibling?.tagName === 'OUTPUT') inp.nextElementSibling.textContent = inp.value;
    if (tool === 'road' || tool === 'fence') previewRoad(groundPoint); else if (tool?.startsWith('build:')) refreshBuildGhost();
    document.querySelectorAll('#buildSwatches button').forEach((b) => b.classList.toggle('on', b.dataset.value === $('#buildWall').value));
  });
}
for (const option of $('#buildWall').options) {
  const b = document.createElement('button'); b.type = 'button'; b.title = option.textContent;
  b.setAttribute('aria-label', option.textContent); b.dataset.value = option.value;
  const [h, s, l] = option.value.split(','); b.style.background = `hsl(${h}, ${s}%, ${l}%)`;
  b.onclick = () => { $('#buildWall').value = option.value; $('#buildWall').dispatchEvent(new Event('input')); };
  $('#buildSwatches').append(b);
}
$('#deleteBuilding').onclick = deleteBuilding;
const replaySpeed=$('#replaySpeed');replaySpeed.value=LS.get('dh.replaySpeed')||2;replaySpeed.nextElementSibling.textContent=replaySpeed.value;
replaySpeed.oninput=()=>{replaySpeed.nextElementSibling.textContent=replaySpeed.value;LS.set('dh.replaySpeed',+replaySpeed.value);for(const c of timeline.clips)if(c.shot==='buildReplay')c.replaySpeed=+replaySpeed.value;saveTimeline();if(timeline.playing&&timeline.clips[timeline.index]?.shot==='buildReplay')timeline.start(timeline.index);renderClips();};
$('#replayBuild').onclick=()=>{
  if(timeline.playing&&timeline.clips[timeline.index]?.shot==='buildReplay'){timeline.stop();refreshTimeline();return;}
  if(!world.buildEntries().length)return flash('Place a few pieces first.');
  game.exit();setTool(null);let index=timeline.clips.findIndex(c=>c.shot==='buildReplay');
  if(index<0){index=timeline.clips.length;timeline.clips.push({shot:'buildReplay',seconds:1,mood:'keep',move:'cut'});}
  timeline.clips[index].replaySpeed=+replaySpeed.value;saveTimeline();renderClips();timeline.start(index);refreshTimeline();
};
// everything made in Build mode (buildings, hitching posts, fences, roads); Willow Creek and the
// town stay. "Remove all placed" under Place objects only clears props.
$('#clearBuilt').onclick = () => {
  if (!confirm('Remove everything you built (buildings, hitching posts, fences and roads)?')) return;
  world.endBuildReplay();
  selectBuilding(null);
  for (const e of [...world.fences]) world.removeFence(e);
  for (const e of [...world.buildings]) world.removeBuilding(e, false);
  for (const e of world.roads) { world.root.remove(e.obj); e.obj.geometry.dispose(); }
  world.roads = [];
  world.updateTerrain();
  saveLayout();
};
$('#drawRoad').onclick = () => setTool('road');
$('#drawFence').onclick = () => setTool('fence');
$('#finishFence').onclick = finishRoad;
$('#undoFence').onclick = () => { const e = world.fences.at(-1); if (e) { world.removeFence(e); if (selectedBuilding === e) selectBuilding(null); saveLayout(); } };
$('#finishRoad').onclick = finishRoad;
$('#undoRoad').onclick = () => {
  world.endBuildReplay();
  const e = world.roads.pop();
  if (e) { world.root.remove(e.obj); e.obj.geometry.dispose(); saveLayout(); }
};
canvas.addEventListener('dblclick', () => { if (tool === 'road' || tool === 'fence') finishRoad(); });
canvas.addEventListener('wheel', (e) => {
  if (!tool?.startsWith('build:')) return;
  e.preventDefault(); rotateBuild(Math.sign(e.deltaY) * Math.PI / 12);
}, { passive: false });
canvas.addEventListener('pointermove', (e) => {
  if (game.active || (!ghost && tool !== 'road' && tool !== 'fence')) return;
  const r = canvas.getBoundingClientRect();
  ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObject(world.ground)[0];
  if (ghost) ghost.obj.visible = !!hit;
  if (!hit) return;
  groundPoint = hit.point.clone();
  if (ghost) {
    const dx = groundPoint.x - ghost.spec.x, dz = groundPoint.z - ghost.spec.z;
    ghost.obj.position.x = groundPoint.x; ghost.obj.position.z = groundPoint.z;
    ghost.obj.position.y = terrainHeight(ghost.pad.x + dx, ghost.pad.z + dz);
  } else previewRoad(groundPoint);
});
canvas.addEventListener('pointerleave', () => { if (ghost) ghost.obj.visible = false; });

// ---------- painted backdrop ----------
let backdrop = null;
function removeBackdrop() {
  if (!backdrop) return;
  scene.remove(backdrop);
  backdrop.geometry.dispose();
  backdrop.material.map.dispose();
  backdrop.material.dispose();
  backdrop = null;
  mountains.group.visible = true;
}
function placeBackdrop(tex, aspect) {
  removeBackdrop();
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.x = -1; // seen from inside the cylinder
  const R = 800, H = (2 * Math.PI * R) / aspect;
  backdrop = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 128, 1, true), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false, transparent: true }));
  backdrop.renderOrder = -5;
  scene.add(backdrop);
  mountains.group.visible = false;
}
let userBackdrop = false; // a backdrop you loaded yourself wins over the style's own
function setBackdrop(blob) {
  userBackdrop = true;
  loadImage(blob, placeBackdrop);
}
// The project's stitched backdrops: oil for painted looks, clean for cartoon and flat looks.
function updateStyleBackdrop() {
  if (userBackdrop) return;
  const set = textureSet === 'flat' ? 'clean' : textureSet;
  const img = painted[set].backdrop || painted.oil.backdrop || painted.clean.backdrop;
  if (!img) return removeBackdrop();
  if (backdrop && backdrop.userData.img === img) return;
  placeBackdrop(T.imageTexture(img), img.width / img.height);
  backdrop.userData.img = img;
}
$('#backdropFile').onchange = (e) => {
  const f = e.target.files[0];
  if (!f) return;
  setBackdrop(f);
  putFile('backdrop', f);
  e.target.value = '';
};
$('#backdropClear').onclick = () => { removeBackdrop(); deleteFile('backdrop'); userBackdrop = false; updateStyleBackdrop(); };
getFile('backdrop').then((b) => b && setBackdrop(b));

// ---------- sound ----------
$('#musicFile').onchange = (e) => {
  const f = e.target.files[0];
  if (!f) return;
  audio.loadMusic(f);
  audio.setWind(audioLevels.wind);
  $('#musicName').textContent = f.name;
  e.target.value = '';
  audio.music.el.addEventListener('loadedmetadata', refreshTimeline, { once: true });
};
$('#musicToggle').onclick = () => audio.toggleMusic();

// ---------- video ----------
$('#outputSize').onchange = (e) => { outputSize = e.target.value; resize(); };
$('#letterbox').onchange = (e) => (fin.uniforms.uLetterbox.value = e.target.checked ? 1 : 0);
$('#recBtn').onclick = () => {
  if (recorder.active) {
    recorder.stop();
    $('#recBtn').classList.remove('on');
    $('#recBtn').textContent = '● Record video';
  } else {
    audio.ensure();
    audio.setWind(audioLevels.wind);
    recorder.start(canvas, audio.stream);
    $('#recBtn').classList.add('on');
    $('#recBtn').textContent = '■ Stop & save';
  }
};

// ---------- timeline ----------
function mmss(s) {
  const p = (n) => String(Math.floor(n)).padStart(2, '0');
  return s >= 3600 ? `${Math.floor(s / 3600)}:${p((s % 3600) / 60)}:${p(s % 60)}` : `${p(s / 60)}:${p(s % 60)}`;
}
const options = (list, value) => list.map(([v, l]) => `<option value="${v}"${String(v) === String(value) ? ' selected' : ''}>${l}</option>`).join('');
const moodOptions = [['keep', 'keep mood'], ...Object.entries(PRESETS).map(([k, p]) => [k, p.label])];
const saveTimeline = () => LS.set('dh.timeline', timeline.toJSON());
timeline.clips = LS.get('dh.timeline') || [];

function renderClips() {
  const box = $('#clips'), shots = [...director.shots.map((s, i) => [i, s.name]), ['custom', 'Your camera move'], ['buildReplay','Replay build']];
  box.innerHTML = timeline.clips.length ? '' : '<p class="hint">No clips yet: choose a shot and a mood above, then press + Add clip.</p>';
  timeline.clips.forEach((c, i) => {
    if(c.shot==='buildReplay')c.seconds=timeline.duration(c);
    const d = document.createElement('div');
    d.className = 'clip';
    d.innerHTML = `<div class="top"><span class="num">${i + 1}.</span><select data-k="shot" title="Shot">${options(shots, c.shot)}</select></div>
      <div class="bottom"><input type="number" data-k="seconds" min="0.5" step="0.5" value="${c.seconds}" title="Seconds">
      <select data-k="mood" title="Mood for this clip">${options(moodOptions, c.mood)}</select>
      <select data-k="move" title="How the camera gets here">${options([['fly', 'fly'], ['cut', 'cut']], c.move)}</select>
      <span class="tools"><button data-a="-1" title="Move up">↑</button><button data-a="1" title="Move down">↓</button><button data-a="del" title="Remove">✕</button></span></div>`;
    if(c.shot==='buildReplay'){d.querySelector('[data-k=seconds]').disabled=true;d.querySelector('[data-k=seconds]').title='Replay length follows your piece count and speed';}
    d.querySelectorAll('[data-k]').forEach((el) => (el.onchange = () => {
      c[el.dataset.k] = el.dataset.k === 'seconds' ? Math.max(0.5, +el.value || 0.5) : el.value;
      if(el.dataset.k==='shot'){if(c.shot==='buildReplay')c.replaySpeed=+replaySpeed.value;renderClips();}
      saveTimeline();
      refreshTimeline();
    }));
    d.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => {
      const a = b.dataset.a, j = i + +a;
      if (a === 'del') timeline.clips.splice(i, 1);
      else if (j >= 0 && j < timeline.clips.length) [timeline.clips[i], timeline.clips[j]] = [timeline.clips[j], timeline.clips[i]];
      saveTimeline();
      renderClips();
    }));
    box.append(d);
  });
  refreshTimeline();
}
let litClip = -2;
function highlightClip(i) {
  if (i === litClip) return;
  litClip = i;
  document.querySelectorAll('#clips .clip').forEach((el, k) => el.classList.toggle('on', k === i));
}
function refreshTimeline() {
  const music = audio.musicDuration;
  $('#tlTotal').textContent = `${timeline.clips.length} clip${timeline.clips.length === 1 ? '' : 's'} · ${mmss(timeline.total)}` + (music ? ` · music ${mmss(music)}` : '');
  $('#tlPlay').textContent = timeline.playing ? '■ Stop' : '▶ Play timeline';
  $('#tlPlay').classList.toggle('on', timeline.playing);
  $('#replayBuild').textContent=timeline.playing&&timeline.clips[timeline.index]?.shot==='buildReplay'?'Stop replay':'Replay build';
  if (!timeline.playing) highlightClip(-1);
}
$('#addClip').onclick = () => {
  const shot = director.mode === 'shot' ? (director.index === -1 ? 'custom' : director.index) : 0;
  timeline.clips.push({ shot, seconds: 15, mood: timeline.clips.length ? 'keep' : atmos.key, move: 'fly' });
  saveTimeline();
  renderClips();
};
$('#tlPlay').onclick = () => {
  if (timeline.playing) timeline.stop();
  else if (timeline.start()) audio.restartMusic();
  else flash('Add some clips first');
  refreshTimeline();
};
$('#tlFit').onclick = () => {
  if (!audio.musicDuration) return flash('Load music first (Sound section)');
  if (!timeline.clips.length) return flash('Add some clips first');
  timeline.fitTo(audio.musicDuration);
  saveTimeline();
  renderClips();
};
$('#tlLoop').onchange = () => (timeline.loop = $('#tlLoop').checked);
renderClips();

// ---------- ready-made videos ----------
const videoPresetButtons = Object.entries(VIDEO_PRESETS).map(([key, p]) => {
  const b = document.createElement('button');
  b.innerHTML = `<b>${p.label}</b><span>${p.about}</span>`;
  b.onclick = () => applyVideoPreset(key);
  $('#videoPresets').append(b);
  return [key, b];
});
function applyVideoPreset(key) {
  const p = VIDEO_PRESETS[key];
  game.exit();
  timeline.stop();
  if ($('#presetStyle').checked) applyStyle(p.style);
  setSeason(p.season||'summer',true);
  setWeather(p.weather||'auto',true);
  setFestival(!!p.festival,true);
  setSlider('atmos', 'rain', p.rain);
  setSlider('audio', 'wind', p.wind);
  setSlider('audio', 'ambience', p.ambience);
  setLife({ ...BASE_LIFE, ...p.life });
  if (p.train && life.train) life.train.call();
  timeline.clips = p.clips.map((c) => ({ ...c }));
  saveTimeline();
  renderClips();
  // preview it, looping, and get the render set up for a long looped video
  $('#tlLoop').checked = timeline.loop = true;
  director.auto = false;
  timeline.start();
  audio.restartMusic();
  $('#renderWhat').value = 'loop';
  $('#renderWhat').onchange();
  if (+$('#renderMinutes').value < 10) $('#renderMinutes').value = 60;
  videoPresetButtons.forEach(([k, b]) => b.classList.toggle('on', k === key));
  refreshTimeline();
  flash(`${p.label}: previewing. Render it under Video.`);
}

// ---------- project files ----------
function projectData() {
  return {
    app: 'dusty-hollow', version: 1, familyMode, season:seasons.key, weather:atmos.weather, festival:atmos.festival, style: styleKey, paint: { ...paint }, look: { ...lookParams },
    mood: atmos.key, atmos: { ...atmos.mult }, life: { ...life.settings }, letterbox: fin.uniforms.uLetterbox.value,
    timeline: timeline.toJSON(), keys: director.custom.map((k) => [k.pos.toArray(), k.look.toArray()]), layout: world.layout(),
  };
}
function loadProject(p) {
  if (!p || p.app !== 'dusty-hollow') throw new Error('Not an SP Creek project file');
  timeline.stop();
  setFamilyMode(p.familyMode ?? DEFAULT_FAMILY_MODE, true);
  applyStyle(p.style);
  setSeason(p.season||'summer',true);
  setWeather(p.weather||'auto',true);
  setFestival(!!p.festival,true);
  for (const [k, v] of Object.entries(p.paint || {})) setSlider('paint', k, v);
  for (const [k, v] of Object.entries(p.look || {})) setSlider('look', k, v);
  for (const [k, v] of Object.entries(p.atmos || {})) setSlider('atmos', k, v);
  if (p.life) setLife(p.life);
  if (p.mood && PRESETS[p.mood]) {
    atmos.setPreset(p.mood, true);
    presetButtons.forEach((b, i) => b.classList.toggle('on', Object.keys(PRESETS)[i] === p.mood));
  }
  $('#letterbox').checked = !!p.letterbox;
  fin.uniforms.uLetterbox.value = p.letterbox ? 1 : 0;
  timeline.clips = p.timeline || [];
  director.custom = (p.keys || []).map(([pos, l]) => ({ pos: new THREE.Vector3(...pos), look: new THREE.Vector3(...l) }));
  setTool(null);
  world.loadLayout(p.layout || []);
  saveTimeline();
  saveKeys();
  saveLayout();
  renderClips();
  refreshCamera();
}
$('#projSave').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(projectData(), null, 2)], { type: 'application/json' }));
  a.download = 'sp-creek-project.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
};
$('#projFile').onchange = async (e) => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    loadProject(JSON.parse(await f.text()));
    flash(`Opened ${f.name}`);
  } catch (err) {
    flash(`Could not open: ${err.message}`);
  }
};

// ---------- frame-perfect MP4 render ----------
let cancelExport = false;
// what: 'timeline' (once through), 'loop' (the timeline repeated to the chosen length), 'current'
$('#renderWhat').onchange = () => $('#renderSecondsRow').classList.toggle('off', $('#renderWhat').value === 'timeline');
$('#renderWhat').onchange();
$('#exportCancel').onclick = () => (cancelExport = true);
$('#renderBtn').onclick = async () => {
  const [w, h] = $('#renderRes').value.split('x').map(Number), fps = +$('#renderFps').value;
  const what = $('#renderWhat').value, useTimeline = what !== 'current', loop = what === 'loop';
  if (useTimeline && !timeline.clips.length) return flash('Add clips to the timeline first (or pick a preset), or render "Current camera"');
  const seconds = what === 'timeline' ? timeline.total : Math.max(1, Math.round((+$('#renderMinutes').value || 1) * 60));
  // ask where to save while we still have the click; big videos then stream straight to disk
  let writable = null;
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: `sp-creek-${h}p.mp4`, types: [{ description: 'MP4 video', accept: { 'video/mp4': ['.mp4'] } }] });
      writable = await handle.createWritable();
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  await renderVideo({ w, h, fps, seconds, useTimeline, loop, sound: $('#renderSound').checked, writable });
};

async function renderVideo({ w, h, fps, seconds, useTimeline, loop = false, sound, writable }) {
  game.exit();
  exporting = true;
  cancelExport = false;
  $('#exportOverlay').classList.remove('hidden');
  $('#exportBar').style.width = '0%';
  $('#exportText').textContent = 'Preparing…';
  audio.pauseLive();
  timeline.stop();
  resize(w, h);
  let result = null;
  try {
    // the frames are drawn first while the soundscape records where the camera is each frame;
    // then the sound is mixed from that and added to the video
    const withSound = sound && audio.hasSound;
    if (withSound) audio.frames = [];
    const chunks = () => {
      $('#exportText').textContent = 'Mixing the sound…';
      const frames = audio.frames;
      audio.frames = null;
      return audio.renderChunks(seconds, frames, fps);
    };
    const onChunk = (done) => {
      $('#exportBar').style.width = `${((done / seconds) * 100).toFixed(1)}%`;
      $('#exportText').textContent = `Mixing the sound · ${mmss(done)} of ${mmss(seconds)}`;
    };
    timeline.loop = loop;
    if (useTimeline) timeline.start();
    const t0 = performance.now();
    result = await encodeVideo({
      canvas, width: w, height: h, fps, seconds, writable,
      audio: withSound ? { sampleRate: 48000, channels: 2, chunks, onChunk } : null,
      renderFrame: () => step(1 / fps),
      cancelled: () => cancelExport,
      onProgress: (done, total) => {
        const el = (performance.now() - t0) / 1000, left = (el / done) * (total - done);
        $('#exportBar').style.width = `${((done / total) * 100).toFixed(1)}%`;
        $('#exportText').textContent = `Frame ${done} of ${total} · ${mmss(done / fps)} of ${mmss(seconds)} · about ${mmss(left)} left`;
      },
    });
    if (result instanceof Blob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(result);
      a.download = `sp-creek-${h}p.mp4`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    }
  } catch (err) {
    console.error(err);
    alert(`The video could not be rendered: ${err.message}`);
  } finally {
    audio.frames = null;
    timeline.stop();
    timeline.loop = $('#tlLoop').checked;
    exporting = false;
    resize();
    clock.getDelta();
    audio.resumeLive();
    $('#exportOverlay').classList.add('hidden');
    refreshTimeline();
    if (cancelExport) flash('Render cancelled');
    else if (result) flash('Video saved');
  }
  return result;
}
window.__renderVideo = renderVideo; // handy for testing from the console
window.__life = life;
window.__app = { seasons, setSeason, setWeather, setFestival, world, camera, life, cafe, townCenter, ghostTown, forest, meadowLake, crystalMine, setFamilyMode, projectData, loadProject, applyStyle, timeline, director, renderClips, game, audio, listener, atmos, step: (dt) => step(dt) };

// ---------- playable mode ----------
let helpTimer = 0;
function togglePlay() {
  if (game.active) return game.exit();
  timeline.stop();
  refreshTimeline();
  setTool(null);
  director.auto = false;
  game.enter();
}
game.onChange = () => {
  $('#playBtn').textContent = game.active ? '■ Stop playing (G)' : '🎮 Play — walk & ride (G)';
  $('#playBtn').classList.toggle('on', game.active);
  document.body.classList.toggle('ui-hidden', game.active);
  $('#gameHelp').classList.toggle('hidden', !game.active);
  $('#gameHelp').classList.remove('faded');
  clearTimeout(helpTimer);
  if (game.active) helpTimer = setTimeout(() => $('#gameHelp').classList.add('faded'), 9000);
  $('#gamePrompt').classList.add('hidden');
  refreshCamera();
};
$('#playBtn').onclick = togglePlay;

// ---------- keys ----------
const toggleUI = () => document.body.classList.toggle('ui-hidden');
$('#uiToggle').onclick = toggleUI;
// Review controls: freeze the whole scene (time stops, the frame keeps drawing), and full screen.
let frozen = false;
function toggleFreeze() {
  frozen = !frozen;
  $('#freezeBtn').textContent = frozen ? '▶' : '⏸';
  $('#freezeBtn').classList.toggle('on', frozen);
  if (frozen) audio.pauseLive(); else { audio.resumeLive(); clock.getDelta(); }
}
$('#freezeBtn').onclick = (e) => { toggleFreeze(); e.currentTarget.blur(); };
$('#fullBtn').onclick = (e) => {
  e.currentTarget.blur();
  if (document.fullscreenElement) return document.exitFullscreen();
  // if the browser refuses (embedded or background window), at least fill the window: hide the panel
  const fallback = () => $('#fullBtn').classList.toggle('on', document.body.classList.toggle('ui-hidden'));
  const req = document.documentElement.requestFullscreen?.();
  if (req) req.catch(fallback); else fallback();
};
document.addEventListener('fullscreenchange', () => {
  const on = !!document.fullscreenElement;
  $('#fullBtn').classList.toggle('on', on);
  document.body.classList.toggle('ui-hidden', on);
});
addEventListener('keydown', (e) => {
  if (e.target.closest && e.target.closest('input, select, textarea')) return;
  if (e.code === 'KeyG') return togglePlay();
  if (e.code === 'KeyH') return toggleUI();
  if (game.active) return; // the game uses the other keys
  if (e.code === 'Space') { e.preventDefault(); return toggleFreeze(); }
  if (e.code === 'KeyH') toggleUI();
  else if (e.code === 'KeyF') toggleFree();
  else if (e.code === 'KeyK') addKey();
  else if (e.code === 'KeyP') togglePause();
  else if (e.code === 'Escape') setTool(null);
  else if (e.code === 'KeyR' && tool?.startsWith('build:')) rotateBuild(Math.PI / 12);
  else if (e.code === 'Enter' && (tool === 'road' || tool === 'fence')) finishRoad();
  else if (e.code === 'Delete' && selectedBuilding) deleteBuilding();
  else if (/^Digit[1-9]$/.test(e.code)) {
    const i = +e.code.slice(5) - 1;
    if (i < director.shots.length) { director.auto = false; director.play(i); }
  }
});

let flashTimer = 0;
function flash(msg) {
  $('#hint').textContent = msg;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(showToolHint, 2000);
}

// ---------- loop ----------
resize();
refreshCamera();
const clock = new THREE.Clock();
let time = 0, frames = 0, lastLabel = '', exporting = false;

// What the soundscape needs to know this frame: where the ears are (the player in play mode,
// else the camera), which way is right, inside the cafe or not, the mood, and the train.
const cafeIt = world.interiors.cafe, _v = new THREE.Vector3();
const cafePos = cafeIt ? cafeIt.group.localToWorld(new THREE.Vector3(0, 0, cafeIt.zc)) : null;
function listener() {
  const p = game.active ? game.pos : camera.position, e = camera.matrixWorld.elements;
  let inside = false;
  if (cafeIt) {
    cafeIt.group.worldToLocal(_v.copy(p));
    inside = Math.abs(_v.x) < cafeIt.hx && _v.z < 0 && _v.z > -cafeIt.depth && _v.y < 3.8;
  }
  const c = atmos.cur, t = life.train;
  return {
    x: p.x, z: p.z, rx: e[0], rz: e[2], inside, riverZ: riverZ(p.x),
    cafe: cafePos && { x: cafePos.x, z: cafePos.z },
    night: c.stars, day: 1 - c.stars, rain: world.rainAmount ?? THREE.MathUtils.clamp(c.rain + atmos.mult.rain, 0, 1),
    train: t && t.state !== 'away' ? { x: RAIL_X, z: t.s, v: t.v, state: t.state, approaching: t.state === 'run' && !t.stopped } : null,
  };
}

// Advance the whole world by exactly `dt` seconds and draw one frame.
// The live loop passes real elapsed time; the exporter passes 1/fps.
function step(dt) {
  time += dt;
  if (timeline.update(dt) === 'ended') refreshTimeline();
  if (game.active) game.update(dt);
  else director.update(dt);
  world.wind=life.settings.wind*(atmos.weather==='windy'?2.2:1);
  atmos.update(dt, time, camera);
  seasons.update(time,camera);
  world.update(dt, time, camera);
  townCenter.update(time);
  ghostTown.update(time, game.active ? game.pos : null, atmos.cur);
  forest.update(time, camera, atmos.cur);
  meadowLake.update(time, camera, atmos.cur, atmos.key);
  crystalMine.update(time, atmos.cur);
  life.player = game.active ? game.pos : null; // townsfolk greet you as you pass
  life.update(dt, time, camera);
  sunsetCove.update(time,camera,atmos.cur);
  playground.update(time,camera);
  cafe.update(dt, time, [game.active ? game.pos : null, camera.position], world.lanternLevel);
  tickCharacters(time);
  audio.tick(listener(), dt);
  if (backdrop) {
    backdrop.position.set(camera.position.x, 2, camera.position.z);
    // the painting is golden hour: tint it toward the current mood, and as the stars come out
    // fade it so the live night sky (stars, moon, mountain silhouettes) takes over
    const c = atmos.cur, day = THREE.MathUtils.clamp(c.sunIntensity / 3.2, 0.28, 1);
    backdrop.material.color.setRGB(1, 1, 1).lerp(c.fogColor, 0.35 * (1.2 - day)).multiplyScalar(day);
    backdrop.material.opacity = 1 - 0.92 * c.stars;
    mountains.group.visible = c.stars > 0.05;
  }

  const o = oil.uniforms, f = fin.uniforms;
  o.uRadius.value = paint.radius;
  o.uStrength.value = paint.strength;
  o.uWobble.value = paint.wobble;
  o.uBoil.value = paint.boil;
  o.uTime.value = time;
  f.uTime.value = time;
  f.uImpasto.value = paint.impasto;
  f.uCanvas.value = paint.canvas;
  f.uSat.value = paint.sat * atmos.grade.sat;
  f.uWarmth.value = paint.warmth + atmos.grade.warmth;
  f.uContrast.value = paint.contrast;
  f.uVignette.value = paint.vignette;
  f.uGrain.value = paint.grain;
  const l = look.uniforms;
  l.uPoster.value = lookParams.poster;
  l.uOutline.value = lookParams.outline;
  l.uDof.value = lookParams.dof;
  l.uBloom.value = lookParams.bloom;
  l.uLayers.value = lookParams.layers;
  l.uPaperShadow.value = lookParams.paperShadow;
  l.uPixel.value = lookParams.pixel;
  // focus follows whatever the camera is looking at, eased so it racks smoothly
  const focusTarget = camera.position.distanceTo(director.state.look);
  l.uFocus.value += (focusTarget - l.uFocus.value) * Math.min(1, dt * 2.5);

  renderer.setRenderTarget(sceneRT);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  composer.render(dt);
}

function frame() {
  requestAnimationFrame(frame);
  if (exporting) return;
  step(frozen ? 0 : Math.min(clock.getDelta(), 0.1));
  if (director.label !== lastLabel) { lastLabel = director.label; refreshCamera(); }
  if (recorder.active) {
    $('#rec').textContent = `● REC ${mmss(recorder.seconds)}`;
  } else if (timeline.playing) {
    $('#rec').textContent = `▶ ${mmss(timeline.t)} / ${mmss(timeline.total)}`;
  } else $('#rec').textContent = '';
  if (timeline.playing) highlightClip(timeline.index);
  if (game.active) {
    $('#gamePrompt').textContent = game.prompt;
    $('#gamePrompt').classList.toggle('hidden', !game.prompt);
  }
  if (++frames === 2) $('#loading').classList.add('done');
}
atmos.setPreset('golden', true);
frame();
if (new URLSearchParams(location.search).has('showcase')) import('./showcase.js').then((m) => setTimeout(() => m.startShowcase(window.__app), 3000));
