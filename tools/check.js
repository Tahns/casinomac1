// node tools/check.js — filet de sécurité du noyau mathématique (code de sortie 1 si un invariant casse).
var M = require('../js/math.js');
var fails = 0;
function ok(cond, msg) { if (!cond) { fails++; console.log('ÉCHEC  ' + msg); } else console.log('ok     ' + msg); }

// 1. roue
var L = M.LAYOUT, counts = {};
L.forEach(function (k) { counts[k] = (counts[k] || 0) + 1; });
ok(L.length === M.N && M.N === 48, 'la roue compte 48 cases');
ok(Object.keys(M.KINDS).every(function (k) { return counts[k] === M.KINDS[k].count; }), 'chaque case apparaît autant de fois que déclaré');
ok(L.every(function (k, i) { return k !== L[(i + 1) % L.length]; }), 'jamais deux cases identiques côte à côte (circulaire)');
ok(M.HAND_SEGS.length === 24, 'la roue de la Fureur d\'Anubis compte 24 cases');

// 2. déterminisme
function sig(seed, mode) { var r = M.mulberry32(seed), out = []; for (var i = 0; i < 200; i++) out.push(M.playRound(r, mode).total); return out.join(','); }
ok(sig(5, 'std') === sig(5, 'std') && sig(5, 'plus') === sig(5, 'plus'), 'même graine => mêmes tours (std et plus)');

// 3. structure des tours
var rng = M.mulberry32(99), bad = 0, maxChain = 0, capped = 0, N = 300000;
['std', 'plus'].forEach(function (mode) {
  for (var i = 0; i < N; i++) {
    var r = M.playRound(rng, mode), sp = r.spins, last = sp[sp.length - 1], sum = 0;
    if (!(r.total >= 0 && r.total <= M.MAX_WIN)) bad++;
    if (last.kind === 'ankh') bad++;
    if (sp.length - 1 > 6) bad++;
    maxChain = Math.max(maxChain, sp.length - 1);
    sp.forEach(function (s, j) {
      sum += s.pay;
      if (j < sp.length - 1 && s.kind !== 'ankh') bad++;
      if (M.KINDS[s.kind].bonus && !s.bonus) bad++;
      if (!M.KINDS[s.kind].bonus && s.bonus) bad++;
      if (s.boost > 1 && !(s.oracle && s.oracle.kind === s.kind)) bad++;
      if (s.pay !== s.base * s.boost) bad++;
    });
    if (Math.min(sum, M.MAX_WIN) !== r.total) bad++;
    if (r.capped) capped++;
  }
});
ok(bad === 0, 'invariants de structure sur ' + 2 * N + ' tours (anomalies: ' + bad + ', chaîne Ankh max: ' + maxChain + ')');

// 4. achats
var rb = M.mulberry32(7), badBuy = 0;
Object.keys(M.BUY).forEach(function (k) {
  for (var i = 0; i < 100000; i++) { var r = M.playBuy(rb, k); if (r.spins.length !== 1 || r.total < 0 || r.total > M.MAX_WIN || r.cost !== M.BUY[k].price || !r.spins[0].bonus) badBuy++; }
});
ok(badBuy === 0, 'achats : un seul bonus, gain dans [0, plafond], coût = prix affiché');

// 4b. Pesée du Cœur : plume ou cœur, le plus lourd gagne son multiplicateur, le plus léger n'a rien
var rw = M.mulberry32(21), badW = 0, heavyCnt = [0, 0], winN = 0, sumP = [0, 0], nW = 300000;
['safe', 'std', 'bold'].forEach(function (pf) {
  var prof = M.WEIGH_PROFILES[pf];
  for (var i = 0; i < nW; i++) {
    var d = M._bonus.weigh(rw, pf);
    if (!(d.heavy === 0 || d.heavy === 1) || d.mults.length !== 2) badW++;
    if (!prof.some(function (e) { return e[0].slice().sort(function (a, b) { return a - b; }).join() === d.mults.slice().sort(function (a, b) { return a - b; }).join(); })) badW++;
    if (d.total !== M.weighGain(d, 0) || d.pick !== 0) badW++;
    [0, 1].forEach(function (pk) { var gn = M.weighGain(d, pk); if (pk === d.heavy ? gn !== d.mults[pk] : gn !== 0) badW++; sumP[pk] += gn; });
    heavyCnt[d.heavy]++;
  }
});
ok(badW === 0, 'Pesée : mults ∈ profil, gain = mult du plateau choisi s\'il est le plus lourd, sinon 0 (anomalies: ' + badW + ')');
ok(Math.abs(heavyCnt[0] / (heavyCnt[0] + heavyCnt[1]) - 0.5) < 0.005, 'Pesée : plateau le plus lourd tiré 50/50 (' + (heavyCnt[0] / (3 * nW) * 100).toFixed(2) + ' % plume)');
ok(Math.abs(sumP[0] / sumP[1] - 1) < 0.03, 'Pesée : espérance identique si le joueur choisit la plume ou le cœur (' + (sumP[0] / 3 / nW).toFixed(3) + ' vs ' + (sumP[1] / 3 / nW).toFixed(3) + ')');

// 4c. Fureur d'Anubis : 3 couleurs, DOUBLE de sa couleur = palier ×2 et relance, autre couleur = arrêt, bande = bonus ×N × palier
var HS = M.HAND_SEGS, dcount = [0, 0, 0], bands = 0, nums = 0;
HS.forEach(function (s) { if (s.d != null) dcount[s.d]++; else if (s.b) bands++; else nums++; });
ok(dcount[0] === dcount[1] && dcount[1] === dcount[2] && dcount[0] > 0 && bands >= 3 && HS.every(function (s, i) { return JSON.stringify(s) !== JSON.stringify(HS[(i + 1) % HS.length]); }), 'Fureur : même nombre de DOUBLE par couleur (' + dcount.join('/') + '), ' + bands + ' bandes, ' + nums + ' nombres, pas de voisines identiques');
ok(HS.every(function (s) { return s.b == null || ['scarab', 'weigh', 'vault'].indexOf(s.b) >= 0; }), 'Fureur : aucune bande ne renvoie vers la Fureur (pas de boucle)');
var rh = M.mulberry32(77), badH = 0, nH = 400000, evC = [0, 0, 0], upC = [0, 0, 0], wrongC = [0, 0, 0], bandC = [0, 0, 0], maxLvl = 0;
for (var hi = 0; hi < nH; hi++) {
  var ho = M.handOptions(rh);
  M.HAND_COLORS.forEach(function (cn, ci) {
    var h = ho[cn], sp = h.spins, last = sp[sp.length - 1], m = 1;
    if (h.colour !== ci || !last.final) badH++;
    sp.forEach(function (x, j) {
      if (j < sp.length - 1) { var sg = HS[x.idx]; if (x.final || sg.d !== ci) badH++; m *= 2; if (x.mult !== m) badH++; }
    });
    if (last.mult !== m || h.mult !== m || m > Math.pow(2, M.HAND_MAX_CHAIN)) badH++;
    maxLvl = Math.max(maxLvl, sp.length - 1);
    var seg = HS[last.idx], exp;
    if (seg.d != null) { if (seg.d === ci || last.kind !== 'wrong') badH++; exp = M.HAND_MIN_N * m; wrongC[ci]++; }
    else if (seg.b) { if (last.kind !== 'band' || last.band !== seg.b || last.x !== seg.x || !last.bonus) badH++; exp = last.bonus.total * seg.x * m; bandC[ci]++; }
    else { if (last.kind !== 'num') badH++; exp = seg.n * m; }
    if (Math.abs(last.pay - exp) > 1e-9 || h.total !== Math.min(exp, M.MAX_WIN)) badH++;
    sp.forEach(function (x, j) { if (j === sp.length - 1) return; upC[ci]++; });
    evC[ci] += h.total;
  });
}
ok(badH === 0, 'Fureur : invariants des scripts des 3 couleurs sur ' + 3 * nH + ' scripts (anomalies: ' + badH + ', palier max atteint: ×' + Math.pow(2, maxLvl) + ')');
var evMean = (evC[0] + evC[1] + evC[2]) / 3 / nH;
ok(evC.every(function (v) { return Math.abs(v / nH / evMean - 1) < 0.03; }), 'Fureur : espérance identique pour les 3 couleurs (' + evC.map(function (v) { return (v / nH).toFixed(2); }).join(' / ') + ')');
ok(upC.every(function (v) { return Math.abs(v / upC[0] - 1) < 0.05; }) && wrongC.every(function (v) { return Math.abs(v / wrongC[0] - 1) < 0.03; }) && bandC.every(function (v) { return Math.abs(v / bandC[0] - 1) < 0.03; }), 'Fureur : doublements / mauvaise couleur / bandes aussi fréquents pour chaque couleur (' + upC.join('/') + ' · ' + wrongC.join('/') + ' · ' + bandC.join('/') + ')');
ok(evMean > 23.2 && evMean < 26.2, 'Fureur : espérance du bonus ≈ ' + evMean.toFixed(2) + '× (attendu ≈ 24,7×)');
// recalcul après le choix du joueur dans la Pesée imbriquée
var rw2 = M.mulberry32(5), badR = 0;
for (var wi = 0; wi < 20000; wi++) { var hh = M._bonus.hand(rw2, 0, [0]); if (hh.spins[0].kind !== 'band') { badR++; continue; } }
var forcedW = M._bonus.hand(M.mulberry32(3), 1, [12]); var d0 = forcedW.spins[0].bonus; d0.pick = 1 - d0.heavy; d0.total = M.weighGain(d0, d0.pick); M.handRecalc(forcedW);
ok(badR === 0 && forcedW.total === 0 && forcedW.spins[0].band === 'weigh', 'Fureur : le total se recalcule si le joueur change son choix dans la Pesée imbriquée');

// 5. RTP grossier (tolérance large : 2 M de tours ≈ ±0,5 pt)
function rtp(f, cost, n) { var s = 0; for (var i = 0; i < n; i++) s += f().total; return s / n / cost * 100; }
var r1 = M.mulberry32(11), n = 2000000;
var std = rtp(function () { return M.playRound(r1, 'std'); }, 1, n);
var plus = rtp(function () { return M.playRound(r1, 'plus'); }, M.MODES.plus.cost, n);
ok(std > 94.5 && std < 97.5, 'RTP Standard ≈ ' + std.toFixed(2) + ' % (attendu 96,2)');
ok(plus > 94.5 && plus < 97.5, 'RTP Oracle+ ≈ ' + plus.toFixed(2) + ' % (attendu 95,9)');
Object.keys(M.BUY).forEach(function (k) {
  var v = rtp(function () { return M.playBuy(r1, k); }, M.BUY[k].price, 1000000);
  ok(v > 93.5 && v < 98.5, 'RTP achat ' + k + ' ≈ ' + v.toFixed(2) + ' % (tolérance large, 1 M de tirages)');
});
console.log(fails ? '\n' + fails + ' échec(s)' : '\ntout est bon');
process.exit(fails ? 1 : 0);
