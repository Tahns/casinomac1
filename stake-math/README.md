# stake-math — les maths d'Anubis Unchained au format math-sdk de Stake (Python 3, bibliothèque standard)

Portage de `js/math.js` (référence) vers un dossier qui produit ce que le RGS de Stake attend : books (`.jsonl.zst`), tables de lookup (CSV)
et `index.json`, plus les fichiers lus par l'optimiseur du SDK officiel (`StakeEngine/math-sdk`, lu en juin 2026 depuis GitHub).

**État honnête** : le portage et les contrôles de parité sont faits et testés. **La table de production optimisée n'existe pas** : elle doit être
produite par l'utilisateur avec la grosse simulation puis l'optimiseur Rust de Stake (section « Produire la table de production »). Ce que
`run.py` écrit par défaut (≤ 1000 books par mode, poids tous égaux) ne sert qu'à montrer le format. Le programme Rust de l'optimiseur n'a **pas** été
lancé ici ; aucun test, aucune simulation ne dépasse 1000 tours (`cap.py`).

## Contenu

| Fichier | Rôle (équivalent math-sdk) |
|---|---|
| `game_config.py` | `GameConfig` : 6 modes (`std`, `plus`, `buy_scarab`, `buy_weigh`, `buy_vault`, `buy_fury`), coûts, RTP cible 96,2 %, `wincap` 25 000, roue de 64 cases, Oracle, tables des bonus, échelle `SCALE = 100`. Utilise `BetMode`/`Distribution` du SDK s'il est importable, sinon des classes de même signature |
| `game_calculations.py` | Les calculs du jeu (Scarabées, Pesée, Trésor, Fureur, Sanctuaire, tour, achat) : copie de `js/math.js`, mêmes tables, mêmes plafonds, même ordre de consommation des tirages, **tout en entiers** (échelle 100) |
| `game_events.py` | Les événements d'un book (voir « Format des events ») |
| `gamestate.py` | `GameState.run_spin` : un tour → un book, critères de distribution par rejet (comme `check_repeat` du SDK) |
| `force.py` | Construction du book au gain maximal (critère `wincap`) par tirages imposés passant par le même moteur |
| `game_optimization.py` | `opt_params` de l'optimiseur (valeurs de départ tirées du calcul exact) |
| `exact.py` | Calcul exact du RTP, de l'écart-type, du taux de gain (port de `tools/rtp-exact.js`) |
| `write_data.py`, `verify.py` | Écriture de `library/…` et contrôle de format (repris de `utils/rgs_verification.py`) |
| `run.py` | Point d'entrée (≤ 1000 books par mode ; `HOA_BIG=1` pour une production) |
| `rng.py`, `cap.py` | `mulberry32` identique au JS, tirages imposés ; plafond de 1000 |
| `tests/` | 51 tests `unittest` (parité JS, moments exacts, statistiques, format, événements) |
| `../tools/export-parity.js` | Produit `tests/parity_draws.json` (tirages JS + gains JS, ≤ 1000 tours au total) |

```bash
python3 -m unittest discover -s stake-math/tests          # 51 tests, ~1 s
python3 stake-math/exact.py                              # RTP exact de chaque mode (aucun tirage)
python3 stake-math/run.py                                # 1000 books par mode dans stake-math/library/ (ignoré par git)
python3 stake-math/run.py --books 200 --modes std,buy_fury --step 1
node tools/export-parity.js                              # régénère les tirages de parité (≤ 1000 tours au total)
```

`HOA_BIG=1` (ou `ANUBIS_BIG=1`, nom des outils Node) lève le plafond de 1000 : **réservé à l'utilisateur** pour une vraie production. Aucun test ne le lit.
Python 3.12 ou plus pour le SDK ; ce dossier tourne dès Python 3.9. `zstandard` (ou Python 3.14, `pyzstd`, la commande `zstd`) est utilisé pour
compresser les books ; sans aucun d'eux, `run.py` écrit des `.jsonl` bruts et l'annonce (le RGS veut du `.jsonl.zst`). numpy n'est pas nécessaire.

## Les 6 modes

| Mode | Coût (× mise) | RTP exact | Taux de gain | Écart-type (× mise) |
|---|---|---|---|---|
| `std` | 1 | 96,21 % | 42,6 % | 16,4 |
| `plus` (Oracle+) | 1,1 | 96,14 % | 42,6 % | 18,9 |
| `buy_scarab` | 9,24 | 95,96 % | 100 % | 4,03 × le prix |
| `buy_weigh` | 10,31 | 96,00 % | 54,0 % | 6,72 × le prix |
| `buy_vault` | 12,37 | 96,02 % | 100 % | 3,49 × le prix |
| `buy_fury` | 27,28 | 96,02 % | 100 % | 4,37 × le prix |

RTP cible déclaré : **96,2 %** pour tous les modes (`BetMode.rtp`). Les RTP exacts ci-dessus sont ceux des lois NON optimisées (écart maximal entre modes
0,25 point, sous les 0,5 point de la source tierce) ; l'optimiseur les ramène à la cible en réglant les poids. Gain maximal : **25 000 ×**
(`wincap`), identique dans tous les modes.

## Échelle entière, et un défaut trouvé dans la doc du dépôt

Les gains sont des entiers à l'échelle 100 (100 = 1,00 ×), comme `M.SCALE` : la conversion de toutes les valeurs du jeu est exacte. **Mais** le
vérificateur officiel (`utils/rgs_verification.py`, relu et exécuté sur nos fichiers) exige que chaque `payoutMultiplier` soit un **multiple de 10**
(0,10 ×) et que le plus petit gain non nul vaille au moins 10. Les valeurs 0,25 ×, 0,65 ×, 0,79 × (et des totaux qui en découlent) ne le sont pas. Le portage
tranche ainsi (`--step`, défaut 10) :

- `payoutMultiplier` et colonne 3 de la lookup = total du tour arrondi au multiple de 10 le plus proche (moitié vers le haut), jamais nul pour un gain non nul ;
  `finalWin.amount` vaut ce `payoutMultiplier`, et `finalWin.exact` le total exact ; les `spinWin.win` et les gains de bonus restent exacts (échelle 100).
  Le front doit afficher `finalWin.amount` (c'est ce que le RGS paie).
- Effet : surtout +0,05 × sur les cases 0,25 × (≈ +0,4 point de RTP brut en `std`), que l'optimiseur absorbe puisqu'il travaille sur les payouts arrondis.
- `--step 1` garde les payouts exacts (parité bit à bit avec le JS) mais **échoue** au vérificateur du SDK (constaté). Pour un jeu sans arrondi, il faudrait
  changer les tables de `js/math.js` (0,25 → 0,3 ; 0,65 / 0,79 → valeurs multiples de 0,1) : décision de conception, non prise ici, `js/math.js` n'est pas modifié.

## Format des events

**Format v2 définitif : la référence est l'en-tête de `tools/stake-export.js`** (champs, ordre, règles, et `verify(book)` qui recalcule tout). `game_events.py` l'écrit
à l'identique : chaque event a `seq` (compteur) et `type` ; `roundStart { v:2, mode, cost, maxWin, cells:64 }` ; `oracle` scellé, puis `wheelStop { index, kind, boost }` et
`oracleReveal` ; `bonusStart { kind, bonus, secret, upgraded, bought }` ; `scarabDrop`, `weighReveal { win, variants[2] }`, `vaultPick` / `vaultEnd`, `furySpin` / `furyEnd`
(3 couleurs, champ `color`, bandes imbriquées `nested`), `sanctuaryTablet { tablet_type, value (tab : x100), tideBefore, tide, offeringBefore, gain, offering }` / `sanctuaryEnd` ;
`spinWin` ; `finalWin { amount, exact, capped }`. Montants : entiers x100. Les books produits avec `--step 1` sont relus sans écart par `RGS.bookToRound` (js/rgs.js) et par
`verify()` du JS (600 books contrôlés). Avec `--step 10`, `finalWin.amount` est arrondi : le front crédite `payoutMultiplier` et signale l'écart tant que les valeurs de gain
ne sont pas des multiples de 0,1.

## Choix du joueur : variantes de même total dans les books

Un seul `payoutMultiplier` est payé : **toutes les variantes sélectionnables d'un book paient le même total** ; le choix du joueur ne fait que choisir celle qui s'affiche.

- **Fureur d'Anubis (couleur)** : le book écrit les 3 variantes (`color` 0, 1, 2). La variante c est celle de la couleur 0 dont les cases DOUBLE sont remplacées par celles de la couleur c (mêmes rôles, paliers, nombres, bandes) : `game_events.fury_variant`.
- **Pesée (plume ou cœur)** : `weighReveal.variants[0]` (plume) et `[1]` (cœur) ont la même valeur du joueur, le même résultat et le même `win`.
- **Trésor, Sanctuaire** : tout est tiré d'avance ; la tuile ou la tablette touchée est neutre.

## Critères de distribution (wincap, 0, bonus, basegame)

Comme le SDK, chaque mode répartit ses books en critères, avec quotas (`game_config.QUOTAS`) : `wincap` (0,2 %), `0`, `bonus`, `basegame` ; achats : `wincap` et `bonus`
(plus `0` pour la Pesée). Un book est tiré jusqu'à appartenir à son critère (rejet), donc sa loi conditionnelle est la loi naturelle du jeu. Le **gain maximal** ne
peut pas être obtenu par rejet (de l'ordre de 1 sur 10⁸) : `force.py` impose les tirages d'un chemin réel du moteur (Fureur ×8, Pesée 1000 × 6 = 48 000 ×, plafonné à 25 000 ×),
identique dans les deux langages (`test_gain_maximal_meme_chemin_dans_les_deux_langages`). Les fences de l'optimiseur sont dans `game_optimization.py` : `wincap` (RTP 0,2 pt,
1 sur 12,5 millions), `0`, `bonus` (clé `bonus = yes` des `force_record_*.json`), `basegame` ; RTP rapportés au coût du mode, somme = 96,2 %.

## Vérification de parité (sans grosse simulation)

- `tests/test_exact.py` : le port Python du calcul exact égale `tools/rtp-exact.js` à 1e-9 (RTP 96,21 % / 96,14 % / 95,96–96,02 %), la récurrence du Sanctuaire égale un DP exhaustif,
  la Pesée et un scarabée énumérés par le moteur retrouvent les formules exactes.
- `tests/test_parity.py` : 922 tours / tirages joués par `js/math.js` (6 modes × 100, 5 bonus × 60, chaînes imposées, 6 scripts de gain maximal) ; Python rejoue les mêmes tirages
  et doit retrouver mêmes gains entiers, mêmes cases, mêmes boosts, et consommer exactement les mêmes tirages. Un test relance Node avec une autre graine (≈ 230 tours).
- `tests/test_stats.py` : RTP dans [90 %, 96,7 %] et à moins de 0,5 point de 96,2 % ; écart entre modes ≤ 0,5 point (0,25 constaté) ; taux de gain ≥ 1/20 ; critère `wincap` dans
  chaque mode et dans la distribution cible ; un book à 2 500 000 par mode.
- `tests/test_books.py` : format (`index.json` strict, lookup de 3 entiers, payout égal au book), événements cohérents (somme des gains, Trésor, Fureur, Pesée, Scarabées, Sanctuaire).
- Les fichiers produits ont aussi été passés dans `verify_lookup_format`, `verify_books_and_payout_mults` et `compare_payout_values` du SDK officiel (100 books par mode : conformes avec `--step 10`, refusés avec `--step 1`).

## Produire la table de production (à faire par l'utilisateur)

1. `git clone https://github.com/StakeEngine/math-sdk`, Python ≥ 3.12 (`pip install -r requirements.txt`), Rust/Cargo.
2. Générer les books **dans l'arborescence du SDK** (le programme Rust lit `../games/<game_id>/library/…`) :
   `HOA_BIG=1 python3 stake-math/run.py --books 300000 --prepare-optimizer --out <math-sdk>/games/anubis_unchained/library`
   (≈ 1 Ko par book avant compression ; compter 100 000 à 1 000 000 books par mode, quelques minutes par million). Cela écrit `lookup_tables/lookUpTable_<mode>.csv`, `forces/force_record_<mode>.json`,
   `configs/math_config.json` et `optimization_files/setup_<mode>.toml`.
3. Pour chaque mode : copier `library/optimization_files/setup_<mode>.toml` sur `<math-sdk>/optimization_program/src/setup.toml`, puis `cd <math-sdk>/optimization_program && cargo run --release`.
   Le programme réécrit `library/publish_files/lookUpTable_<mode>_0.csv` (poids optimisés). Vérifier à chaque fois le RTP obtenu (cible 96,2 %), le taux de gain, la fréquence du gain max.
4. Régler au besoin `game_optimization.py` : `min_m2m`/`max_m2m`, `num_pigs_per_fence`, `scaling`, la part de RTP du gain max (`WINCAP_RTP`). **Ces valeurs de départ n'ont pas été éprouvées** (l'optimiseur n'a pas été lancé).
5. Contrôler : `python3 -c "import verify; print(verify.verify_library('<…>/library/publish_files'))"` puis l'`execute_all_tests` du SDK ; envoyer `publish_files/` (index.json, books `.jsonl.zst`, lookup `_0.csv`).
   Le `config.json` du RGS (hachages du front, `standardForceFile`) et le `config_fe` complet ne sont pas produits ici : générer avec `generate_configs` du SDK si l'intégration complète (GameState du SDK) est faite.

## Ce qui n'est pas fait

- Table de production optimisée ; optimiseur Rust jamais lancé ; RTP final non mesuré sur la table optimisée.
- Intégration comme `GameState` du SDK (`create_books`, `generate_configs`, `upload`) : les fichiers sont produits de façon autonome, au même format et aux mêmes chemins.
- Un mode par profil (Prudent / Audacieux) pour conserver ce choix ; décision sur l'arrondi au pas de 10 (voir plus haut).
- Adaptation du front aux nouveaux events (autre chantier) ; essais contre un vrai RGS.
