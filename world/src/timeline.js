// A video as a list of clips: which shot, how long, which mood, and how we get there
// (glide over the rooftops or a straight cut). Plays the same way every time.
export class Timeline {
  constructor(director, atmos) {
    this.director = director;
    this.atmos = atmos;
    this.clips = []; // { shot: index | 'custom', seconds, mood: preset key | 'keep', move: 'fly' | 'cut' }
    this.loop = false; // start over after the last clip (long background videos)
    this.playing = false;
    this.t = 0;
    this.index = -1;
    this.onClip = () => {};
  }

  get total() {
    return this.clips.reduce((s, c) => s + Math.max(0.5, +c.seconds || 0), 0);
  }

  clipAt(t) {
    let end = 0;
    for (let i = 0; i < this.clips.length; i++) {
      end += Math.max(0.5, +this.clips[i].seconds || 0);
      if (t < end) return i;
    }
    return this.clips.length - 1;
  }

  start() {
    if (!this.clips.length) return false;
    this.playing = true;
    this.t = 0;
    this.director.locked = true;
    this._enter(0, true);
    return true;
  }

  stop() {
    this.playing = false;
    this.index = -1;
    this.director.locked = false;
    this.director.hold = false;
    this.director.shotSpeed = 1;
  }

  update(dt) {
    if (!this.playing) return null;
    this.t += dt;
    if (this.t >= this.total) {
      if (!this.loop) {
        this.stop();
        return 'ended';
      }
      this.t %= this.total; // back to the first clip, the way its "move" says (fly or cut)
    }
    const i = this.clipAt(this.t);
    if (i !== this.index || (this.loop && this.clips.length === 1 && this.t < dt)) this._enter(i, false);
    return null;
  }

  _enter(i, first) {
    const c = this.clips[i];
    this.index = i;
    if (c.mood && c.mood !== 'keep') this.atmos.setPreset(c.mood, first);
    // natural: play the shot at its own calm speed and just cut after `seconds` (tours of long paths)
    this.director.playShot(c.shot, { cut: first || c.move === 'cut', fitTo: c.natural ? 0 : Math.max(0.5, +c.seconds || 0) });
    this.onClip(i);
  }

  // Stretch or squeeze every clip by the same factor so the video lasts `seconds`.
  fitTo(seconds) {
    const k = seconds / (this.total || 1);
    for (const c of this.clips) c.seconds = Math.round(c.seconds * k * 10) / 10;
  }

  toJSON() {
    return this.clips.map(({ shot, seconds, mood, move, natural }) => ({ shot, seconds, mood, move, ...(natural ? { natural } : {}) }));
  }
}
