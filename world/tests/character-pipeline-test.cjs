const {chromium}=require('C:/Users/PKP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),crypto=require('crypto');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
 const report={errors:[],checks:[],measurements:[],viewport:[1440,900]};
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>report.errors.push(e.message));
  const gpu=await (await browser.newBrowserCDPSession()).send('SystemInfo.getInfo');report.gpu=gpu.gpu.devices.map(d=>d.deviceString);
  const start=Date.now();await page.goto('http://127.0.0.1:8811/character-pipeline-test.html');await page.waitForFunction(()=>window.__pipeline,undefined,{timeout:60000});report.readyMs=Date.now()-start;
  report.checks=await page.evaluate(()=>{
   const a=__pipeline,checks=[],check=(ok,text)=>{if(!ok)throw Error(text);checks.push(text);};a.setFrozen(true);a.step(0);
   check(a.actors.length===14,'All 12 residents and both stars present');check(new Set(a.actors.map(x=>x.id)).size===14,'All character slots have unique IDs');
   check(a.actors.find(x=>x.id==='pavi').asset.data.count===258816,'Pavi uses the exact saved hero point count');
   check(a.actors.find(x=>x.id==='siri').asset.id==='town-202','Siri provisional profile is explicit');
   for(const stride of [1,4,8]){a.setDetail(stride);for(const actor of a.actors){check(actor.points.geometry.attributes.position.count===Math.ceil(actor.asset.data.count/stride),actor.id+' deterministic point budget '+stride);check(actor.points.geometry.userData.parts.every(n=>n>0),actor.id+' retains all facial parts '+stride);}}
   a.setFaces('original');check(a.actors.every(x=>!x.points.visible&&x.old.every(c=>c.visible)),'Original heads are recoverable');a.setFaces('pipeline');check(a.actors.every(x=>x.points.visible&&x.old.every(c=>!c.visible)),'Only replaced heads are shown in pipeline mode');
   check(a.actors.every(x=>x.points.parent===x.rig.head),'New faces attach to original head joints');check(a.actors.every(x=>x.points.material.depthTest&&x.points.material.depthWrite),'Heads participate in world depth');
   a.setDetail(4);return checks;
  });
  const hero=fs.readFileSync('world/assets/characters/pipeline-test/hero/head-points.bin');const manifest=JSON.parse(fs.readFileSync('world/assets/characters/pipeline-test/hero/model-manifest.json'));
  if(crypto.createHash('sha256').update(hero).digest('hex')!==manifest.sha256)throw Error('Hero source checksum differs');report.checks.push('Frozen hero binary checksum matches its source manifest');
  for(const [mode,stride,count]of [['original',4,14],['pipeline',4,1],['pipeline',4,5],['pipeline',4,10],['pipeline',4,14],['pipeline',1,14],['pipeline',8,14]]){
   const m=await page.evaluate(async({mode,stride,count})=>{
    const a=__pipeline;a.setFaces(mode);a.setDetail(stride);a.setMood('day');a.view('group');a.actors.forEach((x,i)=>x.rig.g.visible=i<count);
    const gl=a.renderer.getContext();for(let i=0;i<8;i++){a.step(1/60);gl.finish();}
    const times=[];for(let i=0;i<45;i++){await new Promise(requestAnimationFrame);const t=performance.now();a.step(1/60);gl.finish();times.push(performance.now()-t);}times.sort((a,b)=>a-b);
    return{...a.stats(),medianMs:times[22],p95Ms:times[42],timing:'CPU+GPU synchronized render latency; not average FPS'};
   },{mode,stride,count});report.measurements.push(m);console.log(JSON.stringify({mode,stride,count,points:m.visiblePoints,median:m.medianMs,p95:m.p95Ms}));
  }
  await page.evaluate(()=>{__pipeline.actors.forEach(a=>a.rig.g.visible=true);document.body.classList.add('capture');});
  for(const view of ['group','pavi','siri','town-202'])for(const mood of ['day','night']){
   await page.evaluate(({view,mood})=>{const a=__pipeline;a.setFaces('pipeline');a.setDetail(1);a.setMood(mood);a.view(view);a.step(0);},{view,mood});
   await page.screenshot({path:`world/tests/character-pipeline-test-${view}-${mood}.png`});
  }
  for(const mode of ['original','pipeline']){
   await page.evaluate(mode=>{const a=__pipeline;a.setFaces(mode);a.setDetail(4);a.setMood('day');a.view('pavi');a.step(0);},mode);
   await page.screenshot({path:`world/tests/character-pipeline-test-pavi-${mode}.png`});
  }
  report.depthCheck=await page.evaluate(async()=>{
   const T=await import('/vendor/three/build/three.module.js'),a=__pipeline;a.setFaces('pipeline');a.view('pavi');a.step(0);
   const plane=new T.Mesh(new T.PlaneGeometry(2,2),new T.MeshBasicMaterial({color:'#ff00ff',toneMapped:false}));plane.position.copy(a.camera.position).lerp(a.actors.find(x=>x.id==='pavi').rig.head.getWorldPosition(new T.Vector3()).add(new T.Vector3(0,.21,0)),.5);plane.quaternion.copy(a.camera.quaternion);a.scene.add(plane);a.step(0);
   const gl=a.renderer.getContext(),pixel=new Uint8Array(4);gl.readPixels(Math.floor(gl.drawingBufferWidth/2),Math.floor(gl.drawingBufferHeight/2),1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);a.scene.remove(plane);plane.geometry.dispose();plane.material.dispose();return{pixel:[...pixel],passed:pixel[0]>240&&pixel[1]<15&&pixel[2]>240};
  });
  if(!report.depthCheck.passed)throw Error('Foreground occlusion failed');report.checks.push('Foreground world surface correctly occludes the point face');
  report.network=await page.evaluate(()=>performance.getEntriesByType('resource').reduce((r,e)=>{r.bytes+=e.transferSize;if(e.name.endsWith('.glb'))r.existingModelBytes+=e.transferSize;return r;},{bytes:0,existingModelBytes:0}));
  const cdp=await page.context().newCDPSession(page);await cdp.send('HeapProfiler.collectGarbage');report.heap=await cdp.send('Runtime.getHeapUsage');report.finalStats=await page.evaluate(()=>__pipeline.stats());
  if(report.errors.length)throw Error(report.errors.join('; '));report.passed=report.checks.length;console.log('Checks passed:',report.passed);
 }catch(e){report.failure=e.message;console.error(e);process.exitCode=1;}
 finally{fs.writeFileSync('world/tests/character-pipeline-test-check.json',JSON.stringify(report,null,2));await browser.close();}
})();
