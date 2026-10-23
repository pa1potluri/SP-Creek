// Records the canvas (plus music/wind) to a .webm file that downloads when you stop.
export class Recorder {
  constructor() {
    this.rec = null;
    this.started = 0;
  }
  get active() {
    return !!this.rec;
  }
  get seconds() {
    return this.rec ? (performance.now() - this.started) / 1000 : 0;
  }
  start(canvas, audioStream, fps = 60) {
    const stream = canvas.captureStream(fps);
    if (audioStream) audioStream.getAudioTracks().forEach((t) => stream.addTrack(t));
    const types = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    const mimeType = types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
    const chunks = [];
    this.rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 24e6 });
    this.rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    this.rec.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `dusty-hollow-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.webm`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    };
    this.rec.start(1000);
    this.started = performance.now();
  }
  stop() {
    if (this.rec) this.rec.stop();
    this.rec = null;
  }
}
