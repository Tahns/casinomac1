// node tools/rtp-exact.js — RTP, écart-type, taux de gain et prix d'achat calculés EXACTEMENT (aucun tirage), à partir des tables de js/math.js.
// Pourquoi : à très haute volatilité (écart-type ≈ 16), 2 M de tours ne donnent le RTP qu'à ± 2 points ; le calcul exact (moments d'ordre 1 et 2) est la
// référence, la simulation (tools/simulate.js) sert à la recouper. compute() : RTP, écart-type et taux de gain AVEC le plafond (loi exacte, summary) ; moments
// sans plafond dans « uncapped » (la Colère d'Anubis rend le plafond sensible : 0,5 pt de RTP). Le Sanctuaire des Marées est calculé exactement (moments :
// cryptMoments ; loi : cryptDist, propagation à rebours). Options : --loi (fréquence des gros gains par mode), --variance (part de la variance par source).
var M = require('../js/math.js');
function typeProbs() { var W = 0, o = {}; M.CRYPT_TYPES.forEach(function (t) { W += t[1]; }); M.CRYPT_TYPES.forEach(function (t) { o[t[0]] = t[1] / W; }); return o; }
function cryptMoments() {   // [E[gain], E[gain²]] : état (P, T) -> moments m = [P², PT, T², P, T]
  var pr = typeProbs(), vm = {};
  ['tab', 'tide', 'eclipse'].forEach(function (k) { vm[k] = wmom(M.CRYPT_VALUES[k]); });
  var m = [0, 0, 1, 0, 1], i;   // offrande de départ 0 (plancher ×1 si aucune tablette : voir cryptReplay), marée ×1
  for (i = 0; i < M.CRYPT_CELLS; i++) {
    var a = m[0], b = m[1], c = m[2], p = m[3], t = m[4], v1 = vm.tab[0], v2 = vm.tab[1], k1 = vm.tide[0], k2 = vm.tide[1], e1 = vm.eclipse[0], e2 = vm.eclipse[1];
    m = [
      pr.dust * a + pr.tab * (a + 2 * v1 * b + v2 * c) + pr.tide * a + pr.eclipse * e2 * a,
      pr.dust * b + pr.tab * (b + v1 * c) + pr.tide * k1 * b + pr.eclipse * e1 * b,
      pr.dust * c + pr.tab * c + pr.tide * k2 * c + pr.eclipse * c,
      pr.dust * p + pr.tab * (p + v1 * t) + pr.tide * p + pr.eclipse * e1 * p,
      pr.dust * t + pr.tab * t + pr.tide * k1 * t + pr.eclipse * t
    ];
  }
  var q = Math.pow(1 - pr.tab, M.CRYPT_CELLS);   // aucune tablette : offrande 0, relevée au plancher ×1
  return [m[3] + q, m[0] + q];
}

function wmom(tab) { var s = 0, a = 0, b = 0; tab.forEach(function (t) { s += t[1]; }); tab.forEach(function (t) { a += t[1] * t[0]; b += t[1] * t[0] * t[0]; }); return [a / s, b / s]; }
function scarab(prof) {
  var v = M.SCARAB_PROFILES[prof], bn = [1, 8, 28, 56, 70, 56, 28, 8, 1], m1 = 0, m2 = 0;
  v.forEach(function (x, i) { m1 += bn[i] / 256 * x; m2 += bn[i] / 256 * x * x; });
  return [3 * m1, 3 * (m2 - m1 * m1) + 9 * m1 * m1];
}
function weigh(prof) {   // gain = multiplicateur du plateau choisi s'il est le plus lourd (1 chance sur 2), valeurs attribuées au hasard
  var s = 0, a = 0, b = 0, tab = M.WEIGH_PROFILES[prof];
  tab.forEach(function (t) { s += t[1]; });
  tab.forEach(function (t) { var p = t[0]; a += t[1] * 0.5 * (p[0] + p[1]) / 2; b += t[1] * 0.5 * (p[0] * p[0] + p[1] * p[1]) / 2; });
  return [a / s, b / s];
}
function vaultOf(vp) {   // calcul exact par propagation des lois (position, coffres permis, total) : clé d'or = +VAULT_KEY_PICKS coffres (plafonné)
  var pool = vp.tokens.concat([['seal', vp.seal]]), W = 0, E = 0, E2 = 0, i;
  pool.forEach(function (t) { W += t[1]; });
  var Wns = W - vp.seal, layer = new Map();
  layer.set(M.VAULT_BASE_PICKS + '|0', 1);   // clé « permis|total »
  for (i = 0; i < M.VAULT_PICK_CAP; i++) {
    var next = new Map();
    layer.forEach(function (p, key) {
      var parts = key.split('|'), allowed = +parts[0], total = +parts[1];
      if (i >= allowed) { var f = total + M.VAULT_FINISH; E += p * f; E2 += p * f * f; return; }
      pool.forEach(function (t) {
        var pr = i < 2 ? (t[0] === 'seal' ? 0 : t[1] / Wns) : t[1] / W, k = t[0];
        if (!pr) return;
        if (k === 'seal') { E += p * pr * total; E2 += p * pr * total * total; return; }
        var al = allowed, tt = total;
        if (k === 'key') al = Math.min(M.VAULT_PICK_CAP, allowed + M.VAULT_KEY_PICKS); else if (k === 'scepter') tt = total * 2; else tt = total + k;
        var nk = al + '|' + tt; next.set(nk, (next.get(nk) || 0) + p * pr);
      });
    });
    layer = next;
  }
  layer.forEach(function (p, key) { var f = +key.split('|')[1] + M.VAULT_FINISH; E += p * f; E2 += p * f * f; });
  return [E, E2];
}
function vault(prof) { return vaultOf(M.VAULT_PROFILES[prof]); }
var FN = { scarab: scarab, weigh: weigh, vault: vault };

function compute() {
  var BON = {}, h = M.HAND_UPGRADE, s = M.SECRET_UPGRADE;
  ['scarab', 'weigh', 'vault'].forEach(function (k) { BON[k] = {}; M.PROFILES.forEach(function (p) { BON[k][p] = FN[k](p); }); });
  // Fureur d'Anubis (couleur 0 ; les trois couleurs sont symétriques)
  var S = M.HAND_SEGS, n = S.length, MAXL = M.HAND_MAX_CHAIN;
  function V(excl) {
    var cnt = 0, a = 0, b = 0;
    S.forEach(function (sg) {
      if (sg.d === 0 || (excl && sg.d != null)) return;
      cnt++;
      if (sg.n) { a += sg.n; b += sg.n * sg.n; }
      else if (sg.d != null) { a += M.HAND_MIN_N; b += M.HAND_MIN_N * M.HAND_MIN_N; }
      else { var m = BON[sg.b].std; a += m[0] * sg.x; b += m[1] * sg.x * sg.x; }
    });
    return [a / cnt, b / cnt];
  }
  var q = S.filter(function (sg) { return sg.d === 0; }).length / n, v22 = V(false), v18 = V(true), H = [0, 0], L, pr, m;
  for (L = 0; L < MAXL; L++) { pr = Math.pow(q, L) * (1 - q); m = Math.pow(2, L); H[0] += pr * m * v22[0]; H[1] += pr * m * m * v22[1]; }
  pr = Math.pow(q, MAXL); m = Math.pow(2, MAXL); H[0] += pr * m * v18[0]; H[1] += pr * m * m * v18[1];
  // bonus gagné sur la roue = (1-s)·[(1-h)·bonus profil Équilibré + h·Fureur] + s·Sanctuaire des Marées
  var rep = {}, rep1 = 0;
  ['scarab', 'weigh', 'vault'].forEach(function (k) { rep[k] = [(1 - h) * BON[k].std[0] + h * H[0], (1 - h) * BON[k].std[1] + h * H[1]]; rep1 += rep[k][0] / 3; });
  var C = cryptMoments();
  function onWheel(k) { return [(1 - s) * rep[k][0] + s * C[0], (1 - s) * rep[k][1] + s * C[1]]; }
  var W = 0;
  M.ORACLE_KIND_W.forEach(function (t) { W += t[1]; });
  // composantes du gain de la case finale d'un tour : { src, oracle, p, m1, m2, hit } (src : num | scarab | weigh | vault | hand | crypt)
  // wrath : roue de la Colère d'Anubis (seules les cases de M.WRATH_KINDS)
  function spinComponents(qo, wrath) {
    var cc = cellCounts(wrath), Nn = 0, out = [];
    Object.keys(cc).forEach(function (k) { Nn += cc[k]; });
    Object.keys(cc).forEach(function (k) {
      var d = M.KINDS[k], pk = cc[k] / Nn, wk = 0, b = wmom(M.ORACLE_BOOST[d.bonus ? 'bonus' : 'num']);
      M.ORACLE_KIND_W.forEach(function (t) { if (t[0] === k) wk = t[1]; });
      var po = qo * wk / W;
      var parts = d.bonus ? [[k, (1 - s) * (1 - h), BON[k].std, k === 'weigh' ? 0.5 : 1], ['hand', (1 - s) * h, H, 1], ['crypt', s, C, 1]]
        : [['num', 1, [d.mult, d.mult * d.mult], d.mult > 0 ? 1 : 0]];
      parts.forEach(function (pt) {
        out.push({ src: pt[0], kind: k, oracle: false, p: pk * pt[1] * (1 - po), m1: pt[2][0], m2: pt[2][1], hit: pt[3] });
        if (po) out.push({ src: pt[0], kind: k, oracle: true, p: pk * pt[1] * po, m1: pt[2][0] * b[0], m2: pt[2][1] * b[1], hit: pt[3] });
      });
    });
    return out;
  }
  function round(md) {
    var q = md.wrath || 0, comps = [], E = 0, E2 = 0, hit = 0, pb = 0;
    spinComponents(md.oracle, false).forEach(function (c) { c.p *= 1 - q; c.wrath = 1; comps.push(c); });
    if (q) wrathLadder().forEach(function (lm) {
      spinComponents(md.oracle, true).forEach(function (c) { c.p *= q * lm[1]; c.wrath = lm[0]; c.m1 *= lm[0]; c.m2 *= lm[0] * lm[0]; comps.push(c); });
    });
    comps.forEach(function (c) { E += c.p * c.m1; E2 += c.p * c.m2; hit += c.p * c.hit; if (c.src !== 'num') pb += c.p; });
    return { mean: E, sd: Math.sqrt(E2 - E * E), hit: hit, bonusProb: pb, comps: comps };
  }
  // RTP, écart-type et taux de gain AVEC le plafond de 25 000× : tirés de la loi exacte (summary) ; la Colère d'Anubis rend le plafond sensible
  // (sans plafond, l'Oracle ×100 sur une Colère ×100 dépasse 25 000× de loin). Les moments sans plafond restent dans `uncapped` (décomposition).
  var std = round(M.MODES.std), plus = round(M.MODES.plus), Ss = summary('std'), Sp = summary('plus');
  var buy = {};
  ['scarab', 'weigh', 'vault', 'hand'].forEach(function (k) {
    var S = summary(BUY_MODE[k]);
    buy[k] = { mean: S.mean, sd: S.sd, hit: S.hit, price: M.BUY[k].price, rtp: S.mean / M.BUY[k].price, sdRel: S.sd / M.BUY[k].price, fair: S.mean / 0.96 };
  });
  var wl = wrathLadder(), wm1 = 0, wm2 = 0;
  wl.forEach(function (x) { wm1 += x[0] * x[1]; wm2 += x[0] * x[0] * x[1]; });
  return {
    std: { mean: Ss.mean, sd: Ss.sd, hit: Ss.hit },
    plus: { mean: Sp.mean / M.MODES.plus.cost, sd: Sp.sd, sdRel: Sp.sd / M.MODES.plus.cost, hit: Sp.hit },
    uncapped: { std: { mean: std.mean, sd: std.sd, hit: std.hit }, plus: { mean: plus.mean / M.MODES.plus.cost, sd: plus.sd, hit: plus.hit },
      buy: { scarab: rep.scarab, weigh: rep.weigh, vault: rep.vault, hand: H } },
    buy: buy, bonusEvery: 1 / std.bonusProb, bonus: BON, hand: H, replaced: rep1,
    wrath: { ladder: wl, mean: wm1, m2: wm2 },
    comps: { std: std.comps, plus: plus.comps }
  };
}
// cases où la roue peut finir un tour (sans les Ankh) ; pendant la Colère d'Anubis, seulement M.WRATH_KINDS
function cellCounts(wrath) { var o = {}; Object.keys(M.KINDS).forEach(function (k) { var d = M.KINDS[k]; if (d.respin || (wrath && (M.WRATH_KINDS || []).indexOf(k) < 0)) return; o[k] = d.count; }); return o; }
// loi EXACTE du multiplicateur final de la Colère : cran de départ (WRATH_START) + nombre d'Ankh L avant la case finale
// (sur la roue de la Colère, P(Ankh) = a = Ankh / cases non « 0 » ; L < MAX_CHAIN : a^L (1 - a) ; L = MAX_CHAIN : a^MAX_CHAIN, la dernière relance est retirée hors Ankh)
function wrathLadder() {
  var n = 0, ws = 0, pm = {}, out = [];
  if (!M.WRATH_START) return out;   // version des maths sans Colère d'Anubis (comparaison avant / après)
  M.LAYOUT.forEach(function (k) { if (M.WRATH_KINDS.indexOf(k) >= 0) n++; });
  var a = M.KINDS.ankh.count / n;
  M.WRATH_START.forEach(function (t) { ws += t[1]; });
  M.WRATH_START.forEach(function (st) {
    for (var l = 0; l <= M.MAX_CHAIN; l++) {
      var pl = l < M.MAX_CHAIN ? Math.pow(a, l) * (1 - a) : Math.pow(a, M.MAX_CHAIN), m = M.WRATH_LADDER[Math.min(st[0] + l, M.WRATH_TOP)];
      pm[m] = (pm[m] || 0) + st[1] / ws * pl;
    }
  });
  M.WRATH_LADDER.forEach(function (m) { if (pm[m]) out.push([m, pm[m]]); });
  return out;
}

/* ---------- Loi EXACTE du gain d'un tour (et non plus seulement ses deux premiers moments) ----------
 * Gains en DIXIÈMES de mise (entiers : tous les gains du jeu sont des multiples de 0,1×), plafonnés à MAX_WIN. Aucun tirage : chaque bonus est
 * énuméré (Scarabées : 3 billes binomiales ; Pesée : paires ; Trésor : propagation (coffres permis, total) ; Fureur : paliers × segments × bonus
 * imbriqués ; Sanctuaire : propagation (offrande, marée) plafonnées), puis la roue, l'Oracle et la Colère d'Anubis mélangent ces lois.
 * Sert à la fréquence des gros gains, au taux de zéro, à l'écart-type AVEC plafond et aux cibles de l'optimiseur (stake-math/game_optimization.py). */
var CAPU = M.MAX_WIN * 10;
function tenth(x) { return Math.round(x * 10); }
function dAdd(d, v, p) { if (v > CAPU) v = CAPU; d.set(v, (d.get(v) || 0) + p); }
function dScale(d, f) { var o = new Map(); d.forEach(function (p, v) { dAdd(o, v * f, p); }); return o; }
function dMix(list) { var o = new Map(); list.forEach(function (e) { e[0].forEach(function (p, v) { dAdd(o, v, p * e[1]); }); }); return o; }
function dConv(a, b) { var o = new Map(); a.forEach(function (p, v) { b.forEach(function (q, w) { dAdd(o, v + w, p * q); }); }); return o; }
function scarabDist(prof) {
  var one = new Map(), bn = [1, 8, 28, 56, 70, 56, 28, 8, 1];
  M.SCARAB_PROFILES[prof].forEach(function (x, i) { dAdd(one, tenth(x), bn[i] / 256); });
  return dConv(dConv(one, one), one);
}
function weighDist(prof) {
  var d = new Map(), sw = 0, tab = M.WEIGH_PROFILES[prof];
  tab.forEach(function (t) { sw += t[1]; });
  tab.forEach(function (t) { var p = t[1] / sw; dAdd(d, 0, p / 2); dAdd(d, tenth(t[0][0]), p / 4); dAdd(d, tenth(t[0][1]), p / 4); });
  return d;
}
function vaultDist(vp) {
  var pool = vp.tokens.concat([['seal', vp.seal]]), Wt = 0, i, out = new Map();
  pool.forEach(function (t) { Wt += t[1]; });
  var Wns = Wt - vp.seal, layer = new Map();
  layer.set(M.VAULT_BASE_PICKS + '|0', 1);
  for (i = 0; i < M.VAULT_PICK_CAP; i++) {
    var next = new Map();
    layer.forEach(function (p, key) {
      var parts = key.split('|'), allowed = +parts[0], total = +parts[1];
      if (i >= allowed) { dAdd(out, tenth(total + M.VAULT_FINISH), p); return; }
      pool.forEach(function (t) {
        var pr = i < 2 ? (t[0] === 'seal' ? 0 : t[1] / Wns) : t[1] / Wt, k = t[0];
        if (!pr) return;
        if (k === 'seal') { dAdd(out, tenth(total), p * pr); return; }
        var al = allowed, tt = total;
        if (k === 'key') al = Math.min(M.VAULT_PICK_CAP, allowed + M.VAULT_KEY_PICKS); else if (k === 'scepter') tt = total * 2; else tt = total + k;
        var nk = al + '|' + tt; next.set(nk, (next.get(nk) || 0) + p * pr);
      });
    });
    layer = next;
  }
  layer.forEach(function (p, key) { dAdd(out, tenth(+key.split('|')[1] + M.VAULT_FINISH), p); });
  return out;
}
function handDist() {
  var S = M.HAND_SEGS, n = S.length, q = S.filter(function (sg) { return sg.d === 0; }).length / n, parts = [], L;
  var B = { scarab: scarabDist('std'), weigh: weighDist('std'), vault: vaultDist(M.VAULT_PROFILES.std) };
  function seg(excl, m) {   // loi du lancer final au palier m (excl : les DOUBLE ne comptent plus, palier maximal)
    var list = [];
    S.forEach(function (sg) {
      if (sg.d === 0 || (excl && sg.d != null)) return;
      var d;
      if (sg.n) { d = new Map(); dAdd(d, tenth(sg.n), 1); }
      else if (sg.d != null) { d = new Map(); dAdd(d, tenth(M.HAND_MIN_N), 1); }
      else d = dScale(B[sg.b], sg.x);
      list.push([dScale(d, m), 1]);
    });
    list.forEach(function (e) { e[1] = 1 / list.length; });
    return dMix(list);
  }
  for (L = 0; L < M.HAND_MAX_CHAIN; L++) parts.push([seg(false, Math.pow(2, L)), Math.pow(q, L) * (1 - q)]);
  parts.push([seg(true, Math.pow(2, M.HAND_MAX_CHAIN)), Math.pow(q, M.HAND_MAX_CHAIN)]);
  return dMix(parts);
}
// Sanctuaire : offrande finale = Σ (tablette j) v_j × (marées avant j) × (éclipses après j). Propagation À REBOURS (de la 9e tablette à la 1re)
// sur l'état (E, F) = (produit des éclipses suivantes, offrande apportée par les tablettes suivantes pour une marée ×1) : bien plus petit que
// l'état (offrande, marée) de la propagation directe. Tablette : F += v·E ; marée ×k : F ×= k ; éclipse ×e : E ×= e. Gain = max(F, 1).
// Valeurs en × la mise (entiers : tablettes, marées et éclipses sont entières), F et E plafonnés à MAX_WIN (F ne décroît jamais : le gain plafonné ne change pas).
function cryptDist() {
  var pr = {}, Wt = 0, vals = {}, CAP = M.MAX_WIN, K = 32768, i;
  M.CRYPT_TYPES.forEach(function (t) { Wt += t[1]; });
  M.CRYPT_TYPES.forEach(function (t) { pr[t[0]] = t[1] / Wt; });
  Object.keys(M.CRYPT_VALUES).forEach(function (k) { var sw = 0; M.CRYPT_VALUES[k].forEach(function (t) { sw += t[1]; }); vals[k] = M.CRYPT_VALUES[k].map(function (t) { return [t[0], pr[k] * t[1] / sw]; }); });
  var st = new Map(); st.set(1 * K + 0, 1);   // clé = E·K + F
  for (i = 0; i < M.CRYPT_CELLS; i++) {
    var nx = new Map();
    st.forEach(function (p, key) {
      var E = Math.floor(key / K), F = key - E * K, j, k, f;
      nx.set(key, (nx.get(key) || 0) + p * pr.dust);
      for (j = 0; j < vals.tab.length; j++) { f = Math.min(F + vals.tab[j][0] * E, CAP); k = E * K + f; nx.set(k, (nx.get(k) || 0) + p * vals.tab[j][1]); }
      for (j = 0; j < vals.tide.length; j++) { f = Math.min(F * vals.tide[j][0], CAP); k = E * K + f; nx.set(k, (nx.get(k) || 0) + p * vals.tide[j][1]); }
      for (j = 0; j < vals.eclipse.length; j++) { k = Math.min(E * vals.eclipse[j][0], CAP) * K + F; nx.set(k, (nx.get(k) || 0) + p * vals.eclipse[j][1]); }
    });
    st = nx;
  }
  var out = new Map();
  st.forEach(function (p, key) { var F = key % K; dAdd(out, 10 * Math.max(F, 1), p); });   // plancher ×1
  return out;
}
var _bonusDists = null;
function bonusDists() {
  if (_bonusDists) return _bonusDists;
  var h = M.HAND_UPGRADE, s = M.SECRET_UPGRADE, H = handDist(), Cd = cryptDist(), o = { hand: H, crypt: Cd, buy: {}, wheel: {} };
  [['scarab', scarabDist('std')], ['weigh', weighDist('std')], ['vault', vaultDist(M.VAULT_PROFILES.std)]].forEach(function (e) {
    o[e[0]] = e[1];
    o.buy[e[0]] = dMix([[e[1], 1 - h], [H, h]]);                    // achat : Fureur possible, jamais de Sanctuaire
    o.wheel[e[0]] = dMix([[o.buy[e[0]], 1 - s], [Cd, s]]);           // gagné sur la roue : Sanctuaire possible
  });
  o.buy.hand = H;
  _bonusDists = o;
  return o;
}
function spinDist(qo, wrath) {
  var cc = cellCounts(wrath), Nn = 0, BD = bonusDists(), list = [], Wo = 0;
  M.ORACLE_KIND_W.forEach(function (t) { Wo += t[1]; });
  Object.keys(cc).forEach(function (k) { Nn += cc[k]; });
  Object.keys(cc).forEach(function (k) {
    var d = M.KINDS[k], pk = cc[k] / Nn, wk = 0, base, tb = M.ORACLE_BOOST[d.bonus ? 'bonus' : 'num'], sb = 0;
    M.ORACLE_KIND_W.forEach(function (t) { if (t[0] === k) wk = t[1]; });
    if (d.bonus) base = BD.wheel[k]; else { base = new Map(); dAdd(base, tenth(d.mult), 1); }
    var po = qo * wk / Wo;
    list.push([base, pk * (1 - po)]);
    tb.forEach(function (t) { sb += t[1]; });
    if (po) tb.forEach(function (t) { list.push([dScale(base, t[0]), pk * po * t[1] / sb]); });
  });
  return dMix(list);
}
// loi exacte du gain (en dixièmes, plafonné) d'un tour du mode : std | plus | bonus_scarab | bonus_weigh | bonus_vault | bonus_fury
var BUY_OF = { bonus_scarab: 'scarab', bonus_weigh: 'weigh', bonus_vault: 'vault', bonus_fury: 'hand' }, BUY_MODE = { scarab: 'bonus_scarab', weigh: 'bonus_weigh', vault: 'bonus_vault', hand: 'bonus_fury' };
var _dist = {};
function distribution(mode) {
  if (_dist[mode]) return _dist[mode];
  if (BUY_OF[mode]) return (_dist[mode] = bonusDists().buy[BUY_OF[mode]]);
  var md = M.MODES[mode], q = md.wrath || 0, list = [[spinDist(md.oracle, false), 1 - q]];
  if (q) { var sw = spinDist(md.oracle, true); wrathLadder().forEach(function (lm) { list.push([dScale(sw, lm[0]), q * lm[1]]); }); }
  return (_dist[mode] = dMix(list));
}
// paliers de gain (en × la mise ; bornes incluses) : fréquence des gros gains et fences de l'optimiseur (stake-math/game_optimization.py)
var TIERS = [['0', 0, 0], ['<1', 0.1, 0.9], ['1-10', 1, 9.9], ['10-100', 10, 99.9], ['100-1000', 100, 999.9], ['1000+', 1000, M.MAX_WIN - 0.1], ['max', M.MAX_WIN, M.MAX_WIN]];
function summary(mode) {
  var d = distribution(mode), cost = BUY_OF[mode] ? M.BUY[BUY_OF[mode]].price : M.MODES[mode].cost, E = 0, E2 = 0, tiers = {};
  TIERS.forEach(function (t) { tiers[t[0]] = { p: 0, mean: 0 }; });
  d.forEach(function (p, v) {
    var x = v / 10; E += p * x; E2 += p * x * x;
    TIERS.forEach(function (t) { if (v >= tenth(t[1]) && v <= tenth(t[2])) { tiers[t[0]].p += p; tiers[t[0]].mean += p * x; } });
  });
  Object.keys(tiers).forEach(function (k) { var t = tiers[k]; t.rtp = t.mean / cost; t.mean = t.p ? t.mean / t.p : 0; });
  var atLeast = function (x) { var s = 0; d.forEach(function (p, v) { if (v >= tenth(x)) s += p; }); return s; };
  return { mode: mode, cost: cost, mean: E, rtp: E / cost, sd: Math.sqrt(E2 - E * E), sdRel: Math.sqrt(E2 - E * E) / cost, zero: d.get(0) || 0, hit: 1 - (d.get(0) || 0), tiers: tiers, atLeast: atLeast, support: d.size };
}
// décomposition de la variance du mode (part de E[X²] par source, moments sans plafond) : base de docs/VOLATILITE.md
function decompose(mode) {
  var r = compute(), comps = r.comps[mode], E = 0, E2 = 0, out = {};
  comps.forEach(function (c) {
    var name = (c.wrath > 1 ? 'Colère · ' : '') + ({ num: 'cases ×', scarab: 'Scarabées', weigh: 'Pesée', vault: 'Trésor', hand: 'Fureur', crypt: 'Sanctuaire' })[c.src] + (c.oracle ? ' + Oracle' : '');
    var o = out[name] || (out[name] = { p: 0, rtp: 0, m2: 0 });
    o.p += c.p; o.rtp += c.p * c.m1; o.m2 += c.p * c.m2; E += c.p * c.m1; E2 += c.p * c.m2;
  });
  return { mean: E, var: E2 - E * E, m2: E2, parts: out };
}
// même décomposition, mais AVEC le plafond (chaque composante est une loi exacte plafonnée) : c'est elle qui décrit le jeu réellement servi
function decomposeCapped(mode) {
  var md = M.MODES[mode], q = md.wrath || 0, BD = bonusDists(), h = M.HAND_UPGRADE, s = M.SECRET_UPGRADE, Wo = 0, out = {}, E = 0, E2 = 0;
  M.ORACLE_KIND_W.forEach(function (t) { Wo += t[1]; });
  var names = { num: 'cases ×', scarab: 'Scarabées', weigh: 'Pesée', vault: 'Trésor', hand: 'Fureur', crypt: 'Sanctuaire' };
  function addComp(name, p, d, f) {
    var a = 0, b = 0;
    d.forEach(function (pp, v) { var x = Math.min(v * f, CAPU) / 10; a += pp * x; b += pp * x * x; });
    var o = out[name] || (out[name] = { p: 0, rtp: 0, m2: 0 });
    o.p += p; o.rtp += p * a; o.m2 += p * b; E += p * a; E2 += p * b;
  }
  var levels = [[1, 1 - q]].concat(q ? wrathLadder().map(function (lm) { return [lm[0], q * lm[1]]; }) : []);
  levels.forEach(function (lv, li) {
    var wrath = li > 0, cc = cellCounts(wrath), Nn = 0;
    Object.keys(cc).forEach(function (k) { Nn += cc[k]; });
    Object.keys(cc).forEach(function (k) {
      var d = M.KINDS[k], pk = cc[k] / Nn, wk = 0, tb = M.ORACLE_BOOST[d.bonus ? 'bonus' : 'num'], sb = 0;
      M.ORACLE_KIND_W.forEach(function (t) { if (t[0] === k) wk = t[1]; });
      tb.forEach(function (t) { sb += t[1]; });
      var po = md.oracle * wk / Wo, pt = new Map();
      dAdd(pt, tenth(d.mult || 0), 1);
      var subs = d.bonus ? [[k, (1 - s) * (1 - h), BD[k]], ['hand', (1 - s) * h, BD.hand], ['crypt', s, BD.crypt]] : [['num', 1, pt]];
      subs.forEach(function (sub) {
        var base = (wrath ? 'Colère · ' : '') + names[sub[0]];
        addComp(base, lv[1] * pk * sub[1] * (1 - po), sub[2], lv[0]);
        if (po) tb.forEach(function (t) { addComp(base + ' + Oracle', lv[1] * pk * sub[1] * po * t[1] / sb, sub[2], lv[0] * t[0]); });
      });
    });
  });
  return { mean: E, var: E2 - E * E, m2: E2, parts: out };
}
// écart-type MINIMAL d'une table pondérée dont chaque palier [cuts[i], cuts[i+1]) garde sa probabilité et son gain moyen exacts
// (inégalité de Jensen : vrai quel que soit le façonnage de l'optimiseur à l'intérieur des paliers). cuts en × la mise, croissants.
function tableFloorSd(mode, cuts) {
  var d = distribution(mode), P = cuts.map(function () { return 0; }), S1 = P.slice(), mu = 0, fl = 0;
  d.forEach(function (p, v) { var x = v / 10; mu += p * x; for (var i = cuts.length - 1; i >= 0; i--) if (v >= tenth(cuts[i])) { P[i] += p; S1[i] += p * x; break; } });
  P.forEach(function (p, i) { if (p) fl += S1[i] * S1[i] / p; });
  return Math.sqrt(Math.max(fl - mu * mu, 0));
}
module.exports = compute;
module.exports.decomposeCapped = decomposeCapped;
module.exports.tableFloorSd = tableFloorSd;
module.exports.vaultOf = vaultOf;
module.exports.cryptMoments = cryptMoments;
module.exports.wrathLadder = wrathLadder;
module.exports.distribution = distribution;
module.exports.summary = summary;
module.exports.decompose = decompose;
module.exports.TIERS = TIERS;
module.exports.MODES = ['std', 'plus', 'bonus_scarab', 'bonus_weigh', 'bonus_vault', 'bonus_fury'];

if (require.main === module) {
  var r = compute();
  console.log('Standard : RTP ' + (r.std.mean * 100).toFixed(2) + ' %   écart-type ' + r.std.sd.toFixed(2) + '×   taux de gain ' + (r.std.hit * 100).toFixed(1) + ' %   bonus 1 / ' + r.bonusEvery.toFixed(1));
  console.log('Oracle+  : RTP ' + (r.plus.mean * 100).toFixed(2) + ' %   écart-type ' + r.plus.sdRel.toFixed(2) + '× (rapporté au coût ×' + M.MODES.plus.cost + ')   taux de gain ' + (r.plus.hit * 100).toFixed(1) + ' %');
  Object.keys(r.buy).forEach(function (k) { var b = r.buy[k]; console.log('Achat ' + k.padEnd(6) + ' prix ' + b.price + '× (prix à 96 % : ' + b.fair.toFixed(2) + ')  RTP ' + (b.rtp * 100).toFixed(2) + ' %   écart-type ' + b.sd.toFixed(1) + '× (' + b.sdRel.toFixed(2) + ' × le prix)'); });
  console.log('Colère d\'Anubis : 1 tour sur ' + (1 / M.MODES.std.wrath).toFixed(0) + ', multiplicateur moyen ×' + r.wrath.mean.toFixed(2) + ' : ' + r.wrath.ladder.map(function (x) { return '×' + x[0] + ' ' + (x[1] * 100).toFixed(2) + ' %'; }).join(' · '));
  if (process.argv.indexOf('--loi') >= 0) {
    console.log('\nLoi exacte (plafond compris) — « 1 sur N » : fréquence d\'un gain d\'au moins X fois la mise');
    module.exports.MODES.forEach(function (m) {
      var S = summary(m);
      console.log(m.padEnd(13) + ' RTP ' + (S.rtp * 100).toFixed(3) + ' %  écart-type ' + S.sd.toFixed(2) + '× (' + S.sdRel.toFixed(2) + ' × le coût)  zéro ' + (S.zero * 100).toFixed(2) + ' %  ' +
        [50, 100, 500, 1000, 5000, M.MAX_WIN].map(function (x) { var p = S.atLeast(x); return '≥' + x + ' 1/' + (p ? (1 / p).toFixed(0) : '∞'); }).join('  '));
    });
  }
  if (process.argv.indexOf('--variance') >= 0) {
    ['std', 'plus'].forEach(function (m) {
      var D = decomposeCapped(m);
      console.log('\nVariance ' + m + ' (plafond compris) : E[X] ' + D.mean.toFixed(4) + '  écart-type ' + Math.sqrt(D.var).toFixed(2) +
        '  — plancher d\'une table à paliers fixes (0 / <100 / 100-1000 / 1000+ / max) : ' + tableFloorSd(m, [0, 0.1, 100, 1000, M.MAX_WIN]).toFixed(2) +
        ' ; (0 / <100 / max) : ' + tableFloorSd(m, [0, 0.1, M.MAX_WIN]).toFixed(2));
      Object.keys(D.parts).sort(function (a, b) { return D.parts[b].m2 - D.parts[a].m2; }).forEach(function (k) {
        var o = D.parts[k]; console.log('  ' + k.padEnd(28) + ' 1 tour sur ' + (1 / o.p).toFixed(0).padStart(8) + '  RTP ' + (o.rtp * 100).toFixed(2).padStart(6) + ' %  part de E[X²] ' + (o.m2 / D.m2 * 100).toFixed(1).padStart(5) + ' %');
      });
    });
  }
}
