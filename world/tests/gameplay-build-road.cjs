const {chromium}=require('C:/Users/PKP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});try{
const p=await b.newPage({viewport:{width:1280,height:800}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:8811/');await p.waitForFunction(()=>window.__app?.exploreUI&&document.querySelector('#loading').classList.contains('done'),undefined,{timeout:90000});await p.waitForTimeout(900);
const result=await p.evaluate(async()=>{
const a=__app,T=await import('/vendor/three/build/three.module.js'),{terrainHeight}=await import('/src/world.js'),results=[],check=(v,m)=>{if(!v)throw Error(m);results.push(m);},click=id=>document.querySelector(id).click();
click('#buildModeToggle');check(!document.querySelector('#buildDock').hidden,'Bottom Build dock opens');
const types=[];for(const cat of document.querySelectorAll('#buildDock button')){cat.click();if(cat.dataset.category!=='Roads')for(const e of document.querySelectorAll('#buildCatalogue [data-build]'))if(!e.hidden)types.push(e.dataset.build);}
check(new Set(types).size===43&&types.length===43,'All 43 choices appear in exactly one category');
check(getComputedStyle(document.querySelector('#buildRotation').closest('label')).display==='none','Roads hide unrelated building sliders');
check(document.querySelector('#drawRoad').getBoundingClientRect().height>0,'Road tools visible');
a.director.customShot={name:'Road test',duration:100,loop:true,sample(t,out){out.pos.set(-105,terrainHeight(-120,-30)+26,0);out.look.set(-120,terrainHeight(-120,-30),-30);}};a.director.mode='shot';a.director.index=-1;a.director.t=0;a.director.flight=null;a.director.paused=false;a.step(0);
click('#drawRoad');check(a.director.paused&&!a.timeline.playing&&!a.director.auto,'Drawing stops automatic camera motion');
const canvas=document.querySelector('#view'),r=canvas.getBoundingClientRect(),points=[[-120,-32],[-120,-25],[-113,-22]];
for(const [x,z]of points){const v=new T.Vector3(x,terrainHeight(x,z),z).project(a.camera),ev={clientX:r.left+(v.x+1)*r.width/2,clientY:r.top+(1-v.y)*r.height/2,button:0,bubbles:true};canvas.dispatchEvent(new PointerEvent('pointerdown',ev));canvas.dispatchEvent(new PointerEvent('pointerup',ev));}
const n=a.world.roads.length;click('#finishRoad');check(a.world.roads.length===n+1,'Three canvas clicks and Finish create a road');check(a.world.roads.at(-1).points.length===3,'Road saves all three ground points');check(a.world.roads.at(-1).obj.geometry.attributes.position.count>0,'Road has visible mesh geometry');
const data=a.projectData();check(JSON.stringify(data).includes('road'),'Road included in saved project');
click('#undoRoad');check(a.world.roads.length===n,'Remove last road works');
click('#freeBtn');const start=a.director.state.pos.clone();canvas.dispatchEvent(new WheelEvent('wheel',{deltaY:-120,bubbles:true,cancelable:true}));const moved=a.director.state.pos.clone();check(moved.distanceTo(start)>2.9,'Free camera wheel zooms in');canvas.dispatchEvent(new WheelEvent('wheel',{deltaY:120,bubbles:true,cancelable:true}));check(a.director.state.pos.distanceTo(start)<.001,'Free camera wheel zooms out');
check(a.audio.ctx===null,'No test starts audio');return{passed:results.length,results};});
await p.screenshot({path:'world/tests/gameplay-navigation-roads.png'});if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync('world/tests/gameplay-build-road-check.json',JSON.stringify({...result,errors},null,2));console.log(JSON.stringify(result));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

