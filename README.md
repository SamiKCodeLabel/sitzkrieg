# Sitzkrieg

Kartengenerator, Armeen, Spieldeck und Regelwerk für das Tabletop-Spiel Sitzkrieg – als installierbare Web-App (läuft offline).

Am Handy in Chrome öffnen → Menü ⋮ → „App installieren“.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `index.html` | Gerüst der Haupt-App und Regelwerk-Texte |
| `digital.html` | „Sitzkrieg Gefecht“ – digitale Partie |
| `js/regeln.js` | **Regeln als Daten**: Waffen, Spezialeinheiten, Generalsfähigkeiten, Felderweiterungen, Missionsziele. Einzige Quelle für Haupt-App und Digitalversion. |
| `js/karte.js` | Kartengenerator, Einstellungen, Tabs |
| `js/figuren.js` | Figuren und Fahrzeuge (SVG) |
| `js/armee.js` | Armee-Generierung, Popups, Wappen |
| `js/missionskarte.js` | Startzonen, Missionsziele, Felderweiterungen auf der Karte |
| `js/spiel.js` | Aktivierungsdeck und Rundenende |
| `js/lobby.js` | Online-Lobby (PeerJS) |
| `js/wuerfel.js`, `js/sounds.js`, `js/musik.js`, `js/neuwurf.js`, `js/extras.js`, `js/symbole.js` | Würfel, Töne, Musik, Neu-Würfeln, Regel-Popups/Suche/Seitenwahl, Symbolbilder |
| `js3d/` | 3D im Klemmbaustein-Stil (Three.js): Figuren und Fahrzeuge (`modelle.js`, `glbfig.js`), lebende Spielkarte mit Effekten (`einheiten3d.js`, `effekte.js`), 3D-Spieltisch (`karte3d.js`) |
| `vendor/` | Three.js 0.170 (MIT) und GSAP 3.12 – lokal, damit alles offline läuft |
| `assets/modelle/soldat.glb` | Soldaten-Modell (Grundlage aller Infanterie-Figuren), Nutzung erlaubt |
| `css/` | Schriften, Grundlook, App, Spiel-Tab, Comic-Seitendesign (`krass.css`), 3D (`lego3d.css`) |
| `assets/` | Schriften, Sounds, Symbole als einzelne Dateien |
| `tools/build.mjs` | Prüft und versioniert vor dem Hochladen |

## Ändern und hochladen

```bash
node tools/build.mjs   # Syntax prüfen, fehlende Dateien finden, Cache-Version setzen
git add -A && git commit -m "…" && git push
```

Eine Regel ändern (z. B. Waffenwert oder neue Generalsfähigkeit): nur `js/regeln.js` bearbeiten.

## Quellen

- Waffen-Sounds (`assets/sounds/gewehr|scharf|pistole|schrot|mg.mp3`): *The Free Firearm Sound Library*, CC0 – https://opengameart.org/content/the-free-firearm-sound-library
- Kanone, Explosion, Abschuss (`kanone|explosion|abschuss.mp3`): *25 CC0 bang / firework SFX*, CC0 – https://opengameart.org/content/25-cc0-bang-firework-sfx
- Kaminfeuer (`kamin.mp3`): *Fireplace sound loop*, CC0 – https://opengameart.org/content/fireplace-sound-loop
- 3D: Three.js (MIT), GSAP; Soldaten-Modell mit Erlaubnis des Erstellers

