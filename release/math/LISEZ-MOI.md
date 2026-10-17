# Dossier maths — Anubis Unchained

Table de production optimisée (optimiseur Rust de Stake), générée avec 200 000 books par mode, 10 modes.

## Contenu
- `publish_files/` : `index.json`, `books_<mode>.jsonl.zst` (10), `lookUpTable_<mode>_0.csv` (10). C'est ce qu'on dépose dans la partie Math de Stake Engine.
- `configs/` : `math_config.json` et `config_fe_anubis_unchained.json` (configuration du jeu, pour référence / outils du SDK).

## Résultats mesurés sur les tables optimisées (calcul direct sur les poids, aucune simulation)
| Mode | RTP | Gain (hit) | Écart-type / coût | 25 000× |
|---|---|---|---|---|
| std (Balance) | 96,20 % | 32,7 % | 33,0 | 1 sur 1,88 M |
| plus (Balance, Oracle+) | 96,20 % | 32,7 % | 30,5 | 1 sur 1,29 M |
| safe (Scribe) | 96,20 % | 32,8 % | 19,5 | 1 sur 20,6 M |
| plus_safe | 96,20 % | 32,8 % | 24,7 | 1 sur 7,6 M |
| bold (Chacal) | 96,20 % | 32,6 % | 46,9 | 1 sur 0,82 M |
| plus_bold | 96,20 % | 32,6 % | 53,0 | 1 sur 0,63 M |
| bonus_scarab | 96,20 % | 99,8 % | 4,1 | — |
| bonus_weigh | 96,20 % | 53,8 % | 6,9 | — |
| bonus_vault | 96,20 % | 99,7 % | 3,4 | — |
| bonus_fury | 96,20 % | 97,7 % | 3,9 | — |

`verify_library` (stake-math/verify.py) : aucune erreur.

## À faire de ton côté
1. Contrôler dans l'outil de Stake que chaque mode affiche bien RTP 96,2 %, et que la volatilité n'est plus « faible » (l'écart-type du mode Balance était 9,24 sur l'ancienne table).
2. Déposer `publish_files/` dans la partie Math.
3. Les coûts des modes d'achat de bonus et des modes `plus*` sont ceux du jeu (x9,26 / x10,31 / x12,37 / x27,3 et x1,1) : vérifie qu'ils correspondent à la configuration de ton jeu sur la plateforme.

Régénérer : `tools/prod-table.sh <math-sdk> 200000` (voir docs/PRET_A_PUBLIER.md).
