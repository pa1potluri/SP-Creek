// The town of SP Creek: terrain, road, buildings, landmarks, nature, props.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as T from './textures.js';
import { HAMLET } from './hamlet.js';
import { familySign } from './family.js';
import { cloudShader, waterMaterial } from './environment.js';
import { dressHamletHouse, dressPondShore } from './areas/pond-details.js';
import { makeCanvasTent } from './props/canvas-tent.js';

// Batch only rigid siblings: animated joints and their exact transforms stay separate.
export function batchRigidParts(root) {
  root.traverse(parent => {
    const batches = new Map();
    for (const mesh of parent.children) {
      if (!mesh.isMesh || mesh.isSkinnedMesh || Array.isArray(mesh.material)) continue;
      const list = batches.get(mesh.material) || [];
      list.push(mesh); batches.set(mesh.material, list);
    }
    for (const [material, meshes] of batches) {
      if (meshes.length < 2) continue;
      const pieces = meshes.map(mesh => { mesh.updateMatrix(); return mesh.geometry.clone().applyMatrix4(mesh.matrix); });
      const geometry = mergeGeometries(pieces);
      pieces.forEach(piece => piece.dispose());
      if (!geometry) continue;
      const merged = new THREE.Mesh(geometry, material);
      merged.castShadow = merged.receiveShadow = true;
      parent.add(merged);
      meshes.forEach(mesh => { parent.remove(mesh); mesh.geometry.dispose(); });
    }
  });
}

export const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function hash2(ix, iz) {
  let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iz | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz), b = hash2(ix + 1, iz), c = hash2(ix, iz + 1), d = hash2(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
export function fbm(x, z, oct = 4) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    v += a * vnoise(x * f + i * 17.3, z * f - i * 9.1);
    f *= 2.02;
    a *= 0.5;
  }
  return v / (1 - Math.pow(0.5, oct));
}

// The road leaves town to the north (+z) and wanders into the hills.
export function roadX(z) {
  return z > 60 ? Math.sin((z - 60) * 0.018) * (z - 60) * 0.22 : 0;
}

let legacyNatureTerrain=false;

// The river crosses the whole valley north of town, flowing east (+x).
export function riverZ(x) {
  const z=150+Math.sin(x*0.012)*18+Math.sin(x*0.031)*6;
  return legacyNatureTerrain?z:z+(150-z)*(1-smoothstep(-370,-285,x));
}
export function coastX(z) {return -350-18*Math.exp(-Math.pow((z-35)/115,2))+8*Math.sin(z*0.007);}
export const WATER_Y = -1;
export const RAIL_X = 70; // the railway runs north–south east of town
export const TRAIN_SPUR_POINTS=[[70,28],[70,60],[40,105],[-20,112],[-110,112],[-170,105],[-245,92],[-284,66]];
export const TRAIN_SPUR_CURVE=new THREE.CatmullRomCurve3(TRAIN_SPUR_POINTS.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal');
export const TRAIN_SPUR_LENGTH=TRAIN_SPUR_CURVE.getLength();
export const TRAIN_HALTS=[{name:'Willow Creek halt',distance:TRAIN_SPUR_CURVE.getLengths(1400)[800]},{name:'Seaside halt',distance:TRAIN_SPUR_LENGTH}];
let trainGrade=null;
export function sampleTrainTrack(distance){
 const u=THREE.MathUtils.clamp(distance/TRAIN_SPUR_LENGTH,0,1),p=distance<0?new THREE.Vector3(70,0,28+distance):TRAIN_SPUR_CURVE.getPointAt(u),t=distance<0?new THREE.Vector3(0,0,1):TRAIN_SPUR_CURVE.getTangentAt(u);
 if(distance>=0&&trainGrade){const v=u*(trainGrade.length-1),i=Math.min(trainGrade.length-2,Math.floor(v));p.y=THREE.MathUtils.lerp(trainGrade[i],trainGrade[i+1],v-i);}else p.y=terrainHeight(p.x,p.z)+0.51;return {pos:p,yaw:Math.atan2(t.x,t.z)};
}


// Level ground for the ranch and the forest camp (each keeps its natural height).
export const RANCH = { x: -95, z: -55, r: 32, blend: 30 };
export const CAMP = { x: -62, z: -172, r: 16, blend: 26 };
const PADS = [RANCH, CAMP];
const userPads = [];
const padCells = new Map(), emptyPads = [], padCellSize = 32;
let indexedPadCount = -1;
function rebuildPadCells() {
  padCells.clear();
  // Keep insertion order: overlapping pads blend in their original order.
  for (const p of userPads) {
    const reach = Math.max(p.hx + p.hz + Math.max(1, p.blend || 8) * Math.SQRT2,
      p.basin ? Math.max(p.rx, p.rz) * 1.8 : 0);
    for (let x = Math.floor((p.x-reach)/padCellSize); x <= Math.floor((p.x+reach)/padCellSize); x++) {
      for (let z = Math.floor((p.z-reach)/padCellSize); z <= Math.floor((p.z+reach)/padCellSize); z++) {
        const key = `${x},${z}`;
        if (!padCells.has(key)) padCells.set(key, []);
        padCells.get(key).push(p);
      }
    }
  }
  indexedPadCount = userPads.length;
}
function nearbyPads(x, z) {
  if (indexedPadCount !== userPads.length) rebuildPadCells();
  return padCells.get(`${Math.floor(x/padCellSize)},${Math.floor(z/padCellSize)}`) || emptyPads;
}
const userFloors = [];
let pondPad = null;
export function pondRadius(x, z, p = HAMLET.pond) {
  if(p.sea)return 1+(x-coastX(z))/p.rz;
  const dx = (x - p.x) / p.rx, dz = (z - p.z) / p.rz, a = Math.atan2(dz, dx);
  return Math.hypot(dx, dz) / (1 + 0.06 * Math.sin(a * 3 + 0.5) + 0.035 * Math.cos(a * 5));
}
function applyPond(h, x, z) {
  if (!pondPad?.active || Math.abs(x-pondPad.x)>pondPad.rx*1.8 || Math.abs(z-pondPad.z)>pondPad.rz*1.8) return h;
  const r = pondRadius(x,z);
  if (r >= 1.6) return h;
  const bowl = pondPad.y + (r < 1 ? 2.1 * (r * r - 1) : 1.2 * (r - 1));
  return h + (bowl - h) * (1 - smoothstep(1.02,1.6,r));
}
function applyUserPads(h, x, z) {
  for (const p of nearbyPads(x, z)) {
    if(p.clearOnly)continue;
    if (p.basin) {
      if (Math.abs(x-p.x)>p.rx*1.8 || Math.abs(z-p.z)>p.rz*1.8) continue;
      const r = pondRadius(x,z,p);
      if (r < 1.6) {
        const bed = p.y + (r < 1 ? p.depth * (r*r-1) : 0.9*(r-1));
        h += (bed-h) * (1-smoothstep(1.02,1.6,r));
      }
      continue;
    }
    const blend = p.blend || 8;
    // Most pads belong to distant railway segments; avoid trigonometry for those.
    const reach = p.hx + p.hz + blend * Math.SQRT2;
    if (Math.abs(x - p.x) > reach || Math.abs(z - p.z) > reach) continue;
    const d = padDistance(p, x, z);
    if (d < blend) h += (p.y + (x-p.x)*(p.slopeX||0) - h) * (1 - smoothstep(0, blend, d));
  }
  return h;
}
const padRotations = new WeakMap();
function padDistance(p, x, z) {
  let rotation = padRotations.get(p);
  if (!rotation || rotation.yaw !== p.yaw) {
    rotation = { yaw: p.yaw, c: Math.cos(p.yaw), a: Math.sin(p.yaw) };
    padRotations.set(p, rotation);
  }
  const dx = x - p.x, dz = z - p.z, { c, a } = rotation;
  return Math.max(Math.abs(c * dx - a * dz) - p.hx, Math.abs(a * dx + c * dz) - p.hz);
}
function withinPad(p, x, z, margin) {
  const reach = p.hx + p.hz + Math.max(0, margin) * Math.SQRT2;
  return Math.abs(x - p.x) <= reach && Math.abs(z - p.z) <= reach && padDistance(p, x, z) < margin;
}

// Flat valley floor for the town, rolling hills around it.
function hills(x, z) {
  const d = Math.hypot(x, z * 0.55);
  const f = smoothstep(45, 160, d);
  const corridor = 1 - 0.7 * (1 - smoothstep(8, 30, Math.abs(x - roadX(z)))) * smoothstep(40, 70, z);
  return f * (fbm(x * 0.006 + 3.1, z * 0.006 - 1.7) * 60 - 10) * corridor + f * f * 8;
}
for (const p of PADS) p.y = hills(p.x, p.z);

export function terrainHeight(x, z) {
  let h = hills(x, z);
  for (const p of PADS) {
    const k = 1 - smoothstep(p.r, p.r + p.blend, Math.hypot(x - p.x, z - p.z));
    if (k > 0) h += (p.y - h) * k;
  }
  h *= smoothstep(5, 24, Math.abs(x - RAIL_X)); // railway cutting through the hills
  const rd = Math.abs(z - riverZ(x));
  h *= smoothstep(13, 60, rd); // broad flat river valley
  h -= 2.6 * (1 - smoothstep(6, 13, rd)); // the channel itself
  if(!legacyNatureTerrain&&x<-270){const d=x-coastX(z),land=d<0?-1.2+d*0.035:-0.85+d*0.06+d*d*0.0012;
    const channel=2.2*(1-smoothstep(7,15,Math.abs(z-riverZ(x))));h+=(land-channel-h)*(1-smoothstep(-300,-270,x));}
  return applyPond(applyUserPads(h, x, z), x, z);
}

// Height of whatever you stand on: the raised boardwalk in front of a shop, else the ground.
export function walkHeight(x, z) {
  for (const f of userFloors) {
    const dx = x - f.cx, dz = z - f.cz;
    if (Math.abs(dx * f.ax + dz * f.az) <= f.hx && Math.abs(dx * f.bx + dz * f.bz) <= f.hz) return f.y;
  }
  const ax = Math.abs(x);
  if (ax > 4.75 && ax < 7.35) {
    for (const s of x < 0 ? LEFT : RIGHT) if (Math.abs(z - s.z) < s.w / 2 + 0.15) return 0.35;
  }
  return terrainHeight(x, z);
}

const C = (h, s, l) => new THREE.Color().setHSL(h / 360, s / 100, l / 100, THREE.SRGBColorSpace);
// The painted boards are pale (about 75% bright), so their tint is brightened to land on the
// building's intended colour.
const tintFor = ([h, s, l]) => C(h, s, Math.min(96, l / 0.75));
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

function mesh(geo, mat, cast = true, receive = true) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}

// Triangular prism (gable roof) with its base on y=0, ridge along z.
function prism(w, h, len) {
  const g = new THREE.CylinderGeometry(1, 1, len, 3, 1);
  g.rotateX(-Math.PI / 2);
  g.scale(w / 1.732, h / 1.5, 1);
  g.translate(0, h / 3, 0);
  return g;
}

// Three planes crossed at 60°, standing on y = 0, so a plant looks full from every side. Normals
// point up so the painting is lit evenly, like a soft canopy.
function crossedPlanes(w, h) {
  const a = new THREE.PlaneGeometry(w, h);
  a.translate(0, h / 2, 0);
  const g = mergeGeometries([a, a.clone().rotateY(Math.PI / 3), a.clone().rotateY((2 * Math.PI) / 3)]);
  const n = g.attributes.normal;
  for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0);
  return g;
}

function boxAt(w, h, d, x, y, z) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}

function beam(a, b, t, mat) {
  const d = V().subVectors(b, a), len = d.length();
  const m = mesh(new THREE.BoxGeometry(t, len, t), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return m;
}

export const LEFT = [ // west side of Main Street, facing east (+x)
  { sign: 'SP CREEK MERCANTILE', z: 38, w: 12, floors: 2, wall: [34, 30, 48], trim: [30, 25, 30], signBg: [40, 30, 80], signInk: '#3a2414', chimney: true, hitch: true },
  { sign: 'TOWN HALL', z: 22, w: 9, floors: 1, wall: [20, 25, 38], trim: [35, 20, 70], signBg: [25, 30, 22], signInk: '#f0e0c0' },
  { sign: 'BANK', z: 8, w: 10, floors: 2, wall: [205, 12, 52], trim: [40, 30, 80], signBg: [210, 25, 22], signInk: '#e8d9a8' },
  { sign: 'POST OFFICE', z: -6, w: 8, floors: 1, wall: [95, 15, 45], trim: [40, 30, 80], signBg: [40, 35, 85], signInk: '#3a2a1a' },
  { sign: 'DOCTOR', z: -19, w: 8, floors: 1, wall: [0, 30, 42], trim: [35, 25, 75], signBg: [30, 20, 90], signInk: '#5a1a10' },
  { sign: 'BAKERY', z: -33, w: 9, floors: 1, wall: [25, 10, 28], trim: [30, 10, 55], signBg: [0, 0, 15], signInk: '#d8d0c0' },
];
export const RIGHT = [ // east side, facing west (-x)
  { sign: 'TOY SHOP', z: 38, w: 9, floors: 1, wall: [25, 35, 35], trim: [40, 25, 70], signBg: [0, 0, 12], signInk: '#e9c46a' },
  { sign: 'BARBER', z: 26, w: 7, floors: 1, wall: [200, 30, 58], trim: [0, 0, 92], signBg: [0, 55, 40], signInk: '#f6efe0' },
  { sign: 'HONEY BUN CAFÉ', z: 8, w: 15, floors: 2, balcony: true, batwing: true, interior: 'cafe', painted: true, wall: [28, 45, 40], trim: [42, 60, 60], signBg: [20, 50, 22], signInk: '#f2c86a', chimney: true, hitch: true },
  { sign: 'HOTEL', z: -12, w: 12, floors: 2, balcony: true, wall: [15, 25, 55], trim: [40, 30, 85], signBg: [150, 20, 25], signInk: '#f0e6c8', chimney: true },
  { sign: 'LIVERY STABLE', z: -32, w: 13, floors: 1, barn: true, wall: [8, 45, 35], trim: [40, 20, 85], signBg: [40, 20, 85], signInk: '#4a1a10' },
];

export class World {
  // painted: { oil: {name: img}, clean: {name: img} } from assets/textures/<set>/<name>.png
  // (wall_boards, wallpaper, floor, roof, dark_wood, meadow, road). Used on buildings marked
  // `painted` and on the ground; anything missing falls back to the code-made textures.
  constructor(scene, painted = {}) {
    this.scene = scene;
    this.painted = { oil: {}, clean: {}, ...painted };
    this.surfaces = new Set(); // materials whose texture follows the art style (see setTextureSet)
    this.root = new THREE.Group();
    scene.add(this.root);
    this.familyMode = false;
    this.windowMats = [];
    this.lanternLights = [];
    this.emitters = [];
    this.flames = [];
    this.spinners = [];
    this.billboards = [];
    this.placed = [];
    this.buildings = [];
    this.roads = [];
    this.fences = [];
    this.buildingPOIs = [];
    this.props = [];
    this.benches = []; // seats on benches: { x, y, z, yaw, who }
    this.walkables = [];
    // for the playable mode: what you bump into, and raised floors you can stand on
    this.colliders = { rects: [], circles: [], segs: [], water: [] };
    this.floors = [];
    this.ceilings = []; // rooms you can walk into: the play camera stays below these
    this.interiors = {}; // name -> the building group and room size, furnished by interior.js
    this.lanternLevel = 0;
    this._ray = new THREE.Raycaster();
    this._wallCache = {};

    this.tex = { plank: T.plankTexture(), roof: T.roofTexture(), glow: T.glowTexture(), flame: T.flameTexture() };
    this.waterMats = [];
    this.waterUniforms = {
      uWaterTime:{value:0},uWaterWind:{value:1},uWaterDetail:{value:1},
      uWaterSky:{value:new THREE.Color()},uWaterHorizon:{value:new THREE.Color()},uWaterBank:{value:new THREE.Color()},
      uWaterSun:{value:new THREE.Color()},uWaterSunDir:{value:V(1,1,0)},uWaterFoamColor:{value:new THREE.Color()},
      uWaterFoam:{value:Array.from({length:16},()=>V())},
    };
    this.waterShared = {map:T.waterTexture(),uniforms:this.waterUniforms};
    this.mat = {
      roof: new THREE.MeshLambertMaterial({ map: this.tex.roof, color: C(18, 20, 58), flatShading: true }),
      wood: new THREE.MeshLambertMaterial({ map: this.tex.plank, color: C(28, 30, 46) }),
      darkWood: new THREE.MeshLambertMaterial({ map: this.tex.plank, color: C(24, 30, 28) }),
      barrel: new THREE.MeshLambertMaterial({ map: this.tex.plank, color: C(25, 42, 40) }),
      crate: new THREE.MeshLambertMaterial({ map: this.tex.plank, color: C(36, 35, 58) }),
      iron: new THREE.MeshLambertMaterial({ color: C(20, 8, 16) }),
      stone: new THREE.MeshLambertMaterial({ color: C(30, 8, 42), flatShading: true }),
      hay: new THREE.MeshLambertMaterial({ color: C(44, 55, 58), flatShading: true }),
      water: new THREE.MeshLambertMaterial({ color: C(200, 25, 32) }),
      canvas: new THREE.MeshLambertMaterial({ color: C(40, 30, 82), side: THREE.DoubleSide }),
      lantern: new THREE.MeshLambertMaterial({ color: C(30, 30, 20), emissive: C(34, 100, 60), emissiveIntensity: 0 }),
      foliage: new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }),
    };
    // painted versions when the images exist: pale boards tinted to each material's colour,
    // shingles on every roof, stone for chimneys, the mill and the rocks
    this.mat.roof = this.paintedMaterial('roof', 3, 3, { flatShading: true }) || this.mat.roof;
    this.mat.stone = this.paintedMaterial('stone', 1, 1, { flatShading: true }) || this.mat.stone;
    for (const [k, hsl] of [['wood', [28, 30, 46]], ['darkWood', [24, 30, 28]], ['barrel', [25, 42, 40]], ['crate', [36, 35, 58]]]) {
      this.mat[k] = this.paintedMaterial('boards', 2, 1, { color: tintFor(hsl) }) || this.mat[k];
    }
    for (const k of ['roof', 'stone', 'wood', 'darkWood', 'barrel', 'crate']) this.surfaces.add(this.mat[k]);
    this.haloMat = new THREE.SpriteMaterial({ map: this.tex.glow, color: C(32, 100, 62), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 });
    this.flameMat = new THREE.SpriteMaterial({ map: this.tex.flame, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false });

    this._lightPool();
    this._terrain();
    this._road();
    this._town();
    this._landmarks();
    this._river();
    this._railway();
    this._ranch();
    this._camp();
    const natureStart = this.root.children.length, treeColliderStart = this.colliders.circles.length;
    // Preserve the existing seeded plant layout before sculpting and clearing the coast.
    legacyNatureTerrain=true;
    this._nature();
    this.plantColliders = new Set(this.colliders.circles.slice(treeColliderStart));
    this.plantInstances = [];
    for (const g of this.root.children.slice(natureStart)) g.traverse((m) => {
      if (m.isInstancedMesh) this.plantInstances.push({ mesh: m, matrices: m.instanceMatrix.array.slice(), heights: Array.from({ length: m.count }, (_, i) => terrainHeight(m.instanceMatrix.array[i * 16 + 12], m.instanceMatrix.array[i * 16 + 14])) });
    });
    legacyNatureTerrain=false;
    this._decor();
    this.hamlet = { visible: true, buildings: [], roads: [], props: [], pois: [] };
    this.hamlet.pad = { x: HAMLET.x, z: HAMLET.z, y: terrainHeight(HAMLET.x, HAMLET.z), yaw: 0, hx: 50, hz: 32, blend: 26 };
    userPads.push(this.hamlet.pad);
    for (const spec of HAMLET.buildings) {
      const e = this.placeBuilding(spec, false);
      this.buildings.pop(); this.buildingPOIs.pop();
      this.hamlet.buildings.push(e); this.hamlet.pois.push(e.poi);
      if (spec.type === 'house') dressHamletHouse(this,e);
    }
    this._pond();
    this.updateTerrain();
    this.hamlet.roads.push(this.addRoad(HAMLET.road, 5)); this.roads.pop();
    for (const [x, z, yaw] of HAMLET.benches) this.hamlet.props.push(this.placeProp('bench', x, z, yaw, false));
    for (const [x, z] of [[-135, 69], [-102, 64]]) this.hamlet.props.push(this.placeProp('lantern', x, z, 0, false));
  }

  setHamlet(visible) {
    const h = this.hamlet;
    if (h.visible === !!visible) return;
    h.visible = !!visible;
    h.pond.obj.visible = h.pond.bank.visible = !!visible;
    pondPad.active = !!visible;
    const toggle = (list, items) => {
      for (const item of items) {
        const i = list.indexOf(item);
        if (visible && i < 0) list.push(item);
        else if (!visible && i >= 0) list.splice(i, 1);
      }
    };
    toggle(userFloors, [h.pond.floor]); toggle(this.floors,[h.pond.floor]);
    toggle(this.walkables,[h.pond.deck,h.pond.bank]); toggle(this.colliders.water,[h.pond.area]);
    toggle(this.colliders.circles,h.pond.colliders);
    toggle(userPads, [h.pad]);
    for (const e of h.buildings) {
      e.obj.visible = !!visible;
      toggle(userPads, [e.pad]); toggle(userFloors, e.additions.floors);
      for (const [k, items] of Object.entries(e.additions)) toggle(k === 'rects' || k === 'circles' ? this.colliders[k] : this[k], items);
    }
    for (const p of h.props) {
      toggle(this.colliders.circles, [p.collider]); toggle(this.benches, p.seats || []);
      if (p.light) p.light.light.visible = !!visible;
    }
    this.updateTerrain();
  }

  // An oriented rectangle on the ground (centre cx,cz and half sizes in obj's local frame).
  _rectOf(obj, cx, cz, hx, hz) {
    obj.updateMatrixWorld(true);
    const c = obj.localToWorld(V(cx, 0, cz)), q = obj.getWorldQuaternion(new THREE.Quaternion());
    const a = V(1, 0, 0).applyQuaternion(q), b = V(0, 0, 1).applyQuaternion(q);
    return { cx: c.x, cz: c.z, ax: a.x, az: a.z, bx: b.x, bz: b.z, hx, hz };
  }

  // The painted front of a building (sign, windows, door), drawn once per texture set. Boards are
  // the building's own painted image (`painted` + wall_boards, the cafe) or the shared pale
  // boards tinted to its colour; the flat set is one solid colour.
  _facadeSets(s) {
    // Composite openings over each building's existing boards; special doors stay procedural.
    const openings = s.buildArt || s.mainStreet;
    const own = s.painted && (this.painted.oil.wall_boards || this.painted.clean.wall_boards);
    const img = (set) => s.buildArt ? (this.painted[set][s.buildArt] || this.painted[set].boards) : (own ? this.painted[set].wall_boards : this.painted[set].boards);
    const tint = s.buildArt ? (s.buildArt === 'house_boards' ? s.wall : null) : own ? null : s.wall;
    const facade = (opts) => T.facadeTextures({ ...s, ...opts });
    const sets = { flat: facade({ flat: true, flatFill: s.buildArt && !tint && (img('oil') || img('clean')) ? T.averageCss(img('oil') || img('clean')) : own && this.painted.oil.wall_boards ? T.averageCss(this.painted.oil.wall_boards) : null }) };
    if (img('oil') || (openings && (this.painted.oil.window || this.painted.oil.door))) sets.oil = facade({ base: img('oil'), tint, windowImage: openings && this.painted.oil.window, doorImage: openings && !s.interior && !s.barn && !s.batwing && this.painted.oil.door });
    if (img('clean') || (openings && (this.painted.clean.window || this.painted.clean.door))) sets.clean = facade({ base: img('clean'), tint, windowImage: openings && this.painted.clean.window, doorImage: openings && !s.interior && !s.barn && !s.batwing && this.painted.clean.door });
    if (!sets.oil && !sets.clean) sets.oil = facade({});
    return sets;
  }

  _frontMaterial(s) {
    const sets = this._facadeSets(s);
    const { map, emissive } = sets.oil || sets.clean;
    const front = new THREE.MeshLambertMaterial({ map, emissiveMap: emissive, emissive: 0xffffff, emissiveIntensity: 0 });
    front.userData.facadeSpec = { ...s };
    front.userData.normalSets = sets;
    front.userData.sets = sets;
    this._familyFacade(front);
    this.surfaces.add(front);
    this.windowMats.push(front);
    return front;
  }

  _familyFacade(front) {
    const u = front.userData, s = u.facadeSpec;
    const sign = familySign(s.sign, this.familyMode && !s.signCustom);
    u.displaySign = sign;
    if (sign !== s.sign) u.familySets ??= this._facadeSets({ ...s, sign });
    u.sets = sign !== s.sign ? u.familySets : u.normalSets;
  }

  setFamilyMode(on) {
    this.familyMode = !!on;
    for (const m of this.windowMats) if (m.userData.facadeSpec) this._familyFacade(m);
    this.setTextureSet(this.textureSet || 'oil');
  }

  // A front wall with a real doorway: three boxes (left, right, over the door) whose fronts show
  // the matching part of the facade painting, so from outside it looks exactly like before.
  _facadePieces(w, fh, dw, dh, mats) {
    const out = [];
    for (const [x0, x1, y0, y1] of [[-w / 2, -dw / 2, 0, fh], [dw / 2, w / 2, 0, fh], [-dw / 2, dw / 2, dh, fh]]) {
      const geo = new THREE.BoxGeometry(x1 - x0, y1 - y0, 0.3);
      geo.translate((x0 + x1) / 2, (y0 + y1) / 2, 0);
      const pos = geo.attributes.position, uv = geo.attributes.uv;
      for (let i = 16; i < 20; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, pos.getY(i) / fh); // the +z face
      out.push(mesh(geo, mats));
    }
    return out;
  }

  wallMat(hslArr) {
    const key = hslArr.join(',');
    if (!this._wallCache[key]) {
      this._wallCache[key] = this.paintedMaterial('boards', 2, 1, { color: tintFor(hslArr) }) || new THREE.MeshLambertMaterial({ map: this.tex.plank, color: C(...hslArr) });
      this.surfaces.add(this._wallCache[key]);
    }
    return this._wallCache[key];
  }

  // A material showing a painted image, in whichever versions exist: `oil` (brushstrokes) and
  // `clean` (smooth cartoon). Null when there is no image of that name at all.
  paintedMaterial(name, rx, ry, extra = {}) {
    const oil = this.painted.oil[name], clean = this.painted.clean[name];
    if (!oil && !clean) return null;
    const sets = {};
    if (oil) sets.oil = T.imageTexture(oil, rx, ry);
    if (clean) sets.clean = T.imageTexture(clean, rx, ry);
    const m = new THREE.MeshLambertMaterial({ map: sets.oil || sets.clean, ...extra });
    m.userData.sets = sets;
    this.surfaces.add(m);
    return m;
  }

  // Swap every surface texture to match the art style:
  //   'oil'   painted images with brushstrokes (oil painting, paper cut)
  //   'clean' smooth cartoon images (animated film, clean 3D); falls back to oil
  //   'flat'  no texture, just each surface's average colour (blocky toy, pixel art)
  setTextureSet(set) {
    this.textureSet = set;
    if (this.waterUniforms) this.waterUniforms.uWaterDetail.value = set === 'flat' ? 0.35 : 1;
    for (const m of this.surfaces) {
      const oldMap = m.map, oldEmissiveMap = m.emissiveMap;
      const u = m.userData;
      u.base ??= { map: m.map, emissiveMap: m.emissiveMap, color: m.color.clone() };
      const entry = u.sets?.[set] ?? (set === 'flat' && !u.keepMap ? 'none' : u.sets?.oil ?? u.sets?.clean ?? null);
      m.color.copy(u.base.color);
      if (entry === 'none') {
        m.map = null;
        if (u.base.map) m.color.multiply(T.averageColor(u.base.map));
      } else if (entry) {
        m.map = entry.map ?? entry;
        if (entry.emissive) m.emissiveMap = entry.emissive;
      } else {
        m.map = u.base.map;
        m.emissiveMap = u.base.emissiveMap;
      }
      if (m.map !== oldMap || m.emissiveMap !== oldEmissiveMap) m.needsUpdate = true;
    }
  }

  // Point lights are created once (changing the light count recompiles every shader).
  _lightPool() {
    this.pool = [];
    for (let i = 0; i < 10; i++) {
      const l = new THREE.PointLight(0xffa850, 0, 20, 2);
      l.position.set(0, -50, 0);
      this.root.add(l);
      this.pool.push({ light: l, used: false });
    }
  }
  _takeLight() {
    const p = this.pool.find((p) => !p.used);
    if (p) p.used = true;
    return p || null;
  }

  _terrain() {
    // fine enough (4.4 m) for the river banks and the railway cutting
    const geo = new THREE.PlaneGeometry(1600, 1600, 360, 360);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, colors = new Float32Array(pos.count * 3);
    const grassA = C(78, 30, 36), grassB = C(46, 46, 54), dirt = C(30, 32, 50), dry = C(40, 42, 62);
    const mud = C(30, 25, 28), lush = C(95, 35, 30), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      pos.setY(i, terrainHeight(x, z));
      const d = Math.hypot(x, z * 0.55), rd = Math.abs(z - riverZ(x));
      const n = fbm(x * 0.02, z * 0.02, 3), n2 = fbm(x * 0.004 + 40, z * 0.004, 3);
      c.copy(grassA).lerp(grassB, smoothstep(0.35, 0.7, n2));
      c.lerp(dry, smoothstep(0.55, 0.8, n) * 0.6);
      c.lerp(lush, (1 - smoothstep(12, 40, rd)) * 0.7); // greener by the water
      c.lerp(mud, 1 - smoothstep(8, 13, rd));
      c.lerp(dirt, Math.min(1, (1 - smoothstep(18, 55, d)) * (0.6 + 0.4 * n)));
      for (const p of PADS) c.lerp(dirt, (1 - smoothstep(p.r * 0.5, p.r, Math.hypot(x - p.x, z - p.z))) * 0.5 * (0.5 + n));
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.terrainBase = Float32Array.from({ length: pos.count }, (_, i) => pos.getY(i));
    geo.computeVertexNormals();
    // brush detail on the ground: from the painted meadow images when there are any
    const { oil, clean } = this.painted, groundSets = {};
    if (oil.meadow) groundSets.oil = T.groundDetailFromImage(oil.meadow, 90);
    if (clean.meadow) groundSets.clean = T.groundDetailFromImage(clean.meadow, 90);
    const groundMat = new THREE.MeshLambertMaterial({ vertexColors: true, map: groundSets.oil || groundSets.clean || T.groundDetailTexture() });
    // Underwater coast ground must not reappear through the distant sea fade.
    groundMat.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vCoastGround;').replace('#include <begin_vertex>','#include <begin_vertex>\nvCoastGround=position;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vCoastGround;').replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nfloat edge=-350.0-18.0*exp(-pow((vCoastGround.z-35.0)/115.0,2.0))+8.0*sin(vCoastGround.z*0.007);if(vCoastGround.x < -330.0 && (vCoastGround.y < -1.01 || (vCoastGround.x<edge+8.0 && vCoastGround.z>-115.0 && vCoastGround.z<195.0))) discard;');};
    groundMat.userData.sets = groundSets;
    this.surfaces.add(groundMat);
    this.ground = mesh(geo, groundMat, false, true);
    this.root.add(this.ground);
    this.walkables.push(this.ground);
  }

  _road() {
    const z0 = -58, len = 330;
    const geo = new THREE.PlaneGeometry(9, len, 2, 220);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, z0 + len / 2);
    const pos = geo.attributes.position, cols = new Float32Array(pos.count * 4);
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i), x = pos.getX(i) + roadX(z), rd = Math.abs(z - riverZ(x));
      pos.setX(i, x);
      // over the river the road rides up onto the bridge deck and fades so the planks show
      pos.setY(i, Math.max(terrainHeight(x, z) + 0.05 + 0.3 * smoothstep(40, 90, z), rd < 16 ? 0.62 : -99));
      cols.set([1, 1, 1, smoothstep(z0, z0 + 10, z) * (1 - smoothstep(z0 + len - 80, z0 + len, z)) * smoothstep(12.5, 14.5, rd)], i * 4);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 4));
    geo.computeVertexNormals();
    const mat = new THREE.MeshLambertMaterial({
      map: this._roadMap(len / 18, len / 14), vertexColors: true, transparent: true, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    });
    this._roadSets(mat, len / 18);
    const m = mesh(geo, mat, false, true);
    m.renderOrder = 1;
    this.root.add(m);
  }

  _town() {
    for (const s of LEFT) this._building({ ...s, mainStreet: true, x: -7.5, rot: Math.PI / 2 });
    for (const s of RIGHT) this._building({ ...s, mainStreet: true, x: 7.5, rot: -Math.PI / 2 });
    for (const [x, z] of [[-5.2, -26], [-5.2, 2], [-5.2, 30], [5.2, -12], [5.2, 17], [5.2, 44]]) this._lanternPost(x, z);
  }

  _building(s) {
    const g = new THREE.Group();
    const two = s.floors === 2, fh = two ? 8 : 5.4, bh = two ? 7.2 : 4.6, depth = s.depth ?? 12, w = s.w;
    const pm = (name, rx, ry, extra) => (s.painted ? this.paintedMaterial(name, rx, ry, extra) : null);
    const wall = (s.buildArt && this.buildWallMat(s)) || pm('wall_boards', 3, 2) || this.wallMat(s.wall), trim = this.wallMat(s.trim);
    const roofMat = pm('roof', 3, 3, { flatShading: true }) || this.mat.roof;
    const front = this._frontMaterial({ ...s, fh, seed: Math.abs(Math.round(s.z * 13 + s.x * 7)) + 1 });

    if (s.interior) {
      // hollow: front wall with a real doorway, wallpapered walls, floor and ceiling
      const inner = pm('wallpaper', 4, 2) || (this.mat.wallpaper ??= new THREE.MeshLambertMaterial({ map: T.wallpaperTexture() }));
      this.surfaces.add(inner);
      const dw = 1.9, dh = 2.7, wt = 0.25, zc = -depth / 2 - 0.15, hx = w / 2 - 0.15 - wt / 2;
      for (const m of this._facadePieces(w, fh, dw, dh, [trim, trim, trim, trim, front, inner])) g.add(m);
      for (const sx of [-1, 1]) {
        const m = mesh(new THREE.BoxGeometry(wt, bh, depth), sx < 0 ? [inner, wall, wall, wall, wall, wall] : [wall, inner, wall, wall, wall, wall]);
        m.position.set(sx * hx, bh / 2, zc);
        g.add(m);
      }
      const back = mesh(new THREE.BoxGeometry(w - 0.3, bh, wt), [wall, wall, wall, wall, inner, wall]);
      back.position.set(0, bh / 2, -depth - 0.15 + wt / 2);
      const floorMat = pm('floor', 4, 3) || (this.mat.floor ??= new THREE.MeshLambertMaterial({ map: this.tex.plank, color: C(25, 38, 34) }));
      this.surfaces.add(floorMat);
      const floor = mesh(new THREE.BoxGeometry(w - 0.8, 0.1, depth - 0.3), floorMat);
      floor.position.set(0, 0.3, zc);
      const ceiling = mesh(new THREE.BoxGeometry(w - 0.6, 0.2, depth - 0.2), this.mat.darkWood);
      ceiling.position.set(0, 3.8, zc);
      g.add(back, floor, ceiling);
      this.interiors[s.interior] = { group: g, w, depth, dw, dh, hx: hx - wt / 2, zc };
    } else {
      const facade = mesh(new THREE.BoxGeometry(w, fh, 0.3), [trim, trim, trim, trim, front, wall]);
      facade.position.set(0, fh / 2, 0);
      g.add(facade);
      const body = mesh(new THREE.BoxGeometry(w - 0.3, bh, depth), wall);
      body.position.set(0, bh / 2, -depth / 2 - 0.15);
      g.add(body);
    }
    const roof = mesh(prism(w + 0.2, 2.4, depth + 0.4), [roofMat, wall, wall]);
    roof.position.set(0, bh, -depth / 2 - 0.15);
    g.add(roof);

    const walk = mesh(new THREE.BoxGeometry(w + 0.3, 0.35, 2.6), this.mat.darkWood);
    walk.position.set(0, 0.175, 1.45);
    g.add(walk);
    this.walkables.push(walk);

    const topY = s.balcony ? 3.7 : 3.3;
    const nPosts = Math.max(2, Math.round(w / 3.2) + 1);
    const posts = [];
    for (let i = 0; i < nPosts; i++) {
      const px = -w / 2 + 0.2 + (i * (w - 0.4)) / (nPosts - 1);
      const top = s.balcony ? topY + 1.0 : topY;
      posts.push(boxAt(0.16, top - 0.35, 0.16, px, 0.35 + (top - 0.35) / 2, 2.55));
    }
    if (s.balcony) {
      const floor = mesh(new THREE.BoxGeometry(w + 0.2, 0.22, 2.7), this.mat.darkWood);
      floor.position.set(0, topY, 1.4);
      g.add(floor);
      posts.push(boxAt(w + 0.2, 0.1, 0.1, 0, topY + 1.0, 2.7));
      for (const sx of [-1, 1]) posts.push(boxAt(0.1, 0.1, 2.6, sx * (w / 2 + 0.05), topY + 1.0, 1.4));
      for (let bx = -w / 2 + 0.3; bx < w / 2; bx += 0.5) posts.push(boxAt(0.06, 0.9, 0.06, bx, topY + 0.55, 2.7));
    } else {
      const awn = mesh(new THREE.BoxGeometry(w + 0.3, 0.12, 2.9), roofMat);
      awn.position.set(0, topY + 0.1, 1.45);
      awn.rotation.x = 0.12;
      g.add(awn);
    }
    g.add(mesh(mergeGeometries(posts), trim));

    if (s.chimney) {
      const ch = mesh(new THREE.BoxGeometry(0.7, 2.6, 0.7), this.mat.stone);
      ch.position.set(w * 0.28, bh + 1.4, -depth * 0.55);
      g.add(ch);
    }
    if (s.hitch) {
      const parts = [boxAt(0.14, 1.1, 0.14, -1.6, 0.55, 3.9), boxAt(0.14, 1.1, 0.14, 1.6, 0.55, 3.9), boxAt(3.6, 0.1, 0.1, 0, 1.0, 3.9)];
      g.add(mesh(mergeGeometries(parts), this.mat.darkWood));
    }

    g.position.set(s.x, s.y ?? 0, s.z);
    g.rotation.y = s.rot;
    this.root.add(g);
    g.updateMatrixWorld(true);
    if (s.interior) {
      const it = this.interiors[s.interior], zc = it.zc, hx = w / 2 - 0.15 - 0.125;
      for (const sx of [-1, 1]) this.colliders.rects.push(this._rectOf(g, sx * hx, zc, 0.125, depth / 2));
      this.colliders.rects.push(this._rectOf(g, 0, -depth - 0.025, w / 2, 0.125));
      for (const sx of [-1, 1]) this.colliders.rects.push(this._rectOf(g, (sx * (w / 2 + it.dw / 2)) / 2, 0, (w / 2 - it.dw / 2) / 2, 0.15));
      this.floors.push({ ...this._rectOf(g, 0, zc, w / 2 - 0.4, depth / 2 - 0.15), y: (s.y ?? 0) + 0.35 });
      this.ceilings.push({ ...this._rectOf(g, 0, zc, w / 2, depth / 2), y: (s.y ?? 0) + 3.7 });
    } else this.colliders.rects.push(this._rectOf(g, 0, -depth / 2 - 0.075, w / 2, depth / 2 + 0.15));
    this.floors.push({ ...this._rectOf(g, 0, 1.45, (w + 0.3) / 2, 1.3), y: (s.y ?? 0) + 0.35 });
    if (s.chimney) this.emitters.push({ type: 'smoke', pos: g.localToWorld(V(w * 0.28, bh + 2.8, -depth * 0.55)), rate: 2.2, acc: 0 });
    return g;
  }

  _lanternPost(x, z, withLight = true, dir = -Math.sign(x)) {
    const g = new THREE.Group();
    g.position.set(x, 0.35, z);
    this.colliders.circles.push({ x, z, r: 0.15 });
    g.add(mesh(mergeGeometries([boxAt(0.14, 3.1, 0.14, 0, 1.55, 0), boxAt(0.7, 0.07, 0.07, dir * 0.3, 3.0, 0)]), this.mat.darkWood));
    const lamp = mesh(new THREE.BoxGeometry(0.26, 0.38, 0.26), this.mat.lantern, false);
    lamp.receiveShadow = false; // A glowing shade should not carry crawling self-shadow edges.
    lamp.position.set(dir * 0.6, 2.72, 0);
    g.add(lamp);
    const halo = new THREE.Sprite(this.haloMat);
    halo.position.copy(lamp.position);
    halo.scale.setScalar(1.8);
    g.add(halo);
    if (withLight) {
      const light = new THREE.PointLight(0xffa850, 0, 18, 2);
      light.position.set(dir * 0.6, 2.6, 0);
      g.add(light);
      this.lanternLights.push(light);
    }
    this.root.add(g);
  }

  _landmarks() {
    this._church({ x: 0, z: -70 });
    this._waterTower(17, -52);
    this._windmill(-26, 54, 0.6);
    // Welcome arch over the road
    {
      const g = new THREE.Group();
      g.add(mesh(mergeGeometries([boxAt(0.45, 6.4, 0.45, -5.6, 3.2, 0), boxAt(0.45, 6.4, 0.45, 5.6, 3.2, 0), boxAt(12.2, 0.45, 0.5, 0, 6.3, 0)]), this.mat.darkWood));
      const signMat = new THREE.MeshLambertMaterial({ map: T.signTexture('SP CREEK') });
      for (const side of [1, -1]) {
        const p = mesh(new THREE.PlaneGeometry(7.2, 1.3), signMat);
        p.position.set(0, 5.3, side * 0.04);
        if (side < 0) p.rotation.y = Math.PI;
        g.add(p);
      }
      g.add(mesh(mergeGeometries([boxAt(0.05, 0.6, 0.05, -3, 5.95, 0), boxAt(0.05, 0.6, 0.05, 3, 5.95, 0)]), this.mat.iron));
      g.position.set(0, 0, 62);
      this.root.add(g);
      for (const x of [-5.6, 5.6]) this.colliders.circles.push({ x, z: 62, r: 0.35 });
    }
  }

  buildWallMat(s) {
    const key = `${s.buildArt}:${s.wall.join(',')}`;
    if (!this._wallCache[key]) this._wallCache[key] = this.paintedMaterial(s.buildArt, 3, 2,
      s.buildArt === 'house_boards' ? { color: tintFor(s.wall) } : {}) || this.wallMat(s.wall);
    return this._wallCache[key];
  }

  _church(s) {
    const g = new THREE.Group(), wall = s.buildArt ? this.buildWallMat(s) : this.wallMat(s.wall || [38, 18, 84]), trim = this.wallMat([25, 25, 35]);
    const front = this._frontMaterial({ buildArt: s.buildArt, w: 10, fh: 7, wall: s.wall || [38, 18, 84], trim: [25, 25, 35], floors: 1, church: true, seed: 99 });
    const facade = mesh(new THREE.BoxGeometry(10, 7, 0.3), [trim, trim, trim, trim, front, wall]);
    facade.position.set(0, 3.5, 8);
    const body = mesh(new THREE.BoxGeometry(9.8, 7, 15.7), wall);
    body.position.set(0, 3.5, -0.15);
    const roof = mesh(prism(10.6, 4.2, 16.6), [this.mat.roof, wall, wall]);
    roof.position.set(0, 7, 0);
    const tower = mesh(new THREE.BoxGeometry(3, 5, 3), wall);
    tower.position.set(0, 9.5, 6.2);
    const spire = mesh(new THREE.ConeGeometry(2.3, 7, 4), this.mat.roof);
    spire.position.set(0, 15.5, 6.2);
    spire.rotation.y = Math.PI / 4;
    const cross = mesh(mergeGeometries([boxAt(0.15, 1.6, 0.15, 0, 19.6, 6.2), boxAt(0.9, 0.15, 0.15, 0, 19.8, 6.2)]), this.mat.iron);
    g.add(facade, body, roof, tower, spire, cross);
    g.position.set(s.x, s.y ?? 0, s.z);
    g.rotation.y = s.rot ?? 0;
    g.scale.x = (s.w ?? 10) / 10;
    this.root.add(g);
    this.colliders.rects.push(this._rectOf(g, 0, 0, (s.w ?? 10) / 2, 8.2));
    return g;
  }

  _waterTower(x, z, scale = 1) {
    {
      const g = new THREE.Group();
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(beam(V(sx * 2.1, 0, sz * 2.1), V(sx * 1.7, 9.6, sz * 1.7), 0.22, this.mat.darkWood));
      for (const y of [3, 6.5]) for (const [a, b] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) {
        const k = 2.1 - (y / 9.6) * 0.4;
        g.add(beam(V(a[0] * k, y, a[1] * k), V(b[0] * k, y, b[1] * k), 0.12, this.mat.darkWood));
      }
      const deck = mesh(new THREE.CylinderGeometry(3.3, 3.3, 0.25, 18), this.mat.darkWood);
      deck.position.y = 9.6;
      const tank = mesh(new THREE.CylinderGeometry(3, 3, 4.2, 18), this.mat.wood);
      tank.position.y = 11.8;
      const top = mesh(new THREE.ConeGeometry(3.4, 2.2, 18), this.mat.roof);
      top.position.y = 15;
      g.add(deck, tank, top);
      for (const y of [10.5, 13.1]) {
        const band = mesh(new THREE.TorusGeometry(3.02, 0.05, 4, 32), this.mat.iron);
        band.rotation.x = Math.PI / 2;
        band.position.y = y;
        g.add(band);
      }
      g.position.set(x, terrainHeight(x, z), z);
      g.scale.setScalar(scale);
      this.root.add(g);
      this.colliders.circles.push({ x, z, r: 2.4 * scale });
      return g;
    }
  }

  _windmill(x, z, rot) {
    {
      const g = new THREE.Group();
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(beam(V(sx * 1.3, 0, sz * 1.3), V(sx * 0.35, 12.2, sz * 0.35), 0.14, this.mat.darkWood));
      for (const y of [4, 8]) {
        const k = 1.3 - (y / 12.2) * 0.95;
        for (const [a, b] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) g.add(beam(V(a[0] * k, y, a[1] * k), V(b[0] * k, y, b[1] * k), 0.08, this.mat.darkWood));
      }
      const head = mesh(new THREE.BoxGeometry(0.7, 0.7, 1.5), this.mat.iron);
      head.position.set(0, 12.6, 0);
      const vane = mesh(new THREE.BoxGeometry(0.04, 1.0, 2.6), this.mat.wood);
      vane.position.set(0, 12.6, -1.9);
      const hub = new THREE.Group();
      hub.position.set(0, 12.6, 0.9);
      for (let i = 0; i < 14; i++) {
        const pivot = new THREE.Group();
        pivot.rotation.z = (i / 14) * Math.PI * 2;
        const blade = mesh(new THREE.BoxGeometry(0.34, 2.4, 0.03), this.mat.wood);
        blade.position.y = 1.6;
        blade.rotation.y = 0.35;
        pivot.add(blade);
        hub.add(pivot);
      }
      g.add(head, vane, hub);
      g.position.set(x, terrainHeight(x, z), z);
      g.rotation.y = rot;
      this.root.add(g);
      this.colliders.circles.push({ x, z, r: 1.5 });
      this.spinners.push({ obj: hub, speed: 0.9 });
      return g;
    }
  }

  // A flat strip draped over the terrain along a smooth path, e.g. a dirt road or a gravel bed.
  _ribbon(points, width, mat, { lift = 0.06, alpha = null, step = 2, fitGround = false } = {}) {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => V(x, 0, z)), false, 'centripetal');
    const n = Math.max(2, Math.ceil(curve.getLength() / (fitGround ? Math.min(step, 0.35) : step)));
    // Wide two-edge strips cut through terrain crests; saved roads follow its rendered triangles.
    const across = fitGround ? Math.max(2, Math.ceil(width / 0.35)) : 1, row = across + 1;
    const pos = [], uv = [], col = [], idx = [];
    let along = 0, prev = null;
    for (let i = 0; i <= n; i++) {
      const p = curve.getPointAt(i / n), t = curve.getTangentAt(i / n);
      if (prev) along += p.distanceTo(prev);
      prev = p;
      const nx = -t.z, nz = t.x, ends = smoothstep(0, 0.04, i / n) * (1 - smoothstep(0.96, 1, i / n));
      for (let j = 0; j <= across; j++) {
        const side = j / across * 2 - 1;
        const x = p.x + nx * side * width / 2, z = p.z + nz * side * width / 2;
        pos.push(x, (fitGround ? this.groundY(x, z) : terrainHeight(x, z)) + lift, z);
        uv.push(j / across, along / 14);
        col.push(1, 1, 1, ends * (alpha ? alpha(x, z) : 1));
      }
      if (i) for (let j = 0; j < across; j++) {
        const a = (i - 1) * row + j, b = i * row + j;
        idx.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const m = mesh(geo, mat, false, true);
    m.renderOrder = 1;
    this.root.add(m);
    return m;
  }

  // Dirt-road texture: the painted road image if there is one, else the code-made one.
  // The road keeps a texture even in 'flat' looks (its soft edges come from the texture).
  _roadMap(paintedRepeat, codeRepeat) {
    const img = this.painted.oil.road || this.painted.clean.road;
    return img ? T.roadFromImage(img, paintedRepeat) : T.roadTexture(codeRepeat);
  }
  _roadSets(mat, repeat) {
    const sets = {};
    if (this.painted.oil.road) sets.oil = T.roadFromImage(this.painted.oil.road, repeat);
    if (this.painted.clean.road) sets.clean = T.roadFromImage(this.painted.clean.road, repeat);
    mat.userData.sets = sets;
    mat.userData.keepMap = true;
    this.surfaces.add(mat);
    return mat;
  }

  _pathMaterial(repeat = 1) {
    const map = this._roadMap(repeat, repeat);
    return this._roadSets(new THREE.MeshLambertMaterial({
      map, vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    }), repeat);
  }

  // Places kept clear of trees, grass and rocks.
  registerAreaPad(spec) {
    const p = { yaw: 0, blend: 12, ...spec };
    p.y ??= terrainHeight(p.x, p.z);
    (this.areaPads ??= []).push(p); userPads.push(p);
    return p;
  }

  registerWaterArea(spec, floors = []) {
    const p = this.registerAreaPad({ ...spec, basin:true, depth:spec.depth??2.2, hx:spec.rx*1.6, hz:spec.rz*1.6 });
    this.colliders.water.push(p); this.floors.push(...floors); userFloors.push(...floors);
    return p;
  }

  _reserved(x, z, pad = 0) {
    if (this.areaPads?.some(p => withinPad(p, x, z, pad))) return true;
    if (this.hamlet?.visible && pondRadius(x,z) < 1.18 + pad / HAMLET.pond.rz) return true;
    if (Math.abs(z - riverZ(x)) < 14 + pad) return true;
    if (Math.abs(x - RAIL_X) < 9 + pad) return true;
    for (const p of PADS) if (Math.hypot(x - p.x, z - p.z) < p.r * 0.75 + pad) return true;
    if (x > 48 && x < 82 && z > -20 && z < 50) return true; // station
    if (x > 35 && x < 62 && Math.abs(z - riverZ(x) - 12) < 12) return true; // mill
    return false;
  }

  // ---------- the river, its road bridge and the water mill ----------
  _river() {
    const pos = [], uv = [], idx = [], W = 11;
    let n = 0;
    for (let x = -460; x <= 460; x += 4, n++) {
      const z = riverZ(x);
      pos.push(x, WATER_Y, z - W, x, WATER_Y, z + W);
      uv.push(x / 16, 0, x / 16, 1);
      if (n) idx.push(n * 2 - 2, n * 2 - 1, n * 2, n * 2 - 1, n * 2 + 1, n * 2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    this.water = mesh(geo, this._waterMaterial(0), false, true);
    this.water.renderOrder = 2;
    this.root.add(this.water);

    // road bridge, lined up with the road where it crosses
    let bz = 150;
    for (let i = 0; i < 8; i++) bz = riverZ(roadX(bz));
    const bx = roadX(bz), yaw = Math.atan((roadX(bz + 1) - roadX(bz - 1)) / 2);
    const b = new THREE.Group();
    const deck = mesh(new THREE.BoxGeometry(7.4, 0.3, 30), this.mat.darkWood);
    deck.position.y = 0.45;
    b.add(deck);
    const parts = [];
    for (let z = -15; z <= 15; z += 3) for (const x of [-3.6, 3.6]) parts.push(boxAt(0.16, 1.1, 0.16, x, 1.1, z));
    for (const x of [-3.6, 3.6]) parts.push(boxAt(0.12, 0.14, 30.2, x, 1.6, 0), boxAt(0.08, 0.1, 30.2, x, 1.1, 0));
    for (const z of [-9, -3, 3, 9]) {
      for (const x of [-2.8, 0, 2.8]) parts.push(boxAt(0.4, 3.2, 0.4, x, -1.3, z));
      parts.push(boxAt(7, 0.3, 0.4, 0, 0.15, z));
    }
    b.add(mesh(mergeGeometries(parts), this.mat.wood));
    b.position.set(bx, 0, bz);
    b.rotation.y = yaw;
    this.root.add(b);
    b.updateMatrixWorld(true);
    let foamIndex = 0;
    for (const z of [-9,-3,3,9]) for (const x of [-2.8,0,2.8]) {
      const p = b.localToWorld(V(x,0,z)); this.waterUniforms.uWaterFoam.value[foamIndex++].set(p.x,p.z,0.5);
    }
    this.walkables.push(deck);
    this.floors.push({ ...this._rectOf(b, 0, 0, 3.7, 15), y: 0.6 });
    for (const x of [-3.6, 3.6]) {
      const a = b.localToWorld(V(x, 0, -15)), e = b.localToWorld(V(x, 0, 15));
      this.colliders.segs.push({ ax: a.x, az: a.z, bx: e.x, bz: e.z });
    }

    // water mill on the north bank, its wheel turning in the current
    const mx = 48, mz = riverZ(mx);
    const house = new THREE.Group();
    house.add(mesh(new THREE.BoxGeometry(9, 2.2, 8), this.mat.stone).translateY(1.1));
    const wall = this.wallMat([30, 35, 42]);
    house.add(mesh(new THREE.BoxGeometry(8.6, 4, 7.6), wall).translateY(4.2));
    house.add(mesh(prism(9.4, 3, 8.4), [this.mat.roof, wall, wall]).translateY(6.2));
    const dark = new THREE.MeshLambertMaterial({ color: C(25, 30, 12) });
    for (const [x, y, z] of [[-2.2, 4.4, -3.82], [2.2, 4.4, -3.82], [0, 1.2, -4.02]]) house.add(mesh(new THREE.BoxGeometry(z < -4 ? 1.4 : 1.1, z < -4 ? 2 : 1.3, 0.1), dark).translateX(x).translateY(y).translateZ(z));
    house.position.set(mx, 0, mz + 16);
    this.root.add(house);
    this.colliders.rects.push(this._rectOf(house, 0, 0, 4.5, 4));
    const wheel = new THREE.Group();
    for (const z of [-0.55, 0.55]) wheel.add(mesh(new THREE.TorusGeometry(2.8, 0.09, 6, 28), this.mat.darkWood).translateZ(z));
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const paddle = mesh(new THREE.BoxGeometry(0.12, 0.9, 1.2), this.mat.wood);
      paddle.position.set(Math.cos(a) * 2.45, Math.sin(a) * 2.45, 0);
      paddle.rotation.z = a;
      wheel.add(paddle);
      if (i % 2 === 0) {
        const spoke = mesh(new THREE.BoxGeometry(5.6, 0.12, 0.12), this.mat.darkWood);
        spoke.rotation.z = a;
        wheel.add(spoke);
      }
    }
    wheel.position.set(mx, 1.2, mz + 8.2);
    this.waterUniforms.uWaterFoam.value[12].set(mx,mz + 8.2,2.2);
    this.root.add(wheel);
    this.spinners.push({ obj: wheel, speed: 0.6 });
    const axle = mesh(new THREE.CylinderGeometry(0.15, 0.15, 4.4, 8), this.mat.iron);
    axle.rotation.x = Math.PI / 2;
    axle.position.set(mx, 1.2, mz + 10.2);
    this.root.add(axle);
    this.emitters.push({ type: 'smoke', pos: V(mx + 2.5, 0, mz + 6.5), rate: 1.2, acc: 0, life: 3, s0: 0.6, s1: 2.5, alpha: 0.12, rise: 0.5 }); // spray
  }

  _waterMaterial(kind) {
    const mat = waterMaterial(kind,this.waterShared); this.waterMats.push(mat); return mat;
  }

  updateWaterMood(c, sunDir) {
    const u=this.waterUniforms;
    u.uWaterSky.value.copy(c.skyTop);u.uWaterHorizon.value.copy(c.skyHorizon).lerp(new THREE.Color(0x448c9c),0.45);
    u.uWaterBank.value.copy(c.hemiGround).lerp(new THREE.Color(0x193a31),0.4).multiplyScalar(0.65);
    u.uWaterSun.value.copy(c.sunColor).multiplyScalar(c.sunIntensity * 0.35);u.uWaterSunDir.value.copy(sunDir);
    u.uWaterFoamColor.value.copy(c.hemiSky).lerp(c.sunColor,0.25).multiplyScalar(c.hemiIntensity*0.45+c.sunIntensity*0.12);
    for (const mat of this.waterMats) mat.color.set(0x278b9c).lerp(c.skyTop,0.25).multiplyScalar((0.65 + c.sunIntensity * 0.08) * (1 - c.stars * 0.72));
  }

  inPond(x,z,margin=0) {
    return this.colliders.water.some(p => Math.abs(x-p.x)<p.rx*1.1*(1+margin/p.rz) && Math.abs(z-p.z)<p.rz*1.1*(1+margin/p.rz) && pondRadius(x,z,p)<1+margin/p.rz);
  }
  waterLevel(x,z) { return this.colliders.water.find(p => pondRadius(x,z,p)<1)?.y ?? WATER_Y; }

  createSea(floors=[]) {
    const area={x:-1100,z:0,rx:1000,rz:1200,y:WATER_Y,sea:true};this.colliders.water.push(area);
    this.floors.push(...floors);userFloors.push(...floors);
    // A soft waterline barrier, with a gap only for the railed, floored pier.
    for(let z=-800;z<800;z+=4)if(z<28||z>=32)this.colliders.segs.push({ax:coastX(z)+0.6,az:z,bx:coastX(z+4)+0.6,bz:z+4});
    const pos=[],uv=[],idx=[],cols=96,rows=800;
    for(let j=0;j<=rows;j++){const z=-1000+j*2.5,edge=coastX(z);for(let i=0;i<=cols;i++){pos.push(edge-3000*Math.pow(1-i/cols,3),WATER_Y,z);uv.push(z/18,1-Math.pow(1-i/cols,3));}}
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;idx.push(a,b,a+1,b,b+1,a+1);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
    const mat=this._waterMaterial(0),before=mat.onBeforeCompile;
    mat.userData.waterUniforms.uWaterDetail={value:0.22};mat.fog=false;
    mat.onBeforeCompile=(shader,renderer)=>{before(shader,renderer);Object.assign(shader.uniforms,mat.userData.covePicture||{});shader.fragmentShader=shader.fragmentShader
      .replace('#include <common>','#include <common>\nuniform sampler2D uCovePicture; uniform vec3 uCoveTint; uniform float uCoveRotation,uCoveHeight,uCoveFade;')
      .replace('float shore = uWaterKind < 0.5 ? abs(vWaterUV.y * 2.0 - 1.0) * 1.09 : length(vWaterUV * 2.0 - 1.0);','float shore = clamp(1.0-(1.0-vWaterUV.y)*3000.0/14.0+sin(uWaterTime*0.22+wp.y*0.025)*0.025,0.0,1.0);')
      .replace('float banks = smoothstep(0.40, 0.96, shore);','float banks = 0.0;')
      .replace('glint * 0.22','glint * 0.07').replace('float foam = smoothstep(0.88, 0.99, shore) * smoothstep(0.15, 0.75, broken) * 0.28;','float foam = smoothstep(0.88,0.96,shore)*(1.0-smoothstep(0.98,1.0,shore))*0.32;')
      .replace('#include <opaque_fragment>','vec3 ray=vCloudWorld-cameraPosition;float dist=length(ray.xz);float theta=mod(atan(ray.x,ray.z)-uCoveRotation+6.2831853,6.2831853);vec2 pictureUV=vec2(1.0-(theta-3.14159265)/3.14159265,0.435+ray.y/max(0.1,dist)*1800.0/uCoveHeight);vec3 picture=texture2D(uCovePicture,pictureUV).rgb*uCoveTint;picture=mix(uWaterHorizon*0.45,picture,uCoveFade);outgoingLight=mix(outgoingLight,picture,smoothstep(25.0,140.0,dist)*smoothstep(0.06,0.25,pictureUV.y));diffuseColor.a=1.0;\n#include <opaque_fragment>');};
    mat.customProgramCacheKey=()=> 'cove-sea-v1';const sea=mesh(geo,mat,false,true);sea.name='Sunset Cove sea';sea.renderOrder=2;this.root.add(sea);return {area,sea};
  }

  palmGeometry() {
    const trunk=[],leaves=[];
    for(let i=0;i<9;i++){const g=new THREE.CylinderGeometry(0.18-i*0.01,0.22-i*0.01,0.9,9);g.translate(Math.sin(i*0.14)*0.7,i*0.82+0.45,0);trunk.push(g);}
    for(let i=0;i<9;i++){
      const a=i*Math.PI*2/9,verts=[],uv=[],indices=[];
      for(let j=0;j<=9;j++){const u=j/9,r=u*4.3,y=7.5+Math.sin(u*Math.PI)*1.1-u*2.2,w=Math.sin(u*Math.PI)*0.42+0.015;
        for(const side of [-1,1]){verts.push(0.65+Math.cos(a)*r-Math.sin(a)*w*side,y,Math.sin(a)*r+Math.cos(a)*w*side);uv.push(u,side>0?1:0);}
        if(j){const n=j*2;indices.push(n-2,n,n-1,n-1,n,n+1);}}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();leaves.push(g);
    }
    return {trunk:mergeGeometries(trunk),leaves:mergeGeometries(leaves)};
  }

  _pond() {
    const p=HAMLET.pond, y=terrainHeight(p.x,p.z)-0.3;
    pondPad={...p,y,active:true};
    const g=new THREE.Group();g.position.set(p.x,y,p.z);this.root.add(g);
    const geo=new THREE.CircleGeometry(1,96), a=geo.attributes.position;
    for(let i=1;i<a.count;i++) {
      const x=a.getX(i),z=-a.getY(i),angle=Math.atan2(z,x),r=1+0.06*Math.sin(angle*3+0.5)+0.035*Math.cos(angle*5);
      a.setXYZ(i,x*p.rx*r,a.getY(i)*p.rz*r,0);
    }
    geo.rotateX(-Math.PI/2);geo.computeBoundingSphere();
    const water=mesh(geo,this._waterMaterial(1),false,true);water.renderOrder=2;g.add(water);
    const start=-p.rz*1.2, planks=[];
    for(let i=0;i<19;i++) {
      const plank=boxAt(2.5,0.12,0.31,0,0.32,start+i*0.37),color=C(31,35,59+(i%3)*3),cols=new Float32Array(plank.attributes.position.count*3);
      for(let k=0;k<cols.length;k+=3)cols.set([color.r,color.g,color.b],k);plank.setAttribute('color',new THREE.BufferAttribute(cols,3));planks.push(plank);
    }
    const deck=mesh(mergeGeometries(planks),new THREE.MeshLambertMaterial({vertexColors:true}));g.add(deck);
    const colliders=[],posts=[];
    for(const [x,z] of [[-1.1,start+0.6],[1.1,start+0.6],[1.1,start+6.2]]) {
      posts.push(boxAt(0.18,2.1,0.18,x,-0.45,z));colliders.push({x:p.x+x,z:p.z+z,r:0.12});
    }
    g.add(mesh(mergeGeometries(posts),new THREE.MeshLambertMaterial({color:C(29,32,56)})));
    const lantern=mesh(new THREE.BoxGeometry(0.22,0.3,0.22),this.mat.lantern,false);lantern.position.set(1.1,0.78,start+0.6);g.add(lantern);
    const halo=new THREE.Sprite(this.haloMat);halo.position.copy(lantern.position);halo.scale.setScalar(1.5);g.add(halo);
    for(let i=0;i<3;i++)this.waterUniforms.uWaterFoam.value[13+i].set(colliders[i].x,colliders[i].z,0.3);
    g.updateMatrixWorld(true);
    const floor={...this._rectOf(g,0,start+3.33,1.25,3.5),y:y+0.38};
    this.floors.push(floor);userFloors.push(floor);this.walkables.push(deck);this.colliders.circles.push(...colliders);
    const area={kind:'pond',...p,y};this.colliders.water.push(area);
    const reeds=[],tips=[];
    for(let i=0;i<28;i++) {
      const cluster=i<10?0:i<16?1:i<24?2:3;
      const angle=[0.22,0.58,2.55,2.93][cluster]+(hash2(i,61)-0.5)*0.3, radius=1.04+hash2(i,41)*0.14;
      const factor=1+0.06*Math.sin(angle*3+0.5)+0.035*Math.cos(angle*5);
      const x=Math.cos(angle)*p.rx*factor*radius,z=Math.sin(angle)*p.rz*factor*radius;
      const bottom=terrainHeight(p.x+x,p.z+z)-y;
      for(let j=0;j<1+i%3;j++) {
        const h=0.55+hash2(i,j+13)*0.95,dx=x+(j-1)*0.12;
        reeds.push(boxAt(0.025,h,0.025,dx,bottom+h/2,z));
        const leaf=boxAt(0.045,h*0.65,0.02,0,0,0);leaf.rotateZ((j-1)*0.36+0.3);leaf.translate(dx,bottom+h*0.45,z);reeds.push(leaf);
        const tip=new THREE.CylinderGeometry(0.045,0.045,0.24,6);tip.translate(dx,bottom+h,z);tips.push(tip);
      }
    }
    const reedMat=new THREE.MeshLambertMaterial({color:C(82,35,35),side:THREE.DoubleSide});this._sway(reedMat,2,0.04);
    const tipMat=new THREE.MeshLambertMaterial({color:C(28,35,28)});this._sway(tipMat,2,0.04);
    g.add(mesh(mergeGeometries(reeds),reedMat),mesh(mergeGeometries(tips),tipMat));
    const pads=[],flowers=[];
    for(let i=0;i<9;i++) {
      const angle=0.2+i*0.65,r=0.25+hash2(i,22)*0.42,x=Math.cos(angle)*p.rx*r,z=Math.sin(angle)*p.rz*r;
      const pad=new THREE.CircleGeometry(0.28+hash2(i,91)*0.22,20,0.1,Math.PI*1.84);pad.rotateX(-Math.PI/2);pad.rotateY(i);pad.translate(x,0.035,z);pads.push(pad);
      if(i%4===0)for(let k=0;k<5;k++) {
        const petal=new THREE.SphereGeometry(0.065,8,6);petal.scale(1,0.45,1.5);petal.rotateY(k*Math.PI*0.4);petal.translate(x+Math.sin(k*Math.PI*0.4)*0.06,0.08,z+Math.cos(k*Math.PI*0.4)*0.06);flowers.push(petal);
      }
    }
    g.add(mesh(mergeGeometries(pads),new THREE.MeshLambertMaterial({color:C(102,38,38),side:THREE.DoubleSide}),false),mesh(mergeGeometries(flowers),new THREE.MeshLambertMaterial({color:C(330,45,82)}),false));
    const bankGeo=new THREE.PlaneGeometry(44,38,88,76);bankGeo.rotateX(-Math.PI/2);bankGeo.translate(p.x,0,p.z);
    const bp=bankGeo.attributes.position,uv=bankGeo.attributes.uv,colors=new Float32Array(bp.count*3),source=this.ground.geometry.attributes.color;
    for(let i=0;i<bp.count;i++) {
      const x=bp.getX(i),z=bp.getZ(i),index=Math.round((z+800)/1600*360)*361+Math.round((x+800)/1600*360);
      uv.setXY(i,(x+800)/1600,1-(z+800)/1600);colors.set([source.getX(index),source.getY(index),source.getZ(index)],i*3);
    }
    bankGeo.setAttribute('color',new THREE.BufferAttribute(colors,3));
    const bank=mesh(bankGeo,this.ground.material,false,true);this.root.add(bank);this.walkables.push(bank);
    dressPondShore(this,g,p,y);
    this.hamlet.pond={obj:g,water,bank,deck,floor,colliders,area,reeds:reedMat,pad:pondPad};
  }

  // ---------- railway, station and water tank ----------
  _railway() {
    const X = RAIL_X, z0 = -340, z1 = 340, rz = riverZ(X);
    const overRiver = (x, z) => smoothstep(13, 15, Math.abs(z - riverZ(x)));
    const gravel = new THREE.MeshLambertMaterial({ map: T.gravelTexture((z1 - z0) / 14), vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    gravel.map.repeat.set(1, 1);
    this._ribbon([[X, z0], [X, 0], [X, z1]], 4.6, gravel, { lift: 0.18, alpha: overRiver });

    const ties = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 0.14, 0.26), this.mat.darkWood, Math.ceil((z1 - z0) / 0.75));
    const m4 = new THREE.Matrix4();
    let k = 0;
    for (let z = z0; z < z1; z += 0.75) ties.setMatrixAt(k++, m4.makeTranslation(X, 0.3, z));
    ties.count = k;
    ties.receiveShadow = ties.castShadow = true;
    ties.computeBoundingSphere();
    this.root.add(ties);
    this.root.add(mesh(mergeGeometries([boxAt(0.09, 0.14, z1 - z0, X - 0.72, 0.44, (z0 + z1) / 2), boxAt(0.09, 0.14, z1 - z0, X + 0.72, 0.44, (z0 + z1) / 2)]), this.mat.iron));

    // timber trestle over the river
    const parts = [];
    for (let z = rz - 15; z <= rz + 15; z += 3.5) {
      for (const sx of [-1, 1]) parts.push(boxAt(0.3, 3.1, 0.3, X + sx * 1.1, -1.3, z));
      parts.push(boxAt(3, 0.25, 0.32, X, 0.12, z));
    }
    for (const sx of [-1, 1]) parts.push(boxAt(0.25, 0.3, 30, X + sx * 1.1, 0.0, rz));
    this.root.add(mesh(mergeGeometries(parts), this.mat.darkWood));
    for (let z = rz - 15; z < rz + 15; z += 3.5) {
      for (const sx of [-1, 1]) this.root.add(beam(V(X + sx * 1.1, -2.6, z), V(X - sx * 1.1, 0, z + 3.5), 0.12, this.mat.darkWood));
    }

    // Build after the hamlet pads exist, so the new rails use the finished valley ground.
    this.buildTrainSpur=()=>{
      if(this.trainSpur)return;const padStart=this.areaPads?.length||0;const root=new THREE.Group();root.name='Willow and seaside railway';this.root.add(root);this.trainSpur={root,halts:[]};
      const count=Math.ceil(TRAIN_SPUR_LENGTH/4),spacing=TRAIN_SPUR_LENGTH/count,raw=Array.from({length:count+1},(_,i)=>{const p=TRAIN_SPUR_CURVE.getPointAt(i/count);return terrainHeight(p.x,p.z)+0.51;});
      trainGrade=raw.map((_,i)=>{let sum=0,n=0;for(let j=Math.max(0,i-5);j<=Math.min(count,i+5);j++){sum+=raw[j];n++;}return sum/n;});trainGrade[0]=raw[0];
      for(let i=1;i<=count;i++)trainGrade[i]=THREE.MathUtils.clamp(trainGrade[i],trainGrade[i-1]-spacing*0.1,trainGrade[i-1]+spacing*0.1);
      // Smooth only the new railway corridor, keeping coaches clear of steep natural banks.
      for(let i=1;i<=count;i++){const p=sampleTrainTrack(i*spacing);this.registerAreaPad({x:p.pos.x,z:p.pos.z,y:p.pos.y-0.51,hx:2.5,hz:2.2,yaw:p.yaw,blend:5});}
      for(let d=30;d<=TRAIN_SPUR_LENGTH;d+=8){const p=sampleTrainTrack(d).pos;this.registerAreaPad({x:p.x,z:p.z,hx:6,hz:6,blend:0,clearOnly:true});}
      this._ribbon(TRAIN_SPUR_POINTS,4.6,this._pathMaterial(),{lift:0.22});
      const ties=[],rails=[],up=V(0,1,0);for(let d=0;d<TRAIN_SPUR_LENGTH;d+=0.8){const f=sampleTrainTrack(d);ties.push(new THREE.BoxGeometry(2.6,0.14,0.26).rotateY(f.yaw).translate(f.pos.x,f.pos.y-0.18,f.pos.z));}
      for(let d=0;d<TRAIN_SPUR_LENGTH;d+=2){const a=sampleTrainTrack(d),b=sampleTrainTrack(Math.min(TRAIN_SPUR_LENGTH,d+2));for(const side of [-1,1]){const p=a.pos.clone().add(V(Math.cos(a.yaw)*side*0.72,-0.04,-Math.sin(a.yaw)*side*0.72)),q=b.pos.clone().add(V(Math.cos(b.yaw)*side*0.72,-0.04,-Math.sin(b.yaw)*side*0.72)),delta=q.clone().sub(p);rails.push(new THREE.CylinderGeometry(0.055,0.055,delta.length(),6).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up,delta.clone().normalize())).translate(...p.add(q).multiplyScalar(0.5).toArray()));}}
      root.add(mesh(mergeGeometries(ties),this.mat.darkWood),mesh(mergeGeometries(rails),this.mat.iron));for(const g of [...ties,...rails])g.dispose();
      for(const halt of TRAIN_HALTS){const f=sampleTrainTrack(halt.distance-11.4),g=new THREE.Group();g.position.copy(f.pos);g.rotation.y=f.yaw;root.add(g);
        const box=(w,h,d,x,y,z,m=this.mat.wood)=>{const o=mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o;};
        const platform=box(4.2,0.3,12,-3.8,0.15,0);platform.updateWorldMatrix(true,false);this.walkables.push(platform);this.floors.push({...this._rectOf(platform,0,0,2.1,6),y:f.pos.y+0.3});
        for(const z of [-4.5,4.5]){box(0.14,2.8,0.14,-5.5,1.7,z);box(0.14,2.8,0.14,-2.2,1.7,z);}box(4,0.18,11,-3.8,3.1,0,this.mat.roof);
        for(let z=-5;z<=5;z+=1){box(0.12,1.1,0.12,-5.8,0.85,z);box(0.12,1.1,0.12,-1.7,0.85,z);}for(const x of [-5.8,-1.7])box(0.1,0.12,12,x,1.35,0);
        const sign=mesh(new THREE.BoxGeometry(0.08,0.8,6),new THREE.MeshLambertMaterial({map:T.signTexture(halt.name.toUpperCase(),768,128)}));sign.position.set(-2.2,2.5,0);g.add(sign);
        const bench=this.makeProp('bench');bench.position.set(-4.2,0.3,0);bench.rotation.y=Math.PI/2;g.add(bench);
        this.trainSpur.halts.push({name:halt.name,root:g,platform,pos:f.pos.clone(),yaw:f.yaw});
        g.updateWorldMatrix(true,false);const deckCenter=g.localToWorld(V(-3.8,0,0));this.registerAreaPad({x:deckCenter.x,z:deckCenter.z,hx:2.1,hz:6,blend:1,y:f.pos.y-0.25,yaw:f.yaw});
        for(const x of [-5.8,-1.7])this.colliders.rects.push(this._rectOf(g,x,0,0.12,6));
        for(const z of [-6,6])for(const x of [-5,-2.6]){box(1.6,0.12,0.1,x,1.35,z);this.colliders.rects.push(this._rectOf(g,x,z,0.8,0.12));}
      }
      this.trainSpur.pads=this.areaPads.slice(padStart);
      this.refreshTrainGrade=()=>{const pads=this.trainSpur.pads;if(userPads.at(-1)===pads.at(-1))return;for(const p of pads){const i=userPads.indexOf(p);if(i>=0)userPads.splice(i,1);userPads.push(p);}this.updateTerrain();};
      this.updateTerrain();
    };

    // station: its front and platform face the track
    this._building({ sign: 'SP CREEK STATION', z: 10, w: 18, floors: 1, wall: [32, 40, 60], trim: [0, 0, 90], signBg: [210, 30, 25], signInk: '#f2e6c8', chimney: true, x: 60.5, rot: Math.PI / 2 });
    const platform = mesh(new THREE.BoxGeometry(5.15, 0.35, 34), this.mat.darkWood);
    // Meet the station porch without overlapping its coplanar top face.
    platform.position.set(65.825, 0.175, 10);
    this.root.add(platform);
    platform.updateMatrixWorld();
    this.walkables.push(platform);
    this.floors.push({ ...this._rectOf(platform, 0, 0, 2.575, 17), y: 0.35 });
    for (const z of [-4, 10, 24]) this._lanternPost(67.9, z, false, -1);
    this._waterTower(77, 42, 0.75);
    this._ribbon([[4, -2.8], [22, -2.8], [40, 0], [52, 8], [58, 20.5], [64, 22]], 4.5, this._pathMaterial());
  }

  // ---------- the ranch west of town ----------
  _ranch() {
    const { x, z, y } = RANCH;
    this._building({ sign: null, z: z + 7, w: 10, floors: 2, wall: [40, 25, 78], trim: [5, 45, 35], chimney: true, x: x - 21, y, rot: Math.PI / 2 });
    this._building({ sign: 'BAR-H RANCH', z: z - 25, w: 14, floors: 1, barn: true, wall: [5, 50, 38], trim: [40, 20, 85], signBg: [40, 20, 85], signInk: '#4a1a10', x: x - 3, y, rot: 0 });
    this._fence([[x + 3, z - 7], [x + 21, z - 7], [x + 21, z + 15], [x + 3, z + 15], [x + 3, z + 4]]);
    this._windmill(x + 17, z - 25, 1.2);
    this._ribbon([[-4, -56], [-20, -58], [-45, -56], [-70, -52], [x + 2, z + 5]], 4, this._pathMaterial());
  }

  // ---------- the forest camp on the wooded hill ----------
  _camp() {
    const { x, z, y } = CAMP;
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + 0.4;
      const tent = makeCanvasTent(i%2);
      tent.position.set(x + Math.cos(a) * 6, y, z + Math.sin(a) * 6);
      tent.rotation.y = Math.atan2(-Math.cos(a),-Math.sin(a));
      this.root.add(tent);
      this.colliders.circles.push({ x: tent.position.x, z: tent.position.z, r: 2.3 });
    }
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + 1.45;
      const log = mesh(new THREE.CylinderGeometry(0.22, 0.24, 2, 8), this.mat.darkWood);
      log.rotation.set(0, -a, Math.PI / 2, 'YXZ');
      log.position.set(x + Math.cos(a) * 2.7, y + 0.2, z + Math.sin(a) * 2.7);
      this.root.add(log);
    }
  }

  _treeGeo(kind, seed) {
    const r = T.rng(seed), parts = [];
    const push = (geo, base, jitterL = 0.06) => {
      const g = geo.index ? geo.toNonIndexed() : geo;
      const pos = g.attributes.position, n = pos.count, cols = new Float32Array(n * 3), col = new THREE.Color();
      let ymin = Infinity, ymax = -Infinity;
      for (let i = 0; i < n; i++) { const y = pos.getY(i); ymin = Math.min(ymin, y); ymax = Math.max(ymax, y); }
      for (let i = 0; i < n; i += 3) {
        col.copy(base).offsetHSL((r() - 0.5) * 0.03, 0, (r() - 0.5) * jitterL);
        for (let k = 0; k < 3; k++) {
          const lift = 0.8 + (0.4 * (pos.getY(i + k) - ymin)) / (ymax - ymin + 1e-3);
          cols.set([col.r * lift, col.g * lift, col.b * lift], (i + k) * 3);
        }
      }
      g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      parts.push(g);
    };
    const trunk = C(25, 30, 22);
    if (kind === 'pine') {
      const t = new THREE.CylinderGeometry(0.18, 0.3, 3, 6);
      t.translate(0, 1.5, 0);
      push(t, trunk);
      const leaf = seed % 2 ? C(150, 22, 20) : C(130, 24, 24);
      for (let k = 0; k < 5; k++) {
        const cone = new THREE.ConeGeometry(2.4 - k * 0.42, 2.8, 7);
        cone.translate((r() - 0.5) * 0.3, 2.4 + k * 1.45, (r() - 0.5) * 0.3);
        push(cone, leaf);
      }
    } else {
      const t = new THREE.CylinderGeometry(0.22, 0.38, 4.2, 6);
      t.translate(0, 2.1, 0);
      push(t, trunk);
      const a = kind === 'gold' ? C(42, 62, 44) : C(80, 32, 30), b = kind === 'gold' ? C(30, 60, 40) : C(60, 40, 34);
      for (let k = 0; k < 7; k++) {
        const blob = new THREE.IcosahedronGeometry(1.5 + r() * 1.1, 1);
        blob.scale(1, 0.8, 1);
        blob.translate((r() - 0.5) * 3, 4.2 + r() * 2.6, (r() - 0.5) * 3);
        push(blob, a.clone().lerp(b, r()));
      }
    }
    return mergeGeometries(parts);
  }

  _nature() {
    this.treeGeos = [this._treeGeo('oak', 1), this._treeGeo('oak', 2), this._treeGeo('gold', 3), this._treeGeo('pine', 4), this._treeGeo('pine', 5)];
    const r = T.rng(77), up = V(0, 1, 0), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = V(), p = V();
    const buckets = this.treeGeos.map(() => []);
    let count = 0;
    for (let tries = 0; count < 520 && tries < 20000; tries++) {
      const x = (r() - 0.5) * 680, z = (r() - 0.5) * 680;
      if (Math.hypot(x, z) > 335 || Math.hypot(x, z * 0.55) < 30) continue;
      if (Math.abs(x) < 23 && z > -85 && z < 72) continue;
      if (Math.abs(x - roadX(z)) < 9 && z > 0) continue;
      if (this._reserved(x, z)) continue;
      const dens = fbm(x * 0.011 + 5, z * 0.011 - 2, 3);
      if (r() > smoothstep(0.42, 0.68, dens) * 0.95 + 0.03) continue;
      const h = terrainHeight(x, z);
      const v = h > 22 || dens > 0.66 ? (r() < 0.5 ? 3 : 4) : r() < 0.25 ? 2 : r() < 0.5 ? 0 : 1;
      const sc = 0.8 + r() * 0.9;
      p.set(x, h - 0.2, z);
      q.setFromAxisAngle(up, r() * 6.28);
      s.set(sc, sc * (0.85 + r() * 0.3), sc);
      buckets[v].push(m4.compose(p, q, s).clone());
      this.colliders.circles.push({ x, z, r: 0.45 * sc });
      count++;
    }
    // a thick pine wood round the camp, a few shade trees round the ranch
    const plant = (x, z, v, sc) => {
      this.colliders.circles.push({ x, z, r: 0.45 * sc });
      p.set(x, terrainHeight(x, z) - 0.2, z);
      q.setFromAxisAngle(up, r() * 6.28);
      s.set(sc, sc * (0.85 + r() * 0.3), sc);
      buckets[v].push(m4.compose(p, q, s).clone());
    };
    for (let i = 0; i < 110; i++) {
      const a = r() * 6.28, d = 13 + Math.pow(r(), 0.7) * 55, x = CAMP.x + Math.cos(a) * d, z = CAMP.z + Math.sin(a) * d;
      if (!this._reserved(x, z)) plant(x, z, r() < 0.5 ? 3 : 4, 0.9 + r() * 0.8);
    }
    for (let i = 0; i < 26; i++) {
      const a = r() * 6.28, d = 34 + r() * 36, x = RANCH.x + Math.cos(a) * d, z = RANCH.z + Math.sin(a) * d;
      // none on the town side, so the view from the overlook stays open
      if (!this._reserved(x, z) && Math.hypot(x, z * 0.55) > 30 && x < RANCH.x + 22) plant(x, z, Math.floor(r() * 3), 0.9 + r() * 0.6);
    }
    for (let i = 0; i < 40; i++) {
      // willows and oaks along the river banks
      const x = (r() - 0.5) * 500, z = riverZ(x) + (r() < 0.5 ? -1 : 1) * (16 + r() * 14);
      if (!this._reserved(x, z) && Math.abs(x - roadX(z)) > 10 && Math.hypot(x, z) < 330) plant(x, z, r() < 0.7 ? 0 : 2, 0.9 + r() * 0.5);
    }

    this.lowPoly = []; // the code-made plants, shown in the flat (toy) look or when no painted ones exist
    buckets.forEach((list, i) => {
      if (!list.length) return;
      const im = new THREE.InstancedMesh(this.treeGeos[i], this.mat.foliage, list.length);
      im.userData.rootRadius = 0.4;
      list.forEach((m, k) => im.setMatrixAt(k, m));
      im.castShadow = im.receiveShadow = true;
      im.computeBoundingSphere();
      this.root.add(im);
      this.lowPoly.push(im);
    });
    const spots = { trees: buckets, grass: [], flowers: [] };

    // grass tufts
    const grassGeo = new THREE.ConeGeometry(0.09, 0.75, 3);
    grassGeo.translate(0, 0.37, 0);
    const N = 9000, grass = new THREE.InstancedMesh(grassGeo, new THREE.MeshLambertMaterial(), N);
    const gA = C(70, 40, 40), gB = C(46, 55, 58), col = new THREE.Color(), e = new THREE.Euler();
    let k = 0;
    const blocked = (x, z) =>
      (Math.abs(x) < 5 && z > -62 && z < 75) ||
      (Math.abs(x) > 6.5 && Math.abs(x) < 21 && z > -40 && z < 45) ||
      (Math.abs(x) < 8 && (walkHeight(x - 0.4, z) === 0.35 || walkHeight(x + 0.4, z) === 0.35)) || // not through a boardwalk
      (Math.abs(x) < 7 && z < -60 && z > -80) ||
      (Math.abs(x - roadX(z)) < 4.5 && z > 0) ||
      Math.abs(z - riverZ(x)) < 11 || Math.abs(x - RAIL_X) < 4 || this._reserved(x, z, -6);
    for (let tries = 0; k < N && tries < 60000; tries++) {
      const x = (r() - 0.5) * 340, z = (r() - 0.5) * 340;
      if (Math.hypot(x, z) > 170 || blocked(x, z)) continue;
      if (r() > 0.25 + 0.75 * smoothstep(0.3, 0.6, fbm(x * 0.05, z * 0.05, 2))) continue;
      p.set(x, terrainHeight(x, z), z);
      q.setFromEuler(e.set((r() - 0.5) * 0.5, r() * 6.28, (r() - 0.5) * 0.5));
      const sc = 0.6 + r() * 1.1;
      s.set(sc, sc * (0.7 + r() * 0.9), sc);
      grass.setMatrixAt(k, m4.compose(p, q, s));
      grass.setColorAt(k, col.copy(gA).lerp(gB, r()).offsetHSL(0, 0, (r() - 0.5) * 0.05));
      spots.grass.push([x, p.y, z, sc]);
      k++;
    }
    grass.count = k;
    grass.receiveShadow = true;
    grass.computeBoundingSphere();
    this.root.add(grass);
    this.lowPoly.push(grass);

    // wildflowers
    const flowers = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.09, 0), new THREE.MeshLambertMaterial(), 900);
    const fcols = [C(280, 40, 62), C(48, 85, 60), C(10, 60, 55), C(0, 0, 92)];
    k = 0;
    for (let tries = 0; k < 900 && tries < 20000; tries++) {
      const x = (r() - 0.5) * 260, z = (r() - 0.5) * 260;
      if (blocked(x, z) || Math.hypot(x, z * 0.55) < 14) continue;
      const patch = Math.floor(fbm(x * 0.03, z * 0.03, 2) * 4) % 4;
      p.set(x, terrainHeight(x, z) + 0.45 + r() * 0.2, z);
      s.setScalar(0.7 + r() * 0.8);
      flowers.setMatrixAt(k, m4.compose(p, q.identity(), s));
      flowers.setColorAt(k, fcols[patch]);
      spots.flowers.push([x, terrainHeight(x, z), z, s.x]);
      k++;
    }
    flowers.count = k;
    flowers.computeBoundingSphere();
    this.root.add(flowers);
    this.lowPoly.push(flowers);
    this._paintedFoliage(spots);
    this._blockPlants(spots, flowers);

    // rocks on the hills
    const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), this.mat.stone, 140);
    k = 0;
    for (let tries = 0; k < 140 && tries < 5000; tries++) {
      const x = (r() - 0.5) * 600, z = (r() - 0.5) * 600;
      if (Math.hypot(x, z * 0.55) < 55 || Math.hypot(x, z) > 330 || Math.abs(x - roadX(z)) < 7 || this._reserved(x, z, 4)) continue;
      const sc = 0.4 + r() * 2.2;
      p.set(x, terrainHeight(x, z), z);
      q.setFromEuler(e.set(r() * 3, r() * 3, r() * 3));
      s.set(sc * (1 + r()), sc * 0.6, sc * (1 + r() * 0.5));
      rocks.setMatrixAt(k++, m4.compose(p, q, s));
    }
    rocks.count = k;
    rocks.castShadow = rocks.receiveShadow = true;
    rocks.computeBoundingSphere();
    this.root.add(rocks);
  }

  // Painted plants (ChatGPT cut-outs) at exactly the spots of the low-poly ones: two crossed planes
  // carrying the painting, swaying in the wind. One group per texture set (oil, clean).
  _paintedFoliage(spots) {
    this.foliage = {};
    this.foliageUniforms = { uTime: { value: 0 }, uWind: { value: 1 } };
    const r = T.rng(91), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = V(), p = V(), up = V(0, 1, 0), col = new THREE.Color();
    const fromMatrices = (lists) => lists.flat().map((mtx) => {
      mtx.decompose(p, q, s);
      return [p.x, p.y, p.z, s.x];
    });
    for (const set of ['oil', 'clean']) {
      const imgs = this.painted[set].foliage || {};
      if (!Object.keys(imgs).length) continue;
      const g = new THREE.Group();
      // height in metres at scale 1; sway = metres the top moves at full wind
      const kind = (name, height, list, { shadow = false, sway = 0.1 } = {}) => {
        const img = imgs[name];
        if (!img || !list.length) return;
        const tex = T.imageTexture(img);
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        const mat = new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide });
        this._sway(mat, height, sway);
        const im = new THREE.InstancedMesh(crossedPlanes((height * img.width) / img.height, height), mat, list.length);
        if (name === 'pine' || name === 'cottonwood') im.userData.rootRadius = 0.65;
        list.forEach(([x, y, z, sc], i) => {
          q.setFromAxisAngle(up, r() * 6.28);
          s.setScalar(sc);
          im.setMatrixAt(i, m4.compose(p.set(x, y - 0.05, z), q, s));
          im.setColorAt(i, col.setRGB(1, 1, 1).offsetHSL((r() - 0.5) * 0.03, 0, (r() - 0.5) * 0.12 - 0.02));
        });
        if (shadow) {
          im.castShadow = true;
          im.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
          this._sway(im.customDepthMaterial, height, sway);
        }
        im.receiveShadow = true;
        im.computeBoundingSphere();
        g.add(im);
      };
      kind('cottonwood', 9.5, fromMatrices(spots.trees.slice(0, 3)), { shadow: true, sway: 0.28 });
      kind('pine', 10, fromMatrices(spots.trees.slice(3)), { shadow: true, sway: 0.16 });
      kind('grass', 0.55, spots.grass, { sway: 0.08 });
      kind('flowers', 0.6, spots.flowers.map(([x, y, z, sc]) => [x, y, z, sc * 1.2]), { sway: 0.06 });
      kind('bush', 1.4, spots.grass.filter((_, i) => i % 9 === 0).map(([x, y, z, sc]) => [x + 0.7, y, z + 0.4, 0.8 + sc * 0.5]), { shadow: true, sway: 0.05 });
      // prickly pear on the dry ground, away from the river
      kind('cactus', 1.0, spots.grass.filter(([, , z], i) => i % 23 === 4 && z < 110).map(([x, y, z, sc]) => [x - 0.6, y, z - 0.5, 0.7 + sc * 0.5]), { shadow: true, sway: 0.01 });
      g.visible = false;
      this.root.add(g);
      this.foliage[set] = g;
    }
  }

  // Toy-world plants for the blocky look: box trunks with cube canopies, pines of stacked boxes,
  // flowers as little cubes. Same spots as the other plants. (No grass: a smooth toy meadow.)
  _blockPlants(spots, lowFlowers) {
    this.blocky = [];
    const box = (w, h, d, x, y, z, col) => {
      const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
      g.translate(x, y, z);
      const c = new Float32Array(g.attributes.position.count * 3);
      for (let i = 0; i < c.length; i += 3) c.set([col.r, col.g, col.b], i);
      g.setAttribute('color', new THREE.BufferAttribute(c, 3));
      return g;
    };
    const trunk = C(25, 40, 30);
    const leafy = (a, b) => [box(0.8, 3.6, 0.8, 0, 1.8, 0, trunk), box(4.4, 2.6, 4.4, 0, 4.7, 0, a), box(3.0, 1.6, 3.0, 0.3, 6.6, -0.2, b)];
    const pine = (a) => [box(0.6, 2.2, 0.6, 0, 1.1, 0, trunk), box(3.6, 1.4, 3.6, 0, 2.8, 0, a), box(2.8, 1.4, 2.8, 0, 4.2, 0, a), box(2.0, 1.3, 2.0, 0, 5.5, 0, a), box(1.2, 1.2, 1.2, 0, 6.7, 0, a)];
    // the same five variants as the low-poly trees: two green, one autumn gold, two pines
    const kinds = [
      leafy(C(95, 45, 40), C(100, 48, 48)), leafy(C(110, 40, 36), C(105, 42, 44)), leafy(C(42, 75, 52), C(36, 75, 58)),
      pine(C(140, 42, 28)), pine(C(150, 38, 24)),
    ].map((parts) => mergeGeometries(parts));
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    spots.trees.forEach((list, i) => {
      if (!list.length) return;
      const im = new THREE.InstancedMesh(kinds[i], mat, list.length);
      im.userData.rootRadius = 0.45;
      list.forEach((m, k) => im.setMatrixAt(k, m));
      im.castShadow = im.receiveShadow = true;
      im.computeBoundingSphere();
      im.visible = false;
      this.root.add(im);
      this.blocky.push(im);
    });
    const fl = new THREE.InstancedMesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), new THREE.MeshLambertMaterial(), lowFlowers.count);
    const m4 = new THREE.Matrix4(), col = new THREE.Color();
    for (let i = 0; i < lowFlowers.count; i++) {
      lowFlowers.getMatrixAt(i, m4);
      fl.setMatrixAt(i, m4);
      lowFlowers.getColorAt(i, col);
      fl.setColorAt(i, col);
    }
    fl.computeBoundingSphere();
    fl.visible = false;
    this.root.add(fl);
    this.blocky.push(fl);
  }

  // Which plants stand in the world: 'painted' (the cut-outs of the current texture set; the
  // flat set has none, so it falls back to low-poly), 'blocks' or 'lowpoly'.
  setPlants(kind, set) {
    const painted = kind === 'painted' && set !== 'flat' && this.foliage ? this.foliage[set] || this.foliage.oil || this.foliage.clean || null : null;
    const blocks = kind === 'blocks';
    for (const g of Object.values(this.foliage || {})) g.visible = g === painted;
    for (const m of this.blocky || []) m.visible = blocks;
    for (const m of this.lowPoly) m.visible = !painted && !blocks;
  }

  // Bend a plant with the wind: nothing at the base, most at the top.
  _sway(mat, height, amount) {
    const u = this.foliageUniforms;
    mat.customProgramCacheKey = () => `sway-lod-${height}-${amount}`;
    mat.onBeforeCompile = (shader) => {
      cloudShader(shader);
      shader.uniforms.uTime = u.uTime;
      shader.uniforms.uWind = u.uWind;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uWind;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          float swayH = clamp(position.y / ${height.toFixed(2)}, 0.0, 1.0);
          #ifdef USE_INSTANCING
            vec3 swayBase = instanceMatrix[3].xyz;
          #else
            vec3 swayBase = vec3(0.0);
          #endif
          float sway = (sin(uTime * 1.6 + swayBase.x * 0.31 + swayBase.z * 0.23) + 0.4 * sin(uTime * 3.1 + swayBase.z * 0.5)) * uWind * ${amount.toFixed(3)} * swayH * swayH;
          transformed.x += sway;
          transformed.z += sway * 0.6;
          ${height <= 0.6 ? 'transformed *= 1.0 - smoothstep(100.0, 180.0, distance(cameraPosition.xz, (modelMatrix * vec4(swayBase, 1.0)).xz));' : ''}`);
    };
  }

  _fence(points, followGround = false) {
    const parts = [];
    for (let i = 0; i < points.length - 1; i++) {
      const [ax, az] = points[i], [bx, bz] = points[i + 1];
      const A = V(ax, terrainHeight(ax, az), az), B = V(bx, terrainHeight(bx, bz), bz);
      const len = A.distanceTo(B), n = Math.max(1, Math.round(len / 2.4));
      this.colliders.segs.push({ ax, az, bx, bz });
      for (let k = 0; k <= n; k++) {
        if (k === n && i < points.length - 2) continue;
        const P = A.clone().lerp(B, k / n);
        if (followGround) P.y = terrainHeight(P.x, P.z);
        parts.push(boxAt(0.16, 1.4, 0.16, P.x, P.y + 0.6, P.z));
      }
      const spans = followGround ? n : 1;
      for (let k = 0; k < spans; k++) {
        const a = A.clone().lerp(B, k / spans), b = A.clone().lerp(B, (k + 1) / spans);
        if (followGround) { a.y = terrainHeight(a.x, a.z); b.y = terrainHeight(b.x, b.z); }
        for (const h of [0.55, 1.05]) {
          const g = new THREE.BoxGeometry(0.07, 0.12, a.distanceTo(b));
          g.lookAt(V().subVectors(b, a));
          const mid = a.clone().lerp(b, 0.5);
          g.translate(mid.x, mid.y + h, mid.z); parts.push(g);
        }
      }
    }
    const obj = mesh(mergeGeometries(parts), this.mat.wood);
    this.root.add(obj);
    return obj;
  }

  _decor() {
    this.root.updateMatrixWorld(true);
    const P = (type, x, z, yaw = 0) => this.placeProp(type, x, z, yaw, false);
    P('barrel', 6.9, 15.0); P('barrel', 6.85, 14.2, 1); P('barrel', 6.9, 36.5);
    P('crate', -6.9, 42.6, 0.2); P('crate', -6.95, 41.7, 0.8); P('crate', -6.9, -4.2, 0.4);
    P('barrel', -6.9, 12.2);
    P('trough', 3.6, -2, Math.PI / 2);
    // benches against the shop fronts, facing the street
    for (const z of [34.5, 24.5, 4.5, -8.2, -16.5]) P('bench', -7.05, z, Math.PI / 2);
    for (const z of [40.8, 24, 3, -8, -15.5]) P('bench', 7.05, z, -Math.PI / 2);
    P('wagon', -2.8, 30, 0.15);
    P('hay', 3.8, -29, 0.3); P('hay', 3.7, -31.5, 1.2); P('hay', 27, -30, 0.5); P('hay', 30, -38, 2);
    P('campfire', -17, 49);
    P('lantern', 3.5, -58, Math.PI);
    // camp
    P('campfire', CAMP.x, CAMP.z);
    P('lantern', CAMP.x + 7, CAMP.z - 6.5, 0.6);
    P('wagon', CAMP.x - 3, CAMP.z + 9.5, 2.2);
    P('crate', CAMP.x + 5.5, CAMP.z - 3.5, 0.3); P('barrel', CAMP.x + 6.2, CAMP.z - 2.6);
    // ranch yard
    P('hay', RANCH.x + 8, RANCH.z - 12, 0.4); P('hay', RANCH.x + 10, RANCH.z - 13, 1.4); P('hay', RANCH.x + 22.5, RANCH.z + 2, 0.1);
    P('trough', RANCH.x + 12, RANCH.z + 13, 0); P('wagon', RANCH.x - 8, RANCH.z + 14, 1.1);
    P('barrel', RANCH.x - 12.4, RANCH.z + 2.5); P('crate', RANCH.x - 12.4, RANCH.z + 11);
    // station platform
    P('crate', 66.2, 1.5, 0.2); P('crate', 66.3, 2.4, 0.9); P('barrel', 66, 17.5);
    this._fence([[23, -46], [38, -46], [38, -22], [23, -22], [23, -30]]);
    for (const side of [-1, 1]) {
      const pts = [];
      for (let z = 72; z <= 132; z += 10) pts.push([roadX(z) + side * 7.5, z]);
      this._fence(pts);
    }
  }

  makeProp(type) {
    const g = new THREE.Group();
    const add = (geo, mat, x = 0, y = 0, z = 0) => {
      const m = mesh(geo, mat);
      m.position.set(x, y, z);
      g.add(m);
      return m;
    };
    switch (type) {
      case 'barrel':
        add(new THREE.CylinderGeometry(0.34, 0.3, 0.9, 12), this.mat.barrel, 0, 0.45, 0);
        for (const y of [0.18, 0.72]) add(new THREE.TorusGeometry(0.335, 0.025, 4, 16), this.mat.iron, 0, y, 0).rotation.x = Math.PI / 2;
        break;
      case 'hitch':
        add(mergeGeometries([boxAt(0.18, 1.4, 0.18, -1.6, 0.7, 0), boxAt(0.18, 1.4, 0.18, 1.6, 0.7, 0), boxAt(3.6, 0.16, 0.16, 0, 1.15, 0)]), this.mat.darkWood);
        break;
      case 'crate':
        add(new THREE.BoxGeometry(0.85, 0.85, 0.85), this.mat.crate, 0, 0.425, 0);
        break;
      case 'hay':
        add(new THREE.CylinderGeometry(0.65, 0.65, 1.3, 14), this.mat.hay, 0, 0.65, 0).rotation.z = Math.PI / 2;
        break;
      case 'trough':
        add(new THREE.BoxGeometry(2.2, 0.6, 0.7), this.mat.wood, 0, 0.3, 0);
        add(new THREE.BoxGeometry(2.0, 0.05, 0.5), this.mat.water, 0, 0.56, 0);
        break;
      case 'wagon': {
        add(new THREE.BoxGeometry(1.5, 0.12, 3.2), this.mat.wood, 0, 0.95, 0);
        for (const sx of [-1, 1]) add(new THREE.BoxGeometry(0.08, 0.45, 3.2), this.mat.wood, sx * 0.72, 1.22, 0);
        for (const sz of [-1, 1]) add(new THREE.BoxGeometry(1.5, 0.45, 0.08), this.mat.wood, 0, 1.22, sz * 1.58);
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
          add(new THREE.TorusGeometry(0.48, 0.06, 6, 16), this.mat.darkWood, sx * 0.85, 0.5, sz * 1.1).rotation.y = Math.PI / 2;
          for (let k = 0; k < 3; k++) add(new THREE.BoxGeometry(0.04, 0.9, 0.04), this.mat.darkWood, sx * 0.85, 0.5, sz * 1.1).rotation.x = (k * Math.PI) / 3;
        }
        const cover = new THREE.CylinderGeometry(0.8, 0.8, 2.6, 14, 1, true, Math.PI / 2, Math.PI);
        cover.rotateX(Math.PI / 2);
        add(cover, this.mat.canvas, 0, 1.35, -0.2).scale.y = 1.1;
        add(new THREE.BoxGeometry(0.08, 0.08, 2), this.mat.wood, 0, 0.7, 2.5).rotation.x = 0.25;
        break;
      }
      case 'lantern': {
        add(new THREE.BoxGeometry(0.12, 2.6, 0.12), this.mat.darkWood, 0, 1.3, 0);
        add(new THREE.BoxGeometry(0.55, 0.07, 0.07), this.mat.darkWood, 0.25, 2.55, 0);
        add(new THREE.BoxGeometry(0.24, 0.34, 0.24), this.mat.lantern, 0.45, 2.3, 0).castShadow = false;
        const halo = new THREE.Sprite(this.haloMat);
        halo.position.set(0.45, 2.3, 0);
        halo.scale.setScalar(1.8);
        g.add(halo);
        g.userData.lightLocal = V(0.45, 2.2, 0);
        g.userData.lightKind = 'lantern';
        break;
      }
      case 'campfire': {
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * Math.PI * 2;
          add(new THREE.DodecahedronGeometry(0.17, 0), this.mat.stone, Math.cos(a) * 0.6, 0.1, Math.sin(a) * 0.6).rotation.set(i, i * 2, 0);
        }
        for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(0.07, 0.08, 1.0, 6), this.mat.darkWood, 0, 0.12 + i * 0.06, 0).rotation.set(Math.PI / 2, i * 1.05, 0, 'YXZ');
        const sprites = [], base = [new THREE.Vector2(0.75, 1.3), new THREE.Vector2(0.5, 0.9), new THREE.Vector2(0.45, 0.8)];
        [[0, 0.6, 0], [0.15, 0.45, 0.1], [-0.12, 0.45, -0.08]].forEach(([x, y, z], i) => {
          const sp = new THREE.Sprite(this.flameMat);
          sp.position.set(x, y, z);
          sp.scale.set(base[i].x, base[i].y, 1);
          g.add(sp);
          sprites.push(sp);
        });
        g.userData.flame = { sprites, base, ph: Math.random() * 10, light: null };
        g.userData.lightLocal = V(0, 0.8, 0);
        g.userData.lightKind = 'fire';
        g.userData.emitters = [
          { type: 'smoke', local: V(0, 1.2, 0), rate: 4, life: 5, s0: 0.5, s1: 3.2, alpha: 0.32, rise: 1.1 },
          { type: 'embers', local: V(0, 0.5, 0), rate: 7 },
        ];
        break;
      }
      case 'tree':
        add(this.treeGeos[Math.floor(Math.random() * this.treeGeos.length)], this.mat.foliage).scale.setScalar(0.9 + Math.random() * 0.5);
        break;
      case 'rock':
        add(new THREE.DodecahedronGeometry(0.8, 0), this.mat.stone, 0, 0.3, 0).scale.set(1 + Math.random(), 0.6 + Math.random() * 0.5, 1 + Math.random());
        break;
      case 'bench': // seat for two, facing +z, seat top at 0.45
        add(new THREE.BoxGeometry(1.7, 0.06, 0.42), this.mat.wood, 0, 0.42, 0);
        add(new THREE.BoxGeometry(1.7, 0.2, 0.05), this.mat.wood, 0, 0.78, -0.2).rotation.x = -0.12;
        for (const sx of [-0.75, 0.75]) {
          for (const sz of [-0.17, 0.17]) add(new THREE.BoxGeometry(0.07, 0.4, 0.07), this.mat.darkWood, sx, 0.2, sz);
          add(new THREE.BoxGeometry(0.07, 0.45, 0.06), this.mat.darkWood, sx, 0.66, -0.2);
        }
        break;
    }
    if (type === 'bench') batchRigidParts(g);
    return g;
  }

  groundFootY(x,z,radius=0) {
    let y = this.groundY(x,z);
    // Bury the downhill edge of a trunk instead of balancing it on its centre.
    if (radius > 0) for (let i=0;i<8;i++) {
      const a=i*Math.PI/4;
      y=Math.min(y,this.groundY(x+Math.cos(a)*radius,z+Math.sin(a)*radius));
    }
    return y;
  }

  groundY(x,z) {
    if(Math.abs(x)>800||Math.abs(z)>800)return terrainHeight(x,z);
    const g=this.ground.geometry,n=g.parameters.widthSegments,m=g.parameters.heightSegments,a=g.attributes.position;
    const px=(x+800)/1600*n,pz=(z+800)/1600*m,i=Math.min(n-1,Math.floor(px)),j=Math.min(m-1,Math.floor(pz)),u=px-i,v=pz-j,k=j*(n+1)+i;
    const h00=a.getY(k),h10=a.getY(k+1),h01=a.getY(k+n+1),h11=a.getY(k+n+2);
    return u+v<=1?h00+(h10-h00)*u+(h01-h00)*v:h11+(h01-h11)*(1-u)+(h10-h11)*(1-v);
  }

  surfaceY(x, z) {
    // Sample the regular terrain triangles directly; only raised walkables need raycasts.
    this._ray.set(V(x, 300, z), V(0, -1, 0));
    const hit = this._ray.intersectObjects(this.walkables.filter(m=>m!==this.ground), false)[0];
    return Math.max(this.groundY(x,z),hit?.point.y??-Infinity);
  }

  placeProp(type, x, z, yaw = 0, record = true, order) {
    this.endBuildReplay();
    const obj = this.makeProp(type);
    obj.position.set(x, this.surfaceY(x, z), z);
    obj.rotation.y = yaw;
    this.root.add(obj);
    obj.updateMatrixWorld(true);
    const entry = { type, x, z, yaw, obj, light: null, emitters: [], flame: obj.userData.flame || null };
    const radius = { barrel: 0.4, crate: 0.55, hay: 0.75, trough: 1, wagon: 1.6, lantern: 0.15, tree: 0.5, rock: 1, bench: 0.55 }[type];
    if (radius) this.colliders.circles.push((entry.collider = { x, z, r: radius }));
    if (type === 'bench') {
      // two seats townsfolk can sit on (who: whoever has taken it)
      entry.seats = [-0.42, 0.42].map((lx) => {
        const s = obj.localToWorld(V(lx, 0.45, 0.02));
        return { x: s.x, y: s.y, z: s.z, yaw, who: null };
      });
      this.benches.push(...entry.seats);
    }
    if (obj.userData.lightLocal) {
      const p = this._takeLight();
      if (p) {
        p.light.position.copy(obj.localToWorld(obj.userData.lightLocal.clone()));
        entry.light = p;
        if (obj.userData.lightKind === 'lantern') {
          p.light.color.set(0xffa850);
          this.lanternLights.push(p.light);
        } else {
          p.light.color.set(0xff8a3a);
          if (entry.flame) entry.flame.light = p.light;
        }
      }
    }
    for (const e of obj.userData.emitters || []) {
      const em = { ...e, pos: obj.localToWorld(e.local.clone()), acc: 0 };
      this.emitters.push(em);
      entry.emitters.push(em);
    }
    if (entry.flame) this.flames.push(entry.flame);
    this.props.push(entry);
    if (record) {entry.order=this._buildOrder(order);this.placed.push(entry);}
    return entry;
  }

  // A painted 2D cut-out (PNG with transparency) that always turns to face the camera.
  placeCutout(tex, aspect, x, z, height = 2.2) {
    const geo = new THREE.PlaneGeometry(height * aspect, height);
    geo.translate(0, height / 2, 0);
    // half lit by the scene, half by its own colours, so a painted figure never turns into a
    // black silhouette against the sun (the glow is dimmed at night in update())
    const mat = new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, color: 0x9a9a9a, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55 });
    mat.userData.cutout = true;
    const m = new THREE.Mesh(geo, mat);
    // cast a shadow in the shape of the painting, not of the whole rectangle
    m.castShadow = true;
    m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
    m.position.set(x, this.surfaceY(x, z), z);
    this.root.add(m);
    this.billboards.push(m);
    const entry = { type: 'cutout', obj: m, light: null, emitters: [], flame: null };
    this.placed.push(entry);
    return entry;
  }

  _remove(entry) {
    this.root.remove(entry.obj);
    const propIndex = this.props.indexOf(entry);
    if (propIndex >= 0) this.props.splice(propIndex, 1);
    if (entry.collider) this.colliders.circles = this.colliders.circles.filter((c) => c !== entry.collider);
    if (entry.seats) this.benches = this.benches.filter((s) => !entry.seats.includes(s));
    if (entry.light) {
      const l = entry.light.light;
      entry.light.used = false;
      l.intensity = 0;
      l.position.y = -50;
      const i = this.lanternLights.indexOf(l);
      if (i >= 0) this.lanternLights.splice(i, 1);
    }
    this.emitters = this.emitters.filter((e) => !entry.emitters.includes(e));
    if (entry.flame) this.flames.splice(this.flames.indexOf(entry.flame), 1);
    const b = this.billboards.indexOf(entry.obj);
    if (b >= 0) this.billboards.splice(b, 1);
  }
  undo() {
    this.endBuildReplay();
    const e = this.placed.pop();
    if (e) this._remove(e);
  }
  clearPlaced() {
    while (this.placed.length) this.undo();
  }
  layout() {
    return [
      ...this.placed.filter((p) => p.type !== 'cutout').map(({ type, x, z, yaw, order }) => ({ type, x, z, yaw, order })),
      ...this.buildings.map((e) => ({ kind: 'building', ...e.spec })),
      ...this.roads.map((e) => ({ kind: 'road', points: e.points, width: e.width, order:e.order })),
      ...this.fences.map((e) => ({ kind: 'fence', points: e.points, order:e.order })),
    ].sort((a,b)=>a.order-b.order);
  }

  loadLayout(layout = []) {
    this.endBuildReplay();this.buildOrder=0;
    layout=layout.map((e,i)=>({...e,order:Number.isFinite(e.order)?e.order:i}));
    this.clearPlaced();
    for (const e of [...this.fences]) this.removeFence(e);
    for (const e of [...this.buildings]) this.removeBuilding(e, false);
    for (const e of this.roads) { this.root.remove(e.obj); e.obj.geometry.dispose(); }
    this.roads = [];
    for (const e of layout) if (e.kind === 'building') this.placeBuilding(e, false);
    this.updateTerrain();
    for (const e of layout) {
      if (e.kind === 'road') this.addRoad(e.points, e.width, e.order);
      else if (e.kind === 'fence') this.addFence(e.points, e.order);
      else if (!e.kind) this.placeProp(e.type, e.x, e.z, e.yaw, true, e.order);
    }
  }


  _buildOrder(order) {const n=Number.isFinite(order)?order:(this.buildOrder||0);this.buildOrder=Math.max(this.buildOrder||0,n+1);return n;}
  buildEntries() {return [...this.placed.filter(e=>e.type!=='cutout'),...this.buildings,...this.roads,...this.fences].sort((a,b)=>a.order-b.order);}
  replayDuration(speed=2) {return this.buildEntries().length/Math.max(1,Math.min(5,+speed||2))+1;}
  _replayList(key) {return key==='userFloors'?userFloors:['rects','circles','segs'].includes(key)?this.colliders[key]:this[key];}
  beginBuildReplay(speed=2) {
    this.endBuildReplay();const entries=this.buildEntries();if(!entries.length)return false;
    this.root.updateMatrixWorld(true);const bounds=new THREE.Box3(),physics=[],items=[];
    for(const entry of entries){
      const obj=entry.obj,box=new THREE.Box3().setFromObject(obj),center=box.getCenter(V());center.y=box.min.y;bounds.union(box);
      const item={entry,obj,parent:obj.parent,position:obj.position.clone(),rotation:obj.quaternion.clone(),scale:obj.scale.clone(),visible:obj.visible,lightVisible:entry.light?.light.visible,shown:null,pivot:center};
      const wrapper=new THREE.Group();wrapper.position.copy(center);this.root.add(wrapper);wrapper.updateMatrixWorld(true);wrapper.attach(obj);item.wrapper=wrapper;items.push(item);
      const record=(key,values)=>{for(const value of values||[]){const index=this._replayList(key).indexOf(value);physics.push({key,value,index,item});}};
      for(const [key,values]of Object.entries(entry.additions||{}))record(key,values);
      record('userFloors',entry.additions?.floors);record('segs',entry.segs);record('circles',entry.collider?[entry.collider]:[]);record('benches',entry.seats);record('emitters',entry.emitters);record('flames',entry.flame?[entry.flame]:[]);record('buildingPOIs',entry.poi?[entry.poi]:[]);
    }
    if(!this.buildSparkles){this.buildSparkles=new THREE.InstancedMesh(new THREE.SphereGeometry(1,6,4),new THREE.MeshBasicMaterial({color:'#f8deb0',transparent:true,opacity:0.45,depthWrite:false}),48);this.buildSparkles.frustumCulled=false;this.root.add(this.buildSparkles);}
    this.buildSparkles.visible=true;this.buildReplay={items,physics,speed:Math.max(1,Math.min(5,+speed||2)),bounds};this.updateBuildReplay(0);return true;
  }
  updateBuildReplay(t) {
    const replay=this.buildReplay;if(!replay)return;let changed=false,count=0;const matrix=new THREE.Matrix4();
    replay.items.forEach((item,i)=>{
      const age=t-0.25-i/replay.speed,shown=age>=0;
      if(shown!==item.shown){item.shown=shown;changed=true;}
      const u=Math.max(0,Math.min(1,age/0.65)),pop=1-Math.pow(1-u,3)+Math.sin(u*Math.PI)*0.12;
      item.wrapper.visible=shown&&item.visible;item.wrapper.scale.setScalar(Math.max(0.001,pop));if(item.entry.light)item.entry.light.light.visible=shown&&item.lightVisible;
      if(age>=0&&age<0.9)for(let k=0;k<8&&count<48;k++){const a=k*2.399+i,r=0.25+age*0.9,size=(1-age/0.9)*0.055;this.buildSparkles.setMatrixAt(count++,matrix.makeScale(size,size,size).setPosition(item.pivot.x+Math.cos(a)*r,item.pivot.y+0.15+age*0.8,item.pivot.z+Math.sin(a)*r));}
    });
    if(changed){for(const p of replay.physics){const list=this._replayList(p.key),i=list.indexOf(p.value),show=p.item.shown&&p.index>=0;if(show&&i<0)list.push(p.value);else if(!show&&i>=0)list.splice(i,1);}this.onBuildingsChanged?.();}
    this.buildSparkles.count=count;this.buildSparkles.instanceMatrix.needsUpdate=true;
  }
  buildReplayCamera(t,out) {
    const replay=this.buildReplay;if(!replay)return;const center=replay.bounds.getCenter(V()),size=replay.bounds.getSize(V()),r=Math.max(12,Math.max(size.x,size.z)*0.9+8),a=0.35+t*0.035;
    const x=center.x+Math.cos(a)*r,z=center.z+Math.sin(a)*r,y=Math.max(terrainHeight(x,z)+35,replay.bounds.max.y+r*0.55+12);
    out.pos.set(x,y,z);center.y=replay.bounds.min.y+Math.min(size.y,6)*0.5;out.look.copy(center);
  }
  endBuildReplay() {
    const replay=this.buildReplay;if(!replay)return;this.buildReplay=null;
    // Restore exact transforms and physics without rebuilding or losing the saved layout.
    for(const item of replay.items){item.parent.add(item.obj);item.obj.position.copy(item.position);item.obj.quaternion.copy(item.rotation);item.obj.scale.copy(item.scale);item.obj.visible=item.visible;item.wrapper.removeFromParent();if(item.entry.light)item.entry.light.light.visible=item.lightVisible;}
    for(const p of replay.physics){const list=this._replayList(p.key),i=list.indexOf(p.value);if(i>=0)list.splice(i,1);}
    for(const p of [...replay.physics].sort((a,b)=>a.index-b.index)){if(p.index>=0){const list=this._replayList(p.key);list.splice(Math.min(p.index,list.length),0,p.value);}}
    this.buildSparkles.visible=false;this.onBuildingsChanged?.();this.root.updateMatrixWorld(true);
  }

  _detailBounds(type) {
    return {gardenFence:[2.6,0.2],vegetablePatch:[2.3,1.5],flowerBox:[1,0.35],laundryLine:[2.7,0.35],waterWell:[1.2,1],woodPile:[1.1,0.8],mailbox:[0.35,0.3],lanternString:[3,0.3],gardenBench:[1.1,0.55],snowman:[0.8,0.75],pumpkinPile:[1.2,0.85],littleBridge:[1.6,3]}[type]||this.extraBuildPieces?.[type]?.bounds;
  }

  _buildDetail(type, s) {
    const g=new THREE.Group(), scale=s.w/10, bounds=this._detailBounds(type);
    g.name=type;g.userData.buildPiece=true;g.position.set(s.x,s.y,s.z);g.rotation.y=s.rot;g.scale.setScalar(scale);this.root.add(g);
    if(this.extraBuildPieces?.[type]){this.extraBuildPieces[type].build(g);this.colliders.rects.push(this._rectOf(g,0,0,bounds[0]*scale,bounds[1]*scale));return g;}
    this.detailMats??=Object.fromEntries(Object.entries({cream:'#f2dfb5',green:'#84a477',soil:'#8d7057',pink:'#e6b1c7',blue:'#accbdc',gold:'#ebc676',orange:'#d79450',snow:'#eff3ee',ink:'#5a514b'}).map(([key,color])=>[key,new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide})]));
    const m=this.detailMats,wood=this.mat.wood,dark=this.mat.darkWood;
    const add=(geo,mat,x=0,y=0,z=0)=>{const o=mesh(geo,mat);o.position.set(x,y,z);g.add(o);return o;};
    const box=(w,h,d,mat,x,y,z)=>add(new THREE.BoxGeometry(w,h,d),mat,x,y,z);
    const ball=(r,mat,x,y,z,sx=1,sy=1,sz=1)=>{const o=add(new THREE.SphereGeometry(r,12,8),mat,x,y,z);o.scale.set(sx,sy,sz);return o;};
    const post=(x,h=1,z=0)=>add(new THREE.CapsuleGeometry(0.07,h-0.14,4,8),wood,x,h/2,z);
    const rect=(x,z,hx,hz)=>this.colliders.rects.push(this._rectOf(g,x,z,hx*scale,hz*scale));
    if(type==='gardenFence') {
      for(const x of [-2.5,-1.25,0,1.25,2.5])post(x,0.9);
      for(const y of [0.32,0.65])box(5,0.1,0.1,m.cream,0,y,0);
    } else if(type==='vegetablePatch') {
      box(4.4,0.12,2.8,m.soil,0,0.06,0);
      for(const x of [-1.65,-0.55,0.55,1.65])for(const z of [-0.9,0,0.9]){ball(0.24,z<0?m.orange:z>0?m.pink:m.green,x,0.25,z,1,0.8,1);ball(0.23,m.green,x,0.45,z,1.2,0.35,1);}
    } else if(type==='flowerBox') {
      box(1.9,0.35,0.6,wood,0,0.18,0);box(1.7,0.03,0.45,m.soil,0,0.36,0);
      for(let i=0;i<5;i++){post(-0.72+i*0.36,0.55);ball(0.17,[m.pink,m.gold,m.blue][i%3],-0.72+i*0.36,0.64,0);}
    } else if(type==='laundryLine') {
      for(const x of [-2.5,2.5])post(x,2.4);
      box(5,0.025,0.025,m.cream,0,2.32,0);
      this.clothMats??=[m.pink,m.blue,m.gold,m.green].map(base=>{const mat=base.clone();mat.onBeforeCompile=shader=>{shader.uniforms.uClothTime=this.waterUniforms.uWaterTime;shader.uniforms.uClothWind=this.waterUniforms.uWaterWind;shader.vertexShader='uniform float uClothTime,uClothWind;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z += sin(uClothTime*1.1+position.x*2.0)*max(0.0,-position.y)*0.18*uClothWind;');};mat.customProgramCacheKey=()=> 'build-cloth';return mat;});
      for(let i=0;i<6;i++){const geo=new THREE.PlaneGeometry(0.57,0.8,3,4);geo.translate(0,-0.4,0);add(geo,this.clothMats[i%4],-2+i*0.8,2.26,0);}
      for(const x of [-2.5,2.5])rect(x,0,0.12,0.12);
    } else if(type==='waterWell') {
      add(new THREE.CylinderGeometry(0.85,1,0.9,16),this.mat.stone,0,0.45,0);
      box(1.7,0.1,1.5,m.green,0,0.95,0);
      for(const x of [-1,1])post(x,2.6);
      box(2.5,0.2,1.9,wood,0,2.6,0);
    } else if(type==='woodPile') {
      for(let row=0;row<3;row++)for(let i=0;i<3-row;i++){const log=add(new THREE.CylinderGeometry(0.2,0.2,1.8,10),dark,0,0.2+row*0.34,-0.5+i*0.5+row*0.25);log.rotation.z=Math.PI/2;}
    } else if(type==='mailbox') {
      post(0,1.2);box(0.6,0.4,0.5,m.blue,0,1.3,0);box(0.48,0.23,0.02,m.cream,0,1.3,0.26);ball(0.08,m.pink,0.36,1.55,0);
    } else if(type==='lanternString') {
      for(const x of [-2.8,2.8]){post(x,3);rect(x,0,0.13,0.13);}
      for(let i=0;i<8;i++){const x=-2.45+i*0.7,y=2.65+0.045*x*x;box(0.72,0.025,0.025,dark,x,y+0.1,0);ball(0.14,this.mat.lantern,x,y-0.12,0);const halo=new THREE.Sprite(this.haloMat);halo.position.set(x,y-0.12,0);halo.scale.setScalar(0.9);g.add(halo);}
    } else if(type==='gardenBench') {
      const bench=this.makeProp('bench');g.add(bench);
    } else if(type==='snowman') {
      ball(0.68,m.snow,0,0.64,0,1,1.05,1);ball(0.47,m.snow,0,1.5,0);ball(0.34,m.snow,0,2.15,0);
      add(new THREE.CylinderGeometry(0.4,0.4,0.09,16),m.blue,0,2.43,0);ball(0.3,m.blue,0,2.51,0,1,0.4,1);
      add(new THREE.TorusGeometry(0.36,0.09,6,16),m.pink,0,1.89,0).rotation.x=Math.PI/2;
      for(const x of [-0.12,0.12])ball(0.035,m.ink,x,2.23,0.3);
      ball(0.06,m.gold,0,2.13,0.34,1,1,1.6);
      for(let i=0;i<5;i++){const a=i/4*Math.PI;ball(0.023,m.ink,Math.cos(a)*0.13,2.08-Math.sin(a)*0.06,0.315);}
      for(const y of [1.3,1.55,1.74])ball(0.04,m.ink,0,y,0.43);
      for(const side of [-1,1]){const arm=add(new THREE.CapsuleGeometry(0.045,0.5,4,8),dark,side*0.62,1.58,0);arm.rotation.z=side*0.9;}
    } else if(type==='pumpkinPile') {
      for(const [x,y,z,r]of [[-0.55,0.4,0,0.45],[0.4,0.35,0.2,0.4],[0,0.6,-0.35,0.5]]){ball(r,m.orange,x,y,z,1,0.85,1);add(new THREE.CapsuleGeometry(0.045,0.13,3,6),m.green,x,y+r*0.83,z);}
    } else if(type==='littleBridge') {
      const deck=box(3,0.18,6,wood,0,0.2,0);this.walkables.push(deck);
      this.floors.push({...this._rectOf(g,0,0,1.5*scale,3*scale),y:s.y+0.29*scale});
      for(const side of [-1,1]){for(const z of [-2.8,0,2.8])post(side*1.45,1.2,z);box(0.12,0.12,5.8,m.cream,side*1.45,1.1,0);rect(side*1.45,0,0.13,3);}
    }
    if(!['littleBridge','laundryLine','lanternString'].includes(type))rect(0,0,bounds[0],bounds[1]);
    return g;
  }

  makeBuilding(spec, preview = false) {
    const type = spec.type, detail=this._detailBounds(type);
    if (!detail && !['shop', 'hotel', 'house', 'barn', 'chapel', 'tower', 'windmill', 'cabin', 'brick', 'blacksmith', 'hitch'].includes(type)) throw new Error('Unknown building type');
    const w = Math.max(6, Math.min(20, +spec.w || 10)), yaw = +spec.yaw || 0;
    const x = +spec.x || 0, z = +spec.z || 0;
    const offset = detail ? 0 : ['tower', 'windmill', 'chapel', 'hitch'].includes(type) ? 0 : type === 'cabin' ? -3.7 : -4.7;
    const pad = { x: x + Math.sin(yaw) * offset, z: z + Math.cos(yaw) * offset, yaw,
      hx: w / 2 + 2.5, hz: type === 'chapel' ? 10.5 : offset ? 10 : w / 2 + 2.5 };
    if (type === 'hitch') { pad.hx = 2; pad.hz = 0.4; pad.blend = 2; }
    if(detail){pad.hx=detail[0]*w/10;pad.hz=detail[1]*w/10;pad.blend=1;}
    pad.y = Number.isFinite(spec.y) ? spec.y : terrainHeight(pad.x, pad.z);
    const lists = { rects: this.colliders.rects, circles: this.colliders.circles, floors: this.floors,
      walkables: this.walkables, emitters: this.emitters, flames: this.flames, spinners: this.spinners, windowMats: this.windowMats };
    const counts = Object.fromEntries(Object.entries(lists).map(([k, a]) => [k, a.length]));
    let obj;
    const wall = Array.isArray(spec.wall) ? spec.wall.slice(0, 3) : [34, 30, 48];
    const s = { buildArt: { barn: 'barn_boards', chapel: 'chapel_boards', house: 'house_boards', shop: 'wall_boards', hotel: 'wall_boards', cabin: 'log_wall', brick: 'brick_wall' }[type], x, z, y: pad.y, rot: yaw, w, floors: type === 'cabin' ? 1 : +spec.floors === 2 ? 2 : 1, wall,
      trim: [40, 25, 80], signBg: [30, 30, 22], signInk: '#f0e0c0',
      sign: String(spec.sign ?? (type === 'blacksmith' ? 'BLACKSMITH' : '')).slice(0, 60), signCustom: spec.signCustom ?? (spec.sign != null), balcony: type === 'hotel', barn: type === 'barn', chimney: type === 'house' || type === 'cabin', depth: type === 'cabin' ? 8 : 12 };
    if (detail) obj=this._buildDetail(type,s);
    else if (type === 'blacksmith') obj = this._smithy(s);
    else if (type === 'hitch') {
      obj = this.makeProp('hitch'); obj.position.set(x, pad.y, z); obj.rotation.y = yaw; this.root.add(obj);
      this.colliders.rects.push(this._rectOf(obj, 0, 0, 1.8, 0.12));
    } else if (type === 'chapel') obj = this._church(s);
    else if (type === 'tower' || type === 'windmill') {
      obj = type === 'tower' ? this._waterTower(x, z, w / 7) : this._windmill(x, z, yaw);
      if (type === 'windmill') obj.scale.setScalar(w / 7);
      obj.position.y = pad.y;
      obj.rotation.y = yaw;
      this.colliders.circles.at(-1).r = (type === 'tower' ? 2.4 : 1.5) * w / 7;
    } else obj = this._building(s);
    const additions = Object.fromEntries(Object.entries(lists).map(([k, a]) => [k, a.slice(counts[k])]));
    const scale = THREE.MathUtils.clamp(Number.isFinite(+spec.scale) ? +spec.scale : 1, 0.5, 2);
    if (scale !== 1) {
      // Scale around the placement anchor; physics and terrain pads must follow the artwork.
      obj.scale.multiplyScalar(scale); obj.updateWorldMatrix(true, true);
      pad.x=x+(pad.x-x)*scale;pad.z=z+(pad.z-z)*scale;pad.hx*=scale;pad.hz*=scale;
      for (const q of [...additions.rects,...additions.floors]) {
        q.cx=x+(q.cx-x)*scale;q.cz=z+(q.cz-z)*scale;q.hx*=scale;q.hz*=scale;
        if(Number.isFinite(q.y))q.y=pad.y+(q.y-pad.y)*scale;
      }
      for (const q of additions.circles) {q.x=x+(q.x-x)*scale;q.z=z+(q.z-z)*scale;q.r*=scale;}
      for (const q of additions.emitters) if(q.pos)q.pos.set(x+(q.pos.x-x)*scale,pad.y+(q.pos.y-pad.y)*scale,z+(q.pos.z-z)*scale);
    }
    const entry = { obj, pad, additions, spec: { type, x, z, yaw, scale, w, floors: s.floors, wall, sign: s.sign, signCustom: s.signCustom, y: pad.y } };
    this.setTextureSet(this.textureSet || 'oil');
    if (preview) {
      for (const [k, a] of Object.entries(lists)) a.splice(counts[k]);
      entry.ghostMats = new Set();
      const clones = new Map();
      obj.traverse((m) => {
        if (!m.isMesh) return;
        const ghost = (mat) => {
          if (!clones.has(mat)) {
            const c = mat.clone(); c.transparent = true; c.opacity = 0.38; c.depthWrite = false;
            clones.set(mat, c); entry.ghostMats.add(c);
          }
          return clones.get(mat);
        };
        m.material = Array.isArray(m.material) ? m.material.map(ghost) : ghost(m.material);
        m.castShadow = false;
      });
    }
    this.setTextureSet(this.textureSet || 'oil');
    return entry;
  }

  disposeBuilding(entry) {
    this.root.remove(entry.obj);
    if (entry.light) { entry.light.used = false; entry.light.light.intensity = 0; entry.light.light.position.set(0, -50, 0); }
    entry.obj.traverse((m) => { if (m.isMesh) m.geometry.dispose(); });
    for (const m of entry.ghostMats || []) m.dispose();
    for (const m of entry.additions.windowMats) {
      this.surfaces.delete(m);
      const textures = new Set();
      for (const sets of [m.userData.normalSets, m.userData.familySets]) for (const set of Object.values(sets || {})) { textures.add(set.map); textures.add(set.emissive); }
      textures.add(m.map); textures.add(m.emissiveMap);
      for (const t of textures) t?.dispose();
      m.dispose();
    }
  }

  placeBuilding(spec, update = true) {
    this.endBuildReplay();
    const e = this.makeBuilding(spec);e.order=this._buildOrder(spec.order);e.spec.order=e.order;
    this.buildings.push(e);
    if (e.obj.userData.forge) {
      e.light = this._takeLight();
      if (e.light) { e.light.light.position.copy(e.obj.localToWorld(V(-e.spec.w * 0.26, 1.7, -7))); e.additions.flames[0].light = e.light.light; }
    }
    userPads.push(e.pad); userFloors.push(...e.additions.floors);
    const doorZ = e.spec.type === 'chapel' ? 10 : ['tower', 'windmill'].includes(e.spec.type) ? e.pad.hz + 1 : 3.4;
    e.poi = e.obj.localToWorld(V(0, 0, doorZ));
    if (['tower', 'windmill'].includes(e.spec.type)) e.poi.set(e.spec.x + Math.sin(e.spec.yaw) * (e.pad.hz + 1), 0, e.spec.z + Math.cos(e.spec.yaw) * (e.pad.hz + 1));
    e.poi.y = 0;
    if (e.spec.type !== 'hitch' && !e.obj.userData.buildPiece) this.buildingPOIs.push(e.poi);
    this.onBuildingsChanged?.();
    if (update) this.updateTerrain();
    return e;
  }

  removeBuilding(e, update = true) {
    if (!this.buildings.includes(e)) return; // built-in scenery is not a user selection
    this.endBuildReplay();
    for (const [k, items] of Object.entries(e.additions)) {
      const a = k === 'rects' || k === 'circles' ? this.colliders[k] : this[k];
      for (const item of items) { const i = a.indexOf(item); if (i >= 0) a.splice(i, 1); }
    }
    for (const f of e.additions.floors) { const i = userFloors.indexOf(f); if (i >= 0) userFloors.splice(i, 1); }
    userPads.splice(userPads.indexOf(e.pad), 1);
    this.buildings.splice(this.buildings.indexOf(e), 1);
    if (this.buildingPOIs.includes(e.poi)) this.buildingPOIs.splice(this.buildingPOIs.indexOf(e.poi), 1);
    this.disposeBuilding(e);
    this.onBuildingsChanged?.();
    if (update) this.updateTerrain();
  }

  _smithy(s) {
    const g = new THREE.Group(), w = s.w;
    const add = (geo, mat) => { const m = mesh(geo, mat); g.add(m); return m; };
    add(mergeGeometries([boxAt(w, 2.2, 0.35, 0, 1.1, -10), boxAt(0.35, 1.4, 10, -w / 2, 0.7, -5), boxAt(0.35, 1.4, 10, w / 2, 0.7, -5)]), this.mat.stone);
    for (const x of [-w / 2, w / 2]) for (const z of [0, -10]) add(boxAt(0.3, 4.4, 0.3, x, 2.2, z), this.mat.darkWood);
    const roof = add(prism(w + 1, 2.2, 11), this.mat.roof); roof.position.set(0, 4.4, -5);
    const sign = add(new THREE.BoxGeometry(w * 0.8, 1, 0.2), this._frontMaterial({ ...s, w: w * 0.8, fh: 1, signOnly: true, floors: 1, seed: 67 }));
    sign.position.set(0, 3.7, 0.15);
    add(boxAt(2.2, 1.2, 1.7, -w * 0.26, 0.6, -7), this.mat.stone);
    const fire = this.makeProp('campfire'); fire.position.set(-w * 0.26, 1.2, -7); g.add(fire);
    const anvil = new THREE.Group();
    anvil.add(mesh(mergeGeometries([boxAt(0.9, 0.18, 0.65, 0, 0.2, 0), boxAt(0.4, 0.6, 0.4, 0, 0.5, 0), boxAt(1.2, 0.28, 0.55, 0, 0.88, 0)]), this.mat.iron));
    const horn = mesh(new THREE.ConeGeometry(0.25, 0.8, 8), this.mat.iron); horn.rotation.z = -Math.PI / 2; horn.position.set(0.9, 0.88, 0); anvil.add(horn);
    anvil.position.set(0.8, 0, -3); g.add(anvil);
    const barrel = this.makeProp('barrel'); barrel.position.set(w * 0.3, 0, -7); g.add(barrel);
    add(boxAt(0.6, 0.03, 0.6, w * 0.3, 0.91, -7), this.mat.water);
    g.position.set(s.x, s.y, s.z); g.rotation.y = s.rot; this.root.add(g); g.updateMatrixWorld(true);
    for (const x of [-w / 2, w / 2]) this.colliders.rects.push(this._rectOf(g, x, -5, 0.2, 5.2));
    this.colliders.rects.push(this._rectOf(g, 0, -10, w / 2, 0.2), this._rectOf(g, -w * 0.26, -7, 1.1, 0.85), this._rectOf(g, 0.8, -3, 1.1, 0.4), this._rectOf(g, w * 0.3, -7, 0.5, 0.5));
    for (const e of fire.userData.emitters) this.emitters.push({ ...e, pos: fire.localToWorld(e.local.clone()), acc: 0 });
    this.flames.push(fire.userData.flame); g.userData.forge = true;
    return g;
  }

  addFence(points, order) {
    this.endBuildReplay();
    points = points.filter(([x, z], i) => Number.isFinite(x) && Number.isFinite(z) && (!i || Math.hypot(x - points[i - 1][0], z - points[i - 1][1]) > 0.1));
    if (points.length < 2) return null;
    const start = this.colliders.segs.length;
    const e = { points: points.map(p => [...p]), spec: { type: 'fence' }, obj: this._fence(points, true), segs: this.colliders.segs.slice(start) };
    e.order=this._buildOrder(order);this.fences.push(e); this.updateTerrain(); return e;
  }

  removeFence(e) {
    if (!this.fences.includes(e)) return;
    this.endBuildReplay();
    this.colliders.segs = this.colliders.segs.filter(s => !e.segs.includes(s));
    this.root.remove(e.obj); e.obj.geometry.dispose(); this.fences.splice(this.fences.indexOf(e), 1); this.updateTerrain();
  }

  addRoad(points, width, order) {
    this.endBuildReplay();
    points = points.filter(([x, z], i) => Number.isFinite(x) && Number.isFinite(z) && (!i || Math.hypot(x - points[i - 1][0], z - points[i - 1][1]) > 0.1));
    if (points.length < 2) return null;
    this.userRoadMat ??= this._pathMaterial();
    const e = { points: points.map((p) => [...p]), width: Math.max(1, Math.min(14, +width || 5)) };
    e.obj = this._ribbon(e.points, e.width, this.userRoadMat, { step: 1, fitGround: true, lift: 0.1 });
    e.order=this._buildOrder(order);this.roads.push(e);
    this.setTextureSet(this.textureSet || 'oil');
    return e;
  }

  _insideFence(x, z) {
    return this.fences.some(e => e.segs.some(s => {
      const dx = s.bx - s.ax, dz = s.bz - s.az;
      const t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / (dx * dx + dz * dz)));
      return Math.hypot(x - s.ax - t * dx, z - s.az - t * dz) < 0.6;
    }));
  }

  updateTerrain() {
    // Also refresh same-count edits and railway pad reordering.
    rebuildPadCells();
    this.terrainRevision = (this.terrainRevision || 0) + 1;
    this.endBuildReplay();
    const pos = this.ground.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      let y = applyPond(applyUserPads(this.terrainBase[i],x,z),x,z);
      if (pondPad?.active) y -= 0.8 * (1 - smoothstep(0.65,1,Math.max(Math.abs(x-pondPad.x)/19,Math.abs(z-pondPad.z)/16)));
      pos.setY(i,y);
    }
    if (this.hamlet?.pond) {
      const geo = this.hamlet.pond.bank.geometry, a = geo.attributes.position;
      for (let i=0;i<a.count;i++) a.setY(i,terrainHeight(a.getX(i),a.getZ(i))+0.015);
      a.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingSphere();
    }
    pos.needsUpdate = true;
    this.ground.geometry.computeVertexNormals();
    this.ground.geometry.computeBoundingBox();
    this.ground.geometry.computeBoundingSphere();
    const matrix = new THREE.Matrix4();
    for (const { mesh: m, matrices, heights } of this.plantInstances) {
      for (let i = 0; i < m.count; i++) {
        matrix.fromArray(matrices, i * 16);
        const x = matrix.elements[12], z = matrix.elements[14];
        const hidden = nearbyPads(x,z).some((p) => withinPad(p, x, z, 1)) || this._insideFence(x, z) || this.inPond(x,z,2.5);
        // Keep the original vertical offset (flower heads, buried tree roots).
        const base = matrix.elements[13];
        const radius = (m.userData.rootRadius || 0) * matrix.getMaxScaleOnAxis();
        matrix.elements[13] = base + this.groundFootY(x,z,radius) - heights[i];
        if (hidden) matrix.scale(V(0, 0, 0));
        m.setMatrixAt(i, matrix);
      }
      m.instanceMatrix.needsUpdate = true;
      m.computeBoundingSphere();
    }
    this.colliders.circles = this.colliders.circles.filter((c) => !this.plantColliders.has(c));
    for (const c of this.plantColliders) if (!nearbyPads(c.x,c.z).some((p) => withinPad(p, c.x, c.z, 1)) && !this._insideFence(c.x, c.z) && !this.inPond(c.x,c.z,2.5)) this.colliders.circles.push(c);
    for (const e of this.props) {
      e.obj.position.y = this.surfaceY(e.x, e.z);
      e.obj.visible = !nearbyPads(e.x,e.z).some((p) => withinPad(p, e.x, e.z, 0)) && !this.inPond(e.x,e.z);
      e.obj.updateMatrixWorld(true);
      for (const seat of e.seats || []) seat.y = e.obj.position.y + 0.45;
      for (const emitter of e.emitters) if (emitter.local) emitter.pos.copy(e.obj.localToWorld(emitter.local.clone()));
      if (e.light && e.obj.userData.lightLocal) e.light.light.position.copy(e.obj.localToWorld(e.obj.userData.lightLocal.clone()));
    }
    for (const m of this.billboards) {
      m.position.y = this.surfaceY(m.position.x, m.position.z);
      m.visible = !nearbyPads(m.position.x,m.position.z).some((p) => withinPad(p, m.position.x, m.position.z, 0)) && !this.inPond(m.position.x,m.position.z);
    }
    for (const e of [...this.roads, ...(this.hamlet?.roads || [])]) {
      this.root.remove(e.obj); e.obj.geometry.dispose();
      e.obj = this._ribbon(e.points, e.width, this.userRoadMat, { step: 1, fitGround: true, lift: 0.1 });
    }
    for (const e of this.fences) {
      this.root.remove(e.obj); e.obj.geometry.dispose();
      this.colliders.segs = this.colliders.segs.filter(s => !e.segs.includes(s));
      const start = this.colliders.segs.length; e.obj = this._fence(e.points, true); e.segs = this.colliders.segs.slice(start);
    }
    if (this.hamlet) for (const e of [...this.hamlet.roads, ...this.hamlet.props]) e.obj.visible = this.hamlet.visible;
  }

  _updatePuddles() {
    if(!this.puddles){
      const sites=[];for(let i=0;i<18;i++)sites.push([i%2?2.7:-2.6,-48+i*5.7,0.6+(i%3)*0.22,0.3+(i%4)*0.08]);
      for(let i=0;i<7;i++)sites.push([-140+i*8,65+Math.sin(i*2)*1.4,0.7,0.4]);
      const geo=new THREE.CircleGeometry(1,24);geo.rotateX(-Math.PI/2);
      const mat=new THREE.MeshPhysicalMaterial({color:'#8faeb6',roughness:0.12,metalness:0.18,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
      this.puddles=new THREE.InstancedMesh(geo,mat,sites.length);this.puddles.name='Shallow rain puddles';const matrix=new THREE.Matrix4();
      sites.forEach(([x,z,sx,sz],i)=>this.puddles.setMatrixAt(i,matrix.makeScale(sx,1,sz).setPosition(x,walkHeight(x,z)+0.025,z)));this.puddles.computeBoundingSphere();this.root.add(this.puddles);
    }
    this.puddles.visible=(this.wetAmount||0)>0.01;this.puddles.material.opacity=(this.wetAmount||0)*0.42;
  }

  areaAnimationVisible(camera, x, y, z, radius) {
    if (!camera) return true;
    const view = this._areaView ??= { center: V(), matrix: new THREE.Matrix4(), frustum: new THREE.Frustum() };
    view.center.set(x,y,z);
    // Keep nearby animation and potential shadow casters exact, even behind the camera.
    if (camera.position.distanceToSquared(view.center) < (radius+120)**2) return true;
    camera.updateMatrixWorld();
    view.frustum.setFromProjectionMatrix(view.matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
    return view.frustum.intersectsSphere(new THREE.Sphere(view.center,radius));
  }

  update(dt, t, camera) {
    this._updatePuddles();
    const L = this.lanternLevel;
    this.waterUniforms.uWaterTime.value = t;
    this.waterUniforms.uWaterWind.value = this.wind ?? 1;
    if (this.foliageUniforms) {
      this.foliageUniforms.uTime.value = t;
      this.foliageUniforms.uWind.value = this.wind ?? 1;
    }
    this.lanternLights.forEach((l, i) => (l.intensity = L * 30 * (0.9 + 0.1 * Math.sin(t * 9 + i * 1.7) * Math.sin(t * 5.3 + i))));
    this.mat.lantern.emissiveIntensity = L * 3;
    this.haloMat.opacity = L * 0.7;
    for (const m of this.windowMats) m.emissiveIntensity = 0.04 + L * 1.3;
    for (const s of this.spinners) s.obj.rotation.z += s.speed * dt;
    for (const f of this.flames) {
      const k = 0.85 + 0.15 * Math.sin(t * 12 + f.ph) + 0.08 * Math.sin(t * 27 + f.ph * 2);
      f.sprites.forEach((sp, i) => sp.scale.set(f.base[i].x * (0.9 + 0.2 * Math.sin(t * 9 + i + f.ph)), f.base[i].y * k, 1));
      if (f.light) f.light.intensity = (12 + 22 * L) * k;
    }
    for (const b of this.billboards) {
      b.rotation.y = Math.atan2(camera.position.x - b.position.x, camera.position.z - b.position.z);
      if (b.material.userData.cutout) b.material.emissiveIntensity = 0.55 * (1 - 0.65 * L);
    }
  }
}


