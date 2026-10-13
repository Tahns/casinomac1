// node tools/tune.js [tirages=1000 (plafonné à 1000)] — espérance de chaque bonus pris isolément (gains plafonnés à MAX_WIN)
// et du bonus SECRET (Crypte d'Anubis) comparée à l'espérance moyenne du bonus qu'il remplace (profil Équilibré, 8 % de Fureur).
var M = require('../js/math.js'), rng = M.mulberry32(7), n = require('./cap')(parseInt(process.argv[2] || '1000', 10)), ev = {};
['scarab', 'weigh', 'vault', 'hand', 'crypt'].forEach(function (k) {
  var s = 0, s2 = 0, mx = 0, f = M._bonus[k], big = 0;
  for (var i = 0; i < n; i++) { var t = Math.min(f(rng).total, M.MAX_WIN); s += t; s2 += t * t; if (t > mx) mx = t; if (t >= M.MAX_WIN) big++; }
  var m = s / n; ev[k] = m; console.log(k.padEnd(7), 'EV', m.toFixed(2) + 'x', ' sd', Math.sqrt(s2 / n - m * m).toFixed(1), ' max', mx, k === 'crypt' ? ' plafonnés ' + big : '');
});
var rep = (1 - M.HAND_UPGRADE) * (ev.scarab + ev.weigh + ev.vault) / 3 + M.HAND_UPGRADE * ev.hand;
console.log('bonus remplacé (moyenne roue + Fureur) :', rep.toFixed(3) + 'x   secret :', ev.crypt.toFixed(3) + 'x   écart :', (ev.crypt - rep).toFixed(3) + 'x  => ' + ((ev.crypt - rep) * M.SECRET_UPGRADE * 0.05 * 100).toFixed(3) + ' pt de RTP environ');
