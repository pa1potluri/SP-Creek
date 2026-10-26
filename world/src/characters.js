// The cast: one cartoon body (big head, big eyes, rounded limbs) re-dressed in code. An outfit is
// plain data (colours, hat, hair, vest, coat, dress, apron, bandana, badge, moustache, beard, build),
// so a new character is just a new outfit. The rig keeps the same joints the rest of the world uses
// (legs, arms, upper), adds knees, elbows, a head and blinking eyes, and stands with hips at HIP.
// Parts on the same joint with the same colour are merged into one mesh to keep draw calls low.
// Everything faces +z.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {selectCharacterProfile,profileSkin,attachCharacterProfile} from './character-profiles.js';

export const HIP = 0.95;
const R = Math.random;
const pick = (a) => a[Math.floor(R() * a.length)];

// ---------- the cast ----------
const GOLD = '#c99a3a';
export const CAST = {
  cowboy: {
    label: 'Cowboy', skin: '#e9b48c', hair: '#5a3a22', hairStyle: 'short', eyes: '#5a3418',
    hat: 'cowboy', hatColor: '#8a5a32', band: '#4a2e1a', shirt: '#efe2c6', sleeves: 'rolled', vest: '#6b3f22',
    bandana: '#c8372d', pants: '#4a6a9a', belt: '#5a3520', buckle: GOLD, boots: '#7a4a2a',
  },
  mayor: {
    label: 'Mayor', skin: '#d9a27c', hair: '#3b2416', hairStyle: 'short', eyes: '#3b2a1a', mustache: true,
    hat: 'derby', hatColor: '#557480', band: '#edc581', shirt: '#f5e9cf', sleeves: 'long', vest: '#657b70', flower: true,
    pants: '#4a4038', belt: '#2a1a12', buckle: '#b8b8b8', boots: '#3a2618',
  },
  cafeHost: {
    label: 'Café host', skin: '#e2b08a', hair: '#1d1612', hairStyle: 'short', eyes: '#2a1a12', mustache: true,
    hat: 'none', shirt: '#f4f0e6', sleeves: 'long', vest: '#1f1f24', apron: '#efe9dc',
    pants: '#2a2a2e', belt: '#1a1a1a', buckle: '#b8b8b8', boots: '#1e1612', build: 1.1,
  },
  pianist: {
    label: 'Piano player', skin: '#c68863', hair: '#2a1a12', hairStyle: 'short', eyes: '#2a1a12',
    hat: 'derby', hatColor: '#3a2a22', band: '#1a1410', shirt: '#e9e4d8', sleeves: 'long', vest: '#8a2a2a',
    pants: '#3a3a40', belt: '#1a1a1a', buckle: GOLD, boots: '#1e1612',
  },
  singer: {
    label: 'Café singer', female: true, skin: '#f1c9a5', hair: '#2a1a12', hairStyle: 'bun', eyes: '#3a5a7a',
    hat: 'none', dress: '#a8233a', shirt: '#a8233a', sleeves: 'rolled', boots: '#2a1a14', bandana: null, necklace: GOLD,
  },
  townswoman: {
    label: 'Townswoman', female: true, skin: '#f5d6bd', hair: '#8a5a2b', hairStyle: 'long', eyes: '#4a6a3a',
    hat: 'bonnet', hatColor: '#e8dcc0', dress: '#4a6a8a', shirt: '#4a6a8a', sleeves: 'long', apron: '#efe9dc', boots: '#3a2a20',
  },
  teacher: {
    label: 'Schoolteacher', female: true, skin: '#e0ac85', hair: '#c49a5a', hairStyle: 'bun', eyes: '#3a5a7a',
    hat: 'none', dress: '#5a4a6a', shirt: '#e8e0f0', sleeves: 'long', boots: '#2a1a14', necklace: '#e8e0f0',
  },
  rancher: {
    label: 'Rancher', skin: '#c68863', hair: '#1d1612', hairStyle: 'short', eyes: '#2a1a12',
    hat: 'straw', hatColor: '#d9b56a', band: '#7a3a2a', shirt: '#9a3a2a', sleeves: 'rolled',
    bandana: '#2a4a7a', pants: '#5a6a8a', belt: '#4a2e1a', buckle: GOLD, boots: '#6a4428',
  },
  preacher: {
    label: 'Preacher', skin: '#f1c9a5', hair: '#9a9a9a', hairStyle: 'short', eyes: '#3a4a5a',
    hat: 'flat', hatColor: '#1a1818', band: '#1a1818', shirt: '#f2efe8', sleeves: 'long', coat: '#1e1c1c',
    pants: '#1e1c1c', belt: '#111', buckle: '#111', boots: '#111',
  },
  shopkeeper: {
    label: 'Shopkeeper', skin: '#f1c9a5', hair: '#5a3a22', hairStyle: 'short', eyes: '#4a3a2a', mustache: true,
    hat: 'derby', hatColor: '#4a3a2a', band: '#2a1e14', shirt: '#e8e0cc', sleeves: 'rolled', vest: '#3a5a3a',
    apron: '#d8cfb8', pants: '#4a4a52', belt: '#2a1e14', buckle: GOLD, boots: '#3a2618', build: 1.2,
  },
  prospector: {
    label: 'Prospector', skin: '#d9a27c', hair: '#b8b4ac', hairStyle: 'short', eyes: '#3a4a5a', beard: true,
    hat: 'cowboy', hatColor: '#6a5a48', band: '#3a3028', shirt: '#8a7a5a', sleeves: 'rolled', vest: '#4a3a2a',
    pants: '#5a4a38', belt: '#3a2a1a', buckle: '#8a8a8a', boots: '#4a3424',
  },
  neighbour: {
    label: 'Board game neighbour', skin: '#e9b48c', hair: '#1d1612', hairStyle: 'short', eyes: '#2a1a12', mustache: true,
    hat: 'cowboy', hatColor: '#151414', band: '#7a1a22', shirt: '#f4f2ec', sleeves: 'long', vest: '#7a1a22',
    coat: '#151414', pants: '#151414', belt: '#111', buckle: '#b8b8b8', boots: '#111',
  },
  pavi: {label:'Pavi',star:'pavi',skin:'#e9ab82',hair:'#35231e',eyes:'#63371f',shirt:'#eee1c4',pants:'#795337',sash:'#8b2938',boots:'#68452e',hat:'none'},
  siri: {label:'Siri',star:'siri',female:true,skin:'#e9ab82',hair:'#2e231f',eyes:'#63371f',shirt:'#dca32e',dress:'#be3951',boots:'#68452e',hat:'none'},
  kid: {
    label: 'Kid', skin: '#e9b48c', hair: '#8a5a2b', hairStyle: 'short', eyes: '#4a3418', scale: 0.68, headScale: 1.18,
    hat: 'straw', hatColor: '#e0c07a', band: '#8a3a2a', shirt: '#d88a3a', sleeves: 'rolled',
    pants: '#4a5a7a', belt: '#4a2e1a', buckle: '#8a8a8a', boots: '#6a4428',
  },
};

// Townsfolk: one of the roles above with its colours shuffled, so the street never shows twins.
const SKINS = ['#f5d6bd', '#f1c9a5', '#e9b48c', '#e0ac85', '#c68863', '#a86e4a', '#8d5a3b'];
const HAIRS = ['#1d1612', '#3b2416', '#5a3a22', '#8a5a2b', '#c49a5a', '#9a9a9a', '#6a2a1a'];
const EYES = ['#2a1a12', '#5a3418', '#3a5a7a', '#4a6a3a', '#5a5a5a'];
const SHIRTS = ['#efe2c6', '#f4f0e6', '#9a3a2a', '#5a7a9a', '#d8c8a0', '#7a8a5a', '#c8a070', '#b05a3a', '#8a6a9a'];
const DARKS = ['#6b3f22', '#2e2b2a', '#3a5a3a', '#7a1a22', '#4a3a2a', '#2a3a5a', '#5a4a3a'];
const PANTS = ['#4a6a9a', '#4a4038', '#2a2a2e', '#5a4a38', '#3a3a40', '#5a6a8a', '#6a5a40'];
const DRESSES = ['#a8233a', '#4a6a8a', '#5a4a6a', '#6a8a5a', '#c89a4a', '#8a4a3a', '#3a5a6a', '#b07a8a'];
const HATS = ['#8a5a32', '#2b2420', '#6a5a48', '#d9b56a', '#4a3a2a', '#c8b89a', '#3a3028'];
const BANDANAS = ['#c8372d', '#2a4a7a', '#d8a030', '#3a6a3a', null, null];
const STREET = ['cowboy', 'cowboy', 'rancher', 'rancher', 'shopkeeper', 'prospector', 'neighbour', 'townswoman', 'townswoman', 'teacher', 'singer', 'kid'];

export function randomTownsfolk(role = pick(STREET)) {
  if(role==='pavi'||role==='siri')return {...CAST[role],role};
  const o = { ...CAST[role], role };
  o.skin = pick(SKINS);
  o.hair = R() < 0.15 ? '#9a9a9a' : pick(HAIRS);
  o.eyes = pick(EYES);
  if (o.female) {
    o.dress = o.shirt = pick(DRESSES);
    if (R() < 0.4) o.shirt = pick(['#efe2c6', '#f4f0e6', '#e8e0f0']);
    o.hairStyle = pick(['long', 'bun', 'bun']);
    if (o.hat === 'bonnet') o.hatColor = pick(['#e8dcc0', '#f0e6d0', o.dress]);
    o.apron = R() < 0.35 ? '#efe9dc' : null;
  } else {
    o.shirt = pick(SHIRTS);
    o.pants = pick(PANTS);
    if (o.vest) o.vest = pick(DARKS);
    if (o.hat !== 'none') o.hatColor = pick(HATS);
    if (o.bandana !== undefined || R() < 0.3) o.bandana = pick(BANDANAS);
    o.mustache = R() < 0.3;
    if (role !== 'prospector') o.beard = R() < 0.1;
    if (role !== 'kid') o.build = 0.95 + R() * 0.25;
  }
  return o;
}

// ---------- materials ----------
// Colours are baked into the vertices, so each joint needs only one or two meshes:
// mat() returns a paint (colour + one- or two-sided), not a material.
const BODY = {
  solid: new THREE.MeshLambertMaterial({ vertexColors: true }),
  double: new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }),
};
function mat(color, double = false) {
  return { color: new THREE.Color(color), double };
}
let eyeWhite = null;
const whiteOfEye = () => (eyeWhite ??= new THREE.MeshLambertMaterial({ color: 0xfbf8f2, emissive: 0xfbf8f2, emissiveIntensity: 0.15 }));
function shade(hex, k) {
  return '#' + new THREE.Color(hex).multiplyScalar(k).getHexString();
}

// ---------- shapes ----------
const capsule = (r, len) => new THREE.CapsuleGeometry(r, len, 4, 10);
const sphere = (r, ...a) => new THREE.SphereGeometry(r, 16, 12, ...a);
const lathe = (pts, phiStart = 0, phiLength = Math.PI * 2) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 18, phiStart, phiLength);

// a hat brim that curls up at the sides
function brim(r, curl, dip = 0.015) {
  const g = new THREE.CylinderGeometry(r, r, 0.018, 28, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / r, z = p.getZ(i) / r;
    p.setY(i, p.getY(i) + curl * x * x - dip * z * z);
  }
  g.computeVertexNormals();
  return g;
}
// a hat crown, creased on top and pinched at the front
function crown(rTop, rBottom, h, dent) {
  const g = new THREE.CylinderGeometry(rTop, rBottom, h, 18, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    if (p.getY(i) <= 0) continue;
    const x = p.getX(i), z = p.getZ(i);
    if (Math.hypot(x, z) < 0.01) p.setY(i, p.getY(i) - dent);
    else p.setX(i, x * (1 - 0.2 * Math.max(0, z / rTop)));
  }
  g.computeVertexNormals();
  return g;
}

// Collects parts per joint and colour, then merges them.
class Rig {
  constructor() {
    this.parts = new Map();
  }
  add(joint, geo, material, [x, y, z] = [0, 0, 0], [rx, ry, rz] = [0, 0, 0], [sx, sy, sz] = [1, 1, 1]) {
    geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz)));
    for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k);
    if (!geo.index) geo = geo.toNonIndexed().setIndex([...Array(geo.attributes.position.count).keys()]);
    if (!material.isMaterial) {
      const n = geo.attributes.position.count, col = new Float32Array(n * 3), c = material.color;
      for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3);
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      material = material.double ? BODY.double : BODY.solid;
    }
    if (!this.parts.has(joint)) this.parts.set(joint, new Map());
    const byMat = this.parts.get(joint);
    if (!byMat.has(material)) byMat.set(material, []);
    byMat.get(material).push(geo);
  }
  build() {
    for (const [joint, byMat] of this.parts) {
      for (const [material, geos] of byMat) {
        const mesh = new THREE.Mesh(geos.length > 1 ? mergeGeometries(geos) : geos[0], material);
        mesh.castShadow = mesh.receiveShadow = true;
        joint.add(mesh);
      }
    }
  }
}

function joint(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  return g;
}

// ---------- the body ----------
const live = new Set(); // WeakRefs, for blinking and idle glances

export function makeCharacter(outfit = CAST.cowboy) {
  const pipelineId=selectCharacterProfile(outfit);
  if(outfit.star&&starSources[outfit.star]&&!pipelineId)return makeStarCharacter(outfit);
  const o = { skin: '#e9b48c', hair: '#5a3a22', eyes: '#4a2c18', shirt: '#efe2c6', pants: '#4a4038', boots: '#4a3020', belt: '#4a2e1a', buckle: GOLD, build: 1, sleeves: 'long', hat: 'none', hairStyle: 'short', ...outfit };
  const g = new THREE.Group(), rig = new Rig(), b = o.build;
  if(pipelineId)o.skin=profileSkin(pipelineId)||o.skin;
  const skin = mat(o.skin), shirt = mat(o.shirt), pants = mat(o.female ? o.boots : o.pants), boots = mat(o.boots);
  const sleeve = mat(o.coat || o.shirt);

  // legs: hip → knee → ankle
  const legs = [], knees = [];
  for (const s of [-1, 1]) {
    const hip = joint(g, s * 0.095 * b, HIP, 0), knee = joint(hip, 0, -0.44, 0);
    rig.add(hip, capsule(o.female ? 0.062 : 0.074, 0.32), pants, [0, -0.22, 0]);
    rig.add(knee, capsule(o.female ? 0.055 : 0.066, 0.3), pants, [0, -0.2, 0]);
    rig.add(knee, new THREE.CylinderGeometry(0.082, 0.078, 0.24, 12), boots, [0, -0.36, 0]); // boot shaft
    rig.add(knee, capsule(0.064, 0.13), boots, [0, -0.47, 0.055], [Math.PI / 2, 0, 0], [1.05, 1, 0.8]); // foot
    rig.add(knee, new THREE.BoxGeometry(0.13, 0.03, 0.27), mat(shade(o.boots, 0.55)), [0, -0.5, 0.05]); // sole
    legs.push(hip);
    knees.push(knee);
  }

  // skirt, hung from the hips (the legs swing underneath)
  let skirt = null, apron = null;
  if (o.dress) {
    skirt = joint(g, 0, 0, 0);
    rig.add(skirt, lathe([[0.16, 1.07], [0.21, 0.97], [0.29, 0.66], [0.36, 0.34], [0.375, 0.27]]), mat(o.dress, true), [0, 0, 0], [0, 0, 0], [b, 1, 0.86]);
    rig.add(skirt, new THREE.TorusGeometry(0.373, 0.018, 6, 24), mat(shade(o.dress, 0.75)), [0, 0.28, 0], [Math.PI / 2, 0, 0], [b, 0.86, 1]);
    if (o.apron) {
      apron = joint(skirt, 0, 0, 0); // its own mesh, hidden when sitting
      rig.add(apron, new THREE.BoxGeometry(0.3, 0.52, 0.012), mat(o.apron), [0, 0.72, 0.262], [-0.24, 0, 0]);
    }
  }

  // upper body
  const upper = joint(g, 0, 0, 0);
  if (!o.dress) rig.add(upper, sphere(0.17), pants, [0, 0.96, 0], [0, 0, 0], [b, 0.55, 0.8]);
  const waist = o.female ? 0.13 : 0.16;
  rig.add(upper, lathe([[0.15, 0.98], [waist, 1.1], [0.19, 1.25], [0.19, 1.33], [0.15, 1.42], [0.07, 1.47], [0.055, 1.5]]), shirt, [0, 0, 0], [0, 0, 0], [b, 1, 0.72]);
  if (!o.dress) {
    rig.add(upper, new THREE.CylinderGeometry(0.168, 0.168, 0.06, 18), mat(o.belt), [0, 1.0, 0], [0, 0, 0], [b, 1, 0.78]);
    rig.add(upper, new THREE.CylinderGeometry(0.038, 0.038, 0.02, 12), mat(o.buckle), [0, 1.0, 0.13], [Math.PI / 2, 0, 0]);
  } else {
    rig.add(upper, new THREE.CylinderGeometry(0.152, 0.152, 0.05, 18), mat(shade(o.dress, 0.75)), [0, 1.08, 0], [0, 0, 0], [b, 1, 0.74]);
  }
  if (o.vest) rig.add(upper, lathe([[0.168, 1.0], [0.18, 1.1], [0.2, 1.25], [0.2, 1.33], [0.16, 1.425]], 0.32, Math.PI * 2 - 0.64), mat(o.vest, true), [0, 0, 0], [0, 0, 0], [b, 1, 0.75]);
  if (o.coat) rig.add(upper, lathe([[0.166, 1.43], [0.205, 1.33], [0.2, 1.15], [0.215, 1.0], [0.25, 0.6], [0.265, 0.5]], 0.26, Math.PI * 2 - 0.52), mat(o.coat, true), [0, 0, 0], [0, 0, 0], [b, 1, 0.8]);
  if (o.apron && !o.dress) rig.add(upper, new THREE.BoxGeometry(0.3, 0.55, 0.012), mat(o.apron), [0, 0.8, 0.15], [-0.1, 0, 0]);
  if (o.bandana) {
    rig.add(upper, new THREE.ConeGeometry(0.1, 0.15, 3), mat(o.bandana), [0, 1.385, 0.11], [Math.PI, 0, 0], [1, 1, 0.45]);
    rig.add(upper, new THREE.TorusGeometry(0.075, 0.024, 6, 14), mat(o.bandana), [0, 1.455, 0.005], [Math.PI / 2, 0, 0]);
  }
  if (o.necklace) rig.add(upper, new THREE.TorusGeometry(0.08, 0.01, 4, 16), mat(o.necklace), [0, 1.44, 0.02], [Math.PI / 2 - 0.35, 0, 0]);
  if (o.flower) {
    for (let i = 0; i < 5; i++) rig.add(upper, sphere(0.022), mat('#efb4c8'), [0.09 + Math.cos(i * Math.PI * 0.4) * 0.025, 1.3 + Math.sin(i * Math.PI * 0.4) * 0.025, 0.155]);
    rig.add(upper, sphere(0.018), mat('#f4d378'), [0.09, 1.3, 0.17]);
  }
  if (o.badge) rig.add(upper, new THREE.CylinderGeometry(0.036, 0.036, 0.012, 5), mat(GOLD), [0.08 * b, 1.3, 0.14], [Math.PI / 2, 0, 0]);

  // arms: shoulder → elbow → hand
  const arms = [], elbows = [];
  for (const s of [-1, 1]) {
    const sh = joint(upper, s * 0.22 * b, 1.39, 0), el = joint(sh, 0, -0.29, 0);
    rig.add(sh, sphere(0.06), sleeve, [0, -0.01, 0]);
    rig.add(sh, capsule(0.056, 0.2), sleeve, [0, -0.14, 0]);
    const rolled = o.sleeves === 'rolled' && !o.coat;
    rig.add(el, capsule(0.05, 0.17), rolled ? skin : sleeve, [0, -0.12, 0]);
    if (rolled) rig.add(el, new THREE.TorusGeometry(0.056, 0.022, 6, 12), shirt, [0, -0.02, 0], [Math.PI / 2, 0, 0]);
    else if (o.coat) rig.add(el, new THREE.CylinderGeometry(0.05, 0.05, 0.03, 10), shirt, [0, -0.225, 0]);
    rig.add(el, sphere(0.056), skin, [0, -0.27, 0.01], [0, 0, 0], [0.9, 1.05, 1]);
    arms.push(sh);
    elbows.push(el);
  }
  // rest the arms a little away from the body
  arms.forEach((a, i) => (a.userData.rest = (i ? 1 : -1) * 0.08));

  // head (the neck joint turns the head; the eyes joint blinks)
  const head = joint(upper, 0, 1.46, 0), hs = o.headScale || 1;
  head.scale.setScalar(hs);
  rig.add(head, new THREE.CylinderGeometry(0.055, 0.06, 0.12, 10), skin, [0, 0.04, 0]);
  rig.add(head, sphere(0.21), skin, [0, 0.25, 0], [0, 0, 0], [0.96, 1, 0.94]);
  rig.add(head, sphere(0.165), skin, [0, 0.18, 0.035], [0, 0, 0], [1, 0.9, 1]); // cheeks and jaw
  for (const s of [-1, 1]) rig.add(head, sphere(0.045), skin, [s * 0.198, 0.235, -0.01], [0, 0, 0], [0.55, 1, 0.8]);
  rig.add(head, sphere(0.036), mat(shade(o.skin, 0.92)), [0, 0.215, 0.205], [0, 0, 0], [0.95, 0.9, 1]); // nose
  rig.add(head, new THREE.TorusGeometry(0.048, 0.011, 6, 14, Math.PI), mat('#7a2a24'), [0, 0.168, 0.188], [0, 0, Math.PI], [1, 0.8, 0.6]); // smile
  const eyes = joint(head, 0, 0.27, 0.15);
  for (const s of [-1, 1]) {
    rig.add(eyes, sphere(0.047), whiteOfEye(), [s * 0.072, 0, 0.032], [0, 0, 0], [0.85, 1.12, 0.5]);
    rig.add(eyes, sphere(0.031), mat(o.eyes), [s * 0.07, -0.006, 0.05], [0, 0, 0], [1, 1.1, 0.5]);
    rig.add(eyes, sphere(0.017), mat('#0e0a08'), [s * 0.07, -0.006, 0.062], [0, 0, 0], [1, 1, 0.5]);
    rig.add(eyes, sphere(0.008), whiteOfEye(), [s * 0.07 + 0.011, 0.011, 0.07]);
    // brows: thin, raised at the inner end (friendly, not cross)
    rig.add(head, capsule(0.009, 0.055), mat(o.hair), [s * 0.074, 0.352, 0.176], [0, 0, Math.PI / 2 - s * 0.18]);
  }
  const hair = mat(o.hair, true);
  rig.add(head, sphere(0.222, 0, Math.PI * 2, 0, 1.25), hair, [0, 0.25, -0.005], [-0.42, 0, 0]);
  if (o.hairStyle === 'long') rig.add(head, capsule(0.15, 0.24), hair, [0, 0.12, -0.12], [0.15, 0, 0], [1.05, 1, 0.55]);
  if (o.hairStyle === 'bun') rig.add(head, sphere(0.085), hair, [0, 0.4, -0.15]);
  if (o.mustache) for (const s of [-1, 1]) rig.add(head, capsule(0.022, 0.055), mat(o.hair), [s * 0.036, 0.183, 0.205], [0, 0, s * 1.2]);
  if (o.beard) rig.add(head, sphere(0.16), mat(o.hair), [0, 0.12, 0.06], [0, 0, 0], [1.02, 0.85, 0.8]);
  const hat = _hat(rig, head, o);

  rig.build();
  if (o.scale) g.scale.setScalar(o.scale);
  const p = {
    g, legs, knees, arms, elbows, upper, head, eyes, skirt, apron, hat, hatRest: hat && { y: hat.position.y, rx: hat.rotation.x },
    outfit: o, amt: 0, headYaw: 0, headPitch: 0, blinkOff: R() * 5, blinkEvery: 3 + R() * 3, lookOff: R() * 20,
  };
  if(o.star){
    g.name=o.label;g.scale.setScalar(0.84);
    p.feet=knees.map(knee=>joint(knee,0,-0.44,0));
  }
  if(pipelineId)attachCharacterProfile(p,pipelineId);
  stand(p);
  live.add(new WeakRef(p));
  return p;
}

// These original meshes/textures are shared; every appearance owns its own skeleton.
const starSources=Object.fromEntries(await Promise.all(['pavi','siri'].map(async role=>{
  try{
  const url=new URL('../assets/characters/'+role+'.glb',import.meta.url),response=await fetch(url);
  if(!response.ok)return [role,null];
  const gltf=await new GLTFLoader().parseAsync(await response.arrayBuffer(),new URL('.',url).href);let source;gltf.scene.updateMatrixWorld(true);gltf.scene.traverse(o=>{if(o.isMesh)source=o;});
  const geometry=source.geometry.clone().applyMatrix4(source.matrixWorld),material=source.material.clone();material.emissive.set(0xffffff);material.emissiveMap=material.map;material.emissiveIntensity=0.07;
  return [role,{geometry,material}];
  }catch{return [role,null];}
})));
const STAR_BONES=[['hips',null,[0,0.43,0.04]],['spine',0,[0,0.57,0.04]],['chest',1,[0,0.70,0.04]],['neck',2,[0,0.745,0.04]],['head',3,[0,0.79,0.025]],['armR',2,[-0.12,0.70,0.04]],['elbowR',5,[-0.215,0.49,0.055]],['armL',2,[0.12,0.70,0.04]],['elbowL',7,[0.215,0.49,0.055]],['legR',0,[-0.08,0.40,0.05]],['kneeR',9,[-0.09,0.20,0.065]],['footR',10,[-0.09,0.055,0.09]],['legL',0,[0.08,0.40,0.05]],['kneeL',12,[0.09,0.20,0.065]],['footL',13,[0.09,0.055,0.09]],['skirt',0,[0,0.43,0.04]],['Thick side braid',4,[0,0.83,-0.10]]];
function starRigSpecs(role){
  const specs=STAR_BONES.map(([name,parent,pos])=>[name,parent,[...pos]]);if(role==='siri'){
    for(const [i,pos]of [[0,[0,0.56,0.04]],[1,[0,0.64,0.04]],[2,[0,0.72,0.04]],[3,[0,0.80,0.04]],[4,[0,0.84,0.025]],[5,[-0.12,0.73,0.035]],[6,[-0.205,0.56,0.035]],[7,[0.12,0.73,0.035]],[8,[0.205,0.56,0.035]],[9,[-0.08,0.53,0.05]],[10,[-0.09,0.29,0.065]],[12,[0.08,0.53,0.05]],[13,[0.09,0.29,0.065]],[15,[0,0.56,0.04]],[16,[0,0.83,-0.10]]])specs[i][2]=pos;
  }return specs;
}
function starArmGroups(geometry,role){
  const p=geometry.attributes.position,n=p.count,cap=role==='siri'?0.69:0.66,parent=Int32Array.from({length:n},(_,i)=>i),seen=new Map();
  const find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;},join=(a,b)=>{parent[find(a)]=find(b);};
  for(let i=0;i<n;i++){if(p.getY(i)>cap)continue;const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e5)).join(',');if(seen.has(key))join(i,seen.get(key));else seen.set(key,i);}
  const index=geometry.index;for(let i=0;i<index.count;i+=3){const tri=[index.getX(i),index.getX(i+1),index.getX(i+2)];for(let k=0;k<3;k++){const a=tri[k],b=tri[(k+1)%3];if(p.getY(a)<=cap&&p.getY(b)<=cap)join(a,b);}}
  const roots=[-1,1].map(side=>{let best=Infinity,seed=0;for(let i=0;i<n;i++){if(p.getY(i)>cap)continue;const distance=(p.getX(i)-side*0.26)**2+(p.getY(i)-(role==='siri'?0.41:0.34))**2+(p.getZ(i)-0.055)**2;if(distance<best){best=distance;seed=i;}}return find(seed);});
  return {cap,arm:Uint8Array.from({length:n},(_,i)=>p.getY(i)<=cap&&roots.includes(find(i))?1:0)};
}
function skinStarGeometry(role,geometry){
  const groups=role==='siri'?starArmGroups(geometry,role):null;
  const position=geometry.attributes.position,indices=new Uint16Array(position.count*4),weights=new Float32Array(position.count*4),smooth=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i),ax=Math.abs(x),siri=role==='siri',influences=new Map(),add=(bone,w)=>{if(w>0)influences.set(bone,(influences.get(bone)||0)+w);};
    const side=x<0?0:1,leg=side?12:9,knee=leg+1,foot=leg+2;
    let armGate=smooth((siri?0.34-0.29*y:0.26-0.20*y)-0.018,(siri?0.34-0.29*y:0.26-0.20*y)+0.012,ax)*smooth(siri?0.32:0.26,siri?0.36:0.30,y)*(1-smooth(0.70,0.79,y))*(1-smooth(0.12,0.16,z));
    if(groups&&y<groups.cap){const blend=smooth(groups.cap-0.025,groups.cap,y);armGate=groups.arm[i]*(1-blend)+armGate*blend;}
    const body=1-armGate;
    if(siri&&y>=0.13&&y<0.59){const skirt=1-smooth(0.53,0.59,y);add(15,body*skirt);add(0,body*(1-skirt));}
    else if(y<0.43){const root=smooth(0.32,0.43,y),lower=1-smooth(0.16,0.25,y),toe=1-smooth(0.04,0.105,y);add(0,body*root);add(leg,body*(1-root)*(1-lower));add(knee,body*(1-root)*lower*(1-toe));add(foot,body*(1-root)*lower*toe);}
    else {const chain=siri?[[0,0.56],[1,0.64],[2,0.72],[3,0.80],[4,0.84]]:[[0,0.43],[1,0.57],[2,0.70],[3,0.745],[4,0.79]];let j=0;while(j<chain.length-1&&y>chain[j+1][1])j++;if(j===4)add(4,body);else{const u=smooth(chain[j][1],chain[j+1][1],y);add(chain[j][0],body*(1-u));add(chain[j+1][0],body*u);}}
    if(armGate){const arm=side?7:5,bend=1-smooth(siri?0.52:0.44,siri?0.61:0.55,y);add(arm,armGate*(1-bend));add(arm+1,armGate*bend);}
    // The back braid follows the head and upper back; the known front braid is preserved.
    if(siri&&y>0.56&&y<0.84&&z<-0.11&&ax<0.15){const mix=smooth(0.56,0.67,y)*(1-smooth(0.12,0.16,ax));for(const [bone,w]of influences)influences.set(bone,w*(1-mix));add(16,mix*0.7);add(2,mix*0.3);}
    const chosen=[...influences].sort((a,b)=>b[1]-a[1]).slice(0,4),total=chosen.reduce((n,p)=>n+p[1],0)||1;chosen.forEach(([bone,w],k)=>{indices[i*4+k]=bone;weights[i*4+k]=w/total;});
  }
  geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
}
for(const [role,source]of Object.entries(starSources))if(source)skinStarGeometry(role,source.geometry);
function makeStarCharacter(o){
  const source=starSources[o.star],g=new THREE.Group(),upper=new THREE.Bone(),specs=starRigSpecs(o.star),bones=specs.map(([name])=>{const b=new THREE.Bone();b.name=name;return b;});g.name=o.label;upper.name='torsoMotion';g.add(bones[0]);bones[0].add(upper);
  specs.forEach(([,parent,pos],i)=>{bones[i].position.fromArray(pos);if(parent!==null){bones[i].position.sub(new THREE.Vector3(...specs[parent][2]));(i===1?upper:bones[parent]).add(bones[i]);}});
  const mesh=new THREE.SkinnedMesh(source.geometry,source.material);mesh.name=o.label+' original textured model';mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);g.updateMatrixWorld(true);mesh.bind(new THREE.Skeleton([...bones,upper]));g.scale.setScalar(1.42);mesh.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,0.6,0),1.05);mesh.userData.star=o.star;
  const eyes=new THREE.Group(),arms=[bones[5],bones[7]],elbows=[bones[6],bones[8]],legs=[bones[9],bones[12]],knees=[bones[10],bones[13]],feet=[bones[11],bones[14]];for(const arm of arms)arm.userData.rest=0;
  const person={g,upper,head:bones[4],eyes,arms,elbows,legs,knees,feet,skirt:o.star==='siri'?bones[15]:null,apron:null,hat:null,outfit:o,model:mesh,bones,amt:0,headYaw:0,headPitch:0,blinkOff:0,blinkEvery:5,lookOff:0,lookAround:0.15};live.add(new WeakRef(person));return person;
}

// Rain clothes are removable props; the supplied model and its colour map stay intact.
export function addRainGear(p) {
  if(p.rainGear)return p.rainGear;
  const umbrella=new THREE.Group();umbrella.name='Soft rain umbrella';p.g.add(umbrella);
  const colors=p.outfit.star==='pavi'?['#9bcfce','#f4d995']:['#e7aac7','#bcbfe4'];
  for(let i=0;i<8;i++){const canopy=new THREE.Mesh(new THREE.SphereGeometry(0.58,6,8,i*Math.PI/4,Math.PI/4,0,Math.PI/2),new THREE.MeshLambertMaterial({color:colors[i%2],side:THREE.DoubleSide}));canopy.scale.y=0.45;umbrella.add(canopy);}
  const shaft=new THREE.Mesh(new THREE.CapsuleGeometry(0.012,0.8,3,6),new THREE.MeshLambertMaterial({color:'#c8bca5'}));shaft.position.y=-0.42;umbrella.add(shaft);
  const tip=new THREE.Mesh(new THREE.SphereGeometry(0.035,8,6),new THREE.MeshLambertMaterial({color:colors[0]}));tip.position.y=0.26;umbrella.add(tip);
  const boots=p.feet.map(foot=>{const g=new THREE.Group();g.name='Rounded rain boot';foot.add(g);const m=new THREE.MeshLambertMaterial({color:colors[0],emissive:colors[0],emissiveIntensity:0.06});const toe=new THREE.Mesh(new THREE.SphereGeometry(0.095,12,8),m);toe.scale.set(0.72,0.8,1.3);toe.position.set(0,0.02,0.035);const cuff=new THREE.Mesh(new THREE.CylinderGeometry(0.075,0.08,0.15,12),m);cuff.position.y=0.12;g.add(toe,cuff);return g;});
  const gear={umbrella,boots,setVisible(on,open=on){
    umbrella.visible=!!open;if(open){if(umbrella.parent!==p.g)p.g.add(umbrella);}else umbrella.removeFromParent();
    boots.forEach((g,i)=>{g.visible=!!on;if(on){if(g.parent!==p.feet[i])p.feet[i].add(g);}else g.removeFromParent();});
  }};gear.setVisible(false);p.rainGear=gear;return gear;
}

// Returns the hat's joint (it can be tipped), or null for no hat or a bonnet.
function _hat(rig, head, o) {
  if (o.hat === 'none') return null;
  const c = mat(o.hatColor || '#6a4a30'), band = mat(o.band || shade(o.hatColor || '#6a4a30', 0.6));
  if (o.hat === 'bonnet') {
    rig.add(head, sphere(0.245, Math.PI / 2 + 1.05, Math.PI * 2 - 2.1, 0, 2.3), mat(o.hatColor, true), [0, 0.26, -0.01], [-0.25, 0, 0]);
    rig.add(head, new THREE.TorusGeometry(0.2, 0.025, 6, 20, Math.PI * 1.1), c, [0, 0.27, 0.11], [-0.3, 0, -Math.PI * 0.05]);
    return null;
  }
  const h = joint(head, 0, 0.395, -0.01);
  h.rotation.x = -0.13;
  if (o.hat === 'cowboy' || o.hat === 'straw') {
    const big = o.hat === 'straw' ? 1.12 : 1;
    rig.add(h, brim(0.33 * big, 0.085 * big), c, [0, 0, 0]);
    rig.add(h, crown(0.135, 0.165, 0.17, 0.045), c, [0, 0.094, 0]);
    rig.add(h, new THREE.CylinderGeometry(0.167, 0.168, 0.04, 18), band, [0, 0.03, 0]);
  } else if (o.hat === 'derby') {
    rig.add(h, brim(0.22, 0.035, 0.01), c, [0, 0, 0]);
    rig.add(h, sphere(0.16, 0, Math.PI * 2, 0, Math.PI / 2), c, [0, 0.01, 0], [0, 0, 0], [1, 1.05, 1]);
    rig.add(h, new THREE.CylinderGeometry(0.162, 0.162, 0.035, 18), band, [0, 0.027, 0]);
  } else if (o.hat === 'flat') {
    rig.add(h, brim(0.3, 0.0, 0), c, [0, 0, 0]);
    rig.add(h, new THREE.CylinderGeometry(0.14, 0.152, 0.11, 18), c, [0, 0.064, 0]);
    rig.add(h, new THREE.CylinderGeometry(0.153, 0.154, 0.03, 18), band, [0, 0.025, 0]);
  }
  return h;
}

// ---------- poses and motion ----------
// Walking: phase advances with distance, amt 0 (standing) … 1 (walking) … >1 (running).
export function animatePerson(p, phase, amt) {
  const s = Math.sin(phase) * amt, c = Math.cos(phase), a = Math.min(amt, 1.3);
  const stride = p.skirt ? 0.36 : 0.55; // shorter steps in a long dress
  p.amt = amt;
  p.legs[0].rotation.x = s * stride;
  p.legs[1].rotation.x = -s * stride;
  if (p.knees) {
    p.knees[0].rotation.x = 0.05 + Math.max(0, -c) * stride * 1.55 * a;
    p.knees[1].rotation.x = 0.05 + Math.max(0, c) * stride * 1.55 * a;
  }
  p.arms[0].rotation.set(-s * 0.45, 0, p.arms[0].userData.rest || 0);
  p.arms[1].rotation.set(s * 0.45, 0, p.arms[1].userData.rest || 0);
  if (p.elbows) for (const e of p.elbows) e.rotation.set(-0.15 - 0.35 * a, 0, 0);
  p.upper.position.y = Math.abs(Math.cos(phase)) * 0.035 * amt;
  p.upper.rotation.set(0, s * 0.07, 0);
  p.headYaw = -s * 0.06;
  p.headPitch = 0;
  if (p.skirt) { if(p.model)p.skirt.rotation.x=0; p.skirt.rotation.z = Math.sin(phase) * 0.03 * a; }
  if (p.hat) p.hat.position.y = p.hatRest.y, p.hat.rotation.x = p.hatRest.rx;
}

// Sitting on a chair (knees bent, shins down) or astride a horse (wide). k (0…1) blends in
// from standing, for sitting down and getting up.
export function seat(p, astride = false, k = 1) {
  p.legs.forEach((l, i) => l.rotation.set((astride ? -1.05 : -1.45) * k, 0, (i ? 1 : -1) * (astride ? 0.4 : 0.1) * k));
  if (p.knees) p.knees.forEach((n) => (n.rotation.x = 0.05 + ((astride ? 0.95 : 1.45) - 0.05) * k));
  p.arms.forEach((a) => a.rotation.set(-0.6 * k, 0, (a.userData.rest || 0) * (1 - k)));
  if (p.elbows) p.elbows.forEach((e) => e.rotation.set(-0.15 - 0.45 * k, 0, 0));
  p.upper.rotation.set(0, 0, 0);
  p.upper.position.y = 0;
  if(p.model){if(p.skirt)p.skirt.rotation.set(-0.85*k,0,0);return;}
  if (p.skirt) {
    p.skirt.rotation.set(-1.2 * k, 0, 0);
    p.skirt.position.set(0, (HIP - 0.08) * k, 0.12 * k);
    p.skirt.scale.set(1, 1 - 0.5 * k, 1 - 0.1 * k);
    p.skirt.children.forEach((m) => (m.position.y = -HIP * k));
    if (p.apron) p.apron.visible = k < 0.5;
  }
}
export function stand(p) {
  seat(p, false, 0);
  p.legs.forEach((l) => l.rotation.set(0, 0, 0));
}

// Gestures, laid over the walking or sitting pose each frame.
// k: 0…1 through a one-off gesture (wave, tip); t: the world clock, for the ongoing ones.
const env = (k) => Math.min(1, k * 5, (1 - k) * 5); // ease in, hold, ease out
const mix = (a, b, e) => a + (b - a) * e;
export function gesture(p, kind, k, t) {
  const [ra, la] = p.arms, [re, le] = p.elbows; // the right arm is on the −x side
  const e = env(k);
  if(kind==='wave'&&p.model&&p.outfit.star==='siri'){
    ra.rotation.set(-0.15*e,0,-1.3*e);re.rotation.set(-0.25*e,0,Math.sin(t*2)*0.15*e);p.headPitch=-0.04*e;return;
  }
  if (kind === 'wave') {
    // upper arm up and out, forearm upright, the hand swinging side to side
    ra.rotation.set(mix(ra.rotation.x, -0.3, e), 0, mix(ra.rotation.z, -2.2, e));
    re.rotation.set(mix(re.rotation.x, -0.2, e), 0, e * (-0.6 + Math.sin(t * 11) * 0.4));
    p.headPitch = -0.08 * e;
  } else if (kind === 'tip') {
    // hand up to the brim, lift and tilt the hat, a small nod, and back
    ra.rotation.set(mix(ra.rotation.x, -2.35, e), 0, mix(ra.rotation.z, -0.45, e));
    re.rotation.set(mix(re.rotation.x, -1.35, e), 0, 0);
    const lift = Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (k - 0.25) / 0.5))));
    if (p.hat) {
      p.hat.position.y = p.hatRest.y + 0.05 * lift;
      p.hat.rotation.x = p.hatRest.rx - 0.4 * lift;
    }
    p.headPitch = 0.16 * lift;
  } else if (kind === 'talk') {
    // explaining something: hands moving, head bobbing, shoulders turning a little
    ra.rotation.set(-0.55 + Math.sin(t * 2.7) * 0.25, 0, -0.15);
    re.rotation.set(-1.2 + Math.sin(t * 3.3) * 0.25, 0, 0);
    la.rotation.set(-0.3 + Math.sin(t * 2.1 + 1) * 0.15, 0, 0.12);
    le.rotation.set(-0.8 + Math.sin(t * 2.6) * 0.2, 0, 0);
    p.headPitch = Math.sin(t * 4.1) * 0.05;
    p.upper.rotation.y += Math.sin(t * 1.3) * 0.08;
  } else if (kind === 'listen') {
    // nodding along now and then
    p.headPitch = Math.max(0, Math.sin(t * 1.9)) * Math.max(0, Math.sin(t * 0.37)) * 0.18;
  }
}

// Once per frame (from the world clock, so renders are exact): blinking, and people standing
// still glance around now and then.
const poseLayers=new Set();
export function addCharacterPoseLayer(layer){poseLayers.add(layer);return ()=>poseLayers.delete(layer);}
export function pointCharacterArm(p,index,target,amount=1){
  const arm=p.arms[index],elbow=p.elbows[index];p.g.updateMatrixWorld(true);const origin=arm.getWorldPosition(new THREE.Vector3()),current=elbow.getWorldPosition(new THREE.Vector3()).sub(origin).normalize(),desired=target.clone().sub(origin).normalize(),inverse=arm.parent.getWorldQuaternion(new THREE.Quaternion()).invert();current.applyQuaternion(inverse);desired.applyQuaternion(inverse);const q=new THREE.Quaternion().setFromUnitVectors(current,desired).multiply(arm.quaternion);arm.quaternion.slerp(q,amount);elbow.rotation.set(0,0,0);
}
export function tickCharacters(t) {
  for(const layer of poseLayers)layer(t);
  for (const ref of live) {
    const p = ref.deref();
    if (!p) {
      live.delete(ref);
      continue;
    }
    if (!p.g.parent) continue;
    const k = (t + p.blinkOff) % p.blinkEvery;
    p.eyes.scale.y = k < 0.12 || (p.blinkEvery > 5 && k > 0.3 && k < 0.4) ? 0.12 : 1;
    const still = Math.max(0, 1 - p.amt * 4);
    const glance = Math.sin(t * 0.31 + p.lookOff) * 0.45 + Math.sin(t * 0.83 + p.lookOff * 2) * 0.15;
    p.head.rotation.y = p.headYaw + glance * still * (p.lookAround ?? 1);
    p.head.rotation.x = (Math.sin(t * 0.47 + p.lookOff) * 0.06 - 0.02) * still * (p.lookAround ?? 1) + p.headPitch;
  }
}
