import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { LEFT, RIGHT, terrainHeight, walkHeight } from '../world.js';
import { makeCharacter, CAST, animatePerson, gesture } from '../characters.js';
import { signTexture } from '../textures.js';

// One registration owns the square, street decorations and their clock-driven motion.
export function buildTownCenter(world, life) {
  const root = new THREE.Group(); root.name = 'Town center'; world.root.add(root);
  const family = new THREE.Group(); family.name = 'Family shop displays'; root.add(family);
  const mat = color => new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide });
  const wood = world.mat.darkWood, stone = mat('#bfb5a4'), cream = mat('#fff0cf'), green = mat('#68956b');
  const pink = mat('#e9a5b7'), blue = mat('#97c7d2'), yellow = mat('#efd284'), lilac = mat('#bcb0d4');
  const leaf = mat('#5d8956'), soil = mat('#554432'), bread = mat('#d6a15d'), red = mat('#df847b');
  const colors = [pink, yellow, lilac, cream, blue], buckets = new Map(), flags = [], keepers = [];
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  function group(x, y, z, yaw = 0, parent = root) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = yaw; parent.add(g); return g;
  }
  function solid(geo, material, x, y, z, parent = root, rotation = null) {
    if (rotation) geo.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rotation)));
    geo.translate(x, y, z);
    const key = parent.uuid + material.uuid;
    if (!buckets.has(key)) buckets.set(key, { parent, material, geos: [] });
    buckets.get(key).geos.push(geo.index ? geo.toNonIndexed() : geo);
  }
  const box = (w, h, d, m, x, y, z, g = root) => solid(new THREE.BoxGeometry(w, h, d), m, x, y, z, g);
  const ball = (r, m, x, y, z, g = root, scale = [1, 1, 1]) => solid(new THREE.SphereGeometry(r, 8, 6).scale(...scale), m, x, y, z, g);
  function flowers(x, y, z, count, g = root, spread = 0.8) {
    for (let i = 0; i < count; i++) {
      const a = i * 2.399, r = spread * Math.sqrt((i + 0.5) / count);
      const fx = x + Math.cos(a) * r, fz = z + Math.sin(a) * r, h = 0.28 + (i % 3) * 0.09;
      box(0.025, h, 0.025, leaf, fx, y + h / 2, fz, g);
      ball(0.15, leaf, fx, y + 0.09, fz, g, [1.4, 0.6, 1]);
      for (let j = 0; j < 5; j++) ball(0.095, colors[i % colors.length], fx + Math.cos(j * 1.257) * 0.11, y + h, fz + Math.sin(j * 1.257) * 0.11, g, [1, 0.6, 1]);
      ball(0.06, yellow, fx, y + h + 0.03, fz, g);
    }
  }
  function flowerBox(x, y, z, g, width = 1.8) {
    box(width, 0.25, 0.45, green, x, y, z, g);
    box(width - 0.12, 0.04, 0.34, soil, x, y + 0.14, z, g);
    for (let i = 0; i < 5; i++) flowers(x - width * 0.4 + i * width * 0.2, y + 0.15, z, 2, g, 0.13);
  }
  function sign(text, w, h, x, y, z, yaw = 0, parent = root) {
    const tex = signTexture(text, 1024, 256, [43, 45, 87], '#4b5548');
    const g = group(x, y, z, yaw, parent);
    box(w + 0.16, h + 0.16, 0.13, wood, 0, 0, -0.08, g);
    solid(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }), 0, 0, 0, g);
  }
  function lamp(x, z, real = false) {
    const g = group(x, walkHeight(x, z), z);
    box(0.13, 3.4, 0.13, wood, 0, 1.7, 0, g);
    box(0.9, 0.09, 0.1, wood, 0, 3.35, 0, g);
    box(0.3, 0.46, 0.3, world.mat.lantern, 0, 3.05, 0, g);
    solid(new THREE.ConeGeometry(0.3, 0.18, 4), wood, 0, 3.39, 0, g, [0, Math.PI / 4, 0]);
    const halo = new THREE.Sprite(world.haloMat); halo.position.set(0, 3.05, 0); halo.scale.setScalar(2.1); g.add(halo);
    world.colliders.circles.push({ x, z, r: 0.18 });
    if (real) {
      const p = world._takeLight();
      if (p) { p.light.position.set(x, g.position.y + 2.9, z); p.light.color.set('#ffc781'); world.lanternLights.push(p.light); }
    }
  }
  function canopy(g, w, depth, y, color) {
    for (let i = 0; i < 8; i++) {
      const x = -w / 2 + (i + 0.5) * w / 8, m = i % 2 ? cream : color;
      solid(new THREE.BoxGeometry(w / 8 + 0.01, 0.09, depth), m, x, y, 0.1, g, [0.13, 0, 0]);
      box(w / 8 + 0.01, 0.3, 0.07, m, x, y - 0.28, depth / 2 + 0.1, g);
    }
  }
  for (const [side, specs] of [[-1, LEFT], [1, RIGHT]]) for (const [i, s] of specs.entries()) {
    const shop = group(side * 7.5, 0, s.z, -side * Math.PI / 2);
    for (const x of [-s.w * 0.29, s.w * 0.29]) flowerBox(x, 1.15, 0.42, shop, Math.min(2, s.w * 0.23));
    if (['UNDERTAKER', 'BANK', 'DUSTY HOLLOW MERCANTILE', 'GUNSMITH'].includes(s.sign)) {
      const awning = group(0, 0, 1.45, 0, shop); canopy(awning, s.w - 0.3, 2.9, 3.52, colors[i % 5]);
    }
    // Hanging baskets sit outside the porch's walking lane.
    for (const x of [-s.w / 2 + 0.4, s.w / 2 - 0.4]) {
      box(0.025, 0.6, 0.025, wood, x, 2.8, 2.58, shop);
      solid(new THREE.SphereGeometry(0.24, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), bread, x, 2.55, 2.58, shop);
      flowers(x, 2.51, 2.58, 5, shop, 0.22);
    }
  }
  // Window displays are added over the painted panes, behind their own subtle glass.
  const glass = new THREE.MeshPhongMaterial({ color: '#d9eff0', transparent: true, opacity: 0.13, depthWrite: false, shininess: 50 });
  for (const [z, sweets] of [[-33, false], [8, true]]) {
    const display = group(-7.5, 0, z, Math.PI / 2, family);
    for (const sx of [-2.4, 2.4]) {
      box(2, 0.12, 0.65, cream, sx, 1.72, 0.45, display);
      if (sweets) for (let i = 0; i < 4; i++) {
        const x = sx - 0.65 + i * 0.43;
        solid(new THREE.CylinderGeometry(0.16, 0.16, 0.47, 10), glass, x, 2.01, 0.45, display);
        solid(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 10), cream, x, 2.27, 0.45, display);
        for (let k = 0; k < 6; k++) ball(0.075, colors[(i + k) % 5], x + Math.sin(k * 2) * 0.07, 1.84 + k * 0.05, 0.45, display);
      } else {
        ball(0.3, bread, sx - 0.5, 1.96, 0.45, display, [1.3, 0.65, 0.8]);
        solid(new THREE.CylinderGeometry(0.34, 0.35, 0.25, 12), pink, sx + 0.45, 1.94, 0.45, display);
        solid(new THREE.CylinderGeometry(0.36, 0.34, 0.06, 12), cream, sx + 0.45, 2.1, 0.45, display);
        for (let k = 0; k < 5; k++) ball(0.055, red, sx + 0.45 + Math.cos(k * 1.257) * 0.22, 2.17, 0.45 + Math.sin(k * 1.257) * 0.22, display);
      }
      box(2, 0.7, 0.02, glass, sx, 2.08, 0.8, display);
    }
  }
  const clock = group(-7.25, 5.8, 22, Math.PI / 2, family);
  solid(new THREE.CircleGeometry(0.6, 24), wood, 0, 0, 0, clock);
  solid(new THREE.CircleGeometry(0.51, 24), cream, 0, 0, 0.01, clock);
  for (let i = 0; i < 12; i++) ball(0.035, wood, Math.sin(i * Math.PI / 6) * 0.43, Math.cos(i * Math.PI / 6) * 0.43, 0.03, clock);
  box(0.055, 0.38, 0.03, wood, 0, 0.16, 0.05, clock);
  solid(new THREE.BoxGeometry(0.055, 0.28, 0.03), wood, 0.09, -0.05, 0.06, clock, [0, 0, -2]);
  box(0.05, 2, 0.05, wood, -5, 4.3, 25, family);
  box(1.1, 0.65, 0.035, blue, -4.45, 4.8, 25, family);
  box(0.2, 0.65, 0.045, cream, -4.65, 4.8, 25, family);

  for (const z of [47, 19, -3, -24, -42]) for (const side of [-1, 1]) lamp(side * 4.95, z);
  for (const [x, z] of [[-6,-50],[6,-50],[-6,-60],[6,-60]]) lamp(x, z, true);
  // Flower barrels at shop corners and the entrance.
  for (const [x, z] of [[-5.5,44],[5.5,44],[-5.5,-37],[5.5,-39],[-4.7,58],[4.7,58]]) {
    const barrel = world.placeProp('barrel', x, z, 0, false);
    flowers(x, barrel.obj.position.y + 0.92, z, 11, root, 0.29);
  }
  for (const z of [15,-18]) {
    const curve = new THREE.CatmullRomCurve3([v(-5,5,z),v(0,4.5,z),v(5,5,z)]);
    solid(new THREE.TubeGeometry(curve,24,0.022,4,false),wood,0,0,0);
    for (let i = 0; i < 15; i++) {
      const p = curve.getPoint(i / 14), geo = new THREE.BufferGeometry();
      geo.setAttribute('position',new THREE.Float32BufferAttribute([-0.22,0,0,0.22,0,0,0,-0.5,0],3)); geo.computeVertexNormals();
      const flag = new THREE.Mesh(geo,colors[i % 5]); flag.position.copy(p); root.add(flag); flags.push(flag);
    }
  }
  // A compact fountain leaves room for benches and the church approach.
  const square = group(0, terrainHeight(0,-55), -55); square.name = 'Fountain square';
  solid(new THREE.CylinderGeometry(3.7,3.8,0.08,40),stone,0,0.04,0,square);
  solid(new THREE.CylinderGeometry(1.8,2,0.4,32),stone,0,0.28,0,square);
  solid(new THREE.TorusGeometry(1.8,0.17,6,32),cream,0,0.53,0,square,[Math.PI/2,0,0]);
  const water = new THREE.MeshPhongMaterial({color:'#74b4be',shininess:65,transparent:true,opacity:0.8});
  solid(new THREE.CircleGeometry(1.65,32),water,0,0.5,0,square,[-Math.PI/2,0,0]);
  solid(new THREE.CylinderGeometry(0.18,0.32,1.25,12),stone,0,1.05,0,square);
  solid(new THREE.SphereGeometry(0.68,16,8).scale(1,0.2,1),cream,0,1.68,0,square);
  const streams = [];
  for(let i=0;i<8;i++) {
    const a=i*Math.PI/4,curve=new THREE.QuadraticBezierCurve3(v(0,1.78,0),v(Math.cos(a)*0.8,2.55,Math.sin(a)*0.8),v(Math.cos(a)*1.25,0.56,Math.sin(a)*1.25));
    solid(new THREE.TubeGeometry(curve,12,0.025,4,false),water,0,0,0,square);
    const drop=new THREE.Mesh(new THREE.SphereGeometry(0.055,6,4),cream);square.add(drop);streams.push({drop,curve});
  }
  const ripples = [0,1,2].map(()=>{const m=new THREE.Mesh(new THREE.RingGeometry(0.92,1,32),cream);m.rotation.x=-Math.PI/2;m.position.y=0.515;square.add(m);return m;});
  world.colliders.circles.push({x:0,z:-55,r:2});
  for(const [x,z,yaw] of [[-5,-54,Math.PI/2],[5,-54,-Math.PI/2],[-3.5,-61,0],[3.5,-61,0]]) world.placeProp('bench',x,z,yaw,false);
  const shade = group(-10,terrainHeight(-10,-55),-55);
  solid(new THREE.CylinderGeometry(0.28,0.5,5,8),wood,0,2.5,0,shade);
  for(let i=0;i<7;i++) ball(2.1,leaf,Math.sin(i*2.4)*1.9,5.7+(i%3)*0.4,Math.cos(i*2.4)*1.9,shade,[1.15,0.85,1]);
  world.colliders.circles.push({x:-10,z:-55,r:0.6});
  flowers(-10,terrainHeight(-10,-55),-55,18,root,2.2);

  function stall(x,z,color,label,kind) {
    const g=group(x,terrainHeight(x,z),z);g.name=label+' market stall';
    box(3.5,0.18,1.6,wood,0,0.95,0,g);box(3.35,0.78,0.1,color,0,0.48,0.78,g);
    for(const sx of [-1,1])for(const sz of [-1,1])box(0.09,2.8,0.09,wood,sx*1.65,1.4,sz*0.7,g);
    canopy(g,3.8,2.1,2.9,color);sign(label,2.5,0.38,0,2.48,1.22,0,g);
    if(kind==='flowers') for(let i=0;i<5;i++)flowers(-1.3+i*0.65,1.07,0.15,6,g,0.23);
    else for(let i=0;i<18;i++) {
      const fx=-1.35+(i%6)*0.53,fz=-0.38+Math.floor(i/6)*0.45;
      ball(kind==='bread'?0.2:0.14,kind==='bread'?bread:i%2?yellow:red,fx,1.18,fz,g,kind==='bread'?[1.3,0.6,0.8]:[1,1,1]);
    }
    world.colliders.circles.push({x,z,r:1.4});
    if(keepers.length<2) {
      const p=makeCharacter({...CAST.shopkeeper,shirt:keepers.length?'#a7bfc8':'#e6bc92',apron:'#fff0cf',hat:'straw',hatColor:'#dfc28b'});
      p.g.position.set(x,terrainHeight(x,z-1.3),z-1.3);root.add(p.g);keepers.push(p);
    }
  }
  stall(-8,-44,pink,'FLOWERS','flowers');stall(8,-44,blue,'FRUIT','fruit');stall(9,-57,yellow,'FRESH BREAD','bread');
  life.addTownCenterKids([v(-3,0,-42),v(3,0,-42),v(-3,0,-26),v(3,0,-12),v(-3,0,20),v(3,0,36)]);
  // Link the square around the south of the livery to the existing station approach.
  const path=world._ribbon([[5,-49],[23,-46],[27,-21],[24,-2.8],[40,0],[52,8],[58,20.5],[64,22]],2.3,world._pathMaterial(),{lift:0.08,step:1});
  path.name='Town center station path';root.attach(path);
  for(const [x,z] of [[15,-48],[26,-37],[28,-20],[25,-5],[39,2],[51,6],[58,23]])lamp(x,z);
  sign('TRAIN STATION →',3.8,0.7,5.6,2.5,-47);
  box(0.12,2.7,0.12,wood,5.6,1.35,-47);
  for(const x of [-4.7,4.7])box(0.18,5.4,0.18,wood,x,2.7,58);
  sign('WELCOME TO DUSTY HOLLOW',9,1.05,0,5.3,58);
  // Merge static pieces by parent/material; animated flags, water drops and people stay separate.
  for(const {parent,material,geos} of buckets.values()) {
    const geometry=mergeGeometries(geos);const m=new THREE.Mesh(geometry,material);m.castShadow=m.receiveShadow=true;parent.add(m);
    for(const geo of geos)geo.dispose();
  }
  let familyMode=true;
  const area={root,family,keepers,flags,square,path,setFamilyMode(on){familyMode=!!on;family.visible=familyMode;},update(t){
    flags.forEach((f,i)=>{f.rotation.x=Math.sin(t*1.1+i*0.7)*0.13*(world.wind??1);f.rotation.y=Math.sin(t*0.8+i)*0.08*(world.wind??1);});
    streams.forEach(({drop,curve},i)=>drop.position.copy(curve.getPoint((t*0.45+i/8)%1)));
    ripples.forEach((m,i)=>{const s=0.35+((t*0.2+i/3)%1)*1.1;m.scale.setScalar(s);});
    water.color.set('#74b4be').lerp(new THREE.Color('#314c6e'),world.lanternLevel*0.7);
    keepers.forEach((p,i)=>{p.g.visible=life.settings.people>0;animatePerson(p,t*0.4+i,0);const k=(t+i*7)%24;if(k<2.8)gesture(p,'wave',k/2.8,t);});
  }};
  area.setFamilyMode(world.familyMode);world.root.updateMatrixWorld(true);return area;
}
