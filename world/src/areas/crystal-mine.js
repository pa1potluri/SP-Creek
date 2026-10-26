import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { terrainHeight, walkHeight } from '../world.js';
import { signTexture } from '../textures.js';

export const CRYSTAL_HILL={x:173,z:-115,topX:202,topZ:-145};
let rideReader=()=>null,rideHomeY=0;
export const BALLOON_RIDE_SECONDS=240;
export function setBalloonRideReader(reader){rideReader=reader;}
export function balloonRideState(){return rideReader();}
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
  const v=(x,h,z)=>new THREE.Vector3(x,h,z),mat=(color,glow=0)=>new THREE.MeshLambertMaterial({color,emissive:color,emissiveIntensity:glow});
  const wood=mat('#bc9b76'),stone=mat('#afbec2',0.06),cream=mat('#fff0d4'),moss=mat('#91ae80');
  const rockMats=['#b8c7c9','#c7c8bd','#a7babb'].map(c=>mat(c,0.035));
  const rockCanvas=document.createElement('canvas');rockCanvas.width=rockCanvas.height=128;
  const rockContext=rockCanvas.getContext('2d'),rockPixels=rockContext.createImageData(128,128);
  for(let z=0;z<128;z++)for(let x=0;x<128;x++){const u=x/128*Math.PI*2,v=z/128*Math.PI*2,n=.89+.045*Math.sin(u*3+Math.sin(v*2))+.035*Math.cos(v*5+Math.sin(u*4))+.02*Math.sin(u*17+v*11),i=(z*128+x)*4;rockPixels.data[i]=rockPixels.data[i+1]=rockPixels.data[i+2]=Math.round(n*255);rockPixels.data[i+3]=255;}
  rockContext.putImageData(rockPixels,0,0);const rockMap=new THREE.CanvasTexture(rockCanvas);rockMap.colorSpace=THREE.SRGBColorSpace;rockMap.wrapS=rockMap.wrapT=THREE.RepeatWrapping;stone.map=rockMap;rockMats.forEach(m=>m.map=rockMap);
  const colors=['#e5afd0','#9bd5e0','#c4b2df','#afd5bd'];const crystalMats=colors.map(c=>mat(c,0.25));
  const buckets=new Map(),clusters=[],balloonMats=[],flags=[],glows=[];
  const glowMats=colors.map(color=>new THREE.SpriteMaterial({map:world.haloMat.map,color,transparent:true,opacity:0.15,depthWrite:false,blending:THREE.AdditiveBlending}));
  function solid(geo,m,x,h,z,parent=root,rot=null){if(rot)geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rot)));geo.translate(x,h,z);const key=parent.uuid+m.uuid;if(!buckets.has(key))buckets.set(key,{parent,m,geos:[]});buckets.get(key).geos.push(geo.index?geo.toNonIndexed():geo);}
  const box=(w,h,d,m,x,py,z,g=root)=>solid(new THREE.BoxGeometry(w,h,d),m,x,py,z,g);
  const ball=(r,m,x,h,z,g=root,s=[1,1,1])=>solid(new THREE.SphereGeometry(r,12,8).scale(...s),m,x,h,z,g);
  function group(x,h,z,parent=root){const g=new THREE.Group();g.position.set(x,h,z);parent.add(g);return g;}
  function rect(cx,cz,hx,hz){world.colliders.rects.push({cx,cz,ax:1,az:0,bx:0,bz:1,hx,hz});}
  function crystal(x,h,z,scale=1){for(let i=0;i<4;i++){const a=i*2.4,height=(0.7+i*0.22)*scale;const profile=[[0,0],[.15*scale,0],[.23*scale,.1*scale],[.19*scale,height-.15*scale],[.1*scale,height-.03*scale],[0,height]].map(([r,h])=>new THREE.Vector2(r,h));solid(new THREE.LatheGeometry(profile,6),crystalMats[i],x+Math.cos(a)*0.28*scale,h,z+Math.sin(a)*0.28*scale,root,[0.08*Math.sin(a),0,0.12*Math.cos(a)]);}clusters.push([x,z]);if(scale>=0.55){const glow=new THREE.Sprite(glowMats[clusters.length%4]);glow.position.set(x,h+0.5*scale,z);glow.scale.setScalar(2.2*scale);root.add(glow);glows.push(glow);}}
  // A rounded, bright grotto rather than a square room with oversized brick textures.
  box(6.6,0.12,8.3,mat('#d4ceba'),173,y+0.03,-116);
  const shellPos=[],shellUV=[],shellIndex=[],archSteps=24;
  for(let j=0;j<=8;j++)for(let i=0;i<=archSteps;i++){const a=i/archSteps*Math.PI; shellPos.push(173+Math.cos(a)*3.2,y+0.18+Math.sin(a)*4.05,-111.8-j*1.03);shellUV.push(i/archSteps*2,j/4);}
  for(let j=0;j<8;j++)for(let i=0;i<archSteps;i++){const a=j*(archSteps+1)+i,b=a+archSteps+1;shellIndex.push(a,b,a+1,b,b+1,a+1);}
  const shell=new THREE.BufferGeometry();shell.setAttribute('position',new THREE.Float32BufferAttribute(shellPos,3));shell.setAttribute('uv',new THREE.Float32BufferAttribute(shellUV,2));shell.setIndex(shellIndex);shell.computeVertexNormals();
  const lining=stone.clone();lining.side=THREE.DoubleSide;solid(shell,lining,0,0,0);
  ball(1,stone,173,y+2,-120,root,[3.2,2.15,.35]);
  rect(169.8,-116,0.23,4.2);rect(176.2,-116,0.23,4.2);rect(173,-120,3.4,0.23);
  world.ceilings.push({cx:173,cz:-116,ax:1,az:0,bx:0,bz:1,hx:3.4,hz:4.2,y:y+4.05});
  for(let i=0;i<11;i++){const a=i*Math.PI/10,r=.72+(i%3)*.08,x=173+Math.cos(a)*3.75,h=y+.45+Math.sin(a)*4.1;ball(r,rockMats[i%3],x,h,-111.7,root,[1.15,1,1.25]);if(i%2===0)ball(r*.8,moss,x,h+r*.8,-111.7,root,[1.1,.15,1]);}
  for(const side of [-1,1])for(let i=0;i<4;i++){ball(.8+i*.1,rockMats[i%3],173+side*(3.9+i*.6),y+.35,-112-i*1.5,root,[1.1,.7,1.4]);}
  solid(new THREE.BoxGeometry(4.2,0.65,0.15),new THREE.MeshLambertMaterial({map:signTexture('CRYSTAL MINE',768,192,[38,35,86],'#496467')}),173,y+5.1,-110.4);
  for(const z of [-118,-115,-112,-107])for(const x of [170.5,175.5])crystal(x,y+0.1,z,0.6+(z%2)*0.1);
  for(let i=0;i<5;i++){crystal(170.2,y+0.5+i*0.6,-119+i*1.4,0.55);crystal(175.8,y+0.7+i*0.55,-119+i*1.3,0.55);}
  for(let z=-119;z<=-104;z+=0.7)box(1.8,0.1,0.18,wood,173,y+0.12,z);
  for(const x of [172.4,173.6])box(0.07,0.12,15.5,stone,x,y+0.23,-111.5);
  const cart=group(176.6,y,-108);box(1.45,0.7,1.6,wood,0,0.8,0,cart);box(1.6,0.1,1.75,cream,0,1.16,0,cart);
  for(const sx of [-1,1])for(const sz of [-1,1])solid(new THREE.CylinderGeometry(0.25,0.25,0.1,12),stone,sx*0.78,0.3,sz*0.55,cart,[0,0,Math.PI/2]);
  for(let i=0;i<6;i++)crystal(176.25+(i%2)*0.7,y+1.2,-108.5+Math.floor(i/2)*0.45,0.45);
  rect(176.6,-108,0.85,0.95);
  function lamp(x,z){const h=terrainHeight(x,z);box(0.12,2.4,0.12,wood,x,h+1.2,z);box(0.28,0.4,0.28,world.mat.lantern,x,h+2.2,z);const sp=new THREE.Sprite(world.haloMat);sp.position.set(x,h+2.2,z);sp.scale.setScalar(2);root.add(sp);world.colliders.circles.push({x,z,r:0.15});}
  for(const [x,z]of [[169,-111],[177,-111],[171,-118],[175,-118],[186,-109],[194,-122],[196,-137],[207,-141]])lamp(x,z);
  const path=world._ribbon([[173,-104],[184,-108],[192,-118],[195,-132],[202,-141]],2.6,world._pathMaterial(),{step:1});root.attach(path);
  const fence=world._fence([[186,-107],[195,-117],[199,-130],[211,-137],[212,-149],[205,-155]],true);root.attach(fence);
  for(const [x,z]of [[184,-111],[193,-120],[194,-133],[207,-149],[196,-150]]){crystal(x,terrainHeight(x,z),z,0.8);world.colliders.circles.push({x,z,r:0.65});}
  box(10,0.18,8,wood,202,top.y+0.06,-145);
  const bench=group(206,top.y+0.15,-144);box(1.8,0.1,0.5,wood,0,0.45,0,bench);box(1.8,0.35,0.1,wood,0,0.8,-0.2,bench);
  for(const x of [-0.7,0.7])box(0.12,0.45,0.45,wood,x,0.22,0,bench);
  for(const dx of [-0.4,0.4])world.benches.push({x:206+dx,y:top.y+0.65,z:-144,yaw:0,who:null});
  const balloon=group(202,top.y+4.5,-145);
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
  for(const [x,z]of [[198,-149],[206,-149],[198,-141]]){box(0.08,2.1,0.08,wood,x,top.y+1.1,z);const g=group(x,top.y+1.9,z);solid(new THREE.PlaneGeometry(0.8,0.45),crystalMats[flags.length%4],0.4,0,0,g);flags.push(g);}
  const positions=new Float32Array(90*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));const sparkles=new THREE.Points(geo,new THREE.PointsMaterial({color:'#f6e5f5',size:0.1,transparent:true,opacity:0.7,depthWrite:false,blending:THREE.AdditiveBlending}));sparkles.frustumCulled=false;root.add(sparkles);
  for(const {parent,m,geos}of buckets.values()){const mesh=new THREE.Mesh(mergeGeometries(geos),m);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);for(const g of geos)g.dispose();}root.updateMatrixWorld(true);
  world.balloonRide={balloon,top};
  return {root,pad,top,balloon,crystalMats,clusters,sparkles,ropes,update(t,atmos){
    const night=Math.max(atmos.stars,world.lanternLevel),wind=Math.min(1.5,Math.abs(world.wind??1));
    crystalMats.forEach((m,i)=>m.emissiveIntensity=0.22+night*0.2+Math.sin(t*0.35+i)*0.025);
    glowMats.forEach((m,i)=>m.opacity=0.12+night*0.08+Math.sin(t*0.6+i)*0.015);
    const ride=balloonRideState();
    balloon.position.set(202+Math.sin(t*0.19)*0.25*wind,top.y+4.5+Math.sin(t*0.35)*0.25,-145+Math.cos(t*0.17)*0.2*wind);balloon.rotation.z=Math.sin(t*0.2)*0.025*wind;
    if(ride){balloon.position.copy(sampleBalloonRide(ride.t));balloon.rotation.z=0;}
    const burn=Math.pow(0.5+0.5*Math.sin(t*0.28),8);burner.scale.setScalar(0.6+burn*0.8);balloonMats.forEach(m=>m.emissiveIntensity=0.06+night*0.12+burn*0.07);
    balloon.updateMatrixWorld(true);ropes.forEach(({line,start,sx,sz})=>{line.visible=!ride;const end=balloon.localToWorld(v(sx*0.85,0.15,sz*0.7)),p=line.geometry.attributes.position;p.setXYZ(0,start.x,start.y,start.z);p.setXYZ(1,end.x,end.y,end.z);p.needsUpdate=true;line.geometry.computeBoundingSphere();});
    flags.forEach((g,i)=>g.rotation.y=Math.sin(t*0.9+i)*0.13*wind);
    for(let i=0;i<90;i++){const hill=i>55,phase=(t*0.045+i/90)%1;positions[i*3]=(hill?202:173)+Math.sin(i*2.399+t*0.1)*(hill?6:3.2);positions[i*3+1]=(hill?top.y:y)+0.4+phase*(hill?5:3.3);positions[i*3+2]=(hill?-145:-114)+Math.cos(i*2.399+t*0.09)*(hill?5:6);}geo.attributes.position.needsUpdate=true;
  }};
}
