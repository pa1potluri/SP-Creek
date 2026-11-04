const {chromium}=require('C:/Users/PKP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[],frames=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))errors.push(m.text());});
  await page.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(t=>{if(!window.__capturePause)fn(t);});});
  await page.goto('http://localhost:8810');await page.waitForFunction(()=>window.__app,null,{timeout:120000});
  await page.evaluate(()=>{window.__capturePause=true;});await page.waitForTimeout(200);
  for(const style of ['oil','clean'])for(const mood of ['golden','night'])for(const place of ['river','pond']) {
    const data=await page.evaluate(async({style,mood,place})=>{
      const a=window.__app,{riverZ}=await import('/src/world.js');
      a.timeline.stop();a.director.auto=false;a.director.setFree(true);a.applyStyle(style);a.world.setHamlet(true);a.life.settings.wind=a.world.wind=1;
      a.atmos.mult.cloudShadows=0.6;a.atmos.mult.clouds=1;a.atmos.mult.rain=0;a.atmos.setPreset(mood,true);
      let pos,target;
      if(place==='river'){const z=riverZ(48);pos=[27,14,z-25];target=[44,1.5,z+8];}
      else {const p=a.world.hamlet.pond.pad;pos=[p.x+20,p.y+12,p.z+22];target=[p.x-2,p.y+0.2,p.z-2];}
      const dx=target[0]-pos[0],dy=target[1]-pos[1],dz=target[2]-pos[2];
      a.director.state.pos.set(...pos);a.director.free.yaw=Math.atan2(dx,dz);a.director.free.pitch=Math.atan2(dy,Math.hypot(dx,dz));a.director.update(0);
      for(const id of ['panel','hud','uiToggle','loading'])document.getElementById(id).style.display='none';
      a.step(0);a.atmos.update(0,40,a.camera);a.world.update(0,40,a.camera);
      // Render after updating the absolute-time environmental uniforms.
      const update=a.atmos.update,worldUpdate=a.world.update;
      a.atmos.update=function(dt){return update.call(this,dt,40,a.camera);};a.world.update=function(dt){return worldUpdate.call(this,dt,40,a.camera);};
      try{a.step(0);}finally{a.atmos.update=update;a.world.update=worldUpdate;}
      return {style,mood,place,cloudAmount:a.atmos.cloudUniforms.uCloudAmount.value,audioLocked:a.audio.ctx===null};
    },{style,mood,place});
    const file=style==='oil'&&mood==='golden'?(place==='river'?'clouds-water-preview.png':'pond-preview.png'):`${place}-${style}-${mood}.png`;
    await page.screenshot({path:`world/tests/${file}`});frames.push({...data,file});console.log(file);
  }
  fs.writeFileSync('world/tests/clouds-water-frames.json',JSON.stringify(frames,null,2));
  console.log('Browser errors:',JSON.stringify(errors));await browser.close();if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});
