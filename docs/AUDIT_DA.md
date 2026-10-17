# Audit direction artistique (2026-10-16) et refonte « Égypte antique sombre »

Contexte : refus Stake 3,3 / 9, direction artistique citée par 3/3 évaluateurs (« IA générique »). Palette cible : noir obsidienne, or patiné (pas de jaune), lapis-lazuli, turquoise ; matières : pierre gravée, papyrus, métal.

## Ce qui faisait « IA générique » (avant)
| Zone | Défaut |
|---|---|
| Images (`img/`) | 27 images de styles différents : rendus 3D brillants « plastique », néons (amulette cyan électrique, sceptre bleu foudre, crâne rouge sang, pyramide violette), soleil jaune du Big Win, mur violet du plateau, cheville = bille d'or lisse ; bords du bouton rond en escalier ; aucune texture commune |
| `css/style.css` | ~17 `box-shadow` et ~8 `text-shadow` en halo flou doré, `drop-shadow` lumineux sur le bouton, les pastilles et le titre, dégradés radiaux plastiques (boutons, pastille, ibtn), halo « buyGlow » rouge/orange, fond d'accueil violacé |
| `js/art.js` | or jaune saturé (`#e6b94a`, `#fff1b8`), cornaline / améthyste / émeraude vives, `goldGrad` lisse |
| `js/game.js` | roue : cases bleu électrique, vert menthe, violet, rouge vif, reflet blanc plastique, anneaux en dégradé conique jaune ; lampes = halos radiaux flous ; moyeu : aura lumineuse, dôme de verre ; pointeur : ombre floue, rubis rouge vif ; fond : voile violet |
| Polices / emojis | aucun emoji ni police système trouvé (Cinzel + Philosopher embarquées) ; OK |
| `js/bonuses.js` | mêmes glows et dégradés vectoriels qui jurent avec les images, **non traités ici** (autre agent) ; ils héritent seulement de la nouvelle palette `Art.C` |

## Ce qui a été fait
1. **Retouche** : `tools/retouche-assets.py` (Pillow seul). Originaux dans `img-src/`, sortie dans `img/`. Étalonnage commun : teintes ramenées à la palette (violet, vert vif, bleu électrique, rouge sang, jaune citron décalés et désaturés), saturation plafonnée, courbe en S douce, noirs froids / hautes lumières écrêtées sous le blanc, filets d'arête clairs (haut-gauche) et sombres (bas-droite), netteté, grain de pierre à graine fixe (sortie déterministe), vignettage des décors, noir pur des logos (seuil de détourage `cutout` conservé), bord net du bouton rond. `python3 tools/retouche-assets.py [--sheet planche.png]`, `--ingest dossier` range de nouvelles générations brutes.
2. **Régénération** (Higgsfield `gpt_image_2`, qualité high, 12 images, prompt de style commun : gravure d'or patiné sur obsidienne, torche latérale, accents lapis / turquoise, ni néon ni glow, fond noir pur) : scarabée, plume, pyramide-trésor, main d'Anubis, crâne, pièces, sceptre, amulette, cheville, mur du plateau, temple de la roue, explosion Big Win. Médaillon, logo, cadres, boutons, décors restants : retouchés seulement.
3. **Code** : palette `Art.C` patinée, `goldGrad` à bandes dures ; roue en pierres dures (lapis, turquoise, malachite, cornaline, papyrus, obsidienne) avec grain, médaillon d'obsidienne sous les icônes de bonus, jante dorée à bandes, rivets, graduations gravées ; lampes = goujons dorés ; moyeu sans aura ; ombres dures courtes partout (CSS et canvas) ; boutons et plaques en métal à arête claire / sombre ; voile violet du fond remplacé par un lapis d'encre. Contraste : `tools/contrast.js` mis en phase avec la nouvelle palette (tous les couples passent).

## Reste à faire
`js/bonuses.js` (halos, dégradés, textes lumineux), `drawBackdrop` (rayons, lueur d'or, braises : animation, non touché), logo et médaillon d'Anubis à régénérer (les yeux de `HEADS.medal` dépendent du cadrage), cadre de roue en image, fonds `abyss` / `judgment` / `vault` / `splash` à régénérer au même style que `key` et `scarabwall`.

## Passe finale (fureur, crypte, colere, pactes, HUD, fenetres)
Fenetres en pierre sertie d or (CSS, plus de cadre image etire), cartes d achat en pierre, plaque / pill / spinbtn detoures en RGBA (le noir de fond ne se voit plus ; a refaire apres tools/retouche-assets.py), ombres dures partout (G.txt, goButton, plaques), roue de la Fureur en pierres a grain (Art.grain), crypte en basalte, chaines et cadenas a bandes dures, palette reportee dans game/wrath/pact/chains/fx/main/bonuses (hand, crypt, intro).
