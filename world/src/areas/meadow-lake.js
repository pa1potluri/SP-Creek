import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { terrainHeight, pondRadius, smoothstep } from '../world.js';
import { makeCharacter, CAST, animatePerson, gesture } from '../characters.js';
import { imageTexture, rng } from '../textures.js';

// Shared only by the lake and cove: an open, rounded hull with quiet water friends.
export function makeRowingBoat(world,parent,sample,keepWater){
  const root=new THREE.Group(),boat=new THREE.Group();root.name='Little rowing boat and water friends';parent.add(root);root.add(boat);
  const material=color=>new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide}),blue=material('#91c8cc'),cream=material('#f6e4bd'),wood=material('#c69b70'),gold=material('#edc171'),ink=material('#465d65');
  const add=(geo,mat,x,y,z,g=boat)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;};
  add(new THREE.SphereGeometry(1,24,12,0,Math.PI*2,Math.PI/2,Math.PI/2).scale(1,0.5,2.1),blue,0,0.35,0);
  add(new THREE.SphereGeometry(1,24,12,0,Math.PI*2,Math.PI/2,Math.PI/2).scale(0.88,0.35,1.9),cream,0,0.36,0);
  add(new THREE.TorusGeometry(1,0.065,6,40).rotateX(Math.PI/2).scale(1,1,2.1),cream,0,0.35,0);
  for(const z of [-0.7,0.7])add(new THREE.CapsuleGeometry(0.08,1.5,4,12).rotateZ(Math.PI/2),wood,0,0.38,z);
  const paddles=[-1,1].map(side=>{const g=new THREE.Group();g.position.set(side*0.85,0.42,0);boat.add(g);add(new THREE.CapsuleGeometry(0.035,1.65,3,8).rotateZ(Math.PI/2),wood,side*0.55,0,0,g);add(new THREE.SphereGeometry(1,10,8).scale(0.32,0.035,0.14),cream,side*1.38,0,0,g);return g;});
  const ducks=Array.from({length:3},()=>{const g=new THREE.Group();root.add(g);add(new THREE.SphereGeometry(0.19,10,8).scale(0.8,0.85,1.35),cream,0,0.14,0,g);add(new THREE.SphereGeometry(0.11,10,8),cream,0,0.32,0.17,g);add(new THREE.SphereGeometry(0.065,8,6).scale(1,0.45,1.4),gold,0,0.29,0.29,g);for(const x of [-0.07,0.07])add(new THREE.SphereGeometry(0.018,6,6),ink,x,0.34,0.25,g);return g;});
  const fish=Array.from({length:3},(_,i)=>{const g=new THREE.Group();root.add(g);add(new THREE.SphereGeometry(0.12,10,8).scale(0.7,0.7,1.8),i%2?gold:blue,0,0,0,g);add(new THREE.SphereGeometry(0.08,8,6).scale(1.5,0.5,1),cream,0,0,-0.21,g);return g;});
  const avoidBoat=(position,others=[])=>{const clear=p=>Math.hypot(p.x-boat.position.x,p.z-boat.position.z)>=3.1&&others.every(q=>Math.hypot(p.x-q.position.x,p.z-q.position.z)>=0.75);if(clear(position))return;const angle=Math.atan2(position.x-boat.position.x,position.z-boat.position.z);for(let i=0;i<32;i++){const a=angle+(i%2?1:-1)*Math.ceil(i/2)*Math.PI/16,candidate=position.clone();candidate.x=boat.position.x+Math.sin(a)*3.2;candidate.z=boat.position.z+Math.cos(a)*3.2;keepWater(candidate);if(clear(candidate)){position.copy(candidate);return;}}};
  const api={root,boat,paddles,ducks,fish,sample,avoidBoat,update(t){const p=sample(t);boat.position.copy(p.pos);boat.rotation.set(0,p.yaw,Math.sin(t*0.45)*0.012);paddles.forEach((g,i)=>{g.rotation.y=Math.sin(t*0.85)*0.23;g.rotation.z=(i?1:-1)*(0.12+Math.cos(t*0.85)*0.1);});ducks.forEach((g,i)=>{const q=sample(t-42-i*12);g.position.copy(q.pos);g.position.x+=(i-1)*0.4;keepWater(g.position);g.position.y=p.pos.y-0.12;avoidBoat(g.position,ducks.slice(0,i));g.rotation.y=q.yaw;});fish.forEach((g,i)=>{const q=sample(t+12+i*7),u=((t+i*8)%25+25)%25;g.visible=u<1.8;g.position.copy(q.pos);g.position.x+=1.8;keepWater(g.position);g.position.y=p.pos.y-0.1+Math.sin(Math.min(1,u/1.8)*Math.PI)*0.22;g.rotation.set(Math.cos(u/1.8*Math.PI)*0.35,q.yaw,0);});}};
  api.update(0);return api;
}
export const MEADOW={x:-225,z:0}, LAKE={x:-240,z:-18,rx:12,rz:8.5};
export const MEADOW_OUTING={kite:{x:-205,z:6},picnic:{x:-224,z:2}};
const OUTING_LINKS=[[[-214,13],[-210,10],[-205,6]],[[-221,-4],[-222,-1],[-224,2]]];
const outingClear=(x,z)=>Object.entries(MEADOW_OUTING).some(([kind,p])=>kind==='kite'?Math.hypot((x-p.x)/9,(z-p.z)/7)<1:Math.abs(x-p.x)<6&&Math.abs(z-p.z)<5)||OUTING_LINKS.some(points=>points.some((a,i)=>{const b=points[i+1];if(!b)return false;const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<1.7;}));
function buildMeadowOuting(world,parent){
 const root=new THREE.Group();root.name='Kite day and waterfall picnic';parent.add(root);
 const groups={},colors=['#ff6795','#42d9ef','#ffd34d','#79e692','#aa8bff'],mat=color=>new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide}),cream=mat('#f5e5bf'),wood=world.mat.wood;
 const add=(g,geo,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;};
 for(const [kind,p]of Object.entries(MEADOW_OUTING)){world.registerAreaPad({...p,hx:6,hz:5,blend:1,clearOnly:true});const g=new THREE.Group();g.position.set(p.x,terrainHeight(p.x,p.z),p.z);root.add(g);groups[kind]=g;}
 world.updateTerrain();
 // The clearing uses the existing textured meadow ground, with no separate raised floor.
 for(const points of OUTING_LINKS){const path=world._ribbon(points,2.4,world._pathMaterial(),{step:1,lift:.08});parent.attach(path);}
 const shape=new THREE.Shape();shape.moveTo(0,1.1);shape.quadraticCurveTo(.15,1.1,.28,.85);shape.lineTo(.75,.15);shape.quadraticCurveTo(.88,0,.74,-.16);shape.lineTo(.15,-.95);shape.quadraticCurveTo(0,-1.1,-.15,-.95);shape.lineTo(-.74,-.16);shape.quadraticCurveTo(-.88,0,-.75,.15);shape.lineTo(-.28,.85);shape.quadraticCurveTo(-.15,1.1,0,1.1);
 const kiteGeometry=new THREE.ShapeGeometry(shape),kites=[],strings=[];
 for(let i=0;i<5;i++){const g=new THREE.Group();groups.kite.add(g);const sail=mat(colors[i]);sail.emissive.set(colors[i]);sail.emissiveIntensity=.2;add(g,kiteGeometry,sail);g.scale.setScalar(1.35);const border=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(shape.getPoints(40).map(p=>new THREE.Vector3(p.x,p.y,.01))),new THREE.LineBasicMaterial({color:'#fff5cb'}));g.add(border);const tails=[];for(let j=0;j<5;j++){const tail=add(g,new THREE.CapsuleGeometry(.055,.25,3,6),mat(colors[(i+j+1)%5]),0,-1.35-j*.34,0);tails.push(tail);}kites.push({g,tails});const geo=new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(17*3),3)),line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:'#d7c9ac',transparent:true,opacity:.8}));line.frustumCulled=false;groups.kite.add(line);strings.push(line);}
 const blanket=add(groups.picnic,new THREE.BoxGeometry(4,.06,3.2),mat('#a9c8cf'),0,.08,0);
 for(let x=0;x<8;x++)for(let z=0;z<6;z++)if((x+z)%2===0)add(groups.picnic,new THREE.BoxGeometry(.48,.008,.48),mat('#e9d3bd'),-1.75+x*.5,.115,-1.25+z*.5);
 const basket=add(groups.picnic,new THREE.SphereGeometry(.55,18,10,0,Math.PI*2,Math.PI/2,Math.PI/2),wood,0,.42,0);basket.scale.set(1,.75,.7);
 const handle=add(groups.picnic,new THREE.TorusGeometry(.4,.045,6,20,Math.PI),wood,0,.44,0);handle.scale.z=.5;
 const fruit=[];for(let i=0;i<9;i++){const a=i*2.399,r=.13+(i%3)*.1;fruit.push(add(groups.picnic,new THREE.SphereGeometry(.13,12,8),mat(i%2?'#e9bc77':'#dba6a4'),Math.sin(a)*r,.48+(i%2)*.1,Math.cos(a)*r));}
 const ducks=[];for(let i=0;i<3;i++){const g=new THREE.Group();groups.picnic.add(g);const body=add(g,new THREE.SphereGeometry(.20,12,8),cream,0,.18,0);body.scale.set(.8,.8,1.3);add(g,new THREE.SphereGeometry(.12,12,8),cream,0,.37,.17);const bill=add(g,new THREE.SphereGeometry(.07,8,6),mat('#e4bc75'),0,.33,.3);bill.scale.set(1,.4,1.4);for(const x of [-.075,.075])add(g,new THREE.SphereGeometry(.018,6,4),mat('#56636b'),x,.4,.23);ducks.push(g);}
 root.visible=false;
 return world.meadowOuting={root,groups,kites,strings,blanket,fruit,ducks,update(kind,t){root.visible=!!kind;groups.kite.visible=kind==='kite';groups.picnic.visible=kind==='picnic';if(!kind)return;
  kites.forEach(({g,tails},i)=>{g.position.set((i-2)*3+Math.sin(t*.23+i)*.65,6.06+(i%3)*1.3+Math.sin(t*.3+i)*.35,-3-(i%2)*2);g.rotation.set(.08,0,Math.sin(t*.28+i)*.12);tails.forEach((tail,j)=>{tail.position.x=Math.sin(t*.65+i-j*.4)*.10;tail.rotation.z=Math.sin(t*.65+i-j*.4)*.35;});const a=strings[i].geometry.attributes.position;for(let j=0;j<=16;j++){const u=j/16;a.setXYZ(j,(i-2)*1.3*(1-u)+g.position.x*u,1.31*(1-u)+g.position.y*u-Math.sin(u*Math.PI)*.35,g.position.z*u);}a.needsUpdate=true;});
  ducks.forEach((g,i)=>{g.position.set((i-1)*.65+Math.sin(t*.25+i)*.12,.02,-2.2+Math.cos(t*.2+i)*.18);g.rotation.y=Math.sin(t*.2+i)*.2;});
 }};
}
export async function buildMeadowLake(world) {
  const root=new THREE.Group();root.name='Dreamland meadow and lake';world.root.add(root);
  const pad=world.registerAreaPad({...MEADOW,hx:46,hz:32,blend:18}),y=pad.y;
  const floor={cx:-227,cz:-18,ax:1,az:0,bx:0,bz:1,hx:5,hz:1.1,y:y+0.2};
  const lake=world.registerWaterArea({...LAKE,y:y-0.25,depth:2.2},[floor]);world.updateTerrain();
  const outing=buildMeadowOuting(world,root);
  world.meadowBoat=makeRowingBoat(world,root,t=>{const a=t/240*Math.PI*2;return {pos:new THREE.Vector3(lake.x+Math.sin(a)*3.8,lake.y+0.15,lake.z+4.5+Math.cos(a)*1.4),yaw:Math.atan2(3.8*Math.cos(a),-1.4*Math.sin(a))};},p=>{const dx=(p.x-lake.x)/lake.rx,dz=(p.z-lake.z)/lake.rz,r=Math.hypot(dx,dz);if(r>0.85){p.x=lake.x+dx/r*lake.rx*0.85;p.z=lake.z+dz/r*lake.rz*0.85;}});
  const names=['flowers_blue','flowers_purple','flowers_pink','flowers_yellow','bush','grass','tree_blossom','tree_wisteria'];
  const imgs=Object.fromEntries(await Promise.all([...names,'meadow'].map(name=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve([name,img]);img.onerror=()=>resolve([name,null]);img.src=name==='meadow'?'assets/textures/dream/meadow.png':`assets/foliage/dream/${name}.png`;}))));
  const r=rng(471),v=(x,h,z)=>new THREE.Vector3(x,h,z),m=color=>new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide});
  const stone=world.paintedMaterial('stone',1,1,{color:'#b2ac92'}) || m('#9b9784'),moss=m('#7b9b76'),wood=world.mat.darkWood,cream=m('#fff5d4'),gold=m('#e5bf6e');
  const buckets=new Map(),plants=[],ducks=[],rabbits=[],butterflies=[],birds=[],dragonflies=[];
  function solid(geo,mat,x,h,z,parent=root,rot=null){if(rot)geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rot)));geo.translate(x,h,z);const key=parent.uuid+mat.uuid;if(!buckets.has(key))buckets.set(key,{parent,mat,geos:[]});buckets.get(key).geos.push(geo.index?geo.toNonIndexed():geo);}
  const box=(w,h,d,mat,x,py,z,g=root)=>solid(new THREE.BoxGeometry(w,h,d),mat,x,py,z,g);
  const ball=(radius,mat,x,h,z,g=root,s=[1,1,1])=>solid(new THREE.SphereGeometry(radius,12,8).scale(...s),mat,x,h,z,g);
  function group(x,h,z){const g=new THREE.Group();g.position.set(x,h,z);root.add(g);return g;}
  const groundGeo=new THREE.PlaneGeometry(104,74,78,56);groundGeo.rotateX(-Math.PI/2);groundGeo.translate(MEADOW.x,0,MEADOW.z);
  const gp=groundGeo.attributes.position,cols=[];for(let i=0;i<gp.count;i++){const x=gp.getX(i),z=gp.getZ(i);gp.setY(i,terrainHeight(x,z)+0.045);const a=1-smoothstep(0.72,1,Math.max(Math.abs(x-MEADOW.x)/52,Math.abs(z)/37));cols.push(1,1,1,a);}groundGeo.setAttribute('color',new THREE.Float32BufferAttribute(cols,4));groundGeo.computeVertexNormals();
  const groundMat=new THREE.MeshLambertMaterial({map:imgs.meadow?imageTexture(imgs.meadow,3,2):null,color:'#d5edbd',vertexColors:true,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});const ground=new THREE.Mesh(groundGeo,groundMat);ground.receiveShadow=true;root.add(ground);
  const points=[0,0,0],uv=[0.5,0.5],idx=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2,rr=1+0.06*Math.sin(a*3+0.5)+0.035*Math.cos(a*5);points.push(Math.cos(a)*lake.rx*rr,0,Math.sin(a)*lake.rz*rr);uv.push(0.5+Math.cos(a)*0.5,0.5+Math.sin(a)*0.5);if(i)idx.push(0,i,i+1);}
  const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(points,3));wg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));wg.setIndex(idx);wg.computeVertexNormals();
  // The fan faces up; the shared water shader supplies the same reflections as the river.
  wg.setIndex(idx.flatMap((_,i)=>i%3===0?[idx[i],idx[i+2],idx[i+1]]:[]));wg.computeVertexNormals();
  const water=new THREE.Mesh(wg,world._waterMaterial(1));water.position.set(lake.x,lake.y,lake.z);water.renderOrder=2;root.add(water);
  function cutouts(name,list,height){const img=imgs[name];if(!img)return;const geo=new THREE.PlaneGeometry(height*img.width/img.height,height);geo.translate(0,height/2,0);const geo2=geo.clone().rotateY(Math.PI/2),cross=mergeGeometries([geo,geo2]);const mat=new THREE.MeshLambertMaterial({map:imageTexture(img),alphaTest:0.5,side:THREE.DoubleSide});world._sway(mat,height,height>3?0.16:0.07);const im=new THREE.InstancedMesh(cross,mat,list.length),matrix=new THREE.Matrix4();list.forEach(([x,z,s],i)=>im.setMatrixAt(i,matrix.makeRotationY(i*2.399).scale(v(s,s,s)).setPosition(x,terrainHeight(x,z),z)));im.castShadow=height>3;im.receiveShadow=true;im.computeBoundingSphere();root.add(im);plants.push(im);}
  const zones=[[-217,21,'flowers_blue','#9fbae7'],[-196,2,'flowers_purple','#b9a0d8'],[-217,-18,'flowers_pink','#e7b2d1'],[-244,18,'flowers_yellow','#efdb96']];
  const fallback=[];for(const [cx,cz,name,color]of zones){const list=[];for(let i=0;i<650;i++){const a=r()*Math.PI*2,d=Math.sqrt(r()),x=cx+Math.cos(a)*d*17,z=cz+Math.sin(a)*d*12;if(outingClear(x,z)||world.inPond(x,z,3)||Math.abs(x-(-190+(z-28)*0.9))<2.1)continue;list.push([x,z,0.8+r()*0.5]);}cutouts(name,list,0.8);const im=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.14,0),m(color),list.length),matrix=new THREE.Matrix4();list.forEach(([x,z,s],i)=>im.setMatrixAt(i,matrix.makeScale(s,s,s).setPosition(x,terrainHeight(x,z)+0.4,z)));root.add(im);fallback.push(im);}
  const grass=[];for(let i=0;i<750;i++){const x=MEADOW.x+(r()-0.5)*82,z=(r()-0.5)*54;if(!outingClear(x,z)&&!world.inPond(x,z,2))grass.push([x,z,0.65+r()*0.55]);}cutouts('grass',grass,0.6);cutouts('bush',grass.filter((_,i)=>i%31===0),1.5);
  const trees=[[-262,22],[-251,34],[-225,33],[-192,27],[-181,9],[-185,-21],[-213,-31],[-263,-9]];
  cutouts('tree_blossom',trees.filter((_,i)=>i%2===0).map(([x,z])=>[x,z,1]),9);cutouts('tree_wisteria',trees.filter((_,i)=>i%2).map(([x,z])=>[x,z,1]),9);
  const flatTrees=new THREE.InstancedMesh(world.treeGeos[0],world.mat.foliage,trees.length),tm=new THREE.Matrix4();trees.forEach(([x,z],i)=>{flatTrees.setMatrixAt(i,tm.makeTranslation(x,terrainHeight(x,z),z));world.colliders.circles.push({x,z,r:0.5});});flatTrees.computeBoundingSphere();root.add(flatTrees);fallback.push(flatTrees);
  const trail=world._ribbon([[-183,30],[-199,24],[-214,13],[-221,-4],[-222,-18]],2.2,world._pathMaterial(),{step:1});root.attach(trail);
  for(let i=0;i<20;i++)box(0.45,0.14,2.2,wood,-231.75+i*0.5,floor.y-0.07,-18);
  for(const x of [-231,-223])for(const z of [-18.9,-17.1]){box(0.14,1.8,0.14,wood,x,floor.y-0.5,z);world.colliders.circles.push({x,z,r:0.12});}
  for(let i=0;i<8;i++){const a=0.2+i*0.2,x=lake.x+Math.cos(a)*13.5,z=lake.z+Math.sin(a)*9.8;solid(new THREE.DodecahedronGeometry(0.65,0).scale(1.2,0.25,1),stone,x,terrainHeight(x,z)+0.08,z);}
  for(let i=0;i<12;i++){const a=i*2.399,x=lake.x+Math.cos(a)*(3+i%4),z=lake.z+Math.sin(a)*4;solid(new THREE.CircleGeometry(0.3,20,0.1,Math.PI*1.85),moss,x,lake.y+0.035,z,root,[-Math.PI/2,0,i]);}
  const fallMat=new THREE.MeshPhongMaterial({map:world.waterShared.map.clone(),color:'#d6eeef',emissive:'#769fa8',emissiveIntensity:0.18,transparent:true,opacity:0.8,side:THREE.DoubleSide,shininess:45});
  const fallPoints=[v(-256,y+9,-23),v(-253,y+6.3,-23),v(-250,y+3.5,-23),v(-247,lake.y+0.1,-23)];
  for(let i=0;i<3;i++){ball(3.3,stone,-259+i*3,y+2.2+i*-0.4,-23,root,[1,2.1-i*0.45,1.1]);ball(2,moss,-260+i*3,y+7.2-i*2.5,-23,root,[1.3,0.25,1.5]);box(4,0.25,3.6,moss,-258+i*3,y+8.8-i*2.75,-23);const a=fallPoints[i],b=fallPoints[i+1],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([a.x,a.y,a.z-1.4,a.x,a.y,a.z+1.4,b.x,b.y,b.z-1.7,b.x,b.y,b.z+1.7],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,1,1,1],2));g.setIndex([0,2,1,1,2,3]);g.computeVertexNormals();const mesh=new THREE.Mesh(g,fallMat);root.add(mesh);}
  const foamMat=new THREE.MeshLambertMaterial({color:'#eff9ed',transparent:true,opacity:0.5,side:THREE.DoubleSide});const foam=new THREE.Mesh(new THREE.RingGeometry(1.2,2.2,40),foamMat);foam.rotation.x=-Math.PI/2;foam.position.set(-247,lake.y+0.05,-23);root.add(foam);
  const rainbows=[];['#e9a4af','#ecc49a','#eee0a0','#c4dfad','#aad6d6','#b6bde5','#d4b4dc'].forEach((color,i)=>{const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.18,side:THREE.DoubleSide,depthWrite:false});const arc=new THREE.Mesh(new THREE.RingGeometry(3.4+i*0.1,3.49+i*0.1,48,1,0,Math.PI),mat);arc.rotation.y=Math.PI/2;arc.position.set(-247,y+0.8,-23);root.add(arc);rainbows.push(arc);});
  const sprayPos=new Float32Array(70*3),sprayGeo=new THREE.BufferGeometry();sprayGeo.setAttribute('position',new THREE.BufferAttribute(sprayPos,3));const spray=new THREE.Points(sprayGeo,new THREE.PointsMaterial({color:'#f0fbf3',size:0.16,transparent:true,opacity:0.45,depthWrite:false}));spray.frustumCulled=false;root.add(spray);
  let sparkRevision=-1;const sparkHeights=new Float64Array(80);
  const sparkPos=new Float32Array(80*3),sparkGeo=new THREE.BufferGeometry();sparkGeo.setAttribute('position',new THREE.BufferAttribute(sparkPos,3));const sparkles=new THREE.Points(sparkGeo,new THREE.PointsMaterial({color:'#fff4c7',size:0.1,transparent:true,opacity:0.5,depthWrite:false}));sparkles.frustumCulled=false;root.add(sparkles);
  for(let i=0;i<3;i++){const g=group(0,0,0);ball(0.28,cream,0,0.15,0,g,[0.8,0.8,1.3]);ball(0.16,cream,0,0.4,0.23,g);ball(0.09,gold,0,0.36,0.4,g,[1,0.4,1.4]);for(const sx of [-1,1])ball(0.025,m('#435b61'),sx*0.1,0.43,0.34,g);ducks.push(g);}
  for(const [i,[x,z]] of [[-211,13],[-205,16],[-216,20]].entries()){
    const g=group(x,terrainHeight(x,z),z),coat=i%2?m('#d8bea0'):cream;
    ball(0.29,coat,0,0.29,0,g,[0.85,0.9,1.3]);ball(0.21,coat,0,0.57,0.27,g);
    for(const sx of [-1,1]){ball(0.07,coat,sx*0.1,0.86,0.27,g,[0.75,3,0.8]);ball(0.03,m('#51606a'),sx*0.1,0.61,0.44,g);ball(0.04,m('#e9bac6'),sx*0.1,0.88,0.32,g,[0.6,3,0.4]);}
    ball(0.11,cream,0,0.34,-0.33,g);rabbits.push({g,x,z});
  }
  for(let i=0;i<10;i++){const g=group(0,0,0),wings=[];for(const sx of [-1,1]){const wing=new THREE.Mesh(new THREE.CircleGeometry(0.16,12),m(i%2?'#e8b9d0':'#c6d4ef'));wing.position.x=sx*0.12;g.add(wing);wings.push(wing);}butterflies.push({g,wings});}
  for(let i=0;i<3;i++){const g=group(0,0,0);ball(0.13,cream,0,0,0,g,[0.7,0.6,1.4]);const wings=[-1,1].map(sx=>{const w=new THREE.Mesh(new THREE.SphereGeometry(0.18,8,6).scale(2,0.15,0.6),cream);w.position.x=sx*0.2;g.add(w);return w;});birds.push({g,wings});}
  for(let i=0;i<4;i++){const g=group(0,0,0);ball(0.08,m('#82c7bc'),0,0,0,g,[0.4,0.4,2.5]);solid(new THREE.SphereGeometry(0.15,8,6).scale(3,0.1,0.65),cream,0,0.03,0,g);dragonflies.push(g);}
  for(const {parent,mat,geos}of buckets.values()){const mesh=new THREE.Mesh(mergeGeometries(geos),mat);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);for(const g of geos)g.dispose();}root.updateMatrixWorld(true);
  const festivalRoot=new THREE.Group();festivalRoot.name='Lake lantern evening';festivalRoot.visible=false;root.add(festivalRoot);
  const count=36,paper=new THREE.MeshLambertMaterial({color:'#ffe9bf',emissive:'#ffc875',emissiveIntensity:0.7}),lanterns=new THREE.InstancedMesh(new THREE.SphereGeometry(0.3,12,8),paper,count),caps=new THREE.InstancedMesh(new THREE.TorusGeometry(0.13,0.025,5,10),gold,count),matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),scale=new THREE.Vector3();
  const glowPos=new Float32Array(count*3),glowColors=new Float32Array(count*3),glowGeometry=new THREE.BufferGeometry();glowGeometry.setAttribute('position',new THREE.BufferAttribute(glowPos,3));glowGeometry.setAttribute('color',new THREE.BufferAttribute(glowColors,3));const glow=new THREE.Points(glowGeometry,new THREE.PointsMaterial({map:world.tex.glow,color:'#ffd99b',size:1.8,transparent:true,vertexColors:true,opacity:0.3,blending:THREE.AdditiveBlending,depthWrite:false}));
  const reflectionMat=new THREE.MeshBasicMaterial({map:world.tex.glow,color:'#ffcc86',transparent:true,opacity:0.24,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),reflections=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),reflectionMat,count);reflections.renderOrder=3;
  const fliesPos=new Float32Array(40*3),fliesGeo=new THREE.BufferGeometry();fliesGeo.setAttribute('position',new THREE.BufferAttribute(fliesPos,3));const flies=new THREE.Points(fliesGeo,new THREE.PointsMaterial({map:world.tex.glow,color:'#fff2b1',size:0.24,transparent:true,opacity:0.6,blending:THREE.AdditiveBlending,depthWrite:false}));
  for(let i=0;i<count;i++)lanterns.setColorAt(i,new THREE.Color(['#ffe8b5','#f8d2ae','#f9edcc'][i%3]));for(const o of [lanterns,caps,glow,reflections,flies]){o.frustumCulled=false;festivalRoot.add(o);}
  const crowd=[CAST.pavi,CAST.siri,CAST.cafeHost,CAST.townswoman].map((outfit,i)=>{const p=makeCharacter(outfit),angle=0.2+i*0.16,x=lake.x+Math.cos(angle)*(lake.rx+3),z=lake.z+Math.sin(angle)*(lake.rz+3);p.g.position.set(x,terrainHeight(x,z),z);p.g.rotation.y=Math.atan2(lake.x-x,lake.z-z);festivalRoot.add(p.g);return p;});
  const festival={root:festivalRoot,lanterns,caps,glow,reflections,flies,crowd,update(t,camera,atmos){
    festivalRoot.visible=!!world.festival;if(!festivalRoot.visible)return;const level=0.3+0.7*atmos.stars;paper.emissiveIntensity=0.4+level*0.65;glow.material.opacity=0.15+0.18*level;reflectionMat.opacity=0.12+0.15*level;flies.material.opacity=0.2+0.5*level;
    for(let i=0;i<count;i++){const phase=((t/80+i/count)%1+1)%1,a=i*2.399,x=lake.x+Math.cos(a)*(2+i%4)+Math.sin(t*0.07+i)*0.35,z=lake.z+Math.sin(a)*(1+i%3)+Math.cos(t*0.06+i)*0.35,h=lake.y+0.7+phase*17,fade=smoothstep(0,0.08,phase)*(1-smoothstep(0.85,1,phase));rotation.setFromAxisAngle(v(0,0,1),Math.sin(t*0.17+i)*0.06);scale.set(fade,fade*1.25,fade);lanterns.setMatrixAt(i,matrix.compose(v(x,h,z),rotation,scale));caps.setMatrixAt(i,matrix.makeScale(fade,fade,fade).setPosition(x,h+0.33*fade,z));glowPos.set([x,h,z],i*3);glowColors.set([fade,fade,fade],i*3);const reflected=fade*(1-smoothstep(0.15,0.65,phase));reflections.setMatrixAt(i,matrix.makeScale(reflected*0.9,1,reflected*(2+Math.sin(t*0.4+i)*0.2)).setPosition(x,lake.y+0.045,z));}
    lanterns.instanceMatrix.needsUpdate=caps.instanceMatrix.needsUpdate=reflections.instanceMatrix.needsUpdate=true;glowGeometry.attributes.position.needsUpdate=glowGeometry.attributes.color.needsUpdate=true;
    for(let i=0;i<40;i++){const a=i*2.399;fliesPos.set([lake.x+Math.sin(a)*10+Math.sin(t*0.2+i)*0.4,lake.y+0.7+(i%4)*0.5+Math.sin(t*0.5+i)*0.25,lake.z+Math.cos(a)*7+Math.cos(t*0.2+i)*0.4],i*3);}fliesGeo.attributes.position.needsUpdate=true;
    crowd.forEach((p,i)=>{animatePerson(p,t*0.6+i,0);gesture(p,i%2?'listen':'talk',((t+i*2)%18)/18,t);});
  }};
  return {root,pad,lake,water,plants,ducks,rabbits,rainbows,festival,outing,update(t,camera,atmos,key){
    festival.update(t,camera,atmos);
    const flat=world.textureSet==='flat';plants.forEach(p=>p.visible=!flat);fallback.forEach(p=>p.visible=flat);
    fallMat.map.offset.y=-t*0.12;fallMat.color.copy(world.waterUniforms.uWaterHorizon.value).lerp(new THREE.Color('#cce4df'),0.55);foamMat.color.copy(world.waterUniforms.uWaterFoamColor.value);foam.scale.setScalar(1+Math.sin(t*0.7)*0.06);
    rainbows.forEach(a=>a.material.opacity=(key==='golden'||key==='morning')?0.19:0);
    for(let i=0;i<70;i++){const phase=(t*0.3+i/70)%1;sprayPos[i*3]=-247+Math.sin(i*2.4)*phase*2;sprayPos[i*3+1]=lake.y+Math.sin(phase*Math.PI)*1.4;sprayPos[i*3+2]=-23+Math.cos(i*2.4)*phase*2;}sprayGeo.attributes.position.needsUpdate=true;
    if(sparkRevision!==world.terrainRevision){for(let i=0;i<80;i++){const x=MEADOW.x+Math.sin(i*2.399)*((i%7)+1)*4,z=Math.cos(i*2.399)*((i%6)+1)*3;sparkPos[i*3]=x;sparkPos[i*3+2]=z;sparkHeights[i]=terrainHeight(x,z);}sparkRevision=world.terrainRevision;}
    for(let i=0;i<80;i++)sparkPos[i*3+1]=sparkHeights[i]+0.7+Math.sin(t*0.3+i)*0.3;sparkGeo.attributes.position.needsUpdate=true;
    ducks.forEach((g,i)=>{const a=t*0.04+i*2.094;g.position.set(lake.x+Math.sin(a)*4,lake.y+0.03+Math.sin(t+i)*0.02,lake.z+Math.cos(a)*3);world.meadowBoat?.avoidBoat(g.position,ducks.slice(0,i));g.rotation.y=Math.PI/2+a;});
    rabbits.forEach(({g,x,z},i)=>{const phase=(t+i*4)%22,hop=phase<3?Math.sin(phase/3*Math.PI)*0.16:0;g.position.set(x,terrainHeight(x,z)+hop,z);g.rotation.y=Math.sin(t*0.1+i)*0.3;g.visible=atmos.stars<0.65;});
    butterflies.forEach(({g,wings},i)=>{g.visible=atmos.stars<0.65;g.position.set(-212+Math.sin(t*0.2+i)*15,y+1+Math.sin(t*0.4+i)*0.6,8+Math.cos(t*0.17+i)*13);wings.forEach((w,k)=>w.rotation.y=Math.sin(t*6+i)*(k?1:-1)*0.7);});
    birds.forEach(({g,wings},i)=>{g.position.set(MEADOW.x+Math.sin(t*0.07+i*2)*22,y+11+i,Math.cos(t*0.07+i*2)*16);g.rotation.y=-t*0.07-i*2;wings.forEach((w,k)=>w.rotation.z=Math.sin(t*3+i)*(k?1:-1)*0.3);});
    dragonflies.forEach((g,i)=>g.position.set(lake.x+Math.sin(t*0.4+i)*10,lake.y+1+Math.sin(t*0.8+i)*0.3,lake.z+Math.cos(t*0.3+i)*7));
  }};
}





