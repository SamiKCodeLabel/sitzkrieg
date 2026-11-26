// ===================== Lobby: 2 Geräte live verbinden (PeerJS / WebRTC) =====================
(function(){
const NET={peer:null,conn:null,role:null,code:null,applying:false,ts:0,timer:null,retry:0,lib:null,rejoin:false};
const PREFIX='sitzkrieg2d-lobby-', ABC='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode=()=>Array.from({length:4},()=>ABC[Math.floor(Math.random()*ABC.length)]).join('');
const store=(v)=>{ try{ if(v===undefined) return JSON.parse(localStorage.getItem('sitzkrieg-lobby2d')); localStorage.setItem('sitzkrieg-lobby2d',JSON.stringify(v)); }catch(e){ return null; } };
let toastT; function toast(t){ const el=$('lb-toast'); el.textContent=t; el.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove('show'),2600); }
function loadLib(){
  if(window.Peer) return Promise.resolve();
  if(NET.lib) return NET.lib;
  NET.lib=new Promise((ok,fail)=>{ const sc=document.createElement('script'); sc.src='https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
    sc.onload=ok; sc.onerror=()=>{ NET.lib=null; fail(new Error('offline')); }; document.head.appendChild(sc); });
  return NET.lib;
}
function ui(state,text){
  const on=!!NET.role, b=$('net-btn');
  b.classList.toggle('live',on&&state==='on'); b.classList.toggle('wait',on&&state!=='on');
  const linked=!!(NET.conn&&NET.conn.open);
  $('lb-off').hidden=NET.role==='guest'||linked; $('lb-on').hidden=!on;
  $('lb-on').classList.toggle('ok',state==='on');
  $('lb-code').textContent=NET.code||'––––';
  $('lb-status').title=text||'';
}
function remember(){ store(NET.role?{role:NET.role,code:NET.code,t:Date.now()}:null); }
function snapshot(){
  return {type:'state',ts:NET.ts,from:NET.role,size:$('size').value,seed:current?current.seed:0,settings,
          armies:{de:armies.de,al:armies.al},spiel:window.spielGet?spielGet():null};
}
function send(m){ if(NET.conn&&NET.conn.open){ try{ NET.conn.send(m); }catch(e){} } }
function netChanged(){
  if(window.saveStand) saveStand();
  if(NET.applying||!NET.conn) return;
  clearTimeout(NET.timer);
  NET.timer=setTimeout(()=>{ NET.ts++; send(snapshot()); },60);   // Zähler statt Uhrzeit: Handy-Uhren gehen unterschiedlich
}
window.netChanged=netChanged;
function apply(m){
  // Ältere Stände verwerfen. Gleichstand (beide gleichzeitig): der Stand des Gastgebers gilt.
  if(m.ts<NET.ts || (m.ts===NET.ts && NET.role==='host')) return;
  NET.applying=true;
  try{
    NET.ts=m.ts;
    if(m.settings) settings=m.settings;
    $('size').value=m.size;
    run(m.seed);
    if(m.armies){ armies.de=m.armies.de; armies.al=m.armies.al; renderArmy('de'); renderArmy('al'); }
    if(m.spiel&&window.spielSet) spielSet(m.spiel);
    try{ buildPool(); }catch(e){}
  } finally { NET.applying=false; if(window.saveStand) saveStand(); }
}
function onData(m){
  if(!m||typeof m!=='object') return;
  if(m.type==='full'){ toast('Diese Lobby ist schon voll'); leave(); return; }
  if(m.type==='hello'){ NET.ts=Math.max(NET.ts,m.ts|0)+1; send(snapshot()); toast('Dein Freund ist in der Lobby'); }
  else if(m.type==='state') apply(m);
  else if(m.type==='side'&&window.lobbyPeerSide) lobbyPeerSide(m.side||'',!!m.swap);
  else if(m.type==='dice'&&window.remoteDice) remoteDice(m);
}
function attach(conn){
  if(NET.conn && NET.conn!==conn){ const old=NET.conn; NET.conn=null; try{ old.close(); }catch(e){} }
  NET.conn=conn;
  conn.on('open',()=>{ NET.retry=0; ui('on','Verbunden'); if(NET.role==='guest'){ send({type:'hello',ts:NET.ts}); toast('Mit Lobby '+NET.code+' verbunden'); } if(window.sendMySide) sendMySide(); });
  conn.on('data',onData);
  conn.on('close',()=>{ if(NET.conn===conn) NET.conn=null; if(window.lobbyPeerSide) lobbyPeerSide(''); lost(); });
  conn.on('error',()=>{});
}
function lost(){
  if(!NET.role) return;
  if(NET.role==='host'){ ui('wait','Warte auf Freund …'); toast('Freund getrennt'); return; }
  ui('wait','Verbindung weg – verbinde neu …');
  if(NET.retry++<20) setTimeout(()=>{ if(NET.role==='guest'&&!(NET.conn&&NET.conn.open)) connectGuest(); },2500);
  else ui('off','Verbindung verloren');
}
function connectGuest(){
  if(!NET.peer||NET.peer.destroyed) return start();
  if(NET.peer.disconnected){ try{ NET.peer.reconnect(); }catch(e){} }
  attach(NET.peer.connect(PREFIX+NET.code,{reliable:true}));
}
async function start(){
  try{ await loadLib(); }catch(e){ NET.role=null; remember(); ui('off'); toast('Kein Internet – Lobby nicht möglich'); return; }
  if(NET.peer){ try{ NET.peer.destroy(); }catch(e){} }
  const p=NET.role==='host'?new Peer(PREFIX+NET.code):new Peer(); NET.peer=p;
  p.on('open',()=>{ if(NET.role==='host'){ ui('wait','Warte auf Freund …'); remember(); } else connectGuest(); });
  p.on('connection',c=>{
    if(NET.role!=='host') return;
    if(NET.conn&&NET.conn.open&&NET.conn!==c){ c.on('open',()=>{ try{ c.send({type:'full'}); }catch(e){} setTimeout(()=>c.close(),500); }); return; }
    attach(c);
  });
  p.on('disconnected',()=>{ if(NET.peer===p&&!p.destroyed) setTimeout(()=>{ try{ p.reconnect(); }catch(e){} },1500); });
  p.on('error',err=>{
    const t=err&&err.type;
    if(t==='unavailable-id'){ NET.code=newCode(); start(); }
    else if(t==='peer-unavailable'){
      if(NET.retry>0&&NET.retry<20){ lost(); return; }
      toast('Lobby '+NET.code+' nicht gefunden'); NET.role=null; NET.code=null; remember(); ui('off');
    } else if(['network','server-error','socket-error','socket-closed'].includes(t)){
      ui('wait','Netzwerkproblem – versuche erneut …'); setTimeout(()=>{ if(NET.role) start(); },3000);
    } else ui('wait','Fehler: '+(t||'unbekannt'));
  });
}
function host(code){ leave(true); NET.role='host'; NET.code=code||newCode(); NET.ts=0; ui('wait','Lobby wird erstellt …'); start(); }
function join(code){
  if(!lbOn) setEnabled(true);
  code=(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(code.length!==4){ toast('Der Lobby-Code hat 4 Zeichen'); return; }
  leave(true); NET.role='guest'; NET.code=code; NET.ts=0; NET.retry=0; ui('wait','Verbinde mit '+code+' …'); remember(); start();
}
function leave(silent){
  NET.role=null; remember();
  if(NET.conn){ try{ NET.conn.close(); }catch(e){} NET.conn=null; }
  if(NET.peer){ try{ NET.peer.destroy(); }catch(e){} NET.peer=null; }
  NET.code=null; ui('off');
}
window.lobby={host,join,leave,send,get state(){ return {role:NET.role,code:NET.code,open:!!(NET.conn&&NET.conn.open)}; }};
// Bedienung
$('lb-join').onclick=()=>join($('lb-in').value);
$('lb-in').addEventListener('keydown',e=>{ if(e.key==='Enter') $('lb-join').click(); });
$('lb-in').addEventListener('input',e=>{ e.target.value=e.target.value.toUpperCase(); });
// Neue Karte: ohne Lobby einmal eine Lobby erstellen, sonst einfach würfeln (und an den Freund schicken)
const genBtn=$('gen'), prevGen=genBtn.onclick;
genBtn.onclick=e=>{ prevGen&&prevGen.call(genBtn,e); if(enabled()&&!NET.role){ host(); toast('Lobby erstellt – Code an deinen Freund geben'); } };
// Änderungen weitergeben
const _run=run; run=function(seed){ _run(seed); netChanged(); };
const _gen=genArmies; genArmies=function(code){ _gen(code); netChanged(); };
// Ein/Aus in den Karten-Einstellungen (Standard: aus)
let lbOn=false;
function enabled(){ return lbOn; }
function setEnabled(on){
  lbOn=on; $('lb-enable').checked=on; $('net-btn').classList.toggle('on',on); $('net-btn').setAttribute('aria-pressed',on);
  try{ localStorage.setItem('sitzkrieg-lobby-an',on?'1':'0'); }catch(e){}
  if(!on && NET.role) leave();
  if(on && !NET.role) setTimeout(()=>{ if(lbOn&&!NET.role) host(); },0);   // Code gleich erzeugen, ohne erst eine neue Karte zu würfeln
}
$('lb-enable').onchange=()=>setEnabled($('lb-enable').checked);
$('net-btn').onclick=e=>{ e.stopPropagation(); $('net-pop').hidden=!$('net-pop').hidden; };
$('net-pop').addEventListener('click',e=>e.stopPropagation());
document.addEventListener('click',()=>{ $('net-pop').hidden=true; });
let on0=false; try{ on0=localStorage.getItem('sitzkrieg-lobby-an')==='1'; }catch(e){}
// Beitreten per Link schaltet die Lobby-Funktion ein; sonst nach dem Neuladen wieder verbinden
const q=new URLSearchParams(location.search).get('lobby');
if(q){ setEnabled(true); try{ history.replaceState(null,'',location.pathname); }catch(e){} join(q); }
else { const r=store(); if(on0&&r&&r.code&&Date.now()-r.t<3*3600e3){ setEnabled(true); if(r.role==='host') host(r.code); else join(r.code); } else setEnabled(on0); }
ui(NET.role?'wait':'off', NET.role?$('lb-status').textContent:'');
})();
