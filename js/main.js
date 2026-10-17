/* ANUBIS UNCHAINED — flux de jeu, HUD, réglages. */
(function (root) {
  'use strict';
  var M = root.AnubisMath, G = root.G, FX = root.FX, Sfx = root.Sfx;
  var RG = root.RGS, LIVE = !!(RG && RG.enabled);   // LIVE = mode RGS (sessionID / rgs_url dans l'adresse) ; sinon démo locale
  function $(id) { return document.getElementById(id); }
  // [conformité] zoom mobile désactivé : pincement, double toucher, gestes Safari (gesturestart), Ctrl + molette ; la page ne défile jamais
  (function () {
    var d = document, opt = { passive: false };
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (n) { d.addEventListener(n, function (e) { e.preventDefault(); }, opt); });
    d.addEventListener('touchmove', function (e) { if (e.touches && e.touches.length > 1) e.preventDefault(); }, opt);
    d.addEventListener('dblclick', function (e) { e.preventDefault(); }, opt);
    root.addEventListener('wheel', function (e) { if (e.ctrlKey) e.preventDefault(); }, opt);
    var last = 0;   // double toucher (ancien iOS) : un second toucher en moins de 350 ms ne produit pas de zoom
    d.addEventListener('touchend', function (e) { var n = Date.now(); if (n - last < 350 && !(e.target && e.target.closest && e.target.closest('button,input,a'))) e.preventDefault(); last = n; }, opt);
  })();
  // build de production Stake (js/build.js, tools/build-stake.py) : pas de démo locale. Sans session RGS ni replay : écran « Lancez le jeu depuis Stake », rien d'autre
  var STAKE = root.ANUBIS_BUILD === 'stake';
  if (STAKE && !LIVE && !(root.Replay && root.Replay.active)) {
    ['ui', 'splash', 'stage'].forEach(function (id) { var el = $(id); if (el) el.remove(); });
    var lb = document.createElement('div'); lb.id = 'rgsBlock'; lb.setAttribute('role', 'alertdialog'); lb.setAttribute('data-code', 'ERR_LAUNCH');
    lb.innerHTML = '<div class="sheet"><h2></h2><p></p></div>';
    lb.querySelector('h2').textContent = I18N.t().brandTop + ' UNCHAINED'; lb.querySelector('p').textContent = I18N.rgs().errLaunch;
    document.body.appendChild(lb); document.title = 'Anubis Unchained';
    return;
  }

  // Statistiques EXACTES (loi exacte, plafond compris) : window.HOA_STATS de js/stats.js, généré par tools/gen-stats.js — affichées dans la table des gains
  var HS = (typeof window !== 'undefined' && window.HOA_STATS) || null;
  var STATS = HS ? { rtp: String(HS.std.rtp), rtpPlus: String(HS.plus.rtp), hit: String(HS.std.hit), bonusEvery: HS.std.bonusEvery.toFixed(1) }
    : { rtp: '96.2', rtpPlus: '96.2', hit: '32.7', bonusEvery: '19.3' };
  // argent de la démo : niveaux de mise, solde de départ et plafonds de perte sont donnés en « unités de base » puis adaptés à la devise
  // (applyScale : ×1 pour € $ CA$ SC GC, ×100 pour le yen : mises entières de 20 à 100 000…) ; arrondi au centime (r2) à chaque opération.
  // Avec le RGS, les niveaux viennent de la configuration et sont remplacés sur place (BETS.length = 0 puis push).
  var BASE_BETS = [0.20, 0.50, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  var BETS = BASE_BETS.slice();
  var BET_DEFAULT = 2;        // 1,00
  var START_BASE = 1000, START_BAL = START_BASE;
  var SAVE_VER = 2;           // v1 = ancien jeu en « crédits » (mises 10 à 5000, solde 10 000)
  var r2 = G.r2;
  var rr = function (n) { return LIVE ? G.r6(n) : r2(n); };   // montants du RGS : précision du serveur (micro-unités), démo locale : centimes
  var AUTO_STEPS = [0, 10, 25, 50, 100, Infinity];
  var SAVE_KEY = 'anubis_save_v1', OLD_SAVE_KEY = 'hoa_save_v1';   // ancienne clé lue une fois pour ne pas perdre les soldes
  var REPLAY = !!(root.Replay && root.Replay.active);   // mode replay (js/replay.js) : aucune sauvegarde lue ni écrite, pas d'écran d'accueil

  var S = { pending: 0, balance: LIVE ? 0 : START_BAL, bi: BET_DEFAULT, cur: '', curSet: false, lastWin: 0, autoIdx: 0, auto: 0, stopOnBonus: false, busy: false, hist: [], blocked: false, pendingEnd: false, stopWin: 0, reduced: false, mode: 'std', pact: 'std', buyOn: true, limit: 0, limitB: 0, quality: 'auto', limitHit: false, curLocked: false, balCur: 'EUR' };
  var SESS = { start: Date.now(), spins: 0, wag: 0, won: 0, lastCheck: Date.now() };
  // La session (début, tours, mises, gains, dernier rappel) survit au rechargement : sinon recharger la page remettrait à zéro la limite de perte et
  // le temps de jeu (contournement). Elle est écrite dans sessionStorage (cet onglet) ET localStorage (nouvel onglet, page rouverte) ;
  // au-delà de SESS_GAP sans activité dans localStorage, c'est une nouvelle session. Mode RGS : clé séparée (autre portefeuille).
  var SESS_KEY = 'anubis_sess_v1' + (LIVE ? '_rgs' : ''), SESS_GAP = 30 * 60000;
  var sessSyn = { spins: 0, wag: 0, won: 0 };   // dernière valeur connue du compteur partagé entre onglets (voir adoptSess)
  var tabOff = false;   // mode RGS : cet onglet n'est pas l'onglet de jeu actif (voir plus bas)
  var GLE_WAIT = 60000;   // ERR_GLE du RGS : plus aucune mise pendant cette durée, puis le serveur tranche de nouveau
  var LIMIT_BASE = [0, 20, 50, 100, 250, 500], LIMITS = LIMIT_BASE.slice();
  var hdr = null;   // chaîne d'en-tête (js/chains.js) : se brise quand un bonus s'ouvre, se reforme à sa sortie
  var rng = STAKE ? null : M.cryptoRng();   // build Stake : aucun tirage dans le navigateur (le RGS tire)

  // devise : ?currency= de l'URL (prioritaire, verrouille le sélecteur), sinon le choix du joueur, sinon la langue (démo locale) ;
  // en mode social : jetons SC / GC uniquement, jamais « $ »
  function pickCurrency() {
    var u = root.CUR.fromUrl(), soc = !!(root.SOCIAL && root.SOCIAL.active);
    if (u) S.curLocked = true;   // le client RGS peut aussi verrouiller (G.lockCurrency)
    var c = u || (S.curSet && S.cur) || (soc ? 'XSC' : I18N.defaultCurrency());
    if (soc && !root.CUR.isSocial(c)) c = 'XSC';
    if (!soc && !u && root.CUR.isSocial(c)) c = I18N.defaultCurrency();
    return c;
  }
  function limitLive(n) { var kb = BETS[0] > 0 ? BETS[0] / BASE_BETS[0] : 1; return n ? Math.max(BETS[0] || 0, G.rc(n * kb)) : 0; }
  // niveaux de mise, solde de départ et plafonds de perte de la démo, adaptés à la devise (k = taux indicatif de CUR)
  function applyScale(k) {
    if (LIVE) {   // mode RGS : niveaux de mise et solde viennent du serveur, jamais d'un taux indicatif
      if (S.bi >= BETS.length) S.bi = Math.max(0, BETS.length - 1); G.bet = BETS[S.bi];
      // [E2] plafonds de perte mis à l'échelle de la devise du RGS, d'après ses niveaux de mise (la plus petite mise vaut 0,20 en unités de base)
      LIMITS = LIMIT_BASE.map(function (n) { return limitLive(n); }); S.limit = limitLive(S.limitB);
      return;
    }
    BETS.length = 0; BASE_BETS.forEach(function (b) { BETS.push(r2(b * k)); });
    START_BAL = r2(START_BASE * k);
    LIMITS = LIMIT_BASE.map(function (n) { return r2(n * k); });
    S.limit = r2(S.limitB * k);
    if (S.bi >= BETS.length) S.bi = BETS.length - 1;
    G.bet = BETS[S.bi];
  }

  function sessRead(area) {
    try { var d = JSON.parse(root[area].getItem(SESS_KEY) || 'null'); return d && isFinite(d.start) && isFinite(d.last) && isFinite(d.wag) && isFinite(d.won) ? d : null; } catch (e) { return null; }
  }
  // reprise de la session enregistrée ; k = rapport de devise (montants enregistrés dans une autre devise)
  function loadSess() {
    if (REPLAY) return;
    var a = sessRead('sessionStorage'), b = sessRead('localStorage'), d = a && b ? (b.last > a.last ? b : a) : a || b;
    if (!d || (d === b && d !== a && Date.now() - d.last > SESS_GAP)) return;   // onglet sans historique et inactivité > 30 min : nouvelle session
    var k = root.CUR.known(d.cur) ? root.CUR.rate(S.cur) / root.CUR.rate(d.cur) : 1;
    SESS.start = Math.min(d.start, Date.now()); SESS.spins = Math.max(0, d.spins | 0); SESS.wag = G.rc(d.wag * k); SESS.won = G.rc(d.won * k);
    SESS.lastCheck = isFinite(d.lastCheck) ? Math.min(d.lastCheck, Date.now()) : Date.now();
    if (isFinite(d.gle) && d.gle > 0) S.gle = d.gle;
    sessSyn = { spins: SESS.spins, wag: SESS.wag, won: SESS.won };
  }
  function saveSess() {
    if (REPLAY) return;
    var j = JSON.stringify({ start: SESS.start, spins: SESS.spins, wag: SESS.wag, won: SESS.won, lastCheck: SESS.lastCheck, last: Date.now(), cur: S.cur, gle: S.gle || 0 });
    sessSyn = { spins: SESS.spins, wag: SESS.wag, won: SESS.won };
    ['sessionStorage', 'localStorage'].forEach(function (a) { try { root[a].setItem(SESS_KEY, j); } catch (e) {} });
  }
  // limite de perte : recalculée à chaque changement de session ou de plafond (rechargement, autre onglet, réglage)
  function checkLimit() { S.limitHit = S.limit > 0 && -net() >= S.limit; }

  function load() {
    if (REPLAY) return;
    try {
      var d = JSON.parse(localStorage.getItem(SAVE_KEY) || localStorage.getItem(OLD_SAVE_KEY) || 'null');
      if (d) {
        // ancienne sauvegarde (crédits, sans « v ») : solde, mise, gain en attente et limite repartent des valeurs par défaut
        if (d.lang && d.langSet && !I18N.fromUrl) { I18N.setLang(d.lang); S.langSet = true; }   // ?lang= dans l'URL prime ; une langue enregistrée par défaut (anciennes versions : français) est ignorée, seul un choix du joueur compte
        if (root.CUR.known(d.cur)) { S.cur = d.cur; S.curSet = true; }
        S.balCur = root.CUR.known(d.balCur) ? d.balCur : 'EUR';   // devise dans laquelle le solde enregistré est exprimé
        if (d.v >= SAVE_VER && !LIVE) {   // en mode RGS : solde, mise et gain en attente viennent du serveur, jamais du stockage local
          if (typeof d.balance === 'number' && isFinite(d.balance) && d.balance >= 0) S.balance = r2(d.balance);
          if (typeof d.bi === 'number' && BETS[d.bi]) S.bi = d.bi;
          // tour interrompu (rechargement en pleine animation) : le résultat était déjà décidé, on le crédite
          if (typeof d.pending === 'number' && d.pending > 0) { S.balance = r2(S.balance + d.pending); S.resumed = r2(d.pending); }
        }
        if (d.v >= SAVE_VER && LIMIT_BASE.indexOf(d.limit) >= 0) S.limitB = d.limit;   // plafond de perte (unités de base) : une préférence du joueur, conservée aussi en mode RGS
        if (d.muted) Sfx.setMuted(true);
        if (typeof d.pitch === 'number') Sfx.setPitch(d.pitch);
        if (typeof d.vol === 'number') Sfx.setVolume(d.vol);
        if (typeof d.tone === 'number') Sfx.setTone(d.tone);
        if (d.music === false) Sfx.setMusic(false);
        if (d.sfx === false) Sfx.setSfx(false);
        if (d.turbo) { G.turbo = true; G.ultra = !!d.ultra; G.speed = spd(); }
        if (typeof d.sobV2 === 'boolean') S.stopOnBonus = d.sobV2;   // (l'ancienne clé valait « oui » par défaut : ignorée)
        if (d.reduced) { S.reduced = true; FX.reduced = true; }
        if (Array.isArray(d.hist)) S.hist = d.hist.slice(0, 10);
        // [conformité] le mode Oracle+ (coût plus élevé) n'est jamais réactivé au chargement : il demande une confirmation à chaque activation
        if (d.buyOn === false) S.buyOn = false;
        // pacte : même prix et même RTP que la Balance (aucune confirmation requise) : il est retenu d'une visite à l'autre
        if (d.pact && M.PACTS && M.PACTS[d.pact]) S.pact = d.pact;
        if (d.quality) S.quality = d.quality;
      }
    } catch (e) {}
    // mouvement réduit : suit le réglage du système tant que le joueur n'a rien choisi
    try { if (!localStorage.getItem(SAVE_KEY) && !localStorage.getItem(OLD_SAVE_KEY) && root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches) { S.reduced = true; FX.reduced = true; } } catch (e) {}
    if (!LIVE && !(S.balance >= BETS[0])) S.balance = START_BAL;   // mode RGS : le solde ne vient que des réponses du serveur, jamais d'une valeur locale
    // devise effective, puis solde enregistré converti si elle diffère de celle du dernier enregistrement
    S.cur = pickCurrency(); G.currency = S.cur;
    var ratio = root.CUR.rate(S.cur) / root.CUR.rate(S.balCur);
    applyScale(root.CUR.rate(S.cur));
    if (!LIVE && ratio !== 1) { S.balance = G.rc(S.balance * ratio); if (S.resumed) S.resumed = G.rc(S.resumed * ratio); }
    if (!LIVE && !(S.balance >= BETS[0])) S.balance = START_BAL;
    S.synced = S.balance; loadSess(); checkLimit();
  }
  function save() {
    if (REPLAY) return;
    try {
      S.synced = S.balance;
      localStorage.setItem(SAVE_KEY, JSON.stringify({ v: SAVE_VER, t: Date.now(), cur: S.curSet ? S.cur : '', balCur: S.cur, pending: LIVE ? 0 : S.pending, balance: LIVE ? START_BAL : S.balance, bi: LIVE ? BET_DEFAULT : S.bi, lang: I18N.lang(), langSet: S.langSet ? 1 : 0, muted: Sfx.isMuted(), pitch: Sfx.getPitch(), vol: Sfx.getVolume(), tone: Sfx.getTone(), music: Sfx.isMusic(), sfx: Sfx.isSfx(), turbo: G.turbo, ultra: !!G.ultra, sobV2: S.stopOnBonus, reduced: S.reduced, hist: S.hist, mode: S.mode, pact: S.pact, buyOn: S.buyOn, limit: S.limitB, quality: S.quality }));
    } catch (e) {}
    saveSess();
  }

  /* ---------- HUD ---------- */
  G.bet = BETS[S.bi];
  // fenêtres modales et mixeur : même ouverture / fermeture courte (.closing ne joue que la sortie ; hidden est posé tout de suite),
  // le focus entre dans la fenêtre, y reste (Tab) et revient au bouton d'origine à la fermeture
  var lastFocus = null, closeTimers = {};
  function openEl(el) { clearTimeout(closeTimers[el.id]); el.classList.remove('closing'); el.hidden = false; }
  function closeEl(el) {
    if (el.hidden) return;
    el.hidden = true; el.classList.add('closing');
    closeTimers[el.id] = setTimeout(function () { el.classList.remove('closing'); }, 200);
  }
  function showModal() {
    var m = $('modal'); if (m.hidden) lastFocus = document.activeElement;
    var h = m.querySelector('h2'); if (h) { h.id = 'mTitle'; m.firstElementChild.setAttribute('aria-labelledby', 'mTitle'); }
    openEl(m); var f = $('modalClose'); if (f) f.focus();
  }
  function hideModal() { closeEl($('modal')); if (lastFocus && lastFocus.focus && document.contains(lastFocus)) { try { lastFocus.focus(); } catch (e) {} } lastFocus = null; nextWin(); }
  // file d'attente des fenêtres de message (limite atteinte, rappel des 30 min, erreurs) : une fenêtre déjà ouverte n'est jamais remplacée,
  // la suivante s'ouvre à sa fermeture (la limite de perte passe avant le rappel de durée)
  var winQueue = [];
  function queueWin(key, open, first) {
    if (winQueue.some(function (w) { return w.key === key; })) return;
    if ($('modal').hidden && !winQueue.length) { open(); return; }
    if (first) winQueue.unshift({ key: key, open: open }); else winQueue.push({ key: key, open: open });
    if ($('modal').hidden) nextWin();
  }
  function nextWin() {
    if (!winQueue.length) return;
    setTimeout(function () { if (winQueue.length && $('modal').hidden) { var w = winQueue.shift(); w.open(); } }, 260);
  }
  function bet() { return BETS[S.bi]; }
  // mode de mise du prochain tour : famille (Standard / Oracle+) × pacte (Scribe / Balance / Chacal) ; un pacte = un mode Stake distinct, même prix
  function curMode() { return M.modeFor(S.mode, S.pact); }
  function cost() { return r2(bet() * M.MODES[curMode()].cost); }
  G.cost = cost; G.curMode = curMode;
  function say(txt) { $('statusText').textContent = txt || ''; }
  G.say = say;

  // affiche un montant ; data-l réduit la police quand le texte est long (gros soldes, plafond × plus grosse mise)
  function setMoney(el, v) {
    var t = G.money(v); el.textContent = t;
    var n = t.length, l = n >= 14 ? 3 : n >= 11 ? 2 : n >= 9 ? 1 : 0;
    if (el.id === 'bet') l = n >= 16 ? 6 : n >= 12 ? 5 : n >= 10 ? 4 : n >= 8 ? 3 : n >= 6 ? 1 : 0;   // la mise a moins de place (entre − et +)
    el.setAttribute('data-l', String(l));
  }
  var shown = { bal: -1, win: -1 }, cnt = { bal: 0, win: 0 };
  function countTo(el, key, to, ms) {
    var from = shown[key] < 0 ? to : shown[key], me = ++cnt[key];   // me : une animation plus récente annule l'ancienne
    if (from === to || ms <= 0) { setMoney(el, to); shown[key] = to; return; }
    var t0 = performance.now();
    (function step(n) {
      if (me !== cnt[key]) return;
      var u = Math.min(1, (n - t0) / ms), v = from + (to - from) * (1 - Math.pow(1 - u, 3));
      setMoney(el, u < 1 ? G.rc(v) : to); shown[key] = v;
      if (u < 1) requestAnimationFrame(step); else shown[key] = to;
    })(t0);
  }
  function updateHud(anim) {
    countTo($('bal'), 'bal', S.balance, anim ? 600 : 0);
    setMoney($('bet'), bet());
    $('betCost').textContent = S.mode === 'plus' ? I18N.t().cost + ' ' + G.money(cost()) : '';
    G.bet = bet();
    $('betDn').disabled = S.busy || S.bi === 0;
    $('betUp').disabled = S.busy || S.bi === BETS.length - 1;
  }
  var winNow = 0;
  function setWin(v, anim) {
    winNow = v;
    countTo($('win'), 'win', v, anim ? 700 : 0);
    if (v > 0) { var el = $('statWin'); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  }
  function spd() { return G.ultra ? 6 : G.turbo ? 1.6 : 1; }
  function setSpinBtn() {
    var b = $('spin'), T = I18N.t();
    b.classList.toggle('stop', S.auto > 0);
    b.disabled = (S.busy && S.auto === 0) || S.blocked || tabOff;
    $('spinText').textContent = S.auto > 0 ? T.stop + (isFinite(S.auto) ? ' ' + S.auto : '') : T.spin;
    var rem = S.auto > 0 ? (isFinite(S.auto) ? String(S.auto) : '∞') : '';
    $('spinText').textContent = S.auto > 0 ? T.stop : T.spin;
    var at = $('autoText');
    if (S.auto > 0) { if (at.getAttribute('data-n') !== rem) { at.setAttribute('data-n', rem); at.textContent = T.auto + ' '; var nb = document.createElement('b'); nb.className = 'autoCount'; nb.textContent = rem; at.appendChild(nb); } }
    else { at.removeAttribute('data-n'); at.textContent = T.auto; }
    $('btnAuto').classList.toggle('on', S.auto > 0);
    $('btnTurbo').classList.toggle('on', G.turbo); $('btnTurbo').classList.toggle('ultra', !!G.ultra); $('btnTurbo').querySelector('span').textContent = G.ultra ? 'ULTRA' : T.turbo;
    $('btnPlus').classList.toggle('on', S.mode === 'plus'); $('plusText').textContent = T.oraclePlus + (S.mode === 'plus' ? ' · ' + G.money(cost()) : '');
    pactButton();
    $('btnBuy').hidden = !S.buyOn; $('btnBuy').disabled = S.busy || S.blocked || tabOff || S.auto > 0; $('buyText').textContent = T.buyBtn;
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
  // -1 : pas d'animation de gain (< ×1 le coût du tour) · 0 WIN · 1 BIG WIN · 2 EXTRA WIN · 3 MEGA WIN · 4 JUGEMENT DIVIN (seuils : G.WIN_TIERS)
  function tierOf(m) { var t = -1; G.WIN_TIERS.forEach(function (x, i) { if (m >= x) t = i; }); return t; }

  // resume = { round, bet } : reprise d'un round ouvert renvoyé par /wallet/authenticate (déjà débité côté serveur : aucune nouvelle mise)
  async function play(buyKind, resume) {
    if (S.busy || S.blocked || tabOff || (STAKE && !LIVE)) return;
    var T = I18N.t(), b = resume ? resume.bet : bet();
    var priceMult = buyKind ? M.BUY[buyKind].price : resume ? M.MODES[resume.mode].cost : M.MODES[curMode()].cost;
    var c = rr(b * priceMult);   // coût réel du mode = mise x coût du mode (barre d'espace, autoplay et achats passent tous par ici)
    if (!resume) {
      if (S.limitHit) { openLimit(); return; }
      if (gleActive()) { showMsg(T.brandTop + ' UNCHAINED', I18N.rgs().errGle, [[I18N.rgs().confirm]], 'gle'); say(I18N.rgs().errGle); return; }
      if (S.balance < c) { say(T.noFunds); Sfx.curse(); stopAuto(); return; }   // jamais de requête /wallet/play sans le solde pour le coût réel
    }
    Sfx.unlock(); Sfx.startAmbient(); Sfx.spinStart();
    if (G.pactFx) G.pactFx.reset();   // le sceau du pacte s'efface : le tour commence
    S.busy = true; G.speed = spd();
    var round, srv = null, hadBonus = false;
    if (LIVE) {
      setWin(0, false); setSpinBtn(); say(resume ? I18N.rgs().resuming : T.spinning);
      if (S.pendingEnd && !(await finishRound())) { S.busy = false; stopAuto(); updateHud(); setSpinBtn(); return; }   // un gain précédent n'a pas pu être encaissé
      try {
        srv = RG.readRound(resume ? resume.round : null);
        if (!resume) {
          var res = await RG.play(b, RG.modeName(S.mode, buyKind, S.pact));
          srv = RG.readRound(res.round); S.balance = G.r6(RG.fromMicro(res.balance.amount));
          SESS.spins++; SESS.wag = rr(SESS.wag + c); saveSess(); updateHud(true);
        }
        if (!srv.events.length) throw Object.assign(new Error('book'), { code: 'ERR_BOOK' });
        round = RG.bookToRound(srv.events, M);
      } catch (e) {
        S.busy = false; stopAuto(); updateHud(); setSpinBtn(); rgsFail(e); return;
      }
    } else {
      S.balance = r2(S.balance - c); SESS.spins++; SESS.wag = r2(SESS.wag + c); updateHud(true); setWin(0, false); setSpinBtn();
      round = buyKind ? M.playBuy(rng, buyKind) : M.playRound(rng, curMode());
      // le gain est connu avant l'animation : on le met en attente et on sauvegarde tout de suite la mise débitée
      S.pending = r2(Math.min(round.total, M.MAX_WIN) * b); save();
    }
    G.wheel.clearHighlight(); G.wheel.clearOracle();
    say(resume ? I18N.rgs().resuming : T.spinning);
    var total = 0;
    if (G.wrath) G.wrath.reset();
    // si le joueur choisit un autre profil de bonus, le gain en attente est recalculé et sauvegardé tout de suite
    G.onBonusChoice = function () { if (LIVE) return; var t = 0; round.spins.forEach(function (x) { t += x.pay; }); S.pending = r2(Math.min(t, M.MAX_WIN) * b); save(); };
    try { if (round.wrath && G.wrath) await G.wrath.begin(round.wrath);   // Colère d'Anubis : les chaînes se brisent avant la première rotation
    for (var i = 0; i < round.spins.length; i++) {
      var sp = round.spins[i];
      if (sp.wrath && G.wrath) G.wrath.sync(sp.wrath);
      if (!buyKind && sp.oracle) {
        $('oracleText').textContent = T.oracleOn + ' ×? → ' + T.kinds[sp.oracle.kind].replace('\n', ' ');   // valeur scellée jusqu'à l'arrêt de la roue
        $('oracle').hidden = false;
        await G.wheel.showOracle(sp.oracle);
      }
      var bonusBound = !buyKind && !(M.KINDS[sp.kind] || { bonus: true }).respin && (M.KINDS[sp.kind] || { bonus: true }).bonus;
      if (bonusBound && !G.turbo) setTimeout(function () { if (S.busy && G.wheel.spinning) Sfx.tension(3.2); }, 3000);   // anticipation : la roue ralentit vers un bonus
      if (!buyKind) { await G.wheel.spinTo(sp); Sfx.stopHit(bonusBound); }
      if (!buyKind && sp.oracle) { $('oracleText').textContent = T.oracleOn + ' ×' + sp.oracle.boost + ' → ' + T.kinds[sp.oracle.kind].replace('\n', ' '); await G.wheel.revealOracle(); }
      G.speed = spd();
      var def = M.KINDS[sp.kind] || { bonus: true };
      if (def.respin) {
        Sfx.shield(); say(T.ankhRespin); G.wheel.flashLamps = 1.0;
        await G.cellWin(sp);      // chaînes dorées qui cèdent, lumière divine : la roue est relancée
        if (sp.wrathUp && G.wrath) await G.wrath.up(sp.wrathUp);   // Colère : l'Ankh brise une chaîne, le multiplicateur monte
        G.wheel.clearOracle(); G.wheel.clearHighlight(); $('oracle').hidden = true;
        continue;
      }
      if (def.bonus) {
        hadBonus = true; say(sp.upgraded ? T.kindsLong.hand : T.kindsLong[sp.kind]);
        // on tombe sur un bonus : le turbo/ultra se coupe tout de suite pour jouer le bonus et ses animations à vitesse normale
        if (G.turbo) { G.turbo = false; G.ultra = false; G.speed = 1; setSpinBtn(); save(); }
        if (hdr) hdr.breakNow(function () { Sfx.chainBreak(true); });
        await G.cellWin(sp);      // la case s'anime (le scarabée s'envole, la plume tombe, la pyramide s'ouvre, Anubis frappe…) avant l'apparition d'Anubis
        await G.runBonus(sp, b);
        if (hdr) hdr.reform(function () { Sfx.chainForge(); });
      } else if (sp.pay > 0) {
        if (sp.boost > 1) await G.wheel.applyBoost();   // le chiffre de la case est réécrit déjà multiplié
        await G.cellWin(sp);      // pièces + compteur qui défile, plus riche selon la case
      } else {
        say(T.dust); await G.cellWin(sp);
      }
      total += sp.pay;
      $('oracle').hidden = true;
      if (LIVE) RG.betEvent(i + 1);   // progression du tour (reprise éventuelle côté serveur), sans attendre la réponse
    } } catch (err) {   // une scène en erreur ne doit jamais bloquer le jeu ni perdre le gain déjà décidé
      if (root.console) console.error(err);
      if (hdr) hdr.reform();
      if (G.wrath) G.wrath.reset();
      total = 0; round.spins.forEach(function (x) { total += x.pay; }); G.scene = null; G.eg = null; G.winOv = null; G.fade = 0; G.chain = null; G.fxScale = 1; G.setScene(null);
    }
    total = LIVE ? srv.mult : Math.min(total, M.MAX_WIN);   // en mode RGS le gain fait foi : payoutMultiplier du serveur, jamais recalculé par le jeu
    var amount = LIVE ? (srv.payout != null ? srv.payout : G.r6(total * b)) : r2(total * b);   // montant RGS (micro-unités) ; démo : centimes
    // cohérence : somme des événements, finalWin et payoutMultiplier doivent concorder ; sinon erreur affichée, montant du RGS crédité
    var mismatch = LIVE && (round.issues.length > 0 || Math.abs(round.sum - srv.mult) > 1e-6 || Math.abs(round.total - srv.mult) > 1e-6);
    if (mismatch) { stopAuto(); if (root.console) console.error('RGS book', srv.mult, round.sum, round.total, round.issues); }
    G.wheel.clearOracle(); $('oracle').hidden = true;
    if (G.wrath && G.wrath.active()) await G.wrath.end();
    if (amount > 0) {
      var tier = tierOf(total / priceMult);
      if (tier >= 0) await G.showBigWin(total, amount, tier);
      if (LIVE) { S.pendingEnd = true; await finishRound(); }   // round ouvert (gain > 0) : /wallet/end-round, jamais pour un 0x
      else S.balance = r2(S.balance + amount);
      S.lastWin = amount; SESS.won = rr(SESS.won + amount);
      setWin(amount, true); updateHud(true);
      say(T.winLine + ' ×' + G.fmt(total) + '  ·  ' + G.money(amount, true));
    } else { setWin(0); say(T.ready); }
    if (mismatch) showMsg(I18N.t().brandTop + ' UNCHAINED', I18N.rgs().errSum, [[I18N.rgs().confirm]]);
    pushHistory(total, hadBonus);
    G.wheel.clearHighlight();
    S.pending = 0; S.busy = false; G.speed = spd(); G.onBonusChoice = null;   // plus de rappel périmé d'un tour terminé
    save();
    var stopped = responsibleCheck() || (S.auto > 0 && S.stopWin > 0 && total >= S.stopWin);
    if (S.auto > 0 && !buyKind) {
      if (stopped || (hadBonus && S.stopOnBonus)) stopAuto(); else S.auto = isFinite(S.auto) ? S.auto - 1 : S.auto;
    }
    updateHud(); setSpinBtn();
    if (S.auto > 0) { await G.sleep(amount > 0 ? 0.7 : 0.25); if (S.auto > 0) play(); }
    else if (amount === 0) say(T.ready);
  }
  function gleActive() { return !!S.gle && Date.now() - S.gle < GLE_WAIT; }
  function stopAuto() { S.auto = 0; S.autoIdx = 0; setSpinBtn(); }

  /* ---------- mode RGS : encaissement, erreurs, démarrage ---------- */
  // /wallet/end-round : uniquement pour un round ouvert (gain > 0). Renvoie true si le gain est encaissé.
  async function finishRound() {
    try { var r = await RG.endRound(); S.balance = G.r6(RG.fromMicro(r.balance.amount)); S.pendingEnd = false; updateHud(true); return true; }
    catch (e) { rgsFail(e); return false; }
  }
  // texte de chaque code d'erreur (bloc « rgs » de js/i18n.js) ; ERR_IS / ERR_ATE / ERR_LOC / ERR_MAINTENANCE : la session est inutilisable -> écran de blocage
  var ERR_KEY = { ERR_VAL: 'errVal', ERR_IPB: 'errIpb', ERR_GLE: 'errGle', ERR_ACT: 'errAct', ERR_GEN: 'errGen', ERR_BOOK: 'errBook', ERR_URL: 'errUrl', ERR_IS: 'errIs', ERR_ATE: 'errAte', ERR_LOC: 'errLoc', ERR_MAINTENANCE: 'errMaint' };
  var ERR_FATAL = { ERR_IS: 1, ERR_ATE: 1, ERR_LOC: 1, ERR_MAINTENANCE: 1 };
  var ERR_BLOCK = { ERR_URL: 1, ERR_VAL: 1, ERR_IS: 1, ERR_ATE: 1, ERR_LOC: 1, ERR_MAINTENANCE: 1 };   // codes qui ont un texte propre sur l'écran de blocage
  // message clair selon le code d'erreur du RGS ; ERR_IPB / ERR_GLE : on resynchronise le solde (/wallet/balance)
  function rgsFail(e) {
    var T = I18N.rgs(), code = e && e.code || 'ERR_NET', key = ERR_KEY[code] || 'errNet';
    if (root.console) console.error('RGS', code, e && e.message);
    if (ERR_FATAL[code]) { blockGame(code); return; }
    if (code === 'ERR_GLE') { S.gle = Date.now(); saveSess(); }   // plafond de jeu du serveur : plus de mise pendant GLE_WAIT, la session le retient après rechargement
    if (code === 'ERR_IPB') { say(T.errIpb); Sfx.curse(); }
    else say(T[key]);
    if (code === 'ERR_IPB' || code === 'ERR_GLE' || code === 'ERR_NET') RG.balance().then(function (r) { S.balance = G.r6(RG.fromMicro(r.balance.amount)); updateHud(true); }, function () {});
    if (code !== 'ERR_IPB') showMsg(I18N.t().brandTop + ' UNCHAINED', T[key], [[T.confirm]]);
  }
  // blocage total : aucune mise possible tant que la connexion n'est pas établie (pas de repli local)
  function blockGame(code) {
    var T = I18N.rgs(), key = ERR_BLOCK[code] ? ERR_KEY[code] : 'errAuth', el = $('rgsBlock');
    S.blocked = true; S.auto = 0; setSpinBtn();
    if (!el) {
      el = document.createElement('div'); el.id = 'rgsBlock'; el.setAttribute('role', 'alertdialog'); el.setAttribute('aria-live', 'assertive');
      el.innerHTML = '<div class="sheet"><h2 id="rgsBlockT"></h2><p id="rgsBlockM"></p><div class="acts"><button type="button" class="btn-go" id="rgsBlockB"></button></div></div>';
      document.body.appendChild(el);
      $('rgsBlockB').addEventListener('click', function () { root.location.reload(); });
    }
    el.setAttribute('data-code', code || ''); hideModal();
    $('rgsBlockT').textContent = I18N.t().brandTop + ' UNCHAINED'; $('rgsBlockM').textContent = T[key]; $('rgsBlockB').textContent = T.retry;
    el.hidden = false; say(T[key]);
  }
  // niveaux de mise : uniquement ceux de config.betLevels (filtrés par minBet / maxBet) ; stepBet ne sert qu'à en générer si la liste est absente
  function betLevelsFrom(cfg) {
    var lv = (cfg.betLevels || []).map(Number).filter(function (v) { return isFinite(v) && v > 0 && (!(cfg.minBet > 0) || v >= cfg.minBet) && (!(cfg.maxBet > 0) || v <= cfg.maxBet); });
    if (!lv.length && cfg.minBet > 0 && cfg.maxBet >= cfg.minBet && cfg.stepBet > 0) for (var v = cfg.minBet; v <= cfg.maxBet && lv.length < 100; v += cfg.stepBet) lv.push(v);
    if (!lv.length && cfg.defaultBetLevel > 0) lv.push(cfg.defaultBetLevel);
    lv.sort(function (a, b) { return a - b; });
    return lv.filter(function (v, i) { return i === 0 || v !== lv[i - 1]; });
  }
  function nearest(lv, v) { var k = 0; lv.forEach(function (x, i) { if (Math.abs(x - v) < Math.abs(lv[k] - v)) k = i; }); return k; }
  function startRgs() {
    var P = RG.params, T = I18N.t();
    S.blocked = true; S.balance = 0;
    if (P.social && root.SOCIAL) root.SOCIAL.set(true);                          // ?social=true : textes et jetons du mode social dès le départ
    if (P.currency) { setCurrency(P.currency, true); S.curLocked = true; curButton(); }     // ?currency= : devise imposée (la réponse d'authentification prime ensuite)
    applyLang(); T = I18N.t();
    if (RG.error) { blockGame(RG.error); return; }
    say(I18N.rgs().connecting);
    RG.authenticate().then(function (a) {
      var cfg = a.config, lv = betLevelsFrom(cfg), rd = a.round && a.round.active ? a.round : null, ix;
      if (rd && !(rd.amount > 0)) rd = null;
      if (rd && lv.indexOf(rd.amount) < 0) { lv.push(rd.amount); lv.sort(function (x, y) { return x - y; }); }   // la mise du round repris reste sélectionnable
      // mode social : config.jurisdiction.socialCasino (SOCIAL.set recalcule textes et devise) ; devise : celle du solde du RGS, imposée au joueur
      if (root.SOCIAL) root.SOCIAL.set(!!(cfg.jurisdiction && cfg.jurisdiction.socialCasino) || P.social);
      var cur = root.CUR.norm(a.balance.currency);
      if (cur) G.setCurrency(cur, true);
      G.lockCurrency(true);
      BETS.length = 0; lv.forEach(function (v) { BETS.push(RG.fromMicro(v)); });
      ix = rd ? lv.indexOf(rd.amount) : nearest(lv, cfg.defaultBetLevel);   // round actif : sa mise ; sinon defaultBetLevel
      S.bi = Math.max(0, ix); G.bet = BETS[S.bi];
      applyScale(1); checkLimit();   // plafonds de perte recalculés d'après les niveaux de mise du RGS
      S.balance = G.r6(RG.fromMicro(a.balance.amount));
      S.blocked = false; shown.bal = -1; applyLang(); updateHud(); setSpinBtn(); say(I18N.t().ready);
      if (rd) {
        var pm = RG.parseMode(rd.mode); if (!pm.buy && pm.mode === 'plus') S.mode = 'plus';
        if (!pm.buy && pm.pact) S.pact = pm.pact;   // round repris : son pacte est celui du mode joué
        S.resume = { round: rd, bet: RG.fromMicro(rd.amount), mode: pm.mode, buy: pm.buy, mult: Number(rd.payoutMultiplier) || 0 };
        resumeRound();
      }
    }, function (e) { blockGame(e && ERR_BLOCK[e.code] ? e.code : 'ERR_AUTH'); });
  }
  // reprise d'un round ouvert : on le rejoue (la mise est déjà débitée), puis /wallet/end-round s'il paie
  function resumeRound() {
    var r = S.resume; if (!r || !started) return;
    S.resume = null;
    var st = r.round.state, n = Array.isArray(st) ? st.length : st && st.events ? st.events.length : 0;
    if (n) play(r.buy, r);
    else if (r.mult > 0) { S.pendingEnd = true; finishRound(); }
  }

  /* ---------- événements ---------- */
  $('spin').addEventListener('click', function () {
    Sfx.unlock();
    if (S.auto > 0) { stopAuto(); return; }
    if (G.skipWinOv()) return;
    play();
  });
  function stepBet(d) { if (S.busy) return; var n = S.bi + d; if (n < 0 || n >= BETS.length) return; S.bi = n; Sfx.click(); updateHud(); save(); }
  $('betDn').addEventListener('click', function () { stepBet(-1); });
  $('betUp').addEventListener('click', function () { stepBet(1); });
  $('btnTurbo').addEventListener('click', function () {   // arrêt → TURBO → ULTRA (résultat quasi instantané) → arrêt
    if (!G.turbo) { G.turbo = true; G.ultra = false; } else if (!G.ultra) G.ultra = true; else { G.turbo = false; G.ultra = false; }
    G.speed = spd(); Sfx.click(); setSpinBtn(); save();
  });
  function setPlus(on) { S.mode = on ? 'plus' : 'std'; Sfx.click(); updateHud(); setSpinBtn(); save(); say(S.mode === 'plus' ? I18N.t().plusHint : I18N.t().ready); }
  // [conformité] mode à coût plus élevé (Oracle+, mise x1,1) : confirmation avant ACTIVATION (rien n'est joué ni envoyé avant « Confirmer ») ; la désactivation est immédiate
  function confirmPlus() {
    var R = I18N.rgs(), T = I18N.t();
    $('modalBody').innerHTML = '<h2>' + R.plusConfirmTitle + '</h2><p id="plusConfirmTxt"></p><div class="acts"><button type="button" class="chip" id="plusNo">' + R.cancel + '</button><button type="button" class="btn-go" id="plusYes">' + R.confirm + '</button></div>';
    $('plusConfirmTxt').textContent = R.plusConfirm.replace('{name}', T.oraclePlus).replace('{price}', G.money(r2(bet() * M.MODES.plus.cost)));
    $('plusNo').onclick = function () { hideModal(); };
    $('plusYes').onclick = function () { hideModal(); setPlus(true); };
    showModal(); $('plusNo').focus();   // focus initial sur « Annuler »
  }
  $('btnPlus').addEventListener('click', function () { if (S.busy || S.blocked) return; if (S.mode === 'plus') setPlus(false); else confirmPlus(); });

  /* ---------- PACTES : décision du joueur AVANT le tour (docs/GAMEPLAY.md) ----------
   * Trois cartes (Scribe / Balance / Chacal) : chiffres tirés du calcul exact (js/stats.js) et de math.js. Choisir un pacte ne joue rien et n'envoie
   * aucune requête : il change le mode de mise du PROCHAIN tour (M.modeFor), au même prix et au même RTP ; impossible pendant un tour. */
  var PACT_ORDER = M.PACT_ORDER || ['safe', 'std', 'bold'];
  function pactButton() {
    var P = I18N.block('pact'), b = $('btnPact'); if (!b) return;
    var key = S.pact + '|' + I18N.lang();
    if (b.getAttribute('data-k') !== key) { b.setAttribute('data-k', key); $('pactIco').innerHTML = G.pactFx ? G.pactFx.icon(S.pact) : ''; $('pactText').textContent = P.short[S.pact]; b.setAttribute('aria-label', P.btn + ' : ' + P.name[S.pact]); }
    b.disabled = S.busy || S.blocked || tabOff || S.auto > 0; b.classList.toggle('lv1', S.pact === 'safe'); b.classList.toggle('lv3', S.pact === 'bold');
  }
  function pactFacts(p) {
    var P = I18N.block('pact'), T = I18N.t(), HS = root.HOA_STATS || {}, st = HS.pacts && HS.pacts[M.modeFor(S.mode, p)] || {};
    var lad = M.ladderOf(p), md = M.MODES[M.modeFor(S.mode, p)], n = function (x) { return Math.round(x).toLocaleString(I18N.locale()); };
    return [
      [I18N.block('rules').wrathH, String(P.vWrath).replace('{n}', n(1 / md.wrath)).replace('{a}', lad[0]).replace('{b}', lad[lad.length - 1])],
      [P.lBonus, String(T.kinds.scarab).replace('\n', ' ') + ' ×' + Math.max.apply(null, M.SCARAB_PROFILES[p]) + ' · ' + String(T.kinds.weigh).replace('\n', ' ') + ' ×' + Math.max.apply(null, M.WEIGH_PROFILES[p].map(function (q) { return q[0][1]; }))],
      [String(P.lBig).replace('{x}', n(M.PACT_BIG)), st.big ? String(P.vBig).replace('{n}', n(st.big)) : '—'],
      [P.lVol, P.vVol[p] + (st.sd ? ' (σ ' + st.sd.toLocaleString(I18N.locale(), { maximumFractionDigits: 1 }) + ')' : '')]
    ];
  }
  function setPact(p, anim) {
    if (!M.PACTS[p] || S.busy || S.blocked) return false;
    var changed = S.pact !== p, P = I18N.block('pact');
    S.pact = p; save(); updateHud(); setSpinBtn();
    say(String(P.say).replace('{name}', P.name[p]));
    if (anim !== false && G.pactFx) G.pactFx.seal(p);
    else Sfx.click();
    return changed;
  }
  G.setPact = setPact;
  function openPact() {
    if (S.busy || S.blocked || S.auto > 0) return;
    var P = I18N.block('pact'), HS = root.HOA_STATS || {}, rtpTxt = HS.std ? Number(HS.std.rtp).toLocaleString(I18N.locale(), { minimumFractionDigits: 2 }) + ' %' : '96,2 %';
    $('modalBody').innerHTML = '<h2>' + P.title + '</h2><p class="sub" id="pactSub"></p><div class="pactGrid" id="pactGrid" role="radiogroup"></div><p class="sub pactNote" id="pactNote"></p>';
    $('pactSub').textContent = String(P.sub).replace('{rtp}', rtpTxt); $('pactNote').textContent = P.buyNote;
    var grid = $('pactGrid');
    PACT_ORDER.forEach(function (p, i) {
      var on = S.pact === p, card = document.createElement('button');
      card.type = 'button'; card.className = 'pactCard lv' + (i + 1) + (on ? ' on' : ''); card.id = 'pact_' + p;
      card.setAttribute('role', 'radio'); card.setAttribute('aria-checked', on ? 'true' : 'false');
      var ic = document.createElement('div'); ic.className = 'pIco'; ic.innerHTML = G.pactFx ? G.pactFx.icon(p) : ''; card.appendChild(ic);
      var h = document.createElement('h4'); h.textContent = P.name[p]; card.appendChild(h);
      var tg = document.createElement('small'); tg.textContent = P.tag[p]; card.appendChild(tg);
      var dl = document.createElement('dl');
      pactFacts(p).forEach(function (f) { var dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = f[0]; dd.textContent = f[1]; dl.appendChild(dt); dl.appendChild(dd); });
      card.appendChild(dl);
      var go = document.createElement('div'); go.className = 'go'; go.textContent = on ? P.active : P.seal; card.appendChild(go);
      card.onclick = function () { hideModal(); setPact(p); };
      grid.appendChild(card);
    });
    showModal(); Sfx.click();
  }
  G.openPact = openPact;
  $('btnPact').addEventListener('click', function () { openPact(); });
  // [104] un appui sur AUTO n'engage aucun pari : il ouvre un panneau (nombre de tours, arrêts) à confirmer par « Démarrer »
  var STOP_WINS = [0, 10, 50, 100];
  function openAuto() {
    if (S.busy || S.blocked) return;
    var T = I18N.t(), R = I18N.rgs(), sel = Math.max(1, S.autoLast || 1), sw = S.stopWin;
    $('modalBody').innerHTML = '<h2>' + R.autoTitle + '</h2><p class="sub">' + R.autoSub + '</p>' +
      '<p class="sub">' + R.autoCost + ' : ' + G.money(cost()) + '</p>' +
      '<div class="opt"><span>' + R.autoRounds + '</span><div class="chips" id="apN"></div></div>' +
      '<div class="opt"><span>' + T.stopBonus + '</span><div class="chips"><button id="apBonus" type="button"></button></div></div>' +
      '<div class="opt"><span>' + R.autoStopWin + '</span><div class="chips" id="apWin"></div></div>' +
      '<div class="acts"><button type="button" class="chip" id="apCancel">' + R.cancel + '</button><button type="button" class="btn-go" id="apGo">' + R.autoStart + '</button></div>';
    function chips(box, items, cur, set) {
      box.innerHTML = '';
      items.forEach(function (it) { var bt = document.createElement('button'); bt.type = 'button'; bt.textContent = it[0]; bt.className = cur() === it[1] ? 'on' : ''; bt.onclick = function () { set(it[1]); chips(box, items, cur, set); }; box.appendChild(bt); });
    }
    chips($('apN'), AUTO_STEPS.slice(1).map(function (n, i) { return [isFinite(n) ? String(n) : '∞', i + 1]; }), function () { return sel; }, function (v) { sel = v; });
    chips($('apWin'), STOP_WINS.map(function (n) { return [n ? '×' + n : T.off, n]; }), function () { return sw; }, function (v) { sw = v; });
    function bonusBtn() { $('apBonus').textContent = S.stopOnBonus ? T.on : T.off; $('apBonus').className = S.stopOnBonus ? 'on' : ''; }
    bonusBtn(); $('apBonus').onclick = function () { S.stopOnBonus = !S.stopOnBonus; bonusBtn(); save(); };
    $('apCancel').onclick = function () { hideModal(); };
    $('apGo').disabled = S.balance < cost();
    $('apGo').onclick = function () {
      hideModal(); Sfx.unlock(); S.autoLast = sel; S.stopWin = sw; S.autoIdx = sel;
      S.auto = AUTO_STEPS[sel]; setSpinBtn(); play();
    };
    showModal(); Sfx.click();
  }
  $('btnAuto').addEventListener('click', function () {
    if (S.auto > 0) { stopAuto(); return; }
    openAuto();
  });
  function refreshSound() { $('btnSound').classList.toggle('off', Sfx.isMuted()); refreshMixer(); }
  /* ---------- mixeur rapide : volume, hauteur, ambiance, muet — sans ouvrir les réglages ---------- */
  function refreshMixer() {
    var T = I18N.t();
    if (!$('mixer')) return;
    $('mxTitle').textContent = T.sound; $('mxVolL').textContent = T.volumeL; $('mxPitchL').textContent = T.pitchShort;
    $('mxVol').value = Math.round(Sfx.getVolume() * 100); $('mxVolV').textContent = Math.round(Sfx.getVolume() * 100) + '%';
    $('mxTone').value = Math.round(Sfx.getTone() * 100); $('mxToneV').textContent = Math.round(Sfx.getTone() * 100) + '%'; $('mxToneL').textContent = T.toneShort;
    $('mxPitch').value = Sfx.getPitch(); $('mxPitchV').textContent = (Sfx.getPitch() > 0 ? '+' : '') + Sfx.getPitch();
    $('mxMute').textContent = Sfx.isMuted() ? T.soundOff : T.soundOn; $('mxMute').classList.toggle('on', !Sfx.isMuted());
    $('mxMusic').textContent = T.musicShort; $('mxMusic').classList.toggle('on', Sfx.isMusic());
    $('mxSfx').textContent = I18N.block('intro').sfxShort; $('mxSfx').classList.toggle('on', Sfx.isSfx());
    $('mxReset').textContent = T.resetL;
    $('btnSound').setAttribute('aria-label', T.mixLabel);
  }
  function toggleMixer(open) { var m = $('mixer'); open = open == null ? m.hidden : open; if (open) { openEl(m); refreshMixer(); $('mxClose').focus(); } else closeEl(m); $('btnSound').setAttribute('aria-expanded', open ? 'true' : 'false'); }
  $('btnSound').addEventListener('click', function (e) { e.stopPropagation(); Sfx.unlock(); toggleMixer(); });
  document.addEventListener('click', function (e) { if (!$('mixer').hidden && !$('mixer').contains(e.target) && e.target !== $('btnSound') && !$('btnSound').contains(e.target)) toggleMixer(false); });
  document.addEventListener('keydown', function (e) { if (e.code === 'Escape' && !$('mixer').hidden) { toggleMixer(false); $('btnSound').focus(); } });
  $('mxClose').addEventListener('click', function () { toggleMixer(false); $('btnSound').focus(); });
  $('mxVol').addEventListener('input', function () { Sfx.unlock(); Sfx.setVolume(this.value / 100); $('mxVolV').textContent = this.value + '%'; save(); });
  $('mxVol').addEventListener('change', function () { Sfx.coin(1); });
  $('mxTone').addEventListener('input', function () { Sfx.unlock(); Sfx.setTone(this.value / 100); $('mxToneV').textContent = this.value + '%'; save(); });
  $('mxTone').addEventListener('change', function () { Sfx.coin(1); Sfx.chime(4); });
  $('mxPitch').addEventListener('input', function () { Sfx.unlock(); Sfx.setPitch(+this.value); $('mxPitchV').textContent = (this.value > 0 ? '+' : '') + this.value; save(); });
  $('mxPitch').addEventListener('change', function () { Sfx.coin(1); Sfx.chime(4); });
  $('mxMute').addEventListener('click', function () { Sfx.unlock(); Sfx.setMuted(!Sfx.isMuted()); refreshSound(); save(); });
  $('mxMusic').addEventListener('click', function () { Sfx.unlock(); Sfx.setMusic(!Sfx.isMusic()); refreshMixer(); save(); });
  $('mxSfx').addEventListener('click', function () { Sfx.unlock(); Sfx.setSfx(!Sfx.isSfx()); refreshMixer(); save(); if (Sfx.isSfx()) Sfx.coin(1); });
  $('mxReset').addEventListener('click', function () { Sfx.setTone(0.3); Sfx.setPitch(0); Sfx.setVolume(1); Sfx.setMuted(false); Sfx.setMusic(true); Sfx.setSfx(true); refreshSound(); save(); Sfx.coin(1); });
  // devise : change le symbole et convertit solde, mises et plafonds de la démo (ratio des taux indicatifs de CUR)
  function curButton() {
    var b = $('btnCur'), sy = G.sym(), t = sy.length > 2 ? S.cur : sy;
    b.textContent = t; b.setAttribute('data-l', t.length > 2 ? '1' : '0');
    var hint = (!LIVE && !STAKE) ? ' — ' + I18N.t().curHint : '';   // démo : liste des devises et conversion indicative
    b.setAttribute('aria-label', I18N.t().currencyL + ' : ' + S.cur + hint); b.title = I18N.t().currencyL + ' : ' + S.cur + hint;
    b.style.display = S.curLocked ? 'none' : '';
  }
  function setCurrency(c, explicit) {
    c = root.CUR.norm(c); if (!c) return;
    var ratio = LIVE ? 1 : root.CUR.rate(c) / root.CUR.rate(G.currency), changed = c !== G.currency;
    S.cur = c; if (explicit !== false) S.curSet = true; G.currency = c;
    if (changed && ratio !== 1) {
      S.balance = G.rc(S.balance * ratio); SESS.wag = G.rc(SESS.wag * ratio); SESS.won = G.rc(SESS.won * ratio); S.lastWin = G.rc(S.lastWin * ratio); winNow = G.rc(winNow * ratio);
    }
    applyScale(root.CUR.rate(c));
    curButton();
    shown.bal = -1; shown.win = -1; updateHud(); setMoney($('win'), winNow); shown.win = winNow; setSpinBtn(); save();
  }
  $('btnCur').addEventListener('click', function () {
    if (S.busy || S.curLocked) return;
    var soc = !!(root.SOCIAL && root.SOCIAL.active), L = soc ? root.CUR.SOCIAL_LIST : root.CUR.FEATURED, i = L.indexOf(S.cur);
    Sfx.click(); setCurrency(L[(i + 1) % L.length]);
  });
  function applyLang() {
    I18N.setLang(I18N.lang());   // (re)pose dir, lang et polices de repli du canvas
    $('btnLang').textContent = I18N.lang().toUpperCase(); $('btnLang').setAttribute('aria-label', I18N.t().language);
    var U = I18N.block('ui');   // libellés d'accessibilité dans la langue courante
    $('stage').setAttribute('aria-label', U.stage); $('history').setAttribute('aria-label', U.history); $('oracle').setAttribute('aria-label', U.oracle);
    $('modalClose').setAttribute('aria-label', U.close); $('mxClose').setAttribute('aria-label', U.close); $('betDn').setAttribute('aria-label', U.amountDn); $('betUp').setAttribute('aria-label', U.amountUp);
    if ($('tabBlock') && !$('tabBlock').hidden) tabBlockUi(true);
    I18N.apply(); if (!S.curSet && !S.curLocked) { var pc = pickCurrency(); if (pc !== S.cur) { S.cur = pc; G.currency = pc; applyScale(root.CUR.rate(pc)); } } shown.bal = shown.win = -1; updateHud(); setMoney($('win'), winNow); shown.win = winNow; curButton(); setSpinBtn(); refreshMixer(); say(S.busy ? '' : I18N.t().ready);
    if (G.wheel.build && G.w) G.wheel.build();
    if (G.refreshSplash) G.refreshSplash();   // écran d'accueil : langue / mode social / session RGS changés
  }
  // sélecteur de langue : menu déroulant des 16 langues Stake (noms natifs), fermé par un clic ailleurs ou Échap
  var langMenu = null;
  function closeLangMenu() { if (langMenu) { langMenu.remove(); langMenu = null; $('btnLang').setAttribute('aria-expanded', 'false'); } }
  function openLangMenu() {
    closeLangMenu();
    langMenu = document.createElement('div'); langMenu.id = 'langMenu'; langMenu.setAttribute('role', 'listbox'); langMenu.setAttribute('aria-label', I18N.t().language);
    I18N.langs.forEach(function (l) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'option'); b.setAttribute('lang', l[0]); b.setAttribute('data-l', l[0]);
      b.setAttribute('aria-selected', l[0] === I18N.lang() ? 'true' : 'false'); b.textContent = l[1];
      b.addEventListener('click', function (e) { e.stopPropagation(); Sfx.click(); I18N.setLang(l[0]); S.langSet = true; applyLang(); save(); closeLangMenu(); $('btnLang').focus(); });
      langMenu.appendChild(b);
    });
    document.body.appendChild(langMenu); $('btnLang').setAttribute('aria-expanded', 'true');
    var r = $('btnLang').getBoundingClientRect(), mw = langMenu.offsetWidth, x = Math.min(Math.max(8, r.left), innerWidth - mw - 8);
    langMenu.style.left = x + 'px'; langMenu.style.top = (r.bottom + 6) + 'px';
    var cur = langMenu.querySelector('[aria-selected=true]'); if (cur) cur.focus();
  }
  $('btnLang').setAttribute('aria-haspopup', 'listbox'); $('btnLang').setAttribute('aria-expanded', 'false');
  $('btnLang').addEventListener('click', function (e) { e.stopPropagation(); Sfx.unlock(); if (langMenu) closeLangMenu(); else openLangMenu(); });
  document.addEventListener('click', function (e) { if (langMenu && !langMenu.contains(e.target)) closeLangMenu(); });
  document.addEventListener('keydown', function (e) {
    if (!langMenu) return;
    if (e.code === 'Escape') { closeLangMenu(); $('btnLang').focus(); return; }
    var items = Array.prototype.slice.call(langMenu.querySelectorAll('button')), i = items.indexOf(document.activeElement);
    if (e.code === 'ArrowDown' || e.code === 'ArrowUp') { e.preventDefault(); items[(i + (e.code === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus(); }
  });
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
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); if (e.repeat) return; if (!$('modal').hidden) return; if (G.skipWinOv()) return; if (S.busy && G.wheel.spinning) { G.speed = 3.2; return; } if (!S.busy) { Sfx.unlock(); play(); } }
    else if (e.code === 'ArrowUp') stepBet(1); else if (e.code === 'ArrowDown') stepBet(-1);
    else if (e.code === 'Escape') hideModal();
  });

  /* ---------- achat de bonus ---------- */
  var BUY_ORDER = ['vault', 'scarab', 'weigh', 'hand'];
  function buyIcon(kind) {
    var c = document.createElement('canvas'); c.width = c.height = 144; var x = c.getContext('2d'), A = root.Art;
    x.translate(72, 74);
    if (G.icon(x, kind, 0, 0, 140)) return c;
    if (kind === 'vault') A.pyramid(x, 0, 2, 110, '#cfc4e4', 'rgba(60,20,90,.6)');
    else if (kind === 'scarab') A.scarab(x, 0, 0, 100, '#d9b857', 'rgba(60,30,0,.6)');
    else if (kind === 'weigh') { A.feather(x, 0, 0, 110, '#f4ecd6', 'rgba(150,110,40,.8)'); }
    else A.hand(x, 0, 18, 52, {});
    return c;
  }
  function openBuy() {
    if (S.busy || !S.buyOn) return;
    var T = I18N.t(), b = bet();
    $('modalBody').innerHTML = '<h2>' + T.buyTitle + '</h2><p class="sub">' + T.buySub + '</p><div class="buyGrid" id="buyGrid"></div>' +
      '<p class="sub" style="margin-top:14px;font-size:12px">' + T.buyRtp + ' · ' + T.bet + ' ' + G.money(b) + '</p>';
    var grid = $('buyGrid');
    BUY_ORDER.forEach(function (k) {
      var price = r2(b * M.BUY[k].price), name = k === 'hand' ? T.kindsLong.hand : T.kindsLong[k];
      var card = document.createElement('button'); card.type = 'button'; card.className = 'buyCard'; card.disabled = S.balance < price;
      card.appendChild(buyIcon(k));
      var h = document.createElement('h4'); h.textContent = name; card.appendChild(h);
      var d = document.createElement('small'); d.textContent = T.buyDesc[k]; card.appendChild(d);
      var pr = document.createElement('div'); pr.className = 'pr'; pr.textContent = G.money(price); var mu = document.createElement('i'); mu.textContent = '(×' + M.BUY[k].price + ')'; pr.appendChild(mu); card.appendChild(pr);
      var go = document.createElement('div'); go.className = 'go'; go.textContent = card.disabled ? T.buyNoFunds : T.buyNow; card.appendChild(go);
      card.onclick = function () { confirmBuy(k, name, price); };
      grid.appendChild(card);
    });
    showModal(); Sfx.click();
  }
  // [31] achat de bonus (coût > 2x la mise) : fenêtre « Acheter X pour Y » avec Annuler / Confirmer ; rien n'est misé avant « Confirmer »
  function confirmBuy(k, name, price) {
    var R = I18N.rgs();
    $('modalBody').innerHTML = '<h2>' + R.buyConfirmTitle + '</h2><p id="buyConfirmTxt"></p><div class="acts"><button type="button" class="chip" id="buyNo">' + R.cancel + '</button><button type="button" class="btn-go" id="buyYes">' + R.confirm + '</button></div>';
    $('buyConfirmTxt').textContent = R.buyConfirm.replace('{name}', name).replace('{price}', G.money(price));
    $('buyNo').onclick = function () { hideModal(); };
    $('buyYes').disabled = S.balance < price;
    $('buyYes').onclick = function () { hideModal(); Sfx.unlock(); play(k); };
    $('buyNo').focus();   // [31] focus initial sur « Annuler » : un Entrée / Espace qui continue ne peut jamais confirmer un achat
  }
  // [31] une touche maintenue (e.repeat) ne déclenche jamais une carte d'achat ni la confirmation : seul un appui volontaire compte
  document.addEventListener('keydown', function (e) {
    if (!e.repeat || !(e.key === 'Enter' || e.key === ' ' || e.code === 'Space')) return;
    var t = e.target, id = t && t.id;
    if (id === 'buyNo' || id === 'buyYes' || id === 'plusNo' || id === 'plusYes' || (t && t.classList && t.classList.contains('buyCard'))) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  $('btnBuy').addEventListener('click', openBuy);

  /* ---------- jeu responsable ---------- */
  function net() { return rr(SESS.won - SESS.wag); }
  function showMsg(title, body, btns, key) {
    if (!$('modal').hidden) { queueWin(key || title, function () { showMsg(title, body, btns); }); return; }   // jamais par-dessus une autre fenêtre
    $('modalBody').innerHTML = '<h2>' + title + '</h2><p>' + body + '</p><div class="acts" id="msgBtns"></div>';
    btns.forEach(function (b, i) { var e = document.createElement('button'); e.type = 'button'; e.className = i ? 'chip' : 'btn-go'; e.textContent = b[0]; e.onclick = function () { hideModal(); if (b[1]) b[1](); }; $('msgBtns').appendChild(e); });
    showModal();
  }
  function openLimit() { var T = I18N.t(); showMsg(T.limitTitle, T.limitMsg, [[T.settings, openInfo]], 'limit'); }
  // renvoie true si l'auto-play doit s'arrêter
  function responsibleCheck() {
    var hit = S.limit > 0 && -net() >= S.limit, late = Date.now() - SESS.lastCheck > 30 * 60000;
    if (hit) { S.limitHit = true; stopAuto(); setTimeout(function () { queueWin('limit', openLimit, true); }, 600); }
    if (late) {
      SESS.lastCheck = Date.now(); stopAuto(); saveSess();
      var mins = Math.round((Date.now() - SESS.start) / 60000);
      setTimeout(function () { queueWin('reality', function () { showMsg(I18N.t().realityTitle, I18N.t().realityMsg(mins, G.money(net(), true)), [[I18N.t().keepPlaying]]); }); }, 600);
    }
    return hit || late;
  }

  /* ---------- table des gains & réglages ---------- */
  function openInfo() {
    var T = I18N.t(), k, rows = '';
    var desc = T.buyDesc; // mêmes descriptions que le menu d'achat : une seule source, une seule vérité
    ['m0', 'm025', 'm05', 'm1', 'm2', 'm3', 'ankh', 'scarab', 'weigh', 'vault'].forEach(function (id) {
      var def = M.KINDS[id], pays = def.bonus ? desc[id] : def.respin ? T.respinLabel : (def.mult ? def.mult + '×' : T.noWin);
      var fq = id === 'm05' ? 0.5 : id === 'm025' ? 0.3 : 0, disc = fq ? ' <svg width="15" height="15" viewBox="-8 -8 16 16" style="vertical-align:-3px;margin-left:4px"><circle r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M0 0V-6A6 6 0 ' + (fq > 0.5 ? 1 : 0) + ' 1 ' + (6 * Math.sin(2 * Math.PI * fq)).toFixed(2) + ' ' + (-6 * Math.cos(2 * Math.PI * fq)).toFixed(2) + 'Z" fill="currentColor"/></svg>' : '';
      var bi = (root.ANUBIS_IMG || {})['ic_' + id], pic = bi ? '<img class="rIc" alt="" src="' + bi + '" width="28" height="28">' : id === 'ankh' ? '<svg class="rAnk" viewBox="-14 -20 28 40" aria-hidden="true"><use href="#i-ankh" width="100%" height="100%"/></svg>' : '';
      rows += '<tr><td><span class="sw" style="background:' + G.kindColor(id) + '"></span>' + pic + T.kinds[id] + disc + '</td><td class="n">' + def.count + ' / ' + M.N + '</td><td>' + pays + '</td></tr>';
    });
    $('modalBody').innerHTML =
      '<h2>' + T.infoTitle + '</h2>' + (LIVE ? '' : '<p class="sub">' + T.demo + '</p><p class="sub">' + T.demoBuild + '</p><p class="sub">' + T.curHint + '</p>') +   // [77] « argent fictif / démo » : démo locale seulement, jamais en session RGS

      '<div class="kv"><div><label>' + T.rtp + '</label><b>' + STATS.rtp + '% <small style="font-size:11px;color:var(--turq)">· ORACLE+ ' + STATS.rtpPlus + '%</small></b></div><div><label>' + T.maxWin + '</label><b>' + G.fmt(M.MAX_WIN) + '×</b></div>' +
      '<div><label>' + T.hitRate + '</label><b>' + STATS.hit + '%</b></div><div><label>' + T.bonusFreq + '</label><b>1 / ' + STATS.bonusEvery + '</b></div><div><label>' + T.volat + '</label><b>' + T.volatV + '</b></div></div>' +
      '<h3>' + T.infoTitle.split('&')[0].trim() + '</h3>' + T.rules.map(function (r) { return '<p>• ' + r + '</p>'; }).join('') + '<p>• ' + T.rulesPlus + '</p>' + (S.buyOn ? '<p>• ' + T.buyTitle + ' : ' + BUY_ORDER.map(function (k) { return (k === 'hand' ? T.kindsLong.hand : T.kindsLong[k]) + ' ×' + M.BUY[k].price; }).join(' · ') + '</p>' : '') +
      '<h3>' + T.tableCols[0] + '</h3><table><tr><th>' + T.tableCols[0] + '</th><th>' + T.tableCols[1] + '</th><th>' + T.tableCols[2] + '</th></tr>' + rows + '</table>' +
      (root.Rules ? root.Rules.html() : '') +   // js/rules.js : modes (RTP, gain max), valeurs des bonus, relances, guide des boutons, avertissement

      '<h3>' + T.session + '</h3>' +
      '<div class="kv"><div><label>' + T.sessTime + '</label><b>' + Math.round((Date.now() - SESS.start) / 60000) + ' min</b></div><div><label>' + T.sessSpins + '</label><b>' + SESS.spins + '</b></div>' +
      '<div><label>' + T.sessWag + '</label><b>' + G.money(SESS.wag) + '</b></div><div><label>' + T.sessWon + '</label><b>' + G.money(SESS.won) + '</b></div><div><label>' + T.sessNet + '</label><b>' + G.money(net(), true) + '</b></div></div>' +
      '<h3>' + T.settings + '</h3>' +
      '<div class="opt"><span>' + T.currencyL + '</span><div class="chips" id="optCur"></div></div>' +
      '<div class="opt"><span>' + T.lossLimit + '</span><div class="chips" id="optLimit"></div></div>' +
      '<div class="opt"><span>' + T.qualityL + '</span><div class="chips" id="optQ"></div></div>' +
      '<div class="opt"><span>' + T.stopBonus + '</span><div class="chips"><button id="optStop" class="' + (S.stopOnBonus ? 'on' : '') + '" type="button">' + (S.stopOnBonus ? T.on : T.off) + '</button></div></div>' +
      '<div class="opt"><span>' + T.buyOn + '</span><div class="chips"><button id="optBuy" class="' + (S.buyOn ? 'on' : '') + '" type="button">' + (S.buyOn ? T.on : T.off) + '</button></div></div>' +
      '<div class="opt"><span>' + T.reducedFx + '</span><div class="chips"><button id="optRed" class="' + (S.reduced ? 'on' : '') + '" type="button">' + (S.reduced ? T.on : T.off) + '</button></div></div>' +
      // [222] « Réinitialiser le solde » n'existe que dans la démo locale : en mode RGS le solde ne vient que des réponses du serveur
      (LIVE ? '' : '<div class="opt"><span>' + T.resetBal + '</span><div class="chips"><button id="optReset" type="button">' + G.money(START_BAL) + '</button></div></div>');
    var ol = $('optLimit');
    LIMITS.forEach(function (n, li) {
      var bt = document.createElement('button'); bt.type = 'button'; bt.textContent = n ? G.money(n) : T.off; bt.className = S.limit === n ? 'on' : '';
      bt.onclick = function () { S.limitB = LIMIT_BASE[li]; S.limit = n; checkLimit(); save(); openInfo(); };
      ol.appendChild(bt);
    });
    var oc = $('optCur');
    if (S.curLocked) oc.parentNode.style.display = 'none';   // devise imposée par l'URL / le RGS
    (root.SOCIAL && root.SOCIAL.active ? root.CUR.SOCIAL_LIST : root.CUR.LIST).forEach(function (c) {
      var sy = root.CUR.symbol(c), bt = document.createElement('button'); bt.type = 'button'; bt.textContent = sy === c ? c : sy + ' ' + c; bt.className = S.cur === c ? 'on' : '';
      bt.onclick = function () { if (S.busy) return; setCurrency(c); openInfo(); };
      oc.appendChild(bt);
    });
    var oq = $('optQ');
    [['auto', T.qAuto], ['high', T.qHigh], ['low', T.qLow]].forEach(function (q) {
      var bt = document.createElement('button'); bt.type = 'button'; bt.textContent = q[1]; bt.className = S.quality === q[0] ? 'on' : '';
      bt.onclick = function () { S.quality = q[0]; G.setQuality(q[0]); save(); openInfo(); };
      oq.appendChild(bt);
    });
    $('optBuy').onclick = function () { S.buyOn = !S.buyOn; save(); setSpinBtn(); openInfo(); };
    $('optStop').onclick = function () { S.stopOnBonus = !S.stopOnBonus; save(); openInfo(); };
    $('optRed').onclick = function () { S.reduced = !S.reduced; FX.reduced = S.reduced; if (root.Chains) root.Chains.setReduced(S.reduced); save(); openInfo(); };
    if (!LIVE && $('optReset')) $('optReset').onclick = function () { if (S.busy) return; S.balance = START_BAL; shown.bal = -1; updateHud(); save(); };
    showModal(); Sfx.click();
  }
  $('btnInfo').addEventListener('click', openInfo);
  $('modalClose').addEventListener('click', function () { hideModal(); });
  $('modal').addEventListener('click', function (e) { if (e.target === $('modal')) hideModal(); });

  /* ---------- plusieurs onglets ---------- */
  // Démo : chaque onglet enregistre le même état ; un événement « storage » (jamais déclenché dans l'onglet qui écrit) fusionne l'autre sauvegarde :
  //  - préférences (langue, son, qualité, effets, plafond…) : le dernier écrivain gagne ;
  //  - solde : on applique l'écart réel de l'autre onglet depuis la dernière valeur connue (S.synced), donc la valeur la plus récente sans écraser
  //    ce que cet onglet vient de gagner ou miser ; le compteur de session se fusionne de la même façon.
  function adoptSave(json) {
    var d; try { d = JSON.parse(json); } catch (e) { return; }
    if (!d || d.v < SAVE_VER) return;
    if (d.lang && d.langSet && !I18N.fromUrl && d.lang !== I18N.lang()) { I18N.setLang(d.lang); applyLang(); }
    if (!!d.muted !== Sfx.isMuted()) Sfx.setMuted(!!d.muted);
    if (typeof d.pitch === 'number' && d.pitch !== Sfx.getPitch()) Sfx.setPitch(d.pitch);
    if (typeof d.vol === 'number') Sfx.setVolume(d.vol);
    if (typeof d.tone === 'number') Sfx.setTone(d.tone);
    if ((d.music !== false) !== Sfx.isMusic()) Sfx.setMusic(d.music !== false);
    if ((d.sfx !== false) !== Sfx.isSfx()) Sfx.setSfx(d.sfx !== false);
    if (d.quality && d.quality !== S.quality) { S.quality = d.quality; G.setQuality(d.quality); }
    if (!!d.reduced !== S.reduced) { S.reduced = !!d.reduced; FX.reduced = S.reduced; if (root.Chains) root.Chains.setReduced(S.reduced); }
    if (typeof d.sobV2 === 'boolean') S.stopOnBonus = d.sobV2;
    if (typeof d.buyOn === 'boolean') S.buyOn = d.buyOn;
    if (LIMIT_BASE.indexOf(d.limit) >= 0 && d.limit !== S.limitB) { S.limitB = d.limit; S.limit = LIVE ? limitLive(d.limit) : r2(d.limit * root.CUR.rate(S.cur)); checkLimit(); }
    if (!LIVE && typeof d.balance === 'number' && isFinite(d.balance) && d.balance >= 0) {
      var ob = G.rc(d.balance * root.CUR.rate(S.cur) / root.CUR.rate(root.CUR.known(d.balCur) ? d.balCur : 'EUR')), dl = r2(ob - S.synced);
      S.synced = ob;
      if (dl) { S.balance = r2(Math.max(0, S.balance + dl)); updateHud(true); }
    }
    refreshSound(); setSpinBtn();
  }
  function adoptSess(json) {
    var d; try { d = JSON.parse(json); } catch (e) { return; }
    if (!d || !isFinite(d.wag) || !isFinite(d.won)) return;
    var k = root.CUR.known(d.cur) ? root.CUR.rate(S.cur) / root.CUR.rate(d.cur) : 1, nw = G.rc(d.wag * k), nn = G.rc(d.won * k), ns = d.spins | 0;
    SESS.spins = Math.max(0, SESS.spins + ns - sessSyn.spins); SESS.wag = Math.max(0, r2(SESS.wag + nw - sessSyn.wag)); SESS.won = Math.max(0, r2(SESS.won + nn - sessSyn.won));
    sessSyn = { spins: ns, wag: nw, won: nn };
    if (isFinite(d.start)) SESS.start = Math.min(SESS.start, d.start);
    if (isFinite(d.lastCheck)) SESS.lastCheck = Math.max(SESS.lastCheck, d.lastCheck);
    if (d.gle > (S.gle || 0)) S.gle = d.gle;
    checkLimit();
  }
  // Mode RGS : un seul onglet de jeu à la fois (deux onglets = deux files de mises sur le même portefeuille). L'onglet actif écrit un battement
  // dans localStorage ; un second onglet se bloque derrière un message avec « Jouer ici », qui reprend la main et bloque l'autre.
  var TAB_KEY = 'anubis_tab_rgs', TAB_ID = Math.random().toString(36).slice(2) + Date.now().toString(36), TAB_FRESH = 100000, tabTimer = 0;
  function tabRead() { try { return JSON.parse(localStorage.getItem(TAB_KEY) || 'null'); } catch (e) { return null; } }
  function tabClaim() { try { localStorage.setItem(TAB_KEY, JSON.stringify({ id: TAB_ID, t: Date.now() })); } catch (e) {} }
  function tabOther() { var o = tabRead(); return o && o.id !== TAB_ID && Date.now() - o.t < TAB_FRESH ? o : null; }
  function tabBlockUi(on) {
    var U = I18N.block('ui'), el = $('tabBlock');
    if (!on) { if (el) el.hidden = true; return; }
    if (!el) {
      el = document.createElement('div'); el.id = 'tabBlock'; el.setAttribute('role', 'alertdialog'); el.setAttribute('aria-live', 'assertive'); el.setAttribute('aria-labelledby', 'tabBlockT');
      el.innerHTML = '<div class="sheet"><h2 id="tabBlockT"></h2><p id="tabBlockM"></p><div class="acts"><button type="button" class="btn-go" id="tabBlockB"></button></div></div>';
      document.body.appendChild(el);
      $('tabBlockB').addEventListener('click', function () { tabClaim(); tabSet(false); });
    }
    $('tabBlockT').textContent = U.tabTitle; $('tabBlockM').textContent = U.tabMsg; $('tabBlockB').textContent = U.tabHere;
    el.hidden = false; try { $('tabBlockB').focus(); } catch (e) {}
  }
  function tabSet(off) {
    if (off === tabOff) return;
    tabOff = off; if (off) stopAuto(); tabBlockUi(off); setSpinBtn();
    if (!off) say(I18N.t().ready);
  }
  function tabBeat() { if (tabOther()) tabSet(true); else { tabClaim(); if (tabOff) tabSet(false); } }   // propriétaire disparu (battement périmé) : on reprend
  function tabStart() {
    if (!LIVE || REPLAY) return;
    if (tabOther()) tabSet(true); else tabClaim();
    tabTimer = setInterval(tabBeat, 5000);
    root.addEventListener('pagehide', function () { var o = tabRead(); if (o && o.id === TAB_ID) { try { localStorage.removeItem(TAB_KEY); } catch (e) {} } });
  }
  root.addEventListener('storage', function (e) {
    if (REPLAY) return;
    if (e.key === SAVE_KEY && e.newValue) adoptSave(e.newValue);
    else if (e.key === SESS_KEY && e.newValue) adoptSess(e.newValue);
    else if (LIVE && e.key === TAB_KEY) { if (tabOther()) tabSet(true); else if (!e.newValue && tabOff) { tabClaim(); tabSet(false); } }   // l'autre onglet s'est fermé : on reprend automatiquement
  });
  root.addEventListener('pagehide', function () { saveSess(); });

  /* ---------- démarrage ---------- */
  load(); G.quality = S.quality; if (S.quality === 'low') { FX.lite = true; if (root.Grade) root.Grade.lite(true); } I18N.apply(); refreshSound(); applyLang();
  updateHud(); setWin(0); setSpinBtn(); renderHistory();
  if (S.resumed) { say(I18N.t().resumed + ' ' + G.money(S.resumed, true)); save(); }
  if (LIVE) { startRgs(); tabStart(); }
  // les polices du canvas doivent être prêtes avant le premier rendu (sinon texte de secours visible, et roue/médaillons mesurés avec la mauvaise police)
  var started = false;
  if (root.Chains) { root.Chains.setReduced(S.reduced); if ($('hdrChain')) hdr = root.Chains.header($('hdrChain')); }
  function startGame() { if (started) return; started = true; G.start(); resumeRound(); }
  if (document.fonts && document.fonts.load) {
    Promise.all(G.FONT_LOADS.map(function (f) { return document.fonts.load(f, 'ÉœéÀ0123456789×€$’'); })).then(startGame, startGame);
    setTimeout(startGame, 3000); // filet de sécurité : ne jamais bloquer le jeu sur une police
  } else startGame();
  // utilitaires de test (?debug)
  G.AUTO_STEPS = AUTO_STEPS; G.STOP_WINS = STOP_WINS; G.S = S; G.SESS = SESS; G.play = play; G.updateHud = updateHud; G.setWin = setWin; G.BETS = BETS; G.setCurrency = setCurrency; G.applyLang = applyLang; G.lockCurrency = function (on) { S.curLocked = on !== false; curButton(); };
  // mode social activé après coup (config.jurisdiction.socialCasino du RGS) : devise et textes sont recalculés
  G.onSocial = function () { var c = pickCurrency(); if (c !== S.cur) setCurrency(c, false); applyLang(); if (G.refreshSplash) G.refreshSplash(); };
  if (/[?&]debug/.test(location.search)) { G.debug = true; }

  /* ---------- écran d'accueil « Unchained » : Anubis enchaîné, carrousel des fonctionnalités, un appui brise les chaînes ---------- */
  // Décor, chaînes, cadenas, éclat de lumière : dessinés sur #spCv avec js/chains.js. Le même appui déverrouille l'audio (Sfx.unlock) et lance la musique.
  // Mouvement réduit : image fixe, pas de balancement ni de brisure animée (simple fondu), le carrousel défile sans animation.
  (function () {
    var sp = $('splash');
    // ?splash=1 force l'affichage (tests automatisés : sinon l'écran est retiré en présence de webdriver / ?debug)
    if (!sp || REPLAY || (!/[?&]splash=1/.test(location.search) && (navigator.webdriver || /[?&](debug|nosplash)/.test(location.search)))) { if (sp) sp.remove(); return; }
    var CH = root.Chains, cv = $('spCv'), cx = cv.getContext('2d'), IMG = root.ANUBIS_IMG || {}, pics = {};
    var W = 0, H = 0, dpr = 1, lay = null, chains = [], lk = { x: 0, y: 0, s: 60 }, motes = [], tStart = performance.now(), lastT = 0, raf = 0;
    var state = 'idle', tCharge = 0, tBreak = 0, anim = null, entering = false, cur = 0, userTouched = false, autoTimer = 0, scrollRaf = 0, skipped = false;
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function red() { return !!(S.reduced || FX.reduced); }
    function rtl() { return I18N.isRtl && I18N.isRtl(); }
    ['splash', 'splashp'].forEach(function (k) {
      if (!IMG[k]) return; var im = new Image();
      im.onload = function () { pics[k] = im; if (sp.isConnected) { layout(); paint(performance.now()); } };
      im.src = IMG[k];
    });

    /* ----- mise en page du décor : Anubis (image) centré sur le cadenas, chaînes tendues vers les bords ----- */
    function layout() {
      W = sp.clientWidth || root.innerWidth; H = sp.clientHeight || root.innerHeight; dpr = Math.min(root.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      var side = W > H * 1.2; sp.classList.toggle('side', side);
      var txt = sp.querySelector('.spTxt').getBoundingClientRect(), top = txt.top - sp.getBoundingClientRect().top;
      var key = side || W > H ? 'splash' : 'splashp', zoom = side ? 1.35 : key === 'splash' ? 1.22 : 1, fx = 0.5, fy = key === 'splash' ? 0.42 : 0.37;
      var ls = clamp(Math.min(W, H) * 0.17, 52, 124), ax = side ? W * 0.74 : W / 2, ay = side ? H * 0.5 : Math.max(H * 0.16, top - ls * 0.68 - 22);   // le cadenas se pose juste au-dessus du titre
      var im = pics[key], iw = im ? im.width : key === 'splash' ? 1344 : 752, ih = im ? im.height : key === 'splash' ? 752 : 1344, sc0 = Math.max(W / iw, H / ih);
      zoom = clamp(Math.max(zoom, (H - ay) / ((1 - fy) * ih * sc0)), 1, 1.8);   // assez de zoom pour pouvoir remonter l'image jusqu'à cette hauteur
      var sc = sc0 * zoom, dw = iw * sc, dh = ih * sc;
      var ox = clamp(ax - fx * dw, W - dw, 0), oy = clamp(ay - fy * dh, H - dh, 0);
      lay = { key: key, im: im, ox: ox, oy: oy, dw: dw, dh: dh };
      lk = { x: ox + fx * dw, y: oy + fy * dh, s: ls };
      var sz = clamp(Math.min(W, H) * 0.06, 18, 40), tg;
      if (side) tg = [[W * 1.06, -H * 0.06], [W * 1.06, H * 1.06], [W * 0.5, -H * 0.06], [W * 0.5, H * 1.06]];
      else tg = [[-W * 0.06, lk.y - H * 0.3], [W * 1.06, lk.y - H * 0.3], [-W * 0.06, lk.y + H * 0.17], [W * 1.06, lk.y + H * 0.17]];
      if (CH) chains = tg.map(function (p, i) { return CH.make(p[0], p[1], lk.x, lk.y, { size: sz, sag: 0.05, sway: red() ? 0 : 4, seed: i * 1.9 }); });
      motes = []; for (var i = 0; i < 36; i++) motes.push({ x: Math.random() * W, y: Math.random() * H, v: 6 + Math.random() * 14, r: 0.6 + Math.random() * 1.6, p: Math.random() * 6.28 });
    }

    /* ----- une image du décor ----- */
    function paint(now) {
      if (!sp.isConnected || !lay) return;
      var t = (now - tStart) / 1000, dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016, f = 0, rotLight = 0; lastT = now;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
      cx.fillStyle = '#050308'; cx.fillRect(0, 0, W, H);
      cx.save();
      if (anim && anim.shake > 0 && !red()) cx.translate((Math.random() - 0.5) * 16 * anim.shake, (Math.random() - 0.5) * 16 * anim.shake);
      var br = red() ? 0 : Math.sin(t * 0.5) * 0.008;   // lente qui respire
      if (lay.im) { var k = 1 + br; cx.drawImage(lay.im, lay.ox - lay.dw * br / 2, lay.oy - lay.dh * br / 2, lay.dw * k, lay.dh * k); }
      // étalonnage commun avec le reste du jeu : voile or sépia en multiplication, puis vignettage
      cx.globalCompositeOperation = 'multiply'; cx.fillStyle = 'rgba(214,176,112,.42)'; cx.fillRect(0, 0, W, H); cx.globalCompositeOperation = 'source-over';
      var vg = cx.createRadialGradient(lk.x, lk.y, Math.min(W, H) * 0.25, lk.x, lk.y, Math.max(W, H) * 0.85); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(2,1,4,.78)');
      cx.fillStyle = vg; cx.fillRect(0, 0, W, H);
      // lueur du sceau, qui bat doucement puis s'emballe avant la brisure
      var charge = state === 'charge' ? clamp((now - tCharge) / 300, 0, 1) : state === 'break' ? 1 : 0;
      var pulse = red() ? 0.6 : 0.55 + 0.45 * Math.sin(t * 2.2);
      cx.globalCompositeOperation = 'lighter';
      var gr = cx.createRadialGradient(lk.x, lk.y, 0, lk.x, lk.y, lk.s * (2.4 + charge * 2)); gr.addColorStop(0, 'rgba(217,184,87,' + (0.28 * pulse + 0.4 * charge) + ')'); gr.addColorStop(1, 'rgba(255,170,50,0)');
      cx.fillStyle = gr; cx.fillRect(lk.x - lk.s * 5, lk.y - lk.s * 5, lk.s * 10, lk.s * 10);
      cx.globalCompositeOperation = 'source-over';
      // chaînes (tendues, balancement léger), puis cadenas
      if (CH) {
        if (state === 'break' && anim) { anim.update(dt); anim.draw(cx, dpr); f = anim.flash; }
        else chains.forEach(function (c) { c.sway = red() ? 0 : 4 + charge * 12; CH.draw(cx, c, t * (1 + charge * 6), { dpr: dpr, shadow: 3 }); });
        var la = 1, ls = 1;
        if (state === 'break') { var u = clamp((now - tBreak) / 320, 0, 1); la = 1 - u; ls = 1 + u * 0.35; }
        if (la > 0.01) { cx.save(); cx.globalAlpha = la; cx.translate(lk.x, lk.y); cx.scale(ls, ls); cx.translate(-lk.x, -lk.y); CH.lock(cx, lk.x, lk.y, lk.s, { crack: charge, t: t }); cx.restore(); }
      }
      // poussière d'or
      cx.globalCompositeOperation = 'lighter';
      motes.forEach(function (m) {
        if (!red()) { m.y -= m.v * dt; m.x += Math.sin(t * 0.6 + m.p) * 4 * dt; if (m.y < -4) { m.y = H + 4; m.x = Math.random() * W; } }
        cx.fillStyle = 'rgba(255,220,140,' + (0.18 + 0.22 * (0.5 + 0.5 * Math.sin(t * 1.3 + m.p))) + ')'; cx.beginPath(); cx.arc(m.x, m.y, m.r, 0, 6.2832); cx.fill();
      });
      // éclat de lumière divine (brisure) : rayons, anneau, voile clair
      if (f > 0) {
        var R = Math.max(W, H);
        cx.fillStyle = 'rgba(255,238,180,' + (0.55 * f) + ')'; cx.fillRect(0, 0, W, H);
        var gl = cx.createRadialGradient(lk.x, lk.y, 0, lk.x, lk.y, R * (0.25 + 0.9 * (1 - f))); gl.addColorStop(0, 'rgba(255,252,230,' + (0.95 * f) + ')'); gl.addColorStop(1, 'rgba(217,184,87,0)');
        cx.fillStyle = gl; cx.fillRect(0, 0, W, H);
        cx.save(); cx.translate(lk.x, lk.y); rotLight = anim.t * 0.5;
        for (var i = 0; i < 14; i++) { var a = rotLight + i / 14 * 6.2832; cx.fillStyle = 'rgba(255,240,190,' + (0.3 * f) + ')'; cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(Math.cos(a - 0.05) * R, Math.sin(a - 0.05) * R); cx.lineTo(Math.cos(a + 0.05) * R, Math.sin(a + 0.05) * R); cx.fill(); }
        cx.restore();
        cx.strokeStyle = 'rgba(255,246,210,' + (0.8 * f) + ')'; cx.lineWidth = 6 * f + 1; cx.beginPath(); cx.arc(lk.x, lk.y, R * 0.7 * anim.ring, 0, 6.2832); cx.stroke();
      }
      cx.globalCompositeOperation = 'source-over';
      cx.restore();
    }
    function loop(now) {
      raf = 0; if (!sp.isConnected) return;
      if (state === 'charge' && now - tCharge >= 300) breakNow(now);
      paint(now);
      if (!red() || entering) raf = root.requestAnimationFrame(loop);
    }
    function kick() { if (!raf && sp.isConnected) raf = root.requestAnimationFrame(loop); }

    /* ----- un appui : les chaînes se brisent, l'audio se déverrouille, la musique démarre, le jeu apparaît ----- */
    function finish() { if (raf) root.cancelAnimationFrame(raf); clearInterval(autoTimer); root.removeEventListener('resize', onResize); sp.remove(); }
    function breakNow(now) {
      state = 'break'; tBreak = now; sp.classList.add('breaking'); Sfx.chainBreak();
      anim = CH.shatter(chains, { x: lk.x, y: lk.y, power: 1.15 });
      setTimeout(function () { sp.classList.add('out'); setTimeout(finish, 950); }, 1050);
    }
    function enter() {
      if (entering) return; entering = true;
      Sfx.unlock(); clearInterval(autoTimer);
      document.removeEventListener('keydown', key, true);
      setTimeout(function () { Sfx.startAmbient(); }, red() ? 400 : 1100);
      if (!CH || red()) { Sfx.chainBreak(); sp.classList.add('breaking'); sp.classList.add('out'); setTimeout(finish, 320); return; }
      state = 'charge'; tCharge = performance.now(); kick();
    }

    /* ----- carrousel des fonctionnalités : glissable (défilement natif), flèches, points, auto-défilement jusqu'au premier geste, « Passer » ----- */
    var track = $('spTrack'), dots = $('spDots');
    function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
    function img(k) { if (!IMG['ic_' + k]) return null; var i = el('img'); i.alt = ''; i.src = IMG['ic_' + k]; i.draggable = false; return i; }
    function chip(txt) { return el('span', 'spChip', txt); }
    function slideArt(i, box, T) {
      var k;
      if (i === 0) {   // Oracle : l'œil et les boosts possibles sur une case numérotée
        box.innerHTML = '<svg viewBox="0 0 48 24" aria-hidden="true"><use href="#i-eye"/></svg>';
        M.ORACLE_BOOST.num.forEach(function (b) { box.appendChild(chip('×' + b[0])); });
      } else if (i === 1) {   // 4 bonus + secret
        ['scarab', 'weigh', 'vault', 'hand'].forEach(function (n) { var m = img(n); if (m) box.appendChild(m); });
        box.appendChild(el('span', 'spQ', '?'));
      } else if (i === 2) {   // choix : pacte avant le tour (trois jauges), plume ou cœur, couleur de la Fureur
        var PB = I18N.block('pact');
        (M.PACT_ORDER || []).forEach(function (pp) { var c = chip(PB.short[pp]); if (G.pactFx) c.insertAdjacentHTML('afterbegin', G.pactFx.icon(pp)); c.classList.add('spPact'); box.appendChild(c); });
        ['#1fa596', '#cfa94c', '#c8392b'].forEach(function (c) { var d = el('span', 'spDot3'); d.style.background = c; box.appendChild(d); });
      } else {   // accès direct + vitesses
        k = img('coin'); if (k) box.appendChild(k);
        box.appendChild(chip(T.turbo)); box.appendChild(chip('ULTRA'));
      }
    }
    function buildSlides() {
      var I = I18N.block('intro'), T = I18N.t(), n = 4, ox = Math.max.apply(null, M.ORACLE_BOOST.bonus.map(function (b) { return b[0]; }));
      track.innerHTML = ''; dots.innerHTML = '';
      for (var i = 0; i < n; i++) (function (i) {
        var s = el('div', 'spSlide'), art = el('div', 'spArt'), lab = String(I.slideN).replace('{n}', i + 1).replace('{t}', n);
        s.setAttribute('role', 'group'); s.setAttribute('aria-roledescription', 'slide'); s.setAttribute('aria-label', lab);
        slideArt(i, art, T); s.appendChild(art); s.appendChild(el('h2', '', I['s' + (i + 1) + 'T'])); s.appendChild(el('p', '', i === 2 ? I18N.block('pact').slide : String(I['s' + (i + 1) + 'B']).replace('{ox}', ox)));
        track.appendChild(s);
        var d = el('button'); d.type = 'button'; d.setAttribute('aria-label', lab); d.addEventListener('click', function (e) { e.stopPropagation(); userTouched = true; go(i); }); dots.appendChild(d);
      })(i);
      $('spPrev').setAttribute('aria-label', I.prev); $('spNext').setAttribute('aria-label', I.next); $('spSkip').textContent = I.skip; $('spCar').setAttribute('aria-label', I.carLabel);
      mark(cur); track.scrollLeft = 0; if (cur) go(cur, true);
    }
    function mark(i) { cur = i; Array.prototype.forEach.call(dots.children, function (d, j) { if (j === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); }); }
    function go(i, instant) {
      var n = dots.children.length; if (!n) return; i = (i + n) % n; mark(i);
      var w = track.clientWidth; try { track.scrollTo({ left: (rtl() ? -1 : 1) * i * w, behavior: instant || red() ? 'auto' : 'smooth' }); } catch (e) { track.scrollLeft = (rtl() ? -1 : 1) * i * w; }
    }
    track.addEventListener('scroll', function () {
      if (scrollRaf) return;
      scrollRaf = root.requestAnimationFrame(function () { scrollRaf = 0; var w = track.clientWidth || 1, i = Math.round(Math.abs(track.scrollLeft) / w); if (i !== cur && i < dots.children.length) mark(i); });
    }, { passive: true });
    ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (ev) { track.addEventListener(ev, function () { userTouched = true; }, { passive: true }); });
    $('spPrev').addEventListener('click', function (e) { e.stopPropagation(); userTouched = true; Sfx.click(); go(cur - 1); });
    $('spNext').addEventListener('click', function (e) { e.stopPropagation(); userTouched = true; Sfx.click(); go(cur + 1); });
    $('spSkip').addEventListener('click', function (e) { e.stopPropagation(); $('spCar').hidden = true; skipped = true; clearInterval(autoTimer); layout(); paint(performance.now()); try { $('spBtn').focus({ preventScroll: true }); } catch (er) {} });
    function onResize() { layout(); go(cur, true); if (red()) paint(performance.now()); }
    root.addEventListener('resize', onResize);

    // textes de l'écran d'accueil, recalculés après l'authentification (G.onSocial : le mode social peut ne venir que de config.jurisdiction.socialCasino)
    // [77] E1 : « démo · argent fictif » n'a de sens qu'en démo locale ; en session RGS (portefeuille réel) il ne reste que le rappel de jeu responsable
    G.refreshSplash = function () {
      if (!sp.isConnected) return;
      var T = I18N.t(), I = I18N.block('intro');
      $('spSub').textContent = T.splashSub; $('spBtn').textContent = I.breakBtn;
      $('spDemo').textContent = LIVE ? String(T.splashDemo).split(' · ').pop() : T.splashDemo + ' · ' + T.demoBuild;
      buildSlides(); if (skipped) $('spCar').hidden = true;
      if (lay) { layout(); if (red() || !raf) paint(performance.now()); }
    };
    sp.hidden = false; G.refreshSplash(); layout(); kick(); if (red()) paint(performance.now());
    try { $('spBtn').focus({ preventScroll: true }); } catch (e) {}
    if (!red()) autoTimer = setInterval(function () { if (!userTouched && !document.hidden && !entering && !skipped) go(cur + 1); }, 4800);

    function key(e) {
      var t = e.target, inCar = t && t.closest && t.closest('#spCar');
      if (e.code === 'Tab') {   // le focus reste dans l'écran d'accueil
        var fs = Array.prototype.filter.call(sp.querySelectorAll('button'), function (b) { return b.offsetParent !== null; });
        if (!fs.length) return; var a = fs[0], z = fs[fs.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
        return;
      }
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') { if ($('spCar').hidden) return; e.preventDefault(); userTouched = true; go(cur + ((e.code === 'ArrowRight') !== rtl() ? 1 : -1)); return; }
      if (inCar && t.tagName === 'BUTTON') return;   // une flèche, un point ou « Passer » qui a le focus garde son comportement natif
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); enter(); }
    }
    document.addEventListener('keydown', key, true);
    sp.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.spCar')) return; enter(); });
  })();
})(window);
