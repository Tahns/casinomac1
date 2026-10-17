/* ANUBIS UNCHAINED — noyau mathématique.
 *
 * Module pur (aucun DOM). Il produit pour chaque mise un « script » complet d'événements que le front se
 * contente de rejouer — exactement le modèle de Stake Engine (le RNG et les gains vivent côté serveur,
 * le client ne fait que l'affichage). Pour la prod : porter ce fichier dans le math-sdk Python ou le servir
 * depuis un RGS ; le front n'a pas à changer.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AnubisMath = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MAX_WIN = 25000;     // plafond en x la mise (très haute volatilité)
  var MAX_CHAIN = 6;       // Ankh enchaînés max

  /* ---------- RNG ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function cryptoRng() {
    var c = (typeof crypto !== 'undefined' && crypto.getRandomValues) ? crypto : null;
    if (!c) return Math.random;
    var buf = new Uint32Array(1);
    return function () { c.getRandomValues(buf); return buf[0] / 4294967296; };
  }
  function weighted(rng, table) { // table: [[valeur, poids], ...]
    var sum = 0, i;
    for (i = 0; i < table.length; i++) sum += table[i][1];
    var r = rng() * sum;
    for (i = 0; i < table.length; i++) { r -= table[i][1]; if (r < 0) return table[i][0]; }
    return table[table.length - 1][0];
  }

  /* ---------- La roue (64 cases, très haute volatilité) ---------- */
  // kind: identifiant ; mult: gain direct (cases « nombre ») ; count: nombre de cases sur la roue
  var KINDS = {
    m0:    { id: 'm0',    mult: 0,   count: 40, tier: 0 },
    m025:  { id: 'm025',  mult: 0.3, count: 5,  tier: 1 },   // identifiant historique « 0,25 » conservé ; la valeur est 0,3× (tous les gains sont des multiples de 0,1×)
    m05:   { id: 'm05',   mult: 0.5, count: 6,  tier: 1 },
    m1:    { id: 'm1',    mult: 1,   count: 3,  tier: 2 },
    m2:    { id: 'm2',    mult: 2,   count: 2,  tier: 3 },
    m3:    { id: 'm3',    mult: 3,   count: 1,  tier: 4 },
    ankh:  { id: 'ankh',  mult: 0,   count: 4,  tier: 7, respin: true },
    scarab:{ id: 'scarab',count: 1,  tier: 8, bonus: true },
    weigh: { id: 'weigh', count: 1,  tier: 9, bonus: true },
    vault: { id: 'vault', count: 1,  tier: 10, bonus: true }
  };
  var KIND_ORDER = ['weigh', 'vault', 'scarab', 'm3', 'ankh', 'm2', 'm1', 'm05', 'm025', 'm0'];
  var HAND_UPGRADE = 0.08; // chance qu'un bonus soit saisi par la Fureur d'Anubis

  // Disposition déterministe : les plus rares d'abord, répartis régulièrement, jamais deux cases identiques côte à côte
  // (sauf la poussière « 0 », qui occupe plus de la moitié de la roue : elle remplit les places restantes).
  function buildLayout() {
    var N = 0, i, k;
    KIND_ORDER.forEach(function (id) { N += KINDS[id].count; });
    var slots = new Array(N).fill(null);
    function free(p) { return slots[p] === null; }
    KIND_ORDER.forEach(function (id, ki) {
      var c = KINDS[id].count;
      for (i = 0; i < c; i++) {
        if (id === 'm0') { slots[slots.indexOf(null)] = id; continue; }
        var p = Math.round((i + 0.5) * N / c + ki * 1.7) % N;
        var tries = 0;
        while ((!free(p) || slots[(p + 1) % N] === id || slots[(p - 1 + N) % N] === id) && tries < N) { p = (p + 1) % N; tries++; }
        if (!free(p)) { p = slots.indexOf(null); } // dernier recours : première case libre
        slots[p] = id;
      }
    });
    for (var pass = 0; pass < 4; pass++) {
      for (i = 0; i < N; i++) {
        if (slots[i] !== slots[(i + 1) % N] || slots[i] === 'm0') continue;
        for (k = 0; k < N; k++) {
          var a = slots[k], b = slots[i];
          if (a === b || slots[(k + 1) % N] === b || slots[(k - 1 + N) % N] === b) continue;
          if (slots[(i + 1) % N] === a || slots[(i + 2) % N] === a || slots[(i - 1 + N) % N] === a) continue;
          if (k === i || k === (i + 1) % N) continue;
          slots[(i + 1) % N] = a; slots[k] = b; break;
        }
      }
    }
    return slots;
  }
  var LAYOUT = buildLayout();
  var N = LAYOUT.length;
  var WRATH_KINDS = ['ankh', 'scarab', 'weigh', 'vault'];   // cases libérées par la Colère d'Anubis (les autres restent enchaînées)
  var WRATH_CELLS = [];
  LAYOUT.forEach(function (k, i) { if (WRATH_KINDS.indexOf(k) >= 0) WRATH_CELLS.push(i); });

  /* ---------- Oracle (bénédiction scellée avant le tour : la valeur n'est révélée qu'à l'arrêt de la roue) ---------- */
  // wrath : chance de la Colère d'Anubis (feature aléatoire du jeu de base, voir plus bas), tirée une fois au début du tour
  /* ---------- PACTES (décision du joueur avant le tour : profil de volatilité, docs/GAMEPLAY.md) ----------
   * Chaque pacte est un MODE DE MISE distinct (au même coût) : un book = un résultat décidé avant l'animation, le choix du joueur est donc fait
   * AVANT la requête de jeu et n'est jamais rejoué après. Trois pactes, même RTP (96,2 %, calcul exact : tools/rtp-exact.js, tools/tune-pacts.js) :
   *  - safe (Pacte du Scribe)   : bonus en profil Prudent, Colère d'Anubis plus fréquente mais plafonnée à ×10 ;
   *  - std  (Pacte de la Balance) : le jeu de référence ;
   *  - bold (Pacte du Chacal)   : bonus en profil Audacieux, Colère plus rare qui part de ×3 et monte jusqu'à ×250.
   * Le pacte gouverne tous les bonus joués pendant le tour (Fureur d'Anubis et ses bandes comprises), jamais les achats (profil Équilibré). */
  var PACTS = {
    safe: { ladder: [2, 3, 5, 10] },
    std:  { ladder: [2, 3, 5, 10, 25, 50, 100] },
    bold: { ladder: [3, 5, 10, 25, 50, 100, 250] }
  };
  var PACT_ORDER = ['safe', 'std', 'bold'];
  var PACT_BIG = 5000;   // seuil des « très gros gains » cités pour comparer les pactes (fenêtre des pactes, règles : 1 tour sur N, calcul exact)
  // wrath : chance de la Colère d'Anubis par tour (réglée par pacte pour un RTP identique, tools/tune-pacts.js)
  var MODES = {
    std:       { cost: 1,   oracle: 0.0765, wrath: 0.002,    pact: 'std' },
    plus:      { cost: 1.1, oracle: 0.27,   wrath: 0.002,    pact: 'std' },
    safe:      { cost: 1,   oracle: 0.0765, wrath: 0.0040715, pact: 'safe' },
    bold:      { cost: 1,   oracle: 0.0765, wrath: 0.0011626, pact: 'bold' },
    plus_safe: { cost: 1.1, oracle: 0.27,   wrath: 0.0039719, pact: 'safe' },
    plus_bold: { cost: 1.1, oracle: 0.27,   wrath: 0.0012062, pact: 'bold' }
  };
  var BASE_MODES = ['std', 'plus', 'safe', 'bold', 'plus_safe', 'plus_bold'];
  // mode de mise d'une combinaison (famille std | plus = Oracle+, pacte safe | std | bold)
  function modeFor(family, pact) {
    var f = family === 'plus' ? 'plus' : 'std', p = PACTS[pact] ? pact : 'std';
    return p === 'std' ? f : (f === 'plus' ? 'plus_' : '') + p;
  }
  function pactOf(mode) { return (MODES[mode] || MODES.std).pact; }
  function familyOf(mode) { return /^plus/.test(String(mode)) ? 'plus' : 'std'; }
  function ladderOf(pact) { return (PACTS[pact] || PACTS.std).ladder; }
  var ORACLE_CHANCE = MODES.std.oracle;
  var ORACLE_KIND_W = [['m05', 3], ['m1', 4], ['m2', 3], ['m3', 2], ['scarab', 3], ['weigh', 3], ['vault', 3]];
  var ORACLE_BOOST = {
    num:   [[2, 50], [3, 25], [5, 15], [10, 8], [25, 2]],
    bonus: [[2, 40], [3, 25], [5, 18], [10, 12], [25, 4], [100, 1]]
  };

  /* ---------- Colère d'Anubis (feature aléatoire du jeu de base : « les chaînes se brisent ») ---------- */
  // Au début d'un tour Standard ou Oracle+, avec la chance MODES[mode].wrath, Anubis brise ses chaînes AVANT que la roue ne tourne :
  //  - un multiplicateur s'allume sur l'échelle WRATH_LADDER, au cran tiré dans WRATH_START (probabilités explicites) ;
  //  - la poussière et les nombres restent enchaînés : la roue ne s'arrête que sur les cases de WRATH_KINDS (Ankh et bonus : WRATH_CELLS, tirage uniforme) ;
  //  - chaque Ankh (relance) brise une chaîne de plus : le multiplicateur monte d'un cran (×2 → ×3 → ×5 → ×10 → ×25 → ×50 → ×100, plafonné au dernier) ;
  //  - le gain de la case finale (nombre ou bonus, Oracle compris) est multiplié par le cran atteint. Jamais à l'achat de bonus.
  // Le multiplicateur est intégré au boost du tour (s.boost = boost de l'Oracle × multiplicateur de la Colère) : le gain reste s.pay = s.base × s.boost.
  // échelle de référence (Pacte de la Balance) ; chaque pacte a la sienne (PACTS[p].ladder), portée par l'événement « wrath » du book
  var WRATH_LADDER = PACTS.std.ladder;
  var WRATH_START = [[0, 1]];   // [cran de départ, poids] : la Colère s'allume toujours au premier cran de l'échelle du pacte
  var WRATH_TOP = WRATH_LADDER.length - 1;

  /* ---------- Bonus 1 : Chute du Scarabée (cascade de chevilles, 8 rangées, 3 scarabées) ---------- */
  var SCARAB_ROWS = 8;
  var SCARAB_BALLS = 3;
  // Trois profils de même espérance : le joueur choisit sa volatilité avant le bonus.
  var SCARAB_PROFILES = {
    safe:  [23, 7, 3.5, 1.9, 0.9, 1.9, 3.5, 7, 23],
    std:   [100, 10, 2.5, 0.6, 0.9, 0.6, 2.5, 10, 100],
    bold:  [230, 3.7, 1, 0.3, 0.3, 0.3, 1, 3.7, 230]
  };
  var SCARAB_VALUES = SCARAB_PROFILES.std;
  function scarab(rng, prof) {
    var vals = SCARAB_PROFILES[prof || 'std'], balls = [], total = 0;
    for (var b = 0; b < SCARAB_BALLS; b++) {
      var path = [], col = 0;
      for (var r = 0; r < SCARAB_ROWS; r++) { var right = rng() < 0.5; path.push(right ? 1 : 0); col += right ? 1 : 0; }
      balls.push({ path: path, slot: col, value: vals[col] });
      total += vals[col];
    }
    return { balls: balls, total: total, values: vals, profile: prof || 'std' };
  }

  /* ---------- Bonus 2 : Pesée du Cœur ---------- */
  // Règle : le joueur choisit la plume ou le cœur ; les multiplicateurs des deux plateaux sont révélés ; le plateau le PLUS LOURD
  // gagne SON multiplicateur, le plus léger ne gagne rien. Le plateau le plus lourd est tiré 50/50, indépendamment des valeurs :
  // le joueur gagne donc 1 fois sur 2 et les valeurs affichées sont le DOUBLE des paires d'origine (même espérance ≈ 5,83).
  // Trois profils de même espérance : paires proches / d'origine / très écartées. Chaque entrée : [[a, b], poids].
  var WEIGH_PROFILES = {
    safe:  [[[3, 7], 45], [[5, 11], 30], [[8, 18], 15], [[14, 30], 6], [[25, 70], 2.5], [[50, 200], 1], [[100, 800], 1.5]],
    std:   [[[1, 5], 45], [[2, 10], 30], [[4, 20], 15], [[8, 40], 6], [[15, 100], 2.5], [[30, 300], 0.8], [[60, 1000], 1.5]],
    bold:  [[[1, 3], 50], [[1, 6], 30], [[2, 12], 12], [[3, 30], 5], [[5, 80], 2.5], [[10, 300], 1], [[20, 3000], 0.72]]
  };
  var WEIGH_PAIRS = WEIGH_PROFILES.std;
  // gain d'un choix : le multiplicateur du plateau choisi s'il est le plus lourd, sinon rien (0 = plume/gauche, 1 = cœur/droite)
  function weighGain(data, pick) { return pick === data.heavy ? data.mults[pick] : 0; }
  function weigh(rng, prof) {
    var pair = weighted(rng, WEIGH_PROFILES[prof || 'std']);
    var mults = rng() < 0.5 ? [pair[0], pair[1]] : [pair[1], pair[0]];   // valeurs attribuées au hasard à la plume (0) et au cœur (1)
    var heavy = rng() < 0.5 ? 0 : 1;                                       // plateau le plus lourd, indépendant des valeurs
    // total par défaut : choix « plume » (pick 0) ; la scène le recalcule dès que le joueur choisit (l'espérance est identique pour 0 ou 1)
    var data = { pair: pair, mults: mults, heavy: heavy, pick: 0, total: 0, profile: prof || 'std' };
    data.total = weighGain(data, 0);
    return data;
  }

  /* ---------- Bonus 3 : Chambre du Trésor (pick-me, 12 coffres) ---------- */
  // Règle : on ouvre des coffres un par un (7 au départ). Chaque coffre contient des pièces (+N), un SCEPTRE (×2 sur le total), une CLÉ D'OR
  // (+2 coffres à ouvrir, 10 au plus) ou le SCEAU : le sceau referme la chambre, on garde le total acquis. Aucun objet n'annule ni ne retarde le sceau :
  // la clé ne fait qu'allonger la sélection. Jamais de sceau sur les deux premiers coffres. Chambre vidée (tous les coffres permis ouverts) : prime +5×.
  // Trois profils de même espérance (10,63×) : le sceau est plus rare (prudent) ou plus fréquent (audacieux), les gains suivent ; poids du sceau calés par
  // le calcul exact (tools/rtp-exact.js, tools/tune-vault.js).
  var VAULT_TILES = 12;
  var VAULT_PROFILES = {
    safe:  { seal: 34.79, tokens: [[1, 48], [2, 26], [3, 10], [5, 5], [10, 2], [25, 0.6], [100, 0.12], [500, 0.02], ['scepter', 2], ['key', 4]] },
    std:   { seal: 66.19, tokens: [[1, 40], [2, 25], [3, 12], [5, 6], [10, 3], [25, 1.2], [80, 0.4], [500, 0.06], ['scepter', 2.5], ['key', 3]] },
    bold:  { seal: 64.94, tokens: [[1, 60], [2, 15], [3, 6], [5, 3], [10, 2], [25, 1.5], [100, 0.4], [600, 0.08], ['scepter', 4], ['key', 1]] }
  };
  var VAULT_TOKENS = VAULT_PROFILES.std.tokens;
  var VAULT_BASE_PICKS = 7, VAULT_KEY_PICKS = 2, VAULT_PICK_CAP = 10, VAULT_FINISH = 5;
  var VAULT_MAX_PICKS = VAULT_PICK_CAP;   // nombre maximal de coffres ouverts (tuiles disponibles : VAULT_TILES)
  function vault(rng, prof) {
    var picks = [], total = 0, allowed = VAULT_BASE_PICKS, ended = 'cleared', vp = VAULT_PROFILES[prof || 'std'];
    var pool = vp.tokens.concat([['seal', vp.seal]]);
    for (var i = 0; i < allowed; i++) {
      var tk = weighted(rng, pool);
      if (i < 2 && tk === 'seal') { // jamais de sceau sur les deux premiers choix
        while (tk === 'seal') tk = weighted(rng, pool);
      }
      var rec = { token: tk, total: 0, left: 0 };
      if (tk === 'seal') { rec.total = total; rec.left = 0; picks.push(rec); ended = 'seal'; break; }
      else if (tk === 'key') { allowed = Math.min(VAULT_PICK_CAP, allowed + VAULT_KEY_PICKS); }
      else if (tk === 'scepter') { total *= 2; }
      else { total += tk; }
      rec.total = total; rec.left = allowed - i - 1;
      picks.push(rec);
    }
    if (ended === 'cleared') total += VAULT_FINISH; // prime « chambre vidée »
    return { picks: picks, ended: ended, bonusFinish: ended === 'cleared' ? VAULT_FINISH : 0, total: total, profile: prof || 'std' };
  }

  /* ---------- Bonus 4 : Fureur d'Anubis (roue géante : choix d'une couleur, DOUBLE, bandes de bonus) ---------- */
  // Le joueur choisit une des 3 couleurs. La roue a des cases « nombre », des cases DOUBLE (2 par couleur) et des bandes de bonus ×N.
  // Lancer : nombre -> fin, gain = nombre × palier ; DOUBLE de SA couleur -> la roue est doublée (palier ×2) et on relance ;
  // DOUBLE d'une AUTRE couleur -> la chaîne s'arrête et on encaisse le palier : le plus petit nombre de la roue × palier ;
  // bande -> le bonus est joué (tiré d'avance, profil Équilibré), gain = gain du bonus × N × palier (une bande ne renvoie jamais vers la Fureur).
  // Les trois couleurs sont strictement symétriques : un script indépendant et de même loi est tiré d'avance pour chacune (modèle « livres »).
  var HAND_COLORS = ['turq', 'gold', 'ruby'];
  var HAND_SEGS = [
    { b: 'vault', x: 4 }, { n: 6 }, { d: 0 }, { n: 3 }, { n: 15 }, { n: 4 }, { d: 1 }, { b: 'scarab', x: 12 },
    { n: 8 }, { n: 3 }, { d: 2 }, { n: 30 }, { b: 'weigh', x: 6 }, { n: 5 }, { d: 0 }, { n: 180 },
    { n: 10 }, { n: 3 }, { d: 1 }, { b: 'scarab', x: 3 }, { n: 25 }, { n: 4 }, { d: 2 }, { n: 12 }
  ];
  var HAND_MAX_CHAIN = 4;   // nombre maximal de doublements (palier ×16) ; au palier maximal les cases DOUBLE ne comptent plus
  var HAND_MIN_N = Math.min.apply(null, HAND_SEGS.filter(function (s) { return s.n; }).map(function (s) { return s.n; }));
  function handBand(rng, seg, prof) {
    var data = BONUS_FN[seg.b](rng, prof || 'std');
    if (seg.b === 'weigh') { data.pick = rng() < 0.5 ? 0 : 1; data.total = weighGain(data, data.pick); }   // choix auto aléatoire (la scène laisse jouer le joueur et recalcule)
    return data;
  }
  // gain d'un lancer final (nombre, mauvaise couleur, bande) — recalculable après le choix du joueur dans la Pesée imbriquée
  function handSpinPay(sp) {
    if (sp.kind === 'num') return sp.base * sp.mult;
    if (sp.kind === 'wrong') return HAND_MIN_N * sp.mult;
    if (sp.kind === 'band') return sp.bonus.total * sp.x * sp.mult;
    return 0;
  }
  function handRecalc(h) {
    var last = h.spins[h.spins.length - 1];
    last.pay = handSpinPay(last);
    h.total = Math.min(last.pay, MAX_WIN);
    return h.total;
  }
  // forced : suite d'indices de cases imposée (tests visuels) ; sinon tirage uniforme
  // prof : pacte du tour (profil des bandes de bonus imbriquées), 'std' par défaut
  function hand(rng, colour, forced, prof) {
    colour = colour || 0;
    var spins = [], mult = 1, level = 0, n = HAND_SEGS.length;
    for (var i = 0; i < 12; i++) {
      var idx, s;
      if (forced && i < forced.length) { idx = forced[i]; s = HAND_SEGS[idx]; }
      else {
        do { idx = Math.floor(rng() * n); s = HAND_SEGS[idx]; } while (level >= HAND_MAX_CHAIN && s.d != null);   // palier maximal : on retire hors DOUBLE
      }
      if (s.d != null && s.d === colour && level < HAND_MAX_CHAIN) { level++; mult *= 2; spins.push({ idx: idx, kind: 'up', mult: mult, final: false }); continue; }
      var rec = { idx: idx, mult: mult, final: true };
      if (s.d != null) rec.kind = 'wrong';
      else if (s.b) { rec.kind = 'band'; rec.band = s.b; rec.x = s.x; rec.bonus = handBand(rng, s, prof); }
      else { rec.kind = 'num'; rec.base = s.n; }
      spins.push(rec);
      break;
    }
    var h = { spins: spins, mult: mult, total: 0, colour: colour, pact: prof || 'std' };
    handRecalc(h);
    return h;
  }
  function handOptions(rng, prof) { var o = {}; HAND_COLORS.forEach(function (c, i) { o[c] = hand(rng, i, null, prof); }); return o; }

  /* ---------- Bonus SECRET : le Sanctuaire des Marées (grille 3×3 de tablettes) ---------- */
  // Caché : ni sur la roue, ni à l'achat. Il remplace un bonus gagné (voir SECRET_UPGRADE dans playSpin), environ 1 tour sur 500.
  // Règles (tout est tiré d'avance : la scène ne fait que rejouer ; le joueur touche les 9 tablettes dans l'ordre qu'il veut, la k-ième tablette
  // touchée révèle la k-ième entrée du script — les tablettes sont indépendantes, l'ordre choisi ne change donc aucune probabilité) :
  //  - l'OFFRANDE démarre à 0 et la MARÉE à ×1 ; si aucune tablette n'apparaît, l'offrande est relevée à ×1 (plancher) ;
  //  - 9 tablettes se révèlent une à une ; chacune est :
  //      TABLETTE (+)   : ajoute sa valeur × la marée courante à l'offrande      MARÉE (×) : multiplie la marée (ne touche que les tablettes SUIVANTES)
  //      ÉCLIPSE (×)    : multiplie l'offrande déjà accumulée                    POUSSIÈRE : rien
  //  - gain = offrande finale (au moins ×1), plafonnée à MAX_WIN. L'espérance égale celle du bonus ordinaire remplacé (calcul exact : tools/rtp-exact.js, cryptMoments ;
  //    réglage : tools/tune-crypt.js) pour que le secret reste neutre sur le RTP.
  var CRYPT_CELLS = 9, CRYPT_ROWS = 3, CRYPT_COLS = 3, CRYPT_START = 0;
  var CRYPT_BIG = 1e9;   // garde-fou numérique interne (le gain affiché est plafonné à MAX_WIN)
  var CRYPT_TYPES = [['dust', 64], ['tab', 22], ['tide', 8], ['eclipse', 6]];
  var CRYPT_VALUES = {
    tab:     [[1, 55.09], [2, 30], [3, 12], [5, 5], [10, 2], [25, 0.5], [100, 0.1], [300, 0.02]],
    tide:    [[2, 60], [3, 25], [5, 10], [10, 5]],
    eclipse: [[2, 85], [3, 15]]
  };
  var SECRET_UPGRADE = 0.04;   // chance qu'un bonus gagné soit remplacé par le secret (≈ 1 tour sur 500)
  // rejoue un script de tablettes [{t, v}] : renvoie les étapes (instantanés) et le résultat. Source unique des règles (scène et tests).
  function cryptReplay(drops) {
    var pool = CRYPT_START, tide = 1, steps = [];
    drops.forEach(function (dr) {
      var st = { t: dr.t, v: dr.v, poolBefore: pool, tideBefore: tide, gain: 0 };
      if (dr.t === 'tab') { st.gain = dr.v * tide; pool = Math.min(CRYPT_BIG, pool + st.gain); }
      else if (dr.t === 'tide') tide = Math.min(CRYPT_BIG, tide * dr.v);
      else if (dr.t === 'eclipse') pool = Math.min(CRYPT_BIG, pool * dr.v);
      st.pool = pool; st.tide = tide;
      steps.push(st);
    });
    if (pool < 1) pool = 1;   // plancher : sans aucune tablette, l'offrande de consolation vaut ×1
    return { steps: steps, pool: pool, tide: tide, capped: pool > MAX_WIN, total: Math.min(pool, MAX_WIN) };
  }
  // forced : liste de tablettes imposée (tests visuels), complétée au hasard.
  function crypt(rng, forced) {
    var drops = [], i;
    for (i = 0; i < CRYPT_CELLS; i++) {
      var f = forced && forced[i], t, v;
      if (f) { t = f.t; v = f.v || 0; }
      else { t = weighted(rng, CRYPT_TYPES); v = CRYPT_VALUES[t] ? weighted(rng, CRYPT_VALUES[t]) : 0; }
      drops.push({ t: t, v: v });
    }
    var r = cryptReplay(drops);
    return { drops: drops, steps: r.steps, pool: r.pool, tide: r.tide, capped: r.capped, total: r.total, profile: 'crypt' };
  }

  /* ---------- Échelle entière (format Stake : payoutMultiplier entier) ---------- */
  // Stake exige des multiplicateurs entiers à échelle fixe (exemple de la doc : 1150 = 11,5×) ; son SDK écrit payoutMultiplier = round(gain × 100) et son
  // vérificateur (utils/rgs_verification.py) veut des payouts MULTIPLES DE 10, donc de 0,10×. On garde l'échelle 100 = 1× (celle du SDK : l'optimiseur divise par 100)
  // et TOUS les gains possibles d'un tour sont des multiples exacts de 0,1× : cases de la roue (0,3 ; 0,5 ; 1 ; 2 ; 3), valeurs des bonus (Scarabées 0,6 ; 0,9 ;
  // 2,5…), tablettes, marées et éclipses du Sanctuaire = entiers, boosts et paliers entiers. Aucun arrondi du total : isTenth() le vérifie (tools/check.js).
  // (Les prix d'achat sont des coûts, pas des gains : ils ne sont pas concernés.)
  var SCALE = 100;
  function toInt(x) { return Math.round(x * SCALE); }
  function fromInt(n) { return n / SCALE; }
  function isTenth(x) { var t = x * 10; return Math.abs(t - Math.round(t)) < 1e-6 * Math.max(1, Math.abs(t)); }
  function isExact(x) { return Math.abs(x * SCALE - Math.round(x * SCALE)) < 1e-6 * Math.max(1, Math.abs(x * SCALE)); }

  /* ---------- Un tour complet ---------- */
  function rollOracle(rng, chance) {
    if (rng() >= chance) return null;
    var kind = weighted(rng, ORACLE_KIND_W);
    var isBonus = KINDS[kind].bonus;
    return { kind: kind, boost: weighted(rng, isBonus ? ORACLE_BOOST.bonus : ORACLE_BOOST.num) };
  }

  // Les trois profils sont tirés d'avance (modèle « livres » de Stake Engine) ; le choix du joueur révèle l'un d'eux.
  var BONUS_FN = { scarab: scarab, weigh: weigh, vault: vault };
  var PROFILES = ['safe', 'std', 'bold'];
  function drawOptions(rng, kind) {
    var o = { std: BONUS_FN[kind](rng, 'std') };
    o.safe = BONUS_FN[kind](rng, 'safe'); o.bold = BONUS_FN[kind](rng, 'bold');
    return o;
  }
  // applique le profil choisi à un tour (le script reste le même, seul le bonus joué change) et renvoie le nouveau total
  function applyChoice(round, spinIndex, prof) {
    var s = round.spins[spinIndex];
    if (!s || !s.options || !s.options[prof]) return round.total;
    s.bonus = s.options[prof]; s.profile = prof; s.base = s.bonus.total; s.pay = s.base * (s.boost || 1);
    var t = 0; round.spins.forEach(function (x) { t += x.pay; });
    round.capped = t > MAX_WIN; round.total = Math.min(t, MAX_WIN);
    return round.total;
  }

  // wrath : état de la Colère d'Anubis du tour ({ level, ladder }) ou null ; pendant la Colère la roue ne s'arrête que sur WRATH_CELLS
  // pact : pacte du tour (profil des bonus) ; les trois profils restent tirés (drawOptions) pour garder la même suite de tirages
  function playSpin(rng, chance, wrath, pact) {
    pact = PACTS[pact] ? pact : 'std';
    var oracle = rollOracle(rng, chance);
    var index = wrath ? WRATH_CELLS[Math.floor(rng() * WRATH_CELLS.length)] : Math.floor(rng() * N);
    var kind = LAYOUT[index];
    var def = KINDS[kind];
    var oboost = (oracle && oracle.kind === kind) ? oracle.boost : 1;
    var wm = wrath ? (wrath.ladder || WRATH_LADDER)[wrath.level] : 1;
    var s = { oracle: oracle, index: index, kind: kind, boost: oboost * wm, oracleBoost: oboost, bonus: null, base: 0, pay: 0 };
    if (wrath) s.wrath = wm;
    if (def.bonus) {
      if (rng() < SECRET_UPGRADE) { s.secret = true; s.bonus = crypt(rng); s.profile = 'crypt'; }   // bonus SECRET (prioritaire sur la Fureur) : aucun choix, script unique
      else if (rng() < HAND_UPGRADE) { s.options = handOptions(rng, pact); s.bonus = s.options.turq; s.profile = 'turq'; s.upgraded = true; }
      else { s.options = drawOptions(rng, kind); s.bonus = s.options[pact]; s.profile = pact; }
      s.base = s.bonus.total;
    } else if (!def.respin) {
      s.base = def.mult;
    }
    s.pay = s.base * s.boost;
    return s;
  }

  // renvoie { spins:[...], total, capped }
  function playRound(rng, mode) {
    if (!MODES[mode] || /^bonus_/.test(mode)) mode = 'std';
    var md = MODES[mode], chance = md.oracle, pact = md.pact, lad = ladderOf(pact), top = lad.length - 1;
    var spins = [], total = 0, wrath = null;
    if (rng() < md.wrath) { var lv = weighted(rng, WRATH_START); wrath = { level: lv, start: lv, mult: lad[lv], ladder: lad }; }   // Colère d'Anubis : un tirage par tour, avant la roue
    for (var i = 0; i <= MAX_CHAIN; i++) {
      var s = playSpin(rng, chance, wrath, pact);
      if (s.kind === 'ankh' && i === MAX_CHAIN) { // plus de relance possible : on retire
        do { s = playSpin(rng, chance, wrath, pact); } while (s.kind === 'ankh');
      }
      spins.push(s);
      total += s.pay;
      if (s.kind !== 'ankh') break;
      if (wrath && wrath.level < top) { wrath.level++; s.wrathUp = lad[wrath.level]; }   // l'Ankh brise une chaîne : le multiplicateur monte d'un cran
    }
    if (wrath) wrath.mult = lad[wrath.level];
    var capped = total > MAX_WIN;
    if (capped) total = MAX_WIN;
    // mode : famille (std | plus, champ historique du format v2) ; modeName : mode de mise complet ; pact : pacte joué
    return { spins: spins, total: total, capped: capped, cost: md.cost, mode: familyOf(mode), modeName: mode, pact: pact, wrath: wrath };
  }

  /* ---------- Achat de bonus ---------- */
  // Prix en x la mise, calés par le calcul exact pour un RTP ≈ 96 % (tools/rtp-exact.js), recoupés par tools/simulate.js <n> <graine> bonus-<bonus>.
  // La Fureur d'Anubis peut toujours saisir un bonus acheté (même probabilité que sur la roue), sans boost Oracle.
  var BUY = { scarab: { price: 9.26 }, weigh: { price: 10.31 }, vault: { price: 12.37 }, hand: { price: 27.30 } };
  function playBuy(rng, kind) {
    var b, upgraded = false;
    var opts = null;
    if (kind === 'hand' || rng() < HAND_UPGRADE) { opts = handOptions(rng); b = opts.turq; upgraded = true; }
    else { opts = drawOptions(rng, kind); b = opts.std; }
    var s = { oracle: null, index: -1, kind: kind, boost: 1, bonus: b, upgraded: upgraded, base: b.total, pay: b.total, options: opts, profile: opts ? (upgraded ? 'turq' : 'std') : undefined };
    var total = Math.min(s.pay, MAX_WIN);
    return { spins: [s], total: total, capped: s.pay > MAX_WIN, cost: BUY[kind].price, mode: 'buy', pact: 'std' };
  }

  return {
    BUY: BUY, playBuy: playBuy, applyChoice: applyChoice, drawOptions: drawOptions, PROFILES: PROFILES,
    SCARAB_PROFILES: SCARAB_PROFILES, WEIGH_PROFILES: WEIGH_PROFILES, VAULT_PROFILES: VAULT_PROFILES,
    MAX_WIN: MAX_WIN, MODES: MODES, BASE_MODES: BASE_MODES, PACTS: PACTS, PACT_ORDER: PACT_ORDER, PACT_BIG: PACT_BIG, modeFor: modeFor, pactOf: pactOf, familyOf: familyOf, ladderOf: ladderOf, ORACLE_KIND_W: ORACLE_KIND_W, ORACLE_BOOST: ORACLE_BOOST, N: N, LAYOUT: LAYOUT, KINDS: KINDS, MAX_CHAIN: MAX_CHAIN,
    WRATH_LADDER: WRATH_LADDER, WRATH_START: WRATH_START, WRATH_TOP: WRATH_TOP, WRATH_CELLS: WRATH_CELLS, WRATH_KINDS: WRATH_KINDS,
    SCARAB_ROWS: SCARAB_ROWS, SCARAB_VALUES: SCARAB_VALUES, SCARAB_BALLS: SCARAB_BALLS,
    WEIGH_PAIRS: WEIGH_PAIRS, weighGain: weighGain, VAULT_TILES: VAULT_TILES, VAULT_MAX_PICKS: VAULT_MAX_PICKS, VAULT_BASE_PICKS: VAULT_BASE_PICKS, VAULT_KEY_PICKS: VAULT_KEY_PICKS, VAULT_PICK_CAP: VAULT_PICK_CAP, VAULT_FINISH: VAULT_FINISH,
    CRYPT_CELLS: CRYPT_CELLS, CRYPT_ROWS: CRYPT_ROWS, CRYPT_COLS: CRYPT_COLS, CRYPT_START: CRYPT_START, CRYPT_TYPES: CRYPT_TYPES, CRYPT_VALUES: CRYPT_VALUES, SECRET_UPGRADE: SECRET_UPGRADE, cryptReplay: cryptReplay,
    HAND_SEGS: HAND_SEGS, HAND_COLORS: HAND_COLORS, HAND_MAX_CHAIN: HAND_MAX_CHAIN, HAND_MIN_N: HAND_MIN_N, handOptions: handOptions, handRecalc: handRecalc, HAND_UPGRADE: HAND_UPGRADE, ORACLE_CHANCE: ORACLE_CHANCE,
    SCALE: SCALE, toInt: toInt, fromInt: fromInt, isExact: isExact, isTenth: isTenth,
    mulberry32: mulberry32, cryptoRng: cryptoRng,
    playRound: playRound, playSpin: playSpin,
    _bonus: { scarab: scarab, weigh: weigh, vault: vault, hand: hand, crypt: crypt }
  };
});
