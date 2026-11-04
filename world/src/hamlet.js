import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
// Built-in scenery uses the same specs as user builds; add catalogue types without another builder.
export const HAMLET = {
  x: -116, z: 65,
  pond: { x: -69, z: 94, rx: 8.5, rz: 6.5 },
  buildings: [
    { type: 'chapel', x: -153, z: 65, yaw: Math.PI / 2, w: 10 },
    { type: 'house', x: -134, z: 77, yaw: Math.PI, w: 8, wall: [95, 25, 60] },
    { type: 'house', x: -113, z: 79, yaw: Math.PI, w: 8, wall: [205, 30, 62] },
    { type: 'house', x: -91, z: 79, yaw: Math.PI, w: 8, wall: [38, 30, 76] },
    { type: 'house', x: -132, z: 53, w: 8, wall: [15, 30, 60] },
    { type: 'shop', x: -110, z: 51, w: 12, sign: 'WILLOW CREEK STORE' },
    { type: 'barn', x: -86, z: 51, w: 12, sign: 'WILLOW CREEK FARM' },
  ],
  road: [[0, 65], [-24, 62], [-48, 64], [-72, 67], [-98, 67], [-122, 65], [-144, 65]],
  benches: [[-142, 60, Math.PI / 2], [-101, 73, Math.PI]],
};

// Shared small domestic details keep all three settlements consistent.
export function buildVillageDetails(world,parent,heightAt,{gardens=[],mailboxes=[],windows=[],paths=[],well=null,hamlet=false}={}) {
  const root=new THREE.Group();root.name='Gardens and village belongings';parent.add(root);
  const wood=world.mat.darkWood,stone=world.mat.stone,green=new THREE.MeshLambertMaterial({color:'#78956d'}),soil=new THREE.MeshLambertMaterial({color:'#806951'});
  const cream=new THREE.MeshLambertMaterial({color:'#f1dbb5'}),colors=['#e6b3c8','#a9c8d9','#edcf8e','#b8cfa3'],buckets=new Map(),laundry=[],plants=[];
  const cloth=colors.map(color=>new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide}));
  function add(geometry,material,x,y,z,parent=root){geometry.translate(x,y,z);const key=parent.uuid+material.uuid;if(!buckets.has(key))buckets.set(key,{parent,material,geos:[]});buckets.get(key).geos.push(geometry.index?geometry.toNonIndexed():geometry);}
  const box=(w,h,d,mat,x,y,z,parent=root)=>add(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent);
  const group=(x,z)=>{const g=new THREE.Group();g.position.set(x,heightAt(x,z),z);root.add(g);return g;};
  function obstacle(object,x,z,r,type){const collider={x,z,r};world.colliders.circles.push(collider);if(hamlet)world.hamlet.props.push({obj:object,collider,type,light:null});}
  for(const [x,z]of gardens){
    const g=group(x,z);g.name='Kitchen garden';box(5.8,0.08,3.6,soil,0,0.05,0,g);
    for(const side of [-1,1]){for(let i=0;i<6;i++)box(0.1,0.7,0.1,cream,-2.8+i*1.12,0.38,side*1.8,g);for(const h of [0.28,0.55])box(5.6,0.08,0.07,cream,0,h,side*1.8,g);for(const h of [0.28,0.55])box(0.07,0.08,3.6,cream,side*2.8,h,0,g);}
    for(let row=0;row<3;row++)for(let col=0;col<6;col++){const px=x-2.2+col*0.88,pz=z-1.15+row*1.1,y=heightAt(x,z);plants.push([px,y+0.24,pz,0.24,0.19,0.24,row===0?'#d39760':row===1?'#8ba56c':'#b08aab']);plants.push([px,y+0.43,pz,0.27,0.10,0.24,'#6f985e']);}
    obstacle(g,x,z,3.2,'garden');
    for(const sx of [-1,1])box(0.1,2.2,0.1,wood,sx*2.7,1.1,3,g);
    box(5.4,0.025,0.025,cream,0,2.13,3,g);
    for(let i=0;i<6;i++){const item=new THREE.Mesh(new THREE.PlaneGeometry(0.55,0.72),cloth[i%4]);item.geometry.translate(0,-0.36,0);item.position.set(-2.15+i*0.86,2.08,3);g.add(item);laundry.push(item);}
    for(let row=0;row<3;row++)for(let i=0;i<3-row;i++){const geo=new THREE.CylinderGeometry(0.14,0.14,1.5,10);geo.rotateZ(Math.PI/2);add(geo,wood,-3.8,0.16+row*0.24,-0.5+i*0.3,g);}
    for(const [kind,dx,dz]of [['crate',3.7,0.6],['barrel',3.9,-0.8]]){const prop=world.makeProp(kind);prop.position.set(x+dx,heightAt(x+dx,z+dz),z+dz);root.add(prop);obstacle(prop,x+dx,z+dz,0.5,kind);}
  }
  for(const [x,z]of mailboxes){const g=group(x,z);box(0.09,1,0.09,wood,0,0.5,0,g);box(0.5,0.35,0.38,green,0,1.1,0,g);box(0.42,0.23,0.02,cream,0,1.1,0.205,g);box(0.04,0.25,0.04,cloth[0],0.3,1.26,0,g);}
  for(const {object,width=1.6}of windows){const g=new THREE.Group();object.add(g);g.position.set(-width*0.95,1.15,0.35);box(width,0.23,0.4,green,0,0,0,g);for(let i=0;i<5;i++){const flower=new THREE.Mesh(new THREE.SphereGeometry(0.13,8,6),cloth[i%4]);flower.position.set(-width*0.4+i*width*0.2,0.22,0);g.add(flower);}}
  if(well){const [x,z]=well,g=group(x,z);g.name='Covered water well';add(new THREE.CylinderGeometry(0.85,0.95,0.85,16),stone,0,0.43,0,g);box(1.65,0.07,1.4,green,0,0.88,0,g);for(const sx of [-1,1])box(0.12,2.3,0.12,wood,sx*0.8,1.15,0,g);box(2.1,0.2,1.8,wood,0,2.3,0,g);obstacle(g,x,z,1.1,'well');}
  for(const points of paths){const path=world._ribbon(points,1.15,world._pathMaterial(),{lift:0.075,step:1});root.attach(path);}
  const heads=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshLambertMaterial({color:0xffffff}),plants.length),matrix=new THREE.Matrix4();
  plants.forEach(([x,y,z,sx,sy,sz,color],i)=>{heads.setMatrixAt(i,matrix.makeScale(sx,sy,sz).setPosition(x,y,z));heads.setColorAt(i,new THREE.Color(color));});heads.castShadow=heads.receiveShadow=true;heads.computeBoundingSphere();root.add(heads);
  for(const {parent,material,geos}of buckets.values()){const mesh=new THREE.Mesh(mergeGeometries(geos),material);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);for(const geometry of geos)geometry.dispose();}
  return {root,laundry,update(t){root.visible=!hamlet||world.hamlet.visible;laundry.forEach((item,i)=>{item.rotation.x=Math.sin(t*0.8+i*0.7)*0.16*(world.wind??1);item.rotation.z=Math.sin(t*0.55+i)*0.045*(world.wind??1);});}};
}
