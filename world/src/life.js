import { familySign } from './family.js';
// Town life: people strolling the boardwalks, riders and a stagecoach on the road, chickens,
// tumbleweeds, swinging shop signs, a waving flag and wandering cut-outs. Everything advances
// by dt, so it looks the same in the live view and in a frame-by-frame MP4 render.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { terrainHeight, roadX, walkHeight, LEFT, RIGHT, RAIL_X, RANCH, CAMP } from './world.js';
import * as T from './textures.js';
import { makeCharacter, randomTownsfolk, animatePerson, seat, gesture, CAST, HIP } from './characters.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const C = (h, s, l) => new THREE.Color().setHSL(h / 360, s / 100, l / 100, THREE.SRGBColorSpace);
const R = Math.random;
const pick = (a) => a[Math.floor(R() * a.length)];
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

const mats = new Map();
function mat(hsl) {
  const k = hsl.join();
  if (!mats.has(k)) mats.set(k, new THREE.MeshLambertMaterial({ color: C(...hsl) }));
  return mats.get(k);
}
function part(geo, m, x, y, z, parent) {
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function joint(parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  return g;
}

const COAT = [[20, 55, 32], [25, 35, 18], [30, 10, 72], [35, 45, 48], [0, 0, 14]];

// ---------- models (all face +z) ----------
// People are the cartoon cast (characters.js): townsfolk are re-dressed copies of its roles.
export { animatePerson, seat, stand } from './characters.js';
export function makePerson(outfit = randomTownsfolk()) {
  return makeCharacter(outfit);
}

function makeHorse(saddled) {
  const g = new THREE.Group(), coatHsl = pick(COAT), coat = mat(coatHsl), dark = mat([coatHsl[0], coatHsl[1], Math.max(8, coatHsl[2] - 14)]);
  const body = joint(g, 0, 0, 0);
  part(new THREE.BoxGeometry(0.55, 0.62, 1.55), coat, 0, 1.38, 0, body);
  part(new THREE.SphereGeometry(0.33, 10, 8), coat, 0, 1.4, 0.66, body).scale.set(0.85, 1, 0.9);
  part(new THREE.SphereGeometry(0.33, 10, 8), coat, 0, 1.42, -0.66, body).scale.set(0.9, 1, 0.9);
  const neck = joint(body, 0, 1.58, 0.75);
  neck.rotation.x = 0.6;
  part(new THREE.BoxGeometry(0.26, 0.85, 0.32), coat, 0, 0.42, 0, neck);
  part(new THREE.BoxGeometry(0.06, 0.8, 0.1), dark, 0, 0.42, -0.17, neck);
  part(new THREE.BoxGeometry(0.22, 0.24, 0.55), coat, 0, 0.83, 0.22, neck).rotation.x = 0.1;
  for (const s of [-1, 1]) part(new THREE.BoxGeometry(0.05, 0.12, 0.05), dark, s * 0.07, 0.98, 0.04, neck);
  const tail = joint(body, 0, 1.55, -0.82);
  tail.rotation.x = 0.4;
  part(new THREE.BoxGeometry(0.1, 0.7, 0.12), dark, 0, -0.35, 0, tail);
  const legs = [[-0.17, 0.6], [0.17, 0.6], [-0.17, -0.6], [0.17, -0.6]].map(([x, z]) => {
    const j = joint(g, x, 1.12, z);
    part(new THREE.BoxGeometry(0.13, 1.0, 0.15), coat, 0, -0.5, 0, j);
    part(new THREE.BoxGeometry(0.15, 0.1, 0.17), mat([25, 15, 12]), 0, -1.04, 0, j);
    return j;
  });
  if (saddled) {
    part(new THREE.BoxGeometry(0.62, 0.04, 0.7), mat(pick([[0, 50, 35], [210, 40, 35], [40, 50, 45]])), 0, 1.7, 0.05, body);
    part(new THREE.BoxGeometry(0.5, 0.12, 0.55), mat([25, 45, 25]), 0, 1.76, 0.05, body);
  }
  return { g, legs, neck, tail, body };
}
export function animateHorse(h, phase, amt) {
  const s = Math.sin(phase) * 0.5 * amt;
  h.legs[0].rotation.x = h.legs[3].rotation.x = s;
  h.legs[1].rotation.x = h.legs[2].rotation.x = -s;
  h.body.position.y = Math.abs(Math.cos(phase)) * 0.05 * amt;
  h.neck.rotation.x = 0.6 + Math.sin(phase * 2) * 0.05 * amt;
  h.tail.rotation.x = 0.4 + Math.sin(phase) * 0.12;
}

function makeRider() {
  const horse = makeHorse(true), rider = makePerson(randomTownsfolk(pick(['cowboy', 'cowboy', 'rancher', 'prospector', 'gambler'])));
  seat(rider, true);
  rider.g.position.set(0, 0.85, 0.05);
  horse.body.add(rider.g);
  return { g: horse.g, horse, rider, wheels: [], horses: [horse] };
}

function makeCoach() {
  const g = new THREE.Group(), red = mat([0, 55, 30]), gold = mat([42, 70, 55]), wood = mat([25, 25, 16]), glass = mat([210, 20, 12]);
  const box = joint(g, 0, 0, 0);
  part(new THREE.BoxGeometry(1.5, 1.3, 2.4), red, 0, 1.75, -0.3, box);
  part(new THREE.BoxGeometry(1.52, 0.5, 1.4), glass, 0, 1.95, -0.3, box);
  for (const y of [1.12, 2.42]) part(new THREE.BoxGeometry(1.56, 0.08, 2.46), gold, 0, y, -0.3, box);
  part(new THREE.BoxGeometry(1.3, 0.25, 1.8), wood, 0, 2.58, -0.4, box);
  part(new THREE.BoxGeometry(1.3, 0.15, 0.6), wood, 0, 2.1, 1.2, box);
  part(new THREE.BoxGeometry(1.3, 0.08, 0.5), wood, 0, 1.4, 1.5, box);
  part(new THREE.BoxGeometry(0.08, 0.08, 2.4), wood, 0, 0.75, 2.4, g);
  const wheels = [];
  for (const [z, r] of [[-1.15, 0.62], [0.9, 0.48]]) {
    for (const sx of [-1, 1]) {
      const w = joint(g, sx * 0.85, r, z);
      part(new THREE.TorusGeometry(r, 0.05, 6, 18), wood, 0, 0, 0, w).rotation.y = Math.PI / 2;
      for (let k = 0; k < 4; k++) part(new THREE.BoxGeometry(0.04, r * 2, 0.04), wood, 0, 0, 0, w).rotation.x = (k * Math.PI) / 4;
      wheels.push({ w, r });
    }
  }
  const horses = [-0.45, 0.45].map((x) => {
    const h = makeHorse(false);
    h.g.position.set(x, 0, 3.7);
    h.g.scale.setScalar(0.95);
    g.add(h.g);
    return h;
  });
  const driver = makePerson(randomTownsfolk(pick(['rancher', 'prospector'])));
  seat(driver);
  driver.g.position.set(0, 1.25, 1.25);
  box.add(driver.g);
  return { g, wheels, horses, driver };
}

// ---------- the train: locomotive, tender and three coaches (all face +z) ----------
function wheelSet(g, list, z, r, colour) {
  for (const sx of [-1, 1]) {
    const w = joint(g, sx * 0.85, r, z);
    part(new THREE.CylinderGeometry(r, r, 0.12, 14), colour, 0, 0, 0, w).rotation.z = Math.PI / 2;
    part(new THREE.BoxGeometry(0.14, r * 1.8, 0.08), mat([0, 0, 10]), 0, 0, 0, w);
    list.push({ w, r });
  }
}
function makeLoco() {
  const g = new THREE.Group(), black = mat([0, 0, 12]), red = mat([0, 60, 32]), brass = mat([42, 70, 55]), wheels = [];
  part(new THREE.BoxGeometry(1.6, 0.35, 7.2), black, 0, 0.85, 0.2, g);
  part(new THREE.CylinderGeometry(0.75, 0.75, 4.4, 16), black, 0, 1.95, 0.9, g).rotation.x = Math.PI / 2;
  part(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16), mat([0, 0, 20]), 0, 1.95, 3.1, g).rotation.x = Math.PI / 2;
  part(new THREE.CylinderGeometry(0.42, 0.22, 1.3, 10), black, 0, 3.2, 2.6, g);
  part(new THREE.SphereGeometry(0.35, 10, 8), brass, 0, 2.75, 0.8, g);
  part(new THREE.BoxGeometry(0.4, 0.45, 0.4), brass, 0, 2.95, 3.3, g);
  part(new THREE.BoxGeometry(2.3, 2.2, 2.0), red, 0, 2.35, -2.2, g);
  part(new THREE.BoxGeometry(2.6, 0.12, 2.4), black, 0, 3.5, -2.2, g);
  part(new THREE.ConeGeometry(0.9, 1.1, 4), red, 0, 0.6, 4.1, g).rotation.x = Math.PI / 2;
  for (const z of [-0.7, 0.9]) wheelSet(g, wheels, z, 0.75, red);
  wheelSet(g, wheels, 2.7, 0.4, red);
  wheelSet(g, wheels, -2.4, 0.45, red);
  return { g, wheels };
}
function makeTender() {
  const g = new THREE.Group(), wheels = [];
  part(new THREE.BoxGeometry(2.3, 1.5, 3.6), mat([0, 0, 14]), 0, 1.7, 0, g);
  part(new THREE.BoxGeometry(2.0, 0.3, 3.0), mat([0, 0, 6]), 0, 2.5, 0, g);
  for (const z of [-1.1, 1.1]) wheelSet(g, wheels, z, 0.45, mat([0, 60, 32]));
  return { g, wheels };
}
function makeCoachCar(colour) {
  const g = new THREE.Group(), wheels = [];
  part(new THREE.BoxGeometry(2.7, 2.4, 9), mat(colour), 0, 2.2, 0, g);
  part(new THREE.BoxGeometry(2.72, 0.6, 7.8), mat([35, 30, 20]), 0, 2.5, 0, g);
  part(new THREE.BoxGeometry(2.9, 0.18, 9.4), mat([0, 0, 12]), 0, 3.5, 0, g);
  part(new THREE.BoxGeometry(2.0, 0.12, 9.6), mat([42, 60, 50]), 0, 1.05, 0, g);
  for (const z of [-4.1, -2.7, 2.7, 4.1]) wheelSet(g, wheels, z, 0.45, mat([0, 0, 15]));
  return { g, wheels };
}

// Comes in from the south (then from the north), slows into the station, waits, steams away,
// stays out of sight for a while and returns the other way.
class Train {
  constructor(root, world) {
    this.world = world;
    this.cars = [
      { ...makeLoco(), off: 0 }, { ...makeTender(), off: 5.4 },
      { ...makeCoachCar([150, 30, 28]), off: 11.4 }, { ...makeCoachCar([0, 45, 32]), off: 21.4 }, { ...makeCoachCar([150, 30, 28]), off: 31.4 },
    ];
    for (const c of this.cars) root.add(c.g);
    this.steam = { type: 'smoke', pos: V(), rate: 0, acc: 0, life: 6, s0: 1, s1: 6, alpha: 0.35, rise: 2 };
    world.emitters.push(this.steam);
    this.dir = 1;
    this.s = -400;
    this.v = 11;
    this.state = 'run';
    this.stopped = false;
    this.timer = 0;
    this.update(0);
  }
  get stopZ() {
    return this.dir > 0 ? 28 : -8; // the coaches line up along the platform
  }
  // Put the train ~12 s from pulling into the station.
  call() {
    this.state = 'run';
    this.stopped = false;
    this.v = 11;
    this.s = this.stopZ - this.dir * 190;
  }
  update(dt) {
    const maxV = 11, acc = 0.9;
    if (this.state === 'run') {
      const d = (this.stopZ - this.s) * this.dir;
      const want = this.stopped ? maxV : Math.min(maxV, Math.sqrt(2 * acc * Math.max(d, 0)));
      this.v += Math.sign(want - this.v) * Math.min(Math.abs(want - this.v), acc * 1.5 * dt);
      this.s += this.v * this.dir * dt;
      if (!this.stopped && d < 0.3) {
        this.v = 0;
        this.state = 'stopped';
        this.stopped = true;
        this.timer = 18;
      }
      if (this.s * this.dir > 420) {
        this.state = 'away';
        this.timer = 35;
      }
    } else if (this.state === 'stopped') {
      if ((this.timer -= dt) <= 0) this.state = 'run';
    } else if ((this.timer -= dt) <= 0) {
      this.dir = -this.dir;
      this.s = -this.dir * 420;
      this.v = maxV;
      this.stopped = false;
      this.state = 'run';
    }
    const visible = this.state !== 'away';
    for (const c of this.cars) {
      c.g.visible = visible;
      c.g.position.set(RAIL_X, 0.51, this.s - this.dir * c.off);
      c.g.rotation.y = this.dir > 0 ? 0 : Math.PI;
      for (const { w, r } of c.wheels) w.rotation.x += (this.v * dt) / r;
    }
    this.steam.pos.set(RAIL_X, 4.4, this.s + this.dir * 2.6);
    this.steam.rate = !visible ? 0 : this.state === 'stopped' ? 1.5 : 4 + this.v * 0.5;
  }
  remove(root) {
    for (const c of this.cars) root.remove(c.g);
    this.world.emitters = this.world.emitters.filter((e) => e !== this.steam);
  }
}

// Horses grazing loose in a paddock: heads down, tails swishing, now and then a few steps.
// A tethered one stays put (the player's horse at the saloon rail). While someone rides it,
// the game moves it instead (ridden = true).
export class Grazer {
  constructor(home, radius, { saddled = false, tethered = false, yaw = R() * 6.28 } = {}) {
    this.h = makeHorse(saddled);
    this.home = home;
    this.radius = radius;
    this.tethered = tethered;
    this.ridden = false;
    this.pos = tethered ? home.clone() : V(home.x + (R() - 0.5) * radius, 0, home.z + (R() - 0.5) * radius);
    this.yaw = yaw;
    this.target = null;
    this.timer = 3 + R() * 10;
    this.phase = R() * 6;
    this.ph = R() * 6;
  }
  // the horse is free again where it now stands
  release() {
    this.ridden = false;
    this.home = this.pos.clone();
    this.target = null;
    this.timer = 4 + R() * 6;
  }
  update(dt, t) {
    if (this.ridden) return;
    if (this.target) {
      const dx = this.target.x - this.pos.x, dz = this.target.z - this.pos.z, d = Math.hypot(dx, dz);
      this.yaw += wrapAngle(Math.atan2(dx, dz) - this.yaw) * Math.min(1, dt * 2);
      if (d < 0.3) {
        this.target = null;
        this.timer = 6 + R() * 12;
      } else {
        this.pos.x += Math.sin(this.yaw) * 0.8 * dt;
        this.pos.z += Math.cos(this.yaw) * 0.8 * dt;
        this.phase += dt * 3;
      }
      animateHorse(this.h, this.phase, 0.6);
    } else {
      animateHorse(this.h, this.phase, 0);
      this.h.neck.rotation.x = 1.85 + Math.sin(t * 0.8 + this.ph) * 0.06;
      this.h.tail.rotation.x = 0.4 + Math.sin(t * 2.3 + this.ph) * 0.25;
      if ((this.timer -= dt) <= 0 && !this.tethered) {
        const a = R() * 6.28, r = R() * this.radius;
        this.target = V(this.home.x + Math.cos(a) * r, 0, this.home.z + Math.sin(a) * r);
      }
    }
    this.h.g.position.set(this.pos.x, this.fixedY ?? terrainHeight(this.pos.x, this.pos.z), this.pos.z);
    this.h.g.rotation.y = this.yaw;
  }
}

function makeChicken() {
  const g = new THREE.Group(), feathers = mat(pick([[0, 0, 95], [25, 55, 40], [30, 30, 20], [38, 50, 62]]));
  part(new THREE.SphereGeometry(0.16, 8, 6), feathers, 0, 0.28, 0, g).scale.set(0.9, 0.85, 1.2);
  part(new THREE.BoxGeometry(0.1, 0.14, 0.08), feathers, 0, 0.38, -0.17, g).rotation.x = -0.5;
  const head = joint(g, 0, 0.42, 0.13);
  part(new THREE.SphereGeometry(0.075, 8, 6), feathers, 0, 0, 0, head);
  part(new THREE.ConeGeometry(0.025, 0.07, 4), mat([45, 85, 55]), 0, -0.01, 0.09, head).rotation.x = Math.PI / 2;
  part(new THREE.BoxGeometry(0.02, 0.06, 0.07), mat([0, 75, 45]), 0, 0.07, 0, head);
  for (const s of [-1, 1]) part(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 4), mat([45, 85, 55]), s * 0.05, 0.08, 0, g);
  return { g, head };
}

function tumbleweedGeometry() {
  const parts = [];
  for (let i = 0; i < 8; i++) {
    const t = new THREE.TorusGeometry(0.38, 0.018, 3, 14);
    t.rotateX(R() * 3);
    t.rotateY(R() * 3);
    parts.push(t);
  }
  return mergeGeometries(parts);
}

// ---------- behaviours ----------
// People pick a nearby door, bench or spot in the street, walk there, linger, and move on.
function pointsOfInterest() {
  const pts = [];
  for (const [list, side] of [[LEFT, -1], [RIGHT, 1]]) {
    for (const s of list) {
      pts.push(V(side * 6.4, 0, s.z));
      pts.push(V(side * 6.6, 0, s.z - s.w * 0.3), V(side * 6.6, 0, s.z + s.w * 0.3));
    }
  }
  for (let i = 0; i < 16; i++) pts.push(V((R() - 0.5) * 8, 0, -45 + R() * 95));
  pts.push(V(0.5, 0, -58), V(-1, 0, -57));
  return pts;
}

// A townsperson. state: 'wait' (standing, glancing about), 'walk' (to a spot), 'toSeat' → 'sitDown'
// → 'sit' → 'getUp' (a bench), 'toChat' → 'chat' (with a partner, taking turns to talk).
// gesture: a one-off wave or hat tip, laid over whatever they are doing.
class Walker {
  constructor(person, pois, world) {
    this.p = person;
    this.pois = pois;
    this.world = world;
    const dry = pois.filter(q => !world.inPond(q.x,q.z,0.8));
    const start = pick(dry.length ? dry : pois);
    this.pos = V(start.x + (R() - 0.5), 0, start.z + (R() - 0.5));
    this.y = walkHeight(this.pos.x, this.pos.z);
    this.state = 'wait';
    this.target = null;
    this.wait = R() * 5;
    this.speed = 1.0 + R() * 0.5;
    this.yaw = R() * 6.28;
    this.phase = R() * 6;
    this.walk = 0;
    this.seat = null;
    this.chat = null; // { a, b, until, seed } shared by both
    this.gesture = null; // { kind, t, dur, delay }
    this.greetCool = R() * 8;
    this.lookAt = null; // a position to turn the head towards
  }
  get free() {
    return this.state === 'wait' && !this.chat;
  }
  // a hat tip from men in hats, a wave from everyone else
  greet(other, delay = 0) {
    if (this.gesture || this.greetCool > 0) return;
    this.gesture = { kind: this.p.hat && !this.p.outfit.female && R() < 0.8 ? 'tip' : 'wave', t: 0, dur: 2.1, delay };
    this.greetCool = 18 + R() * 12;
    this.lookAt = other;
  }
  choose() {
    // now and then, go and sit on a free bench nearby
    if (R() < 0.3) {
      const seats = this.world.benches.filter((s) => !s.who && !this.world.inPond(s.x,s.z,0.8) && Math.hypot(s.x - this.pos.x, s.z - this.pos.z) < 35);
      if (seats.length) {
        const s = pick(seats);
        s.who = this;
        this.seat = s;
        this.state = 'toSeat';
        this.target = V(s.x + Math.sin(s.yaw) * 0.55, 0, s.z + Math.cos(s.yaw) * 0.55);
        return;
      }
    }
    const dry = this.pois.filter(q => !this.world.inPond(q.x,q.z,0.8));
    const near = dry.filter((q) => q.distanceTo(this.pos) < 28 && q.distanceTo(this.pos) > 2);
    const q = pick(near.length && R() < 0.75 ? near : dry.length ? dry : [this.pos]);
    this.target = V(q.x + (R() - 0.5) * 0.8, 0, q.z + (R() - 0.5) * 0.8);
    this.state = 'walk';
  }
  // walk towards this.target; true on arrival
  _go(dt) {
    const dx = this.target.x - this.pos.x, dz = this.target.z - this.pos.z, d = Math.hypot(dx, dz);
    if (d < 0.35 || this.world.inPond(this.target.x,this.target.z,0.5)) return true;
    const diff = wrapAngle(Math.atan2(dx, dz) - this.yaw);
    this.yaw += Math.sign(diff) * Math.min(Math.abs(diff), dt * 5);
    const v = Math.min(d, this.speed * dt * (Math.abs(diff) < 1 ? 1 : 0.3));
    const nx=this.pos.x+Math.sin(this.yaw)*v,nz=this.pos.z+Math.cos(this.yaw)*v;
    let best=this.world.inPond(nx,nz,0.45)?null:{x:nx,z:nz,yaw:this.yaw},score=Infinity;
    if(!best) for(const turn of [0.65,-0.65,1.3,-1.3,1.75,-1.75,2.2,-2.2]) {
      const yaw=this.yaw+turn,x=this.pos.x+Math.sin(yaw)*v,z=this.pos.z+Math.cos(yaw)*v;
      if(this.world.inPond(x,z,0.45))continue;
      const cost=Math.hypot(this.target.x-x,this.target.z-z)+Math.abs(turn)*0.01;
      if(cost<score){score=cost;best={x,z,yaw};}
    }
    if(best){this.pos.x=best.x;this.pos.z=best.z;this.yaw=best.yaw;}
    else {this.state='wait';this.wait=1;this.target=null;}
    this.walk = Math.min(1, this.walk + dt * 3);
    return false;
  }
  _turnTo(yaw, dt) {
    const diff = wrapAngle(yaw - this.yaw);
    this.yaw += Math.sign(diff) * Math.min(Math.abs(diff), dt * 3);
  }
  leaveSeat() {
    if (this.seat) this.seat.who = null;
    this.seat = null;
  }
  endChat() {
    const c = this.chat;
    if (!c) return;
    for (const w of [c.a, c.b]) {
      w.chat = null;
      w.state = 'wait';
      w.wait = 0.5 + R() * 2;
    }
  }
  update(dt, t) {
    const p = this.p, s = this.state;
    this.greetCool -= dt;
    let sitK = 0, y = walkHeight(this.pos.x, this.pos.z);
    if (s === 'wait') {
      this.wait -= dt;
      if (this.wait <= 0) this.choose();
    } else if (s === 'walk') {
      if (this._go(dt)) {
        this.state = 'wait';
        this.wait = 2 + R() * 9;
      }
    } else if (s === 'toSeat') {
      if (this._go(dt)) {
        this.state = 'sitDown';
        this.k = 0;
        this.from = this.pos.clone();
        this.sitFor = 20 + R() * 40;
      }
    } else if (s === 'sitDown' || s === 'getUp' || s === 'sit') {
      const st = this.seat, front = V(st.x + Math.sin(st.yaw) * 0.55, 0, st.z + Math.cos(st.yaw) * 0.55);
      if (s === 'sitDown') this.k = Math.min(1, this.k + dt / 0.8);
      else if (s === 'getUp') this.k = Math.max(0, this.k - dt / 0.8);
      else if ((this.sitFor -= dt) <= 0) this.state = 'getUp';
      if (s === 'sitDown' && this.k >= 1) this.state = 'sit';
      this._turnTo(st.yaw, dt * 2);
      const k = this.k * this.k * (3 - 2 * this.k);
      this.pos.set(front.x + (st.x - front.x) * k, 0, front.z + (st.z - front.z) * k);
      sitK = k;
      const hip = (HIP - 0.07) * (p.outfit.scale || 1); // feet below the seat
      y = walkHeight(front.x, front.z) + (st.y - hip - walkHeight(front.x, front.z)) * k;
      if (s === 'getUp' && this.k <= 0) {
        this.leaveSeat();
        this.state = 'wait';
        this.wait = 0.3;
      }
    } else if (s === 'toChat') {
      if (this._go(dt)) this.state = 'chat';
    } else if (s === 'chat') {
      const c = this.chat, other = c.a === this ? c.b : c.a;
      this._turnTo(Math.atan2(other.pos.x - this.pos.x, other.pos.z - this.pos.z), dt);
      if (t > c.until) this.endChat();
    }
    if (this.state !== 'walk' && this.state !== 'toSeat' && this.state !== 'toChat') this.walk = Math.max(0, this.walk - dt * 3);

    // the pose: walking (or standing), or sitting; then any gesture on top
    if (sitK > 0) seat(p, false, sitK);
    else {
      this.phase += dt * this.speed * 5.2 * this.walk;
      animatePerson(p, this.phase, this.walk);
    }
    p.headPitch = 0;
    p.lookAround = 1;
    if (this.chat && this.state === 'chat') {
      const c = this.chat, both = c.a.state === 'chat' && c.b.state === 'chat';
      const speaker = Math.floor(t / 3.6 + c.seed) % 2 === 0 ? c.a : c.b;
      p.lookAround = 0.15;
      if (both) gesture(p, speaker === this ? 'talk' : 'listen', 0, t + this.p.lookOff);
    } else if (this.state === 'sit') {
      // chatting with whoever sits on the same bench
      p.headYaw = 0;
      const benches = this.world.benches, me = benches.indexOf(this.seat);
      const mate = benches.find((q) => q !== this.seat && q.who && q.who.state === 'sit' && Math.hypot(q.x - this.seat.x, q.z - this.seat.z) < 1);
      if (mate) {
        p.lookAround = 0.1;
        p.headYaw = 0.8 * Math.sign(wrapAngle(Math.atan2(mate.x - this.pos.x, mate.z - this.pos.z) - this.yaw));
        const talker = (Math.floor(t / 4.3) + me) % 2 === 0; // the two seats of a bench take turns
        gesture(p, talker ? 'talk' : 'listen', 0, t + this.p.lookOff);
      }
    }
    const g = this.gesture;
    if (g) {
      if (g.delay > 0) g.delay -= dt;
      else {
        g.t += dt;
        gesture(p, g.kind, Math.min(1, g.t / g.dur), t);
        if (g.t >= g.dur) {
          this.gesture = null;
          this.lookAt = null;
        }
      }
    }
    if (this.lookAt) {
      const a = wrapAngle(Math.atan2(this.lookAt.x - this.pos.x, this.lookAt.z - this.pos.z) - this.yaw);
      p.headYaw = Math.max(-1.1, Math.min(1.1, a));
      p.lookAround = 0;
    }

    this.y += (y - this.y) * Math.min(1, dt * 12);
    p.g.position.set(this.pos.x, this.y, this.pos.z);
    p.g.rotation.y = this.yaw;
  }
}

// One closed loop: down the road into town on the right, round in front of the church,
// back out the other side and far into the hills (out of sight) to turn round.
function roadLoop() {
  const pts = [];
  for (let z = 330; z >= 70; z -= 26) pts.push(V(roadX(z) + 2.4, 0, z));
  pts.push(V(2.4, 0, 40), V(2.4, 0, 0), V(2.4, 0, -35), V(2.7, 0, -46), V(0, 0, -52), V(-2.7, 0, -46), V(-2.4, 0, -35), V(-2.4, 0, 0), V(-2.4, 0, 40));
  for (let z = 70; z <= 330; z += 26) pts.push(V(roadX(z) - 2.4, 0, z));
  return new THREE.CatmullRomCurve3(pts, true, 'centripetal');
}

class RoadTraveller {
  constructor(model, curve, u0, speed, world) {
    this.m = model;
    this.curve = curve;
    this.len = curve.getLength();
    this.u = u0;
    this.speed = speed;
    this.phase = R() * 6;
    this.yaw = 0;
    this.p = V();
    this.t = V();
    this.dust = { type: 'smoke', pos: V(), rate: 0, acc: 0, life: 2, s0: 0.4, s1: 2.2, alpha: 0.16, rise: 0.25 };
    world.emitters.push(this.dust);
    this.update(0, true);
  }
  update(dt, snap = false) {
    this.u = (this.u + (this.speed * dt) / this.len) % 1;
    this.curve.getPointAt(this.u, this.p);
    this.curve.getTangentAt(this.u, this.t);
    const target = Math.atan2(this.t.x, this.t.z);
    this.yaw = snap ? target : this.yaw + wrapAngle(target - this.yaw) * Math.min(1, dt * 6);
    this.m.g.position.set(this.p.x, terrainHeight(this.p.x, this.p.z) + 0.05, this.p.z);
    this.m.g.rotation.y = this.yaw;
    this.phase += dt * this.speed * 2.6;
    for (const h of this.m.horses) animateHorse(h, this.phase, 1);
    for (const { w, r } of this.m.wheels) w.rotation.x += (this.speed * dt) / r;
    this.dust.pos.set(this.p.x - Math.sin(this.yaw) * 0.8, this.m.g.position.y + 0.1, this.p.z - Math.cos(this.yaw) * 0.8);
    this.dust.rate = Math.abs(this.p.z) < 140 ? 3.5 : 0;
  }
}

// ---------- the town's life ----------
const BLADES = {
  GUNSMITH: 'GUNS', BARBER: 'SHAVE & BATH', DOCTOR: 'DOCTOR', HOTEL: 'ROOMS', SHERIFF: 'JAIL',
  'DUSTY HOLLOW MERCANTILE': 'GOODS', 'THE GOLDEN SPUR SALOON': 'SALOON', 'POST OFFICE': 'MAIL',
};

export class Life {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.settings = { people: 10, riders: 2, coach: 1, train: 1, chickens: 1, tumbleweeds: 1, wind: 1, hamlet: 1 };
    this.root = new THREE.Group();
    scene.add(this.root);
    // places to stroll to (not right where a bench stands)
    this.pois = pointsOfInterest().filter((q) => !world.benches.some((s) => Math.hypot(s.x - q.x, s.z - q.z) < 1.4));
    const townPOIs = [...this.pois];
    world.onBuildingsChanged = () => {
      this.pois.splice(0, this.pois.length, ...townPOIs, ...world.buildingPOIs);
      for (const w of this.walkers || []) if (w.state === 'walk') { w.target = null; w.state = 'wait'; w.wait = 0; }
    };
    world.onBuildingsChanged();
    this.loop = roadLoop();
    this.walkers = [];
    this.hamletWalkers = Array.from({ length: 6 }, () => new Walker(makePerson(), world.hamlet.pois, world));
    for (const w of this.hamletWalkers) this.root.add(w.p.g);
    this.riders = [];
    this.coach = null;
    this.train = null;
    // your own saddled horse waits at the saloon's hitching rail
    this.myHorse = new Grazer(V(2.3, 0, 8), 0, { saddled: true, tethered: true, yaw: Math.PI / 2 });
    this.grazers = [
      this.myHorse,
      ...[0, 1, 2, 3].map(() => new Grazer(V(RANCH.x + 12, 0, RANCH.z + 4), 6)),
      ...[0, 1].map(() => new Grazer(V(CAMP.x - 9, 0, CAMP.z - 6), 2.5)),
    ];
    for (const g of this.grazers) this.root.add(g.h.g);
    this._signs();
    this._flag();
    this._chickens();
    this._tumbleweeds();
    this._camRight = V();
    this.apply();
  }

  apply() {
    const s = this.settings;
    this.world.wind = s.wind;
    this.world.setHamlet(!!s.hamlet);
    for (const w of this.hamletWalkers) {
      w.p.g.visible = !!s.hamlet;
      if (!s.hamlet) { w.leaveSeat(); w.endChat(); w.state = 'wait'; w.wait = 0; }
    }
    while (this.walkers.length < s.people) {
      const w = new Walker(makePerson(), this.pois, this.world);
      this.root.add(w.p.g);
      this.walkers.push(w);
    }
    while (this.walkers.length > s.people) {
      const w = this.walkers.pop();
      w.leaveSeat();
      w.endChat();
      this.root.remove(w.p.g);
    }
    if (this.riders.length !== s.riders) {
      while (this.riders.length < s.riders) {
        const r = new RoadTraveller(makeRider(), this.loop, 0, 3.6, this.world);
        this.root.add(r.m.g);
        this.riders.push(r);
      }
      while (this.riders.length > s.riders) this._removeTraveller(this.riders.pop());
      // spread riders evenly round the loop; everyone moves at the same pace so they never bunch up
      this.riders.forEach((r, i) => { r.u = (0.12 + i / this.riders.length) % 1; r.update(0, true); });
    }
    if (s.coach && !this.coach) {
      this.coach = new RoadTraveller(makeCoach(), this.loop, 0.3, 3.6, this.world);
      this.root.add(this.coach.m.g);
    } else if (!s.coach && this.coach) {
      this._removeTraveller(this.coach);
      this.coach = null;
    }
    if (s.train && !this.train) this.train = new Train(this.root, this.world);
    else if (!s.train && this.train) {
      this.train.remove(this.root);
      this.train = null;
    }
    this.chickenGroup.visible = !!s.chickens;
    this.tumbleGroup.visible = !!s.tumbleweeds;
  }

  // People meeting people: two folk standing about near each other may walk up and chat, and
  // anyone passing someone (or you, in play mode) greets them with a wave or a tip of the hat.
  _socialise(dt, t) {
    const ws = this.walkers;
    if ((this.socialTimer = (this.socialTimer || 0) - dt) <= 0) {
      this.socialTimer = 0.5;
      for (const a of ws) {
        if (!a.free || a.wait < 3 || R() > 0.35) continue;
        const b = ws.find((o) => o !== a && o.free && o.wait > 2 && Math.abs(o.y - a.y) < 0.2 && o.pos.distanceTo(a.pos) < 8);
        if (!b) continue;
        // meet halfway, a little over a metre apart
        const mid = a.pos.clone().add(b.pos).multiplyScalar(0.5), dir = b.pos.clone().sub(a.pos).setY(0).normalize().multiplyScalar(0.55);
        a.chat = b.chat = { a, b, until: t + 14 + R() * 20, seed: R() < 0.5 ? 0 : 1 };
        a.target = mid.clone().sub(dir);
        b.target = mid.clone().add(dir);
        a.state = b.state = 'toChat';
        b.greet(a.pos, 0.2);
      }
    }
    // greetings: walking past each other, or past someone on a bench
    for (let i = 0; i < ws.length; i++) {
      const a = ws[i];
      if (a.greetCool > 0 || a.gesture) continue;
      if (this.player && a.pos.distanceTo(this.player) < 4 && Math.abs(a.y - this.player.y) < 1) {
        a.greet(this.player);
        continue;
      }
      if (a.state !== 'walk') continue;
      for (const b of ws) {
        if (b === a || b.greetCool > 0 || b.gesture || (b.state !== 'walk' && b.state !== 'sit' && b.state !== 'wait')) continue;
        const d = a.pos.distanceTo(b.pos);
        if (d > 3.8 || d < 0.6) continue;
        const ahead = Math.sin(a.yaw) * (b.pos.x - a.pos.x) + Math.cos(a.yaw) * (b.pos.z - a.pos.z);
        if (ahead < d * 0.5) continue; // only someone in front of you
        a.greet(b.pos);
        b.greet(a.pos, 0.5);
        break;
      }
    }
  }

  // Every role of the cast standing in a row across the street, for a look at them.
  showCast(on) {
    if (on && !this.cast) {
      this.cast = new THREE.Group();
      Object.keys(CAST).forEach((role, i, all) => {
        const p = makeCharacter(CAST[role]), x = (i - (all.length - 1) / 2) * 0.7;
        p.g.position.set(x, walkHeight(x, 24), 24);
        p.lookOff = i * 1.7;
        this.cast.add(p.g);
      });
      this.root.add(this.cast);
    }
    if (this.cast) this.cast.visible = on;
  }

  _removeTraveller(t) {
    this.root.remove(t.m.g);
    this.world.emitters = this.world.emitters.filter((e) => e !== t.dust);
  }

  _signs() {
    this.signs = [];
    for (const [list, x, rot] of [[LEFT, -7.5, Math.PI / 2], [RIGHT, 7.5, -Math.PI / 2]]) {
      for (const s of list) {
        const text = BLADES[s.sign];
        if (!text) continue;
        const frame = new THREE.Object3D();
        frame.position.set(x, 0, s.z);
        frame.rotation.y = rot;
        const pivot = joint(frame, s.w / 2 - 0.9, s.balcony ? 3.55 : 3.22, 2.15);
        const wood = mat([25, 30, 20]);
        for (const z of [-0.4, 0.4]) part(new THREE.BoxGeometry(0.02, 0.3, 0.02), mat([0, 0, 18]), 0, -0.15, z, pivot);
        part(new THREE.BoxGeometry(0.03, 0.5, 1.12), wood, 0, -0.55, 0, pivot);
        const tex = T.signTexture(text, 360, 156, s.signBg, s.signInk);
        for (const side of [1, -1]) {
          const p = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.48), new THREE.MeshLambertMaterial({ map: tex }));
          p.position.set(side * 0.017, -0.55, 0);
          p.rotation.y = (side * Math.PI) / 2;
          pivot.add(p);
        }
        this.root.add(frame);
        this.signs.push({ pivot, ph: R() * 6, originalText: text, text, normalTex: tex, signBg: s.signBg, signInk: s.signInk });
      }
    }
  }

  addTownCenterKids(pois) {
    this.townKids = ['#e6a8b4', '#8fc7c0'].map((shirt, i) => {
      const w = new Walker(makePerson({ ...CAST.kid, shirt, role: 'kid', skin: i ? '#c68863' : '#f1c9a5' }), pois, this.world);
      w.pos.set(i ? 3 : -3, 0, -42 + i * 5); w.speed = 0.85 + i * 0.08;
      this.root.add(w.p.g); return w;
    });
  }

  setFamilyMode(on) {
    this.familyMode = !!on;
    for (const w of this.townKids || []) {
      w.p.g.visible = !!on && this.settings.people > 0;
      if (!on) { w.leaveSeat(); w.endChat(); w.state = 'wait'; w.wait = 1; }
    }
    for (const s of this.signs) {
      s.text = familySign(s.originalText, on);
      if (s.text !== s.originalText) s.familyTex ??= T.signTexture(s.text, 360, 156, s.signBg, s.signInk);
      const map = s.text !== s.originalText ? s.familyTex : s.normalTex;
      for (const m of s.pivot.children) if (m.isMesh && m.material.map) { m.material.map = map; m.material.needsUpdate = true; }
    }
  }

  _flag() {
    const pole = new THREE.Group();
    pole.position.set(-4.45, 0, 12.4);
    part(new THREE.CylinderGeometry(0.05, 0.07, 9, 6), mat([30, 15, 70]), 0, 4.5, 0, pole);
    part(new THREE.SphereGeometry(0.1, 8, 6), mat([42, 70, 55]), 0, 9.05, 0, pole);
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 160;
    const x = c.getContext('2d');
    x.fillStyle = 'hsl(5,55%,35%)';
    x.fillRect(0, 0, 256, 160);
    x.fillStyle = 'hsl(40,45%,85%)';
    x.fillRect(0, 62, 256, 36);
    x.fillStyle = 'hsl(42,75%,55%)';
    x.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 14 : 34;
      x.lineTo(56 + Math.cos(a) * r, 80 + Math.sin(a) * r);
    }
    x.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const geo = new THREE.PlaneGeometry(2.2, 1.4, 14, 8);
    geo.translate(1.1, 0, 0);
    this.flag = { mesh: new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide })), base: geo.attributes.position.array.slice() };
    this.flag.mesh.position.set(0.06, 8.2, 0);
    this.flag.mesh.castShadow = true;
    pole.add(this.flag.mesh);
    this.root.add(pole);
  }

  _chickens() {
    this.chickenGroup = new THREE.Group();
    this.chickens = [];
    for (const [cx, cz, n] of [[30, -36, 5], [3.6, -36, 3]]) {
      for (let i = 0; i < n; i++) {
        const c = makeChicken();
        const home = V(cx, 0, cz);
        c.pos = V(cx + (R() - 0.5) * 4, 0, cz + (R() - 0.5) * 4);
        c.home = home;
        c.target = null;
        c.timer = R() * 3;
        c.yaw = R() * 6.28;
        this.chickenGroup.add(c.g);
        this.chickens.push(c);
      }
    }
    this.root.add(this.chickenGroup);
  }

  _tumbleweeds() {
    this.tumbleGroup = new THREE.Group();
    const geo = tumbleweedGeometry(), m = new THREE.MeshLambertMaterial({ color: C(35, 35, 45) });
    this.tumbles = [0, 1, 2].map((i) => {
      const mesh = new THREE.Mesh(geo, m);
      mesh.castShadow = true;
      this.tumbleGroup.add(mesh);
      return { mesh, x: -40 + i * 27, z: -40 + R() * 90, ph: R() * 6, speed: 0.7 + R() * 0.6 };
    });
    this.root.add(this.tumbleGroup);
  }

  update(dt, t, camera) {
    const wind = this.settings.wind;
    this.world.wind = wind; // painted plants sway with the same wind
    this._socialise(dt, t);
    for (const w of this.walkers) w.update(dt, t);
    for (const w of this.townKids || []) {
      w.p.g.visible = this.familyMode && this.settings.people > 0;
      if (w.p.g.visible) w.update(dt, t);
      else { w.leaveSeat(); w.endChat(); }
    }
    if (this.settings.hamlet) for (const w of this.hamletWalkers) w.update(dt, t);
    for (const r of this.riders) r.update(dt);
    if (this.coach) this.coach.update(dt);
    if (this.train) this.train.update(dt);
    for (const g of this.grazers) g.update(dt, t);

    for (const s of this.signs) s.pivot.rotation.z = (Math.sin(t * 1.4 + s.ph) * 0.1 + Math.sin(t * 2.3 + s.ph) * 0.04) * wind;

    const pos = this.flag.mesh.geometry.attributes.position, b = this.flag.base;
    for (let i = 0; i < pos.count; i++) {
      const x0 = b[i * 3], y0 = b[i * 3 + 1], k = x0 / 2.2;
      pos.setZ(i, (Math.sin(x0 * 2.6 - t * 6) * 0.16 + Math.sin(y0 * 3 + x0 * 1.3 - t * 4.3) * 0.05) * k * Math.min(wind, 1.5));
      pos.setY(i, y0 - (1 - Math.min(wind, 1)) * k * 0.5);
    }
    pos.needsUpdate = true;
    this.flag.mesh.geometry.computeVertexNormals();

    if (this.chickenGroup.visible) {
      for (const c of this.chickens) {
        c.timer -= dt;
        if (c.target) {
          const dx = c.target.x - c.pos.x, dz = c.target.z - c.pos.z, d = Math.hypot(dx, dz);
          c.yaw = Math.atan2(dx, dz);
          if (d < 0.1) c.target = null;
          else {
            c.pos.x += (dx / d) * Math.min(d, dt * 1.6);
            c.pos.z += (dz / d) * Math.min(d, dt * 1.6);
          }
          c.head.rotation.x = 0;
        } else {
          c.head.rotation.x = Math.max(0, Math.sin(t * 9 + c.home.x + c.pos.z)) * 1.1; // pecking
          if (c.timer <= 0) {
            c.timer = 1.5 + R() * 4;
            c.target = V(c.home.x + (R() - 0.5) * 6, 0, c.home.z + (R() - 0.5) * 6);
          }
        }
        const hop = c.target ? Math.abs(Math.sin(t * 14)) * 0.05 : 0;
        c.g.position.set(c.pos.x, walkHeight(c.pos.x, c.pos.z) + hop, c.pos.z);
        c.g.rotation.y = c.yaw;
      }
    }

    if (this.tumbleGroup.visible) {
      for (const w of this.tumbles) {
        w.x += wind * 3.2 * w.speed * dt;
        if (w.x > 45 || wind < 0.05) {
          if (w.x > 45) {
            w.x = -45;
            w.z = -40 + R() * 90;
          }
        }
        const bounce = Math.abs(Math.sin(t * 2.6 * w.speed + w.ph)) * 0.35 * Math.min(1, wind);
        w.mesh.position.set(w.x, walkHeight(w.x, w.z) + 0.38 + bounce, w.z + Math.sin(t * 0.7 + w.ph) * 0.6);
        w.mesh.rotation.z -= (wind * 3.2 * w.speed * dt) / 0.38;
        w.mesh.visible = wind > 0.05;
      }
    }

    // painted cut-outs that were placed with "walk around"
    this._camRight.setFromMatrixColumn(camera.matrixWorld, 0);
    for (const b of this.world.billboards) {
      const s = b.userData.wander;
      if (!s) continue;
      if (!s.home) Object.assign(s, { home: b.position.clone(), target: null, wait: R() * 3, phase: 0, dir: 1 });
      if (s.target) {
        const dx = s.target.x - b.position.x, dz = s.target.z - b.position.z, d = Math.hypot(dx, dz);
        if (d < 0.2) {
          s.target = null;
          s.wait = 1.5 + R() * 5;
        } else {
          const step = Math.min(d, dt * 0.9);
          b.position.x += (dx / d) * step;
          b.position.z += (dz / d) * step;
          s.phase += dt * 7;
          const across = dx * this._camRight.x + dz * this._camRight.z;
          if (Math.abs(across) > 0.05) s.dir = Math.sign(across);
        }
      } else if ((s.wait -= dt) <= 0) {
        s.target = V(s.home.x + (R() - 0.5) * 10, 0, s.home.z + (R() - 0.5) * 10);
      }
      b.position.y = walkHeight(b.position.x, b.position.z) + (s.target ? Math.abs(Math.sin(s.phase)) * 0.06 : 0);
      b.scale.x = s.dir;
    }
  }
}
