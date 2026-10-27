import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { terrainHeight, smoothstep } from '../world.js';
import { signTexture } from '../textures.js';
import { buildVillageDetails } from '../hamlet.js';

export const OLD_HOLLOW = { x: 125, z: -15, hx: 29, hz: 37 };

export function buildGhostTown(world) {
  const root = new THREE.Group(); root.name = 'Old Hollow'; world.root.add(root);
  const pad = world.registerAreaPad({ ...OLD_HOLLOW, blend: 12 });
  const y = pad.y, buildings = [], signs = [], ghosts = [], fog = [], wisps = [], chimes = [];
  const v = (x,y,z) => new THREE.Vector3(x,y,z);
  const material = (color, emissive = '#000000', intensity = 0) => new THREE.MeshLambertMaterial({ color, emissive, emissiveIntensity: intensity });
  const cream = material('#fff0ce'), wood = material('#9c8878'), mint = material('#b8d2c7'), silver = material('#d8e2e1');
  const blueGlow = material('#d6f4ef','#9bd8de',0.65), warmGlow = material('#fff3bd','#ffd492',0.7);
  const buckets = new Map();
  function solid(geo, mat, x, h, z, parent = root, rotation = null) {
    if(rotation)geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rotation)));
    geo.translate(x,h,z);const key=parent.uuid+mat.uuid;
    if(!buckets.has(key))buckets.set(key,{parent,mat,geos:[]});
    buckets.get(key).geos.push(geo.index?geo.toNonIndexed():geo);
  }
  const box = (w,h,d,m,x,py,z,g=root) => solid(new THREE.BoxGeometry(w,h,d),m,x,py,z,g);
  const ball = (r,m,x,py,z,g=root,scale=[1,1,1]) => solid(new THREE.SphereGeometry(r,12,8).scale(...scale),m,x,py,z,g);
  function group(x,h,z,yaw=0,parent=root){const g=new THREE.Group();g.position.set(x,h,z);g.rotation.y=yaw;parent.add(g);return g;}
  function line(points,mat,parent=root,r=0.018){solid(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),16,r,4,false),mat,0,0,0,parent);}
  const specs = [
    {type:'shop',x:114,z:8,yaw:Math.PI/2,w:11,sign:'OLD HOLLOW GENERAL STORE',wall:[155,22,77]},
    {type:'hotel',x:136,z:6,yaw:-Math.PI/2,w:12,floors:2,sign:'OLD HOLLOW HOTEL',wall:[270,20,76]},
    {type:'house',x:114,z:-15,yaw:Math.PI/2,w:9,sign:'SCHOOL',wall:[45,24,80]},
    {type:'house',x:136,z:-16,yaw:-Math.PI/2,w:9,sign:'MOONBEAM COTTAGE',wall:[170,22,76]},
    {type:'shop',x:114,z:-37,yaw:Math.PI/2,w:9,sign:'LEMONADE',wall:[40,27,80]},
    {type:'cabin',x:132,z:-43,yaw:0,w:8,sign:'GENTLE BELLS',wall:[210,20,78]},
  ];
  for(const [i,s] of specs.entries()) {
    const e=world.placeBuilding({...s,y},false);
    // Built-in scenery survives loading or clearing the user's layout, like Willow Creek.
    world.buildings.pop();world.buildingPOIs.pop();root.attach(e.obj);buildings.push(e);
    for(const m of e.additions.windowMats)m.emissive.set('#ffdb9e');
    const roof=e.obj.children[2];if(roof?.isMesh){roof.rotation.z=(i%2?1:-1)*0.025;}
    const trim=group(s.x,y,s.z,s.yaw);
    for(const sx of [-1,1]) {
      box(0.24,1.4,0.08,mint,sx*(s.w/2-0.55),1.2,0.23,trim);
      solid(new THREE.BoxGeometry(0.85,0.15,0.1),wood,sx*(s.w/2-0.8),2.1,0.28,trim,[0,0,sx*0.12]);
    }
    // A few silver corner threads, without creatures or dark recesses.
    const corner=s.w/2-0.3;
    for(let k=0;k<3;k++)line([v(corner,3.05,0.3),v(corner-0.4-k*0.15,2.9-k*0.13,0.3),v(corner-0.7,2.5,0.3)],silver,trim,0.007);
    const pivot=group(s.w/2-0.65,2.9,2.7,0,trim);
    box(0.07,0.55,0.07,wood,0,-0.25,0,pivot);
    const sm=new THREE.MeshLambertMaterial({map:signTexture(i===0?'WELCOME, FRIEND':s.sign,768,192,[160,18,80],'#4a635d'),side:THREE.DoubleSide});
    solid(new THREE.BoxGeometry(2.1,0.65,0.1),sm,0,-0.8,0,pivot);signs.push(pivot);
  }
  world.onBuildingsChanged?.();world.updateTerrain();
  // Cove loads these later in startup; load the local maps here for this area too.
  const streetSets={};for(const set of ['oil','clean']){const map=new THREE.TextureLoader().load(`assets/textures/${set}/cobblestones.png`);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;streetSets[set]=map;}
  const streetMaterial=new THREE.MeshLambertMaterial({map:streetSets.clean,color:'#eadac4'});streetMaterial.userData.sets=streetSets;world.surfaces.add(streetMaterial);
  function street(points,width){const m=world._ribbon(points,width,streetMaterial,{step:.5,fitGround:true,lift:.1}),p=m.geometry.attributes.position,uv=m.geometry.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/4,p.getZ(i)/4);root.attach(m);return m;}
  const streetRoutes=[[[125,20],[125,4],[122,-7],[125,-19],[126,-35],[132,-40]]];
  const road=street(streetRoutes[0],5);
  for(const s of specs){const end=[s.x+Math.sin(s.yaw)*3.8,s.z+Math.cos(s.yaw)*3.8],middle=s.z<-39?[132,-40]:s.z>-2?[125,s.z]:s.z<-27?[126,s.z]:s.z<-12?[125,s.z]:[122,s.z];streetRoutes.push([middle,end]);street([middle,end],2.4);}
  const path=world._ribbon([[66,29],[78,29],[96,24],[112,20],[125,17]],2.6,world._pathMaterial(),{step:1});root.attach(path);
  const marker=group(78,terrainHeight(78,29),29);
  box(0.13,2.4,0.13,wood,0,1.2,0,marker);
  solid(new THREE.BoxGeometry(3.4,0.7,0.12),new THREE.MeshLambertMaterial({map:signTexture('OLD HOLLOW →',768,192,[45,30,84],'#53685d')}),0,2.25,0,marker);
  // The bell tower uses the cabin builder as its base, with a soft domed belfry.
  const tower=group(132,y,-46);
  for(const sx of [-1,1])for(const sz of [-1,1])box(0.18,2.6,0.18,mint,sx*0.85,8.1,sz*0.85,tower);
  solid(new THREE.SphereGeometry(1.4,16,8,0,Math.PI*2,0,Math.PI/2).scale(1,0.55,1),mint,0,9.45,0,tower);
  solid(new THREE.SphereGeometry(0.55,16,8,0,Math.PI*2,0,Math.PI/2),warmGlow,0,7.9,0,tower);
  ball(0.11,cream,0,7.85,0,tower);

  function ghost(x,h,z,yaw=0,scale=1,kind='float') {
    const g=group(x,h,z,yaw);g.scale.setScalar(scale);
    const skin=new THREE.MeshLambertMaterial({color:'#fff9ed',emissive:'#f6e9ce',emissiveIntensity:0.15});
    const geo=new THREE.BoxGeometry(1.2,1.2,1.2,4,4,4),p=geo.attributes.position,point=v(0,0,0),core=v(0,0,0);
    for(let i=0;i<p.count;i++){point.fromBufferAttribute(p,i);core.copy(point).clampScalar(-.48,.48);point.sub(core).normalize().multiplyScalar(.12).add(core);p.setXYZ(i,point.x,point.y,point.z);}
    geo.computeVertexNormals();solid(geo,skin,0,.75,0,g);
    const blink=group(0,.94,0,0,g);
    const eyes=material('#476976'),rosy=material('#efb3b7','#df9fa2',0.2);
    for(const sx of [-1,1]) {
      ball(0.16,cream,sx*0.2,0,0.57,blink,[1,1.13,0.5]);
      ball(0.075,eyes,sx*0.2,0,0.65,blink,[1,1.15,0.6]);
      ball(0.026,cream,sx*0.2-0.02,0.035,0.697,blink);
      ball(0.095,rosy,sx*0.36,0.73,0.6,g,[1,0.5,0.35]);
    }
    line([v(-0.18,0.7,0.64),v(0,0.59,0.66),v(0.18,0.7,0.64)],eyes,g,0.022);
    const arms=[-1,1].map(sx=>{const a=group(sx*0.51,0.78,0,0,g);ball(0.17,skin,sx*0.12,0.12,0,a,[1.5,1.7,0.9]);return a;});
    const collider={x,z,r:.65*scale};world.colliders.circles.push(collider);
    const e={g,arms,skin,blink,collider,reactAt:-Infinity,home:v(x,h,z),yaw,kind};ghosts.push(e);return e;
  }
  ghost(123,y+1,13,0,1.1);
  ghost(114.8,y+1.55,-12.7,Math.PI/2,0.72,'peek');
  ghost(135,y+0.9,-21.2,-Math.PI/2,0.9,'peek');
  ghost(121.2,y+0.85,-23,Math.PI/2,0.9);
  ghost(128.3,y+1,-24,-Math.PI/2,1);
  // A gentle swing stays within its frame and away from walking paths.
  const swingFrame=group(144,y,-32);
  for(const sx of [-1,1])box(0.2,4.8,0.2,wood,sx*1.7,2.4,0,swingFrame);
  box(3.8,0.22,0.22,mint,0,4.8,0,swingFrame);
  const swing=group(0,4.65,0,0,swingFrame);
  for(const sx of [-1,1])box(0.04,2.8,0.04,silver,sx*0.65,-1.4,0,swing);
  box(1.6,0.12,0.55,mint,0,-2.8,0,swing);
  const rider=ghost(144,y+1.9,-32,0,0.85,'swing');swing.attach(rider.g);rider.g.position.set(0,-2.72,0);
  for(const x of [142.3,145.7])world.colliders.circles.push({x,z:-32,r:0.25});
  // Covered well: the luminous insert is closed and the rim is a solid play collider.
  const well=group(125,y,-7);
  solid(new THREE.CylinderGeometry(1.1,1.2,0.85,20),material('#b5beb7'),0,0.43,0,well);
  solid(new THREE.CircleGeometry(0.85,24),blueGlow,0,0.87,0,well,[-Math.PI/2,0,0]);
  for(const sx of [-1,1])box(0.13,2.8,0.13,wood,sx*1.1,1.4,0,well);
  solid(new THREE.SphereGeometry(1.55,16,8,0,Math.PI*2,0,Math.PI/2).scale(1,0.45,0.8),mint,0,2.8,0,well);
  ball(0.19,warmGlow,0,1.5,0,well);world.colliders.circles.push({x:125,z:-7,r:1.3});
  for(const [x,z] of [[119,9],[130,4],[119,-36],[134,-38]]) {
    const g=group(x,y,z);ball(0.48,material('#e8b079','#edb868',0.3),0,0.42,0,g,[1.1,0.85,1]);
    box(0.09,0.2,0.09,wood,0,0.87,0,g);
    for(const sx of [-1,1])ball(0.065,warmGlow,sx*0.15,0.5,0.44,g);
    line([v(-0.18,0.34,0.43),v(0,0.25,0.48),v(0.18,0.34,0.43)],warmGlow,g,0.025);
    const halo=new THREE.Sprite(world.haloMat);halo.position.set(0,0.5,0);halo.scale.setScalar(2);g.add(halo);
    world.colliders.circles.push({x,z,r:.55});
  }
  const blossoms=[material('#e9bdcc'),material('#f0d27d'),material('#c6cda0')];
  for(const [x,z]of [[118.5,0],[130.5,-2],[119,-27],[131,-30]]){const h=world.groundY(x,z);box(1.8,.35,.9,wood,x,h+.18,z);box(1.6,.05,.7,material('#756748'),x,h+.38,z);for(let i=0;i<7;i++)ball(.16,blossoms[i%3],x+(i%4-.5)*.32-.3,h+.52,z+(i%2?-.18:.18),root,[1,.65,1]);world.colliders.rects.push({cx:x,cz:z,ax:1,az:0,bx:0,bz:1,hx:.9,hz:.45});}
  for(const [x,z,yaw]of [[118.5,-4,Math.PI/2],[131,-24,-Math.PI/2]]){const h=world.groundY(x,z),g=group(x,h,z,yaw);box(1.8,.12,.55,wood,0,.48,0,g);box(1.8,.55,.12,wood,0,.85,-.25,g);for(const sx of [-1,1])box(.12,.46,.5,wood,sx*.7,.23,0,g);world.benches.push({x,y:h+.54,z,yaw,who:null});world.colliders.circles.push({x,z,r:1});}
  for(const [x,z] of [[118,5],[132,-14],[118,-35]]) {
    const g=group(x,y+3,z);box(0.9,0.07,0.1,wood,0,0,0,g);
    for(let i=0;i<4;i++)solid(new THREE.CylinderGeometry(0.035,0.035,0.5+i*0.1,8),silver,-0.32+i*0.21,-0.5,0,g);
    chimes.push(g);
  }
  const mistCanvas=document.createElement('canvas');mistCanvas.width=mistCanvas.height=128;
  const ctx=mistCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,4,64,64,64);
  gradient.addColorStop(0,'rgba(235,244,239,0.8)');gradient.addColorStop(0.55,'rgba(235,244,239,0.35)');gradient.addColorStop(1,'rgba(235,244,239,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const mistTex=new THREE.CanvasTexture(mistCanvas);
  for(let i=0;i<12;i++) {
    const m=new THREE.SpriteMaterial({map:mistTex,color:'#e9f3ee',transparent:true,opacity:0.1,depthWrite:false,fog:false});
    const sp=new THREE.Sprite(m);sp.scale.set(13+i%3*2,2.5+i%2,1);root.add(sp);fog.push(sp);
  }
  for(let i=0;i<14;i++) {
    const g=group(0,0,0);ball(0.07,i%2?warmGlow:blueGlow,0,0,0,g);
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:mistTex,color:i%2?'#fff3c5':'#ceffed',transparent:true,opacity:0.4,depthWrite:false,blending:THREE.AdditiveBlending}));glow.scale.setScalar(0.7);g.add(glow);wisps.push(g);
  }
  for(const {parent,mat,geos}of buckets.values()){const m=new THREE.Mesh(mergeGeometries(geos),mat);m.castShadow=!mat.transparent;m.receiveShadow=true;parent.add(m);for(const g of geos)g.dispose();}
  root.updateMatrixWorld(true);
  const homeDetails=buildVillageDetails(world,root,terrainHeight,{gardens:[[106,24],[146,-29]],mailboxes:[[118,10],[132,7],[118,-19]],windows:buildings.map(e=>({object:e.obj})),paths:[[[125,-7],[120,-7],[118,-15]],[[125,-7],[130,-8],[132,-16]],[[106,22],[112,20],[120,17]],[[146,-27],[142,-24],[136,-24]]]});
  const scratch=v(0,0,0);let lastTime=0;
  return {root,pad,buildings,ghosts,fog,signs,swing,homeDetails,road,streetRoutes,react(hit){const e=ghosts.find(e=>{for(let o=hit;o;o=o.parent)if(o===e.g)return true;return false;});if(!e)return false;e.reactAt=lastTime;return true;},update(t,player,atmos){
    lastTime=t;
    homeDetails.update(t);
    const night=Math.max(world.lanternLevel,atmos.stars);
    for(const [i,e]of buildings.entries())for(const m of e.additions.windowMats)m.emissiveIntensity=0.7+night*0.6;
    signs.forEach((g,i)=>g.rotation.z=(Math.sin(t*1.4+i)*0.07+Math.sin(t*2.3+i)*0.025)*(world.wind??1));
    ghosts.forEach((e,i)=>{
      e.skin.emissiveIntensity=0.12+night*0.15;
      const reaction=t>=e.reactAt&&t-e.reactAt<2?Math.sin((t-e.reactAt)/2*Math.PI):0,phase=(t+i*.71)%5.3;
      e.blink.scale.y=phase<.16?.12+.88*Math.abs(phase-.08)/.08:1;
      e.arms[1].rotation.z=.22+reaction*.75;
      if(e.kind==='swing')return;
      const close=player?1-smoothstep(2,7,Math.hypot(player.x-e.home.x,player.z-e.home.z)):0;
      e.g.position.copy(e.home);e.g.position.y+=Math.sin(t*0.65+i*1.5)*0.17;
      e.g.position.y+=reaction*.12;
      if(e.kind==='peek')e.g.position.z+=Math.sin(t*0.3+i)*0.42;
      if(close){scratch.copy(e.home).sub(player);scratch.y=0;scratch.normalize();e.g.position.addScaledVector(scratch,close*0.35);}
      e.collider.x=e.g.position.x;e.collider.z=e.g.position.z;
      e.g.rotation.y=e.yaw+(e.kind==='float'?Math.sin(t*0.2+i)*0.12:0);
      e.arms[0].rotation.z=-0.25-close*(0.8+Math.sin(t*2+i)*0.16);
      e.arms[1].rotation.z=0.22+Math.sin(t*0.7+i)*0.08+reaction*.75;
    });
    swing.rotation.x=Math.sin(t*0.55)*0.12;
    chimes.forEach((g,i)=>g.rotation.z=Math.sin(t*0.8+i)*0.055*(world.wind??1));
    fog.forEach((sp,i)=>{sp.position.set(116+(i%3)*9+Math.sin(t*0.025+i)*3,y+0.6+(i%2)*0.25,12-Math.floor(i/3)*17+Math.cos(t*0.018+i)*2);sp.material.opacity=0.055+night*0.065;});
    wisps.forEach((g,i)=>g.position.set(119+(i%3)*6+Math.sin(t*0.15+i)*0.5,y+1.2+Math.sin(t*0.35+i)*0.4,12-i*3.7));
  }};
}
