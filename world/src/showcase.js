// A single world-time timeline: no wall-clock timers can skip a scene during loading.
export const SHOWCASE_SCENES = [
  [0,'golden','film'],[37,'morning','film'],[38,'golden','oil'],
  [39,'golden','film'],[42,'golden','watercolor'],[43,'dusk','oil'],
  [21,'morning','film'],[34,'golden','paper'],[24,'golden','toy'],
  [18,'dusk','film'],[19,'night','oil'],[26,'villageDusk','film'],[31,'night','film'],[45,'morning','film'],
  [30,'night','film'],[27,'morning','oil'],[32,'golden','clean'],
  [29,'golden','film'],[33,'dusk','pixel'],[54,'golden','film'],
  [57,'morning','oil'],[59,'night','film'],[62,'morning','film'],
  [67,'rain','film','summer','drizzle'],[69,'golden','oil'],
  [73,'golden','film'],[76,'morning','paper'],[80,'golden','film'],
  [83,'morning','film','winter'],[85,'night','film','winter'],
  [87,'golden','oil'],[89,'morning','film'],[92,'golden','film','winter'],
  [93,'dusk','oil'],[94,'golden','film'],[95,'golden','film'],
].map(([shot,mood,style,season='summer',weather='auto'])=>({shot,mood,style,season,weather,seconds:20,move:'cut'}));

export function startShowcase(app) {
  app.timeline.stop();app.game.exit();app.director.auto=false;
  const cover=document.createElement('div');
  cover.id='showcaseCover';
  cover.style.cssText='position:fixed;inset:0;z-index:10000;display:grid;place-items:center;background:#24332eee;color:#fff6dc;font:20px system-ui;text-align:center';
  const button=document.createElement('button');
  button.textContent='▶ Play SP Creek showcase';
  button.style.cssText='padding:24px;border:0;border-radius:16px;background:#efbd71;color:#302819;font:inherit;cursor:pointer';
  const box=document.createElement('div');box.append(button);
  const note=document.createElement('p');note.textContent='20 seconds per scene · all locations · styles, weather and day/night · loops automatically';box.append(note);cover.append(box);document.body.append(cover);
  const fade=document.createElement('div');fade.id='showcaseTransition';fade.style.cssText='position:fixed;inset:0;background:#25312d;pointer-events:none;opacity:0;z-index:9998';document.body.append(fade);
  const caption=document.createElement('div');caption.id='showcaseCaption';caption.style.cssText='position:fixed;left:24px;bottom:24px;z-index:9999;color:#fff8df;background:#24332dcc;padding:10px 16px;border-radius:12px;font:16px system-ui;pointer-events:none';
  const clips=SHOWCASE_SCENES.map(c=>({...c}));
  const previous=app.timeline.onClip;
  app.timeline.onClip=(i)=>{
    previous(i);const c=clips[i];if(!c)return;
    app.applyStyle(c.style);app.setSeason(c.season);app.setWeather(c.weather);
    // Mood blending is handled by Timeline; the short dissolve hides the location cut.
    fade.getAnimations().forEach(a=>a.cancel());fade.animate([{opacity:1},{opacity:0}],{duration:900,fill:'none'});
    caption.textContent=`${i+1}/${clips.length} · ${app.director.shots[c.shot].name} · ${c.style==='film'?'Animated 3D':c.style} · ${c.mood}`;
  };
  const play=()=>{app.timeline.stop();app.timeline.clips=clips;app.timeline.loop=true;app.director.auto=false;app.timeline.start();};
  button.onclick=()=>{
    cover.remove();document.body.append(caption);
    for(const sel of ['#panel','#hud'])document.querySelector(sel)?.style.setProperty('display','none');
    document.body.style.cursor='none';dispatchEvent(new Event('resize'));play();
  };
  addEventListener('keydown',e=>{if(e.key==='Home'){e.preventDefault();play();}});
  app.showcase={clips,play,get playing(){return app.timeline.playing;}};
}

