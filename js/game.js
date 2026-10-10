/* HAND OF ANUBIS — moteur de rendu : boucle, décor, roue, overlay de gros gains. */
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
  G.txt = function (s, x, y, o) {
    o = o || {};
    ctx.font = (o.weight || 800) + ' ' + (o.size || 20) + 'px ' + (o.family || 'Cinzel, serif');
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
    G.txt(s, x, y, { size: size, weight: 900, fill: g, stroke: o.stroke || '#3a2706', sw: o.sw || size * 0.1, shadow: o.shadow || 'rgba(230,185,74,.55)', blur: o.blur || 18, align: o.align, spacing: o.spacing });
  };
  G.fmt = function (n) {
    var a = Math.abs(n);
    return n.toLocaleString(I18N.lang() === 'fr' ? 'fr-FR' : 'en-US', { minimumFractionDigits: a % 1 ? 2 : 0, maximumFractionDigits: 2 });
  };

  /* ---------- mise en page ---------- */
  var bg = document.createElement('canvas');
  var lampOn, lampOff, torchT = 0;
  var dust = [];
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
    var im = new Image(); im.onload = function () { ART[k] = im; if (k === 'key' && G.w) buildBackdrop(); }; im.src = window.HOA_IMG[k];
  });
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
    // frise de hiéroglyphes sous le linteau
    var fh = clamp(h * 0.022, 14, 20);
    f.fillStyle = 'rgba(0,0,0,.55)'; f.fillRect(0, 0, w, fh + 6);
    f.fillStyle = A.goldGrad(f, 0, 0, w, 0); f.fillRect(0, fh + 6, w, 2);
    A.glyphRow(f, 0, 3, w, fh, A.rgba(C.gold, 0.5), 7);
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
    // poussière d'or
    ctx.fillStyle = '#ffd86a';
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i], yy = mod(d.y - t * d.v, 1) * h, xx = (d.x + Math.sin(t * 0.3 + d.p) * 0.02) * w;
      ctx.globalAlpha = 0.18 + 0.22 * Math.sin(t * 1.3 + d.p) * Math.sin(t * 1.3 + d.p);
      ctx.beginPath(); ctx.arc(xx, yy, d.s, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
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

  W.build = function () {
    var R = G.R, dpr = G.dpr, pad = 6;
    var fc = W.face || (W.face = document.createElement('canvas'));
    fc.width = fc.height = Math.ceil((2 * R + pad * 2) * dpr);
    var f = fc.getContext('2d'); f.setTransform(dpr, 0, 0, dpr, 0, 0); f.translate(R + pad, R + pad);
    var T = I18N.t(), ri = R * 0.30, ro = R * 0.935, i, k, v;
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
      // arêtes dorées
      wedge(f, i, ri, ro); f.lineWidth = Math.max(1, R * 0.006); f.strokeStyle = 'rgba(255,214,110,.75)'; f.stroke();
      // contenu
      f.save(); f.rotate(am);
      var big = M.KINDS[k].bonus || k === 'ankh';
      if (!big) {
        var lab = k === 'm0' ? '0' : ({ m025: '0.25', m05: '0.5', m1: '1', m2: '2', m3: '3' })[k];
        var fs = R * (k === 'm0' ? 0.07 : k === 'm025' ? 0.085 : 0.1);
        f.font = '900 ' + fs + 'px Cinzel, serif'; f.textAlign = 'right'; f.textBaseline = 'middle';
        f.fillStyle = v.tx;
        if (k !== 'm0') { f.shadowColor = 'rgba(0,0,0,.55)'; f.shadowBlur = 3; }
        f.fillText(lab, R * 0.78, 0);
        if (k !== 'm0') { f.font = '800 ' + fs * 0.62 + 'px Cinzel, serif'; f.textAlign = 'left'; f.fillText('×', R * 0.785, fs * 0.04); }
        f.shadowBlur = 0;
        if (k === 'm0') { f.globalAlpha = 0.55; A.skullX(f, R * 0.52, 0, R * 0.07, v.tx); f.globalAlpha = 1; }
      } else {
        f.rotate(Math.PI / 2); // icône à l'endroit, nom en radial
        var iy = -R * 0.80, isz = R * (k === 'ankh' ? 0.115 : 0.125);
        if (v.glyph === 'ankh') A.ankh(f, 0, iy, isz * 1.1, '#3a2706');
        else if (v.glyph === 'scarab') A.scarab(f, 0, iy, isz * 1.2, '#ffd86a', 'rgba(0,0,0,.5)');
        else if (v.glyph === 'feather') A.feather(f, 0, iy, isz * 1.35, '#4a3410', 'rgba(255,255,255,.7)');
        else if (v.glyph === 'pyramid') A.pyramid(f, 0, iy, isz * 1.3, '#ffe9a0', 'rgba(0,0,0,.45)');
        f.restore(); f.save(); f.rotate(am);
        f.font = '900 ' + R * 0.05 + 'px Cinzel, serif'; f.textAlign = 'right'; f.textBaseline = 'middle'; f.fillStyle = v.tx;
        f.shadowColor = 'rgba(0,0,0,.6)'; f.shadowBlur = 3;
        f.fillText(T.kinds[k], R * 0.64, 0); f.shadowBlur = 0;
      }
      f.restore();
    }
    // anneau intérieur or
    f.beginPath(); f.arc(0, 0, ri, 0, TAU); f.arc(0, 0, ri * 0.93, 0, TAU, true);
    f.fillStyle = A.goldGrad(f, -ri, -ri, ri, ri); f.fill('evenodd');
    // anneau extérieur or (jante rotative)
    f.beginPath(); f.arc(0, 0, R * 0.96, 0, TAU); f.arc(0, 0, ro, 0, TAU, true);
    f.fillStyle = A.goldGrad(f, -R, -R, R, R); f.fill('evenodd');
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
    var p = W.ptr; p.v += (-520 * p.a - 15 * p.v) * dt; p.a += p.v * dt; p.a = clamp(p.a, -0.2, 0.62);
    var idx = Math.floor(mod(-W.rot, TAU) / step);
    if (idx !== W.lastIdx) {
      if (W.lastIdx >= 0 && W.mode === 'spin') {
        var sp = Math.abs(W.vel);
        p.v += 5.5 + Math.min(sp, 22) * 0.45;
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
    A.jackal(ctx, cx, cy - r * 0.2, r * 0.44, { glow: clamp(pulse, 0, 1) });
    ctx.restore();
  }

  function drawPointer(R) {
    var cx = G.cx, py = G.cy - R * 1.085, s = R * 0.16;
    ctx.save(); ctx.translate(cx, py); ctx.rotate(W.ptr.a);
    ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
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
    var turns = G.turbo ? 3 : 6, dur = G.turbo ? 2.5 : 6.2;
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
      W.ptr.v += 3; Sfx.drum(0.3);
      W.hl = { idx: spin.index, t: 0 };
      var cell = M.LAYOUT[spin.index];
      if (!M.KINDS[cell].bonus) FX.spark(G.cx, G.cy - G.R * 0.9, 14, '#ffe9a0', 220, 0.7);
      return G.sleep(0.25);
    });
  };

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
    o.t += dt * G.speed;
    var cd = (1.6 + o.tier * 1.1) / (G.turbo ? 2 : 1);
    var prev = o.count;
    o.count = o.done ? o.amount : clamp((o.t - 0.45) / cd, 0, 1) * o.amount;
    if (!o.done && o.count >= o.amount) { o.done = true; o.doneAt = o.t; FX.ring(G.cx, G.cy, '#ffe9a0', G.R, 0.9); Sfx.thud(); FX.shake(8, 0.4); }
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
    var col = ['#ffd86a', '#ffd86a', '#6ff0dd', '#ff7a5a', '#c28bff'][o.tier] || '#ffd86a';
    A.rays(ctx, cx, cy, Math.max(w, h), 20, o.t * 0.35, col, 0.14);
    var gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.6); gl.addColorStop(0, A.rgba('#ffd86a', 0.35)); gl.addColorStop(1, 'rgba(255,216,106,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h);
    var u = Math.min(w, h);
    // gardiens
    var sc = G.ease.outBack(clamp(o.t / 0.6, 0, 1));
    var hs = u * 0.11 * sc;
    if (w > 640) { A.jackal(ctx, cx - w * 0.3, cy - u * 0.02, hs * 1.5, { glow: 1 }); A.jackal(ctx, cx + w * 0.3, cy - u * 0.02, hs * 1.5, { glow: 1 }); }
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
    W.update(sdt);
    if (G.scene && G.scene.update) G.scene.update(sdt);
    FX.update(sdt);
    updateWinOv(dt);
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
    drawBackdrop(sc && sc.dim != null ? sc.dim : 0, sc && sc.bgImg);
    if (!sc || sc.showsWheel) W.draw(sc && sc.wheelAlpha);
    if (sc && sc.draw) sc.draw(ctx);
    FX.draw(ctx);
    ctx.restore();
    drawWinOv();
    FX.drawFlash(ctx, G.w, G.h);
    if (G.fade > 0.001) { ctx.fillStyle = 'rgba(4,3,2,' + G.fade + ')'; ctx.fillRect(0, 0, G.w, G.h); }
    for (i = 0; i < G.onFrame.length; i++) G.onFrame[i](dt);
    root.requestAnimationFrame(frame);
  }

  G.setFade = function (to, dur) { var from = G.fade; return G.tween(dur, function (u) { G.fade = from + (to - from) * u; }, null); };
  G.setScene = function (s) { G.scene = s; if (s && s.layout) s.layout(); };
  G.start = function () { layout(); root.addEventListener('resize', layout); root.requestAnimationFrame(frame); };
  G.relayout = layout;

  /* pointeur */
  function pt(e) { var r = cv.getBoundingClientRect(); var p = e.touches ? e.touches[0] || e.changedTouches[0] : e; return { x: p.clientX - r.left, y: p.clientY - r.top }; }
  cv.addEventListener('pointerdown', function (e) {
    Sfx.unlock();
    if (G.skipWinOv()) return;
    var p = pt(e);
    if (G.scene && G.scene.pointer) G.scene.pointer(p.x, p.y, 'down');
    else if (G.onWheelTap) G.onWheelTap(p.x, p.y);
  });
  cv.addEventListener('pointermove', function (e) { if (G.scene && G.scene.pointer) { var p = pt(e); G.scene.pointer(p.x, p.y, 'move'); } });
})(window);
