/* ANUBIS UNCHAINED — client RGS (Stake Engine) : paramètres de lancement, API wallet, adaptateur « book » -> tour du jeu.
 *
 * MODE RGS = sessionID ET/OU rgs_url présents dans l'adresse. Sinon : démo locale (AnubisMath tire les tours dans le navigateur).
 * Aucune adresse de serveur n'est écrite en dur : tout passe par rgs_url (un hôte nu « rgs.exemple.com » reçoit https://).
 * Montants : micro-unités (1 000 000 = 1,00). payoutMultiplier de la réponse = multiple de la MISE DE BASE (float, 11.5 = 11,5×).
 * Un book (round.state) est la liste d'événements v2 produite par tools/stake-export.js (montants des événements : entiers x100).
 *
 * Adaptateur books v2 -> tours (bookToRound) : format DÉFINITIF documenté en tête de tools/stake-export.js.
 *  - le front ne recalcule jamais le gain : payoutMultiplier (RGS) fait foi ; l'adaptateur relève seulement les incohérences (round.issues) ;
 *  - choix du joueur : Fureur d'Anubis (3 variantes de couleur dans le book -> sp.options) et Pesée du Cœur (2 variantes plume / cœur ->
 *    data.pick sélectionne l'affichage) restent de vrais choix, pré-résolus : tous les choix paient le même total ;
 *  - profils Prudent/Audacieux : absents (tous les bonus se jouent en profil Équilibré) ; Sanctuaire des Marées et Oracle scellé lus tels quels.
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

  // réponse /wallet/play ou round actif -> { events, mult, amount (mise de base, unités), payout (gain en unités ou null), active }
  RGS.readRound = function (round) {
    var st = round && round.state, ev = Array.isArray(st) ? st : (st && Array.isArray(st.events) ? st.events : []);
    var mult = Number(round && round.payoutMultiplier);
    if (!isFinite(mult)) mult = 0;
    var pay = round && round.payout != null && isFinite(Number(round.payout)) ? RGS.fromMicro(Number(round.payout)) : null;
    return { events: ev, mult: mult, amount: RGS.fromMicro(Number(round && round.amount) || 0), payout: pay, active: !!(round && round.active), mode: round && round.mode };
  };

  /* ---------- adaptateur book v2 -> tour du jeu ----------
   * Format : voir l'en-tête de tools/stake-export.js (contrat DÉFINITIF). Aucun gain n'est recalculé ici : chaque valeur vient d'un événement ;
   * round.issues liste les incohérences relevées (somme des tours, finalWin, roue) — le jeu les signale et crédite le montant du RGS. */
  function bookError(msg) { var e = new Error(msg); e.code = 'ERR_BOOK'; return e; }
  var TOL = 1e-6;
  function bookToRound(events, M) {
    var S = M.SCALE || 100, f = function (n) { return n / S; };
    var rs = null, spins = [], spin = null, bev = null, bstart = null, oracle = null, fin = null, issues = [];
    function blank() { return { oracle: null, index: -1, kind: 'm0', boost: 1, bonus: null, base: 0, pay: 0 }; }
    function of(list, type) { return list.filter(function (e) { return e.type === type; }); }

    // Pesée : les deux variantes (plume / cœur) viennent du book ; le choix du joueur sélectionne celle qui est affichée (total identique)
    function weighData(list) {
      var rv = of(list, 'weighReveal')[0];
      if (!rv || !rv.variants || rv.variants.length !== 2) throw bookError('weighReveal');
      var vs = rv.variants.map(function (v) { return { mults: v.mults.map(f), heavy: v.heavy }; }), p = 0;
      var d = { pair: vs[0].mults.slice().sort(function (a, b) { return a - b; }), mults: vs[0].mults.slice(), heavy: vs[0].heavy, total: f(rv.win), fixed: f(rv.win), profile: 'std' };
      Object.defineProperty(d, 'pick', { enumerable: true, get: function () { return p; }, set: function (v) {
        p = v === 1 ? 1 : 0; d.mults = vs[p].mults.slice(); d.heavy = vs[p].heavy;
      } });
      return d;
    }
    function handData(list, color) {
      var mine = list.filter(function (e) { return e.color === color; }), hs = [], cur = null, end = of(mine, 'furyEnd')[0];
      if (!end) throw bookError('furyEnd ' + color);
      mine.forEach(function (e) {
        if (e.type === 'furySpin') { cur = { ev: e, nested: [] }; hs.push(cur); }
        else if (e.nested && cur) cur.nested.push(e);
      });
      var spinsH = hs.map(function (h) {
        var e = h.ev, rec = { idx: e.segment, kind: e.kind, mult: e.tier, final: !!e.final };
        if (e.kind === 'num') rec.base = f(e.number);
        if (e.kind === 'band') { rec.band = e.band; rec.x = e.bandMult; rec.bonus = build(e.band, h.nested); }
        return rec;
      });
      if (!spinsH.length) throw bookError('furySpin ' + color);
      spinsH[spinsH.length - 1].pay = f(end.pay);
      return { spins: spinsH, mult: spinsH[spinsH.length - 1].mult, total: f(end.win), colour: color };
    }
    function build(kind, list) {
      var i;
      if (kind === 'scarab') {
        var balls = of(list, 'scarabDrop').map(function (e) { return { path: e.path, slot: e.slot, value: f(e.win) }; }), t = 0;
        balls.forEach(function (b) { t += b.value; });
        return { balls: balls, total: Math.round(t * S) / S, values: M.SCARAB_PROFILES.std, profile: 'std' };
      }
      if (kind === 'weigh') return weighData(list);
      if (kind === 'vault') {
        var picks = of(list, 'vaultPick').map(function (e) { return { token: typeof e.token === 'number' ? f(e.token) : e.token, total: f(e.runningTotal), left: e.chestsLeft }; });
        var ve = of(list, 'vaultEnd')[0];
        if (!ve) throw bookError('vaultEnd');
        return { picks: picks, ended: ve.ended, bonusFinish: f(ve.finishBonus), total: f(ve.win), profile: 'std' };
      }
      if (kind === 'crypt') {
        var steps = of(list, 'sanctuaryTablet').map(function (e) { return { t: e.tablet_type, v: e.value, poolBefore: f(e.offeringBefore), tideBefore: e.tideBefore, gain: f(e.gain), pool: f(e.offering), tide: e.tide }; });
        var se = of(list, 'sanctuaryEnd')[0];
        if (!se) throw bookError('sanctuaryEnd');
        return { drops: steps.map(function (st) { return { t: st.t, v: st.v }; }), steps: steps, pool: f(se.offering), tide: se.tide, capped: !!se.capped, total: f(se.win), profile: 'crypt' };
      }
      if (kind === 'hand') {
        var opts = {}, names = M.HAND_COLORS;
        for (i = 0; i < 3; i++) opts[names[i]] = handData(list, i);
        return { options: opts };   // la scène choisit la variante (couleur du joueur)
      }
      throw bookError('bonus ' + kind);
    }
    function closeSpin(e) {
      if (!spin) spin = blank();
      spin.pay = f(e.win); spin.base = spin.boost > 1 ? spin.pay / spin.boost : spin.pay;
      if (bstart) {
        var kind = bstart.bonus, b = build(kind, bev || []);
        if (kind === 'hand') {
          spin.options = b.options; spin.bonus = b.options[M.HAND_COLORS[0]]; spin.upgraded = true; spin.profile = M.HAND_COLORS[0];
        } else {
          spin.bonus = b; spin.profile = b.profile || 'std';
          if (kind === 'crypt' || bstart.secret) { spin.secret = true; spin.profile = 'crypt'; }
        }
        spin.base = spin.bonus.total;
        if (Math.abs(spin.base * (spin.boost || 1) - spin.pay) > TOL) issues.push('spin ' + (spins.length + 1) + ' : bonus ' + spin.base * (spin.boost || 1) + ' ≠ spinWin ' + spin.pay);
        if (spin.index < 0) spin.kind = bstart.kind || (kind === 'crypt' ? 'vault' : kind);   // achat : la scène lit sp.kind
      }
      spins.push(spin); spin = null; bev = null; bstart = null;
    }
    (events || []).forEach(function (e) {
      switch (e.type) {
        case 'roundStart':
          rs = e;
          if (e.v !== 2) throw bookError('format de book ' + e.v + ' (v2 attendu)');
          if (e.cells !== M.N) throw bookError('roue de ' + e.cells + ' cases (' + M.N + ' attendues)');
          break;
        case 'oracle': oracle = { kind: e.kind, boost: e.boost }; break;
        case 'wheelStop':
          spin = blank(); spin.oracle = oracle; oracle = null; spin.index = e.index; spin.kind = e.kind; spin.boost = e.boost || 1;
          if (M.LAYOUT[e.index] !== e.kind) issues.push('roue : case ' + e.index + ' = ' + M.LAYOUT[e.index] + ' ≠ ' + e.kind);
          break;
        case 'bonusStart': if (!spin) spin = blank(); bstart = e; bev = []; break;
        case 'spinWin': closeSpin(e); break;
        case 'finalWin': fin = e; break;
        case 'oracleReveal': break;   // la valeur est déjà dans l'événement oracle ; l'affichage la révèle à l'arrêt de la roue
        default: if (bev) bev.push(e);
      }
    });
    if (!rs) throw bookError('roundStart absent');
    if (!fin) throw bookError('finalWin absent');
    var sum = 0; spins.forEach(function (s) { sum += s.pay; });
    sum = Math.min(Math.round(sum * S) / S, M.MAX_WIN);
    var total = f(fin.amount);
    if (Math.abs(total - sum) > TOL) issues.push('finalWin ' + total + ' ≠ somme des tours ' + sum);
    return { spins: spins, total: total, sum: sum, capped: !!fin.capped, cost: f(rs.cost), mode: rs.mode, issues: issues, version: 2 };
  }
  RGS.bookToRound = bookToRound;

  // actif sur le navigateur uniquement
  if (root && root.location && typeof root.location.search === 'string' && root.document) RGS.init(root.location.search);
  return RGS;
});
