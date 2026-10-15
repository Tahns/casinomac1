// node tools/stake-build-test.js — build de production Stake (tools/build-stake.py -> dist-stake/), Playwright.
//  1. sans paramètres : écran « Lancez le jeu depuis Stake », aucune démo (ni solde, ni interface de jeu, ni sauvegarde), aucun tirage RNG, aucune requête RGS ;
//  2. avec ?sessionID=…&rgs_url=… + faux RGS (tools/mock-rgs.js, ANUBIS_POOL=24 par défaut) : 3 tours joués, solde = solde du serveur, aucun tirage RNG
//     du navigateur (crypto.getRandomValues jamais appelé), pas de bouton de remise à zéro ni de texte de démo ;
//  3. ?replay=true&…&rgs_url=… : la rediffusion se charge (et se joue sauf REPLAY_PLAY=0) sans appel /wallet ;
//  4. 0 requête hors de l'origine du jeu et de rgs_url, 0 erreur console / JS.
// Variables : PLAYWRIGHT_CORE, CHROMIUM (comme e2e.js), ANUBIS_POOL (24 par défaut), STAKE_BUILD=0 pour ne pas reconstruire dist-stake/. Au plus 3 tours + 1 rediffusion.
process.env.ANUBIS_POOL = process.env.ANUBIS_POOL || '24';
var http = require('http'), fs = require('fs'), path = require('path'), cp = require('child_process');
var pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
var mockRgs = require('./mock-rgs');
var root = path.join(__dirname, '..'), dist = path.join(root, 'dist-stake'), fails = 0, MICRO = 1000000;
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
function ok(c, m) { if (!c) { fails++; console.log('ÉCHEC  ' + m); } else console.log('ok     ' + m); }

if (process.env.STAKE_BUILD !== '0') {
  var r = cp.spawnSync('python3', ['-I', path.join(__dirname, 'build-stake.py')], { encoding: 'utf8' });
  ok(r.status === 0, 'tools/build-stake.py : build sans erreur' + (r.status ? ' : ' + (r.stdout + r.stderr).split('\n').filter(function (l) { return /ÉCHEC/.test(l); }).join(' | ') : ''));
  if (r.status) process.exit(1);
}

var server = http.createServer(function (req, res) {
  var f = path.join(dist, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (f.indexOf(dist) !== 0 || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
// tout tirage aléatoire cryptographique du navigateur est compté (le RGS tire, le front jamais)
var HOOK = function () {
  window.__rng = 0; var o = crypto.getRandomValues.bind(crypto);
  crypto.getRandomValues = function (a) { window.__rng++; return o(a); };
};
var FINISH = `(async()=>{ G.turbo=true; G.speed=1.6; var g=0; while(G.S.busy&&g<6000){ await G.advance(0.25); g++; if(G.winOv) G.skipWinOv(); if(g%10===0) await new Promise(function(r){setTimeout(r,8)}); } return !G.S.busy; })()`;

(async function () {
  await new Promise(function (r) { server.listen(0, r); });
  var gport = server.address().port, gorigin = 'http://localhost:' + gport;
  var mock = mockRgs.create({ seed: 5 }), mport = await mock.listen(0), morigin = 'http://localhost:' + mport;
  var b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--no-sandbox', '--use-gl=swiftshader'] });
  var errs = [], reqs = [];
  async function open(qs) {
    var ctx = await b.newContext({ viewport: { width: 1280, height: 720 } }), p = await ctx.newPage();
    p.on('pageerror', function (e) { errs.push('pageerror ' + e.message); });
    p.on('console', function (m) { if (m.type() === 'error') errs.push('console ' + m.text()); });
    p.on('request', function (q) { if (!/^(data|blob|about):/.test(q.url())) reqs.push(q.url()); });
    await p.addInitScript(HOOK);
    await p.goto(gorigin + '/index.html' + qs);
    return { p: p, ctx: ctx };
  }
  var walletCalls = function () { return mock.state.log.filter(function (l) { return /^\/wallet\//.test(l.path); }); };

  // ---- 1. sans paramètres : écran « Lancez le jeu depuis Stake » ----
  var a = await open('?lang=en'); await a.p.waitForTimeout(800);
  var st = await a.p.evaluate(function () {
    var blk = document.getElementById('rgsBlock');
    return { build: window.ANUBIS_BUILD, code: blk && blk.getAttribute('data-code'), text: blk ? blk.innerText : '', ui: !!document.getElementById('ui'), splash: !!document.getElementById('splash'),
      stage: !!document.getElementById('stage'), spin: !!document.getElementById('spin'), bal: !!document.getElementById('bal'), reset: !!document.getElementById('optReset'),
      gs: typeof G !== 'undefined' && !!G.S, rng: window.__rng, save: Object.keys(localStorage).filter(function (k) { return /anubis|hoa/.test(k); }), body: document.body.innerText };
  });
  ok(st.build === 'stake', 'drapeau de build : window.ANUBIS_BUILD = « ' + st.build + ' »');
  ok(st.code === 'ERR_LAUNCH' && /Launch the game from Stake/.test(st.text), 'sans paramètres : écran « ' + st.text.replace(/\s+/g, ' ').trim() + ' »');
  ok(!st.ui && !st.splash && !st.stage && !st.spin && !st.bal && !st.reset && !st.gs, 'aucune interface de jeu, ni solde, ni bouton de remise à zéro, ni état de jeu');
  ok(st.rng === 0 && !st.save.length, 'aucun tirage RNG (getRandomValues : ' + st.rng + ') et aucune sauvegarde locale (' + st.save.length + ')');
  ok(!/balance|1,?000|demo|play money|fictitious/i.test(st.body), 'aucun solde ni texte de démo à l\'écran');
  ok(reqs.every(function (u) { return u.indexOf(gorigin) === 0; }) && mock.state.log.length === 0, 'sans paramètres : aucune requête RGS (' + reqs.length + ' requêtes, toutes vers l\'origine du jeu)');
  await a.p.close();
  var f = await open('?lang=fr&social=true'); await f.p.waitForTimeout(500);
  var ft = await f.p.evaluate(function () { return document.getElementById('rgsBlock').innerText; });
  ok(/Lancez le jeu depuis le site/.test(ft) && !/stake/i.test(ft), 'mode social (FR) : texte sans mot interdit : « ' + ft.replace(/\s+/g, ' ').trim() + ' »');
  await f.ctx.close();

  // ---- 2. session RGS : 3 tours ----
  var s = await open('?debug&lang=en&sessionID=test-session&rgs_url=' + encodeURIComponent(morigin)); await s.p.waitForTimeout(900);
  ok(await s.p.evaluate('G.S.blocked') === false && await s.p.evaluate('G.S.balance') === 1000, 'session RGS : authentifié, solde du serveur (1000)');
  ok(await s.p.evaluate("!document.getElementById('rgsBlock') || document.getElementById('rgsBlock').hidden") && await s.p.evaluate("!document.getElementById('optReset')"), 'session RGS : pas de blocage, pas de bouton de remise à zéro');
  for (var i = 0; i < 3; i++) {
    await s.p.evaluate("(function(){ var e = document.getElementById('spin'); if (e && !e.disabled) e.click(); })()");
    await s.p.waitForFunction('G.S.busy', null, { timeout: 5000 });
    ok(await s.p.evaluate(FINISH), 'tour ' + (i + 1) + ' joué jusqu\'au bout');
    await s.p.waitForTimeout(100);
  }
  var pl = mock.state.log.filter(function (l) { return l.path === '/wallet/play'; });
  ok(pl.length === 3 && pl.every(function (l) { return l.body.mode === 'std' && l.body.amount === 1 * MICRO && l.body.sessionID === 'test-session'; }), '3 appels /wallet/play { mode: std, amount: 1000000 } (' + pl.length + ')');
  ok(Math.abs(await s.p.evaluate('G.S.balance') - mock.state.balance / MICRO) < 1e-6, 'solde du jeu = solde du serveur (' + mock.state.balance / MICRO + ')');
  var info = await s.p.evaluate(function () { document.getElementById('btnInfo').click(); return { rng: window.__rng, modal: document.getElementById('modalBody').innerText }; });
  ok(info.rng === 0, 'session RGS : aucun tirage RNG du navigateur (getRandomValues : ' + info.rng + ')');
  ok(!/demo|play money|fictitious|not the Stake/i.test(info.modal), 'session RGS : les règles ne mentionnent aucune démo');
  await s.ctx.close();

  // ---- 3. rediffusion ----
  var before = walletCalls().length;
  var rp = await open('?replay=true&game=anubis&version=1&mode=std&event=1&lang=en&rgs_url=' + encodeURIComponent(morigin));
  await rp.p.waitForFunction(function () { return window.Replay && Replay.state() === 'ready'; }, null, { timeout: 15000 });
  var vis = await rp.p.evaluate(function () { var g = document.getElementById('rpGo'); return !!(g && g.offsetParent !== null) && !document.getElementById('rgsBlock'); });
  ok(vis, 'rediffusion : chargée (bouton Lecture visible, pas d\'écran « Lancez depuis Stake »)');
  if (process.env.REPLAY_PLAY !== '0') {
    await rp.p.click('#rpGo');
    await rp.p.waitForFunction(function () { return Replay.state() === 'done'; }, null, { timeout: 240000 });
    ok(true, 'rediffusion : lue jusqu\'au bout (' + await rp.p.evaluate(function () { return document.getElementById('rpResV').textContent; }) + ')');
  }
  ok(walletCalls().length === before && (await rp.p.evaluate('window.__rng')) === 0, 'rediffusion : aucun appel /wallet et aucun tirage RNG');
  await rp.ctx.close();

  // ---- 4. requêtes et erreurs ----
  var bad = reqs.filter(function (u) { return u.indexOf(gorigin + '/') !== 0 && u.indexOf(morigin + '/') !== 0; });
  ok(bad.length === 0, '0 requête hors origine du jeu / rgs_url (' + reqs.length + ' requêtes)' + (bad.length ? ' : ' + bad.slice(0, 3).join(', ') : ''));
  ok(errs.length === 0, '0 erreur console / JS' + (errs.length ? ' : ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); server.close(); mock.close();
  console.log(fails ? '\n' + fails + ' échec(s)' : '\ntout est bon'); process.exit(fails ? 1 : 0);
})().catch(function (e) { console.log('ÉCHEC  ' + (e && e.stack || e)); process.exit(1); });
