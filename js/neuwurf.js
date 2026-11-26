// ===================== Neue Karte gedrückt halten: Karte, Armeen und Deck neu =====================
(function(){
const HOLD=900, btn=$('gen'); btn.style.setProperty('--hold',HOLD+'ms');
// Text in ein span packen, damit er über dem roten Balken liegt
if(!btn.querySelector('span.gen-l')){ const sp=document.createElement('span'); sp.className='gen-l'; while(btn.firstChild) sp.appendChild(btn.firstChild); btn.appendChild(sp); }
let t=null, fired=false;
function stop(){ clearTimeout(t); t=null; btn.classList.remove('charging'); }
btn.addEventListener('pointerdown',e=>{
  if(e.button>0) return; fired=false; stop();
  void btn.offsetWidth; btn.classList.add('charging');
  t=setTimeout(()=>{
    t=null; fired=true; btn.classList.remove('charging');
    btn.classList.remove('fired'); void btn.offsetWidth; btn.classList.add('fired');
    if(navigator.vibrate) try{ navigator.vibrate(60); }catch(e){}
    if(typeof Sounds!=='undefined') try{ Sounds.play('dice', nextDiceVariant()); }catch(e){}
    btn.onclick&&btn.onclick();          // neue Karte (und ggf. Lobby erstellen)
    genArmies();                          // neue Armeen -> Deck startet neu
    if(window.spielReset) spielReset();
    if(window.netChanged) netChanged();
    showToast('Alles neu: Karte, Armeen und Deck');
  },HOLD);
});
['pointerup','pointerleave','pointercancel'].forEach(ev=>btn.addEventListener(ev,()=>{ if(t) stop(); }));
btn.addEventListener('contextmenu',e=>e.preventDefault());
// Nach dem langen Drücken keinen zusätzlichen normalen Klick auslösen
window.addEventListener('click',e=>{ if(fired && e.target.closest&&e.target.closest('#gen')){ e.stopPropagation(); e.preventDefault(); fired=false; } },true);
// ---------- Video beim Neu-Würfeln: grüner Hintergrund wird live entfernt ----------
let rv=null, rcv=null, rctx=null, rRAF=0, rBox=null;
function primeReroll(){
  if(!rv){ rv=document.createElement('video'); rv.src='reroll.mp4'; rv.preload='auto'; rv.playsInline=true; rv.setAttribute('playsinline',''); rv.crossOrigin='anonymous'; }
  if(rv.paused&&!rBox){ rv.muted=true; const p=rv.play(); if(p&&p.then) p.then(()=>{ if(!rBox){ rv.pause(); rv.currentTime=0; } }).catch(()=>{}); }
}
function keyFrame(){
  if(!rBox) return;
  const w=rcv.width,h=rcv.height; rctx.drawImage(rv,0,0,w,h);
  const img=rctx.getImageData(0,0,w,h), d=img.data;
  for(let i=0;i<d.length;i+=4){
    const r=d[i],g=d[i+1],b=d[i+2], m=r>b?r:b, k=g-m;      // wie viel „grüner“ als Rot/Blau
    if(k>28){ const a=Math.max(0,Math.min(255,255-(k-28)*6)); d[i+3]=a; if(a>0) d[i+1]=m; }
    else if(k>0) d[i+1]=m+(k>>1);                          // grünen Rand abschwächen
  }
  rctx.putImageData(img,0,0);
  rRAF=requestAnimationFrame(keyFrame);
}
window.playReroll=()=>playReroll();
function stopReroll(){ cancelAnimationFrame(rRAF); if(rBox){ rBox.remove(); rBox=null; } if(rv){ try{ rv.pause(); }catch(e){} } }
function playReroll(){
  primeReroll(); stopReroll();
  rBox=document.createElement('div'); rBox.className='reroll-fx';
  rcv=document.createElement('canvas'); rcv.width=432; rcv.height=480; rctx=rcv.getContext('2d',{willReadFrequently:true});
  rBox.appendChild(rcv); document.body.appendChild(rBox);
  rv.currentTime=0; rv.muted=false; rv.volume=Math.max(0,Math.min(1,(typeof MASTER_VOL==='number'?MASTER_VOL:0.8)));
  if(rv.volume<=0) rv.muted=true;
  const go=()=>{ cancelAnimationFrame(rRAF); rRAF=requestAnimationFrame(keyFrame); };
  rv.play().then(go).catch(()=>{ rv.muted=true; rv.play().then(go).catch(()=>stopReroll()); });   // ohne Ton, falls der Browser Ton blockiert
  rv.onended=()=>{ rBox&&rBox.classList.add('out'); setTimeout(stopReroll,250); };
}
function showToast(txt){ const el=$('lb-toast'); if(!el) return; el.textContent=txt; el.classList.add('show'); clearTimeout(showToast.t); showToast.t=setTimeout(()=>el.classList.remove('show'),2200); }
})();
