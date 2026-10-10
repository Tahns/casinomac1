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

## 9. Achat de bonus

Le joueur choisit **au départ** : jouer la roue, ou acheter directement un bonus (Pyramide/Trésor, Scarabées, Pesée, Main d'Anubis), à un prix plus élevé que la mise normale. Le bonus s'ouvre aussitôt, sans passer par la roue. Prix = mise × multiplicateur, calé sur l'espérance réelle du bonus (la Main d'Anubis peut toujours saisir un bonus acheté, avec la même probabilité que sur la roue ; aucun boost Oracle à l'achat).

| Bonus | Prix (× mise) | RTP simulé (2 graines × 10 M) |
|---|---|---|
| Chute des Scarabées | 6,9 | 96,3 % |
| Pesée du Cœur | 7,6 | 96,4 % |
| Chambre du Trésor (pyramide) | 9,1 | 95,7 % |
| Main d'Anubis | 25,6 | 96,3 % |

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
