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
| `css/` | Schriften, Grundlook, App, Spiel-Tab (inkl. Zeitungscomic-Stil) |
| `assets/` | Schriften, Sounds, Symbole als einzelne Dateien |
| `tools/build.mjs` | Prüft und versioniert vor dem Hochladen |

## Ändern und hochladen

```bash
node tools/build.mjs   # Syntax prüfen, fehlende Dateien finden, Cache-Version setzen
git add -A && git commit -m "…" && git push
```

Eine Regel ändern (z. B. Waffenwert oder neue Generalsfähigkeit): nur `js/regeln.js` bearbeiten.
