/* ANUBIS UNCHAINED — mode REPLAY (Stake Engine).
 *
 * URL : ?replay=true&game=&version=&mode=&event=&rgs_url=&currency=&amount=&lang=&device=&social=
 * Appelle GET {rgs_url}/bet/replay/{game}/{version}/{mode}/{event} → { payoutMultiplier, costMultiplier, state }.
 * Aucun appel « wallet », aucun accès au jeu réel : le HUD de mise, le bouton tourner, l'achat et l'auto sont masqués
 * (classe .replay sur <html>) et les touches du clavier sont neutralisées. Le tour est rejoué avec les mêmes scènes que le jeu
 * (roue, Oracle, bonus, animations de gain) puis le résultat reste à l'écran ; « Rejouer » relance exactement le même événement.
 *
 * Format de `state` : le book v2 (liste d'événements, contrat documenté en tête de tools/stake-export.js), lu par RGS.bookToRound (js/rgs.js) —
 * le même adaptateur que le jeu. Le gain affiché est payoutMultiplier du RGS ; si les événements ne concordent pas, un message d'erreur est
 * affiché et le montant du RGS reste celui du résultat. Les choix (couleur de la Fureur, plume ou cœur de la Pesée) sont de vrais choix du
 * spectateur, pré-résolus dans le book : tous les choix paient le même total. Les montants de l'URL sont en micro-unités (1 000 000 = 1,00) ;
 * coût réel = amount × costMultiplier.
 */
(function (root) {
  'use strict';
  var q = new URLSearchParams(root.location.search);
  var active = q.get('replay') === 'true';
  var R = root.Replay = { active: active, social: q.get('social') === 'true' };
  if (!active) return;

  var doc = root.document, de = doc.documentElement;
  de.classList.add('replay');
  if (R.social) de.setAttribute('data-social', 'true');
  function $(id) { return doc.getElementById(id); }

  /* ---------- textes : bloc « replay » de i18n.js (langue courante, repli anglais) ---------- */
  function tx() { return root.I18N.block('replay'); }

  /* ---------- paramètres ---------- */
  function param(k) { var v = q.get(k); return v == null ? '' : v.trim(); }
  var P = {
    game: param('game'), version: param('version'), mode: param('mode'), event: param('event'), rgs: param('rgs_url'),
    amount: Number(param('amount')), currency: param('currency').toUpperCase(), lang: param('lang').toLowerCase().slice(0, 2)
  };
  if (!(isFinite(P.amount) && P.amount > 0)) P.amount = 1000000;   // mise absente ou invalide : 1,00
  R.params = P;

  // la langue d'abord (avant main.js) ; un code inconnu retombe sur l'anglais
  if (root.I18N) {
    if (P.lang) { I18N.setLang(P.lang); if (I18N.lang() !== P.lang) I18N.setLang('en'); }
    else I18N.setLang(/^fr\b/i.test(root.navigator.language || '') ? 'fr' : 'en');
  }

  function rgsBase(u) {
    if (!u) return '';
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(u)) u = 'https://' + u;   // hôte nu (rgs.example.com) : on ajoute le schéma
    return u.replace(/\/+$/, '');
  }

  /* ---------- interface ---------- */
  var ui = {};
  function build() {
    var hud = $('hud');
    var rp = doc.createElement('div'); rp.id = 'rp';
    rp.innerHTML = '<div class="rp-plate" id="rpInfo"><b id="rpBet"></b><small id="rpSub"></small></div>' +
      '<button id="rpGo" class="btn-go rp-go" type="button" disabled></button>' +
      '<div class="rp-plate rp-res" id="rpRes" aria-live="polite"><label id="rpResL"></label><b id="rpResV"></b></div>';
    hud.appendChild(rp);
    var msg = doc.createElement('div'); msg.id = 'rpMsg'; msg.setAttribute('role', 'status'); msg.hidden = true;
    ($('ui') || doc.body).appendChild(msg);
    ui.bet = $('rpBet'); ui.sub = $('rpSub'); ui.go = $('rpGo'); ui.res = $('rpRes'); ui.resL = $('rpResL'); ui.resV = $('rpResV'); ui.msg = msg;
    var tag = doc.createElement('span'); tag.className = 'rp-badge'; tag.id = 'rpBadge'; $('top').appendChild(tag); ui.badge = tag;
  }
  function showMsg(t, err) { ui.msg.textContent = t || ''; ui.msg.hidden = !t; ui.msg.className = err ? 'err' : ''; }

  /* ---------- données ---------- */
  var data = null;   // { payout, cost, events, round, mismatch }
  function modeKind(round) {
    var s0 = round.spins[0] || {};
    if (round.mode === 'buy' || (s0.index === -1)) return 'bonus';
    return round.mode === 'plus' ? 'plus' : 'std';
  }
  async function load() {
    var T = tx();
    if (!P.game || !P.version || !P.mode || !P.event || !P.rgs) throw new Error(T.errParams);
    var url = rgsBase(P.rgs) + '/bet/replay/' + [P.game, P.version, P.mode, P.event].map(encodeURIComponent).join('/');
    var ctl = root.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 15000), res, j;
    try { res = await root.fetch(url, ctl ? { signal: ctl.signal, headers: { Accept: 'application/json' } } : undefined); }
    catch (e) { throw new Error(T.errNet); } finally { clearTimeout(to); }
    try { j = await res.json(); } catch (e) { j = null; }
    if (!res.ok) throw new Error(T.errLoad + ' (' + (res.status) + (j && (j.error || j.message) ? ' · ' + (j.error || j.message) : '') + ')');
    var events = j && (Array.isArray(j.state) ? j.state : (j.state && Array.isArray(j.state.events) ? j.state.events : null)), round = null;
    try { round = events && root.RGS.bookToRound(events, root.AnubisMath); } catch (e) { round = null; }
    if (!round || !round.spins.length) throw new Error(T.errFormat);
    var payout = j && j.payoutMultiplier != null && isFinite(+j.payoutMultiplier) ? +j.payoutMultiplier : round.total;
    var cost = j && isFinite(+j.costMultiplier) && +j.costMultiplier > 0 ? +j.costMultiplier : (round.cost || 1);
    // cohérence : somme des événements, finalWin et payoutMultiplier ; sinon erreur affichée, montant du RGS conservé
    var mismatch = round.issues.length > 0 || Math.abs(round.sum - payout) > 1e-6 || Math.abs(round.total - payout) > 1e-6;
    return { payout: payout, cost: cost, events: events, round: round, mismatch: mismatch };
  }

  /* ---------- affichage de la mise ---------- */
  function units(micro) { return micro / 1e6; }
  function costMultTxt(c) { return '×' + (root.G && G.fmt ? G.fmt(Math.round(c * 1000) / 1000) : c); }
  function showBet() {
    var T = tx(), G = root.G, base = units(P.amount), c = data.cost, real = G.r6(base * c), kind = modeKind(data.round);
    var label = c > 1 || kind !== 'std' ? (kind === 'plus' ? T.modePlus : T.modeBonus) : (R.social ? T.betSocial : T.bet);
    ui.bet.textContent = '';
    function span(t, cls) { var e = doc.createElement('span'); e.textContent = t; if (cls) e.className = cls; ui.bet.appendChild(e); }
    span(label + ' : ' + G.money(base));
    if (c > 1) { span(' · ', 'rp-sep'); span(T.realCost + ' : ' + G.money(real)); }
    var s0 = data.round.spins[0] || {}, L = I18N.t(), sub = [];
    if (c > 1) sub.push(T.costMult + ' ' + costMultTxt(c));
    if (kind === 'bonus') sub.push(s0.upgraded ? L.kindsLong.hand : (L.kindsLong[s0.kind] || ''));
    else if (kind === 'plus') sub.push(L.oraclePlus);
    else sub.push(T.modeStd);
    if (kind !== 'bonus' && data.round.pact && data.round.pact !== 'std') sub.push(I18N.block('pact').name[data.round.pact] || '');   // pacte du tour (mode safe / bold)
    ui.sub.textContent = sub.filter(Boolean).join(' · ');
    ui.sub.hidden = false;
  }
  function refreshTexts() {
    var T = tx();
    ui.badge.textContent = T.badge;
    ui.resL.textContent = T.result;
    if (state === 'ready') ui.go.textContent = T.start; else if (state === 'done') ui.go.textContent = T.again; else if (state === 'playing') ui.go.textContent = T.playing;
    if (data) { showBet(); if (state === 'done') showResult(); }
  }

  /* ---------- lecture du tour ---------- */
  var state = 'loading', busy = false;
  function tierOf(m) { var t = -1; root.G.WIN_TIERS.forEach(function (x, i) { if (m >= x) t = i; }); return t; }
  // le tour est relu à chaque lecture depuis les événements (les choix de couleur et de plume / cœur modifient l'objet de scène)
  function prepare() { return root.RGS.bookToRound(data.events, root.AnubisMath); }
  function showResult() {
    var G = root.G, T = tx(), amount = G.r6(data.payout * units(P.amount));
    ui.resV.textContent = data.payout > 0 ? G.money(amount) : T.noWin;
    ui.res.classList.toggle('win', data.payout > 0); ui.res.classList.add('on');
    return amount;
  }
  async function play() {
    if (busy || !data) return;
    busy = true; state = 'playing';
    var G = root.G, M = root.AnubisMath, T = tx(), L = I18N.t(), Sfx = root.Sfx, FX = root.FX;
    ui.go.disabled = true; ui.go.textContent = T.playing; ui.res.classList.remove('on'); ui.resV.textContent = '';
    showMsg('');
    try { Sfx.unlock(); Sfx.startAmbient(); Sfx.spinStart(); } catch (e) {}
    G.replay = true; G.turbo = false; G.ultra = false; G.speed = 1; G.onBonusChoice = null;
    var round = prepare(), b = units(P.amount), total = 0;
    G.wheel.clearHighlight(); G.wheel.clearOracle(); $('oracle').hidden = true;
    G.say(L.spinning);
    if (G.wrath) G.wrath.reset();
    try {
      if (round.wrath && G.wrath) await G.wrath.begin(round.wrath);   // Colère d'Anubis : mêmes scènes que le jeu
      for (var i = 0; i < round.spins.length; i++) {
        var sp = round.spins[i], buy = sp.index === -1 || round.mode === 'buy';
        if (sp.wrath && G.wrath) G.wrath.sync(sp.wrath);
        if (!buy && sp.oracle) {
          $('oracleText').textContent = L.oracleOn + ' ×? → ' + L.kinds[sp.oracle.kind].replace('\n', ' ');   // valeur scellée jusqu'à l'arrêt
          $('oracle').hidden = false;
          await G.wheel.showOracle(sp.oracle);
        }
        if (!buy) await G.wheel.spinTo(sp);
        if (!buy && sp.oracle) { $('oracleText').textContent = L.oracleOn + ' ×' + sp.oracle.boost + ' → ' + L.kinds[sp.oracle.kind].replace('\n', ' '); await G.wheel.revealOracle(); }
        var def = M.KINDS[sp.kind] || { bonus: true };
        if (def.respin) {
          Sfx.shield(); FX.spark(G.cx, G.cy - G.R * 0.9, 30, '#ffe9a0', 300); FX.flash(0.3, '#ffe9a0');
          G.say(L.ankhRespin); G.wheel.flashLamps = 1.0;
          await G.sleep(1.3);
          if (sp.wrathUp && G.wrath) await G.wrath.up(sp.wrathUp);
          G.wheel.clearOracle(); G.wheel.clearHighlight(); $('oracle').hidden = true;
          continue;
        }
        if (def.bonus) {
          G.say(sp.upgraded ? L.kindsLong.hand : L.kindsLong[sp.kind]);
          await G.runBonus(sp, b);
        } else if (sp.pay > 0) {
          var px = G.cx, py = G.cy - G.R * 0.55;
          if (sp.boost > 1) await G.wheel.applyBoost();
          FX.float('×' + G.fmt(sp.pay), px, py, '#ffe9a0', 36);
          FX.spark(px, py, 24, '#ffd86a', 320); Sfx.chime(sp.pay); G.wheel.flashLamps = 0.8;
          await G.sleep(0.8);
        } else { G.say(L.dust); FX.dust(G.cx, G.cy - G.R * 0.8, 10); await G.sleep(0.45); }
        total += sp.pay || 0;
        $('oracle').hidden = true;
      }
    } catch (err) {   // une scène en erreur ne bloque jamais le replay : le résultat du livre reste affiché
      if (root.console) console.error(err);
      G.scene = null; G.eg = null; G.winOv = null; G.fade = 0; G.setScene(null);
      if (G.wrath) G.wrath.reset();
    }
    G.wheel.clearOracle(); $('oracle').hidden = true;
    if (G.wrath && G.wrath.active()) await G.wrath.end();
    var amount = showResult();
    if (data.payout > 0) {
      var tier = tierOf(data.payout / data.cost);
      if (tier >= 0) { try { await G.showBigWin(data.payout, amount, tier); } catch (e) {} }
      G.say(L.winLine + ' ×' + G.fmt(data.payout) + '  ·  ' + G.money(amount, true));
    } else G.say(L.dust);
    G.wheel.clearHighlight(); G.replay = false;
    if (data.mismatch) showMsg(T.errSum, true);
    state = 'done'; busy = false; ui.go.disabled = false; ui.go.textContent = T.again; ui.go.focus();
  }

  /* ---------- démarrage ---------- */
  function start() {
    build();
    var G = root.G;
    if (R.social && root.SOCIAL && !root.SOCIAL.active) root.SOCIAL.set(true);
    // [E4] replay social : jetons XSC / XGC seulement, jamais « $ » (un ?currency=USD ou une devise inconnue devient XSC)
    var cur = P.currency;
    if (R.social && root.CUR && (!cur || !root.CUR.isSocial(cur))) cur = 'XSC';
    if (cur && G.setCurrency) { try { G.setCurrency(cur, true); if (G.lockCurrency) G.lockCurrency(true); } catch (e) {} }
    refreshTexts();
    root.dispatchEvent(new Event('resize'));   // la barre replay change la hauteur du bas : la roue est recadrée
    ui.go.addEventListener('click', function () { if (state === 'ready' || state === 'done') play(); });
    showMsg(tx().loading);
    ui.bet.textContent = (R.social ? tx().betSocial : tx().bet) + ' : ' + G.money(units(P.amount));
    load().then(function (d) {
      data = d; state = 'ready'; showMsg(d.mismatch ? tx().errSum : '', d.mismatch); showBet(); root.dispatchEvent(new Event('resize')); ui.go.disabled = false; ui.go.textContent = tx().start; ui.go.focus();
      R.data = d;
    }, function (e) {
      state = 'error'; showMsg((e && e.message) || tx().errLoad, true); ui.go.hidden = true;
    });
  }
  // Espace / Entrée : lecture ; toutes les autres touches du jeu sont neutralisées (aucun accès au jeu réel)
  root.addEventListener('keydown', function (e) {
    if (e.code === 'Tab' || e.ctrlKey || e.metaKey || e.altKey) return;
    if ((e.code === 'Space' || e.code === 'Enter') && e.target && e.target.tagName === 'BUTTON') { e.stopImmediatePropagation(); return; }
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); if (state === 'ready' || state === 'done') play(); }
    e.stopImmediatePropagation();
  });
  R.refresh = refreshTexts;
  R.play = play;
  R.state = function () { return state; };
  setTimeout(start, 0);   // après main.js : devise, polices et premier rendu sont en place
})(window);
