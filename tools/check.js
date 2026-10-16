// node tools/check.js — filet de sécurité du noyau mathématique (code de sortie 1 si un invariant casse).
var M = require('../js/math.js');
var fails = 0;
function ok(cond, msg) { if (!cond) { fails++; console.log('ÉCHEC  ' + msg); } else console.log('ok     ' + msg); }

// 1. roue
var L = M.LAYOUT, counts = {};
L.forEach(function (k) { counts[k] = (counts[k] || 0) + 1; });
ok(L.length === M.N && M.N === 64, 'la roue compte 64 cases');
ok(Object.keys(M.KINDS).every(function (k) { return counts[k] === M.KINDS[k].count; }), 'chaque case apparaît autant de fois que déclaré');
ok(L.every(function (k, i) { return k === 'm0' || k !== L[(i + 1) % L.length]; }), 'jamais deux cases identiques côte à côte (circulaire), sauf la poussière « 0 » (plus de la moitié de la roue)');
ok(M.HAND_SEGS.length === 24, 'la roue de la Fureur d\'Anubis compte 24 cases');

// 2. déterminisme
function sig(seed, mode) { var r = M.mulberry32(seed), out = []; for (var i = 0; i < 200; i++) out.push(M.playRound(r, mode).total); return out.join(','); }
ok(M.BASE_MODES.every(function (m) { return sig(5, m) === sig(5, m); }), 'même graine => mêmes tours (' + M.BASE_MODES.join(', ') + ')');

// 3. structure des tours
var cap = require('./cap');
var rng = M.mulberry32(99), bad = 0, maxChain = 0, capped = 0, N = cap(300000);
M.BASE_MODES.forEach(function (mode) {
  for (var i = 0; i < N; i++) {
    var r = M.playRound(rng, mode), sp = r.spins, last = sp[sp.length - 1], sum = 0;
    if (!(r.total >= 0 && r.total <= M.MAX_WIN)) bad++;
    if (r.pact !== M.MODES[mode].pact || r.modeName !== mode || r.mode !== M.familyOf(mode) || r.cost !== M.MODES[mode].cost) bad++;
    if (last.kind === 'ankh') bad++;
    if (sp.length - 1 > 6) bad++;
    maxChain = Math.max(maxChain, sp.length - 1);
    sp.forEach(function (s, j) {
      sum += s.pay;
      if (j < sp.length - 1 && s.kind !== 'ankh') bad++;
      if (M.KINDS[s.kind].bonus && !s.bonus) bad++;
      if (s.bonus && !s.secret && !s.upgraded && s.profile !== r.pact) bad++;   // le pacte fixe le profil de chaque bonus du tour
      if (s.upgraded && s.bonus.pact !== r.pact) bad++;                           // et celui des bandes de la Fureur
      if (!M.KINDS[s.kind].bonus && s.bonus) bad++;
      // boost appliqué = boost de l'Oracle (s'il visait cette case) × multiplicateur de la Colère d'Anubis (1 hors Colère)
      var ob = s.oracle && s.oracle.kind === s.kind ? s.oracle.boost : 1;
      if (s.boost !== ob * (s.wrath || 1) || s.oracleBoost !== ob) bad++;
      if (!!r.wrath !== !!s.wrath) bad++;
      if (s.pay !== s.base * s.boost) bad++;
    });
    if (Math.min(sum, M.MAX_WIN) !== r.total) bad++;
    if (r.capped) capped++;
  }
});
ok(bad === 0, 'invariants de structure sur ' + M.BASE_MODES.length * N + ' tours (anomalies: ' + bad + ', chaîne Ankh max: ' + maxChain + ')');

// 3b. Colère d'Anubis (1 tour sur 500 : forcée ici par un premier tirage à 0) : roue limitée aux cases libérées, multiplicateur ×2 qui monte
// d'un cran à chaque Ankh, appliqué au gain de la case finale ; jamais à l'achat
var rw0 = M.mulberry32(4242), badWr = 0, nWr = cap(400), wrUp = 0, wrTop = 0, wrKinds = {};
ok(M.WRATH_CELLS.length === M.WRATH_KINDS.reduce(function (a, k) { return a + M.KINDS[k].count; }, 0) && M.WRATH_CELLS.every(function (i) { return M.WRATH_KINDS.indexOf(M.LAYOUT[i]) >= 0; }),
  'Colère : ' + M.WRATH_CELLS.length + ' cases libérées (' + M.WRATH_KINDS.join(', ') + '), échelle ×' + M.WRATH_LADDER.join(' → ×'));
M.BASE_MODES.forEach(function (mode) {
  var LAD = M.ladderOf(M.pactOf(mode)), TOPL = LAD.length - 1;
  for (var i = 0; i < nWr; i++) {
    var first = true, rr = M.playRound(function () { if (first) { first = false; return 0; } return rw0(); }, mode), lvl = rr.wrath ? rr.wrath.start : -1, t = 0;
    if (!rr.wrath || M.WRATH_START.every(function (s0) { return s0[0] !== rr.wrath.start; })) { badWr++; continue; }
    rr.spins.forEach(function (sp, j) {
      wrKinds[sp.kind] = 1;
      if (M.WRATH_KINDS.indexOf(sp.kind) < 0 || sp.wrath !== LAD[lvl]) badWr++;
      if (sp.boost !== (sp.oracle && sp.oracle.kind === sp.kind ? sp.oracle.boost : 1) * LAD[lvl]) badWr++;
      if (sp.kind === 'ankh' && j < rr.spins.length - 1) {
        if (lvl < TOPL) { lvl++; wrUp++; if (sp.wrathUp !== LAD[lvl]) badWr++; } else if (sp.wrathUp) badWr++;
      } else if (sp.wrathUp) badWr++;
      t += sp.pay;
    });
    if (lvl === TOPL) wrTop++;
    if (rr.wrath.level !== lvl || rr.wrath.mult !== LAD[lvl] || rr.wrath.ladder !== LAD || rr.total !== Math.min(t, M.MAX_WIN)) badWr++;
  }
});
ok(badWr === 0 && wrUp > 0, 'Colère : ' + M.BASE_MODES.length * nWr + ' tours forcés (6 modes, échelle du pacte), roue limitée aux cases libérées, ×' + M.WRATH_LADDER[0] + ' puis +1 cran par Ankh, gain = base × Oracle × Colère (anomalies: ' + badWr + ', crans gagnés ' + wrUp + ', cran maximal atteint ' + wrTop + ' fois)');
var rwb = M.mulberry32(9), wrBuy = 0; ['scarab', 'weigh', 'vault', 'hand'].forEach(function (k) { for (var i = 0; i < cap(200); i++) { var rb0 = M.playBuy(function () { return 0; }, k); if (rb0.wrath || rb0.spins[0].wrath) wrBuy++; rb0 = M.playBuy(rwb, k); if (rb0.wrath) wrBuy++; } });
ok(wrBuy === 0, 'Colère : jamais à l\'achat d\'un bonus');
var WX = require('./rtp-exact'), wl = WX.wrathLadder(), wsum = wl.reduce(function (a, x) { return a + x[1]; }, 0), aW = M.KINDS.ankh.count / M.WRATH_CELLS.length;
ok(Math.abs(wsum - 1) < 1e-12 && Math.abs(wl[wl.length - 1][1] - Math.pow(aW, M.WRATH_TOP)) < 1e-12, 'Colère : loi exacte du multiplicateur final (somme 1, ×' + M.WRATH_LADDER[M.WRATH_TOP] + ' = a^' + M.WRATH_TOP + ' avec a = ' + M.KINDS.ankh.count + '/' + M.WRATH_CELLS.length + ') : ' + wl.map(function (x) { return '×' + x[0] + ' ' + (x[1] * 100).toFixed(2) + ' %'; }).join(' · '));

// 3c. PACTES : décision du joueur avant le tour (docs/GAMEPLAY.md). Un pacte = un mode de mise au même coût et au même RTP EXACT ;
// la volatilité change nettement (Scribe < Balance < Chacal) ; mêmes tirages => même roue et même Oracle, seul le profil des bonus change.
ok(M.PACT_ORDER.join() === 'safe,std,bold' && M.BASE_MODES.every(function (m) { return M.modeFor(M.familyOf(m), M.pactOf(m)) === m; }) && M.modeFor('plus', 'xx') === 'plus' && M.modeFor('std', 'bold') === 'bold',
  'Pactes : modes ' + M.BASE_MODES.join(', ') + ' (famille × pacte, modeFor/pactOf/familyOf cohérents)');
ok(M.ladderOf('safe').join() === '2,3,5,10' && M.ladderOf('std') === M.WRATH_LADDER && M.ladderOf('bold')[0] === 3 && M.ladderOf('bold')[M.ladderOf('bold').length - 1] === 250,
  'Pactes : échelles de la Colère ×' + M.PACT_ORDER.map(function (p) { return M.ladderOf(p).join('/'); }).join('  ×'));
var PX = require('./rtp-exact'), pSum = {};
M.BASE_MODES.forEach(function (m) { pSum[m] = PX.summary(m); });
ok(M.BASE_MODES.every(function (m) { return Math.abs(pSum[m].rtp - 0.962) < 5e-5 && M.MODES[m].cost === M.MODES[M.familyOf(m)].cost && M.MODES[m].oracle === M.MODES[M.familyOf(m)].oracle; }),
  'Pactes : même coût, même Oracle, RTP exact identique (' + M.BASE_MODES.map(function (m) { return m + ' ' + (pSum[m].rtp * 100).toFixed(3) + ' %'; }).join(' · ') + ')');
ok(['std', 'plus'].every(function (f) { var a = pSum[M.modeFor(f, 'safe')].sdRel, b = pSum[f].sdRel, c = pSum[M.modeFor(f, 'bold')].sdRel; return a * 1.25 < b && b * 1.25 < c; }),
  'Pactes : volatilité nettement ordonnée (écart-type exact × le coût : ' + M.BASE_MODES.map(function (m) { return m + ' ' + pSum[m].sdRel.toFixed(1); }).join(' · ') + ')');
var rPa = 0, nPa = cap(600), sameWheel = 0, profSeen = {};
for (var pi = 0; pi < nPa; pi++) {
  var outP = {};
  ['std', 'safe', 'bold'].forEach(function (m) { var b0 = M.mulberry32(3000 + pi), f0 = true; var rr = M.playRound(function () { if (f0) { f0 = false; return 0.9999; } return b0(); }, m); outP[m] = rr.spins[0]; });
  if (outP.std.index !== outP.safe.index || outP.std.index !== outP.bold.index || String(outP.std.oracle && outP.std.oracle.kind) !== String(outP.safe.oracle && outP.safe.oracle.kind)) rPa++; else sameWheel++;
  if (outP.std.bonus && !outP.std.secret && !outP.std.upgraded) { profSeen[outP.safe.profile + '/' + outP.bold.profile] = 1; if (outP.safe.bonus !== outP.safe.options.safe || outP.bold.bonus !== outP.bold.options.bold) rPa++; }
}
ok(rPa === 0 && profSeen['safe/bold'], 'Pactes : mêmes tirages => même case et même Oracle sur ' + sameWheel + ' tours ; seul le profil du bonus change (anomalies: ' + rPa + ')');
var SEp = require('./stake-export.js'), RGp = require('../js/rgs.js'), badPb = 0, nPb = Math.min(cap(1000), 240);
for (var bi2 = 0; bi2 < nPb; bi2++) {
  var mP = M.BASE_MODES[bi2 % M.BASE_MODES.length], wf = bi2 % 4 === 0, rPb = M.mulberry32(7100 + bi2);
  var rdP = M.playRound(wf ? (function () { var f1 = true; return function () { if (f1) { f1 = false; return 0; } return rPb(); }; })() : rPb, mP), bkP = SEp.makeBook(bi2 + 1, rdP);
  var vP = SEp.verify(bkP), backP = RGp.bookToRound(bkP.events, M);
  if (vP.length || backP.issues.length || backP.pact !== M.pactOf(mP) || M.toInt(backP.total) !== bkP.payoutMultiplier || bkP.events[0].pact !== M.pactOf(mP)) badPb++;
  if (rdP.wrath && (!backP.wrath || backP.wrath.ladder.join() !== M.ladderOf(M.pactOf(mP)).join())) badPb++;
}
var bkBadW = SEp.makeBook(1, M.playRound((function () { var f2 = true, r0 = M.mulberry32(8); return function () { if (f2) { f2 = false; return 0; } return r0(); }; })(), 'safe')); bkBadW.events[1].ladder = M.WRATH_LADDER.slice();
ok(badPb === 0 && SEp.verify(bkBadW).length > 0, 'Pactes : ' + nPb + ' books des 6 modes de base (Colère comprise) vérifiés et relus par RGS.bookToRound au même gain et au même pacte ; une échelle de Colère faussée est refusée');
ok(RGp.modeName('std', null, 'safe') === 'safe' && RGp.modeName('plus', null, 'bold') === 'plus_bold' && RGp.modeName('plus', null, 'std') === 'plus' && RGp.modeName('plus', 'vault', 'bold') === 'bonus_vault' &&
  RGp.parseMode('plus_safe').pact === 'safe' && RGp.parseMode('plus_safe').mode === 'plus' && RGp.parseMode('bold').mode === 'std' && RGp.parseMode('bonus_fury').pact === 'std',
  'Pactes : noms de modes du RGS (modeName / parseMode) aller-retour');

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

// 4b'. Chambre du Trésor : le SCEAU referme la chambre (on garde le total), la CLÉ D'OR ajoute des coffres (aucun objet n'annule le sceau)
var rv = M.mulberry32(606), badV = 0, nV = cap(1000), seals = 0, keysSeen = 0, maxOpen = 0;
M.PROFILES.forEach(function (pf) {
  var vp = M.VAULT_PROFILES[pf];
  if (vp.tokens.some(function (t) { return t[0] === 'ankh' || t[0] === 'curse'; }) || 'curse' in vp) badV++;
  for (var vi = 0; vi < nV; vi++) {
    var vd = M._bonus.vault(rv, pf), tot = 0, allowed = M.VAULT_BASE_PICKS, pk = vd.picks;
    if (pk.length > M.VAULT_PICK_CAP || pk.length > M.VAULT_TILES) badV++;
    pk.forEach(function (x, j) {
      if (j >= allowed) badV++;
      if (x.token === 'seal') { if (j < 2 || j !== pk.length - 1 || x.total !== tot) badV++; seals++; return; }
      if (x.token === 'key') { allowed = Math.min(M.VAULT_PICK_CAP, allowed + M.VAULT_KEY_PICKS); keysSeen++; }
      else if (x.token === 'scepter') tot *= 2; else tot += x.token;
      if (x.total !== tot || x.left !== allowed - j - 1) badV++;
    });
    maxOpen = Math.max(maxOpen, pk.length);
    var endSeal = pk[pk.length - 1].token === 'seal';
    if ((vd.ended === 'seal') !== endSeal || (!endSeal && pk.length !== allowed) || vd.total !== tot + (endSeal ? 0 : M.VAULT_FINISH)) badV++;
  }
});
ok(badV === 0, 'Trésor : sceau = fin sans perte du total, clé d\'or = +' + M.VAULT_KEY_PICKS + ' coffres (max ' + M.VAULT_PICK_CAP + '), aucun jeton protecteur (anomalies: ' + badV + ', sceaux ' + seals + ', clés ' + keysSeen + ', max ouverts ' + maxOpen + ')');
var VX = require('./rtp-exact'), vTgt = { safe: 10.6324, std: 10.6329, bold: 10.6297 };
ok(M.PROFILES.every(function (pf) { return Math.abs(VX.vaultOf(M.VAULT_PROFILES[pf])[0] - vTgt[pf]) < 0.005; }), 'Trésor : espérance exacte inchangée par la refonte (10,63× aux trois profils : ' + M.PROFILES.map(function (pf) { return VX.vaultOf(M.VAULT_PROFILES[pf])[0].toFixed(3); }).join(' / ') + ')');

// 4c. Fureur d'Anubis : 3 couleurs, DOUBLE de sa couleur = palier ×2 et relance, autre couleur = arrêt, bande = bonus ×N × palier
var HS = M.HAND_SEGS, dcount = [0, 0, 0], bands = 0, nums = 0;
HS.forEach(function (s) { if (s.d != null) dcount[s.d]++; else if (s.b) bands++; else nums++; });
ok(dcount[0] === dcount[1] && dcount[1] === dcount[2] && dcount[0] > 0 && bands >= 3 && HS.every(function (s, i) { return JSON.stringify(s) !== JSON.stringify(HS[(i + 1) % HS.length]); }), 'Fureur : même nombre de DOUBLE par couleur (' + dcount.join('/') + '), ' + bands + ' bandes, ' + nums + ' nombres, pas de voisines identiques');
ok(HS.every(function (s) { return s.b == null || ['scarab', 'weigh', 'vault'].indexOf(s.b) >= 0; }), 'Fureur : aucune bande ne renvoie vers la Fureur (pas de boucle)');
var rh = M.mulberry32(77), badH = 0, nH = cap(400000), evC = [0, 0, 0], upC = [0, 0, 0], wrongC = [0, 0, 0], bandC = [0, 0, 0], maxLvl = 0;
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
// à ≤ 1000 scripts l'erreur d'échantillonnage est grande (écart-type de la Fureur ≈ 120×) : tolérance = 5 écarts-types de la moyenne
var EX = require('./rtp-exact')(), handTol = 5 * EX.buy.hand.sd / Math.sqrt(nH);
ok(evC.every(function (v) { return Math.abs(v / nH - EX.buy.hand.mean) < handTol; }), 'Fureur : espérance identique pour les 3 couleurs (' + evC.map(function (v) { return (v / nH).toFixed(2); }).join(' / ') + ')');
var cntTol = function (a) { return 6 / Math.sqrt(Math.max(1, Math.min.apply(null, a))); };
ok(upC.every(function (v) { return Math.abs(v / upC[0] - 1) < cntTol(upC); }) && wrongC.every(function (v) { return Math.abs(v / wrongC[0] - 1) < cntTol(wrongC); }) && bandC.every(function (v) { return Math.abs(v / bandC[0] - 1) < cntTol(bandC); }), 'Fureur : doublements / mauvaise couleur / bandes aussi fréquents pour chaque couleur (' + upC.join('/') + ' · ' + wrongC.join('/') + ' · ' + bandC.join('/') + ')');
ok(Math.abs(evMean - EX.buy.hand.mean) < handTol, 'Fureur : espérance du bonus ≈ ' + evMean.toFixed(2) + '× (exact ' + EX.buy.hand.mean.toFixed(2) + '× ± ' + handTol.toFixed(1) + ', ' + nH + ' scripts)');
// recalcul après le choix du joueur dans la Pesée imbriquée
var rw2 = M.mulberry32(5), badR = 0;
for (var wi = 0; wi < cap(20000); wi++) { var hh = M._bonus.hand(rw2, 0, [0]); if (hh.spins[0].kind !== 'band') { badR++; continue; } }
var forcedW = M._bonus.hand(M.mulberry32(3), 1, [12]); var d0 = forcedW.spins[0].bonus; d0.pick = 1 - d0.heavy; d0.total = M.weighGain(d0, d0.pick); M.handRecalc(forcedW);
ok(badR === 0 && forcedW.total === 0 && forcedW.spins[0].band === 'weigh', 'Fureur : le total se recalcule si le joueur change son choix dans la Pesée imbriquée');

// 4d. Bonus SECRET « Sanctuaire des Marées » : grille 3×3 de tablettes tirées d'avance (offrande, marée, éclipse), remplace un bonus gagné
var CR = M._bonus.crypt, rc = M.mulberry32(404), badC = 0, nC = cap(1000), typeCnt = {}, sumTot = 0, floorHit = 0;
// implémentation de référence, écrite à part des maths : le total rejoué doit être celui du script
function refCrypt(drops) {
  var pool = 0, tide = 1;
  drops.forEach(function (d) {
    if (d.t === 'tab') pool += d.v * tide; else if (d.t === 'tide') tide *= d.v; else if (d.t === 'eclipse') pool *= d.v;
  });
  return Math.min(Math.max(pool, 1), M.MAX_WIN);
}
for (var ci = 0; ci < nC; ci++) {
  var cd = CR(rc), ds = cd.drops, pool0 = 0, tide0 = 1;
  if (ds.length !== M.CRYPT_CELLS || cd.steps.length !== ds.length || cd.profile !== 'crypt' || M.CRYPT_ROWS * M.CRYPT_COLS !== M.CRYPT_CELLS) badC++;
  ds.forEach(function (d, j) {
    var st = cd.steps[j];
    typeCnt[d.t] = (typeCnt[d.t] || 0) + 1;
    if (!M.CRYPT_TYPES.some(function (q) { return q[0] === d.t; })) badC++;
    if (d.t !== 'dust' && !M.CRYPT_VALUES[d.t].some(function (q) { return q[0] === d.v; })) badC++;
    if (st.poolBefore !== pool0 || st.tideBefore !== tide0) badC++;
    if (d.t === 'tab') pool0 += d.v * tide0; else if (d.t === 'tide') tide0 *= d.v; else if (d.t === 'eclipse') pool0 *= d.v;
    if (st.pool !== pool0 || st.tide !== tide0) badC++;
    if (d.t === 'tide' && st.pool !== st.poolBefore) badC++;   // la marée ne touche pas l'offrande déjà accumulée
    if (d.t === 'tab' && st.gain !== d.v * st.tideBefore) badC++;
  });
  if (pool0 < 1) floorHit++;
  if (Math.abs(cd.total - refCrypt(ds)) > 1e-9 || cd.total < 1 || cd.total > M.MAX_WIN) badC++;
  sumTot += cd.total;
}
ok(badC === 0, 'Sanctuaire : script de ' + M.CRYPT_CELLS + ' tablettes (grille ' + M.CRYPT_ROWS + '×' + M.CRYPT_COLS + '), types/valeurs valides, la marée n\'agit que sur les tablettes suivantes, total rejoué = référence indépendante sur ' + nC + ' scripts (anomalies: ' + badC + ')');
ok(Object.keys(typeCnt).length === 4, 'Sanctuaire : les quatre types de tablettes apparaissent (' + JSON.stringify(typeCnt) + ')');
var noTab = CR(M.mulberry32(1), [{ t: 'dust' }, { t: 'tide', v: 5 }, { t: 'eclipse', v: 3 }, { t: 'dust' }, { t: 'dust' }, { t: 'dust' }, { t: 'dust' }, { t: 'dust' }, { t: 'dust' }]);
ok(noTab.total === 1 && noTab.pool === 1, 'Sanctuaire : sans aucune tablette, l\'offrande est relevée au plancher ×1');
// plafond : un script extrême est plafonné à MAX_WIN
var ext = []; for (var ei = 0; ei < 9; ei++) ext.push(ei < 4 ? { t: 'tide', v: 10 } : { t: 'tab', v: 300 });
var capd = CR(M.mulberry32(1), ext);
ok(capd.total === M.MAX_WIN && capd.capped, 'Sanctuaire : un script extrême est plafonné à ' + M.MAX_WIN + '×');
var mini = CR(M.mulberry32(1), [{ t: 'tab', v: 3 }, { t: 'tide', v: 2 }, { t: 'tab', v: 5 }, { t: 'eclipse', v: 2 }, { t: 'dust' }, { t: 'tab', v: 1 }, { t: 'tide', v: 3 }, { t: 'tab', v: 2 }, { t: 'dust' }]);
// 3 -> marée ×2 -> +5×2 = 13 -> éclipse ×2 = 26 -> dust -> +1×2 = 28 -> marée ×6 -> +2×6 = 40
ok(mini.total === 40 && mini.tide === 6 && mini.steps[2].gain === 10 && mini.steps[3].pool === 26, 'Sanctuaire : script écrit à la main rejoué correctement (offrande ' + mini.total + ', marée ×' + mini.tide + ')');
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
ok(badS === 0 && perRound > 1 / 2000 && perRound < 1 / 100, 'Secret : 1 tour sur ' + (1 / perRound).toFixed(0) + ' (cible ≈ 500), uniquement à la place d\'un bonus de la roue, sans choix de profil (anomalies: ' + badS + ')');
ok(Math.abs(secrets / bonuses - M.SECRET_UPGRADE) < 0.03, 'Secret : ' + (secrets / bonuses * 100).toFixed(2) + ' % des bonus gagnés (réglé à ' + M.SECRET_UPGRADE * 100 + ' %) — ' + (1 / (M.SECRET_UPGRADE * 0.05)).toFixed(0) + ' tours en théorie');
var rbuy = M.mulberry32(8), secBuy = 0; ['scarab', 'weigh', 'vault', 'hand'].forEach(function (k) { for (var i = 0; i < cap(50000); i++) if (M.playBuy(rbuy, k).spins[0].secret) secBuy++; });
ok(secBuy === 0, 'Secret : jamais proposé à l\'achat');
// espérance du secret = espérance moyenne du bonus qu'il remplace (RTP global inchangé)
var rE = M.mulberry32(31), nE = cap(2000000), eS = 0, eR = { scarab: 0, weigh: 0, vault: 0, hand: 0 };
for (var ei2 = 0; ei2 < nE; ei2++) {
  eS += Math.min(CR(rE).total, M.MAX_WIN);
  ['scarab', 'weigh', 'vault', 'hand'].forEach(function (k) { eR[k] += Math.min(M._bonus[k](rE, k === 'hand' ? 0 : 'std').total, M.MAX_WIN); });
}
var replaced = (1 - M.HAND_UPGRADE) * (eR.scarab + eR.weigh + eR.vault) / 3 / nE + M.HAND_UPGRADE * eR.hand / nE;
// tolérance = 5 écarts-types de l'écart des moyennes (Crypte ≈ 80×, Fureur ≈ 120×, autres ≈ 15-70×) : à ≤ 1000 tirages, test de fumée ; l'égalité fine est réglée par tools/tune.js
var secTol = 5 * Math.sqrt(80 * 80 + 60 * 60) / Math.sqrt(nE);
ok(Math.abs(eS / nE - replaced) < secTol, 'Secret : espérance ≈ ' + (eS / nE).toFixed(2) + '× pour ' + replaced.toFixed(2) + '× de bonus remplacé (± ' + secTol.toFixed(1) + ' ; espérance exacte du Sanctuaire = 10,2142× contre 10,2143× pour le bonus remplacé : voir tools/tune-crypt.js)');

var VXc = require('./rtp-exact'), cm = VXc.cryptMoments(), rpl = VXc().replaced;
ok(Math.abs(cm[0] - rpl) < 0.01, 'Sanctuaire : espérance EXACTE ' + cm[0].toFixed(4) + '× = bonus remplacé ' + rpl.toFixed(4) + '× (écart < 0,01×, secret neutre sur le RTP ; écart-type exact ' + Math.sqrt(cm[1] - cm[0] * cm[0]).toFixed(1) + '×)');

// 5. RTP. Très haute volatilité (écart-type exact ≈ 31 depuis la Colère d'Anubis ; ≈ 16 avant) : 1000 tours ne donnent le RTP qu'à ± 200 points, donc la référence est le calcul EXACT (tools/rtp-exact.js, moments des
// tables de js/math.js, aucun tirage). La simulation n'est qu'un test de fumée (≤ 1000 tours, tolérance = 4 écarts-types). Mesures de réglage (2 M de tours, hors test) :
// Standard 97,8 % ± 2,2 (exact 96,19), Oracle+ 97,0 % ± 2,5 (exact 96,13), achats 96,0-96,5 % ± 0,5-0,9.
var EXR = require('./rtp-exact')();
ok(EXR.std.mean > 0.960 && EXR.std.mean < 0.9630, 'RTP exact Standard ' + (EXR.std.mean * 100).toFixed(2) + ' % (cible 96,0-96,3)');
ok(EXR.plus.mean > 0.960 && EXR.plus.mean < 0.9630, 'RTP exact Oracle+ ' + (EXR.plus.mean * 100).toFixed(2) + ' % (cible ≈ 96)');
ok(EXR.std.sd > 25 && EXR.std.sd < 40 && EXR.plus.sdRel > 25 && EXR.plus.sdRel < 45, 'volatilité très haute : écart-type exact (plafond compris) ' + EXR.std.sd.toFixed(1) + '× (Standard), ' + EXR.plus.sdRel.toFixed(1) + '× (Oracle+, rapporté au coût)');
ok(EXR.std.hit > 0.30 && EXR.std.hit < 0.36 && EXR.bonusEvery > 18, 'taux de gain exact ' + (EXR.std.hit * 100).toFixed(1) + ' % (cible 30-36), bonus 1 tour sur ' + EXR.bonusEvery.toFixed(1));
Object.keys(EXR.buy).forEach(function (k) { ok(Math.abs(EXR.buy[k].rtp - 0.96) < 0.005, 'RTP exact achat ' + k + ' ' + (EXR.buy[k].rtp * 100).toFixed(2) + ' % (prix ×' + M.BUY[k].price + ')'); });
ok(M.MAX_WIN === 25000, 'gain maximum 25 000× la mise');
function tol(sd, n) { return 4 * sd / Math.sqrt(n) * 100; }
function rtp(f, cost, n) { var s = 0; for (var i = 0; i < n; i++) s += f().total; return s / n / cost * 100; }
var r1 = M.mulberry32(11), n = cap(2000000);
var std = rtp(function () { return M.playRound(r1, 'std'); }, 1, n);
var plus = rtp(function () { return M.playRound(r1, 'plus'); }, M.MODES.plus.cost, n);
ok(Math.abs(std - 96.2) < tol(EXR.std.sd, n), 'RTP Standard simulé ≈ ' + std.toFixed(2) + ' % (test de fumée, 96,2 ± ' + tol(EXR.std.sd, n).toFixed(0) + ', ' + n + ' tours)');
ok(Math.abs(plus - 96.2) < tol(EXR.plus.sdRel, n), 'RTP Oracle+ simulé ≈ ' + plus.toFixed(2) + ' % (test de fumée, 96,1 ± ' + tol(EXR.plus.sdRel, n).toFixed(0) + ', ' + n + ' tours)');
Object.keys(M.BUY).forEach(function (k) {
  var nb = cap(1000000), v = rtp(function () { return M.playBuy(r1, k); }, M.BUY[k].price, nb);
  ok(Math.abs(v - 96) < tol(EXR.buy[k].sdRel, nb), 'RTP achat ' + k + ' simulé ≈ ' + v.toFixed(2) + ' % (test de fumée, tolérance ± ' + tol(EXR.buy[k].sdRel, nb).toFixed(0) + ')');
});
// 6. échelle entière Stake : chaque gain d'un tour (et chaque coût) doit être un multiple exact de 0,01 (≤ 1000 tours par mode)
var rI = M.mulberry32(77), inexact = 0, nI = cap(1000), sumInt = 0, sumFl = 0;
['std', 'plus'].forEach(function (m) { for (var i = 0; i < nI; i++) { var rr = M.playRound(rI, m); rr.spins.forEach(function (sp) { if (!M.isExact(sp.pay)) inexact++; }); if (!M.isExact(rr.total)) inexact++; sumInt += M.toInt(rr.total); sumFl += rr.total; } });
Object.keys(M.BUY).forEach(function (k) { if (!M.isExact(M.BUY[k].price)) inexact++; for (var i = 0; i < nI; i++) { var rr = M.playBuy(rI, k); if (!M.isExact(rr.total)) inexact++; sumInt += M.toInt(rr.total); sumFl += rr.total; } });
ok(M.SCALE === 100 && inexact === 0 && Math.abs(sumInt / M.SCALE - sumFl) < 1e-6 * Math.max(1, sumFl), 'échelle entière ×' + M.SCALE + ' : tous les gains de ' + nI + ' tours par mode sont des multiples exacts de 0,01 (non exacts : ' + inexact + ')');
// 7. pas de 0,1× exigé par le vérificateur du SDK Stake (payouts multiples de 10 à l'échelle 100) : aucun arrondi du total, TOUS les gains sont des multiples de 0,1
var rT = M.mulberry32(88), notTenth = 0, nT = cap(1000);
function tenths(v) { if (typeof v === 'number' && !M.isTenth(v)) notTenth++; }
M.PROFILES.forEach(function (pf) { M.SCARAB_PROFILES[pf].forEach(tenths); M.WEIGH_PROFILES[pf].forEach(function (e) { tenths(e[0][0]); tenths(e[0][1]); }); M.VAULT_PROFILES[pf].tokens.forEach(function (t) { tenths(t[0]); }); });
Object.keys(M.KINDS).forEach(function (k) { if (M.KINDS[k].mult != null) tenths(M.KINDS[k].mult); });
M.HAND_SEGS.forEach(function (s) { if (s.n != null) tenths(s.n); });
M.CRYPT_VALUES.tab.forEach(function (t) { tenths(t[0]); });
['std', 'plus'].forEach(function (m) { for (var i = 0; i < nT; i++) { var rr = M.playRound(rT, m); rr.spins.forEach(function (sp) { tenths(sp.pay); tenths(sp.base); }); tenths(rr.total); } });
Object.keys(M.BUY).forEach(function (k) { for (var i = 0; i < nT; i++) { var rr = M.playBuy(rT, k); tenths(rr.total); } });
ok(notTenth === 0 && M.toInt(M.KINDS.m025.mult) % 10 === 0, 'gains en multiples de 0,1× (payoutMultiplier multiple de 10 à l\'échelle ' + M.SCALE + ', exigence de utils/rgs_verification.py) : ' + nT + ' tours par mode, valeurs non conformes : ' + notTenth);
// 8. Sanctuaire des Marées : book (sanctuaryTablet) -> tour par RGS.bookToRound, mêmes gains (tablet_type / value, pas l'ancien cryptDrop)
var RGc = require('../js/rgs.js'), SEc = require('./stake-export.js'), rS = M.mulberry32(99), badSanct = 0, nS = Math.min(cap(1000), 300);
for (var si = 0; si < nS; si++) {
  var cb = M._bonus.crypt(rS), rnd = { spins: [{ oracle: null, index: 5, kind: 'vault', boost: 1, bonus: cb, secret: true, base: cb.total, pay: cb.total }], total: cb.total, capped: false, cost: 1, mode: 'std' };
  var back = RGc.bookToRound(SEc.bookEvents(rnd), M), bs = back.spins[0];
  if (!bs || !bs.secret || bs.bonus.drops.length !== M.CRYPT_CELLS || M.toInt(bs.bonus.total) !== M.toInt(cb.total) || M.toInt(back.total) !== M.toInt(cb.total)) badSanct++;
}
ok(badSanct === 0, 'RGS.bookToRound relit le Sanctuaire des Marées (sanctuaryTablet : type, valeur) avec le même gain sur ' + nS + ' bonus (écarts : ' + badSanct + ')');
// 9. Colère d'Anubis dans les books : événements wrath / wheelStop.wrath / wrathUp vérifiés par verify() et relus par RGS.bookToRound (même gain)
var rWb = M.mulberry32(77), badWb = 0, nWb = Math.min(cap(1000), 200), upsWb = 0;
for (var wi2 = 0; wi2 < nWb; wi2++) {
  var f1 = true, rdw = M.playRound(function () { if (f1) { f1 = false; return 0; } return rWb(); }, wi2 % 2 ? 'plus' : 'std'), bkw = SEc.makeBook(wi2 + 1, rdw);
  upsWb += bkw.events.filter(function (e) { return e.type === 'wrathUp'; }).length;
  var vw = SEc.verify(bkw), back2 = RGc.bookToRound(bkw.events, M);
  if (vw.length || back2.issues.length || M.toInt(back2.total) !== bkw.payoutMultiplier || !back2.wrath || back2.wrath.mult !== rdw.wrath.mult) badWb++;
}
// un book altéré (multiplicateur de la Colère faussé) doit être refusé par verify()
var fw = true, rdx = M.playRound(function () { if (fw) { fw = false; return 0; } return rWb(); }, 'std'), bkx = SEc.makeBook(1, rdx);
bkx.events.forEach(function (e) { if (e.type === 'wheelStop') e.wrath = 7; });
ok(badWb === 0 && upsWb > 0 && SEc.verify(bkx).length > 0, 'Colère : ' + nWb + ' books vérifiés (verify) et relus par RGS.bookToRound au même gain (' + upsWb + ' wrathUp) ; un multiplicateur faussé est refusé');
console.log(fails ? '\n' + fails + ' échec(s)' : '\ntout est bon');
process.exit(fails ? 1 : 0);
