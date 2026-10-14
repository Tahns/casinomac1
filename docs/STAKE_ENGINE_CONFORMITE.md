# Anubis Unchained — conformité Stake Engine et propriété intellectuelle

Date de la recherche : 2026-10-13. Je ne suis pas avocat et ce document n'est **pas un avis juridique**. Il ne peut pas garantir l'absence de contrefaçon.

## Résumé (10 lignes)

1. **Limite de la recherche** : seul `github.com` était joignable depuis l'environnement. Les sites `stake-engine.com`, `engine.stake.com`, les conditions générales, Google Patents, Espacenet et le texte intégral des conditions Higgsfield ont **échoué (résolution DNS)**. Ce que je sais de ces sites vient de résumés de recherche web, donc de **seconde main**.
2. **Vérifié à la source** (dépôt officiel `StakeEngine/math-sdk`) : format books/lookup/`index.json` compressé en zstd, unités du RGS (1 000 000 = 1 unité), langues et devises acceptées, sortie front statique, licence MIT du SDK.
3. **Non vérifié officiellement** : plage d'RTP (90–98 % avancée par un dépôt tiers), écart maximal entre modes (0,5 %), fréquence du gain max, taux de gain minimal, conditions générales, partage des revenus détaillé, poids maximal des assets, règles « achat de bonus » par juridiction.
4. **Bloquant n°1** : les maths ne sont qu'en JavaScript, avec un RNG navigateur et un solde local. Stake exige books + lookup table générés côté serveur.
5. **Bloquant n°2** : les RTP des modes (Standard 96,03 %, Oracle+ 95,57 %, achats 96,3–96,5 %) s'écartent de **0,9 point** entre extrêmes, au-dessus du plafond de 0,5 point cité par la source tierce.
6. **Bloquant n°3** : les choix du joueur dans les bonus (profil Prudent/Équilibré/Audacieux, plume ou cœur, couleur de la Fureur, tuile du coffre) changent le calcul côté client. Un book est un résultat figé.
7. **Bloquant n°4** : le jeu gère lui-même solde, devise (€/$), niveaux de mise, limite de perte et sauvegarde locale. Avec le RGS, ces éléments viennent de l'authentification et sont retirés du jeu.
8. **Bloquant n°5** : le gain max de 5 000× est atteint à 1 contre plusieurs milliers sur les achats. Il faut vérifier ce que Stake exige sur sa fréquence et sa lisibilité dans la table.
9. **Risques PI principaux** : (a) mécaniques proches d'Evolution (roue Crazy Time, Coin Flip, marques déposées), (b) bonus de colonnes de multiplicateurs proches de « Hand of Anubis » (Hacksaw Gaming, et non Play'n GO), (c) droits sur les images IA (protection faible, conditions Higgsfield à lire en entier).
10. **Démarche** : avant publication, faire faire une recherche d'antériorité et de liberté d'exploitation par un conseil en propriété industrielle, et lire les conditions Stake dans le tableau de bord développeur.

## 1. Ce qui a été lu, et ce qui n'a pas pu l'être

| Source | Statut |
|---|---|
| Dépôt officiel `StakeEngine/math-sdk` (README, `docs/rgs_docs/RGS.md`, `docs/rgs_docs/data_format.md`, `docs/math_docs/...`, LICENSE) | **Lu** |
| Dépôt officiel `StakeEngine/web-sdk` (README) | **Lu** |
| Documentation hébergée (`stake-engine.com/docs`, `stakeengine.github.io/math-sdk`) | **Inaccessible**, connue par recherche web seulement |
| Conditions générales développeur, page d'onboarding Stake | **Inaccessibles** ; résumés de presse et du blog Stake via recherche |
| Dépôt tiers `ReSkin-Games/stake-engine-skills` (SKILL.md) | **Lu, mais non officiel** (annonce des règles « distillées » qui peuvent être en retard) |
| Google Patents, USPTO, Espacenet | **Inaccessibles en direct** ; brevets connus par extraits de recherche, **revendications non lues** |
| Conditions d'utilisation Higgsfield | **Inaccessibles** ; centre d'aide résumé par la recherche |

## 2. Checklist de conformité Stake Engine

Légende : **OK** conforme d'après le code, **À FAIRE** travail nécessaire, **BLOQUANT** empêche la soumission en l'état, **NV** non vérifié.

| # | Exigence | État d'Anubis Unchained (d'après le code) | Action | Source |
|---|---|---|---|---|
| 1 | Front en **site statique** (build copié dans *Files*, puis *Publish Game > Front End*) | **OK** : HTML/JS/CSS statiques, ≈ 250 Ko, aucune dépendance (README du projet) | Ajouter un `index.html` qui lit les paramètres de lancement ; tester le dossier de build | [web-sdk README](https://github.com/StakeEngine/web-sdk) |
| 2 | Lancement par URL avec `sessionID`, `lang`, `device`, `rgs_url` ; l'URL du RGS ne doit pas être figée dans le code | **À FAIRE** : aucun appel RGS (`M.playRound(rng)` local dans `js/main.js`) | Écrire un client RGS : authenticate, play, end-round | [RGS.md](https://github.com/StakeEngine/math-sdk/blob/main/docs/rgs_docs/RGS.md) |
| 3 | Endpoints : `/wallet/authenticate`, `/wallet/balance`, play, `/wallet/end-round`, `/bet/event` ; round actif à reprendre après authenticate | **BLOQUANT** : pas de reprise de round, la sauvegarde est dans `localStorage` (clé `SAVE_KEY`) | Supprimer solde et round local ; reprendre un round actif depuis la réponse d'authenticate | [RGS.md](https://github.com/StakeEngine/math-sdk/blob/main/docs/rgs_docs/RGS.md) |
| 4 | **Un tour = un book** figé : `{id, events[], payoutMultiplier}` (entier), joué dans l'ordre | **BLOQUANT** partiel : le script d'un tour existe déjà (`AnubisMath.playRound`), mais les choix en cours de bonus changent le résultat | Pré-résoudre chaque choix (voir lignes 5 à 7), puis sérialiser en événements | [data_format.md](https://github.com/StakeEngine/math-sdk/blob/main/docs/rgs_docs/data_format.md), [events_info.md](https://github.com/StakeEngine/math-sdk/blob/main/docs/math_docs/gamestate_section/events_info.md) |
| 5 | Choix du joueur : profil de bonus (Prudent / Équilibré / Audacieux) | **BLOQUANT** : trois tables de même espérance, choisies côté client avant le bonus | Soit un mode Stake par profil (coût égal, RTP égal), soit retirer le choix | [betmode_overview](https://github.com/StakeEngine/math-sdk/blob/main/docs/math_docs/gamestate_section/configuration_section/betmode_overview.md) |
| 6 | Choix du joueur : plume ou cœur (Pesée), couleur (Fureur), tuile du coffre | **À FAIRE** : `weighGain(data, pick)` dépend du choix ; la Pesée est 50/50 donc le choix est neutre, mais le book doit contenir un résultat unique | Tirer le choix « neutre » dans le book et l'afficher comme décoratif ; vérifier que la Chambre du Trésor reste neutre (ordre des tuiles fixé à l'avance) | idem |
| 7 | Les événements doivent contenir tout ce que l'écran affiche | **OK** de principe : « les scènes ne consomment que des données » (ANALYSE §3) ; **À FAIRE** pour la roue (angle d'arrêt) et le Plinko (chemins) | Mettre ces données dans les événements, sans aléa côté client | [events_info.md](https://github.com/StakeEngine/math-sdk/blob/main/docs/math_docs/gamestate_section/events_info.md) |
| 8 | Fichiers : `index.json` (`modes[]` avec `name`, `cost`, `events`, `weights`), CSV de lookup à 3 entiers non signés (n°, poids, multiplicateur), books en `.jsonl.zst` | **À FAIRE** : rien de généré | Porter `js/math.js` dans le math-sdk Python (≥ 3.12), générer et optimiser (Rust/Cargo requis pour l'optimiseur) | [data_format.md](https://github.com/StakeEngine/math-sdk/blob/main/docs/rgs_docs/data_format.md), [README math-sdk](https://github.com/StakeEngine/math-sdk) |
| 9 | Le multiplicateur du CSV doit être identique à celui du book (contrôlé par hachage) ; entier mis à l'échelle (exemple de la doc : 1150 = 11,5×) | **À FAIRE** : le jeu a des multiplicateurs fractionnaires (0,25× ; 0,5×) et un total à 1 décimale (ex. 1560,6×) | Choisir une échelle (au moins 2 décimales) et arrondir de façon identique dans le book et la table | [data_format.md](https://github.com/StakeEngine/math-sdk/blob/main/docs/rgs_docs/data_format.md) |
| 10 | **Modes de mise** : débit = mise × coût du mode ; un mode d'achat peut être signalé `is_buybonus` (le front adapte ses assets) | **À FAIRE** : modes actuels Standard (×1), Oracle+ (×1,1), achats ×6,9 / ×7,6 / ×9,1 / ×25,6 — à déclarer comme 6 modes | Déclarer les modes ; marquer les achats `is_buybonus` | [RGS.md](https://github.com/StakeEngine/math-sdk/blob/main/docs/rgs_docs/RGS.md), [betmode_overview](https://github.com/StakeEngine/math-sdk/blob/main/docs/math_docs/gamestate_section/configuration_section/betmode_overview.md) |
| 11 | **Gain max** : `wincap` unique de la config, applicable à tous les modes ; distribution dédiée pour contrôler sa fréquence | **OK** : plafond 5 000× (`MAX_WIN`) ; **À FAIRE** : définir la distribution du plafond. Simulation : 5 000× observé en achat Fureur, 1 560× en Oracle+ | Confirmer la valeur de plafond acceptée (NV) et sa fréquence | [game_format.md](https://github.com/StakeEngine/math-sdk/blob/main/docs/math_docs/overview_section/game_format.md) |
| 12 | **RTP par mode** : plage 90,0–98,0 % annoncée par une source tierce ; l'officiel dit seulement « RTP défini une fois dans la config, appliqué à chaque mode » | Standard **96,03 %**, Oracle+ **95,57 %**, achats **96,3–96,5 %** (simulation de 2 M tours, graine 7, lancée AVANT la règle « pas plus de 100 000 tours » ; non relancée) | Aligner tous les modes sur une même cible ; **NV** : la plage et la valeur exacte à demander à Stake | [config officielle](https://github.com/StakeEngine/math-sdk/blob/main/docs/math_docs/overview_section/game_format.md) ; tiers : [SKILL.md](https://github.com/ReSkin-Games/stake-engine-skills/blob/main/stake-math-sdk/SKILL.md) |
| 13 | **Écart d'RTP entre modes** ≤ 0,5 point (source tierce) | **BLOQUANT probable** : 95,57 % à 96,48 % = 0,91 point | Réaligner (par ex. 96,0 % partout) avec l'optimiseur de Stake. **NV** officiel | [SKILL.md (tiers)](https://github.com/ReSkin-Games/stake-engine-skills/blob/main/stake-math-sdk/SKILL.md) |
| 14 | Taux de gain non nul ≥ 1 sur 20 en mode de base ; gain max atteignable (≈ 1 sur 10 M) ; 100 k à 1 M de simulations | **OK** de principe : 60,3 % de tours gagnants ; **NV** pour le reste | Mesurer la fréquence du plafond de 5 000× en mode de base | [SKILL.md (tiers)](https://github.com/ReSkin-Games/stake-engine-skills/blob/main/stake-math-sdk/SKILL.md) |
| 15 | Jeu **sans état** : pas de jackpot, de gamble, de cashout | **OK** : pas de jackpot ni de quitte ou double ; rien ne persiste entre tours **hors** `localStorage` | Retirer le solde local ; la « série » et les stats de séance restent cosmétiques | [SKILL.md (tiers)](https://github.com/ReSkin-Games/stake-engine-skills/blob/main/stake-math-sdk/SKILL.md) |
| 16 | Niveaux de mise : `minBet`, `maxBet`, `stepBet`, `betLevels` fournis par l'authentification ; montants entiers à 6 décimales (1 $ = 1 000 000) | **À FAIRE** : mises codées en dur (0,20 à 1 000, défaut 1) | Lire les niveaux depuis la réponse d'authenticate ; convertir les unités | [RGS.md](https://github.com/StakeEngine/math-sdk/blob/main/docs/rgs_docs/RGS.md) |
| 17 | Devises : USD, CAD, JPY, EUR, RUB, CNY, PHP, INR, IDR, KRW, BRL, MXN, DKK, PLN, VND, TRY, CLP, ARS, PEN ; sociales XGC et XSC ; la devise n'affecte que l'affichage | **À FAIRE** : seulement € et $ au choix de l'utilisateur | Afficher la devise de l'authentification (décimales selon la devise, ex. JPY sans décimale) | [RGS.md](https://github.com/StakeEngine/math-sdk/blob/main/docs/rgs_docs/RGS.md) |
| 18 | Langues : ar, de, en, es, fi, fr, hi, id, ja, ko, pl, pt, ru, tr, vi, zh (`lang` dans l'URL) | **À FAIRE** : FR et EN seulement | Prévoir au moins un repli en anglais pour les autres codes ; traduire selon les marchés visés. **NV** : langues obligatoires | [RGS.md](https://github.com/StakeEngine/math-sdk/blob/main/docs/rgs_docs/RGS.md) |
| 19 | Variante **sociale** (`social=true`) : textes différents (« BET » devient « SPIN ») ; devises sociales | **À FAIRE** | Prévoir un jeu de textes sans vocabulaire de pari réel pour XGC/XSC | [web-sdk README](https://github.com/StakeEngine/web-sdk) |
| 20 | Codes d'erreur à gérer : `ERR_IPB`, `ERR_IS`, `ERR_ATE`, `ERR_GLE` (limites de jeu dépassées), `ERR_LOC`, `ERR_GEN`, `ERR_MAINTENANCE` | **À FAIRE** | Écrans dédiés, sans perte de round | [RGS.md](https://github.com/StakeEngine/math-sdk/blob/main/docs/rgs_docs/RGS.md) |
| 21 | **Fin de round** au bon moment selon le type de pari (sans gain, gain simple, bonus) ; sinon la reprise de round est incorrecte | **À FAIRE** | Appeler end-round après l'animation de gain, y compris après un bonus acheté | [web-sdk README](https://github.com/StakeEngine/web-sdk) |
| 22 | **RNG** et résultats **côté serveur**, jeu rejouable | **BLOQUANT** : `crypto.getRandomValues` dans le navigateur ; la reproductibilité n'existe qu'en simulation (graine) | Le tirage est celui du RGS (book tiré dans la lookup table). Supprimer tout aléa côté client | [data_format.md](https://github.com/StakeEngine/math-sdk/blob/main/docs/rgs_docs/data_format.md) ; README projet |
| 23 | Jeu responsable : limite de perte, rappel de séance, arrêt de l'auto-play | **OK** côté jeu (limite 1 000 / 5 000 / 20 000, rappel 30 min, stats). **NV** : obligation ou doublon avec les limites de l'opérateur (`ERR_GLE`) | Garder, mais laisser l'opérateur prioritaire ; ne pas contredire ses limites | README projet ; [RGS.md](https://github.com/StakeEngine/math-sdk/blob/main/docs/rgs_docs/RGS.md) |
| 24 | **Achat de bonus** : autorisé par le SDK (mode `is_buybonus`) ; restrictions par juridiction selon un glossaire tiers (Grande-Bretagne notamment) | **OK** : option désactivable (« Achat de bonus : Non »), coupée en auto-play. **NV** : politique de Stake par marché | Demander à Stake quels marchés l'interdisent et s'ils filtrent eux-mêmes ; prévoir un drapeau côté RGS plutôt qu'un réglage joueur | [betmode_overview](https://github.com/StakeEngine/math-sdk/blob/main/docs/math_docs/gamestate_section/configuration_section/betmode_overview.md) ; tiers : [track360](https://track360.io/glossary/bonus-buy) |
| 25 | Vitesse de jeu / durée minimale d'un tour, turbo, auto-play | État : turbo ×1,6 et ULTRA ×6, auto-play avec arrêt sur bonus. **NV** : aucune règle trouvée chez Stake ; certains régulateurs imposent une durée minimale ou interdisent le turbo | Prévoir un drapeau de désactivation du turbo/ultra et de l'auto-play selon le marché | non trouvé |
| 26 | Poids et nombre de fichiers du front | Bundle ≈ 250 Ko (code et polices) + images ≈ 1 Mo (README) | **NV** : aucune limite trouvée ; surveiller en mobile | non trouvé |
| 27 | Accessibilité | **OK** : contraste WCAG AA testé (`tools/contrast.js`), mouvement réduit détecté (`prefers-reduced-motion`) ; **NV** exigence Stake | Garder les tests ; vérifier les lecteurs d'écran | non trouvé |
| 28 | Tests / certification | **NV** : l'onboarding annonce une revue d'approbation (réponse « dans les 24 h » selon le blog de Stake) ; pas de laboratoire de test indépendant mentionné | Lire les directives d'approbation dans le tableau de bord ; presser les tests des maths (golden master) | [blog Stake](https://stake.com/blog/what-is-engine) (via recherche, non ouvert) |
| 29 | Conditions générales, partage des revenus, propriété du jeu | **NV** (conditions non lues). D'après le site et le blog via recherche : 10 % du GGR en partage de profit, ou 7,5 % du GGR attendu en option garantie, changement mensuel, paiement le 1er du mois | **Lire les conditions** : cession de licence, exclusivité, droit de retrait, responsabilité en cas de litige de PI | [stakeengine.org](https://stakeengine.org/), [blog Stake](https://stake.com/blog/what-is-engine) (non ouverts directement) |
| 30 | Licence du SDK | **OK** : MIT (copyright 2025 Stake Engine), usage commercial permis, garder l'avis de licence | Conserver l'avis dans le code porté | [LICENSE](https://github.com/StakeEngine/math-sdk/blob/main/LICENSE) |

## 3. Risques brevets, marques et droits d'auteur

Méthode et limites : j'ai cherché par mots-clés. **Je n'ai lu aucune revendication** et je n'ai pas pu consulter Google Patents, Espacenet ou le registre de l'USPTO directement. Un brevet peut aussi être déposé ou délivré dans un pays et pas dans un autre. Une absence de résultat **ne prouve rien**.

### 3.1 Brevets

| Mécanique d'Anubis Unchained | Brevets ou dépôts trouvés (extraits) | Niveau | Explication | Recommandation |
|---|---|---|---|---|
| Roue de 54 cases avec cases à gain direct, bonus et relance | Familles de brevets de « roue à bonus » d'éditeurs de machines à sous : [US11631301](https://patents.google.com/patent/US11631301) (roue mécanique déclenchée par symboles à multiplicateur, Everi), [US8460082](https://patents.google.com/patent/US8460082) / [US10643435](https://patents.google.com/patent/US10643435) (roues portant gains, multiplicateurs, tours gratuits), [US8597103](https://patents.google.com/patent/US8597103), [US8246445](https://patents.google.com/patent/US8246445B2/en) (roue à « terminateur ») | **Faible à moyen** | Une roue qui paie des multiplicateurs est un archétype ancien (le brevet US6471208 cité est expiré). Les revendications visent des combinaisons précises (déclencheur par symboles, indicateur directionnel, terminateur). Votre roue est tirée par une loterie virtuelle, sans déclencheur par symboles | Éviter les mécaniques « flèche qui renvoie vers la case voisine » et « terminateur de roue » ; faire vérifier par un conseil en PI |
| Roue améliorée / doublée, multiplicateur de case de l'Oracle | Une demande US20240119797 décrit un indicateur directionnel sur un segment qui déclenche un second prix ; les extraits n'indiquent rien sur un « boost prédit avant le tour » | **Moyen (NV)** | Le mécanisme Oracle (une case boostée avant le tour) est proche d'un « top slot » connu dans les jeux télévisés, sans brevet trouvé | Garder un nom propre (« Oracle »), éviter l'expression « Top Slot ». Faire inclure la case boostée dans la recherche d'antériorité |
| Plinko / Pachinko à bonus | Famille « Pachinko stand-alone and bonusing game » : [US6220593](https://www.google.com.ar/patents/US6220593), US6851674, US6896261, US6340158, US6398219, US6139013, US6047963, US7284756, US7052011 | **Faible** | Ces familles datent de la fin des années 1990 à 2000 ; les brevets les plus anciens sont **probablement expirés** (durée de 20 ans à compter du dépôt ; je n'ai pas vérifié chaque date). Les revendications portent sur un champ de chevilles décalées avec voies et gains affichés, déclenché par un symbole de ligne de paiement, ce qui ressemble à votre Chute des Scarabées | Vérifier les dates d'expiration et les familles plus récentes. Le jeu de chevilles est un principe général (loi binomiale), non appropriable en soi |
| Pick-me / coffres avec malédiction | [US6843722](https://patents.google.com/patent/US6843722), [US6582307](https://patents.google.com/patent/US6582307) (sélection masquée, terminateur, dispositif mécanique), [US7314409](https://patents.google.com/patent/US7314409) (transformateurs de terminateur), [US6511375](https://patents.google.com/patent/US6511375), [US7326114](https://patents.google.com/patent/US7326114) (« anti-terminateur » : objet stocké qui annule un terminateur) | **Moyen** | Votre **Bouclier Ankh** (annule une malédiction) ressemble fort au concept d'anti-terminateur, et la Malédiction à un terminateur. Ces brevets sont probablement anciens (années 2000), mais la date d'expiration n'est pas vérifiée | Faire vérifier l'expiration. À défaut, changer la règle du bouclier (par ex. bonus de points au lieu d'annulation) |
| Pesée (plateau le plus lourd gagne son multiplicateur) | Aucun brevet trouvé | **Faible (NV)** | Règle de jeu élémentaire, mais proche du Coin Flip d'Evolution (voir marques). Les règles de jeu sont en général peu brevetables ; Evolution peut en revanche invoquer la concurrence déloyale ou ses marques | Rester loin du vocabulaire « Coin Flip » ; garder l'habillage égyptien (plume et cœur) |
| Colonnes de multiplicateurs avec blocs + et ×, blocs de glace et broyeurs | Aucun brevet ou dépôt trouvé pour [Hand of Anubis](https://slotcatalog.com/en/slots/Hand-of-Anubis). **Correction de la question** : ce jeu est de **Hacksaw Gaming** (sortie le 21 avril 2022, selon SlotCatalog), pas de Play'n GO. Play'n GO publie un autre jeu, « Ankh of Anubis » | **Faible** pour votre code actuel | Je n'ai pas trouvé de mécanique de colonnes dans votre jeu : Anubis Unchained n'a ni grille de rouleaux, ni blocs de glace ni broyeurs. La proximité est surtout thématique (Anubis) et dans l'ancien nom du jeu | Ne pas ajouter ces blocs. Garder le renommage en Anubis Unchained. Faire chercher « Hacksaw Gaming » comme titulaire de brevets |
| Cumul de multiplicateurs, multiplicateur de bande ×2 à ×10 | Brevets IGT « pay line multipliers » ([US9401071](https://patents.google.com/patent/US9401071), [US8152616](https://patents.google.com/patent/US8152616)) et un dépôt Aristocrat sur multiplicateurs variables (extraits seulement) | **Faible à moyen** | Le multiplicateur multiplié par un gain est une idée très répandue. Les revendications portent sur des lignes de paiement, que votre jeu n'a pas | Faire vérifier la mécanique « doublement de tous les nombres de la roue » |
| **Achat de bonus** | Aucun brevet trouvé. Concept popularisé par Big Time Gaming en 2017 selon des pages affiliées (source faible) | **Faible** | Pas de preuve de brevet. Le risque est d'abord **réglementaire** (interdit dans certains marchés), pas de PI | Voir la ligne 24 de la checklist |
| « Bonus secret » (Crypte d'Anubis) | Rien de précis trouvé | **Faible (NV)** | Un bonus caché déclenché à l'insu du joueur n'a pas de brevet évident. Attention : s'il n'est pas dans les règles ou la table des gains, c'est un souci de conformité (jeu équitable) | Documenter le bonus secret dans les règles et la table de gains |

Ce qui est **sûrement libre** : les mathématiques (loi binomiale, espérance, probabilités pondérées), les règles génériques (roue qui s'arrête sur une case, choisir un coffre parmi plusieurs, faire tomber une bille parmi des chevilles), le principe d'une mise multipliée par un coefficient, et l'habillage de la mythologie égyptienne en général (domaine public).

Ce qui est **risqué** : la combinaison précise de plusieurs mécaniques proches d'un produit connu (roue + multiplicateur annoncé avant le tour + bonus à choix), tout élément qui ressemble à un jeu d'Evolution, et l'anti-terminateur du coffre.

### 3.2 Marques

| Nom | Ce que j'ai trouvé | Niveau | Recommandation |
|---|---|---|---|
| « Anubis Unchained » | Aucun jeu ni marque du même nom dans les résultats ; mais les résultats sont pauvres (sites de contenu automatique). Les titres voisins existent : « Ankh of Anubis » (Play'n GO), « Fury of Anubis », « Anubis Wrath ». Registre non consulté | **Moyen (NV)** | Faire une recherche de marque (EUIPO TMview, USPTO, WIPO Brand DB) en classes 9, 28 et 41. Le mot « Anubis » est descriptif du thème, donc peu protégeable, mais un titre très proche d'un concurrent pourrait gêner |
| « Hand of Anubis » | Titre d'un jeu de Hacksaw Gaming (2022). Aucune marque ou brevet trouvé, mais non consulté dans les registres | **Moyen** | **Ne plus l'utiliser** dans l'interface, la documentation publique, les noms de fichiers ou les mots-clés. Il reste dans l'historique de `docs/ANALYSE.md`, dans `img/hand.webp`, `ic_hand.jpg` et un mode interne `buy-hand` : renommer ces fichiers et le mode avant publication, par prudence |
| « Fureur d'Anubis » / « Fury of Anubis » | Un titre « Fury of Anubis » circule sur des sites de contenu ; aucune marque vérifiée | **Moyen (NV)** | Vérifier l'usage commercial ; envisager un nom plus distinctif |
| « Crazy Time » | Demande USPTO n° 79298685 d'Evolution Malta (déposée en mai 2020, statut non confirmé) ; Evolution Malta détient aussi des dépôts pour « Coin Flip » et « Krazy Time » (liste Justia) | **Élevé** si le mot est utilisé | **Ne jamais utiliser** « Crazy Time », « Coin Flip », « Cash Hunt », « Pachinko » avec majuscule comme nom de bonus, ni leurs variantes phonétiques. Vérifier que `docs/CONCURRENTS.md` ne finit pas dans le jeu publié |
| Noms de bonus (Chute des Scarabées, Pesée du Cœur, Chambre du Trésor) | Termes descriptifs et mythologiques ; aucune marque trouvée | **Faible** | Rechercher « Weighing of the Heart » : référence de l'Égypte antique mais déjà utilisée par d'autres jeux ; non vérifié |
| « Stake », « Stake Engine » | Marques de leurs titulaires | **Faible** si usage descriptif | Ne pas laisser croire à un partenariat avant l'accord ; suivre leurs consignes de marque |

### 3.3 Droits d'auteur et licences

| Élément | État | Niveau | Explication | Recommandation |
|---|---|---|---|---|
| Images générées par IA (Higgsfield, ≈ 28 fichiers dans `img/`) | D'après le centre d'aide Higgsfield (lu via recherche, **non ouvert directement**) : la plateforme ne revendique pas la propriété des sorties et ne limite pas l'usage commercial, sous réserve d'avoir les droits sur les entrées (images de référence). Les sorties à filigrane (offres basses) peuvent être inadaptées. Conditions mises à jour en juillet 2026, applicables aux comptes existants depuis le 27 août 2026 (selon la recherche) | **Moyen** | (1) Les conditions n'ont pas été lues intégralement. (2) Le Copyright Office américain (rapport Partie 2, 29 janvier 2025) indique qu'une œuvre produite par IA **sans** contribution humaine suffisante n'est pas protégée : des prompts seuls ne suffisent pas. Un concurrent pourrait donc copier vos images sans que vous puissiez facilement agir. (3) Une image IA peut ressembler à un visuel existant (risque de contrefaçon involontaire) | Conserver, pour chaque image, le prompt, l'identifiant de génération (déjà dans `docs/ASSETS_HIGGSFIELD.md`) et la preuve d'un plan payant sans filigrane. Retoucher ou composer à la main pour ajouter un apport humain. Lire les conditions Higgsfield complètes. Comparer les images clés à des visuels de jeux concurrents |
| Entrées de référence envoyées à Higgsfield | Non vérifié | **À contrôler** | Si une image de référence appartient à un tiers, la sortie peut être dérivée | N'envoyer que des images dont vous avez les droits |
| Polices Cinzel et Philosopher | Licence SIL OFL 1.1 : usage commercial, intégration dans un produit vendu et redistribution permis ; on ne peut pas **vendre la police seule**. Un « nom de police réservé » n'existe que s'il est déclaré dans le copyright de la police ([OFL-1.1, SPDX](https://spdx.org/licenses/OFL-1.1.html)) | **Faible** | Vos fichiers sont des sous-ensembles latins en `woff2` : c'est une version modifiée. Si une des polices déclare un nom réservé, le fichier modifié ne doit pas porter ce nom | Ajouter dans le dépôt les fichiers `OFL.txt` et l'avis de copyright de chaque police, et vérifier la présence d'un nom réservé |
| Code du jeu et mathématiques | Écrits à l'origine (ANALYSE §2) ; le math-sdk est MIT | **Faible** | Rien à signaler | Conserver l'avis MIT pour le code porté du SDK |
| Sons | Synthèse WebAudio maison | **Faible** | Aucun échantillon tiers | RAS |

## 4. Plan d'action priorisé

**P0 — avant toute soumission**
1. Lire les conditions générales développeur et les directives d'approbation dans le tableau de bord Stake Engine (les confirmer une à une : RTP, gain max, achat de bonus, vitesse, langues, assets).
2. Faire une recherche d'antériorité et de liberté d'exploitation (brevets et marques) par un conseil en propriété industrielle, en listant : roue + multiplicateur annoncé, bouclier qui annule une malédiction, Plinko, pesée. Fournir les titulaires à chercher : Evolution Malta, Hacksaw Gaming, Play'n GO, IGT, Everi, Aristocrat.
3. Porter les maths dans le math-sdk : un book par résultat, une lookup table, un `index.json`, 6 modes ; résoudre les choix du joueur (lignes 5 et 6).
4. Réaligner les RTP des 6 modes autour d'une même cible (écart ≤ 0,5 point en attendant confirmation) et définir le plafond de gain.

**P1 — avant la bêta**
5. Brancher le front au RGS (authenticate, play, end-round, reprise de round), supprimer solde et RNG locaux, gérer les codes d'erreur.
6. Devises, niveaux de mise et langues issus du RGS ; variante sociale (XGC/XSC).
7. Renommer les fichiers et modes qui contiennent encore « hand » ; retirer toute trace de « Hand of Anubis » du dépôt public. **Fait pour les fichiers, préfixes et textes** (voir « État après corrections ») ; l'identifiant interne `hand` reste.
8. Conserver les preuves de génération des images, ajouter les fichiers OFL, lire les conditions Higgsfield.

**P2 — avant publication**
9. Prévoir des drapeaux désactivant achat de bonus, turbo et auto-play par marché.
10. Remplacer ou modifier le Bouclier Ankh si l'expiration des brevets d'anti-terminateur n'est pas confirmée.
11. Déposer la marque « Anubis Unchained » si la recherche est favorable.
12. Tests de bout en bout sur appareil réel (son et fluidité jamais vérifiés, cf. ANALYSE §7).

## État après corrections

Date : 2026-10-14. **Le jeu n'est toujours pas conforme ni soumissible à Stake Engine** : ce qui suit corrige ce qui l'était dans ce dépôt, rien de plus.

### Corrigé dans ce dépôt

| Point (ligne de la checklist) | Correction | Vérification |
|---|---|---|
| Restes de « Hand of Anubis » (marques, plan P1 n°7) | `img/hand.webp` et `img/ic_hand.jpg` renommés en `img/fury.webp` et `img/ic_fury.jpg` ; `HOA_IMG` devient `ANUBIS_IMG` ; `HOA_BIG` devient `ANUBIS_BIG` ; clés de sauvegarde `anubis_save_v1` et `anubis_grade` (les anciennes clés `hoa_save_v1` et `hoa_grade` sont encore LUES, pour ne pas perdre les soldes) ; mode `buy-hand` devenu `buy-fury` dans `tools/simulate.js` et le README. **L'identifiant interne `hand` est conservé** (math, scènes, clés i18n `hand*`, tests) : le renommer touche `handScene` et des dizaines d'endroits, pour aucun gain visible | aucun texte visible ni nom de fichier ne contient « Hand of Anubis » (il ne reste que les notes historiques de `docs/`) |
| Multiplicateurs entiers (ligne 9) | `M.SCALE = 100`, `M.toInt(x)`, `M.fromInt(n)`, `M.isExact(x)` dans `js/math.js`. Tous les gains (0,25 ; 0,5 ; 0,65 ; 0,79 ; moyenne des 5 colonnes de la Crypte = somme ÷ 5 ; boosts et paliers entiers) sont des multiples exacts de 0,01 : **la conversion est exacte, aucun arrondi, aucun effet sur le RTP**. Les coûts (1,1 ; 9,24 ; 10,31 ; 12,37 ; 27,28) le sont aussi | `tools/check.js` : 1000 tours par mode, 0 gain inexact |
| Fichiers books / lookup / `index.json` (lignes 4, 8, 10) | `tools/stake-export.js` (Node, sans dépendance) écrit dans `tools/out/` (ignoré par git) un `index.json` à 6 modes (`std`, `plus`, `buy_scarab`, `buy_weigh`, `buy_vault`, `buy_fury`, avec `cost` et `is_buybonus`), des `books_<mode>.jsonl.zst` (zstd via `zlib.zstdCompressSync` de Node 22 ; repli en `.jsonl` brut si absent) et des `lookUpTable_<mode>_0.csv` (n°, poids, `payoutMultiplier` entier). **C'est une démonstration du format** : 1000 books tirés au hasard, poids égaux à 1, aucune optimisation d'RTP (le RTP d'un échantillon de 1000 books est sans valeur) | `node tools/stake-export.js` : 0 anomalie |
| Choix du joueur pré-résolus (lignes 5 à 7) | Stratégie documentée en tête de `tools/stake-export.js` : **Pesée** : le book donne seulement `playerWins` et `playerMult` pour le choix du joueur (50/50, choix décoratif) ; **Fureur** : les trois couleurs sont symétriques, le book est écrit pour « la couleur du joueur » (index 0) et le front renomme les couleurs par rotation ; **Chambre du Trésor** : l'ordre des jetons est déjà tiré d'avance, la tuile touchée est neutre ; **profil Prudent / Équilibré / Audacieux** : non symétrique, le book joue l'Équilibré et le choix ne peut pas rester réel (il faudrait un mode Stake par profil, ou retirer le choix) | revue du code ; **le front n'est pas encore adapté à ces books** |
| Langues (ligne 18) | **Anglais par défaut** (premier lancement, sans sauvegarde ni `?lang=`, et pour tout code inconnu). **16 traductions complètes** : ar, de, en, es, fi, fr, hi, id, ja, ko, pl, pt, ru, tr, vi, zh. Sélecteur de langue (menu déroulant au bouton de langue). Arabe en `dir="rtl"` sur le document (HUD et canvas gardent leur structure d'origine). Polices système de repli pour ar, hi, ja, ko, zh (aucun fichier ajouté). Les noms WIN / BIG WIN / EXTRA WIN / MEGA WIN restent en anglais dans toutes les langues ; les noms de bonus sont traduits ou transcrits | `tools/i18n-check.js` : parité des clés, types, longueurs de listes et marqueurs `{x}` pour les 16 langues, textes courts et longs bornés, `dir` ; captures Chromium vérifiées en ar, de, ja, ru, vi |
| Paramètres de lancement (ligne 2) | `?lang=` est appliqué ; `sessionID`, `rgs_url`, `device`, `social` sont **lus** dans `window.LAUNCH` (`js/i18n.js`) mais pas encore utilisés | capture avec `?lang=xx&sessionID=...&social=true` |

### Reste à faire (rien de ceci n'est fait)

1. **Porter les maths et le RNG dans le math-sdk Python** (≥ 3.12) : un book par résultat, lookup table, optimisation (Rust/Cargo), 6 modes, plafond de gain et sa distribution. Les books de `tools/stake-export.js` ne valent que comme modèle de format ; leurs événements sont ceux du jeu, pas ceux d'un `gamestate` du SDK.
2. **Écrire le client RGS** (structure ci-dessous) et retirer du jeu solde, RNG (`crypto.getRandomValues`), sauvegarde `localStorage` du solde et reprise de round locale.
3. **Solde, devise, niveaux de mise, limites fournis par l'API** : le jeu code encore € / $, des mises de 0,20 à 1 000 et une limite de perte locale ; les 19 devises et les devises sociales (XGC, XSC) viennent de l'authentification.
4. **Adapter le front aux books** : Pesée et Fureur lisent le résultat du book (voir la stratégie ci-dessus), roue et Plinko lisent angle d'arrêt et chemins dans les événements, plus aucun tirage côté client.
5. **Réaligner les RTP** des 6 modes (écart actuel 0,9 point contre 0,5 cité par une source tierce), mesurer la fréquence du gain max, lire les directives d'approbation Stake.
6. Variante sociale (`social=true` : « BET » devient « SPIN », sans vocabulaire de pari), codes d'erreur (`ERR_*`), fin de round, drapeaux par marché (achat de bonus, turbo, auto-play).
7. Tout le volet juridique (P0 n°1 et 2 : conditions Stake, recherche d'antériorité et de marques, droits des images), non traité par du code.

### Structure d'un futur client RGS (non écrit)

Fichier prévu : `js/rgs.js`, chargé avant `js/main.js`. Il lit `window.LAUNCH` (déjà rempli) et n'est actif que si `LAUNCH.sessionID` et `LAUNCH.rgs_url` existent ; sinon le jeu reste en démo locale.

```
RGS.authenticate(sessionID)      POST {rgs_url}/wallet/authenticate -> { balance, currency, config: { minBet, maxBet, stepBet, betLevels, jurisdiction }, round? }
                                  si round actif : reprendre ses événements, puis end-round
RGS.play(mode, amount)           POST {rgs_url}/wallet/play         -> { round: { events[], payoutMultiplier, active }, balance }
RGS.endRound()                   POST {rgs_url}/wallet/end-round    (après l'animation du gain, y compris après un bonus acheté)
RGS.balance()                    POST {rgs_url}/wallet/balance
RGS.event(id)                    POST {rgs_url}/bet/event           (progression dans un round à plusieurs étapes)
unités : montants entiers à 6 décimales (1 000 000 = 1 unité) ; payoutMultiplier entier à l'échelle M.SCALE
erreurs : ERR_IPB, ERR_IS, ERR_ATE, ERR_GLE, ERR_LOC, ERR_GEN, ERR_MAINTENANCE -> écrans dédiés, sans perte de round
```

Branchement dans `js/main.js` : `M.playRound(rng)` est remplacé par `RGS.play(...)`, dont les `events[]` sont convertis par un adaptateur en l'objet de tour déjà consommé par les scènes (`spins[]`, `bonus`, `pay`). Les noms exacts des endpoints et des champs doivent être revérifiés sur `RGS.md` avant d'écrire le code : ce schéma est un plan, pas une spécification lue ligne à ligne.

## 5. Sources

Officielles (lues) :
- Math SDK : https://github.com/StakeEngine/math-sdk
- Format de données (books, lookup, index.json) : https://github.com/StakeEngine/math-sdk/blob/main/docs/rgs_docs/data_format.md
- API du RGS : https://github.com/StakeEngine/math-sdk/blob/main/docs/rgs_docs/RGS.md
- Modes de mise : https://github.com/StakeEngine/math-sdk/blob/main/docs/math_docs/gamestate_section/configuration_section/betmode_overview.md
- Format de jeu : https://github.com/StakeEngine/math-sdk/blob/main/docs/math_docs/overview_section/game_format.md
- Événements : https://github.com/StakeEngine/math-sdk/blob/main/docs/math_docs/gamestate_section/events_info.md
- Publication (S3 provisoire) : https://github.com/StakeEngine/math-sdk/blob/main/docs/math_docs/uploads_section/upload_info.md
- Licence MIT : https://github.com/StakeEngine/math-sdk/blob/main/LICENSE
- Web SDK : https://github.com/StakeEngine/web-sdk

Officielles ou presse, **non ouvertes directement** (connues par résumé de recherche) :
- https://stake.com/blog/what-is-engine
- https://stakeengine.org/
- https://stake-engine.com/docs/math/game-state-structure/setup/betmode
- Annonce de l'ouverture aux jeux externes : https://igamingexpert.com/news/games/stake-expansion-external-games/

Tierces (fiabilité limitée) :
- https://github.com/ReSkin-Games/stake-engine-skills/blob/main/stake-math-sdk/SKILL.md (plage d'RTP, écart entre modes, taux de gain)
- https://track360.io/glossary/bonus-buy (achat de bonus par marché)
- https://slotcatalog.com/en/slots/Hand-of-Anubis (mécaniques et éditeur du jeu)

Brevets (extraits de recherche, revendications non lues) :
- https://patents.google.com/patent/US11631301 · US8460082 · US10643435 · US8597103 · US8246445B2 · US6471208
- https://patents.google.com/patent/US6843722 · US6582307 · US7314409 · US6511375 · US7326114
- https://www.google.com.ar/patents/US6220593 (famille Pachinko)
- https://patents.google.com/patent/US9401071 · US8152616

Marques et droits :
- https://trademarks.justia.com/owners/evolution-malta-limited-4616567
- https://higgsfield.ai/creator-hub/help-center/account/who-owns-my-generations-and-can-i-use-them-commercially
- https://spdx.org/licenses/OFL-1.1.html
- Rapport du Copyright Office, Partie 2 (29 janvier 2025), résumé : https://www.akingump.com/en/insights/ai-law-and-regulation-tracker/us-copyright-office-releases-part-2-of-ai-report

Dernier rappel : ce document est une aide à la décision. Seul un professionnel qualifié peut apprécier un risque de contrefaçon, et aucune recherche par mots-clés ne le supprime.
