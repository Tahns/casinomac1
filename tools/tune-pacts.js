// node tools/tune-pacts.js — règle la chance de Colère d'Anubis de chaque PACTE pour un RTP exact de 96,20 % (aucun tirage).
// Le RTP d'un mode est linéaire en la chance q de Colère : RTP(q) = (1 − q)·A + q·B, avec A = RTP d'un tour sans Colère et B = RTP d'un tour
// en Colère (lois exactes de tools/rtp-exact.js, plafond compris). Donc q = (cible − A) / (B − A), arrondi à 7 décimales.
// Affiche les valeurs à reporter dans js/math.js (MODES) et stake-math/game_config.py (MODES). Le pacte de la Balance (std, plus) n'est pas retouché.
var M = require('../js/math.js'), X = require('./rtp-exact.js');
var TARGET = 0.962, out = {};
M.BASE_MODES.forEach(function (m) {
  var md = M.MODES[m];
  if (md.pact === 'std') return;
  M.MODES['__a' + m] = { cost: md.cost, oracle: md.oracle, wrath: 0, pact: md.pact };
  M.MODES['__b' + m] = { cost: md.cost, oracle: md.oracle, wrath: 1, pact: md.pact };
  var A = X.summary('__a' + m).rtp, B = X.summary('__b' + m).rtp, q = +((TARGET - A) / (B - A)).toFixed(7);
  delete M.MODES['__a' + m]; delete M.MODES['__b' + m];   // noms uniques : rtp-exact garde la loi de chaque mode en cache
  out[m] = q;
  console.log(m.padEnd(10) + ' Colère ' + q + ' (1 tour sur ' + (1 / q).toFixed(1) + ')  — actuel ' + md.wrath + '  RTP sans Colère ' + (A * 100).toFixed(3) + ' %, en Colère ' + (B * 100).toFixed(1) + ' %');
});
module.exports = out;
