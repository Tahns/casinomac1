# Bugs visuels, affichage, accessibilité, performance

Méthode : serveur statique + Playwright (Chromium), `?debug`, `G.showBigWin`, `G.testBonus`, mesures de géométrie DOM, captures vérifiées à l'œil (390x844, 360x640, 412x915, 768x1024, 844x390, 1024x768, 1280x720, 1920x1080, FR). Chasse interrompue deux fois (limite de session, nouvelle règle « pas de simulation > 1000 tours ») : la couverture est partielle, voir « Non vérifié ».

## Corrigés
| # | Sévérité | Défaut | Correction |
|---|---|---|---|
| 1 | Haute | Gain MEGA WIN / JUGEMENT DIVIN : les médaillons latéraux (à 30 % de la largeur) recouvrent le montant et le titre en 844x390, 1024x768, 1280x720 | médaillons poussés vers les bords, rétrécis selon la largeur du montant mesuré, absents si la place manque (`game.js`, drawWinOv) |
| 2 | Moyenne | « Touchez pour passer » pouvait descendre sur la barre d'état / le HUD | ordonnée bornée à la zone visible (`vb - 22`) |
| 3 | Moyenne | Crypte : la phrase d'aide du bloc (pastille d'état DOM) chevauche la légende des blocs | légende remontée de 12 px en portrait (`bonuses.js`, cryptScene) |
| 4 | Haute | Tablette portrait 761-900 px (768x1024, 820x1180, 800x600) : HUD plus large que l'écran (806 > 768), plaque GAIN coupée | HUD en deux rangées (disposition téléphone) jusqu'à 900 px, resserré au centre (`style.css`) |
| 5 | Moyenne | 320-360 px : « UNCHAINED » touche / passe sous les boutons du haut | titre réduit sous 380 px |
| 6 | Moyenne | Zones tactiles < 40 px : boutons du haut 31-36, − / + 26-30, Turbo/Auto/Acheter/Oracle+ 26-34 de haut, pastilles du mixeur et des réglages ~30, curseurs 24 | zones cliquables élargies à ≥ 40 px par pseudo-élément (dessin inchangé), `min-height:40px` sur les pastilles, curseurs 32 px, croix de fenêtre 40 px |

Captures avant/après : générées localement (scratchpad de session), non versionnées.

## Corrigés (2e passe)
| # | Défaut | Correction |
|---|---|---|
| 7 | Crypte en paysage téléphone (« Sanctuaire des Marées ») : la pastille d'état chevauchait la légende ; Chute des scarabées : elle recouvrait la case ×100 | Pastille limitée à la marge libre à gauche du plateau (`50vw - 52vh`), et sous le logo pour la Crypte (`pillTop`) |
| 8 | Pastille d'état DOM par-dessus l'overlay de gain | Masquée pendant `G.winOv` (classe `winov`) |
| 9 | Perf : `layout()` à chaque évènement `resize` | Anti-rebond de 90 ms (resize et rotation) |
| 10 | Perf : une dizaine de dégradés recréés par image dans `drawBackdrop` | Disques dégradés mis en cache et posés par `scale` + `globalAlpha`, remplissages bornés. Rendu identique (écart ≤ 4/255), 9,8 → 7,6 ms/appel en 1280x720 (rendu logiciel), 3,6 → 2,4 ms en 390x844 |
| 11 | Perf : filtre CSS de couleur sur `#stage` / `#ui` coûteux | Coupé en qualité « basse » et à la 1re dégradation automatique (`Grade.lite`) ; sans filtre ≈ +12 % d'images/s en rendu logiciel |
| 12 | aria-labels `#stage`, `#history`, `#oracle`, boutons Fermer / montant en dur | Traduits (bloc i18n `ui`, FR / EN) et posés à chaque changement de langue |

Fuite mémoire : 60 tours en ultra, compteurs (timers, tweens, DOM, canvas, objets) et tas stables après ramasse-miettes. Resize / rotation / langue pendant les bonus : aucune erreur. Captures regardées : 844x390 (Crypte, Scarabées, Pesée, Trésor), 390x844, 1280x720 (Fureur, Crypte).

## Constatés, non corrigés
- Les remplissages plein écran du fond (vignette, rayons) restent le plus gros coût en rendu logiciel ; une mise en cache supplémentaire changerait l'éclairage des bords (écart visuel), non faite.
- Texte du canvas d'une scène de bonus : reste dans la langue d'ouverture si la langue change en plein bonus (cosmétique).
- `prefers-reduced-motion`, navigation clavier des fenêtres (piégeage de Tab existant) et focus visible : code relu, pas de nouvelle capture dédiée ; mixeur sur petit écran et filtres EN/$ : `layout.js` et `e2e.js` verts.

## Validation
`tools/check.js`, `i18n-check.js`, `contrast.js` : ok. `tools/layout.js` : 10 tailles ok. `e2e.js`, `session-test.js`, `rgs-test.js`, `social-check.js`, `fuzz.js` verts (moins de 1000 tours au total).
