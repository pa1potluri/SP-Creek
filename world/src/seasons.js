import * as THREE from 'three';
import { terrainHeight } from './world.js';

export class Seasons {
  constructor(world,atmos,areas) {
    this.world=world;this.atmos=atmos;this.areas=areas;this.key='summer';this.hooked=new WeakSet();
    this.uniforms={uAutumn:{value:0},uSeasonSnow:{value:0}};
    this.root=new THREE.Group();this.root.name='Seasonal square decorations';world.root.add(this.root);
    this.pumpkins=new THREE.Group();this.snowman=new THREE.Group();this.root.add(this.pumpkins,this.snowman);
    const mat=color=>new THREE.MeshLambertMaterial({color}),white=mat('#f1f5ee'),orange=mat('#dd9854'),green=mat('#74936a'),blue=mat('#82a8bf'),pink=mat('#dfa4b6'),dark=mat('#56616b');
    const ball=(g,r,m,x,y,z,s=[1,1,1])=>{const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),m);mesh.position.set(x,y,z);mesh.scale.set(...s);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);return mesh;};
    this.pumpkins.position.set(-3.8,terrainHeight(-3.8,-50),-50);
    for(let i=0;i<5;i++){const x=(i%3)*0.48-0.5,z=Math.floor(i/3)*0.45;ball(this.pumpkins,0.3,orange,x,0.26,z,[1,0.8,1]);ball(this.pumpkins,0.06,green,x,0.51,z,[0.7,1.5,0.7]);}
    this.snowman.position.set(4.8,terrainHeight(4.8,-53),-53);
    ball(this.snowman,0.63,white,0,0.63,0);ball(this.snowman,0.46,white,0,1.38,0);ball(this.snowman,0.34,white,0,1.99,0);
    for(const x of [-0.12,0.12])ball(this.snowman,0.035,dark,x,2.06,0.31);
    ball(this.snowman,0.07,orange,0,1.96,0.37,[0.8,0.8,1.8]);
    for(let i=0;i<5;i++){const a=Math.PI*(0.15+i*0.175);ball(this.snowman,0.018,dark,Math.cos(a)*0.14,1.91-Math.sin(a)*0.065,0.31);}
    for(const y of [1.22,1.4,1.56])ball(this.snowman,0.035,dark,0,y,0.44);
    ball(this.snowman,0.39,pink,0,1.7,0,[1,0.18,1]);ball(this.snowman,0.35,blue,0,2.3,0,[1,0.5,1]);
    for(const side of [-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(0.035,0.6,4,8),dark);arm.position.set(side*0.55,1.46,0);arm.rotation.z=side*-0.8;this.snowman.add(arm);}
    this.colliders={autumn:{x:-3.8,z:-50,r:1},winter:{x:4.8,z:-53,r:0.65}};
    const positions=new Float32Array(700*3);for(let i=0;i<700;i++)positions.set([(i*17.43)%64-32,(i*0.71)%26,(i*31.73)%64-32],i*3);
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
    this.particles=new THREE.Points(geometry,new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uCam:{value:new THREE.Vector3()},uMode:{value:0},uScale:{value:600},uWind:{value:1},uCafeInverse:{value:new THREE.Matrix4()},uCafeSize:{value:new THREE.Vector3()}},transparent:true,depthWrite:false,
      vertexShader:`uniform float uTime,uMode,uScale,uWind;uniform vec3 uCam,uCafeSize;uniform mat4 uCafeInverse;varying vec3 vTint;void main(){vec3 p=position;float winter=step(1.5,uMode);p.y=mod(p.y-uTime*mix(0.38,0.75,winter),26.0)-5.0;p.x+=sin(uTime*0.17+position.z)*mix(3.0,1.0,winter)*uWind;p.z+=cos(uTime*0.13+position.x)*1.3;vec3 w=uCam+vec3(mod(p.x-uCam.x+32.0,64.0)-32.0,p.y,mod(p.z-uCam.z+32.0,64.0)-32.0);vec4 mv=viewMatrix*vec4(w,1.0);gl_Position=projectionMatrix*mv;vec3 localCafe=(uCafeInverse*vec4(w,1.0)).xyz;if(abs(localCafe.x)<uCafeSize.x&&localCafe.z<0.0&&localCafe.z>-uCafeSize.y&&localCafe.y<uCafeSize.z)gl_Position=vec4(2.0,2.0,2.0,1.0);gl_PointSize=clamp(uScale*mix(0.12,0.065,winter)/max(1.0,-mv.z),1.0,12.0);vTint=mix(mix(vec3(0.8,0.3,0.06),vec3(0.95,0.65,0.14),fract(position.x*0.27)),vec3(0.94,0.97,1.0),winter);}`,
      fragmentShader:`varying vec3 vTint;void main(){vec2 p=gl_PointCoord-0.5;float alpha=1.0-smoothstep(0.08,0.25,dot(p,p));gl_FragColor=vec4(vTint,alpha*0.65);}`}));
    this.particles.frustumCulled=false;atmos.scene.add(this.particles);this.set('summer');
  }
  set(key) {
    this.key=['summer','autumn','winter'].includes(key)?key:'summer';
    this.uniforms.uAutumn.value=this.key==='autumn'?1:0;this.uniforms.uSeasonSnow.value=this.key==='winter'?1:0;
    this.pumpkins.visible=this.key==='autumn';this.snowman.visible=this.key==='winter';this.particles.visible=this.key!=='summer';
    for(const [season,collider]of Object.entries(this.colliders)){const index=this.world.colliders.circles.indexOf(collider);if(season===this.key&&index<0)this.world.colliders.circles.push(collider);else if(season!==this.key&&index>=0)this.world.colliders.circles.splice(index,1);}
  }
  hook(material,foliage,snow) {
    if(this.hooked.has(material)||(!foliage&&!snow))return;this.hooked.add(material);
    const before=material.onBeforeCompile.bind(material),cacheKey=material.customProgramCacheKey(),uniforms=this.uniforms;
    material.onBeforeCompile=(shader,renderer)=>{before(shader,renderer);Object.assign(shader.uniforms,uniforms);
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vSeasonNormal,vSeasonPosition;').replace('#include <begin_vertex>',`#include <begin_vertex>
        vec3 seasonNormal=normal;vec4 seasonPosition=vec4(position,1.0);
        #ifdef USE_INSTANCING
          seasonNormal=mat3(instanceMatrix)*seasonNormal;seasonPosition=instanceMatrix*seasonPosition;
        #endif
        vSeasonNormal=normalize(mat3(modelMatrix)*seasonNormal);vSeasonPosition=(modelMatrix*seasonPosition).xyz;`);
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vSeasonNormal,vSeasonPosition;uniform float uAutumn,uSeasonSnow;').replace('#include <color_fragment>',`#include <color_fragment>
        float seasonVariation=0.5+0.5*sin(vSeasonPosition.x*0.17+sin(vSeasonPosition.z*0.23)*2.0);
        ${foliage?`float leafMask=smoothstep(0.005,0.08,diffuseColor.g-max(diffuseColor.r,diffuseColor.b)*0.9);
        float leafLight=clamp(dot(diffuseColor.rgb,vec3(0.3,0.59,0.11))*3.0,0.45,1.3);
        vec3 autumnColor=mix(vec3(0.55,0.10,0.025),vec3(0.85,0.48,0.07),seasonVariation)*leafLight;
        diffuseColor.rgb=mix(diffuseColor.rgb,autumnColor,uAutumn*leafMask*0.94);
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.8,0.89,0.94),uSeasonSnow*leafMask*0.78);`:''}
        ${snow?`float snowMask=smoothstep(0.3,0.88,normalize(vSeasonNormal).y)*(0.82+seasonVariation*0.18);
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.87,0.93,0.98),uSeasonSnow*snowMask*0.94);`:''}`);
    };material.customProgramCacheKey=()=>cacheKey+'-season-'+foliage+'-'+snow;material.needsUpdate=true;
  }
  update(t,camera) {
    const w=this.world,visit=node=>node?.traverse(m=>{if(m.isMesh)for(const material of [].concat(m.material))this.hook(material,true,false);});
    for(const node of [...Object.values(w.foliage||{}),...(w.lowPoly||[]),...(w.blocky||[])])visit(node);
    for(const {mesh}of w.plantInstances)visit(mesh);
    for(const {im}of this.areas.forest.variants)visit(im);
    for(const mesh of this.areas.meadowLake.plants)visit(mesh);
    this.hook(w.ground.material,false,true);
    for(const material of w.surfaces){const roof=material===w.mat.roof||material.userData.sets?.oil?.image===w.painted.oil.roof||material.userData.sets?.clean?.image===w.painted.clean.roof;if(roof||material.userData.keepMap)this.hook(material,false,true);}
    this.areas.meadowLake.root.traverse(m=>{if(m.isMesh&&m.material.map?.image?.src?.includes('/textures/dream/meadow'))this.hook(m.material,false,true);});
    this.particles.visible=this.key!=='summer';
    const u=this.particles.material.uniforms,it=w.interiors.cafe;if(it){it.group.updateWorldMatrix(true,false);u.uCafeInverse.value.copy(it.group.matrixWorld).invert();u.uCafeSize.value.set(it.hx,it.depth,3.8);}u.uTime.value=t;u.uCam.value.copy(camera.position);u.uMode.value=this.key==='winter'?2:1;u.uWind.value=w.wind??1;u.uScale.value=this.atmos.renderer.domElement.height/(2*Math.tan(camera.fov*Math.PI/360));
    if(this.key==='winter'){w.lanternLevel=Math.max(0.55,w.lanternLevel);this.atmos.poolMaterial.opacity=w.lanternLevel*0.22;if(this.atmos.key==='morning'){this.atmos.hemi.color.lerp(new THREE.Color('#bddcf4'),0.22);this.atmos.scene.fog.color.lerp(new THREE.Color('#c7deef'),0.25);}}
  }
}

