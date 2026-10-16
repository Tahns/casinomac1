/* ANUBIS UNCHAINED — règles détaillées (fenêtre Infos) : RTP et gain max par mode, formation des gains, valeurs des bonus,
 * relances / re-déclenchements, guide des boutons et avertissement général. Les textes viennent du bloc « rules » de i18n.js
 * (repli sur l'anglais), tous les chiffres de math.js (valeurs, chances) et de js/stats.js (RTP exacts, généré par tools/gen-stats.js). */
(function (root) {
  'use strict';
  var M = root.AnubisMath;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function fr() { return root.I18N.lang() === 'fr'; }
  function loc() { return root.I18N.locale ? root.I18N.locale() : (fr() ? 'fr-FR' : 'en-US'); }   // nombres à la locale de la langue (virgule décimale, séparateurs)
  function pcs() { return { fr: 1, de: 1, es: 1, pt: 1, pl: 1, id: 1, vi: 1, fi: 1, ru: 1 }[root.I18N.lang()] ? '\u00a0%' : '%'; }   // « 96 % » comme dans les textes de ces langues
  function num(x, d) {   // nombre à la locale de la langue : 1 234,5 (fr) / 1,234.5 (en), au plus d décimales
    return Number(x).toLocaleString(loc(), { minimumFractionDigits: 0, maximumFractionDigits: d == null ? 2 : d }).replace(/ /g, ' ');
  }
  // [266] une chance sous 0,1 % s'affiche avec 2 décimales (le ×100 de l'Oracle vaut 0,06 %, jamais « 0,1 % »)
  function pct(x, d) { d = d == null ? 1 : d; if (x > 0 && x < 0.1 && d < 2) d = 2; return num(x, d) + (fr() ? ' %' : '%'); }
  function fill(s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); }
  function sum(tab) { var s = 0; tab.forEach(function (t) { s += t[1]; }); return s; }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function sortNum(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function list(a) { return a.map(function (x) { return num(x); }).join(' / '); }
  function table(head, rows, cls) {
    return '<div class="tw"><table' + (cls ? ' class="' + cls + '"' : '') + '><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td' + (i ? ' class="n"' : '') + '>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div>';
  }
  function p(t) { return '<p>' + t + '</p>'; }
  function h3(t) { return '<h3>' + esc(t) + '</h3>'; }
  // logo illustré d'un bonus (images du jeu, fond noir fondu en « screen ») ; vide si l'image n'est pas chargée
  function ic(kind) { var u = (root.ANUBIS_IMG || {})['ic_' + kind]; return u ? '<img class="rIc" alt="" src="' + u + '" width="38" height="38">' : ''; }
  // roue en un coup d'œil : une part par case (couleurs de l'écran de jeu), pointeur en haut
  var KCOL = { m0: '#4a4036', m025: '#6f5a2e', m05: '#8a6a1e', m1: '#b48a24', m2: '#c9a03a', m3: '#e6b94a', ankh: '#18b5a4', scarab: '#2f8f5b', weigh: '#2352b8', vault: '#7b3fa6' };
  function wheelSvg() {
    var L = M.LAYOUT, n = L.length, r = 46, out = '<svg viewBox="-50 -52 100 104" role="img" aria-hidden="true">';
    for (var i = 0; i < n; i++) {
      var a0 = i / n * 2 * Math.PI - Math.PI / 2, a1 = (i + 1) / n * 2 * Math.PI - Math.PI / 2, col = (root.G && root.G.kindColor && root.G.kindColor(L[i])) || KCOL[L[i]] || '#8a6a1e';
      out += '<path d="M0 0L' + (r * Math.cos(a0)).toFixed(2) + ' ' + (r * Math.sin(a0)).toFixed(2) + 'A' + r + ' ' + r + ' 0 0 1 ' + (r * Math.cos(a1)).toFixed(2) + ' ' + (r * Math.sin(a1)).toFixed(2) + 'Z" fill="' + col + '" stroke="#0b0907" stroke-width=".8"/>';
    }
    return out + '<circle r="9" fill="#14100c" stroke="#e6b94a" stroke-width="1.6"/><path d="M0 -50 -4.2 -43.5H4.2Z" fill="#fff1b8" stroke="#5b4311" stroke-width=".8"/></svg>';
  }

  var BTN_CUR = 9;   // rang de l'entrée « devise » dans le guide des boutons (R.btn) : tools/i18n-check.js vérifie qu'elle porte bien le bouton de devise
  function html() {
    var R = root.I18N.block('rules'), T = root.I18N.t(), S = root.HOA_STATS || {}, G = root.G, k;
    var KN = function (id) { return String(T.kinds[id]).replace('\n', ' '); };
    var maxW = num(M.MAX_WIN, 0), plusCost = M.MODES.plus.cost;
    var numKinds = Object.keys(M.KINDS).filter(function (id) { return M.KINDS[id].mult > 0; }).map(function (id) { return M.KINDS[id].mult; });
    var segs = M.HAND_SEGS, bandTxt = [], dbl = segs.filter(function (s) { return s.d != null; }).length;
    segs.forEach(function (s) { if (s.b) { var t = T.bandName[s.b] + ' ×' + s.x; if (bandTxt.indexOf(t) < 0) bandTxt.push(t); } });
    var v = {
      p: num(M.MODES.std.oracle * 100, 0), pp: num(M.MODES.plus.oracle * 100, 0), c: num(plusCost), m: maxW, h: num(M.HAND_UPGRADE * 100, 0), s: num(M.SECRET_UPGRADE * 100, 0),
      n: M.N, one: M.KINDS.scarab.count, nums: list(sortNum(numKinds)), chain: M.MAX_CHAIN || 6,
      kinds: uniq(M.ORACLE_KIND_W.map(function (t) { return t[0]; })).map(KN).join(', '),
      rows: M.SCARAB_ROWS, tiles: M.CRYPT_CELLS, picks: M.VAULT_BASE_PICKS, keys: M.VAULT_KEY_PICKS, cap: M.VAULT_PICK_CAP, fin: M.VAULT_FINISH,
      tier: Math.pow(2, M.HAND_MAX_CHAIN), min: M.HAND_MIN_N, segs: segs.length, dbl: dbl, dblc: dbl / M.HAND_COLORS.length,
      bands: bandTxt.join(', '), spin: T.spin, stop: T.stop, auto: T.auto, turbo: T.turbo, buy: T.buyBtn, plus: T.oraclePlus,
      wr: num(Math.round(1 / M.MODES.std.wrath), 0), w0: num(M.WRATH_LADDER[0], 0), wmax: num(M.WRATH_LADDER[M.WRATH_TOP], 0), lad: M.WRATH_LADDER.map(function (x) { return '×' + num(x, 0); }).join(' / '),
      dust: KN('m0'), ankh: KN('ankh'), bk: ['scarab', 'weigh', 'vault'].map(KN).join(', '), std: R.modeStd, plus: T.oraclePlus,
      langs: (root.I18N.langs || []).length || 16,
      stopwin: (root.I18N.rgs().autoStopWin || ''), stops: (G && G.STOP_WINS ? G.STOP_WINS : [0, 10, 50, 100]).filter(function (x) { return x > 0; }).map(function (x) { return '×' + x; }).join(' / '),
      autos: (G && G.AUTO_STEPS ? G.AUTO_STEPS : [10, 25, 50, 100, Infinity]).filter(function (x) { return x > 0; }).map(function (x) { return isFinite(x) ? x : '∞'; }).join(', ')
    };
    var wheelNums = sortNum(uniq(segs.filter(function (s) { return s.n; }).map(function (s) { return s.n; })));
    v.hnums = list(wheelNums);
    var f = function (s) { return fill(s, v); };
    var out = '';

    /* modes : coût, RTP, gain max */
    var rtp = function (x) { return x == null ? '—' : Number(x).toLocaleString(loc(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + pcs(); };
    var buyNames = { scarab: T.kindsLong.scarab, weigh: T.kindsLong.weigh, vault: T.kindsLong.vault, hand: T.kindsLong.hand };
    var rowsM = [
      ['<b>' + esc(R.modeStd) + '</b><small>' + esc(f(R.modeStdD)) + '</small>', '×' + num(M.MODES.std.cost), rtp(S.std && S.std.rtp), maxW + '×'],
      ['<b>' + esc(R.modePlus) + '</b><small>' + esc(f(R.modePlusD)) + '</small>', '×' + num(plusCost), rtp(S.plus && S.plus.rtp), maxW + '×']
    ];
    ['vault', 'scarab', 'weigh', 'hand'].forEach(function (id) {
      rowsM.push(['<b>' + esc(buyNames[id]) + '</b><small>' + esc(R['buy' + id.charAt(0).toUpperCase() + id.slice(1) + 'D']) + '</small>', '×' + num(M.BUY[id].price), rtp(S.buy && S.buy[id] && S.buy[id].rtp), maxW + '×']);
    });
    out += h3(R.modesH) + table([R.colMode, R.colCost, R.colRtp, R.colMax], rowsM, 'modes') + p(f(R.modesNote));

    /* formation des gains */
    var IN = root.I18N.block('intro'), money = function (v) { return root.G && root.G.money ? root.G.money(v) : num(v); }, ub = (root.G && root.G.bet) || 1;
    out += h3(R.howH) + '<figure class="wheelFig">' + wheelSvg() + '<figcaption>' + esc(fill(IN.wheelCap, { n: M.N })) + '</figcaption></figure>' + R.how.map(function (t) { return p('• ' + esc(f(t))); }).join('');
    /* exemple de gain chiffré (montant courant, case ×3, boost d'Oracle ×5) */
    out += h3(IN.exH) + '<div class="exBox">' + ic('coin') + '<p>' + esc(fill(IN.exP, { a: money(ub), b: money(ub * 3), c: money(ub * 15) })) + '</p></div>';
    var tb = M.ORACLE_BOOST, sn = sum(tb.num), sb = sum(tb.bonus), boosts = uniq(tb.num.map(function (t) { return t[0]; }).concat(tb.bonus.map(function (t) { return t[0]; })));
    boosts = sortNum(boosts);
    var chance = function (tab, b) { var w = 0; tab.forEach(function (t) { if (t[0] === b) w = t[1]; }); return w ? pct(w / sum(tab) * 100, 1) : '—'; };
    out += h3(R.oracleH) + p(esc(R.oracleNote)) + table([R.colBoost, R.colNumCase, R.colBonusCase], boosts.map(function (b) { return ['×' + num(b), chance(tb.num, b), chance(tb.bonus, b)]; }));

    /* bonus : déclenchement et valeurs */
    out += h3(R.bonusH);
    var sv = M.SCARAB_PROFILES.std, binom = [1, 8, 28, 56, 70, 56, 28, 8, 1];
    out += '<h4 class="rh">' + ic('scarab') + esc(R.scarabH) + '</h4>' + p(esc(f(R.scarabP))) +
      table(sv.map(function (x, i) { return '#' + (i + 1); }), [sv.map(function (x) { return '×' + num(x); }), binom.map(function (b) { return pct(b / 256 * 100, 1); })]);
    var wp = M.WEIGH_PROFILES.std, ws = sum(wp);
    out += '<h4 class="rh">' + ic('weigh') + esc(R.weighH) + '</h4>' + p(esc(f(R.weighP))) + table([R.colValue, R.colChance], wp.map(function (t) { return ['×' + num(t[0][0]) + ' / ×' + num(t[0][1]), pct(t[1] / ws * 100, 1)]; }));
    var vp = M.VAULT_PROFILES.std, vw = sum(vp.tokens) + vp.seal;
    out += '<h4 class="rh">' + ic('vault') + esc(R.vaultH) + '</h4>' + p(esc(f(R.vaultP))) + table([R.colValue, R.colChance], vp.tokens.map(function (t) {
      var lab = t[0] === 'scepter' ? R.tokScepter : t[0] === 'key' ? R.tokKey : '+' + num(t[0]) + '×';
      return [esc(f(lab)), pct(t[1] / vw * 100, 2)];
    }).concat([[esc(R.tokSeal), pct(vp.seal / vw * 100, 1)]]));
    out += '<h4 class="rh">' + ic('hand') + esc(R.handH) + '</h4>' + p(esc(f(R.handP)));
    var ct = M.CRYPT_TYPES, cw = sum(ct), cn = { dust: R.cDust, tab: R.cTab, tide: R.cTide, eclipse: R.cEclipse };
    out += '<h4 class="rh">' + ic('skull') + esc(R.cryptH) + '</h4>' + p(esc(f(R.cryptP))) + table([R.colValue, R.colChance, R.colMax], ct.map(function (t) {
      var vals = M.CRYPT_VALUES[t[0]]; return [esc(cn[t[0]]), pct(t[1] / cw * 100, 1), vals ? '×' + list(vals.map(function (x) { return x[0]; })) : '—'];
    }));

    /* Colère d'Anubis : chaînes brisées, multiplicateur qui monte à chaque Ankh ; loi exacte = (1 - a) a^k, le dernier cran absorbe a^k (a = part des Ankh parmi les cases libérées) */
    var wl = M.WRATH_LADDER, wc = M.WRATH_CELLS, wa = wc.filter(function (i) { return M.LAYOUT[i] === 'ankh'; }).length / wc.length;
    out += h3(R.wrathH) + R.wrathP.map(function (t) { return p(esc(f(t))); }).join('') + p(esc(R.wrathL)) +
      table([R.colBoost, R.colChance], wl.map(function (x, k) { var w0 = M.WRATH_START[0][0]; if (k < w0) return null; var q = k === M.WRATH_TOP ? Math.pow(wa, k - w0) : Math.pow(wa, k - w0) * (1 - wa); return ['×' + num(x, 0), pct(q * 100, 2)]; }).filter(Boolean));

    /* relances et re-déclenchements, boutons, avertissement */
    out += h3(R.retrigH) + R.retrig.map(function (t) { return p('• ' + esc(f(t))); }).join('');
    // [235] le guide ne décrit que les commandes présentes : le bouton de devise (entrée BTN_CUR) est caché quand la devise est imposée (session RGS, ?currency=)
    var curHidden = !!(G && G.S && G.S.curLocked);
    out += h3(R.btnH) + '<dl class="guide">' + R.btn.filter(function (b, i) { return !(i === BTN_CUR && curHidden); }).map(function (b) { return '<dt>' + esc(f(b[0])) + '</dt><dd>' + esc(f(b[1])) + '</dd>'; }).join('') + '</dl>';
    out += h3(R.discH) + '<p class="disc">' + esc(R.disc) + '</p>';
    return out;
  }
  root.Rules = { html: html };
})(window);
