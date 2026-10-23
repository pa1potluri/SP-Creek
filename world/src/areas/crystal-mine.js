import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { terrainHeight } from '../world.js';
import { signTexture } from '../textures.js';

export const CRYSTAL_HILL={x:173,z:-115,topX:202,topZ:-145};
export function buildCrystalMine(world) {
  const root=new THREE.Group();root.name='Crystal hill';world.root.add(root);
  const y=terrainHeight(173,-115),top=world.registerAreaPad({x:202,z:-145,y:y+12,hx:10,hz:10,blend:16});
  const pad=world.registerAreaPad({x:173,z:-115,y,hx:9,hz:10,blend:9});world.updateTerrain();
  const v=(x,h,z)=>new THREE.Vector3(x,h,z),mat=(color,glow=0)=>new THREE.MeshLambertMaterial({color,emissive:color,emissiveIntensity:glow});
  const wood=mat('#ae9070'),stone=mat('#b9c7c3',0.2),cream=mat('#fff0d4'),moss=mat('#91ae80');
  const colors=['#edb5d5','#a6dce9','#c5b8e9','#b5e3cf'];const crystalMats=colors.map(c=>mat(c,0.55));
  const buckets=new Map(),clusters=[],balloonMats=[],flags=[];
  function solid(geo,m,x,h,z,parent=root,rot=null){if(rot)geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rot)));geo.translate(x,h,z);const key=parent.uuid+m.uuid;if(!buckets.has(key))buckets.set(key,{parent,m,geos:[]});buckets.get(key).geos.push(geo.index?geo.toNonIndexed():geo);}
  const box=(w,h,d,m,x,py,z,g=root)=>solid(new THREE.BoxGeometry(w,h,d),m,x,py,z,g);
  const ball=(r,m,x,h,z,g=root,s=[1,1,1])=>solid(new THREE.SphereGeometry(r,12,8).scale(...s),m,x,h,z,g);
  function group(x,h,z,parent=root){const g=new THREE.Group();g.position.set(x,h,z);parent.add(g);return g;}
  function rect(cx,cz,hx,hz){world.colliders.rects.push({cx,cz,ax:1,az:0,bx:0,bz:1,hx,hz});}
  function crystal(x,h,z,scale=1){for(let i=0;i<4;i++){const a=i*2.4;solid(new THREE.CylinderGeometry(0.15*scale,0.25*scale,(0.6+i*0.2)*scale,6),crystalMats[i],x+Math.cos(a)*0.28*scale,h+(0.3+i*0.1)*scale,z+Math.sin(a)*0.28*scale,root,[0.08*Math.sin(a),0,0.12*Math.cos(a)]);}clusters.push([x,z]);}
  // A short, closed room built above the terrain, with softly lit walls and a level floor.
  box(6.6,0.12,8.3,stone,173,y+0.03,-116);
  box(0.45,4.2,8.3,stone,169.8,y+2.1,-116);box(0.45,4.2,8.3,stone,176.2,y+2.1,-116);
  box(6.8,4.2,0.45,stone,173,y+2.1,-120);box(6.9,0.45,8.6,stone,173,y+4.3,-116);
  rect(169.8,-116,0.23,4.2);rect(176.2,-116,0.23,4.2);rect(173,-120,3.4,0.23);
  world.ceilings.push({cx:173,cz:-116,ax:1,az:0,bx:0,bz:1,hx:3.4,hz:4.2,y:y+4.05});
  for(const x of [169.8,176.2])box(0.38,4.4,0.4,wood,x,y+2.2,-111.7);
  box(7.2,0.4,0.5,wood,173,y+4.4,-111.7);
  for(let i=0;i<7;i++){
    const a=i*Math.PI/6;ball(1.6,stone,173+Math.cos(a)*4.1,y+0.8+Math.sin(a)*4.5,-116,root,[1.1,1,2]);
  }
  solid(new THREE.BoxGeometry(5,0.9,0.15),new THREE.MeshLambertMaterial({map:signTexture('CRYSTAL MINE',768,192,[170,18,82],'#496467')}),173,y+5,-111.3);
  for(const z of [-118,-115,-112,-107])for(const x of [170.5,175.5])crystal(x,y+0.1,z,0.6+(z%2)*0.1);
  for(let i=0;i<5;i++){crystal(170.2,y+0.5+i*0.6,-119+i*1.4,0.55);crystal(175.8,y+0.7+i*0.55,-119+i*1.3,0.55);}
  for(let z=-119;z<=-104;z+=0.7)box(1.8,0.1,0.18,wood,173,y+0.12,z);
  for(const x of [172.4,173.6])box(0.07,0.12,15.5,stone,x,y+0.23,-111.5);
  const cart=group(173,y,-108);box(1.45,0.7,1.6,wood,0,0.8,0,cart);box(1.6,0.1,1.75,cream,0,1.16,0,cart);
  for(const sx of [-1,1])for(const sz of [-1,1])solid(new THREE.CylinderGeometry(0.25,0.25,0.1,12),stone,sx*0.78,0.3,sz*0.55,cart,[0,0,Math.PI/2]);
  for(let i=0;i<6;i++)crystal(172.65+(i%2)*0.7,y+1.2,-108.5+Math.floor(i/2)*0.45,0.45);
  rect(173,-108,0.85,0.95);
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
  box(1.9,1.25,1.6,wood,0,0.65,0,balloon);
  for(let i=0;i<7;i++)box(1.98,0.05,1.68,cream,0,0.12+i*0.18,0,balloon);
  const stripes=['#efbac6','#eed39b','#b9d9b1','#a8d9df','#b9c5e5','#d3b7dc','#f0c6b1','#b2d9cf'];
  stripes.forEach((c,i)=>{const bm=mat(c,0.08);balloonMats.push(bm);solid(new THREE.SphereGeometry(4,6,20,i*Math.PI/4,Math.PI/4).scale(1,1.35,1),bm,0,8,0,balloon);});
  for(const sx of [-1,1])for(const sz of [-1,1])solid(new THREE.CylinderGeometry(0.025,0.025,3.5,6),cream,sx*0.8,2.7,sz*0.65,balloon);
  const burner=new THREE.Mesh(new THREE.SphereGeometry(0.25,12,8),new THREE.MeshBasicMaterial({color:'#ffe3a6'}));burner.position.y=2.1;balloon.add(burner);
  const ropes=[];for(const sx of [-1,1])for(const sz of [-1,1]){const start=v(202+sx*4,top.y+0.6,-145+sz*3),geo=new THREE.BufferGeometry().setFromPoints([start,start.clone()]);const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:'#b19c7d'}));root.add(line);box(0.14,1,0.14,wood,start.x,top.y+0.5,start.z);ropes.push({line,start,sx,sz});}
  for(const [x,z]of [[198,-149],[206,-149],[198,-141]]){box(0.08,2.1,0.08,wood,x,top.y+1.1,z);const g=group(x,top.y+1.9,z);solid(new THREE.PlaneGeometry(0.8,0.45),crystalMats[flags.length%4],0.4,0,0,g);flags.push(g);}
  const positions=new Float32Array(90*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));const sparkles=new THREE.Points(geo,new THREE.PointsMaterial({color:'#f6e5f5',size:0.1,transparent:true,opacity:0.7,depthWrite:false,blending:THREE.AdditiveBlending}));sparkles.frustumCulled=false;root.add(sparkles);
  for(const {parent,m,geos}of buckets.values()){const mesh=new THREE.Mesh(mergeGeometries(geos),m);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);for(const g of geos)g.dispose();}root.updateMatrixWorld(true);
  return {root,pad,top,balloon,crystalMats,clusters,sparkles,ropes,update(t,atmos){
    const night=Math.max(atmos.stars,world.lanternLevel),wind=Math.min(1.5,Math.abs(world.wind??1));
    crystalMats.forEach((m,i)=>m.emissiveIntensity=0.45+night*0.35+Math.sin(t*0.6+i)*0.08);
    balloon.position.set(202+Math.sin(t*0.19)*0.25*wind,top.y+4.5+Math.sin(t*0.35)*0.25,-145+Math.cos(t*0.17)*0.2*wind);balloon.rotation.z=Math.sin(t*0.2)*0.025*wind;
    const burn=Math.pow(0.5+0.5*Math.sin(t*0.28),8);burner.scale.setScalar(0.6+burn*0.8);balloonMats.forEach(m=>m.emissiveIntensity=0.06+night*0.12+burn*0.07);
    balloon.updateMatrixWorld(true);ropes.forEach(({line,start,sx,sz})=>{const end=balloon.localToWorld(v(sx*0.85,0.15,sz*0.7)),p=line.geometry.attributes.position;p.setXYZ(0,start.x,start.y,start.z);p.setXYZ(1,end.x,end.y,end.z);p.needsUpdate=true;line.geometry.computeBoundingSphere();});
    flags.forEach((g,i)=>g.rotation.y=Math.sin(t*0.9+i)*0.13*wind);
    for(let i=0;i<90;i++){const hill=i>55,phase=(t*0.045+i/90)%1;positions[i*3]=(hill?202:173)+Math.sin(i*2.399+t*0.1)*(hill?6:3.2);positions[i*3+1]=(hill?top.y:y)+0.4+phase*(hill?5:3.3);positions[i*3+2]=(hill?-145:-114)+Math.cos(i*2.399+t*0.09)*(hill?5:6);}geo.attributes.position.needsUpdate=true;
  }};
}
