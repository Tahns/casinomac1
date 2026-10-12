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
  // chiffres : police condensée à chiffres alignés (Cinzel a des chiffres elzéviriens, peu lisibles)
  G.NUM = "Oswald, 'Cinzel', serif";
  var isNum = G.isNum = function (s) { return /^[+×x\d\s.,\u00a0\u202f]+$/.test(String(s)) && /\d/.test(String(s)); };
  G.txt = function (s, x, y, o) {
    o = o || {};
    var num = !o.family && isNum(s);
    ctx.font = (num ? 700 : (o.weight || 800)) + ' ' + (o.size || 20) * (num ? 1.14 : 1) + 'px ' + (num ? G.NUM : (o.family || 'Cinzel, serif'));
    ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
    if (o.spacing && ctx.letterSpacing !== undefined) ctx.letterSpacing = o.spacing + 'px';
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
    return n.toLocaleString(I18N.lang() === 'fr' ? 'fr-FR' : 'en-US', { minimumFractionDigits: a % 1 ? 2 : 0, maximumFractionDigits: 2 });
  };

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
    var topH = land ? 38 : G.w < 760 ? 52 : 62;
    var availH = G.h - hudH - topH - (land ? 12 : 38);
    var R = Math.min(G.w * 0.455, availH * 0.5) / 1.1;
    if (G.w < 760 && !land) R = Math.min(G.w * 0.46 / 1.08, availH * 0.5 / 1.08);
    G.R = Math.max(land ? 60 : 90, R);
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
  Object.keys(window.HOA_IMG || {}).forEach(function (k) {
    var im = new Image(); im.onload = function () { ART[k] = im; if (k === 'key' && G.w) buildBackdrop(); if ((k === 'gold' || k.indexOf('ic_') === 0) && G.w && W.build) W.build(); }; im.src = window.HOA_IMG[k];
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
    var w = G.w, h = G.h, dpr = G.dpr;
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

  function drawBackdrop(dim, img) {
    var w = G.w, h = G.h, t = G.t;
    ctx.drawImage(bg, 0, 0, w, h);
    if (img && ART[img]) { ctx.globalAlpha = Math.min(1, dim * 1.2 + 0.2); cover(ctx, ART[img], w, h); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(0, 0, w, h); }
    // rayons rotatifs derrière la roue
    A.rays(ctx, G.cx, G.cy, Math.max(w, h) * 0.9, 16, t * 0.05, '#ffd86a', 0.05 * (1 - dim * 0.6));
    var gl = ctx.createRadialGradient(G.cx, G.cy, G.R * 0.4, G.cx, G.cy, G.R * 1.9);
    gl.addColorStop(0, 'rgba(255,200,90,' + 0.20 * (1 - dim * 0.5) + ')'); gl.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h);
    // braseros + yeux des gardiens
    if (G.guard) {
      [-1, 1].forEach(function (sd) {
        var x = G.cx + sd * G.guard.x, fl = 0.85 + Math.sin(t * 9 + sd) * 0.1 + Math.sin(t * 23) * 0.05, bw = G.R * 0.16;
        var fg = ctx.createRadialGradient(x, G.guard.bowlY - bw * 0.7, 0, x, G.guard.bowlY - bw * 0.7, bw * 2.4 * fl);
        fg.addColorStop(0, 'rgba(255,240,170,.95)'); fg.addColorStop(0.3, 'rgba(255,170,50,.55)'); fg.addColorStop(1, 'rgba(255,100,20,0)');
        ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(x, G.guard.bowlY - bw * 0.7, bw * 2.4 * fl, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,225,120,.95)';
        ctx.beginPath(); ctx.moveTo(x - bw * 0.5, G.guard.bowlY); ctx.quadraticCurveTo(x - bw * 0.4, G.guard.bowlY - bw * 1.7 * fl, x + Math.sin(t * 7 + sd) * bw * 0.2, G.guard.bowlY - bw * 2.1 * fl);
        ctx.quadraticCurveTo(x + bw * 0.5, G.guard.bowlY - bw * 1.5 * fl, x + bw * 0.5, G.guard.bowlY); ctx.fill();
        var s = G.guard.s, ey = G.guard.top - G.R * 0.22 + s * 0.1;
        [-1, 1].forEach(function (e) {
          var ex = x + e * s * 0.31, p = 0.55 + 0.45 * Math.sin(t * 2.2 + sd);
          var eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, s * 0.28);
          eg.addColorStop(0, 'rgba(255,255,255,' + p + ')'); eg.addColorStop(0.3, 'rgba(111,240,221,' + p + ')'); eg.addColorStop(1, 'rgba(24,181,164,0)');
          ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ex, ey, s * 0.28, 0, TAU); ctx.fill();
        });
      });
    }
    // brume : deux nappes qui dérivent à des profondeurs différentes
    if (!FX.lite) [[0.0, 0.62, 0.9, 26], [0.5, 0.78, 0.7, -42]].forEach(function (fg, n) {
      var fx = ((t * 0.012 * (n ? -1 : 1) + fg[0]) % 1) * w * 1.6 - w * 0.3 + G.par.x * fg[3], fy = h * fg[1];
      var fgr = ctx.createRadialGradient(fx, fy, 0, fx, fy, w * 0.45); fgr.addColorStop(0, 'rgba(255,214,140,' + 0.07 * fg[2] + ')'); fgr.addColorStop(1, 'rgba(255,214,140,0)');
      ctx.save(); ctx.translate(0, fy); ctx.scale(1, 0.35); ctx.translate(0, -fy); ctx.fillStyle = fgr; ctx.fillRect(0, 0, w, h * 2.2); ctx.restore();
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
    var vg1 = ctx.createLinearGradient(0, 0, 0, h * 0.6); vg1.addColorStop(0, 'rgba(96,34,170,' + 0.34 * (1 - dim * 0.4) + ')'); vg1.addColorStop(1, 'rgba(96,34,170,0)');
    ctx.fillStyle = vg1; ctx.fillRect(0, 0, w, h);
    var tg = ctx.createRadialGradient(G.cx, h * 1.02, 0, G.cx, h * 1.02, Math.max(w, h) * 0.55); tg.addColorStop(0, 'rgba(32,210,190,' + 0.09 * fk + ')'); tg.addColorStop(1, 'rgba(32,210,190,0)');
    ctx.fillStyle = tg; ctx.fillRect(0, 0, w, h);
    ctx.restore();
    if (!FX.lite) {
      for (var ej = 0; ej < embers.length; ej++) {
        var em = embers[ej], ey = (1 - mod(em.y + t * em.v, 1)) * h, ex = (em.x + Math.sin(t * 0.5 + em.p) * 0.03) * w + G.par.x * em.s * 14, ea = Math.sin(Math.PI * (1 - ey / h)) * (0.35 + 0.35 * Math.sin(t * 2 + em.p));
        ctx.globalAlpha = Math.max(0, ea); ctx.fillStyle = em.teal ? '#6ff0dd' : '#ffb347';
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(ex, ey, em.s, 0, TAU); ctx.fill();
      }
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }
    var vv = ctx.createRadialGradient(w / 2, h * 0.5, Math.min(w, h) * 0.35, w / 2, h * 0.5, Math.max(w, h) * 0.8); vv.addColorStop(0, 'rgba(18,6,36,0)'); vv.addColorStop(1, 'rgba(34,10,70,.55)');
    ctx.fillStyle = vv; ctx.fillRect(0, 0, w, h);
    if (dim) { ctx.fillStyle = 'rgba(0,0,0,' + dim + ')'; ctx.fillRect(0, 0, w, h); }
  }
  G.drawBackdrop = drawBackdrop;

  /* ============================== LA ROUE ============================== */
  var VIS = {
    m0:    { c: ['#2c241b', '#14100b'], tx: '#8d7c60', glyph: 'dust' },
    m025:  { c: ['#7c6038', '#3d2c17'], tx: '#fff6e0' },
    m05:   { c: ['#a67c3d', '#5f4220'], tx: '#fff1c8' },
    m1:    { c: ['#3e74e8', '#183a8c'], tx: '#ffffff' },
    m2:    { c: ['#22d3be', '#0b7c70'], tx: '#032b26' },
    m3:    { c: ['#35d98c', '#106b42'], tx: '#032616' },
    ankh:  { c: ['#ffe9a0', '#b4861f'], tx: '#3a2706', glyph: 'ankh' },
    scarab:{ c: ['#f0604a', '#8a1b10'], tx: '#fff1d8', glyph: 'scarab' },
    weigh: { c: ['#fffbe8', '#cfae62'], tx: '#4a3410', glyph: 'feather' },
    vault: { c: ['#b36ae8', '#4b1d75'], tx: '#fff0ff', glyph: 'pyramid' }
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
      sh.addColorStop(0, 'rgba(255,255,255,.18)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.25)');
      f.fillStyle = sh; f.fillRect(-R, -R, 2 * R, 2 * R);
      f.restore();
      // creux : ombre intérieure + arête éclairée => les secteurs semblent gravés dans la roue
      f.save(); wedge(f, i, ri, ro); f.clip(); wedge(f, i, ri, ro);
      f.lineWidth = R * 0.028; f.strokeStyle = 'rgba(0,0,0,.38)'; f.stroke();
      f.lineWidth = R * 0.007; f.strokeStyle = 'rgba(255,240,190,.28)'; f.translate(R * 0.004, R * 0.006); wedge(f, i, ri, ro); f.stroke();
      f.restore();
      // arêtes dorées
      wedge(f, i, ri, ro); f.lineWidth = Math.max(1, R * 0.006); f.strokeStyle = 'rgba(255,214,110,.75)'; f.stroke();
      // contenu : tout est centré dans la case (axe radial) et borné par la largeur réelle du secteur
      f.save(); f.rotate(am);
      var big = M.KINDS[k].bonus || k === 'ankh', fr = I18N.lang() === 'fr';
      if (!big && (k === 'm05' || k === 'm025')) {
        // disque solaire de Râ : à moitié (0,5×) ou au quart (0,25×) rempli — se lit d'un coup d'œil, sans chiffre
        var rd = Math.min(chord(RC) * 0.36, R * 0.07), fq = k === 'm05' ? 0.5 : 0.25;
        f.save(); f.rotate(Math.PI / 2); f.translate(0, -RC);
        f.beginPath(); f.arc(0, 0, rd, 0, TAU); f.fillStyle = 'rgba(0,0,0,.4)'; f.fill();
        f.shadowColor = 'rgba(0,0,0,.55)'; f.shadowBlur = 3;
        f.beginPath(); f.moveTo(0, 0); f.arc(0, 0, rd * 0.86, -Math.PI / 2, -Math.PI / 2 + TAU * fq); f.closePath(); f.fillStyle = v.tx; f.fill();
        f.beginPath(); f.arc(0, 0, rd, 0, TAU); f.lineWidth = Math.max(1.2, rd * 0.2); f.strokeStyle = v.tx; f.stroke();
        f.shadowBlur = 0; f.restore();
      } else if (!big) {
        var lab = k === 'm0' ? '0' : ({ m025: fr ? '0,25' : '0.25', m05: fr ? '0,5' : '0.5', m1: '1', m2: '2', m3: '3' })[k];
        var frac = k === 'm025' || k === 'm05';
        // fractions : écrites le long du rayon (assez de place pour « 0,25 »), entiers : debout comme les logos
        var fs = R * (k === 'm0' ? 0.1 : frac ? 0.12 : 0.15);
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
        var nfs = R * 0.056; f.font = '900 ' + nfs + 'px Cinzel, serif';
        var nlen = f.measureText(nm).width, nmax = R * 0.30; if (nlen > nmax) { nfs *= nmax / nlen; nlen = nmax; f.font = '900 ' + nfs + 'px Cinzel, serif'; }
        var gap = R * 0.025, tot = nlen + gap + isz, r1 = RC + tot / 2;      // r1 : bord extérieur de l'icône
        var iy = r1 - isz / 2, nEnd = r1 - isz - gap;                         // fin du nom (côté icône)
        f.save(); f.rotate(Math.PI / 2);
        if (v.glyph === 'ankh') A.ankh(f, 0, -iy + isz * 0.02, isz * 0.74, '#3a2706');
        else if (G.icon(f, ({ scarab: 'scarab', feather: 'weigh', pyramid: 'vault' })[v.glyph], 0, -iy, isz)) { /* logo illustré */ }
        else if (v.glyph === 'scarab') A.scarab(f, 0, -iy, isz * 0.8, '#ffd86a', 'rgba(0,0,0,.5)');
        else if (v.glyph === 'feather') A.feather(f, 0, -iy, isz * 0.9, '#4a3410', 'rgba(255,255,255,.7)');
        else if (v.glyph === 'pyramid') A.pyramid(f, 0, -iy, isz * 0.85, '#ffe9a0', 'rgba(0,0,0,.45)');
        f.restore();
        f.font = '900 ' + nfs + 'px Cinzel, serif'; f.textAlign = 'right'; f.textBaseline = 'alphabetic'; f.fillStyle = v.tx;
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

  function drawHub(R) {
    var cx = G.cx, cy = G.cy, r = R * 0.285;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = R * 0.05;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU);
    var g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.4, 0, cx, cy, r);
    g.addColorStop(0, '#2a2118'); g.addColorStop(1, '#070504'); ctx.fillStyle = g; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = R * 0.022; ctx.strokeStyle = A.goldGrad(ctx, cx - r, cy - r, cx + r, cy + r); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.88, 0, TAU); ctx.clip();
    var pulse = 0.65 + 0.35 * Math.sin(G.t * 2.4) + (W.mode === 'spin' ? 0.2 : 0);
    if (ART.medal) {
      ctx.drawImage(ART.medal, cx - r * 0.9, cy - r * 0.9, r * 1.8, r * 1.8);
      var eg = ctx.createRadialGradient(cx, cy - r * 0.08, 0, cx, cy - r * 0.08, r * 0.5);
      eg.addColorStop(0, 'rgba(111,240,221,' + 0.16 * clamp(pulse, 0, 1.2) + ')'); eg.addColorStop(1, 'rgba(111,240,221,0)');
      ctx.fillStyle = eg; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    } else A.jackal(ctx, cx, cy - r * 0.2, r * 0.44, { glow: clamp(pulse, 0, 1) });
    // dôme de verre : reflet qui suit la lumière
    var dl = ctx.createRadialGradient(cx - r * 0.35 - P.x * r * 0.12, cy - r * 0.45 - P.y * r * 0.1, 0, cx - r * 0.2, cy - r * 0.25, r * 1.1);
    dl.addColorStop(0, 'rgba(255,255,255,.34)'); dl.addColorStop(0.35, 'rgba(255,255,255,.07)'); dl.addColorStop(1, 'rgba(0,0,0,.28)');
    ctx.fillStyle = dl; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
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
        G.txt('×' + o.boost, 0, br * 0.06, { size: br * 0.95, weight: 900, fill: '#3a2000' });
        ctx.restore();
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
    W.oracle = { kind: o.kind, boost: o.boost, t: 0 };
    Sfx.oracle(); FX.ring(G.cx, G.cy, '#ffe9a0', G.R * 1.1, 0.9); FX.flash(0.25, '#ffe9a0');
    return G.sleep(G.turbo ? 0.5 : 1.5);
  };
  W.clearOracle = function () { W.oracle = null; };
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

  /* ======== ANUBIS SURGIT DU CENTRE DE LA ROUE (gros bonus) : le médaillon grandit vers l'écran, yeux rouges ======== */
  G.emerge = function () {
    return new Promise(function (res) {
      if (!ART.medal || FX.reduced) { res(); return; }
      G.eg = { t: 0, dur: 2.7, res: res, flashed: false, growled: false };
      if (Sfx.anubisRise) Sfx.anubisRise();
      FX.shake(6, 0.6);
    });
  };
  function updateEmerge(sdt) {
    var e = G.eg; if (!e) return;
    e.t += sdt; var u = e.t / e.dur;
    if (u > 0.3 && !e.growled) { e.growled = true; FX.shake(14, 1.0); }
    if (u > 0.72 && !e.flashed) { e.flashed = true; FX.flash(0.7, '#ff3a2a'); FX.shake(22, 0.7); FX.ring(G.cx, G.cy, '#ff5a3a', G.R * 1.4, 0.9); if (Sfx.thud) Sfx.thud(); }
    if (e.t >= e.dur) { var r = e.res; G.eg = null; r(); }
  }
  function drawEmerge() {
    var e = G.eg; if (!e || !ART.medal) return;
    var u = clamp(e.t / e.dur, 0, 1), W_ = G.w, H_ = G.h, cx = G.cx, cy = G.cy;
    var grow = G.ease.inOut(clamp((u - 0.08) / 0.62, 0, 1)), s0 = G.R * 0.36, s1 = Math.min(W_ * 1.15, H_ * 1.05);
    var size = s0 + (s1 - s0) * grow, py = cy + (H_ * 0.46 - cy) * grow * 0.0 + (G.h * 0.5 - cy) * grow;      // glisse vers le centre de l'écran
    var fadeOut = clamp((u - 0.86) / 0.14, 0, 1), dark = clamp(u / 0.3, 0, 1) * 0.72 * (1 - fadeOut);
    var jit = (u > 0.25 ? (Math.random() - 0.5) * (2 + 8 * grow) : 0);
    // 1) pénombre rouge
    ctx.save(); ctx.fillStyle = 'rgba(8,0,0,' + dark + ')'; ctx.fillRect(0, 0, W_, H_);
    var rg = ctx.createRadialGradient(cx, py, size * 0.05, cx, py, Math.max(W_, H_) * 0.7);
    rg.addColorStop(0, 'rgba(255,40,20,' + (0.5 * grow * (1 - fadeOut)) + ')'); rg.addColorStop(1, 'rgba(120,0,0,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W_, H_); ctx.restore();
    // 2) médaillon qui sort du centre (anneau sombre derrière pour le détacher de la roue)
    ctx.save(); ctx.globalAlpha = (1 - fadeOut); ctx.translate(cx + jit, py + jit * 0.6); ctx.rotate(Math.sin(e.t * 9) * 0.006 * grow);
    ctx.shadowColor = 'rgba(255,40,20,.85)'; ctx.shadowBlur = 30 + 50 * grow;
    ctx.beginPath(); ctx.arc(0, 0, size * 0.49, 0, TAU); ctx.fillStyle = '#050102'; ctx.fill(); ctx.shadowBlur = 0;
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, size * 0.49, 0, TAU); ctx.clip(); ctx.drawImage(ART.medal, -size / 2, -size / 2, size, size);
    // 3) yeux rouges : on éteint le turquoise puis on allume deux braises
    var eyes = [[-0.061, -0.066], [0.07, -0.066]], pw = clamp((u - 0.22) / 0.3, 0, 1), pulse = 0.75 + 0.25 * Math.sin(e.t * 14);
    ctx.globalCompositeOperation = 'source-over';
    eyes.forEach(function (p, i) {
      var ex = p[0] * size, ey = p[1] * size, ew = size * 0.05, eh = size * 0.02;
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(i ? -0.18 : 0.18);
      ctx.fillStyle = 'rgba(25,0,0,' + (0.85 * pw) + ')'; ctx.beginPath(); ctx.ellipse(0, 0, ew * 1.1, eh * 1.5, 0, 0, TAU); ctx.fill();
      ctx.restore();
    });
    ctx.globalCompositeOperation = 'lighter';
    eyes.forEach(function (p, i) {
      var ex = p[0] * size, ey = p[1] * size, ew = size * 0.05, eh = size * 0.02;
      var hg = ctx.createRadialGradient(ex, ey, 0, ex, ey, size * 0.2 * pw * pulse); hg.addColorStop(0, 'rgba(255,60,30,' + (0.75 * pw) + ')'); hg.addColorStop(0.35, 'rgba(255,20,10,' + (0.3 * pw) + ')'); hg.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(ex, ey, size * 0.2 * pw * pulse, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(i ? -0.18 : 0.18);
      ctx.fillStyle = 'rgba(255,70,40,' + (0.95 * pw * pulse) + ')'; ctx.beginPath(); ctx.ellipse(0, 0, ew, eh, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,235,210,' + (0.9 * pw) + ')'; ctx.beginPath(); ctx.ellipse(0, 0, ew * 0.45, eh * 0.45, 0, 0, TAU); ctx.fill();
      ctx.restore();
    });
    ctx.restore();   // fin clip
    // 4) rayons rouges qui jaillissent des yeux
    if (pw > 0.3) eyes.forEach(function (p, i) {
      var ex = p[0] * size, ey = p[1] * size, bl = Math.max(W_, H_), bg = ctx.createLinearGradient(ex, ey, ex + (i ? 1 : -1) * bl * 0.5, ey - bl * 0.35);
      bg.addColorStop(0, 'rgba(255,50,30,' + (0.4 * pw * pulse) + ')'); bg.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(ex, ey - size * 0.02); ctx.lineTo(ex + (i ? 1 : -1) * bl * 0.5, ey - bl * 0.5); ctx.lineTo(ex + (i ? 1 : -1) * bl * 0.5, ey - bl * 0.1); ctx.lineTo(ex, ey + size * 0.02); ctx.closePath(); ctx.fill();
    });
    ctx.restore();
  }

  /* ============================ OVERLAY GROS GAIN ============================ */
  G.showBigWin = function (mult, amount, tier) {
    return new Promise(function (res) {
      var T = I18N.t();
      G.winOv = { t: 0, mult: mult, amount: amount, tier: tier, count: 0, done: false, closing: 0, res: res, title: T.tiers[tier] };
      Sfx.fanfare(tier);
      FX.flash(0.7, '#ffe9a0'); FX.shake(10 + tier * 4, 0.7);
      FX.rain(G.w, 30 + tier * 40);
      FX.coins(G.cx, G.cy + G.R * 0.4, 30 + tier * 20, 1100, 80);
    });
  };
  function updateWinOv(dt) {
    var o = G.winOv; if (!o) return;
    o.t += dt * Math.min(G.speed, 1.6);
    var cd = (1.6 + o.tier * 1.1) / (G.turbo ? 2 : 1);
    var prev = o.count;
    o.count = o.done ? o.amount : clamp((o.t - 0.45) / cd, 0, 1) * o.amount;
    if (!o.done && o.count >= o.amount) { o.done = true; o.doneAt = o.t; FX.ring(G.cx, G.cy, '#ffe9a0', G.R, 0.9); Sfx.thud(); Sfx.winLand && Sfx.winLand(o.tier); FX.shake(8, 0.4); }
    if (!o.done && Math.floor(prev / o.amount * 40) !== Math.floor(o.count / o.amount * 40)) Sfx.countTick(o.count / o.amount);
    if (o.t % 0.22 < dt * G.speed && o.t < 3 + o.tier * 1.5) FX.coins(G.cx + (Math.random() - 0.5) * G.w * 0.5, G.cy + G.R * 0.6, 4, 950, 60);
    if (o.done && !o.closing && o.t - o.doneAt > (G.turbo ? 0.9 : 2.0)) o.closing = 0.0001;
    if (o.closing) { o.closing += dt * 2.5; if (o.closing >= 1) { var r = o.res; G.winOv = null; r(); } }
  }
  G.skipWinOv = function () {
    var o = G.winOv; if (!o) return false;
    if (!o.done) { o.done = true; o.doneAt = o.t; o.count = o.amount; }
    else if (!o.closing) o.closing = 0.0001;
    return true;
  };
  function drawWinOv() {
    var o = G.winOv; if (!o) return;
    var a = o.closing ? 1 - o.closing : 1, w = G.w, h = G.h, cx = G.cx, cy = G.cy;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(4,3,2,' + 0.72 * clamp(o.t / 0.25, 0, 1) + ')'; ctx.fillRect(0, 0, w, h);
    if (ART.bigwin) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = a * 0.55 * clamp(o.t / 0.5, 0, 1); cover(ctx, ART.bigwin, w, h); ctx.restore(); }
    var col = ['#ffd86a', '#ffd86a', '#6ff0dd', '#ff7a5a', '#c28bff'][o.tier] || '#ffd86a';
    A.rays(ctx, cx, cy, Math.max(w, h), 20, o.t * 0.35, col, 0.14);
    var gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.6); gl.addColorStop(0, A.rgba('#ffd86a', 0.35)); gl.addColorStop(1, 'rgba(255,216,106,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h);
    var u = Math.min(w, h);
    // gardiens
    var sc = G.ease.outBack(clamp(o.t / 0.6, 0, 1));
    var hs = u * 0.11 * sc;
    if (w > 640) {
      [-1, 1].forEach(function (sd) {
        if (ART.medal) { var ms = hs * 3.4; ctx.save(); ctx.translate(cx + sd * w * 0.3, cy - u * 0.02); ctx.rotate(sd * Math.sin(o.t * 1.5) * 0.04); ctx.shadowColor = '#ffd86a'; ctx.shadowBlur = 40; ctx.beginPath(); ctx.arc(0, 0, ms * 0.49, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); ctx.shadowBlur = 0; ctx.clip(); ctx.drawImage(ART.medal, -ms / 2, -ms / 2, ms, ms); ctx.restore(); }
        else A.jackal(ctx, cx + sd * w * 0.3, cy - u * 0.02, hs * 1.5, { glow: 1 });
      });
    }
    // titre
    var ts = G.ease.outBack(clamp((o.t - 0.1) / 0.5, 0, 1));
    ctx.save(); ctx.translate(cx, cy - u * 0.2); ctx.scale(ts, ts);
    G.goldText(o.title, 0, 0, Math.min(w * 0.095, u * 0.095), { spacing: 3, blur: 30 });
    ctx.restore();
    // montant
    var ns = 1 + (o.done ? 0.06 * Math.max(0, 1 - (o.t - o.doneAt) * 3) : 0.02 * Math.sin(o.t * 30));
    ctx.save(); ctx.translate(cx, cy + u * 0.06); ctx.scale(ns, ns);
    G.goldText(G.fmt(Math.round(o.count * 100) / 100), 0, 0, Math.min(w * 0.14, u * 0.16), { blur: 40 });
    ctx.restore();
    G.txt('×' + G.fmt(o.mult), cx, cy + u * 0.2, { size: Math.min(w * 0.05, u * 0.06), fill: '#fff1b8', stroke: '#2a1a02', shadow: 'rgba(255,200,60,.6)' });
    if (o.done && !o.closing) G.txt(I18N.t().tapSkip, cx, cy + u * 0.3, { size: 13, family: 'Manrope', weight: 700, fill: 'rgba(255,241,184,' + (0.45 + 0.35 * Math.sin(o.t * 4)) + ')', spacing: 3 });
    ctx.restore();
  }

  /* ================================ BOUCLE ================================ */
  var last = 0;
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
    }
  }
  G.setQuality = function (q) { G.quality = q; G.autoLow = false; perf.stage = 0; FX.lite = (q === 'low'); layout(); };
  function frame(ts) {
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
    FX.draw(ctx);
    ctx.restore();
    drawWinOv();
    drawEmerge();
    FX.drawFlash(ctx, G.w, G.h);
    if (G.fade > 0.001) { ctx.fillStyle = 'rgba(4,3,2,' + G.fade + ')'; ctx.fillRect(0, 0, G.w, G.h); }
    for (i = 0; i < G.onFrame.length; i++) G.onFrame[i](dt);
    root.requestAnimationFrame(frame);
  }

  G.setFade = function (to, dur) { var from = G.fade; return G.tween(dur, function (u) { G.fade = from + (to - from) * u; }, null); };
  G.setScene = function (s) { G.scene = s; if (s && s.layout) s.layout(); };
  G.start = function () { layout(); root.addEventListener('resize', layout); root.requestAnimationFrame(frame); };
  G.relayout = layout;

  /* parallaxe : la caméra bouge un peu avec le pointeur / l'inclinaison du téléphone, sinon un balancement lent */
  var P = G.par = { x: 0, y: 0, tx: 0, ty: 0, stamp: -99 };
  function parAim(x, y) { P.tx = clamp(x, -1, 1); P.ty = clamp(y, -1, 1); P.stamp = G.t; }
  root.addEventListener('pointermove', function (e) { parAim(e.clientX / G.w * 2 - 1, e.clientY / G.h * 2 - 1); });
  root.addEventListener('deviceorientation', function (e) { if (e.gamma != null && e.beta != null) parAim(e.gamma / 25, (e.beta - 45) / 25); });
  function parUpdate(dt) {
    if (G.t - P.stamp > 3.5) { P.tx = Math.sin(G.t * 0.31) * 0.55; P.ty = Math.cos(G.t * 0.23) * 0.4; }
    var k = Math.min(1, dt * 3); P.x += (P.tx - P.x) * k; P.y += (P.ty - P.y) * k;
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
