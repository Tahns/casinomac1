/* Textes FR / EN */
(function (root) {
  'use strict';
  var D = {
    fr: {
      brandTop: 'LA MAIN D\'', balance: 'SOLDE', bet: 'MISE', win: 'GAIN', turbo: 'TURBO', auto: 'AUTO',
      spin: 'TOURNER', stop: 'STOP', ready: 'Tournez la roue du jugement', spinning: 'La roue du jugement tourne…',
      oraclePlus: 'ORACLE+', plusHint: 'ORACLE+ : boost sur ≈ 3 tours sur 4 · mise ×1,1', cost: 'COÛT',
      session: 'SÉANCE', sessTime: 'Durée', sessSpins: 'Tours', sessWag: 'Misé', sessWon: 'Gagné', sessNet: 'Résultat net', lossLimit: 'Limite de perte de la séance', qualityL: 'Qualité graphique', qAuto: 'Auto', qHigh: 'Élevée', qLow: 'Basse',
      realityTitle: 'POINT DE SÉANCE', realityMsg: function (m, n) { return 'Vous jouez depuis ' + m + ' min. Résultat net : ' + n + '.'; }, limitTitle: 'LIMITE ATTEINTE', limitMsg: 'Votre limite de perte est atteinte. Modifiez-la dans les réglages pour continuer.', keepPlaying: 'CONTINUER', takeBreak: 'FAIRE UNE PAUSE',
      rulesPlus: 'Mode ORACLE+ : mise ×1,1, l\'Oracle apparaît sur ≈ 3 tours sur 4. RTP équivalent (≈ 96 %).',
      buyBtn: 'ACHETER UN BONUS', buyTitle: 'ACHETER UN BONUS', buySub: 'Ouvrez directement un bonus, sans passer par la roue. Prix = mise × multiplicateur. La Main d\'Anubis peut toujours le saisir.', buyPrice: 'PRIX', buyNow: 'ACHETER', buyOn: 'Achat de bonus', buyWheel: 'Retour à la roue', buyNoFunds: 'Solde insuffisant pour ce bonus', buyRtp: 'RTP ≈ 96 %',
      buyDesc: { scarab: '3 scarabées, jusqu\'à 25× chacun', weigh: 'Cœur vs plume, jusqu\'à 150×', vault: 'Pyramide : 12 chambres, évitez la malédiction', hand: 'Roue géante à multiplicateurs' },
      resumed: 'Tour interrompu : gain crédité',
      noFunds: 'Solde insuffisant', oracleSpeaks: 'L\'Oracle parle…', oracleOn: 'ORACLE', ankhRespin: 'ANKH — RELANCE GRATUITE !',
      dust: 'La poussière retourne à la poussière…', winLine: 'Gain', respinLabel: 'RELANCE',
      kinds: { m0: 'POUSSIÈRE', m025: '0,25×', m05: '0,5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'ANKH', scarab: 'SCARABÉES', weigh: 'PESÉE', vault: 'TRÉSOR' },
      kindsLong: { scarab: 'Chute des Scarabées', weigh: 'Pesée du Cœur', vault: 'Chambre du Trésor', hand: 'Main d\'Anubis' },
      tiers: ['', 'GRAND GAIN', 'MÉGA GAIN', 'ÉPIQUE', 'JUGEMENT DIVIN'],
      scarabSub: 'Trois scarabées traversent les ténèbres. Chacun rapporte la case où il tombe.', scarabIntro: 'CHUTE DES SCARABÉES',
      weighIntro: 'PESÉE DU CŒUR', weighSub: 'Le cœur contre la plume de Maât. Choisissez un plateau sans connaître sa valeur  : c\'est votre gain.', feather: 'PLUME', heart: 'CŒUR', weighing: 'Les dieux pèsent votre âme…',
      vaultIntro: 'CHAMBRE DU TRÉSOR', vaultSub: 'Ouvrez les chambres. Évitez la malédiction : elle clôt le coffre.', pick: 'Choisissez une chambre', vaultCurse: 'MALÉDICTION !', vaultSaved: 'L\'ANKH VOUS PROTÈGE', vaultScepter: 'SCEPTRE ×2', vaultShield: 'BOUCLIER ANKH', vaultClear: 'CHAMBRES VIDÉES  +5×', total: 'TOTAL',
      splashEnter: 'ENTRER', splashSub: 'Le jugement vous attend', splashDemo: 'Démo · crédits fictifs · Jouez avec modération',
      aimHint: 'Visez, puis touchez pour lâcher le scarabée', guessHint: 'Choisissez un plateau : les valeurs sont cachées', guessRight: 'BON CHOIX : LE PLUS LOURD', guessWrong: 'L\'AUTRE PLATEAU ÉTAIT PLUS LOURD', holdHint: 'Maintenez pour charger, relâchez pour lancer', tapFast: 'Touchez pour accélérer',
      handIntro: 'LA MAIN D\'ANUBIS', handSub: 'Le dieu saisit votre bonus et le transforme en jugement suprême.', handSpin: 'Les multiplicateurs s\'empilent…', handFinal: 'JUGEMENT RENDU',
      boostApplied: 'BOOST ORACLE', tapSkip: 'Touchez pour passer', continueBtn: 'CONTINUER', bonusWin: 'GAIN DU BONUS',
      infoTitle: 'RÈGLES & TABLE DES GAINS', rtp: 'RTP', maxWin: 'Gain max', hitRate: 'Tours gagnants', bonusFreq: 'Bonus', volat: 'Volatilité',
      volatV: 'Moyenne-haute', demo: 'Crédits fictifs — démo sans argent réel.',
      rules: [
        'Une mise, un tour : la roue du jugement décide. Chaque case paie sa valeur × votre mise.',
        'L\'Oracle (≈ 1 tour sur 3) désigne une case et lui offre un boost ×2 à ×25. Si la roue s\'y arrête, le boost s\'applique !',
        'ANKH : relance gratuite de la roue, sans remise.',
        'Un bonus peut être saisi par la MAIN D\'ANUBIS : roue géante à multiplicateurs cumulés, jusqu\'à ×5000.'
      ],
      tableCols: ['Case', 'Sur la roue', 'Gain'], settings: 'RÉGLAGES', language: 'Langue', sound: 'Son', reducedFx: 'Effets réduits', stopBonus: 'Stopper l\'auto sur bonus',
      autoOpts: 'Nombre de tours auto', off: 'Non', on: 'Oui', close: 'Fermer', noWin: 'Pas de gain', handLabel: 'MAIN D\'ANUBIS'
    },
    en: {
      brandTop: 'HAND OF', balance: 'BALANCE', bet: 'BET', win: 'WIN', turbo: 'TURBO', auto: 'AUTO',
      spin: 'SPIN', stop: 'STOP', ready: 'Spin the wheel of judgement', spinning: 'The wheel of judgement turns…',
      oraclePlus: 'ORACLE+', plusHint: 'ORACLE+: boost on ≈ 3 of 4 spins · bet ×1.1', cost: 'COST',
      session: 'SESSION', sessTime: 'Time', sessSpins: 'Spins', sessWag: 'Wagered', sessWon: 'Won', sessNet: 'Net result', lossLimit: 'Session loss limit', qualityL: 'Graphics quality', qAuto: 'Auto', qHigh: 'High', qLow: 'Low',
      realityTitle: 'SESSION CHECK', realityMsg: function (m, n) { return 'You have been playing for ' + m + ' min. Net result: ' + n + '.'; }, limitTitle: 'LIMIT REACHED', limitMsg: 'Your loss limit has been reached. Change it in settings to keep playing.', keepPlaying: 'KEEP PLAYING', takeBreak: 'TAKE A BREAK',
      rulesPlus: 'ORACLE+ mode: bet ×1.1, the Oracle shows up on ≈ 3 of 4 spins. Same RTP (≈ 96%).',
      buyBtn: 'BUY A BONUS', buyTitle: 'BUY A BONUS', buySub: 'Open a bonus directly, skipping the wheel. Price = bet × multiplier. The Hand of Anubis can still seize it.', buyPrice: 'PRICE', buyNow: 'BUY', buyOn: 'Bonus buy', buyWheel: 'Back to the wheel', buyNoFunds: 'Not enough balance for this bonus', buyRtp: 'RTP ≈ 96%',
      buyDesc: { scarab: '3 scarabs, up to 25× each', weigh: 'Heart vs feather, up to 150×', vault: 'Pyramid: 12 chambers, dodge the curse', hand: 'Giant wheel with stacking multipliers' },
      resumed: 'Interrupted round: winnings credited',
      noFunds: 'Insufficient balance', oracleSpeaks: 'The Oracle speaks…', oracleOn: 'ORACLE', ankhRespin: 'ANKH — FREE RESPIN!',
      dust: 'Dust returns to dust…', winLine: 'Win', respinLabel: 'RESPIN',
      kinds: { m0: 'DUST', m025: '0.25×', m05: '0.5×', m1: '1×', m2: '2×', m3: '3×', ankh: 'ANKH', scarab: 'SCARABS', weigh: 'WEIGHING', vault: 'VAULT' },
      kindsLong: { scarab: 'Scarab Drop', weigh: 'Weighing of the Heart', vault: 'Treasure Vault', hand: 'Hand of Anubis' },
      tiers: ['', 'BIG WIN', 'MEGA WIN', 'EPIC WIN', 'DIVINE JUDGEMENT'],
      scarabSub: 'Three scarabs plunge through the dark. Each pays the slot it lands in.', scarabIntro: 'SCARAB DROP',
      weighIntro: 'WEIGHING OF THE HEART', weighSub: 'Heart against the feather of Ma\'at. Pick a pan without knowing its value — that is your prize.', feather: 'FEATHER', heart: 'HEART', weighing: 'The gods weigh your soul…',
      vaultIntro: 'TREASURE VAULT', vaultSub: 'Open the chambers. Avoid the curse — it seals the vault.', pick: 'Choose a chamber', vaultCurse: 'CURSE!', vaultSaved: 'THE ANKH PROTECTS YOU', vaultScepter: 'SCEPTER ×2', vaultShield: 'ANKH SHIELD', vaultClear: 'VAULT CLEARED  +5×', total: 'TOTAL',
      splashEnter: 'ENTER', splashSub: 'Judgement awaits', splashDemo: 'Demo · play money · Play responsibly',
      aimHint: 'Aim, then tap to release the scarab', guessHint: 'Pick a pan: the values are hidden', guessRight: 'GREAT PICK: THE HEAVIER ONE', guessWrong: 'THE OTHER PAN WAS HEAVIER', holdHint: 'Hold to charge, release to spin', tapFast: 'Tap to speed up',
      handIntro: 'HAND OF ANUBIS', handSub: 'The god seizes your bonus and turns it into supreme judgement.', handSpin: 'Multipliers stack up…', handFinal: 'JUDGEMENT PASSED',
      boostApplied: 'ORACLE BOOST', tapSkip: 'Tap to skip', continueBtn: 'CONTINUE', bonusWin: 'BONUS WIN',
      infoTitle: 'RULES & PAYTABLE', rtp: 'RTP', maxWin: 'Max win', hitRate: 'Hit rate', bonusFreq: 'Bonus', volat: 'Volatility',
      volatV: 'Medium-high', demo: 'Play credits — demo, no real money.',
      rules: [
        'One bet, one spin: the wheel of judgement decides. Each segment pays its value × your bet.',
        'The Oracle (≈ 1 spin in 3) picks a segment and grants it a ×2 to ×25 boost. If the wheel lands there, the boost applies!',
        'ANKH: free respin of the wheel, no extra stake.',
        'Any bonus can be seized by the HAND OF ANUBIS: a giant wheel with stacking multipliers, up to ×5000.'
      ],
      tableCols: ['Segment', 'On wheel', 'Pays'], settings: 'SETTINGS', language: 'Language', sound: 'Sound', reducedFx: 'Reduced effects', stopBonus: 'Stop autoplay on bonus',
      autoOpts: 'Autoplay spins', off: 'Off', on: 'On', close: 'Close', noWin: 'No win', handLabel: 'HAND OF ANUBIS'
    }
  };
  var lang = 'fr';
  root.I18N = {
    setLang: function (l) { lang = D[l] ? l : 'fr'; document.documentElement.lang = lang; },
    lang: function () { return lang; },
    t: function () { return D[lang]; },
    apply: function () {
      var d = D[lang];
      document.querySelectorAll('[data-i]').forEach(function (el) { var k = el.getAttribute('data-i'); if (d[k] != null) el.textContent = d[k]; });
    }
  };
})(window);
