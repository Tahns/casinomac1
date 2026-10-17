/* ANUBIS UNCHAINED — le motif des chaînes (canvas 2D, aucun fichier) : maillons d'or patiné à ombre dure, chaîne tendue entre deux points,
 * cadenas, animation « se brise » (maillons qui éclatent, éclats, onde de lumière) et « se reforme » (maillons qui reviennent s'emboîter).
 * Réutilisable par tous les écrans (accueil, en-tête, bonus, gros gains) :
 *
 *   var ch = Chains.make(x0, y0, x1, y1, { size: 26, sag: 0.08 });     // chaîne (size = longueur d'un maillon, sag = flèche en fraction de la longueur)
 *   Chains.draw(ctx, ch, t);                                           // dessine (t en secondes : léger balancement si ch.sway > 0)
 *   Chains.lock(ctx, x, y, size, { crack: 0..1 });                     // cadenas à serrure en ankh (crack : fissures de lumière)
 *   var a = Chains.shatter([ch1, ch2], { x, y, power: 1, onDone });    // « se brise » : a.update(dt) puis a.draw(ctx) à chaque image, a.done
 *   var r = Chains.reform([ch1, ch2], { x, y, dur: 1.1, onLink, onDone }); // « se reforme » : même interface
 *   var h = Chains.header(canvasElement);                              // petit effet d'en-tête : h.breakNow(), h.reform(), h.destroy()
 *   Chains.unchain / entry / exit : séquences cinématiques (accueil, entrée et sortie de bonus), voir plus bas.
 *   Chains.setReduced(true);                                           // mouvement réduit : aucune animation, états finaux immédiats
 *
 * Palette = celle du jeu (or #cfa94c, patine turquoise). Aucun hasard dans le dessin des maillons (rendu identique à chaque image). */
(function (root) {
  'use strict';
  var TAU = Math.PI * 2, reduced = false;
  try { if (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches) reduced = true; } catch (e) {}

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeOutBack(u) { var c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); }
  function easeOutCubic(u) { return 1 - Math.pow(1 - u, 3); }
  function mk(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  function rr(c, x, y, w, h, r) {   // rectangle arrondi (sans dépendre de roundRect)
    r = Math.min(r, w / 2, h / 2);
    c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.arc(x + w - r, y + r, r, -Math.PI / 2, 0); c.lineTo(x + w, y + h - r);
    c.arc(x + w - r, y + h - r, r, 0, Math.PI / 2); c.lineTo(x + r, y + h); c.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    c.lineTo(x, y + r); c.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5); c.closePath();
  }

  /* ---------- maillons : sprites pré-rendus (face = anneau, tranche = barre), avec leur silhouette pour l'ombre dure ---------- */
  var cache = {};
  function sprite(size, edge, shadow, dpr, dark) {
    var key = Math.round(size * dpr) + (edge ? 'e' : 'f') + (shadow ? 's' : dark ? 'd' : 'c');
    if (cache[key]) return cache[key];
    var k = dpr, L = size * k, W = size * 0.6 * k, T = size * 0.19 * k, pad = Math.ceil(3 * k + 2);
    var c = mk(L + pad * 2, W + pad * 2), x = c.getContext('2d'), cx = c.width / 2, cy = c.height / 2;
    function shape() {
      x.beginPath();
      if (edge) rr(x, cx - L * 0.5 + T * 0.4, cy - T * 0.62, L - T * 0.8, T * 1.24, T * 0.62);
      else { rr(x, cx - L / 2, cy - W / 2, L, W, W / 2); rr(x, cx - L / 2 + T, cy - W / 2 + T, L - 2 * T, W - 2 * T, (W - 2 * T) / 2); }
    }
    if (shadow) { shape(); x.fillStyle = '#000'; x.fill('evenodd'); cache[key] = c; return c; }
    // métal : dégradé haut clair -> bas sombre, comme un cylindre d'or éclairé par le haut
    var g = x.createLinearGradient(0, cy - W / 2, 0, cy + W / 2);
    bands(g);
    if (edge) { var ge = x.createLinearGradient(0, cy - T * 0.62, 0, cy + T * 0.62); bands(ge); g = ge; }
    shape(); x.fillStyle = g; x.fill('evenodd'); if (window.Art) { shape(); window.Art.grain(x, 'evenodd'); }
    // patine : taches turquoise / vert-de-gris, toujours aux mêmes endroits (pas de hasard)
    x.save(); shape(); x.clip('evenodd');
    for (var i = 0; i < 9; i++) {
      var px = cx - L / 2 + L * (((i * 0.37) % 1) * 0.9 + 0.05), py = cy - W / 2 + W * (((i * 0.61 + 0.2) % 1)), pr = (0.09 + (i % 3) * 0.05) * L;
      var pg = x.createRadialGradient(px, py, 0, px, py, pr); pg.addColorStop(0, 'rgba(31,165,150,.30)'); pg.addColorStop(1, 'rgba(31,165,150,0)');
      x.fillStyle = pg; x.fillRect(px - pr, py - pr, pr * 2, pr * 2);
    }
    x.restore();
    // arêtes : liseré clair dehors, trait sombre au creux de l'anneau, reflet fin sur le haut
    shape(); x.lineWidth = Math.max(1, k * 1.1); x.strokeStyle = 'rgba(239,223,168,.5)'; x.stroke();
    if (!edge) {
      x.beginPath(); rr(x, cx - L / 2 + T, cy - W / 2 + T, L - 2 * T, W - 2 * T, (W - 2 * T) / 2); x.lineWidth = Math.max(1, k * 1.6); x.strokeStyle = 'rgba(25,14,2,.85)'; x.stroke();
      x.beginPath(); x.moveTo(cx - L * 0.28, cy - W / 2 + T * 0.36); x.lineTo(cx + L * 0.2, cy - W / 2 + T * 0.36); x.lineWidth = Math.max(1, k * 1.2); x.lineCap = 'round'; x.strokeStyle = 'rgba(255,252,230,.7)'; x.stroke();
    } else {
      x.beginPath(); x.moveTo(cx - L * 0.3, cy - T * 0.3); x.lineTo(cx + L * 0.28, cy - T * 0.3); x.lineWidth = Math.max(1, k); x.lineCap = 'round'; x.strokeStyle = 'rgba(255,252,230,.6)'; x.stroke();
    }
    if (dark) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(14,8,0,.5)'; x.fillRect(0, 0, c.width, c.height); }   // face arrière / dans l'ombre
    cache[key] = c; return c;
  }
  function linkAt(ctx, x, y, a, e, size, dpr, shadow) {
    var s = sprite(size, e, shadow, dpr), w = s.width / dpr, h = s.height / dpr;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.drawImage(s, -w / 2, -h / 2, w, h); ctx.restore();
  }

  /* ---------- une chaîne : maillons placés le long d'une courbe (flèche = pesanteur) ---------- */
  function make(x0, y0, x1, y1, o) {
    o = o || {};
    var ch = { x0: x0, y0: y0, x1: x1, y1: y1, size: o.size || 24, sag: o.sag == null ? 0.06 : o.sag, sway: o.sway || 0, links: [], seed: o.seed || 0 };
    ch.place = function (t) {
      var dx = x1 - x0, dy = y1 - y0, len = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / len, ny = dx / len;
      var sag = ch.sag * len * (ch.sag < 0 ? 1 : 1), swing = ch.sway ? Math.sin((t || 0) * 1.1 + ch.seed) * ch.sway : 0;
      // point de contrôle : milieu + pesanteur (vers le bas de l'écran) + balancement
      var cxm = (x0 + x1) / 2 + nx * swing, cym = (y0 + y1) / 2 + Math.abs(sag) + ny * swing;
      function pt(u) { var a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; return [a * x0 + b * cxm + c * x1, a * y0 + b * cym + c * y1]; }
      var tab = [], i, prev = pt(0), acc = 0; tab.push(0);
      for (i = 1; i <= 80; i++) { var p = pt(i / 80); acc += Math.hypot(p[0] - prev[0], p[1] - prev[1]); tab.push(acc); prev = p; }
      var pitch = ch.size * 0.8, n = Math.max(1, Math.round(acc / pitch));
      if (ch.links.length !== n) { ch.links = []; for (i = 0; i < n; i++) ch.links.push({ e: i % 2 === 1, state: 'idle', x: 0, y: 0, a: 0, hx: 0, hy: 0, ha: 0, vx: 0, vy: 0, va: 0, al: 1, d: 0 }); }
      var j = 0;
      for (i = 0; i < n; i++) {
        var target = (i + 0.5) / n * acc;
        while (j < 79 && tab[j + 1] < target) j++;
        var u = (j + (target - tab[j]) / ((tab[j + 1] - tab[j]) || 1)) / 80, p0 = pt(u), p1 = pt(Math.min(1, u + 0.004)), lk = ch.links[i];
        lk.hx = p0[0]; lk.hy = p0[1]; lk.ha = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
        if (lk.state === 'idle') { lk.x = lk.hx; lk.y = lk.hy; lk.a = lk.ha; }
      }
      return ch;
    };
    return ch.place(0);
  }
  function draw(ctx, ch, t, opt) {   // opt : dpr, shadow (px), alpha, still, jit (px : tremblement des maillons sous tension), jt (temps du tremblement)
    opt = opt || {};
    var dpr = opt.dpr || (root.devicePixelRatio || 1), sh = opt.shadow == null ? 3 : opt.shadow, jit = opt.jit || 0, jt = opt.jt || 0;
    if (ch.sway && !opt.still) ch.place(t);
    var i, lk, a = opt.alpha == null ? 1 : opt.alpha, jx = 0, jy = 0, n = ch.links.length;
    if (sh > 0) {   // ombre dure : même silhouette, décalée, sans flou
      ctx.save();
      for (i = 0; i < n; i++) {
        lk = ch.links[i]; if (lk.al <= 0.02) continue; ctx.globalAlpha = 0.55 * a * lk.al;
        if (jit) { jx = Math.sin(jt * 93 + i * 2.1) * jit; jy = Math.cos(jt * 77 + i * 1.3) * jit; }
        linkAt(ctx, lk.x + jx + sh, lk.y + jy + sh * 1.3, lk.a, lk.e, ch.size, dpr, true);
      }
      ctx.restore();
    }
    ctx.save();
    for (i = 0; i < n; i++) {
      lk = ch.links[i]; if (lk.al <= 0.02) continue; ctx.globalAlpha = a * lk.al;
      if (jit) { jx = Math.sin(jt * 93 + i * 2.1) * jit; jy = Math.cos(jt * 77 + i * 1.3) * jit; }
      linkAt(ctx, lk.x + jx, lk.y + jy, lk.a, lk.e, ch.size, dpr, false);
    }
    ctx.restore();
  }

  // or patiné à bandes dures (pas de dégradé lisse)
  function bands(g) { g.addColorStop(0, '#efdfa8'); g.addColorStop(0.2, '#efdfa8'); g.addColorStop(0.2, '#cfa94c'); g.addColorStop(0.55, '#cfa94c'); g.addColorStop(0.55, '#8a6a1e'); g.addColorStop(0.82, '#8a6a1e'); g.addColorStop(0.82, '#4f3a12'); g.addColorStop(1, '#4f3a12'); return g; }
  /* ---------- cadenas : anse, corps d'or, serrure en forme d'ankh ; crack = fissures de lumière divine ---------- */
  function lock(ctx, x, y, size, o) {
    o = o || {};
    var s = size, bw = s * 0.9, bh = s * 0.78, by = y - bh * 0.1, crack = clamp(o.crack || 0, 0, 1), t = o.t || 0;
    ctx.save();
    // ombre dure
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); rr(ctx, x - bw / 2 + 4, by + 5, bw, bh, s * 0.14); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 4, by - bh * 0.02 + 5, bw * 0.34, Math.PI, 0); ctx.lineWidth = s * 0.15; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.stroke();
    // anse
    var sg = ctx.createLinearGradient(x - bw / 2, 0, x + bw / 2, 0); sg.addColorStop(0, '#8a6a1e'); sg.addColorStop(0.35, '#8a6a1e'); sg.addColorStop(0.35, '#cfa94c'); sg.addColorStop(0.62, '#cfa94c'); sg.addColorStop(0.62, '#efdfa8'); sg.addColorStop(0.8, '#efdfa8'); sg.addColorStop(0.8, '#5b4311'); sg.addColorStop(1, '#5b4311');
    ctx.beginPath(); ctx.moveTo(x - bw * 0.34, by + 2); ctx.lineTo(x - bw * 0.34, by - bh * 0.2); ctx.arc(x, by - bh * 0.2, bw * 0.34, Math.PI, 0); ctx.lineTo(x + bw * 0.34, by + 2);
    ctx.lineWidth = s * 0.15; ctx.lineCap = 'butt'; ctx.strokeStyle = sg; ctx.stroke();
    // corps
    var bg = ctx.createLinearGradient(0, by, 0, by + bh); bands(bg);
    ctx.beginPath(); rr(ctx, x - bw / 2, by, bw, bh, s * 0.14); ctx.fillStyle = bg; ctx.fill(); if (window.Art) { window.Art.grain(ctx); ctx.beginPath(); rr(ctx, x - bw / 2, by, bw, bh, s * 0.14); }
    ctx.lineWidth = Math.max(1.5, s * 0.03); ctx.strokeStyle = '#3d2b08'; ctx.stroke();
    ctx.beginPath(); rr(ctx, x - bw / 2 + s * 0.06, by + s * 0.06, bw - s * 0.12, bh - s * 0.12, s * 0.1); ctx.strokeStyle = 'rgba(239,223,168,.45)'; ctx.lineWidth = Math.max(1, s * 0.02); ctx.stroke();
    // patine turquoise au bas
    var pg = ctx.createLinearGradient(0, by + bh * 0.6, 0, by + bh); pg.addColorStop(0, 'rgba(31,165,150,0)'); pg.addColorStop(1, 'rgba(31,165,150,.28)');
    ctx.beginPath(); rr(ctx, x - bw / 2, by, bw, bh, s * 0.14); ctx.fillStyle = pg; ctx.fill();
    // serrure : ankh sombre
    var kx = x, ky = by + bh * 0.5, ks = s * 0.34;
    ctx.save(); ctx.translate(kx, ky); ctx.scale(ks / 24, ks / 24);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 4.2; ctx.strokeStyle = '#1b1004';
    ctx.beginPath(); ctx.ellipse(0, -8, 5.2, 6.8, 0, 0, TAU); ctx.moveTo(0, -1.2); ctx.lineTo(0, 13); ctx.moveTo(-7, 4); ctx.lineTo(7, 4); ctx.stroke();
    ctx.restore();
    // fissures de lumière (juste avant la brisure)
    if (crack > 0) {
      ctx.globalCompositeOperation = 'lighter';
      var pulse = 0.65 + 0.35 * Math.sin(t * 9);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      [[-0.46, -0.3, -0.1, 0.0, -0.3, 0.3], [0.44, -0.34, 0.1, -0.05, 0.28, 0.34], [0, -0.5, 0.06, -0.2, -0.04, 0.1]].forEach(function (p, i) {
        var u = clamp(crack * 1.4 - i * 0.15, 0, 1); if (u <= 0) return;
        ctx.beginPath(); ctx.moveTo(x + bw * p[0], by + bh * (0.5 + p[1] * 0.5));
        ctx.lineTo(x + bw * (p[0] + (p[2] - p[0]) * u), by + bh * (0.5 + (p[1] + (p[3] - p[1]) * u) * 0.5));
        ctx.lineTo(x + bw * (p[0] + (p[4] - p[0]) * u * 0.9), by + bh * (0.5 + (p[1] + (p[5] - p[1]) * u * 0.9) * 0.5));
        ctx.strokeStyle = 'rgba(234,219,159,' + (0.85 * pulse) + ')'; ctx.lineWidth = Math.max(1.5, s * 0.035); ctx.stroke();
        ctx.strokeStyle = 'rgba(120,255,235,' + (0.35 * pulse) + ')'; ctx.lineWidth = Math.max(3, s * 0.09); ctx.stroke();
      });
    }
    ctx.restore();
  }

  /* ---------- animation « se brise » ---------- */
  function shatter(chains, o) {
    o = o || {};
    chains = [].concat(chains);
    var bx = o.x != null ? o.x : 0, by = o.y != null ? o.y : 0, power = o.power || 1, t = 0, parts = [], all = [], i;
    var maxD = 1;
    chains.forEach(function (ch) { ch.links.forEach(function (lk) { lk.d = Math.hypot(lk.x - bx, lk.y - by); maxD = Math.max(maxD, lk.d); all.push(lk); }); });
    var anim = { done: false, t: 0, flash: 0, ring: 0, shake: 0, sparks: parts, chains: chains };
    if (reduced) { all.forEach(function (lk) { lk.state = 'gone'; lk.al = 0; }); anim.done = true; if (o.onDone) o.onDone(); anim.update = anim.draw = function () {}; return anim; }
    all.forEach(function (lk) {
      lk.state = 'held'; lk.delay = (lk.d / maxD) * 0.32 + Math.random() * 0.04; lk.al = 1;
      var ang = Math.atan2(lk.y - by, lk.x - bx) + (Math.random() - 0.5) * 0.7, sp = (260 + Math.random() * 520) * power * (1.15 - 0.55 * lk.d / maxD);
      lk.vx = Math.cos(ang) * sp; lk.vy = Math.sin(ang) * sp - 160 * power; lk.va = (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 11); lk.life = 0;
    });
    function burst(x, y, n, spd) {
      for (var k = 0; k < n; k++) { var a = Math.random() * TAU, v = spd * (0.35 + Math.random() * 0.9); parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: 0, max: 0.4 + Math.random() * 0.6, s: 1.2 + Math.random() * 2.6, shard: Math.random() < 0.4, a: Math.random() * TAU, va: (Math.random() - 0.5) * 20 }); }
    }
    burst(bx, by, Math.round(70 * power), 520 * power);
    anim.flash = 1; anim.shake = 1;
    anim.update = function (dt) {
      dt = Math.min(dt, 0.05); t += dt; anim.t = t;
      anim.flash = Math.max(0, 1 - t / 0.55); anim.ring = clamp(t / 0.7, 0, 1); anim.shake = Math.max(0, 1 - t / 0.45);
      var alive = 0;
      all.forEach(function (lk) {
        if (lk.state === 'gone') return;
        if (lk.state === 'held') { if (t < lk.delay) { alive++; lk.x += (Math.random() - 0.5) * 2.5; lk.y += (Math.random() - 0.5) * 2.5; return; } lk.state = 'fly'; burst(lk.x, lk.y, 3, 220 * power); }
        lk.life += dt; lk.vy += 980 * dt; lk.x += lk.vx * dt; lk.y += lk.vy * dt; lk.a += lk.va * dt;
        lk.al = clamp(1 - (lk.life - 0.55) / 0.7, 0, 1);
        if (lk.al <= 0) lk.state = 'gone'; else alive++;
      });
      for (i = parts.length - 1; i >= 0; i--) { var p = parts[i]; p.life += dt; p.vy += 700 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt; if (p.life >= p.max) parts.splice(i, 1); }
      if (!alive && !parts.length && t > 0.4 && !anim.done) { anim.done = true; if (o.onDone) o.onDone(); }
    };
    anim.draw = function (ctx, dpr) {
      chains.forEach(function (ch) { draw(ctx, ch, 0, { still: true, dpr: dpr, shadow: 3 }); });
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (var k = 0; k < parts.length; k++) {
        var p = parts[k], al = 1 - p.life / p.max; ctx.globalAlpha = al; ctx.fillStyle = p.shard ? '#eadb9f' : '#f4ecd6';
        if (p.shard) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillRect(-p.s * 1.6, -p.s * 0.4, p.s * 3.2, p.s * 0.8); ctx.restore(); }
        else { ctx.beginPath(); ctx.arc(p.x, p.y, p.s * al + 0.5, 0, TAU); ctx.fill(); }
      }
      ctx.restore();
    };
    return anim;
  }

  /* ---------- animation « se reforme » : les maillons dispersés reviennent s'emboîter (du centre vers les bouts) ---------- */
  function reform(chains, o) {
    o = o || {};
    chains = [].concat(chains);
    var bx = o.x != null ? o.x : 0, by = o.y != null ? o.y : 0, dur = o.dur || 1.1, t = 0, all = [], landed = 0, anim = { done: false, t: 0, chains: chains, flash: 0 };
    chains.forEach(function (ch) { ch.place(0); ch.links.forEach(function (lk) { lk.d = Math.hypot(lk.hx - bx, lk.hy - by); all.push(lk); }); });
    var maxD = 1; all.forEach(function (lk) { maxD = Math.max(maxD, lk.d); });
    if (reduced) { all.forEach(function (lk) { lk.state = 'idle'; lk.al = 1; lk.x = lk.hx; lk.y = lk.hy; lk.a = lk.ha; }); anim.done = true; if (o.onDone) o.onDone(); anim.update = anim.draw = function () {}; return anim; }
    all.forEach(function (lk) {
      var ang = Math.random() * TAU, r = 90 + Math.random() * 200;
      lk.state = 'return'; lk.sx = lk.hx + Math.cos(ang) * r; lk.sy = lk.hy + Math.sin(ang) * r - 40; lk.sa = lk.ha + (Math.random() - 0.5) * 6;
      lk.start = (lk.d / maxD) * dur * 0.55 + Math.random() * 0.06; lk.span = dur * 0.4; lk.al = 0; lk.hit = false;
      lk.x = lk.sx; lk.y = lk.sy; lk.a = lk.sa;
    });
    anim.update = function (dt) {
      dt = Math.min(dt, 0.05); t += dt; anim.t = t; anim.flash = Math.max(0, 1 - Math.abs(t - dur * 0.95) / 0.25) * (t > dur * 0.8 ? 1 : 0);
      all.forEach(function (lk) {
        if (lk.state !== 'return') return;
        var u = clamp((t - lk.start) / lk.span, 0, 1), e = easeOutBack(u), c = easeOutCubic(u);
        lk.x = lk.sx + (lk.hx - lk.sx) * e; lk.y = lk.sy + (lk.hy - lk.sy) * e; lk.a = lk.sa + (lk.ha - lk.sa) * c; lk.al = clamp(u * 2.4, 0, 1);
        if (u >= 1) { lk.state = 'idle'; lk.x = lk.hx; lk.y = lk.hy; lk.a = lk.ha; lk.al = 1; landed++; if (o.onLink && landed % 4 === 0) o.onLink(landed / all.length); }
      });
      if (landed >= all.length && !anim.done) { anim.done = true; if (o.onDone) o.onDone(); }
    };
    anim.draw = function (ctx, dpr) { chains.forEach(function (ch) { draw(ctx, ch, 0, { still: true, dpr: dpr, shadow: 2 }); }); };
    return anim;
  }

  /* ---------- petit effet d'en-tête : une chaîne tendue en haut de l'écran ; elle éclate quand un bonus s'ouvre et se reforme à la sortie ---------- */
  function header(cv, o) {
    o = o || {};
    var ctx = cv.getContext('2d'), ch = null, anim = null, raf = 0, last = 0, dpr = 1, w = 0, h = 0, gleam = -1, gleamTimer = 0, alive = true, broken = false;
    function size() {
      var r = cv.getBoundingClientRect(); dpr = Math.min(root.devicePixelRatio || 1, 2); w = Math.max(1, r.width); h = Math.max(1, r.height);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ch = make(-6, h * 0.5, w + 6, h * 0.5, { size: Math.min(15, h * 0.95), sag: 0 });
      if (broken) ch.links.forEach(function (lk) { lk.state = 'gone'; lk.al = 0; });
      paint();
    }
    function paint() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      if (anim) anim.draw(ctx, dpr); else if (!broken) draw(ctx, ch, 0, { still: true, dpr: dpr, shadow: 1.5 });
      if (gleam >= 0 && !broken) {   // reflet qui court le long de la chaîne
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; var gx = gleam * (w + 120) - 60, g = ctx.createLinearGradient(gx - 40, 0, gx + 40, 0);
        g.addColorStop(0, 'rgba(234,219,159,0)'); g.addColorStop(0.5, 'rgba(234,219,159,.55)'); g.addColorStop(1, 'rgba(234,219,159,0)'); ctx.fillStyle = g; ctx.fillRect(gx - 40, 0, 80, h); ctx.restore();
      }
    }
    function loop(n) {
      raf = 0; if (!alive) return;
      var dt = last ? (n - last) / 1000 : 0.016; last = n;
      if (anim) { anim.update(dt); if (anim.done) { var was = anim; anim = null; if (was.reformed) broken = false; } }
      if (gleam >= 0) { gleam += dt / 1.3; if (gleam > 1) gleam = -1; }
      paint();
      if (anim || gleam >= 0) raf = root.requestAnimationFrame(loop); else last = 0;
    }
    function kick() { if (!raf && alive) raf = root.requestAnimationFrame(loop); }
    var ctl = {
      breakNow: function (sfx) {
        if (broken || !ch) return; broken = true; if (sfx) sfx();
        if (reduced) { ch.links.forEach(function (lk) { lk.state = 'gone'; lk.al = 0; }); paint(); return; }
        anim = shatter(ch, { x: w * (o.x != null ? o.x : 0.5), y: h * 0.5, power: 0.55 }); kick();
      },
      reform: function (sfx) {
        if (!broken || !ch) return;
        if (reduced) { broken = false; ch.links.forEach(function (lk) { lk.state = 'idle'; lk.al = 1; }); ch.place(0); paint(); return; }
        anim = reform(ch, { x: w * 0.5, y: h * 0.5, dur: 1.0, onDone: sfx }); anim.reformed = true; kick();
      },
      isBroken: function () { return broken; },
      resize: size,
      destroy: function () { alive = false; clearInterval(gleamTimer); if (raf) root.cancelAnimationFrame(raf); root.removeEventListener('resize', size); }
    };
    root.addEventListener('resize', size);
    size();
    if (!reduced) gleamTimer = setInterval(function () { if (!document.hidden && !broken && !anim) { gleam = 0; kick(); } }, 9000);
    return ctl;
  }

  /* =====================================================================================================================
   * CINÉMATIQUE « les chaînes cèdent » : maillons en 3D (rotation sur deux axes, profondeur, ombre dure), éclats d'or patiné, étincelles de
   * friction, poussière, ondes de choc. Tout vit dans des pools d'objets pré-alloués (aucune allocation par image).
   *   Chains.unchain({ chains, x, y, size, W, H, floor, dpr, fast })  accueil : tension -> rupture -> éclats (seq.update(dt) puis seq.draw*)
   *   Chains.entry(kind, w, h, { dpr, cx, cy, floor })  entrée de bonus (kind : weigh|scarab|vault|hand|crypt) ; Chains.exit(...) sortie : e.frame(T) puis e.draw(ctx,w,h)
   * ===================================================================================================================== */
  var GRAV = 1700;
  function rnd() { return Math.random(); }
  function link3(ctx, x, y, rz, rx, ry, z, size, dpr, al, shadow, ox, oy) {   // un maillon vu en 3D : rx = tour sur son grand axe (anneau -> tranche), ry = tour sur l'axe vertical
    var cx = Math.cos(rx), ax = Math.abs(cx), cyv = Math.abs(Math.cos(ry)), edge = ax < 0.3, zs = 1 + z / 520;
    var s = sprite(size, edge, shadow, dpr, !shadow && cx < 0 && !edge), w = s.width / dpr, h = s.height / dpr;
    ctx.save(); ctx.translate(x + (shadow ? ox : 0), y + (shadow ? oy : 0)); ctx.rotate(rz); ctx.scale(zs * Math.max(0.35, cyv), zs * (edge ? 1 : Math.max(0.3, ax)));
    ctx.globalAlpha = shadow ? al * 0.55 : al; ctx.drawImage(s, -w / 2, -h / 2, w, h); ctx.restore();
  }
  var chipCache = {};
  function chipSprite(k, dpr, dark) {   // éclat de métal : polygone irrégulier, bandes dures d'or patiné
    var key = k + (dark ? 'd' : 'l') + dpr;
    if (chipCache[key]) return chipCache[key];
    var P = [[[-7, -3], [2, -6], [8, 1], [-1, 5]], [[-6, -5], [7, -2], [3, 5], [-8, 3]], [[-8, 0], [0, -6], [8, -1], [4, 4], [-4, 5]]][k], c = mk(22 * dpr, 16 * dpr), x = c.getContext('2d');
    x.scale(dpr, dpr); x.translate(11, 8); var g = x.createLinearGradient(0, -6, 0, 6); bands(g);
    x.beginPath(); P.forEach(function (p, i) { if (i) x.lineTo(p[0], p[1]); else x.moveTo(p[0], p[1]); }); x.closePath(); x.fillStyle = g; x.fill();
    x.lineWidth = 1; x.strokeStyle = 'rgba(239,223,168,.55)'; x.stroke();
    if (dark) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(14,8,0,.5)'; x.fillRect(-12, -9, 24, 18); }
    return (chipCache[key] = c);
  }
  function newEngine() {
    var lite = !!(root.FX && root.FX.lite), nS = lite ? 44 : 100, nC = lite ? 36 : 84, nP = lite ? 80 : 190, nD = lite ? 18 : 40, i;
    var S = [], C = [], P = [], D = [], R = [], W = 800, H = 600, floor = 600, dpr = 1, tinkAt = 0, tinks = 0;
    for (i = 0; i < nS; i++) S.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, z: 0, vz: 0, rz: 0, wz: 0, rx: 0, wx: 0, ry: 0, wy: 0, sz: 24, fl: 0, b: 0, rest: 0, age: 0, al: 1 });
    for (i = 0; i < nC; i++) C.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, rz: 0, wz: 0, rx: 0, wx: 0, k: 0, s: 1, age: 0, max: 1, fl: 0, b: 0 });
    for (i = 0; i < nP; i++) P.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, age: 0, max: 1, c: 0, w: 1 });
    for (i = 0; i < nD; i++) D.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, r: 4, age: 0, max: 1 });
    for (i = 0; i < 6; i++) R.push({ on: false, x: 0, y: 0, r1: 100, age: 0, dur: 1, w: 4, c: 0 });
    var E = { cols: ['#fff3c4', '#efdfa8', '#d9b857'], ringCols: ['239,223,168', '217,184,87'], onTink: null };
    function take(a) { for (var k = 0; k < a.length; k++) if (!a[k].on) return a[k]; return null; }
    E.bounds = function (w, h, fl, d) { W = w; H = h; floor = fl; dpr = d || 1; tinks = 0; };
    E.link = function (x, y, rz, size, edge, vx, vy) {   // false : pool plein (l'appelant se rabat sur des éclats)
      var s = take(S); if (!s) return false;
      s.on = true; s.x = x; s.y = y; s.vx = vx; s.vy = vy; s.z = 0; s.vz = 120 + rnd() * 320; s.rz = rz; s.rx = edge ? Math.PI / 2 : 0; s.ry = 0; s.wz = (rnd() - 0.5) * 16; s.wx = (rnd() - 0.5) * 22; s.wy = (rnd() - 0.5) * 12;
      s.sz = size; s.fl = floor + (rnd() - 0.5) * H * 0.05; s.b = 0; s.rest = 0; s.age = 0; s.al = 1; return true;
    };
    E.chips = function (x, y, n, spd) {
      for (var k = 0; k < n; k++) {
        var c = take(C); if (!c) return; var a = rnd() * TAU, v = spd * (0.3 + rnd() * 0.8);
        c.on = true; c.x = x; c.y = y; c.vx = Math.cos(a) * v; c.vy = Math.sin(a) * v - spd * 0.3; c.rz = rnd() * TAU; c.wz = (rnd() - 0.5) * 24; c.rx = rnd() * TAU; c.wx = (rnd() - 0.5) * 26;
        c.k = (rnd() * 3) | 0; c.s = 0.7 + rnd() * 0.9; c.age = 0; c.max = 0.8 + rnd() * 0.7; c.fl = floor + (rnd() - 0.5) * H * 0.04; c.b = 0;
      }
    };
    E.sparks = function (x, y, n, spd, ang, spread) {   // ang : direction moyenne (radians) ; spread : demi-ouverture ; pas d'ang = tous azimuts
      for (var k = 0; k < n; k++) {
        var p = take(P); if (!p) return; var a = ang == null ? rnd() * TAU : ang + (rnd() - 0.5) * 2 * spread, v = spd * (0.25 + rnd() * 0.85);
        p.on = true; p.x = x; p.y = y; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v; p.age = 0; p.max = 0.22 + rnd() * 0.5; p.c = (rnd() * 3) | 0; p.w = 1 + rnd() * 1.2;
      }
    };
    E.dust = function (x, y, n, spd) {
      for (var k = 0; k < n; k++) { var d = take(D); if (!d) return; var a = rnd() * TAU; d.on = true; d.x = x; d.y = y; d.vx = Math.cos(a) * spd * rnd(); d.vy = Math.sin(a) * spd * rnd() - spd * 0.15; d.r = 3 + rnd() * 6; d.age = 0; d.max = 0.7 + rnd() * 0.8; }
    };
    E.ring = function (x, y, r1, dur, w, c) { var r = take(R); if (!r) return; r.on = true; r.x = x; r.y = y; r.r1 = r1; r.age = 0; r.dur = dur; r.w = w; r.c = c || 0; };
    E.busy = function () { var k; for (k = 0; k < S.length; k++) if (S[k].on) return true; for (k = 0; k < C.length; k++) if (C[k].on) return true; for (k = 0; k < P.length; k++) if (P[k].on) return true; for (k = 0; k < R.length; k++) if (R[k].on) return true; return false; };
    function step(dt) {
      var k, s, c, p, d, r;
      tinkAt -= dt;
      for (k = 0; k < S.length; k++) {
        s = S[k]; if (!s.on) continue;
        s.age += dt; s.vy += GRAV * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; s.vz -= 700 * dt;
        if (s.z < 0) { s.z = 0; s.vz = s.vz < -80 ? -s.vz * 0.3 : 0; }
        s.rz += s.wz * dt; s.rx += s.wx * dt; s.ry += s.wy * dt;
        if (s.rest > 0) { var fr = Math.pow(0.03, dt); s.rest += dt; s.vx *= fr; s.wx *= fr; s.wy *= fr; s.wz *= fr; s.vy = 0; s.y = s.fl; s.vz = 0; s.z = 0; if (s.rest > 0.35) { s.al = 1 - (s.rest - 0.35) / 0.5; if (s.al <= 0) s.on = false; } }
        else if (s.y > s.fl && s.vy > 0) {
          s.y = s.fl;
          if (s.b >= 2 || s.vy < 150) s.rest = 0.0001;
          else {
            s.vy *= -0.42; s.vx *= 0.72; s.wz *= 0.6; s.wx *= 0.55; s.wy *= 0.55; s.b++; E.dust(s.x, s.y, 1, 70);
            if (tinkAt <= 0 && tinks < 9 && E.onTink) { tinkAt = 0.08; tinks++; E.onTink(Math.min(1, s.vy / -500 + 0.4)); }
          }
        }
        if (s.age > 2.6 || s.x < -150 || s.x > W + 150) s.on = false;
      }
      for (k = 0; k < C.length; k++) {
        c = C[k]; if (!c.on) continue; c.age += dt; c.vy += GRAV * 0.8 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.rz += c.wz * dt; c.rx += c.wx * dt;
        if (c.y > c.fl && c.vy > 0 && c.b < 1) { c.y = c.fl; c.vy *= -0.35; c.vx *= 0.6; c.wz *= 0.5; c.b++; }
        if (c.age >= c.max) c.on = false;
      }
      for (k = 0; k < P.length; k++) { p = P[k]; if (!p.on) continue; p.age += dt; p.vy += 800 * dt; p.vx *= Math.pow(0.35, dt); p.x += p.vx * dt; p.y += p.vy * dt; if (p.age >= p.max) p.on = false; }
      for (k = 0; k < D.length; k++) { d = D[k]; if (!d.on) continue; d.age += dt; d.vx *= Math.pow(0.12, dt); d.vy = d.vy * Math.pow(0.12, dt) - 14 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.r += 22 * dt; if (d.age >= d.max) d.on = false; }
      for (k = 0; k < R.length; k++) { r = R[k]; if (!r.on) continue; r.age += dt; if (r.age >= r.dur) r.on = false; }
    }
    E.update = function (dt) { dt = Math.min(dt, 0.1); if (dt > 0.034) { step(dt / 2); step(dt / 2); } else step(dt); };
    E.draw = function (ctx) {
      var k, s, c, p, d, r, u, f;
      for (k = 0; k < D.length; k++) {   // poussière : disques de sable à bord net, qui enflent en s'éteignant
        d = D[k]; if (!d.on) continue; u = d.age / d.max; ctx.globalAlpha = 0.26 * (1 - u) * (1 - u); ctx.fillStyle = '#b9a073'; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.fill();
      }
      for (k = 0; k < S.length; k++) { s = S[k]; if (s.on) link3(ctx, s.x, s.y, s.rz, s.rx, s.ry, s.z, s.sz, dpr, s.al, true, 3 + s.z * 0.05 + Math.max(0, s.fl - s.y) * 0.03, 4 + s.z * 0.06 + Math.max(0, s.fl - s.y) * 0.04); }
      for (k = 0; k < S.length; k++) { s = S[k]; if (s.on) link3(ctx, s.x, s.y, s.rz, s.rx, s.ry, s.z, s.sz, dpr, s.al, false, 0, 0); }
      for (k = 0; k < C.length; k++) {
        c = C[k]; if (!c.on) continue; f = Math.cos(c.rx); u = 1 - c.age / c.max; var cs = chipSprite(c.k, dpr, f < 0), cw = cs.width / dpr, chh = cs.height / dpr;
        ctx.save(); ctx.globalAlpha = Math.min(1, u * 2.5); ctx.translate(c.x, c.y); ctx.rotate(c.rz); ctx.scale(c.s, c.s * Math.max(0.15, Math.abs(f))); ctx.drawImage(cs, -cw / 2, -chh / 2, cw, chh); ctx.restore();
      }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      for (k = 0; k < P.length; k++) {
        p = P[k]; if (!p.on) continue; u = 1 - p.age / p.max; ctx.globalAlpha = u; ctx.strokeStyle = E.cols[p.c]; ctx.lineWidth = p.w * (0.6 + 0.4 * u);
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.026, p.y - p.vy * 0.026); ctx.stroke();
      }
      for (k = 0; k < R.length; k++) {   // ondes de choc : anneaux durs qui s'amincissent
        r = R[k]; if (!r.on) continue; u = r.age / r.dur; f = 1 - Math.pow(1 - u, 3); ctx.globalAlpha = (1 - u) * 0.85; ctx.strokeStyle = 'rgb(' + E.ringCols[r.c] + ')'; ctx.lineWidth = Math.max(0.8, r.w * (1 - u));
        ctx.beginPath(); ctx.arc(r.x, r.y, Math.max(1, r.r1 * f), 0, TAU); ctx.stroke();
      }
      ctx.restore(); ctx.globalAlpha = 1;
    };
    return E;
  }

  // lueur d'impact : voile radial borné (centre ≤ 0,55 d'opacité) + très léger voile plein écran ; jamais éblouissant
  function flashFx(ctx, w, h, x, y, f, rgb) {
    if (f <= 0.004) return;
    var R = Math.max(w, h);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var g = ctx.createRadialGradient(x, y, 0, x, y, R * (0.18 + 0.5 * (1 - f))); g.addColorStop(0, 'rgba(' + rgb + ',' + (0.36 * f) + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.fillStyle = 'rgba(' + rgb + ',' + (0.05 * f) + ')'; ctx.fillRect(0, 0, w, h); ctx.restore();
  }
  function sfx(name, a, b) { try { var S = root.Sfx; if (S && S[name]) S[name](a, b); } catch (e) {} }
  function shakeFx(m, d) { try { if (m > 0 && root.FX && root.FX.shake) root.FX.shake(m, d); } catch (e) {} }
  function tinkOf(E) { E.onTink = function (v) { sfx('chainTink', v); }; }
  function lockSprite(ls, dpr) {   // le cadenas fissuré, figé dans un canvas (pour le couper en deux)
    var S = Math.ceil(ls * 2.4 * dpr), c = mk(S, S), x = c.getContext('2d'); x.scale(dpr, dpr); lock(x, S / dpr / 2, S / dpr / 2, ls, { crack: 1, t: 0 }); return c;
  }
  function halves(h, x, y) {   // deux moitiés de cadenas : état initial
    h[0].x = h[1].x = x; h[0].y = h[1].y = y; h[0].vx = -(150 + rnd() * 90); h[1].vx = 150 + rnd() * 90; h[0].vy = h[1].vy = -430; h[0].a = h[1].a = 0; h[0].va = -(2 + rnd() * 1.5); h[1].va = 2 + rnd() * 1.5;
  }
  function drawHalves(ctx, spr, h, dpr, al) {
    if (al <= 0) return;
    var w = spr.width / dpr, k;
    ctx.save(); ctx.globalAlpha = al;
    for (k = 0; k < 2; k++) { ctx.save(); ctx.translate(h[k].x, h[k].y); ctx.rotate(h[k].a); ctx.drawImage(spr, k ? spr.width / 2 : 0, 0, spr.width / 2, spr.height, k ? 0 : -w / 2, -w / 2, w / 2, w); ctx.restore(); }
    ctx.restore();
  }
  function moveHalves(h, dt) { for (var k = 0; k < 2; k++) { h[k].vy += GRAV * dt; h[k].x += h[k].vx * dt; h[k].y += h[k].vy * dt; h[k].a += h[k].va * dt; } }

  /* ---------- ACCUEIL : tension -> rupture -> éclats. seq.update(dt réel) ; seq.drawChains / drawLock / drawFx(ctx) ; seq.shake, seq.flash, seq.rise, seq.charge, seq.done ---------- */
  function unchain(o) {
    var chains = o.chains, W = o.W, H = o.H, lx = o.x, ly = o.y, ls = o.size, dpr = o.dpr || 1, cd = o.fast ? 0.55 : 0.9;
    var E = newEngine(), seq = { E: E, t: 0, tb: -1, charge: 0, flash: 0, shake: 0, rise: 0, done: false };
    var pl = [], pc = [], base = [], half = [{}, {}], spr = null, sw = 0, tbs = 0, R1 = Math.max(W, H) * 0.8, maxD = 1, acc = 0, started = false;
    E.bounds(W, H, o.floor || H * 0.92, dpr); tinkOf(E);
    chains.forEach(function (c) { base.push([c.sag, c.sway]); c.links.forEach(function (lk) { pl.push(lk); pc.push(c); }); });
    seq.update = function (rdt) {
      rdt = Math.min(rdt, 0.1); seq.t += rdt;
      var sc = seq.tb < 0 ? 1 : seq.tb < 0.15 ? 0.3 : seq.tb < 0.4 ? 0.3 + 0.7 * (seq.tb - 0.15) / 0.25 : 1, dt = rdt * sc, k, lk, c;   // léger ralenti de 150 ms à la rupture
      if (!started) { started = true; sfx('chainTense', cd); }
      if (seq.tb < 0) {
        var q = clamp(seq.t / cd, 0, 1), e = q * q; seq.charge = q;
        for (k = 0; k < chains.length; k++) { c = chains[k]; c.sag = base[k][0] * (1 - clamp(q * 1.5, 0, 1)); c.sway = base[k][1] * (1 - q); c.place(seq.t); }
        acc += dt * (3 + 90 * e);   // étincelles de friction entre les maillons
        while (acc >= 1) { acc -= 1; lk = pl[(rnd() * pl.length) | 0]; E.sparks(lk.x, lk.y, 1 + ((rnd() * 2) | 0), 150 + 330 * e); }
        if (q >= 1) {   // RUPTURE
          seq.tb = 0; maxD = 1;
          for (k = 0; k < pl.length; k++) { lk = pl[k]; lk.d = Math.hypot(lk.x - lx, lk.y - ly); if (lk.d > maxD) maxD = lk.d; }
          E.ring(lx, ly, R1, 0.8, 5, 0); E.ring(lx, ly, R1 * 0.62, 0.55, 2.5, 1);
          E.sparks(lx, ly, 46, 760); E.chips(lx, ly, 22, 640); E.dust(lx, ly, 14, 240);
          spr = lockSprite(ls, dpr); halves(half, lx, ly); sfx('chainBreak');
        }
      } else {
        seq.tb += rdt; tbs += dt; sw = R1 * (1 - Math.pow(1 - clamp(tbs / 0.8, 0, 1), 3)) * 1.05;   // le front de l'onde libère les maillons
        for (k = 0; k < pl.length; k++) {   // l'onde de choc libère les maillons du centre vers les bords
          lk = pl[k]; if (lk.state === 'gone' || lk.d > sw) continue;
          lk.state = 'gone'; lk.al = 0; c = pc[k];
          var an = Math.atan2(lk.y - ly, lk.x - lx) + (rnd() - 0.5) * 0.8, sp = (230 + rnd() * 430) * 1.1 * (1.15 - 0.55 * lk.d / maxD);
          if (!E.link(lk.x, lk.y, lk.a, c.size, lk.e, Math.cos(an) * sp, Math.sin(an) * sp - 210)) E.chips(lk.x, lk.y, 3, 300); else if (k % 3 === 0) E.chips(lk.x, lk.y, 2, 260);
          if (k % 2 === 0) E.sparks(lk.x, lk.y, 2, 360);
        }
        moveHalves(half, dt);
        seq.shake = Math.pow(Math.max(0, 1 - seq.tb / 0.6), 2);
        seq.flash = seq.tb < 0.05 ? seq.tb / 0.05 : Math.max(0, 1 - (seq.tb - 0.05) / 0.42);
        seq.rise = 1 - Math.pow(1 - clamp(seq.tb / 1.2, 0, 1), 3);
      }
      E.update(dt);
      if (seq.tb > 1.6 && !seq.done && !E.busy()) seq.done = true;
      if (seq.tb > 3.2) seq.done = true;
    };
    seq.drawChains = function (ctx) {
      var k, amp = seq.tb < 0 ? 0.3 + 2.6 * seq.charge * seq.charge : 0;
      for (k = 0; k < chains.length; k++) draw(ctx, chains[k], 0, { still: true, dpr: dpr, shadow: 3, jit: amp * Math.max(0.6, chains[k].size / 28), jt: seq.t });
    };
    seq.drawLock = function (ctx, t) {
      if (seq.tb < 0) { var q = seq.charge, v = q * q * 1.6; ctx.save(); ctx.translate(Math.sin(t * 83) * v, Math.cos(t * 71) * v); lock(ctx, lx, ly, ls, { crack: q, t: t }); ctx.restore(); }
      else if (spr) drawHalves(ctx, spr, half, dpr, clamp(1 - (seq.tb - 0.5) / 0.6, 0, 1));
    };
    seq.drawFx = function (ctx) {
      E.draw(ctx);
      if (seq.tb >= 0 && seq.flash > 0) {
        flashFx(ctx, W, H, lx, ly, seq.flash, '255,236,176');
        if (seq.flash > 0.05 && root.Art) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; root.Art.rays(ctx, lx, ly, Math.max(W, H), 14, seq.tb * 0.5, '#efdfa8', 0.07 * seq.flash); ctx.restore(); }
      }
    };
    return seq;
  }

  /* ---------- BONUS : entrée (la chaîne traverse l'écran, se tend, se brise en révélant la scène) et sortie (elle se reforme, les portes se referment) ---------- */
  var KINDS = {   // acc : couleur d'accent sourde (jamais de néon) ; lay : angles (centre -> bord) des chaînes
    weigh:  { acc: [208, 196, 150], lay: [-0.3, 0.3, Math.PI - 0.3, Math.PI + 0.3] },
    scarab: { acc: [58, 148, 132], lay: 'x' },
    vault:  { acc: [196, 146, 58], lay: [Math.PI / 2, -Math.PI / 2, Math.PI / 2 + 0.5, -Math.PI / 2 - 0.5] },
    hand:   { acc: [160, 58, 42], lay: [0.45, Math.PI - 0.45, Math.PI + 0.45, -0.45, Math.PI / 2, -Math.PI / 2], rage: 1 },
    crypt:  { acc: [114, 96, 164], lay: [Math.PI / 2, Math.PI / 2 + 0.55, Math.PI / 2 - 0.55, -Math.PI / 2 + 0.4, -Math.PI / 2 - 0.4] }
  };
  function hex(a) { return '#' + a.map(function (v) { return ('0' + Math.min(255, Math.round(v * 1.25)).toString(16)).slice(-2); }).join(''); }
  function rig(kind, w, h, o) {
    o = o || {}; var dpr = o.dpr, K = KINDS[kind] || KINDS.vault, lite = !!(root.FX && root.FX.lite), cx = o.cx != null ? o.cx : w / 2, cy = o.cy != null ? o.cy : h / 2, size = clamp(Math.min(w, h) * 0.075, 26, 52), mr = size * 1.95;
    var lay = K.lay === 'x' ? (function () { var a = Math.atan2(h, w); return [a, Math.PI - a, Math.PI + a, TAU - a]; })() : K.lay, acc = K.acc;
    if (lite) lay = lay.slice(0, 4);
    var R = { K: K, w: w, h: h, cx: cx, cy: cy, size: size, mr: mr, dpr: dpr || 1, rays: [], accS: acc.join(','), veilS: [Math.round(6 + acc[0] * 0.07), Math.round(5 + acc[1] * 0.07), Math.round(4 + acc[2] * 0.07)].join(',') };
    lay.forEach(function (an, i) {
      var dx = Math.cos(an), dy = Math.sin(an), tx = dx > 1e-6 ? (w - cx) / dx : dx < -1e-6 ? -cx / dx : 1e9, ty = dy > 1e-6 ? (h - cy) / dy : dy < -1e-6 ? -cy / dy : 1e9, L = Math.min(tx, ty) + size * 1.6;
      var ch = make(cx + dx * L, cy + dy * L, cx + dx * mr * 0.8, cy + dy * mr * 0.8, { size: size, sag: 0.035 + (i % 2) * 0.02 });
      R.rays.push({ ch: ch, dx: dx, dy: dy, len: L, base: ch.sag });
    });
    return R;
  }
  function veilFx(ctx, w, h, R, v) { if (v > 0.002) { ctx.fillStyle = 'rgba(' + R.veilS + ',' + v + ')'; ctx.fillRect(0, 0, w, h); } }

  function entry(kind, w, h, o) {
    o = o || {};
    var R = rig(kind, w, h, o), E = newEngine(), K = R.K, cx = R.cx, cy = R.cy, size = R.size, rage = K.rage ? 1.5 : 1, R1 = Math.max(w, h) * 0.85, tbs = 0, i, k;
    var e = { dur: 2.3, swapAt: 1.16, veil: 0, light: 0, flash: 0, crack: 0, jit: 0, slide: 0, tb: -1, lockA: 0, E: E, last: 0 };
    var pl = [], pc = [], spr = null, half = [{}, {}], sw = 0, maxD = 1, acc = 0, did = 0;
    E.bounds(w, h, o.floor || h * 0.93, R.dpr); tinkOf(E); E.cols = ['#fff3c4', '#efdfa8', hex(K.acc)]; E.ringCols = ['239,223,168', R.accS];
    R.rays.forEach(function (r) { r.ch.links.forEach(function (lk) { pl.push(lk); pc.push(r.ch); }); });
    e.frame = function (T) {
      var dt = Math.min(0.1, Math.max(0, T - e.last)), sl = clamp(T / 0.5, 0, 1), lk, an, sp; e.last = T;
      e.slide = 1 - Math.pow(1 - sl, 3); e.lockA = clamp((T - 0.25) / 0.25, 0, 1);
      if (T < 1.1) {
        var ten = clamp((T - 0.5) / 0.6, 0, 1), t2 = ten * ten;
        e.veil = 0.9 * clamp(T / 0.7, 0, 1); e.crack = ten; e.jit = ten > 0 ? (0.4 + 2.8 * t2) * rage : 0; e.light = ten * 0.5;
        for (i = 0; i < R.rays.length; i++) { var r = R.rays[i]; r.ch.sag = r.base * (1 - clamp(ten * 1.4, 0, 1)); r.ch.place(0); }
        if (T >= 0.5 && !(did & 1)) { did |= 1; sfx('chainSlam'); shakeFx(9, 0.4); E.ring(cx, cy, R.mr * 2.6, 0.45, 5, 1); E.sparks(cx, cy, 22, 420); E.chips(cx, cy, 6, 300); }
        if (T >= 0.58 && !(did & 2)) { did |= 2; sfx('chainTense', 0.5); }
        if (ten > 0) {
          acc += dt * (4 + 100 * t2) * rage;
          while (acc >= 1) { acc -= 1; lk = pl[(rnd() * pl.length) | 0]; E.sparks(lk.x, lk.y, 1 + ((rnd() * 2) | 0), 140 + 320 * t2); }
          shakeFx(0.8 + 3.5 * ten, 0.08);
        }
      } else {
        if (e.tb < 0) {   // RUPTURE
          e.tb = 0; maxD = 1; e.jit = 0; e.crack = 1;
          for (k = 0; k < pl.length; k++) { pl[k].d = Math.hypot(pl[k].x - cx, pl[k].y - cy); if (pl[k].d > maxD) maxD = pl[k].d; }
          E.ring(cx, cy, R1, 0.85, 5 * rage, 0); E.ring(cx, cy, R1 * 0.62, 0.6, 2.5, 1); E.ring(cx, cy, R1 * 0.35, 0.4, 2, 1);
          E.sparks(cx, cy, 54, 780); E.chips(cx, cy, 26, 660); E.dust(cx, cy, 16, 260);
          spr = lockSprite(R.mr, R.dpr); halves(half, cx, cy); sfx('chainBreak', false, kind); shakeFx(22 * rage, 0.7);
        }
        var sc = e.tb < 0.13 ? 0.3 : e.tb < 0.35 ? 0.3 + 0.7 * (e.tb - 0.13) / 0.22 : 1;   // ralenti bref
        dt *= sc; e.tb += dt; tbs += dt; sw = R1 * (1 - Math.pow(1 - clamp(tbs / 0.85, 0, 1), 3)) * 1.05;
        for (k = 0; k < pl.length; k++) {
          lk = pl[k]; if (lk.state === 'gone' || lk.d > sw) continue;
          lk.state = 'gone'; lk.al = 0; an = Math.atan2(lk.y - cy, lk.x - cx) + (rnd() - 0.5) * 0.8; sp = (230 + rnd() * 450) * 1.1 * (1.15 - 0.55 * lk.d / maxD);
          if (!E.link(lk.x, lk.y, lk.a, size, lk.e, Math.cos(an) * sp, Math.sin(an) * sp - 220)) E.chips(lk.x, lk.y, 3, 300); else if (k % 3 === 0) E.chips(lk.x, lk.y, 2, 260);
          if (k % 2 === 0) E.sparks(lk.x, lk.y, 2, 340);
        }
        moveHalves(half, dt);
        e.flash = e.tb < 0.05 ? e.tb / 0.05 : Math.max(0, 1 - (e.tb - 0.05) / 0.4);
        e.veil = 0.9 * (1 - clamp((e.tb - 0.06) / 0.95, 0, 1)); e.light = Math.max(0, 1 - e.tb / 0.7) * 0.6;
      }
      E.update(dt);
    };
    e.draw = function (ctx, w2, h2) {
      veilFx(ctx, w2, h2, R, e.veil);
      if (e.light > 0.01 && root.Art) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; root.Art.rays(ctx, cx, cy, Math.max(w2, h2), 12, e.last * 0.4, 'rgb(' + R.accS + ')', 0.14 * e.light); root.Art.rays(ctx, cx, cy, Math.max(w2, h2), 12, -e.last * 0.3 + 0.2, '#efdfa8', 0.06 * e.light); ctx.restore(); }
      var off = 1 - e.slide, r, v;
      for (i = 0; i < R.rays.length; i++) {
        r = R.rays[i]; ctx.save(); ctx.translate(r.dx * off * (r.len + size * 2), r.dy * off * (r.len + size * 2));
        draw(ctx, r.ch, 0, { still: true, dpr: R.dpr, shadow: 3, jit: e.jit * Math.max(0.6, size / 28), jt: e.last }); ctx.restore();
      }
      if (e.tb < 0) { if (e.lockA > 0) { ctx.save(); ctx.globalAlpha = e.lockA; v = e.jit * 0.4; ctx.translate(Math.sin(e.last * 83) * v, Math.cos(e.last * 71) * v); lock(ctx, cx, cy, R.mr, { crack: e.crack, t: e.last }); ctx.restore(); } }
      else if (spr) drawHalves(ctx, spr, half, R.dpr, clamp(1 - (e.tb - 0.5) / 0.6, 0, 1));
      E.draw(ctx);
      flashFx(ctx, w2, h2, cx, cy, e.flash, '255,' + Math.round(226 + K.acc[1] * 0.04) + ',' + Math.round(150 + K.acc[2] * 0.15));
    };
    return e;
  }

  function exit(kind, w, h, o) {
    o = o || {};
    var R = rig(kind, w, h, o), E = newEngine(), cx = R.cx, cy = R.cy, size = R.size, i, k, maxD = 1, did = 0;
    var e = { dur: 1.7, swapAt: 0.66, veil: 0, flash: 0, doors: 0, slide: 1, E: E, last: 0, lockA: 0 };
    E.bounds(w, h, o.floor || h * 0.93, R.dpr); tinkOf(E); E.ringCols = ['239,223,168', R.accS];
    R.rays.forEach(function (r) { r.ch.sag = 0.012; r.ch.place(0); r.ch.links.forEach(function (lk) { lk.d = Math.hypot(lk.hx - cx, lk.hy - cy); if (lk.d > maxD) maxD = lk.d; }); });
    R.rays.forEach(function (r) {   // départ de chaque maillon : dispersé, en rotation (tirage fait une fois)
      r.its = r.ch.links.map(function (lk) {
        var a = rnd() * TAU, d = 120 + rnd() * 240;
        return { sx: lk.hx + Math.cos(a) * d, sy: lk.hy + Math.sin(a) * d - 60, a0: rnd() * 8 - 4, rx0: (rnd() - 0.5) * 12, ry0: (rnd() - 0.5) * 7, t0: 0.04 + (lk.d / maxD) * 0.2 + rnd() * 0.05, rxE: lk.e ? Math.PI / 2 : 0 };
      });
    });
    e.frame = function (T) {
      var dt = Math.min(0.1, Math.max(0, T - e.last)); e.last = T;
      var close = clamp((T - 0.1) / 0.4, 0, 1), open = clamp((T - 0.7) / 0.7, 0, 1);
      e.doors = (1 - open) * (1 - Math.pow(1 - close, 3)); e.veil = 0.88 * (T < 0.66 ? clamp(T / 0.5, 0, 1) : 1 - open * open);
      e.slide = T < 0.76 ? 1 : 1 - (1 - Math.pow(1 - clamp((T - 0.76) / 0.7, 0, 1), 3));
      if (!(did & 1)) { did |= 1; sfx('chainForge'); }
      if (T >= 0.52 && !(did & 2)) { did |= 2; shakeFx(13, 0.45); E.ring(cx, cy, R.mr * 3, 0.5, 5, 1); E.sparks(cx, cy, 26, 420); E.chips(cx, cy, 8, 300); E.dust(cx, cy, 6, 140); e.flash = 0.7; }
      e.flash = Math.max(0, e.flash - dt * 2.4); e.lockA = clamp((T - 0.3) / 0.2, 0, 1);
      E.update(dt);
    };
    e.draw = function (ctx, w2, h2) {
      veilFx(ctx, w2, h2, R, e.veil);
      if (e.doors > 0.002) {   // portes d'obsidienne : deux battants de pierre à liseré d'or
        var pw = w2 / 2 * e.doors, g = ctx.createLinearGradient(0, 0, 0, h2); g.addColorStop(0, '#0e0a07'); g.addColorStop(0.5, '#1d150c'); g.addColorStop(1, '#0a0705');
        ctx.fillStyle = g; ctx.fillRect(0, 0, pw, h2); ctx.fillRect(w2 - pw, 0, pw, h2);
        if (root.Art && root.Art.stonePat) { ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = root.Art.stonePat(ctx); ctx.fillRect(0, 0, pw, h2); ctx.fillRect(w2 - pw, 0, pw, h2); ctx.restore(); }
        ctx.fillStyle = 'rgba(' + R.accS + ',.5)'; ctx.fillRect(0, 0, pw, 3); ctx.fillRect(w2 - pw, 0, pw, 3);
        ctx.fillStyle = '#b8923a'; ctx.fillRect(pw - 3, 0, 3, h2); ctx.fillRect(w2 - pw, 0, 3, h2);
      }
      var ex = 1 - e.slide, T = e.last, r, ls, it, lk, pass, u, eb, c, al, z, x, y;
      for (i = 0; i < R.rays.length; i++) {
        r = R.rays[i]; ls = r.ch.links; ctx.save(); ctx.translate(r.dx * ex * (r.len + size * 2), r.dy * ex * (r.len + size * 2));
        for (pass = 0; pass < 2; pass++) for (k = 0; k < ls.length; k++) {   // ombre dure d'abord, puis les maillons : position, tours sur deux axes et profondeur s'apaisent
          lk = ls[k]; it = r.its[k]; u = clamp((T - it.t0) / 0.34, 0, 1); eb = 1 + 2.1 * Math.pow(u - 1, 3) + 1.1 * Math.pow(u - 1, 2); c = 1 - Math.pow(1 - u, 3); al = clamp(u * 3, 0, 1); z = (1 - u) * 260;
          x = it.sx + (lk.hx - it.sx) * eb; y = it.sy + (lk.hy - it.sy) * eb;
          link3(ctx, x, y, lk.ha + it.a0 * (1 - c), it.rxE + it.rx0 * (1 - c), it.ry0 * (1 - c), z, size, R.dpr, al, pass === 0, 4 + z * 0.05, 5 + z * 0.07);
        }
        ctx.restore();
      }
      if (e.lockA > 0 && e.slide > 0.02) { ctx.save(); ctx.globalAlpha = e.lockA * e.slide; lock(ctx, cx, cy, R.mr, { crack: 0, t: T }); ctx.restore(); }
      E.draw(ctx);
      flashFx(ctx, w2, h2, cx, cy, e.flash, '255,232,170');
    };
    return e;
  }

  root.Chains = {
    unchain: unchain, entry: entry, exit: exit,
    make: make, draw: draw, lock: lock, shatter: shatter, reform: reform, header: header,
    setReduced: function (v) { reduced = !!v; }, isReduced: function () { return reduced }
  };
})(typeof window !== 'undefined' ? window : this);
