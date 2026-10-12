/* HAND OF ANUBIS — les 4 bonus.
 * Chaque scène REJOUE un script déjà tiré par le noyau mathématique (AnubisMath) : elle n'invente aucun résultat.
 *  - Chute des Scarabées (Plinko)      - Pesée du Cœur (balance)
 *  - Chambre du Trésor (pick-me)       - Main d'Anubis (roue géante à multiplicateurs cumulés) */
(function (root) {
  'use strict';
  var M = root.AnubisMath, A = root.Art, C = A.C, TAU = A.TAU, G = root.G, FX = root.FX, Sfx = root.Sfx;
  var ctx = G.ctx, clamp = G.clamp, mod = G.mod;
  function $(id) { return document.getElementById(id); }
  function hudH() { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hud-h')) || 110; }
  // paysage de téléphone (hauteur < 520 px) : bandeau et réserves verticales réduits
  function T0() { return G.h < 520 ? 38 : clamp(G.h * 0.075, 56, 72); }
  function EX(n) { return G.h < 520 ? Math.round(n * 0.45) : n; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------------- éléments communs ---------------- */
  function plate(cx, y, text, sub, alpha) {
    var w = G.w, fs = G.h < 520 ? 16 : clamp(w * 0.034, 17, 34), subS = clamp(w * 0.0125, 11, 15);
    ctx.save(); if (alpha != null) ctx.globalAlpha = alpha;
    ctx.font = '900 ' + fs + 'px Cinzel, serif'; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '4px';
    var tw = Math.min(w * 0.94, ctx.measureText(text).width + fs * 3), th = fs * 1.9 + (sub ? subS * 1.6 : 0);
    var x = cx - tw / 2;
    A.roundRect(ctx, x, y, tw, th, 12);
    var g = ctx.createLinearGradient(0, y, 0, y + th); g.addColorStop(0, 'rgba(36,26,12,.94)'); g.addColorStop(1, 'rgba(10,7,4,.94)');
    ctx.fillStyle = g; ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 2; ctx.strokeStyle = A.goldGrad(ctx, x, y, x + tw, y + th); ctx.stroke();
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px';
    G.goldText(text, cx, y + fs * 1.05, fs, { spacing: 4, blur: 14 });
    if (sub) G.txt(sub, cx, y + fs * 1.05 + fs * 0.9 + subS * 0.2, { size: subS, family: 'Manrope', weight: 600, fill: '#cdb98a' });
    ctx.restore();
  }

  function totalBox(S, y, label) {
    var w = G.w, fs = clamp(w * 0.03, 20, 36);
    var txt = '×' + G.fmt(Math.round(S.total * 100) / 100);
    ctx.save();
    var scale = 1 + (S.pop || 0) * 0.18;
    ctx.translate(G.cx, y); ctx.scale(scale, scale);
    G.txt(label, 0, -fs * 0.95, { size: clamp(w * 0.011, 10, 13), family: 'Manrope', weight: 800, fill: '#b9a780', spacing: 4 });
    G.goldText(txt, 0, 0, fs, { blur: 24 });
    ctx.restore();
  }

  function boltPath(x0, y0, x1, y1, n, amp) {
    var pts = [[x0, y0]];
    for (var i = 1; i < n; i++) { var t = i / n; pts.push([lerp(x0, x1, t) + (Math.random() - 0.5) * amp, lerp(y0, y1, t) + (Math.random() - 0.5) * amp * 0.4]); }
    pts.push([x1, y1]); return pts;
  }
  function drawBolt(x0, y0, x1, y1, col, wd) {
    var pts = boltPath(x0, y0, x1, y1, 9, 60);
    [[wd * 4, 0.18], [wd * 1.8, 0.5], [wd * 0.7, 1]].forEach(function (p, i) {
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); pts.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
      ctx.strokeStyle = i === 2 ? '#ffffff' : col; ctx.globalAlpha = p[1]; ctx.lineWidth = p[0]; ctx.lineJoin = 'round'; ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  function quick() { return G.turbo || (G.S && G.S.auto > 0); }   // turbo / auto-play : aucune attente du joueur

  function waitTap(S, sec) {
    return new Promise(function (res) {
      var done = false;
      function fin() { if (!done) { done = true; S.tap = null; res(); } }
      S.tap = fin; G.sleep(sec).then(fin);
    });
  }

  // dessine l'enveloppe commune (titre, total, bannière, résultat final)
  function chrome(S) {
    var w = G.w, h = G.h;
    plate(G.cx, T0(), S.title, S.sub ? null : null);
    if (S.showTotal) {
      if (h < 520) { ctx.save(); ctx.translate(w - 64 - G.cx, 62); totalBox(S, 40, I18N.t().total); ctx.restore(); } // coin haut-droit, sous les boutons
      else totalBox(S, T0() + clamp(w * 0.034, 17, 34) * 1.9 + 52, I18N.t().total);
    }
    if (S.banner) {
      var b = S.banner, k = G.ease.outBack(clamp(b.t / 0.4, 0, 1));
      ctx.save(); ctx.translate(G.cx, G.cy); ctx.scale(k, k);
      G.goldText(b.text, 0, 0, clamp(w * 0.055, 24, 56), { blur: 34, spacing: 3 });
      ctx.restore();
    }
    if (S.final) {
      var f = S.final, T = I18N.t(), u = Math.min(w, h), a = clamp(f.t / 0.3, 0, 1), sc = G.ease.outBack(clamp(f.t / 0.5, 0, 1));
      ctx.fillStyle = 'rgba(4,3,2,' + 0.68 * a + ')'; ctx.fillRect(0, 0, w, h);
      A.rays(ctx, G.cx, G.cy, Math.max(w, h), 18, f.t * 0.4, '#ffd86a', 0.13 * a);
      ctx.save(); ctx.translate(G.cx, G.cy); ctx.scale(sc, sc);
      G.goldText(T.bonusWin, 0, -u * 0.17, clamp(u * 0.055, 20, 44), { spacing: 5 });
      G.goldText('×' + G.fmt(Math.round(f.count * 100) / 100), 0, 0, clamp(u * 0.16, 54, 150), { blur: 44 });
      G.txt(G.fmt(Math.round(f.count * f.bet * 100) / 100), 0, u * 0.14, { size: clamp(u * 0.06, 22, 54), fill: '#fff1b8', stroke: '#2a1a02', shadow: 'rgba(255,200,60,.6)' });
      ctx.restore();
    }
  }
  function chromeUpdate(S, dt) {
    S.total += (S.totalT - S.total) * Math.min(1, dt * 7);
    if (Math.abs(S.totalT - S.total) < 0.005) S.total = S.totalT;
    S.pop = Math.max(0, (S.pop || 0) - dt * 3);
    if (S.banner) S.banner.t += dt;
    if (S.final) { S.final.t += dt; S.final.count = Math.min(S.final.mult, S.final.count + (S.final.mult / 1.0) * dt); }
  }
  function bump(S, to) { S.totalT = to; S.pop = 1; }

  async function settle(S, sp, bet) {
    var T = I18N.t();
    await G.sleep(0.5);
    if (sp.boost > 1) {
      S.banner = { text: T.boostApplied + ' ×' + sp.boost, t: 0 };
      Sfx.oracle(); FX.flash(0.4, '#ffe9a0'); FX.ring(G.cx, G.cy, '#ffe9a0', G.R, 1);
      await G.sleep(1.1);
      bump(S, sp.bonus.total * sp.boost); Sfx.chime(20); FX.spark(G.cx, G.cy, 40, '#ffd86a', 420);
      await G.sleep(1.1);
      S.banner = null;
    }
    S.final = { mult: sp.pay, bet: bet, count: 0, t: 0 };
    G.say('');
    Sfx.chime(sp.pay); FX.coins(G.cx, G.cy + G.h * 0.2, 28, 1000, 120); FX.flash(0.25, '#ffe9a0');
    await waitTap(S, 3.2);
    S.final = null;
  }

  function newScene(title) {
    var S = { showsWheel: false, dim: 0.72, total: 0, totalT: 0, pop: 0, title: title, showTotal: true, tap: null, banner: null, final: null };
    S.pointer = function (x, y, type) {
      if (type === 'down' && S.tap) { S.tap(); return; }
      if (S.onPointer) S.onPointer(x, y, type);
    };
    return S;
  }

  /* ======================================================================
   * 1. CHUTE DES SCARABÉES — Plinko 8 rangées × 3 scarabées
   * ====================================================================== */
  function scarabScene(sp, bet) {
    var T = I18N.t(), data = sp.bonus, rows = M.SCARAB_ROWS, vals = data.values || M.SCARAB_VALUES;
    var S = newScene(T.scarabIntro), g = {}; S.bgImg = 'abyss'; var ball = null, pegFlash = {}, slotPulse = [], used = 0, floats = [];
    function slotColor(v) { return v >= 25 ? ['#ffe08a', '#b8861e'] : v >= 6 ? ['#c28bff', '#5a2a86'] : v >= 2.5 ? ['#ff7a5a', '#8a1b10'] : v >= 1 ? ['#5b8cff', '#1a3a8a'] : ['#6a5a40', '#2a2118']; }
    S.layout = function () {
      var w = G.w, h = G.h, top = T0() + EX(150), bot = h - hudH() - (h < 520 ? 10 : 52);
      g.slotH = clamp((bot - top) * 0.11, 34, 60);
      g.dy = (bot - top - g.slotH - 14) / (rows + 1.2);
      g.dx = Math.min(g.dy * 1.55, (w * 0.94) / 9.2);
      g.top = top; g.pegR = Math.max(3, Math.min(g.dx, g.dy) * 0.12); g.ballR = g.pegR * 2.4;
      g.slotTop = top + (rows + 1) * g.dy + 6;
    };
    function peg(r, j) { return { x: G.cx + (j - r / 2) * g.dx, y: g.top + (r + 1) * g.dy }; }
    S.update = function (dt) {
      chromeUpdate(S, dt);
      for (var k in pegFlash) { pegFlash[k] -= dt * 3; if (pegFlash[k] <= 0) delete pegFlash[k]; }
      for (var i = 0; i < slotPulse.length; i++) if (slotPulse[i] > 0) slotPulse[i] = Math.max(0, slotPulse[i] - dt * 1.6);
      for (i = floats.length - 1; i >= 0; i--) { floats[i].t += dt; if (floats[i].t > 1.4) floats.splice(i, 1); }
      if (ball) { ball.trail.unshift([ball.x, ball.y]); if (ball.trail.length > 16) ball.trail.pop(); }
    };
    S.draw = function () {
      var i, r, j;
      // plateau en triangle sombre
      var ap = peg(0, 0), l = peg(rows - 1, 0), rr = peg(rows - 1, rows - 1);
      ctx.save();
      ctx.beginPath(); ctx.moveTo(ap.x, g.top - g.dy * 0.4); ctx.lineTo(rr.x + g.dx * 0.9, g.slotTop); ctx.lineTo(l.x - g.dx * 0.9, g.slotTop); ctx.closePath();
      var bgG = ctx.createLinearGradient(0, g.top, 0, g.slotTop); bgG.addColorStop(0, 'rgba(255,216,106,.02)'); bgG.addColorStop(1, 'rgba(255,216,106,.10)');
      ctx.fillStyle = bgG; ctx.fill(); ctx.strokeStyle = 'rgba(230,185,74,.35)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();
      // chevilles
      for (r = 0; r < rows; r++) for (j = 0; j <= r; j++) {
        var p = peg(r, j), f = pegFlash[r + '_' + j] || 0;
        if (f > 0) { ctx.fillStyle = 'rgba(255,230,140,' + f * 0.5 + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, g.pegR * (2 + f * 3), 0, TAU); ctx.fill(); }
        ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.arc(p.x + g.pegR * 0.35, p.y + g.pegR * 0.6, g.pegR, 0, TAU); ctx.fill();
        if (!G.icon(ctx, 'peg', p.x, p.y, g.pegR * 3.3)) {
          ctx.beginPath(); ctx.arc(p.x, p.y, g.pegR, 0, TAU);
          var pg = ctx.createRadialGradient(p.x - g.pegR * 0.3, p.y - g.pegR * 0.3, 0, p.x, p.y, g.pegR); pg.addColorStop(0, '#fff6c8'); pg.addColorStop(1, '#a8801e');
          ctx.fillStyle = pg; ctx.fill();
        }
      }
      // cases
      for (i = 0; i <= rows; i++) {
        var cx = G.cx + (i - rows / 2) * g.dx, v = vals[i], col = slotColor(v), pl = slotPulse[i] || 0, sw = g.dx * 0.9;
        var x = cx - sw / 2, y = g.slotTop + (1 - 0) * 0;
        A.roundRect(ctx, x, y + g.slotH * 0.12, sw, g.slotH, 8); ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fill();
        A.roundRect(ctx, x, y, sw, g.slotH, 8);
        var sg = ctx.createLinearGradient(0, y, 0, y + g.slotH); sg.addColorStop(0, col[0]); sg.addColorStop(1, col[1]);
        ctx.fillStyle = sg; ctx.fill();
        if (pl > 0) { ctx.fillStyle = 'rgba(255,255,255,' + pl * 0.6 + ')'; ctx.fill(); }
        ctx.lineWidth = 1.5 + pl * 3; ctx.strokeStyle = pl > 0 ? '#fff6c8' : 'rgba(255,216,106,.6)'; ctx.stroke();
        G.txt('×' + vals[i], cx, y + g.slotH / 2 + 1, { size: clamp(g.dx * 0.3, 11, 24), weight: 900, fill: i === 4 || vals[i] < 1.2 ? '#fff1d8' : '#fff', stroke: 'rgba(0,0,0,.55)', sw: 3 });
      }
      // traînée + scarabée
      if (ball) {
        for (i = ball.trail.length - 1; i >= 0; i--) {
          var t = ball.trail[i], a = (1 - i / ball.trail.length) * 0.35;
          ctx.fillStyle = 'rgba(255,216,106,' + a + ')'; ctx.beginPath(); ctx.arc(t[0], t[1], g.ballR * (1 - i / 22), 0, TAU); ctx.fill();
        }
        ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(ball.x + g.ballR * 0.8, ball.y + g.ballR * 1.2, g.ballR * 1.1, g.ballR * 0.55, 0, 0, TAU); ctx.fill();
        var gl = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, g.ballR * 3);
        gl.addColorStop(0, 'rgba(255,230,140,.7)'); gl.addColorStop(1, 'rgba(255,230,140,0)');
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(ball.x, ball.y, g.ballR * 3, 0, TAU); ctx.fill();
        ctx.save(); ctx.translate(ball.x, ball.y); ctx.rotate(Math.sin(ball.rot * 0.7) * 0.28);
        if (!G.icon(ctx, 'scarab', 0, 0, g.ballR * 4.6)) A.scarab(ctx, 0, 0, g.ballR * 2.3, '#ffd86a', 'rgba(60,30,0,.7)');
        ctx.restore();
      }
      // scarabées restants
      for (i = 0; i < data.balls.length; i++) {
        ctx.globalAlpha = i >= used ? 1 : 0.22;
        if (!G.icon(ctx, 'scarab', Math.max(30, G.cx - 5.2 * g.dx) + i * 44, T0() + EX(130), 42)) A.scarab(ctx, Math.max(30, G.cx - 5.2 * g.dx) + i * 36, T0() + EX(130), 26, i >= used ? '#ffd86a' : '#6a5a40', 'rgba(60,30,0,.6)');
      }
      ctx.globalAlpha = 1;
      for (i = 0; i < floats.length; i++) {
        var fl = floats[i]; ctx.globalAlpha = 1 - clamp((fl.t - 0.8) / 0.6, 0, 1);
        G.txt('+×' + fl.v, fl.x, fl.y - fl.t * 50, { size: clamp(g.dx * 0.42, 18, 36), weight: 900, fill: '#fff1b8', stroke: '#2a1a02', shadow: 'rgba(255,200,60,.8)' });
      }
      ctx.globalAlpha = 1;
      chrome(S);
    };
    // Chute physique : le scarabée rebondit réellement de cheville en cheville (trajectoires balistiques,
    // contact sur le flanc de la cheville, parfois un petit rebond sur place). Le côté du rebond suit le script
    // déjà tiré, donc la case finale est celle du tirage — seul le chemin visuel est « libre ».
    var gAcc = 0;
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function contactPt(r, c, dirNext) {
      var p = peg(r, c), R0 = g.pegR + g.ballR, a = rnd(0.5, 0.85);
      return { x: p.x + dirNext * R0 * Math.sin(a), y: p.y - R0 * Math.cos(a), p: p };
    }
    // vol balistique de A vers B avec une impulsion verticale initiale (rebond) ; renvoie la durée de vol
    function flight(A, B, apex, speedK) {
      var vy0 = -Math.sqrt(2 * gAcc * apex), disc = vy0 * vy0 + 2 * gAcc * (B.y - A.y), t = (-vy0 + Math.sqrt(Math.max(0, disc))) / gAcc, vx = (B.x - A.x) / t;
      return G.tween(t * speedK, function (u) {
        var tt = u * t; ball.x = A.x + vx * tt; ball.y = A.y + vy0 * tt + 0.5 * gAcc * tt * tt; ball.rot += vx * 0.0009 + 0.02;
      }, null);
    }
    async function drop(b) {
      var d = data.balls[b], col = 0, sk = quick() ? 0.6 : 1;
      gAcc = g.dy * 26;
      var dirs = d.path.map(function (x) { return x ? 1 : -1; });
      var P = contactPt(0, 0, dirs[0]);
      ball = { x: G.cx + rnd(-0.3, 0.3) * g.dx, y: g.top - g.dy * 1.5, rot: rnd(0, 6), trail: [] };
      // chute libre depuis le haut jusqu'à la première cheville
      await flight({ x: ball.x, y: ball.y }, P, 0.0001, sk);
      for (var r = 0; r < rows; r++) {
        var pk = r + '_' + col, pp = peg(r, col);
        pegFlash[pk] = 1; Sfx.tick(r / rows); Sfx.coin(0.7 + r * 0.06); FX.spark(pp.x, pp.y - g.pegR, 5, '#ffe9a0', 130, 0.4);
        var here = { x: ball.x, y: ball.y };
        // petit rebond sur place une fois sur trois
        if (Math.random() < 0.33) {
          await flight(here, { x: here.x + dirs[r] * g.dx * 0.03, y: here.y }, g.dy * rnd(0.12, 0.2), sk);
          Sfx.tick(0.4); here = { x: ball.x, y: ball.y };
        }
        col += d.path[r];
        if (r < rows - 1) {
          var Q = contactPt(r + 1, col, dirs[r + 1]);
          await flight(here, Q, g.dy * rnd(0.2, 0.42), sk);
        } else {
          // dernière cheville : chute dans la case, avec rebond sur le fond
          var sx = G.cx + (col - rows / 2) * g.dx, f3 = { x: ball.x, y: ball.y };
          await flight(here, { x: sx, y: g.slotTop - g.ballR * 0.2 }, g.dy * rnd(0.15, 0.3), sk);
          var f4 = { x: ball.x, y: ball.y };
          await G.tween(0.42 * sk, function (u) { ball.x = lerp(f4.x, sx, G.ease.out3(u)); ball.y = lerp(f4.y, g.slotTop + g.slotH * 0.5, G.ease.outBounce(u)); ball.rot += 0.1; }, null);
        }
      }
      if (col !== d.slot) console.error('plinko: case atteinte ' + col + ' ≠ tirage ' + d.slot);
      var v = d.value;
      slotPulse[d.slot] = 1; used = b + 1; ball = null;
      var sx2 = G.cx + (d.slot - rows / 2) * g.dx, sy = g.slotTop;
      floats.push({ v: v, x: sx2, y: sy - 8, t: 0 });
      bump(S, S.totalT + v); Sfx.chime(v * 2); FX.spark(sx2, sy + g.slotH / 2, 20, '#ffd86a', 260);
      if (v >= 6) { FX.coins(sx2, sy, 14 + v, 800, 30); FX.shake(8, 0.4); FX.flash(0.2, '#ffe9a0'); }
      await G.sleep(0.5);
    }
    S.run = async function () {
      slotPulse = vals.map(function () { return 0; });
      G.say(T.scarabSub);
      await G.sleep(quick() ? 1.2 : 2);
      G.say('');
      for (var b = 0; b < data.balls.length; b++) { await drop(b); await G.sleep(quick() ? 0.1 : 0.4); }
      G.say('');
      await settle(S, sp, bet);
    };
        return S;
  }

  /* ======================================================================
   * 2. PESÉE DU CŒUR
   * ====================================================================== */
  function weighScene(sp, bet) {
    var T = I18N.t(), data = sp.bonus, S = newScene(T.weighIntro), g = {}; S.bgImg = 'judgment';
    var theta = 0, glowSide = -1, dimSide = -1, ph = 0, guess = -1, guessing = false, hoverSide = -1, revealed = false, vals = null, push = 0;
    S.layout = function () {
      var w = G.w, h = G.h;
      if (h < 520) { g.px = G.cx; g.py = h * 0.34; g.L = Math.min(w * 0.26, h * 0.27); g.chain = Math.min(h * 0.11, g.L * 0.55); g.pan = g.L * 0.38; }
      else { g.px = G.cx; g.py = h * 0.42; g.L = Math.min(w * 0.28, h * 0.33); g.chain = Math.min(h * 0.14, g.L * 0.6); g.pan = g.L * 0.4; }
    };
    function endPt(side) { var a = theta, x = side * g.L; return { x: g.px + Math.cos(a) * x, y: g.py + Math.sin(a) * x }; }
    function heart(x, y, s, col) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24); ctx.beginPath();
      ctx.moveTo(0, 9); ctx.bezierCurveTo(-18, -4, -9, -16, 0, -7); ctx.bezierCurveTo(9, -16, 18, -4, 0, 9); ctx.closePath();
      var hg = ctx.createRadialGradient(-3, -4, 0, 0, 0, 16); hg.addColorStop(0, '#ff9a8a'); hg.addColorStop(1, col || '#a01810'); ctx.fillStyle = hg; ctx.fill();
      ctx.lineWidth = 1.2; ctx.strokeStyle = '#5a0c06'; ctx.stroke(); ctx.restore();
    }
    S.update = function (dt) { chromeUpdate(S, dt); ph += dt; push = Math.max(0, push - dt * 0.55); };
    S.draw = function () {
      var u = Math.min(G.w, G.h), i;
      // ombre de contact du socle
      ctx.save(); ctx.translate(g.px, G.h - hudH() - 18); ctx.scale(1, 0.16); var cg0 = ctx.createRadialGradient(0, 0, 0, 0, 0, u * 0.3); cg0.addColorStop(0, 'rgba(0,0,0,.6)'); cg0.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = cg0; ctx.beginPath(); ctx.arc(0, 0, u * 0.3, 0, TAU); ctx.fill(); ctx.restore();
      // pilier
      var pg = ctx.createLinearGradient(g.px - 16, 0, g.px + 16, 0); pg.addColorStop(0, '#6a4f12'); pg.addColorStop(0.5, '#f6d878'); pg.addColorStop(1, '#6a4f12');
      ctx.fillStyle = pg; ctx.fillRect(g.px - u * 0.018, g.py, u * 0.036, G.h - hudH() - g.py - 12);
      ctx.fillStyle = A.goldGrad(ctx, g.px - u * 0.12, 0, g.px + u * 0.12, 0);
      A.roundRect(ctx, g.px - u * 0.12, G.h - hudH() - 34, u * 0.24, 22, 6); ctx.fill();
      A.jackal(ctx, g.px, g.py - u * 0.062, u * 0.036, { glow: 0.9 });
      // fléau
      ctx.save(); ctx.translate(g.px, g.py); ctx.rotate(theta);
      ctx.fillStyle = A.goldGrad(ctx, -g.L, -10, g.L, 10);
      A.roundRect(ctx, -g.L - 8, -u * 0.012, g.L * 2 + 16, u * 0.024, 6); ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = '#5b4311'; ctx.stroke();
      ctx.restore();
      ctx.beginPath(); ctx.arc(g.px, g.py, u * 0.026, 0, TAU); ctx.fillStyle = A.goldGrad(ctx, g.px - 20, g.py - 20, g.px + 20, g.py + 20); ctx.fill(); ctx.stroke();
      // plateaux
      [-1, 1].forEach(function (side, si) {
        var e = endPt(side), cx = e.x, cy = e.y + g.chain, pr = g.pan, dim = dimSide === si ? 0.35 : 1;
        ctx.save(); ctx.globalAlpha = dim;
        // chaînes
        ctx.strokeStyle = 'rgba(246,216,120,.85)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(cx - pr, cy); ctx.moveTo(e.x, e.y); ctx.lineTo(cx + pr, cy); ctx.moveTo(e.x, e.y); ctx.lineTo(cx, cy - pr * 0.1); ctx.stroke();
        if (guessing && (hoverSide === si)) { ctx.fillStyle = 'rgba(255,236,150,' + (0.16 + 0.1 * Math.sin(G.t * 7)) + ')'; ctx.beginPath(); ctx.arc(cx, cy, pr * 1.9, 0, TAU); ctx.fill(); }
        if (guess === si && push > 0.05 && !revealed) { var pgl = ctx.createRadialGradient(cx, cy, 0, cx, cy, pr * 2.4); pgl.addColorStop(0, 'rgba(111,240,221,' + Math.min(0.6, push * 0.45) + ')'); pgl.addColorStop(1, 'rgba(111,240,221,0)'); ctx.fillStyle = pgl; ctx.beginPath(); ctx.arc(cx, cy, pr * 2.4, 0, TAU); ctx.fill(); }
        if (guess === si) A.ankh(ctx, cx, cy - pr * 1.55, pr * 0.5, '#6ff0dd');
        if (glowSide === si) {
          var gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, pr * 2.3); gl.addColorStop(0, 'rgba(255,236,150,.7)'); gl.addColorStop(1, 'rgba(255,236,150,0)');
          ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, cy, pr * 2.3, 0, TAU); ctx.fill();
        }
        // objet
        if (si === 0) { A.feather(ctx, cx, cy - pr * 0.42, pr * 0.95, '#fff8e6', 'rgba(150,110,40,.8)'); }
        else { heart(cx, cy - pr * 0.3, pr * 0.9); }
        // bol
        ctx.beginPath(); ctx.ellipse(cx, cy, pr, pr * 0.2, 0, 0, Math.PI, false); ctx.quadraticCurveTo(cx + pr * 0.5, cy + pr * 0.55, cx, cy + pr * 0.58); ctx.quadraticCurveTo(cx - pr * 0.5, cy + pr * 0.55, cx - pr, cy);
        ctx.fillStyle = A.goldGrad(ctx, cx - pr, cy, cx + pr, cy + pr * 0.5); ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = '#5b4311'; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, cy, pr, pr * 0.2, 0, 0, TAU); ctx.fillStyle = '#e6c25a'; ctx.fill(); ctx.stroke();
        // cartouche
        var cw = pr * 1.5, ch = pr * 0.62, cyy = cy + pr * 0.95;
        A.roundRect(ctx, cx - cw / 2, cyy - ch / 2, cw, ch, ch * 0.5);
        var cg = ctx.createLinearGradient(0, cyy - ch / 2, 0, cyy + ch / 2); cg.addColorStop(0, '#2a1f10'); cg.addColorStop(1, '#0c0804');
        ctx.fillStyle = cg; ctx.fill(); ctx.lineWidth = glowSide === si ? 3 : 1.6; ctx.strokeStyle = glowSide === si ? '#fff6c8' : A.goldGrad(ctx, cx - cw, cyy, cx + cw, cyy); ctx.stroke();
        G.goldText(revealed ? '×' + vals[si] : '×?', cx, cyy + 1, ch * 0.62, { blur: glowSide === si ? 22 : 8 });
        if (G.h >= 520) G.txt(si === 0 ? T.feather : T.heart, cx, cyy - ch * 0.78, { size: clamp(pr * 0.17, 10, 15), family: 'Manrope', weight: 800, fill: '#d8c590', spacing: 3 });
        ctx.restore();
      });
      chrome(S);
    };
    // pronostic : purement ludique, le résultat est déjà fixé
    function waitGuess() {
      return new Promise(function (res) {
        var done = false;
        function fin(si) { if (!done) { done = true; guessing = false; S.onPointer = null; res(si); } }
        guessing = true; hoverSide = -1;
        S.onPointer = function (x, y, type) {
          var si = x < g.px ? 0 : 1; hoverSide = si;
          if (type === 'down') { Sfx.chime(2); FX.ring(endPt(si ? 1 : -1).x, endPt(si ? 1 : -1).y + g.chain, '#6ff0dd', g.pan * 1.6, 0.6); fin(si); }
        };
        G.sleep(7).then(function () { fin(Math.random() < 0.5 ? 0 : 1); });
      });
    }
    S.run = async function () {
      G.say(T.weighSub);
      await G.sleep(quick() ? 1.0 : 1.8);
      // choix avant de savoir : les valeurs sont cachées ; le gain (déjà tiré) est celui du plateau choisi
      G.say(T.guessHint);
      guess = quick() ? (Math.random() < 0.5 ? 0 : 1) : await waitGuess();
      var other = data.pair[0] + data.pair[1] - data.total;
      vals = [0, 0]; vals[guess] = data.total; vals[1 - guess] = other;
      await G.sleep(0.4);
      G.say(T.weighing); Sfx.roll(10, 0.09);
      var dir = vals[1] > vals[0] ? 1 : -1, final = dir * 0.30, dur = quick() ? 3.6 : 7, lastSign = 0, mine = guess ? 1 : -1;
      // suspense : la balance hésite, penche vers votre plateau puis revient ; vos touchers lui donnent de l'élan, le verdict reste celui du tirage
      if (!quick()) { G.say(T.pushHint); S.onPointer = function (x, y, type) { if (type === 'down') { push = Math.min(1.5, push + 0.45); Sfx.tick(0.5); FX.spark(G.cx + (mine > 0 ? 1 : -1) * g.L, g.py + g.chain, 4, '#6ff0dd', 140, 0.3); } }; }
      await G.tween(dur, function (u) {
        var env = Math.pow(1 - u, 1.5), lock = clamp((0.9 - u) / 0.25, 0, 1);
        var fake = dir !== mine ? mine * 0.30 * Math.sin(Math.PI * clamp((u - 0.35) / 0.4, 0, 1)) : 0;
        theta = final * G.ease.out3(Math.min(1, u * 1.1)) + 0.3 * env * Math.sin(u * 17 + 0.6) + fake * (1 - u * 0.4) + mine * push * 0.2 * env * lock;
        var s = Math.sign(Math.sin(u * 17 + 0.6));
        if (s !== lastSign && u > 0.05) { lastSign = s; Sfx.drum(0.1 + env * 0.25); }
      }, null);
      S.onPointer = null; push = 0;
      theta = final; Sfx.thud(); FX.shake(14, 0.5);
      revealed = true;
      var wp = endPt(dir); FX.dust(wp.x, wp.y + g.chain + g.pan, 12, '#ffd86a');
      glowSide = guess; dimSide = 1 - guess;
      var cp = endPt(guess ? 1 : -1);
      FX.ring(cp.x, cp.y + g.chain, '#ffe9a0', g.pan * 2.4, 0.9); FX.spark(cp.x, cp.y + g.chain, 40, '#ffe9a0', 420);
      bump(S, data.total); Sfx.chime(data.total); G.say('');
      var ok = data.total > other;
      S.banner = { text: ok ? T.guessRight : T.guessWrong, t: 0 }; if (ok) { Sfx.fanfare(1); FX.spark(G.cx, G.cy, 50, '#6ff0dd', 420); }
      await G.sleep(1.3); S.banner = null;
      await G.sleep(0.9);
      await settle(S, sp, bet);
    };
    return S;
  }

  /* ======================================================================
   * 3. CHAMBRE DU TRÉSOR — pick-me, 12 chambres
   * ====================================================================== */
  function vaultScene(sp, bet) {
    var T = I18N.t(), data = sp.bonus, S = newScene(T.vaultIntro), g = {}; S.bgImg = 'vault'; var tiles = [], n = 0, shield = 0, hover = -1, waiting = false, pickRes = null, shake = 0;
    var cols = 4, rows = 3;
    for (var i = 0; i < cols * rows; i++) tiles.push({ state: 'closed', token: null, u: 0, dim: false, lg: i % 3, crack: 0 });
    S.layout = function () {
      var w = G.w, h = G.h, top = T0() + EX(140), bot = h - hudH() - (h < 520 ? 10 : 52);
      g.t = Math.min((w * 0.92) / (cols * 1.12), (bot - top) / (rows * 1.12), 170); g.gap = g.t * 0.12;
      g.x0 = G.cx - (cols * g.t + (cols - 1) * g.gap) / 2; g.y0 = top + ((bot - top) - (rows * g.t + (rows - 1) * g.gap)) / 2;
    };
    function rect(i) { var c = i % cols, r = Math.floor(i / cols); return { x: g.x0 + c * (g.t + g.gap), y: g.y0 + r * (g.t + g.gap), s: g.t }; }
    var colorOf = { num: ['#f3cf6a', '#7a5a12'], scepter: ['#6a95ff', '#1a3a8a'], ankh: ['#4ff0d8', '#0b6f64'], curse: ['#ff6a50', '#7a1209'] };
    S.update = function (dt) {
      chromeUpdate(S, dt); shake = Math.max(0, shake - dt * 2);
      tiles.forEach(function (t) { if (t.state === 'flipping') t.u = Math.min(1, t.u + dt / 0.5); if (t.u >= 1 && t.state === 'flipping') t.state = 'open'; });
    };
    S.draw = function () {
      var sx = shake > 0 ? (Math.random() - 0.5) * shake * 18 : 0;
      ctx.save(); ctx.translate(sx, 0);
      tiles.forEach(function (t, i) {
        var r = rect(i), cx = r.x + r.s / 2, cy = r.y + r.s / 2, hv = waiting && hover === i && t.state === 'closed';
        var sc = t.state === 'flipping' ? Math.abs(Math.cos(Math.PI * t.u)) : 1, face = t.state === 'open' || (t.state === 'flipping' && t.u > 0.5);
        var lift = hv ? r.s * 0.035 : 0;
        ctx.save(); if (t.dim) ctx.globalAlpha = 0.4;   // épaisseur de la dalle + ombre portée
        A.roundRect(ctx, r.x, r.y + r.s * 0.075, r.s, r.s, r.s * 0.1); ctx.fillStyle = '#120b04'; ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 7; ctx.fill(); ctx.restore();
        var jx = t.crack && t.state === 'closed' ? (Math.random() - 0.5) * t.crack * 3.2 : 0;
        ctx.save(); ctx.translate(cx + jx, cy - lift); ctx.scale(Math.max(0.02, sc), 1 + (t.state === 'flipping' ? Math.sin(Math.PI * t.u) * 0.08 : 0) + (hv ? 0.04 : 0)); ctx.translate(-cx, -cy);
        if (t.dim) ctx.globalAlpha = 0.4;
        A.roundRect(ctx, r.x, r.y, r.s, r.s, r.s * 0.1);
        if (!face) {
          var g1 = ctx.createLinearGradient(r.x, r.y, r.x + r.s, r.y + r.s); g1.addColorStop(0, '#6b5230'); g1.addColorStop(0.5, '#3a2b18'); g1.addColorStop(1, '#241a0e');
          ctx.fillStyle = g1; ctx.shadowColor = hv ? 'rgba(255,216,106,.9)' : 'rgba(0,0,0,.6)'; ctx.shadowBlur = hv ? 26 : 12; ctx.fill(); ctx.shadowBlur = 0;
          ctx.lineWidth = hv ? 3 : 2; ctx.strokeStyle = hv ? '#fff1b8' : A.goldGrad(ctx, r.x, r.y, r.x + r.s, r.y + r.s); ctx.stroke();
          // angles dorés + glyphe
          ctx.strokeStyle = 'rgba(230,185,74,.35)'; ctx.lineWidth = 1; A.roundRect(ctx, r.x + r.s * 0.1, r.y + r.s * 0.1, r.s * 0.8, r.s * 0.8, r.s * 0.06); ctx.stroke();
          ctx.globalAlpha *= hv ? 1 : 0.8;
          if (t.crack) {   // sceau fissuré : la lumière filtre
            var cgl = ctx.createRadialGradient(cx, cy, 0, cx, cy, r.s * 0.6); cgl.addColorStop(0, 'rgba(255,236,150,' + 0.16 * t.crack + ')'); cgl.addColorStop(1, 'rgba(255,236,150,0)');
            ctx.fillStyle = cgl; ctx.fillRect(r.x, r.y, r.s, r.s);
            ctx.save(); ctx.strokeStyle = 'rgba(255,240,170,.95)'; ctx.shadowColor = '#ffd86a'; ctx.shadowBlur = 8 + t.crack * 8; ctx.lineWidth = 1.6 + t.crack * 0.5; ctx.lineJoin = 'round';
            for (var ck = 0; ck < t.crack * 3; ck++) { var ca = ck * 2.4 + t.lg, cl = r.s * (0.16 + 0.13 * t.crack); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ca) * cl * 0.55 + Math.sin(ca * 3) * 5, cy + Math.sin(ca) * cl * 0.55); ctx.lineTo(cx + Math.cos(ca + 0.25) * cl, cy + Math.sin(ca + 0.25) * cl); ctx.stroke(); }
            ctx.restore();
          }
          if (t.lg === 0) A.eye(ctx, cx, cy, r.s * 0.52, '#f1c85a'); else if (t.lg === 1) A.ankh(ctx, cx, cy, r.s * 0.46, '#f1c85a'); else A.pyramid(ctx, cx, cy + r.s * 0.02, r.s * 0.46, '#f1c85a', 'rgba(0,0,0,.5)');
        } else {
          var kind = typeof t.token === 'number' ? 'num' : t.token, col = colorOf[kind];
          var g2 = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.s); g2.addColorStop(0, col[0]); g2.addColorStop(1, col[1]);
          ctx.fillStyle = g2; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff1b8'; ctx.stroke();
          ctx.save(); A.roundRect(ctx, r.x, r.y, r.s, r.s, r.s * 0.1); ctx.clip();
          A.rays(ctx, cx, cy, r.s, 12, G.t * 0.5, '#ffffff', 0.18); ctx.restore();
          if (kind === 'num') { G.icon(ctx, 'coin', cx, cy - r.s * 0.04, r.s * 0.92); G.txt('+' + t.token, cx, cy + r.s * 0.12, { size: r.s * (String(t.token).length > 1 ? 0.3 : 0.38), weight: 900, fill: '#fff8d8', stroke: '#3a2400', sw: r.s * 0.07, shadow: 'rgba(0,0,0,.6)', blur: 6 }); }
          else if (false) G.txt('+' + t.token, cx, cy + r.s * 0.01, { size: r.s * (String(t.token).length > 1 ? 0.4 : 0.5), weight: 900, fill: '#fff8d8', stroke: '#4a3208', shadow: 'rgba(255,255,255,.6)' });
          else if (kind === 'scepter' && G.icon(ctx, 'scepter', cx, cy - r.s * 0.02, r.s * 0.95)) { G.txt('×2', cx, cy + r.s * 0.34, { size: r.s * 0.3, weight: 900, fill: '#fff', stroke: '#0d2466', sw: r.s * 0.06 }); }
          else if (kind === 'scepter') { G.txt('×2', cx, cy - r.s * 0.05, { size: r.s * 0.46, weight: 900, fill: '#fff', stroke: '#0d2466' }); G.txt('SCEPTRE', cx, cy + r.s * 0.3, { size: r.s * 0.11, weight: 800, fill: '#d8e4ff', family: 'Manrope', spacing: 2 }); }
          else if (kind === 'ankh' && G.icon(ctx, 'amulet', cx, cy, r.s * 0.92)) { /* amulette */ }
          else if (kind === 'ankh') { A.ankh(ctx, cx, cy - r.s * 0.02, r.s * 0.55, '#fff', '#0b5a50'); }
          else if (!G.icon(ctx, 'skull', cx, cy, r.s * 0.95)) { A.skull(ctx, cx, cy, r.s * 0.66, '#fff1d8', '#5a0c06'); }
        }
        ctx.restore();
      });
      ctx.restore();
      // boucliers Ankh
      for (var s = 0; s < shield; s++) A.ankh(ctx, G.cx - (shield - 1) * 20 + s * 40, g.y0 - 26, 28, '#4ff0d8');
      chrome(S);
    };
    S.onPointer = function (x, y, type) {
      var h = -1;
      for (var i = 0; i < tiles.length; i++) { var r = rect(i); if (x >= r.x && x <= r.x + r.s && y >= r.y && y <= r.y + r.s) { h = i; break; } }
      hover = h;
      if (type === 'down' && waiting && h >= 0 && tiles[h].state === 'closed' && pickRes) { var f = pickRes; pickRes = null; f(h); }
    };
    function waitPick() {
      return new Promise(function (res) {
        var done = false;
        function fin(i) { if (!done) { done = true; waiting = false; pickRes = null; res(i); } }
        waiting = true; pickRes = fin;
        var auto = (G.turbo || (G.S && G.S.auto > 0)) ? 0.55 : 7;
        G.sleep(auto).then(function () {
          var closed = []; tiles.forEach(function (t, i) { if (t.state === 'closed') closed.push(i); });
          fin(closed[Math.floor(Math.random() * closed.length)]);
        });
      });
    }
    // briser le sceau : 3 touchers (n'importe où), chaque coup fissure la dalle et fait monter la tension
    function crackSeal(i) {
      var t = tiles[i], r = rect(i), cx = r.x + r.s / 2, cy = r.y + r.s / 2;
      G.say(T.crackHint);
      return new Promise(function (res) {
        var done = false, tmr = null, prevPtr = S.onPointer;
        function fin() { if (!done) { done = true; S.onPointer = prevPtr; t.crack = 0; res(); } }
        function arm() { if (tmr) tmr.cancelled = true; var me = tmr = { cancelled: false }; G.sleep(1.3).then(function () { if (!me.cancelled && !done) { hit(); } }); }
        function hit() {
          t.crack++; Sfx.drum(0.18 + t.crack * 0.12); FX.shake(3 + t.crack * 3, 0.25); FX.spark(cx, cy, 6 + t.crack * 4, '#ffe9a0', 160 + t.crack * 60, 0.4);
          if (t.crack >= 3) { FX.flash(0.25, '#ffe9a0'); fin(); } else arm();
        }
        S.onPointer = function (x, y, type) { if (type === 'down') hit(); };
        arm();
      });
    }
    async function reveal(i, rec) {
      var t = tiles[i], r = rect(i), cx = r.x + r.s / 2, cy = r.y + r.s / 2;
      t.token = rec.token; t.state = 'flipping'; t.u = 0; Sfx.reveal();
      await G.sleep(0.28);
      if (rec.token === 'curse') {
        if (rec.saved) { shield--; Sfx.shield(); FX.float(T.vaultSaved, cx, cy - r.s * 0.7, '#6ff0dd', 26); FX.ring(cx, cy, '#6ff0dd', r.s * 1.6, 0.8); FX.flash(0.25, '#6ff0dd'); }
        else { Sfx.curse(); shake = 1; FX.shake(18, 0.7); FX.flash(0.45, '#ff3b20'); FX.float(T.vaultCurse, cx, cy - r.s * 0.7, '#ff7a5a', 34); }
      } else if (rec.token === 'ankh') { shield++; Sfx.shield(); FX.float(T.vaultShield, cx, cy - r.s * 0.7, '#6ff0dd', 24); FX.ring(cx, cy, '#6ff0dd', r.s * 1.4, 0.8); }
      else if (rec.token === 'scepter') { Sfx.lightning(); FX.flash(0.35, '#9ab8ff'); FX.float(T.vaultScepter, cx, cy - r.s * 0.7, '#9ab8ff', 28); FX.ring(cx, cy, '#9ab8ff', r.s * 2, 0.9); FX.shake(8, 0.3); }
      else { Sfx.chime(rec.token); FX.coins(cx, cy, 6 + Math.min(20, rec.token * 2), 650, 20); FX.spark(cx, cy, 12, '#ffe9a0', 240); FX.float('+' + rec.token, cx, cy - r.s * 0.7, '#fff1b8', 30); }
      if (rec.token !== 'curse' || !rec.saved) bump(S, rec.total); else bump(S, S.totalT);
      await G.sleep(0.65);
    }
    S.run = async function () {
      G.say(T.vaultSub); await G.sleep(1.2);
      var leftovers = [1, 2, 3, 5, 8, 2, 1, 3, 'scepter', 1, 5, 'ankh'];
      for (n = 0; n < data.picks.length; n++) {
        G.say(T.pick);
        var i = await waitPick(); hover = -1;
        if (!quick()) await crackSeal(i);
        await reveal(i, data.picks[n]);
        if (data.picks[n].token === 'curse' && !data.picks[n].saved) break;
      }
      G.say('');
      if (data.ended === 'cleared') {
        S.banner = { text: T.vaultClear, t: 0 }; Sfx.fanfare(1); FX.flash(0.4, '#ffe9a0'); FX.rain(G.w, 40); bump(S, data.total);
        await G.sleep(1.4); S.banner = null;
      }
      // révèle le reste, estompé
      var rest = tiles.map(function (t, i) { return i; }).filter(function (i) { return tiles[i].state === 'closed'; });
      rest.forEach(function (i, k) { var t = tiles[i]; t.token = leftovers[k % leftovers.length]; t.dim = true; t.state = 'flipping'; t.u = 0.0; });
      await G.sleep(0.9);
      await settle(S, sp, bet);
    };
    return S;
  }

  /* ======================================================================
   * 4. MAIN D'ANUBIS — roue géante à multiplicateurs cumulés
   * ====================================================================== */
  function handScene(sp, bet) {
    var T = I18N.t(), data = sp.bonus, segs = M.HAND_SEGS, N = segs.length, st = TAU / N;
    var S = newScene(T.handIntro), g = {}; S.bgImg = 'key'; var rot = 0, vel = 0, ptr = 0, ptrV = 0, lastIdx = -1, lastTick = 0;
    var charging = false, holding = false, power = 0, pdir = 1, handY = -9999, handAlpha = 1, crush = 0, wheelK = 0, multShown = 1, multPop = 0, bolts = 0, iconAlpha = 1, iconK = 1, hl = -1, flyOrb = null;
    S.dim = 0.85; S.showTotal = false;
    S.layout = function () {
      var w = G.w, h = G.h, top = T0() + EX(64), bot = h - hudH() - (h < 520 ? 10 : 44);
      g.R = Math.min(w * 0.4, (bot - top) / 2.3); g.cy = top + g.R * 1.2; g.u = Math.min(w, h);
    };
    function iconAt(x, y, s) {
      if (sp.kind === 'hand') return;
      if (G.icon(ctx, sp.kind, x, y, s * 2.5)) return;
      if (sp.kind === 'scarab') A.scarab(ctx, x, y, s, '#ffd86a', 'rgba(60,30,0,.6)');
      else if (sp.kind === 'weigh') A.feather(ctx, x, y, s * 1.3, '#fff8e6', 'rgba(150,110,40,.8)');
      else A.pyramid(ctx, x, y, s * 1.2, '#e8c4ff', 'rgba(60,20,90,.6)');
    }
    function segColor(s) {
      if (s.x) return s.x >= 5 ? ['#ff9a3a', '#7a2a00'] : s.x >= 3 ? ['#5cf0dc', '#0a5a50'] : ['#f6f0e0', '#6a6050'];
      var v = s.n; return v >= 100 ? ['#ffe08a', '#b8861e'] : v >= 40 ? ['#ff7a5a', '#8a1b10'] : v >= 20 ? ['#c28bff', '#5a2a86'] : v >= 10 ? ['#35d98c', '#106b42'] : v >= 6 ? ['#5b8cff', '#1a3a8a'] : ['#b08a45', '#5f4220'];
    }
    S.update = function (dt) {
      chromeUpdate(S, dt);
      ptrV += (-520 * ptr - 15 * ptrV) * dt; ptr = clamp(ptr + ptrV * dt, -0.2, 0.6);
      if (charging && holding) { power += pdir * dt * 1.15; if (power >= 1) { power = 1; pdir = -1; } if (power <= 0) { power = 0; pdir = 1; } }
      multPop = Math.max(0, multPop - dt * 2.4); bolts = Math.max(0, bolts - dt * 4);
      if (S.spinning) {
        var idx = Math.floor(mod(-rot, TAU) / st);
        if (idx !== lastIdx) { if (lastIdx >= 0) { ptrV += 5 + Math.min(Math.abs(vel), 18) * 0.4; if (G.t - lastTick > 0.03) { Sfx.tick(Math.min(1, Math.abs(vel) / 18)); lastTick = G.t; } } lastIdx = idx; }
      }
    };
    function wedgeH(i, ri, ro) { ctx.beginPath(); ctx.arc(0, 0, ro, i * st - Math.PI / 2, (i + 1) * st - Math.PI / 2); ctx.arc(0, 0, ri, (i + 1) * st - Math.PI / 2, i * st - Math.PI / 2, true); ctx.closePath(); }
    S.draw = function () {
      var R = g.R * G.ease.outBack(clamp(wheelK, 0, 1)), u = g.u, cx = G.cx, cy = g.cy;
      if (R > 4) {
        ctx.save(); ctx.translate(cx, cy);
        var gl = ctx.createRadialGradient(0, 0, R * 0.7, 0, 0, R * 1.6); gl.addColorStop(0, 'rgba(255,200,90,.35)'); gl.addColorStop(1, 'rgba(255,200,90,0)'); ctx.fillStyle = gl; ctx.fillRect(-R * 1.7, -R * 1.7, R * 3.4, R * 3.4);
        ctx.beginPath(); ctx.arc(-G.par.x * R * 0.014, R * 0.05, R * 1.07, 0, TAU); var hw = ctx.createLinearGradient(0, -R, 0, R * 1.1); hw.addColorStop(0, '#7a5612'); hw.addColorStop(0.6, '#3c2a08'); hw.addColorStop(1, '#0e0903'); ctx.fillStyle = hw; ctx.fill();
        ctx.beginPath(); ctx.arc(0, 0, R * 1.07, 0, TAU); ctx.fillStyle = '#120c05'; ctx.fill(); ctx.lineWidth = R * 0.022; ctx.strokeStyle = A.goldGrad(ctx, -R, -R, R, R); ctx.stroke();
        ctx.save(); ctx.rotate(rot);
        for (var i = 0; i < N; i++) {
          var s = segs[i], col = segColor(s);
          wedgeH(i, R * 0.2, R * 0.97);
          var gg = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 0.97); gg.addColorStop(0, col[1]); gg.addColorStop(1, col[0]); ctx.fillStyle = s.x ? '#14100c' : gg; ctx.fill();
          if (s.x) { ctx.lineWidth = R * 0.012; ctx.strokeStyle = col[0]; ctx.shadowColor = col[0]; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0; }
          if (hl === i) { wedgeH(i, R * 0.2, R * 0.97); ctx.fillStyle = 'rgba(255,255,255,' + (0.25 + 0.25 * Math.sin(G.t * 10)) + ')'; ctx.fill(); }
          wedgeH(i, R * 0.2, R * 0.97); ctx.lineWidth = Math.max(1, R * 0.006); ctx.strokeStyle = 'rgba(255,214,110,.8)'; ctx.stroke();
          ctx.save(); ctx.rotate((i + 0.5) * st - Math.PI / 2);
          ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
          var label = s.x ? '×' + s.x : String(s.n), big = s.x ? 0.12 : (label.length > 2 ? 0.095 : 0.115);
          ctx.font = '700 ' + R * big * 1.15 + 'px ' + G.NUM; ctx.fillStyle = s.x ? col[0] : '#fff'; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 4;
          if (s.x) { ctx.shadowColor = col[0]; ctx.shadowBlur = 12; }
          ctx.fillText(label, R * 0.9, 0); ctx.shadowBlur = 0; ctx.restore();
        }
        ctx.restore();
        // éclat de lumière sur la roue
        var hla = Math.atan2(-0.8 - G.par.y * 0.5, -0.55 - G.par.x * 0.6), hlx = Math.cos(hla) * R * 0.85, hly = Math.sin(hla) * R * 0.85;
        ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R * 0.97, 0, TAU); ctx.clip();
        var hgl = ctx.createRadialGradient(hlx, hly, 0, hlx, hly, R * 1.35); hgl.addColorStop(0, 'rgba(255,246,214,.24)'); hgl.addColorStop(0.45, 'rgba(255,246,214,.04)'); hgl.addColorStop(1, 'rgba(0,0,0,.3)');
        ctx.fillStyle = hgl; ctx.fillRect(-R, -R, R * 2, R * 2); ctx.restore();
        // moyeu
        ctx.beginPath(); ctx.arc(0, 0, R * 0.22, 0, TAU); var hg = ctx.createRadialGradient(-R * 0.06, -R * 0.08, 0, 0, 0, R * 0.22); hg.addColorStop(0, '#2a2118'); hg.addColorStop(1, '#070504'); ctx.fillStyle = hg; ctx.fill();
        ctx.lineWidth = R * 0.02; ctx.strokeStyle = A.goldGrad(ctx, -R * 0.2, -R * 0.2, R * 0.2, R * 0.2); ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R * 0.2, 0, TAU); ctx.clip();
        if (G.art.medal) ctx.drawImage(G.art.medal, -R * 0.2, -R * 0.2, R * 0.4, R * 0.4); else A.jackal(ctx, 0, -R * 0.05, R * 0.09, { glow: 0.8 + 0.2 * Math.sin(G.t * 3) });
        ctx.restore();
        // pointeur
        ctx.save(); ctx.translate(0, -R * 1.08); ctx.rotate(ptr); var ps = R * 0.12;
        if (G.icon(ctx, 'pointer', 0, ps * 0.2, ps * 3)) { ctx.restore(); } else {
        ctx.beginPath(); ctx.moveTo(-ps * 0.6, -ps * 0.5); ctx.quadraticCurveTo(0, -ps * 0.9, ps * 0.6, -ps * 0.5); ctx.lineTo(0, ps * 1.5); ctx.closePath();
        ctx.fillStyle = A.goldGrad(ctx, -ps, -ps, ps, ps * 1.5); ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 1.5; ctx.strokeStyle = '#4b350b'; ctx.stroke(); ctx.restore();
        ctx.restore(); }
      }
      // multiplicateur cumulé
      if (wheelK > 0.3) {
        var ms = 1 + multPop * 0.35, mx = Math.min(G.w * 0.14, 110) + 14, my = g.cy - g.R * 0.0;
        if (G.h < 520) { mx = 70; my = g.cy; }
        else if (G.w < 700) { mx = G.w - 52; my = g.cy - g.R * 1.0; }
        ctx.save(); ctx.translate(mx, (G.w < 700 || G.h < 520) ? my : T0() + EX(130)); ctx.scale(ms, ms);
        G.txt(I18N.lang() === 'fr' ? (G.w < 700 ? 'MULTIPL.' : 'MULTIPLICATEUR') : (G.w < 700 ? 'MULT.' : 'MULTIPLIER'), 0, -38, { size: 10, family: 'Manrope', weight: 800, fill: '#b9a780', spacing: G.w < 700 ? 1 : 3 });
        G.goldText('×' + multShown, 0, 8, Math.min(64, G.w * 0.08), { blur: 28 });
        ctx.restore();
      }
      // orbe volant
      if (flyOrb) {
        var o = flyOrb, e = G.ease.inOut(clamp(o.t, 0, 1)), ox = lerp(o.x0, o.x1, e), oy = lerp(o.y0, o.y1, e) - Math.sin(Math.PI * e) * 90;
        var og = ctx.createRadialGradient(ox, oy, 0, ox, oy, 46); og.addColorStop(0, 'rgba(255,255,255,.95)'); og.addColorStop(0.3, o.c); og.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = og; ctx.beginPath(); ctx.arc(ox, oy, 46, 0, TAU); ctx.fill();
        G.txt('×' + o.v, ox, oy, { size: 28, weight: 900, fill: '#fff', stroke: '#000' });
      }
      // l'icône du bonus + la Main
      if (iconAlpha > 0.01 && handY > -9000) {
        ctx.save(); ctx.globalAlpha = iconAlpha; ctx.translate(cx, g.cy); ctx.scale(iconK, iconK * (1 - crush * 0.7));
        var ig = ctx.createRadialGradient(0, 0, 0, 0, 0, u * 0.2); ig.addColorStop(0, 'rgba(255,216,106,.5)'); ig.addColorStop(1, 'rgba(255,216,106,0)'); ctx.fillStyle = ig; ctx.fillRect(-u * 0.2, -u * 0.2, u * 0.4, u * 0.4);
        iconAt(0, 0, u * 0.2); ctx.restore();
      }
      if (handAlpha > 0.01 && handY > -9000) { ctx.save(); ctx.globalAlpha = handAlpha;
        if (G.art.hand) { var hs = u * 0.75; ctx.globalCompositeOperation = 'screen'; ctx.translate(cx, handY - hs * 0.12 + u * 0.1); ctx.rotate(Math.PI); ctx.drawImage(G.art.hand, -hs / 2, -hs / 2, hs, hs); }
        else A.hand(ctx, cx, handY, u * 0.25, {});
        ctx.restore(); }
      if (charging) {   // jauge circulaire autour de la roue
        var rr2 = g.R * 1.07, lw = Math.max(6, g.R * 0.035);
        ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = lw;
        ctx.strokeStyle = 'rgba(10,7,4,.8)'; ctx.beginPath(); ctx.arc(G.cx, g.cy, rr2, 0, TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(230,185,74,' + (holding ? 0.9 : 0.4 + 0.2 * Math.sin(G.t * 5)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(G.cx, g.cy, rr2 + lw * 0.6, 0, TAU); ctx.stroke();
        if (power > 0.01) {
          var pg2 = ctx.createLinearGradient(G.cx - rr2, 0, G.cx + rr2, 0); pg2.addColorStop(0, '#5cf0dc'); pg2.addColorStop(0.5, '#ffd86a'); pg2.addColorStop(1, '#ff7a3a');
          ctx.strokeStyle = pg2; ctx.lineWidth = lw * 0.7; ctx.shadowColor = '#ffd86a'; ctx.shadowBlur = 12 * power;
          ctx.beginPath(); ctx.arc(G.cx, g.cy, rr2, -Math.PI / 2, -Math.PI / 2 + TAU * power); ctx.stroke();
        }
        ctx.restore();
      }
      if (bolts > 0) { ctx.save(); ctx.globalAlpha = bolts; for (var b = 0; b < 7; b++) { var a = b / 7 * TAU + G.t; drawBolt(cx, g.cy, cx + Math.cos(a) * u * 0.6, g.cy + Math.sin(a) * u * 0.6, '#9ab8ff', 3); } ctx.restore(); }
      chrome(S);
    };
    // charge : maintenir puis relâcher ; la puissance ne change que la durée et le nombre de tours, pas le segment
    function waitCharge() {
      return new Promise(function (res) {
        var done = false;
        function fin(p) { if (!done) { done = true; charging = false; holding = false; S.onPointer = null; res(p); } }
        charging = true; holding = false; power = 0; pdir = 1;
        S.onPointer = function (x, y, type) {
          if (type === 'down') { holding = true; Sfx.whoosh(); }
          else if (type === 'up' && holding) fin(Math.max(0.12, power));
        };
        G.sleep(7).then(function () { fin(0.6); });
      });
    }
    function spinTo(idx, pw) {
      pw = pw == null ? 0.5 : pw;
      var off = 0.2 + Math.random() * 0.6, target = -(idx + off) * st, rot0 = rot, delta = mod(target - rot0, TAU) + (G.turbo ? 3 : Math.round(3 + pw * 4)) * TAU, prev = rot, pT = G.t;
      S.spinning = true; hl = -1; Sfx.whoosh();
      return G.tween(G.turbo ? 2.4 : 4.2 + pw * 2.6, function (u) { var e = 1 - Math.pow(1 - u, 4.8), nr = rot0 + delta * e; vel = (nr - prev) / Math.max(1 / 240, G.t - pT); prev = nr; pT = G.t; rot = nr; }, null).then(function () {
        S.spinning = false; vel = 0; rot = mod(rot, TAU); ptrV += 4; Sfx.drum(0.3); hl = idx;
      });
    }
    S.run = async function () {
      G.say(T.handSub);
      // intro : la Main s'abat sur le bonus
      var u = g.u, s = u * 0.25, tipOff = s * 0.98;
      handY = -s * 1.8; Sfx.roll(8, 0.1);
      await G.sleep(0.5);
      await G.tween(0.55, function (k) { handY = lerp(-s * 1.8, g.cy - tipOff - u * 0.04, k * k); }, null);
      Sfx.lightning(); Sfx.thud(); FX.shake(26, 0.9); FX.flash(0.8, '#cfe0ff'); bolts = 1; crush = 1; FX.ring(G.cx, g.cy, '#ffe9a0', u * 0.5, 1); FX.spark(G.cx, g.cy, 60, '#ffd86a', 520);
      await G.sleep(0.5);
      await G.tween(0.5, function (k) { iconAlpha = 1 - k; iconK = 1 + k * 0.6; handY = lerp(g.cy - tipOff - u * 0.04, -s * 1.9, G.ease.inOut(k)); }, null);
      handAlpha = 0; FX.spark(G.cx, g.cy, 40, '#ffe9a0', 380);
      Sfx.bonus();
      await G.tween(0.7, function (k) { wheelK = k; }, null);
      G.say(T.handSpin);
      await G.sleep(0.5);
      var mult = 1, lastV = 0;
      for (var i = 0; i < data.spins.length; i++) {
        var sx = data.spins[i], seg = segs[sx.idx];
        var pw = null; if (!quick()) { G.say(T.holdHint); pw = await waitCharge(); G.say(T.handSpin); }
        await spinTo(sx.idx, pw);
        await G.sleep(0.3);
        if (seg.x) {
          var col = segColor(seg)[0], isSmall = G.w < 700;
          flyOrb = { x0: G.cx, y0: g.cy - g.R * 0.7, x1: G.h < 520 ? 70 : isSmall ? G.w - 52 : Math.min(G.w * 0.14, 110) + 14, y1: G.h < 520 ? g.cy : isSmall ? g.cy - g.R : T0() + EX(130), t: 0, c: col, v: seg.x };
          Sfx.lightning(); FX.flash(0.3, '#9ab8ff'); FX.shake(10, 0.4);
          await G.tween(0.7, function (k) { flyOrb.t = k; }, null);
          flyOrb = null; mult = sx.mult; multShown = mult; multPop = 1; Sfx.chime(mult * 4); FX.ring(G.h < 520 ? 70 : G.w < 700 ? G.w - 52 : 110, G.h < 520 ? g.cy : G.h * 0.3, col, 90, 0.8);
          await G.sleep(0.6);
        } else {
          lastV = seg.n;
          S.banner = { text: seg.n + ' × ' + mult + ' = ' + (seg.n * mult), t: 0 };
          Sfx.fanfare(1); FX.coins(G.cx, g.cy, 36, 900, 100); FX.flash(0.3, '#ffe9a0'); FX.shake(10, 0.4);
          bump(S, data.total);
          await G.sleep(1.5); S.banner = null;
        }
      }
      G.say('');
      await settle(S, sp, bet);
    };
    return S;
  }

  /* ---------------- choix du profil de risque (avant le bonus) ---------------- */
  // Trois tirages de même espérance sont déjà dans le script du tour ; la carte choisie révèle l'un d'eux.
  function chooseScene(sp) {
    var T = I18N.t(), S = newScene(T.chooseTitle), kind = sp.kind, cards = [], hover = -1, g = {}, sel = -1, t0 = 0;
    S.showTotal = false; S.dim = 0.8; S.bgImg = kind === 'scarab' ? 'abyss' : kind === 'weigh' ? 'judgment' : 'vault';
    var names = M.PROFILES;
    function line(p) {
      if (kind === 'scarab') { var v = M.SCARAB_PROFILES[p]; return T.lineScarab.replace('{a}', Math.min.apply(null, v)).replace('{b}', Math.max.apply(null, v)); }
      if (kind === 'weigh') { var mx = 0; M.WEIGH_PROFILES[p].forEach(function (q) { mx = Math.max(mx, q[0][1]); }); return T.lineWeigh.replace('{b}', mx); }
      var vp = M.VAULT_PROFILES[p], sum = vp.curse; vp.tokens.forEach(function (q) { sum += q[1]; });
      return T.lineVault.replace('{p}', Math.round(vp.curse / sum * 100));
    }
    var ICON = { safe: 'amulet', std: 'coin', bold: 'scepter' };
    S.layout = function () {
      var w = G.w, h = G.h, top = T0() + EX(80), bot = h - hudH() - (h < 520 ? 8 : 56), narrow = w < 640 && h > 520;
      cards = [];
      for (var i = 0; i < 3; i++) {
        if (narrow) { var ch = (bot - top - 16) / 3; cards.push({ x: w * 0.06, y: top + i * (ch + 8), w: w * 0.88, h: ch, row: true }); }
        else { var cw = Math.min((w * 0.94 - 24) / 3, 300), tw = cw * 3 + 24; cards.push({ x: G.cx - tw / 2 + i * (cw + 12), y: top, w: cw, h: Math.min(bot - top, 380), row: false }); }
      }
    };
    function drawCard(c, i) {
      var p = names[i], hv = hover === i || sel === i, lift = hv ? 6 : 0, y = c.y - lift;
      ctx.save();
      A.roundRect(ctx, c.x, y, c.w, c.h, 16);
      var gg = ctx.createLinearGradient(0, y, 0, y + c.h); gg.addColorStop(0, hv ? '#3a2c16' : '#241a0d'); gg.addColorStop(1, '#0c0804');
      ctx.fillStyle = gg; ctx.shadowColor = hv ? 'rgba(255,216,106,.7)' : 'rgba(0,0,0,.7)'; ctx.shadowBlur = hv ? 30 : 14; ctx.fill(); ctx.shadowBlur = 0;
      ctx.lineWidth = hv ? 3 : 2; ctx.strokeStyle = hv ? '#fff1b8' : A.goldGrad(ctx, c.x, y, c.x + c.w, y + c.h); ctx.stroke();
      var ix = c.row ? c.x + c.h * 0.5 : c.x + c.w / 2, iy = c.row ? y + c.h / 2 : y + c.h * 0.24, isz = c.row ? c.h * 0.8 : c.h * 0.32;
      G.icon(ctx, ICON[p], ix, iy, isz);
      var tx = c.row ? c.x + c.h * 1.05 : c.x + c.w / 2, al = c.row ? 'left' : 'center', ty = c.row ? y + c.h * 0.26 : y + c.h * 0.5, fs = c.row ? clamp(c.h * 0.2, 13, 20) : clamp(c.w * 0.08, 15, 22);
      G.txt(T.profName[p], tx, ty, { size: fs, weight: 900, fill: '#ffe08a', stroke: '#2a1802', sw: 3, align: al, spacing: 2 });
      G.txt(T.profDesc[p], tx, ty + fs * 1.5, { size: Math.max(10, fs * 0.58), family: 'Manrope', weight: 700, fill: '#cdb98a', align: al });
      G.txt(line(p), tx, ty + fs * 2.7, { size: Math.max(11, fs * 0.66), family: 'Manrope', weight: 800, fill: '#fff1b8', align: al });
      // volatilité : 1 à 3 gemmes
      var vy = c.row ? y + c.h * 0.84 : y + c.h * 0.9;
      for (var k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc((c.row ? tx + 7 : c.x + c.w / 2 - 22) + k * 22, vy, 6, 0, TAU); ctx.fillStyle = k <= i ? (i === 2 ? '#ff7a5a' : i === 1 ? '#ffd86a' : '#6ff0dd') : 'rgba(255,255,255,.12)'; ctx.fill(); }
      ctx.restore();
    }
    S.draw = function () {
      cards.forEach(drawCard);
      var bw = G.w, by = cards.length ? cards[2].y + cards[2].h + 14 : 0;
      if (G.h >= 520 && by < G.h - hudH() - 20) G.txt(T.chooseRtp, G.cx, by, { size: 12, family: 'Manrope', weight: 700, fill: 'rgba(205,185,138,.9)', spacing: 1 });
      chrome(S);
    };
    S.run = function () {
      return new Promise(function (res) {
        var done = false;
        function fin(i) { if (!done) { done = true; S.pointer = function () {}; window.removeEventListener('keydown', key, true); res(names[i]); } }
        function key(e) { var n = { Digit1: 0, Digit2: 1, Digit3: 2, Numpad1: 0, Numpad2: 1, Numpad3: 2 }[e.code]; if (n != null) { e.preventDefault(); Sfx.shield(); fin(n); } }
        window.addEventListener('keydown', key, true);
        S.pointer = function (x, y, type) {
          var h = -1; cards.forEach(function (c, i) { if (x >= c.x && x <= c.x + c.w && y >= c.y - 6 && y <= c.y + c.h) h = i; });
          hover = h;
          if (type === 'down' && h >= 0) { sel = h; Sfx.shield(); FX.spark(cards[h].x + cards[h].w / 2, cards[h].y + cards[h].h / 2, 24, '#ffe9a0', 300); G.sleep(0.35).then(function () { fin(h); }); }
        };
        G.say(T.chooseHint);
        G.sleep(20).then(function () { fin(1); });
      });
    };
    return S;
  }


  /* ---------------- écran d'annonce : le bonus est gagné, c'est au joueur de le lancer ---------------- */
  function introScene(sp) {
    var T = I18N.t(), kind = sp.upgraded ? 'hand' : sp.kind, S = newScene(T.bonusUnlocked), t = 0, btn = { x: 0, y: 0, w: 0, h: 0 }, hover = false, go = false, sparkT = 0, L = { ty: 0, ny: 0, size: 100, cy: 0 };
    S.showTotal = false; S.dim = 0.78; S.bgImg = kind === 'scarab' ? 'abyss' : kind === 'weigh' ? 'judgment' : kind === 'vault' ? 'vault' : 'hand';
    var ICN = { scarab: 'scarab', weigh: 'weigh', vault: 'vault', hand: 'hand' };
    S.layout = function () {
      var bw = clamp(G.w * 0.6, 220, 420), bh = clamp(G.h * 0.1, 52, 76);
      btn = { w: bw, h: bh, x: G.cx - bw / 2, y: G.h - hudH() - bh - (G.h < 520 ? 10 : G.h < 640 ? 26 : 50) };
      var fs = clamp(G.w * 0.085, 34, 86), ns = clamp(G.w * 0.034, 17, 32);
      L.ty = T0() + fs * 0.9; L.ny = btn.y - 14 - ns * (sp.boost > 1 ? 2.2 : 1);
      var top = L.ty + fs * 0.55, avail = L.ny - ns - top - 6;
      L.size = Math.max(60, Math.min(avail, G.w * 0.8, G.h * 0.62)); L.cy = top + 4 + L.size / 2;
    };
    S.update = function (dt) {
      t += dt; sparkT -= dt;
      if (sparkT <= 0 && t > 0.4) { sparkT = 0.09; var a = Math.random() * TAU, r = L.size * (0.3 + Math.random() * 0.4); FX.spark(G.cx + Math.cos(a) * r, L.cy + Math.sin(a) * r * 0.7, 2, Math.random() < 0.3 ? '#fff1b8' : '#ffd86a', 90); }
    };
    S.draw = function () {
      var w = G.w, h = G.h, cy = L.cy, k = G.ease.outBack(clamp(t / 0.7, 0, 1)), R = L.size / 1.5 * 0.9;
      ctx.save(); ctx.translate(G.cx, cy); ctx.globalCompositeOperation = 'lighter'; ctx.rotate(t * 0.25);
      var ra = clamp(t / 0.8, 0, 1) * 0.16;
      for (var i = 0; i < 14; i++) { ctx.rotate(TAU / 14); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-R * 0.22, -Math.max(w, h)); ctx.lineTo(R * 0.22, -Math.max(w, h)); ctx.closePath(); ctx.fillStyle = 'rgba(255,216,106,' + ra + ')'; ctx.fill(); }
      ctx.restore();
      var pulse = 1 + Math.sin(t * 3) * 0.04;
      ctx.save(); ctx.translate(G.cx, cy); ctx.scale(k * pulse, k * pulse);
      var gl = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 1.1); gl.addColorStop(0, 'rgba(255,226,140,.55)'); gl.addColorStop(1, 'rgba(255,226,140,0)');
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 0, R * 1.1, 0, TAU); ctx.fill();
      ctx.rotate(Math.sin(t * 1.6) * 0.05);
      G.icon(ctx, ICN[kind], 0, 0, L.size);
      ctx.restore();
      var ks = G.ease.outBack(clamp((t - 0.25) / 0.45, 0, 1)) * (1 + Math.max(0, 0.6 - t) * 0.6), ty = L.ty;
      ctx.save(); ctx.translate(G.cx, ty); ctx.scale(ks, ks);
      G.goldText(T.bonusWord, 0, 0, clamp(w * 0.085, 34, 86), { blur: 40, spacing: 8 });
      ctx.restore();
      var na = clamp((t - 0.7) / 0.4, 0, 1), ns = clamp(w * 0.034, 17, 32);
      ctx.save(); ctx.globalAlpha = na;
      G.txt(sp.upgraded ? T.kindsLong.hand : T.kindsLong[sp.kind], G.cx, L.ny + (1 - na) * 14, { size: ns, weight: 900, fill: '#ffe08a', stroke: '#2a1802', sw: 4, spacing: 3, shadow: 'rgba(255,200,80,.6)', blur: 18 });
      if (sp.boost > 1) G.txt(T.boostApplied + ' ×' + sp.boost, G.cx, L.ny + ns * 1.4, { size: clamp(w * 0.02, 12, 18), family: 'Manrope', weight: 800, fill: '#fff1b8' });
      ctx.restore();
      if (t > 1.0) {
        var ba = clamp((t - 1.0) / 0.4, 0, 1), bp = 1 + Math.sin(t * 5) * 0.035 + (hover ? 0.05 : 0), bx = btn.x + btn.w / 2, by = btn.y + btn.h / 2;
        ctx.save(); ctx.globalAlpha = ba; ctx.translate(bx, by + (1 - ba) * 20); ctx.scale(bp, bp);
        A.roundRect(ctx, -btn.w / 2, -btn.h / 2, btn.w, btn.h, btn.h / 2);
        var bg = ctx.createLinearGradient(0, -btn.h / 2, 0, btn.h / 2); bg.addColorStop(0, '#ffe9a0'); bg.addColorStop(0.5, '#f0b73c'); bg.addColorStop(1, '#a36a12');
        ctx.fillStyle = bg; ctx.shadowColor = 'rgba(255,216,106,' + (0.55 + Math.sin(t * 5) * 0.25) + ')'; ctx.shadowBlur = 34 + Math.sin(t * 5) * 12; ctx.fill(); ctx.shadowBlur = 0;
        ctx.lineWidth = 3; ctx.strokeStyle = '#fff6d0'; ctx.stroke();
        G.txt(T.launchBonus, 0, 1, { size: clamp(btn.h * 0.36, 16, 28), weight: 900, fill: '#3a2203', spacing: 3 });
        ctx.restore();
        if (G.h >= 640) { ctx.save(); ctx.globalAlpha = ba * 0.8; G.txt(T.launchHint, G.cx, btn.y + btn.h + 22, { size: 12, family: 'Manrope', weight: 700, fill: '#cdb98a', spacing: 1 }); ctx.restore(); }
      }
    };
    S.run = function () {
      Sfx.bonus(); FX.shake(10, 0.5); FX.flash(0.4, '#ffe9a0'); FX.ring(G.cx, G.cy, '#ffe9a0', G.R * 1.2, 1);
      return new Promise(function (res) {
        function fin() {
          if (go) return; go = true; S.pointer = function () {}; window.removeEventListener('keydown', key, true);
          Sfx.shield(); FX.flash(0.6, '#fff1b8'); FX.shake(12, 0.4); FX.spark(G.cx, btn.y + btn.h / 2, 40, '#ffe9a0', 400); FX.ring(G.cx, G.cy, '#fff1b8', G.R * 1.5, 0.7);
          G.sleep(0.5).then(res);
        }
        function key(e) { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); if (t >= 1.1) fin(); } }
        window.addEventListener('keydown', key, true);
        function inBtn(x, y) { return t > 1.0 && x >= btn.x && x <= btn.x + btn.w && y >= btn.y - 8 && y <= btn.y + btn.h + 8; }
        S.pointer = function (x, y, type) { hover = inBtn(x, y); if (type === 'down' && hover) fin(); };
        if (quick()) G.sleep(1.6).then(fin);
        else G.sleep(45).then(fin);
      });
    };
    return S;
  }

  /* ---------------- orchestration ---------------- */
  var FACT = { scarab: scarabScene, weigh: weighScene, vault: vaultScene, hand: handScene };
  G.runBonus = async function (sp, bet) {
    var speed0 = G.speed;
    if (G.turbo) G.speed = G.ultra ? 8 : 3.4;   // turbo / ultra : les bonus restent rapides aussi (la vitesse ne retombe plus à la normale)
    $('oracle').hidden = true;
    Sfx.bonus(); G.wheel.flashLamps = 1.4; FX.shake(14, 0.6); FX.flash(0.5, '#ffe9a0'); FX.ring(G.cx, G.cy, '#ffe9a0', G.R * 1.3, 1);
    await G.sleep(G.turbo ? 0.5 : 1.1);
    await G.setFade(1, 0.35);
    var is = introScene(sp);
    G.setScene(is); await G.setFade(0, 0.4);
    await is.run();
    await G.setFade(1, 0.35);
    if (sp.options && !sp.upgraded && !quick()) {
      var cs = chooseScene(sp);
      G.setScene(cs); await G.setFade(0, 0.5);
      var prof = await cs.run();
      await G.setFade(1, 0.35);
      sp.bonus = sp.options[prof]; sp.profile = prof; sp.base = sp.bonus.total; sp.pay = sp.base * (sp.boost || 1);
      if (G.onBonusChoice) G.onBonusChoice();
    }
    var scene = FACT[sp.upgraded ? 'hand' : sp.kind](sp, bet);
    G.setScene(scene);
    await G.setFade(0, 0.5);
    await scene.run();
    await G.setFade(1, 0.35);
    G.setScene(null); G.say('');
    await G.setFade(0, 0.5);
    G.speed = speed0;
  };

  // test manuel : G.testBonus('vault'|'scarab'|'weigh', boost, upgraded)
  G.testBonus = function (kind, boost, upg) {
    var rng = M.cryptoRng(), opts = upg ? null : M.drawOptions(rng, kind), b = upg ? M._bonus.hand(rng) : opts.std, bo = boost || 1;
    return G.runBonus({ kind: kind, boost: bo, bonus: b, options: opts, profile: 'std', upgraded: !!upg, base: b.total, pay: b.total * bo }, 100);
  };
})(window);
