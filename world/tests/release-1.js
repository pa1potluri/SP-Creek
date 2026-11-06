import {PLACES} from '../src/explore-ui.js';
export async function runRelease1Tests(){
 const a=window.__app,results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 a.kidsUI.open('Home');
 check(document.querySelector('.kidsWelcome'),'Friendly Home shows the release navigation');
 document.querySelector('.kidsWelcome button').click();
 const regions=[...document.querySelectorAll('.discoveryRegion[data-place]')];
 check(regions.length===PLACES.length,'Discovery Map grows to all existing places');
 const expected=PLACES.map(p=>p[0]);
 check(regions.map(b=>b.dataset.place).every((name,i)=>name===expected[i]),'Map uses the existing safe place destinations');
 for(const region of regions){a.kidsUI.openMap();const marker=[...document.querySelectorAll('.discoveryRegion')].find(b=>b.dataset.place===region.dataset.place);marker.click();check(a.director.mode==='shot','Map marker opens its existing camera route');a.kidsUI.open('Home');document.querySelector('.kidsWelcome button').click();}
 check(a.audio.ctx===null,'Discovery Map never starts sound');
 a.kidsUI.open('Home');
 return {passed:results.length,results};
}
