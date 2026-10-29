const {chromium}=require('C:/Users/PKP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});const report={errors:[],checks:[]};
try{
 const p=await b.newPage({viewport:{width:960,height:600}});p.on('pageerror',e=>report.errors.push(e.message));
 let start=Date.now();await p.goto('http://127.0.0.1:8811/?characterFaces=pipeline');await p.waitForFunction(()=>window.__app,undefined,{timeout:120000});report.readyMs=Date.now()-start;
 report.checks=await p.evaluate(()=>{
  const a=__app,checks=[],check=(ok,m)=>{if(!ok)throw Error(m);checks.push(m);};
  check(a.life.stars.pavi.pipelineProfile==='pavi','Pavi uses approved face in actual game');check(!!a.life.stars.siri.model&&!a.life.stars.siri.pipelineProfile,'Siri preserves her supplied original model');
  const people=[...a.life.walkers,...a.life.hamletWalkers,...a.life.townKids].map(w=>w.p);check(people.length>12,'Game residents and children present');
  check(people.every(p=>p.pipelineProfile&&p.pipelineHead.parent===p.head),'Resident profiles attach to existing game head rigs');
  const first=people[0],same=people.find(p=>p!==first&&p.pipelineProfile===first.pipelineProfile);if(same)check(same.pipelineHead.geometry===first.pipelineHead.geometry,'Matching profiles share GPU geometry');
  for(let i=0;i<120;i++)a.step(1/60);check(a.camera.position.toArray().every(Number.isFinite),'Two seconds of live world animation remain finite');
  check(people.every(p=>p.pipelineHead.parent===p.head),'Walking and idle animation keep face attachments');check(a.audio.ctx===null,'Integration check never starts sound');
  return checks;
 });
 await p.evaluate(()=>document.querySelector('#freezeBtn').click());await p.addStyleTag({content:'body > :not(canvas):not(script){visibility:hidden!important}'});
 for(const shot of [20,46])for(const mood of ['golden','night']){
  await p.evaluate(({shot,mood})=>{const a=__app;a.timeline.stop();a.director.auto=false;a.director.sway=0;a.applyStyle('film');a.atmos.setPreset(mood,true);a.director.playShot(shot,{cut:true});a.director.paused=true;a.director.t=Math.min(20,a.director.shot.duration/2);a.step(.1);},{shot,mood});
  await p.screenshot({path:`world/tests/character-profile-rollout-${shot}-${mood==='night'?'night':'day'}.png`});
 }
 report.actualGame=await p.evaluate(()=>({pavi:__app.life.stars.pavi.pipelineProfile,residents:[...__app.life.walkers,...__app.life.hamletWalkers,...__app.life.townKids].map(w=>w.p.pipelineProfile),audioLocked:__app.audio.ctx===null}));
 await p.goto('http://127.0.0.1:8811/');await p.waitForFunction(()=>window.__app,undefined,{timeout:120000});
 report.defaultRestored=await p.evaluate(()=>!!__app.life.stars.pavi.model&&!__app.life.stars.pavi.pipelineProfile&&__app.life.walkers.every(w=>!w.p.pipelineProfile));
 if(!report.defaultRestored)throw Error('Default URL rollback failed');report.checks.push('Ordinary URL restores original models and faces');
 report.profileRequestsOnDefault=await p.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/pipeline-game/')).length);if(report.profileRequestsOnDefault)throw Error('Default world downloads experimental profile data');report.checks.push('Default game has no pipeline data download');
 if(report.errors.length)throw Error(report.errors.join('; '));report.passed=report.checks.length;console.log(JSON.stringify(report));
}catch(e){report.failure=e.message;console.error(e);process.exitCode=1;}finally{fs.writeFileSync('world/tests/character-profile-rollout-check.json',JSON.stringify(report,null,2));await b.close();}})();
