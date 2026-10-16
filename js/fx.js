/* ANUBIS UNCHAINED — particules, secousses, flashs, compteurs. */
(function (root) {
  'use strict';
  var TAU = Math.PI * 2;
  var parts = [];
  var shake = { t: 0, mag: 0 };
  var flash = { a: 0, color: '#fff1b8' };
  var floaters = [];
  function push(p) { if (parts.length < (FX.lite ? 260 : 620)) parts.push(p); }   // plafond : jamais de chute de fps sous une pluie de pièces

  var FX = {
    parts: parts,
    reduced: false,
    lite: false,
    spark: function (x, y, n, color, spd, life) {
      if (FX.lite) n = Math.ceil(n * 0.45);
      for (var i = 0; i < n; i++) {
        var a = Math.random() * TAU, v = (0.3 + Math.random()) * (spd || 260);
        push({ k: 'spark', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 120, life: (life || 0.9) * (0.6 + Math.random() * 0.8), t: 0, s: 1.5 + Math.random() * 2.5, c: color || '#ffd86a' });
      }
    },
    coins: function (x, y, n, power, spreadX) {
      if (root.Sfx && Sfx.coinShower && n >= 6) Sfx.coinShower(Math.min(14, Math.round(n / 3)));
      if (FX.lite) n = Math.ceil(n * 0.45);
      for (var i = 0; i < n; i++) {
        var a = -Math.PI / 2 + (Math.random() - 0.5) * 1.5, v = (0.55 + Math.random() * 0.7) * (power || 700);
        push({ k: 'coin', x: x + (Math.random() - 0.5) * (spreadX || 40), y: y, vx: Math.cos(a) * v * 0.55, vy: Math.sin(a) * v, g: 1500, life: 2.2 + Math.random() * 0.8, t: 0, s: 7 + Math.random() * 6, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 14, bounce: 0.45 });
      }
    },
    rain: function (w, n) { // pluie d'or depuis le haut
      if (FX.lite) n = Math.ceil(n * 0.45);
      for (var i = 0; i < n; i++) {
        push({ k: 'coin', x: Math.random() * w, y: -20 - Math.random() * 200, vx: (Math.random() - 0.5) * 80, vy: 200 + Math.random() * 300, g: 700, life: 3.5 + Math.random() * 1.5, t: 0, s: 6 + Math.random() * 7, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 12, bounce: 0.35 });
      }
    },
    dust: function (x, y, n, color) {
      if (FX.lite) n = Math.ceil(n * 0.45);
      for (var i = 0; i < n; i++) push({ k: 'dust', x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 12, vx: (Math.random() - 0.5) * 90, vy: -Math.random() * 60, g: -10, life: 0.9 + Math.random() * 0.6, t: 0, s: 6 + Math.random() * 10, c: color || '#caa45f' });
    },
    ash: function (x, y, n, color) {   // cendres : tombent doucement (case « poussière »)
      if (FX.lite) n = Math.ceil(n * 0.45);
      for (var i = 0; i < n; i++) push({ k: 'ash', x: x + (Math.random() - 0.5) * 60, y: y + (Math.random() - 0.5) * 30, vx: (Math.random() - 0.5) * 50, vy: -20 + Math.random() * 30, g: 120, life: 0.8 + Math.random() * 0.7, t: 0, s: 3 + Math.random() * 6, c: color || '#8a7456' });
    },
    cannon: function (x, y, dir, n, power) {   // canon à pièces : jet oblique depuis un bord
      if (FX.lite) n = Math.ceil(n * 0.5);
      for (var i = 0; i < n; i++) {
        var a = -Math.PI / 2 + dir * (0.35 + Math.random() * 0.5), v = (0.6 + Math.random() * 0.6) * (power || 1000);
        push({ k: 'coin', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 1500, life: 2.4 + Math.random() * 0.8, t: 0, s: 7 + Math.random() * 6, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 14, bounce: 0.4 });
      }
    },
    links: function (x, y, n, power) {   // maillons de chaîne dorés projetés (chaîne brisée)
      if (FX.lite) n = Math.ceil(n * 0.5);
      for (var i = 0; i < n; i++) {
        var a = Math.random() * TAU, v = (0.4 + Math.random()) * (power || 520);
        push({ k: 'link', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, g: 900, life: 1.1 + Math.random() * 0.6, t: 0, s: 16 + Math.random() * 14, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 16, face: Math.random() < 0.6 });
      }
    },
    // éclair : ligne brisée lumineuse (dessinée tout de suite, à appeler à chaque image où l'éclair vit)
    bolt: function (ctx, x0, y0, x1, y1, color, width, seed) {
      var n = 9, dx = x1 - x0, dy = y1 - y0, len = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / len, ny = dx / len, i, r = seed || 1;
      function rnd() { r = (r * 16807) % 2147483647; return r / 2147483647 - 0.5; }
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'lighter';
      for (var pass = 0; pass < 2; pass++) {
        ctx.beginPath(); ctx.moveTo(x0, y0);
        r = seed || 1;
        for (i = 1; i < n; i++) { var k = i / n, j = rnd() * len * 0.12; ctx.lineTo(x0 + dx * k + nx * j, y0 + dy * k + ny * j); }
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = pass ? '#ffffff' : color; ctx.lineWidth = pass ? Math.max(1, width * 0.35) : width; ctx.globalAlpha = pass ? 0.95 : 0.55; ctx.stroke();
      }
      ctx.restore();
    },
    ring: function (x, y, color, maxR, life) { push({ k: 'ring', x: x, y: y, life: life || 0.8, t: 0, r: maxR || 200, c: color || '#ffd86a' }); },
    shake: function (mag, dur) { if (FX.reduced) mag *= 0.3; shake.mag = Math.max(shake.mag, mag); shake.t = Math.max(shake.t, dur || 0.4); shake.d = shake.t; },
    flash: function (a, color) { flash.a = Math.max(flash.a, FX.reduced ? a * 0.4 : a); flash.color = color || '#fff1b8'; },
    float: function (text, x, y, color, size) { floaters.push({ text: text, x: x, y: y, t: 0, life: 1.3, color: color || '#ffe9a0', size: size || 28 }); },

    update: function (dt) {
      var i, p;
      for (i = parts.length - 1; i >= 0; i--) {
        p = parts[i]; p.t += dt;
        if (p.t >= p.life) { parts.splice(i, 1); continue; }
        if (p.k === 'link') { p.rot += p.vr * dt; }
        if (p.k !== 'ring') {
          p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.k === 'coin') {
            p.rot += p.vr * dt;
            if (p.y > FX.floorY && p.vy > 0) { p.y = FX.floorY; p.vy *= -p.bounce; p.vx *= 0.8; if (Math.abs(p.vy) < 90) p.vy = 0; }
          }
        }
      }
      if (shake.t > 0) shake.t -= dt; else shake.mag = 0;
      if (flash.a > 0) flash.a = Math.max(0, flash.a - dt * 2.2);
      for (i = floaters.length - 1; i >= 0; i--) { floaters[i].t += dt; if (floaters[i].t > floaters[i].life) floaters.splice(i, 1); }
    },
    shakeOffset: function () {
      if (shake.t <= 0) return [0, 0];
      var k = shake.mag * Math.min(1, shake.t / (shake.d || 1));
      return [(Math.random() - 0.5) * 2 * k, (Math.random() - 0.5) * 2 * k];
    },
    floorY: 9999,

    draw: function (ctx) {
      var i, p, a;
      for (i = 0; i < parts.length; i++) {
        p = parts[i]; a = 1 - p.t / p.life;
        if (p.k === 'spark') {
          ctx.globalAlpha = Math.max(0, a); ctx.fillStyle = p.c;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (0.4 + a * 0.6), 0, TAU); ctx.fill();
        } else if (p.k === 'coin') {
          ctx.globalAlpha = Math.min(1, a * 3);
          var sx = Math.abs(Math.cos(p.rot));
          ctx.save(); ctx.translate(p.x, p.y);
          ctx.fillStyle = sx > 0.25 ? '#f2c14e' : '#9a7420';
          ctx.strokeStyle = '#7a5a12'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.ellipse(0, 0, p.s * Math.max(0.12, sx), p.s, 0, 0, TAU); ctx.fill(); ctx.stroke();
          if (sx > 0.45) { ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.ellipse(-p.s * 0.2 * sx, -p.s * 0.25, p.s * 0.28 * sx, p.s * 0.2, 0, 0, TAU); ctx.fill(); }
          ctx.restore();
        } else if (p.k === 'dust') {
          ctx.globalAlpha = Math.max(0, a) * 0.5; ctx.fillStyle = p.c;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (1.4 - a * 0.6), 0, TAU); ctx.fill();
        } else if (p.k === 'ash') {
          ctx.globalAlpha = Math.max(0, a) * 0.7; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s * 0.5, p.s * 0.5);
        } else if (p.k === 'link') {
          ctx.globalAlpha = Math.min(1, a * 2.5); FX.Chains.link(ctx, p.x, p.y, p.rot, p.s, p.face);
        } else if (p.k === 'ring') {
          ctx.globalAlpha = Math.max(0, a); ctx.strokeStyle = p.c; ctx.lineWidth = 2 + 8 * a;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 - a * a), 0, TAU); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      for (i = 0; i < floaters.length; i++) {
        var f = floaters[i], q = f.t / f.life;
        ctx.globalAlpha = q < 0.7 ? 1 : 1 - (q - 0.7) / 0.3;
        ctx.font = '800 ' + f.size + 'px ' + G.TITLE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.strokeText(f.text, f.x, f.y - q * 60);
        ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y - q * 60);
      }
      ctx.globalAlpha = 1;
    },
    drawFlash: function (ctx, w, h) {
      if (flash.a <= 0.01) return;
      ctx.globalAlpha = Math.min(1, flash.a); ctx.fillStyle = flash.color; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
    }
  };

  /* ---------- CHAÎNES D'UNCHAINED : module réutilisable (transitions de bonus, gros gains) ----------
     Rendu sans état : FX.Chains.draw(ctx, w, h, st) avec st = { r, tense, brk, t, veil, doors, flash, light, lite }
       r      0..1  portée des chaînes depuis les bords (1 = elles se rejoignent au médaillon central)
       tense  0..1  vibration + fissures du médaillon
       brk    secondes depuis la rupture (< 0 : chaînes intactes) ; décroissant = les maillons se rassemblent
       veil   0..1  voile d'obsidienne ; doors 0..1 portes d'obsidienne qui se ferment ; flash 0..1 éclair de lumière divine ; light 0..1 rayons */
  FX.Chains = (function () {
    var face = null, edge = null, lay = null;
    function mk(w, h, fn) { var c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d')); return c; }
    function sprites() {
      if (face) return;
      face = mk(96, 56, function (x) {   // maillon de face : anneau en stade, or patiné, arête claire
        var g = x.createLinearGradient(0, 0, 0, 56); g.addColorStop(0, '#fff3c4'); g.addColorStop(0.32, '#e2ac3a'); g.addColorStop(0.62, '#8a5e12'); g.addColorStop(1, '#f1c765');
        x.lineWidth = 14; x.strokeStyle = '#241603'; root.Art.roundRect(x, 9, 9, 78, 38, 19); x.stroke();
        x.lineWidth = 10; x.strokeStyle = g; root.Art.roundRect(x, 9, 9, 78, 38, 19); x.stroke();
        x.lineWidth = 2.2; x.strokeStyle = 'rgba(255,250,215,.85)'; x.beginPath(); x.moveTo(24, 6.2); x.lineTo(70, 6.2); x.stroke();
      });
      edge = mk(96, 56, function (x) {   // maillon de profil : lentille étroite
        var g = x.createLinearGradient(0, 0, 0, 56); g.addColorStop(0, '#ffe9a0'); g.addColorStop(0.5, '#b8861e'); g.addColorStop(1, '#5e3f08');
        x.beginPath(); x.ellipse(48, 28, 42, 11, 0, 0, Math.PI * 2); x.fillStyle = g; x.fill(); x.lineWidth = 3; x.strokeStyle = '#241603'; x.stroke();
        x.fillStyle = 'rgba(255,250,215,.6)'; x.fillRect(22, 21, 52, 2.5);
      });
    }
    function link(c, x, y, rot, s, faceOn) {
      sprites(); c.save(); c.translate(x, y); c.rotate(rot); c.drawImage(faceOn ? face : edge, -s / 2, -s * 0.2915, s, s * 0.583); c.restore();
    }
    function layout(w, h, lite) {
      var key = w + 'x' + h + (lite ? 'l' : '');
      if (lay && lay.key === key) return lay;
      var s = Math.max(22, Math.min(54, Math.min(w, h) * 0.066)), cx = w / 2, cy = h / 2, seed = 7, i, k, sd;
      function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      var halves = [], nL = lite ? 2 : 3;
      for (i = 0; i < nL; i++) {
        for (sd = 0; sd < 2; sd++) {
          var ang = 0.38 + i * Math.PI / nL + sd * Math.PI, dx = Math.cos(ang), dy = Math.sin(ang);
          var tx = dx > 1e-6 ? (w - cx) / dx : dx < -1e-6 ? -cx / dx : 1e9, ty = dy > 1e-6 ? (h - cy) / dy : dy < -1e-6 ? -cy / dy : 1e9;
          var Lh = Math.min(tx, ty) + s * 1.2, pitch = s * 0.8, n = Math.ceil((Lh - s * 1.6) / pitch), links = [];
          for (k = 0; k < n; k++) links.push({ d: s * 1.6 + k * pitch, rx: rnd(), ry: rnd(), rv: rnd(), vr: (rnd() - 0.5) * 14 });
          halves.push({ ang: ang, dx: dx, dy: dy, L: Lh, links: links });
        }
      }
      var shards = [];
      for (i = 0; i < (lite ? 12 : 28); i++) shards.push({ a: rnd() * 6.283, v: s * (6 + rnd() * 12), r: s * (0.12 + rnd() * 0.24), vr: (rnd() - 0.5) * 18, c: rnd() });
      return (lay = { key: key, s: s, cx: cx, cy: cy, halves: halves, shards: shards });
    }
    function medal(c, L, st, scale, tb) {
      var s = L.s, mr = s * 1.55 * scale, tense = st.tense || 0;
      function disc(clipSide) {
        c.save();
        if (clipSide) { c.beginPath(); c.rect(clipSide < 0 ? -mr * 2 : 0, -mr * 2, mr * 2, mr * 4); c.clip(); }
        var g = c.createRadialGradient(-mr * 0.3, -mr * 0.35, 0, 0, 0, mr); g.addColorStop(0, '#fff3c4'); g.addColorStop(0.5, '#d49a2a'); g.addColorStop(1, '#6a4608');
        c.beginPath(); c.arc(0, 0, mr, 0, 6.283); c.fillStyle = g; c.fill(); c.lineWidth = Math.max(2, mr * 0.09); c.strokeStyle = '#241603'; c.stroke();
        c.beginPath(); c.arc(0, 0, mr * 0.78, 0, 6.283); c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,240,190,.55)'; c.stroke();
        root.Art.ankh(c, 0, mr * 0.02, mr * 1.15, '#3a2706');
        if (tense > 0.05 && tb < 0) {   // fissures par lesquelles filtre la lumière
          c.lineWidth = Math.max(1.5, mr * 0.05); c.strokeStyle = 'rgba(255,248,220,' + Math.min(1, tense * 1.3) + ')'; c.shadowColor = '#fff1b8'; c.shadowBlur = 12 * tense;
          c.beginPath(); c.moveTo(0, -mr * 0.98); c.lineTo(mr * 0.12, -mr * 0.5); c.lineTo(-mr * 0.1, -mr * 0.1); c.lineTo(mr * 0.14, mr * 0.35); c.lineTo(0, mr * 0.98); c.stroke(); c.shadowBlur = 0;
        }
        c.restore();
      }
      c.save(); c.translate(L.cx, L.cy);
      if (tb < 0) {
        var vib = tense * s * 0.05; c.translate(Math.sin(st.t * 80) * vib, Math.cos(st.t * 71) * vib); disc(0);
      } else {
        var a = Math.max(0, 1 - tb / 0.8);
        if (a > 0) [-1, 1].forEach(function (sg) {
          c.save(); c.globalAlpha = a; c.translate(sg * s * 7 * tb, s * 20 * tb * tb - s * 2 * tb); c.rotate(sg * 2.2 * tb); disc(sg); c.restore();
        });
      }
      c.restore();
    }
    function draw(c, w, h, st) {
      var L = layout(w, h, st.lite), s = L.s, i, k, H, lk, tb = st.brk == null ? -1 : st.brk, r = st.r == null ? 1 : st.r;
      if (st.veil > 0.002) { c.fillStyle = 'rgba(6,4,3,' + st.veil + ')'; c.fillRect(0, 0, w, h); }
      if (st.doors > 0.002) {   // portes d'obsidienne : deux battants à liseré d'or qui se rejoignent
        var pw = w / 2 * Math.min(1, st.doors), dg = c.createLinearGradient(0, 0, 0, h); dg.addColorStop(0, '#0c0806'); dg.addColorStop(0.5, '#1a1209'); dg.addColorStop(1, '#0a0705');
        c.fillStyle = dg; c.fillRect(0, 0, pw, h); c.fillRect(w - pw, 0, pw, h);
        c.fillStyle = '#c8901e'; c.fillRect(pw - 3, 0, 3, h); c.fillRect(w - pw, 0, 3, h);
        c.fillStyle = 'rgba(255,216,106,.10)'; for (i = 1; i < 8; i++) { c.fillRect(pw * i / 8, 0, 1, h); c.fillRect(w - pw * i / 8, 0, 1, h); }
      }
      if (st.light > 0.01) {   // lumière divine : halo + rayons qui tournent
        c.save(); c.globalCompositeOperation = 'lighter';
        var rg = c.createRadialGradient(L.cx, L.cy, 0, L.cx, L.cy, Math.max(w, h) * 0.75); rg.addColorStop(0, 'rgba(255,244,205,' + (0.85 * st.light) + ')'); rg.addColorStop(0.35, 'rgba(255,205,100,' + (0.32 * st.light) + ')'); rg.addColorStop(1, 'rgba(255,190,80,0)');
        c.fillStyle = rg; c.fillRect(0, 0, w, h);
        root.Art.rays(c, L.cx, L.cy, Math.max(w, h), 14, st.t * 0.5, '#fff1b8', 0.2 * st.light);
        if (!st.lite) root.Art.rays(c, L.cx, L.cy, Math.max(w, h), 10, -st.t * 0.7 + 0.3, '#6ff0dd', 0.1 * st.light);
        c.restore();
      }
      // chaînes
      for (H = 0; H < L.halves.length; H++) {
        var hf = L.halves[H];
        for (k = 0; k < hf.links.length; k++) {
          lk = hf.links[k];
          var fo = k % 2 === 0, x, y, rot = hf.ang, al = 1;
          if (tb < 0) {
            if (hf.L - lk.d > r * hf.L) continue;
            var vb = (st.tense || 0) * s * 0.05, ph = st.t * 70 + k * 1.7 + H;
            x = L.cx + hf.dx * lk.d - hf.dy * Math.sin(ph) * vb; y = L.cy + hf.dy * lk.d + hf.dx * Math.sin(ph) * vb;
          } else {
            al = tb > 0.7 ? 1 - (tb - 0.7) / 0.6 : 1; if (al <= 0) continue;
            var spd = s * (9 + lk.rx * 15) * (1.2 - 0.6 * lk.d / hf.L), per = (lk.ry - 0.5) * s * 7;
            x = L.cx + hf.dx * lk.d + (hf.dx * spd - hf.dy * per) * tb; y = L.cy + hf.dy * lk.d + (hf.dy * spd + hf.dx * per - s * 5) * tb + 0.5 * s * 36 * tb * tb;
            rot = hf.ang + lk.vr * tb; fo = ((k + Math.floor(tb * 5 * (0.4 + lk.rv))) % 2) === 0;
          }
          if (x < -s || x > w + s || y < -s || y > h + s * 2) continue;
          if (al < 1) c.globalAlpha = al;
          link(c, x, y, rot, s, fo);
          if (al < 1) c.globalAlpha = 1;
        }
      }
      var mscale = tb < 0 ? Math.max(0, Math.min(1, (r - 0.7) / 0.3)) : 1;
      if (mscale > 0) medal(c, L, st, mscale * (1 + (tb < 0 ? 0 : 0)), tb);
      if (tb >= 0 && tb < 1) {   // éclats d'or
        for (i = 0; i < L.shards.length; i++) {
          var sh = L.shards[i], a = 1 - tb / 0.95; if (a <= 0) break;
          var px = L.cx + Math.cos(sh.a) * sh.v * tb * 1.2, py = L.cy + Math.sin(sh.a) * sh.v * tb * 1.2 + s * 14 * tb * tb;
          c.save(); c.globalAlpha = a; c.translate(px, py); c.rotate(sh.vr * tb); c.beginPath(); c.moveTo(sh.r * 1.6, 0); c.lineTo(-sh.r, sh.r); c.lineTo(-sh.r * 0.6, -sh.r); c.closePath();
          c.fillStyle = sh.c < 0.5 ? '#f2c14e' : '#fff1b8'; c.fill(); c.restore();
        }
      }
      if (st.flash > 0.004) { c.fillStyle = 'rgba(255,246,214,' + Math.min(1, st.flash) + ')'; c.fillRect(0, 0, w, h); }
    }
    return { draw: draw, link: link, layout: layout };
  })();

  /* ---------- utilitaires d'animation ---------- */
  FX.ease = {
    out3: function (t) { return 1 - Math.pow(1 - t, 3); },
    out5: function (t) { return 1 - Math.pow(1 - t, 5); },
    inOut: function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    outBack: function (t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outBounce: function (t) {
      var n1 = 7.5625, d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  };
  root.FX = FX;
})(window);
