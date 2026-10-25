// Oil-paint look: a Kuwahara filter with wobbling brush offsets, then impasto relief,
// canvas weave, colour grade, vignette, grain and cinema bars. Runs after tone mapping.
import * as THREE from 'three';

const vert = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const noiseFns = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }`;

export const OilShader = {
  uniforms: {
    tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1, 1) },
    uRadius: { value: 4 }, uStrength: { value: 1 }, uWobble: { value: 0.8 }, uTime: { value: 0 }, uBoil: { value: 0.3 },
  },
  vertexShader: vert,
  fragmentShader: /* glsl */ `
    #define MAXR 7
    uniform sampler2D tDiffuse; uniform vec2 uRes;
    uniform float uRadius, uStrength, uWobble, uTime, uBoil;
    varying vec2 vUv;
    ${noiseFns}
    float weight(vec3 m, vec3 s, float n) {
      vec3 v = abs(s / n - m * m);
      float sd = sqrt(v.r + v.g + v.b) * 255.0;
      return 1.0 / (1.0 + pow(sd, 8.0));
    }
    void main() {
      // brush size is defined at 1080p and scaled up for bigger renders, so 4K looks like HD
      vec2 px = max(1.0, uRes.y / 1080.0) / uRes;
      // hand-painted "boil": brush offsets change at 8 frames per second
      float frame = floor(uTime * 8.0) * uBoil;
      vec2 q = vUv / px / 14.0;
      vec2 w = vec2(noise(q + frame * 3.1), noise(q * 1.3 + 17.0 - frame * 2.3)) - 0.5;
      w += (vec2(noise(q * 0.25 + 5.0), noise(q * 0.25 + 9.0)) - 0.5) * 0.8;
      vec2 uv = vUv + w * px * uRadius * uWobble * 1.6;
      int r = int(uRadius + 0.5);
      vec3 m0 = vec3(0.0), m1 = vec3(0.0), m2 = vec3(0.0), m3 = vec3(0.0);
      vec3 s0 = vec3(0.0), s1 = vec3(0.0), s2 = vec3(0.0), s3 = vec3(0.0);
      for (int j = -MAXR; j <= MAXR; j++) {
        if (j < -r || j > r) continue;
        for (int i = -MAXR; i <= MAXR; i++) {
          if (i < -r || i > r) continue;
          vec3 c = texture2D(tDiffuse, uv + vec2(float(i), float(j)) * px).rgb;
          vec3 cc = c * c;
          if (i <= 0 && j <= 0) { m0 += c; s0 += cc; }
          if (i >= 0 && j <= 0) { m1 += c; s1 += cc; }
          if (i >= 0 && j >= 0) { m2 += c; s2 += cc; }
          if (i <= 0 && j >= 0) { m3 += c; s3 += cc; }
        }
      }
      float n = float((r + 1) * (r + 1));
      m0 /= n; m1 /= n; m2 /= n; m3 /= n;
      float w0 = weight(m0, s0, n), w1 = weight(m1, s1, n), w2 = weight(m2, s2, n), w3 = weight(m3, s3, n);
      vec3 col = (m0 * w0 + m1 * w1 + m2 * w2 + m3 * w3) / max(w0 + w1 + w2 + w3, 1e-20);
      vec3 orig = texture2D(tDiffuse, vUv).rgb;
      gl_FragColor = vec4(mix(orig, col, uStrength), 1.0);
    }`,
};

// Art styles that need the depth map. uMode: 0 none, 1 animated film, 2 blocky toy, 3 paper cut, 4 pixel art, 5 watercolour.
export const LookShader = {
  uniforms: {
    tDiffuse: { value: null }, tDepth: { value: null }, uRes: { value: new THREE.Vector2(1, 1) },
    uNear: { value: 0.1 }, uFar: { value: 4000 }, uMode: { value: 0 },
    uPoster: { value: 6 }, uOutline: { value: 1 }, uDof: { value: 0 }, uFocus: { value: 10 }, uBloom: { value: 0 },
    uLayers: { value: 7 }, uPaperShadow: { value: 1 }, uPixel: { value: 4 },
    uWash: { value: 0.65 }, uPigment: { value: 0.45 }, uPaper: { value: 0.55 },
  },
  vertexShader: vert,
  fragmentShader: /* glsl */ `
    #include <packing>
    uniform sampler2D tDiffuse, tDepth; uniform vec2 uRes; uniform float uNear, uFar;
    uniform int uMode;
    uniform float uPoster, uOutline, uDof, uFocus, uBloom, uLayers, uPaperShadow, uPixel, uWash, uPigment, uPaper;
    varying vec2 vUv;
    ${noiseFns}
    float dist(vec2 uv) { return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, uNear, uFar); }
    // step the brightness into bands but keep each colour's hue and saturation
    vec3 poster(vec3 c, float n) {
      float l = max(dot(c, vec3(0.299, 0.587, 0.114)), 1e-4);
      return c / l * max(floor(l * n + 0.5) / n, 0.5 / n);
    }
    // a real step in depth (one thing standing in front of another), not just ground receding
    bool jump(vec2 a, vec2 b) { float za = dist(a), zb = dist(b); return max(za, zb) / min(za, zb) > 1.25; }
    // paper sheets by distance: 2 m, 5 m, 14 m … 2 km, sky is the back sheet
    float layerOf(vec2 uv) { return floor(uLayers * clamp(log(dist(uv) / 2.0) / log(1000.0), 0.0, 1.0)); }
    float depthEdge(vec2 uv, vec2 px) {
      float z = dist(uv);
      float e = abs(dist(uv + vec2(px.x, 0.0)) - z) + abs(dist(uv - vec2(px.x, 0.0)) - z)
              + abs(dist(uv + vec2(0.0, px.y)) - z) + abs(dist(uv - vec2(0.0, px.y)) - z);
      return smoothstep(0.04, 0.12, e / z);
    }
    void main() {
      vec2 px = 1.0 / uRes, uv = vUv;
      float k = uRes.y / 1080.0; // effects keep the same size at any output resolution
      if (uMode == 4) { vec2 cell = max(1.0, floor(uPixel * k)) * px; uv = (floor(vUv / cell) + 0.5) * cell; }
      vec3 c = texture2D(tDiffuse, uv).rgb;
      if (uMode == 1) {
        // depth of field around the subject the camera looks at, then a soft glow on bright light
        float z = dist(uv);
        float coc = clamp(abs(z - uFocus) / max(z, 0.01) * 1.5, 0.0, 1.0) * uDof * 7.0 * k;
        if (coc > 0.5) {
          vec3 acc = c; float wsum = 1.0;
          for (int i = 0; i < 16; i++) {
            float a = float(i) * 2.39996, r = sqrt(float(i) + 0.5) / 4.0 * coc;
            vec2 o = vec2(cos(a), sin(a)) * r * px;
            float w = dist(uv + o) < z - 0.5 ? 0.3 : 1.0;
            acc += texture2D(tDiffuse, uv + o).rgb * w;
            wsum += w;
          }
          c = acc / wsum;
        }
        vec3 glow = vec3(0.0);
        for (int i = 0; i < 12; i++) {
          float a = float(i) * 0.5236;
          for (int j = 1; j <= 2; j++) glow += max(texture2D(tDiffuse, uv + vec2(cos(a), sin(a)) * float(j) * 9.0 * k * px).rgb - 0.72, 0.0);
        }
        c += glow / 24.0 * uBloom * 3.0;
      } else if (uMode == 2) {
        c = poster(c, uPoster);
        c = mix(c, c * 0.25, depthEdge(uv, px * k) * uOutline);
      } else if (uMode == 3) {
        // every object is its own cut-out sheet: wherever something stands in front of
        // something else, the nearer sheet throws a soft shadow down-right onto the one behind
        float z = dist(uv);
        c = poster(c, uPoster);
        float sh = 0.0;
        for (int i = 1; i <= 7; i++) {
          float zq = dist(uv + vec2(-1.0, 1.0) * float(i) * 2.2 * k * px);
          if (zq * 1.12 < z) sh = max(sh, 1.0 - float(i) / 8.0);
        }
        c *= 1.0 - sh * 0.5 * uPaperShadow;
        // the cut edge facing the light catches it (a thin pale rim)
        float ze = dist(uv + vec2(-1.0, 1.0) * 1.5 * k * px);
        if (ze > z * 1.12) c = mix(c, vec3(1.0, 0.97, 0.92), 0.4);
        // the far land is laid in a few flat sheets, each a touch paler with distance
        c = mix(c, vec3(0.95, 0.9, 0.82), layerOf(uv) / max(uLayers, 1.0) * 0.18);
      } else if (uMode == 5) {
        // Screen-fixed paper and blooms have no clock input: frozen frames stay exact.
        vec2 paperPos = uv * uRes / max(k, 1.0);
        vec2 bleed = vec2(noise(paperPos * 0.035), noise(paperPos * 0.035 + 23.0)) - 0.5;
        vec2 washUV = uv + bleed * px * max(k, 1.0) * uWash * 1.4;
        vec3 source = texture2D(tDiffuse, washUV).rgb, wash = source;
        float washWeight = 1.0, centerDepth = dist(washUV);
        float colorEdge = 0.0;
        for (int i = 0; i < 12; i++) {
          float a = float(i) * 2.39996;
          vec2 offset = vec2(cos(a), sin(a)) * (1.0 + float(i) / 12.0) * (1.0 + uWash * 3.0) * max(k, 1.0) * px;
          vec3 neighbour = texture2D(tDiffuse, washUV + offset).rgb;
          // Let pigment bleed inside a wash without doubling faces across silhouettes.
          vec3 delta = neighbour - source;
          float weight = exp(-dot(delta, delta) * 8.0 - abs(dist(washUV + offset) - centerDepth) / max(centerDepth, 1.0) * 12.0);
          wash += neighbour * weight;
          washWeight += weight;
          colorEdge = max(colorEdge, length(c - neighbour));
        }
        wash /= washWeight;
        c = mix(c, wash, uWash * 0.7);
        c = mix(c, poster(c, 18.0), 0.18);
        float light = dot(c, vec3(0.299, 0.587, 0.114));
        c = mix(vec3(light), c, 0.9);
        c = mix(c, vec3(1.0, 0.985, 0.95), 0.07);
        float rim = max(depthEdge(uv, px * max(k, 1.0) * 1.3), smoothstep(0.06, 0.42, colorEdge));
        c *= 1.0 - rim * uPigment * 0.22;
        float tooth = (noise(paperPos * 0.8) - 0.5) * 0.07 + (noise(paperPos * 0.18) - 0.5) * 0.045;
        float bloom = noise(paperPos * 0.018 + noise(paperPos * 0.006) * 7.0) - 0.5;
        c += tooth * uPaper * (0.35 + light * 0.65);
        c *= 1.0 + bloom * uWash * 0.10;
        c = mix(c, vec3(1.0, 0.99, 0.97), smoothstep(0.65, 1.0, light) * uPaper * (0.05 + max(tooth, 0.0)));
      } else if (uMode == 4) {
        c = poster(c, uPoster);
      }
      gl_FragColor = vec4(c, 1.0);
    }`,
};

export const FinalShader = {
  uniforms: {
    tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uWeave: { value: 1 },
    uImpasto: { value: 0.6 }, uCanvas: { value: 0.5 }, uSat: { value: 1 }, uWarmth: { value: 0 }, uContrast: { value: 1.05 },
    uVignette: { value: 0.45 }, uGrain: { value: 0.3 }, uLetterbox: { value: 0 }, uFloor: { value: 0.1 },
  },
  vertexShader: vert,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform vec2 uRes;
    uniform float uTime, uWeave, uImpasto, uCanvas, uSat, uWarmth, uContrast, uVignette, uGrain, uLetterbox, uFloor;
    varying vec2 vUv;
    ${noiseFns}
    float lum(vec3 c) { return dot(min(c, vec3(1.0)), vec3(0.299, 0.587, 0.114)); }
    void main() {
      vec2 px = 1.0 / uRes;
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      // impasto: treat brightness as paint thickness, light it from the upper left
      float lx = lum(texture2D(tDiffuse, vUv + vec2(px.x * 1.5, 0.0)).rgb) - lum(texture2D(tDiffuse, vUv - vec2(px.x * 1.5, 0.0)).rgb);
      float ly = lum(texture2D(tDiffuse, vUv + vec2(0.0, px.y * 1.5)).rgb) - lum(texture2D(tDiffuse, vUv - vec2(0.0, px.y * 1.5)).rgb);
      c *= 1.0 + clamp((ly - lx) * 3.0, -0.6, 0.6) * uImpasto * 0.5;
      // canvas weave (uWeave = 1) or blotchy paper fibres (uWeave = 0)
      vec2 f = gl_FragCoord.xy;
      float weave = sin(f.x * 1.7 + sin(f.y * 0.23) * 0.8) * sin(f.y * 1.7 + sin(f.x * 0.19) * 0.8);
      float fibre = (noise(f * 0.05) - 0.5) * 0.08 + (noise(f * 0.4) - 0.5) * 0.04;
      c *= 1.0 + uCanvas * (weave * 0.06 * uWeave + (hash(floor(f / 2.0)) - 0.5) * 0.05 + fibre * (1.0 - uWeave));
      // grade
      c *= vec3(1.0 + uWarmth * 0.10, 1.0 + uWarmth * 0.02, 1.0 - uWarmth * 0.10);
      c = mix(vec3(dot(c, vec3(0.299, 0.587, 0.114))), c, uSat);
      c = (c - 0.5) * uContrast + 0.5;
      vec2 d = vUv - 0.5; d.x *= uRes.x / uRes.y;
      c *= mix(1.0, smoothstep(1.05, 0.25, length(d)), uVignette);
      // grain is fixed to the screen like paper tooth, so a still picture stays perfectly still
      c += (hash(f) - 0.5) * uGrain * 0.06;
      // brightness floor for young viewers: lift only the darkest tones (after the vignette, so corners
      // too), mid-tones and highlights stay almost untouched
      vec3 cc = clamp(c, 0.0, 1.0);
      c = cc + uFloor * pow(1.0 - cc, vec3(3.0));
      float bar = max(0.0, (1.0 - (uRes.x / 2.39) / uRes.y) * 0.5) * uLetterbox;
      if (vUv.y < bar || vUv.y > 1.0 - bar) c = vec3(0.015, 0.012, 0.01);
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
};
