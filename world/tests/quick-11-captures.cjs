const {chromium}=require('C:/Users/PKP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});try{const p=await b.newPage({viewport:{width:1600,height:900}});await p.goto('http://127.0.0.1:8811/');await p.waitForFunction(()=>window.__app?.kidsUI,undefined,{timeout:90000});await p.waitForTimeout(900);for(const mood of ['golden','night']){await p.evaluate(m=>{const a=__app;a.timeline.stop();a.director.auto=false;a.director.paused=true;a.director.playShot(59,{cut:true});a.director.t=25;a.applyStyle('film');a.atmos.setPreset(m,true);a.step(1);},mood);await p.screenshot({path:'world/tests/quick-11-before-59-'+(mood==='golden'?'day':'night')+'.png'});}}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});



