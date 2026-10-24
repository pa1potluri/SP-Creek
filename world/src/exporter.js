// Frame-perfect MP4: the world is stepped exactly 1/fps per frame and every frame is encoded
// (H.264 + AAC via WebCodecs), so the video is smooth however long each frame takes to draw.
import { Muxer, ArrayBufferTarget, FileSystemWritableFileStreamTarget } from '../vendor/mp4-muxer/mp4-muxer.mjs'; // local copy so the world works offline

// Yield to the browser without timers (timers are throttled to 1/s in background tabs).
const yieldTask = () => new Promise((r) => {
  const c = new MessageChannel();
  c.port1.onmessage = () => r();
  c.port2.postMessage(0);
});

async function waitForQueue(enc, max) {
  while (enc.encodeQueueSize > max) {
    await Promise.race([new Promise((r) => enc.addEventListener('dequeue', r, { once: true })), yieldTask()]);
  }
}

async function videoConfig(width, height, fps) {
  // roughly YouTube's recommended bitrates: ~12 Mbps at 1080p30, ~50 Mbps at 4K30
  const bitrate = Math.round(width * height * fps * 0.2);
  for (const codec of ['avc1.640033', 'avc1.640032', 'avc1.640028', 'avc1.4d0033', 'avc1.42003e']) {
    const cfg = { codec, width, height, bitrate, framerate: fps, avc: { format: 'avc' } };
    try {
      if ((await VideoEncoder.isConfigSupported(cfg)).supported) return cfg;
    } catch { /* try the next profile */ }
  }
  throw new Error('This browser cannot encode H.264 at this size. Use Chrome or Edge, or pick a smaller resolution.');
}

async function audioConfig(sampleRate, numberOfChannels) {
  for (const [codec, mux] of [['mp4a.40.2', 'aac'], ['opus', 'opus']]) {
    const cfg = { codec, sampleRate, numberOfChannels, bitrate: 192000 };
    try {
      if ((await AudioEncoder.isConfigSupported(cfg)).supported) return { cfg, mux };
    } catch { /* try the next codec */ }
  }
  return null;
}

// buffers: AudioBuffers (or an async iterable of them) that follow on from each other
async function encodeAudio(buffers, cfg, muxer, onBuffer = () => {}) {
  let failure = null, at = 0;
  const enc = new AudioEncoder({ output: (chunk, meta) => muxer.addAudioChunk(chunk, meta), error: (e) => (failure = e) });
  enc.configure(cfg);
  for await (const buf of buffers) {
    const ch = buf.numberOfChannels, sr = buf.sampleRate, block = 4800;
    const chans = Array.from({ length: ch }, (_, c) => buf.getChannelData(c));
    for (let s = 0; s < buf.length; s += block) {
      const n = Math.min(block, buf.length - s), data = new Float32Array(n * ch);
      for (let c = 0; c < ch; c++) data.set(chans[c].subarray(s, s + n), c * n);
      const ad = new AudioData({ format: 'f32-planar', sampleRate: sr, numberOfFrames: n, numberOfChannels: ch, timestamp: Math.round(((at + s) * 1e6) / sr), data });
      enc.encode(ad);
      ad.close();
      if (failure) throw failure;
      await waitForQueue(enc, 20);
    }
    at += buf.length;
    onBuffer(at / buf.sampleRate);
  }
  await enc.flush();
  enc.close();
}

/**
 * renderFrame(): advance the world one frame and draw it into `canvas`.
 * writable: a FileSystemWritableFileStream to stream straight to disk, or null to build in memory.
 * audio: { sampleRate, channels, chunks, onChunk } or null. chunks() is called after the last frame
 * (so the sound can follow what the frames did) and gives the AudioBuffers in that format, in order.
 * Returns a Blob (memory), 'saved' (streamed to disk) or null (cancelled).
 */
export async function encodeVideo({ canvas, width, height, fps, seconds, audio, writable, renderFrame, onProgress, cancelled }) {
  if (!window.VideoEncoder) throw new Error('This browser has no video encoder. Use Chrome or Edge.');
  const vcfg = await videoConfig(width, height, fps);
  const acfg = audio ? await audioConfig(audio.sampleRate, audio.channels) : null;
  const target = writable ? new FileSystemWritableFileStreamTarget(writable) : new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    fastStart: writable ? false : 'in-memory',
    firstTimestampBehavior: 'offset',
    video: { codec: 'avc', width, height, frameRate: fps },
    audio: acfg ? { codec: acfg.mux, sampleRate: audio.sampleRate, numberOfChannels: audio.channels } : undefined,
  });

  let failure = null;
  const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => (failure = e) });
  enc.configure(vcfg);
  const total = Math.round(seconds * fps), usPerFrame = 1e6 / fps;
  for (let i = 0; i < total; i++) {
    if (failure) throw failure;
    if (cancelled()) {
      enc.close();
      if (writable) await writable.abort();
      return null;
    }
    renderFrame();
    const frame = new VideoFrame(canvas, { timestamp: Math.round(i * usPerFrame), duration: Math.round(usPerFrame) });
    enc.encode(frame, { keyFrame: i % (fps * 2) === 0 });
    frame.close();
    await waitForQueue(enc, 3);
    if (i % 3 === 0 || i === total - 1) {
      onProgress(i + 1, total);
      await yieldTask();
    }
  }
  await enc.flush();
  enc.close();
  if (failure) throw failure;
  if (acfg) await encodeAudio(audio.chunks(), acfg.cfg, muxer, audio.onChunk);
  muxer.finalize();
  if (writable) {
    await writable.close();
    return 'saved';
  }
  return new Blob([target.buffer], { type: 'video/mp4' });
}
