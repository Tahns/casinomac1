# Anubis Unchained — analyse de la machine et plan d'attractivité

Date : 2026-10-13. Étape : **analyse + plan uniquement** (aucun code de jeu modifié).
Demande du joueur : « analyser la machine, faire des SWOT et essayer de la rendre encore plus attractive au possible ».

**Convention de lecture.** Chaque affirmation porte l'une de ces étiquettes :
- **[mesuré]** : sortie d'un outil du dépôt ou d'un script de simulation (graine et nombre de tours indiqués) ;
- **[code]** : lu dans le code, sans exécution dans un navigateur ;
- **[estimé]** : calcul d'après les durées codées en dur (`setTimeout`/`tween`), jamais chronométré sur un vrai appareil ;
- **[supposé]** : jugement de l'auteur ou information externe non vérifiée.

Les RTP des concurrents ne sont **pas** vérifiés (voir `docs/CONCURRENTS.md`) et ne servent à aucune comparaison chiffrée.

---

## 0. Note de méthode (règle du joueur sur les simulations)

Règle reçue : **aucune simulation au-dessus de 100 000 tours, puis au-dessus de 1 000 tours**. Les chiffres de ce document se classent donc ainsi :

1. **Référence officielle (1 milliard de tours, mesurée avant cette règle, fournie par le coordinateur)** : RTP Standard **96,22 % ±0,034**, Oracle+ **96,00 % ±0,039** ; taux de gain **60,3 %** ; un bonus tous les **14,7 tours** ; écart-type **5,46** (Standard) et **6,37** (Oracle+) ; gain max observé **5 000×** (plafond), atteint 10 fois en Standard et 19 fois en Oracle+ sur 1 milliard de tours. **Ces valeurs remplacent toute valeur de RTP, de taux de gain, d'écart-type et de gain max citée plus bas.**
2. **Mesures complémentaires de mon travail, faites avant les deux règles** (100 000 tours, graine 7 ; achats 100 000 tours, graine 5 ; `tune.js` 100 000 tirages). Les sections 1.3 à 1.10 citent aussi des échantillons plus gros (4 M et 12 M tours) lancés **avant** la règle ; **je n'ai lancé aucune simulation supplémentaire depuis**. Les intervalles de confiance à 95 % sont larges pour les petits échantillons : RTP mesuré sur 100 000 tours ≈ ±3 pts (1,96 × 5 / √100 000 ≈ 0,031 × la mise), fréquence d'un événement rare (JUGEMENT DIVIN, Crypte) : un facteur 2 d'incertitude.
3. **Sur 100 000 tours (graine 7)** : RTP Standard 95,89 % (±3 pts, donc compatible avec 96,22 %), Oracle+ 97,12 % (même remarque) ; taux de gain 60,1 % ; ≥ mise 20,6 % ; bonus 1/14,65 ; BIG 1/70, EXTRA 1/265, MEGA 1/1 639 (±40 %), DIVIN 4 événements : non fiable ; série perdante p95 = 13 (Standard) et 23 (Oracle+) ; tours avant bonus p50 9, p90 32. Ces valeurs confirment, à la précision près, celles des plus gros échantillons. Achats à 100 000 tours : RTP 96,33 / 95,78 / 96,63 / 96,82 % (Scarabées / Pesée / Trésor / Fureur), incertitude ±0,6 à ±0,5 pt ; part d'achats à zéro de la Pesée 46,1 %.
4. **Fusion de `claude/laughing-davinci-33zu96`** : la fusion a été refusée par le système de permissions, mais elle est sans objet : le commit de pointe de cette branche (374960b) est **l'ancêtre exact de ma branche** (aucune différence de code). Le code lu est donc à jour.
5. **Le test de durée et le temps pour doubler / perdre** (1.8, 1.9) sont des **modèles** (code + marches aléatoires faites avec 4 000 séances avant la règle) ; pour les perdre 100 mises, l'ordre de grandeur se retrouve sans simulation : perte moyenne = (1 − 0,9622) = 3,8 % de la mise par tour, soit ≈ 2 600 tours (≈ 9 h à 13 s par tour) ; la médiane est plus basse à cause de l'asymétrie de la distribution.

## 1. Fiche technique mesurée

> Les chiffres de RTP, de taux de gain, d'écart-type et de gain max de cette section sont à remplacer par la référence à 1 milliard de tours de la section 0 (RTP 96,22 % / 96,00 %, écart-type 5,46 / 6,37). Les autres lignes sont des mesures secondaires.

### 1.1 Commandes lancées

| Commande | Résultat conservé |
|---|---|
| `node tools/simulate.js 12000000 21 std` | RTP, taux de gain, répartition par case, distribution |
| `node tools/simulate.js 12000000 21 plus` | idem en Oracle+ (mise ×1,1) |
| `node tools/simulate.js 3000000 5 buy-<scarab|weigh|vault|hand>` | RTP et volatilité à l'achat |
| `node tools/tune.js` (1 000 000 tirages par bonus) | espérance isolée de chaque bonus, secret compris |
| `node tools/tune-profiles.js` (4 000 000, graine 1) | égalité d'espérance des profils prudent / équilibré / audacieux |
| Script d'analyse complémentaire (hors dépôt, 4 000 000 tours, graine 99, + 4 000 marches aléatoires par mode) | séries sans gain, écart entre bonus, paliers de gros gain, durée estimée, temps pour doubler / perdre |

Les durées d'un tour sont **[estimé]** : le script d'analyse applique à chaque tour simulé les durées lues dans le code (voir 1.6). Il ne mesure pas l'écran.

### 1.2 Chiffres clés (mode Standard, mise = coût ×1 ; Oracle+ en face)

| Indicateur | Standard | Oracle+ (coût ×1,1) | Source |
|---|---|---|---|
| **RTP** | **96,22 % ±0,034** | **96,00 % ±0,039** | [mesuré] référence 1 milliard de tours (section 0). Écart-type : 5,46 / 6,37. Gain max 5 000× atteint 10 fois (Std) et 19 fois (Oracle+) |
| RTP (échantillon antérieur) | 96,07 % | 95,88 % | [mesuré] 12 M tours, graine 21, lancé avant la règle |
| RTP (second échantillon) | 96,06 % | 95,33 % | [mesuré] 4 M tours, graine 99 (le tirage Oracle+ est plus dispersé, voir 1.8) |
| Taux de gain (tour qui paie > 0) | **60,3 %** | 60,3 % | [mesuré] |
| dont tours qui rendent **au moins la mise** | **20,6 %** (1 tour sur 5) | 12,7 % (1 sur 8) | [mesuré] 4 M, graine 99 |
| Tours à 0 | 39,7 % | 39,7 % | [mesuré] |
| Tours qui paient moins que la mise (0 < gain < coût) | **39,7 %** | 38,1 % | [mesuré] |
| Écart-type d'un tour | **5,4 à 5,8 × la mise** (5,36 sur 12 M ; 5,75 sur 4 M) | 6,0 à 6,4 × | [mesuré] ; la queue de distribution rend l'écart-type instable d'une graine à l'autre |
| Gain max observé | 3 285× (12 M) | 5 000× (plafond atteint 1 fois sur 12 M) | [mesuré] |
| Plafond global | 5 000× la mise | idem | [code] `MAX_WIN` |
| Part de RTP due aux boosts Oracle | 7,06 pts | 16,50 pts | [mesuré] |
| Oracle actif | 31 % des spins | 72 % des spins | [mesuré] |

### 1.3 Fréquence de chaque événement

| Événement | Fréquence par tour | Source |
|---|---|---|
| **Au moins un bonus** | **1 tour sur 14,65** (6,8 %) | [mesuré] 4 M ; `simulate` : 1/14,7 |
| Chute des Scarabées | 1 / 49 | [mesuré] |
| Pesée du Cœur | 1 / 49 | [mesuré] |
| Chambre du Trésor | 1 / 49 | [mesuré] |
| Les trois bonus de la roue « ordinaires » | 1 / 16,4 | [mesuré] |
| **Fureur d'Anubis** (8 % des bonus gagnés) | **1 / 188** | [mesuré] |
| **Bonus secret : la Crypte** (3 % des bonus gagnés) | **1 / 485 à 1 / 490** | [mesuré] |
| Ankh (relance gratuite) | 1 spin sur 11 | [mesuré] |

Part des bonus gagnés : Scarabées 29,7 % · Pesée 29,7 % · Trésor 29,9 % · Fureur 7,8 % · Crypte 3,0 % [mesuré].

### 1.4 Contribution au RTP par case (Standard, 12 M, graine 21) [mesuré]

| Case | Fréquence | Part de RTP | Gain moyen par apparition |
|---|---|---|---|
| 0,5× | 1/3,7 | 14,87 % | 0,54× |
| 1× | 1/11,0 | 10,18 % | 1,12× |
| 0,25× | 1/7,3 | 3,41 % | 0,25× |
| 2× | 1/44,1 | 4,93 % | 2,17× |
| 3× | 1/44,1 | 7,22 % | 3,18× |
| Scarabées | 1/49,2 | 11,10 % | 5,46× |
| Pesée | 1/49,2 | 12,73 % | 6,27× |
| Trésor | 1/49,3 | 15,95 % | 7,87× |
| Fureur d'Anubis | 1/188,9 | 14,01 % | 26,47× |
| Crypte (secret) | 1/484,5 | 1,67 % | 8,09× |
| 0× et Ankh | — | 0 % | 0 |

Lecture : 14 % du RTP viennent d'un événement qui n'arrive qu'une fois tous les 190 tours. Les bonus (hors cases nombre) pèsent 55,5 % du RTP. Les cases « nombre » 40,6 %.

### 1.5 Distribution des gains par tour (Standard) [mesuré]

| Tranche (× la mise) | Part des tours (4 M, graine 99) | Part (12 M, graine 21) |
|---|---|---|
| 0× | 39,65 % | 39,66 % |
| entre 0 et 1× exclu | 39,71 % | 39,71 % |
| 1 à 5× | 17,18 % | 17,18 % (1-2× : 9,65 ; 2-5× : 7,53) |
| 5 à 20× | 2,93 % | — |
| 20 à 100× | 0,473 % | — |
| 100 à 500× | 0,052 % | — |
| ≥ 500× | 0,001 % | 0,000 % pour ≥ 1000× |

### 1.6 Paliers d'annonce de gros gain (`G.WIN_TIERS = [1, 10, 25, 75, 300]`, rapportés au **coût du tour**)

| Palier | Seuil | Standard (4 M) | Oracle+ (4 M, seuils sur coût ×1,1) |
|---|---|---|---|
| WIN | ≥ 1× | 20,64 % (1 tour sur 5) | 12,73 % (1 sur 8) |
| BIG WIN | ≥ 10× | 1,41 % (**1 / 71**) | 1,30 % (1 / 77) |
| EXTRA WIN | ≥ 25× | 0,359 % (**1 / 278**) | 0,362 % (1 / 276) |
| MEGA WIN | ≥ 75× | 0,0636 % (**1 / 1 571**) | 0,0676 % (1 / 1 479) |
| JUGEMENT DIVIN | ≥ 300× | 0,0063 % (**1 / 15 810**) | 0,0024 % (≈ 1 / 42 000, trop rare pour être fiable sur 4 M) |

À 1 tour toutes les 13 s, un BIG WIN arrive en moyenne toutes les ≈ 15 minutes de jeu, un EXTRA toutes les ≈ 1 h, un MEGA toutes les ≈ 5,7 h et un JUGEMENT DIVIN toutes les ≈ 57 h [estimé]. Le palier le plus haut est donc quasi inaccessible à une séance normale : à l'inverse, un joueur voit un WIN simple toutes les 5 tours.

### 1.7 Espérance isolée de chaque bonus (`tools/tune.js`, 1 M tirages) [mesuré]

| Bonus | Espérance | Écart-type | Max observé |
|---|---|---|---|
| Scarabées | 5,08× | 4,3 | 75× |
| Pesée du Cœur | 5,81× | 17,7 | 300× |
| Trésor | 7,32× | 6,6 | 187× |
| Fureur d'Anubis | 24,71× | 38,7 | 4 000× |
| Crypte (secret) | 7,61× | 25,8 | 5 000× (6 tirages sur 1 M plafonnés) |

Secret contre bonus remplacé : 7,609× contre 7,561×, soit +0,047× et **≈ +0,010 pt de RTP** : neutre.
Profils prudent / équilibré / audacieux (`tune-profiles.js`) : écarts d'espérance de −0,13 % à +0,14 % pour chaque bonus [mesuré]. **Ces profils ne sont plus proposés au joueur** (voir 2.5) : la fonction `chooseScene` de `js/bonuses.js` n'est plus appelée [code].

### 1.8 Séries sans gain, écart entre bonus, temps pour gagner ou perdre

Définitions : *série à zéro* = tours consécutifs qui paient exactement 0 ; *série perdante* = tours consécutifs qui paient **moins que le coût** (la mise n'est pas récupérée). Longueurs calculées sur toutes les séries d'un échantillon de 4 M de tours [mesuré].

| Indicateur | Standard | Oracle+ |
|---|---|---|
| Série à zéro : médiane / p90 / p95 / p99 | 1 / 3 / 4 / 5 | 1 / 3 / 4 / 5 |
| **Série perdante** (gain < coût) : médiane / p90 / **p95** / p99 | 4 / 10 / **13** / 20 | 6 / 17 / **22** / 34 |
| **Tours avant un bonus** : p50 / p75 / p90 / p95 / p99 | **9** / 19 / **32** / 42 / 65 (moyenne 13,7) | identique |

Lecture : le zéro pur est court (jamais 6 d'affilée en pratique), ce qui donne un rythme agréable ; mais les petits retours à 0,25× et 0,5× rallongent la série réellement perdante à 13 tours dans 1 cas sur 20. Un joueur sur dix attend plus de 32 tours (≈ 7 minutes à vitesse normale) avant son premier bonus [estimé].

**Marches aléatoires** (4 000 séances par mode, [mesuré]) :

| Scénario | Standard | Oracle+ |
|---|---|---|
| Capital de 100 mises : atteint le double (200) avant la ruine | **29,4 %**, médiane 361 tours (p90 : 1 123) | 29,5 %, médiane 308 tours (p90 : 869) |
| Capital de 100 mises : ruine avant le double | 70,6 %, médiane 509 tours (p90 : 1 212) | 70,5 %, médiane 437 tours (p90 : 1 021) |
| Perdre 100 mises nettes depuis un capital illimité (premier passage) | atteint dans 97,5 % des cas en 20 000 tours ; médiane **738 tours** (p10 : 297, p90 : 4 539) | 97,6 % ; médiane 627 tours (p10 : 248, p90 : 3 669) |
| Résultat net après 200 tours (en mises) | p5 −79,8 · p25 −51,6 · **médiane −24,8** · p75 +18,5 · p95 +120 ; **33,9 % de séances positives** | médiane −27,5 ; 33,5 % positives |

Le mode Oracle+ a le **même profil de risque de ruine** que le Standard mais plus de dispersion (écart-type 6,37 contre 5,46, référence 1 milliard de tours). Les RTP affichés dans le jeu (`STATS.rtp = '96.1'`, `STATS.rtpPlus = '96.0'`, `js/main.js:8`) : Oracle+ est correct ; le Standard devrait afficher `96.2` (96,22 %).

### 1.9 Durée d'un tour à vitesse normale [estimé d'après le code]

| Étape | Durée (s) | Source du chiffre |
|---|---|---|
| Armement + spin de la roue | 0,5 + 6,2 + 0,25 = **≈ 7,0** | `G.wheel.spinTo` (`js/game.js:607`) |
| Annonce Oracle | +1,5 | `W.showOracle` |
| Résultat sans gain | +0,45 | `main.js` `play()` |
| Résultat d'une case qui paie (< 1×) | +0,8 | idem |
| Ankh : relance gratuite | +1,3 puis un nouveau spin complet | idem |
| Animation de gros gain | WIN ≈ 2,2 · BIG ≈ 4,8 · EXTRA ≈ 5,8 · MEGA ≈ 7,5 · DIVIN ≈ 9,4 | `WT[]` (compte + maintien + fermeture) ; un toucher l'écourte |
| Overhead d'un bonus (sortie d'Anubis, fondus, intro avec bouton) | ≈ 8 à 12 | `G.emerge` 2,7 + fondus 1,7 + intro ≥ 1,1 s + clic ; +4 pour le choix de couleur de la Fureur |
| Scène Scarabées | ≈ 25 à 35 | 2 s d'intro + 3 billes (≈ 4 à 6 s chacune) + 3,2 s de gain |
| Scène Pesée | ≈ 30 à 45 | dépend de la décision du joueur |
| Scène Trésor | ≈ 25 à 45 | jusqu'à 7 tuiles, 1 à 2 s de réflexion chacune |
| Scène Fureur d'Anubis | ≈ 35 à 55 | 4,2 à 6,8 s par rotation, jusqu'à 5 rotations |
| Scène Crypte | ≈ 45 à 60 | 9 blocs, bulle d'aide à chaque premier type de bloc |

Résultat du modèle sur 4 M de tours Standard :
- **tour sans bonus : ≈ 9,2 s** ; **tour moyen : ≈ 12,6 s** (13,1 s en Oracle+) ; **tour avec bonus : ≈ 60 s** ;
- les bonus occupent **≈ 32 % du temps de jeu** pour 6,8 % des tours ;
- 100 tours ≈ **21 minutes** ; doubler un capital de 100 mises (médiane quand cela arrive) ≈ **76 minutes** ; atteindre −100 mises nettes (médiane) ≈ **2 h 35** ;
- le toucher sur la roue accélère le spin ×3,2 (`G.onWheelTap`) ; Turbo et Ultra ramènent un tour à quelques secondes (≈ 3 à 4 s en Turbo, ≈ 1,5 à 2 s en Ultra, **non chronométré**). **Le turbo se coupe dès qu'un bonus est atteint** (`main.js` `play()`, commit 28a546b) : tous les bonus se jouent à vitesse normale.

### 1.10 Achat de bonus (`simulate.js 3000000 5 buy-*`) [mesuré]

| Bonus acheté | Prix (× mise) | RTP simulé | Écart-type (× mise) | Achats qui paient > 0 | Gain max |
|---|---|---|---|---|---|
| Scarabées | 6,9 | 96,34 % | 13,0 | 99,8 % | 3 000× |
| Pesée du Cœur | 7,6 | 96,51 % | 21,0 | **53,8 %** (46 % d'achats à zéro) | 5 000× |
| Trésor | 9,1 | 95,80 % | 13,4 | 99,7 % | 3 000× |
| Fureur d'Anubis | 25,6 | 96,45 % | 38,0 | 97,7 % | 5 000× |

Le RTP d'achat (95,8 à 96,5 %) est celui du jeu de base à ±0,3 pt : **pas de biais exploitable**. Le point sensible est l'information : la Pesée achetée rend zéro près d'une fois sur deux (le plateau le plus lourd est tiré 50/50 indépendamment du choix, `weigh()` dans `js/math.js`), ce que l'écran d'achat ne dit pas [code]. La Fureur peut aussi saisir un bonus acheté (8 %), ce qui explique les 3 000× constatés sur Scarabées et Trésor.

### 1.11 Incohérences relevées entre code et documents [code]

- `docs/ANALYSE.md` §5 annonce 61,3 % de tours gagnants et 3 600× de gain max ; la mesure donne **60,3 %** et 3 285× (le jeu affiche déjà 60,3 %, `STATS.hit`).
- `docs/ANALYSE.md` §8 cite des limites de perte « 1 000 / 5 000 / 20 000 » ; le code propose `LIMITS = [0, 20, 50, 100, 250, 500]` (`js/main.js:20`).
- `docs/ANALYSE.md` « SWOT face aux concurrents » liste encore « choix Prudent / Équilibré / Audacieux avant chaque bonus » en force : supprimé du jeu (commit bdbf698), `chooseScene` est du code mort.
- `docs/ANALYSE.md` itération 18 dit que les bonus gardent une vitesse élevée en turbo ; `main.js` coupe le turbo en arrivant sur un bonus, donc la branche turbo de `G.runBonus` ne s'exécute plus (commentaire de `runBonus` périmé).
- `js/math.js` commente « La roue (54 cases) » alors que `LAYOUT` en compte 48.

---

## 2. Analyse d'expérience joueur, moment par moment

### 2.1 Entrée dans le jeu (splash, premier contact)

| | |
|---|---|
| Ce qui marche | Écran d'accueil avec image, clic ou Espace pour entrer, ce qui déverrouille l'audio sans friction [code]. FR/EN, devise suivant la langue. 1 000 de solde de départ (« démo »). |
| Ce qui plombe | **Aucun tutoriel** : la règle de la roue, de l'Oracle, de l'Ankh et des bonus ne se lit que dans la fenêtre « Infos » [code]. Un nouveau joueur ne sait pas que toucher la roue accélère, que les cases lumineuses sont des boosts, ni que le bouton Oracle+ coûte 10 % de plus. Le fichier unique d'≈ 1,8 Mo se charge sans indicateur de progression [supposé : non testé sur réseau lent]. |

### 2.2 Attente (avant le spin)

| | |
|---|---|
| Ce qui marche | Roue vivante (lampes en chenillard, rayons, poussière d'or, yeux des gardiens qui pulsent, pointeur à ressort) [code]. Ligne d'état « Tournez la roue du jugement ». Mixeur rapide, historique des 10 derniers tours. |
| Ce qui plombe | En attente, **rien ne change dans le texte ni dans la musique** : la ligne d'état est fixe, pas de message d'Anubis, pas de rappel que le toucher accélère. L'historique de 10 puces ne donne ni détail ni contexte. Pas de compteur de séance visible sans ouvrir « Infos ». |

### 2.3 Tension et anticipation (le spin)

| | |
|---|---|
| Ce qui marche | Le spin dure 6,2 s avec une courbe `1 − (1 − u)^3,6` : décélération longue et lisible, flou de mouvement, claquements du pointeur sur chaque case [code]. L'Oracle annonce **avant** le tour une case boostée (×2 à ×25), ce qui crée une vraie anticipation honnête : le joueur sait ce qu'il espère [code]. L'Ankh donne une relance visible avec bouclier sonore. |
| Ce qui plombe | La décélération est **identique pour tous les résultats** : aucune montée de tension particulière quand la roue approche d'une case bonus (c'est honnête, mais on perd l'effet de « crawl » que la DA mentionne, `docs/ANALYSE.md` §4). Un spin à 7 s sans possibilité de passer rapidement autrement que le toucher sur la roue (×3,2) ni mode intermédiaire : à 13 s en moyenne par tour, le rythme est **lent pour un jeu de slot** [supposé : référence ≈ 3 à 6 s par tour]. |

### 2.4 Récompense immédiate (gains de base)

| | |
|---|---|
| Ce qui marche | Cinq animations de gros gain graduées (WIN → JUGEMENT DIVIN) avec compteur en devise, pluie de pièces, secousses et musique montante ; un toucher écourte (`G.skipWinOv`) [code]. Le seuil se rapporte au **coût du tour**, donc il reste juste en achat de bonus et en Oracle+. |
| Ce qui plombe | **39,7 % des tours rendent moins que la mise** mais déclenchent flottant « ×0,25 », étincelles, carillon (`Sfx.chime`) et clignotement des lampes (`main.js` `play()`, branche `sp.pay > 0`) [code + mesuré]. Un joueur entend un son de victoire sur un tour qui lui coûte de l'argent : c'est le motif classique du « gain déguisé en perte » (*loss disguised as a win*), mal vu par plusieurs régulateurs. À l'inverse, le seul palier à animation riche, WIN, ne tombe que 1 tour sur 5. |

### 2.5 Bonus : annonce, entrée, jeu, sortie

| Moment | Ce qui marche | Ce qui plombe |
|---|---|---|
| Annonce | Anubis **surgit du centre de la roue**, une apparition par bonus (scarabées, plume et cœur, coffre d'or, yeux rouges pour la Fureur, flammes violettes pour la Crypte) : la rareté se lit dans la mise en scène (Fureur et Crypte en plein écran) [code] | Aucune indication que la Fureur est rare (1/188) avant l'apparition ; le joueur découvre quel bonus il a, c'est voulu, mais l'écran d'intro ne rappelle ni les règles ni l'enjeu |
| Entrée | Bouton « LANCER LE BONUS » (ou Espace) : l'annonce est un temps de respiration, puis le joueur déclenche lui-même [code] | **Clic obligatoire** à chaque bonus (en jeu normal), puis souvent un second écran (couleur de la Fureur) ; en auto/turbo, repli automatique à 1,6 s |
| Jeu | Quatre mécaniques distinctes ; décisions réelles dans le Trésor (quelles tuiles) ; Scarabées en vraie physique ; Crypte avec bulles d'aide au premier bloc de chaque type [code] | **Choix cosmétiques** : dans la Pesée, le plateau « le plus lourd » est tiré 50/50 indépendamment du choix du joueur ; les trois couleurs de la Fureur sont strictement équivalentes ; le choix de risque Prudent / Équilibré / Audacieux a été retiré (commit bdbf698). L'interaction est plus ressentie que réelle : à assumer honnêtement (aucune mention de « stratégie ») |
| Sortie | Récapitulatif du gain avec compteur ; pièces, flash, retour à la roue en fondu [code] | Pas de **récapitulatif de bonus** (meilleur coup, combien de fois ceci est arrivé) ni de possibilité de revoir ; le turbo est coupé à l'entrée du bonus et **ne revient pas** : le joueur doit le relancer à la main après chaque bonus [code] |

Durée d'un bonus : ≈ 40 à 70 s à vitesse normale, ce qui représente 32 % du temps de jeu [estimé].

### 2.6 Rythme global

Un tour moyen dure ≈ 12,6 s ; un tour sans bonus ≈ 9,2 s ; 9 tours médians (≈ 1 min 50) avant un bonus [estimé]. Le jeu alterne donc de courts moments de roue et de longs bonus à fort impact, ce qui est une bonne **courbe d'intensité** ; le creux est le milieu (tours 5 à 15 sans bonus ni gros gain) où la seule récompense est un carillon sur 0,25× et 0,5×.

### 2.7 Points de friction listés

1. **Aucun tutoriel ni infobulle** à la première partie (information manquante).
2. **Clic obligatoire** pour lancer chaque bonus hors turbo, plus clic de couleur pour la Fureur.
3. **Turbo coupé à chaque bonus** et jamais rétabli (une seule passe de réglage perdue par bonus).
4. **Carillons et animations sur les petits retours** (< mise) : nuit à la lisibilité (on ne distingue plus gain réel et perte) et à la conformité.
5. **Taux de gain 60,3 % affiché seul** dans « Infos » alors que 20,6 % seulement des tours rendent au moins la mise : l'écran induit une lecture trop optimiste.
6. **Achat de bonus** : pas de mise en garde que la Pesée achetée rend 0 une fois sur deux ; pas de confirmation à l'achat (un clic sur la carte lance l'achat, `main.js` `openBuy`).
7. **Statistiques de séance cachées** dans le panneau « Infos », pas visibles pendant le jeu.
8. **Roue sans variation d'ambiance** pendant l'attente (texte fixe, pas de message).
9. **Accessibilité** : `prefers-reduced-motion` respecté au premier lancement, contraste WCAG AA vérifié (`tools/contrast.js`) ; mais pas de mode « photosensible » plus fin (flashs plein écran `FX.flash` fréquents), le canvas est un seul `role="img"`, la plupart des événements de jeu ne sont annoncés que via `#status` [code].
10. **Aucune dimension sociale ni partage** (pas de capture de gros gain).

---

## 3. Benchmark synthétique contre les concurrents

Source : `docs/CONCURRENTS.md` (recherche web du 2026-10-12, sources faibles). Colonne Anubis = valeurs **mesurées** ci-dessus ; colonnes concurrents = informations citées, **non vérifiées**.

| Critère | Anubis Unchained | Crazy Time / Monopoly Live (Evolution) | Wheel of Fortune Megaways (IGT) | Book of Dead, Legacy of Dead (Play'n GO) | Gates of Olympus, Sweet Bonanza (Pragmatic) | Plinko (Stake / BGaming) |
|---|---|---|---|---|---|---|
| Format | Roue 48 cases, un tour par mise, hors ligne | Roue de 54 segments, animateur live, paris multiples | Slot + roue bonus | Slot 5×3, free spins avec symbole expansif | Slot scatter pays, tumbles | Bille, niveaux de risque |
| RTP | 96,22 % (96,00 % Oracle+), mesuré sur 1 milliard de tours | 96,08 % / 96,23 % cités, non vérifiés | 96,46 % cité | 96,21 % / 96,58 % cités | 96,5 % cités | 99 % cité |
| Gain max | 5 000× | 10 000× à 50 000× cités, contradictoires | 82 700× cité | 5 000× cité | 5 000× / ≈ 21 100× cités | jusqu'à 1 000× cité |
| Fréquence de bonus | 1/14,65 (mesuré) | 1/18 à 1/22 cités pour Monopoly Live | non trouvée | non trouvée | non trouvée | pas de bonus |
| Interaction dans le bonus | Moyenne : décisions dans le Trésor, choix cosmétiques ailleurs | Faible : bonus de spectateur | Faible | Aucune | Aucune | Choix de risque avant la partie |
| Achat de bonus | Oui (4 bonus, 6,9× à 25,6×) | Non | Non | Non | Oui (100× cité) | Non |
| Spectacle visuel | Fort (Anubis surgit, animations de gain en 5 paliers) | Très fort (live) | Moyen | Moyen | Fort (cascades) | Faible |
| Rythme d'un tour | ≈ 9 s (sans bonus), ≈ 13 s moyen | ≈ 25 s de table live [supposé] | Slot rapide [supposé] | Slot rapide [supposé] | Slot rapide [supposé] | Très rapide |
| Tutoriel, aide | Aucun tutoriel ; table des gains dans « Infos » | Aide et animateur | Aide en jeu | Aide en jeu | Aide en jeu | Minimal |
| Social, partage | Non | Table partagée (live) | Non | Non | Non | Non |

**Où Anubis Unchained gagne** : fréquence de bonus supérieure à celle citée pour Monopoly Live ; roue + 4 mini-jeux dans un seul jeu ; mise en scène des bonus ; transparence des maths (simulation ouverte).
**Où il perd** : gain maximal modeste ; rythme plus lent que les slots classiques (si l'on exclut le live) ; pas d'aide ni de tutoriel ; pas d'effet social.
**Où il est à égalité** : plafond 5 000× comme Gates of Olympus (cité), RTP dans la fourchette citée de ses concurrents.

---

## 4. SWOT détaillé

### Forces

| # | Force | Preuve |
|---|---|---|
| F1 | **RTP stable et symétrique** : 96,22 % Standard, 96,00 % Oracle+ (1 milliard de tours), 95,8 à 96,5 % à l'achat ; les profils anciens sont à ±0,15 % | [mesuré] 12 M + 3 M par bonus |
| F2 | **Rythme de bonus généreux** : 1 tour sur 14,65 ; 9 tours médians avant un bonus | [mesuré] |
| F3 | **Zéro pur court** : p99 de la série à zéro = 5 tours ; la roue ne « gèle » pas | [mesuré] |
| F4 | **Mise en scène d'Anubis** : apparition propre à chaque bonus, rareté lisible (Fureur, Crypte en plein écran), 5 paliers d'animation de gain | [code] |
| F5 | **Anticipation honnête** : l'Oracle annonce la case boostée avant le tour ; l'Ankh donne une relance visible | [code] |
| F6 | **Quatre bonus de natures distinctes + un bonus secret** (physique, hasard pur, pick-me, roue imbriquée, blocs) | [code] |
| F7 | **Moteur testable et rejouable** : `js/math.js` pur, script d'événements, 6 suites de tests | [code] |
| F8 | **Jeu responsable présent** : limite de perte, rappel toutes les 30 min, stats de séance, achat désactivable, mode réduit des effets | [code] |
| F9 | **Accessibilité de base** : contraste AA, réduction des effets, clavier (Espace, flèches, 1/2/3), FR/EN | [code] + [mesuré] `tools/contrast.js` |
| F10 | **Turbo / Ultra** pour qui veut aller vite | [code] |

### Faiblesses

| # | Faiblesse | Preuve |
|---|---|---|
| W1 | **Rythme lent en jeu normal** : 9 s sans bonus, 13 s en moyenne, 60 s par bonus | [estimé] |
| W2 | **Gain déguisé en perte** : 39,7 % des tours rendent < mise avec carillon et étincelles | [mesuré] + [code] |
| W3 | **Aucun tutoriel ni explication contextuelle** | [code] |
| W4 | **Interaction surtout cosmétique** dans la Pesée, la Fureur (couleur) et sans choix de risque | [code] |
| W5 | **Turbo coupé à chaque bonus**, bonus longs (jusqu'à 1 min) | [code] |
| W6 | **Palier maximal quasi inatteignable** (JUGEMENT DIVIN 1/15 800 ≈ 57 h de jeu) ; seule variété d'excitation : BIG (toutes les ≈ 15 min) | [mesuré] + [estimé] |
| W7 | **Pas de progression ni de mémoire** : rien ne se débloque, aucun objectif, aucune statistique visible en jeu | [code] |
| W8 | **Pas de partage ni moment de fierté** | [code] |
| W9 | **Aucune validation extérieure** : RNG navigateur, pas d'audit, son jamais écouté par un humain, mobile d'entrée de gamme non testé | `docs/ANALYSE.md` §7 |
| W10 | **Documents périmés** (voir 1.11) et RTP Standard affiché 96,1 au lieu de 96,2 (1 milliard de tours) | [code] |
| W11 | **Une série perdante p95 = 13 tours en Standard (22 en Oracle+)** : la lisibilité de la perte est bonne, mais l'absence de gros gain dans ces séries est ressentie | [mesuré] |

### Opportunités

| # | Opportunité | Statut |
|---|---|---|
| O1 | Combler le **vide de progression sans pression** : codex de bonus, habillages cosmétiques, objectifs de séance optionnels | [supposé], faisable sans toucher aux maths |
| O2 | **Rejouabilité des bonus** : fiche de règles, récap de fin de bonus, revoir | [supposé] |
| O3 | **Micro-interactions et son** : le jeu a une base d'effets (`FX`, `Sfx`), il reste de la marge pour le « juice » à coût faible | [code] |
| O4 | **Moments partageables** : capture d'écran de gros gain, cadre « Anubis a parlé » | [supposé] |
| O5 | **Transparence comme argument** : afficher RTP par mode, taux de gain « ≥ mise », probabilité des paliers | [supposé] |
| O6 | **Accessibilité comme différenciation** : mode photosensible, annonces vocales, daltonisme | [supposé] |
| O7 | Format de roue non live sur Stake Engine, peu servi | `docs/CONCURRENTS.md`, [non vérifié] |

### Menaces

| # | Menace | Statut |
|---|---|---|
| T1 | **Conformité** : le gain déguisé en perte, l'absence d'affichage du taux « ≥ mise », l'achat de bonus sans avertissement | [supposé] ; à vérifier auprès de la doc Stake et des règles des juridictions visées |
| T2 | **Propriété intellectuelle** : roue à bonus proche de Crazy Time / Monopoly Live, Plinko et Coin Flip comme archétypes | `docs/ANALYSE.md` §6, [supposé] |
| T3 | **Nom** « Anubis Unchained » non vérifié légalement ; droits des images générées à confirmer | `docs/ANALYSE.md` |
| T4 | **Un joueur sur trois n'est jamais positif** après 200 tours (33,9 %) et 70,6 % des capitaux de 100 mises sont perdus avant d'être doublés : une attractivité qui pousse à jouer plus longtemps aggraverait cet effet | [mesuré] |
| T5 | **Fatigue visuelle / photosensibilité** : flashs plein écran, lampes qui clignotent, secousses | [supposé] |
| T6 | **Concurrence** de slots rapides, riches en gros gains (Pragmatic, 21 100× cité) | `docs/CONCURRENTS.md`, non vérifié |

### Ce qui est mesuré, ce qui est supposé

- **Solide** : tous les chiffres des sections 1.2 à 1.8 et 1.10 (simulation, graines et tailles indiquées). Marge d'erreur du RTP ≈ ±0,2 pt ; les paliers au-dessus de MEGA sont peu précis (quelques centaines d'événements sur 4 M de tours).
- **Reconstruit** : toutes les durées et les temps en minutes (section 1.9) : recomposés depuis le code, **jamais chronométrés**. Le modèle ignore le temps de réflexion du joueur, les accélérations par toucher et les variations de machine.
- **Supposé** : toute lecture du ressenti (section 2), tout classement face aux concurrents, tout jugement de conformité.

---

## 5. Plan d'attractivité priorisé

**Règle de garde-fou.** Toutes les idées respectent : aucune modification de la table de paiement ni des probabilités (RTP inchangé, à revérifier par `tools/simulate.js` seulement pour les idées qui touchent aux maths : aucune) ; aucun faux « presque gagné » (pas de recul de roue d'un cran, pas de frôlement simulé) ; aucune pression de durée (pas de chronomètre, de série quotidienne, de bonus de connexion) ; aucune récompense monétaire liée au volume de jeu ; les statistiques affichées sont des **comptes** (tours, bonus, meilleur gain), jamais un signal du type « un bonus est dû ».

Légende : impact (1 à 5, ressenti du joueur), effort S (≤ 1 j) / M (2 à 4 j) / L (≥ 1 semaine), risque RTP/conformité (aucun / faible / moyen).

| Rang | # | Idée | Impact | Effort | Risque |
|---|---|---|---|---|---|
| 1 | 1 | Sobriété sur les retours < mise | 4 | S | aucun (améliore la conformité) |
| 2 | 3 | Onboarding en 3 cartes | 5 | S | aucun |
| 3 | 5 | Messages d'Anubis en attente | 3 | S | aucun |
| 4 | 2 | Compteurs de séance visibles | 3 | S | faible (formulation) |
| 5 | 16 | Fiche de règles par bonus | 4 | S | aucun |
| 6 | 17 | Achat de bonus : transparence | 3 | S | aucun (améliore la conformité) |
| 7 | 4 | Capture d'un gros gain | 4 | S/M | faible (mention « démo ») |
| 8 | 7 | Turbo pendant les bonus (option) et saut d'animation | 4 | S/M | aucun |
| 9 | 6 | Ralentissement final « crawl » identique pour toute issue | 4 | M | faible (jamais de faux frôlement) |
| 10 | 8 | Récapitulatif de fin de bonus | 3 | M | aucun |
| 11 | 14 | Micro-interactions du HUD | 3 | M | aucun |
| 12 | 13 | Pack accessibilité | 4 | M | aucun (améliore la conformité) |
| 13 | 12 | Statistiques de séance avec courbe | 3 | M | faible |
| 14 | 15 | Vibrations (mobile) | 2 | S | aucun |
| 15 | 20 | Historique cliquable et revoir un bonus | 3 | M | aucun |
| 16 | 9 | Codex d'Anubis (découvertes) | 4 | M | faible |
| 17 | 19 | Splash vivant et chargement progressif | 2 | S/M | aucun |
| 18 | 11 | Objectifs de séance optionnels | 3 | M | moyen (risque d'incitation) |
| 19 | 18 | Audio dynamique et voix d'Anubis | 4 | L | aucun |
| 20 | 10 | Habillages de roue débloqués par le codex | 3 | L | faible |

### Fiches détaillées

**1. Sobriété sur les retours < mise (gain déguisé en perte).**
- *Description* : pour un spin dont le gain est inférieur au coût du tour, remplacer carillon, étincelles et clignotement des lampes par un retour discret (valeur en gris-or, son bref et bas, pas de flash). Le texte indique « retour ×0,25 », pas « gain ».
- *Impact* : lisibilité, confiance, conformité ; baisse légère du « plaisir sonore » à corriger par l'idée 14.
- *Effort* : S. *Risque* : aucun sur le RTP ; **réduit** le risque de conformité.
- *Fichiers* : `js/main.js` (branche `sp.pay > 0` de `play()`), `js/audio.js` (nouveau `Sfx.tick`/`Sfx.coin` bas), `js/i18n.js`.
- *Critère de réussite* : sur 1 000 tours simulés (`G.play` en `?debug`), aucun appel à `Sfx.chime`, `FX.spark` ni `flashLamps` quand `pay < priceMult` ; le premier tour ≥ mise garde le carillon.

**2. Compteurs de séance visibles.**
- *Description* : une ligne discrète sous l'historique : « Tours 42 · Bonus 3 · Meilleur gain ×18 ». Comptes uniquement (jamais « tours depuis le dernier bonus », qui nourrit l'erreur du joueur).
- *Impact* : repère de session, soutient le jeu responsable. *Effort* : S. *Risque* : faible, vérifier la formulation.
- *Fichiers* : `index.html`, `css/style.css`, `js/main.js` (`SESS`, `pushHistory`), `js/i18n.js`.
- *Critère* : les trois chiffres suivent `SESS.spins`, le nombre de tours avec bonus et le plus grand `total` de la séance ; ils survivent à un rechargement de la page seulement si la séance est reprise.

**3. Onboarding en trois cartes.**
- *Description* : à la toute première entrée (clé `localStorage`), trois cartes de 6 secondes max : (1) « Touchez TOURNER ; touchez la roue pour accélérer » ; (2) « Les cases lumineuses sont boostées par l'Oracle » ; (3) « Les cases Scarabées, Pesée, Trésor ouvrent un bonus ». Bouton « Passer » à chaque carte ; bouton « Comment jouer » dans `Infos` pour la rouvrir.
- *Impact* : 5, c'est le plus grand trou d'information. *Effort* : S. *Risque* : aucun.
- *Fichiers* : `js/main.js` (`showMsg`/`showModal`), `js/i18n.js`, `css/style.css`.
- *Critère* : un profil neuf voit les cartes une fois ; un profil existant ne les voit pas ; le test `tools/e2e.js` passe ; aucune fuite de focus (Tab piégé comme les autres fenêtres).

**4. Capture d'un gros gain.**
- *Description* : à la fin du compteur d'un gain EXTRA ou plus, bouton « Enregistrer l'image » : export du canvas (`toBlob`) avec cartouche montant, ×, mise, date et mention « Démo, argent fictif ».
- *Impact* : moment de fierté partageable. *Effort* : S/M. *Risque* : faible (la mention « démo » est obligatoire tant que le RNG est local).
- *Fichiers* : `js/game.js` (`winLand`), `js/main.js`, `index.html`, `css/style.css`.
- *Critère* : le PNG s'ouvre, fait 1280 px de large au moins, contient le montant exact et la mention ; aucun envoi réseau.

**5. Messages d'Anubis en attente.**
- *Description* : toutes les 9 s d'inactivité, la ligne d'état change parmi 12 phrases par langue (quatre sont des conseils : toucher la roue, Oracle+, mixeur, réglages) ; arrêt dès qu'un tour démarre.
- *Impact* : écran d'attente vivant et information manquante. *Effort* : S. *Risque* : aucun (aucune phrase ne promet un gain).
- *Fichiers* : `js/main.js` (`say`), `js/i18n.js`.
- *Critère* : en attente 60 s, au moins 5 messages différents défilent ; aucun ne contient « bientôt », « prochain » ni « chance ».

**6. Ralentissement final « crawl » identique pour toute issue.**
- *Description* : la roue passe les trois dernières cases avec un tempo ralenti (fixe, indépendant de la case d'arrivée), un tick de plus en plus grave, une légère avancée de caméra. Les lampes de la jante accélèrent leur chenillard quand le pointeur franchit une case bonus (physiquement présente), jamais en fonction du résultat à venir.
- *Impact* : tension honnête. *Effort* : M. *Risque* : faible ; **interdit** : reculer d'un cran, rebondir sur la case adjacente, ralentir plus longtemps pour un bonus que pour un 0.
- *Fichiers* : `js/game.js` (`W.spinTo`, `drawPointer`), `js/audio.js`.
- *Critère* : 1 000 spins sans consigne : la durée totale et la courbe de vitesse finale ne dépendent pas de `spin.index` (test statistique sur la durée, écart < 1 %).

**7. Turbo pendant les bonus (option) et saut d'animation.**
- *Description* : réglage « Turbo dans les bonus » (Non par défaut) qui garde la vitesse ; bouton « Passer » sur l'intro et sur le récapitulatif ; le turbo se rétablit seul après un bonus s'il était actif avant.
- *Impact* : supprime la friction n° 3. *Effort* : S/M. *Risque* : aucun.
- *Fichiers* : `js/main.js` (`play`), `js/bonuses.js` (`G.runBonus`).
- *Critère* : le mode turbo actif avant un bonus l'est encore après ; `tools/e2e.js` couvre un bonus en turbo.

**8. Récapitulatif de fin de bonus.**
- *Description* : écran de 4 lignes : nom du bonus, meilleur coup (bille, tuile, rotation), gain en × et en devise, nombre de fois que ce bonus est apparu dans la séance.
- *Impact* : conclusion claire. *Effort* : M. *Risque* : aucun.
- *Fichiers* : `js/bonuses.js` (`settle`), `js/main.js`.
- *Critère* : les valeurs du récap égalent le script (`sp.bonus`) ; pas de tap supplémentaire en turbo/auto.

**9. Codex d'Anubis (progression cosmétique par découverte).**
- *Description* : une page de 5 cartes (4 bonus + Crypte verrouillée) qui se révèlent au premier passage : illustration, règle en deux lignes, meilleur gain de la séance et nombre d'apparitions. Se remplit uniquement par la découverte, pas par le volume joué.
- *Impact* : sentiment de collection. *Effort* : M. *Risque* : faible (la Crypte reste secrète : carte « ??? » tant qu'elle n'est pas apparue).
- *Fichiers* : `js/main.js`, `js/i18n.js`, `css/style.css`, `js/art.js`.
- *Critère* : chaque carte s'ouvre exactement au premier déclenchement ; le stockage reste local ; aucune récompense monétaire.

**10. Habillages de roue (lapis, turquoise, obsidienne).**
- *Description* : trois palettes de roue débloquées par le codex (ex. voir les 4 bonus), purement visuelles.
- *Impact* : personnalisation. *Effort* : L (retouche de `js/art.js` et de `G.kindColor`). *Risque* : faible, vérifier le contraste (`tools/contrast.js`) et la lisibilité des chiffres.
- *Fichiers* : `js/game.js`, `js/art.js`, `js/grade.js`.
- *Critère* : contraste AA conservé sur chaque palette ; aucune différence de maths.

**11. Objectifs de séance optionnels.**
- *Description* : le joueur peut activer « Mes petits objectifs » (désactivé par défaut) : 3 objectifs de découverte (voir la Pesée, atteindre un BIG WIN, essayer le Turbo) sans durée, sans récompense monétaire, sans série.
- *Impact* : repères. *Effort* : M. *Risque* : **moyen** : un objectif peut inciter à jouer plus longtemps ; ne jamais proposer d'objectif de volume (« 50 tours »), ni de bonus à gagner.
- *Fichiers* : `js/main.js`, `js/i18n.js`.
- *Critère* : revue de conformité avant mise en ligne ; aucune notification poussant à rejouer.

**12. Statistiques de séance avec courbe.**
- *Description* : dans `Infos`, courbe du solde sur la séance (≤ 200 points), RTP de séance, temps joué, gain le plus élevé, répartition 0 / < mise / ≥ mise. Rappel de pause réglable (15 / 30 / 60 min).
- *Impact* : transparence, jeu responsable. *Effort* : M. *Risque* : faible.
- *Fichiers* : `js/main.js` (`openInfo`, `SESS`), `css/style.css`.
- *Critère* : la courbe reflète `S.balance` après chaque tour ; la durée du rappel est lue du réglage.

**13. Pack accessibilité.**
- *Description* : mode « photosensible » (limite des flashs plein écran à 3 par seconde, supprime les secousses) ; annonces `aria-live` pour chaque résultat (« Gain : 2,40 € ») ; motifs en plus des couleurs sur les cases de la roue (daltonisme) ; échelle de texte (100 / 125 / 150 %) ; navigation clavier complète des bonus.
- *Impact* : 4. *Effort* : M. *Risque* : aucun.
- *Fichiers* : `js/fx.js` (`flash`, `shake`), `js/game.js`, `js/main.js`, `index.html`, `css/style.css`, `tools/contrast.js`.
- *Critère* : `tools/layout.js` et `tools/contrast.js` verts ; parcours entièrement au clavier d'un tour et de chaque bonus.

**14. Micro-interactions du HUD.**
- *Description* : le compteur de solde « roule » (chiffres qui défilent) ; boutons mise − / + avec petit rebond et son ; pastille de gain qui s'allume ; pression du bouton TOURNER qui s'enfonce.
- *Impact* : sensation. *Effort* : M. *Risque* : aucun.
- *Fichiers* : `css/style.css`, `js/main.js` (`countTo`, `stepBet`), `js/audio.js`.
- *Critère* : aucun jank (moyenne de frame < 34 ms, `adaptQuality`) ; les animations respectent `S.reduced`.

**15. Vibrations (mobile).**
- *Description* : `navigator.vibrate` court sur arrêt de roue, 40 ms sur WIN, motif 3 coups sur BIG et plus ; option « Vibrations » activable (désactivée en mode effets réduits).
- *Impact* : 2. *Effort* : S. *Risque* : aucun.
- *Fichiers* : `js/main.js`, `js/game.js` (`showBigWin`).
- *Critère* : aucun appel si l'API est absente ou l'option désactivée.

**16. Fiche de règles par bonus.**
- *Description* : dans l'écran d'intro de chaque bonus : une phrase de règle, la valeur maximale possible et une icône. Pour la Pesée : « Le plateau le plus lourd est tiré au sort, votre choix ne l'influence pas. » (honnête). Pour la Fureur : « Les trois couleurs sont équivalentes. »
- *Impact* : 4 (comprendre ce qu'on joue). *Effort* : S. *Risque* : aucun.
- *Fichiers* : `js/bonuses.js` (`introScene`), `js/i18n.js`.
- *Critère* : chaque bonus affiche sa règle avant le bouton ; les textes existent en FR et EN (`tools/i18n-check.js` vert).

**17. Achat de bonus : transparence.**
- *Description* : dans la carte d'achat : RTP exact de ce bonus, probabilité de gain nul (Pesée : « ≈ 46 % de rendre 0 »), maximum possible ; confirmation « Acheter pour 7,60 € ? » avec bouton Annuler.
- *Impact* : confiance. *Effort* : S. *Risque* : aucun, **réduit** le risque.
- *Fichiers* : `js/main.js` (`openBuy`), `js/i18n.js`.
- *Critère* : un clic ne lance plus d'achat sans confirmation ; les chiffres affichés proviennent de la simulation (script de test qui les recoupe).

**18. Audio dynamique et voix d'Anubis.**
- *Description* : couches de musique selon l'état (attente, spin, tension en fin de spin, bonus) ; voix courte (3 à 5 phrases) à l'entrée d'un bonus ; mastering de loudness.
- *Impact* : 4. *Effort* : L. *Risque* : aucun (mais **faire écouter** par un humain : le son n'a jamais été écouté).
- *Fichiers* : `js/audio.js`, `js/main.js`, `js/bonuses.js`, éventuellement de nouveaux fichiers audio.
- *Critère* : niveau cohérent (aucun pic > −3 dBFS), commutation sans clics, coupure propre en muet.

**19. Splash vivant et chargement progressif.**
- *Description* : barre de chargement thématique (œil d'Anubis qui s'ouvre) ; message de conseils pendant la lecture des polices ; priorité aux images de première vue.
- *Impact* : 2. *Effort* : S/M. *Risque* : aucun.
- *Fichiers* : `index.html`, `js/main.js`, `css/style.css`.
- *Critère* : un chargement lent (réseau bridé) montre une progression, jamais un écran figé.

**20. Historique cliquable et revoir un bonus.**
- *Description* : cliquer une puce de l'historique ouvre le détail (cases, boost, gain) ; pour un bonus, « Revoir » rejoue le script enregistré sans mise.
- *Impact* : 3. *Effort* : M. *Risque* : faible (rejouer ne doit jamais créditer).
- *Fichiers* : `js/main.js` (`pushHistory`), `js/bonuses.js` (`G.testBonus` existant sert de base).
- *Critère* : le replay n'altère ni solde, ni statistiques de séance.

---

## 6. Cinq « quick wins » (≤ 1 jour chacun)

Chaque fiche est écrite pour qu'un autre agent la code sans interprétation. Noms d'éléments et de fonctions vérifiés dans le code actuel. Tous : aucun changement de `js/math.js`, aucun changement de RTP ; lancer `node tools/check.js`, `node tools/i18n-check.js` et `node tools/e2e.js` à la fin.

### QW1 — Sobriété sur les retours inférieurs à la mise

- **Où** : `js/main.js`, fonction `play()`, branche `else if (sp.pay > 0)` (autour de la ligne 168).
- **Règle** : `var small = sp.pay < priceMult;` (`priceMult` est déjà défini en début de `play()`).
- **Si `small`** : appeler `FX.float('×' + G.fmt(sp.pay), px, py, '#cdbd96', 26)` (taille 26 au lieu de 36, couleur gris-or) ; **ne pas** appeler `FX.spark`, `Sfx.chime`, `G.wheel.flashLamps` ; appeler `Sfx.coin(0.25)` (son bref existant) ; `await G.sleep(0.5)` au lieu de 0,8.
- **Sinon** : comportement actuel inchangé.
- **Le cas `sp.boost > 1`** garde le texte « Boost ×N » et son effet (l'Oracle reste une fête, même sur un petit gain).
- **Texte** : la ligne d'état finale reste `T.winLine + ' ×…'`, sauf si `total < priceMult` : afficher à la place `T.returnLine + ' ×' + G.fmt(total) + ' · ' + G.money(amount, true)` avec `returnLine` ajouté dans `js/i18n.js` : FR « Retour », EN « Return ».
- **Test** : `?debug`, forcer un tour à 0,25× : pas de carillon (inspecter les appels `Sfx.chime`), `setWin` toujours appelé, solde crédité du bon montant ; un tour à 1× garde le comportement actuel.

### QW2 — Compteurs de séance sous l'historique

- **Où** : `index.html` (après `<div id="history">`), `css/style.css`, `js/main.js`, `js/i18n.js`.
- **HTML** : `<div id="sessLine" aria-live="off"></div>` juste sous `#history`.
- **CSS** : `#sessLine { font: 600 12px var(--num-font, sans-serif); color: var(--dim); text-align: center; opacity: .8; letter-spacing: .02em; }` (utiliser les variables déjà présentes dans `style.css`).
- **JS** : étendre `SESS` avec `bonus: 0` et `best: 0` (ils existent déjà pour `spins`, `wag`, `won`). Dans `play()`, après `pushHistory(total, hadBonus)` : `if (hadBonus) SESS.bonus++; SESS.best = Math.max(SESS.best, total);` puis `renderSessLine()`.
- **`renderSessLine()`** : `$('sessLine').textContent = T.sessLine(SESS.spins, SESS.bonus, SESS.best)` ; appelée aussi à `applyLang()` et au démarrage.
- **i18n** : `sessLine: function (n, b, m) { return 'Tours ' + n + ' · Bonus ' + b + (m ? ' · Meilleur gain ×' + G.fmt(m) : ''); }` en FR ; EN : `'Spins ' + … + 'Best win ×'`.
- **Interdit** : aucun texte « depuis le dernier bonus » ni projection.
- **Test** : après 3 tours dont un bonus : « Tours 3 · Bonus 1 · Meilleur gain ×… » ; le texte ne contient pas d'espace en trop quand `best` vaut 0.

### QW3 — Onboarding en 3 cartes

- **Où** : `js/main.js` (près du démarrage et du splash), `js/i18n.js`, `css/style.css`.
- **Déclenchement** : après la sortie du splash (`enter()`), si `localStorage.getItem('au_intro') !== '1'` (dans un `try/catch`) et `!navigator.webdriver` et pas de `?nosplash`/`?debug` : afficher la carte 1 via `showMsg(titre, corps, boutons)` existante.
- **Contenu** (FR, EN équivalents dans `i18n.js` sous `intro: [{t, b}, {t, b}, {t, b}]`) :
  1. « Tournez la roue » : « Touchez TOURNER. Touchez la roue en mouvement pour accélérer. »
  2. « L'Oracle » : « Parfois une case s'illumine avec un boost (×2 à ×25). Si la roue s'y arrête, le gain est multiplié. »
  3. « Les bonus » : « Trois cases ouvrent un bonus : Scarabées, Pesée, Trésor. Parfois, Anubis réserve une surprise. »
- **Boutons de chaque carte** : « Suivant » (« Commencer » sur la 3e) et « Passer » (ferme et marque comme vu).
- **Persistance** : `localStorage.setItem('au_intro', '1')` à la fermeture ou au « Passer ».
- **Réouverture** : bouton « Comment jouer » dans `openInfo()` (au-dessus du tableau des gains) qui rejoue les 3 cartes sans écrire dans `localStorage`.
- **Contraintes** : textes ≤ 140 caractères par carte, focus piégé dans la fenêtre (le code existant de `Tab` s'en charge), Échap ferme.
- **Test** : `tools/e2e.js` (qui utilise `webdriver`) ne doit pas voir les cartes ; test manuel : profil neuf → cartes une fois, rechargement → aucune carte.

### QW4 — Messages d'Anubis en attente et conseils

- **Où** : `js/main.js`, `js/i18n.js`.
- **i18n** : `idleMsgs: [...]` (12 chaînes par langue ; 4 conseils, 8 phrases d'ambiance sans promesse). Exemples FR : « La balance attend ton cœur. » · « Touchez la roue en mouvement pour accélérer. » · « L'Oracle illumine parfois une case : elle paie plus. » · « Le bouton Oracle+ coûte 10 % de plus ; vérifiez le coût avant. » · « Anubis observe. » · « Le sable du temps ne se presse pas. »
- **JS** : variable `idleT = 0`, `idleI = 0`. Une boucle `setInterval` toutes les 1 s : si `!S.busy && modal caché && S.auto === 0` alors `idleT++`, sinon `idleT = 0` ; lorsque `idleT % 9 === 0 && idleT > 0` : `say(T.idleMsgs[idleI++ % len])`. Au démarrage d'un tour, `say(T.spinning)` écrase déjà la ligne.
- **Contraintes** : ne jamais appeler `say` pendant une scène de bonus ; aucune phrase ne contient « bientôt », « prochain », « chance », « gain ». La ligne reste `aria-live="polite"` : limiter à un changement toutes les 9 s.
- **Test** : en attente 40 s, au moins 4 messages différents ; début d'un spin : la ligne revient à « La roue du jugement tourne… ».

### QW5 — Achat de bonus : transparence et confirmation

- **Où** : `js/main.js` (`openBuy`), `js/i18n.js`.
- **Dans chaque carte** (`.buyCard`), ajouter une ligne `small` : « RTP 96,3 % · max 5 000× » avec les RTP mesurés en dur dans une table `BUY_INFO = { scarab: {rtp: '96.3', zero: 0.2}, weigh: {rtp: '96.5', zero: 46}, vault: {rtp: '95.8', zero: 0.3}, hand: {rtp: '96.5', zero: 2.3} }` (valeurs de la section 1.10, à mettre à jour si la simulation change).
- **Ligne d'avertissement** (si `zero >= 20`) : FR « ≈ 46 % des achats ne rendent rien. » ; EN « ≈ 46% of purchases return nothing. »
- **Confirmation** : le clic sur la carte n'appelle plus `play(k)` mais ouvre `showMsg(T.buyConfirmTitle, T.buyConfirmBody(nom, prix), [[T.buyCancel, openBuy], [T.buyNow, function () { Sfx.unlock(); play(k); }]])`. Les nouvelles clés : `buyConfirmTitle` (« Confirmer l'achat »), `buyConfirmBody`, `buyCancel` (« Annuler »).
- **Le prix** : `G.money(r2(bet() * M.BUY[k].price))`, relu **à la confirmation** (la mise ne peut pas changer entre-temps car `S.busy` est faux, mais relire par sécurité) ; si `S.balance < price` à la confirmation : `say(T.noFunds)`.
- **Test** : un clic sur une carte ouvre la confirmation ; « Annuler » revient au menu d'achat sans débit ; « Acheter » débite le bon montant une seule fois ; `tools/i18n-check.js` vert (clés en FR et EN).

---

## 7. Corrections de cohérence à faire à part (< 1 h, sans design)

1. `js/main.js:8` : `STATS.rtp` de `'96.1'` à `'96.2'` (référence 1 milliard de tours : 96,22 %) ; ajouter un champ `STATS.hitNet = '20.6'` et l'afficher dans `Infos` à côté du taux de gain (« dont rend au moins la mise : 20,6 % »).
2. `js/bonuses.js` : retirer le commentaire périmé de `G.runBonus` sur le turbo (ou supprimer le code mort `chooseScene`).
3. `js/math.js` : « La roue (54 cases) » → « 48 cases ».
4. `docs/ANALYSE.md` : §5 (61,3 % → 60,3 % ; 3 600× → 3 285×), §8 (limites 20 à 500), SWOT (retirer « choix Prudent / Équilibré / Audacieux »), itération 18 (turbo coupé aux bonus).

---

## 8. Ordre de réalisation conseillé

1. QW1 à QW5 (≈ 4 jours au total) et les corrections de la section 7 (1 h).
2. Idées 7, 6, 16, 8 (rythme et clarté des bonus), puis 13 et 12 (accessibilité et jeu responsable).
3. Idées 4, 14, 15 (moments de fierté et sensation).
4. Idées 9, 20, 19 (rejouabilité et mémoire), puis 18, 10, 11 seulement après relecture de conformité.

**Principe de décision** : une idée qui augmente le temps passé sans augmenter la compréhension, la sécurité ou le plaisir du moment est rejetée. Les idées 11 (objectifs) et 10 (habillages) sont les plus proches de cette limite ; elles viennent en dernier et exigent une relecture de conformité.

---

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
