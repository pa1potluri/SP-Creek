import * as THREE from 'three';
import {CAST,makeCharacter} from '../characters.js';
import {decodePoints} from './point-data.mjs';
import {roundPointMap} from '../point-footprint.js';

const base='assets/characters/pipeline-test/',canvas=document.querySelector('#view');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(1);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.05,100);
const controls={target:new THREE.Vector3(),update(){camera.lookAt(this.target);}};
let drag=null;
canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
canvas.addEventListener('pointermove',e=>{if(!drag)return;const s=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));s.theta-=(e.clientX-drag.x)*.006;s.phi=THREE.MathUtils.clamp(s.phi+(e.clientY-drag.y)*.006,.15,Math.PI*.49);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));drag={x:e.clientX,y:e.clientY};controls.update();});
canvas.addEventListener('wheel',e=>{e.preventDefault();const offset=camera.position.clone().sub(controls.target),r=THREE.MathUtils.clamp(offset.length()*Math.exp(e.deltaY*.001),.7,24);camera.position.copy(controls.target).add(offset.setLength(r));controls.update();},{passive:false});
const hemi=new THREE.HemisphereLight('#fff4d6','#789077',2.6),sun=new THREE.DirectionalLight('#ffe1ad',2);sun.position.set(-5,8,6);scene.add(hemi,sun);
const root=new THREE.Group();scene.add(root);
const mat=color=>new THREE.MeshLambertMaterial({color});
function box(w,h,d,x,y,z,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);root.add(m);return m;}
box(30,.2,25,0,-.14,0,'#a8bb88');box(9,.12,4.5,0,-.02,0,'#ead4ac');box(9,.25,2.1,0,.1,-1.2,'#dfc89f');
for(const [x,color]of [[-5,'#d7a074'],[0,'#c4d1b2'],[5,'#d6b3a7']]){
 box(3.4,2.5,1.5,x,1.15,-4,color);box(3.7,.24,1.8,x,2.5,-4,'#b78067');
 for(const dx of [-.95,.95])box(.55,.65,.04,x+dx,1.45,-3.23,'#fff0bd');box(.7,1.4,.05,x,.65,-3.22,'#8e7461');
}
for(const x of [-5.5,5.5]){box(.1,2.4,.1,x,1.1,1,'#866d57');box(.3,.4,.3,x,2.4,1,'#ffe6a0');}

const actors=[],assets=new Map(),profiles=new Map(),color=new THREE.Color();let mode='pipeline',stride=4,time=0,turn=false,frozen=false,mood='day';
async function json(url){const response=await fetch(url);if(!response.ok)throw Error(`Could not load ${url}`);return response.json();}
async function load(id,path,manifest,profile){
 const response=await fetch(base+path);if(!response.ok)throw Error(`Missing head ${id}`);
 const buffer=await response.arrayBuffer();if(buffer.byteLength!==manifest.count*20)throw Error(`Point count mismatch: ${id}`);
 const data=decodePoints(buffer,{scale:.0042,offset:[0,.25,0]});
 // Baked/procedural colors use unlit points here, so unused normals need not stay resident.
 delete data.normals;
 assets.set(id,{id,data,bytes:buffer.byteLength,geometries:new Map(),profile});
}
function geometry(asset,detail){
 if(asset.geometries.has(detail))return asset.geometries.get(detail);
 const a=asset.data,n=Math.ceil(a.count/detail),positions=new Float32Array(n*3),colors=new Float32Array(n*3),partCounts=Array(9).fill(0);let k=0;
 // Fixed record strides preserve authored point/color pairs and all sampled parts.
 for(let i=0;i<a.count;i+=detail){positions.set(a.positions.subarray(i*3,i*3+3),k*3);color.setRGB(a.colors[i*3]/255,a.colors[i*3+1]/255,a.colors[i*3+2]/255,THREE.SRGBColorSpace);color.toArray(colors,k*3);partCounts[a.parts[i]]++;k++;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));g.setAttribute('color',new THREE.BufferAttribute(colors,3));g.computeBoundingSphere();g.userData.parts=partCounts;asset.geometries.set(detail,g);return g;
}
const pointMaterial=new THREE.PointsMaterial({size:.010,vertexColors:true,sizeAttenuation:true,toneMapped:false,map:roundPointMap(),alphaTest:.5});
const heroMaterial=new THREE.PointsMaterial({size:.012,vertexColors:true,sizeAttenuation:true,toneMapped:false});
function setDetail(value){stride=+value;pointMaterial.size=.010*Math.sqrt(stride);heroMaterial.size=.012*Math.sqrt(stride);for(const actor of actors)actor.points.geometry=geometry(actor.asset,stride);document.querySelector('#detail').value=String(stride);refresh();}
function setFaces(value){mode=value;for(const actor of actors){actor.old.forEach(c=>c.visible=mode==='original');actor.points.visible=mode==='pipeline';}document.querySelector('#faces').value=mode;refresh();}
function setMood(value){mood=value;const night=value==='night';scene.background=new THREE.Color(night?'#8196ac':'#dbe8d3');hemi.intensity=night?1.65:2.6;sun.intensity=night?.55:2;pointMaterial.color.setScalar(night?.82:1);heroMaterial.color.copy(pointMaterial.color);}
function view(id='group'){
 if(id==='group'){camera.position.set(0,4.1,11.8);controls.target.set(0,1.1,0);}
 else {const actor=actors.find(a=>a.id===id)||actors[0],p=actor.rig.head.getWorldPosition(new THREE.Vector3());p.y+=.25*actor.rig.g.scale.y;camera.position.copy(p).add(new THREE.Vector3(.28,.1,1.65));controls.target.copy(p);}
 controls.update();
}
function refresh(){if(!actors.length)return;const points=actors.reduce((n,a)=>n+a.points.geometry.attributes.position.count,0);document.querySelector('#status').textContent=`${actors.length} bodies · ${mode==='pipeline'?points.toLocaleString()+' visible head points':'original game heads'} · ${stride===1?'full source':`1/${stride} density`} · ${renderer.info.render.calls} draw calls`;
}
function step(dt){time+=dt;actors.forEach((a,i)=>{a.rig.head.rotation.y=turn?Math.sin(time*.4+i*.15)*.25:0;});controls.update();renderer.render(scene,camera);for(const a of actors){const p=a.rig.head.getWorldPosition(new THREE.Vector3());p.y+=.85;p.project(camera);a.label.style.left=`${(p.x*.5+.5)*innerWidth}px`;a.label.style.top=`${(-p.y*.5+.5)*innerHeight}px`;a.label.hidden=p.z>1;}refresh();}
function stats(){return{mode,stride,mood,actors:actors.length,visibleActors:actors.filter(a=>a.rig.g.visible).length,sourcePoints:[...assets.values()].reduce((n,a)=>n+a.data.count,0),packedBytes:[...assets.values()].reduce((n,a)=>n+a.bytes,0),decodedHeadBytes:[...assets.values()].reduce((n,a)=>n+a.data.positions.byteLength+a.data.colors.byteLength+a.data.parts.byteLength,0),cachedHeadGeometryBytes:[...assets.values()].reduce((n,a)=>n+[...a.geometries.values()].reduce((m,g)=>m+g.attributes.position.array.byteLength+g.attributes.color.array.byteLength,0),0),visiblePoints:mode==='pipeline'?actors.filter(a=>a.rig.g.visible).reduce((n,a)=>n+a.points.geometry.attributes.position.count,0):0,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,programs:renderer.info.programs.length};}
function resize(){const s=Math.min(1,1600/innerWidth,900/innerHeight);renderer.setSize(Math.round(innerWidth*s),Math.round(innerHeight*s),false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
addEventListener('keydown',e=>{if(e.key.toLowerCase()==='h')document.body.classList.toggle('capture');});
try{
 const manifests=await json(base+'residents/manifest.json'),hero=await json(base+'hero/model-manifest.json');
 await Promise.all(manifests.map(async m=>{const p=await json(base+`profiles/${m.id}.json`);profiles.set(m.id,p);await load(m.id,`residents/${m.id}.bin`,m,p);}));
 await load('pavi','hero/head-points.bin',hero,await json(base+'profiles/main-character.json'));
 const entries=manifests.map((m,i)=>({id:m.id,name:m.id,asset:assets.get(m.id),outfit:[CAST.mayor,CAST.cafeHost,CAST.pianist,CAST.teacher,CAST.townswoman,CAST.rancher][i%6]}));
 entries.splice(3,0,{id:'pavi',name:'Pavi · saved hero',asset:assets.get('pavi'),outfit:{...CAST.pavi,scale:.84}},{id:'siri',name:'Siri · temporary town-202',asset:assets.get('town-202'),outfit:{...CAST.siri,scale:.84}});
 entries.forEach((entry,i)=>{
  const skin=entry.asset.profile.palette?.skin;
  const rig=makeCharacter({...entry.outfit,star:undefined,hat:'none',skin:skin?`rgb(${skin.join(',')})`:entry.outfit.skin});
  rig.g.position.set((i%7-3)*1.15,i<7?0:.25,i<7?1.2:-1.2);scene.add(rig.g);
  const old=[...rig.head.children],points=new THREE.Points(geometry(entry.asset,stride),entry.id==='pavi'?heroMaterial:pointMaterial);points.name=entry.name;rig.head.add(points);
  const label=document.createElement('span');label.className='name';label.textContent=entry.name;document.querySelector('#names').append(label);
  actors.push({...entry,rig,old,points,label});
 });
 setDetail(stride);setFaces(mode);setMood('day');scene.updateMatrixWorld(true);view();
 document.querySelector('#faces').onchange=e=>setFaces(e.target.value);document.querySelector('#detail').onchange=e=>setDetail(e.target.value);
 for(const id of ['group','pavi','siri'])document.querySelector('#'+id).onclick=()=>view(id);
 document.querySelector('#resident').onclick=()=>view('town-202');for(const id of ['day','night'])document.querySelector('#'+id).onclick=()=>setMood(id);
 document.querySelector('#pose').onclick=()=>{turn=!turn;document.querySelector('#pose').textContent=`Gentle head turn: ${turn?'on':'off'}`;};
 window.__pipeline={scene,camera,renderer,actors,assets,setDetail,setFaces,setMood,view,step,stats,setFrozen:value=>frozen=value};
 let last=performance.now();function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;if(!frozen)step(dt);}requestAnimationFrame(frame);
}catch(error){document.querySelector('#status').textContent=error.message;console.error(error);}
