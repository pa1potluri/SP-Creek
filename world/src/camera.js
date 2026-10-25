import { gardenViews, GARDEN } from './areas/garden.js';
// Camera director: slow cinematic shots, smooth flights between them (no cuts, no dissolves),
// a free-fly camera, and your own key-framed camera moves.
import * as THREE from 'three';
import { terrainHeight, walkHeight, riverZ, roadX, RAIL_X, RANCH, CAMP, sampleTrainTrack } from './world.js';
import { HAMLET } from './hamlet.js';
import { starCameraFocus, MOMENTS, momentFocus, setMomentCameraReader, sampleTrainTrip, setTrainTripReader, rainyFocus, setRainyCameraReader, marketFocus, setMarketCameraReader, rowingFocus, setRowingCameraReader, setGardenCameraReader, snowDayFocus, setSnowDayCameraReader, meadowOutingFocus, setMeadowOutingCameraReader } from './life.js';
import { sampleBalloonRide, setBalloonRideReader } from './areas/crystal-mine.js';
import { farmViews } from './areas/pony-farm.js';
import { campingViews } from './areas/camping.js';
import { beachWalk, stageCove } from './areas/sunset-cove.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (t) => Math.min(1, Math.max(0, t));
// clamped: rounding can push the polynomial a hair past 1, which breaks getPointAt
const smoother = (t) => Math.min(1, Math.max(0, t * t * t * (t * (t * 6 - 15) + 10)));
const G = (x, h, z) => V(x, terrainHeight(x, z) + h, z); // h metres above the ground

export function pathShot(name, keys, duration) {
  const pc = new THREE.CatmullRomCurve3(keys.map((k) => k[0]), false, 'centripetal');
  const lc = new THREE.CatmullRomCurve3(keys.map((k) => k[1]), false, 'centripetal');
  return {
    name, duration, loop: false,
    sample(t, out) {
      const u = smoother(clamp01(t / duration));
      pc.getPointAt(u, out.pos);
      lc.getPointAt(u, out.look);
    },
  };
}

function panShot(name, pos, duration, yaw0 = 0, lookHeight = 0.35) {
  return {
    name, duration, loop: true,
    sample(t, out) {
      const a = yaw0 + (t / duration) * Math.PI * 2;
      out.pos.copy(pos);
      out.look.set(pos.x + Math.sin(a) * 10, pos.y + lookHeight + Math.sin(t * 0.21) * 0.5, pos.z + Math.cos(a) * 10);
    },
  };
}

function orbitShot(name, center, radius, height, duration, lookY = 2) {
  return {
    name, duration, loop: true,
    sample(t, out) {
      const a = (t / duration) * Math.PI * 2;
      out.pos.set(center.x + Math.cos(a) * radius, center.y + height + Math.sin(t * 0.05) * 3, center.z + Math.sin(a) * radius);
      out.look.set(center.x, center.y + lookY, center.z);
    },
  };
}

function makeShots() {
  const town = [
    panShot('Town Square 360°', G(0, 1.7, 10), 90, Math.PI),
    pathShot('Arrival', [[G(3, 2.4, 125), G(1, 4, 40)], [G(0.8, 2.0, 82), G(0, 3.5, 30)], [G(0, 1.8, 48), G(0, 2.6, 0)]], 42),
    pathShot('Café to Town Hall', [[G(-2.5, 1.7, -5), G(7.5, 3.8, 8)], [G(-0.5, 1.7, 7), G(2, 2.8, 20)], [G(1.8, 1.7, 13), G(-7.5, 2.8, 22)]], 30),
    pathShot('Boardwalk Stroll', [[G(-6.2, 2.05, 46), G(-4.5, 2.1, 30)], [G(-6.2, 2.05, 10), G(-4.5, 2.2, -5)], [G(-6.2, 2.05, -28), G(-3, 2.6, -45)]], 55),
    pathShot('Church Approach', [[G(0, 1.7, -18), G(0, 3.5, -62)], [G(0.4, 1.6, -46), G(0, 10, -64)]], 30),
    pathShot('Crane Reveal', [[G(0, 1.8, 24), G(0, 2.5, -10)], [G(5, 14, 40), G(0, 4, -5)], [G(12, 42, 88), G(0, 0, -40)]], 36),
    orbitShot('Golden Orbit', V(0, 0, -5), 72, 32, 150, 3),
    pathShot('Hilltop Vista', [[G(-95, 22, 104), G(0, 4, 5)], [G(-108, 24, 109), G(0, 4, -10)]], 45),
  ].map((s) => ({ ...s, group: 'Town' }));

  // New shots are appended after the town ones so saved timelines keep their shot numbers.
  const rz = riverZ, mz = rz(48), bz = rz(roadX(158)), rail = RAIL_X;
  const R = RANCH, C = CAMP;
  const places = [
    ['River & mill', pathShot('Mill Wheel', [[G(34, 1.5, rz(34) - 12), V(48, 1.6, mz + 9)], [G(42, 1.4, rz(42) - 12.5), V(48, 2, mz + 11)]], 35)],
    ['River & mill', pathShot('Bridge Crossing', [[G(roadX(118) + 1, 1.8, 118), V(roadX(150), 2, 150)], [V(roadX(bz) + 0.8, 2.4, bz), V(roadX(178), 2.4, 178)], [G(roadX(198) + 0.8, 1.8, 198), G(roadX(230), 2.5, 230)]], 30)],
    ['River & mill', pathShot('River Drift', [[V(-40, 0.4, rz(-40)), V(0, 0.8, rz(0))], [V(-15, 0.5, rz(-15)), V(48, 2, mz + 8)], [V(6, 0.7, rz(6)), V(48, 1.6, mz + 10)]], 40)],
    ['Station', pathShot('Station Platform', [[V(65.5, 2.05, -9), V(69.5, 2.2, 40)], [V(65.6, 2.05, -3), V(69.5, 2.2, 45)]], 40)],
    ['Station', pathShot('Trackside', [[G(80, 1.4, 36), V(62, 3, 8)], [G(81, 1.5, 30), V(62, 3, 10)]], 40)],
    ['Ranch', pathShot('Ranch Overlook', [[G(-55, 10, -20), G(R.x, 2, R.z - 3)], [G(-62, 10, -12), G(R.x - 2, 2, R.z)]], 40)],
    ['Ranch', orbitShot('Corral Orbit', V(R.x + 12, R.y, R.z + 4), 17, 4.5, 90, 1.5)],
    ['Forest camp', pathShot('Forest Camp', [[V(C.x + 11, C.y + 2.4, C.z + 11), V(C.x, C.y + 1, C.z)], [V(C.x + 6, C.y + 1.7, C.z + 6.5), V(C.x - 1, C.y + 1.1, C.z - 1)]], 35)],
    ['Whole valley', pathShot('Valley Journey', [
      [G(C.x, 28, C.z + 22), G(R.x, 0, R.z)], [G(-70, 32, -40), G(0, 0, -20)], [G(10, 34, 20), G(0, 0, 60)],
      [G(25, 30, 120), G(48, 0, mz + 10)], [G(55, 32, 140), G(rail, 0, 30)], [G(88, 28, 60), G(64, 0, 5)],
    ], 100)],
  ].map(([group, s]) => ({ ...s, group }));

  // Inside the Golden Spur. Room coordinates (x across, z inwards from the door, y absolute)
  // turned into the world: the cafe faces west from x = 7.5, z = 8.
  const S = (lx, y, lz) => V(7.5 - lz, y, 8 + lx);
  const cafe = [
    // starts high and a little back so the room shows, not just the doors
    pathShot('Into the Honey Bun Café', [[S(0, 2.6, 3.2), S(0, 1.7, -8)], [S(0, 2.6, -1.2), S(0, 1.7, -9)], [S(0, 2.6, -5), S(0, 1.7, -10)]], 30),
    pathShot('At the Counter', [[S(2.6, 1.75, -3.6), S(5.5, 1.5, -5.6)], [S(2.4, 1.75, -8.8), S(5.5, 1.6, -7.4)]], 35),
    pathShot('Board Game Table', [[S(-2.3, 2.9, -5.8), S(-3.6, 1.15, -7.9)], [S(-1.8, 2.9, -7.2), S(-3.6, 1.15, -7.9)], [S(-2.1, 2.9, -8.6), S(-3.6, 1.15, -7.9)]], 60),
  ].map((s) => ({ ...s, group: 'Café' }));
  // the cast line-up stands across the street at z = 24 (Town life → Cast line-up)
  const cast = [
    pathShot('Meet the Cast', [[G(-3, 1.45, 27.3), G(-3.9, 1.15, 24)], [G(3, 1.45, 27.3), G(3.9, 1.15, 24)]], 40),
  ].map((s) => ({ ...s, group: 'Characters' }));
  const h = HAMLET, chapel = h.buildings[0];
  const hamlet = [
    pathShot('Willow Creek Approach', [[G(-72, 7, 67), G(-116, 4, 65)], [G(-99, 7, 66), G(-145, 6, 65)], [G(-124, 8, 65), G(chapel.x, 10, chapel.z)]], 85),
    pathShot('Willow Creek Chapel', [
      [G(-120, 10, 60), G(chapel.x, 10, chapel.z)], [G(-125, 11, 65), G(chapel.x, 10, chapel.z)],
      [G(-122, 12, 70), G(chapel.x, 10, chapel.z)], [G(-116, 14, 71), G(chapel.x, 10, chapel.z)],
    ], 100),
    pathShot('Willow Creek Overlook', [
      [G(h.x + 45, 26, h.z - 26), G(h.x - 8, 4, h.z)],
      [G(h.x + 39, 28, h.z - 30), G(h.x - 4, 4, h.z)],
      [G(h.x + 28, 29, h.z - 33), G(h.x, 4, h.z)],
    ], 90),
  ].map(s => {
    const sample = s.sample;
    return { ...s, group: 'Willow Creek', clearance: 3, sample(t, out) {
      sample(t, out);
      // Splines interpolate between pad heights, not the ground beneath the curve.
      out.pos.y = Math.max(out.pos.y, walkHeight(out.pos.x, out.pos.z) + 3);
    } };
  });
  const townCenter = [{ ...pathShot('Town Center Stroll', [
    [G(0.8, 2.8, 46), G(-6, 2.8, 32)], [G(1, 2.9, 17), G(-6, 2.6, 6)],
    [G(0, 3.2, -17), G(-6, 2.5, -32)], [G(2.5, 4, -43), G(0, 2.3, -55)],
    [G(4.2, 4.2, -49), G(0, 4, -66)],
  ], 100), group: 'Town center', clearance: 2.2 }];
  const ghostTown = [{ ...pathShot('Old Hollow Stroll', [
    [G(121.8,4.5,26),G(125,3,-7)],[G(121.8,3.5,8),G(135,3,-14)],
    [G(121.8,3.5,-16),G(115,3,-35)],[G(121.8,4,-31),G(133,7,-45)],
  ], 100), group:'Ghost town', clearance:2.5 }];
  const fy=terrainHeight(-72,-179),cy=terrainHeight(-90,-204),mh=terrainHeight(-225,0);
  const forest = [{...pathShot('Forest Trail',[
    [V(-77,fy+3.2,-179),V(-94,fy+(cy-fy)*0.3+1.8,-181)],
    [V(-86,fy+(cy-fy)*0.18+3.2,-179),V(-107,fy+(cy-fy)*0.45+1.8,-186)],
    [V(-108,fy+(cy-fy)*0.48+3.5,-185),V(-110,fy+(cy-fy)*0.7+1.8,-202)],
    [V(-111,fy+(cy-fy)*0.68+3.5,-202),V(-99,cy+1.8,-212)],
    [V(-101,cy+3.2,-214),V(-90,cy+1.8,-204)],
    [V(-93,cy+3.2,-207),V(-86,cy+1.8,-207)],
  ],100),group:'Forest',clearance:2.5}];
  const meadow=[{...pathShot('Meadow and Waterfall',[
    [V(-207,mh+15,29),V(-240,mh+2,-18)],[V(-216,mh+14,16),V(-244,mh+3,-20)],
    [V(-222,mh+13,5),V(-247,mh+4,-23)],[V(-223,mh+11,-7),V(-251,mh+5,-23)],
  ],100),group:'Meadow',clearance:3}];
  const crystalHill = [
    pathShot('Crystal Mine',[[V(173,3,-100),V(173,2.5,-115)],[V(173,2.6,-110),V(173,2,-119)],[V(173,2.3,-114),V(173,2.1,-119)]],75),
    pathShot('Balloon Hilltop',[[V(222,26,-122),V(202,8,-145)],[V(230,28,-143),V(202,8,-145)],[V(222,28,-166),V(202,8,-145)]],100),
  ].map(s=>{const sample=s.sample;return {...s,group:'Crystal hill',clearance:2.2,sample(t,out){sample(t,out);out.pos.y+=terrainHeight(out.pos.x,out.pos.z);out.look.y+=terrainHeight(out.look.x,out.look.z);}};});
  const grandTour = [
    pathShot('Old Hollow Tour', [[G(124,34,32),G(125,3,-12)],[G(145,34,24),G(125,3,-20)]],12),
    pathShot('Firefly Forest Tour', [[G(-65,38,-161),G(-98,4,-196)],[G(-72,38,-172),G(-99,4,-204)]],12),
    pathShot('Meadow and Lake Tour', [[V(-207,mh+22,29),V(-244,mh+3,-18)],[V(-216,mh+22,16),V(-247,mh+4,-23)]],12),
    pathShot('Crystal Mine Tour', [[G(160,32,-94),G(173,3,-115)],[G(157,32,-104),G(173,3,-115)]],12),
    pathShot('Willow Creek Pond Tour', [[G(-53,32,113),G(-69,1,94)],[G(-48,32,98),G(-69,1,94)]],12),
  ].map(s => ({...s, group:'Grand tour', clearance:3}));
  const seasonalViews=[
    pathShot('Deer at the Forest Edge',[[G(-58,7,-193),G(-66,1.3,-206)],[G(-56,7,-197),G(-66,1.3,-206)]],90),
    pathShot('Snowman in the Square',[[G(11,3.2,-45),G(4.8,1.4,-53)],[G(13,3.3,-49),G(4.8,1.4,-53)]],100),
  ].map(s=>({...s,group:'Seasonal views',clearance:1.5}));
  const starViews=[
    {name:'Pavi & Siri walk',duration:120,group:'Pavi & Siri',clearance:1.5,loop:true,sample(t,out){const f=starCameraFocus(),x=f.pos.x+Math.sin(f.yaw)*4.8,z=f.pos.z+Math.cos(f.yaw)*4.8;out.pos.set(x,Math.max(walkHeight(x,z)+1.55,f.pos.y+1.55),z);out.look.copy(f.pos);out.look.y+=1.05;}},
    pathShot('Pavi & Siri at the pond',[[V(-71,walkHeight(-71,78)+2.1,78),V(-69,walkHeight(-69,83.5)+1,83.5)],[V(-67,walkHeight(-67,78)+2.1,78),V(-69,walkHeight(-69,83.5)+1,83.5)]],100),
  ].map(s=>({...s,group:'Pavi & Siri',clearance:1.5}));
  const coveViews=[
    pathShot('Sunset Cove from above',[[G(-289,62,118),V(-366,3,25)],[G(-291,65,92),V(-368,3,17)]],100),
    {name:'Beach walk at sunset',duration:120,loop:true,sample(t,out){const p=beachWalk(),z=p.z+Math.cos(p.yaw)*5,x=p.x;out.pos.set(x,walkHeight(x,z)+1.6,z);out.look.set(p.x,p.y+1,p.z);}},
    {name:'Lantern lane to the sea',duration:100,loop:false,sample(t,out){const x=-295-43*smoother(clamp01(t/100));out.pos.set(x,walkHeight(x,20)+3.2,20);out.look.set(-395,0,25);}},
    {name:'Walking into the sunset',duration:70,loop:false,sample(t,out){const p=stageCove('beach',t),dx=Math.sin(p.yaw),dz=Math.cos(p.yaw);out.pos.set(p.x-dx*6,Math.max(p.y+1.65,walkHeight(p.x-dx*6,p.z-dz*6)+1.6),p.z-dz*6);out.look.set(p.x+dx*4,p.y+1,p.z+dz*4);}},
    {name:'Two small friends on a big beach',duration:35,loop:false,sample(t,out){const p=stageCove('beach',t+15);out.pos.set(-299-t*0.04,55,-5-t*0.08);out.look.set(p.x,p.y,p.z);}},
    {name:'Down the lantern lane',duration:35,loop:false,sample(t,out){const p=stageCove('lane',t),x=p.x+6;out.pos.set(x,Math.max(p.y+3.5,walkHeight(x,p.z)+1.6),p.z);out.look.set(p.x-12,p.y+2,p.z);}},
  ].map(s=>({...s,group:'Sunset Cove',clearance:1.5}));
  const momentViews=Object.entries(MOMENTS).map(([kind,spec])=>({name:spec.label,moment:kind,group:'Pavi & Siri moments',duration:40,loop:false,clearance:1.5,sample(t,out){const f=momentFocus(kind),drift=Math.sin(t/40*Math.PI)*0.3,x=f.pos.x+spec.offset[0]+drift,z=f.pos.z+spec.offset[2];out.pos.set(x,Math.max(f.pos.y+spec.offset[1],walkHeight(x,z)+1.8),z);out.look.copy(f.pos);out.look.y+=spec.lookY||0.9;}}));
  const balloonViews=[['Lift off',0,30],['Over the valley',30,180],['Coming home',210,30]].map(([name,phase,duration])=>({name,duration,balloonPhase:phase,group:'Balloon ride',loop:false,clearance:1.5,sample(t,out){const p=sampleBalloonRide(phase+t);out.pos.set(p.x-14,Math.max(p.y+6,walkHeight(p.x-14,p.z+23)+2),p.z+23);out.look.copy(p);out.look.y+=6;}}));
  const trainViews=[['All aboard',0,30],['Window view',30,150],['Seaside halt',180,60]].map(([name,phase,duration],i)=>({name,duration,trainPhase:phase,group:'Little train trip',loop:false,clearance:1.5,sample(t,out){const trip=sampleTrainTrip(phase+t),focus=sampleTrainTrack(trip.distance-11.4),side=i===0?-4.5:7,x=i===2?focus.pos.x+25:focus.pos.x+Math.cos(focus.yaw)*side,z=i===2?focus.pos.z+20:focus.pos.z-Math.sin(focus.yaw)*side+(i===0?9:2);out.pos.set(x,Math.max(focus.pos.y+(i===2?12:2.6),walkHeight(x,z)+1.5),z);out.look.copy(focus.pos);out.look.y+=2.5;}}));
  const rainyViews=[['Puddle smiles','puddles',30],['Raindrops on the cafe window','window',20],['A rainbow after the rain','rainbow',190]].map(([name,kind,duration])=>({name,duration,rainy:kind,group:'Rainy day fun',loop:false,clearance:1.5,sample(t,out){const f=rainyFocus(kind);if(kind==='window'){out.pos.copy(f.camera);out.look.copy(f.pos);out.look.y+=1.15;}else if(kind==='rainbow'){const distance=9+12*THREE.MathUtils.smoothstep(t,140,185),x=f.pos.x-f.direction.x*distance,z=f.pos.z-f.direction.z*distance;out.pos.copy(G(x,2+0.5*THREE.MathUtils.smoothstep(t,140,185),z));out.look.set(x+f.direction.x*115,terrainHeight(x,z)+23,z+f.direction.z*115);}else{out.pos.copy(G(f.pos.x+5,2.7,f.pos.z+6));out.look.copy(f.pos);out.look.y+=1.1;}}}));
  const marketViews=[{name:'Market day in the square',market:'wide',duration:100,loop:true,group:'Market day',clearance:1.5,sample(t,out){out.pos.copy(G(28+Math.sin(t*0.02),26,-12));out.look.copy(G(0,1,-43));}},{name:'A balloon for Pavi',market:'balloon',duration:80,loop:false,group:'Market day',clearance:1.5,sample(t,out){out.pos.copy(G(-4.5,2.9,-20));out.look.copy(marketFocus('balloon'));out.look.y+=1.5;}},{name:'Sharing a bakery bun',market:'bun',duration:110,loop:false,group:'Market day',clearance:1.5,sample(t,out){out.pos.copy(G(3.5,2.4,-17.5));out.look.copy(marketFocus('bun'));out.look.y+=1.1;}}];
  const rowingViews=[['A little boat on the lake','lake',0,80],['Drifting past the waterfall','lake',80,80],['A little boat at Sunset Cove','cove',0,80]].map(([name,kind,phase,duration],i)=>({name,duration,rowing:kind,rowingPhase:phase,loop:false,group:'A little boat trip',clearance:1.5,sample(t,out){const f=rowingFocus(kind,phase+t),x=f.pos.x+(i===2?-8:i===1?7:11),z=f.pos.z+(i===2?8:i===1?5:13);out.pos.set(x,Math.max(f.pos.y+(i===0?10:3.5),walkHeight(x,z)+1.8),z);out.look.copy(f.pos);out.look.y+=0.9;}}));
  const episodeViews=[
    {name:'Rain over SP Creek',rainy:'puddles',sample(t,out){out.pos.copy(G(22,23,40));out.look.copy(G(0,1,15));}},
    {name:'A wide clearing rainbow',rainy:'rainbow',sample(t,out){const f=rainyFocus('rainbow'),x=f.pos.x-f.direction.x*30,z=f.pos.z-f.direction.z*30;out.pos.copy(G(x,26,z));out.look.set(x+f.direction.x*115,terrainHeight(x,z)+23,z+f.direction.z*115);}},
    {name:'Cove boat from above',rowing:'cove',rowingPhase:65,sample(t,out){const f=rowingFocus('cove',65+t);out.pos.set(f.pos.x-14,f.pos.y+34,f.pos.z+15);out.look.copy(f.pos);out.look.x-=16;out.look.y+=1;}},
    {name:'A garden full of good things',gardenPhase:210,sample(t,out){out.pos.copy(G(GARDEN.x+21,17,GARDEN.z+22));out.look.copy(G(GARDEN.x,0.7,GARDEN.z));}}
  ].map(view=>({...view,duration:40,loop:false,group:'Episode establishing views',clearance:1.8,sample(t,out){view.sample(t,out);out.pos.y=Math.max(out.pos.y,walkHeight(out.pos.x,out.pos.z)+1.8);}}));
  const snowDayViews=[['A snowman with friends','snowman'],['Soft snow angels','angels'],['A gentle sled ride','sled'],['Cocoa by the window','cocoa']].map(([name,kind])=>({name,snowDay:kind,group:'Snow day',duration:60,loop:false,clearance:1.5,sample(t,out){const f=snowDayFocus(kind);if(kind==='cocoa'){out.pos.copy(f.camera);out.look.copy(f.pos);out.look.y+=0.95;}else{out.pos.set(f.pos.x+8,f.pos.y+(kind==='angels'?9:6),f.pos.z+11);out.look.copy(f.pos);out.look.y+=kind==='angels'?0.1:0.9;}}}));
  const outingViews=[['Kites above the meadow','kite',0],['Colourful kites and friends','kite',1],['A quiet kite-day ending','kite',2],['Picnic by the waterfall','picnic',0],['Fruit and little duck friends','picnic',1],['A wide waterfall picnic','picnic',2]].map(([name,kind,view])=>({name,meadowOuting:kind,group:kind==='kite'?'Kite day':'Waterfall picnic',duration:80,loop:false,clearance:1.5,sample(t,out){const f=meadowOutingFocus(kind),wide=view!==1;if(kind==='kite'){out.pos.set(f.x+(wide?16:8),f.y+(wide?10:7),f.z+12);out.look.set(f.x,f.y+(wide?3:4),f.z-1);}else{out.pos.set(f.x+(wide?13:7),f.y+(wide?8:4.5),f.z+(wide?16:10));out.look.set(f.x-4,f.y+1.1,f.z-4);}}}));
  return [...town, ...places, ...cafe, ...cast, ...hamlet, ...townCenter, ...ghostTown, ...forest, ...meadow, ...crystalHill, ...grandTour, ...seasonalViews, ...starViews, ...coveViews, {...pathShot('Playground',[[G(54,15,69),G(36,1,48)],[G(58,16,63),G(36,1,48)]],100),group:'Town playground',clearance:1.5},...momentViews,...balloonViews,...trainViews,...campingViews().map(view=>({...view,sample(t,out){view.sample(t,out);out.pos.y=Math.max(out.pos.y,walkHeight(out.pos.x,out.pos.z)+1.8);}})),...farmViews(),{name:'SP Creek station from above',group:'Episode establishing views',duration:40,loop:true,clearance:1.5,sample(t,out){const x=97+Math.sin(t/40*Math.PI*2)*0.7;out.pos.copy(G(x,25,50));out.look.set(66,2,10);}},{name:'Welcome to SP Creek: one cove walk',group:'Sunset Cove',duration:180,loop:false,clearance:1.8,sample(t,out){const u=clamp01(t/180),wide=Math.cos(u*Math.PI)**2,p=stageCove('beach',u*70),dx=Math.sin(p.yaw),dz=Math.cos(p.yaw),distance=8+38*wide,x=p.x-dx*distance,z=p.z-dz*distance;out.pos.set(x,Math.max(p.y+2.8+35*wide,walkHeight(x,z)+1.8),z);out.look.set(p.x+dx*3,p.y+1,p.z+dz*3);}},...rainyViews,...marketViews,...rowingViews,...gardenViews(),...episodeViews,...snowDayViews,...outingViews];
}

const isTyping = (e) => e.target && e.target.closest && e.target.closest('input, select, textarea');

export class Director {
  constructor(camera, dom) {
    this.camera = camera;
    setMomentCameraReader(()=>this.mode==='shot'?this.shot?.moment:null);
    setBalloonRideReader(()=>this.mode==='shot'&&this.shot?.balloonPhase!=null?{t:this.shot.balloonPhase+Math.min(this.t,this.shot.duration)}:null);
    setTrainTripReader(()=>this.mode==='shot'&&this.shot?.trainPhase!=null?{t:this.shot.trainPhase+Math.min(this.t,this.shot.duration)}:null);
    setRainyCameraReader(()=>this.mode==='shot'&&this.shot?.rainy?{kind:this.shot.rainy,t:Math.min(this.t,this.shot.duration),camera:this.camera}:null);
    setGardenCameraReader(()=>this.mode==='shot'&&this.shot?.gardenPhase!=null?{t:this.shot.gardenPhase+Math.min(this.t,this.shot.duration)}:null);
    setRowingCameraReader(()=>this.mode==='shot'&&this.shot?.rowing?{kind:this.shot.rowing,t:this.shot.rowingPhase+Math.min(this.t,this.shot.duration)}:null);
    setMarketCameraReader(()=>this.mode==='shot'&&this.shot?.market?{kind:this.shot.market,t:Math.min(this.t,this.shot.duration)}:null);
    setSnowDayCameraReader(()=>this.mode==='shot'&&this.shot?.snowDay?{kind:this.shot.snowDay,t:Math.min(this.t,this.shot.duration)}:null);
    setMeadowOutingCameraReader(()=>this.mode==='shot'&&this.shot?.meadowOuting?{kind:this.shot.meadowOuting,t:Math.min(this.t,this.shot.duration)}:null);
    this.dom = dom;
    this.shots = makeShots();
    this.speed = 1;
    this.sway = 0.4;
    this.segSeconds = 6;
    this.state = { pos: V(), look: V() };
    this.index = 0;
    this.t = 0;
    this.auto = false;
    this.autoHold = 40;
    this.paused = false;
    this.mode = 'shot';
    this.flight = null;
    this.custom = [];
    this.customShot = null;
    this.free = { yaw: 0, pitch: 0, keys: new Set(), drag: null };
    this.swayT = 0;
    this.shotSpeed = 1; // set by the timeline so a path fits its clip exactly
    this.locked = false; // timeline playback: ignore the speed slider and pause
    this.hold = false; // timeline playback: stay on a path's last frame instead of flying back
    this._look = V();
    this.onChange = () => {};
    this.shots[0].sample(0, this.state);
    this._input();
  }

  get shot() {
    return this.index === -1 ? this.customShot : this.shots[this.index];
  }
  get label() {
    if (this.mode === 'free') return 'Free camera';
    if (this.mode === 'game') return 'Playing';
    return (this.flight ? 'Flying to: ' : '') + this.shot.name;
  }

  play(i) {
    this.mode = 'shot';
    this.index = i;
    this.t = 0;
    this.shotSpeed = 1;
    this.hold = false;
    this._flyTo(this.shot);
    this.onChange();
  }

  // Timeline entry point. id: shot index or 'custom'. cut = jump straight to the first frame.
  // fitTo = clip seconds: a path shot is sped up/slowed down to end exactly when the clip does.
  playShot(id, { cut = false, fitTo = 0 } = {}) {
    if (id === 'custom') {
      if (this.custom.length < 2) id = 0;
      else this.customShot = pathShot('Your camera move', this.custom.map((k) => [k.pos.clone(), k.look.clone()]), (this.custom.length - 1) * this.segSeconds);
    }
    this.mode = 'shot';
    this.auto = false;
    this.index = id === 'custom' ? -1 : Math.min(+id || 0, this.shots.length - 1);
    this.t = 0;
    const shot = this.shot;
    if (cut) {
      this.flight = null;
      shot.sample(0, this.state);
    } else this._flyTo(shot);
    const flight = this.flight ? this.flight.dur : 0;
    this.shotSpeed = fitTo && !shot.loop ? shot.duration / Math.max(1, fitTo - flight) : 1;
    this.hold = !!fitTo;
    this.onChange();
  }
  next() {
    this.play(this.index < 0 ? 0 : (this.index + 1) % this.shots.length);
  }
  addKey() {
    this.custom.push({ pos: this.state.pos.clone(), look: this.state.look.clone() });
  }
  playCustom() {
    if (this.custom.length < 2) return false;
    this.customShot = pathShot('Your camera move', this.custom.map((k) => [k.pos.clone(), k.look.clone()]), (this.custom.length - 1) * this.segSeconds);
    this.play(-1);
    return true;
  }
  setFree(on) {
    if (on) {
      const d = this.state.look.clone().sub(this.state.pos).normalize();
      this.free.yaw = Math.atan2(d.x, d.z);
      this.free.pitch = Math.asin(THREE.MathUtils.clamp(d.y, -1, 1));
      this.mode = 'free';
      this.flight = null;
      this.onChange();
    } else {
      this.play(Math.max(0, this.index));
    }
  }

  // Glide from wherever the camera is to the first frame of a shot.
  _flyTo(shot) {
    const end = { pos: V(), look: V() };
    shot.sample(0, end);
    const start = { pos: this.state.pos.clone(), look: this.state.look.clone() };
    const dist = start.pos.distanceTo(end.pos);
    if (dist < 0.3 && start.look.distanceTo(end.look) < 0.3) {
      this.flight = null;
      return;
    }
    // rise out of the street, travel over the rooftops, settle into the shot
    const lift = Math.min(dist * 0.35, 30);
    const c1 = start.pos.clone(), c2 = end.pos.clone();
    c1.y = Math.max(c1.y, end.pos.y) + lift;
    c2.y = Math.max(c2.y, start.pos.y) + lift;
    const clearance = shot.clearance || 0;
    if (clearance) {
      let extra = 0;
      for (let i = 1; i < 256; i++) {
        const u = i / 256, a = 1 - u;
        const p = start.pos.clone().multiplyScalar(a * a * a).addScaledVector(c1, 3 * a * a * u).addScaledVector(c2, 3 * a * u * u).addScaledVector(end.pos, u * u * u);
        extra = Math.max(extra, (walkHeight(p.x, p.z) + clearance - p.y) / (3 * a * u));
      }
      c1.y += extra; c2.y += extra;
    }
    this.flight = { start, end, c1, c2, clearance, t: 0, dur: THREE.MathUtils.clamp(dist / 9, 3, 10) };
  }

  update(dt) {
    const s = this.state, step = this.locked ? dt : this.paused ? 0 : dt * this.speed;
    if (this.mode === 'free') {
      this._updateFree(dt);
    } else if (this.flight) {
      const f = this.flight;
      f.t += step;
      const u = smoother(clamp01(f.t / f.dur)), a = 1 - u;
      s.pos.set(0, 0, 0)
        .addScaledVector(f.start.pos, a * a * a)
        .addScaledVector(f.c1, 3 * a * a * u)
        .addScaledVector(f.c2, 3 * a * u * u)
        .addScaledVector(f.end.pos, u * u * u);
      s.look.copy(f.start.look).lerp(f.end.look, u);
      if (f.clearance) s.pos.y = Math.max(s.pos.y, walkHeight(s.pos.x, s.pos.z) + f.clearance);
      if (f.t >= f.dur) {
        this.flight = null;
        this.onChange();
      }
    } else {
      const shot = this.shot;
      this.t += step * this.shotSpeed;
      if (this.auto && this.t >= (shot.loop ? Math.min(shot.duration, this.autoHold) : shot.duration)) {
        this.next();
      } else if (!shot.loop && this.t >= shot.duration && this.hold) {
        shot.sample(shot.duration, s);
      } else if (!shot.loop && this.t >= shot.duration) {
        this.t = 0;
        this._flyTo(shot); // glide back to the start and play again
      } else {
        if (shot.loop) this.t %= shot.duration;
        shot.sample(this.t, s);
      }
    }
    this._apply(dt);
  }

  _updateFree(dt) {
    const f = this.free, s = this.state, k = f.keys;
    const v = 6 * (k.has('ShiftLeft') || k.has('ShiftRight') ? 4 : 1) * dt;
    const fwd = V(Math.sin(f.yaw), 0, Math.cos(f.yaw)), right = V(-Math.cos(f.yaw), 0, Math.sin(f.yaw));
    if (k.has('KeyW') || k.has('ArrowUp')) s.pos.addScaledVector(fwd, v);
    if (k.has('KeyS') || k.has('ArrowDown')) s.pos.addScaledVector(fwd, -v);
    if (k.has('KeyA') || k.has('ArrowLeft')) s.pos.addScaledVector(right, -v);
    if (k.has('KeyD') || k.has('ArrowRight')) s.pos.addScaledVector(right, v);
    if (k.has('KeyE') || k.has('Space')) s.pos.y += v;
    if (k.has('KeyQ') || k.has('KeyC')) s.pos.y -= v;
    s.pos.y = Math.max(s.pos.y, terrainHeight(s.pos.x, s.pos.z) + 0.5);
    const dir = V(Math.sin(f.yaw) * Math.cos(f.pitch), Math.sin(f.pitch), Math.cos(f.yaw) * Math.cos(f.pitch));
    s.look.copy(s.pos).addScaledVector(dir, 10);
  }

  // Gentle hand-held breathing on top of the planned move.
  _apply(dt) {
    this.swayT += dt;
    const k = this.mode === 'free' ? 0 : this.sway, t = this.swayT;
    const p = this.camera.position.copy(this.state.pos);
    p.x += (Math.sin(t * 0.61) + Math.sin(t * 0.27 + 1.3) * 0.7) * 0.06 * k;
    p.y += (Math.sin(t * 0.83 + 0.4) + Math.sin(t * 0.39 + 2.1) * 0.6) * 0.05 * k;
    const clearance = this.mode === 'shot' ? (this.flight?.clearance || this.shot?.clearance || 0) : 0;
    p.y = Math.max(p.y, clearance ? walkHeight(p.x, p.z) + clearance : terrainHeight(p.x, p.z) + 0.5);
    const l = this._look.copy(this.state.look);
    l.x += (Math.sin(t * 0.43 + 2.0) + Math.sin(t * 0.19) * 0.8) * 0.15 * k;
    l.z += (Math.sin(t * 0.37 + 0.7) + Math.sin(t * 0.17 + 1.1) * 0.8) * 0.15 * k;
    l.y += (Math.sin(t * 0.52 + 0.9) + Math.sin(t * 0.23 + 3.0) * 0.8) * 0.12 * k;
    this.camera.lookAt(l);
  }

  _input() {
    this.dom.addEventListener('pointerdown', (e) => {
      if (this.mode === 'free' && e.button === 0) this.free.drag = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('pointermove', (e) => {
      const g = this.free.drag;
      if (!g) return;
      this.free.yaw -= (e.clientX - g.x) * 0.0035;
      this.free.pitch = THREE.MathUtils.clamp(this.free.pitch - (e.clientY - g.y) * 0.0035, -1.45, 1.45);
      g.x = e.clientX;
      g.y = e.clientY;
    });
    window.addEventListener('pointerup', () => (this.free.drag = null));
    window.addEventListener('keydown', (e) => { if (!isTyping(e)) this.free.keys.add(e.code); });
    window.addEventListener('keyup', (e) => this.free.keys.delete(e.code));
    window.addEventListener('blur', () => this.free.keys.clear());
  }
}
