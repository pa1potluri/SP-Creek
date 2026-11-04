// Local brush history only. World integration must preserve buildings, water and railway grades.
const LIMIT = 128, CELL = 64;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export class TerrainEdits {
  constructor() { this.strokes = []; this.history = []; this.cells = new Map(); }
  _valid(s) {
    return s && ['lower', 'raise', 'flatten', 'soften'].includes(s.mode)
      && [s.x, s.z, s.radius, s.amount].every(Number.isFinite)
      && Math.abs(s.x) <= 740 && Math.abs(s.z) <= 740
      && s.radius >= 2 && s.radius <= 40 && s.amount > 0 && s.amount <= 2
      && (s.mode !== 'flatten' && s.mode !== 'soften' || Number.isFinite(s.target) && Math.abs(s.target) <= 150)
      && (s.mode !== 'soften' || [s.gx, s.gz].every(g => Number.isFinite(g) && Math.abs(g) <= 3));
  }
  _remember() {
    this.history.push(this.strokes.slice());
    if (this.history.length > 32) this.history.shift();
  }
  _index() {
    this.cells.clear();
    for (const s of this.strokes) {
      for (let x = Math.floor((s.x - s.radius) / CELL); x <= Math.floor((s.x + s.radius) / CELL); x++) {
        for (let z = Math.floor((s.z - s.radius) / CELL); z <= Math.floor((s.z + s.radius) / CELL); z++) {
          const key = `${x},${z}`;
          if (!this.cells.has(key)) this.cells.set(key, []);
          this.cells.get(key).push(s);
        }
      }
    }
  }
  add(spec) {
    if (!this._valid(spec) || this.strokes.length >= LIMIT) return false;
    const s = { mode: spec.mode, x: spec.x, z: spec.z, radius: spec.radius, amount: spec.amount };
    if (s.mode === 'flatten' || s.mode === 'soften') s.target = spec.target;
    if (s.mode === 'soften') Object.assign(s, { gx: spec.gx, gz: spec.gz });
    this._remember(); this.strokes.push(s); this._index(); return true;
  }
  apply(height, x, z) {
    if (![height, x, z].every(Number.isFinite)) return height;
    for (const s of this.cells.get(`${Math.floor(x / CELL)},${Math.floor(z / CELL)}`) || []) {
      const u = clamp(1 - Math.hypot(x - s.x, z - s.z) / s.radius, 0, 1);
      const weight = u * u * (3 - 2 * u);
      if (!weight) continue;
      if (s.mode === 'flatten') height += (s.target - height) * weight * s.amount / 2;
      // soften: ease toward a gentler plane through the brush (half of the slope it found)
      else if (s.mode === 'soften') height += (s.target + s.gx * (x - s.x) + s.gz * (z - s.z) - height) * weight * s.amount / 2;
      else height += (s.mode === 'lower' ? -1 : 1) * s.amount * weight;
      height = clamp(height, -150, 150);
    }
    return height;
  }
  undo() {
    if (!this.history.length) return false;
    this.strokes = this.history.pop(); this._index(); return true;
  }
  reset() {
    if (!this.strokes.length) return false;
    this._remember(); this.strokes = []; this._index(); return true;
  }
  serialize() { return { version: 1, strokes: this.strokes.map(s => ({ ...s })) }; }
  load(data) {
    this.history = [];
    this.strokes = [];
    if (data?.version === 1 && Array.isArray(data.strokes)) {
      for (const s of data.strokes) {
        if (this._valid(s) && this.strokes.length < LIMIT) {
          const copy = { mode: s.mode, x: s.x, z: s.z, radius: s.radius, amount: s.amount };
          if (s.mode === 'flatten' || s.mode === 'soften') copy.target = s.target;
          if (s.mode === 'soften') Object.assign(copy, { gx: s.gx, gz: s.gz });
          this.strokes.push(copy);
        }
      }
    }
    this._index();
  }
}
