// Local review capture; no sound, private uploads or publication.
const fs=require('fs'),{chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/PKP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const publicCopy=process.argv.includes('--public'),browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']}),page=await browser.newPage({viewport:{width:960,height:600}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))errors.push(m.text());});await page.goto(process.env.DH_URL||'http://127.0.0.1:8811');await page.waitForFunction(()=>window.__app,undefined,{timeout:120000});
 await page.evaluate(()=>{document.querySelector('#freezeBtn').click();document.body.classList.add('ui-hidden');});await page.addStyleTag({content:'body > :not(canvas):not(script){visibility:hidden!important}'});
 const data=await page.evaluate(async publicCopy=>{
  const a=window.__app,T=await import('three'),W=await import('/src/world.js'),original=a.projectData(),walks=[];let poses=0,landActorChecks=0;
  a.timeline.stop();a.director.auto=false;a.director.sway=0;
  const shots=[39,40,41,54,69,79,76,27,82,83,84,85,86,87,88,89,90,91,92,93,94,95];
  for(const mood of ['golden','night'])for(const shot of shots){a.applyStyle('film');a.setSeason((shot>=82&&shot<=85)||shot===92?'winter':'summer');a.atmos.setPreset(mood,true);
   for(const phase of [0,.5,.95]){a.director.playShot(shot,{cut:true});a.director.paused=true;a.director.t=a.director.shot.duration*phase;a.step(0);poses++;
    if(!a.camera.position.toArray().every(Number.isFinite))throw Error('Nonfinite view '+shot);
    if(a.director.shot.snowDay||a.director.shot.meadowOuting){landActorChecks++;if(!Object.values(a.life.stars).every(p=>p.g.visible&&!a.world.inPond(p.g.position.x,p.g.position.z,.4)))throw Error('Land scene footing '+shot);}
   }
  }
  const it=a.world.interiors.cafe;it.group.updateWorldMatrix(true,false);const cafe=it.group.localToWorld(new T.Vector3(-it.hx+4,0,-1)),direction=new T.Vector3(0,0,1).applyQuaternion(it.group.quaternion);
  const routes=[['town',0,14,1,0],['snow',-36,-53,1,0],['kite',-205,6,0,1],['picnic',-224,4,1,0],['cove',W.coastX(-35)+10,-35,0,1],['lane',-318,20,-1,0],['cafe',cafe.x,cafe.z,direction.x,direction.z]];
  for(const mood of ['golden','night'])for(const [name,x,z,dx,dz]of routes){a.setSeason(name==='snow'?'winter':'summer');a.atmos.setPreset(mood,true);a.game.enter();a.game.pos.set(x,a.game._ground(x,z,99),z);a.game.yaw=Math.atan2(dx,dz);a.game.facing=a.game.yaw;a.game.pitch=.28;const start=a.game.pos.clone();let dry=true,finite=true;
   for(let i=0;i<45;i++){a.game._move(dx*.04,dz*.04,.35);a.step(1/60);dry&&=!a.world.inPond(a.game.pos.x,a.game.pos.z,.1);finite&&=a.game.pos.toArray().every(Number.isFinite);}
   const distance=a.game.pos.distanceTo(start);walks.push({name,mood,distance,dry,finite});if(!dry||!finite||distance<.2)throw Error('Walk check '+JSON.stringify(walks.at(-1)));a.game.exit();
  }
  a.loadProject(original);a.director.playShot(0,{cut:true});a.step(0);
  const privateModels=!!a.life.stars.pavi.model&&!!a.life.stars.siri.model;if(publicCopy&&privateModels)throw Error('Public copy still has private models');
  if(a.audio.ctx!==null)throw Error('Review must never start sound');return {poses,landActorChecks,walks,privateModels,audioLocked:true};
 },publicCopy);
 const views=publicCopy?[['41-fallback',94]]:[['31',40],['40',39],['42',54],['43',0],['44',84],['45-kites',87],['45-picnic',90],['46',95]];
 for(const [task,shot]of views)for(const [style,mood,suffix]of [['film','golden','day'],['film','night','night'],['oil','golden','oil']]){
  await page.evaluate(({task,shot,style,mood})=>{const a=window.__app;a.game.exit();a.timeline.stop();a.director.auto=false;a.director.sway=0;a.applyStyle(style);a.setSeason(shot===84?'winter':'summer');a.atmos.setPreset(mood,true);a.director.playShot(shot,{cut:true});a.director.paused=true;a.director.t=shot===54?75:30;a.step(.4);
   window.__reviewHidden=[];if(task==='42')a.world.root.parent.traverse(g=>{if(g.name==='Pavi'||g.name==='Siri')g.traverse(m=>{if(m.isMesh||m.isSprite){window.__reviewHidden.push([m,m.layers.mask,m.castShadow]);m.layers.disableAll();m.castShadow=false;}});});
  },{task,shot,style,mood});
  await page.screenshot({path:`world/tests/self-review-3-${task}-${suffix}.png`});
  await page.evaluate(()=>{for(const [m,mask,shadow]of window.__reviewHidden){m.layers.mask=mask;m.castShadow=shadow;}window.__reviewHidden=[];});
 }
 if(!publicCopy)for(const name of ['snow','picnic','cove','cafe'])for(const mood of ['golden','night']){
  await page.evaluate(async({name,mood})=>{const a=window.__app,T=await import('three'),W=await import('/src/world.js'),it=a.world.interiors.cafe,cafe=it.group.localToWorld(new T.Vector3(-it.hx+4,0,-1)),direction=new T.Vector3(0,0,1).applyQuaternion(it.group.quaternion),route={snow:[-36,-53,1,0],picnic:[-224,4,1,0],cove:[W.coastX(-35)+10,-35,0,1],cafe:[cafe.x,cafe.z,direction.x,direction.z]}[name], [x,z,dx,dz]=route;
   a.applyStyle('film');a.setSeason(name==='snow'?'winter':'summer');a.atmos.setPreset(mood,true);a.game.enter();a.game.pos.set(x,a.game._ground(x,z,99),z);a.game.yaw=Math.atan2(dx,dz);a.game.facing=a.game.yaw;a.game.pitch=.28;for(let i=0;i<45;i++){a.game._move(dx*.04,dz*.04,.35);a.step(1/60);}
  },{name,mood});
  await page.screenshot({path:`world/tests/self-review-3-walk-${name}-${mood==='night'?'night':'day'}.png`});await page.evaluate(()=>__app.game.exit());
 }
 if(await page.evaluate(()=>__app.audio.ctx!==null))throw Error('Review capture unlocked audio');
 fs.writeFileSync(`world/tests/self-review-3-${publicCopy?'public':'check'}.json`,JSON.stringify({...data,errors,url:process.env.DH_URL||'http://127.0.0.1:8811'},null,2));
 await browser.close();if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({poses:data.poses,landActorChecks:data.landActorChecks,walks:data.walks.length,privateModels:data.privateModels,errors}));
})().catch(e=>{console.error(e);process.exit(1)});
