// Playable mode: walk, run and jump around the valley in third person, or ride a horse.
// The world's colliders keep you out of buildings, trees, fences and deep water; raised
// floors (boardwalks, the platform, the bridge) can be stepped onto.
import * as THREE from 'three';
import { terrainHeight, WATER_Y, RAIL_X } from './world.js';
import { makePerson, animatePerson, animateHorse, seat, stand } from './life.js';
import { CAST } from './characters.js';
import { sampleBalloonRide, BALLOON_RIDE_SECONDS, balloonRideState } from './areas/crystal-mine.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const isTyping = (e) => e.target && e.target.closest && e.target.closest('input, select, textarea');

const WALK = 2.2, RUN = 5.5, TROT = 3.4, GALLOP = 10, GRAVITY = 14, JUMP = 5;

export class Game {
  constructor({ scene, camera, canvas, world, life, director }) {
    Object.assign(this, { scene, camera, canvas, world, life, director });
    this.active = false;
    this.keys = new Set();
    this.yaw = 0;
    this.pitch = 0.3;
    this.person = makePerson(CAST.cowboy); // you play the hero cowboy
    this.person.g.visible = false;
    scene.add(this.person.g);
    this.pos = V(0, 0, 14);
    this.vy = 0;
    this.grounded = true;
    this.facing = 0;
    this.phase = 0;
    this.walk = 0;
    this.horse = null; // the Grazer we are riding
    this.balloon = null;
    this.speed = 0;
    this.prompt = '';
    this._cam = V();
    this._target = V();
    this.dust = { type: 'smoke', pos: V(), rate: 0, acc: 0, life: 2, s0: 0.4, s1: 2.2, alpha: 0.16, rise: 0.25 };
    this.onChange = () => {};
    this._input();
  }

  // ---------- entering / leaving ----------
  enter() {
    if (this.active) return;
    this.active = true;
    // start on the ground where the camera was looking (or in the square if that's somewhere odd)
    const l = this.director.state.look;
    this.pos.set(l.x, 0, l.z);
    // The hill view looks at the basket, which is solid: enter beside it.
    if(this.world.balloonRide&&Math.hypot(l.x-202,l.z+145)<6)this.pos.set(202,this.world.balloonRide.top.y+.15,-142.5);
    else if (this.camera.position.distanceTo(l) > 40 || this._blocked(this.pos.x, this.pos.z, 0.4)) this.pos.set(0, 0, 14);
    this.pos.y = this._ground(this.pos.x, this.pos.z, 99);
    const d = V().subVectors(l, this.camera.position);
    this.yaw = Math.atan2(d.x, d.z);
    this.facing = this.yaw;
    this.pitch = 0.3;
    this.person.g.visible = true;
    this.director.mode = 'game';
    this.director.flight = null;
    this._cam.copy(this.camera.position);
    this.onChange();
  }

  exit() {
    if (!this.active) return;
    if (this.balloon) this._landBalloon();
    if (this.horse) this._dismount();
    this.active = false;
    this.person.g.visible = false;
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    this.director.state.pos.copy(this.camera.position);
    this.director.state.look.copy(this._target);
    this.director.setFree(true);
    this.onChange();
  }

  // ---------- input ----------
  _input() {
    addEventListener('keydown', (e) => {
      if (!this.active || isTyping(e)) return;
      this.keys.add(e.code);
      if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
      if (e.code === 'Space' && this.grounded && !this.horse && !this.balloon) {
        this.vy = JUMP;
        this.grounded = false;
      }
      if (e.code === 'KeyE' && !e.repeat) this._interact();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    // mouse look: pointer lock after a click, or drag with the button held
    let dragging = false;
    this.canvas.addEventListener('pointerdown', (e) => {
      if (!this.active || e.button !== 0) return;
      dragging = true;
      if (document.pointerLockElement !== this.canvas && this.canvas.requestPointerLock) {
        try {
          const p = this.canvas.requestPointerLock();
          if (p && p.catch) p.catch(() => {});
        } catch { /* drag still works */ }
      }
    });
    addEventListener('pointerup', () => (dragging = false));
    addEventListener('mousemove', (e) => {
      if (!this.active || (document.pointerLockElement !== this.canvas && !dragging)) return;
      this.yaw -= e.movementX * 0.0028;
      this.pitch = THREE.MathUtils.clamp(this.pitch + e.movementY * 0.0028, -0.25, 1.25);
    });
    this.canvas.addEventListener('wheel', (e) => {
      if (!this.active) return;
      e.preventDefault();
      this.zoom = THREE.MathUtils.clamp((this.zoom || 1) * (e.deltaY > 0 ? 1.1 : 0.9), 0.5, 2.5);
    }, { passive: false });
  }

  // ---------- the world's solid things ----------
  _ground(x, z, y) {
    let g = terrainHeight(x, z);
    for (const f of this.world.floors) {
      if (y < f.y - 0.7) continue; // underneath it (e.g. wading under the bridge)
      const dx = x - f.cx, dz = z - f.cz;
      if (Math.abs(dx * f.ax + dz * f.az) < f.hx && Math.abs(dx * f.bx + dz * f.bz) < f.hz) g = Math.max(g, f.y);
    }
    return g;
  }

  _deepWater(x, z, y) {
    return this._ground(x, z, y) < this.world.waterLevel(x,z) - 0.55;
  }

  // Things that move: townsfolk, horses, riders, the stagecoach and the train.
  _moving() {
    const L = this.life, circles = [], rects = [];
    for (const w of L.walkers) circles.push({ x: w.pos.x, z: w.pos.z, r: 0.3 });
    for (const g of L.grazers) if (g !== this.horse) circles.push({ x: g.pos.x, z: g.pos.z, r: 0.85 });
    for (const t of [...L.riders, L.coach].filter(Boolean)) {
      const fx = Math.sin(t.yaw), fz = Math.cos(t.yaw), long = t === L.coach ? 3.4 : 0.6;
      // a short row of circles along the body (the coach is long: coach + team of horses)
      for (let k = -1; k <= 1; k++) circles.push({ x: t.p.x + fx * k * long, z: t.p.z + fz * k * long, r: t === L.coach ? 1.3 : 0.9 });
    }
    const tr = L.train;
    if (tr && tr.state !== 'away') rects.push({ cx: RAIL_X, cz: tr.s - tr.dir * 16, ax: 1, az: 0, bx: 0, bz: 1, hx: 1.5, hz: 21 });
    return { circles, rects };
  }

  // Push the point (p.x, p.z) out of everything solid within radius r.
  _resolve(p, r) {
    const moving = this._moving();
    const rects = [...this.world.colliders.rects, ...moving.rects];
    const circles = [...this.world.colliders.circles, ...moving.circles];
    const { segs } = this.world.colliders;
    for (const c of rects) {
      const dx = p.x - c.cx, dz = p.z - c.cz;
      let lx = dx * c.ax + dz * c.az, lz = dx * c.bx + dz * c.bz;
      const px = c.hx + r - Math.abs(lx), pz = c.hz + r - Math.abs(lz);
      if (px <= 0 || pz <= 0) continue;
      if (px < pz) lx = Math.sign(lx || 1) * (c.hx + r);
      else lz = Math.sign(lz || 1) * (c.hz + r);
      p.x = c.cx + c.ax * lx + c.bx * lz;
      p.z = c.cz + c.az * lx + c.bz * lz;
    }
    for (const c of circles) {
      const dx = p.x - c.x, dz = p.z - c.z;
      if (Math.abs(dx) > c.r + r || Math.abs(dz) > c.r + r) continue;
      const d = Math.hypot(dx, dz), min = c.r + r;
      if (d < min && d > 1e-6) {
        p.x = c.x + (dx / d) * min;
        p.z = c.z + (dz / d) * min;
      }
    }
    for (const s of segs) {
      const ex = s.bx - s.ax, ez = s.bz - s.az, len2 = ex * ex + ez * ez;
      const t = Math.max(0, Math.min(1, ((p.x - s.ax) * ex + (p.z - s.az) * ez) / len2));
      const qx = s.ax + ex * t, qz = s.az + ez * t, dx = p.x - qx, dz = p.z - qz, d = Math.hypot(dx, dz), min = r + 0.08;
      if (d < min && d > 1e-6) {
        p.x = qx + (dx / d) * min;
        p.z = qz + (dz / d) * min;
      }
    }
  }

  _blocked(x, z, r) {
    const p = { x, z };
    this._resolve(p, r);
    return Math.hypot(p.x - x, p.z - z) > 0.01;
  }

  // Move by (mx, mz), sliding along walls and refusing to walk into deep water.
  _move(mx, mz, r) {
    const p = { x: this.pos.x + mx, z: this.pos.z + mz };
    this._resolve(p, r);
    if (this._deepWater(p.x, p.z, this.pos.y)) {
      // try each axis on its own so you slide along the bank
      const a = { x: this.pos.x + mx, z: this.pos.z }, b = { x: this.pos.x, z: this.pos.z + mz };
      this._resolve(a, r);
      this._resolve(b, r);
      if (!this._deepWater(a.x, a.z, this.pos.y)) Object.assign(p, a);
      else if (!this._deepWater(b.x, b.z, this.pos.y)) Object.assign(p, b);
      else return;
    }
    this.pos.x = p.x;
    this.pos.z = p.z;
  }

  // ---------- horses ----------
  _nearestHorse() {
    let best = null, bd = 2.6;
    for (const g of this.life.grazers) {
      const d = Math.hypot(g.pos.x - this.pos.x, g.pos.z - this.pos.z);
      if (d < bd && !g.ridden) [best, bd] = [g, d];
    }
    return best;
  }

  _interact() {
    if (!this.active) return;
    if (this.balloon) return this._landBalloon();
    if (this.horse) this._dismount();
    else if (this._canBoardBalloon()) this._boardBalloon();
    else {
      const h = this._nearestHorse();
      if (h) this._mount(h);
    }
  }

  _canBoardBalloon() {
    const ride=this.world.balloonRide;
    return !!ride&&!this.horse&&!balloonRideState()&&Math.hypot(this.pos.x-202,this.pos.z+145)<3&&this.pos.z<=-141.3&&Math.abs(this.pos.y-ride.top.y-.15)<1;
  }

  _boardBalloon() {
    if (!this._canBoardBalloon()) return;
    this.balloon={t:0,game:true};
    this.keys.clear();this.vy=0;this.speed=0;this.walk=0;
    stand(this.person);
    this.world.balloonRide.balloon.add(this.person.g);
    this.person.g.position.set(0,.18,0);this.person.g.rotation.set(0,0,0);
  }

  _landBalloon() {
    this.balloon=null;
    this.scene.add(this.person.g);
    this.pos.set(202,this.world.balloonRide.top.y+.15,-142.5);
    this.person.g.position.copy(this.pos);this.person.g.rotation.set(0,0,0);
    this.keys.clear();this.vy=0;this.walk=0;this.grounded=true;this.facing=0;this.prompt='';
    this.director.state.look.set(this.pos.x,this.pos.y+1.6,this.pos.z);
  }

  _flyBalloon(dt) {
    this.balloon.t=Math.min(BALLOON_RIDE_SECONDS,this.balloon.t+dt);
    if(this.balloon.t>=BALLOON_RIDE_SECONDS){this._landBalloon();this._camera(1);return;}
    this.pos.copy(sampleBalloonRide(this.balloon.t));
    animatePerson(this.person,this.balloon.t*.6,0);
    this.person.g.position.set(0,.18,0);this.person.g.rotation.set(0,0,0);
    this._target.copy(this.pos);this._target.y+=5;
    this._cam.set(this.pos.x-12,this.pos.y+7,this.pos.z+18);
    this.camera.position.copy(this._cam);this.camera.lookAt(this._target);
    this.director.state.pos.copy(this._cam);this.director.state.look.copy(this._target);
    this.prompt='Balloon ride — E to return to the boarding deck';
  }

  _mount(g) {
    this.horse = g;
    g.ridden = true;
    g.h.neck.rotation.x = 0.6;
    this.pos.set(g.pos.x, this.pos.y, g.pos.z);
    this.facing = g.yaw;
    this.speed = 0;
    seat(this.person, true);
    this.person.upper.position.y = 0;
    this.person.g.position.set(0, 0.85, 0.05);
    this.person.g.rotation.set(0, 0, 0);
    g.h.body.add(this.person.g);
    this.world.emitters.push(this.dust);
  }

  _dismount() {
    const g = this.horse;
    this.horse = null;
    // left standing on the bridge or a platform: it stays there instead of sinking to the ground
    if (this.pos.y - terrainHeight(this.pos.x, this.pos.z) > 0.2) {
      g.fixedY = this.pos.y;
      g.tethered = true;
    } else g.fixedY = undefined;
    g.h.body.remove(this.person.g);
    this.scene.add(this.person.g);
    stand(this.person);
    // step off on the left side, or the right if that's blocked
    for (const side of [1, -1]) {
      const x = g.pos.x + Math.cos(this.facing) * 1.3 * side, z = g.pos.z - Math.sin(this.facing) * 1.3 * side;
      if (!this._blocked(x, z, 0.35) && !this._deepWater(x, z, this.pos.y)) {
        this.pos.set(x, this.pos.y, z);
        break;
      }
    }
    this.pos.y = this._ground(this.pos.x, this.pos.z, this.pos.y + 1);
    g.release();
    this.speed = 0;
    this.world.emitters = this.world.emitters.filter((e) => e !== this.dust);
  }

  // ---------- every frame ----------
  update(dt) {
    if (!this.active) return;
    if (this.balloon) return this._flyBalloon(dt);
    const k = this.keys;
    const f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    const s = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    const fast = k.has('ShiftLeft') || k.has('ShiftRight');
    // camera-relative direction (right = (-cos yaw, sin yaw), as in the free camera)
    let dx = Math.sin(this.yaw) * f - Math.cos(this.yaw) * s, dz = Math.cos(this.yaw) * f + Math.sin(this.yaw) * s;
    const len = Math.hypot(dx, dz);
    if (len > 0) { dx /= len; dz /= len; }

    if (this.horse) this._ride(dt, dx, dz, len > 0, fast);
    else this._walk(dt, dx, dz, len > 0, fast);

    this.prompt = this.horse ? 'E — get off' : this._canBoardBalloon() ? 'E — board the balloon' : this._nearestHorse() ? 'E — ride this horse' : '';
    this._camera(dt);
  }

  _walk(dt, dx, dz, moving, fast) {
    const speed = fast ? RUN : WALK;
    if (moving) {
      this.facing += wrapAngle(Math.atan2(dx, dz) - this.facing) * Math.min(1, dt * 10);
      this._move(dx * speed * dt, dz * speed * dt, 0.35);
    }
    this.walk += ((moving ? (fast ? 1.25 : 1) : 0) - this.walk) * Math.min(1, dt * 8);
    this.phase += dt * speed * 2.6 * Math.min(1, this.walk);
    // gravity, jumping and stepping up onto boardwalks
    const ground = this._ground(this.pos.x, this.pos.z, this.pos.y);
    this.vy -= GRAVITY * dt;
    this.pos.y += this.vy * dt;
    const ceiling = this._ceiling(this.pos.x, this.pos.z);
    if (ceiling !== null && this.pos.y + 1.95 > ceiling) {
      this.pos.y = ceiling - 1.95; // bump your head
      this.vy = Math.min(this.vy, 0);
    }
    if (this.pos.y <= ground || (this.grounded && this.pos.y - ground < 0.45)) {
      this.pos.y = this.grounded ? this.pos.y + (ground - this.pos.y) * Math.min(1, dt * 18) : ground;
      if (Math.abs(this.pos.y - ground) < 0.02) this.pos.y = ground;
      this.vy = 0;
      this.grounded = true;
    } else this.grounded = false;
    animatePerson(this.person, this.phase, this.grounded ? Math.min(1.25, this.walk) : 0.3);
    this.person.g.position.copy(this.pos);
    this.person.g.rotation.y = this.facing;
  }

  _ride(dt, dx, dz, moving, fast) {
    const g = this.horse, want = moving ? (fast ? GALLOP : TROT) : 0;
    this.speed += Math.sign(want - this.speed) * Math.min(Math.abs(want - this.speed), (want > this.speed ? 4 : 7) * dt);
    if (moving) this.facing += Math.sign(wrapAngle(Math.atan2(dx, dz) - this.facing)) * Math.min(Math.abs(wrapAngle(Math.atan2(dx, dz) - this.facing)), dt * 2.4);
    this._move(Math.sin(this.facing) * this.speed * dt, Math.cos(this.facing) * this.speed * dt, 0.9);
    this.pos.y += (this._ground(this.pos.x, this.pos.z, this.pos.y) - this.pos.y) * Math.min(1, dt * 12);
    g.pos.set(this.pos.x, 0, this.pos.z);
    g.yaw = this.facing;
    g.h.g.position.copy(this.pos);
    g.h.g.rotation.y = this.facing;
    const gallop = this.speed > 6;
    g.phase += dt * this.speed * (gallop ? 1.5 : 2.4);
    animateHorse(g.h, g.phase, Math.min(gallop ? 1.5 : 1, this.speed / 3));
    this.dust.pos.set(this.pos.x - Math.sin(this.facing), this.pos.y + 0.1, this.pos.z - Math.cos(this.facing));
    this.dust.rate = this.speed > 1 ? this.speed * 0.6 : 0;
  }

  // Third-person camera: orbits behind the player, never dips under the ground or into a wall.
  _camera(dt) {
    const riding = !!this.horse;
    const dist = (riding ? 7 : 4.8) * (this.zoom || 1);
    this._target.set(this.pos.x, this.pos.y + (riding ? 2.7 : 1.6), this.pos.z);
    const cp = Math.cos(this.pitch);
    const want = V(this._target.x - Math.sin(this.yaw) * cp * dist, this._target.y + Math.sin(this.pitch) * dist, this._target.z - Math.cos(this.yaw) * cp * dist);
    // pull in if a building is in the way
    for (let t = 1; t > 0.2; t -= 0.1) {
      const x = this._target.x + (want.x - this._target.x) * t, z = this._target.z + (want.z - this._target.z) * t;
      if (!this._blockedByWall(x, z)) {
        want.x = x;
        want.z = z;
        want.y = this._target.y + (want.y - this._target.y) * t;
        break;
      }
    }
    const ceiling = this._ceiling(this._target.x, this._target.z);
    if (ceiling !== null) want.y = Math.min(want.y, ceiling - 0.3); // indoors: stay under the ceiling
    want.y = Math.max(want.y, terrainHeight(want.x, want.z) + 0.4);
    this._cam.lerp(want, Math.min(1, dt * 10));
    this.camera.position.copy(this._cam);
    this.camera.lookAt(this._target);
    // keep the director's idea of the shot in step (depth-of-field focus, leaving the game)
    this.director.state.pos.copy(this._cam);
    this.director.state.look.copy(this._target);
  }

  // height of the ceiling over (x, z), or null outdoors
  _ceiling(x, z) {
    for (const c of this.world.ceilings) {
      const dx = x - c.cx, dz = z - c.cz;
      if (Math.abs(dx * c.ax + dz * c.az) < c.hx && Math.abs(dx * c.bx + dz * c.bz) < c.hz) return c.y;
    }
    return null;
  }

  _blockedByWall(x, z) {
    for (const c of this.world.colliders.rects) {
      const dx = x - c.cx, dz = z - c.cz;
      if (Math.abs(dx * c.ax + dz * c.az) < c.hx + 0.2 && Math.abs(dx * c.bx + dz * c.bz) < c.hz + 0.2) return true;
    }
    return false;
  }
}
