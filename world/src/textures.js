// Hand-painted canvas textures: boards, shingles, dirt road, signs, shop fronts, glows.
import * as THREE from 'three';

export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const hsl = ([h, s, l], a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
const jit = ([h, s, l], r, amt = 6, a = 1) =>
  `hsla(${h + (r() - 0.5) * amt},${Math.max(0, s + (r() - 0.5) * amt * 1.5)}%,${l + (r() - 0.5) * amt}%,${a})`;

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export function toTexture(c, rx = 1, ry = 1) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  return t;
}

// Loose elliptical brush dabs in a region.
function dabs(ctx, x, y, w, h, n, base, r, size, amt = 10, alpha = 0.3) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = jit(base, r, amt, alpha * (0.4 + r() * 0.8));
    ctx.beginPath();
    ctx.ellipse(x + r() * w, y + r() * h, size * (0.4 + r()), size * (0.12 + r() * 0.3), r() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Vertical weathered boards with grain streaks.
function planks(ctx, x, y, w, h, base, r, step = 14) {
  for (let px = x; px < x + w; px += step) {
    ctx.fillStyle = jit(base, r, 7);
    ctx.fillRect(px, y, step, h);
    ctx.fillStyle = 'rgba(20,12,6,0.35)';
    ctx.fillRect(px, y, 1.5, h);
  }
  for (let i = 0; i < (w * h) / 220; i++) {
    ctx.strokeStyle = jit([base[0], base[1], base[2] - 12], r, 8, 0.25);
    ctx.lineWidth = 1;
    const sx = x + r() * w, sy = y + r() * h;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (r() - 0.5) * 2, sy + 8 + r() * 30);
    ctx.stroke();
  }
}

function fitText(ctx, text, maxW, size) {
  let fs = size;
  do {
    ctx.font = `bold ${fs}px Georgia, "Times New Roman", serif`;
    fs -= 2;
  } while (ctx.measureText(text).width > maxW && fs > 8);
}

export function plankTexture() {
  const r = rng(11), c = makeCanvas(256, 256), x = c.getContext('2d');
  planks(x, 0, 0, 256, 256, [30, 12, 82], r, 16);
  dabs(x, 0, 0, 256, 256, 160, [30, 14, 70], r, 10, 12, 0.25);
  return toTexture(c, 2, 1);
}

export function roofTexture() {
  const r = rng(12), c = makeCanvas(256, 256), x = c.getContext('2d');
  x.fillStyle = '#6d625a';
  x.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 16; row++) {
    const y = row * 16, off = (row % 2) * 10;
    for (let col = -1; col < 14; col++) {
      x.fillStyle = jit([25, 10, 62], r, 10);
      x.fillRect(col * 20 + off, y, 19, 15);
    }
    x.fillStyle = 'rgba(15,10,8,0.45)';
    x.fillRect(0, y + 14, 256, 2);
  }
  dabs(x, 0, 0, 256, 256, 120, [25, 10, 50], r, 12, 12, 0.2);
  return toTexture(c, 3, 3);
}

export function groundDetailTexture() {
  const r = rng(13), c = makeCanvas(256, 256), x = c.getContext('2d');
  x.fillStyle = 'hsl(40,10%,86%)';
  x.fillRect(0, 0, 256, 256);
  dabs(x, -10, -10, 276, 276, 1400, [40, 12, 82], r, 7, 22, 0.35);
  return toTexture(c, 160, 160);
}

export function roadTexture(repeatY) {
  const r = rng(14), W = 256, H = 512, c = makeCanvas(W, H), x = c.getContext('2d');
  x.fillStyle = 'hsl(32,30%,58%)';
  x.fillRect(0, 0, W, H);
  dabs(x, 0, 0, W, H, 900, [32, 28, 56], r, 9, 16, 0.35);
  // wagon ruts
  for (const rx of [0.3, 0.7]) {
    for (let k = 0; k < 3; k++) {
      x.strokeStyle = `hsla(28,25%,${36 + k * 4}%,0.35)`;
      x.lineWidth = 10 - k * 3;
      x.beginPath();
      for (let y = 0; y <= H; y += 16) x.lineTo(W * rx + Math.sin(y * 0.05 + k) * 3, y);
      x.stroke();
    }
  }
  // hoof prints
  for (let i = 0; i < 160; i++) {
    x.fillStyle = `hsla(26,25%,${30 + r() * 15}%,0.4)`;
    x.beginPath();
    x.ellipse(W * (0.4 + r() * 0.2), r() * H, 3, 2, 0, 0, 7);
    x.fill();
  }
  // soft grassy edges
  const g = x.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.2, 'rgba(0,0,0,1)');
  g.addColorStop(0.8, 'rgba(0,0,0,1)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.globalCompositeOperation = 'destination-in';
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'source-over';
  const t = toTexture(c, 1, repeatY);
  t.wrapS = THREE.ClampToEdgeWrapping;
  return t;
}

// Average colour of an image/canvas: what a surface becomes in the flat (toy) look.
function averageRGB(source) {
  const c = makeCanvas(8, 8), x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(source, 0, 0, 8, 8);
  const p = x.getImageData(0, 0, 8, 8).data;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < p.length; i += 4) { r += p[i]; g += p[i + 1]; b += p[i + 2]; }
  const n = p.length / 4;
  return [r / n, g / n, b / n];
}
export function averageColor(tex) {
  if (!tex.userData.avg) {
    const [r, g, b] = averageRGB(tex.image);
    tex.userData.avg = new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
  }
  return tex.userData.avg;
}
export function averageCss(img) {
  const [r, g, b] = averageRGB(img);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

// A painted ground image turned into brush detail: grey, brightened to ~85%, so the terrain's
// own grass/dirt colours stay but gain the painting's strokes.
export function groundDetailFromImage(img, repeat) {
  const S = 512, c = makeCanvas(S, S), x = c.getContext('2d');
  x.drawImage(img, 0, 0, S, S);
  const d = x.getImageData(0, 0, S, S), p = d.data;
  let sum = 0;
  for (let i = 0; i < p.length; i += 4) sum += 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
  const k = (0.85 * 255) / (sum / (p.length / 4));
  for (let i = 0; i < p.length; i += 4) {
    const l = Math.min(255, (0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]) * k);
    p[i] = p[i + 1] = p[i + 2] = l;
  }
  x.putImageData(d, 0, 0);
  return toTexture(c, repeat, repeat);
}

// A painted dirt-road image as the road strip, with the same soft grassy edges as the built-in one.
export function roadFromImage(img, repeatY) {
  const W = 256, H = 512, c = makeCanvas(W, H), x = c.getContext('2d');
  x.drawImage(img, 0, 0, W, W);
  x.drawImage(img, 0, W, W, W);
  const g = x.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.2, 'rgba(0,0,0,1)');
  g.addColorStop(0.8, 'rgba(0,0,0,1)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.globalCompositeOperation = 'destination-in';
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  const t = toTexture(c, 1, repeatY);
  t.wrapS = THREE.ClampToEdgeWrapping;
  return t;
}

// The back-bar mirror: smoky glass with soft diagonal reflections in a carved gilt frame.
export function mirrorTexture() {
  const r = rng(20), W = 512, H = 160, c = makeCanvas(W, H), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, 'hsl(200,12%,38%)');
  g.addColorStop(0.5, 'hsl(30,18%,26%)');
  g.addColorStop(1, 'hsl(210,15%,32%)');
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  for (let i = 0; i < 9; i++) {
    x.fillStyle = `hsla(40,30%,85%,${0.05 + r() * 0.1})`;
    const sx = r() * W;
    x.beginPath();
    x.moveTo(sx, 0); x.lineTo(sx + 30 + r() * 40, 0); x.lineTo(sx - 40, H); x.lineTo(sx - 70 - r() * 40, H);
    x.fill();
  }
  dabs(x, 0, 0, W, H, 120, [200, 10, 40], r, 10, 12, 0.15);
  x.strokeStyle = 'hsl(42,65%,45%)';
  x.lineWidth = 16;
  x.strokeRect(8, 8, W - 16, H - 16);
  x.strokeStyle = 'hsl(38,55%,28%)';
  x.lineWidth = 4;
  x.strokeRect(18, 18, W - 36, H - 36);
  return toTexture(c);
}

// A painted image (e.g. made in ChatGPT) as a repeating texture.
export function imageTexture(img, rx = 1, ry = 1) {
  const t = new THREE.Texture(img);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

// Café wallpaper: deep red damask stripes above a dark wooden wainscot (bottom 15%).
export function wallpaperTexture() {
  const r = rng(18), W = 256, H = 512, c = makeCanvas(W, H), x = c.getContext('2d');
  x.fillStyle = 'hsl(355,45%,24%)';
  x.fillRect(0, 0, W, H);
  for (let i = 0; i < 8; i++) {
    x.fillStyle = i % 2 ? 'hsla(355,45%,30%,0.9)' : 'hsla(40,40%,45%,0.18)';
    x.fillRect(i * 32 + 4, 0, 24, H);
  }
  for (let y = 20; y < H * 0.85; y += 48) {
    for (let i = 0; i < 8; i++) {
      x.fillStyle = 'hsla(42,55%,55%,0.35)';
      x.beginPath();
      x.ellipse(i * 32 + 16, y, 5, 9, 0, 0, Math.PI * 2);
      x.fill();
    }
  }
  dabs(x, 0, 0, W, H * 0.85, 300, [355, 40, 26], r, 8, 10, 0.25);
  planks(x, 0, H * 0.85, W, H * 0.15, [25, 35, 20], r, 16);
  x.fillStyle = 'hsl(30,30%,12%)';
  x.fillRect(0, H * 0.85 - 6, W, 8);
  return toTexture(c, 5, 1);
}

export function rugTexture() {
  const r = rng(19), c = makeCanvas(256, 384), x = c.getContext('2d');
  x.fillStyle = 'hsl(5,50%,32%)';
  x.fillRect(0, 0, 256, 384);
  x.strokeStyle = 'hsl(40,55%,55%)';
  x.lineWidth = 10;
  x.strokeRect(14, 14, 228, 356);
  x.strokeStyle = 'hsl(210,35%,30%)';
  x.lineWidth = 6;
  x.strokeRect(34, 34, 188, 316);
  x.fillStyle = 'hsl(40,50%,50%)';
  for (const [cx, cy] of [[128, 110], [128, 192], [128, 274]]) {
    x.beginPath();
    x.moveTo(cx, cy - 30); x.lineTo(cx + 30, cy); x.lineTo(cx, cy + 30); x.lineTo(cx - 30, cy);
    x.fill();
  }
  dabs(x, 0, 0, 256, 384, 300, [5, 40, 30], r, 6, 12, 0.25);
  return toTexture(c);
}

// Small framed picture: a little landscape painting.
export function pictureTexture(kind, seed = 1) {
  const r = rng(seed), c = makeCanvas(160, 200), x = c.getContext('2d');
  const sky = x.createLinearGradient(0, 0, 0, 130);
  sky.addColorStop(0, 'hsl(205,40%,55%)');
  sky.addColorStop(1, 'hsl(35,60%,72%)');
  x.fillStyle = sky;
  x.fillRect(0, 0, 160, 200);
  x.fillStyle = 'hsl(260,15%,45%)';
  x.beginPath(); x.moveTo(0, 130); for (let i = 0; i <= 8; i++) x.lineTo(i * 20, 90 + r() * 35); x.lineTo(160, 200); x.lineTo(0, 200); x.fill();
  x.fillStyle = 'hsl(70,35%,35%)';
  x.fillRect(0, 140, 160, 60);
  dabs(x, 0, 0, 160, 200, 200, [40, 30, 50], r, 7, 20, 0.25);
  x.strokeStyle = 'hsl(40,60%,40%)';
  x.lineWidth = 12;
  x.strokeRect(0, 0, 160, 200);
  return toTexture(c);
}

// Light water with long horizontal ripple strokes (tinted by the material colour).
export function waterTexture() {
  const r = rng(16), c = makeCanvas(256, 256), x = c.getContext('2d');
  x.fillStyle = 'hsl(200,15%,72%)';
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 220; i++) {
    const y = r() * 256, w = 20 + r() * 90, px = r() * 256;
    x.fillStyle = r() < 0.5 ? `hsla(200,25%,${85 + r() * 15}%,0.45)` : `hsla(210,25%,${45 + r() * 15}%,0.35)`;
    for (const o of [-256, 0, 256]) {
      x.beginPath();
      x.ellipse(px + o, y, w / 2, 1.2 + r() * 2, 0, 0, Math.PI * 2);
      x.fill();
    }
  }
  return toTexture(c, 1, 1);
}

// Grey railway gravel with soft edges.
export function gravelTexture(repeatY) {
  const r = rng(17), W = 128, H = 256, c = makeCanvas(W, H), x = c.getContext('2d');
  x.fillStyle = 'hsl(30,8%,48%)';
  x.fillRect(0, 0, W, H);
  dabs(x, 0, 0, W, H, 1600, [30, 8, 46], r, 3, 22, 0.5);
  const g = x.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.18, 'rgba(0,0,0,1)');
  g.addColorStop(0.82, 'rgba(0,0,0,1)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.globalCompositeOperation = 'destination-in';
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  const t = toTexture(c, 1, repeatY);
  t.wrapS = THREE.ClampToEdgeWrapping;
  return t;
}

export function glowTexture() {
  const c = makeCanvas(128, 128), x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function puffTexture() {
  const r = rng(15), c = makeCanvas(128, 128), x = c.getContext('2d');
  for (let i = 0; i < 14; i++) {
    const px = 64 + (r() - 0.5) * 44, py = 64 + (r() - 0.5) * 44, rad = 18 + r() * 26;
    const g = x.createRadialGradient(px, py, 0, px, py, rad);
    g.addColorStop(0, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function flameTexture() {
  const c = makeCanvas(64, 128), x = c.getContext('2d');
  x.save();
  x.translate(32, 84);
  x.scale(1, 2.2);
  const g = x.createRadialGradient(0, 0, 0, 0, 0, 28);
  g.addColorStop(0, 'rgba(255,240,190,1)');
  g.addColorStop(0.35, 'rgba(255,170,60,0.85)');
  g.addColorStop(0.7, 'rgba(220,70,20,0.35)');
  g.addColorStop(1, 'rgba(120,20,0,0)');
  x.fillStyle = g;
  x.beginPath();
  x.arc(0, 0, 28, 0, Math.PI * 2);
  x.fill();
  x.restore();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function signTexture(text, w = 640, h = 112, bg = [28, 35, 30], ink = '#f0e2bd') {
  const r = rng(text.length * 31 + 7), c = makeCanvas(w, h), x = c.getContext('2d');
  planks(x, 0, 0, w, h, bg, r, 30);
  x.strokeStyle = 'hsl(30,25%,18%)';
  x.lineWidth = 8;
  x.strokeRect(4, 4, w - 8, h - 8);
  fitText(x, text, w * 0.86, h * 0.62);
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = 'rgba(0,0,0,0.4)';
  x.fillText(text, w / 2 + 3, h / 2 + 4);
  x.fillStyle = ink;
  x.fillText(text, w / 2, h / 2 + 1);
  return toTexture(c);
}

// A shop front: boards, trim, sign, door, windows. Returns colour map + window-glow map.
export function facadeTextures(s) {
  const ppm = 40, W = Math.round(s.w * ppm), H = Math.round(s.fh * ppm);
  const r = rng(s.seed || 1);
  const c = makeCanvas(W, H), x = c.getContext('2d');
  const e = makeCanvas(W, H), ex = e.getContext('2d');
  ex.fillStyle = '#000';
  ex.fillRect(0, 0, W, H);
  if (s.signOnly) return { map: signTexture(s.sign, W, H, s.signBg, s.signInk), emissive: toTexture(e) };
  const Y = (m) => H - m * ppm, X = (m) => m * ppm;

  if (s.flat) {
    // toy look: one solid colour with faint board lines
    x.fillStyle = s.flatFill || hsl(s.wall);
    x.fillRect(0, 0, W, H);
    x.fillStyle = 'rgba(0,0,0,0.12)';
    for (let px = 0; px < W; px += 28) x.fillRect(px, 0, 2, H);
  } else if (s.base) {
    // a painted board texture (from ChatGPT) tiled every ~4 m instead of the code-made planks
    const tile = 4 * ppm;
    for (let ty = H; ty > -tile; ty -= tile) for (let tx = 0; tx < W; tx += tile) x.drawImage(s.base, tx, ty - tile, tile, tile);
    if (s.tint) {
      // shared pale boards, coloured like this building (brightened, as multiply darkens)
      const [h, sa, l] = s.tint;
      x.globalCompositeOperation = 'multiply';
      x.fillStyle = hsl([h, sa, Math.min(96, l / 0.75)]);
      x.fillRect(0, 0, W, H);
      x.globalCompositeOperation = 'source-over';
    }
  } else {
    planks(x, 0, 0, W, H, s.wall, r);
    dabs(x, 0, 0, W, H, Math.round((W * H) / 500), s.wall, r, 10, 14, 0.22);
  }
  const wg = x.createLinearGradient(0, H - 70, 0, H);
  wg.addColorStop(0, 'rgba(60,40,25,0)');
  wg.addColorStop(1, 'rgba(60,40,25,0.45)');
  x.fillStyle = wg;
  x.fillRect(0, H - 70, W, 70);
  x.fillStyle = hsl(s.trim);
  x.fillRect(0, 0, 9, H);
  x.fillRect(W - 9, 0, 9, H);
  x.fillRect(0, 0, W, 14);
  x.fillStyle = 'rgba(0,0,0,0.25)';
  x.fillRect(0, 14, W, 4);

  const glass = (px, py, pw, ph, lit = r() < 0.85) => {
    const g = x.createLinearGradient(px, py, px + pw, py + ph);
    g.addColorStop(0, 'hsl(210,22%,22%)');
    g.addColorStop(0.6, 'hsl(30,30%,24%)');
    g.addColorStop(1, 'hsl(35,45%,38%)');
    x.fillStyle = g;
    x.fillRect(px, py, pw, ph);
    if (lit) {
      const warm = 45 + r() * 20;
      const eg = ex.createLinearGradient(px, py, px, py + ph);
      eg.addColorStop(0, `hsl(34,95%,${warm}%)`);
      eg.addColorStop(1, `hsl(24,90%,${warm - 18}%)`);
      ex.fillStyle = eg;
      ex.fillRect(px, py, pw, ph);
    }
  };

  const windowAt = (cx, bottom, ww, wh) => {
    const pw = X(ww), ph = X(wh), px = X(cx) - pw / 2, py = Y(bottom + wh);
    if (!s.flat && s.windowImage) {
      x.drawImage(s.windowImage, px, py, pw, ph);
      ex.save();
      ex.beginPath();
      for (const left of [0.25, 0.52]) for (const top of [0.18, 0.42, 0.63]) ex.rect(px + pw * left, py + ph * top, pw * 0.23, ph * 0.18);
      ex.clip();
      ex.drawImage(s.windowImage, px, py, pw, ph);
      ex.restore();
      return;
    }
    x.fillStyle = hsl(s.trim);
    x.fillRect(px - 6, py - 8, pw + 12, ph + 14);
    glass(px, py, pw, ph);
    x.fillStyle = jit([r() < 0.5 ? 0 : 40, 40, 40], r, 10, 0.75);
    x.fillRect(px, py, pw * 0.18, ph);
    x.fillRect(px + pw * 0.82, py, pw * 0.18, ph);
    ex.fillStyle = 'rgba(0,0,0,0.7)';
    ex.fillRect(px, py, pw * 0.18, ph);
    ex.fillRect(px + pw * 0.82, py, pw * 0.18, ph);
    for (const ctx of [x, ex]) {
      ctx.fillStyle = ctx === x ? hsl(s.trim) : '#000';
      ctx.fillRect(px + pw / 2 - 2, py, 4, ph);
      ctx.fillRect(px, py + ph / 2 - 2, pw, 4);
    }
  };

  const door = (cx, ww, wh, kind) => {
    const pw = X(ww), ph = X(wh), px = X(cx) - pw / 2, py = Y(wh);
    if (!s.flat && s.doorImage) {
      x.drawImage(s.doorImage, px, py, pw, ph);
      return;
    }
    x.fillStyle = hsl(s.trim);
    x.fillRect(px - 7, py - 9, pw + 14, ph + 9);
    if (kind === 'batwing') {
      x.fillStyle = 'hsl(25,40%,14%)';
      x.fillRect(px, py, pw, ph);
      ex.fillStyle = 'hsl(30,90%,42%)';
      ex.fillRect(px, py, pw, ph);
      const dy = Y(1.9), dh = X(1.15);
      x.fillStyle = hsl([s.wall[0], s.wall[1], s.wall[2] - 8]);
      x.fillRect(px + 2, dy, pw / 2 - 3, dh);
      x.fillRect(px + pw / 2 + 1, dy, pw / 2 - 3, dh);
      ex.fillStyle = '#000';
      ex.fillRect(px + 2, dy, pw / 2 - 3, dh);
      ex.fillRect(px + pw / 2 + 1, dy, pw / 2 - 3, dh);
    } else if (kind === 'barn') {
      x.fillStyle = hsl([s.wall[0], s.wall[1], s.wall[2] - 6]);
      x.fillRect(px, py, pw, ph);
      x.strokeStyle = hsl(s.trim);
      x.lineWidth = 7;
      for (const hx of [px, px + pw / 2]) {
        x.strokeRect(hx + 4, py + 4, pw / 2 - 8, ph - 4);
        x.beginPath();
        x.moveTo(hx + 4, py + 4);
        x.lineTo(hx + pw / 2 - 4, py + ph);
        x.moveTo(hx + pw / 2 - 4, py + 4);
        x.lineTo(hx + 4, py + ph);
        x.stroke();
      }
    } else {
      if (kind === 'arch') {
        x.fillStyle = hsl(s.trim);
        x.beginPath();
        x.arc(px + pw / 2, py, pw / 2 + 7, Math.PI, 0);
        x.fill();
        x.fillStyle = 'hsl(25,30%,20%)';
        x.beginPath();
        x.arc(px + pw / 2, py, pw / 2, Math.PI, 0);
        x.fill();
      }
      planks(x, px, py, pw, ph, [25, 30, 24], r, 10);
      x.fillStyle = 'hsl(45,60%,55%)';
      x.beginPath();
      x.arc(px + pw * 0.82, py + ph * 0.55, 3, 0, 7);
      x.fill();
    }
  };

  if (s.sign) {
    const sw = Math.min(W - 40, X(Math.max(4, s.w * 0.86))), sh = X(1.0), sx = (W - sw) / 2, sy = X(0.45);
    x.fillStyle = 'rgba(0,0,0,0.3)';
    x.fillRect(sx + 4, sy + 5, sw, sh);
    x.fillStyle = hsl(s.signBg);
    x.fillRect(sx, sy, sw, sh);
    dabs(x, sx, sy, sw, sh, 60, s.signBg, r, 8, 10, 0.25);
    x.strokeStyle = hsl(s.trim);
    x.lineWidth = 5;
    x.strokeRect(sx + 4, sy + 4, sw - 8, sh - 8);
    fitText(x, s.sign, sw * 0.88, sh * 0.6);
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillStyle = 'rgba(0,0,0,0.35)';
    x.fillText(s.sign, W / 2 + 2, sy + sh / 2 + 3);
    x.fillStyle = s.signInk;
    x.fillText(s.sign, W / 2, sy + sh / 2 + 1);
  }

  if (s.barn) door(s.w / 2, 3.4, 3.6, 'barn');
  else door(s.w / 2, s.batwing ? 1.7 : 1.2, 2.5, s.batwing ? 'batwing' : s.church ? 'arch' : 'plain');
  if ((!s.barn || s.buildArt) && s.w >= 7) {
    const off = s.w * 0.29;
    windowAt(s.w / 2 - off, 0.85, 1.4, 1.8);
    windowAt(s.w / 2 + off, 0.85, 1.4, 1.8);
  }
  if (s.floors === 2) {
    const n = Math.max(2, Math.floor(s.w / 2.8));
    for (let i = 0; i < n; i++) windowAt(((i + 0.5) * s.w) / n, 4.15, 0.95, 1.5);
  }
  if (s.church) {
    const cx = X(s.w / 2), cy = Y(5.3), rad = X(0.7);
    x.fillStyle = hsl(s.trim);
    x.beginPath();
    x.arc(cx, cy, rad + 7, 0, 7);
    x.fill();
    glass(cx - rad * 0.72, cy - rad * 0.72, rad * 1.44, rad * 1.44, true);
  }
  return { map: toTexture(c), emissive: toTexture(e) };
}
