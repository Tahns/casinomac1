# Anubis Unchained

Jeu de roue à bonus (démo, crédits fictifs) dans l'univers du jugement d'Anubis. Statique, sans dépendance. Décors illustrés (`img/`, générés avec Higgsfield, ~300 Ko) ; si les images ne chargent pas, le décor vectoriel prend le relais.

```bash
python3 -m http.server 8000      # puis ouvrir http://localhost:8000
node tools/rtp-exact.js           # RTP, écart-type, taux de gain et prix d'achat EXACTS (très haute volatilité : les simulations de 2 M de tours ne donnent le RTP qu'à ± 2 pts)
node tools/simulate.js 1000 1 plus  # (plafonné à 1000 tours, ANUBIS_BIG=1 pour lever) RTP, taux de gain, distribution (graine, puis mode std | plus | bonus-scarab | bonus-weigh | bonus-vault | bonus-fury)
node tools/tune.js               # espérance de chaque bonus isolé
node tools/check.js              # invariants des maths (sortie 1 si échec)
node tools/contrast.js           # contraste WCAG AA des couples texte/fond
node tools/i18n-check.js         # 16 langues Stake complètes (clés, marqueurs {x}, longueurs), pas de français en dur, chiffres affichés = maths
node tools/stake-export.js       # démonstration du format Stake (books .jsonl.zst, lookup CSV, index.json) dans tools/out/, <= 1000 books par mode
node tools/export-parity.js    # tirages de parité JS pour stake-math/tests (≤ 1000 tours au total)
python3 -m unittest discover -s stake-math/tests   # portage Python (math-sdk) : parité avec le JS, moments exacts, format des books (54 tests, ≈ 1 s)
python3 stake-math/run.py       # books + lookup + index.json au format math-sdk dans stake-math/library/ (≤ 1000 books par mode ; HOA_BIG=1 réservé à une vraie production)
node tools/social-check.js       # mode social (Stake.US) : aucun mot interdit dans tous les textes sociaux, 10.00 SC / GC sans « $ » ; avec PLAYWRIGHT_CORE, scanne aussi le DOM et le canvas (?social=true&currency=XSC)
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
| `js/bonuses.js` | Les 4 bonus (Scarabées, Pesée, Trésor, Fureur d'Anubis) et le bonus secret (Sanctuaire des Marées) — rejouent les scripts |
| `js/main.js` | Flux de jeu, HUD, auto-play, table des gains, sauvegarde locale |
| `js/imgs.js` | Liste des illustrations (remplacée par des data: URI dans le build mono-fichier) |
| `js/art.js` · `audio.js` · `fx.js` · `i18n.js` | Dessin vectoriel, audio synthétisé, particules, 16 langues (anglais par défaut, `?lang=`) |
| `js/currency.js` · `js/social.js` | Devises (symbole, position, décimales, gains sous-centime ; `?currency=`) · mode social (`?social=true`, textes de remplacement `I18N_SOCIAL` en bas de `i18n.js`, devises XSC/XGC) |
| `img/` | Illustrations générées (WebP/JPEG, ≈ 1 Mo) : décors, logos de bonus, médaillon, accueil, cadre et plaques du menu |
| `tools/build-single.py` | Construit le fichier HTML unique (CSS, polices, JS, images en data: URI) : `python3 -I tools/build-single.py sortie.html` |
| `tools/build-stake.py` · `tools/stake-build-test.js` | Build de production Stake (`dist-stake/`, `dist-stake.zip`, sans démo locale) et son test Playwright — voir « Build de production Stake » |
| `fonts/` | Cinzel (lettrage) et Philosopher (chiffres, textes), OFL 1.1, sous-ensemble latin ≈ 90 Ko — détail dans `docs/ANALYSE.md` |
| `stake-math/` | Portage Python des maths au format math-sdk de Stake (game_config, books, lookup, index.json, optimiseur, tests de parité) — voir `stake-math/README.md` |
| `docs/ANALYSE.md` | SWOT, benchmark GitHub, DA, mathématiques, chemin vers Stake |
| `docs/STAKE_ENGINE_CONFORMITE.md` | Checklist de conformité Stake Engine, risques brevets/marques/droits, plan d'action (pas un avis juridique) |
| `docs/GUIDE_PUBLICATION.md` · `docs/DOSSIER_PI.md` | Guide pas à pas de publication sur Stake Engine (qui fait quoi, cases à cocher) · dossier à remettre à un conseil en propriété industrielle (pas un avis juridique) |

Commandes : `Espace` = tourner / accélérer, `↑ ↓` = mise. Ajouter `?debug` à l'URL expose `G.testBonus('vault'|'scarab'|'weigh', boost, upgraded)` pour tester un bonus.

Argent (fictif, démo locale uniquement ; la démo n'est PAS le build Stake) : le bouton devise de la barre du haut fait défiler 7 devises (USD, EUR, CAD, MXN, JPY, SC, GC ; en mode social SC et GC seulement), conversion indicative et non réelle (taux `k` de `js/currency.js`), dite par son infobulle et par la fenêtre des règles dans les 16 langues (`curHint`, `demoBuild`) ; par défaut selon la langue : fr, de, es, fi → €, sinon $. Mises : 0,20 · 0,50 · 1 · 2 · 5 · 10 · 20 · 50 · 100 · 200 · 500 · 1 000 (défaut 1), solde initial 1 000. Chaque montant est arrondi au centime à chaque opération (`G.r2`, jamais de flottant brut) ; le gain = `r2(multiplicateur × mise)`, le coût Oracle+ = `r2(mise × 1,1)`, le prix d'un bonus = `r2(mise × multiplicateur)`. Les maths (`js/math.js`) ne manipulent que des multiplicateurs. Une ancienne sauvegarde en « crédits » (sans champ `v`) est remise aux valeurs par défaut.

## Build de production Stake

Le dépôt et l'artifact (`tools/build-single.py`) restent en **démo locale** (`js/build.js` : `window.ANUBIS_BUILD = 'demo'`, RNG du navigateur, solde fictif). Le build à déposer chez Stake est un autre fichier de sortie : même code, drapeau `'stake'`, aucune démo.
```bash
python3 -I tools/build-stake.py    # écrit dist-stake/ et dist-stake.zip (ignorés par le dépôt) ; sortie 1 au premier défaut
PLAYWRIGHT_CORE=/chemin/node_modules/playwright-core node tools/stake-build-test.js   # reconstruit puis teste dist-stake/ (faux RGS, ANUBIS_POOL=24)
```
- **Contenu du zip** (≈ 2 Mo, 53 fichiers) : `index.html` à la racine, puis `js/` `css/` `img/` `fonts/`, seulement les fichiers réellement référencés ; jamais de `.md`, `.py`, `tools/`, `docs/`, `stake-math/`, `brand/`. Chemins relatifs, aucun hôte externe (le script le vérifie, liste les fichiers et la taille totale).
- **Comportement** : sans `sessionID` / `rgs_url` ni `replay=true`, le jeu affiche « Lancez le jeu depuis Stake » (16 langues, sans le mot Stake en mode social) : pas d'interface de jeu, pas de solde fictif, pas de bouton de remise à zéro, aucun tirage dans le navigateur. Avec `?sessionID=…&rgs_url=…` il joue via le RGS ; `?replay=true&game=…&version=…&mode=…&event=…&rgs_url=…` rejoue un round.
- **À déposer dans Stake** : page du jeu, **Files > Front End** : envoyer `dist-stake.zip` (ou le contenu de `dist-stake/`, `index.html` à la racine). Les maths (`stake-math/`, voir son README) se déposent à part, dans la section des maths (`index.json`, books `.jsonl.zst`, lookup CSV ; modes `std`, `plus`, `bonus_scarab`, `bonus_weigh`, `bonus_vault`, `bonus_fury`).
- Tout changement de code exige de relancer `tools/build-stake.py` : `dist-stake/` n'est jamais versionné.
