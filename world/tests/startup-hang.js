import { pondRadius } from '../src/world.js';

export async function runStartupHangTests() {
  const a = window.__app, results = [];
  const check = (ok, message) => { if (!ok) throw Error(message); results.push(message); };
  const source = await (await fetch('/src/world.js')).text();
  const start = source.indexOf('function applyUserPads('), end = source.indexOf('// Flat valley floor', start);
  const compile = text => new Function('userPads', 'smoothstep', 'pondRadius', text + '; return applyUserPads;');
  const actual = compile(source.slice(start, end));
  const reference = compile(source.slice(start, end).replace(/    const reach =[^\n]+\n    if \(Math.abs\(x - p.x\)[^\n]+\n/, ''));
  const smoothstep = (lo, hi, v) => { const t = Math.max(0, Math.min(1, (v - lo) / (hi - lo))); return t * t * (3 - 2 * t); };
  const pads = [a.world.hamlet.pad, ...a.world.areaPads];
  const fast = actual(pads, smoothstep, pondRadius), slow = reference(pads, smoothstep, pondRadius);
  let equal = true;
  for (let i = 0; i < 1800; i++) {
    const x = (i * 37 % 1000) - 500, z = (i * 61 % 800) - 400;
    if (fast(7, x, z) !== slow(7, x, z)) equal = false;
  }
  check(equal, 'Distant pad rejection preserves terrain exactly at 1800 points');
  const contains = new Function(source.slice(source.indexOf('const padRotations'), end) + '; return { withinPad, padDistance };')();
  let boundaries = true;
  for (const p of pads) for (const margin of [0, 1, 5]) for (const sign of [-1, 1]) {
    const c = Math.cos(p.yaw), s = Math.sin(p.yaw);
    for (const offset of [-0.001, 0, 0.001]) {
      const dx = sign * (p.hx + margin + offset), dz = p.hz + margin + offset;
      const x = p.x + c * dx + s * dz, z = p.z - s * dx + c * dz;
      if (contains.withinPad(p, x, z, margin) !== (contains.padDistance(p, x, z) < margin)) boundaries = false;
    }
  }
  check(boundaries, 'Plant clearance preserves rotated pad boundaries and margins');
  const p = { x: 0, z: 0, hx: 5, hz: 2, y: 4, blend: 3, yaw: 0 };
  const f = actual([p], smoothstep);
  f(0, 6, 0); p.yaw = Math.PI / 3;
  check(f(0, 6, 0) === reference([p], smoothstep)(0, 6, 0), 'Rotating a pad invalidates its cached rotation');
  const wasActive = a.game.active;
  try {
    a.game.enter();
    const before = a.game.pos.clone(); a.game.keys.add('KeyW');
    for (let i = 0; i < 60; i++) a.game.update(1 / 60);
    check(a.game.pos.toArray().every(Number.isFinite), 'Play movement stays finite');
    check(a.game.pos.distanceTo(before) > 0.1, 'Player moves after entering Play');
  } finally { a.game.keys.clear(); if (!wasActive) a.game.exit(); }
  return { passed: results.length, failed: 0, results };
}
