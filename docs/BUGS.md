# Bugs de logique et de flux

Méthode : relecture de main.js, game.js, audio.js, bonuses.js, math.js ; correctifs vérifiés par `check.js`, `i18n-check.js`, `e2e.js` (verts). Le fuzzer `tools/fuzz.js` est écrit (plafonné à 1000 tours) mais n'a pas pu être validé jusqu'au bout (session interrompue, lancement trop lent) : à passer à la main.

## Corrigés

| Sévérité | Bug | Reproduction | Correctif |
|---|---|---|---|
| Haute | Une exception dans une scène de bonus laissait `S.busy` à vrai, le fondu noir à 1 et la scène active : jeu bloqué, gain décidé non crédité | Toute erreur levée pendant `runBonus` | `play()` attrape l'erreur, remet scène/apparition/overlay/fondu à zéro et crédite le gain décidé ; `G.speed` restauré dans le `finally` de `runBonus` |
| Haute | Une exception dans un dessin interrompait la boucle `requestAnimationFrame` : écran figé pour toujours | Erreur dans `draw` d'une scène | `frame()` replanifie le rAF en premier |
| Moyenne | Auto-play « ∞ » (Réglages) : `indexOf(Infinity) = -1`, l'option désactivait l'auto | Réglages, Auto, ∞ | `Infinity` ajouté à `AUTO_STEPS`, affichage « ∞ » |
| Moyenne | Compteur du solde/gain : plusieurs animations simultanées, l'ancienne pouvait écraser l'affichage avec une valeur périmée (ex. réinitialiser le solde juste après un gain) | Gain puis « réinitialiser » en < 0,6 s | Jeton par compteur : la plus récente annule les autres |
| Basse | Ambiance sonore : chaque arrêt/relance (fin de bonus, hauteur) ajoutait une chaîne de cloches de plus, jamais arrêtée | Enchaîner des bonus | La chaîne est liée à son instance d'ambiance |
| Basse | Thème de bonus : le `setInterval` continuait de jouer dans un onglet caché | Changer d'onglet pendant un bonus | Le pas est ignoré si `document.hidden` |
| Basse | Bonus boosté : le gain affiché dépassait `MAX_WIN` alors que le crédit était plafonné | Boost élevé sur un gros bonus | Affichage plafonné à `MAX_WIN` (maths inchangées) |

## Non corrigés

- Limite de perte et temps de session non persistés : un rechargement remet la session à zéro (contournement possible). Demande un choix produit (sessionStorage).
- Deux onglets ouverts : la dernière sauvegarde écrase l'autre (pas d'écoute de l'événement `storage`).
- Audio : changer musique/hauteur pendant un thème de bonus peut superposer l'ambiance (cosmétique).
- Alerte « 30 min » ou limite atteinte : `setTimeout` qui peut remplacer une fenêtre déjà ouverte.
- Fuzzer non exécuté en entier ; résultats à confirmer.
