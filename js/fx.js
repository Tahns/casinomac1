/* ANUBIS UNCHAINED — particules, secousses, flashs, compteurs. */
(function (root) {
  'use strict';
  var TAU = Math.PI * 2;
  var parts = [];
  var shake = { t: 0, mag: 0 };
  var flash = { a: 0, color: '#efdfa8' };
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
        push({ k: 'spark', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 120, life: (life || 0.9) * (0.6 + Math.random() * 0.8), t: 0, s: 1.5 + Math.random() * 2.5, c: color || '#d9b857' });
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
    ring: function (x, y, color, maxR, life) { push({ k: 'ring', x: x, y: y, life: life || 0.8, t: 0, r: maxR || 200, c: color || '#d9b857' }); },
    shake: function (mag, dur) { if (FX.reduced) mag *= 0.3; shake.mag = Math.max(shake.mag, mag); shake.t = Math.max(shake.t, dur || 0.4); shake.d = shake.t; },
    flash: function (a, color) { flash.a = Math.max(flash.a, FX.reduced ? a * 0.4 : a); flash.color = color || '#efdfa8'; },
    float: function (text, x, y, color, size) { floaters.push({ text: text, x: x, y: y, t: 0, life: 1.3, color: color || '#eadb9f', size: size || 28 }); },

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
      if (FX.Break) FX.Break.update(dt);
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
          ctx.fillStyle = sx > 0.25 ? '#cfa94c' : '#9a7420';
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
        var g = x.createLinearGradient(0, 0, 0, 56); g.addColorStop(0, '#efdfa8'); g.addColorStop(0.32, '#c9a243'); g.addColorStop(0.62, '#8a5e12'); g.addColorStop(1, '#d9b857');
        x.lineWidth = 14; x.strokeStyle = '#241603'; root.Art.roundRect(x, 9, 9, 78, 38, 19); x.stroke();
        x.lineWidth = 10; x.strokeStyle = g; root.Art.roundRect(x, 9, 9, 78, 38, 19); x.stroke();
        x.lineWidth = 2.2; x.strokeStyle = 'rgba(255,250,215,.85)'; x.beginPath(); x.moveTo(24, 6.2); x.lineTo(70, 6.2); x.stroke();
      });
      edge = mk(96, 56, function (x) {   // maillon de profil : lentille étroite
        var g = x.createLinearGradient(0, 0, 0, 56); g.addColorStop(0, '#eadb9f'); g.addColorStop(0.5, '#b8861e'); g.addColorStop(1, '#5e3f08');
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
        var g = c.createRadialGradient(-mr * 0.3, -mr * 0.35, 0, 0, 0, mr); g.addColorStop(0, '#efdfa8'); g.addColorStop(0.5, '#b8923a'); g.addColorStop(1, '#6a4608');
        c.beginPath(); c.arc(0, 0, mr, 0, 6.283); c.fillStyle = g; c.fill(); c.lineWidth = Math.max(2, mr * 0.09); c.strokeStyle = '#241603'; c.stroke();
        c.beginPath(); c.arc(0, 0, mr * 0.78, 0, 6.283); c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,240,190,.55)'; c.stroke();
        root.Art.ankh(c, 0, mr * 0.02, mr * 1.15, '#3a2706');
        if (tense > 0.05 && tb < 0) {   // fissures par lesquelles filtre la lumière
          c.lineWidth = Math.max(1.5, mr * 0.05); c.strokeStyle = 'rgba(255,248,220,' + Math.min(1, tense * 1.3) + ')'; c.shadowColor = '#efdfa8'; c.shadowBlur = 12 * tense;
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
        c.fillStyle = '#b8923a'; c.fillRect(pw - 3, 0, 3, h); c.fillRect(w - pw, 0, 3, h);
        c.fillStyle = 'rgba(217,184,87,.10)'; for (i = 1; i < 8; i++) { c.fillRect(pw * i / 8, 0, 1, h); c.fillRect(w - pw * i / 8, 0, 1, h); }
      }
      if (st.light > 0.01) {   // lumière divine : halo + rayons qui tournent
        c.save(); c.globalCompositeOperation = 'lighter';
        var rg = c.createRadialGradient(L.cx, L.cy, 0, L.cx, L.cy, Math.max(w, h) * 0.75); rg.addColorStop(0, 'rgba(239,223,168,' + (0.85 * st.light) + ')'); rg.addColorStop(0.35, 'rgba(255,205,100,' + (0.32 * st.light) + ')'); rg.addColorStop(1, 'rgba(255,190,80,0)');
        c.fillStyle = rg; c.fillRect(0, 0, w, h);
        root.Art.rays(c, L.cx, L.cy, Math.max(w, h), 14, st.t * 0.5, '#efdfa8', 0.2 * st.light);
        if (!st.lite) root.Art.rays(c, L.cx, L.cy, Math.max(w, h), 10, -st.t * 0.7 + 0.3, '#6cd8c6', 0.1 * st.light);
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
          c.fillStyle = sh.c < 0.5 ? '#cfa94c' : '#efdfa8'; c.fill(); c.restore();
        }
      }
      if (st.flash > 0.004) { c.fillStyle = 'rgba(239,223,168,' + Math.min(1, st.flash) + ')'; c.fillRect(0, 0, w, h); }
    }
    return { draw: draw, link: link, layout: layout };
  })();

  /* ---------- BRISURE DE CHAÎNES (FX.Break) : maillons 3D en or patiné, physique crédible, pools sans allocation par image ----------
     Maillon = tube torique rendu dans un atlas (9 angles de basculement autour de son grand axe, de face à tranche) : un maillon qui tourne en vol
     change réellement de forme. Chaîne tendue : FX.Break.chain(x0,y0,x1,y1,taille) puis drawChain(ctx,ch,t,tension). Rupture : snap(ch,{power,at,ox,oy}) =
     les deux moitiés deviennent des cordes (Verlet, ancrées, qui fouettent puis pendent puis tombent), maillons et éclats projetés qui rebondissent
     sur le sol (FX.floorY), étincelles-traits, onde de choc nette (anneau dur + étoile de fissures, jamais de flou). FX.reduced : tout est inerte
     (les appelants ne montrent que des fondus). FX.lite : moitié moins de fragments. Dessiné par game.js au-dessus de tout (FX.Break.draw). */
  FX.Break = (function () {
    var PI = Math.PI, HP = PI / 2, TAU = PI * 2, NF = 9, CW = 128, CH = 80, SH = 64, NSH = 9;
    var atlas = null;
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function rnd() { return Math.random(); }
    function hash(i) { var s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); }

    /* ----- atlas : maillons (rangée 0), pièces (rangée 1), éclats (rangée 2) ----- */
    function stadium(x, cx, cy, hx, rx, hc, dy) {
      x.beginPath();
      if (hc < 0.7) { x.moveTo(cx - hx, cy + dy); x.lineTo(cx + hx, cy + dy); return; }
      x.moveTo(cx - hx + rx, cy - hc + dy); x.lineTo(cx + hx - rx, cy - hc + dy);
      x.ellipse(cx + hx - rx, cy + dy, rx, hc, 0, -HP, HP); x.lineTo(cx - hx + rx, cy + hc + dy);
      x.ellipse(cx - hx + rx, cy + dy, rx, hc, 0, HP, PI * 1.5); x.closePath();
    }
    function metalGrain(x, w, h) {   // grain de métal martelé + vert-de-gris, seulement sur les pixels déjà peints
      var A = root.Art; x.save(); x.globalCompositeOperation = 'source-atop';
      if (A && A.grain) { x.beginPath(); x.rect(0, 0, w, h); A.grain(x); }
      x.restore();
    }
    function bandsGrad(x, y0, y1) {
      var g = x.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, '#f6e9b4'); g.addColorStop(0.17, '#efdfa8'); g.addColorStop(0.17, '#cfa94c'); g.addColorStop(0.5, '#c29a3e'); g.addColorStop(0.5, '#8a6a1e');
      g.addColorStop(0.78, '#7a5c18'); g.addColorStop(0.78, '#4f3a12'); g.addColorStop(1, '#3d2c0c'); return g;
    }
    function linkFrame(x, ox, phi) {
      var c = Math.cos(phi), T = 17, L = 110, W = 64, cx = ox + CW / 2, cy = CH / 2, hx = (L - T) / 2, rx = (W - T) / 2, hc = rx * c, k;
      x.save(); x.lineCap = 'butt'; x.lineJoin = 'round';
      stadium(x, cx, cy, hx, rx, hc, 0); x.lineWidth = T + 5; x.strokeStyle = '#1a1004'; x.stroke();
      stadium(x, cx, cy, hx, rx, hc, 0); x.lineWidth = T; x.strokeStyle = bandsGrad(x, cy - hc - T / 2, cy + hc + T / 2); x.stroke();
      x.globalCompositeOperation = 'source-atop';
      stadium(x, cx, cy, hx, rx, hc, T * 0.3); x.lineWidth = T * 0.34; x.strokeStyle = 'rgba(28,17,2,.45)'; x.stroke();          // ventre du tube dans l'ombre
      stadium(x, cx, cy, hx, rx, hc, -T * 0.25); x.lineWidth = T * 0.2; x.strokeStyle = 'rgba(255,250,222,.8)'; x.stroke();      // arête claire (lumière du haut)
      for (k = 0; k < 5; k++) {   // patine turquoise, toujours aux mêmes endroits
        var px = cx - hx + hx * 2 * (((k * 0.37 + 0.1) % 1)), py = cy + (((k * 0.53) % 1) - 0.5) * 2 * (hc + T * 0.3);
        x.fillStyle = 'rgba(31,165,150,.30)'; x.beginPath(); x.arc(px, py, 3 + (k % 3) * 1.6, 0, TAU); x.fill();
      }
      x.restore();
    }
    function coinFrame(x, ox, phi) {
      var c = Math.abs(Math.cos(phi)), s = Math.sin(phi), r = 26, th = 9, cx = ox + CW / 2, cy = CH + SH / 2;
      x.save();
      x.fillStyle = '#6a4a10'; x.strokeStyle = '#1a1004'; x.lineWidth = 2.5;
      x.beginPath(); x.rect(cx - s * th / 2, cy - r, s * th, r * 2); x.fill();                                          // tranche
      var ex = cx + s * th / 2, rw = Math.max(1.2, r * c);
      x.beginPath(); x.ellipse(ex, cy, rw, r, 0, 0, TAU);
      var g = x.createLinearGradient(ex - rw, cy - r, ex + rw, cy + r);
      g.addColorStop(0, '#efdfa8'); g.addColorStop(0.3, '#efdfa8'); g.addColorStop(0.3, '#cfa94c'); g.addColorStop(0.62, '#cfa94c'); g.addColorStop(0.62, '#8a6a1e'); g.addColorStop(1, '#6a4e12');
      x.fillStyle = g; x.fill(); x.stroke();
      if (c > 0.3) {   // listel et frappe
        x.beginPath(); x.ellipse(ex, cy, rw * 0.74, r * 0.74, 0, 0, TAU); x.lineWidth = 1.6; x.strokeStyle = 'rgba(60,40,6,.75)'; x.stroke();
        x.fillStyle = 'rgba(60,40,6,.7)'; x.fillRect(ex - rw * 0.08, cy - r * 0.4, Math.max(1, rw * 0.16), r * 0.8); x.fillRect(ex - rw * 0.3, cy - r * 0.12, rw * 0.6, r * 0.2);
      }
      x.restore();
    }
    function shardFrame(x, ox, idx) {
      var s = 11 + idx * 7919, n = 5 + (idx % 3), pts = [], i, cx = ox + CW / 2, cy = CH + SH + SH / 2;
      function r() { s = (s * 16807) % 2147483647; return s / 2147483647; }
      for (i = 0; i < n; i++) { var a = TAU * (i + r() * 0.6) / n, d = 12 + r() * 13; pts.push([cx + Math.cos(a) * d * (1.1 - (idx % 2) * 0.3), cy + Math.sin(a) * d * (0.8 + (idx % 2) * 0.3)]); }
      x.save(); x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (i = 1; i < n; i++) x.lineTo(pts[i][0], pts[i][1]); x.closePath();
      var ang = r() * TAU, g = x.createLinearGradient(cx + Math.cos(ang) * 24, cy + Math.sin(ang) * 24, cx - Math.cos(ang) * 24, cy - Math.sin(ang) * 24);
      g.addColorStop(0, '#efdfa8'); g.addColorStop(0.35, '#efdfa8'); g.addColorStop(0.35, '#cfa94c'); g.addColorStop(0.65, '#cfa94c'); g.addColorStop(0.65, '#8a6a1e'); g.addColorStop(1, '#4f3a12');
      x.fillStyle = g; x.fill(); x.lineWidth = 2.2; x.strokeStyle = '#1a1004'; x.lineJoin = 'round'; x.stroke();
      x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); x.lineTo(pts[1][0], pts[1][1]); x.lineWidth = 1.4; x.strokeStyle = 'rgba(255,250,222,.8)'; x.stroke();
      x.restore();
    }
    function ready() {
      if (atlas) return true;
      try {
        var a = document.createElement('canvas'); a.width = CW * NF; a.height = CH + SH * 2;
        var x = a.getContext('2d'), f; atlas = a;
        for (f = 0; f < NF; f++) { linkFrame(x, f * CW, f / (NF - 1) * HP); coinFrame(x, f * CW, f / (NF - 1) * HP); }
        for (f = 0; f < NSH; f++) shardFrame(x, f * CW, f);
        x.save(); x.beginPath(); x.rect(0, 0, a.width, CH); x.clip(); metalGrain(x, a.width, CH); x.restore();
      } catch (e) { atlas = null; return false; }
      return true;
    }
    function frameOf(phi) { return Math.round(Math.acos(Math.min(1, Math.abs(Math.cos(phi)))) * (2 / PI) * (NF - 1)); }
    function drawLink(ctx, x, y, rot, size, phi) {
      var w = size * 1.113, h = w * CH / CW;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(atlas, frameOf(phi) * CW, 0, CW, CH, -w / 2, -h / 2, w, h); ctx.restore();
    }

    /* ----- pools ----- */
    var CAP = 380, DEB = [], SPN = 260, SPK = [], RGN = 18, RNG = [], RPN = 12, ROPES = [], i;
    for (i = 0; i < CAP; i++) DEB.push({ on: 0, k: 0, x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, ph: 0, vph: 0, s: 10, t: 0, life: 1, bnc: 0.4, v: 0, rest: 0, g: 1500 });
    for (i = 0; i < SPN; i++) SPK.push({ on: 0, x: 0, y: 0, vx: 0, vy: 0, t: 0, life: 1, c: 0 });
    for (i = 0; i < RGN; i++) RNG.push({ on: 0, x: 0, y: 0, t: 0, life: 1, R: 100, w: 6, c: '#d9b857', star: 0, d: 0, a0: 0 });
    for (i = 0; i < RPN; i++) ROPES.push({ on: 0, n: 0, pts: new Float32Array(96 * 4), size: 20, pitch: 16, pin: 1, t: 0, life: 2, unpin: 1, ld: 1 / 60, tw: 1, par: 0 });
    var di = 0, si = 0, ri = 0, ropeI = 0, slowT = 0, slowD = 1, slowK = 1, active = false, SPCOL = ['#fff4cf', '#efdfa8', '#d9b857', '#f4ecd6'];
    var SX = new Float32Array(400), SY = new Float32Array(400), PL = { x: 0, y: 0, a: 0 }, BP = { x: 0, y: 0 };

    function G_() { return root.G || { w: 800, h: 600 }; }
    function floor() { return FX.floorY < 9000 ? FX.floorY : G_().h + 30; }
    function deb(k) {
      var p = DEB[di], lim = FX.lite ? 170 : CAP; di = (di + 1) % lim;
      p.on = 1; p.k = k; p.t = 0; p.rest = 0; p.g = 1500; p.bnc = 0.42; p.ph = 0; p.vph = 0; p.rot = 0; p.vr = 0; return p;
    }
    function spark(x, y, vx, vy, life, c) {
      var p = SPK[si]; si = (si + 1) % (FX.lite ? 140 : SPN); p.on = 1; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.t = 0; p.life = life; p.c = c; return p;
    }
    function ring(x, y, R, w, life, c, star, delay) {
      var p = RNG[ri]; ri = (ri + 1) % RGN; p.on = 1; p.x = x; p.y = y; p.R = R; p.w = w; p.life = life; p.c = c || '#d9b857'; p.star = star ? 1 : 0; p.d = delay || 0; p.t = 0; p.a0 = rnd() * TAU; return p;
    }

    /* ----- chaîne tendue ----- */
    function chain(x0, y0, x1, y1, size, o) {
      o = o || {}; return { x0: x0, y0: y0, x1: x1, y1: y1, size: size, sag: o.sag == null ? 0.04 : o.sag, dead: false, par: o.par || 0 };
    }
    function chainN(ch) { return clamp(Math.round(Math.hypot(ch.x1 - ch.x0, ch.y1 - ch.y0) / (ch.size * 0.78)), 2, 190); }
    function place(ch, i, n, t, tens) {
      var dx = ch.x1 - ch.x0, dy = ch.y1 - ch.y0, len = Math.sqrt(dx * dx + dy * dy) || 1, u = (i + 0.5) / n, nx = -dy / len, ny = dx / len;
      var sg = ch.sag * len * (1 - tens), vib = tens * ch.size * 0.07 * Math.sin(t * 58 + i * 1.3) * Math.sin(PI * u);
      PL.x = ch.x0 + dx * u + nx * vib; PL.y = ch.y0 + dy * u + sg * 4 * u * (1 - u) + ny * vib;
      PL.a = Math.atan2(dy + sg * 4 * (1 - 2 * u), dx);
    }
    function drawChain(ctx, ch, t, tens, alpha) {
      if (!ch || ch.dead || !ready()) return;
      var n = chainN(ch), i; tens = tens == null ? 0.6 : tens;
      if (alpha != null && alpha < 1) ctx.globalAlpha *= alpha;
      for (i = 0; i < n; i++) { place(ch, i, n, t || 0, tens); drawLink(ctx, PL.x, PL.y, PL.a, ch.size, ((i + ch.par) & 1) ? HP : 0.05); }
    }

    /* ----- rupture ----- */
    // SX/SY[0..n-1] : positions de départ des maillons (le 0 est ancré) ; (ux, uy) : direction du recul ; whip : vitesse du fouet
    function rope(n, size, pitch, par, ux, uy, whip, life) {
      var r = ROPES[ropeI]; ropeI = (ropeI + 1) % RPN; var k, p = r.pts;
      r.on = 1; r.n = n; r.size = size; r.pitch = pitch; r.t = 0; r.pin = 1; r.ld = 1 / 60; r.par = par; r.tw = (rnd() - 0.5) * 6; r.life = life; r.unpin = life * (0.5 + rnd() * 0.15);
      for (k = 0; k < n; k++) {
        var f = k / Math.max(1, n - 1), v = whip * Math.pow(f, 1.4), px = SX[k], py = SY[k];
        var vx = ux * v + (rnd() - 0.5) * v * 0.5, vy = uy * v + (rnd() - 0.9) * v * 0.7;
        p[k * 4] = px; p[k * 4 + 1] = py; p[k * 4 + 2] = px - vx / 60; p[k * 4 + 3] = py - vy / 60;
      }
      return r;
    }
    function snap(ch, o) {
      o = o || {};
      if (!ch || ch.dead) return null;
      ch.dead = true;
      if (FX.reduced || !ready()) return null;
      var n = chainN(ch), sc = o.sc || 1, ox = o.ox || 0, oy = o.oy || 0, pw = o.power == null ? 1 : o.power, t = o.t || 0, tens = o.tens == null ? 1 : o.tens, k;
      var m = clamp(Math.round((o.at == null ? 0.3 + rnd() * 0.4 : o.at) * n), 2, n - 2); if (n < 5) m = n >> 1;
      for (k = 0; k < n; k++) { place(ch, k, n, t, tens); SX[200 + k] = PL.x * sc + ox; SY[200 + k] = PL.y * sc + oy; }
      var size = ch.size * sc, pitch = Math.hypot(ch.x1 - ch.x0, ch.y1 - ch.y0) * sc / n, whip = size * (16 + 15 * pw), life = 1.7 + 0.5 * pw, ux, uy, d, n2 = n - m;
      BP.x = (SX[200 + m - 1] + SX[200 + m]) / 2; BP.y = (SY[200 + m - 1] + SY[200 + m]) / 2;
      for (k = 0; k < m; k++) { SX[k] = SX[200 + k]; SY[k] = SY[200 + k]; }                                   // moitié 0 : ancrée au maillon 0
      d = Math.hypot(SX[m - 1] - SX[0], SY[m - 1] - SY[0]) || 1; ux = (SX[0] - SX[m - 1]) / d; uy = (SY[0] - SY[m - 1]) / d;
      rope(Math.min(m, 96), size, pitch, ch.par, ux, uy, whip, life);
      for (k = 0; k < n2; k++) { SX[k] = SX[200 + n - 1 - k]; SY[k] = SY[200 + n - 1 - k]; }                   // moitié 1 : ancrée au dernier maillon
      d = Math.hypot(SX[n2 - 1] - SX[0], SY[n2 - 1] - SY[0]) || 1; ux = (SX[0] - SX[n2 - 1]) / d; uy = (SY[0] - SY[n2 - 1]) / d;
      rope(Math.min(n2, 96), size, pitch, ch.par + n - 1, ux, uy, whip, life);
      impact(BP.x, BP.y, pw, { size: size * (o.dscale || 1.6), links: 3 });   // les éclats jaillissent vers la caméra : plus gros que les maillons de la chaîne
      return BP;
    }
    function impact(x, y, pw, o) {
      if (FX.reduced || !ready()) return;
      o = o || {}; var size = o.size || 24, lt = FX.lite ? 0.5 : 1, nsh = Math.ceil((7 + 12 * pw) * lt), nsp = Math.ceil((26 + 46 * pw) * lt), nl = Math.ceil((o.links || 0) * lt), k, a, v, p;
      for (k = 0; k < nsh; k++) {
        a = rnd() * TAU; v = size * (7 + rnd() * 16) * (0.6 + 0.6 * pw); p = deb(2);
        p.x = x; p.y = y; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v - size * 7; p.vr = (rnd() - 0.5) * 22; p.vph = (rnd() - 0.5) * 16; p.s = size * (0.3 + rnd() * 0.42) * (o.bigShards || 1); p.v = (rnd() * NSH) | 0; p.life = 1.6 + rnd() * 0.9; p.g = size * 60; p.bnc = 0.38;
      }
      for (k = 0; k < nl; k++) {
        a = rnd() * TAU; v = size * (6 + rnd() * 10) * (0.6 + 0.5 * pw); p = deb(0);
        p.x = x; p.y = y; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v - size * 8; p.vr = (rnd() - 0.5) * 20; p.vph = (rnd() - 0.5) * 18; p.ph = rnd() * PI; p.rot = rnd() * TAU; p.s = size; p.life = 2 + rnd() * 0.8; p.g = size * 60; p.bnc = 0.35;
      }
      for (k = 0; k < nsp; k++) { a = rnd() * TAU; v = size * (10 + rnd() * 26) * (0.6 + 0.6 * pw); spark(x, y, Math.cos(a) * v, Math.sin(a) * v - size * 4, 0.35 + rnd() * 0.55, (rnd() * 4) | 0); }
      ring(x, y, size * (3.4 + 4.2 * pw), Math.max(3, size * 0.2), 0.5 + 0.2 * pw, '#d9b857', 0, 0);
      ring(x, y, size * (2.4 + 3.4 * pw), Math.max(2.4, size * 0.14), 0.4, '#efdfa8', 0, 0.06);
      ring(x, y, size * (2.6 + 2.4 * pw), Math.max(2.4, size * 0.12), 0.45, '#f4ecd6', 1, 0);
    }
    function stress(x, y, k, size) {   // étincelles de tension au point faible
      if (FX.reduced || !ready()) return;
      for (var n = 0; n < 1 + (k > 0.6 ? 1 : 0); n++) { var a = rnd() * TAU, v = size * (6 + rnd() * 12) * (0.5 + k); spark(x, y, Math.cos(a) * v, Math.sin(a) * v - size * 2, 0.2 + rnd() * 0.3, (rnd() * 4) | 0); }
    }
    function slow(dur, k) { if (FX.reduced) return; slowD = dur; slowT = dur; slowK = k == null ? 0.25 : k; }

    /* ----- pièces, pluie ----- */
    function coin(x, y, vx, vy, s, life, bnc) {
      var p = deb(1); p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.s = s; p.life = life || 2.6; p.bnc = bnc || 0.5; p.vph = (rnd() - 0.5) * 22; p.ph = rnd() * PI; p.rot = (rnd() - 0.5) * 0.7; p.vr = (rnd() - 0.5) * 3; p.g = 1700; return p;
    }
    function coins(x, y, n, power, spread) {
      if (FX.reduced || !ready()) return;
      if (root.Sfx && root.Sfx.coinShower && n >= 6) root.Sfx.coinShower(Math.min(14, Math.round(n / 3)));
      n = Math.ceil(n * (FX.lite ? 0.5 : 1));
      for (var k = 0; k < n; k++) { var a = -HP + (rnd() - 0.5) * 1.5, v = (0.55 + rnd() * 0.7) * (power || 700); coin(x + (rnd() - 0.5) * (spread || 40), y, Math.cos(a) * v * 0.55, Math.sin(a) * v, 7 + rnd() * 6); }
    }
    function cannon(x, y, dir, n, power) {
      if (FX.reduced || !ready()) return;
      n = Math.ceil(n * (FX.lite ? 0.5 : 1));
      for (var k = 0; k < n; k++) { var a = -HP + dir * (0.35 + rnd() * 0.5), v = (0.6 + rnd() * 0.6) * (power || 1000); coin(x, y, Math.cos(a) * v, Math.sin(a) * v, 7 + rnd() * 6, 2.8, 0.45); }
    }
    function rain(w, n, links) {   // pluie de pièces (et de maillons / éclats si links = proportion) depuis le haut, avec rebonds
      if (FX.reduced || !ready()) return;
      n = Math.ceil(n * (FX.lite ? 0.5 : 1));
      for (var k = 0; k < n; k++) {
        if (links && rnd() < links) {
          var p = deb(rnd() < 0.55 ? 0 : 2); p.x = rnd() * w; p.y = -30 - rnd() * 160; p.vx = (rnd() - 0.5) * 120; p.vy = 120 + rnd() * 260; p.vr = (rnd() - 0.5) * 14; p.vph = (rnd() - 0.5) * 16; p.ph = rnd() * PI;
          p.rot = rnd() * TAU; p.s = p.k ? 12 + rnd() * 10 : 20 + rnd() * 10; p.v = (rnd() * NSH) | 0; p.life = 3.4 + rnd(); p.g = 1500; p.bnc = 0.34;
        } else coin(rnd() * w, -20 - rnd() * 200, (rnd() - 0.5) * 80, 200 + rnd() * 300, 6.5 + rnd() * 6.5, 3.4 + rnd() * 1.2, 0.38);
      }
    }

    /* ----- chaîne sur un tracé (enroulement) : pts = [x,y,x,y...] ; head = longueur déjà posée ----- */
    function path(pts, size) {
      var n = pts.length >> 1, f = new Float32Array(pts), cum = new Float32Array(n), k, a = 0;
      for (k = 1; k < n; k++) { a += Math.hypot(f[k * 2] - f[k * 2 - 2], f[k * 2 + 1] - f[k * 2 - 1]); cum[k] = a; }
      return { p: f, cum: cum, n: n, len: a, size: size, par: 0 };
    }
    function drawPath(ctx, pc, head, t, alpha, scatter) {
      if (!pc || !ready() || head <= 0) return;
      var pitch = pc.size * 0.78, k = 1, d, i = 0, u, ax, ay, ang, ageLen = pc.size * 4.5 * (scatter || 0), off, e, hh, s0, sl;
      if (alpha != null && alpha < 1) ctx.globalAlpha *= alpha;
      for (d = pitch * 0.5; d <= head && d <= pc.len; d += pitch, i++) {
        while (k < pc.n - 1 && pc.cum[k] < d) k++;
        s0 = pc.cum[k - 1]; sl = pc.cum[k] - s0 || 1; u = (d - s0) / sl;
        ax = pc.p[k * 2 - 2] + (pc.p[k * 2] - pc.p[k * 2 - 2]) * u; ay = pc.p[k * 2 - 1] + (pc.p[k * 2 + 1] - pc.p[k * 2 - 1]) * u;
        ang = Math.atan2(pc.p[k * 2 + 1] - pc.p[k * 2 - 1], pc.p[k * 2] - pc.p[k * 2 - 2]);
        var phi = ((i + pc.par) & 1) ? HP : 0.05;
        if (ageLen > 0 && head - d < ageLen) {   // les derniers maillons arrivent en volant puis s'emboîtent
          e = 1 - (head - d) / ageLen; e = 1 - e * e * e; hh = hash(i + 3);
          off = (1 - e) * pc.size * 2.6; ax += Math.cos(hh * TAU) * off; ay += Math.sin(hh * TAU) * off - (1 - e) * pc.size * 0.8; ang += (hh - 0.5) * 5 * (1 - e); phi += (1 - e) * (hh - 0.3) * 3;
        }
        drawLink(ctx, ax, ay, ang, pc.size, phi);
      }
    }
    function pathPoint(pc, d) {   // position à la distance d le long du tracé (pour l'éclat de pose)
      var k = 1; d = clamp(d, 0, pc.len); while (k < pc.n - 1 && pc.cum[k] < d) k++;
      var s0 = pc.cum[k - 1], sl = pc.cum[k] - s0 || 1, u = (d - s0) / sl;
      BP.x = pc.p[k * 2 - 2] + (pc.p[k * 2] - pc.p[k * 2 - 2]) * u; BP.y = pc.p[k * 2 - 1] + (pc.p[k * 2 + 1] - pc.p[k * 2 - 1]) * u; return BP;
    }

    /* ----- mise à jour et dessin ----- */
    function stepRope(r, d, fl) {
      var n = r.n, P = r.pts, g = r.size * 70 * d * d, kk = d / r.ld, i, it, dx, dy, dist, df, a, b;
      r.t += d; r.ld = d;
      if (r.t >= r.life) { r.on = 0; return; }
      if (r.pin && r.t > r.unpin) r.pin = 0;
      for (i = 0; i < n; i++) {
        if (r.pin && i === 0) continue;
        var x = P[i * 4], y = P[i * 4 + 1], vx = (x - P[i * 4 + 2]) * kk * 0.993, vy = (y - P[i * 4 + 3]) * kk * 0.993;
        P[i * 4 + 2] = x; P[i * 4 + 3] = y; P[i * 4] = x + vx; P[i * 4 + 1] = y + vy + g;
      }
      for (it = 0; it < 5; it++) {
        for (i = 0; i < n - 1; i++) {
          a = i * 4; b = a + 4; dx = P[b] - P[a]; dy = P[b + 1] - P[a + 1]; dist = Math.sqrt(dx * dx + dy * dy) || 0.001; df = (dist - r.pitch) / dist;
          if (r.pin && i === 0) { P[b] -= dx * df; P[b + 1] -= dy * df; }
          else { P[a] += dx * df * 0.5; P[a + 1] += dy * df * 0.5; P[b] -= dx * df * 0.5; P[b + 1] -= dy * df * 0.5; }
        }
      }
      for (i = 0; i < n; i++) if (P[i * 4 + 1] > fl) { P[i * 4 + 1] = fl; P[i * 4 + 2] = P[i * 4] - (P[i * 4] - P[i * 4 + 2]) * 0.7; P[i * 4 + 3] = fl + (fl - P[i * 4 + 3]) * 0.25; }
    }
    function update(dt) {
      var any = false, k, p, fl = floor(), W = G_().w, sc = 1, u;
      if (slowT > 0) { u = 1 - slowT / slowD; slowT -= dt; sc = u < 0.42 ? slowK : slowK + (1 - slowK) * (u - 0.42) / 0.58; sc = clamp(sc, slowK, 1); }
      dt = Math.min(dt, 1 / 40) * sc; if (dt <= 0) return;
      for (k = 0; k < CAP; k++) {
        p = DEB[k]; if (!p.on) continue; any = true; p.t += dt;
        if (p.t >= p.life) { p.on = 0; continue; }
        if (p.rest) continue;
        p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.ph += p.vph * dt;
        if (p.y > fl && p.vy > 0) {
          p.y = fl; if (p.vy > 330 && !FX.lite) spark(p.x, p.y, (rnd() - 0.5) * 140, -p.vy * 0.25, 0.25, 2);
          p.vy = -p.vy * p.bnc; p.vx *= 0.78; p.vr *= 0.6; p.vph *= 0.55;
          if (Math.abs(p.vy) < 85) { p.vy = 0; p.vx = 0; p.vr = 0; p.vph = 0; p.rest = 1; p.life = Math.min(p.life, p.t + 0.45); if (p.k === 1) p.ph = HP * 0.9; }
        }
        if (p.x < -80 || p.x > W + 80) p.on = 0;
      }
      for (k = 0; k < SPN; k++) {
        p = SPK[k]; if (!p.on) continue; any = true; p.t += dt;
        if (p.t >= p.life) { p.on = 0; continue; }
        p.vy += 1100 * dt; p.vx *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.y > fl && p.vy > 0) { p.y = fl; p.vy *= -0.4; }
      }
      for (k = 0; k < RGN; k++) { p = RNG[k]; if (!p.on) continue; any = true; if (p.d > 0) { p.d -= dt; continue; } p.t += dt; if (p.t >= p.life) p.on = 0; }
      for (k = 0; k < RPN; k++) if (ROPES[k].on) { any = true; stepRope(ROPES[k], dt, fl); }
      active = any;
    }
    function draw(ctx) {
      if (!active || !atlas) return;
      var k, p, a, i, c, w, h, u, e, wd, r, rp, al, P, i0, i1, ang, sq, L;
      ctx.save();
      // ondes de choc : anneau net (cerclage d'or + liseré clair), étoile de fissures
      for (k = 0; k < RGN; k++) {
        p = RNG[k]; if (!p.on || p.d > 0) continue;
        u = p.t / p.life; e = 1 - Math.pow(1 - u, 3); wd = p.w * (1 - u); r = p.R * e; if (wd < 0.4) continue;
        ctx.lineCap = 'butt';
        if (p.star) {
          ctx.strokeStyle = p.c; ctx.lineWidth = Math.max(1, wd * 0.5); ctx.beginPath();
          for (i = 0; i < 9; i++) { a = p.a0 + i * TAU / 9 + Math.sin(i * 7.1) * 0.18; L = r * (0.7 + 0.3 * hash(i + 1)); ctx.moveTo(p.x + Math.cos(a) * r * 0.22, p.y + Math.sin(a) * r * 0.22); ctx.lineTo(p.x + Math.cos(a) * L, p.y + Math.sin(a) * L); }
          ctx.stroke();
        } else {
          ctx.strokeStyle = p.c; ctx.lineWidth = wd; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.stroke();
          ctx.strokeStyle = '#f4ecd6'; ctx.lineWidth = Math.max(0.8, wd * 0.3); ctx.beginPath(); ctx.arc(p.x, p.y, r + wd * 0.2, 0, TAU); ctx.stroke();
        }
      }
      // cordes (moitiés de chaînes rompues)
      for (k = 0; k < RPN; k++) {
        rp = ROPES[k]; if (!rp.on) continue;
        al = clamp((rp.life - rp.t) / 0.45, 0, 1); P = rp.pts; ctx.globalAlpha = al;
        for (i = 0; i < rp.n; i++) {
          i0 = i > 0 ? i - 1 : 0; i1 = i < rp.n - 1 ? i + 1 : i; ang = Math.atan2(P[i1 * 4 + 1] - P[i0 * 4 + 1], P[i1 * 4] - P[i0 * 4]);
          drawLink(ctx, P[i * 4], P[i * 4 + 1], ang, rp.size, ((i + rp.par) & 1) ? HP + Math.sin(rp.t * rp.tw) * 0.35 : 0.05 + Math.abs(Math.sin(rp.t * rp.tw * 0.7)) * 0.5);
        }
      }
      // débris : maillons, pièces, éclats
      for (k = 0; k < CAP; k++) {
        p = DEB[k]; if (!p.on) continue;
        ctx.globalAlpha = Math.min(1, (p.life - p.t) / 0.4);
        if (p.k === 0) drawLink(ctx, p.x, p.y, p.rot, p.s, p.ph);
        else if (p.k === 1) {
          w = CW * p.s / 26; h = SH * p.s / 26;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.drawImage(atlas, frameOf(p.ph) * CW, CH, CW, SH, -w / 2, -h / 2, w, h); ctx.restore();
        } else {
          w = CW * p.s / 24; h = SH * p.s / 24; sq = 0.35 + 0.65 * Math.abs(Math.cos(p.ph));
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, sq); ctx.drawImage(atlas, p.v * CW, CH + SH, CW, SH, -w / 2, -h / 2, w, h); ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
      // étincelles : traits durs dans le sens du mouvement (4 teintes)
      ctx.lineCap = 'round';
      for (c = 0; c < 4; c++) {
        ctx.strokeStyle = SPCOL[c]; ctx.lineWidth = c < 2 ? 2.4 : 1.6; ctx.beginPath();
        for (k = 0; k < SPN; k++) {
          p = SPK[k]; if (!p.on || p.c !== c) continue;
          L = 0.035 * (1 - p.t / p.life); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * L, p.y - p.vy * L);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
    function clear() { var k; for (k = 0; k < CAP; k++) DEB[k].on = 0; for (k = 0; k < SPN; k++) SPK[k].on = 0; for (k = 0; k < RGN; k++) RNG[k].on = 0; for (k = 0; k < RPN; k++) ROPES[k].on = 0; slowT = 0; active = false; }
    return {
      ready: ready, chain: chain, chainN: chainN, drawChain: drawChain, snap: snap, impact: impact, stress: stress, slow: slow, ring: ring,
      coin: coin, coins: coins, cannon: cannon, rain: rain, path: path, drawPath: drawPath, pathPoint: pathPoint, spark: spark,
      link: function (ctx, x, y, rot, size, phi) { if (ready()) drawLink(ctx, x, y, rot, size, phi); },
      update: update, draw: draw, clear: clear, active: function () { return active; }
    };
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
