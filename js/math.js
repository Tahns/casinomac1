/* HAND OF ANUBIS — noyau mathématique.
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
  var HAND_UPGRADE = 0.08; // chance qu'un bonus soit saisi par la Main d'Anubis

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
  // Trois profils de même espérance (≈ 5,83) : paires proches / d'origine / très écartées.
  var WEIGH_PROFILES = {
    safe: [[[2, 3], 37], [[3, 5], 31], [[4, 6], 25], [[5, 8], 24], [[6, 10], 6], [[10, 16], 2], [[20, 30], 2], [[40, 60], 1], [[60, 100], 1]],
    std:  [[[1, 3], 34], [[2, 5], 28], [[3, 8], 20], [[4, 12], 10], [[6, 25], 5], [[12, 60], 2], [[20, 150], 0.9]],
    bold: [[[0.5, 2], 38], [[1, 5], 37], [[1, 10], 17], [[2, 20], 9], [[3, 40], 3], [[5, 80], 1], [[10, 150], 1], [[20, 150], 1]]
  };
  var WEIGH_PAIRS = WEIGH_PROFILES.std;
  function weigh(rng, prof) {
    var pair = weighted(rng, WEIGH_PROFILES[prof || 'std']);
    var heavy = rng() < 0.5 ? 0 : 1; // 0 = plume (gauche) 1 = cœur (droite) — celui qui descend
    return { pair: pair, heavy: heavy, total: pair[heavy], profile: prof || 'std' };
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

  /* ---------- Bonus 4 : Main d'Anubis (roue géante à multiplicateurs) ---------- */
  var HAND_SEGS = [
    { n: 2 }, { n: 3 }, { n: 3 }, { x: 2 }, { n: 4 }, { n: 4 }, { n: 5 }, { n: 5 }, { n: 6 }, { x: 2 }, { n: 6 }, { n: 8 }, { n: 8 }, { n: 10 }, { n: 10 }, { x: 3 }, { n: 12 }, { n: 15 }, { n: 20 }, { n: 25 }, { n: 40 }, { x: 4 }, { n: 60 }, { n: 100 }
  ];
  var HAND_MAX_CHAIN = 2;
  function hand(rng) {
    var spins = [], mult = 1, total = 0;
    for (var i = 0; i < 8; i++) {
      var idx = Math.floor(rng() * HAND_SEGS.length);
      var s = HAND_SEGS[idx];
      if (s.x && i < HAND_MAX_CHAIN) { mult *= s.x; spins.push({ idx: idx, mult: mult, final: false }); continue; }
      if (s.x) { // chaîne maximale atteinte : on force un nombre
        do { idx = Math.floor(rng() * HAND_SEGS.length); s = HAND_SEGS[idx]; } while (!s.n);
      }
      total = s.n * mult;
      spins.push({ idx: idx, mult: mult, final: true, base: s.n });
      break;
    }
    return { spins: spins, mult: mult, total: total };
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
      if (rng() < HAND_UPGRADE) { s.bonus = hand(rng); s.upgraded = true; }
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
  // La Main d'Anubis peut toujours saisir un bonus acheté (même probabilité que sur la roue), sans boost Oracle.
  var BUY = { scarab: { price: 6.9 }, weigh: { price: 7.6 }, vault: { price: 9.1 }, hand: { price: 25.6 } };
  function playBuy(rng, kind) {
    var b, upgraded = false;
    var opts = null;
    if (kind === 'hand' || rng() < HAND_UPGRADE) { b = hand(rng); upgraded = true; }
    else { opts = drawOptions(rng, kind); b = opts.std; }
    var s = { oracle: null, index: -1, kind: kind, boost: 1, bonus: b, upgraded: upgraded, base: b.total, pay: b.total, options: opts, profile: opts ? 'std' : undefined };
    var total = Math.min(s.pay, MAX_WIN);
    return { spins: [s], total: total, capped: s.pay > MAX_WIN, cost: BUY[kind].price, mode: 'buy' };
  }

  return {
    BUY: BUY, playBuy: playBuy, applyChoice: applyChoice, drawOptions: drawOptions, PROFILES: PROFILES,
    SCARAB_PROFILES: SCARAB_PROFILES, WEIGH_PROFILES: WEIGH_PROFILES, VAULT_PROFILES: VAULT_PROFILES,
    MAX_WIN: MAX_WIN, MODES: MODES, N: N, LAYOUT: LAYOUT, KINDS: KINDS,
    SCARAB_ROWS: SCARAB_ROWS, SCARAB_VALUES: SCARAB_VALUES, SCARAB_BALLS: SCARAB_BALLS,
    WEIGH_PAIRS: WEIGH_PAIRS, VAULT_TILES: VAULT_TILES, VAULT_MAX_PICKS: VAULT_MAX_PICKS,
    HAND_SEGS: HAND_SEGS, HAND_UPGRADE: HAND_UPGRADE, ORACLE_CHANCE: ORACLE_CHANCE,
    mulberry32: mulberry32, cryptoRng: cryptoRng,
    playRound: playRound, playSpin: playSpin,
    _bonus: { scarab: scarab, weigh: weigh, vault: vault, hand: hand }
  };
});
