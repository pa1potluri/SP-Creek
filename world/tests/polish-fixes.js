// Touch steering and freeing removed townsfolk (phone play and long video sessions).
export async function runPolishFixesTests() {
  const a = window.__app, results = [], canvas = document.querySelector('#view');
  const check = (ok, message) => { if (!ok) throw Error(message); results.push(message); };
  const touch = (type, target, x, y) => target.dispatchEvent(new PointerEvent(type, { pointerType: 'touch', pointerId: 7, isPrimary: true, button: type === 'pointermove' ? -1 : 0, clientX: x, clientY: y, bubbles: true }));

  check(getComputedStyle(canvas).touchAction === 'none', 'Finger drags on the picture are not taken over by page scrolling');

  a.game.enter();
  const yaw = a.game.yaw;
  touch('pointerdown', canvas, 200, 300); touch('pointermove', canvas, 260, 300); touch('pointerup', canvas, 260, 300);
  check(Math.abs(a.game.yaw - yaw) > 0.1, 'A finger drag turns the view while playing');
  const after = a.game.yaw;
  touch('pointermove', canvas, 320, 300);
  check(a.game.yaw === after, 'Lifting the finger stops the turning');
  a.game.exit();

  a.director.setFree(true);
  touch('pointerdown', canvas, 200, 300);
  check(a.director.free.drag, 'Free camera starts a finger drag');
  touch('pointercancel', canvas, 200, 300);
  check(a.director.free.drag === null, 'A cancelled touch ends the free camera drag');
  a.director.setFree(false);

  const people = a.life.settings.people;
  a.life.settings.people = people + 1; a.life.apply();
  const leaving = a.life.walkers[a.life.walkers.length - 1];
  let freed = 0, meshes = 0;
  leaving.p.g.traverse(o => { if (o.geometry) { meshes++; o.geometry.addEventListener('dispose', () => freed++); } });
  a.life.settings.people = people; a.life.apply();
  check(meshes > 0 && freed >= meshes, 'A townsperson leaving the scene frees their geometry');

  return { passed: results.length, failed: 0, results };
}
