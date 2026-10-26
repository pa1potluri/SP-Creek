import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const templates=new Map(),material=new THREE.MeshLambertMaterial({vertexColors:true});
function rgb(bytes){return new THREE.Color().setRGB(...bytes.map(v=>v/255),THREE.SRGBColorSpace);}
function section(p,y){const t=THREE.MathUtils.clamp(y/(p.faceHeight/2),-.99999,.99999),lower=Math.max(0,-t);return{rx:p.faceWidth/2*Math.sqrt(1-t*t)*(1-(1-p.jawWidth)*lower**1.8),front:p.headDepth/2*Math.pow(Math.max(0,1-Math.abs(t)**(p.faceRoundness||2)),1/(p.faceRoundness||2)),back:p.headDepth/2*Math.sqrt(1-t*t),center:(p.chinForward||0)*lower**1.5};}
function faceZ(p,x,y){const s=section(p,y);return s.center+s.front*Math.sqrt(Math.max(0,1-(x/s.rx)**2));}

// Closed, intentionally simple volumes. No point samples or cutout transparency.
export function makeSolidResident(profile){
 if(templates.has(profile.id))return templates.get(profile.id).clone(true);
 const p=profile.parameters,pal=profile.palette,root=new THREE.Group(),buckets=new Map();
 root.name='Solid pedestrian '+profile.id;root.userData={profile:profile.id,representation:'solid-pedestrian'};
 const skin=rgb(pal.skin),hair=rgb(pal.hair),iris=rgb(pal.iris),ear=rgb(pal.ear);
 function add(geo,color,position=[0,0,0],scale=[1,1,1],rotation=[0,0,0]){
  geo.scale(...scale);geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rotation)));geo.translate(...position);
  const key=color.getHexString();if(!buckets.has(key))buckets.set(key,{color,geometries:[]});buckets.get(key).geometries.push(geo.index?geo.toNonIndexed():geo);if(geo.index)geo.dispose();
 }
 const sphere=(color,position,scale)=>add(new THREE.SphereGeometry(1,12,8),color,position,scale);
 const head=new THREE.SphereGeometry(1,24,18),vertices=head.attributes.position;
 for(let i=0;i<vertices.count;i++){
  const y=vertices.getY(i)*p.faceHeight/2;
  if(Math.abs(y)>=p.faceHeight/2-.00001){vertices.setXYZ(i,0,y,y<0?(p.chinForward||0):0);continue;}
  const a=Math.atan2(vertices.getX(i),vertices.getZ(i)),s=section(p,y),front=Math.cos(a),x=s.rx*Math.sin(a);
  const cheek=front>0?(p.cheekFullness||0)*Math.exp(-((Math.abs(x)-29)**2/190+(y+12)**2/180))*front:0;
  vertices.setXYZ(i,x,y,s.center+(front>=0?s.front:s.back)*front+cheek);
 }
 head.computeVertexNormals();add(head,skin);
 add(new THREE.CylinderGeometry(12,14,24,16),skin,[0,-47,0]);
 for(const side of [-1,1]){
  sphere(skin,[side*p.earOffset,p.earY,p.earZ],[p.earWidth/2,p.earHeight/2,p.earDepth/2]);
  sphere(ear,[side*p.earOffset,p.earY,p.earZ+p.earDepth*.38],[p.earWidth*.3,p.earHeight*.32,p.earDepth*.18]);
  const x=side*p.eyeSpacing/2,y=p.eyeY,z=faceZ(p,x,y),r=Math.min(p.irisSize,p.eyeHeight*.35);
  sphere(new THREE.Color('#fff9eb'),[x,y,z+1.2],[p.eyeWidth/2,p.eyeHeight/2,3.8]);
  sphere(iris,[x,y,z+4.7],[r,r,1]);sphere(new THREE.Color('#2e251f'),[x,y,z+5.45],[r*.5,r*.6,.65]);
  sphere(new THREE.Color('#ffffff'),[x-r*.25,y+r*.25,z+6.1],[r*.18,r*.18,.3]);
  const brow=[];for(let j=0;j<=8;j++){const t=j/8,bx=x+(t-.5)*p.eyeWidth,by=(p.browY||21)+(p.browArch||5)*Math.sin(t*Math.PI)*.45;brow.push(new THREE.Vector3(bx,by,faceZ(p,bx,by)+1.2));}
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(brow),12,1,5,false),hair);
 }
 sphere(skin,[0,p.noseY,faceZ(p,0,p.noseY)+p.noseDepth*.2],[p.noseWidth/2,p.noseHeight/2,p.noseDepth]);
 const smile=[];for(let i=0;i<=12;i++){const x=(i/12-.5)*p.mouthWidth,y=p.mouthY+(p.mouthSmile||3)*(x/(p.mouthWidth/2))**2;smile.push(new THREE.Vector3(x,y,faceZ(p,x,y)+1.2));}
 add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(smile),16,.65,5,false),new THREE.Color('#85503b'));

 const hx=(p.hairWidth||p.faceWidth*1.3)*.45,hy=(p.hairHeight||115)*(profile.hairStyle==='curly'?.43:.36),hz=(p.hairDepth||p.headDepth*1.4)*.45,cy=p.faceHeight*.36,cz=-14;
 add(new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2),hair,[0,cy,cz],[hx,hy,hz]);
 // Seal the cap's open equator; all other primitives are closed spheres/cylinders.
 add(new THREE.CircleGeometry(1,20),hair,[0,cy,cz],[hx,hz,1],[Math.PI/2,0,0]);
 const length=p.hairLength||0;
 sphere(hair,[0,length?-length*.65:12,-29],[p.faceWidth*.46,length?length+16:p.faceHeight*.34,p.headDepth*.24]);
 for(const side of [-1,1])sphere(hair,[side*p.faceWidth*.43,22,-16],[p.faceWidth*.14,18,p.headDepth*.27]);
 const all=[];
 for(const {color,geometries}of buckets.values())for(const geometry of geometries){
  const count=geometry.attributes.position.count,colors=new Float32Array(count*3);
  for(let i=0;i<count;i++)color.toArray(colors,i*3);
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));all.push(geometry);
 }
 const mesh=new THREE.Mesh(mergeGeometries(all),material);mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);for(const g of all)g.dispose();
 root.scale.setScalar(.0042);root.position.y=.25;templates.set(profile.id,root);return root.clone(true);
}
