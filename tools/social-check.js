// node tools/social-check.js — mode social (Stake.US) [77] [78] [225] [188] : aucun mot interdit dans les textes sociaux, aucun « $ » avec XSC / XGC.
//  1. statique : tous les textes du mode social, dans toutes les langues disponibles (js/i18n.js + bloc I18N_SOCIAL), le HTML statique, les noms de modes
//     des index.json présents dans le dépôt ; mots entiers, insensible à la casse (liste : SOCIAL.RESTRICTED dans js/social.js, tableau de la checklist) ;
//  2. devises : 10.00 SC / 10.00 GC, pas de « $ » ;
//  3. dynamique (si PLAYWRIGHT_CORE est défini) : ?social=true&currency=XSC puis XGC, quelques tours (≤ 12), fenêtres ouvertes ; tout le texte du DOM et du canvas
//     (G.txt) est scanné. CHROMIUM=/chemin/chrome si besoin. Sortie 1 au premier mot interdit.
var fs = require('fs'), path = require('path'), vm = require('vm'), http = require('http');
var WORDS = require('./social-words.js').compile();   // équivalents des mots interdits dans les 16 langues (liste et choix documentés dans tools/social-words.js)
var root = path.join(__dirname, '..'), fails = 0;
function ok(c, m) { if (!c) { fails++; console.log('ÉCHEC  ' + m); } else console.log('ok     ' + m); }

var sb = { window: {}, document: { documentElement: { setAttribute: function () {} }, querySelectorAll: function () { return []; } } };
sb.window.location = { search: '?social=true' };
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(root, 'js/i18n.js'), 'utf8').replace('root.I18N = {', 'root.I18N = { _D: D,'), sb);
sb.root = sb.window;
['social', 'currency'].forEach(function (n) { vm.runInContext(fs.readFileSync(path.join(root, 'js/' + n + '.js'), 'utf8'), sb); });
var W = sb.window, D = W.I18N._D, SOC = W.SOCIAL, CUR = W.CUR;
ok(SOC && SOC.active, 'js/social.js : ?social=true active le mode social');

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&').replace(/\s+/g, '\\s+'); }
var RES = SOC.RESTRICTED.map(function (w) { return { w: w, re: new RegExp('(?<![\\p{L}\\p{N}])' + esc(w) + '(?![\\p{L}\\p{N}])', 'iu') }; });
function scan(text, lang) { var t = String(text).normalize('NFC').replace(/\{\w+\}/g, ' '), out = [];   // les marqueurs {buy} ne sont pas du texte affiché
 RES.forEach(function (r) { if (r.re.test(t)) out.push(r.w); });   // liste anglaise de la checklist, cherchée dans toutes les langues
 (WORDS[lang] || []).forEach(function (r) { if (r.re.test(t)) out.push(lang + ':' + r.w); });   // équivalents dans la langue du texte
 return out; }

var found = {};   // mot → premiers exemples
function check(where, text, lang) {
  if (/[$\u20ac]/.test(String(text)) && where.indexOf('normal.') !== 0) (found['« $ » ou « € » en dur'] = found['« $ » ou « € » en dur'] || []).push(where + ' : « ' + String(text).slice(0, 90) + ' »');
  scan(text, lang || 'en').forEach(function (w) { (found[w] = found[w] || []).push(where + ' : « ' + String(text).replace(/\s+/g, ' ').slice(0, 90) + ' »'); });
}
function walk(v, p, lang) {
  if (typeof v === 'string') check(p, v, lang);
  else if (typeof v === 'function') { if (p.indexOf('I18N_SOCIAL') === 0) return; try { check(p + '()', v(12, '+5.00 SC'), lang); } catch (e) { check(p + '()', v.toString(), lang); } }
  else if (Array.isArray(v)) v.forEach(function (x, i) { walk(x, p + '[' + i + ']', lang); });
  else if (v && typeof v === 'object') Object.keys(v).forEach(function (k) { walk(v[k], p + '.' + k, lang); });
}

// 1. textes sociaux de chaque langue (la langue sans bloc social reçoit le jeu anglais)
var langs = Object.keys(D);
langs.forEach(function (l) { walk(SOC.strings(l), l, l); var bl = SOC.blocks(l); Object.keys(bl).forEach(function (n) { walk(bl[n], l + '.$' + n, l); }); });
// chaque langue a son propre jeu de textes sociaux (aucune ne retombe sur l'anglais) et sa liste de mots interdits
var SOCIAL_KEYS = ['bet', 'cost', 'buyBtn', 'buyNow', 'buyPrice', 'infoTitle', 'currencyL', 'demo', 'splashDemo', 'rules', '$rules', '$replay', '$rgs'];
langs.forEach(function (l) { var so = (W.I18N_SOCIAL || {})[l]; ok(!!so && SOCIAL_KEYS.every(function (k) { return so[k] != null; }) && (l === 'en' || (WORDS[l] || []).length > 3), l + ' : jeu de textes sociaux propre à la langue (' + (so ? Object.keys(so).length : 0) + ' entrées) et ' + (l === 'en' ? RES.length + ' mots interdits (liste officielle)' : (WORDS[l] || []).length + ' mots interdits équivalents')); });
// titre de la fenêtre des règles : « Rules & Win table » (casse respectée), pas de majuscules forcées
ok(W.I18N_SOCIAL.en.infoTitle === 'Rules & Win table', 'titre des règles en mode social : « ' + W.I18N_SOCIAL.en.infoTitle + ' »');
ok(langs.length >= 2, 'langues scannées en mode social : ' + langs.join(', '));
Object.keys(W.I18N_SOCIAL || {}).forEach(function (l) { walk(W.I18N_SOCIAL[l], 'I18N_SOCIAL.' + l, l); });
// à titre de contrôle : le mode normal contient bien des mots interdits (sinon la recherche ne vaut rien)
var normal = []; langs.forEach(function (l) { var s0 = found; found = {}; walk(D[l], 'normal.' + l, l); if (Object.keys(found).length) normal.push(l); found = s0; });
ok(normal.indexOf('en') >= 0, 'contrôle : la recherche trouve bien des mots interdits dans les textes anglais hors mode social');

// HTML statique visible (texte, aria-label, title, alt)
var html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
(html.match(/(aria-label|title|alt|placeholder)="[^"]*"/g) || []).forEach(function (a) { check('index.html ' + a.split('=')[0], a.replace(/^[^=]+="|"$/g, '')); });
check('index.html (texte)', html.replace(/<[^>]*>/g, ' '));

// noms de modes des math publish (index.json, stake-export…) affichés tels quels
var modeFiles = [];
(function find(d, depth) {
  if (depth > 4) return;
  fs.readdirSync(d, { withFileTypes: true }).forEach(function (e) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === '.claude') return;
    var f = path.join(d, e.name);
    if (e.isDirectory()) find(f, depth + 1); else if (e.name === 'index.json') modeFiles.push(f);
  });
})(root, 0);
modeFiles.forEach(function (f) {
  try { (JSON.parse(fs.readFileSync(f, 'utf8')).modes || []).forEach(function (m) { check(path.relative(root, f) + ' mode.name', m.name); }); } catch (e) { ok(false, f + ' illisible : ' + e.message); }
});
console.log('       (index.json de modes trouvés : ' + (modeFiles.length || 'aucun') + ')');

// 2. devises : formats officiels, jamais de « $ » en social
[['USD', '$10.00'], ['EUR', '€10.00'], ['CAD', 'CA$10.00'], ['MXN', 'MX$10.00'], ['JPY', '¥10'], ['XSC', '10.00 SC'], ['XGC', '10.00 GC'], ['XEC', '10.00 SC']].forEach(function (c) {
  ok(CUR.format(10, c[0], { lang: 'en' }) === c[1], 'devise ' + c[0] + ' : ' + CUR.format(10, c[0], { lang: 'en' }) + ' (attendu ' + c[1] + ')');
});
['XSC', 'XGC', 'XEC'].forEach(function (c) { ['en', 'fr'].forEach(function (l) { check('format ' + c + '/' + l, CUR.format(1234.5, c, { lang: l })); ok(CUR.format(1234.5, c, { lang: l }).indexOf('$') < 0, 'format ' + c + ' (' + l + ') sans « $ »'); }); });
ok(CUR.format(0.005, 'USD', { lang: 'en' }) === '$0.005' && CUR.format(0.1 * 0.05, 'XSC', { lang: 'en' }) === '0.005 SC', '[273] gain sous-centime : 0.1× sur 0.05 → 0.005, ni 0.00 ni 0.01');

function report() {
  var ws = Object.keys(found);
  ok(ws.length === 0, 'aucun mot interdit en mode social' + (ws.length ? ' : ' + ws.map(function (w) { return w.toUpperCase(); }).join(', ') : ''));
  ws.forEach(function (w) { console.log('         ' + w.toUpperCase() + ' → ' + found[w].slice(0, 3).join(' | ')); });
  console.log(fails ? '\n' + fails + ' échec(s)' : '\ntout est bon'); process.exit(fails ? 1 : 0);
}

// 3. dynamique
if (!process.env.PLAYWRIGHT_CORE) { console.log('       (partie navigateur ignorée : définir PLAYWRIGHT_CORE pour scanner le DOM et le canvas)'); report(); }
else (async function () {
  var pw = require(process.env.PLAYWRIGHT_CORE);
  var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };
  var server = http.createServer(function (req, res) {
    var f = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
    if (f.indexOf(root) !== 0 || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  await new Promise(function (r) { server.listen(0, r); });
  var b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--no-sandbox', '--use-gl=swiftshader'] });
  var cases = [['en', 'XSC'], ['fr', 'XGC'], ['en', 'XGC'], ['de', 'XSC'], ['ja', 'XGC'], ['ar', 'XSC'], ['ru', 'XGC'], ['vi', 'XSC'], ['tr', 'XGC'], ['hi', 'XSC'], ['zh', 'XGC'], ['ko', 'XSC'], ['es', 'XGC'], ['pt', 'XSC'], ['pl', 'XGC'], ['id', 'XSC'], ['fi', 'XGC']];
  for (var i = 0; i < cases.length; i++) {
    var lang = cases[i][0], cur = cases[i][1], p = await b.newPage({ viewport: { width: 1280, height: 720 } }), errs = [], tag = lang + '/' + cur;
    p.on('pageerror', function (e) { errs.push(e.message); });
    await p.addInitScript(function () {   // tout texte dessiné sur un canvas (visible, ou préparé hors écran : roue, médaillons) est collecté
      window.__t = new Set(); var P = CanvasRenderingContext2D.prototype;
      ['fillText', 'strokeText'].forEach(function (n) { var o = P[n]; P[n] = function (s) { window.__t.add(String(s)); return o.apply(this, arguments); }; });
    });
    await p.goto('http://localhost:' + server.address().port + '/index.html?debug&social=true&currency=' + cur + '&lang=' + lang);
    await p.waitForTimeout(500);
    var got = await p.evaluate(`(async function(){
      I18N.setLang(${JSON.stringify(lang)}); G.applyLang();
      var out = new Set(), raf = function () { return new Promise(function (r) { requestAnimationFrame(r); }); }, grab = function () { out.add(document.body.innerText); document.querySelectorAll('[aria-label],[title]').forEach(function (e) { out.add(e.getAttribute('aria-label') || ''); out.add(e.getAttribute('title') || ''); }); };
      grab();
      G.turbo = true; G.speed = 1.6;
      for (var r = 0; r < (${i === 0 ? 6 : 2}); r++) { G.play(); var g = 0; while (G.S.busy && g < 3000) { await G.advance(0.25); await raf(); g++; if (G.winOv) { grab(); G.skipWinOv(); } } grab(); }
      document.getElementById('btnBuy').click(); grab(); document.getElementById('modalClose').click();
      for (var k of ${i === 0 ? "['scarab', 'weigh', 'vault', 'crypt', 'hand']" : '[]'}) { var d = false; (k === 'hand' ? G.testBonus('scarab', 1, true) : G.testBonus(k, 1, false)).then(function () { d = true; }); var q = 0; while (!d && q < 150) { await G.advance(0.25); await raf(); q++; if (q % 6 === 0) grab(); } grab(); if (!d) { G.scene && G.scene.tap && G.scene.tap(); } }
      document.getElementById('btnInfo').click(); grab(); document.getElementById('modalClose').click();
      document.getElementById('btnSound').click(); grab();
      G.S.balance = 0.1; G.updateHud(); G.play(); grab();
      return { dom: Array.from(out).join('\\n'), canvas: Array.from(window.__t), cur: G.currency, bal: document.getElementById('bal').textContent, bet: document.getElementById('bet').textContent, html: document.documentElement.lang };
    })()`);
    got.dom.split('\n').forEach(function (l) { if (l.trim()) check('DOM ' + tag, l, lang); });
    got.canvas.forEach(function (s) { check('canvas ' + tag, s, lang); });
    var all = got.dom + '\n' + got.canvas.join('\n');
    ok(got.canvas.length > 5 && got.dom.length > 400, tag + ' : ' + got.canvas.length + ' textes canvas et ' + got.dom.length + ' caractères de DOM scannés');
    ok(lang !== 'en' || (/\bPLAY\b/.test(all) && /GET A BONUS/.test(all) && /Win table/.test(all)), tag + ' : les textes sociaux (PLAY, GET A BONUS, WIN TABLE) sont bien affichés');
    ok(got.cur === cur, tag + ' : devise ' + got.cur);
    ok(all.indexOf('$') < 0, tag + ' : aucun « $ » affiché (DOM + canvas)');
    ok(new RegExp('' + (cur === 'XSC' ? 'SC' : 'GC') + '$').test(got.bal.trim()), tag + ' : solde lu « ' + got.bal + ' », mise « ' + got.bet + ' »');
    ok(!errs.length, tag + ' : aucune erreur JS' + (errs.length ? ' : ' + errs[0] : ''));
    await p.close();
  }
  await b.close(); server.close(); report();
})().catch(function (e) { console.log('ÉCHEC  partie navigateur : ' + e.message); fails++; report(); });
