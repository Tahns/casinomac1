/* ANUBIS UNCHAINED — client RGS (Stake Engine) : paramètres de lancement, API wallet, adaptateur « book » -> tour du jeu.
 *
 * MODE RGS = sessionID ET/OU rgs_url présents dans l'adresse. Sinon : démo locale (AnubisMath tire les tours dans le navigateur).
 * Aucune adresse de serveur n'est écrite en dur : tout passe par rgs_url (un hôte nu « rgs.exemple.com » reçoit https://).
 * Montants : micro-unités (1 000 000 = 1,00). payoutMultiplier de la réponse = multiple de la MISE DE BASE (float, 11.5 = 11,5×).
 * Un book (round.state) est la liste d'événements produite par tools/stake-export.js (payoutMultiplier des événements : entiers x100).
 *
 * Adaptateur books -> tours (bookToRound) — ce qui est perdu à l'export est repris par défaut :
 *  - profils Prudent/Audacieux : le book ne joue que le profil enregistré (profileChoice.binding = false), pas de choix côté joueur ;
 *  - Fureur d'Anubis : pas de choix de couleur (couleur 0 = turquoise) ; Pesée du Cœur : le choix plume/cœur reste affiché mais
 *    le résultat du book s'applique quel que soit le plateau touché (voir weighData) ;
 *  - Crypte : les blocs (type, colonne, valeur) sont rejoués par M.cryptReplay, source unique des règles.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root);
  else root.RGS = factory(root);
})(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var MICRO = 1000000, TIMEOUT_MS = 15000;
  var RGS = { enabled: false, error: null, params: {}, base: '', sessionID: '' };

  /* ---------- paramètres de lancement ---------- */
  function parseParams(search) {
    var o = {}, q = String(search || '').replace(/^\?/, '');
    q.split('&').forEach(function (kv) {
      if (!kv) return;
      var i = kv.indexOf('='), k = i < 0 ? kv : kv.slice(0, i), v = i < 0 ? '' : kv.slice(i + 1);
      try { o[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' ')); } catch (e) { o[k] = v; }
    });
    return o;
  }
  // « rgs.exemple.com » -> « https://rgs.exemple.com » ; null si inutilisable
  function normalizeUrl(raw) {
    var s = String(raw == null ? '' : raw).trim();
    if (!s || /\s/.test(s)) return null;
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = 'https://' + s.replace(/^\/+/, '');
    var u;
    try { u = new URL(s); } catch (e) { return null; }
    if ((u.protocol !== 'https:' && u.protocol !== 'http:') || !u.hostname) return null;
    return (u.origin + u.pathname).replace(/\/+$/, '');
  }
  function flag(v) { return v === 'true' || v === '1'; }

  RGS.parseParams = parseParams; RGS.normalizeUrl = normalizeUrl;
  RGS.toMicro = function (x) { return Math.round(x * MICRO); };
  RGS.fromMicro = function (n) { return Math.round(n) / MICRO; };

  RGS.init = function (search) {
    var p = parseParams(search);
    RGS.params = { sessionID: p.sessionID || '', rgs_url: p.rgs_url || '', lang: p.lang || '', currency: (p.currency || '').toUpperCase(), device: p.device || '', social: flag(p.social), demo: flag(p.demo), replay: flag(p.replay) };
    RGS.sessionID = RGS.params.sessionID; RGS.base = ''; RGS.error = null;
    // un lancement de rediffusion (replay=true) n'a pas de session : géré ailleurs, jamais d'appel wallet
    RGS.enabled = !RGS.params.replay && !!(RGS.params.sessionID || RGS.params.rgs_url);
    if (RGS.enabled) {
      RGS.base = normalizeUrl(RGS.params.rgs_url) || '';
      if (!RGS.base || !RGS.sessionID) RGS.error = 'ERR_URL';
    }
    return RGS;
  };

  /* ---------- appels ---------- */
  function RgsError(code, status, message) { var e = new Error(message || code); e.code = code; e.status = status || 0; return e; }
  var delay = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  async function post(path, body, tries) {
    if (!RGS.base) throw RgsError('ERR_URL');
    for (var n = 0; ; n++) {
      var ctl = typeof AbortController === 'function' ? new AbortController() : null, tm = ctl && setTimeout(function () { ctl.abort(); }, TIMEOUT_MS), res, data = null;
      try {
        res = await fetch(RGS.base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}), signal: ctl ? ctl.signal : undefined });
        try { data = await res.json(); } catch (e) { data = null; }
      } catch (e) { if (tm) clearTimeout(tm); throw RgsError('ERR_NET', 0, String(e && e.message || e)); }
      if (tm) clearTimeout(tm);
      var code = data && data.error ? String(data.error) : (!res.ok ? (res.status === 429 ? 'ERR_ACT' : res.status >= 500 ? 'ERR_GEN' : res.status >= 400 ? 'ERR_VAL' : 'ERR_NET') : '');
      if (!code && (!data || typeof data !== 'object')) code = 'ERR_NET';   // 200 sans JSON : ce n'est pas un RGS
      if (!code) return data;
      // ERR_ACT : « réessayer sous peu »
      if (code === 'ERR_ACT' && n < (tries == null ? 2 : tries)) { await delay(1000 * (n + 1)); continue; }
      throw RgsError(code, res.status, data && data.message);
    }
  }
  RGS.post = post;

  RGS.authenticate = function () {
    return post('/wallet/authenticate', { sessionID: RGS.sessionID }).then(function (d) {
      if (!d.balance || typeof d.balance.amount !== 'number' || !d.config) throw RgsError('ERR_NET', 200, 'incomplete authenticate response');
      return d;
    });
  };
  RGS.balance = function () { return post('/wallet/balance', { sessionID: RGS.sessionID }); };
  // bet : montant de base en unités ; mode : nom du mode du RGS (std, plus, buy_scarab…)
  RGS.play = function (bet, mode) { return post('/wallet/play', { sessionID: RGS.sessionID, amount: RGS.toMicro(bet), mode: mode }, 0); };
  RGS.endRound = function () { return post('/wallet/end-round', { sessionID: RGS.sessionID }); };
  RGS.betEvent = function (event) { return post('/bet/event', { sessionID: RGS.sessionID, event: String(event) }, 0).catch(function () {}); };

  // nom de mode du RGS <-> mode du jeu ({ mode:'std'|'plus', buy:'scarab'|'weigh'|'vault'|'hand' })
  var BUY_NAMES = { scarab: 'buy_scarab', weigh: 'buy_weigh', vault: 'buy_vault', hand: 'buy_fury' };
  RGS.modeName = function (mode, buy) { return buy ? BUY_NAMES[buy] : (mode === 'plus' ? 'plus' : 'std'); };
  RGS.parseMode = function (name) {
    var buy = null;
    Object.keys(BUY_NAMES).forEach(function (k) { if (BUY_NAMES[k] === name) buy = k; });
    return { mode: name === 'plus' ? 'plus' : 'std', buy: buy };
  };

  // réponse /wallet/play ou round actif -> { events, mult, amount (unités), active }
  RGS.readRound = function (round) {
    var st = round && round.state, ev = Array.isArray(st) ? st : (st && Array.isArray(st.events) ? st.events : []);
    var mult = Number(round && round.payoutMultiplier);
    if (!isFinite(mult)) mult = 0;
    return { events: ev, mult: mult, amount: RGS.fromMicro(Number(round && round.amount) || 0), active: !!(round && round.active), mode: round && round.mode };
  };

  /* ---------- adaptateur book -> tour ---------- */
  function bookToRound(events, M) {
    var S = M.SCALE || 100, f = function (n) { return n / S; };
    var rs = null, spins = [], spin = null, bev = null, bstart = null, oracle = null, fin = null;
    function blank() { return { oracle: null, index: -1, kind: 'm0', boost: 1, bonus: null, base: 0, pay: 0 }; }

    function weighData(list, profile) {
      var rv = list.filter(function (e) { return e.type === 'weighReveal'; })[0] || { mults: [1, 1], playerMult: 1, playerWins: false, win: 0 };
      var mine = f(rv.playerMult), other = f(rv.mults[1] != null ? rv.mults[1] : rv.mults[0]), wins = !!rv.playerWins;
      var d = { pair: [mine, other].sort(function (a, b) { return a - b; }), mults: [mine, other], heavy: wins ? 0 : 1, total: f(rv.win), profile: profile || 'std' }, p = 0;
      // le plateau TOUCHÉ reçoit la valeur du joueur ; il gagne si et seulement si le book le dit -> résultat identique quel que soit le choix
      Object.defineProperty(d, 'pick', { enumerable: true, get: function () { return p; }, set: function (v) {
        p = v === 1 ? 1 : 0; d.mults = p === 0 ? [mine, other] : [other, mine]; d.heavy = wins ? p : 1 - p;
      } });
      return d;
    }
    function build(kind, list) {
      var pc = list.filter(function (e) { return e.type === 'profileChoice'; })[0], profile = pc && pc.profile || 'std', i;
      if (kind === 'scarab') {
        var balls = list.filter(function (e) { return e.type === 'scarabDrop'; }).map(function (e) { return { path: e.path, slot: e.slot, value: f(e.win) }; }), t = 0;
        balls.forEach(function (b) { t += b.value; });
        return { balls: balls, total: t, values: M.SCARAB_PROFILES[profile] || M.SCARAB_PROFILES.std, profile: profile };
      }
      if (kind === 'weigh') return weighData(list, profile);
      if (kind === 'vault') {
        var picks = list.filter(function (e) { return e.type === 'vaultPick'; }).map(function (e) { return { token: typeof e.token === 'number' ? f(e.token) : e.token, total: f(e.runningTotal), saved: !!e.saved }; });
        var ve = list.filter(function (e) { return e.type === 'vaultEnd'; })[0] || { ended: 'cleared', finishBonus: 0, win: 0 };
        return { picks: picks, ended: ve.ended, bonusFinish: f(ve.finishBonus), total: f(ve.win), profile: profile };
      }
      if (kind === 'crypt') {
        var drops = list.filter(function (e) { return e.type === 'cryptDrop'; }).map(function (e) { return { t: e.block_type, c: e.column, v: e.value }; });
        var r = M.cryptReplay(drops);
        return { drops: drops, steps: r.steps, tops: r.tops, fixed: r.fixed, cols: r.cols, sum: r.sum, capped: r.capped, total: r.total, profile: 'crypt' };
      }
      if (kind === 'hand') {
        var hs = [], cur = null, end = list.filter(function (e) { return e.type === 'furyEnd'; })[0] || { win: 0 };
        list.forEach(function (e) {
          if (e.type === 'furySpin') { cur = { ev: e, nested: [] }; hs.push(cur); }
          else if (e.nested && cur) cur.nested.push(e);
        });
        var spinsH = hs.map(function (h) {
          var e = h.ev, rec = { idx: e.segment, kind: e.kind, mult: e.tier, final: !!e.final };
          if (e.kind === 'num') rec.base = e.number;
          if (e.kind === 'band') { rec.band = e.band; rec.x = e.bandMult; rec.bonus = build(e.band, h.nested); }
          return rec;
        });
        var hd = { spins: spinsH, mult: spinsH.length ? spinsH[spinsH.length - 1].mult : 1, total: 0, colour: 0 };
        M.handRecalc(hd);
        var want = f(end.win);
        if (Math.abs(hd.total - want) > 1e-9) { hd.total = want; if (spinsH.length) spinsH[spinsH.length - 1].pay = want; }
        return hd;
      }
      return null;
    }
    function closeSpin(e) {
      if (!spin) spin = blank();
      spin.pay = f(e.win); spin.base = spin.boost > 1 ? spin.pay / spin.boost : spin.pay;
      if (bstart) {
        var kind = bstart.bonus, b = build(kind, bev || []);
        spin.bonus = b; spin.base = b.total; spin.pay = b.total * (spin.boost || 1);
        if (Math.abs(spin.pay - f(e.win)) > 1e-6) spin.pay = f(e.win);
        if (kind === 'crypt' || bstart.secret) { spin.secret = true; spin.profile = 'crypt'; }
        else if (kind === 'hand') { spin.upgraded = true; spin.profile = 'turq'; }
        else spin.profile = b.profile || 'std';
        if (spin.index < 0) spin.kind = kind === 'crypt' ? 'vault' : kind;   // achat : la scène lit sp.kind
      }
      spins.push(spin); spin = null; bev = null; bstart = null;
    }
    (events || []).forEach(function (e) {
      switch (e.type) {
        case 'roundStart': rs = e; break;
        case 'oracle': oracle = { kind: e.kind, boost: e.boost }; break;
        case 'wheelStop': spin = blank(); spin.oracle = oracle; oracle = null; spin.index = e.index; spin.kind = e.kind; spin.boost = e.boost || 1; break;
        case 'bonusStart': if (!spin) spin = blank(); bstart = e; bev = []; break;
        case 'spinWin': closeSpin(e); break;
        case 'finalWin': fin = e; break;
        default: if (bev) bev.push(e);
      }
    });
    var total = 0; spins.forEach(function (s) { total += s.pay; });
    var capped = fin ? !!fin.capped : total > M.MAX_WIN;
    return { spins: spins, total: fin ? f(fin.amount) : Math.min(total, M.MAX_WIN), capped: capped, cost: rs ? f(rs.cost) : 1, mode: rs ? rs.mode : 'std' };
  }
  RGS.bookToRound = bookToRound;

  // actif sur le navigateur uniquement
  if (root && root.location && typeof root.location.search === 'string' && root.document) RGS.init(root.location.search);
  return RGS;
});
