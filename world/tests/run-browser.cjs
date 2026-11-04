const { chromium } = require('C:/Users/PKP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'log') console.log(m.text()); });
  page.on('pageerror', e => {errors.push(e.message);console.error('Browser error:',e.message);});
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text()); });
  await page.goto(process.env.DH_URL || 'http://localhost:8810', {waitUntil:'domcontentloaded',timeout:120000}); // DH_URL: test another checkout (reviews)
  await page.waitForFunction(() => window.__app, undefined, { timeout: 120000 });
  for (const suite of process.argv.slice(2).filter(a => !a.startsWith('--'))) {
    const result = await page.evaluate(async name => {
      const m = await import(`/tests/${name}.js`);
      return await m[Object.keys(m).find(k => k.startsWith('run'))]();
    }, suite);
    const {results: details, ...summary} = result;
    console.log(suite, JSON.stringify(summary));
    if (suite === 'family-mode') {
      for (const on of [true, false]) {
        await page.evaluate(on => window.__app.setFamilyMode(on, true), on);
        await page.reload(); await page.waitForFunction(() => window.__app, undefined, { timeout: 120000 });
        const ok = await page.evaluate(on => window.__app.projectData().familyMode === on && window.__app.cafe.familyMode === on && document.querySelector('#familyMode').checked === on, on);
        if (!ok) throw Error('Family startup persistence: ' + on);
      }
      console.log('Family startup reload checks: 2 passed');
    }
  }
  if (process.argv.includes('--preview')) {
    await page.setViewportSize({width:1440,height:900});
    await page.evaluate(async () => {
      const a = window.__app;
      a.loadProject({ ...a.projectData(), layout: [] }); a.director.auto = false; a.director.setFree(true);
      a.applyStyle('oil'); a.atmos.setPreset('golden', true);
      for (const [i, type] of ['cabin', 'brick', 'blacksmith'].entries()) a.world.placeBuilding({ type, x: -70 + i * 18, z: -105, w: 11, sign: type === 'brick' ? 'CREEKSIDE STORE' : undefined });
      const y = a.world.buildings[1].pad.y;
      a.director.state.pos.set(-52, y + 22, -72); a.director.free.yaw = Math.PI; a.director.free.pitch = Math.atan2(-19,37); a.director.update(0);
      document.body.classList.add('ui-hidden');
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'world/tests/more-buildings-preview.png' });
    for (const [style, mood] of [['clean','golden'], ['oil','night']]) {
      await page.evaluate(([s,m]) => { window.__app.applyStyle(s); window.__app.atmos.setPreset(m, true); }, [style,mood]);
      await page.waitForTimeout(800); await page.screenshot({ path: `world/tests/more-buildings-${style}-${mood}.png` });
    }
  }
  if (process.argv.includes('--family-preview')) {
    await page.setViewportSize({width:1440,height:900});
    for (const style of ['oil', 'clean']) {
      await page.evaluate(async style => {
        const THREE = await import('three'), a = window.__app;
        a.timeline.stop(); a.director.auto=false; a.director.setFree(true); a.applyStyle(style); a.setFamilyMode(true); a.atmos.setPreset('golden',true);
        const it=a.world.interiors.cafe.group;
        const p=it.localToWorld(new THREE.Vector3(-5.8,2.6,-1.4)), target=it.localToWorld(new THREE.Vector3(2.4,1.7,-7.8)), d=target.clone().sub(p);
        a.director.state.pos.copy(p); a.director.free.yaw=Math.atan2(d.x,d.z); a.director.free.pitch=Math.atan2(d.y,Math.hypot(d.x,d.z)); a.director.update(0);
        document.body.classList.add('ui-hidden');
      },style);
      await page.waitForTimeout(1000); await page.screenshot({path:style==='oil'?'world/tests/family-mode-preview.png':'world/tests/family-mode-clean-interior.png'});
      await page.evaluate(() => {
        const a=window.__app; a.director.state.pos.set(-1,7,54); a.director.free.yaw=Math.atan2(3,-46); a.director.free.pitch=Math.atan2(-3,Math.hypot(3,46)); a.director.update(0);
      });
      await page.waitForTimeout(800); await page.screenshot({path:`world/tests/family-mode-${style}-street.png`});
    }
  }
  console.log('Browser errors:', JSON.stringify(errors));
  await browser.close(); if (errors.length) process.exitCode = 1;
})().catch(e => { console.error(e); process.exit(1); });
