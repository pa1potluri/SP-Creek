// Day (and night) preview of a little scene built from picture-collection pieces.
const { chromium } = require('C:/Users/PKP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } }), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text()); });
  await page.goto(process.env.DH_URL || 'http://localhost:8810', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => window.__app, undefined, { timeout: 120000 });
  await page.evaluate(() => {
    // A little garden walk: a winding path through a flower arch, lanterns along it, a picnic and a camp beyond.
    const a = window.__app, cx = -112, cz = 248, P = (x, z) => [cx + x, cz + z];
    a.loadProject({ ...a.projectData(), layout: [] }); a.director.auto = false; a.director.setFree(true);
    const pieces = [
      ['flowerArch', 0.6, 9, 0], ['picketFence', -2.9, 9, 0], ['picketFence', 4.1, 9, 0], ['greenBush', -5.4, 10, 0], ['floweringBush', 6.6, 10, 0.6],
      ['shortLantern', 2.4, 15, 0], ['shortLantern', -1.4, 4, 0], ['shortLantern', 3.6, -5, 0], ['meadowFlowers', -2.6, 13, 0], ['meadowFlowers', 4.2, 3, 1], ['mushrooms', -3.2, 1, 0],
      ['shadeTree', -11, 13, 0], ['blossomTree', -6.5, 3, 0], ['fruitTree', 9, 2, 0], ['picnicTable', 6.2, -1, 0.15],
      ['gazebo', -6.5, -8, 0.3], ['campfirePit', 5, -12, 0], ['canvasTent', 9.5, -16, -0.6], ['autumnTree', 13.5, -9, 0],
      ['waterfall', -14, -14, 0.7], ['mossyRock', -10.5, -12.5, 0], ['rockPlateau', -2, -24, 0], ['lookoutTower', 13, -27, 0.3], ['pineGroup', -18, -26, 0], ['roundTree', 17, 4, 0]];
    for (const [type, x, z, yaw] of pieces) a.world.placeBuilding({ type, x: cx + x, z: cz + z, yaw }, false);
    a.world.updateTerrain();
    a.world.addRoad([P(0.5, 26), P(1.5, 16), P(0.6, 9), P(-0.4, 2), P(1.6, -6), P(0.2, -14), P(-1, -19)], 2.2);
    const y = a.world.groundY(cx, cz + 10);
    a.director.state.pos.set(cx + 1.5, y + 3.8, cz + 25); a.director.free.yaw = Math.PI + 0.02; a.director.free.pitch = -0.17; a.director.update(0);
    document.body.classList.add('ui-hidden');
  });
  for (const [style, mood, file] of [['film', 'golden', 'day'], ['film', 'night', 'night'], ['oil', 'golden', 'oil']]) {
    await page.evaluate(([s, m]) => { window.__app.applyStyle(s); window.__app.atmos.setPreset(m, true); }, [style, mood]);
    await page.waitForTimeout(1500); await page.screenshot({ path: `world/tests/props-placeable-${file}.png` });
  }
  console.log('Browser errors:', JSON.stringify(errors));
  await browser.close(); if (errors.length) process.exitCode = 1;
})();
