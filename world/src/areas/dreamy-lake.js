import * as THREE from 'three';
import { terrainHeight } from '../world.js';
import { LAKE } from './meadow-lake.js';

// Halos, floating lanterns and fireflies shared by the dreamy lake and the dreamy cove.
// Oil smears small glows away and the flat styles posterise them, so each style gets its own boost.
const STYLE_GLOW={oil:{halo:1.9,size:1.45,fly:2.4},flat:{halo:1.3,size:1.15,fly:1.5},clean:{halo:1,size:1,fly:1}};
export function dreamyGlow(world,root,{waterY,spots,flyArea,flyCount=70}){
 const mat=(color,glow=0)=>new THREE.MeshLambertMaterial({color,emissive:color,emissiveIntensity:glow}),paper=mat('#ffb866',0.9),base=mat('#8a5a3a'),halos=[];
 const halo=(parent,x,y,z,s,color='#ffb766')=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:world.tex.glow,color,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));sp.position.set(x,y,z);sp.scale.setScalar(s);sp.userData.size=s;parent.add(sp);halos.push(sp);return sp;};
 const piece=(g,w,h,m,y)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),m);o.position.y=y;o.castShadow=true;g.add(o);};
 const lanterns=spots.map(([x,z],i)=>{const g=new THREE.Group();root.add(g);piece(g,0.42,0.06,base,0.03);piece(g,0.32,0.4,paper,0.26);piece(g,0.36,0.05,base,0.48);
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(1.4,2.6).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:world.tex.glow,color:'#ffb766',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));glow.position.y=0.02;glow.renderOrder=3;g.add(glow);halos.push(glow);halo(g,0,0.3,0,1.6);
  return {g,x,z,i};});
 const flyPos=new Float32Array(flyCount*3),flyGeo=new THREE.BufferGeometry();flyGeo.setAttribute('position',new THREE.BufferAttribute(flyPos,3));
 const flies=new THREE.Points(flyGeo,new THREE.PointsMaterial({map:world.tex.glow,color:'#fff3b0',size:0.3,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));flies.frustumCulled=false;root.add(flies);
 return {halo,lanterns,flies,paper,update(t,night){
  const look=STYLE_GLOW[world.textureSet]||STYLE_GLOW.clean;
  paper.emissiveIntensity=0.4+night*0.8;
  for(const h of halos){h.material.opacity=Math.min(1,(0.08+night*0.42)*look.halo);if(h.isSprite)h.scale.setScalar(h.userData.size*look.size);}
  for(const {g,x,z,i} of lanterns){g.position.set(x+Math.sin(t*0.03+i)*0.6,waterY+0.03+Math.sin(t*0.8+i)*0.03,z+Math.cos(t*0.025+i*1.3)*0.5);g.rotation.set(Math.sin(t*0.7+i)*0.04,i+t*0.02,Math.cos(t*0.6+i)*0.04);}
  flies.material.opacity=night*0.9;flies.material.size=0.3*look.fly;
  const {x:fx,z:fz,rx,rz}=flyArea;
  for(let i=0;i<flyPos.length/3;i++){const a=i*2.399+t*0.01*(1+i%3),r=0.3+(i%9)/9*0.85;flyPos.set([fx+Math.cos(a)*rx*r+Math.sin(t*0.3+i)*0.4,waterY+0.6+(i%5)*0.45+Math.sin(t*0.5+i*1.7)*0.25,fz+Math.sin(a)*rz*r+Math.cos(t*0.27+i)*0.4],i*3);}
  flyGeo.attributes.position.needsUpdate=true;
 }};
}

// A cosy cottage on the west shore of the waterfall lake, seen across the water from the dock.
export const DREAMY_LAKE={x:-252,z:-5};
const DOCK_VIEW={x:-226.5,z:-18};
export function buildDreamyLake(world,lake){
 const root=new THREE.Group();root.name='Dreamy lake cottage';world.root.add(root);
 const waterY=lake.y;
 const spots=Array.from({length:9},(_,i)=>{const a=0.6+i*0.62,r=0.45+(i%3)*0.13;return [LAKE.x+Math.cos(a)*LAKE.rx*r,LAKE.z+Math.sin(a)*LAKE.rz*r];});
 const glow=dreamyGlow(world,root,{waterY,spots,flyArea:LAKE}),halo=glow.halo;
 const mat=(color,glow=0)=>new THREE.MeshLambertMaterial({color,emissive:color,emissiveIntensity:glow});
 const m={wall:mat('#c07a4c',0.04),timber:mat('#7a4a32'),stone:mat('#9aa3b8',0.04),roof:mat('#c45f3f',0.05),door:mat('#6d4230'),window:mat('#ffc56b',0.9),pink:mat('#ff9cc8',0.25),purple:mat('#b48cff',0.3),bush:mat('#3f6f5d',0.05),pad:mat('#5c9f68',0.05),gold:mat('#ffe08a',0.4),paper:glow.paper};
 const add=(parent,geo,material,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 const box=(parent,w,h,d,material,x,y,z)=>add(parent,new THREE.BoxGeometry(w,h,d),material,x,y,z);

 // Cottage: local +z faces the lake.
 const y=terrainHeight(DREAMY_LAKE.x,DREAMY_LAKE.z),yaw=Math.atan2(LAKE.x-DREAMY_LAKE.x,LAKE.z-DREAMY_LAKE.z);
 const house=new THREE.Group();house.position.set(DREAMY_LAKE.x,y,DREAMY_LAKE.z);house.rotation.y=yaw;root.add(house);
 world.registerAreaPad({...DREAMY_LAKE,hx:6,hz:6,blend:1,clearOnly:true});
 box(house,6.4,0.5,5.4,m.stone,0,0.25,0);box(house,6,3,5,m.wall,0,2,0);
 for(const sx of [-1,1])for(const sz of [-1,1])box(house,0.3,3,0.3,m.timber,sx*2.9,2,sz*2.4);
 box(house,6.1,0.25,5.1,m.timber,0,3.45,0);
 const gable=new THREE.Shape();gable.moveTo(-3,0);gable.lineTo(3,0);gable.lineTo(0,2.3);gable.lineTo(-3,0);
 add(house,new THREE.ExtrudeGeometry(gable,{depth:5,bevelEnabled:false}).translate(0,0,-2.5),m.wall,0,3.5,0);
 const pitch=Math.atan2(2.3,3);
 for(const sx of [-1,1]){const slab=box(house,4.1,0.3,5.9,m.roof,sx*1.5,4.75,0);slab.rotation.z=-sx*pitch;}
 box(house,0.8,2.6,0.8,m.stone,1.8,5.2,-1.2);
 world.emitters.push({type:'smoke',pos:house.localToWorld(new THREE.Vector3(1.8,6.7,-1.2)),rate:0.8,acc:0,life:6,s0:0.4,s1:2,alpha:0.12,rise:0.8});
 box(house,1.1,2,0.12,m.door,0,1.5,2.52);box(house,2.2,0.5,1,m.stone,0,0.25,3.1);
 for(const [x,yy,z,w,h,rot] of [[-1.7,2.1,2.52,1,1.05,0],[1.7,2.1,2.52,1,1.05,0],[0,4.4,2.52,0.8,0.8,0],[3.02,2.1,-1.1,1,1.05,Math.PI/2],[3.02,2.1,1.1,1,1.05,Math.PI/2],[-3.02,2.1,0,1,1.05,Math.PI/2]]){const win=box(house,w,h,0.08,m.window,x,yy,z);win.rotation.y=rot;box(house,w+0.2,0.12,0.14,m.timber,x,yy-h/2,z).rotation.y=rot;halo(house,x+(rot?Math.sign(x)*0.4:0),yy,z+(rot?0:0.4),2.6);}
 // Flower boxes under the front windows.
 for(const x of [-1.7,1.7]){box(house,1.2,0.3,0.35,m.timber,x,1.45,2.72);for(let i=0;i<5;i++)add(house,new THREE.IcosahedronGeometry(0.13,0),i%2?m.pink:m.purple,x-0.45+i*0.22,1.68,2.72);}
 for(const x of [-0.85,0.85]){box(house,0.22,0.3,0.22,m.paper,x,2.55,2.66);halo(house,x,2.55,2.8,1.4);}
 const cx=DREAMY_LAKE.x,cz=DREAMY_LAKE.z,c=Math.cos(yaw),s=Math.sin(yaw),corner=(lx,lz)=>({x:cx+lx*c+lz*s,z:cz-lx*s+lz*c}),pts=[corner(-3.2,-2.7),corner(3.2,-2.7),corner(3.2,2.7),corner(-3.2,2.7)];
 pts.forEach((a,i)=>{const b=pts[(i+1)%4];world.colliders.segs.push({ax:a.x,az:a.z,bx:b.x,bz:b.z});});

 // Shore bushes and purple flowers, kept off the dock and the waterfall rocks.
 const matrix=new THREE.Matrix4(),shore=[];
 for(let i=0;i<150;i++){const a=0.3+i*0.0187+Math.sin(i*7.1)*0.02,r=1.1+((i*37)%17)/17*0.22,x=LAKE.x+Math.cos(a)*LAKE.rx*r,z=LAKE.z+Math.sin(a)*LAKE.rz*r;if(Math.hypot(x-cx,z-cz)<5||Math.hypot(x-DOCK_VIEW.x,z-DOCK_VIEW.z)<10)continue;shore.push([x,z,0.7+((i*13)%7)/10]);}
 const bushes=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.55,1),m.bush,Math.ceil(shore.length/5)),flowers=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.12,0),m.purple,shore.length*3);
 shore.forEach(([x,z,k],i)=>{if(i%5===0)bushes.setMatrixAt(i/5,matrix.makeScale(k,k*0.8,k).setPosition(x,terrainHeight(x,z)+0.3*k,z));for(let j=0;j<3;j++){const ox=Math.sin(i*3+j*2.1)*0.5,oz=Math.cos(i*5+j*1.7)*0.5;flowers.setMatrixAt(i*3+j,matrix.makeScale(1,1.4,1).setPosition(x+ox,terrainHeight(x+ox,z+oz)+0.35+j*0.08,z+oz));}});
 for(const im of [bushes,flowers]){im.castShadow=true;im.computeBoundingSphere();root.add(im);}

 // Lily pads with pink lotus flowers, away from the boat loop and the dock.
 const lilies=[];for(let i=0;i<40&&lilies.length<22;i++){const a=i*2.399,r=0.35+((i*29)%11)/11*0.5,x=LAKE.x+Math.cos(a)*LAKE.rx*r,z=LAKE.z+Math.sin(a)*LAKE.rz*r;if(Math.abs(z-(LAKE.z+4.5))<2.2||(x>-233&&Math.abs(z-LAKE.z)<2))continue;lilies.push([x,z,i]);}
 const pads=new THREE.InstancedMesh(new THREE.CircleGeometry(0.5,14,0.2,Math.PI*2-0.4).rotateX(-Math.PI/2),m.pad,lilies.length),lotus=new THREE.InstancedMesh(new THREE.ConeGeometry(0.2,0.24,6),m.pink,lilies.length),hearts=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.07,0),m.gold,lilies.length);
 lilies.forEach(([x,z,i],k)=>{const sc=0.8+(i%3)*0.2;pads.setMatrixAt(k,matrix.makeRotationY(i).scale(new THREE.Vector3(sc,1,sc)).setPosition(x,waterY+0.04,z));const bloom=k%2?0:1;lotus.setMatrixAt(k,matrix.makeScale(bloom,bloom,bloom).setPosition(x+0.12,waterY+0.16,z));hearts.setMatrixAt(k,matrix.makeScale(bloom,bloom,bloom).setPosition(x+0.12,waterY+0.29,z));});
 for(const im of [pads,lotus,hearts]){im.computeBoundingSphere();root.add(im);}

 const area={root,house,lanterns:glow.lanterns,lilies,flies:glow.flies,waterY,update(t,camera,cur){
  const night=THREE.MathUtils.clamp(cur.stars,0,1);
  m.window.emissiveIntensity=0.35+night*0.9;glow.update(t,night);
 }};
 area.update(0,null,{stars:0});world.dreamyLake=area;return area;
}
// Fixed view from the dock across the water to the cottage, with a barely-there drift.
export function dreamyLakeViews(){return [
 {name:'Dreamy lake from the dock',group:'Dreamy lake',duration:240,loop:true,clearance:1.5,sample(t,out){const a=t/240*Math.PI*2,y=terrainHeight(DOCK_VIEW.x,DOCK_VIEW.z);out.pos.set(DOCK_VIEW.x+Math.sin(a)*0.3,y+2.1+Math.sin(a*2)*0.05,DOCK_VIEW.z+Math.cos(a)*0.2);out.look.set(-250,y+1.4,-9);}}
];}
