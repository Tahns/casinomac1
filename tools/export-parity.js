// node tools/export-parity.js [tours-par-mode=100] [bonus-par-type=60] [graine=2026] [sortie=stake-math/tests/parity_draws.json]
// Produit le fichier de PARITÉ lu par stake-math/tests/test_parity.py : des tirages uniformes pré-générés par js/math.js (entiers uint32 k,
// valeur = k / 2^32, exacte) et, pour chaque tour ou bonus, ce que le JS en a fait (gain entier à l'échelle M.SCALE, cases, détails).
// Le moteur Python rejoue les mêmes tirages et doit retrouver exactement les mêmes gains en consommant exactement les mêmes tirages.
// Budget TOTAL plafonné à 1000 tours/tirages (tools/cap.js) : 6 modes x 100 tours + 5 bonus x 60 + 20 cas forcés = 920.
// Écrit aussi les résultats du calcul exact (tools/rtp-exact.js) pour que Python les compare à 1e-9 près.
var fs = require('fs'), path = require('path');
var M = require('../js/math.js');
var cap = require('./cap');
var exact = require('./rtp-exact');
var I = M.toInt;
var perMode = parseInt(process.argv[2] || '100', 10), perBonus = parseInt(process.argv[3] || '60', 10);
var seed = parseInt(process.argv[4] || '2026', 10);
var out = process.argv[5] || path.join(__dirname, '..', 'stake-math', 'tests', 'parity_draws.json');
var MODES = ['std', 'plus', 'bonus_scarab', 'bonus_weigh', 'bonus_vault', 'bonus_fury'], BUYS = { bonus_scarab: 'scarab', bonus_weigh: 'weigh', bonus_vault: 'vault', bonus_fury: 'hand' };
var BUDGET = cap(1000), used = 0;
function take(n) { if (used + n > BUDGET) throw new Error('budget de ' + BUDGET + ' tirages dépassé'); used += n; return n; }

function recorder(base) {   // enregistre chaque tirage sous forme d'entier uint32
  var draws = [];
  var r = function () { var v = base(); draws.push(Math.round(v * 4294967296)); return v; };
  r.draws = draws;
  return r;
}
function spinInfo(s) {
  var bk = s.bonus ? (s.secret ? 'crypt' : s.upgraded ? 'hand' : s.kind) : null;
  return [s.kind, s.index, s.boost, I(s.pay), bk];
}
function bonusDetail(kind, b) {
  if (kind === 'scarab') return b.balls.map(function (x) { return x.slot; });
  if (kind === 'weigh') return [I(b.mults[0]), I(b.mults[1]), b.heavy, b.pick];
  if (kind === 'vault') return b.picks.map(function (p) { return typeof p.token === 'number' ? I(p.token) : p.token; }).concat([b.ended]);
  if (kind === 'hand') return b.spins.map(function (s) { return [s.idx, s.kind, s.mult]; });
  if (kind === 'crypt') return b.drops.map(function (d) { return [d.t, d.t === 'tab' ? I(d.v) : d.v]; });
  return null;
}

var doc = { version: 1, scale: M.SCALE, max_win: M.MAX_WIN, seed: seed, layout: M.LAYOUT, modes: {}, bonuses: {}, exact: null };

MODES.forEach(function (name, mi) {
  var n = take(cap(perMode)), rng = recorder(M.mulberry32(seed + mi)), rounds = [];
  for (var i = 0; i < n; i++) {
    rng.draws.length = 0;
    var r = BUYS[name] ? M.playBuy(rng, BUYS[name]) : M.playRound(rng, name);
    rounds.push({ d: rng.draws.slice(), total: I(r.total), capped: !!r.capped, spins: r.spins.map(spinInfo) });
  }
  doc.modes[name] = { cost: r_cost(name), rounds: rounds };
});
function r_cost(name) { return BUYS[name] ? M.BUY[BUYS[name]].price : M.MODES[name].cost; }

// bonus pris isolément (profil Équilibré ; la Fureur et le Sanctuaire couvrent leurs variantes)
var B = M._bonus;
['scarab', 'weigh', 'vault'].forEach(function (kind, bi) {
  var n = take(cap(perBonus)), rng = recorder(M.mulberry32(seed + 100 + bi)), list = [];
  for (var i = 0; i < n; i++) { rng.draws.length = 0; var b = B[kind](rng, 'std'); list.push({ d: rng.draws.slice(), total: I(b.total), detail: bonusDetail(kind, b) }); }
  doc.bonuses[kind] = list;
});
(function () {
  var n = take(cap(perBonus)), rng = recorder(M.mulberry32(seed + 110)), list = [];
  for (var i = 0; i < n; i++) { rng.draws.length = 0; var c = i % 3, b = B.hand(rng, c); list.push({ d: rng.draws.slice(), colour: c, total: I(b.total), detail: bonusDetail('hand', b) }); }
  doc.bonuses.hand = list;
  // chaînes imposées (DOUBLE de la couleur, puis bande) : couvre les paliers élevés et le plafond
  var forced = [[2, 14, 2, 12], [2, 14, 2, 14, 15], [2, 14, 2, 7], [2, 12], [14, 0], [6, 15]];
  list = [];
  take(forced.length * 2);
  forced.forEach(function (f, fi) {
    for (var k = 0; k < 2; k++) {
      rng = recorder(M.mulberry32(seed + 120 + fi * 2 + k));
      var b = B.hand(rng, 0, f);
      list.push({ d: rng.draws.slice(), forced: f, total: I(b.total), detail: bonusDetail('hand', b) });
    }
  });
  doc.bonuses.hand_forced = list;
})();
(function () {
  var n = take(cap(perBonus)), rng = recorder(M.mulberry32(seed + 130)), list = [];
  for (var i = 0; i < n; i++) { rng.draws.length = 0; var b = B.crypt(rng); list.push({ d: rng.draws.slice(), total: I(b.total), capped: !!b.capped, detail: bonusDetail('crypt', b) }); }
  doc.bonuses.crypt = list;
  var T = function (t, v) { return { t: t, v: v }; };
  var forced = [
    [T('dust', 0), T('dust', 0), T('dust', 0), T('dust', 0), T('dust', 0), T('dust', 0), T('dust', 0), T('dust', 0), T('dust', 0)],   // aucune tablette : plancher x1
    [T('tab', 300), T('tide', 10), T('tide', 10), T('tab', 300), T('tab', 300), T('eclipse', 3), T('eclipse', 3), T('tab', 100), T('tab', 100)],   // dépasse le plafond
    [T('tab', 5), T('eclipse', 2), T('tide', 3), T('tab', 10), T('dust', 0), T('tab', 1)],
    [T('tab', 25), T('tab', 25), T('tab', 25), T('tab', 25), T('tab', 25), T('tab', 25), T('tab', 25), T('tab', 25), T('tab', 25)]
  ];
  list = [];
  take(forced.length);
  forced.forEach(function (f, fi) {
    var rr = recorder(M.mulberry32(seed + 140 + fi)), b = B.crypt(rr, f);
    list.push({ d: rr.draws.slice(), forced: f.map(function (x) { return [x.t, x.v]; }), total: I(b.total), capped: !!b.capped, detail: bonusDetail('crypt', b) });
  });
  doc.bonuses.crypt_forced = list;
})();

// gain maximal : script de tirages construit ICI (indépendamment de stake-math/force.py), joué par js/math.js. Python rejoue ces tirages ET compare
// avec son propre script : le chemin du plafond (Fureur x8, Pesée 1000 x 6, plafond 25 000 x) est donc identique dans les deux langages.
(function () {
  function uIdx(i, n) { return (i + 0.5) / n; }
  function uW(table, pred) { var s = 0, c = 0, i; table.forEach(function (t) { s += t[1]; }); for (i = 0; i < table.length; i++) { if (pred(table[i][0])) return (c + table[i][1] / 2) / s; c += table[i][1]; } throw new Error('valeur absente'); }
  var segs = M.HAND_SEGS, n = segs.length, d0 = [], w = -1;
  segs.forEach(function (sg, i) { if (sg.d === 0) d0.push(i); if (sg.b === 'weigh') w = i; });
  var fury = [uIdx(d0[0], n), uIdx(d0[1], n), uIdx(d0[0], n), uIdx(w, n),
    uW(M.WEIGH_PROFILES.std, function (p) { return p[0] === 60 && p[1] === 1000; }), 0.25, 0.75, 0.75, uIdx(1, n), uIdx(1, n)];
  var pre = {
    std: [0.9999, uIdx(M.LAYOUT.indexOf('scarab'), M.N), 0.5, 0.01], plus: null, bonus_scarab: [0.01], bonus_weigh: [0.01], bonus_vault: [0.01], bonus_fury: []
  };
  pre.plus = pre.std;
  doc.wincap = {};
  MODES.forEach(function (name, mi) {
    take(1);
    var script = pre[name].concat(fury), pos = 0;
    var rng = function () { return script[pos++]; };
    var r = BUYS[name] ? M.playBuy(rng, BUYS[name]) : M.playRound(rng, name);
    if (pos !== script.length) throw new Error('script de plafond mal consommé : ' + name + ' ' + pos + '/' + script.length);
    doc.wincap[name] = { script: script, total: I(r.total), capped: !!r.capped };
  });
})();

// résultats EXACTS de tools/rtp-exact.js (aucun tirage)
var ex = exact();
doc.exact = {
  std: ex.std, plus: ex.plus, buy: ex.buy, hand: ex.hand, replaced: ex.replaced, bonusEvery: ex.bonusEvery,
  bonus: ex.bonus, crypt: exact.cryptMoments(),
  vault: { safe: exact.vaultOf(M.VAULT_PROFILES.safe), std: exact.vaultOf(M.VAULT_PROFILES.std), bold: exact.vaultOf(M.VAULT_PROFILES.bold) }
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(doc) + '\n');
console.log('Parité : ' + used + ' tours/tirages (plafond ' + BUDGET + '), écrit ' + out + ' (' + (fs.statSync(out).size / 1024).toFixed(0) + ' Ko)');
