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

| Haute | Limite de perte et temps de session remis à zéro par un rechargement (contournement) | Atteindre la limite puis recharger | Session (début, tours, mises, gains, dernier rappel, plafond ERR_GLE) écrite dans sessionStorage ET localStorage, reprise au chargement (nouvel onglet : reprise si activité < 30 min) ; limite recalculée au chargement ; plafond de perte conservé aussi en mode RGS |
| Haute | Mode RGS : ERR_GLE du serveur sans effet durable | Plafond serveur atteint puis rechargement | ERR_GLE : plus de mise pendant 60 s (message), mémorisé dans la session |
| Moyenne | Deux onglets : la dernière sauvegarde écrasait l'autre | Jouer dans deux onglets | Événement `storage` : préférences = dernier écrivain ; solde et compteurs de session fusionnés par écart (aucune mise ni gain perdu). Mode RGS : un seul onglet de jeu actif, l'autre est bloqué derrière un avertissement avec « Jouer ici » |
| Basse | Alerte 30 min / limite (`setTimeout`) remplaçant une fenêtre ouverte | Rappel pendant « Infos » | File d'attente de fenêtres : la fenêtre ouverte n'est jamais remplacée, la suivante s'ouvre à sa fermeture (limite avant rappel) |
| Basse | Musique / hauteur changées pendant un thème de bonus : ambiance superposée | Mixeur pendant un bonus | `startAmbient` refuse de démarrer sous un thème actif ; le thème respecte « musique coupée » |
| Basse | Rappel de gain (`G.onBonusChoice`) périmé conservé après le tour | Bonus lancé hors flux | Remis à `null` en fin de tour |

## Vérifié sans défaut
Redimensionnement / rotation pendant chacun des 5 bonus (4 tailles, fin de bonus propre), changement de langue en plein bonus, 80 tours sans fuite (objets, canvas et tas stables après ramasse-miettes), mises extrêmes et Oracle+ à 0,20 (`e2e.js`, fuzzer).

## Fuzzer
`tools/fuzz.js` tourne (4 exécutions de 20 à 60 tours, graines 2, 12, 13, 14 : « tout est bon »). Corrigé côté outil : clics forcés (boutons animés jugés instables, attente de 30 s), solde imposé non sauvegardé, bonus de test lancé pendant un vrai tour, turbo réactivé par le joueur. « Turbo toujours actif après un bonus » n'était pas un bug du jeu (`play()` le coupe à l'arrivée sur un bonus) : l'invariant ignore désormais un clic du joueur. Délai global (`FUZZ_MAX_SECONDS`, 90 s) et plafond de 1000 tours.

## Non corrigés
- Textes d'accessibilité et avertissement « autre onglet » : traduits en FR et EN seulement (bloc `ui` de i18n.js), les 14 autres langues retombent sur l'anglais.
- Deux onglets en course dans la même milliseconde : une mise peut être perdue (aucun verrou entre onglets en démo).
