// Test des gestes des bonus (choix de profil, guidage, pronostic, sceaux, charge) : jouer au hasard ne doit jamais bloquer ni lever d'erreur.
// Usage : PLAYWRIGHT_CORE=... CHROMIUM=... node tools/gestures.js   (serveur statique sur le port 8765, ou STATIC_PORT)
var pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
var port = process.env.STATIC_PORT || 8765, fails = 0;
function ok(c, m) { console.log((c ? 'ok     ' : 'ÉCHEC  ') + m); if (!c) fails++; }
(async function () {
  var b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM, args: ['--no-sandbox'] });
  for (var kind of ['scarab', 'weigh', 'vault']) {
    for (var prof = 0; prof < 3; prof++) {
      var p = await b.newPage({ viewport: { width: 900, height: 800 } }), errs = [];
      p.on('pageerror', function (e) { errs.push(e.message); }); p.on('console', function (m) { if (m.type() === 'error') errs.push(m.text()); });
      await p.goto('http://localhost:' + port + '/index.html?debug'); await p.waitForTimeout(700);
      await p.evaluate('window.__done=false; G.testBonus("' + kind + '",1,false).then(function(){window.__done=true}); G.speed=3; 0');
      await p.waitForTimeout(3000);
      await p.keyboard.press('Digit' + (prof + 1));            // choix du profil au clavier
      var t0 = Date.now(), done = false;
      while (Date.now() - t0 < 120000 && !done) {
        await p.mouse.click(150 + Math.random() * 600, 250 + Math.random() * 300);
        await p.waitForTimeout(160);
        done = await p.evaluate('window.__done');
      }
      ok(done && errs.length === 0, kind + ' / profil ' + (prof + 1) + ' : bonus terminé sans blocage' + (errs.length ? ' — ' + errs[0] : ''));
      await p.close();
    }
  }
  await b.close();
  console.log(fails ? '\n' + fails + ' échec(s)' : '\ntout est bon'); process.exit(fails ? 1 : 0);
})();
