const {chromium}=require('C:/Users/PKP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});const report={errors:[],checks:[]};
try{
 const page=await b.newPage({viewport:{width:1280,height:800}});page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto('http://127.0.0.1:8811/character-pipeline-test.html');await page.waitForFunction(()=>window.__pipeline,undefined,{timeout:60000});
 report.checks=await page.evaluate(async()=>{
  const T=await import('/vendor/three/build/three.module.js'),a=__pipeline,checks=[],check=(ok,text)=>{if(!ok)throw Error(text);checks.push(text);};a.setFrozen(true);a.step(0);
  check(a.actors.length===14,'Fourteen character slots retained');
  for(const actor of a.actors.filter(x=>x.asset.solid)){
   const meshes=[];let points=0;actor.points.traverse(o=>{if(o.isMesh)meshes.push(o);if(o.isPoints)points++;});
   check(meshes.length===1&&points===0,actor.id+' uses one shared-material mesh instead of dots');
   check(meshes.every(m=>!m.material.transparent&&m.material.opacity===1&&m.material.alphaTest===0&&!m.material.map),actor.id+' has fully opaque untextured materials');
   let covered=true;const p=actor.asset.profile.parameters;
   for(const target of [new T.Vector3(0,0,0),new T.Vector3(0,p.faceHeight*.36+(p.hairHeight||115)*.1,-14)]){
    const center=actor.points.localToWorld(target);
    for(let i=0;i<8;i++)for(const elevation of [-.5,0,.5]){const direction=new T.Vector3(Math.sin(i*Math.PI/4),elevation,Math.cos(i*Math.PI/4)).normalize(),ray=new T.Raycaster(center.clone().add(direction),direction.clone().negate(),0,2);if(!ray.intersectObjects(meshes,false).length)covered=false;}
   }
   check(covered,actor.id+' face and hair remain solid from 24 directions');
  }
  check(a.actors.find(x=>x.id==='pavi').points.isPoints,'Pavi retains the separate detailed representation');
  check(!performance.getEntriesByType('resource').some(r=>/residents\/town-.*\.bin/.test(r.name)),'Preview downloads no resident point files');
  a.setFaces('original');check(a.actors.every(x=>!x.points.visible),'Old-head comparison still works');a.setFaces('pipeline');return checks;
 });
 report.preview=await page.evaluate(()=>__pipeline.stats());
 await page.evaluate(()=>document.body.classList.add('capture'));
 for(const mood of ['day','night'])for(const view of ['group','pavi','town-202']){
  await page.evaluate(({mood,view})=>{__pipeline.setMood(mood);__pipeline.view(view);__pipeline.step(0);},{mood,view});await page.screenshot({path:`world/tests/solid-residents-${view}-${mood}.png`});
 }
 for(const angle of [90,180,270]){
  await page.evaluate(async angle=>{const T=await import('/vendor/three/build/three.module.js'),a=__pipeline,actor=a.actors.find(x=>x.id==='town-202');a.setMood('day');a.view('town-202');const c=actor.points.getWorldPosition(new T.Vector3()),theta=angle*Math.PI/180;a.camera.position.copy(c).add(new T.Vector3(Math.sin(theta)*1.65,.1,Math.cos(theta)*1.65));a.step(0);},angle);
  await page.screenshot({path:`world/tests/solid-residents-turn-${angle}.png`});
 }
 await page.goto('http://127.0.0.1:8811/?characterFaces=pipeline');await page.waitForFunction(()=>window.__app,undefined,{timeout:120000});
 report.game=await page.evaluate(()=>{const a=__app,people=[...a.life.walkers,...a.life.hamletWalkers,...a.life.townKids];const ids=[...new Set(people.map(w=>w.p.pipelineProfile))];const walking=a.life.walkers[0];const old=walking.pos.clone();walking.leaveSeat();walking.endChat();walking.state='walk';walking.target=old.clone().add({x:1,y:0,z:1});for(let i=0;i<60;i++)a.step(1/60);return{ids,allSolid:people.every(w=>w.p.pipelineHead.userData.representation==='solid-pedestrian'),walked:walking.pos.distanceTo(old),audioLocked:a.audio.ctx===null,residentPointRequests:performance.getEntriesByType('resource').filter(r=>/pipeline-game\/town-.*\.bin/.test(r.name)).length};});
 if(!report.game.allSolid||report.game.walked<.1||!report.game.audioLocked||report.game.residentPointRequests)throw Error('Actual-game walking integration failed');report.checks.push('Actual-game pedestrians walk with solid heads, no resident point downloads and locked audio');
 await page.evaluate(()=>document.querySelector('#freezeBtn').click());await page.addStyleTag({content:'body > :not(canvas):not(script){visibility:hidden!important}'});
 for(const mood of ['golden','night']){
  await page.evaluate(async mood=>{const T=await import('/vendor/three/build/three.module.js'),a=__app,w=a.life.walkers[0];a.timeline.stop();a.director.auto=false;a.applyStyle('film');a.atmos.setPreset(mood,true);a.director.setFree(true);const center=w.p.head.getWorldPosition(new T.Vector3()).add(new T.Vector3(0,.2,0)),front=new T.Vector3(0,0,1).applyQuaternion(w.p.g.quaternion);a.director.state.pos.copy(center).addScaledVector(front,3.2);a.director.state.pos.y+=.3;const d=center.clone().sub(a.director.state.pos);a.director.free.yaw=Math.atan2(d.x,d.z);a.director.free.pitch=Math.atan2(d.y,Math.hypot(d.x,d.z));a.step(0);},mood);
  await page.screenshot({path:`world/tests/solid-residents-gameplay-${mood==='night'?'night':'day'}.png`});
 }
 report.styles=await page.evaluate(async()=>{const a=__app,styles=Object.keys((await import('/src/styles.js')).STYLES);for(const style of styles){a.applyStyle(style);a.step(0);}a.applyStyle('film');return styles;});
 if(report.errors.length)throw Error(report.errors.join('; '));report.passed=report.checks.length;console.log(JSON.stringify({passed:report.passed,game:report.game,preview:report.preview,styles:report.styles,errors:report.errors}));
}catch(error){report.failure=error.message;console.error(error);process.exitCode=1;}finally{fs.writeFileSync('world/tests/solid-residents-check.json',JSON.stringify(report,null,2));await b.close();}})();
