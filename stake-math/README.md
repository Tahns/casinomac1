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
| `tests/` | 54 tests `unittest` (parité JS, moments exacts, statistiques, format, événements) |
| `../tools/export-parity.js` | Produit `tests/parity_draws.json` (tirages JS + gains JS, ≤ 1000 tours au total) |

```bash
python3 -m unittest discover -s stake-math/tests          # 54 tests, ~1 s
python3 stake-math/exact.py                              # RTP exact de chaque mode (aucun tirage)
python3 stake-math/run.py                                # 1000 books par mode dans stake-math/library/ (ignoré par git)
python3 stake-math/run.py --books 200 --modes std,buy_fury
node tools/export-parity.js                              # régénère les tirages de parité (≤ 1000 tours au total)
```

`HOA_BIG=1` (ou `ANUBIS_BIG=1`, nom des outils Node) lève le plafond de 1000 : **réservé à l'utilisateur** pour une vraie production. Aucun test ne le lit.
Python 3.12 ou plus pour le SDK ; ce dossier tourne dès Python 3.9. `zstandard` (ou Python 3.14, `pyzstd`, la commande `zstd`) est utilisé pour
compresser les books ; sans aucun d'eux, `run.py` écrit des `.jsonl` bruts et l'annonce (le RGS veut du `.jsonl.zst`). numpy n'est pas nécessaire.

## Les 6 modes

| Mode | Coût (× mise) | RTP exact | Taux de gain | Écart-type (× mise) |
|---|---|---|---|---|
| `std` | 1 | 96,21 % | 42,6 % | 16,1 |
| `plus` (Oracle+) | 1,1 | 96,10 % | 42,6 % | 18,8 |
| `buy_scarab` | 9,26 | 96,02 % | 100 % | 4,03 × le prix |
| `buy_weigh` | 10,31 | 96,02 % | 54,0 % | 6,72 × le prix |
| `buy_vault` | 12,37 | 96,03 % | 100 % | 3,49 × le prix |
| `buy_fury` | 27,30 | 96,01 % | 100 % | 4,37 × le prix |

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

Un book : `{ "id", "payoutMultiplier", "events": [...], "criteria", "baseGameWins", "freeGameWins" }` (les trois premiers champs sont les seuls exigés par le RGS ;
les autres sont ceux du SDK). Chaque event a `seq` (compteur ; le SDK l'appelle `index`, mais ici `wheelStop.index` est la case de la roue, comme dans
`tools/stake-export.js`, que lit déjà `js/rgs.js`) et `type`. **Montants : entiers à l'échelle 100**, sauf mention. Ordre d'un tour :

| type | champs principaux | rôle |
|---|---|---|
| `roundStart` | `mode` (`std`/`plus`/`buy`), `modeName`, `cost`, `scale`, `wincap` | début |
| `oracle` | `spin`, `kind`, `boost`, `sealed: true`, `revealOn: "wheelStop"` | **Oracle scellé** : la bénédiction est tirée avant la roue mais NE DOIT PAS être montrée avant l'arrêt de la roue ; elle s'applique si `kind` = la case d'arrêt |
| `wheelStop` | `spin`, `index` (case 0-63), `kind`, `boost`, `respin` | la roue s'arrête ; `respin` = Ankh (relance gratuite, tour suivant) |
| `bonusStart` | `spin`, `bonus` (`scarab`/`weigh`/`vault`/`hand`/`crypt`), `name`, `secret`, `bought`, `upgraded`, `wheelKind` | `hand` = Fureur d'Anubis, `crypt` = Sanctuaire des Marées (bonus secret) |
| `profileChoice` | `binding: false`, `profile: "std"` | le book joue le profil Équilibré (voir ci-dessous) |
| Scarabées : `scarabDrop` ×3 | `ball`, `path` (8 × 0/1), `slot` (0-8), `win` | cascade de chevilles ; les 3 gains s'additionnent |
| Pesée : `weighReveal` | `mults [joueur, autre]`, `playerMult`, `playerWins`, `win`, `bookPick`, `plates {feather, heart}` | voir « Choix du joueur » |
| Trésor : `vaultStart`, `vaultPick` ×k, `vaultEnd` | `token` (entier = pièces, ou `"scepter"` ×2, `"key"` clé d'or +2 coffres, `"seal"` sceau), `chestsLeft`, `runningTotal` ; `ended` (`seal`/`cleared`), `finishBonus` (+5 × si chambre vidée), `win` | jamais de sceau sur les 2 premiers coffres ; 7 coffres au départ, 10 au plus |
| Fureur : `furyColor`, `furySpin` ×k, `furyEnd` | `segment` (0-23), `kind` (`up` DOUBLE de sa couleur, `wrong` DOUBLE d'une autre, `num`, `band`), `tier` (palier ×1/2/4/8/16), `final`, `doubleColour` (0 = la couleur choisie, 1 et 2), `number`, `band`, `bandMult` ; événements du bonus de la bande avec `nested: "<bonus>"` | gain = nombre × palier ; `wrong` = 3 × palier ; bande = gain du bonus × `bandMult` × palier ; plafonné à 25 000 × |
| Sanctuaire : `sanctuaryTablet` ×9, `sanctuaryEnd` | `tablet_type` (`dust`/`tab`/`tide`/`eclipse`), `value` (`tab` : échelle 100 ; `tide`, `eclipse` : facteur), `tideBefore`, `offering`, `tide` ; `win` | 9 tablettes, plancher ×1 |
| `bonusEnd` | `spin`, `bonus`, `win` | gain du bonus avant boost |
| `spinWin` | `spin`, `win` (= base × boost), `base`, `boost`, `respin` | gain du tour de roue |
| `finalWin` | `amount` (= `payoutMultiplier`), `exact`, `capped` | fin |

Comment le front lit un book : il parcourt `events` dans l'ordre, **sans aucun tirage** ; il montre l'Oracle scellé, laisse la roue s'arrêter sur `wheelStop.index`,
révèle l'Oracle, joue le bonus d'après ses événements, affiche `spinWin`, enchaîne sur le tour suivant tant que `respin` est vrai, puis affiche `finalWin.amount`
(÷ 100, × la mise) et le déclare au RGS. Les achats (`buy_*`) n'ont ni `oracle` ni `wheelStop`. `js/rgs.js` (`bookToRound`) lit déjà les noms et champs
communs ; les noms qui changent par rapport à `tools/stake-export.js` sont : `seq` (nouveau), `weighReveal.plates`/`bookPick` (nouveaux), `furySpin.doubleColour`
(nouveau). **À corriger côté front** : la branche `crypt` de `bookToRound` lit encore `cryptDrop` (`block_type`, `column`), un format de l'ancienne « Crypte » ;
le Sanctuaire des Marées s'écrit `sanctuaryTablet` (`tablet_type`, `value` ; valeur d'une tablette `tab` et `offering` à l'échelle 100). Corrigé : `RGS.bookToRound` lit désormais `sanctuaryTablet`, et `tools/stake-export.js` écrit les mêmes unités que ce dossier.

## Choix du joueur : pré-résolus dans les books

Un book est un résultat figé : **aucun choix du joueur ne peut changer son gain**. Chaque choix est donc réglé comme suit (tous les choix existants étaient déjà
neutres en espérance ; ils le restent ; ce qui disparaît, c'est la possibilité d'en tirer un autre gain) :

- **Fureur d'Anubis (couleur)** : les 3 couleurs ont exactement la même loi (2 DOUBLE chacune ; test `test_les_trois_couleurs_de_la_fureur_sont_symetriques`). Le moteur
  tire les trois scripts (comme le JS, pour garder la parité des tirages) mais **le book n'écrit que celui de la couleur 0 = « la couleur choisie »**. Le front fait pivoter
  les noms : un segment DOUBLE de couleur relative `d` s'affiche dans la couleur `(d + couleur choisie) mod 3`. Écrire les trois résultats dans le book serait faux : un seul
  `payoutMultiplier` est payé.
- **Pesée (plume ou cœur)** : le book décrit les deux plateaux tels que tirés (`plates`), et fige le plateau du joueur : `playerMult`, `playerWins`, `win`.
  Le plateau le plus lourd est tiré 50/50, indépendamment des valeurs : gagner ou perdre ne dépend donc pas du plateau touché. Si le joueur touche l'autre plateau
  que `bookPick`, le front **permute** les deux plateaux (valeurs et « plus lourd ») : même loi, même gain. Dans une bande de la Fureur, `bookPick` est tiré (comme en JS).
- **Trésor, Sanctuaire** : tout est tiré d'avance (`vaultPick` dans l'ordre, 9 tablettes) ; la tuile ou la tablette touchée est neutre, l'ordre choisi ne change aucune probabilité.
- **Profil Prudent / Équilibré / Audacieux** : les tables diffèrent (seules les espérances sont égales), donc ce n'est PAS un choix neutre. Le book joue l'Équilibré
  (`profileChoice.binding = false`). Garder le choix exigerait un mode Stake par profil (même coût, même RTP) : non fait.

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
- Un mode par profil (Prudent / Audacieux) pour conserver ce choix.
- Adaptation du front aux nouveaux events (autre chantier) ; essais contre un vrai RGS.
