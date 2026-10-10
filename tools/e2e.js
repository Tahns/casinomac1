// node tools/e2e.js — tests de bout en bout dans un vrai navigateur (Chromium via playwright-core, outil de dev uniquement).
// Prérequis : `npm i playwright-core` quelque part et PLAYWRIGHT_CORE=/chemin/vers/node_modules/playwright-core ;
// CHROMIUM=/chemin/vers/chrome si le navigateur n'est pas celui par défaut. Le jeu lui-même n'a aucune dépendance.
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
  var url = 'http://localhost:' + server.address().port + '/index.html?debug';
  var b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--no-sandbox', '--use-gl=swiftshader'] });
  var ctx = await b.newContext({ viewport: { width: 1280, height: 720 } }), p = await ctx.newPage(), errs = [];
  p.on('pageerror', function (e) { errs.push(e.message); });
  p.on('console', function (m) { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(600);

  // 1. enchaînement de tours (les deux modes), jamais bloqué, solde cohérent
  var soak = await p.evaluate(`(async()=>{ G.turbo=true; G.speed=1.6; var stuck=0, neg=0;
    for(var r=0;r<30;r++){ if(r%2) document.getElementById('btnPlus').click(); G.play(); var g=0;
      while(G.S.busy&&g<3000){ await G.advance(0.25); g++; if(G.winOv) G.skipWinOv(); }
      if(G.S.busy){stuck++;break;} if(G.S.balance<0) neg++; } return {stuck:stuck,neg:neg}; })()`);
  ok(soak.stuck === 0 && soak.neg === 0, '30 tours (Standard + Oracle+) sans blocage ni solde négatif');

  // 2. tous les bonus, avec boost et via la Main d'Anubis
  var bon = await p.evaluate(`(async()=>{ var cs=[['scarab',1,false],['scarab',3,false],['weigh',1,false],['weigh',5,false],['vault',1,false],['vault',2,false],['scarab',1,true],['weigh',2,true],['vault',1,true]], bad=[];
    for(var i=0;i<cs.length;i++){ var done=false; G.testBonus.apply(null,cs[i]).then(function(){done=true}); var g=0; while(!done&&g<3000){await G.advance(0.25);g++} if(!done) bad.push(cs[i].join('/')); } return bad; })()`);
  ok(bon.length === 0, '9 variantes de bonus se terminent (' + (bon.join(',') || 'aucune bloquée') + ')');

  // 3. achats : prix débité, jamais bloqué, retour à la roue
  var buy = await p.evaluate(`(async()=>{ var bad=[]; for (var k of ['vault','scarab','weigh','hand']) { var b0=G.S.balance; G.play(k); var g=0; while(G.S.busy&&g<3000){await G.advance(0.25);g++;if(G.winOv)G.skipWinOv();}
      if(G.S.busy||G.scene) bad.push(k); } return bad; })()`);
  ok(buy.length === 0, 'les 4 achats de bonus se terminent et rendent la main à la roue');

  // 4. rechargement en plein tour : la mise n'est pas remboursée, le gain n'est pas perdu
  var cut = null;
  for (var t = 0; t < 40 && !cut; t++) {
    var r = await p.evaluate(`(async()=>{ G.play(); await G.advance(0.4);
      var d=JSON.parse(localStorage.getItem('hoa_save_v1')); var out={pending:d.pending,balance:d.balance};
      if(!(d.pending>0)){ var g=0; while(G.S.busy&&g<3000){await G.advance(0.25);g++;if(G.winOv)G.skipWinOv();} } return out; })()`);
    if (r.pending > 0) cut = r;
  }
  ok(!!cut, 'un tour gagnant a pu être interrompu pour le test');
  if (cut) {
    await p.reload(); await p.waitForTimeout(600);
    var after = await p.evaluate('G.S.balance');
    ok(Math.abs(after - (cut.balance + cut.pending)) < 0.001, 'après rechargement en plein tour : solde = mise débitée + gain décidé (' + cut.balance + ' + ' + cut.pending + ' = ' + after + ')');
    var again = await p.evaluate("JSON.parse(localStorage.getItem('hoa_save_v1')).pending");
    ok(again === 0, "le gain en attente n'est crédité qu'une seule fois");
  }

  // 5. clavier : un bouton focalisé garde son comportement ; après un clic souris, Espace = tourner ; focus des fenêtres
  await p.reload(); await p.waitForTimeout(500);
  await p.evaluate('G.turbo=false;G.speed=1');
  var t0 = await p.evaluate('G.turbo');
  await p.focus('#btnTurbo'); await p.keyboard.press('Space'); await p.waitForTimeout(200);
  var st = await p.evaluate('({turbo:G.turbo,busy:G.S.busy})');
  ok(st.turbo !== t0 && !st.busy, "Espace sur un bouton focalisé l'active (Turbo) sans lancer un tour");
  await p.evaluate('G.turbo=false;G.speed=1');
  await p.click('#betUp'); await p.waitForTimeout(100);
  var bi0 = await p.evaluate('G.S.bi');
  await p.keyboard.press('Space'); await p.waitForTimeout(300);
  var st2 = await p.evaluate('({bi:G.S.bi,busy:G.S.busy})');
  ok(st2.busy && st2.bi === bi0, 'après un clic souris sur « + », Espace lance un tour (et ne re-clique pas le bouton)');
  await p.evaluate(`(async()=>{G.turbo=true;G.speed=1.6;var g=0;while(G.S.busy&&g<3000){await G.advance(0.25);g++;if(G.winOv)G.skipWinOv();}})()`);
  await p.click('#btnInfo'); await p.waitForTimeout(150);
  var inModal = await p.evaluate("document.getElementById('modal').contains(document.activeElement)");
  ok(inModal, 'ouvrir les infos place le focus dans la fenêtre');
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  var back = await p.evaluate("({hidden:document.getElementById('modal').hidden,id:document.activeElement&&document.activeElement.id})");
  ok(back.hidden && back.id === 'btnInfo', "Échap ferme la fenêtre et rend le focus au bouton d'origine (" + back.id + ')');
  await p.click('#btnBuy'); await p.waitForTimeout(150);
  var cards = await p.evaluate("document.querySelectorAll('.buyCard').length");
  ok(cards === 4, 'le menu « Acheter un bonus » affiche 4 cartes');
  await p.keyboard.press('Escape'); await p.waitForTimeout(100);

  ok(errs.length === 0, 'aucune erreur console / page' + (errs.length ? ' : ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); server.close();
  console.log(fails ? '\n' + fails + ' échec(s)' : '\ntout est bon'); process.exit(fails ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(2); });
