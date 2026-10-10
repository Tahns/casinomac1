# Hand of Anubis

Jeu de roue à bonus (démo, crédits fictifs) dans l'univers du jugement d'Anubis. Statique, sans dépendance, sans asset externe.

```bash
python3 -m http.server 8000      # puis ouvrir http://localhost:8000
node tools/simulate.js 10000000 1 plus  # RTP, taux de gain, distribution (graine, puis mode std | plus | buy-scarab | buy-weigh | buy-vault | buy-hand)
node tools/tune.js               # espérance de chaque bonus isolé
node tools/check.js              # invariants des maths (sortie 1 si échec)
PLAYWRIGHT_CORE=/chemin/node_modules/playwright-core node tools/e2e.js   # tests de bout en bout dans Chromium
```

| Fichier | Rôle |
|---|---|
| `js/math.js` | Noyau mathématique pur : tire un tour complet sous forme de script d'événements (modèle Stake Engine) |
| `js/game.js` | Boucle, décor du temple, roue, pointeur à ressort, overlay de gros gains |
| `js/bonuses.js` | Les 4 bonus (Scarabées, Pesée, Trésor, Main d'Anubis) — rejouent les scripts |
| `js/main.js` | Flux de jeu, HUD, auto-play, table des gains, sauvegarde locale |
| `js/art.js` · `audio.js` · `fx.js` · `i18n.js` | Dessin vectoriel, audio synthétisé, particules, FR/EN |
| `docs/ANALYSE.md` | SWOT, benchmark GitHub, DA, mathématiques, chemin vers Stake |

Commandes : `Espace` = tourner / accélérer, `↑ ↓` = mise. Ajouter `?debug` à l'URL expose `G.testBonus('vault'|'scarab'|'weigh', boost, upgraded)` pour tester un bonus.
