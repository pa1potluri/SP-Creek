// A video as a list of clips: which shot, how long, which mood, and how we get there
// (glide over the rooftops or a straight cut). Plays the same way every time.
export class Timeline {
  constructor(director, atmos) {
    this.director = director;
    this.atmos = atmos;
    this.world = atmos.world;
    this.clips = []; // { shot: index | 'custom', seconds, mood: preset key | 'keep', move: 'fly' | 'cut' }
    this.loop = false; // start over after the last clip (long background videos)
    this.playing = false;
    this.t = 0;
    this.index = -1;
    this.onClip = () => {};
  }

  duration(c) {return c.shot==='buildReplay'?this.world.replayDuration(c.replaySpeed):Math.max(0.5,+c.seconds||0);}

  get total() {
    return this.clips.reduce((s, c) => s + this.duration(c), 0);
  }

  clipAt(t) {
    let end = 0;
    for (let i = 0; i < this.clips.length; i++) {
      end += this.duration(this.clips[i]);
      if (t < end) return i;
    }
    return this.clips.length - 1;
  }

  start(startIndex=0) {
    if (!this.clips.length) return false;
    this.playing = true;
    const index=Math.max(0,Math.min(this.clips.length-1,startIndex));
    this.t = this.clips.slice(0,index).reduce((n,c)=>n+this.duration(c),0);
    this.director.locked = true;
    this._enter(index, true);
    return true;
  }

  _restoreReplayCamera() {
    if(!this.replayCamera)return;
    this.director.setFree(true);this.director.customShot=this.replayCamera.previous;this.replayCamera=null;
  }

  stop() {
    this._restoreReplayCamera();
    this.world.endBuildReplay();
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
    if(this.clips[i]?.shot==='buildReplay'){
      if(!this.world.buildReplay){this.stop();return 'ended';}
      const local=this.t-this.clips.slice(0,i).reduce((n,c)=>n+this.duration(c),0);
      this.world.updateBuildReplay(local);this.replayCamera.time=local;
    }
    return null;
  }

  _enter(i, first) {
    const c = this.clips[i];
    this._restoreReplayCamera();this.world.endBuildReplay();
    this.index = i;
    if (c.mood && c.mood !== 'keep') this.atmos.setPreset(c.mood, first);
    if(c.shot==='buildReplay'){
      if(!this.world.beginBuildReplay(c.replaySpeed)){this.stop();return;}
      const d=this.director;this.replayCamera={previous:d.customShot,time:0};
      d.customShot={name:'Replay build',duration:this.duration(c),loop:true,sample:(_,out)=>this.world.buildReplayCamera(this.replayCamera?.time||0,out)};
      d.mode='shot';d.index=-1;d.t=0;d.flight=null;d.hold=true;d.shotSpeed=1;d.auto=false;d.free.keys.clear();d.customShot.sample(0,d.state);d.onChange();this.onClip(i);return;
    }
    // natural: play the shot at its own calm speed and just cut after `seconds` (tours of long paths)
    this.director.playShot(c.shot, { cut: first || c.move === 'cut', fitTo: c.natural ? 0 : Math.max(0.5, +c.seconds || 0) });
    this.onClip(i);
  }

  // Stretch or squeeze every clip by the same factor so the video lasts `seconds`.
  fitTo(seconds) {
    const k = seconds / (this.total || 1);
    for (const c of this.clips) {if(c.shot==='buildReplay')c.replaySpeed=Math.max(1,Math.min(5,(c.replaySpeed||2)/k));else c.seconds = Math.round(c.seconds * k * 10) / 10;}
  }

  toJSON() {
    return this.clips.map(({ shot, seconds, mood, move, natural, replaySpeed }) => ({ shot, seconds, mood, move, ...(natural ? { natural } : {}), ...(shot==='buildReplay'?{replaySpeed:replaySpeed||2}:{}) }));
  }
}
