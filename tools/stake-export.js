// node tools/stake-export.js [books-au-total=1000 (plafonné à 1000, répartis sur les 6 modes)] [graine=2026]
// Démonstration du FORMAT Stake Engine à partir de js/math.js (ce n'est PAS la table de production : 1000 books au plus tirés au hasard,
// poids tous égaux à 1, aucune optimisation de RTP). Sans dépendance. Écrit dans tools/out/ (ignoré par git) :
//   index.json                         { format: 2, wheel: { cells, layout[] }, modes: [{ name, cost, events, weights, is_buybonus }] }
//   books_<mode>.jsonl[.zst]           un book par ligne : { id, events[], payoutMultiplier }  (zstd si zlib.zstdCompressSync existe, sinon .jsonl brut)
//   lookUpTable_<mode>_0.csv           n°,poids,payoutMultiplier   (3 entiers non signés, sans en-tête)
//
// =====================================================================================================================================
// FORMAT DE BOOK v2 (DÉFINITIF) — contrat entre js/math.js, le portage Python (stake-math/), js/rgs.js et js/replay.js
// =====================================================================================================================================
// RÈGLES GÉNÉRALES
//  - Un tour = un book = { id, events[], payoutMultiplier }. Le front REJOUE les événements dans l'ordre ; il ne tire rien et ne recalcule
//    JAMAIS le gain : le gain du round est payoutMultiplier (entier, échelle 100 : 100 = 1,00× la MISE DE BASE ; plafond 25 000× = 2 500 000).
//    Le front vérifie seulement la cohérence (somme des spinWin plafonnée == finalWin.amount == payoutMultiplier) ; en cas d'écart il
//    affiche une erreur et CRÉDITE le montant du RGS.
//  - Toutes les valeurs « de gain » des événements sont des ENTIERS à l'échelle 100 (win, runningTotal, token numérique, offering, gain,
//    finishBonus, mults, number, playerMult, amount, cost, maxWin, pay). Les FACTEURS (boost, tier, bandMult, tide, value d'une tablette,
//    jetons 'scepter' ×2) restent des nombres bruts (×N = N).
//  - Le coût d'un mode : roundStart.cost en entier ×100 (110 = ×1,1) ; index.json garde le multiple décimal (1.1) comme le SDK.
//    Le RGS débite mise × coût. Les 6 modes : std (1), plus (1,1 : Oracle+), buy_scarab (9,24), buy_weigh (10,31), buy_vault (12,37),
//    buy_fury (27,28). À l'achat il n'y a ni oracle ni wheelStop : roundStart.mode == 'buy' et un seul bonusStart (bought:true).
//
// CHOIX DU JOUEUR : RÈGLE D'OR = TOUTES LES VARIANTES SÉLECTIONNABLES D'UN BOOK PAIENT EXACTEMENT LE MÊME TOTAL (== payoutMultiplier).
//  Le book contient toutes les variantes ; le choix du joueur ne fait que SÉLECTIONNER celle qui est affichée (aucun appel réseau). Comme
//  les variantes ont le même total, le gain ne dépend jamais du choix et payoutMultiplier reste valable.
//  - Pesée du Cœur : weighReveal.variants[0] = « le joueur touche la plume », variants[1] = « le joueur touche le cœur ». Chaque variante
//    place les mêmes deux valeurs sur les plateaux et désigne le plus lourd de sorte que le plateau touché porte playerMult et gagne
//    ssi playerWins. Donc win identique pour les deux choix (la loi ne change pas : le joueur gagne 1 fois sur 2).
//  - Fureur d'Anubis : 3 variantes de couleur (color 0 = turquoise, 1 = or, 2 = rubis) de même loi ET de même résultat : la variante c est
//    la variante 0 où les cases DOUBLE sont remplacées par les cases équivalentes de la couleur c (même rôle, même palier, mêmes
//    nombres, mêmes bandes). Le total est donc identique. Les bandes (bonus imbriqués) sont répétées dans chaque variante
//    (champs `nested` + `color`).
//  - Profils Prudent / Équilibré / Audacieux : NON conservés (tables différentes) ; tous les bonus se jouent en profil Équilibré (std).
//  - Chambre du Trésor (coffres) : l'ordre est tiré d'avance ; le coffre touché est neutre (le k-ième coffre ouvert révèle vaultPick k).
//  - Sanctuaire des Marées : la k-ième tablette touchée révèle sanctuaryTablet k (tablettes indépendantes, ordre neutre).
//
// ÉVÉNEMENTS (dans l'ordre) — type et champs
//  roundStart   { v:2, mode:'std'|'plus'|'buy', cost, maxWin:2500000, cells:64 }       cells = taille de la roue (index.json donne layout[64])
//  pour chaque tour n = 1.. (une relance Ankh = un tour de plus) :
//   oracle        { spin, kind, boost, sealed:true }     bénédiction scellée AVANT l'arrêt : boost est dans le book mais le front l'affiche
//                                                          « ×? » jusqu'à l'arrêt de la roue (absent si pas d'Oracle ce tour, absent à l'achat)
//   wheelStop     { spin, index:0..63, kind, boost }     case atteinte (kind == layout[index]) ; boost = boost APPLIQUÉ (1 si l'Oracle a manqué)
//   oracleReveal  { spin, kind, boost, hit }             après l'arrêt : valeur révélée (hit = l'Oracle visait le type de la case atteinte)
//   bonusStart    { spin, kind, bonus, secret, upgraded, bought }
//                   kind = type nominal de la case (scarab|weigh|vault) ; bonus = bonus réellement joué : scarab|weigh|vault|hand (Fureur
//                   d'Anubis, upgraded:true) | crypt (Sanctuaire des Marées, secret:true) ; bought:true à l'achat
//     scarab    scarabDrop    { ball:1..3, path:[8 × 0|1], slot:0..8, win }                   gain du bonus = Σ win
//     weigh     weighReveal   { win, variants:[ { pick:0, mults:[plume,cœur], heavy:0|1, playerMult, playerWins, win },
//                                               { pick:1, mults:[plume,cœur], heavy:0|1, playerMult, playerWins, win } ] }
//                               win == (heavy == pick ? mults[pick] : 0) pour chaque variante, et identique dans les deux
//     vault     vaultPick     { pick:1.., token:int|'scepter'|'key'|'seal', chestsLeft, runningTotal }   (le sceau est le dernier pick)
//               vaultEnd      { ended:'seal'|'cleared', finishBonus, win }                    cleared : tous les coffres permis ouverts, +500
//     hand      pour chaque couleur c = 0,1,2 (dans cet ordre) :
//               furySpin      { color:c, spin:1.., segment:0..23, kind:'up'|'wrong'|'num'|'band', tier, final, number?, band?, bandMult? }
//                               up = DOUBLE de la couleur du joueur (tier ×2, on relance) ; wrong = DOUBLE d'une autre couleur (fin, plus
//                               petit nombre × tier) ; num = nombre (fin) ; band = bande de bonus (fin) : le bonus imbriqué suit
//               (événements du bonus imbriqué : mêmes types que ci-dessus, avec en plus nested:'scarab'|'weigh'|'vault' et color:c)
//               furyEnd       { color:c, win, pay }   win = gain plafonné (25 000×) ; pay = gain du dernier lancer avant plafond ;
//                               win identique pour les trois couleurs
//     crypt     sanctuaryTablet { tablet:1..9, tablet_type:'dust'|'tab'|'tide'|'eclipse', value, tideBefore, tide, offeringBefore, gain, offering }
//               sanctuaryEnd    { offering, tide, capped, win }   win = min(max(offering, 100), 2 500 000)
//   spinWin       { spin, win, respin }   win = gain du tour AVEC boost, avant plafond du round ; respin:true pour une relance Ankh (win 0)
//  finalWin     { amount, capped }       amount == payoutMultiplier ; capped:true si la somme des spinWin dépasse 25 000×
//
// VÉRIFICATION : verify(book) (exportée) recalcule tout depuis les règles de math.js, SANS utiliser le front, et rend la liste des écarts
// (vide = book valide). C'est l'oracle de test du portage Python (stake-math/) : mêmes règles, mêmes valeurs.
// =====================================================================================================================================
var fs = require('fs'), path = require('path'), zlib = require('zlib');
var M = require('../js/math.js');
var cap = require('./cap');
var OUT = path.join(__dirname, 'out');
var I = M.toInt, FORMAT = 2;
var DOUBLES = [0, 1, 2].map(function (c) { var l = []; M.HAND_SEGS.forEach(function (s, i) { if (s.d === c) l.push(i); }); return l; });

// la variante de couleur c d'un script de Fureur tiré pour la couleur 0 : mêmes rôles, cases DOUBLE de la couleur c (même total)
function furyVariant(spins, c) {
  return spins.map(function (s, k) {
    if (c === 0 || (s.kind !== 'up' && s.kind !== 'wrong')) return s;
    var seg = M.HAND_SEGS[s.idx], j = DOUBLES[seg.d].indexOf(s.idx);
    var col = s.kind === 'up' ? c : (c + seg.d) % 3;   // wrong : seg.d vaut 1 ou 2 (couleur relative à la couleur 0), donc jamais c
    return Object.assign({}, s, { idx: DOUBLES[col][(j + k + c) % 2] });
  });
}

function bonusEvents(kind, b) {
  var ev = [];
  if (kind === 'scarab') {
    b.balls.forEach(function (ba, k) { ev.push({ type: 'scarabDrop', ball: k + 1, path: ba.path, slot: ba.slot, win: I(ba.value) }); });
  } else if (kind === 'weigh') {
    var p = b.pick || 0, pm = b.mults[p], other = b.mults[1 - p], pw = b.heavy === p, win = I(M.weighGain(b, p)), vs = [];
    for (var q = 0; q < 2; q++) {   // la variante q place la valeur du joueur sur le plateau touché q
      var mu = q === p ? b.mults : (q === 0 ? [pm, other] : [other, pm]);
      vs.push({ pick: q, mults: mu.map(I), heavy: pw ? q : 1 - q, playerMult: I(pm), playerWins: pw, win: win });
    }
    ev.push({ type: 'weighReveal', win: win, variants: vs });
  } else if (kind === 'vault') {
    b.picks.forEach(function (pk, k) { ev.push({ type: 'vaultPick', pick: k + 1, token: typeof pk.token === 'number' ? I(pk.token) : pk.token, chestsLeft: pk.left, runningTotal: I(pk.total) }); });
    ev.push({ type: 'vaultEnd', ended: b.ended, finishBonus: I(b.bonusFinish), win: I(b.total) });
  } else if (kind === 'hand') {
    for (var c = 0; c < 3; c++) {
      furyVariant(b.spins, c).forEach(function (s, k) {
        var e = { type: 'furySpin', color: c, spin: k + 1, segment: s.idx, kind: s.kind, tier: s.mult, final: s.final };
        if (s.kind === 'num') e.number = I(s.base);
        if (s.kind === 'band') { e.band = s.band; e.bandMult = s.x; }
        ev.push(e);
        if (s.kind === 'band') bonusEvents(s.band, s.bonus).forEach(function (x) { x.nested = s.band; x.color = c; ev.push(x); });
      });
      ev.push({ type: 'furyEnd', color: c, win: I(b.total), pay: I(b.spins[b.spins.length - 1].pay) });
    }
  } else if (kind === 'crypt') {
    b.steps.forEach(function (st, k) { ev.push({ type: 'sanctuaryTablet', tablet: k + 1, tablet_type: st.t, value: st.v, tideBefore: st.tideBefore, tide: st.tide, offeringBefore: I(st.poolBefore), gain: I(st.gain), offering: I(st.pool) }); });
    ev.push({ type: 'sanctuaryEnd', offering: I(b.pool), tide: b.tide, capped: !!b.capped, win: I(b.total) });
  }
  return ev;
}

function bookEvents(round) {
  var ev = [{ type: 'roundStart', v: FORMAT, mode: round.mode, cost: I(round.cost), maxWin: I(M.MAX_WIN), cells: M.N }];
  round.spins.forEach(function (s, k) {
    var n = k + 1;
    if (s.oracle) ev.push({ type: 'oracle', spin: n, kind: s.oracle.kind, boost: s.oracle.boost, sealed: true });
    if (s.index >= 0) {
      ev.push({ type: 'wheelStop', spin: n, index: s.index, kind: s.kind, boost: s.boost });
      if (s.oracle) ev.push({ type: 'oracleReveal', spin: n, kind: s.oracle.kind, boost: s.oracle.boost, hit: s.oracle.kind === s.kind });
    }
    if (s.bonus) {
      var kind = s.secret ? 'crypt' : s.upgraded ? 'hand' : s.kind;
      ev.push({ type: 'bonusStart', spin: n, kind: s.kind, bonus: kind, secret: !!s.secret, upgraded: !!s.upgraded, bought: round.mode === 'buy' });
      bonusEvents(kind, s.bonus).forEach(function (e) { ev.push(e); });
    }
    ev.push({ type: 'spinWin', spin: n, win: I(s.pay), respin: s.kind === 'ankh' });
  });
  ev.push({ type: 'finalWin', amount: I(round.total), capped: !!round.capped });
  return ev;
}
function makeBook(id, round) { return { id: id, events: bookEvents(round), payoutMultiplier: I(round.total) }; }

/* ---------- vérification indépendante d'un book (aucun code du front) ---------- */
function verify(book) {
  var bad = [], ev = book.events || [], S = M.SCALE, CAP = M.MAX_WIN * S;
  function err(m) { bad.push(m); }
  var rs = ev[0];
  if (!rs || rs.type !== 'roundStart' || rs.v !== FORMAT) return ['roundStart v2 absent'];
  if (rs.cells !== M.N || rs.maxWin !== CAP) err('cells / maxWin');
  // total d'un bonus d'après ses événements (liste filtrée) ; null si inexploitable
  function totalOf(kind, list, color) {
    list = list.filter(function (e) { return color == null || e.color === color; });
    if (kind === 'scarab') {
      var t = 0, n = 0;
      list.forEach(function (e) {
        if (e.type !== 'scarabDrop') return;
        n++; t += e.win;
        var col = e.path.reduce(function (a, b) { return a + b; }, 0);
        if (e.path.length !== M.SCARAB_ROWS || col !== e.slot || I(M.SCARAB_VALUES[e.slot]) !== e.win) err('scarabDrop ' + e.ball);
      });
      if (n !== M.SCARAB_BALLS) err('nombre de scarabées');
      return t;
    }
    if (kind === 'weigh') {
      var w = list.filter(function (e) { return e.type === 'weighReveal'; })[0];
      if (!w || !w.variants || w.variants.length !== 2) { err('weighReveal'); return null; }
      w.variants.forEach(function (v, q) {
        var g = v.heavy === q ? v.mults[q] : 0;
        if (v.pick !== q || g !== w.win || v.win !== w.win || v.playerWins !== (v.heavy === q) || v.mults[q] !== v.playerMult) err('Pesée variante ' + q);
      });
      return w.win;
    }
    if (kind === 'vault') {
      var picks = list.filter(function (e) { return e.type === 'vaultPick'; }), ve = list.filter(function (e) { return e.type === 'vaultEnd'; })[0];
      var allowed = M.VAULT_BASE_PICKS, tot = 0, ended = 'cleared', i;
      for (i = 0; i < picks.length; i++) {
        var tk = picks[i].token;
        if (i >= allowed) { err('trop de coffres'); break; }
        if (tk === 'seal') { if (i < 2) err('sceau trop tôt'); ended = 'seal'; if (picks[i].runningTotal !== tot || i !== picks.length - 1) err('sceau'); break; }
        if (tk === 'key') allowed = Math.min(M.VAULT_PICK_CAP, allowed + M.VAULT_KEY_PICKS);
        else if (tk === 'scepter') tot *= 2;
        else tot += tk;
        if (picks[i].runningTotal !== tot || picks[i].chestsLeft !== allowed - i - 1) err('vaultPick ' + (i + 1));
      }
      if (ended === 'cleared' && picks.length !== allowed) err('chambre incomplète');
      var fin = ended === 'cleared' ? M.VAULT_FINISH * S : 0;
      if (!ve || ve.ended !== ended || ve.finishBonus !== fin || ve.win !== tot + fin) err('vaultEnd');
      return tot + fin;
    }
    if (kind === 'crypt') {
      var tabs = list.filter(function (e) { return e.type === 'sanctuaryTablet'; }), se = list.filter(function (e) { return e.type === 'sanctuaryEnd'; })[0];
      if (tabs.length !== M.CRYPT_CELLS || !se) { err('Sanctuaire incomplet'); return null; }
      var r = M.cryptReplay(tabs.map(function (e) { return { t: e.tablet_type, v: e.value }; }));
      tabs.forEach(function (e, k) { var st = r.steps[k]; if (e.tide !== st.tide || e.tideBefore !== st.tideBefore || e.offering !== I(st.pool) || e.offeringBefore !== I(st.poolBefore) || e.gain !== I(st.gain)) err('sanctuaryTablet ' + (k + 1)); });
      if (se.win !== I(r.total) || se.offering !== I(r.pool) || se.capped !== r.capped) err('sanctuaryEnd');
      return se.win;
    }
    if (kind === 'hand') {
      var wins = [];
      for (var c = 0; c < 3; c++) {
        var sps = list.filter(function (e) { return e.type === 'furySpin' && e.color === c; }), he = list.filter(function (e) { return e.type === 'furyEnd' && e.color === c; })[0];
        var tier = 1, lvl = 0, pay = null;
        sps.forEach(function (e, k) {
          var seg = M.HAND_SEGS[e.segment], last = k === sps.length - 1;
          if (!seg || e.spin !== k + 1) { err('furySpin ' + c + '/' + (k + 1)); return; }
          if (seg.d === c && lvl < M.HAND_MAX_CHAIN) {
            lvl++; tier *= 2;
            if (e.kind !== 'up' || e.tier !== tier || e.final) err('Fureur ' + c + ' up ' + (k + 1));
            return;
          }
          if (!last || !e.final || e.tier !== tier) err('Fureur ' + c + ' fin ' + (k + 1));
          if (seg.d != null) { if (e.kind !== 'wrong') err('Fureur wrong'); pay = I(M.HAND_MIN_N) * tier; }
          else if (seg.b) {
            if (e.kind !== 'band' || e.band !== seg.b || e.bandMult !== seg.x) err('Fureur bande');
            var nb = totalOf(seg.b, list.filter(function (x) { return x.nested === seg.b; }), c);
            pay = nb == null ? null : nb * seg.x * tier;
          } else { if (e.kind !== 'num' || e.number !== I(seg.n)) err('Fureur nombre'); pay = I(seg.n) * tier; }
        });
        if (pay == null || !he) { err('Fureur ' + c + ' incomplète'); continue; }
        if (he.pay !== pay || he.win !== Math.min(pay, CAP)) err('furyEnd ' + c);
        wins.push(he.win);
      }
      if (wins.length !== 3 || wins[0] !== wins[1] || wins[1] !== wins[2]) err('les trois couleurs ne paient pas pareil');
      return wins[0];
    }
    return null;
  }
  // tours
  var sum = 0, i = 1, spin = 0, fin = null;
  while (i < ev.length) {
    if (ev[i].type === 'finalWin') { fin = ev[i]; break; }
    var wheel = null, bs = null, body = [], boost = 1, kind = null;
    spin++;
    while (i < ev.length && ev[i].type !== 'spinWin' && ev[i].type !== 'finalWin') {
      var x = ev[i++];
      if (x.type === 'wheelStop') { wheel = x; boost = x.boost; kind = x.kind; if (M.LAYOUT[x.index] !== x.kind) err('wheelStop ' + spin); }
      else if (x.type === 'bonusStart') { bs = x; if (!wheel) kind = x.kind; }
      else if (bs && x.type !== 'oracle' && x.type !== 'oracleReveal') body.push(x);
      if (x.spin != null && x.type !== 'furySpin' && x.spin !== spin) err('numéro de tour ' + x.type);
    }
    var sw = ev[i++];
    if (!sw || sw.type !== 'spinWin' || sw.spin !== spin) { err('spinWin ' + spin); break; }
    var base;
    if (bs) {
      base = totalOf(bs.bonus, body);
      if (base == null) base = 0;
      if ((bs.bonus === 'crypt') !== !!bs.secret || (bs.bonus === 'hand') !== !!bs.upgraded) err('bonusStart flags');
    } else base = I(M.KINDS[kind].mult);
    if (sw.win !== base * boost) err('spinWin ' + spin + ' (' + sw.win + ' ≠ ' + base * boost + ')');
    if (sw.respin !== (kind === 'ankh')) err('respin ' + spin);
    sum += sw.win;
  }
  if (!fin) { err('finalWin absent'); return bad; }
  var total = Math.min(sum, CAP);
  if (fin.amount !== total || fin.capped !== (sum > CAP) || book.payoutMultiplier !== total) err('total ' + total + ' ≠ finalWin ' + fin.amount + ' / book ' + book.payoutMultiplier);
  return bad;
}

module.exports = { bookEvents: bookEvents, makeBook: makeBook, verify: verify, FORMAT: FORMAT };   // utilisé par tools/mock-rgs.js ; les fichiers ne sont écrits qu'en exécution directe
if (require.main !== module) return;

var N = Math.floor(cap(parseInt(process.argv[2] || '1000', 10)) / 6);   // 1000 books au total au plus (règle : jamais plus de 1000 tours simulés)
var seed = parseInt(process.argv[3] || '2026', 10);
var MODES = [
  { name: 'std', cost: M.MODES.std.cost, play: function (r) { return M.playRound(r, 'std'); } },
  { name: 'plus', cost: M.MODES.plus.cost, play: function (r) { return M.playRound(r, 'plus'); } }
];
[['scarab', 'scarab'], ['weigh', 'weigh'], ['vault', 'vault'], ['fury', 'hand']].forEach(function (p) {
  MODES.push({ name: 'buy_' + p[0], cost: M.BUY[p[1]].price, buy: true, play: function (r) { return M.playBuy(r, p[1]); } });
});

fs.mkdirSync(OUT, { recursive: true });
var canZstd = typeof zlib.zstdCompressSync === 'function', index = { format: FORMAT, wheel: { cells: M.N, layout: M.LAYOUT }, maxWin: I(M.MAX_WIN), modes: [] }, report = [];
MODES.forEach(function (m, mi) {
  var rng = M.mulberry32(seed + mi), lines = [], csv = [], sumPay = 0, bad = 0;
  for (var i = 0; i < N; i++) {
    var round = m.play(rng), book = makeBook(i + 1, round);
    if (!M.isExact(round.total) || book.payoutMultiplier < 0 || book.payoutMultiplier > M.MAX_WIN * M.SCALE || verify(book).length) bad++;
    lines.push(JSON.stringify(book)); csv.push((i + 1) + ',1,' + book.payoutMultiplier); sumPay += book.payoutMultiplier;
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
