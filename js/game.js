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
    quality: 'auto', mod: mod, clamp: clamp, txt: null, ease: FX.ease, onFrame: []
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
    if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = o.blur || 12; }
    if (o.stroke) { ctx.lineWidth = o.sw || Math.max(2, (o.size || 20) * 0.12); ctx.strokeStyle = o.stroke; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
    ctx.fillStyle = o.fill || '#fff1b8'; ctx.fillText(s, x, y);
    ctx.shadowBlur = 0;
    if (o.spacing && ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px';
  };
  G.goldText = function (s, x, y, size, o) {
    o = o || {};
    var g = ctx.createLinearGradient(0, y - size * 0.55, 0, y + size * 0.55);
    g.addColorStop(0, '#fffbe0'); g.addColorStop(0.45, '#f6c850'); g.addColorStop(0.62, '#b8861e'); g.addColorStop(1, '#ffe596');
    if (isNum(s)) G.txt(s, x, y + size * 0.05, { size: size, fill: '#6a4208', stroke: '#2a1802', sw: o.sw || size * 0.1, align: o.align, spacing: o.spacing }); // épaisseur
    G.txt(s, x, y, { size: size, weight: 900, fill: g, stroke: o.stroke || '#3a2706', sw: o.sw || size * 0.1, shadow: o.shadow || 'rgba(230,185,74,.55)', blur: o.blur || 18, align: o.align, spacing: o.spacing });
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
    function mk(on) {
      var s = 40, c = document.createElement('canvas'); c.width = c.height = s; var x = c.getContext('2d');
      var g = x.createRadialGradient(20, 20, 0, 20, 20, 20);
      if (on) { g.addColorStop(0, '#ffffff'); g.addColorStop(0.18, '#fff1b8'); g.addColorStop(0.45, 'rgba(255,196,70,.55)'); g.addColorStop(1, 'rgba(255,170,40,0)'); }
      else { g.addColorStop(0, '#5a4418'); g.addColorStop(0.2, '#3a2c10'); g.addColorStop(0.3, 'rgba(0,0,0,.4)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); }
      x.fillStyle = g; x.fillRect(0, 0, s, s); return c;
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
      f.fillStyle = 'rgba(4,3,2,.35)'; f.fillRect(0, 0, w, h);
      G.guard = null;
    } else {
    // assises de pierre
    f.strokeStyle = 'rgba(230,185,74,.045)'; f.lineWidth = 1;
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
    fl.addColorStop(0, 'rgba(230,185,74,0)'); fl.addColorStop(1, 'rgba(230,185,74,.08)');
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
    vg.addColorStop(0, 'rgba(96,34,170,1)'); vg.addColorStop(1, 'rgba(96,34,170,0)');
    vv.addColorStop(0, 'rgba(18,6,36,0)'); vv.addColorStop(1, 'rgba(34,10,70,.55)');
    return BG = { vg: vg, vv: vv };
  }
  function blob(g, x, y, rx, ry, alpha) {   // remplit le dégradé unité g en (x, y), rayons rx / ry
    ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry); ctx.globalAlpha = alpha; ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
  }
  function drawBackdrop(dim, img) {
    var w = G.w, h = G.h, t = G.t, bgG = backdropGrads();
    ctx.drawImage(bg, 0, 0, w, h);
    if (img && ART[img]) { ctx.globalAlpha = Math.min(1, dim * 1.2 + 0.2); cover(ctx, ART[img], w, h); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(0, 0, w, h); }
    // rayons rotatifs derrière la roue
    A.rays(ctx, G.cx, G.cy, Math.max(w, h) * 0.9, 16, t * 0.05, '#ffd86a', 0.05 * (1 - dim * 0.6));
    blob(unitGrad('glow', 0.4 / 1.9, [[0, 'rgba(255,200,90,1)'], [1, 'rgba(255,200,90,0)']]), G.cx, G.cy, G.R * 1.9, G.R * 1.9, 0.20 * (1 - dim * 0.5));
    // braseros + yeux des gardiens
    if (G.guard) {
      [-1, 1].forEach(function (sd) {
        var x = G.cx + sd * G.guard.x, fl = 0.85 + Math.sin(t * 9 + sd) * 0.1 + Math.sin(t * 23) * 0.05, bw = G.R * 0.16;
        blob(unitGrad('brazier', 0, [[0, 'rgba(255,240,170,.95)'], [0.3, 'rgba(255,170,50,.55)'], [1, 'rgba(255,100,20,0)']]), x, G.guard.bowlY - bw * 0.7, bw * 2.4 * fl, bw * 2.4 * fl, 1);
        ctx.fillStyle = 'rgba(255,225,120,.95)';
        ctx.beginPath(); ctx.moveTo(x - bw * 0.5, G.guard.bowlY); ctx.quadraticCurveTo(x - bw * 0.4, G.guard.bowlY - bw * 1.7 * fl, x + Math.sin(t * 7 + sd) * bw * 0.2, G.guard.bowlY - bw * 2.1 * fl);
        ctx.quadraticCurveTo(x + bw * 0.5, G.guard.bowlY - bw * 1.5 * fl, x + bw * 0.5, G.guard.bowlY); ctx.fill();
        var s = G.guard.s, ey = G.guard.top - G.R * 0.22 + s * 0.1;
        [-1, 1].forEach(function (e) {
          var ex = x + e * s * 0.31, p = 0.55 + 0.45 * Math.sin(t * 2.2 + sd);
          blob(unitGrad('eye', 0, [[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(111,240,221,1)'], [1, 'rgba(24,181,164,0)']]), ex, ey, s * 0.28, s * 0.28, p);
        });
      });
    }
    // brume : deux nappes qui dérivent à des profondeurs différentes
    if (!FX.lite) [[0.0, 0.62, 0.9, 26], [0.5, 0.78, 0.7, -42]].forEach(function (fg, n) {
      var fx = ((t * 0.012 * (n ? -1 : 1) + fg[0]) % 1) * w * 1.6 - w * 0.3 + G.par.x * fg[3], fy = h * fg[1];
      blob(unitGrad('fog', 0, [[0, 'rgba(255,214,140,1)'], [1, 'rgba(255,214,140,0)']]), fx, fy, w * 0.45, w * 0.45 * 0.35, 0.07 * fg[2]);
    });
    // poussière d'or
    ctx.fillStyle = '#ffd86a';
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i], yy = mod(d.y - t * d.v, 1) * h, xx = (d.x + Math.sin(t * 0.3 + d.p) * 0.02) * w + G.par.x * d.s * 9;
      ctx.globalAlpha = 0.18 + 0.22 * Math.sin(t * 1.3 + d.p) * Math.sin(t * 1.3 + d.p);
      ctx.beginPath(); ctx.arc(xx, yy, d.s, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // étalonnage « Anubis Unchained » : ombres violettes en haut, lueur turquoise du sol, braises qui montent
    var fk = 0.92 + Math.sin(t * 7.3) * 0.045 + Math.sin(t * 17.1) * 0.03;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.34 * (1 - dim * 0.4); ctx.fillStyle = bgG.vg; ctx.fillRect(0, 0, w, h * 0.6); ctx.globalAlpha = 1;
    blob(unitGrad('teal', 0, [[0, 'rgba(32,210,190,1)'], [1, 'rgba(32,210,190,0)']]), G.cx, h * 1.02, Math.max(w, h) * 0.55, Math.max(w, h) * 0.55, 0.09 * fk);
    ctx.restore();
    if (!FX.lite) {
      for (var ej = 0; ej < embers.length; ej++) {
        var em = embers[ej], ey = (1 - mod(em.y + t * em.v, 1)) * h, ex = (em.x + Math.sin(t * 0.5 + em.p) * 0.03) * w + G.par.x * em.s * 14, ea = Math.sin(Math.PI * (1 - ey / h)) * (0.35 + 0.35 * Math.sin(t * 2 + em.p));
        ctx.globalAlpha = Math.max(0, ea); ctx.fillStyle = em.teal ? '#6ff0dd' : '#ffb347';
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(ex, ey, em.s, 0, TAU); ctx.fill();
      }
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }
    ctx.fillStyle = bgG.vv; ctx.fillRect(0, 0, w, h);
    if (dim) { ctx.fillStyle = 'rgba(0,0,0,' + dim + ')'; ctx.fillRect(0, 0, w, h); }
  }
  G.drawBackdrop = drawBackdrop;

  /* ============================== LA ROUE ============================== */
  var VIS = {
    m0:    { c: ['#52432f', '#2a2016'], tx: '#d8c49a', glyph: 'dust' },
    m025:  { c: ['#d6a24a', '#9a6a22'], tx: '#2a1600' },
    m05:   { c: ['#f0bc50', '#a8741e'], tx: '#2a1600' },
    m1:    { c: ['#5a96ff', '#2358d8'], tx: '#ffffff' },
    m2:    { c: ['#30f0d8', '#0fa896'], tx: '#032b26' },
    m3:    { c: ['#4cf5a2', '#18ad66'], tx: '#032616' },
    ankh:  { c: ['#fff0b0', '#d29a28'], tx: '#3a2706', glyph: 'ankh' },
    scarab:{ c: ['#ff7058', '#c02c1c'], tx: '#fff6e6', glyph: 'scarab' },
    weigh: { c: ['#ffffff', '#e8cf86'], tx: '#4a3410', glyph: 'feather' },
    vault: { c: ['#cc84ff', '#7a30b8'], tx: '#fff6ff', glyph: 'pyramid' }
  };
  G.VIS = VIS;
  G.kindColor = function (k) { return VIS[k].c[0]; };

  var W = G.wheel = {
    rot: 0, vel: 0, mode: 'idle', ptr: { a: 0, v: 0 }, oracle: null, hl: null, face: null, lastIdx: -1, lastTick: 0, flashLamps: 0, spinning: false
  };
  var step = TAU / M.N;

  function wedge(f, i, ri, ro) {
    var a0 = i * step - Math.PI / 2, a1 = (i + 1) * step - Math.PI / 2;
    f.beginPath(); f.arc(0, 0, ro, a0, a1); f.arc(0, 0, ri, a1, a0, true); f.closePath();
  }

  // anneau métallique : dégradé conique + martelage (texture) + biseau
  function metalRing(f, rOut, rIn) {
    var cg = f.createConicGradient ? f.createConicGradient(-0.6, 0, 0) : null;
    if (cg) {
      ['#8a5e12', '#ffe9a0', '#c8901e', '#fff3c4', '#9a6a14', '#f6cf68', '#7a5010', '#ffe08a', '#8a5e12'].forEach(function (c, n, a) { cg.addColorStop(n / (a.length - 1), c); });
    }
    f.save();
    f.beginPath(); f.arc(0, 0, rOut, 0, TAU); f.arc(0, 0, rIn, 0, TAU, true);
    f.fillStyle = cg || A.goldGrad(f, -rOut, -rOut, rOut, rOut); f.fill('evenodd');
    if (ART.gold) {
      f.clip('evenodd'); f.globalCompositeOperation = 'overlay'; f.globalAlpha = 0.6;
      f.drawImage(ART.gold, -rOut, -rOut, rOut * 2, rOut * 2);
      f.globalCompositeOperation = 'source-over'; f.globalAlpha = 1;
    }
    f.restore();
    // biseau : filet clair dehors, filet sombre dedans
    f.lineWidth = Math.max(1, rOut * 0.006);
    f.strokeStyle = 'rgba(255,248,210,.8)'; f.beginPath(); f.arc(0, 0, rOut - f.lineWidth * 0.5, 0, TAU); f.stroke();
    f.strokeStyle = 'rgba(40,24,2,.75)'; f.beginPath(); f.arc(0, 0, rIn + f.lineWidth * 0.5, 0, TAU); f.stroke();
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
      // reflet
      f.save(); wedge(f, i, ri, ro); f.clip();
      var sh = f.createLinearGradient(Math.cos(am - step / 2) * ro, Math.sin(am - step / 2) * ro, Math.cos(am + step / 2) * ro, Math.sin(am + step / 2) * ro);
      sh.addColorStop(0, 'rgba(255,255,255,.22)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.12)');
      f.fillStyle = sh; f.fillRect(-R, -R, 2 * R, 2 * R);
      f.restore();
      // creux : ombre intérieure + arête éclairée => les secteurs semblent gravés dans la roue
      f.save(); wedge(f, i, ri, ro); f.clip(); wedge(f, i, ri, ro);
      f.lineWidth = R * 0.024; f.strokeStyle = 'rgba(0,0,0,.26)'; f.stroke();
      f.lineWidth = R * 0.007; f.strokeStyle = 'rgba(255,240,190,.28)'; f.translate(R * 0.004, R * 0.006); wedge(f, i, ri, ro); f.stroke();
      f.restore();
      // arêtes dorées
      wedge(f, i, ri, ro); f.lineWidth = Math.max(1, R * 0.006); f.strokeStyle = 'rgba(255,214,110,.75)'; f.stroke();
      // contenu : tout est centré dans la case (axe radial) et borné par la largeur réelle du secteur
      f.save(); f.rotate(am);
      var big = M.KINDS[k].bonus || k === 'ankh', fr = I18N.decimalComma();
      if (!big && (k === 'm05' || k === 'm025')) {
        // disque solaire de Râ : à moitié (0,5×) ou aux trois dixièmes (0,3×) rempli — se lit d'un coup d'œil, sans chiffre
        var rd = Math.min(chord(RC) * 0.36, R * 0.07), fq = k === 'm05' ? 0.5 : 0.3;
        f.save(); f.rotate(Math.PI / 2); f.translate(0, -RC);
        f.beginPath(); f.arc(0, 0, rd, 0, TAU); f.fillStyle = 'rgba(0,0,0,.4)'; f.fill();
        f.shadowColor = 'rgba(0,0,0,.55)'; f.shadowBlur = 3;
        f.beginPath(); f.moveTo(0, 0); f.arc(0, 0, rd * 0.86, -Math.PI / 2, -Math.PI / 2 + TAU * fq); f.closePath(); f.fillStyle = v.tx; f.fill();
        f.beginPath(); f.arc(0, 0, rd, 0, TAU); f.lineWidth = Math.max(1.2, rd * 0.2); f.strokeStyle = v.tx; f.stroke();
        f.shadowBlur = 0; f.restore();
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
        if (k !== 'm0') { f.shadowColor = 'rgba(0,0,0,.55)'; f.shadowBlur = 3; }
        if (frac) f.fillText(lab, rc - (tr - tl) / 2, (ta - td) / 2); // le long du rayon, centré sur l'axe de la case
        else { f.rotate(Math.PI / 2); f.fillText(lab, -(tr - tl) / 2, -rc + (ta - td) / 2); }
        f.shadowBlur = 0;
        if (k === 'm0') { f.globalAlpha = 0.55; A.skullX(f, 0, -(RC - R * 0.05), Math.min(R * 0.07, chord(RC) * 0.8), v.tx); f.globalAlpha = 1; }
      } else {
        // icône (debout) vers l'extérieur, nom le long du rayon vers le centre ; l'ensemble est centré dans la case
        var isz = Math.min(chord(RC + R * 0.12) * ({ scarab: 1.35, feather: 1.6, pyramid: 1.2, ankh: 1.2 })[v.glyph], R * 0.17), nm = T.kinds[k];
        var nfs = R * 0.056; f.font = '900 ' + nfs + 'px ' + G.TITLE;
        var nlen = f.measureText(nm).width, nmax = R * 0.30; if (nlen > nmax) { nfs *= nmax / nlen; nlen = nmax; f.font = '900 ' + nfs + 'px ' + G.TITLE; }
        var gap = R * 0.025, tot = nlen + gap + isz, r1 = RC + tot / 2;      // r1 : bord extérieur de l'icône
        var iy = r1 - isz / 2, nEnd = r1 - isz - gap;                         // fin du nom (côté icône)
        f.save(); f.rotate(Math.PI / 2);
        if (v.glyph === 'ankh') A.ankh(f, 0, -iy + isz * 0.02, isz * 0.74, '#3a2706');
        else if (G.icon(f, ({ scarab: 'scarab', feather: 'weigh', pyramid: 'vault' })[v.glyph], 0, -iy, isz)) { /* logo illustré */ }
        else if (v.glyph === 'scarab') A.scarab(f, 0, -iy, isz * 0.8, '#ffd86a', 'rgba(0,0,0,.5)');
        else if (v.glyph === 'feather') A.feather(f, 0, -iy, isz * 0.9, '#4a3410', 'rgba(255,255,255,.7)');
        else if (v.glyph === 'pyramid') A.pyramid(f, 0, -iy, isz * 0.85, '#ffe9a0', 'rgba(0,0,0,.45)');
        f.restore();
        f.font = '900 ' + nfs + 'px ' + G.TITLE; f.textAlign = 'right'; f.textBaseline = 'alphabetic'; f.fillStyle = v.tx;
        var nb = f.measureText(nm); f.shadowColor = 'rgba(0,0,0,.6)'; f.shadowBlur = 3;
        f.fillText(nm, nEnd, (nb.actualBoundingBoxAscent - nb.actualBoundingBoxDescent) / 2); f.shadowBlur = 0;
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
      f.beginPath(); f.arc(rx, ry, R * 0.008, 0, TAU); f.fillStyle = '#5b4311'; f.fill();
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
        if (now - W.lastTick > 0.028) { Sfx.tick(Math.min(1, sp / 25)); W.lastTick = now; }
      }
      W.lastIdx = idx;
    }
    if (W.hl) W.hl.t += dt;
    if (W.oracle) W.oracle.t += dt;
    W.flashLamps = Math.max(0, W.flashLamps - dt);
  };

  function drawLamps(R) {
    var n = M.N, t = G.t, spin = W.mode === 'spin' ? 1 : 0;
    for (var i = 0; i < n; i++) {
      var a = i * step - Math.PI / 2 - step / 2 * 0, x = G.cx + Math.cos(a) * R * 1.035, y = G.cy + Math.sin(a) * R * 1.035;
      var lv;
      if (W.flashLamps > 0) lv = 0.5 + 0.5 * Math.sin(t * 22 + (i % 2) * Math.PI);
      else if (spin) lv = 0.5 + 0.5 * Math.sin(t * 16 - i * 0.55);
      else lv = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2.2 - i * 0.28));
      var sz = R * 0.052;
      ctx.globalAlpha = 1; ctx.drawImage(lampOff, x - sz, y - sz, sz * 2, sz * 2);
      ctx.globalAlpha = lv; ctx.drawImage(lampOn, x - sz * 1.5, y - sz * 1.5, sz * 3, sz * 3);
    }
    ctx.globalAlpha = 1;
  }

  function drawFrame(R) {
    var cx = G.cx, cy = G.cy;
    // jante extérieure fixe
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.075, 0, TAU); ctx.arc(cx, cy, R * 0.99, 0, TAU, true);
    var g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    g.addColorStop(0, '#2a1e0c'); g.addColorStop(0.3, '#120c05'); g.addColorStop(0.7, '#2a1e0c'); g.addColorStop(1, '#0c0803');
    ctx.fillStyle = g; ctx.fill('evenodd');
    ctx.lineWidth = R * 0.012;
    ctx.strokeStyle = A.goldGrad(ctx, cx - R, cy - R, cx + R, cy + R);
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.075, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.99, 0, TAU); ctx.stroke();
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
    ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = R * 0.05;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.02, 0, TAU); ctx.fillStyle = '#050304'; ctx.fill(); ctx.shadowBlur = 0;
    if (!lg) { ctx.restore(); A.jackal(ctx, cx, cy - r * 0.2, r * 0.44, { glow: clamp(0.65 + 0.35 * Math.sin(t * 2.4), 0, 1) }); return; }
    if (G.eg) { ctx.restore(); return; }        // pendant l'apparition plein écran, le socle reste vide
    var size = r * HEAD.hubSize, br = 1 + 0.005 * Math.sin(t * 1.1) + spinN * 0.004 * Math.sin(t * 7), sway = 0.004 * Math.sin(t * 0.6) + spinN * 0.004 * Math.sin(t * 4);
    var jx = 0, jy = 0;
    // aura rouge qui bat (plus vive et plus rapide pendant le tour)
    var ap = 0.5 + 0.5 * Math.sin(t * (1.4 + spinN * 1.6)), ag = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.5);
    ag.addColorStop(0, 'rgba(255,205,100,' + (0.1 + 0.06 * ap + spinN * 0.05) + ')'); ag.addColorStop(1, 'rgba(255,205,100,0)'); ctx.fillStyle = ag; ctx.fillRect(cx - r * 1.7, cy - r * 1.7, r * 3.4, r * 3.4);
    ctx.lineWidth = R * 0.022; ctx.strokeStyle = A.goldGrad(ctx, cx - r, cy - r, cx + r, cy + r); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();       // anneau doré du moyeu
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
    dl.addColorStop(0, 'rgba(255,255,255,.3)'); dl.addColorStop(0.35, 'rgba(255,255,255,.06)'); dl.addColorStop(1, 'rgba(0,0,0,.3)'); ctx.fillStyle = dl; ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  }

  function drawPointer(R) {
    var cx = G.cx, py = G.cy - R * 1.085, s = R * 0.16;
    ctx.save(); ctx.translate(cx, py); ctx.rotate(W.ptr.a);
    ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
    if (G.icon(ctx, 'pointer', 0, s * 0.18, s * 2.7)) { ctx.restore(); return; }
    ctx.beginPath(); ctx.moveTo(-s * 0.62, -s * 0.5);
    ctx.quadraticCurveTo(0, -s * 0.9, s * 0.62, -s * 0.5);
    ctx.lineTo(s * 0.34, s * 0.45); ctx.lineTo(0, s * 1.42); ctx.lineTo(-s * 0.34, s * 0.45); ctx.closePath();
    ctx.fillStyle = A.goldGrad(ctx, -s, -s, s, s * 1.4); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.lineWidth = 1.4; ctx.strokeStyle = '#4b350b'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -s * 0.1, s * 0.2, 0, TAU);
    var rg = ctx.createRadialGradient(-s * 0.05, -s * 0.15, 0, 0, -s * 0.1, s * 0.22); rg.addColorStop(0, '#ff9a8a'); rg.addColorStop(1, '#a01810');
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
    var gg = ctx.createLinearGradient(0, -fs * 0.5, 0, fs * 0.5); gg.addColorStop(0, '#fffbe0'); gg.addColorStop(0.5, '#ffd86a'); gg.addColorStop(1, '#d99a1e');
    if (!red) { ctx.shadowColor = 'rgba(255,200,60,' + (0.95 - 0.35 * p) + ')'; ctx.shadowBlur = 16 * (1.2 - 0.5 * p); }
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, fs * 0.14); ctx.strokeStyle = '#3a2000'; ctx.strokeText(lab, 0, 0);
    ctx.fillStyle = gg; ctx.fillText(lab, 0, 0);
    ctx.restore();
  }

  W.draw = function (alpha) {
    var R = G.R, cx = G.cx, cy = G.cy;
    ctx.save();
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
    if (sp > 9 && !FX.reduced && !FX.lite) {
      for (var gi = 3; gi >= 1; gi--) {
        ctx.save(); ctx.rotate(W.rot - Math.sign(W.vel || 1) * gi * Math.min(0.1, sp * 0.0045));
        ctx.globalAlpha = 0.22; ctx.drawImage(W.face, -half, -half, half * 2, half * 2); ctx.restore();
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
        ctx.lineWidth = R * 0.014; ctx.strokeStyle = 'rgba(255,241,184,' + (0.7 + pulse * 0.3) + ')'; ctx.stroke();
        // badge ×N sur la case
        var am = (i + 0.5) * step - Math.PI / 2;
        ctx.save(); ctx.rotate(am); ctx.translate(R * 0.455, 0); ctx.rotate(Math.PI / 2); ctx.scale(pop, pop);
        var br = R * 0.075;
        ctx.beginPath(); ctx.arc(0, 0, br, 0, TAU);
        var bg2 = ctx.createRadialGradient(-br * 0.3, -br * 0.3, 0, 0, 0, br); bg2.addColorStop(0, '#fffbe0'); bg2.addColorStop(1, '#d99a1e');
        ctx.fillStyle = bg2; ctx.shadowColor = 'rgba(255,200,60,.9)'; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0;
        ctx.lineWidth = 1.5; ctx.strokeStyle = '#5b4311'; ctx.stroke();
        G.txt(o.revealed ? '×' + o.boost : '?', 0, br * 0.06, { size: br * 0.95, weight: 900, fill: '#3a2000' });   // bénédiction scellée : la valeur n'est révélée qu'à l'arrêt de la roue
        ctx.restore();
        if (o.num && o.ap > 0) wheelBoostLabel(i, am, o, R, (ri + ro) / 2);
      }
    }
    if (W.hl) {
      var h = W.hl, hp = 0.5 + 0.5 * Math.sin(h.t * 9);
      wedge(ctx, h.idx, ri * 0.98, ro * 1.0);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.18 + hp * 0.3) + ')'; ctx.fill();
      ctx.lineWidth = R * 0.02; ctx.strokeStyle = 'rgba(255,248,210,' + (0.75 + hp * 0.25) + ')'; ctx.shadowColor = '#ffe58a'; ctx.shadowBlur = 24; ctx.stroke(); ctx.shadowBlur = 0;
    }
    ctx.restore();
    drawLamps(R);
    // éclat : une source de lumière fixe (qui suit la caméra) ; la roue tourne sous elle
    var la = Math.atan2(-0.8 - P.y * 0.5, -0.55 - P.x * 0.6), lx = cx + Math.cos(la) * R * 0.85, ly = cy + Math.sin(la) * R * 0.85;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R * 0.99, 0, TAU); ctx.clip();
    var gl2 = ctx.createRadialGradient(lx, ly, 0, lx, ly, R * 1.35); gl2.addColorStop(0, 'rgba(255,246,214,.26)'); gl2.addColorStop(0.45, 'rgba(255,246,214,.05)'); gl2.addColorStop(1, 'rgba(0,0,0,.3)');
    ctx.fillStyle = gl2; ctx.fillRect(cx - R, cy - R, R * 2, R * 2); ctx.restore();
    ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = R * 0.016; ctx.shadowColor = '#fff6c8'; ctx.shadowBlur = 8;
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
    Sfx.oracle(); FX.ring(G.cx, G.cy, '#ffe9a0', G.R * 1.1, 0.9); FX.flash(0.25, '#ffe9a0');
    return G.sleep(G.turbo ? 0.5 : 1.5);
  };
  W.clearOracle = function () { W.oracle = null; };
  // la roue est arrêtée : la valeur de la bénédiction (scellée avant le tour) se révèle, que la case soit atteinte ou non
  W.revealOracle = function () {
    var o = W.oracle; if (!o) return Promise.resolve();
    o.revealed = true; if (!FX.reduced) { Sfx.sparkle && Sfx.sparkle(); FX.ring(G.cx, G.cy, '#ffe9a0', G.R * 1.0, 0.6); }
    return G.sleep(G.turbo ? 0.2 : 0.55);
  };
  // la roue s'est arrêtée sur la case boostée : son chiffre est réécrit avec la valeur déjà multipliée (durée : turbo plus court, FX.reduced : fondu)
  W.applyBoost = function () {
    var o = W.oracle; if (!o || !o.num) return Promise.resolve();
    if (!FX.reduced) { Sfx.sparkle && Sfx.sparkle(); FX.ring(G.cx, G.cy, '#ffe9a0', G.R * 1.2, 0.8); }
    return G.tween(G.turbo ? 0.35 : FX.reduced ? 0.4 : 0.9, function (u) { o.ap = u; }, null).then(function () { o.ap = 1; });
  };
  W.clearHighlight = function () { W.hl = null; };

  W.spinTo = function (spin) {
    var off = 0.2 + Math.random() * 0.6, target = -(spin.index + off) * step;
    var turns = G.turbo ? 3 : 6, dur = G.ultra ? 2 : G.turbo ? 2.5 : 6.2;
    W.hl = null; W.mode = 'spin'; W.spinning = true;
    Sfx.whoosh();
    var wind = G.turbo ? Promise.resolve() : G.tween(0.5, function (u) { var e = G.ease.inOut(u); W.vel = 0; W.rot = W.r0 - 0.2 * e; }, null);
    W.r0 = W.rot;
    return wind.then(function () {
      var rot0 = W.rot, delta = mod(target - rot0, TAU) + turns * TAU, prev = rot0, prevT = G.t;
      return G.tween(dur, function (u) {
        var e = 1 - Math.pow(1 - u, 3.6);
        var nr = rot0 + delta * e, dtf = Math.max(1 / 240, G.t - prevT);
        W.vel = (nr - prev) / dtf; prev = nr; prevT = G.t; W.rot = nr;
      }, null);
    }).then(function () {
      W.rot = mod(W.rot, TAU); W.vel = 0; W.mode = 'idle'; W.spinning = false;
      W.ptr.v -= 3; Sfx.drum(0.3);
      W.hl = { idx: spin.index, t: 0 };
      var cell = M.LAYOUT[spin.index];
      if (!M.KINDS[cell].bonus) FX.spark(G.cx, G.cy - G.R * 0.9, 14, '#ffe9a0', 220, 0.7);
      return G.sleep(0.25);
    });
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
    if (!G.icon(ctx, name, 0, 0, size)) { ctx.fillStyle = '#ffd86a'; ctx.beginPath(); ctx.arc(0, 0, size * 0.2, 0, TAU); ctx.fill(); }
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
    if (k === 'vault' && u > 0.48 && !e.step) { e.step = 1; FX.coins(G.cx, G.h * 0.5, 46, 1000, 160); FX.flash(0.4, '#ffd86a'); FX.shake(12, 0.6); }
    if (k === 'weigh' && !e.beat1 && u > 0.55) { e.beat1 = 1; FX.ring(G.cx, G.h * 0.55, '#fff4d0', G.R * 0.9, 0.8); FX.shake(8, 0.4); }
    if (k === 'scarab' && !e.step && u > 0.3) { e.step = 1; FX.shake(10, 0.8); FX.dust && FX.dust(G.cx, G.cy + G.R * 0.4, 16, '#ffd86a'); }
    if (k === 'crypt' && !e.step && u > 0.3) { e.step = 1; FX.shake(10, 0.9); FX.flash(0.3, '#9a7bff'); }
    if (k === 'hand' && u > 0.3 && !e.step) { e.step = 1; FX.shake(14, 1.0); }
    if (u > 0.72 && !e.flashed) {
      e.flashed = true; var fc = { hand: '#ff3a2a', scarab: '#5cf0c0', weigh: '#fff4d0', vault: '#ffd86a', crypt: '#9a7bff' }[k] || '#fff';
      FX.flash(0.7, fc); FX.shake(k === 'hand' || k === 'crypt' ? 22 : 14, 0.7); if (k === 'hand') { FX.spark(G.cx, G.cy, 110, '#ffd86a', 700); FX.spark(G.cx, G.cy, 50, '#ff4a2a', 520); } FX.ring(G.cx, G.cy, fc, G.R * 1.4, 0.9); if (Sfx.thud) Sfx.thud();
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
      ctx.shadowColor = 'rgba(' + st.glow + ',.85)'; ctx.shadowBlur = 30 + 50 * grow;
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
    ['#ffd86a', '#fff1b8', 'rgba(230,185,74,.6)'], ['#ffd86a', '#fff1b8', 'rgba(255,216,106,.75)'],
    ['#6ff0dd', '#ffd86a', 'rgba(111,240,221,.8)'], ['#ffd86a', '#6ff0dd', 'rgba(255,216,106,.9)'], ['#fff1b8', '#c28bff', 'rgba(194,139,255,.9)']
  ];
  function winFit(str, size, maxW, num) {   // réduit la taille pour que le texte tienne dans maxW
    ctx.font = num ? '700 ' + size * 1.14 + 'px ' + G.NUM : '900 ' + size + 'px Cinzel, serif';
    var m = ctx.measureText(str).width; return m > maxW ? size * maxW / m : size;
  }
  G.showBigWin = function (mult, amount, tier) {
    tier = clamp(tier | 0, 0, 4);
    return new Promise(function (res) {
      var T = I18N.t(), k = G.ultra ? 3.5 : G.turbo ? 1.8 : 1;
      G.winOv = { t: 0, k: k, mult: mult, amount: amount, tier: tier, W: WT[tier], count: 0, p: 0, done: false, closing: 0, res: res, title: T.tiers[tier], ev: { rings: 0 }, acc: 0, t0: tier ? 0.6 : 0.25, nextWave: 0.9, nextSp: 0.5, nextFl: 1.2, ringN: 0 };
      if (tier === 0) {
        Sfx.chime(mult); if (G.wheel) G.wheel.flashLamps = 1;
        FX.ring(G.cx, G.cy, '#ffe9a0', G.R * 1.15, 0.9); FX.spark(G.cx, G.cy, 22, '#ffd86a', 360);
        FX.coins(G.cx, G.cy + G.R * 0.35, 8, 800, 60);
      } else {
        Sfx.fanfare(tier);
        if (tier >= 2 && Sfx.rise) Sfx.rise(tier, WT[tier].cd / k);
        FX.flash(0.3 + tier * 0.1, '#ffe9a0'); FX.shake(6 + tier * 3, 0.5);
        FX.coins(G.cx, G.cy + G.R * 0.4, 18 + tier * 8, 1100, 80);
      }
    });
  };
  function winLand(o) {
    o.done = true; o.doneAt = o.t; o.count = o.amount; o.p = 1;
    var t = o.tier, W = o.W;
    FX.ring(G.cx, G.cy, '#ffe9a0', G.R * (t ? 1.3 : 1.1), 0.9);
    if (t > 0) {
      Sfx.thud(); Sfx.winLand && Sfx.winLand(t);
      FX.shake(6 + t * 3, 0.45); FX.flash(0.2 + t * 0.07, WC[t][0]);
      FX.coins(G.cx, G.cy + G.R * 0.4, W.coins, 1150, 100);
      FX.spark(G.cx, G.cy - Math.min(G.w, G.h) * 0.2, 14 + t * 8, WC[t][0], 420);
    } else { FX.spark(G.cx, G.cy, 16, '#ffe9a0', 300); FX.coins(G.cx, G.cy + G.R * 0.3, W.coins, 900, 60); }
  }
  function updateWinOv(dt) {
    var o = G.winOv; if (!o) return;
    var t = o.tier, W = o.W, R = FX.reduced, w = G.w, u = Math.min(w, G.h), sdt = dt * o.k, prev = o.count;
    o.t += sdt;
    if (!o.done) {
      var q = clamp((o.t - o.t0) / W.cd, 0, 1);
      o.p = 1 - Math.pow(1 - q, 3.2);                           // décompte : rapide au début, très lent à la fin
      o.count = q >= 1 ? o.amount : o.p * o.amount;
      if (q >= 1) winLand(o);
      else {
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
        if (t >= 2 && o.t > o.nextWave) { o.nextWave += t >= 3 ? 1.0 : 1.5; FX.ring(cx, G.cy, c[o.ringN++ % 2], Math.max(w, G.h) * 0.6, 1.1); if (t >= 3) FX.coins(cx, G.cy + G.R * 0.5, 14, 1000, w * 0.4); }
        if (t === 4 && o.t > o.nextFl) { o.nextFl += 1.3; FX.flash(0.22, '#e8d8ff'); }
      } else if (t >= 3 && o.ev.rings < 3 && o.t - o.doneAt > 0.3 * (o.ev.rings + 1)) { o.ev.rings++; FX.ring(cx, G.cy, c[o.ev.rings % 2], Math.max(w, G.h) * (0.5 + 0.15 * o.ev.rings), 1.0); }
    }
    if (o.done && !o.closing && o.t - o.doneAt > W.hold) o.closing = 0.0001;
    if (!o.closing && o.t > W.cd + W.hold + 14) { if (!o.done) winLand(o); o.closing = 0.0001; }   // sécurité : jamais de blocage
    if (o.closing) { o.closing += sdt * 2.5; if (o.closing >= 1) { var r = o.res; G.winOv = null; r(); } }
  }
  G.skipWinOv = function () {
    var o = G.winOv; if (!o) return false;
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
    /* --- WIN : bandeau élégant sur la roue, sans assombrir tout l'écran --- */
    if (t === 0) {
      var bh = u * 0.25, sl = G.ease.out3(clamp(tt / 0.3, 0, 1)), pul = 0.75 + 0.25 * Math.sin(tt * 6);
      var gl0 = ctx.createRadialGradient(cx, cy, 0, cx, cy, G.R * 1.2); gl0.addColorStop(0, A.rgba('#ffd86a', 0.32 * pul * sl)); gl0.addColorStop(1, 'rgba(255,216,106,0)');
      ctx.fillStyle = gl0; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1, sl);
      var bg = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
      bg.addColorStop(0, 'rgba(6,5,3,0)'); bg.addColorStop(0.16, 'rgba(6,5,3,.86)'); bg.addColorStop(0.84, 'rgba(6,5,3,.86)'); bg.addColorStop(1, 'rgba(6,5,3,0)');
      ctx.fillStyle = bg; ctx.fillRect(-w / 2, -bh / 2, w, bh);
      var ln = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
      ln.addColorStop(0, 'rgba(255,216,106,0)'); ln.addColorStop(0.2, '#ffd86a'); ln.addColorStop(0.5, '#fff1b8'); ln.addColorStop(0.8, '#ffd86a'); ln.addColorStop(1, 'rgba(255,216,106,0)');
      ctx.fillStyle = ln; ctx.fillRect(-w / 2, -bh / 2, w, 2); ctx.fillRect(-w / 2, bh / 2 - 2, w, 2);
      [-1, 1].forEach(function (sd) {   // losanges turquoise aux extrémités
        var dx = sd * (w * 0.5 - u * 0.12 - 6 * Math.sin(tt * 3)); ctx.save(); ctx.translate(dx, 0); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#6ff0dd'; ctx.globalAlpha = a * 0.8; ctx.fillRect(-5, -5, 10, 10); ctx.restore();
      });
      if (!R) { ctx.globalCompositeOperation = 'lighter'; var sx = (tt * 1.4 % 2 - 0.5) * w, sg = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0); sg.addColorStop(0, 'rgba(255,241,184,0)'); sg.addColorStop(0.5, 'rgba(255,241,184,.22)'); sg.addColorStop(1, 'rgba(255,241,184,0)'); ctx.fillStyle = sg; ctx.fillRect(-w / 2, -bh / 2, w, bh); }
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
    var gr = u * (0.55 + 0.08 * t) * (1 + 0.04 * Math.sin(tt * 4)), gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
    gl.addColorStop(0, A.rgba(t === 2 ? '#6ff0dd' : t === 4 ? '#c28bff' : '#ffd86a', 0.3 + 0.04 * t)); gl.addColorStop(1, 'rgba(255,216,106,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h);
    /* --- MEGA / DIVIN : Anubis surgit derrière le titre --- */
    if (t >= 3 && ART.medal) {
      var mr = G.ease.outBack(clamp((tt - 0.15) / 0.9, 0, 1)), ms = Math.min(u * (t === 4 ? 1.05 : 0.92), vb * 0.9) * mr, my = cy - u * 0.02 + (1 - mr) * u * 0.3, ma = 0.36 * clamp((tt - 0.1) / 0.6, 0, 1) * (1 + 0.1 * Math.sin(tt * 3));
      var ha = ctx.createRadialGradient(cx, my, ms * 0.2, cx, my, ms * 0.85); ha.addColorStop(0, A.rgba(t === 4 ? '#c28bff' : '#6ff0dd', 0.9 * ma)); ha.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ha; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.translate(cx, my); ctx.globalAlpha = a * clamp(ma, 0, 1);
      ctx.shadowColor = c[2]; ctx.shadowBlur = 50; ctx.beginPath(); ctx.arc(0, 0, ms * 0.49, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); ctx.shadowBlur = 0;
      ctx.save(); ctx.clip(); ctx.drawImage(ART.medal, -ms / 2, -ms / 2, ms, ms); ctx.restore();
      ctx.lineWidth = 3; ctx.strokeStyle = '#ffd86a'; ctx.setLineDash([ms * 0.03, ms * 0.02]); ctx.lineDashOffset = -tt * 20; ctx.beginPath(); ctx.arc(0, 0, ms * 0.5, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
    }
    /* --- MEGA / DIVIN : vagues d'or qui montent --- */
    if (t >= 3 && !R) {
      for (j = 0; j < 3; j++) {
        var base = vb - h * (0.05 + 0.05 * p) * (1 + j * 0.7) - (t === 4 ? 14 : 0), amp2 = (10 + 7 * j) * (0.5 + p);
        ctx.beginPath(); ctx.moveTo(0, h);
        for (i = 0; i <= 24; i++) { var xx = w * i / 24; ctx.lineTo(xx, base + Math.sin(xx * 0.011 * (1 + j * 0.35) + tt * (1.5 + j * 0.6)) * amp2); }
        ctx.lineTo(w, h); ctx.closePath();
        var wg = ctx.createLinearGradient(0, base - amp2, 0, h); wg.addColorStop(0, 'rgba(255,216,106,' + (0.42 - 0.1 * j) * inn + ')'); wg.addColorStop(1, 'rgba(184,134,30,.05)');
        ctx.fillStyle = wg; ctx.fill();
      }
    }
    /* --- gardiens (grand écran) --- */
    var hs = u * 0.11 * G.ease.outBack(clamp(tt / 0.6, 0, 1));
    // médaillons latéraux : repoussés vers les bords et rétrécis pour ne jamais masquer le titre ni le montant ; absents si la place manque
    var gsz = winFit(amtMax, Math.min(w * 0.15, u * 0.17) * (1 + 0.05 * t), w * 0.9, true);
    ctx.font = '700 ' + gsz * 1.14 + 'px ' + G.NUM; var gHalf = ctx.measureText(amtMax).width / 2 + 10;
    var gms = Math.min(hs * 3.4, w / 2 - gHalf - 8), gx = w / 2 - gms / 2 - 6;
    if (w > 640 && t >= 2 && gms > u * 0.2) [-1, 1].forEach(function (sd) {
      if (ART.medal) { var ms2 = gms; ctx.save(); ctx.translate(cx + sd * gx, cy - u * 0.02); ctx.rotate(sd * Math.sin(tt * 1.5) * 0.04); ctx.shadowColor = c[0]; ctx.shadowBlur = 40; ctx.beginPath(); ctx.arc(0, 0, ms2 * 0.49, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); ctx.shadowBlur = 0; ctx.clip(); ctx.drawImage(ART.medal, -ms2 / 2, -ms2 / 2, ms2, ms2); ctx.restore(); }
      else A.jackal(ctx, cx + sd * gx, cy - u * 0.02, hs * 1.5, { glow: 1 });
    });
    /* --- titre : choc d'arrivée (zoom arrière), puis respiration, puis pulsation à l'arrivée du total --- */
    var ty = cy - u * 0.2, lines = (w < 640 && o.title.indexOf(' ') > 0 && o.title.length > 10) ? o.title.split(' ') : [o.title];
    var bsz = u * (0.105 + 0.006 * t), tsz2 = bsz;
    lines.forEach(function (s) { tsz2 = Math.min(tsz2, winFit(s, bsz, w * 0.88, false)); });
    var slam = R ? 1 : 1 + 1.9 * (1 - G.ease.out5(clamp((tt - 0.05) / 0.32, 0, 1)));
    var tpul = 1 + (R ? 0 : 0.014 * Math.sin(tt * 3.2)) + (d >= 0 && !R ? 0.1 * Math.exp(-d * 4) * Math.cos(d * 12) : 0);
    var tal = clamp((tt - 0.05) / 0.12, 0, 1);
    ctx.save(); ctx.globalAlpha = a * tal; ctx.translate(cx, ty); ctx.scale(slam * tpul, slam * tpul);
    lines.forEach(function (s, li) { G.goldText(s, 0, (li - (lines.length - 1) / 2) * tsz2 * 1.05, tsz2, { spacing: 2, blur: 26 + t * 6, shadow: c[2] }); });
    ctx.restore();
    /* --- montant : défile, ralentit, puis rebondit à l'arrivée --- */
    var asz2 = winFit(amtMax, Math.min(w * 0.15, u * 0.17) * (1 + 0.05 * t), w * 0.9, true);
    var ns = d >= 0 ? 1 + 0.24 * Math.exp(-d * 4.5) * Math.cos(d * 13) : 1 + 0.018 * Math.sin(tt * 30);
    var ay = cy + u * 0.06 + (lines.length - 1) * tsz2 * 0.5;
    ctx.save(); ctx.translate(cx, ay); ctx.scale(ns, ns); G.goldText(amt, 0, 0, asz2, { blur: 40, shadow: c[2] }); ctx.restore();
    G.txt('×' + G.fmt(o.mult), cx, ay + u * 0.14, { size: Math.min(w * 0.05, u * 0.06), fill: '#fff1b8', stroke: '#2a1a02', shadow: 'rgba(255,200,60,.6)' });
    if (o.done && !o.closing) G.txt(T.tapSkip, cx, Math.min(ay + u * 0.24, vb - 22), { size: 13, family: G.TEXT, weight: 700, fill: 'rgba(255,241,184,' + (0.45 + 0.35 * Math.sin(tt * 4)) + ')', spacing: 3 });
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
      FX.update(h);
    }
    updateWinOv(dt);
    updateEmerge(sdt);
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
