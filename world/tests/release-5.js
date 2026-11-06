export async function runRelease5Tests(){
 const a=window.__app,c=a.cottage,results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
 const before=c.state;
 try{
  check(c.home?.cottage===true,'Player cottage is built as its own friendly home');
  check(!a.world.layout().some(e=>e.sign==='MY COTTAGE'),'Cottage stays out of shared Build layouts');
  c.setWall((before.wall+1)%4);check(c.state.wall!==before.wall,'Wall colour choice rebuilds the cottage');
  c.setRoof((before.roof+1)%4);c.setDoor((before.door+1)%4);
  check(c.home.obj.getObjectByName('My Cottage chosen door'),'Chosen door has its own colour panel');
  c.setFlowers(true);c.setBench(true);
  const nearby=a.world.props.filter(p=>Math.abs(p.x-c.home.spec.x)<7&&Math.abs(p.z-c.home.spec.z)<7);
  check(nearby.some(p=>p.type==='flowerBox')&&nearby.some(p=>p.type==='gardenBench'),'Flower boxes and bench reuse safe Build pieces');
  check(a.audio.ctx===null,'Cottage choices never start sound');
  return {passed:results.length,results};
 } finally {c.setWall(before.wall);c.setRoof(before.roof);c.setDoor(before.door);c.setFlowers(before.flowers);c.setBench(before.bench);}
}
