// ===================== Musik: YouTube-Playlist im Lautsprecher-Popup =====================
(function(){
const $m=id=>document.getElementById(id);
let player=null, ready=false, apiP=null, cur=null, shuffle=false, pending=null;
const store=(k,v)=>{ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } };
function parse(u){
  u=(u||'').trim(); if(!u) return null;
  try{
    const url=new URL(u.startsWith('http')?u:'https://'+u);
    const list=url.searchParams.get('list');
    let vid=url.searchParams.get('v'); if(!vid && /youtu\.be$/.test(url.hostname)) vid=url.pathname.slice(1);
    if(!vid){ const m=url.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{6,})/); if(m) vid=m[1]; }
    if(list) return {list,vid}; if(vid) return {vid};
  }catch(e){}
  if(/^PL[\w-]{10,}$|^OL[\w-]{10,}$|^RD[\w-]{6,}$/.test(u)) return {list:u};
  return null;
}
function loadApi(){
  if(window.YT&&YT.Player) return Promise.resolve();
  if(apiP) return apiP;
  apiP=new Promise((ok,fail)=>{ const prev=window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady=()=>{ prev&&prev(); ok(); };
    const sc=document.createElement('script'); sc.src='https://www.youtube.com/iframe_api'; sc.onerror=()=>{ apiP=null; fail(); }; document.head.appendChild(sc); });
  return apiP;
}
let muVol=60; { const v=store('sitzkrieg-musik-vol'); if(v!==null&&v!==undefined&&v!=='') muVol=Math.max(0,Math.min(100,+v)); }
const vol=()=>muVol;
function showVol(){ $m('mu-vol').value=muVol; $m('mu-vol-o').textContent=muVol+' %'; }
function now(t){ $m('mu-now').textContent=t||''; }
function upd(){
  const ok=player&&ready&&typeof player.getPlayerState==='function'; const st=ok?player.getPlayerState():-1;
  $m('mu-play').textContent=st===1||st===3?'⏸':'▶';
  if(ok){ const d=player.getVideoData&&player.getVideoData(); if(d&&d.title) now('♪ '+d.title); }
}
async function load(src,autoplay){
  cur=src; $m('mu-empty').hidden=true; now('Lädt …');
  try{ await loadApi(); }catch(e){ now('Kein Internet – YouTube nicht erreichbar'); return; }
  const vars={playsinline:1,rel:0,modestbranding:1,autoplay:autoplay?1:0};
  if(src.list){ vars.listType='playlist'; vars.list=src.list; }
  if(player){   // neue Playlist: alten Player komplett ersetzen (zuverlässiger als umschalten)
    try{ player.destroy(); }catch(e){}
    player=null; ready=false;
    $m('mu-player')?.remove();
  }
  // eigenes iframe mit ausdrücklicher Herkunftsangabe (sonst meldet YouTube „Fehler 153“)
  const q=new URLSearchParams({...vars,enablejsapi:1,origin:location.origin,widget_referrer:location.href});
  const fr=document.createElement('iframe');
  fr.id='mu-player'; fr.title='YouTube-Musik';
  fr.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
  fr.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');
  fr.src='https://www.youtube.com/embed/'+(src.vid||'videoseries')+'?'+q.toString();
  $m('mu-player')?.remove(); document.querySelector('.mu-player').prepend(fr);
  player=new YT.Player(fr,{
    events:{
      onReady:()=>{ ready=true; now(''); player.setVolume(vol()); if(shuffle&&src.list) player.setShuffle(true);
        if(pending){ const p=pending; pending=null; load(p.src,p.autoplay); } upd(); },
      onStateChange:()=>upd(),
      onError:e=>{ now(e&&(e.data===101||e.data===150)?'Dieses Video darf nicht eingebettet werden – weiter …':'Video nicht abspielbar – weiter …'); setTimeout(()=>{ try{ player.nextVideo(); }catch(_){} },1500); }
    }});
}
function go(){
  const src=parse($m('mu-url').value);
  if(!src){ now('Das ist kein YouTube-Link'); return; }
  store('sitzkrieg-musik',$m('mu-url').value.trim()); load(src,true);
}
$m('mu-load').onclick=go;
$m('mu-url').addEventListener('keydown',e=>{ if(e.key==='Enter') go(); });
$m('mu-play').onclick=()=>{
  if(!player||!ready){ const src=parse($m('mu-url').value); if(src) load(src,true); return; }
  const st=player.getPlayerState(); if(st===1||st===3) player.pauseVideo(); else player.playVideo();
};
$m('mu-next').onclick=()=>{ try{ player&&player.nextVideo(); }catch(e){} };
$m('mu-prev').onclick=()=>{ try{ player&&player.previousVideo(); }catch(e){} };
$m('mu-shuf').onclick=()=>{ shuffle=!shuffle; $m('mu-shuf').classList.toggle('on',shuffle); try{ player&&player.setShuffle(shuffle); }catch(e){} store('sitzkrieg-musik-shuffle',shuffle?'1':'0'); };
// eigener Regler für die Musik (der senkrechte Regler bleibt für die Töne der App)
$m('mu-vol').addEventListener('input',()=>{ muVol=+$m('mu-vol').value; showVol(); store('sitzkrieg-musik-vol',String(muVol)); try{ player&&ready&&player.setVolume(muVol); }catch(e){} });
showVol();
$m('vol-btn').addEventListener('click',()=>{
  // gespeicherte Playlist beim ersten Öffnen vorbereiten (ohne Autoplay)
  if(!player&&cur===null){ const src=parse($m('mu-url').value); if(src) load(src,false); }
});
shuffle=store('sitzkrieg-musik-shuffle')==='1'; $m('mu-shuf').classList.toggle('on',shuffle);
const saved=store('sitzkrieg-musik'); if(saved) $m('mu-url').value=saved;
setInterval(()=>{ if(player&&ready) upd(); },3000);
})();
