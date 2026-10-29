import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { terrainHeight, walkHeight } from '../world.js';
import { signTexture } from '../textures.js';

export const CRYSTAL_HILL={x:173,z:-115,topX:202,topZ:-145};
let rideReader=()=>null,gameRideReader=()=>null,rideHomeY=0;
export const BALLOON_RIDE_SECONDS=240;
export function setBalloonRideReader(reader){rideReader=reader;}
export function setBalloonGameReader(reader){gameRideReader=reader;}
export function balloonRideState(){return gameRideReader()||rideReader();}
const rideCurve=new THREE.CatmullRomCurve3([[202,-145],[-90,-204],[0,-35],[40,150],[-225,0],[-375,-50],[202,-145]].map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal');
const ease=u=>{u=THREE.MathUtils.clamp(u,0,1);return u*u*u*(u*(u*6-15)+10);};
// Ease only the departure/return, then travel at an even pace along the curve.
const travel=u=>{const ramp=v=>0.1*(v*v*v-0.5*v*v*v*v)/0.9;return u<0.1?ramp(u/0.1):u>0.9?1-ramp((1-u)/0.1):(u-0.05)/0.9;};
export function sampleBalloonRide(time){
  const t=THREE.MathUtils.clamp(time,0,BALLOON_RIDE_SECONDS),u=THREE.MathUtils.clamp((t-30)/180,0,1),p=rideCurve.getPointAt(travel(u));
  const cruise=Math.max(82,rideHomeY+28),lift=t<30?ease(t/30):t>210?1-ease((t-210)/30):1;
  p.y=rideHomeY+0.2+(cruise-rideHomeY-0.2)*lift;
  return p;
}
export function buildCrystalMine(world) {
  const root=new THREE.Group();root.name='Crystal hill';world.root.add(root);
  const y=terrainHeight(173,-115),top=world.registerAreaPad({x:202,z:-145,y:y+12,hx:10,hz:10,blend:16});
  rideHomeY=top.y;
  const pad=world.registerAreaPad({x:173,z:-115,y,hx:9,hz:10,blend:9});world.updateTerrain();
  const approach=new THREE.CatmullRomCurve3([[173,-104],[185,-101],[195,-107],[187,-120],[192,-133],[202,-141]].map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal');
  for(let i=1;i<=24;i++){const u=i/24,p=approach.getPointAt(u);world.registerAreaPad({x:p.x,z:p.z,y:y+(top.y-y)*u,hx:2.1,hz:2.1,blend:4});}
  world.updateTerrain();
  const v=(x,h,z)=>new THREE.Vector3(x,h,z),mat=(color,glow=0)=>new THREE.MeshLambertMaterial({color,emissive:color,emissiveIntensity:glow});
  const wood=mat('#bc9b76'),stone=mat('#afbec2',0.06),cream=mat('#fff0d4'),moss=mat('#91ae80');
  const rockMats=['#aaa18c','#c1b49b','#969783'].map(c=>mat(c,0.035));
  const rockCanvas=document.createElement('canvas');rockCanvas.width=rockCanvas.height=128;
  const rockContext=rockCanvas.getContext('2d'),rockPixels=rockContext.createImageData(128,128);
  for(let z=0;z<128;z++)for(let x=0;x<128;x++){const u=x/128*Math.PI*2,v=z/128*Math.PI*2,n=.89+.045*Math.sin(u*3+Math.sin(v*2))+.035*Math.cos(v*5+Math.sin(u*4))+.02*Math.sin(u*17+v*11),i=(z*128+x)*4;rockPixels.data[i]=rockPixels.data[i+1]=rockPixels.data[i+2]=Math.round(n*255);rockPixels.data[i+3]=255;}
  rockContext.putImageData(rockPixels,0,0);const rockMap=new THREE.CanvasTexture(rockCanvas);rockMap.colorSpace=THREE.SRGBColorSpace;rockMap.wrapS=rockMap.wrapT=THREE.RepeatWrapping;stone.map=rockMap;rockMats.forEach(m=>m.map=rockMap);
  const colors=['#b6e8e5','#8fd3df','#b7dce8','#a3d8ce'];const crystalMats=colors.map(c=>mat(c,0.25));
  const buckets=new Map(),clusters=[],balloonMats=[],flags=[],glows=[];
  const glowMats=colors.map(color=>new THREE.SpriteMaterial({map:world.haloMat.map,color,transparent:true,opacity:0.15,depthWrite:false,blending:THREE.AdditiveBlending}));
  function solid(geo,m,x,h,z,parent=root,rot=null){if(rot)geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rot)));geo.translate(x,h,z);const key=parent.uuid+m.uuid;if(!buckets.has(key))buckets.set(key,{parent,m,geos:[]});buckets.get(key).geos.push(geo.index?geo.toNonIndexed():geo);}
  const box=(w,h,d,m,x,py,z,g=root)=>solid(new THREE.BoxGeometry(w,h,d),m,x,py,z,g);
  const ball=(r,m,x,h,z,g=root,s=[1,1,1])=>solid(new THREE.SphereGeometry(r,12,8).scale(...s),m,x,h,z,g);
  function group(x,h,z,parent=root){const g=new THREE.Group();g.position.set(x,h,z);parent.add(g);return g;}
  function rect(cx,cz,hx,hz){world.colliders.rects.push({cx,cz,ax:1,az:0,bx:0,bz:1,hx,hz});}
  function crystal(x,h,z,scale=1){for(let i=0;i<4;i++){const a=i*2.4,height=(0.7+i*0.22)*scale;const profile=[[0,0],[.15*scale,0],[.23*scale,.1*scale],[.19*scale,height-.15*scale],[.1*scale,height-.03*scale],[0,height]].map(([r,h])=>new THREE.Vector2(r,h));solid(new THREE.LatheGeometry(profile,6),crystalMats[i],x+Math.cos(a)*0.28*scale,h,z+Math.sin(a)*0.28*scale,root,[0.08*Math.sin(a),0,0.12*Math.cos(a)]);}clusters.push([x,z]);if(scale>=0.55){const glow=new THREE.Sprite(glowMats[clusters.length%4]);glow.position.set(x,h+0.5*scale,z);glow.scale.setScalar(2.2*scale);root.add(glow);glows.push(glow);}}
  // Keep a bright, clear passage behind the timber entrance supports.
  box(6.6,0.12,8.3,world.paintedMaterial('stone',2,2,{color:'#d4ceba'})||mat('#d4ceba'),173,y+0.03,-116);
  const shellPos=[],shellUV=[],shellIndex=[],archSteps=24;
  for(let j=0;j<=8;j++)for(let i=0;i<=archSteps;i++){const a=i/archSteps*Math.PI; shellPos.push(173+Math.cos(a)*3.2,y+0.18+Math.sin(a)*4.05,-111.8-j*1.03);shellUV.push(i/archSteps*2,j/4);}
  for(let j=0;j<8;j++)for(let i=0;i<archSteps;i++){const a=j*(archSteps+1)+i,b=a+archSteps+1;shellIndex.push(a,b,a+1,b,b+1,a+1);}
  const shell=new THREE.BufferGeometry();shell.setAttribute('position',new THREE.Float32BufferAttribute(shellPos,3));shell.setAttribute('uv',new THREE.Float32BufferAttribute(shellUV,2));shell.setIndex(shellIndex);shell.computeVertexNormals();
  const lining=stone.clone();lining.side=THREE.DoubleSide;solid(shell,lining,0,0,0);
  ball(1,stone,173,y+2,-120,root,[3.2,2.15,.35]);
  rect(169.8,-116,0.23,4.2);rect(176.2,-116,0.23,4.2);rect(173,-120,3.4,0.23);
  world.ceilings.push({cx:173,cz:-116,ax:1,az:0,bx:0,bz:1,hx:3.4,hz:4.2,y:y+4.05});
  const timber=world.paintedMaterial('boards',2,1,{color:'#c6a476'})||mat('#b68b5e');
  for(const z of [-111.5,-115,-118.5]){
    for(const x of [170,176]){
      solid(new THREE.CapsuleGeometry(.18,3.2,3,8),timber,x,y+1.78,z);
      rect(x,z,.18,.22);
    }
    solid(new THREE.CapsuleGeometry(.2,6,3,8),timber,173,y+3.55,z,root,[0,0,Math.PI/2]);
    for(const side of [-1,1])solid(new THREE.CapsuleGeometry(.11,.9,3,8),timber,173+side*2.65,y+3.16,z,root,[0,0,side*Math.PI/4]);
  }
  for(let i=0;i<9;i++){const a=i*Math.PI/8,r=.67+(i%3)*.09,x=173+Math.cos(a)*3.7,h=y+.4+Math.sin(a)*4.1;solid(new THREE.DodecahedronGeometry(r,1).scale(1.1, .85+(i%2)*.3,1.1),rockMats[i%3],x,h,-112.1,root,[.13*i,.2*i,.11*i]);}
  for(const side of [-1,1])for(let i=0;i<4;i++)solid(new THREE.DodecahedronGeometry(.8+i*.1,1).scale(1.1,.7,1.4),rockMats[i%3],173+side*(3.9+i*.6),y+.35,-112-i*1.5,root,[0,i*.35,.12]);
  for(const x of [169.9,176.1]){solid(new THREE.CapsuleGeometry(.24,3.7,3,8),timber,x,y+2,-110.9);rect(x,-110.9,.24,.25);}
  box(6.8,.9,.38,timber,173,y+4.25,-110.8);
  solid(new THREE.BoxGeometry(5.8,.65,.08),new THREE.MeshLambertMaterial({map:signTexture('CRYSTAL MINE',768,192,[38,35,86],'#63492e')}),173,y+4.25,-110.55);
  for(const [x,z,s]of [[169.3,-109.7,.85],[177,-113,.8],[170.5,-117,.65],[175.5,-117,.65]]){crystal(x,terrainHeight(x,z)+.1,z,s);world.colliders.circles.push({x,z,r:.5*s});}
  for(let z=-119;z<=-104;z+=0.7)box(1.8,0.1,0.18,wood,173,y+0.12,z);
  for(const x of [172.4,173.6])box(0.07,0.12,15.5,stone,x,y+0.23,-111.5);
  const cart=group(176.6,y,-108);box(1.45,0.7,1.6,wood,0,0.8,0,cart);box(1.6,0.1,1.75,cream,0,1.16,0,cart);
  for(const sx of [-1,1])for(const sz of [-1,1])solid(new THREE.CylinderGeometry(0.25,0.25,0.1,12),stone,sx*0.78,0.3,sz*0.55,cart,[0,0,Math.PI/2]);
  for(let i=0;i<6;i++)crystal(176.25+(i%2)*0.7,y+1.2,-108.5+Math.floor(i/2)*0.45,0.45);
  rect(176.6,-108,0.85,0.95);
  function lamp(x,z){const h=world.groundY(x,z);box(0.14,2.4,0.14,timber,x,h+1.2,z);box(0.34,0.45,0.34,world.mat.lantern,x,h+2.2,z);for(const sx of [-1,1])for(const sz of [-1,1])box(.035,.5,.035,timber,x+sx*.19,h+2.2,z+sz*.19);box(.48,.08,.48,timber,x,h+2.48,z);const sp=new THREE.Sprite(world.haloMat);sp.position.set(x,h+2.2,z);sp.scale.setScalar(1.6);root.add(sp);world.colliders.circles.push({x,z,r:0.2});}
  for(const [x,z]of [[169,-111],[177,-111],[171,-118],[175,-118],[207,-140]])lamp(x,z);
  for(const u of [.18,.4,.62,.82]){const p=approach.getPointAt(u),t=approach.getTangentAt(u);lamp(p.x-t.z*2.9,p.z+t.x*2.9);}
  const pathPoints=Array.from({length:49},(_,i)=>{const p=approach.getPointAt(i/48);return[p.x,p.z];});
  const path=world._ribbon(pathPoints,3.4,world._pathMaterial(),{step:.5,fitGround:true,lift:.1});root.attach(path);
  for(const side of [-1,1]){const points=[];for(let i=1;i<=21;i++){const p=approach.getPointAt(i/24),t=approach.getTangentAt(i/24);points.push([p.x-t.z*side*2.25,p.z+t.x*side*2.25]);}root.attach(world._fence(points,true));}
  box(10,0.18,8,timber,202,top.y+0.015,-145);
  for(let i=0;i<20;i++)box(.48,.06,8,timber,197.25+i*.5,top.y+.12,-145);
  // Supports meet the rendered slope, rather than hovering over its edge.
  const deckSupports=[];
  for(const x of [197.3,202,206.7])for(const z of [-148.7,-141.3]){const bottom=world.groundY(x,z)-.25,height=top.y+.1-bottom;box(.26,height,.26,timber,x,bottom+height/2,z);deckSupports.push({x,z,bottom,top:top.y+.1});}
  for(const z of [-148.7,-141.3])box(9.6,.25,.22,timber,202,top.y-.08,z);
  world.floors.push({cx:202,cz:-145,ax:1,az:0,bx:0,bz:1,hx:5,hz:4,y:top.y+.15});
  const deckRails=[[197,-149,207,-149],[197,-149,197,-141],[207,-149,207,-141],[197,-141,200.5,-141],[203.5,-141,207,-141]];
  for(const [ax,az,bx,bz]of deckRails){const length=Math.hypot(bx-ax,bz-az),angle=Math.atan2(bz-az,bx-ax);for(const h of [.5,1])solid(new THREE.CapsuleGeometry(.07,length-.14,3,8),wood,(ax+bx)/2,top.y+h,(az+bz)/2,root,[0,-angle,Math.PI/2]);world.colliders.segs.push({ax,az,bx,bz});for(const [x,z]of [[ax,az],[bx,bz]])solid(new THREE.CapsuleGeometry(.09,.95,3,8),wood,x,top.y+.6,z);}
  const landing=new THREE.Mesh(new THREE.RingGeometry(1.55,1.65,48),cream);landing.rotation.x=-Math.PI/2;landing.position.set(202,top.y+.16,-145);root.add(landing);
  for(const x of [200,204]){solid(new THREE.CapsuleGeometry(.13,2.9,3,8),timber,x,top.y+1.6,-140.8);world.colliders.circles.push({x,z:-140.8,r:.16});}
  box(4.6,.8,.24,timber,202,top.y+3.1,-140.8);
  solid(new THREE.PlaneGeometry(4.2,.62),new THREE.MeshLambertMaterial({map:signTexture('BALLOON RIDES',768,160,[248,231,189],'#68482e')}),202,top.y+3.1,-140.665);
  for(const [x,z]of [[197.6,-148.4],[206.4,-148.4]])lamp(x,z);
  const bench=group(206,top.y+0.15,-144);box(1.8,0.1,0.5,wood,0,0.45,0,bench);box(1.8,0.35,0.1,wood,0,0.8,-0.2,bench);
  for(const x of [-0.7,0.7])box(0.12,0.45,0.45,wood,x,0.22,0,bench);
  for(const dx of [-0.4,0.4])world.benches.push({x:206+dx,y:top.y+0.65,z:-144,yaw:0,who:null});
  rect(206,-144,1,.35);
  const planting=[];
  const greens=['#829a60','#9eae70','#687f52'].map(c=>mat(c)),petals=['#f3c86c','#dec0df','#f0dfa5'].map(c=>mat(c,.02));
  const clearTrail=(x,z)=>{for(let i=0;i<=96;i++){const p=approach.getPointAt(i/96);if(Math.hypot(x-p.x,z-p.z)<3.8)return false;}return x<196||x>208||z<-150.5||z>-139.5;};
  for(let i=0;i<34;i++){const a=i*2.399,x=202+Math.cos(a)*(9+(i%5)*1.6),z=-145+Math.sin(a)*(8+(i%4)*2);if(!clearTrail(x,z))continue;const h=world.groundY(x,z),s=.6+(i%4)*.18;ball(1,greens[i%3],x,h+.35*s,z,root,[s,.65*s,s*.8]);world.colliders.circles.push({x,z,r:s*.7});planting.push({x,z,r:s*.7});if(i%3===0)solid(new THREE.DodecahedronGeometry(.45,1).scale(1.2,.7,1),rockMats[i%3],x+s,h+.2,z+.4);for(let j=0;j<5;j++){const fx=x+Math.cos(j*2.4)*(s+.4),fz=z+Math.sin(j*2.4)*(s+.4),fy=world.groundY(fx,fz);ball(.12,petals[(i+j)%3],fx,fy+.22,fz,root,[1,.55,1]);}}
  const balloon=group(202,top.y+.2,-145);
  const basketCollider={cx:202,cz:-145,ax:1,az:0,bx:0,bz:1,hx:.98,hz:.85};
  world.colliders.rects.push(basketCollider);
  const wicker=mat('#d8b77f');
  box(1.9,0.15,1.6,wicker,0,0.1,0,balloon);
  for(const z of [-0.75,0.75])box(1.9,1.15,0.12,wicker,0,0.7,z,balloon);
  for(const x of [-0.89,0.89])box(0.12,1.15,1.6,wicker,x,0.7,0,balloon);
  for(const z of [-0.8,0.8])solid(new THREE.CylinderGeometry(0.075,0.075,1.98,12),cream,0,1.3,z,balloon,[0,0,Math.PI/2]);
  for(const x of [-0.95,0.95])solid(new THREE.CylinderGeometry(0.075,0.075,1.6,12),cream,x,1.3,0,balloon,[Math.PI/2,0,0]);
  for(let i=0;i<10;i++){const x=-0.88+i*0.196;for(const z of [-0.81,0.81])box(0.035,1.15,0.025,cream,x,0.65,z,balloon);}
  for(let i=0;i<7;i++){for(const z of [-0.8,0.8])box(1.98,0.05,0.06,cream,0,0.12+i*0.18,z,balloon);for(const x of [-0.95,0.95])box(0.06,0.05,1.68,cream,x,0.12+i*0.18,0,balloon);}
  const stripes=['#efbac6','#eed39b','#b9d9b1','#a8d9df','#b9c5e5','#d3b7dc','#f0c6b1','#b2d9cf','#efd5ba','#d6c5eb'];
  stripes.forEach((c,i)=>{const bm=mat(c,0.08);balloonMats.push(bm);solid(new THREE.SphereGeometry(4,6,20,i*Math.PI*2/stripes.length,Math.PI*2/stripes.length).scale(1,1.35,1),bm,0,8,0,balloon);});
  // town name on a cream band around the envelope, three times so it reads from every side
  const label=document.createElement('canvas');label.width=896;label.height=128;const lc=label.getContext('2d');
  lc.fillStyle='#fff0d4';lc.fillRect(0,0,896,128);lc.fillStyle='#e9b44c';lc.fillRect(0,0,896,10);lc.fillRect(0,118,896,10);
  lc.fillStyle='#6a3f2a';lc.font='bold 78px Georgia, serif';lc.textAlign='center';lc.textBaseline='middle';lc.fillText('SP CREEK',448,68);
  const labelMap=new THREE.CanvasTexture(label);labelMap.colorSpace=THREE.SRGBColorSpace;labelMap.wrapS=THREE.RepeatWrapping;labelMap.repeat.set(3,1);
  const labelMat=mat('#ffffff',0.08);labelMat.map=labelMap;balloonMats.push(labelMat);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(4.08,4.08,1.25,48,1,true),labelMat);band.position.y=8;balloon.add(band);
  for(const sx of [-1,1])for(const sz of [-1,1])solid(new THREE.CylinderGeometry(0.025,0.025,3.5,6),cream,sx*0.8,2.7,sz*0.65,balloon);
  const burner=new THREE.Mesh(new THREE.SphereGeometry(0.25,12,8),new THREE.MeshBasicMaterial({color:'#ffe3a6'}));burner.position.y=2.1;balloon.add(burner);
  const ropes=[];for(const sx of [-1,1])for(const sz of [-1,1]){const start=v(202+sx*4,top.y+0.6,-145+sz*3),geo=new THREE.BufferGeometry().setFromPoints([start,start.clone()]);const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:'#b19c7d'}));root.add(line);box(0.14,1,0.14,wood,start.x,top.y+0.5,start.z);ropes.push({line,start,sx,sz});}
  for(const [x,z]of [[198,-149],[206,-149],[198,-141]]){box(0.08,2.1,0.08,wood,x,top.y+1.1,z);const g=group(x,top.y+1.9,z);solid(new THREE.PlaneGeometry(0.8,0.45),petals[flags.length%3],0.4,0,0,g);flags.push(g);}
  const positions=new Float32Array(90*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));const sparkles=new THREE.Points(geo,new THREE.PointsMaterial({color:'#f6e5f5',size:0.1,transparent:true,opacity:0.7,depthWrite:false,blending:THREE.AdditiveBlending}));sparkles.frustumCulled=false;root.add(sparkles);
  for(const {parent,m,geos}of buckets.values()){const mesh=new THREE.Mesh(mergeGeometries(geos),m);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);for(const g of geos)g.dispose();}root.updateMatrixWorld(true);
  world.balloonRide={balloon,top};
  return {root,pad,top,approach,path,deckRails,deckSupports,planting,balloon,crystalMats,clusters,sparkles,ropes,update(t,atmos){
    const night=Math.max(atmos.stars,world.lanternLevel),wind=Math.min(1.5,Math.abs(world.wind??1));
    crystalMats.forEach((m,i)=>m.emissiveIntensity=0.22+night*0.2+Math.sin(t*0.35+i)*0.025);
    glowMats.forEach((m,i)=>m.opacity=0.12+night*0.08+Math.sin(t*0.6+i)*0.015);
    const ride=balloonRideState();
    balloon.position.set(202+Math.sin(t*0.19)*0.08*wind,top.y+.2+Math.sin(t*0.35)*.025,-145+Math.cos(t*0.17)*.06*wind);balloon.rotation.z=Math.sin(t*0.2)*0.01*wind;
    if(ride){balloon.position.copy(sampleBalloonRide(ride.t));balloon.rotation.z=0;}
    const colliderIndex=world.colliders.rects.indexOf(basketCollider);
    if(ride&&colliderIndex>=0)world.colliders.rects.splice(colliderIndex,1);
    if(!ride){basketCollider.cx=balloon.position.x;basketCollider.cz=balloon.position.z;if(colliderIndex<0)world.colliders.rects.push(basketCollider);}
    const burn=Math.pow(0.5+0.5*Math.sin(t*0.28),8);burner.scale.setScalar(0.6+burn*0.8);balloonMats.forEach(m=>m.emissiveIntensity=0.06+night*0.12+burn*0.07);
    balloon.updateMatrixWorld(true);ropes.forEach(({line,start,sx,sz})=>{line.visible=!ride;const end=balloon.localToWorld(v(sx*0.85,0.15,sz*0.7)),p=line.geometry.attributes.position;p.setXYZ(0,start.x,start.y,start.z);p.setXYZ(1,end.x,end.y,end.z);p.needsUpdate=true;line.geometry.computeBoundingSphere();});
    flags.forEach((g,i)=>g.rotation.y=Math.sin(t*0.9+i)*0.13*wind);
    for(let i=0;i<90;i++){const hill=i>55,phase=(t*0.045+i/90)%1;positions[i*3]=(hill?202:173)+Math.sin(i*2.399+t*0.1)*(hill?6:3.2);positions[i*3+1]=(hill?top.y:y)+0.4+phase*(hill?5:3.3);positions[i*3+2]=(hill?-145:-114)+Math.cos(i*2.399+t*0.09)*(hill?5:6);}geo.attributes.position.needsUpdate=true;
  }};
}
