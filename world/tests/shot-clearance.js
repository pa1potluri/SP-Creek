import * as THREE from 'three';
import { terrainHeight, walkHeight } from '../src/world.js';

// Split merged props into connected pieces so a whole room's AABB is never a solid wall.
function pieces(geometry) {
  const p=geometry.attributes.position,n=p.count,parent=Int32Array.from({length:n},(_,i)=>i),seen=new Map();
  const find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
  const join=(a,b)=>{parent[find(a)]=find(b);};
  for(let i=0;i<n;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*10000)).join(',');if(seen.has(key))join(i,seen.get(key));else seen.set(key,i);}
  const index=geometry.index;
  for(let i=0;i<(index?index.count:n);i+=3){const a=index?index.getX(i):i;join(a,index?index.getX(i+1):i+1);join(a,index?index.getX(i+2):i+2);}
  const boxes=new Map(),v=new THREE.Vector3();
  for(let i=0;i<n;i++){const key=find(i);if(!boxes.has(key))boxes.set(key,new THREE.Box3());boxes.get(key).expandByPoint(v.fromBufferAttribute(p,i));}
  return [...boxes.values()];
}

export function runShotClearanceTests() {
  const a=window.__app,w=a.world,original=a.projectData(),d=a.director,cache=new Map(),solids=[],meshes=[],buildingVolumes=[],buildingRoots=new Set(),cutouts=[],alphaPixels=new WeakMap();
  const visible=o=>{while(o){if(!o.visible)return false;o=o.parent;}return true;};
  const insideRay=new THREE.Raycaster(),insideDirection=new THREE.Vector3(0.357,0.529,0.77).normalize(),normalMatrix=new THREE.Matrix3(),normal=new THREE.Vector3(),auditMaterial=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
  const furniture=new Set(Object.values(a.cafe.m)),matrix=new THREE.Matrix4(),size=new THREE.Vector3();
  try {
    a.loadProject({...original,layout:[]});a.applyStyle('film');w.root.updateMatrixWorld(true);
    w.root.traverse(m=>{
      if(!m.isMesh||!visible(m)||m===w.ground||m===w.water)return;
      const materials=[].concat(m.material);
      const spec=materials.find(t=>t.userData.facadeSpec)?.userData.facadeSpec;
      if(spec&&!buildingRoots.has(m.parent)) {
        const g=m.parent,depth=spec.depth??12,width=spec.w;
        buildingRoots.add(g);
        const base=new THREE.Vector3().setFromMatrixPosition(g.matrixWorld).y,top=base+(spec.floors===2?7.2:spec.church?7:4.6);
        const add=(x,z,hx,hz)=>buildingVolumes.push({...w._rectOf(g,x,z,hx,hz),base,top});
        if(spec.church)add(0,0,width/2,8.2);
        else if(spec.interior){const hx=width/2-0.275;for(const side of [-1,1])add(side*hx,-depth/2-0.15,0.125,depth/2);add(0,-depth-0.025,width/2,0.125);for(const side of [-1,1])add(side*(width/2+0.95)/2,0,(width/2-0.95)/2,0.15);}
        else add(0,-depth/2-0.075,width/2,depth/2+0.15);
      }
      // Cutouts have no solid box, but their painted opaque pixels can obstruct a view.
      if(materials.every(t=>t.alphaTest>0)) {
        m.geometry.computeBoundingBox();
        const add=transform=>{const proxy=new THREE.Mesh(m.geometry,m.material);proxy.matrixAutoUpdate=false;proxy.matrixWorld.copy(transform);cutouts.push({mesh:proxy,box:m.geometry.boundingBox.clone().applyMatrix4(transform)});};
        if(m.isInstancedMesh){for(let i=0;i<m.count;i++){m.getMatrixAt(i,matrix);if(matrix.getMaxScaleOnAxis()>0)add(matrix.clone().premultiply(m.matrixWorld));}}else add(m.matrixWorld);
        return;
      }
      if(materials.every(t=>t.opacity<0.5||t.userData.waterUniforms))return;
      m.geometry.computeBoundingBox();m.geometry.boundingBox.getSize(size);
      if(Math.max(size.x,size.y,size.z)>180)return;
      if(!cache.has(m.geometry))cache.set(m.geometry,pieces(m.geometry));
      const parts=cache.get(m.geometry),isFurniture=materials.some(t=>furniture.has(t));
      const normals=m.geometry.attributes.normal;
      const surface=normals&&Array.from({length:normals.count},(_,i)=>normals.getY(i)).every(y=>y>0.5);
      const add=transform=>{const proxy=new THREE.Mesh(m.geometry,auditMaterial);proxy.matrixAutoUpdate=false;proxy.matrixWorld.copy(transform);for(const local of parts){local.getSize(size);const volume=!surface&&Math.min(size.x,size.y,size.z)>0.025;const box=local.clone().applyMatrix4(transform);solids.push({box,volume,furniture:isFurniture,proxy,source:m.geometry.type});}};
      if(m.isInstancedMesh){for(let i=0;i<m.count;i++){m.getMatrixAt(i,matrix);if(matrix.getMaxScaleOnAxis()>0)add(matrix.clone().premultiply(m.matrixWorld));}}else add(m.matrixWorld);
      const box=new THREE.Box3().setFromObject(m);meshes.push({mesh:m,box});
    });
    if(buildingVolumes.length<10||solids.length<100||!solids.some(s=>s.furniture))throw Error('Missing building, prop or furniture audit geometry');
    const opaqueHit=hit=>{
      const material=Array.isArray(hit.object.material)?hit.object.material[hit.face.materialIndex]:hit.object.material;
      const texture=material.map;
      if(!material.alphaTest||!texture||!hit.uv)return true;
      const image=texture.image;
      if(!alphaPixels.has(image)){const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const context=canvas.getContext('2d');context.drawImage(image,0,0);alphaPixels.set(image,context.getImageData(0,0,canvas.width,canvas.height));}
      const pixels=alphaPixels.get(image),uv=hit.uv.clone();texture.updateMatrix();texture.transformUv(uv);
      const x=Math.min(pixels.width-1,Math.max(0,Math.floor(uv.x*pixels.width))),y=Math.min(pixels.height-1,Math.max(0,Math.floor(uv.y*pixels.height)));
      return pixels.data[(y*pixels.width+x)*4+3]/255*material.opacity>=material.alphaTest;
    };
    const state={pos:new THREE.Vector3(),look:new THREE.Vector3()},ray=new THREE.Raycaster(),direction=new THREE.Vector3(),results=[];
    ray.near=0;ray.far=1;
    for(let index=0;index<d.shots.length;index++) {
      const shot=d.shots[index],r={index,name:shot.name,samples:201,inside:0,furniture:0,ground:0,blocked:0,maxBlockedRun:0,minGround:Infinity,minFurniture:Infinity,firstBad:null};let run=0;
      for(let i=0;i<=200;i++) {
        shot.sample(shot.duration*i/200,state);const p=state.pos;
        const ground=p.y-Math.max(terrainHeight(p.x,p.z),walkHeight(p.x,p.z));r.minGround=Math.min(r.minGround,ground);
        let inside=buildingVolumes.some(b=>{const x=p.x-b.cx,z=p.z-b.cz;return p.y>b.base&&p.y<b.top&&Math.abs(x*b.ax+z*b.az)<b.hx&&Math.abs(x*b.bx+z*b.bz)<b.hz;}),nearFurniture=false;
        for(const s of solids){const distance=s.box.distanceToPoint(p);if(s.volume&&distance<0.001){insideRay.set(p,insideDirection);const hit=insideRay.intersectObject(s.proxy,false)[0];if(hit&&normal.copy(hit.face.normal).applyMatrix3(normalMatrix.getNormalMatrix(s.proxy.matrixWorld)).dot(insideDirection)>0){inside=true;if(!r.firstSolid)r.firstSolid={source:s.source,box:[s.box.min.toArray(),s.box.max.toArray()]};}}if(s.furniture){r.minFurniture=Math.min(r.minFurniture,distance);if(distance<0.6)nearFurniture=true;}}
        if(inside)r.inside++;if(nearFurniture)r.furniture++;if(ground<1-1e-5)r.ground++;
        direction.copy(state.look).sub(p).normalize();ray.set(p,direction);
        const nearby=[...meshes,...cutouts].filter(m=>m.box.distanceToPoint(p)<1.01).map(m=>m.mesh);
        const forward=ray.intersectObjects(nearby,false).find(opaqueHit),blocked=forward&&forward.distance<1;
        if(blocked&&!r.firstBlock)r.firstBlock={distance:forward.distance,source:forward.object.geometry.type,box:[new THREE.Box3().setFromObject(forward.object).min.toArray(),new THREE.Box3().setFromObject(forward.object).max.toArray()]};
        if(blocked){r.blocked++;run++;r.maxBlockedRun=Math.max(r.maxBlockedRun,run);}else run=0;
        if(!r.firstBad&&(inside||nearFurniture||ground<1||run>5))r.firstBad={sample:i,pos:p.toArray(),inside,nearFurniture,ground};
      }
      r.failed=!!(r.inside||r.furniture||r.ground||r.maxBlockedRun>5);results.push(r);
    }
    const worst=results.filter(r=>r.failed).sort((a,b)=>(b.inside+b.furniture+b.ground+b.blocked)-(a.inside+a.furniture+a.ground+a.blocked));
    const closestGround=[...results].sort((a,b)=>a.minGround-b.minGround).slice(0,5).map(r=>({index:r.index,name:r.name,metres:r.minGround}));
    const closestFurniture=[...results].sort((a,b)=>a.minFurniture-b.minFurniture).slice(0,3).map(r=>({index:r.index,name:r.name,metres:r.minFurniture}));
    console.log('Shot clearance:',JSON.stringify({shots:results.length,samples:results.length*201,solidPieces:solids.length,buildingVolumes:buildingVolumes.length,cutouts:cutouts.length,worst,closestGround,closestFurniture}));
    if(worst.length)throw Error('Shot clearance failures: '+JSON.stringify(worst));
    if(a.audio.ctx!==null)throw Error('Shot audit started sound');
    return {passed:results.length+1,samples:results.length*201,solidPieces:solids.length,buildingVolumes:buildingVolumes.length,results};
  } finally {auditMaterial.dispose();a.loadProject(original);}
}
