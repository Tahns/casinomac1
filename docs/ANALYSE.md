# Hand of Anubis — analyse, choix et architecture

Document de travail qui accompagne le jeu. Ce qui est **mesuré** (simulation, rendu réel dans Chromium) est séparé de ce qui est **supposé** ou **à vérifier**.

---

## 1. Diagnostic de la base fournie (`handofanubistime_1.html`)

Lecture du code (2 775 lignes, ~250 Ko dont un logo en base64).

| | |
|---|---|
| **Forces** | Boucle complète déjà jouable : roue 54 cases, 4 bonus (Pile ou Face, Anubis Time, Jugement/Pachinko, Chasse au Scarabée), « top slot » qui booste une case, mascotte 3D, audio synthétisé, sauvegarde du solde. Palette or/obsidienne cohérente. |
| **Faiblesses** | **(1)** Rendu dépendant de three.js chargé depuis 3 CDN en cascade (réseau obligatoire, WebGL fragile) avec un fallback 2D moins soigné. **(2)** Paris sur plusieurs cases avec `Math.random()` côté client : impossible à brancher sur Stake, où le résultat vient du serveur. **(3)** Aucune mesure d'RTP dans le fichier : les valeurs des bonus (ex. pool du Pile ou Face) sont arbitraires. **(4)** Tout dans un seul fichier : difficile à maintenir et à tester. **(5)** DOM + canvas mélangés, hiérarchie visuelle peu lisible (c'est ce que tu décrivais comme « pas assez bon »). |
| **Opportunités** | Les roues à bonus fonctionnent très bien en « crash/originals » : un tour = un résultat, très lisible. L'univers Anubis est peu saturé face aux thèmes Crazy Time classiques. |
| **Menaces** | Propriété intellectuelle d'Evolution (Crazy Time, Coin Flip, Pachinko, Cash Hunt : noms, visuels, mécaniques). Conformité / certification Stake. RTP non démontré = refus probable. |

## 2. Recherche GitHub — ce que j'ai trouvé et ce que j'en ai fait

Constat honnête : **aucun dépôt libre de « Crazy Time » propre et réutilisable**. Les résultats sont des briques génériques.

| Source | Intérêt | Licence / réserve | Utilisation |
|---|---|---|---|
| [StakeEngine/web-sdk](https://github.com/StakeEngine/web-sdk) | Architecture de référence : front **qui rejoue des événements** (`playBookEvents`), états xstate, sortie **site statique** | SDK officiel, optionnel | **Pattern repris** : le noyau `math.js` produit un script d'événements, le front le rejoue. Aucun code copié. |
| [StakeEngine/math-sdk](https://github.com/StakeEngine/math-sdk) | Python ≥ 3.12, définition des règles + simulation + optimisation des distributions | MIT | Cible de portage du noyau mathématique (voir §6). |
| [spin-wheel (CrazyTim)](https://crazytim.github.io/spin-wheel/) | Physique de roue (momentum, amorti), recommande de calculer le gagnant côté serveur | non vérifiée par moi | Inspiration conceptuelle (résultat décidé avant, animation ensuite). Code **réécrit**. |
| pixi-slot-machine, ZombieLand, open-games… | Slots Pixi/GSAP | licences non confirmées, **assets non libres** | Écartés : mauvais genre, art non réutilisable. |

Décision : tout est **écrit en original**, sans dépendance ni asset externe. Seules les polices Cinzel et Manrope (licence OFL) sont embarquées localement.

## 3. Choix structurants (et pourquoi)

1. **Une mise, un tour** au lieu des paris multi-cases. Contrepartie assumée : on perd le plaisir de « répartir ses jetons », on gagne la compatibilité avec le modèle de round de Stake et un RTP calculable et honnête. *(L'incompatibilité exacte du multi-paris avec Stake Engine n'est pas documentée dans ce que j'ai pu lire : à confirmer.)*
2. **Résultat décidé avant l'animation.** `AnubisMath.playRound(rng)` renvoie tout le tour (cases, Oracle, billes du Plinko, plateaux, tuiles, rotations de la Main). Les scènes **n'inventent rien**.
3. **Canvas 2D pur + WebAudio synthétisé** : zéro réseau, zéro asset, démarrage instantané, net sur écrans Retina.
4. **Mathématiques d'abord** : le catalogue de bonus a été dimensionné par la simulation (voir §5), pas l'inverse. Piège rencontré : en mise unique, `fréquence × espérance` des bonus doit tenir dans ~50 % d'RTP, ce qui interdit un bonus fréquent ET très généreux. D'où l'idée de la **Main d'Anubis** (ci-dessous).

## 4. Direction artistique

**Concept : « Le jugement d'Anubis »** — un temple d'obsidienne éclairé à l'or, où deux gardiens à tête de chacal observent une roue monumentale.

- **Palette** : obsidienne `#14100c`, or massif (dégradé `#fff1b8 → #e6b94a → #8a6a1e`), lapis `#2352b8`, turquoise `#18b5a4`, cornaline `#c8392b`, améthyste `#7b3fa6`. Chaque famille de gain a sa couleur (lecture instantanée de la roue).
- **Typo** : Cinzel (titres, façon gravure) + Manrope (chiffres, HUD tabulaires).
- **Motifs** : ankh, œil d'Horus, scarabée, plume de Maât, pyramide, crâne (malédiction), tous tracés en vectoriel (`js/art.js`).
- **Vie** : lampes chenillard sur la jante, rayons rotatifs, poussière d'or, braseros qui vacillent, yeux des gardiens qui pulsent, pointeur à **ressort physique** qui claque à chaque case, flou de mouvement à haute vitesse, ralentissement final avec « crawl », secousses d'écran et pluie d'or graduées selon le gain.

## 5. Game design et mathématiques (mesurés)

**Roue de 48 cases** : `0×` ×17, `0,25×` ×6, `0,5×` ×12, `1×` ×4, `2×` ×1, `3×` ×1, **Ankh** (relance gratuite) ×4, **Scarabées**, **Pesée**, **Trésor** ×1 chacun. Disposition déterministe, jamais deux cases identiques côte à côte.

**L'Oracle** (≈ 32 % des tours en mode Standard, ≈ 72 % en mode **Oracle+**) : avant le spin, il désigne une case et lui offre un boost ×2 → ×25. Les cases concernées s'illuminent avec un badge sur la roue. Si la roue s'y arrête, le boost s'applique (sur un bonus, il multiplie le total du bonus). *Inspiré du « top slot » de ta base, mais lisible d'un coup d'œil.*

**Bonus** (chacun rejoue un script) :

| Bonus | Mécanique | EV isolée | Max |
|---|---|---|---|
| **Chute des Scarabées** | Plinko 8 rangées, 3 scarabées, chacun paie sa case (0,5× → 25×) | ≈ 5,1× | 75× |
| **Pesée du Cœur** | Cœur vs plume ; le plateau le plus lourd décide, balance qui oscille | ≈ 5,8× | 150× |
| **Chambre du Trésor** | Pick-me 12 chambres : valeurs, **Sceptre ×2**, **Ankh bouclier** (annule une malédiction), **Malédiction** (clôt le coffre), prime « coffre vidé » | ≈ 7,3× | 240× |
| **Main d'Anubis** | **Chaque bonus a 8 % de chance d'être saisi** : roue géante à 24 cases, multiplicateurs ×2/×3/×4 qui **s'empilent** (jusqu'à 2 chaînes) | ≈ 24,6× | 1 600× (jusqu'à 5 000× avec un boost Oracle, plafond global) |

**Résultats de simulation** (`node tools/simulate.js 12000000 <graine> <std|plus>`, 3 graines × 12 M de tours par mode) :

| | Standard | Oracle+ (mise ×1,1) |
|---|---|---|
| RTP | **96,2 %** (96,30 / 96,15 / 96,27) | **95,9 %** (95,86 / 95,94 / 95,74) |
| Tours gagnants | 61,3 % | 61,4 % |
| Bonus | 1 tour sur 14,7 | 1 tour sur 14,7 |
| Gain max observé | 3 600× | 5 000× (plafond atteint) |

Marge d'erreur ≈ ±0,2 pt (l'écart-type d'un tour est ~6×). Les boosts Oracle pèsent ≈ 7 pts de RTP en Standard et ≈ 20 pts en Oracle+ (compensés par la mise ×1,1).

Volatilité moyenne-haute : 61 % des tours rendent quelque chose (0,25× et 0,5× compris), la relance Ankh lisse la série, et la queue de distribution (Main d'Anubis) apporte le « rêve de gros gain ».

## 6. Chemin vers Stake Engine

Ce que j'ai pu **vérifier** dans le dépôt officiel `web-sdk` : la sortie doit être un **site statique** (« other frameworks allowed if they compile to static files ») ; le front se connecte au RGS via les paramètres de l'URL de lancement, s'authentifie, joue des **événements de « book »** dans l'ordre, et gère la fin de round (`handleRequestEndRound`). Publication : upload du dossier de build dans *Files* puis *Publish Game → Front End*. Le math-sdk est Python ≥ 3.12 (MIT).

Ce qui **reste à faire** (non fait ici, et je n'ai pas pu vérifier tous les détails du format) :

1. **Math côté serveur** : porter `js/math.js` dans le math-sdk Python (mêmes tables) pour générer les books/lookup tables ; recalculer l'RTP avec leur optimiseur.
2. **Brancher le front sur le RGS** : remplacer `M.playRound(rng)` dans `js/main.js` par l'appel de mise du RGS, et transformer le script d'un tour en événements de book. La structure est déjà faite pour ça (les scènes ne consomment que des données).
3. **Vérifier la doc officielle** sur : plafond de gain max, plages d'RTP autorisées, niveaux de mise, taille maximale du bundle, exigences d'i18n/devise, comportement du bouton « social ». Le bundle actuel est léger (aucune image, ~234 Ko avec polices) mais je n'ai pas confirmé de limite.
4. **Propriété intellectuelle** : les noms et visuels sont originaux, mais la **Chute des Scarabées** (Plinko/Pachinko) et la **Pesée** (analogue du Coin Flip) restent des archétypes proches de ceux d'Evolution. À faire valider avant publication ; si un doute subsiste, remplacer par des mécaniques plus éloignées.

## 7. Limites connues

- Testé dans **Chromium headless** (captures desktop 1440×810 et mobile 390×844, soak de 60 tours turbo + 10 bonus forcés sans erreur). **Le son n'a pas été écouté** (synthèse WebAudio non vérifiée à l'oreille), et la fluidité sur mobile d'entrée de gamme n'est pas mesurée.
- Le RNG de la démo est côté navigateur (`crypto.getRandomValues`) : c'est une démo, pas un jeu certifiable. L'RTP n'est pas audité.
- L'art est entièrement procédural : fidèle à la DA, mais un habillage avec illustrations sur mesure (statue d'Anubis, textures de pierre) élèverait encore le rendu. Possible via génération d'images si tu veux aller plus loin.
- Le multi-paris façon Crazy Time a été abandonné (voir §3).

## 8. SWOT du jeu et corrections apportées

| Faiblesse relevée | Correction |
|---|---|
| Plus de décision pour le joueur (fin du multi-paris) | **Mode ORACLE+** : mise ×1,1 contre un Oracle sur ≈ 3 tours sur 4. Même RTP (≈ 96 %), donc un vrai choix de profil de risque, compatible avec le modèle « un pari, un round » (les *bet modes* de Stake, à confirmer dans leur doc). |
| Moitié des tours à zéro | **Cases 0,25×** (6) : 47,7 % → **61,3 %** de tours gagnants. L'RTP a été rééquilibré (Oracle moins fréquent en Standard). |
| Pas de cadre de jeu responsable | **Limite de perte de séance** (1 000 / 5 000 / 20 000, blocage + message), **rappel toutes les 30 min** avec résultat net, **stats de séance** dans le panneau d'infos, arrêt de l'auto-play. |
| Fluidité mobile non mesurée | **Qualité adaptative** : si la moyenne dépasse ~34 ms/frame, baisse du DPR puis allègement des effets ; réglage manuel Auto / Élevée / Basse. |
| Art sans textures | **Grain de pierre** et **frise de hiéroglyphes** sous le linteau. |

Reste non résolu (hors de portée d'un correctif de code) : validation de la propriété intellectuelle, lecture des contraintes officielles Stake, test du son à l'oreille, RNG serveur et audit.
