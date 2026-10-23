import { CAST,makeCharacter,randomTownsfolk } from '../src/characters.js';
import { familySign } from '../src/family.js';
import { STYLES } from '../src/styles.js';

export async function runFamilyTests() {
  const a=window.__app,w=a.world,room=a.saloon,original=a.projectData(),storage=new Map(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]));
  const results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  const visible=o=>{while(o){if(!o.visible)return false;o=o.parent;}return true;};
  const toggle=on=>{const el=document.querySelector('#familyMode');el.checked=on;el.dispatchEvent(new Event('change'));};
  const geometry=p=>{const values=[];p.g.traverse(o=>{if(o.isMesh)values.push(o.geometry.attributes.position.count);});return JSON.stringify(values);};
  const restart=a.audio.restartMusic;a.audio.restartMusic=()=>{};
  try {
    check(room.adultProps.length===0,'The café contains no alternate adult props');
    check(room.familyProps.some(o=>o.userData.boardGame),'Checkers boards present');
    check(room.people.some(p=>p.kind==='owner')&&room.people.some(p=>p.kind==='pianist')&&room.people.some(p=>p.kind==='singer'),'Owner, piano, singer and guests retained');
    check(room.lights.length===2,'No extra interior point lights');
    for(const on of [false,true]){
      toggle(on);check(JSON.parse(localStorage.getItem('dh.familyChoice'))===on,'Switch saves the actual choice');
      check(room.familyProps.every(visible),`Café tea, cakes and games stay visible with switch ${on}`);
      check(w.windowMats.filter(m=>m.userData.facadeSpec?.sign==='THE GOLDEN SPUR SALOON').every(m=>m.userData.displaySign==='HONEY BUN CAFÉ'),'Honey Bun Café permanent');
      check(a.life.signs.every(s=>!(/saloon|guns/i.test(s.text))),'Blade signs permanently friendly');
      for(const [from,to]of [['GUNSMITH','TOY SHOP'],['UNDERTAKER','BAKERY'],['THE GOLDEN SPUR CAFÉ','HONEY BUN CAFÉ']])check(familySign(from,on)===to,`${from} permanently safe`);
    }
    const e=w.placeBuilding({type:'shop',x:-35,z:-100,sign:'THE GOLDEN SPUR SALOON',signCustom:true});
    check(e.additions.windowMats[0].userData.displaySign==='HONEY BUN CAFÉ','Legacy custom sign is displayed safely');w.removeBuilding(e);
    for(const style of Object.keys(STYLES)){a.applyStyle(style);toggle(false);check(room.familyProps.every(visible)&&room.m.cloth.map,`${style}: permanent café and cheerful tablecloth`);}
    for(const [role,outfit]of Object.entries(CAST)){const p=makeCharacter(outfit);check(!Object.keys(p.outfit).some(k=>/gun|holster|weapon|rifle|pistol/i.test(k)),`${role}: no weapon outfit`);p.g.traverse(o=>{if(o.isMesh)o.geometry.dispose();});}
    const p=makeCharacter(CAST.sheriff),q=makeCharacter({...CAST.sheriff,gun:true,holster:true});check(p.outfit.badge&&geometry(p)===geometry(q),'Sheriff has a badge and no firearm geometry');for(const person of [p,q])person.g.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
    check(!Object.keys(randomTownsfolk()).some(k=>/gun|holster|weapon/i.test(k)),'Random townsfolk remain unarmed');
    toggle(false);const saved=JSON.stringify(a.projectData());a.loadProject(JSON.parse(saved));check(JSON.stringify(a.projectData())===saved&&room.familyProps.every(visible),'Off choice round trips with café intact');
    const preset=[...document.querySelectorAll('#videoPresets button')].find(b=>b.textContent.includes('Rainy night at the Honey Bun Café'));preset.click();check(a.timeline.playing,'Renamed existing video preset still plays');a.timeline.stop();
    check(a.director.shots[18].name==='At the Counter'&&a.director.shots[19].name==='Board Games','Shot names updated without renumbering');
    check(a.audio.ctx===null,'Tests do not activate sound');return {passed:results.length,results};
  }finally{a.audio.restartMusic=restart;a.loadProject(original);localStorage.clear();for(const[k,v]of storage)localStorage.setItem(k,v);}
}
