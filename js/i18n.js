/* Textes FR / EN */
(function (root) {
  'use strict';
  var D = {
    fr: {
      brandTop: 'ANUBIS', balance: 'SOLDE', bet: 'MISE', win: 'GAIN', turbo: 'TURBO', auto: 'AUTO',
      spin: 'TOURNER', stop: 'STOP', ready: 'Tournez la roue du jugement', spinning: 'La roue du jugement tourne…',
      oraclePlus: 'ORACLE+', plusHint: 'ORACLE+ : boost sur ≈ {opp} % des tours · mise ×1,1', cost: 'COÛT',
      session: 'SÉANCE', sessTime: 'Durée', sessSpins: 'Tours', sessWag: 'Misé', sessWon: 'Gagné', sessNet: 'Résultat net', lossLimit: 'Limite de perte de la séance', qualityL: 'Qualité graphique', qAuto: 'Auto', qHigh: 'Élevée', qLow: 'Basse',
      realityTitle: 'POINT DE SÉANCE', realityMsg: function (m, n) { return 'Vous jouez depuis ' + m + ' min. Résultat net : ' + n + '.'; }, limitTitle: 'LIMITE ATTEINTE', limitMsg: 'Votre limite de perte est atteinte. Modifiez-la dans les réglages pour continuer.', keepPlaying: 'CONTINUER', takeBreak: 'FAIRE UNE PAUSE',
      rulesPlus: 'Mode ORACLE+ : mise ×1,1, l\'Oracle apparaît sur ≈ {opp} % des tours. RTP équivalent (≈ 96 %).',
      buyBtn: 'ACHETER UN BONUS', buyTitle: 'ACHETER UN BONUS', buySub: 'Ouvrez directement un bonus, sans passer par la roue. Prix = mise × multiplicateur. La Fureur d\'Anubis peut toujours le saisir.', buyPrice: 'PRIX', buyNow: 'ACHETER', buyOn: 'Achat de bonus', buyWheel: 'Retour à la roue', buyNoFunds: 'Solde insuffisant pour ce bonus', buyRtp: 'RTP ≈ 96 %',
      buyDesc: { scarab: '3 scarabées, jusqu\'à {scmax}× chacun', weigh: 'Plume ou cœur : le plus lourd gagne, jusqu\'à {wmax}×', vault: 'Pyramide : 12 coffres, des clés d\'or allongent la sélection', hand: 'Choisissez une couleur : DOUBLE = roue doublée (jusqu\'à ×16), bandes de bonus ×3 à ×12' },
      resumed: 'Tour interrompu : gain crédité',
      noFunds: 'Solde insuffisant', oracleSpeaks: 'L\'Oracle parle…', oracleOn: 'ORACLE', ankhRespin: 'ANKH — RELANCE GRATUITE !',
      dust: 'La poussière retourne à la poussière…', winLine: 'Gain', respinLabel: 'RELANCE',
      kinds: { m0: 'POUSSIÈRE', m025: '0,3×', m05: '0,5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'ANKH', scarab: 'SCARABÉES', weigh: 'PESÉE', vault: 'TRÉSOR' },
      kindsLong: { scarab: 'Chute des Scarabées', weigh: 'Pesée du Cœur', vault: 'Chambre du Trésor', hand: 'Fureur d\'Anubis', crypt: 'Sanctuaire des Marées' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'JUGEMENT DIVIN'],
      scarabSub: 'Trois scarabées traversent les ténèbres. Chacun rapporte la case où il tombe.', scarabIntro: 'CHUTE DES SCARABÉES',
      weighIntro: 'PESÉE DU CŒUR', weighSub: 'Plume de Maât ou cœur ? Le plateau le plus lourd gagne son multiplicateur, le plus léger n\'a rien.', feather: 'PLUME', featherOf: 'DE MAÂT', heart: 'CŒUR', heartOf: 'DE VOTRE ÂME', weighRoll: 'Les multiplicateurs se révèlent…', weighWon: 'GAGNÉ', weighLost: 'PERDU', sayRight: 'Votre plateau est le plus lourd : ×{m} !', sayWrong: 'L\'autre plateau est plus lourd : pas de gain', weighing: 'Les dieux pèsent votre âme…',
      vaultIntro: 'CHAMBRE DU TRÉSOR', vaultSub: 'Un toucher ouvre un coffre. Le sceau referme la chambre (vous gardez votre total) ; une clé d\'or ajoute des coffres à ouvrir.', pick: 'Touchez un coffre', vaultSeal: 'SCELLÉ !', vaultKey: 'CLÉ D\'OR  +{n} COFFRES', vaultLeft: 'COFFRES : {n}', vaultScepter: 'SCEPTRE ×2', vaultClear: 'COFFRES VIDÉS  +{p}×', total: 'TOTAL',
      splashEnter: 'ENTRER', splashSub: 'Le jugement vous attend', splashDemo: 'Démo · argent fictif · Jouez avec modération', curHint: 'Démo : 7 devises (USD, EUR, CAD, MXN, JPY, SC, GC) — conversion indicative, pas de taux de change réels.', demoBuild: 'Démo locale — ce n\'est pas le build de production Stake. Les montants sont fictifs.',
      steerHint: 'Touchez à gauche ou à droite pour guider le scarabée', fateResists: 'LE DESTIN RÉSISTE',
      pushHint: 'Touchez vite pour faire pencher votre plateau !',
      launchBonus: 'LANCER LE BONUS', bonusWord: 'BONUS', bonusUnlocked: 'BONUS DÉBLOQUÉ', launchHint: 'Touchez le bouton ou appuyez sur Espace', chooseTitle: 'CHOISISSEZ VOTRE DESTIN', chooseHint: 'Touchez une carte : même espérance de gain, risque différent', chooseRtp: 'Les trois choix ont le même RTP',
      profName: { safe: 'PRUDENT', std: 'ÉQUILIBRÉ', bold: 'AUDACIEUX' }, profDesc: { safe: 'Gains réguliers, plafond bas', std: 'Le juste milieu', bold: 'Gains rares mais énormes' },
      lineScarab: '×{a} à ×{b} par scarabée', lineWeigh: 'Plateaux jusqu\'à ×{b}', lineVault: 'Sceau : {p} % par coffre', volat: 'Volatilité',
      aimHint: 'Visez, puis touchez pour lâcher le scarabée', guessHint: 'Plume ou cœur ? Touchez une carte (touches 1 / 2)', guessRight: 'GAGNÉ !', guessWrong: 'PERDU', holdHint: 'Maintenez pour charger, relâchez pour lancer', tapFast: 'Touchez pour accélérer',
      handIntro: 'LA FUREUR D\'ANUBIS', handSub: 'Le dieu saisit votre bonus et le transforme en jugement suprême.', handSpin: 'Les multiplicateurs s\'empilent…', handFinal: 'JUGEMENT RENDU',
      handColorTitle: 'VOTRE COULEUR', handColorHint: 'Touchez une carte (touches 1 / 2 / 3). Les trois couleurs ont exactement les mêmes chances.',
      handColorName: { turq: 'TURQUOISE', gold: 'OR', ruby: 'RUBIS' }, handColorSub: '2 cases DOUBLE', handColorRule: 'DOUBLE de votre couleur : la roue double et on relance. DOUBLE d\'une autre couleur : la chaîne s\'arrête.', handColorRtp: 'Les trois couleurs ont le même RTP',
      handYour: 'VOTRE COULEUR', handRule: 'Votre couleur sur DOUBLE : roue doublée, on relance · autre couleur : fin', handTier: 'PALIER', handDouble: 'DOUBLE',
      handUp: 'LA ROUE DOUBLE !', handUpSub: 'Les nombres sont doublés — relancez', handWrong: 'MAUVAISE COULEUR', handWrongSub: 'La chaîne s\'arrête : palier encaissé', handNum: 'NOMBRE', handBandAt: 'BANDE BONUS',
      bandName: { scarab: 'SCARABÉES', weigh: 'PESÉE', vault: 'TRÉSOR' },
      boostApplied: 'BOOST ORACLE', boostIntro: 'BOOST', boostIntroSub: 'toutes les valeurs sont multipliées', tapSkip: 'Touchez pour passer', continueBtn: 'CONTINUER', bonusWin: 'GAIN DU BONUS',
      infoTitle: 'RÈGLES & TABLE DES GAINS', rtp: 'RTP', maxWin: 'Gain max', hitRate: 'Tours gagnants', bonusFreq: 'Bonus', volat: 'Volatilité',
      volatV: 'Très haute', demo: 'Argent fictif — démo sans argent réel : les montants affichés ne sont pas de vraies sommes.',
      rules: [
        'Une mise, un tour : la roue du jugement décide. Chaque case paie sa valeur × votre mise.',
        'L\'Oracle (≈ {op} % des tours) désigne un type de case et lui offre un boost ×2 à ×100, dont la valeur reste scellée (« ? ») jusqu\'à l\'arrêt de la roue. Si la roue s\'y arrête, le boost s\'applique !',
        'ANKH : relance gratuite de la roue, sans remise.',
        'Pesée du Cœur : choisissez la plume de Maât ou le cœur, les multiplicateurs défilent et se révèlent, puis la balance tranche. Le plateau le plus lourd gagne son multiplicateur (jusqu\'à ×{wmax}), le plus léger n\'a rien : une chance sur deux.',
        'Un bonus peut être saisi par la FUREUR D\'ANUBIS : choisissez une couleur (turquoise, or ou rubis) puis lancez la roue géante. Un nombre : gain = nombre × palier. DOUBLE de VOTRE couleur : les nombres de la roue sont doublés (palier ×2, jusqu\'à ×16) et vous relancez. DOUBLE d\'une AUTRE couleur : la chaîne s\'arrête et vous encaissez le plus petit nombre de la roue (3) × palier.',
        'Les bandes de la Fureur lancent un bonus (Scarabées ×3 ou ×12, Pesée ×6, Trésor ×4) : gain du bonus × le multiplicateur de la bande × palier, jusqu\'à ×25000. Une bande ne ramène jamais à la Fureur.',
        'Animations de gain, selon le multiplicateur total du tour (gain ÷ coût du tour) : WIN dès ×1, BIG WIN dès ×10, EXTRA WIN dès ×40, MEGA WIN dès ×150, JUGEMENT DIVIN dès ×1000.'
      ],
      secretWord: 'BONUS SECRET', secretUnlocked: 'DÉBLOQUÉ !', secretHint: 'Un bonus caché vient de s\'ouvrir… Touchez le bouton ou appuyez sur Espace',
      cryptIntro: 'SANCTUAIRE DES MARÉES', cryptPool: 'OFFRANDE', cryptTide: 'MARÉE', cryptCount: 'TABLETTE {n} / {m}', cryptPick: 'Touchez une tablette', cryptCapped: 'PLAFOND ATTEINT',
      cryptRule: 'Offrande = tablettes × marée du moment · la marée ne touche que les tablettes suivantes · l\'éclipse multiplie l\'offrande',
      cryptLeg: ['TABLETTE', 'MARÉE', 'ÉCLIPSE', 'POUSSIÈRE'],
      cryptHint: { tab: 'TABLETTE : sa valeur × la marée s\'ajoute à l\'offrande', tide: 'MARÉE : multiplie la marée, pour les tablettes suivantes seulement', eclipse: 'ÉCLIPSE : multiplie l\'offrande déjà accumulée', dust: 'POUSSIÈRE : rien ne se passe' },
      tableCols: ['Case', 'Sur la roue', 'Gain'], settings: 'RÉGLAGES', language: 'Langue', sound: 'Son', reducedFx: 'Effets réduits', stopBonus: 'Stopper l\'auto sur bonus',
      volumeL: 'Volume', pitchShort: 'Hauteur', gradeTitle: 'Couleurs', gradeNatural: 'Naturel', gradeVivid: 'Éclatant', gradeGold: 'Doré', gradeCine: 'Cinéma', toneShort: 'Aigus', soundOn: 'Son : oui', soundOff: 'Son : non', musicShort: 'Ambiance', resetL: 'Réinitialiser', mixLabel: 'Réglages du son', pitchL: 'Hauteur des sons (demi-tons)', musicL: 'Ambiance musicale', autoOpts: 'Nombre de tours auto', off: 'Non', on: 'Oui', close: 'Fermer', currencyL: 'Devise', resetBal: 'Réinitialiser le solde', noWin: 'Pas de gain', handLabel: 'FUREUR D\'ANUBIS'
    },
    en: {
      brandTop: 'ANUBIS', balance: 'BALANCE', bet: 'BET', win: 'WIN', turbo: 'TURBO', auto: 'AUTO',
      spin: 'SPIN', stop: 'STOP', ready: 'Spin the wheel of judgement', spinning: 'The wheel of judgement turns…',
      oraclePlus: 'ORACLE+', plusHint: 'ORACLE+: boost on ≈ {opp}% of spins · bet ×1.1', cost: 'COST',
      session: 'SESSION', sessTime: 'Time', sessSpins: 'Spins', sessWag: 'Wagered', sessWon: 'Won', sessNet: 'Net result', lossLimit: 'Session loss limit', qualityL: 'Graphics quality', qAuto: 'Auto', qHigh: 'High', qLow: 'Low',
      realityTitle: 'SESSION CHECK', realityMsg: function (m, n) { return 'You have been playing for ' + m + ' min. Net result: ' + n + '.'; }, limitTitle: 'LIMIT REACHED', limitMsg: 'Your loss limit has been reached. Change it in settings to keep playing.', keepPlaying: 'KEEP PLAYING', takeBreak: 'TAKE A BREAK',
      rulesPlus: 'ORACLE+ mode: bet ×1.1, the Oracle shows up on ≈ {opp}% of spins. Same RTP (≈ 96%).',
      buyBtn: 'BUY A BONUS', buyTitle: 'BUY A BONUS', buySub: 'Open a bonus directly, skipping the wheel. Price = bet × multiplier. Anubis\' Fury can still seize it.', buyPrice: 'PRICE', buyNow: 'BUY', buyOn: 'Bonus buy', buyWheel: 'Back to the wheel', buyNoFunds: 'Not enough balance for this bonus', buyRtp: 'RTP ≈ 96%',
      buyDesc: { scarab: '3 scarabs, up to {scmax}× each', weigh: 'Feather or heart: the heavier wins, up to {wmax}×', vault: 'Pyramid: 12 chests, golden keys extend the selection', hand: 'Pick a colour: DOUBLE = doubled wheel (up to ×16), bonus bands ×3 to ×12' },
      resumed: 'Interrupted round: winnings credited',
      noFunds: 'Insufficient balance', oracleSpeaks: 'The Oracle speaks…', oracleOn: 'ORACLE', ankhRespin: 'ANKH — FREE RESPIN!',
      dust: 'Dust returns to dust…', winLine: 'Win', respinLabel: 'RESPIN',
      kinds: { m0: 'DUST', m025: '0.3×', m05: '0.5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'ANKH', scarab: 'SCARABS', weigh: 'WEIGHING', vault: 'VAULT' },
      kindsLong: { scarab: 'Scarab Drop', weigh: 'Weighing of the Heart', vault: 'Treasure Vault', hand: 'Fury of Anubis', crypt: 'Sanctuary of Tides' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'DIVINE JUDGEMENT'],
      scarabSub: 'Three scarabs plunge through the dark. Each pays the slot it lands in.', scarabIntro: 'SCARAB DROP',
      weighIntro: 'WEIGHING OF THE HEART', weighSub: 'Feather of Ma\'at or heart? The heavier pan wins its multiplier, the lighter one gets nothing.', feather: 'FEATHER', featherOf: 'OF MA\'AT', heart: 'HEART', heartOf: 'OF YOUR SOUL', weighRoll: 'The multipliers are revealed…', weighWon: 'WON', weighLost: 'LOST', sayRight: 'Your pan is the heavier one: ×{m}!', sayWrong: 'The other pan is heavier: no win', weighing: 'The gods weigh your soul…',
      vaultIntro: 'TREASURE VAULT', vaultSub: 'One tap opens a chest. The seal closes the vault (you keep your total); a golden key adds chests to open.', pick: 'Tap a chest', vaultSeal: 'SEALED!', vaultKey: 'GOLDEN KEY  +{n} CHESTS', vaultLeft: 'CHESTS: {n}', vaultScepter: 'SCEPTER ×2', vaultClear: 'VAULT CLEARED  +{p}×', total: 'TOTAL',
      splashEnter: 'ENTER', splashSub: 'Judgement awaits', splashDemo: 'Demo · play money · Play responsibly', curHint: 'Demo: 7 currencies (USD, EUR, CAD, MXN, JPY, SC, GC) — indicative conversion, not real exchange rates.', demoBuild: 'Local demo — this is not the Stake production build. Amounts are fictitious.',
      steerHint: 'Tap left or right to steer the scarab', fateResists: 'FATE RESISTS',
      pushHint: 'Tap fast to tip your pan!',
      launchBonus: 'START THE BONUS', bonusWord: 'BONUS', bonusUnlocked: 'BONUS UNLOCKED', launchHint: 'Tap the button or press Space', chooseTitle: 'CHOOSE YOUR FATE', chooseHint: 'Tap a card: same expected return, different risk', chooseRtp: 'All three choices have the same RTP',
      profName: { safe: 'CAUTIOUS', std: 'BALANCED', bold: 'DARING' }, profDesc: { safe: 'Steady wins, low ceiling', std: 'The middle path', bold: 'Rare but huge wins' },
      lineScarab: '×{a} to ×{b} per scarab', lineWeigh: 'Pans up to ×{b}', lineVault: 'Seal: {p}% per chest', volat: 'Volatility',
      aimHint: 'Aim, then tap to release the scarab', guessHint: 'Feather or heart? Tap a card (keys 1 / 2)', guessRight: 'YOU WIN!', guessWrong: 'LOST', holdHint: 'Hold to charge, release to spin', tapFast: 'Tap to speed up',
      handIntro: 'FURY OF ANUBIS', handSub: 'The god seizes your bonus and turns it into supreme judgement.', handSpin: 'Multipliers stack up…', handFinal: 'JUDGEMENT PASSED',
      handColorTitle: 'YOUR COLOUR', handColorHint: 'Tap a card (keys 1 / 2 / 3). The three colours have exactly the same odds.',
      handColorName: { turq: 'TURQUOISE', gold: 'GOLD', ruby: 'RUBY' }, handColorSub: '2 DOUBLE slots', handColorRule: 'DOUBLE in your colour: the wheel doubles and you spin again. DOUBLE in another colour: the chain stops.', handColorRtp: 'All three colours have the same RTP',
      handYour: 'YOUR COLOUR', handRule: 'Your colour on DOUBLE: wheel doubled, spin again · other colour: it ends', handTier: 'TIER', handDouble: 'DOUBLE',
      handUp: 'THE WHEEL DOUBLES!', handUpSub: 'Every number is doubled — spin again', handWrong: 'WRONG COLOUR', handWrongSub: 'The chain stops: current tier cashed', handNum: 'NUMBER', handBandAt: 'BONUS BAND',
      bandName: { scarab: 'SCARABS', weigh: 'WEIGHING', vault: 'VAULT' },
      boostApplied: 'ORACLE BOOST', boostIntro: 'BOOST', boostIntroSub: 'every value is multiplied', tapSkip: 'Tap to skip', continueBtn: 'CONTINUE', bonusWin: 'BONUS WIN',
      infoTitle: 'RULES & PAYTABLE', rtp: 'RTP', maxWin: 'Max win', hitRate: 'Hit rate', bonusFreq: 'Bonus', volat: 'Volatility',
      volatV: 'Very high', demo: 'Play money — demo, the amounts shown are not real money.',
      rules: [
        'One bet, one spin: the wheel of judgement decides. Each segment pays its value × your bet.',
        'The Oracle (≈ {op}% of spins) picks a type of segment and grants it a ×2 to ×100 boost, its value staying sealed ("?") until the wheel stops. If the wheel lands there, the boost applies!',
        'ANKH: free respin of the wheel, no extra stake.',
        'Weighing of the Heart: pick the feather of Ma\'at or the heart, the multipliers roll and are revealed, then the scales decide. The heavier pan wins its multiplier (up to ×{wmax}), the lighter one gets nothing: a 1-in-2 chance.',
        'Any bonus can be seized by the FURY OF ANUBIS: pick a colour (turquoise, gold or ruby), then spin the giant wheel. A number: win = number × tier. DOUBLE in YOUR colour: every number on the wheel is doubled (tier ×2, up to ×16) and you spin again. DOUBLE in ANOTHER colour: the chain stops and you cash the smallest number on the wheel (3) × tier.',
        'The Fury\'s bands launch a bonus (Scarabs ×3 or ×12, Weighing ×6, Vault ×4): bonus win × the band multiplier × tier, up to ×25000. A band never leads back to the Fury.',
        'Win animations, by the round\'s total multiplier (win ÷ round cost): WIN from ×1, BIG WIN from ×10, EXTRA WIN from ×40, MEGA WIN from ×150, DIVINE JUDGEMENT from ×1000.'
      ],
      secretWord: 'SECRET BONUS', secretUnlocked: 'UNLOCKED!', secretHint: 'A hidden bonus has opened… Tap the button or press Space',
      cryptIntro: 'SANCTUARY OF TIDES', cryptPool: 'OFFERING', cryptTide: 'TIDE', cryptCount: 'TABLET {n} / {m}', cryptPick: 'Tap a tablet', cryptCapped: 'MAX WIN REACHED',
      cryptRule: 'Offering = tablets × current tide · the tide only affects later tablets · the eclipse multiplies the offering',
      cryptLeg: ['TABLET', 'TIDE', 'ECLIPSE', 'DUST'],
      cryptHint: { tab: 'TABLET: its value × the tide is added to the offering', tide: 'TIDE: multiplies the tide, for later tablets only', eclipse: 'ECLIPSE: multiplies the offering gathered so far', dust: 'DUST: nothing happens' },
      tableCols: ['Segment', 'On wheel', 'Pays'], settings: 'SETTINGS', language: 'Language', sound: 'Sound', reducedFx: 'Reduced effects', stopBonus: 'Stop autoplay on bonus',
      volumeL: 'Volume', pitchShort: 'Pitch', gradeTitle: 'Colors', gradeNatural: 'Natural', gradeVivid: 'Vivid', gradeGold: 'Golden', gradeCine: 'Cinema', toneShort: 'Treble', soundOn: 'Sound: on', soundOff: 'Sound: off', musicShort: 'Ambience', resetL: 'Reset', mixLabel: 'Sound settings', pitchL: 'Sound pitch (semitones)', musicL: 'Background ambience', autoOpts: 'Autoplay spins', off: 'Off', on: 'On', close: 'Close', currencyL: 'Currency', resetBal: 'Reset balance', noWin: 'No win', handLabel: 'FURY OF ANUBIS'
    },
    de: {
      brandTop: 'ANUBIS', balance: 'GUTHABEN', bet: 'EINSATZ', win: 'GEWINN', turbo: 'TURBO', auto: 'AUTO',
      spin: 'DREHEN', stop: 'STOPP', ready: 'Drehe das Rad des Gerichts', spinning: 'Das Rad des Gerichts dreht sich…',
      oraclePlus: 'ORAKEL+', plusHint: 'ORAKEL+: Boost bei ≈ {opp} % der Drehungen · Einsatz ×1,1', cost: 'KOSTEN',
      session: 'SITZUNG', sessTime: 'Dauer', sessSpins: 'Drehungen', sessWag: 'Gesetzt', sessWon: 'Gewonnen', sessNet: 'Nettoergebnis', lossLimit: 'Verlustlimit der Sitzung', qualityL: 'Grafikqualität', qAuto: 'Auto', qHigh: 'Hoch', qLow: 'Niedrig',
      realityTitle: 'SITZUNGSHINWEIS', realityMsg: function (m, n) { return 'Du spielst seit ' + m + ' Min. Nettoergebnis: ' + n + '.'; }, limitTitle: 'LIMIT ERREICHT', limitMsg: 'Dein Verlustlimit ist erreicht. Ändere es in den Einstellungen, um weiterzuspielen.', keepPlaying: 'WEITERSPIELEN', takeBreak: 'PAUSE MACHEN',
      rulesPlus: 'Modus ORAKEL+: Einsatz ×1,1, das Orakel erscheint bei ≈ {opp} % der Drehungen. Gleicher RTP (≈ 96 %).',
      buyBtn: 'BONUS KAUFEN', buyTitle: 'BONUS KAUFEN', buySub: 'Öffne direkt einen Bonus, ohne das Rad. Preis = Einsatz × Multiplikator. Die Wut des Anubis kann ihn trotzdem ergreifen.', buyPrice: 'PREIS', buyNow: 'KAUFEN', buyOn: 'Bonuskauf', buyWheel: 'Zurück zum Rad', buyNoFunds: 'Guthaben für diesen Bonus nicht ausreichend', buyRtp: 'RTP ≈ 96 %',
      buyDesc: { scarab: '3 Skarabäen, bis zu {scmax}× je Käfer', weigh: 'Feder oder Herz: das Schwerere gewinnt, bis zu {wmax}×', vault: 'Pyramide: 12 Truhen, goldene Schlüssel verlängern die Auswahl', hand: 'Wähle eine Farbe: DOPPELT = verdoppeltes Rad (bis ×16), Bonusbänder ×3 bis ×12' },
      resumed: 'Unterbrochene Runde: Gewinn gutgeschrieben',
      noFunds: 'Guthaben nicht ausreichend', oracleSpeaks: 'Das Orakel spricht…', oracleOn: 'ORAKEL', ankhRespin: 'ANKH — GRATIS-RESPIN!',
      dust: 'Staub kehrt zu Staub zurück…', winLine: 'Gewinn', respinLabel: 'RESPIN',
      kinds: { m0: 'STAUB', m025: '0,3×', m05: '0,5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'ANKH', scarab: 'SKARABÄEN', weigh: 'WIEGEN', vault: 'SCHATZ' },
      kindsLong: { scarab: 'Skarabäenfall', weigh: 'Wägung des Herzens', vault: 'Schatzkammer', hand: 'Wut des Anubis', crypt: 'Heiligtum der Gezeiten' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'GÖTTLICHES URTEIL'],
      scarabSub: 'Drei Skarabäen stürzen durch die Dunkelheit. Jeder zahlt das Feld, in dem er landet.', scarabIntro: 'SKARABÄENFALL',
      weighIntro: 'WÄGUNG DES HERZENS', weighSub: 'Feder der Ma\'at oder Herz? Die schwerere Schale gewinnt ihren Multiplikator, die leichtere nichts.', feather: 'FEDER', featherOf: 'DER MA\'AT', heart: 'HERZ', heartOf: 'DEINER SEELE', weighRoll: 'Die Multiplikatoren werden enthüllt…', weighWon: 'GEWONNEN', weighLost: 'VERLOREN', sayRight: 'Deine Schale ist schwerer: ×{m}!', sayWrong: 'Die andere Schale ist schwerer: kein Gewinn', weighing: 'Die Götter wiegen deine Seele…',
      vaultIntro: 'SCHATZKAMMER', vaultSub: 'Ein Tippen öffnet eine Truhe. Das Siegel schließt die Kammer (dein Gesamt bleibt); ein goldener Schlüssel gibt weitere Truhen.', pick: 'Tippe auf eine Truhe', vaultSeal: 'VERSIEGELT!', vaultKey: 'GOLDENER SCHLÜSSEL  +{n} TRUHEN', vaultLeft: 'TRUHEN: {n}', vaultScepter: 'SZEPTER ×2', vaultClear: 'KAMMER GELEERT  +{p}×', total: 'GESAMT',
      splashEnter: 'EINTRETEN', splashSub: 'Das Urteil erwartet dich', splashDemo: 'Demo · Spielgeld · Spiele verantwortungsvoll', curHint: 'Demo: 7 Währungen (USD, EUR, CAD, MXN, JPY, SC, GC) – Umrechnung nur zur Orientierung, keine echten Wechselkurse.', demoBuild: 'Lokale Demo – das ist nicht der Stake-Produktions-Build. Die Beträge sind fiktiv.',
      steerHint: 'Tippe links oder rechts, um den Skarabäus zu lenken', fateResists: 'SCHICKSAL WEHRT SICH',
      pushHint: 'Tippe schnell, um deine Schale zu senken!',
      launchBonus: 'BONUS STARTEN', bonusWord: 'BONUS', bonusUnlocked: 'BONUS FREIGESCHALTET', launchHint: 'Tippe auf die Taste oder drücke die Leertaste', chooseTitle: 'WÄHLE DEIN SCHICKSAL', chooseHint: 'Tippe eine Karte: gleiche Gewinnerwartung, anderes Risiko', chooseRtp: 'Alle drei Wahlmöglichkeiten haben denselben RTP',
      profName: { safe: 'VORSICHTIG', std: 'AUSGEWOGEN', bold: 'KÜHN' }, profDesc: { safe: 'Regelmäßige Gewinne, niedrige Obergrenze', std: 'Der goldene Mittelweg', bold: 'Seltene, aber riesige Gewinne' },
      lineScarab: '×{a} bis ×{b} pro Skarabäus', lineWeigh: 'Schalen bis ×{b}', lineVault: 'Siegel: {p} % pro Truhe', volat: 'Volatilität',
      aimHint: 'Ziele, dann tippe, um den Skarabäus loszulassen', guessHint: 'Feder oder Herz? Tippe eine Karte (Tasten 1 / 2)', guessRight: 'GEWONNEN!', guessWrong: 'VERLOREN', holdHint: 'Halten zum Aufladen, loslassen zum Drehen', tapFast: 'Tippen zum Beschleunigen',
      handIntro: 'WUT DES ANUBIS', handSub: 'Der Gott ergreift deinen Bonus und macht ihn zum höchsten Urteil.', handSpin: 'Die Multiplikatoren türmen sich auf…', handFinal: 'URTEIL GEFÄLLT',
      handColorTitle: 'DEINE FARBE', handColorHint: 'Tippe eine Karte (Tasten 1 / 2 / 3). Alle drei Farben haben genau dieselben Chancen.',
      handColorName: { turq: 'TÜRKIS', gold: 'GOLD', ruby: 'RUBIN' }, handColorSub: '2 DOPPELT-Felder', handColorRule: 'DOPPELT in deiner Farbe: das Rad verdoppelt sich und du drehst erneut. DOPPELT in einer anderen Farbe: die Kette endet.', handColorRtp: 'Alle drei Farben haben denselben RTP',
      handYour: 'DEINE FARBE', handRule: 'Deine Farbe auf DOPPELT: Rad verdoppelt, neu drehen · andere Farbe: Ende', handTier: 'STUFE', handDouble: 'DOPPELT',
      handUp: 'DAS RAD VERDOPPELT SICH!', handUpSub: 'Alle Zahlen werden verdoppelt — dreh erneut', handWrong: 'FALSCHE FARBE', handWrongSub: 'Die Kette endet: aktuelle Stufe wird ausgezahlt', handNum: 'ZAHL', handBandAt: 'BONUSBAND',
      bandName: { scarab: 'SKARABÄEN', weigh: 'WIEGEN', vault: 'SCHATZ' },
      boostApplied: 'ORAKEL-BOOST', boostIntro: 'BOOST', boostIntroSub: 'alle Werte werden multipliziert', tapSkip: 'Tippen zum Überspringen', continueBtn: 'WEITER', bonusWin: 'BONUSGEWINN',
      infoTitle: 'REGELN & GEWINNTABELLE', rtp: 'RTP', maxWin: 'Maximalgewinn', hitRate: 'Gewinnrunden', bonusFreq: 'Bonus', volat: 'Volatilität',
      volatV: 'Sehr hoch', demo: 'Spielgeld — Demo, die Beträge in € oder $ sind kein echtes Geld.',
      rules: [
        'Ein Einsatz, eine Drehung: Das Rad des Gerichts entscheidet. Jedes Feld zahlt seinen Wert × deinen Einsatz.',
        'Das Orakel (≈ {op} % der Drehungen) wählt ein Feld und gibt ihm einen Boost von ×2 bis ×100. Hält das Rad dort an, gilt der Boost!',
        'ANKH: kostenloser Respin des Rads, ohne zusätzlichen Einsatz.',
        'Wägung des Herzens: Wähle die Feder der Ma\'at oder das Herz, die Multiplikatoren laufen durch und werden enthüllt, dann entscheidet die Waage. Die schwerere Schale gewinnt ihren Multiplikator (bis ×{wmax}), die leichtere nichts: eine Chance von 1 zu 2.',
        'Jeder Bonus kann von der WUT DES ANUBIS ergriffen werden: Wähle eine Farbe (türkis, gold oder rubin) und drehe das Riesenrad. Eine Zahl: Gewinn = Zahl × Stufe. DOPPELT in DEINER Farbe: alle Zahlen des Rads werden verdoppelt (Stufe ×2, bis ×16) und du drehst erneut. DOPPELT in einer ANDEREN Farbe: die Kette endet und du kassierst die kleinste Zahl des Rads (3) × Stufe.',
        'Die Bänder der Wut starten einen Bonus (Skarabäen ×3 oder ×12, Wägung ×6, Schatz ×4): Bonusgewinn × Bandmultiplikator × Stufe, bis ×25000. Ein Band führt nie zurück zur Wut.',
        'Gewinnanimationen nach dem Gesamtmultiplikator der Runde (Gewinn ÷ Rundenkosten): WIN ab ×1, BIG WIN ab ×10, EXTRA WIN ab ×40, MEGA WIN ab ×150, GÖTTLICHES URTEIL ab ×1000.'
      ],
      secretWord: 'GEHEIMBONUS', secretUnlocked: 'FREIGESCHALTET!', secretHint: 'Ein versteckter Bonus hat sich geöffnet… Tippe auf die Taste oder drücke die Leertaste',
      cryptIntro: 'HEILIGTUM DER GEZEITEN', cryptPool: 'OPFERGABE', cryptTide: 'GEZEITEN', cryptPick: 'Tippe auf eine Tafel', cryptCount: 'TAFEL {n} / {m}', cryptCapped: 'MAXIMALGEWINN ERREICHT',
      cryptRule: 'Opfergabe = Tafeln × aktuelle Gezeiten · die Gezeiten wirken nur auf spätere Tafeln · die Finsternis multipliziert die Opfergabe',
      cryptLeg: ['TAFEL', 'GEZEITEN', 'FINSTERNIS', 'STAUB'],
      cryptHint: { tab: 'TAFEL: ihr Wert × Gezeiten wird zur Opfergabe addiert', tide: 'GEZEITEN: multiplizieren die Gezeiten, nur für spätere Tafeln', eclipse: 'FINSTERNIS: multipliziert die bisherige Opfergabe', dust: 'STAUB: nichts passiert' },
      tableCols: ['Feld', 'Auf dem Rad', 'Zahlt'], settings: 'EINSTELLUNGEN', language: 'Sprache', sound: 'Ton', reducedFx: 'Reduzierte Effekte', stopBonus: 'Autospiel bei Bonus stoppen',
      volumeL: 'Lautstärke', pitchShort: 'Tonhöhe', gradeTitle: 'Farben', gradeNatural: 'Natürlich', gradeVivid: 'Lebhaft', gradeGold: 'Golden', gradeCine: 'Kino', toneShort: 'Höhen', soundOn: 'Ton: an', soundOff: 'Ton: aus', musicShort: 'Atmosphäre', resetL: 'Zurücksetzen', mixLabel: 'Toneinstellungen', pitchL: 'Tonhöhe der Klänge (Halbtöne)', musicL: 'Hintergrundatmosphäre', autoOpts: 'Autospiel-Drehungen', off: 'Aus', on: 'An', close: 'Schließen', currencyL: 'Währung', resetBal: 'Guthaben zurücksetzen', noWin: 'Kein Gewinn', handLabel: 'WUT DES ANUBIS'
    },
    es: {
      brandTop: 'ANUBIS', balance: 'SALDO', bet: 'APUESTA', win: 'PREMIO', turbo: 'TURBO', auto: 'AUTO',
      spin: 'GIRAR', stop: 'PARAR', ready: 'Gira la rueda del juicio', spinning: 'La rueda del juicio gira…',
      oraclePlus: 'ORÁCULO+', plusHint: 'ORÁCULO+: potenciador en ≈ {opp} % de los giros · apuesta ×1,1', cost: 'COSTE',
      session: 'SESIÓN', sessTime: 'Duración', sessSpins: 'Giros', sessWag: 'Apostado', sessWon: 'Ganado', sessNet: 'Resultado neto', lossLimit: 'Límite de pérdida de la sesión', qualityL: 'Calidad gráfica', qAuto: 'Auto', qHigh: 'Alta', qLow: 'Baja',
      realityTitle: 'AVISO DE SESIÓN', realityMsg: function (m, n) { return 'Llevas ' + m + ' min jugando. Resultado neto: ' + n + '.'; }, limitTitle: 'LÍMITE ALCANZADO', limitMsg: 'Has alcanzado tu límite de pérdida. Cámbialo en los ajustes para seguir jugando.', keepPlaying: 'SEGUIR JUGANDO', takeBreak: 'HACER UNA PAUSA',
      rulesPlus: 'Modo ORÁCULO+: apuesta ×1,1, el Oráculo aparece en ≈ {opp} % de los giros. Mismo RTP (≈ 96 %).',
      buyBtn: 'COMPRAR BONUS', buyTitle: 'COMPRAR BONUS', buySub: 'Abre un bonus directamente, sin pasar por la rueda. Precio = apuesta × multiplicador. La Furia de Anubis aún puede apoderarse de él.', buyPrice: 'PRECIO', buyNow: 'COMPRAR', buyOn: 'Compra de bonus', buyWheel: 'Volver a la rueda', buyNoFunds: 'Saldo insuficiente para este bonus', buyRtp: 'RTP ≈ 96 %',
      buyDesc: { scarab: '3 escarabajos, hasta {scmax}× cada uno', weigh: 'Pluma o corazón: el más pesado gana, hasta {wmax}×', vault: 'Pirámide: 12 cofres, las llaves de oro alargan la selección', hand: 'Elige un color: DOBLE = rueda duplicada (hasta ×16), bandas de bonus ×3 a ×12' },
      resumed: 'Ronda interrumpida: premio abonado',
      noFunds: 'Saldo insuficiente', oracleSpeaks: 'El Oráculo habla…', oracleOn: 'ORÁCULO', ankhRespin: 'ANKH — ¡GIRO GRATIS!',
      dust: 'El polvo vuelve al polvo…', winLine: 'Premio', respinLabel: 'GIRO EXTRA',
      kinds: { m0: 'POLVO', m025: '0,3×', m05: '0,5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'ANKH', scarab: 'ESCARABAJOS', weigh: 'PESAJE', vault: 'TESORO' },
      kindsLong: { scarab: 'Caída de Escarabajos', weigh: 'Pesaje del Corazón', vault: 'Cámara del Tesoro', hand: 'Furia de Anubis', crypt: 'Santuario de las Mareas' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'JUICIO DIVINO'],
      scarabSub: 'Tres escarabajos caen en la oscuridad. Cada uno paga la casilla donde aterriza.', scarabIntro: 'CAÍDA DE ESCARABAJOS',
      weighIntro: 'PESAJE DEL CORAZÓN', weighSub: '¿Pluma de Maat o corazón? El plato más pesado gana su multiplicador, el más ligero no gana nada.', feather: 'PLUMA', featherOf: 'DE MAAT', heart: 'CORAZÓN', heartOf: 'DE TU ALMA', weighRoll: 'Se revelan los multiplicadores…', weighWon: 'GANADO', weighLost: 'PERDIDO', sayRight: 'Tu plato es el más pesado: ×{m}!', sayWrong: 'El otro plato pesa más: sin premio', weighing: 'Los dioses pesan tu alma…',
      vaultIntro: 'CÁMARA DEL TESORO', vaultSub: 'Un toque abre un cofre. El sello cierra la cámara (conservas tu total); una llave de oro añade cofres por abrir.', pick: 'Toca un cofre', vaultSeal: '¡SELLADO!', vaultKey: 'LLAVE DE ORO  +{n} COFRES', vaultLeft: 'COFRES: {n}', vaultScepter: 'CETRO ×2', vaultClear: 'CÁMARA VACIADA  +{p}×', total: 'TOTAL',
      splashEnter: 'ENTRAR', splashSub: 'El juicio te espera', splashDemo: 'Demo · dinero ficticio · Juega con moderación', curHint: 'Demo: 7 divisas (USD, EUR, CAD, MXN, JPY, SC, GC); conversión orientativa, sin tipos de cambio reales.', demoBuild: 'Demo local: no es la versión de producción de Stake. Los importes son ficticios.',
      steerHint: 'Toca a izquierda o derecha para guiar al escarabajo', fateResists: 'EL DESTINO SE RESISTE',
      pushHint: '¡Toca rápido para inclinar tu plato!',
      launchBonus: 'INICIAR EL BONUS', bonusWord: 'BONUS', bonusUnlocked: 'BONUS DESBLOQUEADO', launchHint: 'Toca el botón o pulsa Espacio', chooseTitle: 'ELIGE TU DESTINO', chooseHint: 'Toca una carta: misma esperanza de ganancia, distinto riesgo', chooseRtp: 'Las tres opciones tienen el mismo RTP',
      profName: { safe: 'PRUDENTE', std: 'EQUILIBRADO', bold: 'AUDAZ' }, profDesc: { safe: 'Premios regulares, techo bajo', std: 'El término medio', bold: 'Premios raros pero enormes' },
      lineScarab: '×{a} a ×{b} por escarabajo', lineWeigh: 'Platos hasta ×{b}', lineVault: 'Sello: {p} % por cofre', volat: 'Volatilidad',
      aimHint: 'Apunta y toca para soltar el escarabajo', guessHint: '¿Pluma o corazón? Toca una carta (teclas 1 / 2)', guessRight: '¡GANASTE!', guessWrong: 'PERDIDO', holdHint: 'Mantén para cargar, suelta para girar', tapFast: 'Toca para acelerar',
      handIntro: 'FURIA DE ANUBIS', handSub: 'El dios se apodera de tu bonus y lo convierte en juicio supremo.', handSpin: 'Los multiplicadores se acumulan…', handFinal: 'JUICIO DICTADO',
      handColorTitle: 'TU COLOR', handColorHint: 'Toca una carta (teclas 1 / 2 / 3). Los tres colores tienen exactamente las mismas probabilidades.',
      handColorName: { turq: 'TURQUESA', gold: 'ORO', ruby: 'RUBÍ' }, handColorSub: '2 casillas DOBLE', handColorRule: 'DOBLE de tu color: la rueda se duplica y giras de nuevo. DOBLE de otro color: la cadena se detiene.', handColorRtp: 'Los tres colores tienen el mismo RTP',
      handYour: 'TU COLOR', handRule: 'Tu color en DOBLE: rueda duplicada, gira de nuevo · otro color: fin', handTier: 'NIVEL', handDouble: 'DOBLE',
      handUp: '¡LA RUEDA SE DUPLICA!', handUpSub: 'Todos los números se duplican — gira de nuevo', handWrong: 'COLOR EQUIVOCADO', handWrongSub: 'La cadena se detiene: se cobra el nivel actual', handNum: 'NÚMERO', handBandAt: 'BANDA DE BONUS',
      bandName: { scarab: 'ESCARABAJOS', weigh: 'PESAJE', vault: 'TESORO' },
      boostApplied: 'POTENCIADOR ORÁCULO', boostIntro: 'BOOST', boostIntroSub: 'todos los valores se multiplican', tapSkip: 'Toca para saltar', continueBtn: 'CONTINUAR', bonusWin: 'PREMIO DEL BONUS',
      infoTitle: 'REGLAS Y TABLA DE PREMIOS', rtp: 'RTP', maxWin: 'Premio máx.', hitRate: 'Rondas ganadoras', bonusFreq: 'Bonus', volat: 'Volatilidad',
      volatV: 'Muy alta', demo: 'Dinero ficticio — demo, los importes en € o $ no son dinero real.',
      rules: [
        'Una apuesta, un giro: la rueda del juicio decide. Cada casilla paga su valor × tu apuesta.',
        'El Oráculo (≈ {op} % de los giros) elige una casilla y le da un potenciador de ×2 a ×100. ¡Si la rueda se detiene allí, se aplica!',
        'ANKH: giro gratis de la rueda, sin apuesta adicional.',
        'Pesaje del Corazón: elige la pluma de Maat o el corazón, los multiplicadores giran y se revelan, y la balanza decide. El plato más pesado gana su multiplicador (hasta ×{wmax}), el más ligero no gana nada: una oportunidad entre dos.',
        'Cualquier bonus puede ser capturado por la FURIA DE ANUBIS: elige un color (turquesa, oro o rubí) y gira la rueda gigante. Un número: premio = número × nivel. DOBLE de TU color: todos los números de la rueda se duplican (nivel ×2, hasta ×16) y giras de nuevo. DOBLE de OTRO color: la cadena se detiene y cobras el número más pequeño de la rueda (3) × nivel.',
        'Las bandas de la Furia lanzan un bonus (Escarabajos ×3 o ×12, Pesaje ×6, Tesoro ×4): premio del bonus × multiplicador de la banda × nivel, hasta ×25000. Una banda nunca devuelve a la Furia.',
        'Animaciones de premio según el multiplicador total de la ronda (premio ÷ coste de la ronda): WIN desde ×1, BIG WIN desde ×10, EXTRA WIN desde ×40, MEGA WIN desde ×150, JUICIO DIVINO desde ×1000.'
      ],
      secretWord: 'BONUS SECRETO', secretUnlocked: '¡DESBLOQUEADO!', secretHint: 'Se ha abierto un bonus oculto… Toca el botón o pulsa Espacio',
      cryptIntro: 'SANTUARIO DE LAS MAREAS', cryptPool: 'OFRENDA', cryptTide: 'MAREA', cryptPick: 'Toca una tablilla', cryptCount: 'TABLILLA {n} / {m}', cryptCapped: 'PREMIO MÁXIMO ALCANZADO',
      cryptRule: 'Ofrenda = tablillas × marea actual · la marea solo afecta a las tablillas siguientes · el eclipse multiplica la ofrenda',
      cryptLeg: ['TABLILLA', 'MAREA', 'ECLIPSE', 'POLVO'],
      cryptHint: { tab: 'TABLILLA: su valor × la marea se suma a la ofrenda', tide: 'MAREA: multiplica la marea, solo para las tablillas siguientes', eclipse: 'ECLIPSE: multiplica la ofrenda acumulada', dust: 'POLVO: no pasa nada' },
      tableCols: ['Casilla', 'En la rueda', 'Paga'], settings: 'AJUSTES', language: 'Idioma', sound: 'Sonido', reducedFx: 'Efectos reducidos', stopBonus: 'Detener auto en bonus',
      volumeL: 'Volumen', pitchShort: 'Tono', gradeTitle: 'Colores', gradeNatural: 'Natural', gradeVivid: 'Vivo', gradeGold: 'Dorado', gradeCine: 'Cine', toneShort: 'Agudos', soundOn: 'Sonido: sí', soundOff: 'Sonido: no', musicShort: 'Ambiente', resetL: 'Restablecer', mixLabel: 'Ajustes de sonido', pitchL: 'Tono de los sonidos (semitonos)', musicL: 'Ambiente de fondo', autoOpts: 'Giros automáticos', off: 'No', on: 'Sí', close: 'Cerrar', currencyL: 'Moneda', resetBal: 'Restablecer saldo', noWin: 'Sin premio', handLabel: 'FURIA DE ANUBIS'
    },
    pt: {
      brandTop: 'ANUBIS', balance: 'SALDO', bet: 'APOSTA', win: 'GANHO', turbo: 'TURBO', auto: 'AUTO',
      spin: 'GIRAR', stop: 'PARAR', ready: 'Gire a roda do julgamento', spinning: 'A roda do julgamento gira…',
      oraclePlus: 'ORÁCULO+', plusHint: 'ORÁCULO+: bônus em ≈ {opp} % de los giros · aposta ×1,1', cost: 'CUSTO',
      session: 'SESSÃO', sessTime: 'Duração', sessSpins: 'Giros', sessWag: 'Apostado', sessWon: 'Ganho', sessNet: 'Resultado líquido', lossLimit: 'Limite de perda da sessão', qualityL: 'Qualidade gráfica', qAuto: 'Auto', qHigh: 'Alta', qLow: 'Baixa',
      realityTitle: 'AVISO DE SESSÃO', realityMsg: function (m, n) { return 'Você joga há ' + m + ' min. Resultado líquido: ' + n + '.'; }, limitTitle: 'LIMITE ATINGIDO', limitMsg: 'Seu limite de perda foi atingido. Altere-o nas configurações para continuar jogando.', keepPlaying: 'CONTINUAR', takeBreak: 'FAZER UMA PAUSA',
      rulesPlus: 'Modo ORÁCULO+: aposta ×1,1, o Oráculo aparece em ≈ {opp} % de los giros. Mesmo RTP (≈ 96 %).',
      buyBtn: 'COMPRAR BÔNUS', buyTitle: 'COMPRAR BÔNUS', buySub: 'Abra um bônus diretamente, sem passar pela roda. Preço = aposta × multiplicador. A Fúria de Anúbis ainda pode capturá-lo.', buyPrice: 'PREÇO', buyNow: 'COMPRAR', buyOn: 'Compra de bônus', buyWheel: 'Voltar à roda', buyNoFunds: 'Saldo insuficiente para este bônus', buyRtp: 'RTP ≈ 96 %',
      buyDesc: { scarab: '3 escaravelhos, até {scmax}× cada', weigh: 'Pena ou coração: o mais pesado vence, até {wmax}×', vault: 'Pirâmide: 12 baús, chaves de ouro ampliam a seleção', hand: 'Escolha uma cor: DOBRO = roda dobrada (até ×16), faixas de bônus ×3 a ×12' },
      resumed: 'Rodada interrompida: ganho creditado',
      noFunds: 'Saldo insuficiente', oracleSpeaks: 'O Oráculo fala…', oracleOn: 'ORÁCULO', ankhRespin: 'ANKH — GIRO GRÁTIS!',
      dust: 'O pó volta ao pó…', winLine: 'Ganho', respinLabel: 'GIRO EXTRA',
      kinds: { m0: 'PÓ', m025: '0,3×', m05: '0,5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'ANKH', scarab: 'ESCARAVELHOS', weigh: 'PESAGEM', vault: 'TESOURO' },
      kindsLong: { scarab: 'Queda dos Escaravelhos', weigh: 'Pesagem do Coração', vault: 'Câmara do Tesouro', hand: 'Fúria de Anúbis', crypt: 'Santuário das Marés' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'JULGAMENTO DIVINO'],
      scarabSub: 'Três escaravelhos mergulham na escuridão. Cada um paga a casa onde cai.', scarabIntro: 'QUEDA DE ESCARAVELHOS',
      weighIntro: 'PESAGEM DO CORAÇÃO', weighSub: 'Pena de Maat ou coração? O prato mais pesado ganha seu multiplicador, o mais leve não ganha nada.', feather: 'PENA', featherOf: 'DE MAAT', heart: 'CORAÇÃO', heartOf: 'DA SUA ALMA', weighRoll: 'Os multiplicadores são revelados…', weighWon: 'GANHOU', weighLost: 'PERDEU', sayRight: 'Seu prato é o mais pesado: ×{m}!', sayWrong: 'O outro prato pesa mais: sem ganho', weighing: 'Os deuses pesam sua alma…',
      vaultIntro: 'CÂMARA DO TESOURO', vaultSub: 'Um toque abre um baú. O selo fecha a câmara (você mantém seu total); uma chave de ouro adiciona baús para abrir.', pick: 'Toque em um baú', vaultSeal: 'SELADO!', vaultKey: 'CHAVE DE OURO  +{n} BAÚS', vaultLeft: 'BAÚS: {n}', vaultScepter: 'CETRO ×2', vaultClear: 'CÂMARA ESVAZIADA  +{p}×', total: 'TOTAL',
      splashEnter: 'ENTRAR', splashSub: 'O julgamento aguarda', splashDemo: 'Demo · dinheiro fictício · Jogue com responsabilidade', curHint: 'Demo: 7 moedas (USD, EUR, CAD, MXN, JPY, SC, GC); conversão indicativa, sem taxas de câmbio reais.', demoBuild: 'Demo local: esta não é a versão de produção da Stake. Os valores são fictícios.',
      steerHint: 'Toque à esquerda ou à direita para guiar o escaravelho', fateResists: 'O DESTINO RESISTE',
      pushHint: 'Toque rápido para inclinar seu prato!',
      launchBonus: 'INICIAR O BÔNUS', bonusWord: 'BÔNUS', bonusUnlocked: 'BÔNUS DESBLOQUEADO', launchHint: 'Toque no botão ou pressione Espaço', chooseTitle: 'ESCOLHA SEU DESTINO', chooseHint: 'Toque numa carta: mesmo retorno esperado, risco diferente', chooseRtp: 'As três opções têm o mesmo RTP',
      profName: { safe: 'CAUTELOSO', std: 'EQUILIBRADO', bold: 'AUDACIOSO' }, profDesc: { safe: 'Ganhos regulares, teto baixo', std: 'O meio-termo', bold: 'Ganhos raros, mas enormes' },
      lineScarab: '×{a} a ×{b} por escaravelho', lineWeigh: 'Pratos até ×{b}', lineVault: 'Selo: {p} % por baú', volat: 'Volatilidade',
      aimHint: 'Mire e toque para soltar o escaravelho', guessHint: 'Pena ou coração? Toque numa carta (teclas 1 / 2)', guessRight: 'VOCÊ GANHOU!', guessWrong: 'PERDEU', holdHint: 'Segure para carregar, solte para girar', tapFast: 'Toque para acelerar',
      handIntro: 'FÚRIA DE ANÚBIS', handSub: 'O deus captura seu bônus e o transforma em julgamento supremo.', handSpin: 'Os multiplicadores se acumulam…', handFinal: 'JULGAMENTO PROFERIDO',
      handColorTitle: 'SUA COR', handColorHint: 'Toque numa carta (teclas 1 / 2 / 3). As três cores têm exatamente as mesmas chances.',
      handColorName: { turq: 'TURQUESA', gold: 'OURO', ruby: 'RUBI' }, handColorSub: '2 casas DOBRO', handColorRule: 'DOBRO da sua cor: a roda dobra e você gira de novo. DOBRO de outra cor: a sequência termina.', handColorRtp: 'As três cores têm o mesmo RTP',
      handYour: 'SUA COR', handRule: 'Sua cor em DOBRO: roda dobrada, gire de novo · outra cor: fim', handTier: 'NÍVEL', handDouble: 'DOBRO',
      handUp: 'A RODA DOBRA!', handUpSub: 'Todos os números são dobrados — gire de novo', handWrong: 'COR ERRADA', handWrongSub: 'A sequência termina: nível atual pago', handNum: 'NÚMERO', handBandAt: 'FAIXA DE BÔNUS',
      bandName: { scarab: 'ESCARAVELHOS', weigh: 'PESAGEM', vault: 'TESOURO' },
      boostApplied: 'BÔNUS DO ORÁCULO', boostIntro: 'BOOST', boostIntroSub: 'todos os valores são multiplicados', tapSkip: 'Toque para pular', continueBtn: 'CONTINUAR', bonusWin: 'GANHO DO BÔNUS',
      infoTitle: 'REGRAS E TABELA DE GANHOS', rtp: 'RTP', maxWin: 'Ganho máx.', hitRate: 'Rodadas vencedoras', bonusFreq: 'Bônus', volat: 'Volatilidade',
      volatV: 'Muito alta', demo: 'Dinheiro fictício — demo, os valores em € ou $ não são dinheiro real.',
      rules: [
        'Uma aposta, um giro: a roda do julgamento decide. Cada casa paga seu valor × sua aposta.',
        'O Oráculo (≈ {op} % dos giros) escolhe uma casa e lhe dá um bônus de ×2 a ×100. Se a roda parar ali, o bônus é aplicado!',
        'ANKH: giro grátis da roda, sem aposta extra.',
        'Pesagem do Coração: escolha a pena de Maat ou o coração, os multiplicadores giram e são revelados, e a balança decide. O prato mais pesado ganha seu multiplicador (até ×{wmax}), o mais leve não ganha nada: uma chance em duas.',
        'Qualquer bônus pode ser capturado pela FÚRIA DE ANÚBIS: escolha uma cor (turquesa, ouro ou rubi) e gire a roda gigante. Um número: ganho = número × nível. DOBRO da SUA cor: todos os números da roda são dobrados (nível ×2, até ×16) e você gira de novo. DOBRO de OUTRA cor: a sequência termina e você recebe o menor número da roda (3) × nível.',
        'As faixas da Fúria iniciam um bônus (Escaravelhos ×3 ou ×12, Pesagem ×6, Tesouro ×4): ganho do bônus × multiplicador da faixa × nível, até ×25000. Uma faixa nunca leva de volta à Fúria.',
        'Animações de ganho, conforme o multiplicador total da rodada (ganho ÷ custo da rodada): WIN a partir de ×1, BIG WIN a partir de ×10, EXTRA WIN a partir de ×40, MEGA WIN a partir de ×150, JULGAMENTO DIVINO a partir de ×1000.'
      ],
      secretWord: 'BÔNUS SECRETO', secretUnlocked: 'DESBLOQUEADO!', secretHint: 'Um bônus oculto se abriu… Toque no botão ou pressione Espaço',
      cryptIntro: 'SANTUÁRIO DAS MARÉS', cryptPool: 'OFERENDA', cryptTide: 'MARÉ', cryptPick: 'Toque em uma tábua', cryptCount: 'TÁBUA {n} / {m}', cryptCapped: 'GANHO MÁXIMO ATINGIDO',
      cryptRule: 'Oferenda = tábuas × maré atual · a maré só afeta as tábuas seguintes · o eclipse multiplica a oferenda',
      cryptLeg: ['TÁBUA', 'MARÉ', 'ECLIPSE', 'PÓ'],
      cryptHint: { tab: 'TÁBUA: seu valor × a maré é somado à oferenda', tide: 'MARÉ: multiplica a maré, só para as tábuas seguintes', eclipse: 'ECLIPSE: multiplica a oferenda acumulada', dust: 'PÓ: nada acontece' },
      tableCols: ['Casa', 'Na roda', 'Paga'], settings: 'CONFIGURAÇÕES', language: 'Idioma', sound: 'Som', reducedFx: 'Efeitos reduzidos', stopBonus: 'Parar o auto no bônus',
      volumeL: 'Volume', pitchShort: 'Tom', gradeTitle: 'Cores', gradeNatural: 'Natural', gradeVivid: 'Vívido', gradeGold: 'Dourado', gradeCine: 'Cinema', toneShort: 'Agudos', soundOn: 'Som: sim', soundOff: 'Som: não', musicShort: 'Ambiente', resetL: 'Redefinir', mixLabel: 'Configurações de som', pitchL: 'Tom dos sons (semitons)', musicL: 'Ambiente de fundo', autoOpts: 'Giros automáticos', off: 'Não', on: 'Sim', close: 'Fechar', currencyL: 'Moeda', resetBal: 'Redefinir saldo', noWin: 'Sem ganho', handLabel: 'FÚRIA DE ANÚBIS'
    },
    pl: {
      brandTop: 'ANUBIS', balance: 'SALDO', bet: 'STAWKA', win: 'WYGRANA', turbo: 'TURBO', auto: 'AUTO',
      spin: 'KRĘĆ', stop: 'STOP', ready: 'Zakręć kołem sądu', spinning: 'Koło sądu się kręci…',
      oraclePlus: 'WYROCZNIA+', plusHint: 'WYROCZNIA+: wzmocnienie w ≈ {opp} % obrotów · stawka ×1,1', cost: 'KOSZT',
      session: 'SESJA', sessTime: 'Czas', sessSpins: 'Obroty', sessWag: 'Postawiono', sessWon: 'Wygrano', sessNet: 'Wynik netto', lossLimit: 'Limit strat w sesji', qualityL: 'Jakość grafiki', qAuto: 'Auto', qHigh: 'Wysoka', qLow: 'Niska',
      realityTitle: 'PRZYPOMNIENIE', realityMsg: function (m, n) { return 'Grasz od ' + m + ' min. Wynik netto: ' + n + '.'; }, limitTitle: 'LIMIT OSIĄGNIĘTY', limitMsg: 'Osiągnięto limit strat. Zmień go w ustawieniach, aby grać dalej.', keepPlaying: 'GRAJ DALEJ', takeBreak: 'ZRÓB PRZERWĘ',
      rulesPlus: 'Tryb WYROCZNIA+: stawka ×1,1, Wyrocznia pojawia się w ≈ {opp} % obrotów. Ten sam RTP (≈ 96 %).',
      buyBtn: 'KUP BONUS', buyTitle: 'KUP BONUS', buySub: 'Otwórz bonus od razu, z pominięciem koła. Cena = stawka × mnożnik. Gniew Anubisa nadal może go przejąć.', buyPrice: 'CENA', buyNow: 'KUP', buyOn: 'Zakup bonusu', buyWheel: 'Powrót do koła', buyNoFunds: 'Za mało środków na ten bonus', buyRtp: 'RTP ≈ 96 %',
      buyDesc: { scarab: '3 skarabeusze, do {scmax}× każdy', weigh: 'Pióro lub serce: cięższe wygrywa, do {wmax}×', vault: 'Piramida: 12 skrzyń, złote klucze wydłużają wybór', hand: 'Wybierz kolor: PODWÓJNIE = podwojone koło (do ×16), pasy bonusowe ×3 do ×12' },
      resumed: 'Przerwana runda: wygrana zaksięgowana',
      noFunds: 'Za mało środków', oracleSpeaks: 'Wyrocznia przemawia…', oracleOn: 'WYROCZNIA', ankhRespin: 'ANCH — DARMOWY OBRÓT!',
      dust: 'Proch wraca do prochu…', winLine: 'Wygrana', respinLabel: 'OBRÓT',
      kinds: { m0: 'PROCH', m025: '0,3×', m05: '0,5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'ANCH', scarab: 'SKARABEUSZE', weigh: 'WAŻENIE', vault: 'SKARB' },
      kindsLong: { scarab: 'Upadek Skarabeuszy', weigh: 'Ważenie Serca', vault: 'Skarbiec', hand: 'Gniew Anubisa', crypt: 'Sanktuarium Pływów' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'BOSKI WYROK'],
      scarabSub: 'Trzy skarabeusze spadają w ciemność. Każdy wypłaca pole, na którym wyląduje.', scarabIntro: 'UPADEK SKARABEUSZY',
      weighIntro: 'WAŻENIE SERCA', weighSub: 'Pióro Maat czy serce? Cięższa szala wygrywa swój mnożnik, lżejsza nic.', feather: 'PIÓRO', featherOf: 'MAAT', heart: 'SERCE', heartOf: 'TWOJEJ DUSZY', weighRoll: 'Mnożniki zostają ujawnione…', weighWon: 'WYGRANA', weighLost: 'PRZEGRANA', sayRight: 'Twoja szala jest cięższa: ×{m}!', sayWrong: 'Druga szala jest cięższa: brak wygranej', weighing: 'Bogowie ważą twoją duszę…',
      vaultIntro: 'SKARBIEC', vaultSub: 'Jedno dotknięcie otwiera skrzynię. Pieczęć zamyka komnatę (zachowujesz sumę); złoty klucz dodaje skrzynie do otwarcia.', pick: 'Dotknij skrzyni', vaultSeal: 'ZAPIECZĘTOWANO!', vaultKey: 'ZŁOTY KLUCZ  +{n} SKRZYNIE', vaultLeft: 'SKRZYNIE: {n}', vaultScepter: 'BERŁO ×2', vaultClear: 'KOMNATA OPRÓŻNIONA  +{p}×', total: 'RAZEM',
      splashEnter: 'WEJDŹ', splashSub: 'Sąd czeka', splashDemo: 'Demo · pieniądze na niby · Graj odpowiedzialnie', curHint: 'Demo: 7 walut (USD, EUR, CAD, MXN, JPY, SC, GC); przeliczenie orientacyjne, bez rzeczywistych kursów.', demoBuild: 'Lokalne demo — to nie jest wersja produkcyjna Stake. Kwoty są fikcyjne.',
      steerHint: 'Dotknij lewej lub prawej strony, by kierować skarabeuszem', fateResists: 'LOS SIĘ OPIERA',
      pushHint: 'Stukaj szybko, by przechylić szalę!',
      launchBonus: 'URUCHOM BONUS', bonusWord: 'BONUS', bonusUnlocked: 'BONUS ODBLOKOWANY', launchHint: 'Dotknij przycisku lub naciśnij spację', chooseTitle: 'WYBIERZ SWÓJ LOS', chooseHint: 'Dotknij karty: ta sama wartość oczekiwana, inne ryzyko', chooseRtp: 'Wszystkie trzy wybory mają ten sam RTP',
      profName: { safe: 'OSTROŻNY', std: 'ZRÓWNOWAŻONY', bold: 'ODWAŻNY' }, profDesc: { safe: 'Regularne wygrane, niski limit', std: 'Złoty środek', bold: 'Rzadkie, ale ogromne wygrane' },
      lineScarab: '×{a} do ×{b} za skarabeusza', lineWeigh: 'Szale do ×{b}', lineVault: 'Pieczęć: {p} % na skrzynię', volat: 'Zmienność',
      aimHint: 'Wymierz i dotknij, by puścić skarabeusza', guessHint: 'Pióro czy serce? Dotknij karty (klawisze 1 / 2)', guessRight: 'WYGRANA!', guessWrong: 'PRZEGRANA', holdHint: 'Przytrzymaj, by naładować, puść, by zakręcić', tapFast: 'Stukaj, by przyspieszyć',
      handIntro: 'GNIEW ANUBISA', handSub: 'Bóg przejmuje twój bonus i zamienia go w najwyższy wyrok.', handSpin: 'Mnożniki się piętrzą…', handFinal: 'WYROK ZAPADŁ',
      handColorTitle: 'TWÓJ KOLOR', handColorHint: 'Dotknij karty (klawisze 1 / 2 / 3). Wszystkie trzy kolory mają dokładnie te same szanse.',
      handColorName: { turq: 'TURKUS', gold: 'ZŁOTO', ruby: 'RUBIN' }, handColorSub: '2 pola PODWÓJNIE', handColorRule: 'PODWÓJNIE w twoim kolorze: koło się podwaja i kręcisz ponownie. PODWÓJNIE w innym kolorze: łańcuch się kończy.', handColorRtp: 'Wszystkie trzy kolory mają ten sam RTP',
      handYour: 'TWÓJ KOLOR', handRule: 'Twój kolor na PODWÓJNIE: koło podwojone, kręć ponownie · inny kolor: koniec', handTier: 'POZIOM', handDouble: 'PODWÓJNIE',
      handUp: 'KOŁO SIĘ PODWAJA!', handUpSub: 'Wszystkie liczby podwojone — kręć ponownie', handWrong: 'ZŁY KOLOR', handWrongSub: 'Łańcuch się kończy: wypłata bieżącego poziomu', handNum: 'LICZBA', handBandAt: 'PAS BONUSOWY',
      bandName: { scarab: 'SKARABEUSZE', weigh: 'WAŻENIE', vault: 'SKARB' },
      boostApplied: 'WZMOCNIENIE WYROCZNI', boostIntro: 'BOOST', boostIntroSub: 'wszystkie wartości są mnożone', tapSkip: 'Dotknij, by pominąć', continueBtn: 'DALEJ', bonusWin: 'WYGRANA Z BONUSU',
      infoTitle: 'ZASADY I TABELA WYGRANYCH', rtp: 'RTP', maxWin: 'Maks. wygrana', hitRate: 'Wygrywające rundy', bonusFreq: 'Bonus', volat: 'Zmienność',
      volatV: 'Bardzo wysoka', demo: 'Pieniądze na niby — demo, kwoty w € lub $ nie są prawdziwymi pieniędzmi.',
      rules: [
        'Jedna stawka, jeden obrót: decyduje koło sądu. Każde pole wypłaca swoją wartość × twoja stawka.',
        'Wyrocznia (≈ {op} % obrotów) wybiera pole i daje mu wzmocnienie od ×2 do ×100. Jeśli koło zatrzyma się tam, wzmocnienie działa!',
        'ANCH: darmowy obrót koła, bez dodatkowej stawki.',
        'Ważenie Serca: wybierz pióro Maat lub serce, mnożniki się kręcą i zostają ujawnione, a potem waga rozstrzyga. Cięższa szala wygrywa swój mnożnik (do ×{wmax}), lżejsza nic: szansa jeden do dwóch.',
        'Każdy bonus może przejąć GNIEW ANUBISA: wybierz kolor (turkus, złoto lub rubin), potem zakręć gigantycznym kołem. Liczba: wygrana = liczba × poziom. PODWÓJNIE w TWOIM kolorze: wszystkie liczby na kole są podwojone (poziom ×2, do ×16) i kręcisz ponownie. PODWÓJNIE w INNYM kolorze: łańcuch się kończy i inkasujesz najmniejszą liczbę na kole (3) × poziom.',
        'Pasy Gniewu uruchamiają bonus (Skarabeusze ×3 lub ×12, Ważenie ×6, Skarb ×4): wygrana z bonusu × mnożnik pasa × poziom, do ×25000. Pas nigdy nie prowadzi z powrotem do Gniewu.',
        'Animacje wygranych według łącznego mnożnika rundy (wygrana ÷ koszt rundy): WIN od ×1, BIG WIN od ×10, EXTRA WIN od ×40, MEGA WIN od ×150, BOSKI WYROK od ×1000.'
      ],
      secretWord: 'TAJNY BONUS', secretUnlocked: 'ODBLOKOWANY!', secretHint: 'Ukryty bonus się otworzył… Dotknij przycisku lub naciśnij spację',
      cryptIntro: 'SANKTUARIUM PŁYWÓW', cryptPool: 'OFIARA', cryptTide: 'PŁYW', cryptPick: 'Dotknij tablicy', cryptCount: 'TABLICA {n} / {m}', cryptCapped: 'OSIĄGNIĘTO MAKS. WYGRANĄ',
      cryptRule: 'Ofiara = tablice × bieżący pływ · pływ działa tylko na kolejne tablice · zaćmienie mnoży ofiarę',
      cryptLeg: ['TABLICA', 'PŁYW', 'ZAĆMIENIE', 'PYŁ'],
      cryptHint: { tab: 'TABLICA: jej wartość × pływ dodaje się do ofiary', tide: 'PŁYW: mnoży pływ, tylko dla kolejnych tablic', eclipse: 'ZAĆMIENIE: mnoży dotychczasową ofiarę', dust: 'PYŁ: nic się nie dzieje' },
      tableCols: ['Pole', 'Na kole', 'Płaci'], settings: 'USTAWIENIA', language: 'Język', sound: 'Dźwięk', reducedFx: 'Ograniczone efekty', stopBonus: 'Zatrzymaj auto na bonusie',
      volumeL: 'Głośność', pitchShort: 'Wysokość', gradeTitle: 'Kolory', gradeNatural: 'Naturalne', gradeVivid: 'Żywe', gradeGold: 'Złote', gradeCine: 'Kino', toneShort: 'Soprany', soundOn: 'Dźwięk: wł.', soundOff: 'Dźwięk: wył.', musicShort: 'Nastrój', resetL: 'Resetuj', mixLabel: 'Ustawienia dźwięku', pitchL: 'Wysokość dźwięków (półtony)', musicL: 'Muzyka w tle', autoOpts: 'Obroty automatyczne', off: 'Wył.', on: 'Wł.', close: 'Zamknij', currencyL: 'Waluta', resetBal: 'Zresetuj saldo', noWin: 'Brak wygranej', handLabel: 'GNIEW ANUBISA'
    },
    tr: {
      brandTop: 'ANUBIS', balance: 'BAKİYE', bet: 'BAHİS', win: 'KAZANÇ', turbo: 'TURBO', auto: 'OTO',
      spin: 'ÇEVİR', stop: 'DUR', ready: 'Yargı çarkını çevir', spinning: 'Yargı çarkı dönüyor…',
      oraclePlus: 'KEHANET+', plusHint: 'KEHANET+: dönüşlerin ≈ %{opp} kadarında güçlendirme · bahis ×1,1', cost: 'MALİYET',
      session: 'OTURUM', sessTime: 'Süre', sessSpins: 'Dönüş', sessWag: 'Bahis', sessWon: 'Kazanç', sessNet: 'Net sonuç', lossLimit: 'Oturum kayıp limiti', qualityL: 'Grafik kalitesi', qAuto: 'Oto', qHigh: 'Yüksek', qLow: 'Düşük',
      realityTitle: 'OTURUM HATIRLATMASI', realityMsg: function (m, n) { return m + ' dakikadır oynuyorsun. Net sonuç: ' + n + '.'; }, limitTitle: 'LİMİTE ULAŞILDI', limitMsg: 'Kayıp limitine ulaştın. Oynamaya devam etmek için ayarlardan değiştir.', keepPlaying: 'DEVAM ET', takeBreak: 'MOLA VER',
      rulesPlus: 'KEHANET+ modu: bahis ×1,1, Kehanet dönüşlerin ≈ %{opp} kadarında belirir. Aynı RTP (≈ %96).',
      buyBtn: 'BONUS SATIN AL', buyTitle: 'BONUS SATIN AL', buySub: 'Çarkı atlayarak doğrudan bir bonus aç. Fiyat = bahis × çarpan. Anubis’in Gazabı yine de onu ele geçirebilir.', buyPrice: 'FİYAT', buyNow: 'SATIN AL', buyOn: 'Bonus satın alma', buyWheel: 'Çarka dön', buyNoFunds: 'Bu bonus için bakiye yetersiz', buyRtp: 'RTP ≈ %96',
      buyDesc: { scarab: '3 scarab, her biri {scmax}×’e kadar', weigh: 'Tüy ya da kalp: ağır olan kazanır, {wmax}×’e kadar', vault: 'Piramit: 12 sandık, altın anahtarlar seçimi uzatır', hand: 'Bir renk seç: ÇİFT = ikiye katlanan çark (×16’ya kadar), ×3 ila ×12 bonus şeritleri' },
      resumed: 'Yarım kalan tur: kazanç hesaba eklendi',
      noFunds: 'Bakiye yetersiz', oracleSpeaks: 'Kehanet konuşuyor…', oracleOn: 'KEHANET', ankhRespin: 'ANKH — BEDAVA DÖNÜŞ!',
      dust: 'Toz toza döner…', winLine: 'Kazanç', respinLabel: 'YENİDEN',
      kinds: { m0: 'TOZ', m025: '0,3×', m05: '0,5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'ANKH', scarab: 'SCARABLAR', weigh: 'TARTI', vault: 'HAZİNE' },
      kindsLong: { scarab: 'Scarab Düşüşü', weigh: 'Kalbin Tartılması', vault: 'Hazine Odası', hand: 'Anubis’in Gazabı', crypt: 'Gelgit Sığınağı' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'İLAHİ HÜKÜM'],
      scarabSub: 'Üç scarab karanlığa dalıyor. Her biri düştüğü hücreyi öder.', scarabIntro: 'SCARAB DÜŞÜŞÜ',
      weighIntro: 'KALBİN TARTILMASI', weighSub: 'Maat’ın tüyü mü, kalp mi? Ağır kefe çarpanını kazanır, hafif kefe hiçbir şey.', feather: 'TÜY', featherOf: 'MAAT’IN', heart: 'KALP', heartOf: 'RUHUNUN', weighRoll: 'Çarpanlar ortaya çıkıyor…', weighWon: 'KAZANDI', weighLost: 'KAYBETTİ', sayRight: 'Kefen daha ağır: ×{m}!', sayWrong: 'Diğer kefe daha ağır: kazanç yok', weighing: 'Tanrılar ruhunu tartıyor…',
      vaultIntro: 'HAZİNE ODASI', vaultSub: 'Bir dokunuş bir sandık açar. Mühür odayı kapatır (toplamın kalır); altın anahtar açılacak sandık ekler.', pick: 'Bir sandığa dokun', vaultSeal: 'MÜHÜRLENDİ!', vaultKey: 'ALTIN ANAHTAR  +{n} SANDIK', vaultLeft: 'SANDIK: {n}', vaultScepter: 'ASA ×2', vaultClear: 'ODA BOŞALTILDI  +{p}×', total: 'TOPLAM',
      splashEnter: 'GİR', splashSub: 'Yargı seni bekliyor', splashDemo: 'Demo · oyun parası · Sorumlu oyna', curHint: 'Demo: 7 para birimi (USD, EUR, CAD, MXN, JPY, SC, GC); dönüşüm yaklaşıktır, gerçek kur değildir.', demoBuild: 'Yerel demo — bu, Stake üretim sürümü değildir. Tutarlar kurgusaldır.',
      steerHint: 'Scarabı yönlendirmek için sola veya sağa dokun', fateResists: 'KADER DİRENİYOR',
      pushHint: 'Kefeni eğmek için hızlı dokun!',
      launchBonus: 'BONUSU BAŞLAT', bonusWord: 'BONUS', bonusUnlocked: 'BONUS AÇILDI', launchHint: 'Düğmeye dokun veya Boşluk tuşuna bas', chooseTitle: 'KADERİNİ SEÇ', chooseHint: 'Bir karta dokun: aynı beklenen getiri, farklı risk', chooseRtp: 'Üç seçeneğin RTP’si aynı',
      profName: { safe: 'TEMKİNLİ', std: 'DENGELİ', bold: 'CESUR' }, profDesc: { safe: 'Düzenli kazançlar, düşük tavan', std: 'Orta yol', bold: 'Nadir ama dev kazançlar' },
      lineScarab: 'Scarab başına ×{a} ila ×{b}', lineWeigh: 'Kefeler ×{b}’ye kadar', lineVault: 'Mühür: sandık başına %{p}', volat: 'Oynaklık',
      aimHint: 'Nişan al, sonra scarabı bırakmak için dokun', guessHint: 'Tüy mü kalp mi? Bir karta dokun (1 / 2 tuşları)', guessRight: 'KAZANDIN!', guessWrong: 'KAYBETTİN', holdHint: 'Doldurmak için basılı tut, çevirmek için bırak', tapFast: 'Hızlandırmak için dokun',
      handIntro: 'ANUBİS’İN GAZABI', handSub: 'Tanrı bonusunu ele geçirip en yüksek hükme dönüştürür.', handSpin: 'Çarpanlar üst üste biniyor…', handFinal: 'HÜKÜM VERİLDİ',
      handColorTitle: 'RENGİN', handColorHint: 'Bir karta dokun (1 / 2 / 3 tuşları). Üç rengin şansı tamamen aynı.',
      handColorName: { turq: 'TURKUAZ', gold: 'ALTIN', ruby: 'YAKUT' }, handColorSub: '2 ÇİFT hücresi', handColorRule: 'Kendi renginde ÇİFT: çark ikiye katlanır ve yeniden çevirirsin. Başka renkte ÇİFT: zincir biter.', handColorRtp: 'Üç rengin RTP’si aynı',
      handYour: 'RENGİN', handRule: 'Rengin ÇİFT’te: çark ikiye katlanır, yeniden çevir · başka renk: son', handTier: 'KADEME', handDouble: 'ÇİFT',
      handUp: 'ÇARK İKİYE KATLANIYOR!', handUpSub: 'Tüm sayılar ikiye katlandı — yeniden çevir', handWrong: 'YANLIŞ RENK', handWrongSub: 'Zincir biter: mevcut kademe ödenir', handNum: 'SAYI', handBandAt: 'BONUS ŞERİDİ',
      bandName: { scarab: 'SCARABLAR', weigh: 'TARTI', vault: 'HAZİNE' },
      boostApplied: 'KEHANET GÜCÜ', boostIntro: 'BOOST', boostIntroSub: 'tüm değerler çarpılır', tapSkip: 'Geçmek için dokun', continueBtn: 'DEVAM', bonusWin: 'BONUS KAZANCI',
      infoTitle: 'KURALLAR VE ÖDEME TABLOSU', rtp: 'RTP', maxWin: 'Maks. kazanç', hitRate: 'Kazanan turlar', bonusFreq: 'Bonus', volat: 'Oynaklık',
      volatV: 'Çok yüksek', demo: 'Oyun parası — demo, € veya $ tutarları gerçek para değildir.',
      rules: [
        'Bir bahis, bir dönüş: yargı çarkı karar verir. Her hücre değerini × bahsini öder.',
        'Kehanet (dönüşlerin ≈ %{op} kadarında) bir hücre seçer ve ona ×2 ila ×100 güçlendirme verir. Çark orada durursa güçlendirme uygulanır!',
        'ANKH: çarkın ücretsiz yeniden dönüşü, ek bahis yok.',
        'Kalbin Tartılması: Maat’ın tüyünü ya da kalbi seç, çarpanlar döner ve ortaya çıkar, sonra terazi karar verir. Ağır kefe çarpanını kazanır (×{wmax}’e kadar), hafif kefe hiçbir şey: yarı yarıya şans.',
        'Her bonus ANUBİS’İN GAZABI tarafından ele geçirilebilir: bir renk seç (turkuaz, altın veya yakut), sonra dev çarkı çevir. Bir sayı: kazanç = sayı × kademe. KENDİ renginde ÇİFT: çarktaki tüm sayılar ikiye katlanır (kademe ×2, ×16’ya kadar) ve yeniden çevirirsin. BAŞKA renkte ÇİFT: zincir biter ve çarktaki en küçük sayıyı (3) × kademe alırsın.',
        'Gazap şeritleri bir bonus başlatır (Scarablar ×3 veya ×12, Tartı ×6, Hazine ×4): bonus kazancı × şerit çarpanı × kademe, ×25000’e kadar. Bir şerit asla Gazap’a geri götürmez.',
        'Kazanç animasyonları turun toplam çarpanına göre (kazanç ÷ tur maliyeti): ×1’den WIN, ×10’dan BIG WIN, ×40’tan EXTRA WIN, ×150’den MEGA WIN, ×1000’den İLAHİ HÜKÜM.'
      ],
      secretWord: 'GİZLİ BONUS', secretUnlocked: 'AÇILDI!', secretHint: 'Gizli bir bonus açıldı… Düğmeye dokun veya Boşluk tuşuna bas',
      cryptIntro: 'GELGİT SIĞINAĞI', cryptPool: 'ADAK', cryptTide: 'GELGİT', cryptPick: 'Bir tablete dokun', cryptCount: 'TABLET {n} / {m}', cryptCapped: 'MAKS. KAZANÇ',
      cryptRule: 'Adak = tabletler × güncel gelgit · gelgit yalnızca sonraki tabletleri etkiler · tutulma adağı çarpar',
      cryptLeg: ['TABLET', 'GELGİT', 'TUTULMA', 'TOZ'],
      cryptHint: { tab: 'TABLET: değeri × gelgit adağa eklenir', tide: 'GELGİT: gelgiti çarpar, yalnızca sonraki tabletler için', eclipse: 'TUTULMA: biriken adağı çarpar', dust: 'TOZ: hiçbir şey olmaz' },
      tableCols: ['Hücre', 'Çarkta', 'Öder'], settings: 'AYARLAR', language: 'Dil', sound: 'Ses', reducedFx: 'Azaltılmış efektler', stopBonus: 'Bonusta otomatiği durdur',
      volumeL: 'Ses düzeyi', pitchShort: 'Perde', gradeTitle: 'Renkler', gradeNatural: 'Doğal', gradeVivid: 'Canlı', gradeGold: 'Altın', gradeCine: 'Sinema', toneShort: 'Tiz', soundOn: 'Ses: açık', soundOff: 'Ses: kapalı', musicShort: 'Ortam', resetL: 'Sıfırla', mixLabel: 'Ses ayarları', pitchL: 'Ses perdesi (yarım ton)', musicL: 'Arka plan müziği', autoOpts: 'Otomatik dönüşler', off: 'Kapalı', on: 'Açık', close: 'Kapat', currencyL: 'Para birimi', resetBal: 'Bakiyeyi sıfırla', noWin: 'Kazanç yok', handLabel: 'ANUBİS’İN GAZABI'
    },
    id: {
      brandTop: 'ANUBIS', balance: 'SALDO', bet: 'TARUHAN', win: 'MENANG', turbo: 'TURBO', auto: 'OTO',
      spin: 'PUTAR', stop: 'BERHENTI', ready: 'Putar roda penghakiman', spinning: 'Roda penghakiman berputar…',
      oraclePlus: 'ORAKEL+', plusHint: 'ORAKEL+: boost pada ≈ {opp} % putaran · taruhan ×1,1', cost: 'BIAYA',
      session: 'SESI', sessTime: 'Durasi', sessSpins: 'Putaran', sessWag: 'Ditaruh', sessWon: 'Dimenangkan', sessNet: 'Hasil bersih', lossLimit: 'Batas kerugian sesi', qualityL: 'Kualitas grafis', qAuto: 'Otomatis', qHigh: 'Tinggi', qLow: 'Rendah',
      realityTitle: 'PENGINGAT SESI', realityMsg: function (m, n) { return 'Kamu sudah bermain ' + m + ' menit. Hasil bersih: ' + n + '.'; }, limitTitle: 'BATAS TERCAPAI', limitMsg: 'Batas kerugianmu telah tercapai. Ubah di pengaturan untuk terus bermain.', keepPlaying: 'LANJUT MAIN', takeBreak: 'ISTIRAHAT',
      rulesPlus: 'Mode ORAKEL+: taruhan ×1,1, Orakel muncul pada ≈ {opp} % putaran. RTP sama (≈ 96 %).',
      buyBtn: 'BELI BONUS', buyTitle: 'BELI BONUS', buySub: 'Buka bonus langsung tanpa melewati roda. Harga = taruhan × pengali. Amarah Anubis tetap bisa merebutnya.', buyPrice: 'HARGA', buyNow: 'BELI', buyOn: 'Beli bonus', buyWheel: 'Kembali ke roda', buyNoFunds: 'Saldo tidak cukup untuk bonus ini', buyRtp: 'RTP ≈ 96 %',
      buyDesc: { scarab: '3 kumbang, hingga {scmax}× masing-masing', weigh: 'Bulu atau jantung: yang lebih berat menang, hingga {wmax}×', vault: 'Piramida: 12 peti, kunci emas memperpanjang pilihan', hand: 'Pilih warna: GANDA = roda berlipat dua (hingga ×16), pita bonus ×3 hingga ×12' },
      resumed: 'Ronde terputus: kemenangan dikreditkan',
      noFunds: 'Saldo tidak cukup', oracleSpeaks: 'Orakel berbicara…', oracleOn: 'ORAKEL', ankhRespin: 'ANKH — PUTAR ULANG GRATIS!',
      dust: 'Debu kembali menjadi debu…', winLine: 'Menang', respinLabel: 'PUTAR ULANG',
      kinds: { m0: 'DEBU', m025: '0,3×', m05: '0,5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'ANKH', scarab: 'KUMBANG', weigh: 'TIMBANG', vault: 'HARTA' },
      kindsLong: { scarab: 'Jatuhnya Kumbang', weigh: 'Penimbangan Hati', vault: 'Ruang Harta', hand: 'Amarah Anubis', crypt: 'Kuil Pasang Surut' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'PENGHAKIMAN ILAHI'],
      scarabSub: 'Tiga kumbang menukik ke dalam gelap. Masing-masing membayar kotak tempat ia mendarat.', scarabIntro: 'JATUHNYA KUMBANG',
      weighIntro: 'PENIMBANGAN HATI', weighSub: 'Bulu Maat atau hati? Piringan yang lebih berat memenangkan pengalinya, yang lebih ringan tidak mendapat apa-apa.', feather: 'BULU', featherOf: 'MAAT', heart: 'HATI', heartOf: 'JIWAMU', weighRoll: 'Pengali diungkap…', weighWon: 'MENANG', weighLost: 'KALAH', sayRight: 'Piringanmu lebih berat: ×{m}!', sayWrong: 'Piringan lain lebih berat: tidak menang', weighing: 'Para dewa menimbang jiwamu…',
      vaultIntro: 'RUANG HARTA', vaultSub: 'Satu ketukan membuka peti. Segel menutup ruangan (totalmu tetap); kunci emas menambah peti untuk dibuka.', pick: 'Ketuk sebuah peti', vaultSeal: 'TERSEGEL!', vaultKey: 'KUNCI EMAS  +{n} PETI', vaultLeft: 'PETI: {n}', vaultScepter: 'TONGKAT ×2', vaultClear: 'RUANG TERKOSONGKAN  +{p}×', total: 'TOTAL',
      splashEnter: 'MASUK', splashSub: 'Penghakiman menantimu', splashDemo: 'Demo · uang mainan · Bermainlah dengan bijak', curHint: 'Demo: 7 mata uang (USD, EUR, CAD, MXN, JPY, SC, GC); konversi hanya perkiraan, bukan kurs sebenarnya.', demoBuild: 'Demo lokal — ini bukan build produksi Stake. Jumlah yang ditampilkan bersifat fiktif.',
      steerHint: 'Ketuk kiri atau kanan untuk mengarahkan kumbang', fateResists: 'TAKDIR MELAWAN',
      pushHint: 'Ketuk cepat untuk memiringkan piringanmu!',
      launchBonus: 'MULAI BONUS', bonusWord: 'BONUS', bonusUnlocked: 'BONUS TERBUKA', launchHint: 'Ketuk tombol atau tekan Spasi', chooseTitle: 'PILIH TAKDIRMU', chooseHint: 'Ketuk kartu: imbal hasil yang sama, risiko berbeda', chooseRtp: 'Ketiga pilihan memiliki RTP yang sama',
      profName: { safe: 'HATI-HATI', std: 'SEIMBANG', bold: 'BERANI' }, profDesc: { safe: 'Kemenangan stabil, batas rendah', std: 'Jalan tengah', bold: 'Kemenangan langka tapi besar' },
      lineScarab: '×{a} hingga ×{b} per kumbang', lineWeigh: 'Piringan hingga ×{b}', lineVault: 'Segel: {p} % per peti', volat: 'Volatilitas',
      aimHint: 'Bidik, lalu ketuk untuk melepas kumbang', guessHint: 'Bulu atau hati? Ketuk kartu (tombol 1 / 2)', guessRight: 'KAMU MENANG!', guessWrong: 'KALAH', holdHint: 'Tahan untuk mengisi, lepas untuk memutar', tapFast: 'Ketuk untuk mempercepat',
      handIntro: 'AMARAH ANUBIS', handSub: 'Sang dewa merebut bonusmu dan mengubahnya menjadi penghakiman tertinggi.', handSpin: 'Pengali menumpuk…', handFinal: 'PENGHAKIMAN DIJATUHKAN',
      handColorTitle: 'WARNAMU', handColorHint: 'Ketuk kartu (tombol 1 / 2 / 3). Ketiga warna memiliki peluang yang persis sama.',
      handColorName: { turq: 'BIRU TOSCA', gold: 'EMAS', ruby: 'RUBI' }, handColorSub: '2 kotak GANDA', handColorRule: 'GANDA pada warnamu: roda berlipat dua dan kamu memutar lagi. GANDA pada warna lain: rantai berhenti.', handColorRtp: 'Ketiga warna memiliki RTP yang sama',
      handYour: 'WARNAMU', handRule: 'Warnamu pada GANDA: roda berlipat dua, putar lagi · warna lain: selesai', handTier: 'TINGKAT', handDouble: 'GANDA',
      handUp: 'RODA BERLIPAT DUA!', handUpSub: 'Semua angka digandakan — putar lagi', handWrong: 'WARNA SALAH', handWrongSub: 'Rantai berhenti: tingkat saat ini dibayar', handNum: 'ANGKA', handBandAt: 'PITA BONUS',
      bandName: { scarab: 'KUMBANG', weigh: 'TIMBANG', vault: 'HARTA' },
      boostApplied: 'BOOST ORAKEL', boostIntro: 'BOOST', boostIntroSub: 'semua nilai dikalikan', tapSkip: 'Ketuk untuk lewati', continueBtn: 'LANJUT', bonusWin: 'KEMENANGAN BONUS',
      infoTitle: 'ATURAN & TABEL KEMENANGAN', rtp: 'RTP', maxWin: 'Menang maks.', hitRate: 'Ronde menang', bonusFreq: 'Bonus', volat: 'Volatilitas',
      volatV: 'Sangat tinggi', demo: 'Uang mainan — demo, jumlah dalam € atau $ bukan uang sungguhan.',
      rules: [
        'Satu taruhan, satu putaran: roda penghakiman yang menentukan. Setiap kotak membayar nilainya × taruhanmu.',
        'Orakel (≈ {op} % putaran) memilih satu kotak dan memberinya boost ×2 hingga ×100. Jika roda berhenti di sana, boost berlaku!',
        'ANKH: putar ulang roda gratis, tanpa taruhan tambahan.',
        'Penimbangan Hati: pilih bulu Maat atau hati, pengali berputar dan terungkap, lalu timbangan memutuskan. Piringan yang lebih berat memenangkan pengalinya (hingga ×{wmax}), yang lebih ringan tidak mendapat apa-apa: peluang satu banding dua.',
        'Bonus apa pun dapat direbut oleh AMARAH ANUBIS: pilih warna (biru tosca, emas, atau rubi), lalu putar roda raksasa. Sebuah angka: menang = angka × tingkat. GANDA pada warna KAMU: semua angka di roda berlipat dua (tingkat ×2, hingga ×16) dan kamu memutar lagi. GANDA pada warna LAIN: rantai berhenti dan kamu menerima angka terkecil di roda (3) × tingkat.',
        'Pita Amarah memulai bonus (Kumbang ×3 atau ×12, Timbang ×6, Harta ×4): kemenangan bonus × pengali pita × tingkat, hingga ×25000. Pita tidak pernah membawa kembali ke Amarah.',
        'Animasi kemenangan menurut pengali total ronde (kemenangan ÷ biaya ronde): WIN mulai ×1, BIG WIN mulai ×10, EXTRA WIN mulai ×40, MEGA WIN mulai ×150, PENGHAKIMAN ILAHI mulai ×1000.'
      ],
      secretWord: 'BONUS RAHASIA', secretUnlocked: 'TERBUKA!', secretHint: 'Bonus tersembunyi terbuka… Ketuk tombol atau tekan Spasi',
      cryptIntro: 'KUIL PASANG SURUT', cryptPool: 'PERSEMBAHAN', cryptTide: 'PASANG', cryptPick: 'Ketuk sebuah tablet', cryptCount: 'TABLET {n} / {m}', cryptCapped: 'MENANG MAKS. TERCAPAI',
      cryptRule: 'Persembahan = tablet × pasang saat ini · pasang hanya memengaruhi tablet berikutnya · gerhana mengalikan persembahan',
      cryptLeg: ['TABLET', 'PASANG', 'GERHANA', 'DEBU'],
      cryptHint: { tab: 'TABLET: nilainya × pasang ditambahkan ke persembahan', tide: 'PASANG: mengalikan pasang, hanya untuk tablet berikutnya', eclipse: 'GERHANA: mengalikan persembahan yang terkumpul', dust: 'DEBU: tidak terjadi apa-apa' },
      tableCols: ['Kotak', 'Di roda', 'Membayar'], settings: 'PENGATURAN', language: 'Bahasa', sound: 'Suara', reducedFx: 'Efek dikurangi', stopBonus: 'Hentikan otomatis saat bonus',
      volumeL: 'Volume', pitchShort: 'Nada', gradeTitle: 'Warna', gradeNatural: 'Alami', gradeVivid: 'Cerah', gradeGold: 'Keemasan', gradeCine: 'Sinema', toneShort: 'Treble', soundOn: 'Suara: nyala', soundOff: 'Suara: mati', musicShort: 'Suasana', resetL: 'Atur ulang', mixLabel: 'Pengaturan suara', pitchL: 'Nada suara (semiton)', musicL: 'Suasana latar', autoOpts: 'Putaran otomatis', off: 'Mati', on: 'Nyala', close: 'Tutup', currencyL: 'Mata uang', resetBal: 'Atur ulang saldo', noWin: 'Tidak menang', handLabel: 'AMARAH ANUBIS'
    },
    vi: {
      brandTop: 'ANUBIS', balance: 'SỐ DƯ', bet: 'CƯỢC', win: 'THẮNG', turbo: 'TURBO', auto: 'TỰ ĐỘNG',
      spin: 'QUAY', stop: 'DỪNG', ready: 'Quay bánh xe phán xét', spinning: 'Bánh xe phán xét đang quay…',
      oraclePlus: 'THẦN LỜI+', plusHint: 'THẦN LỜI+: tăng lực ở ≈ {opp} % lượt quay · cược ×1,1', cost: 'CHI PHÍ',
      session: 'PHIÊN', sessTime: 'Thời gian', sessSpins: 'Lượt quay', sessWag: 'Đã cược', sessWon: 'Đã thắng', sessNet: 'Kết quả ròng', lossLimit: 'Hạn mức thua của phiên', qualityL: 'Chất lượng đồ họa', qAuto: 'Tự động', qHigh: 'Cao', qLow: 'Thấp',
      realityTitle: 'NHẮC NHỞ PHIÊN', realityMsg: function (m, n) { return 'Bạn đã chơi ' + m + ' phút. Kết quả ròng: ' + n + '.'; }, limitTitle: 'ĐÃ ĐẠT HẠN MỨC', limitMsg: 'Bạn đã đạt hạn mức thua. Hãy đổi trong phần cài đặt để tiếp tục chơi.', keepPlaying: 'CHƠI TIẾP', takeBreak: 'NGHỈ MỘT LÁT',
      rulesPlus: 'Chế độ THẦN LỜI+: cược ×1,1, Thần Lời xuất hiện ở ≈ {opp} % lượt quay. RTP như nhau (≈ 96 %).',
      buyBtn: 'MUA BONUS', buyTitle: 'MUA BONUS', buySub: 'Mở thẳng một bonus, bỏ qua bánh xe. Giá = cược × hệ số. Cơn Thịnh Nộ của Anubis vẫn có thể chiếm lấy nó.', buyPrice: 'GIÁ', buyNow: 'MUA', buyOn: 'Mua bonus', buyWheel: 'Về bánh xe', buyNoFunds: 'Không đủ số dư cho bonus này', buyRtp: 'RTP ≈ 96 %',
      buyDesc: { scarab: '3 bọ hung, mỗi con tới {scmax}×', weigh: 'Lông vũ hoặc trái tim: bên nặng hơn thắng, tới {wmax}×', vault: 'Kim tự tháp: 12 rương, chìa khóa vàng kéo dài lượt chọn', hand: 'Chọn một màu: GẤP ĐÔI = bánh xe nhân đôi (tới ×16), dải bonus ×3 đến ×12' },
      resumed: 'Ván bị gián đoạn: tiền thắng đã được cộng',
      noFunds: 'Không đủ số dư', oracleSpeaks: 'Thần Lời lên tiếng…', oracleOn: 'THẦN LỜI', ankhRespin: 'ANKH — QUAY LẠI MIỄN PHÍ!',
      dust: 'Bụi lại về với bụi…', winLine: 'Thắng', respinLabel: 'QUAY LẠI',
      kinds: { m0: 'BỤI', m025: '0,3×', m05: '0,5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'ANKH', scarab: 'BỌ HUNG', weigh: 'CÂN', vault: 'KHO BÁU' },
      kindsLong: { scarab: 'Bọ Hung Rơi', weigh: 'Cân Trái Tim', vault: 'Phòng Kho Báu', hand: 'Thịnh Nộ của Anubis', crypt: 'Thánh Điện Thủy Triều' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'PHÁN XÉT THẦN THÁNH'],
      scarabSub: 'Ba con bọ hung lao xuống bóng tối. Mỗi con trả ô nó rơi vào.', scarabIntro: 'BỌ HUNG RƠI',
      weighIntro: 'CÂN TRÁI TIM', weighSub: 'Lông vũ Maat hay trái tim? Đĩa cân nặng hơn thắng hệ số của nó, đĩa nhẹ hơn không được gì.', feather: 'LÔNG VŨ', featherOf: 'CỦA MAAT', heart: 'TRÁI TIM', heartOf: 'CỦA BẠN', weighRoll: 'Các hệ số được hé lộ…', weighWon: 'THẮNG', weighLost: 'THUA', sayRight: 'Đĩa của bạn nặng hơn: ×{m}!', sayWrong: 'Đĩa kia nặng hơn: không thắng', weighing: 'Các vị thần đang cân linh hồn bạn…',
      vaultIntro: 'PHÒNG KHO BÁU', vaultSub: 'Một chạm mở một rương. Con dấu đóng căn phòng (bạn giữ tổng điểm); chìa khóa vàng thêm rương để mở.', pick: 'Chạm vào một rương', vaultSeal: 'ĐÃ NIÊM PHONG!', vaultKey: 'CHÌA KHÓA VÀNG  +{n} RƯƠNG', vaultLeft: 'RƯƠNG: {n}', vaultScepter: 'TRƯỢNG ×2', vaultClear: 'ĐÃ DỌN SẠCH PHÒNG  +{p}×', total: 'TỔNG',
      splashEnter: 'VÀO', splashSub: 'Phán xét đang chờ', splashDemo: 'Bản demo · tiền ảo · Hãy chơi có trách nhiệm', curHint: 'Bản demo: 7 loại tiền tệ (USD, EUR, CAD, MXN, JPY, SC, GC); quy đổi chỉ mang tính tham khảo, không phải tỷ giá thật.', demoBuild: 'Demo cục bộ — đây không phải bản chính thức của Stake. Các số hiển thị là giả định.',
      steerHint: 'Chạm trái hoặc phải để điều khiển bọ hung', fateResists: 'SỐ PHẬN CHỐNG CỰ',
      pushHint: 'Chạm nhanh để nghiêng đĩa cân của bạn!',
      launchBonus: 'BẮT ĐẦU BONUS', bonusWord: 'BONUS', bonusUnlocked: 'ĐÃ MỞ KHÓA BONUS', launchHint: 'Chạm nút hoặc nhấn Phím cách', chooseTitle: 'CHỌN SỐ PHẬN', chooseHint: 'Chạm một lá bài: cùng kỳ vọng, rủi ro khác nhau', chooseRtp: 'Cả ba lựa chọn có cùng RTP',
      profName: { safe: 'THẬN TRỌNG', std: 'CÂN BẰNG', bold: 'LIỀU LĨNH' }, profDesc: { safe: 'Thắng đều, trần thấp', std: 'Con đường giữa', bold: 'Thắng hiếm nhưng khổng lồ' },
      lineScarab: '×{a} đến ×{b} mỗi bọ hung', lineWeigh: 'Đĩa tới ×{b}', lineVault: 'Con dấu: {p} % mỗi rương', volat: 'Biến động',
      aimHint: 'Ngắm, rồi chạm để thả bọ hung', guessHint: 'Lông vũ hay trái tim? Chạm một lá bài (phím 1 / 2)', guessRight: 'BẠN THẮNG!', guessWrong: 'THUA', holdHint: 'Giữ để nạp, thả để quay', tapFast: 'Chạm để tăng tốc',
      handIntro: 'THỊNH NỘ CỦA ANUBIS', handSub: 'Vị thần chiếm lấy bonus của bạn và biến nó thành phán quyết tối cao.', handSpin: 'Các hệ số chồng lên nhau…', handFinal: 'PHÁN QUYẾT ĐÃ ĐƯỢC TUYÊN',
      handColorTitle: 'MÀU CỦA BẠN', handColorHint: 'Chạm một lá bài (phím 1 / 2 / 3). Ba màu có xác suất hoàn toàn như nhau.',
      handColorName: { turq: 'NGỌC LAM', gold: 'VÀNG', ruby: 'HỒNG NGỌC' }, handColorSub: '2 ô GẤP ĐÔI', handColorRule: 'GẤP ĐÔI đúng màu của bạn: bánh xe nhân đôi và bạn quay lại. GẤP ĐÔI màu khác: chuỗi kết thúc.', handColorRtp: 'Ba màu có cùng RTP',
      handYour: 'MÀU CỦA BẠN', handRule: 'Màu của bạn trên GẤP ĐÔI: nhân đôi bánh xe, quay lại · màu khác: kết thúc', handTier: 'BẬC', handDouble: 'GẤP ĐÔI',
      handUp: 'BÁNH XE NHÂN ĐÔI!', handUpSub: 'Mọi con số được nhân đôi — quay lại', handWrong: 'SAI MÀU', handWrongSub: 'Chuỗi dừng: nhận bậc hiện tại', handNum: 'SỐ', handBandAt: 'DẢI BONUS',
      bandName: { scarab: 'BỌ HUNG', weigh: 'CÂN', vault: 'KHO BÁU' },
      boostApplied: 'TĂNG LỰC THẦN LỜI', boostIntro: 'BOOST', boostIntroSub: 'mọi giá trị được nhân lên', tapSkip: 'Chạm để bỏ qua', continueBtn: 'TIẾP TỤC', bonusWin: 'TIỀN THẮNG BONUS',
      infoTitle: 'LUẬT CHƠI & BẢNG THƯỞNG', rtp: 'RTP', maxWin: 'Thắng tối đa', hitRate: 'Ván thắng', bonusFreq: 'Bonus', volat: 'Biến động',
      volatV: 'Rất cao', demo: 'Tiền ảo — bản demo, số tiền theo € hoặc $ không phải tiền thật.',
      rules: [
        'Một lần cược, một lượt quay: bánh xe phán xét quyết định. Mỗi ô trả giá trị của nó × cược của bạn.',
        'Thần Lời (≈ {op} % lượt quay) chọn một ô và tăng lực cho nó từ ×2 đến ×100. Nếu bánh xe dừng ở đó, mức tăng được áp dụng!',
        'ANKH: quay lại bánh xe miễn phí, không cược thêm.',
        'Cân Trái Tim: chọn lông vũ của Maat hoặc trái tim, các hệ số chạy rồi được hé lộ, sau đó cán cân quyết định. Đĩa nặng hơn thắng hệ số của nó (tới ×{wmax}), đĩa nhẹ hơn không được gì: cơ hội một trên hai.',
        'Bất kỳ bonus nào cũng có thể bị THỊNH NỘ CỦA ANUBIS chiếm lấy: chọn một màu (ngọc lam, vàng hoặc hồng ngọc), rồi quay bánh xe khổng lồ. Một con số: thắng = số × bậc. GẤP ĐÔI đúng màu CỦA BẠN: mọi số trên bánh xe được nhân đôi (bậc ×2, tới ×16) và bạn quay lại. GẤP ĐÔI màu KHÁC: chuỗi kết thúc và bạn nhận số nhỏ nhất trên bánh xe (3) × bậc.',
        'Các dải của Thịnh Nộ khởi động một bonus (Bọ Hung ×3 hoặc ×12, Cân ×6, Kho Báu ×4): tiền thắng bonus × hệ số dải × bậc, tới ×25000. Một dải không bao giờ dẫn trở lại Thịnh Nộ.',
        'Hiệu ứng thắng theo hệ số tổng của ván (thắng ÷ chi phí ván): WIN từ ×1, BIG WIN từ ×10, EXTRA WIN từ ×40, MEGA WIN từ ×150, PHÁN XÉT THẦN THÁNH từ ×1000.'
      ],
      secretWord: 'BONUS BÍ MẬT', secretUnlocked: 'ĐÃ MỞ KHÓA!', secretHint: 'Một bonus ẩn vừa mở ra… Chạm nút hoặc nhấn Phím cách',
      cryptIntro: 'THÁNH ĐIỆN THỦY TRIỀU', cryptPool: 'LỄ VẬT', cryptTide: 'THỦY TRIỀU', cryptPick: 'Chạm vào một tấm bia', cryptCount: 'BIA {n} / {m}', cryptCapped: 'ĐẠT THẮNG TỐI ĐA',
      cryptRule: 'Lễ vật = các tấm bia × thủy triều hiện tại · thủy triều chỉ ảnh hưởng các tấm bia sau · nhật thực nhân lễ vật',
      cryptLeg: ['BIA', 'THỦY TRIỀU', 'NHẬT THỰC', 'BỤI'],
      cryptHint: { tab: 'BIA: giá trị × thủy triều được cộng vào lễ vật', tide: 'THỦY TRIỀU: nhân thủy triều, chỉ cho các tấm bia sau', eclipse: 'NHẬT THỰC: nhân lễ vật đã tích lũy', dust: 'BỤI: không có gì xảy ra' },
      tableCols: ['Ô', 'Trên bánh xe', 'Trả'], settings: 'CÀI ĐẶT', language: 'Ngôn ngữ', sound: 'Âm thanh', reducedFx: 'Giảm hiệu ứng', stopBonus: 'Dừng tự động khi có bonus',
      volumeL: 'Âm lượng', pitchShort: 'Cao độ', gradeTitle: 'Màu sắc', gradeNatural: 'Tự nhiên', gradeVivid: 'Rực rỡ', gradeGold: 'Vàng óng', gradeCine: 'Điện ảnh', toneShort: 'Âm cao', soundOn: 'Âm thanh: bật', soundOff: 'Âm thanh: tắt', musicShort: 'Không khí', resetL: 'Đặt lại', mixLabel: 'Cài đặt âm thanh', pitchL: 'Cao độ âm thanh (nửa cung)', musicL: 'Nhạc nền', autoOpts: 'Lượt quay tự động', off: 'Tắt', on: 'Bật', close: 'Đóng', currencyL: 'Tiền tệ', resetBal: 'Đặt lại số dư', noWin: 'Không thắng', handLabel: 'THỊNH NỘ CỦA ANUBIS'
    },
    fi: {
      brandTop: 'ANUBIS', balance: 'SALDO', bet: 'PANOS', win: 'VOITTO', turbo: 'TURBO', auto: 'AUTO',
      spin: 'PYÖRITÄ', stop: 'STOP', ready: 'Pyöritä tuomion rataa', spinning: 'Tuomion ratas pyörii…',
      oraclePlus: 'ORAAKKELI+', plusHint: 'ORAAKKELI+: tehostus ≈ {opp} %:lla pyöräytyksistä · panos ×1,1', cost: 'HINTA',
      session: 'ISTUNTO', sessTime: 'Kesto', sessSpins: 'Pyöräytykset', sessWag: 'Pelattu', sessWon: 'Voitettu', sessNet: 'Nettotulos', lossLimit: 'Istunnon tappioraja', qualityL: 'Grafiikan laatu', qAuto: 'Auto', qHigh: 'Korkea', qLow: 'Matala',
      realityTitle: 'ISTUNTOMUISTUTUS', realityMsg: function (m, n) { return 'Olet pelannut ' + m + ' min. Nettotulos: ' + n + '.'; }, limitTitle: 'RAJA SAAVUTETTU', limitMsg: 'Tappiorajasi on saavutettu. Muuta sitä asetuksissa jatkaaksesi pelaamista.', keepPlaying: 'JATKA PELAAMISTA', takeBreak: 'HOLLI TAUKO',
      rulesPlus: 'ORAAKKELI+-tila: panos ×1,1, Oraakkeli ilmestyy ≈ {opp} %:lla pyöräytyksistä. Sama RTP (≈ 96 %).',
      buyBtn: 'OSTA BONUS', buyTitle: 'OSTA BONUS', buySub: 'Avaa bonus suoraan ohittaen rata. Hinta = panos × kerroin. Anubiksen Raivo voi silti kaapata sen.', buyPrice: 'HINTA', buyNow: 'OSTA', buyOn: 'Bonusosto', buyWheel: 'Takaisin rataan', buyNoFunds: 'Saldo ei riitä tähän bonukseen', buyRtp: 'RTP ≈ 96 %',
      buyDesc: { scarab: '3 skarabea, jopa {scmax}× kukin', weigh: 'Sulka tai sydän: painavampi voittaa, jopa {wmax}×', vault: 'Pyramidi: 12 arkkua, kultaiset avaimet pidentävät valintaa', hand: 'Valitse väri: TUPLA = kaksinkertainen rata (jopa ×16), bonuskaistat ×3–×12' },
      resumed: 'Keskeytynyt kierros: voitto hyvitetty',
      noFunds: 'Saldo ei riitä', oracleSpeaks: 'Oraakkeli puhuu…', oracleOn: 'ORAAKKELI', ankhRespin: 'ANKH — ILMAINEN UUDELLEENPYÖRITYS!',
      dust: 'Tomu palaa tomuksi…', winLine: 'Voitto', respinLabel: 'UUDESTAAN',
      kinds: { m0: 'TOMU', m025: '0,3×', m05: '0,5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'ANKH', scarab: 'SKARABEET', weigh: 'PUNNITUS', vault: 'AARRE' },
      kindsLong: { scarab: 'Skarabeusten pudotus', weigh: 'Sydämen punnitus', vault: 'Aarrekammio', hand: 'Anubiksen Raivo', crypt: 'Vuorovesien pyhäkkö' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'JUMALAINEN TUOMIO'],
      scarabSub: 'Kolme skarabeusta syöksyy pimeyteen. Kukin maksaa ruudun, johon se putoaa.', scarabIntro: 'SKARABEUSTEN PUDOTUS',
      weighIntro: 'SYDÄMEN PUNNITUS', weighSub: 'Maatin sulka vai sydän? Painavampi vaakakuppi voittaa kertoimensa, kevyempi ei mitään.', feather: 'SULKA', featherOf: 'MAATIN', heart: 'SYDÄN', heartOf: 'SIELUSI', weighRoll: 'Kertoimet paljastuvat…', weighWon: 'VOITTO', weighLost: 'HÄVIÖ', sayRight: 'Vaakakuppisi on painavampi: ×{m}!', sayWrong: 'Toinen kuppi on painavampi: ei voittoa', weighing: 'Jumalat punnitsevat sielusi…',
      vaultIntro: 'AARREKAMMIO', vaultSub: 'Yksi napautus avaa arkun. Sinetti sulkee kammion (pidät kertyneen summan); kultainen avain lisää avattavia arkkuja.', pick: 'Napauta arkkua', vaultSeal: 'SINETÖITY!', vaultKey: 'KULTAINEN AVAIN  +{n} ARKKUA', vaultLeft: 'ARKUT: {n}', vaultScepter: 'SEPPELE ×2', vaultClear: 'KAMMIO TYHJENNETTY  +{p}×', total: 'YHTEENSÄ',
      splashEnter: 'ASTU SISÄÄN', splashSub: 'Tuomio odottaa', splashDemo: 'Demo · leikkiraha · Pelaa vastuullisesti', curHint: 'Demo: 7 valuuttaa (USD, EUR, CAD, MXN, JPY, SC, GC); muunnos on suuntaa-antava, ei oikeita kursseja.', demoBuild: 'Paikallinen demo — tämä ei ole Staken tuotantoversio. Summat ovat kuvitteellisia.',
      steerHint: 'Napauta vasemmalle tai oikealle ohjataksesi skarabea', fateResists: 'KOHTALO VASTUSTAA',
      pushHint: 'Napauta nopeasti kallistaaksesi vaakakuppiasi!',
      launchBonus: 'KÄYNNISTÄ BONUS', bonusWord: 'BONUS', bonusUnlocked: 'BONUS AVATTU', launchHint: 'Napauta painiketta tai paina välilyöntiä', chooseTitle: 'VALITSE KOHTALOSI', chooseHint: 'Napauta korttia: sama odotusarvo, eri riski', chooseRtp: 'Kaikilla kolmella valinnalla on sama RTP',
      profName: { safe: 'VAROVAINEN', std: 'TASAPAINOINEN', bold: 'ROHKEA' }, profDesc: { safe: 'Tasaisia voittoja, matala katto', std: 'Kultainen keskitie', bold: 'Harvinaisia mutta valtavia voittoja' },
      lineScarab: '×{a}–×{b} per skarabeus', lineWeigh: 'Vaakakupit jopa ×{b}', lineVault: 'Sinetti: {p} % per arkku', volat: 'Volatiliteetti',
      aimHint: 'Tähtää ja napauta vapauttaaksesi skarabeus', guessHint: 'Sulka vai sydän? Napauta korttia (näppäimet 1 / 2)', guessRight: 'VOITIT!', guessWrong: 'HÄVISIT', holdHint: 'Pidä ladataksesi, vapauta pyöräyttääksesi', tapFast: 'Napauta nopeuttaaksesi',
      handIntro: 'ANUBIKSEN RAIVO', handSub: 'Jumala kaappaa bonuksesi ja muuttaa sen korkeimmaksi tuomioksi.', handSpin: 'Kertoimet kasautuvat…', handFinal: 'TUOMIO ANNETTU',
      handColorTitle: 'VÄRISI', handColorHint: 'Napauta korttia (näppäimet 1 / 2 / 3). Kaikilla kolmella värillä on täsmälleen samat mahdollisuudet.',
      handColorName: { turq: 'TURKOOSI', gold: 'KULTA', ruby: 'RUBIINI' }, handColorSub: '2 TUPLA-ruutua', handColorRule: 'TUPLA omalla värilläsi: rata kaksinkertaistuu ja pyöräytät uudelleen. TUPLA toisella värillä: ketju päättyy.', handColorRtp: 'Kaikilla kolmella värillä on sama RTP',
      handYour: 'VÄRISI', handRule: 'Värisi TUPLA-ruudussa: rata kaksinkertaistuu, pyöritä uudelleen · toinen väri: loppu', handTier: 'TASO', handDouble: 'TUPLA',
      handUp: 'RATA KAKSINKERTAISTUU!', handUpSub: 'Kaikki luvut kaksinkertaistuvat — pyöritä uudelleen', handWrong: 'VÄÄRÄ VÄRI', handWrongSub: 'Ketju päättyy: nykyinen taso maksetaan', handNum: 'LUKU', handBandAt: 'BONUSKAISTA',
      bandName: { scarab: 'SKARABEET', weigh: 'PUNNITUS', vault: 'AARRE' },
      boostApplied: 'ORAAKKELIN TEHOSTUS', boostIntro: 'BOOST', boostIntroSub: 'kaikki arvot kerrotaan', tapSkip: 'Napauta ohittaaksesi', continueBtn: 'JATKA', bonusWin: 'BONUSVOITTO',
      infoTitle: 'SÄÄNNÖT JA VOITTOTAULUKKO', rtp: 'RTP', maxWin: 'Enimmäisvoitto', hitRate: 'Voittavat kierrokset', bonusFreq: 'Bonus', volat: 'Volatiliteetti',
      volatV: 'Erittäin korkea', demo: 'Leikkiraha — demo, €- tai $-summat eivät ole oikeaa rahaa.',
      rules: [
        'Yksi panos, yksi pyöräytys: tuomion ratas ratkaisee. Jokainen ruutu maksaa arvonsa × panoksesi.',
        'Oraakkeli (≈ {op} %:lla pyöräytyksistä) valitsee ruudun ja antaa sille ×2–×100 tehostuksen. Jos ratas pysähtyy siihen, tehostus pätee!',
        'ANKH: ilmainen uudelleenpyöräytys, ei lisäpanosta.',
        'Sydämen punnitus: valitse Maatin sulka tai sydän, kertoimet pyörivät ja paljastuvat, sitten vaaka ratkaisee. Painavampi kuppi voittaa kertoimensa (jopa ×{wmax}), kevyempi ei mitään: mahdollisuus yhdestä kahteen.',
        'ANUBIKSEN RAIVO voi kaapata minkä tahansa bonuksen: valitse väri (turkoosi, kulta tai rubiini) ja pyöritä jättiratasta. Luku: voitto = luku × taso. TUPLA OMALLA värilläsi: kaikki radan luvut kaksinkertaistuvat (taso ×2, jopa ×16) ja pyöräytät uudelleen. TUPLA TOISELLA värillä: ketju päättyy ja saat radan pienimmän luvun (3) × taso.',
        'Raivon kaistat käynnistävät bonuksen (Skarabeet ×3 tai ×12, Punnitus ×6, Aarre ×4): bonusvoitto × kaistan kerroin × taso, jopa ×25000. Kaista ei koskaan johda takaisin Raivoon.',
        'Voittoanimaatiot kierroksen kokonaiskertoimen mukaan (voitto ÷ kierroksen hinta): WIN alkaen ×1, BIG WIN alkaen ×10, EXTRA WIN alkaen ×40, MEGA WIN alkaen ×150, JUMALAINEN TUOMIO alkaen ×1000.'
      ],
      secretWord: 'SALAINEN BONUS', secretUnlocked: 'AVATTU!', secretHint: 'Piilotettu bonus avautui… Napauta painiketta tai paina välilyöntiä',
      cryptIntro: 'VUOROVESIEN PYHÄKKÖ', cryptPool: 'UHRI', cryptTide: 'VUOROVESI', cryptPick: 'Napauta taulua', cryptCount: 'TAULU {n} / {m}', cryptCapped: 'ENIMMÄISVOITTO SAAVUTETTU',
      cryptRule: 'Uhri = taulut × nykyinen vuorovesi · vuorovesi vaikuttaa vain seuraaviin tauluihin · pimennys kertoo uhrin',
      cryptLeg: ['TAULU', 'VUOROVESI', 'PIMENNYS', 'PÖLY'],
      cryptHint: { tab: 'TAULU: sen arvo × vuorovesi lisätään uhriin', tide: 'VUOROVESI: kertoo vuorovettä, vain seuraaville tauluille', eclipse: 'PIMENNYS: kertoo tähän mennessä kertyneen uhrin', dust: 'PÖLY: mitään ei tapahdu' },
      tableCols: ['Ruutu', 'Radalla', 'Maksaa'], settings: 'ASETUKSET', language: 'Kieli', sound: 'Ääni', reducedFx: 'Vähennetyt tehosteet', stopBonus: 'Pysäytä auto bonuksessa',
      volumeL: 'Äänenvoimakkuus', pitchShort: 'Sävelkorkeus', gradeTitle: 'Värit', gradeNatural: 'Luonnollinen', gradeVivid: 'Eloisa', gradeGold: 'Kultainen', gradeCine: 'Elokuva', toneShort: 'Diskantti', soundOn: 'Ääni: päällä', soundOff: 'Ääni: pois', musicShort: 'Tunnelma', resetL: 'Nollaa', mixLabel: 'Ääniasetukset', pitchL: 'Äänten sävelkorkeus (puolisävelaskelta)', musicL: 'Taustatunnelma', autoOpts: 'Automaattiset pyöräytykset', off: 'Pois', on: 'Päällä', close: 'Sulje', currencyL: 'Valuutta', resetBal: 'Nollaa saldo', noWin: 'Ei voittoa', handLabel: 'ANUBIKSEN RAIVO'
    },
    ru: {
      brandTop: 'ANUBIS', balance: 'БАЛАНС', bet: 'СТАВКА', win: 'ВЫИГРЫШ', turbo: 'ТУРБО', auto: 'АВТО',
      spin: 'КРУТИТЬ', stop: 'СТОП', ready: 'Запустите колесо суда', spinning: 'Колесо суда вращается…',
      oraclePlus: 'ОРАКУЛ+', plusHint: 'ОРАКУЛ+: усиление в ≈ {opp} % вращений · ставка ×1,1', cost: 'ЦЕНА',
      session: 'СЕАНС', sessTime: 'Время', sessSpins: 'Вращения', sessWag: 'Поставлено', sessWon: 'Выиграно', sessNet: 'Итог', lossLimit: 'Лимит потерь за сеанс', qualityL: 'Качество графики', qAuto: 'Авто', qHigh: 'Высокое', qLow: 'Низкое',
      realityTitle: 'НАПОМИНАНИЕ', realityMsg: function (m, n) { return 'Вы играете ' + m + ' мин. Итог: ' + n + '.'; }, limitTitle: 'ЛИМИТ ДОСТИГНУТ', limitMsg: 'Лимит потерь достигнут. Измените его в настройках, чтобы продолжить.', keepPlaying: 'ПРОДОЛЖИТЬ', takeBreak: 'СДЕЛАТЬ ПЕРЕРЫВ',
      rulesPlus: 'Режим ОРАКУЛ+: ставка ×1,1, Оракул появляется в ≈ {opp} % вращений. Тот же RTP (≈ 96 %).',
      buyBtn: 'КУПИТЬ БОНУС', buyTitle: 'КУПИТЬ БОНУС', buySub: 'Откройте бонус сразу, минуя колесо. Цена = ставка × множитель. Ярость Анубиса всё ещё может его захватить.', buyPrice: 'ЦЕНА', buyNow: 'КУПИТЬ', buyOn: 'Покупка бонуса', buyWheel: 'Назад к колесу', buyNoFunds: 'Недостаточно средств для этого бонуса', buyRtp: 'RTP ≈ 96 %',
      buyDesc: { scarab: '3 скарабея, до {scmax}× каждый', weigh: 'Перо или сердце: тяжелее — выигрывает, до {wmax}×', vault: 'Пирамида: 12 сундуков, золотые ключи продлевают выбор', hand: 'Выберите цвет: УДВОЕНИЕ = колесо вдвое (до ×16), полосы бонусов ×3–×12' },
      resumed: 'Прерванный раунд: выигрыш зачислен',
      noFunds: 'Недостаточно средств', oracleSpeaks: 'Оракул вещает…', oracleOn: 'ОРАКУЛ', ankhRespin: 'АНКХ — БЕСПЛАТНЫЙ СПИН!',
      dust: 'Прах возвращается в прах…', winLine: 'Выигрыш', respinLabel: 'СПИН',
      kinds: { m0: 'ПРАХ', m025: '0,3×', m05: '0,5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'АНКХ', scarab: 'СКАРАБЕИ', weigh: 'ВЕСЫ', vault: 'СОКРОВИЩЕ' },
      kindsLong: { scarab: 'Падение скарабеев', weigh: 'Взвешивание сердца', vault: 'Сокровищница', hand: 'Ярость Анубиса', crypt: 'Святилище приливов' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'БОЖЕСТВЕННЫЙ СУД'],
      scarabSub: 'Три скарабея падают во тьму. Каждый приносит выплату клетки, в которую упал.', scarabIntro: 'ПАДЕНИЕ СКАРАБЕЕВ',
      weighIntro: 'ВЗВЕШИВАНИЕ СЕРДЦА', weighSub: 'Перо Маат или сердце? Тяжёлая чаша выигрывает свой множитель, лёгкая — ничего.', feather: 'ПЕРО', featherOf: 'МААТ', heart: 'СЕРДЦЕ', heartOf: 'ВАШЕЙ ДУШИ', weighRoll: 'Множители раскрываются…', weighWon: 'ВЫИГРЫШ', weighLost: 'ПРОИГРЫШ', sayRight: 'Ваша чаша тяжелее: ×{m}!', sayWrong: 'Другая чаша тяжелее: без выигрыша', weighing: 'Боги взвешивают вашу душу…',
      vaultIntro: 'СОКРОВИЩНИЦА', vaultSub: 'Одно касание открывает сундук. Печать запирает камеру (накопленная сумма остаётся); золотой ключ добавляет сундуки.', pick: 'Коснитесь сундука', vaultSeal: 'ЗАПЕЧАТАНО!', vaultKey: 'ЗОЛОТОЙ КЛЮЧ  +{n} СУНДУКА', vaultLeft: 'СУНДУКИ: {n}', vaultScepter: 'СКИПЕТР ×2', vaultClear: 'КАМЕРА ОЧИЩЕНА  +{p}×', total: 'ИТОГО',
      splashEnter: 'ВОЙТИ', splashSub: 'Суд ожидает', splashDemo: 'Демо · игровые деньги · Играйте ответственно', curHint: 'Демо: 7 валют (USD, EUR, CAD, MXN, JPY, SC, GC); пересчёт ориентировочный, не по реальному курсу.', demoBuild: 'Локальное демо — это не рабочая версия Stake. Суммы условные.',
      steerHint: 'Коснитесь слева или справа, чтобы направить скарабея', fateResists: 'СУДЬБА СОПРОТИВЛЯЕТСЯ',
      pushHint: 'Быстро нажимайте, чтобы склонить свою чашу!',
      launchBonus: 'ЗАПУСТИТЬ БОНУС', bonusWord: 'БОНУС', bonusUnlocked: 'БОНУС ОТКРЫТ', launchHint: 'Коснитесь кнопки или нажмите пробел', chooseTitle: 'ВЫБЕРИТЕ СУДЬБУ', chooseHint: 'Коснитесь карты: то же ожидание, другой риск', chooseRtp: 'У всех трёх вариантов одинаковый RTP',
      profName: { safe: 'ОСТОРОЖНЫЙ', std: 'СБАЛАНСИРОВАННЫЙ', bold: 'СМЕЛЫЙ' }, profDesc: { safe: 'Частые выигрыши, низкий потолок', std: 'Золотая середина', bold: 'Редкие, но огромные выигрыши' },
      lineScarab: '×{a}–×{b} за скарабея', lineWeigh: 'Чаши до ×{b}', lineVault: 'Печать: {p} % на сундук', volat: 'Волатильность',
      aimHint: 'Прицельтесь и коснитесь, чтобы отпустить скарабея', guessHint: 'Перо или сердце? Коснитесь карты (клавиши 1 / 2)', guessRight: 'ВЫ ВЫИГРАЛИ!', guessWrong: 'ПРОИГРЫШ', holdHint: 'Удерживайте для заряда, отпустите для вращения', tapFast: 'Нажимайте для ускорения',
      handIntro: 'ЯРОСТЬ АНУБИСА', handSub: 'Бог захватывает ваш бонус и превращает его в высший суд.', handSpin: 'Множители накапливаются…', handFinal: 'ПРИГОВОР ВЫНЕСЕН',
      handColorTitle: 'ВАШ ЦВЕТ', handColorHint: 'Коснитесь карты (клавиши 1 / 2 / 3). У трёх цветов абсолютно одинаковые шансы.',
      handColorName: { turq: 'БИРЮЗА', gold: 'ЗОЛОТО', ruby: 'РУБИН' }, handColorSub: '2 клетки УДВОЕНИЕ', handColorRule: 'УДВОЕНИЕ вашего цвета: колесо удваивается, и вы крутите снова. УДВОЕНИЕ другого цвета: цепочка прерывается.', handColorRtp: 'У трёх цветов одинаковый RTP',
      handYour: 'ВАШ ЦВЕТ', handRule: 'Ваш цвет на УДВОЕНИИ: колесо удвоено, крутите снова · другой цвет: конец', handTier: 'УРОВЕНЬ', handDouble: 'УДВОЕНИЕ',
      handUp: 'КОЛЕСО УДВАИВАЕТСЯ!', handUpSub: 'Все числа удвоены — крутите снова', handWrong: 'НЕВЕРНЫЙ ЦВЕТ', handWrongSub: 'Цепочка прервана: текущий уровень выплачен', handNum: 'ЧИСЛО', handBandAt: 'БОНУСНАЯ ПОЛОСА',
      bandName: { scarab: 'СКАРАБЕИ', weigh: 'ВЕСЫ', vault: 'СОКРОВИЩЕ' },
      boostApplied: 'УСИЛЕНИЕ ОРАКУЛА', boostIntro: 'BOOST', boostIntroSub: 'все значения умножаются', tapSkip: 'Коснитесь, чтобы пропустить', continueBtn: 'ДАЛЕЕ', bonusWin: 'ВЫИГРЫШ БОНУСА',
      infoTitle: 'ПРАВИЛА И ТАБЛИЦА ВЫПЛАТ', rtp: 'RTP', maxWin: 'Макс. выигрыш', hitRate: 'Выигрышные раунды', bonusFreq: 'Бонус', volat: 'Волатильность',
      volatV: 'Очень высокая', demo: 'Игровые деньги — демо, суммы в € или $ не являются настоящими деньгами.',
      rules: [
        'Одна ставка, одно вращение: решает колесо суда. Каждая клетка платит своё значение × вашу ставку.',
        'Оракул (≈ {op} % вращений) выбирает клетку и даёт ей усиление от ×2 до ×100. Если колесо остановится там, усиление применяется!',
        'АНКХ: бесплатное повторное вращение колеса, без дополнительной ставки.',
        'Взвешивание сердца: выберите перо Маат или сердце, множители пробегают и раскрываются, затем решают весы. Тяжёлая чаша выигрывает свой множитель (до ×{wmax}), лёгкая — ничего: шанс один из двух.',
        'Любой бонус может быть захвачен ЯРОСТЬЮ АНУБИСА: выберите цвет (бирюза, золото или рубин) и запустите гигантское колесо. Число: выигрыш = число × уровень. УДВОЕНИЕ ВАШЕГО цвета: все числа на колесе удваиваются (уровень ×2, до ×16), и вы крутите снова. УДВОЕНИЕ ДРУГОГО цвета: цепочка прерывается, и вы получаете наименьшее число на колесе (3) × уровень.',
        'Полосы Ярости запускают бонус (Скарабеи ×3 или ×12, Весы ×6, Сокровище ×4): выигрыш бонуса × множитель полосы × уровень, до ×25000. Полоса никогда не возвращает к Ярости.',
        'Анимации выигрыша по общему множителю раунда (выигрыш ÷ цена раунда): WIN от ×1, BIG WIN от ×10, EXTRA WIN от ×40, MEGA WIN от ×150, БОЖЕСТВЕННЫЙ СУД от ×1000.'
      ],
      secretWord: 'СЕКРЕТНЫЙ БОНУС', secretUnlocked: 'ОТКРЫТ!', secretHint: 'Скрытый бонус открылся… Коснитесь кнопки или нажмите пробел',
      cryptIntro: 'СВЯТИЛИЩЕ ПРИЛИВОВ', cryptPool: 'ДАР', cryptTide: 'ПРИЛИВ', cryptPick: 'Коснитесь таблички', cryptCount: 'ТАБЛИЧКА {n} / {m}', cryptCapped: 'МАКС. ВЫИГРЫШ ДОСТИГНУТ',
      cryptRule: 'Дар = таблички × текущий прилив · прилив влияет только на следующие таблички · затмение умножает дар',
      cryptLeg: ['ТАБЛИЧКА', 'ПРИЛИВ', 'ЗАТМЕНИЕ', 'ПЫЛЬ'],
      cryptHint: { tab: 'ТАБЛИЧКА: её значение × прилив добавляется к дару', tide: 'ПРИЛИВ: умножает прилив, только для следующих табличек', eclipse: 'ЗАТМЕНИЕ: умножает накопленный дар', dust: 'ПЫЛЬ: ничего не происходит' },
      tableCols: ['Клетка', 'На колесе', 'Платит'], settings: 'НАСТРОЙКИ', language: 'Язык', sound: 'Звук', reducedFx: 'Меньше эффектов', stopBonus: 'Остановить авто на бонусе',
      volumeL: 'Громкость', pitchShort: 'Высота', gradeTitle: 'Цвета', gradeNatural: 'Естественные', gradeVivid: 'Яркие', gradeGold: 'Золотые', gradeCine: 'Кино', toneShort: 'Высокие', soundOn: 'Звук: вкл.', soundOff: 'Звук: выкл.', musicShort: 'Атмосфера', resetL: 'Сбросить', mixLabel: 'Настройки звука', pitchL: 'Высота звуков (полутоны)', musicL: 'Фоновая атмосфера', autoOpts: 'Автоматические вращения', off: 'Выкл.', on: 'Вкл.', close: 'Закрыть', currencyL: 'Валюта', resetBal: 'Сбросить баланс', noWin: 'Нет выигрыша', handLabel: 'ЯРОСТЬ АНУБИСА'
    },
    ar: {
      brandTop: 'ANUBIS', balance: 'الرصيد', bet: 'الرهان', win: 'الربح', turbo: 'تيربو', auto: 'تلقائي',
      spin: 'دوّر', stop: 'إيقاف', ready: 'دوّر عجلة الحكم', spinning: 'عجلة الحكم تدور…',
      oraclePlus: 'العرّاف+', plusHint: 'العرّاف+: تعزيز في ≈ {opp}٪ من اللفات · الرهان ×1.1', cost: 'التكلفة',
      session: 'الجلسة', sessTime: 'المدة', sessSpins: 'اللفات', sessWag: 'المراهن', sessWon: 'المكسوب', sessNet: 'النتيجة الصافية', lossLimit: 'حد الخسارة للجلسة', qualityL: 'جودة الرسوميات', qAuto: 'تلقائي', qHigh: 'عالية', qLow: 'منخفضة',
      realityTitle: 'تذكير الجلسة', realityMsg: function (m, n) { return 'تلعب منذ ' + m + ' دقيقة. النتيجة الصافية: ' + n + '.'; }, limitTitle: 'تم بلوغ الحد', limitMsg: 'لقد بلغت حد الخسارة. غيّره من الإعدادات لمواصلة اللعب.', keepPlaying: 'واصل اللعب', takeBreak: 'خذ استراحة',
      rulesPlus: 'وضع العرّاف+: الرهان ×1.1، يظهر العرّاف في ≈ {opp}٪ من اللفات. نفس نسبة العائد (≈ 96٪).',
      buyBtn: 'اشترِ بونص', buyTitle: 'اشترِ بونص', buySub: 'افتح بونصاً مباشرة دون العجلة. السعر = الرهان × المضاعف. يمكن لغضب أنوبيس أن يستولي عليه.', buyPrice: 'السعر', buyNow: 'شراء', buyOn: 'شراء البونص', buyWheel: 'العودة إلى العجلة', buyNoFunds: 'الرصيد لا يكفي لهذا البونص', buyRtp: 'RTP ≈ 96٪',
      buyDesc: { scarab: '3 جعارين، حتى {scmax}× لكل منها', weigh: 'ريشة أو قلب: الأثقل يفوز، حتى {wmax}×', vault: 'هرم: 12 صندوقاً، والمفاتيح الذهبية تطيل الاختيار', hand: 'اختر لوناً: مضاعفة = عجلة مضاعفة (حتى ×16)، أشرطة بونص ×3 إلى ×12' },
      resumed: 'جولة متوقفة: تم إضافة الربح',
      noFunds: 'الرصيد غير كافٍ', oracleSpeaks: 'العرّاف يتكلم…', oracleOn: 'العرّاف', ankhRespin: 'عنخ — لفة مجانية!',
      dust: 'التراب يعود إلى التراب…', winLine: 'الربح', respinLabel: 'لفة إضافية',
      kinds: { m0: 'تراب', m025: '0.3×', m05: '0.5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'عنخ', scarab: 'جعارين', weigh: 'الميزان', vault: 'الكنز' },
      kindsLong: { scarab: 'سقوط الجعارين', weigh: 'وزن القلب', vault: 'غرفة الكنز', hand: 'غضب أنوبيس', crypt: 'محراب المدّ والجزر' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'DIVINE JUDGEMENT'],
      scarabSub: 'ثلاثة جعارين تهوي في الظلام. كل واحد يدفع قيمة الخانة التي يسقط فيها.', scarabIntro: 'سقوط الجعارين',
      weighIntro: 'وزن القلب', weighSub: 'ريشة ماعت أم القلب؟ الكفة الأثقل تربح مضاعفها والأخف لا تربح شيئاً.', feather: 'الريشة', featherOf: 'ماعت', heart: 'القلب', heartOf: 'روحك', weighRoll: 'تُكشف المضاعفات…', weighWon: 'ربحت', weighLost: 'خسرت', sayRight: 'كفتك هي الأثقل: ×{m}!', sayWrong: 'الكفة الأخرى أثقل: لا ربح', weighing: 'الآلهة تزن روحك…',
      vaultIntro: 'غرفة الكنز', vaultSub: 'لمسة واحدة تفتح صندوقاً. الختم يغلق الغرفة (تحتفظ بمجموعك)، والمفتاح الذهبي يضيف صناديق للفتح.', pick: 'المس صندوقاً', vaultSeal: 'مختوم!', vaultKey: 'مفتاح ذهبي  +{n} صناديق', vaultLeft: 'الصناديق: {n}', vaultScepter: 'صولجان ×2', vaultClear: 'تم إفراغ الغرفة  +{p}×', total: 'المجموع',
      splashEnter: 'ادخل', splashSub: 'الحكم ينتظرك', splashDemo: 'عرض تجريبي · نقود وهمية · العب بمسؤولية', curHint: 'عرض تجريبي: 7 عملات (USD, EUR, CAD, MXN, JPY, SC, GC)؛ التحويل تقريبي وليس بأسعار صرف حقيقية.', demoBuild: 'عرض محلي تجريبي — هذه ليست نسخة الإنتاج الخاصة بـ Stake. المبالغ وهمية.',
      steerHint: 'المس اليسار أو اليمين لتوجيه الجعران', fateResists: 'القدر يقاوم',
      pushHint: 'المس بسرعة لإمالة كفتك!',
      launchBonus: 'ابدأ البونص', bonusWord: 'بونص', bonusUnlocked: 'تم فتح البونص', launchHint: 'المس الزر أو اضغط المسافة', chooseTitle: 'اختر قدرك', chooseHint: 'المس بطاقة: نفس العائد المتوقع، مخاطرة مختلفة', chooseRtp: 'الخيارات الثلاثة لها نفس RTP',
      profName: { safe: 'حذر', std: 'متوازن', bold: 'جريء' }, profDesc: { safe: 'أرباح منتظمة، سقف منخفض', std: 'الطريق الوسط', bold: 'أرباح نادرة لكنها ضخمة' },
      lineScarab: '×{a} إلى ×{b} لكل جعران', lineWeigh: 'كفات حتى ×{b}', lineVault: 'الختم: {p}٪ لكل صندوق', volat: 'التذبذب',
      aimHint: 'صوّب ثم المس لإفلات الجعران', guessHint: 'ريشة أم قلب؟ المس بطاقة (المفتاحان 1 / 2)', guessRight: 'ربحت!', guessWrong: 'خسرت', holdHint: 'اضغط مطولاً للشحن، ثم اترك للدوران', tapFast: 'المس للتسريع',
      handIntro: 'غضب أنوبيس', handSub: 'يستولي الإله على بونصك ويحوّله إلى حكم أسمى.', handSpin: 'المضاعفات تتراكم…', handFinal: 'صدر الحكم',
      handColorTitle: 'لونك', handColorHint: 'المس بطاقة (المفاتيح 1 / 2 / 3). للألوان الثلاثة الفرص نفسها تماماً.',
      handColorName: { turq: 'فيروزي', gold: 'ذهبي', ruby: 'ياقوتي' }, handColorSub: 'خانتا مضاعفة', handColorRule: 'مضاعفة بلونك: تتضاعف العجلة وتدور مجدداً. مضاعفة بلون آخر: تنتهي السلسلة.', handColorRtp: 'للألوان الثلاثة نفس RTP',
      handYour: 'لونك', handRule: 'لونك على مضاعفة: تتضاعف العجلة وتدور مجدداً · لون آخر: النهاية', handTier: 'المستوى', handDouble: 'مضاعفة',
      handUp: 'العجلة تتضاعف!', handUpSub: 'كل الأرقام تضاعفت — دوّر مجدداً', handWrong: 'لون خاطئ', handWrongSub: 'تنتهي السلسلة: يُدفع المستوى الحالي', handNum: 'رقم', handBandAt: 'شريط البونص',
      bandName: { scarab: 'جعارين', weigh: 'الميزان', vault: 'الكنز' },
      boostApplied: 'تعزيز العرّاف', boostIntro: 'BOOST', boostIntroSub: 'تُضاعف كل القيم', tapSkip: 'المس للتخطي', continueBtn: 'متابعة', bonusWin: 'ربح البونص',
      infoTitle: 'القواعد وجدول الأرباح', rtp: 'RTP', maxWin: 'أقصى ربح', hitRate: 'جولات رابحة', bonusFreq: 'بونص', volat: 'التذبذب',
      volatV: 'مرتفع جداً', demo: 'نقود وهمية — نسخة تجريبية، المبالغ بـ € أو $ ليست نقوداً حقيقية.',
      rules: [
        'رهان واحد، لفة واحدة: عجلة الحكم تقرر. كل خانة تدفع قيمتها × رهانك.',
        'العرّاف (≈ {op}٪ من اللفات) يختار خانة ويمنحها تعزيزاً من ×2 إلى ×100. إذا توقفت العجلة عندها يُطبَّق التعزيز!',
        'عنخ: لفة مجانية للعجلة بدون رهان إضافي.',
        'وزن القلب: اختر ريشة ماعت أو القلب، تدور المضاعفات وتنكشف، ثم يحكم الميزان. الكفة الأثقل تربح مضاعفها (حتى ×{wmax}) والأخف لا تربح شيئاً: فرصة واحدة من اثنتين.',
        'يمكن لـ غضب أنوبيس الاستيلاء على أي بونص: اختر لوناً (فيروزي أو ذهبي أو ياقوتي) ثم دوّر العجلة العملاقة. رقم: الربح = الرقم × المستوى. مضاعفة بـ لونك: تتضاعف كل الأرقام على العجلة (المستوى ×2، حتى ×16) وتدور مجدداً. مضاعفة بلون آخر: تنتهي السلسلة وتقبض أصغر رقم على العجلة (3) × المستوى.',
        'أشرطة الغضب تُطلق بونصاً (جعارين ×3 أو ×12، الميزان ×6، الكنز ×4): ربح البونص × مضاعف الشريط × المستوى، حتى ×25000. لا يعيدك أي شريط إلى الغضب.',
        'مؤثرات الربح حسب المضاعف الكلي للجولة (الربح ÷ تكلفة الجولة): WIN من ×1، BIG WIN من ×10، EXTRA WIN من ×40، MEGA WIN من ×150، DIVINE JUDGEMENT من ×1000.'
      ],
      secretWord: 'بونص سري', secretUnlocked: 'تم الفتح!', secretHint: 'انفتح بونص خفي… المس الزر أو اضغط المسافة',
      cryptIntro: 'محراب المدّ والجزر', cryptPool: 'القربان', cryptTide: 'المدّ', cryptPick: 'المس لوحاً', cryptCount: 'اللوح {n} / {m}', cryptCapped: 'بلغت أقصى ربح',
      cryptRule: 'القربان = الألواح × المدّ الحالي · المدّ يؤثر على الألواح اللاحقة فقط · الكسوف يضاعف القربان',
      cryptLeg: ['لوح', 'مدّ', 'كسوف', 'غبار'],
      cryptHint: { tab: 'لوح: قيمته × المدّ تُضاف إلى القربان', tide: 'مدّ: يضاعف المدّ، للألواح اللاحقة فقط', eclipse: 'كسوف: يضاعف القربان المتراكم', dust: 'غبار: لا يحدث شيء' },
      tableCols: ['الخانة', 'على العجلة', 'تدفع'], settings: 'الإعدادات', language: 'اللغة', sound: 'الصوت', reducedFx: 'مؤثرات مخفّضة', stopBonus: 'إيقاف التلقائي عند البونص',
      volumeL: 'مستوى الصوت', pitchShort: 'النغمة', gradeTitle: 'الألوان', gradeNatural: 'طبيعي', gradeVivid: 'زاهٍ', gradeGold: 'ذهبي', gradeCine: 'سينمائي', toneShort: 'الحدّة', soundOn: 'الصوت: تشغيل', soundOff: 'الصوت: إيقاف', musicShort: 'الأجواء', resetL: 'إعادة ضبط', mixLabel: 'إعدادات الصوت', pitchL: 'نغمة الأصوات (أنصاف نغمات)', musicL: 'أجواء الخلفية', autoOpts: 'اللفات التلقائية', off: 'إيقاف', on: 'تشغيل', close: 'إغلاق', currencyL: 'العملة', resetBal: 'إعادة ضبط الرصيد', noWin: 'لا ربح', handLabel: 'غضب أنوبيس'
    },
    hi: {
      brandTop: 'ANUBIS', balance: 'बैलेंस', bet: 'दांव', win: 'जीत', turbo: 'टर्बो', auto: 'ऑटो',
      spin: 'घुमाएँ', stop: 'रुकें', ready: 'न्याय का चक्र घुमाएँ', spinning: 'न्याय का चक्र घूम रहा है…',
      oraclePlus: 'ओरेकल+', plusHint: 'ओरेकल+: ≈ {opp}% स्पिन पर बूस्ट · दांव ×1.1', cost: 'लागत',
      session: 'सत्र', sessTime: 'अवधि', sessSpins: 'स्पिन', sessWag: 'लगाया', sessWon: 'जीता', sessNet: 'शुद्ध परिणाम', lossLimit: 'सत्र की हानि सीमा', qualityL: 'ग्राफ़िक्स गुणवत्ता', qAuto: 'ऑटो', qHigh: 'उच्च', qLow: 'कम',
      realityTitle: 'सत्र अनुस्मारक', realityMsg: function (m, n) { return 'आप ' + m + ' मिनट से खेल रहे हैं। शुद्ध परिणाम: ' + n + '।'; }, limitTitle: 'सीमा पूरी हुई', limitMsg: 'आपकी हानि सीमा पूरी हो गई है। खेलना जारी रखने के लिए सेटिंग्स में बदलें।', keepPlaying: 'खेलते रहें', takeBreak: 'ब्रेक लें',
      rulesPlus: 'ओरेकल+ मोड: दांव ×1.1, ओरेकल ≈ {opp}% स्पिन पर आता है। समान RTP (≈ 96%)।',
      buyBtn: 'बोनस खरीदें', buyTitle: 'बोनस खरीदें', buySub: 'चक्र छोड़कर सीधे बोनस खोलें। कीमत = दांव × गुणक। अनुबिस का क्रोध फिर भी इसे छीन सकता है।', buyPrice: 'कीमत', buyNow: 'खरीदें', buyOn: 'बोनस खरीद', buyWheel: 'चक्र पर लौटें', buyNoFunds: 'इस बोनस के लिए बैलेंस पर्याप्त नहीं', buyRtp: 'RTP ≈ 96%',
      buyDesc: { scarab: '3 स्कारब, प्रत्येक {scmax}× तक', weigh: 'पंख या हृदय: भारी वाला जीतता है, {wmax}× तक', vault: 'पिरामिड: 12 संदूक, सुनहरी चाबियाँ चयन बढ़ाती हैं', hand: 'एक रंग चुनें: डबल = दोगुना चक्र (×16 तक), बोनस पट्टियाँ ×3 से ×12' },
      resumed: 'अधूरा राउंड: जीत जमा कर दी गई',
      noFunds: 'बैलेंस पर्याप्त नहीं', oracleSpeaks: 'ओरेकल बोलता है…', oracleOn: 'ओरेकल', ankhRespin: 'अंख — मुफ़्त रीस्पिन!',
      dust: 'धूल धूल में मिल जाती है…', winLine: 'जीत', respinLabel: 'रीस्पिन',
      kinds: { m0: 'धूल', m025: '0.3×', m05: '0.5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'अंख', scarab: 'स्कारब', weigh: 'तराज़ू', vault: 'ख़ज़ाना' },
      kindsLong: { scarab: 'स्कारब पतन', weigh: 'हृदय का तौल', vault: 'ख़ज़ाना कक्ष', hand: 'अनुबिस का क्रोध', crypt: 'ज्वार का गर्भगृह' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'DIVINE JUDGEMENT'],
      scarabSub: 'तीन स्कारब अंधकार में गिरते हैं। हर एक उसी खाने का भुगतान करता है जहाँ वह गिरता है।', scarabIntro: 'स्कारब पतन',
      weighIntro: 'हृदय का तौल', weighSub: 'माआत का पंख या हृदय? भारी पलड़ा अपना गुणक जीतता है, हल्के को कुछ नहीं मिलता।', feather: 'पंख', featherOf: 'माआत का', heart: 'हृदय', heartOf: 'आपकी आत्मा का', weighRoll: 'गुणक प्रकट हो रहे हैं…', weighWon: 'जीत', weighLost: 'हार', sayRight: 'आपका पलड़ा भारी है: ×{m}!', sayWrong: 'दूसरा पलड़ा भारी है: कोई जीत नहीं', weighing: 'देवता आपकी आत्मा तौल रहे हैं…',
      vaultIntro: 'ख़ज़ाना कक्ष', vaultSub: 'एक टैप से संदूक खुलता है। मुहर कक्ष बंद कर देती है (आपका कुल बना रहता है); सुनहरी चाबी खोलने के लिए और संदूक जोड़ती है।', pick: 'एक संदूक को टैप करें', vaultSeal: 'मुहरबंद!', vaultKey: 'सुनहरी चाबी  +{n} संदूक', vaultLeft: 'संदूक: {n}', vaultScepter: 'राजदंड ×2', vaultClear: 'कक्ष खाली  +{p}×', total: 'कुल',
      splashEnter: 'प्रवेश', splashSub: 'न्याय प्रतीक्षा कर रहा है', splashDemo: 'डेमो · नकली पैसे · ज़िम्मेदारी से खेलें', curHint: 'डेमो: 7 मुद्राएँ (USD, EUR, CAD, MXN, JPY, SC, GC); रूपांतरण केवल सांकेतिक है, असली विनिमय दर नहीं।', demoBuild: 'स्थानीय डेमो — यह Stake का प्रोडक्शन बिल्ड नहीं है। राशियाँ काल्पनिक हैं।',
      steerHint: 'स्कारब को मोड़ने के लिए बाएँ या दाएँ टैप करें', fateResists: 'भाग्य प्रतिरोध करता है',
      pushHint: 'अपना पलड़ा झुकाने के लिए तेज़ी से टैप करें!',
      launchBonus: 'बोनस शुरू करें', bonusWord: 'बोनस', bonusUnlocked: 'बोनस अनलॉक', launchHint: 'बटन टैप करें या स्पेस दबाएँ', chooseTitle: 'अपनी नियति चुनें', chooseHint: 'एक कार्ड टैप करें: समान अपेक्षित रिटर्न, अलग जोखिम', chooseRtp: 'तीनों विकल्पों का RTP समान है',
      profName: { safe: 'सतर्क', std: 'संतुलित', bold: 'साहसी' }, profDesc: { safe: 'नियमित जीत, कम सीमा', std: 'मध्य मार्ग', bold: 'दुर्लभ पर विशाल जीत' },
      lineScarab: 'प्रति स्कारब ×{a} से ×{b}', lineWeigh: 'पलड़े ×{b} तक', lineVault: 'मुहर: प्रति संदूक {p}%', volat: 'अस्थिरता',
      aimHint: 'निशाना लगाएँ, फिर स्कारब छोड़ने के लिए टैप करें', guessHint: 'पंख या हृदय? कार्ड टैप करें (कुंजी 1 / 2)', guessRight: 'आप जीते!', guessWrong: 'हार', holdHint: 'चार्ज करने के लिए दबाए रखें, घुमाने के लिए छोड़ें', tapFast: 'तेज़ करने के लिए टैप करें',
      handIntro: 'अनुबिस का क्रोध', handSub: 'देवता आपका बोनस छीनकर उसे सर्वोच्च न्याय में बदल देता है।', handSpin: 'गुणक जमा होते जा रहे हैं…', handFinal: 'फ़ैसला सुनाया गया',
      handColorTitle: 'आपका रंग', handColorHint: 'एक कार्ड टैप करें (कुंजी 1 / 2 / 3)। तीनों रंगों के अवसर बिल्कुल समान हैं।',
      handColorName: { turq: 'फ़िरोज़ा', gold: 'सुनहरा', ruby: 'माणिक' }, handColorSub: '2 डबल खाने', handColorRule: 'अपने रंग का डबल: चक्र दोगुना हो जाता है और आप फिर घुमाते हैं। दूसरे रंग का डबल: श्रृंखला रुक जाती है।', handColorRtp: 'तीनों रंगों का RTP समान है',
      handYour: 'आपका रंग', handRule: 'डबल पर आपका रंग: चक्र दोगुना, फिर घुमाएँ · दूसरा रंग: समाप्त', handTier: 'स्तर', handDouble: 'डबल',
      handUp: 'चक्र दोगुना हो गया!', handUpSub: 'हर संख्या दोगुनी — फिर घुमाएँ', handWrong: 'ग़लत रंग', handWrongSub: 'श्रृंखला रुकी: मौजूदा स्तर का भुगतान', handNum: 'संख्या', handBandAt: 'बोनस पट्टी',
      bandName: { scarab: 'स्कारब', weigh: 'तराज़ू', vault: 'ख़ज़ाना' },
      boostApplied: 'ओरेकल बूस्ट', boostIntro: 'BOOST', boostIntroSub: 'सभी मान गुणा हो गए', tapSkip: 'छोड़ने के लिए टैप करें', continueBtn: 'जारी रखें', bonusWin: 'बोनस जीत',
      infoTitle: 'नियम और भुगतान तालिका', rtp: 'RTP', maxWin: 'अधिकतम जीत', hitRate: 'जीत वाले राउंड', bonusFreq: 'बोनस', volat: 'अस्थिरता',
      volatV: 'बहुत ऊँची', demo: 'नकली पैसे — डेमो, € या $ की राशियाँ असली पैसे नहीं हैं।',
      rules: [
        'एक दांव, एक स्पिन: न्याय का चक्र तय करता है। हर खाना अपना मान × आपका दांव चुकाता है।',
        'ओरेकल (≈ {op}% स्पिन) एक खाना चुनकर उसे ×2 से ×100 का बूस्ट देता है। चक्र वहाँ रुके तो बूस्ट लागू होता है!',
        'अंख: चक्र का मुफ़्त रीस्पिन, कोई अतिरिक्त दांव नहीं।',
        'हृदय का तौल: माआत का पंख या हृदय चुनें, गुणक घूमकर प्रकट होते हैं, फिर तराज़ू फ़ैसला करता है। भारी पलड़ा अपना गुणक जीतता है (×{wmax} तक), हल्के को कुछ नहीं मिलता: दो में से एक मौका।',
        'कोई भी बोनस अनुबिस का क्रोध छीन सकता है: एक रंग चुनें (फ़िरोज़ा, सुनहरा या माणिक), फिर विशाल चक्र घुमाएँ। संख्या: जीत = संख्या × स्तर। अपने रंग का डबल: चक्र की हर संख्या दोगुनी हो जाती है (स्तर ×2, ×16 तक) और आप फिर घुमाते हैं। दूसरे रंग का डबल: श्रृंखला रुक जाती है और आपको चक्र की सबसे छोटी संख्या (3) × स्तर मिलती है।',
        'क्रोध की पट्टियाँ बोनस शुरू करती हैं (स्कारब ×3 या ×12, तराज़ू ×6, ख़ज़ाना ×4): बोनस जीत × पट्टी का गुणक × स्तर, ×25000 तक। कोई पट्टी कभी क्रोध पर वापस नहीं ले जाती।',
        'जीत के एनिमेशन राउंड के कुल गुणक (जीत ÷ राउंड की लागत) के अनुसार: WIN ×1 से, BIG WIN ×10 से, EXTRA WIN ×40 से, MEGA WIN ×150 से, DIVINE JUDGEMENT ×1000 से।'
      ],
      secretWord: 'गुप्त बोनस', secretUnlocked: 'अनलॉक!', secretHint: 'एक छिपा बोनस खुल गया… बटन टैप करें या स्पेस दबाएँ',
      cryptIntro: 'ज्वार का गर्भगृह', cryptPool: 'भेंट', cryptTide: 'ज्वार', cryptPick: 'एक पट्टिका को टैप करें', cryptCount: 'पट्टिका {n} / {m}', cryptCapped: 'अधिकतम जीत पहुँची',
      cryptRule: 'भेंट = पट्टिकाएँ × वर्तमान ज्वार · ज्वार केवल आगे की पट्टिकाओं पर असर डालता है · ग्रहण भेंट को गुणा करता है',
      cryptLeg: ['पट्टिका', 'ज्वार', 'ग्रहण', 'धूल'],
      cryptHint: { tab: 'पट्टिका: उसका मान × ज्वार भेंट में जुड़ता है', tide: 'ज्वार: ज्वार को गुणा करता है, केवल आगे की पट्टिकाओं के लिए', eclipse: 'ग्रहण: अब तक की भेंट को गुणा करता है', dust: 'धूल: कुछ नहीं होता' },
      tableCols: ['खाना', 'चक्र पर', 'भुगतान'], settings: 'सेटिंग्स', language: 'भाषा', sound: 'ध्वनि', reducedFx: 'कम प्रभाव', stopBonus: 'बोनस पर ऑटो रोकें',
      volumeL: 'वॉल्यूम', pitchShort: 'सुर', gradeTitle: 'रंग', gradeNatural: 'प्राकृतिक', gradeVivid: 'चटक', gradeGold: 'सुनहरा', gradeCine: 'सिनेमा', toneShort: 'तीखापन', soundOn: 'ध्वनि: चालू', soundOff: 'ध्वनि: बंद', musicShort: 'माहौल', resetL: 'रीसेट', mixLabel: 'ध्वनि सेटिंग्स', pitchL: 'ध्वनियों का सुर (सेमिटोन)', musicL: 'पृष्ठभूमि माहौल', autoOpts: 'ऑटो स्पिन', off: 'बंद', on: 'चालू', close: 'बंद करें', currencyL: 'मुद्रा', resetBal: 'बैलेंस रीसेट करें', noWin: 'कोई जीत नहीं', handLabel: 'अनुबिस का क्रोध'
    },
    ja: {
      brandTop: 'ANUBIS', balance: '残高', bet: 'ベット', win: '勝利', turbo: 'ターボ', auto: 'オート',
      spin: 'スピン', stop: '停止', ready: '審判の輪を回そう', spinning: '審判の輪が回っている…',
      oraclePlus: '神託+', plusHint: '神託+: およそ{opp}%の回でブースト · ベット ×1.1', cost: 'コスト',
      session: 'セッション', sessTime: '時間', sessSpins: 'スピン数', sessWag: 'ベット総額', sessWon: '獲得', sessNet: '収支', lossLimit: 'セッション損失上限', qualityL: 'グラフィック品質', qAuto: '自動', qHigh: '高', qLow: '低',
      realityTitle: 'セッション確認', realityMsg: function (m, n) { return m + '分間プレイしています。収支: ' + n + '。'; }, limitTitle: '上限に到達', limitMsg: '損失上限に達しました。続けるには設定で変更してください。', keepPlaying: '続ける', takeBreak: '休憩する',
      rulesPlus: '神託+モード: ベット ×1.1、およそ{opp}%の回で神託が現れます。RTPは同じ (約96%)。',
      buyBtn: 'ボーナス購入', buyTitle: 'ボーナス購入', buySub: '輪を飛ばしてボーナスを直接開きます。価格 = ベット × 倍率。アヌビスの怒りに奪われることもあります。', buyPrice: '価格', buyNow: '購入', buyOn: 'ボーナス購入', buyWheel: '輪に戻る', buyNoFunds: 'このボーナスには残高が足りません', buyRtp: 'RTP 約96%',
      buyDesc: { scarab: 'スカラベ3匹、1匹あたり最大{scmax}×', weigh: '羽根か心臓: 重い方が勝ち、最大{wmax}×', vault: 'ピラミッド:宝箱12個、金の鍵で選択が延びる', hand: '色を選ぶ: ダブル = 輪が倍に (最大×16)、ボーナス帯 ×3〜×12' },
      resumed: '中断されたラウンド: 獲得分を加算しました',
      noFunds: '残高不足', oracleSpeaks: '神託が告げる…', oracleOn: '神託', ankhRespin: 'アンク — 無料リスピン!',
      dust: '塵は塵に還る…', winLine: '勝利', respinLabel: 'リスピン',
      kinds: { m0: '塵', m025: '0.3×', m05: '0.5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'アンク', scarab: 'スカラベ', weigh: '秤', vault: '財宝' },
      kindsLong: { scarab: 'スカラベの落下', weigh: '心臓の秤', vault: '財宝の間', hand: 'アヌビスの怒り', crypt: '潮の聖域' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'DIVINE JUDGEMENT'],
      scarabSub: '3匹のスカラベが闇へ落ちる。それぞれ落ちたマスの配当を得る。', scarabIntro: 'スカラベの落下',
      weighIntro: '心臓の秤', weighSub: 'マアトの羽根か心臓か? 重い皿がその倍率を獲得し、軽い皿は何も得られない。', feather: '羽根', featherOf: 'マアトの', heart: '心臓', heartOf: 'あなたの魂の', weighRoll: '倍率が明らかになる…', weighWon: '勝ち', weighLost: '負け', sayRight: 'あなたの皿が重い: ×{m}!', sayWrong: 'もう一方の皿が重い: 配当なし', weighing: '神々があなたの魂を量っている…',
      vaultIntro: '財宝の間', vaultSub: 'タップで宝箱が開く。封印で部屋が閉じる(合計は保持)。金の鍵は開ける宝箱を増やす。', pick: '宝箱をタップ', vaultSeal: '封印!', vaultKey: '金の鍵  +{n} 宝箱', vaultLeft: '宝箱: {n}', vaultScepter: '王笏 ×2', vaultClear: '部屋を制覇  +{p}×', total: '合計',
      splashEnter: '入場', splashSub: '審判が待っている', splashDemo: 'デモ · 架空のお金 · 遊びすぎにご注意', curHint: 'デモ：7通貨（USD、EUR、CAD、MXN、JPY、SC、GC）。換算は目安であり、実際のレートではありません。', demoBuild: 'ローカルデモ — これはStakeの本番ビルドではありません。金額は架空です。',
      steerHint: '左右をタップしてスカラベを操作', fateResists: '運命が抗う',
      pushHint: '素早くタップして皿を傾けよう!',
      launchBonus: 'ボーナス開始', bonusWord: 'ボーナス', bonusUnlocked: 'ボーナス解放', launchHint: 'ボタンをタップするかスペースキーを押す', chooseTitle: '運命を選べ', chooseHint: 'カードをタップ: 期待値は同じ、リスクが違う', chooseRtp: '3つの選択肢はすべて同じRTP',
      profName: { safe: '慎重', std: 'バランス', bold: '大胆' }, profDesc: { safe: '安定した勝ち、上限は低め', std: '中間の道', bold: 'まれだが巨大な勝ち' },
      lineScarab: 'スカラベ1匹あたり ×{a}〜×{b}', lineWeigh: '皿は最大 ×{b}', lineVault: '封印: 宝箱ごとに{p}%', volat: 'ボラティリティ',
      aimHint: '狙ってタップ、スカラベを放つ', guessHint: '羽根か心臓か? カードをタップ (キー 1 / 2)', guessRight: '勝利!', guessWrong: '負け', holdHint: '長押しでチャージ、離してスピン', tapFast: 'タップで加速',
      handIntro: 'アヌビスの怒り', handSub: '神があなたのボーナスを奪い、至高の審判に変える。', handSpin: '倍率が積み重なる…', handFinal: '審判は下された',
      handColorTitle: 'あなたの色', handColorHint: 'カードをタップ (キー 1 / 2 / 3)。3色の確率はまったく同じ。',
      handColorName: { turq: 'ターコイズ', gold: 'ゴールド', ruby: 'ルビー' }, handColorSub: 'ダブル2マス', handColorRule: '自分の色のダブル: 輪が倍になり、もう一度回す。他の色のダブル: 連鎖は終了。', handColorRtp: '3色はすべて同じRTP',
      handYour: 'あなたの色', handRule: 'ダブルで自分の色: 輪が倍、再スピン · 他の色: 終了', handTier: 'ティア', handDouble: 'ダブル',
      handUp: '輪が倍になる!', handUpSub: 'すべての数字が倍に — もう一度回そう', handWrong: '違う色', handWrongSub: '連鎖終了: 現在のティアを獲得', handNum: '数字', handBandAt: 'ボーナス帯',
      bandName: { scarab: 'スカラベ', weigh: '秤', vault: '財宝' },
      boostApplied: '神託ブースト', boostIntro: 'BOOST', boostIntroSub: 'すべての値が倍増', tapSkip: 'タップでスキップ', continueBtn: '続ける', bonusWin: 'ボーナス獲得',
      infoTitle: 'ルールと配当表', rtp: 'RTP', maxWin: '最大配当', hitRate: '当選率', bonusFreq: 'ボーナス', volat: 'ボラティリティ',
      volatV: '非常に高い', demo: '架空のお金 — デモです。€や$の金額は本物のお金ではありません。',
      rules: [
        '1ベットで1スピン: 審判の輪が決める。各マスは その値 × ベット を支払う。',
        '神託 (約{op}%の回) はマスを1つ選び ×2〜×100 のブーストを与える。輪がそこで止まればブーストが適用される!',
        'アンク: 追加ベットなしで輪をもう一度無料で回す。',
        '心臓の秤: マアトの羽根か心臓を選ぶ。倍率が回って明かされ、秤が決める。重い皿がその倍率 (最大×{wmax}) を獲得し、軽い皿は何も得られない: 2分の1の確率。',
        'どのボーナスも アヌビスの怒り に奪われることがある: 色 (ターコイズ、ゴールド、ルビー) を選び、巨大な輪を回す。数字: 配当 = 数字 × ティア。自分の色のダブル: 輪の数字がすべて倍になり (ティア×2、最大×16)、もう一度回す。他の色のダブル: 連鎖は終わり、輪の最小の数字 (3) × ティア を受け取る。',
        '怒りの帯はボーナスを起動する (スカラベ ×3 または ×12、秤 ×6、財宝 ×4): ボーナス配当 × 帯の倍率 × ティア、最大×25000。帯から怒りに戻ることはない。',
        '勝利演出はラウンドの合計倍率 (配当 ÷ ラウンドのコスト) で決まる: ×1からWIN、×10からBIG WIN、×40からEXTRA WIN、×150からMEGA WIN、×1000からDIVINE JUDGEMENT。'
      ],
      secretWord: '秘密のボーナス', secretUnlocked: '解放!', secretHint: '隠されたボーナスが開いた… ボタンをタップするかスペースキーを押す',
      cryptIntro: '潮の聖域', cryptPool: '供物', cryptTide: '潮', cryptPick: '石板をタップ', cryptCount: '石板 {n} / {m}', cryptCapped: '最大配当に到達',
      cryptRule: '供物 = 石板 × 現在の潮 · 潮は後の石板にだけ作用 · 日食は供物を倍にする',
      cryptLeg: ['石板', '潮', '日食', '塵'],
      cryptHint: { tab: '石板: その値 × 潮が供物に加算される', tide: '潮: 潮を倍にする(後の石板のみ)', eclipse: '日食: ここまでの供物を倍にする', dust: '塵: 何も起きない' },
      tableCols: ['マス', '輪の上', '配当'], settings: '設定', language: '言語', sound: 'サウンド', reducedFx: '演出を減らす', stopBonus: 'ボーナスでオートを停止',
      volumeL: '音量', pitchShort: '音程', gradeTitle: '色調', gradeNatural: 'ナチュラル', gradeVivid: '鮮やか', gradeGold: 'ゴールド', gradeCine: 'シネマ', toneShort: '高音', soundOn: 'サウンド: オン', soundOff: 'サウンド: オフ', musicShort: '雰囲気', resetL: 'リセット', mixLabel: 'サウンド設定', pitchL: '効果音の音程 (半音)', musicL: '背景の雰囲気', autoOpts: 'オートスピン回数', off: 'オフ', on: 'オン', close: '閉じる', currencyL: '通貨', resetBal: '残高をリセット', noWin: '配当なし', handLabel: 'アヌビスの怒り'
    },
    ko: {
      brandTop: 'ANUBIS', balance: '잔액', bet: '베팅', win: '당첨', turbo: '터보', auto: '자동',
      spin: '스핀', stop: '정지', ready: '심판의 바퀴를 돌리세요', spinning: '심판의 바퀴가 돌아갑니다…',
      oraclePlus: '신탁+', plusHint: '신탁+: 약 {opp}%의 회전에서 부스트 · 베팅 ×1.1', cost: '비용',
      session: '세션', sessTime: '시간', sessSpins: '스핀 수', sessWag: '베팅액', sessWon: '획득', sessNet: '순손익', lossLimit: '세션 손실 한도', qualityL: '그래픽 품질', qAuto: '자동', qHigh: '높음', qLow: '낮음',
      realityTitle: '세션 알림', realityMsg: function (m, n) { return m + '분째 플레이 중입니다. 순손익: ' + n + '.'; }, limitTitle: '한도 도달', limitMsg: '손실 한도에 도달했습니다. 계속하려면 설정에서 변경하세요.', keepPlaying: '계속하기', takeBreak: '휴식하기',
      rulesPlus: '신탁+ 모드: 베팅 ×1.1, 약 {opp}%의 회전에서 신탁이 나타납니다. RTP 동일 (약 96%).',
      buyBtn: '보너스 구매', buyTitle: '보너스 구매', buySub: '바퀴를 건너뛰고 보너스를 바로 엽니다. 가격 = 베팅 × 배수. 아누비스의 분노가 가로챌 수도 있습니다.', buyPrice: '가격', buyNow: '구매', buyOn: '보너스 구매', buyWheel: '바퀴로 돌아가기', buyNoFunds: '이 보너스에 필요한 잔액이 부족합니다', buyRtp: 'RTP 약 96%',
      buyDesc: { scarab: '스카라베 3마리, 각각 최대 {scmax}×', weigh: '깃털 또는 심장: 더 무거운 쪽 승리, 최대 {wmax}×', vault: '피라미드: 상자 12개, 금 열쇠가 선택을 늘려 줍니다', hand: '색 선택: 더블 = 바퀴 두 배 (최대 ×16), 보너스 띠 ×3~×12' },
      resumed: '중단된 라운드: 당첨금 지급 완료',
      noFunds: '잔액 부족', oracleSpeaks: '신탁이 말합니다…', oracleOn: '신탁', ankhRespin: '앙크 — 무료 리스핀!',
      dust: '먼지는 먼지로 돌아간다…', winLine: '당첨', respinLabel: '리스핀',
      kinds: { m0: '먼지', m025: '0.3×', m05: '0.5×', m1: '1×', m2: '2×', m3: '3×', ankh: '앙크', scarab: '스카라베', weigh: '저울', vault: '보물' },
      kindsLong: { scarab: '스카라베 낙하', weigh: '심장의 저울', vault: '보물의 방', hand: '아누비스의 분노', crypt: '조수의 성소' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'DIVINE JUDGEMENT'],
      scarabSub: '스카라베 세 마리가 어둠 속으로 떨어집니다. 각각 떨어진 칸의 배당을 줍니다.', scarabIntro: '스카라베 낙하',
      weighIntro: '심장의 저울', weighSub: '마아트의 깃털일까, 심장일까? 더 무거운 접시가 배수를 얻고, 가벼운 접시는 아무것도 얻지 못합니다.', feather: '깃털', featherOf: '마아트의', heart: '심장', heartOf: '당신의 영혼의', weighRoll: '배수가 공개됩니다…', weighWon: '승리', weighLost: '패배', sayRight: '당신의 접시가 더 무겁습니다: ×{m}!', sayWrong: '반대쪽 접시가 더 무겁습니다: 당첨 없음', weighing: '신들이 당신의 영혼을 달고 있습니다…',
      vaultIntro: '보물의 방', vaultSub: '한 번 탭하면 상자가 열립니다. 봉인은 방을 닫습니다(합계는 유지). 금 열쇠는 열 수 있는 상자를 늘립니다.', pick: '상자를 탭하세요', vaultSeal: '봉인!', vaultKey: '금 열쇠  +{n} 상자', vaultLeft: '상자: {n}', vaultScepter: '홀 ×2', vaultClear: '방 클리어  +{p}×', total: '합계',
      splashEnter: '입장', splashSub: '심판이 기다립니다', splashDemo: '데모 · 가상 머니 · 책임감 있게 즐기세요', curHint: '데모: 통화 7종(USD, EUR, CAD, MXN, JPY, SC, GC). 환산은 참고용이며 실제 환율이 아닙니다.', demoBuild: '로컬 데모입니다. Stake 프로덕션 빌드가 아닙니다. 금액은 가상입니다.',
      steerHint: '좌우를 탭해 스카라베를 조종하세요', fateResists: '운명이 저항합니다',
      pushHint: '빠르게 탭해 접시를 기울이세요!',
      launchBonus: '보너스 시작', bonusWord: '보너스', bonusUnlocked: '보너스 해금', launchHint: '버튼을 탭하거나 스페이스를 누르세요', chooseTitle: '운명을 선택하세요', chooseHint: '카드를 탭하세요: 기대 수익은 같고 위험이 다릅니다', chooseRtp: '세 가지 선택 모두 RTP가 같습니다',
      profName: { safe: '신중', std: '균형', bold: '대담' }, profDesc: { safe: '꾸준한 당첨, 낮은 상한', std: '중간 길', bold: '드물지만 거대한 당첨' },
      lineScarab: '스카라베당 ×{a}~×{b}', lineWeigh: '접시 최대 ×{b}', lineVault: '봉인: 상자당 {p}%', volat: '변동성',
      aimHint: '조준한 뒤 탭해서 스카라베를 놓으세요', guessHint: '깃털일까, 심장일까? 카드를 탭하세요 (키 1 / 2)', guessRight: '승리!', guessWrong: '패배', holdHint: '길게 눌러 충전, 놓으면 스핀', tapFast: '탭해서 가속',
      handIntro: '아누비스의 분노', handSub: '신이 당신의 보너스를 낚아채 최고의 심판으로 바꿉니다.', handSpin: '배수가 쌓입니다…', handFinal: '심판이 내려졌습니다',
      handColorTitle: '당신의 색', handColorHint: '카드를 탭하세요 (키 1 / 2 / 3). 세 색의 확률은 완전히 같습니다.',
      handColorName: { turq: '터키석', gold: '금색', ruby: '루비' }, handColorSub: '더블 칸 2개', handColorRule: '내 색의 더블: 바퀴가 두 배가 되고 다시 돌립니다. 다른 색의 더블: 연쇄가 끝납니다.', handColorRtp: '세 색 모두 RTP가 같습니다',
      handYour: '당신의 색', handRule: '더블에서 내 색: 바퀴 두 배, 다시 스핀 · 다른 색: 종료', handTier: '단계', handDouble: '더블',
      handUp: '바퀴가 두 배가 됩니다!', handUpSub: '모든 숫자가 두 배 — 다시 돌리세요', handWrong: '잘못된 색', handWrongSub: '연쇄 종료: 현재 단계 지급', handNum: '숫자', handBandAt: '보너스 띠',
      bandName: { scarab: '스카라베', weigh: '저울', vault: '보물' },
      boostApplied: '신탁 부스트', boostIntro: 'BOOST', boostIntroSub: '모든 값이 곱해집니다', tapSkip: '탭해서 건너뛰기', continueBtn: '계속', bonusWin: '보너스 당첨',
      infoTitle: '규칙 및 배당표', rtp: 'RTP', maxWin: '최대 당첨', hitRate: '당첨 라운드', bonusFreq: '보너스', volat: '변동성',
      volatV: '매우 높음', demo: '가상 머니 — 데모입니다. €, $ 금액은 실제 돈이 아닙니다.',
      rules: [
        '한 번 베팅하면 한 번 스핀: 심판의 바퀴가 결정합니다. 각 칸은 그 값 × 베팅액을 지급합니다.',
        '신탁 (약 {op}%의 회전)은 칸 하나를 골라 ×2~×100 부스트를 줍니다. 바퀴가 거기서 멈추면 부스트가 적용됩니다!',
        '앙크: 추가 베팅 없이 바퀴를 무료로 다시 돌립니다.',
        '심장의 저울: 마아트의 깃털이나 심장을 고르면 배수가 돌다가 공개되고, 저울이 판가름합니다. 더 무거운 접시가 배수 (최대 ×{wmax})를 얻고 가벼운 접시는 아무것도 얻지 못합니다: 2분의 1 확률.',
        '어떤 보너스든 아누비스의 분노가 가로챌 수 있습니다: 색 (터키석, 금색, 루비)을 고르고 거대한 바퀴를 돌리세요. 숫자: 당첨 = 숫자 × 단계. 내 색의 더블: 바퀴의 모든 숫자가 두 배가 되고 (단계 ×2, 최대 ×16) 다시 돌립니다. 다른 색의 더블: 연쇄가 끝나고 바퀴의 가장 작은 숫자 (3) × 단계를 받습니다.',
        '분노의 띠는 보너스를 시작합니다 (스카라베 ×3 또는 ×12, 저울 ×6, 보물 ×4): 보너스 당첨 × 띠 배수 × 단계, 최대 ×25000. 띠에서 분노로 되돌아가지는 않습니다.',
        '당첨 연출은 라운드 총 배수 (당첨 ÷ 라운드 비용)에 따라: ×1부터 WIN, ×10부터 BIG WIN, ×40부터 EXTRA WIN, ×150부터 MEGA WIN, ×1000부터 DIVINE JUDGEMENT.'
      ],
      secretWord: '비밀 보너스', secretUnlocked: '해금!', secretHint: '숨겨진 보너스가 열렸습니다… 버튼을 탭하거나 스페이스를 누르세요',
      cryptIntro: '조수의 성소', cryptPool: '제물', cryptTide: '조수', cryptPick: '석판을 탭하세요', cryptCount: '석판 {n} / {m}', cryptCapped: '최대 당첨 도달',
      cryptRule: '제물 = 석판 × 현재 조수 · 조수는 이후 석판에만 적용 · 일식은 제물을 곱합니다',
      cryptLeg: ['석판', '조수', '일식', '먼지'],
      cryptHint: { tab: '석판: 값 × 조수가 제물에 더해집니다', tide: '조수: 조수를 곱함(이후 석판에만)', eclipse: '일식: 지금까지의 제물을 곱합니다', dust: '먼지: 아무 일도 없음' },
      tableCols: ['칸', '바퀴 위', '배당'], settings: '설정', language: '언어', sound: '사운드', reducedFx: '효과 줄이기', stopBonus: '보너스에서 자동 정지',
      volumeL: '볼륨', pitchShort: '음높이', gradeTitle: '색감', gradeNatural: '자연스럽게', gradeVivid: '선명하게', gradeGold: '황금빛', gradeCine: '시네마', toneShort: '고음', soundOn: '사운드: 켜짐', soundOff: '사운드: 꺼짐', musicShort: '분위기', resetL: '초기화', mixLabel: '사운드 설정', pitchL: '효과음 음높이 (반음)', musicL: '배경 분위기', autoOpts: '자동 스핀 횟수', off: '끔', on: '켬', close: '닫기', currencyL: '통화', resetBal: '잔액 초기화', noWin: '당첨 없음', handLabel: '아누비스의 분노'
    },
    zh: {
      brandTop: 'ANUBIS', balance: '余额', bet: '投注', win: '赢取', turbo: '极速', auto: '自动',
      spin: '旋转', stop: '停止', ready: '转动审判之轮', spinning: '审判之轮正在转动…',
      oraclePlus: '神谕+', plusHint: '神谕+: 约 {opp}% 的旋转获得加成 · 投注 ×1.1', cost: '费用',
      session: '本局', sessTime: '时长', sessSpins: '旋转次数', sessWag: '已投注', sessWon: '已赢取', sessNet: '净结果', lossLimit: '本局亏损上限', qualityL: '画质', qAuto: '自动', qHigh: '高', qLow: '低',
      realityTitle: '游戏提醒', realityMsg: function (m, n) { return '您已游戏 ' + m + ' 分钟。净结果: ' + n + '。'; }, limitTitle: '已达上限', limitMsg: '您已达到亏损上限。如需继续，请在设置中更改。', keepPlaying: '继续游戏', takeBreak: '休息一下',
      rulesPlus: '神谕+模式: 投注 ×1.1，神谕约在 {opp}% 的旋转中出现。RTP 相同 (约 96%)。',
      buyBtn: '购买奖励', buyTitle: '购买奖励', buySub: '跳过转轮，直接开启奖励。价格 = 投注 × 倍数。阿努比斯之怒仍可能夺走它。', buyPrice: '价格', buyNow: '购买', buyOn: '购买奖励', buyWheel: '返回转轮', buyNoFunds: '余额不足，无法购买此奖励', buyRtp: 'RTP 约 96%',
      buyDesc: { scarab: '3 只圣甲虫，每只最高 {scmax}×', weigh: '羽毛或心脏: 较重者获胜，最高 {wmax}×', vault: '金字塔:12 个宝箱,金钥匙可延长选择', hand: '选择颜色: 双倍 = 转轮翻倍 (最高 ×16)，奖励带 ×3 至 ×12' },
      resumed: '中断的回合: 奖金已入账',
      noFunds: '余额不足', oracleSpeaks: '神谕降临…', oracleOn: '神谕', ankhRespin: '安卡 — 免费重转!',
      dust: '尘归尘…', winLine: '赢取', respinLabel: '重转',
      kinds: { m0: '尘埃', m025: '0.3×', m05: '0.5×', m1: '1×', m2: '2×', m3: '3×', ankh: '安卡', scarab: '圣甲虫', weigh: '称重', vault: '宝藏' },
      kindsLong: { scarab: '圣甲虫坠落', weigh: '心脏称重', vault: '宝藏密室', hand: '阿努比斯之怒', crypt: '潮汐圣所' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'DIVINE JUDGEMENT'],
      scarabSub: '三只圣甲虫坠入黑暗。每只赢取其落入格子的奖金。', scarabIntro: '圣甲虫坠落',
      weighIntro: '心脏称重', weighSub: '玛特之羽还是心脏? 较重的秤盘赢得其倍数，较轻的一无所获。', feather: '羽毛', featherOf: '玛特之', heart: '心脏', heartOf: '你的灵魂', weighRoll: '倍数揭晓中…', weighWon: '获胜', weighLost: '落败', sayRight: '你的秤盘更重: ×{m}!', sayWrong: '另一边更重: 无奖金', weighing: '众神正在称量你的灵魂…',
      vaultIntro: '宝藏密室', vaultSub: '轻触即可开箱。封印会关闭密室(已得总额保留);金钥匙可增加可开的宝箱。', pick: '点击一个宝箱', vaultSeal: '封印!', vaultKey: '金钥匙  +{n} 宝箱', vaultLeft: '宝箱: {n}', vaultScepter: '权杖 ×2', vaultClear: '密室通关  +{p}×', total: '总计',
      splashEnter: '进入', splashSub: '审判正等待着你', splashDemo: '演示 · 虚拟货币 · 请理性游戏', curHint: '演示：7 种货币（USD、EUR、CAD、MXN、JPY、SC、GC）；换算仅供参考，并非真实汇率。', demoBuild: '本地演示版 — 这不是 Stake 的正式生产版本。金额均为虚拟。',
      steerHint: '点击左侧或右侧来操控圣甲虫', fateResists: '命运在抗拒',
      pushHint: '快速点击，压低你的秤盘!',
      launchBonus: '开始奖励', bonusWord: '奖励', bonusUnlocked: '奖励已解锁', launchHint: '点击按钮或按空格键', chooseTitle: '选择你的命运', chooseHint: '点击一张卡: 期望回报相同，风险不同', chooseRtp: '三个选项的 RTP 相同',
      profName: { safe: '稳健', std: '均衡', bold: '大胆' }, profDesc: { safe: '赢得稳定，上限较低', std: '中间路线', bold: '罕见但巨额的赢取' },
      lineScarab: '每只圣甲虫 ×{a} 至 ×{b}', lineWeigh: '秤盘最高 ×{b}', lineVault: '封印: 每个宝箱 {p}%', volat: '波动性',
      aimHint: '瞄准，然后点击释放圣甲虫', guessHint: '羽毛还是心脏? 点击一张卡 (按键 1 / 2)', guessRight: '你赢了!', guessWrong: '落败', holdHint: '按住蓄力，松开旋转', tapFast: '点击加速',
      handIntro: '阿努比斯之怒', handSub: '神明夺走你的奖励，将其化为至高审判。', handSpin: '倍数不断叠加…', handFinal: '审判已下',
      handColorTitle: '你的颜色', handColorHint: '点击一张卡 (按键 1 / 2 / 3)。三种颜色的机会完全相同。',
      handColorName: { turq: '绿松石', gold: '金色', ruby: '红宝石' }, handColorSub: '2 个双倍格', handColorRule: '己方颜色的双倍: 转轮翻倍并再转一次。其他颜色的双倍: 连锁结束。', handColorRtp: '三种颜色的 RTP 相同',
      handYour: '你的颜色', handRule: '双倍落在你的颜色: 转轮翻倍，再转一次 · 其他颜色: 结束', handTier: '等级', handDouble: '双倍',
      handUp: '转轮翻倍!', handUpSub: '所有数字翻倍 — 再转一次', handWrong: '颜色不对', handWrongSub: '连锁结束: 结算当前等级', handNum: '数字', handBandAt: '奖励带',
      bandName: { scarab: '圣甲虫', weigh: '称重', vault: '宝藏' },
      boostApplied: '神谕加成', boostIntro: 'BOOST', boostIntroSub: '所有数值都被放大', tapSkip: '点击跳过', continueBtn: '继续', bonusWin: '奖励赢取',
      infoTitle: '规则与赔付表', rtp: 'RTP', maxWin: '最高赢取', hitRate: '中奖回合', bonusFreq: '奖励', volat: '波动性',
      volatV: '极高', demo: '虚拟货币 — 演示版，以 € 或 $ 显示的金额并非真钱。',
      rules: [
        '一次投注，一次旋转: 由审判之轮决定。每个格子赔付其数值 × 你的投注。',
        '神谕 (约 {op}% 的旋转) 会选中一个格子并给予 ×2 至 ×100 的加成。若转轮停在该格，加成生效!',
        '安卡: 免费再转一次转轮，无需额外投注。',
        '心脏称重: 选择玛特之羽或心脏，倍数滚动并揭晓，然后由天平裁决。较重的秤盘赢得其倍数 (最高 ×{wmax})，较轻的一无所获: 二分之一的机会。',
        '任何奖励都可能被阿努比斯之怒夺走: 选择一种颜色 (绿松石、金色或红宝石)，然后转动巨轮。数字: 赢取 = 数字 × 等级。己方颜色的双倍: 转轮上所有数字翻倍 (等级 ×2，最高 ×16) 并再转一次。其他颜色的双倍: 连锁结束，你获得转轮上最小的数字 (3) × 等级。',
        '怒之带会触发一个奖励 (圣甲虫 ×3 或 ×12，称重 ×6，宝藏 ×4): 奖励赢取 × 带倍数 × 等级，最高 ×25000。奖励带不会再回到怒之轮。',
        '赢取动画按该回合总倍数 (赢取 ÷ 回合费用) 触发: ×1 起 WIN，×10 起 BIG WIN，×40 起 EXTRA WIN，×150 起 MEGA WIN，×1000 起 DIVINE JUDGEMENT。'
      ],
      secretWord: '秘密奖励', secretUnlocked: '已解锁!', secretHint: '隐藏奖励已开启… 点击按钮或按空格键',
      cryptIntro: '潮汐圣所', cryptPool: '祭品', cryptTide: '潮汐', cryptPick: '点击一块石板', cryptCount: '石板 {n} / {m}', cryptCapped: '已达最高赢取',
      cryptRule: '祭品 = 石板 × 当前潮汐 · 潮汐只影响之后的石板 · 日食使祭品相乘',
      cryptLeg: ['石板', '潮汐', '日食', '尘土'],
      cryptHint: { tab: '石板: 其数值 × 潮汐加入祭品', tide: '潮汐: 使潮汐相乘,仅作用于之后的石板', eclipse: '日食: 使已累积的祭品相乘', dust: '尘土: 什么也不会发生' },
      tableCols: ['格子', '转轮上', '赔付'], settings: '设置', language: '语言', sound: '声音', reducedFx: '减少特效', stopBonus: '触发奖励时停止自动',
      volumeL: '音量', pitchShort: '音调', gradeTitle: '色彩', gradeNatural: '自然', gradeVivid: '鲜艳', gradeGold: '金色', gradeCine: '电影', toneShort: '高音', soundOn: '声音: 开', soundOff: '声音: 关', musicShort: '氛围', resetL: '重置', mixLabel: '声音设置', pitchL: '音效音调 (半音)', musicL: '背景氛围', autoOpts: '自动旋转次数', off: '关', on: '开', close: '关闭', currencyL: '货币', resetBal: '重置余额', noWin: '无奖金', handLabel: '阿努比斯之怒'
    }
  };
  /* ---------- chiffres du jeu cités dans les textes : toujours calculés depuis math.js [24] [266] ----------
     Jetons {op} / {opp} : chance de l'Oracle en % (Standard / ORACLE+, M.MODES.*.oracle) ; {scmax} : plus grosse valeur d'un scarabée du profil std
     (le seul servi par le RGS) ; {wmax} : plus gros multiplicateur de la Pesée du profil std. Résolus une fois, sur place, dans le dictionnaire et
     dans le bloc social ; sans math.js (outil hors navigateur) ils restent tels quels. tools/i18n-check.js compare les textes aux maths. */
  function mathVals() {
    var M = root.AnubisMath;
    if (!M || !M.MODES || !M.SCARAB_PROFILES || !M.WEIGH_PROFILES) return null;
    var wm = 0;
    M.WEIGH_PROFILES.std.forEach(function (t) { wm = Math.max(wm, t[0][0], t[0][1]); });
    return { op: String(Math.round(M.MODES.std.oracle * 100)), opp: String(Math.round(M.MODES.plus.oracle * 100)), scmax: String(Math.max.apply(null, M.SCARAB_PROFILES.std)), wmax: String(wm) };
  }
  function fillMath(o) {
    var v = mathVals();
    if (!v || !o || typeof o !== 'object') return o;
    (function walk(x) {
      Object.keys(x).forEach(function (k) {
        var y = x[k];
        if (typeof y === 'string') { if (y.indexOf('{') >= 0) x[k] = y.replace(/\{(op|opp|scmax|wmax)\}/g, function (m, t) { return v[t]; }); }
        else if (y && typeof y === 'object') walk(y);
      });
    })(o);
    return o;
  }
  fillMath(D);
  /* ---------- blocs de textes séparés (règles détaillées, replay) ----------
     Chaque bloc a une entrée par langue ; une clé absente d'une langue retombe sur l'anglais (I18N.block). Ajouter une langue = ajouter une entrée ici.
     Marqueurs {x} remplacés par js/rules.js ; les chiffres viennent de math.js (aucun nombre de jeu écrit à la main dans ces textes). */
  var B = {
    // libellés d'accessibilité (lecteurs d'écran) et message « jeu ouvert dans un autre onglet » (mode RGS)
    ui: {
      en: {
        stage: 'Anubis Unchained, the wheel of judgement', history: 'Recent rounds', oracle: 'Oracle boost', close: 'Close', amountDn: 'Decrease amount', amountUp: 'Increase amount',
        tabTitle: 'GAME OPEN IN ANOTHER TAB', tabMsg: 'Anubis Unchained is already open in another tab or window. Only one tab can play at a time, so that the balance stays consistent.', tabHere: 'Play here'
      },
      fr: {
        stage: 'Anubis Unchained, la roue du jugement', history: 'Derniers tours', oracle: 'Boost de l\'Oracle', close: 'Fermer', amountDn: 'Diminuer le montant', amountUp: 'Augmenter le montant',
        tabTitle: 'JEU OUVERT DANS UN AUTRE ONGLET', tabMsg: 'Anubis Unchained est déjà ouvert dans un autre onglet ou une autre fenêtre. Un seul onglet peut jouer à la fois, pour que le solde reste cohérent.', tabHere: 'Jouer ici'
      }
    },
    replay: {
      en: {
        badge: 'REPLAY', start: 'PLAY', again: 'PLAY AGAIN', playing: 'PLAYING…', loading: 'Loading the replay…',
        errLoad: 'Could not load this replay.', errParams: 'Missing replay parameters (game, version, mode, event, rgs_url).', errFormat: 'This replay has an unknown format.',
        errNet: 'Network error: check the connection and reload.', errSum: 'The replay events do not match the amount announced by the server: the server amount is shown.', bet: 'BET', betSocial: 'PLAY AMOUNT', realCost: 'REAL COST', costMult: 'Cost', result: 'WIN', noWin: 'No win',
        modeStd: 'STANDARD', modePlus: 'ORACLE+', modeBonus: 'BONUS'
      },
      fr: {
        badge: 'REPLAY', start: 'LECTURE', again: 'REJOUER', playing: 'EN COURS…', loading: 'Chargement du replay…',
        errLoad: 'Impossible de charger ce replay.', errParams: 'Paramètres du replay manquants (game, version, mode, event, rgs_url).', errFormat: 'Ce replay a un format inconnu.',
        errNet: 'Erreur réseau : vérifiez la connexion et rechargez.', errSum: 'Les événements du replay ne correspondent pas au montant annoncé par le serveur : le montant du serveur est affiché.', bet: 'MISE', betSocial: 'MONTANT JOUÉ', realCost: 'COÛT RÉEL', costMult: 'Coût', result: 'GAIN', noWin: 'Pas de gain',
        modeStd: 'STANDARD', modePlus: 'ORACLE+', modeBonus: 'BONUS'
      }
    },
    rules: {
      en: {
        modesH: 'Modes, cost, RTP and max win', colMode: 'Mode', colCost: 'Cost', colRtp: 'RTP', colMax: 'Max win', colChance: 'Chance', colValue: 'Value', colBoost: 'Boost', colNumCase: 'Number segment', colBonusCase: 'Bonus segment',
        modeStd: 'Standard', modePlus: 'ORACLE+', tokScepter: 'SCEPTER ×2 (on the total so far)', tokKey: 'GOLDEN KEY (+{keys} chests to open)', tokSeal: 'SEAL (closes the vault)',
        modeStdD: 'One spin of the wheel of judgement. The Oracle shows up on about {p}% of the spins.',
        modePlusD: 'Costs ×{c} the selected amount. The Oracle shows up on about {pp}% of the spins, so boosts land more often. Same RTP.',
        buyScarabD: 'Opens the Scarab Drop bonus directly, without the wheel.', buyWeighD: 'Opens the Weighing of the Heart bonus directly, without the wheel.',
        buyVaultD: 'Opens the Treasure Vault bonus directly, without the wheel.', buyHandD: 'Opens the Fury of Anubis directly: the giant wheel is spun at once.',
        modesNote: 'RTP is the expected return over a very large number of plays (exact calculation, not a promise for a single session). Max win is a multiple of the selected amount, not of the mode cost, and is capped at {m}× in every mode. Cost is a multiple of the selected amount and is shown before you confirm. The Fury of Anubis can still take over a directly opened bonus ({h}% of the time), as on the wheel.',
        howH: 'How wins are formed',
        how: [
          'There are no paylines, ways or symbols to line up. Each spin stops on one of the {n} segments of the wheel. The win is the value of that segment × the selected amount.',
          'Number segments win their value (×{nums}). Dust segments win nothing. ANKH gives a free respin: the wheel turns again at no cost, up to {chain} times in a row, and the round ends on a non-ANKH segment. Wins of chained spins add up.',
          'Bonus segments (Scarabs, Weighing, Vault) trigger the matching bonus: the win is the bonus result × the selected amount. Each of the three takes {one} of the {n} segments.',
          'Oracle: before the spin it picks one segment kind ({kinds}) and gives it a boost. The value of the boost stays sealed (shown as ×?) until the wheel stops. If the wheel stops on that kind, the segment value (or the bonus result) is multiplied by the boost. The Oracle does nothing if the wheel stops elsewhere.',
          'The total win of a round is capped at {m}× the selected amount: when the cap is reached the round ends and the win is limited to it. The win animations (WIN, BIG WIN, EXTRA WIN, MEGA WIN, DIVINE JUDGEMENT) depend on the round total ÷ the cost of the mode; they never change the amount won.'
        ],
        oracleH: 'Oracle boosts', oracleNote: 'Chance of each boost when the Oracle picks a segment kind.',
        bonusH: 'Bonus rounds: triggers and values',
        scarabH: 'Scarab Drop', scarabP: 'Triggered by the Scarabs segment ({one} of {n}) or opened directly. Three scarabs fall through {rows} rows of pegs and each one wins the value of the slot where it lands (× the Oracle boost if it applies). Slot values from left to right, with the chance of each slot:',
        weighH: 'Weighing of the Heart', weighP: 'Triggered by the Weighing segment ({one} of {n}) or opened directly. Two pans each show a multiplier. You pick the feather or the heart; the heavier pan wins its multiplier, the lighter pan wins nothing: one chance in two. The pair of multipliers is drawn with these chances:',
        vaultH: 'Treasure Vault', vaultP: 'Triggered by the Vault segment ({one} of {n}) or opened directly. Open chests one after the other: {picks} to start with. Each chest holds a value added to the total, or a SCEPTER (×2 on the total so far), or a GOLDEN KEY (+{keys} more chests to open, up to {cap} in all), or the SEAL, which closes the vault and keeps the total so far. Nothing cancels or delays the seal; a key only lengthens the selection. The first two chests never hold a seal. Opening every allowed chest adds a bonus of +{fin}×. Chest contents and chances (after the first two chests):',
        handH: 'Fury of Anubis', handP: 'Any bonus can be taken over by the Fury ({h}% of the time on the wheel and for directly opened bonuses; always for the Fury mode). Choose a colour (turquoise, gold or ruby: same odds), then spin the giant wheel of {segs} segments. A number: win = number × tier. DOUBLE in your colour: every number is doubled (tier ×2, ×4, ×8 up to ×{tier}) and you spin again. DOUBLE in another colour: the chain stops and the smallest number ({min}) × tier is won. A band launches a bonus: bonus win × band multiplier × tier. Numbers on the giant wheel: ×{hnums}. DOUBLE segments: {dbl} ({dblc} per colour). Bands: {bands}. The tier stops growing at ×{tier} (DOUBLE segments then stop counting).',
        cryptH: 'Sanctuary of the Tides (hidden bonus)', cDust: 'DUST (nothing)', cTab: 'TABLET (+ value × current tide)', cTide: 'TIDE (× the tide)', cEclipse: 'ECLIPSE (× the offering)', cryptP: 'A won bonus can be replaced by the Sanctuary of the Tides ({s}% of the time, never for a directly opened bonus). Touch the {tiles} tablets of a 3×3 grid in any order; the order does not change the odds. The offering starts at 0 and the tide at ×1. Each tablet is one of: TABLET (adds its value × the current tide to the offering), TIDE (multiplies the tide, only for the tablets revealed after it), ECLIPSE (multiplies the offering already gathered) or DUST (nothing). The win is the final offering × the selected amount (at least ×1 if no tablet appears), capped at {m}×. Tablet kinds:',
        retrigH: 'Bonuses, respins and re-triggers',
        retrig: [
          'There are no free spins to re-trigger: each bonus is played once per trigger and its result is added to the round. No bonus can trigger another bonus: a band of the Fury launches a bonus that never leads back to the Fury.',
          'The only repeat feature is the ANKH respin (see above). Bonus segments, the Oracle and the Fury have the same odds in every mode.',
          'If the connection drops during a round, reload the game: the round already decided is finished and its win is settled.'
        ],
        btnH: 'Buttons and controls',
        btn: [
          ['− / +', 'Lower or raise the selected amount (keys ↓ / ↑). Locked while a round is running.'],
          ['{spin}', 'Starts a round with the selected amount (Space or Enter also works). During automatic play it becomes {stop}.'],
          ['{auto}', 'Choose the number of automatic rounds ({autos}); the game then plays them one after the other until the number is reached, you press {stop}, a limit is reached or the balance is too low. The option “Stop autoplay on bonus” is in Info. “{stopwin}” in the AUTO window ({stops} the selected amount, or off) ends the autoplay as soon as a round wins at least that much.'],
          ['{turbo}', 'Faster rounds: press once for TURBO, twice for ULTRA (almost instant result), a third time to turn it off. A bonus always plays at a calmer pace.'],
          ['{buy}', 'Opens the menu of directly opened bonuses. Each card shows its cost; choosing a card starts that bonus.'],
          ['{plus}', 'Switches ORACLE+ on or off for the next rounds: cost ×{c}, the Oracle appears far more often. The cost is shown under the amount.'],
          ['Sound (speaker)', 'Opens the sound panel: volume, treble, pitch, music ambience, colour grading and a switch that mutes every sound.'],
          ['i (Info)', 'Opens these rules and the settings: loss limit, graphics quality, reduced effects, autoplay options, direct bonus access on/off.'],
          ['Language', 'Opens the menu of the {langs} available languages (native names); picking one changes the language of the game.'],
          ['€ / $', 'Switches the amounts between euro and dollar display (same numeric value).'],
          ['×', 'Closes the open window (Escape also works).'],
          ['Tap / Space', 'In a bonus: starts the bonus, drops the scarab or block, picks a chest, a card or a colour. In a win animation: tap to skip it.']
        ],
        discH: 'Important', disc: 'Malfunction voids all wins and plays. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many plays. The game display is not representative of any physical device and is for illustrative purposes only. Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser. TM and © 2026 Engine.'
      },
      fr: {
        modesH: 'Modes, coût, RTP et gain max', colMode: 'Mode', colCost: 'Coût', colRtp: 'RTP', colMax: 'Gain max', colChance: 'Chance', colValue: 'Valeur', colBoost: 'Boost', colNumCase: 'Case nombre', colBonusCase: 'Case bonus',
        modeStd: 'Standard', modePlus: 'ORACLE+', tokScepter: 'SCEPTRE ×2 (sur le total déjà gagné)', tokKey: 'CLÉ D\'OR (+{keys} coffres à ouvrir)', tokSeal: 'SCEAU (referme la chambre)',
        modeStdD: 'Un tour de la roue du jugement. L\'Oracle apparaît sur environ {p} % des tours.',
        modePlusD: 'Coûte ×{c} le montant sélectionné. L\'Oracle apparaît sur environ {pp} % des tours : les boosts tombent plus souvent. Même RTP.',
        buyScarabD: 'Ouvre directement le bonus Chute des Scarabées, sans passer par la roue.', buyWeighD: 'Ouvre directement le bonus Pesée du Cœur, sans passer par la roue.',
        buyVaultD: 'Ouvre directement le bonus Chambre du Trésor, sans passer par la roue.', buyHandD: 'Ouvre directement la Fureur d\'Anubis : la roue géante est lancée tout de suite.',
        modesNote: 'Le RTP est le retour moyen attendu sur un très grand nombre de parties (calcul exact, pas une promesse pour une séance). Le gain max est un multiple du montant sélectionné, et non du coût du mode ; il est plafonné à {m}× dans tous les modes. Le coût est un multiple du montant sélectionné et s\'affiche avant de confirmer. La Fureur d\'Anubis peut saisir un bonus ouvert directement ({h} % des fois), comme sur la roue.',
        howH: 'Comment se forment les gains',
        how: [
          'Il n\'y a ni ligne de gain, ni combinaison, ni symboles à aligner. Chaque tour s\'arrête sur l\'une des {n} cases de la roue. Le gain est la valeur de cette case × le montant sélectionné.',
          'Les cases à nombre gagnent leur valeur (×{nums}). Les cases Poussière ne gagnent rien. ANKH offre une relance gratuite : la roue tourne à nouveau sans frais, jusqu\'à {chain} fois d\'affilée, et le tour se termine sur une case autre qu\'ANKH. Les gains des relances s\'additionnent.',
          'Les cases bonus (Scarabées, Pesée, Trésor) déclenchent le bonus correspondant : le gain est le résultat du bonus × le montant sélectionné. Chacune des trois occupe {one} case sur {n}.',
          'Oracle : avant le tour, il désigne un type de case ({kinds}) et lui offre un boost. La valeur du boost reste scellée (affichée ×?) jusqu\'à l\'arrêt de la roue. Si la roue s\'arrête sur ce type de case, la valeur de la case (ou le résultat du bonus) est multipliée par le boost. L\'Oracle ne fait rien si la roue s\'arrête ailleurs.',
          'Le gain total d\'un tour est plafonné à {m}× le montant sélectionné : une fois le plafond atteint, le tour s\'arrête et le gain est limité à ce plafond. Les animations de gain (WIN, BIG WIN, EXTRA WIN, MEGA WIN, JUGEMENT DIVIN) dépendent du total du tour ÷ le coût du mode ; elles ne changent jamais le montant gagné.'
        ],
        oracleH: 'Boosts de l\'Oracle', oracleNote: 'Chance de chaque boost quand l\'Oracle désigne un type de case.',
        bonusH: 'Bonus : déclenchement et valeurs',
        scarabH: 'Chute des Scarabées', scarabP: 'Déclenchée par la case Scarabées ({one} case sur {n}) ou ouverte directement. Trois scarabées tombent à travers {rows} rangées de picots ; chacun gagne la valeur de la case où il atterrit (× le boost de l\'Oracle s\'il s\'applique). Valeurs des cases de gauche à droite, avec la chance de chacune :',
        weighH: 'Pesée du Cœur', weighP: 'Déclenchée par la case Pesée ({one} case sur {n}) ou ouverte directement. Deux plateaux affichent chacun un multiplicateur. Vous choisissez la plume ou le cœur ; le plateau le plus lourd gagne son multiplicateur, le plus léger ne gagne rien : une chance sur deux. La paire de multiplicateurs est tirée avec ces chances :',
        vaultH: 'Chambre du Trésor', vaultP: 'Déclenchée par la case Trésor ({one} case sur {n}) ou ouverte directement. Ouvrez des coffres l\'un après l\'autre : {picks} au départ. Chaque coffre contient une valeur qui s\'ajoute au total, ou un SCEPTRE (×2 sur le total déjà gagné), ou une CLÉ D\'OR (+{keys} coffres à ouvrir, {cap} au plus en tout), ou le SCEAU, qui referme la chambre en gardant le total déjà gagné. Rien n\'annule ni ne retarde le sceau ; la clé ne fait qu\'allonger la sélection. Les deux premiers coffres ne contiennent jamais de sceau. Ouvrir tous les coffres permis ajoute une prime de +{fin}×. Contenu des coffres et chances (après les deux premiers coffres) :',
        handH: 'Fureur d\'Anubis', handP: 'Tout bonus peut être saisi par la Fureur ({h} % des fois sur la roue et pour les bonus ouverts directement ; toujours pour le mode Fureur). Choisissez une couleur (turquoise, or ou rubis : mêmes chances) puis lancez la roue géante de {segs} cases. Un nombre : gain = nombre × palier. DOUBLE de votre couleur : tous les nombres sont doublés (palier ×2, ×4, ×8 jusqu\'à ×{tier}) et vous relancez. DOUBLE d\'une autre couleur : la chaîne s\'arrête et on gagne le plus petit nombre ({min}) × palier. Une bande lance un bonus : gain du bonus × multiplicateur de la bande × palier. Nombres de la roue géante : ×{hnums}. Cases DOUBLE : {dbl} ({dblc} par couleur). Bandes : {bands}. Le palier ne dépasse pas ×{tier} (les cases DOUBLE ne comptent plus ensuite).',
        cryptH: 'Sanctuaire des Marées (bonus caché)', cDust: 'POUSSIÈRE (rien)', cTab: 'TABLETTE (+ valeur × marée courante)', cTide: 'MARÉE (× la marée)', cEclipse: 'ÉCLIPSE (× l\'offrande)', cryptP: 'Un bonus gagné peut être remplacé par le Sanctuaire des Marées ({s} % des fois, jamais pour un bonus ouvert directement). Touchez les {tiles} tablettes d\'une grille 3×3 dans l\'ordre de votre choix ; l\'ordre ne change pas les chances. L\'offrande démarre à 0 et la marée à ×1. Chaque tablette est : TABLETTE (ajoute sa valeur × la marée courante à l\'offrande), MARÉE (multiplie la marée, seulement pour les tablettes révélées après elle), ÉCLIPSE (multiplie l\'offrande déjà accumulée) ou POUSSIÈRE (rien). Le gain est l\'offrande finale × le montant sélectionné (au moins ×1 si aucune tablette n\'apparaît), plafonné à {m}×. Types de tablettes :',
        retrigH: 'Bonus, relances et re-déclenchements',
        retrig: [
          'Il n\'y a pas de tours gratuits à re-déclencher : chaque bonus se joue une fois par déclenchement et son résultat s\'ajoute au tour. Aucun bonus ne peut en déclencher un autre : une bande de la Fureur lance un bonus qui ne ramène jamais à la Fureur.',
          'La seule fonction qui se répète est la relance ANKH (voir plus haut). Les cases bonus, l\'Oracle et la Fureur ont les mêmes chances dans tous les modes.',
          'Si la connexion est coupée pendant un tour, rechargez le jeu : le tour déjà décidé est terminé et son gain réglé.'
        ],
        btnH: 'Boutons et commandes',
        btn: [
          ['− / +', 'Diminue ou augmente le montant sélectionné (touches ↓ / ↑). Verrouillés pendant un tour.'],
          ['{spin}', 'Lance un tour avec le montant sélectionné (Espace ou Entrée aussi). Pendant le jeu automatique il devient {stop}.'],
          ['{auto}', 'Choisissez le nombre de tours automatiques ({autos}) ; le jeu les enchaîne jusqu\'à ce que le nombre soit atteint, que vous appuyiez sur {stop}, qu\'une limite soit atteinte ou que le solde soit insuffisant. L\'option « Stopper l\'auto sur bonus » est dans Infos. « {stopwin} » dans la fenêtre AUTO ({stops} le montant sélectionné, ou désactivé) arrête le jeu automatique dès qu\'un tour gagne au moins ce montant.'],
          ['{turbo}', 'Tours plus rapides : un appui pour TURBO, deux pour ULTRA (résultat quasi instantané), trois pour l\'arrêter. Un bonus se joue toujours à un rythme plus calme.'],
          ['{buy}', 'Ouvre le menu des bonus ouverts directement. Chaque carte affiche son coût ; choisir une carte lance ce bonus.'],
          ['{plus}', 'Active ou coupe ORACLE+ pour les tours suivants : coût ×{c}, l\'Oracle apparaît bien plus souvent. Le coût s\'affiche sous le montant.'],
          ['Son (haut-parleur)', 'Ouvre le panneau du son : volume, aigus, hauteur, ambiance musicale, couleurs et un interrupteur qui coupe tous les sons.'],
          ['i (Infos)', 'Ouvre ces règles et les réglages : limite de perte, qualité graphique, effets réduits, options de l\'auto, accès direct aux bonus oui/non.'],
          ['Langue', 'Ouvre le menu des {langs} langues disponibles (noms natifs) ; en choisir une change la langue du jeu.'],
          ['€ / $', 'Passe l\'affichage des montants de l\'euro au dollar (même valeur numérique).'],
          ['×', 'Ferme la fenêtre ouverte (Échap aussi).'],
          ['Toucher / Espace', 'Dans un bonus : lance le bonus, lâche le scarabée ou le bloc, choisit un coffre, une carte ou une couleur. Pendant une animation de gain : passe l\'animation.']
        ],
        discH: 'Important', disc: 'Un dysfonctionnement annule tous les gains et toutes les parties. Une connexion internet stable est nécessaire. En cas de déconnexion, rechargez le jeu pour terminer les tours inachevés. Le retour attendu est calculé sur un grand nombre de parties. L\'affichage du jeu ne représente aucun appareil physique et sert uniquement d\'illustration. Les gains sont réglés selon le montant reçu du serveur de jeu distant (Remote Game Server) et non d\'après les événements du navigateur. TM et © 2026 Engine.'
      }
    }
  };
  var lang = 'fr';
  // textes des 14 autres langues, définis dans les blocs en fin de fichier : blocs « rules » / « replay », textes du RGS, noms localisés des paliers de gain
  var X = root.I18N_X = { rules: {}, replay: {}, ui: {}, rgs: {}, tiers: {} };

  /* ---------- Langues Stake : les 16 codes acceptés par le RGS (paramètre ?lang=). Défaut : anglais. ---------- */
  var LANGS = [
    ['en', 'English', 'en-US'], ['fr', 'Français', 'fr-FR'], ['de', 'Deutsch', 'de-DE'], ['es', 'Español', 'es-ES'], ['pt', 'Português', 'pt-BR'],
    ['pl', 'Polski', 'pl-PL'], ['tr', 'Türkçe', 'tr-TR'], ['id', 'Bahasa Indonesia', 'id-ID'], ['vi', 'Tiếng Việt', 'vi-VN'], ['fi', 'Suomi', 'fi-FI'],
    ['ru', 'Русский', 'ru-RU'], ['ar', 'العربية', 'ar-EG-u-nu-latn'], ['hi', 'हिन्दी', 'hi-IN'], ['ja', '日本語', 'ja-JP'], ['ko', '한국어', 'ko-KR'], ['zh', '中文', 'zh-CN']
  ];
  var DEFAULT_LANG = 'en';
  var AFTER = { fr: 1, de: 1, es: 1, fi: 1, pl: 1, ru: 1, vi: 1 };   // symbole de la devise placé après le montant
  // polices de repli (Cinzel et Philosopher sont des sous-ensembles latins) : polices SYSTÈME, aucun fichier ajouté
  var FALLBACK = {
    ar: '"Noto Naskh Arabic","Geeza Pro","Segoe UI",Tahoma,"Arial Unicode MS",sans-serif',
    hi: '"Noto Sans Devanagari","Kohinoor Devanagari","Nirmala UI","Mangal","Arial Unicode MS",sans-serif',
    ja: '"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo","Noto Sans CJK JP","Noto Sans JP",sans-serif',
    ko: '"Apple SD Gothic Neo","Malgun Gothic","Noto Sans CJK KR","Noto Sans KR",sans-serif',
    zh: '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Noto Sans SC","WenQuanYi Micro Hei",sans-serif',
    // latin étendu, cyrillique, vietnamien : caractères absents des sous-ensembles latins de Cinzel / Philosopher
    vi: '"Noto Serif","Times New Roman","DejaVu Serif",serif', pl: '"Noto Serif","Times New Roman","DejaVu Serif",serif', tr: '"Noto Serif","Times New Roman","DejaVu Serif",serif',
    ru: '"Noto Serif","Times New Roman","DejaVu Serif",serif'
  };
  // code reçu (« FR », « pt-BR », « zh_CN »…) -> code Stake géré, ou null s'il est inconnu
  function norm(c) {
    if (!c || typeof c !== 'string') return null;
    c = c.toLowerCase().replace('_', '-').split('-')[0];
    return D[c] ? c : null;
  }
  // paramètres de lancement Stake : lus ici, SANS être utilisés encore (voir docs/STAKE_ENGINE_CONFORMITE.md, « État après corrections »)
  var launch = { lang: null, sessionID: null, rgs_url: null, device: null, social: false, localTiers: false };
  try {
    var q = new URLSearchParams(root.location && root.location.search || '');
    launch.lang = norm(q.get('lang'));
    launch.sessionID = q.get('sessionID'); launch.rgs_url = q.get('rgs_url'); launch.device = q.get('device');
    launch.social = q.get('social') === 'true';
    launch.localTiers = q.get('tiers') === 'local';
  } catch (e) {}
  root.LAUNCH = launch;

  // Textes du client RGS (erreurs du serveur, confirmations d'achat et d'autoplay) : bloc séparé du dictionnaire D ;
  // FR et EN traduits, les autres langues retombent sur l'anglais (I18N.rgs()) — à traduire avec le reste des 16 langues.
  var RGS_TXT = {
    fr: {
      connecting: 'Connexion au serveur de jeu…', retry: 'Réessayer', confirm: 'Confirmer', cancel: 'Annuler',
      errLaunch: 'Lancez le jeu depuis Stake. Une session de jeu est nécessaire.',
      errUrl: 'Connexion impossible : l\'adresse du serveur de jeu (rgs_url) ou la session est absente ou invalide. Relancez le jeu depuis le site.',
      errAuth: 'Connexion au serveur de jeu impossible. Vérifiez votre connexion puis relancez le jeu.',
      errVal: 'Requête refusée : session expirée ou mise invalide. Relancez le jeu depuis le site.',
      errIpb: 'Solde insuffisant pour cette mise.',
      errGle: 'Limite de jeu atteinte : cette mise est refusée.',
      errAct: 'Le serveur est occupé. Réessayez dans un instant.',
      errGen: 'Erreur du serveur de jeu. Réessayez dans un instant.',
      errNet: 'Réseau indisponible ou réponse invalide. Votre mise n\'a peut-être pas été prise en compte : vérifiez votre solde.',
      errBook: 'Résultat du tour illisible. Contactez l\'assistance.',
      errIs: 'Session invalide ou expirée. Relancez le jeu depuis le site.',
      errAte: 'Authentification expirée. Relancez le jeu depuis le site pour vous reconnecter.',
      errLoc: 'Ce jeu n\'est pas disponible depuis votre région.',
      errMaint: 'Maintenance en cours. Réessayez dans quelques minutes.',
      errSum: 'Le résultat affiché ne correspond pas au montant du serveur de jeu : le montant du serveur est appliqué.',
      resuming: 'Reprise du tour en cours…',
      buyConfirm: 'Acheter {name} pour {price} ?', buyConfirmTitle: 'CONFIRMER L\'ACHAT', plusConfirmTitle: 'CONFIRMER LE MODE', plusConfirm: 'Activer {name} ? Chaque tour sera joué à {price}.',
      autoTitle: 'JEU AUTOMATIQUE', autoSub: 'Choisissez le nombre de tours et les conditions d\'arrêt, puis confirmez.',
      autoRounds: 'Nombre de tours', autoStopWin: 'Arrêt sur un gain d\'au moins', autoStart: 'Démarrer', autoCost: 'Coût par tour'
    },
    en: {
      connecting: 'Connecting to the game server…', retry: 'Retry', confirm: 'Confirm', cancel: 'Cancel',
      errLaunch: 'Launch the game from Stake. A game session is required.',
      errUrl: 'Cannot connect: the game server address (rgs_url) or the session is missing or invalid. Please relaunch the game from the site.',
      errAuth: 'Cannot reach the game server. Check your connection and relaunch the game.',
      errVal: 'Request refused: the session has expired or the bet is invalid. Please relaunch the game from the site.',
      errIpb: 'Insufficient balance for this bet.',
      errGle: 'Gambling limit reached: this bet is refused.',
      errAct: 'The server is busy. Please try again in a moment.',
      errGen: 'Game server error. Please try again in a moment.',
      errNet: 'Network unavailable or invalid response. Your bet may not have been taken into account: check your balance.',
      errBook: 'The round result could not be read. Please contact support.',
      errIs: 'Invalid or expired session. Please relaunch the game from the site.',
      errAte: 'Authentication expired. Please relaunch the game from the site to sign in again.',
      errLoc: 'This game is not available from your location.',
      errMaint: 'Maintenance in progress. Please try again in a few minutes.',
      errSum: 'The result shown does not match the amount from the game server: the server amount is applied.',
      resuming: 'Resuming the round in progress…',
      buyConfirm: 'Buy {name} for {price}?', buyConfirmTitle: 'CONFIRM PURCHASE', plusConfirmTitle: 'CONFIRM MODE', plusConfirm: 'Turn on {name}? Each round will be played at {price}.',
      autoTitle: 'AUTOPLAY', autoSub: 'Choose the number of rounds and the stop conditions, then confirm.',
      autoRounds: 'Number of rounds', autoStopWin: 'Stop on a win of at least', autoStart: 'Start', autoCost: 'Cost per round'
    }
  };

  // paliers localisés (OPTIONNEL, désactivé par défaut : les noms restent en anglais) : X.tiers[langue] = 4 noms (WIN, BIG WIN, EXTRA WIN, MEGA WIN), un 5e facultatif
  // pour les langues où le palier ultime est resté en anglais. Un nom absent ou vide annule tout (repli sûr sur l'anglais). Les règles citent alors les mêmes noms.
  var localTiers = !!launch.localTiers, tierCache = {};
  function tiersOk(loc) { return Array.isArray(loc) && loc.length >= 4 && loc.every(function (n) { return typeof n === 'string' && n.trim(); }); }
  function swapTiers(str, l) {
    var loc = X.tiers[l], en = D.en.tiers;
    if (!tiersOk(loc)) return str;
    var o = str, ids = loc.length > 4 ? [4, 2, 3, 1, 0] : [2, 3, 1, 0];   // du plus long au plus court : « EXTRA WIN », « MEGA WIN », « BIG WIN », « WIN »
    ids.forEach(function (i) { o = o.split(en[i]).join('\u0001' + i + '\u0002'); });
    return o.replace(/\u0001(\d)\u0002/g, function (m, i) { return loc[i]; });
  }
  function withTiers(l) {
    var c = tierCache[l], loc = X.tiers[l], d = D[l];
    if (c && c.base === d && c.loc === loc) return c.val;
    var tiers = d.tiers.slice();
    if (tiersOk(loc)) for (var i = 0; i < Math.min(loc.length, 5); i++) tiers[i] = loc[i];
    var val = Object.assign({}, d, { tiers: tiers, rules: d.rules.map(function (r) { return swapTiers(r, l); }) });
    tierCache[l] = { base: d, loc: loc, val: val };
    return val;
  }

  var lang = DEFAULT_LANG;
  function info(l) { for (var i = 0; i < LANGS.length; i++) if (LANGS[i][0] === l) return LANGS[i]; return LANGS[0]; }
  function setLang(l) {
    lang = norm(l) || DEFAULT_LANG;
    var de = document.documentElement;
    de.lang = lang; de.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (de.setAttribute) de.setAttribute('data-lang', lang);
    if (root.G && root.G.TITLE) {   // canvas : repli de polices par langue
      var fb = FALLBACK[lang] ? ', ' + FALLBACK[lang] : '';
      root.G.TITLE = root.G.TITLE0 + fb; root.G.NUM = root.G.NUM0 + fb; if (root.G.TEXT0) root.G.TEXT = root.G.TEXT0 + fb;
    }
  }
  root.I18N = {
    fillMath: fillMath,
    setLang: setLang,
    lang: function () { return lang; },
    t: function () { return localTiers && X.tiers[lang] ? withTiers(lang) : D[lang]; },
    rgs: function () { var cur = RGS_TXT[lang] || X.rgs[lang]; if (!cur || lang === 'en') return RGS_TXT.en; var o = {}, k; for (k in RGS_TXT.en) o[k] = RGS_TXT.en[k]; for (k in cur) o[k] = cur[k]; return o; },
    // bloc de textes séparé (« rules », « replay ») : langue courante, clé par clé repliée sur l'anglais
    block: function (name) {
      var b = B[name] || {}, en = b.en || {}, cur = b[lang] || (X[name] || {})[lang] || {}, out = {}, k;
      for (k in en) out[k] = en[k];
      for (k in cur) out[k] = cur[k];
      if (name === 'rules' && localTiers && Array.isArray(out.how)) out.how = out.how.map(function (t) { return swapTiers(t, lang); });   // paliers localisés : mêmes noms que l'écran
      return out;
    },
    // noms localisés des paliers de gain (WIN, BIG WIN, EXTRA WIN, MEGA WIN) : OPTIONNEL, désactivé par défaut (anglais) ; ?tiers=local ou setLocalTiers(true)
    setLocalTiers: function (v) { localTiers = !!v; },
    localTiers: function () { return localTiers; },
    langs: LANGS, fallback: FALLBACK, norm: norm, fromUrl: launch.lang,
    locale: function () { return info(lang)[2]; },          // format des nombres
    currencyAfter: function () { return !!AFTER[lang]; },   // « 1 234,50 € » (true) ou « $1,234.50 » (false)
    decimalComma: function () { return (1.5).toLocaleString(info(lang)[2]).indexOf(',') >= 0; },
    defaultCurrency: function () { return { fr: 1, de: 1, es: 1, fi: 1 }[lang] ? 'EUR' : 'USD'; },   // tant que le joueur n'a rien choisi
    joined: function () { return lang === 'ar' || lang === 'hi'; },
    isRtl: function () { return lang === 'ar'; },
    apply: function () {
      var d = D[lang];
      document.querySelectorAll('[data-i]').forEach(function (el) { var k = el.getAttribute('data-i'); if (d[k] != null) el.textContent = d[k]; });
    }
  };
  if (launch.lang) setLang(launch.lang); else setLang(DEFAULT_LANG);
})(window);

/* ---------- Mode social (?social=true ou config.jurisdiction.socialCasino) : textes de remplacement ----------
   Bloc séparé, géré par js/social.js : seules les clés citées ici changent en mode social, le reste vient du dictionnaire normal.
   Vocabulaire interdit (mots entiers, insensible à la casse) : bet, buy, pay, paytable, cost of, stake, wager, money, cash, credit, currency…
   → play, get, win, Win table, can be played for, play amount, coins, collect, balance, token… (voir tools/social-check.js).
   Un tableau (rules, tableCols) se remplace par index : texte, ou fonction qui transforme le texte d'origine.
   Une langue absente de ce bloc reçoit le jeu de textes anglais en mode social : ajouter ici sa version dans cette langue. */
(function (root) {
  root.I18N_SOCIAL = {
    en: {
      bet: 'PLAY', plusHint: 'ORACLE+: boost on ≈ {opp}% of spins · play amount ×1.1', cost: 'PLAY FOR', sessWag: 'Played',
      rulesPlus: 'ORACLE+ mode: play amount ×1.1, the Oracle shows up on ≈ {opp}% of spins. Same RTP (≈ 96%).',
      buyBtn: 'GET A BONUS', buyTitle: 'GET A BONUS', buySub: 'Open a bonus directly, skipping the wheel. A bonus can be played for the play amount × its multiplier. Anubis\' Fury can still seize it.',
      buyPrice: 'PLAY FOR', buyNow: 'GET', buyOn: 'Bonus access', buyNoFunds: 'Not enough balance for this bonus',
      resumed: 'Interrupted round: winnings added', scarabSub: 'Three scarabs plunge through the dark. Each wins the slot it lands in.',
      splashDemo: 'Demo · play coins · Play responsibly', curHint: 'Demo: 2 tokens (SC, GC) — indicative amounts only.', demoBuild: 'Local demo — not the production build. Amounts are fictitious.', infoTitle: 'Rules & Win table', demo: 'Play coins — demo, the amounts shown are not real.',
      tableCols: { 2: 'Wins' }, currencyL: 'Token', handWrongSub: 'The chain stops: current tier collected',
      rules: {
        0: 'One play, one spin: the wheel of judgement decides. Each segment wins its value × your play amount.',
        2: 'ANKH: free respin of the wheel, at no extra play amount.',
        4: function (s) { return s.replace('you cash the smallest', 'you collect the smallest'); }
      },
      // blocs séparés (js/rules.js, js/replay.js, client RGS) : clés « $rules », « $replay », « $rgs »
      $rules: {
        modesH: 'Modes, play value, RTP and max win', colCost: 'Played for',
        modesNote: function (s) { return s.replace('Cost is a multiple', 'The play value is a multiple'); },
        how: {
          1: function (s) { return s.replace('at no cost', 'at no extra play amount'); },
          4: function (s) { return s.replace('the cost of the mode', 'what the mode can be played for'); }
        },
        btn: {
          4: { 1: 'Opens the menu of directly opened bonuses. Each card shows what it can be played for; choosing a card starts that bonus.' },
          5: { 1: function (s) { return s.replace('cost ×', 'play value ×').replace('The cost is shown under', 'The play value is shown under'); } },
          9: { 0: 'SC / GC', 1: 'Switches the display between the two tokens (same numeric value).' }
        }
      },
      $replay: { bet: 'PLAY AMOUNT', realCost: 'REAL PLAY VALUE', costMult: 'Play value' },
      $rgs: {
        errLaunch: 'Launch the game from the site. A game session is required.',
        errVal: 'Request refused: the session has expired or the play is invalid. Please relaunch the game from the site.',
        errIpb: 'Insufficient balance for this play.', errGle: 'Limit reached: this play is refused.',
        errNet: 'Network unavailable or invalid response. Your play may not have been taken into account: check your balance.',
        buyConfirm: 'Get {name}? It can be played for {price}.', buyConfirmTitle: 'CONFIRM BONUS', autoCost: 'Play value per round'
      }
    },
    fr: {
      bet: 'JEU', plusHint: 'ORACLE+ : boost sur ≈ {opp} % des tours · montant de jeu ×1,1', cost: 'MONTANT', sessWag: 'Joué',
      rulesPlus: 'Mode ORACLE+ : montant de jeu ×1,1, l\'Oracle apparaît sur ≈ {opp} % des tours. RTP équivalent (≈ 96 %).',
      buyBtn: 'OBTENIR UN BONUS', buyTitle: 'OBTENIR UN BONUS', buySub: 'Ouvrez directement un bonus, sans passer par la roue. Jouable pour : montant de jeu × multiplicateur. La Fureur d\'Anubis peut toujours le saisir.',
      buyPrice: 'JOUABLE POUR', buyNow: 'OBTENIR', buyOn: 'Accès aux bonus', buyNoFunds: 'Solde insuffisant pour ce bonus',
      resumed: 'Tour interrompu : gain ajouté',
      splashDemo: 'Démo · pièces fictives · Jouez avec modération', curHint: 'Démo : 2 jetons (SC, GC) — montants indicatifs seulement.', demoBuild: 'Démo locale — pas la version de production. Les montants sont fictifs.', demo: 'Pièces fictives — démo : les montants affichés ne sont pas réels.',
      infoTitle: 'Règles & table des gains', currencyL: 'Jeton', handWrongSub: 'La chaîne s\'arrête : palier ramassé',
      rules: {
        0: 'Un jeu, un tour : la roue du jugement décide. Chaque case donne sa valeur × votre montant de jeu.',
        2: 'ANKH : relance gratuite de la roue, sans montant de jeu supplémentaire.',
        4: function (s) { return s.replace('vous encaissez', 'vous ramassez'); },
        6: function (s) { return s.replace('coût du tour', 'valeur de jeu du tour'); }
      },
      $rules: {
        modesH: 'Modes, valeur de jeu, RTP et gain max', colCost: 'Jouable pour',
        modePlusD: 'Jouable pour ×{c} le montant sélectionné. L\'Oracle apparaît sur environ {pp} % des tours : les boosts tombent plus souvent. Même RTP.',
        modesNote: function (s) { return s.replace('non du coût du mode', 'non de la valeur de jeu du mode').replace('Le coût est un multiple', 'La valeur de jeu est un multiple'); },
        how: { 4: function (s) { return s.replace('le coût du mode', 'la valeur de jeu du mode'); } },
        btn: {
          4: { 1: function (s) { return s.replace('son coût', 'sa valeur de jeu'); } },
          5: { 1: function (s) { return s.replace('coût ×', 'valeur de jeu ×').replace('Le coût s\'affiche', 'La valeur de jeu s\'affiche'); } },
          7: { 1: function (s) { return s.replace('devise,', 'unité d\'affichage,'); } },
          9: { 0: 'SC / GC', 1: 'Passe l\'affichage entre les deux jetons (même valeur numérique).' }
        }
      },
      $replay: { bet: 'MONTANT JOUÉ', realCost: 'VALEUR DE JEU RÉELLE', costMult: 'Valeur de jeu' },
      $rgs: {
        errLaunch: 'Lancez le jeu depuis le site. Une session de jeu est nécessaire.',
        errVal: 'Requête refusée : session expirée ou jeu invalide. Relancez le jeu depuis le site.', errIpb: 'Solde insuffisant pour cette partie.',
        errGle: 'Limite de jeu atteinte : cette partie est refusée.',
        errNet: 'Réseau indisponible ou réponse invalide. Votre partie n\'a peut-être pas été prise en compte : vérifiez votre solde.',
        buyConfirm: 'Obtenir {name} ? Jouable pour {price}.', buyConfirmTitle: 'CONFIRMER LE BONUS', autoCost: 'Valeur de jeu par tour'
      }
    }
  };
})(window);

/* ===== TRADUCTIONS : début (généré par blocs, une langue par bloc) ===== */
/* ---------- Langues sans relecteur natif : blocs « rules » (règles détaillées), « replay », textes du RGS, noms localisés des paliers et textes du mode social ----------
   Un bloc par langue, rangé dans window.I18N_X (lu par I18N.block / I18N.rgs / I18N.t) et window.I18N_SOCIAL. Traductions faites SANS relecteur natif :
   niveau de confiance et termes à faire relire dans docs/TRADUCTIONS.md. Marqueurs {x} identiques à l'anglais (contrôlé par tools/i18n-check.js).
   Mode social : tools/social-check.js cherche, dans chaque langue, les équivalents des mots interdits (liste : tools/social-words.js). */

/* --- fr --- */
(function (X) {
  X.tiers.fr = ['GAIN', 'GROS GAIN', 'GAIN EXTRA', 'MÉGA GAIN'];
})(window.I18N_X);

/* --- ar --- */
(function (X, S) {
  X.tiers.ar = ['ربح', 'ربح كبير', 'ربح إضافي', 'ربح ضخم', 'الحكم الإلهي'];
  X.replay.ar = {
    badge: 'إعادة', start: 'تشغيل', again: 'تشغيل مجدداً', playing: 'جارٍ التشغيل…', loading: 'جارٍ تحميل الإعادة…',
    errSum: 'أحداث الإعادة لا تطابق المبلغ المعلن من الخادم: يُعرض مبلغ الخادم.',
    errLoad: 'تعذّر تحميل هذه الإعادة.', errParams: 'معاملات الإعادة ناقصة (game, version, mode, event, rgs_url).', errFormat: 'هذه الإعادة بصيغة غير معروفة.',
    errNet: 'خطأ في الشبكة: تحقق من الاتصال وأعد التحميل.', bet: 'الرهان', betSocial: 'مبلغ اللعب', realCost: 'التكلفة الفعلية', costMult: 'التكلفة', result: 'الربح', noWin: 'لا ربح',
    modeStd: 'قياسي', modePlus: 'العرّاف+', modeBonus: 'بونص'
  };
  X.rgs.ar = {
    connecting: 'جارٍ الاتصال بخادم اللعبة…', retry: 'إعادة المحاولة', confirm: 'تأكيد', cancel: 'إلغاء',
    errLaunch: 'شغّل اللعبة من Stake. مطلوب وجود جلسة لعب.',
    errUrl: 'تعذّر الاتصال: عنوان خادم اللعبة (rgs_url) أو الجلسة مفقود أو غير صالح. يرجى إعادة تشغيل اللعبة من الموقع.',
    errAuth: 'تعذّر الوصول إلى خادم اللعبة. تحقق من اتصالك ثم أعد تشغيل اللعبة.',
    errVal: 'تم رفض الطلب: انتهت الجلسة أو أن الرهان غير صالح. يرجى إعادة تشغيل اللعبة من الموقع.',
    errIpb: 'الرصيد غير كافٍ لهذا الرهان.',
    errGle: 'تم بلوغ حد اللعب: رُفض هذا الرهان.',
    errAct: 'الخادم مشغول. يرجى المحاولة بعد قليل.',
    errGen: 'خطأ في خادم اللعبة. يرجى المحاولة بعد قليل.',
    errNet: 'الشبكة غير متاحة أو الاستجابة غير صالحة. ربما لم يُحتسب رهانك: تحقق من رصيدك.',
    errBook: 'تعذّرت قراءة نتيجة الجولة. يرجى التواصل مع الدعم.',
    errIs: 'الجلسة غير صالحة أو منتهية. يرجى إعادة تشغيل اللعبة من الموقع.',
    errAte: 'انتهت صلاحية المصادقة. يرجى إعادة تشغيل اللعبة من الموقع لتسجيل الدخول من جديد.',
    errLoc: 'هذه اللعبة غير متاحة في موقعك.',
    errMaint: 'الصيانة جارية. يرجى المحاولة بعد بضع دقائق.',
    errSum: 'النتيجة المعروضة لا تطابق المبلغ الصادر عن خادم اللعبة: يُطبَّق مبلغ الخادم.',
    resuming: 'استئناف الجولة الجارية…',
    buyConfirm: 'شراء {name} مقابل {price}؟', buyConfirmTitle: 'تأكيد الشراء', plusConfirmTitle: 'تأكيد الوضع', plusConfirm: 'تفعيل {name}؟ ستُلعب كل جولة بقيمة {price}.',
    autoTitle: 'لعب تلقائي', autoSub: 'اختر عدد الجولات وشروط الإيقاف ثم أكّد.',
    autoRounds: 'عدد الجولات', autoStopWin: 'أوقف عند ربح لا يقل عن', autoStart: 'ابدأ', autoCost: 'التكلفة لكل جولة'
  };
  X.rules.ar = {
    modesH: 'الأوضاع والتكلفة وRTP وأقصى ربح', colMode: 'الوضع', colCost: 'التكلفة', colRtp: 'RTP', colMax: 'أقصى ربح', colChance: 'الفرصة', colValue: 'القيمة', colBoost: 'التعزيز', colNumCase: 'خانة رقم', colBonusCase: 'خانة بونص',
    modeStd: 'قياسي', modePlus: 'العرّاف+', tokScepter: 'صولجان ×2 (على المجموع الحالي)', tokKey: 'مفتاح ذهبي (+{keys} صناديق للفتح)', tokSeal: 'الختم (يغلق الغرفة)',
    modeStdD: 'لفة واحدة من عجلة الحكم. يظهر العرّاف في حوالي {p}٪ من اللفات.',
    modePlusD: 'تكلفته ×{c} من المبلغ المحدد. يظهر العرّاف في حوالي {pp}٪ من اللفات، فتأتي التعزيزات أكثر. نفس الـ RTP.',
    buyScarabD: 'يفتح بونص سقوط الجعارين مباشرة دون العجلة.', buyWeighD: 'يفتح بونص وزن القلب مباشرة دون العجلة.',
    buyVaultD: 'يفتح بونص غرفة الكنز مباشرة دون العجلة.', buyHandD: 'يفتح غضب أنوبيس مباشرة: تدور العجلة العملاقة فوراً.',
    modesNote: 'الـ RTP هو العائد المتوقع على عدد كبير جداً من الجولات (حساب دقيق وليس وعداً لجلسة واحدة). أقصى ربح هو مضاعف للمبلغ المحدد وليس لتكلفة الوضع، ومحدد بـ {m}× في كل الأوضاع. التكلفة مضاعف للمبلغ المحدد وتُعرض قبل التأكيد. يمكن لغضب أنوبيس أن يستولي على بونص مفتوح مباشرة ({h}٪ من المرات)، كما على العجلة.',
    howH: 'كيف تتكوّن الأرباح',
    how: [
      'لا توجد خطوط ربح أو تركيبات أو رموز يجب اصطفافها. كل لفة تتوقف عند إحدى خانات العجلة الـ {n}. الربح هو قيمة تلك الخانة × المبلغ المحدد.',
      'خانات الأرقام تربح قيمتها (×{nums}). خانات التراب لا تربح شيئاً. عنخ يمنح لفة مجانية: تدور العجلة مجدداً دون تكلفة، حتى {chain} مرات متتالية، وتنتهي الجولة عند خانة غير عنخ. تُجمع أرباح اللفات المتسلسلة.',
      'خانات البونص (الجعارين، الميزان، الكنز) تُطلق البونص المقابل: الربح هو نتيجة البونص × المبلغ المحدد. كل واحدة من الثلاث تشغل {one} من {n} خانة.',
      'العرّاف: قبل اللفة يختار نوعاً من الخانات ({kinds}) ويمنحه تعزيزاً. تبقى قيمة التعزيز مختومة (تظهر ×?) حتى تتوقف العجلة. إذا توقفت العجلة على هذا النوع تُضرب قيمة الخانة (أو نتيجة البونص) في التعزيز. لا يفعل العرّاف شيئاً إذا توقفت العجلة في مكان آخر.',
      'إجمالي ربح الجولة محدد بـ {m}× المبلغ المحدد: عند بلوغ الحد تنتهي الجولة ويُقيَّد الربح به. مؤثرات الربح (WIN وBIG WIN وEXTRA WIN وMEGA WIN وDIVINE JUDGEMENT) تعتمد على إجمالي الجولة ÷ تكلفة الوضع؛ ولا تغيّر أبداً المبلغ الذي ربحته.'
    ],
    oracleH: 'تعزيزات العرّاف', oracleNote: 'فرصة كل تعزيز عندما يختار العرّاف نوعاً من الخانات.',
    bonusH: 'جولات البونص: التفعيل والقيم',
    scarabH: 'سقوط الجعارين', scarabP: 'يُفعَّل بخانة الجعارين ({one} من {n}) أو يُفتح مباشرة. يسقط ثلاثة جعارين عبر {rows} صفوف من المسامير ويربح كل واحد قيمة الفتحة التي يهبط فيها (× تعزيز العرّاف إن انطبق). قيم الفتحات من اليسار إلى اليمين مع فرصة كل فتحة:',
    weighH: 'وزن القلب', weighP: 'يُفعَّل بخانة الميزان ({one} من {n}) أو يُفتح مباشرة. تعرض كفتان مضاعفاً لكل منهما. تختار الريشة أو القلب؛ الكفة الأثقل تربح مضاعفها والأخف لا تربح شيئاً: فرصة واحدة من اثنتين. يُختار زوج المضاعفات بهذه الفرص:',
    vaultH: 'غرفة الكنز', vaultP: 'تُفعَّل بخانة الكنز ({one} من {n}) أو تُفتح مباشرة. افتح الصناديق واحداً تلو الآخر: {picks} في البداية. يحتوي كل صندوق على قيمة تُضاف إلى المجموع، أو صولجان (×2 على المجموع الحالي)، أو مفتاح ذهبي (+{keys} صناديق إضافية، حتى {cap} في المجموع)، أو الختم الذي يغلق الغرفة ويحتفظ بالمجموع الحالي. لا شيء يلغي الختم أو يؤخره؛ والمفتاح يطيل الاختيار فقط. لا يحتوي أول صندوقين على ختم أبداً. فتح كل الصناديق المسموحة يضيف مكافأة +{fin}×. محتويات الصناديق وفرصها (بعد أول صندوقين):',
    handH: 'غضب أنوبيس', handP: 'يمكن للغضب أن يستولي على أي بونص ({h}٪ من المرات على العجلة وفي البونص المفتوح مباشرة؛ دائماً في وضع الغضب). اختر لوناً (فيروزي أو ذهبي أو ياقوتي: بنفس الفرص) ثم دوّر العجلة العملاقة ذات {segs} خانة. رقم: الربح = الرقم × المستوى. مضاعفة بلونك: تتضاعف كل الأرقام (المستوى ×2 و×4 و×8 حتى ×{tier}) وتدور مجدداً. مضاعفة بلون آخر: تنتهي السلسلة ويُربح أصغر رقم ({min}) × المستوى. الشريط يُطلق بونصاً: ربح البونص × مضاعف الشريط × المستوى. أرقام العجلة العملاقة: ×{hnums}. خانات المضاعفة: {dbl} ({dblc} لكل لون). الأشرطة: {bands}. لا يتجاوز المستوى ×{tier} (ولا تُحتسب خانات المضاعفة بعد ذلك).',
    cryptH: 'محراب المدّ والجزر (بونص مخفي)', cDust: 'غبار (لا شيء)', cTab: 'لوح (+ القيمة × المدّ الحالي)', cTide: 'مدّ (× المدّ)', cEclipse: 'كسوف (× القربان)', cryptP: 'قد يُستبدل بونص مربوح بمحراب المدّ والجزر ({s}٪ من المرات، ولا يحدث أبداً مع بونص مفتوح مباشرة). المس الألواح الـ {tiles} في شبكة 3×3 بأي ترتيب؛ الترتيب لا يغيّر الفرص. يبدأ القربان من 0 والمدّ من ×1. كل لوح هو واحد من: لوح (يضيف قيمته × المدّ الحالي إلى القربان)، مدّ (يضرب المدّ، فقط للألواح التي تنكشف بعده)، كسوف (يضرب القربان المجمّع) أو غبار (لا شيء). الربح هو القربان النهائي × المبلغ المحدد (×1 على الأقل إن لم يظهر أي لوح)، بحد أقصى {m}×. أنواع الألواح:',
    retrigH: 'البونص واللفات المجانية وإعادة التفعيل',
    retrig: [
      'لا توجد لفات مجانية لإعادة تفعيلها: يُلعب كل بونص مرة واحدة لكل تفعيل وتُضاف نتيجته إلى الجولة. لا يمكن لأي بونص أن يُفعّل بونصاً آخر: شريط الغضب يُطلق بونصاً لا يعود أبداً إلى الغضب.',
      'الميزة الوحيدة المتكررة هي لفة عنخ المجانية (انظر أعلاه). خانات البونص والعرّاف والغضب لها الفرص نفسها في كل الأوضاع.',
      'إذا انقطع الاتصال أثناء جولة، أعد تحميل اللعبة: تُنهى الجولة المحسومة مسبقاً ويُسوّى ربحها.'
    ],
    btnH: 'الأزرار وأدوات التحكم',
    btn: [
      ['− / +', 'يخفض أو يرفع المبلغ المحدد (المفتاحان ↓ / ↑). مقفلان أثناء الجولة.'],
      ['{spin}', 'يبدأ جولة بالمبلغ المحدد (تعمل أيضاً مفتاح المسافة أو Enter). أثناء اللعب التلقائي يصبح {stop}.'],
      ['{auto}', 'اختر عدد الجولات التلقائية ({autos})؛ تلعبها اللعبة تباعاً حتى يكتمل العدد أو تضغط {stop} أو يُبلغ حد ما أو يصبح الرصيد غير كافٍ. خيار «إيقاف اللعب التلقائي عند البونص» موجود في المعلومات. خيار «{stopwin}» في نافذة AUTO ({stops} المبلغ المحدد، أو متوقف) يوقف اللعب التلقائي بمجرد أن تربح جولة هذا المقدار على الأقل.'],
      ['{turbo}', 'جولات أسرع: ضغطة واحدة لـ TURBO، ضغطتان لـ ULTRA (نتيجة شبه فورية)، وثالثة للإيقاف. يُلعب البونص دائماً بإيقاع أهدأ.'],
      ['{buy}', 'يفتح قائمة البونصات المفتوحة مباشرة. تعرض كل بطاقة تكلفتها؛ واختيار بطاقة يبدأ ذلك البونص.'],
      ['{plus}', 'يشغّل العرّاف+ أو يوقفه للجولات التالية: التكلفة ×{c} ويظهر العرّاف أكثر بكثير. تُعرض التكلفة تحت المبلغ.'],
      ['الصوت (مكبّر الصوت)', 'يفتح لوحة الصوت: مستوى الصوت، الحدّة، طبقة الصوت، الأجواء الموسيقية، الألوان ومفتاح يكتم كل الأصوات.'],
      ['i (معلومات)', 'يفتح هذه القواعد والإعدادات: حد الخسارة، جودة الرسوم، تقليل المؤثرات، خيارات اللعب التلقائي، تفعيل/إيقاف الوصول المباشر للبونص.'],
      ['اللغة', 'يفتح قائمة اللغات المتاحة وعددها {langs} (بأسمائها الأصلية)؛ واختيار إحداها يغيّر لغة اللعبة.'],
      ['€ / $', 'يبدّل عرض المبالغ بين اليورو والدولار (نفس القيمة الرقمية).'],
      ['×', 'يغلق النافذة المفتوحة (يعمل Esc أيضاً).'],
      ['لمس / مسافة', 'في البونص: يبدأ البونص، يُسقط الجعران أو الكتلة، يختار صندوقاً أو بطاقة أو لوناً. في مؤثر الربح: المس لتخطيه.']
    ],
    discH: 'مهم', disc: 'يؤدي أي عطل إلى إبطال جميع الأرباح والجولات. يلزم اتصال إنترنت مستقر. عند انقطاع الاتصال، أعد تحميل اللعبة لإنهاء الجولات غير المكتملة. يُحسب العائد المتوقع على عدد كبير من الجولات. عرض اللعبة لا يمثل أي جهاز مادي وهو للتوضيح فقط. تُسوّى الأرباح وفق المبلغ المستلم من Remote Game Server وليس وفق الأحداث داخل متصفح الويب. TM و© 2026 Engine.'
  };
  S.ar = {
    bet: 'اللعب', plusHint: 'العرّاف+: تعزيز في ≈ {opp}٪ من اللفات · مبلغ اللعب ×1.1', cost: 'قيمة اللعب', sessWag: 'ما لُعب',
    rulesPlus: 'وضع العرّاف+: مبلغ اللعب ×1.1، يظهر العرّاف في ≈ {opp}٪ من اللفات. نفس نسبة العائد (≈ 96٪).',
    buyBtn: 'احصل على بونص', buyTitle: 'احصل على بونص', buySub: 'افتح بونصاً مباشرة دون العجلة. قابل للعب بقيمة: مبلغ اللعب × المضاعف. يمكن لغضب أنوبيس أن يستولي عليه.',
    buyPrice: 'قيمة اللعب', buyNow: 'احصل', buyOn: 'الوصول إلى البونص', resumed: 'جولة متوقفة: تمت إضافة الربح',
    scarabSub: 'ثلاثة جعارين تهوي في الظلام. كل واحد يربح قيمة الخانة التي يسقط فيها.',
    splashDemo: 'عرض تجريبي · قطع اللعب · العب بمسؤولية', curHint: 'عرض تجريبي: رمزان (SC, GC)؛ المبالغ تقريبية فقط.', demoBuild: 'عرض محلي تجريبي — ليست نسخة الإنتاج. المبالغ وهمية.', infoTitle: 'القواعد وجدول الأرباح', demo: 'قطع اللعب — نسخة تجريبية، المبالغ المعروضة ليست حقيقية.',
    tableCols: { 2: 'الربح' }, currencyL: 'توكن', handWrongSub: 'تنتهي السلسلة: يُجمع المستوى الحالي',
    rules: {
      0: 'لعبة واحدة، لفة واحدة: عجلة الحكم تقرر. كل خانة تربح قيمتها × مبلغ لعبك.',
      2: 'عنخ: لفة مجانية للعجلة بدون مبلغ لعب إضافي.',
      6: function (s) { return s.replace('تكلفة الجولة', 'قيمة لعب الجولة'); }
    },
    $rules: {
      modesH: 'الأوضاع وقيمة اللعب وRTP وأقصى ربح', colCost: 'قيمة اللعب',
      modePlusD: 'قيمة لعبه ×{c} من المبلغ المحدد. يظهر العرّاف في حوالي {pp}٪ من اللفات، فتأتي التعزيزات أكثر. نفس الـ RTP.',
      modesNote: function (s) { return s.replace('لتكلفة الوضع', 'لقيمة لعب الوضع').replace('التكلفة مضاعف', 'قيمة اللعب مضاعف'); },
      how: { 1: function (s) { return s.replace('دون تكلفة', 'دون مبلغ لعب إضافي'); }, 4: function (s) { return s.replace('تكلفة الوضع', 'قيمة لعب الوضع'); } },
      btn: {
        4: { 1: 'يفتح قائمة البونصات المفتوحة مباشرة. تعرض كل بطاقة قيمة لعبها؛ واختيار بطاقة يبدأ ذلك البونص.' },
        5: { 1: 'يشغّل العرّاف+ أو يوقفه للجولات التالية: قيمة اللعب ×{c} ويظهر العرّاف أكثر بكثير. تُعرض قيمة اللعب تحت المبلغ.' },
        9: { 0: 'SC / GC', 1: 'يبدّل العرض بين التوكنين (نفس القيمة الرقمية).' }
      }
    },
    $replay: { bet: 'مبلغ اللعب', realCost: 'قيمة اللعب الفعلية', costMult: 'قيمة اللعب' },
    $rgs: {
        errLaunch: 'شغّل اللعبة من الموقع. مطلوب وجود جلسة لعب.',
      errVal: 'تم رفض الطلب: انتهت الجلسة أو أن اللعبة غير صالحة. يرجى إعادة تشغيل اللعبة من الموقع.',
      errIpb: 'الرصيد غير كافٍ لهذه اللعبة.', errGle: 'تم بلوغ الحد: رُفضت هذه اللعبة.',
      errNet: 'الشبكة غير متاحة أو الاستجابة غير صالحة. ربما لم تُحتسب لعبتك: تحقق من رصيدك.',
      buyConfirm: 'الحصول على {name}؟ قابل للعب بقيمة {price}.', buyConfirmTitle: 'تأكيد البونص', autoCost: 'قيمة اللعب لكل جولة'
    }
  };
})(window.I18N_X, window.I18N_SOCIAL);

/* --- de --- */
(function (X, S) {
  X.tiers.de = ['GEWINN', 'GROSSER GEWINN', 'EXTRA-GEWINN', 'MEGA-GEWINN'];
  X.replay.de = {
    badge: 'REPLAY', start: 'ABSPIELEN', again: 'ERNEUT ABSPIELEN', playing: 'LÄUFT…', loading: 'Replay wird geladen…',
    errSum: 'Die Ereignisse des Replays stimmen nicht mit dem vom Server gemeldeten Betrag überein: Der Serverbetrag wird angezeigt.',
    errLoad: 'Dieser Replay konnte nicht geladen werden.', errParams: 'Replay-Parameter fehlen (game, version, mode, event, rgs_url).', errFormat: 'Dieser Replay hat ein unbekanntes Format.',
    errNet: 'Netzwerkfehler: Verbindung prüfen und neu laden.', bet: 'EINSATZ', betSocial: 'SPIELBETRAG', realCost: 'TATSÄCHLICHE KOSTEN', costMult: 'Kosten', result: 'GEWINN', noWin: 'Kein Gewinn',
    modeStd: 'STANDARD', modePlus: 'ORAKEL+', modeBonus: 'BONUS'
  };
  X.rgs.de = {
    connecting: 'Verbindung zum Spielserver…', retry: 'Erneut versuchen', confirm: 'Bestätigen', cancel: 'Abbrechen',
    errLaunch: 'Starte das Spiel über Stake. Eine Spielsitzung ist erforderlich.',
    errUrl: 'Verbindung nicht möglich: Die Adresse des Spielservers (rgs_url) oder die Sitzung fehlt oder ist ungültig. Bitte starte das Spiel erneut über die Website.',
    errAuth: 'Der Spielserver ist nicht erreichbar. Prüfe deine Verbindung und starte das Spiel neu.',
    errVal: 'Anfrage abgelehnt: Die Sitzung ist abgelaufen oder der Einsatz ist ungültig. Bitte starte das Spiel erneut über die Website.',
    errIpb: 'Guthaben für diesen Einsatz nicht ausreichend.',
    errGle: 'Spiellimit erreicht: Dieser Einsatz wird abgelehnt.',
    errAct: 'Der Server ist ausgelastet. Bitte versuche es gleich noch einmal.',
    errGen: 'Fehler des Spielservers. Bitte versuche es gleich noch einmal.',
    errNet: 'Netzwerk nicht verfügbar oder ungültige Antwort. Dein Einsatz wurde möglicherweise nicht berücksichtigt: Prüfe dein Guthaben.',
    errBook: 'Das Rundenergebnis konnte nicht gelesen werden. Bitte wende dich an den Support.',
    errIs: 'Ungültige oder abgelaufene Sitzung. Bitte starte das Spiel erneut über die Seite.',
    errAte: 'Authentifizierung abgelaufen. Bitte starte das Spiel erneut über die Seite, um dich neu anzumelden.',
    errLoc: 'Dieses Spiel ist an deinem Standort nicht verfügbar.',
    errMaint: 'Wartungsarbeiten laufen. Bitte versuche es in einigen Minuten erneut.',
    errSum: 'Das angezeigte Ergebnis stimmt nicht mit dem Betrag des Spielservers überein: Der Serverbetrag wird übernommen.',
    resuming: 'Laufende Runde wird fortgesetzt…',
    buyConfirm: '{name} für {price} kaufen?', buyConfirmTitle: 'KAUF BESTÄTIGEN', plusConfirmTitle: 'MODUS BESTÄTIGEN', plusConfirm: '{name} aktivieren? Jede Runde wird zu {price} gespielt.',
    autoTitle: 'AUTOSPIEL', autoSub: 'Wähle die Anzahl der Runden und die Stoppbedingungen, dann bestätige.',
    autoRounds: 'Anzahl der Runden', autoStopWin: 'Stopp bei einem Gewinn ab', autoStart: 'Start', autoCost: 'Kosten pro Runde'
  };
  X.rules.de = {
    modesH: 'Modi, Kosten, RTP und Maximalgewinn', colMode: 'Modus', colCost: 'Kosten', colRtp: 'RTP', colMax: 'Max. Gewinn', colChance: 'Chance', colValue: 'Wert', colBoost: 'Boost', colNumCase: 'Zahlenfeld', colBonusCase: 'Bonusfeld',
    modeStd: 'Standard', modePlus: 'ORAKEL+', tokScepter: 'SZEPTER ×2 (auf die bisherige Summe)', tokKey: 'GOLDENER SCHLÜSSEL (+{keys} Truhen zu öffnen)', tokSeal: 'SIEGEL (schließt die Kammer)',
    modeStdD: 'Eine Drehung des Rads des Gerichts. Das Orakel erscheint bei etwa {p} % der Drehungen.',
    modePlusD: 'Kostet ×{c} des gewählten Betrags. Das Orakel erscheint bei etwa {pp} % der Drehungen, Boosts fallen also häufiger. Gleicher RTP.',
    buyScarabD: 'Öffnet direkt den Bonus Skarabäenfall, ohne das Rad.', buyWeighD: 'Öffnet direkt den Bonus Wägung des Herzens, ohne das Rad.',
    buyVaultD: 'Öffnet direkt den Bonus Schatzkammer, ohne das Rad.', buyHandD: 'Öffnet direkt die Wut des Anubis: Das Riesenrad wird sofort gedreht.',
    modesNote: 'Der RTP ist die erwartete Rückgabe über eine sehr große Zahl von Spielen (exakte Berechnung, kein Versprechen für eine einzelne Sitzung). Der Maximalgewinn ist ein Vielfaches des gewählten Betrags, nicht der Modus-Kosten, und ist in jedem Modus auf {m}× begrenzt. Die Kosten sind ein Vielfaches des gewählten Betrags und werden vor der Bestätigung angezeigt. Die Wut des Anubis kann einen direkt geöffneten Bonus trotzdem übernehmen ({h} % der Fälle), wie am Rad.',
    howH: 'Wie Gewinne entstehen',
    how: [
      'Es gibt keine Gewinnlinien, Kombinationen oder Symbole, die man aufreihen müsste. Jede Drehung bleibt auf einem der {n} Felder des Rads stehen. Der Gewinn ist der Wert dieses Feldes × der gewählte Betrag.',
      'Zahlenfelder gewinnen ihren Wert (×{nums}). Staubfelder gewinnen nichts. ANKH schenkt einen Gratis-Respin: Das Rad dreht sich ohne Kosten erneut, bis zu {chain}-mal hintereinander, und die Runde endet auf einem Feld, das kein ANKH ist. Die Gewinne verketteter Drehungen werden addiert.',
      'Bonusfelder (Skarabäen, Wägung, Schatz) starten den passenden Bonus: Der Gewinn ist das Bonusergebnis × der gewählte Betrag. Jedes der drei belegt {one} von {n} Feldern.',
      'Orakel: Vor der Drehung wählt es eine Feldart ({kinds}) und gibt ihr einen Boost. Der Wert des Boosts bleibt versiegelt (angezeigt als ×?), bis das Rad stehen bleibt. Hält das Rad auf dieser Feldart an, wird der Feldwert (oder das Bonusergebnis) mit dem Boost multipliziert. Hält das Rad woanders an, bewirkt das Orakel nichts.',
      'Der Gesamtgewinn einer Runde ist auf {m}× den gewählten Betrag begrenzt: Ist die Grenze erreicht, endet die Runde und der Gewinn wird darauf beschränkt. Die Gewinnanimationen (WIN, BIG WIN, EXTRA WIN, MEGA WIN, GÖTTLICHES URTEIL) hängen von der Rundensumme ÷ den Kosten des Modus ab; sie ändern nie den gewonnenen Betrag.'
    ],
    oracleH: 'Boosts des Orakels', oracleNote: 'Chance jedes Boosts, wenn das Orakel eine Feldart wählt.',
    bonusH: 'Bonusrunden: Auslöser und Werte',
    scarabH: 'Skarabäenfall', scarabP: 'Ausgelöst durch das Skarabäenfeld ({one} von {n}) oder direkt geöffnet. Drei Skarabäen fallen durch {rows} Reihen von Stiften und jeder gewinnt den Wert des Fachs, in dem er landet (× Boost des Orakels, falls er greift). Fachwerte von links nach rechts, mit der Chance jedes Fachs:',
    weighH: 'Wägung des Herzens', weighP: 'Ausgelöst durch das Wägungsfeld ({one} von {n}) oder direkt geöffnet. Zwei Schalen zeigen je einen Multiplikator. Du wählst die Feder oder das Herz; die schwerere Schale gewinnt ihren Multiplikator, die leichtere nichts: eine Chance von eins zu zwei. Das Paar von Multiplikatoren wird mit diesen Chancen gezogen:',
    vaultH: 'Schatzkammer', vaultP: 'Ausgelöst durch das Schatzfeld ({one} von {n}) oder direkt geöffnet. Öffne die Truhen nacheinander: zu Beginn {picks}. Jede Truhe enthält einen Wert, der zur Summe addiert wird, oder ein SZEPTER (×2 auf die bisherige Summe), oder einen GOLDENEN SCHLÜSSEL (+{keys} weitere Truhen, höchstens {cap} insgesamt), oder das SIEGEL, das die Kammer schließt und die bisherige Summe behält. Nichts hebt das Siegel auf oder verzögert es; ein Schlüssel verlängert nur die Auswahl. Die ersten zwei Truhen enthalten nie ein Siegel. Werden alle erlaubten Truhen geöffnet, gibt es eine Prämie von +{fin}×. Truheninhalte und Chancen (nach den ersten zwei Truhen):',
    handH: 'Wut des Anubis', handP: 'Jeder Bonus kann von der Wut übernommen werden ({h} % der Fälle am Rad und bei direkt geöffneten Bonus; immer im Wut-Modus). Wähle eine Farbe (Türkis, Gold oder Rubin: gleiche Chancen) und drehe dann das Riesenrad mit {segs} Feldern. Eine Zahl: Gewinn = Zahl × Stufe. DOPPELT in deiner Farbe: Alle Zahlen werden verdoppelt (Stufe ×2, ×4, ×8 bis ×{tier}) und du drehst erneut. DOPPELT in einer anderen Farbe: Die Kette endet und die kleinste Zahl ({min}) × Stufe wird gewonnen. Ein Band startet einen Bonus: Bonusgewinn × Bandmultiplikator × Stufe. Zahlen auf dem Riesenrad: ×{hnums}. DOPPELT-Felder: {dbl} ({dblc} pro Farbe). Bänder: {bands}. Die Stufe wächst nicht über ×{tier} hinaus (DOPPELT-Felder zählen dann nicht mehr).',
    cryptH: 'Heiligtum der Gezeiten (versteckter Bonus)', cDust: 'STAUB (nichts)', cTab: 'TAFEL (+ Wert × aktuelle Gezeit)', cTide: 'GEZEITEN (× die Gezeit)', cEclipse: 'FINSTERNIS (× die Gabe)', cryptP: 'Ein gewonnener Bonus kann durch das Heiligtum der Gezeiten ersetzt werden ({s} % der Fälle, nie bei einem direkt geöffneten Bonus). Berühre die {tiles} Tafeln eines 3×3-Gitters in beliebiger Reihenfolge; die Reihenfolge ändert die Chancen nicht. Die Gabe beginnt bei 0 und die Gezeit bei ×1. Jede Tafel ist eines von: TAFEL (addiert ihren Wert × die aktuelle Gezeit zur Gabe), GEZEITEN (multipliziert die Gezeit, nur für die danach aufgedeckten Tafeln), FINSTERNIS (multipliziert die bereits gesammelte Gabe) oder STAUB (nichts). Der Gewinn ist die Endgabe × der gewählte Betrag (mindestens ×1, falls keine Tafel erscheint), begrenzt auf {m}×. Tafelarten:',
    retrigH: 'Bonus, Respins und Neuauslösungen',
    retrig: [
      'Es gibt keine Freispiele, die neu ausgelöst werden könnten: Jeder Bonus wird pro Auslösung einmal gespielt und sein Ergebnis wird zur Runde addiert. Kein Bonus kann einen anderen Bonus auslösen: Ein Band der Wut startet einen Bonus, der nie zur Wut zurückführt.',
      'Die einzige sich wiederholende Funktion ist der ANKH-Respin (siehe oben). Bonusfelder, Orakel und Wut haben in jedem Modus dieselben Chancen.',
      'Bricht die Verbindung während einer Runde ab, lade das Spiel neu: Die bereits entschiedene Runde wird beendet und ihr Gewinn abgerechnet.'
    ],
    btnH: 'Tasten und Bedienung',
    btn: [
      ['− / +', 'Verringert oder erhöht den gewählten Betrag (Tasten ↓ / ↑). Gesperrt, solange eine Runde läuft.'],
      ['{spin}', 'Startet eine Runde mit dem gewählten Betrag (Leertaste oder Eingabe geht auch). Im Autospiel wird sie zu {stop}.'],
      ['{auto}', 'Wähle die Anzahl der automatischen Runden ({autos}); das Spiel spielt sie nacheinander, bis die Zahl erreicht ist, du {stop} drückst, ein Limit erreicht wird oder das Guthaben zu niedrig ist. Die Option „Autospiel bei Bonus stoppen“ findest du unter Info. „{stopwin}“ im AUTO-Fenster ({stops} des gewählten Betrags oder aus) beendet das Autospiel, sobald eine Runde mindestens so viel gewinnt.'],
      ['{turbo}', 'Schnellere Runden: einmal drücken für TURBO, zweimal für ULTRA (fast sofortiges Ergebnis), ein drittes Mal zum Ausschalten. Ein Bonus läuft immer in ruhigerem Tempo.'],
      ['{buy}', 'Öffnet das Menü der direkt geöffneten Bonus. Jede Karte zeigt ihre Kosten; wer eine Karte wählt, startet diesen Bonus.'],
      ['{plus}', 'Schaltet ORAKEL+ für die nächsten Runden ein oder aus: Kosten ×{c}, das Orakel erscheint deutlich häufiger. Die Kosten stehen unter dem Betrag.'],
      ['Ton (Lautsprecher)', 'Öffnet das Tonfeld: Lautstärke, Höhen, Tonhöhe, Musikstimmung, Farbgebung und ein Schalter, der alle Töne stummschaltet.'],
      ['i (Info)', 'Öffnet diese Regeln und die Einstellungen: Verlustlimit, Grafikqualität, reduzierte Effekte, Autospiel-Optionen, direkter Bonuszugang an/aus.'],
      ['Sprache', 'Öffnet das Menü der {langs} verfügbaren Sprachen (Eigennamen); die Auswahl wechselt die Sprache des Spiels.'],
      ['€ / $', 'Wechselt die Anzeige der Beträge zwischen Euro und Dollar (gleicher Zahlenwert).'],
      ['×', 'Schließt das geöffnete Fenster (Esc geht auch).'],
      ['Tippen / Leertaste', 'In einem Bonus: startet den Bonus, lässt den Skarabäus oder Block fallen, wählt eine Truhe, eine Karte oder eine Farbe. In einer Gewinnanimation: Tippen überspringt sie.']
    ],
    discH: 'Wichtig', disc: 'Eine Fehlfunktion macht alle Gewinne und Spiele ungültig. Eine stabile Internetverbindung ist erforderlich. Bei einer Unterbrechung lade das Spiel neu, um nicht abgeschlossene Runden zu beenden. Der erwartete Ertrag wird über viele Spiele berechnet. Die Spielanzeige repräsentiert kein physisches Gerät und dient nur der Veranschaulichung. Gewinne werden nach dem vom Remote Game Server erhaltenen Betrag abgerechnet und nicht nach Ereignissen im Webbrowser. TM und © 2026 Engine.'
  };
  S.de = {
    bet: 'SPIEL', plusHint: 'ORAKEL+: Boost bei ≈ {opp} % der Drehungen · Spielbetrag ×1,1', cost: 'SPIELEN FÜR', sessWag: 'Gespielt',
    rulesPlus: 'Modus ORAKEL+: Spielbetrag ×1,1, das Orakel erscheint bei ≈ {opp} % der Drehungen. Gleicher RTP (≈ 96 %).',
    buyBtn: 'BONUS HOLEN', buyTitle: 'BONUS HOLEN', buySub: 'Öffne direkt einen Bonus, ohne das Rad. Spielbar für: Spielbetrag × Multiplikator. Die Wut des Anubis kann ihn trotzdem ergreifen.',
    buyPrice: 'SPIELBAR FÜR', buyNow: 'HOLEN', buyOn: 'Bonuszugang', resumed: 'Unterbrochene Runde: Gewinn hinzugefügt',
    scarabSub: 'Drei Skarabäen stürzen durch die Dunkelheit. Jeder gewinnt das Feld, in dem er landet.',
    splashDemo: 'Demo · Spielmünzen · Spiele verantwortungsvoll', curHint: 'Demo: 2 Token (SC, GC) – Beträge nur zur Orientierung.', demoBuild: 'Lokale Demo – nicht die Produktionsversion. Die Beträge sind fiktiv.', infoTitle: 'Regeln & Gewinntabelle', demo: 'Spielmünzen — Demo, die angezeigten Beträge sind nicht echt.',
    tableCols: { 2: 'Gewinn' }, currencyL: 'Token', handWrongSub: 'Die Kette endet: aktuelle Stufe eingesammelt',
    rules: {
      0: 'Ein Spiel, eine Drehung: Das Rad des Gerichts entscheidet. Jedes Feld gewinnt seinen Wert × deinen Spielbetrag.',
      2: 'ANKH: kostenloser Respin des Rads, ohne zusätzlichen Spielbetrag.',
      4: function (s) { return s.replace('kassierst', 'erhältst'); },
      6: function (s) { return s.replace('Rundenkosten', 'Spielwert der Runde'); }
    },
    $rules: {
      modesH: 'Modi, Spielwert, RTP und Maximalgewinn', colCost: 'Spielbar für',
      modePlusD: 'Spielbar für ×{c} des gewählten Betrags. Das Orakel erscheint bei etwa {pp} % der Drehungen, Boosts fallen also häufiger. Gleicher RTP.',
      modesNote: function (s) { return s.replace('nicht der Modus-Kosten', 'nicht des Spielwerts des Modus').replace('Die Kosten sind ein Vielfaches', 'Der Spielwert ist ein Vielfaches'); },
      how: { 1: function (s) { return s.replace('ohne Kosten', 'ohne zusätzlichen Spielbetrag'); }, 4: function (s) { return s.replace('den Kosten des Modus', 'dem Spielwert des Modus'); } },
      btn: {
        4: { 1: 'Öffnet das Menü der direkt geöffneten Bonus. Jede Karte zeigt, wofür sie spielbar ist; wer eine Karte wählt, startet diesen Bonus.' },
        5: { 1: 'Schaltet ORAKEL+ für die nächsten Runden ein oder aus: Spielwert ×{c}, das Orakel erscheint deutlich häufiger. Der Spielwert steht unter dem Betrag.' },
        9: { 0: 'SC / GC', 1: 'Wechselt die Anzeige zwischen den beiden Token (gleicher Zahlenwert).' }
      }
    },
    $replay: { bet: 'SPIELBETRAG', realCost: 'TATSÄCHLICHER SPIELWERT', costMult: 'Spielwert' },
    $rgs: {
        errLaunch: 'Starte das Spiel über die Seite. Eine Spielsitzung ist erforderlich.',
      errVal: 'Anfrage abgelehnt: Die Sitzung ist abgelaufen oder die Runde ist ungültig. Bitte starte das Spiel erneut über die Website.',
      errIpb: 'Guthaben für diese Runde nicht ausreichend.', errGle: 'Limit erreicht: Diese Runde wird abgelehnt.',
      errNet: 'Netzwerk nicht verfügbar oder ungültige Antwort. Deine Runde wurde möglicherweise nicht berücksichtigt: Prüfe dein Guthaben.',
      buyConfirm: '{name} holen? Spielbar für {price}.', buyConfirmTitle: 'BONUS BESTÄTIGEN', autoCost: 'Spielwert pro Runde'
    }
  };
})(window.I18N_X, window.I18N_SOCIAL);

/* --- es --- */
(function (X, S) {
  X.tiers.es = ['PREMIO', 'GRAN PREMIO', 'PREMIO EXTRA', 'MEGA PREMIO'];
  X.replay.es = {
    badge: 'REPETICIÓN', start: 'REPRODUCIR', again: 'REPRODUCIR DE NUEVO', playing: 'EN CURSO…', loading: 'Cargando la repetición…',
    errSum: 'Los eventos de la repetición no coinciden con el importe anunciado por el servidor: se muestra el importe del servidor.',
    errLoad: 'No se pudo cargar esta repetición.', errParams: 'Faltan parámetros de la repetición (game, version, mode, event, rgs_url).', errFormat: 'Esta repetición tiene un formato desconocido.',
    errNet: 'Error de red: comprueba la conexión y vuelve a cargar.', bet: 'APUESTA', betSocial: 'IMPORTE DE JUEGO', realCost: 'COSTE REAL', costMult: 'Coste', result: 'PREMIO', noWin: 'Sin premio',
    modeStd: 'ESTÁNDAR', modePlus: 'ORÁCULO+', modeBonus: 'BONUS'
  };
  X.rgs.es = {
    connecting: 'Conectando con el servidor de juego…', retry: 'Reintentar', confirm: 'Confirmar', cancel: 'Cancelar',
    errLaunch: 'Inicia el juego desde Stake. Se necesita una sesión de juego.',
    errUrl: 'No se puede conectar: la dirección del servidor de juego (rgs_url) o la sesión falta o no es válida. Vuelve a iniciar el juego desde el sitio.',
    errAuth: 'No se puede acceder al servidor de juego. Comprueba tu conexión y vuelve a iniciar el juego.',
    errVal: 'Solicitud rechazada: la sesión ha caducado o la apuesta no es válida. Vuelve a iniciar el juego desde el sitio.',
    errIpb: 'Saldo insuficiente para esta apuesta.',
    errGle: 'Límite de juego alcanzado: esta apuesta se rechaza.',
    errAct: 'El servidor está ocupado. Inténtalo de nuevo en un momento.',
    errGen: 'Error del servidor de juego. Inténtalo de nuevo en un momento.',
    errNet: 'Red no disponible o respuesta no válida. Es posible que tu apuesta no se haya tenido en cuenta: comprueba tu saldo.',
    errBook: 'No se pudo leer el resultado de la ronda. Ponte en contacto con el soporte.',
    errIs: 'Sesión no válida o caducada. Vuelve a iniciar el juego desde el sitio.',
    errAte: 'La autenticación ha caducado. Vuelve a iniciar el juego desde el sitio para identificarte de nuevo.',
    errLoc: 'Este juego no está disponible desde tu ubicación.',
    errMaint: 'Mantenimiento en curso. Inténtalo de nuevo en unos minutos.',
    errSum: 'El resultado mostrado no coincide con el importe del servidor de juego: se aplica el importe del servidor.',
    resuming: 'Reanudando la ronda en curso…',
    buyConfirm: '¿Comprar {name} por {price}?', buyConfirmTitle: 'CONFIRMAR COMPRA', plusConfirmTitle: 'CONFIRMAR MODO', plusConfirm: '¿Activar {name}? Cada ronda se jugará por {price}.',
    autoTitle: 'JUEGO AUTOMÁTICO', autoSub: 'Elige el número de rondas y las condiciones de parada, y confirma.',
    autoRounds: 'Número de rondas', autoStopWin: 'Parar con un premio de al menos', autoStart: 'Iniciar', autoCost: 'Coste por ronda'
  };
  X.rules.es = {
    modesH: 'Modos, coste, RTP y premio máximo', colMode: 'Modo', colCost: 'Coste', colRtp: 'RTP', colMax: 'Premio máx.', colChance: 'Probabilidad', colValue: 'Valor', colBoost: 'Potenciador', colNumCase: 'Casilla de número', colBonusCase: 'Casilla de bonus',
    modeStd: 'Estándar', modePlus: 'ORÁCULO+', tokScepter: 'CETRO ×2 (sobre el total acumulado)', tokKey: 'LLAVE DE ORO (+{keys} cofres por abrir)', tokSeal: 'SELLO (cierra la cámara)',
    modeStdD: 'Un giro de la rueda del juicio. El Oráculo aparece en cerca del {p} % de los giros.',
    modePlusD: 'Cuesta ×{c} el importe seleccionado. El Oráculo aparece en cerca del {pp} % de los giros, así que los potenciadores salen más a menudo. Mismo RTP.',
    buyScarabD: 'Abre directamente el bonus Caída de Escarabajos, sin pasar por la rueda.', buyWeighD: 'Abre directamente el bonus Pesaje del Corazón, sin pasar por la rueda.',
    buyVaultD: 'Abre directamente el bonus Cámara del Tesoro, sin pasar por la rueda.', buyHandD: 'Abre directamente la Furia de Anubis: la rueda gigante gira de inmediato.',
    modesNote: 'El RTP es el retorno esperado a lo largo de un número muy grande de partidas (cálculo exacto, no una promesa para una sola sesión). El premio máximo es un múltiplo del importe seleccionado, no del coste del modo, y está limitado a {m}× en todos los modos. El coste es un múltiplo del importe seleccionado y se muestra antes de confirmar. La Furia de Anubis aún puede tomar un bonus abierto directamente ({h} % de las veces), como en la rueda.',
    howH: 'Cómo se forman los premios',
    how: [
      'No hay líneas, combinaciones ni símbolos que alinear. Cada giro se detiene en una de las {n} casillas de la rueda. El premio es el valor de esa casilla × el importe seleccionado.',
      'Las casillas de número ganan su valor (×{nums}). Las casillas de polvo no ganan nada. ANKH regala un giro gratis: la rueda gira de nuevo sin coste, hasta {chain} veces seguidas, y la ronda termina en una casilla que no sea ANKH. Los premios de los giros encadenados se suman.',
      'Las casillas de bonus (Escarabajos, Pesaje, Tesoro) activan el bonus correspondiente: el premio es el resultado del bonus × el importe seleccionado. Cada una de las tres ocupa {one} de las {n} casillas.',
      'Oráculo: antes del giro elige un tipo de casilla ({kinds}) y le da un potenciador. El valor del potenciador permanece sellado (se muestra como ×?) hasta que la rueda se detiene. Si la rueda se detiene en ese tipo de casilla, el valor de la casilla (o el resultado del bonus) se multiplica por el potenciador. El Oráculo no hace nada si la rueda se detiene en otro sitio.',
      'El premio total de una ronda está limitado a {m}× el importe seleccionado: al alcanzar el límite la ronda termina y el premio queda limitado a él. Las animaciones de premio (WIN, BIG WIN, EXTRA WIN, MEGA WIN, JUICIO DIVINO) dependen del total de la ronda ÷ el coste del modo; nunca cambian el importe ganado.'
    ],
    oracleH: 'Potenciadores del Oráculo', oracleNote: 'Probabilidad de cada potenciador cuando el Oráculo elige un tipo de casilla.',
    bonusH: 'Rondas de bonus: activación y valores',
    scarabH: 'Caída de Escarabajos', scarabP: 'Se activa con la casilla Escarabajos ({one} de {n}) o se abre directamente. Tres escarabajos caen entre {rows} filas de clavijas y cada uno gana el valor de la ranura donde aterriza (× el potenciador del Oráculo si se aplica). Valores de las ranuras de izquierda a derecha, con la probabilidad de cada una:',
    weighH: 'Pesaje del Corazón', weighP: 'Se activa con la casilla Pesaje ({one} de {n}) o se abre directamente. Dos platillos muestran cada uno un multiplicador. Eliges la pluma o el corazón; el platillo más pesado gana su multiplicador, el más ligero no gana nada: una probabilidad de una entre dos. La pareja de multiplicadores se sortea con estas probabilidades:',
    vaultH: 'Cámara del Tesoro', vaultP: 'Se activa con la casilla Tesoro ({one} de {n}) o se abre directamente. Abre los cofres uno tras otro: {picks} al empezar. Cada cofre contiene un valor que se suma al total, o un CETRO (×2 sobre el total acumulado), o una LLAVE DE ORO (+{keys} cofres más por abrir, hasta {cap} en total), o el SELLO, que cierra la cámara y conserva el total acumulado. Nada anula ni retrasa el sello; una llave solo alarga la selección. Los dos primeros cofres nunca contienen un sello. Abrir todos los cofres permitidos añade una prima de +{fin}×. Contenido de los cofres y probabilidades (después de los dos primeros cofres):',
    handH: 'Furia de Anubis', handP: 'Cualquier bonus puede ser tomado por la Furia ({h} % de las veces en la rueda y en los bonus abiertos directamente; siempre en el modo Furia). Elige un color (turquesa, oro o rubí: mismas probabilidades) y luego gira la rueda gigante de {segs} casillas. Un número: premio = número × nivel. DOBLE de tu color: todos los números se duplican (nivel ×2, ×4, ×8 hasta ×{tier}) y giras de nuevo. DOBLE de otro color: la cadena se detiene y se gana el número más pequeño ({min}) × nivel. Una banda activa un bonus: premio del bonus × multiplicador de la banda × nivel. Números de la rueda gigante: ×{hnums}. Casillas DOBLE: {dbl} ({dblc} por color). Bandas: {bands}. El nivel no crece más allá de ×{tier} (las casillas DOBLE dejan de contar).',
    cryptH: 'Santuario de las Mareas (bonus oculto)', cDust: 'POLVO (nada)', cTab: 'TABLILLA (+ valor × marea actual)', cTide: 'MAREA (× la marea)', cEclipse: 'ECLIPSE (× la ofrenda)', cryptP: 'Un bonus ganado puede ser reemplazado por el Santuario de las Mareas ({s} % de las veces, nunca para un bonus abierto directamente). Toca las {tiles} tablillas de una cuadrícula de 3×3 en el orden que quieras; el orden no cambia las probabilidades. La ofrenda empieza en 0 y la marea en ×1. Cada tablilla es una de estas: TABLILLA (suma su valor × la marea actual a la ofrenda), MAREA (multiplica la marea, solo para las tablillas reveladas después), ECLIPSE (multiplica la ofrenda ya reunida) o POLVO (nada). El premio es la ofrenda final × el importe seleccionado (al menos ×1 si no aparece ninguna tablilla), limitado a {m}×. Tipos de tablilla:',
    retrigH: 'Bonus, giros gratis y reactivaciones',
    retrig: [
      'No hay giros gratis que reactivar: cada bonus se juega una vez por activación y su resultado se suma a la ronda. Ningún bonus puede activar otro bonus: una banda de la Furia lanza un bonus que nunca vuelve a la Furia.',
      'La única función que se repite es el giro gratis ANKH (ver arriba). Las casillas de bonus, el Oráculo y la Furia tienen las mismas probabilidades en todos los modos.',
      'Si se corta la conexión durante una ronda, vuelve a cargar el juego: la ronda ya decidida se termina y su premio queda liquidado.'
    ],
    btnH: 'Botones y controles',
    btn: [
      ['− / +', 'Baja o sube el importe seleccionado (teclas ↓ / ↑). Bloqueados mientras hay una ronda en curso.'],
      ['{spin}', 'Inicia una ronda con el importe seleccionado (también con Espacio o Intro). Durante el juego automático se convierte en {stop}.'],
      ['{auto}', 'Elige el número de rondas automáticas ({autos}); el juego las encadena hasta alcanzar el número, pulsar {stop}, llegar a un límite o quedarse sin saldo suficiente. La opción «Parar el automático con bonus» está en Info. «{stopwin}» en la ventana AUTO ({stops} el importe seleccionado, o desactivado) detiene el automático en cuanto una ronda gana al menos esa cantidad.'],
      ['{turbo}', 'Rondas más rápidas: una pulsación para TURBO, dos para ULTRA (resultado casi instantáneo), una tercera para desactivarlo. Un bonus siempre se juega a un ritmo más tranquilo.'],
      ['{buy}', 'Abre el menú de bonus abiertos directamente. Cada tarjeta muestra su coste; al elegir una tarjeta se inicia ese bonus.'],
      ['{plus}', 'Activa o desactiva ORÁCULO+ para las próximas rondas: coste ×{c}, el Oráculo aparece mucho más a menudo. El coste se muestra bajo el importe.'],
      ['Sonido (altavoz)', 'Abre el panel de sonido: volumen, agudos, tono, ambiente musical, color y un interruptor que silencia todos los sonidos.'],
      ['i (Info)', 'Abre estas reglas y los ajustes: límite de pérdida, calidad gráfica, efectos reducidos, opciones del automático, acceso directo a bonus sí/no.'],
      ['Idioma', 'Abre el menú de los {langs} idiomas disponibles (nombres nativos); al elegir uno cambia el idioma del juego.'],
      ['€ / $', 'Cambia la visualización de los importes entre euro y dólar (mismo valor numérico).'],
      ['×', 'Cierra la ventana abierta (Esc también funciona).'],
      ['Toque / Espacio', 'En un bonus: inicia el bonus, suelta el escarabajo o el bloque, elige un cofre, una carta o un color. En una animación de premio: toca para saltarla.']
    ],
    discH: 'Importante', disc: 'Un mal funcionamiento anula todos los premios y partidas. Se requiere una conexión a internet estable. En caso de desconexión, vuelve a cargar el juego para terminar las rondas inconclusas. El retorno esperado se calcula a lo largo de muchas partidas. La pantalla del juego no representa ningún dispositivo físico y es solo ilustrativa. Los premios se liquidan según el importe recibido del Remote Game Server y no según los eventos del navegador web. TM y © 2026 Engine.'
  };
  S.es = {
    bet: 'JUEGO', plusHint: 'ORÁCULO+: potenciador en ≈ {opp} % de los giros · importe de juego ×1,1', cost: 'JUGAR POR', sessWag: 'Jugado',
    rulesPlus: 'Modo ORÁCULO+: importe de juego ×1,1, el Oráculo aparece en ≈ {opp} % de los giros. Mismo RTP (≈ 96 %).',
    buyBtn: 'OBTENER BONUS', buyTitle: 'OBTENER BONUS', buySub: 'Abre un bonus directamente, sin pasar por la rueda. Jugable por: importe de juego × multiplicador. La Furia de Anubis aún puede tomarlo.',
    buyPrice: 'JUGABLE POR', buyNow: 'OBTENER', buyOn: 'Acceso a bonus', resumed: 'Ronda interrumpida: premio añadido',
    scarabSub: 'Tres escarabajos caen en la oscuridad. Cada uno gana la casilla donde aterriza.',
    splashDemo: 'Demo · monedas de juego · Juega con moderación', curHint: 'Demo: 2 fichas (SC, GC); importes solo orientativos.', demoBuild: 'Demo local: no es la versión de producción. Los importes son ficticios.', infoTitle: 'Reglas y tabla de premios', demo: 'Monedas de juego — demo, los importes mostrados no son reales.',
    tableCols: { 2: 'Premio' }, currencyL: 'Ficha', handWrongSub: 'La cadena se detiene: se recoge el nivel actual',
    rules: {
      0: 'Un juego, un giro: la rueda del juicio decide. Cada casilla gana su valor × tu importe de juego.',
      2: 'ANKH: giro gratis de la rueda, sin importe de juego adicional.',
      6: function (s) { return s.replace('coste de la ronda', 'valor de juego de la ronda'); }
    },
    $rules: {
      modesH: 'Modos, valor de juego, RTP y premio máximo', colCost: 'Jugable por',
      modePlusD: 'Jugable por ×{c} el importe seleccionado. El Oráculo aparece en cerca del {pp} % de los giros, así que los potenciadores salen más a menudo. Mismo RTP.',
      modesNote: function (s) { return s.replace('no del coste del modo', 'no del valor de juego del modo').replace('El coste es un múltiplo', 'El valor de juego es un múltiplo'); },
      how: { 1: function (s) { return s.replace('sin coste', 'sin importe de juego adicional'); }, 4: function (s) { return s.replace('el coste del modo', 'el valor de juego del modo'); } },
      btn: {
        4: { 1: 'Abre el menú de bonus abiertos directamente. Cada tarjeta muestra por cuánto se puede jugar; al elegir una tarjeta se inicia ese bonus.' },
        5: { 1: 'Activa o desactiva ORÁCULO+ para las próximas rondas: valor de juego ×{c}, el Oráculo aparece mucho más a menudo. El valor de juego se muestra bajo el importe.' },
        9: { 0: 'SC / GC', 1: 'Cambia la visualización entre las dos fichas (mismo valor numérico).' }
      }
    },
    $replay: { bet: 'IMPORTE DE JUEGO', realCost: 'VALOR DE JUEGO REAL', costMult: 'Valor de juego' },
    $rgs: {
        errLaunch: 'Inicia el juego desde el sitio. Se necesita una sesión de juego.',
      errVal: 'Solicitud rechazada: la sesión ha caducado o la jugada no es válida. Vuelve a iniciar el juego desde el sitio.',
      errIpb: 'Saldo insuficiente para esta jugada.', errGle: 'Límite alcanzado: esta jugada se rechaza.',
      errNet: 'Red no disponible o respuesta no válida. Es posible que tu jugada no se haya tenido en cuenta: comprueba tu saldo.',
      buyConfirm: '¿Obtener {name}? Jugable por {price}.', buyConfirmTitle: 'CONFIRMAR BONUS', autoCost: 'Valor de juego por ronda'
    }
  };
})(window.I18N_X, window.I18N_SOCIAL);

/* --- fi --- */
(function (X, S) {
  X.tiers.fi = ['VOITTO', 'ISO VOITTO', 'EXTRA-VOITTO', 'MEGAVOITTO'];
  X.replay.fi = {
    badge: 'TOISTO', start: 'TOISTA', again: 'TOISTA UUDELLEEN', playing: 'TOISTETAAN…', loading: 'Ladataan toistoa…',
    errSum: 'Toiston tapahtumat eivät vastaa palvelimen ilmoittamaa summaa: näytetään palvelimen summa.',
    errLoad: 'Tämän toiston lataus epäonnistui.', errParams: 'Toiston parametreja puuttuu (game, version, mode, event, rgs_url).', errFormat: 'Tämän toiston muoto on tuntematon.',
    errNet: 'Verkkovirhe: tarkista yhteys ja lataa uudelleen.', bet: 'PANOS', betSocial: 'PELISUMMA', realCost: 'TODELLINEN HINTA', costMult: 'Hinta', result: 'VOITTO', noWin: 'Ei voittoa',
    modeStd: 'NORMAALI', modePlus: 'ORAAKKELI+', modeBonus: 'BONUS'
  };
  X.rgs.fi = {
    connecting: 'Yhdistetään pelipalvelimeen…', retry: 'Yritä uudelleen', confirm: 'Vahvista', cancel: 'Peruuta',
    errLaunch: 'Käynnistä peli Stakesta. Pelisessio vaaditaan.',
    errUrl: 'Yhteys ei onnistu: pelipalvelimen osoite (rgs_url) tai istunto puuttuu tai on virheellinen. Käynnistä peli uudelleen sivustolta.',
    errAuth: 'Pelipalvelimeen ei saada yhteyttä. Tarkista yhteytesi ja käynnistä peli uudelleen.',
    errVal: 'Pyyntö hylättiin: istunto on vanhentunut tai panos on virheellinen. Käynnistä peli uudelleen sivustolta.',
    errIpb: 'Saldo ei riitä tähän panokseen.',
    errGle: 'Pelirajoitus täyttyi: tämä panos hylätään.',
    errAct: 'Palvelin on varattu. Yritä hetken kuluttua uudelleen.',
    errGen: 'Pelipalvelimen virhe. Yritä hetken kuluttua uudelleen.',
    errNet: 'Verkko ei ole käytettävissä tai vastaus on virheellinen. Panostasi ei ehkä ole otettu huomioon: tarkista saldosi.',
    errBook: 'Kierroksen tulosta ei voitu lukea. Ota yhteyttä tukeen.',
    errIs: 'Virheellinen tai vanhentunut istunto. Käynnistä peli uudelleen sivustolta.',
    errAte: 'Tunnistautuminen on vanhentunut. Käynnistä peli uudelleen sivustolta kirjautuaksesi uudelleen.',
    errLoc: 'Tämä peli ei ole saatavilla sijainnissasi.',
    errMaint: 'Huolto käynnissä. Yritä uudelleen muutaman minuutin kuluttua.',
    errSum: 'Näytetty tulos ei vastaa pelipalvelimen summaa: palvelimen summa otetaan käyttöön.',
    resuming: 'Käynnissä olevaa kierrosta jatketaan…',
    buyConfirm: 'Ostetaanko {name} hintaan {price}?', buyConfirmTitle: 'VAHVISTA OSTO', plusConfirmTitle: 'VAHVISTA TILA', plusConfirm: 'Otetaanko {name} käyttöön? Jokainen kierros pelataan arvolla {price}.',
    autoTitle: 'AUTOMAATTIPELI', autoSub: 'Valitse kierrosten määrä ja pysäytysehdot ja vahvista sitten.',
    autoRounds: 'Kierrosten määrä', autoStopWin: 'Pysäytä vähintään tällä voitolla', autoStart: 'Aloita', autoCost: 'Hinta kierrosta kohti'
  };
  X.rules.fi = {
    modesH: 'Tilat, hinta, RTP ja enimmäisvoitto', colMode: 'Tila', colCost: 'Hinta', colRtp: 'RTP', colMax: 'Enimmäisvoitto', colChance: 'Todennäköisyys', colValue: 'Arvo', colBoost: 'Tehostus', colNumCase: 'Numeroruutu', colBonusCase: 'Bonusruutu',
    modeStd: 'Normaali', modePlus: 'ORAAKKELI+', tokScepter: 'SEPPELE ×2 (siihen asti kertyneelle summalle)', tokKey: 'KULTAINEN AVAIN (+{keys} avattavaa arkkua)', tokSeal: 'SINETTI (sulkee kammion)',
    modeStdD: 'Yksi tuomion ratas pyöräytys. Oraakkeli ilmestyy noin {p} %:lla pyöräytyksistä.',
    modePlusD: 'Hinta on ×{c} valitusta summasta. Oraakkeli ilmestyy noin {pp} %:lla pyöräytyksistä, joten tehostuksia tulee useammin. Sama RTP.',
    buyScarabD: 'Avaa Skarabeusten pudotus -bonuksen suoraan ilman rataa.', buyWeighD: 'Avaa Sydämen punnitus -bonuksen suoraan ilman rataa.',
    buyVaultD: 'Avaa Aarrekammio-bonuksen suoraan ilman rataa.', buyHandD: 'Avaa Anubiksen raivon suoraan: jättiratas pyöräytetään heti.',
    modesNote: 'RTP on odotettu tuotto hyvin suuressa määrässä pelejä (tarkka laskelma, ei lupaus yksittäiselle istunnolle). Enimmäisvoitto on valitun summan monikerta, ei tilan hinnan, ja se on rajattu arvoon {m}× kaikissa tiloissa. Hinta on valitun summan monikerta ja se näytetään ennen vahvistusta. Anubiksen raivo voi silti ottaa haltuunsa suoraan avatun bonuksen ({h} % kerroista), kuten radalla.',
    howH: 'Miten voitot muodostuvat',
    how: [
      'Voittolinjoja, yhdistelmiä tai riviin asetettavia symboleja ei ole. Jokainen pyöräytys pysähtyy yhteen radan {n} ruudusta. Voitto on kyseisen ruudun arvo × valittu summa.',
      'Numeroruudut antavat arvonsa (×{nums}). Tomuruudut eivät anna mitään. ANKH antaa ilmaisen uudelleenpyöräytyksen: ratas pyörii uudelleen ilman hintaa, enintään {chain} kertaa peräkkäin, ja kierros päättyy muuhun kuin ANKH-ruutuun. Ketjutettujen pyöräytysten voitot lasketaan yhteen.',
      'Bonusruudut (Skarabeukset, Punnitus, Aarre) käynnistävät vastaavan bonuksen: voitto on bonuksen tulos × valittu summa. Kukin kolmesta vie {one} ruutua {n}:stä.',
      'Oraakkeli: ennen pyöräytystä se valitsee ruututyypin ({kinds}) ja antaa sille tehostuksen. Tehostuksen arvo pysyy sinetöitynä (näytetään ×?) kunnes ratas pysähtyy. Jos ratas pysähtyy kyseiseen ruututyyppiin, ruudun arvo (tai bonuksen tulos) kerrotaan tehostuksella. Jos ratas pysähtyy muualle, Oraakkeli ei tee mitään.',
      'Kierroksen kokonaisvoitto on rajattu arvoon {m}× valittu summa: kun raja saavutetaan, kierros päättyy ja voitto rajoitetaan siihen. Voittoanimaatiot (WIN, BIG WIN, EXTRA WIN, MEGA WIN, JUMALAINEN TUOMIO) riippuvat kierroksen summasta ÷ tilan hinta; ne eivät koskaan muuta voitettua summaa.'
    ],
    oracleH: 'Oraakkelin tehostukset', oracleNote: 'Kunkin tehostuksen todennäköisyys, kun Oraakkeli valitsee ruututyypin.',
    bonusH: 'Bonuskierrokset: käynnistys ja arvot',
    scarabH: 'Skarabeusten pudotus', scarabP: 'Käynnistyy Skarabeukset-ruudusta ({one} ruutua {n}:stä) tai avataan suoraan. Kolme skarabeusta putoaa {rows} tappirivin läpi ja kukin voittaa sen lokeron arvon, johon se päätyy (× Oraakkelin tehostus, jos se pätee). Lokeroiden arvot vasemmalta oikealle sekä kunkin lokeron todennäköisyys:',
    weighH: 'Sydämen punnitus', weighP: 'Käynnistyy Punnitus-ruudusta ({one} ruutua {n}:stä) tai avataan suoraan. Kaksi vaakakuppia näyttää kumpikin kertoimen. Valitset sulan tai sydämen; painavampi kuppi voittaa kertoimensa, kevyempi ei mitään: yksi mahdollisuus kahdesta. Kerroinpari arvotaan näillä todennäköisyyksillä:',
    vaultH: 'Aarrekammio', vaultP: 'Käynnistyy Aarre-ruudusta ({one} ruutua {n}:stä) tai avataan suoraan. Avaa arkut yksi kerrallaan: aluksi {picks}. Kukin arkku sisältää joko summaan lisättävän arvon, SEPPELEEN (×2 siihen asti kertyneelle summalle), KULTAISEN AVAIMEN (+{keys} arkkua lisää, yhteensä enintään {cap}) tai SINETIN, joka sulkee kammion ja säilyttää siihen asti kertyneen summan. Mikään ei peruuta tai viivytä sinettiä; avain vain pidentää valintaa. Kaksi ensimmäistä arkkua eivät koskaan sisällä sinettiä. Kaikkien sallittujen arkkujen avaaminen lisää palkkion +{fin}×. Arkkujen sisältö ja todennäköisyydet (kahden ensimmäisen arkun jälkeen):',
    handH: 'Anubiksen raivo', handP: 'Raivo voi ottaa haltuunsa minkä tahansa bonuksen ({h} % kerroista radalla ja suoraan avatuissa bonuksissa; aina Raivo-tilassa). Valitse väri (turkoosi, kulta tai rubiini: samat todennäköisyydet) ja pyöräytä sitten {segs} ruudun jättirataa. Numero: voitto = numero × taso. TUPLA omalla värilläsi: kaikki numerot kaksinkertaistuvat (taso ×2, ×4, ×8 aina arvoon ×{tier} asti) ja pyöräytät uudelleen. TUPLA toisella värillä: ketju päättyy ja voitat pienimmän numeron ({min}) × taso. Nauha käynnistää bonuksen: bonuksen voitto × nauhan kerroin × taso. Jättiradan numerot: ×{hnums}. TUPLA-ruudut: {dbl} ({dblc} väriä kohti). Nauhat: {bands}. Taso ei kasva yli arvon ×{tier} (TUPLA-ruudut eivät silloin enää lasketa).',
    cryptH: 'Vuorovesien pyhäkkö (piilotettu bonus)', cDust: 'PÖLY (ei mitään)', cTab: 'TAULU (+ arvo × nykyinen vuorovesi)', cTide: 'VUOROVESI (× vuorovesi)', cEclipse: 'PIMENNYS (× uhri)', cryptP: 'Voitettu bonus voidaan korvata Vuorovesien pyhäkölle ({s} % kerroista, ei koskaan suoraan avatussa bonuksessa). Kosketa 3×3-ruudukon {tiles} taulua missä järjestyksessä tahansa; järjestys ei muuta todennäköisyyksiä. Uhri alkaa nollasta ja vuorovesi arvosta ×1. Jokainen taulu on yksi näistä: TAULU (lisää arvonsa × nykyinen vuorovesi uhriin), VUOROVESI (kertoo vuorovesen, vain sen jälkeen paljastettaville tauluille), PIMENNYS (kertoo jo kerätyn uhrin) tai PÖLY (ei mitään). Voitto on lopullinen uhri × valittu summa (vähintään ×1, jos yhtään taulua ei ilmesty), rajattu arvoon {m}×. Taulutyypit:',
    retrigH: 'Bonukset, uudelleenpyöräytykset ja uudelleenkäynnistykset',
    retrig: [
      'Uudelleenkäynnistettäviä ilmaiskierroksia ei ole: kukin bonus pelataan kerran käynnistystä kohti ja sen tulos lisätään kierrokseen. Mikään bonus ei voi käynnistää toista bonusta: Raivon nauha käynnistää bonuksen, joka ei koskaan johda takaisin Raivoon.',
      'Ainoa toistuva ominaisuus on ANKH-uudelleenpyöräytys (katso yllä). Bonusruuduilla, Oraakkelilla ja Raivolla on samat todennäköisyydet kaikissa tiloissa.',
      'Jos yhteys katkeaa kierroksen aikana, lataa peli uudelleen: jo ratkaistu kierros saatetaan loppuun ja sen voitto selvitetään.'
    ],
    btnH: 'Painikkeet ja ohjaimet',
    btn: [
      ['− / +', 'Pienentää tai suurentaa valittua summaa (näppäimet ↓ / ↑). Lukittu kierroksen ajaksi.'],
      ['{spin}', 'Aloittaa kierroksen valitulla summalla (myös välilyönti tai Enter). Automaattipelissä siitä tulee {stop}.'],
      ['{auto}', 'Valitse automaattikierrosten määrä ({autos}); peli pelaa ne peräkkäin, kunnes määrä täyttyy, painat {stop}, raja täyttyy tai saldo ei riitä. Valinta “Pysäytä automaattipeli bonuksessa” löytyy Tiedoista. Valinta “{stopwin}” AUTO-ikkunassa ({stops} valitusta summasta tai pois) pysäyttää automaattipelin heti, kun kierros voittaa vähintään niin paljon.'],
      ['{turbo}', 'Nopeammat kierrokset: yksi painallus TURBO, kaksi ULTRA (tulos lähes heti), kolmas sammuttaa. Bonus pelataan aina rauhallisemmalla tahdilla.'],
      ['{buy}', 'Avaa suoraan avattavien bonusten valikon. Jokainen kortti näyttää hintansa; kortin valinta käynnistää kyseisen bonuksen.'],
      ['{plus}', 'Kytkee ORAAKKELI+ -tilan päälle tai pois seuraaville kierroksille: hinta ×{c}, Oraakkeli ilmestyy paljon useammin. Hinta näkyy summan alla.'],
      ['Ääni (kaiutin)', 'Avaa ääniruudun: äänenvoimakkuus, diskantti, sävelkorkeus, musiikin tunnelma, värisävy ja kytkin, joka mykistää kaikki äänet.'],
      ['i (Tiedot)', 'Avaa nämä säännöt ja asetukset: tappioraja, grafiikan laatu, vähennetyt tehosteet, automaattipelin asetukset, suora bonuspääsy päällä/pois.'],
      ['Kieli', 'Avaa {langs} käytettävissä olevan kielen valikon (omilla nimillään); valinta vaihtaa pelin kielen.'],
      ['€ / $', 'Vaihtaa summien näytön euron ja dollarin välillä (sama numeroarvo).'],
      ['×', 'Sulkee avoimen ikkunan (myös Esc).'],
      ['Kosketus / välilyönti', 'Bonuksessa: aloittaa bonuksen, pudottaa skarabeuksen tai lohkon, valitsee arkun, kortin tai värin. Voittoanimaatiossa: kosketus ohittaa sen.']
    ],
    discH: 'Tärkeää', disc: 'Toimintahäiriö mitätöi kaikki voitot ja pelit. Vakaa internetyhteys on välttämätön. Yhteyden katketessa lataa peli uudelleen saattaaksesi keskeneräiset kierrokset loppuun. Odotettu tuotto lasketaan monen pelin perusteella. Pelin näyttö ei edusta mitään fyysistä laitetta ja on vain havainnollistava. Voitot selvitetään Remote Game Serveriltä saadun summan mukaan, ei verkkoselaimen tapahtumien mukaan. TM ja © 2026 Engine.'
  };
  S.fi = {
    bet: 'PELI', plusHint: 'ORAAKKELI+: tehostus ≈ {opp} %:lla pyöräytyksistä · pelisumma ×1,1', cost: 'PELIARVO', sessWag: 'Pelattu',
    rulesPlus: 'ORAAKKELI+-tila: pelisumma ×1,1, Oraakkeli ilmestyy ≈ {opp} %:lla pyöräytyksistä. Sama RTP (≈ 96 %).',
    buyBtn: 'AVAA BONUS', buyTitle: 'AVAA BONUS', buySub: 'Avaa bonus suoraan ohittaen rata. Pelattavissa arvolla: pelisumma × kerroin. Anubiksen raivo voi silti ottaa sen haltuunsa.',
    buyPrice: 'PELIARVO', buyNow: 'AVAA', buyOn: 'Suora bonuspääsy', resumed: 'Keskeytynyt kierros: voitto lisätty',
    scarabSub: 'Kolme skarabeusta syöksyy pimeyteen. Kukin voittaa ruudun, johon se putoaa.',
    splashDemo: 'Demo · pelikolikot · Pelaa vastuullisesti', curHint: 'Demo: 2 polettia (SC, GC); summat ovat vain suuntaa-antavia.', demoBuild: 'Paikallinen demo — ei ole tuotantoversio. Summat ovat kuvitteellisia.', infoTitle: 'Säännöt & voittotaulukko', demo: 'Pelikolikot — demo, näytetyt summat eivät ole oikeita.',
    tableCols: { 2: 'Voitto' }, currencyL: 'Poletti',
    rules: {
      0: 'Yksi peli, yksi pyöräytys: tuomion ratas ratkaisee. Jokainen ruutu antaa arvonsa × pelisummasi.',
      2: 'ANKH: ratasta pyöräytetään ilmaiseksi uudelleen, ilman lisäpelisummaa.'
    },
    $rules: {
      modesH: 'Tilat, peliarvo, RTP ja enimmäisvoitto', colCost: 'Peliarvo',
      modePlusD: 'Peliarvo on ×{c} valitusta summasta. Oraakkeli ilmestyy noin {pp} %:lla pyöräytyksistä, joten tehostuksia tulee useammin. Sama RTP.',
      modesNote: function (s) { return s.replace('ei tilan hinnan', 'ei tilan peliarvon').replace('Hinta on valitun', 'Peliarvo on valitun'); },
      how: { 1: function (s) { return s.replace('ilman hintaa', 'ilman lisäpelisummaa'); }, 4: function (s) { return s.replace('tilan hinta', 'tilan peliarvo'); } },
      btn: {
        4: { 1: 'Avaa suoraan avattavien bonusten valikon. Jokainen kortti näyttää peliarvonsa; kortin valinta käynnistää kyseisen bonuksen.' },
        5: { 1: 'Kytkee ORAAKKELI+ -tilan päälle tai pois seuraaville kierroksille: peliarvo ×{c}, Oraakkeli ilmestyy paljon useammin. Peliarvo näkyy summan alla.' },
        9: { 0: 'SC / GC', 1: 'Vaihtaa näytön kahden polettilajin välillä (sama numeroarvo).' }
      }
    },
    $replay: { bet: 'PELISUMMA', realCost: 'TODELLINEN PELIARVO', costMult: 'Peliarvo' },
    $rgs: {
        errLaunch: 'Käynnistä peli sivustolta. Pelisessio vaaditaan.',
      errVal: 'Pyyntö hylättiin: istunto on vanhentunut tai peli on virheellinen. Käynnistä peli uudelleen sivustolta.',
      errIpb: 'Saldo ei riitä tähän peliin.', errGle: 'Raja täyttyi: tämä peli hylätään.',
      errNet: 'Verkko ei ole käytettävissä tai vastaus on virheellinen. Peliäsi ei ehkä ole otettu huomioon: tarkista saldosi.',
      buyConfirm: 'Avataanko {name}? Pelattavissa arvolla {price}.', buyConfirmTitle: 'VAHVISTA BONUS', autoCost: 'Peliarvo kierrosta kohti'
    }
  };
})(window.I18N_X, window.I18N_SOCIAL);

/* --- hi --- */
(function (X, S) {
  X.tiers.hi = ['जीत', 'बड़ी जीत', 'एक्स्ट्रा जीत', 'मेगा जीत', 'दिव्य न्याय'];
  X.replay.hi = {
    badge: 'रीप्ले', start: 'चलाएँ', again: 'फिर से चलाएँ', playing: 'चल रहा है…', loading: 'रीप्ले लोड हो रहा है…',
    errLoad: 'यह रीप्ले लोड नहीं हो सका।', errParams: 'रीप्ले के पैरामीटर नहीं मिले (game, version, mode, event, rgs_url)।', errFormat: 'इस रीप्ले का प्रारूप अज्ञात है।',
    errNet: 'नेटवर्क त्रुटि: कनेक्शन जाँचें और दोबारा लोड करें।', bet: 'दांव', betSocial: 'खेल राशि', realCost: 'वास्तविक लागत', costMult: 'लागत', result: 'जीत', noWin: 'कोई जीत नहीं',
    modeStd: 'स्टैंडर्ड', modePlus: 'ओरेकल+', modeBonus: 'बोनस'
  };
  X.rgs.hi = {
    connecting: 'गेम सर्वर से जुड़ रहे हैं…', retry: 'फिर कोशिश करें', confirm: 'पुष्टि करें', cancel: 'रद्द करें',
    errLaunch: 'गेम को Stake से लॉन्च करें। गेम सत्र आवश्यक है।',
    errUrl: 'कनेक्ट नहीं हो सका: गेम सर्वर का पता (rgs_url) या सत्र गायब है या अमान्य है। कृपया साइट से गेम फिर से शुरू करें।',
    errAuth: 'गेम सर्वर तक पहुँचा नहीं जा सका। अपना कनेक्शन जाँचें और गेम फिर से शुरू करें।',
    errVal: 'अनुरोध अस्वीकृत: सत्र समाप्त हो गया है या दांव अमान्य है। कृपया साइट से गेम फिर से शुरू करें।',
    errIpb: 'इस दांव के लिए बैलेंस पर्याप्त नहीं है।',
    errGle: 'खेल सीमा पूरी हो गई: यह दांव अस्वीकृत है।',
    errAct: 'सर्वर व्यस्त है। कृपया थोड़ी देर में फिर कोशिश करें।',
    errGen: 'गेम सर्वर में त्रुटि। कृपया थोड़ी देर में फिर कोशिश करें।',
    errNet: 'नेटवर्क उपलब्ध नहीं है या प्रतिक्रिया अमान्य है। हो सकता है आपका दांव गिना न गया हो: अपना बैलेंस जाँचें।',
    errBook: 'राउंड का नतीजा पढ़ा नहीं जा सका। कृपया सहायता से संपर्क करें।',
    buyConfirm: '{name} को {price} में खरीदें?', buyConfirmTitle: 'खरीद की पुष्टि करें', plusConfirmTitle: 'मोड की पुष्टि करें', plusConfirm: '{name} चालू करें? हर राउंड {price} में खेला जाएगा।',
    autoTitle: 'ऑटोप्ले', autoSub: 'राउंड की संख्या और रुकने की शर्तें चुनें, फिर पुष्टि करें।',
    autoRounds: 'राउंड की संख्या', autoStopWin: 'कम से कम इतनी जीत पर रुकें', autoStart: 'शुरू करें', autoCost: 'प्रति राउंड लागत'
  };
  X.rules.hi = {
    modesH: 'मोड, लागत, RTP और अधिकतम जीत', colMode: 'मोड', colCost: 'लागत', colRtp: 'RTP', colMax: 'अधिकतम जीत', colChance: 'संभावना', colValue: 'मान', colBoost: 'बूस्ट', colNumCase: 'संख्या वाला खाना', colBonusCase: 'बोनस वाला खाना',
    modeStd: 'स्टैंडर्ड', modePlus: 'ओरेकल+', tokScepter: 'राजदंड ×2 (अब तक के कुल पर)', tokKey: 'सुनहरी चाबी (खोलने के लिए +{keys} संदूक)', tokSeal: 'मुहर (कक्ष बंद कर देती है)',
    modeStdD: 'न्याय के चक्र का एक स्पिन। ओरेकल लगभग {p}% स्पिन में आता है।',
    modePlusD: 'चुनी हुई राशि का ×{c}। ओरेकल लगभग {pp}% स्पिन में आता है, इसलिए बूस्ट ज़्यादा बार मिलते हैं। RTP वही।',
    buyScarabD: 'स्कारब पतन बोनस को चक्र के बिना सीधे खोलता है।', buyWeighD: 'हृदय का तौल बोनस को चक्र के बिना सीधे खोलता है।',
    buyVaultD: 'ख़ज़ाना कक्ष बोनस को चक्र के बिना सीधे खोलता है।', buyHandD: 'अनुबिस का क्रोध सीधे खोलता है: विशाल चक्र तुरंत घुमाया जाता है।',
    modesNote: 'RTP बहुत बड़ी संख्या में खेलों पर अपेक्षित रिटर्न है (सटीक गणना, किसी एक सत्र का वादा नहीं)। अधिकतम जीत चुनी हुई राशि का गुणज है, मोड की लागत का नहीं, और हर मोड में {m}× तक सीमित है। लागत चुनी हुई राशि का गुणज है और पुष्टि से पहले दिखाई जाती है। सीधे खोले गए बोनस को भी अनुबिस का क्रोध छीन सकता है ({h}% बार), जैसे चक्र पर।',
    howH: 'जीत कैसे बनती है',
    how: [
      'कोई जीत की रेखा, संयोजन या सजाने वाले चिह्न नहीं हैं। हर स्पिन चक्र के {n} खानों में से किसी एक पर रुकता है। जीत उस खाने का मान × चुनी हुई राशि होती है।',
      'संख्या वाले खाने अपना मान जीतते हैं (×{nums})। धूल वाले खाने कुछ नहीं देते। अंख एक मुफ़्त रीस्पिन देता है: चक्र बिना लागत फिर घूमता है, लगातार अधिकतम {chain} बार, और राउंड अंख के अलावा किसी खाने पर खत्म होता है। जुड़े हुए स्पिनों की जीत जोड़ी जाती है।',
      'बोनस वाले खाने (स्कारब, तौल, ख़ज़ाना) संबंधित बोनस शुरू करते हैं: जीत बोनस का नतीजा × चुनी हुई राशि होती है। तीनों में से हर एक {n} में से {one} खाने घेरता है।',
      'ओरेकल: स्पिन से पहले वह खानों का एक प्रकार ({kinds}) चुनता है और उसे बूस्ट देता है। बूस्ट का मान चक्र रुकने तक मुहरबंद रहता है (×? के रूप में दिखता है)। अगर चक्र उसी प्रकार के खाने पर रुकता है, तो खाने का मान (या बोनस का नतीजा) बूस्ट से गुणा हो जाता है। चक्र कहीं और रुके तो ओरेकल कुछ नहीं करता।',
      'एक राउंड की कुल जीत चुनी हुई राशि के {m}× तक सीमित है: सीमा पर पहुँचते ही राउंड खत्म हो जाता है और जीत उसी तक सीमित रहती है। जीत के एनिमेशन (WIN, BIG WIN, EXTRA WIN, MEGA WIN, DIVINE JUDGEMENT) राउंड के कुल ÷ मोड की लागत पर निर्भर करते हैं; वे जीती गई राशि को कभी नहीं बदलते।'
    ],
    oracleH: 'ओरेकल के बूस्ट', oracleNote: 'ओरेकल जब खानों का प्रकार चुनता है, तब हर बूस्ट की संभावना।',
    bonusH: 'बोनस राउंड: शुरू होने की शर्तें और मान',
    scarabH: 'स्कारब पतन', scarabP: 'स्कारब वाले खाने ({n} में से {one}) से शुरू होता है या सीधे खोला जाता है। तीन स्कारब कीलों की {rows} पंक्तियों से गिरते हैं और हर एक उस खाँचे का मान जीतता है जिसमें वह उतरता है (लागू हो तो × ओरेकल का बूस्ट)। खाँचों के मान बाएँ से दाएँ, हर खाँचे की संभावना के साथ:',
    weighH: 'हृदय का तौल', weighP: 'तौल वाले खाने ({n} में से {one}) से शुरू होता है या सीधे खोला जाता है। दो पलड़े हर एक पर एक गुणक दिखाते हैं। आप पंख या हृदय चुनते हैं; भारी पलड़ा अपना गुणक जीतता है, हल्के पलड़े को कुछ नहीं मिलता: दो में से एक संभावना। गुणकों की जोड़ी इन संभावनाओं से निकाली जाती है:',
    vaultH: 'ख़ज़ाना कक्ष', vaultP: 'ख़ज़ाना वाले खाने ({n} में से {one}) से शुरू होता है या सीधे खोला जाता है। संदूक एक-एक करके खोलें: शुरू में {picks}। हर संदूक में या तो कुल में जुड़ने वाला मान होता है, या राजदंड (अब तक के कुल पर ×2), या सुनहरी चाबी (+{keys} और संदूक, कुल मिलाकर अधिकतम {cap}), या मुहर, जो कक्ष बंद कर देती है और अब तक का कुल रख लेती है। कुछ भी मुहर को रद्द या देरी नहीं करता; चाबी केवल चयन को लंबा करती है। पहले दो संदूकों में मुहर कभी नहीं होती। सभी अनुमत संदूक खोलने पर +{fin}× का पुरस्कार जुड़ता है। संदूकों की सामग्री और संभावनाएँ (पहले दो संदूकों के बाद):',
    handH: 'अनुबिस का क्रोध', handP: 'कोई भी बोनस क्रोध द्वारा छीना जा सकता है ({h}% बार चक्र पर और सीधे खोले गए बोनस में; क्रोध मोड में हमेशा)। एक रंग चुनें (फ़िरोज़ा, सुनहरा या माणिक: संभावना समान) फिर {segs} खानों वाला विशाल चक्र घुमाएँ। एक संख्या: जीत = संख्या × स्तर। अपने रंग में डबल: सभी संख्याएँ दोगुनी हो जाती हैं (स्तर ×2, ×4, ×8, ×{tier} तक) और आप फिर घुमाते हैं। दूसरे रंग में डबल: श्रृंखला रुक जाती है और सबसे छोटी संख्या ({min}) × स्तर जीतते हैं। एक पट्टी बोनस शुरू करती है: बोनस की जीत × पट्टी का गुणक × स्तर। विशाल चक्र की संख्याएँ: ×{hnums}। डबल खाने: {dbl} (हर रंग के {dblc})। पट्टियाँ: {bands}। स्तर ×{tier} से आगे नहीं बढ़ता (उसके बाद डबल खाने गिने नहीं जाते)।',
    cryptH: 'ज्वार का गर्भगृह (छिपा बोनस)', cDust: 'धूल (कुछ नहीं)', cTab: 'पट्टिका (+ मान × मौजूदा ज्वार)', cTide: 'ज्वार (× ज्वार)', cEclipse: 'ग्रहण (× चढ़ावा)', cryptP: 'जीता हुआ बोनस ज्वार के गर्भगृह से बदला जा सकता है ({s}% बार, सीधे खोले गए बोनस में कभी नहीं)। 3×3 ग्रिड की {tiles} पट्टिकाओं को किसी भी क्रम में छुएँ; क्रम से संभावनाएँ नहीं बदलतीं। चढ़ावा 0 से और ज्वार ×1 से शुरू होता है। हर पट्टिका इनमें से एक है: पट्टिका (अपना मान × मौजूदा ज्वार चढ़ावे में जोड़ती है), ज्वार (ज्वार को गुणा करता है, केवल उसके बाद खुलने वाली पट्टिकाओं के लिए), ग्रहण (अब तक जमा चढ़ावे को गुणा करता है) या धूल (कुछ नहीं)। जीत अंतिम चढ़ावा × चुनी हुई राशि है (कोई पट्टिका न आए तो कम से कम ×1), {m}× तक सीमित। पट्टिकाओं के प्रकार:',
    retrigH: 'बोनस, रीस्पिन और दोबारा शुरू होना',
    retrig: [
      'दोबारा शुरू होने वाले कोई मुफ़्त स्पिन नहीं हैं: हर बोनस हर बार शुरू होने पर एक बार खेला जाता है और उसका नतीजा राउंड में जुड़ता है। कोई बोनस दूसरा बोनस शुरू नहीं कर सकता: क्रोध की पट्टी ऐसा बोनस शुरू करती है जो कभी क्रोध पर वापस नहीं लाता।',
      'दोहराई जाने वाली एकमात्र सुविधा अंख रीस्पिन है (ऊपर देखें)। बोनस वाले खानों, ओरेकल और क्रोध की संभावनाएँ हर मोड में समान हैं।',
      'राउंड के दौरान कनेक्शन टूट जाए तो गेम फिर से लोड करें: पहले से तय राउंड पूरा किया जाता है और उसकी जीत का हिसाब हो जाता है।'
    ],
    btnH: 'बटन और नियंत्रण',
    btn: [
      ['− / +', 'चुनी हुई राशि घटाता या बढ़ाता है (कुंजियाँ ↓ / ↑)। राउंड चलने के दौरान बंद रहते हैं।'],
      ['{spin}', 'चुनी हुई राशि से राउंड शुरू करता है (Space या Enter भी चलता है)। ऑटोप्ले में यह {stop} बन जाता है।'],
      ['{auto}', 'स्वचालित राउंड की संख्या चुनें ({autos}); गेम उन्हें एक के बाद एक खेलता है जब तक संख्या पूरी न हो, आप {stop} न दबाएँ, कोई सीमा न आ जाए या बैलेंस कम न पड़ जाए। “बोनस पर ऑटोप्ले रोकें” विकल्प जानकारी में है। AUTO विंडो में “{stopwin}” ({stops} चुनी हुई राशि, या बंद) ऑटोप्ले को तभी रोक देता है जब कोई राउंड कम से कम इतना जीते।'],
      ['{turbo}', 'तेज़ राउंड: एक बार दबाएँ तो TURBO, दो बार तो ULTRA (लगभग तुरंत नतीजा), तीसरी बार बंद। बोनस हमेशा शांत गति से खेला जाता है।'],
      ['{buy}', 'सीधे खुलने वाले बोनस का मेनू खोलता है। हर कार्ड अपनी लागत दिखाता है; कार्ड चुनने पर वह बोनस शुरू होता है।'],
      ['{plus}', 'अगले राउंड के लिए ओरेकल+ चालू या बंद करता है: लागत ×{c}, ओरेकल कहीं ज़्यादा बार आता है। लागत राशि के नीचे दिखती है।'],
      ['ध्वनि (स्पीकर)', 'ध्वनि पैनल खोलता है: वॉल्यूम, ट्रेबल, पिच, संगीत का माहौल, रंग-तालमेल और सभी आवाज़ें म्यूट करने वाला स्विच।'],
      ['i (जानकारी)', 'ये नियम और सेटिंग्स खोलता है: हानि सीमा, ग्राफ़िक्स की गुणवत्ता, कम प्रभाव, ऑटोप्ले विकल्प, बोनस तक सीधी पहुँच चालू/बंद।'],
      ['भाषा', '{langs} उपलब्ध भाषाओं का मेनू खोलता है (मूल नामों के साथ); एक चुनने पर गेम की भाषा बदल जाती है।'],
      ['€ / $', 'राशियों का प्रदर्शन यूरो और डॉलर के बीच बदलता है (संख्यात्मक मान वही)।'],
      ['×', 'खुली खिड़की बंद करता है (Esc भी चलता है)।'],
      ['स्पर्श / Space', 'बोनस में: बोनस शुरू करता है, स्कारब या ब्लॉक गिराता है, संदूक, कार्ड या रंग चुनता है। जीत के एनिमेशन में: उसे छोड़ने के लिए छुएँ।']
    ],
    discH: 'महत्वपूर्ण', disc: 'खराबी होने पर सभी जीत और खेल रद्द हो जाते हैं। एक स्थिर इंटरनेट कनेक्शन आवश्यक है। कनेक्शन टूटने पर अधूरे राउंड पूरे करने के लिए गेम फिर से लोड करें। अपेक्षित रिटर्न की गणना बहुत सारे खेलों पर की जाती है। गेम का प्रदर्शन किसी भौतिक उपकरण का प्रतिनिधित्व नहीं करता और केवल उदाहरण के लिए है। जीत का हिसाब Remote Game Server से मिली राशि के अनुसार होता है, वेब ब्राउज़र की घटनाओं के अनुसार नहीं। TM और © 2026 Engine।'
  };
  S.hi = {
    bet: 'खेल', plusHint: 'ओरेकल+: ≈ {opp}% स्पिन पर बूस्ट · खेल राशि ×1.1', cost: 'खेल मूल्य', sessWag: 'खेला गया',
    rulesPlus: 'ओरेकल+ मोड: खेल राशि ×1.1, ओरेकल ≈ {opp}% स्पिन पर आता है। समान RTP (≈ 96%)।',
    buyBtn: 'बोनस पाएँ', buyTitle: 'बोनस पाएँ', buySub: 'चक्र छोड़कर सीधे बोनस खोलें। खेलने योग्य: खेल राशि × गुणक। अनुबिस का क्रोध फिर भी इसे छीन सकता है।',
    buyPrice: 'खेल मूल्य', buyNow: 'पाएँ', buyOn: 'बोनस एक्सेस', resumed: 'अधूरा राउंड: जीत जोड़ दी गई',
    scarabSub: 'तीन स्कारब अंधकार में गिरते हैं। हर एक उस खाने की जीत पाता है जहाँ वह गिरता है।',
    splashDemo: 'डेमो · खेल सिक्के · ज़िम्मेदारी से खेलें', curHint: 'डेमो: 2 टोकन (SC, GC); राशियाँ केवल सांकेतिक हैं।', demoBuild: 'स्थानीय डेमो — यह प्रोडक्शन बिल्ड नहीं है। राशियाँ काल्पनिक हैं।', infoTitle: 'नियम और जीत तालिका', demo: 'खेल सिक्के — डेमो, दिखाई गई राशियाँ असली नहीं हैं।',
    tableCols: { 2: 'जीत' }, currencyL: 'टोकन', handWrongSub: 'श्रृंखला रुकी: मौजूदा स्तर जुड़ गया',
    rules: {
      0: 'एक खेल, एक स्पिन: न्याय का चक्र तय करता है। हर खाना अपना मान × आपकी खेल राशि जीतता है।',
      2: 'अंख: चक्र का मुफ़्त रीस्पिन, कोई अतिरिक्त खेल राशि नहीं।',
      6: function (s) { return s.replace('राउंड की लागत', 'राउंड के खेल मूल्य'); }
    },
    $rules: {
      modesH: 'मोड, खेल मूल्य, RTP और अधिकतम जीत', colCost: 'खेल मूल्य',
      modePlusD: 'चुनी हुई राशि का ×{c} खेल मूल्य। ओरेकल लगभग {pp}% स्पिन में आता है, इसलिए बूस्ट ज़्यादा बार मिलते हैं। RTP वही।',
      modesNote: function (s) { return s.replace('मोड की लागत का नहीं', 'मोड के खेल मूल्य का नहीं').replace('लागत चुनी हुई राशि का गुणज', 'खेल मूल्य चुनी हुई राशि का गुणज'); },
      how: { 1: function (s) { return s.replace('बिना लागत', 'बिना अतिरिक्त खेल राशि के'); }, 4: function (s) { return s.replace('मोड की लागत', 'मोड के खेल मूल्य'); } },
      btn: {
        4: { 1: 'सीधे खुलने वाले बोनस का मेनू खोलता है। हर कार्ड अपना खेल मूल्य दिखाता है; कार्ड चुनने पर वह बोनस शुरू होता है।' },
        5: { 1: 'अगले राउंड के लिए ओरेकल+ चालू या बंद करता है: खेल मूल्य ×{c}, ओरेकल कहीं ज़्यादा बार आता है। खेल मूल्य राशि के नीचे दिखता है।' },
        9: { 0: 'SC / GC', 1: 'प्रदर्शन दोनों टोकन के बीच बदलता है (संख्यात्मक मान वही)।' }
      }
    },
    $replay: { bet: 'खेल राशि', realCost: 'वास्तविक खेल मूल्य', costMult: 'खेल मूल्य' },
    $rgs: {
        errLaunch: 'गेम को साइट से लॉन्च करें। गेम सत्र आवश्यक है।',
      errVal: 'अनुरोध अस्वीकृत: सत्र समाप्त हो गया है या खेल अमान्य है। कृपया साइट से गेम फिर से शुरू करें।',
      errIpb: 'इस खेल के लिए बैलेंस पर्याप्त नहीं है।', errGle: 'सीमा पूरी हो गई: यह खेल अस्वीकृत है।',
      errNet: 'नेटवर्क उपलब्ध नहीं है या प्रतिक्रिया अमान्य है। हो सकता है आपका खेल गिना न गया हो: अपना बैलेंस जाँचें।',
      buyConfirm: '{name} पाएँ? {price} में खेलने योग्य।', buyConfirmTitle: 'बोनस की पुष्टि करें', autoCost: 'प्रति राउंड खेल मूल्य'
    }
  };
})(window.I18N_X, window.I18N_SOCIAL);

/* --- id --- */
(function (X, S) {
  X.tiers.id = ['MENANG', 'MENANG BESAR', 'MENANG EKSTRA', 'MENANG MEGA'];
  X.replay.id = {
    badge: 'REPLAY', start: 'PUTAR', again: 'PUTAR LAGI', playing: 'BERJALAN…', loading: 'Memuat replay…',
    errSum: 'Peristiwa replay tidak sesuai dengan jumlah yang diumumkan server: jumlah server ditampilkan.',
    errLoad: 'Replay ini tidak dapat dimuat.', errParams: 'Parameter replay tidak lengkap (game, version, mode, event, rgs_url).', errFormat: 'Replay ini memiliki format yang tidak dikenal.',
    errNet: 'Kesalahan jaringan: periksa koneksi lalu muat ulang.', bet: 'TARUHAN', betSocial: 'JUMLAH MAIN', realCost: 'BIAYA SEBENARNYA', costMult: 'Biaya', result: 'MENANG', noWin: 'Tidak menang',
    modeStd: 'STANDAR', modePlus: 'ORAKEL+', modeBonus: 'BONUS'
  };
  X.rgs.id = {
    connecting: 'Menghubungkan ke server permainan…', retry: 'Coba lagi', confirm: 'Konfirmasi', cancel: 'Batal',
    errLaunch: 'Luncurkan permainan dari Stake. Sesi permainan diperlukan.',
    errUrl: 'Tidak dapat terhubung: alamat server permainan (rgs_url) atau sesi tidak ada atau tidak valid. Silakan luncurkan ulang permainan dari situs.',
    errAuth: 'Tidak dapat menjangkau server permainan. Periksa koneksimu lalu luncurkan ulang permainan.',
    errVal: 'Permintaan ditolak: sesi telah berakhir atau taruhan tidak valid. Silakan luncurkan ulang permainan dari situs.',
    errIpb: 'Saldo tidak cukup untuk taruhan ini.',
    errGle: 'Batas permainan tercapai: taruhan ini ditolak.',
    errAct: 'Server sedang sibuk. Silakan coba lagi sebentar lagi.',
    errGen: 'Kesalahan server permainan. Silakan coba lagi sebentar lagi.',
    errNet: 'Jaringan tidak tersedia atau respons tidak valid. Taruhanmu mungkin belum diperhitungkan: periksa saldomu.',
    errBook: 'Hasil ronde tidak dapat dibaca. Silakan hubungi dukungan.',
    errIs: 'Sesi tidak valid atau telah berakhir. Silakan jalankan ulang permainan dari situs.',
    errAte: 'Autentikasi telah berakhir. Silakan jalankan ulang permainan dari situs untuk masuk kembali.',
    errLoc: 'Permainan ini tidak tersedia dari lokasi Anda.',
    errMaint: 'Pemeliharaan sedang berlangsung. Silakan coba lagi dalam beberapa menit.',
    errSum: 'Hasil yang ditampilkan tidak sesuai dengan jumlah dari server permainan: jumlah server diterapkan.',
    resuming: 'Melanjutkan ronde yang sedang berjalan…',
    buyConfirm: 'Beli {name} seharga {price}?', buyConfirmTitle: 'KONFIRMASI PEMBELIAN', plusConfirmTitle: 'KONFIRMASI MODE', plusConfirm: 'Aktifkan {name}? Setiap ronde dimainkan seharga {price}.',
    autoTitle: 'MAIN OTOMATIS', autoSub: 'Pilih jumlah ronde dan kondisi berhenti, lalu konfirmasi.',
    autoRounds: 'Jumlah ronde', autoStopWin: 'Berhenti pada kemenangan minimal', autoStart: 'Mulai', autoCost: 'Biaya per ronde'
  };
  X.rules.id = {
    modesH: 'Mode, biaya, RTP, dan kemenangan maksimum', colMode: 'Mode', colCost: 'Biaya', colRtp: 'RTP', colMax: 'Menang maks.', colChance: 'Peluang', colValue: 'Nilai', colBoost: 'Boost', colNumCase: 'Kotak angka', colBonusCase: 'Kotak bonus',
    modeStd: 'Standar', modePlus: 'ORAKEL+', tokScepter: 'TONGKAT ×2 (pada total sejauh ini)', tokKey: 'KUNCI EMAS (+{keys} peti untuk dibuka)', tokSeal: 'SEGEL (menutup ruangan)',
    modeStdD: 'Satu putaran roda penghakiman. Orakel muncul pada sekitar {p} % putaran.',
    modePlusD: 'Berbiaya ×{c} dari jumlah yang dipilih. Orakel muncul pada sekitar {pp} % putaran, sehingga boost lebih sering datang. RTP sama.',
    buyScarabD: 'Langsung membuka bonus Jatuhnya Kumbang, tanpa melewati roda.', buyWeighD: 'Langsung membuka bonus Penimbangan Hati, tanpa melewati roda.',
    buyVaultD: 'Langsung membuka bonus Ruang Harta, tanpa melewati roda.', buyHandD: 'Langsung membuka Amarah Anubis: roda raksasa diputar seketika.',
    modesNote: 'RTP adalah hasil yang diharapkan dari sangat banyak permainan (perhitungan pasti, bukan janji untuk satu sesi). Kemenangan maksimum adalah kelipatan dari jumlah yang dipilih, bukan dari biaya mode, dan dibatasi hingga {m}× di setiap mode. Biaya adalah kelipatan dari jumlah yang dipilih dan ditampilkan sebelum konfirmasi. Amarah Anubis tetap dapat mengambil alih bonus yang dibuka langsung ({h} % dari waktu), seperti pada roda.',
    howH: 'Bagaimana kemenangan terbentuk',
    how: [
      'Tidak ada garis, kombinasi, atau simbol yang harus disejajarkan. Setiap putaran berhenti di salah satu dari {n} kotak roda. Kemenangannya adalah nilai kotak itu × jumlah yang dipilih.',
      'Kotak angka memberi nilainya (×{nums}). Kotak debu tidak memberi apa-apa. ANKH memberi putar ulang gratis: roda berputar lagi tanpa biaya, hingga {chain} kali berturut-turut, dan ronde berakhir di kotak selain ANKH. Kemenangan dari putaran berantai dijumlahkan.',
      'Kotak bonus (Kumbang, Timbang, Harta) memicu bonus yang sesuai: kemenangannya adalah hasil bonus × jumlah yang dipilih. Masing-masing dari ketiganya menempati {one} dari {n} kotak.',
      'Orakel: sebelum putaran, ia memilih satu jenis kotak ({kinds}) dan memberinya boost. Nilai boost tetap tersegel (ditampilkan sebagai ×?) hingga roda berhenti. Jika roda berhenti pada jenis kotak itu, nilai kotak (atau hasil bonus) dikalikan dengan boost. Orakel tidak berbuat apa-apa jika roda berhenti di tempat lain.',
      'Total kemenangan satu ronde dibatasi hingga {m}× jumlah yang dipilih: ketika batas tercapai, ronde berakhir dan kemenangan dibatasi sebesar itu. Animasi kemenangan (WIN, BIG WIN, EXTRA WIN, MEGA WIN, PENGHAKIMAN ILAHI) bergantung pada total ronde ÷ biaya mode; animasi tidak pernah mengubah jumlah yang dimenangkan.'
    ],
    oracleH: 'Boost Orakel', oracleNote: 'Peluang setiap boost saat Orakel memilih jenis kotak.',
    bonusH: 'Ronde bonus: pemicu dan nilai',
    scarabH: 'Jatuhnya Kumbang', scarabP: 'Dipicu oleh kotak Kumbang ({one} dari {n}) atau dibuka langsung. Tiga kumbang jatuh melewati {rows} baris pasak dan masing-masing memenangkan nilai slot tempatnya mendarat (× boost Orakel jika berlaku). Nilai slot dari kiri ke kanan, beserta peluang tiap slot:',
    weighH: 'Penimbangan Hati', weighP: 'Dipicu oleh kotak Timbang ({one} dari {n}) atau dibuka langsung. Dua piringan masing-masing menampilkan satu pengali. Kamu memilih bulu atau hati; piringan yang lebih berat memenangkan pengalinya, yang lebih ringan tidak mendapat apa-apa: peluang satu banding dua. Pasangan pengali diundi dengan peluang berikut:',
    vaultH: 'Ruang Harta', vaultP: 'Dipicu oleh kotak Harta ({one} dari {n}) atau dibuka langsung. Buka peti satu per satu: {picks} di awal. Setiap peti berisi nilai yang ditambahkan ke total, atau TONGKAT (×2 pada total sejauh ini), atau KUNCI EMAS (+{keys} peti lagi untuk dibuka, paling banyak {cap} seluruhnya), atau SEGEL yang menutup ruangan dan mempertahankan total sejauh ini. Tidak ada yang membatalkan atau menunda segel; kunci hanya memperpanjang pilihan. Dua peti pertama tidak pernah berisi segel. Membuka semua peti yang diizinkan menambah hadiah +{fin}×. Isi peti dan peluangnya (setelah dua peti pertama):',
    handH: 'Amarah Anubis', handP: 'Bonus apa pun dapat diambil alih oleh Amarah ({h} % dari waktu pada roda dan untuk bonus yang dibuka langsung; selalu pada mode Amarah). Pilih warna (biru tosca, emas, atau rubi: peluang sama), lalu putar roda raksasa dengan {segs} kotak. Sebuah angka: kemenangan = angka × tingkat. GANDA pada warnamu: semua angka digandakan (tingkat ×2, ×4, ×8 hingga ×{tier}) dan kamu memutar lagi. GANDA pada warna lain: rantai berhenti dan angka terkecil ({min}) × tingkat dimenangkan. Sebuah pita memicu bonus: kemenangan bonus × pengali pita × tingkat. Angka pada roda raksasa: ×{hnums}. Kotak GANDA: {dbl} ({dblc} per warna). Pita: {bands}. Tingkat tidak naik melebihi ×{tier} (kotak GANDA lalu tidak dihitung).',
    cryptH: 'Kuil Pasang Surut (bonus tersembunyi)', cDust: 'DEBU (tidak ada)', cTab: 'TABLET (+ nilai × pasang saat ini)', cTide: 'PASANG (× pasang)', cEclipse: 'GERHANA (× persembahan)', cryptP: 'Bonus yang dimenangkan dapat digantikan oleh Kuil Pasang Surut ({s} % dari waktu, tidak pernah untuk bonus yang dibuka langsung). Sentuh {tiles} tablet pada kisi 3×3 dalam urutan apa pun; urutan tidak mengubah peluang. Persembahan dimulai dari 0 dan pasang dari ×1. Setiap tablet adalah salah satu dari: TABLET (menambahkan nilainya × pasang saat ini ke persembahan), PASANG (mengalikan pasang, hanya untuk tablet yang terbuka sesudahnya), GERHANA (mengalikan persembahan yang sudah terkumpul), atau DEBU (tidak ada). Kemenangannya adalah persembahan akhir × jumlah yang dipilih (minimal ×1 jika tidak ada tablet muncul), dibatasi hingga {m}×. Jenis tablet:',
    retrigH: 'Bonus, putar ulang, dan pemicu ulang',
    retrig: [
      'Tidak ada putaran gratis yang dapat dipicu ulang: setiap bonus dimainkan sekali per pemicu dan hasilnya ditambahkan ke ronde. Tidak ada bonus yang dapat memicu bonus lain: pita Amarah memicu bonus yang tidak pernah kembali ke Amarah.',
      'Satu-satunya fitur yang berulang adalah putar ulang ANKH (lihat di atas). Kotak bonus, Orakel, dan Amarah memiliki peluang yang sama di setiap mode.',
      'Jika koneksi terputus selama ronde, muat ulang permainan: ronde yang sudah diputuskan diselesaikan dan kemenangannya dihitung.'
    ],
    btnH: 'Tombol dan kontrol',
    btn: [
      ['− / +', 'Menurunkan atau menaikkan jumlah yang dipilih (tombol ↓ / ↑). Terkunci selama ronde berjalan.'],
      ['{spin}', 'Memulai ronde dengan jumlah yang dipilih (Spasi atau Enter juga bisa). Saat main otomatis berubah menjadi {stop}.'],
      ['{auto}', 'Pilih jumlah ronde otomatis ({autos}); permainan memainkannya berurutan sampai jumlahnya tercapai, kamu menekan {stop}, batas tercapai, atau saldo tidak cukup. Opsi “Hentikan main otomatis saat bonus” ada di Info. “{stopwin}” di jendela AUTO ({stops} jumlah yang dipilih, atau mati) menghentikan main otomatis begitu sebuah ronde menang setidaknya sebesar itu.'],
      ['{turbo}', 'Ronde lebih cepat: tekan sekali untuk TURBO, dua kali untuk ULTRA (hasil hampir seketika), tiga kali untuk mematikan. Bonus selalu dimainkan dengan kecepatan yang lebih tenang.'],
      ['{buy}', 'Membuka menu bonus yang dibuka langsung. Setiap kartu menampilkan biayanya; memilih kartu memulai bonus itu.'],
      ['{plus}', 'Menyalakan atau mematikan ORAKEL+ untuk ronde berikutnya: biaya ×{c}, Orakel muncul jauh lebih sering. Biaya ditampilkan di bawah jumlah.'],
      ['Suara (speaker)', 'Membuka panel suara: volume, nada tinggi, tinggi nada, suasana musik, warna, dan sakelar yang membisukan semua suara.'],
      ['i (Info)', 'Membuka aturan ini dan pengaturan: batas kerugian, kualitas grafis, efek dikurangi, opsi main otomatis, akses bonus langsung ya/tidak.'],
      ['Bahasa', 'Membuka menu {langs} bahasa yang tersedia (nama asli); memilih salah satu mengganti bahasa permainan.'],
      ['€ / $', 'Mengganti tampilan jumlah antara euro dan dolar (nilai numerik sama).'],
      ['×', 'Menutup jendela yang terbuka (Esc juga bisa).'],
      ['Ketuk / Spasi', 'Dalam bonus: memulai bonus, menjatuhkan kumbang atau blok, memilih peti, kartu, atau warna. Dalam animasi kemenangan: ketuk untuk melewatinya.']
    ],
    discH: 'Penting', disc: 'Kerusakan membatalkan semua kemenangan dan permainan. Koneksi internet yang stabil diperlukan. Jika terputus, muat ulang permainan untuk menyelesaikan ronde yang belum selesai. Hasil yang diharapkan dihitung dari banyak permainan. Tampilan permainan tidak mewakili perangkat fisik apa pun dan hanya bersifat ilustrasi. Kemenangan dihitung berdasarkan jumlah yang diterima dari Remote Game Server dan bukan dari kejadian di peramban web. TM dan © 2026 Engine.'
  };
  S.id = {
    bet: 'MAIN', plusHint: 'ORAKEL+: boost pada ≈ {opp} % putaran · jumlah main ×1,1', cost: 'NILAI MAIN', sessWag: 'Dimainkan',
    rulesPlus: 'Mode ORAKEL+: jumlah main ×1,1, Orakel muncul pada ≈ {opp} % putaran. RTP sama (≈ 96 %).',
    buyBtn: 'AMBIL BONUS', buyTitle: 'AMBIL BONUS', buySub: 'Buka bonus langsung tanpa melewati roda. Dapat dimainkan seharga: jumlah main × pengali. Amarah Anubis tetap dapat mengambil alihnya.',
    buyPrice: 'NILAI MAIN', buyNow: 'AMBIL', buyOn: 'Akses bonus', resumed: 'Ronde terputus: kemenangan ditambahkan',
    scarabSub: 'Tiga kumbang menukik ke dalam gelap. Masing-masing memenangkan kotak tempatnya mendarat.',
    splashDemo: 'Demo · koin permainan · Bermainlah dengan bijak', curHint: 'Demo: 2 token (SC, GC); jumlah hanya perkiraan.', demoBuild: 'Demo lokal — bukan build produksi. Jumlah yang ditampilkan bersifat fiktif.', infoTitle: 'Aturan & Tabel kemenangan', demo: 'Koin permainan — demo, jumlah yang ditampilkan tidak nyata.',
    tableCols: { 2: 'Menang' }, currencyL: 'Token', handWrongSub: 'Rantai berhenti: tingkat saat ini dikumpulkan',
    rules: {
      0: 'Satu permainan, satu putaran: roda penghakiman yang menentukan. Setiap kotak memberi nilainya × jumlah mainmu.',
      2: 'ANKH: putar ulang roda gratis, tanpa jumlah main tambahan.',
      6: function (s) { return s.replace('biaya ronde', 'nilai main ronde'); }
    },
    $rules: {
      modesH: 'Mode, nilai main, RTP, dan kemenangan maksimum', colCost: 'Nilai main',
      modePlusD: 'Nilai main ×{c} dari jumlah yang dipilih. Orakel muncul pada sekitar {pp} % putaran, sehingga boost lebih sering datang. RTP sama.',
      modesNote: function (s) { return s.replace('bukan dari biaya mode', 'bukan dari nilai main mode').replace('Biaya adalah kelipatan', 'Nilai main adalah kelipatan'); },
      how: { 1: function (s) { return s.replace('tanpa biaya', 'tanpa jumlah main tambahan'); }, 4: function (s) { return s.replace('biaya mode', 'nilai main mode'); } },
      btn: {
        4: { 1: 'Membuka menu bonus yang dibuka langsung. Setiap kartu menampilkan nilai mainnya; memilih kartu memulai bonus itu.' },
        5: { 1: 'Menyalakan atau mematikan ORAKEL+ untuk ronde berikutnya: nilai main ×{c}, Orakel muncul jauh lebih sering. Nilai main ditampilkan di bawah jumlah.' },
        9: { 0: 'SC / GC', 1: 'Mengganti tampilan antara kedua token (nilai numerik sama).' }
      }
    },
    $replay: { bet: 'JUMLAH MAIN', realCost: 'NILAI MAIN SEBENARNYA', costMult: 'Nilai main' },
    $rgs: {
        errLaunch: 'Luncurkan permainan dari situs. Sesi permainan diperlukan.',
      errVal: 'Permintaan ditolak: sesi telah berakhir atau permainan tidak valid. Silakan luncurkan ulang permainan dari situs.',
      errIpb: 'Saldo tidak cukup untuk permainan ini.', errGle: 'Batas tercapai: permainan ini ditolak.',
      errNet: 'Jaringan tidak tersedia atau respons tidak valid. Permainanmu mungkin belum diperhitungkan: periksa saldomu.',
      buyConfirm: 'Ambil {name}? Dimainkan seharga {price}.', buyConfirmTitle: 'KONFIRMASI BONUS', autoCost: 'Nilai main per ronde'
    }
  };
})(window.I18N_X, window.I18N_SOCIAL);

/* --- ja --- */
(function (X, S) {
  X.tiers.ja = ['勝利', '大勝利', '特大勝利', 'メガ勝利', '神の審判'];
  X.replay.ja = {
    badge: 'リプレイ', start: '再生', again: 'もう一度再生', playing: '再生中…', loading: 'リプレイを読み込み中…',
    errLoad: 'このリプレイを読み込めませんでした。', errParams: 'リプレイのパラメータが不足しています (game, version, mode, event, rgs_url)。', errFormat: 'このリプレイの形式は不明です。',
    errNet: 'ネットワークエラー: 接続を確認して再読み込みしてください。', bet: 'ベット', betSocial: 'プレイ額', realCost: '実際のコスト', costMult: 'コスト', result: '勝利', noWin: '勝利なし',
    modeStd: 'スタンダード', modePlus: '神託+', modeBonus: 'ボーナス'
  };
  X.rgs.ja = {
    connecting: 'ゲームサーバーに接続中…', retry: '再試行', confirm: '確認', cancel: 'キャンセル',
    errLaunch: 'Stakeからゲームを起動してください。ゲームセッションが必要です。',
    errUrl: '接続できません: ゲームサーバーのアドレス (rgs_url) またはセッションがないか、無効です。サイトからゲームを起動し直してください。',
    errAuth: 'ゲームサーバーに接続できません。接続を確認してゲームを起動し直してください。',
    errVal: 'リクエストが拒否されました: セッションの有効期限が切れたか、ベットが無効です。サイトからゲームを起動し直してください。',
    errIpb: 'このベットには残高が足りません。',
    errGle: 'ゲームの上限に達しました: このベットは拒否されました。',
    errAct: 'サーバーが混み合っています。しばらくしてからもう一度お試しください。',
    errGen: 'ゲームサーバーのエラーです。しばらくしてからもう一度お試しください。',
    errNet: 'ネットワークが利用できないか、応答が無効です。ベットが反映されていない可能性があります: 残高をご確認ください。',
    errBook: 'ラウンドの結果を読み取れませんでした。サポートにお問い合わせください。',
    buyConfirm: '{name} を {price} で購入しますか?', buyConfirmTitle: '購入の確認', plusConfirmTitle: 'モードの確認', plusConfirm: '{name} をオンにしますか? 各ラウンドは {price} でプレイされます。',
    autoTitle: 'オートプレイ', autoSub: 'ラウンド数と停止条件を選んで、確認してください。',
    autoRounds: 'ラウンド数', autoStopWin: '次の勝利額以上で停止', autoStart: '開始', autoCost: '1ラウンドあたりのコスト'
  };
  X.rules.ja = {
    modesH: 'モード、コスト、RTP、最大勝利', colMode: 'モード', colCost: 'コスト', colRtp: 'RTP', colMax: '最大勝利', colChance: '確率', colValue: '値', colBoost: 'ブースト', colNumCase: '数字マス', colBonusCase: 'ボーナスマス',
    modeStd: 'スタンダード', modePlus: '神託+', tokScepter: '王笏 ×2 (ここまでの合計に対して)', tokKey: '金の鍵 (開ける宝箱が +{keys})', tokSeal: '封印 (部屋を閉じる)',
    modeStdD: '審判の輪を1回転させます。神託はおよそ {p}% のスピンで現れます。',
    modePlusD: '選択額の ×{c} かかります。神託はおよそ {pp}% のスピンで現れるので、ブーストがより頻繁に出ます。RTPは同じです。',
    buyScarabD: '輪を通さず、スカラベの落下ボーナスを直接開きます。', buyWeighD: '輪を通さず、心臓の秤ボーナスを直接開きます。',
    buyVaultD: '輪を通さず、財宝の間ボーナスを直接開きます。', buyHandD: 'アヌビスの怒りを直接開きます: 巨大な輪がすぐに回ります。',
    modesNote: 'RTPは非常に多くのプレイにわたる期待還元率です (正確な計算であり、1回のセッションの約束ではありません)。最大勝利は選択額の倍数で、モードのコストの倍数ではなく、すべてのモードで {m}× に制限されます。コストは選択額の倍数で、確定する前に表示されます。直接開いたボーナスも、輪の上と同じように、アヌビスの怒りに奪われることがあります ({h}% の確率)。',
    howH: '勝利の仕組み',
    how: [
      '揃える勝利ラインも、組み合わせも、シンボルもありません。スピンは輪の {n} 個のマスのどれかで止まります。勝利はそのマスの値 × 選択額です。',
      '数字マスはその値 (×{nums}) を獲得します。塵のマスは何も獲得できません。アンクは無料のリスピンをもたらします: 輪はコストなしでもう一度回り、最大 {chain} 回連続し、アンク以外のマスで終了します。連続したスピンの勝利は合算されます。',
      'ボーナスマス (スカラベ、秤、財宝) は対応するボーナスを起動します: 勝利はボーナスの結果 × 選択額です。3種類それぞれが {n} マス中 {one} マスを占めます。',
      '神託: スピンの前にマスの種類 ({kinds}) を1つ選び、ブーストを与えます。ブーストの値は輪が止まるまで封印されたまま (×? と表示) です。輪がその種類のマスで止まると、マスの値 (またはボーナスの結果) にブーストが掛かります。輪が別の場所で止まった場合、神託は何もしません。',
      '1ラウンドの合計勝利は選択額の {m}× に制限されます: 上限に達するとラウンドは終了し、勝利はその額に制限されます。勝利演出 (WIN、BIG WIN、EXTRA WIN、MEGA WIN、DIVINE JUDGEMENT) はラウンドの合計 ÷ モードのコストで決まり、獲得額を変えることはありません。'
    ],
    oracleH: '神託のブースト', oracleNote: '神託がマスの種類を選ぶときの各ブーストの確率。',
    bonusH: 'ボーナスラウンド: 起動条件と値',
    scarabH: 'スカラベの落下', scarabP: 'スカラベのマス ({n} 個中 {one} 個) で起動するか、直接開きます。3匹のスカラベが {rows} 段の釘の間を落ち、それぞれが落ちたスロットの値を獲得します (該当すれば × 神託のブースト)。スロットの値を左から右へ、各スロットの確率とともに示します:',
    weighH: '心臓の秤', weighP: '秤のマス ({n} 個中 {one} 個) で起動するか、直接開きます。2つの皿にそれぞれ倍率が表示されます。羽根か心臓を選びます。重い皿はその倍率を獲得し、軽い皿は何も得られません: 2分の1の確率です。倍率の組は次の確率で抽選されます:',
    vaultH: '財宝の間', vaultP: '財宝のマス ({n} 個中 {one} 個) で起動するか、直接開きます。宝箱を1つずつ開けます: 最初は {picks}。各宝箱には、合計に加算される値、王笏 (ここまでの合計 ×2)、金の鍵 (さらに +{keys} 個の宝箱、合計で最大 {cap} 個)、または部屋を閉じてここまでの合計を保つ封印のいずれかが入っています。封印を取り消したり遅らせたりするものはありません。鍵は選択を延ばすだけです。最初の2個の宝箱に封印が入ることはありません。許可されたすべての宝箱を開けると +{fin}× の特典が加わります。宝箱の中身と確率 (最初の2個の後):',
    handH: 'アヌビスの怒り', handP: 'どのボーナスも怒りに奪われることがあります (輪の上と直接開いたボーナスでは {h}% の確率。怒りモードでは常時)。色 (ターコイズ、ゴールド、ルビー: 確率は同じ) を選び、{segs} マスの巨大な輪を回します。数字: 勝利 = 数字 × ティア。自分の色のダブル: すべての数字が2倍になり (ティア ×2、×4、×8、×{tier} まで)、もう一度回します。別の色のダブル: 連鎖は終わり、最小の数字 ({min}) × ティアを獲得します。帯はボーナスを起動します: ボーナスの勝利 × 帯の倍率 × ティア。巨大な輪の数字: ×{hnums}。ダブルのマス: {dbl} (1色あたり {dblc})。帯: {bands}。ティアは ×{tier} を超えません (その後ダブルのマスは数えられません)。',
    cryptH: '潮の聖域 (隠しボーナス)', cDust: '塵 (何もなし)', cTab: '石板 (+ 値 × 現在の潮)', cTide: '潮 (× 潮)', cEclipse: '日食 (× 供物)', cryptP: '獲得したボーナスは潮の聖域に置き換わることがあります ({s}% の確率。直接開いたボーナスでは起こりません)。3×3 のグリッドにある {tiles} 枚の石板を好きな順にタッチします。順序は確率を変えません。供物は 0 から、潮は ×1 から始まります。各石板は次のいずれかです: 石板 (その値 × 現在の潮を供物に加える)、潮 (潮を掛ける。その後に開く石板にのみ有効)、日食 (集まった供物を掛ける)、塵 (何もなし)。勝利は最終的な供物 × 選択額です (石板が1枚も出なければ最低 ×1)。上限は {m}×。石板の種類:',
    retrigH: 'ボーナス、リスピン、再起動',
    retrig: [
      '再起動できる無料スピンはありません: 各ボーナスは起動ごとに1回プレイされ、その結果がラウンドに加算されます。ボーナスが別のボーナスを起動することはありません: 怒りの帯は、怒りに戻ることのないボーナスを起動します。',
      '繰り返される機能はアンクのリスピンだけです (上記参照)。ボーナスマス、神託、怒りの確率はどのモードでも同じです。',
      'ラウンド中に接続が切れた場合は、ゲームを再読み込みしてください: すでに決まっているラウンドは完了し、その勝利は確定されます。'
    ],
    btnH: 'ボタンと操作',
    btn: [
      ['− / +', '選択額を減らす・増やす (キー ↓ / ↑)。ラウンド中はロックされます。'],
      ['{spin}', '選択額でラウンドを開始します (スペースまたはEnterでも可)。オートプレイ中は {stop} になります。'],
      ['{auto}', '自動ラウンド数 ({autos}) を選びます。ゲームはその回数に達するか、{stop} を押すか、上限に達するか、残高が足りなくなるまで続けて実行します。「ボーナスでオートプレイを停止」はインフォにあります。 AUTOウィンドウの「{stopwin}」({stops} 選択額、またはオフ) は、1ラウンドの勝ちがその額以上になった時点でオートプレイを止めます。'],
      ['{turbo}', 'ラウンドが速くなります: 1回押すとTURBO、2回でULTRA (ほぼ即座に結果)、3回でオフ。ボーナスは常に落ち着いたペースで進みます。'],
      ['{buy}', '直接開くボーナスのメニューを開きます。各カードにコストが表示され、カードを選ぶとそのボーナスが始まります。'],
      ['{plus}', '次のラウンドから神託+のオン・オフを切り替えます: コスト ×{c}、神託がはるかに頻繁に現れます。コストは金額の下に表示されます。'],
      ['サウンド (スピーカー)', 'サウンドパネルを開きます: 音量、高音、ピッチ、音楽の雰囲気、色調、すべての音をミュートするスイッチ。'],
      ['i (インフォ)', 'このルールと設定を開きます: 損失上限、グラフィック品質、エフェクト軽減、オートプレイの設定、ボーナス直接アクセスのオン・オフ。'],
      ['言語', '利用可能な{langs}言語のメニューを開きます (各言語の表記)。選ぶとゲームの言語が切り替わります。'],
      ['€ / $', '金額の表示をユーロとドルの間で切り替えます (数値は同じ)。'],
      ['×', '開いているウィンドウを閉じます (Escでも可)。'],
      ['タップ / スペース', 'ボーナス中: ボーナスを開始し、スカラベやブロックを落とし、宝箱・カード・色を選びます。勝利演出中: タップでスキップします。']
    ],
    discH: '重要', disc: '不具合があった場合、すべての勝利とプレイは無効になります。安定したインターネット接続が必要です。切断された場合は、ゲームを再読み込みして未完了のラウンドを終了してください。期待還元率は多数のプレイにわたって計算されます。ゲームの表示は物理的な機器を表すものではなく、説明のためのものです。勝利はウェブブラウザ内のイベントではなく、Remote Game Serverから受け取った金額に基づいて確定されます。TM および © 2026 Engine。'
  };
  S.ja = {
    bet: 'プレイ', plusHint: '神託+: およそ{opp}%の回でブースト · プレイ額 ×1.1', cost: 'プレイ価値', sessWag: 'プレイ総額',
    rulesPlus: '神託+モード: プレイ額 ×1.1、およそ{opp}%の回で神託が現れます。RTPは同じ (約96%)。',
    buyBtn: 'ボーナスを開く', buyTitle: 'ボーナスを開く', buySub: '輪を飛ばしてボーナスを直接開きます。プレイ価値 = プレイ額 × 倍率。アヌビスの怒りに奪われることもあります。',
    buyPrice: 'プレイ価値', buyNow: '開く', buyOn: 'ボーナス直接開放',
    scarabSub: '3匹のスカラベが闇へ落ちる。それぞれ落ちたマスの獲得分を得る。', sayWrong: 'もう一方の皿が重い: 獲得なし',
    splashDemo: 'デモ · プレイ用コイン · 遊びすぎにご注意', curHint: 'デモ：トークン2種（SC、GC）。金額は目安です。', demoBuild: 'ローカルデモ — 本番ビルドではありません。金額は架空です。', infoTitle: 'ルールと獲得表', demo: 'プレイ用コイン — デモです。表示される額は本物ではありません。',
    maxWin: '最大獲得', noWin: '獲得なし', cryptCapped: '最大獲得に到達',
    tableCols: { 2: '獲得' }, currencyL: 'トークン',
    rules: {
      0: '1プレイで1スピン: 審判の輪が決める。各マスはその値 × プレイ額を獲得できる。',
      2: 'アンク: 追加のプレイ額なしで輪をもう一度無料で回す。',
      4: function (s) { return s.replace(/配当/g, '獲得'); },
      5: function (s) { return s.replace(/配当/g, '獲得'); },
      6: function (s) { return s.replace(/配当/g, '獲得').replace('ラウンドのコスト', 'ラウンドのプレイ価値'); }
    },
    $rules: {
      modesH: 'モード、プレイ価値、RTP、最大勝利', colCost: 'プレイ価値',
      modePlusD: '選択額の ×{c} のプレイ価値。神託はおよそ {pp}% のスピンで現れるので、ブーストがより頻繁に出ます。RTPは同じです。',
      modesNote: function (s) { return s.replace('モードのコストの倍数ではなく', 'モードのプレイ価値の倍数ではなく').replace('コストは選択額の倍数', 'プレイ価値は選択額の倍数'); },
      how: { 1: function (s) { return s.replace('コストなしで', '追加のプレイ額なしで'); }, 4: function (s) { return s.replace('モードのコスト', 'モードのプレイ価値'); } },
      btn: {
        4: { 1: '直接開くボーナスのメニューを開きます。各カードにプレイ価値が表示され、カードを選ぶとそのボーナスが始まります。' },
        5: { 1: '次のラウンドから神託+のオン・オフを切り替えます: プレイ価値 ×{c}、神託がはるかに頻繁に現れます。プレイ価値は金額の下に表示されます。' },
        9: { 0: 'SC / GC', 1: '表示を2種類のトークンの間で切り替えます (数値は同じ)。' }
      }
    },
    $replay: { bet: 'プレイ額', realCost: '実際のプレイ価値', costMult: 'プレイ価値' },
    $rgs: {
        errLaunch: 'サイトからゲームを起動してください。ゲームセッションが必要です。',
      errVal: 'リクエストが拒否されました: セッションの有効期限が切れたか、プレイが無効です。サイトからゲームを起動し直してください。',
      errIpb: 'このプレイには残高が足りません。', errGle: '上限に達しました: このプレイは拒否されました。',
      errNet: 'ネットワークが利用できないか、応答が無効です。プレイが反映されていない可能性があります: 残高をご確認ください。',
      buyConfirm: '{name} を開きますか? プレイ価値は {price} です。', buyConfirmTitle: 'ボーナスの確認', autoCost: '1ラウンドあたりのプレイ価値'
    }
  };
})(window.I18N_X, window.I18N_SOCIAL);

/* --- ko --- */
(function (X, S) {
  X.tiers.ko = ['승리', '대승리', '특대 승리', '메가 승리', '신성한 심판'];
  X.replay.ko = {
    badge: '리플레이', start: '재생', again: '다시 재생', playing: '재생 중…', loading: '리플레이를 불러오는 중…',
    errLoad: '이 리플레이를 불러올 수 없습니다.', errParams: '리플레이 매개변수가 없습니다 (game, version, mode, event, rgs_url).', errFormat: '이 리플레이의 형식을 알 수 없습니다.',
    errNet: '네트워크 오류: 연결을 확인하고 다시 불러오세요.', bet: '베팅', betSocial: '플레이 금액', realCost: '실제 비용', costMult: '비용', result: '승리', noWin: '당첨 없음',
    modeStd: '스탠다드', modePlus: '신탁+', modeBonus: '보너스'
  };
  X.rgs.ko = {
    connecting: '게임 서버에 연결하는 중…', retry: '다시 시도', confirm: '확인', cancel: '취소',
    errLaunch: 'Stake에서 게임을 실행하세요. 게임 세션이 필요합니다.',
    errUrl: '연결할 수 없습니다: 게임 서버 주소 (rgs_url) 또는 세션이 없거나 올바르지 않습니다. 사이트에서 게임을 다시 실행해 주세요.',
    errAuth: '게임 서버에 연결할 수 없습니다. 연결을 확인하고 게임을 다시 실행해 주세요.',
    errVal: '요청이 거부되었습니다: 세션이 만료되었거나 베팅이 올바르지 않습니다. 사이트에서 게임을 다시 실행해 주세요.',
    errIpb: '이 베팅에 필요한 잔액이 부족합니다.',
    errGle: '게임 한도에 도달했습니다: 이 베팅은 거부되었습니다.',
    errAct: '서버가 바쁩니다. 잠시 후 다시 시도해 주세요.',
    errGen: '게임 서버 오류입니다. 잠시 후 다시 시도해 주세요.',
    errNet: '네트워크를 사용할 수 없거나 응답이 올바르지 않습니다. 베팅이 반영되지 않았을 수 있습니다: 잔액을 확인해 주세요.',
    errBook: '라운드 결과를 읽을 수 없습니다. 고객 지원에 문의해 주세요.',
    buyConfirm: '{name}을(를) {price}에 구매할까요?', buyConfirmTitle: '구매 확인', plusConfirmTitle: '모드 확인', plusConfirm: '{name}을(를) 켤까요? 각 라운드는 {price}(으)로 플레이됩니다.',
    autoTitle: '자동 플레이', autoSub: '라운드 수와 중지 조건을 선택한 다음 확인하세요.',
    autoRounds: '라운드 수', autoStopWin: '다음 당첨 이상에서 중지', autoStart: '시작', autoCost: '라운드당 비용'
  };
  X.rules.ko = {
    modesH: '모드, 비용, RTP, 최대 당첨', colMode: '모드', colCost: '비용', colRtp: 'RTP', colMax: '최대 당첨', colChance: '확률', colValue: '값', colBoost: '부스트', colNumCase: '숫자 칸', colBonusCase: '보너스 칸',
    modeStd: '스탠다드', modePlus: '신탁+', tokScepter: '홀 ×2 (지금까지의 합계에 적용)', tokKey: '금 열쇠 (열 수 있는 상자 +{keys})', tokSeal: '봉인 (방을 닫음)',
    modeStdD: '심판의 바퀴를 한 번 돌립니다. 신탁은 약 {p}%의 스핀에서 나타납니다.',
    modePlusD: '선택 금액의 ×{c}이(가) 듭니다. 신탁이 약 {pp}%의 스핀에서 나타나므로 부스트가 더 자주 나옵니다. RTP는 같습니다.',
    buyScarabD: '바퀴를 거치지 않고 스카라베 낙하 보너스를 바로 엽니다.', buyWeighD: '바퀴를 거치지 않고 심장의 저울 보너스를 바로 엽니다.',
    buyVaultD: '바퀴를 거치지 않고 보물의 방 보너스를 바로 엽니다.', buyHandD: '아누비스의 분노를 바로 엽니다: 거대한 바퀴가 즉시 돌아갑니다.',
    modesNote: 'RTP는 매우 많은 횟수의 플레이에 걸친 기대 환원율입니다 (정확한 계산이며, 한 번의 세션에 대한 약속이 아닙니다). 최대 당첨은 모드 비용이 아니라 선택 금액의 배수이며, 모든 모드에서 {m}×로 제한됩니다. 비용은 선택 금액의 배수이며 확정하기 전에 표시됩니다. 바로 연 보너스도 바퀴에서와 마찬가지로 아누비스의 분노가 가로챌 수 있습니다 ({h}%의 확률).',
    howH: '당첨이 만들어지는 방식',
    how: [
      '맞춰야 하는 당첨 라인, 조합, 심볼은 없습니다. 각 스핀은 바퀴의 {n}개 칸 중 한 곳에서 멈춥니다. 당첨은 그 칸의 값 × 선택 금액입니다.',
      '숫자 칸은 그 값 (×{nums})만큼 당첨됩니다. 먼지 칸은 아무것도 주지 않습니다. 앙크는 무료 리스핀을 줍니다: 바퀴가 비용 없이 다시 돌며, 최대 {chain}번 연속되고, 라운드는 앙크가 아닌 칸에서 끝납니다. 이어진 스핀의 당첨은 합산됩니다.',
      '보너스 칸 (스카라베, 저울, 보물)은 해당 보너스를 시작합니다: 당첨은 보너스 결과 × 선택 금액입니다. 세 종류는 각각 {n}개 칸 중 {one}개를 차지합니다.',
      '신탁: 스핀 전에 칸의 종류 ({kinds}) 하나를 골라 부스트를 부여합니다. 부스트 값은 바퀴가 멈출 때까지 봉인된 채 (×?로 표시) 남습니다. 바퀴가 그 종류의 칸에서 멈추면 칸의 값 (또는 보너스 결과)에 부스트가 곱해집니다. 바퀴가 다른 곳에서 멈추면 신탁은 아무 일도 하지 않습니다.',
      '한 라운드의 총 당첨은 선택 금액의 {m}×로 제한됩니다: 한도에 도달하면 라운드가 끝나고 당첨은 그 한도로 제한됩니다. 당첨 연출 (WIN, BIG WIN, EXTRA WIN, MEGA WIN, DIVINE JUDGEMENT)은 라운드 합계 ÷ 모드 비용에 따라 달라지며, 당첨 금액을 바꾸지 않습니다.'
    ],
    oracleH: '신탁의 부스트', oracleNote: '신탁이 칸의 종류를 고를 때 각 부스트의 확률.',
    bonusH: '보너스 라운드: 시작 조건과 값',
    scarabH: '스카라베 낙하', scarabP: '스카라베 칸 ({n}개 중 {one}개)으로 시작되거나 바로 열립니다. 스카라베 세 마리가 {rows}줄의 못 사이로 떨어지고, 각각 떨어진 홈의 값만큼 당첨됩니다 (해당되면 × 신탁의 부스트). 왼쪽에서 오른쪽으로 홈의 값과 각 홈의 확률:',
    weighH: '심장의 저울', weighP: '저울 칸 ({n}개 중 {one}개)으로 시작되거나 바로 열립니다. 두 접시에 각각 배수가 표시됩니다. 깃털이나 심장을 고릅니다. 더 무거운 접시는 그 배수만큼 당첨되고, 더 가벼운 접시는 아무것도 받지 못합니다: 2분의 1 확률입니다. 배수 쌍은 다음 확률로 추첨됩니다:',
    vaultH: '보물의 방', vaultP: '보물 칸 ({n}개 중 {one}개)으로 시작되거나 바로 열립니다. 상자를 하나씩 엽니다: 처음에는 {picks}개. 각 상자에는 합계에 더해지는 값, 홀 (지금까지의 합계 ×2), 금 열쇠 (상자 +{keys}개 추가, 최대 총 {cap}개), 또는 방을 닫고 지금까지의 합계를 지키는 봉인 중 하나가 들어 있습니다. 봉인을 취소하거나 늦추는 것은 없습니다. 열쇠는 선택을 늘릴 뿐입니다. 처음 두 상자에는 봉인이 들어 있지 않습니다. 허용된 모든 상자를 열면 +{fin}×의 보너스가 더해집니다. 상자의 내용과 확률 (처음 두 상자 이후):',
    handH: '아누비스의 분노', handP: '어떤 보너스든 분노가 가로챌 수 있습니다 (바퀴와 바로 연 보너스에서는 {h}%의 확률, 분노 모드에서는 항상). 색상 (터키석, 금색, 루비: 확률 동일)을 고른 다음 {segs}칸의 거대한 바퀴를 돌립니다. 숫자: 당첨 = 숫자 × 단계. 내 색상의 더블: 모든 숫자가 두 배가 되고 (단계 ×2, ×4, ×8, 최대 ×{tier}) 다시 돌립니다. 다른 색상의 더블: 연쇄가 끝나고 가장 작은 숫자 ({min}) × 단계를 얻습니다. 띠는 보너스를 시작합니다: 보너스 당첨 × 띠 배수 × 단계. 거대한 바퀴의 숫자: ×{hnums}. 더블 칸: {dbl}개 (색상당 {dblc}개). 띠: {bands}. 단계는 ×{tier}를 넘지 않습니다 (이후 더블 칸은 계산되지 않습니다).',
    cryptH: '조수의 성소 (숨겨진 보너스)', cDust: '먼지 (없음)', cTab: '석판 (+ 값 × 현재 조수)', cTide: '조수 (× 조수)', cEclipse: '일식 (× 제물)', cryptP: '획득한 보너스는 조수의 성소로 대체될 수 있습니다 ({s}%의 확률, 바로 연 보너스에서는 절대 없음). 3×3 격자의 석판 {tiles}개를 원하는 순서로 터치하세요. 순서는 확률을 바꾸지 않습니다. 제물은 0에서, 조수는 ×1에서 시작합니다. 각 석판은 다음 중 하나입니다: 석판 (값 × 현재 조수를 제물에 더함), 조수 (조수에 곱함, 그 뒤에 열리는 석판에만 적용), 일식 (모인 제물에 곱함), 먼지 (없음). 당첨은 최종 제물 × 선택 금액입니다 (석판이 하나도 나오지 않으면 최소 ×1). 최대 {m}×로 제한됩니다. 석판의 종류:',
    retrigH: '보너스, 리스핀, 재시작',
    retrig: [
      '다시 시작할 수 있는 무료 스핀은 없습니다: 각 보너스는 시작될 때마다 한 번 플레이되며 그 결과가 라운드에 더해집니다. 어떤 보너스도 다른 보너스를 시작할 수 없습니다: 분노의 띠는 분노로 되돌아오지 않는 보너스를 시작합니다.',
      '반복되는 기능은 앙크 리스핀뿐입니다 (위 참조). 보너스 칸, 신탁, 분노의 확률은 모든 모드에서 같습니다.',
      '라운드 도중 연결이 끊기면 게임을 다시 불러오세요: 이미 결정된 라운드는 마무리되고 당첨이 정산됩니다.'
    ],
    btnH: '버튼과 조작',
    btn: [
      ['− / +', '선택 금액을 줄이거나 늘립니다 (키 ↓ / ↑). 라운드 중에는 잠깁니다.'],
      ['{spin}', '선택 금액으로 라운드를 시작합니다 (스페이스나 Enter도 가능). 자동 플레이 중에는 {stop}으로 바뀝니다.'],
      ['{auto}', '자동 라운드 수 ({autos})를 선택하세요. 게임은 정해진 수에 도달하거나, {stop}을 누르거나, 한도에 도달하거나, 잔액이 부족할 때까지 라운드를 이어서 진행합니다. “보너스에서 자동 플레이 중지” 옵션은 정보에 있습니다. AUTO 창의 “{stopwin}” ({stops} 선택 금액, 또는 끔)은 한 라운드가 그 이상을 당첨되는 즉시 자동 플레이를 멈춥니다.'],
      ['{turbo}', '더 빠른 라운드: 한 번 누르면 TURBO, 두 번은 ULTRA (거의 즉시 결과), 세 번은 끄기. 보너스는 항상 더 차분한 속도로 진행됩니다.'],
      ['{buy}', '바로 여는 보너스 메뉴를 엽니다. 각 카드에 비용이 표시되며, 카드를 고르면 그 보너스가 시작됩니다.'],
      ['{plus}', '다음 라운드부터 신탁+를 켜거나 끕니다: 비용 ×{c}, 신탁이 훨씬 자주 나타납니다. 비용은 금액 아래에 표시됩니다.'],
      ['사운드 (스피커)', '사운드 패널을 엽니다: 볼륨, 고음, 피치, 음악 분위기, 색조, 모든 소리를 끄는 스위치.'],
      ['i (정보)', '이 규칙과 설정을 엽니다: 손실 한도, 그래픽 품질, 효과 줄이기, 자동 플레이 옵션, 보너스 바로 열기 켜기/끄기.'],
      ['언어', '사용 가능한 {langs}개 언어 메뉴를 엽니다 (각 언어의 이름). 하나를 고르면 게임 언어가 바뀝니다.'],
      ['€ / $', '금액 표시를 유로와 달러 사이에서 전환합니다 (숫자 값은 동일).'],
      ['×', '열려 있는 창을 닫습니다 (Esc도 가능).'],
      ['탭 / 스페이스', '보너스에서: 보너스를 시작하고, 스카라베나 블록을 떨어뜨리고, 상자, 카드, 색상을 고릅니다. 당첨 연출에서: 탭하면 건너뜁니다.']
    ],
    discH: '중요', disc: '오작동 시 모든 당첨과 플레이는 무효가 됩니다. 안정적인 인터넷 연결이 필요합니다. 연결이 끊기면 게임을 다시 불러와 끝나지 않은 라운드를 마무리하세요. 기대 환원율은 많은 횟수의 플레이를 기준으로 계산됩니다. 게임 화면은 어떠한 물리적 장치도 나타내지 않으며 설명용입니다. 당첨은 웹 브라우저의 이벤트가 아니라 Remote Game Server에서 받은 금액에 따라 정산됩니다. TM 및 © 2026 Engine.'
  };
  S.ko = {
    bet: '플레이', plusHint: '신탁+: 약 {opp}%의 회전에서 부스트 · 플레이 금액 ×1.1', cost: '플레이 가치', sessWag: '플레이 합계',
    rulesPlus: '신탁+ 모드: 플레이 금액 ×1.1, 약 {opp}%의 회전에서 신탁이 나타납니다. RTP 동일 (약 96%).',
    buyBtn: '보너스 열기', buyTitle: '보너스 열기', buySub: '바퀴를 건너뛰고 보너스를 바로 엽니다. 플레이 가치 = 플레이 금액 × 배수. 아누비스의 분노가 가로챌 수도 있습니다.',
    buyPrice: '플레이 가치', buyNow: '열기', buyOn: '보너스 바로 열기',
    splashDemo: '데모 · 플레이 코인 · 책임감 있게 즐기세요', curHint: '데모: 토큰 2종(SC, GC). 금액은 참고용입니다.', demoBuild: '로컬 데모입니다. 프로덕션 빌드가 아닙니다. 금액은 가상입니다.', infoTitle: '규칙 및 당첨표', demo: '플레이 코인 — 데모입니다. 표시된 금액은 실제가 아닙니다.',
    scarabSub: '스카라베 세 마리가 어둠 속으로 떨어집니다. 각각 떨어진 칸의 당첨을 받습니다.',
    tableCols: { 2: '당첨' }, currencyL: '토큰',
    rules: {
      0: '한 번 플레이하면 한 번 스핀: 심판의 바퀴가 결정합니다. 각 칸은 그 값 × 플레이 금액만큼 당첨됩니다.',
      2: '앙크: 추가 플레이 금액 없이 바퀴를 무료로 다시 돌립니다.',
      6: function (s) { return s.replace('라운드 비용', '라운드 플레이 가치'); }
    },
    $rules: {
      modesH: '모드, 플레이 가치, RTP, 최대 당첨', colCost: '플레이 가치',
      modePlusD: '선택 금액의 ×{c}이(가) 플레이 가치입니다. 신탁이 약 {pp}%의 스핀에서 나타나므로 부스트가 더 자주 나옵니다. RTP는 같습니다.',
      modesNote: function (s) { return s.replace('모드 비용이 아니라', '모드 플레이 가치가 아니라').replace('비용은 선택 금액의 배수', '플레이 가치는 선택 금액의 배수'); },
      how: { 1: function (s) { return s.replace('비용 없이', '추가 플레이 금액 없이'); }, 4: function (s) { return s.replace('모드 비용', '모드 플레이 가치'); } },
      btn: {
        4: { 1: '바로 여는 보너스 메뉴를 엽니다. 각 카드에 플레이 가치가 표시되며, 카드를 고르면 그 보너스가 시작됩니다.' },
        5: { 1: '다음 라운드부터 신탁+를 켜거나 끕니다: 플레이 가치 ×{c}, 신탁이 훨씬 자주 나타납니다. 플레이 가치는 금액 아래에 표시됩니다.' },
        9: { 0: 'SC / GC', 1: '표시를 두 가지 토큰 사이에서 전환합니다 (숫자 값은 동일).' }
      }
    },
    $replay: { bet: '플레이 금액', realCost: '실제 플레이 가치', costMult: '플레이 가치' },
    $rgs: {
        errLaunch: '사이트에서 게임을 실행하세요. 게임 세션이 필요합니다.',
      errVal: '요청이 거부되었습니다: 세션이 만료되었거나 플레이가 올바르지 않습니다. 사이트에서 게임을 다시 실행해 주세요.',
      errIpb: '이 플레이에 필요한 잔액이 부족합니다.', errGle: '한도에 도달했습니다: 이 플레이는 거부되었습니다.',
      errNet: '네트워크를 사용할 수 없거나 응답이 올바르지 않습니다. 플레이가 반영되지 않았을 수 있습니다: 잔액을 확인해 주세요.',
      buyConfirm: '{name}을(를) 열까요? 플레이 가치는 {price}입니다.', buyConfirmTitle: '보너스 확인', autoCost: '라운드당 플레이 가치'
    }
  };
})(window.I18N_X, window.I18N_SOCIAL);

/* --- pl --- */
(function (X, S) {
  X.tiers.pl = ['WYGRANA', 'DUŻA WYGRANA', 'EXTRA WYGRANA', 'MEGA WYGRANA'];
  X.replay.pl = {
    badge: 'POWTÓRKA', start: 'ODTWÓRZ', again: 'ODTWÓRZ PONOWNIE', playing: 'TRWA…', loading: 'Wczytywanie powtórki…',
    errSum: 'Zdarzenia powtórki nie zgadzają się z kwotą podaną przez serwer: wyświetlana jest kwota serwera.',
    errLoad: 'Nie udało się wczytać tej powtórki.', errParams: 'Brak parametrów powtórki (game, version, mode, event, rgs_url).', errFormat: 'Ta powtórka ma nieznany format.',
    errNet: 'Błąd sieci: sprawdź połączenie i wczytaj ponownie.', bet: 'ZAKŁAD', betSocial: 'KWOTA GRY', realCost: 'RZECZYWISTY KOSZT', costMult: 'Koszt', result: 'WYGRANA', noWin: 'Brak wygranej',
    modeStd: 'STANDARD', modePlus: 'WYROCZNIA+', modeBonus: 'BONUS'
  };
  X.rgs.pl = {
    connecting: 'Łączenie z serwerem gry…', retry: 'Spróbuj ponownie', confirm: 'Potwierdź', cancel: 'Anuluj',
    errLaunch: 'Uruchom grę ze Stake. Wymagana jest sesja gry.',
    errUrl: 'Nie można się połączyć: adres serwera gry (rgs_url) lub sesja jest nieobecna albo nieprawidłowa. Uruchom grę ponownie ze strony.',
    errAuth: 'Nie można połączyć się z serwerem gry. Sprawdź połączenie i uruchom grę ponownie.',
    errVal: 'Żądanie odrzucone: sesja wygasła lub zakład jest nieprawidłowy. Uruchom grę ponownie ze strony.',
    errIpb: 'Niewystarczające saldo na ten zakład.',
    errGle: 'Osiągnięto limit gry: ten zakład został odrzucony.',
    errAct: 'Serwer jest zajęty. Spróbuj ponownie za chwilę.',
    errGen: 'Błąd serwera gry. Spróbuj ponownie za chwilę.',
    errNet: 'Sieć niedostępna lub nieprawidłowa odpowiedź. Twój zakład mógł nie zostać uwzględniony: sprawdź saldo.',
    errBook: 'Nie można odczytać wyniku rundy. Skontaktuj się z pomocą techniczną.',
    errIs: 'Nieprawidłowa lub wygasła sesja. Uruchom grę ponownie ze strony.',
    errAte: 'Uwierzytelnienie wygasło. Uruchom grę ponownie ze strony, aby zalogować się ponownie.',
    errLoc: 'Ta gra nie jest dostępna w Twojej lokalizacji.',
    errMaint: 'Trwają prace konserwacyjne. Spróbuj ponownie za kilka minut.',
    errSum: 'Wyświetlony wynik nie zgadza się z kwotą z serwera gry: stosowana jest kwota serwera.',
    resuming: 'Wznawianie trwającej rundy…',
    buyConfirm: 'Kupić {name} za {price}?', buyConfirmTitle: 'POTWIERDŹ ZAKUP', plusConfirmTitle: 'POTWIERDŹ TRYB', plusConfirm: 'Włączyć {name}? Każda runda będzie grana za {price}.',
    autoTitle: 'GRA AUTOMATYCZNA', autoSub: 'Wybierz liczbę rund i warunki zatrzymania, a następnie potwierdź.',
    autoRounds: 'Liczba rund', autoStopWin: 'Zatrzymaj przy wygranej co najmniej', autoStart: 'Start', autoCost: 'Koszt rundy'
  };
  X.rules.pl = {
    modesH: 'Tryby, koszt, RTP i maksymalna wygrana', colMode: 'Tryb', colCost: 'Koszt', colRtp: 'RTP', colMax: 'Maks. wygrana', colChance: 'Szansa', colValue: 'Wartość', colBoost: 'Wzmocnienie', colNumCase: 'Pole z liczbą', colBonusCase: 'Pole bonusowe',
    modeStd: 'Standard', modePlus: 'WYROCZNIA+', tokScepter: 'BERŁO ×2 (na dotychczasową sumę)', tokKey: 'ZŁOTY KLUCZ (+{keys} skrzyń do otwarcia)', tokSeal: 'PIECZĘĆ (zamyka komnatę)',
    modeStdD: 'Jeden obrót koła sądu. Wyrocznia pojawia się w około {p} % obrotów.',
    modePlusD: 'Kosztuje ×{c} wybranej kwoty. Wyrocznia pojawia się w około {pp} % obrotów, więc wzmocnienia padają częściej. Ten sam RTP.',
    buyScarabD: 'Otwiera od razu bonus Upadek Skarabeuszy, z pominięciem koła.', buyWeighD: 'Otwiera od razu bonus Ważenie Serca, z pominięciem koła.',
    buyVaultD: 'Otwiera od razu bonus Skarbiec, z pominięciem koła.', buyHandD: 'Otwiera od razu Gniew Anubisa: gigantyczne koło zostaje natychmiast puszczone w ruch.',
    modesNote: 'RTP to oczekiwany zwrot w bardzo dużej liczbie gier (dokładne obliczenie, a nie obietnica dla pojedynczej sesji). Maksymalna wygrana jest wielokrotnością wybranej kwoty, a nie kosztu trybu, i we wszystkich trybach jest ograniczona do {m}×. Koszt jest wielokrotnością wybranej kwoty i jest pokazywany przed potwierdzeniem. Gniew Anubisa nadal może przejąć bonus otwarty bezpośrednio ({h} % przypadków), tak jak na kole.',
    howH: 'Jak powstają wygrane',
    how: [
      'Nie ma linii, kombinacji ani symboli do ustawiania w rzędzie. Każdy obrót zatrzymuje się na jednym z {n} pól koła. Wygrana to wartość tego pola × wybrana kwota.',
      'Pola z liczbą dają swoją wartość (×{nums}). Pola Prochu nie dają nic. ANCH daje darmowy obrót: koło kręci się ponownie bez kosztu, do {chain} razy z rzędu, a runda kończy się na polu innym niż ANCH. Wygrane z łańcucha obrotów się sumują.',
      'Pola bonusowe (Skarabeusze, Ważenie, Skarb) uruchamiają odpowiedni bonus: wygrana to wynik bonusu × wybrana kwota. Każde z trzech zajmuje {one} z {n} pól.',
      'Wyrocznia: przed obrotem wybiera rodzaj pola ({kinds}) i daje mu wzmocnienie. Wartość wzmocnienia pozostaje zapieczętowana (pokazana jako ×?), dopóki koło się nie zatrzyma. Jeśli koło zatrzyma się na tym rodzaju pola, wartość pola (lub wynik bonusu) jest mnożona przez wzmocnienie. Jeśli koło zatrzyma się gdzie indziej, Wyrocznia nic nie robi.',
      'Łączna wygrana w rundzie jest ograniczona do {m}× wybranej kwoty: po osiągnięciu limitu runda się kończy, a wygrana jest do niego ograniczona. Animacje wygranych (WIN, BIG WIN, EXTRA WIN, MEGA WIN, BOSKI WYROK) zależą od sumy rundy ÷ koszt trybu; nigdy nie zmieniają wygranej kwoty.'
    ],
    oracleH: 'Wzmocnienia Wyroczni', oracleNote: 'Szansa każdego wzmocnienia, gdy Wyrocznia wybiera rodzaj pola.',
    bonusH: 'Rundy bonusowe: uruchomienie i wartości',
    scarabH: 'Upadek Skarabeuszy', scarabP: 'Uruchamiany polem Skarabeusze ({one} z {n}) lub otwarty bezpośrednio. Trzy skarabeusze spadają przez {rows} rzędów kołków i każdy wygrywa wartość szczeliny, w której wyląduje (× wzmocnienie Wyroczni, jeśli ma zastosowanie). Wartości szczelin od lewej do prawej wraz z szansą każdej z nich:',
    weighH: 'Ważenie Serca', weighP: 'Uruchamiane polem Ważenie ({one} z {n}) lub otwarte bezpośrednio. Dwie szale pokazują po jednym mnożniku. Wybierasz piórko lub serce; cięższa szala wygrywa swój mnożnik, lżejsza nic: jedna szansa na dwie. Para mnożników jest losowana z takimi szansami:',
    vaultH: 'Skarbiec', vaultP: 'Uruchamiany polem Skarb ({one} z {n}) lub otwarty bezpośrednio. Otwieraj skrzynie jedna po drugiej: na początek {picks}. Każda skrzynia zawiera wartość dodawaną do sumy, albo BERŁO (×2 na dotychczasową sumę), albo ZŁOTY KLUCZ (+{keys} skrzyń więcej, łącznie najwyżej {cap}), albo PIECZĘĆ, która zamyka komnatę i zachowuje dotychczasową sumę. Nic nie anuluje ani nie opóźnia pieczęci; klucz tylko wydłuża wybór. Pierwsze dwie skrzynie nigdy nie zawierają pieczęci. Otwarcie wszystkich dozwolonych skrzyń dodaje premię +{fin}×. Zawartość skrzyń i szanse (po dwóch pierwszych skrzyniach):',
    handH: 'Gniew Anubisa', handP: 'Każdy bonus może zostać przejęty przez Gniew ({h} % przypadków na kole i przy bonusach otwartych bezpośrednio; zawsze w trybie Gniewu). Wybierz kolor (turkus, złoto lub rubin: te same szanse), a następnie zakręć gigantycznym kołem o {segs} polach. Liczba: wygrana = liczba × poziom. PODWÓJNIE w twoim kolorze: wszystkie liczby się podwajają (poziom ×2, ×4, ×8 aż do ×{tier}) i kręcisz ponownie. PODWÓJNIE w innym kolorze: łańcuch się kończy i wygrywasz najmniejszą liczbę ({min}) × poziom. Pas uruchamia bonus: wygrana z bonusu × mnożnik pasa × poziom. Liczby na gigantycznym kole: ×{hnums}. Pola PODWÓJNIE: {dbl} ({dblc} na kolor). Pasy: {bands}. Poziom nie rośnie powyżej ×{tier} (pola PODWÓJNIE przestają się wtedy liczyć).',
    cryptH: 'Sanktuarium Pływów (ukryty bonus)', cDust: 'PYŁ (nic)', cTab: 'TABLICA (+ wartość × bieżący pływ)', cTide: 'PŁYW (× pływ)', cEclipse: 'ZAĆMIENIE (× ofiara)', cryptP: 'Wygrany bonus może zostać zastąpiony przez Sanktuarium Pływów ({s} % przypadków, nigdy przy bonusie otwartym bezpośrednio). Dotknij {tiles} tablic w siatce 3×3 w dowolnej kolejności; kolejność nie zmienia szans. Ofiara zaczyna od 0, a pływ od ×1. Każda tablica jest jedną z: TABLICA (dodaje swoją wartość × bieżący pływ do ofiary), PŁYW (mnoży pływ, tylko dla tablic odsłoniętych po niej), ZAĆMIENIE (mnoży zebraną już ofiarę) lub PROCH (nic). Wygrana to końcowa ofiara × wybrana kwota (co najmniej ×1, jeśli żadna tablica się nie pojawi), ograniczona do {m}×. Rodzaje tablic:',
    retrigH: 'Bonusy, darmowe obroty i ponowne uruchomienia',
    retrig: [
      'Nie ma darmowych obrotów do ponownego uruchomienia: każdy bonus jest rozgrywany raz na uruchomienie, a jego wynik dodaje się do rundy. Żaden bonus nie może uruchomić innego bonusu: pas Gniewu uruchamia bonus, który nigdy nie prowadzi z powrotem do Gniewu.',
      'Jedyną powtarzającą się funkcją jest darmowy obrót ANCH (patrz wyżej). Pola bonusowe, Wyrocznia i Gniew mają te same szanse we wszystkich trybach.',
      'Jeśli połączenie zostanie przerwane w trakcie rundy, wczytaj grę ponownie: już rozstrzygnięta runda zostanie dokończona, a jej wygrana rozliczona.'
    ],
    btnH: 'Przyciski i sterowanie',
    btn: [
      ['− / +', 'Zmniejsza lub zwiększa wybraną kwotę (klawisze ↓ / ↑). Zablokowane podczas rundy.'],
      ['{spin}', 'Rozpoczyna rundę z wybraną kwotą (działa też Spacja lub Enter). Podczas gry automatycznej zmienia się w {stop}.'],
      ['{auto}', 'Wybierz liczbę rund automatycznych ({autos}); gra odtwarza je jedna po drugiej, aż do osiągnięcia liczby, naciśnięcia {stop}, osiągnięcia limitu lub wyczerpania salda. Opcja „Zatrzymaj grę automatyczną przy bonusie” jest w Info. „{stopwin}” w oknie AUTO ({stops} wybranej kwoty lub wyłączone) kończy grę automatyczną, gdy runda wygra co najmniej tyle.'],
      ['{turbo}', 'Szybsze rundy: jedno naciśnięcie to TURBO, dwa to ULTRA (wynik niemal natychmiast), trzecie wyłącza tryb. Bonus zawsze gra się w spokojniejszym tempie.'],
      ['{buy}', 'Otwiera menu bonusów otwieranych bezpośrednio. Każda karta pokazuje swój koszt; wybranie karty uruchamia ten bonus.'],
      ['{plus}', 'Włącza lub wyłącza WYROCZNIA+ w kolejnych rundach: koszt ×{c}, Wyrocznia pojawia się znacznie częściej. Koszt jest widoczny pod kwotą.'],
      ['Dźwięk (głośnik)', 'Otwiera panel dźwięku: głośność, wysokie tony, wysokość dźwięku, nastrój muzyczny, kolorystykę i przełącznik wyciszający wszystkie dźwięki.'],
      ['i (Info)', 'Otwiera te zasady i ustawienia: limit strat, jakość grafiki, ograniczone efekty, opcje gry automatycznej, bezpośredni dostęp do bonusów tak/nie.'],
      ['Język', 'Otwiera menu {langs} dostępnych języków (nazwy własne); wybór zmienia język gry.'],
      ['€ / $', 'Przełącza wyświetlanie kwot między euro a dolarem (ta sama wartość liczbowa).'],
      ['×', 'Zamyka otwarte okno (działa też Esc).'],
      ['Dotknięcie / Spacja', 'W bonusie: uruchamia bonus, upuszcza skarabeusza lub blok, wybiera skrzynię, kartę lub kolor. W animacji wygranej: dotknięcie ją pomija.']
    ],
    discH: 'Ważne', disc: 'Awaria unieważnia wszystkie wygrane i gry. Wymagane jest stabilne połączenie z internetem. W razie rozłączenia wczytaj grę ponownie, aby dokończyć niedokończone rundy. Oczekiwany zwrot jest obliczany na podstawie wielu gier. Wyświetlany obraz gry nie przedstawia żadnego fizycznego urządzenia i służy wyłącznie jako ilustracja. Wygrane są rozliczane według kwoty otrzymanej z Remote Game Server, a nie według zdarzeń w przeglądarce. TM i © 2026 Engine.'
  };
  S.pl = {
    bet: 'GRA', plusHint: 'WYROCZNIA+: wzmocnienie w ≈ {opp} % obrotów · kwota gry ×1,1', cost: 'GRA ZA', sessWag: 'Zagrano',
    rulesPlus: 'Tryb WYROCZNIA+: kwota gry ×1,1, Wyrocznia pojawia się w ≈ {opp} % obrotów. Ten sam RTP (≈ 96 %).',
    buyBtn: 'WEŹ BONUS', buyTitle: 'WEŹ BONUS', buySub: 'Otwórz bonus od razu, z pominięciem koła. Do zagrania za: kwota gry × mnożnik. Gniew Anubisa nadal może go przejąć.',
    buyPrice: 'DO ZAGRANIA ZA', buyNow: 'WEŹ', buyOn: 'Dostęp do bonusów', resumed: 'Przerwana runda: wygrana dodana',
    scarabSub: 'Trzy skarabeusze spadają w ciemność. Każdy wygrywa pole, w które trafi.',
    splashDemo: 'Demo · monety do gry · Graj odpowiedzialnie', curHint: 'Demo: 2 żetony (SC, GC); kwoty tylko orientacyjne.', demoBuild: 'Lokalne demo — to nie wersja produkcyjna. Kwoty są fikcyjne.', infoTitle: 'Zasady i tabela wygranych', demo: 'Monety do gry — demo, wyświetlane kwoty nie są prawdziwe.',
    tableCols: { 2: 'Wygrana' }, currencyL: 'Żeton', handWrongSub: 'Łańcuch się kończy: zebrany obecny poziom',
    rules: {
      0: 'Jedna gra, jeden obrót: decyduje koło sądu. Każde pole daje swoją wartość × twoją kwotę gry.',
      2: 'ANCH: darmowy obrót koła, bez dodatkowej kwoty gry.',
      6: function (s) { return s.replace('koszt rundy', 'wartość gry rundy'); }
    },
    $rules: {
      modesH: 'Tryby, wartość gry, RTP i maksymalna wygrana', colCost: 'Do zagrania za',
      modePlusD: 'Do zagrania za ×{c} wybranej kwoty. Wyrocznia pojawia się w około {pp} % obrotów, więc wzmocnienia padają częściej. Ten sam RTP.',
      modesNote: function (s) { return s.replace('a nie kosztu trybu', 'a nie wartości gry trybu').replace('Koszt jest wielokrotnością', 'Wartość gry jest wielokrotnością'); },
      how: { 1: function (s) { return s.replace('bez kosztu', 'bez dodatkowej kwoty gry'); }, 4: function (s) { return s.replace('koszt trybu', 'wartość gry trybu'); } },
      btn: {
        4: { 1: 'Otwiera menu bonusów otwieranych bezpośrednio. Każda karta pokazuje, za ile można ją zagrać; wybranie karty uruchamia ten bonus.' },
        5: { 1: 'Włącza lub wyłącza WYROCZNIA+ w kolejnych rundach: wartość gry ×{c}, Wyrocznia pojawia się znacznie częściej. Wartość gry jest widoczna pod kwotą.' },
        9: { 0: 'SC / GC', 1: 'Przełącza wyświetlanie między dwoma żetonami (ta sama wartość liczbowa).' }
      }
    },
    $replay: { bet: 'KWOTA GRY', realCost: 'RZECZYWISTA WARTOŚĆ GRY', costMult: 'Wartość gry' },
    $rgs: {
        errLaunch: 'Uruchom grę ze strony. Wymagana jest sesja gry.',
      errVal: 'Żądanie odrzucone: sesja wygasła lub gra jest nieprawidłowa. Uruchom grę ponownie ze strony.',
      errIpb: 'Niewystarczające saldo na tę grę.', errGle: 'Osiągnięto limit: ta gra została odrzucona.',
      errNet: 'Sieć niedostępna lub nieprawidłowa odpowiedź. Twoja gra mogła nie zostać uwzględniona: sprawdź saldo.',
      buyConfirm: 'Wziąć {name}? Do zagrania za {price}.', buyConfirmTitle: 'POTWIERDŹ BONUS', autoCost: 'Wartość gry na rundę'
    }
  };
})(window.I18N_X, window.I18N_SOCIAL);

/* --- pt --- */
(function (X, S) {
  X.tiers.pt = ['GANHO', 'GRANDE GANHO', 'GANHO EXTRA', 'MEGA GANHO'];
  X.replay.pt = {
    badge: 'REPLAY', start: 'REPRODUZIR', again: 'REPRODUZIR DE NOVO', playing: 'EM ANDAMENTO…', loading: 'Carregando o replay…',
    errSum: 'Os eventos do replay não correspondem ao valor anunciado pelo servidor: o valor do servidor é exibido.',
    errLoad: 'Não foi possível carregar este replay.', errParams: 'Faltam parâmetros do replay (game, version, mode, event, rgs_url).', errFormat: 'Este replay tem um formato desconhecido.',
    errNet: 'Erro de rede: verifique a conexão e recarregue.', bet: 'APOSTA', betSocial: 'VALOR JOGADO', realCost: 'CUSTO REAL', costMult: 'Custo', result: 'GANHO', noWin: 'Sem ganho',
    modeStd: 'PADRÃO', modePlus: 'ORÁCULO+', modeBonus: 'BÔNUS'
  };
  X.rgs.pt = {
    connecting: 'Conectando ao servidor de jogo…', retry: 'Tentar de novo', confirm: 'Confirmar', cancel: 'Cancelar',
    errLaunch: 'Inicie o jogo pela Stake. É necessária uma sessão de jogo.',
    errUrl: 'Não foi possível conectar: o endereço do servidor de jogo (rgs_url) ou a sessão está ausente ou é inválido. Reinicie o jogo a partir do site.',
    errAuth: 'Não foi possível acessar o servidor de jogo. Verifique sua conexão e reinicie o jogo.',
    errVal: 'Solicitação recusada: a sessão expirou ou a aposta é inválida. Reinicie o jogo a partir do site.',
    errIpb: 'Saldo insuficiente para esta aposta.',
    errGle: 'Limite de jogo atingido: esta aposta foi recusada.',
    errAct: 'O servidor está ocupado. Tente novamente em instantes.',
    errGen: 'Erro do servidor de jogo. Tente novamente em instantes.',
    errNet: 'Rede indisponível ou resposta inválida. Sua aposta pode não ter sido considerada: verifique seu saldo.',
    errBook: 'Não foi possível ler o resultado da rodada. Entre em contato com o suporte.',
    errIs: 'Sessão inválida ou expirada. Reinicie o jogo a partir do site.',
    errAte: 'A autenticação expirou. Reinicie o jogo a partir do site para entrar novamente.',
    errLoc: 'Este jogo não está disponível na sua localização.',
    errMaint: 'Manutenção em andamento. Tente novamente em alguns minutos.',
    errSum: 'O resultado exibido não corresponde ao valor do servidor do jogo: o valor do servidor é aplicado.',
    resuming: 'Retomando a rodada em andamento…',
    buyConfirm: 'Comprar {name} por {price}?', buyConfirmTitle: 'CONFIRMAR COMPRA', plusConfirmTitle: 'CONFIRMAR MODO', plusConfirm: 'Ativar {name}? Cada rodada será jogada por {price}.',
    autoTitle: 'JOGO AUTOMÁTICO', autoSub: 'Escolha o número de rodadas e as condições de parada e confirme.',
    autoRounds: 'Número de rodadas', autoStopWin: 'Parar com um ganho de pelo menos', autoStart: 'Iniciar', autoCost: 'Custo por rodada'
  };
  X.rules.pt = {
    modesH: 'Modos, custo, RTP e ganho máximo', colMode: 'Modo', colCost: 'Custo', colRtp: 'RTP', colMax: 'Ganho máx.', colChance: 'Chance', colValue: 'Valor', colBoost: 'Boost', colNumCase: 'Casa de número', colBonusCase: 'Casa de bônus',
    modeStd: 'Padrão', modePlus: 'ORÁCULO+', tokScepter: 'CETRO ×2 (sobre o total acumulado)', tokKey: 'CHAVE DE OURO (+{keys} baús para abrir)', tokSeal: 'SELO (fecha a câmara)',
    modeStdD: 'Um giro da roda do julgamento. O Oráculo aparece em cerca de {p} % dos giros.',
    modePlusD: 'Custa ×{c} o valor selecionado. O Oráculo aparece em cerca de {pp} % dos giros, então os boosts saem com mais frequência. Mesmo RTP.',
    buyScarabD: 'Abre diretamente o bônus Queda de Escaravelhos, sem passar pela roda.', buyWeighD: 'Abre diretamente o bônus Pesagem do Coração, sem passar pela roda.',
    buyVaultD: 'Abre diretamente o bônus Câmara do Tesouro, sem passar pela roda.', buyHandD: 'Abre diretamente a Fúria de Anúbis: a roda gigante gira na hora.',
    modesNote: 'O RTP é o retorno esperado ao longo de um número muito grande de partidas (cálculo exato, não uma promessa para uma única sessão). O ganho máximo é um múltiplo do valor selecionado, não do custo do modo, e é limitado a {m}× em todos os modos. O custo é um múltiplo do valor selecionado e é mostrado antes de confirmar. A Fúria de Anúbis ainda pode tomar um bônus aberto diretamente ({h} % das vezes), como na roda.',
    howH: 'Como os ganhos se formam',
    how: [
      'Não há linhas, combinações nem símbolos para alinhar. Cada giro para em uma das {n} casas da roda. O ganho é o valor dessa casa × o valor selecionado.',
      'As casas de número ganham o seu valor (×{nums}). As casas de pó não ganham nada. ANKH dá um giro grátis: a roda gira de novo sem custo, até {chain} vezes seguidas, e a rodada termina em uma casa que não seja ANKH. Os ganhos dos giros encadeados se somam.',
      'As casas de bônus (Escaravelhos, Pesagem, Tesouro) ativam o bônus correspondente: o ganho é o resultado do bônus × o valor selecionado. Cada uma das três ocupa {one} das {n} casas.',
      'Oráculo: antes do giro, ele escolhe um tipo de casa ({kinds}) e lhe dá um boost. O valor do boost fica selado (exibido como ×?) até a roda parar. Se a roda parar nesse tipo de casa, o valor da casa (ou o resultado do bônus) é multiplicado pelo boost. O Oráculo não faz nada se a roda parar em outro lugar.',
      'O ganho total de uma rodada é limitado a {m}× o valor selecionado: ao atingir o limite, a rodada termina e o ganho fica limitado a ele. As animações de ganho (WIN, BIG WIN, EXTRA WIN, MEGA WIN, JULGAMENTO DIVINO) dependem do total da rodada ÷ o custo do modo; elas nunca mudam o valor ganho.'
    ],
    oracleH: 'Boosts do Oráculo', oracleNote: 'Chance de cada boost quando o Oráculo escolhe um tipo de casa.',
    bonusH: 'Rodadas de bônus: ativação e valores',
    scarabH: 'Queda de Escaravelhos', scarabP: 'Ativada pela casa Escaravelhos ({one} de {n}) ou aberta diretamente. Três escaravelhos caem por {rows} fileiras de pinos e cada um ganha o valor da ranhura onde pousa (× o boost do Oráculo, se aplicável). Valores das ranhuras da esquerda para a direita, com a chance de cada uma:',
    weighH: 'Pesagem do Coração', weighP: 'Ativada pela casa Pesagem ({one} de {n}) ou aberta diretamente. Dois pratos mostram cada um um multiplicador. Você escolhe a pena ou o coração; o prato mais pesado ganha o seu multiplicador, o mais leve não ganha nada: uma chance em duas. O par de multiplicadores é sorteado com estas chances:',
    vaultH: 'Câmara do Tesouro', vaultP: 'Ativada pela casa Tesouro ({one} de {n}) ou aberta diretamente. Abra os baús um após o outro: {picks} no início. Cada baú contém um valor somado ao total, ou um CETRO (×2 sobre o total acumulado), ou uma CHAVE DE OURO (+{keys} baús a mais, até {cap} no total), ou o SELO, que fecha a câmara e mantém o total acumulado. Nada cancela ou adia o selo; a chave só aumenta a seleção. Os dois primeiros baús nunca contêm selo. Abrir todos os baús permitidos acrescenta um prêmio de +{fin}×. Conteúdo dos baús e chances (depois dos dois primeiros baús):',
    handH: 'Fúria de Anúbis', handP: 'Qualquer bônus pode ser tomado pela Fúria ({h} % das vezes na roda e nos bônus abertos diretamente; sempre no modo Fúria). Escolha uma cor (turquesa, ouro ou rubi: mesmas chances) e gire a roda gigante de {segs} casas. Um número: ganho = número × nível. DOBRO da sua cor: todos os números dobram (nível ×2, ×4, ×8 até ×{tier}) e você gira de novo. DOBRO de outra cor: a sequência termina e ganha-se o menor número ({min}) × nível. Uma faixa inicia um bônus: ganho do bônus × multiplicador da faixa × nível. Números da roda gigante: ×{hnums}. Casas DOBRO: {dbl} ({dblc} por cor). Faixas: {bands}. O nível não passa de ×{tier} (as casas DOBRO deixam de contar).',
    cryptH: 'Santuário das Marés (bônus oculto)', cDust: 'PÓ (nada)', cTab: 'TÁBUA (+ valor × maré atual)', cTide: 'MARÉ (× a maré)', cEclipse: 'ECLIPSE (× a oferenda)', cryptP: 'Um bônus ganho pode ser substituído pelo Santuário das Marés ({s} % das vezes, nunca para um bônus aberto diretamente). Toque nas {tiles} tábuas de uma grade 3×3 na ordem que quiser; a ordem não muda as chances. A oferenda começa em 0 e a maré em ×1. Cada tábua é uma destas: TÁBUA (soma seu valor × a maré atual à oferenda), MARÉ (multiplica a maré, só para as tábuas reveladas depois), ECLIPSE (multiplica a oferenda já reunida) ou PÓ (nada). O ganho é a oferenda final × o valor selecionado (pelo menos ×1 se nenhuma tábua aparecer), limitado a {m}×. Tipos de tábua:',
    retrigH: 'Bônus, giros grátis e reativações',
    retrig: [
      'Não há giros grátis para reativar: cada bônus é jogado uma vez por ativação e seu resultado é somado à rodada. Nenhum bônus pode ativar outro bônus: uma faixa da Fúria inicia um bônus que nunca volta à Fúria.',
      'O único recurso que se repete é o giro grátis ANKH (veja acima). As casas de bônus, o Oráculo e a Fúria têm as mesmas chances em todos os modos.',
      'Se a conexão cair durante uma rodada, recarregue o jogo: a rodada já decidida é concluída e o seu ganho é liquidado.'
    ],
    btnH: 'Botões e controles',
    btn: [
      ['− / +', 'Diminui ou aumenta o valor selecionado (teclas ↓ / ↑). Bloqueados durante uma rodada.'],
      ['{spin}', 'Inicia uma rodada com o valor selecionado (Espaço ou Enter também funcionam). Durante o jogo automático, vira {stop}.'],
      ['{auto}', 'Escolha o número de rodadas automáticas ({autos}); o jogo as encadeia até atingir o número, você apertar {stop}, um limite ser atingido ou o saldo ficar insuficiente. A opção “Parar o automático no bônus” fica em Info. “{stopwin}” na janela AUTO ({stops} o valor selecionado, ou desligado) encerra o automático assim que uma rodada ganha pelo menos esse valor.'],
      ['{turbo}', 'Rodadas mais rápidas: um toque para TURBO, dois para ULTRA (resultado quase instantâneo), um terceiro para desligar. Um bônus sempre é jogado em ritmo mais calmo.'],
      ['{buy}', 'Abre o menu de bônus abertos diretamente. Cada carta mostra o seu custo; escolher uma carta inicia esse bônus.'],
      ['{plus}', 'Liga ou desliga ORÁCULO+ para as próximas rodadas: custo ×{c}, o Oráculo aparece bem mais vezes. O custo é mostrado sob o valor.'],
      ['Som (alto-falante)', 'Abre o painel de som: volume, agudos, tom, ambiente musical, cores e uma chave que silencia todos os sons.'],
      ['i (Info)', 'Abre estas regras e os ajustes: limite de perda, qualidade gráfica, efeitos reduzidos, opções do automático, acesso direto a bônus sim/não.'],
      ['Idioma', 'Abre o menu dos {langs} idiomas disponíveis (nomes nativos); escolher um troca o idioma do jogo.'],
      ['€ / $', 'Alterna a exibição dos valores entre euro e dólar (mesmo valor numérico).'],
      ['×', 'Fecha a janela aberta (Esc também funciona).'],
      ['Toque / Espaço', 'Em um bônus: inicia o bônus, solta o escaravelho ou o bloco, escolhe um baú, uma carta ou uma cor. Em uma animação de ganho: toque para pulá-la.']
    ],
    discH: 'Importante', disc: 'O mau funcionamento anula todos os ganhos e partidas. É necessária uma conexão de internet estável. Em caso de desconexão, recarregue o jogo para concluir as rodadas inacabadas. O retorno esperado é calculado ao longo de muitas partidas. A tela do jogo não representa nenhum dispositivo físico e serve apenas como ilustração. Os ganhos são liquidados conforme o valor recebido do Remote Game Server e não conforme eventos do navegador. TM e © 2026 Engine.'
  };
  S.pt = {
    bet: 'JOGO', plusHint: 'ORÁCULO+: boost em ≈ {opp} % de los giros · valor jogado ×1,1', cost: 'JOGAR POR', sessWag: 'Jogado',
    rulesPlus: 'Modo ORÁCULO+: valor jogado ×1,1, o Oráculo aparece em ≈ {opp} % de los giros. Mesmo RTP (≈ 96 %).',
    buyBtn: 'OBTER BÔNUS', buyTitle: 'OBTER BÔNUS', buySub: 'Abra um bônus diretamente, sem passar pela roda. Jogável por: valor jogado × multiplicador. A Fúria de Anúbis ainda pode tomá-lo.',
    buyPrice: 'JOGÁVEL POR', buyNow: 'OBTER', buyOn: 'Acesso a bônus', resumed: 'Rodada interrompida: ganho adicionado',
    scarabSub: 'Três escaravelhos mergulham na escuridão. Cada um ganha a casa onde cai.',
    splashDemo: 'Demo · moedas de jogo · Jogue com responsabilidade', curHint: 'Demo: 2 fichas (SC, GC); valores apenas indicativos.', demoBuild: 'Demo local: não é a versão de produção. Os valores são fictícios.', infoTitle: 'Regras e tabela de ganhos', demo: 'Moedas de jogo — demo, os valores exibidos não são reais.',
    tableCols: { 2: 'Ganho' }, currencyL: 'Ficha', handWrongSub: 'A sequência termina: nível atual coletado',
    rules: {
      0: 'Um jogo, um giro: a roda do julgamento decide. Cada casa ganha o seu valor × o valor jogado.',
      2: 'ANKH: giro grátis da roda, sem valor jogado adicional.',
      6: function (s) { return s.replace('custo da rodada', 'valor de jogo da rodada'); }
    },
    $rules: {
      modesH: 'Modos, valor de jogo, RTP e ganho máximo', colCost: 'Jogável por',
      modePlusD: 'Jogável por ×{c} o valor selecionado. O Oráculo aparece em cerca de {pp} % dos giros, então os boosts saem com mais frequência. Mesmo RTP.',
      modesNote: function (s) { return s.replace('não do custo do modo', 'não do valor de jogo do modo').replace('O custo é um múltiplo', 'O valor de jogo é um múltiplo'); },
      how: { 1: function (s) { return s.replace('sem custo', 'sem valor jogado adicional'); }, 4: function (s) { return s.replace('o custo do modo', 'o valor de jogo do modo'); } },
      btn: {
        4: { 1: 'Abre o menu de bônus abertos diretamente. Cada carta mostra por quanto pode ser jogada; escolher uma carta inicia esse bônus.' },
        5: { 1: 'Liga ou desliga ORÁCULO+ para as próximas rodadas: valor de jogo ×{c}, o Oráculo aparece bem mais vezes. O valor de jogo é mostrado sob o valor.' },
        9: { 0: 'SC / GC', 1: 'Alterna a exibição entre as duas fichas (mesmo valor numérico).' }
      }
    },
    $replay: { bet: 'VALOR JOGADO', realCost: 'VALOR DE JOGO REAL', costMult: 'Valor de jogo' },
    $rgs: {
        errLaunch: 'Inicie o jogo pelo site. É necessária uma sessão de jogo.',
      errVal: 'Solicitação recusada: a sessão expirou ou a jogada é inválida. Reinicie o jogo a partir do site.',
      errIpb: 'Saldo insuficiente para esta jogada.', errGle: 'Limite atingido: esta jogada foi recusada.',
      errNet: 'Rede indisponível ou resposta inválida. Sua jogada pode não ter sido considerada: verifique seu saldo.',
      buyConfirm: 'Obter {name}? Jogável por {price}.', buyConfirmTitle: 'CONFIRMAR BÔNUS', autoCost: 'Valor de jogo por rodada'
    }
  };
})(window.I18N_X, window.I18N_SOCIAL);

/* --- ru --- */
(function (X, S) {
  X.tiers.ru = ['ВЫИГРЫШ', 'БОЛЬШОЙ ВЫИГРЫШ', 'ЭКСТРА ВЫИГРЫШ', 'МЕГА ВЫИГРЫШ'];
  X.replay.ru = {
    badge: 'ПОВТОР', start: 'ВОСПРОИЗВЕСТИ', again: 'ЕЩЁ РАЗ', playing: 'ИДЁТ…', loading: 'Загрузка повтора…',
    errSum: 'События повтора не совпадают с суммой, объявленной сервером: показана сумма сервера.',
    errLoad: 'Не удалось загрузить этот повтор.', errParams: 'Не хватает параметров повтора (game, version, mode, event, rgs_url).', errFormat: 'У этого повтора неизвестный формат.',
    errNet: 'Ошибка сети: проверьте соединение и перезагрузите.', bet: 'СТАВКА', betSocial: 'СУММА ИГРЫ', realCost: 'РЕАЛЬНАЯ СТОИМОСТЬ', costMult: 'Стоимость', result: 'ВЫИГРЫШ', noWin: 'Нет выигрыша',
    modeStd: 'СТАНДАРТ', modePlus: 'ОРАКУЛ+', modeBonus: 'БОНУС'
  };
  X.rgs.ru = {
    connecting: 'Подключение к игровому серверу…', retry: 'Повторить', confirm: 'Подтвердить', cancel: 'Отмена',
    errLaunch: 'Запустите игру из Stake. Требуется игровая сессия.',
    errUrl: 'Не удаётся подключиться: адрес игрового сервера (rgs_url) или сессия отсутствует или недействительна. Перезапустите игру с сайта.',
    errAuth: 'Не удаётся связаться с игровым сервером. Проверьте соединение и перезапустите игру.',
    errVal: 'Запрос отклонён: сессия истекла или ставка недействительна. Перезапустите игру с сайта.',
    errIpb: 'Недостаточно средств на балансе для этой ставки.',
    errGle: 'Достигнут игровой лимит: эта ставка отклонена.',
    errAct: 'Сервер занят. Повторите попытку через мгновение.',
    errGen: 'Ошибка игрового сервера. Повторите попытку через мгновение.',
    errNet: 'Сеть недоступна или ответ недействителен. Ваша ставка могла не быть учтена: проверьте баланс.',
    errBook: 'Не удалось прочитать результат раунда. Обратитесь в поддержку.',
    errIs: 'Сессия недействительна или истекла. Перезапустите игру с сайта.',
    errAte: 'Срок аутентификации истёк. Перезапустите игру с сайта, чтобы войти снова.',
    errLoc: 'Эта игра недоступна в вашем регионе.',
    errMaint: 'Идут технические работы. Повторите попытку через несколько минут.',
    errSum: 'Показанный результат не совпадает с суммой игрового сервера: применяется сумма сервера.',
    resuming: 'Продолжаем текущий раунд…',
    buyConfirm: 'Купить {name} за {price}?', buyConfirmTitle: 'ПОДТВЕРДИТЕ ПОКУПКУ', plusConfirmTitle: 'ПОДТВЕРДИТЕ РЕЖИМ', plusConfirm: 'Включить {name}? Каждый раунд будет сыгран за {price}.',
    autoTitle: 'АВТОИГРА', autoSub: 'Выберите число раундов и условия остановки, затем подтвердите.',
    autoRounds: 'Число раундов', autoStopWin: 'Остановить при выигрыше от', autoStart: 'Старт', autoCost: 'Стоимость раунда'
  };
  X.rules.ru = {
    modesH: 'Режимы, стоимость, RTP и максимальный выигрыш', colMode: 'Режим', colCost: 'Стоимость', colRtp: 'RTP', colMax: 'Макс. выигрыш', colChance: 'Шанс', colValue: 'Значение', colBoost: 'Усиление', colNumCase: 'Клетка с числом', colBonusCase: 'Бонусная клетка',
    modeStd: 'Стандарт', modePlus: 'ОРАКУЛ+', tokScepter: 'СКИПЕТР ×2 (на уже набранную сумму)', tokKey: 'ЗОЛОТОЙ КЛЮЧ (+{keys} сундуков для открытия)', tokSeal: 'ПЕЧАТЬ (закрывает хранилище)',
    modeStdD: 'Одно вращение колеса суда. Оракул появляется примерно в {p} % вращений.',
    modePlusD: 'Стоит ×{c} от выбранной суммы. Оракул появляется примерно в {pp} % вращений, поэтому усиления выпадают чаще. Тот же RTP.',
    buyScarabD: 'Сразу открывает бонус «Падение скарабеев», минуя колесо.', buyWeighD: 'Сразу открывает бонус «Взвешивание сердца», минуя колесо.',
    buyVaultD: 'Сразу открывает бонус «Сокровищница», минуя колесо.', buyHandD: 'Сразу открывает «Ярость Анубиса»: гигантское колесо запускается немедленно.',
    modesNote: 'RTP — это ожидаемый возврат на очень большом числе игр (точный расчёт, а не обещание для отдельной сессии). Максимальный выигрыш кратен выбранной сумме, а не стоимости режима, и ограничен {m}× во всех режимах. Стоимость кратна выбранной сумме и показывается до подтверждения. «Ярость Анубиса» всё равно может перехватить бонус, открытый напрямую ({h} % случаев), как и на колесе.',
    howH: 'Как формируются выигрыши',
    how: [
      'Здесь нет линий, комбинаций и символов, которые нужно выстраивать. Каждое вращение останавливается на одной из {n} клеток колеса. Выигрыш — это значение клетки × выбранная сумма.',
      'Клетки с числами дают своё значение (×{nums}). Клетки праха не дают ничего. АНКХ даёт бесплатное повторное вращение: колесо крутится снова без затрат, до {chain} раз подряд, и раунд заканчивается на клетке, отличной от АНКХ. Выигрыши цепочки вращений суммируются.',
      'Бонусные клетки (Скарабеи, Взвешивание, Сокровище) запускают соответствующий бонус: выигрыш — это результат бонуса × выбранная сумма. Каждая из трёх занимает {one} из {n} клеток.',
      'Оракул: перед вращением он выбирает тип клетки ({kinds}) и даёт ему усиление. Значение усиления остаётся запечатанным (показано как ×?), пока колесо не остановится. Если колесо остановится на этом типе клетки, значение клетки (или результат бонуса) умножается на усиление. Если колесо остановится в другом месте, Оракул ничего не делает.',
      'Общий выигрыш раунда ограничен {m}× от выбранной суммы: при достижении предела раунд заканчивается, а выигрыш ограничивается им. Анимации выигрыша (WIN, BIG WIN, EXTRA WIN, MEGA WIN, БОЖЕСТВЕННЫЙ СУД) зависят от итога раунда ÷ стоимость режима; они никогда не меняют выигранную сумму.'
    ],
    oracleH: 'Усиления Оракула', oracleNote: 'Шанс каждого усиления, когда Оракул выбирает тип клетки.',
    bonusH: 'Бонусные раунды: запуск и значения',
    scarabH: 'Падение скарабеев', scarabP: 'Запускается клеткой «Скарабеи» ({one} из {n}) или открывается напрямую. Три скарабея падают через {rows} рядов штифтов, и каждый выигрывает значение ячейки, в которую приземлится (× усиление Оракула, если оно действует). Значения ячеек слева направо с шансом каждой:',
    weighH: 'Взвешивание сердца', weighP: 'Запускается клеткой «Взвешивание» ({one} из {n}) или открывается напрямую. На двух чашах показано по множителю. Вы выбираете перо или сердце; более тяжёлая чаша выигрывает свой множитель, более лёгкая — ничего: один шанс из двух. Пара множителей разыгрывается с такими шансами:',
    vaultH: 'Сокровищница', vaultP: 'Запускается клеткой «Сокровище» ({one} из {n}) или открывается напрямую. Открывайте сундуки один за другим: сначала {picks}. В каждом сундуке — значение, которое прибавляется к сумме, либо СКИПЕТР (×2 на уже набранную сумму), либо ЗОЛОТОЙ КЛЮЧ (+{keys} сундуков, всего не более {cap}), либо ПЕЧАТЬ, которая закрывает хранилище и сохраняет набранную сумму. Ничто не отменяет и не откладывает печать; ключ лишь удлиняет выбор. В первых двух сундуках печати не бывает никогда. Если открыть все допустимые сундуки, добавляется премия +{fin}×. Содержимое сундуков и шансы (после первых двух сундуков):',
    handH: 'Ярость Анубиса', handP: 'Любой бонус может быть перехвачен Яростью ({h} % случаев на колесе и для бонусов, открытых напрямую; всегда в режиме Ярости). Выберите цвет (бирюза, золото или рубин: шансы одинаковые) и запустите гигантское колесо из {segs} клеток. Число: выигрыш = число × уровень. УДВОЕНИЕ вашего цвета: все числа удваиваются (уровень ×2, ×4, ×8 вплоть до ×{tier}), и вы крутите снова. УДВОЕНИЕ другого цвета: цепочка прерывается, и выигрывается наименьшее число ({min}) × уровень. Полоса запускает бонус: выигрыш бонуса × множитель полосы × уровень. Числа гигантского колеса: ×{hnums}. Клетки УДВОЕНИЯ: {dbl} ({dblc} на каждый цвет). Полосы: {bands}. Уровень не растёт выше ×{tier} (клетки УДВОЕНИЯ после этого не учитываются).',
    cryptH: 'Святилище приливов (скрытый бонус)', cDust: 'ПЫЛЬ (ничего)', cTab: 'ТАБЛИЧКА (+ значение × текущий прилив)', cTide: 'ПРИЛИВ (× прилив)', cEclipse: 'ЗАТМЕНИЕ (× приношение)', cryptP: 'Выигранный бонус может быть заменён Святилищем приливов ({s} % случаев, никогда — для бонуса, открытого напрямую). Коснитесь {tiles} табличек сетки 3×3 в любом порядке; порядок не меняет шансов. Приношение начинается с 0, прилив — с ×1. Каждая табличка — это одно из: ТАБЛИЧКА (добавляет своё значение × текущий прилив к приношению), ПРИЛИВ (умножает прилив, только для табличек, открытых после неё), ЗАТМЕНИЕ (умножает уже собранное приношение) или ПЫЛЬ (ничего). Выигрыш — это итоговое приношение × выбранная сумма (не менее ×1, если ни одна табличка не появилась), не более {m}×. Типы табличек:',
    retrigH: 'Бонусы, повторные вращения и повторный запуск',
    retrig: [
      'Бесплатных вращений, которые можно запустить повторно, нет: каждый бонус разыгрывается один раз за запуск, а его результат прибавляется к раунду. Ни один бонус не может запустить другой бонус: полоса Ярости запускает бонус, который никогда не возвращает к Ярости.',
      'Единственная повторяющаяся функция — повторное вращение АНКХ (см. выше). Бонусные клетки, Оракул и Ярость имеют одинаковые шансы во всех режимах.',
      'Если соединение оборвётся во время раунда, перезагрузите игру: уже решённый раунд будет завершён, а его выигрыш учтён.'
    ],
    btnH: 'Кнопки и управление',
    btn: [
      ['− / +', 'Уменьшает или увеличивает выбранную сумму (клавиши ↓ / ↑). Заблокированы во время раунда.'],
      ['{spin}', 'Запускает раунд с выбранной суммой (работает и пробел или Enter). Во время автоигры превращается в {stop}.'],
      ['{auto}', 'Выберите число автоматических раундов ({autos}); игра проводит их один за другим, пока число не будет достигнуто, вы не нажмёте {stop}, не будет достигнут лимит или баланса не хватит. Опция «Остановить автоигру на бонусе» находится в Инфо. Параметр «{stopwin}» в окне AUTO ({stops} выбранной суммы или выкл.) останавливает автоигру, как только раунд выиграет не меньше этой суммы.'],
      ['{turbo}', 'Более быстрые раунды: одно нажатие — TURBO, два — ULTRA (результат почти мгновенно), третье выключает. Бонус всегда проходит в более спокойном темпе.'],
      ['{buy}', 'Открывает меню бонусов, открываемых напрямую. Каждая карточка показывает свою стоимость; выбор карточки запускает этот бонус.'],
      ['{plus}', 'Включает или выключает ОРАКУЛ+ для следующих раундов: стоимость ×{c}, Оракул появляется заметно чаще. Стоимость показана под суммой.'],
      ['Звук (динамик)', 'Открывает панель звука: громкость, высокие частоты, высота тона, музыкальная атмосфера, цветокоррекция и переключатель, отключающий все звуки.'],
      ['i (Инфо)', 'Открывает эти правила и настройки: лимит потерь, качество графики, сниженные эффекты, параметры автоигры, прямой доступ к бонусам вкл/выкл.'],
      ['Язык', 'Открывает меню из {langs} доступных языков (родные названия); выбор языка меняет язык игры.'],
      ['€ / $', 'Переключает отображение сумм между евро и долларом (то же числовое значение).'],
      ['×', 'Закрывает открытое окно (работает и Esc).'],
      ['Касание / пробел', 'В бонусе: запускает бонус, бросает скарабея или блок, выбирает сундук, карту или цвет. В анимации выигрыша: касание пропускает её.']
    ],
    discH: 'Важно', disc: 'Неисправность аннулирует все выигрыши и игры. Необходимо стабильное интернет-соединение. В случае разрыва соединения перезагрузите игру, чтобы завершить незавершённые раунды. Ожидаемый возврат рассчитывается на большом числе игр. Изображение игры не представляет какое-либо физическое устройство и служит только иллюстрацией. Выигрыши рассчитываются по сумме, полученной от Remote Game Server, а не по событиям в веб-браузере. TM и © 2026 Engine.'
  };
  S.ru = {
    bet: 'ИГРА', plusHint: 'ОРАКУЛ+: усиление в ≈ {opp} % вращений · сумма игры ×1,1', cost: 'ИГРА НА', sessWag: 'Сыграно',
    rulesPlus: 'Режим ОРАКУЛ+: сумма игры ×1,1, Оракул появляется в ≈ {opp} % вращений. Тот же RTP (≈ 96 %).',
    buyBtn: 'ПОЛУЧИТЬ БОНУС', buyTitle: 'ПОЛУЧИТЬ БОНУС', buySub: 'Откройте бонус сразу, минуя колесо. Можно сыграть на: сумма игры × множитель. Ярость Анубиса всё равно может его перехватить.',
    buyPrice: 'ИГРА НА', buyNow: 'ПОЛУЧИТЬ', buyOn: 'Доступ к бонусам', resumed: 'Прерванный раунд: выигрыш добавлен',
    scarabSub: 'Три скарабея падают во тьму. Каждый получает выигрыш клетки, в которую упадёт.',
    splashDemo: 'Демо · игровые монеты · Играйте ответственно', curHint: 'Демо: 2 жетона (SC, GC); суммы ориентировочные.', demoBuild: 'Локальное демо — это не рабочая версия. Суммы условные.', infoTitle: 'Правила и таблица выигрышей', demo: 'Игровые монеты — демо, показанные суммы не настоящие.',
    tableCols: { 2: 'Выигрыш' }, currencyL: 'Жетон',
    rules: {
      0: 'Одна игра, одно вращение: решает колесо суда. Каждая клетка даёт своё значение × вашу сумму игры.',
      2: 'АНКХ: бесплатное повторное вращение колеса, без дополнительной суммы игры.'
    },
    $rules: {
      modesH: 'Режимы, значение игры, RTP и максимальный выигрыш', colCost: 'Игра на',
      modePlusD: 'Игра на ×{c} от выбранной суммы. Оракул появляется примерно в {pp} % вращений, поэтому усиления выпадают чаще. Тот же RTP.',
      modesNote: function (s) { return s.replace('а не стоимости режима', 'а не значению игры режима').replace('Стоимость кратна', 'Значение игры кратно'); },
      how: { 1: function (s) { return s.replace('без затрат', 'без дополнительной суммы игры'); }, 4: function (s) { return s.replace('стоимость режима', 'значение игры режима'); } },
      btn: {
        4: { 1: 'Открывает меню бонусов, открываемых напрямую. Каждая карточка показывает, на сколько в неё можно сыграть; выбор карточки запускает этот бонус.' },
        5: { 1: 'Включает или выключает ОРАКУЛ+ для следующих раундов: значение игры ×{c}, Оракул появляется заметно чаще. Значение игры показано под суммой.' },
        9: { 0: 'SC / GC', 1: 'Переключает отображение между двумя жетонами (то же числовое значение).' }
      }
    },
    $replay: { bet: 'СУММА ИГРЫ', realCost: 'РЕАЛЬНОЕ ЗНАЧЕНИЕ ИГРЫ', costMult: 'Значение игры' },
    $rgs: {
        errLaunch: 'Запустите игру с сайта. Требуется игровая сессия.',
      errVal: 'Запрос отклонён: сессия истекла или игра недействительна. Перезапустите игру с сайта.',
      errIpb: 'Недостаточно средств на балансе для этой игры.', errGle: 'Достигнут лимит: эта игра отклонена.',
      errNet: 'Сеть недоступна или ответ недействителен. Ваша игра могла не быть учтена: проверьте баланс.',
      buyConfirm: 'Получить {name}? Можно сыграть на {price}.', buyConfirmTitle: 'ПОДТВЕРДИТЕ БОНУС', autoCost: 'Значение игры за раунд'
    }
  };
})(window.I18N_X, window.I18N_SOCIAL);

/* --- tr --- */
(function (X, S) {
  X.tiers.tr = ['KAZANÇ', 'BÜYÜK KAZANÇ', 'EKSTRA KAZANÇ', 'MEGA KAZANÇ'];
  X.replay.tr = {
    badge: 'TEKRAR', start: 'OYNAT', again: 'TEKRAR OYNAT', playing: 'OYNATILIYOR…', loading: 'Tekrar yükleniyor…',
    errSum: 'Tekrar olayları sunucunun bildirdiği tutarla eşleşmiyor: sunucu tutarı gösterilir.',
    errLoad: 'Bu tekrar yüklenemedi.', errParams: 'Tekrar parametreleri eksik (game, version, mode, event, rgs_url).', errFormat: 'Bu tekrarın biçimi bilinmiyor.',
    errNet: 'Ağ hatası: bağlantını kontrol et ve yeniden yükle.', bet: 'BAHİS', betSocial: 'OYUN TUTARI', realCost: 'GERÇEK MALİYET', costMult: 'Maliyet', result: 'KAZANÇ', noWin: 'Kazanç yok',
    modeStd: 'STANDART', modePlus: 'KEHANET+', modeBonus: 'BONUS'
  };
  X.rgs.tr = {
    connecting: 'Oyun sunucusuna bağlanılıyor…', retry: 'Yeniden dene', confirm: 'Onayla', cancel: 'İptal',
    errLaunch: 'Oyunu Stake üzerinden başlatın. Bir oyun oturumu gereklidir.',
    errUrl: 'Bağlanılamıyor: oyun sunucusu adresi (rgs_url) veya oturum eksik ya da geçersiz. Lütfen oyunu siteden yeniden başlat.',
    errAuth: 'Oyun sunucusuna ulaşılamıyor. Bağlantını kontrol et ve oyunu yeniden başlat.',
    errVal: 'İstek reddedildi: oturum süresi doldu veya bahis geçersiz. Lütfen oyunu siteden yeniden başlat.',
    errIpb: 'Bu bahis için bakiye yetersiz.',
    errGle: 'Oyun limitine ulaşıldı: bu bahis reddedildi.',
    errAct: 'Sunucu meşgul. Lütfen birazdan tekrar dene.',
    errGen: 'Oyun sunucusu hatası. Lütfen birazdan tekrar dene.',
    errNet: 'Ağ kullanılamıyor veya geçersiz yanıt. Bahsin dikkate alınmamış olabilir: bakiyeni kontrol et.',
    errBook: 'Turun sonucu okunamadı. Lütfen destek ile iletişime geç.',
    errIs: 'Oturum geçersiz veya süresi dolmuş. Lütfen oyunu siteden yeniden başlatın.',
    errAte: 'Kimlik doğrulamanın süresi doldu. Yeniden giriş yapmak için lütfen oyunu siteden yeniden başlatın.',
    errLoc: 'Bu oyun bulunduğunuz konumda kullanılamıyor.',
    errMaint: 'Bakım çalışması sürüyor. Lütfen birkaç dakika sonra tekrar deneyin.',
    errSum: 'Gösterilen sonuç oyun sunucusunun tutarıyla eşleşmiyor: sunucu tutarı uygulanır.',
    resuming: 'Devam eden tur sürdürülüyor…',
    buyConfirm: '{name} {price} karşılığında satın alınsın mı?', buyConfirmTitle: 'SATIN ALMAYI ONAYLA', plusConfirmTitle: 'MODU ONAYLA', plusConfirm: '{name} açılsın mı? Her tur {price} değeriyle oynanır.',
    autoTitle: 'OTOMATİK OYUN', autoSub: 'Tur sayısını ve durdurma koşullarını seç, sonra onayla.',
    autoRounds: 'Tur sayısı', autoStopWin: 'En az şu kazançta dur', autoStart: 'Başlat', autoCost: 'Tur başına maliyet'
  };
  X.rules.tr = {
    modesH: 'Modlar, maliyet, RTP ve en yüksek kazanç', colMode: 'Mod', colCost: 'Maliyet', colRtp: 'RTP', colMax: 'En yüksek kazanç', colChance: 'Şans', colValue: 'Değer', colBoost: 'Güçlendirme', colNumCase: 'Sayı hücresi', colBonusCase: 'Bonus hücresi',
    modeStd: 'Standart', modePlus: 'KEHANET+', tokScepter: 'ASA ×2 (o ana kadarki toplam üzerinde)', tokKey: 'ALTIN ANAHTAR (açılacak +{keys} sandık)', tokSeal: 'MÜHÜR (odayı kapatır)',
    modeStdD: 'Yargı çarkının bir dönüşü. Kehanet dönüşlerin yaklaşık %{p} kadarında belirir.',
    modePlusD: 'Seçilen tutarın ×{c} katına mal olur. Kehanet dönüşlerin yaklaşık %{pp} kadarında belirir, yani güçlendirmeler daha sık gelir. Aynı RTP.',
    buyScarabD: 'Scarab Düşüşü bonusunu çark olmadan doğrudan açar.', buyWeighD: 'Kalbin Tartılması bonusunu çark olmadan doğrudan açar.',
    buyVaultD: 'Hazine Odası bonusunu çark olmadan doğrudan açar.', buyHandD: 'Anubis’in Gazabı’nı doğrudan açar: dev çark hemen döndürülür.',
    modesNote: 'RTP, çok sayıda oyun üzerinden beklenen getiridir (kesin hesap; tek bir oturum için söz değil). En yüksek kazanç, modun maliyetinin değil seçilen tutarın katıdır ve her modda {m}× ile sınırlıdır. Maliyet, seçilen tutarın katıdır ve onaylamadan önce gösterilir. Anubis’in Gazabı, doğrudan açılan bir bonusu yine de devralabilir (zamanın %{h} kadarında), tıpkı çarkta olduğu gibi.',
    howH: 'Kazançlar nasıl oluşur',
    how: [
      'Hizalanacak kazanç hattı, kombinasyon ya da sembol yoktur. Her dönüş, çarkın {n} hücresinden birinde durur. Kazanç, o hücrenin değeri × seçilen tutardır.',
      'Sayı hücreleri değerlerini kazandırır (×{nums}). Toz hücreleri hiçbir şey kazandırmaz. ANKH ücretsiz bir yeniden dönüş verir: çark maliyetsiz yeniden döner, art arda en fazla {chain} kez, ve tur ANKH olmayan bir hücrede biter. Zincirleme dönüşlerin kazançları toplanır.',
      'Bonus hücreleri (Scarablar, Tartı, Hazine) ilgili bonusu başlatır: kazanç, bonus sonucu × seçilen tutardır. Üçünün her biri {n} hücrenin {one} tanesini kaplar.',
      'Kehanet: dönüşten önce bir hücre türü ({kinds}) seçer ve ona bir güçlendirme verir. Güçlendirmenin değeri, çark durana kadar mühürlü kalır (×? olarak gösterilir). Çark o hücre türünde durursa hücre değeri (veya bonus sonucu) güçlendirmeyle çarpılır. Çark başka yerde durursa Kehanet hiçbir şey yapmaz.',
      'Bir turun toplam kazancı, seçilen tutarın {m}× katı ile sınırlıdır: sınıra ulaşıldığında tur biter ve kazanç bu sınırla kısıtlanır. Kazanç animasyonları (WIN, BIG WIN, EXTRA WIN, MEGA WIN, İLAHİ HÜKÜM) turun toplamı ÷ modun maliyetine bağlıdır; kazanılan tutarı asla değiştirmez.'
    ],
    oracleH: 'Kehanet güçlendirmeleri', oracleNote: 'Kehanet bir hücre türü seçtiğinde her güçlendirmenin şansı.',
    bonusH: 'Bonus turları: tetikleme ve değerler',
    scarabH: 'Scarab Düşüşü', scarabP: 'Scarablar hücresiyle ({n} hücrenin {one} tanesi) tetiklenir veya doğrudan açılır. Üç scarab, {rows} sıra çividen geçerek düşer ve her biri indiği yuvanın değerini kazanır (geçerliyse × Kehanet güçlendirmesi). Yuva değerleri soldan sağa, her yuvanın şansıyla birlikte:',
    weighH: 'Kalbin Tartılması', weighP: 'Tartı hücresiyle ({n} hücrenin {one} tanesi) tetiklenir veya doğrudan açılır. İki kefe, birer çarpan gösterir. Tüyü ya da kalbi seçersin; ağır kefe çarpanını kazanır, hafif kefe hiçbir şey kazanmaz: iki şanstan bir. Çarpan çifti şu şanslarla çekilir:',
    vaultH: 'Hazine Odası', vaultP: 'Hazine hücresiyle ({n} hücrenin {one} tanesi) tetiklenir veya doğrudan açılır. Sandıkları birer birer aç: başlangıçta {picks}. Her sandık, toplama eklenen bir değer, ya da bir ASA (o ana kadarki toplam ×2), ya da bir ALTIN ANAHTAR (açılacak +{keys} sandık daha, toplamda en fazla {cap}), ya da odayı kapatıp o ana kadarki toplamı koruyan MÜHÜR içerir. Hiçbir şey mührü iptal etmez ya da geciktirmez; anahtar yalnızca seçimi uzatır. İlk iki sandık asla mühür içermez. İzin verilen tüm sandıklar açılırsa +{fin}× ek ödül eklenir. Sandık içerikleri ve şanslar (ilk iki sandıktan sonra):',
    handH: 'Anubis’in Gazabı', handP: 'Her bonus Gazap tarafından devralınabilir (çarkta ve doğrudan açılan bonuslarda zamanın %{h} kadarı; Gazap modunda her zaman). Bir renk seç (turkuaz, altın veya yakut: aynı şanslar), sonra {segs} hücreli dev çarkı döndür. Bir sayı: kazanç = sayı × kademe. Kendi renginde ÇİFT: tüm sayılar ikiye katlanır (kademe ×2, ×4, ×8, ×{tier} değerine kadar) ve yeniden döndürürsün. Başka renkte ÇİFT: zincir biter ve en küçük sayı ({min}) × kademe kazanılır. Bir bant bonus başlatır: bonus kazancı × bant çarpanı × kademe. Dev çarktaki sayılar: ×{hnums}. ÇİFT hücreleri: {dbl} (renk başına {dblc}). Bantlar: {bands}. Kademe ×{tier} değerinden öteye büyümez (ÇİFT hücreleri o zaman sayılmaz).',
    cryptH: 'Gelgit Sığınağı (gizli bonus)', cDust: 'TOZ (hiçbir şey)', cTab: 'TABLET (+ değer × mevcut gelgit)', cTide: 'GELGİT (× gelgit)', cEclipse: 'TUTULMA (× adak)', cryptP: 'Kazanılan bir bonus Gelgit Sığınağı ile değiştirilebilir (zamanın %{s} kadarı, doğrudan açılan bonusta asla). 3×3 ızgaradaki {tiles} tablete istediğin sırayla dokun; sıra şansları değiştirmez. Adak 0’dan, gelgit ×1’den başlar. Her tablet şunlardan biridir: TABLET (değerini × mevcut gelgiti adağa ekler), GELGİT (gelgiti çarpar, yalnızca sonrasında açılan tabletler için), TUTULMA (biriken adağı çarpar) veya TOZ (hiçbir şey). Kazanç, son adak × seçilen tutardır (hiçbir tablet çıkmazsa en az ×1), {m}× ile sınırlıdır. Tablet türleri:',
    retrigH: 'Bonuslar, yeniden dönüşler ve yeniden tetikleme',
    retrig: [
      'Yeniden tetiklenecek bedava dönüş yoktur: her bonus tetikleme başına bir kez oynanır ve sonucu tura eklenir. Hiçbir bonus başka bir bonusu tetikleyemez: Gazap’ın bir bandı, asla Gazap’a geri dönmeyen bir bonus başlatır.',
      'Tekrarlanan tek özellik ANKH yeniden dönüşüdür (yukarıya bak). Bonus hücreleri, Kehanet ve Gazap her modda aynı şansa sahiptir.',
      'Bir tur sırasında bağlantı koparsa oyunu yeniden yükle: zaten kararlaştırılmış tur tamamlanır ve kazancı hesaplanır.'
    ],
    btnH: 'Düğmeler ve kontroller',
    btn: [
      ['− / +', 'Seçilen tutarı azaltır veya artırır (↓ / ↑ tuşları). Tur sürerken kilitlidir.'],
      ['{spin}', 'Seçilen tutarla bir tur başlatır (Boşluk veya Enter de çalışır). Otomatik oyunda {stop} olur.'],
      ['{auto}', 'Otomatik tur sayısını seç ({autos}); oyun sayı dolana, {stop} düğmesine basana, bir limite ulaşılana veya bakiye yetersiz kalana kadar turları art arda oynar. “Bonusta otomatik oyunu durdur” seçeneği Bilgi bölümündedir. AUTO penceresindeki “{stopwin}” seçeneği ({stops} seçilen tutar ya da kapalı), bir tur en az bu kadar kazanır kazanmaz otomatik oyunu durdurur.'],
      ['{turbo}', 'Daha hızlı turlar: bir basış TURBO, iki basış ULTRA (neredeyse anında sonuç), üçüncü basış kapatır. Bonus her zaman daha sakin bir tempoda oynanır.'],
      ['{buy}', 'Doğrudan açılan bonusların menüsünü açar. Her kart maliyetini gösterir; bir kartı seçmek o bonusu başlatır.'],
      ['{plus}', 'Sonraki turlar için KEHANET+ modunu açar veya kapatır: maliyet ×{c}, Kehanet çok daha sık belirir. Maliyet, tutarın altında gösterilir.'],
      ['Ses (hoparlör)', 'Ses panelini açar: ses düzeyi, tiz, perde, müzik ortamı, renk tonu ve tüm sesleri kapatan bir anahtar.'],
      ['i (Bilgi)', 'Bu kuralları ve ayarları açar: kayıp limiti, grafik kalitesi, azaltılmış efektler, otomatik oyun seçenekleri, doğrudan bonus erişimi açık/kapalı.'],
      ['Dil', 'Kullanılabilir {langs} dilin menüsünü açar (özgün adlarıyla); birini seçmek oyunun dilini değiştirir.'],
      ['€ / $', 'Tutarların gösterimini euro ile dolar arasında değiştirir (aynı sayısal değer).'],
      ['×', 'Açık pencereyi kapatır (Esc de çalışır).'],
      ['Dokun / Boşluk', 'Bir bonusta: bonusu başlatır, scarabı veya bloğu bırakır, sandık, kart ya da renk seçer. Kazanç animasyonunda: atlamak için dokun.']
    ],
    discH: 'Önemli', disc: 'Arıza, tüm kazançları ve oyunları geçersiz kılar. Kesintisiz bir internet bağlantısı gereklidir. Bağlantı koparsa, tamamlanmamış turları bitirmek için oyunu yeniden yükle. Beklenen getiri, çok sayıda oyun üzerinden hesaplanır. Oyun ekranı hiçbir fiziksel cihazı temsil etmez ve yalnızca örnekleme amaçlıdır. Kazançlar, web tarayıcısındaki olaylara göre değil, Remote Game Server’dan alınan tutara göre hesaplanır. TM ve © 2026 Engine.'
  };
  S.tr = {
    bet: 'OYUN', plusHint: 'KEHANET+: dönüşlerin ≈ %{opp} kadarında güçlendirme · oyun tutarı ×1,1', cost: 'OYUN DEĞERİ', sessWag: 'Oynanan',
    rulesPlus: 'KEHANET+ modu: oyun tutarı ×1,1, Kehanet dönüşlerin ≈ %{opp} kadarında belirir. Aynı RTP (≈ %96).',
    buyBtn: 'BONUS AÇ', buyTitle: 'BONUS AÇ', buySub: 'Çarkı atlayarak doğrudan bir bonus aç. Oynanabilir değer = oyun tutarı × çarpan. Anubis’in Gazabı yine de onu devralabilir.',
    buyPrice: 'OYUN DEĞERİ', buyNow: 'AÇ', buyOn: 'Bonus erişimi', resumed: 'Yarıda kalan tur: kazanç eklendi',
    scarabSub: 'Üç scarab karanlığa dalıyor. Her biri düştüğü hücreyi kazanır.',
    splashDemo: 'Demo · oyun jetonları · Sorumlu oyna', curHint: 'Demo: 2 jeton (SC, GC); tutarlar yalnızca yaklaşıktır.', demoBuild: 'Yerel demo — üretim sürümü değildir. Tutarlar kurgusaldır.', infoTitle: 'Kurallar ve Kazanç tablosu', demo: 'Oyun jetonları — demo, gösterilen tutarlar gerçek değildir.',
    tableCols: { 2: 'Kazanç' }, currencyL: 'Jeton', handWrongSub: 'Zincir biter: mevcut kademe toplandı',
    rules: {
      0: 'Bir oyun, bir dönüş: yargı çarkı karar verir. Her hücre, değeri × oyun tutarın kadar kazandırır.',
      2: 'ANKH: çarkın ücretsiz yeniden dönüşü, ek oyun tutarı yok.',
      6: function (s) { return s.replace('tur maliyeti', 'turun oyun değeri'); }
    },
    $rules: {
      modesH: 'Modlar, oyun değeri, RTP ve en yüksek kazanç', colCost: 'Oyun değeri',
      modePlusD: 'Oyun değeri, seçilen tutarın ×{c} katıdır. Kehanet dönüşlerin yaklaşık %{pp} kadarında belirir, yani güçlendirmeler daha sık gelir. Aynı RTP.',
      modesNote: function (s) { return s.replace('modun maliyetinin değil', 'modun oyun değerinin değil').replace('Maliyet, seçilen', 'Oyun değeri, seçilen'); },
      how: { 1: function (s) { return s.replace('maliyetsiz', 'ek oyun tutarı olmadan'); }, 4: function (s) { return s.replace('modun maliyetine', 'modun oyun değerine'); } },
      btn: {
        4: { 1: 'Doğrudan açılan bonusların menüsünü açar. Her kart hangi değerle oynanabildiğini gösterir; bir kartı seçmek o bonusu başlatır.' },
        5: { 1: 'Sonraki turlar için KEHANET+ modunu açar veya kapatır: oyun değeri ×{c}, Kehanet çok daha sık belirir. Oyun değeri, tutarın altında gösterilir.' },
        9: { 0: 'SC / GC', 1: 'Gösterimi iki jeton arasında değiştirir (aynı sayısal değer).' }
      }
    },
    $replay: { bet: 'OYUN TUTARI', realCost: 'GERÇEK OYUN DEĞERİ', costMult: 'Oyun değeri' },
    $rgs: {
        errLaunch: 'Oyunu siteden başlatın. Bir oyun oturumu gereklidir.',
      errVal: 'İstek reddedildi: oturum süresi doldu veya oyun geçersiz. Lütfen oyunu siteden yeniden başlat.',
      errIpb: 'Bu oyun için bakiye yetersiz.', errGle: 'Limite ulaşıldı: bu oyun reddedildi.',
      errNet: 'Ağ kullanılamıyor veya geçersiz yanıt. Oyunun dikkate alınmamış olabilir: bakiyeni kontrol et.',
      buyConfirm: '{name} açılsın mı? Oyun değeri: {price}.', buyConfirmTitle: 'BONUSU ONAYLA', autoCost: 'Tur başına oyun değeri'
    }
  };
})(window.I18N_X, window.I18N_SOCIAL);

/* --- vi --- */
(function (X, S) {
  X.tiers.vi = ['THẮNG', 'THẮNG LỚN', 'THẮNG CỰC LỚN', 'THẮNG SIÊU LỚN'];
  X.replay.vi = {
    badge: 'XEM LẠI', start: 'PHÁT', again: 'PHÁT LẠI', playing: 'ĐANG PHÁT…', loading: 'Đang tải bản xem lại…',
    errSum: 'Các sự kiện của bản xem lại không khớp với giá trị máy chủ công bố: hiển thị giá trị của máy chủ.',
    errLoad: 'Không thể tải bản xem lại này.', errParams: 'Thiếu tham số của bản xem lại (game, version, mode, event, rgs_url).', errFormat: 'Bản xem lại này có định dạng không xác định.',
    errNet: 'Lỗi mạng: hãy kiểm tra kết nối rồi tải lại.', bet: 'CƯỢC', betSocial: 'MỨC CHƠI', realCost: 'CHI PHÍ THỰC', costMult: 'Chi phí', result: 'THẮNG', noWin: 'Không thắng',
    modeStd: 'TIÊU CHUẨN', modePlus: 'THẦN LỜI+', modeBonus: 'BONUS'
  };
  X.rgs.vi = {
    connecting: 'Đang kết nối tới máy chủ trò chơi…', retry: 'Thử lại', confirm: 'Xác nhận', cancel: 'Hủy',
    errLaunch: 'Hãy khởi chạy trò chơi từ Stake. Cần có một phiên chơi.',
    errUrl: 'Không thể kết nối: địa chỉ máy chủ trò chơi (rgs_url) hoặc phiên bị thiếu hoặc không hợp lệ. Hãy khởi chạy lại trò chơi từ trang web.',
    errAuth: 'Không thể truy cập máy chủ trò chơi. Hãy kiểm tra kết nối rồi khởi chạy lại trò chơi.',
    errVal: 'Yêu cầu bị từ chối: phiên đã hết hạn hoặc mức cược không hợp lệ. Hãy khởi chạy lại trò chơi từ trang web.',
    errIpb: 'Số dư không đủ cho mức cược này.',
    errGle: 'Đã đạt giới hạn chơi: mức cược này bị từ chối.',
    errAct: 'Máy chủ đang bận. Hãy thử lại sau giây lát.',
    errGen: 'Lỗi máy chủ trò chơi. Hãy thử lại sau giây lát.',
    errNet: 'Mạng không khả dụng hoặc phản hồi không hợp lệ. Mức cược của bạn có thể chưa được ghi nhận: hãy kiểm tra số dư.',
    errBook: 'Không thể đọc kết quả của ván. Hãy liên hệ bộ phận hỗ trợ.',
    errIs: 'Phiên không hợp lệ hoặc đã hết hạn. Vui lòng khởi động lại trò chơi từ trang web.',
    errAte: 'Xác thực đã hết hạn. Vui lòng khởi động lại trò chơi từ trang web để đăng nhập lại.',
    errLoc: 'Trò chơi này không khả dụng tại vị trí của bạn.',
    errMaint: 'Đang bảo trì. Vui lòng thử lại sau vài phút.',
    errSum: 'Kết quả hiển thị không khớp với giá trị từ máy chủ trò chơi: áp dụng giá trị của máy chủ.',
    resuming: 'Đang tiếp tục ván đang diễn ra…',
    buyConfirm: 'Mua {name} với giá {price}?', buyConfirmTitle: 'XÁC NHẬN MUA', plusConfirmTitle: 'XÁC NHẬN CHẾ ĐỘ', plusConfirm: 'Bật {name}? Mỗi ván chơi với giá {price}.',
    autoTitle: 'CHƠI TỰ ĐỘNG', autoSub: 'Chọn số ván và điều kiện dừng, rồi xác nhận.',
    autoRounds: 'Số ván', autoStopWin: 'Dừng khi thắng tối thiểu', autoStart: 'Bắt đầu', autoCost: 'Chi phí mỗi ván'
  };
  X.rules.vi = {
    modesH: 'Chế độ, chi phí, RTP và mức thắng tối đa', colMode: 'Chế độ', colCost: 'Chi phí', colRtp: 'RTP', colMax: 'Thắng tối đa', colChance: 'Tỷ lệ', colValue: 'Giá trị', colBoost: 'Tăng lực', colNumCase: 'Ô số', colBonusCase: 'Ô bonus',
    modeStd: 'Tiêu chuẩn', modePlus: 'THẦN LỜI+', tokScepter: 'TRƯỢNG ×2 (trên tổng đã có)', tokKey: 'CHÌA KHÓA VÀNG (+{keys} rương để mở)', tokSeal: 'NIÊM PHONG (đóng căn phòng)',
    modeStdD: 'Một lượt quay của bánh xe phán xét. Thần Lời xuất hiện ở khoảng {p} % số lượt quay.',
    modePlusD: 'Có chi phí ×{c} mức đã chọn. Thần Lời xuất hiện ở khoảng {pp} % số lượt quay, nên tăng lực xuất hiện thường xuyên hơn. RTP như nhau.',
    buyScarabD: 'Mở thẳng bonus Bọ Hung Rơi, không qua bánh xe.', buyWeighD: 'Mở thẳng bonus Cân Trái Tim, không qua bánh xe.',
    buyVaultD: 'Mở thẳng bonus Phòng Kho Báu, không qua bánh xe.', buyHandD: 'Mở thẳng Thịnh Nộ của Anubis: bánh xe khổng lồ được quay ngay.',
    modesNote: 'RTP là mức hoàn lại kỳ vọng trên một số lượng ván rất lớn (tính chính xác, không phải lời hứa cho một phiên). Mức thắng tối đa là bội số của mức đã chọn, không phải của chi phí chế độ, và bị giới hạn ở {m}× trong mọi chế độ. Chi phí là bội số của mức đã chọn và được hiển thị trước khi xác nhận. Thịnh Nộ của Anubis vẫn có thể chiếm một bonus được mở thẳng ({h} % số lần), như trên bánh xe.',
    howH: 'Phần thắng được tạo ra thế nào',
    how: [
      'Không có đường thắng, tổ hợp hay biểu tượng nào cần xếp thẳng hàng. Mỗi lượt quay dừng ở một trong {n} ô của bánh xe. Phần thắng là giá trị của ô đó × mức đã chọn.',
      'Các ô số cho giá trị của chúng (×{nums}). Các ô bụi không cho gì. ANKH tặng một lượt quay lại miễn phí: bánh xe quay tiếp mà không mất chi phí, tối đa {chain} lần liên tiếp, và ván kết thúc ở một ô không phải ANKH. Phần thắng của các lượt quay nối tiếp được cộng dồn.',
      'Các ô bonus (Bọ Hung, Cân, Kho Báu) kích hoạt bonus tương ứng: phần thắng là kết quả bonus × mức đã chọn. Mỗi ô trong ba loại chiếm {one} trong {n} ô.',
      'Thần Lời: trước lượt quay, Thần Lời chọn một loại ô ({kinds}) và ban cho nó một tăng lực. Giá trị tăng lực được niêm phong (hiển thị ×?) cho đến khi bánh xe dừng. Nếu bánh xe dừng ở loại ô đó, giá trị ô (hoặc kết quả bonus) được nhân với tăng lực. Thần Lời không làm gì nếu bánh xe dừng ở chỗ khác.',
      'Tổng phần thắng của một ván bị giới hạn ở {m}× mức đã chọn: khi chạm giới hạn, ván kết thúc và phần thắng bị giới hạn ở mức đó. Hiệu ứng thắng (WIN, BIG WIN, EXTRA WIN, MEGA WIN, PHÁN XÉT THẦN THÁNH) phụ thuộc vào tổng của ván ÷ chi phí chế độ; chúng không bao giờ thay đổi số thắng.'
    ],
    oracleH: 'Tăng lực của Thần Lời', oracleNote: 'Tỷ lệ của từng tăng lực khi Thần Lời chọn một loại ô.',
    bonusH: 'Ván bonus: điều kiện kích hoạt và giá trị',
    scarabH: 'Bọ Hung Rơi', scarabP: 'Được kích hoạt bởi ô Bọ Hung ({one} trên {n} ô) hoặc mở thẳng. Ba con bọ hung rơi qua {rows} hàng chốt và mỗi con thắng giá trị của khe nó rơi vào (× tăng lực của Thần Lời nếu có). Giá trị các khe từ trái sang phải, kèm tỷ lệ của từng khe:',
    weighH: 'Cân Trái Tim', weighP: 'Được kích hoạt bởi ô Cân ({one} trên {n} ô) hoặc mở thẳng. Hai đĩa cân, mỗi đĩa hiện một hệ số. Bạn chọn chiếc lông vũ hoặc trái tim; đĩa nặng hơn thắng hệ số của nó, đĩa nhẹ hơn không được gì: một cơ hội trên hai. Cặp hệ số được rút theo các tỷ lệ sau:',
    vaultH: 'Phòng Kho Báu', vaultP: 'Được kích hoạt bởi ô Kho Báu ({one} trên {n} ô) hoặc mở thẳng. Mở lần lượt từng rương: {picks} lúc đầu. Mỗi rương chứa một giá trị được cộng vào tổng, hoặc một TRƯỢNG (×2 trên tổng đã có), hoặc một CHÌA KHÓA VÀNG (+{keys} rương nữa để mở, tối đa {cap} rương), hoặc NIÊM PHONG, đóng căn phòng và giữ lại tổng đã có. Không gì hủy hay trì hoãn được niêm phong; chìa khóa chỉ kéo dài lượt chọn. Hai rương đầu tiên không bao giờ chứa niêm phong. Mở hết mọi rương được phép sẽ cộng thêm thưởng +{fin}×. Nội dung rương và tỷ lệ (sau hai rương đầu tiên):',
    handH: 'Thịnh Nộ của Anubis', handP: 'Bất kỳ bonus nào cũng có thể bị Thịnh Nộ chiếm ({h} % số lần trên bánh xe và với bonus mở thẳng; luôn luôn ở chế độ Thịnh Nộ). Chọn một màu (ngọc lam, vàng hoặc hồng ngọc: tỷ lệ như nhau) rồi quay bánh xe khổng lồ gồm {segs} ô. Một số: phần thắng = số × bậc. GẤP ĐÔI đúng màu của bạn: mọi số được nhân đôi (bậc ×2, ×4, ×8 cho đến ×{tier}) và bạn quay tiếp. GẤP ĐÔI ở màu khác: chuỗi dừng và thắng số nhỏ nhất ({min}) × bậc. Một dải kích hoạt bonus: phần thắng bonus × hệ số dải × bậc. Các số trên bánh xe khổng lồ: ×{hnums}. Ô GẤP ĐÔI: {dbl} ({dblc} mỗi màu). Dải: {bands}. Bậc không tăng quá ×{tier} (khi đó các ô GẤP ĐÔI không còn được tính).',
    cryptH: 'Thánh Điện Thủy Triều (bonus ẩn)', cDust: 'BỤI (không gì cả)', cTab: 'BIA (+ giá trị × thủy triều hiện tại)', cTide: 'THỦY TRIỀU (× thủy triều)', cEclipse: 'NHẬT THỰC (× lễ vật)', cryptP: 'Một bonus đã thắng có thể được thay bằng Thánh Điện Thủy Triều ({s} % số lần, không bao giờ với bonus mở thẳng). Chạm vào {tiles} tấm bia của lưới 3×3 theo thứ tự tùy ý; thứ tự không đổi tỷ lệ. Lễ vật bắt đầu từ 0 và thủy triều từ ×1. Mỗi tấm bia là một trong: BIA (cộng giá trị của nó × thủy triều hiện tại vào lễ vật), THỦY TRIỀU (nhân thủy triều, chỉ với các tấm bia lật sau nó), NHẬT THỰC (nhân lễ vật đã gom) hoặc BỤI (không gì cả). Phần thắng là lễ vật cuối × mức đã chọn (tối thiểu ×1 nếu không có tấm bia nào xuất hiện), giới hạn ở {m}×. Các loại bia:',
    retrigH: 'Bonus, quay lại và kích hoạt lại',
    retrig: [
      'Không có lượt quay miễn phí nào để kích hoạt lại: mỗi bonus được chơi một lần cho mỗi lần kích hoạt và kết quả của nó được cộng vào ván. Không bonus nào có thể kích hoạt bonus khác: một dải của Thịnh Nộ khởi động một bonus không bao giờ dẫn trở lại Thịnh Nộ.',
      'Tính năng lặp lại duy nhất là lượt quay lại ANKH (xem ở trên). Các ô bonus, Thần Lời và Thịnh Nộ có cùng tỷ lệ ở mọi chế độ.',
      'Nếu mất kết nối trong lúc một ván đang chạy, hãy tải lại trò chơi: ván đã được định đoạt sẽ được hoàn tất và phần thắng của nó được ghi nhận.'
    ],
    btnH: 'Nút và điều khiển',
    btn: [
      ['− / +', 'Giảm hoặc tăng mức đã chọn (phím ↓ / ↑). Bị khóa khi một ván đang chạy.'],
      ['{spin}', 'Bắt đầu một ván với mức đã chọn (phím Cách hoặc Enter cũng được). Khi chơi tự động, nút trở thành {stop}.'],
      ['{auto}', 'Chọn số ván tự động ({autos}); trò chơi chơi liên tiếp cho đến khi đủ số ván, bạn nhấn {stop}, chạm một giới hạn hoặc số dư không đủ. Tùy chọn “Dừng tự động khi có bonus” nằm trong Thông tin. “{stopwin}” trong cửa sổ AUTO ({stops} mức đã chọn, hoặc tắt) dừng chơi tự động ngay khi một ván thắng ít nhất bằng mức đó.'],
      ['{turbo}', 'Ván nhanh hơn: nhấn một lần cho TURBO, hai lần cho ULTRA (kết quả gần như tức thì), lần thứ ba để tắt. Bonus luôn được chơi ở nhịp chậm hơn.'],
      ['{buy}', 'Mở menu các bonus mở thẳng. Mỗi thẻ hiển thị chi phí của nó; chọn một thẻ sẽ bắt đầu bonus đó.'],
      ['{plus}', 'Bật hoặc tắt THẦN LỜI+ cho các ván sau: chi phí ×{c}, Thần Lời xuất hiện thường xuyên hơn nhiều. Chi phí hiển thị bên dưới mức đã chọn.'],
      ['Âm thanh (loa)', 'Mở bảng âm thanh: âm lượng, âm cao, cao độ, không khí âm nhạc, tông màu và một công tắc tắt mọi âm thanh.'],
      ['i (Thông tin)', 'Mở luật chơi này và phần cài đặt: hạn mức thua, chất lượng đồ họa, giảm hiệu ứng, tùy chọn chơi tự động, mở bonus trực tiếp bật/tắt.'],
      ['Ngôn ngữ', 'Mở menu {langs} ngôn ngữ có sẵn (tên bản địa); chọn một ngôn ngữ sẽ đổi ngôn ngữ của trò chơi.'],
      ['€ / $', 'Chuyển cách hiển thị các mức giữa euro và đô la (cùng giá trị số).'],
      ['×', 'Đóng cửa sổ đang mở (phím Esc cũng được).'],
      ['Chạm / Phím cách', 'Trong bonus: bắt đầu bonus, thả bọ hung hoặc khối, chọn rương, thẻ hoặc màu. Trong hiệu ứng thắng: chạm để bỏ qua.']
    ],
    discH: 'Quan trọng', disc: 'Sự cố làm mất hiệu lực mọi phần thắng và mọi ván chơi. Cần có kết nối internet ổn định. Nếu bị ngắt kết nối, hãy tải lại trò chơi để hoàn tất các ván dang dở. Mức hoàn lại kỳ vọng được tính trên nhiều ván chơi. Màn hình trò chơi không đại diện cho bất kỳ thiết bị vật lý nào và chỉ mang tính minh họa. Phần thắng được ghi nhận theo số lượng nhận từ Remote Game Server chứ không theo các sự kiện trong trình duyệt web. TM và © 2026 Engine.'
  };
  S.vi = {
    bet: 'CHƠI', plusHint: 'THẦN LỜI+: tăng lực ở ≈ {opp} % lượt quay · mức chơi ×1,1', cost: 'GIÁ TRỊ CHƠI', sessWag: 'Đã chơi',
    rulesPlus: 'Chế độ THẦN LỜI+: mức chơi ×1,1, Thần Lời xuất hiện ở ≈ {opp} % lượt quay. RTP như nhau (≈ 96 %).',
    buyBtn: 'NHẬN BONUS', buyTitle: 'NHẬN BONUS', buySub: 'Mở thẳng một bonus, bỏ qua bánh xe. Chơi được với: mức chơi × hệ số. Thịnh Nộ của Anubis vẫn có thể chiếm nó.',
    buyPrice: 'GIÁ TRỊ CHƠI', buyNow: 'NHẬN', buyOn: 'Truy cập bonus', resumed: 'Ván bị gián đoạn: phần thắng đã được cộng',
    scarabSub: 'Ba con bọ hung lao xuống bóng tối. Mỗi con thắng ô nó rơi vào.',
    splashDemo: 'Bản demo · xu chơi · Hãy chơi có trách nhiệm', curHint: 'Bản demo: 2 token (SC, GC); số hiển thị chỉ mang tính tham khảo.', demoBuild: 'Demo cục bộ — không phải bản chính thức. Các số hiển thị là giả định.', infoTitle: 'Luật chơi & Bảng thắng', demo: 'Xu chơi — bản demo, các mức hiển thị không có giá trị thật.',
    tableCols: { 2: 'Thắng' }, currencyL: 'Token', handWrongSub: 'Chuỗi dừng: đã thu bậc hiện tại', bonusWin: 'THẮNG BONUS',
    rules: {
      0: 'Một lần chơi, một lượt quay: bánh xe phán xét quyết định. Mỗi ô cho giá trị của nó × mức chơi của bạn.',
      2: 'ANKH: quay lại bánh xe miễn phí, không thêm mức chơi.',
      5: function (s) { return s.replace('tiền thắng bonus', 'phần thắng bonus'); },
      6: function (s) { return s.replace('chi phí ván', 'giá trị chơi của ván'); }
    },
    $rules: {
      modesH: 'Chế độ, giá trị chơi, RTP và mức thắng tối đa', colCost: 'Chơi được với',
      modePlusD: 'Chơi được với ×{c} mức đã chọn. Thần Lời xuất hiện ở khoảng {pp} % số lượt quay, nên tăng lực xuất hiện thường xuyên hơn. RTP như nhau.',
      modesNote: function (s) { return s.replace('không phải của chi phí chế độ', 'không phải của giá trị chơi của chế độ').replace('Chi phí là bội số', 'Giá trị chơi là bội số'); },
      how: { 1: function (s) { return s.replace('mà không mất chi phí', 'mà không thêm mức chơi'); }, 4: function (s) { return s.replace('chi phí chế độ', 'giá trị chơi của chế độ'); } },
      btn: {
        4: { 1: 'Mở menu các bonus mở thẳng. Mỗi thẻ hiển thị giá trị chơi của nó; chọn một thẻ sẽ bắt đầu bonus đó.' },
        5: { 1: 'Bật hoặc tắt THẦN LỜI+ cho các ván sau: giá trị chơi ×{c}, Thần Lời xuất hiện thường xuyên hơn nhiều. Giá trị chơi hiển thị bên dưới mức đã chọn.' },
        9: { 0: 'SC / GC', 1: 'Chuyển cách hiển thị giữa hai token (cùng giá trị số).' }
      }
    },
    $replay: { bet: 'MỨC CHƠI', realCost: 'GIÁ TRỊ CHƠI THỰC', costMult: 'Giá trị chơi' },
    $rgs: {
        errLaunch: 'Hãy khởi chạy trò chơi từ trang web. Cần có một phiên chơi.',
      errVal: 'Yêu cầu bị từ chối: phiên đã hết hạn hoặc ván chơi không hợp lệ. Hãy khởi chạy lại trò chơi từ trang web.',
      errIpb: 'Số dư không đủ cho ván chơi này.', errGle: 'Đã đạt giới hạn: ván chơi này bị từ chối.',
      errNet: 'Mạng không khả dụng hoặc phản hồi không hợp lệ. Ván chơi của bạn có thể chưa được ghi nhận: hãy kiểm tra số dư.',
      buyConfirm: 'Nhận {name}? Chơi được với {price}.', buyConfirmTitle: 'XÁC NHẬN BONUS', autoCost: 'Giá trị chơi mỗi ván'
    }
  };
})(window.I18N_X, window.I18N_SOCIAL);

/* --- zh --- */
(function (X, S) {
  X.tiers.zh = ['获胜', '大赢', '超赢', '巨赢', '神圣审判'];
  X.replay.zh = {
    badge: '回放', start: '播放', again: '再次播放', playing: '播放中…', loading: '正在加载回放…',
    errLoad: '无法加载此回放。', errParams: '缺少回放参数（game、version、mode、event、rgs_url）。', errFormat: '此回放的格式未知。',
    errNet: '网络错误：请检查网络连接后重新加载。', bet: '投注', betSocial: '游玩额', realCost: '实际费用', costMult: '费用', result: '获胜', noWin: '未获胜',
    modeStd: '标准', modePlus: '神谕+', modeBonus: '奖励'
  };
  X.rgs.zh = {
    connecting: '正在连接游戏服务器…', retry: '重试', confirm: '确认', cancel: '取消',
    errLaunch: '请从 Stake 启动游戏。需要游戏会话。',
    errUrl: '无法连接：游戏服务器地址（rgs_url）或会话缺失或无效。请从网站重新启动游戏。',
    errAuth: '无法连接到游戏服务器。请检查网络连接后重新启动游戏。',
    errVal: '请求被拒绝：会话已过期或投注无效。请从网站重新启动游戏。',
    errIpb: '余额不足，无法完成此次投注。',
    errGle: '已达到游戏限额：此次投注被拒绝。',
    errAct: '服务器繁忙，请稍后再试。',
    errGen: '游戏服务器出错，请稍后再试。',
    errNet: '网络不可用或响应无效。您的投注可能未被计入：请检查余额。',
    errBook: '无法读取本回合的结果。请联系客服。',
    buyConfirm: '以 {price} 购买 {name}？', buyConfirmTitle: '确认购买', plusConfirmTitle: '确认模式', plusConfirm: '开启 {name}？每回合以 {price} 游玩。',
    autoTitle: '自动游戏', autoSub: '选择回合数和停止条件，然后确认。',
    autoRounds: '回合数', autoStopWin: '获胜达到以下金额时停止', autoStart: '开始', autoCost: '每回合费用'
  };
  X.rules.zh = {
    modesH: '模式、费用、RTP 与最高获胜', colMode: '模式', colCost: '费用', colRtp: 'RTP', colMax: '最高获胜', colChance: '概率', colValue: '数值', colBoost: '加成', colNumCase: '数字格', colBonusCase: '奖励格',
    modeStd: '标准', modePlus: '神谕+', tokScepter: '权杖 ×2（作用于目前的总数）', tokKey: '金钥匙（可再开启 +{keys} 个宝箱）', tokSeal: '封印（关闭密室）',
    modeStdD: '转动一次审判之轮。神谕约在 {p}% 的旋转中出现。',
    modePlusD: '费用为所选数额的 ×{c}。神谕约在 {pp}% 的旋转中出现，因此加成出现得更频繁。RTP 相同。',
    buyScarabD: '不经过转轮，直接开启圣甲虫坠落奖励。', buyWeighD: '不经过转轮，直接开启心脏称重奖励。',
    buyVaultD: '不经过转轮，直接开启宝藏密室奖励。', buyHandD: '直接开启阿努比斯之怒：巨型转轮立即转动。',
    modesNote: 'RTP 是在极大量游戏中的预期回报率（精确计算，并非对单次游戏的承诺）。最高获胜是所选数额的倍数，而不是模式费用的倍数，并且在所有模式下都限制为 {m}×。费用是所选数额的倍数，并在确认前显示。直接开启的奖励仍可能被阿努比斯之怒接管（概率 {h}%），与转轮上相同。',
    howH: '获胜如何产生',
    how: [
      '没有需要连成一线的获胜线、组合或符号。每次旋转会停在转轮 {n} 个格子中的一个上。获胜为该格子的数值 × 所选数额。',
      '数字格赢得其数值（×{nums}）。尘埃格什么也不给。安卡带来一次免费重转：转轮无需费用再转一次，最多连续 {chain} 次，回合在非安卡格上结束。连锁旋转的获胜会累加。',
      '奖励格（圣甲虫、称重、宝藏）触发相应的奖励：获胜为奖励结果 × 所选数额。三者各占 {n} 个格子中的 {one} 个。',
      '神谕：旋转前，它选出一种格子（{kinds}）并赋予加成。加成的数值在转轮停止前保持封印（显示为 ×?）。如果转轮停在该种格子上，格子的数值（或奖励结果）会乘以加成。如果转轮停在别处，神谕不起作用。',
      '一个回合的总获胜限制为所选数额的 {m}×：达到上限时回合结束，获胜被限制在该上限。获胜动画（WIN、BIG WIN、EXTRA WIN、MEGA WIN、DIVINE JUDGEMENT）取决于回合总数 ÷ 模式费用；它们绝不会改变所赢得的数额。'
    ],
    oracleH: '神谕的加成', oracleNote: '神谕选择格子种类时，每种加成的概率。',
    bonusH: '奖励回合：触发条件与数值',
    scarabH: '圣甲虫坠落', scarabP: '由圣甲虫格（{n} 格中的 {one} 格）触发，或直接开启。三只圣甲虫穿过 {rows} 排钉子落下，每只赢得其落入的槽位的数值（如适用，× 神谕的加成）。槽位数值从左到右，并附每个槽位的概率：',
    weighH: '心脏称重', weighP: '由称重格（{n} 格中的 {one} 格）触发，或直接开启。两个秤盘各显示一个倍数。你选择羽毛或心脏；较重的秤盘赢得它的倍数，较轻的秤盘什么也得不到：二分之一的概率。倍数组合按以下概率抽取：',
    vaultH: '宝藏密室', vaultP: '由宝藏格（{n} 格中的 {one} 格）触发，或直接开启。逐个打开宝箱：起初 {picks} 个。每个宝箱里是加到总数上的数值，或权杖（目前总数 ×2），或金钥匙（再开 +{keys} 个宝箱，总共最多 {cap} 个），或封印——它会关闭密室并保留目前的总数。没有任何东西能取消或推迟封印；钥匙只会延长选择。前两个宝箱里绝不会有封印。打开所有允许的宝箱可额外获得 +{fin}× 的奖励。宝箱内容与概率（前两个宝箱之后）：',
    handH: '阿努比斯之怒', handP: '任何奖励都可能被愤怒接管（在转轮上和直接开启的奖励中概率为 {h}%；愤怒模式下总是如此）。选择一种颜色（绿松石、金色或红宝石：概率相同），然后转动有 {segs} 个格子的巨型转轮。数字：获胜 = 数字 × 等级。你的颜色的双倍：所有数字翻倍（等级 ×2、×4、×8，最高到 ×{tier}），然后你再转一次。其他颜色的双倍：连锁结束，赢得最小的数字（{min}）× 等级。色带触发奖励：奖励获胜 × 色带倍数 × 等级。巨型转轮上的数字：×{hnums}。双倍格：{dbl} 个（每种颜色 {dblc} 个）。色带：{bands}。等级不会超过 ×{tier}（之后双倍格不再计算）。',
    cryptH: '潮汐圣所（隐藏奖励）', cDust: '尘土（无）', cTab: '石板（+ 数值 × 当前潮汐）', cTide: '潮汐（× 潮汐）', cEclipse: '日食（× 供品）', cryptP: '赢得的奖励可能被潮汐圣所取代（概率 {s}%，直接开启的奖励中绝不会发生）。按任意顺序触摸 3×3 网格中的 {tiles} 块石板；顺序不会改变概率。供品从 0 开始，潮汐从 ×1 开始。每块石板是以下之一：石板（把它的数值 × 当前潮汐加到供品上）、潮汐（使潮汐相乘，只对之后翻开的石板有效）、日食（使已收集的供品相乘）或尘土（无）。获胜为最终供品 × 所选数额（若没有石板出现，则至少为 ×1），上限为 {m}×。石板种类：',
    retrigH: '奖励、重转与再次触发',
    retrig: [
      '没有可再次触发的免费旋转：每个奖励每次触发只玩一次，其结果累加到回合中。任何奖励都不能触发另一个奖励：愤怒的色带触发的奖励绝不会回到愤怒。',
      '唯一会重复的功能是安卡重转（见上文）。奖励格、神谕和愤怒在所有模式下的概率相同。',
      '如果回合期间连接中断，请重新加载游戏：已经决定的回合会被完成，其获胜会被结算。'
    ],
    btnH: '按钮与操作',
    btn: [
      ['− / +', '减少或增加所选数额（按键 ↓ / ↑）。回合进行中会被锁定。'],
      ['{spin}', '以所选数额开始一个回合（空格键或回车键也可以）。自动游戏期间它会变成 {stop}。'],
      ['{auto}', '选择自动回合数（{autos}）；游戏会连续进行，直到达到该数目、你按下 {stop}、达到某个限额或余额不足。“遇到奖励时停止自动游戏”选项位于信息中。 AUTO 窗口中的“{stopwin}”（所选数额的 {stops}，或关闭）会在某回合获胜达到该数额时立即停止自动游戏。'],
      ['{turbo}', '更快的回合：按一次为 TURBO，按两次为 ULTRA（结果几乎立即出现），按第三次关闭。奖励始终以较平缓的节奏进行。'],
      ['{buy}', '打开直接开启的奖励菜单。每张卡片显示其费用；选择一张卡片即开始该奖励。'],
      ['{plus}', '为之后的回合开启或关闭神谕+：费用 ×{c}，神谕出现得更频繁。费用显示在数额下方。'],
      ['声音（扬声器）', '打开声音面板：音量、高音、音高、音乐氛围、色调，以及可静音所有声音的开关。'],
      ['i（信息）', '打开这些规则和设置：亏损上限、画质、减少特效、自动游戏选项、直接开启奖励的开/关。'],
      ['语言', '打开 {langs} 种可用语言的菜单（原文名称）；选择其中一种会切换游戏语言。'],
      ['€ / $', '在欧元和美元之间切换金额的显示（数值相同）。'],
      ['×', '关闭已打开的窗口（Esc 键也可以）。'],
      ['点按 / 空格', '在奖励中：开始奖励、放下圣甲虫或方块、选择宝箱、卡片或颜色。在获胜动画中：点按可跳过。']
    ],
    discH: '重要提示', disc: '发生故障时，所有获胜和游戏均无效。需要稳定的互联网连接。如果连接中断，请重新加载游戏以完成未结束的回合。预期回报率是基于大量游戏计算的。游戏画面不代表任何实体设备，仅供示意。获胜按从 Remote Game Server 收到的数额结算，而不是按网页浏览器中的事件结算。TM 和 © 2026 Engine。'
  };
  S.zh = {
    bet: '游玩', plusHint: '神谕+: 约 {opp}% 的旋转获得加成 · 游玩额 ×1.1', cost: '游玩价值', sessWag: '已游玩',
    rulesPlus: '神谕+模式: 游玩额 ×1.1，神谕约在 {opp}% 的旋转中出现。RTP 相同 (约 96%)。',
    buyBtn: '开启奖励', buyTitle: '开启奖励', buySub: '跳过转轮，直接开启奖励。游玩价值 = 游玩额 × 倍数。阿努比斯之怒仍可能夺走它。',
    buyPrice: '游玩价值', buyNow: '开启', buyOn: '直接开启奖励', buyNoFunds: '余额不足，无法开启此奖励',
    splashDemo: '演示 · 游戏金币 · 请理性游戏', curHint: '演示：2 种代币（SC、GC）；金额仅供参考。', demoBuild: '本地演示版 — 不是正式生产版本。金额均为虚拟。', infoTitle: '规则与获胜表', demo: '游戏金币 — 演示版，所示金额并非真实。',
    tableCols: { 2: '赢得' }, currencyL: '代币',
    rules: {
      0: '一次游玩，一次旋转: 由审判之轮决定。每个格子赢得其数值 × 你的游玩额。',
      2: '安卡: 免费再转一次转轮，无需额外游玩额。',
      6: function (s) { return s.replace('回合费用', '回合游玩价值'); }
    },
    $rules: {
      modesH: '模式、游玩价值、RTP 与最高获胜', colCost: '游玩价值',
      modePlusD: '游玩价值为所选数额的 ×{c}。神谕约在 {pp}% 的旋转中出现，因此加成出现得更频繁。RTP 相同。',
      modesNote: function (s) { return s.replace('而不是模式费用的倍数', '而不是模式游玩价值的倍数').replace('费用是所选数额', '游玩价值是所选数额'); },
      how: { 1: function (s) { return s.replace('无需费用', '无需额外游玩额'); }, 4: function (s) { return s.replace('模式费用', '模式游玩价值'); } },
      btn: {
        4: { 1: '打开直接开启的奖励菜单。每张卡片显示其游玩价值；选择一张卡片即开始该奖励。' },
        5: { 1: '为之后的回合开启或关闭神谕+：游玩价值 ×{c}，神谕出现得更频繁。游玩价值显示在数额下方。' },
        9: { 0: 'SC / GC', 1: '在两种代币之间切换显示（数值相同）。' }
      }
    },
    $replay: { bet: '游玩额', realCost: '实际游玩价值', costMult: '游玩价值' },
    $rgs: {
        errLaunch: '请从网站启动游戏。需要游戏会话。',
      errVal: '请求被拒绝：会话已过期或本次游玩无效。请从网站重新启动游戏。',
      errIpb: '余额不足，无法进行此次游玩。', errGle: '已达到限额：此次游玩被拒绝。',
      errNet: '网络不可用或响应无效。您的游玩可能未被计入：请检查余额。',
      buyConfirm: '开启 {name}？游玩价值为 {price}。', buyConfirmTitle: '确认开启奖励', autoCost: '每回合游玩价值'
    }
  };
})(window.I18N_X, window.I18N_SOCIAL);

/* --- ajouts : libellés d'accessibilité et message « autre onglet » (bloc ui), erreurs RGS errIs / errAte / errLoc / errMaint / errSum, reprise du tour --- */
(function (X) {
  var UI = {
    de: { stage: 'Anubis Unchained, das Rad des Gerichts', history: 'Letzte Runden', oracle: 'Orakel-Boost', close: 'Schließen', amountDn: 'Betrag verringern', amountUp: 'Betrag erhöhen', tabTitle: 'SPIEL IN EINEM ANDEREN TAB GEÖFFNET', tabMsg: 'Anubis Unchained ist bereits in einem anderen Tab oder Fenster geöffnet. Es kann immer nur ein Tab spielen, damit das Guthaben konsistent bleibt.', tabHere: 'Hier spielen' },
    es: { stage: 'Anubis Unchained, la rueda del juicio', history: 'Últimas rondas', oracle: 'Potenciador del Oráculo', close: 'Cerrar', amountDn: 'Reducir el importe', amountUp: 'Aumentar el importe', tabTitle: 'JUEGO ABIERTO EN OTRA PESTAÑA', tabMsg: 'Anubis Unchained ya está abierto en otra pestaña o ventana. Solo una pestaña puede jugar a la vez, para que el saldo se mantenga coherente.', tabHere: 'Jugar aquí' },
    pt: { stage: 'Anubis Unchained, a roda do julgamento', history: 'Últimas rodadas', oracle: 'Boost do Oráculo', close: 'Fechar', amountDn: 'Diminuir o valor', amountUp: 'Aumentar o valor', tabTitle: 'JOGO ABERTO EM OUTRA ABA', tabMsg: 'Anubis Unchained já está aberto em outra aba ou janela. Somente uma aba pode jogar por vez, para que o saldo permaneça consistente.', tabHere: 'Jogar aqui' },
    pl: { stage: 'Anubis Unchained, koło sądu', history: 'Ostatnie rundy', oracle: 'Wzmocnienie Wyroczni', close: 'Zamknij', amountDn: 'Zmniejsz kwotę', amountUp: 'Zwiększ kwotę', tabTitle: 'GRA OTWARTA W INNEJ KARCIE', tabMsg: 'Anubis Unchained jest już otwarty w innej karcie lub oknie. Tylko jedna karta może grać naraz, aby saldo pozostało spójne.', tabHere: 'Graj tutaj' },
    tr: { stage: 'Anubis Unchained, yargı çarkı', history: 'Son turlar', oracle: 'Kehanet güçlendirmesi', close: 'Kapat', amountDn: 'Tutarı azalt', amountUp: 'Tutarı artır', tabTitle: 'OYUN BAŞKA BİR SEKMEDE AÇIK', tabMsg: 'Anubis Unchained zaten başka bir sekmede veya pencerede açık. Bakiye tutarlı kalsın diye aynı anda yalnızca bir sekme oynayabilir.', tabHere: 'Burada oyna' },
    id: { stage: 'Anubis Unchained, roda penghakiman', history: 'Ronde terbaru', oracle: 'Boost Orakel', close: 'Tutup', amountDn: 'Kurangi jumlah', amountUp: 'Tambah jumlah', tabTitle: 'PERMAINAN TERBUKA DI TAB LAIN', tabMsg: 'Anubis Unchained sudah terbuka di tab atau jendela lain. Hanya satu tab yang dapat bermain pada satu waktu agar saldo tetap konsisten.', tabHere: 'Main di sini' },
    vi: { stage: 'Anubis Unchained, bánh xe phán xét', history: 'Các ván gần đây', oracle: 'Tăng lực của Thần Lời', close: 'Đóng', amountDn: 'Giảm mức', amountUp: 'Tăng mức', tabTitle: 'TRÒ CHƠI ĐANG MỞ Ở TAB KHÁC', tabMsg: 'Anubis Unchained đã được mở ở một tab hoặc cửa sổ khác. Mỗi lúc chỉ một tab được chơi để số dư luôn nhất quán.', tabHere: 'Chơi ở đây' },
    fi: { stage: 'Anubis Unchained, tuomion ratas', history: 'Viimeisimmät kierrokset', oracle: 'Oraakkelin tehostus', close: 'Sulje', amountDn: 'Pienennä summaa', amountUp: 'Suurenna summaa', tabTitle: 'PELI ON AUKI TOISESSA VÄLILEHDESSÄ', tabMsg: 'Anubis Unchained on jo auki toisessa välilehdessä tai ikkunassa. Vain yksi välilehti voi pelata kerrallaan, jotta saldo pysyy johdonmukaisena.', tabHere: 'Pelaa täällä' },
    ru: { stage: 'Anubis Unchained, колесо суда', history: 'Последние раунды', oracle: 'Усиление Оракула', close: 'Закрыть', amountDn: 'Уменьшить сумму', amountUp: 'Увеличить сумму', tabTitle: 'ИГРА ОТКРЫТА В ДРУГОЙ ВКЛАДКЕ', tabMsg: 'Anubis Unchained уже открыта в другой вкладке или окне. Играть может только одна вкладка одновременно, чтобы баланс оставался согласованным.', tabHere: 'Играть здесь' },
    ar: { stage: 'Anubis Unchained، عجلة الحكم', history: 'آخر الجولات', oracle: 'تعزيز العرّاف', close: 'إغلاق', amountDn: 'تقليل المبلغ', amountUp: 'زيادة المبلغ', tabTitle: 'اللعبة مفتوحة في تبويب آخر', tabMsg: 'اللعبة Anubis Unchained مفتوحة بالفعل في تبويب أو نافذة أخرى. يمكن لتبويب واحد فقط أن يلعب في كل مرة ليبقى الرصيد متسقاً.', tabHere: 'العب هنا' },
    hi: { stage: 'Anubis Unchained, न्याय का चक्र', history: 'हाल के राउंड', oracle: 'ओरेकल का बूस्ट', close: 'बंद करें', amountDn: 'राशि घटाएँ', amountUp: 'राशि बढ़ाएँ', tabTitle: 'गेम दूसरे टैब में खुला है', tabMsg: 'Anubis Unchained पहले से किसी दूसरे टैब या विंडो में खुला है। बैलेंस सही बना रहे, इसलिए एक समय में केवल एक टैब खेल सकता है।', tabHere: 'यहाँ खेलें' },
    ja: { stage: 'Anubis Unchained、審判の輪', history: '最近のラウンド', oracle: '神託のブースト', close: '閉じる', amountDn: '金額を減らす', amountUp: '金額を増やす', tabTitle: 'ゲームが別のタブで開いています', tabMsg: 'Anubis Unchained はすでに別のタブまたはウィンドウで開いています。残高の整合性を保つため、同時にプレイできるタブは1つだけです。', tabHere: 'ここでプレイ' },
    ko: { stage: 'Anubis Unchained, 심판의 바퀴', history: '최근 라운드', oracle: '신탁의 부스트', close: '닫기', amountDn: '금액 줄이기', amountUp: '금액 늘리기', tabTitle: '게임이 다른 탭에서 열려 있습니다', tabMsg: 'Anubis Unchained가 이미 다른 탭이나 창에서 열려 있습니다. 잔액이 일관되게 유지되도록 한 번에 한 탭만 플레이할 수 있습니다.', tabHere: '여기서 플레이' },
    zh: { stage: 'Anubis Unchained，审判之轮', history: '最近的回合', oracle: '神谕的加成', close: '关闭', amountDn: '减少数额', amountUp: '增加数额', tabTitle: '游戏已在另一个标签页中打开', tabMsg: 'Anubis Unchained 已在另一个标签页或窗口中打开。为保持余额一致，同一时间只能有一个标签页进行游戏。', tabHere: '在此游玩' }
  };
  var ERR = {
    de: ['Die Ereignisse des Replays stimmen nicht mit dem vom Server gemeldeten Betrag überein: Der Serverbetrag wird angezeigt.', 'Ungültige oder abgelaufene Sitzung. Bitte starte das Spiel erneut über die Website.', 'Authentifizierung abgelaufen. Bitte starte das Spiel erneut über die Website, um dich neu anzumelden.', 'Dieses Spiel ist an deinem Standort nicht verfügbar.', 'Wartungsarbeiten laufen. Bitte versuche es in einigen Minuten erneut.', 'Das angezeigte Ergebnis stimmt nicht mit dem Betrag des Spielservers überein: Der Serverbetrag wird verwendet.', 'Laufende Runde wird fortgesetzt…'],
    es: ['Los eventos de la repetición no coinciden con el importe anunciado por el servidor: se muestra el importe del servidor.', 'Sesión no válida o caducada. Vuelve a iniciar el juego desde el sitio.', 'La autenticación ha caducado. Vuelve a iniciar el juego desde el sitio para iniciar sesión de nuevo.', 'Este juego no está disponible desde tu ubicación.', 'Mantenimiento en curso. Inténtalo de nuevo en unos minutos.', 'El resultado mostrado no coincide con el importe del servidor de juego: se aplica el importe del servidor.', 'Reanudando la ronda en curso…'],
    pt: ['Os eventos do replay não correspondem ao valor informado pelo servidor: o valor do servidor é exibido.', 'Sessão inválida ou expirada. Reinicie o jogo a partir do site.', 'Autenticação expirada. Reinicie o jogo a partir do site para entrar novamente.', 'Este jogo não está disponível na sua localização.', 'Manutenção em andamento. Tente novamente em alguns minutos.', 'O resultado exibido não corresponde ao valor do servidor de jogo: o valor do servidor é aplicado.', 'Retomando a rodada em andamento…'],
    pl: ['Zdarzenia powtórki nie zgadzają się z kwotą podaną przez serwer: wyświetlana jest kwota z serwera.', 'Nieprawidłowa lub wygasła sesja. Uruchom grę ponownie ze strony.', 'Uwierzytelnienie wygasło. Uruchom grę ponownie ze strony, aby zalogować się jeszcze raz.', 'Ta gra nie jest dostępna w Twojej lokalizacji.', 'Trwają prace konserwacyjne. Spróbuj ponownie za kilka minut.', 'Wyświetlony wynik nie zgadza się z kwotą z serwera gry: stosowana jest kwota z serwera.', 'Wznawianie trwającej rundy…'],
    tr: ['Tekrar olayları sunucunun bildirdiği tutarla eşleşmiyor: sunucu tutarı gösteriliyor.', 'Geçersiz veya süresi dolmuş oturum. Lütfen oyunu siteden yeniden başlat.', 'Kimlik doğrulamanın süresi doldu. Yeniden giriş yapmak için lütfen oyunu siteden yeniden başlat.', 'Bu oyun bulunduğun konumdan kullanılamıyor.', 'Bakım sürüyor. Lütfen birkaç dakika sonra tekrar dene.', 'Gösterilen sonuç oyun sunucusundaki tutarla eşleşmiyor: sunucu tutarı uygulanıyor.', 'Devam eden tur sürdürülüyor…'],
    id: ['Peristiwa replay tidak cocok dengan jumlah yang diumumkan server: jumlah dari server ditampilkan.', 'Sesi tidak valid atau telah berakhir. Silakan luncurkan ulang permainan dari situs.', 'Autentikasi telah berakhir. Silakan luncurkan ulang permainan dari situs untuk masuk kembali.', 'Permainan ini tidak tersedia dari lokasimu.', 'Pemeliharaan sedang berlangsung. Silakan coba lagi dalam beberapa menit.', 'Hasil yang ditampilkan tidak cocok dengan jumlah dari server permainan: jumlah dari server yang diterapkan.', 'Melanjutkan ronde yang sedang berjalan…'],
    vi: ['Các sự kiện của bản xem lại không khớp với số mà máy chủ thông báo: số của máy chủ được hiển thị.', 'Phiên không hợp lệ hoặc đã hết hạn. Hãy khởi chạy lại trò chơi từ trang web.', 'Xác thực đã hết hạn. Hãy khởi chạy lại trò chơi từ trang web để đăng nhập lại.', 'Trò chơi này không khả dụng tại vị trí của bạn.', 'Đang bảo trì. Hãy thử lại sau vài phút.', 'Kết quả hiển thị không khớp với số của máy chủ trò chơi: số của máy chủ được áp dụng.', 'Đang tiếp tục ván đang chơi…'],
    fi: ['Toiston tapahtumat eivät vastaa palvelimen ilmoittamaa summaa: palvelimen summa näytetään.', 'Virheellinen tai vanhentunut istunto. Käynnistä peli uudelleen sivustolta.', 'Todennus on vanhentunut. Käynnistä peli uudelleen sivustolta kirjautuaksesi uudelleen.', 'Tämä peli ei ole saatavilla sijainnistasi.', 'Huolto on käynnissä. Yritä uudelleen muutaman minuutin kuluttua.', 'Näytetty tulos ei vastaa pelipalvelimen summaa: palvelimen summa otetaan käyttöön.', 'Jatketaan käynnissä olevaa kierrosta…'],
    ru: ['События повтора не совпадают с суммой, объявленной сервером: показана сумма сервера.', 'Недействительная или истёкшая сессия. Перезапустите игру с сайта.', 'Срок аутентификации истёк. Перезапустите игру с сайта, чтобы войти снова.', 'Эта игра недоступна в вашем регионе.', 'Идут технические работы. Повторите попытку через несколько минут.', 'Показанный результат не совпадает с суммой игрового сервера: применяется сумма сервера.', 'Возобновление текущего раунда…'],
    ar: ['أحداث الإعادة لا تطابق المبلغ الذي أعلنه الخادم: يُعرض مبلغ الخادم.', 'جلسة غير صالحة أو منتهية. يرجى إعادة تشغيل اللعبة من الموقع.', 'انتهت صلاحية المصادقة. يرجى إعادة تشغيل اللعبة من الموقع لتسجيل الدخول من جديد.', 'هذه اللعبة غير متاحة من موقعك.', 'الصيانة جارية. يرجى المحاولة بعد بضع دقائق.', 'النتيجة المعروضة لا تطابق المبلغ الوارد من خادم اللعبة: يُطبَّق مبلغ الخادم.', 'جارٍ استئناف الجولة الجارية…'],
    hi: ['रीप्ले की घटनाएँ सर्वर द्वारा बताई गई राशि से मेल नहीं खातीं: सर्वर की राशि दिखाई गई है।', 'सत्र अमान्य या समाप्त है। कृपया साइट से गेम फिर से शुरू करें।', 'प्रमाणीकरण समाप्त हो गया है। दोबारा साइन इन करने के लिए कृपया साइट से गेम फिर से शुरू करें।', 'यह गेम आपके स्थान से उपलब्ध नहीं है।', 'रखरखाव जारी है। कृपया कुछ मिनट बाद फिर कोशिश करें।', 'दिखाया गया नतीजा गेम सर्वर की राशि से मेल नहीं खाता: सर्वर की राशि लागू की जाती है।', 'चल रहा राउंड फिर से शुरू हो रहा है…'],
    ja: ['リプレイのイベントがサーバーの通知した金額と一致しません: サーバーの金額を表示しています。', 'セッションが無効または期限切れです。サイトからゲームを起動し直してください。', '認証の有効期限が切れました。もう一度ログインするには、サイトからゲームを起動し直してください。', 'このゲームはお住まいの地域ではご利用いただけません。', 'メンテナンス中です。数分後にもう一度お試しください。', '表示された結果がゲームサーバーの金額と一致しません: サーバーの金額が適用されます。', '進行中のラウンドを再開しています…'],
    ko: ['리플레이 이벤트가 서버가 알린 금액과 일치하지 않습니다: 서버 금액을 표시합니다.', '세션이 올바르지 않거나 만료되었습니다. 사이트에서 게임을 다시 실행해 주세요.', '인증이 만료되었습니다. 다시 로그인하려면 사이트에서 게임을 다시 실행해 주세요.', '이 게임은 현재 위치에서 이용할 수 없습니다.', '점검 중입니다. 몇 분 후에 다시 시도해 주세요.', '표시된 결과가 게임 서버의 금액과 일치하지 않습니다: 서버 금액이 적용됩니다.', '진행 중이던 라운드를 다시 시작하는 중…'],
    zh: ['回放事件与服务器公布的数额不一致：显示服务器的数额。', '会话无效或已过期。请从网站重新启动游戏。', '身份验证已过期。请从网站重新启动游戏以重新登录。', '您所在的位置无法使用此游戏。', '正在维护。请几分钟后再试。', '显示的结果与游戏服务器的数额不一致：以服务器的数额为准。', '正在恢复进行中的回合…']
  };
  Object.keys(UI).forEach(function (l) {
    X.ui[l] = UI[l];
    var e = ERR[l];
    X.replay[l].errSum = e[0];
    X.rgs[l].errIs = e[1]; X.rgs[l].errAte = e[2]; X.rgs[l].errLoc = e[3]; X.rgs[l].errMaint = e[4]; X.rgs[l].errSum = e[5]; X.rgs[l].resuming = e[6];
  });
})(window.I18N_X);
/* ===== TRADUCTIONS : fin ===== */
