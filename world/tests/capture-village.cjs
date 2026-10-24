const { chromium } = require('C:/Users/PKP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', args:['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({viewport:{width:1920,height:1080}}), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error' && !m.text().includes('404'))errors.push(m.text());});
  await page.addInitScript(() => {
    const raf=window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame=fn=>raf(t=>{if(!window.__capturePause)fn(t);});
  });
  await page.goto('http://localhost:8810'); await page.waitForFunction(()=>window.__app,{timeout:120000});
  await page.evaluate(()=>{window.__capturePause=true;}); await page.waitForTimeout(200);
  await page.evaluate(()=>{
    const a=window.__app;
    a.audio.restartMusic=()=>{};
    [...document.querySelectorAll('#videoPresets button')].find(b=>b.textContent.includes('Village at dusk')).click();
    document.body.classList.add('ui-hidden'); for(const id of ['panel','hud','uiToggle','loading'])document.getElementById(id).style.display='none';a.step(0);
  });
  const directory='world/tests/village-dusk';fs.mkdirSync(directory,{recursive:true});
  const frames=[];
  for(const seconds of [...Array.from({length:14},(_,i)=>i*20),270,271]) {
    const data=await page.evaluate(async seconds=>{
      const a=window.__app,{terrainHeight,walkHeight}=await import('/src/world.js');
      const renderer=a.atmos.renderer, render=renderer.render;
      const previous=window.__captureSeconds||0;
      // Advance exactly like the exporter, skipping GPU draws between review frames.
      renderer.render=()=>{};
      try { for(let i=0;i<Math.round((seconds-previous)*30);i++)a.step(1/30); }
      finally { renderer.render=render; }
      window.__captureSeconds=seconds;a.step(0);
      const p=a.camera.position;
      return {seconds,shot:a.director.shot.name,mood:a.atmos.key,position:p.toArray(),groundClearance:p.y-Math.max(terrainHeight(p.x,p.z),walkHeight(p.x,p.z)),sun:a.atmos.cur.sunIntensity,hemi:a.atmos.cur.hemiIntensity,exposure:a.atmos.cur.exposure,audioLocked:a.audio.ctx===null};
    },seconds);
    const file=`${directory}/${String(seconds).padStart(3,'0')}.png`;
    await page.screenshot({path:file});frames.push({...data,file});console.log(`${seconds}s: ${data.shot}, clearance ${data.groundClearance.toFixed(2)}m`);
  }
  fs.writeFileSync(`${directory}/frames.json`,JSON.stringify(frames,null,2));
  console.log('Browser errors:',JSON.stringify(errors));await browser.close();if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});
