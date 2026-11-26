// ---------- Mission: zufällige Armeen ----------
// Umbenannte Generalsfähigkeiten (für alte Speicherstände)
const GEN_RENAMED={Verschanzer:'Besetzen',Improvisator:'Improvisieren',Infiltrator:'Flankieren',Unsterblicher:'Unsterblich'};
const RIFLEMAN_FACTION={de:"<svg class=\"fig cmc\" viewBox=\"7 3 121 145\" aria-hidden=\"true\"><g><ellipse cx=\"60\" cy=\"140\" rx=\"30\" ry=\"5\" fill=\"rgba(70,50,20,.3)\"/><path d=\"M44 98 L40 128 L55 128 L59 100 Z\" fill=\"#c8bfa3\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M61 100 L65 128 L80 128 L76 98 Z\" fill=\"#c8bfa3\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M38 124 H56 V136 H32 Q32 128 38 124 Z\" fill=\"#3a3128\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M64 124 H82 Q88 128 88 136 H64 Z\" fill=\"#3a3128\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M40 62 L80 62 L84 102 L36 102 Z\" fill=\"#c8bfa3\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M66 63 L79 63 L83 101 L70 101 Z\" fill=\"url(#hz-de)\" stroke=\"none\"/><path d=\"M49 62 L60 73 L71 62 Z\" fill=\"url(#hz-de)\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M36 92 H84 V99 H36 Z\" fill=\"#5a4630\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M56 91.5 H64 V99.5 H56 Z\" fill=\"#d9b45a\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M45 70 h8 v7 h-8 Z M67 70 h8 v7 h-8 Z\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"1.4\" stroke-linecap=\"round\" opacity=\"1\"/><path d=\"M28 113 L42 100 L48 106 L35 119 Z\" fill=\"#b08a58\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M42 100 L98 53 L101 57 L47 106 Z\" fill=\"#b08a58\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M44 103 L99 56 L101 57 L47 106 Z\" fill=\"url(#hz-dk)\" stroke=\"none\"/><path d=\"M92 58 L110 43 L112 46 L95 61 Z\" fill=\"#4a4238\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M40 64 L34 98 L46 106 L51 74 Z\" fill=\"#c8bfa3\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"44\" cy=\"104\" r=\"6.2\" fill=\"#f3e1c4\" stroke=\"#1f1a14\" stroke-width=\"2\"/><path d=\"M72 62 L86 66 L83 78 L71 71 Z\" fill=\"#c8bfa3\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"80\" cy=\"74\" r=\"6.2\" fill=\"#f3e1c4\" stroke=\"#1f1a14\" stroke-width=\"2\"/><path d=\"M54 52 H66 V63 H54 Z\" fill=\"#f3e1c4\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M44 28 L76 28 L78 50 Q60 64 42 50 Z\" fill=\"#f3e1c4\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M66 29 L76 29 L78 50 Q70 57 62 59 Q72 46 66 29 Z\" fill=\"rgba(150,110,60,.28)\" stroke=\"none\"/><path d=\"M48 37.5 L57 40 M72 37.5 L63 40\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"3\" stroke-linecap=\"round\" opacity=\"1\"/><rect x=\"51\" y=\"41\" width=\"4.5\" height=\"4\" fill=\"#111\"/><rect x=\"64.5\" y=\"41\" width=\"4.5\" height=\"4\" fill=\"#111\"/><path d=\"M60 42 L58 49 H61\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"1.6\" stroke-linecap=\"round\" opacity=\"1\"/><path d=\"M54 54 H66\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"2.2\" stroke-linecap=\"round\" opacity=\"1\"/><path d=\"M46 56 q14 8 28 0\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"1\" stroke-linecap=\"round\" opacity=\"0.35\"/><path d=\"M38 36 Q38 12 60 10 Q82 12 82 36 L90 42 L30 42 Z\" fill=\"#9fa293\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M70 12 Q82 16 82 36 L90 42 L76 42 Z\" fill=\"url(#hz-dk)\" stroke=\"none\"/><path d=\"M44 24 Q50 15 60 14\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" opacity=\"0.35\"/></g></svg>",al:"<svg class=\"fig cmc\" viewBox=\"7 3 121 145\" aria-hidden=\"true\"><g><ellipse cx=\"60\" cy=\"140\" rx=\"30\" ry=\"5\" fill=\"rgba(70,50,20,.3)\"/><path d=\"M44 98 L40 128 L55 128 L59 100 Z\" fill=\"#e0d3ad\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M61 100 L65 128 L80 128 L76 98 Z\" fill=\"#e0d3ad\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M42 112 h14 M42 118 h14 M64 112 h14 M64 118 h14\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"1.2\" stroke-linecap=\"round\" opacity=\"0.55\"/><path d=\"M38 124 H56 V136 H32 Q32 128 38 124 Z\" fill=\"#3a3128\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M64 124 H82 Q88 128 88 136 H64 Z\" fill=\"#3a3128\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M40 62 L80 62 L84 102 L36 102 Z\" fill=\"#cdbf93\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M66 63 L79 63 L83 101 L70 101 Z\" fill=\"url(#hz-al)\" stroke=\"none\"/><path d=\"M49 62 L60 73 L71 62 Z\" fill=\"url(#hz-al)\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M36 92 H84 V99 H36 Z\" fill=\"#5a4630\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M56 91.5 H64 V99.5 H56 Z\" fill=\"#d9b45a\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M45 70 h8 v7 h-8 Z M67 70 h8 v7 h-8 Z\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"1.4\" stroke-linecap=\"round\" opacity=\"1\"/><path d=\"M28 113 L42 100 L48 106 L35 119 Z\" fill=\"#b08a58\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M42 100 L98 53 L101 57 L47 106 Z\" fill=\"#b08a58\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M44 103 L99 56 L101 57 L47 106 Z\" fill=\"url(#hz-dk)\" stroke=\"none\"/><path d=\"M92 58 L110 43 L112 46 L95 61 Z\" fill=\"#4a4238\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M40 64 L34 98 L46 106 L51 74 Z\" fill=\"#cdbf93\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"44\" cy=\"104\" r=\"6.2\" fill=\"#f3e1c4\" stroke=\"#1f1a14\" stroke-width=\"2\"/><path d=\"M72 62 L86 66 L83 78 L71 71 Z\" fill=\"#cdbf93\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"80\" cy=\"74\" r=\"6.2\" fill=\"#f3e1c4\" stroke=\"#1f1a14\" stroke-width=\"2\"/><path d=\"M54 52 H66 V63 H54 Z\" fill=\"#f3e1c4\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M44 28 L76 28 L78 50 Q60 64 42 50 Z\" fill=\"#f3e1c4\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M66 29 L76 29 L78 50 Q70 57 62 59 Q72 46 66 29 Z\" fill=\"rgba(150,110,60,.28)\" stroke=\"none\"/><path d=\"M48 37.5 L57 40 M72 37.5 L63 40\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"3\" stroke-linecap=\"round\" opacity=\"1\"/><rect x=\"51\" y=\"41\" width=\"4.5\" height=\"4\" fill=\"#111\"/><rect x=\"64.5\" y=\"41\" width=\"4.5\" height=\"4\" fill=\"#111\"/><path d=\"M60 42 L58 49 H61\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"1.6\" stroke-linecap=\"round\" opacity=\"1\"/><path d=\"M54 54 H66\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"2.2\" stroke-linecap=\"round\" opacity=\"1\"/><path d=\"M46 56 q14 8 28 0\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"1\" stroke-linecap=\"round\" opacity=\"0.35\"/><path d=\"M38 36 Q38 10 60 10 Q82 10 82 36 Z\" fill=\"#b0a36a\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M32 34 H88 L86 40 H34 Z\" fill=\"#b0a36a\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M70 12 Q82 18 82 34 H74 Z\" fill=\"url(#hz-dk)\" stroke=\"none\"/><path d=\"M44 20 L76 32 M48 14 L80 26 M42 30 L66 12 M56 34 L78 16\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"1\" stroke-linecap=\"round\" opacity=\"0.45\"/></g></svg>"};
const RIFLEMAN="<svg class=\"fig cmc\" viewBox=\"7 3 121 145\" aria-hidden=\"true\"><g><ellipse cx=\"60\" cy=\"140\" rx=\"30\" ry=\"5\" fill=\"rgba(70,50,20,.3)\"/><path d=\"M44 98 L40 128 L55 128 L59 100 Z\" fill=\"#c8bfa3\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M61 100 L65 128 L80 128 L76 98 Z\" fill=\"#c8bfa3\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M38 124 H56 V136 H32 Q32 128 38 124 Z\" fill=\"#3a3128\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M64 124 H82 Q88 128 88 136 H64 Z\" fill=\"#3a3128\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M40 62 L80 62 L84 102 L36 102 Z\" fill=\"#c8bfa3\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M66 63 L79 63 L83 101 L70 101 Z\" fill=\"url(#hz-de)\" stroke=\"none\"/><path d=\"M49 62 L60 73 L71 62 Z\" fill=\"url(#hz-de)\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M36 92 H84 V99 H36 Z\" fill=\"#5a4630\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M56 91.5 H64 V99.5 H56 Z\" fill=\"#d9b45a\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M45 70 h8 v7 h-8 Z M67 70 h8 v7 h-8 Z\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"1.4\" stroke-linecap=\"round\" opacity=\"1\"/><path d=\"M28 113 L42 100 L48 106 L35 119 Z\" fill=\"#b08a58\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M42 100 L98 53 L101 57 L47 106 Z\" fill=\"#b08a58\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M44 103 L99 56 L101 57 L47 106 Z\" fill=\"url(#hz-dk)\" stroke=\"none\"/><path d=\"M92 58 L110 43 L112 46 L95 61 Z\" fill=\"#4a4238\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M40 64 L34 98 L46 106 L51 74 Z\" fill=\"#c8bfa3\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"44\" cy=\"104\" r=\"6.2\" fill=\"#f3e1c4\" stroke=\"#1f1a14\" stroke-width=\"2\"/><path d=\"M72 62 L86 66 L83 78 L71 71 Z\" fill=\"#c8bfa3\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"80\" cy=\"74\" r=\"6.2\" fill=\"#f3e1c4\" stroke=\"#1f1a14\" stroke-width=\"2\"/><path d=\"M54 52 H66 V63 H54 Z\" fill=\"#f3e1c4\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M44 28 L76 28 L78 50 Q60 64 42 50 Z\" fill=\"#f3e1c4\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M66 29 L76 29 L78 50 Q70 57 62 59 Q72 46 66 29 Z\" fill=\"rgba(150,110,60,.28)\" stroke=\"none\"/><path d=\"M48 37.5 L57 40 M72 37.5 L63 40\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"3\" stroke-linecap=\"round\" opacity=\"1\"/><rect x=\"51\" y=\"41\" width=\"4.5\" height=\"4\" fill=\"#111\"/><rect x=\"64.5\" y=\"41\" width=\"4.5\" height=\"4\" fill=\"#111\"/><path d=\"M60 42 L58 49 H61\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"1.6\" stroke-linecap=\"round\" opacity=\"1\"/><path d=\"M54 54 H66\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"2.2\" stroke-linecap=\"round\" opacity=\"1\"/><path d=\"M46 56 q14 8 28 0\" fill=\"none\" stroke=\"#1f1a14\" stroke-width=\"1\" stroke-linecap=\"round\" opacity=\"0.35\"/><path d=\"M38 36 Q38 12 60 10 Q82 12 82 36 L90 42 L30 42 Z\" fill=\"#9fa293\" stroke=\"#1f1a14\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M70 12 Q82 16 82 36 L90 42 L76 42 Z\" fill=\"url(#hz-dk)\" stroke=\"none\"/><path d=\"M44 24 Q50 15 60 14\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" opacity=\"0.35\"/></g></svg>";
const VEHICLES=[
  {key:'schwer',name:'Schwerer Panzer',n:1},{key:'leicht',name:'Leichter Panzer',n:1},{key:'krad',name:'Kraftrad',n:1}];
const SPECIALS=RULES.spezialeinheiten.map(s=>({key:s.key,name:s.name,n:s.vorrat}));   // aus js/regeln.js
const SLOTS={'3x6':11,'3x8':9};   // Normal: 1–3 Fahrzeuge + 4 Spezialeinheiten + 6 Trupps (Wert hier nur noch als Seed-Zusatz);   // Episch: 3 Fahrzeuge + 6 Trupps (12 Spezialeinheiten = der ganze Vorrat)
const RIFLEMEN=5; // Gewehrschützen pro Trupp
const MAX_RIFLEMEN=35; // Gewehrschützen pro Spieler insgesamt
const EMB={de:"<svg class=\"emb\" viewBox=\"0 0 100 100\" aria-hidden=\"true\"><path d=\"M43 40 L30 6 Q50 13 70 6 L57 40 L60 43 L94 30 Q87 50 94 70 L60 57 L57 60 L70 94 Q50 87 30 94 L43 60 L40 57 L6 70 Q13 50 6 30 L40 43 Z\" fill=\"#111\" stroke=\"#111\" stroke-width=\"13\" stroke-linejoin=\"round\"/><path d=\"M43 40 L30 6 Q50 13 70 6 L57 40 L60 43 L94 30 Q87 50 94 70 L60 57 L57 60 L70 94 Q50 87 30 94 L43 60 L40 57 L6 70 Q13 50 6 30 L40 43 Z\" fill=\"#111\" stroke=\"#f4f0e0\" stroke-width=\"5\" stroke-linejoin=\"round\"/></svg>",al:"<svg class=\"emb\" viewBox=\"0 0 100 100\" aria-hidden=\"true\"><circle cx=\"50\" cy=\"50\" r=\"48\" fill=\"#3f4a24\"/><circle cx=\"50\" cy=\"50\" r=\"41\" fill=\"none\" stroke=\"#f4f0e0\" stroke-width=\"6\"/><polygon fill=\"#f4f0e0\" points=\"50.0,12.0 59.1,37.5 86.1,38.3 64.7,54.8 72.3,80.7 50.0,65.5 27.7,80.7 35.3,54.8 13.9,38.3 40.9,37.5\"/></svg>"};   // Wappen: Eisernes Kreuz / Alliierter Stern im Kreis
const FACTIONS={de:{name:'Deutsche',emblem:EMB.de,card:'Kreuz'},al:{name:'Alliierte',emblem:EMB.al,card:'Herz'}};
const flyerOn=false;   // Kampfflieger gibt es nicht mehr
// Fahrzeuge einzeln erlauben (Ja/Nein). Im Armee-Seed als Bitmaske gespeichert: Bit gesetzt = Fahrzeug aus
const VEH_TOGGLE=VEHICLES.filter(v=>!v.optional);
let vehAllowed={}; try{ vehAllowed=JSON.parse(localStorage.getItem('sitzkrieg-fahrzeuge'))||{}; }catch(e){}
let vehMask=0;
const vehMaskNow=()=>VEH_TOGGLE.reduce((m,v,i)=>m|(vehAllowed[v.key]===false?1<<i:0),0);
const vehOff=key=>{ const i=VEH_TOGGLE.findIndex(v=>v.key===key); return i>=0 && !!(vehMask&(1<<i)); };
const armies={};
let arnd=Math.random;   // Zufall für die Armeen (aus dem Armee-Seed)
// Ein Slot ist entweder ein Fahrzeug oder ein Trupp aus 2 Spezialeinheiten + Gewehrschützen (höchstens 1 General pro Trupp)
function rollArmy(){
  const n=SLOTS[$('size').value]||8;
  for(let tries=0;tries<500;tries++){
    const pool=[];
    for(const v of VEHICLES) if(!vehOff(v.key)) for(let i=0;i<v.n;i++) pool.push({...v,veh:true});
    for(const p of SPECIALS) for(let i=0;i<p.n;i++) pool.push({...p,veh:false});
    for(let i=pool.length-1;i>0;i--){ const j=Math.floor(arnd()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
    const out=[]; let ok=true, squads=0;
    for(let k=0;k<n && ok;k++){
      // Sind die Gewehrschützen aufgebraucht, gibt es nur noch Fahrzeuge
      if((squads+1)*RIFLEMEN>MAX_RIFLEMEN) for(let i=pool.length-1;i>=0;i--) if(!pool[i].veh) pool.splice(i,1);
      const u=pool.shift(); if(!u){ if(out.length) break; ok=false; break; }   // Vorrat leer (z. B. Fahrzeuge abgewählt): Armee hat dann weniger Slots
      if(u.veh){ out.push(u); continue; }
      const j=pool.findIndex(x=>!x.veh && !(u.key==='general' && x.key==='general'));
      if(j<0){ ok=false; break; }
      const v=pool.splice(j,1)[0];
      out.push({veh:false, units:(v.key==='general'?[v,u]:[u,v])}); squads++;
    }
    if(ok){
      // Jeder General bekommt eine eigene, zufällige Fähigkeit (keine doppelt in einer Armee)
      const ab=[...GEN_ABIL]; for(let i=ab.length-1;i>0;i--){ const j=Math.floor(arnd()*(i+1)); [ab[i],ab[j]]=[ab[j],ab[i]]; }
      for(const sl of out) if(!sl.veh) sl.units=sl.units.map(u=>u.key==='general'?{...u,abil:ab.shift()}:u);
      return out;
    }
  }
  return [];
}

// Aufbau je Kartengröße:
//  Normal: je Fahrzeugtyp höchstens 1 Fahrzeug (mindestens 1 insgesamt), 6 einzelne Spezialeinheiten, 6 Trupps à 5 Gewehrschützen
//  Episch: alle (erlaubten) Fahrzeuge, 8 einzelne Spezialeinheiten, 8 Trupps à 5 Gewehrschützen
let vehN=3; try{ const v=localStorage.getItem('sitzkrieg-fahrzeug-anzahl'); if(v!=null) vehN=Math.max(0,Math.min(3,+v|0)); }catch(e){}   // Fahrzeuge pro Seite (0–3)
let genCount=1; try{ const g=localStorage.getItem('sitzkrieg-generale'); if(g!=null) genCount=Math.max(0,Math.min(3,+g|0)); }catch(e){}   // Anzahl Generäle pro Seite (0–3)
const ARMY_SETUP={'3x6':{solo:RULES.armee.normal.spezialeinheiten,squads:RULES.armee.normal.trupps,allVeh:false},'3x8':{solo:RULES.armee.episch.spezialeinheiten,squads:RULES.armee.episch.trupps,allVeh:true}};   // Zahlen aus js/regeln.js
function rollArmyNormal(){
  const cfg=ARMY_SETUP[$('size').value]||ARMY_SETUP['3x6'], NORMAL_SOLO=cfg.solo, NORMAL_SQUADS=cfg.squads;
  const out=[];
  // Fahrzeuge: genau so viele wie eingestellt (0–3), zufällige Typen, jeder höchstens 1 mal
  const vPool=[...VEHICLES]; for(let i=vPool.length-1;i>0;i--){ const j=Math.floor(arnd()*(i+1)); [vPool[i],vPool[j]]=[vPool[j],vPool[i]]; }
  const vs=vPool.slice(0,Math.min(vehN,vPool.length)).sort((a,b)=>VEHICLES.indexOf(a)-VEHICLES.indexOf(b));
  for(const v of vs) out.push({...v,veh:true});
  // Generäle: feste Anzahl aus den Einstellungen, der Rest der Spezialeinheiten zufällig aus dem Vorrat
  const genSpec=SPECIALS.find(p=>p.key==='general'), nGen=Math.min(genCount, genSpec.n, NORMAL_SOLO);
  const pool=[]; for(const p of SPECIALS) if(p.key!=='general') for(let i=0;i<p.n;i++) pool.push({...p});
  for(let i=pool.length-1;i>0;i--){ const j=Math.floor(arnd()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  const ab=[...GEN_ABIL]; for(let i=ab.length-1;i>0;i--){ const j=Math.floor(arnd()*(i+1)); [ab[i],ab[j]]=[ab[j],ab[i]]; }
  const picks=[...Array(nGen)].map(()=>({...genSpec})).concat(pool.slice(0,NORMAL_SOLO-nGen));
  for(const u of picks) out.push({veh:false, rif:0, units:[u.key==='general'?{...u,abil:ab.shift()}:u]});
  for(let i=0;i<NORMAL_SQUADS;i++) out.push({veh:false, rif:RIFLEMEN, units:[]});
  return out;
}
const rifOf=x=>x.veh?0:(x.rif??RIFLEMEN);
// Reihenfolge: Fahrzeuge, einzelne Spezialeinheiten (General zuerst), Trupps mit General, übrige Trupps, reine Gewehrschützen-Trupps
const slotRank=x=>x.veh?VEH_ORDER.indexOf(x.key):(rifOf(x)===0?(x.units.some(u=>u.key==='general')?40:45):!x.units.length?110:(x.units.some(u=>u.key==='general')?50:100));

// ---------- Mission (nur noch Vernichtung) ----------
const MISSIONS=[{name:'Vernichtung'}];   // es gibt nur noch Vernichtung
let mission=MISSIONS[0]; window.CUR_MISSION=mission;   // auch ohne neues Würfeln (z. B. nach dem Neuladen) gesetzt
let armyBase=0, armyFair=true;
const encodeArmy=()=>(vehMask*1e6+armyBase)*12+MISSIONS.indexOf(mission)*4+(flyerOn?2:0)+(armyFair?1:0);
function rollMission(){
  mission=MISSIONS[0];
  if(armyCode!=null){ armyCode=encodeArmy(); updateSeed(); }
  window.CUR_MISSION=mission; if(typeof render==='function' && current) render();
}
// Generals-Fähigkeiten (aus dem Regelwerk: Abschnitt General)
const GEN_ABIL=[...document.querySelectorAll('#general dl.abil dt')].map(dt=>({name:dt.textContent.trim(), text:dt.nextElementSibling.textContent.trim()}));
// Wappen je Generalsfähigkeit (statt eigener Figuren)
const CRESTS={"Besetzen": ["#7a1e14", "<path d=\"M15 36 V11\" style=\"fill:none;stroke:#efe6c8;stroke-width:3;stroke-linecap:round;stroke-linejoin:round\"/><path d=\"M16 11 Q22 8 28 11 L28 21 Q22 18 16 21 Z\" style=\"fill:#efe6c8;stroke:#1b1d14;stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round\"/>"], "Kartograf": ["#2f4a5e", "<path d=\"M20 10 L23 22 L20 34 L17 22 Z\" style=\"fill:#efe6c8;stroke:#1b1d14;stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round\"/><path d=\"M8 22 L20 19 L32 22 L20 25 Z\" style=\"fill:#efe6c8;stroke:#1b1d14;stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round\"/><circle cx=\"20\" cy=\"22\" r=\"2\" style=\"fill:#1b1d14\"/>"], "Feldherr": ["#5f6838", "<path d=\"M11 33 L29 11 M29 33 L11 11\" style=\"fill:none;stroke:#efe6c8;stroke-width:3;stroke-linecap:round;stroke-linejoin:round\"/><circle cx=\"29\" cy=\"11\" r=\"2.6\" style=\"fill:#efe6c8;stroke:#1b1d14;stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round\"/><circle cx=\"11\" cy=\"11\" r=\"2.6\" style=\"fill:#efe6c8;stroke:#1b1d14;stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round\"/>"], "Taktiker": ["#3c434b", "<path d=\"M12 33 Q10 16 26 14\" style=\"fill:none;stroke:#efe6c8;stroke-width:3;stroke-linecap:round;stroke-linejoin:round\"/><path d=\"M24 9 L31 14 L24 19 Z\" style=\"fill:#efe6c8;stroke:#1b1d14;stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round\"/><circle cx=\"12\" cy=\"33\" r=\"2.4\" style=\"fill:#efe6c8;stroke:#1b1d14;stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round\"/><path d=\"M24 26 l6 6 M30 26 l-6 6\" style=\"fill:none;stroke:#efe6c8;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-width:2.4\"/>"], "Improvisieren": ["#6b4a22", "<path d=\"M13 33 L25 19\" style=\"fill:none;stroke:#efe6c8;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-width:4.4\"/><path d=\"M23 13 Q22 8 28 8 L26 12 L28 15 L32 13 Q32 19 27 19 Z\" style=\"fill:#efe6c8;stroke:#1b1d14;stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round\"/>"], "Flankieren": ["#4b5428", "<path d=\"M10 34 V22 Q10 12 22 12 H26\" style=\"fill:none;stroke:#efe6c8;stroke-width:3;stroke-linecap:round;stroke-linejoin:round\"/><path d=\"M25 7 L32 12 L25 17 Z\" style=\"fill:#efe6c8;stroke:#1b1d14;stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round\"/><path d=\"M28 26 v8 M24 30 h8\" style=\"fill:none;stroke:#efe6c8;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-width:2.2\"/>"], "Veteran": ["#2b2e1f", "<path d=\"M11 17 L20 11 L29 17 M11 24 L20 18 L29 24 M11 31 L20 25 L29 31\" style=\"fill:none;stroke:#efe6c8;stroke-width:3;stroke-linecap:round;stroke-linejoin:round\"/>"], "Unsterblich": ["#1f3a33", "<path d=\"M20 22 C15 14 7 16 7 22 C7 28 15 30 20 22 C25 14 33 16 33 22 C33 28 25 30 20 22 Z\" style=\"fill:none;stroke:#efe6c8;stroke-width:3\"/>"], "Blutrausch": ["#8a1a10", "<path d=\"M20 9 Q29 21 29 26 A9 9 0 0 1 11 26 Q11 21 20 9 Z\" style=\"fill:#d23a2a;stroke:#efe6c8;stroke-width:1.6\"/><path d=\"M15 26 q0 4 4 5\" style=\"fill:none;stroke:rgba(255,255,255,.6);stroke-width:1.4\"/>"], "Monster": ["#3a2a1a", "<path d=\"M11 10 Q14 22 12 34 M19 9 Q22 22 20 35 M27 10 Q30 22 28 34\" style=\"fill:none;stroke:#e45a3a;stroke-width:3.2;stroke-linecap:round\"/>"], "Blitz": ["#2f3e58", "<path d=\"M23 7 L13 24 H20 L16 37 L28 18 H21 L26 7 Z\" style=\"fill:#ffd23a;stroke:#1b1d14;stroke-width:1.2;stroke-linejoin:round\"/>"], "Schussbefehl": ["#5a2a20", "<circle cx=\"20\" cy=\"22\" r=\"9\" style=\"fill:none;stroke:#efe6c8;stroke-width:2.4\"/><path d=\"M20 9 v7 M20 28 v7 M7 22 h7 M26 22 h7\" style=\"fill:none;stroke:#efe6c8;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-width:2.4\"/><circle cx=\"20\" cy=\"22\" r=\"1.8\" style=\"fill:#e45a3a\"/>"], "Erstschlag": ["#7a5a14", "<path d=\"M20 9 V26\" style=\"fill:none;stroke:#efe6c8;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-width:4.6\"/><circle cx=\"20\" cy=\"33\" r=\"2.8\" style=\"fill:#efe6c8\"/>"], "Rage": ["#8a2a10", "<path d=\"M20 36 Q10 33 11 24 Q12 18 16 15 Q15 21 19 22 Q16 13 22 7 Q22 14 27 18 Q31 22 29 28 Q27 35 20 36 Z\" style=\"fill:#ff8a2a;stroke:#1b1d14;stroke-width:1.2\"/><path d=\"M20 34 Q15 32 16 27 Q18 29 20 28 Q20 24 22 22 Q25 26 24 30 Q23 34 20 34 Z\" style=\"fill:#ffd23a\"/>"], "Verschanzen": ["#5b4a2a", "<rect x=\"9.6\" y=\"26.5\" width=\"8.4\" height=\"5.6\" rx=\"2.6\" style=\"fill:#d6c28a;stroke:#1b1d14;stroke-width:1.1\"/><path d=\"M11.2 29.3 h5.2\" style=\"stroke:#8a7444;stroke-width:.7;stroke-dasharray:1 1\"/><rect x=\"22\" y=\"26.5\" width=\"8.4\" height=\"5.6\" rx=\"2.6\" style=\"fill:#d6c28a;stroke:#1b1d14;stroke-width:1.1\"/><path d=\"M23.6 29.3 h5.2\" style=\"stroke:#8a7444;stroke-width:.7;stroke-dasharray:1 1\"/><rect x=\"15.8\" y=\"26.5\" width=\"8.4\" height=\"5.6\" rx=\"2.6\" style=\"fill:#d6c28a;stroke:#1b1d14;stroke-width:1.1\"/><path d=\"M17.400000000000002 29.3 h5.2\" style=\"stroke:#8a7444;stroke-width:.7;stroke-dasharray:1 1\"/><rect x=\"12.7\" y=\"21.2\" width=\"8.4\" height=\"5.6\" rx=\"2.6\" style=\"fill:#d6c28a;stroke:#1b1d14;stroke-width:1.1\"/><path d=\"M14.299999999999999 24.0 h5.2\" style=\"stroke:#8a7444;stroke-width:.7;stroke-dasharray:1 1\"/><rect x=\"18.9\" y=\"21.2\" width=\"8.4\" height=\"5.6\" rx=\"2.6\" style=\"fill:#d6c28a;stroke:#1b1d14;stroke-width:1.1\"/><path d=\"M20.5 24.0 h5.2\" style=\"stroke:#8a7444;stroke-width:.7;stroke-dasharray:1 1\"/><rect x=\"15.8\" y=\"15.9\" width=\"8.4\" height=\"5.6\" rx=\"2.6\" style=\"fill:#d6c28a;stroke:#1b1d14;stroke-width:1.1\"/><path d=\"M17.400000000000002 18.7 h5.2\" style=\"stroke:#8a7444;stroke-width:.7;stroke-dasharray:1 1\"/>"], "Anführer": ["#1e2f4a", "<path d=\"M20 8 L23.6 17.5 L33.6 17.8 L25.7 24 L28.5 33.6 L20 28 L11.5 33.6 L14.3 24 L6.4 17.8 L16.4 17.5 Z\" style=\"fill:#e8c34a;stroke:#1b1d14;stroke-width:1.2;stroke-linejoin:round\"/>"], "Unbarmherzig": ["#1b1b1b", "<path d=\"M12 20 Q12 9 20 9 Q28 9 28 20 Q28 25 25 26 V30 H15 V26 Q12 25 12 20 Z\" style=\"fill:#efe6c8;stroke:#1b1d14;stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round\"/><circle cx=\"16.6\" cy=\"19\" r=\"2.6\" style=\"fill:#1b1d14\"/><circle cx=\"23.4\" cy=\"19\" r=\"2.6\" style=\"fill:#1b1d14\"/><path d=\"M18 30 v-3 M20 30 v-3 M22 30 v-3\" style=\"stroke:#1b1d14;stroke-width:1\"/>"]};
function crestSVG(name){ const c=CRESTS[name]||CRESTS[GEN_RENAMED[name]]; if(!c) return '';
  // Stil „rund & knuffig“: rundlicher Schild, Glanzpunkt, goldener Saum – alles bleibt im Schild
  return `<svg class="crest" viewBox="-2 -2 44 52" aria-hidden="true"><path d="M4 8 Q4 3 9 3 H31 Q36 3 36 8 V22 Q36 40 20 46 Q4 40 4 22 Z" fill="${c[0]}" stroke="#2a2a2a" stroke-width="2.6" stroke-linejoin="round"/><path d="M8 9 Q8 6 11 6 H29 Q32 6 32 9" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="13" cy="12.5" rx="4" ry="2.2" fill="#fff" opacity=".32"/>${c[1]}<path d="M5.5 22 Q5.5 38.5 20 44.4 Q34.5 38.5 34.5 22" fill="none" stroke="#e8c34a" stroke-width="1.3" opacity=".7"/></svg>`; }
// Wappen auch im Regelwerk neben jeder Fähigkeit
document.querySelectorAll('#general dl.abil dt').forEach(dt=>{ const n=dt.textContent.trim(), c=crestSVG(n); if(c) dt.insertAdjacentHTML('afterbegin',`<span class="dt-crest">${c}</span>`); });
const VEH_ORDER=['schwer','leicht','krad'];
function renderArmy(side){
  const A=ART_FACTION[side]||ART, RIF=RIFLEMAN_FACTION[side]||RIFLEMAN;
  // Reihenfolge: Fahrzeuge (feste Ordnung), danach Trupps
  const rank=slotRank;
  const a=[...armies[side]].sort((x,y)=>rank(x)-rank(y)), f=FACTIONS[side], el=$('army-'+side); el.className='army '+side;
  const isPure=x=>!x.veh&&!x.units.length, firstPure=a.findIndex(isPure), pureN=a.filter(isPure).length;   // reine Gewehrschützen-Trupps als eine Zeile
  const veh=a.filter(x=>x.veh).length, sq=a.filter(x=>rifOf(x)>0).length, solo=a.filter(x=>!x.veh&&rifOf(x)===0).length, rif=a.reduce((n,x)=>n+rifOf(x),0), men=a.reduce((n,x)=>n+(x.veh?0:x.units.length+rifOf(x)),0);
  el.innerHTML=`<div class="army-head"><span class="emblem">${f.emblem}</span>
      <h3>${f.name}</h3>
</div>
    <ol class="slots">${a.map((u,i)=>isPure(u)?(i!==firstPure?'':`<li class="slot inf rif-group" data-squad="${i}" data-side="${side}" role="button" tabindex="0" title="Waffenwerte anzeigen" style="animation-delay:${i*45}ms">
        <span class="slot-no">${i+1}</span><span class="slot-art duo five">${RIF.repeat(RIFLEMEN)}</span>
        <span><span class="slot-name">${pureN}× ${RIFLEMEN} Gewehrschützen</span><br><span class="slot-tag">Trupp${pureN===1?'':'s'}</span> <span class="info-tag">ⓘ Waffen</span></span></li>`)
      :u.veh?`<li class="slot veh" data-veh="${u.key}" role="button" tabindex="0" title="Werte anzeigen" style="animation-delay:${i*45}ms">
        <span class="slot-no">${i+1}</span><span class="slot-art">${A[u.key]}</span>
        <span><span class="slot-name">${u.name}</span><br><span class="slot-tag">Fahrzeug</span> <span class="info-tag">ⓘ Werte</span></span></li>`
      :`<li class="slot inf" data-squad="${i}" data-side="${side}" role="button" tabindex="0" title="Waffenwerte anzeigen" style="animation-delay:${i*45}ms">
        <span class="slot-no">${i+1}</span><span class="slot-art duo">${u.units.length?u.units.map(x=>A[x.key]).join(''):RIF+RIF}${u.units.map(x=>x.abil?`<span class="slot-crest" title="${x.abil.name}">${crestSVG(x.abil.name)}</span>`:'').join('')}</span>
        <span><span class="slot-name">${u.units.length?u.units.map(x=>x.abil?`${x.name}<br><span class="gabil" role="button" tabindex="0" data-abil="${x.abil.name}" title="Erklärung anzeigen">★ ${x.abil.name}</span>`:x.name).join('<br>'):'Gewehrschützen'}</span><br><span class="slot-tag">${rifOf(u)?'Trupp':'Spezialeinheit'}</span> <span class="info-tag">ⓘ Waffen</span>
        ${rifOf(u)?`<span class="squad"><b>${u.units.length?'+ ':''}${rifOf(u)} Gewehrschützen</b><span class="men">${('<span class="mini">'+RIF+'</span>').repeat(rifOf(u))}</span></span>`:''}</span></li>`).join('')}</ol>`;
}
// Faire Armeen: beide Seiten bekommen dieselben Fahrzeuge
let fairOn=true; try{ fairOn=localStorage.getItem('sitzkrieg-fair')!=='0'; }catch(e){}
const vehCount=a=>a.filter(x=>x.veh).length;
function genArmies(code){
  if(typeof code!=='number' || !isFinite(code)) code=null;
  if(code==null){
    armyBase=Math.floor(Math.random()*1e6); armyFair=fairOn; vehMask=vehMaskNow();
    armyCode=null; rollMission();
  } else {
    code=Math.floor(code); const cb=Math.floor(code/12); armyBase=cb%1e6; vehMask=Math.floor(cb/1e6)&31; armyFair=!!(code&1);
    armyCode=null; rollMission();
  }
  armyCode=encodeArmy(); updateSeed();
  arnd=mulberry32((armyBase*2654435761+(SLOTS[$('size').value]||8))>>>0);
  const fairOn_=armyFair;
  const normal=!!ARMY_SETUP[$('size').value];   // beide Größen nutzen jetzt den festen Aufbau
  // Immer: gleich viele Generäle. Zusätzlich bei „Faire Armeen“: dieselben Fahrzeuge.
  const generals=a=>a.reduce((n,x)=>n+(x.veh?0:x.units.filter(u=>u.key==='general').length),0);
  const vehSet=a=>a.filter(x=>x.veh).map(x=>x.key).sort().join();
  const matches=(a,b)=>generals(a)===generals(b) && (!fairOn_ || vehSet(a)===vehSet(b));
  let ok=false;
  for(let outer=0; outer<50 && !ok; outer++){
    if(normal){ armies.de=rollArmyNormal(); for(let i=0;i<400;i++){ armies.al=rollArmyNormal(); if(matches(armies.de,armies.al)){ ok=true; break; } } continue; }
    armies.de=rollArmy();
    for(let i=0;i<400;i++){ armies.al=rollArmy(); if(matches(armies.de,armies.al)){ ok=true; break; } }
  }
  renderArmy('de'); renderArmy('al');
  if(window.spielArmies) spielArmies();   // Deck bleibt; startet nur beim Gedrückthalten von „Neue Karte“ neu
}
function setFair(on){
  fairOn=on; try{ localStorage.setItem('sitzkrieg-fair',on?'1':'0'); }catch(e){}
  document.querySelectorAll('.fair button').forEach(b=>b.classList.toggle('on',(b.dataset.fair==='1')===on));
}
document.querySelectorAll('.fair button').forEach(b=>b.onclick=()=>{ setFair(b.dataset.fair==='1'); genArmies(); });
setFair(fairOn);
function renderPoolInfo(){
  $('pool-veh').innerHTML=VEHICLES.map(v=>`<li>${v.n}× ${v.name}</li>`).join('')+`<li>Fahrzeuge pro Seite: ${vehN} (in den Einstellungen 0–3)</li>`;
  $('pool-spec').innerHTML=SPECIALS.map(p=>`<li>${p.n}× ${p.name}</li>`).join('')+`<li>Generäle pro Seite: ${genCount} (in den Einstellungen 0–3)</li><li>Normal: ${RULES.armee.normal.spezialeinheiten} einzelne Spezialeinheiten, ${RULES.armee.normal.trupps} Trupps à ${RIFLEMEN} Gewehrschützen</li><li>Episch: ${RULES.armee.episch.spezialeinheiten} einzelne Spezialeinheiten, ${RULES.armee.episch.trupps} Trupps à ${RIFLEMEN} Gewehrschützen</li><li>Jeder General bekommt eine zufällige Generals-Fähigkeit</li>`;
}
const catChance=()=>{ if(Math.random()<0.01&&window.playReroll) playReroll(); };   // 1 % Chance auf die Katze bei „Neue Armee“
$('army-gen').onclick=()=>{ genArmies(); catChance(); };
function syncVehButtons(){ document.querySelectorAll('[data-vn]').forEach(b=>b.classList.toggle('on',+b.dataset.vn===vehN)); }
document.querySelectorAll('[data-vn]').forEach(b=>b.onclick=()=>{
  vehN=+b.dataset.vn; try{ localStorage.setItem('sitzkrieg-fahrzeug-anzahl',String(vehN)); }catch(e){}
  syncVehButtons(); renderPoolInfo(); genArmies(); });
syncVehButtons(); renderPoolInfo();
function syncGenButtons(){ document.querySelectorAll('[data-gen]').forEach(b=>b.classList.toggle('on',+b.dataset.gen===genCount)); }
document.querySelectorAll('[data-gen]').forEach(b=>b.onclick=()=>{ genCount=+b.dataset.gen; try{ localStorage.setItem('sitzkrieg-generale',String(genCount)); }catch(e){} syncGenButtons(); renderPoolInfo(); genArmies(); });
syncGenButtons();

// ---------- Popup mit Erklärung der Generals-Fähigkeit ----------
function openAbil(name){
  const a=GEN_ABIL.find(x=>x.name===name); if(!a) return;
  $('pop-k').textContent='Generals-Fähigkeit'; $('pop-t').textContent='★ '+a.name; $('pop-d').textContent=a.text; $('pop-d').hidden=false;
  $('pop-body').innerHTML=`<div class="pop-crest">${crestSVG(a.name)}</div>`; $('pop').classList.remove('wide','nohead'); $('pop').hidden=false; $('pop-x').focus();
}
function closePop(){ $('pop').hidden=true; $('pop').classList.remove('plain'); popBack=null; }
document.addEventListener('click',e=>{ const b=e.target.closest('.gabil'); if(b){ openAbil(b.dataset.abil); } });
document.addEventListener('keydown',e=>{ const b=e.target.closest&&e.target.closest('.gabil'); if(b&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); openAbil(b.dataset.abil); } if(e.key==='Escape') closePop(); });
$('pop-x').onclick=closePop;
$('pop').addEventListener('click',e=>{ if(e.target.id==='pop') closePop(); });

// ---------- Werte im Popup antippen -> passende Regelwerk-Tabelle (mit Zurück) ----------
// Durchschlag -> Durchschlagstabelle (Zeile markiert), Trefferwurf -> Treffertabelle (Scheiben -> Abschnitt Scheiben)
let popBack=null;
const REF={
  pen:{sec:'durchschlagstabelle',t:'Durchschlagstabelle',d:v=>`Durchschlag ${v}: In Zeile ${v} unter der Panzerung des Ziels steht, welchen W6-Wurf du brauchst (X = kein Durchschlag möglich).`},
  hit:{sec:'treffertabelle',t:'Treffertabelle',d:v=>`Trefferwurf ${v}: Du wirfst ${v} W6 – jeder Würfel, der den Trefferwert schafft, trifft. Danach folgt für jeden Treffer der Durchschlagswurf.`},
  disc:{sec:'scheiben',t:'Kl. Scheibe und Gr. Scheibe',d:v=>`Trefferwurf ${v}: Scheibe anlegen, Abweichung würfeln – alles unter der Scheibe ist getroffen.`}
};
function markPen(root){
  for(const t of root.querySelectorAll('table')){
    const ths=[...t.querySelectorAll('thead th')].map(th=>th.textContent.replace(/\u00ad/g,''));
    const cols=[[ths.findIndex(x=>/durch.?schlag/i.test(x)),'pen'],[ths.findIndex(x=>/treffer.?wurf/i.test(x)),'hit']];
    for(const tr of t.querySelectorAll('tbody tr')) for(const [col,kind] of cols){
      const td=col>=0&&tr.cells[col], v=td&&td.textContent.trim(); if(!v||td.querySelector('button')) continue;
      const k=kind==='hit'&&/scheibe/i.test(v)?'disc':kind;
      if(k==='disc'||/^\d+$/.test(v)) td.innerHTML=`<button type="button" class="pen" data-ref="${k}" data-v="${v}" title="${REF[k].t} anzeigen">${v}</button>`;
    }
  }
}
function openRef(k,v){
  const R=REF[k], card=document.getElementById(R.sec); if(!card) return;
  popBack={k:$('pop-k').textContent,t:$('pop-t').textContent,d:$('pop-d').textContent,dh:$('pop-d').hidden,body:[...$('pop-body').childNodes],wide:$('pop').classList.contains('wide'),nh:$('pop').classList.contains('nohead')};
  const c=card.cloneNode(true); c.querySelector('h2')?.remove(); c.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
  if(k==='pen') for(const tr of c.querySelectorAll('tbody tr')) if(tr.cells[0].textContent.trim()===v) tr.classList.add('pen-hi');
  $('pop-k').textContent='Regelwerk'; $('pop-t').textContent=R.t; $('pop-d').textContent=R.d(v); $('pop-d').hidden=false;
  $('pop-body').innerHTML=`<div class="pen-nav"><button type="button" class="sec" id="pen-back">← Zurück</button><button type="button" class="sec" id="pen-rules" data-sec="${R.sec}">📜 Im Regelwerk öffnen</button></div>`;
  $('pop-body').append(...c.childNodes); $('pop').classList.remove('wide','nohead'); $('pen-back').focus();
}
function penBack(){ const b=popBack; if(!b) return; popBack=null;
  $('pop-k').textContent=b.k; $('pop-t').textContent=b.t; $('pop-d').textContent=b.d; $('pop-d').hidden=b.dh;
  $('pop-body').innerHTML=''; $('pop-body').append(...b.body); $('pop').classList.toggle('wide',b.wide); $('pop').classList.toggle('nohead',!!b.nh); }
document.addEventListener('click',e=>{
  const p=e.target.closest('#pop-body button.pen'); if(p){ e.stopPropagation(); openRef(p.dataset.ref,p.dataset.v); return; }
  if(e.target.closest('#pen-back')){ penBack(); return; }
  const r=e.target.closest('#pen-rules'); if(r){ closePop(); showTab('regeln'); try{ localStorage.setItem('sitzkrieg-tab','regeln'); }catch(_){}
    document.getElementById(r.dataset.sec).scrollIntoView({behavior:'smooth',block:'start'}); }
});

// ---------- Popup mit den Fahrzeug-Werten aus dem Regelwerk ----------
const VEH_SECTION={schwer:'schwerer-panzer',leicht:'leichter-panzer',trans:'transporter',krad:'kraftrad',flieger:'kampfflieger-werte',art:'flakgeschuetz'};
function openVeh(key){
  const v=VEHICLES.find(x=>x.key===key); if(!v) return;
  const card=VEH_SECTION[key] && document.getElementById(VEH_SECTION[key]);
  $('pop-k').textContent='Fahrzeug · Werte aus dem Regelwerk'; $('pop-t').textContent=v.name;
  if(card){
    const c=card.cloneNode(true); c.querySelector('h2')?.remove(); c.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
    $('pop-body').innerHTML=''; $('pop-body').append(...c.childNodes); $('pop-d').hidden=true; markPen($('pop-body'));
  } else { $('pop-body').innerHTML=''; $('pop-d').textContent='Für dieses Fahrzeug gibt es im Regelwerk noch keinen Abschnitt mit Werten.'; $('pop-d').hidden=false; }
  $('pop').classList.add('wide'); $('pop').classList.remove('nohead'); $('pop').hidden=false; $('pop-x').focus();
}
document.addEventListener('click',e=>{ const s=e.target.closest('.slot[data-veh]'); if(s) openVeh(s.dataset.veh); });
document.addEventListener('keydown',e=>{ const s=e.target.closest&&e.target.closest('.slot[data-veh]'); if(s&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); openVeh(s.dataset.veh); } });

// ---------- Popup mit den Waffenwerten eines Trupps ----------
const WEAPONS_OF=Object.fromEntries(RULES.spezialeinheiten.map(s=>[s.key,s.waffen]));   // aus js/regeln.js
const EXTRA_SECTION={mech:'mechaniker',medic:'medikit',mine:'minenleger',flame:'flammenwerfer'};
function weaponTable(names){
  const src=document.querySelector('#waffen table'); if(!src) return '';
  const rows=[...src.querySelectorAll('tbody tr')];
  const pick=names.map(n=>rows.find(r=>r.cells[0].textContent.trim()===n)).filter(Boolean);
  if(!pick.length) return '';
  return `<div class="tw"><table class="rt wt">${src.querySelector('thead').outerHTML}<tbody>${pick.map(r=>r.outerHTML).join('')}</tbody></table></div>`;
}
function openSquad(side,idx){
  const rank=slotRank;
  const sl=[...armies[side]].sort((x,y)=>rank(x)-rank(y))[idx]; if(!sl||sl.veh) return;
  const A=ART_FACTION[side]||ART;
  let html='';
  for(const u of sl.units){
    const names = u.abil && u.abil.name==='Veteran' ? ['Nahkampfwaffe','Maschinengewehr'] : (WEAPONS_OF[u.key]||[]);
    const sec=EXTRA_SECTION[u.key] && document.querySelector('#'+EXTRA_SECTION[u.key]+' p');
    html+=`<section class="pu-unit"><div class="pu-head"><span class="pu-fig army ${side}">${A[u.key]}</span>
      <h4>${u.name}${u.abil?` <span class="gabil" role="button" tabindex="0" data-abil="${u.abil.name}">★ ${u.abil.name}</span>`:''}</h4></div>
      ${weaponTable(names)}${sec?`<p class="pu-note">${sec.textContent}</p>`:''}
      ${u.abil?`<p class="pu-note"><b>${u.abil.name}:</b> ${u.abil.text}</p>`:''}</section>`;
  }
  if(rifOf(sl)) html+=`<section class="pu-unit"><div class="pu-head"><span class="pu-fig army ${side}">${RIFLEMAN_FACTION[side]||RIFLEMAN}</span><h4>${rifOf(sl)} Gewehrschützen</h4></div>${weaponTable(['Gewehr'])}</section>`;
  $('pop-k').textContent=(rifOf(sl)?'Trupp':'Spezialeinheit')+' · Waffenwerte aus dem Regelwerk'; $('pop-t').textContent=sl.units.length?sl.units.map(u=>u.name).join(' & '):`${rifOf(sl)} Gewehrschützen`;
  $('pop-d').hidden=true; $('pop-body').innerHTML=html; markPen($('pop-body')); $('pop').classList.add('wide','nohead'); $('pop').hidden=false; $('pop-x').focus();
}
document.addEventListener('click',e=>{ if(e.target.closest('.gabil')) return; const s=e.target.closest('.slot[data-squad]'); if(s) openSquad(s.dataset.side,+s.dataset.squad); });
document.addEventListener('keydown',e=>{ const s=e.target.closest&&e.target.closest('.slot[data-squad]'); if(s&&!e.target.closest('.gabil')&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); openSquad(s.dataset.side,+s.dataset.squad); } });
