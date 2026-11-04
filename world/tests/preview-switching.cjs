// Silent, isolated review-session diagnostic; does not touch the user's Chrome profile.
const {chromium}=require('C:/Users/PKP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
  const report={viewport:[2560,1440],errors:[],contextLosses:0,switches:[]};
  try {
    const page=await browser.newPage({viewport:{width:2560,height:1440}});
    let activePreset=-1;
    report.errorCount=0;
    page.on('pageerror',e=>{report.errorCount++;if(!report.errors.some(r=>r.stack===e.stack))report.errors.push({message:e.message,stack:e.stack,index:activePreset});});
    const session=await page.context().newCDPSession(page);
    const browserSession=await browser.newBrowserCDPSession();
    const gpu=await browserSession.send('SystemInfo.getInfo');
    report.gpu=gpu.gpu.devices.map(d=>({vendor:d.vendorString,device:d.deviceString}));
    const start=Date.now();
    await page.goto(process.env.DH_URL||'http://127.0.0.1:8811/',{waitUntil:'domcontentloaded',timeout:120000});
    await page.waitForFunction(()=>window.__app,undefined,{timeout:120000});
    report.startupMs=Date.now()-start;
    await page.evaluate(()=>{
      window.__previewContextLosses=0;
      document.querySelector('canvas').addEventListener('webglcontextlost',()=>window.__previewContextLosses++);
    });
    await session.send('HeapProfiler.collectGarbage');
    report.heapBefore=(await session.send('Runtime.getHeapUsage')).usedSize;
    const count=await page.locator('#videoPresets button').count();
    report.presetCount=count;report.heapAfterRound=[];
    for(let i=0;i<count*2;i++) {
      const position=i%count;
      const index=position%2?Math.floor(position/2):(count-1-Math.floor(position/2));
      activePreset=index;
      const sample=await Promise.race([
        page.evaluate(async index=>{
          const a=window.__app,b=document.querySelectorAll('#videoPresets button')[index];
          const start=performance.now();b.click();const clickMs=performance.now()-start;
          let frames=0,last=performance.now(),maxGap=0;
          await new Promise(resolve=>{const start=last;function frame(now){frames++;maxGap=Math.max(maxGap,now-last);last=now;if(now-start>=1500)resolve();else requestAnimationFrame(frame)}requestAnimationFrame(frame)});
          return {index,label:b.querySelector('b').textContent,clickMs,frames,maxGap,audioLocked:a.audio.ctx===null};
        },index),
        new Promise((_,reject)=>{const timer=setTimeout(()=>reject(Error('Preview stopped responding for 20 seconds')),20000);timer.unref();})
      ]);
      report.switches.push(sample);
      if(report.errors.length)break;
      if(i%6===5)console.log(`Completed ${i+1}/${count*2} preset switches`);
      if((i+1)%count===0){await session.send('HeapProfiler.collectGarbage');report.heapAfterRound.push((await session.send('Runtime.getHeapUsage')).usedSize);}
    }
    await session.send('HeapProfiler.collectGarbage');
    report.heapAfter=(await session.send('Runtime.getHeapUsage')).usedSize;
    report.contextLosses=await page.evaluate(()=>window.__previewContextLosses);
    report.canvas=await page.evaluate(()=>[document.querySelector('canvas').width,document.querySelector('canvas').height]);
    report.maxClickMs=Math.max(...report.switches.map(s=>s.clickMs));
    report.maxFrameGapMs=Math.max(...report.switches.map(s=>s.maxGap));
    report.passed=report.switches.length===count*2&&!report.errors.length&&!report.contextLosses&&report.switches.every(s=>s.audioLocked);
    console.log(JSON.stringify({startupMs:report.startupMs,maxClickMs:report.maxClickMs,maxFrameGapMs:report.maxFrameGapMs,contextLosses:report.contextLosses,heapBefore:report.heapBefore,heapAfter:report.heapAfter,passed:report.passed}));
    if(!report.passed)process.exitCode=1;
  } catch(e) {
    report.failure=e.message;process.exitCode=1;console.error(e);
  } finally {
    fs.writeFileSync('world/tests/preview-switching.json',JSON.stringify(report,null,2));
    await browser.close();
  }
})();
