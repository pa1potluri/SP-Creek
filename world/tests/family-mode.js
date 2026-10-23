import * as THREE from 'three';
import { CAST, makeCharacter, randomTownsfolk } from '../src/characters.js';
import { STYLES } from '../src/styles.js';
import { terrainHeight } from '../src/world.js';

export async function runFamilyTests() {
  const a=window.__app, w=a.world, room=a.saloon, life=a.life, original=a.projectData();
  const storage=new Map(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]));
  const restartMusic=a.audio.restartMusic; a.audio.restartMusic=()=>{};
  const results=[], check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  const toggle=on=>{const c=document.querySelector('#familyMode');c.checked=on;c.dispatchEvent(new Event('change'));};
  const pixel=m=>m.image.toDataURL();
  const geometry=p=>{const out=[];p.g.traverse(o=>{if(o.isMesh)out.push(Array.from(o.geometry.attributes.position.array));});return JSON.stringify(out);};
  const effectiveVisible=o=>{while(o){if(!o.visible)return false;o=o.parent;}return true;};
  try {
    a.loadProject({...original,layout:[],familyMode:false});
    const names={'THE GOLDEN SPUR SALOON':'THE GOLDEN SPUR CAFÉ',GUNSMITH:'TOY SHOP',UNDERTAKER:'BAKERY'};
    const fronts=w.windowMats.filter(m=>names[m.userData.facadeSpec?.sign]);
    check(fronts.length===3,'Three Main Street signs located');
    const normal=fronts.map(m=>({m,sets:m.userData.sets,pixels:Object.fromEntries(Object.entries(m.userData.sets).map(([k,v])=>[k,pixel(v.map)]))}));
    const blades=life.signs.filter(s=>['GUNS','SALOON'].includes(s.originalText));
    const oldBlades=blades.map(s=>s.normalTex);
    const adultObjects=room.adultProps.map(o=>({o,geo:o.geometry,mat:o.material,pos:o.position.toArray()}));
    const roomPeople=room.people.map(p=>p.p);
    check(room.adultProps.length>=20 && room.familyProps.some(o=>o.userData.boardGame),'Alcohol/cards/posters/spittoons tracked and board games built');
    for(const style of Object.keys(STYLES)) {
      console.log('Family mode:',style); a.applyStyle(style); toggle(true);
      check(a.projectData().familyMode && JSON.parse(localStorage.getItem('dh.familyMode'))===true,`${style}: checkbox and saved setting on`);
      for(const {m,pixels} of normal) {
        check(m.userData.displaySign===names[m.userData.facadeSpec.sign],`${style}: ${m.userData.displaySign}`);
        check(pixel(m.map)!==pixels[w.textureSet],`${style}: rendered sign pixels changed`);
      }
      check(blades.every(s=>s.text===(s.originalText==='GUNS'?'TOYS':'CAFÉ') && s.pivot.children.filter(o=>o.material?.map).every(o=>o.material.map===s.familyTex)),`${style}: both sides of blade signs swapped`);
      check(room.adultProps.every(o=>!effectiveVisible(o)) && room.familyProps.every(effectiveVisible),`${style}: all interior replacements visible, adult props hidden`);
      const visibleGlass=[];room.g.traverse(o=>{if(o.material===room.m.glass && effectiveVisible(o))visibleGlass.push(o);});
      check(!visibleGlass.length,`${style}: no drinking glasses visible`);
      check(room.people.every((p,i)=>p.p===roomPeople[i]) && room.people.some(p=>p.kind==='bartender') && room.people.some(p=>p.kind==='pianist') && room.people.some(p=>p.kind==='singer'),`${style}: café owner, pianist, singer and guests retained`);
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      toggle(false);
      check(room.adultProps.every(effectiveVisible) && room.familyProps.every(o=>!o.visible),`${style}: original interior restored`);
      check(normal.every(({m,sets})=>m.userData.sets===sets && m.map===sets[w.textureSet].map),`${style}: exact original facade textures restored`);
      check(blades.every((s,i)=>s.text===s.originalText && s.pivot.children.filter(o=>o.material?.map).every(o=>o.material.map===oldBlades[i])),`${style}: exact blade textures restored`);
    }
    check(adultObjects.every(({o,geo,mat,pos})=>o.geometry===geo && o.material===mat && JSON.stringify(o.position.toArray())===JSON.stringify(pos)),'Original furniture props and transforms preserved');
    // Older layouts have no provenance: preserve their text. Explicit defaults can adapt.
    const defaults=w.placeBuilding({type:'brick',x:-175,z:25,sign:'GUNSMITH',signCustom:false});
    const custom=w.placeBuilding({type:'shop',x:-150,z:25,sign:'THE GOLDEN SPUR SALOON'});
    toggle(true);
    check(defaults.additions.windowMats[0].userData.displaySign==='TOY SHOP','Build default signs adapt live');
    check(custom.additions.windowMats[0].userData.displaySign==='THE GOLDEN SPUR SALOON','Existing and explicit user text stays theirs');
    const created=w.placeBuilding({type:'shop',x:-125,z:25,sign:'UNDERTAKER',signCustom:false});
    check(created.additions.windowMats[0].userData.displaySign==='BAKERY','New buildings inherit active family setting');
    const hamlet=w.hamlet.buildings.map(e=>e.obj);
    life.settings.hamlet=0;life.apply();life.settings.hamlet=1;life.apply();
    check(w.hamlet.buildings.every((e,i)=>e.obj===hamlet[i] && e.obj.visible) && life.hamletWalkers.every(p=>p.p.g.visible),'Willow Creek toggle preserves family scene');
    // Exercise the actual sign input: even a typed stock label remains custom.
    document.querySelector('[data-build="shop"]').click();
    const input=document.querySelector('#buildSign');input.value='GUNSMITH';input.dispatchEvent(new Event('input'));
    const x=-100,z=25,y=terrainHeight(x,z),c=document.querySelector('#view');
    a.camera.position.set(x+2,y+50,z+25);a.camera.lookAt(x,y,z);a.camera.updateMatrixWorld(true);
    const p=new THREE.Vector3(x,y,z).project(a.camera),r=c.getBoundingClientRect();
    const ev={clientX:r.left+(p.x+1)*r.width/2,clientY:r.top+(1-p.y)*r.height/2,button:0,bubbles:true};
    for(const type of ['pointerdown','pointerup'])c.dispatchEvent(new PointerEvent(type,ev));
    window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape'}));
    check(w.buildings.at(-1).spec.signCustom && w.buildings.at(-1).additions.windowMats[0].userData.displaySign==='GUNSMITH','Typed sign is protected through UI placement');
    for(const [role,outfit] of Object.entries(CAST)) {
      const person=makeCharacter(outfit),before=geometry(person);
      toggle(false);toggle(true);
      check(!Object.keys(person.outfit).some(k=>/gun|holster|weapon|rifle|pistol/i.test(k)) && before===geometry(person),`${role}: outfit has no weapons; body preserved`);
      person.g.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
    }
    for(let i=0;i<20;i++) check(!Object.keys(randomTownsfolk()).some(k=>/gun|holster|weapon/i.test(k)),`Random townsfolk ${i}: no weapon outfit`);
    const plain=makeCharacter(CAST.sheriff),unsupported=makeCharacter({...CAST.sheriff,gun:true,holster:true});
    check(geometry(plain)===geometry(unsupported) && plain.outfit.badge,'Rig has no firearm/holster implementation; sheriff keeps badge');
    for(const p of [plain,unsupported])p.g.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
    check(!Object.keys(a.game.person.outfit).some(k=>/gun|holster|weapon/i.test(k)) && life.hamletWalkers.every(p=>!Object.keys(p.p.outfit).some(k=>/gun|holster|weapon/i.test(k))),'Player and hamlet outfits have no guns');
    const saved=JSON.stringify(a.projectData());toggle(false);a.loadProject(JSON.parse(saved));
    check(a.projectData().familyMode && room.familyMode && w.familyMode && document.querySelector('#familyMode').checked,'Project restores family mode live');
    check(JSON.stringify(a.projectData())===saved,'Exact family project and custom-sign round trip');
    check(w.buildings.find(e=>e.spec.sign==='GUNSMITH' && e.spec.signCustom).additions.windowMats[0].userData.displaySign==='GUNSMITH','Custom sign survives reload in family mode');
    const preset=[...document.querySelectorAll('#videoPresets button')].find(b=>b.textContent.includes('Golden Spur'));
    preset.click();check(a.timeline.playing && a.projectData().familyMode && room.familyMode,'Golden Spur video preset plays and preserves family setting');a.timeline.stop();
    const old={...original};delete old.familyMode;a.loadProject(old);
    check(!a.projectData().familyMode && !document.querySelector('#familyMode').checked,'Old projects default to original town');
    check(a.audio.ctx===null,'Tests never unlock audio');
    return {passed:results.length,results};
  } finally {
    a.audio.restartMusic=restartMusic;a.loadProject(original);localStorage.clear();for(const [k,v]of storage)localStorage.setItem(k,v);
  }
}
