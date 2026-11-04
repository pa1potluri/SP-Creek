// Joins painted tiles (each one turned ~90° right of the last) into one seamless 360° strip:
// finds every overlap, matches exposure, cuts along the least-visible seam (so nothing is
// doubled or ghosted), and closes the loop so the last tile runs straight into the first.

function canvasOf(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export function tileFromImage(img, height) {
  const w = Math.round((img.width * height) / img.height);
  const c = canvasOf(w, height), x = c.getContext('2d', { willReadFrequently: true });
  x.imageSmoothingQuality = 'high';
  x.drawImage(img, 0, 0, w, height);
  return { canvas: c, w, h: height, data: x.getImageData(0, 0, w, height).data, _f: {} };
}

// Brightness + edge maps at a given scale (cached per tile).
function features(tile, scale) {
  if (tile._f[scale]) return tile._f[scale];
  const w = Math.max(8, Math.round(tile.w * scale)), h = Math.max(8, Math.round(tile.h * scale));
  let data = tile.data;
  if (scale !== 1) {
    const c = canvasOf(w, h), x = c.getContext('2d', { willReadFrequently: true });
    x.imageSmoothingQuality = 'high';
    x.drawImage(tile.canvas, 0, 0, w, h);
    data = x.getImageData(0, 0, w, h).data;
  }
  const lum = new Float32Array(w * h), grad = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) lum[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      grad[i] = Math.abs(lum[i + 1] - lum[i - 1]) + Math.abs(lum[i + w] - lum[i - w]);
    }
  }
  return (tile._f[scale] = { w, h, lum, grad });
}

// How badly A's right edge and B's left edge disagree when B overlaps A by `ov` px and sits `dy` px lower.
// Brightness is compared after removing each side's average, so an exposure difference doesn't matter.
function mismatch(A, B, ov, dy, step) {
  const y0 = Math.max(0, dy), y1 = Math.min(A.h, B.h + dy), ax = A.w - ov;
  let sa = 0, sb = 0, n = 0;
  for (let y = y0; y < y1; y += step) {
    for (let x = 0; x < ov; x += step) {
      sa += A.lum[y * A.w + ax + x];
      sb += B.lum[(y - dy) * B.w + x];
      n++;
    }
  }
  if (n < 40) return Infinity;
  const ma = sa / n, mb = sb / n;
  let e = 0;
  for (let y = y0; y < y1; y += step) {
    for (let x = 0; x < ov; x += step) {
      const ia = y * A.w + ax + x, ib = (y - dy) * B.w + x;
      e += Math.abs(A.lum[ia] - ma - (B.lum[ib] - mb)) + 1.5 * Math.abs(A.grad[ia] - B.grad[ib]);
    }
  }
  return e / n;
}

function search(A, B, [ov0, ov1], [dy0, dy1], step) {
  const maxOv = Math.min(A.w, B.w) - 2;
  let best = { e: Infinity, ov: Math.max(4, ov0), dy: 0 };
  const all = [];
  for (let ov = Math.max(4, ov0); ov <= Math.min(maxOv, ov1); ov++) {
    for (let dy = dy0; dy <= dy1; dy++) {
      const e = mismatch(A, B, ov, dy, step);
      if (e === Infinity) continue;
      all.push(e);
      if (e < best.e) best = { e, ov, dy };
    }
  }
  all.sort((a, b) => a - b);
  best.median = all.length ? all[all.length >> 1] : best.e;
  return best;
}

// Coarse-to-fine search for how tile B continues tile A.
export function findOverlap(ta, tb) {
  const s0 = 160 / ta.h, s1 = Math.min(1, 480 / ta.h);
  const A0 = features(ta, s0), B0 = features(tb, s0);
  const dyMax = Math.round(A0.h * 0.06);
  const coarse = search(A0, B0, [Math.round(A0.w * 0.06), Math.round(Math.min(A0.w, B0.w) * 0.6)], [-dyMax, dyMax], 1);
  let { ov, dy } = coarse;
  let scale = s0;
  for (const [s, step] of [[s1, 2], [1, 3]]) {
    if (s <= scale) continue;
    const k = s / scale, r = Math.ceil(k) + 1;
    const A = features(ta, s), B = features(tb, s);
    const c = Math.round(ov * k), d = Math.round(dy * k);
    ({ ov, dy } = search(A, B, [c - r, c + r], [d - r, d + r], step));
    scale = s;
  }
  return { ov, dy, confidence: Math.max(0, 1 - coarse.e / coarse.median) };
}

// Average colour of both sides of an overlap, for exposure matching.
function overlapMeans(ta, tb, ov, dy) {
  const H = ta.h, ma = [0, 0, 0], mb = [0, 0, 0];
  let n = 0;
  for (let y = Math.max(0, dy); y < Math.min(H, H + dy); y += 4) {
    for (let x = 0; x < ov; x += 4) {
      const ia = (y * ta.w + ta.w - ov + x) * 4, ib = ((y - dy) * tb.w + x) * 4;
      for (let c = 0; c < 3; c++) {
        ma[c] += ta.data[ia + c];
        mb[c] += tb.data[ib + c];
      }
      n++;
    }
  }
  return [ma.map((v) => v / Math.max(1, n)), mb.map((v) => v / Math.max(1, n))];
}

// Cheapest top-to-bottom path through an overlap (dynamic programming). `diff(X, y)` is the
// colour difference between the two sides; the seam stays clear of the overlap's own edges.
function findSeam(x0, ov, H, margin, diff) {
  const seam = new Float32Array(H);
  if (ov < margin * 2 + 6) return seam.fill(x0 + ov / 2);
  const M = new Float32Array(ov * H), from = new Int8Array(ov * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < ov; x++) {
      let c = diff(x0 + x, y);
      if (x < margin || x >= ov - margin) c += 1e5;
      const i = y * ov + x;
      if (y === 0) { M[i] = c; continue; }
      let best = M[i - ov], dir = 0;
      if (x > 0 && M[i - ov - 1] < best) { best = M[i - ov - 1]; dir = -1; }
      if (x < ov - 1 && M[i - ov + 1] < best) { best = M[i - ov + 1]; dir = 1; }
      M[i] = c + best;
      from[i] = dir;
    }
  }
  let x = 0;
  for (let k = 1; k < ov; k++) if (M[(H - 1) * ov + k] < M[(H - 1) * ov + x]) x = k;
  for (let y = H - 1; y >= 0; y--) {
    seam[y] = x0 + x;
    x += from[y * ov + x];
  }
  return seam;
}

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * tiles: from tileFromImage, all the same height, in left-to-right order.
 * opts.overrides[i] = { ov, dy } replaces the automatic match for seam i (tile i → i+1).
 */
export function stitchTiles(tiles, opts = {}) {
  const { loop = true, smartSeam = true, feather = 12, matchColor = true, overrides = [] } = opts;
  const n = tiles.length, H = tiles[0].h;
  const pairs = [];
  for (let i = 0; i < (loop ? n : n - 1); i++) {
    const o = overrides[i];
    pairs.push(o && o.ov > 0 ? { ov: o.ov, dy: o.dy || 0, confidence: null, manual: true } : findOverlap(tiles[i], tiles[(i + 1) % n]));
  }

  // where each tile sits; vertical drift around the loop is spread evenly so the ends meet
  const xs = [0], ys = [0];
  for (let i = 1; i < n; i++) {
    xs.push(xs[i - 1] + tiles[i - 1].w - pairs[i - 1].ov);
    ys.push(ys[i - 1] + pairs[i - 1].dy);
  }
  const Wt = loop ? xs[n - 1] + tiles[n - 1].w - pairs[n - 1].ov : xs[n - 1] + tiles[n - 1].w;
  if (loop) {
    const R = ys[n - 1] + pairs[n - 1].dy;
    for (let i = 0; i < n; i++) ys[i] = Math.round(ys[i] - (R * i) / n);
  }
  const top = Math.max(...ys), Hout = Math.min(...ys) + H - top;

  // exposure: chain the overlap ratios, spread the loop's leftover, keep the average at 1
  let gains = tiles.map(() => [1, 1, 1]);
  if (matchColor) {
    for (let i = 1; i < n; i++) {
      const [ma, mb] = overlapMeans(tiles[i - 1], tiles[i], pairs[i - 1].ov, ys[i] - ys[i - 1]);
      gains[i] = gains[i - 1].map((g, c) => g * (mb[c] > 1 ? ma[c] / mb[c] : 1));
    }
    if (loop) {
      const [ma, mb] = overlapMeans(tiles[n - 1], tiles[0], pairs[n - 1].ov, ys[0] - ys[n - 1]);
      const P = gains[n - 1].map((g, c) => g * (mb[c] > 1 ? ma[c] / mb[c] : 1));
      gains = gains.map((g, i) => g.map((v, c) => v * Math.pow(P[c], -i / n)));
    }
    const avg = [0, 1, 2].map((c) => gains.reduce((s, g) => s + g[c], 0) / n);
    gains = gains.map((g) => g.map((v, c) => v / avg[c]));
  }

  const out = new Uint8ClampedArray(Wt * Hout * 4);
  const tilePx = (i, X, y, c) => {
    const t = tiles[i], tx = X - xs[i], ty = top + y - ys[i];
    return t.data[(ty * t.w + tx) * 4 + c] * gains[i][c];
  };
  const outIdx = (X, y) => (y * Wt + (((X % Wt) + Wt) % Wt)) * 4;
  const diffOut = (i) => (X, y) => {
    const o = outIdx(X, y);
    return Math.abs(out[o] - tilePx(i, X, y, 0)) + Math.abs(out[o + 1] - tilePx(i, X, y, 1)) + Math.abs(out[o + 2] - tilePx(i, X, y, 2));
  };

  for (let i = 0; i < n; i++) {
    const t = tiles[i], x0 = xs[i];
    let left = null, right = null, fl = feather, fr = feather;
    if (i > 0) {
      const ov = pairs[i - 1].ov;
      if (smartSeam) left = findSeam(x0, ov, Hout, feather + 2, diffOut(i));
      else { left = new Float32Array(Hout).fill(x0 + ov / 2); fl = Math.max(feather, ov * 0.4); }
    }
    if (loop && i === n - 1 && n > 1) {
      const ov = pairs[n - 1].ov;
      if (smartSeam) right = findSeam(Wt, ov, Hout, feather + 2, diffOut(i));
      else { right = new Float32Array(Hout).fill(Wt + ov / 2); fr = Math.max(feather, ov * 0.4); }
    }
    for (let y = 0; y < Hout; y++) {
      for (let X = x0; X < x0 + t.w; X++) {
        let a = left ? smooth(left[y] - fl, left[y] + fl, X) : 1;
        if (right) a *= 1 - smooth(right[y] - fr, right[y] + fr, X);
        if (a <= 0) continue;
        const o = outIdx(X, y);
        for (let c = 0; c < 3; c++) out[o + c] = out[o + c] * (1 - a) + tilePx(i, X, y, c) * a;
        out[o + 3] = 255;
      }
    }
  }

  const canvas = canvasOf(Wt, Hout);
  canvas.getContext('2d').putImageData(new ImageData(out, Wt, Hout), 0, 0);
  return { canvas, width: Wt, height: Hout, pairs, gains };
}
