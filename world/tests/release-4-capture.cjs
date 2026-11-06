const { chromium } = require(process.env.PLAYWRIGHT_PATH||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto(process.env.DH_URL||'http://127.0.0.1:8811',{waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>window.__app,{timeout:120000});
 for(const mood of ['golden','night']){
  await page.evaluate(mood=>{const a=window.__app,g=a.game,r=a.world.balloonRide;a.timeline.stop();a.director.auto=false;a.applyStyle('film');a.atmos.setPreset(mood,true);g.active=true;g.pos.set(202,r.top.y+.15,-142.5);g._boardBalloon();a.crystalMine.update(0,a.atmos.cur);g._flyBalloon(105);a.crystalMine.update(105,a.atmos.cur);const s=r.viewStar.position;g._flyBalloon=()=>{};a.camera.position.set(s.x+7,s.y+3.2,s.z+12);a.camera.lookAt(s);a.director.state.pos.copy(a.camera.position);a.director.state.look.copy(s);document.body.classList.add('ui-hidden');},mood);
  await page.waitForTimeout(550);await page.screenshot({path:`world/tests/release-4-balloon-${mood==='golden'?'day':'night'}.png`});
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
