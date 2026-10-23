// A peaceful soundscape synthesized on the fly (no sound files): birdsong by day, crickets and owls
// at night, the river, the mill wheel, the steam train, a honky-tonk piano in the saloon, and rain.
// Everything follows a listener state (where the camera or player is, which way it faces, the mood).
// update(state, when, dt) is called every frame: live with the AudioContext clock, or, for a video,
// once per recorded frame on an OfflineAudioContext, so the render sounds exactly like the shot.
import { riverZ } from './world.js';
import { OLD_HOLLOW } from './areas/ghost-town.js';
import { FOREST } from './areas/forest.js';
import { LAKE } from './areas/meadow-lake.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
// 1 close by, fading to 0 between near and far (metres)
const near = (d, n, f) => 1 - smooth(n, f, d);

const MILL = { x: 48, z: riverZ(48) + 8 };
const SALOON = { x: 7.3, z: 8 };
const STATION = { x: 66, z: 10 };

// ---------- sample buffers, made once per AudioContext ----------
function noise(ctx, seconds, kind) {
  const len = Math.floor(ctx.sampleRate * seconds), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === 'pink') {
      b0 = 0.99765 * b0 + w * 0.099;
      b1 = 0.963 * b1 + w * 0.2965;
      b2 = 0.57 * b2 + w * 1.0526;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.25;
    } else if (kind === 'brown') {
      last = (last + w * 0.02) / 1.02;
      d[i] = last * 3.5;
    } else d[i] = w * 0.5;
  }
  return buf;
}

// A field of crickets: each chirps three quick pulses of a high tone, on its own rhythm.
function crickets(ctx, seconds) {
  const sr = ctx.sampleRate, len = Math.floor(sr * seconds), buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
  for (let c = 0; c < 7; c++) {
    const f = 4200 + Math.random() * 1100, period = 0.55 + Math.random() * 0.6, amp = 0.05 + Math.random() * 0.08, off = Math.random() * period;
    for (let start = off; start < seconds; start += period * (0.9 + Math.random() * 0.2)) {
      for (let p = 0; p < 3; p++) {
        const s0 = Math.floor((start + p * 0.045) * sr), n = Math.floor(0.028 * sr);
        for (let i = 0; i < n && s0 + i < len; i++) d[s0 + i] += Math.sin((2 * Math.PI * f * (s0 + i)) / sr) * amp * Math.sin((Math.PI * i) / n);
      }
    }
  }
  return buf;
}

// ---------- the soundscape ----------
export class Ambience {
  // t0: the video time at which this context's clock reads 0 (a long render is mixed in pieces,
  // and the piano keeps its beat across them)
  constructor(ctx, out, t0 = 0) {
    this.t0 = t0;
    this.ctx = ctx;
    this.out = out;
    this.buf = { white: noise(ctx, 3, 'white'), pink: noise(ctx, 6, 'pink'), crickets: crickets(ctx, 6) };
    // continuous beds, each with its own gain (and a panner where it has a direction)
    this.river = this._bed(this.buf.pink, [['highpass', 220], ['lowpass', 1600]], true);
    this.rain = this._bed(this.buf.white, [['highpass', 1100], ['lowpass', 7000]]);
    this.cricket = this._bed(this.buf.crickets, [['highpass', 3000]]);
    this.steam = this._bed(this.buf.white, [['bandpass', 2600, 0.8]], true);
    // the piano and the train get buses whose tone and direction change with where you are
    this.piano = this._bus(true);
    this.train = this._bus(true);
    this.mill = this._bus(true);
    this.birds = this._bus(false);
    this.oldHollow = this._bus(true);
    this.oldTimers = { chime:4, creak:7, hum:2, giggle:13 };
    this.forestLeaves=this._bed(this.buf.pink,[['highpass',500],['lowpass',1800]],true);
    this.forestOwl=this._bus(true);this.nextForestOwl=8;this.forestOwlIndex=0;
    this.waterfall=this._bed(this.buf.pink,[['highpass',250],['lowpass',2200]],true);
    this.meadowLife=this._bus(true);this.nextDuck=9;this.nextMeadowBird=5;
    this.nextBird = 0;
    this.nextOwl = 3;
    this.nextSplash = 0;
    this.nextChuff = 0;
    this.nextBeat = 0;
    this.beat = 0;
    this.lastTrain = null;
  }

  _bed(buffer, filters, panned = false) {
    const ctx = this.ctx, src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = buffer;
    src.loop = true;
    src.loopStart = 0;
    src.loopEnd = buffer.duration;
    let node = src;
    for (const [type, f, q] of filters) {
      const flt = ctx.createBiquadFilter();
      flt.type = type;
      flt.frequency.value = f;
      if (q) flt.Q.value = q;
      node.connect(flt);
      node = flt;
    }
    g.gain.value = 0;
    node.connect(g);
    let pan = null;
    if (panned) {
      pan = ctx.createStereoPanner();
      g.connect(pan).connect(this.out);
    } else g.connect(this.out);
    src.start(0, Math.random() * buffer.duration);
    return { g, pan };
  }

  _bus(panned) {
    const ctx = this.ctx, g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 12000;
    g.gain.value = 0;
    g.connect(lp);
    let pan = null;
    if (panned) {
      pan = ctx.createStereoPanner();
      lp.connect(pan).connect(this.out);
    } else lp.connect(this.out);
    return { g, lp, pan };
  }

  // -1 left … 1 right, from where the sound is relative to where the listener faces
  _panTo(s, x, z) {
    const dx = x - s.x, dz = z - s.z, d = Math.hypot(dx, dz) || 1;
    return clamp(((dx * s.rx + dz * s.rz) / d) * 0.85, -1, 1);
  }

  update(s, when, dt) {
    const set = (param, v, tc = 0.25) => param.setTargetAtTime(v, when, tc);
    const town = Math.hypot(s.x, s.z * 0.55); // 0 in the square, growing out of town
    const nature = smooth(25, 90, town);
    const indoors = s.inside ? 1 : 0;
    const roofed = 1 - 0.65 * indoors; // walls soften everything from outside

    // river: from its nearest bank, louder closer
    const rd = Math.abs(s.z - s.riverZ);
    set(this.river.g.gain, 0.5 * near(rd, 10, 130) * roofed);
    set(this.river.pan.pan, this._panTo(s, s.x, s.riverZ));
    // rain, crickets
    set(this.rain.g.gain, 0.32 * s.rain * (indoors ? 0.45 : 1));
    set(this.cricket.g.gain, 0.5 * s.night * (1 - s.rain) * (0.35 + 0.65 * nature) * roofed);

    // birds by day: a call now and then, more out in the fields and woods
    const birdRate = s.day * (1 - s.rain) * (0.15 + 0.6 * nature) * roofed;
    this.nextBird -= dt * birdRate;
    if (this.nextBird <= 0) {
      this.nextBird = 0.6 + Math.random() * 2.2;
      if (birdRate > 0.02) this._bird(when, 0.04 + Math.random() * 0.08 * (0.5 + nature));
    }
    set(this.birds.g.gain, 1, 0.05);
    // an owl at night
    this.nextOwl -= dt * s.night * (0.3 + 0.7 * nature);
    if (this.nextOwl <= 0) {
      this.nextOwl = 14 + Math.random() * 18;
      if (s.night > 0.4) this._owl(when, 0.09 * roofed);
    }

    // mill wheel: paddles slapping the water
    const md = Math.hypot(s.x - MILL.x, s.z - MILL.z), mg = near(md, 6, 70) * roofed;
    set(this.mill.g.gain, mg * 0.6);
    set(this.mill.pan.pan, this._panTo(s, MILL.x, MILL.z));
    this.nextSplash -= dt;
    if (this.nextSplash <= 0) {
      this.nextSplash = 0.85 + Math.random() * 0.25;
      if (mg > 0.01) this._splash(when);
    }

    // saloon piano: clear inside, muffled through the walls from the street
    const sal = s.saloon || SALOON, pd = Math.hypot(s.x - sal.x, s.z - sal.z);
    const pg = indoors ? 0.55 : 0.4 * near(pd, 4, 55);
    set(this.piano.g.gain, pg);
    set(this.piano.lp.frequency, indoors ? 9000 : 1300);
    set(this.piano.pan.pan, indoors ? 0 : this._panTo(s, sal.x, sal.z));
    this._pianoUntil(when + 0.15, pg > 0.005);

    // steam train
    this._train(s, when, dt, set, roofed);
    const gd = Math.hypot(s.x-OLD_HOLLOW.x,s.z-OLD_HOLLOW.z), gg = near(gd,10,42)*roofed;
    set(this.oldHollow.g.gain,gg*0.18,0.8);
    set(this.oldHollow.pan.pan,this._panTo(s,OLD_HOLLOW.x,OLD_HOLLOW.z));
    if(gg>0.01)this._oldHollowSounds(when,dt);
    const forestGain=near(Math.hypot(s.x-FOREST.x,s.z-FOREST.z),12,65)*roofed;
    set(this.forestLeaves.g.gain,forestGain*0.07,0.7);set(this.forestLeaves.pan.pan,this._panTo(s,FOREST.x,FOREST.z));
    set(this.forestOwl.g.gain,forestGain*s.night*0.4,0.7);
    this.nextForestOwl-=dt;if(this.nextForestOwl<=0){this.nextForestOwl=19;const i=this.forestOwlIndex++%3;set(this.forestOwl.pan.pan,this._panTo(s,FOREST.x-8+i*8,FOREST.z-10));if(forestGain>0.01&&s.night>0.3)this._owl(when,0.065,this.forestOwl.g);}
    const meadowGain=near(Math.hypot(s.x-LAKE.x,s.z-LAKE.z),10,75)*roofed;
    set(this.waterfall.g.gain,meadowGain*0.22,0.7);set(this.waterfall.pan.pan,this._panTo(s,-250,-23));set(this.meadowLife.g.gain,meadowGain*0.3,0.7);set(this.meadowLife.pan.pan,this._panTo(s,LAKE.x,LAKE.z));
    this.nextDuck-=dt;this.nextMeadowBird-=dt;
    if(this.nextDuck<=0){this.nextDuck=21;if(meadowGain>0.01)for(let i=0;i<2;i++)this._tone('triangle',when+i*0.35,0.3,440,330,0.025,this.meadowLife.g,0.09);}
    if(this.nextMeadowBird<=0){this.nextMeadowBird=14;if(meadowGain>0.01&&s.day>0.3)this._tone('sine',when,0.45,2400,3100,0.035,this.meadowLife.g,0.1);}
  }

  _oldHollowSounds(when,dt) {
    const bus=this.oldHollow.g;
    for(const key of Object.keys(this.oldTimers))this.oldTimers[key]-=dt;
    if(this.oldTimers.chime<=0){this.oldTimers.chime=12;[660,880,990].forEach((f,i)=>this._tone('sine',when+i*0.4,1.8,f,f,0.035,bus,0.12));}
    if(this.oldTimers.creak<=0){this.oldTimers.creak=17;this._tone('triangle',when,1.4,210,245,0.018,bus,0.35);}
    if(this.oldTimers.hum<=0){this.oldTimers.hum=23;[392,494].forEach(f=>this._tone('sine',when,2.8,f,f*1.01,0.025,bus,0.7));}
    if(this.oldTimers.giggle<=0){this.oldTimers.giggle=29;[660,784,740].forEach((f,i)=>this._tone('sine',when+i*0.28,0.35,f,f*1.08,0.022,bus,0.1));}
  }

  // ---------- one-off sounds ----------
  _tone(type, when, dur, f0, f1, gain, dest, attack = 0.01) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, when);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, when + dur);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g).connect(dest);
    o.start(when);
    o.stop(when + dur + 0.05);
  }

  _burst(when, dur, type, freq, gain, dest, q = 1) {
    const ctx = this.ctx, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = this.buf.white;
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(f).connect(g).connect(dest);
    src.start(when, Math.random() * 2);
    src.stop(when + dur + 0.05);
  }

  // Three kinds of call: a rising whistle, a quick trill, a falling meadowlark phrase.
  _bird(when, gain) {
    const ctx = this.ctx, p = ctx.createStereoPanner();
    p.pan.value = Math.random() * 1.6 - 0.8;
    p.connect(this.birds.g);
    const kind = Math.floor(Math.random() * 3);
    let t = when;
    if (kind === 0) {
      const f = 2600 + Math.random() * 900;
      this._tone('sine', t, 0.14, f, f * 1.35, gain, p);
      this._tone('sine', t + 0.2, 0.12, f * 1.25, f * 1.1, gain * 0.8, p);
    } else if (kind === 1) {
      const f = 3800 + Math.random() * 900;
      for (let i = 0; i < 6 + Math.floor(Math.random() * 5); i++, t += 0.055) this._tone('sine', t, 0.04, f, f * 0.92, gain * 0.7, p, 0.004);
    } else {
      const notes = [3400, 4000, 3600, 2800, 2500].map((f) => f * (0.9 + Math.random() * 0.2));
      for (const f of notes) {
        this._tone('sine', t, 0.13, f, f * 0.96, gain, p);
        t += 0.15;
      }
    }
  }

  _owl(when, gain, dest = this.out) {
    const p = this.ctx.createStereoPanner();
    p.pan.value = Math.random() * 1.4 - 0.7;
    p.connect(dest);
    for (const [dt, len] of [[0, 0.35], [0.55, 0.25], [0.95, 0.5]]) this._tone('sine', when + dt, len, 330, 300, gain, p, 0.06);
  }

  _splash(when) {
    this._burst(when, 0.35, 'lowpass', 900, 0.35, this.mill.g);
    this._tone('sine', when, 0.18, 95, 70, 0.25, this.mill.g, 0.01); // the wooden thump
  }

  // Honky-tonk ragtime: stride bass and chords over C – A7 – Dm7 – G7, with a wandering tune.
  _pianoUntil(until, audible) {
    const beatLen = 60 / 112, abs = until + this.t0;
    // beats sit on a fixed grid of video time; after a pause, pick up from now
    if (this.nextBeat < abs - 1) this.beat = Math.ceil((abs - 0.1) / beatLen);
    this.nextBeat = this.beat * beatLen;
    while (this.nextBeat < abs) {
      if (audible) this._pianoBeat(this.nextBeat - this.t0, this.beat);
      this.beat++;
      this.nextBeat = this.beat * beatLen;
    }
  }
  _pianoBeat(when, beat) {
    const chords = [[0, 4, 7], [9, 13, 16], [2, 5, 9, 12], [7, 11, 14, 17]];
    const bar = Math.floor(beat / 4) % 4, step = beat % 4, root = [48, 45, 50, 43][bar];
    const chord = chords[bar], midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
    if (step % 2 === 0) this._note(when, midi(step === 0 ? root - 12 : root - 5), 0.5, 1.4);
    else for (const n of chord) this._note(when, midi(60 + n), 0.16, 0.6);
    // tune: two eighths per beat, mostly chord tones, some rests
    for (const half of [0, 0.5]) {
      if (Math.random() < 0.3) continue;
      const pool = chord.concat([chord[0] + 2, chord[1] + 2]);
      this._note(when + half * (60 / 112), midi(72 + pool[Math.floor(Math.random() * pool.length)]), 0.14, 0.45);
    }
  }
  _note(when, f, gain, dur) {
    // a slightly out-of-tune upright: two detuned strings and an octave overtone
    for (const [mult, g, detune] of [[1, 1, 0], [1, 0.6, 7], [2, 0.25, -5], [3, 0.08, 0]]) {
      const o = this.ctx.createOscillator(), env = this.ctx.createGain();
      o.type = mult === 1 ? 'triangle' : 'sine';
      o.frequency.value = f * mult;
      o.detune.value = detune;
      env.gain.setValueAtTime(0.0001, when);
      env.gain.exponentialRampToValueAtTime(gain * g, when + 0.006);
      env.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      o.connect(env).connect(this.piano.g);
      o.start(when);
      o.stop(when + dur + 0.05);
    }
  }

  _train(s, when, dt, set, roofed) {
    const t = s.train;
    if (!t) {
      set(this.train.g.gain, 0);
      set(this.steam.g.gain, 0);
      this.lastTrain = null;
      return;
    }
    const d = Math.hypot(s.x - t.x, s.z - t.z), g = near(d, 15, 420) * roofed;
    set(this.train.g.gain, g);
    set(this.train.lp.frequency, 1200 + 8000 * near(d, 20, 300));
    set(this.train.pan.pan, this._panTo(s, t.x, t.z));
    set(this.steam.g.gain, t.state === 'stopped' ? 0.18 * g : 0.04 * g);
    set(this.steam.pan.pan, this._panTo(s, t.x, t.z));
    // chuffs: faster as the train speeds up
    this.nextChuff -= dt * clamp(t.v * 0.55, 0, 6.5);
    if (this.nextChuff <= 0) {
      this.nextChuff = 1;
      if (t.v > 0.3 && g > 0.005) {
        this._burst(when, 0.2, 'bandpass', 520 + Math.random() * 120, 0.5, this.train.g, 1.2);
        this._burst(when, 0.12, 'highpass', 2500, 0.12, this.train.g);
      }
    }
    // whistle: once as it nears the station, once as it pulls out
    const prev = this.lastTrain;
    const toStation = Math.hypot(t.x - STATION.x, t.z - STATION.z);
    // a new arrival (back from away, or called again): it may whistle again
    if (!this.whistled || (t.approaching && !(prev && prev.approaching))) this.whistled = {};
    if (t.approaching && toStation < 260 && toStation > 60 && !this.whistled.arrive) {
      this.whistled.arrive = true;
      this._whistle(when);
    }
    if (prev && prev.state === 'stopped' && t.state === 'run' && !this.whistled.leave) {
      this.whistled.leave = true;
      this._whistle(when);
    }
    this.lastTrain = t;
  }
  _whistle(when) {
    // a steam whistle chord, swelling and fading, twice
    for (const [start, len] of [[0, 1.1], [1.35, 1.7]]) {
      for (const f of [466, 587, 698]) this._tone('sawtooth', when + start, len, f * 0.98, f, 0.05, this.train.g, 0.12);
    }
  }
}
