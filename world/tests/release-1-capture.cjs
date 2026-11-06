const { chromium } = require(process.env.PLAYWRIGHT_PATH||'playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(process.env.DH_URL || 'http://localhost:8811', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => window.__app, undefined, { timeout: 120000 });
  for (const [mood, path] of [['golden', 'world/tests/release-1-discovery-map-day.png'], ['night', 'world/tests/release-1-discovery-map-night.png']]) {
    await page.evaluate((mood) => { const a = window.__app; a.applyStyle('film'); a.atmos.setPreset(mood, true); a.kidsUI.open('Home'); a.kidsUI.openMap(); }, mood);
    await page.waitForTimeout(700);
    await page.screenshot({ path });
  }
  await browser.close();
})().catch((error) => { console.error(error); process.exit(1); });
