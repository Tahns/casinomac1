// node tools/brand-compose.js — compose les visuels de marque (miniatures, key art titré, wordmark, bannières de bonus) dans brand/.
// Entrées : brand/art/*.jpg (maîtres sans texte, générés dans Canva) et img/ic_*.jpg (icônes du jeu).
// Tout le texte est composé ici avec Cinzel / Philosopher (fonts/, OFL) : aucun texte généré par IA dans les images.
// Prérequis : PLAYWRIGHT_CORE=/chemin/playwright-core, CHROMIUM=/chemin/chrome. Outil de dev uniquement.
var fs = require('fs'), path = require('path');
var pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
var root = path.join(__dirname, '..'), B = path.join(root, 'brand');
var F = 'file://' + root + '/fonts/';
var CSS = '@font-face{font-family:Cinzel;font-weight:900;src:url(' + F + 'cinzel-latin-900-normal.woff2)}' +
  '@font-face{font-family:Cinzel;font-weight:600;src:url(' + F + 'cinzel-latin-600-normal.woff2)}' +
  '@font-face{font-family:Philosopher;font-weight:700;src:url(' + F + 'philosopher-latin-700-normal.woff2)}' +
  '@font-face{font-family:Philosopher;font-weight:400;src:url(' + F + 'philosopher-latin-400-normal.woff2)}' +
  'html,body{margin:0;background:#0a0908}*{box-sizing:border-box}' +
  '.stage{position:relative;overflow:hidden;background:#0a0908;color:#d6b56a}' +
  '.bg{position:absolute;inset:0;background-size:cover}' +
  '.shade{position:absolute;inset:0}' +
  '.t1{font:600 1em Cinzel;letter-spacing:.9em;color:#c9a24e;text-indent:.9em;text-shadow:0 .06em 0 #120b03}' +
  '.t2{font:900 1em/1 Cinzel;letter-spacing:.04em;text-indent:.04em;background:linear-gradient(180deg,#f1deaa 0%,#d2ab57 45%,#8d6a2b 78%,#6e4f1e 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 .035em 0 #120b03)}' +
  '.rule{height:2px;background:linear-gradient(90deg,transparent,#b8934a,transparent)}' +
  '.ttl{position:absolute;left:0;right:0;text-align:center;display:flex;flex-direction:column;align-items:center}';
var A = function (n) { return 'file://' + B + '/art/' + n; };

function title(sz, bottom) {   // bloc titre centré ; sz = hauteur de police de UNCHAINED en px
  return '<div class="ttl" style="bottom:' + bottom + 'px"><div class="t1" style="font-size:' + (sz * 0.3) + 'px">ANUBIS</div>' +
    '<div class="rule" style="width:' + (sz * 5.2) + 'px;margin:' + (sz * 0.08) + 'px 0 ' + (sz * 0.1) + 'px"></div>' +
    '<div class="t2" style="font-size:' + sz + 'px">UNCHAINED</div></div>';
}
function art(w, h, img, pos, shadeTop, sz, bottom, noTitle, size) {   // size : taille du fond (ex. '86%') pour garder le cadenas au-dessus du titre
  return '<div class="stage" style="width:' + w + 'px;height:' + h + 'px"><div class="bg" style="background-image:url(' + A(img) + ');background-repeat:no-repeat;background-size:' + (size || 'cover') + ';background-position:' + pos + '"></div>' +
    (noTitle ? '' : '<div class="shade" style="background:linear-gradient(180deg,rgba(8,7,6,0) ' + shadeTop + '%,rgba(8,7,6,.78) 78%,rgba(8,7,6,.94) 100%)"></div>' + title(sz, bottom)) + '</div>';
}
var JOBS = [];
function job(file, w, h, html, o) { JOBS.push(Object.assign({ file: file, w: w, h: h, html: html }, o || {})); }

// --- key art titré 16:9 et miniatures ---
job('keyart-anubis-unchained-16x9.png', 2560, 1440, art(2560, 1440, 'keyart-16x9-2560x1440.jpg', 'center top', 45, 170, 50, 0, 'auto 90%'));
job('thumbnails/thumb-16x9-1920x1080.png', 1920, 1080, art(1920, 1080, 'keyart-16x9-2560x1440.jpg', 'center top', 45, 128, 40, 0, 'auto 90%'));
job('thumbnails/thumb-1x1-1080.png', 1080, 1080, art(1080, 1080, 'keyart-1x1-2048.jpg', 'center top', 60, 96, 34, 0, '84%'));
job('thumbnails/thumb-4x5-1080x1350.png', 1080, 1350, art(1080, 1350, 'keyart-4x5-1728x2160.jpg', 'center top', 56, 112, 46));
job('thumbnails/thumb-3x4-1200x1600.png', 1200, 1600, art(1200, 1600, 'keyart-4x5-1728x2160.jpg', 'center top', 55, 128, 56));
job('thumbnails/thumb-9x16-1080x1920.png', 1080, 1920, art(1080, 1920, 'splash-portrait-1080x1920.jpg', 'center top', 50, 128, 100));

// --- logo / wordmark (fond transparent) ---
function mark(col) {
  var t2 = col === 'white' ? 'background:none;color:#fff;-webkit-background-clip:border-box;filter:none' : '', t1 = col === 'white' ? 'color:#fff;text-shadow:none' : '';
  var r = col === 'white' ? 'background:#fff' : '';
  return '<div class="stage" style="width:2400px;height:640px;background:transparent;display:flex;align-items:center;justify-content:center"><div style="display:flex;flex-direction:column;align-items:center">' +
    '<div class="t1" style="font-size:96px;' + t1 + '">ANUBIS</div><div class="rule" style="width:1500px;margin:26px 0 30px;' + r + '"></div>' +
    '<div class="t2" style="font-size:320px;' + t2 + '">UNCHAINED</div></div></div>';
}
job('logo/wordmark-gold.png', 2400, 640, mark('gold'), { transparent: true });
job('logo/wordmark-white.png', 2400, 640, mark('white'), { transparent: true });
function emblem(withTitle) {
  var d = 1000, ring = 'box-shadow:0 0 0 10px #8d6a2b,0 0 0 14px #120b03,0 0 0 26px #b8934a,0 0 0 30px #120b03;';
  return '<div class="stage" style="width:1200px;height:' + (withTitle ? 1500 : 1200) + 'px;background:transparent">' +
    '<div style="position:absolute;left:100px;top:100px;width:' + d + 'px;height:' + d + 'px;border-radius:50%;overflow:hidden;' + ring + 'background:#050403 url(' + A('keyart-1x1-2048.jpg') + ') center/118% no-repeat"></div>' +
    (withTitle ? '<div class="ttl" style="bottom:70px;gap:0"><div class="t1" style="font-size:48px">ANUBIS</div><div class="t2" style="font-size:150px">UNCHAINED</div></div>' : '') + '</div>';
}
job('logo/emblem-1200.png', 1200, 1200, emblem(false), { transparent: true });
job('logo/logo-stacked-1200x1500.png', 1200, 1500, emblem(true), { transparent: true });

// --- bannières de bonus (1600x500) ; icônes du jeu (fond noir => screen) ---
var BONUS = [
  ['scarab', 'ic_scarab.jpg', 'Scarab Drop', 'Three golden scarabs fall, each hides a multiplier'],
  ['weigh', 'ic_weigh.jpg', 'Weighing of the Heart', 'Feather or heart: the heavier side wins'],
  ['vault', 'ic_vault.jpg', 'Treasure Vault', 'Twelve chests, golden keys extend your pick'],
  ['fury', 'ic_fury.jpg', 'Fury of Anubis', 'Pick a colour: the wheel is doubled'],
  ['crypt', 'ic_skull.jpg', 'Sanctuary of Tides', 'Secret bonus: drop the blocks, stack the total']];
BONUS.forEach(function (b) {
  job('banners/bonus-' + b[0] + '-1600x500.png', 1600, 500,
    '<div class="stage" style="width:1600px;height:500px;background:radial-gradient(ellipse 700px 420px at 1250px 250px,#1b2233 0%,#0d0e14 55%,#0a0908 100%)">' +
    '<div class="bg" style="background-image:url(' + A('keyart-16x9-2560x1440.jpg') + ');background-position:center 30%;opacity:.16;mix-blend-mode:luminosity"></div>' +
    '<div style="position:absolute;left:1000px;top:-30px;width:560px;height:560px;background:url(file://' + root + '/img/' + b[1] + ') center/cover;mix-blend-mode:screen;-webkit-mask:radial-gradient(circle,#000 52%,transparent 71%);mask:radial-gradient(circle,#000 52%,transparent 71%)"></div>' +
    '<div style="position:absolute;inset:18px;border:2px solid rgba(184,147,74,.55)"></div><div style="position:absolute;inset:30px;border:1px solid rgba(184,147,74,.28)"></div>' +
    '<div style="position:absolute;left:96px;top:92px;width:900px"><div class="t1" style="font-size:30px;text-indent:0;letter-spacing:.7em">BONUS</div>' +
    '<div class="rule" style="width:420px;margin:18px 0 22px;background:linear-gradient(90deg,#b8934a,transparent)"></div>' +
    '<div class="t2" style="font-size:' + (b[2].length > 14 ? 88 : 112) + 'px;line-height:1.04;text-indent:0;letter-spacing:.02em;width:860px">' + b[2].toUpperCase() + '</div>' +
    '<div style="font:400 38px/1.25 Philosopher;color:#cdbb94;margin-top:26px;width:860px">' + b[3] + '</div></div></div>');
});

(async function () {
  var br = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--no-sandbox', '--allow-file-access-from-files'] });
  for (var j of JOBS) {
    var ctx = await br.newContext({ viewport: { width: j.w, height: j.h } }), p = await ctx.newPage();
    var tmp = path.join(require('os').tmpdir(), 'brand-compose-' + process.pid + '.html'); fs.writeFileSync(tmp, '<!doctype html><meta charset="utf-8"><style>' + CSS + '</style>' + j.html); await p.goto('file://' + tmp);
    await p.evaluate(function () { return document.fonts.ready; }); await p.waitForTimeout(400);
    var out = path.join(B, j.file); fs.mkdirSync(path.dirname(out), { recursive: true });
    await p.screenshot({ path: out, omitBackground: !!j.transparent, clip: { x: 0, y: 0, width: j.w, height: j.h } });
    console.log('ok', j.file); await ctx.close();
  }
  await br.close();
})().catch(function (e) { console.error(e); process.exit(1); });
