# Checklist des 51 directives Stake Engine : audit du front

Les directives de Stake ne sont pas publiées dans le dépôt : la liste ci-dessous est reconstituée depuis `docs/RETOUR_STAKE.md` (pré-vérifications et contrôles cités au refus du 2026-10-15). Le découpage en 51 lignes est donc **une interprétation** ; les libellés exacts de Stake restent à comparer dans le tableau de bord. En cas d'ambiguïté, l'interprétation la plus prudente a été retenue (notée en dernière colonne).

Preuves : `tools/conformite.js` (nouveau, Playwright + faux RGS, 6 formats d'écran), `tools/rgs-test.js`, `tools/stake-build-test.js`, `tools/replay-test.js`, `tools/social-check.js`, `tools/i18n-check.js`, `tools/layout.js`, `tools/fuzz.js`. Lancer : `PLAYWRIGHT_CORE=… CHROMIUM=… node tools/conformite.js` (≈ 3 min, une dizaine de tours).

États : **conforme** (déjà bon, testé), **corrigé** (défaut trouvé et corrigé dans cette passe), **non vérifiable ici** (dépend de Stake ou d'un jugement humain).

| n° | Directive reformulée | État | Preuve / note |
|---|---|---|---|
| 1 | Authentification RGS au lancement (`/wallet/authenticate`, une fois) | conforme | `js/main.js` `startRgs` ; rgs-test [181] |
| 2 | Échec propre avec une URL RGS invalide ou injoignable (message, jeu bloqué, aucune mise) | conforme | conformite.js : 6 URL (`notaurl`, `ftp://`, `javascript:`, `http://`, port fermé, hôte inexistant) ; rgs-test [274] ; `js/rgs.js` `normalizeUrl` |
| 3 | Lancement sans RGS : pas de jeu truqué ni de solde fictif | conforme | build Stake : écran « Lancez le jeu depuis Stake » (stake-build-test 1) ; build dev : aucune requête externe (conformite.js) |
| 4 | Le clic sur le pari envoie une requête de jeu | conforme | conformite.js (desktop, mobile, Popout : appui réel -> `/wallet/play`) |
| 5 | Pas de chargeur « pieux » | conforme | aucun écran de chargement ; texte « Connexion… » dans la barre d'état seulement. Jugement humain pour le mot « pieux » : non vérifiable |
| 6 | Titre unique, sans terme restreint | non vérifiable ici | `<title>` = « Anubis Unchained » ; unicité = catalogue Stake (`GUIDE_PUBLICATION.md`) |
| 7 | Contenu non offensant | non vérifiable ici | relecture humaine (`GUIDE_PUBLICATION.md` [217]) |
| 8 | Se distingue des titres existants | non vérifiable ici | humain / conseil PI (`DOSSIER_PI.md`) |
| 9 | Miniature conforme aux directives graphiques | non vérifiable ici | `brand/stake-media/` : fond 16:9 (1920×1080) et 3:4 (1200×1600) sans alpha, abstraits, sans personnage ni texte ; médaillon 1024² et titre blanc en PNG transparent (coins alpha 0, vérifié). Dimensions exactes et champs du Media Editor de Stake non lus. Le médaillon est un visuel IA retouché (point DA, autre agent) |
| 10 | Niveaux de mise lus de la réponse d'authentification | conforme | `betLevelsFrom` ; rgs-test [242] |
| 11 | Mise active (round repris) lue de la réponse d'authentification | conforme | `startRgs` (`rd.amount`) ; rgs-test [187] |
| 12 | Devises : symbole, position, décimales par devise | conforme | `js/currency.js` ; rgs-test (JPY, XSC) |
| 13 | Gains sous-centime affichés sans arrondi à 0,00 | conforme | conformite.js : 0,005 $ -> « $0.005 », 0,0005 -> « $0.0005 », 0,5 ¥, 0,005 SC |
| 14 | Pas de requête de fin de tour pour un pari à gain nul | conforme | `js/main.js` l.344 (`end-round` seulement si gain > 0) ; rgs-test [221] |
| 15 | Pas de requête de jeu si le solde est insuffisant (coût réel : mode, achat) | conforme | `js/main.js` l.268 ; rgs-test [222] |
| 16 | Barre d'espace = bouton de pari | conforme | `js/main.js` l.610 ; conformite.js (Espace envoie 1 requête) |
| 17 | Espace sans conflit avec les autres touches | corrigé | touche maintenue (`e.repeat`) ignorée (un seul tour) ; lettres, Échap, Tab, flèches ne jouent pas ; fenêtre ou panneau AUTO ouverts : Espace sans effet (conformite.js B, C) |
| 18 | Fenêtre principale non défilable | conforme | `html,body{overflow:hidden}` ; conformite.js : `scrollTo`, PageDown/End, molette sans effet sur 6 formats ; layout.js |
| 19 | Fenêtres internes (règles) défilables et fermables | corrigé | bouton × rendu `sticky` (restait hors écran après défilement) ; conformite.js (règles sur 6 formats) |
| 20 | Zoom par double-clic / double toucher désactivé (mobile) | corrigé | meta `user-scalable=no,maximum-scale=1` (déjà) ; `touch-action:pan-x pan-y` (avant : `manipulation`, laissait le pincement) ; `dblclick`, double toucher annulés (`js/main.js` l.7) ; conformite.js : échelle du viewport = 1 |
| 21 | Zoom par pincement désactivé | corrigé | `touch-action`, `gesturestart/change`, `touchmove` à 2 doigts, Ctrl+molette ; conformite.js : pincement CDP ×2,5 -> échelle 1 (portrait, paysage, ancien mobile). iOS réel non testable ici |
| 22 | RTP dans les règles | conforme | `js/rules.js` (par mode) + `openInfo` ; conformite.js |
| 23 | Gain maximal dans les règles (25 000×) | conforme | idem |
| 24 | Gains par case / par symbole | conforme | table des cases (`openInfo`), valeurs des bonus (`rules.js`) ; conformite.js. Chiffres = maths : i18n-check |
| 25 | Combinaisons gagnantes (transposées à la roue) | conforme | section « formation des gains » (`rules.js`) |
| 26 | Description et coût de chaque mode | conforme | tableau des modes : Standard, Oracle+ ×1,1, 4 achats (`rules.js`) ; conformite.js |
| 27 | Free spins / relances / re-déclenchements décrits | conforme | `R.retrig` (`rules.js`) ; pas de free spins au sens rouleaux : transposé aux relances (Ankh, Fureur) |
| 28 | Clause de non-responsabilité (« Malfunction voids all wins and plays ») | conforme | `R.disc` ×16 langues ; conformite.js |
| 29 | Guide d'interaction (boutons, clavier) dans les infos | conforme | `R.btn` ; conformite.js (SPIN, AUTO, TURBO, Espace) |
| 30 | Confirmation avant de démarrer le pari automatique | conforme | panneau `openAuto` (« Démarrer ») ; rgs-test [104] ; conformite.js (aucun tour avant, Espace dans le panneau sans effet) |
| 31 | Confirmation avant un mode de pari à coût élevé : achat de bonus | conforme | `confirmBuy` (focus sur Annuler, répétitions ignorées) ; rgs-test [31] |
| 32 | Idem pour Oracle+ / ante (mise ×1,1) | corrigé | **nouveau** `confirmPlus` : confirmation avant activation (désactivation immédiate) ; clés `plusConfirm*` ×16 langues ; Oracle+ n'est plus réactivé au rechargement. Interprétation prudente : ×1,1 est sous le seuil habituel (×2) mais confirmé quand même. Tests : rgs-test, conformite.js C ; e2e et fuzz adaptés |
| 33 | Fonctionne sur desktop | conforme | conformite.js 1280×720 ; e2e ; layout |
| 34 | Fonctionne en Popout L (≈ 640×360) | conforme | conformite.js : contrôles visibles, tour joué, règles |
| 35 | Fonctionne en Popout S (≈ 400×300) | corrigé | AUTO et ORACLE+ sortaient de l'écran (HUD paysage à 5 colonnes) ; bloc compact `@media (max-width:520px) and (min-height:261px) and (max-height:340px)` dans la section « conformité » de `style.css` ; conformite.js, layout.js |
| 36 | Fonctionne sur mobile portrait et paysage | conforme | conformite.js 390×844 et 844×390 (tactile) ; layout.js |
| 37 | Option pour couper le son | conforme | bouton haut-parleur -> mixeur -> « couper » ; conformite.js |
| 38 | Anglais disponible | conforme | langue de base ; `?lang=en` |
| 39 | Paramètres de langue invalides sans effet | conforme | conformite.js : `xx`, vide, `%00`, `<script>`, `EN-us`, `e`, `frfrfr` -> anglais, aucune erreur ; replay idem |
| 40 | 16 langues complètes | conforme | i18n-check (nouvelles clés incluses) |
| 41 | 5 victoires par mode vérifiées par rapport aux règles | non vérifiable ici | outil Stake ; `stake-math/tests`, `tools/check.js`, `export-parity.js` (parité JS / Python, book v2 `verify()`) |
| 42 | Mode Mystère : probabilités exactes (si présent) | conforme | pas de mode Mystère ; chances de l'Oracle affichées exactes (`rtp-exact.js`, rgs-test [266]) |
| 43 | Mode social Stake.US : textes, SC / GC sans « $ », vocabulaire, anglais seul | conforme | social-check (mots interdits dans tous les textes, DOM, canvas) ; rgs-test (`socialCasino`) ; conformite.js (replay social sans « $ ») ; nouvelles clés vérifiées. Relecture humaine « mots interdits » : non vérifiable |
| 44 | Replay : URL et paramètres devise / langue / montant | conforme | replay-test ; conformite.js (EUR 5,00, lang invalide, paramètres manquants -> erreur) |
| 45 | Replay : rejouer une fois fini | conforme | conformite.js (« PLAY AGAIN » relance) ; replay-test |
| 46 | Replay : coût de la mise et multiplicateur affichés | conforme | conformite.js : « REAL COST €61.85 · COST ×12.37 » |
| 47 | Replay : vue popout S | conforme | conformite.js 400×300 : bouton Lecture dans la fenêtre, mises masquées |
| 48 | Replay : aucun appel wallet, touches du jeu neutralisées | conforme | conformite.js, stake-build-test 3 |
| 49 | Modèles de niveaux de mise, Provably Fair | non vérifiable ici | approbation finale Stake |
| 50 | Anciens mobiles Android / iOS | non vérifiable ici (simulé) | 360×640, CPU ×4 (CDP), SwiftShader : DOMContentLoaded ≈ 0,5-0,7 s, `load` ≈ 0,7-3,6 s, 55 fichiers, ≈ 2,1 Mo, ≈ 6-9 images/s sans GPU réel, 0 erreur console (conformite.js). Appareils réels non testés |
| 51 | Aucune requête hors origine du jeu et de `rgs_url`, 0 erreur console | conforme | stake-build-test 4 ; conformite.js (0 erreur sur tous les scénarios) |

## Ce qui a changé dans cette passe
`js/main.js` (zoom, confirmation Oracle+, Espace non répété, Oracle+ non restauré), `js/i18n.js` (`plusConfirmTitle`, `plusConfirm` ×16), `css/style.css` (section « conformité » : touch-action, Popout S, bouton × collant), `tools/conformite.js` (nouveau), `tools/rgs-test.js`, `tools/e2e.js`, `tools/fuzz.js` (Oracle+ demande confirmation ; aucun test désactivé).
