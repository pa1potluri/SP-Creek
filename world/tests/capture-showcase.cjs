// Local-only README media. Requires Playwright/Chrome and ffmpeg on PATH (or FFMPEG).
const fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/PKP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const shots=[['sunset-cove',39,20,'golden'],['balloon-ride',54,75,'golden'],['market-day',69,20,'golden'],['rainbow',79,20,'morning'],['garden-growth',76,0,'golden'],['lantern-evening',27,20,'villageDusk']];
(async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sp-creek-showcase-')),output=path.resolve('docs/media');fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:640,height:360}}),errors=[],proof=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.DH_URL||'http://127.0.0.1:8811');await page.waitForFunction(()=>window.__app,undefined,{timeout:120000});
 await page.evaluate(()=>{document.querySelector('#freezeBtn').click();document.body.classList.add('ui-hidden');});
 await page.addStyleTag({content:'body > :not(canvas):not(script){visibility:hidden!important}'});
 for(const [name,shot,start,mood]of shots){
  await page.evaluate(({name,shot,mood})=>{
   const a=window.__app;a.timeline.stop();a.director.auto=false;a.director.sway=0;a.applyStyle('film');a.setSeason('summer');a.setWeather(name==='rainbow'?'clearing':'clear');a.setFestival(name==='lantern-evening');a.world.market.setActive(name==='market-day');a.atmos.setPreset(mood,true);a.director.playShot(shot,{cut:true});a.director.paused=true;
  },{name,shot,mood});
  let hidden=0;
  for(let frame=0;frame<20;frame++){
   hidden=await page.evaluate(({start,frame,name})=>{
    const a=window.__app;a.director.t=start+frame*(name==='garden-growth'?4:0.1);a.step(0.1);
    let count=0;a.world.root.parent.traverse(g=>{if(g.name==='Pavi'||g.name==='Siri')g.traverse(m=>{if(m.isMesh||m.isSprite){m.layers.disableAll();m.castShadow=false;count++;}});});
    if(name==='garden-growth')for(const g of [a.life.garden.can,a.life.garden.pickedCarrot,...a.life.garden.drops,...a.life.garden.seeds])g?.traverse(m=>{if(m.isMesh)m.layers.disableAll();});
    if(a.audio.ctx!==null)throw Error('Capture must never start sound');return count;
   },{start,frame,name});
   await page.screenshot({path:path.join(temp,`${name}-${String(frame).padStart(3,'0')}.png`)});
  }
  if(!hidden)throw Error('No excluded character meshes detected');
  // A gentle forward/back loop joins without a hard reset or extra duplicated end frames.
  for(let i=20;i<38;i++)fs.copyFileSync(path.join(temp,`${name}-${String(38-i).padStart(3,'0')}.png`),path.join(temp,`${name}-${String(i).padStart(3,'0')}.png`));
  const file=path.join(output,name+'.webp');execFileSync(process.env.FFMPEG||'ffmpeg',['-y','-loglevel','error','-framerate','10','-i',path.join(temp,name+'-%03d.png'),'-frames:v','38','-c:v','libwebp_anim','-quality','65','-loop','0',file]);
  const encoded=fs.readFileSync(file),bytes=encoded.length;let frames=0,duration=0;
  for(let offset=12;offset+8<=bytes;){const size=encoded.readUInt32LE(offset+4);if(encoded.toString('ascii',offset,offset+4)==='ANMF'){frames++;duration+=encoded.readUIntLE(offset+20,3);}offset+=8+size+(size%2);}
  if(bytes>=3000000||duration!==3800||frames<2)throw Error(name+': invalid size or animation duration');
  for(const [suffix,previewMood]of [['day','golden'],['night','night']]){
   await page.evaluate(mood=>{__app.atmos.setPreset(mood,true);__app.step(0);},previewMood);
   await page.screenshot({path:`world/tests/showcase-media-${shot}-${suffix}.png`});
  }
  proof.push({file:'docs/media/'+name+'.webp',shot,width:640,height:360,seconds:duration/1000,frames,bytes,excludedCharacterMeshes:hidden});console.log(name,bytes);
 }
 fs.writeFileSync('world/tests/showcase-media-check.json',JSON.stringify({clips:proof,audioLocked:await page.evaluate(()=>__app.audio.ctx===null),errors},null,2));
 await browser.close();if(errors.length)throw Error(errors.join('\n'));
 const resolved=path.resolve(temp),base=path.resolve(os.tmpdir())+path.sep;
 if(resolved.startsWith(base)&&path.basename(resolved).startsWith('sp-creek-showcase-'))fs.rmSync(resolved,{recursive:true});
})().catch(e=>{console.error(e);process.exit(1)});
