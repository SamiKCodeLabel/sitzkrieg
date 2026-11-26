const PIECES = [
  {key:'wald',    name:'Wald',          biome:'g', size:1, count:3, icon:'🌲'},
  {key:'flach',   name:'Flachland',     biome:'g', size:1, count:9, icon:'🌾'},
  {key:'zug',     name:'Zug',           biome:'g', size:2, count:1, icon:'🚂'},
  {key:'farm',    name:'Farm',          biome:'g', size:1, count:1, icon:'🐄'},
  {key:'turm',    name:'Wachturm',      biome:'g', size:1, count:1, icon:'🗼'},
  {key:'bunker',  name:'Bunker',        biome:'g', size:1, count:1, icon:'🧱'},
  {key:'strand',  name:'Strand',        biome:'g', size:1, count:1, icon:'🏖️', rule:'corner'},
  {key:'wohn',    name:'Wohnhaus',      biome:'g', size:1, count:1, icon:'🏠'},
  {key:'graben',  name:'Graben',        biome:'g', size:2, count:1, icon:'⛏️'},
  {key:'hafen',   name:'Hafen',         biome:'g', size:2, count:1, icon:'⚓', rule:'corner', city:true},
  {key:'see',     name:'See',           biome:'g', size:1, count:1, icon:'💧'},
  {key:'strasse', name:'Leere Straße',  biome:'b', size:1, count:2, icon:'🛣️'},
  {key:'ruine',   name:'Ruine',         biome:'b', size:1, count:4, icon:'🏚️'},
  {key:'kirche',  name:'Kirche',        biome:'b', size:2, count:1, icon:'⛪'},
];
const DEFAULTS = { counts: Object.fromEntries(PIECES.map(p=>[p.key,p.count])), bmin:0, bmax:8, ext:{'3x6':3,'3x8':5}, v:3 };
const EXT_MAX={'3x6':3,'3x8':5};   // Felderweiterungen: Normal 0–3, Episch 0–5
let ROWS = 3;
const ROWNAMES = 'ABC';

// ---------- Einstellungen ----------
let settings = structuredClone(DEFAULTS);
try { const s = JSON.parse(localStorage.getItem('kartengen-settings')); if (s && s.counts) settings = {...settings, ...s, counts:{...settings.counts, ...s.counts}}; } catch(e){}
// Ältere Einstellungen: Flachland-Maximum ist von 8 auf 9 gestiegen
if((settings.v|0)<2){ if(settings.counts.flach===8) settings.counts.flach=9; settings.v=2; }
if((settings.v|0)<3){ if(settings.counts.strasse===1) settings.counts.strasse=2; settings.v=3; }   // Straßen-Maximum 1 -> 2
// Deine Liste ist das Maximum: gespeicherte Werte darauf begrenzen
const MAXB = PIECES.filter(p=>p.biome==='b').reduce((a,p)=>a+p.size*p.count,0);
for(const p of PIECES) settings.counts[p.key]=Math.max(0,Math.min(p.count, settings.counts[p.key]|0));
settings.bmax=Math.max(0,Math.min(MAXB, settings.bmax|0)); settings.bmin=Math.max(0,Math.min(settings.bmax, settings.bmin|0));
settings.ext={...DEFAULTS.ext,...(settings.ext||{})}; for(const k in EXT_MAX) settings.ext[k]=Math.max(0,Math.min(EXT_MAX[k],settings.ext[k]|0));
function saveSettings(){ try{ localStorage.setItem('kartengen-settings', JSON.stringify(settings)); }catch(e){} }

// ---------- Zufall (mit Seed, damit Karten reproduzierbar sind) ----------
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
let rnd = Math.random;
const ri = n => Math.floor(rnd()*n);
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=ri(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; }

// ---------- Raster-Hilfen ----------
let COLS = 8;
const rc = i => [Math.floor(i/COLS), i%COLS];
const isEdge = i => { const [r,c]=rc(i); return r===0||r===ROWS-1||c===0||c===COLS-1; };
const isCorner = i => { const [r,c]=rc(i); return (r===0||r===ROWS-1)&&(c===0||c===COLS-1); };
function neighbors(i){
  const [r,c]=rc(i), out=[];
  if(r>0) out.push(i-COLS); if(r<ROWS-1) out.push(i+COLS);
  if(c>0) out.push(i-1); if(c<COLS-1) out.push(i+1);
  return out;
}
function connected(set){
  if(set.size===0) return true;
  const start=set.values().next().value, seen=new Set([start]), st=[start];
  while(st.length){ const x=st.pop(); for(const n of neighbors(x)) if(set.has(n)&&!seen.has(n)){ seen.add(n); st.push(n);} }
  return seen.size===set.size;
}
// Lange Seite eines 2er-Teils: beide Nachbarfelder auf einer Längsseite müssen in 'set' liegen
function longSideTouches([a,b],set){
  const [r1,c1]=rc(a),[r2,c2]=rc(b), sides=[];
  if(r1===r2) sides.push([[r1-1,c1],[r1-1,c2]],[[r1+1,c1],[r1+1,c2]]);
  else        sides.push([[r1,c1-1],[r2,c2-1]],[[r1,c1+1],[r2,c2+1]]);
  return sides.some(side=>side.every(([r,c])=>r>=0&&r<ROWS&&c>=0&&c<COLS&&set.has(r*COLS+c)));
}
const coord = i => { const [r,c]=rc(i); return ROWNAMES[r]+(c+1); };

// ---------- Gebiete aufteilen (Stadt zusammenhängend, Rest grün zusammenhängend) ----------
function splitBiomes(bSize){
  const N=ROWS*COLS;
  for(let t=0;t<200;t++){
    const brown=new Set();
    if(bSize>0){
      brown.add(ri(N));
      while(brown.size<bSize){
        const front=[...new Set([...brown].flatMap(neighbors))].filter(n=>!brown.has(n));
        brown.add(front[ri(front.length)]);
      }
    }
    const green=new Set([...Array(N).keys()].filter(i=>!brown.has(i)));
    if(connected(green)) return {g:green,b:brown};
  }
  return null;
}

// ---------- Felder aus dem Pool ziehen ----------
function drawPieces(biome, cells, noCity=false){
  const pool=[];
  for(const p of PIECES) if(p.biome===biome && !(noCity && p.city)) for(let k=0;k<(settings.counts[p.key]||0);k++) pool.push(p);
  shuffle(pool);
  const chosen=[]; let left=cells;
  for(const p of pool){ if(p.size<=left){ chosen.push(p); left-=p.size; } if(!left) break; }
  return left===0 ? chosen : null;
}

// ---------- Platzieren mit Backtracking ----------
function placeRegion(region, pieces, grid, city=new Set()){
  const cons=pieces.filter(p=>p.size>1||p.rule).sort((a,b)=>(b.rule?1:0)-(a.rule?1:0));
  const singles=pieces.filter(p=>!(p.size>1||p.rule));
  const placed=[];
  function options(p){
    const free=[...region].filter(i=>grid[i]==null), opts=[];
    if(p.size===1){
      for(const i of free) if(p.rule!=='corner'||isCorner(i)) opts.push([i]);
    } else {
      for(const i of free) for(const n of neighbors(i)) if(n>i && grid[n]==null && region.has(n)){
        if(p.rule==='corner' && !(isCorner(i)||isCorner(n))) continue;
        if(p.city && !longSideTouches([i,n],city)) continue;
        opts.push([i,n]);
      }
    }
    return shuffle(opts);
  }
  function bt(k){
    if(k===cons.length) return true;
    for(const o of options(cons[k])){
      o.forEach(i=>grid[i]=cons[k]); placed.push({p:cons[k],cells:o});
      if(bt(k+1)) return true;
      o.forEach(i=>grid[i]=null); placed.pop();
    }
    return false;
  }
  if(!bt(0)) return null;
  const rest=shuffle([...region].filter(i=>grid[i]==null));
  singles.forEach((p,j)=>{ grid[rest[j]]=p; placed.push({p,cells:[rest[j]]}); });
  return placed;
}

function generate(seed){
  rnd = mulberry32(seed);
  const N=ROWS*COLS;
  const maxB = PIECES.filter(p=>p.biome==='b').reduce((s,p)=>s+p.size*(settings.counts[p.key]||0),0);
  const maxG = PIECES.filter(p=>p.biome==='g').reduce((s,p)=>s+p.size*(settings.counts[p.key]||0),0);
  // Ohne Stadt gibt es keinen Hafen (der muss an der Stadt liegen)
  const maxGnoCity = PIECES.filter(p=>p.biome==='g'&&!p.city).reduce((s,p)=>s+p.size*(settings.counts[p.key]||0),0);
  const fits=b=> b<=maxB && b<=N && (b===0 ? maxGnoCity>=N : maxG>=N-b);  // b===N: reine Stadt-Karte
  const lo=Math.max(0,settings.bmin|0), hi=Math.max(lo,settings.bmax|0);
  let sizes=[]; for(let b=lo;b<=hi;b++) if(fits(b)) sizes.push(b);
  let note='';
  if(!sizes.length){
    // nächstgelegene mögliche Stadtgröße suchen
    const all=[]; for(let b=0;b<=N;b++) if(fits(b)) all.push(b);
    if(!all.length) return {error:`Mit diesen Teilen passt keine ${ROWS}×${COLS}-Karte. Bitte mehr Teile in den Einstellungen erlauben.`};
    const dist=b=> b<lo ? lo-b : b-hi; const best=Math.min(...all.map(dist));
    sizes=all.filter(b=>dist(b)===best);
    const why = (hi>maxB && maxB<=N) ? `es gibt nur ${maxB} Stadtfelder im Vorrat` : hi>N ? `auf ${ROWS}×${COLS} passen höchstens ${N} Stadtfelder` : `das passt mit den grünen Teilen nicht`;
    note=`Hinweis: Stadt mit ${lo===hi?lo:lo+'–'+hi} Feldern geht hier nicht (${why}). Die Karte nutzt stattdessen ${sizes.length>1?sizes.join('/'):sizes[0]} Stadtfelder.`;
  }
  for(let attempt=0;attempt<2000;attempt++){
    const bSize=sizes[ri(sizes.length)];
    const reg=splitBiomes(bSize); if(!reg) continue;
    const gp=drawPieces('g',reg.g.size,bSize===0), bp=drawPieces('b',reg.b.size);
    if(!gp||!bp) continue;
    const grid=Array(N).fill(null);
    const a=placeRegion(reg.g,gp,grid,reg.b); if(!a) continue;
    const b=placeRegion(reg.b,bp,grid); if(!b) continue;
    const all=[...a,...b].map(x=>({...x,cells:x.cells.sort((m,n)=>m-n)})).sort((x,y)=>x.cells[0]-y.cells[0]);
    all.forEach((x,i)=>x.id=i+1);
    return {pieces:all, note};
  }
  return {error:'Keine gültige Karte gefunden – bitte Einstellungen prüfen (z. B. mehr Einzelfelder).'};
}

// ---------- Anzeige ----------
const $=id=>document.getElementById(id);
let current=null, rotated=null;
function isPortrait(){ return rotated!==null ? rotated : window.innerWidth < 640; }

function render(){
  const map=$('map'), msg=$('msg');
  map.innerHTML=''; msg.innerHTML=''; $('stats').textContent='';
  if(!current) return;
  if(current.error){ msg.innerHTML=`<div class="err">${current.error}</div>`; return; }
  if(current.note) msg.innerHTML=`<div class="note-bar">${current.note}</div>`;
  const port=isPortrait();
  const dR = port?COLS:ROWS, dC = port?ROWS:COLS;
  map.style.gridTemplateColumns=`repeat(${dC},minmax(0,1fr))`;
  map.style.maxWidth = (port ? Math.min(420, dC*140) : Math.min(1000, dC*125)) + 'px';
  map.classList.toggle('has-edges', !!(markOn && window.CUR_MISSION));
  // Quadratische Felder: Zeilenhöhe = Spaltenbreite
  const ms=getComputedStyle(map);
  const inner=map.clientWidth-parseFloat(ms.paddingLeft)-parseFloat(ms.paddingRight);
  const gap=parseFloat(ms.columnGap)||0;
  const side=Math.floor((inner-gap*(dC-1))/dC);
  map.style.gridTemplateRows=`repeat(${dR},${side}px)`;
  map.style.setProperty('--side', side+'px');
  let g=0,b=0;
  const mset=markOn?missionSetup():null;
  for(const x of current.pieces){
    const pos=x.cells.map(i=>{ const [r,c]=rc(i); return port?[c,ROWS-1-r]:[r,c]; });   // hochkant = um 90° im Uhrzeigersinn gedreht
    const r0=Math.min(...pos.map(p=>p[0])), r1=Math.max(...pos.map(p=>p[0]));
    const c0=Math.min(...pos.map(p=>p[1])), c1=Math.max(...pos.map(p=>p[1]));
    const el=document.createElement('div');
    el.className=`cell ${x.p.biome} k-${x.p.key}${x.cells.length>1?' multi':''}`;
    el.style.gridRow=`${r0+1} / ${r1+2}`; el.style.gridColumn=`${c0+1} / ${c1+2}`;
    const cs=x.cells.map(coord).join('+');
    el.innerHTML=`<span class="ic">${x.p.icon}</span><span class="nm">${x.p.name}</span>`;
    el.title=x.p.name;
    const oi=mset?mset.objectives.indexOf(x):-1;
    if(oi>=0){ const o=mset.objInfo[oi]; el.classList.add('is-obj'); if(o.flex) el.classList.add('is-flex');
      el.insertAdjacentHTML('beforeend',`<span class="obj" title="Missionsziel: ${o.name}">⚑</span>${o.flex?`<span class="obj-flex">${OBJ_SHY[o.name]||o.name}</span>`:''}`);
      el.title+=` · Missionsziel${o.flex?': '+o.name:''}`; }
    const ex=mset&&mset.exts?mset.exts.find(e=>e.p===x):null;
    if(ex){ el.classList.add('is-ext'); el.insertAdjacentHTML('beforeend',`<span class="ext" title="Felderweiterung: ${ex.name}">${ex.icon} ${EXT_SHY[ex.name]||ex.name}</span>`); el.title+=` · Felderweiterung: ${ex.name}`; }
    // Jedes Feld ist antippbar (ohne Besonderheit zeigt es nur den Namen)
    el.dataset.pi=current.pieces.indexOf(x); el.setAttribute('role','button'); el.tabIndex=0;
    el.style.setProperty('--w',r0+c0);   // Reihenfolge der Einblend-Welle (diagonal über das Raster)
    map.appendChild(el);
    x.p.biome==='g'?g+=x.cells.length:b+=x.cells.length;
  }
  $('stats').textContent=`${ROWS}×${COLS} · ${current.pieces.length} Teile · ${g} grüne Felder · ${b} Stadtfelder`;
  if(mset){                                   // Spielkanten: Band im Kartenrahmen, Pfeile zeigen zur Mitte
    const disp=e=>port?({left:'top',right:'bottom',top:'right',bottom:'left'})[e]:e;
    const arrow={left:'▶',right:'◀',top:'▼',bottom:'▲'};
    for(const side of ['de','al']){
      const list=mset.edges[side];
      list.forEach((x,k)=>{
        const d=disp(x.e), n=x.part==='all'?((d==='left'||d==='right')?dR:dC):COLS/2;
        const bar=document.createElement('div'); bar.className=`edge ${d} ${side}${x.part==='all'?'':' half-'+x.part}`;
        const items=Array.from({length:n},()=>`<i>${arrow[d]}</i>`);
        if(k===0) items.splice(Math.floor(n/2),0,`<b>${EMB[side]} ${side==='de'?'Deutsche':'Alliierte'}</b>`);
        bar.innerHTML=items.join(''); map.appendChild(bar);
      });
      if(list.length===2){ const ds=list.map(x=>disp(x.e)); const h=ds.find(d=>d==='left'||d==='right'), v=ds.find(d=>d==='top'||d==='bottom');
        const c=document.createElement('div'); c.className=`edge-corner ${side} ${h} ${v}`; map.appendChild(c); }
    }
  }
  renderMapMission(mset,port);
}

const SIZE_NAME={'3x8':'gross','3x6':'mittel','2x4':'klein'};
const SIZE_OF={gross:'3x8',mittel:'3x6',klein:'3x6'}; // Klein gibt es nicht mehr → alte Links öffnen Normal
function run(seed){
  [ROWS,COLS] = $('size').value.split('x').map(Number);
  seed = seed>>>0;
  current = {...generate(seed), seed};
  updateSeed();
  document.querySelectorAll('.seg button[data-size]').forEach(b=>b.classList.toggle('on', b.dataset.size===$('size').value));
  if(typeof syncExt==='function'&&$('ext-set')) syncExt();
  render();
  const map=$('map'); map.classList.remove('pop'); void map.offsetWidth; map.classList.add('pop');
}
const newSeed = () => Math.floor(Math.random()*1e9);
// Seed = „Karte-Armeen“: die zweite Zahl speichert Armeen, abgewählte Fahrzeuge und „Faire Armeen“
let armyCode=null;
const seedStr=()=>current? (current.seed+(armyCode!=null?'-'+armyCode:'')) : '';
function updateSeed(){}   // Seed-Anzeige und -Laden gibt es nicht mehr (Zufall läuft intern weiter mit Seeds)

// ---------- Einstellungs-UI ----------

function stepper(get,set,min,max){
  const w=document.createElement('div'); w.className='step';
  w.innerHTML=`<button type="button" class="sec" aria-label="weniger">−</button><output></output><button type="button" class="sec" aria-label="mehr">+</button>`;
  const [minus,out,plus]=w.children;
  const upd=()=>{ const v=get(); out.textContent=v; minus.disabled=v<=min; plus.disabled=v>=max; };
  minus.onclick=()=>{ set(Math.max(min,get()-1)); upd(); updSums(); saveSettings(); };
  plus.onclick=()=>{ set(Math.min(max,get()+1)); upd(); updSums(); saveSettings(); };
  upd(); return w;
}
function srow(icon,name,tag,step){
  const r=document.createElement('div'); r.className='srow';
  r.innerHTML=`<span class="sic">${icon}</span><span class="snm">${name}${tag?` <span class="stag">${tag}</span>`:''}</span>`;
  r.appendChild(step); return r;
}
const cityCells=()=>PIECES.filter(p=>p.biome==='b').reduce((a,p)=>a+p.size*(settings.counts[p.key]||0),0);
function buildBsize(){
  const cap=cityCells();
  settings.bmax=Math.min(settings.bmax,cap); settings.bmin=Math.min(settings.bmin,settings.bmax);
  const bs=$('bsize'); bs.innerHTML='';
  bs.appendChild(srow('⬇️','Mindestens','',stepper(()=>settings.bmin,v=>{ settings.bmin=v; if(settings.bmax<v) settings.bmax=v; buildBsize(); },0,cap)));
  bs.appendChild(srow('⬆️','Höchstens','',stepper(()=>settings.bmax,v=>{ settings.bmax=v; if(settings.bmin>v) settings.bmin=v; buildBsize(); },0,cap)));
}
function updSums(){
  if(document.getElementById('bsize') && $('bsize').children.length) buildBsize();
  for(const bio of ['g','b']){
    const n=PIECES.filter(p=>p.biome===bio).reduce((a,p)=>a+p.size*(settings.counts[p.key]||0),0);
    $('sum-'+bio).textContent=`${n} Felder im Vorrat`;
  }
}
function buildPool(){
  for(const bio of ['g','b']){
    const box=$('pool-'+bio); box.innerHTML='';
    for(const p of PIECES.filter(p=>p.biome===bio))
      box.appendChild(srow(p.icon,p.name,[p.size>1?'2 Felder':'',`max. ${p.count}`].filter(Boolean).join(' · '),stepper(()=>settings.counts[p.key]||0,v=>settings.counts[p.key]=v,0,p.count)));
  }
  buildBsize();
  updSums();
  syncExt();
}
function syncExt(){
  const sz=$('size').value, mx=EXT_MAX[sz]??3, box=$('ext-set'); box.innerHTML='';
  box.appendChild(srow('<svg class="ext-ic" viewBox="0 0 28 28" aria-hidden="true"><g stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M7 3.5v7M3.5 7h7"/><path d="M20 9v7M16.5 12.5h7"/><path d="M9 17.5v7M5.5 21h7"/></g></svg>','Feld&shy;erweite&shy;rungen',`${sz==='3x8'?'Episch':'Normal'} · max. ${mx}`,stepper(()=>Math.min(mx,settings.ext?.[sz]??mx),v=>{
    settings.ext={...settings.ext,[sz]:v}; if(current) current._ms=null; render(); if(window.netChanged) netChanged(); },0,mx)));
}
$('reset').onclick=()=>{ settings=structuredClone(DEFAULTS); saveSettings(); buildPool(); run(newSeed()); };
$('gen').onclick=()=>run(newSeed());
$('fab').onclick=()=>{ if(document.body.classList.contains('on-mission')){ genArmies(); if(Math.random()<0.01&&window.playReroll) playReroll(); $('tab-mission').scrollIntoView({behavior:'smooth',block:'start'}); return; } run(newSeed()); $('map').scrollIntoView({behavior:'smooth',block:'start'}); };
// Größe wechseln ohne neu zu würfeln: jede Größe behält ihre Karte und Armeen, solange die Seite offen ist
const SIZE_KEEP={};
document.querySelectorAll('.seg button[data-size]').forEach(b=>b.onclick=()=>{
  const from=$('size').value, to=b.dataset.size; if(from===to) return;
  if(current) SIZE_KEEP[from]={seed:current.seed, de:armies.de, al:armies.al, spiel:window.spielGet?spielGet():null};
  $('size').value=to; try{ localStorage.setItem('sitzkrieg-size',to); }catch(e){}
  const k=SIZE_KEEP[to];
  if(k){ run(k.seed); armies.de=k.de; armies.al=k.al; renderArmy('de'); renderArmy('al'); if(k.spiel&&window.spielSet) spielSet(k.spiel); else if(window.spielReset) spielReset(); }
  else { run(newSeed()); if(typeof genArmies==='function') genArmies(); }
});
$('size').onchange=()=>run(newSeed());
$('rot').onclick=()=>{ rotated=!isPortrait(); render(); };
let rzT; window.addEventListener('resize',()=>{ clearTimeout(rzT); rzT=setTimeout(render,80); });


// ---------- Tabs ----------
function showTab(t){
  for(const id of ['gen','mission','spiel','regeln']){ $('tab-'+id).hidden = id!==t; $('t-'+id).classList.toggle('on', id===t); $('t-'+id).setAttribute('aria-selected', id===t); }
  document.body.classList.toggle('on-regeln', t==='regeln');
  document.body.classList.toggle('on-mission', t==='mission');
  document.body.classList.toggle('on-spiel', t==='spiel');
  const pane=$('tab-'+t); pane.classList.remove('tab-in'); void pane.offsetWidth; pane.classList.add('tab-in');   // kurzes Einblenden
  if(t==='spiel'&&window.renderSpiel) renderSpiel();
  $('sub').textContent = {gen:'Karte',mission:'Armee',spiel:'Spiel',regeln:'Regelwerk'}[t];
  try{ localStorage.setItem('sitzkrieg-tab', t); }catch(e){}
  if(t==='gen') render();
}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{ showTab(b.dataset.tab); window.scrollTo({top:0}); });
// Inhaltsverzeichnis + Panzerungs-Grafiken
(function(){
  const toc=$('toc');
  document.querySelectorAll('#regelwerk .rcard').forEach(a=>{
    const h=a.querySelector('h2'); const li=document.createElement('li');
    const name=[...h.childNodes].filter(n=>!(n.nodeType===1&&n.tagName==='SMALL')).map(n=>n.textContent).join('').trim();
    const sm=h.querySelector('small');
    li.innerHTML=`<a href="#${a.id}">${sm&&a.classList.contains('variant')?sm.textContent+': ':''}${name}</a>`; toc.appendChild(li);
  });
  document.querySelectorAll('.armor').forEach(d=>{
    const f=d.dataset.f,s=d.dataset.s,r=d.dataset.r,t=d.dataset.t||s;
    d.innerHTML=`<span></span><span class="v" title="Front">${f}</span><span></span><span class="v" title="Seite">${s}</span><span class="c" title="Fahrtrichtung"><i>↑</i>${t}</span><span class="v" title="Seite">${s}</span><span></span><span class="v" title="Heck">${r}</span><span></span><span class="armor-cap" aria-hidden="true"></span>`;   // leere Zeile: Platz für die Fahrzeugzeichnung
    d.style.gridTemplateRows='repeat(3,42px) auto';
  });
  $('toc-count').textContent=`(${document.querySelectorAll('#regelwerk .rcard').length} Abschnitte)`;
  document.querySelectorAll('#regelwerk a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const id=a.getAttribute('href').slice(1); const el=document.getElementById(id); if(!el) return;
    e.preventDefault(); const d=a.closest('.toc details'); if(d) d.open=false;
    const off=(document.querySelector('.toc')?.offsetHeight||0)+8;
    window.scrollTo({top:el.getBoundingClientRect().top+scrollY-off,behavior:'smooth'});
  }));
  window.addEventListener('scroll',()=>$('totop').classList.toggle('show', scrollY>600),{passive:true});
})();


// ---------- Fahrzeug-Draufsichten hinter der Panzerungsgrafik (Front = Pfeilrichtung) ----------
const VEH_TOP={
  heavy:'<rect x="8" y="12" width="18" height="128" rx="4"/><rect x="74" y="12" width="18" height="128" rx="4"/><path d="M8 18 h18"/><path d="M8 25 h18"/><path d="M8 32 h18"/><path d="M8 39 h18"/><path d="M8 46 h18"/><path d="M8 53 h18"/><path d="M8 60 h18"/><path d="M8 67 h18"/><path d="M8 74 h18"/><path d="M8 81 h18"/><path d="M8 88 h18"/><path d="M8 95 h18"/><path d="M8 102 h18"/><path d="M8 109 h18"/><path d="M8 116 h18"/><path d="M8 123 h18"/><path d="M8 130 h18"/><path d="M8 137 h18"/><path d="M74 18 h18"/><path d="M74 25 h18"/><path d="M74 32 h18"/><path d="M74 39 h18"/><path d="M74 46 h18"/><path d="M74 53 h18"/><path d="M74 60 h18"/><path d="M74 67 h18"/><path d="M74 74 h18"/><path d="M74 81 h18"/><path d="M74 88 h18"/><path d="M74 95 h18"/><path d="M74 102 h18"/><path d="M74 109 h18"/><path d="M74 116 h18"/><path d="M74 123 h18"/><path d="M74 130 h18"/><path d="M74 137 h18"/><rect x="24" y="16" width="52" height="120" rx="3"/><path d="M30 112 h40 M30 118 h40 M30 124 h40 M30 130 h40"/><rect x="30" y="52" width="40" height="46" rx="11"/><circle cx="60" cy="84" r="6"/><circle cx="40" cy="86" r="4"/><rect x="47.5" y="4" width="5" height="50"/><rect x="45" y="1" width="10" height="7" rx="1"/><path d="M34 16 v-6"/>',
  light:'<rect x="16" y="26" width="14" height="104" rx="4"/><rect x="70" y="26" width="14" height="104" rx="4"/><path d="M16 31 h14"/><path d="M16 38 h14"/><path d="M16 45 h14"/><path d="M16 52 h14"/><path d="M16 59 h14"/><path d="M16 66 h14"/><path d="M16 73 h14"/><path d="M16 80 h14"/><path d="M16 87 h14"/><path d="M16 94 h14"/><path d="M16 101 h14"/><path d="M16 108 h14"/><path d="M16 115 h14"/><path d="M16 122 h14"/><path d="M70 31 h14"/><path d="M70 38 h14"/><path d="M70 45 h14"/><path d="M70 52 h14"/><path d="M70 59 h14"/><path d="M70 66 h14"/><path d="M70 73 h14"/><path d="M70 80 h14"/><path d="M70 87 h14"/><path d="M70 94 h14"/><path d="M70 101 h14"/><path d="M70 108 h14"/><path d="M70 115 h14"/><path d="M70 122 h14"/><rect x="28" y="30" width="44" height="96" rx="3"/><path d="M33 110 h34 M33 116 h34 M33 122 h34"/><circle cx="50" cy="74" r="16"/><circle cx="56" cy="80" r="4"/><rect x="48.5" y="22" width="3" height="38"/><path d="M38 30 v-5"/>',
  trans:'<rect x="13" y="16" width="8" height="20" rx="3"/><rect x="79" y="16" width="8" height="20" rx="3"/><rect x="24" y="8" width="52" height="36" rx="7"/><path d="M32 14 h36 M32 19 h36"/><path d="M24 46 h52" stroke-width="2.4"/><rect x="12" y="64" width="8" height="72" rx="3"/><rect x="80" y="64" width="8" height="72" rx="3"/><path d="M12 68 h8"/><path d="M12 75 h8"/><path d="M12 82 h8"/><path d="M12 89 h8"/><path d="M12 96 h8"/><path d="M12 103 h8"/><path d="M12 110 h8"/><path d="M12 117 h8"/><path d="M12 124 h8"/><path d="M12 131 h8"/><path d="M80 68 h8"/><path d="M80 75 h8"/><path d="M80 82 h8"/><path d="M80 89 h8"/><path d="M80 96 h8"/><path d="M80 103 h8"/><path d="M80 110 h8"/><path d="M80 117 h8"/><path d="M80 124 h8"/><path d="M80 131 h8"/><rect x="20" y="48" width="60" height="92" rx="2"/><path d="M27 58 v76 M73 58 v76"/><path d="M36 60 h28 v10 h-28 Z"/>',
  flak:'<rect x="44" y="22" width="12" height="114" rx="2"/><rect x="8" y="72" width="84" height="12" rx="2"/><rect x="40" y="14" width="20" height="8" rx="2"/><rect x="40" y="136" width="20" height="8" rx="2"/><rect x="2" y="68" width="8" height="20" rx="2"/><rect x="90" y="68" width="8" height="20" rx="2"/><circle cx="50" cy="78" r="18"/><path d="M34 66 Q50 54 66 66"/><rect x="47.5" y="2" width="5" height="70"/><rect x="45" y="0" width="10" height="6" rx="1"/>',
  krad:'<rect x="29" y="6" width="7" height="28" rx="3.5"/><rect x="29" y="100" width="7" height="30" rx="3.5"/><rect x="26" y="38" width="13" height="60" rx="6"/><path d="M16 38 h33"/><ellipse cx="32.5" cy="82" rx="6" ry="10"/><path d="M54 44 Q70 34 84 48 L86 104 Q70 116 54 104 Z"/><ellipse cx="70" cy="76" rx="9" ry="12"/><rect x="89" y="64" width="6" height="26" rx="3"/><path d="M39 56 h15 M39 92 h15 M86 77 h3"/><path d="M70 46 v-24"/>',
  plane:'<ellipse cx="50" cy="78" rx="8" ry="64"/><path d="M4 66 Q8 56 42 54 L58 54 Q92 56 96 66 L94 78 L58 74 L42 74 L6 78 Z"/><path d="M26 128 Q30 122 44 122 L56 122 Q70 122 74 128 L72 134 L28 134 Z"/><path d="M50 118 v26"/><path d="M36 12 h28" stroke-width="2.4"/><circle cx="50" cy="14" r="4"/><ellipse cx="50" cy="60" rx="4.5" ry="9"/><path d="M22 60 v8 M78 60 v8"/>'
};
const VEH_OF={"schwerer-panzer":"heavy","leichter-panzer":"light","transporter":"trans","flakgeschuetz":"flak","kraftrad":"krad","kampfflieger-werte":"plane"};
document.querySelectorAll('.armor').forEach(d=>{
  const k=VEH_OF[d.closest('.rcard')?.id]; if(!k) return;
  d.insertAdjacentHTML('afterbegin',`<svg class="vtop" viewBox="0 0 100 150" aria-hidden="true"><g>${VEH_TOP[k]}</g></svg>`);
});



// ---------- Blendgranate beim Wechsel auf den Tag-Modus ----------
function flashbang(){
  if(typeof Sounds!=='undefined') Sounds.play('flash');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // ohne Blitz, wenn das Gerät weniger Bewegung wünscht
  document.getElementById('flash')?.remove();
  const f=document.createElement('div'); f.id='flash'; document.body.appendChild(f);
  setTimeout(()=>{ f.classList.add('out'); setTimeout(()=>f.remove(),1700); }, 2000);
}
// ---------- Tag/Nacht ----------
function setTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  $('theme').textContent = t==='dark' ? '☀' : '☾';
  $('theme').title = t==='dark' ? 'Tag-Modus' : 'Nacht-Modus';
  const m=document.querySelector('meta[name=theme-color]'); if(m) m.content = t==='dark' ? '#060704' : '#1b1e14';
}
setTheme(document.documentElement.getAttribute('data-theme')||'light');
$('theme').onclick=()=>{ const t=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark'; if(t==='light') flashbang(); setTheme(t); try{ localStorage.setItem('sitzkrieg-theme',t); }catch(e){} };
