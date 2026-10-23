import * as THREE from 'three';

const bytes = new Uint8Array(64 * 64 * 4);
for (let i = 0; i < 64 * 64; i++) {
  let h = Math.imul(i + 731, 374761393); h = Math.imul(h ^ h >>> 13, 1274126177); h ^= h >>> 16;
  const n = (h >>> 24) & 255; bytes.set([n,n,n,255], i * 4);
}
const noise = new THREE.DataTexture(bytes,64,64);
noise.wrapS = noise.wrapT = THREE.RepeatWrapping;
noise.magFilter = noise.minFilter = THREE.LinearFilter; noise.needsUpdate = true;
export const cloudUniforms = {
  uCloudMap: {value:noise}, uCloudTime:{value:0}, uCloudWind:{value:1}, uCloudAmount:{value:0},
};

const cloudGLSL = `
varying vec3 vCloudWorld;
uniform sampler2D uCloudMap;
uniform float uCloudTime, uCloudWind, uCloudAmount;
float cloudLight(vec3 p) {
  vec2 q = (p.xz + vec2(0.82, 0.36) * uCloudTime * uCloudWind * 0.9) / 4096.0;
  float n = texture2D(uCloudMap, q).r * 0.72 + texture2D(uCloudMap, q * 1.83 + 0.37).r * 0.28;
  return 1.0 - smoothstep(0.30, 0.72, n) * uCloudAmount;
}`;

export function cloudShader(shader) {
  if (shader.uniforms.uCloudMap) return;
  Object.assign(shader.uniforms,cloudUniforms);
  shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vCloudWorld;')
    .replace('#include <project_vertex>', `#include <project_vertex>
      vec4 cloudPosition = vec4(transformed, 1.0);
      #ifdef USE_BATCHING
        cloudPosition = batchingMatrix * cloudPosition;
      #endif
      #ifdef USE_INSTANCING
        cloudPosition = instanceMatrix * cloudPosition;
      #endif
      vCloudWorld = (modelMatrix * cloudPosition).xyz;`);
  const lighting = THREE.ShaderChunk.lights_fragment_begin.replace('getDirectionalLightInfo( directionalLight, directLight );',
    'getDirectionalLightInfo( directionalLight, directLight );\n directLight.color *= cloudLight(vCloudWorld);');
  shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\n' + cloudGLSL)
    .replace('#include <lights_fragment_begin>',lighting);
}

let installed = false;
export function installCloudLighting() {
  if (installed) return; installed = true;
  const before = THREE.Material.prototype.onBeforeCompile;
  THREE.Material.prototype.onBeforeCompile = function(shader,renderer) {
    before.call(this,shader,renderer);
    if (this.isMeshLambertMaterial || this.isMeshPhongMaterial || this.isMeshStandardMaterial) {
      cloudShader(shader); this.userData.cloudLighting = true;
    }
  };
}

export function waterMaterial(kind, shared) {
  const mat = new THREE.MeshPhongMaterial({color:0x8caab0,map:shared.map,shininess:45,specular:0x345e68,transparent:true,opacity:0.96,depthWrite:false});
  const u = { ...shared.uniforms, uWaterKind:{value:kind} };
  mat.userData.waterUniforms = u; mat.customProgramCacheKey = () => 'valley-water-v2';
  mat.onBeforeCompile = shader => {
    cloudShader(shader); Object.assign(shader.uniforms,u);
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vWaterUV;').replace('#include <project_vertex>','#include <project_vertex>\nvWaterUV = uv;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
      uniform float uWaterTime, uWaterWind, uWaterKind, uWaterDetail;
      varying vec2 vWaterUV;
      uniform vec3 uWaterSky, uWaterHorizon, uWaterBank, uWaterSun, uWaterSunDir, uWaterFoamColor;
      uniform vec3 uWaterFoam[16];
      vec3 waterNormal(vec2 p) {
        float t = uWaterTime * (0.4 + uWaterWind * 0.25);
        return normalize(vec3((cos(p.x * 2.1 + p.y * 0.7 - t) * 0.08 + cos(p.y * 5.3 + t * 1.5) * 0.035) * uWaterDetail,
          1.0, (sin(p.y * 2.8 - p.x * 0.6 + t * 0.8) * 0.07 + sin(p.x * 6.1 - t) * 0.025) * uWaterDetail));
      }`)
      .replace('#include <map_fragment>', THREE.ShaderChunk.map_fragment.replaceAll('vMapUv','(vMapUv - vec2(uWaterTime * mix(0.006,0.001,uWaterKind),0.0))') + '\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.299,0.587,0.114))), 0.15);')
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n normal = normalize(mat3(viewMatrix) * waterNormal(vCloudWorld.xz));')
      .replace('#include <opaque_fragment>', `
        vec2 wp = vCloudWorld.xz;
        vec3 wn = waterNormal(wp), eye = normalize(cameraPosition - vCloudWorld);
        float fresnel = pow(1.0 - max(dot(eye, wn), 0.0), 3.0);
        float shore = uWaterKind < 0.5 ? abs(vWaterUV.y * 2.0 - 1.0) * 1.09 : length(vWaterUV * 2.0 - 1.0);
        float banks = smoothstep(0.40, 0.96, shore);
        float reflection = sin(wp.x * 0.63 + sin(wp.y * 0.38) * 2.0 + wn.x * 6.0) * 0.5 + 0.5;
        vec3 skyReflection = mix(uWaterHorizon, uWaterSky, clamp(eye.y * 0.75 + wn.z, 0.0, 1.0));
        vec3 reflected = mix(diffuse * 0.9, skyReflection * vec3(0.45, 0.75, 0.9), 0.18 + fresnel * 0.25);
        reflected = mix(reflected, uWaterBank * (0.55 + reflection * 0.35), banks * 0.65);
        reflected += uWaterHorizon * pow(max(sin(wp.x * 0.8 + wp.y * 2.8 + uWaterTime * 0.8 + cos(wp.x * 2.0) * 0.4),0.0),14.0) * 0.035 * uWaterDetail;
        float broken = 0.45 + 0.55 * sin(wp.x * 1.7 + wp.y * 2.3 + uWaterTime * 0.6) * sin(wp.y * 4.1 - uWaterTime * 0.4);
        float foam = smoothstep(0.88, 0.99, shore) * smoothstep(0.15, 0.75, broken) * 0.28;
        for (int i = 0; i < 16; i++) {
          float dist = length(wp - uWaterFoam[i].xy), r = uWaterFoam[i].z;
          if (r > 0.0) foam = max(foam, (1.0 - smoothstep(r, r + 0.8, dist)) * smoothstep(0.1, r * 0.6, dist) * (0.4 + broken * 0.45));
        }
        outgoingLight = mix(outgoingLight, reflected, 0.90 + fresnel * 0.07);
        float glint = pow(max(dot(reflect(-normalize(uWaterSunDir), wn), eye), 0.0), 85.0);
        outgoingLight += uWaterSun * glint * 0.22 * cloudLight(vCloudWorld);
        outgoingLight = mix(outgoingLight, uWaterFoamColor, clamp(foam * 0.65, 0.0, 0.7));
        diffuseColor.a *= mix(0.92, 1.0, banks);
        #include <opaque_fragment>`);
    mat.userData.cloudLighting = true;
  };
  return mat;
}
