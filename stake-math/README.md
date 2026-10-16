# stake-math — les maths d'Anubis Unchained au format math-sdk de Stake (Python 3, bibliothèque standard)

Portage de `js/math.js` (référence) vers un dossier qui produit ce que le RGS de Stake attend : books (`.jsonl.zst`), tables de lookup (CSV)
et `index.json`, plus les fichiers lus par l'optimiseur du SDK officiel (`StakeEngine/math-sdk`, lu en juin 2026 depuis GitHub).

**État honnête** : le portage et les contrôles de parité sont faits et testés. **Une table de production a été produite le 2026-10-15** (200 000 books par mode, optimiseur Rust de Stake lancé mode par mode : RTP 96,20 % dans les 6 modes, taux de gain 42,59 % en Standard/Oracle+, gain max 1 sur 12,5 millions en Standard ; contrôle de format du dossier : aucune erreur). Elle n'est pas dans git (62 Mo) et n'a pas été éprouvée contre un vrai RGS. **Elle est périmée depuis le 2026-10-16** (nouvelles maths : Colère d'Anubis, roue, Oracle, fences par palier) : à refaire, voir `docs/VOLATILITE.md` §4. Pour la refaire : l'utilisateur avec la grosse simulation puis l'optimiseur Rust de Stake (section « Produire la table de production »). Ce que
`run.py` écrit par défaut (≤ 1000 books par mode, poids tous égaux) ne sert qu'à montrer le format. Le programme Rust de l'optimiseur n'a **pas** été
lancé ici ; aucun test, aucune simulation ne dépasse 1000 tours (`cap.py`).

## Contenu

| Fichier | Rôle (équivalent math-sdk) |
|---|---|
| `game_config.py` | `GameConfig` : 6 modes (`std`, `plus`, `bonus_scarab`, `bonus_weigh`, `bonus_vault`, `bonus_fury`), coûts, RTP cible 96,2 %, `wincap` 25 000, roue de 64 cases, Oracle, tables des bonus, échelle `SCALE = 100`. Utilise `BetMode`/`Distribution` du SDK s'il est importable, sinon des classes de même signature |
| `game_calculations.py` | Les calculs du jeu (Scarabées, Pesée, Trésor, Fureur, Sanctuaire, tour, achat) : copie de `js/math.js`, mêmes tables, mêmes plafonds, même ordre de consommation des tirages, **tout en entiers** (échelle 100) |
| `game_events.py` | Les événements d'un book (voir « Format des events ») |
| `gamestate.py` | `GameState.run_spin` : un tour → un book, critères de distribution par rejet (comme `check_repeat` du SDK) |
| `force.py` | Construction du book au gain maximal (critère `wincap`) par tirages imposés passant par le même moteur |
| `game_optimization.py` | `opt_params` de l'optimiseur (valeurs de départ tirées du calcul exact) |
| `exact.py` | Calcul exact (loi complète du gain, plafond compris) : RTP, écart-type, taux de gain, fréquence des gros gains, cibles des fences (port de `tools/rtp-exact.js`) |
| `write_data.py`, `verify.py` | Écriture de `library/…` et contrôle de format (repris de `utils/rgs_verification.py`) |
| `run.py` | Point d'entrée (≤ 1000 books par mode ; `HOA_BIG=1` pour une production) |
| `rng.py`, `cap.py` | `mulberry32` identique au JS, tirages imposés ; plafond de 1000 |
| `tests/` | 66 tests `unittest` (parité JS, moments exacts, statistiques, format, événements) |
| `../tools/export-parity.js` | Produit `tests/parity_draws.json` (tirages JS + gains JS, ≤ 1000 tours au total) |

```bash
python3 -m unittest discover -s stake-math/tests          # 66 tests, ~6 s
python3 stake-math/exact.py                              # RTP exact de chaque mode (aucun tirage)
python3 stake-math/run.py                                # 1000 books par mode dans stake-math/library/ (ignoré par git)
python3 stake-math/run.py --books 200 --modes std,bonus_fury
node tools/export-parity.js                              # régénère les tirages de parité (≤ 1000 tours au total)
```

`HOA_BIG=1` (ou `ANUBIS_BIG=1`, nom des outils Node) lève le plafond de 1000 : **réservé à l'utilisateur** pour une vraie production. Aucun test ne le lit.
Python 3.12 ou plus pour le SDK ; ce dossier tourne dès Python 3.9. `zstandard` (ou Python 3.14, `pyzstd`, la commande `zstd`) est utilisé pour
compresser les books ; sans aucun d'eux, `run.py` écrit des `.jsonl` bruts et l'annonce (le RGS veut du `.jsonl.zst`). numpy n'est pas nécessaire.

## Les 6 modes

| Mode | Coût (× mise) | RTP exact (plafond compris) | Taux de gain | Écart-type | ≥ 100× | ≥ 1000× | 25 000× |
|---|---|---|---|---|---|---|---|
| `std` | 1 | 96,20 % | 32,7 % | 31,2 | 1/882 | 1/10 392 | 1/1,88 M |
| `plus` (Oracle+) | 1,1 | 96,20 % | 32,7 % | 33,2 × le coût | 1/801 | 1/9 271 | 1/1,29 M |
| `bonus_scarab` | 9,26 | 96,02 % | 99,8 % | 3,99 × le prix | 1/38 | 1/8 394 | 1/1,1·10⁸ |
| `bonus_weigh` | 10,31 | 96,01 % | 53,8 % | 6,71 × le prix | 1/62 | 1/282 | 1/1,1·10⁸ |
| `bonus_vault` | 12,37 | 96,03 % | 99,7 % | 3,47 × le prix | 1/114 | 1/5 015 | 1/1,1·10⁸ |
| `bonus_fury` | 27,30 | 96,00 % | 97,7 % | 4,33 × le prix | 1/16 | 1/671 | 1/8,8 M |

Depuis le 2026-10-16 (volatilité relevée, **Colère d'Anubis**, fences par palier de gain) : détail, diagnostic de l'écart-type 9,24 mesuré par Stake et
format des événements `wrath` / `wrathUp` dans `docs/VOLATILITE.md`. `exact.py` calcule la **loi complète** du gain (dixièmes de mise, plafond compris :
`distribution`, `summary`, `fence_targets`, `table_floor_sd`), plus seulement ses deux premiers moments.

RTP cible déclaré : **96,2 %** pour tous les modes (`BetMode.rtp`). Les RTP exacts ci-dessus sont ceux des lois NON optimisées (écart maximal entre modes
0,2 point, sous les 0,5 point de la source tierce) ; l'optimiseur les ramène à la cible en réglant les poids. Gain maximal : **25 000 ×**
(`wincap`), identique dans tous les modes.

## Échelle entière et pas de 0,1×

Les gains sont des entiers à l'échelle 100 (100 = 1,00 ×, `M.SCALE`), comme le SDK (`payoutMultiplier = round(gain × 100)`, et l'optimiseur divise par 100). Le vérificateur
officiel (`utils/rgs_verification.py`) exige en plus des `payoutMultiplier` **multiples de 10** (0,10 ×), non nuls ≥ 10. Plutôt que d'arrondir, les valeurs du jeu ont été
changées à la source (`js/math.js` et ce dossier) : **tous les gains possibles d'un tour sont des multiples exacts de 0,1 ×**. Changements : case 0,25 × → **0,3 ×**
(identifiant interne `m025` conservé), Scarabées Équilibré 0,65 / 0,79 → **0,6 / 0,9**, Prudent 22 → 23 (bords), Audacieux 0,25 / 0,4 / 3,5 → **0,3 / 0,3 / 3,7** (espérances des
trois profils égales à 0,1 % près), chance de l'Oracle 0,31 → **0,29** (Standard) et 0,72 → **0,698** (Oracle+), prix d'achat Scarabées 9,24 → **9,26** et Fureur 27,28 → **27,30**
(les prix sont des coûts, pas des gains). Résultat exact : Standard 96,21 %, Oracle+ 96,10 %, achats 96,01 à 96,03 %.
`M.SCALE` reste 100 (passer à 10 casserait l'accord avec l'optimiseur et le front). `--step` (défaut **1** : aucun arrondi) ; `--step 10` arrondit le total au multiple de 10 comme
garde-fou ; le vérificateur de `verify.py` contrôle toujours le multiple de 10. Constaté : les fichiers générés avec le pas 1 passent `verify_lookup_format`,
`verify_books_and_payout_mults` et `compare_payout_values` du SDK officiel.

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
- `tests/test_stats.py` : RTP dans [90 %, 96,7 %] et à moins de 0,5 point de 96,2 % ; écart entre modes ≤ 0,5 point (0,2 constaté) ; taux de gain ≥ 1/20 ; critère `wincap` dans
  chaque mode et dans la distribution cible ; un book à 2 500 000 par mode.
- `tests/test_books.py` : format (`index.json` strict, lookup de 3 entiers, payout égal au book), événements cohérents (somme des gains, Trésor, Fureur, Pesée, Scarabées, Sanctuaire).
- Les fichiers produits ont aussi été passés dans `verify_lookup_format`, `verify_books_and_payout_mults` et `compare_payout_values` du SDK officiel (100 books par mode : conformes avec `--step 10`, refusés avec `--step 1`).

## Produire la table de production (à faire par l'utilisateur)

1. `git clone https://github.com/StakeEngine/math-sdk`, Python ≥ 3.12 (`pip install -r requirements.txt`), Rust/Cargo.
2. Générer les books **dans l'arborescence du SDK** (le programme Rust lit `../games/<game_id>/library/…`) :
   `HOA_BIG=1 python3 stake-math/run.py --books 200000 --prepare-optimizer --out <math-sdk>/games/anubis_unchained/library`
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
- Un mode par profil (Prudent / Audacieux) pour conserver ce choix.
- Adaptation du front aux nouveaux events (autre chantier) ; essais contre un vrai RGS.
