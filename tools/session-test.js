// node tools/session-test.js — session persistée (limite de perte, temps), deux onglets (événement storage), file de fenêtres. Mêmes variables que e2e.js. ~10 tours.
var http = require('http'), fs = require('fs'), path = require('path');
var pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
var root = path.join(__dirname, '..'), fails = 0;
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };
function ok(c, m) { if (!c) { fails++; console.log('ÉCHEC  ' + m); } else console.log('ok     ' + m); }
var server = http.createServer(function (req, res) {
  var f = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (f.indexOf(root) !== 0 || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
(async function () {
  await new Promise(function (r) { server.listen(0, r); });
  var url = 'http://localhost:' + server.address().port + '/index.html?debug', errs = [];
  var b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--no-sandbox', '--use-gl=swiftshader'] });
  // session persistée (limite de perte, temps), deux onglets, file de fenêtres — contexte neuf, ~10 tours
  var FIN = '(async()=>{G.turbo=true;G.ultra=true;G.speed=6;var g=0;while(G.S.busy&&g<6000){await G.advance(0.25);g++;if(G.winOv)G.skipWinOv();}return !G.S.busy})()';
  var c2 = await b.newContext({ viewport: { width: 1280, height: 720 } }), q = await c2.newPage();
  q.on('pageerror', function (e) { errs.push(e.message); });
  await q.goto(url); await q.waitForTimeout(500);
  await q.evaluate("document.getElementById('btnInfo').click()");
  await q.evaluate("document.querySelectorAll('#optLimit button')[1].click()");
  await q.evaluate("document.getElementById('modalClose').click()");
  await q.evaluate('G.S.bi=9;G.updateHud();0');
  for (var li = 0; li < 12 && !(await q.evaluate('G.S.limitHit')); li++) { await q.evaluate('G.play();0'); await q.evaluate(FIN); }
  var start0 = await q.evaluate("JSON.parse(sessionStorage.getItem('anubis_sess_v1')).start");
  ok(await q.evaluate('G.S.limitHit') && !!(await q.evaluate("localStorage.getItem('anubis_sess_v1')")), 'limite de perte atteinte : session écrite dans sessionStorage et localStorage');
  await q.reload(); await q.waitForTimeout(500);
  ok(await q.evaluate('G.S.limitHit') && await q.evaluate("JSON.parse(sessionStorage.getItem('anubis_sess_v1')).start") === start0, 'rechargement : limite toujours atteinte, début de session conservé (pas de contournement)');
  await q.evaluate('G.play();0'); await q.waitForTimeout(150);
  ok(await q.evaluate("!document.getElementById('modal').hidden"), 'rechargement : la mise est refusée avec la fenêtre de limite');
  await q.evaluate("document.getElementById('modalClose').click()");
  var q2 = await c2.newPage(); q2.on('pageerror', function (e) { errs.push(e.message); }); await q2.goto(url); await q2.waitForTimeout(500);
  ok(await q2.evaluate('G.S.limitHit'), 'nouvel onglet : la limite reste atteinte (localStorage)');
  await q2.evaluate("document.getElementById('btnInfo').click()");
  await q2.evaluate("document.querySelectorAll('#optLimit button')[0].click()");
  await q2.evaluate("document.getElementById('modalClose').click()");
  var bb0 = await q.evaluate('G.S.balance');
  await q2.evaluate('G.S.bi=3;G.updateHud();G.play();0'); await q2.evaluate(FIN); await q2.waitForTimeout(300);
  var bb1 = await q.evaluate('G.S.balance'), bb2 = await q2.evaluate('G.S.balance');
  ok(bb1 === bb2, 'deux onglets : le solde de l\'autre onglet est repris sans écraser (' + bb0 + ' -> ' + bb1 + ')');
  ok(await q.evaluate('G.S.limit') === 0 && !(await q.evaluate('G.S.limitHit')), 'deux onglets : le réglage de limite (dernier écrivain) est repris');
  // file de fenêtres : un rappel arrivant pendant que « Infos » est ouverte attend sa fermeture (au lieu de la remplacer)
  await q.evaluate("G.SESS.lastCheck = Date.now() - 31 * 60000; G.S.bi = 0; G.updateHud(); document.getElementById('btnInfo').click(); 0");
  var h0 = await q.evaluate("document.querySelector('#modalBody h2').textContent");
  await q.evaluate('G.play();0'); await q.evaluate(FIN); await q.waitForTimeout(1000);
  ok(await q.evaluate("document.querySelector('#modalBody h2').textContent") === h0 && !(await q.evaluate("document.getElementById('modal').hidden")), 'rappel des 30 min pendant les Infos : la fenêtre ouverte n\'est pas remplacée');
  await q.evaluate("document.getElementById('modalClose').click()"); await q.waitForTimeout(700);
  ok(await q.evaluate("!document.getElementById('modal').hidden && document.querySelector('#modalBody h2').textContent") === (await q.evaluate('I18N.t().realityTitle')), 'rappel des 30 min : affiché dès la fermeture de la fenêtre précédente');
  await q.evaluate("document.getElementById('modalClose').click()");
  ok(errs.length === 0, 'aucune erreur console / page' + (errs.length ? ' : ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); server.close();
  console.log(fails ? '\n' + fails + ' échec(s)' : '\ntout est bon'); process.exit(fails ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(2); });
