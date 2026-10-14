/* ANUBIS UNCHAINED — mode social (Stake.US : ?social=true ou config.jurisdiction.socialCasino) [77] [78] [225] [188].
   Remplace tous les textes visibles par le jeu de textes social (I18N_SOCIAL, en bas de js/i18n.js) : vocabulaire autorisé uniquement.
   Les devises par défaut deviennent XSC / XGC (voir main.js pickCurrency), jamais « $ ».
   API : SOCIAL.active, SOCIAL.set(true|false) (appelé par le client RGS avec config.jurisdiction.socialCasino), SOCIAL.RESTRICTED (liste officielle). */
(function (root) {
  'use strict';
  // mots interdits en mode social (checklist Stake Engine, mots entiers, insensible à la casse) : tools/social-check.js les cherche partout
  var RESTRICTED = ['at the cost of', 'be awarded to player\'s accounts', 'bet', 'bets', 'bet/s', 'betting', 'bonus buy', 'bought', 'buy', 'buy bonus', 'cash', 'credit',
    'currency', 'deposit', 'fund', 'withdraw', 'win feature', 'gamble', 'money', 'paid', 'paid out', 'pay', 'pay out', 'payer', 'pays', 'pays out',
    'place your bets', 'purchase', 'rebet', 'stake', 'total bet', 'wager', 'cost of'];
  var I18N = root.I18N, SOC = root.I18N_SOCIAL || {};
  var on = false;
  try { var m = /[?&]social=([^&#]*)/.exec(root.location.search); on = !!m && /^(true|1|yes)$/i.test(decodeURIComponent(m[1])); } catch (e) {}

  function plain(o) { return o && typeof o === 'object' && !Array.isArray(o); }
  // applique les remplacements : valeur simple, fonction (texte d'origine → nouveau texte), objet sur un tableau (par index) ou sur un objet
  function mergeInto(base, ov) {
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    Object.keys(ov).forEach(function (k) {
      var v = ov[k], b = base ? base[k] : undefined;
      if (typeof v === 'function') out[k] = v(b);
      else if (plain(v) && (Array.isArray(b) || plain(b))) out[k] = mergeInto(b, v);
      else out[k] = v;
    });
    return out;
  }
  function own(ov) { var o = {}; Object.keys(ov).forEach(function (k) { if (k.charAt(0) !== '$') o[k] = ov[k]; }); return o; }   // « $rules »… : blocs séparés
  var cache = {}, baseT = I18N.t, baseApply = I18N.apply, enBase = null;
  function englishBase() {
    if (enBase) return enBase;
    var cur = I18N.lang();
    I18N.setLang('en'); enBase = baseT(); I18N.setLang(cur);
    return enBase;
  }
  // texte social de la langue courante ; une langue sans bloc social reçoit le jeu anglais complet (aucun mot interdit)
  function strings(lang, d) {
    var c = cache[lang];
    if (c && c.base === d) return c.val;
    var val = SOC[lang] ? mergeInto(d, own(SOC[lang])) : (lang === 'en' ? d : mergeInto(englishBase(), own(SOC.en || {})));
    cache[lang] = { base: d, val: val };
    return val;
  }
  I18N.t = function () { var d = baseT(); return on ? strings(I18N.lang(), d) : d; };
  I18N.apply = function () {
    if (!on) return baseApply();
    var d = I18N.t();
    document.querySelectorAll('[data-i]').forEach(function (el) { var k = el.getAttribute('data-i'); if (d[k] != null) el.textContent = d[k]; });
  };

  // blocs séparés (« rules », « replay ») et textes du RGS : clés « $rules », « $replay », « $rgs » du bloc social de la langue ;
  // une langue sans bloc social reçoit les textes anglais sociaux
  var blockCache = {};
  function socialBlock(name, base, lang, en) {
    var key = name + '/' + lang, c = blockCache[key];
    if (c && c.base === base) return c.val;
    var ov = (SOC[lang] || {})['$' + name], val = SOC[lang] ? (ov ? mergeInto(base, ov) : base) : mergeInto(en, (SOC.en || {})['$' + name] || {});
    blockCache[key] = { base: base, val: val };
    return val;
  }
  var baseBlock = I18N.block, baseRgs = I18N.rgs;
  function enOf(fn) { var cur = I18N.lang(); I18N.setLang('en'); var r = fn(); I18N.setLang(cur); return r; }
  if (baseBlock) I18N.block = function (name) { var b = baseBlock.call(I18N, name); return on ? socialBlock(name, b, I18N.lang(), enOf(function () { return baseBlock.call(I18N, name); })) : b; };
  if (baseRgs) I18N.rgs = function () { var b = baseRgs.call(I18N); return on ? socialBlock('rgs', b, I18N.lang(), enOf(function () { return baseRgs.call(I18N); })) : b; };

  root.SOCIAL = {
    RESTRICTED: RESTRICTED,
    get active() { return on; },
    set: function (v) {
      v = !!v; if (v === on) return;
      on = v;
      try { document.documentElement.setAttribute('data-social', on ? 'true' : 'false'); } catch (e) {}
      if (root.G && root.G.onSocial) root.G.onSocial();   // devise et textes recalculés par main.js
    },
    // texte social d'une langue (utilisé par les outils de vérification)
    // blocs séparés sociaux d'une langue (outils de vérification)
    blocks: function (lang) { var cur = I18N.lang(); I18N.setLang(lang); var r = { rules: I18N.block('rules'), replay: I18N.block('replay'), ui: I18N.block('ui'), rgs: I18N.rgs() }; I18N.setLang(cur); return r; },
    strings: function (lang) { var cur = I18N.lang(); I18N.setLang(lang); var d = baseT(); var r = strings(I18N.lang(), d); I18N.setLang(cur); return r; }
  };
  try { document.documentElement.setAttribute('data-social', on ? 'true' : 'false'); } catch (e) {}
})(window);
