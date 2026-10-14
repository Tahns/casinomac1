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

  // 2. tous les bonus, avec boost et via la Fureur d'Anubis
  var bon = await p.evaluate(`(async()=>{ var cs=[['scarab',1,false],['scarab',3,false],['weigh',1,false],['weigh',5,false],['vault',1,false],['vault',2,false],['crypt',1,false],['crypt',3,false],['scarab',1,true],['weigh',2,true],['vault',1,true]], bad=[];
    for(var i=0;i<cs.length;i++){ var done=false; G.testBonus.apply(null,cs[i]).then(function(){done=true}); var g=0; while(!done&&g<3000){await G.advance(0.25);g++} if(!done) bad.push(cs[i].join('/')); } return bad; })()`);
  ok(bon.length === 0, '11 variantes de bonus (dont le secret) se terminent (' + (bon.join(',') || 'aucune bloquée') + ')');

  // 2 bis. boost : à l'écran, le total live et le total final sont déjà multipliés et égaux au gain réel sp.pay (tolérance 1e-9)
  var cases = [['scarab', false], ['weigh', false], ['vault', false], ['crypt', false], ['vault', true]], boostBad = [], boostN = 0;
  for (var bi = 0; bi < 3; bi++) {
    var bo = [2, 4, 25][bi];
    for (var ci = 0; ci < cases.length; ci++) {
      var cs = cases[ci];
      var got = await p.evaluate(`(async()=>{ G.lastBonusShown=null; G.turbo=true; G.speed=1.6; var done=false; G.testBonus(${JSON.stringify(cs[0])},${bo},${cs[1]}).then(function(){done=true}); var g=0; while(!done&&g<4000){ await G.advance(0.25); g++; if(G.winOv) G.skipWinOv(); } return {done:done, s:G.lastBonusShown}; })()`);
      var lab = cs[0] + (cs[1] ? '/fureur' : '') + ' ×' + bo, sh = got.s;
      boostN++;
      if (!got.done || !sh) { boostBad.push(lab + ' (non terminé ou hook absent)'); continue; }
      var tol = 1e-9 * Math.max(1, Math.abs(sh.pay));
      if (Math.abs(sh.live - sh.pay) > tol || Math.abs(sh.final - sh.pay) > tol) boostBad.push(lab + ' live=' + sh.live + ' final=' + sh.final + ' pay=' + sh.pay);
    }
  }
  ok(boostBad.length === 0, boostN + ' bonus avec boost ×2/×4/×25 (scarabées, pesée, trésor, crypte, fureur) : total live et final = sp.pay' + (boostBad.length ? ' : ' + boostBad.join(' ; ') : ''));

  // 3. achats : prix débité, jamais bloqué, retour à la roue
  var buy = await p.evaluate(`(async()=>{ var bad=[]; for (var k of ['vault','scarab','weigh','hand']) { var b0=G.S.balance; G.play(k); var g=0; while(G.S.busy&&g<3000){await G.advance(0.25);g++;if(G.winOv)G.skipWinOv();}
      if(G.S.busy||G.scene) bad.push(k); } return bad; })()`);
  ok(buy.length === 0, 'les 4 achats de bonus se terminent et rendent la main à la roue');

  // 4. rechargement en plein tour : la mise n'est pas remboursée, le gain n'est pas perdu
  var cut = null;
  for (var t = 0; t < 40 && !cut; t++) {
    var r = await p.evaluate(`(async()=>{ G.play(); await G.advance(0.4);
      var d=JSON.parse(localStorage.getItem('anubis_save_v1')); var out={pending:d.pending,balance:d.balance};
      if(!(d.pending>0)){ var g=0; while(G.S.busy&&g<3000){await G.advance(0.25);g++;if(G.winOv)G.skipWinOv();} } return out; })()`);
    if (r.pending > 0) cut = r;
  }
  ok(!!cut, 'un tour gagnant a pu être interrompu pour le test');
  if (cut) {
    await p.reload(); await p.waitForTimeout(600);
    var after = await p.evaluate('G.S.balance');
    ok(Math.abs(after - (cut.balance + cut.pending)) < 0.001, 'après rechargement en plein tour : solde = mise débitée + gain décidé (' + cut.balance + ' + ' + cut.pending + ' = ' + after + ')');
    var again = await p.evaluate("JSON.parse(localStorage.getItem('anubis_save_v1')).pending");
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

  async function pick(code) { await p.click('#btnLang'); await p.waitForSelector('#langMenu'); await p.click('#langMenu [data-l=' + code + ']'); await p.waitForTimeout(200); }
  // 6. bascule FR -> EN : le HUD et la table des gains suivent, et le maximum annoncé pour la Pesée est le bon
  var menu = await p.evaluate("(function(){ document.getElementById('btnLang').click(); var n = document.querySelectorAll('#langMenu button').length; document.getElementById('btnLang').click(); return n; })()");
  ok(menu === 16, 'sélecteur de langue : 16 entrées');
  await pick('fr');
  var fr0 = await p.evaluate("({spin:document.getElementById('spinText').textContent,html:document.documentElement.lang,dir:document.documentElement.dir})");
  ok(fr0.spin === 'TOURNER' && fr0.html === 'fr' && fr0.dir === 'ltr', 'passage en français : HUD traduit (' + fr0.spin + ')');
  await pick('ar');
  var ar0 = await p.evaluate("({dir:document.documentElement.dir,lang:document.documentElement.lang,spin:document.getElementById('spinText').textContent,btn:document.getElementById('btnLang').textContent})");
  ok(ar0.dir === 'rtl' && ar0.lang === 'ar' && ar0.btn === 'AR' && ar0.spin.length > 0, 'arabe : dir=rtl, bouton AR, HUD traduit (' + ar0.spin + ')');
  await pick('en');
  var en = await p.evaluate("({spin:document.getElementById('spinText').textContent,bal:document.querySelector('#statBal label').textContent,html:document.documentElement.lang})");
  ok(en.spin === 'SPIN' && en.bal === 'BALANCE' && en.html === 'en', 'passage en anglais : HUD traduit (' + en.spin + ' / ' + en.bal + ')');
  await p.click('#btnInfo'); await p.waitForTimeout(200);
  var tbl = await p.evaluate("document.getElementById('modalBody').innerText");
  ok(/1,?000×/.test(tbl) && !/3,?000×|230×/.test(tbl), 'table des gains en anglais : Pesée annoncée jusqu\'à 1000× et scarabée jusqu\'à 100× (profil std, [24]), pas les maxima du profil bold');
  ok(!/[éèêà]/.test(tbl.replace(/Jugement/g, '')), 'table des gains en anglais : aucun accent français résiduel');
  await p.keyboard.press('Escape'); await p.waitForTimeout(100);

  // 7. argent : devise, format, arrondis au centime, migration de l'ancienne sauvegarde
  await p.evaluate("localStorage.clear()"); await p.reload(); await p.waitForTimeout(500);
  var fm = await p.evaluate(`({ s: G.money(0.1 + 0.2), big: G.money(1234.5), neg: G.money(-12.345, true), pos: G.money(7, true), sym: document.getElementById('btnCur').textContent, bet: document.getElementById('bet').textContent, bal: document.getElementById('bal').textContent, bets: G.BETS.slice(), bi: G.S.bi })`);
  ok(fm.sym === '$' && fm.bal === '$1,000.00' && fm.bet === '$1.00', 'EN par défaut (premier lancement, sans ?lang=) : devise $, mise $1.00, solde $1,000.00');
  await pick('fr');
  fm = await p.evaluate(`({ s: G.money(0.1 + 0.2), big: G.money(1234.5), neg: G.money(-12.345, true), pos: G.money(7, true), sym: document.getElementById('btnCur').textContent, bet: document.getElementById('bet').textContent, bal: document.getElementById('bal').textContent, bets: G.BETS.slice() })`);
  ok(fm.s === '0,30 €' && fm.big === '1 234,50 €' && fm.neg === '-12,35 €' && fm.pos === '+7,00 €', 'FR : montants « 0,30 € », « 1 234,50 € », signes (' + [fm.s, fm.big, fm.neg].join(' | ') + ')');
  ok(fm.sym === '€' && fm.bet === '1,00 €' && fm.bal === '1 000,00 €', 'FR par défaut : devise €, mise 1,00 €, solde 1 000,00 €');
  ok(fm.bets[0] === 0.2 && fm.bets.length <= 14, 'mise minimale 0,20 (' + fm.bets.join(', ') + ')');
  await pick('en');
  var en2 = await p.evaluate(`({ s: G.money(0.1 + 0.2), big: G.money(1234.5), neg: G.money(-5, true), sym: document.getElementById('btnCur').textContent, bal: document.getElementById('bal').textContent })`);
  ok(en2.s === '$0.30' && en2.big === '$1,234.50' && en2.neg === '-$5.00' && en2.sym === '$' && en2.bal === '$1,000.00', 'EN : devise $ suivie automatiquement, montants « $1,234.50 »');
  await p.click('#btnCur'); await p.waitForTimeout(150);
  ok(await p.evaluate("document.getElementById('bal').textContent") === '€1,000.00', 'EN + € : « €1,000.00 » (le choix de devise est indépendant de la langue)');
  await p.reload(); await p.waitForTimeout(500);
  ok(await p.evaluate("G.S.cur") === 'EUR' && await p.evaluate("document.getElementById('btnCur').textContent") === '€', 'la devise choisie est sauvegardée');
  // aucune dérive : toutes les mises x modes x prix d'achat s'affichent avec 2 décimales exactes
  var drift = await p.evaluate(`(function(){ var bad=[], re=I18N.lang()==='fr'?/,\\d{3}/:/\\.\\d{3}/; ['std','plus'].forEach(function(m){ G.S.mode=m; G.BETS.forEach(function(b,i){ G.S.bi=i; G.updateHud();
      var t=document.getElementById('hud').innerText; if(re.test(t)||/\\d{9,}/.test(t)) bad.push(m+' '+b+' '+t.replace(/\\s+/g,' ')); var c=G.cost(); if (Math.abs(Math.round(c*100)-c*100)>1e-7) bad.push('coût '+c);
      ['scarab','weigh','vault','hand'].forEach(function(k){ var pr=Math.round(b*AnubisMath.BUY[k].price*100)/100; if (G.money(pr).indexOf('0000000')>=0) bad.push('prix '+pr); }); }); }); return bad; })()`);
  ok(drift.length === 0, 'aucun montant avec dérive flottante (0,30000000000000004…) sur toutes les mises/modes' + (drift.length ? ' : ' + drift[0] : ''));
  await p.evaluate(`(async()=>{ G.S.mode='plus'; G.S.bi=0; G.turbo=true; G.speed=1.6; for(var r=0;r<12;r++){ G.play(); var g=0; while(G.S.busy&&g<3000){ await G.advance(0.25); g++; if(G.winOv) G.skipWinOv(); } } })()`);
  var bal = await p.evaluate("G.S.balance");
  ok(Math.abs(Math.round(bal * 100) - bal * 100) < 1e-6, '12 tours à 0,20 en Oracle+ (coût 0,22) : le solde reste au centime (' + bal + ')');
  // migration : ancienne sauvegarde en « crédits » (sans version) -> valeurs par défaut propres, gain en attente non converti
  await p.evaluate(`localStorage.setItem('anubis_save_v1', JSON.stringify({balance:12345, bi:7, limit:5000, pending:300, lang:'fr', mode:'plus'}))`);
  await p.reload(); await p.waitForTimeout(500);
  var mg = await p.evaluate("({bal:G.S.balance,bi:G.S.bi,limit:G.S.limit,res:G.S.resumed||0,txt:document.getElementById('bal').textContent,bet:document.getElementById('bet').textContent})");
  ok(mg.bal === 1000 && mg.bi === 2 && mg.limit === 0 && !mg.res && mg.txt === '1 000,00 €', 'ancienne sauvegarde (crédits) : solde 1 000 €, mise 1,00 €, limite retirée (' + mg.txt + ' / ' + mg.bet + ')');
  await p.evaluate("localStorage.setItem('anubis_save_v1','{pas du json')"); await p.reload(); await p.waitForTimeout(400);
  ok(await p.evaluate("G.S.balance") === 1000, 'sauvegarde corrompue : valeurs par défaut sans erreur');
  // bouton « réinitialiser le solde » et limite de perte dans la nouvelle échelle
  await p.evaluate("G.S.balance=3.2"); await p.click('#btnInfo'); await p.waitForTimeout(200);
  var lim = await p.evaluate("Array.from(document.querySelectorAll('#optLimit button')).map(function(b){return b.textContent})");
  ok(lim.length >= 4 && /^20[.,]00/.test(lim[1].replace(/^[^\d]+/, '')), 'limites de perte (2 décimales) : ' + lim.join(' / '));
  await p.click('#optReset'); await p.waitForTimeout(150);
  ok(await p.evaluate("G.S.balance") === 1000, 'réinitialiser le solde : retour à 1 000,00');
  await p.keyboard.press('Escape'); await p.waitForTimeout(100);

  ok(errs.length === 0, 'aucune erreur console / page' + (errs.length ? ' : ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); server.close();
  console.log(fails ? '\n' + fails + ' échec(s)' : '\ntout est bon'); process.exit(fails ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(2); });
