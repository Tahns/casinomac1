// node tools/i18n-check.js — FR/EN : mêmes clés partout, mêmes types, pas de texte vide ; et repère le français écrit en dur hors de i18n.js.
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..'), fails = 0;
function ok(c, m) { if (!c) { fails++; console.log('ÉCHEC  ' + m); } else console.log('ok     ' + m); }

var sandbox = { window: {}, document: { documentElement: {}, querySelectorAll: function () { return []; } } };
vm.createContext(sandbox);
// i18n.js expose window.I18N ; on récupère les deux dictionnaires en les interrogeant
vm.runInContext(fs.readFileSync(path.join(root, 'js/i18n.js'), 'utf8').replace('root.I18N = {', 'root.I18N = { _D: D, _B: B,'), sandbox);
sandbox.root = sandbox.window;
var D = sandbox.window.I18N && sandbox.window.I18N._D;
ok(!!D && D.fr && D.en, 'dictionnaires fr et en chargés');

function walk(a, b, p, out) {
  Object.keys(a).forEach(function (k) {
    var q = p ? p + '.' + k : k;
    if (!(k in b)) { out.push('absent côté en: ' + q); return; }
    if (typeof a[k] !== typeof b[k]) { out.push('type différent: ' + q); return; }
    if (Array.isArray(a[k])) { if (a[k].length !== b[k].length) out.push('longueur différente: ' + q); }
    else if (a[k] && typeof a[k] === 'object') walk(a[k], b[k], q, out);
    else if (typeof a[k] === 'string' && !a[k].trim() && k !== 'brandTop') out.push('texte vide: ' + q);
  });
}
var diffs = [];
walk(D.fr, D.en, '', diffs); walk(D.en, D.fr, '', diffs.fr = []);
(diffs.fr || []).forEach(function (d) { diffs.push(d.replace('côté en', 'côté fr')); });
ok(diffs.length === 0, 'clés, types et longueurs identiques en FR et EN' + (diffs.length ? ' : ' + diffs.slice(0, 6).join(' | ') : ''));

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
['fr', 'en'].forEach(function (l) {
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
var mainSrc = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');

// seuils d'animation de gain : les règles (FR/EN) doivent citer les mêmes seuils que G.WIN_TIERS et les 4 noms demandés doivent exister
var gameSrc = fs.readFileSync(path.join(root, 'js/game.js'), 'utf8'), wtm = /G\.WIN_TIERS\s*=\s*\[([^\]]+)\]/.exec(gameSrc);
var wt = wtm ? wtm[1].split(',').map(Number) : [];
['fr', 'en'].forEach(function (l) {
  var d = D[l], rt = d.rules.join(' ');
  ok(wt.length === 5 && d.tiers.length === 5 && ['WIN', 'BIG WIN', 'EXTRA WIN', 'MEGA WIN'].every(function (n, i) { return d.tiers[i] === n; }), l + ' : paliers WIN, BIG WIN, EXTRA WIN, MEGA WIN présents (+ palier ultime)');
  ok(wt.length === 5 && d.tiers.every(function (n, i) { return new RegExp(n + ' (dès|from) ×' + wt[i] + '(?!\\d)').test(rt); }), l + ' : les règles citent les seuils de gain ×' + wt.join(', ×') + ' (G.WIN_TIERS)');
});
ok(!/jusqu.à 200×|up to 200×/.test(mainSrc), 'plus de description chiffrée en dur dans main.js');
console.log(fails ? '\n' + fails + ' échec(s)' : '\ntout est bon'); process.exit(fails ? 1 : 0);
