import * as THREE from 'three';
import {decodePoints} from './experiments/point-data.mjs';
import {roundPointMap} from './point-footprint.js';

// First rollout is reversible; the ordinary game URL keeps its existing cast.
export const profilesEnabled=new URLSearchParams(location.search).get('characterFaces')==='pipeline';
const profiles=new Map(),materials=new Map();let nextResident=0;
if(profilesEnabled){
 try{
  const base=new URL('../assets/characters/pipeline-game/',import.meta.url),response=await fetch(new URL('manifest.json',base));if(!response.ok)throw Error('Profile manifest unavailable');
  const manifest=await response.json();
  await Promise.all(manifest.profiles.map(async entry=>{
   const response=await fetch(new URL(entry.id+'.bin',base));if(!response.ok)return;
   const buffer=await response.arrayBuffer();if(buffer.byteLength!==entry.count*20)return;
   const data=decodePoints(buffer,{scale:.0042,offset:[0,.25,0]}),colors=new Float32Array(data.count*3),color=new THREE.Color();
   for(let i=0;i<data.count;i++){color.setRGB(data.colors[i*3]/255,data.colors[i*3+1]/255,data.colors[i*3+2]/255,THREE.SRGBColorSpace);color.toArray(colors,i*3);}
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(data.positions,3));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));geometry.computeBoundingSphere();
   profiles.set(entry.id,{...entry,geometry});
  }));
 }catch(error){console.warn('Approved profile preview unavailable; keeping original heads:',error.message);}
}
const residentIds=['town-101','town-202','town-303','town-404','town-505','town-606','town-700','town-701','town-702','town-703','town-704','town-705'];
export function selectCharacterProfile(outfit){
 if(!profilesEnabled||outfit.star==='siri'||outfit.ghost)return null;
 const id=outfit.star==='pavi'?'pavi':(outfit.pipelineProfile||residentIds[(nextResident++)%residentIds.length]);return profiles.has(id)?id:null;
}
export function profileSkin(id){const skin=profiles.get(id)?.skin;return skin?`rgb(${skin.join(',')})`:null;}
export function attachCharacterProfile(person,id){
 const profile=profiles.get(id);if(!profile)return;
 for(const child of person.head.children)child.visible=false;
 const key=id==='pavi'?'hero':'resident';
 if(!materials.has(key))materials.set(key,new THREE.PointsMaterial({size:key==='hero'?.012:.020,vertexColors:true,toneMapped:false,fog:true,...(key==='resident'?{map:roundPointMap(),alphaTest:.5}:{})}));
 const points=new THREE.Points(profile.geometry,materials.get(key));points.name='Approved face '+id;person.head.add(points);person.pipelineProfile=id;person.pipelineHead=points;
 points.onBeforeRender=(_renderer,scene)=>{const fog=scene.fog?.color;points.material.color.setScalar(fog ? .65+.35*Math.min(1,Math.max(fog.r,fog.g,fog.b)*2):1);};
}
