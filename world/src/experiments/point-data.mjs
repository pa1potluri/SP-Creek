// Data adapter only. No renderer, world integration, animation or third-party imports.
export function decodePoints(input,{scale=1,offset=[0,0,0]}={}){
const buffer=ArrayBuffer.isView(input)?input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength):input;
if(!(buffer instanceof ArrayBuffer)||buffer.byteLength%20)throw Error('Expected 20-byte face-points-v1 records');
if(!Number.isFinite(scale)||scale<=0||offset.length!==3||!offset.every(Number.isFinite))throw Error('Invalid transform');
const d=new DataView(buffer),count=buffer.byteLength/20,positions=new Float32Array(count*3),normals=new Float32Array(count*3),colors=new Uint8Array(count*3),parts=new Uint8Array(count);
for(let i=0;i<count;i++){const j=i*3,o=i*20;for(let k=0;k<3;k++){const v=d.getFloat32(o+k*4,true);if(!Number.isFinite(v))throw Error('Nonfinite point');positions[j+k]=v*scale+offset[k];normals[j+k]=d.getInt8(o+12+k)/127;colors[j+k]=d.getUint8(o+15+k)}parts[i]=d.getUint8(o+18);if(parts[i]>8)throw Error('Unknown part id')}
return{count,positions,normals,colors,parts};}
