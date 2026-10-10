// node tools/layout.js — balayage de tailles d'écran : la roue ne doit ni passer sous le HUD, ni être coupée, ni trop petite ;
// pas de défilement horizontal ; le HUD ne mange pas l'écran. Mêmes variables d'environnement que e2e.js. Sortie 1 si défaut.
var http = require('http'), fs = require('fs'), path = require('path');
var pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core'), root = path.join(__dirname, '..');
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };
var SIZES = [[360, 640], [390, 844], [768, 1024], [844, 390], [667, 375], [740, 360], [1024, 768], [1440, 810], [1920, 1080], [2560, 1080]];
var server = http.createServer(function (req, res) {
  var f = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (f.indexOf(root) !== 0 || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
(async function () {
  await new Promise(function (r) { server.listen(0, r); });
  var url = 'http://localhost:' + server.address().port + '/index.html?debug', fails = 0;
  var b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--no-sandbox', '--use-gl=swiftshader'] });
  for (var i = 0; i < SIZES.length; i++) {
    var w = SIZES[i][0], h = SIZES[i][1], land = h < 520 && w > h;
    var p = await b.newPage({ viewport: { width: w, height: h } }), errs = [];
    p.on('pageerror', function (e) { errs.push(e.message); });
    await p.goto(url); await p.waitForTimeout(500);
    var m = await p.evaluate(`(function(){ var hud=document.getElementById('hud').getBoundingClientRect();
      return { R:G.R, top:G.cy-1.2*G.R, bot:G.cy+1.1*G.R, left:G.cx-1.1*G.R, right:G.cx+1.1*G.R, hudTop:hud.top, hudH:hud.height, sw:document.documentElement.scrollWidth, iw:innerWidth }; })()`);
    // les trois bonus « à plateau » se lancent et se terminent sans erreur à cette taille (la géométrie fine se vérifie à l'œil)
    var sc = await p.evaluate(`(async()=>{ var bad=[]; G.turbo=true; G.speed=1.6;
      for (var k of ['scarab','weigh','vault']) { G.testBonus(k,1,false); await G.advance(3.2);
        var s=G.scene; if(!s) { bad.push(k+':pas de scène'); continue; }
        var gg=0; while(G.scene && gg<400){ await G.advance(0.5); gg++; if(G.winOv) G.skipWinOv(); if(G.scene&&G.scene.tap) G.scene.tap(); } if(G.scene) bad.push(k+':bloquée'); }
      return bad; })()`).catch(function (e) { return ['exception ' + e.message]; });
    var pr = [];
    if (m.bot > m.hudTop + 1) pr.push('roue sous le HUD (' + Math.round(m.bot) + ' > ' + Math.round(m.hudTop) + ')');
    if (m.top < 0) pr.push('roue coupée en haut');
    if (m.left < 0 || m.right > w) pr.push('roue coupée sur les côtés');
    if (m.sw > m.iw) pr.push('défilement horizontal');
    if (m.hudH > h * (land ? 0.25 : 0.45)) pr.push('HUD trop haut (' + Math.round(m.hudH) + ' px sur ' + h + ')');
    if (m.R < (land ? 100 : 120)) pr.push('roue trop petite (R=' + Math.round(m.R) + ')');
    if (sc.length) pr.push('bonus : ' + sc.join(', '));
    if (errs.length) pr.push('erreur: ' + errs[0]);
    if (pr.length) fails++;
    console.log((pr.length ? 'ÉCHEC  ' : 'ok     ') + (w + 'x' + h).padEnd(10) + ' R=' + Math.round(m.R) + ' HUD=' + Math.round(m.hudH) + 'px' + (pr.length ? '  ' + pr.join('; ') : ''));
    await p.close();
  }
  await b.close(); server.close();
  console.log(fails ? '\n' + fails + ' taille(s) en défaut' : '\ntoutes les tailles passent'); process.exit(fails ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(2); });
