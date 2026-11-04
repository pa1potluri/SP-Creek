// Honey Bun Café: cakes, tea, checkers, an upright piano and gently swinging glass doors.
// Everything is placed in the cafe's own frame: x across the room, z from the door (0) inwards (−),
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

export class CafeInterior {
  constructor(world) {
    const it = world.interiors.cafe;
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
      varnish: wood(3, {color:C(32,28,72),emissive:C(35,30,48),emissiveIntensity:0.32}, [32,30,65]),
      top: wood(4, { color:C(35,30,88),emissive:C(38,35,65),emissiveIntensity:0.35 }, [35,30,80]),
      brass: lambert([42, 70, 52]),
      ivory: lambert([45,30,88],{emissive:C(40,25,65),emissiveIntensity:0.2}),
      black: lambert([0, 0, 8]),
      cloth: this._gingham(),
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
  _family(obj) { obj.userData.familyRole = 'family'; this.familyProps.push(obj); return obj; }

  setFamilyMode(on) {
    this.familyMode = !!on;
    for (const obj of this.familyProps) obj.visible = true;
  }

  _gingham() {
    const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#fff3d7';x.fillRect(0,0,128,128);
    for(let i=0;i<8;i++)for(let j=0;j<8;j++)if((i+j)%2){x.fillStyle='#eab9c5';x.fillRect(i*16,j*16,16,16);}
    return new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c),emissive:'#dfc3b5',emissiveIntensity:0.18});
  }

  _teapot(x,y,z) {
    const g=new THREE.Group(),ivory=this.m.ivory;
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.17,16,10).scale(1,0.8,1),ivory));
    const lid=new THREE.Mesh(new THREE.SphereGeometry(0.13,12,8).scale(1,0.3,1),ivory);lid.position.y=0.13;g.add(lid);
    const knob=new THREE.Mesh(new THREE.SphereGeometry(0.035,8,6),this.m.brass);knob.position.y=0.18;g.add(knob);
    const handle=new THREE.Mesh(new THREE.TorusGeometry(0.11,0.025,6,12),ivory);handle.position.x=-0.18;g.add(handle);
    const spout=new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(V(0.1,0,0),V(0.25,0,0),V(0.26,0.13,0)),8,0.04,6,false),ivory);g.add(spout);
    g.position.set(x,y+0.13,z);this.g.add(g);this._family(g);
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
    this._teapot(4.3,FLOOR+1.18,-5);
    const cakeGlass=new THREE.MeshPhongMaterial({color:'#e8f4ee',transparent:true,opacity:0.15,depthWrite:false,shininess:60});
    this._family(this._add(boxGeo(0.82,0.72,2.1,4.3,FLOOR+1.58,-8.5),cakeGlass,false));
    const icing=lambert([330,40,78]),bread=lambert([33,50,65]);
    for(let i=0;i<3;i++){
      this._family(this._add(cylGeo(0.22,0.22,0.04,4.3,FLOOR+1.2,-9.1+i*0.6),cream,false));
      this._family(this._add(cylGeo(0.17,0.18,0.24,4.3,FLOOR+1.35,-9.1+i*0.6),bread,false));
      this._family(this._add(cylGeo(0.18,0.17,0.07,4.3,FLOOR+1.5,-9.1+i*0.6),icing,false));
    }
    const bellMat=lambert([42,55,65],{emissive:C(40,45,55),emissiveIntensity:0.25});
    this._family(this._add(cylGeo(0.14,0.14,0.03,4.3,FLOOR+1.19,-3.4),bellMat,false));
    const bell=this._add(new THREE.SphereGeometry(0.12,12,8,0,Math.PI*2,0,Math.PI/2),bellMat,false);bell.position.set(4.3,FLOOR+1.2,-3.4);this._family(bell);
    const menu=this._add(new THREE.PlaneGeometry(4,1.15),new THREE.MeshBasicMaterial({map:T.signTexture('TEA · CAKES · LEMONADE',1024,256,[43,35,88],'#65766d')}),false);menu.position.set(6.56,FLOOR+2.2,-6.5);menu.rotation.y=-Math.PI/2;this._family(menu);
    const light=new THREE.MeshBasicMaterial({color:'#ffe5b1'});
    for(const h of [FLOOR+1.18,FLOOR+2.98])this._family(this._add(boxGeo(0.025,0.045,7.2,6.31,h,-6.5),light,false));
    this._family(this._add(boxGeo(0.025,0.055,7.3,3.81,FLOOR+1.05,-6.5),light,false));
    // Bright painted room lining and existing lamps supply fill without new point lights.
    const lining=lambert([40,25,83],{emissive:C(38,25,70),emissiveIntensity:0.27});
    this._add(boxGeo(0.04,3.15,11.5,-7.05,FLOOR+1.6,-6.1),lining,false);
    this._add(boxGeo(14.1,3.15,0.04,0,FLOOR+1.6,-12.03),lining,false);
    this._add(boxGeo(14.1,0.04,11.7,0,3.75,-6.05),lining,false);
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

  // a collider in the cafe's frame
  _block(cx, cz, hx, hz) {
    this.world.colliders.rects.push(this.world._rectOf(this.g, cx, cz, hx, hz));
  }

  _bar() {
    const m = this.m;
    // counter along the right-hand wall, cake shelves behind it
    this._add(boxGeo(0.7, 1.1, 7.5, 4.3, FLOOR + 0.55, -6.5), m.varnish);
    this._add(boxGeo(0.95, 0.07, 7.7, 4.3, FLOOR + 1.13, -6.5), m.top);
    this._block(4.3, -6.5, 0.5, 3.85);
    this._add(boxGeo(0.5, 2.8, 7.4, 6.85, FLOOR + 1.4, -6.5), m.varnish);
    for (const y of [1.35, 2.95]) this._add(boxGeo(0.4, 0.05, 7.4, 6.55, FLOOR + y, -6.5), m.varnish);
    this._block(6.85, -6.5, 0.3, 3.7);
    // cafeHost behind the counter, facing the room
    const bt = makePerson(CAST.cafeHost);
    bt.g.position.set(5.6, FLOOR, -5.4);
    bt.g.rotation.y = -Math.PI / 2;
    this.g.add(bt.g);
    this.people.push({ p: bt, kind: 'owner', ph: 0 });
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
      this._add(cylGeo(0.65, 0.65, 0.06, tx, FLOOR + 0.78, tz, 18), m.cloth);
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
          const p = makePerson(randomTownsfolk(['teacher', 'shopkeeper', 'prospector', 'rancher', 'mayor'][this.people.length % 5]));
          seat(p);
          p.arms.forEach((arm) => (arm.rotation.x = -1.05));
          p.g.position.set(cx, FLOOR + 0.5 + 0.07 - HIP, cz);
          p.g.rotation.y = chair.rotation.y;
          this.g.add(p.g);
          this.people.push({ p, kind: 'games', ph: Math.random() * 6 });
        }
      }
      if (players) {
        this._board(tx, tz);
      }
      this._teapot(tx+0.35,FLOOR+0.815,tz-0.25);
      if(!players){this._cup(tx-0.3,FLOOR+0.815,tz);this._family(this._add(cylGeo(0.16,0.17,0.15,tx,FLOOR+0.9,tz+0.2),m.ivory,false));}
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
    for (const [x, z] of [[3.6, -5.5], [1, -9.5]]) {
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
    const wallX = -this.world.interiors.cafe.hx + 0.02;
    [-2.5,-5.5,-8.5].forEach((z,i)=>{const pic=this._add(new THREE.PlaneGeometry(0.8,1),new THREE.MeshLambertMaterial({map:T.pictureTexture('painting',i+1)}),false);pic.position.set(wallX,2.2,z);pic.rotation.y=Math.PI/2;});
    for(const z of [-3.2,-9.8]){this._family(this._add(cylGeo(0.13,0.09,0.22,3.75,FLOOR+0.11,z,10),this.m.ivory));const flower=this._add(new THREE.SphereGeometry(0.12,8,6),lambert([330,45,75]));flower.position.set(3.75,FLOOR+0.4,z);}
    for(const z of [-10.6,-11.4]){this._add(cylGeo(0.32,0.3,0.3,5.9,FLOOR+0.15,z,12),this.m.top);for(let i=0;i<4;i++){const roll=this._add(new THREE.SphereGeometry(0.12,8,6),lambert([32,50,65]));roll.position.set(5.75+(i%2)*0.25,FLOOR+0.36,z-0.12+Math.floor(i/2)*0.24);}}

    this._block(5.9, -11, 0.4, 0.8);
  }

  _doors() {
    const it = this.world.interiors.cafe;
    const geo = new THREE.BoxGeometry(it.dw / 2 - 0.05, 2.5, 0.05);
    // plain warm boards: the mahogany grain repeats into a carpet-like pattern at door size
    const plain = this.world.paintedMaterial('boards', 1, 1, { color: C(30, 45, 62) }) || lambert([28, 40, 40]);
    this.world.surfaces.add(plain);
    for (const side of [-1, 1]) {
      const hinge = new THREE.Group();
      hinge.position.set((side * it.dw) / 2, FLOOR + 1.25, 0);
      const panel = new THREE.Mesh(geo, plain);
      panel.position.x = (-side * (it.dw / 2 - 0.05)) / 2;
      panel.castShadow = true;
      hinge.add(panel);
      const pane=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.9,0.025),new THREE.MeshLambertMaterial({color:'#c0dcd5',emissive:'#c2d5cc',emissiveIntensity:0.25}));pane.position.set(panel.position.x,0.35,0.04);hinge.add(pane);
      this.g.add(hinge);
      this.doors.push({ hinge, side, a: 0, v: 0 });
    }
    this.doorPos = this.g.localToWorld(V(0, 0, 0));
  }

  // who: positions (world) that can push the doors (the player, the camera)
  update(dt, t, who, lanternLevel) {
    if (!this.g) return;
    for (const { p, kind, ph } of this.people) {
      if (kind === 'owner') {
        // arranging cakes, now and then looking up
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
