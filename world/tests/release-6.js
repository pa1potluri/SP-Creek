export async function runRelease6Tests(){
 const a=window.__app,book=a.rewardBook,results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 const before=book.state;
 try{
  check(book&&typeof book.visit==='function','Reward book is available to the friendly menu');
  book.visit('tree');book.meetGhost();book.seeViewpoint();
  const state=book.state;
  check(state.visited.includes('tree'),'Discovery Map visits create explorer stamps');
  check(state.ghostsMet>=1,'Friendly ghost greetings are remembered');
  check(state.viewpoint===true,'Balloon valley viewpoint is remembered');
  a.kidsUI.open('Rewards');
  check([...document.querySelectorAll('#kidsPanel .kidsCard')].length===7,'Picture book shows seven calm collectible cards');
  check(document.querySelector('#kidsPanel').textContent.includes('Stars'),'Book includes the star collection');
  check(a.audio.ctx===null,'Reward book never starts sound');
  return {passed:results.length,results};
 } finally {book.restoreForTest(before);a.kidsUI.open('Home');}
}
