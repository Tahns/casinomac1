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

## Constatés, non corrigés
- Crypte en paysage téléphone : la pastille d'état reste à gauche et peut toucher la légende (pas de marge verticale disponible à 390 px de haut).
- Pastille d'état DOM visible par-dessus l'overlay de gain (« TOURNEZ LA ROUE ») : cosmétique, à masquer pendant `G.winOv`.
- Performance : `resize` rappelle `layout()` (fond, roue, bruit) à chaque évènement sans anti-rebond ; filtres CSS de couleur sur `#stage` et `#ui` coûteux en GPU ; gradients radiaux recréés à chaque frame dans `drawBackdrop`. Non mesurés ni optimisés faute de temps (mesures FPS et fuite après 200 tours non faites).
- Détecteur de fuite d'état canvas (save/restore, shadowBlur, composite) écrit (`leak.js`, scratchpad) mais non exploité.

## Non vérifié
EN/$, 4 filtres, `prefers-reduced-motion`, navigation clavier des fenêtres, contrastes au-delà de `tools/contrast.js` (passe), focus visible, aria-labels (`#history`, `#oracle`, `#stage` en dur FR), mixeur sur petits écrans.

## Validation
`tools/check.js`, `i18n-check.js`, `contrast.js` : ok. `tools/layout.js` : 10 tailles ok. `e2e.js` non relancé (simulations).
