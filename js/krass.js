// Sitzkrieg – lebendiger Hintergrund (Rauch, Glut, Suchscheinwerfer) + Stempel beim Tab-Wechsel
(function(){
  const cv=document.createElement('canvas'); cv.id='krass-bg'; cv.setAttribute('aria-hidden','true');
  document.body.prepend(cv);
  const ctx=cv.getContext('2d');
  const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let W=0,H=0;
  function size(){ W=cv.width=Math.ceil(innerWidth/2); H=cv.height=Math.ceil(innerHeight/2); }   // halbe Auflösung reicht für Rauch, spart Akku
  size(); addEventListener('resize',size);
  const R=Math.random;
  const smoke=Array.from({length:14},()=>({x:R(),y:R(),r:.25+R()*.35,vx:(R()-.5)*.00012+.00006,vy:-.00004-R()*.00006,a:.05+R()*.07,ph:R()*6}));
  const embers=Array.from({length:26},()=>newEmber(true));
  function newEmber(any){ return {x:R(),y:any?R():1.05,vy:.0006+R()*.0012,sw:R()*6,amp:.002+R()*.004,s:.6+R()*1.6,life:R()}; }
  const dark=()=>document.documentElement.getAttribute('data-theme')==='dark';
  let t0=performance.now(), last=0;
  function frame(now){
    if(!still) requestAnimationFrame(frame);
    if(document.hidden || now-last<33) return; last=now;       // ~30 Bilder/s
    const t=(now-t0)/1000, d=dark();
    ctx.clearRect(0,0,W,H);
    // Suchscheinwerfer, schwenkt langsam
    const ang=-Math.PI/2+Math.sin(t*.18)*.55, bx=W*.5, by=H*1.08, len=H*1.4;
    const g=ctx.createLinearGradient(bx,by,bx+Math.cos(ang)*len,by+Math.sin(ang)*len);
    g.addColorStop(0,d?'rgba(255,238,180,.16)':'rgba(255,250,220,.22)'); g.addColorStop(1,'rgba(255,238,180,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(bx,by);
    ctx.lineTo(bx+Math.cos(ang-.09)*len,by+Math.sin(ang-.09)*len); ctx.lineTo(bx+Math.cos(ang+.09)*len,by+Math.sin(ang+.09)*len); ctx.fill();
    // Rauchschwaden
    for(const s of smoke){
      s.x+=s.vx*33; s.y+=s.vy*33; if(s.y<-.4){s.y=1.3;s.x=R();} if(s.x>1.4)s.x=-.4;
      const x=s.x*W, y=s.y*H, r=s.r*Math.max(W,H), a=s.a*(.75+.25*Math.sin(t*.4+s.ph));
      const rg=ctx.createRadialGradient(x,y,0,x,y,r);
      const c=d?'150,150,130':'90,80,60';
      rg.addColorStop(0,`rgba(${c},${a})`); rg.addColorStop(1,`rgba(${c},0)`);
      ctx.fillStyle=rg; ctx.fillRect(x-r,y-r,r*2,r*2);
    }
    // Glut steigt auf
    for(const e of embers){
      e.y-=e.vy*(d?1:.7); e.life+=.004; if(e.y<-.05) Object.assign(e,newEmber(false));
      const x=(e.x+Math.sin(t*1.3+e.sw)*e.amp)*W, y=e.y*H, fl=.55+.45*Math.sin(t*7+e.sw*3);
      ctx.fillStyle=d?`rgba(255,${140+fl*60|0},60,${.55*fl})`:`rgba(170,70,30,${.35*fl})`;
      ctx.beginPath(); ctx.arc(x,y,e.s,0,7); ctx.fill();
    }
  }
  requestAnimationFrame(frame);

  // Stempel-Untertitel neu aufschlagen, wenn der Tab wechselt
  const sub=document.getElementById('sub');
  if(sub) new MutationObserver(()=>{ sub.classList.remove('stamp-in'); void sub.offsetWidth; sub.classList.add('stamp-in'); }).observe(sub,{childList:true,characterData:true,subtree:true});
})();
