// Music bed + wind + the location soundscape (ambience.js), mixed into one bus that the video
// recorder can capture, and the same mix rendered offline (faster than real time) for MP4 export.
import { Ambience } from './ambience.js';

// wind: seeded brown noise through a low, narrow band-pass and a gentle low-pass. Live, an LFO sweeps it; in a render
// piece starting at video time t0 and lasting dur, the sweep is written out so it carries on
// smoothly from the piece before.
function buildWind(ctx, dest, t0 = null, dur = 0) {
  const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), data = buf.getChannelData(0);
  let last = 0, seed = 731;
  for (let i = 0; i < len; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    last = (last + (seed / 4294967296 * 2 - 1) * 0.02) / 1.02;
    data[i] = last * 2.5;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 220;
  bp.Q.value = 1.0;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 550; lp.Q.value = 0.55;
  src.connect(bp).connect(lp).connect(dest);
  src.start(0, t0 === null ? 0 : ((t0 % 4) + 4) % 4);
  if (t0 !== null) {
    const n = Math.max(2, Math.ceil(dur * 20)), curve = new Float32Array(n);
    for (let i = 0; i < n; i++) curve[i] = 220 + 45 * Math.sin(2 * Math.PI * 0.025 * (t0 + (i / (n - 1)) * dur));
    bp.frequency.setValueCurveAtTime(curve, 0, dur);
    return;
  }
  const lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
  lfo.frequency.value = 0.025;
  lfoGain.gain.value = 45;
  lfo.connect(lfoGain).connect(bp.frequency);
  lfo.start();
}

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.music = null;
    this.musicVol = 0.8;
    this.windVol = 0;
    this.ambVol = 0.8;
    this.frames = null; // listener states recorded while a video renders, one per frame
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const ctx = (this.ctx = new (window.AudioContext || window.webkitAudioContext)());
    this.master = ctx.createGain();
    this.master.connect(ctx.destination);
    this.dest = ctx.createMediaStreamDestination();
    this.master.connect(this.dest);
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = this.musicVol;
    this.musicGain.connect(this.master);
    this.windGain = ctx.createGain();
    this.windGain.gain.value = this.windVol * 0.3;
    this.windGain.connect(this.master);
    buildWind(ctx, this.windGain);
    this.ambGain = ctx.createGain();
    this.ambGain.gain.value = this.ambVol;
    this.ambGain.connect(this.master);
    this.amb = new Ambience(ctx, this.ambGain);
  }

  // Every frame: the soundscape follows where the camera (or player) is and the mood.
  // While a video renders, the state is recorded instead, for renderOffline.
  tick(state, dt) {
    if (this.frames) return this.frames.push(state);
    if (this.amb && this.ctx.state === 'running') this.amb.update(state, this.ctx.currentTime + 0.03, Math.min(dt, 0.1));
  }

  setAmbience(v) {
    this.ambVol = v;
    if (this.ambGain) this.ambGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.3);
  }

  loadMusic(file) {
    this.ensure();
    if (this.music) {
      this.music.el.pause();
      this.music.src.disconnect();
      URL.revokeObjectURL(this.music.el.src);
    }
    const el = new Audio(URL.createObjectURL(file));
    el.loop = true;
    const src = this.ctx.createMediaElementSource(el);
    src.connect(this.musicGain);
    el.play();
    this.music = { el, src, name: file.name, file };
  }

  get musicDuration() {
    const d = this.music ? this.music.el.duration : 0;
    return Number.isFinite(d) ? d : 0;
  }

  restartMusic() {
    if (!this.music) return;
    this.ensure();
    this.music.el.currentTime = 0;
    this.music.el.play();
  }

  // silence the live mix while a video renders (the render makes its own sound)
  pauseLive() {
    if (this.music) this.music.el.pause();
    if (this.ctx) this.ctx.suspend();
  }
  resumeLive() {
    if (this.ctx) this.ctx.resume();
  }

  get hasSound() {
    return !!this.music || this.windVol > 0 || this.ambVol > 0;
  }

  // The same mix (music from the start + wind + the soundscape replayed from the recorded
  // frames, frame i at i/fps) rendered offline, 48 kHz stereo, one piece at a time so hours of
  // sound never sit in memory at once. Each piece starts a little early (PRE seconds, so every
  // level has settled) and runs a little long (FADE seconds), and the overlap is crossfaded.
  async *renderChunks(seconds, frames = [], fps = 30, chunk = 60) {
    const sr = 48000, PRE = 2, FADE = 0.1, nf = Math.round(FADE * sr);
    const music = this.music ? await new OfflineAudioContext(2, sr, sr).decodeAudioData(await this.music.file.arrayBuffer()) : null;
    let tail = null; // the previous piece's overlap
    for (let a = 0; a < seconds; a += chunk) {
      const b = Math.min(seconds, a + chunk), start = Math.max(0, a - PRE), end = b + FADE;
      const ctx = new OfflineAudioContext(2, Math.ceil((end - start) * sr), sr);
      if (music) {
        const src = ctx.createBufferSource(), g = ctx.createGain();
        src.buffer = music;
        src.loop = true;
        g.gain.value = this.musicVol;
        src.connect(g).connect(ctx.destination);
        src.start(0, start % music.duration);
      }
      if (this.windVol > 0) {
        const g = ctx.createGain();
        g.gain.value = this.windVol * 0.3;
        g.connect(ctx.destination);
        buildWind(ctx, g, start, end - start);
      }
      if (frames.length && this.ambVol > 0) {
        const g = ctx.createGain();
        g.gain.value = this.ambVol;
        g.connect(ctx.destination);
        const amb = new Ambience(ctx, g, start);
        const f0 = Math.floor(start * fps), f1 = Math.min(frames.length, Math.ceil(end * fps));
        for (let i = f0; i < f1; i++) amb.update(frames[i], i / fps - start, 1 / fps);
      }
      const full = await ctx.startRendering(), skip = Math.round((a - start) * sr), len = Math.round((b - a) * sr);
      const out = new AudioBuffer({ numberOfChannels: 2, length: len, sampleRate: sr });
      const next = [];
      for (let c = 0; c < 2; c++) {
        const src = full.getChannelData(c), dst = out.getChannelData(c);
        dst.set(src.subarray(skip, skip + len));
        if (tail) for (let i = 0; i < nf && i < len; i++) dst[i] = tail[c][i] + (dst[i] - tail[c][i]) * (i / nf);
        next.push(src.slice(skip + len, skip + len + nf));
      }
      tail = next;
      yield out;
    }
  }

  toggleMusic() {
    if (!this.music) return false;
    const el = this.music.el;
    if (el.paused) el.play();
    else el.pause();
    return !el.paused;
  }

  setMusicVolume(v) {
    this.musicVol = v;
    if (this.musicGain) this.musicGain.gain.value = v;
  }

  setWind(v) {
    this.windVol = v;
    if (this.windGain) this.windGain.gain.setTargetAtTime(v * 0.3, this.ctx.currentTime, 0.8);
  }

  get stream() {
    return this.dest ? this.dest.stream : null;
  }
}
