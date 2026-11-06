const { chromium } = require(process.env.PLAYWRIGHT_PATH||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto(process.env.DH_URL||'http://127.0.0.1:8811',{waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>window.__app,{timeout:120000});
 for(const [place,shot] of [['pony','Feeding the ponies'],['ghost','Old Hollow Tour']])for(const mood of ['golden','night']){
  await page.evaluate(([shot,mood])=>{const a=window.__app,idx=a.director.shots.findIndex(s=>s.name===shot);a.timeline.stop();a.director.auto=false;a.director.paused=true;a.director.playShot(idx,{cut:true});a.director.t=10;a.applyStyle('film');a.atmos.setPreset(mood,true);a.step(1);document.body.classList.add('ui-hidden');},[shot,mood]);
  await page.waitForTimeout(450);await page.screenshot({path:`world/tests/release-3-${place}-${mood==='golden'?'day':'night'}.png`});
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
