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
 *   Chains.setReduced(true);                                           // mouvement réduit : aucune animation, états finaux immédiats
 *
 * Palette = celle du jeu (or #e6b94a, patine turquoise). Aucun hasard dans le dessin des maillons (rendu identique à chaque image). */
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
  function sprite(size, edge, shadow, dpr) {
    var key = Math.round(size * dpr) + (edge ? 'e' : 'f') + (shadow ? 's' : 'c');
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
    g.addColorStop(0, '#fff1b8'); g.addColorStop(0.22, '#e6b94a'); g.addColorStop(0.6, '#8a6a1e'); g.addColorStop(1, '#4a350c');
    if (edge) { var ge = x.createLinearGradient(0, cy - T * 0.62, 0, cy + T * 0.62); ge.addColorStop(0, '#fff1b8'); ge.addColorStop(0.3, '#e6b94a'); ge.addColorStop(0.7, '#8a6a1e'); ge.addColorStop(1, '#3d2b08'); g = ge; }
    shape(); x.fillStyle = g; x.fill('evenodd');
    // patine : taches turquoise / vert-de-gris, toujours aux mêmes endroits (pas de hasard)
    x.save(); shape(); x.clip('evenodd');
    for (var i = 0; i < 9; i++) {
      var px = cx - L / 2 + L * (((i * 0.37) % 1) * 0.9 + 0.05), py = cy - W / 2 + W * (((i * 0.61 + 0.2) % 1)), pr = (0.09 + (i % 3) * 0.05) * L;
      var pg = x.createRadialGradient(px, py, 0, px, py, pr); pg.addColorStop(0, 'rgba(24,181,164,.30)'); pg.addColorStop(1, 'rgba(24,181,164,0)');
      x.fillStyle = pg; x.fillRect(px - pr, py - pr, pr * 2, pr * 2);
    }
    x.restore();
    // arêtes : liseré clair dehors, trait sombre au creux de l'anneau, reflet fin sur le haut
    shape(); x.lineWidth = Math.max(1, k * 1.1); x.strokeStyle = 'rgba(255,241,184,.5)'; x.stroke();
    if (!edge) {
      x.beginPath(); rr(x, cx - L / 2 + T, cy - W / 2 + T, L - 2 * T, W - 2 * T, (W - 2 * T) / 2); x.lineWidth = Math.max(1, k * 1.6); x.strokeStyle = 'rgba(25,14,2,.85)'; x.stroke();
      x.beginPath(); x.moveTo(cx - L * 0.28, cy - W / 2 + T * 0.36); x.lineTo(cx + L * 0.2, cy - W / 2 + T * 0.36); x.lineWidth = Math.max(1, k * 1.2); x.lineCap = 'round'; x.strokeStyle = 'rgba(255,252,230,.7)'; x.stroke();
    } else {
      x.beginPath(); x.moveTo(cx - L * 0.3, cy - T * 0.3); x.lineTo(cx + L * 0.28, cy - T * 0.3); x.lineWidth = Math.max(1, k); x.lineCap = 'round'; x.strokeStyle = 'rgba(255,252,230,.6)'; x.stroke();
    }
    cache[key] = c; return c;
  }
  function linkAt(ctx, lk, size, dpr, shadow) {
    var s = sprite(size, lk.e, shadow, dpr), w = s.width / dpr, h = s.height / dpr;
    ctx.save(); ctx.translate(lk.x, lk.y); ctx.rotate(lk.a); ctx.drawImage(s, -w / 2, -h / 2, w, h); ctx.restore();
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
  function draw(ctx, ch, t, opt) {
    opt = opt || {};
    var dpr = opt.dpr || (root.devicePixelRatio || 1), sh = opt.shadow == null ? 3 : opt.shadow;
    if (ch.sway && !opt.still) ch.place(t);
    var i, lk, a = opt.alpha == null ? 1 : opt.alpha;
    if (sh > 0) {   // ombre dure : même silhouette, décalée, sans flou
      ctx.save(); ctx.globalAlpha = 0.55 * a;
      for (i = 0; i < ch.links.length; i++) { lk = ch.links[i]; if (lk.al <= 0.02) continue; ctx.globalAlpha = 0.55 * a * lk.al; linkAt(ctx, { x: lk.x + sh, y: lk.y + sh * 1.3, a: lk.a, e: lk.e }, ch.size, dpr, true); }
      ctx.restore();
    }
    ctx.save();
    for (i = 0; i < ch.links.length; i++) { lk = ch.links[i]; if (lk.al <= 0.02) continue; ctx.globalAlpha = a * lk.al; linkAt(ctx, lk, ch.size, dpr, false); }
    ctx.restore();
  }

  /* ---------- cadenas : anse, corps d'or, serrure en forme d'ankh ; crack = fissures de lumière divine ---------- */
  function lock(ctx, x, y, size, o) {
    o = o || {};
    var s = size, bw = s * 0.9, bh = s * 0.78, by = y - bh * 0.1, crack = clamp(o.crack || 0, 0, 1), t = o.t || 0;
    ctx.save();
    // ombre dure
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); rr(ctx, x - bw / 2 + 4, by + 5, bw, bh, s * 0.14); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 4, by - bh * 0.02 + 5, bw * 0.34, Math.PI, 0); ctx.lineWidth = s * 0.15; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.stroke();
    // anse
    var sg = ctx.createLinearGradient(x - bw / 2, 0, x + bw / 2, 0); sg.addColorStop(0, '#8a6a1e'); sg.addColorStop(0.4, '#fff1b8'); sg.addColorStop(1, '#5b4311');
    ctx.beginPath(); ctx.moveTo(x - bw * 0.34, by + 2); ctx.lineTo(x - bw * 0.34, by - bh * 0.2); ctx.arc(x, by - bh * 0.2, bw * 0.34, Math.PI, 0); ctx.lineTo(x + bw * 0.34, by + 2);
    ctx.lineWidth = s * 0.15; ctx.lineCap = 'butt'; ctx.strokeStyle = sg; ctx.stroke();
    // corps
    var bg = ctx.createLinearGradient(0, by, 0, by + bh); bg.addColorStop(0, '#fff1b8'); bg.addColorStop(0.18, '#e6b94a'); bg.addColorStop(0.65, '#8a6a1e'); bg.addColorStop(1, '#4a350c');
    ctx.beginPath(); rr(ctx, x - bw / 2, by, bw, bh, s * 0.14); ctx.fillStyle = bg; ctx.fill();
    ctx.lineWidth = Math.max(1.5, s * 0.03); ctx.strokeStyle = '#3d2b08'; ctx.stroke();
    ctx.beginPath(); rr(ctx, x - bw / 2 + s * 0.06, by + s * 0.06, bw - s * 0.12, bh - s * 0.12, s * 0.1); ctx.strokeStyle = 'rgba(255,241,184,.45)'; ctx.lineWidth = Math.max(1, s * 0.02); ctx.stroke();
    // patine turquoise au bas
    var pg = ctx.createLinearGradient(0, by + bh * 0.6, 0, by + bh); pg.addColorStop(0, 'rgba(24,181,164,0)'); pg.addColorStop(1, 'rgba(24,181,164,.28)');
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
        ctx.strokeStyle = 'rgba(255,236,160,' + (0.85 * pulse) + ')'; ctx.lineWidth = Math.max(1.5, s * 0.035); ctx.stroke();
        ctx.strokeStyle = 'rgba(120,255,235,' + (0.35 * pulse) + ')'; ctx.lineWidth = Math.max(3, s * 0.09); ctx.stroke();
      });
      var gl = ctx.createRadialGradient(x, ky, 0, x, ky, s * (0.9 + crack)); gl.addColorStop(0, 'rgba(255,236,160,' + (0.5 * crack * pulse) + ')'); gl.addColorStop(1, 'rgba(255,200,80,0)');
      ctx.fillStyle = gl; ctx.fillRect(x - s * 2, ky - s * 2, s * 4, s * 4);
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
        var p = parts[k], al = 1 - p.life / p.max; ctx.globalAlpha = al; ctx.fillStyle = p.shard ? '#ffe9a0' : '#fff6d0';
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
        g.addColorStop(0, 'rgba(255,236,160,0)'); g.addColorStop(0.5, 'rgba(255,236,160,.55)'); g.addColorStop(1, 'rgba(255,236,160,0)'); ctx.fillStyle = g; ctx.fillRect(gx - 40, 0, 80, h); ctx.restore();
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

  root.Chains = {
    make: make, draw: draw, lock: lock, shatter: shatter, reform: reform, header: header,
    setReduced: function (v) { reduced = !!v; }, isReduced: function () { return reduced }
  };
})(typeof window !== 'undefined' ? window : this);
