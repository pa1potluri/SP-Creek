import * as THREE from 'three';
let map;
export function roundPointMap(){
 if(map)return map;
 const size=32,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=(y*size+x)*4,dx=(x+.5)/size*2-1,dy=(y+.5)/size*2-1;
  data.set([255,255,255,dx*dx+dy*dy<=1?255:0],i);
 }
 map=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);map.minFilter=map.magFilter=THREE.LinearFilter;map.needsUpdate=true;return map;
}
