// ---------- Sounds (eigene Dateien, eingebettet) ----------
const SOUND_FILES={"gewehr": "assets/sounds/gewehr.mp3", "scharf": "assets/sounds/scharf.mp3", "pistole": "assets/sounds/pistole.mp3", "schrot": "assets/sounds/schrot.mp3", "mg": "assets/sounds/mg.mp3", "kanone": "assets/sounds/kanone.mp3", "explosion": "assets/sounds/explosion.mp3", "abschuss": "assets/sounds/abschuss.mp3", "plane": "assets/sounds/plane.mp3", "chair": "assets/sounds/chair.mp3", "dice": "assets/sounds/dice.mp3", "flash": "assets/sounds/flash.mp3", "menu": "assets/sounds/menu.mp3", "button": "assets/sounds/button.mp3"};
const NO_STACK={menu:true,plane:true};
const FULL_VOL={flash:true};
// Würfel: dice1.mp3 in 5 Tonhöhen-Varianten; jeder Wurf nimmt zufällig eine andere als beim letzten Mal
// Tonhöhen-Varianten: jeder Klick nimmt zufällig eine andere Variante als beim letzten Mal
const VARIANTS={dice:[0.88,0.94,1.0,1.06,1.13], chair:[0.86,0.93,1.0,1.07,1.15]};
const lastVariant={};
function nextVariant(name){ const v=VARIANTS[name]; let i; do{ i=Math.floor(Math.random()*v.length); }while(i===lastVariant[name] && v.length>1); lastVariant[name]=i; return v[i]; }
function nextDiceVariant(){ return nextVariant('dice'); }   // diese Sounds starten nicht neu, solange sie noch laufen
const SOUND_VOL={menu:.8,button:.9,flash:1,dice:1,chair:.85,plane:.8,gewehr:.55,scharf:.7,pistole:.55,schrot:.7,mg:.65,kanone:.9,explosion:.85,abschuss:.6};   // Waffen-Sounds: CC0, opengameart.org (Free Firearm Sound Library, 25 CC0 bang SFX)
let MASTER_VOL=0.8; try{ const v=localStorage.getItem('sitzkrieg-vol'); if(v!==null) MASTER_VOL=Math.max(0,Math.min(1,+v)); }catch(e){}
const Sounds=(()=>{
  let ctx=null; const buf={}; let loading=null; const busy={};
  function b64(a){ const s=atob(a), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return u.buffer; }
  function init(){
    if(loading) return loading;
    const C=window.AudioContext||window.webkitAudioContext;
    if(!C){ loading=Promise.resolve(); return loading; }
    ctx=new C();
    loading=Promise.all(Object.entries(SOUND_FILES).map(([k,url])=>fetch(url).then(r=>r.arrayBuffer()).then(ab=>new Promise(res=>{
      try{ ctx.decodeAudioData(ab,x=>{ buf[k]=x; res(); },()=>res()); }catch(e){ res(); }
    })).catch(()=>{})));
    return loading;
  }
  function fallback(name,rate=1){ try{ const a=new Audio(SOUND_FILES[name]); if(NO_STACK[name]){ busy[name]=true; a.onended=a.onerror=()=>{ busy[name]=false; }; } a.volume=Math.min(1,SOUND_VOL[name]*(FULL_VOL[name]?1:MASTER_VOL)); a.preservesPitch=false; a.mozPreservesPitch=false; a.webkitPreservesPitch=false; a.playbackRate=rate; a.play().catch(()=>{}); }catch(e){} }
  function play(name,rate=1){
    if(MASTER_VOL<=0 && !FULL_VOL[name]) return;
    if(NO_STACK[name] && busy[name]) return;
    if(!ctx){ init(); fallback(name,rate); return; }     // erster Klick: sofort per <audio>, danach Web Audio
    if(ctx.state==='suspended') ctx.resume();
    const x=buf[name]; if(!x){ fallback(name,rate); return; }
    const src=ctx.createBufferSource(); src.buffer=x; src.playbackRate.value=rate;
    if(NO_STACK[name]){ busy[name]=true; src.onended=()=>{ busy[name]=false; }; } const g=ctx.createGain(); g.gain.value=SOUND_VOL[name]*(FULL_VOL[name]?1:MASTER_VOL);
    src.connect(g).connect(ctx.destination); src.start();
  }
  return {play};
})();
// Lautstärkeregler
(function(){
  const r=document.getElementById('vol-r'), o=document.getElementById('vol-o'), box=document.getElementById('vol'), btn=document.getElementById('vol-btn');
  let last=MASTER_VOL>0?MASTER_VOL:0.8;
  function show(){ const p=Math.round(MASTER_VOL*100); r.value=p; o.textContent=p+' %'; box.classList.toggle('muted',MASTER_VOL<=0);
    r.style.setProperty('--p',p+'%'); btn.title=MASTER_VOL<=0?'Ton aus':'Lautstärke '+p+' %'; }
  function set(v,save=true){ MASTER_VOL=Math.max(0,Math.min(1,v)); if(MASTER_VOL>0) last=MASTER_VOL; show(); if(save) try{ localStorage.setItem('sitzkrieg-vol',MASTER_VOL); }catch(e){} }
  r.addEventListener('input',()=>set(r.value/100));
  r.addEventListener('change',()=>Sounds.play('button'));
  btn.addEventListener('click',e=>{
    box.classList.toggle('open');   // Regler herausklappen / einklappen
  });
  document.addEventListener('click',e=>{ if(!box.contains(e.target)) box.classList.remove('open'); });
  show();
})();
document.addEventListener('click',e=>{
  if(e.target.closest('#vol')) return;
  const el=e.target.closest('button,summary,a,[role=button],.slot[data-veh],.slot[data-squad]'); if(!el) return;
  if(el.id==='pop' ) return;
  let n='button';
  if(el.closest('.tabs')) n='menu';
  if(el.id==='gen'||el.id==='fab'||el.id==='army-gen'||el.id==='dp-roll'){ Sounds.play('dice', nextDiceVariant()); return; }
  if(el.id==='rot'){ Sounds.play('chair', nextVariant('chair')); return; }
     // Kampfflieger Ja: Flugzeug fliegt vorbei   // Karte drehen: Stuhlrücken   // dice1.mp3 in einer zufälligen Tonhöhen-Variante
  if(el.id==='theme' && document.documentElement.getAttribute('data-theme')==='dark') return;   // Blendgranate übernimmt
  Sounds.play(n);
},true);
