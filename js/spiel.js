// ===================== Spiel-Tab: Befehlsdeck (Normal) =====================
(function(){
// Deck je Armee: Gewehrschützen und Spezial laut DECKS, dazu je 1× jedes Fahrzeug, das die Armee wirklich hat
// Aktivierungen pro Armee und Runde (siehe Regelwerk: Rundenaktivierungen)
const DECKS={'3x6':{rif:4,spec:3},'3x8':{rif:6,spec:4}};
const S={round:1,deck:[],cur:null,newRound:false,sig:'',end:null,played:[]};   // played: diese Runde schon aufgedeckte Fahrzeuge   // end: Seite des Rundenende-Bildschirms (null = normale Karten)
const sigNow=()=>$('size').value;   // Deck startet nur neu bei neuer Größe ohne eigenes Deck oder beim Gedrückthalten von „Neue Karte“
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
// Abwechselnd Deutsche und Alliierte: jede Seite wird für sich gemischt, dann im Reißverschluss zusammengelegt.
// Wer anfängt, wird je Runde ausgelost. Hat eine Seite mehr Karten, kommen deren letzte Karten am Ende hintereinander.
function buildDeck(){
  const per={};
  for(const side of ['de','al']){
    const d=[];
    const D=DECKS[$('size').value]||DECKS['3x6'];
    for(let i=0;i<D.rif;i++) d.push({side,kind:'rif'});
    for(let i=0;i<D.spec;i++) d.push({side,kind:'spec'});
    for(const v of (armies[side]||[]).filter(x=>x.veh)) d.push({side,kind:'veh',key:v.key});
    per[side]=shuffle(d);
  }
  const order=Math.random()<.5?['de','al']:['al','de'], out=[];
  while(per.de.length||per.al.length) for(const s of order) if(per[s].length) out.push(per[s].shift());
  return out;
}
function reset(){ S.round=1; S.deck=buildDeck(); S.cur=null; S.newRound=false; S.end=null; S.played=[]; S.sig=sigNow(); takeCard(); }   // erste Karte liegt gleich offen: wer drückt, gibt ab
// Jedes Fahrzeug jeder Armee kommt in jeder Runde genau 1 mal dran: fehlende Fahrzeugkarten werden in den Rest des Decks gemischt,
// Karten von Fahrzeugen, die es nicht mehr gibt, fliegen raus.
function syncVeh(){
  const have=new Set(), played=new Set(S.played||[]);
  S.deck=S.deck.filter(c=>{ if(c.kind!=='veh') return true; const ok=(armies[c.side]||[]).some(v=>v.veh&&v.key===c.key); if(ok) have.add(c.side+':'+c.key); return ok; });
  for(const side of ['de','al']) for(const v of (armies[side]||[]).filter(x=>x.veh)){
    const id=side+':'+v.key; if(have.has(id)||played.has(id)) continue;
    S.deck.splice(Math.floor(Math.random()*(S.deck.length+1)),0,{side,kind:'veh',key:v.key});
  }
  // Wieder streng abwechselnd sortieren (Reihenfolge innerhalb jeder Seite bleibt), Start mit der Seite, die nicht gerade offen liegt
  const per={de:S.deck.filter(c=>c.side==='de'),al:S.deck.filter(c=>c.side==='al')};
  let nx=S.cur?(S.cur.side==='de'?'al':'de'):(S.deck[0]?S.deck[0].side:'de'); const out=[];
  while(per.de.length||per.al.length){ if(per[nx].length) out.push(per[nx].shift()); nx=nx==='de'?'al':'de'; }
  S.deck=out;
}
const objList=()=>{ const ms=typeof missionSetup==='function'?missionSetup():null; return ms&&ms.objInfo?ms.objInfo:[]; };
window.spielReset=()=>{ reset(); render(); };
// Armeen neu gewürfelt: Deck und Runde bleiben. Fahrzeugkarten von Fahrzeugen, die es nicht mehr gibt, fliegen raus;
// neue Fahrzeuge kommen ab der nächsten Runde ins Deck.
window.spielArmies=()=>{ if(S.sig!==sigNow()) return render();
  if(S.end===null) syncVeh(); render(); };
function draw(){
  if($('sp-next')&&$('sp-next').disabled) return;
  if(S.sig!==sigNow()) reset();
  S.newRound=false;
  // Deck leer: erst das Rundenende (jedes Missionsziel einzeln), danach neue Runde
  if(!S.deck.length){
    const n=objList().length;
    if(S.end===null){ S.end=-1; S.cur=null; render(); if(window.netChanged) netChanged(); return; }   // -1 = Rauch & Feuer
    if(S.end!==null && S.end<n-1){ S.end++; render(); if(window.netChanged) netChanged(); return; }
    S.end=null; S.round++; S.deck=buildDeck(); S.played=[]; S.newRound=true;
  }
  takeCard(); render(); if(window.netChanged) netChanged();
}
function takeCard(){
  const c=S.deck.shift(); if(!c){ S.cur=null; return; } if(c.kind==='veh') S.played.push(c.side+':'+c.key);
  if(c.kind==='spec'){   // Spezial: zufällig eine der einzelnen Spezialeinheiten dieser Armee
    const sp=(armies[c.side]||[]).filter(x=>!x.veh&&x.units&&x.units.length&&!(x.rif));
    const sl=sp[Math.floor(Math.random()*sp.length)]; c.unit=sl?sl.units[0]:null;
  }
  S.cur=c;
}
const ARROW='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 24 H38 M26 11 L39 24 L26 37"/></svg>';
function objRow(name){
  const tr=[...document.querySelectorAll('#missionsziel-tabelle tbody tr')].find(r=>r.cells[0].textContent.trim()===name);
  return tr?{ziel:tr.cells[1].innerHTML,ueber:tr.cells[2].innerHTML}:{ziel:'–',ueber:'–'};
}
const FIRE_ART=`<svg class="fire-art" viewBox="0 0 320 190" aria-hidden="true">
  <defs>
    <radialGradient id="fg-glow" cx="50%" cy="85%" r="60%"><stop offset="0" stop-color="#ffb347" stop-opacity=".55"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
    <linearGradient id="fg-out" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#b3200e"/><stop offset=".55" stop-color="#e2531a"/><stop offset="1" stop-color="#f28b22" stop-opacity=".9"/></linearGradient>
    <linearGradient id="fg-mid" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f06a12"/><stop offset="1" stop-color="#ffc23d"/></linearGradient>
    <linearGradient id="fg-in" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd659"/><stop offset="1" stop-color="#fff4c2"/></linearGradient>
    <radialGradient id="sm" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#8d8a7c"/><stop offset="1" stop-color="#4a4840"/></radialGradient>
  </defs>
  <ellipse cx="160" cy="160" rx="150" ry="60" fill="url(#fg-glow)"/>
  <g class="smoke" fill="url(#sm)" opacity=".88">
    <circle class="s1" cx="128" cy="60" r="30"/><circle class="s1" cx="160" cy="44" r="36"/><circle class="s1" cx="198" cy="58" r="28"/>
    <circle class="s2" cx="110" cy="28" r="22"/><circle class="s2" cx="150" cy="14" r="24"/><circle class="s2" cx="190" cy="20" r="26"/><circle class="s2" cx="226" cy="34" r="18"/>
    <circle class="s3" cx="240" cy="90" r="26"/><circle class="s3" cx="268" cy="70" r="20"/><circle class="s3" cx="62" cy="100" r="22"/><circle class="s3" cx="44" cy="78" r="16"/>
  </g>
  <g class="flame f1"><path fill="url(#fg-out)" d="M160 176c-44 0-66-22-62-52 3-24 22-34 20-58 18 14 22 32 22 44 6-20 4-46 22-74 6 30 26 44 30 70 4-12 2-22-2-32 18 14 32 34 30 58-2 30-22 44-60 44z"/></g>
  <g class="flame f2"><path fill="url(#fg-mid)" d="M160 174c-30 0-44-16-40-38 3-16 14-22 14-38 12 10 14 22 14 30 6-14 6-30 18-48 4 22 18 30 20 50 3-6 2-14 0-20 12 10 18 24 16 38-2 18-16 26-42 26z"/></g>
  <g class="flame f3"><path fill="url(#fg-in)" d="M160 172c-16 0-24-9-22-22 2-10 8-14 8-24 8 6 10 14 10 20 4-8 4-18 10-28 4 14 12 20 12 32 1 14-6 22-18 22z"/></g>
  <g fill="#2b2117" stroke="#120c07" stroke-width="2">
    <rect x="96" y="166" width="128" height="12" rx="6" transform="rotate(-8 160 172)"/>
    <rect x="100" y="166" width="124" height="12" rx="6" transform="rotate(9 160 172)"/>
  </g>
  <g fill="#ffcf5a"><circle class="sp sp1" cx="124" cy="96" r="2"/><circle class="sp sp2" cx="204" cy="84" r="2.4"/><circle class="sp sp3" cx="178" cy="62" r="1.8"/><circle class="sp sp4" cx="140" cy="70" r="1.6"/></g>
</svg>`;
function fireHTML(){
  return `<div class="gcard rend refire">
    <div class="gc-top">★ Rundenende · Runde ${S.round}</div>
    <div class="re-body">
      <div class="fire-wrap">${FIRE_ART}</div>
      <h3 class="gc-name">Rauch und Feuer</h3>
      <div class="tw"><table class="rt kv re-tab">
        <tr><th>🔥 Feuer</th><td>Jede Einheit und jedes Fahrzeug im Feuer ist automatisch getroffen: Durchschlagswurf mit Durchschlag 3.</td></tr>
        <tr><th>Feuer aus</th><td>Feuer, die schon vor dieser Runde gebrannt haben, gehen jetzt aus. Feuer aus dieser Runde brennen bis zum Ende der nächsten Runde.</td></tr>
        <tr><th>💨 Rauch weg</th><td>Rauch, der schon vor dieser Runde lag, verzieht sich jetzt. Rauch aus dieser Runde bleibt bis zum Ende der nächsten Runde.</td></tr>
      </table></div>
      ${objList().length?'':'<p class="gc-note re-hint">Keine Missionsziele auf der Karte – danach beginnt direkt die nächste Runde.</p>'}
    </div></div>`;
}
const OBJ_ART={Transporter:'trans',Kampfflieger:'flieger','Artilleriegeschütz':'art','Flakgeschütz':'art'};
const FLAK_ART="<svg class=\"fig cmc\" viewBox=\"0 6 222 126\" aria-hidden=\"true\"><g><ellipse cx=\"111\" cy=\"124\" rx=\"90\" ry=\"5\" fill=\"rgba(70,50,20,.3)\"/><path d=\"M30 118 L110 100 L192 118\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"7\" stroke-linecap=\"round\" opacity=\"1\"/><path d=\"M30 118 L110 100 L192 118\" fill=\"none\" stroke=\"#d6c497\" stroke-width=\"4\" stroke-linecap=\"round\" opacity=\"1\"/><path d=\"M110 100 V120\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"6\" stroke-linecap=\"round\" opacity=\"1\"/><path d=\"M84 100 H138 V86 H84 Z\" fill=\"#d6c497\" stroke=\"#1f1a14\" stroke-width=\"2.6\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M92 86 L102 64 H124 L132 86 Z\" fill=\"#d6c497\" stroke=\"#1f1a14\" stroke-width=\"2.6\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M118 65 H124 L132 86 H122 Z\" fill=\"url(#hz-vde)\" stroke=\"none\"/><path d=\"M108 70 L166 18 L172 24 L114 76 Z\" fill=\"#4a4238\" stroke=\"#1f1a14\" stroke-width=\"2.6\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M114 76 L172 24 L176 28 L118 80 Z\" fill=\"#4a4238\" stroke=\"#1f1a14\" stroke-width=\"2.2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M164 14 h10 v10 h-10 Z\" fill=\"#2a241c\" stroke=\"#1f1a14\" stroke-width=\"1.6\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"80\" cy=\"78\" r=\"7\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"1.8\"/><path d=\"M80 71 v14 M73 78 h14\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"1.4\" stroke-linecap=\"round\" opacity=\"1\"/><path d=\"M105.8 93 h8.4 M110 88.8 v8.4\" fill=\"none\" stroke=\"#f6ecd4\" stroke-width=\"3.5999999999999996\" stroke-linecap=\"round\" opacity=\"1\"/><path d=\"M105.8 93 h8.4 M110 88.8 v8.4\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"1.7999999999999998\" stroke-linecap=\"round\" opacity=\"1\"/></g></svg>";
function objIcon(o){
  if(o.flex){ const k=OBJ_ART[o.name]; const svg=o.name==='Flakgeschütz'?FLAK_ART:(k&&ART[k]?ART[k]:''); return `<span class="re-art${o.name==='Flakgeschütz'?' flak':''}">${svg}</span>`; }
  const p=PIECES.find(p=>p.name===o.name||(p.key==='wohn'&&o.name==='Wohnhaus')); return `<span class="re-emo">${p?p.icon:'⚑'}</span>`;
}
window.objIcon=objIcon;
function endHTML(){
  if(S.end<0) return fireHTML();
  const L=objList(), i=S.end, o=L[i]; if(!o) return '';
  const row=objRow(o.name);
  return `<div class="gcard rend">
    <div class="gc-top">★ Rundenende · Runde ${S.round}</div>
    <div class="re-body">
      <div class="re-ic">${objIcon(o)}</div>
      <h3 class="gc-name">⚑ ${o.name}</h3>
      <div class="tw"><table class="rt kv re-tab">
        <tr><th>1–3</th><td>Nichts passiert</td></tr>
        <tr><th>4–5 · Zieleffekt</th><td>${row.ziel}</td></tr>
        <tr><th>6 · Übereffekt</th><td>${row.ueber}</td></tr>
      </table></div>
      <p class="gc-note">Trupps beider Seiten am Ziel zählen (je höchstens 3), Differenz bilden. Die Seite mit mehr Trupps wirft so viele W6 wie die Differenz – nur der höchste Wurf zählt.</p>
    </div></div>`;
}
function cardHTML(c){
  const A=ART_FACTION[c.side]||ART, RIF=RIFLEMAN_FACTION[c.side]||RIFLEMAN, F=FACTIONS[c.side];
  let art='', name='', sub='', body='', notes='', artCls='';
  if(c.kind==='rif'){
    art=RIF.repeat(RIFLEMEN); artCls='five'; name='Gewehrschützen';
    body=weaponTable(['Gewehr']);
  } else if(c.kind==='spec'){
    const u=c.unit;
    if(!u){ name='Spezialeinheit'; body='<p class="gc-note">Diese Armee hat keine einzelne Spezialeinheit.</p>'; }
    else{
      art=A[u.key]; name=u.name;
      const names=u.abil&&u.abil.name==='Veteran'?['Nahkampfwaffe','Maschinengewehr']:(WEAPONS_OF[u.key]||[]);
      const sec=EXTRA_SECTION[u.key]&&document.querySelector('#'+EXTRA_SECTION[u.key]+' p');
      if(u.abil) notes+=`<div class="gc-abil"><div class="ga-h"><span class="ga-star">★</span><span class="ga-k">Generalsfähigkeit</span><span class="ga-n">${u.abil.name}</span></div><p>${u.abil.text}</p></div>`;
      if(sec) notes+=`<p class="gc-note">${sec.textContent}</p>`;
      body+=weaponTable(names);
    }
  } else {
    const v=VEHICLES.find(x=>x.key===c.key); art=A[c.key]; artCls='veh'; name=v?v.name:c.key;
    const card=VEH_SECTION[c.key]&&document.getElementById(VEH_SECTION[c.key]);
    if(card){ const cl=card.cloneNode(true); cl.querySelector('h2')?.remove(); cl.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
      [...cl.querySelectorAll('table.wt')].map(t=>t.closest('.tw')||t).reverse().forEach(w=>cl.prepend(w));   // Waffen zuerst, dann Fahrzeugwerte
      body=cl.innerHTML; }
  }
  return `<div class="gcard ${c.side}">
    <div class="gc-top"><span class="gc-emb">${EMB[c.side]}</span>${F.name}</div>
    <div class="gc-art army ${c.side} ${artCls}">${art}${c.kind==='spec'&&c.unit&&c.unit.abil?`<span class="gc-crest" title="Generalsfähigkeit: ${c.unit.abil.name}">${crestSVG(c.unit.abil.name)}</span>`:''}</div>
    <h3 class="gc-name">${name}</h3>${sub?`<div class="gc-sub">${sub}</div>`:''}
    <div class="gc-body">${body}</div>${notes?`<div class="gc-notes">${notes}</div>`:''}</div>`;
}
let lastCardKey=null;
function render(){
  const el=$('tab-spiel'); if(!el) return;
  if(S.sig!==sigNow()) reset();
  const info=S.end!==null?(S.end<0?'':`Missionsziel ${S.end+1} von ${objList().length}`):`<b>Runde ${S.round}</b><span class="sep"> · </span>noch ${S.deck.length} Karte${S.deck.length===1?'':'n'} im Deck`;
  let card=S.end!==null?endHTML():(S.cur?cardHTML(S.cur):'');
  if(card&&info){ const k=card.indexOf('</div>',card.indexOf('class="gc-top"')); card=card.slice(0,k)+`<span class="gc-info">${info}</span>`+card.slice(k); }
  el.innerHTML=`<div class="gp">
    ${card||`<p class="gp-info">${info}</p>`}
    <button class="big gp-next" id="sp-next" aria-label="Nächste Karte aufdecken" title="Nächste Karte aufdecken">${ARROW}</button>
  </div>`;
  $('sp-next').onclick=draw;
  const gc=el.querySelector('.gcard');
  // Neue Karte (oder neuer Rundenende-Bildschirm): kurz umdrehen. Bei bloßem Neuzeichnen (Lobby, Seitenwahl) nicht.
  const cardKey=S.round+'|'+S.deck.length+'|'+S.end;
  if(gc&&cardKey!==lastCardKey&&lastCardKey!==null){
    gc.classList.add('flip-in');
    // Passende Kurz-Animation zur aufgedeckten Einheit (läuft nach dem Umdrehen)
    const c=S.end===null?S.cur:null, art=gc.querySelector('.gc-art');
    if(c&&art){
      const kind=c.kind==='rif'?'rif':c.kind==='veh'?c.key:(c.unit?c.unit.key:'');
      if(kind) art.classList.add('anim','anim-'+kind);
      if(kind==='flieger'&&typeof Sounds!=='undefined') try{ setTimeout(()=>Sounds.play('plane'),250); }catch(e){}
    }
  }
  lastCardKey=cardKey;
  if(gc){
    if(window.linkRules) linkRules(gc);
  }
  // Weiter-Knopf in der Farbe der Seite, die gerade dran ist. In der Lobby darf nur diese Seite weiterklicken.
  const nb=$('sp-next'), turn=S.end===null&&S.cur?S.cur.side:'';
  nb.classList.toggle('t-de',turn==='de'); nb.classList.toggle('t-al',turn==='al'); nb.classList.toggle('t-end',S.end!==null);
  const me=window.mySide?mySide():'', live=window.lobbyLive?lobbyLive():false;
  const locked=!!(live&&me&&turn&&turn!==me);
  nb.disabled=locked; nb.classList.toggle('locked',locked);
  if(window.diceTurn) diceTurn(turn);
  nb.title=locked?'Dein Freund ist dran':'Nächste Karte aufdecken';
}
window.renderSpiel=render;
window.spielGet=()=>({round:S.round,deck:S.deck,cur:S.cur,newRound:S.newRound,end:S.end,played:S.played});
window.spielSet=o=>{ if(!o) return; S.round=o.round; S.deck=o.deck||[]; S.cur=o.cur||null; S.newRound=!!o.newRound; S.end=(typeof o.end==='number'&&o.end>=-1)?o.end:null; S.played=Array.isArray(o.played)?o.played:(S.cur&&S.cur.kind==='veh'?[S.cur.side+':'+S.cur.key]:[]); S.sig=sigNow(); render(); };
if(typeof STAND!=='undefined'&&STAND&&STAND.spiel&&STAND.spiel.deck) spielSet(STAND.spiel);
render();
})();
