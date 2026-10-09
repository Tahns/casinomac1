// node tools/tune.js — espérance de chaque bonus pris isolément (1M tirages chacun)
var M = require('../js/math.js'), rng = M.mulberry32(7), n = 1000000;
['scarab', 'weigh', 'vault', 'hand'].forEach(function (k) {
  var s = 0, s2 = 0, mx = 0, f = M._bonus[k];
  for (var i = 0; i < n; i++) { var t = Math.min(f(rng).total, M.MAX_WIN); s += t; s2 += t * t; if (t > mx) mx = t; }
  var m = s / n; console.log(k.padEnd(7), 'EV', m.toFixed(2) + 'x', ' sd', Math.sqrt(s2 / n - m * m).toFixed(1), ' max', mx);
});
