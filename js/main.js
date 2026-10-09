/* HAND OF ANUBIS — flux de jeu, HUD, réglages. */
(function (root) {
  'use strict';
  var M = root.AnubisMath, G = root.G, FX = root.FX, Sfx = root.Sfx;
  function $(id) { return document.getElementById(id); }

  // Statistiques mesurées par tools/simulate.js (36M tours, ±0,2 pt) — affichées dans la table des gains
  var STATS = { rtp: '96.1', hit: '47.7', bonusEvery: '14.7' };
  var BETS = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
  var AUTO_STEPS = [0, 10, 25, 50, 100];
  var SAVE_KEY = 'hoa_save_v1';

  var S = { balance: 10000, bi: 3, lastWin: 0, autoIdx: 0, auto: 0, stopOnBonus: true, busy: false, hist: [], reduced: false };
  var rng = M.cryptoRng();

  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (d) {
        if (typeof d.balance === 'number' && d.balance >= 0) S.balance = d.balance;
        if (typeof d.bi === 'number' && BETS[d.bi]) S.bi = d.bi;
        if (d.lang) I18N.setLang(d.lang);
        if (d.muted) Sfx.setMuted(true);
        if (d.turbo) { G.turbo = true; G.speed = 1.6; }
        if (typeof d.stopOnBonus === 'boolean') S.stopOnBonus = d.stopOnBonus;
        if (d.reduced) { S.reduced = true; FX.reduced = true; }
        if (Array.isArray(d.hist)) S.hist = d.hist.slice(0, 10);
      }
    } catch (e) {}
    if (S.balance < BETS[0]) S.balance = 10000;
  }
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ balance: S.balance, bi: S.bi, lang: I18N.lang(), muted: Sfx.isMuted(), turbo: G.turbo, stopOnBonus: S.stopOnBonus, reduced: S.reduced, hist: S.hist }));
    } catch (e) {}
  }

  /* ---------- HUD ---------- */
  G.bet = BETS[S.bi];
  function bet() { return BETS[S.bi]; }
  function say(txt) { $('statusText').textContent = txt || ''; }
  G.say = say;

  var shown = { bal: -1, win: -1 };
  function countTo(el, key, to, ms) {
    var from = shown[key] < 0 ? to : shown[key];
    if (from === to || ms <= 0) { el.textContent = G.fmt(to); shown[key] = to; return; }
    var t0 = performance.now();
    (function step(n) {
      var u = Math.min(1, (n - t0) / ms), v = from + (to - from) * (1 - Math.pow(1 - u, 3));
      el.textContent = G.fmt(Math.round(v * 100) / 100); shown[key] = v;
      if (u < 1) requestAnimationFrame(step); else shown[key] = to;
    })(t0);
  }
  function updateHud(anim) {
    countTo($('bal'), 'bal', S.balance, anim ? 600 : 0);
    $('bet').textContent = G.fmt(bet());
    G.bet = bet();
    $('betDn').disabled = S.busy || S.bi === 0;
    $('betUp').disabled = S.busy || S.bi === BETS.length - 1;
  }
  function setWin(v, anim) {
    countTo($('win'), 'win', v, anim ? 700 : 0);
    if (v > 0) { var el = $('statWin'); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  }
  function setSpinBtn() {
    var b = $('spin'), T = I18N.t();
    b.classList.toggle('stop', S.auto > 0);
    b.disabled = S.busy && S.auto === 0;
    $('spinText').textContent = S.auto > 0 ? T.stop + (isFinite(S.auto) ? ' ' + S.auto : '') : T.spin;
    $('autoText').textContent = AUTO_STEPS[S.autoIdx] ? T.auto + ' ' + AUTO_STEPS[S.autoIdx] : T.auto;
    $('btnAuto').classList.toggle('on', S.autoIdx > 0);
    $('btnTurbo').classList.toggle('on', G.turbo);
  }
  function pushHistory(mult, bonus) {
    S.hist.unshift({ m: mult, b: bonus ? 1 : 0 }); S.hist = S.hist.slice(0, 10); renderHistory();
  }
  function renderHistory() {
    var h = $('history'); h.innerHTML = '';
    S.hist.forEach(function (x) {
      var d = document.createElement('div');
      d.className = 'h-chip ' + (x.b ? 'b' : x.m > 0 ? 'w' : 'z');
      d.textContent = x.m > 0 ? '×' + G.fmt(x.m) : '0';
      h.appendChild(d);
    });
  }

  /* ---------- un tour ---------- */
  function tierOf(m) { return m >= 200 ? 4 : m >= 50 ? 3 : m >= 15 ? 2 : m >= 5 ? 1 : 0; }

  async function play() {
    if (S.busy) return;
    var b = bet(), T = I18N.t();
    if (S.balance < b) { say(T.noFunds); Sfx.curse(); stopAuto(); return; }
    Sfx.unlock(); Sfx.startAmbient();
    S.busy = true; G.speed = G.turbo ? 1.6 : 1;
    S.balance -= b; updateHud(true); setWin(0, false); setSpinBtn();
    var round = M.playRound(rng), hadBonus = false;
    G.wheel.clearHighlight(); G.wheel.clearOracle();
    say(T.spinning);
    var total = 0;
    for (var i = 0; i < round.spins.length; i++) {
      var sp = round.spins[i];
      if (sp.oracle) {
        $('oracleText').textContent = T.oracleOn + ' ×' + sp.oracle.boost + ' → ' + T.kinds[sp.oracle.kind].replace('\n', ' ');
        $('oracle').hidden = false;
        await G.wheel.showOracle(sp.oracle);
      }
      await G.wheel.spinTo(sp);
      G.speed = G.turbo ? 1.6 : 1;
      var def = M.KINDS[sp.kind];
      if (def.respin) {
        Sfx.shield(); FX.spark(G.cx, G.cy - G.R * 0.9, 30, '#ffe9a0', 300); FX.flash(0.3, '#ffe9a0');
        say(T.ankhRespin); G.wheel.flashLamps = 1.0;
        await G.sleep(1.3);
        G.wheel.clearOracle(); G.wheel.clearHighlight(); $('oracle').hidden = true;
        continue;
      }
      if (def.bonus) {
        hadBonus = true; say(sp.upgraded ? T.kindsLong.hand : T.kindsLong[sp.kind]);
        await G.runBonus(sp, b);
      } else if (sp.pay > 0) {
        var px = G.cx, py = G.cy - G.R * 0.55;
        if (sp.boost > 1) { FX.float(T.boostApplied + ' ×' + sp.boost, px, py - 40, '#fff1b8', 26); Sfx.sparkle(); FX.ring(G.cx, G.cy, '#ffe9a0', G.R * 1.2, 0.8); }
        FX.float('×' + G.fmt(sp.pay), px, py, '#ffe9a0', 36);
        FX.spark(px, py, 24, '#ffd86a', 320); Sfx.chime(sp.pay); G.wheel.flashLamps = 0.8;
        await G.sleep(0.8);
      } else {
        say(T.dust); FX.dust(G.cx, G.cy - G.R * 0.8, 10); await G.sleep(0.45);
      }
      total += sp.pay;
      $('oracle').hidden = true;
    }
    total = Math.min(total, M.MAX_WIN);
    var amount = Math.round(total * b * 100) / 100;
    G.wheel.clearOracle(); $('oracle').hidden = true;
    if (amount > 0) {
      var tier = tierOf(total);
      if (tier > 0) await G.showBigWin(total, amount, tier);
      S.balance += amount; S.lastWin = amount;
      setWin(amount, true); updateHud(true);
      say(T.winLine + ' ×' + G.fmt(total) + '  ·  +' + G.fmt(amount));
    } else { setWin(0); say(T.ready); }
    pushHistory(total, hadBonus);
    G.wheel.clearHighlight();
    S.busy = false; G.speed = G.turbo ? 1.6 : 1;
    save();
    if (S.auto > 0) {
      if (hadBonus && S.stopOnBonus) stopAuto(); else S.auto = isFinite(S.auto) ? S.auto - 1 : S.auto;
    }
    updateHud(); setSpinBtn();
    if (S.auto > 0) { await G.sleep(amount > 0 ? 0.7 : 0.25); if (S.auto > 0) play(); }
    else if (amount === 0) say(T.ready);
  }
  function stopAuto() { S.auto = 0; S.autoIdx = 0; setSpinBtn(); }

  /* ---------- événements ---------- */
  $('spin').addEventListener('click', function () {
    Sfx.unlock();
    if (S.auto > 0) { stopAuto(); return; }
    if (G.skipWinOv()) return;
    if (S.autoIdx > 0 && !S.busy) { S.auto = AUTO_STEPS[S.autoIdx]; setSpinBtn(); }
    play();
  });
  function stepBet(d) { if (S.busy) return; var n = S.bi + d; if (n < 0 || n >= BETS.length) return; S.bi = n; Sfx.click(); updateHud(); save(); }
  $('betDn').addEventListener('click', function () { stepBet(-1); });
  $('betUp').addEventListener('click', function () { stepBet(1); });
  $('btnTurbo').addEventListener('click', function () { G.turbo = !G.turbo; G.speed = G.turbo ? 1.6 : 1; Sfx.click(); setSpinBtn(); save(); });
  $('btnAuto').addEventListener('click', function () {
    if (S.auto > 0) { stopAuto(); return; }
    S.autoIdx = (S.autoIdx + 1) % AUTO_STEPS.length; Sfx.click(); setSpinBtn();
  });
  function refreshSound() { $('btnSound').classList.toggle('off', Sfx.isMuted()); }
  $('btnSound').addEventListener('click', function () { Sfx.unlock(); Sfx.setMuted(!Sfx.isMuted()); refreshSound(); save(); });
  function applyLang() {
    $('btnLang').textContent = I18N.lang().toUpperCase() === 'FR' ? 'EN' : 'FR';
    I18N.apply(); setSpinBtn(); say(S.busy ? '' : I18N.t().ready);
    if (G.wheel.build && G.w) G.wheel.build();
  }
  $('btnLang').addEventListener('click', function () { I18N.setLang(I18N.lang() === 'fr' ? 'en' : 'fr'); applyLang(); save(); });
  G.onWheelTap = function () { if (S.busy && G.wheel.spinning) G.speed = 3.2; };

  root.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); if (!$('modal').hidden) return; if (G.skipWinOv()) return; if (S.busy && G.wheel.spinning) { G.speed = 3.2; return; } if (!S.busy) { Sfx.unlock(); play(); } }
    else if (e.code === 'ArrowUp') stepBet(1); else if (e.code === 'ArrowDown') stepBet(-1);
    else if (e.code === 'Escape') $('modal').hidden = true;
  });

  /* ---------- table des gains & réglages ---------- */
  function openInfo() {
    var T = I18N.t(), k, rows = '';
    var desc = {
      scarab: I18N.lang() === 'fr' ? '3 scarabées dans le Plinko : jusqu\'à 25× chacun' : '3 scarabs in the Plinko: up to 25× each',
      weigh: I18N.lang() === 'fr' ? 'Cœur vs plume : jusqu\'à 200×' : 'Heart vs feather: up to 200×',
      vault: I18N.lang() === 'fr' ? 'Chambres à ouvrir, évitez la malédiction' : 'Open chambers, dodge the curse'
    };
    ['m0', 'm05', 'm1', 'm2', 'm3', 'ankh', 'scarab', 'weigh', 'vault'].forEach(function (id) {
      var def = M.KINDS[id], pays = def.bonus ? desc[id] : def.respin ? T.respinLabel : (def.mult ? def.mult + '×' : T.noWin);
      rows += '<tr><td><span class="sw" style="background:' + G.kindColor(id) + '"></span>' + T.kinds[id] + '</td><td class="n">' + def.count + ' / ' + M.N + '</td><td>' + pays + '</td></tr>';
    });
    $('modalBody').innerHTML =
      '<h2>' + T.infoTitle + '</h2><p style="color:var(--dim)">' + T.demo + '</p>' +
      '<div class="kv"><div><label>' + T.rtp + '</label><b>' + STATS.rtp + '%</b></div><div><label>' + T.maxWin + '</label><b>' + G.fmt(M.MAX_WIN) + '×</b></div>' +
      '<div><label>' + T.hitRate + '</label><b>' + STATS.hit + '%</b></div><div><label>' + T.bonusFreq + '</label><b>1 / ' + STATS.bonusEvery + '</b></div><div><label>' + T.volat + '</label><b>' + T.volatV + '</b></div></div>' +
      '<h3>' + T.infoTitle.split('&')[0].trim() + '</h3>' + T.rules.map(function (r) { return '<p>• ' + r + '</p>'; }).join('') +
      '<h3>' + T.tableCols[0] + '</h3><table><tr><th>' + T.tableCols[0] + '</th><th>' + T.tableCols[1] + '</th><th>' + T.tableCols[2] + '</th></tr>' + rows + '</table>' +
      '<h3>' + T.settings + '</h3>' +
      '<div class="opt"><span>' + T.autoOpts + '</span><div class="chips" id="optAuto"></div></div>' +
      '<div class="opt"><span>' + T.stopBonus + '</span><div class="chips"><button id="optStop" class="' + (S.stopOnBonus ? 'on' : '') + '" type="button">' + (S.stopOnBonus ? T.on : T.off) + '</button></div></div>' +
      '<div class="opt"><span>' + T.reducedFx + '</span><div class="chips"><button id="optRed" class="' + (S.reduced ? 'on' : '') + '" type="button">' + (S.reduced ? T.on : T.off) + '</button></div></div>' +
      '<div class="opt"><span>' + T.balance + '</span><div class="chips"><button id="optReset" type="button">10 000</button></div></div>';
    var ao = $('optAuto');
    AUTO_STEPS.concat([Infinity]).forEach(function (n) {
      var bt = document.createElement('button'); bt.type = 'button'; bt.textContent = n === 0 ? T.off : isFinite(n) ? n : '∞';
      bt.className = (AUTO_STEPS[S.autoIdx] === n) ? 'on' : '';
      bt.onclick = function () { if (S.busy) return; var ix = AUTO_STEPS.indexOf(n); S.autoIdx = ix < 0 ? 0 : ix; setSpinBtn(); openInfo(); };
      ao.appendChild(bt);
    });
    $('optStop').onclick = function () { S.stopOnBonus = !S.stopOnBonus; save(); openInfo(); };
    $('optRed').onclick = function () { S.reduced = !S.reduced; FX.reduced = S.reduced; save(); openInfo(); };
    $('optReset').onclick = function () { if (S.busy) return; S.balance = 10000; shown.bal = -1; updateHud(); save(); };
    $('modal').hidden = false; Sfx.click();
  }
  $('btnInfo').addEventListener('click', openInfo);
  $('modalClose').addEventListener('click', function () { $('modal').hidden = true; });
  $('modal').addEventListener('click', function (e) { if (e.target === $('modal')) $('modal').hidden = true; });

  /* ---------- démarrage ---------- */
  load(); I18N.apply(); refreshSound(); applyLang();
  updateHud(); setWin(0); setSpinBtn(); renderHistory();
  G.start();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { G.wheel.build(); });
  // utilitaires de test (?debug)
  G.S = S; G.play = play;
  if (/[?&]debug/.test(location.search)) { G.debug = true; }
})(window);
