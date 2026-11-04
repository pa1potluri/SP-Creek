import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { imageTexture } from '../textures.js';
import { terrainHeight } from '../world.js';

export function dressHamletHouse(world, entry) {
  const g=entry.obj,w=entry.spec.w,cream=new THREE.MeshLambertMaterial({color:'#e4dbc4'}),shutter=new THREE.MeshLambertMaterial({color:'#8eaaa2'}),green=new THREE.MeshLambertMaterial({color:'#6c9666'});
  const flowerMats=['#e6adc6','#f0d690','#c1b4d9'].map(color=>new THREE.MeshLambertMaterial({color}));
  const pieces=new Map();
  function add(geo,mat,x,y,z,parent=g){geo.translate(x,y,z);const key=parent.uuid+mat.uuid;if(!pieces.has(key))pieces.set(key,{parent,mat,geos:[]});pieces.get(key).geos.push(geo.index?geo.toNonIndexed():geo);}
  const box=(a,b,c,mat,x,y,z,parent)=>add(new THREE.BoxGeometry(a,b,c),mat,x,y,z,parent);
  const sets={};for(const set of ['oil','clean']){const img=world.painted[set].window;if(img){const tex=imageTexture(img);sets[set]={map:tex,emissive:tex};}}
  const first=sets.oil||sets.clean;
  const windowMat=new THREE.MeshLambertMaterial({map:first?.map,emissiveMap:first?.emissive,color:'#f3edda',emissive:'#ffe5ac',emissiveIntensity:0.4,side:THREE.DoubleSide});windowMat.userData.sets=sets;
  world.surfaces.add(windowMat);world.windowMats.push(windowMat);entry.additions.windowMats.push(windowMat);
  const doorMat=world.paintedMaterial('door',1,1,{side:THREE.DoubleSide})||cream;
  function face(x,z,yaw,door=false){const parent=new THREE.Group();parent.position.set(x,0,z);parent.rotation.y=yaw;g.add(parent);
    if(door){box(1.15,2.25,0.06,doorMat,0,1.45,0,parent);return;}
    box(1.35,1.55,0.08,cream,0,2.3,0,parent);box(1.18,1.38,0.08,windowMat,0,2.3,0.05,parent);
    for(const sx of [-1,1]){box(0.35,1.6,0.12,shutter,sx*0.88,2.3,0.02,parent);for(let i=0;i<4;i++)box(0.36,0.035,0.04,cream,sx*0.88,1.78+i*0.31,0.1,parent);}
    box(1.7,0.26,0.48,shutter,0,1.35,0.25,parent);
    for(let i=0;i<7;i++){const fx=-0.67+i*0.22;add(new THREE.SphereGeometry(0.16,8,6).scale(1,0.6,1),green,fx,1.56,0.25,parent);for(let j=0;j<5;j++)add(new THREE.SphereGeometry(0.07,6,4),flowerMats[i%3],fx+Math.cos(j*1.257)*0.08,1.73,0.25+Math.sin(j*1.257)*0.08,parent);}
  }
  for(const x of [-w*0.28,w*0.28])face(x,-12.19,Math.PI);
  face(0,-12.2,Math.PI,true);
  for(const side of [-1,1])for(const z of [-4.3,-8.9])face(side*(w/2-0.13),z,side*Math.PI/2);
  for(const {parent,mat,geos}of pieces.values()){const mesh=new THREE.Mesh(mergeGeometries(geos),mat);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);for(const geo of geos)geo.dispose();}
}

export function dressPondShore(world, parent, p, y) {
  const pos=[],colors=[],indices=[],radii=Array.from({length:37},(_,i)=>.98+i*.01),n=192;
  // Match the half-metre bank triangles; broad annular faces cut through the slope.
  const bankY=(x,z)=>{const gx=(x-p.x+22)*2,gz=(z-p.z+19)*2,ix=Math.floor(gx),iz=Math.floor(gz),u=gx-ix,v=gz-iz,bx=p.x-22+ix*.5,bz=p.z-19+iz*.5,a=terrainHeight(bx,bz),b=terrainHeight(bx+.5,bz),c=terrainHeight(bx,bz+.5),d=terrainHeight(bx+.5,bz+.5);return (u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v))+.05;};
  for(let j=0;j<radii.length;j++)for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,f=1+0.06*Math.sin(a*3+0.5)+0.035*Math.cos(a*5),x=Math.cos(a)*p.rx*f*radii[j],z=Math.sin(a)*p.rz*f*radii[j],blend=Math.sin(j/(radii.length-1)*Math.PI)**2;pos.push(x,bankY(p.x+x,p.z+z)-y,z);colors.push(.85,.81,.7,blend*.65);if(j&&i){const k=j*(n+1)+i;indices.push(k-1,k-n-2,k,k-n-2,k-n-1,k);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));geo.setIndex(indices);geo.computeVertexNormals();
  const rim=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:'#cfbf9c',vertexColors:true,transparent:true,depthWrite:false,side:THREE.DoubleSide}));rim.receiveShadow=true;parent.add(rim);
  const pebbles=[];for(let i=0;i<24;i++){const a=i*2.399,r=1.16+(Math.sin(i*5.3)*0.5+0.5)*0.17,f=1+0.06*Math.sin(a*3+0.5)+0.035*Math.cos(a*5),x=Math.cos(a)*p.rx*f*r,z=Math.sin(a)*p.rz*f*r;const g=new THREE.IcosahedronGeometry(0.09+(i%4)*0.035,1);g.scale(1.3,0.6,1);g.translate(x,terrainHeight(p.x+x,p.z+z)-y+0.06,z);pebbles.push(g);}
  parent.add(new THREE.Mesh(mergeGeometries(pebbles),new THREE.MeshLambertMaterial({color:'#b5b6a7'})));
  const fp=[],fc=[],fi=[];for(let j=0;j<3;j++)for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,r=[0.92,0.97,1.005][j],f=1+0.06*Math.sin(a*3+0.5)+0.035*Math.cos(a*5);fp.push(Math.cos(a)*p.rx*f*r,0.018,Math.sin(a)*p.rz*f*r);fc.push(1,1,1,j===1?(0.15+Math.sin(a*11)*0.1):0);if(j&&i){const k=j*(n+1)+i;fi.push(k-1,k-n-2,k,k-n-2,k-n-1,k);}}
  const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(fp,3));fg.setAttribute('color',new THREE.Float32BufferAttribute(fc,4));fg.setIndex(fi);fg.computeVertexNormals();
  const foam=new THREE.Mesh(fg,new THREE.MeshLambertMaterial({color:'#eff4df',vertexColors:true,transparent:true,depthWrite:false,side:THREE.DoubleSide}));foam.renderOrder=3;foam.onBeforeRender=()=>foam.material.color.copy(world.waterUniforms.uWaterFoamColor.value);parent.add(foam);
  return {rim,foam};
}
