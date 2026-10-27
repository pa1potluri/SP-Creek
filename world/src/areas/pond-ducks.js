import * as THREE from 'three';

// A shared, time-sampled loop keeps the birds separated without frame-history nudges.
export function buildPondDucks(world, parent) {
  const root=new THREE.Group();root.name='Willow pond ducks';parent.add(root);
  const yellow=new THREE.MeshLambertMaterial({color:'#f2cd6e'});
  const bill=new THREE.MeshLambertMaterial({color:'#e5a45f'});
  const ink=new THREE.MeshLambertMaterial({color:'#46505a'});
  const white=new THREE.MeshLambertMaterial({color:'#fff9e7'});
  const birds=[],states=[];let clock=0;
  function oval(g,r,m,x,y,z,sx=1,sy=1,sz=1){const o=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=o.receiveShadow=true;g.add(o);return o;}
  for(let i=0;i<3;i++){
    const g=new THREE.Group();root.add(g);birds.push(g);
    oval(g,.34,yellow,0,.2,0,.85,.8,1.35);
    oval(g,.2,yellow,0,.51,.25);
    oval(g,.12,bill,0,.45,.46,1,.4,1.3);
    for(const x of [-.12,.12]){oval(g,.035,ink,x,.55,.38);oval(g,.012,white,x-.008,.56,.408);}
    const wings=[-1,1].map(side=>{const wing=new THREE.Group();wing.position.set(side*.25,.28,0);g.add(wing);oval(wing,.2,yellow,side*.05,0,0,.45,.65,1.4);return wing;});
    const rings=Array.from({length:3},()=>{const m=new THREE.MeshBasicMaterial({color:'#d1eee4',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),r=new THREE.Mesh(new THREE.RingGeometry(.48,.5,40),m);r.rotation.x=-Math.PI/2;root.add(r);return r;});
    states.push({g,wings,rings,reactAt:-Infinity,targetYaw:0});
  }
  return {root,birds,states,react(hit,viewer){
    const e=states.find(e=>{for(let p=hit;p;p=p.parent)if(p===e.g)return true;return false;});
    if(!root.visible||!e)return false;
    e.reactAt=clock;e.targetYaw=Math.atan2(viewer.x-e.g.position.x,viewer.z-e.g.position.z);return true;
  },update(t){
    clock=t;root.visible=world.hamlet.visible;
    const pond=world.hamlet.pond;
    states.forEach((e,i)=>{
      const a=t*.04+i*Math.PI*2/3,u=(t-e.reactAt)/2.4;
      const reaction=u>=0&&u<=1?Math.sin(u*Math.PI)**2:0;
      const yaw=Math.atan2(4.8*Math.cos(a),-1.8*Math.sin(a));
      const turn=Math.atan2(Math.sin(e.targetYaw-yaw),Math.cos(e.targetYaw-yaw));
      e.g.position.set(pond.area.x+Math.sin(a)*4.8,pond.pad.y+.025+Math.sin(t*.85+i)*.018,pond.area.z+1.7+Math.cos(a)*1.8);
      e.g.rotation.set(0,yaw+turn*reaction,Math.sin(t*.6+i)*.018);
      e.wings.forEach((wing,j)=>wing.rotation.z=reaction>0?(j?1:-1)*reaction*(.35+.22*Math.sin((t-e.reactAt)*8)):0);
      e.rings.forEach((r,j)=>{const phase=((t*.36+j/3+i*.13)%1+1)%1;r.position.set(e.g.position.x,pond.pad.y+.035,e.g.position.z);r.scale.setScalar(.55+phase*1.25);r.material.opacity=Math.sin(phase*Math.PI)*(.12+reaction*.12);});
    });
  }};
}
