// ?showcase: a 33-minute hands-free highlights tour for screen recording.
// Every place, mood, weather and season, then each art style. No menus; Home restarts it.
const S = (shot, seconds, mood = 'keep') => ({ shot, seconds, mood, move: 'cut' });
const SEGMENTS = [
  { season: 'summer', clips: [S(1, 40, 'morning'), S(10, 40), S(34, 50), S(21, 40)] },
  { season: 'summer', clips: [S(0, 40, 'golden'), S(24, 50), S(3, 40), S(17, 35), S(18, 30), S(19, 30), S(8, 35), S(11, 35), S(6, 45)] },
  { season: 'summer', clips: [S(26, 40, 'golden'), S(35, 45), S(27, 45), S(32, 60), S(29, 45), S(33, 60), S(7, 40)] },
  { season: 'summer', rain: 0.8, clips: [S(2, 40, 'rain'), S(3, 40), S(17, 40)] },
  { season: 'summer', clips: [S(25, 45, 'villageDusk'), S(30, 60), S(22, 40), S(23, 40)] },
  { season: 'summer', clips: [S(31, 60, 'night'), S(15, 45), S(0, 40), S(28, 45)] },
  { season: 'autumn', clips: [S(23, 40, 'golden'), S(24, 45), S(13, 40), S(16, 60)] },
  { season: 'winter', clips: [S(36, 50, 'morning'), S(0, 40), S(24, 45), S(21, 40)] },
  { season: 'winter', clips: [S(36, 45, 'night'), S(6, 45)] },
  ...['oil', 'paper', 'toy', 'clean', 'pixel', 'film'].map((style, i) => ({ season: 'summer', style, clips: [S([6, 24, 0, 29, 27, 1][i], 35, 'golden')] })),
];

export function startShowcase(app) {
  const slide = (attr, key, v) => {
    const i = document.querySelector(`[data-${attr}="${key}"]`);
    if (i) { i.value = v; i.dispatchEvent(new Event('input')); }
  };
  for (const sel of ['#panel', '#hud', '#loading']) document.querySelector(sel)?.style.setProperty('display', 'none');
  document.querySelectorAll('button').forEach((b) => { if (!b.closest('#panel')) b.style.display = 'none'; });
  document.body.style.cursor = 'none';
  dispatchEvent(new Event('resize'));
  slide('audio', 'wind', 0.12); // the wind is calm; the user found the default too loud
  slide('audio', 'ambience', 0.7);
  let timer = 0;
  const run = (i) => {
    const g = SEGMENTS[i % SEGMENTS.length];
    app.applyStyle(g.style || 'film');
    app.setSeason?.(g.season);
    slide('atmos', 'rain', g.rain || 0);
    app.timeline.stop();
    app.timeline.loop = false;
    app.timeline.clips = g.clips.map((c) => ({ ...c }));
    app.director.auto = false;
    app.timeline.start();
    clearTimeout(timer);
    timer = setTimeout(() => run(i + 1), g.clips.reduce((s, c) => s + c.seconds, 0) * 1000);
  };
  addEventListener('keydown', (e) => { if (e.key === 'Home') { e.preventDefault(); run(0); } });
  run(0);
}
