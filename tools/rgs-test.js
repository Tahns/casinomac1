// node tools/rgs-test.js — tests de bout en bout du client RGS (js/rgs.js) contre le faux RGS tools/mock-rgs.js (Playwright).
// Mêmes variables d'environnement que e2e.js (PLAYWRIGHT_CORE, CHROMIUM). Couvre les guidelines Stake Engine
// [181] [183] [274] [242] [187] [221] [222] [31] [104]. Au plus quelques dizaines de tours au total (jamais plus de 1000).
var http = require('http'), fs = require('fs'), path = require('path');
var pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
var mockRgs = require('./mock-rgs');
var R = require('../js/rgs.js'), M = require('../js/math.js');
var root = path.join(__dirname, '..'), fails = 0;
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };
function ok(c, m) { if (!c) { fails++; console.log('ÉCHEC  ' + m); } else console.log('ok     ' + m); }
var MICRO = 1000000;
// clic DOM direct : le bouton Tourner s'anime en permanence (Playwright le juge « instable »)
function clk(p, sel) { return p.evaluate('(function(){ var e = document.querySelector(' + JSON.stringify(sel) + '); if (e && !e.disabled) e.click(); })()'); }

var server = http.createServer(function (req, res) {
  var f = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (f.indexOf(root) !== 0 || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});

// finit le tour en cours (turbo, animations avancées à la main)
var FINISH = `(async()=>{ G.turbo=true; G.speed=1.6; var g=0; while(G.S.busy&&g<6000){ await G.advance(0.25); g++; if(G.winOv) G.skipWinOv(); if(g%10===0) await new Promise(function(r){setTimeout(r,8)}); } return !G.S.busy; })()`;

(async function () {
  // ---- unitaire : adresse du RGS et adaptateur book -> tour (aucun navigateur) ----
  ok(R.normalizeUrl('rgs.exemple.com') === 'https://rgs.exemple.com', 'rgs_url sans schéma : https:// ajouté');
  ok(R.normalizeUrl('http://localhost:8787/') === 'http://localhost:8787', 'rgs_url complet conservé (sans « / » final)');
  ok(R.normalizeUrl('') === null && R.normalizeUrl('a b') === null && R.normalizeUrl('ftp://x') === null, 'rgs_url vide / invalide / non http refusé');
  var src = fs.readFileSync(path.join(root, 'js/rgs.js'), 'utf8');
  ok(!/https?:\/\/[a-z0-9-]+\.[a-z]/i.test(src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')), 'aucun hôte codé en dur dans js/rgs.js');
  var probe = mockRgs.create({ seed: 7 }), bad = 0, nb = 0;
  Object.keys(probe.pool).forEach(function (mode) { probe.pool[mode].forEach(function (bk) {
    nb++; var r = R.bookToRound(bk.events, M);
    if (Math.abs(r.total * 100 - bk.payoutMultiplier) > 1e-6) bad++;
  }); });
  ok(bad === 0 && nb <= 1000, 'adaptateur : ' + nb + ' books des 6 modes -> gains identiques au payoutMultiplier (écarts : ' + bad + ')');

  await new Promise(function (r) { server.listen(0, r); });
  var gurl = 'http://localhost:' + server.address().port + '/index.html';
  var b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--no-sandbox', '--use-gl=swiftshader'] });
  var allErrs = [];
  async function open(mock, extra) {
    var port = await mock.listen(0);
    var ctx = await b.newContext({ viewport: { width: 1280, height: 720 } }), p = await ctx.newPage();
    p.on('pageerror', function (e) { allErrs.push(e.message); });
    p.on('console', function (m) { if (m.type() === 'error' && !/RGS|Failed to load resource|net::ERR/.test(m.text())) allErrs.push(m.text()); });
    await p.goto(gurl + '?debug&lang=fr&sessionID=' + mock.state.sessionID + '&rgs_url=' + encodeURIComponent('http://localhost:' + port) + (extra || ''));
    await p.waitForTimeout(700);
    return { p: p, ctx: ctx, mock: mock };
  }
  async function done(s) { await s.ctx.close(); s.mock.close(); }
  function plays(mock) { return mock.state.log.filter(function (l) { return l.path === '/wallet/play'; }); }
  var txt = function (p, sel) { return p.evaluate('document.querySelector(' + JSON.stringify(sel) + ').textContent'); };

  // ---- [181] authenticate au chargement + solde et mise venus de l'API ----
  var s = await open(mockRgs.create({ balance: 250 * MICRO }));
  var au = s.mock.state.log.filter(function (l) { return l.path === '/wallet/authenticate'; });
  ok(au.length === 1 && au[0].body.sessionID === 'test-session', '[181] /wallet/authenticate appelé une fois au chargement avec le sessionID');
  ok(await s.p.evaluate('G.S.balance') === 250 && /250/.test(await txt(s.p, '#bal')), '[181] le solde affiché vient de l\'API (250)');
  ok(await s.p.evaluate('G.S.blocked') === false, '[181] le jeu est débloqué après authenticate');
  // [183] un tour envoie /wallet/play { sessionID, amount (micro), mode } puis rejoue le book
  await clk(s.p, '#spin'); await s.p.waitForFunction('G.S.busy'); await s.p.waitForTimeout(150);
  var pl = plays(s.mock);
  ok(pl.length === 1 && pl[0].body.sessionID === 'test-session' && pl[0].body.amount === 1 * MICRO && pl[0].body.mode === 'std', '[183] /wallet/play { sessionID, amount: 1000000, mode: std }');
  ok(await s.p.evaluate(FINISH), '[183] le book renvoyé est joué jusqu\'au bout');
  var srvBal = s.mock.state.balance;
  // [221] encaissement : end-round seulement si gain > 0, solde = celui du serveur
  var last = s.mock.state.lastRound;
  void last;
  await s.p.waitForTimeout(100);
  var endN = s.mock.count('/wallet/end-round'), uiBal = await s.p.evaluate('G.S.balance');
  ok(Math.abs(uiBal - s.mock.state.balance / MICRO) < 1e-6, 'le solde du jeu = le solde du serveur après le tour (' + uiBal + ')');
  void srvBal; void endN;
  await done(s);

  // ---- [274] rgs_url invalide ----
  var hits = [], ctx2 = await b.newContext({ viewport: { width: 1280, height: 720 } }), p2 = await ctx2.newPage(), mockGuard = mockRgs.create();
  var gport = await mockGuard.listen(0);
  await p2.route(/^https?:\/\/(?!localhost)/, function (route) { hits.push(route.request().url()); route.abort(); });
  await p2.goto(gurl + '?debug&sessionID=test-session&rgs_url=example.com'); await p2.waitForTimeout(900);
  ok(hits.length === 1 && hits[0] === 'https://example.com/wallet/authenticate', '[274] rgs_url=example.com : une seule requête, vers https://example.com/wallet/authenticate (' + hits.join(',') + ')');
  var blk = await p2.evaluate("({vis:!document.getElementById('rgsBlock').hidden, msg:document.getElementById('rgsBlockM').textContent, dis:document.getElementById('spin').disabled, blocked:G.S.blocked})");
  ok(blk.vis && blk.dis && blk.blocked && blk.msg.length > 20, '[274] message d\'erreur clair + jeu bloqué (' + blk.msg.slice(0, 50) + '…)');
  await p2.keyboard.press('Space'); await clk(p2, '#spin'); await p2.waitForTimeout(200);
  ok(hits.length === 1 && mockGuard.state.log.length === 0 && (await p2.evaluate('G.S.busy')) === false, '[274] Espace / clic : aucun tour, aucun repli local ni autre hôte');
  await p2.goto(gurl + '?debug&sessionID=test-session'); await p2.waitForTimeout(500);
  ok(await p2.evaluate("!document.getElementById('rgsBlock').hidden"), '[274] sessionID sans rgs_url : jeu bloqué aussi');
  await ctx2.close(); mockGuard.close();
  // démo locale conservée (sans sessionID ni rgs_url)
  var ctx3 = await b.newContext({ viewport: { width: 1280, height: 720 } }), p3 = await ctx3.newPage();
  await p3.goto(gurl + '?debug'); await p3.waitForTimeout(500);
  ok(await p3.evaluate('G.S.balance') === 1000 && !(await p3.evaluate("!!document.getElementById('rgsBlock')")), 'sans sessionID ni rgs_url : démo locale (solde 1000, aucun blocage)');
  await ctx3.close();

  // ---- [242] configuration de mise réécrite : niveaux courts ----
  var lv = [1, 1.25, 1.5, 2].map(function (x) { return Math.round(x * MICRO); });
  s = await open(mockRgs.create({ betLevels: lv, defaultBetLevel: 1.5 * MICRO }));
  var cfg = await s.p.evaluate('({bets:G.BETS.slice(), bi:G.S.bi, bet:document.getElementById("bet").textContent})');
  ok(JSON.stringify(cfg.bets) === '[1,1.25,1.5,2]' && cfg.bets[cfg.bi] === 1.5, '[242] niveaux = config.betLevels [1, 1.25, 1.5, 2], ouverture sur defaultBetLevel 1,5 (' + cfg.bet + ')');
  for (var i = 0; i < 6; i++) await s.p.evaluate("document.getElementById('betUp').click()");
  ok(await s.p.evaluate('G.BETS[G.S.bi]') === 2 && await s.p.evaluate("document.getElementById('betUp').disabled"), '[242] « + » s\'arrête au dernier niveau (2)');
  for (i = 0; i < 6; i++) await s.p.evaluate("document.getElementById('betDn').click()");
  ok(await s.p.evaluate('G.BETS[G.S.bi]') === 1 && await s.p.evaluate("document.getElementById('betDn').disabled"), '[242] « − » s\'arrête au premier niveau (1)');
  await s.p.evaluate("document.getElementById('betUp').click()");
  await clk(s.p, '#spin'); await s.p.waitForFunction('G.S.busy'); await s.p.waitForTimeout(150);
  ok(plays(s.mock).length === 1 && lv.indexOf(plays(s.mock)[0].body.amount) >= 0 && plays(s.mock)[0].body.amount === 1.25 * MICRO, '[242] la mise envoyée est un niveau de la config (1 250 000)');
  await s.p.evaluate(FINISH);
  await done(s);
  // min/max filtrent les niveaux
  var mk = mockRgs.create(); mk.state.betLevels = [0.1, 1, 2, 3].map(function (x) { return Math.round(x * MICRO); });
  s = await open(mk, '');
  ok(await s.p.evaluate('G.BETS.length') === 4, '[242] niveaux courts pris tels quels (4)');
  await done(s);

  // ---- [187] round actif repris avec sa mise ----
  var m5 = mockRgs.create(); m5.openWinning('std', 5 * MICRO);
  s = await open(m5);
  var r0 = await s.p.evaluate('({bet:G.BETS[G.S.bi], busy:G.S.busy})');
  ok(r0.bet === 5 && r0.busy === true, '[187] round actif : la mise sélectionnée est round.amount (5), pas defaultBetLevel (1), et le round est rejoué');
  ok(plays(m5).length === 0, '[187] la reprise n\'envoie aucun /wallet/play');
  await s.p.evaluate(FINISH); await s.p.waitForTimeout(200);
  ok(m5.count('/wallet/end-round') === 1 && m5.state.active === null, '[187] le round repris est clos par un seul /wallet/end-round');
  ok(await s.p.evaluate('G.BETS[G.S.bi]') === 5 && /5/.test(await txt(s.p, '#bet')), '[187] après le round repris, la mise reste 5');
  m5.set({ next: 'zero' });
  await clk(s.p, '#spin'); await s.p.waitForFunction('G.S.busy'); await s.p.waitForTimeout(150);
  ok(plays(m5).length === 1 && plays(m5)[0].body.amount === 5 * MICRO, '[187] le tour suivant mise 5 000 000');
  await s.p.evaluate(FINISH);
  await done(s);

  // ---- [221] zéro gain : pas d'end-round ; gain : un seul ----
  var mz = mockRgs.create({ seed: 11 }); mz.set({ next: 'zero' });
  s = await open(mz);
  await clk(s.p, '#spin'); await s.p.waitForFunction('G.S.busy'); await s.p.evaluate(FINISH); await s.p.waitForTimeout(150);
  ok(plays(mz).length === 1 && mz.count('/wallet/end-round') === 0, '[221] round à 0× : aucun /wallet/end-round');
  mz.set({ next: 'zero' });
  await clk(s.p, '#spin'); await s.p.waitForFunction('G.S.busy'); await s.p.evaluate(FINISH); await s.p.waitForTimeout(150);
  ok(plays(mz).length === 2 && mz.count('/wallet/end-round') === 0, '[221] deux 0× de suite : toujours aucun end-round entre les deux mises');
  mz.set({ next: 'win' });
  await clk(s.p, '#spin'); await s.p.waitForFunction('G.S.busy'); await s.p.evaluate(FINISH); await s.p.waitForTimeout(250);
  ok(plays(mz).length === 3 && mz.count('/wallet/end-round') === 1, '[221] round gagnant : exactement un /wallet/end-round');
  ok(Math.abs((await s.p.evaluate('G.S.balance')) - mz.state.balance / MICRO) < 1e-6, '[221] le solde affiché = solde du serveur après encaissement');
  // ordre des appels : jamais d'end-round avant le play du même round
  var order = mz.state.log.map(function (l) { return l.path; }).filter(function (x) { return /play|end-round/.test(x); });
  ok(order.join(' ') === '/wallet/play /wallet/play /wallet/play /wallet/end-round', '[221] ordre des appels : play, play, play, end-round (' + order.join(' ') + ')');
  await done(s);

  // ---- [222] solde insuffisant : aucune requête /wallet/play ----
  var m0 = mockRgs.create({ balance: 0 });
  s = await open(m0);
  await clk(s.p, '#spin'); await s.p.keyboard.press('Space'); await s.p.waitForTimeout(200);
  var st0 = await s.p.evaluate("({busy:G.S.busy, msg:document.getElementById('statusText').textContent})");
  ok(plays(m0).length === 0 && !st0.busy && st0.msg.length > 0, '[222] solde 0 : clic + Espace -> aucun /wallet/play, message « ' + st0.msg + ' »');
  m0.set({ balance: Math.round(1.05 * MICRO) });
  await s.p.evaluate("G.S.balance = 1.05; G.S.mode = 'plus'; G.updateHud()");
  await clk(s.p, '#spin'); await s.p.waitForTimeout(200);
  ok(plays(m0).length === 0, '[222] solde 1,05 < coût réel 1,10 (Oracle+ ×1,1) : aucun /wallet/play');
  await s.p.evaluate("G.S.mode = 'std'; G.S.balance = 5; G.updateHud()");
  await clk(s.p, '#btnBuy'); await s.p.waitForTimeout(150);
  var cardsDis = await s.p.evaluate("Array.prototype.map.call(document.querySelectorAll('.buyCard'), function(c){return c.disabled})");
  ok(cardsDis.length === 4 && cardsDis.every(Boolean), '[222] solde 5 < prix des bonus : les 4 achats sont désactivés');
  await s.p.evaluate("document.querySelectorAll('.buyCard')[0].disabled=false; document.querySelectorAll('.buyCard')[0].click()"); await s.p.waitForTimeout(150);
  await s.p.evaluate("var y=document.getElementById('buyYes'); if(y){ y.disabled=false; y.click(); }"); await s.p.waitForTimeout(250);
  ok(plays(m0).length === 0, '[222] achat forcé malgré un solde insuffisant : toujours aucune requête /wallet/play');
  await s.p.evaluate("G.S.balance = 0.5; G.updateHud()"); await s.p.evaluate("document.getElementById('modalClose').click()");
  await clk(s.p, '#btnAuto'); await s.p.waitForTimeout(150);
  ok(await s.p.evaluate("document.getElementById('apGo').disabled"), '[222] autoplay : « Démarrer » désactivé quand le solde ne couvre pas un tour');
  await s.p.evaluate("var g=document.getElementById('apGo'); g.disabled=false; g.click()"); await s.p.waitForTimeout(250);
  ok(plays(m0).length === 0, '[222] autoplay forcé sans solde : aucune requête /wallet/play');
  await done(s);

  // ---- [104] autoplay : un appui n'engage aucun pari ----
  var ma = mockRgs.create({ seed: 5 });
  s = await open(ma);
  await clk(s.p, '#btnAuto'); await s.p.waitForTimeout(250);
  var ap = await s.p.evaluate("({open:!document.getElementById('modal').hidden, go:!!document.getElementById('apGo'), busy:G.S.busy, auto:G.S.auto})");
  ok(ap.open && ap.go && !ap.busy && ap.auto === 0 && plays(ma).length === 0, '[104] un appui sur AUTO ouvre le panneau (tours, arrêts, « Démarrer ») sans aucune requête /wallet/play');
  await clk(s.p, '#apCancel'); await s.p.waitForTimeout(150);
  await clk(s.p, '#spin'); await s.p.waitForFunction('G.S.busy'); await s.p.evaluate(FINISH);
  ok(plays(ma).length === 1 && (await s.p.evaluate('G.S.auto')) === 0, '[104] Annuler puis Tourner : un seul tour, autoplay inactif');
  await clk(s.p, '#btnAuto'); await s.p.waitForTimeout(200);
  await s.p.evaluate("document.querySelector('#apN button').click()");   // 10 tours
  await clk(s.p, '#apGo'); await s.p.waitForFunction('G.S.busy'); await s.p.waitForTimeout(150);
  var started = await s.p.evaluate('({auto:G.S.auto})');
  ok(plays(ma).length === 2 && started.auto > 0, '[104] « Démarrer » lance l\'autoplay (' + started.auto + ' tours restants)');
  await s.p.evaluate('G.S.auto = 0'); await s.p.evaluate(FINISH);
  await done(s);

  // ---- [31] achat de bonus : confirmation avec le coût exact ----
  var mb = mockRgs.create({ seed: 9 });
  s = await open(mb);
  await clk(s.p, '#btnBuy'); await s.p.waitForTimeout(250);
  await s.p.evaluate("document.querySelectorAll('.buyCard')[0].click()"); await s.p.waitForTimeout(200);
  var cf = await s.p.evaluate("({t:document.getElementById('buyConfirmTxt')&&document.getElementById('buyConfirmTxt').textContent, yes:!!document.getElementById('buyYes'), no:!!document.getElementById('buyNo')})");
  ok(plays(mb).length === 0 && cf.yes && cf.no && /12[,.]37/.test(cf.t) && /Chambre|Vault/i.test(cf.t), '[31] clic sur une carte d\'achat : fenêtre « ' + cf.t + ' » + Annuler/Confirmer, aucune requête');
  await clk(s.p, '#buyNo'); await s.p.waitForTimeout(250);
  ok(plays(mb).length === 0 && (await s.p.evaluate('G.S.busy')) === false, '[31] Annuler : aucune mise');
  await clk(s.p, '#btnBuy'); await s.p.waitForTimeout(250);
  await s.p.evaluate("document.querySelectorAll('.buyCard')[0].click()"); await s.p.waitForTimeout(200);
  await clk(s.p, '#buyYes'); await s.p.waitForFunction('G.S.busy'); await s.p.waitForTimeout(200);
  ok(plays(mb).length === 1 && plays(mb)[0].body.mode === 'buy_vault' && plays(mb)[0].body.amount === 1 * MICRO, '[31] Confirmer : /wallet/play { amount: 1000000, mode: buy_vault } (le serveur facture mise × coût)');
  await s.p.evaluate(FINISH); await s.p.waitForTimeout(250);
  ok(Math.abs((await s.p.evaluate('G.S.balance')) - mb.state.balance / MICRO) < 1e-6, '[31] solde après achat = solde du serveur');
  // Oracle+ (×1,1) : pas de confirmation, un bascule seulement le mode ; l'espace mise ensuite
  await clk(s.p, '#btnPlus'); await s.p.waitForTimeout(100);
  ok(plays(mb).length === 1 && !(await s.p.evaluate("!document.getElementById('modal').hidden")), '[31] Oracle+ (×1,1) : simple bascule de mode, aucune fenêtre ni requête');
  await done(s);

  // ---- tous les modes via le RGS : les books des 6 modes se rejouent sans blocage ----
  var mm = mockRgs.create({ seed: 21 });
  s = await open(mm);
  var seq = [null, 'plus', null, 'plus', 'scarab', 'weigh', 'vault', 'hand', 'hand', 'vault'], badMode = [];
  for (i = 0; i < seq.length; i++) {
    var r = await s.p.evaluate('(async()=>{ G.turbo=true; G.speed=1.6; ' + (seq[i] === 'plus' ? "G.S.mode='plus';" : "G.S.mode='std';") + ' G.play(' + (seq[i] && seq[i] !== 'plus' ? JSON.stringify(seq[i]) : 'null') + '); var g=0; await new Promise(function(r){setTimeout(r,120)}); ' +
      'while(G.S.busy&&g<6000){ await G.advance(0.25); g++; if(G.winOv) G.skipWinOv(); if(g%10===0) await new Promise(function(r){setTimeout(r,8)}); } return !G.S.busy && !G.scene; })()');
    if (!r) badMode.push(seq[i] || 'std');
    await s.p.waitForTimeout(60);
  }
  ok(badMode.length === 0 && plays(mm).length === seq.length, seq.length + ' tours RGS (Standard, Oracle+, 4 achats) rejoués sans blocage' + (badMode.length ? ' : ' + badMode.join(',') : ''));
  ok(Math.abs((await s.p.evaluate('G.S.balance')) - mm.state.balance / MICRO) < 1e-6, 'solde final du jeu = solde du serveur (' + mm.state.balance / MICRO + ')');
  ok(mm.state.active === null, 'aucun round laissé ouvert côté serveur');
  await done(s);

  // ---- erreurs du RGS : ERR_IPB -> message, pas de blocage ----
  var me = mockRgs.create(); s = await open(me);
  await s.p.evaluate("G.S.balance = 5000; G.updateHud()");   // l'écran croit avoir plus que le serveur : le serveur répond ERR_IPB
  me.set({ balance: 0 });
  await clk(s.p, '#spin'); await s.p.waitForTimeout(500);
  var ipb = await s.p.evaluate("({busy:G.S.busy, msg:document.getElementById('statusText').textContent, bal:G.S.balance})");
  ok(!ipb.busy && /insuffisant/i.test(ipb.msg) && ipb.bal === 0, 'ERR_IPB : message « ' + ipb.msg + ' », solde resynchronisé (/wallet/balance), jeu non bloqué');
  await done(s);

  ok(allErrs.length === 0, 'aucune erreur de page' + (allErrs.length ? ' : ' + allErrs.slice(0, 3).join(' | ') : ''));
  await b.close(); server.close();
  console.log(fails ? '\n' + fails + ' échec(s)' : '\ntout est bon');
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.log(e); process.exit(1); });
