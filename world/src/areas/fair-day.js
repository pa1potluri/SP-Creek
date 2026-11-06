import * as THREE from 'three';
import {makeCharacter, CAST, animatePerson, gesture, seat} from '../characters.js';
import {signTexture} from '../textures.js';

// Fair props are owned by one switchable group; inactive fairs add no visible dressing.
export function buildFairDay(world, audio, rewards) {
  let lastTime=0,ride=null,soloUntil=-1;
  const root = new THREE.Group(); root.name = 'Fair Day'; root.visible = false;
  world.root.add(root);
  const wood = new THREE.MeshLambertMaterial({color:'#b78b61'});
  const colours = ['#e6aaaf','#a6cbd4','#e9d18b','#b9cfaa'].map(color=>new THREE.MeshLambertMaterial({color}));
  const box = (w,h,d,material,x,y,z,parent=root) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    mesh.position.set(x,y,z); mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
  };
  const y = world.groundY(0,-40);
  const stage = box(6,.3,3,wood,0,y+.15,-40);
  const carousel = new THREE.Group();carousel.position.set(0,world.groundY(0,35),35);root.add(carousel);
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(2.7,2.8,.22,24),colours[1]);deck.position.y=.2;carousel.add(deck);
  const mounts=[];
  const people=[], dancers=[], band=[];
  const person=(x,z,role='townswoman')=>{const p=makeCharacter({...CAST[role],star:null});p.g.position.set(x,world.groundY(x,z),z);root.add(p.g);people.push(p);return p;};
  for(let i=0;i<10;i++)dancers.push(person(Math.cos(i*Math.PI/5)*2.4,Math.sin(i*Math.PI/5)*2.4-15,i%2?'cowboy':'townswoman'));
  for(let i=0;i<4;i++){const p=person(-2.1+i*1.4,-40,'pianist');p.g.position.y=y+.3;band.push(p);
    const instrument=new THREE.Group();instrument.name=['Fiddle','Accordion','Banjo','Drum'][i];p.g.add(instrument);
    if(i===1){box(.55,.35,.22,colours[i],0,1.1,.35,instrument);for(let k=0;k<7;k++)box(.025,.35,.24,wood,-.22+k*.07,1.1,.35,instrument);}
    else {const body=new THREE.Mesh(new THREE.CylinderGeometry(i===0?.15:.25,i===0?.15:.25,.13,16),colours[i]);body.rotation.x=Math.PI/2;body.position.set(0,1,.35);instrument.add(body);if(i<3)box(.06,.6,.07,wood,0,1.4,.35,instrument);}
  }
  for(const [i,label]of ['Pie stall','Lemonade only','Flower crowns'].entries()){
    const x=i%2?-4.7:4.7,z=5-i*12;box(2,.8,1,wood,x,world.groundY(x,z)+.4,z);
    box(2.2,.15,1.3,colours[i],x,world.groundY(x,z)+2.2,z);
    const balloon=new THREE.Mesh(new THREE.SphereGeometry(.32,10,8),colours[i]);balloon.position.set(x,world.groundY(x,z)+3,z);root.add(balloon);
    box(.025,.8,.025,wood,x,world.groundY(x,z)+2.6,z);balloon.name=label;
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.45),new THREE.MeshLambertMaterial({map:signTexture(label,512,128,[40,30,84],'#584330'),side:THREE.DoubleSide}));sign.position.set(x,world.groundY(x,z)+1.85,z+.7);root.add(sign);
  }
  // Low, open bunting frames the square without placing posts in its walking lane.
  for(const z of [-32,12])for(let i=0;i<12;i++){const flag=new THREE.Mesh(new THREE.ConeGeometry(.24,.4,3),colours[i%4]);flag.rotation.z=Math.PI;flag.position.set(-6+i*1.1,4.8-Math.sin(i/11*Math.PI)*.6,z);root.add(flag);}
  const children=[0,1,2,3].map(i=>{const p=person(0,0,i%2?'townswoman':'cowboy');p.g.scale.setScalar(.65);return p;});
  const racers=[0,1,2].map(i=>{const p=person(4+i,20,'cowboy');p.g.scale.setScalar(.75);box(.5,.6,.4,colours[2],0,.3,0,p.g);return p;});
  const painter=person(-4.7,-5,'townswoman');seat(painter);painter.g.position.y+=.45;box(.8,.45,.8,wood,-4.7,world.groundY(-4.7,-5)+.22,-5);
  const bubbles=new THREE.InstancedMesh(new THREE.SphereGeometry(.12,8,6),new THREE.MeshLambertMaterial({color:'#dcecf4',transparent:true,opacity:.28,depthWrite:false}),24);root.add(bubbles);const matrix=new THREE.Matrix4();
  for(let i=0;i<4;i++){
    const a=i*Math.PI/2,pony=new THREE.Group();pony.position.set(Math.cos(a)*1.8,.9,Math.sin(a)*1.8);pony.rotation.y=-a;
    box(.4,.45,.9,colours[i],0,0,0,pony);box(.25,.45,.3,colours[i],0,.35,.35,pony);
    for(const x of [-.15,.15])for(const z of [-.3,.3])box(.1,.4,.1,wood,x,-.3,z,pony);
    for(const x of [-.1,.1])box(.08,.2,.08,colours[i],x,.65,.35,pony);
    carousel.add(pony);mounts.push(pony);
    const rider=makeCharacter({...CAST[i%2?'townswoman':'cowboy'],star:null});rider.g.scale.setScalar(.65);rider.g.position.y=.35;seat(rider,true);pony.add(rider.g);
  }
  const ribbon=new THREE.Mesh(new THREE.TorusGeometry(.22,.06,6,16),colours[0]);ribbon.position.set(0,y+1.4,-37.8);ribbon.name='Fair ribbon';root.add(ribbon);
  const kites=[];for(let i=0;i<3;i++){const kite=new THREE.Mesh(new THREE.PlaneGeometry(.8,1.2),new THREE.MeshLambertMaterial({color:['#f5b840','#de6595','#61c6d6'][i],side:THREE.DoubleSide}));kite.position.set(5+i,9+i*.6,-25);kite.rotation.z=Math.PI/4;root.add(kite);kites.push(kite);}
  return {root,stage,carousel,mounts,people,dancers,band,ribbon,beat:0,
    tap(ray,event,game){if(!root.visible)return false;const hit=ray.intersectObjects([...band.map(p=>p.g),carousel,ribbon],true)[0];if(!hit)return false;
      if(hit.object===ribbon){if(event.isTrusted){rewards.collectFairRibbon(event);ribbon.visible=false;audio.chime(event);}return true;}
      let obj=hit.object;while(obj&&obj!==carousel&&!band.some(p=>p.g===obj))obj=obj.parent;
      if(obj===carousel&&game.active&&!ride&&!game.horse&&!game.balloon)ride={start:lastTime,returnPos:game.pos.clone(),game};else{soloUntil=lastTime+3;audio.fairPhrase(event,true);}return true;
    },
    setActive(on){root.visible=!!on;audio.fairActive=!!on;if(!on){if(ride){ride.game.pos.copy(ride.returnPos);ride.game.person.g.position.copy(ride.returnPos);}ride=null;audio.stopFair?.();}},update(time,game){
    lastTime=time;
    if(!root.visible)return;
    if(ride&&!game?.active){ride.game.pos.copy(ride.returnPos);ride.game.person.g.position.copy(ride.returnPos);ride=null;}
    this.beat=time*1.6;carousel.rotation.y=time*.12;
    audio.fairTick(time);
    ribbon.visible=!rewards.state.fairRibbon;
    if(game?.active){if(ride){const u=(time-ride.start)/(Math.PI*2/.12);if(u>=1){game.pos.copy(ride.returnPos);ride=null;}else{const a=(time-ride.start)*.12;game.pos.set(Math.cos(a)*1.8,carousel.position.y+1.6,35+Math.sin(a)*1.8);game.person.g.position.copy(game.pos);seat(game.person,true);}}else if(Math.hypot(game.pos.x,game.pos.z+15)<1.2){animatePerson(game.person,this.beat,.2);game.person.arms.forEach((arm,i)=>arm.rotation.z=(i?1:-1)*.6);}}
    kites.forEach((kite,i)=>kite.rotation.y=Math.sin(time*.4+i)*.15);
    mounts.forEach((pony,i)=>pony.position.y=.9+Math.sin(this.beat+i*Math.PI/2)*.12);
    dancers.forEach((p,i)=>{const a=i*Math.PI/5+time*.08;p.g.position.set(Math.cos(a)*2.4,world.groundY(Math.cos(a)*2.4,Math.sin(a)*2.4-15),Math.sin(a)*2.4-15);p.g.rotation.y=-a;animatePerson(p,this.beat,.28);p.arms.forEach((arm,j)=>arm.rotation.z=(j?1:-1)*.65);});
    band.forEach((p,i)=>{animatePerson(p,this.beat+i,.08);gesture(p,'talk',.5,time*(time<soloUntil?.8:.4));});
    children.forEach((p,i)=>{const a=i*Math.PI/2-time*.1;p.g.position.set(Math.cos(a)*3.6,world.groundY(Math.cos(a)*3.6,-15+Math.sin(a)*3.6)+Math.max(0,Math.sin(this.beat))*.04,-15+Math.sin(a)*3.6);p.g.rotation.y=-a;animatePerson(p,this.beat,.4);});
    racers.forEach((p,i)=>{const u=(time%24)/24;p.g.position.z=20+Math.sin(u*Math.PI)*7;p.g.position.y=world.groundY(p.g.position.x,p.g.position.z)+Math.abs(Math.sin(this.beat))*.06;animatePerson(p,this.beat,.08);if(u>.85)gesture(p,'wave',.5,time*.3);});
    for(let i=0;i<24;i++){const age=(time*.18+i*.17)%1;matrix.makeScale(1+age,1+age,1+age).setPosition(-3+Math.sin(i*2.4+age)*2,1+age*4,4+Math.cos(i+age)*3);bubbles.setMatrixAt(i,matrix);}bubbles.instanceMatrix.needsUpdate=true;
  }};
}

export function fairViews(){return [
  ['Fair Day from above',[20,25,20],[0,1,-12]],
  ['Fair Day band',[0,3,-31],[0,1.5,-40]],
  ['Fair Day circle dance',[0,5,-6],[0,1,-15]],
  ['Fair Day carousel',[6,4,42],[0,1,35]],
  ['Fair Day bubbles',[-6,3,12],[0,2,4]],
  ['Fair Day lantern evening',[18,18,14],[0,2,-15]],
].map(([name,pos,look])=>({name,group:'Fair Day',duration:180,loop:true,sample(t,out){out.pos.fromArray(pos);out.look.fromArray(look);}}));}
