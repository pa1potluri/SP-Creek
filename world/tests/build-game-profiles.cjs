const fs=require('fs'),path=require('path'),crypto=require('crypto');
const source='world/assets/characters/pipeline-test',dest='world/assets/characters/pipeline-game';fs.mkdirSync(dest,{recursive:true});
const entries=JSON.parse(fs.readFileSync(path.join(source,'residents/manifest.json'))),out=[];
for(const entry of [...entries,{id:'pavi',count:258816}]){
 const hero=entry.id==='pavi',profile=JSON.parse(fs.readFileSync(path.join(source,`profiles/${hero?'main-character':entry.id}.json`))),input=fs.readFileSync(path.join(source,hero?'hero/head-points.bin':`residents/${entry.id}.bin`)),stride=hero?1:4;
 if(input.length!==entry.count*20)throw Error('Source count mismatch '+entry.id);
 const output=Buffer.alloc(Math.ceil(entry.count/stride)*20);for(let i=0,k=0;i<entry.count;i+=stride,k++)input.copy(output,k*20,i*20,i*20+20);
 fs.writeFileSync(path.join(dest,entry.id+'.bin'),output);out.push({id:entry.id,count:output.length/20,sourceCount:entry.count,stride,skin:profile.palette?.skin,sha256:crypto.createHash('sha256').update(output).digest('hex')});
}
fs.writeFileSync(path.join(dest,'manifest.json'),JSON.stringify({format:'face-points-v1',bytesPerPoint:20,profiles:out},null,2));console.log(out.length+' profiles, '+out.reduce((n,e)=>n+e.count*20,0)+' bytes');
