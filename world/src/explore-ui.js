import {walkHeight} from './world.js';
import {setupCreateUI} from './create-ui.js';
const PLACES=[
 ['Town',0,0,14],['River & mill',10,18,98],['Train station',11,65,22],
 ['Honey Bun Café',17,9,15],['Willow Creek',21,-55,80],['Old Hollow',25,125,-2],
 ['Firefly forest',26,-90,-204],['Meadow & waterfall',27,-215,4],['Crystal Mine',28,173,-106],
 ['Balloon hill',29,202,-137],['Sunset beach',40,-355,-20],['Playground',45,43,57],
 ['Camping',59,-200,65],['Pony farm',61,-180,-66],
];
export function setupExploreUI(app){
 let buildMode=null;
 const panel=document.querySelector('#panel'),bar=document.querySelector('#styleBar'),brush=document.querySelector('#brushPanel'),toggle=document.querySelector('#brushToggle');
 const popup=document.createElement('section');popup.id='brushPopover';popup.hidden=true;popup.setAttribute('aria-label','Brush and finish settings');popup.append(brush);document.body.append(popup);
 const close=()=>{popup.hidden=true;toggle.setAttribute('aria-expanded','false');};
 const layout=()=>{const closed=document.body.classList.contains('ui-hidden')||getComputedStyle(panel).display==='none';document.body.style.setProperty('--pictureInset',closed?'0px':panel.getBoundingClientRect().width+'px');popup.style.top=(bar.getBoundingClientRect().bottom+7)+'px';if(app.game.active)buildMode?.hide();};
 toggle.onclick=()=>{buildMode?.closePopup();const open=popup.hidden;popup.hidden=!open;brush.open=true;toggle.setAttribute('aria-expanded',String(open));layout();};
 document.addEventListener('pointerdown',e=>{if(!popup.hidden&&!popup.contains(e.target)&&!toggle.contains(e.target))close();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!popup.hidden){close();e.preventDefault();e.stopPropagation();}},true);
 new MutationObserver(layout).observe(document.body,{attributes:true,attributeFilter:['class']});
 new MutationObserver(layout).observe(panel,{attributes:true,attributeFilter:['style']});
 addEventListener('resize',layout);layout();
 bar.addEventListener('pointerdown',()=>{document.body.style.cursor='';});
 const buildButton=document.createElement('button');buildButton.id='buildModeToggle';buildButton.textContent='Build';buildButton.setAttribute('aria-expanded','false');document.querySelector('#modeControls').append(buildButton);
 const buildPanel=document.querySelector('#buildPanel'),buildPopup=document.createElement('section'),dock=document.createElement('nav');
 buildPopup.id='buildPopover';buildPopup.hidden=true;buildPopup.setAttribute('aria-label','Building tools');buildPopup.append(buildPanel);document.body.append(buildPopup);
 dock.id='buildDock';dock.hidden=true;dock.setAttribute('aria-label','Build categories');document.body.append(dock);
 const roads=document.createElement('div');roads.id='buildRoadTools';const roadHeading=[...buildPanel.children].find(e=>e.tagName==='H3');let roadNode=roadHeading;while(roadNode){const next=roadNode.nextElementSibling;roads.append(roadNode);roadNode=next;}buildPanel.append(roads);
 const roadStatus=document.createElement('p');roadStatus.id='roadStatus';roadStatus.setAttribute('role','status');roadStatus.setAttribute('aria-live','polite');roads.prepend(roadStatus);
 const syncRoadStatus=()=>{roadStatus.textContent=document.querySelector('#hint').textContent||'Choose Draw road, click ground points, then Save road.';};
 new MutationObserver(syncRoadStatus).observe(document.querySelector('#hint'),{childList:true,characterData:true,subtree:true});syncRoadStatus();
 const categories=[
  ['🏠','Buildings','shop hotel house barn chapel tower windmill cabin brick blacksmith'],
  ['🌻','Gardens','gardenFence vegetablePatch flowerBox seedBed sunflowerBed carrotBed pumpkinBed flowerBed'],
  ['🐴','Farm','farmBarn ponyRail farmHay farmVegetables farmPond'],
  ['🧺','Market','marketFruit marketFlowers marketBread marketToys marketBalloons'],
  ['🎠','Playground','playSwing playSlide playSeesaw playSandbox playClimber'],
  ['📦','Props','hitch laundryLine waterWell woodPile mailbox lanternString gardenBench snowman pumpkinPile littleBridge'],
  ['🛤','Roads',''],
 ];
 const closeBuild=()=>{buildPopup.hidden=true;};
 const hideBuild=()=>{dock.hidden=true;closeBuild();buildButton.classList.remove('on');buildButton.setAttribute('aria-expanded','false');};
 const showCategory=(name,types)=>{close();buildPopup.hidden=false;buildPanel.open=true;const road=name==='Roads';for(const e of buildPanel.children)e.hidden=road?e!==roads:e===roads;for(const e of document.querySelectorAll('#buildCatalogue [data-build]'))e.hidden=!types.split(' ').includes(e.dataset.build);dock.querySelectorAll('button').forEach(e=>e.classList.toggle('on',e.dataset.category===name));};
 for(const [icon,name,types]of categories){const b=document.createElement('button');b.textContent=icon+' '+name;b.dataset.category=name;b.onclick=()=>showCategory(name,types);dock.append(b);}
 buildButton.onclick=()=>{if(!dock.hidden)return hideBuild();app.game.exit();dock.hidden=false;buildButton.classList.add('on');buildButton.setAttribute('aria-expanded','true');showCategory('Buildings',categories[0][2]);};
 document.querySelectorAll('#buildCatalogue [data-build]').forEach(b=>b.addEventListener('click',closeBuild));
 document.addEventListener('pointerdown',e=>{const drawing=['road','fence'].includes(document.querySelector('#view').dataset.tool);if(!buildPopup.hidden&&!buildPopup.contains(e.target)&&!dock.contains(e.target)&&!buildButton.contains(e.target)&&!(drawing&&e.target.id==='view'))closeBuild();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeBuild();});
 buildMode={hide:hideBuild,closePopup:closeBuild};
 const list=document.querySelector('#placeList');
 for(const [name,shot,x,z]of PLACES){const b=document.createElement('button');b.textContent=name;b.dataset.place=String(shot);b.onclick=()=>{
   close();document.body.style.cursor='';document.querySelector('#showcaseCaption')?.style.setProperty('display','none');const playing=app.game.active;app.game.exit();app.timeline.stop();app.director.auto=false;app.director.playShot(shot,{cut:true});app.director.update(0);
   if(playing){let spawn=null;for(const r of [0,2,4,6,8]){for(let i=0;i<(r?12:1);i++){const a=i*Math.PI/6,p={x:x+Math.sin(a)*r,z:z+Math.cos(a)*r};if(!app.world.inPond(p.x,p.z,.6)&&!app.game._blocked(p.x,p.z,.4)){spawn=p;break;}}if(spawn)break;}
    if(spawn){app.game.enter();app.game.pos.set(spawn.x,walkHeight(spawn.x,spawn.z),spawn.z);app.game.vy=0;app.game.grounded=true;app.game.keys.clear();app.game._cam.copy(app.game.pos).add({x:0,y:3,z:5});}
   }
   list.querySelectorAll('button').forEach(p=>p.classList.toggle('on',p===b));app.renderClips();
  };list.append(b);}
 app.exploreUI={closeBrush:close,layout};
 setupCreateUI();
}

