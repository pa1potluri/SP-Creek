import * as THREE from 'three';
import { CAST, makeCharacter, randomTownsfolk } from '../src/characters.js';
import { runAreaShotTests } from './area-shots.js';
export function runNamesTourTests() {
  const a=window.__app,results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  for(const [role,outfit] of Object.entries(CAST)) {
    for(const o of [outfit,randomTownsfolk(role)]) {
      const p=makeCharacter(o);let safe=true;
      p.g.traverse(n=>{if(/gun|holster|weapon|pistol|rifle|knife|sword/i.test(n.name))safe=false;});
      check(safe&&!Object.keys(o).some(k=>/gun|holster|weapon|pistol|rifle|knife|sword/i.test(k)),`${role}: outfit and all parts safe`);
      p.g.traverse(n=>{if(n.geometry)n.geometry.dispose();});
    }
  }
  check(!CAST.sheriff&&CAST.mayor.label==='Mayor'&&CAST.mayor.flower&&!CAST.mayor.badge,'Mayor has bowler and flower');
  check(randomTownsfolk('sheriff').role==='mayor','Legacy café guest resolves to Mayor');
  for(const [i,name] of [[2,'Café to Town Hall'],[17,'Into the Honey Bun Café'],[18,'At the Counter'],[19,'Board Game Table']])check(a.director.shots[i].name===name,`Shot ${i} label`);
  const out={pos:new THREE.Vector3(),look:new THREE.Vector3()};
  for(let i=30;i<35;i++) {const s=a.director.shots[i];check(s.group==='Grand tour'&&s.duration===12,`Tour ${i}: group and length`);for(let j=0;j<=100;j++){s.sample(j/100*s.duration,out);if(!Number.isFinite(out.pos.length()))throw Error('Invalid tour curve');}}
  // Reuse the vegetation/prop box audit for every new tour curve.
  const originals=[a.director.shots[26],a.director.shots[27]];
  try {for(let i=30;i<35;i++){a.director.shots[26]=a.director.shots[i];a.director.shots[27]=a.director.shots[i];results.push(...runAreaShotTests().results);}}finally{[a.director.shots[26],a.director.shots[27]]=originals;}
  check(a.audio.ctx===null,'Audio remains locked');return {passed:results.length,results};
}
