import { terrainHeight, riverZ, RAIL_X } from '../src/world.js';

// Terrain workshop anywhere: Soften makes a steep open slope gentle; towns, water and the railway stay protected.
export async function runTerrainSoftenTests(){
  const a=window.__app,w=a.world,original=a.projectData(),results=[];
  const check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  const slope=(x,z)=>Math.hypot(terrainHeight(x+4,z)-terrainHeight(x-4,z),terrainHeight(x,z+4)-terrainHeight(x,z-4))/8;
  try{
    check(!w.shapeTerrain({mode:'soften',x:0,z:30,radius:8,amount:1,target:0}),'Town centre is protected');
    check(!w.shapeTerrain({mode:'raise',x:RAIL_X,z:-200,radius:8,amount:1}),'Railway is protected');
    check(!w.shapeTerrain({mode:'lower',x:150,z:riverZ(150),radius:8,amount:1}),'River is protected');
    // the steepest open slope that the brush accepts
    const spots=[];for(let x=-560;x<=560;x+=16)for(let z=-560;z<=560;z+=16)spots.push([slope(x,z),x,z]);
    spots.sort((p,q)=>q[0]-p[0]);
    let spot=null;for(const [s,x,z] of spots.slice(0,200)){if(w.shapeTerrain({mode:'soften',x,z,radius:10,amount:2,target:0})){spot={s,x,z};break;}}
    check(!!spot,'An open steep slope outside the old test square accepts the brush');
    const after=slope(spot.x,spot.z);
    check(after<spot.s*0.8,`Soften makes the slope gentler (${spot.s.toFixed(2)} -> ${after.toFixed(2)})`);
    const h=terrainHeight(spot.x,spot.z),saved=a.projectData();
    check(w.undoTerrain()&&Math.abs(slope(spot.x,spot.z)-spot.s)<1e-6,'Undo brings the slope back');
    a.loadProject(saved);check(Math.abs(terrainHeight(spot.x,spot.z)-h)<1e-6,'Softened ground saves and reloads');
    return {passed:results.length,results,spot:{x:spot.x,z:spot.z,before:+spot.s.toFixed(2),after:+after.toFixed(2)}};
  }finally{a.loadProject(original);}
}
