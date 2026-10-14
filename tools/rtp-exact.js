// node tools/rtp-exact.js — RTP, écart-type, taux de gain et prix d'achat calculés EXACTEMENT (aucun tirage), à partir des tables de js/math.js.
// Pourquoi : à très haute volatilité (écart-type ≈ 16), 2 M de tours ne donnent le RTP qu'à ± 2 points ; le calcul exact (moments d'ordre 1 et 2) est la
// référence, la simulation (tools/simulate.js) sert à la recouper. Hypothèses : gains non plafonnés (le plafond n'est atteint qu'aux achats de la Fureur,
// effet < 0,01 pt) ; la Crypte (bonus secret) est une moyenne de colonnes non calculable en forme close : on prend ses moments mesurés (CRYPT_MEASURED,
// 2 M de scripts, tools/tune.js), égaux à l'espérance du bonus qu'elle remplace à ± 0,1× près (effet < 0,03 pt de RTP).
var M = require('../js/math.js');
var CRYPT_MEASURED = { ev: 10.13, sd: 79.4 };

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
function vault(prof) {   // énumération exacte des 7 choix (au plus ~10^7 feuilles)
  var vp = M.VAULT_PROFILES[prof], pool = vp.tokens.concat([['curse', vp.curse]]), W = 0, E = 0, E2 = 0;
  pool.forEach(function (t) { W += t[1]; });
  var Wnc = W - vp.curse;
  (function rec(i, total, shield, p) {
    if (i === M.VAULT_MAX_PICKS) { var f = total + 5; E += p * f; E2 += p * f * f; return; }
    pool.forEach(function (t) {
      var pr = i < 2 ? (t[0] === 'curse' ? 0 : t[1] / Wnc) : t[1] / W, k = t[0];
      if (!pr) return;
      if (k === 'curse') { if (shield > 0) rec(i + 1, total, shield - 1, p * pr); else { E += p * pr * total; E2 += p * pr * total * total; } }
      else if (k === 'ankh') rec(i + 1, total, shield + 1, p * pr);
      else if (k === 'scepter') rec(i + 1, total * 2, shield, p * pr);
      else rec(i + 1, total + k, shield, p * pr);
    });
  })(0, 0, 0, 1);
  return [E, E2];
}
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
  // bonus gagné sur la roue = (1-s)·[(1-h)·bonus profil Équilibré + h·Fureur] + s·Crypte
  var rep = {}, rep1 = 0;
  ['scarab', 'weigh', 'vault'].forEach(function (k) { rep[k] = [(1 - h) * BON[k].std[0] + h * H[0], (1 - h) * BON[k].std[1] + h * H[1]]; rep1 += rep[k][0] / 3; });
  var C = [CRYPT_MEASURED.ev, CRYPT_MEASURED.sd * CRYPT_MEASURED.sd + CRYPT_MEASURED.ev * CRYPT_MEASURED.ev];
  function onWheel(k) { return [(1 - s) * rep[k][0] + s * C[0], (1 - s) * rep[k][1] + s * C[1]]; }
  var Nn = M.N - M.KINDS.ankh.count, W = 0;   // le tour se termine sur une case non-Ankh (les relances sont gratuites et ne paient rien)
  M.ORACLE_KIND_W.forEach(function (t) { W += t[1]; });
  function round(qo) {
    var E = 0, E2 = 0, hit = 0;
    Object.keys(M.KINDS).forEach(function (k) {
      var d = M.KINDS[k]; if (d.respin) return;
      var v = d.bonus ? onWheel(k) : [d.mult, d.mult * d.mult], pk = d.count / Nn, wk = 0, tb = M.ORACLE_BOOST[d.bonus ? 'bonus' : 'num'];
      M.ORACLE_KIND_W.forEach(function (t) { if (t[0] === k) wk = t[1]; });
      var po = qo * wk / W, b = wmom(tb);
      E += pk * ((1 - po) * v[0] + po * b[0] * v[0]);
      E2 += pk * ((1 - po) * v[1] + po * b[1] * v[1]);
      hit += pk * (d.bonus ? (k === 'weigh' ? 1 - 0.5 * (1 - s) * (1 - h) : 1) : d.mult > 0 ? 1 : 0);
    });
    return { mean: E, sd: Math.sqrt(E2 - E * E), hit: hit };
  }
  var std = round(M.MODES.std.oracle), plus = round(M.MODES.plus.oracle);
  var buy = {};
  ['scarab', 'weigh', 'vault'].forEach(function (k) { buy[k] = { mean: rep[k][0], sd: Math.sqrt(rep[k][1] - rep[k][0] * rep[k][0]) }; });
  buy.hand = { mean: H[0], sd: Math.sqrt(H[1] - H[0] * H[0]) };
  Object.keys(buy).forEach(function (k) { buy[k].price = M.BUY[k].price; buy[k].rtp = buy[k].mean / M.BUY[k].price; buy[k].sdRel = buy[k].sd / M.BUY[k].price; buy[k].fair = buy[k].mean / 0.96; });
  return { std: std, plus: { mean: plus.mean / M.MODES.plus.cost, sd: plus.sd, sdRel: plus.sd / M.MODES.plus.cost, hit: plus.hit }, buy: buy, bonusEvery: Nn / 3, bonus: BON, hand: H, replaced: rep1 };
}
module.exports = compute;

if (require.main === module) {
  var r = compute();
  console.log('Standard : RTP ' + (r.std.mean * 100).toFixed(2) + ' %   écart-type ' + r.std.sd.toFixed(2) + '×   taux de gain ' + (r.std.hit * 100).toFixed(1) + ' %   bonus 1 / ' + r.bonusEvery.toFixed(1));
  console.log('Oracle+  : RTP ' + (r.plus.mean * 100).toFixed(2) + ' %   écart-type ' + r.plus.sdRel.toFixed(2) + '× (rapporté au coût ×' + M.MODES.plus.cost + ')   taux de gain ' + (r.plus.hit * 100).toFixed(1) + ' %');
  Object.keys(r.buy).forEach(function (k) { var b = r.buy[k]; console.log('Achat ' + k.padEnd(6) + ' prix ' + b.price + '× (prix à 96 % : ' + b.fair.toFixed(2) + ')  RTP ' + (b.rtp * 100).toFixed(2) + ' %   écart-type ' + b.sd.toFixed(1) + '× (' + b.sdRel.toFixed(2) + ' × le prix)'); });
}
