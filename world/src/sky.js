// Painted sky dome (gradient, sun/moon, drifting clouds, stars) and far mountain rings.
import * as THREE from 'three';
import { fbm } from './world.js';

const skyVert = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = p.xyww;
  }`;

const skyFrag = /* glsl */ `
  uniform vec3 uTop, uHorizon, uGround, uSunColor, uCloudLit, uCloudShade, uSunDir;
  uniform float uTime, uCloudCover, uStars, uSunSize;
  varying vec3 vDir;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 col = mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.4));
    float sd = max(dot(d, uSunDir), 0.0);
    col += uSunColor * (pow(sd, 8.0) * 0.35 + pow(sd, 64.0) * 0.6) * (1.0 - uStars * 0.75);
    col = mix(col, uSunColor * 1.6, smoothstep(1.0 - uSunSize, 1.0 - uSunSize * 0.5, sd));
    col = mix(col, uHorizon, exp(-abs(h) * 18.0) * 0.45);
    if (h > 0.0) {
      vec2 uv = d.xz / (h + 0.12) * 0.6;
      vec2 drift = vec2(uTime * 0.006, uTime * 0.002);
      float n = fbm(uv * 1.3 + drift);
      float m = smoothstep(1.0 - uCloudCover, 1.0 - uCloudCover + 0.18, n) * smoothstep(0.0, 0.1, h);
      // light the cloud from the sun side: sample slightly toward the sun for self-shadowing
      float n2 = fbm(uv * 1.3 + drift + normalize(uSunDir.xz + 1e-4) * 0.08);
      float lit = clamp(0.55 + (n - n2) * 5.0 + pow(sd, 3.0) * 0.5, 0.0, 1.0);
      col = mix(col, mix(uCloudShade, uCloudLit, lit), m * 0.95);
      float band = exp(-pow(dot(d, normalize(vec3(0.65, 0.28, -0.7))), 2.0) * 90.0);
      col += vec3(0.075, 0.09, 0.16) * band * (0.35 + fbm(d.xz * 23.0)) * uStars * (1.0 - m);
      float moonAngle = acos(clamp(sd, 0.0, 1.0));
      float moon = 1.0 - smoothstep(0.026, 0.029, moonAngle);
      float pigment = 0.82 + 0.18 * fbm(d.xz * 270.0);
      col += vec3(0.25, 0.32, 0.5) * exp(-moonAngle * 17.0) * uStars;
      col = mix(col, vec3(0.91, 0.94, 1.0) * pigment, moon * uStars);
      vec2 sp = d.xz / (h + 0.3) * 120.0; vec2 id = floor(sp);
      float st = step(0.985, hash(id)) * smoothstep(0.15, 0.0, length(fract(sp) - 0.5));
      col += st * uStars * (1.0 - m) * (0.6 + 0.4 * sin(uTime * 2.0 + hash(id) * 40.0));
    } else {
      col = mix(uHorizon, uGround, smoothstep(0.0, -0.25, h));
    }
    gl_FragColor = vec4(col, 1.0);
  }`;

export function createSky() {
  const c = () => ({ value: new THREE.Color() });
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTop: c(), uHorizon: c(), uGround: c(), uSunColor: c(), uCloudLit: c(), uCloudShade: c(),
      uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uTime: { value: 0 }, uCloudCover: { value: 0.4 },
      uStars: { value: 0 }, uSunSize: { value: 0.0018 },
    },
    vertexShader: skyVert,
    fragmentShader: skyFrag,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(10, 48, 24), mat);
  sky.frustumCulled = false;
  sky.renderOrder = -10;
  return sky;
}

// A seamless ring of ridged mountains; colour comes from the material (set per atmosphere).
function ringGeometry(R, base, amp, seed) {
  const segs = 320, rows = 5, pos = [], col = [], alpha = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2, cx = Math.cos(a), sz = Math.sin(a);
    const n = fbm(cx * 6 + seed * 10, sz * 6 - seed * 7, 5);
    const ridge = 1 - Math.abs(n * 2 - 1);
    const top = base + amp * (0.35 * n + 0.65 * ridge * ridge);
    for (let j = 0; j < rows; j++) {
      const t = j / (rows - 1);
      pos.push(cx * R, -30 + (top + 30) * t, sz * R);
      const shade = (0.72 + 0.32 * t) * (0.9 + 0.2 * fbm(cx * 9 + j, sz * 9 - j, 2));
      col.push(shade, shade, shade);
      alpha.push(j === 0 || j === rows - 1 ? 0 : 1);
    }
  }
  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < rows - 1; j++) {
      const a = i * rows + j, b = (i + 1) * rows + j;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('aHazeAlpha', new THREE.Float32BufferAttribute(alpha, 1));
  g.setIndex(idx);
  return g;
}

export function createMountains() {
  const group = new THREE.Group(), layers = [];
  for (const s of [
    { R: 360, base: 22, amp: 75, seed: 1, haze: 0.12 },
    { R: 520, base: 45, amp: 130, seed: 2, haze: 0.3 },
    { R: 720, base: 80, amp: 230, seed: 3, haze: 0.5 },
  ]) {
    const mesh = new THREE.Mesh(ringGeometry(s.R, s.base, s.amp, s.seed), new THREE.MeshBasicMaterial({ vertexColors: true, fog: true, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    mesh.material.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nattribute float aHazeAlpha; varying float vHazeAlpha;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvHazeAlpha = aHazeAlpha;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vHazeAlpha;').replace('#include <opaque_fragment>', 'diffuseColor.a *= smoothstep(0.0, 1.0, vHazeAlpha);\n#include <opaque_fragment>');
    };
    group.add(mesh);
    layers.push({ mesh, haze: s.haze });
  }
  return { group, layers };
}
