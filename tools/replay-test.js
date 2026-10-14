// node tools/replay-test.js — teste le mode replay contre un mini RGS local (jamais plus de 400 tirages pour fabriquer les books).
// Les books sont au FORMAT v2 (en-tête de tools/stake-export.js) : state = liste d'événements, lue par RGS.bookToRound (comme le jeu).
// Cas fabriqués en plus : Fureur → bande Pesée (choix de la couleur et plume / cœur joués par le spectateur), Sanctuaire des Marées avec Oracle scellé
// (« ×? » puis valeur révélée), gain max 25 000×, écart payoutMultiplier / événements (message d'erreur, montant du RGS affiché), format inconnu.
// Vérifie : GET /bet/replay/{game}/{version}/{mode}/{event} appelé, AUCUN appel /wallet, bouton Lecture, résultat laissé à l'écran,
// bouton Rejouer, mise / coût réel affichés (devise + langue), erreurs de chargement, 400×225 sans défilement, textes sociaux.
// Variables : PLAYWRIGHT_CORE, CHROMIUM, SHOTS (dossier de captures, facultatif), REPLAY_PLAY=0 pour ne pas jouer les tours en entier.
var http = require('http'), fs = require('fs'), path = require('path');
var pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core'), root = path.join(__dirname, '..');
var M = require('../js/math.js'), cap = require('./cap.js'), E = require('./stake-export.js');
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
function sp0(kind, o) { return Object.assign({ oracle: null, index: -1, kind: kind, boost: 1, bonus: null, base: 0, pay: 0 }, o); }
function roundOf(spin, mode, cost) { return { spins: [spin], total: Math.min(spin.pay, M.MAX_WIN), capped: spin.pay > M.MAX_WIN, cost: cost, mode: mode }; }
// Fureur → bande « Pesée ×6 » gagnante (case 12)
var hr = M.mulberry32(4242), hd = null, tt = 0;
while (tt++ < 400) { hd = M._bonus.hand(hr, 0, [12]); if (hd.total > 0) break; }
books.fury = roundOf(sp0('hand', { bonus: hd, upgraded: true, base: hd.total, pay: hd.total, profile: 'turq' }), 'buy', M.BUY.hand.price);
// Sanctuaire des Marées + Oracle ×5 sur le Trésor
var vi = M.LAYOUT.indexOf('vault'), cb = M._bonus.crypt(M.mulberry32(7), [{ t: 'tab', v: 5 }, { t: 'tide', v: 3 }, { t: 'tab', v: 10 }, { t: 'eclipse', v: 2 }, { t: 'tab', v: 2 }]);
books.sanct = roundOf(sp0('vault', { oracle: { kind: 'vault', boost: 5 }, index: vi, boost: 5, bonus: cb, secret: true, profile: 'crypt', base: cb.total, pay: cb.total * 5 }), 'std', 1);
// gain max : offrande 3 000 000× plafonnée à 25 000×
var xb = M._bonus.crypt(M.mulberry32(8), [{ t: 'tide', v: 10 }, { t: 'tide', v: 10 }, { t: 'tide', v: 10 }, { t: 'tide', v: 10 }, { t: 'tab', v: 300 }]);
books.max = roundOf(sp0('vault', { index: vi, bonus: xb, secret: true, profile: 'crypt', base: xb.total, pay: xb.total }), 'std', 1);
var CASES = {
  fury: { mode: 'buy_fury', cost: 27.28, round: books.fury },
  sanct: { mode: 'std', cost: 1, round: books.sanct },
  max: { mode: 'std', cost: 1, round: books.max },
  mismatch: { mode: 'plus', cost: 1.1, round: books.win, tamper: 5 },
  v1: { mode: 'std', cost: 1, round: books.win, raw: [{ index: 0, type: 'setBook' }, { spins: [] }] },
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
    res.writeHead(200, H); return res.end(JSON.stringify({ payoutMultiplier: c.round.total + (c.tamper || 0), costMultiplier: c.cost, state: c.raw || E.bookEvents(c.round) }));
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

  p = await open(b, { ev: 'mismatch', q: '&lang=fr' });
  await p.waitForFunction(function () { return Replay.state() === 'ready'; }, null, { timeout: 15000 });
  txt = await p.evaluate(function () { return { m: document.getElementById('rpMsg').textContent, e: I18N.block('replay').errSum, c: document.getElementById('rpMsg').className, hid: document.getElementById('rpMsg').hidden }; });
  check(!txt.hid && txt.m === txt.e && txt.c === 'err' && txt.m.length > 20, 'écart payoutMultiplier / événements : message d\'erreur (« ' + txt.m.slice(0, 50) + '… ») et replay jouable'); await p.close();
  p = await open(b, { ev: 'v1', q: '&lang=en' });
  await p.waitForFunction(function () { return Replay.state() === 'error'; }, null, { timeout: 15000 });
  check(/unknown format/i.test(await p.evaluate(function () { return document.getElementById('rpMsg').textContent; })), 'state qui n\'est pas un book v2 : message « format inconnu »'); await p.close();

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

  // 3b. choix réels dans le replay (Fureur → Pesée), Oracle scellé révélé, Sanctuaire, gain max 25 000× : le temps du jeu est avancé à la main
  async function driveReplay(p, o) {
    o = o || {};
    var seen = { titles: {}, oracle: [] }, g = 0, T = await p.evaluate(function () { return { c: I18N.t().handColorTitle, w: I18N.t().weighIntro }; });
    await p.click('#rpGo');
    await p.waitForFunction(function () { return Replay.state() === 'playing'; }, null, { timeout: 5000 });
    while (g < 9000) {
      var st = await p.evaluate(function () { return (async function () { await G.advance(0.25); if (G.winOv) G.skipWinOv(); var oc = document.getElementById('oracle'); return { state: Replay.state(), title: G.scene && G.scene.title || '', oracle: oc && !oc.hidden ? document.getElementById('oracleText').textContent : '' }; })(); });
      g++;
      if (st.oracle && seen.oracle[seen.oracle.length - 1] !== st.oracle) seen.oracle.push(st.oracle);
      if (st.title) seen.titles[st.title] = (seen.titles[st.title] || 0) + 1;
      if (st.title === T.c && o.color != null) await p.keyboard.press('Digit' + (o.color + 1));
      if (st.title === T.w && o.pick != null) await p.keyboard.press('Digit' + (o.pick + 1));
      if (st.state === 'done') break;
      if (g % 8 === 0) await p.waitForTimeout(4);
    }
    seen.T = T; seen.done = g < 9000; return seen;
  }
  if (process.env.REPLAY_PLAY !== '0') {
    var fb = E.makeBook(1, books.fury), fwev = fb.events.filter(function (e) { return e.type === 'weighReveal' && e.color === 2; })[0];
    check(E.verify(fb).length === 0, 'book Fureur → Pesée ×6 valide (' + fb.payoutMultiplier / 100 + '×)');
    p = await open(b, { ev: 'fury', q: '&currency=EUR&lang=fr&amount=1000000' });
    await p.waitForFunction(function () { return Replay.state() === 'ready'; }, null, { timeout: 15000 });
    await p.evaluate(function () { var o = G.runBonus; G.__sps = []; G.runBonus = function (sp, bt) { G.__sps.push(sp); return o.call(G, sp, bt); }; });
    var d1 = await driveReplay(p, { color: 2, pick: 0 });   // couleur n°3 (rubis), plume
    var v1 = await p.evaluate(function () { var sp = G.__sps[0], bb = sp.bonus, nb = bb.spins.filter(function (x) { return x.kind === 'band'; })[0]; return { profile: sp.profile, first: bb.spins[0].idx, pick: nb.bonus.pick, mine: nb.bonus.mults[nb.bonus.pick], total: nb.bonus.total, res: document.getElementById('rpResV').textContent }; });
    var f1 = fb.events.filter(function (e) { return e.type === 'furySpin' && e.color === 2 && e.spin === 1; })[0];
    check(d1.done && d1.titles[d1.T.c] > 0 && d1.titles[d1.T.w] > 0, 'replay Fureur : l\'écran de choix de la couleur et celui de la Pesée sont joués par le spectateur');
    check(v1.profile === 'ruby' && v1.first === f1.segment, 'replay Fureur : la touche 3 joue la variante rubis du book (case ' + v1.first + ')');
    check(v1.pick === 0 && v1.mine === fwev.variants[0].playerMult / 100 && Math.abs(v1.total - fwev.win / 100) < 1e-9, 'replay Pesée : la plume joue la variante « plume » du book (valeur du joueur ' + v1.mine + '×, gain figé ' + v1.total + '×)');
    check(v1.res.replace(/\D/g, '') === String(fb.payoutMultiplier), 'replay Fureur : résultat = payoutMultiplier du RGS (' + v1.res + ')');
    check(!p.errs.length, 'aucune erreur JS (' + p.errs.join(' | ') + ')'); await p.close();

    p = await open(b, { ev: 'sanct', q: '&currency=EUR&lang=fr&amount=1000000' });
    await p.waitForFunction(function () { return Replay.state() === 'ready'; }, null, { timeout: 15000 });
    var d2 = await driveReplay(p, {});
    var sealed = d2.oracle.findIndex(function (t) { return /×\?/.test(t); }), shown = d2.oracle.findIndex(function (t) { return /×5\b/.test(t); });
    check(d2.done && sealed >= 0 && shown > sealed, 'replay Oracle scellé : « ×? » puis « ×5 » révélé (' + d2.oracle.join(' | ') + ')');
    var r2 = await p.evaluate(function () { return document.getElementById('rpResV').textContent; });
    check(r2.replace(/\D/g, '') === String(E.makeBook(1, books.sanct).payoutMultiplier), 'replay Sanctuaire des Marées : résultat = RGS (' + r2 + ')'); await p.close();

    p = await open(b, { ev: 'max', q: '&currency=EUR&lang=fr&amount=1000000' });
    await p.waitForFunction(function () { return Replay.state() === 'ready'; }, null, { timeout: 15000 });
    var d3 = await driveReplay(p, {});
    var r3 = await p.evaluate(function () { return document.getElementById('rpResV').textContent; });
    check(d3.done && r3.replace(/\D/g, '') === '2500000', 'replay gain max : 25 000× affiché (' + r3 + ')');
    if (process.env.SHOTS) await p.screenshot({ path: path.join(process.env.SHOTS, 'replay-max.png') });
    await p.close();
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
