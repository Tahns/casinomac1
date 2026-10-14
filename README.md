# Anubis Unchained

Jeu de roue à bonus (démo, crédits fictifs) dans l'univers du jugement d'Anubis. Statique, sans dépendance. Décors illustrés (`img/`, générés avec Higgsfield, ~300 Ko) ; si les images ne chargent pas, le décor vectoriel prend le relais.

```bash
python3 -m http.server 8000      # puis ouvrir http://localhost:8000
node tools/rtp-exact.js           # RTP, écart-type, taux de gain et prix d'achat EXACTS (très haute volatilité : les simulations de 2 M de tours ne donnent le RTP qu'à ± 2 pts)
node tools/simulate.js 1000 1 plus  # (plafonné à 1000 tours, ANUBIS_BIG=1 pour lever) RTP, taux de gain, distribution (graine, puis mode std | plus | buy-scarab | buy-weigh | buy-vault | buy-fury)
node tools/tune.js               # espérance de chaque bonus isolé
node tools/check.js              # invariants des maths (sortie 1 si échec)
node tools/contrast.js           # contraste WCAG AA des couples texte/fond
node tools/i18n-check.js         # 16 langues Stake complètes (clés, marqueurs {x}, longueurs), pas de français en dur, chiffres affichés = maths
node tools/stake-export.js       # démonstration du format Stake (books .jsonl.zst, lookup CSV, index.json) dans tools/out/, <= 1000 books par mode
PLAYWRIGHT_CORE=... node tools/layout.js # mises en page sur 10 tailles d'écran (portrait, paysage, grand écran)
PLAYWRIGHT_CORE=/chemin/node_modules/playwright-core node tools/e2e.js   # tests de bout en bout dans Chromium
PLAYWRIGHT_CORE=... node tools/gestures.js  # joue au hasard les gestes de chaque bonus et profil : jamais de blocage ni d'erreur
PLAYWRIGHT_CORE=... node tools/fuzz.js   # fuzzer de flux (<= 1000 tours) : tours, bonus forcés, perturbations, invariants (solde au centime, pas de blocage, pas de setInterval résiduel) ; FUZZ_SEED/FUZZ_ROUNDS
node tools/tune-profiles.js     # espérance des profils Prudent / Équilibré / Audacieux (doit rester égale)
```

| Fichier | Rôle |
|---|---|
| `js/math.js` | Noyau mathématique pur : tire un tour complet sous forme de script d'événements (modèle Stake Engine) |
| `js/game.js` | Boucle, décor du temple, roue, pointeur à ressort, overlay de gros gains |
| `js/bonuses.js` | Les 4 bonus (Scarabées, Pesée, Trésor, Fureur d'Anubis) et le bonus secret (Crypte d'Anubis) — rejouent les scripts |
| `js/main.js` | Flux de jeu, HUD, auto-play, table des gains, sauvegarde locale |
| `js/imgs.js` | Liste des illustrations (remplacée par des data: URI dans le build mono-fichier) |
| `js/art.js` · `audio.js` · `fx.js` · `i18n.js` | Dessin vectoriel, audio synthétisé, particules, 16 langues (anglais par défaut, `?lang=`) |
| `img/` | Illustrations générées (WebP/JPEG, ≈ 1 Mo) : décors, logos de bonus, médaillon, accueil, cadre et plaques du menu |
| `tools/build-single.py` | Construit le fichier HTML unique (CSS, polices, JS, images en data: URI) : `python3 -I tools/build-single.py sortie.html` |
| `fonts/` | Cinzel (lettrage) et Philosopher (chiffres, textes), OFL 1.1, sous-ensemble latin ≈ 90 Ko — détail dans `docs/ANALYSE.md` |
| `docs/ANALYSE.md` | SWOT, benchmark GitHub, DA, mathématiques, chemin vers Stake |
| `docs/STAKE_ENGINE_CONFORMITE.md` | Checklist de conformité Stake Engine, risques brevets/marques/droits, plan d'action (pas un avis juridique) |

Commandes : `Espace` = tourner / accélérer, `↑ ↓` = mise. Ajouter `?debug` à l'URL expose `G.testBonus('vault'|'scarab'|'weigh', boost, upgraded)` pour tester un bonus.

Argent (fictif) : au choix en € ou en $ (bouton de la barre du haut ou Réglages ; par défaut selon la langue : fr, de, es, fi → €, sinon $). Mises : 0,20 · 0,50 · 1 · 2 · 5 · 10 · 20 · 50 · 100 · 200 · 500 · 1 000 (défaut 1), solde initial 1 000. Chaque montant est arrondi au centime à chaque opération (`G.r2`, jamais de flottant brut) ; le gain = `r2(multiplicateur × mise)`, le coût Oracle+ = `r2(mise × 1,1)`, le prix d'un bonus = `r2(mise × multiplicateur)`. Les maths (`js/math.js`) ne manipulent que des multiplicateurs. Une ancienne sauvegarde en « crédits » (sans champ `v`) est remise aux valeurs par défaut.
