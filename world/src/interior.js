// Inside the Golden Spur: bar and back bar, upright piano, card tables, oil lamps, rug, pictures,
// a bartender polishing glasses, a pianist, card players, and batwing doors that swing open.
// Everything is placed in the saloon's own frame: x across the room, z from the door (0) inwards (−),
// floor top at y = 0.35.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makePerson, seat } from './life.js';
import { CAST, HIP, randomTownsfolk } from './characters.js';
import * as T from './textures.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const C = (h, s, l) => new THREE.Color().setHSL(h / 360, s / 100, l / 100, THREE.SRGBColorSpace);
const FLOOR = 0.35;

function lambert(hsl, extra = {}) {
  return new THREE.MeshLambertMaterial({ color: C(...hsl), ...extra });
}
function boxGeo(w, h, d, x, y, z) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}
function cylGeo(rt, rb, h, x, y, z, seg = 12) {
  const g = new THREE.CylinderGeometry(rt, rb, h, seg);
  g.translate(x, y, z);
  return g;
}

export class SaloonInterior {
  constructor(world) {
    const it = world.interiors.saloon;
    if (!it) return;
    this.world = world;
    this.g = it.group;
    this.people = [];
    this.doors = [];
    this.lights = [];
    this.adultProps = []; this.familyProps = [];
    const plank = world.tex.plank;
    // painted dark wood (oil / clean sets) if there is any, otherwise tinted code-made planks;
    // either way it follows the art style's texture set
    const wood = (rx, extra, fallback) => {
      const m = world.paintedMaterial('dark_wood', rx, 1, extra) || new THREE.MeshLambertMaterial({ map: plank, color: C(...fallback) });
      world.surfaces.add(m);
      return m;
    };
    this.m = {
      varnish: wood(3, {}, [18, 45, 22]),
      top: wood(4, { color: C(30, 30, 80) }, [22, 50, 32]),
      brass: lambert([42, 70, 52]),
      ivory: lambert([45, 30, 88]),
      black: lambert([0, 0, 8]),
      felt: lambert([140, 40, 22]),
      glass: lambert([35, 70, 45], { emissive: C(35, 90, 45), emissiveIntensity: 0.4 }),
      mirror: new THREE.MeshLambertMaterial({ map: T.mirrorTexture(), emissive: C(35, 30, 40), emissiveMap: T.mirrorTexture(), emissiveIntensity: 0.25 }),
      lamp: lambert([40, 60, 60], { emissive: C(36, 100, 60), emissiveIntensity: 2.4 }),
    };
    this._bar();
    this._piano();
    this._tables();
    this._lamps();
    this._decor();
    this._doors();
    this._cafeShelves();
    this.setFamilyMode(world.familyMode);
  }

  _add(geo, mat, cast = true) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = cast;
    m.receiveShadow = true;
    this.g.add(m);
    return m;
  }
  _adult(obj) { obj.userData.familyRole = 'adult'; this.adultProps.push(obj); return obj; }
  _family(obj) { obj.userData.familyRole = 'family'; this.familyProps.push(obj); return obj; }

  setFamilyMode(on) {
    this.familyMode = !!on;
    for (const obj of this.adultProps) obj.visible = !on;
    for (const obj of this.familyProps) obj.visible = !!on;
  }

  _cup(x, y, z) {
    const g = new THREE.Group();
    const geo = new THREE.LatheGeometry([[0,0],[0.055,0],[0.075,0.14],[0.061,0.14],[0.047,0.022],[0,0.022]].map(p => new THREE.Vector2(...p)), 12);
    const body = new THREE.Mesh(geo, this.m.ivory), handle = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 6, 12), this.m.ivory);
    handle.position.set(0.08, 0.08, 0); g.add(body, handle);
    const tea = new THREE.Mesh(new THREE.CircleGeometry(0.058, 12), this.m.varnish); tea.rotation.x = -Math.PI / 2; tea.position.y = 0.12; g.add(tea);
    g.position.set(x, y, z); this.g.add(g); return this._family(g);
  }

  _cafeShelves() {
    const cream = this.m.ivory, lid = this.m.brass;
    for (const y of [1.38, 2.98]) for (let z = -9.7; z < -3.1; z += 0.48) {
      if (Math.abs(z + 6.5) < 2.1 && y < 2) continue;
      this._family(this._add(cylGeo(0.085, 0.08, 0.22, 6.55, FLOOR + y + 0.11, z), cream, false));
      this._family(this._add(cylGeo(0.095, 0.095, 0.025, 6.55, FLOOR + y + 0.23, z), lid, false));
    }
    for (const z of [-4.2, -5.6, -8.4]) this._cup(4.15, FLOOR + 1.17, z);
    this._family(this._add(cylGeo(0.22, 0.22, 0.025, 4.3, FLOOR + 1.18, -7.6), cream, false));
    this._family(this._add(cylGeo(0.16, 0.16, 0.12, 4.3, FLOOR + 1.25, -7.6), this.m.top, false));
    this._family(this._add(cylGeo(0.17, 0.17, 0.04, 4.3, FLOOR + 1.33, -7.6), cream, false));
    const cherry = this._add(new THREE.SphereGeometry(0.035, 8, 6), lambert([0,65,45]), false);
    cherry.position.set(4.3, FLOOR + 1.385, -7.6); this._family(cherry);
  }

  _board(x, z) {
    const g = new THREE.Group();
    const light = [], dark = [];
    for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) {
      ((a + b) % 2 ? dark : light).push(boxGeo(0.08, 0.018, 0.08, (a - 3.5) * 0.08, 0.01, (b - 3.5) * 0.08));
    }
    g.add(new THREE.Mesh(mergeGeometries(light), this.m.ivory), new THREE.Mesh(mergeGeometries(dark), this.m.varnish));
    for (const [row, colour] of [[1, [8,65,45]], [6, [210,55,48]]]) {
      const pieces = [];
      for (let col = 0; col < 8; col++) if ((row + col) % 2) pieces.push(cylGeo(0.028, 0.028, 0.02, (col - 3.5) * 0.08, 0.035, (row - 3.5) * 0.08, 10));
      g.add(new THREE.Mesh(mergeGeometries(pieces), lambert(colour)));
    }
    g.position.set(x, FLOOR + 0.815, z); g.userData.boardGame = true; this.g.add(g); this._family(g);
    for (const d of [-0.45,0.45]) this._cup(x + d, FLOOR + 0.815, z);
  }

  // a collider in the saloon's frame
  _block(cx, cz, hx, hz) {
    this.world.colliders.rects.push(this.world._rectOf(this.g, cx, cz, hx, hz));
  }

  _bar() {
    const m = this.m;
    // counter along the right-hand wall, the back bar behind it
    this._add(boxGeo(0.7, 1.1, 7.5, 4.3, FLOOR + 0.55, -6.5), m.varnish);
    this._add(boxGeo(0.95, 0.07, 7.7, 4.3, FLOOR + 1.13, -6.5), m.top);
    this._add(new THREE.CylinderGeometry(0.04, 0.04, 7.4, 8).rotateX(Math.PI / 2).translate(3.85, FLOOR + 0.2, -6.5), m.brass); // foot rail
    this._block(4.3, -6.5, 0.5, 3.85);
    this._add(boxGeo(0.5, 2.8, 7.4, 6.85, FLOOR + 1.4, -6.5), m.varnish);
    this._add(boxGeo(0.02, 1.2, 4, 6.58, FLOOR + 2.2, -6.5), m.mirror, false);
    for (const y of [1.35, 2.95]) this._add(boxGeo(0.4, 0.05, 7.4, 6.55, FLOOR + y, -6.5), m.varnish);
    this._block(6.85, -6.5, 0.3, 3.7);
    // bottles on the shelves
    const parts = [];
    const colours = [[120, 40, 25], [30, 60, 35], [0, 0, 15], [45, 70, 50], [200, 30, 30]].map((c) => C(...c));
    for (const y of [1.38, 2.98]) {
      for (let z = -9.9; z < -3.1; z += 0.22) {
        if (Math.abs(z + 6.5) < 2.1 && y < 2) continue; // gap where the mirror is
        const h = 0.25 + Math.random() * 0.12, gg = cylGeo(0.045, 0.05, h, 6.55 + (Math.random() - 0.5) * 0.15, FLOOR + y + h / 2 + 0.025, z, 6).toNonIndexed();
        const col = colours[Math.floor(Math.random() * colours.length)], arr = new Float32Array(gg.attributes.position.count * 3);
        for (let i = 0; i < arr.length; i += 3) arr.set([col.r, col.g, col.b], i);
        gg.setAttribute('color', new THREE.BufferAttribute(arr, 3));
        parts.push(gg);
      }
    }
    this._adult(this._add(mergeGeometries(parts), new THREE.MeshLambertMaterial({ vertexColors: true, emissive: C(35, 60, 30), emissiveIntensity: 0.25 }), false));
    // glasses and a bottle on the counter
    for (const z of [-4.2, -5.6, -8.4]) this._adult(this._add(cylGeo(0.04, 0.035, 0.11, 4.15, FLOOR + 1.22, z, 8), m.glass, false));
    this._adult(this._add(cylGeo(0.05, 0.06, 0.3, 4.3, FLOOR + 1.32, -7.6, 8), lambert([120, 40, 22]), false));
    // bartender behind the counter, facing the room
    const bt = makePerson(CAST.bartender);
    bt.g.position.set(5.6, FLOOR, -5.4);
    bt.g.rotation.y = -Math.PI / 2;
    this.g.add(bt.g);
    this.people.push({ p: bt, kind: 'bartender', ph: 0 });
  }

  _piano() {
    const m = this.m;
    const px = -4.5, pz = -11.45;
    this._add(boxGeo(1.7, 1.35, 0.6, px, FLOOR + 0.675, pz), m.varnish);
    this._add(boxGeo(1.6, 0.08, 0.38, px, FLOOR + 0.78, pz + 0.45), m.ivory);
    this._add(boxGeo(1.6, 0.02, 0.1, px, FLOOR + 0.83, pz + 0.3), m.black);
    this._add(boxGeo(1.8, 0.06, 0.66, px, FLOOR + 1.38, pz), m.top);
    this._add(cylGeo(0.06, 0.06, 0.25, px - 0.5, FLOOR + 1.53, pz, 8), m.brass, false); // candlestick
    this._add(cylGeo(0.22, 0.22, 0.06, px, FLOOR + 0.5, pz + 1.1, 12), m.varnish);
    this._add(cylGeo(0.05, 0.08, 0.47, px, FLOOR + 0.24, pz + 1.1, 8), m.varnish);
    this._block(px, pz, 0.9, 0.35);
    const pianist = makePerson(CAST.pianist);
    seat(pianist);
    pianist.lookAround = 0.3;
    pianist.g.position.set(px, FLOOR + 0.53 + 0.07 - HIP, pz + 1.15);
    pianist.g.rotation.y = Math.PI;
    this.g.add(pianist.g);
    this.people.push({ p: pianist, kind: 'pianist', ph: 0 });
    // the singer leans on the piano, swaying to the tune
    const singer = makePerson(CAST.singer);
    singer.g.position.set(px + 1.25, FLOOR, pz + 0.75);
    singer.g.rotation.y = 0.5;
    this.g.add(singer.g);
    this.people.push({ p: singer, kind: 'singer', ph: 0 });
  }

  _tables() {
    const m = this.m;
    const tables = [[-2.5, -3.6, 0], [0.6, -6.6, 3], [-3.6, -7.9, 3], [1.2, -10.2, 0]];
    for (const [tx, tz, players] of tables) {
      this._add(cylGeo(0.65, 0.65, 0.06, tx, FLOOR + 0.78, tz, 18), players ? m.felt : m.top);
      this._add(cylGeo(0.08, 0.12, 0.75, tx, FLOOR + 0.38, tz, 8), m.varnish);
      this._add(cylGeo(0.35, 0.38, 0.04, tx, FLOOR + 0.02, tz, 12), m.varnish);
      this.world.colliders.circles.push(this._worldCircle(tx, tz, 0.7));
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + 0.4, cx = tx + Math.cos(a) * 0.95, cz = tz + Math.sin(a) * 0.95;
        const chair = new THREE.Group();
        chair.add(new THREE.Mesh(mergeGeometries([
          boxGeo(0.45, 0.06, 0.45, 0, 0.47, 0), boxGeo(0.45, 0.5, 0.05, 0, 0.75, -0.2),
          boxGeo(0.04, 0.47, 0.04, -0.19, 0.235, -0.19), boxGeo(0.04, 0.47, 0.04, 0.19, 0.235, -0.19),
          boxGeo(0.04, 0.47, 0.04, -0.19, 0.235, 0.19), boxGeo(0.04, 0.47, 0.04, 0.19, 0.235, 0.19),
        ]), m.varnish));
        chair.children[0].castShadow = true;
        chair.position.set(cx, FLOOR, cz);
        chair.rotation.y = Math.atan2(tx - cx, tz - cz); // seat faces the table
        this.g.add(chair);
        if (k < players) {
          const p = makePerson(randomTownsfolk(['gambler', 'cowboy', 'prospector', 'rancher', 'sheriff'][this.people.length % 5]));
          seat(p);
          p.arms.forEach((arm) => (arm.rotation.x = -1.05));
          p.g.position.set(cx, FLOOR + 0.5 + 0.07 - HIP, cz);
          p.g.rotation.y = chair.rotation.y;
          this.g.add(p.g);
          this.people.push({ p, kind: 'cards', ph: Math.random() * 6 });
        }
      }
      if (players) {
        // a scatter of cards and two glasses
        for (let k = 0; k < 6; k++) {
          const card = this._add(boxGeo(0.07, 0.005, 0.1, 0, 0, 0), m.ivory, false);
          card.position.set(tx + (Math.random() - 0.5) * 0.6, FLOOR + 0.815, tz + (Math.random() - 0.5) * 0.6);
          card.rotation.y = Math.random() * 3; this._adult(card);
        }
        for (const d of [-0.3, 0.3]) this._adult(this._add(cylGeo(0.04, 0.035, 0.11, tx + d, FLOOR + 0.87, tz + d * 0.5, 8), m.glass, false));
        this._board(tx, tz);
      }
    }
  }

  _worldCircle(x, z, r) {
    const p = this.g.localToWorld(V(x, 0, z));
    return { x: p.x, z: p.z, r };
  }

  _lamps() {
    for (const [x, z] of [[-2, -3.5], [-1, -7.5], [2.5, -6.5], [-3.5, -10.5]]) {
      this._add(boxGeo(0.02, 0.5, 0.02, x, 3.45, z), this.m.black, false);
      this._add(cylGeo(0.12, 0.18, 0.3, x, 3.05, z, 10), this.m.lamp, false);
      this._add(cylGeo(0.25, 0.08, 0.06, x, 3.24, z, 10), this.m.brass, false);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.world.tex.glow, color: C(34, 100, 60), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.55 }));
      halo.position.set(x, 3.05, z);
      halo.scale.setScalar(1.4);
      this.g.add(halo);
    }
    for (const [x, z] of [[-1.5, -4.5], [-0.5, -9.5]]) {
      const l = new THREE.PointLight(0xffb060, 30, 16, 2); // bright and cosy: the room is dark wood
      l.position.set(x, 3, z);
      this.g.add(l);
      this.lights.push(l);
    }
  }

  _decor() {
    const rug = this._add(new THREE.PlaneGeometry(4.2, 6.2), new THREE.MeshLambertMaterial({ map: T.rugTexture() }), false);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(-1.2, FLOOR + 0.012, -6.6);
    const wallX = -this.world.interiors.saloon.hx + 0.02;
    [['wanted', -2.5, 1], ['painting', -5.5, 2], ['wanted', -8.5, 3]].forEach(([kind, z, seed]) => {
      const pic = this._add(new THREE.PlaneGeometry(0.8, 1.0), new THREE.MeshLambertMaterial({ map: T.pictureTexture(kind, seed) }), false);
      pic.position.set(wallX, 2.2, z);
      pic.rotation.y = Math.PI / 2;
      if (kind === 'wanted') {
        this._adult(pic);
        const painting = new THREE.Mesh(pic.geometry, new THREE.MeshLambertMaterial({ map: T.pictureTexture('painting', seed) }));
        painting.position.copy(pic.position); painting.rotation.copy(pic.rotation); this.g.add(painting); this._family(painting);
      }
    });
    // spittoons and a couple of barrels by the bar
    for (const z of [-3.2, -9.8]) {
      this._adult(this._add(cylGeo(0.14, 0.11, 0.22, 3.75, FLOOR + 0.11, z, 10), this.m.brass));
      this._family(this._add(cylGeo(0.13, 0.09, 0.22, 3.75, FLOOR + 0.11, z, 10), this.m.ivory));
      this._family(this._add(cylGeo(0.015, 0.015, 0.28, 3.75, FLOOR + 0.32, z, 6), lambert([100,40,35])));
      const flower = this._add(new THREE.SphereGeometry(0.095, 8, 6), lambert([45,85,65])); flower.position.set(3.75, FLOOR + 0.48, z); this._family(flower);
    }
    for (const z of [-10.6, -11.4]) this._add(cylGeo(0.32, 0.3, 0.85, 5.9, FLOOR + 0.42, z, 12), this.m.varnish);
    this._block(5.9, -11, 0.4, 0.8);
  }

  _doors() {
    const it = this.world.interiors.saloon;
    const geo = new THREE.BoxGeometry(it.dw / 2 - 0.05, 1.1, 0.05);
    for (const side of [-1, 1]) {
      const hinge = new THREE.Group();
      hinge.position.set((side * it.dw) / 2, FLOOR + 1.25, 0);
      const panel = new THREE.Mesh(geo, this.m.varnish);
      panel.position.x = (-side * (it.dw / 2 - 0.05)) / 2;
      panel.castShadow = true;
      hinge.add(panel);
      this.g.add(hinge);
      this.doors.push({ hinge, side, a: 0, v: 0 });
    }
    this.doorPos = this.g.localToWorld(V(0, 0, 0));
  }

  // who: positions (world) that can push the doors (the player, the camera)
  update(dt, t, who, lanternLevel) {
    if (!this.g) return;
    for (const { p, kind, ph } of this.people) {
      if (kind === 'bartender') {
        // polishing a glass, now and then looking up
        p.arms[0].rotation.set(-0.55 + Math.sin(t * 3.1) * 0.2, 0, Math.sin(t * 3.1) * 0.15);
        p.arms[1].rotation.set(-0.6 + Math.cos(t * 3.1) * 0.15, 0, 0);
        p.elbows[0].rotation.x = p.elbows[1].rotation.x = -1.3;
        p.upper.rotation.y = Math.sin(t * 0.3) * 0.35;
      } else if (kind === 'pianist') {
        p.arms[0].rotation.x = -0.9 + Math.sin(t * 9) * 0.08;
        p.arms[1].rotation.x = -0.9 + Math.sin(t * 9 + 2.2) * 0.08;
        p.elbows[0].rotation.x = p.elbows[1].rotation.x = -0.5;
        p.upper.position.y = Math.abs(Math.sin(t * 4.5)) * 0.02;
        p.upper.rotation.y = Math.sin(t * 0.7) * 0.12;
      } else if (kind === 'singer') {
        // one hand on the piano, the other keeping time; a gentle sway
        p.arms[0].rotation.set(-0.35, 0, -0.5);
        p.elbows[0].rotation.x = -0.9;
        p.arms[1].rotation.set(-0.5 + Math.sin(t * 5.9) * 0.15, 0, 0.15);
        p.elbows[1].rotation.x = -1.2;
        p.upper.rotation.z = Math.sin(t * 2.95) * 0.05;
        p.upper.rotation.y = Math.sin(t * 0.5) * 0.15;
      } else {
        p.arms[0].rotation.x = -1.05 + Math.max(0, Math.sin(t * 0.9 + ph)) * 0.35;
        p.elbows[0].rotation.x = p.elbows[1].rotation.x = -0.45;
        p.upper.rotation.y = Math.sin(t * 0.4 + ph) * 0.2;
      }
    }
    for (const l of this.lights) l.intensity = 28 + lanternLevel * 12 + Math.sin(t * 7) * 0.6;
    // batwing doors: pushed open (inwards) by anyone close, then swing shut and settle
    const near = who.some((w) => w && Math.hypot(w.x - this.doorPos.x, w.z - this.doorPos.z) < 1.6);
    for (const d of this.doors) {
      const target = near ? 1.25 : 0;
      d.v += (-(d.a - target) * 40 - d.v * 3.2) * dt;
      d.a += d.v * dt;
      d.hinge.rotation.y = -d.side * d.a;
    }
  }
}
