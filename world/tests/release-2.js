export async function runRelease2Tests(){
 const a=window.__app,stars=a.hiddenStars,results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 check(stars.stars.length===10,'Ten hidden stars are placed');
 check(stars.stars.every((star,i)=>star.name===`Hidden star ${i+1}`),'Each hidden star has a clear landmark identity');
 check(stars.sites.every(([x,z])=>Number.isFinite(a.world.groundY(x,z))&&!a.game._blocked(x,z,.5)&&!a.game._deepWater(x,z,a.world.groundY(x,z))),'Every star is on safe reachable ground');
 check(document.querySelector('#starCounter')?.textContent.includes('0/10'),'The friendly corner counter starts at zero');
 check(stars.collect(0,{isTrusted:false})===false&&!localStorage.getItem('sp-creek.hidden-stars.v1'),'Synthetic clicks never collect or save a star');
 check(a.audio.ctx===null,'Star checks never start sound without a real click');
 return {passed:results.length,results};
}
