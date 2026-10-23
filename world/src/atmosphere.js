// Moods (time of day + weather) that blend smoothly, plus everything alive in the air:
// sun/moon light, fog, dust motes, fireflies, rain, birds, chimney/campfire smoke and embers.
import * as THREE from 'three';
import * as T from './textures.js';
import { installCloudLighting, cloudUniforms } from './environment.js';

export const PRESETS = {
  golden: {
    label: 'Golden Hour', skyTop: '#2f62a8', skyHorizon: '#f5bd84', skyGround: '#7a5c40', sunColor: '#ffb466',
    cloudLit: '#ffdcae', cloudShade: '#a07e86', sunElev: 11, sunAzim: 248, sunIntensity: 3.6, sunSize: 0.0018,
    hemiSky: '#b4c8e0', hemiGround: '#9a7450', hemiIntensity: 1.8, fogColor: '#e6c39a', fogNear: 70, fogFar: 560,
    cloudCover: 0.45, stars: 0, lanterns: 0.15, dust: 1, dustColor: '#ffd59a', fireflies: 0, rain: 0, birds: 1,
    mountain: '#4e5584', exposure: 1.2, warmth: 0.12, sat: 1.1,
  },
  morning: {
    label: 'Misty Morning', skyTop: '#93adc4', skyHorizon: '#e6e1d3', skyGround: '#6f7062', sunColor: '#ffe0b8',
    cloudLit: '#fbf3e8', cloudShade: '#a3acb8', sunElev: 14, sunAzim: 75, sunIntensity: 1.9, sunSize: 0.0016,
    hemiSky: '#d9e3ec', hemiGround: '#6e7058', hemiIntensity: 1.3, fogColor: '#d8d7cc', fogNear: 4, fogFar: 170,
    cloudCover: 0.5, stars: 0, lanterns: 0, dust: 0.5, dustColor: '#fff6e0', fireflies: 0, rain: 0, birds: 1,
    mountain: '#7d8794', exposure: 1.0, warmth: -0.05, sat: 0.9,
  },
  dusk: {
    label: 'Dusk & Lanterns', skyTop: '#27305c', skyHorizon: '#e57e5c', skyGround: '#3a2c2e', sunColor: '#ff7448',
    cloudLit: '#f39a77', cloudShade: '#463656', sunElev: -2, sunAzim: 252, sunIntensity: 0.7, sunSize: 0.0018,
    hemiSky: '#6a6f9c', hemiGround: '#3a2c2c', hemiIntensity: 0.7, fogColor: '#8a6678', fogNear: 30, fogFar: 430,
    cloudCover: 0.5, stars: 0.3, lanterns: 1, dust: 0.5, dustColor: '#ffad6a', fireflies: 0.45, rain: 0, birds: 0.6,
    mountain: '#3e3450', exposure: 1.15, warmth: 0.08, sat: 1.05,
  },
  night: {
    label: 'Moonlit Night', skyTop: '#0a1330', skyHorizon: '#283a60', skyGround: '#0e121a', sunColor: '#9cb2e0',
    cloudLit: '#4c5c84', cloudShade: '#121a2e', sunElev: 32, sunAzim: 140, sunIntensity: 1.1, sunSize: 0.0007,
    hemiSky: '#4a66a0', hemiGround: '#1a2030', hemiIntensity: 1.2, fogColor: '#1c2742', fogNear: 20, fogFar: 320,
    cloudCover: 0.35, stars: 1, lanterns: 1, dust: 0.25, dustColor: '#a8c0ff', fireflies: 1, rain: 0, birds: 0,
    mountain: '#222c4c', exposure: 1.7, warmth: -0.12, sat: 0.85,
  },
  rain: {
    label: 'Rainy Afternoon', skyTop: '#6c7682', skyHorizon: '#a7a9a6', skyGround: '#4e4b45', sunColor: '#d7d4cc',
    cloudLit: '#b4b6b6', cloudShade: '#5d6168', sunElev: 25, sunAzim: 200, sunIntensity: 0.7, sunSize: 0.0001,
    hemiSky: '#a9b2bb', hemiGround: '#4f4a40', hemiIntensity: 1.3, fogColor: '#9c9f9d', fogNear: 15, fogFar: 260,
    cloudCover: 0.95, stars: 0, lanterns: 0.55, dust: 0, dustColor: '#ffffff', fireflies: 0, rain: 1, birds: 0,
    mountain: '#5c6268', exposure: 1.05, warmth: -0.1, sat: 0.85,
  },
};

// Keep the existing dusk mood for saved videos; the village needs readable evening light.
PRESETS.villageDusk = {
  ...PRESETS.dusk, label: 'Warm village dusk',
  skyTop: '#4a5684', skyHorizon: '#f3a674', skyGround: '#574534',
  cloudLit: '#f4c3a0', cloudShade: '#796578', sunElev: 3, sunIntensity: 1.8,
  hemiSky: '#d4bec0', hemiGround: '#a38a6c', hemiIntensity: 1.8,
  fogColor: '#b28a7c', mountain: '#665a76', exposure: 1.45, stars: 0.12, warmth: 0.10,
};

const COLOR_KEYS = ['skyTop', 'skyHorizon', 'skyGround', 'sunColor', 'cloudLit', 'cloudShade', 'hemiSky', 'hemiGround', 'fogColor', 'dustColor', 'mountain'];

function prepare(p) {
  const o = { ...p };
  delete o.label;
  for (const k of COLOR_KEYS) o[k] = new THREE.Color(p[k]);
  return o;
}
function cloneState(src) {
  const o = {};
  for (const k in src) o[k] = src[k] instanceof THREE.Color ? src[k].clone() : src[k];
  return o;
}
function blendInto(out, a, b, t) {
  for (const k in b) {
    if (b[k] instanceof THREE.Color) out[k].copy(a[k]).lerp(b[k], t);
    else if (k === 'sunAzim') out[k] = a[k] + ((((b[k] - a[k] + 540) % 360) - 180) * t);
    else out[k] = a[k] + (b[k] - a[k]) * t;
  }
}

const motesVert = /* glsl */ `
  attribute float aSeed;
  uniform float uTime, uSize, uScale, uFire; uniform vec3 uCam, uBox;
  varying float vA;
  void main() {
    vec3 p = position;
    float t = uTime * (0.5 + aSeed);
    p += vec3(sin(t * 0.37 + aSeed * 40.0) * 1.6 + uTime * 0.35 * (1.0 - uFire),
              sin(t * 0.53 + aSeed * 17.0) * (0.6 + uFire * 0.6),
              cos(t * 0.29 + aSeed * 23.0) * 1.6);
    vec3 w = mod(p - uCam + uBox * 0.5, uBox) - uBox * 0.5;
    vec3 world = uCam + w;
    if (uFire > 0.5) world.y = 0.3 + mod(p.y, uBox.y);
    vec4 mv = viewMatrix * vec4(world, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;
    gl_PointSize = uSize * (0.5 + aSeed) * uScale / max(dist, 0.1);
    float tw = uFire > 0.5 ? pow(max(sin(uTime * (1.2 + aSeed) + aSeed * 60.0), 0.0), 6.0) : 0.55 + 0.45 * sin(uTime * 1.7 + aSeed * 50.0);
    vA = tw * smoothstep(0.6, 2.5, dist) * smoothstep(uBox.x * 0.5, uBox.x * 0.25, length(w.xz));
  }`;
const motesFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uAmount; varying float vA;
  void main() {
    float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
    gl_FragColor = vec4(uColor * 2.0, a * a * vA * uAmount);
  }`;

function motes(count, box, fire) {
  const geo = new THREE.BufferGeometry(), p = new Float32Array(count * 3), seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    p.set([Math.random() * box.x, Math.random() * box.y, Math.random() * box.z], i * 3);
    seed[i] = Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uBox: { value: box }, uColor: { value: new THREE.Color() },
      uAmount: { value: 0 }, uSize: { value: fire ? 0.08 : 0.035 }, uScale: { value: 1000 }, uFire: { value: fire ? 1 : 0 },
    },
    vertexShader: motesVert, fragmentShader: motesFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return pts;
}

function rainLines(count, box) {
  const geo = new THREE.BufferGeometry(), p = new Float32Array(count * 6), end = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const x = Math.random() * box.x, y = Math.random() * box.y, z = Math.random() * box.z;
    p.set([x, y, z, x, y, z], i * 6);
    end[i * 2 + 1] = 1;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  geo.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uBox: { value: box }, uAmount: { value: 0 }, uColor: { value: new THREE.Color(0.75, 0.78, 0.82) } },
    vertexShader: /* glsl */ `
      attribute float aEnd; uniform float uTime; uniform vec3 uCam, uBox; varying float vA;
      void main() {
        vec3 p = position;
        p.y = mod(p.y - uTime * 16.0, uBox.y);
        vec3 w = vec3(mod(p.x - uCam.x + uBox.x * 0.5, uBox.x) - uBox.x * 0.5, p.y - uBox.y * 0.35, mod(p.z - uCam.z + uBox.z * 0.5, uBox.z) - uBox.z * 0.5);
        vec3 world = uCam + w + vec3(aEnd * 0.12, aEnd * 0.9, 0.0);
        gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
        vA = 1.0 - aEnd * 0.7;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying float vA;
      void main() { gl_FragColor = vec4(uColor, 0.35 * vA * uAmount); }`,
    transparent: true, depthWrite: false,
  });
  const lines = new THREE.LineSegments(geo, mat);
  lines.frustumCulled = false;
  return lines;
}

// CPU particles (smoke puffs, embers) drawn as size-attenuated point sprites.
class Particles {
  constructor(max, tex, additive) {
    this.max = max;
    this.next = 0;
    this.pos = new Float32Array(max * 3);
    this.vel = new Float32Array(max * 3);
    this.size = new Float32Array(max);
    this.alpha = new Float32Array(max);
    this.age = new Float32Array(max);
    this.life = new Float32Array(max);
    this.s0 = new Float32Array(max);
    this.s1 = new Float32Array(max);
    this.a0 = new Float32Array(max);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    this.material = new THREE.ShaderMaterial({
      uniforms: { uTex: { value: tex }, uColor: { value: new THREE.Color(1, 1, 1) }, uScale: { value: 1000 } },
      vertexShader: /* glsl */ `
        attribute float aSize, aAlpha; uniform float uScale; varying float vA;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * uScale / max(-mv.z, 0.1);
          vA = aAlpha;
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uTex; uniform vec3 uColor; varying float vA;
        void main() { vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(uColor * t.rgb, t.a * vA); }`,
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
  }
  spawn(x, y, z, vx, vy, vz, life, s0, s1, a0) {
    const i = this.next;
    this.next = (i + 1) % this.max;
    this.pos.set([x, y, z], i * 3);
    this.vel.set([vx, vy, vz], i * 3);
    this.age[i] = 0;
    this.life[i] = life;
    this.s0[i] = s0;
    this.s1[i] = s1;
    this.a0[i] = a0;
  }
  update(dt, wind) {
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) { this.alpha[i] = 0; continue; }
      this.age[i] += dt;
      const k = this.age[i] / this.life[i];
      if (k >= 1) { this.life[i] = 0; this.alpha[i] = 0; continue; }
      this.pos[i * 3] += (this.vel[i * 3] + wind * k) * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.size[i] = this.s0[i] + (this.s1[i] - this.s0[i]) * k;
      this.alpha[i] = this.a0[i] * Math.sin(Math.PI * k);
    }
    const a = this.points.geometry.attributes;
    a.position.needsUpdate = a.aSize.needsUpdate = a.aAlpha.needsUpdate = true;
  }
}

// A small flock wheeling high over the valley.
class Birds {
  constructor(n = 16) {
    this.pos = new Float32Array(n * 6 * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x2b231e, side: THREE.DoubleSide }));
    this.mesh.frustumCulled = false;
    this.birds = Array.from({ length: n }, () => ({
      off: new THREE.Vector3((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 16),
      ph: Math.random() * 6.28, sp: 6 + Math.random() * 2,
    }));
    this.v = Array.from({ length: 8 }, () => new THREE.Vector3());
  }
  _center(t, out) {
    return out.set(Math.sin(t * 0.031) * 95, 46 + Math.sin(t * 0.07) * 8, Math.cos(t * 0.023) * 120 - 10);
  }
  update(t) {
    const [c, fwd, right, p, nose, tail, tl, tr] = this.v, up = THREE.Object3D.DEFAULT_UP;
    this._center(t, c);
    this._center(t + 0.5, fwd).sub(c).normalize();
    right.crossVectors(fwd, up).normalize();
    let o = 0;
    const put = (v) => { this.pos[o++] = v.x; this.pos[o++] = v.y; this.pos[o++] = v.z; };
    for (const b of this.birds) {
      p.copy(c).add(b.off);
      p.x += Math.sin(t * 0.4 + b.ph) * 2;
      p.y += Math.sin(t * 0.6 + b.ph);
      p.z += Math.cos(t * 0.3 + b.ph) * 2;
      const flap = Math.sin(t * b.sp + b.ph) * 0.45;
      nose.copy(p).addScaledVector(fwd, 0.3);
      tail.copy(p).addScaledVector(fwd, -0.35);
      tl.copy(p).addScaledVector(right, 0.75).addScaledVector(up, flap).addScaledVector(fwd, -0.15);
      tr.copy(p).addScaledVector(right, -0.75).addScaledVector(up, flap).addScaledVector(fwd, -0.15);
      put(nose); put(tl); put(tail);
      put(nose); put(tail); put(tr);
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
  }
}

export class Atmosphere {
  constructor(scene, renderer, world, sky, mountains) {
    this.scene = scene;
    this.renderer = renderer;
    this.world = world;
    this.sky = sky;
    this.mountains = mountains;
    this.presets = Object.fromEntries(Object.entries(PRESETS).map(([k, p]) => [k, prepare(p)]));
    this.key = 'golden';
    this.cur = cloneState(this.presets.golden);
    this.from = null;
    this.to = null;
    this.blend = 1;
    installCloudLighting();
    this.cloudUniforms = cloudUniforms;
    this.mult = { fog: 1, dust: 1, clouds: 1, cloudShadows: 0.6, rain: 0, transition: 5 };
    this.grade = { warmth: 0, sat: 1 };
    this.sunDir = new THREE.Vector3();
    this._smokeGrey = new THREE.Color(0.55, 0.52, 0.5);

    scene.fog = new THREE.Fog(0xffffff, 60, 500);
    this.sun = new THREE.DirectionalLight(0xffffff, 3);
    this.sun.castShadow = true;
    const sc = this.sun.shadow.camera;
    sc.left = sc.bottom = -110;
    sc.right = sc.top = 110;
    sc.near = 10;
    sc.far = 500;
    this.sun.shadow.mapSize.set(4096, 4096);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.04;
    this.hemi = new THREE.HemisphereLight();
    scene.add(this.sun, this.sun.target, this.hemi);

    this.dust = motes(1800, new THREE.Vector3(70, 18, 70), false);
    this.flies = motes(260, new THREE.Vector3(60, 4, 60), true);
    this.flies.material.uniforms.uColor.value.set(0.85, 1.0, 0.45);
    this.rain = rainLines(4000, new THREE.Vector3(40, 25, 40));
    this.birds = new Birds();
    this.smoke = new Particles(500, T.puffTexture(), false);
    this.embers = new Particles(300, T.glowTexture(), true);
    this.embers.material.uniforms.uColor.value.set(2.2, 0.9, 0.3);
    scene.add(this.dust, this.flies, this.rain, this.birds.mesh, this.smoke.points, this.embers.points);
  }

  setPreset(key, instant = false) {
    this.key = key;
    this.from = cloneState(this.cur);
    this.to = this.presets[key];
    this.blend = instant ? 1 : 0;
    if (instant) blendInto(this.cur, this.from, this.to, 1);
  }

  setViewport(height, fov) {
    const s = height / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2));
    for (const m of [this.dust.material, this.flies.material, this.smoke.material, this.embers.material]) m.uniforms.uScale.value = s;
  }

  _emit(e) {
    const R = Math.random, p = e.pos;
    if (e.type === 'smoke') {
      this.smoke.spawn(p.x + (R() - 0.5) * 0.3, p.y, p.z + (R() - 0.5) * 0.3, (R() - 0.5) * 0.25, (e.rise ?? 1) * (0.8 + R() * 0.4), (R() - 0.5) * 0.25,
        e.life ?? 8, e.s0 ?? 0.8, e.s1 ?? 5, e.alpha ?? 0.28);
    } else {
      this.embers.spawn(p.x + (R() - 0.5) * 0.3, p.y, p.z + (R() - 0.5) * 0.3, (R() - 0.5) * 0.6, 1.2 + R() * 1.6, (R() - 0.5) * 0.6, 1.4 + R(), 0.09, 0.03, 1);
    }
  }

  update(dt, time, camera) {
    if (this.blend < 1) {
      this.blend = Math.min(1, this.blend + dt / Math.max(0.1, this.mult.transition));
      const e = this.blend * this.blend * (3 - 2 * this.blend);
      blendInto(this.cur, this.from, this.to, e);
    }
    const c = this.cur, m = this.mult, D = THREE.MathUtils.degToRad;

    const el = D(c.sunElev), az = D(c.sunAzim), lel = Math.max(el, D(4));
    this.sunDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    // the shadow area (±110 m) travels with the camera, snapped to whole metres so shadows don't shimmer
    const tgt = this.sun.target.position.set(Math.round(camera.position.x), 0, Math.round(camera.position.z));
    this.sun.position.set(Math.cos(lel) * Math.sin(az), Math.sin(lel), Math.cos(lel) * Math.cos(az)).multiplyScalar(200).add(tgt);
    this.sun.target.updateMatrixWorld();
    this.sun.color.copy(c.sunColor);
    this.sun.intensity = c.sunIntensity;
    this.hemi.color.copy(c.hemiSky);
    this.hemi.groundColor.copy(c.hemiGround);
    this.hemi.intensity = c.hemiIntensity;

    const u = this.sky.material.uniforms;
    u.uTop.value.copy(c.skyTop);
    u.uHorizon.value.copy(c.skyHorizon);
    u.uGround.value.copy(c.skyGround);
    u.uSunColor.value.copy(c.sunColor);
    u.uCloudLit.value.copy(c.cloudLit);
    u.uCloudShade.value.copy(c.cloudShade);
    u.uSunDir.value.copy(this.sunDir);
    u.uTime.value = time;
    u.uCloudCover.value = THREE.MathUtils.clamp(c.cloudCover * m.clouds, 0, 1);
    u.uStars.value = c.stars;
    u.uSunSize.value = c.sunSize;
    this.sky.position.copy(camera.position);

    this.scene.fog.color.copy(c.fogColor);
    this.scene.fog.near = c.fogNear / m.fog;
    this.scene.fog.far = c.fogFar / m.fog;
    for (const L of this.mountains.layers) L.mesh.material.color.copy(c.mountain).lerp(c.fogColor, Math.min(1, L.haze * Math.sqrt(m.fog)));
    const smooth = (a,b,x) => { const v=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return v*v*(3-2*v); };
    cloudUniforms.uCloudTime.value=time;cloudUniforms.uCloudWind.value=this.world.wind ?? 1;
    cloudUniforms.uCloudAmount.value=THREE.MathUtils.clamp(m.cloudShadows ?? 0.6,0,1)*Math.min(1,c.cloudCover*m.clouds*1.6)
      *(1-smooth(0.35,0.8,c.stars))*(1-smooth(0.35,0.75,Math.min(1,c.rain+m.rain)))*smooth(-3,10,c.sunElev);
    this.world.updateWaterMood(c,this.sunDir);
    this.renderer.toneMappingExposure = c.exposure;
    this.world.lanternLevel = c.lanterns;

    const setMotes = (pts, amount, color) => {
      const uu = pts.material.uniforms;
      uu.uTime.value = time;
      uu.uCam.value.copy(camera.position);
      uu.uAmount.value = amount;
      if (color) uu.uColor.value.copy(color);
      pts.visible = amount > 0.01;
    };
    setMotes(this.dust, c.dust * m.dust, c.dustColor);
    setMotes(this.flies, c.fireflies);
    const ru = this.rain.material.uniforms, rain = THREE.MathUtils.clamp(c.rain + m.rain, 0, 1);
    ru.uTime.value = time;
    ru.uCam.value.copy(camera.position);
    ru.uAmount.value = rain;
    this.rain.visible = rain > 0.01;

    this.birds.mesh.visible = c.birds > 0.5;
    if (this.birds.mesh.visible) this.birds.update(time);

    for (const e of this.world.emitters) {
      e.acc += e.rate * dt;
      while (e.acc >= 1) { e.acc -= 1; this._emit(e); }
    }
    const daylight = THREE.MathUtils.clamp(c.sunIntensity / 3, 0, 1);
    this.smoke.material.uniforms.uColor.value.copy(c.fogColor).lerp(this._smokeGrey, 0.45 * daylight);
    this.smoke.update(dt, 0.6);
    this.embers.update(dt, 0.2);

    this.grade.warmth = c.warmth;
    this.grade.sat = c.sat;
  }
}
