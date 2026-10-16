# Volatilité — diagnostic, relèvement et Colère d'Anubis (2026-10-16)

Tous les chiffres viennent du **calcul exact** (`node tools/rtp-exact.js --loi --variance`, port Python `python3 stake-math/exact.py --loi`) : loi complète du gain d'un tour, plafond de 25 000× compris, aucune simulation.

## 1. Diagnostic (maths d'avant, mode Standard)

| | Calcul exact | Outil Stake (table de 200 000 books) |
|---|---|---|
| RTP | 96,17 % (plafond compris) | 96,20 % |
| Écart-type | **14,47×** | **9,24×** |
| Taux de zéro | 57,41 % | 57,41 % |

Part de E[X²] par source (calcul exact) : Pesée 27,0 % + Pesée avec Oracle 18,5 %, Fureur 25,7 % + Fureur avec Oracle 11,1 %, Trésor 10,4 %, Sanctuaire (secret) 3,0 %, Scarabées 3,8 %, **cases × 0,4 %** (Oracle sur les cases 0,1 %). Presque toute la variance vient de **gains de 300× à 5 000×** (paire 1000× de la Pesée, nombres 180× de la Fureur, Oracle ×25 / ×100 sur un bonus), à des fréquences de 1 sur 2 000 à 1 sur 50 000.

**Pourquoi Stake mesure 9,24.** L'optimiseur Rust (`optimization_program/src/main.rs`, lu dans le SDK) ne garde pas la fréquence naturelle des books : dans chaque fence, il donne un poids à chaque **valeur de gain distincte** par une somme de gaussiennes centrées près du gain moyen de la fence (`get_weights`), puis peut écraser par 0,0001 toute la zone au-dessus de la moitié du gain moyen. Les anciennes fences ne fixaient que 4 masses : gain max, 0, « bonus », « basegame ». La queue (300×-5 000×), noyée dans la fence « bonus », a été aplatie. Preuve chiffrée : 9,24² + 0,96² = 86,3 de E[X²] ; la fence du gain max (1 sur 12,5 millions, valeur imposée par l'ancien `game_optimization.py`) en apporte à elle seule 25 000² / 12,5 M = **50** ; il reste 36 pour tout le reste, contre 191 dans la loi exacte hors gain max : **81 % de cette variance a disparu**. Une table qui ne garde que ces 4 masses peut descendre jusqu'à un écart-type de **4,5** (minimum de Jensen, `tableFloorSd`).

## 2. Relèvement (mêmes bonus, mêmes profils, mêmes prix d'achat)

- **Roue** : 40 « 0 » (34 avant), 5×0,3 · 6×0,5 · 3×1 · 2×2 · 1×3 (petites cases : RTP 24 % au lieu de 37 %), 4 Ankh, 1 case par bonus.
- **Oracle plus rare et plus fort** : 7,65 % des tours en Standard (29 %), 27 % en Oracle+ (69,8 %) ; boosts nombres ×2/3/5/10/25 = 50/25/15/8/2, bonus ×2/3/5/10/25/100 = 40/25/18/12/4/1.
- **Colère d'Anubis** (nouvelle mécanique, section 3) : 1 tour sur 500, multiplicateur ×2 → ×100 sur un bonus garanti.
- **Optimiseur** : fences par palier de gain (`game_optimization.py`) : gain max, 0, **epic ≥ 1000×**, **big 100-999,9×**, bonus, cases, chacune à sa probabilité et son RTP **exacts** (`exact.fence_targets`), bornes moyenne/médiane par fence = valeur exacte × [0,8 ; 1,25]. Quoi que fasse l'optimiseur dans une fence, l'écart-type de la table ne peut pas descendre sous **24,9** (Standard).

| Mode | RTP | Écart-type (× coût) | Gain non nul | ≥ 100× | ≥ 1000× | ≥ 5000× | 25 000× |
|---|---|---|---|---|---|---|---|
| Standard avant | 96,17 % | 14,5 | 42,6 % | 1/1 114 | 1/15 194 | 1/878 442 | 1/33 M |
| **Standard** | **96,20 %** | **31,2** | **32,7 %** | **1/882** | **1/10 392** | **1/197 857** | **1/1,88 M** |
| Oracle+ avant | 96,04 % | 16,0 | 42,6 % | 1/1 024 | 1/14 093 | | 1/14 M |
| **Oracle+** (×1,1) | **96,20 %** | **33,2** | **32,7 %** | **1/801** | **1/9 271** | **1/144 006** | **1/1,29 M** |
| Achats (inchangés) | 96,00-96,03 % | 4,0 / 6,7 / 3,5 / 4,3 × le prix | 99,8 / 53,8 / 99,7 / 97,7 % | | | | |

Variance Standard aujourd'hui : Colère · Pesée 25,6 %, Colère · Fureur 21,3 %, Colère · Trésor 13,5 %, Colère · Scarabées 8,1 %, Pesée 6,0 %, Fureur 5,7 %, Oracle sur bonus 8,2 %, Colère + Oracle 6,8 %, Sanctuaire 3,0 %, cases 0,0 %.

## 3. Colère d'Anubis (feature aléatoire du jeu de base)

Au début d'un tour Standard ou Oracle+, avec la chance 0,2 % (1 sur 500, un tirage avant la roue), Anubis brise ses chaînes :
1. un multiplicateur s'allume à **×2** ;
2. la poussière et les nombres restent enchaînés : la roue ne s'arrête que sur les **7 cases libérées** (4 Ankh, Scarabées, Pesée, Trésor) — **bonus garanti** ;
3. chaque **Ankh** relance la roue et brise une chaîne de plus : **×2 → ×3 → ×5 → ×10 → ×25 → ×50 → ×100** (6 relances au plus, comme hors Colère) ;
4. le gain du bonus (Fureur et Sanctuaire possibles, Oracle compris) est multiplié par le cran atteint. Jamais à l'achat.

Loi exacte du multiplicateur (a = 4/7) : ×2 42,86 % · ×3 24,49 % · ×5 13,99 % · ×10 8,00 % · ×25 4,57 % · ×50 2,61 % · ×100 3,48 % ; moyenne ×9,02. Part du RTP : 17,9 points. Plafond 25 000× atteignable (ex. ×100 sur une Pesée 1000×, testé).

**Tests exacts** (`stake-math/tests/test_exact.py`, `TestColere` / `TestVolatilite`) : loi du multiplicateur énumérée par le moteur, espérance recalculée par une autre formule (1e-12), chemin réel jusqu'au plafond, loi à rebours du Sanctuaire contre la propagation directe, cohérence des fences ; parité JS ↔ Python de 60 tours de Colère (`test_parity`), relecture des books Python par `verify()` et `RGS.bookToRound` (`test_books`) ; `tools/check.js` §3b et §9.

### Événements (format v2, ajout compatible) — à rejouer par le front

```
roundStart …
wrath     { level: 0, mult: 2, ladder: [2,3,5,10,25,50,100] }   ← juste après roundStart, avant le 1er oracle/wheelStop
oracle?   { spin, kind, boost, sealed }
wheelStop { spin, index, kind, boost, wrath: 2 }   kind ∈ {ankh, scarab, weigh, vault} ; boost = boost Oracle (si visé) × wrath
oracleReveal? …
wrathUp   { spin, level: 1, mult: 3 }               après l'arrêt sur un Ankh (absent au cran ×100)
spinWin   { spin, win: 0, respin: true }
… (tour suivant, wheelStop.wrath = 3) … bonusStart … bonus … spinWin { win = gain du bonus × boost }
finalWin
```
`js/rgs.js` (`bookToRound`) lit déjà ces événements : `round.wrath { level, mult }`, `spin.wrath`, `spin.wrathUp`, `spin.oracleBoost` ; le gain reste `base × boost`, donc la démo et les scènes de bonus (`G.runBonus`, « boost appliqué ×N ») créditent juste sans changement.

**Front (fait)** : `js/wrath.js` (`G.wrath`) rejoue les événements — `begin(round.wrath)` : chaînes d'or tendues, cadenas fissuré, tout se brise ; poussière et nombres grisés et enchaînés sur la roue (`W.draw`, `G.wheel.wrath.shade`), cases libérées cerclées d'or ; plaque du multiplicateur (échelle ×2…×100) · `up(sp.wrathUp)` après un Ankh : chaîne tendue sur la plaque, tambour, chiffre qui vacille entre l'ancienne et la nouvelle valeur (jamais une autre), silence, la chaîne casse et le nouveau multiplicateur claque (plus fort aux crans hauts) · `end()` en fin de tour · `boostLines(sp)` : « Colère ×N » séparée du boost de l'Oracle dans les bonus. Appelé par `js/main.js` et `js/replay.js` (mêmes scènes). Turbo / ultra : durées suivant `G.speed` ; `FX.reduced` : fondus seulement, sans chaînes ni secousse. Règles en 16 langues : clés `wrathH / wrathP / wrathL / wrathT / wrathS` du bloc `rules` (chiffres tirés de `math.js`, loi exacte du multiplicateur calculée dans `js/rules.js`). Tests : `tools/replay-test.js` (book de Colère rejoué).

## 4. Re-produire la table de 200 000 books (à lancer par l'utilisateur)

```bash
git clone https://github.com/StakeEngine/math-sdk   # Python ≥ 3.12, Rust/Cargo
HOA_BIG=1 python3 stake-math/run.py --books 200000 --prepare-optimizer --out <math-sdk>/games/anubis_unchained/library
# pour chaque mode (std, plus, bonus_scarab, bonus_weigh, bonus_vault, bonus_fury) :
cp <math-sdk>/games/anubis_unchained/library/optimization_files/setup_<mode>.toml <math-sdk>/optimization_program/src/setup.toml
(cd <math-sdk>/optimization_program && cargo run --release)
python3 -c "import sys; sys.path.insert(0,'stake-math'); import verify; print(verify.verify_library('<math-sdk>/games/anubis_unchained/library/publish_files'))"
```
Avec `HOA_BIG=1`, les books des paliers rares (epic, big, 0 des achats) sont tirés **par rejet selon la loi du jeu** (~10 000 tours par book « epic » en Standard : ≈ 2 × 10⁷ tours, quelques minutes) ; sans, un chemin réel imposé sert d'exemple (démonstration ≤ 1000 books). À contrôler sur la table optimisée avec l'outil de Stake : RTP 96,2 % ; écart-type attendu entre **25 et 31** en Standard (plancher garanti par les fences 24,9 ; loi exacte 31,2) ; zéro ≈ 67,3 % ; gain max ≈ 1 sur 1,9 million.
