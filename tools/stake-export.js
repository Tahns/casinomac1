// node tools/stake-export.js [books-par-mode=1000 (plafonné à 1000)] [graine=2026]
// Démonstration du FORMAT Stake Engine à partir de js/math.js (ce n'est PAS la table de production : 1000 books tirés au hasard,
// poids tous égaux à 1, aucune optimisation de RTP). Sans dépendance. Écrit dans tools/out/ (ignoré par git) :
//   index.json                         { modes: [{ name, cost, events, weights, is_buybonus }] }
//   books_<mode>.jsonl[.zst]           un book par ligne : { id, events[], payoutMultiplier }  (zstd si zlib.zstdCompressSync existe, sinon .jsonl brut)
//   lookUpTable_<mode>_0.csv           n°,poids,payoutMultiplier   (3 entiers non signés, sans en-tête)
// payoutMultiplier = M.toInt(gain / mise) avec l'échelle M.SCALE = 100 (100 = 1,00×). Coût d'un mode = débit en multiples de la mise.
//
// STRATÉGIE POUR LES CHOIX DU JOUEUR (un book est un résultat figé) :
//  - Pesée du Cœur (plume ou cœur) : la plume est le choix « neutre » ; l'événement weighReveal dit seulement si LE CHOIX DU JOUEUR gagne
//    (playerWins) et la valeur de SON plateau (playerMult) ; le front place les valeurs sur les plateaux de façon à rester cohérent avec le choix
//    réel. Le choix est donc décoratif, comme il l'est déjà (50/50, même espérance).
//  - Fureur d'Anubis (couleur) : les trois couleurs sont symétriques ; le book est écrit pour « la couleur du joueur » = couleur 0, et le front
//    renomme les couleurs par rotation pour que ce soit celle que le joueur a touchée (event furyColor, colourIndex toujours 0 dans le book).
//  - Profil Prudent / Équilibré / Audacieux : NON symétrique (tables différentes, mêmes espérances seulement). Le book joue le profil Équilibré ;
//    les autres profils NE peuvent PAS rester un vrai choix. Pour le conserver, il faut un mode Stake par profil (même coût, même RTP) ; l'événement
//    profileChoice indique binding:false et ne contient pas les gains des autres profils.
//  - Chambre du Trésor (tuile) : l'ordre des jetons est tiré d'avance (picks[]), le coffre touché n'a aucun effet : neutre, rien à pré-résoudre.
var fs = require('fs'), path = require('path'), zlib = require('zlib');
var M = require('../js/math.js');
var cap = require('./cap');
var N = cap(parseInt(process.argv[2] || '1000', 10));
var seed = parseInt(process.argv[3] || '2026', 10);
var OUT = path.join(__dirname, 'out');
var I = M.toInt;

function bonusEvents(kind, b, src) {
  var ev = [], i;
  if (kind === 'scarab') {
    ev.push({ type: 'profileChoice', binding: false, profile: b.profile });
    b.balls.forEach(function (ba, k) { ev.push({ type: 'scarabDrop', ball: k + 1, path: ba.path, slot: ba.slot, win: I(ba.value) }); });
  } else if (kind === 'weigh') {
    var pk = b.pick || 0, playerMult = b.mults[pk], playerWins = b.heavy === pk;   // choix neutre : plume (0) ; tirage aléatoire dans une bande de la Fureur
    ev.push({ type: 'profileChoice', binding: false, profile: b.profile });
    ev.push({ type: 'weighReveal', mults: b.mults.map(I), playerMult: I(playerMult), playerWins: playerWins, win: I(M.weighGain(b, pk)) });
  } else if (kind === 'vault') {
    ev.push({ type: 'profileChoice', binding: false, profile: b.profile });
    b.picks.forEach(function (p, k) { ev.push({ type: 'vaultPick', pick: k + 1, token: typeof p.token === 'number' ? I(p.token) : p.token, chestsLeft: p.left, runningTotal: I(p.total) }); });
    ev.push({ type: 'vaultEnd', ended: b.ended, finishBonus: I(b.bonusFinish), win: I(b.total) });
  } else if (kind === 'hand') {
    ev.push({ type: 'furyColor', colourIndex: 0, note: 'couleur du joueur = 0 ; le front fait pivoter les noms de couleurs' });
    b.spins.forEach(function (s, k) {
      var e = { type: 'furySpin', spin: k + 1, segment: s.idx, kind: s.kind, tier: s.mult, final: s.final };
      if (s.kind === 'num') e.number = s.base;
      if (s.kind === 'band') { e.band = s.band; e.bandMult = s.x; }
      ev.push(e);
      if (s.kind === 'band') bonusEvents(s.band, s.bonus, 'band').forEach(function (x) { x.nested = s.band; ev.push(x); });
    });
    ev.push({ type: 'furyEnd', win: I(b.total) });
  } else if (kind === 'crypt') {
    b.steps.forEach(function (st, k) { ev.push({ type: 'sanctuaryTablet', tablet: k + 1, tablet_type: st.t, value: st.v, tideBefore: st.tideBefore, offering: st.pool, tide: st.tide }); });
    ev.push({ type: 'sanctuaryEnd', offering: b.pool, tide: b.tide, win: I(b.total) });
  }
  return ev;
}

function bookEvents(round) {
  var ev = [{ type: 'roundStart', mode: round.mode, cost: I(round.cost) }];
  round.spins.forEach(function (s, k) {
    if (s.oracle) ev.push({ type: 'oracle', kind: s.oracle.kind, boost: s.oracle.boost });
    if (s.index >= 0) ev.push({ type: 'wheelStop', spin: k + 1, index: s.index, kind: s.kind, boost: s.boost });
    if (s.bonus) {
      var kind = s.secret ? 'crypt' : s.upgraded ? 'hand' : s.kind;
      ev.push({ type: 'bonusStart', bonus: kind, secret: !!s.secret, bought: round.mode === 'buy' });
      bonusEvents(kind, s.bonus).forEach(function (e) { ev.push(e); });
    }
    ev.push({ type: 'spinWin', spin: k + 1, win: I(s.pay), respin: s.kind === 'ankh' });
  });
  ev.push({ type: 'finalWin', amount: I(round.total), capped: !!round.capped });
  return ev;
}

module.exports = { bookEvents: bookEvents };   // utilisé par tools/mock-rgs.js ; la génération des fichiers ne tourne qu'en exécution directe
if (require.main !== module) return;

var MODES = [
  { name: 'std', cost: M.MODES.std.cost, play: function (r) { return M.playRound(r, 'std'); } },
  { name: 'plus', cost: M.MODES.plus.cost, play: function (r) { return M.playRound(r, 'plus'); } }
];
[['scarab', 'scarab'], ['weigh', 'weigh'], ['vault', 'vault'], ['fury', 'hand']].forEach(function (p) {
  MODES.push({ name: 'buy_' + p[0], cost: M.BUY[p[1]].price, buy: true, play: function (r) { return M.playBuy(r, p[1]); } });
});

fs.mkdirSync(OUT, { recursive: true });
var canZstd = typeof zlib.zstdCompressSync === 'function', index = { modes: [] }, report = [];
MODES.forEach(function (m, mi) {
  var rng = M.mulberry32(seed + mi), lines = [], csv = [], sumPay = 0, bad = 0;
  for (var i = 0; i < N; i++) {
    var round = m.play(rng), pm = I(round.total);
    if (!M.isExact(round.total) || pm < 0 || pm > M.MAX_WIN * M.SCALE) bad++;
    var book = { id: i + 1, events: bookEvents(round), payoutMultiplier: pm };
    // contrôle croisé : le multiplicateur du book est la somme (plafonnée) des gains de chaque tour
    lines.push(JSON.stringify(book)); csv.push((i + 1) + ',1,' + pm); sumPay += pm;
  }
  var file = 'books_' + m.name + '.jsonl' + (canZstd ? '.zst' : ''), body = lines.join('\n') + '\n';
  fs.writeFileSync(path.join(OUT, file), canZstd ? zlib.zstdCompressSync(Buffer.from(body)) : body);
  var wfile = 'lookUpTable_' + m.name + '_0.csv';
  fs.writeFileSync(path.join(OUT, wfile), csv.join('\n') + '\n');
  index.modes.push({ name: m.name, cost: m.cost, events: file, weights: wfile, is_buybonus: !!m.buy });
  report.push(m.name + ': ' + N + ' books, coût ×' + m.cost + ', RTP de l\'échantillon ' + (sumPay / M.SCALE / N / m.cost * 100).toFixed(1) + ' % (non représentatif), anomalies ' + bad);
});
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log(report.join('\n'));
console.log('Écrit dans ' + OUT + (canZstd ? ' (books en .jsonl.zst via zlib.zstdCompressSync)' : ' (zstd indisponible : books en .jsonl non compressés)'));
