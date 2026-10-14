/* Textes FR / EN */
(function (root) {
  'use strict';
  var D = {
    fr: {
      brandTop: 'ANUBIS', balance: 'SOLDE', bet: 'MISE', win: 'GAIN', turbo: 'TURBO', auto: 'AUTO',
      spin: 'TOURNER', stop: 'STOP', ready: 'Tournez la roue du jugement', spinning: 'La roue du jugement tourne…',
      oraclePlus: 'ORACLE+', plusHint: 'ORACLE+ : boost sur ≈ 3 tours sur 4 · mise ×1,1', cost: 'COÛT',
      session: 'SÉANCE', sessTime: 'Durée', sessSpins: 'Tours', sessWag: 'Misé', sessWon: 'Gagné', sessNet: 'Résultat net', lossLimit: 'Limite de perte de la séance', qualityL: 'Qualité graphique', qAuto: 'Auto', qHigh: 'Élevée', qLow: 'Basse',
      realityTitle: 'POINT DE SÉANCE', realityMsg: function (m, n) { return 'Vous jouez depuis ' + m + ' min. Résultat net : ' + n + '.'; }, limitTitle: 'LIMITE ATTEINTE', limitMsg: 'Votre limite de perte est atteinte. Modifiez-la dans les réglages pour continuer.', keepPlaying: 'CONTINUER', takeBreak: 'FAIRE UNE PAUSE',
      rulesPlus: 'Mode ORACLE+ : mise ×1,1, l\'Oracle apparaît sur ≈ 3 tours sur 4. RTP équivalent (≈ 96 %).',
      buyBtn: 'ACHETER UN BONUS', buyTitle: 'ACHETER UN BONUS', buySub: 'Ouvrez directement un bonus, sans passer par la roue. Prix = mise × multiplicateur. La Fureur d\'Anubis peut toujours le saisir.', buyPrice: 'PRIX', buyNow: 'ACHETER', buyOn: 'Achat de bonus', buyWheel: 'Retour à la roue', buyNoFunds: 'Solde insuffisant pour ce bonus', buyRtp: 'RTP ≈ 96 %',
      buyDesc: { scarab: '3 scarabées, jusqu\'à 230× chacun', weigh: 'Plume ou cœur : le plus lourd gagne, jusqu\'à 3000×', vault: 'Pyramide : 12 chambres, évitez la malédiction', hand: 'Choisissez une couleur : DOUBLE = roue doublée (jusqu\'à ×16), bandes de bonus ×3 à ×12' },
      resumed: 'Tour interrompu : gain crédité',
      noFunds: 'Solde insuffisant', oracleSpeaks: 'L\'Oracle parle…', oracleOn: 'ORACLE', ankhRespin: 'ANKH — RELANCE GRATUITE !',
      dust: 'La poussière retourne à la poussière…', winLine: 'Gain', respinLabel: 'RELANCE',
      kinds: { m0: 'POUSSIÈRE', m025: '0,25×', m05: '0,5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'ANKH', scarab: 'SCARABÉES', weigh: 'PESÉE', vault: 'TRÉSOR' },
      kindsLong: { scarab: 'Chute des Scarabées', weigh: 'Pesée du Cœur', vault: 'Chambre du Trésor', hand: 'Fureur d\'Anubis', crypt: 'Crypte d\'Anubis' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'JUGEMENT DIVIN'],
      scarabSub: 'Trois scarabées traversent les ténèbres. Chacun rapporte la case où il tombe.', scarabIntro: 'CHUTE DES SCARABÉES',
      weighIntro: 'PESÉE DU CŒUR', weighSub: 'Plume de Maât ou cœur ? Le plateau le plus lourd gagne son multiplicateur, le plus léger n\'a rien.', feather: 'PLUME', featherOf: 'DE MAÂT', heart: 'CŒUR', heartOf: 'DE VOTRE ÂME', weighRoll: 'Les multiplicateurs se révèlent…', weighWon: 'GAGNÉ', weighLost: 'PERDU', sayRight: 'Votre plateau est le plus lourd : ×{m} !', sayWrong: 'L\'autre plateau est plus lourd : pas de gain', weighing: 'Les dieux pèsent votre âme…',
      vaultIntro: 'CHAMBRE DU TRÉSOR', vaultSub: 'Un toucher ouvre un coffre. Évitez la malédiction : elle clôt la chambre.', pick: 'Touchez un coffre', vaultCurse: 'MALÉDICTION !', vaultSaved: 'L\'ANKH VOUS PROTÈGE', vaultScepter: 'SCEPTRE ×2', vaultShield: 'BOUCLIER ANKH', vaultClear: 'CHAMBRES VIDÉES  +{p}×', total: 'TOTAL',
      splashEnter: 'ENTRER', splashSub: 'Le jugement vous attend', splashDemo: 'Démo · argent fictif · Jouez avec modération',
      steerHint: 'Touchez à gauche ou à droite pour guider le scarabée', fateResists: 'LE DESTIN RÉSISTE',
      pushHint: 'Touchez vite pour faire pencher votre plateau !',
      launchBonus: 'LANCER LE BONUS', bonusWord: 'BONUS', bonusUnlocked: 'BONUS DÉBLOQUÉ', launchHint: 'Touchez le bouton ou appuyez sur Espace', chooseTitle: 'CHOISISSEZ VOTRE DESTIN', chooseHint: 'Touchez une carte : même espérance de gain, risque différent', chooseRtp: 'Les trois choix ont le même RTP',
      profName: { safe: 'PRUDENT', std: 'ÉQUILIBRÉ', bold: 'AUDACIEUX' }, profDesc: { safe: 'Gains réguliers, plafond bas', std: 'Le juste milieu', bold: 'Gains rares mais énormes' },
      lineScarab: '×{a} à ×{b} par scarabée', lineWeigh: 'Plateaux jusqu\'à ×{b}', lineVault: 'Malédiction : {p} % par coffre', volat: 'Volatilité',
      aimHint: 'Visez, puis touchez pour lâcher le scarabée', guessHint: 'Plume ou cœur ? Touchez une carte (touches 1 / 2)', guessRight: 'GAGNÉ !', guessWrong: 'PERDU', holdHint: 'Maintenez pour charger, relâchez pour lancer', tapFast: 'Touchez pour accélérer',
      handIntro: 'LA FUREUR D\'ANUBIS', handSub: 'Le dieu saisit votre bonus et le transforme en jugement suprême.', handSpin: 'Les multiplicateurs s\'empilent…', handFinal: 'JUGEMENT RENDU',
      handColorTitle: 'VOTRE COULEUR', handColorHint: 'Touchez une carte (touches 1 / 2 / 3). Les trois couleurs ont exactement les mêmes chances.',
      handColorName: { turq: 'TURQUOISE', gold: 'OR', ruby: 'RUBIS' }, handColorSub: '2 cases DOUBLE', handColorRule: 'DOUBLE de votre couleur : la roue double et on relance. DOUBLE d\'une autre couleur : la chaîne s\'arrête.', handColorRtp: 'Les trois couleurs ont le même RTP',
      handYour: 'VOTRE COULEUR', handRule: 'Votre couleur sur DOUBLE : roue doublée, on relance · autre couleur : fin', handTier: 'PALIER', handDouble: 'DOUBLE',
      handUp: 'LA ROUE DOUBLE !', handUpSub: 'Les nombres sont doublés — relancez', handWrong: 'MAUVAISE COULEUR', handWrongSub: 'La chaîne s\'arrête : palier encaissé', handNum: 'NOMBRE', handBandAt: 'BANDE BONUS',
      bandName: { scarab: 'SCARABÉES', weigh: 'PESÉE', vault: 'TRÉSOR' },
      boostApplied: 'BOOST ORACLE', boostIntro: 'BOOST', boostIntroSub: 'toutes les valeurs sont multipliées', tapSkip: 'Touchez pour passer', continueBtn: 'CONTINUER', bonusWin: 'GAIN DU BONUS',
      infoTitle: 'RÈGLES & TABLE DES GAINS', rtp: 'RTP', maxWin: 'Gain max', hitRate: 'Tours gagnants', bonusFreq: 'Bonus', volat: 'Volatilité',
      volatV: 'Très haute', demo: 'Argent fictif — démo sans argent réel : les montants en € ou $ ne sont pas de vrais euros ni dollars.',
      rules: [
        'Une mise, un tour : la roue du jugement décide. Chaque case paie sa valeur × votre mise.',
        'L\'Oracle (≈ 1 tour sur 3) désigne une case et lui offre un boost ×2 à ×100. Si la roue s\'y arrête, le boost s\'applique !',
        'ANKH : relance gratuite de la roue, sans remise.',
        'Pesée du Cœur : choisissez la plume de Maât ou le cœur, les multiplicateurs défilent et se révèlent, puis la balance tranche. Le plateau le plus lourd gagne son multiplicateur (jusqu\'à ×3000), le plus léger n\'a rien : une chance sur deux.',
        'Un bonus peut être saisi par la FUREUR D\'ANUBIS : choisissez une couleur (turquoise, or ou rubis) puis lancez la roue géante. Un nombre : gain = nombre × palier. DOUBLE de VOTRE couleur : les nombres de la roue sont doublés (palier ×2, jusqu\'à ×16) et vous relancez. DOUBLE d\'une AUTRE couleur : la chaîne s\'arrête et vous encaissez le plus petit nombre de la roue (3) × palier.',
        'Les bandes de la Fureur lancent un bonus (Scarabées ×3 ou ×12, Pesée ×6, Trésor ×4) : gain du bonus × le multiplicateur de la bande × palier, jusqu\'à ×25000. Une bande ne ramène jamais à la Fureur.',
        'Animations de gain, selon le multiplicateur total du tour (gain ÷ coût du tour) : WIN dès ×1, BIG WIN dès ×10, EXTRA WIN dès ×40, MEGA WIN dès ×150, JUGEMENT DIVIN dès ×1000.',
        '??? Un bonus secret se cache parfois derrière un bonus gagné… extrêmement rare. À vous de le découvrir.'
      ],
      secretWord: 'BONUS SECRET', secretUnlocked: 'DÉBLOQUÉ !', secretHint: 'Un bonus caché vient de s\'ouvrir… Touchez le bouton ou appuyez sur Espace',
      cryptIntro: 'CRYPTE D\'ANUBIS', cryptAvg: 'MOYENNE DES COLONNES', cryptCount: 'BLOC {n} / {m}', cryptFull: 'COLONNE PLEINE', cryptCapped: 'PLAFOND ATTEINT',
      cryptRule: 'Colonne = haut + blocs fixes · gain = moyenne des 5 colonnes · touchez pour lâcher chaque bloc',
      cryptLeg: ['+ COLONNE', '+ TOUTES', '× COLONNE', '× TOUTES', 'GLACE', 'BROYEUR'],
      cryptHint: { skull: 'CRÂNE : ajoute sa valeur au haut de sa colonne. Touchez pour lâcher', epic: 'CRÂNE ÉPIQUE : ajoute sa valeur au haut de TOUTES les colonnes', anubis: 'CRÂNE D\'ANUBIS : multiplie le haut de sa colonne', epicx: 'CRÂNE D\'ANUBIS ÉPIQUE : multiplie le haut de TOUTES les colonnes', ice: 'GLACE : fige le haut en bloc fixe, le haut repart à ×1', crusher: 'BROYEUR : écrase les blocs fixes de la colonne en un seul' },
      tableCols: ['Case', 'Sur la roue', 'Gain'], settings: 'RÉGLAGES', language: 'Langue', sound: 'Son', reducedFx: 'Effets réduits', stopBonus: 'Stopper l\'auto sur bonus',
      volumeL: 'Volume', pitchShort: 'Hauteur', gradeTitle: 'Couleurs', gradeNatural: 'Naturel', gradeVivid: 'Éclatant', gradeGold: 'Doré', gradeCine: 'Cinéma', toneShort: 'Aigus', soundOn: 'Son : oui', soundOff: 'Son : non', musicShort: 'Ambiance', resetL: 'Réinitialiser', mixLabel: 'Réglages du son', pitchL: 'Hauteur des sons (demi-tons)', musicL: 'Ambiance musicale', autoOpts: 'Nombre de tours auto', off: 'Non', on: 'Oui', close: 'Fermer', currencyL: 'Devise', resetBal: 'Réinitialiser le solde', noWin: 'Pas de gain', handLabel: 'FUREUR D\'ANUBIS'
    },
    en: {
      brandTop: 'ANUBIS', balance: 'BALANCE', bet: 'BET', win: 'WIN', turbo: 'TURBO', auto: 'AUTO',
      spin: 'SPIN', stop: 'STOP', ready: 'Spin the wheel of judgement', spinning: 'The wheel of judgement turns…',
      oraclePlus: 'ORACLE+', plusHint: 'ORACLE+: boost on ≈ 3 of 4 spins · bet ×1.1', cost: 'COST',
      session: 'SESSION', sessTime: 'Time', sessSpins: 'Spins', sessWag: 'Wagered', sessWon: 'Won', sessNet: 'Net result', lossLimit: 'Session loss limit', qualityL: 'Graphics quality', qAuto: 'Auto', qHigh: 'High', qLow: 'Low',
      realityTitle: 'SESSION CHECK', realityMsg: function (m, n) { return 'You have been playing for ' + m + ' min. Net result: ' + n + '.'; }, limitTitle: 'LIMIT REACHED', limitMsg: 'Your loss limit has been reached. Change it in settings to keep playing.', keepPlaying: 'KEEP PLAYING', takeBreak: 'TAKE A BREAK',
      rulesPlus: 'ORACLE+ mode: bet ×1.1, the Oracle shows up on ≈ 3 of 4 spins. Same RTP (≈ 96%).',
      buyBtn: 'BUY A BONUS', buyTitle: 'BUY A BONUS', buySub: 'Open a bonus directly, skipping the wheel. Price = bet × multiplier. Anubis\' Fury can still seize it.', buyPrice: 'PRICE', buyNow: 'BUY', buyOn: 'Bonus buy', buyWheel: 'Back to the wheel', buyNoFunds: 'Not enough balance for this bonus', buyRtp: 'RTP ≈ 96%',
      buyDesc: { scarab: '3 scarabs, up to 230× each', weigh: 'Feather or heart: the heavier wins, up to 3000×', vault: 'Pyramid: 12 chambers, dodge the curse', hand: 'Pick a colour: DOUBLE = doubled wheel (up to ×16), bonus bands ×3 to ×12' },
      resumed: 'Interrupted round: winnings credited',
      noFunds: 'Insufficient balance', oracleSpeaks: 'The Oracle speaks…', oracleOn: 'ORACLE', ankhRespin: 'ANKH — FREE RESPIN!',
      dust: 'Dust returns to dust…', winLine: 'Win', respinLabel: 'RESPIN',
      kinds: { m0: 'DUST', m025: '0.25×', m05: '0.5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'ANKH', scarab: 'SCARABS', weigh: 'WEIGHING', vault: 'VAULT' },
      kindsLong: { scarab: 'Scarab Drop', weigh: 'Weighing of the Heart', vault: 'Treasure Vault', hand: 'Fury of Anubis', crypt: 'Anubis\' Crypt' },
      tiers: ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN', 'DIVINE JUDGEMENT'],
      scarabSub: 'Three scarabs plunge through the dark. Each pays the slot it lands in.', scarabIntro: 'SCARAB DROP',
      weighIntro: 'WEIGHING OF THE HEART', weighSub: 'Feather of Ma\'at or heart? The heavier pan wins its multiplier, the lighter one gets nothing.', feather: 'FEATHER', featherOf: 'OF MA\'AT', heart: 'HEART', heartOf: 'OF YOUR SOUL', weighRoll: 'The multipliers are revealed…', weighWon: 'WON', weighLost: 'LOST', sayRight: 'Your pan is the heavier one: ×{m}!', sayWrong: 'The other pan is heavier: no win', weighing: 'The gods weigh your soul…',
      vaultIntro: 'TREASURE VAULT', vaultSub: 'One tap opens a chest. Avoid the curse — it seals the vault.', pick: 'Tap a chest', vaultCurse: 'CURSE!', vaultSaved: 'THE ANKH PROTECTS YOU', vaultScepter: 'SCEPTER ×2', vaultShield: 'ANKH SHIELD', vaultClear: 'VAULT CLEARED  +{p}×', total: 'TOTAL',
      splashEnter: 'ENTER', splashSub: 'Judgement awaits', splashDemo: 'Demo · play money · Play responsibly',
      steerHint: 'Tap left or right to steer the scarab', fateResists: 'FATE RESISTS',
      pushHint: 'Tap fast to tip your pan!',
      launchBonus: 'START THE BONUS', bonusWord: 'BONUS', bonusUnlocked: 'BONUS UNLOCKED', launchHint: 'Tap the button or press Space', chooseTitle: 'CHOOSE YOUR FATE', chooseHint: 'Tap a card: same expected return, different risk', chooseRtp: 'All three choices have the same RTP',
      profName: { safe: 'CAUTIOUS', std: 'BALANCED', bold: 'DARING' }, profDesc: { safe: 'Steady wins, low ceiling', std: 'The middle path', bold: 'Rare but huge wins' },
      lineScarab: '×{a} to ×{b} per scarab', lineWeigh: 'Pans up to ×{b}', lineVault: 'Curse: {p}% per chamber', volat: 'Volatility',
      aimHint: 'Aim, then tap to release the scarab', guessHint: 'Feather or heart? Tap a card (keys 1 / 2)', guessRight: 'YOU WIN!', guessWrong: 'LOST', holdHint: 'Hold to charge, release to spin', tapFast: 'Tap to speed up',
      handIntro: 'FURY OF ANUBIS', handSub: 'The god seizes your bonus and turns it into supreme judgement.', handSpin: 'Multipliers stack up…', handFinal: 'JUDGEMENT PASSED',
      handColorTitle: 'YOUR COLOUR', handColorHint: 'Tap a card (keys 1 / 2 / 3). The three colours have exactly the same odds.',
      handColorName: { turq: 'TURQUOISE', gold: 'GOLD', ruby: 'RUBY' }, handColorSub: '2 DOUBLE slots', handColorRule: 'DOUBLE in your colour: the wheel doubles and you spin again. DOUBLE in another colour: the chain stops.', handColorRtp: 'All three colours have the same RTP',
      handYour: 'YOUR COLOUR', handRule: 'Your colour on DOUBLE: wheel doubled, spin again · other colour: it ends', handTier: 'TIER', handDouble: 'DOUBLE',
      handUp: 'THE WHEEL DOUBLES!', handUpSub: 'Every number is doubled — spin again', handWrong: 'WRONG COLOUR', handWrongSub: 'The chain stops: current tier cashed', handNum: 'NUMBER', handBandAt: 'BONUS BAND',
      bandName: { scarab: 'SCARABS', weigh: 'WEIGHING', vault: 'VAULT' },
      boostApplied: 'ORACLE BOOST', boostIntro: 'BOOST', boostIntroSub: 'every value is multiplied', tapSkip: 'Tap to skip', continueBtn: 'CONTINUE', bonusWin: 'BONUS WIN',
      infoTitle: 'RULES & PAYTABLE', rtp: 'RTP', maxWin: 'Max win', hitRate: 'Hit rate', bonusFreq: 'Bonus', volat: 'Volatility',
      volatV: 'Very high', demo: 'Play money — demo, the € or $ amounts are not real money.',
      rules: [
        'One bet, one spin: the wheel of judgement decides. Each segment pays its value × your bet.',
        'The Oracle (≈ 1 spin in 3) picks a segment and grants it a ×2 to ×100 boost. If the wheel lands there, the boost applies!',
        'ANKH: free respin of the wheel, no extra stake.',
        'Weighing of the Heart: pick the feather of Ma\'at or the heart, the multipliers roll and are revealed, then the scales decide. The heavier pan wins its multiplier (up to ×3000), the lighter one gets nothing: a 1-in-2 chance.',
        'Any bonus can be seized by the FURY OF ANUBIS: pick a colour (turquoise, gold or ruby), then spin the giant wheel. A number: win = number × tier. DOUBLE in YOUR colour: every number on the wheel is doubled (tier ×2, up to ×16) and you spin again. DOUBLE in ANOTHER colour: the chain stops and you cash the smallest number on the wheel (3) × tier.',
        'The Fury\'s bands launch a bonus (Scarabs ×3 or ×12, Weighing ×6, Vault ×4): bonus win × the band multiplier × tier, up to ×25000. A band never leads back to the Fury.',
        'Win animations, by the round\'s total multiplier (win ÷ round cost): WIN from ×1, BIG WIN from ×10, EXTRA WIN from ×40, MEGA WIN from ×150, DIVINE JUDGEMENT from ×1000.',
        '??? A secret bonus sometimes hides behind a won bonus… extremely rare. Find it yourself.'
      ],
      secretWord: 'SECRET BONUS', secretUnlocked: 'UNLOCKED!', secretHint: 'A hidden bonus has opened… Tap the button or press Space',
      cryptIntro: 'ANUBIS\' CRYPT', cryptAvg: 'COLUMN AVERAGE', cryptCount: 'BLOCK {n} / {m}', cryptFull: 'COLUMN FULL', cryptCapped: 'MAX WIN REACHED',
      cryptRule: 'Column = top + fixed blocks · win = average of the 5 columns · tap to drop each block',
      cryptLeg: ['+ COLUMN', '+ ALL', '× COLUMN', '× ALL', 'ICE', 'CRUSHER'],
      cryptHint: { skull: 'SKULL: adds its value to the top of its column. Tap to drop', epic: 'EPIC SKULL: adds its value to the top of ALL columns', anubis: 'ANUBIS SKULL: multiplies the top of its column', epicx: 'EPIC ANUBIS SKULL: multiplies the top of ALL columns', ice: 'ICE: freezes the top as a fixed block, the top restarts at ×1', crusher: 'CRUSHER: crushes the column\'s fixed blocks into one' },
      tableCols: ['Segment', 'On wheel', 'Pays'], settings: 'SETTINGS', language: 'Language', sound: 'Sound', reducedFx: 'Reduced effects', stopBonus: 'Stop autoplay on bonus',
      volumeL: 'Volume', pitchShort: 'Pitch', gradeTitle: 'Colors', gradeNatural: 'Natural', gradeVivid: 'Vivid', gradeGold: 'Golden', gradeCine: 'Cinema', toneShort: 'Treble', soundOn: 'Sound: on', soundOff: 'Sound: off', musicShort: 'Ambience', resetL: 'Reset', mixLabel: 'Sound settings', pitchL: 'Sound pitch (semitones)', musicL: 'Background ambience', autoOpts: 'Autoplay spins', off: 'Off', on: 'On', close: 'Close', currencyL: 'Currency', resetBal: 'Reset balance', noWin: 'No win', handLabel: 'FURY OF ANUBIS'
    }
  };
  /* ---------- blocs de textes séparés (règles détaillées, replay) ----------
     Chaque bloc a une entrée par langue ; une clé absente d'une langue retombe sur l'anglais (I18N.block). Ajouter une langue = ajouter une entrée ici.
     Marqueurs {x} remplacés par js/rules.js ; les chiffres viennent de math.js (aucun nombre de jeu écrit à la main dans ces textes). */
  var B = {
    replay: {
      en: {
        badge: 'REPLAY', start: 'PLAY', again: 'PLAY AGAIN', playing: 'PLAYING…', loading: 'Loading the replay…',
        errLoad: 'Could not load this replay.', errParams: 'Missing replay parameters (game, version, mode, event, rgs_url).', errFormat: 'This replay has an unknown format.',
        errNet: 'Network error: check the connection and reload.', bet: 'BET', betSocial: 'PLAY AMOUNT', realCost: 'REAL COST', costMult: 'Cost', result: 'WIN', noWin: 'No win',
        modeStd: 'STANDARD', modePlus: 'ORACLE+', modeBonus: 'BONUS'
      },
      fr: {
        badge: 'REPLAY', start: 'LECTURE', again: 'REJOUER', playing: 'EN COURS…', loading: 'Chargement du replay…',
        errLoad: 'Impossible de charger ce replay.', errParams: 'Paramètres du replay manquants (game, version, mode, event, rgs_url).', errFormat: 'Ce replay a un format inconnu.',
        errNet: 'Erreur réseau : vérifiez la connexion et rechargez.', bet: 'MISE', betSocial: 'MONTANT JOUÉ', realCost: 'COÛT RÉEL', costMult: 'Coût', result: 'GAIN', noWin: 'Pas de gain',
        modeStd: 'STANDARD', modePlus: 'ORACLE+', modeBonus: 'BONUS'
      }
    },
    rules: {
      en: {
        modesH: 'Modes, cost, RTP and max win', colMode: 'Mode', colCost: 'Cost', colRtp: 'RTP', colMax: 'Max win', colChance: 'Chance', colValue: 'Value', colBoost: 'Boost', colNumCase: 'Number segment', colBonusCase: 'Bonus segment',
        modeStd: 'Standard', modePlus: 'ORACLE+', tokScepter: 'SCEPTER ×2 (on the total so far)', tokAnkh: 'ANKH shield (blocks one curse)', tokCurse: 'CURSE (ends the vault)',
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
          'Oracle: before the spin it picks one segment kind ({kinds}) and gives it a boost. If the wheel stops on that kind, the segment value (or the bonus result) is multiplied by the boost. The Oracle does nothing if the wheel stops elsewhere.',
          'The total win of a round is capped at {m}× the selected amount: when the cap is reached the round ends and the win is limited to it. The win animations (WIN, BIG WIN, EXTRA WIN, MEGA WIN, DIVINE JUDGEMENT) depend on the round total ÷ the cost of the mode; they never change the amount won.'
        ],
        oracleH: 'Oracle boosts', oracleNote: 'Chance of each boost when the Oracle picks a segment kind.',
        bonusH: 'Bonus rounds: triggers and values',
        scarabH: 'Scarab Drop', scarabP: 'Triggered by the Scarabs segment ({one} of {n}) or opened directly. Three scarabs fall through {rows} rows of pegs and each one wins the value of the slot where it lands (× the Oracle boost if it applies). Slot values from left to right, with the chance of each slot:',
        weighH: 'Weighing of the Heart', weighP: 'Triggered by the Weighing segment ({one} of {n}) or opened directly. Two pans each show a multiplier. You pick the feather or the heart; the heavier pan wins its multiplier, the lighter pan wins nothing: one chance in two. The pair of multipliers is drawn with these chances:',
        vaultH: 'Treasure Vault', vaultP: 'Triggered by the Vault segment ({one} of {n}) or opened directly. Open up to {picks} chests one after the other. Each chest holds a value that is added to the total, or a SCEPTER (×2 on the total so far), or an ANKH (protects once from a curse), or the CURSE, which closes the vault and keeps the total so far. The first two chests never hold a curse. Opening all {picks} chests adds a bonus of +{fin}×. Chest contents and chances (after the first two chests):',
        handH: 'Fury of Anubis', handP: 'Any bonus can be taken over by the Fury ({h}% of the time on the wheel and for directly opened bonuses; always for the Fury mode). Choose a colour (turquoise, gold or ruby: same odds), then spin the giant wheel of {segs} segments. A number: win = number × tier. DOUBLE in your colour: every number is doubled (tier ×2, ×4, ×8 up to ×{tier}) and you spin again. DOUBLE in another colour: the chain stops and the smallest number ({min}) × tier is won. A band launches a bonus: bonus win × band multiplier × tier. Numbers on the giant wheel: ×{hnums}. DOUBLE segments: {dbl} ({dblc} per colour). Bands: {bands}. The tier stops growing at ×{tier} (DOUBLE segments then stop counting).',
        cryptH: 'Hidden bonus', cryptP: 'A won bonus can be replaced by the Anubis\' Crypt ({s}% of the time, never for a directly opened bonus). Nine blocks fall into 5 columns: skulls add to or multiply the top of a column (some touch every column), ICE freezes the top into a fixed block, the CRUSHER merges the fixed blocks of a column. The win is the average of the 5 column totals × the selected amount, capped at {m}×.',
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
          ['{auto}', 'Choose the number of automatic rounds ({autos}); the game then plays them one after the other until the number is reached, you press {stop}, a limit is reached or the balance is too low. The option “Stop autoplay on bonus” is in Info.'],
          ['{turbo}', 'Faster rounds: press once for TURBO, twice for ULTRA (almost instant result), a third time to turn it off. A bonus always plays at a calmer pace.'],
          ['{buy}', 'Opens the menu of directly opened bonuses. Each card shows its cost; choosing a card starts that bonus.'],
          ['{plus}', 'Switches ORACLE+ on or off for the next rounds: cost ×{c}, the Oracle appears far more often. The cost is shown under the amount.'],
          ['Sound (speaker)', 'Opens the sound panel: volume, treble, pitch, music ambience, colour grading and a switch that mutes every sound.'],
          ['i (Info)', 'Opens these rules and the settings: display unit, loss limit, graphics quality, reduced effects, autoplay options, direct bonus access on/off, reset the balance.'],
          ['FR / EN', 'Switches the language of the game.'],
          ['€ / $', 'Switches the amounts between euro and dollar display (same numeric value).'],
          ['×', 'Closes the open window (Escape also works).'],
          ['Tap / Space', 'In a bonus: starts the bonus, drops the scarab or block, picks a chest, a card or a colour. In a win animation: tap to skip it.']
        ],
        discH: 'Important', disc: 'Malfunction voids all wins and plays. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many plays. The game display is not representative of any physical device and is for illustrative purposes only. Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser. TM and © 2026 Engine.'
      },
      fr: {
        modesH: 'Modes, coût, RTP et gain max', colMode: 'Mode', colCost: 'Coût', colRtp: 'RTP', colMax: 'Gain max', colChance: 'Chance', colValue: 'Valeur', colBoost: 'Boost', colNumCase: 'Case nombre', colBonusCase: 'Case bonus',
        modeStd: 'Standard', modePlus: 'ORACLE+', tokScepter: 'SCEPTRE ×2 (sur le total déjà gagné)', tokAnkh: 'Bouclier ANKH (bloque une malédiction)', tokCurse: 'MALÉDICTION (ferme la chambre)',
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
          'Oracle : avant le tour, il désigne un type de case ({kinds}) et lui offre un boost. Si la roue s\'arrête sur ce type de case, la valeur de la case (ou le résultat du bonus) est multipliée par le boost. L\'Oracle ne fait rien si la roue s\'arrête ailleurs.',
          'Le gain total d\'un tour est plafonné à {m}× le montant sélectionné : une fois le plafond atteint, le tour s\'arrête et le gain est limité à ce plafond. Les animations de gain (WIN, BIG WIN, EXTRA WIN, MEGA WIN, JUGEMENT DIVIN) dépendent du total du tour ÷ le coût du mode ; elles ne changent jamais le montant gagné.'
        ],
        oracleH: 'Boosts de l\'Oracle', oracleNote: 'Chance de chaque boost quand l\'Oracle désigne un type de case.',
        bonusH: 'Bonus : déclenchement et valeurs',
        scarabH: 'Chute des Scarabées', scarabP: 'Déclenchée par la case Scarabées ({one} case sur {n}) ou ouverte directement. Trois scarabées tombent à travers {rows} rangées de picots ; chacun gagne la valeur de la case où il atterrit (× le boost de l\'Oracle s\'il s\'applique). Valeurs des cases de gauche à droite, avec la chance de chacune :',
        weighH: 'Pesée du Cœur', weighP: 'Déclenchée par la case Pesée ({one} case sur {n}) ou ouverte directement. Deux plateaux affichent chacun un multiplicateur. Vous choisissez la plume ou le cœur ; le plateau le plus lourd gagne son multiplicateur, le plus léger ne gagne rien : une chance sur deux. La paire de multiplicateurs est tirée avec ces chances :',
        vaultH: 'Chambre du Trésor', vaultP: 'Déclenchée par la case Trésor ({one} case sur {n}) ou ouverte directement. Ouvrez jusqu\'à {picks} coffres l\'un après l\'autre. Chaque coffre contient une valeur qui s\'ajoute au total, ou un SCEPTRE (×2 sur le total déjà gagné), ou un ANKH (protège une fois d\'une malédiction), ou la MALÉDICTION, qui ferme la chambre en gardant le total déjà gagné. Les deux premiers coffres ne contiennent jamais de malédiction. Ouvrir les {picks} coffres ajoute une prime de +{fin}×. Contenu des coffres et chances (après les deux premiers coffres) :',
        handH: 'Fureur d\'Anubis', handP: 'Tout bonus peut être saisi par la Fureur ({h} % des fois sur la roue et pour les bonus ouverts directement ; toujours pour le mode Fureur). Choisissez une couleur (turquoise, or ou rubis : mêmes chances) puis lancez la roue géante de {segs} cases. Un nombre : gain = nombre × palier. DOUBLE de votre couleur : tous les nombres sont doublés (palier ×2, ×4, ×8 jusqu\'à ×{tier}) et vous relancez. DOUBLE d\'une autre couleur : la chaîne s\'arrête et on gagne le plus petit nombre ({min}) × palier. Une bande lance un bonus : gain du bonus × multiplicateur de la bande × palier. Nombres de la roue géante : ×{hnums}. Cases DOUBLE : {dbl} ({dblc} par couleur). Bandes : {bands}. Le palier ne dépasse pas ×{tier} (les cases DOUBLE ne comptent plus ensuite).',
        cryptH: 'Bonus caché', cryptP: 'Un bonus gagné peut être remplacé par la Crypte d\'Anubis ({s} % des fois, jamais pour un bonus ouvert directement). Neuf blocs tombent dans 5 colonnes : les crânes ajoutent au haut d\'une colonne ou le multiplient (certains touchent toutes les colonnes), la GLACE fige le haut en bloc fixe, le BROYEUR fusionne les blocs fixes d\'une colonne. Le gain est la moyenne des totaux des 5 colonnes × le montant sélectionné, plafonnée à {m}×.',
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
          ['{auto}', 'Choisissez le nombre de tours automatiques ({autos}) ; le jeu les enchaîne jusqu\'à ce que le nombre soit atteint, que vous appuyiez sur {stop}, qu\'une limite soit atteinte ou que le solde soit insuffisant. L\'option « Stopper l\'auto sur bonus » est dans Infos.'],
          ['{turbo}', 'Tours plus rapides : un appui pour TURBO, deux pour ULTRA (résultat quasi instantané), trois pour l\'arrêter. Un bonus se joue toujours à un rythme plus calme.'],
          ['{buy}', 'Ouvre le menu des bonus ouverts directement. Chaque carte affiche son coût ; choisir une carte lance ce bonus.'],
          ['{plus}', 'Active ou coupe ORACLE+ pour les tours suivants : coût ×{c}, l\'Oracle apparaît bien plus souvent. Le coût s\'affiche sous le montant.'],
          ['Son (haut-parleur)', 'Ouvre le panneau du son : volume, aigus, hauteur, ambiance musicale, couleurs et un interrupteur qui coupe tous les sons.'],
          ['i (Infos)', 'Ouvre ces règles et les réglages : devise, limite de perte, qualité graphique, effets réduits, options de l\'auto, accès direct aux bonus oui/non, réinitialisation du solde.'],
          ['FR / EN', 'Change la langue du jeu.'],
          ['€ / $', 'Passe l\'affichage des montants de l\'euro au dollar (même valeur numérique).'],
          ['×', 'Ferme la fenêtre ouverte (Échap aussi).'],
          ['Toucher / Espace', 'Dans un bonus : lance le bonus, lâche le scarabée ou le bloc, choisit un coffre, une carte ou une couleur. Pendant une animation de gain : passe l\'animation.']
        ],
        discH: 'Important', disc: 'Un dysfonctionnement annule tous les gains et toutes les parties. Une connexion internet stable est nécessaire. En cas de déconnexion, rechargez le jeu pour terminer les tours inachevés. Le retour attendu est calculé sur un grand nombre de parties. L\'affichage du jeu ne représente aucun appareil physique et sert uniquement d\'illustration. Les gains sont réglés selon le montant reçu du serveur de jeu distant (Remote Game Server) et non d\'après les événements du navigateur. TM et © 2026 Engine.'
      }
    }
  };
  var lang = 'fr';
  root.I18N = {
    setLang: function (l) { lang = D[l] ? l : 'fr'; document.documentElement.lang = lang; },
    lang: function () { return lang; },
    t: function () { return D[lang]; },
    // bloc de textes séparé (« rules », « replay ») : langue courante, clé par clé repliée sur l'anglais
    block: function (name) {
      var b = B[name] || {}, en = b.en || {}, cur = b[lang] || {}, out = {}, k;
      for (k in en) out[k] = en[k];
      for (k in cur) out[k] = cur[k];
      return out;
    },
    apply: function () {
      var d = D[lang];
      document.querySelectorAll('[data-i]').forEach(function (el) { var k = el.getAttribute('data-i'); if (d[k] != null) el.textContent = d[k]; });
    }
  };
})(window);
