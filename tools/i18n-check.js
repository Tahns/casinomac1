// node tools/i18n-check.js — 16 langues Stake : mêmes clés, types, longueurs de listes et marqueurs {x} que l'anglais, pas de texte vide, textes courts qui tiennent ; et repère le français écrit en dur hors de i18n.js.
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..'), fails = 0;
function ok(c, m) { if (!c) { fails++; console.log('ÉCHEC  ' + m); } else console.log('ok     ' + m); }

var sandbox = { window: {}, document: { documentElement: {}, querySelectorAll: function () { return []; } } };
vm.createContext(sandbox);
// i18n.js expose window.I18N ; on récupère les deux dictionnaires en les interrogeant
vm.runInContext(fs.readFileSync(path.join(root, 'js/i18n.js'), 'utf8').replace('root.I18N = {', 'root.I18N = { _D: D, _B: B, _X: X, _R: RGS_TXT,'), sandbox);
sandbox.root = sandbox.window;
var D = sandbox.window.I18N && sandbox.window.I18N._D;
var CODES = ['ar', 'de', 'en', 'es', 'fi', 'fr', 'hi', 'id', 'ja', 'ko', 'pl', 'pt', 'ru', 'tr', 'vi', 'zh'];
ok(!!D && CODES.every(function (c) { return D[c]; }) && Object.keys(D).length === CODES.length, 'dictionnaires des 16 langues Stake chargés (' + Object.keys(D || {}).join(', ') + ')');
ok(sandbox.window.I18N.langs.length === 16 && sandbox.window.I18N.lang() === 'en', 'langue par défaut : anglais');
['xx', 'FR', 'pt-BR', 'zh_CN', 'ZH-tw', '', null].forEach(function (c) { var n = sandbox.window.I18N.norm(c); ok(n === null || D[n], 'code « ' + c + ' » -> ' + n + ' (repli anglais si null)'); });

var PH = /\{[a-z]+\}/g;
function walk(a, b, p, out) {
  Object.keys(a).forEach(function (k) {
    var q = p ? p + '.' + k : k;
    if (!(k in b)) { out.push('absent: ' + q); return; }
    if (typeof a[k] !== typeof b[k]) { out.push('type différent: ' + q); return; }
    if (Array.isArray(a[k])) { if (a[k].length !== b[k].length) out.push('longueur différente: ' + q); else a[k].forEach(function (x, i) { cmp(x, b[k][i], q + '[' + i + ']', out); }); }
    else if (a[k] && typeof a[k] === 'object') walk(a[k], b[k], q, out);
    else cmp(a[k], b[k], q, out, k);
  });
}
function cmp(x, y, q, out, k) {
  if (typeof x !== 'string' || typeof y !== 'string') return;
  if (!y.trim() && k !== 'brandTop') out.push('texte vide: ' + q);
  var px = (x.match(PH) || []).sort().join(), py = (y.match(PH) || []).sort().join();
  if (px !== py) out.push('marqueurs {x} différents: ' + q + ' (' + px + ' / ' + py + ')');
}
CODES.forEach(function (c) {
  var diffs = [];
  walk(D.en, D[c], '', diffs); walk(D[c], D.en, '', diffs);
  ok(diffs.length === 0, c + ' : mêmes clés, types, longueurs et marqueurs {x} que l\'anglais' + (diffs.length ? ' : ' + diffs.slice(0, 5).join(' | ') : ''));
});
// fonction realityMsg : doit citer la durée et le résultat
CODES.forEach(function (c) { var m = D[c].realityMsg(37, 'R_NET'); ok(typeof m === 'string' && m.indexOf('37') >= 0 && m.indexOf('R_NET') >= 0, c + ' : realityMsg cite la durée et le résultat'); });
// textes courts (HUD, boutons, titres de scène) : longueur <= max(1,8 x anglais, anglais + 10) pour tenir dans les cases et sur le canvas
var SHORT = ['balance', 'bet', 'win', 'turbo', 'auto', 'spin', 'stop', 'cost', 'oraclePlus', 'buyBtn', 'buyNow', 'buyPrice', 'splashEnter', 'continueBtn', 'launchBonus', 'bonusWord', 'feather', 'heart', 'featherOf', 'heartOf', 'vaultSeal', 'weighIntro', 'scarabIntro', 'vaultIntro', 'handIntro', 'cryptIntro', 'handDouble', 'handTier', 'handNum', 'secretWord', 'secretUnlocked', 'total', 'settings', 'close', 'keepPlaying', 'takeBreak', 'respinLabel', 'ankhRespin', 'chooseTitle', 'bonusUnlocked', 'guessRight', 'guessWrong', 'weighWon', 'weighLost', 'fateResists', 'handColorTitle', 'handYour', 'handUp', 'handWrong', 'handFinal', 'boostApplied', 'bonusWin', 'cryptPool', 'cryptTide', 'cryptCapped', 'vaultScepter', 'vaultShield', 'vaultSaved'];
var longs = [];
CODES.forEach(function (c) { SHORT.forEach(function (k) { var e = D.en[k], t = D[c][k]; if (typeof t === 'string' && t.length > Math.max(e.length * 1.8, e.length + 10)) longs.push(c + '.' + k + ' (' + t.length + ' > ' + e.length + ')'); }); });
ok(longs.length === 0, 'textes courts : aucun ne dépasse 1,8 x l\'anglais' + (longs.length ? ' : ' + longs.slice(0, 8).join(' | ') : ''));
// textes longs (règles, sous-titres) : au plus 2,2 x l'anglais pour que les fenêtres tiennent
var longT = [];
CODES.forEach(function (c) { ['rules', 'buySub', 'scarabSub', 'weighSub', 'vaultSub', 'handSub', 'handColorRule', 'cryptRule', 'limitMsg'].forEach(function (k) { var e = [].concat(D.en[k]).join(' '), t = [].concat(D[c][k]).join(' '); if (t.length > e.length * 2.2) longT.push(c + '.' + k); }); });
ok(longT.length === 0, 'textes longs : aucun ne dépasse 2,2 x l\'anglais' + (longT.length ? ' : ' + longT.join(' | ') : ''));
// couverture de police : les langues non latines doivent avoir un repli système
['ar', 'hi', 'ja', 'ko', 'zh'].forEach(function (c) { ok(!!sandbox.window.I18N.fallback[c], c + ' : police système de repli déclarée'); });
ok(D.ar && sandbox.window.I18N.lang() && (function () { sandbox.window.I18N.setLang('ar'); var r = sandbox.document.documentElement.dir === 'rtl'; sandbox.window.I18N.setLang('en'); return r && sandbox.document.documentElement.dir === 'ltr'; })(), 'arabe : dir="rtl" ; les autres langues : dir="ltr"');

// français écrit en dur dans le code (hors i18n.js), dans les chaînes de caractères
var files = fs.readdirSync(path.join(root, 'js')).filter(function (f) { return /\.js$/.test(f) && f !== 'i18n.js'; });
var hits = [];
files.forEach(function (f) {
  fs.readFileSync(path.join(root, 'js', f), 'utf8').split('\n').forEach(function (line, i) {
    var code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
    var m = code.match(/(['"`])((?:\\.|(?!\1).)*[éèêàâùûçôîï](?:\\.|(?!\1).)*)\1/g);
    if (m) m.forEach(function (s) { if (/[a-zA-Z]{3}/.test(s)) hits.push(f + ':' + (i + 1) + ' ' + s.slice(0, 60)); });
  });
});
// textes affichés à l'écran qui doivent passer par I18N (les commentaires et les noms internes sont exclus ci-dessus)
ok(hits.length === 0, 'aucun texte français écrit en dur dans le code' + (hits.length ? ' (' + hits.length + ') : ' + hits.slice(0, 8).join(' | ') : ''));
// chiffres affichés aux joueurs vs maths réelles
var M = require(path.join(root, 'js/math.js'));
var scarabMax = Math.max.apply(null, [].concat.apply([], Object.keys(M.SCARAB_PROFILES).map(function (k) { return M.SCARAB_PROFILES[k]; })));
var weighMax = Math.max.apply(null, [].concat.apply([], Object.keys(M.WEIGH_PROFILES).map(function (k) { return M.WEIGH_PROFILES[k].map(function (p) { return Math.max.apply(null, p[0]); }); })));
CODES.forEach(function (l) {
  var d = D[l];
  ok(d.buyDesc.scarab.indexOf(scarabMax + '×') >= 0, l + ' : la description des Scarabées annonce bien ' + scarabMax + '× (max réel)');
  ok(d.buyDesc.weigh.indexOf(weighMax + '×') >= 0, l + ' : la description de la Pesée annonce bien ' + weighMax + '× (max réel)');
  ok(d.rules.join(' ').indexOf(String(M.MAX_WIN)) >= 0, l + ' : les règles annoncent le plafond ' + M.MAX_WIN + '×');
  // Fureur d'Anubis : palier maximal, multiplicateurs des bandes, plus petit nombre (consolation) : tout vient des maths
  var tierMax = Math.pow(2, M.HAND_MAX_CHAIN), bandXs = [], rulesTxt = d.rules.join(' ');
  M.HAND_SEGS.forEach(function (sg) { if (sg.b && bandXs.indexOf(sg.x) < 0) bandXs.push(sg.x); });
  var bandMax = Math.max.apply(null, bandXs), bandMin = Math.min.apply(null, bandXs);
  ok(d.buyDesc.hand.indexOf('×' + tierMax) >= 0 && d.buyDesc.hand.indexOf('×' + bandMin) >= 0 && d.buyDesc.hand.indexOf('×' + bandMax) >= 0, l + ' : la description de la Fureur annonce palier ×' + tierMax + ' et bandes ×' + bandMin + ' à ×' + bandMax);
  ok(rulesTxt.indexOf('×' + tierMax) >= 0 && rulesTxt.indexOf('(' + M.HAND_MIN_N + ')') >= 0 && bandXs.every(function (x) { return rulesTxt.indexOf('×' + x) >= 0; }), l + ' : les règles de la Fureur citent palier max ×' + tierMax + ', plus petit nombre (' + M.HAND_MIN_N + ') et les bandes ×' + bandXs.join(', ×'));
  ok(M.HAND_SEGS.every(function (sg) { return !sg.b || d.bandName[sg.b]; }) && ['turq', 'gold', 'ruby'].every(function (c) { return d.handColorName[c]; }), l + ' : noms de bandes et de couleurs présents');
});
// blocs séparés (règles détaillées, replay) : FR et EN ont les mêmes clés ; avertissement général complet ; aucune clé vide ; repli sur l'anglais
var B = sandbox.window.I18N._B, bd = [];
Object.keys(B).forEach(function (name) { walk(B[name].fr, B[name].en, name, bd); walk(B[name].en, B[name].fr, name, bd); });
ok(bd.length === 0, 'blocs rules / replay : mêmes clés en FR et EN' + (bd.length ? ' : ' + bd.slice(0, 4).join(' | ') : ''));
['en', 'fr'].forEach(function (l) {
  var d = B.rules[l].disc;
  ok(['TM and © 2026 Engine', 'Remote Game Server', 'reload the game', 'internet connection', 'expected return', 'Malfunction voids'].every(function (x) { return B.rules.en.disc.indexOf(x) >= 0; }) && /2026 Engine/.test(d), l + ' : l\'avertissement général est complet');
});
ok(!/paytable|pay table/i.test(JSON.stringify(B)), 'aucun « paytable » dans les nouveaux textes (mode social)');
// --- 14 langues sans relecteur natif : blocs « rules » / « replay » / textes du RGS complets (mêmes clés, types, longueurs, marqueurs {x} que l'anglais), cohérence terminologique ---
var X = sandbox.window.I18N._X, R0 = sandbox.window.I18N._R, I = sandbox.window.I18N, extra = [];
function allStrings(v, f, p) { if (typeof v === 'string') f(v, p); else if (Array.isArray(v)) v.forEach(function (x, i) { allStrings(x, f, p + '[' + i + ']'); }); else if (v && typeof v === 'object') Object.keys(v).forEach(function (k) { allStrings(v[k], f, p + '.' + k); }); }
CODES.filter(function (c) { return c !== 'en' && c !== 'fr'; }).forEach(function (c) {
  var dd = [];
  Object.keys(B).forEach(function (n) { var cur = X[n][c]; if (!cur) { dd.push(n + ' absent'); return; } walk(B[n].en, cur, n, dd); walk(cur, B[n].en, n, dd); });
  if (!X.rgs[c]) dd.push('rgs absent'); else { walk(R0.en, X.rgs[c], 'rgs', dd); walk(X.rgs[c], R0.en, 'rgs', dd); }
  ok(dd.length === 0, c + ' : blocs rules, replay et textes RGS complets (mêmes clés, types, longueurs, marqueurs {x} que l\'anglais)' + (dd.length ? ' : ' + dd.slice(0, 5).join(' | ') : ''));
  if (!X.rules[c] || !X.replay[c] || !X.rgs[c] || !X.ui[c]) return;
  // titres des bonus dans les règles = noms des bonus du dictionnaire (cohérence terminologique) ; le ou les mots-clés ne diffèrent que par la casse
  var Rr = X.rules[c], d = D[c], bad = [];
  [['scarabH', 'scarabIntro'], ['weighH', 'weighIntro'], ['vaultH', 'vaultIntro'], ['handH', 'handIntro']].forEach(function (p) { if (Rr && Rr[p[0]].toLocaleLowerCase(c) !== d[p[1]].toLocaleLowerCase(c)) bad.push(p[0] + ' ≠ ' + p[1] + ' (' + Rr[p[0]] + ' / ' + d[p[1]] + ')'); });
  if (Rr && Rr.cryptH.toLocaleLowerCase(c).indexOf(d.cryptIntro.toLocaleLowerCase(c)) !== 0) bad.push('cryptH ≠ cryptIntro (' + Rr.cryptH + ' / ' + d.cryptIntro + ')');
  ok(bad.length === 0, c + ' : titres des bonus des règles = noms du dictionnaire' + (bad.length ? ' : ' + bad.join(' | ') : ''));
  // textes de bande / couleur / tablette cités par les règles = mêmes mots que le dictionnaire
  var ct = d.cryptLeg.map(function (x) { return x.toLocaleLowerCase(c); }), cr = [Rr.cTab, Rr.cTide, Rr.cEclipse, Rr.cDust].map(function (x, i) { return x.toLocaleLowerCase(c).indexOf(ct[i === 3 ? 3 : i]) === 0; });
  ok(cr.every(Boolean), c + ' : légendes des tablettes (TABLETTE, MARÉE, ÉCLIPSE, POUSSIÈRE) = dictionnaire' + (cr.every(Boolean) ? '' : ' : ' + cr.join()));
  // typographie : NFC (diacritiques vietnamiens composés), pas de double espace, pas d'espace en bout, parenthèses et guillemets équilibrés, pas de « ... » ni de guillemets droits dans les phrases
  var ty = [];
  [[Rr, 'rules'], [X.replay[c], 'replay'], [X.rgs[c], 'rgs'], [D[c], 'D'], [(sandbox.window.I18N_SOCIAL || {})[c] || {}, 'social']].forEach(function (pr) {
    allStrings(pr[0], function (t, p) {
      if (t !== t.normalize('NFC')) ty.push(pr[1] + p + ' non NFC');
      if (/ {2,}/.test(t.replace(/ {2}(?=[+×{])/g, ' ')) ) ty.push(pr[1] + p + ' double espace');
      if (/\s$/.test(t)) ty.push(pr[1] + p + ' espace final');
      if ((t.match(/\(/g) || []).length !== (t.match(/\)/g) || []).length) ty.push(pr[1] + p + ' parenthèses déséquilibrées');
      if (/\.\.\./.test(t)) ty.push(pr[1] + p + ' « ... » au lieu de « … »');
      if (/ [,.;!?]( |$)/.test(t) && c !== 'fr') ty.push(pr[1] + p + ' espace avant ponctuation');
    }, '');
  });
  ok(ty.length === 0, c + ' : typographie (NFC, espaces, parenthèses, « … »)' + (ty.length ? ' : ' + ty.slice(0, 5).join(' | ') : ''));
  // noms localisés des paliers (optionnels) : 4 textes courts, tous différents de l'anglais, qui tiennent sur le canvas
  I.setLang('en');
});
// noms localisés des paliers (optionnels) : 4 textes courts (5e facultatif pour le palier ultime resté en anglais), tous différents de l'anglais, qui tiennent sur le canvas ; les règles (courtes et détaillées) citent alors les mêmes noms
CODES.filter(function (c) { return c !== 'en'; }).forEach(function (c) {
  var tl = X.tiers[c];
  ok(Array.isArray(tl) && (tl.length === 4 || tl.length === 5) && tl.every(function (n) { return typeof n === 'string' && n.trim() && n.length <= 24; }) && tl.every(function (n, i) { return i > 3 || n !== D.en.tiers[i]; }) && (tl.length === 5 || D[c].tiers[4] !== D.en.tiers[4]), c + ' : noms localisés des paliers WIN / BIG WIN / EXTRA WIN / MEGA WIN présents (4 textes ≤ 24 caractères' + (D[c].tiers[4] === D.en.tiers[4] ? ', + palier ultime' : '') + ')');
  I.setLang(c); I.setLocalTiers(true); var Tl = I.t(), rl = Tl.rules.join(' '), hw = I.block('rules').how.join(' '); I.setLocalTiers(false);
  ok(tl && tl.every(function (n) { return rl.indexOf(n) >= 0; }) && tl.slice(0, 4).every(function (n) { return hw.indexOf(n) >= 0; }) && Tl.tiers.every(function (n, i) { return n === (i < tl.length ? tl[i] : D[c].tiers[i]); }), c + ' : avec les paliers localisés, les règles (courtes et détaillées) et l\'écran citent les mêmes noms');
  I.setLang('en');
});
ok(I.localTiers() === false && I.t().tiers[0] === 'WIN', 'paliers localisés désactivés par défaut (WIN, BIG WIN… restent en anglais)');
I.setLang('xx'); ok(I.lang() === 'en', 'langue inconnue : repli sûr sur l\'anglais'); I.setLocalTiers(true); delete X.tiers.de0; var saveDe = X.tiers.de; delete X.tiers.de; I.setLang('de'); ok(I.t().tiers[0] === 'WIN' && I.t().tiers[4] === D.de.tiers[4], 'paliers localisés : repli sûr sur l\'anglais quand la langue n\'a pas de noms'); X.tiers.de = ['', 'x', 'y', 'z']; ok(I.t().tiers[0] === 'WIN', 'paliers localisés : un nom vide est refusé (repli anglais)'); X.tiers.de = saveDe; I.setLocalTiers(false); I.setLang('en');
var mainSrc = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');

// seuils d'animation de gain : les règles (FR/EN) doivent citer les mêmes seuils que G.WIN_TIERS et les 4 noms demandés doivent exister
var gameSrc = fs.readFileSync(path.join(root, 'js/game.js'), 'utf8'), wtm = /G\.WIN_TIERS\s*=\s*\[([^\]]+)\]/.exec(gameSrc);
var wt = wtm ? wtm[1].split(',').map(Number) : [];
CODES.forEach(function (l) {
  var d = D[l], rt = d.rules.join(' ');
  ok(wt.length === 5 && d.tiers.length === 5 && ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN'].every(function (n, i) { return d.tiers[i] === n; }), l + ' : paliers WIN, BIG WIN, EXTRA WIN, MEGA WIN présents (+ palier ultime)');
  // fr/en : « nom dès/from ×seuil » ; autres langues : chaque nom de palier et chaque seuil ×N figurent dans les règles
  if (l === 'fr' || l === 'en') ok(wt.length === 5 && d.tiers.every(function (n, i) { return new RegExp(n + ' (dès|from) ×' + wt[i] + '(?!\\d)').test(rt); }), l + ' : les règles citent les seuils de gain ×' + wt.join(', ×') + ' (G.WIN_TIERS)');
  else ok(wt.length === 5 && d.tiers.every(function (n) { return rt.indexOf(n) >= 0; }) && wt.every(function (w) { return new RegExp('×' + w + '(?!\\d)').test(rt); }), l + ' : les règles citent les paliers et les seuils ×' + wt.join(', ×'));
});
ok(!/jusqu.à 200×|up to 200×/.test(mainSrc), 'plus de description chiffrée en dur dans main.js');
console.log(fails ? '\n' + fails + ' échec(s)' : '\ntout est bon'); process.exit(fails ? 1 : 0);
