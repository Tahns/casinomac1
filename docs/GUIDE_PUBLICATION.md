# Guide de publication sur Stake Engine : Anubis Unchained

Date : 2026-10-15. Ce guide dit ce que Claude a déjà fait, et ce qu'il reste à faire **soi-même**, dans l'ordre. **Il ne promet aucune conformité ni aucune approbation** : Stake décide. Plusieurs points viennent de documents que Claude n'a pas pu ouvrir (tableau de bord, conditions) ; ils sont marqués « non vérifié ».

Sources : `stake-math/README.md`, `docs/STAKE_ENGINE_CONFORMITE.md`, `docs/TRADUCTIONS.md`, `docs/DOSSIER_PI.md`, checklist « Engine game review » et son audit.

---

## Ce que Claude a déjà fait

- [x] **Front statique** : HTML, CSS, JS sans dépendance, polices locales, aucune requête vers un hôte externe (constaté pendant l'audit).
- [x] **Client de l'API de la plateforme** (`js/rgs.js`) : authenticate, play, end-round, `/bet/event`, reprise de round actif, niveaux de mise venus de la plateforme, devises (dont XSC/XGC), mode social, codes d'erreur. Testé uniquement contre un **faux serveur local** (`tools/mock-rgs.js`) : jamais contre un vrai RGS ni dans le cadre Stake.
- [x] **Replay** (`?replay=true…`) pour les 6 modes.
- [x] **16 langues** (anglais par défaut) et mode social. **Aucune relue par un natif.**
- [x] **Portage des maths** dans `stake-math/` (format math-sdk) : 6 modes, 54 tests de parité, fichiers de format validés par les contrôles officiels du SDK sur un échantillon de 100 books par mode. RTP exacts des lois **non optimisées** : Standard 96,21 %, Oracle+ 96,10 %, achats 96,01 à 96,03 %, gain max 25 000×.
- [x] **Audit « Engine game review »** (joué dans Chromium avec un faux RGS) : 30 PASS, 4 FAIL, 5 AT RISK, 2 NEEDS A HUMAN. Les 4 FAIL ([222], [24], [266], [77]) et les AT RISK [31], [235], [195] ont été **corrigés dans le code avec un test chacun** (`docs/STAKE_ENGINE_CONFORMITE.md` section 9), ainsi que les constats E1, E2, E4.
- [x] **Visuels** pour le Media Editor dans `brand/stake-media/`, logo blanc `brand/anubis-unchained-logo-white.png`.
- [x] **Dossier PI** pour un conseil (`docs/DOSSIER_PI.md`).
- [ ] **À venir dans la branche, voir README** : `tools/build-stake.py`, qui doit produire `dist-stake.zip` (le front à déposer). Ce fichier n'existe pas dans cette branche au moment de la rédaction ; un autre agent est en train de l'écrire.

## Ce que Claude n'a pas fait et ne peut pas faire

- La **table de production optimisée** (le programme Rust de l'optimiseur n'a jamais été lancé ; la grande simulation est réservée à l'utilisateur).
- Aucun test contre un **vrai RGS**, aucune soumission.
- Lire le tableau de bord, les conditions et les directives d'approbation de Stake.
- Les points qui demandent une personne (traductions, écoute, rendu à l'œil, contenu des décors, titre, avis juridique).

---

## Ce qu'il faut faire soi-même

### Étape 1. Onboarding du studio : Garanti ou partage de profit

- [ ] Créer ou ouvrir le compte studio sur la plateforme et lire les **conditions développeur** en entier (cession ou licence, exclusivité, droit de retrait, responsabilité en cas de litige de PI). Claude ne les a **pas lues**.
- [ ] Choisir le modèle de rémunération. D'après des résumés de recherche **non vérifiés** (site et blog Stake non ouverts) : partage de profit à 10 % du GGR, ou option garantie à 7,5 % du GGR attendu, changement mensuel, paiement le 1er du mois.
- [ ] Rappel de la discussion de risque : le choix dépend de la volatilité du jeu et de votre tolérance. Ce jeu est **à très haute volatilité** (écart-type exact d'environ 16 fois la mise par tour en Standard ; gain max 25 000×, voir `stake-math/README.md`). Avec le partage de profit, le revenu suit le résultat réel du jeu auprès des joueurs ; avec le garanti, il suit le GGR **attendu** (et non réalisé). Lequel est le plus favorable ou le plus risqué pour vous, et selon quelles clauses exactes : **à confirmer dans les conditions du tableau de bord**. C'est **votre décision** ; Claude ne la prend pas.

### Étape 2. Produire la table optimisée (la plus lourde)

Prérequis : Python 3.12 ou plus (SDK), Rust et Cargo, `git`. Détail et réserves : `stake-math/README.md`, section « Produire la table de production ».

- [ ] Cloner le SDK officiel et installer ses dépendances :
  ```bash
  git clone https://github.com/StakeEngine/math-sdk
  cd math-sdk && pip install -r requirements.txt
  pip install zstandard      # sinon les books restent en .jsonl non compressé (le RGS veut du .jsonl.zst)
  ```
- [ ] Générer les books **dans l'arborescence du SDK** (le programme Rust lit `../games/<game_id>/library/…`). La grande simulation est réservée à l'utilisateur, d'où `HOA_BIG=1` (ou `ANUBIS_BIG=1`, qui lève le plafond de 1000) :
  ```bash
  HOA_BIG=1 python3 stake-math/run.py --books 300000 --prepare-optimizer --out <math-sdk>/games/anubis_unchained/library
  ```
  À prévoir : 100 000 à 1 000 000 books par mode, quelques minutes par million, environ 1 Ko par book avant compression. Résultat : `lookup_tables/lookUpTable_<mode>.csv`, `forces/force_record_<mode>.json`, `configs/math_config.json`, `optimization_files/setup_<mode>.toml`.
- [ ] Pour **chaque** des 6 modes (`std`, `plus`, `buy_scarab`, `buy_weigh`, `buy_vault`, `buy_fury`) : copier `library/optimization_files/setup_<mode>.toml` sur `<math-sdk>/optimization_program/src/setup.toml`, puis :
  ```bash
  cd <math-sdk>/optimization_program && cargo run --release
  ```
  Cela réécrit `library/publish_files/lookUpTable_<mode>_0.csv` (poids optimisés).
- [ ] Au besoin, régler les **paramètres de départ** de `stake-math/game_optimization.py` : `min_m2m` / `max_m2m` (rapport moyenne sur médiane), `num_pigs_per_fence`, `scaling`, `WINCAP_RTP` (part de RTP du gain max, 0,002 soit 1 sur 12,5 millions). **Ces valeurs n'ont jamais été éprouvées** (l'optimiseur n'a pas été lancé) : elles dépendent de la volatilité réelle.
- [ ] **Mesurer, pour chaque mode, sur la table optimisée** (pas sur la loi non optimisée) :
  - le **RTP** : cible 96,2 % ; formule de la checklist : `Σ(poids × payout/100) ÷ Σ(poids) ÷ coût`
  - l'**écart de RTP entre modes** : ≤ 0,5 point (seuil cité par une source **tierce**, non officiel ; 0,2 point constaté sur les lois non optimisées)
  - la **fréquence du gain max** (25 000×) : visée 1 sur 12,5 millions, à confirmer ; chaque mode doit contenir au moins un book à 2 500 000
  - la **volatilité** et le taux de gain non nul (≥ 1 sur 20 d'après la source tierce ; 42,6 % en Standard sur la loi non optimisée), et les limites de volatilité du SDK (`prob5k`, `etl`, `cvar`) : à mesurer
- [ ] Reporter le RTP final dans le jeu : régénérer `js/stats.js` (`node tools/gen-stats.js`) et contrôler (`node tools/gen-stats.js --check`). C'est le point [25] de la checklist, **resté ouvert**. Si l'optimiseur change les RTP, les textes des règles qui les affichent doivent changer.
- [ ] Si les résultats sont mauvais ou surprenants, demander à Claude de les analyser (fournir les CSV et les journaux).

### Étape 3. Contrôle de format (« verify » du SDK)

- [ ] Vérifier la bibliothèque produite, depuis le dossier `stake-math/` :
  ```bash
  python3 -c "import verify; print(verify.verify_library('<…>/library/publish_files'))"
  ```
  Une liste vide = aucune anomalie.
- [ ] Lancer ensuite les contrôles officiels du SDK (`execute_all_tests`, `verify_lookup_format`, `verify_books_and_payout_mults`, `compare_payout_values`).
- [ ] Contrôler que `index.json` contient exactement 6 modes (nom, coût, fichiers de books et de poids) : le maximum est de 20 modes d'après la checklist.
- [ ] Noter : les noms de modes `buy_*` contiennent « buy », mot interdit en mode social si Stake les affiche (`tools/social-check.js` le signale). À renommer si Stake l'exige (non vérifié).

### Étape 4. Dépôt dans le tableau de bord

La procédure exacte d'envoi (le dépôt officiel parle d'un stockage provisoire) n'a pas été vérifiée dans l'interface : suivre le tableau de bord.

- [ ] **Files, partie maths** : `index.json`, les `books_<mode>.jsonl.zst` et les `lookUpTable_<mode>_0.csv` du dossier `publish_files/`.
- [ ] **Front End** : le fichier `dist-stake.zip` produit par `tools/build-stake.py` (**à venir dans la branche, voir README**). Tant qu'il n'existe pas, ne pas improviser : le dossier à déposer est le site statique (`index.html`, `css/`, `js/`, `img/`, `fonts/`) mais le contenu exact attendu n'est pas vérifié.
- [ ] Avant de zipper pour la soumission : **désactiver la démo locale** (constat E3 : lancer le jeu sans `sessionID` ni `rgs_url` démarre une démo avec solde fictif et RNG du navigateur). Demander à Claude de le faire, ou vérifier que `build-stake.py` le fait.
- [ ] Publier : *Publish Game > Front End* (d'après le README du `web-sdk`, officiel mais à confirmer dans l'interface).

### Étape 5. Media Editor

Fichiers de `brand/stake-media/` (les noms exacts des champs du Media Editor ne sont **pas vérifiés** : adapter à l'interface) :

- [ ] **Tuile 3:4** : fond `background-tile-3x4.png` (1200×1600) ; premier plan `foreground-medallion.png` (médaillon, transparent) ; titre `title-white.png` (transparent).
- [ ] **Large 16:9** : fond `background-wide-16x9.png` (1920×1080) ; mêmes premier plan et titre.
- [ ] **Logo blanc monochrome** : `brand/anubis-unchained-logo-white.png` (1024×1024, transparent). Le fichier `medallion-white.png` de `stake-media/` a la même taille (même taille de fichier que le logo blanc).
- [ ] Regarder le rendu **à l'œil** en vignette (petite taille) : le titre doit rester lisible.
- [ ] Regarder le fond de la tuile : il montre une main d'or ouverte ; voir la question dans `docs/DOSSIER_PI.md`. L'origine de ce fond n'est pas documentée dans le dépôt.

### Étape 6. Start Approval et checklist « Engine game review »

- [ ] Relire la checklist (IDs ci-dessous) et les directives d'approbation du tableau de bord (**non lues** par Claude).
- [ ] **Corrigés par Claude** (avec un test chacun) : [222] solde insuffisant, [24] maxima cités, [266] chances de l'Oracle, [77] splash social, [31] confirmation d'achat (Entrée maintenu), [235] guide des boutons, [195] popout S ; constats E1, E2, E4.
- [ ] **FAIL ou AT RISK qui restent ouverts** :

  | ID | Point | Qui traite |
  |---|---|---|
  | [25] | RTP et gain max affichés = ceux de la **table de production** ; aujourd'hui ce sont ceux de la loi non optimisée | Vous (étape 2), puis Claude régénère `js/stats.js` |
  | E3 | Démo locale livrée dans le build | Claude (ou `build-stake.py`), vous vérifiez |
  | [26] | « Win combinations » : dépendait des erreurs [24] et [266], **corrigées, mais l'audit n'a pas été rejoué** | Claude, en rejouant l'audit (étape 7) |
  | [213] | Titre unique : « Anubis Unchained » ne contient aucun terme interdit, mais l'unicité ne se juge pas par le code | Vous (catalogue Stake, registres de marques) et le conseil PI |
  | [253] | Distinct des titres existants (NEEDS A HUMAN) | Vous |
  | [217] | Contenu inapproprié : 28 images vues, rien de problématique ; **les scènes de bonus rendues en canvas n'ont pas toutes été vues** | Vous |
  | [107] | Son coupé : graphe audio vérifié, **écoute réelle non faite** | Vous |
  | [195] | Popout S 400×225 : polices relevées à 8 px, à regarder à l'œil | Vous |
- [ ] Lancer **Start Approval** quand les points ci-dessus sont traités. Délai de réponse : « dans les 24 h » d'après le blog Stake, **non vérifié**. L'approbation n'est pas garantie.

### Étape 7. Test avec une vraie session (méthode A de la checklist)

- [ ] Lancer le jeu **depuis le tableau de bord** du studio et **copier l'URL du cadre du jeu** (elle contient un `sessionID` et un `rgs_url` valides). **L'URL est sensible : elle donne accès à une session.** La coller à Claude uniquement dans cette conversation.
- [ ] Claude rejoue l'audit : serveur local du build, Chromium (Playwright), `page.route()` pour observer, bloquer ou réécrire les appels (niveaux de mise, round actif, fin de round à 0×, solde nul, `rgs_url` invalide, autoplay et achat de bonus). Si le RGS refuse les appels depuis `localhost` (CORS), utiliser l'URL du build déployé ou le faux RGS.
- [ ] Limiter les mises : aucune simulation ni mise inutile (le dépôt s'interdit plus de 1000 tours au total).

### Étape 8. Points qui nécessitent une personne

- [ ] **Relecture native des traductions** : aucune des 16 langues n'a été relue. Priorité aux textes réglementaires (avertissement, jeu responsable, erreurs) et au vocabulaire du mode social. Méthode et niveaux de confiance : `docs/TRADUCTIONS.md`.
- [ ] **Écouter le son coupé** : haut-parleur > Sound off, lancer un tour, un bonus et un gros gain, au casque.
- [ ] **Écouter le son allumé** (ambiance, effets) : il n'a jamais été écouté par une personne.
- [ ] **Rendu 400×225** (popout S) : libellés lisibles, panneau AUTO manipulable, « Démarrer » visible, menu d'achat sans texte caché ; replay compris.
- [ ] **Titre et marque** : vérifier l'unicité du titre dans le catalogue et les registres.
- [ ] **Contenu des décors** : lancer chacun des 5 bonus et regarder les décors et personnages (rien d'offensant, aucun mineur).
- [ ] Rendu réel sur téléphone et tablette (jamais essayé) ; arabe en lecture de droite à gauche.

### Étape 9. Conseil en propriété industrielle

- [ ] Remettre `docs/DOSSIER_PI.md` et ses pièces jointes à un avocat ou CPI : recherche de marques (classes 9, 28, 41), liberté d'exploitation, droits sur les images IA, conditions Stake.
- [ ] Ne pas publier de promotion ni de dépôt de marque avant sa réponse. Corriger avant publication : ajouter l'avis OFL des polices (absent du dépôt).

---

## Définition de terminé

Le jeu est « terminé » pour Stake quand **toutes** ces cases sont vraies :

1. La table optimisée existe, ses 6 modes sont à ≈ 96,2 % de RTP, écart entre modes ≤ 0,5 point, gain max présent dans chaque mode, `verify` sans anomalie.
2. `js/stats.js` et les règles affichées reprennent les RTP et gains max **de la table publiée**.
3. Le front du dossier `dist-stake.zip` fonctionne avec une **vraie session** (méthode A), sans démo locale, sans erreur de console, et l'audit rejoué ne contient plus de FAIL.
4. Les points « personne » de l'étape 8 sont faits et notés.
5. Le conseil PI a répondu sur le titre, les images et les conditions ; ses réserves sont traitées.
6. Stake a donné son approbation (cela ne dépend pas de nous).

Même alors, aucune conformité n'est garantie : une approbation reste une décision de Stake.

---

## Tableau récapitulatif

| Étape | Qui | Statut | Durée estimée / difficulté |
|---|---|---|---|
| 1. Onboarding, conditions, modèle de revenus | Vous | À faire | 1 à 2 h ; facile, mais décision importante |
| 2. Table optimisée (simulation + optimiseur Rust) | Vous (Claude analyse) | À faire, jamais lancé | Quelques heures à une journée (estimation non mesurée) ; difficile |
| 3. Contrôle de format (`verify`, tests du SDK) | Vous | À faire | 30 min ; facile |
| 4. Dépôt Files + Front End (`dist-stake.zip`) | Vous et Claude | Front à venir (`build-stake.py`) | 1 h ; moyen |
| 5. Media Editor | Vous | Fichiers prêts, saisie à faire | 30 min ; facile |
| 6. Start Approval et points ouverts ([25], E3, [26], [213], [253]) | Vous et Claude | Code corrigé pour 7 points ; reste ouvert : [25], E3, [26], [213], [253] | 1 à 2 h ; moyen |
| 7. Test avec vraie session (méthode A) | Vous (URL) et Claude (audit) | À faire | 1 à 2 h ; moyen |
| 8. Relecture native, son, 400×225, décors, titre | Vous | À faire | Plusieurs jours si relecteurs externes ; moyen |
| 9. Conseil PI | Vous | Dossier prêt | Semaines (délai du conseil, non mesuré) ; coût à prévoir |
