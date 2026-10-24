import * as THREE from 'three';
import { HAMLET } from '../src/hamlet.js';
import { terrainHeight,walkHeight,pondRadius } from '../src/world.js';
import { STYLES } from '../src/styles.js';

export async function runCloudWaterTests() {
  const a=window.__app,w=a.world,at=a.atmos,h=w.hamlet,p=h.pond,original=a.projectData();
  const saved=new Map(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]));
  const results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  const slider=(name,value)=>{const el=document.querySelector(`[data-atmos="${name}"]`);el.value=value;el.dispatchEvent(new Event('input'));};
  const mood=(key,time=40)=>{at.setPreset(key,true);at.update(0,time,a.camera);w.update(0,time,a.camera);};
  const renderer=at.renderer,oldTarget=renderer.getRenderTarget();
  const rt=new THREE.WebGLRenderTarget(96,96),scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-100,100,100,-100,0.1,500);
  camera.position.set(0,200,0);camera.up.set(0,0,-1);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
  const sun=new THREE.DirectionalLight(0xffffff,3),point=new THREE.PointLight(0xffffff,1200,300,1);
  sun.position.set(20,100,30);point.position.set(0,30,0);point.visible=false;scene.add(sun,point,new THREE.HemisphereLight(0xffffff,0x444444,0.2));
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshLambertMaterial({color:0xdddddd}));plane.rotation.x=-Math.PI/2;scene.add(plane);
  const render=()=>{renderer.setRenderTarget(rt);renderer.render(scene,camera);const bytes=new Uint8Array(96*96*4);renderer.readRenderTargetPixels(rt,0,0,96,96,bytes);renderer.setRenderTarget(oldTarget);return bytes;};
  const equal=(a,b)=>a.every((v,i)=>v===b[i]);
  let walk=null,walkStart=null;
  try {
    a.loadProject({...original,layout:[]});w.setHamlet(true);w.wind=1;
    slider('cloudShadows',0.6);slider('clouds',1);slider('rain',0);mood('golden');
    const u=at.cloudUniforms,base=u.uCloudAmount.value;
    check(base>0 && base<1,'Golden hour has soft cloud shadows by default');
    const first=render();mood('golden',110);const moved=render();mood('golden',40);const repeated=render();
    check(equal(first,repeated),'Same absolute time reproduces exact rendered cloud pixels after seeking');
    check(!equal(first,moved),'Cloud shadow field visibly drifts over 70 seconds');
    slider('cloudShadows',0);mood('golden');const none=render();check(!equal(first,none) && u.uCloudAmount.value===0,'Cloud shadows slider zero removes projected shading');
    slider('cloudShadows',1);mood('golden');check(u.uCloudAmount.value>base,'Cloud shadows slider controls strength');
    slider('clouds',0);mood('golden');check(u.uCloudAmount.value===0,'Cloud amount zero removes shadows');
    slider('clouds',0.5);mood('golden');const half=u.uCloudAmount.value;slider('clouds',1);mood('golden');check(u.uCloudAmount.value>half,'Shadows follow the Clouds slider');
    mood('morning');check(u.uCloudAmount.value>0,'Morning casts cloud shadows');
    mood('night');check(u.uCloudAmount.value===0,'Night has no cloud shadows');
    mood('rain');check(u.uCloudAmount.value===0,'Heavy rain has no extra cloud shadows');
    slider('rain',0.9);mood('golden');check(u.uCloudAmount.value===0,'Extra heavy rain also disables cloud shadows');slider('rain',0);
    w.wind=0;mood('golden',10);const calm=render();mood('golden',100);check(equal(calm,render()),'Zero wind holds the cloud field still');
    w.wind=-1;mood('golden',40);const reverse=render();w.wind=1;mood('golden',40);check(!equal(reverse,render()),'Wind sign reverses cloud drift');
    sun.intensity=0;point.visible=true;slider('cloudShadows',0);mood('golden');const lamp=render();slider('cloudShadows',1);mood('golden');check(equal(lamp,render()),'Cloud shading leaves point lights and ambient light unchanged');
    point.visible=false;sun.intensity=3;
    const originalMat=plane.material;plane.material=w.water.material;
    camera.left=-18;camera.right=18;camera.top=18;camera.bottom=-18;camera.position.set(0,25,30);camera.up.set(0,1,0);camera.lookAt(0,0,0);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
    mood('golden',25);const waterFirst=render();mood('golden',90);const waterMoved=render();mood('golden',25);
    check(equal(waterFirst,render()),'Water ripple/reflection pixels reproduce at the same absolute time');
    check(!equal(waterFirst,waterMoved),'Water ripples, current and foam animate');
    check(w.water.material.userData.cloudLighting && w.waterUniforms.uWaterFoam.value.filter(v=>v.z>0).length===16,'Water receives cloud shadows and foam sources at mill, bridge and dock');
    const golden=w.water.material.color.clone(),reflection=w.waterUniforms.uWaterHorizon.value.clone(),foam=w.waterUniforms.uWaterFoamColor.value.clone();
    mood('night');check(!w.water.material.color.equals(golden) && !w.waterUniforms.uWaterHorizon.value.equals(reflection),'River follows golden sky and moonlit night');
    check(!w.waterUniforms.uWaterFoamColor.value.equals(foam),'Foam tint follows the mood instead of glowing white at night');
    check(p.water.material.userData.waterUniforms.uWaterSky===w.waterUniforms.uWaterSky && p.water.material.color.equals(w.water.material.color),'Pond shares the river lighting and reflection system');
    for(const style of Object.keys(STYLES)) {
      a.applyStyle(style);mood('golden',25);render();
      check(w.waterUniforms.uWaterDetail.value===(w.textureSet==='flat'?0.35:1),`${style}: water compiles and detail follows the style`);
    }
    plane.material=originalMat;
    check(p.obj.visible && w.colliders.water.includes(p.area) && w._reserved(HAMLET.pond.x,HAMLET.pond.z),'Pond exists with a water collider and reserved area');
    check(terrainHeight(p.pad.x,p.pad.z)<p.pad.y-1.9,'Pond has a lowered bowl beneath its surface');
    check(!w.walkables.includes(p.water) && p.water.geometry.attributes.position.count>90,'Water is a shaped surface, not walkable ground');
    check(p.obj.children.some(o=>o.material===p.reeds) && p.obj.children.length>=6,'Merged reeds, lily pads and dock are present');
    check(Math.abs(walkHeight(p.floor.cx,p.floor.cz)-p.floor.y)<1e-6 && !a.game._deepWater(p.floor.cx,p.floor.cz,p.floor.y),'Dock is a raised walkable floor over water');
    check(a.game._deepWater(p.pad.x+4,p.pad.z,p.pad.y),'Deep pond water blocks play mode');
    a.game.pos.set(p.pad.x+4,terrainHeight(p.pad.x+4,p.pad.z-12),p.pad.z-12);
    for(let i=0;i<250;i++)a.game._move(0,0.05,0.35);
    check(!a.game._deepWater(a.game.pos.x,a.game.pos.z,a.game.pos.y) && a.game.pos.z<p.pad.z-2,'Player can wade at the edge but cannot cross the deep pond');
    let cleared=0;const matrix=new THREE.Matrix4();
    for(const item of w.plantInstances)for(let i=0;i<item.mesh.count;i++) {
      const x=item.matrices[i*16+12],z=item.matrices[i*16+14];
      if(pondRadius(x,z)<1){item.mesh.getMatrixAt(i,matrix);check(matrix.getMaxScaleOnAxis()===0,'Natural vegetation instance cleared from water');cleared++;}
    }
    check(cleared>0,'Pond clearing tested against actual original vegetation');
    walk=a.life.hamletWalkers[0];walkStart=walk.pos.clone();walk.leaveSeat();walk.endChat();
    walk.pos.set(p.pad.x-16,0,p.pad.z);walk.target=new THREE.Vector3(p.pad.x+16,0,p.pad.z);walk.yaw=Math.PI/2;
    let arrived=false;
    for(let i=0;i<3000;i++){if(walk._go(0.1)){arrived=true;break;}if(w.inPond(walk.pos.x,walk.pos.z))throw Error('Walker entered pond');}
    check(arrived && walk.pos.x>p.pad.x+14,'Walker takes a dry route around the pond to the opposite bank');
    // Restore the walker before the style checks yield to live animation.
    walk.pos.copy(walkStart);walk.state='wait';walk.target=null;walk.wait=1;
    const physics={water:w.colliders.water.length,circles:w.colliders.circles.length,floors:w.floors.length,walkables:w.walkables.length};
    w.setHamlet(false);check(!p.obj.visible && !p.bank.visible && !w.colliders.water.includes(p.area) && !w.inPond(p.pad.x,p.pad.z),'Hamlet off removes pond scenery, basin and water collision');
    w.setHamlet(true);check(w.colliders.water.length===physics.water && w.colliders.circles.length===physics.circles && w.floors.length===physics.floors && w.walkables.length===physics.walkables,'Pond toggle restores physics exactly without duplicates');
    slider('cloudShadows',0.35);const project=JSON.stringify(a.projectData());a.loadProject(JSON.parse(project));
    check(JSON.stringify(a.projectData())===project && JSON.parse(localStorage.getItem('dh.cloudShadows'))===0.35,'Cloud shadow control persists in projects and localStorage');
    // Stress the real panorama rim with white paint over black, avoiding cloud/terrain edges.
    const skyRT=new THREE.WebGLRenderTarget(256,128),white=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);
    white.needsUpdate=true;let skyEdgeWorst=0;
    try {
      const skyScene=new THREE.Scene();skyScene.background=new THREE.Color(0);
      const skyCam=new THREE.PerspectiveCamera(50,2,0.1,4000),pixels=new Uint8Array(256*128*4);
      for(const style of Object.keys(STYLES)) {
        a.applyStyle(style);await new Promise(resolve=>requestAnimationFrame(resolve));mood('golden');
        const backdrop=at.scene.children.find(o=>o.geometry?.type==='CylinderGeometry'&&o.material?.map&&!o.material.fog);
        if(!backdrop)throw Error('Missing painted panorama');
        const probe=backdrop.clone();probe.position.set(0,2,0);probe.material=backdrop.material.clone();
        probe.material.onBeforeCompile=backdrop.material.onBeforeCompile;probe.material.map=white;probe.material.color.set(0xffffff);probe.material.opacity=1;skyScene.add(probe);
        try {
          for(const key of Object.keys(at.presets))for(const view of [{name:'moon',height:9,yaw:140,season:'winter'},{name:'rainbow',height:9,yaw:68,season:'autumn'},{name:'balloon',height:35,yaw:250,season:'summer'}]) {
            a.setSeason(view.season);mood(key);
            // Put the cylinder's curved rim inside the top half of each upward-looking frame.
            const pitch=Math.atan2(2+backdrop.geometry.parameters.height/2-view.height,800)-0.30,yaw=view.yaw*Math.PI/180;
            skyCam.position.set(0,view.height,0);skyCam.lookAt(Math.sin(yaw)*Math.cos(pitch),view.height+Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));skyCam.updateMatrixWorld(true);
            renderer.setRenderTarget(skyRT);renderer.render(skyScene,skyCam);renderer.readRenderTargetPixels(skyRT,0,0,256,128,pixels);renderer.setRenderTarget(oldTarget);
            let worst=0;
            for(let y=64;y<127;y++){let delta=0;for(let x=8;x<248;x++)for(let c=0;c<3;c++)delta+=Math.abs(pixels[(y*256+x)*4+c]-pixels[((y+1)*256+x)*4+c]);worst=Math.max(worst,delta/(240*3));}
            skyEdgeWorst=Math.max(skyEdgeWorst,worst);
            check(worst<10,`${style}/${key}/${view.name}/${view.season}: upward top rows have no sharp brightness step (${worst.toFixed(2)}/255)`);
          }
        } finally {skyScene.remove(probe);probe.material.dispose();}
      }
    } finally {renderer.setRenderTarget(oldTarget);skyRT.dispose();white.dispose();}
    check(a.audio.ctx===null,'Tests never start sound');
    return {passed:results.length,clearedPlants:cleared,skyEdgeWorst,results};
  } finally {
    if(walk&&walkStart){walk.pos.copy(walkStart);walk.state='wait';walk.target=null;walk.wait=1;}
    renderer.setRenderTarget(oldTarget);rt.dispose();plane.geometry.dispose();
    if(plane.material!==w.water.material)plane.material.dispose();
    a.loadProject(original);localStorage.clear();for(const[k,v]of saved)localStorage.setItem(k,v);
  }
}
