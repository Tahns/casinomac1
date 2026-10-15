// node tools/mock-rgs.js [port=8787] — faux RGS local (CORS ouvert) pour tester le client js/rgs.js. NE PAS utiliser en production.
// Routes : POST /wallet/authenticate | /wallet/balance | /wallet/play | /wallet/end-round | /bet/event, GET /bet/replay/:jeu/:version/:mode/:event.
// Les books (FORMAT v2, voir l'en-tête de tools/stake-export.js) viennent de AnubisMath : 100 books par mode, 6 modes = 600 books au total (jamais plus de 1000).
// Réglage en cours de test (module) : mock.set({ balance, betLevels, defaultBetLevel, active, next, social, currency }) ; next = 'win' | 'zero' | null ;
// mock.queueBook(mode, book) : le prochain /wallet/play de ce mode rend ce book (book = { id, events, payoutMultiplier }, ex. tools/stake-export.makeBook) ;
// mock.set({ fail: { '/wallet/authenticate': 'ERR_IS' } }) : cette route répond ce code d'erreur (400) tant que fail la contient.
var http = require('http');
var M = require('../js/math.js');
var cap = require('./cap');
var exp = require('./stake-export');

// ANUBIS_POOL=n : n books par mode (au lieu de 100), pool PARTAGÉ par toutes les instances du processus (un seul tirage de 6 × n books, quel que soit le nombre de create())
var PER_MODE = process.env.ANUBIS_POOL ? Math.max(1, Math.min(cap(100), parseInt(process.env.ANUBIS_POOL, 10) || 1)) : cap(100), MICRO = 1000000;
var SHARED = process.env.ANUBIS_POOL ? {} : null;
var DRAWS = 0, ROUNDS = 0;   // books tirés dans ce processus (pour le budget de tirages des tests)
var MODES = [
  { name: 'std', cost: M.MODES.std.cost, play: function (r) { return M.playRound(r, 'std'); } },
  { name: 'plus', cost: M.MODES.plus.cost, play: function (r) { return M.playRound(r, 'plus'); } }
];
[['scarab', 'scarab'], ['weigh', 'weigh'], ['vault', 'vault'], ['fury', 'hand']].forEach(function (p) {
  MODES.push({ name: 'bonus_' + p[0], cost: M.BUY[p[1]].price, play: function (r) { return M.playBuy(r, p[1]); } });
});

function makePool(seed) {
  var pool = {};
  MODES.forEach(function (m, mi) {
    var rng = M.mulberry32(seed + mi), list = [];
    for (var i = 0; i < PER_MODE; i++) {
      var round = m.play(rng);
      list.push({ id: i + 1, events: exp.bookEvents(round), payoutMultiplier: M.toInt(round.total) });
    }
    pool[m.name] = list; DRAWS += list.length;
  });
  return pool;
}

function create(opts) {
  opts = opts || {};
  var pool = SHARED ? (SHARED.p = SHARED.p || makePool(opts.seed || 2026)) : makePool(opts.seed || 2026), pickRng = M.mulberry32((opts.seed || 2026) + 99);
  var st = {
    sessionID: opts.sessionID || 'test-session',
    balance: opts.balance != null ? opts.balance : 1000 * MICRO,
    currency: opts.currency || 'USD',
    betLevels: opts.betLevels || [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].map(function (x) { return Math.round(x * MICRO); }),
    defaultBetLevel: opts.defaultBetLevel || 1 * MICRO,
    active: opts.active || null,      // round ouvert (non encaissé)
    social: !!opts.social, fail: {}, queue: [],
    next: null,                       // 'win' | 'zero' | null (tirage libre)
    log: [], nBets: 0
  };
  function config() {
    var l = st.betLevels;
    return { minBet: l[0], maxBet: l[l.length - 1], stepBet: l.length > 1 ? l[1] - l[0] : l[0], defaultBetLevel: st.defaultBetLevel, betLevels: l, jurisdiction: { socialCasino: !!st.social } };
  }
  function bal() { return { amount: st.balance, currency: st.currency }; }
  function pickBook(mode) {
    for (var q = 0; q < st.queue.length; q++) if (st.queue[q].mode === mode) return st.queue.splice(q, 1)[0].book;
    var list = pool[mode];
    if (st.next) { var want = st.next === 'win'; var f = list.filter(function (b) { return (b.payoutMultiplier > 0) === want; }); if (f.length) { st.next = null; return f[Math.floor(pickRng() * f.length)]; } }
    return list[Math.floor(pickRng() * list.length)];
  }
  function roundJson(r) { return { betID: r.betID, amount: r.amount, payout: r.payout, payoutMultiplier: r.payoutMultiplier, active: r.active, mode: r.mode, state: r.state }; }
  function err(res, status, code, message) { send(res, status, { error: code, message: message || code }); }
  function send(res, status, obj) {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' });
    res.end(JSON.stringify(obj));
  }
  var server = http.createServer(function (req, res) {
    if (req.method === 'OPTIONS') return send(res, 204, {});
    var url = req.url.split('?')[0], chunks = [];
    req.on('data', function (c) { chunks.push(c); });
    req.on('end', function () {
      var body = {}; try { body = JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch (e) {}
      st.log.push({ method: req.method, path: url, body: body });
      var m = url.match(/^\/bet\/replay\/([^/]+)\/([^/]+)\/([^/]+)\/(\d+)$/);
      if (req.method === 'GET' && m) {
        var mode = MODES.filter(function (x) { return x.name === m[3]; })[0], book = mode && pool[mode.name][parseInt(m[4], 10) - 1];
        if (!book) return err(res, 400, 'ERR_VAL', 'book inconnu');
        return send(res, 200, { payoutMultiplier: book.payoutMultiplier / M.SCALE, costMultiplier: mode.cost, state: book.events });
      }
      if (req.method !== 'POST') return err(res, 405, 'ERR_VAL', 'méthode');
      if (st.fail[url]) return err(res, 400, st.fail[url], st.fail[url]);
      if (body.sessionID !== st.sessionID) return err(res, 400, 'ERR_VAL', 'session inconnue');
      if (url === '/wallet/authenticate') {
        var out = { balance: bal(), config: config() };
        if (st.active) out.round = roundJson(st.active);
        return send(res, 200, out);
      }
      if (url === '/wallet/balance') return send(res, 200, { balance: bal() });
      if (url === '/bet/event') { st.nBets++; return send(res, 200, { ok: true }); }
      if (url === '/wallet/play') {
        var md = MODES.filter(function (x) { return x.name === body.mode; })[0];
        if (!md || !(body.amount > 0) || st.betLevels.indexOf(body.amount) < 0) return err(res, 400, 'ERR_VAL', 'mise ou mode invalide');
        if (st.gle) return err(res, 400, 'ERR_GLE', 'limite de jeu atteinte');   // st.gle = true : plafond de jeu du serveur
        if (st.active) return err(res, 400, 'ERR_VAL', 'un round est déjà ouvert');
        var cost = Math.round(body.amount * md.cost);
        if (st.balance < cost) return err(res, 400, 'ERR_IPB', 'solde insuffisant');
        st.balance -= cost;
        ROUNDS++;
        var bk = pickBook(md.name), pm = bk.payoutMultiplier / M.SCALE;
        var r = { betID: Date.now() + '-' + bk.id, amount: body.amount, payout: Math.round(body.amount * pm), payoutMultiplier: pm, active: pm > 0, mode: md.name, state: bk.events };
        if (r.active) st.active = r;   // un round gagnant reste ouvert jusqu'à /wallet/end-round ; un 0x est clos par le RGS
        return send(res, 200, { balance: bal(), round: roundJson(r) });
      }
      if (url === '/wallet/end-round') {
        if (!st.active) return err(res, 400, 'ERR_VAL', 'aucun round ouvert');
        st.balance += st.active.payout; st.active = null;
        return send(res, 200, { balance: bal() });
      }
      return err(res, 404, 'ERR_VAL', 'route inconnue');
    });
  });
  return {
    state: st, server: server, pool: pool,
    set: function (o) { Object.keys(o).forEach(function (k) { st[k] = o[k]; }); },
    queueBook: function (mode, book) { st.queue.push({ mode: mode, book: book }); },
    // un round gagnant ouvert, pris dans le mode demandé (pour tester la reprise)
    openWinning: function (mode, amount) {
      var bk = pool[mode || 'std'].filter(function (b) { return b.payoutMultiplier > 0; })[0], pm = bk.payoutMultiplier / M.SCALE;
      st.active = { betID: 'resume-' + bk.id, amount: amount, payout: Math.round(amount * pm), payoutMultiplier: pm, active: true, mode: mode || 'std', state: bk.events };
      return st.active;
    },
    listen: function (port) { return new Promise(function (ok) { server.listen(port || 0, function () { ok(server.address().port); }); }); },
    close: function () { server.close(); },
    count: function (path) { return st.log.filter(function (l) { return l.path === path; }).length; }
  };
}

module.exports = { create: create, draws: function () { return DRAWS; }, rounds: function () { return ROUNDS; } };
if (require.main === module) {
  var mock = create();
  mock.listen(parseInt(process.argv[2] || '8787', 10)).then(function (p) {
    console.log('Faux RGS sur http://localhost:' + p + '  (session « ' + mock.state.sessionID + ' », ' + MODES.length * PER_MODE + ' books)');
    console.log('Jeu : index.html?sessionID=' + mock.state.sessionID + '&rgs_url=http://localhost:' + p);
  });
}
