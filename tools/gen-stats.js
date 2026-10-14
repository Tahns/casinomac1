// node tools/gen-stats.js [--check] — écrit js/stats.js (RTP, taux de gain, prix, gain max PAR MODE affichés dans la fenêtre Règles)
// à partir du calcul exact tools/rtp-exact.js (aucun tirage). Avec --check : ne réécrit rien, sort en erreur si js/stats.js n'est plus à jour
// (à lancer après toute retouche de js/math.js ou js/bonuses.js).
var fs = require('fs'), path = require('path');
var M = require('../js/math.js'), compute = require('./rtp-exact.js');
var file = path.join(__dirname, '..', 'js', 'stats.js');
function r2(x) { return Math.round(x * 100) / 100; }
function build() {
  var r = compute(), o = { maxWin: M.MAX_WIN, std: { cost: M.MODES.std.cost, rtp: r2(r.std.mean * 100), hit: Math.round(r.std.hit * 1000) / 10, bonusEvery: Math.round(r.bonusEvery * 10) / 10 }, plus: { cost: M.MODES.plus.cost, rtp: r2(r.plus.mean * 100) }, buy: {} };
  Object.keys(r.buy).forEach(function (k) { o.buy[k] = { cost: M.BUY[k].price, rtp: r2(r.buy[k].rtp * 100) }; });
  return o;
}
var want = '/* Généré par tools/gen-stats.js (calcul exact, tools/rtp-exact.js) — ne pas modifier à la main. */\nwindow.HOA_STATS = ' + JSON.stringify(build(), null, 1).replace(/\n\s*/g, ' ') + ';\n';
if (process.argv.indexOf('--check') >= 0) {
  var have = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (have !== want) { console.log('ÉCHEC  js/stats.js n\'est plus à jour : lancer node tools/gen-stats.js'); process.exit(1); }
  console.log('ok     js/stats.js à jour avec le calcul exact'); process.exit(0);
}
fs.writeFileSync(file, want); console.log('js/stats.js écrit :\n' + want);
