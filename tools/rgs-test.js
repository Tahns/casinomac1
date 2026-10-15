// node tools/rgs-test.js — tests de bout en bout du client RGS (js/rgs.js) contre le faux RGS tools/mock-rgs.js (Playwright).
// Mêmes variables d'environnement que e2e.js (PLAYWRIGHT_CORE, CHROMIUM). Couvre les guidelines Stake Engine
// [181] [183] [274] [242] [187] [221] [222] [31] [104] et le FORMAT DE BOOK v2 (en-tête de tools/stake-export.js) : 6 modes × 10 tours, choix de couleur
// de la Fureur et plume / cœur de la Pesée dans le même book, Sanctuaire des Marées, Oracle scellé révélé, gain max 25 000×, écart book / RGS,
// erreurs de session (ERR_IS, ERR_ATE, ERR_LOC, ERR_MAINTENANCE), mode social et devise du RGS. Au plus ~150 tours au total (jamais plus de 1000).
// SHOTS=dossier : captures des écrans d'erreur (390×844 et 1280×720).
var http = require('http'), fs = require('fs'), path = require('path');
var pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
var mockRgs = require('./mock-rgs');
var R = require('../js/rgs.js'), M = require('../js/math.js'), E = require('./stake-export');
var root = path.join(__dirname, '..'), fails = 0;
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };
function ok(c, m) { if (!c) { fails++; console.log('ÉCHEC  ' + m); } else console.log('ok     ' + m); }
var MICRO = 1000000, LBL_RESET_FR = 'Réinitialiser le solde';
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
  var vbad = 0, ibad = 0, variants = 0;
  Object.keys(probe.pool).forEach(function (mode) { probe.pool[mode].forEach(function (bk) {
    if (E.verify(bk).length) vbad++;
    if (R.bookToRound(bk.events, M).issues.length) ibad++;
    bk.events.forEach(function (e) { if (e.type === 'weighReveal' || e.type === 'furyEnd') variants++; });
  }); });
  ok(vbad === 0 && ibad === 0 && variants > 0, 'format v2 : verify() (règles recalculées sans le front) et adaptateur sans écart sur ' + nb + ' books (' + variants + ' variantes Pesée / Fureur, mêmes totaux)');
  var v1 = false; try { R.bookToRound([{ type: 'roundStart', mode: 'std', cost: 100 }], M); } catch (e) { v1 = e.code === 'ERR_BOOK'; }
  ok(v1, 'un book qui n\'est pas en v2 est refusé (ERR_BOOK)');
  var wb = probe.pool.bonus_weigh.filter(function (b) { return b.payoutMultiplier > 0; })[0], wr = R.bookToRound(wb.events, M).spins[0].bonus, w0 = wr.total;
  wr.pick = 1; var w1 = wr.mults.slice(); wr.pick = 0;
  ok(wr.total === w0 && wr.fixed === w0 && wr.mults[wr.pick] === wb.events.filter(function (e) { return e.type === 'weighReveal'; })[0].variants[0].playerMult / 100 && w1[1] === wr.mults[0], 'Pesée : plume et cœur portent la même valeur du joueur, gain figé du book (' + w0 + '×)');

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
  // [222] plus aucun moyen de réécrire le solde en mode RGS : pas de bouton de remise à zéro du solde dans les réglages ni dans le guide des boutons
  await s.p.evaluate("document.getElementById('modalClose').click()"); await s.p.evaluate("G.S.balance = 0; G.updateHud()");
  await clk(s.p, '#btnInfo'); await s.p.waitForTimeout(200);
  var rs = await s.p.evaluate("({btn:!!document.getElementById('optReset'), txt:document.getElementById('modalBody').textContent, guide:Array.prototype.map.call(document.querySelectorAll('dl.guide dd'),function(e){return e.textContent}).join(' | ')})");
  ok(!rs.btn && rs.txt.indexOf(LBL_RESET_FR) < 0 && !/réinitialisation du solde|reset the balance/i.test(rs.guide), '[222] mode RGS : ni bouton #optReset ni mention dans le guide des boutons');
  // [235] guide des boutons en session RGS : pas de bouton de devise (caché), « Langue » = menu des 16 langues, option d'arrêt sur gain décrite
  var gd = await s.p.evaluate("({dt:Array.prototype.map.call(document.querySelectorAll('dl.guide dt'),function(e){return e.textContent}), dd:Array.prototype.map.call(document.querySelectorAll('dl.guide dd'),function(e){return e.textContent}), curBtn:getComputedStyle(document.getElementById('btnCur')).display, stop:I18N.rgs().autoStopWin})");
  ok(gd.curBtn === 'none' && gd.dt.indexOf('€ / $') < 0 && gd.dt.indexOf('FR / EN') < 0 && gd.dt.indexOf('Langue') >= 0 && /16/.test(gd.dd[gd.dt.indexOf('Langue')]), '[235] session RGS : bouton de devise caché et absent du guide, « Langue » décrit comme un menu de 16 langues');
  ok(gd.dd.some(function (t) { return t.indexOf('« ' + gd.stop + ' »') >= 0 && /×10/.test(t); }), '[235] le guide décrit l\'option « ' + gd.stop + ' » du panneau AUTO');
  await s.p.evaluate("document.getElementById('modalClose').click()");
  ok((await s.p.evaluate('G.S.balance')) === 0 && plays(m0).length === 0, '[222] solde local toujours 0 après ouverture des réglages, aucune requête /wallet/play');
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
  ok(plays(mb).length === 1 && plays(mb)[0].body.mode === 'bonus_vault' && plays(mb)[0].body.amount === 1 * MICRO, '[31] Confirmer : /wallet/play { amount: 1000000, mode: bonus_vault } (le serveur facture mise × coût) ' + JSON.stringify(plays(mb).map(function (l) { return l.body; })));
  await s.p.evaluate(FINISH); await s.p.waitForTimeout(250);
  ok(Math.abs((await s.p.evaluate('G.S.balance')) - mb.state.balance / MICRO) < 1e-6, '[31] solde après achat = solde du serveur');
  // Oracle+ (×1,1) : pas de confirmation, un bascule seulement le mode ; l'espace mise ensuite
  await clk(s.p, '#btnPlus'); await s.p.waitForTimeout(100);
  ok(plays(mb).length === 1 && !(await s.p.evaluate("!document.getElementById('modal').hidden")), '[31] Oracle+ (×1,1) : simple bascule de mode, aucune fenêtre ni requête');
  // Entrée MAINTENU sur une carte d'achat : la 1re frappe ouvre la confirmation (focus sur « Annuler »), les répétitions ne confirment rien
  var base31 = plays(mb).length;
  await clk(s.p, '#btnBuy'); await s.p.waitForTimeout(250);
  await s.p.evaluate("document.querySelectorAll('.buyCard')[0].focus()");
  await s.p.keyboard.down('Enter'); await s.p.waitForTimeout(120);
  var foc = await s.p.evaluate("({conf:!!document.getElementById('buyConfirmTxt'), act:document.activeElement && document.activeElement.id})");
  ok(foc.conf && foc.act === 'buyNo' && plays(mb).length === base31, '[31] Entrée sur une carte : fenêtre de confirmation, focus initial sur « Annuler » (#buyNo), aucune requête');
  for (var rep = 0; rep < 6; rep++) { await s.p.keyboard.down('Enter'); await s.p.waitForTimeout(40); }   // répétitions de la touche maintenue (repeat: true)
  await s.p.keyboard.up('Enter'); await s.p.waitForTimeout(250);
  var held = await s.p.evaluate("({conf:!!document.getElementById('buyConfirmTxt'), open:!document.getElementById('modal').hidden, busy:G.S.busy})");
  ok(plays(mb).length === base31 && !held.busy && held.conf && held.open, '[31] Entrée maintenu (6 répétitions) : aucun /wallet/play, la confirmation reste ouverte');
  // répétition directement sur le bouton « Confirmer » : ignorée (événement envoyé avec repeat: true)
  var rptYes = await s.p.evaluate("(function(){ var y = document.getElementById('buyYes'); y.focus(); var ev = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', repeat: true, bubbles: true, cancelable: true }); y.dispatchEvent(ev); return ev.defaultPrevented; })()");
  ok(rptYes && plays(mb).length === base31, '[31] keydown répété (e.repeat) sur « Confirmer » : ignoré (defaultPrevented), aucune requête');
  await clk(s.p, '#buyNo'); await s.p.waitForTimeout(200);
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

  // ---- 6 modes × 10 tours : chaque book v2 rejoué, solde final = solde RGS ----
  var ALL = [[null, 'std'], ['plus', 'plus'], ['scarab', 'bonus_scarab'], ['weigh', 'bonus_weigh'], ['vault', 'bonus_vault'], ['hand', 'bonus_fury']];
  for (var mi = 0; mi < ALL.length; mi++) {
    var m6 = mockRgs.create({ seed: 100 + mi, balance: 100000 * MICRO }); s = await open(m6);
    var blocked6 = 0, over = [];
    for (i = 0; i < 10; i++) {
      var r6 = await s.p.evaluate('(async()=>{ G.turbo=true; G.speed=1.6; G.S.mode=' + JSON.stringify(ALL[mi][0] === null || ALL[mi][0] === 'plus' ? (ALL[mi][0] || 'std') : 'std') + '; G.play(' + (ALL[mi][0] && ALL[mi][0] !== 'plus' ? JSON.stringify(ALL[mi][0]) : 'null') + '); var g=0; await new Promise(function(r){setTimeout(r,60)}); ' +
        'while(G.S.busy&&g<8000){ await G.advance(0.25); g++; if(G.winOv) G.skipWinOv(); if(!document.getElementById("modal").hidden){ var c=document.getElementById("modalClose"); if(c) c.click(); } if(g%10===0) await new Promise(function(r){setTimeout(r,6)}); } return !G.S.busy && !G.scene; })()');
      if (!r6) blocked6++;
      await s.p.waitForTimeout(40);
    }
    var sums = m6.state.log.filter(function (l) { return l.path === '/wallet/play'; }).length;
    ok(blocked6 === 0 && sums === 10, 'mode ' + ALL[mi][1] + ' : 10 tours rejoués sans blocage (' + sums + ' /wallet/play)');
    ok(Math.abs((await s.p.evaluate('G.S.balance')) - m6.state.balance / MICRO) < 1e-6 && m6.state.active === null, 'mode ' + ALL[mi][1] + ' : solde final du jeu = solde du RGS (' + m6.state.balance / MICRO + ') et aucun round ouvert');
    await done(s);
  }

  // pilote interactif : avance le temps du jeu par pas, appuie sur les touches des choix quand leur écran est là, relève l'Oracle affiché
  async function drive(p, o) {
    o = o || {};
    var seen = { titles: {}, oracle: [] }, g = 0, T = await p.evaluate('({c:I18N.t().handColorTitle,w:I18N.t().weighIntro})');
    while (g < 9000) {
      var st = await p.evaluate('(async()=>{ await G.advance(0.25); if(G.winOv) G.skipWinOv(); var o=document.getElementById("oracle"); return { busy:G.S.busy, title:G.scene&&G.scene.title||"", oracle:o&&!o.hidden?document.getElementById("oracleText").textContent:"" }; })()');
      g++;
      if (st.oracle && seen.oracle[seen.oracle.length - 1] !== st.oracle) seen.oracle.push(st.oracle);
      if (st.title) seen.titles[st.title] = (seen.titles[st.title] || 0) + 1;
      if (st.title === T.c && o.color != null) await p.keyboard.press('Digit' + (o.color + 1));
      if (st.title === T.w && o.pick != null) await p.keyboard.press('Digit' + (o.pick + 1));
      if (!st.busy) break;
      if (g % 8 === 0) await p.waitForTimeout(4);
    }
    seen.T = T; seen.done = g < 9000; return seen;
  }
  function spinOf(kind, o) { return Object.assign({ oracle: null, index: -1, kind: kind, boost: 1, bonus: null, base: 0, pay: 0 }, o); }
  var wallet = function (mock) { return mock.state.balance / MICRO; };

  // ---- Fureur (3 couleurs) + Pesée imbriquée (plume / cœur) dans le MÊME book : de vrais choix, gain = RGS ----
  var hrng = M.mulberry32(4242), hd = null, tries = 0;
  while (tries++ < 400) { hd = M._bonus.hand(hrng, 0, [12]); if (hd.total > 0) break; }   // 12 = bande « Pesée ×6 » : gain > 0 (le joueur gagne la Pesée)
  var hsp = spinOf('hand', { bonus: hd, upgraded: true, base: hd.total, pay: hd.total, profile: 'turq' });
  var hround = { spins: [hsp], total: Math.min(hsp.pay, M.MAX_WIN), capped: hsp.pay > M.MAX_WIN, cost: M.BUY.hand.price, mode: 'buy' };
  var hbook = E.makeBook(1, hround), wev = hbook.events.filter(function (e) { return e.type === 'weighReveal' && e.color === 1; })[0];
  ok(E.verify(hbook).length === 0 && hd.total > 0 && !!wev, 'book Fureur → bande Pesée ×6 fabriqué (' + hbook.payoutMultiplier / 100 + '×) : 3 couleurs et 2 variantes plume / cœur, mêmes totaux');
  var mh = mockRgs.create({ seed: 31, balance: 1000 * MICRO }); mh.queueBook('bonus_fury', hbook);
  s = await open(mh, '');
  await s.p.evaluate("(function(){ var o=G.runBonus; G.__sps=[]; G.runBonus=function(sp,b){ G.__sps.push(sp); return o.call(G,sp,b); }; })()");
  await clk(s.p, '#btnBuy'); await s.p.waitForTimeout(250);
  await s.p.evaluate("document.querySelectorAll('.buyCard')[3].click()"); await s.p.waitForTimeout(200);
  await clk(s.p, '#buyYes'); await s.p.waitForFunction('G.S.busy', null, { timeout: 5000 });
  var dh = await drive(s.p, { color: 1, pick: 1 });   // couleur n°2 (or), cœur
  var hv = await s.p.evaluate('(function(){ var sp=G.__sps[0], b=sp.bonus, nb=b.spins.filter(function(x){return x.kind==="band"})[0]; return { profile:sp.profile, first:b.spins[0].idx, colour:b.colour, total:b.total, pay:sp.pay, nbPick:nb&&nb.bonus.pick, nbMults:nb&&nb.bonus.mults, nbTotal:nb&&nb.bonus.total }; })()');
  var colEv = hbook.events.filter(function (e) { return e.type === 'furySpin' && e.color === 1 && e.spin === 1; })[0];
  ok(dh.done && dh.titles && dh.titles[dh.T.c] > 0 && dh.titles[dh.T.w] > 0, 'Fureur : l\'écran de choix de la couleur ET celui de la Pesée sont passés par le joueur (mode RGS, rien de cosmétique)');
  ok(hv.profile === 'gold' && hv.colour === 1 && hv.first === colEv.segment, 'Fureur : la touche 2 a joué la variante or du book (case ' + hv.first + ' = furySpin de la couleur 1)');
  ok(hv.nbPick === 1 && hv.nbMults[1] === wev.variants[1].playerMult / 100 && Math.abs(hv.nbTotal - wev.win / 100) < 1e-9, 'Pesée imbriquée : le cœur a joué la variante « cœur » du book (valeur du joueur ' + hv.nbMults[1] + '×, gain figé ' + hv.nbTotal + '×)');
  ok(Math.abs((await s.p.evaluate('G.S.lastWin')) - hbook.payoutMultiplier / 100) < 1e-9 && Math.abs((await s.p.evaluate('G.S.balance')) - wallet(mh)) < 1e-6 && await s.p.evaluate("document.getElementById('modal').hidden"), 'Fureur : gain affiché = payoutMultiplier du RGS (' + hbook.payoutMultiplier / 100 + '×), solde = solde RGS, aucune erreur de cohérence');
  await done(s);

  // ---- Pesée seule (achat) : plume puis cœur dans deux tours, même gain ----
  var wrng = M.mulberry32(99), wd = null; tries = 0;
  while (tries++ < 400) { wd = M._bonus.weigh(wrng, 'std'); if (wd.heavy === 0 && wd.mults[0] > 1) break; }
  var wround = { spins: [spinOf('weigh', { bonus: wd, base: wd.total, pay: wd.total })], total: wd.total, capped: false, cost: M.BUY.weigh.price, mode: 'buy' }, wbook = E.makeBook(1, wround);
  var mw = mockRgs.create({ seed: 32, balance: 1000 * MICRO }); mw.queueBook('bonus_weigh', wbook); mw.queueBook('bonus_weigh', wbook);
  s = await open(mw, '');
  var wgains = [];
  for (i = 0; i < 2; i++) {
    await s.p.evaluate("G.__sps=[]; if(!G.__w){ G.__w=1; var o=G.runBonus; G.runBonus=function(sp,b){ G.__sps.push(sp); return o.call(G,sp,b); }; }");
    await clk(s.p, '#btnBuy'); await s.p.waitForTimeout(250);
    await s.p.evaluate("document.querySelectorAll('.buyCard')[2].click()"); await s.p.waitForTimeout(200);
    await clk(s.p, '#buyYes'); await s.p.waitForFunction('G.S.busy', null, { timeout: 5000 });
    var dw = await drive(s.p, { pick: i });
    wgains.push(await s.p.evaluate('({win:G.S.lastWin, pick:G.__sps[0].bonus.pick, m:G.__sps[0].bonus.mults.slice(), h:G.__sps[0].bonus.heavy})'));
    ok(dw.done && dw.titles[dw.T.w] > 0, 'Pesée tour ' + (i + 1) + ' : choix ' + (i ? 'cœur' : 'plume') + ' fait par le joueur');
  }
  ok(wgains[0].pick === 0 && wgains[1].pick === 1 && wgains[0].win === wgains[1].win && Math.abs(wgains[0].win - wbook.payoutMultiplier / 100) < 1e-9 && wgains[0].h === 0 && wgains[1].h === 1, 'Pesée : plume et cœur → plateaux différents mais le même gain (' + wgains[0].win + '×), celui du RGS');
  ok(Math.abs((await s.p.evaluate('G.S.balance')) - wallet(mw)) < 1e-6, 'Pesée : solde final = solde RGS');
  await done(s);

  // ---- Oracle scellé (×? puis valeur révélée) + Sanctuaire des Marées dans un book fabriqué ----
  var vi = M.LAYOUT.indexOf('vault'), crng = M.mulberry32(7);
  var cb = M._bonus.crypt(crng, [{ t: 'tab', v: 5 }, { t: 'tide', v: 3 }, { t: 'tab', v: 10 }, { t: 'eclipse', v: 2 }, { t: 'tab', v: 2 }]);
  var csp = spinOf('vault', { oracle: { kind: 'vault', boost: 5 }, index: vi, boost: 5, bonus: cb, secret: true, profile: 'crypt', base: cb.total, pay: cb.total * 5 });
  var cround = { spins: [csp], total: Math.min(csp.pay, M.MAX_WIN), capped: csp.pay > M.MAX_WIN, cost: 1, mode: 'std' }, cbook = E.makeBook(1, cround);
  ok(E.verify(cbook).length === 0 && cb.total >= 1, 'book Sanctuaire des Marées + Oracle ×5 sur le Trésor fabriqué (' + cbook.payoutMultiplier / 100 + '×)');
  var mc = mockRgs.create({ seed: 33, balance: 1000 * MICRO }); mc.queueBook('std', cbook);
  s = await open(mc, '');
  await clk(s.p, '#spin'); await s.p.waitForFunction('G.S.busy', null, { timeout: 5000 });
  var dc = await drive(s.p, {});
  var sealed = dc.oracle.some(function (t) { return /×\?/.test(t); }), shownV = dc.oracle.some(function (t) { return /×5\b/.test(t); });
  ok(dc.done && sealed && shownV && dc.oracle.findIndex(function (t) { return /×\?/.test(t); }) < dc.oracle.findIndex(function (t) { return /×5\b/.test(t); }), 'Oracle scellé : la pastille affiche « ×? » avant l\'arrêt puis « ×5 » révélé (' + dc.oracle.join(' | ') + ')');
  ok(Math.abs((await s.p.evaluate('G.S.lastWin')) - cbook.payoutMultiplier / 100) < 1e-9 && Math.abs((await s.p.evaluate('G.S.balance')) - wallet(mc)) < 1e-6, 'Sanctuaire : gain = RGS (' + cbook.payoutMultiplier / 100 + '×), solde final = solde RGS');
  await done(s);

  // ---- gain max 25 000× affiché (Sanctuaire plafonné) ----
  var xb = M._bonus.crypt(M.mulberry32(8), [{ t: 'tide', v: 10 }, { t: 'tide', v: 10 }, { t: 'tide', v: 10 }, { t: 'tide', v: 10 }, { t: 'tab', v: 300 }]);
  var xsp = spinOf('vault', { index: vi, bonus: xb, secret: true, profile: 'crypt', base: xb.total, pay: xb.total }), xround = { spins: [xsp], total: Math.min(xsp.pay, M.MAX_WIN), capped: xsp.pay > M.MAX_WIN, cost: 1, mode: 'std' };
  var xbook = E.makeBook(1, xround);
  ok(xbook.payoutMultiplier === 2500000 && xb.capped && E.verify(xbook).length === 0, 'book au plafond : payoutMultiplier 2 500 000 (25 000×), sanctuaryEnd.capped (offrande ' + xb.pool + '×)');
  var mx = mockRgs.create({ seed: 34, balance: 1000 * MICRO }); mx.queueBook('std', xbook);
  s = await open(mx, '');
  await clk(s.p, '#spin'); await s.p.waitForFunction('G.S.busy', null, { timeout: 5000 });
  var dx = await drive(s.p, {});
  await s.p.waitForTimeout(1200);   // le compteur du HUD finit de défiler
  var xs = await s.p.evaluate("({win:G.S.lastWin, txt:document.getElementById('win').textContent.replace(/\\D/g,''), bal:G.S.balance, modal:document.getElementById('modal').hidden})");
  ok(dx.done && xs.win === 25000 && /^2500000/.test(xs.txt) && xs.modal, 'gain max : 25 000× affiché dans le HUD (' + xs.txt + '), aucune erreur');
  ok(Math.abs(xs.bal - wallet(mx)) < 1e-6 && Math.abs(wallet(mx) - (1000 - 1 + 25000)) < 1e-6, 'gain max : solde final = solde RGS (' + wallet(mx) + ')');
  await done(s);

  // ---- écart book / RGS : erreur affichée, montant du RGS crédité ----
  var wbk = null;
  var mt = mockRgs.create({ seed: 35, balance: 1000 * MICRO });
  mt.pool.std.forEach(function (b) { if (!wbk && b.payoutMultiplier > 0 && b.payoutMultiplier < 2000) wbk = b; });
  var tamp = { id: 9999, events: wbk.events, payoutMultiplier: wbk.payoutMultiplier + 500 };
  mt.queueBook('std', tamp);
  s = await open(mt, '');
  await clk(s.p, '#spin'); await s.p.waitForFunction('G.S.busy', null, { timeout: 5000 });
  await s.p.evaluate(FINISH); await s.p.waitForTimeout(300);
  var tm = await s.p.evaluate("({modal:!document.getElementById('modal').hidden, txt:document.getElementById('modalBody').textContent, win:G.S.lastWin, bal:G.S.balance, sum:I18N.rgs().errSum})");
  ok(tm.modal && tm.txt.indexOf(tm.sum) >= 0, 'écart somme des événements ≠ payoutMultiplier : message affiché (« ' + tm.sum.slice(0, 50) + '… »)');
  ok(Math.abs(tm.win - tamp.payoutMultiplier / 100) < 1e-9 && Math.abs(tm.bal - wallet(mt)) < 1e-6, 'écart : le montant du RGS est crédité (' + tm.win + '×), solde = solde RGS');
  await done(s);

  // ---- écrans d'erreur de session : ERR_IS, ERR_ATE, ERR_LOC, ERR_MAINTENANCE (au lancement et en cours de jeu) ----
  var codes = [['ERR_IS', 'errIs'], ['ERR_ATE', 'errAte'], ['ERR_LOC', 'errLoc'], ['ERR_MAINTENANCE', 'errMaint']];
  for (i = 0; i < codes.length; i++) {
    var me2 = mockRgs.create({ seed: 40 + i }); me2.set({ fail: { '/wallet/authenticate': codes[i][0] } });
    s = await open(me2, '');
    var eb = await s.p.evaluate("({vis:!document.getElementById('rgsBlock').hidden, msg:document.getElementById('rgsBlockM').textContent, want:I18N.rgs()['" + codes[i][1] + "'], dis:document.getElementById('spin').disabled, blocked:G.S.blocked, btn:document.getElementById('rgsBlockB').textContent})");
    ok(eb.vis && eb.dis && eb.blocked && eb.msg === eb.want && eb.msg.length > 15 && eb.btn.length > 0, codes[i][0] + ' à l\'authentification : écran de blocage « ' + eb.msg.slice(0, 48) + '… »');
    if (process.env.SHOTS && i < 2) {
      for (var vp = 0; vp < 2; vp++) {
        var dim = vp ? { width: 390, height: 844 } : { width: 1280, height: 720 };
        await s.p.setViewportSize(dim); await s.p.waitForTimeout(250);
        await s.p.screenshot({ path: path.join(process.env.SHOTS, 'rgs-' + codes[i][0] + '-' + dim.width + 'x' + dim.height + '.png') });
      }
    }
    await done(s);
  }
  var mp = mockRgs.create({ seed: 50 }); s = await open(mp, '');
  mp.set({ fail: { '/wallet/play': 'ERR_IS' } });
  await clk(s.p, '#spin'); await s.p.waitForTimeout(600);
  var pb = await s.p.evaluate("({vis:!document.getElementById('rgsBlock').hidden, msg:document.getElementById('rgsBlockM').textContent, want:I18N.rgs().errIs, busy:G.S.busy})");
  ok(pb.vis && pb.msg === pb.want && !pb.busy, 'ERR_IS pendant le jeu : écran de blocage (session perdue), plus aucune mise possible');
  await done(s);

  // ---- mode social et devise fournis par le RGS (config.jurisdiction.socialCasino, balance.currency) ----
  var ms = mockRgs.create({ seed: 60, social: true, currency: 'XSC' }); s = await open(ms, '');
  var so = await s.p.evaluate("({soc:SOCIAL.active, cur:G.currency, attr:document.documentElement.getAttribute('data-social'), bal:document.getElementById('bal').textContent, locked:G.S.curLocked, bets:G.BETS.length})");
  ok(so.soc && so.attr === 'true' && so.cur === 'XSC' && /SC/.test(so.bal) && !/\$/.test(so.bal) && so.locked && so.bets === 12, 'social : SOCIAL.set(config.jurisdiction.socialCasino), devise XSC du solde RGS verrouillée (« ' + so.bal + ' »)');
  await done(s);
  // ---- [77] / E1 : écran d'accueil et mention « démo / argent fictif » ----
  // social signalé UNIQUEMENT par config.jurisdiction.socialCasino (pas de ?social=true) : l'écran d'accueil est rafraîchi après l'authentification ;
  // en session RGS (réelle ou sociale) ni « Démo · argent fictif / pièces fictives » sur l'écran d'accueil ni « Argent fictif — démo… » dans les règles
  var WORDS_DEMO = /d[ée]mo|fictif|money|argent|pièces|coins|play money/i;
  for (var spi = 0; spi < 2; spi++) {
    var msp = mockRgs.create({ seed: 70 + spi, social: spi === 0, currency: spi === 0 ? 'XSC' : 'USD' }); s = await open(msp, '&splash=1');
    var spl = await s.p.evaluate("({hidden:document.getElementById('splash') ? document.getElementById('splash').hidden : null, soc:SOCIAL.active, param:/social=true/.test(location.search), demo:document.getElementById('spDemo').textContent, sub:document.getElementById('spSub').textContent, want:I18N.t().splashDemo})");
    ok(spl.hidden === false && !spl.param && spl.soc === (spi === 0) && spl.demo.length > 0 && !WORDS_DEMO.test(spl.demo) && spl.demo === spl.want.split(' · ').pop(), '[77] E1 session RGS ' + (spi === 0 ? 'sociale (config.jurisdiction.socialCasino seul)' : 'non sociale') + ' : écran d\'accueil sans « démo / argent fictif » (« ' + spl.demo + ' »)');
    await clk(s.p, '#btnInfo'); await s.p.waitForTimeout(200);
    var inf = await s.p.evaluate("({sub:Array.prototype.map.call(document.querySelectorAll('#modalBody .sub'),function(e){return e.textContent}).join(' | '), demo:I18N.t().demo})");
    ok(inf.sub.indexOf(inf.demo) < 0 && !WORDS_DEMO.test(inf.sub), '[77] E1 session RGS : pas de « ' + inf.demo + ' » en tête des règles');
    await done(s);
  }
  // démo locale (sans RGS) : la mention reste affichée
  var dctx = await b.newContext({ viewport: { width: 1280, height: 720 } }), dp = await dctx.newPage();
  await dp.goto(gurl + '?splash=1&lang=en'); await dp.waitForTimeout(700);
  var dm = await dp.evaluate("({demo:document.getElementById('spDemo').textContent, want:I18N.t().splashDemo + ' · ' + I18N.t().demoBuild})");
  ok(dm.demo === dm.want && /demo/i.test(dm.demo), '[77] E1 démo locale (hors RGS) : « ' + dm.demo + ' » reste affiché');
  await dctx.close();
  var mj = mockRgs.create({ seed: 61, currency: 'JPY', balance: 100000 * MICRO, betLevels: [100, 200, 500, 1000].map(function (x) { return x * MICRO; }), defaultBetLevel: 100 * MICRO }); s = await open(mj, '');
  var jp = await s.p.evaluate("({cur:G.currency, bal:document.getElementById('bal').textContent, bet:document.getElementById('bet').textContent, bets:G.BETS.slice()})");
  ok(jp.cur === 'JPY' && /¥/.test(jp.bal) && jp.bets.join() === '100,200,500,1000', 'JPY : devise du RGS, niveaux de mise du RGS conservés (aucune conversion locale) : ' + jp.bal + ' / ' + jp.bet);
  // [E2] plafonds de perte à l'échelle de la devise du RGS (plus petite mise 100 ¥ = 0,20 en unités de base : ×500) : jamais « ¥20 / ¥50 » pour une mise de ¥200
  await clk(s.p, '#btnInfo'); await s.p.waitForTimeout(200);
  var lim = await s.p.evaluate("Array.prototype.map.call(document.querySelectorAll('#optLimit button'), function(b){ return b.textContent.replace(/[^0-9]/g, ''); })");
  ok(lim.slice(1).join() === '10000,25000,50000,125000,250000' && /^\D*$/.test(lim[0]), '[E2] JPY : plafonds de perte mis à l\'échelle des niveaux de mise du RGS (' + lim.join(' / ') + ')');
  await s.p.evaluate("document.querySelectorAll('#optLimit button')[1].click()"); await s.p.waitForTimeout(150);
  ok((await s.p.evaluate('G.S.limit')) === 10000, '[E2] JPY : plafond choisi appliqué à S.limit (10 000 ¥)');
  await done(s);

  // ---- erreurs du RGS : ERR_IPB -> message, pas de blocage ----
  var me = mockRgs.create(); s = await open(me);
  await s.p.evaluate("G.S.balance = 5000; G.updateHud()");   // l'écran croit avoir plus que le serveur : le serveur répond ERR_IPB
  me.set({ balance: 0 });
  await clk(s.p, '#spin'); await s.p.waitForTimeout(1200);
  var ipb = await s.p.evaluate("({busy:G.S.busy, msg:document.getElementById('statusText').textContent, bal:G.S.balance})");
  ok(!ipb.busy && /insuffisant/i.test(ipb.msg) && ipb.bal === 0, 'ERR_IPB : message « ' + ipb.msg + ' », solde resynchronisé (/wallet/balance), jeu non bloqué');
  await done(s);

  // ---- deux onglets de jeu en mode RGS : le second est bloqué derrière un message, « Jouer ici » reprend la main ----
  var mt = mockRgs.create(), st1 = await open(mt), pgB = await st1.ctx.newPage();
  pgB.on('pageerror', function (e) { allErrs.push(e.message); });
  await pgB.goto(gurl + '?debug&lang=fr&sessionID=' + mt.state.sessionID + '&rgs_url=' + encodeURIComponent('http://localhost:' + mt.server.address().port)); await pgB.waitForTimeout(800);
  var tabA = await st1.p.evaluate("!!(document.getElementById('tabBlock') && !document.getElementById('tabBlock').hidden)");
  var tabB = await pgB.evaluate("!!(document.getElementById('tabBlock') && !document.getElementById('tabBlock').hidden)");
  ok(!tabA && tabB, 'deux onglets RGS : le premier joue, le second est bloqué par un avertissement');
  await pgB.evaluate('G.play()'); await pgB.waitForTimeout(150);
  ok(plays(mt).length === 0 && !(await pgB.evaluate('G.S.busy')), 'onglet inactif : aucune mise envoyée');
  await clk(pgB, '#tabBlockB'); await pgB.waitForTimeout(300); await st1.p.waitForTimeout(300);
  ok(await pgB.evaluate("document.getElementById('tabBlock').hidden") && await st1.p.evaluate("!document.getElementById('tabBlock').hidden"), '« Jouer ici » : la main passe au second onglet, le premier se bloque');
  await pgB.close(); await st1.p.waitForTimeout(300);
  ok(await st1.p.evaluate("document.getElementById('tabBlock').hidden"), 'onglet actif fermé : l\'autre se débloque tout seul');
  await done(st1);

  // ---- ERR_GLE : plafond de jeu du serveur -> message, plus de mise un moment, mémorisé après rechargement ----
  var mg = mockRgs.create(); mg.set({ gle: true }); s = await open(mg);
  await clk(s.p, '#spin'); await s.p.waitForTimeout(900);
  var gl = await s.p.evaluate('({busy:G.S.busy, gle:G.S.gle>0})');
  ok(!gl.busy && gl.gle && plays(mg).length === 1, 'ERR_GLE : jeu non bloqué, plafond mémorisé');
  await s.p.evaluate("document.getElementById('modalClose').click()");
  mg.set({ gle: false }); await clk(s.p, '#spin'); await s.p.waitForTimeout(400);
  ok(plays(mg).length === 1 && await s.p.evaluate("!document.getElementById('modal').hidden"), 'ERR_GLE : aucune nouvelle mise pendant l\'attente (message affiché)');
  await s.p.reload(); await s.p.waitForTimeout(800);
  ok(await s.p.evaluate('G.S.gle > 0'), 'ERR_GLE : toujours en vigueur après rechargement');
  await done(s);

  ok(allErrs.length === 0, 'aucune erreur de page' + (allErrs.length ? ' : ' + allErrs.slice(0, 3).join(' | ') : ''));
  await b.close(); server.close();
  console.log('budget : ' + mockRgs.draws() + ' books tirés + ' + mockRgs.rounds() + ' tours joués (/wallet/play) ; limite : 1000 au total');
  console.log(fails ? '\n' + fails + ' échec(s)' : '\ntout est bon');
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.log(e); process.exit(1); });
