// ---------- Regelbegriffe antippen -> Regelwerk-Abschnitt als Popup ----------
(function(){
const TERMS=[
  ['Kl. Scheibe','scheiben'],['Gr. Scheibe','scheiben'],['Scheiben','scheiben'],['Scheibe','scheiben'],
  ['Plätten','plaetten'],['Flammenwerfer','flammenwerfer'],['Feuermarker','feuer'],['Feuer','feuer'],['Rauch','rauch'],
  ['Nahkampfreichweite','nahkampf'],['Nahkampf','nahkampf'],['Deckung','deckung'],['Konzentration','konzentration'],
  ['unwegsames Gelände','gelaende'],['unwegsamem Gelände','gelaende'],['Unwegsames Gelände','gelaende'],
  ['Durchschlagswurf','durchschlagstabelle'],['Trefferwurf','treffertabelle'],['Lebenspunkte','lebenspunkte'],['Lebenspunkt','lebenspunkte'],
  ['Hochexplosiv','hochexplosiv'],['Sprengmunition','hochexplosiv'],['Einsturz','einsturz'],['Tod von oben','tod-von-oben'],
  ['Personenminen','minenleger'],['Panzerminen','minenleger'],['Minen','minenleger'],['Medikit','medikit'],['Mechaniker','mechaniker'],
  ['Stacheldraht','stacheldraht'],['Flugzeugwrack','flugzeugwrack'],['Abtrünnige','abtruennige'],['Fahrzeugschaden','fahrzeugschaden']
].filter(([,id])=>document.getElementById(id));
const esc=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const RE=new RegExp('(?<![A-Za-zÄÖÜäöüß])('+TERMS.map(t=>esc(t[0])).sort((a,b)=>b.length-a.length).join('|')+')(?![a-zäöüß])','g');
const ID=Object.fromEntries(TERMS);
window.linkRules=function(root){
  if(!root) return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{
    const p=n.parentElement; if(!p||p.closest('th,button,a,h3,.gc-top,.rlink,.ga-h,svg')) return NodeFilter.FILTER_REJECT;
    RE.lastIndex=0; return RE.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP; }});
  const list=[]; while(w.nextNode()) list.push(w.currentNode);
  for(const n of list){
    const t=n.nodeValue, f=document.createDocumentFragment(); let last=0, m; RE.lastIndex=0;
    while((m=RE.exec(t))){
      if(m.index>last) f.appendChild(document.createTextNode(t.slice(last,m.index)));
      const sp=document.createElement('span'); sp.className='rlink'; sp.dataset.r=ID[m[1]]; sp.tabIndex=0; sp.setAttribute('role','button'); sp.textContent=m[1];
      f.appendChild(sp); last=m.index+m[0].length;
    }
    if(last<t.length) f.appendChild(document.createTextNode(t.slice(last)));
    n.parentNode.replaceChild(f,n);
  }
};
function openRule(id){
  const card=document.getElementById(id); if(!card) return;
  const c=card.cloneNode(true), h=c.querySelector('h2'); const title=h?h.textContent:''; h?.remove(); c.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
  $('pop-k').textContent='Regelwerk'; $('pop-t').textContent=title; $('pop-d').hidden=true;
  $('pop-body').innerHTML=`<div class="pen-nav"><button type="button" class="sec" id="pen-rules" data-sec="${id}">📜 Im Regelwerk öffnen</button></div>`;
  $('pop-body').append(...c.childNodes); if(typeof markPen==='function') markPen($('pop-body'));
  $('pop').classList.remove('nohead'); $('pop').classList.toggle('wide',!!card.querySelector('table')); $('pop').hidden=false; $('pop-x').focus();
}
document.addEventListener('click',e=>{ const r=e.target.closest('.rlink'); if(r){ e.stopPropagation(); openRule(r.dataset.r); } });
document.addEventListener('keydown',e=>{ const r=e.target.closest&&e.target.closest('.rlink'); if(r&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); openRule(r.dataset.r); } });

// ---------- Suche im Regelwerk ----------
const rw=$('regelwerk'), q=$('rw-q'), cards=[...rw.querySelectorAll('.rcard')];
const norm=t=>t.replace(/­/g,'').toLowerCase();
const HL=('highlights' in CSS)&&typeof Highlight==='function';
let qt=null;
function search(){
  const v=norm(q.value.trim());
  if(HL) CSS.highlights.delete('rw-hit');
  if(!v){ rw.classList.remove('searching'); cards.forEach(c=>c.classList.remove('rw-hide')); $('rw-n').textContent=''; $('rw-none').hidden=true; return; }
  rw.classList.add('searching'); let n=0; const ranges=[];
  for(const c of cards){
    const hit=norm(c.textContent).includes(v); c.classList.toggle('rw-hide',!hit); if(!hit) continue; n++;
    if(!HL) continue;
    const w=document.createTreeWalker(c,NodeFilter.SHOW_TEXT);
    while(w.nextNode()){ const node=w.currentNode, raw=node.nodeValue;
      // Positionen ohne weiche Trennstriche suchen und auf den Originaltext zurückrechnen
      const map=[]; let flat=''; for(let i=0;i<raw.length;i++){ if(raw[i]==='­') continue; map.push(i); flat+=raw[i].toLowerCase(); }
      let k=flat.indexOf(v); while(k>=0){ const r=new Range(); r.setStart(node,map[k]); r.setEnd(node,map[k+v.length-1]+1); ranges.push(r); k=flat.indexOf(v,k+v.length); } }
  }
  if(HL&&ranges.length) CSS.highlights.set('rw-hit',new Highlight(...ranges));
  $('rw-n').textContent=n?`${n} Abschnitt${n===1?'':'e'}`:''; $('rw-none').hidden=n>0;
}
q.addEventListener('input',()=>{ clearTimeout(qt); qt=setTimeout(search,120); });
q.addEventListener('keydown',e=>{ if(e.key==='Escape'){ q.value=''; search(); } });

// ---------- Lobby: eigene Seite (jede Seite nur 1 mal; der Freund sieht, was vergeben ist) ----------
let me='', other=''; try{ me=localStorage.getItem('sitzkrieg-meine-seite')||''; }catch(e){}
window.mySide=()=>me;
window.lobbyLive=()=>!!(window.lobby&&lobby.state.open);
const btns=[...document.querySelectorAll('[data-me]')];
const NAME={de:'Deutsche',al:'Alliierte'};
const OPP={de:'al',al:'de'};
const sync=()=>btns.forEach(b=>{ const v=b.dataset.me; b.classList.toggle('on',v===me); const taken=!!v&&v===other; b.disabled=false; b.classList.toggle('taken',taken); b.title=taken?'Seite deines Freundes – antippen zum Tauschen':''; });
const note=t=>{ const el=$('lb-toast'); el.textContent=t; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2600); };
const setMe=v=>{ me=v; try{ localStorage.setItem('sitzkrieg-meine-seite',me); }catch(e){} sync(); if(window.renderSpiel) renderSpiel(); };
window.sendMySide=(swap)=>{ if(window.lobby&&lobby.send) lobby.send({type:'side',side:me,swap:!!swap}); };
window.lobbyPeerSide=(s,swap)=>{
  other=s;
  if(s&&s===me&&(swap||lobby.state.role==='guest')){ setMe(OPP[s]); note(swap?'Seiten getauscht – du spielst jetzt '+NAME[me]:'Du spielst '+NAME[me]); sendMySide(); }   // Tausch oder Doppelwahl: freie Seite nehmen
  else if(s&&!me){ setMe(OPP[s]); sendMySide(); }   // noch keine Seite: automatisch die freie
  sync(); if(window.renderSpiel) renderSpiel();
};
btns.forEach(b=>b.onclick=()=>{ const v=b.dataset.me; if(v===me) return; const swap=!!v&&v===other; if(swap) other=OPP[v]; setMe(v); sendMySide(swap); });
sync();
// Lobby an/aus -> Spielansicht auffrischen
new MutationObserver(()=>{ if(window.renderSpiel) renderSpiel(); }).observe($('lb-on'),{attributes:true,attributeFilter:['hidden']});
if(window.renderSpiel) renderSpiel();
})();

// ---------- Kartenfeld antippen -> passende Regeln zu genau diesem Feld ----------
(function(){
  function openField(pi){
    const x=current&&current.pieces[pi]; if(!x) return;
    const ms=typeof missionSetup==='function'?missionSetup():null;
    const oi=ms?ms.objectives.indexOf(x):-1, obj=oi>=0?ms.objInfo[oi]:null;
    const ex=ms&&ms.exts?ms.exts.find(e=>e.p===x):null;
    const f=(RULES.felder||{})[x.p.key]||{};
    const icon=EMOJI_IMG[x.p.icon.replace('️','')];
    let h=`<div class="fi-head">${icon?`<img src="${icon}" alt="">`:''}<div><b>${x.p.biome==='b'?'Stadtfeld':'Grünes Feld'}</b> · belegt ${x.cells.length} Feld${x.cells.length>1?'er':''}</div></div>`;
    if(f.regel) h+=`<p class="fi-rule">${f.regel}</p>`;
    if(obj){
      const row=(RULES.missionsziele.tabelle||[]).find(r=>r.name===obj.name);
      h+=`<h4 class="fi-h">⚑ Missionsziel${obj.flex?`: ${obj.name}`:''}</h4>`;
      if(row) h+=`<div class="tw"><table class="rt kv"><tr><th>1–3</th><td>Nichts passiert</td></tr><tr><th>4–5 · Zieleffekt</th><td>${row.ziel}</td></tr><tr><th>6 · Übereffekt</th><td>${row.ueber}</td></tr></table></div>`;
      h+=`<p class="fi-note">Am Rundenende werden die Trupps beider Seiten hier gezählt (je höchstens 3). <span class="rlink" data-r="missionsziele" role="button" tabindex="0">Regeln</span></p>`;
    }
    if(ex){
      const fe=(RULES.felderweiterungen||[]).find(e=>e.name===ex.name);
      h+=`<h4 class="fi-h">${ex.icon} Felderweiterung: ${ex.name}</h4><p>${fe?fe.effekt:''}${fe&&fe.link?` <span class="rlink" data-r="${fe.link}" role="button" tabindex="0">Regeln</span>`:''}</p>`;
    }
    $('pop-k').textContent='Kartenfeld'; $('pop-t').textContent=x.p.name; $('pop-d').hidden=true;
    $('pop-body').innerHTML=h; if(window.linkRules) linkRules($('pop-body'));
    $('pop').classList.remove('wide','nohead'); $('pop').hidden=false; $('pop-x').focus();
  }
  $('map').addEventListener('click',e=>{ const c=e.target.closest('.cell[data-pi]'); if(c) openField(+c.dataset.pi); });
  $('map').addEventListener('keydown',e=>{ const c=e.target.closest&&e.target.closest('.cell[data-pi]'); if(c&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); openField(+c.dataset.pi); } });
})();
