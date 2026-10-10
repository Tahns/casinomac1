/* HAND OF ANUBIS — flux de jeu, HUD, réglages. */
(function (root) {
  'use strict';
  var M = root.AnubisMath, G = root.G, FX = root.FX, Sfx = root.Sfx;
  function $(id) { return document.getElementById(id); }

  // Statistiques mesurées par tools/simulate.js (36M tours par mode, ±0,2 pt) — affichées dans la table des gains
  var STATS = { rtp: '96.2', rtpPlus: '95.9', hit: '61.3', bonusEvery: '14.7' };
  var BETS = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
  var AUTO_STEPS = [0, 10, 25, 50, 100];
  var SAVE_KEY = 'hoa_save_v1';

  var S = { pending: 0, balance: 10000, bi: 3, lastWin: 0, autoIdx: 0, auto: 0, stopOnBonus: true, busy: false, hist: [], reduced: false, mode: 'std', buyOn: true, limit: 0, quality: 'auto', limitHit: false };
  var SESS = { start: Date.now(), spins: 0, wag: 0, won: 0, lastCheck: Date.now() };
  var LIMITS = [0, 1000, 5000, 20000];
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
        // tour interrompu (rechargement en pleine animation) : le résultat était déjà décidé, on le crédite
        if (typeof d.pending === 'number' && d.pending > 0) { S.balance += d.pending; S.resumed = d.pending; }
        if (d.mode === 'plus') S.mode = 'plus';
        if (d.buyOn === false) S.buyOn = false;
        if (LIMITS.indexOf(d.limit) >= 0) S.limit = d.limit;
        if (d.quality) S.quality = d.quality;
      }
    } catch (e) {}
    // mouvement réduit : suit le réglage du système tant que le joueur n'a rien choisi
    try { if (!localStorage.getItem(SAVE_KEY) && root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches) { S.reduced = true; FX.reduced = true; } } catch (e) {}
    if (S.balance < BETS[0]) S.balance = 10000;
  }
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ pending: S.pending, balance: S.balance, bi: S.bi, lang: I18N.lang(), muted: Sfx.isMuted(), turbo: G.turbo, stopOnBonus: S.stopOnBonus, reduced: S.reduced, hist: S.hist, mode: S.mode, buyOn: S.buyOn, limit: S.limit, quality: S.quality }));
    } catch (e) {}
  }

  /* ---------- HUD ---------- */
  G.bet = BETS[S.bi];
  // fenêtres modales : le focus entre dans la fenêtre, y reste (Tab) et revient au bouton d'origine à la fermeture
  var lastFocus = null;
  function showModal() { if ($('modal').hidden) lastFocus = document.activeElement; $('modal').hidden = false; var f = $('modalClose'); if (f) f.focus(); }
  function hideModal() { $('modal').hidden = true; if (lastFocus && lastFocus.focus && document.contains(lastFocus)) { try { lastFocus.focus(); } catch (e) {} } lastFocus = null; }
  function bet() { return BETS[S.bi]; }
  function cost() { return Math.round(bet() * M.MODES[S.mode].cost * 100) / 100; }
  G.cost = cost;
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
    $('betCost').textContent = S.mode === 'plus' ? I18N.t().cost + ' ' + G.fmt(cost()) : '';
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
    $('btnPlus').classList.toggle('on', S.mode === 'plus'); $('plusText').textContent = T.oraclePlus;
    $('btnBuy').hidden = !S.buyOn; $('btnBuy').disabled = S.busy || S.auto > 0 || S.autoIdx > 0; $('buyText').textContent = T.buyBtn;
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
  // m = gain rapporté au coût du tour
  function tierOf(m) { return m >= 200 ? 4 : m >= 50 ? 3 : m >= 15 ? 2 : m >= 5 ? 1 : 0; }

  async function play(buyKind) {
    if (S.busy) return;
    var b = bet(), T = I18N.t();
    var priceMult = buyKind ? M.BUY[buyKind].price : M.MODES[S.mode].cost;
    var c = buyKind ? Math.round(b * priceMult * 100) / 100 : cost();
    if (S.limitHit) { openLimit(); return; }
    if (S.balance < c) { say(T.noFunds); Sfx.curse(); stopAuto(); return; }
    Sfx.unlock(); Sfx.startAmbient();
    S.busy = true; G.speed = G.turbo ? 1.6 : 1;
    S.balance -= c; SESS.spins++; SESS.wag += c; updateHud(true); setWin(0, false); setSpinBtn();
    var round = buyKind ? M.playBuy(rng, buyKind) : M.playRound(rng, S.mode), hadBonus = false;
    // le gain est connu avant l'animation : on le met en attente et on sauvegarde tout de suite la mise débitée
    S.pending = Math.round(Math.min(round.total, M.MAX_WIN) * b * 100) / 100; save();
    G.wheel.clearHighlight(); G.wheel.clearOracle();
    say(T.spinning);
    var total = 0;
    for (var i = 0; i < round.spins.length; i++) {
      var sp = round.spins[i];
      if (!buyKind && sp.oracle) {
        $('oracleText').textContent = T.oracleOn + ' ×' + sp.oracle.boost + ' → ' + T.kinds[sp.oracle.kind].replace('\n', ' ');
        $('oracle').hidden = false;
        await G.wheel.showOracle(sp.oracle);
      }
      if (!buyKind) await G.wheel.spinTo(sp);
      G.speed = G.turbo ? 1.6 : 1;
      var def = M.KINDS[sp.kind] || { bonus: true };
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
      var tier = tierOf(total / priceMult);
      if (tier > 0) await G.showBigWin(total, amount, tier);
      S.balance += amount; S.lastWin = amount; SESS.won += amount;
      setWin(amount, true); updateHud(true);
      say(T.winLine + ' ×' + G.fmt(total) + '  ·  +' + G.fmt(amount));
    } else { setWin(0); say(T.ready); }
    pushHistory(total, hadBonus);
    G.wheel.clearHighlight();
    S.pending = 0; S.busy = false; G.speed = G.turbo ? 1.6 : 1;
    save();
    var stopped = responsibleCheck();
    if (S.auto > 0 && !buyKind) {
      if (stopped || (hadBonus && S.stopOnBonus)) stopAuto(); else S.auto = isFinite(S.auto) ? S.auto - 1 : S.auto;
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
  $('btnPlus').addEventListener('click', function () { if (S.busy) return; S.mode = S.mode === 'plus' ? 'std' : 'plus'; Sfx.click(); updateHud(); setSpinBtn(); save(); say(S.mode === 'plus' ? I18N.t().plusHint : I18N.t().ready); });
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

  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('button'); if (b && e.detail > 0 && b.id !== 'modalClose' && !b.closest('#modal')) b.blur(); });
  root.addEventListener('keydown', function (e) {
    if (e.code === 'Tab' && !$('modal').hidden) {
      var fs = $('modal').querySelectorAll('button:not([disabled])'); if (!fs.length) return;
      var first = fs[0], last = fs[fs.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      return;
    }
    // un bouton qui a le focus (navigation clavier) garde son comportement natif ; sinon Espace/Entrée = tourner
    if ((e.code === 'Space' || e.code === 'Enter') && e.target && e.target.tagName === 'BUTTON') return;
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); if (!$('modal').hidden) return; if (G.skipWinOv()) return; if (S.busy && G.wheel.spinning) { G.speed = 3.2; return; } if (!S.busy) { Sfx.unlock(); play(); } }
    else if (e.code === 'ArrowUp') stepBet(1); else if (e.code === 'ArrowDown') stepBet(-1);
    else if (e.code === 'Escape') hideModal();
  });

  /* ---------- achat de bonus ---------- */
  var BUY_ORDER = ['vault', 'scarab', 'weigh', 'hand'];
  function buyIcon(kind) {
    var c = document.createElement('canvas'); c.width = c.height = 144; var x = c.getContext('2d'), A = root.Art;
    x.translate(72, 74);
    if (G.icon(x, kind, 0, 0, 140)) return c;
    if (kind === 'vault') A.pyramid(x, 0, 2, 110, '#e8c4ff', 'rgba(60,20,90,.6)');
    else if (kind === 'scarab') A.scarab(x, 0, 0, 100, '#ffd86a', 'rgba(60,30,0,.6)');
    else if (kind === 'weigh') { A.feather(x, 0, 0, 110, '#fff8e6', 'rgba(150,110,40,.8)'); }
    else A.hand(x, 0, 18, 52, {});
    return c;
  }
  function openBuy() {
    if (S.busy || !S.buyOn) return;
    var T = I18N.t(), b = bet();
    $('modalBody').innerHTML = '<h2>' + T.buyTitle + '</h2><p style="color:var(--dim)">' + T.buySub + '</p><div class="buyGrid" id="buyGrid"></div>' +
      '<p style="margin-top:14px;font-size:12px;color:var(--dim)">' + T.buyRtp + ' · ' + T.bet + ' ' + G.fmt(b) + '</p>';
    var grid = $('buyGrid');
    BUY_ORDER.forEach(function (k) {
      var price = Math.round(b * M.BUY[k].price * 100) / 100, name = k === 'hand' ? T.kindsLong.hand : T.kindsLong[k];
      var card = document.createElement('button'); card.type = 'button'; card.className = 'buyCard'; card.disabled = S.balance < price;
      card.appendChild(buyIcon(k));
      var h = document.createElement('h4'); h.textContent = name; card.appendChild(h);
      var d = document.createElement('small'); d.textContent = T.buyDesc[k]; card.appendChild(d);
      var pr = document.createElement('div'); pr.className = 'pr'; pr.textContent = G.fmt(price) + '  (×' + M.BUY[k].price + ')'; card.appendChild(pr);
      var go = document.createElement('div'); go.className = 'go'; go.textContent = card.disabled ? T.buyNoFunds : T.buyNow; card.appendChild(go);
      card.onclick = function () { hideModal(); Sfx.unlock(); play(k); };
      grid.appendChild(card);
    });
    showModal(); Sfx.click();
  }
  $('btnBuy').addEventListener('click', openBuy);

  /* ---------- jeu responsable ---------- */
  function net() { return Math.round((SESS.won - SESS.wag) * 100) / 100; }
  function showMsg(title, body, btns) {
    $('modalBody').innerHTML = '<h2>' + title + '</h2><p>' + body + '</p><div class="chips" id="msgBtns" style="margin-top:14px"></div>';
    btns.forEach(function (b) { var e = document.createElement('button'); e.type = 'button'; e.textContent = b[0]; e.onclick = function () { hideModal(); if (b[1]) b[1](); }; $('msgBtns').appendChild(e); });
    showModal();
  }
  function openLimit() { var T = I18N.t(); showMsg(T.limitTitle, T.limitMsg, [[T.settings, openInfo]]); }
  // renvoie true si l'auto-play doit s'arrêter
  function responsibleCheck() {
    var T = I18N.t();
    if (S.limit > 0 && -net() >= S.limit) { S.limitHit = true; stopAuto(); setTimeout(openLimit, 600); return true; }
    if (Date.now() - SESS.lastCheck > 30 * 60000) {
      SESS.lastCheck = Date.now(); stopAuto();
      var mins = Math.round((Date.now() - SESS.start) / 60000);
      setTimeout(function () { showMsg(T.realityTitle, T.realityMsg(mins, (net() >= 0 ? '+' : '') + G.fmt(net())), [[T.keepPlaying]]); }, 600);
      return true;
    }
    return false;
  }

  /* ---------- table des gains & réglages ---------- */
  function openInfo() {
    var T = I18N.t(), k, rows = '';
    var desc = T.buyDesc; // mêmes descriptions que le menu d'achat : une seule source, une seule vérité
    ['m0', 'm025', 'm05', 'm1', 'm2', 'm3', 'ankh', 'scarab', 'weigh', 'vault'].forEach(function (id) {
      var def = M.KINDS[id], pays = def.bonus ? desc[id] : def.respin ? T.respinLabel : (def.mult ? def.mult + '×' : T.noWin);
      rows += '<tr><td><span class="sw" style="background:' + G.kindColor(id) + '"></span>' + T.kinds[id] + '</td><td class="n">' + def.count + ' / ' + M.N + '</td><td>' + pays + '</td></tr>';
    });
    $('modalBody').innerHTML =
      '<h2>' + T.infoTitle + '</h2><p style="color:var(--dim)">' + T.demo + '</p>' +
      '<div class="kv"><div><label>' + T.rtp + '</label><b>' + STATS.rtp + '% <small style="font-size:11px;color:var(--turq)">· ORACLE+ ' + STATS.rtpPlus + '%</small></b></div><div><label>' + T.maxWin + '</label><b>' + G.fmt(M.MAX_WIN) + '×</b></div>' +
      '<div><label>' + T.hitRate + '</label><b>' + STATS.hit + '%</b></div><div><label>' + T.bonusFreq + '</label><b>1 / ' + STATS.bonusEvery + '</b></div><div><label>' + T.volat + '</label><b>' + T.volatV + '</b></div></div>' +
      '<h3>' + T.infoTitle.split('&')[0].trim() + '</h3>' + T.rules.map(function (r) { return '<p>• ' + r + '</p>'; }).join('') + '<p>• ' + T.rulesPlus + '</p>' + (S.buyOn ? '<p>• ' + T.buyTitle + ' : ' + BUY_ORDER.map(function (k) { return (k === 'hand' ? T.kindsLong.hand : T.kindsLong[k]) + ' ×' + M.BUY[k].price; }).join(' · ') + '</p>' : '') +
      '<h3>' + T.tableCols[0] + '</h3><table><tr><th>' + T.tableCols[0] + '</th><th>' + T.tableCols[1] + '</th><th>' + T.tableCols[2] + '</th></tr>' + rows + '</table>' +
      '<h3>' + T.session + '</h3>' +
      '<div class="kv"><div><label>' + T.sessTime + '</label><b>' + Math.round((Date.now() - SESS.start) / 60000) + ' min</b></div><div><label>' + T.sessSpins + '</label><b>' + SESS.spins + '</b></div>' +
      '<div><label>' + T.sessWag + '</label><b>' + G.fmt(SESS.wag) + '</b></div><div><label>' + T.sessWon + '</label><b>' + G.fmt(SESS.won) + '</b></div><div><label>' + T.sessNet + '</label><b>' + (net() >= 0 ? '+' : '') + G.fmt(net()) + '</b></div></div>' +
      '<h3>' + T.settings + '</h3>' +
      '<div class="opt"><span>' + T.lossLimit + '</span><div class="chips" id="optLimit"></div></div>' +
      '<div class="opt"><span>' + T.qualityL + '</span><div class="chips" id="optQ"></div></div>' +
      '<div class="opt"><span>' + T.autoOpts + '</span><div class="chips" id="optAuto"></div></div>' +
      '<div class="opt"><span>' + T.stopBonus + '</span><div class="chips"><button id="optStop" class="' + (S.stopOnBonus ? 'on' : '') + '" type="button">' + (S.stopOnBonus ? T.on : T.off) + '</button></div></div>' +
      '<div class="opt"><span>' + T.buyOn + '</span><div class="chips"><button id="optBuy" class="' + (S.buyOn ? 'on' : '') + '" type="button">' + (S.buyOn ? T.on : T.off) + '</button></div></div>' +
      '<div class="opt"><span>' + T.reducedFx + '</span><div class="chips"><button id="optRed" class="' + (S.reduced ? 'on' : '') + '" type="button">' + (S.reduced ? T.on : T.off) + '</button></div></div>' +
      '<div class="opt"><span>' + T.balance + '</span><div class="chips"><button id="optReset" type="button">10 000</button></div></div>';
    var ao = $('optAuto');
    AUTO_STEPS.concat([Infinity]).forEach(function (n) {
      var bt = document.createElement('button'); bt.type = 'button'; bt.textContent = n === 0 ? T.off : isFinite(n) ? n : '∞';
      bt.className = (AUTO_STEPS[S.autoIdx] === n) ? 'on' : '';
      bt.onclick = function () { if (S.busy) return; var ix = AUTO_STEPS.indexOf(n); S.autoIdx = ix < 0 ? 0 : ix; setSpinBtn(); openInfo(); };
      ao.appendChild(bt);
    });
    var ol = $('optLimit');
    LIMITS.forEach(function (n) {
      var bt = document.createElement('button'); bt.type = 'button'; bt.textContent = n ? G.fmt(n) : T.off; bt.className = S.limit === n ? 'on' : '';
      bt.onclick = function () { S.limit = n; S.limitHit = n > 0 && -net() >= n; if (!n) S.limitHit = false; save(); openInfo(); };
      ol.appendChild(bt);
    });
    var oq = $('optQ');
    [['auto', T.qAuto], ['high', T.qHigh], ['low', T.qLow]].forEach(function (q) {
      var bt = document.createElement('button'); bt.type = 'button'; bt.textContent = q[1]; bt.className = S.quality === q[0] ? 'on' : '';
      bt.onclick = function () { S.quality = q[0]; G.setQuality(q[0]); save(); openInfo(); };
      oq.appendChild(bt);
    });
    $('optBuy').onclick = function () { S.buyOn = !S.buyOn; save(); setSpinBtn(); openInfo(); };
    $('optStop').onclick = function () { S.stopOnBonus = !S.stopOnBonus; save(); openInfo(); };
    $('optRed').onclick = function () { S.reduced = !S.reduced; FX.reduced = S.reduced; save(); openInfo(); };
    $('optReset').onclick = function () { if (S.busy) return; S.balance = 10000; shown.bal = -1; updateHud(); save(); };
    showModal(); Sfx.click();
  }
  $('btnInfo').addEventListener('click', openInfo);
  $('modalClose').addEventListener('click', function () { hideModal(); });
  $('modal').addEventListener('click', function (e) { if (e.target === $('modal')) hideModal(); });

  /* ---------- démarrage ---------- */
  load(); G.quality = S.quality; if (S.quality === 'low') FX.lite = true; I18N.apply(); refreshSound(); applyLang();
  updateHud(); setWin(0); setSpinBtn(); renderHistory();
  if (S.resumed) { say(I18N.t().resumed + ' +' + G.fmt(S.resumed)); save(); }
  G.start();
  if (document.fonts && document.fonts.load) Promise.all(['700 20px Oswald', '600 20px Oswald', '900 20px Cinzel'].map(function (f) { return document.fonts.load(f); })).then(function () { G.wheel.build(); }, function () {});
  // utilitaires de test (?debug)
  G.S = S; G.play = play;
  if (/[?&]debug/.test(location.search)) { G.debug = true; }

  /* ---------- écran d'accueil : ambiance + déverrouillage de l'audio ---------- */
  (function () {
    var sp = $('splash');
    if (!sp || navigator.webdriver || /[?&](debug|nosplash)/.test(location.search)) { if (sp) sp.remove(); return; }
    var T = I18N.t(), port = root.innerHeight > root.innerWidth, src = (root.HOA_IMG || {})[port ? 'splashp' : 'splash'];
    if (src) sp.style.backgroundImage = 'url(' + src + ')';
    $('spSub').textContent = T.splashSub; $('spBtn').textContent = T.splashEnter; $('spDemo').textContent = T.splashDemo;
    sp.hidden = false;
    function enter() {
      Sfx.unlock(); Sfx.startAmbient(); Sfx.bonus();
      sp.classList.add('out'); setTimeout(function () { sp.remove(); }, 1000);
      document.removeEventListener('keydown', key, true);
    }
    function key(e) { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); enter(); } }
    document.addEventListener('keydown', key, true);
    sp.addEventListener('click', enter);
  })();
})(window);
