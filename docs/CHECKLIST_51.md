# Checklist Stake Engine (texte original) : audit du front

Texte source : la liste collée par l'utilisateur (« 0 des 51 directives cochées »), libellés d'origine, numérotés dans l'ordre. **Le texte collé ne contient que 50 cases** sous l'intitulé « 51 » : une case n'a pas été collée (ou l'en-tête compte autrement) ; à comparer au tableau de bord Stake.

Jeu = roue à bonus : les points propres aux rouleaux, scatters et free spins sont transposés (cases, relances Ankh / Fureur). Aucune modification des maths, aucun test désactivé.

Statuts : **OK vérifié** (preuve citée, test vert) ; **non vérifiable ici** (appareil réel, jugement humain) ; **à faire par le propriétaire** (tableau de bord / processus Stake). Défauts corrigés lors des passes précédentes : voir fin.

Validation de cette passe, tous verts : check, i18n-check, contrast, social-check, conformite, e2e, layout, gestures, stake-build-test.


### Pré-vérifications

| n° | Directive | Statut | Preuve |
|---|---|---|---|
| 1 | Le jeu s'authentifie avec succès auprès de RGS au lancement. | OK vérifié | js/main.js `startRgs` ; rgs-test [181] |
| 2 | L'authentification du jeu échoue correctement avec une URL rgs invalide. | OK vérifié | conformite.js : 6 URL invalides (`notaurl`, `ftp://`, `javascript:`, `http://`, port fermé, hôte inexistant) -> message, jeu bloqué, aucune mise ; `js/rgs.js` `normalizeUrl` ; rgs-test [274] |
| 3 | Cliquer sur le bouton de pari envoie une requête de jeu réussie à RGS. | OK vérifié | conformite.js (desktop, mobile, Popout : appui réel -> `/wallet/play`) ; rgs-test |
| 4 | Le jeu ne doit pas contenir le chargeur de moteur à pieux. (libellé traduit, probablement « Pixi » ou un chargeur de moteur tiers) | OK vérifié | aucune bibliothèque Pixi / Spine / Phaser / GSAP / Three (grep du dépôt : seule mention dans `docs/ANALYSE.md`) ; canvas 2D maison ; aucun écran de chargement ; stake-build-test. Libellé exact à confirmer dans le tableau de bord |

### Contrôles de conformité

| n° | Directive | Statut | Preuve |
|---|---|---|---|
| 5 | Le titre du jeu est unique et n'utilise pas de termes restreints. | à faire par le propriétaire | `<title>` = « Anubis Unchained » ; unicité à vérifier dans le catalogue Stake (`GUIDE_PUBLICATION.md`) |
| 6 | Les éléments et images du jeu ne contiennent aucun contenu offensant ou inapproprié. | non vérifiable ici | relecture humaine ; aucun contenu sensible repéré (`GUIDE_PUBLICATION.md`) |
| 7 | Le jeu se distingue suffisamment des titres et séries existants. | à faire par le propriétaire | jugement Stake / conseil PI (`DOSSIER_PI.md`, `CONCURRENTS.md`) |

### Miniature du jeu

| n° | Directive | Statut | Preuve |
|---|---|---|---|
| 8 | La miniature du jeu respecte les directives graphiques de Stake. | non vérifiable ici | `brand/stake-media/` : fonds 16:9 (1920×1080) et 3:4 (1200×1600) sans alpha, sans personnage ni texte ; médaillon 1024² et titre PNG transparent. Dimensions exactes et champs du Media Editor non lisibles ici ; à téléverser par le propriétaire |

### Exigences rgs — niveaux de mise

| n° | Directive | Statut | Preuve |
|---|---|---|---|
| 9 | Le jeu utilise dynamiquement tous les paramètres de mise issus de la réponse d'authentification. | OK vérifié | `betLevelsFrom` ; rgs-test [242] |
| 10 | Les tours actifs rétablissent le montant de la mise à partir de la réponse d'authentification. | OK vérifié | `startRgs` (`rd.amount`) ; rgs-test [187] |

### Soutien monétaire

| n° | Directive | Statut | Preuve |
|---|---|---|---|
| 11 | Le jeu prend en charge et affiche correctement les devises. | OK vérifié | `js/currency.js` ; rgs-test (JPY, XSC…) |
| 12 | Le jeu affiche correctement les gains inférieurs au centime. | OK vérifié | conformite.js : 0,005 $ -> « $0.005 », 0,0005 -> « $0.0005 », 0,5 ¥, 0,005 SC |

### Demandes rgs

| n° | Directive | Statut | Preuve |
|---|---|---|---|
| 13 | Les paris à gain nul n'envoient pas de requête de fin de tour au RGS. | OK vérifié | `js/main.js` (`end-round` seulement si gain > 0) ; rgs-test [221] |
| 14 | Les mises avec un solde insuffisant n'envoient pas de requête de jeu au RGS. | OK vérifié | `js/main.js` (coût réel : mode, achat) ; rgs-test [222] |

### Exigences du frontend

| n° | Directive | Statut | Preuve |
|---|---|---|---|
| 15 | La barre d'espace devrait être associée au bouton de pari. | OK vérifié | conformite.js (Espace = 1 requête ; touche maintenue ignorée ; fenêtres ouvertes : sans effet) |
| 16 | La fenêtre principale du jeu ne devrait pas être défilable. | OK vérifié | `html,body{overflow:hidden}` ; conformite.js (scrollTo, PageDown/End, molette sans effet, 6 formats) ; layout.js |

### Règles du jeu

| n° | Directive | Statut | Preuve |
|---|---|---|---|
| 17 | Le taux de redistribution (RTP) et le gain maximal sont clairement indiqués dans les règles du jeu. | OK vérifié | `js/rules.js` (RTP par mode, gain max 25 000×) ; conformite.js ; i18n-check |
| 18 | Les informations relatives aux gains par symbole doivent être clairement communiquées. (transposé : gains par case et par bonus de la roue) | OK vérifié | table des cases (`openInfo`), valeurs des bonus (`rules.js`) ; conformite.js |
| 19 | Les combinaisons gagnantes sont indiquées dans les règles du jeu. (transposé : pas de lignes, formation des gains de la roue) | OK vérifié | section « formation des gains » (`rules.js`) |
| 20 | Les modes de jeu incluent une description et des informations sur les coûts. | OK vérifié | tableau des modes : Standard, Oracle+ ×1,1, 4 achats, pactes (`rules.js`) ; conformite.js |
| 21 | Les conditions de jeu gratuit et de redéclenchement sont clairement indiquées. (transposé : pas de free spins littéraux ; relances Ankh / Fureur) | OK vérifié | `R.retrig` (`rules.js`) ; conformite.js |
| 22 | Une clause de non-responsabilité générale est incluse dans les informations du jeu. | OK vérifié | `R.disc` (« Malfunction voids all wins and plays ») ×16 langues ; conformite.js |

### Lecture automatique

| n° | Directive | Statut | Preuve |
|---|---|---|---|
| 23 | Le pari automatique nécessite une confirmation avant de démarrer. | OK vérifié | panneau `openAuto` (« Démarrer ») ; rgs-test [104] ; conformite.js (aucun tour avant confirmation) |
| 24 | Les modes de pari à coût élevé nécessitent une confirmation avant activation. | OK vérifié | `confirmBuy` (achats de bonus) ; `confirmPlus` (Oracle+ ×1,1, interprétation prudente) ; rgs-test [31], conformite.js |

### Contrôles réactifs

| n° | Directive | Statut | Preuve |
|---|---|---|---|
| 25 | Le jeu fonctionne correctement sur ordinateur de bureau / portable. | OK vérifié | conformite.js 1280×720 ; e2e.js ; layout.js (jusqu'à 2560×1080) |
| 26 | Le jeu fonctionne correctement sur Popout S/L. | OK vérifié | conformite.js : L ≈ 640×360 et S ≈ 400×300 (bloc compact `style.css`, section « conformité ») ; layout.js |
| 27 | Le jeu fonctionne correctement sur mobile. | OK vérifié | conformite.js 390×844 et 844×390 tactile ; gestures.js ; layout.js. Appareil réel non testé (cf. n° 49) |
| 28 | Le zoom par double-clic est désactivé sur mobile. | OK vérifié | meta `user-scalable=no`, `touch-action:pan-x pan-y`, `dblclick` / double toucher annulés, pincement bloqué ; conformite.js (échelle du viewport = 1) ; gestures.js. iOS réel non testable |
| 29 | Le guide d'interaction utilisateur est inclus dans les informations du jeu. | OK vérifié | `R.btn` (SPIN, AUTO, TURBO, Espace) ; conformite.js |

### Sons / musique

| n° | Directive | Statut | Preuve |
|---|---|---|---|
| 30 | Le jeu propose une option pour désactiver les sons. | OK vérifié | bouton haut-parleur -> mixeur -> « couper » ; conformite.js |

### Prise en charge multilingue

| n° | Directive | Statut | Preuve |
|---|---|---|---|
| 31 | Le jeu est disponible en anglais. | OK vérifié | langue de base ; `?lang=en` ; i18n-check (16 langues complètes) |
| 32 | Des paramètres de langue invalides n'affectent pas l'affichage du jeu. | OK vérifié | conformite.js : `xx`, vide, `%00`, `<script>`, `EN-us`, `frfrfr` -> anglais, 0 erreur ; replay idem |
| 33 | Vérifiez que vous avez remporté 5 victoires pour chaque mode de jeu par rapport aux règles du jeu. | à faire par le propriétaire | contrôle manuel dans l'outil Stake ; appui : `tools/check.js`, `export-parity.js`, `stake-math/tests` (parité JS / Python, `verify()`), tous verts |
| 34 | Si le mode Mystère est présent dans le jeu, toutes les valeurs numériques représentant des chances ou des probabilités sont exactes. | OK vérifié | sans objet (pas de mode Mystère) ; chances de l'Oracle affichées = exactes (`rtp-exact.js`, rgs-test [266]) |

### Exigences de compétence — stake.us

| n° | Directive | Statut | Preuve |
|---|---|---|---|
| 35 | Le jeu est-il conforme aux traductions requises pour un jeu social ? | OK vérifié | social-check.js (mots interdits dans tous les textes, DOM, canvas) ; rgs-test (`socialCasino`). Relecture humaine du vocabulaire : à faire par le propriétaire |
| 36 | Le jeu prend en charge les devises SC et GC et leurs valeurs n'affichent pas de préfixe « $ ». | OK vérifié | conformite.js (replay social sans « $ ») ; social-check.js ; rgs-test |
| 37 | La dénomination des modes de jeu suit les directives terminologiques du mode social. | OK vérifié | social-check.js (mots interdits remplacés en mode social) |
| 38 | La fenêtre de relecture ne contient pas de mots interdits. | OK vérifié | social-check.js + conformite.js (replay social) |
| 39 | L'anglais est la seule langue prise en charge en mode social. | OK vérifié | social-check.js ; `js/social.js` (langue forcée à l'anglais) |

### Assistance à la rediffusion (replay)

| n° | Directive | Statut | Preuve |
|---|---|---|---|
| 40 | Prend en charge les URL de rediffusion, charge et lit l'événement souhaité. | OK vérifié | replay-test.js ; conformite.js |
| 41 | Prend en charge tous les paramètres optionnels tels que la devise, la langue et le montant. | OK vérifié | conformite.js (EUR 5,00, langue invalide, paramètres manquants -> erreur) |
| 42 | La fonction Replay permet de rejouer l'événement une fois terminé. | OK vérifié | conformite.js (« PLAY AGAIN ») ; replay-test.js |
| 43 | L'interface utilisateur affiche clairement le coût de la mise et le multiplicateur appliqué. | OK vérifié | conformite.js : « REAL COST €61.85 · COST ×12.37 » |
| 44 | Prise en charge des rediffusions dans la vue popout S. | OK vérifié | conformite.js 400×300 : bouton Lecture dans la fenêtre, mises masquées |

### Liste de contrôle pour l'approbation finale

| n° | Directive | Statut | Preuve |
|---|---|---|---|
| 45 | Des modèles de niveaux de mise ont été appliqués au jeu. | à faire par le propriétaire | tableau de bord Stake |
| 46 | Les fonctionnalités Provably Fair et Replay sont activées. | à faire par le propriétaire | Replay : code prêt et testé (n° 40-44) ; activation côté Stake |
| 47 | Les demandes de Front et Math sont approuvées. | à faire par le propriétaire | processus Stake (après resoumission) |
| 48 | Le jeu est publié dans le canal stake-engine-game-approved. | à faire par le propriétaire | Slack / Discord Stake |
| 49 | Le jeu fonctionne correctement sur les anciens appareils mobiles (Android et iOS). | non vérifiable ici | simulé : 360×640, CPU ×4, SwiftShader : DOMContentLoaded ≈ 0,5-0,7 s, `load` ≈ 0,7-3,6 s, 55 fichiers, ≈ 2,1 Mo, 0 erreur console (conformite.js). Appareils réels à tester par le propriétaire |
| 50 | Les demandes d'approbation sont fermées une fois le jeu en ligne et les émojis ajoutés aux notifications Slack. | à faire par le propriétaire | processus Stake |

## Bilan : 50 cases — OK vérifié 39, non vérifiable ici 3, à faire par le propriétaire 8.

Défauts corrigés lors de la passe précédente (comptés OK) : zoom double toucher / pincement (n° 28), confirmation Oracle+ (n° 24), Popout S (n° 26), bouton × des règles, Espace maintenu (n° 15). Cette passe : aucun nouveau défaut trouvé, aucun changement de code.

## Reste au propriétaire
Titre unique et distinction (n° 5, 7), miniature (n° 8), 5 victoires par mode (n° 33), niveaux de mise, Provably Fair / Replay, approbations, canal, Slack (n° 45-48, 50), appareils réels anciens (n° 49) et iOS réel (n° 28), relecture humaine du vocabulaire social et du contenu (n° 6, 35).
