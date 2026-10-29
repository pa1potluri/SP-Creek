import * as THREE from 'three';
import { buildPondDucks } from './pond-ducks.js';
import { walkHeight,coastX } from '../world.js';
export const MOMENTS={bench:{label:'A quiet bench together',x:-72,z:73.5,offset:[5,2.6,5]},handWalk:{label:'Hand in hand at the cove',x:coastX(-50)+15,z:-50,offset:[-6,2.3,5]},castle:{label:'A little sandcastle',x:coastX(-30)+16,z:-30,offset:[-6,2.6,5]},ducks:{label:'Feeding the pond ducks',x:-69,z:83.5,offset:[5,2.5,-4]},wave:{label:'Hello, friendly town',x:0,z:-35,offset:[3.8,2.2,6]},balloon:{label:'Pavi spots the balloon',x:194,z:-135,offset:[28,24,16],lookY:7},collar:{label:"Siri fixes Pavi's collar",x:coastX(-65)+16,z:-65,offset:[-2,2.5,6]}};
export function buildMomentProps(world){
 const root=new THREE.Group();root.name='Pavi and Siri moment props';world.root.add(root);const sand=new THREE.MeshLambertMaterial({color:'#d6bc85'}),cream=new THREE.MeshLambertMaterial({color:'#f4e3b8'}),gold=new THREE.MeshLambertMaterial({color:'#dfb26b'}),ink=new THREE.MeshLambertMaterial({color:'#514a40'});
 const mesh=(g,geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;};
 const bench=world.makeProp('bench');bench.position.set(MOMENTS.bench.x,walkHeight(MOMENTS.bench.x,MOMENTS.bench.z),MOMENTS.bench.z);root.add(bench);world.colliders.rects.push(world._rectOf(bench,0,0,0.95,0.3));
 const castle=new THREE.Group(),c=MOMENTS.castle;castle.position.set(c.x,walkHeight(c.x,c.z),c.z);root.add(castle);mesh(castle,new THREE.CylinderGeometry(0.65,0.8,0.28,24),sand,0,0.14,0);for(const x of [-0.6,0.6])for(const z of [-0.4,0.4]){mesh(castle,new THREE.CylinderGeometry(0.18,0.23,0.5,16),sand,x,0.25,z);mesh(castle,new THREE.SphereGeometry(0.19,12,8),cream,x,0.5,z).scale.y=0.4;}world.colliders.circles.push({x:c.x,z:c.z,r:0.9});
 const pondDucks=buildPondDucks(world,root),ducks=pondDucks.root,birds=pondDucks.birds;
 const crumbs=new THREE.InstancedMesh(new THREE.SphereGeometry(0.025,6,4),cream,16);crumbs.visible=false;root.add(crumbs);const matrix=new THREE.Matrix4();
 return {root,bench,castle,ducks,birds,pondDucks,crumbs,update(t,kind){pondDucks.update(t);crumbs.visible=kind==='ducks';if(crumbs.visible)for(let i=0;i<16;i++){const u=((t/3+i/16)%1+1)%1,size=Math.sin(u*Math.PI);crumbs.setMatrixAt(i,matrix.makeScale(size,size,size).setPosition(-69+(i%2?0.4:-0.4),walkHeight(-69,83.5)+0.9+Math.sin(u*Math.PI)*0.3-u*0.8,83.5+u*4.7));}crumbs.instanceMatrix.needsUpdate=true;}};
}
