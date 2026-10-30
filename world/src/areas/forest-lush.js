import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CAMP, terrainHeight, smoothstep } from '../world.js';
import { rng, signTexture } from '../textures.js';

// The deep layered forest round the firefly glade: tall pines and broadleaf trees, a middle
// layer of bushes and ferns, ground cover, mossy rocks and fallen logs, soft light shafts, low
// haze, and a little brook with a footbridge in its own clearing. Everything reuses the world's
// plant styles (painted oil/clean, low-poly, blocks), so every art style keeps its own look.
export const BROOK={x:-96,z:-233.5};
const BROOK_LINE=[[-134,-226],[-120,-229],[-106,-231.2],[-96,-233.5],[-86,-236],[-73,-240],[-60,-246]];
const SPUR=[[-99.5,-213.5],[-98.4,-219],[-96.6,-225],[-96,-230.6]], SOUTH=[[-96,-236.4],[-96.8,-239.5],[-99,-242.5]];
// Camera keys for the two appended shots (camera.js); trees keep their canopies clear of them.
export const BROOK_SHOT=[[-109,3.2,-224],[-104,2.9,-222.5],[-98,2.7,-222],[-91,2.8,-223.5]];
const ROUTE_SHOT=[0.03,0.8]; // the stretch of the trail the 'Deep forest path' shot walks

export function deepForestSample(curve,u,out){
  const a=ROUTE_SHOT[0]+(ROUTE_SHOT[1]-ROUTE_SHOT[0])*u,p=curve.getPointAt(a),q=curve.getPointAt(Math.min(1,a+0.07));
  out.pos.set(p.x,terrainHeight(p.x,p.z)+2.2,p.z);out.look.set(q.x,terrainHeight(q.x,q.z)+1.5,q.z);
}

// Pads go in before the forest's terrain update, which clears world trees out of them.
export function planLushForest(world){
  world.registerAreaPad({x:BROOK.x,z:BROOK.z+1,hx:9,hz:7,blend:0,clearOnly:true});
  for(const line of [SPUR,SOUTH,BROOK_LINE]){
    const c=new THREE.CatmullRomCurve3(line.map(([x,z])=>new THREE.Vector3(x,0,z))),n=Math.ceil(c.getLength()/2);
    for(let i=0;i<=n;i++){const p=c.getPointAt(i/n),t=c.getTangentAt(i/n);world.registerAreaPad({x:p.x,z:p.z,yaw:Math.atan2(t.x,t.z),hx:line===BROOK_LINE?2.2:2.4,hz:1.4,blend:0,clearOnly:true});}
  }
  for(const [x,,z] of BROOK_SHOT)world.registerAreaPad({x,z,hx:4,hz:4,blend:0,clearOnly:true});
}

const soft=(w,h,paint)=>{const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;};

export function buildLushForest(world,{curve,routeSamples,forest,glade,trailKeys}){
  const root=new THREE.Group();root.name='Deep layered forest';world.root.add(root);
  const r=rng(911),v=(x,y,z)=>new THREE.Vector3(x,y,z),variants=[],m4=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new THREE.Vector3(),p=new THREE.Vector3(),up=v(0,1,0),col=new THREE.Color();
  const lod={cam:v(1e9,0,0)};
  const sample=(line,step)=>{const c=new THREE.CatmullRomCurve3(line.map(([x,z])=>v(x,0,z)));return c.getSpacedPoints(Math.ceil(c.getLength()/step));};
  const spur=[...sample(SPUR,1),...sample(SOUTH,1)],brook=sample(BROOK_LINE,1.5),brookCurve=new THREE.CatmullRomCurve3(BROOK_LINE.map(([x,z])=>v(x,0,z)));
  const shotPoints=[...sample(BROOK_SHOT.map(([x,,z])=>[x,z]),1)];
  for(let i=0;i<=40;i++){const out={pos:v(),look:v()};deepForestSample(curve,i/40,out);shotPoints.push(out.pos);}
  // 3D camera samples of the forest shots: tree boxes stay 1.8 m clear of them (as the shot audits measure).
  const G=(x,h,z)=>v(x,terrainHeight(x,z)+h,z),cameras=[...shotPoints.slice(-41)];
  for(const keys of [trailKeys.map(k=>k[0]),BROOK_SHOT.map(([x,h,z])=>G(x,h,z)),[G(-58,7,-193),G(-56,7,-197)],[v(CAMP.x+11,0,CAMP.z+11),v(CAMP.x+6,0,CAMP.z+6.5)].map(p=>G(p.x,1.7,p.z))])
    cameras.push(...new THREE.CatmullRomCurve3(keys,false,'centripetal').getSpacedPoints(120));
  const near=(list,x,z,d)=>list.some(o=>Math.abs(x-o.x)<d&&Math.abs(z-o.z)<d&&Math.hypot(x-o.x,z-o.z)<d);
  const inForest=(x,z)=>Math.hypot(x+84,z+200)<58||Math.hypot(x-BROOK.x,z-BROOK.z)<42;
  const blockers=world.colliders.circles.filter(c=>inForest(c.x,c.z));
  // Keep paths, glades, the brook and their props clear of undergrowth.
  const openGround=(x,z,pad=0)=>!near(routeSamples,x,z,2.7+pad)&&!near(spur,x,z,2+pad)&&!near(brook,x,z,1.9+pad)&&Math.hypot(x-glade.x,z-glade.z)>9.5+pad&&
    Math.hypot(x-CAMP.x,z-CAMP.z)>19&&!(Math.abs(x+65)<8&&Math.abs(z+201)<10)&&Math.hypot(x-BROOK.x,(z-BROOK.z-1)*1.3)>5.5+pad&&!blockers.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+0.7);

  // ---------- plant sets: the same kind in each art style ----------
  // Lush plants use two crossed planes (the world's use three): a third less fill for a dense wood.
  const twoPlanes=new Map(),crossed=geo=>{if(!twoPlanes.has(geo)){geo.computeBoundingBox();const b=geo.boundingBox,a=new THREE.PlaneGeometry(b.max.x-b.min.x,b.max.y-b.min.y).translate(0,(b.max.y+b.min.y)/2,0),g=mergeGeometries([a,a.clone().rotateY(Math.PI/2)]);for(let i=0;i<g.attributes.normal.count;i++)g.attributes.normal.setXYZ(i,0,1,0);twoPlanes.set(geo,g);}return twoPlanes.get(geo);};
  const painted=(set,name,two=false)=>{const g=world.foliage?.[set],im=g?.getObjectByName(name);return im?{geometry:two?crossed(im.geometry):im.geometry,material:im.material,source:g,depth:im.customDepthMaterial}:null;};
  const lowSource=world.lowPoly[0],blockSource=world.blocky?.[0],always={visible:true};
  const notBlocks={get visible(){return !blockSource?.visible;}};
  const cells=new Map();
  // One instanced mesh per style per 30 m cell; cells further than `range` hide (distance LOD).
  function kind(list,styles,{range=Infinity,shadow=false,rootRadius=0,groundOffset=-0.03,tint=0.1,colors=null}={}){
    const groups=new Map();
    for(const item of list){const key=range===Infinity?'all':Math.floor(item[0]/30)+','+Math.floor(item[2]/30);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);}
    for(const items of groups.values()){
      const centre=items.reduce((c,[x,,z])=>c.add(v(x,0,z)),v()).divideScalar(items.length);centre.y=terrainHeight(centre.x,centre.z);
      for(const style of styles){if(!style)continue;
        const im=new THREE.InstancedMesh(style.geometry,style.material,items.length);
        items.forEach(([x,y,z,sc,yaw,sy=1],i)=>{im.setMatrixAt(i,m4.compose(p.set(x,y,z),q.setFromAxisAngle(up,yaw),s.set(sc,sc*sy,sc)));im.setColorAt(i,colors?col.set(colors[i%colors.length]):col.setRGB(1,1,1).offsetHSL((r()-0.5)*0.03,0,(r()-0.5)*tint));});
        im.castShadow=shadow&&!!(style.depth||!style.material.alphaTest);if(style.depth)im.customDepthMaterial=style.depth;
        im.receiveShadow=true;im.userData.rootRadius=rootRadius;im.userData.groundOffset=groundOffset;im.computeBoundingSphere();root.add(im);
        const source=style.source,r2=range*range;
        variants.push({im,source:range===Infinity?source:{get visible(){return source.visible&&lod.cam.distanceToSquared(centre)<r2;}}});
      }
    }
  }
  const ground=(x,z,off=-0.03)=>world.groundY(x,z)+off;

  // ---------- canopy: tall pines and broadleaf trees ----------
  const trees={pine:[],broad:[]},taken=[],grid=new Map(),cellKey=(x,z)=>Math.floor(x/4)+','+Math.floor(z/4);
  const spaced=(x,z,d)=>{for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const o of grid.get((Math.floor(x/4)+i)+','+(Math.floor(z/4)+j))||[])if(Math.hypot(x-o.x,z-o.z)<d)return false;return true;};
  const take=(x,z)=>{const k=cellKey(x,z);if(!grid.has(k))grid.set(k,[]);grid.get(k).push({x,z});};
  for(const c of blockers)take(c.x,c.z);
  const geo=i=>({geometry:world.treeGeos[i],material:world.mat.foliage,source:lowSource});
  const blk=i=>world.blocky?.[i]&&{geometry:world.blocky[i].geometry,material:world.blocky[i].material,source:blockSource};
  const treeSets=[[painted('oil','pine',true),painted('clean','pine',true),geo(3),blk(3)],[painted('oil','cottonwood',true),painted('clean','cottonwood',true),geo(0),blk(0)]];
  const treeBox=treeSets.map(list=>list.filter(Boolean).reduce((b,{geometry})=>{geometry.computeBoundingBox();return b.union(geometry.boundingBox);},new THREE.Box3()));
  for(let tries=0;tries<9000&&taken.length<430;tries++){
    const x=-146+r()*100,z=-264+r()*106;if(!inForest(x,z)||world._reserved(x,z)||Math.hypot(x-CAMP.x,z-CAMP.z)<20)continue;
    const broad=r()<0.38,sc=broad?0.75+r()*0.45:0.95+r()*0.85,reach=(broad?5.6:3.2)*sc;
    if(near(routeSamples,x,z,reach+1.6)||near(spur,x,z,reach+1.2)||near(shotPoints,x,z,reach+2)||near(brook,x,z,2.6)||!spaced(x,z,broad?4.6:3.9))continue;
    const tree=[x,ground(x,z,-0.15),z,sc,r()*6.28,0.9+r()*0.25],box=treeBox[broad?1:0].clone().applyMatrix4(m4.compose(p.set(tree[0],tree[1],tree[2]),q.setFromAxisAngle(up,tree[4]),s.set(sc,sc*tree[5],sc)));
    if(cameras.some(c=>box.distanceToPoint(c)<1.8))continue;
    take(x,z);taken.push({x,z,r:0.45*sc});(broad?trees.broad:trees.pine).push(tree);
  }
  for(const t of taken)world.colliders.circles.push(t);
  // Only trees beside the paths and the brook cast shadows: deeper in, nobody sees them.
  const byPath=([x,,z])=>near(routeSamples,x,z,16)||near(spur,x,z,14)||near(brook,x,z,14);
  for(const [list,set,tint] of [[trees.pine,treeSets[0],0.14],[trees.broad,treeSets[1],0.12]])for(const shadow of [true,false])
    kind(list.filter(t=>byPath(t)===shadow),set,{shadow,rootRadius:0.65,groundOffset:-0.15,tint});

  // ---------- middle layer: bushes and ferns ----------
  const scatter=(n,tries,test,make)=>{const out=[];for(let i=0;i<tries&&out.length<n;i++){const x=-146+r()*100,z=-264+r()*106;if(inForest(x,z)&&test(x,z))out.push(make(x,z));}return out;};
  const mono=(g,c)=>{g=g.index?g.toNonIndexed():g;const a=new Float32Array(g.attributes.position.count*3);for(let i=0;i<a.length;i+=3)a.set([c.r,c.g,c.b],i);g.setAttribute('color',new THREE.BufferAttribute(a,3));g.deleteAttribute('uv');return g;};
  const lowBush=mergeGeometries([[0,0.55,0,0.62],[0.42,0.42,0.18,0.45],[-0.38,0.45,-0.12,0.5],[0.05,0.8,-0.25,0.4]].map(([x,y,z,rad],i)=>mono(new THREE.IcosahedronGeometry(rad,0).translate(x,y,z),new THREE.Color().setHSL(0.27+i*0.012,0.42,0.3+i*0.035))));
  const blockBush=mergeGeometries([[1.3,0.8,1.1,0,0.4,0],[0.8,0.6,0.8,0.25,0.95,-0.1]].map(([w,h,d,x,y,z],i)=>mono(new THREE.BoxGeometry(w,h,d).translate(x,y,z),new THREE.Color().setHSL(0.28,0.45,0.32+i*0.06))));
  const bushes=scatter(380,9000,(x,z)=>openGround(x,z,0.3)&&(near(routeSamples,x,z,6.5)||near(spur,x,z,5)||r()<0.45),(x,z)=>[x,ground(x,z,-0.08),z,0.7+r()*0.6,r()*6.28]);
  kind(bushes,[painted('oil','bush',true),painted('clean','bush',true),{geometry:lowBush,material:world.mat.foliage,source:lowSource},blockSource&&{geometry:blockBush,material:blockSource.material,source:blockSource}],{range:150,rootRadius:0,groundOffset:-0.08});

  // A fern: six arching fronds, dark at the heart, fresh green at the tips (code-made, every style).
  const frond=[];
  for(let f=0;f<6;f++){
    const a=f*Math.PI*2/6+(f%2)*0.25,ca=Math.cos(a),sa=Math.sin(a),len=0.8+(f%3)*0.12,pos=[],colors=[],c=new THREE.Color();
    const at=(u,side,out)=>{const d=len*u,y=1.0*u-0.75*u*u;return [ca*d-sa*side*out,y-out*0.3,sa*d+ca*side*out];};
    const tri=(p1,p2,p3,u)=>{pos.push(...p1,...p2,...p3);c.setHSL(0.26,0.5,0.24+u*0.2);for(let k=0;k<3;k++)colors.push(c.r,c.g,c.b);};
    for(let k=0;k<8;k++){const u=k/8,u2=(k+1)/8,w=0.17*Math.sin(Math.PI*Math.min(1,0.15+u*0.95))*(1-0.4*u);
      tri(at(u,-1,0.01),at(u,1,0.01),at(u2,-1,0.01),u);tri(at(u,1,0.01),at(u2,1,0.01),at(u2,-1,0.01),u);
      for(const side of [-1,1])tri(at(u,side,0.01),at(u+0.045,side,w),at(u2,side,0.01),u);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));frond.push(g);
  }
  const fernGeo=mergeGeometries(frond);fernGeo.computeVertexNormals();
  const fernMat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});world._sway(fernMat,0.45,0.05);
  const ferns=scatter(820,12000,(x,z)=>openGround(x,z,-0.6),(x,z)=>[x,ground(x,z),z,0.75+r()*0.7,r()*6.28,0.8+r()*0.5]);
  kind(ferns,[{geometry:fernGeo,material:fernMat,source:always}],{range:95,tint:0.16});

  // ---------- ground cover: grass, flowers, mushrooms ----------
  const grass=scatter(2600,16000,(x,z)=>openGround(x,z,-0.9),(x,z)=>[x,ground(x,z),z,0.7+r()*0.8,r()*6.28]);
  const grassCone=new THREE.ConeGeometry(0.09,0.75,3).translate(0,0.37,0),grassMat=new THREE.MeshLambertMaterial({color:'#7d9b54'});
  kind(grass,[painted('oil','grass',true),painted('clean','grass',true),{geometry:grassCone,material:grassMat,source:lowSource}],{range:60,tint:0.14});
  const blooms=['#e7a4c3','#f3d27c','#b7a6e6','#f6efe2','#f2b39a'];
  const flowers=scatter(760,9000,(x,z)=>openGround(x,z,-0.9)&&(Math.hypot(x-BROOK.x,z-BROOK.z)<20||r()<0.5),(x,z)=>[x,ground(x,z),z,0.8+r()*0.6,r()*6.28]);
  const lowFlower=new THREE.IcosahedronGeometry(0.09,0).translate(0,0.45,0),cube=new THREE.BoxGeometry(0.24,0.24,0.24).translate(0,0.4,0),flowerMat=new THREE.MeshLambertMaterial();
  kind(flowers,[painted('oil','flowers',true),painted('clean','flowers',true)],{range:85});
  kind(flowers,[{geometry:lowFlower,material:flowerMat,source:lowSource},blockSource&&{geometry:cube,material:flowerMat,source:blockSource}],{range:85,colors:blooms});
  // Mushrooms: soft coral, peach, lilac and cream caps on cream stems, in little families.
  const shrooms=[];
  for(const [x0,,z0] of scatter(110,6000,(x,z)=>openGround(x,z,-1),(x,z)=>[x,0,z]))for(let k=0;k<1+Math.floor(r()*4);k++){const x=x0+(r()-0.5)*1.1,z=z0+(r()-0.5)*1.1;shrooms.push([x,ground(x,z),z,0.6+r()*0.9,r()*6.28]);}
  const stemMat=new THREE.MeshLambertMaterial({color:'#f3e6cc'}),capMat=new THREE.MeshLambertMaterial();
  kind(shrooms,[{geometry:new THREE.CylinderGeometry(0.045,0.065,0.24,8).translate(0,0.12,0),material:stemMat,source:always}],{range:65,tint:0.05});
  kind(shrooms,[{geometry:new THREE.SphereGeometry(0.15,12,6,0,Math.PI*2,0,Math.PI/2).scale(1,0.75,1).translate(0,0.22,0),material:capMat,source:always}],{range:65,colors:['#ea8f80','#f2bb86','#c8a8dc','#f4e3c3','#e9a0b0']});

  // ---------- mossy rocks, pebbles and fallen logs ----------
  const stone=new THREE.MeshLambertMaterial({color:'#c4bcae',flatShading:true}),moss=new THREE.MeshLambertMaterial({color:'#86ad72'});
  const rocks=scatter(80,6000,(x,z)=>openGround(x,z,1.4),(x,z)=>[x,ground(x,z,-0.05),z,0.55+r()*0.5,r()*6.28,0.85]);
  for(const [x,,z,sc] of rocks)world.colliders.circles.push({x,z,r:0.9*sc});
  kind(rocks,[{geometry:new THREE.IcosahedronGeometry(0.8,1).scale(1.25,0.7,1).translate(0,0.25,0),material:stone,source:always}],{range:160,tint:0.12,groundOffset:-0.05});
  kind(rocks,[{geometry:new THREE.SphereGeometry(0.55,12,6,0,Math.PI*2,0,Math.PI/2).scale(1.15,0.45,0.9).translate(0.1,0.62,0),material:moss,source:always}],{range:160,tint:0.18,groundOffset:-0.05});
  const pebbles=[];
  for(let i=0;i<=150;i++){const u=i/150,b=brookCurve.getPointAt(u),t=brookCurve.getTangentAt(u);for(const side of [-1,1]){if(r()<0.35)continue;const o=1.15+r()*0.55,x=b.x-t.z*side*o,z=b.z+t.x*side*o;if(Math.abs(x-BROOK.x)<1.4&&Math.abs(z-BROOK.z)<3.2)continue;pebbles.push([x,ground(x,z,0.02),z,0.4+r()*0.8,r()*6.28,0.6]);}}
  kind(pebbles,[{geometry:new THREE.IcosahedronGeometry(0.22,0).scale(1.2,0.6,1),material:stone,source:always}],{range:100,colors:['#c9c2b4','#ddd5c4','#b8b6aa','#d8c8b2']});

  const parts=new Map(),add=(g,mat)=>{if(!parts.has(mat))parts.set(mat,[]);parts.get(mat).push(g.index?g.toNonIndexed():g);};
  const bark=new THREE.MeshLambertMaterial({color:'#8c7056'}),cream=new THREE.MeshLambertMaterial({color:'#f5ebd5'}),rail=new THREE.MeshLambertMaterial({color:'#e9d7b4'});
  const logSpots=scatter(9,4000,(x,z)=>openGround(x,z,1.6),(x,z)=>[x,z,r()*Math.PI,2.6+r()*2,0.32+r()*0.16]);
  for(const [x,z,yaw,len,rad] of logSpots){
    const dx=Math.cos(yaw)*len/2,dz=Math.sin(yaw)*len/2,a=v(x-dx,world.groundY(x-dx,z-dz)+rad*0.8,z-dz),b=v(x+dx,world.groundY(x+dx,z+dz)+rad*0.8,z+dz),dir=b.clone().sub(a),mid=a.clone().add(b).multiplyScalar(0.5);
    const turn=new THREE.Matrix4().compose(mid,new THREE.Quaternion().setFromUnitVectors(up,dir.clone().normalize()),v(1,1,1)),l=dir.length();
    add(new THREE.CylinderGeometry(rad,rad*1.08,l,12).applyMatrix4(turn),bark);
    for(const e of [-1,1])add(new THREE.CylinderGeometry(rad*0.96,rad*0.96,0.03,14).translate(0,e*l/2,0).applyMatrix4(turn),cream);
    for(let k=0;k<5;k++)add(new THREE.SphereGeometry(rad*0.42,8,6).scale(1.3,0.7,1).translate(0,-l*0.35+k*l*0.17,0).applyMatrix4(turn).translate(0,rad*0.78,0),moss);
    world.colliders.rects.push({cx:x,cz:z,ax:Math.cos(yaw),az:Math.sin(yaw),bx:-Math.sin(yaw),bz:Math.cos(yaw),hx:len/2,hz:rad+0.1});
  }

  // ---------- the brook, its footbridge and the clearing ----------
  for(const line of [SPUR,SOUTH]){const path=world._ribbon(line,2.2,world._pathMaterial(),{step:.5,fitGround:true,lift:.1});root.attach(path);}
  const waterTex=soft(128,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(170,225,225,0)');g.addColorStop(0.2,'rgba(150,215,220,0.85)');g.addColorStop(0.5,'rgba(135,205,215,0.95)');g.addColorStop(0.8,'rgba(150,215,220,0.85)');g.addColorStop(1,'rgba(170,225,225,0)');x.fillStyle=g;x.fillRect(0,0,w,h);
    const rr=rng(5);x.strokeStyle='rgba(255,255,250,0.55)';x.lineCap='round';for(let i=0;i<26;i++){const cx=w*(0.25+rr()*0.5),cy=rr()*h;x.lineWidth=2+rr()*3;x.beginPath();x.moveTo(cx-8,cy);x.quadraticCurveTo(cx,cy-6,cx+8,cy);x.stroke();}});
  waterTex.wrapT=THREE.RepeatWrapping;waterTex.repeat.set(1,3);
  const waterMat=new THREE.MeshLambertMaterial({map:waterTex,vertexColors:true,transparent:true,depthWrite:false,emissive:'#3f8f97',emissiveIntensity:0.2,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6});
  const water=world._ribbon(BROOK_LINE,2.5,waterMat,{step:.5,fitGround:true,lift:.14});water.name='Bubble Brook';root.attach(water);
  for(const b of brook)if(Math.abs(b.x-BROOK.x)>1.6)world.colliders.circles.push({x:b.x,z:b.z,r:0.95});
  const by=Math.max(world.groundY(BROOK.x,BROOK.z-2.4),world.groundY(BROOK.x,BROOK.z+2.4));
  // planks follow the gentle arch (tilted to its slope) on two curved side beams
  const arch=k=>by+0.22+0.3*Math.sin(Math.PI*k/9),slope=k=>Math.atan(0.3*Math.PI/9*Math.cos(Math.PI*k/9)/0.533);
  for(let k=0;k<=9;k++)add(new THREE.BoxGeometry(1.7,0.08,0.56).rotateX(slope(k)).translate(BROOK.x,arch(k),BROOK.z+2.4-k*0.533),world.mat.wood);
  for(const side of [-0.7,0.7])for(let k=0;k<9;k++){const a=v(BROOK.x+side,arch(k)-0.1,BROOK.z+2.4-k*0.533),b=v(BROOK.x+side,arch(k+1)-0.1,BROOK.z+2.4-(k+1)*0.533),d=b.clone().sub(a);add(new THREE.BoxGeometry(0.12,0.16,d.length()+0.04).applyMatrix4(new THREE.Matrix4().lookAt(a,b,up)).translate(...a.clone().add(b).multiplyScalar(0.5).toArray()),bark);}
  for(const side of [-1,1]){
    const posts=[0,4.5,9].map(k=>{const z=BROOK.z+2.4-k*0.533,y=by+0.22+0.3*Math.sin(Math.PI*k/9);add(new THREE.CylinderGeometry(0.06,0.07,0.75,8).translate(BROOK.x+side*0.8,y+0.37,z),rail);add(new THREE.SphereGeometry(0.08,8,6).translate(BROOK.x+side*0.8,y+0.77,z),rail);return v(BROOK.x+side*0.8,y+0.7,z);});
    for(let k=0;k<2;k++){const a=posts[k],b=posts[k+1],d=b.clone().sub(a);add(new THREE.CylinderGeometry(0.04,0.04,d.length(),6).applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),new THREE.Quaternion().setFromUnitVectors(up,d.normalize()),v(1,1,1))),rail);}
  }
  const sx=BROOK.x+2.6,sz=BROOK.z+4.4,sy=world.groundY(sx,sz);
  add(new THREE.BoxGeometry(0.12,1.6,0.12).translate(sx,sy+0.8,sz),bark);
  const signMat=new THREE.MeshLambertMaterial({map:signTexture('BUBBLE BROOK',640,160,[95,24,78],'#3f6a73')});
  const sign=new THREE.Mesh(new THREE.BoxGeometry(1.9,0.48,0.08),signMat);sign.position.set(sx,sy+1.45,sz);sign.rotation.y=-0.35;root.add(sign);world.colliders.circles.push({x:sx,z:sz,r:0.2});
  // a mossy log bench beside the water
  const lx=BROOK.x-5.5,lz=-229.6,ly=world.groundY(lx,lz);
  add(new THREE.CylinderGeometry(0.42,0.46,3.2,12).rotateZ(Math.PI/2).rotateY(-0.18).translate(lx,ly+0.42,lz),bark);
  for(let k=0;k<4;k++)add(new THREE.SphereGeometry(0.22,8,6).scale(1.2,0.5,1).translate(lx-1.1+k*0.75,ly+0.8,lz-0.2+k*0.13),moss);
  world.colliders.rects.push({cx:lx,cz:lz,ax:Math.cos(0.18),az:Math.sin(0.18),bx:-Math.sin(0.18),bz:Math.cos(0.18),hx:1.6,hz:0.5});
  for(const dx of [-0.6,0.6])world.benches.push({x:lx+dx,y:ly+0.9,z:lz+0.1,yaw:Math.PI,who:null});
  for(const [mat,geos]of parts){const mesh=new THREE.Mesh(mergeGeometries(geos),mat);mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);geos.forEach(g=>g.dispose());}
  // three ducklings paddling slowly up and down the brook
  const duckMat=new THREE.MeshLambertMaterial({color:'#f6e7b0'}),bill=new THREE.MeshLambertMaterial({color:'#efb36a'}),ink=new THREE.MeshLambertMaterial({color:'#465d65'});
  const ducks=[0,1,2].map(i=>{const g=new THREE.Group(),b=(geo,mat,x,y,z)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;g.add(o);};
    b(new THREE.SphereGeometry(0.16,12,8).scale(0.85,0.8,1.3),duckMat,0,0.1,0);b(new THREE.SphereGeometry(0.1,10,8),duckMat,0,0.27,0.14);b(new THREE.SphereGeometry(0.05,8,6).scale(1,0.45,1.5),bill,0,0.25,0.24);
    for(const x of [-0.05,0.05])b(new THREE.SphereGeometry(0.016,6,6),ink,x,0.3,0.21);g.scale.setScalar(i?0.8:1.15);root.add(g);return g;});

  // ---------- light: shafts through the canopy, low haze, fireflies by the water ----------
  const beam=soft(64,256,(x,w,h)=>{for(let j=0;j<h;j++){const fy=Math.sin(Math.PI*j/h)**1.5;const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(255,246,214,0)');g.addColorStop(0.5,`rgba(255,246,214,${fy})`);g.addColorStop(1,'rgba(255,246,214,0)');x.fillStyle=g;x.fillRect(0,j,w,1);}});
  const haze=soft(128,128,(x,w,h)=>{const g=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(255,255,255,0.9)');g.addColorStop(0.5,'rgba(255,255,255,0.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h);});
  const shaftSpots=[[0.12,2.5],[0.22,-3],[0.33,3.5],[0.45,-2.8],[0.55,3.2],[0.66,-3.4],[0.78,2.6],[0.9,-2.4]].map(([u,o])=>{const a=curve.getPointAt(u),t=curve.getTangentAt(u);return [a.x-t.z*o,a.z+t.x*o];});
  shaftSpots.push([BROOK.x-4,BROOK.z+3],[BROOK.x+3,BROOK.z+5],[BROOK.x-1,BROOK.z-3],[glade.x-3,glade.z+4],[glade.x+4,glade.z-3]);
  const shafts=shaftSpots.map(([x,z],i)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(2.4+(i%3)*0.8,17),new THREE.MeshBasicMaterial({map:beam,color:'#fff1c4',transparent:true,opacity:0,depthWrite:false,fog:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));m.position.set(x,world.groundY(x,z)+7.5,z);m.renderOrder=3;root.add(m);return m;});
  const mists=scatter(20,3000,(x,z)=>!near(routeSamples,x,z,4)&&!near(shotPoints,x,z,7),(x,z)=>{const m=new THREE.Sprite(new THREE.SpriteMaterial({map:haze,color:'#f2f1df',transparent:true,opacity:0,depthWrite:false}));m.position.set(x,world.groundY(x,z)+1.3,z);m.scale.set(15+r()*8,4+r()*2,1);m.userData.home=m.position.clone();root.add(m);return m;});
  const flyCount=48,fp=new Float32Array(flyCount*3),fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(fp,3));
  const flyHomes=Array.from({length:flyCount},(_,i)=>{const b=brookCurve.getPointAt(0.15+0.6*(i/flyCount)),o=(i%2?1:-1)*(1.5+(i%5)*0.7);return {x:b.x+(i%3-1)*1.2,z:b.z+o};});
  const glow=soft(64,64,(x)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,248,210,0.6)');g.addColorStop(1,'rgba(255,248,210,0)');x.fillStyle=g;x.fillRect(0,0,64,64);});
  const flies=new THREE.Points(fg,new THREE.PointsMaterial({map:glow,color:'#fff4b0',size:0.25,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));flies.frustumCulled=false;root.add(flies);
  const sunTint=new THREE.Color(),fogTint=new THREE.Color(),mistDay=new THREE.Color('#f4f0dc'),mistNight=new THREE.Color('#8ea6c8');
  root.updateMatrixWorld(true);
  forest.variants.push(...variants);

  return {root,water,ducks,shafts,mists,flies,variants,trees,counts:{trees:trees.pine.length+trees.broad.length,bushes:bushes.length,ferns:ferns.length,grass:grass.length,flowers:flowers.length,mushrooms:shrooms.length,rocks:rocks.length,logs:logSpots.length},
    update(t,camera,atmos,night,day){
      lod.cam.copy(camera.position);
      waterTex.offset.y=-t*0.12;waterMat.emissiveIntensity=0.18+night*0.22;
      const sunny=day*(1-atmos.rain)*Math.min(1,atmos.sunIntensity/2.2);sunTint.set(atmos.sunColor).lerp(mistDay,0.55);
      shafts.forEach((m,i)=>{const d=camera.position.distanceTo(m.position),o=sunny*0.07*(0.65+0.35*Math.sin(t*0.07+i*1.7))*smoothstep(5,12,d)*(1-smoothstep(70,110,d));m.visible=o>0.003;m.material.opacity=o;m.material.color.copy(sunTint);m.rotation.set(0,Math.atan2(camera.position.x-m.position.x,camera.position.z-m.position.z),-0.24);});
      mists.forEach((m,i)=>{const d=camera.position.distanceTo(m.position),o=(0.16+0.08*atmos.rain+0.06*night)*smoothstep(8,22,d)*(1-smoothstep(120,170,d));m.visible=o>0.004;m.material.opacity=o;m.material.color.copy(mistDay).lerp(mistNight,night).lerp(fogTint.set(atmos.fogColor),0.25);m.position.x=m.userData.home.x+Math.sin(t*0.03+i)*1.6;});
      for(let i=0;i<flyCount;i++){const x=flyHomes[i].x+Math.sin(t*.21+i)*.4,z=flyHomes[i].z+Math.cos(t*.19+i)*.4;fp[i*3]=x;fp[i*3+1]=world.groundY(x,z)+.7+(i%6)*.25+Math.sin(t*.5+i)*.2;fp[i*3+2]=z;}fg.attributes.position.needsUpdate=true;const dusk=smoothstep(0.15,0.6,night);flies.material.opacity=dusk*0.95;flies.visible=dusk>0.01;
      ducks.forEach((g,i)=>{const u=0.3+0.16*Math.sin(t*0.018)+i*0.012,b=brookCurve.getPointAt(u),tn=brookCurve.getTangentAt(u),dirn=Math.cos(t*0.018)>=0?1:-1;g.position.set(b.x,world.groundY(b.x,b.z)+0.12+Math.sin(t*1.3+i)*0.012,b.z);g.rotation.y=Math.atan2(tn.x*dirn,tn.z*dirn);});
    }};
}
