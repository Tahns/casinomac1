// node tools/simulate.js [nbTours=5000000] [seed=1]
// Mesure RTP, taux de gain, volatilité et répartition par case. Sert à valider/tuner js/math.js.
var M = require('../js/math.js');
var n = parseInt(process.argv[2] || '5000000', 10);
var seed = parseInt(process.argv[3] || '1', 10);
var rng = M.mulberry32(seed);

var sum = 0, sum2 = 0, hits = 0, maxWin = 0, capped = 0;
var byKind = {}, oracleExtra = 0;
var buckets = [[0, '0x'], [0.0001, '<1x'], [1, '1-2x'], [2, '2-5x'], [5, '5-10x'], [10, '10-50x'], [50, '50-200x'], [200, '200-1000x'], [1000, '>=1000x']];
var dist = buckets.map(function () { return 0; });
var nBonus = 0;

for (var i = 0; i < n; i++) {
  var r = M.playRound(rng);
  sum += r.total; sum2 += r.total * r.total;
  if (r.total > 0) hits++;
  if (r.total > maxWin) maxWin = r.total;
  if (r.capped) capped++;
  var b = 0;
  for (var j = buckets.length - 1; j >= 0; j--) { if (r.total >= buckets[j][0] && (j > 0 || r.total === 0)) { b = j; break; } }
  if (r.total === 0) b = 0; else if (r.total < 1) b = 1;
  dist[b]++;
  r.spins.forEach(function (s) {
    var kk = s.upgraded ? 'HAND' : s.kind; var k = byKind[kk] || (byKind[kk] = { n: 0, pay: 0 });
    k.n++; k.pay += s.pay;
    if (s.bonus) nBonus++;
    if (s.boost > 1) oracleExtra += s.pay - s.pay / s.boost;
  });
}
var mean = sum / n, sd = Math.sqrt(sum2 / n - mean * mean);
console.log('Tours: ' + n + '  graine: ' + seed);
console.log('RTP: ' + (mean * 100).toFixed(2) + '%   écart-type: ' + sd.toFixed(2) + 'x   gain max observé: ' + maxWin + 'x   plafonnés: ' + capped);
console.log('Taux de gain (>0): ' + (hits / n * 100).toFixed(1) + '%   bonus déclenchés: 1 / ' + (n / nBonus).toFixed(1) + ' tours');
console.log('Part de RTP due aux boosts Oracle: ' + (oracleExtra / n * 100).toFixed(2) + ' pts');
console.log('\nPar case (fréquence, contribution RTP, gain moyen par apparition):');
Object.keys(byKind).forEach(function (k) {
  var v = byKind[k];
  console.log('  ' + (k + '      ').slice(0, 7) + ' freq 1/' + (n / v.n).toFixed(1).padEnd(7) + ' RTP ' + (v.pay / n * 100).toFixed(2).padStart(6) + '%   moy ' + (v.pay / v.n).toFixed(2) + 'x');
});
console.log('\nDistribution des gains par tour:');
buckets.forEach(function (bk, i) { console.log('  ' + bk[1].padEnd(10) + (dist[i] / n * 100).toFixed(3) + '%'); });
console.log('\nDisposition de la roue: ' + M.LAYOUT.join(' '));
