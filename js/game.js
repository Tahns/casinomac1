/* ANUBIS UNCHAINED — moteur de rendu : boucle, décor, roue, overlay de gros gains. */
(function (root) {
  'use strict';
  var M = root.AnubisMath, A = root.Art, C = A.C, TAU = A.TAU, FX = root.FX, Sfx = root.Sfx;
  var cv = document.getElementById('stage'), ctx = cv.getContext('2d');
  function mod(a, n) { return ((a % n) + n) % n; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  var G = root.G = {
    w: 0, h: 0, dpr: 1, t: 0, speed: 1, turbo: false, scene: null, ctx: ctx,
    cx: 0, cy: 0, R: 0, timers: [], tweens: [], fade: 0, winOv: null,
    quality: 'auto', mod: mod, clamp: clamp, txt: null, ease: FX.ease, onFrame: [], fxScale: 1, chain: null
  };

  /* ---------- temps : sleep / tween pilotés par la boucle (donc accélérables) ---------- */
  G.sleep = function (sec) { return new Promise(function (res) { G.timers.push({ t: sec, res: res }); }); };
  G.tween = function (dur, fn, ease) {
    return new Promise(function (res) { G.tweens.push({ t: 0, dur: Math.max(0.001, dur), fn: fn, ease: ease || null, res: res }); });
  };
  G.nextFrame = function () { return G.sleep(0); };

  /* ---------- texte ---------- */
  // familles de police : une seule source pour tout le canvas (miroir des variables CSS --f-title / --f-num / --f-text)
  // titres et lettrage : capitales romaines gravées (Cinzel) ; chiffres : Philosopher gras, chiffres alignés et lisibles en petit
  // (le « 1 » de Cinzel ressemble à un I) ; textes courants : Philosopher
  G.TITLE0 = 'Cinzel, "Trajan Pro", Georgia, serif'; G.NUM0 = 'Philosopher, Cinzel, Georgia, serif';   // bases ; I18N.setLang y ajoute les polices de repli (ar, hi, ja, ko, zh)
  G.TITLE = G.TITLE0;
  G.NUM = G.NUM0;
  G.TEXT0 = 'Philosopher, Georgia, serif'; G.TEXT = G.TEXT0;
  G.NUM_K = 1.12; // Philosopher a une hauteur de chiffre plus faible qu’Oswald : compensation pour garder les chiffres lisibles en petit
  G.FONT_LOADS = ['600 20px Cinzel', '700 20px Cinzel', '900 20px Cinzel', '400 20px Philosopher', '700 20px Philosopher'];
  var isNum = G.isNum = function (s) { s = root.CUR ? root.CUR.strip(s, G.currency) : String(s); return /^[+×x\d\s.,\u00a0\u202f\u20ac$\-]+$/.test(s) && /\d/.test(s); };
  G.txt = function (s, x, y, o) {
    o = o || {};
    var num = !o.family && isNum(s);
    ctx.font = (num ? 700 : (o.weight || 800)) + ' ' + (o.size || 20) * (num ? G.NUM_K : 1) + 'px ' + (num ? G.NUM : (o.family || G.TITLE));
    ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
    if (o.spacing && ctx.letterSpacing !== undefined && !I18N.joined()) ctx.letterSpacing = o.spacing + 'px';   // jamais d'espacement entre lettres liées (arabe, hindi)
    if (o.shadow) { ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = Math.max(1.5, (o.size || 20) * 0.07); }   // ombre dure d'obsidienne : jamais de halo flou
    if (o.stroke) { ctx.lineWidth = o.sw || Math.max(2, (o.size || 20) * 0.12); ctx.strokeStyle = o.stroke; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
    ctx.fillStyle = o.fill || '#efdfa8'; ctx.fillText(s, x, y);
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    if (o.spacing && ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px';
  };
  G.goldText = function (s, x, y, size, o) {
    o = o || {};
    var g = A.goldGrad(ctx, 0, y - size * 0.55, 0, y + size * 0.55);   // or patiné à bandes dures
    if (isNum(s)) G.txt(s, x, y + size * 0.05, { size: size, fill: '#6a4208', stroke: '#2a1802', sw: o.sw || size * 0.1, align: o.align, spacing: o.spacing }); // épaisseur
    G.txt(s, x, y, { size: size, weight: 900, fill: g, stroke: o.stroke || '#3a2706', sw: o.sw || size * 0.1, shadow: 'on', align: o.align, spacing: o.spacing });
  };
  G.fmt = function (n) {
    var a = Math.abs(n);
    return n.toLocaleString(I18N.locale(), { minimumFractionDigits: a % 1 ? 2 : 0, maximumFractionDigits: 2 });
  };

  // argent : symbole, position et décimales de la devise (js/currency.js : $10.00, CA$10.00, ¥10, 10.00 SC…) ; un gain sous-centime garde ses
  // décimales (valeur exacte du RGS, 6 décimales au plus), jamais de flottant brut
  G.currency = 'EUR';
  G.sym = function () { return root.CUR.symbol(G.currency); };
  G.r2 = function (n) { return Math.round(n * 100 + (n < 0 ? -1e-9 : 1e-9)) / 100; };
  G.r6 = function (n) { return Math.round(n * 1e6 + (n < 0 ? -1e-9 : 1e-9)) / 1e6; };   // précision du RGS (micro-unités)
  G.rc = function (n) { return root.CUR.round(n, G.currency); };                            // précision de la devise (compteurs animés)
  G.money = function (n, signed) { return root.CUR.format(n, G.currency, { signed: signed, lang: I18N.lang(), locale: I18N.locale && I18N.locale(), after: I18N.currencyAfter && I18N.currencyAfter() }); };
  // compteur animé : décimales de la devise pendant le défilement, valeur exacte (sous-centime compris) à l'arrivée
  G.moneyCount = function (cur, fin) { return cur >= fin ? G.money(G.r6(fin)) : G.money(G.rc(cur)); };

  /* ---------- mise en page ---------- */
  var bg = document.createElement('canvas'), frz = document.createElement('canvas');
  var lampOn, lampOff, torchT = 0;
  var dust = [], embers = [];
  for (var ei = 0; ei < 34; ei++) embers.push({ x: Math.random(), y: Math.random(), s: 1 + Math.random() * 2.4, v: 0.02 + Math.random() * 0.05, p: Math.random() * 6.28, teal: Math.random() < 0.55 });
  for (var di = 0; di < 46; di++) dust.push({ x: Math.random(), y: Math.random(), s: 0.6 + Math.random() * 1.8, v: 0.01 + Math.random() * 0.035, p: Math.random() * 6.28 });

  function layout() {
    var dpr = Math.min(root.devicePixelRatio || 1, G.quality === 'low' || G.autoLow ? 1 : 2);
    G.dpr = dpr; G.w = root.innerWidth; G.h = root.innerHeight;
    cv.width = Math.round(G.w * dpr); cv.height = Math.round(G.h * dpr);
    var hud = document.getElementById('hud');
    var hudH = hud ? hud.offsetHeight : 110;
    document.documentElement.style.setProperty('--hud-h', hudH + 'px');
    G.compact = G.h < 520;                       // paysage de téléphone : tout est resserré
    var land = G.compact && G.w > G.h;
    var tiny = G.h < 260;                         // fenêtre flottante 400×225 : barre haute et HUD miniaturisés
    var topH = tiny ? 30 : land ? 38 : G.w < 760 ? 52 : 62;
    var availH = G.h - hudH - topH - (tiny ? 9 : land ? 12 : 38);
    var R = Math.min(G.w * 0.455, availH * 0.5) / 1.1;
    if (G.w < 760 && !land) R = Math.min(G.w * 0.46 / 1.08, availH * 0.5 / 1.08);
    G.R = Math.max(tiny ? 36 : land ? 60 : 90, R);
    G.cx = G.w / 2; G.cy = topH + availH / 2 + 6;
    FX.floorY = G.h - hudH - 10;
    buildLamps(); buildBackdrop(); if (G.wheel) G.wheel.build();
    if (G.scene && G.scene.layout) G.scene.layout();
  }

  /* ---------- lampes de la roue ---------- */
  function buildLamps() {
    // goujons dorés de la jante : disque bombé à arête dure (clair en haut à gauche = torche, sombre en bas à droite), anneau net quand ils s'allument ; aucun halo flou
    function mk(on) {
      var s = 40, c = document.createElement('canvas'); c.width = c.height = s; var x = c.getContext('2d'), r = on ? 5.6 : 8;
      x.beginPath(); x.arc(20, 21.2, r + 0.6, 0, TAU); x.fillStyle = 'rgba(0,0,0,.7)'; x.fill();                    // ombre dure courte
      var g = x.createLinearGradient(14, 13, 26, 27);
      if (on) { g.addColorStop(0, '#fbf1c8'); g.addColorStop(0.5, '#e3c777'); g.addColorStop(1, '#a98536'); }
      else { g.addColorStop(0, '#6b5528'); g.addColorStop(0.5, '#3d3016'); g.addColorStop(1, '#1d160a'); }
      x.beginPath(); x.arc(20, 20, r, 0, TAU); x.fillStyle = g; x.fill();
      x.lineWidth = 1; x.strokeStyle = on ? 'rgba(255,248,215,.9)' : 'rgba(120,96,44,.7)'; x.beginPath(); x.arc(20, 20, r - 0.5, Math.PI * 0.95, Math.PI * 1.6); x.stroke();
      x.strokeStyle = 'rgba(20,12,2,.8)'; x.beginPath(); x.arc(20, 20, r - 0.5, Math.PI * 1.95, Math.PI * 2.6); x.stroke();
      if (on) { x.lineWidth = 1.3; x.strokeStyle = 'rgba(244,224,160,.6)'; x.beginPath(); x.arc(20, 20, 8.6, 0, TAU); x.stroke(); }
      return c;
    }
    lampOn = mk(true); lampOff = mk(false);
  }

  /* ---------- décor statique : temple d'obsidienne ---------- */
  function column(x, topY, botY, w, f) {
    var g = f.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    g.addColorStop(0, '#0a0705'); g.addColorStop(0.18, '#2a1f13'); g.addColorStop(0.5, '#4a3820'); g.addColorStop(0.82, '#241a0f'); g.addColorStop(1, '#080604');
    f.fillStyle = g; f.fillRect(x - w / 2, topY, w, botY - topY);
    f.strokeStyle = 'rgba(0,0,0,.45)'; f.lineWidth = 1;
    for (var i = 1; i < 6; i++) { f.beginPath(); f.moveTo(x - w / 2 + w * i / 6, topY); f.lineTo(x - w / 2 + w * i / 6, botY); f.stroke(); }
    // frise de hiéroglyphes
    f.fillStyle = A.rgba(C.gold, 0.5);
    A.glyphStrip(f, x - w * 0.26, topY + (botY - topY) * 0.24, w * 0.52, (botY - topY) * 0.7, A.rgba(C.gold, 0.55), x);
    // bandes d'or
    [topY + 4, botY - 12].forEach(function (yy) { f.fillStyle = A.goldGrad(f, x - w / 2, yy, x + w / 2, yy); f.fillRect(x - w / 2 - 4, yy, w + 8, 8); });
  }

  var ART = G.art = {};
  Object.keys(window.ANUBIS_IMG || {}).forEach(function (k) {
    var im = new Image(); im.onload = function () { ART[k] = im; if (k === 'key' && G.w) buildBackdrop(); if ((k === 'gold' || k.indexOf('ic_') === 0) && G.w && W.build) W.build(); }; im.src = window.ANUBIS_IMG[k];
  });
  // logo de bonus illustré (fond noir fondu en 'screen') ; renvoie false si l'image manque
  // le fond noir devient transparent (alpha = canal max) : le logo se pose sur n'importe quel fond
  var cut = {};
  function cutout(k) {
    if (cut[k] !== undefined) return cut[k];
    var im = ART['ic_' + k], c = null;
    try {
      c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
      var x = c.getContext('2d'); x.drawImage(im, 0, 0);
      var d = x.getImageData(0, 0, c.width, c.height), p = d.data;
      for (var i = 0; i < p.length; i += 4) {
        var m = Math.max(p[i], p[i + 1], p[i + 2]);
        p[i + 3] = clamp((m - 10) * 9, 0, 255); // couleurs inchangées, seul le noir pur devient transparent
      }
      x.putImageData(d, 0, 0);
    } catch (e) { c = null; }
    return (cut[k] = c);
  }
  G.cutout = function (k) { return ART['ic_' + k] ? cutout(k) : null; };
  G.icon = function (c, kind, x, y, s) {
    var im = ART['ic_' + kind]; if (!im) return false;
    var ct = cutout(kind);
    if (ct) c.drawImage(ct, x - s / 2, y - s / 2, s, s);
    else { c.save(); c.globalCompositeOperation = 'screen'; c.drawImage(im, x - s / 2, y - s / 2, s, s); c.restore(); }
    return true;
  };
  function cover(c, im, w, h) {
    var k = Math.max(w / im.width, h / im.height), iw = im.width * k, ih = im.height * k;
    c.drawImage(im, (w - iw) / 2, (h - ih) / 2, iw, ih);
  }

  function buildBackdrop() {
    var w = G.w, h = G.h, dpr = G.dpr; BG = null;
    bg.width = Math.round(w * dpr); bg.height = Math.round(h * dpr);
    var f = bg.getContext('2d'); f.setTransform(dpr, 0, 0, dpr, 0, 0);
    var g = f.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#040302'); g.addColorStop(0.5, '#16100a'); g.addColorStop(1, '#070504');
    f.fillStyle = g; f.fillRect(0, 0, w, h);
    if (ART.key) {
      cover(f, ART.key, w, h);
      f.fillStyle = 'rgba(4,3,2,.22)'; f.fillRect(0, 0, w, h);
      G.guard = null;
    } else {
    // assises de pierre
    f.strokeStyle = 'rgba(207,169,76,.045)'; f.lineWidth = 1;
    var bh = Math.max(34, h / 18);
    for (var y = 0, r = 0; y < h; y += bh, r++) {
      f.beginPath(); f.moveTo(0, y); f.lineTo(w, y); f.stroke();
      for (var x = (r % 2) * bh * 1.5; x < w; x += bh * 3) { f.beginPath(); f.moveTo(x, y); f.lineTo(x, y + bh); f.stroke(); }
    }
    // gardiens d'Anubis de part et d'autre (si la place le permet)
    var gx = G.R * 1.62, gw = clamp(G.R * 0.2, 34, 72);
    if (G.cx - gx > gw * 1.3) {
      [-1, 1].forEach(function (sd) {
        var x = G.cx + sd * gx, top = G.cy - G.R * 0.28, bot = G.h;
        column(x, top, bot, gw, f);
        A.jackal(f, x, top - G.R * 0.22, G.R * 0.26, { glow: 0 });
        // brasero
        f.fillStyle = A.goldGrad(f, x - gw, 0, x + gw, 0);
        f.beginPath(); f.moveTo(x - gw * 0.8, top + G.R * 0.78); f.lineTo(x + gw * 0.8, top + G.R * 0.78); f.lineTo(x + gw * 0.5, top + G.R * 0.95); f.lineTo(x - gw * 0.5, top + G.R * 0.95); f.closePath(); f.fill();
      });
      G.guard = { x: gx, top: G.cy - G.R * 0.28, s: G.R * 0.26, bowlY: G.cy - G.R * 0.28 + G.R * 0.78 };
    } else G.guard = null;
    }
    // grain de pierre
    var nt = A.noiseTile(128, 0.05); f.globalCompositeOperation = 'overlay'; f.fillStyle = f.createPattern(nt, 'repeat'); f.fillRect(0, 0, w, h); f.globalCompositeOperation = 'source-over';
    // frise de hiéroglyphes sous le linteau : calque fixe (ne suit pas la parallaxe)
    var fh = clamp(h * 0.022, 14, 20);
    frz.width = Math.round(w * dpr); frz.height = Math.round((fh + 8) * dpr);
    var z = frz.getContext('2d'); z.setTransform(dpr, 0, 0, dpr, 0, 0);
    z.fillStyle = 'rgba(0,0,0,.72)'; z.fillRect(0, 0, w, fh + 6);
    z.fillStyle = A.goldGrad(z, 0, 0, w, 0); z.fillRect(0, fh + 6, w, 2);
    A.glyphRow(z, 0, 3, w, fh, A.rgba(C.gold, 0.5), 7);
    // sol poli
    var fl = f.createLinearGradient(0, h * 0.78, 0, h);
    fl.addColorStop(0, 'rgba(207,169,76,0)'); fl.addColorStop(1, 'rgba(207,169,76,.08)');
    f.fillStyle = fl; f.fillRect(0, h * 0.78, w, h * 0.22);
    // vignette
    var v = f.createRadialGradient(w / 2, h * 0.48, Math.min(w, h) * 0.3, w / 2, h * 0.48, Math.max(w, h) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.82)');
    f.fillStyle = v; f.fillRect(0, 0, w, h);
  }

  // Dégradés du fond : construits une fois (unités ou géométrie de la mise en page), jamais à chaque image ; l'opacité variable passe par globalAlpha.
  var UG = {}, BG = null;
  function unitGrad(key, r0, stops) {   // disque dégradé de rayon 1 centré en (0,0), placé par translate + scale
    var g = UG[key]; if (g) return g;
    g = ctx.createRadialGradient(0, 0, r0, 0, 0, 1);
    stops.forEach(function (st) { g.addColorStop(st[0], st[1]); });
    return UG[key] = g;
  }
  function backdropGrads() {   // dégradés qui dépendent de la taille de l'écran : recréés seulement après buildBackdrop
    if (BG) return BG;
    var w = G.w, h = G.h, vg = ctx.createLinearGradient(0, 0, 0, h * 0.6), vv = ctx.createRadialGradient(w / 2, h * 0.5, Math.min(w, h) * 0.35, w / 2, h * 0.5, Math.max(w, h) * 0.8);
    vg.addColorStop(0, 'rgba(14,26,52,1)'); vg.addColorStop(1, 'rgba(14,26,52,0)');
    vv.addColorStop(0, 'rgba(6,8,16,0)'); vv.addColorStop(1, 'rgba(6,9,20,.6)');
    return BG = { vg: vg, vv: vv };
  }
  function blob(g, x, y, rx, ry, alpha) {   // remplit le dégradé unité g en (x, y), rayons rx / ry
    ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry); ctx.globalAlpha = alpha; ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
  }
  function drawBackdrop(dim, img) {
    var w = G.w, h = G.h, t = G.t, bgG = backdropGrads();
    ctx.drawImage(bg, 0, 0, w, h);
    if (img && ART[img]) { ctx.globalAlpha = Math.min(1, dim * 1.2 + 0.2); cover(ctx, ART[img], w, h); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(2,3,8,.4)'; ctx.fillRect(0, 0, w, h); }
    // rayons rotatifs derrière la roue
    A.rays(ctx, G.cx, G.cy, Math.max(w, h) * 0.9, 16, t * 0.05, '#b8934a', 0.04 * (1 - dim * 0.6));
    blob(unitGrad('glow', 0.4 / 1.9, [[0, 'rgba(206,150,70,1)'], [1, 'rgba(206,150,70,0)']]), G.cx, G.cy, G.R * 1.9, G.R * 1.9, 0.13 * (1 - dim * 0.5));
    // braseros + yeux des gardiens
    if (G.guard) {
      [-1, 1].forEach(function (sd) {
        var x = G.cx + sd * G.guard.x, fl = 0.85 + Math.sin(t * 9 + sd) * 0.1 + Math.sin(t * 23) * 0.05, bw = G.R * 0.16;
        blob(unitGrad('brazier', 0, [[0, 'rgba(236,200,130,.8)'], [0.3, 'rgba(206,130,52,.42)'], [1, 'rgba(160,70,24,0)']]), x, G.guard.bowlY - bw * 0.7, bw * 2.4 * fl, bw * 2.4 * fl, 1);
        ctx.fillStyle = 'rgba(226,176,92,.95)';
        ctx.beginPath(); ctx.moveTo(x - bw * 0.5, G.guard.bowlY); ctx.quadraticCurveTo(x - bw * 0.4, G.guard.bowlY - bw * 1.7 * fl, x + Math.sin(t * 7 + sd) * bw * 0.2, G.guard.bowlY - bw * 2.1 * fl);
        ctx.quadraticCurveTo(x + bw * 0.5, G.guard.bowlY - bw * 1.5 * fl, x + bw * 0.5, G.guard.bowlY); ctx.fill();
        var s = G.guard.s, ey = G.guard.top - G.R * 0.22 + s * 0.1;
        [-1, 1].forEach(function (e) {
          var ex = x + e * s * 0.31, p = 0.55 + 0.45 * Math.sin(t * 2.2 + sd);
          blob(unitGrad('eye', 0, [[0, 'rgba(214,240,232,1)'], [0.3, 'rgba(84,196,180,1)'], [1, 'rgba(24,140,128,0)']]), ex, ey, s * 0.28, s * 0.28, p);
        });
      });
    }
    // brume : deux nappes qui dérivent à des profondeurs différentes
    if (!FX.lite) [[0.0, 0.62, 0.9, 26], [0.5, 0.78, 0.7, -42]].forEach(function (fg, n) {
      var fx = ((t * 0.012 * (n ? -1 : 1) + fg[0]) % 1) * w * 1.6 - w * 0.3 + G.par.x * fg[3], fy = h * fg[1];
      blob(unitGrad('fog', 0, [[0, 'rgba(176,150,110,1)'], [1, 'rgba(176,150,110,0)']]), fx, fy, w * 0.45, w * 0.45 * 0.35, 0.06 * fg[2]);
    });
    // poussière d'or
    ctx.fillStyle = '#c9a65c';
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i], yy = mod(d.y - t * d.v, 1) * h, xx = (d.x + Math.sin(t * 0.3 + d.p) * 0.02) * w + G.par.x * d.s * 9;
      ctx.globalAlpha = 0.18 + 0.22 * Math.sin(t * 1.3 + d.p) * Math.sin(t * 1.3 + d.p);
      ctx.beginPath(); ctx.arc(xx, yy, d.s, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // étalonnage « Anubis Unchained » : ombres violettes en haut, lueur turquoise du sol, braises qui montent
    var fk = 0.92 + Math.sin(t * 7.3) * 0.045 + Math.sin(t * 17.1) * 0.03;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.26 * (1 - dim * 0.4); ctx.fillStyle = bgG.vg; ctx.fillRect(0, 0, w, h * 0.6); ctx.globalAlpha = 1;
    blob(unitGrad('teal', 0, [[0, 'rgba(32,210,190,1)'], [1, 'rgba(32,210,190,0)']]), G.cx, h * 1.02, Math.max(w, h) * 0.55, Math.max(w, h) * 0.55, 0.05 * fk);
    ctx.restore();
    if (!FX.lite) {
      for (var ej = 0; ej < embers.length; ej++) {
        var em = embers[ej], ey = (1 - mod(em.y + t * em.v, 1)) * h, ex = (em.x + Math.sin(t * 0.5 + em.p) * 0.03) * w + G.par.x * em.s * 14, ea = Math.sin(Math.PI * (1 - ey / h)) * (0.35 + 0.35 * Math.sin(t * 2 + em.p));
        ctx.globalAlpha = Math.max(0, ea); ctx.fillStyle = em.teal ? '#4aa596' : '#d9893c';
        ctx.beginPath(); ctx.arc(ex, ey, em.s, 0, TAU); ctx.fill();
      }
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }
    ctx.fillStyle = bgG.vv; ctx.fillRect(0, 0, w, h);
    if (dim) { ctx.fillStyle = 'rgba(0,0,0,' + dim + ')'; ctx.fillRect(0, 0, w, h); }
  }
  G.drawBackdrop = drawBackdrop;

  /* ============================== LA ROUE ============================== */
  // palette de la roue : pierres dures et métaux d'Égypte (lapis, turquoise, malachite, cornaline, ivoire de papyrus, or) — aucune couleur d'interface saturée
  var VIS = {
    m0:    { c: ['#6b5f4c', '#4a4132'], tx: '#efe2bf', glyph: 'dust' },
    m025:  { c: ['#c2a05a', '#8f6a2a'], tx: '#1c1000' },
    m05:   { c: ['#d6bb72', '#a58234'], tx: '#1c1000' },
    m1:    { c: ['#4a72bf', '#2a509e'], tx: '#f8f1de' },
    m2:    { c: ['#1fa596', '#14786d'], tx: '#021a17' },
    m3:    { c: ['#4e9a70', '#2a6648'], tx: '#f8f1de' },
    ankh:  { c: ['#e8d49a', '#b99443'], tx: '#2e1f05', glyph: 'ankh' },
    scarab:{ c: ['#b24a34', '#74261a'], tx: '#f8f1de', glyph: 'scarab' },
    weigh: { c: ['#f0e4c2', '#cdb780'], tx: '#3a2a10', glyph: 'feather' },
    vault: { c: ['#33291a', '#1a140b'], tx: '#e2c477', glyph: 'pyramid' }
  };
  G.VIS = VIS;
  G.kindColor = function (k) { return VIS[k].c[0]; };

  var W = G.wheel = {
    rot: 0, vel: 0, mode: 'idle', ptr: { a: 0, v: 0 }, oracle: null, hl: null, face: null, lastIdx: -1, lastTick: 0, flashLamps: 0, spinning: false,
    dark: 0, sweep: -1, susp: 0, nearIdx: -1, plan: null, phase: '', beatT: 0
  };
  var step = TAU / M.N;
  var BON = [];   // indices des cases bonus (suspense)
  M.LAYOUT.forEach(function (k, i) { if (M.KINDS[k].bonus) BON.push(i); });

  function chordAt(r) { return r * step; }
  function wedge(f, i, ri, ro) {
    var a0 = i * step - Math.PI / 2, a1 = (i + 1) * step - Math.PI / 2;
    f.beginPath(); f.arc(0, 0, ro, a0, a1); f.arc(0, 0, ri, a1, a0, true); f.closePath();
  }

  // anneau métallique : dégradé conique + martelage (texture) + biseau
  function metalRing(f, rOut, rIn) {
    var cg = f.createConicGradient ? f.createConicGradient(-0.6, 0, 0) : null;
    if (cg) {
      ['#6e5420', '#e3d19a', '#b4903f', '#efe1b2', '#8a6c2c', '#d4b86a', '#5f4719', '#dcc57e', '#6e5420'].forEach(function (c, n, a) { cg.addColorStop(n / (a.length - 1), c); });
    }
    f.save();
    f.beginPath(); f.arc(0, 0, rOut, 0, TAU); f.arc(0, 0, rIn, 0, TAU, true);
    f.fillStyle = cg || A.goldGrad(f, -rOut, -rOut, rOut, rOut); f.fill('evenodd');
    if (ART.gold) {
      f.clip('evenodd'); f.globalCompositeOperation = 'overlay'; f.globalAlpha = 0.75;
      f.drawImage(ART.gold, -rOut, -rOut, rOut * 2, rOut * 2);
      f.globalCompositeOperation = 'source-over'; f.globalAlpha = 1;
    }
    f.restore();
    // biseau : filet clair dehors, filet sombre dedans
    f.lineWidth = Math.max(1, rOut * 0.006);
    f.strokeStyle = 'rgba(244,234,196,.85)'; f.beginPath(); f.arc(0, 0, rOut - f.lineWidth * 0.5, 0, TAU); f.stroke();
    f.strokeStyle = 'rgba(30,18,2,.85)'; f.beginPath(); f.arc(0, 0, rIn + f.lineWidth * 0.5, 0, TAU); f.stroke();
  }

  var STONE = null;
  function stoneGrain(f) {   // motif de grain de pierre, créé une fois
    if (!STONE) STONE = f.createPattern(A.noiseTile(128, 0.55), 'repeat');
    return STONE;
  }

  W.build = function () {
    var R = G.R, dpr = G.dpr, pad = 6;
    var fc = W.face || (W.face = document.createElement('canvas'));
    fc.width = fc.height = Math.ceil((2 * R + pad * 2) * dpr);
    var f = fc.getContext('2d'); f.setTransform(dpr, 0, 0, dpr, 0, 0); f.translate(R + pad, R + pad);
    var T = I18N.t(), ri = R * 0.30, ro = R * 0.935, i, k, v;
    var RC = (ri + ro) / 2, chord = function (r) { return r * step; }; // RC : milieu radial de la case ; chord : largeur du secteur à ce rayon
    // fond
    f.beginPath(); f.arc(0, 0, R * 0.96, 0, TAU); f.fillStyle = '#0a0705'; f.fill();
    for (i = 0; i < M.N; i++) {
      k = M.LAYOUT[i]; v = VIS[k];
      wedge(f, i, ri, ro);
      var am = (i + 0.5) * step - Math.PI / 2, gx = Math.cos(am), gy = Math.sin(am);
      var g = f.createRadialGradient(gx * ri, gy * ri, 0, gx * ro, gy * ro, ro - ri);
      g.addColorStop(0, v.c[1]); g.addColorStop(1, v.c[0]);
      var gg = f.createRadialGradient(0, 0, ri, 0, 0, ro); gg.addColorStop(0, v.c[1]); gg.addColorStop(0.55, A.mix(v.c[1], v.c[0], 0.5)); gg.addColorStop(1, v.c[0]);
      f.fillStyle = gg; f.fill();
      // matière : grain de pierre taillée (pas de reflet plastique) ; la lumière de torche vient du haut-gauche
      f.save(); wedge(f, i, ri, ro); f.clip();
      f.globalCompositeOperation = 'overlay'; f.globalAlpha = 0.5; f.fillStyle = stoneGrain(f); f.fillRect(-R, -R, 2 * R, 2 * R);
      f.restore();
      // creux : ombre intérieure + arête éclairée => les secteurs semblent gravés dans la roue
      f.save(); wedge(f, i, ri, ro); f.clip(); wedge(f, i, ri, ro);
      f.lineWidth = R * 0.024; f.strokeStyle = 'rgba(0,0,0,.26)'; f.stroke();
      f.lineWidth = R * 0.007; f.strokeStyle = 'rgba(255,240,190,.28)'; f.translate(R * 0.004, R * 0.006); wedge(f, i, ri, ro); f.stroke();
      f.restore();
      // arêtes dorées
      wedge(f, i, ri, ro); f.lineWidth = Math.max(1, R * 0.006); f.strokeStyle = 'rgba(232,206,140,.7)'; f.stroke();
      // contenu : tout est centré dans la case (axe radial) et borné par la largeur réelle du secteur
      f.save(); f.rotate(am);
      var big = M.KINDS[k].bonus || k === 'ankh', fr = I18N.decimalComma();
      if (!big && (k === 'm05' || k === 'm025')) {
        // disque solaire de Râ : à moitié (0,5×) ou aux trois dixièmes (0,3×) rempli — se lit d'un coup d'œil, sans chiffre
        var rd = Math.min(chord(RC) * 0.36, R * 0.07), fq = k === 'm05' ? 0.5 : 0.3;
        f.save(); f.rotate(Math.PI / 2); f.translate(0, -RC);
        f.beginPath(); f.arc(0, 0, rd, 0, TAU); f.fillStyle = 'rgba(0,0,0,.4)'; f.fill();
        f.shadowColor = 'rgba(0,0,0,.6)'; f.shadowOffsetY = 1;
        f.beginPath(); f.moveTo(0, 0); f.arc(0, 0, rd * 0.86, -Math.PI / 2, -Math.PI / 2 + TAU * fq); f.closePath(); f.fillStyle = v.tx; f.fill();
        f.beginPath(); f.arc(0, 0, rd, 0, TAU); f.lineWidth = Math.max(1.2, rd * 0.2); f.strokeStyle = v.tx; f.stroke();
        f.shadowOffsetY = 0; f.restore();
      } else if (!big) {
        var lab = k === 'm0' ? '0' : ({ m025: fr ? '0,3' : '0.3', m05: fr ? '0,5' : '0.5', m1: '1', m2: '2', m3: '3' })[k];
        var frac = k === 'm025' || k === 'm05';
        // fractions : écrites le long du rayon (assez de place pour « 0,3 »), entiers : debout comme les logos
        var fs = R * (k === 'm0' ? 0.1 : frac ? 0.12 : 0.15) * G.NUM_K;
        f.font = '700 ' + fs + 'px ' + G.NUM;
        var tm = f.measureText(lab), tl = tm.actualBoundingBoxLeft, tr = tm.actualBoundingBoxRight, ta = tm.actualBoundingBoxAscent, td = tm.actualBoundingBoxDescent;
        var dh = f.measureText('0').actualBoundingBoxAscent, rc = RC + (k === 'm0' ? R * 0.045 : 0); // la poussière : « 0 » au-dessus du soleil éteint
        var shrink = frac ? Math.min(1, R * 0.30 / (tl + tr), chord(rc - (tl + tr) * 0.5) * 0.70 / dh) : Math.min(1, chord(rc - (ta + td) * 0.5) * 0.86 / (tl + tr));
        if (shrink < 1) { fs *= shrink; f.font = '700 ' + fs + 'px ' + G.NUM; tm = f.measureText(lab); tl = tm.actualBoundingBoxLeft; tr = tm.actualBoundingBoxRight; ta = tm.actualBoundingBoxAscent; td = tm.actualBoundingBoxDescent; }
        f.textAlign = 'left'; f.textBaseline = 'alphabetic'; f.fillStyle = v.tx;
        if (k !== 'm0') { f.shadowColor = 'rgba(0,0,0,.6)'; f.shadowOffsetY = 1; }
        else { f.globalAlpha = 0.62; f.fillStyle = '#d8cba6'; }          // hiérarchie : les « 0 » (case morte, répétée) s'effacent, 1 / 2 / 3 et les bonus ressortent
        if (frac) f.fillText(lab, rc - (tr - tl) / 2, (ta - td) / 2); // le long du rayon, centré sur l'axe de la case
        else { f.rotate(Math.PI / 2); f.fillText(lab, -(tr - tl) / 2, -rc + (ta - td) / 2); }
        f.shadowOffsetY = 0; f.globalAlpha = 1;
        if (k === 'm0') { f.globalAlpha = 0.4; A.skullX(f, 0, -(RC - R * 0.05), Math.min(R * 0.07, chord(RC) * 0.8), v.tx); f.globalAlpha = 1; }
      } else {
        // icône (debout) vers l'extérieur, nom le long du rayon vers le centre ; l'ensemble est centré dans la case
        var isz = Math.min(chord(RC + R * 0.12) * ({ scarab: 1.35, feather: 1.6, pyramid: 1.2, ankh: 1.2 })[v.glyph], R * 0.17), nm = T.kinds[k];
        var nfs = R * 0.056; f.font = '900 ' + nfs + 'px ' + G.TITLE;
        var nlen = f.measureText(nm).width, nmax = R * 0.30; if (nlen > nmax) { nfs *= nmax / nlen; nlen = nmax; f.font = '900 ' + nfs + 'px ' + G.TITLE; }
        var gap = R * 0.025, tot = nlen + gap + isz, r1 = RC + tot / 2;      // r1 : bord extérieur de l'icône
        var iy = r1 - isz / 2, nEnd = r1 - isz - gap;                         // fin du nom (côté icône)
        f.save(); f.rotate(Math.PI / 2);
        if (ART['ic_' + ({ scarab: 'scarab', feather: 'weigh', pyramid: 'vault', ankh: 'amulet' })[v.glyph]]) {
          // médaillon d'obsidienne sous l'icône : l'or patiné se lit sur tous les fonds de case ; filet d'or biseauté
          f.beginPath(); f.arc(0, -iy + isz * 0.02, isz * 0.52, 0, TAU); f.fillStyle = 'rgba(14,10,6,.78)'; f.fill();
          f.lineWidth = Math.max(1, isz * 0.035); f.strokeStyle = 'rgba(207,169,76,.85)'; f.stroke();
          f.lineWidth = Math.max(1, isz * 0.02); f.strokeStyle = 'rgba(239,223,168,.5)'; f.beginPath(); f.arc(0, -iy + isz * 0.02, isz * 0.52 - isz * 0.03, Math.PI, Math.PI * 1.6); f.stroke();
        }
        if (G.icon(f, ({ scarab: 'scarab', feather: 'weigh', pyramid: 'vault', ankh: 'amulet' })[v.glyph], 0, -iy, isz)) { /* logo illustré */ }
        else if (v.glyph === 'ankh') A.ankh(f, 0, -iy + isz * 0.02, isz * 0.74, '#3a2706');
        else if (v.glyph === 'scarab') A.scarab(f, 0, -iy, isz * 0.8, '#d9b857', 'rgba(0,0,0,.5)');
        else if (v.glyph === 'feather') A.feather(f, 0, -iy, isz * 0.9, '#4a3410', 'rgba(255,255,255,.7)');
        else if (v.glyph === 'pyramid') A.pyramid(f, 0, -iy, isz * 0.85, '#eadb9f', 'rgba(0,0,0,.45)');
        f.restore();
        f.font = '900 ' + nfs + 'px ' + G.TITLE; f.textAlign = 'right'; f.textBaseline = 'alphabetic'; f.fillStyle = v.tx;
        var nb = f.measureText(nm); f.shadowColor = 'rgba(0,0,0,.7)'; f.shadowOffsetY = 1;
        f.fillText(nm, nEnd, (nb.actualBoundingBoxAscent - nb.actualBoundingBoxDescent) / 2); f.shadowOffsetY = 0;
      }
      f.restore();
    }
    // anneau intérieur or
    metalRing(f, ri, ri * 0.93);
    // anneau extérieur or (jante rotative)
    // ombre portée des segments sous la jante
    var sg2 = f.createRadialGradient(0, 0, ro * 0.9, 0, 0, ro); sg2.addColorStop(0, 'rgba(0,0,0,0)'); sg2.addColorStop(1, 'rgba(0,0,0,.45)');
    f.beginPath(); f.arc(0, 0, ro, 0, TAU); f.fillStyle = sg2; f.fill();
    metalRing(f, R * 0.96, ro);
    // rivets
    for (i = 0; i < M.N; i++) {
      var ra = i * step - Math.PI / 2, rx = Math.cos(ra) * R * 0.948, ry = Math.sin(ra) * R * 0.948;
      f.beginPath(); f.arc(rx, ry, R * 0.008, 0, TAU); f.fillStyle = '#4f3a12'; f.fill();
      f.beginPath(); f.arc(rx - R * 0.0025, ry - R * 0.0025, R * 0.0034, 0, TAU); f.fillStyle = 'rgba(244,228,170,.75)'; f.fill();   // éclat de rivet
    }
  };

  W.update = function (dt) {
    // dérive douce à l'arrêt
    if (W.mode === 'idle') { W.rot += dt * 0.045; W.vel = 0; }
    // pointeur : ressort amorti
    var p = W.ptr; p.v += (-520 * p.a - 15 * p.v) * dt; p.a += p.v * dt; p.a = clamp(p.a, -0.62, 0.2);
    var idx = Math.floor(mod(-W.rot, TAU) / step);
    if (idx !== W.lastIdx) {
      if (W.lastIdx >= 0 && W.mode === 'spin') {
        var sp = Math.abs(W.vel);
        p.v -= 5.5 + Math.min(sp, 22) * 0.45;   // la cheville entraîne la pointe dans le sens de la roue (vers la droite en haut)
        var now = G.t;
        if (W.plan && W.plan.hush) { /* silence avant l'arrêt : plus aucun tic */ }
        else if (now - W.lastTick > 0.028) { if (W.plan && W.plan.active && W.susp > 0.12) Sfx.tickTense(W.susp); else Sfx.tick(Math.min(1, sp / 25)); W.lastTick = now; }
      }
      W.lastIdx = idx;
    }
    if (W.hl) W.hl.t += dt;
    if (W.oracle) W.oracle.t += dt;
    W.flashLamps = Math.max(0, W.flashLamps - dt);
    if (W.sweep >= 0) { W.sweep += dt * 3.4; if (W.sweep > 1.7) W.sweep = -1; }
    updateSusp(dt);
  };
  // suspense : toute case bonus qui s'approche du pointeur quand la roue est lente fait monter l'éclairage ; le plan du tour (bonus d'arrivée,
  // bonus frôlé) impose une approche au ralenti (voir W.spinTo). Purement visuel : l'issue est déjà tirée.
  function updateSusp(dt) {
    var target = 0, ni = -1;
    if (W.mode === 'spin' && W.phase === 'run') {
      var c = mod(-W.rot / step, M.N), slow = clamp(1 - Math.abs(W.vel) / step / 34, 0, 1);
      for (var b = 0; b < BON.length; b++) {
        var dd = mod(c - (BON[b] + 0.5), M.N), g = dd < 6 ? (1 - dd / 6) * slow : 0;
        if (g > target) { target = g; ni = BON[b]; }
      }
      if (W.plan && W.plan.tens > target) target = W.plan.tens;
    }
    if (ni >= 0) W.nearIdx = ni; else if (W.susp < 0.02) W.nearIdx = -1;
    W.susp += (target - W.susp) * Math.min(1, dt * (target > W.susp ? 6 : 3));
    if (W.susp < 0.003) W.susp = 0;
    if (W.plan && W.plan.level && W.susp > 0.5 && W.phase === 'run' && !W.plan.hush) {   // battements de cœur de plus en plus rapprochés
      W.beatT -= dt; if (W.beatT <= 0) { W.beatT = 1.05 - 0.6 * W.susp; Sfx.heartbeat(W.susp); }
    }
  }

  function drawLamps(R) {
    var n = M.N, t = G.t, spin = W.mode === 'spin' ? 1 : 0, su = W.susp, sw = W.sweep, dk = W.dark;
    for (var i = 0; i < n; i++) {
      var a = i * step - Math.PI / 2 - step / 2 * 0, x = G.cx + Math.cos(a) * R * 1.035, y = G.cy + Math.sin(a) * R * 1.035;
      var lv, pop = 1;
      if (W.flashLamps > 0) lv = 0.5 + 0.5 * Math.sin(t * 22 + (i % 2) * Math.PI);
      else if (spin) lv = 0.5 + 0.5 * Math.sin(t * 16 - i * 0.55);
      else lv = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2.2 - i * 0.28));
      if (su > 0.03) lv += (1 - lv) * su * (0.55 + 0.45 * Math.sin(t * (7 + 10 * su) - i * 0.4));   // l'éclairage monte avec le suspense
      if (sw >= 0) {   // départ : les lampes s'allument en chenillard autour de la roue
        var q = sw - i / n * 0.9;
        lv *= clamp(q * 7, 0, 1); if (q > 0 && q < 0.18) { lv = 1; pop = 1.3; }
      } else if (dk > 0) lv *= 1 - dk * 0.94;       // anticipation : les lampes s'éteignent
      var sz = R * 0.052 * pop;
      ctx.globalAlpha = 1; ctx.drawImage(lampOff, x - sz, y - sz, sz * 2, sz * 2);
      ctx.globalAlpha = clamp(lv, 0, 1); ctx.drawImage(lampOn, x - sz * 1.5, y - sz * 1.5, sz * 3, sz * 3);
    }
    ctx.globalAlpha = 1;
  }

  function drawFrame(R) {
    var cx = G.cx, cy = G.cy, n = M.N, i;
    // jante extérieure fixe : pierre d'obsidienne, double filet d'or biseauté (clair dehors / sombre dedans), graduations gravées
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.075, 0, TAU); ctx.arc(cx, cy, R * 0.99, 0, TAU, true);
    var g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    g.addColorStop(0, '#2b2114'); g.addColorStop(0.5, '#120d07'); g.addColorStop(1, '#0a0705');
    ctx.fillStyle = g; ctx.fill('evenodd');
    ctx.save(); ctx.clip('evenodd'); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.5; ctx.fillStyle = stoneGrain(ctx); ctx.fillRect(cx - R * 1.1, cy - R * 1.1, R * 2.2, R * 2.2); ctx.restore();
    ctx.lineWidth = R * 0.012;
    ctx.strokeStyle = A.goldGrad(ctx, cx - R, cy - R, cx + R, cy + R);
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.075, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.99, 0, TAU); ctx.stroke();
    ctx.lineWidth = Math.max(1, R * 0.004); ctx.strokeStyle = 'rgba(244,234,196,.55)'; ctx.beginPath(); ctx.arc(cx, cy, R * 1.0815, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.beginPath(); ctx.arc(cx, cy, R * 0.9835, 0, TAU); ctx.stroke();
    // graduations : un trait gravé entre chaque goujon
    ctx.beginPath();
    for (i = 0; i < n; i++) { var a = (i + 0.5) * step - Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a); ctx.moveTo(cx + ca * R * 1.005, cy + sa * R * 1.005); ctx.lineTo(cx + ca * R * 1.065, cy + sa * R * 1.065); }
    ctx.lineWidth = Math.max(1, R * 0.005); ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.stroke();
    ctx.translate(-0.7, -0.7); ctx.strokeStyle = 'rgba(207,169,76,.4)'; ctx.stroke(); ctx.translate(0.7, 0.7);
  }

  // Anubis Unchained (logo) au centre de la roue : jamais immobile — respire, balance la tête, yeux rouges qui pulsent et clignent,
  // chaînes qui tintent, éclats d'or de la chaîne brisée, reflet qui balaie l'anneau ; tout s'emballe pendant le tour.
  // tête d'Anubis du moyeu et des apparitions : deux sources possibles (chacune avec ses yeux et son cadrage)
  var HEADS = {
    medal: { eyes: [[-0.061, -0.066], [0.07, -0.066]], hubSize: 1.8, hubDy: 0, hubClip: 0.88, emSize: 1, emClip: 0.49, ew: 0.032, eh: 0.014 },
    logo:  { eyes: [[-0.072, -0.104], [0.073, -0.103]], hubSize: 3.3, hubDy: 0.03, hubClip: 0.9, emSize: 1.67, emClip: 0.45, ew: 0.04, eh: 0.018 }
  };
  var HEAD = HEADS.medal;      // passer à HEADS.logo quand une tête d'Anubis propre (oreilles entières, sans texte) est fournie
  function headImg() { return HEAD === HEADS.medal ? ART.medal : G.cutout('logo'); }
  var LOGO_EYES = HEAD.eyes;
  function drawHub(R) {
    var cx = G.cx, cy = G.cy, r = R * 0.285, t = G.t, spinN = W.mode === 'spin' ? 1 : 0, lg = headImg();
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowOffsetY = R * 0.016;   // ombre dure et courte, pas de flou
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.02, 0, TAU); ctx.fillStyle = '#050304'; ctx.fill(); ctx.shadowOffsetY = 0; ctx.shadowColor = 'transparent';
    if (!lg) { ctx.restore(); A.jackal(ctx, cx, cy - r * 0.2, r * 0.44, { glow: clamp(0.65 + 0.35 * Math.sin(t * 2.4), 0, 1) }); return; }
    if (G.eg) { ctx.restore(); return; }        // pendant l'apparition plein écran, le socle reste vide
    var size = r * HEAD.hubSize, br = 1 + 0.005 * Math.sin(t * 1.1) + spinN * 0.004 * Math.sin(t * 7), sway = 0.004 * Math.sin(t * 0.6) + spinN * 0.004 * Math.sin(t * 4);
    var jx = 0, jy = 0;
    // anneau du moyeu : or patiné à bandes, filet clair dehors, filet sombre dedans (aucune aura lumineuse)
    ctx.lineWidth = R * 0.022; ctx.strokeStyle = A.goldGrad(ctx, cx - r, cy - r, cx + r, cy + r); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
    ctx.lineWidth = Math.max(1, R * 0.004); ctx.strokeStyle = 'rgba(244,234,196,.6)'; ctx.beginPath(); ctx.arc(cx, cy, r + R * 0.0105, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(20,12,2,.85)'; ctx.beginPath(); ctx.arc(cx, cy, r - R * 0.0105, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * HEAD.hubClip, 0, TAU); ctx.clip();       // la tête est sertie dans le moyeu : plus de chaînes qui débordent sur la roue
    ctx.translate(cx + jx, cy + jy + r * 0.004 * Math.sin(t * 1.1)); ctx.rotate(sway); ctx.scale(br, br);
    // on ne garde que la tête d'Anubis (sans texte ni chaînes), recentrée dans l'anneau du moyeu
    ctx.translate(0, size * HEAD.hubDy);
    ctx.drawImage(lg, -size / 2, -size / 2, size, size);
    ctx.globalCompositeOperation = 'lighter';
    // yeux : le rouge du logo est masqué, braise turquoise discrète (le rouge est réservé au bonus Fureur d'Anubis)
    ctx.globalCompositeOperation = 'source-over';
    LOGO_EYES.forEach(function (pe, j) { ctx.save(); ctx.translate(pe[0] * size, pe[1] * size); ctx.rotate(j ? -0.25 : 0.25); ctx.fillStyle = 'rgba(8,10,12,.96)'; ctx.beginPath(); ctx.ellipse(0, 0, size * HEAD.ew * 1.3, size * HEAD.eh * 1.7, 0, 0, TAU); ctx.fill(); ctx.restore(); });
    ctx.globalCompositeOperation = 'lighter';
    var blink = (t % 7.5) > 7.38 ? 0.1 : 1, ei = (0.62 + 0.12 * Math.sin(t * 1.6 + spinN * 1.5) + spinN * 0.15) * blink;
    LOGO_EYES.forEach(function (pe, j) {
      var ex = pe[0] * size, ey = pe[1] * size, rr = size * (0.045 + 0.008 * ei), eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, rr);
      eg.addColorStop(0, 'rgba(120,255,235,' + ei + ')'); eg.addColorStop(1, 'rgba(60,220,200,0)'); ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ex, ey, rr, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(j ? -0.25 : 0.25); ctx.fillStyle = 'rgba(190,255,248,' + (0.75 * ei) + ')'; ctx.beginPath(); ctx.ellipse(0, 0, size * HEAD.ew * 0.8, size * HEAD.eh * 0.7, 0, 0, TAU); ctx.fill(); ctx.restore();
    });
    // reflet doré qui balaie le médaillon (clip circulaire)
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, size * 0.46, 0, TAU); ctx.clip();
    var sw0 = (t % 7) / 7, sx = -size * 0.7 + sw0 * size * 1.4, sg = ctx.createLinearGradient(sx - size * 0.12, -size * 0.5, sx + size * 0.12, size * 0.5);
    sg.addColorStop(0, 'rgba(255,230,150,0)'); sg.addColorStop(0.5, 'rgba(255,238,175,' + (0.1 + spinN * 0.03) + ')'); sg.addColorStop(1, 'rgba(255,230,150,0)'); ctx.fillStyle = sg; ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();
    // dôme de verre : reflet qui suit la lumière (même fini que l'ancien médaillon) ; coordonnées relatives au centre du moyeu
    ctx.globalCompositeOperation = 'source-over';
    var dl = ctx.createRadialGradient(-r * 0.35 - P.x * r * 0.12, -r * 0.45 - P.y * r * 0.1, 0, -r * 0.2, -r * 0.25, r * 1.1);
    dl.addColorStop(0, 'rgba(244,236,214,.14)'); dl.addColorStop(0.35, 'rgba(244,236,214,.03)'); dl.addColorStop(1, 'rgba(0,0,0,.34)'); ctx.fillStyle = dl; ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  }

  function drawPointer(R) {
    var cx = G.cx, py = G.cy - R * 1.085, s = R * 0.16;
    ctx.save(); ctx.translate(cx, py); ctx.rotate(W.ptr.a);
    ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 2.5;   // ombre dure courte
    if (G.icon(ctx, 'pointer', 0, s * 0.18, s * 2.7)) { ctx.restore(); return; }
    ctx.beginPath(); ctx.moveTo(-s * 0.62, -s * 0.5);
    ctx.quadraticCurveTo(0, -s * 0.9, s * 0.62, -s * 0.5);
    ctx.lineTo(s * 0.34, s * 0.45); ctx.lineTo(0, s * 1.42); ctx.lineTo(-s * 0.34, s * 0.45); ctx.closePath();
    ctx.fillStyle = A.goldGrad(ctx, -s, -s, s, s * 1.4); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.lineWidth = 1.4; ctx.strokeStyle = '#4b350b'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -s * 0.1, s * 0.2, 0, TAU);
    var rg = ctx.createRadialGradient(-s * 0.05, -s * 0.15, 0, 0, -s * 0.1, s * 0.22); rg.addColorStop(0, '#d9735a'); rg.addColorStop(1, '#74261a');
    ctx.fillStyle = rg; ctx.fill();
    ctx.restore();
  }

  // chiffre multiplié (ex. 2 -> 8) écrit dans la case : fondu simple si FX.reduced, sinon apparition dorée qui « claque »
  function wheelBoostLabel(i, am, o, R, RC) {
    var p = o.ap, lab = G.fmt(M.KINDS[o.kind].mult * o.boost), red = FX.reduced;
    var la = red ? p : clamp((p - 0.25) / 0.45, 0, 1), k = red ? 1 : 1 + 0.5 * Math.sin(Math.PI * clamp((p - 0.25) / 0.75, 0, 1));
    if (la <= 0) return;
    var fs = R * 0.15 * G.NUM_K, chord = RC * step * 0.86, along = lab.length >= 3, wdt;   // 3 caractères ou plus : écrit le long du rayon (plus de place)
    ctx.save(); ctx.rotate(am);
    if (along) { fs = R * 0.12 * G.NUM_K; ctx.translate(RC + R * 0.04, 0); } else { ctx.rotate(Math.PI / 2); ctx.translate(0, -RC); }
    ctx.scale(k, k);
    ctx.font = '700 ' + fs + 'px ' + G.NUM;
    wdt = ctx.measureText(lab).width;
    var lim = along ? Math.min(R * 0.27 / wdt, chord * 0.8 / (fs * 0.72)) : chord / wdt;
    if (lim < 1) { fs *= lim; ctx.font = '700 ' + fs + 'px ' + G.NUM; }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = la;
    var gg = ctx.createLinearGradient(0, -fs * 0.5, 0, fs * 0.5); gg.addColorStop(0, '#f4ecd6'); gg.addColorStop(0.5, '#d9b857'); gg.addColorStop(1, '#b8923a');
    if (!red) { ctx.shadowColor = 'rgba(217,184,87,' + (0.95 - 0.35 * p) + ')'; ctx.shadowBlur = 0; }
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, fs * 0.14); ctx.strokeStyle = '#3a2000'; ctx.strokeText(lab, 0, 0);
    ctx.fillStyle = gg; ctx.fillText(lab, 0, 0);
    ctx.restore();
  }

  W.draw = function (alpha) {
    var R = G.R, cx = G.cx, cy = G.cy, su = W.susp;
    ctx.save();
    if (su > 0.03) {   // suspense : le décor s'assombrit autour de la roue (projecteur) et la caméra avance très légèrement
      var sk = cx + '|' + cy + '|' + R + '|' + G.w + '|' + G.h;
      if (!W.spot || W.spot.k !== sk) {
        var rr = Math.hypot(G.w, G.h) * 0.62, sg0 = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, rr);
        sg0.addColorStop(0, 'rgba(0,0,0,0)'); sg0.addColorStop(0.28, 'rgba(0,0,0,.35)'); sg0.addColorStop(1, 'rgba(0,0,0,.92)');
        W.spot = { k: sk, g: sg0 };
      }
      ctx.globalAlpha = Math.min(1, su * 0.85); ctx.fillStyle = W.spot.g; ctx.fillRect(0, 0, G.w, G.h); ctx.globalAlpha = 1;
      var zm = 1 + (FX.reduced ? 0 : 0.035 * su * su); ctx.translate(cx, cy); ctx.scale(zm, zm); ctx.translate(-cx, -cy);
    }
    if (alpha != null) ctx.globalAlpha = alpha;
    // ombre portée
    var sg = ctx.createRadialGradient(cx, cy + R * 0.05, R * 0.9, cx, cy + R * 0.05, R * 1.3);
    sg.addColorStop(0, 'rgba(0,0,0,.6)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg; ctx.fillRect(cx - R * 1.4, cy - R * 1.4, R * 2.8, R * 2.8);
    // épaisseur : contact au sol + tranche de la jante, décalées selon la caméra
    var wy = R * 0.055, wx = -P.x * R * 0.014;
    ctx.save(); ctx.translate(cx, cy + R * 1.12 + wy); ctx.scale(1, 0.13);
    var cs = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.15); cs.addColorStop(0, 'rgba(0,0,0,.65)'); cs.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cs; ctx.beginPath(); ctx.arc(0, 0, R * 1.15, 0, TAU); ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(cx + wx, cy + wy, R * 1.075, 0, TAU);
    var wall = ctx.createLinearGradient(0, cy - R, 0, cy + R * 1.14); wall.addColorStop(0, '#7a5612'); wall.addColorStop(0.55, '#3c2a08'); wall.addColorStop(1, '#0e0903');
    ctx.fillStyle = wall; ctx.fill(); ctx.lineWidth = Math.max(1, R * 0.008); ctx.strokeStyle = 'rgba(255,214,110,.35)'; ctx.stroke();
    drawFrame(R);
    // disque rotatif (avec flou de mouvement à haute vitesse)
    var half = R + 6, sp = Math.abs(W.vel);
    ctx.save(); ctx.translate(cx, cy);
    if (sp > 7 && !FX.reduced) {   // flou de mouvement : copies étalées derrière la roue, écart et nombre selon la vitesse (une seule copie en qualité basse)
      var ng = FX.lite ? 1 : sp > 16 ? 4 : 3, gap = Math.min(0.11, sp * 0.0048), sgn = Math.sign(W.vel || 1), blurA = Math.min(0.26, 0.08 + sp * 0.01);
      for (var gi = ng; gi >= 1; gi--) {
        ctx.save(); ctx.rotate(W.rot - sgn * gi * gap);
        ctx.globalAlpha = blurA * (1 - (gi - 1) / (ng + 1)); ctx.drawImage(W.face, -half, -half, half * 2, half * 2); ctx.restore();
      }
    }
    ctx.rotate(W.rot); ctx.drawImage(W.face, -half, -half, half * 2, half * 2);
    // surbrillances (Oracle / case atteinte), dans le repère de la roue
    var ri = R * 0.3, ro = R * 0.935, i;
    ctx.translate(0, 0);
    if (W.oracle) {
      var o = W.oracle, pulse = 0.5 + 0.5 * Math.sin(o.t * 6), pop = G.ease.outBack(clamp(o.t / 0.5, 0, 1));
      for (i = 0; i < M.N; i++) {
        if (M.LAYOUT[i] !== o.kind) continue;
        // case numérique boostée : l'ancien chiffre s'efface sous une plaque de la couleur de la case, le chiffre multiplié apparaît plus bas
        if (o.num && o.ap > 0) {
          var vz = VIS[o.kind], pa = FX.reduced ? o.ap : clamp(o.ap * 3, 0, 1), ins = R * 0.013;
          ctx.save(); wedge(ctx, i, ri + ins, ro - ins); ctx.clip();
          var pg = ctx.createRadialGradient(0, 0, ri, 0, 0, ro); pg.addColorStop(0, vz.c[1]); pg.addColorStop(0.55, A.mix(vz.c[1], vz.c[0], 0.5)); pg.addColorStop(1, vz.c[0]);
          ctx.globalAlpha = pa; ctx.fillStyle = pg; ctx.fillRect(-R, -R, R * 2, R * 2); ctx.restore();
        }
        wedge(ctx, i, ri, ro);
        ctx.fillStyle = 'rgba(255,236,150,' + (0.22 + pulse * 0.28) * Math.min(1, o.t * 2) + ')'; ctx.fill();
        ctx.lineWidth = R * 0.014; ctx.strokeStyle = 'rgba(239,223,168,' + (0.7 + pulse * 0.3) + ')'; ctx.stroke();
        // badge ×N sur la case
        var am = (i + 0.5) * step - Math.PI / 2;
        ctx.save(); ctx.rotate(am); ctx.translate(R * 0.455, 0); ctx.rotate(Math.PI / 2); ctx.scale(pop, pop);
        var br = R * 0.075;
        ctx.beginPath(); ctx.arc(0, 0, br, 0, TAU);
        var bg2 = ctx.createRadialGradient(-br * 0.3, -br * 0.3, 0, 0, 0, br); bg2.addColorStop(0, '#f4ecd6'); bg2.addColorStop(1, '#b8923a');
        ctx.fillStyle = bg2; ctx.shadowColor = 'rgba(217,184,87,.9)'; ctx.shadowBlur = 0; ctx.fill(); ctx.shadowBlur = 0;
        ctx.lineWidth = 1.5; ctx.strokeStyle = '#5b4311'; ctx.stroke();
        G.txt(o.revealed ? '×' + o.boost : '?', 0, br * 0.06, { size: br * 0.95, weight: 900, fill: '#3a2000' });   // bénédiction scellée : la valeur n'est révélée qu'à l'arrêt de la roue
        ctx.restore();
        if (o.num && o.ap > 0) wheelBoostLabel(i, am, o, R, (ri + ro) / 2);
      }
    }
    if (W.wrath && W.wrath.shade > 0.01) {   // Colère d'Anubis : poussière et nombres grisés et enchaînés, cases libérées (Ankh, bonus) cerclées d'or
      var wk = W.wrath, wsh = wk.shade, wp = FX.reduced ? 0.5 : 0.5 + 0.5 * Math.sin(G.t * 4), wfree = M.WRATH_KINDS;
      for (i = 0; i < M.N; i++) {
        if (wfree.indexOf(M.LAYOUT[i]) >= 0) {
          wedge(ctx, i, ri * 1.02, ro * 0.995); ctx.lineWidth = R * 0.012; ctx.strokeStyle = 'rgba(255,236,150,' + wsh * (0.35 + 0.3 * wp) + ')'; ctx.stroke();
          continue;
        }
        wedge(ctx, i, ri, ro); ctx.fillStyle = 'rgba(10,8,6,' + 0.7 * wsh + ')'; ctx.fill();
        if (!FX.lite && wsh > 0.5) {
          var wam = (i + 0.5) * step - Math.PI / 2;
          ctx.save(); ctx.globalAlpha = Math.min(1, (wsh - 0.5) * 2); ctx.rotate(wam); ctx.translate(R * 0.62, 0);
          FX.Chains.link(ctx, 0, 0, 0, Math.min(chordAt(R * 0.62) * 0.9, R * 0.12), i % 2 === 0); ctx.restore();
        }
      }
    }
    if (su > 0.04 && W.nearIdx >= 0) {   // case bonus qui s'approche : elle s'éclaire de plus en plus fort
      var hp2 = 0.5 + 0.5 * Math.sin(G.t * (5 + 9 * su));
      wedge(ctx, W.nearIdx, ri * 0.98, ro); ctx.fillStyle = 'rgba(255,244,200,' + (0.1 + 0.42 * su * hp2) + ')'; ctx.fill();
      ctx.lineWidth = R * 0.02 * (0.5 + su); ctx.strokeStyle = 'rgba(255,248,215,' + (0.45 + 0.55 * su) + ')';
      if (!FX.lite) { ctx.shadowColor = '#e3cb82'; ctx.shadowBlur = 0; } ctx.stroke(); ctx.shadowBlur = 0;
    }
    if (W.hl) {
      var h = W.hl, hp = 0.5 + 0.5 * Math.sin(h.t * 9);
      wedge(ctx, h.idx, ri * 0.98, ro * 1.0);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.18 + hp * 0.3) + ')'; ctx.fill();
      ctx.lineWidth = R * 0.02; ctx.strokeStyle = 'rgba(255,248,210,' + (0.75 + hp * 0.25) + ')'; ctx.shadowColor = '#e3cb82'; ctx.shadowBlur = 0; ctx.stroke(); ctx.shadowBlur = 0;
    }
    ctx.restore();
    drawLamps(R);
    // éclat : une source de lumière fixe (qui suit la caméra) ; la roue tourne sous elle
    var la = Math.atan2(-0.8 - P.y * 0.5, -0.55 - P.x * 0.6), lx = cx + Math.cos(la) * R * 0.85, ly = cy + Math.sin(la) * R * 0.85;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R * 0.99, 0, TAU); ctx.clip();
    var gl2 = ctx.createRadialGradient(lx, ly, 0, lx, ly, R * 1.35); gl2.addColorStop(0, 'rgba(239,223,168,.26)'); gl2.addColorStop(0.45, 'rgba(239,223,168,.05)'); gl2.addColorStop(1, 'rgba(0,0,0,.3)');
    ctx.fillStyle = gl2; ctx.fillRect(cx - R, cy - R, R * 2, R * 2); ctx.restore();
    ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = R * 0.016; ctx.shadowColor = '#f4ecd6'; ctx.shadowBlur = 0;
    var rs = ctx.createLinearGradient(cx + Math.cos(la - 0.6) * R, cy + Math.sin(la - 0.6) * R, cx + Math.cos(la + 0.6) * R, cy + Math.sin(la + 0.6) * R);
    rs.addColorStop(0, 'rgba(255,250,225,0)'); rs.addColorStop(0.5, 'rgba(255,250,225,.85)'); rs.addColorStop(1, 'rgba(255,250,225,0)');
    ctx.strokeStyle = rs; ctx.beginPath(); ctx.arc(cx, cy, R * 1.065, la - 0.6, la + 0.6); ctx.stroke(); ctx.restore();
    drawHub(R);
    drawPointer(R);
    ctx.restore();
  };

  /* ---- actions de la roue (promesses) ---- */
  W.showOracle = function (o) {
    var kd = M.KINDS[o.kind];
    W.oracle = { kind: o.kind, boost: o.boost, revealed: false, t: 0, ap: 0, num: !kd.bonus && !kd.respin && kd.mult > 0 && o.boost > 1 };
    Sfx.oracle(); FX.ring(G.cx, G.cy, '#eadb9f', G.R * 1.1, 0.9); FX.flash(0.25, '#eadb9f');
    return G.sleep(G.turbo ? 0.5 : 1.5);
  };
  W.clearOracle = function () { W.oracle = null; };
  // la roue est arrêtée : la valeur de la bénédiction (scellée avant le tour) se révèle, que la case soit atteinte ou non
  W.revealOracle = function () {
    var o = W.oracle; if (!o) return Promise.resolve();
    o.revealed = true; if (!FX.reduced) { Sfx.sparkle && Sfx.sparkle(); FX.ring(G.cx, G.cy, '#eadb9f', G.R * 1.0, 0.6); }
    return G.sleep(G.turbo ? 0.2 : 0.55);
  };
  // la roue s'est arrêtée sur la case boostée : son chiffre est réécrit avec la valeur déjà multipliée (durée : turbo plus court, FX.reduced : fondu)
  W.applyBoost = function () {
    var o = W.oracle; if (!o || !o.num) return Promise.resolve();
    if (!FX.reduced) { Sfx.sparkle && Sfx.sparkle(); FX.ring(G.cx, G.cy, '#eadb9f', G.R * 1.2, 0.8); }
    return G.tween(G.turbo ? 0.35 : FX.reduced ? 0.4 : 0.9, function (u) { o.ap = u; }, null).then(function () { o.ap = 1; });
  };
  W.clearHighlight = function () { W.hl = null; };

  /* ---- départ / arrêt de la roue : anticipation, accélération, approche (suspense), claquement, rebond ----
     Tout est visuel : indice d arrivée (spin.index) déjà tiré, rien ici ne touche aux maths. */
  // plan d'un tour. level 2 : la roue va s'arrêter sur un BONUS (approche au ralenti, silence, éclairage qui monte) ;
  // level 1 : faux espoir (un bonus juste passé ou juste avant la case d'arrivée, frôlé au ralenti)
  function planSpin(spin) {
    var N = M.N, idx = spin.index, pl = { level: 0, crawl: 0, ricochet: false, tens: 0, hush: false, active: false, behind: 0, ahead: 0 };
    function bon(j) { return !!M.KINDS[M.LAYOUT[mod(j, N)]].bonus; }
    if (bon(idx)) { pl.level = 2; pl.crawl = 4.6; }
    else {
      for (var k = 2; k >= 1; k--) { if (bon(idx + k)) pl.behind = k; if (bon(idx - k)) pl.ahead = k; }   // les cases passent sous le pointeur dans l'ordre d'index décroissant
      if (pl.behind || pl.ahead) { pl.level = 1; pl.crawl = pl.behind ? pl.behind + 1.6 : 2.6; pl.ricochet = pl.ahead === 1; }
    }
    return pl;
  }
  // profil de rotation : vitesse = loi de frottement de la distance restante (arrêt progressif), limitée en accélération au départ,
  // plafonnée près de l'arrivée quand le plan impose une approche lente. Renvoie la table des angles parcourus (pas fixe).
  function buildProfile(D, vs, cm, pl) {
    var dt = 1 / 120, a = 0.75, vmax = 22 * vs, acc = 90 * vs, pos = [0], x = 0, v = 0, r = D, n = 0, floorV = 0.9 * step * cm;
    while (r > 1e-4 && n < 6000) {
      var vl = Math.max(vmax * Math.pow(r / D, a), floorV), rc = r / step;
      if (pl.crawl && rc < pl.crawl) {
        var q = rc / pl.crawl, cv = pl.level === 2 ? (0.5 + 3.0 * q) * (rc < 1 ? 0.45 + 0.55 * rc : 1) : 0.8 + 2.6 * q;
        vl = Math.min(vl, cv * step * cm);
      }
      v = Math.min(vl, v + acc * dt); x = Math.min(D, x + v * dt); r = D - x; pos.push(x); n++;
    }
    pos.push(D);
    return { pos: pos, T: (pos.length - 1) * dt };
  }
  W.spinTo = function (spin) {
    var pl = planSpin(spin), red = FX.reduced, offF = 0.46 + Math.random() * 0.18, target = -(spin.index + offF) * step;
    var overF = pl.level === 2 ? 0.12 + Math.random() * 0.12 : (pl.ricochet || Math.random() < 0.22) ? offF + 0.08 + Math.random() * 0.1 : 0.05 + Math.random() * 0.15;   // dépassement (en cases) ; > offF : le pointeur franchit la cheville puis revient
    var over = overF * step, crosses = overF > offF;
    var turns = G.ultra ? 2 : G.turbo ? 3 : 4, vs = G.ultra ? 2.4 : G.turbo ? 1.6 : 1, cm = G.ultra ? 3 : G.turbo ? 1.8 : 1;
    W.hl = null; W.mode = 'spin'; W.spinning = true; W.plan = pl; W.phase = 'wind'; W.dark = 0; W.sweep = -1; W.beatT = 0;
    if (!red) Sfx.windup();
    var r0 = W.rot, rest = 0;
    // 1) anticipation : la roue recule contre le sens du tour, les lampes s'éteignent
    var wind = G.tween(red ? 0.2 : 0.55, function (u) { var e = G.ease.inOut(u); W.vel = 0; W.rot = r0 - (red ? 0.04 : 0.17) * e; W.dark = u; }, null);
    return wind.then(function () {
      // 2) lancement : chenillard de lampes, souffle, accélération progressive
      W.dark = 0; W.sweep = 0; W.phase = 'run'; Sfx.whoosh();
      if (!red) { FX.shake(2.5, 0.25); FX.ring(G.cx, G.cy, '#eadb9f', G.R * 1.15, 0.5); }
      var rot0 = W.rot, delta = mod(target + over - rot0, TAU) + turns * TAU, prof = buildProfile(delta, vs, cm, pl), pos = prof.pos, nP = pos.length - 1;
      rest = rot0 + delta - over;      // angle de repos final (congruent à target)
      var prev = rot0, prevT = G.t, lastSet = 0;
      return G.tween(prof.T, function (u) {
        var f = u * nP, i0 = Math.min(nP - 1, Math.floor(f)), x = pos[i0] + (pos[i0 + 1] - pos[i0]) * (f - i0);
        var nr = rot0 + x, dtf = Math.max(1 / 240, G.t - prevT);
        W.vel = (nr - prev) / dtf; prev = nr; prevT = G.t; W.rot = nr;
        if (pl.level) {   // suspense : monte quand la distance restante passe sous la longueur d'approche
          var rc = (delta - x) / step;
          pl.tens = rc < pl.crawl ? Math.pow(clamp(1 - rc / pl.crawl, 0, 1), 0.8) * (pl.level === 2 ? 1 : 0.6) : 0;
          if (pl.tens > 0 && !pl.active) { pl.active = true; Sfx.tensionStart(); }
          if (pl.active && G.t - lastSet > 0.1) { lastSet = G.t; Sfx.tensionSet(pl.tens); }
          if (pl.level === 2 && rc < 0.85 && !pl.hush) { pl.hush = true; Sfx.tensionSet(-1); }   // silence juste avant l'arrêt
        }
      }, null);
    }).then(function () {
      // 3) arrêt : la roue vient claquer contre le pointeur, puis rebondit (contre-mouvement amorti)
      W.phase = 'recoil'; W.vel = 0; pl.tens = 0;
      if (pl.active) Sfx.tensionStop();
      W.ptr.v -= 9; Sfx.clack(pl.level === 2 ? 1 : 0.8); W.flashLamps = 0.3;
      FX.spark(G.cx, G.cy - G.R * 1.06, 8, '#efdfa8', 200, 0.5);
      if (!red) FX.shake(pl.level === 2 ? 7 : 2.5, 0.3);
      return G.tween(red ? 0.25 : 0.75, function (u) { W.rot = rest + (red ? 0 : over * Math.exp(-7 * u) * Math.cos(11 * u)); }, null);
    }).then(function () {
      W.rot = mod(rest, TAU); W.vel = 0; W.mode = 'idle'; W.spinning = false; W.phase = ''; W.plan = null;
      W.ptr.v -= 3;
      var cell = M.LAYOUT[spin.index];
      W.hl = { idx: spin.index, t: 0 };
      if (pl.level === 2) { Sfx.tensionHit(); FX.flash(0.4, '#efdfa8'); FX.shake(10, 0.5); FX.ring(G.cx, G.cy - G.R * 0.6, '#efdfa8', G.R * 0.9, 0.8); W.flashLamps = 0.8; }
      else {
        Sfx.drum(0.3);
        if (pl.level === 1) Sfx.nearMiss();     // faux espoir : le bonus a été frôlé
        if (!M.KINDS[cell].bonus) FX.spark(G.cx, G.cy - G.R * 0.9, 14, '#eadb9f', 220, 0.7);
      }
      return G.sleep(0.25);
    });
  };


  /* ============ ANIMATION DE VICTOIRE PROPRE À CHAQUE CASE ============
     G.cellWin(sp) : joue l animation de la case atteinte, se résout à sa fin (temps de jeu = G.speed : Turbo / Ultra écourtent,
     jamais d'attente du joueur). FX.reduced : pas de secousse ni d'éclair, effets réduits à un fondu / un compteur. */
  var CA = null;
  var CA_DUR = { m0: 0.9, m025: 1.0, m05: 1.1, m1: 1.3, m2: 1.5, m3: 1.7, ankh: 1.7, scarab: 1.5, weigh: 1.8, vault: 1.7, hand: 1.9, secret: 1.9 };
  function cellPos() {
    var a = W.rot + (CA.idx + 0.5) * step - Math.PI / 2, rc = G.R * 0.6175;
    return { x: G.cx + Math.cos(a) * rc, y: G.cy + Math.sin(a) * rc, a: a };
  }
  function ico(name, x, y, size, fb) { if (!G.icon(ctx, name, x, y, size)) fb(); }
  G.cellWin = function (sp) {
    return new Promise(function (res) {
      var k = sp.secret ? 'secret' : sp.upgraded ? 'hand' : sp.kind;
      CA = { kind: k, idx: sp.index, t: 0, dur: CA_DUR[k] || 1, res: res, pay: sp.pay || 0, ev: {}, acc: 0 };
      if (G.wheel) G.wheel.flashLamps = Math.max(G.wheel.flashLamps, k === 'm0' ? 0 : 0.5);
    });
  };
  G.cellBusy = function () { return !!CA; };
  function coinsFor(pay) { return clamp(Math.round(6 + pay * 10), 6, 64); }
  function updateCell(sdt) {
    var c = CA; if (!c) return;
    var u = c.t / c.dur, p = cellPos(), k = c.kind, R = G.R, red = FX.reduced, ev = c.ev;
    c.t += sdt;
    function once(name, cond, fn) { if (cond && !ev[name]) { ev[name] = 1; fn(); } }
    if (k === 'm0') {
      once('s', true, function () { Sfx.dustFall(); FX.ash(p.x, p.y, 22, '#c9b185'); FX.dust(p.x, p.y, 12, '#b79c6b'); });
      if (u < 0.75) { c.acc += sdt * 40; while (c.acc >= 1) { c.acc--; FX.ash(p.x, p.y, 1, '#c9b185'); } }
    } else if (k === 'm025' || k === 'm05' || k === 'm1' || k === 'm2' || k === 'm3') {
      var big = k === 'm2' || k === 'm3', lvl = { m025: 0, m05: 1, m1: 2, m2: 3, m3: 4 }[k];
      once('s', true, function () {
        Sfx.chime(c.pay); FX.coins(p.x, p.y, coinsFor(c.pay), 760 + lvl * 90, 34); FX.spark(p.x, p.y, 10 + lvl * 6, '#d9b857', 300);
        FX.ring(p.x, p.y, '#eadb9f', R * (0.35 + 0.1 * lvl), 0.7); if (!red && lvl >= 2) FX.shake(2 + lvl, 0.3);
      });
      once('w', u > 0.4 && lvl >= 2, function () { W.flashLamps = 0.5 + 0.2 * lvl; FX.ring(p.x, p.y, lvl >= 3 ? '#6cd8c6' : '#d9b857', R * 0.7, 0.8); });
      once('r', u > 0.35 && big, function () { FX.rain(G.w, k === 'm3' ? 26 : 14); FX.coins(G.cx, G.cy - R * 0.2, k === 'm3' ? 30 : 16, 900, R * 0.8); });
      once('e', u > 0.72, function () { FX.spark(G.cx, G.cy - R * 0.55, 10 + lvl * 4, '#efdfa8', 260); });
    } else if (k === 'ankh') {
      once('s', true, function () { Sfx.divine(); FX.flash(0.25, '#efdfa8'); });
      once('b', u > 0.4, function () { Sfx.chainSlam(); FX.links(p.x, p.y, 16, 520); FX.ring(p.x, p.y, '#efdfa8', R * 0.9, 0.9); FX.flash(0.3, '#efdfa8'); if (!red) FX.shake(8, 0.4); FX.spark(p.x, p.y, 36, '#d9b857', 480); });
      if (u > 0.4 && u < 0.85) { c.acc += sdt * 26; while (c.acc >= 1) { c.acc--; FX.spark(p.x + (Math.random() - 0.5) * R * 0.2, p.y, 1, '#efdfa8', 120, 1.0); } }
    } else if (k === 'scarab') {
      once('s', true, function () { Sfx.scarabFly(); FX.ring(p.x, p.y, '#d9735a', R * 0.5, 0.6); });
      var e = G.ease.inOut(clamp((u - 0.1) / 0.7, 0, 1)), q = scarabPos(p, e);
      if (u > 0.1 && u < 0.82) { c.acc += sdt * 70; while (c.acc >= 1) { c.acc--; FX.spark(q.x + (Math.random() - 0.5) * 10, q.y + (Math.random() - 0.5) * 10, 1, Math.random() < 0.5 ? '#6cd8c6' : '#d9735a', 80, 0.5); } }
      once('a', u > 0.82, function () { FX.ring(G.cx, G.cy, '#6cd8c6', R * 1.1, 0.8); FX.flash(0.3, '#6cd8c6'); if (!red) FX.shake(8, 0.4); FX.spark(G.cx, G.cy, 30, '#d9b857', 400); });
    } else if (k === 'weigh') {
      once('s', u > 0.04, function () { Sfx.featherDrop(); });
      once('l', u > 0.55, function () { Sfx.featherLand(); FX.ring(p.x, p.y, '#f4ecd6', R * 0.8, 0.9); FX.ring(p.x, p.y, '#d9b857', R * 0.5, 0.7); FX.spark(p.x, p.y, 26, '#f4ecd6', 300); FX.flash(0.25, '#f4ecd6'); if (!red) FX.shake(5, 0.35); });
      if (u > 0.04 && u < 0.55) { c.acc += sdt * 24; while (c.acc >= 1) { c.acc--; var fp = featherPos(p, u); FX.spark(fp.x, fp.y, 1, '#f4ecd6', 40, 0.7); } }
    } else if (k === 'vault') {
      once('o', u > 0.28, function () { Sfx.pyramidOpen(); FX.coins(p.x, p.y, 44, 900, 30); FX.flash(0.35, '#d9b857'); FX.ring(p.x, p.y, '#d9b857', R * 0.9, 0.9); if (!red) FX.shake(7, 0.45); FX.spark(p.x, p.y, 30, '#eadb9f', 420); });
    } else if (k === 'hand') {
      once('s', u > 0.1, function () { Sfx.anubisBolt(); FX.flash(0.6, '#d9735a'); if (!red) FX.shake(15, 0.7); FX.ring(p.x, p.y, '#d9735a', R * 1.0, 0.9); FX.spark(p.x, p.y, 40, '#d9735a', 520); });
    } else if (k === 'secret') {
      once('s', true, function () { Sfx.runes(); FX.flash(0.25, '#a08cc8'); FX.ring(p.x, p.y, '#a08cc8', R * 0.7, 0.9); });
      once('b', u > 0.5, function () { FX.flash(0.4, '#a08cc8'); if (!red) FX.shake(8, 0.4); FX.spark(p.x, p.y, 30, '#a08cc8', 400); });
      if (u > 0.2 && u < 0.85) { c.acc += sdt * 30; while (c.acc >= 1) { c.acc--; FX.spark(p.x + (Math.random() - 0.5) * R * 0.2, p.y, 1, '#a08cc8', 100, 1.0); } }
    }
    if (c.t >= c.dur) { var r = c.res; CA = null; r(); }
  }
  function scarabPos(p, e) {   // courbe de Bézier de la case vers le centre, avec un arc de côté
    var mx = (p.x + G.cx) / 2 + (G.cx > p.x ? -1 : 1) * G.R * 0.35, my = (p.y + G.cy) / 2 - G.R * 0.1, a = 1 - e;
    return { x: a * a * p.x + 2 * a * e * mx + e * e * G.cx, y: a * a * p.y + 2 * a * e * my + e * e * G.cy };
  }
  function featherPos(p, u) {   // la plume tombe de haut en balançant, se pose sur la case
    var e = G.ease.out3(clamp((u - 0.04) / 0.51, 0, 1)), sw = Math.sin(u * 15) * G.R * 0.2 * (1 - e);
    return { x: p.x + sw, y: -G.R * 0.1 + (p.y + G.R * 0.1) * e, rot: Math.sin(u * 15 + 1) * 0.6 * (1 - e) };
  }
  function drawCell() {
    var c = CA; if (!c) return;
    var u = clamp(c.t / c.dur, 0, 1), p = cellPos(), k = c.kind, R = G.R, ri = R * 0.3, ro = R * 0.935, red = FX.reduced, i;
    ctx.save();
    // lueur de la case
    if (k !== 'm0') {
      ctx.save(); ctx.translate(G.cx, G.cy); ctx.rotate(W.rot); wedge(ctx, c.idx, ri, ro);
      ctx.fillStyle = 'rgba(239,223,168,' + (0.45 * Math.sin(Math.PI * clamp(u * 1.4, 0, 1))) + ')'; ctx.fill(); ctx.restore();
    }
    if (k === 'm0') {   // la case s'assombrit, des fissures la parcourent
      ctx.save(); ctx.translate(G.cx, G.cy); ctx.rotate(W.rot); wedge(ctx, c.idx, ri, ro); ctx.fillStyle = 'rgba(225,205,160,' + (0.42 * Math.max(0, 1 - u * 3.2)) + ')'; ctx.fill(); wedge(ctx, c.idx, ri, ro); ctx.fillStyle = 'rgba(8,5,2,' + (0.62 * Math.sin(Math.PI * clamp(u * 1.1, 0, 1))) + ')'; ctx.fill();
      ctx.rotate((c.idx + 0.5) * step - Math.PI / 2); ctx.strokeStyle = 'rgba(240,222,170,' + (0.95 * (1 - u * 0.8)) + ')'; ctx.lineWidth = Math.max(1.5, R * 0.013); ctx.lineCap = 'round';
      var cr = [[-0.14, 0.0], [-0.07, 0.02], [-0.02, -0.025], [0.04, 0.018], [0.09, -0.012], [0.15, 0.01]], nc = Math.ceil(cr.length * clamp(u * 3, 0, 1));
      ctx.beginPath(); for (i = 0; i < nc; i++) { var mx = R * (0.6175 + cr[i][0]), my = R * cr[i][1]; if (i) ctx.lineTo(mx, my); else ctx.moveTo(mx, my); } ctx.stroke(); ctx.restore();
    } else if (k === 'ankh') {
      var lw = R * 0.5 * Math.sin(Math.PI * clamp(u * 1.15, 0, 1)), bg = ctx.createLinearGradient(p.x - lw, 0, p.x + lw, 0);   // colonne de lumière divine
      bg.addColorStop(0, 'rgba(239,223,168,0)'); bg.addColorStop(0.5, 'rgba(255,248,220,.8)'); bg.addColorStop(1, 'rgba(239,223,168,0)');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = bg; ctx.fillRect(p.x - lw, 0, lw * 2, FX.floorY < 9000 ? FX.floorY : G.h); ctx.restore();
      var rr = R * (0.21 + 0.02 * Math.sin(u * 20)), nl = FX.lite ? 8 : 12;
      if (u < 0.4) for (i = 0; i < nl; i++) { var an = TAU * i / nl + u * 4; FX.Chains.link(ctx, p.x + Math.cos(an) * rr, p.y + Math.sin(an) * rr, an + Math.PI / 2, R * 0.11, i % 2 === 0); }
      var ap = G.ease.outBack(clamp(u / 0.35, 0, 1)), as = R * 0.34 * ap * (1 + 0.04 * Math.sin(u * 30));
      ctx.save(); ctx.globalAlpha = 1 - clamp((u - 0.8) / 0.2, 0, 1); ctx.shadowColor = 'rgba(255,230,150,.95)'; ctx.shadowBlur = 0;
      A.ankh(ctx, p.x, p.y - R * 0.02, as, '#efdfa8', '#8a5e12'); ctx.restore();
    } else if (k === 'scarab') {
      var e = G.ease.inOut(clamp((u - 0.1) / 0.7, 0, 1)), q = scarabPos(p, e), sz = R * (0.17 + 0.33 * e), fade = 1 - clamp((u - 0.88) / 0.12, 0, 1);
      for (i = 3; i >= 0; i--) {   // traîne : copies de plus en plus pâles le long de la courbe
        var qq = scarabPos(p, Math.max(0, e - i * 0.05)); ctx.globalAlpha = (i ? 0.22 / i : 1) * fade;
        ctx.save(); ctx.translate(qq.x, qq.y); ctx.rotate(Math.sin(c.t * 22 + i) * 0.18); ico('scarab', 0, 0, sz * (1 - i * 0.06), function () { A.scarab(ctx, 0, 0, sz * 0.8, '#d9b857', 'rgba(0,0,0,.5)'); }); ctx.restore();
      }
    } else if (k === 'weigh') {
      var fp = featherPos(p, u), lit = u > 0.55 ? 1 : 0, glow = lit ? Math.sin(Math.PI * clamp((u - 0.55) / 0.45, 0, 1)) : 0, fs = R * (0.36 + 0.12 * glow);
      if (lit) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; var rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R * 0.5); rg.addColorStop(0, 'rgba(255,248,225,' + 0.7 * glow + ')'); rg.addColorStop(1, 'rgba(255,248,225,0)'); ctx.fillStyle = rg; ctx.fillRect(p.x - R * 0.5, p.y - R * 0.5, R, R); ctx.restore(); }
      ctx.save(); ctx.globalAlpha = 1 - clamp((u - 0.88) / 0.12, 0, 1); ctx.translate(fp.x, fp.y); ctx.rotate(fp.rot);
      ico('weigh', 0, 0, fs, function () { A.feather(ctx, 0, 0, fs * 0.9, '#4a3410', 'rgba(255,255,255,.7)'); }); ctx.restore();
    } else if (k === 'vault') {
      var sp2 = G.ease.outBack(clamp((u - 0.28) / 0.4, 0, 1)), ps = R * (0.3 + 0.1 * clamp(u / 0.28, 0, 1)), fa = 1 - clamp((u - 0.8) / 0.2, 0, 1);
      if (u > 0.28) {   // rayons d'or par la fente de la pyramide
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; A.rays(ctx, p.x, p.y, R * 0.9, 12, u * 2, '#d9b857', 0.3 * Math.sin(Math.PI * clamp((u - 0.28) / 0.72, 0, 1)));
        var vg = ctx.createLinearGradient(p.x - R * 0.06 * sp2, 0, p.x + R * 0.06 * sp2, 0); vg.addColorStop(0, 'rgba(255,225,130,0)'); vg.addColorStop(0.5, 'rgba(255,240,170,.9)'); vg.addColorStop(1, 'rgba(255,225,130,0)');
        ctx.fillStyle = vg; ctx.fillRect(p.x - R * 0.12, p.y - R * 0.5, R * 0.24, R * 1.0); ctx.restore();
      }
      [-1, 1].forEach(function (sg) {   // deux moitiés qui s'écartent
        ctx.save(); ctx.globalAlpha = fa; ctx.beginPath(); ctx.rect(sg < 0 ? p.x - ps : p.x, p.y - ps, ps, ps * 2); ctx.clip();
        ctx.translate(p.x + sg * R * 0.1 * sp2, p.y + R * 0.03 * sp2); ctx.rotate(sg * 0.16 * sp2);
        ico('vault', 0, 0, ps, function () { A.pyramid(ctx, 0, 0, ps * 0.85, '#eadb9f', 'rgba(0,0,0,.45)'); }); ctx.restore();
      });
    } else if (k === 'hand') {
      var big2 = ART.medal, hp = G.ease.outBack(clamp((u - 0.2) / 0.35, 0, 1)), hsz = R * 0.95 * hp, hfa = 1 - clamp((u - 0.82) / 0.18, 0, 1);
      if (u > 0.08 && u < 0.7) {   // éclairs rouges sur la case, un nouveau tracé ~15 fois par seconde
        var sd = Math.floor(c.t * 15) * 97 + 13;
        FX.bolt(ctx, p.x - R * 0.35, -10, p.x, p.y, '#d9735a', R * 0.05, sd); FX.bolt(ctx, p.x + R * 0.4, -10, p.x, p.y, '#d9735a', R * 0.035, sd + 5);
      }
      if (big2 && hsz > 2) {
        var HE = HEADS.medal;
        ctx.save(); ctx.globalAlpha = hfa; ctx.translate(p.x, p.y + R * 0.05); if (!FX.lite) { ctx.shadowColor = 'rgba(171,63,46,.85)'; ctx.shadowBlur = 0; }
        ctx.beginPath(); ctx.arc(0, 0, hsz * 0.43, 0, TAU); ctx.fillStyle = '#050102'; ctx.fill(); ctx.shadowBlur = 0;
        ctx.save(); ctx.beginPath(); ctx.arc(0, 0, hsz * HE.emClip, 0, TAU); ctx.clip(); ctx.drawImage(big2, -hsz / 2, -hsz / 2, hsz, hsz);
        ctx.globalCompositeOperation = 'lighter'; var ep = clamp((u - 0.35) / 0.2, 0, 1) * (0.75 + 0.25 * Math.sin(c.t * 22));
        HE.eyes.forEach(function (pe) { var ex = pe[0] * hsz, ey = pe[1] * hsz, er = hsz * 0.1 * ep, g2 = ctx.createRadialGradient(ex, ey, 0, ex, ey, Math.max(1, er)); g2.addColorStop(0, 'rgba(255,230,200,' + ep + ')'); g2.addColorStop(0.3, 'rgba(255,60,30,' + 0.8 * ep + ')'); g2.addColorStop(1, 'rgba(171,63,46,0)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(ex, ey, Math.max(1, er), 0, TAU); ctx.fill(); });
        ctx.restore(); ctx.restore();
      }
    } else if (k === 'secret') {
      var rs = R * (0.12 + 0.3 * G.ease.out3(clamp(u / 0.6, 0, 1))), na = 1 - clamp((u - 0.8) / 0.2, 0, 1);
      ctx.save(); ctx.globalAlpha = na; ctx.shadowColor = '#a08cc8'; ctx.shadowBlur = 0;
      for (i = 0; i < 8; i++) {   // couronne de runes
        var ra = TAU * i / 8 + u * 3; ctx.save(); ctx.translate(p.x + Math.cos(ra) * rs, p.y + Math.sin(ra) * rs); ctx.rotate(ra + Math.PI / 4); ctx.fillStyle = i % 2 ? '#a08cc8' : '#d9b857'; ctx.fillRect(-R * 0.018, -R * 0.018, R * 0.036, R * 0.036); ctx.restore();
      }
      ctx.shadowBlur = 0;
      if (u > 0.15 && u < 0.7) FX.bolt(ctx, p.x - R * 0.3, p.y - R * 0.5, p.x + R * 0.05, p.y, '#a08cc8', R * 0.04, Math.floor(c.t * 14) * 53 + 3);
      var am = G.ease.out3(clamp((u - 0.1) / 0.5, 0, 1)); ctx.globalAlpha = na * am;
      ico('amulet', p.x, p.y - R * 0.15 * am, R * 0.3, function () { ctx.fillStyle = '#a08cc8'; ctx.beginPath(); ctx.arc(p.x, p.y, R * 0.06, 0, TAU); ctx.fill(); });
      ctx.restore();
    }
    // compteur de gain qui défile (cases numériques)
    if (c.pay > 0 && (k === 'm025' || k === 'm05' || k === 'm1' || k === 'm2' || k === 'm3')) {
      var cu = clamp(u / 0.65, 0, 1), val = c.pay * (1 - Math.pow(1 - cu, 3)), txt = '×' + G.fmt(cu >= 1 ? c.pay : (c.pay % 1 === 0 || c.pay >= 10 ? Math.round(val) : Math.round(val * 10) / 10));
      var pop = cu >= 1 ? 1 + 0.3 * Math.exp(-(u - 0.65) * 14) * Math.cos((u - 0.65) * 40) : 1, ca = u < 0.85 ? 1 : 1 - (u - 0.85) / 0.15, cs = Math.min(R * 0.26, G.w * 0.16);
      ctx.save(); ctx.globalAlpha = ca; ctx.translate(G.cx, G.cy - R * 0.5 - u * R * 0.06); ctx.scale(pop, pop); G.goldText(txt, 0, 0, cs, { blur: 22 }); ctx.restore();
    }
    ctx.restore();
  }

  /* ============ TRANSITIONS DE BONUS : chaînes d'Unchained ============
     G.chainBreak(swap) : entrée. Les chaînes dorées se tendent, se brisent en éclats dans un flash de lumière divine ; swap() est appelé
     sous le flash (le décor du bonus se révèle). G.chainForge(swap) : sortie. Les maillons se rassemblent, les portes d'obsidienne se referment,
     swap() sous les portes, puis le rideau se rouvre sur la roue. FX.reduced : simple fondu doré, sans chaînes ni secousse. */
  G.chainBreak = function (swap) {
    var red = FX.reduced, D = red ? 0.7 : 1.9, st = G.chain = { r: red ? 0 : 0, tense: 0, brk: -1, t: G.t, veil: 0, doors: 0, flash: 0, light: 0, lite: FX.lite }, d = {};
    return G.tween(D, function (u) {
      st.t = G.t;
      if (red) { st.flash = (u < 0.45 ? u / 0.45 : 1 - (u - 0.45) / 0.55) * 0.9; if (u >= 0.45 && !d.sw) { d.sw = 1; swap(); } return; }
      var q = clamp(u / 0.26, 0, 1);
      if (u < 0.5) {
        st.r = G.ease.out3(q); st.veil = 0.62 * q;
        if (u >= 0.26) { st.tense = (u - 0.26) / 0.24; st.light = st.tense * 0.35; FX.shake(1 + 3 * st.tense, 0.08); }
        if (u >= 0.26 && !d.slam) { d.slam = 1; Sfx.chainSlam(); FX.shake(10, 0.4); FX.spark(G.cx, G.cy, 18, '#d9b857', 320); FX.ring(G.cx, G.cy, '#d9b857', G.R * 0.8, 0.5); Sfx.chainTense(D * 0.24 / Math.max(1, G.speed)); }
      } else {
        if (!d.brk) { d.brk = 1; Sfx.chainBreak(); FX.shake(22, 0.7); FX.ring(G.cx, G.cy, '#efdfa8', Math.max(G.w, G.h) * 0.7, 1.0); FX.spark(G.cx, G.cy, 60, '#d9b857', 700); FX.links(G.cx, G.cy, 20, 760); }
        st.r = 1; st.tense = 1; st.brk = (u - 0.5) * D;
        st.flash = u < 0.57 ? 1 : Math.max(0, 1 - (u - 0.57) / 0.22); st.light = Math.max(0, 1 - (u - 0.5) / 0.42);
        st.veil = u < 0.545 ? 0.62 : 0;
        if (u >= 0.53 && !d.sw) { d.sw = 1; swap(); }
      }
    }, null).then(function () { if (!d.sw) swap(); G.chain = null; });
  };
  G.chainForge = function (swap) {
    var red = FX.reduced, D = red ? 0.7 : 1.5, st = G.chain = { r: 1, tense: 0.6, brk: 1.15, t: G.t, veil: 0, doors: 0, flash: 0, light: 0, lite: FX.lite, a: 0 }, d = {};
    if (red) { st.r = 0; st.brk = -1; }
    return G.tween(D, function (u) {
      st.t = G.t;
      if (red) { st.veil = u < 0.5 ? u / 0.5 : 1 - (u - 0.5) / 0.5; if (u >= 0.5 && !d.sw) { d.sw = 1; swap(); } return; }
      if (!d.s) { d.s = 1; Sfx.chainForge(); }
      if (u < 0.42) {
        var q = u / 0.42; st.brk = 1.15 * (1 - G.ease.inOut(q)); st.r = 1; st.veil = 0.85 * q; st.doors = G.ease.out3(clamp((u - 0.16) / 0.26, 0, 1)); st.tense = 0.6;
        if (st.brk < 0.01) st.brk = -1;   // les maillons sont rassemblés : chaîne intacte et tendue
      } else {
        st.brk = -1;
        if (!d.lock) { d.lock = 1; FX.shake(12, 0.45); FX.spark(G.cx, G.cy, 24, '#d9b857', 380); FX.ring(G.cx, G.cy, '#d9b857', G.R * 0.9, 0.6); st.flash = 0.55; }
        st.flash = Math.max(0, st.flash - 0.05); st.tense = Math.max(0, st.tense - 0.03);
        st.doors = 1; if (u >= 0.47 && !d.sw) { d.sw = 1; swap(); }
        if (u > 0.58) { var o = G.ease.inOut(clamp((u - 0.58) / 0.42, 0, 1)); st.r = 1 - o; st.doors = 1 - o; st.veil = 0.85 * (1 - o); }
      }
    }, null).then(function () { if (!d.sw) swap(); G.chain = null; });
  };

  /* ======== ANUBIS SURGIT DU CENTRE DE LA ROUE : une apparition différente par bonus, liée à son thème ======== */
  // eye : couleur des yeux ; glow : lueur ; dark : voile ; full : plein écran ou plus modeste
  var EMERGE = {
    hand:   { eye: [255, 60, 30],   glow: '255,40,20',  dark: '8,0,0',   full: true },
    scarab: { eye: [70, 255, 190],  glow: '40,230,170', dark: '0,10,8',  full: false },
    weigh:  { eye: [255, 246, 220], glow: '255,240,200', dark: '6,5,2',  full: false },
    vault:  { eye: [255, 196, 70],  glow: '255,190,60', dark: '9,5,0',   full: false },
    crypt:  { eye: [165, 120, 255], glow: '150,110,255', dark: '4,0,12', full: true }
  };
  G.emerge = function (kind, fast) {
    return new Promise(function (res) {
      if (!headImg() || FX.reduced) { res(); return; }
      var st = EMERGE[kind] || EMERGE.hand;
      G.eg = { t: 0, dur: fast ? 1.5 : 2.7, res: res, st: st, kind: kind, parts: [], spawned: 0, step: 0, fast: !!fast };
      if (Sfx.emerge) Sfx.emerge(kind);
      FX.shake(6, 0.6);
    });
  };
  function spr(name, x, y, size, rot, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot || 0);
    if (!G.icon(ctx, name, 0, 0, size)) { ctx.fillStyle = '#d9b857'; ctx.beginPath(); ctx.arc(0, 0, size * 0.2, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  function updateEmerge(sdt) {
    var e = G.eg; if (!e) return;
    e.t += sdt; var u = e.t / e.dur, k = e.kind, i;
    // particules propres au thème, projetées depuis le centre (ou le haut/bas)
    if (k === 'scarab' && u > 0.22 && u < 0.72) { var n = Math.floor((u - 0.22) / 0.5 * 36); while (e.spawned < n) { e.spawned++; var a = Math.random() * TAU, v = 260 + Math.random() * 520; e.parts.push({ x: G.cx, y: G.cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.8 - 80, s: 26 + Math.random() * 30, r: a + Math.PI / 2, l: 0 }); } }
    if (k === 'weigh' && u > 0.2 && u < 0.7) { n = Math.floor((u - 0.2) / 0.5 * 18); while (e.spawned < n) { e.spawned++; e.parts.push({ x: G.w * (0.2 + 0.6 * Math.random()), y: -40, vx: (Math.random() - 0.5) * 60, vy: 90 + Math.random() * 120, s: 22 + Math.random() * 26, r: Math.random() * 6, l: 0, sw: Math.random() * 6 }); } }
    if (k === 'crypt' && u > 0.2 && u < 0.75) { n = Math.floor((u - 0.2) / 0.55 * 16); while (e.spawned < n) { e.spawned++; e.parts.push({ x: G.w * (0.1 + 0.8 * Math.random()), y: G.h + 30, vx: (Math.random() - 0.5) * 80, vy: -(140 + Math.random() * 220), s: 30 + Math.random() * 40, r: (Math.random() - 0.5) * 0.6, l: 0 }); } }
    for (i = e.parts.length - 1; i >= 0; i--) { var q = e.parts[i]; q.l += sdt; q.x += q.vx * sdt; q.y += q.vy * sdt; if (k === 'weigh') q.x += Math.sin(q.l * 3 + q.sw) * 40 * sdt; if (q.l > 2.2 || q.y < -80 || q.y > G.h + 80) e.parts.splice(i, 1); }
    if (k === 'vault' && u > 0.48 && !e.step) { e.step = 1; FX.coins(G.cx, G.h * 0.5, 46, 1000, 160); FX.flash(0.4, '#d9b857'); FX.shake(12, 0.6); }
    if (k === 'weigh' && !e.beat1 && u > 0.55) { e.beat1 = 1; FX.ring(G.cx, G.h * 0.55, '#f4ecd6', G.R * 0.9, 0.8); FX.shake(8, 0.4); }
    if (k === 'scarab' && !e.step && u > 0.3) { e.step = 1; FX.shake(10, 0.8); FX.dust && FX.dust(G.cx, G.cy + G.R * 0.4, 16, '#d9b857'); }
    if (k === 'crypt' && !e.step && u > 0.3) { e.step = 1; FX.shake(10, 0.9); FX.flash(0.3, '#a08cc8'); }
    if (k === 'hand' && u > 0.3 && !e.step) { e.step = 1; FX.shake(14, 1.0); }
    if (u > 0.72 && !e.flashed) {
      e.flashed = true; var fc = { hand: '#d9735a', scarab: '#6cd8c6', weigh: '#f4ecd6', vault: '#d9b857', crypt: '#a08cc8' }[k] || '#fff';
      FX.flash(0.7, fc); FX.shake(k === 'hand' || k === 'crypt' ? 22 : 14, 0.7); if (k === 'hand') { FX.spark(G.cx, G.cy, 110, '#d9b857', 700); FX.spark(G.cx, G.cy, 50, '#d9735a', 520); } FX.ring(G.cx, G.cy, fc, G.R * 1.4, 0.9); if (Sfx.thud) Sfx.thud();
    }
    if (e.t >= e.dur) { var r = e.res; G.eg = null; r(); }
  }
  function drawEmerge() {
    var e = G.eg; if (!e || !headImg()) return; var logo = headImg();
    var st = e.st, k = e.kind, u = clamp(e.t / e.dur, 0, 1), W_ = G.w, H_ = G.h, cx = G.cx, cy = G.cy, i;
    var grow = G.ease.inOut(clamp((u - 0.08) / 0.62, 0, 1)), s0 = G.R * 0.36, s1 = st.full ? Math.min(W_ * 1.15, H_ * 1.05) : Math.min(W_ * 0.82, H_ * 0.82);
    var size = s0 + (s1 - s0) * grow, py = cy + (H_ * 0.5 - cy) * grow, fadeOut = clamp((u - 0.86) / 0.14, 0, 1);
    var dark = clamp(u / 0.3, 0, 1) * 0.72 * (1 - fadeOut), jit = (u > 0.25 && (k === 'hand' || k === 'crypt') ? (Math.random() - 0.5) * (2 + 8 * grow) : 0);
    var ec = st.eye, ers = ec[0] + ',' + ec[1] + ',' + ec[2];
    // 1) voile + lueur de la couleur du thème
    ctx.save(); ctx.fillStyle = 'rgba(' + st.dark + ',' + dark + ')'; ctx.fillRect(0, 0, W_, H_);
    var rg = ctx.createRadialGradient(cx, py, size * 0.05, cx, py, Math.max(W_, H_) * 0.7);
    rg.addColorStop(0, 'rgba(' + st.glow + ',' + (0.5 * grow * (1 - fadeOut)) + ')'); rg.addColorStop(1, 'rgba(' + st.glow + ',0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W_, H_); ctx.restore();
    // colonne de lumière céleste (pesée) / flammes froides (crypte)
    if (k === 'weigh') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; var bw = size * 0.7 * grow, bg = ctx.createLinearGradient(0, 0, 0, H_); bg.addColorStop(0, 'rgba(255,248,225,' + 0.45 * grow * (1 - fadeOut) + ')'); bg.addColorStop(1, 'rgba(255,248,225,0)'); ctx.fillStyle = bg; ctx.fillRect(cx - bw / 2, 0, bw, H_); ctx.restore(); }
    if (k === 'crypt') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (i = 0; i < 9; i++) { var fx = W_ * (i + 0.5) / 9, fh = H_ * (0.25 + 0.15 * Math.sin(e.t * 3 + i * 1.7)) * grow, fg = ctx.createLinearGradient(0, H_, 0, H_ - fh); fg.addColorStop(0, 'rgba(120,90,255,' + 0.5 * (1 - fadeOut) + ')'); fg.addColorStop(1, 'rgba(120,90,255,0)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(fx, H_, W_ / 14, fh, 0, 0, TAU); ctx.fill(); } ctx.restore(); }
    // 2) médaillon (coupé en deux pour le coffre)
    var split = k === 'vault' ? clamp((u - 0.45) / 0.3, 0, 1) : 0;
    if (split > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; var gl = ctx.createLinearGradient(cx - size * 0.12, 0, cx + size * 0.12, 0); gl.addColorStop(0, 'rgba(255,210,90,0)'); gl.addColorStop(0.5, 'rgba(255,225,130,' + 0.95 * (1 - fadeOut) + ')'); gl.addColorStop(1, 'rgba(255,210,90,0)'); ctx.fillStyle = gl; ctx.fillRect(cx - size * 0.35, 0, size * 0.7, H_); ctx.restore(); }
    function medalHalf(sgn) {
      var kx = k === 'scarab' ? Math.sin(e.t * 38) * size * 0.006 * grow : 0, ky = k === 'weigh' ? Math.sin(e.t * 2.2) * size * 0.015 * grow : 0;
      ctx.save(); ctx.globalAlpha = 1 - fadeOut; ctx.translate(cx + jit + kx + (sgn || 0) * split * size * 0.22, py + jit * 0.6 + ky); ctx.rotate(Math.sin(e.t * 9) * 0.006 * grow + (k === 'crypt' ? Math.sin(e.t * 25) * 0.004 : 0));
      ctx.shadowColor = 'rgba(' + st.glow + ',.85)'; ctx.shadowBlur = 0;
      if (sgn) { ctx.beginPath(); ctx.rect(sgn < 0 ? -size : 0, -size, size, size * 2); ctx.clip(); }
      ctx.beginPath(); ctx.arc(0, 0, size * 0.43, 0, TAU); ctx.fillStyle = '#050102'; ctx.fill(); ctx.shadowBlur = 0;
      ctx.save(); var isz = size * HEAD.emSize; ctx.beginPath(); ctx.arc(0, 0, size * HEAD.emClip, 0, TAU); ctx.clip(); ctx.translate(0, isz * HEAD.hubDy); ctx.drawImage(logo, -isz / 2, -isz / 2, isz, isz);       // tête d'Anubis seule, sans texte ni chaînes
      // 3) yeux : turquoise éteint, puis braises de la couleur du thème
      var eyes = HEAD.eyes, pw = clamp((u - 0.22) / 0.3, 0, 1), pulse = 0.75 + 0.25 * Math.sin(e.t * 14);
      eyes.forEach(function (p, j) { var ex = p[0] * isz, ey = p[1] * isz, ew = isz * HEAD.ew, eh = isz * HEAD.eh; ctx.save(); ctx.translate(ex, ey); ctx.rotate(j ? -0.25 : 0.25); ctx.fillStyle = 'rgba(20,0,5,' + (0.85 * pw) + ')'; ctx.beginPath(); ctx.ellipse(0, 0, ew * 1.1, eh * 1.5, 0, 0, TAU); ctx.fill(); ctx.restore(); });
      ctx.globalCompositeOperation = 'lighter';
      eyes.forEach(function (p, j) {
        var ex = p[0] * isz, ey = p[1] * isz, ew = isz * HEAD.ew, eh = isz * HEAD.eh, rr = isz * 0.09 * pw * pulse;
        var hg = ctx.createRadialGradient(ex, ey, 0, ex, ey, Math.max(1, rr)); hg.addColorStop(0, 'rgba(' + ers + ',' + (0.75 * pw) + ')'); hg.addColorStop(0.35, 'rgba(' + ers + ',' + (0.3 * pw) + ')'); hg.addColorStop(1, 'rgba(' + ers + ',0)');
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(ex, ey, Math.max(1, rr), 0, TAU); ctx.fill();
        ctx.save(); ctx.translate(ex, ey); ctx.rotate(j ? -0.25 : 0.25); ctx.fillStyle = 'rgba(' + ers + ',' + (0.95 * pw * pulse) + ')'; ctx.beginPath(); ctx.ellipse(0, 0, ew, eh, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,250,240,' + (0.9 * pw) + ')'; ctx.beginPath(); ctx.ellipse(0, 0, ew * 0.45, eh * 0.45, 0, 0, TAU); ctx.fill(); ctx.restore();
      });
      // cœur qui bat sur la poitrine (pesée)
      if (k === 'weigh' && pw > 0.2) { var hb = Math.pow(Math.max(0, Math.sin(e.t * 7)), 3), hr = size * (0.12 + 0.05 * hb); var hgr = ctx.createRadialGradient(0, size * 0.2, 0, 0, size * 0.2, hr); hgr.addColorStop(0, 'rgba(255,70,60,' + (0.55 + 0.4 * hb) + ')'); hgr.addColorStop(1, 'rgba(255,0,0,0)'); ctx.fillStyle = hgr; ctx.beginPath(); ctx.arc(0, size * 0.2, hr, 0, TAU); ctx.fill(); }
      ctx.restore(); ctx.restore();
    }
    if (split > 0) { medalHalf(-1); medalHalf(1); } else medalHalf(0);
    // 4) rayons des yeux
    var pw2 = clamp((u - 0.22) / 0.3, 0, 1);
    if (pw2 > 0.3 && (k === 'hand' || k === 'crypt')) [[HEAD.eyes[0][0], -1], [HEAD.eyes[1][0], 1]].forEach(function (p) {
      var ex = cx + p[0] * size * HEAD.emSize, ey = py + HEAD.eyes[0][1] * size * HEAD.emSize, bl = Math.max(W_, H_), bg = ctx.createLinearGradient(ex, ey, ex + p[1] * bl * 0.5, ey - bl * 0.35);
      bg.addColorStop(0, 'rgba(' + ers + ',' + (0.4 * pw2 * (1 - fadeOut)) + ')'); bg.addColorStop(1, 'rgba(' + ers + ',0)');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(ex, ey - size * 0.02); ctx.lineTo(ex + p[1] * bl * 0.5, ey - bl * 0.5); ctx.lineTo(ex + p[1] * bl * 0.5, ey - bl * 0.1); ctx.lineTo(ex, ey + size * 0.02); ctx.closePath(); ctx.fill();
    });
    // 5) particules du thème
    var spName = { scarab: 'scarab', weigh: 'weigh', crypt: 'amulet' }[k];
    if (spName) for (i = 0; i < e.parts.length; i++) { var q = e.parts[i]; spr(spName, q.x, q.y, q.s, q.r + (k === 'scarab' ? Math.sin(q.l * 20) * 0.25 : Math.sin(q.l * 2 + (q.sw || 0)) * 0.4), clamp(1 - (q.l - 1.4) / 0.8, 0, 1) * (1 - fadeOut)); }
    if (k === 'weigh') { var fy = -size * 0.4 + (H_ * 0.55 + size * 0.4) * G.ease.out3(clamp((u - 0.25) / 0.45, 0, 1)); spr('weigh', cx + Math.sin(e.t * 2.4) * size * 0.08, fy, size * 0.5, Math.sin(e.t * 2.4) * 0.3, clamp((u - 0.25) / 0.1, 0, 1) * (1 - fadeOut)); }
  }

  /* ============================ ANIMATIONS DE GAIN ============================
     5 niveaux (index = tier) : 0 WIN · 1 BIG WIN · 2 EXTRA WIN · 3 MEGA WIN · 4 JUGEMENT DIVIN.
     Seuils = multiplicateur total du tour rapporté au coût du tour (voir main.js : tierOf, et les règles dans i18n.js). */
  G.WIN_TIERS = [1, 10, 40, 150, 1000];
  var WT = [
    { cd: 0.9, hold: 0.6, dim: 0.0, rays: 0, rain: 0, shake: 0, coins: 10 },
    { cd: 2.3, hold: 1.5, dim: 0.62, rays: 14, rain: 14, shake: 0, coins: 34 },
    { cd: 3.1, hold: 1.7, dim: 0.7, rays: 18, rain: 28, shake: 1.6, coins: 60 },
    { cd: 4.4, hold: 2.1, dim: 0.78, rays: 22, rain: 50, shake: 3.2, coins: 95 },
    { cd: 5.8, hold: 2.6, dim: 0.86, rays: 26, rain: 84, shake: 5, coins: 140 }
  ];
  var WC = [   // couleurs : [rayons 1, rayons 2, lueur du titre]
    ['#d9b857', '#efdfa8', 'rgba(207,169,76,.6)'], ['#d9b857', '#efdfa8', 'rgba(217,184,87,.75)'],
    ['#6cd8c6', '#d9b857', 'rgba(108,216,198,.8)'], ['#d9b857', '#6cd8c6', 'rgba(217,184,87,.9)'], ['#efdfa8', '#a08cc8', 'rgba(194,139,255,.9)']
  ];
  function winFit(str, size, maxW, num) {   // réduit la taille pour que le texte tienne dans maxW
    ctx.font = num ? '700 ' + size * 1.14 + 'px ' + G.NUM : '900 ' + size + 'px Cinzel, serif';
    var m = ctx.measureText(str).width; return m > maxW ? size * maxW / m : size;
  }
  G.showBigWin = function (mult, amount, tier) {
    tier = clamp(tier | 0, 0, 4);
    return new Promise(function (res) {
      var T = I18N.t(), k = G.ultra ? 3.5 : G.turbo ? 1.8 : 1;
      G.winOv = { t: 0, k: k, mult: mult, amount: amount, tier: tier, W: WT[tier], count: 0, p: 0, done: false, closing: 0, res: res, title: T.tiers[tier], ev: { rings: 0 }, acc: 0, t0: tier ? 0.6 : 0.25, nextWave: 0.9, nextSp: 0.5, nextFl: 1.2, ringN: 0, nextCn: 1.0, burst: 0, pre: 0, freeze: 0, fz: 0, nextBolt: 0.7 };
      if (tier === 0) {
        Sfx.chime(mult); if (G.wheel) G.wheel.flashLamps = 1;
        FX.ring(G.cx, G.cy, '#eadb9f', G.R * 1.15, 0.9); FX.spark(G.cx, G.cy, 22, '#d9b857', 360);
        FX.coins(G.cx, G.cy + G.R * 0.35, 8, 800, 60);
      } else {
        Sfx.fanfare(tier);
        if (tier >= 2 && Sfx.rise) Sfx.rise(tier, WT[tier].cd / k);
        FX.flash(0.3 + tier * 0.1, '#eadb9f'); FX.shake(6 + tier * 3, 0.5);
        FX.coins(G.cx, G.cy + G.R * 0.4, 18 + tier * 8, 1100, 80);
      }
    });
  };
  function winLand(o) {
    o.done = true; o.doneAt = o.t; o.count = o.amount; o.p = 1;
    var t = o.tier, W = o.W;
    FX.ring(G.cx, G.cy, '#eadb9f', G.R * (t ? 1.3 : 1.1), 0.9);
    if (t > 0) {
      Sfx.thud(); Sfx.winLand && Sfx.winLand(t);
      FX.shake(6 + t * 3, 0.45); FX.flash(0.2 + t * 0.07, WC[t][0]);
      FX.coins(G.cx, G.cy + G.R * 0.4, W.coins, 1150, 100);
      FX.spark(G.cx, G.cy - Math.min(G.w, G.h) * 0.2, 14 + t * 8, WC[t][0], 420);
      if (t >= 2) {   // explosion du total : ondes de choc, canons à pièces, maillons brisés, rayons qui jaillissent
        o.burst = 1; var cp = Math.sqrt(2100 * G.h);
        FX.cannon(20, G.h - 10, 1, 10 + t * 5, cp); FX.cannon(G.w - 20, G.h - 10, -1, 10 + t * 5, cp);
        FX.ring(G.cx, G.cy, WC[t][1], Math.max(G.w, G.h) * 0.5, 0.9); FX.ring(G.cx, G.cy, WC[t][0], Math.max(G.w, G.h) * 0.8, 1.2);
        FX.links(G.cx, G.cy - Math.min(G.w, G.h) * 0.12, 10 + t * 4, 760);
        FX.shake(10 + t * 4, 0.7);
      }
    } else { FX.spark(G.cx, G.cy, 16, '#eadb9f', 300); FX.coins(G.cx, G.cy + G.R * 0.3, W.coins, 900, 60); }
  }
  function updateWinOv(dt) {
    var o = G.winOv; if (!o) { G.fxScale = 1; return; }
    var t = o.tier, W = o.W, R = FX.reduced, w = G.w, u = Math.min(w, G.h), sdt = dt * o.k, prev = o.count;
    if (o.freeze > 0) {   // arrêt sur image juste avant le total (hit-stop), puis il retombe d'un coup
      o.freeze -= dt; G.fxScale = 0;
      if (o.freeze <= 0) { G.fxScale = 1; winLand(o); }
      return;
    }
    var qq = clamp((o.t - o.t0) / W.cd, 0, 1);
    o.pre = (t >= 2 && !o.done && !R) ? clamp((qq - 0.7) / 0.3, 0, 1) : 0;                       // les derniers pour cent : ralenti, zoom, tension
    var slowK = 1 - 0.72 * o.pre * (t >= 3 ? 1 : 0.7);
    G.fxScale = o.done ? 1 : slowK;
    o.t += sdt * slowK;
    if (o.burst > 0) o.burst = Math.max(0, o.burst - sdt * 1.5);
    if (!o.done) {
      var q = clamp((o.t - o.t0) / W.cd, 0, 1);
      o.p = 1 - Math.pow(1 - q, 3.2);                           // décompte : rapide au début, très lent à la fin
      o.count = q >= 1 ? o.amount : o.p * o.amount;
      if (q >= 1) {
        if (t >= 2 && !R && !o.fz) { o.fz = 1; o.freeze = (t >= 3 ? 0.2 : 0.12) / o.k; o.count = o.amount * 0.999; Sfx.hitStop && Sfx.hitStop(); }
        else winLand(o);
      } else {
        var nt = t ? 40 : 12;
        if (Math.floor(prev / o.amount * nt) !== Math.floor(o.count / o.amount * nt)) Sfx.countTick(o.p);
      }
    }
    var cx = G.cx, ty = G.cy - u * 0.2, c = WC[t];
    if (t > 0) {
      if (!o.ev.slam && o.t > 0.34) { o.ev.slam = 1; FX.ring(cx, ty, c[0], u * 0.9, 0.8); FX.shake(8 + t * 3, 0.5); FX.spark(cx, ty, 18 + t * 6, c[0], 420); }
      if (!o.done) {
        var amp = 0.35 + 0.65 * o.p;
        if (t >= 2 && o.t > 0.4) FX.shake(W.shake * amp, 0.12);                  // la tension monte avec le compteur
        o.acc += sdt * W.rain * amp * (R ? 0.4 : 1) * (FX.lite ? 0.6 : 1);
        while (o.acc >= 1) { o.acc -= 1; FX.rain(G.w, 1); }
        if (o.t > o.nextSp) { o.nextSp += 0.14; FX.spark(cx + (Math.random() - 0.5) * w * 0.6, ty + (Math.random() - 0.5) * u * 0.1, 2 + t, c[Math.random() < 0.5 ? 0 : 1], 240, 0.7); }
        if (t >= 2 && !R && o.t > o.nextCn) { o.nextCn += t >= 3 ? 0.55 : 0.9; var cpw = Math.sqrt(2100 * G.h), sidec = o.ringN % 2 ? 1 : -1; FX.cannon(sidec > 0 ? 20 : w - 20, G.h - 10, sidec, 5 + t * 2, cpw); }
        if (t >= 2 && o.t > o.nextWave) { o.nextWave += t >= 3 ? 1.0 : 1.5; FX.ring(cx, G.cy, c[o.ringN++ % 2], Math.max(w, G.h) * 0.6, 1.1); if (t >= 3) FX.coins(cx, G.cy + G.R * 0.5, 14, 1000, w * 0.4); }
        if (t === 4 && o.t > o.nextFl) { o.nextFl += 1.3; FX.flash(0.22, '#cfc4e4'); }
      } else if (t >= 3 && o.ev.rings < 3 && o.t - o.doneAt > 0.3 * (o.ev.rings + 1)) { o.ev.rings++; FX.ring(cx, G.cy, c[o.ev.rings % 2], Math.max(w, G.h) * (0.5 + 0.15 * o.ev.rings), 1.0); }
    }
    if (o.done && !o.closing && o.t - o.doneAt > W.hold) o.closing = 0.0001;
    if (!o.closing && o.t > W.cd + W.hold + 14) { if (!o.done) winLand(o); o.closing = 0.0001; }   // sécurité : jamais de blocage
    if (o.closing) { o.closing += sdt * 2.5; if (o.closing >= 1) { var r = o.res; G.winOv = null; G.fxScale = 1; r(); } }
  }
  G.skipWinOv = function () {
    var o = G.winOv; if (!o) return false;
    if (o.freeze > 0) { o.freeze = 0; G.fxScale = 1; }
    if (!o.done) winLand(o);
    else if (!o.closing) o.closing = 0.0001;
    return true;
  };
  function drawWinOv() {
    var o = G.winOv; if (!o) return;
    var t = o.tier, W = o.W, c = WC[t], R = FX.reduced, tt = o.t, w = G.w, h = G.h, cx = G.cx, cy = G.cy, u = Math.min(w, h), p = o.p;
    var a = o.closing ? 1 - o.closing : 1, inn = clamp(tt / 0.3, 0, 1), d = o.done ? tt - o.doneAt : -1, i, j;
    var T = I18N.t(), amt = G.moneyCount(o.count, o.amount), amtMax = G.money(o.amount);
    ctx.save(); ctx.globalAlpha = a;
    if (o.pre > 0) { var zk = 1 + 0.07 * o.pre * o.pre; ctx.translate(cx, cy); ctx.scale(zk, zk); ctx.translate(-cx, -cy); }
    /* --- WIN : bandeau élégant sur la roue, sans assombrir tout l'écran --- */
    if (t === 0) {
      var bh = u * 0.25, sl = G.ease.out3(clamp(tt / 0.3, 0, 1)), pul = 0.75 + 0.25 * Math.sin(tt * 6);
      var gl0 = ctx.createRadialGradient(cx, cy, 0, cx, cy, G.R * 1.2); gl0.addColorStop(0, A.rgba('#d9b857', 0.32 * pul * sl)); gl0.addColorStop(1, 'rgba(217,184,87,0)');
      ctx.fillStyle = gl0; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1, sl);
      var bg = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
      bg.addColorStop(0, 'rgba(6,5,3,0)'); bg.addColorStop(0.16, 'rgba(6,5,3,.86)'); bg.addColorStop(0.84, 'rgba(6,5,3,.86)'); bg.addColorStop(1, 'rgba(6,5,3,0)');
      ctx.fillStyle = bg; ctx.fillRect(-w / 2, -bh / 2, w, bh);
      var ln = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
      ln.addColorStop(0, 'rgba(217,184,87,0)'); ln.addColorStop(0.2, '#d9b857'); ln.addColorStop(0.5, '#efdfa8'); ln.addColorStop(0.8, '#d9b857'); ln.addColorStop(1, 'rgba(217,184,87,0)');
      ctx.fillStyle = ln; ctx.fillRect(-w / 2, -bh / 2, w, 2); ctx.fillRect(-w / 2, bh / 2 - 2, w, 2);
      [-1, 1].forEach(function (sd) {   // losanges turquoise aux extrémités
        var dx = sd * (w * 0.5 - u * 0.12 - 6 * Math.sin(tt * 3)); ctx.save(); ctx.translate(dx, 0); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#6cd8c6'; ctx.globalAlpha = a * 0.8; ctx.fillRect(-5, -5, 10, 10); ctx.restore();
      });
      if (!R) { ctx.globalCompositeOperation = 'lighter'; var sx = (tt * 1.4 % 2 - 0.5) * w, sg = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0); sg.addColorStop(0, 'rgba(239,223,168,0)'); sg.addColorStop(0.5, 'rgba(239,223,168,.22)'); sg.addColorStop(1, 'rgba(239,223,168,0)'); ctx.fillStyle = sg; ctx.fillRect(-w / 2, -bh / 2, w, bh); }
      ctx.restore();
      var ws = 1 + (d >= 0 ? 0.14 * Math.exp(-d * 6) * Math.cos(d * 16) : 0.02 * Math.sin(tt * 20));
      var tsz = Math.min(u * 0.075, 46);
      ctx.save(); ctx.translate(cx, cy - bh * 0.2); ctx.scale(sl, sl); G.goldText(o.title, 0, 0, tsz, { spacing: 6, blur: 22, shadow: c[2] }); ctx.restore();
      var asz = winFit(amtMax, Math.min(u * 0.11, 64), w * 0.8, true);
      ctx.save(); ctx.translate(cx, cy + bh * 0.2); ctx.scale(ws * sl, ws * sl); G.goldText(amt, 0, 0, asz, { blur: 26 }); ctx.restore();
      ctx.restore(); return;
    }
    /* --- fond --- */
    ctx.fillStyle = 'rgba(4,3,2,' + W.dim * inn + ')'; ctx.fillRect(0, 0, w, h);
    if (ART.bigwin) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = a * (0.14 + 0.05 * t) * clamp(tt / 0.5, 0, 1); cover(ctx, ART.bigwin, w, h); ctx.restore(); }
    var rot = tt * (R ? 0.1 : 0.3 + 0.08 * t), vb = Math.min(h, (FX.floorY < 9000 ? FX.floorY + 10 : h));   // vb : bas de la zone visible (au-dessus du HUD)
    A.rays(ctx, cx, cy, Math.max(w, h), W.rays, rot, c[0], 0.09 + 0.03 * t);
    if (t >= 2) A.rays(ctx, cx, cy, Math.max(w, h), W.rays - 4, -rot * 1.3 + 0.2, c[1], 0.07 + 0.02 * t);
    if (o.burst > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; A.rays(ctx, cx, cy, Math.max(w, h) * 1.2, 24, rot * 4, '#f4ecd6', 0.4 * o.burst); ctx.restore(); }
    if (o.pre > 0.01) { var vg0 = ctx.createRadialGradient(cx, cy, u * 0.2, cx, cy, Math.max(w, h) * 0.7); vg0.addColorStop(0, 'rgba(0,0,0,0)'); vg0.addColorStop(1, 'rgba(0,0,0,' + 0.55 * o.pre + ')'); ctx.fillStyle = vg0; ctx.fillRect(0, 0, w, h); }
    if (t === 4 && !R && !o.done && ((tt * 2.2) % 1) < 0.22) { var bs = Math.floor(tt * 2.2) * 131 + 7; FX.bolt(ctx, cx + ((bs % 7) - 3) * w * 0.07, 0, cx + ((bs % 5) - 2) * w * 0.04, cy - u * 0.12, '#a08cc8', u * 0.012, bs); }
    var gr = u * (0.55 + 0.08 * t) * (1 + 0.04 * Math.sin(tt * 4)), gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
    gl.addColorStop(0, A.rgba(t === 2 ? '#6cd8c6' : t === 4 ? '#a08cc8' : '#d9b857', 0.3 + 0.04 * t)); gl.addColorStop(1, 'rgba(217,184,87,0)');
    ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h); ctx.restore();
    /* --- MEGA / DIVIN : Anubis surgit derrière le titre --- */
    if (t >= 3 && ART.medal) {
      var mr = G.ease.outBack(clamp((tt - 0.15) / 0.9, 0, 1)), ms = Math.min(u * (t === 4 ? 1.05 : 0.92), vb * 0.9) * mr, my = cy - u * 0.02 + (1 - mr) * u * 0.3, ma = 0.36 * clamp((tt - 0.1) / 0.6, 0, 1) * (1 + 0.1 * Math.sin(tt * 3));
      ctx.save(); ctx.lineWidth = Math.max(2, ms * 0.012); ctx.strokeStyle = A.rgba(t === 4 ? '#a08cc8' : '#6cd8c6', 0.8 * ma);   // anneaux gravés (aplat net, pas de halo flou)
      [0.56, 0.62].forEach(function (rr) { ctx.beginPath(); ctx.arc(cx, my, ms * rr, 0, TAU); ctx.stroke(); }); ctx.restore();
      ctx.save(); ctx.translate(cx, my); ctx.globalAlpha = a * clamp(ma, 0, 1);
      ctx.shadowColor = c[2]; ctx.shadowBlur = 0; ctx.beginPath(); ctx.arc(0, 0, ms * 0.49, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); ctx.shadowBlur = 0;
      ctx.save(); ctx.clip(); ctx.drawImage(ART.medal, -ms / 2, -ms / 2, ms, ms); ctx.restore();
      ctx.lineWidth = 3; ctx.strokeStyle = '#d9b857'; ctx.setLineDash([ms * 0.03, ms * 0.02]); ctx.lineDashOffset = -tt * 20; ctx.beginPath(); ctx.arc(0, 0, ms * 0.5, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
    }
    /* --- MEGA / DIVIN : vagues d'or qui montent --- */
    if (t >= 3 && !R) {
      for (j = 0; j < 3; j++) {
        var base = vb - h * (0.05 + 0.05 * p) * (1 + j * 0.7) - (t === 4 ? 14 : 0), amp2 = (10 + 7 * j) * (0.5 + p);
        ctx.beginPath(); ctx.moveTo(0, h);
        for (i = 0; i <= 24; i++) { var xx = w * i / 24; ctx.lineTo(xx, base + Math.sin(xx * 0.011 * (1 + j * 0.35) + tt * (1.5 + j * 0.6)) * amp2); }
        ctx.lineTo(w, h); ctx.closePath();
        var wg = ctx.createLinearGradient(0, base - amp2, 0, h); wg.addColorStop(0, 'rgba(217,184,87,' + (0.42 - 0.1 * j) * inn + ')'); wg.addColorStop(1, 'rgba(184,134,30,.05)');
        ctx.fillStyle = wg; ctx.fill();
      }
    }
    /* --- gardiens (grand écran) --- */
    var hs = u * 0.11 * G.ease.outBack(clamp(tt / 0.6, 0, 1));
    // médaillons latéraux : repoussés vers les bords et rétrécis pour ne jamais masquer le titre ni le montant ; absents si la place manque
    var gsz = winFit(amtMax, Math.min(w * 0.15, u * 0.17) * (1 + 0.05 * t), w * 0.8, true);
    ctx.font = '700 ' + gsz * 1.14 + 'px ' + G.NUM; var gHalf = ctx.measureText(amtMax).width / 2 + 10;
    var gms = Math.min(hs * 3.4, w / 2 - gHalf - 8), gx = w / 2 - gms / 2 - 6;
    if (w > 640 && t >= 2 && gms > u * 0.2) [-1, 1].forEach(function (sd) {
      if (ART.medal) { var ms2 = gms; ctx.save(); ctx.translate(cx + sd * gx, cy - u * 0.02); ctx.rotate(sd * Math.sin(tt * 1.5) * 0.04); ctx.shadowColor = c[0]; ctx.shadowBlur = 0; ctx.beginPath(); ctx.arc(0, 0, ms2 * 0.49, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); ctx.shadowBlur = 0; ctx.clip(); ctx.drawImage(ART.medal, -ms2 / 2, -ms2 / 2, ms2, ms2); ctx.restore(); }
      else A.jackal(ctx, cx + sd * gx, cy - u * 0.02, hs * 1.5, { glow: 1 });
    });
    /* --- titre : choc d'arrivée (zoom arrière), puis respiration, puis pulsation à l'arrivée du total --- */
    var ty = cy - u * 0.2, lines = (w < 640 && o.title.indexOf(' ') > 0 && o.title.length > 10) ? o.title.split(' ') : [o.title];
    var bsz = u * (0.105 + 0.006 * t), tsz2 = bsz;
    lines.forEach(function (s) { tsz2 = Math.min(tsz2, winFit(s, bsz, w * 0.78, false)); });
    var slam = R ? 1 : 1 + 1.9 * (1 - G.ease.out5(clamp((tt - 0.05) / 0.32, 0, 1)));
    var tpul = 1 + (R ? 0 : 0.014 * Math.sin(tt * 3.2)) + (d >= 0 && !R ? 0.1 * Math.exp(-d * 4) * Math.cos(d * 12) : 0);
    var tal = clamp((tt - 0.05) / 0.12, 0, 1);
    ctx.save(); ctx.globalAlpha = a * tal; ctx.translate(cx, ty); ctx.scale(slam * tpul, slam * tpul);
    lines.forEach(function (s, li) { G.goldText(s, 0, (li - (lines.length - 1) / 2) * tsz2 * 1.05, tsz2, { spacing: 2, blur: 26 + t * 6, shadow: c[2] }); });
    ctx.restore();
    /* --- montant : défile, ralentit, puis rebondit à l'arrivée --- */
    var asz2 = winFit(amtMax, Math.min(w * 0.15, u * 0.17) * (1 + 0.05 * t), w * 0.8, true);
    var ns = d >= 0 ? 1 + 0.24 * Math.exp(-d * 4.5) * Math.cos(d * 13) : 1 + 0.018 * Math.sin(tt * 30);
    var ay = cy + u * 0.06 + (lines.length - 1) * tsz2 * 0.5;
    ctx.save(); ctx.translate(cx, ay); ctx.scale(ns, ns); G.goldText(amt, 0, 0, asz2, { blur: 40, shadow: c[2] }); ctx.restore();
    G.txt('×' + G.fmt(o.mult), cx, ay + u * 0.14, { size: Math.min(w * 0.05, u * 0.06), fill: '#efdfa8', stroke: '#2a1a02', shadow: 'rgba(217,184,87,.6)' });
    if (o.done && !o.closing) G.txt(T.tapSkip, cx, Math.min(ay + u * 0.24, vb - 22), { size: 13, family: G.TEXT, weight: 700, fill: 'rgba(239,223,168,' + (0.45 + 0.35 * Math.sin(tt * 4)) + ')', spacing: 3 });
    /* --- vignette --- */
    var vg = ctx.createRadialGradient(cx, cy, u * 0.45, cx, cy, Math.max(w, h) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,' + (0.35 + 0.05 * t) + ')');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  /* ================================ BOUCLE ================================ */
  var last = 0, winOvOn = false, pillTopOn = false;
  function tick(dt) {
    G.t += dt;
    var sdt = dt * G.speed, i;
    for (i = G.timers.length - 1; i >= 0; i--) { var tm = G.timers[i]; tm.t -= sdt; if (tm.t <= 0) { G.timers.splice(i, 1); tm.res(); } }
    for (i = G.tweens.length - 1; i >= 0; i--) {
      var tw = G.tweens[i]; tw.t += sdt; var u = Math.min(1, tw.t / tw.dur); tw.fn(tw.ease ? tw.ease(u) : u);
      if (u >= 1) { G.tweens.splice(i, 1); tw.res(); }
    }
    parUpdate(dt);
    // turbo / ultra : le temps de jeu avance jusqu'à 8× plus vite ; on le découpe en pas ≤ 1/60 s pour que le ressort du pointeur,
    // la physique des scarabées et les particules restent stables (un gros pas fait diverger le ressort et traverser les chevilles)
    var sub = Math.min(12, Math.max(1, Math.ceil(sdt * 60))), h = sdt / sub;
    for (i = 0; i < sub; i++) {
      W.update(h);
      if (G.scene && G.scene.update) G.scene.update(h);
      FX.update(h * G.fxScale);
    }
    updateWinOv(dt);
    updateEmerge(sdt);
    updateCell(sdt);
  }
  G.advance = async function (sec) { for (var n = Math.round(sec * 60), i = 0; i < n; i++) { tick(1 / 60); await null; } };
  var perf = { acc: 0, n: 0, stage: 0 };
  function adaptQuality(rawDt) {
    if (G.quality !== 'auto' || perf.stage >= 2 || rawDt > 0.25) return;
    perf.acc += rawDt; perf.n++;
    if (perf.n < 120) return;
    var avg = perf.acc / perf.n; perf.acc = 0; perf.n = 0;
    if (avg > 0.034) {
      perf.stage++;
      if (perf.stage === 1 && G.dpr > 1) { G.autoLow = true; layout(); }
      else { FX.lite = true; perf.stage = 2; }
      if (root.Grade) root.Grade.lite(true);   // le filtre de couleur CSS plein écran est le premier à sauter
    }
  }
  G.setQuality = function (q) { G.quality = q; G.autoLow = false; perf.stage = 0; FX.lite = (q === 'low'); if (root.Grade) root.Grade.lite(q === 'low'); layout(); };
  function frame(ts) {
    root.requestAnimationFrame(frame);   // replanifié d'abord : une exception dans un dessin ne fige plus le jeu
    var rawDt = (ts - last) / 1000 || 0.016;
    var dt = Math.min(0.05, rawDt); last = ts; adaptQuality(rawDt);
    tick(dt);
    var i;
    var so = FX.shakeOffset();
    ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
    ctx.clearRect(0, 0, G.w, G.h);
    ctx.save(); ctx.translate(so[0], so[1]);
    var sc = G.scene;
    ctx.save(); ctx.translate(G.cx - P.x * 18, G.cy - P.y * 10); ctx.scale(1.05, 1.05); ctx.translate(-G.cx, -G.cy);   // fond : plan lointain
    drawBackdrop(sc && sc.dim != null ? sc.dim : 0, sc && sc.bgImg);
    ctx.restore();
    ctx.drawImage(frz, 0, 0, G.w, frz.height / G.dpr);
    ctx.save(); ctx.translate(P.x * 5, P.y * 3);                                                                       // jeu : plan proche
    if (!sc || sc.showsWheel) W.draw(sc && sc.wheelAlpha);
    if (CA && (!sc || sc.showsWheel)) drawCell();
    if (sc && sc.draw) sc.draw(ctx);
    ctx.restore();
    var ovTop = G.winOv && G.winOv.tier > 0;      // gros gain : pièces et éclats passent AU-DESSUS de l'overlay assombri
    if (!ovTop) FX.draw(ctx);
    ctx.restore();
    drawWinOv();
    var wo = !!G.winOv, pt = !!(sc && sc.pillTop); if (wo !== winOvOn) { winOvOn = wo; document.documentElement.classList.toggle('winov', wo); }
    if (pt !== pillTopOn) { pillTopOn = pt; document.documentElement.classList.toggle('pilltop', pt); }   // la pastille d'état DOM se masque pendant l'overlay de gain
    if (ovTop) { ctx.save(); ctx.translate(so[0], so[1]); FX.draw(ctx); ctx.restore(); }
    drawEmerge();
    FX.drawFlash(ctx, G.w, G.h);
    if (G.chain) { ctx.save(); ctx.translate(so[0], so[1]); FX.Chains.draw(ctx, G.w, G.h, G.chain); ctx.restore(); }
    if (G.fade > 0.001) { ctx.fillStyle = 'rgba(4,3,2,' + G.fade + ')'; ctx.fillRect(0, 0, G.w, G.h); }
    for (i = 0; i < G.onFrame.length; i++) G.onFrame[i](dt);
  }

  G.setFade = function (to, dur) { var from = G.fade; return G.tween(dur, function (u) { G.fade = from + (to - from) * u; }, null); };
  G.setScene = function (s) { G.scene = s; if (s && s.layout) s.layout(); };
  G.layout = layout;
  // redimensionnement / rotation : une seule remise en page quand le flux d'événements s'arrête (déplacer le bord d'une fenêtre en envoie des dizaines,
  // et chaque layout() reconstruit fond, roue et grain de pierre)
  var rsT = 0;
  function onResize() { clearTimeout(rsT); rsT = setTimeout(layout, 90); }
  G.start = function () { layout(); root.addEventListener('resize', onResize); root.addEventListener('orientationchange', onResize); root.requestAnimationFrame(frame); };
  G.relayout = layout;

  /* parallaxe : la caméra bouge un peu avec le pointeur / l'inclinaison du téléphone, sinon un balancement lent */
  var P = G.par = { x: 0, y: 0, tx: 0, ty: 0, stamp: -99 };
  function parAim(x, y) { if (!isFinite(x) || !isFinite(y)) return; P.tx = clamp(x, -1, 1); P.ty = clamp(y, -1, 1); P.stamp = G.t; }
  root.addEventListener('pointermove', function (e) { parAim(e.clientX / G.w * 2 - 1, e.clientY / G.h * 2 - 1); });
  root.addEventListener('deviceorientation', function (e) { if (e.gamma != null && e.beta != null) parAim(e.gamma / 25, (e.beta - 45) / 25); });
  function parUpdate(dt) {
    if (G.t - P.stamp > 3.5) { P.tx = Math.sin(G.t * 0.31) * 0.55; P.ty = Math.cos(G.t * 0.23) * 0.4; }
    var k = Math.min(1, dt * 3); P.x += (P.tx - P.x) * k; P.y += (P.ty - P.y) * k;
    if (!isFinite(P.x) || !isFinite(P.y)) { P.x = P.y = P.tx = P.ty = 0; }
    if (FX.reduced) { P.x = 0; P.y = 0; }
  }

  /* pointeur */
  function pt(e) { var r = cv.getBoundingClientRect(); var p = e.touches ? e.touches[0] || e.changedTouches[0] : e; return { x: p.clientX - r.left, y: p.clientY - r.top }; }
  cv.addEventListener('pointerdown', function (e) {
    Sfx.unlock();
    if (G.skipWinOv()) return;
    var p = pt(e);
    if (G.scene && G.scene.pointer) G.scene.pointer(p.x, p.y, 'down');
    else if (G.onWheelTap) G.onWheelTap(p.x, p.y);
  });
  function up(e) { if (G.scene && G.scene.pointer) { var p = pt(e); G.scene.pointer(p.x, p.y, 'up'); } }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('pointermove', function (e) { if (G.scene && G.scene.pointer) { var p = pt(e); G.scene.pointer(p.x, p.y, 'move'); } });
})(window);
