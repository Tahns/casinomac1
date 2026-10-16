# Décisions du joueur : les Pactes (2026-10-16)

Retour Stake : « profondeur de gameplay 2/3 » et « concept / impact 2/3 », avec la demande explicite de « plusieurs modes dans les maths avec RTP conforme et **volatilité claire** ».

## Choix retenu : le Pacte, une décision prise AVANT le tour, un mode de mise par pacte

Avant chaque tour, le joueur scelle un pacte avec Anubis (bouton en haut de l'écran) :

| Pacte | Mode(s) Stake | Bonus | Colère d'Anubis | Écart-type exact (× coût) | ≥ 5 000× | 25 000× |
|---|---|---|---|---|---|---|
| Scribe (prudent) | `safe`, `plus_safe` | profil Prudent | 1 tour sur 246 (252), échelle ×2 → ×10 | 18,3 (21,8) | 1/574 637 | 1/20,6 M |
| Balance (référence) | `std`, `plus` | profil Équilibré | 1 tour sur 500, ×2 → ×100 | 31,2 (33,2) | 1/197 857 | 1/1,9 M |
| Chacal (audacieux) | `bold`, `plus_bold` | profil Audacieux | 1 tour sur 860 (829), ×3 → ×250 | 44,2 (45,4) | 1/133 750 | 1/0,82 M |

RTP **exact** 96,20 % pour les six modes de base (écart < 0,001 point, `tools/rtp-exact.js` ↔ `stake-math/exact.py`), même coût (×1 ou ×1,1 en Oracle+), même roue, même Oracle, plafond 25 000×. Les achats restent en Balance (4 modes inchangés). Total : 10 modes.

**Pourquoi c'est le plus défendable devant un évaluateur Stake**
- **Conforme au modèle Stake Engine** : un book = un résultat décidé avant l'animation. Le choix est fait *avant* la requête `/wallet/play` : il sélectionne le **mode de mise** (`RGS.modeName(famille, achat, pacte)`), jamais une issue. Aucune variante d'un book ne dépend du choix ; `roundStart.pact` et `wrath.ladder` décrivent ce qui a été joué (relu par `verify()` et `RGS.bookToRound`). C'est exactement la ligne 5 de `docs/STAKE_ENGINE_CONFORMITE.md` (« un mode Stake par profil, coût égal, RTP égal »), qui avait conduit à retirer les profils.
- **Une vraie décision, pas une illusion** : la loi des gains change réellement (écart-type ×2,4 entre Scribe et Chacal, gain max 25 fois plus fréquent au Chacal), à espérance identique. Le joueur choisit son risque en connaissance de cause (chiffres exacts affichés sur chaque carte et dans les règles).
- **Lisible** : trois noms thématiques, une jauge de trois maillons (1, 2, 3 ; le maillon ouvert du Chacal = chaîne brisée), aucun jargon de pari (« pacte », « volatilité », « 1 tour sur N ») ; mode social vérifié dans les 16 langues.
- **Ancré dans le concept « Unchained »** : le pacte règle *jusqu'où Anubis se libère* — le Scribe le garde enchaîné (Colère fréquente mais bridée à ×10, les chaînes se reforment à l'animation), le Chacal le déchaîne (Colère rare mais de ×3 à ×250, les chaînes éclatent). La Colère d'Anubis est conservée et devient le cœur du choix.
- **Réglage à un seul paramètre** : à pacte fixé, le RTP est linéaire en la chance q de Colère (RTP = (1−q)·A + q·B, lois exactes plafonnées) ; `tools/tune-pacts.js` résout q exactement. Aucun autre élément du jeu n'est retouché.

**Pistes écartées**
- *Pierres / cartes à issue pré-décidée présentées comme un choix* (piste b) : le choix serait décoratif (le book fixe l'issue quel que soit l'objet touché). Admissible si c'est annoncé (c'est déjà le cas pour les coffres du Trésor et les tablettes du Sanctuaire), mais cela n'ajoute aucune profondeur réelle et un évaluateur peut y voir un faux choix. Non retenu.
- *Oracle* (piste c) : l'Oracle+ garde sa confirmation (mode à coût plus élevé) ; il se combine désormais avec les pactes (`plus_safe`, `plus_bold`), et la fenêtre des pactes rappelle la règle commune (même RTP).

## Implémentation

- Maths : `js/math.js` (`PACTS`, `MODES`, `modeFor/pactOf/familyOf/ladderOf`), port `stake-math/game_config.py`, `game_calculations.py`, `game_events.py`, `force.py`, `exact.py` (lois exactes par profil et par échelle). Les trois profils de bonus restent tirés à chaque bonus (même suite de tirages qu'avant pour `std` / `plus`).
- Tests : `tools/check.js` §3c (RTP identique, volatilité ordonnée, même roue à tirages égaux, books relus), `stake-math/tests/test_stats.py` (`TestPactes`), `test_parity.py` (10 modes, Colère des 6 modes, bonus des pactes), `test_books.py` (`roundStart.pact`, valeurs des Scarabées du pacte, books Python relus par le JS) ; parité JS/Python régénérée (`node tools/export-parity.js`, 928 tirages ≤ 1000).
- Front : bouton « Pacte » (`#btnPact`), fenêtre à trois cartes (`openPact`, chiffres de `js/stats.js`), animation `js/pact.js` (chaînes qui se reforment / se tendent / éclatent, mouvement réduit respecté), plaque de la Colère à l'échelle du pacte (`js/wrath.js`), règles (`js/rules.js` : modes, tableau des pactes, valeurs des bonus par pacte), carrousel d'accueil, replay. Textes : bloc `pact` de `js/i18n.js` (16 langues).

## Régénérer la table de production (modes modifiés : 10 modes au lieu de 6)

```bash
node tools/tune-pacts.js            # vérifie les chances de Colère (à reporter dans js/math.js ET stake-math/game_config.py si les tables changent)
node tools/gen-stats.js             # js/stats.js (RTP, écart-type, fréquences affichés)
node tools/export-parity.js         # stake-math/tests/parity_draws.json
python3 -m unittest discover -s stake-math/tests
HOA_BIG=1 python3 stake-math/run.py --books 200000 --prepare-optimizer --out <math-sdk>/games/anubis_unchained/library
# puis, pour CHACUN des 10 modes (std, plus, safe, bold, plus_safe, plus_bold, bonus_scarab, bonus_weigh, bonus_vault, bonus_fury) :
cp <math-sdk>/games/anubis_unchained/library/optimization_files/setup_<mode>.toml <math-sdk>/optimization_program/src/setup.toml
(cd <math-sdk>/optimization_program && cargo run --release)
python3 -c "import sys; sys.path.insert(0,'stake-math'); import verify; print(verify.verify_library('<math-sdk>/games/anubis_unchained/library/publish_files'))"
```
`index.json` liste alors les 10 modes ; contrôler avec l'outil de Stake que chaque mode est à 96,2 % et que l'écart-type suit l'ordre Scribe < Balance < Chacal (plancher de table dû aux fences, cf. `docs/VOLATILITE.md`).
