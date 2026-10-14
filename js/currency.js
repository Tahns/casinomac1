// ANUBIS UNCHAINED — devises : symbole, position, décimales, formatage des montants (checklist [219] [273] [78]).
// Fichier autonome (aucune dépendance) : CUR.format(montant, code, {signed, lang}), CUR.info(code), CUR.fromUrl()…
// Un montant plus petit que la plus petite unité de la devise (gain sous-centime : 0,1× sur une mise de 0,05 = 0,005) garde ses décimales
// (jusqu'à 6, précision du RGS) : jamais « 0.00 » ni arrondi à 0.01 ; les autres montants s'arrondissent aux décimales de la devise. 
(function (root) {
  'use strict';
  // sym : symbole ou code affiché ; suf : placé après le nombre (« 10.00 SC ») ; sp : espace entre symbole et nombre (préfixe) ;
  // dec : décimales de la devise ; k : taux indicatif utilisé seulement par la démo locale pour adapter soldes et niveaux de mise
  var T = {
    USD: { sym: '$', dec: 2, k: 1 }, EUR: { sym: '€', dec: 2, k: 1 }, CAD: { sym: 'CA$', dec: 2, k: 1 }, MXN: { sym: 'MX$', dec: 2, k: 20 },
    JPY: { sym: '¥', dec: 0, k: 100 }, XSC: { sym: 'SC', dec: 2, suf: 1, k: 1, social: 1 }, XGC: { sym: 'GC', dec: 2, suf: 1, k: 1, social: 1 },
    XEC: { sym: 'SC', dec: 2, suf: 1, k: 1, social: 1 },
    DKK: { sym: 'kr', dec: 2, suf: 1, k: 7 }, PLN: { sym: 'zł', dec: 2, suf: 1, k: 4 }, VND: { sym: '₫', dec: 0, suf: 1, k: 20000 },
    TRY: { sym: '₺', dec: 2, k: 30 }, CLP: { sym: 'CLP', dec: 0, sp: 1, k: 1000 }, ARS: { sym: 'ARS', dec: 2, sp: 1, k: 1000 },
    PEN: { sym: 'S/', dec: 2, sp: 1, k: 4 }, CNY: { sym: 'CN¥', dec: 2, k: 7 }, PHP: { sym: '₱', dec: 2, k: 55 },
    INR: { sym: '₹', dec: 2, k: 80 }, IDR: { sym: 'Rp', dec: 2, sp: 1, k: 15000 }, KRW: { sym: '₩', dec: 0, k: 1000 },
    BRL: { sym: 'R$', dec: 2, k: 5 }, RUB: { sym: '₽', dec: 2, k: 90 }
  };
  // devises proposées par le sélecteur de la démo (ordre d'affichage) ; la liste sociale ne contient que les jetons
  var LIST = ['EUR', 'USD', 'CAD', 'MXN', 'JPY', 'XSC', 'XGC', 'XEC', 'DKK', 'PLN', 'VND', 'TRY', 'CLP', 'ARS', 'PEN', 'CNY', 'PHP', 'INR', 'IDR', 'KRW', 'BRL', 'RUB'];
  var FEATURED = ['USD', 'EUR', 'CAD', 'MXN', 'JPY', 'XSC', 'XGC'];   // bouton rapide de l'en-tête
  var SOCIAL_LIST = ['XSC', 'XGC'];

  function norm(c) { return String(c == null ? '' : c).trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5); }
  function info(code) {
    code = norm(code);
    var t = T[code];
    if (t) return t;
    // devise inconnue : le code lui-même sert de symbole (« ABC 10.00 »), 2 décimales
    return { sym: code || '?', dec: 2, sp: 1, k: 1, unknown: 1 };
  }
  var fmts = {};
  function nf(lang, dec, sub) {
    var key = lang + dec + (sub ? 's' : '');
    return fmts[key] || (fmts[key] = new Intl.NumberFormat(lang, { minimumFractionDigits: dec, maximumFractionDigits: sub ? 6 : dec, useGrouping: true }));
  }
  function round6(n) { return Math.round(n * 1e6 + (n < 0 ? -1e-9 : 1e-9)) / 1e6; }
  // arrondi à la précision de la devise (animations de compteur uniquement)
  function roundCur(n, code) { var p = Math.pow(10, info(code).dec); return Math.round(n * p + (n < 0 ? -1e-9 : 1e-9)) / p; }

  function format(n, code, o) {
    o = o || {};
    n = +n; if (!isFinite(n)) n = 0;
    n = round6(n);
    var t = info(code), lang = o.lang || 'en', a = Math.abs(n), loc = o.locale || (lang === 'fr' ? 'fr-FR' : 'en-US'), after = o.after != null ? o.after : lang === 'fr';
    var sub = a > 0 && a < Math.pow(10, -t.dec), num = nf(loc, t.dec, sub).format(a).replace(/ /g, ' ');
    var sg = n < 0 ? '-' : (o.signed && n > 0 ? '+' : '');
    // préfixe en anglais (« CA$10.00 »), suffixe en français (« 10,00 CA$ ») ; les jetons SC / GC et les symboles de suffixe restent après le nombre
    if (t.suf || lang === 'fr') return sg + num + (lang === 'fr' ? ' ' : ' ') + t.sym;
    return sg + t.sym + (t.sp ? ' ' : '') + num;
  }

  // symbole collé au nombre : retire-le pour reconnaître un montant (police des chiffres)
  var symRes = {};
  function strip(s, code) {
    var extra = code && !T[norm(code)] ? info(code).sym : '', key = extra || '-';
    var re = symRes[key];
    if (!re) {
      var syms = Object.keys(T).map(function (k) { return T[k].sym; }).concat(extra ? [extra] : []).filter(function (v, i, a) { return a.indexOf(v) === i; })
        .sort(function (a, b) { return b.length - a.length; }).map(function (v) { return v.replace(/[$\u00a5]/g, '\\$&'); });
      var alt = syms.join('|');
      re = symRes[key] = { pre: new RegExp('^([+\\-\\u2212]?)(?:' + alt + ')[\\s\\u00a0]*(?=\\d)'), suf: new RegExp('(?<=\\d)[\\s\\u00a0\\u202f]*(?:' + alt + ')$') };
    }
    return String(s).replace(re.pre, '$1').replace(re.suf, '');
  }

  function param(name) {
    try { var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(root.location && root.location.search || ''); return m ? decodeURIComponent(m[1]) : ''; } catch (e) { return ''; }
  }
  root.CUR = {
    TABLE: T, LIST: LIST, FEATURED: FEATURED, SOCIAL_LIST: SOCIAL_LIST,
    norm: norm, info: info, format: format, round: roundCur, strip: strip,
    decimals: function (c) { return info(c).dec; },
    symbol: function (c) { return info(c).sym; },
    isSocial: function (c) { return !!(T[norm(c)] && T[norm(c)].social); },
    known: function (c) { return !!T[norm(c)]; },
    rate: function (c) { return info(c).k; },
    // code de l'URL (?currency=) ou '' ; inconnu mais bien formé (3 lettres) → conservé tel quel
    fromUrl: function () { var c = norm(param('currency')); return /^[A-Z]{3}$/.test(c) ? c : ''; }
  };
})(window);
