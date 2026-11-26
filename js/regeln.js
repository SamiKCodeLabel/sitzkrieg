// =====================================================================
//  SITZKRIEG · Regeln als Daten
//  Diese Datei ist die EINZIGE Quelle für Waffenwerte, Spezialeinheiten,
//  Generalsfähigkeiten, Felderweiterungen und Missionsziele.
//  Regelwerk, Armee-Generierung, Spieldeck und Digitalversion lesen von hier.
//  Eine Regel ändern = hier eine Zeile ändern.
// =====================================================================
const RULES={
 "armee": {
  "normal": {"spezialeinheiten": 6, "trupps": 6},
  "episch": {"spezialeinheiten": 8, "trupps": 8}
 },
 "waffen": [
  {
   "name": "Mörser",
   "reichweite": "3",
   "trefferwurf": "Kl. Scheibe",
   "durchschlag": "2"
  },
  {
   "name": "Scharfschütze",
   "reichweite": "3",
   "trefferwurf": "1",
   "durchschlag": "1"
  },
  {
   "name": "Panzerfaust",
   "reichweite": "2",
   "trefferwurf": "1",
   "durchschlag": "3"
  },
  {
   "name": "Maschinengewehr",
   "reichweite": "2",
   "trefferwurf": "5",
   "durchschlag": "1"
  },
  {
   "name": "Gewehr",
   "reichweite": "2",
   "trefferwurf": "2",
   "durchschlag": "0"
  },
  {
   "name": "Pistole",
   "reichweite": "1",
   "trefferwurf": "3",
   "durchschlag": "0"
  },
  {
   "name": "Granate",
   "reichweite": "1",
   "trefferwurf": "1 Kl. Scheibe",
   "durchschlag": "2"
  },
  {
   "name": "Rauchgranate",
   "reichweite": "1",
   "trefferwurf": "0 + Rauch<br>Gr. Scheibe",
   "durchschlag": "0"
  },
  {
   "name": "Nahkampfwaffe",
   "reichweite": "Nahkampf",
   "trefferwurf": "3",
   "durchschlag": "2"
  },
  {
   "name": "Schrotflinte",
   "reichweite": "Nahkampf",
   "trefferwurf": "2 Kl. Scheiben",
   "durchschlag": "0"
  },
  {
   "name": "Flammenwerfer",
   "reichweite": "Nahkampf",
   "trefferwurf": "Feuermarker<br>+ Feuer",
   "durchschlag": "2"
  },
  {
   "name": "Personenminen",
   "reichweite": "Betreten",
   "trefferwurf": "2 je Einheit",
   "durchschlag": "1"
  },
  {
   "name": "Panzerminen",
   "reichweite": "Betreten",
   "trefferwurf": "2 je Fahrzeug",
   "durchschlag": "3"
  }
 ],
 "spezialeinheiten": [
  {
   "key": "general",
   "name": "General",
   "vorrat": 3,
   "waffen": [
    "Pistole"
   ]
  },
  {
   "key": "sniper",
   "name": "Scharfschütze",
   "vorrat": 1,
   "waffen": [
    "Scharfschütze"
   ]
  },
  {
   "key": "mine",
   "name": "Minenleger",
   "vorrat": 1,
   "waffen": [
    "Personenminen",
    "Panzerminen",
    "Nahkampfwaffe"
   ]
  },
  {
   "key": "flame",
   "name": "Flammenwerfer",
   "vorrat": 1,
   "waffen": [
    "Flammenwerfer"
   ]
  },
  {
   "key": "shotgun",
   "name": "Schrotflinte",
   "vorrat": 1,
   "waffen": [
    "Schrotflinte"
   ]
  },
  {
   "key": "grenade",
   "name": "Granatwerfer",
   "vorrat": 1,
   "waffen": [
    "Granate",
    "Rauchgranate",
    "Pistole"
   ]
  },
  {
   "key": "mortar",
   "name": "Mörser",
   "vorrat": 1,
   "waffen": [
    "Mörser"
   ]
  },
  {
   "key": "mg",
   "name": "Maschinengewehr",
   "vorrat": 1,
   "waffen": [
    "Maschinengewehr"
   ]
  },
  {
   "key": "pzf",
   "name": "Panzerfaust",
   "vorrat": 1,
   "waffen": [
    "Panzerfaust"
   ]
  },
  {
   "key": "mech",
   "name": "Mechaniker",
   "vorrat": 1,
   "waffen": [
    "Pistole"
   ]
  },
  {
   "key": "medic",
   "name": "Mediziner",
   "vorrat": 1,
   "waffen": [
    "Pistole"
   ]
  }
 ],
 "generalsfaehigkeiten": [
  {
   "name": "Besetzen",
   "text": "Der General zählt am Rundenende wie zwei Trupps, wenn die Trupps an einem Missionsziel gezählt werden."
  },
  {
   "name": "Kartograf",
   "text": "Infanterietrupps, die ihre Bewegung in Nahkampfreichweite des Generals beginnen, durchqueren unwegsames Gelände ohne Abzug und haben beim Angriff keinen Nachteil durch Rauch."
  },
  {
   "name": "Feldherr",
   "text": "Infanterietrupps, die in Nahkampfreichweite des Generals angreifen, erhalten beim Trefferwurf eine Erleichterung von 1. Ihre Kl. und Gr. Scheiben weichen nie ab."
  },
  {
   "name": "Taktiker",
   "text": "Infanterietrupps, die in Nahkampfreichweite des Generals angreifen, dürfen den Trefferwurf einmal pro Runde komplett wiederholen, wenn kein einziger Treffer dabei war."
  },
  {
   "name": "Improvisieren",
   "text": "Infanterietrupps, die in Nahkampfreichweite des Generals angreifen, dürfen einen beliebigen Würfel neu werfen (beim Treffer- oder beim Durchschlagswurf)."
  },
  {
   "name": "Flankieren",
   "text": "Nach dem kompletten Spielaufbau und dem Aufstellen aller Trupps dürfen der General und 1 weiterer Infanterietrupp (kein neuer) zusammen an eine beliebige Kante oder Ecke des Spielfelds gestellt werden. Sie sind nicht an die festgelegten Seiten gebunden."
  },
  {
   "name": "Veteran",
   "text": "Statt der Pistole hat der General eine Nahkampfwaffe und ein Maschinengewehr und darf im selben Zug mit beiden angreifen."
  },
  {
   "name": "Unsterblich",
   "text": "Hat der General nur noch einen Lebenspunkt, fällt er nur, wenn ihm ein einzelner Trupp oder ein Fahrzeug 2 Schaden auf einmal zufügt oder ihn ein Durchschlag von 3 trifft."
  },
  {
   "name": "Blutrausch",
   "text": "Für jeden verursachten Verlust regeneriert der General einen Lebenspunkt zurück."
  },
  {
   "name": "Monster",
   "text": "Nachdem der General einen Infanterietrupp angegriffen hat, darf er den Trupp um Reichweite 1 nach Belieben bewegen."
  },
  {
   "name": "Blitz",
   "text": "Der General hat eine Bewegungsreichweite von 2."
  },
  {
   "name": "Schussbefehl",
   "text": "Nachdem der General einen Angriff vollzogen hat, darf eine Einheit eines Infanterietrupps in Reichweite 1 einen einzelnen Angriff durchführen."
  },
  {
   "name": "Erstschlag",
   "text": "Wenn der General von irgendeinem Truppenangriff als Ziel deklariert wird, darf er sofort einen Angriff auf den feindlichen Trupp vollziehen. Dieser wird zuerst abgehandelt und ignoriert die Angriffsreichweite des Generals."
  },
  {
   "name": "Rage",
   "text": "Nachdem der General einen Angriff vollzogen hat, darf er einen Lebenspunkt opfern, um direkt ein weiteres Mal anzugreifen (auch mehrmals hintereinander)."
  },
  {
   "name": "Verschanzen",
   "text": "Alle Infanterietrupps, die sich im gleichen Gebäude oder in der gleichen Deckung wie der General befinden, erhalten einen weiteren Deckungsbonus."
  },
  {
   "name": "Anführer",
   "text": "Für jeden Trupp, der in Reichweite 1 zum General steht, erhält er beim Trefferwurf eine Erleichterung von 1."
  },
  {
   "name": "Unbarmherzig",
   "text": "Nachdem der General einen Angriff vollzogen hat, werden die erwürfelten Verluste verdoppelt (nicht für Fahrzeuge)."
  }
 ],
 "felderweiterungen": [
  {
   "name": "Auto",
   "icon": "🚗",
   "effekt": "Deckung"
  },
  {
   "name": "Kutsche",
   "icon": "🐴",
   "effekt": "Deckung"
  },
  {
   "name": "Jeep",
   "icon": "🚙",
   "effekt": "Deckung"
  },
  {
   "name": "Stacheldraht",
   "icon": "➰",
   "effekt": "Personenminen und unwegsames Gelände",
   "link": "stacheldraht"
  },
  {
   "name": "Flugzeugwrack",
   "icon": "✈️",
   "effekt": "Deckung und dauerhafter Rauch",
   "link": "flugzeugwrack"
  },
  {
   "name": "Abtrünnige",
   "icon": "🏴",
   "effekt": "2 neutrale Trupps mit je 7 Gewehrschützen",
   "link": "abtruennige"
  }
 ],
 "missionsziele": {
  "fest": {
   "hafen": "Hafen",
   "kirche": "Kirche",
   "zug": "Zug",
   "farm": "Farm",
   "wohn": "Wohnhaus",
   "bunker": "Bunker",
   "graben": "Graben",
   "turm": "Wachturm"
  },
  "flexibel": [
   "Transporter",
   "Kampfflieger",
   "Artilleriegeschütz",
   "Flakgeschütz"
  ],
  "felder": [
   "flach",
   "strand",
   "strasse",
   "ruine"
  ],
  "tabelle": [
   {
    "name": "Hafen",
    "ziel": "1 Gewehrschützen-Trupp dauerhaft +1 Trefferbonus",
    "ueber": "1 Gewehrschützen-Trupp dauerhaft +1 Durchschlagsbonus"
   },
   {
    "name": "Kirche",
    "ziel": "2 Gewehrschützen zurückbekommen",
    "ueber": "2 Lebenspunkte einer Spezialeinheit heilen"
   },
   {
    "name": "Transporter",
    "ziel": "1 Gewehrschützen zurückbekommen",
    "ueber": "1 neuer Gewehrschützen-Trupp erscheint am Transporter"
   },
   {
    "name": "Zug",
    "ziel": "1 Lebenspunkt einer Spezialeinheit heilen",
    "ueber": "1 neue Spezialeinheit erscheint am Zug"
   },
   {
    "name": "Farm",
    "ziel": "1 Fahrzeug bewegen",
    "ueber": "1 Fahrzeug aktivieren"
   },
   {
    "name": "Wohnhaus",
    "ziel": "1 Infanterietrupp bewegen",
    "ueber": "1 Infanterietrupp aktivieren"
   },
   {
    "name": "Bunker",
    "ziel": "2 MG-Angriffe auf einen Trupp bis zu 2 Felder vor dem Bunker",
    "ueber": "4 MG-Angriffe auf Trupps bis zu 2 Felder vor dem Bunker"
   },
   {
    "name": "Graben",
    "ziel": "1 Granaten-Angriff auf ein Ziel bis zu 1 Feld entfernt",
    "ueber": "2 Granaten-Angriffe auf Ziele bis zu 1 Feld entfernt"
   },
   {
    "name": "Wachturm",
    "ziel": "1 Scharfschützen-Angriff auf einen Trupp bis zu 2 Felder entfernt",
    "ueber": "3 Scharfschützen-Angriffe auf Trupps bis zu 2 Felder entfernt"
   },
   {
    "name": "Artilleriegeschütz",
    "ziel": "1 Panzerfaust-Angriff auf einen Trupp bis zu 2 Felder entfernt",
    "ueber": "2 Panzerfaust-Angriffe auf einen Trupp bis zu 2 Felder entfernt"
   },
   {
    "name": "Flakgeschütz",
    "ziel": "1 Mörser-Angriff auf ein Ziel bis zu 3 Felder entfernt",
    "ueber": "1 Mörser-Angriff mit Gr. Scheibe auf ein Ziel bis zu 3 Felder entfernt"
   },
   {
    "name": "Kampfflieger",
    "ziel": "1 Luftschlag-MG-Angriff des Kampffliegers irgendwo auf dem Spielfeld",
    "ueber": "1 Bomben-Angriff des Kampffliegers irgendwo auf dem Spielfeld"
   }
  ]
 }
};

// Regelwerk-Abschnitte aus den Daten erzeugen (läuft sofort, die Seite ist schon geladen)
function renderRegelwerk(doc){
  doc=doc||document;
  const q=id=>doc.getElementById(id);
  const tbody=(id,html)=>{ const t=q(id)&&q(id).querySelector('tbody'); if(t) t.innerHTML=html; };
  tbody('waffen',RULES.waffen.map(w=>`<tr><td>${w.name}</td><td>${w.reichweite}</td><td>${w.trefferwurf}</td><td>${w.durchschlag}</td></tr>`).join(''));
  const dl=q('general')&&q('general').querySelector('dl.abil');
  if(dl) dl.innerHTML=RULES.generalsfaehigkeiten.map(g=>`<dt>${g.name}</dt><dd>${g.text}</dd>`).join('');
  const ul=q('felderweiterung')&&q('felderweiterung').querySelector('ul');
  if(ul) ul.innerHTML=RULES.felderweiterungen.map(f=>`<li><b>${f.link?`<a href="#${f.link}">${f.name}</a>`:f.name}</b> – ${f.effekt}</li>`).join('');
  const tz=q('truppenzusammensetzung')&&q('truppenzusammensetzung').querySelector('tbody');
  if(tz) tz.innerHTML=[['Normal',RULES.armee.normal],['Episch',RULES.armee.episch]].map(([n,a])=>`<tr><td>${n}</td><td>${a.spezialeinheiten}</td><td>${a.trupps}</td><td>bis zu 1 pro Typ</td></tr>`).join('');
  tbody('missionsziel-tabelle',RULES.missionsziele.tabelle.map(z=>`<tr><td>${z.name}</td><td>${z.ziel}</td><td>${z.ueber}</td></tr>`).join(''));
  const fx=q('flexible-missionsziele'); if(fx){ const u=fx.querySelectorAll('.vgrid ul'); if(u[1]) u[1].innerHTML=RULES.missionsziele.flexibel.map(n=>`<li>${n}</li>`).join(''); }
}
renderRegelwerk();
