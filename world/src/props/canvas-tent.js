import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const templates=new Map();
function canvasMap(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),p=x.createImageData(128,128);for(let y=0;y<128;y++)for(let i=0;i<128;i++){const k=(y*128+i)*4,v=235+8*Math.sin(i*Math.PI/2)*Math.sin(y*Math.PI/2)+4*Math.sin(i*.31+y*.49);p.data[k]=p.data[k+1]=p.data[k+2]=v;p.data[k+3]=255;}x.putImageData(p,0,0);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
let weave;
export function makeCanvasTent(variant=0){
 if(templates.has(variant))return templates.get(variant).clone(true);
 weave??=canvasMap();const root=new THREE.Group();root.name='Framed canvas tent';root.userData.canvasTent=true;
 const material=(color,map=null)=>new THREE.MeshLambertMaterial({color,map,side:THREE.DoubleSide});
 const cloth=material(variant?'#ddceb0':'#e4d8bc',weave),fly=material(variant?'#ac7958':'#bc936b',weave),wood=material('#9d7955'),rope=material('#d0ba8c'),bed=material(variant?'#91a9ae':'#9dab8d',weave),stone=material('#b4b2a1');
 const buckets=new Map(),v=(x,y,z)=>new THREE.Vector3(x,y,z);
 const add=(g,m)=>{const a=g.index?g.toNonIndexed():g;if(a!==g)g.dispose();if(!buckets.has(m))buckets.set(m,[]);buckets.get(m).push(a);};
 const beam=(a,b,r,m)=>{const d=a.distanceTo(b),g=new THREE.CapsuleGeometry(r,Math.max(.001,d-r*2),3,6);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(v(0,1,0),b.clone().sub(a).normalize()));g.translate(...a.clone().add(b).multiplyScalar(.5).toArray());add(g,m);};
 const cord=(points,r=.014,m=rope)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),16,r,5,false),m);
 const panel=(fn,m,nu=12,nv=20)=>{const pos=[],uv=[],idx=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){pos.push(...fn(i/nu,j/nv).toArray());uv.push(i/nu*2,j/nv*3);}for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;idx.push(a,b,a+1,b,b+1,a+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();add(g,m);};
 const roof=(side,u,t,lift=0)=>v(side*(1.45*u+.035*Math.sin(t*Math.PI*4)*Math.sin(u*Math.PI)),.13+2.12*(1-u)-.18*Math.sin(u*Math.PI)*Math.sin(t*Math.PI)+lift, (t-.5)*3.5);
 for(const side of [-1,1]){
  panel((u,t)=>roof(side,u,t),cloth);
  panel((u,t)=>{const p=roof(side,u*.85,t,.045);p.z*=1.035;return p;},fly);
  for(const t of [0,.33,.66,1])cord(Array.from({length:13},(_,i)=>roof(side,i/12,t,.06)),.012);
  // Pulled-aside door curtains leave a real opening, not a bright triangle painted on a wedge.
  panel((u,t)=>{const h=t*2.1,outer=1.45*(1-t),inner=.65*(1-t)+.19*Math.sin(t*Math.PI);return v(side*THREE.MathUtils.lerp(inner,outer,u),.13+h,1.76+.18*Math.sin(t*Math.PI)*(1-u));},cloth,6,12);
  for(const z of [-1.65,1.65]){const top=v(side*.1,2.35,z),foot=v(side*.72,.08,z+.08);beam(foot,top,.06,wood);const tie=v(side*1.02,.85,z);cord([tie,v(side*1.06,.79,z+.1),v(side*1.01,.76,z+.07)],.019);}
  for(const z of [-1.6,1.6]){const start=roof(side,.82,(z/3.5)+.5,.06),end=v(side*2.12,.13,z*1.25);cord([start,start.clone().lerp(end,.5).add(v(0,-.10,0)),end]);beam(end.clone().add(v(.03,-.05,0)),end.clone().add(v(-.03,.28,0)),.045,wood);const anchor=new THREE.SphereGeometry(.15,8,6).scale(1,.55,.85).translate(end.x,.06,end.z);add(anchor,stone);}
 }
 // The closed rear wall and low bedroll are visible through the open front.
 panel((u,t)=>v((u*2-1)*1.43*(1-t),.13+t*2.1,-1.74),cloth,10,10);
 beam(v(0,2.35,-1.9),v(0,2.35,1.9),.065,wood);
 for(const z of [-1.75,1.75])cord([v(-.22,2.3,z),v(0,2.24,z+.07),v(.22,2.3,z)],.024);
 add(new THREE.BoxGeometry(2.5,.08,3.1).translate(0,.08,-.05),bed);
 add(new THREE.CapsuleGeometry(.17,1.9,4,10).rotateZ(Math.PI/2).translate(0,.27,-1.18),cloth);
 for(const [m,geos]of buckets){const g=mergeGeometries(geos);for(const part of geos)part.dispose();const mesh=new THREE.Mesh(g,m);mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);}
 root.userData={canvasTent:true,variant,openFront:true,hasPoles:true,hasGuyRopes:true};templates.set(variant,root);return root.clone(true);
}
