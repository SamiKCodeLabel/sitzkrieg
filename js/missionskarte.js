// ---------- Mission auf der Karte: Startzonen und Missionsziele ----------
const markOn=true;   // Markierungen immer an
const OBJ_N={'3x6':3,'3x8':5};
const OBJ_FIXED=RULES.missionsziele.fest;
const OBJ_HOSTS=RULES.missionsziele.felder;
const OBJ_FLEX=RULES.missionsziele.flexibel;
const EXT_TYPES=RULES.felderweiterungen.map(f=>({name:f.name,icon:f.icon}));   // aus js/regeln.js
const EXT_SHY={Stacheldraht:'Stachel&shy;draht',Flugzeugwrack:'Flugzeug&shy;wrack','Abtrünnige':'Abtrün&shy;nige'};
const OBJ_SHY={Transporter:'Trans&shy;porter',Kampfflieger:'Kampf&shy;flieger','Artilleriegeschütz':'Artillerie&shy;geschütz','Flakgeschütz':'Flak&shy;geschütz'};
function missionSetup(){
  const m=window.CUR_MISSION; if(!current||current.error||!m) return null;
  const extMax=Math.min(EXT_MAX[ROWS+'x'+COLS]??3, settings.ext?.[ROWS+'x'+COLS]??3);
  const nExt=Math.floor(mulberry32((current.seed^0xe7c0)>>>0)()*(extMax+1));   // zufällig 0 bis Höchstzahl, fest pro Karte
  const key=current.seed+'|'+ROWS+'x'+COLS+'|'+m.name+'|'+nExt;
  if(current._ms && current._ms.key===key) return current._ms;
  let h=0; for(const ch of m.name) h=(h*31+ch.charCodeAt(0))|0;
  const r=mulberry32((current.seed^h)>>>0);             // gleiche Karte + Mission = gleiche Markierungen
  // Spielkanten: je Spieler 1 Kante (gegenüber) oder 2 Kanten (über Eck, Gegner am gegenüberliegenden Eck).
  // Lange Kanten (oben/unten) können auch nur zur Hälfte gelten. Der Gegner bekommt immer das um 180° gedrehte Gegenstück.
  const opp={left:'right',right:'left',top:'bottom',bottom:'top'}, flipPart={all:'all',start:'end',end:'start'};
  const mirror=x=>({e:opp[x.e],part:flipPart[x.part]});
  let de;
  if(r()<.5){
    // Nie nur die kurzen Kanten: allein gibt es nur lange Kanten (ganz oder zur Hälfte)
    if(!(ROWS===3&&COLS===8)) r();   // Zufallsfolge wie bisher, damit andere Karten gleich bleiben
    de=[{e:r()<.5?'top':'bottom',part:r()<.5?'all':(r()<.5?'start':'end')}];
  } else {
    const h=r()<.5?'left':'right', v=r()<.5?'top':'bottom';
    de=[{e:h,part:'all'},{e:v,part:h==='left'?'start':'end'}];   // lange Kante nur zur Hälfte an der eigenen Ecke -> Ecken gehören eindeutig einem Spieler
  }
  const al=de.map(mirror);
  const edges={de,al}, objectives=[];
  const onEdge=(i,x)=>{ const c=i%COLS, rr=Math.floor(i/COLS);
    const inPart=x.part==='all'||(x.part==='start'?c<COLS/2:c>=COLS/2);
    return ({left:c===0,right:c===COLS-1,top:rr===0&&inPart,bottom:rr===ROWS-1&&inPart})[x.e]; };
  const edgeList=[...de,...al];
  // Missionsziele: Normal 3, Episch 5. Feste Orte der Karte oder flexible Ziele auf passenden Feldern; jedes Ziel nur 1 mal, gut verteilt.
  const nObj=OBJ_N[ROWS+'x'+COLS]||3, info=[];
  const cand=current.pieces.map(p=>{
    const cs=p.cells.map(i=>i%COLS), rs=p.cells.map(i=>Math.floor(i/COLS));
    return {p,cx:cs.reduce((a,b)=>a+b)/cs.length,cy:rs.reduce((a,b)=>a+b)/rs.length,
            fixed:OBJ_FIXED[p.p.key]||null, host:OBJ_HOSTS.includes(p.p.key),
            edge:p.cells.every(i=>edgeList.some(e=>onEdge(i,e)))};
  }).filter(c=>c.fixed||c.host);
  const flexLeft=[...OBJ_FLEX]; for(let i=flexLeft.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [flexLeft[i],flexLeft[j]]=[flexLeft[j],flexLeft[i]]; }
  const used=new Set();
  while(info.length<nObj){
    let best=null, bs=-1e9;
    for(const c of cand){
      if(info.some(o=>o.p===c.p)) continue;
      if(c.fixed&&used.has(c.fixed)) continue;
      if(!c.fixed&&!flexLeft.length) continue;
      const dmin=info.length?Math.min(...info.map(o=>Math.hypot(o.cx-c.cx,o.cy-c.cy))):3;
      const sc=Math.min(dmin,3.2)*10 - (c.edge?8:0) + r()*9 + (c.fixed?2:0);
      if(sc>bs){ bs=sc; best=c; }
    }
    if(!best) break;
    const name=best.fixed||flexLeft.shift(); used.add(name);
    info.push({p:best.p,cx:best.cx,cy:best.cy,name,flex:!best.fixed});
  }
  for(const o of info) objectives.push(o.p);
  // Felderweiterungen: auf Feldern, wo ein flexibles Ziel hätte liegen können, aber keins liegt; jede höchstens 1 mal.
  // Eigener Zufall: mehr Erweiterungen behalten die bisherigen an ihrem Platz.
  const r2=mulberry32((current.seed^0x5eed1)>>>0), exts=[];
  const types=[...EXT_TYPES]; for(let i=types.length-1;i>0;i--){ const j=Math.floor(r2()*(i+1)); [types[i],types[j]]=[types[j],types[i]]; }
  const free=cand.filter(c=>c.host&&!objectives.includes(c.p));
  while(exts.length<nExt&&types.length){
    let best=null, bs=-1e9;
    for(const c of free){
      if(exts.some(e=>e.p===c.p)) continue;
      const others=[...info,...exts], dmin=others.length?Math.min(...others.map(o=>Math.hypot(o.cx-c.cx,o.cy-c.cy))):3;
      const sc=Math.min(dmin,2.5)*10 + r2()*8;
      if(sc>bs){ bs=sc; best=c; }
    }
    if(!best) break;
    exts.push({p:best.p,cx:best.cx,cy:best.cy,t:types.shift()});
  }
  return current._ms={key,edges,objectives,objInfo:info.map(o=>({name:o.name,flex:o.flex,ort:o.p.p.name,cells:o.p.cells})),
    exts:exts.map(e=>({p:e.p,name:e.t.name,icon:e.t.icon,ort:e.p.p.name}))};
}
function renderMapMission(ms,port){
  const box=$('mapmission'), m=window.CUR_MISSION;
  if(!m||!current||current.error){ box.hidden=true; return; }
  box.hidden=false;
  const s0=ms||missionSetup();
  const W={left:'links',right:'rechts',top:'oben',bottom:'unten'};
  const disp=e=>port?({left:'top',right:'bottom',top:'right',bottom:'left'})[e]:e;
  const halfTxt=(x)=>{ if(x.part==='all') return ''; const d=disp(x.e); const vert=d==='left'||d==='right';
    return ' ½'; };
  const txt=list=>list.map(x=>W[disp(x.e)]+halfTxt(x)).join(' + ');
    let t=`🎯 <b>${m.name}</b> · <span class="mm-de">${EMB.de} ${txt(s0.edges.de)}</span> · <span class="mm-al">${EMB.al} ${txt(s0.edges.al)}</span>`;
  $('mm-txt').innerHTML=t;
}
buildPool();
// Größe merken (früher stand sie mit dem Seed in der Adresse); alte Links mit #gross-… / #mittel-… geben noch die Größe vor
const m=location.hash.match(/^#(gross|mittel|klein)-/);
try{ const sz=localStorage.getItem('sitzkrieg-size'); if(!m && (sz==='3x6'||sz==='3x8')) $('size').value=sz; }catch(e){}
if(m){ $('size').value=SIZE_OF[m[1]]; try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){} }
let startTab='gen'; try{ startTab=localStorage.getItem('sitzkrieg-tab')||'gen'; }catch(e){}
// Letzten Stand wiederherstellen (Karte, Armeen, je Größe), sonst neu würfeln
let STAND=null; try{ STAND=JSON.parse(localStorage.getItem('sitzkrieg-stand')); }catch(e){}
if(STAND&&!m&&STAND.size===$('size').value&&STAND.seed!=null){
  if(STAND.keep) Object.assign(SIZE_KEEP,STAND.keep);
  run(STAND.seed);
} else { STAND=null; run(newSeed()); }
showTab(['regeln','mission','spiel'].includes(startTab)?startTab:'gen');
function migrateAbil(list){ for(const sl of list||[]) for(const u of (sl&&sl.units)||[]) if(u.abil){ const nn=GEN_RENAMED[u.abil.name]||u.abil.name, g=GEN_ABIL.find(a=>a.name===nn); if(g) u.abil=g; else u.abil=GEN_ABIL[Math.floor(Math.random()*GEN_ABIL.length)]; } return list; }
if(STAND&&STAND.keep) for(const k of Object.values(STAND.keep)){ migrateAbil(k&&k.de); migrateAbil(k&&k.al); }
if(STAND&&STAND.armies&&STAND.armies.de&&STAND.armies.al){ armies.de=migrateAbil(STAND.armies.de); armies.al=migrateAbil(STAND.armies.al); renderArmy('de'); renderArmy('al'); }
else genArmies();
// Stand speichern (wird bei jeder Änderung aufgerufen)
let standT=null;
window.saveStand=function(){ clearTimeout(standT); standT=setTimeout(()=>{ try{
  const keep={...SIZE_KEEP}; if(current) keep[$('size').value]={seed:current.seed,de:armies.de,al:armies.al};
  localStorage.setItem('sitzkrieg-stand',JSON.stringify({size:$('size').value,seed:current?current.seed:null,armies:{de:armies.de,al:armies.al},keep,
    spiel:window.spielGet?spielGet():null}));
}catch(e){} },200); };
