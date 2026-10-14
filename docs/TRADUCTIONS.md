# Traductions — niveau de confiance et termes à faire relire

**Aucune des 16 langues n'a été relue par un locuteur natif.** Les textes ont été écrits par Claude (assistant IA) : le français et l'anglais sont la source ; les 14 autres langues (ar, de, es, fi, hi, id, ja, ko, pl, pt, ru, tr, vi, zh) sont des traductions non vérifiées. Les niveaux ci-dessous sont une **estimation de risque**, pas une qualité mesurée. Avant toute mise en ligne dans un marché, faire relire par un natif, surtout les textes réglementaires (avertissement général, jeu responsable, erreurs du serveur) et le vocabulaire du mode social.

## Ce qui est contrôlé automatiquement (et ce qui ne l'est pas)

`node tools/i18n-check.js` vérifie, pour les 16 langues : mêmes clés, types et longueurs que l'anglais ; marqueurs `{x}` identiques ; pas de texte vide ; longueur des textes courts (≤ 1,8 × l'anglais) et des textes longs (≤ 2,2 ×) ; Unicode NFC (diacritiques vietnamiens composés) ; pas de double espace, de parenthèse déséquilibrée, d'espace avant la ponctuation (sauf français) ; titres des bonus des règles = noms du dictionnaire (cohérence terminologique) ; noms localisés des paliers ; `dir="rtl"` pour l'arabe ; police système de repli pour ar, hi, ja, ko, zh (et vi, pl, tr, ru pour les caractères absents des sous-ensembles latins de Cinzel / Philosopher).

`node tools/social-check.js` cherche, en mode social, les équivalents des mots interdits dans chaque langue (liste : `tools/social-words.js`, c'est **ma** traduction de la checklist anglaise, plus stricte sur « coût / cost » ; elle peut oublier un synonyme ou une forme fléchie). Il scanne aussi le DOM et le canvas dans 17 combinaisons langue/devise.

**Non contrôlé** : grammaire, naturel, registre (tutoiement/vouvoiement), accords, terminologie des jeux d'argent propre à chaque marché, rendu bidirectionnel réel de l'arabe sur appareil, rendu des polices système sur iOS/Android/Windows (seul Chromium Linux a été vu, captures 390×844 en ja, ar, de, ru, vi).

## Par langue

| Langue | Confiance (estimée) | Pourquoi | Termes et passages à faire relire |
|---|---|---|---|
| fr | Élevée (langue source) | Écrit à la source | Mode social : « valeur de jeu », « jouable pour », « jeton », « pièces fictives » |
| en | Élevée (langue source) | Écrit à la source | Mode social : « play value », « play for », « Win table » |
| de | Moyenne-élevée | Langue bien maîtrisée, textes courts | « Spielbetrag / Spielwert / spielbar für », « Spielmünzen », « Token » ; « Skarabäenfall » ; « Ertrag » pour le retour attendu (évite « Rückzahlung », mot interdit) |
| es | Moyenne-élevée | Idem | « importe de juego / valor de juego / jugable por », « Ficha » (token) ; « monedas de juego » (« moneda » n'est pas interdit car il signifie aussi « coin ») |
| pt (BR) | Moyenne-élevée | Idem | « valor jogado / valor de jogo / jogável por », « Ficha » ; « Queda de Escaravelhos » (corrigé dans le dictionnaire) |
| pl | Moyenne | Déclinaisons nombreuses | Cas grammaticaux des gabarits (« do zagrania za », « Wartość gry »), « kwota gry », « Żeton » ; « Pas » pour band |
| fi | Moyenne | Langue agglutinante, composés | « peliarvo », « pelisumma », « AVAA BONUS » (ouvrir, pour éviter « hanki/osta »), « Poletti » (token), « pelikolikot » ; formes « %:lla » |
| tr | Moyenne | Agglutination, tournures | « oyun tutarı / oyun değeri », « BONUS AÇ » (ouvrir, éviter « satın al »), « Jeton » pour coins ET token (« para » est interdit) ; accents d'apostrophe (’) |
| id | Moyenne | Registre informel choisi (« -mu ») | « jumlah main / nilai main », « AMBIL BONUS », « koin permainan », « Token » |
| vi | Moyenne-faible | Tons et classificateurs ; terme « Thần Lời » pour Oracle hérité du dictionnaire | « mức chơi / giá trị chơi / Chơi được với », « xu chơi » (coins), « NHẬN BONUS », « hoàn lại » (RTP, car « hoàn trả » contient « trả » = pay) ; « Bậc » pour tier |
| ru | Moyenne | Cas et aspects | « сумма игры / значение игры / Игра на », « игровые монеты », « Жетон » ; « ПОЛУЧИТЬ БОНУС » ; « Полоса » pour band |
| ar | Moyenne-faible | Écriture RTL, pluriels, termes de jeu | « قيمة اللعب / مبلغ اللعب / قابل للعب بقيمة », « قطع اللعب » (coins : « عملة » est interdit car = devise), « توكن » ; titres de bonus ; cohabitation des chiffres latins et des « ٪ » ; rendu RTL à valider sur appareil |
| hi | Moyenne-faible | Mélange hindi / anglicismes | « खेल राशि / खेल मूल्य », « खेल सिक्के », « टोकन », « पाएँ » ; nuktas (NFC) ; « श्रृंखला » (graphie héritée du dictionnaire, à corriger en « शृंखला » ?) |
| ja | Moyenne | Registre neutre | « プレイ額 / プレイ価値 », « プレイ用コイン », « トークン », « 獲得 » à la place de « 配当 » (interdit) ; « ティア » ; ブースト |
| ko | Moyenne | Registre 합니다체 | « 플레이 금액 / 플레이 가치 », « 플레이 코인 », « 토큰 », « 당첨 » à la place de « 배당 » ; particules « 을(를) » dans les gabarits |
| zh (简体) | Moyenne | Simplifié uniquement | « 游玩额 / 游玩价值 », « 游戏金币 », « 代币 » (« 货币 » est interdit), « 开启奖励 » ; « 巨赢 / 超赢 » pour les paliers ; ponctuation pleine chasse |

## Termes sensibles communs à toutes les langues

- **Mode social (Stake.US)** : « play amount / play value / played for », « coins », « token », « get / open a bonus ». Les mots « pari, achat, argent, devise, coût… » et leurs équivalents sont interdits ; chaque langue a son propre choix, à valider avec le service conformité de l'exploitant.
- **Noms des bonus** (Chute des Scarabées, Pesée du Cœur, Chambre du Trésor, Fureur d'Anubis, Sanctuaire des Marées) : traduits librement, cohérents entre le dictionnaire et les règles (contrôlé), mais pas validés culturellement.
- **WIN / BIG WIN / EXTRA WIN / MEGA WIN** : restent en anglais par défaut. Les noms localisés sont **optionnels** (`?tiers=local` ou `I18N.setLocalTiers(true)`), à faire valider avant activation. Pour ar, hi, ja, ko, zh le palier ultime (« DIVINE JUDGEMENT ») a aussi une version localisée dans ce mode.
- **Avertissement général (« Important »)** : traduit de l'anglais officiel de Stake Engine ; le texte contractuel fait foi en anglais.
- **Jeu responsable** (limite de perte, rappel de séance) : textes d'origine du dictionnaire, non relus.

## Comment faire relire

1. Exporter les textes d'une langue : `window.I18N_X.rules.xx`, `.replay.xx`, `.rgs.xx`, `.ui.xx`, `.tiers.xx`, `I18N_SOCIAL.xx` et le dictionnaire principal (`D.xx`, via `node tools/i18n-check.js`).
2. Faire relire par un natif avec accès au jeu (`?lang=xx`, `?lang=xx&social=true&currency=XSC`, `&tiers=local`).
3. Ajouter tout mot interdit trouvé à `tools/social-words.js` ; relancer `i18n-check.js` et `social-check.js`.
