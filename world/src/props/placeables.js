import * as THREE from 'three';
import {makeCanvasTent} from './canvas-tent.js';
import {crossedPlanes} from '../world.js';

// Small Build-mode pieces (low:true marks colliders a jump clears, like low fences) for the picture collection. Each build(g,ctx) draws in local metres
// (g is already placed, rotated and scaled); ctx adds walkable tops and colliders that follow it.
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
// Painted images load once per path; a tiny placeholder keeps the flat style's average colour working until then.
const texture=(world,path,img,placeholder,repeat)=>(world.placeTextures??=new Map()).get(path)||(()=>{
 const c=document.createElement('canvas');c.width=c.height=2;const x=c.getContext('2d');x.fillStyle=placeholder;x.fillRect(0,0,2,2);
 const t=new THREE.Texture(img||c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;if(repeat)t.wrapS=t.wrapT=THREE.RepeatWrapping;t.needsUpdate=true;
 if(!img){const im=new Image();im.onload=()=>{t.dispose();t.image=im;delete t.userData.avg;t.needsUpdate=true;};im.src=path;}world.placeTextures.set(path,t);return t;})();
const surface=(world,map,sets,extra)=>{const m=new THREE.MeshLambertMaterial({map,...extra});m.userData.sets=sets;world.surfaces.add(m);return m;};
// Ground textures from assets/textures/<set>/ (oil and clean), so tiles look like the painted terrain.
const ground=(world,name,color)=>world.painted.oil[name]?world.paintedMaterial(name,1,1):(()=>{const sets={};for(const set of ['oil','clean'])sets[set]=texture(world,`assets/textures/${set}/${name}.png`,null,color,true);return surface(world,sets.oil,sets);})();
// Plant cut-outs (the same paintings as the world's plants); 'dream/' ones come from the meadow set.
const ASPECT={cottonwood:1.5,pine:.67,bush:1.5,'dream/bush':1.5,'dream/tree_blossom':.67,'dream/flowers_pink':2,'dream/flowers_yellow':2,'dream/flowers_blue':2,'dream/flowers_purple':2};
const cutout=(world,name,tint='#ffffff')=>{const cache=world.placeCutouts??=new Map(),key=name+tint;if(cache.has(key))return cache.get(key);
 const dream=name.startsWith('dream/'),sets={};for(const set of ['oil','clean'])sets[set]=dream?texture(world,`assets/foliage/${name}.png`,null,'rgba(0,0,0,0)'):texture(world,`assets/foliage/${set}/${name}.png`,world.painted[set]?.foliage?.[name],'rgba(0,0,0,0)');
 const m=surface(world,sets.oil,sets,{color:tint,alphaTest:.5,side:THREE.DoubleSide});m.userData.keepMap=true;
 m.userData.depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:sets.oil,alphaTest:.5});cache.set(key,m);return m;};
const mats=world=>world.placeMats??=Object.assign(Object.fromEntries(Object.entries({grass:'#8fbb6c',meadow:'#a4c97c',earth:'#a98763',sand:'#ead6a0',pebble:'#c9c1b2',cobble:'#b5a48f',leaf:'#7fae64',leafDark:'#5f9658',blossom:'#f3bcd2',autumn:'#e5a14f',fruit:'#e7705f',snow:'#f2f5f3',moss:'#8db86a',cream:'#f4e6c4',pink:'#eeaecb',lilac:'#c4b3ef',yellow:'#f2d273',rope:'#d9c393',trunk:'#9b7553',warm:'#7a5638',sky:'#9fd0e2'}).map(([k,c])=>[k,new THREE.MeshLambertMaterial({color:c,flatShading:k!=='rope'})])),{grass:ground(world,'meadow','#8fbb6c'),sand:ground(world,'beach_sand','#ead6a0'),cobble:ground(world,'cobblestones','#b5a48f'),path:ground(world,'road','#c9a77c')});

function kit(g,world){
 const m=mats(world),add=(geo,mat,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;};
 const box=(w,h,d,mat,x,y,z)=>add(new THREE.BoxGeometry(w,h,d),mat,x,y,z);
 const ball=(r,mat,x,y,z,sx=1,sy=1,sz=1)=>{const o=add(new THREE.IcosahedronGeometry(r,1),mat,x,y,z);o.scale.set(sx,sy,sz);return o;};
 const rock=(r,x,y,z,sx=1,sy=.7,sz=1,turn=0)=>{const o=add(new THREE.DodecahedronGeometry(r,1),world.mat.stone,x,y,z);o.scale.set(sx,sy,sz);o.rotation.y=turn;return o;};
 const post=(x,h,z,r=.08,mat=world.mat.wood)=>add(new THREE.CylinderGeometry(r,r*1.1,h,8),mat,x,h/2,z);
 const trunk=(h,r=.16,x=0,z=0)=>add(new THREE.CylinderGeometry(r*.8,r,h,8),m.trunk,x,h/2,z);
 const halo=(x,y,z,s=1.3)=>{const h=new THREE.Sprite(world.haloMat);h.position.set(x,y,z);h.scale.setScalar(s);g.add(h);};
 const lamp=(x,y,z)=>{add(new THREE.BoxGeometry(.22,.28,.22),world.mat.lantern,x,y,z).castShadow=false;add(new THREE.ConeGeometry(.17,.14,4),world.mat.darkWood,x,y+.2,z).rotation.y=Math.PI/4;halo(x,y,z);};
 const tree=(i,s=1,x=0,z=0)=>{const o=add(world.treeGeos[i].clone(),world.mat.foliage,x,0,z);o.scale.setScalar(s);return o;};
 const arch=(mat,r=1.25,h=1.6)=>{for(const s of [-1,1])post(s*r,h,0,.09,mat);const a=add(new THREE.TorusGeometry(r,.09,6,20,Math.PI),mat,0,h,0);return a;};
 const cut=(name,h,x=0,z=0,tint,turn=0)=>{const mat=cutout(world,name,tint),o=add(crossedPlanes(h*ASPECT[name],h),mat,x,0,z);o.rotation.y=turn;o.customDepthMaterial=mat.userData.depth;o.receiveShadow=false;return o;};
 return {m,add,box,ball,rock,post,trunk,halo,lamp,tree,arch,cut};
}
// Plants carry two looks; world.setPlants shows the painted one or the low-poly one with the art style.
const looks=(painted,plain)=>(g,c)=>{for(const [look,fn]of [['painted',painted],['plain',plain]]){const part=new THREE.Group();part.userData.plantLook=look;part.visible=(c.world.plantLook||'painted')===look;g.add(part);fn(kit(part,c.world),c);}};
// Painted ChatGPT tops (seamless 512 px) for the grass, sand and cobblestone tiles.
const painted=world=>world.tileMats??=Object.fromEntries(['grass','sand','cobblestone'].map(n=>{const t=new THREE.TextureLoader().load(`assets/textures/tiles/${n}.jpg`);t.colorSpace=THREE.SRGBColorSpace;return [n,new THREE.MeshLambertMaterial({map:t})];}));
const tile=(top,h=.14)=>(g,c)=>{const k=kit(g,c.world);c.walk(k.box(2,h,2,k.m.earth,0,h/2-.04,0));k.box(2.02,.05,2.02,painted(c.world)[top]||k.m[top]||top,0,h-.02,0);c.floor(0,0,1,1,h);return k;};
// A raised rock top with a gentle way up on +z; edge walls keep friends from stepping off.
const mesa=(w,d,h,steps)=>(g,c)=>{const k=kit(g,c.world);
 k.box(w,h,d,c.world.mat.stone,0,h/2,0);k.box(w+.1,.12,d+.1,k.m.grass,0,h+.02,0);
 for(const [x,z,s]of [[-w/2,-d/2,.6],[w/2,d/3,.5],[w/3,-d/2,.45],[-w/2,d/4,.4]])k.rock(s,x,s*.5,z,1,.9,1,x);
 const n=steps?Math.ceil(h/.22):6,len=steps?n*.38:2.4;
 for(let i=0;i<n;i++){const y=(i+1)/n*h,z=d/2+len-(i+.5)*len/n;if(steps)k.box(1.3,y,len/n,c.world.mat.stone,0,y/2,z);c.floor(0,z,steps?.65:.9,len/n/2,y);}
 if(!steps){const ramp=k.box(1.8,.2,Math.hypot(len,h),k.m.grass,0,h/2,d/2+len/2);ramp.rotation.x=Math.atan2(h,len);}
 c.floor(0,0,w/2,d/2,h+.08);c.rect(0,-d/2,w/2,.12);for(const s of [-1,1]){c.rect(s*w/2,0,.12,d/2);c.rect(s*(w/4+.5),d/2,w/4-.4,.12);c.rect(s*(steps?.75:1),d/2+len/2,.08,len/2);}};

export const PLACEABLES={
 tileGrass:{label:'Grass tile',bounds:[1,1],solid:false,build:tile('grass')},
 tileSand:{label:'Sand tile',bounds:[1,1],solid:false,build:tile('sand')},
 tileStonePath:{label:'Stone path tile',bounds:[1,1],solid:false,build:(g,c)=>{const k=tile('grass')(g,c);for(const [x,z]of [[-.55,-.6],[.1,-.1],[.6,.55],[-.3,.6],[.5,-.7]])k.add(new THREE.CylinderGeometry(.3,.33,.06,9),c.world.mat.stone,x,.15,z);}},
 tileCobble:{label:'Cobblestone tile',bounds:[1,1],solid:false,build:tile('cobblestone')},
 tileWood:{label:'Wooden platform',bounds:[1,1],solid:false,build:(g,c)=>{const k=kit(g,c.world);for(let i=0;i<5;i++)c.walk(k.box(.37,.1,2,c.world.mat.wood,-.8+i*.4,.3,0));for(const x of [-.85,.85])for(const z of [-.85,.85])k.post(x,.26,z,.09,c.world.mat.darkWood);for(const z of [-.7,.7])k.box(2,.12,.14,c.world.mat.darkWood,0,.19,z);c.floor(0,0,1,1,.36);}},
 grassRamp:{label:'Grass ramp',bounds:[1,2],solid:false,build:(g,c)=>{const k=kit(g,c.world),shape=new THREE.Shape([new THREE.Vector2(-2,0),new THREE.Vector2(2,0),new THREE.Vector2(2,1.2)]);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:2,bevelEnabled:false});geo.rotateY(-Math.PI/2);geo.translate(1,0,0);c.walk(k.add(geo,k.m.grass));
  for(let i=0;i<6;i++)c.floor(0,-2+(i+.5)*4/6,1,1/3,(i+1)/6*1.2);c.rect(0,2,1,.1);for(const s of [-1,1])c.rect(s,1,.08,1);}},
 smallCliff:{label:'Small cliff',bounds:[1.5,1],solid:false,build:mesa(3,2,1.4,true)},
 rockPlateau:{label:'Rock plateau',bounds:[2,2],solid:false,build:mesa(4,4,1,false)},
 rockyHillside:{label:'Rocky hillside',bounds:[2.2,1.7],build:(g,c)=>{const k=kit(g,c.world);k.ball(1,k.m.grass,0,0,0,2.4,1.25,1.9);for(const [x,z,s]of [[-1.9,.9,.6],[1.6,1.2,.55],[2,-.6,.7],[-1.2,-1.3,.65],[.4,1.6,.45]])k.rock(s,x,s*.4,z,1.2,.9,1,x*2);}},
 snowyPines:{label:'Snowy pine group',bounds:[1.6,1.2],build:looks((k,c)=>{k.box(3.6,.08,2.8,k.m.snow,0,.03,0);for(const [x,z,h,t]of [[-1,-.3,6.5,'#e9f1f2'],[.6,.4,5.4,'#dfeae8'],[1.2,-.6,4.4,'#eef4f4'],[-.2,.9,3.8,'#e4eeec']])k.cut('pine',h,x,z,t,x);},(k,c)=>{k.box(3.6,.08,2.8,k.m.snow,0,.03,0);for(const [i,x,z,s]of [[3,-1,-.3,1],[4,.6,.4,.85],[3,1.2,-.6,.7],[4,-.2,.9,.6]]){k.tree(i,s,x,z);for(const y of [2.2,3.6])k.add(new THREE.ConeGeometry(1.2*s*(1.25-y/6),.5*s,7),k.m.snow,x,y*s,z);}})},
 shadeTree:{label:'Green shade tree',bounds:[.5,.5],build:looks(k=>k.cut('cottonwood',6.5),k=>k.tree(0,1.1))},
 smallTree:{label:'Small shade tree',bounds:[.4,.4],build:looks(k=>k.cut('cottonwood',4.2,0,0,'#ffffff',1),k=>k.tree(1,.75))},
 autumnTree:{label:'Autumn tree',bounds:[.5,.5],build:looks(k=>k.cut('cottonwood',6,0,0,'#f3b57a',2),k=>k.tree(2,1.05))},
 pineGroup:{label:'Snowy and green pines',bounds:[1.2,.8],build:looks(k=>{k.cut('pine',6.5,-.8,0);k.cut('pine',5.2,.9,.2,'#e6eeee',1);},(k,c)=>{k.tree(3,1,-.8,0);k.tree(4,.9,.9,.2);for(const y of [2.2,3.6])k.add(new THREE.ConeGeometry(1.2*(1.25-y/6),.5,7),k.m.snow,-.8,y,0);})},
 blossomTree:{label:'Blossom tree',bounds:[.4,.4],build:looks(k=>k.cut('dream/tree_blossom',5.5),(k,c)=>{k.trunk(2.2);for(const [x,y,z,r]of [[0,3.1,0,1.3],[-.9,2.6,.3,.9],[.9,2.7,-.2,.95],[.2,3.4,.8,.8]])k.ball(r,k.m.blossom,x,y,z);})},
 fruitTree:{label:'Fruit tree',bounds:[.4,.4],build:looks(k=>{k.cut('cottonwood',5,0,0,'#e9f3d6');for(let i=0;i<12;i++){const a=Math.floor(i/4)*Math.PI/3,r=(i%4-1.5)*1.1,s=i%2?.06:-.06;k.ball(.14,k.m.fruit,Math.cos(a)*r-Math.sin(a)*s,2.6+(i*7%5)*.35,-Math.sin(a)*r-Math.cos(a)*s);}},(k,c)=>{k.trunk(2);for(const [x,y,z,r]of [[0,2.9,0,1.25],[-.85,2.4,.2,.85],[.85,2.5,-.2,.9]])k.ball(r,k.m.leaf,x,y,z);for(let i=0;i<9;i++){const a=i*2.4;k.ball(.13,k.m.fruit,Math.cos(a)*1.05,2.2+(i%3)*.45,Math.sin(a)*1.05);}})},
 roundTree:{label:'Rounded tree',bounds:[.4,.4],build:looks(k=>{k.trunk(1.2,.14);k.cut('dream/bush',3.4,0,0,'#d7ebc4');},(k,c)=>{k.trunk(1.6,.14);k.ball(1.25,k.m.leafDark,0,2.5,0,1,1.05,1);})},
 meadowFlowers:{label:'Meadow flowers',bounds:[.9,.9],solid:false,build:looks(k=>{for(const [i,x,z]of [[0,-.4,-.2],[1,.4,.1],[2,-.1,.45],[3,.25,-.45]])k.cut(['dream/flowers_yellow','dream/flowers_pink','dream/flowers_blue','dream/flowers_purple'][i],.5,x,z,'#ffffff',i);},(k,c)=>{k.add(new THREE.CylinderGeometry(1,1,.05,16),k.m.meadow,0,.02,0);for(let i=0;i<14;i++){const a=i*2.4,r=.25+(i%4)*.2,x=Math.cos(a)*r,z=Math.sin(a)*r;k.post(x,.32,z,.015,k.m.leaf);k.ball(.07,[k.m.yellow,k.m.pink,k.m.cream,k.m.lilac][i%4],x,.36,z);}})},
 floweringBush:{low:true,label:'Flowering bush',bounds:[.7,.6],build:looks(k=>{k.cut('dream/bush',1.3);k.cut('dream/flowers_pink',.7,.3,.3,'#ffffff',1);},(k,c)=>{for(const [x,z,r]of [[-.35,0,.55],[.35,.1,.5],[0,-.25,.5]])k.ball(r,k.m.leaf,x,r*.75,z,1,.85,1);for(let i=0;i<10;i++){const a=i*2.4;k.ball(.08,k.m.pink,Math.cos(a)*.6,.45+(i%3)*.15,Math.sin(a)*.5);}})},
 greenBush:{low:true,label:'Green bush',bounds:[.6,.5],build:looks(k=>k.cut('bush',1.25),(k,c)=>{for(const [x,z,r]of [[-.3,0,.5],[.3,.08,.45],[0,-.22,.42]])k.ball(r,k.m.leafDark,x,r*.75,z,1,.85,1);})},
 rockCluster:{low:true,label:'Rock cluster',bounds:[.9,.7],build:(g,c)=>{const k=kit(g,c.world);k.rock(.55,-.3,.3,0,1.2,.8,1,1);k.rock(.4,.45,.2,.2,1,.8,1.1,2);k.rock(.3,.1,.15,-.45,1,.7,1,3);}},
 mossyRock:{low:true,label:'Mossy rock',bounds:[.7,.55],build:(g,c)=>{const k=kit(g,c.world);k.rock(.6,0,.3,0,1.2,.75,1,.5);k.ball(.55,k.m.moss,0,.52,0,1.15,.35,.95);}},
 roundRock:{low:true,label:'Round rock',bounds:[.6,.55],build:(g,c)=>kit(g,c.world).rock(.6,0,.32,0,1.05,.8,1,.3)},
 treeStump:{low:true,label:'Tree stump',bounds:[.45,.45],build:(g,c)=>{const k=kit(g,c.world);k.add(new THREE.CylinderGeometry(.42,.52,.55,10),k.m.trunk,0,.27,0);k.add(new THREE.CylinderGeometry(.4,.4,.03,10),k.m.cream,0,.56,0);}},
 smallStump:{label:'Small tree stump',bounds:[.3,.3],solid:false,build:(g,c)=>{const k=kit(g,c.world);k.add(new THREE.CylinderGeometry(.28,.34,.3,9),k.m.trunk,0,.15,0);k.add(new THREE.CylinderGeometry(.26,.26,.03,9),k.m.cream,0,.31,0);k.post(.4,.14,.1,.03,k.m.cream);k.ball(.09,k.m.fruit,.4,.15,.1,1,.55,1);}},
 mushrooms:{label:'Friendly mushrooms',bounds:[.5,.5],solid:false,build:(g,c)=>{const k=kit(g,c.world);for(const [x,z,s]of [[0,0,1],[.32,.15,.7],[-.28,.2,.55]]){k.post(x,.32*s,z,.06*s,k.m.cream);k.add(new THREE.SphereGeometry(.2*s,12,6,0,Math.PI*2,0,Math.PI/2),k.m.fruit,x,.3*s,z);for(let i=0;i<4;i++){const a=i*1.6;k.ball(.03*s,k.m.cream,x+Math.cos(a)*.12*s,.42*s,z+Math.sin(a)*.12*s);}}}},
 tallLantern:{label:'Tall lantern',bounds:[.2,.2],build:(g,c)=>g.add(c.world.makeProp('lantern'))},
 shortLantern:{label:'Short lantern',bounds:[.2,.2],build:(g,c)=>{const k=kit(g,c.world);k.post(0,1.1,0,.06,c.world.mat.darkWood);k.lamp(0,1.25,0);}},
 lookoutTower:{label:'Lookout tower',bounds:[1.3,1.3],build:(g,c)=>{const k=kit(g,c.world),d=c.world.mat.darkWood;for(const x of [-1,1])for(const z of [-1,1])k.post(x,3.6,z,.12,d);k.box(2.6,.15,2.6,c.world.mat.wood,0,3.5,0);
  for(const s of [-1,1]){k.box(2.6,.08,.08,k.m.cream,0,4.3,s*1.25);k.box(.08,.08,2.6,k.m.cream,s*1.25,4.3,0);}for(const x of [-1,1])for(const z of [-1,1])k.post(x*1.25,1,z*1.25,.05,d).position.y=4;
  const roof=k.add(new THREE.ConeGeometry(2.2,1.2,4),c.world.mat.roof,0,5.4,0);roof.rotation.y=Math.PI/4;for(let y=.4;y<3.5;y+=.45)k.box(.7,.06,.06,c.world.mat.wood,0,y,1.15);for(const x of [-.35,.35])k.box(.07,3.5,.07,c.world.mat.wood,x,1.75,1.15);}},
 gazebo:{label:'Gazebo',bounds:[1.9,1.9],solid:false,build:(g,c)=>{const k=kit(g,c.world);c.walk(k.add(new THREE.CylinderGeometry(2.1,2.2,.25,6),c.world.mat.wood,0,.12,0));c.floor(0,0,1.6,1.6,.25);
  for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.cos(a)*1.9,z=Math.sin(a)*1.9;k.post(x,2.4,z,.08,k.m.cream);c.circle(x,z,.15);}const roof=k.add(new THREE.ConeGeometry(2.6,1.3,6),c.world.mat.roof,0,3.05,0);k.ball(.18,k.m.cream,0,3.75,0);k.add(new THREE.TorusGeometry(2.2,.06,4,6),k.m.cream,0,2.4,0).rotation.x=Math.PI/2;}},
 campfirePit:{label:'Campfire',bounds:[.7,.7],build:(g,c)=>{const fire=c.world.makeProp('campfire');g.add(fire);g.updateMatrixWorld(true);c.world.flames.push(fire.userData.flame);for(const e of fire.userData.emitters)c.world.emitters.push({...e,pos:fire.localToWorld(e.local.clone()),acc:0});}},
 canvasTent:{label:'Canvas tent',bounds:[1.5,1.8],build:g=>g.add(makeCanvasTent(0))},
 picnicTable:{label:'Picnic table',bounds:[1,.9],build:(g,c)=>{const k=kit(g,c.world),w=c.world.mat.wood;k.box(1.8,.08,.8,w,0,.75,0);for(const s of [-1,1]){k.box(1.8,.07,.3,w,0,.45,s*.7);for(const x of [-.7,.7]){k.box(.08,.75,.08,c.world.mat.darkWood,x,.37,s*.25);k.box(.07,.45,.07,c.world.mat.darkWood,x,.22,s*.7);}}k.box(1.3,.02,.5,k.m.pink,0,.8,0);}},
 supplyCart:{label:'Supply cart',bounds:[.9,1.7],build:(g,c)=>g.add(c.world.makeProp('wagon'))},
 barrelGroup:{label:'Barrel group',bounds:[.9,.7],build:(g,c)=>{for(const [x,z]of [[-.4,0],[.4,.1],[0,-.45]]){const b=c.world.makeProp('barrel');b.position.set(x,0,z);g.add(b);}}},
 haystack:{label:'Haystack',bounds:[1,1],build:(g,c)=>{const k=kit(g,c.world);k.ball(1,c.world.mat.hay,0,.5,0,1.1,1.1,1.1);k.add(new THREE.ConeGeometry(.6,.5,8),c.world.mat.hay,0,1.6,0);}},
 flowerArch:{label:'Flower arch',bounds:[1.4,.2],solid:false,build:(g,c)=>{const k=kit(g,c.world);k.arch(c.world.mat.wood);for(let i=0;i<=8;i++){const a=i/8*Math.PI;k.cut(i%2?'dream/flowers_pink':'dream/flowers_yellow',.55,Math.cos(a)*1.25,0,'#ffffff',i).position.y=1.4+Math.sin(a)*1.25;}for(const s of [-1,1]){c.circle(s*1.25,0,.15);k.cut('dream/bush',.9,s*1.25,0,'#ffffff',s);}}},
 lanternArch:{label:'Lantern arch',bounds:[1.4,.2],solid:false,build:(g,c)=>{const k=kit(g,c.world);k.arch(c.world.mat.wood);for(const x of [-.75,0,.75]){const y=1.6+Math.sqrt(1.56-x*x)-.55;k.post(x,.3,0,.01,k.m.rope).position.y=y+.35;k.lamp(x,y,0);}for(const s of [-1,1])c.circle(s*1.25,0,.15);}},
 mineEntrance:{label:'Timber mine entrance',bounds:[1.9,1.2],build:(g,c)=>{const k=kit(g,c.world),d=c.world.mat.darkWood;k.ball(1,c.world.mat.stone,0,0,-.3,2.4,2.3,1.6);k.box(1.6,1.9,.3,k.m.warm,0,.95,.95);
  for(const s of [-1,1])k.box(.22,2.2,.22,d,s*.9,1.1,1.15);k.box(2.2,.24,.26,d,0,2.25,1.15);k.lamp(.9,1.7,1.4);for(const s of [-1,1])k.box(.1,.06,2,c.world.mat.iron,s*.35,.03,1.6);for(let z=.8;z<2.6;z+=.4)k.box(1,.05,.14,c.world.mat.wood,0,.02,z);}},
 crystalGrotto:{label:'Crystal grotto',bounds:[1.6,1.3],build:(g,c)=>{const k=kit(g,c.world),glow=c.world.placeGlow??=new THREE.MeshLambertMaterial({color:'#c9b8f6',emissive:'#8a72d8',emissiveIntensity:.45,flatShading:true});
  k.ball(1,c.world.mat.stone,0,0,-.4,2,1.9,1.4);k.add(new THREE.CylinderGeometry(.8,.8,.04,16),c.world.mat.water,0,.03,.9);for(const [x,y,z,s,t]of [[-.9,.2,.6,.45,.3],[.8,.2,.5,.55,-.2],[-.3,1.6,.6,.35,.6],[.4,1.3,.75,.3,-.5],[1.2,.2,1.1,.3,.4]]){const o=k.add(new THREE.OctahedronGeometry(s,0),glow,x,y+s,z);o.scale.y=1.8;o.rotation.z=t;}}},
 picketFence:{low:true,label:'Picket fence',bounds:[2,.12],build:(g,c)=>{const k=kit(g,c.world);for(let x=-1.9;x<=1.95;x+=.3){k.box(.14,.85,.05,k.m.cream,x,.42,0);k.ball(.07,k.m.cream,x,.86,0,1,1,.4);}for(const y of [.25,.62])k.box(4,.08,.06,k.m.cream,0,y,-.05);}},
 ropeFence:{low:true,label:'Rope fence',bounds:[2,.1],build:(g,c)=>{const k=kit(g,c.world);for(const x of [-2,0,2]){k.post(x,.9,0,.09);k.ball(.1,c.world.mat.wood,x,.92,0);}for(const s of [-1,1])for(const y of [.45,.8])k.add(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(V(s*2,y,0),V(s,y-.18,0),V(0,y,0)),10,.025,5),k.m.rope);}},
 stoneBridge:{label:'Stone bridge',bounds:[1.6,3],solid:false,build:(g,c)=>{const k=kit(g,c.world),st=c.world.mat.stone;c.walk(k.box(2.6,.3,6,st,0,.3,0));c.floor(0,0,1.15,3,.45);
  for(const s of [-1,1]){k.box(.25,.45,6,st,s*1.3,.65,0);c.rect(s*1.35,0,.13,3);k.add(new THREE.CylinderGeometry(.9,.9,.2,12,1,false,0,Math.PI),st,s*1.2,.15,0).rotation.set(0,0,Math.PI/2);for(const z of [-2.8,2.8])k.ball(.22,st,s*1.3,.95,z);}}},
 waterfall:{label:'Little waterfall',bounds:[1.6,1.2],build:(g,c)=>{const k=kit(g,c.world);for(const [x,y,s]of [[-1,.8,.9],[1,.8,.9],[0,1.6,.8],[-.6,2.2,.6],[.6,2.2,.6]])k.rock(s,x,y,-.6,1.2,1.1,.9,x+y);
  k.box(.9,2.2,.06,k.m.sky,0,1.15,.05);k.add(new THREE.CylinderGeometry(1.1,1.1,.05,18),c.world.mat.water,0,.04,.7);for(let i=0;i<6;i++){const a=i*.9;k.ball(.12,k.m.snow,Math.cos(a)*.35,.1,.25+Math.sin(a)*.2);}for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.rock(.22,Math.cos(a)*1.15,.08,.7+Math.sin(a)*1.1,1,.6,1,i);}}},
};

// Buttons go into the Build catalogue before main.js wires them, so placing, saving and replay work as for other pieces.
export function registerPlaceables(world){
 world.extraBuildPieces??={};const catalogue=globalThis.document?.querySelector('#buildCatalogue');
 for(const [type,piece]of Object.entries(PLACEABLES)){world.extraBuildPieces[type]=piece;if(catalogue&&!catalogue.querySelector(`[data-build="${type}"]`)){const b=document.createElement('button');b.dataset.build=type;b.textContent=piece.label;catalogue.append(b);}}
}
