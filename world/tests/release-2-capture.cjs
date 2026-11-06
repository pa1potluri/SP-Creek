const { chromium } = require(process.env.PLAYWRIGHT_PATH||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto(process.env.DH_URL||'http://127.0.0.1:8811',{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>window.__app,{timeout:120000});
 for(const [mood,file] of [['golden','release-2-stars-day.png'],['night','release-2-stars-night.png']]){
  await page.evaluate(([m])=>{const a=window.__app,s=a.hiddenStars.stars[6],p=s.position; a.timeline.stop();a.director.auto=false;a.director.setFree(true);a.applyStyle('film');a.atmos.setPreset(m,true);a.director.state.pos.set(p.x+8,p.y+5,p.z+12);const look=p.clone();look.y+=.25;const v=look.clone().sub(a.director.state.pos);a.director.free.yaw=Math.atan2(v.x,v.z);a.director.free.pitch=Math.atan2(v.y,Math.hypot(v.x,v.z));a.director.update(0);document.body.classList.add('ui-hidden');},[mood]);
  await page.waitForTimeout(700);await page.screenshot({path:'world/tests/'+file});
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
