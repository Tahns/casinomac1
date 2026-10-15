# Anubis Unchained : dossier à remettre à un conseil en propriété industrielle

Date : 2026-10-15. Destinataire : avocat ou conseil en propriété industrielle (CPI). Auteur : Claude (assistant IA), à partir des fichiers du dépôt.

> **Avertissement (g).** Ce document n'est **pas un avis juridique**. Il décrit un jeu, l'historique de ses choix de conception et ce qui a été (ou non) vérifié. Aucune revendication de brevet n'a été lue. Aucun registre de marques n'a été consulté. Une absence de résultat dans une recherche par mots-clés ne prouve rien. Seul un professionnel qualifié peut apprécier un risque de contrefaçon, de trade dress ou de concurrence déloyale.

**Contexte de vérification.** Pendant la recherche (2026-10-13), seul `github.com` était joignable depuis l'environnement. Google Patents, Espacenet, USPTO, EUIPO TMview, WIPO Brand DB, les conditions Stake Engine et les conditions Higgsfield ont échoué (résolution DNS ou accès refusé). Tout ce qui concerne ces sources vient de résumés de moteur de recherche, donc de seconde main. Source détaillée : `docs/STAKE_ENGINE_CONFORMITE.md`, sections 1 et 3.

---

## (a) Description du jeu en langage clair

**Titre** : « Anubis Unchained ». Jeu d'argent virtuel du type « roue à bonus », une mise = un tour, destiné à être publié sur la plateforme Stake Engine (le résultat de chaque tour est tiré par le serveur de la plateforme ; le jeu ne fait que l'afficher). Thème : le jugement d'Anubis, temple d'obsidienne et d'or.

**Écran.** Une roue monumentale au centre, un médaillon d'Anubis au moyeu, un pointeur, un bandeau du bas avec solde, mise et gain, des boutons (Tourner, Auto, Turbo, Acheter un bonus, Oracle+, son, infos, langue). Décors illustrés différents pour chaque bonus. Interface en 16 langues.

**La roue : 64 cases.** 34 cases « 0 » (poussière), 4 cases ANKH (relance gratuite, 6 relances enchaînées au plus), 5 cases ×0,3, 7 cases ×0,5, 6 cases ×1, 3 cases ×2, 2 cases ×3, et 3 cases de bonus (Scarabées, Pesée, Trésor), une chacune (source : `js/math.js`, table `KINDS`). Gain maximal : 25 000 × la mise. Un bonus gagné peut être « saisi » par la Fureur d'Anubis (8 %) ou remplacé par le bonus secret (4 %).

**L'Oracle scellé.** Avant certains tours (29 % en mode standard, 69,8 % en mode Oracle+), l'Oracle désigne un **type de case** (par exemple « Trésor »). La **valeur** du boost (×2 à ×100) reste cachée (« ×? ») jusqu'à l'arrêt de la roue, puis elle est révélée, que la case soit atteinte ou non. Si la roue s'arrête sur le type désigné, le gain est multiplié (sur un bonus, le total du bonus est multiplié).

**Les cinq bonus.**

1. **Chute des Scarabées (cascade de chevilles).** Trois scarabées tombent chacun à travers 8 rangées de chevilles (chaque rebond est 50/50) et atterrissent dans l'une de 9 cases de gain. Le gain est la somme des trois cases (valeurs du profil standard : ×100, ×10, ×2,5, ×0,6, ×0,9, ×0,6, ×2,5, ×10, ×100).
2. **Pesée du Cœur.** Le joueur choisit la plume de Maât ou le cœur. Deux multiplicateurs sont révélés (un par plateau) ; la balance désigne le plateau le plus lourd (tirage 50/50, indépendant des valeurs). Le plateau le plus lourd gagne **son** multiplicateur ; si c'est celui du joueur il gagne, sinon 0. Maximum ×1 000.
3. **Chambre du Trésor (choix de coffres).** 12 coffres, 7 ouvrables au départ. Chaque coffre contient des pièces (+N), un **sceptre** (×2 sur le total), une **clé d'or** (+2 coffres à ouvrir, 10 au plus) ou le **sceau**, qui referme la chambre : le joueur **garde son total**. Jamais de sceau sur les deux premiers coffres. Chambre vidée : prime +5×. Aucun objet n'annule ni ne retarde le sceau.
4. **Fureur d'Anubis (roue géante).** Le joueur choisit une couleur (turquoise, or, rubis). La roue géante a 24 cases : des nombres, des cases **DOUBLE** (2 par couleur) et des **bandes** de bonus (×3 à ×12) qui lancent un des bonus ci-dessus. Nombre : gain = nombre × palier. DOUBLE de la couleur du joueur : tous les nombres sont doublés (palier ×2, jusqu'à ×16) et on relance. DOUBLE d'une autre couleur : la chaîne s'arrête et on encaisse le plus petit nombre (3) × palier. Les trois couleurs sont équivalentes en probabilités.
5. **Sanctuaire des Marées (bonus secret).** Grille 3×3 de 9 tablettes révélées une à une : TABLETTE (valeur × marée courante, ajoutée à l'offrande), MARÉE (multiplie la marée, seulement pour les tablettes suivantes), ÉCLIPSE (multiplie l'offrande déjà accumulée), POUSSIÈRE (rien). Gain = offrande finale (au moins ×1). Il remplace un bonus ordinaire environ 1 tour sur 500 ; il est décrit dans les règles du jeu.

**Modes d'achat et Oracle+.** 6 modes déclarés : Standard (×1 la mise), **Oracle+** (×1,1 la mise, Oracle plus fréquent), et 4 **achats de bonus** : Scarabées ×9,26, Pesée ×10,31, Trésor ×12,37, Fureur ×27,30 (confirmation obligatoire avant achat). RTP exact calculé (lois non optimisées) : 96,21 % / 96,10 % / 96,02 % / 96,02 % / 96,03 % / 96,01 % (`stake-math/README.md`). La table de production optimisée n'existe pas encore.

**Ce qui est du code original.** `js/math.js` (noyau des maths), le front en canvas 2D, le client de l'API de la plateforme, le portage Python `stake-math/`. Les sons sont synthétisés par WebAudio (`js/audio.js`, aucun fichier audio dans le dépôt).

---

## (b) Historique des changements de conception pour s'éloigner de jeux ou brevets existants

Source : `docs/STAKE_ENGINE_CONFORMITE.md` section « Contournements (design-around) » et `git log`. Chaque changement a conservé l'espérance (EV) du bonus concerné ; **aucun n'a été jugé suffisant par un juriste**.

| Date | Commit | Changement | Raison |
|---|---|---|---|
| 2026-10-09 | `009f05f` | Version initiale, nommée « Hand of Anubis », roue de 54 cases (48 par la suite), bonus « Main d'Anubis » | Point de départ, avant tout travail de PI |
| 2026-10-12 | `412001b` | Renommage en **Anubis Unchained** ; bonus 4 renommé **Fureur d'Anubis** | « Hand of Anubis » est un titre de Hacksaw Gaming (sortie 2022 selon SlotCatalog, source tierce) |
| 2026-10-14 | `217a4ff` | Retrait des restes de « Hand of Anubis » (fichiers `hand.webp`, `ic_hand.jpg` renommés `fury.webp`, `ic_fury.jpg` ; `HOA_BIG` devient `ANUBIS_BIG` ; mode interne `buy-hand` devient `buy-fury`) | Éviter la marque d'un tiers dans le dépôt public. L'identifiant interne `hand` subsiste dans le code (`js/imgs.js` : clés `hand`, `ic_hand`) |
| 2026-10-14 | `f87068b` | **Trésor sans anti-terminateur** : le jeton Ankh/Bouclier qui annulait la malédiction est supprimé, remplacé par la **clé d'or** (+2 coffres) ; la malédiction devient un **sceau** qui referme la chambre en laissant le joueur garder son total | L'ancien couple « terminateur / anti-terminateur » est le cœur des familles US7326114, US6632141, US6843722 (statut non confirmé). EV inchangée : 10,63× par profil ; prix d'achat inchangé (12,37×) |
| 2026-10-14 | `aecf071` | **Crypte d'Anubis devient Sanctuaire des Marées** : grille 3×3 de tablettes, offrande, marée, éclipse, au lieu de 5 colonnes verticales avec crânes, glace et broyeur, gain = moyenne des colonnes | L'ancien bonus ressemblait de près à « Hand of Anubis » (Hacksaw Gaming) : colonnes de multiplicateurs, blocs, glace, broyeur. EV exacte 10,2142× (bonus remplacé : 10,2143×) |
| 2026-10-14 | `4c9221d` | **Oracle scellé** : la valeur du boost n'est plus annoncée avant le tour (« ×? » jusqu'à l'arrêt) | Éviter l'annonce d'un multiplicateur de case avant le tour, proche du « top slot » d'Evolution (Crazy Time). Mécanique conservée (changer sa nature aurait imposé de recalibrer tout le RTP) |
| 2026-10-14 | `9026894` | Plus de « Plinko », « Pachinko », « top slot », « lightning » dans le code ; « cascade de chevilles », « mur de lumières », `Sfx.thunder` | Noms de jeux et marques connus |
| 2026-10-14 | `8246e2a` | Documentation du design-around, RTP exact avant/après (Standard 96,19 % → 96,21 %) | Traçabilité pour le conseil |
| 2026-10-14 | `af6c60c`, `714e3fe` | Format de résultat v2 : roue 64 cases, Pesée plume/cœur, Fureur 3 couleurs, gains en multiples de 0,1× | Exigence technique de la plateforme, pas de PI |

**Points non traités ou résiduels** (à soumettre au conseil) :
- L'idée « une case est désignée avant le tour » (Oracle) reste proche du « top slot » d'Evolution et de la demande US20240119797 (indicateur directionnel sur un segment déclenchant un second prix). Plan B documenté mais non fait : remplacer le boost par une bénédiction d'une autre nature (recalibrage complet du RTP).
- Le **sceau** reste un élément qui met fin à la sélection : à vérifier qu'une revendication large (« objet de fin de sélection ») ne le couvre pas.
- La **clé d'or** (+2 choix) : brevets sur les « choix supplémentaires » en sélection masquée non recherchés.
- La **Pesée** (plateau le plus lourd gagne) est proche d'un « Coin Flip » d'Evolution par sa structure 50/50 ; seul l'habillage (plume, cœur, balance) diffère.
- Le nom « Ankh » (case de relance) : « Ankh of Anubis » est un titre de Play'n GO.
- Le visuel `brand/stake-media/background-tile-3x4.png` était un visuel IA (main d'or ouverte) rapprochable de « Hand of Anubis » ; remplacé par un fond abstrait généré par script (dégradé, rayons, particules), sans personnage.

---

## (c) Brevets cités et jeux ou marques à comparer

### Brevets cités (statut NON confirmé, revendications NON lues)

Tous les numéros viennent d'extraits de recherche web. Aucune page Google Patents n'a pu être ouverte directement. Date de dépôt, expiration, frais de maintien, pays : **non vérifiés**.

| Numéro | Thème d'après l'extrait | Lien avec le jeu |
|---|---|---|
| US7326114 | « Anti-terminateur » : objet stocké qui annule un terminateur (pick-me) | Ancien Bouclier Ankh du Trésor, supprimé le 2026-10-14 |
| US6632141 | Famille terminateur / anti-terminateur (extrait non détaillé) | Idem |
| US6843722 | Sélection masquée avec terminateur | Chambre du Trésor (sceau) |
| US7314409 | Transformateurs de terminateur | Chambre du Trésor |
| US6582307, US6511375 | Sélection masquée, terminateur, dispositif mécanique | Chambre du Trésor |
| US11631301, US8460082, US10643435, US8597103, US8246445 | Roues à bonus (déclencheur par symboles, multiplicateurs, « terminateur de roue ») | Roue principale, Fureur d'Anubis |
| US20240119797 (demande) | Indicateur directionnel sur un segment qui déclenche un second prix | Oracle |
| US6220593 et familles « Pachinko stand-alone and bonusing game » (US6851674, US6896261, US6340158, US6398219, US6139013, US6047963, US7284756, US7052011) | Champ de chevilles avec gains, déclenché par un symbole | Cascade de chevilles (Scarabées) ; probablement expirés (non vérifié) |
| US9401071, US8152616 | Multiplicateurs de lignes de paiement (IGT) | Cumul de multiplicateurs (Fureur, Sanctuaire) ; le jeu n'a pas de lignes de paiement |
| US6471208 | Roue, cité comme expiré | Information de contexte |

Aucun brevet trouvé pour : Pesée, achat de bonus, bonus secret, « Hand of Anubis » (Hacksaw). **Ce « aucun trouvé » vient de recherches par mots-clés, il n'a pas de valeur probante.**

### Jeux et marques à comparer

| Élément | Ce qui a été trouvé | Vérifié ? |
|---|---|---|
| « Hand of Anubis » (Hacksaw Gaming) | Jeu de 2022 selon SlotCatalog ; colonnes de multiplicateurs, blocs, glace, broyeurs. Aucune marque ou brevet trouvé. Une confusion initiale l'attribuait à Play'n GO (corrigée) | Page SlotCatalog lue via recherche ; registres de marques et de brevets non consultés |
| « Ankh of Anubis » (Play'n GO) | Titre existant voisin | Non vérifié dans un registre |
| « Fury of Anubis », « Anubis Wrath » | Titres voisins sur des sites de contenu | Non vérifié ; « Fureur d'Anubis » est le nom d'un de nos bonus |
| Evolution : « Crazy Time », « Coin Flip », « Lightning », « Krazy Time », « Cash Hunt », « Pachinko » | Demande USPTO n° 79298685 « Crazy Time » (Evolution Malta, mai 2020, statut non confirmé) ; dépôts « Coin Flip » et « Krazy Time » listés par Justia | Liste Justia lue via recherche ; USPTO non ouvert. Ces mots ont été retirés du code |
| « Anubis Unchained » | Aucune marque ni jeu du même nom trouvé, mais résultats pauvres | **Registres non consultés** : recherche à faire (classes 9, 28, 41) |
| Marques « Anubis » classes 9 / 28 / 41 | Non recherchées | **Non vérifié** (réseau limité) |
| « Weighing of the Heart », « Treasure Vault », « Oracle » | Termes descriptifs ou mythologiques, déjà utilisés par d'autres jeux selon des extraits | Non vérifié |
| « Stake », « Stake Engine » | Marques de leurs titulaires | Usage descriptif seulement ; pas de partenariat sans accord |

**Concurrents à lister comme titulaires potentiels** : Evolution Malta, Hacksaw Gaming, Play'n GO, IGT, Everi, Aristocrat, Pragmatic Play. Détail des jeux étudiés : `docs/CONCURRENTS.md` (RTP des concurrents non vérifiés, sources faibles, aucune source primaire d'éditeur).

---

## (d) Éléments à protéger

| Élément | État | Remarques |
|---|---|---|
| **Nom « Anubis Unchained »** | Utilisé depuis le 2026-10-12 (`412001b`) ; titre de page : `<title>Anubis Unchained</title>` (`index.html`) | Pas de recherche d'antériorité faite. « Anubis » est descriptif du thème, donc peu distinctif |
| **Logo et bannière** (`brand/`) | `anubis-unchained-banner.png` (2400×800), `anubis-unchained-icon.png` (1024×1024), `anubis-unchained-logo-white.png` (monochrome blanc, fond transparent), `medal.webp` ; sources `banner.html`, `icon.html`, `wordmark.html`. Visuels pour le Media Editor : `brand/stake-media/` (tuile 3:4, fond 16:9, médaillon, médaillon blanc, titre blanc) | Le titre est composé en police Cinzel (OFL). Le **médaillon d'Anubis** au centre est une image générée par IA (voir ci-dessous), donc le logo hérite de la question des droits d'auteur sur l'image IA. La bannière et l'icône ont été « rendues localement, sans IA générative » (commit `a5ac3f1`) mais à partir de ce médaillon (`aad9a67`). **Origine exacte des fonds de `brand/stake-media/`** (tuile, large) : non documentée dans le dépôt, à confirmer |
| **Code** | `js/`, `css/`, `index.html`, `tools/`, `stake-math/` | Écrit pour ce projet (`docs/ANALYSE.md` §2 : aucun code tiers copié). `stake-math/` suit la structure du `math-sdk` de Stake (licence MIT, copyright 2025 Stake Engine) : `verify.py` reprend des contrôles de `utils/rgs_verification.py`. **L'avis MIT n'est pas dans le dépôt** (aucun fichier `LICENSE` ou `NOTICE`) : à ajouter si du code du SDK est repris |
| **Textes** | 16 langues (ar, de, en, es, fi, fr, hi, id, ja, ko, pl, pt, ru, tr, vi, zh), règles, mode social | Écrits par Claude ; **traductions non relues par des locuteurs natifs** (`docs/TRADUCTIONS.md`). L'avertissement général est repris de l'anglais fourni par la plateforme. Question de titularité des textes écrits par une IA à poser au conseil |
| **Sons** | Synthèse WebAudio (`js/audio.js`) | Aucun échantillon tiers, aucun fichier audio dans le dépôt (vérifié : aucune référence `.mp3`, `.wav`, `.ogg` dans `js/`). Le son n'a jamais été écouté par une personne |
| **Images** | 27 fichiers dans `img/` (décors, icônes, cadres, logo, médaillon, accueil) + 5 dans `brand/stake-media/` | Voir ci-dessous |
| **Polices** | Cinzel et Philosopher (`fonts/`, 5 fichiers `woff2`, sous-ensembles latins) | Voir ci-dessous |
| **Mécaniques** | Voir (a) et (e) | Les règles de jeu sont en général peu protégeables par le droit d'auteur ; brevetabilité à apprécier |

### Images générées par IA (Higgsfield)

- **Origine.** Les fichiers de `img/` ont été ajoutés entre le 2026-10-10 et le 2026-10-13 (commits `e24d30c`, `7c6bd4b`, `89e7573`, `56c0320`, `ee2e275`, `f2cb89b`, `459217b`), par génération avec Higgsfield (modèle `gpt_image_2` cité dans `docs/ANALYSE.md` ; une texture « martelée » aussi). Les **prompts de ces fichiers ne sont pas tous conservés dans le dépôt** : non vérifié, à reconstituer depuis l'historique du compte Higgsfield.
- **Lot documenté.** `docs/ASSETS_HIGGSFIELD.md` (2026-10-13) conserve, pour **31 images**, la bible de style, le prompt exact, le `job_id`, l'URL du résultat et un verdict, générées avec `gpt_image_2_5` (qualité haute). Ces images n'ont pas pu être téléchargées (le domaine cloudfront renvoyait 403) : **leurs fichiers ne sont pas dans le dépôt**, certaines n'ont pas de branchement dans `js/imgs.js`. Ne pas affirmer que les 27 fichiers de `img/` sont ces 31 images.
- **Droits d'usage.** Selon le centre d'aide Higgsfield (lu via recherche, **non ouvert directement**) : la plateforme ne revendique pas la propriété des sorties et ne limite pas l'usage commercial, sous réserve d'avoir les droits sur les entrées ; les sorties à filigrane peuvent être inadaptées ; conditions mises à jour en juillet 2026 (applicables aux comptes existants depuis le 27 août 2026, d'après la recherche). **Les conditions n'ont pas été lues intégralement.** Le plan payant (sans filigrane) utilisé pour chaque image n'est pas documenté : à rassembler.
- **Originalité humaine.** Le rapport du Copyright Office américain (Partie 2, 29 janvier 2025, lu via un résumé) indique qu'une œuvre produite par IA sans contribution humaine suffisante n'est pas protégée ; des prompts seuls ne suffisent pas. Un concurrent pourrait copier ces images sans recours facile. L'apport humain dans ce projet (retouches, détourage, composition, rendu du logo en HTML/CSS) existe mais n'est pas documenté image par image. Position en droit européen : **non étudiée**.
- **Ressemblance involontaire.** Une image IA peut ressembler à un visuel existant. Les images clés n'ont pas été comparées à des visuels de jeux concurrents. Les fonds Stake (`brand/stake-media/background-*.png`) sont désormais abstraits et générés par script : plus de risque « Hand of Anubis » de ce côté.
- **Entrées de référence.** Si des images de référence ont été envoyées à Higgsfield, leur origine n'est pas documentée : non vérifié.

### Polices (SIL OFL 1.1)

Cinzel (Natanael Gama) et Philosopher (Alexei Vanyashin), fichiers issus des paquets npm `@fontsource/*` (`docs/ANALYSE.md`, section « Polices et licences »). Obligations de l'OFL 1.1 : usage commercial et intégration autorisés ; **joindre le texte de la licence et l'avis de copyright** avec toute redistribution ; ne pas vendre la police seule ; si un « nom de police réservé » est déclaré, une version modifiée ne doit pas porter ce nom. Les fichiers du dépôt sont des **sous-ensembles latins**, donc des versions modifiées. **État : aucun fichier `OFL.txt` ni avis de copyright n'est dans le dépôt** (recherche faite : « OFL » n'apparaît que dans la documentation). Présence d'un nom réservé : **non vérifiée**. À corriger avant publication.

---

## (e) Questions précises à poser au conseil

**Marque**
1. Le nom « Anubis Unchained » est-il disponible et enregistrable pour des jeux d'argent en ligne et logiciels de jeux (classes 9, 28, 41, et éventuellement 35, 36 ?), dans quels territoires (UE, Royaume-Uni, États-Unis, Canada, marchés visés par la plateforme) ? Recherche d'antériorité sur « Anubis » seul et sur les titres proches (« Ankh of Anubis », « Fury of Anubis », « Anubis Wrath »).
2. Les noms de bonus (« Fureur d'Anubis », « Chute des Scarabées », « Pesée du Cœur », « Chambre du Trésor », « Sanctuaire des Marées », « Oracle », « Oracle+ », « Jugement divin », « Ankh ») posent-ils un risque ? Faut-il les déposer ou les changer ?
3. Le logo (médaillon d'Anubis) est-il déposable comme marque figurative, compte tenu de son origine IA ?

**Liberté d'exploitation (FTO)**
4. Pouvez-vous faire une recherche de liberté d'exploitation (US, UE, pays visés) sur : roue à multiplicateurs avec désignation d'une case avant le tour ; pick-me avec objet de fin de sélection et objet qui allonge la sélection ; cascade de chevilles ; multiplicateurs cumulatifs ; grille de tablettes à multiplicateur de « marée » ? Titulaires à cibler : Evolution Malta, Hacksaw Gaming, Play'n GO, IGT, Everi, Aristocrat, Pragmatic Play.
5. Statut (dépôt, expiration, frais de maintien, pays) et **revendications** de US7326114, US6632141, US6843722, US6582307, US7314409, US6511375, US20240119797, et des familles listées en (c). Le sceau (fin de sélection sans anti-terminateur) sort-il du champ des revendications ?
6. Un second changement de l'Oracle (plan B) est-il nécessaire ?

**Brevetabilité de nos mécaniques**
7. Selon l'UE (OEB, méthodes de jeu, exclusion des méthodes dans l'exercice d'activités économiques et des programmes d'ordinateur « en tant que tels ») et les États-Unis (Alice/§ 101 pour les méthodes de jeu de hasard), une de nos mécaniques (Oracle scellé, clé d'or, Sanctuaire des Marées) mérite-t-elle une demande ? Une publication préalable (le dépôt GitHub est-il public ? non vérifié) risque-t-elle de détruire la nouveauté ?

**Trade dress et concurrence déloyale**
8. L'ensemble « roue de jugement + Oracle + bonus à plateaux + habillage Anubis noir et or aux yeux turquoise » est-il trop proche d'un jeu connu (Evolution, Hacksaw, Play'n GO) ? Les critères de la plateforme parlent d'une ressemblance sur au moins deux éléments parmi titre, logo, personnage, thème, mécanique, présentation (guideline [253] de la checklist « Engine game review » ; verdict « à juger par une personne »). Que dites-vous du fond « main d'or » ?

**Droits sur les images et les textes générés**
9. Quels droits avons-nous sur des images générées par Higgsfield ? Faut-il lire et archiver les conditions applicables au moment de la génération ? Quelle preuve d'apport humain conserver ? Que penser de la Partie 2 du rapport du Copyright Office et de la situation européenne ?
10. Même question pour les textes (règles, 16 langues) rédigés par une IA.
11. Faut-il remplacer les images les plus exposées (médaillon, fond d'accueil) par des créations d'un illustrateur, avec cession de droits ?

**Conditions de la plateforme**
12. Pouvez-vous relire les conditions développeur de Stake Engine : cession ou licence du jeu, exclusivité, droit de retrait, garanties de non-contrefaçon, indemnisation en cas de litige de PI, partage de revenus (10 % du GGR en partage de profit, 7,5 % du GGR attendu en option garantie, selon des résumés non vérifiés) ?
13. Licences open source : avis MIT du `math-sdk` à joindre ? Obligations OFL pour les polices ?

---

## (f) Pièces jointes à rassembler

Fichiers du dépôt :
- `docs/DOSSIER_PI.md` (ce document) et `docs/STAKE_ENGINE_CONFORMITE.md` (sections 3 et « Contournements »)
- `docs/CONCURRENTS.md`, `docs/ANALYSE.md` (historique du jeu, section « Polices et licences »), `docs/ANALYSE_MACHINE.md`
- `docs/ASSETS_HIGGSFIELD.md` (31 prompts et `job_id`), `docs/TRADUCTIONS.md`
- `js/math.js` (règles exactes), `stake-math/README.md` (modes, RTP, format)
- `brand/` (logo, bannière, icône, médaillon, sources HTML) et `brand/stake-media/`
- `img/` (27 images) et `fonts/` (5 fichiers `woff2`)
- Sortie de `git log --format='%h %ad %s' --date=short` (dates de création : première version le 2026-10-09, `009f05f`)
- Captures d'écran du jeu (à produire : accueil, roue, chaque bonus)

À rassembler hors dépôt (non disponibles dans le dépôt) :
- Historique Higgsfield : prompts, `job_id`, dates et plan de chaque image de `img/` et de `brand/stake-media/` ; copie des conditions Higgsfield en vigueur à chaque date de génération ; preuve du plan payant sans filigrane
- Conditions développeur Stake Engine (copie datée du tableau de bord)
- Licences : texte OFL 1.1 et avis de copyright de Cinzel et Philosopher ; licence MIT du `math-sdk`
- Preuves de retouche humaine des images (fichiers sources, calques, captures)
- Résultats des recherches de marques et de brevets une fois faites

---

## (g) Rappel

Ce dossier est une aide à la préparation. Il ne contient aucun avis juridique, aucune garantie de non-contrefaçon et aucune conclusion sur la validité ou l'expiration d'un brevet ou d'une marque. Tout ce qui est marqué « non vérifié » doit l'être par le conseil ou par l'utilisateur avant toute décision.
