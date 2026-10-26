// Local solid queries for ambient traffic, avoiding an all-tree scan on each footstep.
const indexes=new WeakMap();
export function solidAt(world,x,z,r=0.4){
 const c=world.colliders,key=[c.circles.length,c.rects.length,c.segs.length,world.terrainRevision].join(':');let index=indexes.get(world);
 if(!index||index.key!==key){const cells=new Map(),put=(shape,type,minX,maxX,minZ,maxZ)=>{for(let i=Math.floor(minX/16);i<=Math.floor(maxX/16);i++)for(let j=Math.floor(minZ/16);j<=Math.floor(maxZ/16);j++){const k=i+','+j;if(!cells.has(k))cells.set(k,[]);cells.get(k).push({shape,type});}};
  for(const q of c.circles)put(q,'circle',q.x-q.r,q.x+q.r,q.z-q.r,q.z+q.r);
  for(const q of c.rects){const rx=Math.abs(q.ax*q.hx)+Math.abs(q.bx*q.hz),rz=Math.abs(q.az*q.hx)+Math.abs(q.bz*q.hz);put(q,'rect',q.cx-rx,q.cx+rx,q.cz-rz,q.cz+rz);}
  for(const q of c.segs)put(q,'seg',Math.min(q.ax,q.bx)-.08,Math.max(q.ax,q.bx)+.08,Math.min(q.az,q.bz)-.08,Math.max(q.az,q.bz)+.08);
  index={key,cells};indexes.set(world,index);
 }
 for(let i=Math.floor((x-r)/16);i<=Math.floor((x+r)/16);i++)for(let j=Math.floor((z-r)/16);j<=Math.floor((z+r)/16);j++)for(const {shape:q,type}of index.cells.get(i+','+j)||[]){
  if(type==='circle'&&Math.hypot(x-q.x,z-q.z)<q.r+r)return true;
  if(type==='rect'){const dx=x-q.cx,dz=z-q.cz;if(Math.abs(dx*q.ax+dz*q.az)<q.hx+r&&Math.abs(dx*q.bx+dz*q.bz)<q.hz+r)return true;}
  if(type==='seg'){const dx=q.bx-q.ax,dz=q.bz-q.az,t=Math.max(0,Math.min(1,((x-q.ax)*dx+(z-q.az)*dz)/(dx*dx+dz*dz||1)));if(Math.hypot(x-q.ax-t*dx,z-q.az-t*dz)<r+.08)return true;}
 }
 return false;
}
