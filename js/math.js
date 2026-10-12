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

  var MAX_WIN = 5000;      // plafond en x la mise
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

  /* ---------- La roue (54 cases) ---------- */
  // kind: identifiant ; mult: gain direct (cases « nombre ») ; count: nombre de cases sur la roue
  var KINDS = {
    m0:    { id: 'm0',    mult: 0,   count: 17, tier: 0 },
    m025:  { id: 'm025',  mult: 0.25,count: 6,  tier: 1 },
    m05:   { id: 'm05',   mult: 0.5, count: 12, tier: 1 },
    m1:    { id: 'm1',    mult: 1,   count: 4,  tier: 2 },
    m2:    { id: 'm2',    mult: 2,   count: 1,  tier: 3 },
    m3:    { id: 'm3',    mult: 3,   count: 1,  tier: 4 },
    ankh:  { id: 'ankh',  mult: 0,   count: 4,  tier: 7, respin: true },
    scarab:{ id: 'scarab',count: 1,  tier: 8, bonus: true },
    weigh: { id: 'weigh', count: 1,  tier: 9, bonus: true },
    vault: { id: 'vault', count: 1,  tier: 10, bonus: true }
  };
  var KIND_ORDER = ['weigh', 'vault', 'scarab', 'm3', 'ankh', 'm2', 'm1', 'm05', 'm025', 'm0'];
  var HAND_UPGRADE = 0.08; // chance qu'un bonus soit saisi par la Fureur d'Anubis

  // Disposition déterministe : les plus rares d'abord, répartis régulièrement, jamais deux cases identiques côte à côte.
  function buildLayout() {
    var N = 0, i, k;
    KIND_ORDER.forEach(function (id) { N += KINDS[id].count; });
    var slots = new Array(N).fill(null);
    function free(p) { return slots[p] === null; }
    KIND_ORDER.forEach(function (id, ki) {
      var c = KINDS[id].count;
      for (i = 0; i < c; i++) {
        var p = Math.round((i + 0.5) * N / c + ki * 1.7) % N;
        var tries = 0;
        while ((!free(p) || slots[(p + 1) % N] === id || slots[(p - 1 + N) % N] === id) && tries < N) { p = (p + 1) % N; tries++; }
        if (!free(p)) { p = slots.indexOf(null); } // dernier recours : première case libre
        slots[p] = id;
      }
    });
    for (var pass = 0; pass < 4; pass++) {
      for (i = 0; i < N; i++) {
        if (slots[i] !== slots[(i + 1) % N]) continue;
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

  /* ---------- Oracle (booster pré-tour, façon « top slot ») ---------- */
  var MODES = { std: { cost: 1, oracle: 0.31 }, plus: { cost: 1.1, oracle: 0.72 } };
  var ORACLE_CHANCE = MODES.std.oracle;
  var ORACLE_KIND_W = [['m05', 3], ['m1', 4], ['m2', 3], ['m3', 2], ['scarab', 3], ['weigh', 3], ['vault', 3]];
  var ORACLE_BOOST = {
    num:   [[2, 58], [3, 28], [5, 10], [10, 3.2], [25, 0.8]],
    bonus: [[2, 60], [3, 28], [5, 10], [10, 2]]
  };

  /* ---------- Bonus 1 : Chute du Scarabée (Plinko 8 rangées, 3 scarabées) ---------- */
  var SCARAB_ROWS = 8;
  var SCARAB_BALLS = 3;
  // Trois profils de même espérance (433/256 par bille) : le joueur choisit sa volatilité avant le bonus.
  var SCARAB_PROFILES = {
    safe: [13, 4, 2.5, 1.5, 0.5, 1.5, 2.5, 4, 13],
    std:  [25, 6, 2.5, 1, 0.5, 1, 2.5, 6, 25],
    bold: [75, 5, 2, 0.5, 0.5, 0.5, 2, 5, 75]
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
    safe: [[[4, 6], 37], [[6, 10], 31], [[8, 12], 25], [[10, 16], 24], [[12, 20], 6], [[20, 32], 2], [[40, 60], 2], [[80, 120], 1], [[120, 200], 1]],
    std:  [[[2, 6], 34], [[4, 10], 28], [[6, 16], 20], [[8, 24], 10], [[12, 50], 5], [[24, 120], 2], [[40, 300], 0.9]],
    bold: [[[1, 4], 38], [[2, 10], 37], [[2, 20], 17], [[4, 40], 9], [[6, 80], 3], [[10, 160], 1], [[20, 300], 1], [[40, 300], 1]]
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

  /* ---------- Bonus 3 : Chambre du Trésor (pick-me, 12 tuiles) ---------- */
  var VAULT_TILES = 12;
  // Trois profils : la malédiction est plus rare (prudent) ou plus fréquente (audacieux), les gains suivent ; poids de la malédiction calés par simulation pour une même espérance.
  var VAULT_PROFILES = {
    safe: { curse: 56.8, tokens: [[1, 48], [2, 26], [3, 10], [4, 5], [6, 2], [10, 0.6], [25, 0.15], ['scepter', 2], ['ankh', 3]] },
    std:  { curse: 85, tokens: [[1, 40], [2, 25], [3, 12], [5, 6], [8, 2.5], [15, 1], [40, 0.25], ['scepter', 2], ['ankh', 3]] },
    bold: { curse: 138.2, tokens: [[1, 60], [2, 15], [3, 6], [5, 3], [10, 2], [25, 1.5], [100, 0.6], ['scepter', 4], ['ankh', 1]] }
  };
  var VAULT_TOKENS = VAULT_PROFILES.std.tokens;
  var VAULT_MAX_PICKS = 7;
  function vault(rng, prof) {
    var picks = [], total = 0, shield = 0, ended = 'cleared', vp = VAULT_PROFILES[prof || 'std'];
    var pool = vp.tokens.concat([['curse', vp.curse]]);
    for (var i = 0; i < VAULT_MAX_PICKS; i++) {
      var tk = weighted(rng, pool);
      if (i < 2 && tk === 'curse') { // jamais de malédiction sur les deux premiers choix
        while (tk === 'curse') tk = weighted(rng, pool);
      }
      var rec = { token: tk, total: 0, saved: false };
      if (tk === 'curse') {
        if (shield > 0) { shield--; rec.saved = true; }
        else { rec.total = total; picks.push(rec); ended = 'curse'; break; }
      } else if (tk === 'ankh') { shield++; }
      else if (tk === 'scepter') { total *= 2; }
      else { total += tk; }
      rec.total = total;
      picks.push(rec);
    }
    if (ended === 'cleared') total += 5; // prime « chambre vidée »
    return { picks: picks, ended: ended, bonusFinish: ended === 'cleared' ? 5 : 0, total: total, profile: prof || 'std' };
  }

  /* ---------- Bonus 4 : Fureur d'Anubis (roue géante : choix d'une couleur, DOUBLE, bandes de bonus) ---------- */
  // Le joueur choisit une des 3 couleurs. La roue a des cases « nombre », des cases DOUBLE (2 par couleur) et des bandes de bonus ×N.
  // Lancer : nombre -> fin, gain = nombre × palier ; DOUBLE de SA couleur -> la roue est doublée (palier ×2) et on relance ;
  // DOUBLE d'une AUTRE couleur -> la chaîne s'arrête et on encaisse le palier : le plus petit nombre de la roue × palier ;
  // bande -> le bonus est joué (tiré d'avance, profil Équilibré), gain = gain du bonus × N × palier (une bande ne renvoie jamais vers la Fureur).
  // Les trois couleurs sont strictement symétriques : un script indépendant et de même loi est tiré d'avance pour chacune (modèle « livres »).
  var HAND_COLORS = ['turq', 'gold', 'ruby'];
  var HAND_SEGS = [
    { b: 'vault', x: 3 }, { n: 15 }, { d: 0 }, { n: 5 }, { n: 30 }, { n: 8 }, { d: 1 }, { b: 'scarab', x: 10 },
    { n: 15 }, { n: 6 }, { d: 2 }, { n: 50 }, { b: 'weigh', x: 5 }, { n: 10 }, { d: 0 }, { n: 100 },
    { n: 20 }, { n: 5 }, { d: 1 }, { b: 'scarab', x: 2 }, { n: 60 }, { n: 8 }, { d: 2 }, { n: 30 }
  ];
  var HAND_MAX_CHAIN = 4;   // nombre maximal de doublements (palier ×16) ; au palier maximal les cases DOUBLE ne comptent plus
  var HAND_MIN_N = Math.min.apply(null, HAND_SEGS.filter(function (s) { return s.n; }).map(function (s) { return s.n; }));
  function handBand(rng, seg) {
    var data = BONUS_FN[seg.b](rng, 'std');
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
  function hand(rng, colour, forced) {
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
      else if (s.b) { rec.kind = 'band'; rec.band = s.b; rec.x = s.x; rec.bonus = handBand(rng, s); }
      else { rec.kind = 'num'; rec.base = s.n; }
      spins.push(rec);
      break;
    }
    var h = { spins: spins, mult: mult, total: 0, colour: colour };
    handRecalc(h);
    return h;
  }
  function handOptions(rng) { var o = {}; HAND_COLORS.forEach(function (c, i) { o[c] = hand(rng, i); }); return o; }

  /* ---------- Bonus SECRET : la Crypte d'Anubis (colonnes de multiplicateurs) ---------- */
  // Caché : ni sur la roue, ni à l'achat. Il remplace un bonus gagné (voir SECRET_UPGRADE dans playSpin), environ 1 tour sur 500.
  // Règles (tout est tiré d'avance : la scène ne fait que rejouer) :
  //  - 5 colonnes ; chacune a un multiplicateur « du haut » (départ ×1) et 4 emplacements pour des blocs FIXES ;
  //  - 9 blocs tombent un par un, chacun dans une colonne tirée au hasard (les blocs épiques touchent toutes les colonnes) :
  //      CRÂNE (+)            : ajoute sa valeur au haut de SA colonne        CRÂNE ÉPIQUE (+)     : ajoute sa valeur au haut de TOUTES les colonnes
  //      CRÂNE D'ANUBIS (×)   : multiplie le haut de SA colonne                CRÂNE D'ANUBIS ÉPIQUE (×) : multiplie le haut de TOUTES les colonnes
  //      GLACE                : se brise et fige la valeur courante du haut en bloc FIXE ; le haut repart à ×1 (colonne pleine : la glace fond, sans effet)
  //      BROYEUR              : écrase les blocs fixes de la colonne en un seul (leur somme) et libère des emplacements (moins de 2 blocs : sans effet)
  //  - un bloc fixe n'est jamais modifié par les blocs suivants ;
  //  - gain = MOYENNE des 5 colonnes (colonne = haut + blocs fixes), plafonné à MAX_WIN. (Une simple somme aurait donné une espérance ≈ 5 fois trop forte
  //    pour rester neutre sur le RTP : le secret remplace un bonus ordinaire, son espérance doit égaler la sienne.)
  var CRYPT_COLS = 5, CRYPT_CAP = 4, CRYPT_BLOCKS = 9, CRYPT_START = 1;
  var CRYPT_COL_CAP = MAX_WIN * CRYPT_COLS;   // plafond d'une colonne (la moyenne ne peut pas dépasser MAX_WIN)
  var CRYPT_TYPES = [['skull', 22], ['epic', 3], ['anubis', 12], ['epicx', 3], ['ice', 10], ['crusher', 12]];
  var CRYPT_VALUES = {
    skull:  [[1, 58], [2, 28], [3, 9], [5, 4], [10, 1]],
    epic:   [[1, 60], [2, 30], [3, 10]],
    anubis: [[2, 64], [3, 22], [5, 9], [10, 4], [25, 1]],
    epicx:  [[2, 68], [3, 20], [5, 8], [10, 3.6], [25, 0.4]]
  };
  var SECRET_UPGRADE = 0.03;   // chance qu'un bonus gagné soit remplacé par le secret (≈ 1 tour sur 490)
  // rejoue un script de blocs [{t, c, v}] : renvoie les étapes (instantanés) et le résultat. Source unique des règles (scène et tests).
  function cryptReplay(drops) {
    var tops = [], fixed = [], steps = [], c, i, d;
    for (c = 0; c < CRYPT_COLS; c++) { tops.push(CRYPT_START); fixed.push([]); }
    drops.forEach(function (dr) {
      var st = { t: dr.t, c: dr.c, v: dr.v, froze: null, full: false, crushed: null, effect: false, before: dr.c >= 0 ? tops[dr.c] : null };
      if (dr.t === 'skull') { tops[dr.c] = Math.min(CRYPT_COL_CAP, tops[dr.c] + dr.v); st.effect = true; }
      else if (dr.t === 'epic') { for (c = 0; c < CRYPT_COLS; c++) tops[c] = Math.min(CRYPT_COL_CAP, tops[c] + dr.v); st.effect = true; }
      else if (dr.t === 'anubis') { tops[dr.c] = Math.min(CRYPT_COL_CAP, tops[dr.c] * dr.v); st.effect = true; }
      else if (dr.t === 'epicx') { for (c = 0; c < CRYPT_COLS; c++) tops[c] = Math.min(CRYPT_COL_CAP, tops[c] * dr.v); st.effect = true; }
      else if (dr.t === 'ice') {
        if (fixed[dr.c].length < CRYPT_CAP) { st.froze = tops[dr.c]; fixed[dr.c].push(tops[dr.c]); tops[dr.c] = CRYPT_START; st.effect = true; }
        else st.full = true;
      } else if (dr.t === 'crusher') {
        if (fixed[dr.c].length >= 2) {
          var sum = 0; fixed[dr.c].forEach(function (x) { sum += x; });
          st.crushed = fixed[dr.c].slice(); fixed[dr.c] = [Math.min(CRYPT_COL_CAP, sum)]; st.effect = true;
        }
      }
      st.tops = tops.slice(); st.fixed = fixed.map(function (f) { return f.slice(); });
      steps.push(st);
    });
    var cols = [], sumAll = 0;
    for (c = 0; c < CRYPT_COLS; c++) { var cs = tops[c]; fixed[c].forEach(function (x) { cs += x; }); cols.push(cs); sumAll += cs; }
    var avg = sumAll / CRYPT_COLS;
    return { steps: steps, tops: tops, fixed: fixed, cols: cols, sum: sumAll, capped: avg > MAX_WIN, total: Math.min(avg, MAX_WIN) };
  }
  // forced : liste de blocs imposée (tests visuels), complétée au hasard
  function crypt(rng, forced) {
    var drops = [], i;
    for (i = 0; i < CRYPT_BLOCKS; i++) {
      if (forced && forced[i]) { var f = forced[i]; drops.push({ t: f.t, c: (f.t === 'epic' || f.t === 'epicx') ? -1 : f.c, v: f.v || 0 }); continue; }
      var t = weighted(rng, CRYPT_TYPES), v = CRYPT_VALUES[t] ? weighted(rng, CRYPT_VALUES[t]) : 0;
      drops.push({ t: t, c: (t === 'epic' || t === 'epicx') ? -1 : Math.floor(rng() * CRYPT_COLS), v: v });
    }
    var r = cryptReplay(drops);
    return { drops: drops, steps: r.steps, tops: r.tops, fixed: r.fixed, cols: r.cols, sum: r.sum, capped: r.capped, total: r.total, profile: 'crypt' };
  }

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

  function playSpin(rng, chance) {
    var oracle = rollOracle(rng, chance);
    var index = Math.floor(rng() * N);
    var kind = LAYOUT[index];
    var def = KINDS[kind];
    var boost = (oracle && oracle.kind === kind) ? oracle.boost : 1;
    var s = { oracle: oracle, index: index, kind: kind, boost: boost, bonus: null, base: 0, pay: 0 };
    if (def.bonus) {
      if (rng() < SECRET_UPGRADE) { s.secret = true; s.bonus = crypt(rng); s.profile = 'crypt'; }   // bonus SECRET (prioritaire sur la Fureur) : aucun choix, script unique
      else if (rng() < HAND_UPGRADE) { s.options = handOptions(rng); s.bonus = s.options.turq; s.profile = 'turq'; s.upgraded = true; }
      else { s.options = drawOptions(rng, kind); s.bonus = s.options.std; s.profile = 'std'; }
      s.base = s.bonus.total;
    } else if (!def.respin) {
      s.base = def.mult;
    }
    s.pay = s.base * boost;
    return s;
  }

  // renvoie { spins:[...], total, capped }
  function playRound(rng, mode) {
    var md = MODES[mode] || MODES.std, chance = md.oracle;
    var spins = [], total = 0;
    for (var i = 0; i <= MAX_CHAIN; i++) {
      var s = playSpin(rng, chance);
      if (s.kind === 'ankh' && i === MAX_CHAIN) { // plus de relance possible : on retire
        do { s = playSpin(rng, chance); } while (s.kind === 'ankh');
      }
      spins.push(s);
      total += s.pay;
      if (s.kind !== 'ankh') break;
    }
    var capped = total > MAX_WIN;
    if (capped) total = MAX_WIN;
    return { spins: spins, total: total, capped: capped, cost: md.cost, mode: md === MODES.plus ? 'plus' : 'std' };
  }

  /* ---------- Achat de bonus ---------- */
  // Prix en x la mise, calés par simulation pour un RTP ≈ 96 % (voir tools/simulate.js <n> <graine> buy-<bonus>).
  // La Fureur d'Anubis peut toujours saisir un bonus acheté (même probabilité que sur la roue), sans boost Oracle.
  var BUY = { scarab: { price: 6.9 }, weigh: { price: 7.6 }, vault: { price: 9.1 }, hand: { price: 25.6 } };
  function playBuy(rng, kind) {
    var b, upgraded = false;
    var opts = null;
    if (kind === 'hand' || rng() < HAND_UPGRADE) { opts = handOptions(rng); b = opts.turq; upgraded = true; }
    else { opts = drawOptions(rng, kind); b = opts.std; }
    var s = { oracle: null, index: -1, kind: kind, boost: 1, bonus: b, upgraded: upgraded, base: b.total, pay: b.total, options: opts, profile: opts ? (upgraded ? 'turq' : 'std') : undefined };
    var total = Math.min(s.pay, MAX_WIN);
    return { spins: [s], total: total, capped: s.pay > MAX_WIN, cost: BUY[kind].price, mode: 'buy' };
  }

  return {
    BUY: BUY, playBuy: playBuy, applyChoice: applyChoice, drawOptions: drawOptions, PROFILES: PROFILES,
    SCARAB_PROFILES: SCARAB_PROFILES, WEIGH_PROFILES: WEIGH_PROFILES, VAULT_PROFILES: VAULT_PROFILES,
    MAX_WIN: MAX_WIN, MODES: MODES, N: N, LAYOUT: LAYOUT, KINDS: KINDS,
    SCARAB_ROWS: SCARAB_ROWS, SCARAB_VALUES: SCARAB_VALUES, SCARAB_BALLS: SCARAB_BALLS,
    WEIGH_PAIRS: WEIGH_PAIRS, weighGain: weighGain, VAULT_TILES: VAULT_TILES, VAULT_MAX_PICKS: VAULT_MAX_PICKS,
    CRYPT_COLS: CRYPT_COLS, CRYPT_CAP: CRYPT_CAP, CRYPT_BLOCKS: CRYPT_BLOCKS, CRYPT_START: CRYPT_START, CRYPT_TYPES: CRYPT_TYPES, CRYPT_VALUES: CRYPT_VALUES, SECRET_UPGRADE: SECRET_UPGRADE, cryptReplay: cryptReplay,
    HAND_SEGS: HAND_SEGS, HAND_COLORS: HAND_COLORS, HAND_MAX_CHAIN: HAND_MAX_CHAIN, HAND_MIN_N: HAND_MIN_N, handOptions: handOptions, handRecalc: handRecalc, HAND_UPGRADE: HAND_UPGRADE, ORACLE_CHANCE: ORACLE_CHANCE,
    mulberry32: mulberry32, cryptoRng: cryptoRng,
    playRound: playRound, playSpin: playSpin,
    _bonus: { scarab: scarab, weigh: weigh, vault: vault, hand: hand, crypt: crypt }
  };
});
