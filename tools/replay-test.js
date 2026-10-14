// node tools/replay-test.js — teste le mode replay contre un mini RGS local (jamais plus de 400 tirages pour fabriquer les livres).
// Vérifie : GET /bet/replay/{game}/{version}/{mode}/{event} appelé, AUCUN appel /wallet, bouton Lecture, résultat laissé à l'écran,
// bouton Rejouer, mise / coût réel affichés (devise + langue), erreurs de chargement, 400×225 sans défilement, textes sociaux.
// Variables : PLAYWRIGHT_CORE, CHROMIUM, SHOTS (dossier de captures, facultatif), REPLAY_PLAY=0 pour ne pas jouer les tours en entier.
var http = require('http'), fs = require('fs'), path = require('path');
var pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core'), root = path.join(__dirname, '..');
var M = require('../js/math.js'), cap = require('./cap.js');
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png' };
var wallet = [], replays = [];

// livres de test : on cherche (≤ 400 tours) un tour perdant, un tour gagnant avec Oracle, un bonus (roue) et on fabrique les achats
var rng = M.mulberry32(20260414), books = {}, n = 0;
while (n < cap(400) && !(books.loss && books.win && books.bonus)) {
  n++;
  var r = M.playRound(rng, 'plus'), k = r.spins[r.spins.length - 1].kind;
  if (!books.loss && r.total === 0) books.loss = r;
  else if (!books.win && r.total >= 1 && r.total < 10 && !M.KINDS[k].bonus) books.win = r;
  else if (!books.bonus && M.KINDS[k].bonus && r.total > 0) books.bonus = r;
}
books.buyHand = M.playBuy(rng, 'hand'); books.buyScarab = M.playBuy(rng, 'scarab');
var CASES = {
  loss: { mode: 'plus', cost: 1.1, round: books.loss },
  win: { mode: 'plus', cost: 1.1, round: books.win },
  bonus: { mode: 'plus', cost: 1.1, round: books.bonus },
  buyHand: { mode: 'buy_hand', cost: 27.28, round: books.buyHand },
  buyScarab: { mode: 'buy_scarab', cost: 9.24, round: books.buyScarab }
};
var server = http.createServer(function (req, res) {
  var u = decodeURIComponent(req.url.split('?')[0]);
  var H = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' };
  if (req.method === 'OPTIONS') { res.writeHead(204, H); return res.end(); }
  if (/^\/wallet\//.test(u)) { wallet.push(u); res.writeHead(400, H); return res.end('{"error":"ERR_VAL"}'); }
  var m = u.match(/^\/bet\/replay\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)$/);
  if (m) {
    replays.push(u);
    var c = CASES[m[4]];
    H['Content-Type'] = 'application/json';
    if (!c) { res.writeHead(404, H); return res.end('{"error":"ERR_VAL","message":"event not found"}'); }
    res.writeHead(200, H); return res.end(JSON.stringify({ payoutMultiplier: c.round.total, costMultiplier: c.cost, state: [{ index: 0, type: 'setBook' }, c.round] }));
  }
  var f = path.join(root, u.replace(/^\/$/, '/index.html'));
  if (f.indexOf(root) !== 0 || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
var fails = 0;
function check(ok, what) { if (!ok) { fails++; console.log('ÉCHEC  ' + what); } else console.log('ok     ' + what); }
async function open(b, o) {
  var p = await b.newPage({ viewport: { width: o.w || 1024, height: o.h || 576 } }), errs = [];
  p.on('pageerror', function (e) { errs.push(e.message); }); p.errs = errs;
  var port = server.address().port, rgs = o.rgs || ('http://localhost:' + port);
  var qs = 'replay=true&game=anubis&version=1&mode=' + (CASES[o.ev] ? CASES[o.ev].mode : 'x') + '&event=' + o.ev + '&rgs_url=' + rgs + (o.q || '');
  await p.goto('http://localhost:' + port + '/index.html?' + qs); return p;
}
async function playIt(p, label, expectText) {
  await p.waitForFunction(function () { return Replay.state() === 'ready'; }, null, { timeout: 15000 });
  var vis = await p.evaluate(function () {
    var vis = function (id) { var e = document.getElementById(id); return !!(e && e.offsetParent !== null && getComputedStyle(e).visibility !== 'hidden'); };
    return { spin: vis('spin'), buy: vis('btnBuy'), auto: vis('btnAuto'), bet: vis('betUp'), go: vis('rpGo'), info: vis('btnInfo') };
  });
  check(vis.go && !vis.spin && !vis.buy && !vis.auto && !vis.bet && !vis.info, label + ' : Lecture visible, aucun contrôle de jeu');
  if (process.env.REPLAY_PLAY === '0') return;
  await p.click('#rpGo');
  await p.waitForFunction(function () { return Replay.state() === 'done'; }, null, { timeout: 240000 });
  var res = await p.evaluate(function () { return document.getElementById('rpResV').textContent; });
  check(expectText ? res.indexOf(expectText) >= 0 || (expectText === '0' && /pas de gain|no win/i.test(res)) : true, label + ' : résultat laissé à l\'écran (« ' + res + ' »)');
  var again = await p.evaluate(function () { var g = document.getElementById('rpGo'); return !g.disabled && g.offsetParent !== null ? g.textContent : ''; });
  check(!!again, label + ' : bouton « ' + again + ' »');
  if (process.env.SHOTS) await p.screenshot({ path: path.join(process.env.SHOTS, 'replay-' + label.replace(/\W+/g, '_') + '.png') });
}
(async function () {
  await new Promise(function (r) { server.listen(0, r); });
  var b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--no-sandbox', '--use-gl=swiftshader'] });
  var p, txt, G_ = function (r) { return r.payout; };

  // 1. mise + coût réel, devise, langue (sans jouer)
  p = await open(b, { ev: 'buyScarab', q: '&currency=EUR&lang=fr&amount=1000000' });
  await p.waitForFunction(function () { return Replay.state() === 'ready'; }, null, { timeout: 15000 });
  txt = await p.evaluate(function () { return document.getElementById('rpBet').textContent + ' | ' + document.getElementById('rpSub').textContent; });
  check(/BONUS : 1,00\s€ · COÛT RÉEL : 9,24\s€/.test(txt), 'mise et coût réel (FR, EUR) : ' + txt);
  await p.close();
  p = await open(b, { ev: 'loss', q: '&currency=USD&lang=en&amount=5000000' });
  await p.waitForFunction(function () { return Replay.state() === 'ready'; }, null, { timeout: 15000 });
  txt = await p.evaluate(function () { return document.getElementById('rpBet').textContent; });
  check(/ORACLE\+ : \$5\.00 · REAL COST : \$5\.50/.test(txt), 'mise et coût réel (EN, USD, ×1,1) : ' + txt);
  await p.close();
  p = await open(b, { ev: 'loss', q: '&amount=abc&lang=zz' });   // valeurs invalides : ne casse pas, retombe sur 1,00 et l'anglais
  await p.waitForFunction(function () { return Replay.state() === 'ready'; }, null, { timeout: 15000 });
  txt = await p.evaluate(function () { return document.getElementById('rpBet').textContent + ' ' + document.documentElement.lang; });
  check(/1\.00/.test(txt) && / en$/.test(txt), 'paramètres invalides : ' + txt);
  await p.close();

  // 2. erreurs de chargement : événement inconnu, hôte injoignable, hôte nu (sans https://) ; jamais d'appel wallet
  p = await open(b, { ev: 'nope' });
  await p.waitForFunction(function () { return Replay.state() === 'error'; }, null, { timeout: 15000 });
  txt = await p.evaluate(function () { return document.getElementById('rpMsg').textContent; });
  check(/404/.test(txt) && !p.errs.length, 'événement inconnu → message : ' + txt); await p.close();
  p = await open(b, { ev: 'loss', rgs: 'localhost:1' });
  await p.waitForFunction(function () { return Replay.state() === 'error'; }, null, { timeout: 20000 });
  check(true, 'hôte injoignable → message : ' + await p.evaluate(function () { return document.getElementById('rpMsg').textContent; })); await p.close();

  // 3. jeu complet à 1024×576 : perte, gain, bonus (roue), achat de la Fureur ; puis « Rejouer »
  if (process.env.REPLAY_PLAY !== '0') {
    var plan = [['loss', 0, '0'], ['win', 0, null], ['bonus', 0, null]];
    for (var i = 0; i < plan.length; i++) {
      var c = CASES[plan[i][0]];
      p = await open(b, { ev: plan[i][0], q: '&currency=EUR&lang=fr&amount=2000000' });
      var want = c.round.total > 0 ? String(c.round.total * 2).replace('.', ',') : '0';
      await playIt(p, 'replay ' + plan[i][0] + ' (' + c.round.total + '×)', c.round.total > 0 ? null : '0');
      var shown = await p.evaluate(function () { return document.getElementById('rpResV').textContent; });
      var exp = (Math.round(c.round.total * 2 * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (c.round.total > 0) check(shown.replace(/[\s  ]/g, '').indexOf(exp.replace(/[\s  ]/g, '')) === 0, 'montant du résultat = payoutMultiplier × mise (' + shown + ' ≈ ' + exp + ')');
      await p.click('#rpGo');   // « Rejouer »
      await p.waitForFunction(function () { return Replay.state() === 'playing'; }, null, { timeout: 5000 });
      check(true, 'Rejouer relance le même événement');
      check(!p.errs.length, 'aucune erreur JS (' + p.errs.join(' | ') + ')');
      await p.close();
    }
    p = await open(b, { ev: 'buyHand', q: '&currency=USD&lang=en&amount=1000000&social=false' });
    await playIt(p, 'replay achat Fureur', null); check(!p.errs.length, 'aucune erreur JS (' + p.errs.join(' | ') + ')'); await p.close();
  }

  // 4. popout S 400×225, 800×450, mobile 425×812 : charge, rien ne défile, rien ne déborde
  var sizes = [[400, 225], [800, 450], [425, 812], [1024, 576]];
  for (var s = 0; s < sizes.length; s++) {
    p = await open(b, { ev: 'buyScarab', w: sizes[s][0], h: sizes[s][1], q: '&currency=EUR&lang=fr&amount=100000000&device=' + (sizes[s][1] > 600 ? 'mobile' : 'desktop') });
    await p.waitForFunction(function () { return Replay.state() === 'ready'; }, null, { timeout: 15000 });
    var m = await p.evaluate(function () {
      var d = document.documentElement, o = [];
      ['rpInfo', 'rpGo', 'rpRes'].forEach(function (id) { var e = document.getElementById(id), r = e.getBoundingClientRect(); if (r.left < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1) o.push(id + ' hors écran'); });
      var bet = document.getElementById('rpBet'), pl = document.getElementById('rpInfo');
      if (bet.scrollWidth > pl.clientWidth + 1) o.push('texte de mise trop large');
      return { scroll: d.scrollHeight > innerHeight || d.scrollWidth > innerWidth, out: o, t: bet.textContent };
    });
    check(!m.scroll && !m.out.length, 'replay ' + sizes[s].join('×') + ' : ' + (m.out.join(', ') || 'tient à l\'écran') + ' · ' + m.t);
    if (process.env.SHOTS) await p.screenshot({ path: path.join(process.env.SHOTS, 'replay-' + sizes[s].join('x') + '.png') });
    if (sizes[s][0] === 400 && process.env.REPLAY_PLAY !== '0') {   // lecture à 400×225 : la fin du tour est atteinte
      await p.click('#rpGo'); await p.waitForFunction(function () { return Replay.state() === 'done'; }, null, { timeout: 240000 });
      check(!p.errs.length, 'replay 400×225 joué jusqu\'au bout');
      if (process.env.SHOTS) await p.screenshot({ path: path.join(process.env.SHOTS, 'replay-400x225-fin.png') });
    }
    await p.close();
  }

  // 5. mode social : aucun mot interdit dans les textes du replay
  p = await open(b, { ev: 'buyScarab', q: '&currency=EUR&lang=en&amount=1000000&social=true' });
  await p.waitForFunction(function () { return Replay.state() === 'ready'; }, null, { timeout: 15000 });
  txt = await p.evaluate(function () { return ['rpBadge', 'rpBet', 'rpSub', 'rpGo', 'rpResL'].map(function (i) { return document.getElementById(i).textContent; }).join(' | '); });
  var bad = txt.match(/\b(bet|bets|betting|buy|bought|pay|pays|paid|paytable|stake|wager|cash|money|gamble|deposit|credit|purchase|rebet)\b/ig);
  check(!bad, 'replay social sans mot interdit : ' + txt + (bad ? ' → ' + bad.join(',') : ''));
  await p.close();
  p = await open(b, { ev: 'loss', q: '&lang=en&social=true' });
  await p.waitForFunction(function () { return Replay.state() === 'ready'; }, null, { timeout: 15000 });
  txt = await p.evaluate(function () { return document.getElementById('rpBet').textContent; });
  check(!/\bbet\b/i.test(txt), 'libellé social de la mise : ' + txt); await p.close();

  check(wallet.length === 0, 'aucun appel /wallet (' + wallet.length + ')');
  check(replays.length > 0, replays.length + ' appel(s) GET /bet/replay/…');
  await b.close(); server.close();
  console.log(fails ? '\n' + fails + ' échec(s)' : '\nreplay : tout passe'); process.exit(fails ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(2); });
