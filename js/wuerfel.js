// ---------- Würfel (in der Lobby sieht der Freund jeden Wurf mit) ----------
(function(){
const btn=$('dice-btn'), pop=$('dice-pop'), tray=$('dp-tray');
let type=6, n=1; try{ const o=JSON.parse(localStorage.getItem('sitzkrieg-wuerfel')); if(o){ type=o.t===20?20:6; n=Math.max(1,Math.min(10,o.n|0||1)); } }catch(e){}
const save=()=>{ try{ localStorage.setItem('sitzkrieg-wuerfel',JSON.stringify({t:type,n})); }catch(e){} };
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const D20='<svg viewBox="0 0 48 48"><polygon class="f0" points="24,2 44,13 44,35 24,46 4,35 4,13" fill="#3f4a2a" stroke="#1b1d14" stroke-width="2"/><polygon points="24,9 38,32 10,32" fill="rgba(255,255,255,.1)" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/><path d="M24 2 24 9 M44 13 38 32 M4 13 10 32 M24 46 10 32 M24 46 38 32 M4 35 10 32 M44 35 38 32" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/></svg>';
function face(el,v){
  if(type===6){ el.innerHTML=Array.from({length:9},(_,i)=>`<i${PIPS[v].includes(i)?' class="p"':''}></i>`).join(''); }
  else el.innerHTML=D20+`<b>${v}</b>`;
  el.setAttribute('aria-label',`W${type}: ${v}`);
}
function sync(){
  pop.querySelectorAll('[data-dt]').forEach(b=>b.classList.toggle('on',+b.dataset.dt===type));
  $('dp-n').textContent=n; pop.querySelector('.dp-n').style.visibility=type===20?'hidden':'';   // W20: immer nur einer
  pop.querySelector('[data-dn="-1"]').disabled=n<=1; pop.querySelector('[data-dn="1"]').disabled=n>=10;
}
const rnd=m=>1+Math.floor(Math.random()*m);
let timers=[], rollId=0;
function roll(given){
  timers.forEach(clearInterval); timers=[]; const myRoll=++rollId;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  tray.innerHTML=''; tray.classList.remove('shake'); void tray.offsetWidth; tray.classList.add('shake');
  const cnt=given?given.length:(type===20?1:n), vals=given||Array.from({length:cnt},()=>rnd(type)), dice=[];
  if(!given&&window.lobby&&lobby.send) lobby.send({type:'dice',t:type,vals});
  vals.forEach((v,i)=>{
    const d=document.createElement('div'); d.className=`wf d${type}`; d.dataset.v=v; d.dataset.i=i;
    d.style.setProperty('--dx',(Math.random()*80-40)+'px'); d.style.setProperty('--rx',(Math.random()*720-360)+'deg');
    d.style.setProperty('--ry',(Math.random()*720-360)+'deg'); d.style.setProperty('--rz',(Math.random()*540-270)+'deg');
    d.style.animationDelay=(i*55)+'ms'; face(d,rnd(type)); tray.appendChild(d); dice.push(d);
    if(!reduce){ d.classList.add('rolling');
      const t=setInterval(()=>face(d,rnd(type)),70); timers.push(t);
      setTimeout(()=>{ clearInterval(t); face(d,v); d.classList.remove('rolling'); void d.offsetWidth; d.classList.add('land'); mark(d,v); },620+i*55);
    } else { face(d,v); mark(d,v); }
  });
  // Nach dem Wurf: Würfel sortieren sich von groß nach klein (springen im Bogen an ihren Platz)
  if(cnt>1) setTimeout(()=>{ if(myRoll===rollId) sortDice(reduce); },reduce?0:620+(cnt-1)*55+420);
}
function sortDice(reduce){
  const els=[...tray.children], order=[...els].sort((a,b)=>(b.dataset.v-a.dataset.v)||(a.dataset.i-b.dataset.i));
  if(order.every((e,i)=>e===els[i])) return;
  const first=new Map(els.map(e=>[e,e.getBoundingClientRect()]));
  els.forEach(e=>e.classList.remove('land','rolling'));
  order.forEach(e=>tray.appendChild(e));
  if(reduce||!Element.prototype.animate) return;
  order.forEach((e,i)=>{
    const f=first.get(e), l=e.getBoundingClientRect(), dx=f.left-l.left, dy=f.top-l.top;
    if(!dx&&!dy) return;
    const lift=-18-Math.min(20,Math.abs(dx)/6);
    e.animate([
      {transform:`translate(${dx}px,${dy}px)`},
      {transform:`translate(${dx*.5}px,${dy*.5+lift}px) scale(1.15) rotate(${dx>0?-12:12}deg)`,offset:.45},
      {transform:'translate(0,2px) scale(.96)',offset:.85},
      {transform:'none'}
    ],{duration:520,delay:i*45,easing:'cubic-bezier(.3,.7,.25,1)',fill:'backwards'});
  });
}
function mark(d,v){ if(type===20){ d.classList.add(v>=9?'hit':'miss'); return; } if(v===type) d.classList.add('max'); if(v===1) d.classList.add('one'); }   // W20: ab 9 gold, sonst rot
function openPop(){ pop.classList.remove('out'); pop.hidden=false; btn.classList.add('open'); sync(); }
function closePop(){ if(pop.hidden) return; pop.classList.add('out'); setTimeout(()=>{ pop.hidden=true; pop.classList.remove('out'); btn.classList.remove('open'); },190); }
btn.onclick=e=>{ e.stopPropagation(); openPop(); };
// Griff nach rechts wischen = öffnen
let sx=null;
btn.addEventListener('pointerdown',e=>{ sx=e.clientX; try{ btn.setPointerCapture(e.pointerId); }catch(_){} });
btn.addEventListener('pointermove',e=>{ if(sx!==null&&e.clientX-sx>18){ sx=null; openPop(); } });
btn.addEventListener('pointerup',()=>{ sx=null; }); btn.addEventListener('pointercancel',()=>{ sx=null; });
// Fenster nach links wischen = schließen
let px=null,py=null;
pop.addEventListener('pointerdown',e=>{ if(e.target.closest('button')) return; px=e.clientX; py=e.clientY; });
pop.addEventListener('pointermove',e=>{ if(px!==null&&px-e.clientX>45&&Math.abs(e.clientY-py)<40){ px=null; closePop(); } });
pop.addEventListener('pointerup',()=>{ px=null; }); pop.addEventListener('pointercancel',()=>{ px=null; });
pop.addEventListener('click',e=>{
  e.stopPropagation();
  const t=e.target.closest('[data-dt]'); if(t){ type=+t.dataset.dt; tray.innerHTML=''; save(); sync(); return; }
  const k=e.target.closest('[data-dn]'); if(k){ n=Math.max(1,Math.min(10,n+(+k.dataset.dn))); save(); sync(); return; }
  if(e.target.closest('#dp-roll')&&!$('dp-roll').disabled) roll();
});
// Wurf vom Freund: gleiche Würfel, gleiche Animation
window.remoteDice=m=>{
  if(!Array.isArray(m.vals)||!m.vals.length) return;
  type=m.t===20?20:6; sync();
  if(pop.hidden) openPop();
  roll(m.vals.slice(0,10).map(v=>Math.max(1,Math.min(type,v|0))));
  if(typeof Sounds!=='undefined') try{ Sounds.play('dice', nextDiceVariant()); }catch(e){}
};
// Rahmen in der Farbe der Seite, die gerade dran ist
window.diceTurn=t=>{ pop.classList.toggle('dp-de',t==='de'); pop.classList.toggle('dp-al',t==='al');
  const me=window.mySide?mySide():'', live=window.lobbyLive?lobbyLive():false, r=$('dp-roll');
  const locked=!!(live&&me&&t&&t!==me); r.disabled=locked; r.title=locked?'Dein Freund ist dran':''; };
try{ const g=window.spielGet&&spielGet(); if(g&&g.end===null&&g.cur) diceTurn(g.cur.side); }catch(e){}
sync();
})();
