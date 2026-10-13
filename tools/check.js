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
var cap = require('./cap');
var rng = M.mulberry32(99), bad = 0, maxChain = 0, capped = 0, N = cap(300000);
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
  for (var i = 0; i < cap(1000); i++) { var r = M.playBuy(rb, k); if (r.spins.length !== 1 || r.total < 0 || r.total > M.MAX_WIN || r.cost !== M.BUY[k].price || !r.spins[0].bonus) badBuy++; }
});
ok(badBuy === 0, 'achats : un seul bonus, gain dans [0, plafond], coût = prix affiché');

// 4b. Pesée du Cœur : plume ou cœur, le plus lourd gagne son multiplicateur, le plus léger n'a rien
var rw = M.mulberry32(21), badW = 0, heavyCnt = [0, 0], winN = 0, sumP = [0, 0], nW = cap(300000);
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
ok(Math.abs(heavyCnt[0] / (heavyCnt[0] + heavyCnt[1]) - 0.5) < 0.05, 'Pesée : plateau le plus lourd tiré 50/50 (' + (heavyCnt[0] / (3 * nW) * 100).toFixed(2) + ' % plume)');
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

// 4d. Bonus SECRET « Crypte d'Anubis » : colonnes de multiplicateurs, tirées d'avance, remplace un bonus gagné
var CR = M._bonus.crypt, COLS = M.CRYPT_COLS, rc = M.mulberry32(404), badC = 0, nC = cap(300000), colCnt = [0, 0, 0, 0, 0], typeCnt = {}, iceFull = 0, crushNoop = 0, crushReal = 0, sumTot = 0;
// implémentation de référence, écrite à part des maths : le total rejoué doit être celui du script
function refCrypt(drops) {
  var top = [], fx = [], c; for (c = 0; c < 5; c++) { top.push(1); fx.push([]); }
  drops.forEach(function (d) {
    if (d.t === 'skull') top[d.c] += d.v; else if (d.t === 'epic') top = top.map(function (x) { return x + d.v; });
    else if (d.t === 'anubis') top[d.c] *= d.v; else if (d.t === 'epicx') top = top.map(function (x) { return x * d.v; });
    else if (d.t === 'ice') { if (fx[d.c].length < 4) { fx[d.c].push(top[d.c]); top[d.c] = 1; } }
    else if (d.t === 'crusher') { if (fx[d.c].length >= 2) fx[d.c] = [fx[d.c].reduce(function (a, b) { return a + b; }, 0)]; }
  });
  var s = 0; for (c = 0; c < 5; c++) { s += top[c]; fx[c].forEach(function (x) { s += x; }); }
  return Math.min(s / 5, M.MAX_WIN);
}
for (var ci = 0; ci < nC; ci++) {
  var cd = CR(rc), ds = cd.drops;
  if (ds.length !== M.CRYPT_BLOCKS || cd.steps.length !== ds.length || cd.profile !== 'crypt') badC++;
  ds.forEach(function (d, j) {
    var st = cd.steps[j], all = d.t === 'epic' || d.t === 'epicx';
    typeCnt[d.t] = (typeCnt[d.t] || 0) + 1;
    if (!M.CRYPT_TYPES.some(function (q) { return q[0] === d.t; })) badC++;
    if (all ? d.c !== -1 : !(d.c >= 0 && d.c < COLS)) badC++;
    if (!all) colCnt[d.c]++;
    if (d.t !== 'ice' && d.t !== 'crusher' && !M.CRYPT_VALUES[d.t].some(function (q) { return q[0] === d.v; })) badC++;
    if (st.fixed.some(function (f) { return f.length > M.CRYPT_CAP; }) || st.tops.some(function (x) { return x < 1; })) badC++;
    if (d.t === 'ice') { if (st.full) { iceFull++; if (j && cd.steps[j - 1].fixed[d.c].length !== M.CRYPT_CAP) badC++; } else if (st.froze !== (j ? cd.steps[j - 1].tops[d.c] : 1) || st.tops[d.c] !== 1) badC++; }
    if (d.t === 'crusher') { if (st.crushed) { crushReal++; if (st.fixed[d.c].length !== 1 || st.fixed[d.c][0] !== st.crushed.reduce(function (a, b) { return a + b; }, 0)) badC++; } else crushNoop++; }
    if (j) { // un bloc fixe n'est jamais modifié par les blocs suivants (sauf broyage de sa colonne)
      var pv = cd.steps[j - 1];
      for (var cc = 0; cc < COLS; cc++) if (d.t !== 'crusher' || d.c !== cc) { for (var q = 0; q < pv.fixed[cc].length; q++) if (st.fixed[cc][q] !== pv.fixed[cc][q]) badC++; }
    }
  });
  if (Math.abs(cd.total - refCrypt(ds)) > 1e-9 || cd.total < 1 || cd.total > M.MAX_WIN || Math.abs(cd.total - Math.min(cd.cols.reduce(function (a, b) { return a + b; }, 0) / COLS, M.MAX_WIN)) > 1e-9) badC++;
  sumTot += cd.total;
}
ok(badC === 0, 'Crypte : script de ' + M.CRYPT_BLOCKS + ' blocs, colonnes/valeurs valides, glace/broyeur/colonne pleine conformes, blocs fixes intouchés, total rejoué = total du script (référence indépendante) sur ' + nC + ' scripts (anomalies: ' + badC + ')');
ok(colCnt.every(function (v) { return Math.abs(v / (colCnt[0]) - 1) < 0.15; }), 'Crypte : les 5 colonnes sont strictement symétriques (' + colCnt.join(' / ') + ' blocs)');
var noop = CR(M.mulberry32(1), [{ t: 'crusher', c: 0 }, { t: 'ice', c: 0 }, { t: 'crusher', c: 0 }]);
ok(iceFull > 0 && crushNoop === 0 && crushReal > 0 && !noop.steps[0].effect && !noop.steps[2].effect && noop.fixed[0].length === 1, 'Crypte : cas limites rencontrés (glace sur colonne pleine ' + iceFull + ', broyeur tiré sans cible: ' + crushNoop + ' (jamais), broyeur actif ' + crushReal + ')');
// plafond : un script extrême est plafonné à MAX_WIN
var ext = []; for (var ei = 0; ei < 9; ei++) ext.push({ t: 'epicx', v: 25 });
var capd = CR(M.mulberry32(1), ext);
ok(capd.total === M.MAX_WIN && capd.capped && Math.max.apply(null, capd.tops) <= M.MAX_WIN * COLS, 'Crypte : un script extrême est plafonné à ' + M.MAX_WIN + '×');
var mini = CR(M.mulberry32(1), [{ t: 'skull', c: 0, v: 3 }, { t: 'ice', c: 0 }, { t: 'anubis', c: 0, v: 5 }, { t: 'epic', v: 1 }, { t: 'ice', c: 0 }, { t: 'ice', c: 0 }, { t: 'crusher', c: 0 }, { t: 'skull', c: 1, v: 2 }, { t: 'epicx', v: 2 }]);
// colonne 0 : haut 1+3=4 -> glace (fixe 4, haut 1) -> ×5 -> +1 = 6 -> glace (4, 6) -> glace (4, 6, 1) -> broyeur (11) -> ×2 : haut 2 + 11 = 13 ; colonne 1 : 2+2=4 puis ×2 = 8 ; colonnes 2-4 : 2 puis ×2 = 4
ok(mini.cols[0] === 13 && mini.fixed[0].length === 1 && mini.fixed[0][0] === 11 && mini.cols[1] === 8 && mini.total === 33 / 5, 'Crypte : script écrit à la main rejoué correctement (colonnes ' + mini.cols.join(', ') + ')');
// fréquence et espérance du secret dans les vrais tours
var rs = M.mulberry32(2024), nS = cap(2000000), secrets = 0, bonuses = 0, badS = 0;
['std', 'plus'].forEach(function (mode) {
  for (var si = 0; si < nS; si++) {
    var rr = M.playRound(rs, mode);
    rr.spins.forEach(function (sp) {
      if (M.KINDS[sp.kind] && M.KINDS[sp.kind].bonus) bonuses++;
      if (sp.secret) { secrets++; if (!M.KINDS[sp.kind].bonus || sp.upgraded || sp.options || sp.bonus.profile !== 'crypt' || sp.base !== sp.bonus.total) badS++; }
    });
  }
});
var perRound = secrets / (2 * nS);
ok(badS === 0 && perRound > 1 / 2000 && perRound < 1 / 100, 'Secret : 1 tour sur ' + (1 / perRound).toFixed(0) + ' (cible 450-550), uniquement à la place d\'un bonus de la roue, sans choix de profil (anomalies: ' + badS + ')');
ok(Math.abs(secrets / bonuses - M.SECRET_UPGRADE) < 0.03, 'Secret : ' + (secrets / bonuses * 100).toFixed(2) + ' % des bonus gagnés (réglé à ' + M.SECRET_UPGRADE * 100 + ' %) — ' + (1 / (M.SECRET_UPGRADE * 0.0682)).toFixed(0) + ' tours en théorie');
var rbuy = M.mulberry32(8), secBuy = 0; ['scarab', 'weigh', 'vault', 'hand'].forEach(function (k) { for (var i = 0; i < 50000; i++) if (M.playBuy(rbuy, k).spins[0].secret) secBuy++; });
ok(secBuy === 0, 'Secret : jamais proposé à l\'achat');
// espérance du secret = espérance moyenne du bonus qu'il remplace (RTP global inchangé)
var rE = M.mulberry32(31), nE = cap(2000000), eS = 0, eR = { scarab: 0, weigh: 0, vault: 0, hand: 0 };
for (var ei2 = 0; ei2 < nE; ei2++) {
  eS += Math.min(CR(rE).total, M.MAX_WIN);
  ['scarab', 'weigh', 'vault', 'hand'].forEach(function (k) { eR[k] += Math.min(M._bonus[k](rE, k === 'hand' ? 0 : 'std').total, M.MAX_WIN); });
}
var replaced = (1 - M.HAND_UPGRADE) * (eR.scarab + eR.weigh + eR.vault) / 3 / nE + M.HAND_UPGRADE * eR.hand / nE;
ok(Math.abs(eS / nE - replaced) < 0.35, 'Secret : espérance ≈ ' + (eS / nE).toFixed(2) + '× pour ' + replaced.toFixed(2) + '× de bonus remplacé (écart ' + ((eS / nE - replaced) * M.SECRET_UPGRADE * 0.0682 * 100).toFixed(3) + ' pt de RTP)');

// 5. RTP grossier, test de fumée : les tests sont plafonnés à 1000 tours (tolérance = 4 écarts-types d'échantillonnage). La valeur précise est mesurée à grande échelle hors test (1 milliard de tours : 96,22 % std ± 0,034, 96,00 % Oracle+ ± 0,039).
function tol(sd, n) { return 4 * sd / Math.sqrt(n) * 100; }
function rtp(f, cost, n) { var s = 0; for (var i = 0; i < n; i++) s += f().total; return s / n / cost * 100; }
var r1 = M.mulberry32(11), n = cap(2000000);
var std = rtp(function () { return M.playRound(r1, 'std'); }, 1, n);
var plus = rtp(function () { return M.playRound(r1, 'plus'); }, M.MODES.plus.cost, n);
ok(Math.abs(std - 96.2) < tol(5.5, n), 'RTP Standard ≈ ' + std.toFixed(2) + ' % (attendu 96,2 ± ' + tol(5.5, n).toFixed(1) + ', ' + n + ' tours)');
ok(Math.abs(plus - 96.0) < tol(6.4, n), 'RTP Oracle+ ≈ ' + plus.toFixed(2) + ' % (attendu 96,0 ± ' + tol(6.4, n).toFixed(1) + ', ' + n + ' tours)');
Object.keys(M.BUY).forEach(function (k) {
  var v = rtp(function () { return M.playBuy(r1, k); }, M.BUY[k].price, cap(1000000));
  ok(Math.abs(v - 96.2) < tol(14, cap(1000000)), 'RTP achat ' + k + ' ≈ ' + v.toFixed(2) + ' % (test de fumée, tolérance ± ' + tol(14, cap(1000000)).toFixed(1) + ')');
});
console.log(fails ? '\n' + fails + ' échec(s)' : '\ntout est bon');
process.exit(fails ? 1 : 0);
