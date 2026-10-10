// Vérifie (et règle) l'égalité d'espérance des profils prudent / équilibré / audacieux de chaque bonus.
// Usage : node tools/tune-profiles.js [n=4000000] [graine=1]
var M = require('../js/math.js');
var n = +process.argv[2] || 4000000, seed = +process.argv[3] || 1;
function ev(fn, prof) { var rng = M.mulberry32(seed + 17), t = 0, t2 = 0; for (var i = 0; i < n; i++) { var x = fn(rng, prof).total; t += x; t2 += x * x; } var m = t / n; return { mean: m, sd: Math.sqrt(t2 / n - m * m) }; }
['scarab', 'weigh', 'vault'].forEach(function (k) {
  var base = ev(M._bonus[k], 'std');
  ['safe', 'std', 'bold'].forEach(function (p) {
    var r = ev(M._bonus[k], p);
    console.log(k.padEnd(7), p.padEnd(5), 'EV', r.mean.toFixed(4), '(' + ((r.mean / base.mean - 1) * 100).toFixed(2) + ' % vs std)', ' écart-type', r.sd.toFixed(2), ' ±' + (1.96 * r.sd / Math.sqrt(n)).toFixed(3));
  });
});
