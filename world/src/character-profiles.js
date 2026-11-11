import * as THREE from 'three';
import {decodePoints} from './experiments/point-data.mjs';
import {makeSolidResident} from './solid-residents.js';

// Approved solid residents are the game cast. The old heads are an internal rollback only.
const faceMode=new URLSearchParams(location.search).get('characterFaces');
export const profilesEnabled=faceMode!=='original';
const heroHeadPreview=faceMode==='pipeline';
const profiles=new Map(),materials=new Map();let nextResident=0;
const residentIds=['town-101','town-202','town-303','town-404','town-505','town-606','town-700','town-701','town-702','town-703','town-704','town-705'];
export function selectCharacterProfile(outfit){
 if(!profilesEnabled||outfit.star==='sister'||outfit.ghost)return null;
 if(outfit.star==='brother'&&!heroHeadPreview)return null;
 const id=outfit.star==='brother'?'brother':(outfit.pipelineProfile||residentIds[(nextResident++)%residentIds.length]);return profiles.has(id)?id:null;
}
export function profileSkin(id){const skin=profiles.get(id)?.skin;return skin?`rgb(${skin.join(',')})`:null;}
export function attachCharacterProfile(person,id){
 const profile=profiles.get(id);if(!profile)return;
 for(const child of person.head.children)child.visible=false;
 if(profile.solid){const head=makeSolidResident(profile.profile);person.head.add(head);person.pipelineProfile=id;person.pipelineHead=head;return;}
 const key=id==='brother'?'hero':'resident';
 if(!materials.has(key))materials.set(key,new THREE.PointsMaterial({size:.012,vertexColors:true,toneMapped:false,fog:true}));
 const points=new THREE.Points(profile.geometry,materials.get(key));points.name='Approved face '+id;person.head.add(points);person.pipelineProfile=id;person.pipelineHead=points;
 points.onBeforeRender=(_renderer,scene)=>{const fog=scene.fog?.color;points.material.color.setScalar(fog ? .65+.35*Math.min(1,Math.max(fog.r,fog.g,fog.b)*2):1);};
}
