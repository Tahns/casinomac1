# Anubis Unchained : état avant publication (2026-10-17)

Ce que le jeu contient et ce qu'il reste à faire **par toi**. Ce document ne promet aucune approbation : Stake décide.

## Ce qui est prêt

| Élément | Où | État |
|---|---|---|
| Front à déposer (Files > Front End) | `release/front/` et `release/anubis-unchained-front-stake.zip` (≈ 3,5 Mo) | Build « stake » : sans session Stake, le jeu affiche « Lancez le jeu depuis Stake », aucun hôte externe. Régénérable : `python3 -I tools/build-stake.py` |
| Démo jouable (test) | https://claude.ai/artifact/9tueR3gP8QpKf1RLCZdkgn | Fichier unique, argent fictif |
| Maths (format math-sdk) | `stake-math/` | 10 modes, parité JS/Python, 74 tests |
| Pactes (Scribe / Balance / Chacal) | `docs/GAMEPLAY.md` | RTP 96,20 % pour chaque mode, volatilité distincte |
| Volatilité | `docs/VOLATILITE.md` | Écart-type 33,0 en Balance sur la table optimisée (Stake mesurait 9,24 avant) |
| Checklist des 50 cases collées | `docs/CHECKLIST_51.md` | 39 vérifiées, 3 non vérifiables ici, 8 à faire par toi |
| Direction artistique | `docs/AUDIT_DA.md`, `tools/retouche-assets.py` | Retouche unifiée, bonus refaits |
| Visuels de marque | `brand/` (key art, miniatures 5 formats, logos, bannières, captures) | Générés avec Canva et Higgsfield |
| Table de production (maths) | `release/math/` | Optimisée, 10 modes à 96,20 %, voir `release/math/LISEZ-MOI.md` |

Contrôles passés sur la dernière version : `check`, `i18n-check`, `contrast`, `social-check`, `conformite`, `e2e`, `layout`, `gestures`, `rgs-test`, `replay-test`, `stake-build-test`, tests Python. `fuzz` signale une minuterie résiduelle (musique d'ambiance), présente avant ce travail.

## Ce qui bloque la soumission (à faire par toi, dans l'ordre)

1. **Table optimisée : produite** (200 000 books par mode, 10 modes, optimiseur Rust de Stake) et déposée dans `release/math/`. RTP exact 96,20 % pour chacun des 10 modes, écart-type du mode Balance 33,0 (Scribe 19,5, Chacal 46,9), `verify_library` sans erreur. À contrôler dans l'outil de Stake avant dépôt. Pour la régénérer : `tools/prod-table.sh <math-sdk> 200000` (les bornes moyenne/médiane `M2M_BAND = (0.5, 3.0)` de `stake-math/game_optimization.py` sont ce qui a fait converger l'optimiseur).
2. **Lire le tableau de bord Stake** : dimensions de la miniature, image abstraite ou non, libellé exact de la 51e case et de « chargeur de moteur à pieux ».
3. **Légal** : droits des images générées (Higgsfield, Canva), ressemblance avec « Hand of Anubis » (Play'n GO) et Crazy Time, légalité de l'achat de bonus selon les territoires, titre unique (cases 5 et 7).
4. **Écoute et appareils réels** : le son est procédural et n'a jamais été écouté ; le 60 fps n'est mesuré sur aucun vrai téléphone.
5. **Relecture des traductions** (14 langues sans natif).
6. **Étapes de la plateforme** : niveaux de mise, Provably Fair / Replay, approbations Front et Math, canal d'approbation (cases 33, 45 à 50).
7. **Fournir des sons dont tu détiens les droits** si tu veux dépasser le son procédural.

## Réserves honnêtes

- Les jugements « niveau studio » sont les miens, regardés sur des captures logicielles (sans carte graphique).
- Les 51 points viennent d'un collage qui n'en contenait que 50.
- Le replay et le RGS n'ont été essayés que contre un faux serveur.
