// Lead review captures for task 99: cottage at its new site (day/night), playground in Watch with no stars, Discovery Map.
const { chromium } = require(process.env.PLAYWRIGHT_PATH||'playwright');
(async () => {
  const browser = await chromium.launch({headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--enable-unsafe-swiftshader']});
  const page = await browser.newPage({viewport: {width: 1440, height: 900}});
  await page.goto(process.env.DH_URL || 'http://127.0.0.1:8840', {waitUntil: 'domcontentloaded', timeout: 120000});
  await page.waitForFunction(() => window.__app, {timeout: 120000});
  const aim = (mood, pos, look) => page.evaluate(([mood, pos, look]) => {
    const a = window.__app; a.timeline.stop(); a.director.auto = false; a.applyStyle('film'); a.atmos.setPreset(mood, true);
    const L = a.camera.position.clone().set(...look); a.camera.position.set(...pos); a.camera.lookAt(L);
    a.director.state.pos.copy(a.camera.position); a.director.state.look.copy(L); a.director.setFree(true); document.body.classList.add("ui-hidden");
  }, [mood, pos, look]);
  for (const mood of ['golden', 'night']) {
    await aim(mood, [-40 + 14, 7, 35 + 22], [-40, 2.5, 38]);
    await page.waitForTimeout(900);
    await page.screenshot({path: `world/tests/lead-review-cottage-${mood === 'golden' ? 'day' : 'night'}.png`});
  }
  await aim('golden', [-8 + 14, 6, 14 + 16], [-8, 1.5, 14]);  // first hidden-star site (playground)
  await page.waitForTimeout(900);
  const starsOut = await page.evaluate(() => window.__app.hiddenStars.group?.visible);
  await page.screenshot({path: 'world/tests/lead-review-watch-no-stars.png'});
  await page.evaluate(() => { document.body.classList.remove('ui-hidden'); window.__app.kidsUI.openMap(); });
  await page.waitForTimeout(600);
  await page.screenshot({path: 'world/tests/lead-review-map.png'});
  console.log(JSON.stringify({starsVisibleOutsidePlay: starsOut}));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
