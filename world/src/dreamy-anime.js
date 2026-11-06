import * as THREE from 'three';
const installed=new WeakSet();
export const animeState={enabled:{value:0},materials:0};
export function setDreamyAnime(root,on){
 animeState.enabled.value=on?1:0;if(!on)return;
 root.traverse(o=>{if(!o.isMesh)return;for(const m of (Array.isArray(o.material)?o.material:[o.material])){
  if(!m?.isMeshLambertMaterial||installed.has(m))continue;
  installed.add(m);animeState.materials++;const before=m.onBeforeCompile,key=m.customProgramCacheKey();
  m.onBeforeCompile=function(shader,renderer){before.call(this,shader,renderer);shader.uniforms.uDreamyCel=animeState.enabled;
   const lighting=THREE.ShaderChunk.lights_lambert_pars_fragment.replace('vec3 irradiance = dotNL * directLight.color;','float softBand = mix(0.30,1.0,smoothstep(0.36,0.46,dotNL));\nvec3 irradiance = mix(dotNL,softBand,uDreamyCel) * directLight.color;');
   shader.fragmentShader='uniform float uDreamyCel;\n'+shader.fragmentShader.replace('#include <lights_lambert_pars_fragment>',lighting).replace('#include <map_fragment>',THREE.ShaderChunk.map_fragment.replace('texture2D( map, vMapUv )','texture2D( map, vMapUv, uDreamyCel * 1.25 )'));
  };m.customProgramCacheKey=()=>key+'-dreamy-cel-v1';m.needsUpdate=true;
 }});
}
