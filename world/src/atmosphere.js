// Moods (time of day + weather) that blend smoothly, plus everything alive in the air:
// sun/moon light, fog, dust motes, fireflies, rain, birds, chimney/campfire smoke and embers.
import * as THREE from 'three';
import * as T from './textures.js';
import { installCloudLighting, cloudUniforms } from './environment.js';
import { terrainHeight, walkHeight, riverZ } from './world.js';
import { HAMLET } from './hamlet.js';

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
    hemiSky: '#d9e3ec', hemiGround: '#6e7058', hemiIntensity: 1.3, fogColor: '#d8d7cc', fogNear: 45, fogFar: 480,
    cloudCover: 0.5, stars: 0, lanterns: 0, dust: 0.5, dustColor: '#fff6e0', fireflies: 0, rain: 0, birds: 1,
    mountain: '#7d8794', exposure: 1.0, warmth: -0.05, sat: 0.9,
  },
  dusk: {
    label: 'Dusk & Lanterns', skyTop: '#27305c', skyHorizon: '#e57e5c', skyGround: '#3a2c2e', sunColor: '#ff7448',
    cloudLit: '#f39a77', cloudShade: '#463656', sunElev: -2, sunAzim: 252, sunIntensity: 0.7, sunSize: 0.0018,
    // lifted fill (was 0.7 with a near-black ground): dusk must stay readable for young viewers
    hemiSky: '#8a8cbc', hemiGround: '#8c6e5e', hemiIntensity: 1.6, fogColor: '#8a6678', fogNear: 30, fogFar: 430,
    cloudCover: 0.5, stars: 0.3, lanterns: 1, dust: 0.5, dustColor: '#ffad6a', fireflies: 0.45, rain: 0, birds: 0.6,
    mountain: '#3e3450', exposure: 1.3, warmth: 0.08, sat: 1.05,
  },
  night: {
    // kept readable for young viewers: a soft moon and a lifted ground fill, so grass and docks never go black
    label: 'Moonlit Night', skyTop: '#0a1330', skyHorizon: '#283a60', skyGround: '#0e121a', sunColor: '#b0c4ee',
    cloudLit: '#4c5c84', cloudShade: '#121a2e', sunElev: 32, sunAzim: 140, sunIntensity: 1.6, sunSize: 0.0007,
    hemiSky: '#5a76b0', hemiGround: '#3a4766', hemiIntensity: 1.9, fogColor: '#1c2742', fogNear: 20, fogFar: 320,
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

// Deep blue lake night: brighter than Moonlit Night, with warm sparkles in the air.
PRESETS.dreamyNight = {
  ...PRESETS.night, label: 'Dreamy blue night',
  skyTop: '#0c1c58', skyHorizon: '#2f4c96', skyGround: '#141c40', sunColor: '#b4c8ff',
  cloudLit: '#6a80c0', cloudShade: '#1e2a5a', cloudCover: 0.25,
  hemiSky: '#7a96e8', hemiGround: '#46588f', hemiIntensity: 1.8, fogColor: '#1f2f66', fogNear: 35, fogFar: 380,
  dust: 0.7, dustColor: '#ffe2a0', mountain: '#26366e', exposure: 1.55, warmth: -0.04, sat: 1.12,
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
    uniforms: { uTime: { value: 0 }, uSpeed:{value:16}, uLength:{value:0.9}, uCam: { value: new THREE.Vector3() }, uBox: { value: box }, uAmount: { value: 0 }, uColor: { value: new THREE.Color(0.75, 0.78, 0.82) } },
    vertexShader: /* glsl */ `
      attribute float aEnd; uniform float uTime,uSpeed,uLength; uniform vec3 uCam, uBox; varying float vA;
      void main() {
        vec3 p = position;
        p.y = mod(p.y - uTime * uSpeed, uBox.y);
        vec3 w = vec3(mod(p.x - uCam.x + uBox.x * 0.5, uBox.x) - uBox.x * 0.5, p.y - uBox.y * 0.35, mod(p.z - uCam.z + uBox.z * 0.5, uBox.z) - uBox.z * 0.5);
        vec3 world = uCam + w + vec3(aEnd * 0.04, aEnd * uLength, 0.0);
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
    for (const [index,b] of this.birds.entries()) {
      p.copy(c).add(b.off);
      if(index>=8){p.x+=38;p.y+=7;p.z-=34;}
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
    this.weather='auto';this.weatherStart=0;this.clock=0;this.festival=false;
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

    this.lightDecor = new THREE.Group(); this.lightDecor.name = 'Soft sunbeams and warm ground pools';
    scene.add(this.lightDecor);
    const beamMap=T.glowTexture(),beamGeo=new THREE.PlaneGeometry(1,1);
    this.beamMaterial=new THREE.MeshBasicMaterial({map:beamMap,color:'#ffd898',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
    this.beams=[[-5,-22,0.3],[4,35,-0.2],[-87,-190,0.6],[-103,-202,-0.4]].map(([x,z,angle])=>{
      const beam=new THREE.Mesh(beamGeo,this.beamMaterial);beam.position.set(x,terrainHeight(x,z)+10,z);beam.scale.set(3.5,24,1);beam.rotation.set(0,angle,-0.35);this.lightDecor.add(beam);return beam;
    });
    const poolGeo=new THREE.PlaneGeometry(1,1);poolGeo.rotateX(-Math.PI/2);
    this.poolMaterial=new THREE.MeshBasicMaterial({map:T.glowTexture(),color:'#ffc778',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
    this.groundPools=new THREE.InstancedMesh(poolGeo,this.poolMaterial,256);this.groundPools.frustumCulled=false;this.groundPools.count=0;this.lightDecor.add(this.groundPools);
    this.poolSources=[];this.poolRootCount=-1;this.roofRim={value:0};
    this.morningMist=new THREE.Group();this.morningMist.name='Low morning river and valley mist';scene.add(this.morningMist);
    this.mistMaterial=new THREE.MeshBasicMaterial({map:T.puffTexture(),color:'#ecf1e5',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
    const mistSites=[...[-60,-30,10,45,80].map(x=>[x,riverZ(x),true]),[-69,94,true],[-240,-18,true],[-48,110,false],[-35,-95,false]];
    this.mistPatches=mistSites.map(([x,z,water],i)=>{const plane=new THREE.Mesh(new THREE.PlaneGeometry(1,1),this.mistMaterial);plane.scale.set(water?27:36,2.8,1);this.morningMist.add(plane);return {plane,x,z,y:(water?world.waterLevel(x,z):terrainHeight(x,z))+0.9,phase:i*2.399};});
    this.dust = motes(1800, new THREE.Vector3(70, 18, 70), false);
    this.flies = motes(400, new THREE.Vector3(60, 4, 60), true);
    this.flies.material.uniforms.uColor.value.set(0.85, 1.0, 0.45);
    this.rain = rainLines(4000, new THREE.Vector3(40, 25, 40));
    this.rainbow=new THREE.Group();this.rainbow.name='Soft clearing rainbow';
    for(const [i,color]of ['#e5a7a0','#ecc291','#eee3a4','#b9d4a3','#a6d5d1','#afbee0','#cfb4dc'].entries()){
      const band=new THREE.Mesh(new THREE.TorusGeometry(37-i*0.6,0.32,5,80,Math.PI),new THREE.MeshBasicMaterial({color,transparent:true,opacity:0,depthWrite:false}));this.rainbow.add(band);
    }
    scene.add(this.rainbow);
    const geo=new THREE.BufferGeometry(),positions=new Float32Array(220*3),colors=new Float32Array(220*3);
    for(let i=0;i<220;i++){positions.set([(i*17.31)%60,(i*7.73)%16,(i*23.17)%60],i*3);new THREE.Color(['#e8c088','#d9a6bc','#c8d69e'][i%3]).toArray(colors,i*3);}
    geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
    this.petals=new THREE.Points(geo,new THREE.ShaderMaterial({vertexColors:true,transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uCam:{value:new THREE.Vector3()},uScale:{value:500}},vertexShader:`uniform float uTime,uScale;uniform vec3 uCam;varying vec3 vColor;varying float vFade;
      void main(){vec3 p=position;p.x+=uTime*1.7;p.z+=sin(uTime*0.4+position.x)*2.0;p.y-=uTime*0.25;vec3 d=mod(p-uCam+vec3(30.,8.,30.),vec3(60.,16.,60.))-vec3(30.,8.,30.);vec4 mv=viewMatrix*vec4(uCam+d,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(0.09*uScale/max(1.,-mv.z),1.,9.);vColor=color;vFade=smoothstep(30.,18.,length(d.xz));}`,
      fragmentShader:`varying vec3 vColor;varying float vFade;void main(){vec2 p=gl_PointCoord-.5;float a=smoothstep(.48,.22,length(p*vec2(1.,1.6)));gl_FragColor=vec4(vColor,a*vFade*.65);}`}));
    this.petals.frustumCulled=false;scene.add(this.petals);

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

  setWeather(key) {
    this.weather=['auto','drizzle','clearing','windy'].includes(key)?key:'auto';this.weatherStart=this.clock;
  }

  setViewport(height, fov) {
    const s = height / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2));
    this.petals.material.uniforms.uScale.value=s;
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
    this.world.festival=this.festival;
    this.clock=time;
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

    // Match the distant ground to the sky instead of making a white silhouette.
    this.scene.fog.color.copy(c.fogColor).lerp(c.skyHorizon, 0.55);
    const highView = THREE.MathUtils.smoothstep(camera.position.y, 12, 65);
    const vista = 1 + highView * 0.75 + THREE.MathUtils.smoothstep(Math.hypot(camera.position.x,camera.position.z),80,180) * 0.6;
    const backdrop = this.scene.children.find(o => o.geometry?.type === 'CylinderGeometry' && o.material?.map && !o.material.fog);
    if (backdrop && !backdrop.material.userData.softHorizon) {
      const material = backdrop.material;
      material.userData.softHorizon = { value: this.scene.fog.color };
      material.onBeforeCompile = shader => {
        shader.uniforms.uBackdropMist = material.userData.softHorizon;
        shader.uniforms.uBackdropTop = {value:backdrop.geometry.parameters.height*0.5};
        shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying float vBackdropHeight;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvBackdropHeight = position.y;');
        shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uBackdropMist; uniform float uBackdropTop; varying float vBackdropHeight;').replace('#include <opaque_fragment>', 'outgoingLight = mix(outgoingLight, uBackdropMist, (1.0 - smoothstep(-35.0, 180.0, vBackdropHeight)) * 0.9);\n// Fade the open panorama rim into the procedural sky, including upward views.\ndiffuseColor.a *= 1.0 - smoothstep(uBackdropTop * 0.25, uBackdropTop, vBackdropHeight);\n#include <opaque_fragment>');
      };
      material.needsUpdate = true;
    }
    this.scene.fog.near = c.fogNear * vista / m.fog;
    this.scene.fog.far = c.fogFar * vista / m.fog;
    for (const L of this.mountains.layers) L.mesh.material.color.copy(c.mountain).lerp(c.fogColor, Math.min(1, L.haze * Math.sqrt(m.fog)));
    const smooth = (a,b,x) => { const v=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return v*v*(3-2*v); };
    cloudUniforms.uCloudTime.value=time;cloudUniforms.uCloudWind.value=this.world.wind ?? 1;
    cloudUniforms.uCloudAmount.value=THREE.MathUtils.clamp(m.cloudShadows ?? 0.6,0,1)*Math.min(1,c.cloudCover*m.clouds*1.6)
      *(1-smooth(0.35,0.8,c.stars))*(1-smooth(0.35,0.75,Math.min(1,c.rain+m.rain)))*smooth(-3,10,c.sunElev);
    this.world.updateWaterMood(c,this.sunDir);
    this.renderer.toneMappingExposure = c.exposure;
    this.world.lanternLevel = c.lanterns;
    this.beamMaterial.opacity=(this.key==='golden'?0.055:0)*(1-Math.min(1,c.rain+m.rain));
    this.poolMaterial.opacity=c.lanterns*0.22;
    // Rebuild when scenery changes; each window facade contributes one soft pool.
    if(this.poolRootCount!==this.world.root.children.length){
      this.poolRootCount=this.world.root.children.length;this.poolSources=[];const fronts=new Set();
      this.world.root.traverse(o=>{
        if(o.isSprite&&o.material===this.world.haloMat)this.poolSources.push({object:o,lantern:true});
        if(o.isMesh&&[].concat(o.material).some(mat=>mat.userData.facadeSpec)&&!fronts.has(o.parent)){fronts.add(o.parent);this.poolSources.push({object:o.parent,lantern:false});}
      });
    }
    const matrix=new THREE.Matrix4(),point=new THREE.Vector3();let poolCount=0;
    for(const source of this.poolSources){let visible=true;for(let o=source.object;o;o=o.parent)if(!o.visible)visible=false;if(!visible||poolCount>=256)continue;
      if(source.lantern)source.object.getWorldPosition(point);else{point.set(0,0,1.2);source.object.localToWorld(point);}
      point.y=walkHeight(point.x,point.z)+0.045;
      matrix.makeRotationY(source.object.rotation.y);matrix.scale(new THREE.Vector3(source.lantern?5:7,1,source.lantern?5:3.8));matrix.setPosition(point);this.groundPools.setMatrixAt(poolCount++,matrix);
    }
    this.groundPools.count=poolCount;this.groundPools.instanceMatrix.needsUpdate=true;
    this.roofRim.value=c.stars*0.12;
    for(const material of this.world.surfaces){
      if(material.userData.moonRim)continue;
      if(material!==this.world.mat.roof&&material.userData.sets?.oil?.image!==this.world.painted.oil.roof&&material.userData.sets?.clean?.image!==this.world.painted.clean.roof)continue;
      material.userData.moonRim=true;const before=material.onBeforeCompile.bind(material),rim=this.roofRim;
      material.onBeforeCompile=(shader,renderer)=>{before(shader,renderer);shader.uniforms.uMoonRim=rim;
        shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vMoonNormal;').replace('#include <begin_vertex>','#include <begin_vertex>\nvMoonNormal=normalize(mat3(modelMatrix)*normal);');
        shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vMoonNormal; uniform float uMoonRim;').replace('#include <opaque_fragment>','outgoingLight += vec3(0.48,0.62,0.9)*uMoonRim*pow(1.0-abs(dot(normalize(vMoonNormal),normalize(cameraPosition-vCloudWorld))),2.0);\n#include <opaque_fragment>');
      };material.needsUpdate=true;
    }

    const setMotes = (pts, amount, color) => {
      const uu = pts.material.uniforms;
      uu.uTime.value = time;
      uu.uCam.value.copy(camera.position);
      uu.uAmount.value = amount;
      if (color) uu.uColor.value.copy(color);
      pts.visible = amount > 0.01;
    };
    this.mistMaterial.opacity=this.key==='morning'?0.065*(0.45+0.55*Math.exp(-Math.max(0,time)/220)):0;
    this.mistMaterial.color.copy(c.fogColor).lerp(new THREE.Color('#f2f5e9'),0.4);
    for(const {plane,x,z,y,phase} of this.mistPatches){plane.position.set(x+Math.sin(time*0.014+phase)*3,y+Math.sin(time*0.02+phase)*0.12,z+Math.cos(time*0.012+phase)*2);plane.rotation.y=Math.atan2(camera.position.x-plane.position.x,camera.position.z-plane.position.z);}
    // Keep Willow Creek storefronts readable without changing the chosen weather or wet ground.
    const willowView=1-smooth(45,85,Math.hypot(camera.position.x-HAMLET.x,camera.position.z-HAMLET.z));
    setMotes(this.dust, c.dust * m.dust * (1-.5*willowView), c.dustColor);
    setMotes(this.flies, Math.min(1,c.fireflies*1.5));
    const elapsed=Math.max(0,time-this.weatherStart), clear=this.weather==='clearing';
    const rain=this.weather==='drizzle'?0.3:clear?0.3*(1-smooth(0,35,elapsed)):this.weather==='windy'?0:THREE.MathUtils.clamp(c.rain+m.rain,0,1);
    const wet=this.weather==='drizzle'?1:clear?1-smooth(20,120,elapsed):Math.min(1,rain*2);
    this.world.rainAmount=rain;this.world.wetAmount=wet;
    const rainbowAmount=clear?smooth(5,22,elapsed)*(1-smooth(85,120,elapsed))*(1-c.stars)*0.22:0;
    this.rainbow.visible=rainbowAmount>0.001;this.rainbow.children.forEach(b=>b.material.opacity=rainbowAmount);
    this.rainbow.position.set(camera.position.x-this.sunDir.x*115,terrainHeight(camera.position.x,camera.position.z)+5,camera.position.z-this.sunDir.z*115);
    this.rainbow.rotation.y=Math.atan2(camera.position.x-this.rainbow.position.x,camera.position.z-this.rainbow.position.z);
    this.petals.visible=this.weather==='windy';this.petals.material.uniforms.uTime.value=time;this.petals.material.uniforms.uCam.value.copy(camera.position);
    const ru=this.rain.material.uniforms;ru.uSpeed.value=this.weather==='auto'?16:4;ru.uLength.value=(this.weather==='auto'?0.9:0.24)*(1-.4*willowView);
    ru.uTime.value = time;
    ru.uCam.value.copy(camera.position);
    ru.uAmount.value = rain*(1-.35*willowView);
    this.rain.geometry.setDrawRange(0,Math.floor(this.rain.geometry.attributes.position.count/2*(1-.35*willowView))*2);
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
