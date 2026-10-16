// node tools/conformite.js — vérifications du comportement réel des directives Stake Engine côté front (docs/CHECKLIST_51.md), Playwright + faux RGS.
//  - fenêtre non défilable, zoom désactivé (meta, touch-action, pincement, double toucher, gestes), barre d'espace, autoplay et modes coûteux confirmés,
//  - langue invalide sans effet, URL RGS invalide, règles (RTP, gain max, modes, avertissement, guide), coupure du son, sous-centimes,
//  - replay (vue popout S, coût de la mise, multiplicateur, rejouer), utilisabilité à 640×360 et 400×300 (Popout), mobile portrait / paysage,
//  - « ancien mobile » : 360×640, CPU ralenti ×4 (CDP) : poids, nombre de fichiers, temps de chargement, erreurs console.
// Variables : PLAYWRIGHT_CORE, CHROMIUM, SHOTS (dossier de captures), ANUBIS_POOL (24 par défaut). Au plus une dizaine de tours joués au total.
process.env.ANUBIS_POOL = process.env.ANUBIS_POOL || '24';
var http = require('http'), fs = require('fs'), path = require('path');
var pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
var mockRgs = require('./mock-rgs');
var root = path.join(__dirname, '..'), fails = 0, MICRO = 1000000, SHOTS = process.env.SHOTS || '';
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };
function ok(c, m) { if (!c) { fails++; console.log('ÉCHEC  ' + m); } else console.log('ok     ' + m); }
var server = http.createServer(function (req, res) {
  var f = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (f.indexOf(root) !== 0 || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
var FINISH = `(async()=>{ G.turbo=true; G.speed=1.6; var g=0; while(G.S.busy&&g<6000){ await G.advance(0.25); g++; if(G.winOv) G.skipWinOv(); if(g%10===0) await new Promise(function(r){setTimeout(r,8)}); } return !G.S.busy; })()`;
var VPS = {
  desktop: { name: 'desktop 1280×720', viewport: { width: 1280, height: 720 } },
  portrait: { name: 'mobile portrait 390×844', viewport: { width: 390, height: 844 }, mobile: true },
  landscape: { name: 'mobile paysage 844×390', viewport: { width: 844, height: 390 }, mobile: true },
  popoutL: { name: 'Popout 640×360', viewport: { width: 640, height: 360 } },
  popoutS: { name: 'Popout 400×300', viewport: { width: 400, height: 300 } },
  old: { name: 'ancien mobile 360×640 CPU×4', viewport: { width: 360, height: 640 }, mobile: true, cpu: 4 }
};

(async function () {
  await new Promise(function (r) { server.listen(0, r); });
  var gorigin = 'http://localhost:' + server.address().port;
  var mock = mockRgs.create({ seed: 5 }), mport = await mock.listen(0), morigin = 'http://localhost:' + mport;
  var plays = function (m) { return (m || mock).state.log.filter(function (l) { return l.path === '/wallet/play'; }); };
  var b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--no-sandbox', '--use-gl=swiftshader'] });
  var errs = [];
  async function open(vp, qs, o) {
    o = o || {};
    var ctx = await b.newContext({ viewport: vp.viewport, isMobile: !!vp.mobile, hasTouch: !!vp.mobile, deviceScaleFactor: vp.mobile ? 2 : 1 }), p = await ctx.newPage(), my = [];
    p.on('pageerror', function (e) { my.push('pageerror ' + e.message); });
    p.on('console', function (m) { if (m.type() === 'error' && !(o.allowNet && /Failed to load resource|ERR_|net::/.test(m.text()))) my.push('console ' + m.text()); });
    p.__errs = my; p.__ctx = ctx;
    var cdp = null;
    if (vp.cpu) { cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: vp.cpu }); }
    p.__cdp = cdp;
    var t0 = Date.now(); p.__bytes = 0; p.__files = 0;
    p.on('response', async function (r) { try { p.__files++; var h = r.headers(); p.__bytes += +(h['content-length'] || 0) || (await r.body()).length; } catch (e) {} });
    await p.goto(gorigin + '/index.html' + qs, { waitUntil: 'load' });
    p.__load = Date.now() - t0;
    return p;
  }
  var sess = function (extra) { return '?debug&lang=en&sessionID=test-session&rgs_url=' + encodeURIComponent(morigin) + (extra || ''); };
  async function close(p) { errs = errs.concat(p.__errs.map(function (e) { return (p.__tag || '') + e; })); await p.__ctx.close(); }
  async function shot(p, name) { if (SHOTS) { try { await p.screenshot({ path: path.join(SHOTS, name + '.png') }); } catch (e) {} } }

  // ============ A. par format d'écran ============
  for (var key of Object.keys(VPS)) {
    var vp = VPS[key], p = await open(vp, sess()); p.__tag = key + ' : ';
    await p.waitForFunction('window.G && G.S && G.S.blocked === false', null, { timeout: 30000 });
    await p.waitForTimeout(600);
    var tag = vp.name + ' : ';
    // fenêtre non défilable
    var sc = await p.evaluate(`(function(){ var d=document.documentElement, se=document.scrollingElement; scrollTo(0,80); scrollTo(80,0); var r={ sh:se.scrollHeight>innerHeight+1, sw:se.scrollWidth>innerWidth+1, y:scrollY, x:scrollX, bsh:document.body.scrollHeight>innerHeight+1, ofy:getComputedStyle(d).overflowY, ofb:getComputedStyle(document.body).overflowY }; return r; })()`);
    for (var kk of ['PageDown', 'End', 'ArrowDown', 'Home']) await p.keyboard.press(kk);
    await p.mouse.move(100, 100); await p.mouse.wheel(0, 600); await p.waitForTimeout(150);
    var sc2 = await p.evaluate('({y:scrollY,x:scrollX,bal:G.S.balance})');
    ok(!sc.sh && !sc.sw && !sc.bsh && sc.y === 0 && sc.x === 0 && sc2.y === 0 && sc2.x === 0 && sc.ofy === 'hidden', tag + 'fenêtre principale non défilable (scrollHeight ≤ hauteur, scrollTo / touches / molette sans effet)');
    // zoom
    var zm = await p.evaluate(`(function(){ var m=document.querySelector('meta[name=viewport]').content, cs=function(e){return getComputedStyle(e).touchAction};
      var ev=function(t,tgt){ var e=new Event(t,{bubbles:true,cancelable:true}); (tgt||document).dispatchEvent(e); return e.defaultPrevented; };
      var wh=new WheelEvent('wheel',{ctrlKey:true,bubbles:true,cancelable:true,deltaY:-100}); window.dispatchEvent(wh);
      return { meta:m, html:cs(document.documentElement), body:cs(document.body), stage:cs(document.getElementById('stage')), gs:ev('gesturestart'), gc:ev('gesturechange'), dbl:ev('dblclick',document.getElementById('stage')), wheel:wh.defaultPrevented }; })()`);
    ok(/user-scalable=no/.test(zm.meta) && /maximum-scale=1\b/.test(zm.meta) && /initial-scale=1/.test(zm.meta), tag + 'meta viewport sans zoom : ' + zm.meta);
    ok(zm.html === 'pan-x pan-y' && zm.body === 'pan-x pan-y' && zm.stage === 'none', tag + 'touch-action : html « ' + zm.html + ' », body « ' + zm.body + ' », canvas « ' + zm.stage + ' »');
    ok(zm.gs && zm.gc && zm.dbl && zm.wheel, tag + 'gesturestart / gesturechange / double-clic / Ctrl+molette : annulés');
    if (vp.mobile) {
      var cdp = p.__cdp || await p.__ctx.newCDPSession(p);
      await cdp.send('Input.synthesizePinchGesture', { x: vp.viewport.width / 2, y: vp.viewport.height / 3, scaleFactor: 2.5, relativeSpeed: 600 }).catch(function () {});
      await p.waitForTimeout(300);
      await p.touchscreen.tap(vp.viewport.width / 2, 60); await p.waitForTimeout(60); await p.touchscreen.tap(vp.viewport.width / 2, 60); await p.waitForTimeout(300);
      var vv = await p.evaluate('({s:visualViewport.scale, w:visualViewport.width, iw:innerWidth})');
      ok(vv.s === 1 && Math.abs(vv.w - vv.iw) < 1, tag + 'pincement 2,5× et double toucher : échelle du viewport = ' + vv.s);
    }
    // contrôles utilisables : dans l'écran, non recouverts
    var ctl = await p.evaluate(`(function(){ var bad=[]; ['betDn','betUp','spin','btnTurbo','btnAuto','btnBuy','btnPlus','btnLang','btnSound','btnInfo'].forEach(function(id){ var e=document.getElementById(id); if(!e||e.hidden) return; var r=e.getBoundingClientRect(); if(r.width<8||r.height<8||r.left<-1||r.top<-1||r.right>innerWidth+1||r.bottom>innerHeight+1){ bad.push(id+' hors écran'); return; } var t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); if(t!==e&&!e.contains(t)) bad.push(id+' recouvert par '+(t&&(t.id||t.className||t.tagName))); }); return bad; })()`);
    ok(ctl.length === 0, tag + 'tous les contrôles visibles et non recouverts' + (ctl.length ? ' : ' + ctl.join(', ') : ''));
    // un clic réel sur « tourner » envoie une requête de jeu
    var n0 = plays().length;
    if (vp.mobile) await p.touchscreen.tap(...(await p.evaluate(`(function(){var r=document.getElementById('spin').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`)));
    else await p.mouse.click(...(await p.evaluate(`(function(){var r=document.getElementById('spin').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`)));
    await p.waitForTimeout(500);
    ok(plays().length === n0 + 1, tag + 'un appui réel sur le bouton de jeu envoie une requête /wallet/play (' + (plays().length - n0) + ')');
    await shot(p, key + '-jeu');
    ok(await p.evaluate(FINISH), tag + 'tour joué jusqu\'au bout'); await p.waitForTimeout(300);
    // fenêtre Infos : le contenu défile dans la fenêtre, la page non
    await p.evaluate("document.getElementById('btnInfo').click()"); await p.waitForTimeout(400);
    var inf = await p.evaluate(`(function(){ var s=document.querySelector('#modal .sheet'), r=s.getBoundingClientRect(); s.scrollTop=300; return { inside:r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1, st:s.scrollTop, sh:s.scrollHeight>s.clientHeight, y:scrollY, close:(function(){var c=document.getElementById('modalClose').getBoundingClientRect();return c.right<=innerWidth&&c.top>=0})() }; })()`);
    ok(inf.inside && inf.sh && inf.st > 0 && inf.y === 0 && inf.close, tag + 'règles : la fenêtre tient dans l\'écran, défile en interne (' + inf.st + ' px), bouton Fermer atteignable, page immobile');
    await shot(p, key + '-regles');
    if (key === 'desktop') {
      // contenu des règles (RTP, gain max, coût et description des modes, gains par case, avertissement, guide)
      var rt = await p.evaluate('document.getElementById("modalBody").innerText');
      ok(/RTP/.test(rt) && /9[56][.,]\d\s?%/.test(rt), tag + 'règles : RTP chiffré de chaque mode');
      ok(/25[ ,.  ]?000\s?×/.test(rt) || /25[,.\s  ]?000×/.test(rt), tag + 'règles : gain maximal 25 000×');
      ok(/Malfunction voids all wins and plays/.test(rt), tag + 'règles : clause « Malfunction voids all wins and plays »');
      ok(/Oracle\+/i.test(rt) && /×\s?1[.,]1/.test(rt) && /Vault|Scarab|Weigh/i.test(rt), tag + 'règles : coût et description des modes (Standard, Oracle+, achats)');
      ok(/\b0\.5×|×0\.5|0\.5×/.test(rt) && /×3\b|3×/.test(rt) || /1 \/ 4/.test(rt), tag + 'règles : gains par case (table des cases)');
      ok(/SPIN/.test(rt) && /AUTO/.test(rt) && /TURBO/.test(rt) && /Space/i.test(rt), tag + 'règles : guide d\'interaction (SPIN, AUTO, TURBO, barre d\'espace)');
      ok(!/demo|play money|fictitious/i.test(rt), tag + 'règles : aucune mention de démo en session RGS');
    }
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    if (key === 'old') {
      var nav = await p.evaluate(`(function(){ var n=performance.getEntriesByType('navigation')[0]; return { dcl:Math.round(n.domContentLoadedEventEnd), load:Math.round(n.loadEventEnd), res:performance.getEntriesByType('resource').length, enc:performance.getEntriesByType('resource').reduce(function(a,r){return a+(r.transferSize||r.encodedBodySize||0)},0) }; })()`);
      var fps = await p.evaluate(`new Promise(function(res){ var n=0,t0=performance.now(); (function f(){ n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else res(Math.round(n/2)); })(); })`);
      console.log('mesure  ' + tag + 'DOMContentLoaded ' + nav.dcl + ' ms, load ' + nav.load + ' ms, jusqu\'au jeu prêt (auth RGS comprise) ' + p.__load + ' ms+, ' + nav.res + ' fichiers, ' + (nav.enc / 1024).toFixed(0) + ' Ko, ' + fps + ' images/s (CPU ×4, SwiftShader)');
      ok(nav.load < 20000 && nav.res <= 80, tag + 'chargement < 20 s à CPU ×4 (' + nav.load + ' ms) et ≤ 80 fichiers (' + nav.res + ')');
    }
    ok(p.__errs.length === 0, tag + '0 erreur console / JS' + (p.__errs.length ? ' : ' + p.__errs.slice(0, 2).join(' | ') : ''));
    await close(p);
  }

  // ============ B. clavier : barre d'espace ============
  var d = await open(VPS.desktop, sess()); d.__tag = 'espace : ';
  await d.waitForFunction('window.G && G.S && G.S.blocked === false', null, { timeout: 30000 }); await d.waitForTimeout(500);
  var n1 = plays().length, bi0 = await d.evaluate('G.S.bi');
  for (var kc of ['KeyA', 'Escape', 'Tab', 'ShiftLeft', 'KeyM', 'Digit1']) await d.keyboard.press(kc);
  await d.keyboard.press('ArrowUp'); await d.keyboard.press('ArrowDown');
  await d.waitForTimeout(300);
  ok(plays().length === n1 && (await d.evaluate('G.S.bi')) === bi0, 'espace : les autres touches (lettres, Échap, Tab, flèches haut/bas) ne lancent aucun tour (flèches : mise seulement)');
  await d.evaluate('document.activeElement && document.activeElement.blur()');
  await d.keyboard.press('Space'); await d.waitForTimeout(500);
  ok(plays().length === n1 + 1, 'espace : la barre d\'espace envoie une requête de jeu (/wallet/play)');
  // touche maintenue : un seul tour
  await d.evaluate(FINISH); await d.waitForTimeout(300);
  var n2 = plays().length;
  await d.keyboard.down('Space'); for (var rp = 0; rp < 8; rp++) { await d.keyboard.down('Space'); await d.waitForTimeout(30); } await d.keyboard.up('Space'); await d.waitForTimeout(400);
  ok(plays().length === n2 + 1, 'espace : touche maintenue (répétitions) = un seul tour (' + (plays().length - n2) + ')');
  await d.evaluate(FINISH); await d.waitForTimeout(300);
  // avec une fenêtre ouverte, l'espace ne joue pas
  await d.evaluate("document.getElementById('btnInfo').click()"); await d.waitForTimeout(300);
  var n3 = plays().length; await d.keyboard.press('Space'); await d.waitForTimeout(300);
  ok(plays().length === n3, 'espace : fenêtre ouverte (règles) = aucun tour');
  await d.keyboard.press('Escape'); await d.waitForTimeout(300);

  // ============ C. autoplay et modes à coût élevé ============
  var n4 = plays().length;
  await d.evaluate("document.getElementById('btnAuto').click()"); await d.waitForTimeout(350);
  var ap = await d.evaluate("({go:!!document.getElementById('apGo'), busy:G.S.busy, auto:G.S.auto})");
  ok(ap.go && !ap.busy && ap.auto === 0 && plays().length === n4, 'autoplay : AUTO ouvre un panneau de confirmation, aucun tour ni requête avant « Démarrer »');
  await d.keyboard.press('Space'); await d.waitForTimeout(300);
  ok(plays().length === n4 && (await d.evaluate('G.S.auto')) === 0, 'autoplay : la barre d\'espace dans le panneau ne démarre pas l\'autoplay');
  await d.evaluate("document.getElementById('apCancel').click()"); await d.waitForTimeout(300);
  await d.evaluate("document.getElementById('btnBuy').click()"); await d.waitForTimeout(300);
  await d.evaluate("document.querySelectorAll('.buyCard')[1].click()"); await d.waitForTimeout(250);
  ok(await d.evaluate("!!document.getElementById('buyYes')") && plays().length === n4, 'achat de bonus : confirmation (Annuler / Confirmer) avant toute requête');
  await d.evaluate("document.getElementById('buyNo').click()"); await d.waitForTimeout(250);
  await d.evaluate("document.getElementById('btnPlus').click()"); await d.waitForTimeout(250);
  ok(await d.evaluate("!!document.getElementById('plusYes')") && (await d.evaluate('G.S.mode')) === 'std' && plays().length === n4, 'Oracle+ : confirmation avant activation, mode inchangé et aucune requête avant « Confirmer »');
  await d.evaluate("document.getElementById('plusYes').click()"); await d.waitForTimeout(250);
  ok((await d.evaluate('G.S.mode')) === 'plus', 'Oracle+ : activé après Confirmer');
  // Oracle+ n'est pas rétabli au rechargement
  await d.evaluate('G.S.mode = "plus"; document.getElementById("btnPlus").click(); document.getElementById("plusYes").click(); 0'); await d.waitForTimeout(200);
  await d.reload({ waitUntil: 'load' }); await d.waitForFunction('window.G && G.S && G.S.blocked === false', null, { timeout: 30000 });
  ok((await d.evaluate('G.S.mode')) === 'std', 'Oracle+ : jamais réactivé au rechargement (le joueur doit reconfirmer)');

  // ============ D. coupure du son ============
  await d.evaluate("document.getElementById('btnSound').click()"); await d.waitForTimeout(300);
  var snd = await d.evaluate("({vis:!document.getElementById('mixer').hidden, mute:!!document.getElementById('mxMute')})");
  await d.evaluate("document.getElementById('mxMute').click()"); await d.waitForTimeout(100);
  var muted = await d.evaluate('Sfx.isMuted()');
  await d.evaluate("document.getElementById('mxMute').click()");
  ok(snd.vis && snd.mute && muted === true && (await d.evaluate('Sfx.isMuted()')) === false, 'son : le bouton haut-parleur ouvre le mixeur, « couper le son » coupe et rétablit');

  // ============ E. devises et gains sous-centime ============
  var cur = await d.evaluate(`({ a:CUR.format(0.005,'USD'), b:CUR.format(0.0005,'USD'), c:CUR.format(0.05,'USD'), j:CUR.format(0.5,'JPY'), e:CUR.format(1.005,'EUR',{lang:'fr'}), x:CUR.format(0.005,'XSC'), z:CUR.format(0,'USD'), big:CUR.format(25000000,'USD') })`);
  ok(cur.a === '$0.005' && cur.b === '$0.0005' && cur.c === '$0.05' && cur.j === '¥0.5' && cur.z === '$0.00' && cur.x === '0.005 SC', 'sous-centime : 0,005 $ → « ' + cur.a + ' », 0,0005 → « ' + cur.b + ' », 0,5 ¥ → « ' + cur.j + ' », 0,005 SC → « ' + cur.x + ' », jamais « $0.00 »');
  d.__tag = 'espace : '; ok(d.__errs.length === 0, 'clavier / autoplay / achats : 0 erreur console' + (d.__errs.length ? ' : ' + d.__errs[0] : ''));
  await close(d);

  // ============ F. langue invalide, URL RGS invalide ============
  for (var lq of ['xx', '', '%00', '%3Cscript%3E', 'EN-us', 'e', 'frfrfr']) {
    var lp = await open(VPS.desktop, '?debug&lang=' + lq + '&sessionID=test-session&rgs_url=' + encodeURIComponent(morigin)); lp.__tag = 'lang=' + lq + ' : ';
    await lp.waitForTimeout(600);
    var ln = await lp.evaluate('({l:document.documentElement.lang, i:I18N.lang(), dir:document.documentElement.dir})');
    ok(ln.l === 'en' && ln.i === 'en' && ln.dir === 'ltr' && lp.__errs.length === 0, '?lang=' + lq + ' (invalide) : sans effet, anglais conservé (' + ln.i + ')');
    await close(lp);
  }
  var okl = await open(VPS.desktop, '?debug&lang=fr&sessionID=test-session&rgs_url=' + encodeURIComponent(morigin)); await okl.waitForTimeout(500);
  ok((await okl.evaluate('I18N.lang()')) === 'fr', '?lang=fr (valide) : appliqué'); await close(okl);
  for (var bad of ['notaurl', 'ftp://x.example', 'javascript:alert(1)', 'http://', 'http://localhost:1', 'https://invalid.invalid']) {
    var bp = await open(VPS.desktop, '?debug&lang=en&sessionID=test-session&rgs_url=' + encodeURIComponent(bad), { allowNet: true }); bp.__tag = 'rgs_url=' + bad + ' : ';
    await bp.waitForFunction('(function(){var e=document.getElementById("rgsBlock");return e&&!e.hidden})()', null, { timeout: 20000 }).catch(function () {});
    var bs = await bp.evaluate(`(function(){ var e=document.getElementById('rgsBlock'); return { vis:!!e&&!e.hidden, txt:e?e.innerText:'', blocked:G.S.blocked, spinDis:document.getElementById('spin').disabled, busy:G.S.busy }; })()`);
    var nb = plays().length; await bp.keyboard.press('Space'); await bp.waitForTimeout(250);
    ok(bs.vis && bs.blocked && bs.spinDis && bs.txt.length > 20 && plays().length === nb && !bs.busy, 'rgs_url invalide « ' + bad + ' » : échec propre (« ' + bs.txt.replace(/\s+/g, ' ').trim().slice(0, 70) + ' »), jeu bloqué, Espace sans effet');
    await close(bp);
  }
  // sans RGS (build de développement, aucun paramètre) : la démo locale ne contacte aucun serveur ; le build Stake affiche « Lancez le jeu depuis Stake » (tools/stake-build-test.js)
  var sr = []; var nr = await open(VPS.desktop, '?debug&lang=en'); nr.on('request', function (q) { sr.push(q.url()); });
  await nr.waitForTimeout(500); ok((await nr.evaluate('G.S.balance')) > 0 && sr.every(function (u) { return u.indexOf(gorigin) === 0 || /^data:/.test(u); }), 'sans RGS (dev) : aucune requête vers un serveur externe'); await close(nr);

  // ============ G. replay ============
  async function rpl(vp, qs, name) {
    var p = await open(vp, '?replay=true&game=anubis&version=1&lang=en&rgs_url=' + encodeURIComponent(morigin) + qs); p.__tag = name + ' : ';
    await p.waitForFunction('window.Replay && (Replay.state()==="ready"||Replay.state()==="error")', null, { timeout: 30000 });
    return p;
  }
  var w0 = mock.state.log.filter(function (l) { return /^\/wallet\//.test(l.path); }).length;
  var rr = await rpl(VPS.popoutS, '&mode=bonus_vault&event=1&currency=EUR&amount=5000000', 'replay 400×300');
  var ri = await rr.evaluate(`({ st:Replay.state(), bet:document.getElementById('rpBet').innerText, sub:document.getElementById('rpSub').innerText, go:(function(){var r=document.getElementById('rpGo').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.right<=innerWidth&&r.left>=0})(), sy:scrollY, hud:document.getElementById('spin').offsetParent===null })`);
  ok(ri.st === 'ready' && /5[.,]00/.test(ri.bet) && /€|EUR/.test(ri.bet) && /×\s?\d/.test(ri.sub + ri.bet) && ri.go, 'replay Popout S : montant 5,00 € et coût réel × multiplicateur affichés (« ' + ri.bet.replace(/\s+/g, ' ') + ' | ' + ri.sub.replace(/\s+/g, ' ') + ' »), bouton Lecture dans la fenêtre');
  await shot(rr, 'replay-popoutS');
  ok(await rr.evaluate("document.getElementById('spin').offsetParent===null && document.getElementById('btnAuto').offsetParent===null && document.getElementById('betUp').offsetParent===null"), 'replay : bouton de jeu, autoplay et mises masqués');
  await rr.keyboard.press('KeyA'); await rr.keyboard.press('ArrowUp'); await rr.waitForTimeout(150);
  ok((await rr.evaluate('Replay.state()')) === 'ready', 'replay : les autres touches n\'ont aucun effet');
  await rr.click('#rpGo'); await rr.waitForFunction('Replay.state()==="done"', null, { timeout: 240000 });
  var rd = await rr.evaluate("({txt:document.getElementById('rpGo').innerText, res:document.getElementById('rpResV').innerText})");
  ok(rd.txt.length > 0 && rd.res.length > 0, 'replay : fini, résultat « ' + rd.res + ' », bouton « ' + rd.txt + ' » pour rejouer');
  await rr.click('#rpGo'); await rr.waitForFunction('Replay.state()==="playing"', null, { timeout: 5000 });
  ok(true, 'replay : rejouer une fois fini relance le même événement');
  await rr.waitForFunction('Replay.state()==="done"', null, { timeout: 240000 });
  ok(mock.state.log.filter(function (l) { return /^\/wallet\//.test(l.path); }).length === w0, 'replay : aucun appel /wallet');
  await close(rr);
  var r2 = await rpl(VPS.popoutL, '&mode=plus&event=3&currency=USD&amount=2000000&lang=xx', 'replay lang invalide');
  ok((await r2.evaluate('I18N.lang()')) === 'en', 'replay : ?lang= invalide sans effet (anglais)');
  await close(r2);
  var r3 = await rpl(VPS.portrait, '&mode=std&event=2&currency=USD&social=true&amount=1000000', 'replay social');
  var so = await r3.evaluate("document.body.innerText + ' ' + document.getElementById('rpBet').innerText");
  ok(!/\$/.test(so) && /SC|GC/.test(so), 'replay social : jetons SC / GC, jamais « $ »');
  await close(r3);
  var r4 = await open(VPS.desktop, '?replay=true&game=anubis&lang=en&rgs_url=' + encodeURIComponent(morigin)); r4.__tag = 'replay sans paramètres : ';
  await r4.waitForTimeout(800);
  ok((await r4.evaluate('Replay.state()')) === 'error' && (await r4.evaluate("document.getElementById('rpMsg').innerText.length")) > 5, 'replay : paramètres manquants -> message d\'erreur, aucune lecture');
  await close(r4);

  // ============ H. bilan ============
  ok(errs.length === 0, '0 erreur console / JS au total' + (errs.length ? ' : ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); server.close(); mock.close();
  console.log(fails ? '\n' + fails + ' échec(s)' : '\ntout est bon'); process.exit(fails ? 1 : 0);
})().catch(function (e) { console.log('ÉCHEC  ' + (e && e.stack || e)); process.exit(1); });
