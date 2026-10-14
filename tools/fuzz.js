// node tools/fuzz.js — fuzzer de flux dans un vrai navigateur : joue des centaines de tours aléatoires (tours normaux, achats de bonus,
// bonus forcés de chaque type, auto-play, turbo/ultra, mises extrêmes, solde insuffisant, limite de perte) en leur infligeant des
// perturbations (rechargement, langue, devise, redimensionnement, onglet caché, gel du thread, mixeur, muet, fenêtres, doubles clics,
// Espace/chiffres/clics au hasard) puis vérifie des invariants à chaque fin de tour :
//   - aucune erreur console / page ;
//   - jamais bloqué (S.busy repasse à false) ; scène, apparition d'Anubis, overlay de gain et fondu remis à zéro ;
//   - solde cohérent au centime : solde = solde initial - mises + gains (recalculés ici, indépendamment de main.js), gain crédité une seule fois,
//     y compris après un rechargement en plein tour (gain en attente) ;
//   - aucun setInterval résiduel (thèmes audio), aucun écouteur clavier résiduel ;
//   - vitesse revenue à 1 / turbo cohérent, turbo coupé après un bonus ; bouton SPIN actif ; HUD = solde.
// Usage : PLAYWRIGHT_CORE=/chemin/playwright-core [CHROMIUM=/chemin/chrome] node tools/fuzz.js
//   FUZZ_SEED=123 (graine, défaut : aléatoire, affichée)  FUZZ_ROUNDS=100 (tours au total, jamais plus de 1000)  FUZZ_PER_EPISODE=25 (tours par session)  FUZZ_VERBOSE=1
// Reproduire un échec : relancer avec la même FUZZ_SEED (le journal des actions est affiché sous chaque échec).
var http = require('http'), fs = require('fs'), path = require('path');
var pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
var root = path.join(__dirname, '..');
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };
var SEED = +(process.env.FUZZ_SEED || Math.floor(Math.random() * 1e9)), ROUNDS = Math.min(1000, +(process.env.FUZZ_ROUNDS || 100)), PER = +(process.env.FUZZ_PER_EPISODE || 25), VERBOSE = !!process.env.FUZZ_VERBOSE;
var T0 = Date.now(), MAX_MS = (+(process.env.FUZZ_MAX_SECONDS || 90)) * 1000;   // chaque exécution reste sous 100 s : au-delà on s'arrête proprement (résultat partiel signalé)
function late() { return Date.now() - T0 > MAX_MS; }

function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
var rnd = mulberry32(SEED);
function pick(a) { return a[Math.floor(rnd() * a.length)]; }
function chance(p) { return rnd() < p; }
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

var server = http.createServer(function (req, res) {
  var f = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (f.indexOf(root) !== 0 || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});

// instrumentation injectée avant les scripts du jeu : suivi des setInterval et des écouteurs clavier de window
var INIT = `(function(){
  window.__iv = new Set(); var si = window.setInterval, ci = window.clearInterval;
  window.setInterval = function(f, ms){ var id = si.apply(window, arguments); window.__iv.add(id); return id; };
  window.clearInterval = function(id){ window.__iv.delete(id); return ci.call(window, id); };
  window.__kd = []; var ae = EventTarget.prototype.addEventListener, re = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener = function(t, fn, o){ if (t === 'keydown' && (this === window || this === document)) { var cap = typeof o === 'object' ? !!(o && o.capture) : !!o; window.__kd.push({ tg: this === window ? 'w' : 'd', fn: fn, cap: cap }); } return ae.apply(this, arguments); };
  EventTarget.prototype.removeEventListener = function(t, fn, o){ if (t === 'keydown' && (this === window || this === document)) { var cap = typeof o === 'object' ? !!(o && o.capture) : !!o; var tg = this === window ? 'w' : 'd'; for (var i = 0; i < window.__kd.length; i++) if (window.__kd[i].fn === fn && window.__kd[i].cap === cap && window.__kd[i].tg === tg) { window.__kd.splice(i, 1); break; } } return re.apply(this, arguments); };
  window.__vis = false;
  Object.defineProperty(document, 'hidden', { configurable: true, get: function(){ return window.__vis; } });
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: function(){ return window.__vis ? 'hidden' : 'visible'; } });
})();`;

// crochets dans la page : enregistrent chaque tour tiré (pour recalculer les gains indépendamment de main.js) et fabriquent des tours forcés
var HOOKS = `(function(){
  var M = AnubisMath, r2 = G.r2, rng = M.cryptoRng(); window.__rounds = []; window.__force = null; window.__tc = 0; document.getElementById('btnTurbo').addEventListener('click', function () { window.__tc++; }); window.__kd0 = window.__kd.length;
  var oPR = M.playRound, oPB = M.playBuy;
  function rec(round, cost) { window.__rounds.push({ round: round, bet: G.bet, cost: cost, after: G.S.balance }); return round; }
  function forced(mode) {
    var sp = window.__force, md = M.MODES[mode] || M.MODES.std, spins = [], s, n = 0, i, ak = M.LAYOUT.indexOf('ankh');
    for (i = 0; i < (sp.ankh || 0); i++) spins.push({ oracle: null, index: ak, kind: 'ankh', boost: 1, bonus: null, base: 0, pay: 0 });
    do { s = M.playSpin(rng, md.oracle); n++; } while (!(s.kind === sp.base && !s.upgraded && !s.secret) && n < 20000);
    if (sp.kind === 'hand') { s.options = M.handOptions(rng); s.bonus = s.options.turq; s.profile = 'turq'; s.upgraded = true; }
    else if (sp.kind === 'crypt') { s.options = undefined; s.bonus = M._bonus.crypt(rng); s.profile = 'crypt'; s.secret = true; }
    s.base = s.bonus.total; s.boost = sp.boost > 1 ? sp.boost : 1; s.oracle = s.boost > 1 ? { kind: s.kind, boost: s.boost } : null; s.pay = s.base * s.boost;
    spins.push(s); var t = 0; spins.forEach(function (x) { t += x.pay; });
    return { spins: spins, total: Math.min(t, M.MAX_WIN), capped: t > M.MAX_WIN, cost: md.cost, mode: mode };
  }
  M.playRound = function (r, mode) { var round = window.__force ? forced(mode) : oPR.call(M, r, mode); return rec(round, r2(G.bet * (M.MODES[mode] || M.MODES.std).cost)); };
  M.playBuy = function (r, kind) { var round = oPB.call(M, r, kind); return rec(round, r2(G.bet * M.BUY[kind].price)); };
  window.__payout = function (e) { var t = 0; e.round.spins.forEach(function (x) { t += x.pay; }); return r2(Math.min(t, M.MAX_WIN) * e.bet); };
  window.__hasBonus = function (e) { return e.round.spins.some(function (x) { var d = M.KINDS[x.kind] || { bonus: true }; return d.bonus; }); };
  // chaîne comptable : chaque tour débite son coût puis crédite son gain ; renvoie les écarts et le solde final attendu
  window.__ledger = function () {
    var bad = [], exp = null, i, e;
    for (i = 0; i < window.__rounds.length; i++) {
      e = window.__rounds[i];
      if (exp != null && r2(exp - e.cost) !== e.after) bad.push('tour ' + i + ' : solde après mise ' + e.after + ' ≠ ' + r2(exp - e.cost));
      exp = r2(e.after + window.__payout(e));
    }
    return { bad: bad, exp: exp, n: window.__rounds.length };
  };
})();`;

var failures = [], log = [], totals = { rounds: 0, bonus: 0, reloads: 0, perturb: 0, episodes: 0 };
function fail(ep, msg) { failures.push({ msg: msg, seed: SEED, ep: ep, log: log.slice(-14) }); console.log('ÉCHEC  [épisode ' + ep + '] ' + msg); }
function note(s) { log.push(s); if (VERBOSE) console.log('   · ' + s); }

async function main() {
  await new Promise(function (r) { server.listen(0, r); });
  var url = 'http://localhost:' + server.address().port + '/index.html?debug';
  var b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--no-sandbox', '--use-gl=swiftshader'] });
  console.log('fuzz : graine ' + SEED + ', ' + ROUNDS + ' tours, ' + PER + ' par session');
  var done = 0, ep = 0;
  while (done < ROUNDS && !late()) {
    ep++; totals.episodes++;
    var vp = pick([[1280, 720], [390, 844], [844, 390], [768, 1024], [1920, 1080], [360, 640]]);
    var ctx = await b.newContext({ viewport: { width: vp[0], height: vp[1] } }), p = await ctx.newPage(), errs = [];
    await ctx.addInitScript(INIT); ctx.setDefaultTimeout(5000);
    p.on('pageerror', function (e) { errs.push('page: ' + e.message); });
    p.on('console', function (m) { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    p.on('dialog', function (d) { d.dismiss().catch(function () {}); });
    log = []; note('épisode ' + ep + ' viewport ' + vp.join('x'));
    try {
      await p.goto(url); await p.waitForTimeout(500);
      await p.evaluate(HOOKS);
      var n = Math.min(PER, ROUNDS - done);
      for (var r = 0; r < n && !late(); r++) { await oneRound(p, ep, errs, url); done++; totals.rounds++; if (failures.length > 12) break; }
    } catch (e) { fail(ep, 'exception du fuzzer : ' + (e && e.message ? e.message.split('\n')[0] : e)); }
    await ctx.close();
    if (failures.length > 12) { console.log('trop d\'échecs, arrêt'); break; }
  }
  await b.close(); server.close();
  if (done < ROUNDS) console.log('arrêt anticipé (limite de ' + MAX_MS / 1000 + ' s) : ' + done + ' tours sur ' + ROUNDS);
  console.log('\n' + totals.rounds + ' tours (' + totals.bonus + ' avec bonus), ' + totals.episodes + ' sessions, ' + totals.perturb + ' perturbations dont ' + totals.reloads + ' rechargements');
  if (failures.length) {
    console.log('\n' + failures.length + ' échec(s) — graine ' + SEED);
    failures.slice(0, 6).forEach(function (f) { console.log('\n[épisode ' + f.ep + '] ' + f.msg + '\n   journal : ' + f.log.join(' | ')); });
  } else console.log('\ntout est bon (graine ' + SEED + ')');
  process.exit(failures.length ? 1 : 0);
}

async function ev(p, code) { return p.evaluate(code); }
// solde imposé : on déclenche aussi la sauvegarde du jeu (G.setCurrency enregistre sans rien changer), sinon le stockage garde l'ancien solde (artefact du fuzzer, pas un bug)
function forceBal(p, v) { return ev(p, 'G.S.balance=' + v + ';G.updateHud();G.setCurrency(G.currency,false);0'); }
// clic forcé (les boutons s'animent en permanence : Playwright les jugerait « instables » et attendrait 30 s) ; un clic raté n'est pas une anomalie du jeu
function fclick(p, sel, o) { return p.click(sel, Object.assign({ force: true, timeout: 2000 }, o || {})).catch(function () {}); }

// règle l'état du jeu avant un tour
async function setup(p) {
  // mode Standard / Oracle+
  var mode = chance(0.4) ? 'plus' : 'std';
  if ((await ev(p, 'G.S.mode')) !== mode) await fclick(p, '#btnPlus');
  // mise : extrêmes très fréquents
  var bi = chance(0.3) ? 0 : chance(0.2) ? 11 : Math.floor(rnd() * 12);
  await ev(p, 'G.S.bi=' + bi + ';G.updateHud();0'); note('mise ' + bi + ' mode ' + mode);
  // vitesse : normal / turbo / ultra via le bouton (arrêt -> turbo -> ultra -> arrêt)
  var want = pick([0, 1, 2, 2, 2]), cur = await ev(p, 'G.ultra?2:G.turbo?1:0');
  for (var k = (want - cur + 3) % 3; k > 0; k--) await fclick(p, '#btnTurbo');
  // solde : parfois très bas / très haut
  var bal = await ev(p, 'G.S.balance');
  if (bal < 30 || chance(0.12)) { var nb = pick([1000, 1000, 5000, 100000, 3.2, 0.2, 0.05, 0.21]); await forceBal(p, nb); note('solde ' + nb); }
  return mode;
}

async function oneRound(p, ep, errs, url) {
  await dismissModal(p);
  var mode = await setup(p);
  var act = pick(['spin', 'spin', 'spin', 'force', 'force', 'force', 'buy', 'auto', 'test', 'broke', 'limit']);
  var kinds = ['scarab', 'weigh', 'vault', 'hand', 'crypt'], hadBonus = false, isTest = false, expectNoPlay = false;
  await ev(p, '__force=null;__rounds=[];__tc=0;0');
  var bal0 = await ev(p, 'G.S.balance');
  note('action ' + act);
  if (act === 'force') {
    var kd = pick(kinds), base = pick(['scarab', 'weigh', 'vault']), boost = pick([1, 1, 1, 3, 5, 10, 50, 1000]);
    await ev(p, '__force=' + JSON.stringify({ kind: kd, base: base, boost: boost, ankh: chance(0.2) ? 1 : 0 }) + ';0'); note('bonus forcé ' + kd + '/' + base + ' x' + boost);
    await start(p);
  } else if (act === 'spin') await start(p);
  else if (act === 'buy') {
    await fclick(p, '#btnBuy', { timeout: 2000 }).catch(function () {});
    var cards = await p.$$('.buyCard:not([disabled])');
    if (cards.length) { var c = pick(cards); await c.click({ force: true, timeout: 2000 }).catch(function () {}); note('achat'); } else { note('achat impossible (solde)'); await dismissModal(p); }
  } else if (act === 'auto') {
    await fclick(p, '#btnAuto'); if (chance(0.5)) await fclick(p, '#btnAuto');
    await ev(p, '__force=' + (chance(0.5) ? JSON.stringify({ kind: pick(kinds), base: pick(['scarab', 'weigh', 'vault']), boost: 1 }) : 'null') + ';0'); await start(p);
  } else if (act === 'test') {
    // bonus lancé directement (hors flux de mise) : doit rendre la main proprement
    isTest = true; var kk = pick(kinds), bst = pick([1, 2, 5]);
    await ev(p, 'window.__tb=false;G.S.busy=true;G.testBonus(' + JSON.stringify(kk === 'hand' ? pick(['scarab', 'weigh', 'vault']) : kk === 'crypt' ? 'crypt' : kk) + ',' + bst + ',' + (kk === 'hand') + ').then(function(){window.__tb=true;G.S.busy=false});0'); note('testBonus ' + kk);
  } else if (act === 'broke') {
    // solde insuffisant : aucun débit, aucun blocage
    expectNoPlay = true; await forceBal(p, 0.1); bal0 = 0.1; await start(p); await p.waitForTimeout(150);
  } else if (act === 'limit') {
    // limite de perte déjà atteinte : le tour est refusé
    await ev(p, 'G.S.limit=20;G.S.limitHit=true;0'); expectNoPlay = true; await start(p); await p.waitForTimeout(150);
    await dismissModal(p); await ev(p, 'G.S.limit=0;G.S.limitHit=false;0');
  }
  // boucle de jeu : on fait avancer le temps et on perturbe
  var perturbLeft = chance(0.7) ? 1 + Math.floor(rnd() * 3) : 0, steps = 0, reloaded = false, idle = false, MAXS = 700;
  while (steps++ < MAXS) {
    try {
      var st = await ev(p, '({busy:G.S.busy,auto:G.S.auto,tb:window.__tb,scene:!!G.scene})');
      if (isTest ? st.tb === true : (!st.busy && st.auto === 0 && !(await ev(p, '!!G.winOv||!!G.eg')))) { idle = true; break; }
      await ev(p, 'G.advance(' + (1 + Math.floor(rnd() * 2)) + ')');
      if (chance(0.5)) await randomInput(p);
      if (perturbLeft > 0 && chance(0.08)) { perturbLeft--; totals.perturb++; var res = await perturb(p, url, ep); if (res === 'reloaded') { reloaded = true; if (isTest) isTest = false; if (!(await ev(p, 'G.S.busy'))) { idle = true; break; } } }
    } catch (e) {
      if (/Execution context|navigat|Target closed/i.test(e.message)) { await p.waitForTimeout(400); continue; }
      throw e;
    }
  }
  var errsNow = errs.splice(0);
  if (errsNow.length) fail(ep, 'erreur(s) : ' + errsNow.slice(0, 2).join(' | '));
  if (!idle) { fail(ep, 'bloqué après ' + MAXS + ' pas (S.busy=' + (await ev(p, 'G.S.busy')) + ', scène=' + (await ev(p, '!!G.scene')) + ', action ' + act + ')'); await rescue(p); return; }
  await dismissModal(p);
  await ev(p, 'G.advance(2)'); await p.waitForTimeout(120);
  // ---- invariants de fin de tour ----
  var inv = await ev(p, `(function(){ var P = [], S = G.S;
    if (S.busy) P.push('S.busy'); if (G.scene) P.push('scène non nulle'); if (G.eg) P.push('apparition en cours'); if (G.winOv) P.push('overlay de gain en cours');
    if (G.fade > 0.001) P.push('fondu noir restant ' + G.fade);
    var exp = G.ultra ? 6 : G.turbo ? 1.6 : 1; if (Math.abs(G.speed - exp) > 1e-9) P.push('vitesse ' + G.speed + ' au lieu de ' + exp);
    if (window.__iv.size) P.push(window.__iv.size + ' setInterval résiduel(s) (thème audio ?)');
    if (window.__kd.length !== window.__kd0) P.push('écouteurs clavier : ' + window.__kd.length + ' au lieu de ' + window.__kd0);
    if (!document.getElementById('oracle').hidden) P.push("bandeau Oracle encore visible");
    if (document.getElementById('spin').disabled && S.auto === 0) P.push('bouton SPIN désactivé au repos');
    if (S.pending !== 0) P.push('gain en attente non nul ' + S.pending);
    if (Math.abs(Math.round(S.balance * 100) - S.balance * 100) > 1e-6) P.push('solde hors centime ' + S.balance);
    if (S.balance < 0) P.push('solde négatif ' + S.balance);
    var sv = JSON.parse(localStorage.getItem('anubis_save_v1') || 'null'); if (!sv || sv.pending !== 0 || sv.balance !== S.balance) P.push('sauvegarde incohérente ' + JSON.stringify(sv && { p: sv.pending, b: sv.balance }) + ' vs solde ' + S.balance);
    var L = window.__ledger(); L.bad.forEach(function (x) { P.push(x); });
    return { P: P, L: L, bal: S.balance, turbo: G.turbo, hb: window.__rounds.some(window.__hasBonus), tc: window.__tc, nr: window.__rounds.length, hold: G.timers.length, tw: G.tweens.length }; })()`);
  inv.P.forEach(function (m) { fail(ep, m); });
  if (!reloaded) {
    if (expectNoPlay) { if (inv.nr !== 0 || Math.abs(inv.bal - bal0) > 1e-9) fail(ep, 'tour refusé mais le solde a bougé (' + bal0 + ' -> ' + inv.bal + ', ' + inv.nr + ' tour(s))'); }
    else if (!isTest && inv.L.n > 0 && Math.abs(inv.L.exp - inv.bal) > 1e-9) fail(ep, 'solde ' + inv.bal + ' ≠ attendu ' + inv.L.exp + ' (début ' + bal0 + ', ' + inv.L.n + ' tour(s))');
    if (!isTest && inv.hb && inv.turbo && inv.tc === 0) fail(ep, 'turbo toujours actif après un bonus');
  }
  if (inv.hb) totals.bonus++;
  // HUD : le solde affiché est le solde réel (le compteur a eu le temps de finir)
  await p.waitForTimeout(chance(0.3) ? 800 : 0);
  if (!(await ev(p, 'window.__rounds.length')) || true) {
    await p.waitForTimeout(100);
  }
  var hud = await ev(p, "({t:document.getElementById('bal').textContent,e:G.money(G.S.balance)})");
  if (hud.t !== hud.e && (await hudSettle(p))) fail(ep, 'HUD « ' + hud.t + ' » ≠ solde « ' + hud.e + ' »');
  await ev(p, 'G.S.auto=0;G.S.autoIdx=0;0');
}

// attend la fin du compteur du HUD ; renvoie true si l'écart persiste
async function hudSettle(p) {
  await p.waitForTimeout(900);
  return ev(p, "document.getElementById('bal').textContent!==G.money(G.S.balance)");
}

async function start(p) {
  var how = pick(['key', 'click', 'key', 'dbl']);
  if (how === 'key') await p.keyboard.press('Space'); else if (how === 'click') await fclick(p, '#spin'); else { await fclick(p, '#spin', { clickCount: 2, delay: 20 }); }
  note('départ ' + how);
}

async function dismissModal(p) {
  for (var i = 0; i < 3; i++) { if (await ev(p, "!document.getElementById('modal').hidden")) await p.keyboard.press('Escape'); else break; await p.waitForTimeout(40); }
  if (await ev(p, "!document.getElementById('modal').hidden")) await ev(p, "document.getElementById('modalClose').click()");
  if (await ev(p, "!document.getElementById('mixer').hidden")) await ev(p, "document.getElementById('btnSound').click()");
}

// sort d'un état bloqué pour poursuivre la session
async function rescue(p) { try { await ev(p, 'G.S.busy=false;G.S.auto=0;G.scene=null;G.eg=null;G.winOv=null;G.fade=0;0'); } catch (e) {} }

async function randomInput(p) {
  var vp = p.viewportSize(), k = pick(['space', 'space', 'digit', 'click', 'click', 'click', 'enter', 'spinbtn', 'arrow']);
  note('entrée ' + k);
  if (k === 'space') await p.keyboard.press('Space');
  else if (k === 'enter') await p.keyboard.press('Enter');
  else if (k === 'digit') await p.keyboard.press(pick(['Digit1', 'Digit2', 'Digit3']));
  else if (k === 'arrow') await p.keyboard.press(pick(['ArrowUp', 'ArrowDown']));
  else if (k === 'spinbtn') await fclick(p, '#spin', { force: true, timeout: 800 }).catch(function () {});
  else await p.mouse.click(20 + rnd() * (vp.width - 40), 60 + rnd() * (vp.height - 160));
}

async function perturb(p, url, ep) {
  var k = pick(['reload', 'reload', 'lang', 'cur', 'resize', 'resize', 'hidden', 'freeze', 'mixer', 'mute', 'music', 'pitch', 'info', 'turbo', 'plus', 'buyclick', 'betclick', 'limit', 'reset']);
  note('perturbation ' + k);
  if (k === 'reload') {
    // avant de recharger : le gain en attente enregistré doit correspondre au tour en cours (choix du joueur compris)
    var st = await ev(p, `(function(){ var e = window.__rounds[window.__rounds.length - 1], sv = JSON.parse(localStorage.getItem('anubis_save_v1') || 'null'); return { busy: G.S.busy, sv: sv && { p: sv.pending, b: sv.balance }, exp: e && G.S.busy ? window.__payout(e) : null, after: e ? e.after : null, led: window.__ledger() }; })()`);
    if (st.busy && st.exp != null) {
      if (Math.abs(st.sv.p - st.exp) > 1e-9) fail(ep, 'gain en attente enregistré ' + st.sv.p + ' ≠ gain du tour en cours ' + st.exp);
      if (Math.abs(st.sv.b - st.after) > 1e-9) fail(ep, 'solde enregistré ' + st.sv.b + ' ≠ solde après mise ' + st.after);
    }
    await p.reload(); totals.reloads++; await p.waitForTimeout(500); await p.evaluate(HOOKS);
    var af = await ev(p, "({b:G.S.balance,busy:G.S.busy,sv:JSON.parse(localStorage.getItem('anubis_save_v1')),sc:!!G.scene,fade:G.fade})");
    if (st.busy && st.sv && Math.abs(af.b - (st.sv.b + st.sv.p)) > 1e-9) fail(ep, 'après rechargement : solde ' + af.b + ' ≠ ' + st.sv.b + ' + ' + st.sv.p);
    if (af.sv && af.sv.pending !== 0) fail(ep, 'gain en attente non remis à zéro après rechargement');
    if (af.busy || af.sc) fail(ep, 'état de tour restant après rechargement');
    return 'reloaded';
  }
  if (k === 'lang') await fclick(p, '#btnLang');
  else if (k === 'cur') await fclick(p, '#btnCur');
  else if (k === 'resize') { var w = pick([360, 390, 640, 844, 1024, 1366]), h = pick([320, 390, 640, 720, 844, 1024]); await p.setViewportSize({ width: w, height: h }); }
  else if (k === 'hidden') { await ev(p, "window.__vis=true;document.dispatchEvent(new Event('visibilitychange'));0"); await p.waitForTimeout(250); await ev(p, "window.__vis=false;document.dispatchEvent(new Event('visibilitychange'));0"); }
  else if (k === 'freeze') await ev(p, 'var t0=Date.now();while(Date.now()-t0<1500);0');
  else if (k === 'mixer') { await fclick(p, '#btnSound'); await p.waitForTimeout(60); if (chance(0.5)) await fclick(p, '#btnSound'); }
  else if (k === 'mute') await fclick(p, '#mxMute');
  else if (k === 'music') { await fclick(p, '#btnSound'); await fclick(p, '#mxMusic'); await fclick(p, '#btnSound'); }
  else if (k === 'pitch') { await ev(p, "var m=document.getElementById('mxPitch');m.value=" + Math.floor(rnd() * 25 - 12) + ";m.dispatchEvent(new Event('input'));0"); }
  else if (k === 'info') { await fclick(p, '#btnInfo'); await p.waitForTimeout(60); if (chance(0.7)) await p.keyboard.press('Escape'); }
  else if (k === 'turbo') await fclick(p, '#btnTurbo');
  else if (k === 'plus') await fclick(p, '#btnPlus', { force: true });
  else if (k === 'buyclick') await fclick(p, '#btnBuy', { force: true, timeout: 800 }).catch(function () {});
  else if (k === 'betclick') await fclick(p, pick(['#betUp', '#betDn']), { force: true, timeout: 800 }).catch(function () {});
  else if (k === 'limit') { await ev(p, 'G.S.limit=' + pick([20, 50, 0]) + ';0'); }
  else if (k === 'reset') { await ev(p, "document.getElementById('btnInfo').click();0"); await p.waitForTimeout(50); await ev(p, "var r=document.getElementById('optReset');r&&r.click();0"); await dismissModal(p); }
  // les perturbations qui changent le solde cassent la chaîne comptable : on la repart
  if (k === 'reset' || k === 'limit') await ev(p, 'window.__rebase=true;0');
  return 'ok';
}

main().catch(function (e) { console.error(e); process.exit(2); });
