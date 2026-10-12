# Anubis Unchained — analyse, choix et architecture

> **Note de renommage (2026-10-12).** Le jeu « Hand of Anubis » s'appelle désormais **Anubis Unchained**, et le bonus 4 « Main d'Anubis » est devenu **Fureur d'Anubis** (« Fury of Anubis »). Les sections 1 à 9 ont été mises à jour ; les sections datées « Itération N » et les SWOT d'époque conservent volontairement les anciens noms (historique).

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
4. **Mathématiques d'abord** : le catalogue de bonus a été dimensionné par la simulation (voir §5), pas l'inverse. Piège rencontré : en mise unique, `fréquence × espérance` des bonus doit tenir dans ~50 % d'RTP, ce qui interdit un bonus fréquent ET très généreux. D'où l'idée de la **Fureur d'Anubis** (ci-dessous).

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
| **Pesée du Cœur** | Plume ou cœur : le joueur choisit un plateau, les multiplicateurs défilent puis se figent, la balance pèse ; le plus lourd (50/50) gagne son multiplicateur, le plus léger n’a rien | ≈ 5,8× | 300× |
| **Chambre du Trésor** | Pick-me 12 chambres : valeurs, **Sceptre ×2**, **Ankh bouclier** (annule une malédiction), **Malédiction** (clôt le coffre), prime « coffre vidé » | ≈ 7,3× | 240× |
| **Fureur d'Anubis** | **Chaque bonus a 8 % de chance d'être saisi** : roue géante à 24 cases, multiplicateurs ×2/×3/×4 qui **s'empilent** (jusqu'à 2 chaînes) | ≈ 24,6× | 1 600× (jusqu'à 5 000× avec un boost Oracle, plafond global) |

**Résultats de simulation** (`node tools/simulate.js 12000000 <graine> <std|plus>`, 3 graines × 12 M de tours par mode) :

| | Standard | Oracle+ (mise ×1,1) |
|---|---|---|
| RTP | **96,2 %** (96,30 / 96,15 / 96,27) | **95,9 %** (95,86 / 95,94 / 95,74) |
| Tours gagnants | 61,3 % | 61,4 % |
| Bonus | 1 tour sur 14,7 | 1 tour sur 14,7 |
| Gain max observé | 3 600× | 5 000× (plafond atteint) |

Marge d'erreur ≈ ±0,2 pt (l'écart-type d'un tour est ~6×). Les boosts Oracle pèsent ≈ 7 pts de RTP en Standard et ≈ 20 pts en Oracle+ (compensés par la mise ×1,1).

Volatilité moyenne-haute : 61 % des tours rendent quelque chose (0,25× et 0,5× compris), la relance Ankh lisse la série, et la queue de distribution (Fureur d'Anubis) apporte le « rêve de gros gain ».

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

## 9. Achat de bonus

Le joueur choisit **au départ** : jouer la roue, ou acheter directement un bonus (Pyramide/Trésor, Scarabées, Pesée, Fureur d'Anubis), à un prix plus élevé que la mise normale. Le bonus s'ouvre aussitôt, sans passer par la roue. Prix = mise × multiplicateur, calé sur l'espérance réelle du bonus (la Fureur d'Anubis peut toujours saisir un bonus acheté, avec la même probabilité que sur la roue ; aucun boost Oracle à l'achat).

| Bonus | Prix (× mise) | RTP simulé (2 graines × 10 M) |
|---|---|---|
| Chute des Scarabées | 6,9 | 96,3 % |
| Pesée du Cœur | 7,6 | 96,4 % |
| Chambre du Trésor (pyramide) | 9,1 | 95,7 % |
| Fureur d'Anubis | 25,6 | 96,3 % |

Cadre : l'achat est désactivé pendant l'auto-play, compte dans la limite de perte de séance, et peut être coupé dans les réglages (« Achat de bonus : Non »), car il est interdit dans certaines juridictions. L'overlay de gros gain se déclenche sur le gain rapporté au **prix payé**, pas à la mise de base.

## 10. Itération 1 de la boucle (2026-10-09, 20 h UTC)

**Fait** : achat de bonus (voir §9). C'est la demande directe de l'utilisateur, traitée avant le SWOT.

**SWOT à jour**

| | |
|---|---|
| **Forces** | Rendu cohérent (DA obsidienne/or), 61 % de tours gagnants, RTP ≈ 96 % sur 3 profils (Standard, Oracle+, achat de bonus), résultat décidé avant l'animation, bundle ≈ 250 Ko, jeu responsable intégré, choix du joueur à l'entrée (roue, Oracle+, achat). |
| **Faiblesses** | Son jamais écouté, fluidité mobile non mesurée sur appareil réel ; art procédural ; RNG navigateur non audité ; l'achat de bonus fait monter la variance perçue (écart-type ≈ 16–50× par achat) ; pas de progression (séries, quêtes). |
| **Opportunités** | Achat + Oracle+ = trois profils de risque à proposer sur Stake (si leurs *bet modes* le permettent) ; illustrations générées ; contenu événementiel. |
| **Menaces** | Propriété intellectuelle (Plinko/Pachinko, Coin Flip), contraintes Stake non vérifiées (achat de bonus autorisé ou non selon marché), cadre légal par pays (achat interdit dans certains), concurrence des roues à bonus. |

**Bloqué (dépend de l'utilisateur ou d'un tiers)** : validation de la propriété intellectuelle ; lecture de la doc officielle Stake ; test du son à l'oreille ; test sur vrai téléphone ; RNG serveur et audit ; avis juridique sur l'achat de bonus.

## 11. Itération 2 de la boucle (2026-10-10, 00 h UTC)

**Corrigé**
- **Filet de tests des maths** : `node tools/check.js` (code de sortie 1 si un invariant casse). Il vérifie la roue (48 cases, comptes, jamais deux cases identiques côte à côte), le déterminisme par graine, la structure de 600 000 tours (plafond, chaîne Ankh, cohérence boost/Oracle, gains = base × boost), les achats (un bonus, coût = prix affiché) et un RTP grossier de chaque mode. Résultat : 0 anomalie ; RTP mesuré Standard 95,9 %, Oracle+ 96,3 %, achats 96,0 à 96,2 %.
- **Accessibilité** : le texte de statut est annoncé aux lecteurs d'écran (`role="status"`, `aria-live`), contour de focus visible au clavier, canvas décrit, et **mouvement réduit** activé automatiquement si le système le demande (tant que le joueur n'a pas choisi).

**SWOT à jour**

| | |
|---|---|
| **Forces** | Maths vérifiées par un test reproductible, 3 profils de jeu (roue, Oracle+, achat) à RTP ≈ 96 %, rendu cohérent, jeu responsable, accessibilité de base, bundle léger. |
| **Faiblesses** | Son jamais écouté ; fluidité mobile non mesurée sur appareil réel ; art procédural ; pas de tests automatisés de l'interface au-delà du soak ; pas de progression ; RNG navigateur. |
| **Opportunités** | Profils de risque multiples à proposer à Stake ; illustrations générées (sur accord) ; contenu événementiel. |
| **Menaces** | Propriété intellectuelle ; contraintes Stake et achat de bonus selon les marchés ; cadre légal ; concurrence. |

**Bloqué** : validation de la propriété intellectuelle ; doc officielle Stake ; test sonore ; test sur vrai téléphone ; RNG serveur et audit ; avis juridique sur l'achat de bonus ; accord pour des illustrations générées (crédits).

## 12. Itération 3 de la boucle (2026-10-10, 4 h UTC)

**Corrigé**
- **Faille d'intégrité du solde** : le solde n'était sauvegardé qu'en fin de tour. Recharger la page pendant un tour perdant rendait la mise, et un gain pouvait être perdu pendant l'animation. Comme le résultat est décidé avant l'animation, la mise débitée et le gain décidé (`pending`) sont maintenant sauvegardés **dès le début du tour** ; après un rechargement, le gain est crédité une seule fois et un message l'indique. C'est le même principe que la reprise de round du web-sdk de Stake.
- **Tests d'interface dans le repo** : `node tools/e2e.js` (Chromium via playwright-core, outil de dev uniquement) enchaîne 30 tours dans les deux modes, 9 variantes de bonus, les 4 achats, et le scénario « rechargement en plein tour ». Je l'ai fait échouer volontairement sur l'ancienne version pour vérifier qu'il détecte le défaut.

**SWOT à jour**

| | |
|---|---|
| **Forces** | Maths testées (`check.js`) et interface testée (`e2e.js`), solde protégé contre le rechargement, 3 profils de jeu à RTP ≈ 96 %, DA cohérente, accessibilité de base, jeu responsable. |
| **Faiblesses** | Son jamais écouté ; fluidité mobile non mesurée sur appareil réel ; art procédural ; pas de progression ; le solde et le RNG restent côté navigateur (un joueur peut modifier le stockage local : démo seulement). |
| **Opportunités** | Profils de risque multiples ; reprise de round déjà alignée sur le modèle Stake ; illustrations générées (sur accord) ; contenu événementiel. |
| **Menaces** | Propriété intellectuelle ; contraintes Stake et achat de bonus selon les marchés ; cadre légal ; concurrence. |

**Bloqué** : validation de la propriété intellectuelle ; doc officielle Stake ; test sonore ; test sur vrai téléphone ; RNG et solde côté serveur avec audit ; avis juridique sur l'achat de bonus ; accord pour des illustrations générées.

## 13. Itération 4 de la boucle (2026-10-10, 8 h UTC)

**Corrigé (défauts prouvés par des tests qui échouaient avant)**
- **Clavier** : Espace/Entrée étaient interceptés même quand un bouton avait le focus ; appuyer sur Espace avec « Turbo » focalisé lançait un tour au lieu d'activer Turbo. Désormais un bouton focalisé garde son comportement natif, et après un clic souris le focus est rendu pour qu'Espace reste « tourner ».
- **Fenêtres modales** : le focus entre dans la fenêtre, Tab y reste piégé, Échap la ferme et rend le focus au bouton d'origine.
- **Zoom** : `user-scalable=no` retiré de la balise viewport (le zoom au pincement est maintenant possible ; le double-tap reste neutralisé par `touch-action: manipulation`).
- Au passage, un bug introduit par moi pendant ce travail (remplacement global qui rendait `showModal` récursif) a été attrapé par les nouveaux tests avant tout push.

`node tools/e2e.js` couvre maintenant 12 contrôles (tours, bonus, achats, reprise après rechargement, clavier, focus des fenêtres, menu d'achat).

**SWOT à jour**

| | |
|---|---|
| **Forces** | Maths et interface testées automatiquement, solde protégé, accessibilité clavier/lecteur d'écran/mouvement réduit, 3 profils de jeu à RTP ≈ 96 %, DA cohérente, jeu responsable. |
| **Faiblesses** | Son jamais écouté ; fluidité mobile non mesurée sur appareil réel ; art procédural ; pas de progression ; solde et RNG côté navigateur ; contraste des textes secondaires non audité formellement. |
| **Opportunités** | Profils de risque multiples ; reprise de round alignée sur Stake ; illustrations générées (sur accord) ; contenu événementiel. |
| **Menaces** | Propriété intellectuelle ; contraintes Stake et achat de bonus selon les marchés ; cadre légal ; concurrence. |

**Bloqué** : validation de la propriété intellectuelle ; doc officielle Stake ; test sonore ; test sur vrai téléphone ; RNG et solde côté serveur avec audit ; avis juridique sur l'achat de bonus ; accord pour des illustrations générées.

## 14. Itération 5 de la boucle (2026-10-10, 12 h UTC)

**Mesuré puis corrigé : le contraste des textes** (`node tools/contrast.js`, WCAG AA : 4,5 pour le texte normal, 3 pour le grand texte, 23 couples texte/fond testés).
- Défaut réel : le texte « TOURNER » du bouton principal tombait à **2,2:1** dans le coin le plus sombre du dégradé doré, et trois autres couples (bouton « Acheter », boutons des cartes d'achat, libellé 0,25× de la roue) étaient entre 4,2 et 4,4.
- Correction : dégradés dorés éclaircis (le point le plus sombre passe de `#6d4f10` à `#b8861e`), texte plus sombre (`#140a00` / `#1a0f00`), libellé 0,25× plus clair. Tous les couples passent (plus petit ratio : 3,1 sur des libellés de roue, au-dessus du seuil de 3).
- Le test vérifie aussi que les couleurs testées sont bien celles du CSS et de `game.js`, pour qu'il ne dérive pas.

**Limites de cette mesure** : seuls les couples listés sont testés (pas les textes posés sur des effets lumineux ou des dégradés animés du canvas) ; aucun test de daltonisme ; mesure théorique, pas un audit avec utilisateurs.

**SWOT à jour**

| | |
|---|---|
| **Forces** | Maths, interface et contrastes testés automatiquement ; solde protégé ; accessibilité clavier, lecteur d'écran, mouvement réduit, zoom ; 3 profils de jeu à RTP ≈ 96 % ; DA cohérente ; jeu responsable. |
| **Faiblesses** | Son jamais écouté ; fluidité mobile non mesurée sur appareil réel ; art procédural ; pas de progression ; solde et RNG côté navigateur ; daltonisme non évalué. |
| **Opportunités** | Profils de risque multiples ; reprise de round alignée sur Stake ; illustrations générées (sur accord) ; contenu événementiel. |
| **Menaces** | Propriété intellectuelle ; contraintes Stake et achat de bonus selon les marchés ; cadre légal ; concurrence. |

**Bloqué** : validation de la propriété intellectuelle ; doc officielle Stake ; test sonore ; test sur vrai téléphone ; RNG et solde côté serveur avec audit ; avis juridique sur l'achat de bonus ; accord pour des illustrations générées.

## 15. Itération 6 de la boucle (2026-10-10, 16 h UTC)

**Trouvé en balayant 10 tailles d'écran (`node tools/layout.js`) : le jeu était cassé en paysage de téléphone** (844×390, 667×375, 740×360).
- Le HUD gardait la mise en page empilée des petits écrans : 118 à 193 px de haut (plus de la moitié de l'écran), la roue tombait au rayon minimum, passait sous le HUD et, à 740×360, était coupée en haut.
- Les bonus étaient inutilisables : le Plinko était un petit triangle, la Chambre du Trésor et la Pesée débordaient sous le HUD.

**Corrigé**
- HUD en une seule rangée compacte en paysage (67 px), bandeau et en-tête réduits ; calcul de la roue adapté (R de 90 à 110–124 px, HUD ≤ 25 % de la hauteur).
- Bonus : réserves verticales réduites (`T0()`/`EX()`), total déplacé en haut à droite, balance plus compacte, multiplicateur de la Main d'Anubis à gauche, étiquettes PLUME/CŒUR retirées en compact (l'icône suffit).
- `tools/layout.js` ajouté : il échoue sur l'ancienne version (3 tailles) et passe sur la nouvelle (10 tailles). Il contrôle roue/HUD/débordements et que les 3 bonus à plateau se lancent et se terminent sans erreur ; la géométrie fine des bonus reste vérifiée à l'œil (captures sur 667×375).

**Limites** : mesuré dans Chromium avec des tailles émulées, pas sur de vrais téléphones (encoches, barres du navigateur, clavier virtuel) ; la roue reste petite en paysage (R ≈ 110–124 px) faute de hauteur.

**SWOT à jour**

| | |
|---|---|
| **Forces** | Maths, interface, contrastes et mises en page testés automatiquement (10 tailles, portrait et paysage) ; solde protégé ; accessibilité clavier/lecteur d'écran/mouvement réduit/zoom ; 3 profils de jeu à RTP ≈ 96 % ; DA cohérente ; jeu responsable. |
| **Faiblesses** | Son jamais écouté ; vrais téléphones jamais essayés (encoches, barres système) ; roue petite en paysage ; art procédural ; pas de progression ; solde et RNG côté navigateur. |
| **Opportunités** | Profils de risque multiples ; reprise de round alignée sur Stake ; illustrations générées (sur accord) ; contenu événementiel. |
| **Menaces** | Propriété intellectuelle ; contraintes Stake et achat de bonus selon les marchés ; cadre légal ; concurrence. |

**Bloqué** : validation de la propriété intellectuelle ; doc officielle Stake ; test sonore ; test sur vrais téléphones ; RNG et solde côté serveur avec audit ; avis juridique sur l'achat de bonus ; accord pour des illustrations générées.

## 16. Itération 7 de la boucle (2026-10-10, 20 h UTC)

**Audit de la traduction (`node tools/i18n-check.js`)**
- Les dictionnaires FR et EN sont alignés (mêmes clés, mêmes types, pas de texte vide).
- **Défaut réel trouvé : une information fausse affichée au joueur.** La table des gains annonçait la Pesée du Cœur « jusqu'à 200× » alors que le maximum réel est **150×** (le menu d'achat disait déjà 150×). Cause : des descriptions françaises/anglaises écrites en dur dans `main.js`, en double de celles du dictionnaire.
- Corrigé : la table des gains réutilise les descriptions du dictionnaire (une seule source). Le contrôle compare maintenant les maxima affichés (Scarabées 25×, Pesée 150×, plafond 5 000×) aux valeurs réelles de `math.js`, en FR et en EN, et repère tout français écrit en dur dans le code.
- `e2e.js` vérifie en plus la bascule FR → EN (HUD traduit, table des gains sans accent résiduel, bon maximum). Le test échoue sur l'ancienne version.

**Limites** : la qualité des traductions (ton, justesse) n'est pas évaluée par une personne ; seules la complétude et les chiffres le sont. Aucune autre langue n'existe.

**SWOT à jour**

| | |
|---|---|
| **Forces** | Maths, interface, contrastes, mises en page et traductions testés automatiquement ; chiffres affichés vérifiés contre les maths ; solde protégé ; accessibilité ; 3 profils de jeu à RTP ≈ 96 % ; DA cohérente ; jeu responsable. |
| **Faiblesses** | Son jamais écouté ; vrais téléphones jamais essayés ; roue petite en paysage ; art procédural ; deux langues seulement, traductions non relues par une personne ; pas de progression ; solde et RNG côté navigateur. |
| **Opportunités** | Profils de risque multiples ; reprise de round alignée sur Stake ; autres langues (le dictionnaire est prêt) ; illustrations générées (sur accord) ; contenu événementiel. |
| **Menaces** | Propriété intellectuelle ; contraintes Stake et achat de bonus selon les marchés ; cadre légal ; concurrence. |

**Bloqué** : validation de la propriété intellectuelle ; doc officielle Stake ; test sonore ; test sur vrais téléphones ; relecture des traductions par une personne ; RNG et solde côté serveur avec audit ; avis juridique sur l'achat de bonus ; accord pour des illustrations générées.

## Itération graphique — illustrations Higgsfield (2026-10-10)

- Ajout de 4 illustrations (gpt_image_2, 1k, ≈0,5 crédit chacune) : gardiens d'Anubis (décor principal), chambre du trésor, salle du jugement, abîme des scarabées. Compressées en JPEG (≈60–85 Ko chacune).
- Chaque bonus a désormais son décor, avec voile sombre pour la lisibilité (`contrast`, `layout`, `e2e` passent).
- Repli : sans image, le décor vectoriel d'origine s'affiche.
- Risque à lever par l'utilisateur : droits d'usage commercial des images générées à vérifier dans les CGU Higgsfield avant une mise en ligne sur Stake.

## Itération graphique 2 — médaillon, gros gains, Main d'Anubis (2026-10-10)

- Nouvelles illustrations Higgsfield (gpt_image_2) : médaillon d'Anubis (moyeu des deux roues et gardiens de l'écran de gros gain), fond de gros gain (rayons, pièces), Main d'Anubis dorée (descend sur le bonus en rotation 180°, fusionnée en `screen`), œil d'Horus (disponible dans `img/`, pas encore utilisé).
- Toutes avec repli vectoriel si l'image manque. Poids total des images ≈ 0,6 Mo.

## Itération graphique 3 — logos de bonus (2026-10-10)

- Quatre logos illustrés (scarabée ailé, plume de Maât, pyramide d'améthyste, Main d'Anubis à l'orbe), utilisés sur la roue, l'intro de chaque bonus et les cartes d'achat. Le fond noir est rendu transparent au chargement (alpha selon la luminance), avec repli vectoriel si l'image manque.

## Itération graphique 4 — chiffres (2026-10-10)

- Cinzel a des chiffres elzéviriens (hauteurs variables, « 5 » qui descend) : peu lisibles en gros gains et sur les segments étroits. Les chiffres passent en Oswald 600/700 (condensée, chiffres alignés), détectés automatiquement (`G.isNum`) dans toutes les fonctions de texte du canvas, plus le HUD (solde, mise, prix d'achat).
- Les montants et multiplicateurs en or gagnent une épaisseur (ombre portée dure). Polices embarquées : +25 Ko.

## Itération graphique 5 — chiffres droits sur la roue (2026-10-10)

- Retour utilisateur : les chiffres radiaux n'étaient pas homogènes avec les logos (droits). Les valeurs de la roue sont maintenant droites dans leur segment, comme les logos, réduites pour tenir dans la largeur du secteur ; 0,25 et 0,5 s'affichent ¼ et ½ (plus étroits).

## Itération 6 — interactions dans les bonus (2026-10-10)

Principe : le résultat reste tiré avant l'animation (modèle Stake Engine) ; les interactions n'ont **aucun effet sur le gain** et ne sont jamais présentées comme de l'habileté. En turbo ou auto-play, tout est automatique ; sinon un délai de 7 s lâche/choisit à la place du joueur.
- **Chute des Scarabées** : le joueur vise (curseur/doigt) puis touche pour lâcher chaque scarabée ; un toucher pendant la chute l'accélère.
- **Pesée du Cœur** : pronostic du plateau le plus lourd (retour « pressentiment juste » ou non), purement ludique.
- **Main d'Anubis** : maintenir pour charger une jauge circulaire, relâcher pour lancer ; la puissance change la durée et le nombre de tours, jamais le segment.
- **Chambre du Trésor** : déjà un choix de coffres (inchangé).
- Risque : un joueur peut croire que viser/charger influence le gain ; le texte d'aide est neutre mais une mention dans les règles est à valider avec le conseil juridique.

## Itération 7 — Pesée : choisir avant de savoir, libellés de la roue (2026-10-10)

- Pesée du Cœur : les valeurs des deux plateaux sont cachées (×?). Le joueur choisit un plateau, puis la balance révèle les deux valeurs ; le gain est celui du plateau choisi. Le gain est tiré avant (modèle Stake Engine) : le tirage réattribue la valeur du gain au plateau choisi et l'autre valeur de la paire à l'autre, donc la distribution et le RTP sont inchangés (50 % faible / 50 % forte). Même mécanisme que le choix de coffres du trésor ; à signaler dans les règles et à valider juridiquement.
- Roue : ½ et ¼ remplacés par .5 et .25 (retour utilisateur), plus grands une fois ajustés à la largeur du segment.

## Itération graphique 6 — profondeur, « moins 2D » (2026-10-10)

- Parallaxe à trois plans : fond (±18 px, zoom 1,05), jeu (±5 px), frise fixe ; la caméra suit le pointeur ou l'inclinaison du téléphone, sinon un balancement lent ; désactivée avec `prefers-reduced-motion`.
- Roue : tranche de jante épaisse décalée selon la caméra, ombre de contact au sol, éclat de lumière qui suit la caméra (la roue tourne sous une source fixe), reflet spéculaire sur la jante, dôme de verre sur le moyeu, secteurs en creux (ombre intérieure + arête éclairée).
- Décor : deux nappes de brume à profondeurs différentes, poussière d'or en parallaxe.
- Bonus : dalles du trésor épaisses et surélevées au survol, chevilles/billes/cases du Plinko avec ombres portées, ombre de contact du socle de la balance, roue géante avec tranche et éclat.
- Limite : tout reste du canvas 2D (pas de WebGL) pour garder le poids et la compatibilité ; une vraie 3D (three.js) serait l'étape suivante si ce rendu ne suffit pas.

## Itération 8 — ambiance Hand of Anubis (2026-10-10)

- Écran d'accueil illustré (art clé généré, paysage et portrait) : titre en or, bouton ENTRER, mention démo/jeu responsable ; l'entrée déverrouille l'audio et lance l'ambiance. Désactivé en test automatisé (`navigator.webdriver`, `?debug`, `?nosplash`).
- Étalonnage : ombres violettes en haut, lueur turquoise du sol, vignette violette, braises turquoise et ambrées qui montent, vacillement des torches.
- Ambiance sonore procédurale : bourdon grave en ré (gamme phrygienne dominante), vent qui respire, cloches rares et battement sourd aléatoires. Non écoutée par l'auteur (environnement sans audio) : à valider à l'oreille.

## SWOT — Itération 9 (2026-10-10, après graphismes, interactions et ambiance)

| | Positif | Négatif |
|---|---|---|
| **Interne** | **Forces** — DA fidèle et cohérente (art généré, logos de bonus, médaillon, accueil, étalonnage violet/turquoise/or) ; profondeur (parallaxe, roue épaisse, éclat) ; 4 bonus distincts avec interactions (visée, choix à l'aveugle, charge, coffres) ; chiffres lisibles (Oswald) ; maths vérifiées (RTP ≈ 96 %, résultat tiré avant l'animation, modèle Stake Engine) ; tests automatisés (maths, contraste, i18n, mises en page, bout en bout) ; jeu responsable (limite de perte, rappel 30 min) ; achat de bonus ; FR/EN | **Faiblesses** — fichier ≈ 1,5 Mo (images en base64) ; rendu 2D simulant la 3D ; ambiance sonore non écoutée ni validée ; interactions testées à la souris seulement (pas sur vrai téléphone) ; certains « choix » sont cosmétiques (trésor, pesée, visée) et risquent d'être perçus comme de l'habileté ; ×/chiffres encore hétérogènes dans les bonus (cases du Plinko, totaux) ; pas de musique composée ; pas de tests automatiques pour les nouveaux gestes |
| **Externe** | **Opportunités** — Stake Originals/Engine : format rare de roue à bonus non live ; Hand of Anubis (Main d'Anubis) comme mécanique signature ; vraie 3D (three.js) possible ; musique/voix originales ; mode tournoi / missions ; traductions supplémentaires ; clips vidéo générés pour la promo | **Menaces** — droits d'usage commercial des images générées à vérifier (CGU Higgsfield) ; risque de ressemblance avec Crazy Time (Evolution) et avec le slot Hand of Anubis de Play'n GO (marque/DA) ; conformité des « choix » factices selon les juridictions ; achat de bonus interdit dans certains pays ; exigences techniques et d'audit de Stake non vérifiées ; perf sur téléphones modestes |

Priorités proposées : (1) valider droits des images et ressemblance IP, (2) test sur vrais téléphones + audio, (3) harmoniser les × restants, (4) ajouter des tests aux nouveaux gestes, (5) décider d'une vraie 3D.

## Itération 10 — bonus plus complexes, plus de suspense (2026-10-10)

Toujours : résultat tiré avant l'animation ; les actions du joueur n'ont aucun effet sur le gain.
- **Chute des Scarabées** : visée du lâcher, puis guidage gauche/droite à chaque cheville. Le « destin » n'accepte que les trajets menant à la case déjà tirée (contrainte : nombre de droites restant), sinon « LE DESTIN RÉSISTE ». Ralenti sur les deux dernières rangées et au rebond final. Une assertion console signale tout écart entre la case atteinte et le tirage.
- **Pesée du Cœur** : choix à l'aveugle, puis 7 s de pesée : la balance hésite, penche vers le plateau choisi puis revient (faux espoir si c'est perdu) ; les touchers donnent de l'élan, verdict inchangé.
- **Chambre du Trésor** : après le choix, 3 touchers pour briser le sceau (fissures, tension sonore et secousses).
- **Main d'Anubis** : charge de la jauge, rotation plus longue avec arrivée très lente sur le segment.
- Turbo / auto-play : tout reste automatique. Risque : ces gestes peuvent faire croire à une influence sur le gain ; textes d'aide neutres, validation juridique à faire.

## Itération 11 — HUD illustré et détails de la slot (2026-10-10)

- Menu du bas refait avec des éléments générés (cadre de basalte et d'or aux coins améthyste/turquoise, plaques gravées pour solde / mise / gain, bouton SPIN en or serti de gemmes, boutons-pilules aux cabochons turquoise). Découpés en WebP transparent (≈ 190 Ko), appliqués en `border-image` / fonds CSS ; adaptés portrait et paysage compact (`layout.js` passe).
- Détails : pointeur de la roue (scarabée ailé, rubis) sur les deux roues ; scarabée ailé comme bille et réserve du Plinko ; chevilles dorées ; pièces, sceptre d'Anubis, amulette ankh turquoise et crâne maudit sur les dalles du trésor.
- Non fait : manches successives dans la Pesée (demande « et oui fait » ambiguë) — à préciser si souhaité, la règle devra rester sans effet sur le gain.
- Poids : fichier unique ≈ 2 Mo.

## Itération 12 — vrai choix avant chaque bonus (2026-10-10)

- Avant chaque bonus tiré sur la roue ou acheté (hors Main d'Anubis), le joueur choisit un profil : **Prudent / Équilibré / Audacieux**. Les trois profils ont la **même espérance** (vérifiée par `tools/tune-profiles.js`, écarts ≤ 0,15 %) mais pas la même volatilité :
  - Scarabées : cases ×0,5–×13 / ×0,5–×25 / ×0,5–×75 (espérance 433/256 par bille, exacte).
  - Pesée : paires proches (max ×100) / d'origine (max ×150) / très écartées (max ×150, plus rares).
  - Trésor : malédiction 37 % / 48 % / 60 % par coffre ; gains qui suivent (poids calés par simulation).
- Modèle Stake Engine : les trois tirages sont dans le script du tour ; le choix révèle l'un d'eux. Le gain en attente est recalculé et sauvegardé au moment du choix (`G.onBonusChoice`). Turbo / auto-play : profil équilibré. Touches 1, 2, 3 et délai de 20 s (équilibré).
- RTP global inchangé (8 M de tours : 96,5 % standard, 96,1 % Oracle+, dans l'incertitude).
- Les règles en jeu l'annoncent (FR/EN).

## Itération 13 — validation des maths après les profils, tests des gestes (2026-10-11)

Corrigé : (1) le RTP standard avait dérivé à ≈ 96,5 % (10 séries × 10 M de tours, moyenne 96,5 %) : la chance d'Oracle du mode standard passe de 0,32 à 0,31 → **96,26 % (4 × 10 M)** ; Oracle+ **≈ 96,0 %** (3 × 10 M) ; achats de bonus 95,9–96,4 % (10 M chacun) ; STATS mis à jour. (2) Nouveau `tools/gestures.js` : 9 parties (3 bonus × 3 profils) jouées au clavier et à la souris, sans blocage ni erreur.

**SWOT**
- Forces : DA et profondeur, 3 profils de risque à espérance égale, bonus interactifs, maths revalidées, 6 suites de tests.
- Faiblesses : fichier ≈ 1,9 Mo ; audio jamais écouté ; pas testé sur vrai téléphone ; choix cosmétiques (trésor, pesée, visée) à encadrer ; HUD et fenêtres secondaires encore à harmoniser.
- Opportunités : renommer et habiller l'univers de façon originale ; format Stake Engine ; musique originale ; vraie 3D.
- Menaces / bloqué (dépend de l'utilisateur ou d'un tiers) : nom « Hand of Anubis » (Play'n GO) et ressemblance Crazy Time → avis juridique ; droits des images générées ; exigences Stake (RNG serveur, audit) non vérifiées ; achat de bonus interdit selon les pays.

## Itération 14 — fenêtres harmonisées (2026-10-11)

Corrigé (code seul, sans nouvelle image) : les fenêtres Règles / Achat de bonus / Limites reprennent le cadre de basalte du menu du bas et les plaques gravées sur les cartes d'achat (portrait et paysage vérifiés, contraste inchangé).

**SWOT (mis à jour)** — Forces : DA homogène du menu aux fenêtres, 3 profils de risque, bonus interactifs, maths revalidées, 6 suites de tests. Faiblesses : fichier ≈ 1,9 Mo ; audio jamais écouté ; pas de test sur vrai téléphone ; les × restent hétérogènes dans les bonus (en attente de la décision de l'utilisateur). Opportunités : nom et habillage originaux, format Stake Engine, musique originale, vraie 3D. Menaces / bloqué : nom « Hand of Anubis » (Play'n GO) et ressemblance Crazy Time (avis juridique) ; droits des images générées ; exigences Stake (RNG serveur, audit) ; légalité de l'achat de bonus.

## Itération 15 — poids du fichier (2026-10-11)

Corrigé : les 9 fonds illustrés (décors, gros gain, accueil, médaillon, main) passent de JPEG à WebP (−183 Ko d'images) ; les logos découpés et la texture d'or restent en JPEG (le bruit WebP près du noir créerait des franges au détourage). Fichier unique : 1,94 → 1,81 Mo. Ajustement du libellé MISE, qui touchait l'ornement de la plaque.

**SWOT (mis à jour)** — Forces : DA homogène, 3 profils de risque, bonus interactifs, maths revalidées, 6 suites de tests, fichier plus léger. Faiblesses : 1,8 Mo restant (chaque image est déjà compressée : gain suivant = moins d'images ou images plus petites) ; audio jamais écouté ; pas de test sur vrai téléphone ; × hétérogènes dans les bonus (décision utilisateur attendue). Opportunités : nom et habillage originaux, format Stake Engine, musique originale, vraie 3D. Menaces / bloqué : nom « Hand of Anubis » (Play'n GO) et ressemblance Crazy Time ; droits des images générées ; exigences Stake (RNG serveur, audit) ; légalité de l'achat de bonus.

## Itération 16 — clôture de la boucle (2026-10-11)

Rien de nouveau n'était réellement corrigeable par du code : seule la documentation a été complétée (README : dossier `img/`, script de build). Aucune modification du jeu, donc pas de republication.

**État final (SWOT)** — Forces : DA et ambiance cohérentes (art généré, profondeur, accueil), 3 profils de risque à espérance égale, bonus interactifs, RTP vérifié (std ≈ 96,3 %, Oracle+ ≈ 96,0 %, achats 95,9–96,4 %), 6 suites de tests. Faiblesses : fichier ≈ 1,8 Mo ; × hétérogènes dans les bonus (décision attendue) ; gestes testés sans faute mais pas sur vrai téléphone. Opportunités : nom et habillage originaux, format Stake Engine, musique originale, vraie 3D. **Bloqué (utilisateur / tiers)** : nom « Hand of Anubis » (Play'n GO) et ressemblance Crazy Time → avis juridique ; droits commerciaux des images générées ; exigences Stake (RNG serveur, audit) ; écoute du son ; test sur vrais téléphones ; légalité de l'achat de bonus.

## Itération 17 — retours utilisateur (2026-10-12)

- Scarabées : plus de visée ni de guidage ; ils tombent seuls, de façon aléatoire, en vraie physique balistique : contact sur le flanc de chaque cheville, rebonds de hauteur variable, parfois un petit rebond sur place. Le côté de chaque rebond suit le script déjà tiré, donc la case finale reste celle du tirage (assertion console conservée).
- Mode **ULTRA** (bouton Turbo : arrêt → TURBO → ULTRA) : vitesse ×6, une manche se termine en ≈ 0,5 s ; le panneau de gros gain reste lisible (temps plafonné). Bonus automatiques.
- Compte à rebours de l'auto affiché sur le bouton AUTO (nombre qui diminue) ; coût Oracle+ affiché dans le bouton Oracle+ ; boutons − / + et textes SOLDE / MISE / GAIN recentrés dans leurs plaques.

## Itération 18 — retours utilisateur (2026-10-12)

- Turbo / Ultra : les bonus gardent maintenant une vitesse élevée (×3,4 en turbo, ×8 en ultra, puis retour à la vitesse du mode) ; en turbo un bonus passe de 9–13 s à 4–6 s, en ultra 2–3 s.
- L'auto-play ne s'arrête plus après un bonus par défaut (« Stopper l'auto sur bonus » passe à Non ; l'ancien réglage sauvegardé est ignoré, option toujours disponible dans les Règles). Vérifié : un bonus tombé en plein auto, le compteur continue jusqu'à 0.

## SWOT face aux concurrents (2026-10-12)

Compare Anubis Unchained aux jeux de [CONCURRENTS.md](CONCURRENTS.md) (Crazy Time, Monopoly Live, Mega Wheel, Wheel of Fortune Megaways, Book of Dead, Legacy of Dead, Cleopatra, Gates of Olympus, Sweet Bonanza, Plinko Stake). Les RTP des concurrents restent **non vérifiés** (sources faibles, aucune source primaire d'éditeur) : aucune comparaison chiffrée n'en est tirée. Légende : **[mesuré]** = simulation ou test automatisé du dépôt ; **[supposé]** = jugement ou hypothèse non vérifiée.

**Évolutions en cours (non encore mesurées, à re-simuler et re-tester à leur arrivée)** : refonte de la Pesée (plume contre cœur, le plus lourd gagne) ; refonte de la Fureur d'Anubis (choix de couleur, doublement, bandes de bonus) ; Trésor en un seul appui ; grand plateau des Scarabées. Tant que ces refontes ne sont pas validées, les chiffres de bonus ci-dessous (≈ 24,6× pour la Fureur, achats 95,9–96,4 %) sont ceux des versions précédentes.

### Forces

- Annonce de bonus en deux temps (la roue s'arrête, puis bouton « LANCER LE BONUS »), là où Crazy Time et Monopoly Live enchaînent le bonus sans geste du joueur [supposé : lecture des sources, pas de test live].
- Choix Prudent / Équilibré / Audacieux avant chaque bonus, à même espérance [mesuré : écarts ≤ 0,15 % par `tools/tune-profiles.js`]. Le Plinko de Stake propose un choix de risque comparable mais sans bonus.
- 4 bonus interactifs et distincts (Scarabées, Pesée, Trésor, Fureur d'Anubis) ; le bonus de Crazy Time est surtout spectateur [supposé].
- Achat de bonus avec prix en multiple de la mise (comme Gates of Olympus / Sweet Bonanza, qui annoncent 100x [non vérifié]) ; RTP des achats 95,9–96,4 % [mesuré].
- Mode Oracle+ (mise ×1,1) : RTP ≈ 96,0 % ; mode standard ≈ 96,3 % [mesuré, simulation de 10 millions de tours].
- Turbo / Ultra : une manche en ≈ 0,5 s en Ultra, bonus compris [mesuré en Chromium].
- Maths rejouables : noyau `js/math.js` pur, tour = script d'événements (modèle Stake Engine) ; 6 suites de tests (maths, i18n, contraste, mise en page 10 tailles, e2e, gestes) [mesuré].
- FR/EN complets, contraste WCAG AA vérifié, limite de perte et rappels de séance [mesuré par les outils du dépôt].

### Faiblesses

- Aucune certification ni audit tiers (laboratoire, régulateur) ; le RNG est `Math.random` côté client, donc inutilisable en argent réel [mesuré : lecture du code].
- Pas de live, pas d'animateur : l'attrait « spectacle partagé » de Crazy Time / Monopoly Live est hors de portée [supposé].
- RTP et volatilité non validés hors de nos simulations : la simulation vérifie le modèle codé, pas un échantillon réel ni un avis d'expert ; la volatilité affichée est une estimation (≈ 61 % de tours gagnants [mesuré]).
- Poids du fichier ≈ 1,8 Mo en mono-fichier [mesuré] ; performance sur téléphones modestes non testée sur appareil réel [supposé].
- Son jamais écouté par un humain ; test de gestes tactiles seulement simulé.
- Pas de multijoueur, pas de jackpot progressif ni de tournoi (les concurrents live partagent une table ; certains slots ont des progressifs) [supposé].
- Gain maximal modeste face à Sweet Bonanza (≈ 21 100x, non vérifié) : plafond global à 5 000x [mesuré].
- Nom « Anubis Unchained » non vérifié légalement ; images générées dont les droits commerciaux restent à confirmer.
- Refontes de bonus en cours : risque de régression des maths et des tests tant qu'elles ne sont pas validées.

### Opportunités

- Format rare de roue à bonus **non live** à maths ouvertes, adapté à Stake Engine (partage de revenus de 10 % du GGR cité, non vérifié).
- Thème égyptien saturé de slots à symbole expansif (Book of Dead, Legacy of Dead, Cleopatra) : se démarquer par « roue + 4 mini-jeux interactifs » plutôt que par le thème seul.
- Transparence : publier RTP et volatilité par mode, profil et achat dans l'écran d'info ; les sources concurrentes se contredisent, ce qui valorise un affichage exact.
- Drapeau de configuration par juridiction pour couper l'achat de bonus sans toucher au jeu.
- Musique et voix originales, vraie 3D, missions / tournois, traductions supplémentaires, clips promotionnels.

### Menaces

- Propriété intellectuelle : Crazy Time et Monopoly Live (Evolution) sont des marques et dispositifs protégés ; Gates of Olympus et Sweet Bonanza (Pragmatic Play) aussi. Toute ressemblance de roue, de bonus ou de présentation est un risque [supposé, avis juridique nécessaire].
- Juridictions : l'achat de bonus est interdit ou désactivé dans plusieurs marchés (France/Europe pour Gates of Olympus, Italie pour Sweet Bonanza, d'après des sources faibles) ; la présentation de « choix » à même espérance peut être jugée trompeuse selon les pays.
- Similarité de nom : le slot « Hand of Anubis » de Play'n GO a motivé le renommage ; « Anubis Unchained » doit être vérifié contre les marques et titres existants (non fait).
- Exigences techniques et d'audit de Stake non vérifiées (RNG serveur, certification).
- Concurrents établis : base de joueurs, licences, budgets marketing et studios live hors d'atteinte.

### 8 actions priorisées

1. **Avis juridique** sur le nom « Anubis Unchained » (recherche de marques, titres existants) et sur la ressemblance avec Crazy Time / Monopoly Live. Bloquant pour toute diffusion.
2. **Valider les droits commerciaux** des images générées (CGU Higgsfield) ou les remplacer.
3. **Terminer et re-valider les refontes en cours** (Pesée plume/cœur, Fureur d'Anubis, Trésor en un appui, grand plateau des Scarabées) : relancer `tools/simulate.js`, `tools/tune.js`, `tools/check.js`, `tools/tune-profiles.js` et mettre à jour les RTP d'achat et de profil.
4. **Lire la documentation officielle Stake Engine** et porter le noyau `js/math.js` (RNG serveur, format de tables), puis viser un audit externe.
5. **Afficher RTP et volatilité exacts** par mode, profil et achat dans l'écran d'info, avec la phrase « même espérance, volatilité différente ».
6. **Drapeau par juridiction** pour désactiver l'achat de bonus (et Oracle+ si besoin) sans modifier le jeu.
7. **Tester sur vrais téléphones** (performance, gestes, son) et poursuivre l'allègement du fichier (≈ 1,8 Mo).
8. **Renforcer la différenciation** : mettre en avant l'annonce en deux temps et les 4 bonus interactifs dans le titre et les visuels ; envisager musique originale, missions / tournois et une page de règles publiant les maths.

## Itération 19 — Pesée du Cœur : plume ou cœur, le plus lourd gagne (2026-10-12)

- Nouvelle règle : le joueur choisit la plume de Maât ou le cœur (cartes, touches 1/2), les multiplicateurs des deux plateaux défilent puis se figent (le plateau choisi en dernier), la balance pèse. Le plateau le plus lourd gagne SON multiplicateur, le plus léger n’a rien. Le joueur gagne donc 1 fois sur 2.
- Maths : `weigh()` renvoie `{ pair, mults, heavy, pick, total }` ; `heavy` est tiré 50/50 indépendamment des valeurs, `mults` = paire ×2 attribuée au hasard aux deux plateaux. Gain = `mults[pick]` si `pick === heavy`, sinon 0 (`M.weighGain`). Espérance par profil inchangée (5,8256 / 5,8258 / 5,8224) puisque 0,5 × 2 × moyenne des anciennes paires ; maximum réel ×300 (au lieu de ×150).
- Le script reste pré-tiré : `total` par défaut = choix « plume » ; la scène le recalcule au moment du choix et appelle `G.onBonusChoice()` pour mettre à jour le gain en attente sauvegardé.
