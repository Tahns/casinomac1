/* ANUBIS UNCHAINED — les 4 bonus.
 * Chaque scène REJOUE un script déjà tiré par le noyau mathématique (AnubisMath) : elle n'invente aucun résultat.
 *  - Chute des Scarabées (Plinko)      - Pesée du Cœur (balance)
 *  - Crypte d'Anubis (SECRET : colonnes de multiplicateurs)
 *  - Chambre du Trésor (pick-me)       - Fureur d'Anubis (roue géante : couleur au choix, DOUBLE, bandes de bonus) */
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
    ctx.font = '900 ' + fs + 'px ' + G.TITLE; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '4px';
    var tw = Math.min(w * 0.94, ctx.measureText(text).width + fs * 3), th = fs * 1.9 + (sub ? subS * 1.6 : 0);
    var x = cx - tw / 2;
    A.roundRect(ctx, x, y, tw, th, 12);
    var g = ctx.createLinearGradient(0, y, 0, y + th); g.addColorStop(0, 'rgba(36,26,12,.94)'); g.addColorStop(1, 'rgba(10,7,4,.94)');
    ctx.fillStyle = g; ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 2; ctx.strokeStyle = A.goldGrad(ctx, x, y, x + tw, y + th); ctx.stroke();
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px';
    G.goldText(text, cx, y + fs * 1.05, fs, { spacing: 4, blur: 14 });
    if (sub) G.txt(sub, cx, y + fs * 1.05 + fs * 0.9 + subS * 0.2, { size: subS, family: G.TEXT, weight: 600, fill: '#cdb98a' });
    ctx.restore();
  }

  function totalBox(S, y, label) {
    var w = G.w, fs = clamp(w * 0.03, 20, 36);
    var txt = '×' + G.fmt(Math.round(S.total * 100) / 100);
    ctx.save();
    var scale = 1 + (S.pop || 0) * 0.18;
    ctx.translate(G.cx, y); ctx.scale(scale, scale);
    G.txt(label, 0, -fs * 0.95, { size: clamp(w * 0.011, 10, 13), family: G.TEXT, weight: 800, fill: '#b9a780', spacing: 4 });
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

  // codes visuels communs aux menus dessinés (mêmes valeurs que css/style.css : --edge, --pnl, --go)
  var UI = { r: 14, edge: '#b8861e', pnl: ['#221a10', '#100c08'], pnlHi: ['#3a2c16', '#171109'], go: ['#fff1b8', '#e6b94a', '#c9962a'], goInk: '#140a00', goRim: '#fff1b8' };
  // bouton principal doré (centré en 0,0 du contexte courant) : le même que .btn-go
  function goButton(w, h, label, glow) {
    A.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
    var bg = ctx.createLinearGradient(0, -h / 2, 0, h / 2); bg.addColorStop(0, UI.go[0]); bg.addColorStop(0.55, UI.go[1]); bg.addColorStop(1, UI.go[2]);
    ctx.fillStyle = bg; ctx.shadowColor = 'rgba(230,185,74,' + glow + ')'; ctx.shadowBlur = 26; ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 2; ctx.strokeStyle = UI.goRim; ctx.stroke();
    var lfs = clamp(h * 0.36, 14, 28); ctx.font = '900 ' + lfs + 'px ' + G.TITLE; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '3px';
    while (lfs > 11 && ctx.measureText(label).width > w * 0.82) { lfs -= 1; ctx.font = '900 ' + lfs + 'px ' + G.TITLE; }
    if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px';
    G.txt(label, 0, 1, { size: lfs, weight: 900, fill: UI.goInk, spacing: 3 });
  }
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
      ctx.save();
      if (b.sub) {   // voile sombre sous la bannière d'intro : le sous-titre reste lisible sur un décor chargé
        var vh2 = clamp(w * 0.055, 24, 56) * 3.2, vg2 = ctx.createLinearGradient(0, G.cy - vh2 / 2, 0, G.cy + vh2 / 2);
        vg2.addColorStop(0, 'rgba(4,3,2,0)'); vg2.addColorStop(0.25, 'rgba(4,3,2,.78)'); vg2.addColorStop(0.75, 'rgba(4,3,2,.78)'); vg2.addColorStop(1, 'rgba(4,3,2,0)');
        ctx.globalAlpha = clamp(b.t / 0.25, 0, 1); ctx.fillStyle = vg2; ctx.fillRect(0, G.cy - vh2 / 2, w, vh2); ctx.globalAlpha = 1;
      }
      ctx.translate(G.cx, G.cy); ctx.scale(k, k);
      G.goldText(b.text, 0, b.sub ? -clamp(w * 0.02, 12, 20) * 1.2 : 0, clamp(w * 0.055, 24, 56), { blur: 34, spacing: 3 });
      if (b.sub) {
        var bsf = clamp(w * 0.02, 12, 20), bl = wrapLines(b.sub, w * 0.88, '800 ' + bsf + 'px ' + G.TEXT), by0 = clamp(w * 0.055, 24, 56) * 0.75;
        bl.forEach(function (ln, q) { G.txt(ln, 0, by0 + q * (bsf + 4), { size: bsf, family: G.TEXT, weight: 800, fill: '#fff1b8', stroke: 'rgba(0,0,0,.8)', sw: 4 }); });
      }
      ctx.restore();
    }
    if (S.final) {
      var f = S.final, T = I18N.t(), u = Math.min(w, h), a = clamp(f.t / 0.3, 0, 1), sc = G.ease.outBack(clamp(f.t / 0.5, 0, 1));
      ctx.fillStyle = 'rgba(4,3,2,' + 0.68 * a + ')'; ctx.fillRect(0, 0, w, h);
      A.rays(ctx, G.cx, G.cy, Math.max(w, h), 18, f.t * 0.4, '#ffd86a', 0.13 * a);
      ctx.save(); ctx.translate(G.cx, G.cy); ctx.scale(sc, sc);
      G.goldText(S.finalLabel || T.bonusWin, 0, -u * 0.17, clamp(u * 0.055, 20, 44), { spacing: 5 });
      G.goldText('×' + G.fmt(Math.round(f.count * 100) / 100), 0, 0, clamp(u * 0.16, 54, 150), { blur: 44 });
      G.txt(G.moneyCount(f.count * f.bet, f.mult * f.bet), 0, u * 0.14, { size: clamp(u * 0.06, 22, 54), fill: '#fff1b8', stroke: '#2a1a02', shadow: 'rgba(255,200,60,.6)' });
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

  // facteur de boost appliqué dès le début à tout ce que le joueur voit (Oracle ×N, ou ×2 de la Fureur) ; sp.pay reste le seul résultat
  function bf(sp) { return sp && sp.boost > 1 ? sp.boost : 1; }
  function r2(x) { return Math.round(x * 100) / 100; }
  function fb(v, B) { return G.fmt(r2(v * B)); }
  // bannière d'intro courte : toutes les valeurs affichées sont déjà multipliées
  async function boostIntro(S, sp, sec) {
    var B = bf(sp); if (B <= 1) return;
    var T = I18N.t();
    S.banner = { text: T.boostIntro + ' ×' + G.fmt(B), sub: T.boostIntroSub, t: 0 };
    Sfx.oracle(); FX.flash(0.4, '#ffe9a0'); FX.ring(G.cx, G.cy, '#ffe9a0', G.R, 1);
    await G.sleep(sec == null ? (quick() ? 1.0 : 1.7) : sec);
    S.banner = null;
  }
  // hook de test : ce que l'écran a affiché (total live, total final) face au gain réel sp.pay
  function markShown(S, sp, final) { G.lastBonusShown = { live: S.totalT, final: final, pay: sp.pay }; }

  async function settle(S, sp, bet) {
    await G.sleep(0.5);
    S.final = { mult: Math.min(sp.pay, M.MAX_WIN), bet: bet, count: 0, t: 0 };
    markShown(S, sp, S.final.mult);
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
    var T = I18N.t(), data = sp.bonus, rows = M.SCARAB_ROWS, vals = data.values || M.SCARAB_VALUES, B = bf(sp);   // B : boost, appliqué à tout ce qui s'affiche
    var S = newScene(T.scarabIntro), g = {}; S.bgImg = 'scarabwall'; S.dim = 0.9; S.showTotal = false; var ball = null, pegFlash = {}, slotPulse = [], used = 0, floats = [], ent = 0, landed = [], beam = null, pegRings = [], sparkAcc = 0, lastPulse = 0;
    function slotColor(v) { return v >= 25 ? ['#ffe08a', '#b8861e'] : v >= 6 ? ['#c28bff', '#5a2a86'] : v >= 2.5 ? ['#ff7a5a', '#8a1b10'] : v >= 1 ? ['#5b8cff', '#1a3a8a'] : ['#6a5a40', '#2a2118']; }
    S.layout = function () {
      // grand plateau « mur de chevilles » : sous le bandeau, jusqu'au menu du bas ; scarabées restants et total sont dans l'en-tête du cadre
      var w = G.w, h = G.h, bot = h - hudH() - (h < 520 ? 6 : 24), py0 = T0() + (h < 520 ? 40 : clamp(w * 0.034, 17, 34) * 1.9 + 10);
      g.slotH = clamp((bot - py0) * 0.1, 32, 64);
      g.dy = (bot - py0 - g.slotH - 18) / (rows + 2.15);
      g.dx = Math.min(g.dy * 2.3, (w * 0.88) / (rows + 1.5));
      g.top = py0 + g.dy * 1.15; g.pegR = Math.max(3.5, Math.min(g.dx, g.dy) * 0.17); g.ballR = g.pegR * 2.6;
      g.slotTop = g.top + (rows + 1) * g.dy + 6;
      g.px0 = G.cx - (rows / 2 + 0.78) * g.dx; g.px1 = G.cx + (rows / 2 + 0.78) * g.dx; g.py0 = py0; g.py1 = g.slotTop + g.slotH + 12;
    };
    function peg(r, j) { return { x: G.cx + (j - r / 2) * g.dx, y: g.top + (r + 1) * g.dy }; }
    S.update = function (dt) {
      chromeUpdate(S, dt); ent += dt; lastPulse += dt;
      for (var q = pegRings.length - 1; q >= 0; q--) { pegRings[q].t += dt * 3.2; if (pegRings[q].t >= 1) pegRings.splice(q, 1); }
      if (beam) { beam.t += dt; if (beam.t > beam.life) beam = null; }
      for (var k in pegFlash) { pegFlash[k] -= dt * 3; if (pegFlash[k] <= 0) delete pegFlash[k]; }
      for (var i = 0; i < slotPulse.length; i++) if (slotPulse[i] > 0) slotPulse[i] = Math.max(0, slotPulse[i] - dt * 1.6);
      for (i = floats.length - 1; i >= 0; i--) { floats[i].t += dt; if (floats[i].t > 1.4) floats.splice(i, 1); }
      if (ball) {
        ball.trail.unshift([ball.x, ball.y]); if (ball.trail.length > 22) ball.trail.pop();
        sparkAcc += dt;
        if (!ball.hover && sparkAcc > 0.035) { sparkAcc = 0; FX.spark(ball.x, ball.y, 1, Math.random() < 0.5 ? '#ffe9a0' : '#ffb347', 60, 0.45); }
      }
    };
    S.draw = function () {
      var i, r, j;
      // décor : temple illustré (piliers de chaque côté) étiré sur toute la zone de jeu
      var wim = G.art && G.art.scarabwall;
      if (wim) {   // proportions respectées (cover) : jamais étiré
        var zh = G.h - hudH() + 6, kk = Math.max(G.w / wim.width, zh / wim.height);
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, G.w, zh); ctx.clip();
        ctx.drawImage(wim, (G.w - wim.width * kk) / 2, (zh - wim.height * kk) / 2, wim.width * kk, wim.height * kk); ctx.restore();
      }
      // mur du plateau : cadre doré, fond sombre violet, grille de points lumineux
      ctx.save();
      A.roundRect(ctx, g.px0, g.py0, g.px1 - g.px0, g.py1 - g.py0, 18);
      var wl = ctx.createLinearGradient(0, g.py0, 0, g.py1); wl.addColorStop(0, 'rgba(46,18,62,.22)'); wl.addColorStop(1, 'rgba(10,4,18,.3)');
      ctx.fillStyle = wl; ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 30; ctx.fill(); ctx.shadowBlur = 0;
      ctx.lineWidth = 4; ctx.strokeStyle = A.goldGrad(ctx, g.px0, g.py0, g.px1, g.py1); ctx.stroke();
      ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,233,160,.35)'; A.roundRect(ctx, g.px0 + 6, g.py0 + 6, g.px1 - g.px0 - 12, g.py1 - g.py0 - 12, 14); ctx.stroke();
      ctx.restore();
      // grille dense de petites lumières (décor, comme le mur du Pachinko) : les vraies chevilles restent les plus grosses
      var dsx = g.dx / 2, dsy = g.dy / 2, dr = Math.max(1.1, g.pegR * 0.26), de = clamp((ent - 0.2) / 0.6, 0, 1);
      if (de > 0) {
        ctx.save(); ctx.globalAlpha = 0.5 * de; ctx.fillStyle = '#fff6dc'; ctx.shadowColor = 'rgba(255,240,190,.9)'; ctx.shadowBlur = dr * 3; ctx.beginPath();
        for (var dyy = g.py0 + 16; dyy < g.slotTop - 8; dyy += dsy) for (var dxx = g.px0 + 14; dxx < g.px1 - 10; dxx += dsx) { ctx.moveTo(dxx + dr, dyy); ctx.arc(dxx, dyy, dr, 0, TAU); }
        ctx.fill(); ctx.restore();
      }
      // séparateurs dorés entre les cases (comme les barres du Pachinko)
      for (i = 0; i <= rows + 1; i++) {
        var bx = G.cx + (i - 0.5 - rows / 2) * g.dx, be = clamp((ent - 0.9) / 0.5, 0, 1);
        if (be <= 0) continue;
        var bh = g.slotH + g.dy * 1.5, bgr = ctx.createLinearGradient(0, g.slotTop + g.slotH - bh * be, 0, g.slotTop + g.slotH);
        bgr.addColorStop(0, 'rgba(255,233,160,0)'); bgr.addColorStop(0.3, '#ffe08a'); bgr.addColorStop(1, '#b8861e');
        ctx.fillStyle = bgr; ctx.fillRect(bx - 1.6, g.slotTop + g.slotH - bh * be, 3.2, bh * be);
      }
      // chevilles
      for (r = 0; r < rows; r++) for (j = 0; j <= r; j++) {
        var p = peg(r, j), f = pegFlash[r + '_' + j] || 0;
        var pe = clamp((ent - 0.25 - r * 0.07) / 0.35, 0, 1); if (pe <= 0) continue;
        var pk2 = G.ease.outBack(pe);
        if (f > 0) { ctx.fillStyle = 'rgba(255,230,140,' + f * 0.5 + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, g.pegR * (2 + f * 3), 0, TAU); ctx.fill(); }
        ctx.save(); ctx.translate(p.x, p.y); ctx.scale(pk2, pk2); ctx.translate(-p.x, -p.y);
        ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.arc(p.x + g.pegR * 0.35, p.y + g.pegR * 0.6, g.pegR, 0, TAU); ctx.fill();
        if (!G.icon(ctx, 'peg', p.x, p.y, g.pegR * 3.3 * (1 + f * 0.35))) {
          ctx.beginPath(); ctx.arc(p.x, p.y, g.pegR, 0, TAU);
          var pg = ctx.createRadialGradient(p.x - g.pegR * 0.3, p.y - g.pegR * 0.3, 0, p.x, p.y, g.pegR); pg.addColorStop(0, '#ffffff'); pg.addColorStop(0.6, '#fff1c0'); pg.addColorStop(1, '#d8a93a');
          ctx.save(); ctx.shadowColor = 'rgba(255,240,190,.9)'; ctx.shadowBlur = g.pegR * 2.2;
          ctx.fillStyle = pg; ctx.fill(); ctx.restore();
        }
        ctx.restore();
      }
      // ondes de choc sur les chevilles
      for (i = 0; i < pegRings.length; i++) {
        var pr = pegRings[i]; ctx.strokeStyle = 'rgba(255,233,160,' + (1 - pr.t) * 0.8 + ')'; ctx.lineWidth = 2 * (1 - pr.t) + 0.5;
        ctx.beginPath(); ctx.arc(pr.x, pr.y, g.pegR * (1 + pr.t * 5), 0, TAU); ctx.stroke();
      }
      // cases
      for (i = 0; i <= rows; i++) {
        var cx = G.cx + (i - rows / 2) * g.dx, v = vals[i], col = slotColor(v), pl = slotPulse[i] || 0, sw = g.dx * 0.9;
        var se = clamp((ent - 0.9 - Math.abs(i - rows / 2) * 0.05) / 0.4, 0, 1); if (se <= 0) continue;
        var x = cx - sw / 2, y = g.slotTop + (1 - G.ease.outBack(se)) * g.slotH * 1.6;
        ctx.globalAlpha = se;
        A.roundRect(ctx, x, y + g.slotH * 0.12, sw, g.slotH, 8); ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fill();
        A.roundRect(ctx, x, y, sw, g.slotH, 8);
        var sg = ctx.createLinearGradient(0, y, 0, y + g.slotH); sg.addColorStop(0, col[0]); sg.addColorStop(1, col[1]);
        ctx.fillStyle = sg; ctx.fill();
        if (pl > 0) { ctx.fillStyle = 'rgba(255,255,255,' + pl * 0.6 + ')'; ctx.fill(); }
        if (landed[i]) { // case d'arrivée : halo doré pulsant persistant
          var hp = 0.5 + 0.5 * Math.sin(lastPulse * 6);
          ctx.save(); ctx.shadowColor = '#ffd86a'; ctx.shadowBlur = 14 + hp * 18; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,240,170,' + (0.6 + hp * 0.4) + ')';
          A.roundRect(ctx, x - 2, y - 2, sw + 4, g.slotH + 4, 9); ctx.stroke(); ctx.restore();
          for (var lb = 0; lb < landed[i]; lb++) if (!G.icon(ctx, 'scarab', x + sw * (0.25 + lb * 0.25), y - g.slotH * 0.18, g.slotH * 0.55)) A.scarab(ctx, x + sw * (0.25 + lb * 0.25), y - g.slotH * 0.18, g.slotH * 0.28, '#ffd86a', 'rgba(60,30,0,.6)');
        }
        ctx.lineWidth = 1.5 + pl * 3; ctx.strokeStyle = pl > 0 ? '#fff6c8' : 'rgba(255,216,106,.6)'; ctx.stroke();
        var vt = '×' + fb(vals[i], B);
        G.txt(vt, cx, y + g.slotH / 2 + 1, { size: Math.min(clamp(g.dx * 0.3, 11, 24), sw * 0.92 / Math.max(2, vt.length * 0.62)), weight: 900, fill: i === 4 || vals[i] < 1.2 ? '#fff1d8' : '#fff', stroke: 'rgba(0,0,0,.55)', sw: 3 });
        ctx.globalAlpha = 1;
      }
      // faisceau de lumière sur la case d'arrivée
      if (beam) {
        var bk = beam.t / beam.life, bw = g.dx * (0.9 + bk * 0.6), bg2 = ctx.createLinearGradient(0, g.slotTop - g.dy * 4, 0, g.slotTop);
        bg2.addColorStop(0, 'rgba(255,230,140,0)'); bg2.addColorStop(1, 'rgba(255,230,140,' + 0.55 * (1 - bk) + ')');
        ctx.fillStyle = bg2; ctx.fillRect(beam.x - bw / 2, g.slotTop - g.dy * 4, bw, g.dy * 4);
      }
      // traînée + scarabée
      if (ball) {
        for (i = ball.trail.length - 1; i >= 0; i--) {
          var t = ball.trail[i], a = (1 - i / ball.trail.length) * 0.35;
          ctx.fillStyle = 'rgba(255,216,106,' + a + ')'; ctx.beginPath(); ctx.arc(t[0], t[1], g.ballR * (1 - i / 26) * 0.9, 0, TAU); ctx.fill();
        }
        ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(ball.x + g.ballR * 0.8, ball.y + g.ballR * 1.2, g.ballR * 1.1, g.ballR * 0.55, 0, 0, TAU); ctx.fill();
        if (ball.charge > 0) { // suspense : aura qui gonfle + anneau
          var cr = g.ballR * (3 + ball.charge * 4), ca = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, cr);
          ca.addColorStop(0, 'rgba(255,240,170,' + 0.7 * ball.charge + ')'); ca.addColorStop(1, 'rgba(255,200,60,0)');
          ctx.fillStyle = ca; ctx.beginPath(); ctx.arc(ball.x, ball.y, cr, 0, TAU); ctx.fill();
        }
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
        if (!G.icon(ctx, 'scarab', g.px0 + 34 + i * 44, g.py0 + g.dy * 0.6, Math.min(42, g.dy * 1.0))) A.scarab(ctx, g.px0 + 34 + i * 36, g.py0 + g.dy * 0.6, 26, i >= used ? '#ffd86a' : '#6a5a40', 'rgba(60,30,0,.6)');
      }
      ctx.globalAlpha = 1;
      for (i = 0; i < floats.length; i++) {
        var fl = floats[i]; ctx.globalAlpha = 1 - clamp((fl.t - 0.8) / 0.6, 0, 1);
        var ft = '+×' + fb(fl.v, B);
        G.txt(ft, fl.x, fl.y - fl.t * 50, { size: Math.min(clamp(g.dx * 0.42, 18, 36), g.dx * 2.2 / Math.max(3, ft.length * 0.62)), weight: 900, fill: '#fff1b8', stroke: '#2a1a02', shadow: 'rgba(255,200,60,.8)' });
      }
      ctx.globalAlpha = 1;
      // total en haut à droite du cadre
      ctx.save(); var tsc = 1 + (S.pop || 0) * 0.18, tfs = clamp(g.dy * 0.9, 17, 34); ctx.translate(g.px1 - 22, g.py0 + g.dy * 0.62); ctx.scale(tsc, tsc);
      var tval = '×' + G.fmt(Math.round(S.total * 100) / 100), tw = tval.length * tfs * 0.6;
      G.txt(T.total, -tw - 10, 2, { size: clamp(tfs * 0.4, 9, 13), family: G.TEXT, weight: 800, fill: '#b9a780', spacing: 3, align: 'right' });
      G.goldText(tval, 0, 0, tfs, { blur: 18, align: 'right' }); ctx.restore();
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
      var last = b === data.balls.length - 1, hx = G.cx + rnd(-0.3, 0.3) * g.dx, hy = g.top - g.dy * 0.5;
      ball = { x: hx, y: hy - g.dy * 0.45, rot: rnd(0, 6), trail: [], hover: true, charge: 0 };
      // apparition + suspense : le scarabée plane, vibre et se charge avant d'être lâché
      var cd = quick() ? 0.25 : last ? 1.1 : 0.7;
      Sfx.oracle && b === 0 && !quick() && Sfx.oracle();
      FX.ring(hx, hy, '#ffe9a0', g.dx * 2, 0.6);
      await G.tween(cd, function (u) {
        ball.charge = u; ball.y = hy - g.dy * 0.45 * (1 - G.ease.out3(Math.min(1, u * 2.5)));
        ball.x = hx + Math.sin(u * 60) * g.ballR * 0.18 * u; ball.rot += 0.08 + u * 0.3;
        if (Math.random() < 0.3) Sfx.tick(0.2 + u * 0.8);
      }, null);
      ball.hover = false; ball.charge = 0; ball.x = hx; ball.y = hy;
      FX.spark(hx, hy, 14, '#fff1b8', 220, 0.6); FX.ring(hx, hy, '#ffd86a', g.dx * 1.6, 0.5); FX.shake(4, 0.2);
      // chute libre depuis le haut jusqu'à la première cheville
      await flight({ x: ball.x, y: ball.y }, P, 0.0001, sk);
      if (last && !quick()) sk *= 1.0;
      for (var r = 0; r < rows; r++) {
        var pk = r + '_' + col, pp = peg(r, col);
        pegFlash[pk] = 1; pegRings.push({ x: pp.x, y: pp.y, t: 0 }); if (last && r >= rows - 3 && !quick()) { FX.flash(0.05, '#ffe9a0'); } Sfx.tick(r / rows); Sfx.coin(0.7 + r * 0.06); FX.spark(pp.x, pp.y - g.pegR, 5, '#ffe9a0', 130, 0.4);
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
      slotPulse[d.slot] = 1; used = b + 1; ball = null; landed[d.slot] = (landed[d.slot] || 0) + 1;
      var sx2 = G.cx + (d.slot - rows / 2) * g.dx, sy = g.slotTop;
      beam = { x: sx2, t: 0, life: 0.9 }; FX.ring(sx2, sy + g.slotH / 2, '#fff1b8', g.dx * 2.2, 0.8);
      floats.push({ v: v, x: sx2, y: sy - 8, t: 0 });
      bump(S, S.totalT + v * B); Sfx.chime(v * 2); FX.spark(sx2, sy + g.slotH / 2, 20, '#ffd86a', 260);
      if (v >= 6) { FX.coins(sx2, sy, 14 + v, 800, 30); FX.shake(8, 0.4); FX.flash(0.2, '#ffe9a0'); }
      await G.sleep(v >= 6 ? 0.9 : 0.5);
    }
    S.run = async function () {
      slotPulse = vals.map(function () { return 0; }); landed = []; ent = 0;
      G.say(T.scarabSub);
      FX.flash(0.3, '#ffe9a0'); FX.ring(G.cx, g.top, '#ffd86a', G.R * 0.8, 1.1); FX.shake(5, 0.4); Sfx.oracle && Sfx.oracle();
      await G.sleep(quick() ? 1.2 : 2);
      await boostIntro(S, sp);
      G.say('');
      for (var b = 0; b < data.balls.length; b++) { await drop(b); await G.sleep(quick() ? 0.1 : 0.4); }
      G.say('');
      // grand final : pluie d'or, ondes et éclats depuis les cases gagnantes
      FX.flash(0.35, '#ffe9a0'); FX.shake(10, 0.6); FX.rain && FX.rain(G.w, quick() ? 20 : 50);
      data.balls.forEach(function (d, i) { var fx = G.cx + (d.slot - rows / 2) * g.dx; FX.ring(fx, g.slotTop + g.slotH / 2, '#ffd86a', g.dx * 3, 1.1); FX.spark(fx, g.slotTop, 24, '#ffe9a0', 340); });
      await G.sleep(quick() ? 0.2 : 0.7);
      await settle(S, sp, bet);
    };
        return S;
  }

  /* ======================================================================
   * 2. PESÉE DU CŒUR
   * ====================================================================== */
  function weighScene(sp, bet) {
    var T = I18N.t(), data = sp.bonus, S = newScene(T.weighIntro), g = {}, B = bf(sp); S.bgImg = 'judgment';
    var theta = 0, glowSide = -1, dimSide = -1, ph = 0, pick = -1, hoverCard = -1, sway = false, choosing = false, cardSel = -1, cardA = 0;
    var ent = 0, tens = 0, motes = [], burst = 0, sprk = 0, flashW = 0, weighing = false;   // animation : entrée, tension, particules, éclat du verdict
    var res = [null, null], verdict = null, cards = [{}, {}];
    var reel = [{ cur: 0, prev: 0, k: 1, on: false, shown: false, pop: 0 }, { cur: 0, prev: 0, k: 1, on: false, shown: false, pop: 0 }];
    var pool = [];   // valeurs plausibles du profil, pour le défilement des compteurs
    (M.WEIGH_PROFILES[data.profile || 'std'] || M.WEIGH_PROFILES.std).forEach(function (q) { q[0].forEach(function (v) { if (pool.indexOf(v) < 0) pool.push(v); }); });
    for (var mi = 0; mi < 26; mi++) motes.push({ x: Math.random(), y: Math.random(), s: 0.3 + Math.random() * 0.7, p: Math.random() * 6 });
    S.layout = function () {
      var w = G.w, h = G.h;
      if (h < 520) { g.px = G.cx; g.py = h * 0.34; g.L = Math.min(w * 0.26, h * 0.27); g.chain = Math.min(h * 0.11, g.L * 0.55); g.pan = g.L * 0.38; }
      else { g.px = G.cx; g.py = h * 0.375; g.L = Math.min(w * 0.28, h * 0.33); g.chain = Math.min(h * 0.115, g.L * 0.5); g.pan = g.L * 0.4; }
      // cartes de choix : de part et d'autre de la balance si la place le permet, sinon sous les plateaux
      var hb = h - hudH(), edge = w / 2 - g.L - g.pan, cw, chh, y, x0;
      if (edge >= 150) {
        cw = clamp(edge - 30, 130, 300); chh = clamp(hb * 0.42, 140, 290);
        y = clamp(g.py + g.chain * 0.9 + g.pan * 0.3 - chh / 2, T0() + 56, hb - chh - (h < 520 ? 8 : 58));
        cards[0] = { x: edge / 2 - cw / 2, y: y, w: cw, h: chh }; cards[1] = { x: w - edge / 2 - cw / 2, y: y, w: cw, h: chh };
      } else {
        var bottom = hb - (h < 520 ? 6 : 60), top = g.py + g.chain + g.pan * 1.35 + 10;
        cw = (w * 0.92 - 12) / 2; chh = clamp(bottom - top, 78, 200); y = Math.max(top, bottom - chh); x0 = w * 0.04;
        cards[0] = { x: x0, y: y, w: cw, h: chh }; cards[1] = { x: x0 + cw + 12, y: y, w: cw, h: chh };
      }
    };
    function endPt(side) { var a = theta, x = side * g.L; return { x: g.px + Math.cos(a) * x, y: g.py + Math.sin(a) * x }; }
    function platePt(si) { var e = endPt(si ? 1 : -1); return { x: e.x, y: e.y + g.chain }; }
    function heart(x, y, s, col) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24); ctx.beginPath();
      ctx.moveTo(0, 9); ctx.bezierCurveTo(-18, -4, -9, -16, 0, -7); ctx.bezierCurveTo(9, -16, 18, -4, 0, 9); ctx.closePath();
      var hg = ctx.createRadialGradient(-3, -4, 0, 0, 0, 16); hg.addColorStop(0, '#ff9a8a'); hg.addColorStop(1, col || '#a01810'); ctx.fillStyle = hg; ctx.fill();
      ctx.lineWidth = 1.2; ctx.strokeStyle = '#5a0c06'; ctx.stroke(); ctx.restore();
    }
    S.update = function (dt) {
      chromeUpdate(S, dt); ph += dt; burst = Math.max(0, burst - dt * 0.8); flashW = Math.max(0, flashW - dt * 2.2);
      if (verdict) verdict.t += dt;
      if (sway) theta = 0.03 * Math.sin(ph * 1.3) * clamp(ent, 0, 1);
      reel.forEach(function (r) { r.k = Math.min(1, r.k + dt * 13); r.pop = Math.max(0, r.pop - dt * 2.4); });
      for (var k = 0; k < motes.length; k++) { var m = motes[k]; m.y -= dt * 0.05 * m.s; m.x += Math.sin(ph * 0.8 + m.p) * dt * 0.01; if (m.y < -0.05) { m.y = 1.05; m.x = Math.random(); } }
      // étincelles qui crépitent autour du cœur et de la plume pendant la pesée
      if (tens > 0 && weighing && ent >= 1) {
        sprk += dt * (3 + tens * 14);
        while (sprk >= 1) { sprk -= 1; var sd = Math.random() < 0.5 ? -1 : 1, pe = endPt(sd); FX.spark(pe.x + (Math.random() - 0.5) * g.pan, pe.y + g.chain - g.pan * 0.3, 1, sd < 0 ? '#fff4c8' : '#ff9a8a', 90 + tens * 120, 0.5); }
      }
    };
    function fitSize(txt, maxW, fs, fam) {
      ctx.font = '900 ' + fs + 'px ' + fam; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px';
      while (fs > 9 && ctx.measureText(txt).width > maxW) { fs -= 1; ctx.font = '900 ' + fs + 'px ' + fam; }
      return fs;
    }
    function drawCard(i) {
      var c = cards[i], sel = cardSel === i, hv = hoverCard === i || sel, other = cardSel >= 0 && !sel;
      var a = clamp(cardA, 0, 1) * (other ? 0.35 : 1), k = G.ease.outBack(clamp(cardA, 0, 1)), lift = hv ? 6 : 0, y = c.y - lift + (1 - k) * 36;
      if (a <= 0.01) return;
      var compact = c.h < 125, pulse = 0.5 + 0.5 * Math.sin(G.t * 6);
      ctx.save(); ctx.globalAlpha = a;
      A.roundRect(ctx, c.x, y, c.w, c.h, 16);
      var gg = ctx.createLinearGradient(0, y, 0, y + c.h); gg.addColorStop(0, hv ? '#3a2c16' : '#241a0d'); gg.addColorStop(1, '#0c0804');
      ctx.fillStyle = gg; ctx.shadowColor = hv ? 'rgba(255,216,106,' + (0.55 + 0.2 * pulse) + ')' : 'rgba(0,0,0,.7)'; ctx.shadowBlur = hv ? 30 : 14; ctx.fill(); ctx.shadowBlur = 0;
      ctx.lineWidth = hv ? 3 : 2; ctx.strokeStyle = hv ? '#fff1b8' : A.goldGrad(ctx, c.x, y, c.x + c.w, y + c.h); ctx.stroke();
      var isz = compact ? c.h * 0.46 : Math.min(c.w * 0.3, c.h * 0.3), ix = compact ? c.x + c.h * 0.55 : c.x + c.w / 2, iy = compact ? y + c.h * 0.5 : y + c.h * 0.34;
      var og = ctx.createRadialGradient(ix, iy, 0, ix, iy, isz * 1.7); og.addColorStop(0, i ? 'rgba(255,90,70,.28)' : 'rgba(255,244,200,.3)'); og.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = og; ctx.beginPath(); ctx.arc(ix, iy, isz * 1.7, 0, TAU); ctx.fill();
      if (i === 0) A.feather(ctx, ix, iy, isz * 1.15, '#fff8e6', 'rgba(150,110,40,.8)'); else heart(ix, iy + isz * 0.08, isz * 1.35);
      var tx = compact ? c.x + c.h * 1.05 : c.x + c.w / 2, al = compact ? 'left' : 'center', maxW = compact ? c.w - c.h * 1.05 - 38 : c.w * 0.88;
      var name = i ? T.heart : T.feather, tag = i ? T.heartOf : T.featherOf;
      var fs = fitSize(name, maxW, compact ? clamp(c.h * 0.3, 15, 26) : clamp(c.w * 0.13, 17, 30), G.TITLE);
      var ty = compact ? y + c.h * 0.36 : y + c.h * 0.66;
      G.txt(name, tx, ty, { size: fs, weight: 900, fill: '#ffe08a', stroke: '#2a1802', sw: 3, align: al, spacing: 2 });
      var fs2 = fitSize(tag, maxW, Math.max(10, fs * 0.58), G.TEXT);
      G.txt(tag, tx, ty + fs * 0.95, { size: fs2, family: G.TEXT, weight: 800, fill: '#cdb98a', align: al, spacing: 2 });
      // touche de raccourci
      var br = clamp(Math.min(c.w, c.h) * 0.09, 10, 14), bx = compact ? c.x + c.w - br - 12 : c.x + br + 12, by = y + br + 12;
      ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#d8c590'; ctx.stroke();
      G.txt(String(i + 1), bx, by + 1, { size: br * 1.15, family: G.TEXT, weight: 900, fill: '#fff1b8' });
      ctx.restore();
    }
    S.draw = function () {
      var u = Math.min(G.w, G.h), i, eo = G.ease.outBack(clamp(ent, 0, 1));
      // lumière de Maât : faisceau doré, rayons lents et poussière d'or flottante
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var bl = ctx.createRadialGradient(g.px, g.py, 0, g.px, g.py, u * 0.75), ba = clamp(ent, 0, 1) * (0.2 + 0.08 * Math.sin(ph * 1.7) + tens * 0.12 + burst * 0.3);
      bl.addColorStop(0, 'rgba(255,216,120,' + ba + ')'); bl.addColorStop(1, 'rgba(255,216,120,0)'); ctx.fillStyle = bl; ctx.fillRect(0, 0, G.w, G.h);
      ctx.restore();
      A.rays(ctx, g.px, g.py, Math.max(G.w, G.h), 14, ph * 0.12, '#ffd86a', (0.05 + tens * 0.05 + burst * 0.16) * clamp(ent, 0, 1));
      ctx.save(); ctx.fillStyle = '#ffe9a0';
      for (i = 0; i < motes.length; i++) { var mo = motes[i]; ctx.globalAlpha = clamp(ent, 0, 1) * (0.25 + 0.35 * Math.abs(Math.sin(ph * 1.5 + mo.p))); ctx.beginPath(); ctx.arc(mo.x * G.w, mo.y * G.h, 1 + mo.s * 1.8, 0, TAU); ctx.fill(); }
      ctx.restore();
      // entrée : la balance descend du ciel en se dépliant
      ctx.save(); ctx.globalAlpha = clamp(ent * 1.6, 0, 1); ctx.translate(g.px, g.py); ctx.scale(0.75 + 0.25 * eo, 0.75 + 0.25 * eo); ctx.translate(-g.px, -g.py - (1 - clamp(eo, 0, 1.2)) * G.h * 0.3);
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
        var e = endPt(side), cx = e.x, cy = e.y + g.chain, pr = g.pan, dim = dimSide === si ? 0.42 : 1, rl = reel[si];
        ctx.save(); ctx.globalAlpha = dim;
        // chaînes
        ctx.strokeStyle = 'rgba(246,216,120,.85)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(cx - pr, cy); ctx.moveTo(e.x, e.y); ctx.lineTo(cx + pr, cy); ctx.moveTo(e.x, e.y); ctx.lineTo(cx, cy - pr * 0.1); ctx.stroke();
        if (choosing && hoverCard === si) { ctx.fillStyle = 'rgba(255,236,150,' + (0.16 + 0.1 * Math.sin(G.t * 7)) + ')'; ctx.beginPath(); ctx.arc(cx, cy, pr * 1.9, 0, TAU); ctx.fill(); }
        if (pick === si) A.ankh(ctx, cx, cy - pr * 1.55, pr * 0.5, '#6ff0dd');
        if (glowSide === si) {
          var gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, pr * 2.3); gl.addColorStop(0, 'rgba(255,236,150,.7)'); gl.addColorStop(1, 'rgba(255,236,150,0)');
          ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, cy, pr * 2.3, 0, TAU); ctx.fill();
        }
        // objet
        var pulse = 0.5 + 0.5 * Math.sin(ph * (3 + tens * 9) + si), hl = (0.25 + 0.3 * pulse + tens * 0.35) * clamp(ent, 0, 1), hc = si === 0 ? '255,244,200' : '255,90,70';
        var hg2 = ctx.createRadialGradient(cx, cy - pr * 0.4, 0, cx, cy - pr * 0.4, pr * 1.6); hg2.addColorStop(0, 'rgba(' + hc + ',' + hl + ')'); hg2.addColorStop(1, 'rgba(' + hc + ',0)');
        ctx.fillStyle = hg2; ctx.beginPath(); ctx.arc(cx, cy - pr * 0.4, pr * 1.6, 0, TAU); ctx.fill();
        if (si === 0) { A.feather(ctx, cx, cy - pr * 0.42, pr * 0.95, '#fff8e6', 'rgba(150,110,40,.8)'); }
        else { heart(cx, cy - pr * 0.3, pr * 0.9 * (1 + 0.07 * Math.pow(Math.max(0, Math.sin(ph * (4 + tens * 8))), 3) * (0.5 + tens))); }
        // bol
        ctx.beginPath(); ctx.ellipse(cx, cy, pr, pr * 0.2, 0, 0, Math.PI, false); ctx.quadraticCurveTo(cx + pr * 0.5, cy + pr * 0.55, cx, cy + pr * 0.58); ctx.quadraticCurveTo(cx - pr * 0.5, cy + pr * 0.55, cx - pr, cy);
        ctx.fillStyle = A.goldGrad(ctx, cx - pr, cy, cx + pr, cy + pr * 0.5); ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = '#5b4311'; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, cy, pr, pr * 0.2, 0, 0, TAU); ctx.fillStyle = '#e6c25a'; ctx.fill(); ctx.stroke();
        // cartouche du multiplicateur : « ×? » puis compteur qui défile (rouleau) et se fige sur la vraie valeur
        var cw = pr * 1.5, ch = pr * 0.62, cyy = cy + pr * 0.95, lit = glowSide === si || rl.on;
        ctx.save(); ctx.translate(cx, cyy); ctx.scale(1 + 0.3 * rl.pop, 1 + 0.3 * rl.pop); ctx.translate(-cx, -cyy);
        A.roundRect(ctx, cx - cw / 2, cyy - ch / 2, cw, ch, ch * 0.5);
        var cg = ctx.createLinearGradient(0, cyy - ch / 2, 0, cyy + ch / 2); cg.addColorStop(0, '#2a1f10'); cg.addColorStop(1, '#0c0804');
        ctx.fillStyle = cg; ctx.fill(); ctx.lineWidth = lit ? 3 : 1.6; ctx.strokeStyle = lit ? '#fff6c8' : A.goldGrad(ctx, cx - cw, cyy, cx + cw, cyy); ctx.stroke();
        ctx.save(); A.roundRect(ctx, cx - cw / 2 + 2, cyy - ch / 2 + 2, cw - 4, ch - 4, ch * 0.45); ctx.clip();
        var tb = lit ? 22 : 8, t1 = '×' + fb(rl.prev, B), t2 = '×' + fb(rl.cur, B), fsn = Math.min(ch * 0.62, cw * 0.86 / Math.max(2.4, Math.max(t1.length, t2.length) * 0.62));   // ×B déjà appliqué aux compteurs
        if (rl.k < 1) { G.goldText(t1, cx, cyy + 1 + rl.k * ch * 0.95, fsn, { blur: 6 }); G.goldText(t2, cx, cyy + 1 + (rl.k - 1) * ch * 0.95, fsn, { blur: 6 }); }
        else G.goldText(rl.shown ? t2 : '×?', cx, cyy + 1, fsn, { blur: tb });
        ctx.restore(); ctx.restore();
        if (res[si] === 'lost') {   // multiplicateur barré
          ctx.globalAlpha = 0.95; ctx.strokeStyle = 'rgba(255,84,62,.95)'; ctx.lineWidth = Math.max(2.5, ch * 0.11); ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(cx - cw * 0.4, cyy + ch * 0.12); ctx.lineTo(cx + cw * 0.4, cyy - ch * 0.12); ctx.stroke(); ctx.lineCap = 'butt';
        }
        if (G.h >= 520 && !res[si]) G.txt(si === 0 ? T.feather : T.heart, cx, cyy - ch * 0.78, { size: clamp(pr * 0.17, 10, 15), family: G.TEXT, weight: 800, fill: '#d8c590', spacing: 3 });
        if (res[si]) {   // GAGNÉ / PERDU sous le cartouche
          var ls = clamp(pr * 0.24, 12, 22), won = res[si] === 'won', pop = G.ease.outBack(clamp((verdict ? verdict.t : 1) / 0.4, 0, 1));
          ctx.globalAlpha = won ? 1 : 0.95;
          G.txt(won ? T.weighWon : T.weighLost, cx, cyy - ch * 0.5 - ls * 0.75, { size: ls * pop, family: G.TEXT, weight: 900, fill: won ? '#fff1b8' : '#ff8a7a', stroke: 'rgba(0,0,0,.6)', sw: 3, spacing: 3, shadow: won ? 'rgba(255,216,106,.9)' : 'rgba(0,0,0,.6)', blur: won ? 14 : 4 });
        }
        ctx.restore();
      });
      ctx.restore();
      // cartes de choix
      if (cardA > 0) { drawCard(0); drawCard(1); }
      if (flashW > 0) { ctx.fillStyle = 'rgba(255,246,210,' + flashW * 0.55 + ')'; ctx.fillRect(0, 0, G.w, G.h); }
      if (burst > 0 && glowSide >= 0) { var wc = platePt(glowSide); A.rays(ctx, wc.x, wc.y, Math.max(G.w, G.h), 20, ph * 0.6, '#fff1b8', burst * 0.3); }
      // verdict du joueur : bandeau GAGNÉ / PERDU
      if (verdict) {
        var vk = G.ease.outBack(clamp(verdict.t / 0.4, 0, 1)), vfs = clamp(G.w * 0.075, 30, 76), vh = vfs * 1.7;
        ctx.save(); ctx.globalAlpha = clamp(verdict.t / 0.2, 0, 1) * 0.82;
        var vg = ctx.createLinearGradient(0, G.cy - vh / 2, 0, G.cy + vh / 2); vg.addColorStop(0, 'rgba(4,3,2,0)'); vg.addColorStop(0.3, 'rgba(4,3,2,.9)'); vg.addColorStop(0.7, 'rgba(4,3,2,.9)'); vg.addColorStop(1, 'rgba(4,3,2,0)');
        ctx.fillStyle = vg; ctx.fillRect(0, G.cy - vh / 2, G.w, vh); ctx.restore();
        ctx.save(); ctx.translate(G.cx, G.cy); ctx.scale(vk, vk);
        if (verdict.win) G.goldText(T.guessRight, 0, 0, vfs, { blur: 34, spacing: 4 });
        else G.txt(T.guessWrong, 0, 0, { size: vfs, weight: 900, fill: '#ff8a7a', stroke: '#2a0804', sw: vfs * 0.1, shadow: 'rgba(255,60,40,.55)', blur: 22, spacing: 4 });
        ctx.restore();
      }
      chrome(S);
    };
    // choix de la plume ou du coeur : deux cartes, touches 1 / 2, choix automatique au bout de 14 s
    function choose() {
      return new Promise(function (resolve) {
        var done = false;
        function fin(i) { if (done) return; done = true; S.onPointer = null; window.removeEventListener('keydown', key, true); resolve(i); }
        function take(i) {
          if (done || cardSel >= 0) return;
          cardSel = i; hoverCard = i; Sfx.shield();
          var c = cards[i]; FX.spark(c.x + c.w / 2, c.y + c.h / 2, 24, '#ffe9a0', 300); var pp = platePt(i); FX.ring(pp.x, pp.y, '#6ff0dd', g.pan * 1.6, 0.6);
          G.sleep(0.4).then(function () { fin(i); });
        }
        function key(e) {
          if (!$('modal').hidden) return;
          var n = { Digit1: 0, Digit2: 1, Numpad1: 0, Numpad2: 1 }[e.code];
          if (n != null) { e.preventDefault(); e.stopImmediatePropagation(); take(n); }
        }
        window.addEventListener('keydown', key, true);
        S.onPointer = function (x, y, type) {
          var h = -1, i;
          for (i = 0; i < 2; i++) { var c = cards[i]; if (x >= c.x && x <= c.x + c.w && y >= c.y - 6 && y <= c.y + c.h) h = i; }
          if (h < 0) for (i = 0; i < 2; i++) { var pp = platePt(i); if (Math.hypot(x - pp.x, y - pp.y) < g.pan * 1.6) h = i; }
          if (cardSel < 0) hoverCard = h;
          if (type === 'down' && h >= 0) take(h);
        };
        choosing = true; G.say(T.guessHint);
        G.tween(0.5, function (u) { cardA = u; }, null);
        G.sleep(14).then(function () { take(Math.random() < 0.5 ? 0 : 1); });
      });
    }
    // le choix fixe le gain : le plateau choisi gagne son multiplicateur s'il est le plus lourd, sinon rien ; le gain en attente est recalculé
    function commit(p) {
      data.pick = p; data.total = M.weighGain(data, p);
      sp.base = data.total; sp.pay = sp.base * (sp.boost || 1);
      if (G.onBonusChoice) G.onBonusChoice();
    }
    // compteur qui défile (valeurs au hasard, de plus en plus lentes) puis se fige sur le vrai multiplicateur
    function rollPlate(si, dur, lastOne) {
      var rl = reel[si], n = Math.round(10 + dur * 9), idx = -1;
      rl.shown = true; rl.on = true;
      return G.tween(dur, function (u) {
        var p = 1 - Math.pow(1 - u, 3), k = Math.min(n - 1, Math.floor(p * n));
        if (k !== idx) {
          idx = k; var v, tries = 0; do { v = pool[Math.floor(Math.random() * pool.length)]; tries++; } while ((v === rl.cur || v === data.mults[si]) && tries < 8);
          rl.prev = rl.cur; rl.cur = v; rl.k = 0; Sfx.tick(0.15 + 0.7 * k / n);
          if (k % 3 === 0) { var pe = platePt(si); FX.spark(pe.x, pe.y + g.pan * 0.95, 2, '#ffe9a0', 130, 0.35); }
        }
      }, null).then(function () {
        rl.prev = rl.cur; rl.cur = data.mults[si]; rl.k = 0; rl.on = false; rl.pop = 1;
        var pe = platePt(si), cy = pe.y + g.pan * 0.95;
        if (lastOne) { Sfx.thud(); FX.shake(8, 0.3); FX.flash(0.2, '#ffe9a0'); FX.ring(pe.x, cy, '#ffe9a0', g.pan * 2.2, 0.7); FX.spark(pe.x, cy, 26, '#ffe9a0', 360); }
        else { Sfx.drum(0.3); FX.ring(pe.x, cy, '#ffd86a', g.pan * 1.6, 0.5); FX.spark(pe.x, cy, 14, '#ffd86a', 260); }
      });
    }
    S.run = async function () {
      var q = quick();
      // entrée spectaculaire : flash doré, balance qui descend, onde de choc à l'atterrissage
      Sfx.oracle(); FX.flash(0.35, '#ffe9a0');
      var e0 = G.tween(q ? 0.7 : 1.3, function (u) { ent = u; theta = 0.32 * (1 - u) * Math.sin(u * 14) * (1 - u); }, null);
      await e0; ent = 1; theta = 0; sway = true; Sfx.thud(); FX.shake(10, 0.4); FX.ring(g.px, g.py, '#ffe9a0', g.L * 1.6, 0.8); FX.dust(g.px, G.h - hudH() - 20, 14, '#ffd86a');
      G.say(T.weighSub);
      await boostIntro(S, sp);
      await G.sleep(q ? 0.5 : 1.6);
      // 1. choix de la plume ou du coeur (les multiplicateurs sont cachés)
      pick = q ? (Math.random() < 0.5 ? 0 : 1) : await choose();
      choosing = false; commit(pick);
      if (q) { Sfx.shield(); var pq = platePt(pick); FX.ring(pq.x, pq.y, '#6ff0dd', g.pan * 1.6, 0.6); }
      G.tween(0.4, function (u) { cardA = 1 - u; }, null);
      await G.sleep(q ? 0.25 : 0.5);
      // 2. les multiplicateurs défilent puis se figent ; le plateau choisi se fige en dernier
      G.say(T.weighRoll); Sfx.roll(6, 0.1);
      await Promise.all([rollPlate(1 - pick, q ? 0.7 : 1.7, false), rollPlate(pick, q ? 1.1 : 2.9, true)]);
      cardA = 0;
      await G.sleep(q ? 0.3 : 0.9);
      // 3. la balance pèse : le plateau le plus lourd descend et gagne son multiplicateur, le plus léger ne gagne rien
      G.say(T.weighing); Sfx.roll(10, 0.09); FX.ring(g.px, g.py, '#6ff0dd', g.L, 0.7);
      sway = false; weighing = true;
      var dir = data.heavy === 1 ? 1 : -1, final = dir * 0.30, dur = q ? 2.6 : 6.5, lastSign = 0, hbT = 0, lastU = 0, tkT = 0;
      await G.tween(dur, function (u) {
        var env = Math.pow(1 - u, 1.5);
        var fake = -dir * 0.5 * Math.sin(Math.PI * clamp((u - 0.35) / 0.4, 0, 1));   // faux espoir : la balance penche d'abord du mauvais côté
        tens = clamp(u * 1.25, 0, 1);
        theta = final * G.ease.out3(Math.min(1, u * 1.1)) + 0.3 * env * Math.sin(u * 17 + 0.6) + fake * (1 - u * 0.4);
        var s = Math.sign(Math.sin(u * 17 + 0.6));
        // crescendo sonore : battements de coeur de plus en plus rapides et forts, tambour à chaque oscillation, ticks ; puis silence juste avant le verdict
        var hush = u > 0.9, dtu = (u - lastU) * dur; lastU = u; hbT -= dtu; tkT -= dtu;
        if (!hush) {
          if (s !== lastSign && u > 0.05) { lastSign = s; Sfx.drum(0.1 + env * 0.25 + u * 0.15); }
          if (hbT <= 0) { hbT = 0.95 - 0.6 * u; if (Sfx.heartbeat) Sfx.heartbeat(0.25 + 0.75 * u); }
          if (tkT <= 0 && u > 0.4) { tkT = 0.5 - 0.35 * u; Sfx.tick(u); }
        }
      }, null);
      weighing = false; theta = final; tens = 0; Sfx.thud(); FX.shake(22, 0.7); burst = 1; flashW = 1; FX.flash(0.5, '#fff1b8');
      var win = pick === data.heavy, hv = data.heavy, wp = platePt(hv);
      res[hv] = 'won'; res[1 - hv] = 'lost'; glowSide = hv; dimSide = 1 - hv; verdict = { t: 0, win: win };
      FX.dust(wp.x, wp.y + g.pan, 12, '#ffd86a');
      FX.ring(wp.x, wp.y, '#ffe9a0', g.pan * 2.4, 0.9); FX.spark(wp.x, wp.y, win ? 70 : 30, '#ffe9a0', 520); FX.ring(wp.x, wp.y, '#fff', g.pan * 3.4, 1.1);
      if (win) { FX.coins(wp.x, wp.y, 14, 700, 40); bump(S, data.total * B); Sfx.chime(data.total); Sfx.fanfare(1); FX.spark(G.cx, G.cy, 50, '#6ff0dd', 420); }
      else { Sfx.curse(); }
      G.say(win ? T.sayRight.replace('{m}', fb(data.total, B)) : T.sayWrong);
      await G.sleep(q ? 0.7 : 1.6); verdict = null;
      await G.sleep(q ? 0.3 : 0.9);
      G.say('');
      if (win) await settle(S, sp, bet);
      else {
        S.finalLabel = T.noWin; S.final = { mult: 0, bet: bet, count: 0, t: 0 }; markShown(S, sp, 0);
        await waitTap(S, q ? 1.2 : 2.6);
        S.final = null;
      }
    };
    return S;
  }

  /* ======================================================================
   * 3. CHAMBRE DU TRÉSOR — pick-me, 12 chambres
   * ====================================================================== */
  function vaultScene(sp, bet) {
    var T = I18N.t(), data = sp.bonus, S = newScene(T.vaultIntro), g = {}, B = bf(sp); S.bgImg = 'vault'; var tiles = [], n = 0, shield = 0, hover = -1, waiting = false, pickRes = null, queued = -1, shake = 0, vig = 0, vigCol = '255,40,20', beams = [], entry = 0, endGlow = 0;
    var cols = 4, rows = 3;
    for (var i = 0; i < cols * rows; i++) tiles.push({ state: 'closed', token: null, u: 0, dim: false, lg: i % 3, crack: 0, tens: 0, pop: 0, col: null, dark: 0 });
    S.layout = function () {
      var w = G.w, h = G.h, top = T0() + EX(140), bot = h - hudH() - (h < 520 ? 10 : 52);
      g.t = Math.min((w * 0.92) / (cols * 1.12), (bot - top) / (rows * 1.12), 170); g.gap = g.t * 0.12;
      g.x0 = G.cx - (cols * g.t + (cols - 1) * g.gap) / 2; g.y0 = top + ((bot - top) - (rows * g.t + (rows - 1) * g.gap)) / 2;
    };
    function rect(i) { var c = i % cols, r = Math.floor(i / cols); return { x: g.x0 + c * (g.t + g.gap), y: g.y0 + r * (g.t + g.gap), s: g.t }; }
    var colorOf = { num: ['#f3cf6a', '#7a5a12'], scepter: ['#6a95ff', '#1a3a8a'], ankh: ['#4ff0d8', '#0b6f64'], curse: ['#ff6a50', '#7a1209'] };
    S.update = function (dt) {
      chromeUpdate(S, dt); shake = Math.max(0, shake - dt * 2); vig = Math.max(0, vig - dt * 0.9); endGlow = Math.max(0, endGlow - dt * 0.6); entry = Math.min(1.6, entry + dt * 1.4);
      for (var bi = beams.length - 1; bi >= 0; bi--) { beams[bi].t += dt; if (beams[bi].t > beams[bi].life) beams.splice(bi, 1); }
      tiles.forEach(function (t) { t.pop = Math.max(0, t.pop - dt * 2.2); t.dark = Math.max(0, t.dark - dt * 0.5); if (t.state !== 'closed') t.tens = Math.max(0, t.tens - dt * 4); if (t.state === 'flipping') t.u = Math.min(1, t.u + dt / 0.5); if (t.u >= 1 && t.state === 'flipping') t.state = 'open'; });
    };
    S.draw = function () {
      var sx = shake > 0 ? (Math.random() - 0.5) * shake * 18 : 0;
      ctx.save(); ctx.translate(sx, 0);
      tiles.forEach(function (t, i) {
        var r = rect(i), cx = r.x + r.s / 2, cy = r.y + r.s / 2, hv = waiting && hover === i && t.state === 'closed';
        var sc = t.state === 'flipping' ? Math.abs(Math.cos(Math.PI * t.u)) : 1, face = t.state === 'open' || (t.state === 'flipping' && t.u > 0.5);
        ctx.globalAlpha = 1; var ek = clamp(entry - (i % cols + Math.floor(i / cols)) * 0.12, 0, 1); if (ek <= 0) return;
        var lift = (hv ? r.s * 0.035 : 0) + (1 - G.ease.outBack(ek)) * r.s * 0.6;
        if (ek < 1) ctx.globalAlpha = ek;
        if (t.tens > 0 && t.state === 'closed') {   // tension : halo pulsant derrière la dalle
          var tp = 0.6 + 0.4 * Math.sin(G.t * (14 + t.tens * 16)), hr = r.s * (0.75 + 0.35 * t.tens);
          var tg = ctx.createRadialGradient(cx, cy, r.s * 0.2, cx, cy, hr); tg.addColorStop(0, 'rgba(255,230,140,' + 0.55 * t.tens * tp + ')'); tg.addColorStop(1, 'rgba(255,200,60,0)');
          ctx.fillStyle = tg; ctx.fillRect(cx - hr, cy - hr, hr * 2, hr * 2);
        }
        ctx.save(); if (t.dim) ctx.globalAlpha = 0.4;   // épaisseur de la dalle + ombre portée
        A.roundRect(ctx, r.x, r.y + r.s * 0.075, r.s, r.s, r.s * 0.1); ctx.fillStyle = '#120b04'; ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 7; ctx.fill(); ctx.restore();
        var jx = t.state === 'closed' ? (Math.random() - 0.5) * (t.crack * 3.2 + t.tens * 7) : 0;
        ctx.save(); ctx.translate(cx + jx, cy - lift); var ps = 1 + t.pop * 0.16 * Math.sin(Math.min(1, t.pop) * Math.PI * 0.5 + 0.3); ctx.scale(Math.max(0.02, sc) * ps, ps * (1 + (t.state === 'flipping' ? Math.sin(Math.PI * t.u) * 0.08 : 0) + (hv ? 0.04 : 0))); ctx.translate(-cx, -cy);
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
          ctx.save(); ctx.shadowColor = col[0]; ctx.shadowBlur = 10 + t.pop * 40; ctx.fillStyle = g2; ctx.fill(); ctx.restore();
          ctx.lineWidth = 3; ctx.strokeStyle = kind === 'curse' ? '#ff9a80' : '#fff1b8'; ctx.stroke();
          ctx.save(); A.roundRect(ctx, r.x, r.y, r.s, r.s, r.s * 0.1); ctx.clip();
          A.rays(ctx, cx, cy, r.s, 12, G.t * 0.5, '#ffffff', 0.18); ctx.restore();
          if (kind === 'num') { var tkn = '+' + fb(t.token, B); G.icon(ctx, 'coin', cx, cy - r.s * 0.04, r.s * 0.92); G.txt(tkn, cx, cy + r.s * 0.12, { size: r.s * Math.min(tkn.length > 2 ? 0.3 : 0.38, 0.8 / Math.max(2, tkn.length * 0.62)), weight: 900, fill: '#fff8d8', stroke: '#3a2400', sw: r.s * 0.07, shadow: 'rgba(0,0,0,.6)', blur: 6 }); }
          else if (false) G.txt('+' + t.token, cx, cy + r.s * 0.01, { size: r.s * (String(t.token).length > 1 ? 0.4 : 0.5), weight: 900, fill: '#fff8d8', stroke: '#4a3208', shadow: 'rgba(255,255,255,.6)' });
          else if (kind === 'scepter' && G.icon(ctx, 'scepter', cx, cy - r.s * 0.02, r.s * 0.95)) { G.txt('×2', cx, cy + r.s * 0.34, { size: r.s * 0.3, weight: 900, fill: '#fff', stroke: '#0d2466', sw: r.s * 0.06 }); }
          else if (kind === 'scepter') { G.txt('×2', cx, cy - r.s * 0.05, { size: r.s * 0.46, weight: 900, fill: '#fff', stroke: '#0d2466' }); G.txt('SCEPTRE', cx, cy + r.s * 0.3, { size: r.s * 0.11, weight: 800, fill: '#d8e4ff', family: G.TEXT, spacing: 2 }); }
          else if (kind === 'ankh' && G.icon(ctx, 'amulet', cx, cy, r.s * 0.92)) { /* amulette */ }
          else if (kind === 'ankh') { A.ankh(ctx, cx, cy - r.s * 0.02, r.s * 0.55, '#fff', '#0b5a50'); }
          else if (!G.icon(ctx, 'skull', cx, cy, r.s * 0.95)) { A.skull(ctx, cx, cy, r.s * 0.66, '#fff1d8', '#5a0c06'); }
          if (kind === 'curse' && t.dark > 0) { A.roundRect(ctx, r.x, r.y, r.s, r.s, r.s * 0.1); ctx.fillStyle = 'rgba(40,0,0,' + (0.5 * t.dark * (0.6 + 0.4 * Math.sin(G.t * 30))) + ')'; ctx.fill(); }
        }
        ctx.restore();
      });
      ctx.restore(); ctx.globalAlpha = 1;
      beams.forEach(function (b) {   // colonne de lumière à la révélation
        var k = b.t / b.life, a = (1 - k) * (1 - k), bw = b.w * (0.4 + k * 0.6);
        var lg = ctx.createLinearGradient(b.x - bw, 0, b.x + bw, 0); lg.addColorStop(0, 'rgba(' + b.c + ',0)'); lg.addColorStop(0.5, 'rgba(' + b.c + ',' + 0.55 * a + ')'); lg.addColorStop(1, 'rgba(' + b.c + ',0)');
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg; ctx.fillRect(b.x - bw, 0, bw * 2, b.y); ctx.restore();
      });
      if (vig > 0.01) {   // vignette de malédiction
        var vg = ctx.createRadialGradient(G.cx, G.cy, Math.min(G.w, G.h) * 0.25, G.cx, G.cy, Math.max(G.w, G.h) * 0.75);
        vg.addColorStop(0, 'rgba(' + vigCol + ',0)'); vg.addColorStop(1, 'rgba(' + vigCol + ',' + Math.min(0.75, vig * 0.75) + ')');
        ctx.fillStyle = vg; ctx.fillRect(0, 0, G.w, G.h);
      }
      if (endGlow > 0.01) A.rays(ctx, G.cx, G.cy, Math.max(G.w, G.h), 16, G.t * 0.5, '#ffd86a', 0.16 * Math.min(1, endGlow));
      // boucliers Ankh
      for (var s = 0; s < shield; s++) A.ankh(ctx, G.cx - (shield - 1) * 20 + s * 40, g.y0 - 26, 28, '#4ff0d8');
      chrome(S);
    };
    // un seul toucher ouvre la dalle (hitbox élargie à l'espace entre dalles, aucun survol requis) ;
    // un toucher pendant l'animation précédente est mémorisé (une seule fois) pour le prochain choix
    S.onPointer = function (x, y, type) {
      var h = -1, m = g.gap / 2;
      for (var i = 0; i < tiles.length; i++) { var r = rect(i); if (x >= r.x - m && x <= r.x + r.s + m && y >= r.y - m && y <= r.y + r.s + m) { h = i; break; } }
      hover = h;
      if (type !== 'down' || h < 0 || tiles[h].state !== 'closed') return;
      if (waiting && pickRes) { var f = pickRes; pickRes = null; f(h); } else queued = h;
    };
    function waitPick() {
      return new Promise(function (res) {
        var done = false;
        function fin(i) { if (!done) { done = true; waiting = false; pickRes = null; res(i); } }
        if (queued >= 0 && tiles[queued].state === 'closed') { var q = queued; queued = -1; fin(q); return; }
        queued = -1; waiting = true; pickRes = fin;
        var auto = (G.turbo || (G.S && G.S.auto > 0)) ? 0.55 : 7;
        G.sleep(auto).then(function () {
          var closed = []; tiles.forEach(function (t, i) { if (t.state === 'closed') closed.push(i); });
          fin(closed[Math.floor(Math.random() * closed.length)]);
        });
      });
    }
    async function reveal(i, rec) {
      var t = tiles[i], r = rect(i), cx = r.x + r.s / 2, cy = r.y + r.s / 2;
      var bad = rec.token === 'curse' && !rec.saved, big = typeof rec.token === 'number' && rec.token >= 5;
      // tension avant révélation : la dalle vibre, la lumière monte, le cœur bat
      t.tens = 1; Sfx.drum(0.3);
      if (!quick()) { await G.sleep(0.3); Sfx.drum(0.45); FX.spark(cx, cy, 10, '#ffe9a0', 120, 0.5); await G.sleep(0.3); } else await G.sleep(0.12);
      t.token = rec.token; t.state = 'flipping'; t.u = 0; t.pop = 1; Sfx.reveal();
      var kc = rec.token === 'curse' ? '255,70,40' : rec.token === 'ankh' ? '79,240,216' : rec.token === 'scepter' ? '120,160,255' : '255,216,106';
      beams.push({ x: cx, y: cy + r.s * 0.5, w: r.s * (bad ? 0.3 : 0.55), c: kc, t: 0, life: bad ? 0.9 : 0.7 });
      FX.ring(cx, cy, bad ? '#ff3b20' : '#fff1b8', r.s * 1.2, 0.5);
      await G.sleep(0.28);
      if (rec.token === 'curse') {
        if (rec.saved) { shield--; Sfx.shield(); FX.float(T.vaultSaved, cx, cy - r.s * 0.7, '#6ff0dd', 26); FX.ring(cx, cy, '#6ff0dd', r.s * 1.6, 0.8); FX.flash(0.25, '#6ff0dd'); }
        else {   // malédiction : vignette rouge, double flash, tuiles assombries, fumée
          Sfx.curse(); shake = 1.4; vig = 1.4; t.dark = 1; FX.shake(26, 1.0); FX.flash(0.6, '#ff3b20');
          FX.ring(cx, cy, '#ff3b20', r.s * 3.2, 1.1); FX.dust(cx, cy, 26, '#5a0c06'); FX.spark(cx, cy, 30, '#ff5a3a', 360, 0.8);
          FX.float(T.vaultCurse, cx, cy - r.s * 0.7, '#ff7a5a', 40);
          tiles.forEach(function (o) { if (o !== t && o.state === 'closed') o.dim = true; });
          G.sleep(0.18).then(function () { FX.flash(0.4, '#ff3b20'); FX.shake(14, 0.5); });
          await G.sleep(quick() ? 0.3 : 0.9);
          tiles.forEach(function (o) { if (o.state === 'closed') o.dim = false; });
        }
      } else if (rec.token === 'ankh') { shield++; Sfx.shield(); FX.float(T.vaultShield, cx, cy - r.s * 0.7, '#6ff0dd', 24); FX.ring(cx, cy, '#6ff0dd', r.s * 1.4, 0.8); }
      else if (rec.token === 'scepter') { Sfx.lightning(); FX.flash(0.35, '#9ab8ff'); FX.float(T.vaultScepter, cx, cy - r.s * 0.7, '#9ab8ff', 28); FX.ring(cx, cy, '#9ab8ff', r.s * 2, 0.9); FX.ring(cx, cy, '#dbe6ff', r.s * 3, 1.2); FX.spark(cx, cy, 24, '#9ab8ff', 380); FX.shake(8, 0.3); }
      else { Sfx.chime(rec.token); FX.coins(cx, cy, 10 + Math.min(34, rec.token * 4), 700 + (big ? 200 : 0), 40); FX.spark(cx, cy, 18, '#ffe9a0', 300); FX.ring(cx, cy, '#ffd86a', r.s * 2.2, 0.8); if (big) { FX.rain(G.w, 18); FX.flash(0.2, '#ffe9a0'); FX.shake(6, 0.3); } FX.float('+' + fb(rec.token, B), cx, cy - r.s * 0.7, '#fff1b8', 30); }
      if (rec.token !== 'curse' || !rec.saved) bump(S, rec.total * B); else bump(S, S.totalT);
      await G.sleep(0.65);
    }
    S.run = async function () {
      G.say(T.vaultSub); await G.sleep(1.2);
      await boostIntro(S, sp);
      var leftovers = [1, 2, 3, 5, 8, 2, 1, 3, 'scepter', 1, 5, 'ankh'];
      for (n = 0; n < data.picks.length; n++) {
        G.say(T.pick);
        var i = await waitPick(); hover = -1;
        await reveal(i, data.picks[n]);
        if (data.picks[n].token === 'curse' && !data.picks[n].saved) break;
      }
      G.say('');
      if (data.ended === 'cleared') {
        S.banner = { text: T.vaultClear.replace('{p}', fb(data.bonusFinish, B)), t: 0 }; Sfx.fanfare(1); FX.flash(0.5, '#ffe9a0'); FX.rain(G.w, 70); FX.shake(10, 0.5); endGlow = 1.6; bump(S, data.total * B);
        FX.ring(G.cx, G.cy, '#ffd86a', G.R || Math.min(G.w, G.h) * 0.6, 1.2);
        for (var wv = 1; wv <= 3; wv++) { (function (k) { G.sleep(0.25 * k).then(function () { FX.coins(G.cx + (k - 2) * G.w * 0.2, G.cy, 18, 900, 90); FX.rain(G.w, 20); }); })(wv); }
        await G.sleep(quick() ? 0.8 : 1.6); S.banner = null;
      }
      // révèle le reste, estompé
      var rest = tiles.map(function (t, i) { return i; }).filter(function (i) { return tiles[i].state === 'closed'; });
      rest.forEach(function (i, k) { G.sleep(quick() ? 0 : 0.09 * k).then(function () { var t = tiles[i]; t.token = leftovers[k % leftovers.length]; t.dim = true; t.state = 'flipping'; t.u = 0.0; if (!quick()) Sfx.reveal(); }); });
      await G.sleep(0.9 + (quick() ? 0 : 0.09 * rest.length));
      await settle(S, sp, bet);
    };
    return S;
  }

  /* ======================================================================
   * 4. FUREUR D'ANUBIS — choix d'une couleur, roue géante : DOUBLE de sa couleur = roue doublée, bandes de bonus ×N
   *    (rejoue un script pré-tiré par couleur ; les bonus imbriqués sont ceux déjà tirés dans ce script)
   * ====================================================================== */
  var HCOL = [{ a: '#6ff0dd', b: '#0b6d62', ink: '#04302b' }, { a: '#ffe08a', b: '#a8741a', ink: '#3a2603' }, { a: '#ff6a7a', b: '#7a0f20', ink: '#3a0610' }];
  var HBAND = { scarab: ['#c28bff', '#3a1a66'], weigh: ['#fff1c8', '#6a5030'], vault: ['#ff9a3a', '#6a2a08'] };
  function sv(fn) { ctx.save(); try { fn(); } finally { ctx.restore(); } }   // save / restore toujours équilibrés (une fuite décale tout le reste de l'image)
  function gem(x, y, r, ci) {   // gemme de couleur (turquoise / or / rubis)
    var c = HCOL[ci];
    sv(function () {
      var gg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r); gg.addColorStop(0, '#ffffff'); gg.addColorStop(0.3, c.a); gg.addColorStop(1, c.b);
      ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * 0.85, y - r * 0.2); ctx.lineTo(x + r * 0.55, y + r * 0.85); ctx.lineTo(x - r * 0.55, y + r * 0.85); ctx.lineTo(x - r * 0.85, y - r * 0.2); ctx.closePath();
      ctx.fillStyle = gg; ctx.fill(); ctx.lineWidth = Math.max(1.5, r * 0.08); ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - r * 0.85, y - r * 0.2); ctx.lineTo(x + r * 0.85, y - r * 0.2); ctx.moveTo(x - r * 0.3, y - r * 0.2); ctx.lineTo(x - r * 0.55, y + r * 0.85); ctx.moveTo(x + r * 0.3, y - r * 0.2); ctx.lineTo(x + r * 0.55, y + r * 0.85);
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.stroke();
    });
  }
  function wrapLines(txt, maxW, font) {
    ctx.font = font; var words = String(txt).split(' '), lines = [], cur = '';
    words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (cur && ctx.measureText(t).width > maxW) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); return lines;
  }
  function handBandName(T, seg) { return T.bandName[seg.b] + ' ×' + seg.x; }

  function handScene(sp, bet) {
    var T = I18N.t(), data = sp.bonus, segs = M.HAND_SEGS, N = segs.length, st = TAU / N;
    var ci = Math.max(0, M.HAND_COLORS.indexOf(sp.profile)), cc = HCOL[ci], B = bf(sp);   // B : boost ; palier affiché = palier × B
    var S = newScene(T.handIntro), g = {}; S.bgImg = 'key'; var rot = 0, vel = 0, ptr = 0, ptrV = 0, lastIdx = -1, lastTick = 0;
    var charging = false, holding = false, power = 0, pdir = 1, handY = -9999, handAlpha = 1, crush = 0, wheelK = 0, multShown = B, multPop = 0, bolts = 0, iconAlpha = 1, iconK = 1, hl = -1, flyOrb = null;
    var beam = 0, tense = 0, rays = 0, raysCol = '#ffe9a0', aura = 0, shock = 0, vig = 0, shownMult = B, upPulse = 0, upSweep = -1, upCol = cc.a, hb = null, chipA = 0, panelA = 0;
    S.dim = 0.85; S.showTotal = false;
    S.layout = function () {
      var w = G.w, h = G.h, fs = h < 520 ? 16 : clamp(w * 0.034, 17, 34);
      g.narrow = w < 700 && h >= 520; g.land = h < 520; g.plateB = T0() + fs * 1.9; g.u = Math.min(w, h);
      var top = T0() + EX(64) + (g.narrow ? 44 : 0), bot = h - hudH() - (h < 520 ? 10 : 44);
      g.R = Math.min(w * 0.4, (bot - top) / 2.3); g.cy = top + g.R * 1.2;
      g.bot = bot;
    };
    function counterPos() {
      if (g.land) return { x: 70, y: g.cy, s: 0.8 };
      if (g.narrow) return { x: G.w - 62, y: g.plateB + 30, s: 0.62 };
      return { x: Math.min(G.w * 0.14, 110) + 14, y: T0() + EX(130), s: 1 };
    }
    function chipPos() {
      if (g.land) return { x: 8, y: g.cy + 44 };
      if (g.narrow) return { x: 12, y: g.plateB + 8 };
      var c = counterPos(); return { x: 16, y: c.y + 86 };
    }
    function iconAt(x, y, s) {
      if (sp.kind === 'hand') return;
      if (G.icon(ctx, sp.kind, x, y, s * 2.5)) return;
      if (sp.kind === 'scarab') A.scarab(ctx, x, y, s, '#ffd86a', 'rgba(60,30,0,.6)');
      else if (sp.kind === 'weigh') A.feather(ctx, x, y, s * 1.3, '#fff8e6', 'rgba(150,110,40,.8)');
      else A.pyramid(ctx, x, y, s * 1.2, '#e8c4ff', 'rgba(60,20,90,.6)');
    }
    // palette des nombres : aucune teinte proche de la turquoise, de l'or ou du rubis (réservés aux cases DOUBLE)
    function numColor(v) { return v >= 100 ? ['#f4f2ff', '#6e6e8a'] : v >= 40 ? ['#ff9a3a', '#8a3a08'] : v >= 20 ? ['#c28bff', '#5a2a86'] : v >= 10 ? ['#8a7bff', '#2e2a8a'] : v >= 6 ? ['#5b8cff', '#1a3a8a'] : ['#8d8470', '#443c2e']; }
    S.update = function (dt) {
      chromeUpdate(S, dt);
      ptrV += (-520 * ptr - 15 * ptrV) * dt; ptr = clamp(ptr + ptrV * dt, -0.6, 0.2);
      if (charging && holding) { power += pdir * dt * 1.15; if (power >= 1) { power = 1; pdir = -1; } if (power <= 0) { power = 0; pdir = 1; } }
      multPop = Math.max(0, multPop - dt * 2.4); bolts = Math.max(0, bolts - dt * 4); shock = Math.max(0, shock - dt * 1.4); rays = Math.max(0, rays - dt * 0.45); vig = Math.max(0, vig - dt * 1.2); upPulse = Math.max(0, upPulse - dt * 1.1);
      if (hb) hb.t += dt;
      if (flyOrb && Math.random() < 0.9) { var fe = G.ease.inOut(clamp(flyOrb.t, 0, 1)); FX.spark(lerp(flyOrb.x0, flyOrb.x1, fe), lerp(flyOrb.y0, flyOrb.y1, fe) - Math.sin(Math.PI * fe) * 90, 2, flyOrb.c, 120); }
      if (tense > 0.5 && S.spinning && Math.random() < dt * 14 * tense) FX.spark(G.cx, g.cy - g.R * 1.05, 1, '#fff1b8', 140);
      if (S.spinning) {
        var idx = Math.floor(mod(-rot, TAU) / st);
        if (idx !== lastIdx) { if (lastIdx >= 0) { ptrV -= 5 + Math.min(Math.abs(vel), 18) * 0.4; if (G.t - lastTick > 0.03) { Sfx.tick(Math.min(1, Math.abs(vel) / 18)); lastTick = G.t; } } lastIdx = idx; }
      }
    };
    function wedgeH(i, ri, ro) { ctx.beginPath(); ctx.arc(0, 0, ro, i * st - Math.PI / 2, (i + 1) * st - Math.PI / 2); ctx.arc(0, 0, ri, (i + 1) * st - Math.PI / 2, i * st - Math.PI / 2, true); ctx.closePath(); }
    function drawSeg(i, R) {
      var s = segs[i], ri = R * 0.2, ro = R * 0.97;
      sv(function () {
        wedgeH(i, ri, ro);
        var gg = ctx.createRadialGradient(0, 0, ri, 0, 0, ro), col;
        if (s.d != null) { col = HCOL[s.d]; gg.addColorStop(0, col.b); gg.addColorStop(1, col.a); ctx.fillStyle = gg; }
        else if (s.b) { col = HBAND[s.b]; var bg = ctx.createRadialGradient(0, 0, ri, 0, 0, ro); bg.addColorStop(0, '#0e0a16'); bg.addColorStop(1, '#241638'); ctx.fillStyle = bg; }
        else { col = numColor(s.n); gg.addColorStop(0, col[1]); gg.addColorStop(1, col[0]); ctx.fillStyle = gg; }
        ctx.fill();
        if (s.b) { ctx.lineWidth = Math.max(1.5, R * 0.012); ctx.strokeStyle = col[0]; ctx.stroke(); }
        if (s.d === ci) { wedgeH(i, ri, ro); ctx.fillStyle = 'rgba(255,255,255,' + (0.1 + 0.1 * Math.sin(G.t * 4)) + ')'; ctx.fill(); }   // les cases de VOTRE couleur respirent doucement
        if (hl === i) { wedgeH(i, ri, ro); ctx.fillStyle = 'rgba(255,255,255,' + (0.22 + 0.2 * Math.sin(G.t * 9)) + ')'; ctx.fill(); }
        wedgeH(i, ri, ro); ctx.lineWidth = Math.max(1, R * 0.006); ctx.strokeStyle = 'rgba(255,214,110,.8)'; ctx.stroke();
        ctx.rotate((i + 0.5) * st - Math.PI / 2); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        if (s.d != null) {
          ctx.font = '900 ' + R * 0.072 + 'px ' + G.TITLE; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = Math.max(0, R * 0.008) + 'px';
          ctx.fillStyle = col.ink; ctx.fillText(T.handDouble, R * 0.9, 0);
        } else if (s.b) {
          ctx.font = '700 ' + R * 0.125 + 'px ' + G.NUM; ctx.fillStyle = col[0]; ctx.shadowColor = col[0]; ctx.shadowBlur = 8; ctx.fillText('×' + s.x, R * 0.9, 0); ctx.shadowBlur = 0;
          if (!G.icon(ctx, s.b, R * 0.5, 0, R * 0.2)) { ctx.fillStyle = col[0]; ctx.fillRect(R * 0.45, -R * 0.03, R * 0.1, R * 0.06); }
        } else {
          var label = String(Math.round(s.n * shownMult)), big = label.length > 4 ? 0.066 : label.length > 3 ? 0.082 : label.length > 2 ? 0.098 : 0.118;
          ctx.font = '700 ' + R * big * 1.15 + 'px ' + G.NUM; ctx.fillStyle = s.n >= 100 ? '#1a1630' : '#fff'; ctx.shadowColor = s.n >= 100 ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.6)'; ctx.shadowBlur = 4; ctx.fillText(label, R * 0.9, 0); ctx.shadowBlur = 0;
        }
      });
    }
    function drawPointer(R) {
      sv(function () {
        ctx.translate(G.cx, g.cy - R * 1.08); ctx.rotate(ptr); var ps = R * 0.12;
        if (G.icon(ctx, 'pointer', 0, ps * 0.2, ps * 3)) return;
        ctx.beginPath(); ctx.moveTo(-ps * 0.6, -ps * 0.5); ctx.quadraticCurveTo(0, -ps * 0.9, ps * 0.6, -ps * 0.5); ctx.lineTo(0, ps * 1.5); ctx.closePath();
        ctx.fillStyle = A.goldGrad(ctx, -ps, -ps, ps, ps * 1.5); ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 1.5; ctx.strokeStyle = '#4b350b'; ctx.stroke();
      });
    }
    function drawCounter(p) {
      var ms = (1 + multPop * 0.35) * p.s;
      sv(function () {
        ctx.translate(p.x, p.y); ctx.scale(ms, ms);
        if (aura > 0) {
          var ar = 40 + aura * 14 + multPop * 40, ag = ctx.createRadialGradient(0, 0, 0, 0, 0, ar * 1.6);
          ag.addColorStop(0, 'rgba(255,230,150,' + Math.min(0.7, 0.18 + aura * 0.07) + ')'); ag.addColorStop(1, 'rgba(255,160,60,0)');
          ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = ag; ctx.fillRect(-ar * 1.6, -ar * 1.6, ar * 3.2, ar * 3.2);
        }
      });
      sv(function () {
        ctx.translate(p.x, p.y); ctx.scale(ms, ms);
        G.txt(T.handTier, 0, -34, { size: 10, family: G.TEXT, weight: 800, fill: '#b9a780', spacing: 3 });
        G.goldText('×' + G.fmt(Math.round(multShown)), 0, 8, Math.min(64, G.w * 0.08, 56), { blur: 28 });
      });
    }
    function drawChip(p) {
      var name = T.handColorName[M.HAND_COLORS[ci]], w = g.narrow ? 150 : 176, h = 42;
      sv(function () {
        ctx.globalAlpha = chipA;
        A.roundRect(ctx, p.x, p.y, w, h, 12);
        var bgc = ctx.createLinearGradient(0, p.y, 0, p.y + h); bgc.addColorStop(0, 'rgba(36,26,12,.92)'); bgc.addColorStop(1, 'rgba(10,7,4,.92)');
        ctx.fillStyle = bgc; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = cc.a; ctx.stroke();
        gem(p.x + 22, p.y + h / 2, 13, ci);
        G.txt(T.handYour, p.x + 44, p.y + 13, { size: 9, family: G.TEXT, weight: 800, fill: '#b9a780', spacing: 2, align: 'left' });
        G.txt(name, p.x + 44, p.y + 29, { size: 16, weight: 900, fill: cc.a, stroke: '#1a1004', sw: 3, align: 'left', spacing: 2 });
      });
    }
    function drawRule(p, cp) {   // règle toujours visible : sous la pastille de couleur (grand écran) ou sous la roue (portrait)
      var fs = 12, lines;
      if (g.land) return;
      sv(function () {
        ctx.globalAlpha = panelA;
        if (g.narrow) {
          var y0 = g.cy + g.R * 1.08 + 20; if (y0 + 30 > g.bot + 24) return;
          lines = wrapLines(T.handRule, G.w - 36, '700 ' + fs + 'px ' + G.TEXT);
          lines.forEach(function (ln, k) { G.txt(ln, G.cx, y0 + k * (fs + 4), { size: fs, family: G.TEXT, weight: 700, fill: '#e8d8a8', stroke: 'rgba(0,0,0,.8)', sw: 3 }); });
        } else {
          var mw = Math.max(160, Math.min(250, G.cx - g.R * 1.15 - 24));
          lines = wrapLines(T.handRule, mw, '700 ' + fs + 'px ' + G.TEXT);
          lines.forEach(function (ln, k) { G.txt(ln, p.x, p.y + 56 + k * (fs + 5), { size: fs, family: G.TEXT, weight: 700, fill: '#e8d8a8', stroke: 'rgba(0,0,0,.8)', sw: 3, align: 'left' }); });
        }
      });
    }
    function drawBanner() {
      if (!hb) return;
      var b = hb, k = G.ease.outBack(clamp(b.t / 0.4, 0, 1)), a = clamp(b.out != null ? 1 - (b.t - b.out) / 0.3 : 1, 0, 1);
      if (a <= 0) return;
      var fs = clamp(G.w * 0.05, 20, 46), sfs = clamp(G.w * 0.017, 11, 17);
      sv(function () {
        ctx.globalAlpha = a; ctx.translate(G.cx, g.cy); ctx.scale(k, k);
        ctx.font = '900 ' + fs + 'px ' + G.TITLE; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '3px';
        var tw0 = ctx.measureText(b.text).width + fs * 1.6; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px';
        if (b.sub) { ctx.font = '700 ' + sfs + 'px ' + G.TEXT; tw0 = Math.max(tw0, ctx.measureText(b.sub).width + sfs * 2); }
        var tw = Math.min(G.w * 0.94, tw0);
        var th = fs * 1.5 + (b.sub ? sfs * 2.2 : 0), y0 = -th / 2;
        A.roundRect(ctx, -tw / 2, y0, tw, th, 14);
        ctx.fillStyle = 'rgba(8,5,3,.82)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = b.col || '#ffd86a'; ctx.stroke();
        G.goldText(b.text, 0, y0 + fs * 0.85, fs, { blur: 22, spacing: 3 });
        if (b.sub) G.txt(b.sub, 0, y0 + fs * 1.5 + sfs * 0.7, { size: sfs, family: G.TEXT, weight: 700, fill: '#fff1b8' });
      });
    }
    S.draw = function () {
      var u = g.u, cx = G.cx, cy = g.cy, Rb = g.R * G.ease.outBack(clamp(wheelK, 0, 1)), R = Rb * (1 + 0.08 * Math.sin(Math.PI * clamp(upPulse, 0, 1)));
      if (beam > 0.01) {   // colonne de lumière divine descendant du ciel
        sv(function () {
          ctx.globalCompositeOperation = 'lighter';
          // fin faisceau vertical, plus large en haut qu'en bas, bords doux (dégradé horizontal) et pied qui s'estompe sur la main
          var bw = u * (0.035 + 0.05 * Math.min(1, beam)), y1 = cy - u * 0.05, al = Math.min(1, beam);
          var hg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
          hg.addColorStop(0, 'rgba(255,225,140,0)'); hg.addColorStop(0.5, 'rgba(255,240,190,' + 0.55 * al + ')'); hg.addColorStop(1, 'rgba(255,225,140,0)');
          ctx.fillStyle = hg; ctx.beginPath(); ctx.moveTo(cx - bw * 1.6, 0); ctx.lineTo(cx + bw * 1.6, 0); ctx.lineTo(cx + bw * 0.7, y1); ctx.lineTo(cx - bw * 0.7, y1); ctx.closePath(); ctx.fill();
          var fg = ctx.createRadialGradient(cx, y1, 0, cx, y1, u * 0.22); fg.addColorStop(0, 'rgba(255,240,200,' + 0.45 * al + ')'); fg.addColorStop(1, 'rgba(255,225,140,0)');
          ctx.fillStyle = fg; ctx.fillRect(cx - u * 0.22, y1 - u * 0.22, u * 0.44, u * 0.44);
        });
      }
      if (shock > 0.01) {   // onde de choc au sol
        sv(function () {
          ctx.translate(cx, cy); ctx.scale(1, 0.45);
          var sr = u * (0.15 + 0.75 * (1 - shock)); ctx.globalAlpha = shock * 0.8; ctx.lineWidth = 6 + 14 * shock; ctx.strokeStyle = '#ffe9a0'; ctx.shadowColor = '#ffd86a'; ctx.shadowBlur = 24;
          ctx.beginPath(); ctx.arc(0, 0, sr, 0, TAU); ctx.stroke();
        });
      }
      if (R > 4) {
        sv(function () {   // roue
          ctx.translate(cx, cy);
          var gl = ctx.createRadialGradient(0, 0, R * 0.7, 0, 0, R * 1.6); gl.addColorStop(0, 'rgba(255,200,90,.35)'); gl.addColorStop(1, 'rgba(255,200,90,0)'); ctx.fillStyle = gl; ctx.fillRect(-R * 1.7, -R * 1.7, R * 3.4, R * 3.4);
          ctx.beginPath(); ctx.arc(-G.par.x * R * 0.014, R * 0.05, R * 1.07, 0, TAU); var hw = ctx.createLinearGradient(0, -R, 0, R * 1.1); hw.addColorStop(0, '#7a5612'); hw.addColorStop(0.6, '#3c2a08'); hw.addColorStop(1, '#0e0903'); ctx.fillStyle = hw; ctx.fill();
          ctx.beginPath(); ctx.arc(0, 0, R * 1.07, 0, TAU); ctx.fillStyle = '#120c05'; ctx.fill(); ctx.lineWidth = R * 0.022; ctx.strokeStyle = A.goldGrad(ctx, -R, -R, R, R); ctx.stroke();
          sv(function () { ctx.rotate(rot); for (var i = 0; i < N; i++) drawSeg(i, R); });
          // éclat de lumière sur la roue
          var hla = Math.atan2(-0.8 - G.par.y * 0.5, -0.55 - G.par.x * 0.6), hlx = Math.cos(hla) * R * 0.85, hly = Math.sin(hla) * R * 0.85;
          sv(function () {
            ctx.beginPath(); ctx.arc(0, 0, R * 0.97, 0, TAU); ctx.clip();
            var hgl = ctx.createRadialGradient(hlx, hly, 0, hlx, hly, R * 1.35); hgl.addColorStop(0, 'rgba(255,246,214,.24)'); hgl.addColorStop(0.45, 'rgba(255,246,214,.04)'); hgl.addColorStop(1, 'rgba(0,0,0,.3)');
            ctx.fillStyle = hgl; ctx.fillRect(-R, -R, R * 2, R * 2);
          });
          if (upSweep >= 0) {   // amélioration de la roue : arc de lumière de la couleur du joueur qui fait le tour du cerclage
            sv(function () {
              ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.strokeStyle = upCol; ctx.shadowColor = upCol; ctx.shadowBlur = 18;
              for (var q = 0; q < 3; q++) { var a0 = upSweep * TAU * 2 + q * TAU / 3; ctx.globalAlpha = 0.85 * (1 - upSweep); ctx.lineWidth = R * 0.05; ctx.beginPath(); ctx.arc(0, 0, R * 1.02, a0, a0 + 0.9); ctx.stroke(); }
            });
          }
          // moyeu
          ctx.beginPath(); ctx.arc(0, 0, R * 0.22, 0, TAU); var hg = ctx.createRadialGradient(-R * 0.06, -R * 0.08, 0, 0, 0, R * 0.22); hg.addColorStop(0, '#2a2118'); hg.addColorStop(1, '#070504'); ctx.fillStyle = hg; ctx.fill();
          ctx.lineWidth = R * 0.02; ctx.strokeStyle = A.goldGrad(ctx, -R * 0.2, -R * 0.2, R * 0.2, R * 0.2); ctx.stroke();
          sv(function () {
            ctx.beginPath(); ctx.arc(0, 0, R * 0.2, 0, TAU); ctx.clip();
            if (G.art.medal) ctx.drawImage(G.art.medal, -R * 0.2, -R * 0.2, R * 0.4, R * 0.4); else A.jackal(ctx, 0, -R * 0.05, R * 0.09, { glow: 0.8 + 0.2 * Math.sin(G.t * 3) });
          });
          // gemme de la couleur du joueur au centre du moyeu
          gem(0, 0, R * 0.085, ci);
        });
        drawPointer(R);
      }
      if (tense > 0.02 && R > 4) {   // suspense : le pointeur brille et bat au rythme d'un coeur
        sv(function () {
          var pul = 0.5 + 0.5 * Math.sin(G.t * (10 + 14 * tense)), pr = R * (0.16 + 0.06 * pul), py = cy - R * 1.05;
          ctx.globalCompositeOperation = 'lighter'; var pgl = ctx.createRadialGradient(cx, py, 0, cx, py, pr * 2.2);
          pgl.addColorStop(0, 'rgba(255,245,200,' + (0.55 * tense) + ')'); pgl.addColorStop(1, 'rgba(255,200,80,0)'); ctx.fillStyle = pgl; ctx.fillRect(cx - pr * 2.2, py - pr * 2.2, pr * 4.4, pr * 4.4);
          ctx.lineWidth = R * 0.03; ctx.strokeStyle = 'rgba(255,230,150,' + (0.25 + 0.45 * pul) * tense + ')'; ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, TAU); ctx.stroke();
        });
      }
      if (S.spinning && R > 4 && Math.abs(vel) > 8) {   // traînées de vitesse
        sv(function () {
          ctx.translate(cx, cy); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = R * 0.05; ctx.lineCap = 'round';
          for (var q = 0; q < 6; q++) { var qa = rot * 0.6 + q * TAU / 6; ctx.strokeStyle = 'rgba(255,230,160,' + clamp((Math.abs(vel) - 8) / 40, 0, 0.35) + ')'; ctx.beginPath(); ctx.arc(0, 0, R * (0.45 + 0.4 * (q % 2)), qa, qa + 0.5); ctx.stroke(); }
        });
      }
      if (rays > 0.01) {   // rayons de victoire
        sv(function () {
          ctx.translate(cx, cy); ctx.globalCompositeOperation = 'lighter'; ctx.rotate(G.t * 0.35);
          var RL = Math.max(G.w, G.h) * 0.9, na = 14;
          for (var k2 = 0; k2 < na; k2++) { ctx.rotate(TAU / na); ctx.fillStyle = raysCol; ctx.globalAlpha = Math.min(1, rays) * 0.22; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(RL, -RL * 0.07); ctx.lineTo(RL, RL * 0.07); ctx.closePath(); ctx.fill(); }
        });
      }
      if (vig > 0.01) { sv(function () { var vg = ctx.createRadialGradient(cx, cy, Math.min(G.w, G.h) * 0.3, cx, cy, Math.max(G.w, G.h) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,' + 0.6 * Math.min(1, vig) + ')'); ctx.fillStyle = vg; ctx.fillRect(0, 0, G.w, G.h); }); }
      // palier cumulé, couleur choisie, règle
      if (wheelK > 0.3) { var cp = counterPos(), chp = chipPos(); drawCounter(cp); drawChip(chp); drawRule(chp, cp); }
      // orbe volant
      if (flyOrb) {
        sv(function () {
          var o = flyOrb, e = G.ease.inOut(clamp(o.t, 0, 1)), ox = lerp(o.x0, o.x1, e), oy = lerp(o.y0, o.y1, e) - Math.sin(Math.PI * e) * 90;
          var og = ctx.createRadialGradient(ox, oy, 0, ox, oy, 46); og.addColorStop(0, 'rgba(255,255,255,.95)'); og.addColorStop(0.3, o.c); og.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = og; ctx.beginPath(); ctx.arc(ox, oy, 46, 0, TAU); ctx.fill();
          G.txt('×' + o.v, ox, oy, { size: 28, weight: 900, fill: '#fff', stroke: '#000' });
        });
      }
      // l'icône du bonus + la Main
      if (iconAlpha > 0.01 && handY > -9000) {
        sv(function () {
          ctx.globalAlpha = iconAlpha; ctx.translate(cx, cy); ctx.scale(iconK, iconK * (1 - crush * 0.7));
          var ig = ctx.createRadialGradient(0, 0, 0, 0, 0, u * 0.2); ig.addColorStop(0, 'rgba(255,216,106,.5)'); ig.addColorStop(1, 'rgba(255,216,106,0)'); ctx.fillStyle = ig; ctx.fillRect(-u * 0.2, -u * 0.2, u * 0.4, u * 0.4);
          iconAt(0, 0, u * 0.2);
        });
      }
      if (handAlpha > 0.01 && handY > -9000) {
        sv(function () {
          ctx.globalAlpha = handAlpha;
          if (G.art.hand) { var hs = u * 0.75; ctx.globalCompositeOperation = 'screen'; ctx.translate(cx, handY - hs * 0.12 + u * 0.1); ctx.rotate(Math.PI); ctx.drawImage(G.art.hand, -hs / 2, -hs / 2, hs, hs); }
          else A.hand(ctx, cx, handY, u * 0.25, {});
        });
      }
      if (charging) {   // jauge circulaire autour de la roue
        sv(function () {
          var rr2 = g.R * 1.07, lw = Math.max(6, g.R * 0.035);
          ctx.lineCap = 'round'; ctx.lineWidth = lw;
          ctx.strokeStyle = 'rgba(10,7,4,.8)'; ctx.beginPath(); ctx.arc(G.cx, g.cy, rr2, 0, TAU); ctx.stroke();
          ctx.strokeStyle = 'rgba(230,185,74,' + (holding ? 0.9 : 0.4 + 0.2 * Math.sin(G.t * 5)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(G.cx, g.cy, rr2 + lw * 0.6, 0, TAU); ctx.stroke();
          if (power > 0.01) {
            var pg2 = ctx.createLinearGradient(G.cx - rr2, 0, G.cx + rr2, 0); pg2.addColorStop(0, '#5cf0dc'); pg2.addColorStop(0.5, '#ffd86a'); pg2.addColorStop(1, '#ff7a3a');
            ctx.strokeStyle = pg2; ctx.lineWidth = lw * 0.7; ctx.shadowColor = '#ffd86a'; ctx.shadowBlur = 12 * power;
            ctx.beginPath(); ctx.arc(G.cx, g.cy, rr2, -Math.PI / 2, -Math.PI / 2 + TAU * power); ctx.stroke();
          }
        });
      }
      if (bolts > 0) { sv(function () { ctx.globalAlpha = bolts; for (var b = 0; b < 7; b++) { var a = b / 7 * TAU + G.t; drawBolt(cx, g.cy, cx + Math.cos(a) * u * 0.6, g.cy + Math.sin(a) * u * 0.6, '#9ab8ff', 3); } }); }
      drawBanner();
      chrome(S);
    };
    // charge : maintenir puis relâcher ; la puissance ne change que la durée et le nombre de tours, pas la case (déjà tirée)
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
    var lastBeat = -1;
    function spinTo(idx, pw) {
      pw = pw == null ? 0.5 : pw;
      var off = 0.2 + Math.random() * 0.6, target = -(idx + off) * st, rot0 = rot, delta = mod(target - rot0, TAU) + (G.turbo ? 3 : Math.round(2 + pw * 3)) * TAU, prev = rot, pT = G.t;
      S.spinning = true; hl = -1; Sfx.whoosh(); Sfx.furyCharge && Sfx.furyCharge();
      return G.tween(G.turbo ? 2.4 : 8.5 + pw * 4, function (u) { var e = 1 - Math.pow(1 - u, 4.4), nr = rot0 + delta * e; vel = (nr - prev) / Math.max(1 / 240, G.t - pT); prev = nr; pT = G.t; rot = nr; var tn = clamp((u - 0.55) / 0.45, 0, 1), bt = Math.floor(tn * 6); if (tn > 0.3 && bt !== lastBeat) { lastBeat = bt; Sfx.drum(0.15 + 0.3 * tn); } tense = tn; vig = Math.max(vig, tn * 0.8); }, null).then(function () {
        tense = 0; lastBeat = -1; S.spinning = false; vel = 0; rot = mod(rot, TAU); ptrV -= 4; Sfx.drum(0.3); Sfx.furyHit && Sfx.furyHit(); hl = idx;
      });
    }
    function banner(text, sub, col) { hb = { text: text, sub: sub, col: col, t: 0 }; }
    async function endBanner(sec) { await G.sleep(sec); if (hb) { hb.out = hb.t; await G.sleep(0.3); hb = null; } }
    // bonus imbriqué : la scène existante rejoue le script déjà tiré (profil Équilibré) ; le gain de la bande est recalculé ensuite
    async function playNested(sx, bet2) {
      var fct = sx.x * sx.mult * B, nsp = { kind: sx.band, boost: fct, bonus: sx.bonus, profile: 'std', upgraded: false, base: sx.bonus.total, pay: sx.bonus.total * fct, nested: true };   // facteur du bonus imbriqué : N × palier × B
      var prevCb = G.onBonusChoice, scene = FACT[sx.band](nsp, bet2);
      G.onBonusChoice = function () { M.handRecalc(data); sp.base = data.total; sp.pay = sp.base * (sp.boost || 1); if (prevCb) prevCb(); };   // la Pesée peut changer le gain : le gain en attente suit
      try {
        await G.setFade(1, 0.35);
        G.setScene(scene); await G.setFade(0, 0.5);
        await scene.run();
        await G.setFade(1, 0.35);
      } finally { G.onBonusChoice = prevCb; }
      G.setScene(S); S.spinning = false; G.say(g.land ? T.handRule : T.handSpin);
      await G.setFade(0, 0.5);
      M.handRecalc(data); sp.base = data.total; sp.pay = sp.base * (sp.boost || 1);
      if (G.onBonusChoice) G.onBonusChoice();
    }
    S.run = async function () {
      G.say(T.handSub);
      // intro : la Main s'abat sur le bonus
      var u = g.u, s = u * 0.25, tipOff = s * 0.98;
      handY = -s * 1.8; Sfx.roll(8, 0.1);
      G.tween(0.9, function (k) { beam = k; }, null); FX.flash(0.25, '#9ab8ff'); FX.shake(6, 0.6);
      await G.sleep(0.5);
      Sfx.whoosh();
      await G.tween(0.55, function (k) { handY = lerp(-s * 1.8, g.cy - tipOff - u * 0.04, k * k); beam = 1 + k * 0.6; vig = Math.max(vig, k * 0.7); if (Math.random() < 0.8) FX.spark(G.cx + (Math.random() - 0.5) * u * 0.25, handY + s * 0.8, 2, '#ffe9a0', 260); }, null);
      Sfx.furySlam && Sfx.furySlam(); Sfx.lightning(); Sfx.thud(); FX.shake(34, 1.1); FX.flash(1, '#ffffff'); bolts = 1; crush = 1; shock = 1; FX.ring(G.cx, g.cy, '#ffe9a0', u * 0.5, 1); FX.ring(G.cx, g.cy, '#9ab8ff', u * 0.8, 1.2); FX.spark(G.cx, g.cy, 90, '#ffd86a', 560); FX.dust(G.cx, g.cy + u * 0.1, 30, '#c9a46a');
      await G.sleep(0.2); Sfx.thud(); FX.shake(14, 0.5); FX.ring(G.cx, g.cy, '#ffffff', u * 0.35, 0.7);
      await G.sleep(0.4);
      G.tween(0.8, function (k) { beam = 1.6 * (1 - k); }, null);
      await G.tween(0.5, function (k) { iconAlpha = 1 - k; iconK = 1 + k * 0.6; handY = lerp(g.cy - tipOff - u * 0.04, -s * 1.9, G.ease.inOut(k)); }, null);
      handAlpha = 0; FX.spark(G.cx, g.cy, 70, '#ffe9a0', 440); FX.ring(G.cx, g.cy, '#ffd86a', u * 0.6, 0.9); FX.flash(0.5, '#ffe9a0'); rays = 1; raysCol = '#ffe9a0';
      Sfx.bonus();
      await G.tween(0.7, function (k) { wheelK = k; }, null);
      // la couleur choisie et la règle apparaissent
      FX.ring(G.cx, g.cy, cc.a, g.R * 1.2, 0.9); FX.spark(G.cx, g.cy, 30, cc.a, 360);
      G.tween(0.6, function (k) { chipA = k; panelA = k; }, null);
      G.say(g.land ? T.handRule : T.handSpin);
      await G.sleep(0.5);
      if (B > 1) { banner(T.boostIntro + ' ×' + G.fmt(B), T.boostIntroSub, '#ffd86a'); Sfx.oracle(); FX.flash(0.3, '#ffe9a0'); await endBanner(quick() ? 1.0 : 1.7); }
      var mult = 1;
      for (var i = 0; i < data.spins.length; i++) {
        var sx = data.spins[i], seg = segs[sx.idx];
        var pw = null; if (!quick()) { G.say(T.holdHint); pw = await waitCharge(); G.say(g.land ? T.handRule : T.handSpin); }
        await spinTo(sx.idx, pw);
        await G.sleep(0.3);
        var tp = { x: G.cx, y: g.cy - g.R * 0.7 };
        if (sx.kind === 'up') {
          // DOUBLE de VOTRE couleur : l'orbe file vers le palier, la roue est améliorée (tous les nombres doublent), on relance
          var cp = counterPos(), m0 = mult, lvl = clamp(sx.mult / 4, 1, 3);
          flyOrb = { x0: tp.x, y0: tp.y, x1: cp.x, y1: cp.y, t: 0, c: cc.a, v: 2 };
          Sfx.furyDouble && Sfx.furyDouble(Math.round(lvl)); Sfx.lightning(); FX.flash(0.4, cc.a); FX.shake(12 + 4 * lvl, 0.5); FX.ring(tp.x, tp.y, cc.a, g.R * 0.55, 0.7); FX.ring(tp.x, tp.y, '#ffffff', g.R * 0.35, 0.6); FX.spark(tp.x, tp.y, 30 + 10 * lvl, cc.a, 320); bolts = 0.8; rays = 0.9; raysCol = cc.a;
          banner(T.handUp, T.handUpSub, cc.a);
          await G.tween(0.7, function (k) { flyOrb.t = k; }, null);
          var ox2 = flyOrb.x1, oy2 = flyOrb.y1;
          flyOrb = null; mult = sx.mult; multShown = mult * B; multPop = 1; aura = Math.min(10, mult); Sfx.chime(mult * 4); Sfx.thud();
          FX.ring(ox2, oy2, cc.a, 90 + 30 * lvl, 0.8); FX.ring(ox2, oy2, '#ffffff', 60 + 20 * lvl, 0.6); FX.spark(ox2, oy2, 30 + 14 * lvl, cc.a, 360); FX.flash(0.25 + 0.12 * lvl, cc.a); FX.shake(8 + 6 * lvl, 0.4); FX.float('×' + G.fmt(mult * B), ox2, oy2 + 40, cc.a, 30 + 6 * lvl);
          // la roue s'améliore : elle gonfle, un arc de lumière en fait le tour, les nombres défilent jusqu'à leur valeur doublée
          upCol = cc.a; upPulse = 1; Sfx.shield(); FX.shake(10, 0.6); FX.ring(G.cx, g.cy, cc.a, g.R * 1.5, 1.1); FX.spark(G.cx, g.cy, 60, cc.a, 520); FX.rain(G.w, 30);
          await G.tween(1.2, function (k) { shownMult = lerp(m0 * B, mult * B, G.ease.out3(k)); upSweep = k < 1 ? k : -1; }, null);
          shownMult = mult * B; upSweep = -1; Sfx.chime(mult * 6);
          await endBanner(0.9);
          await G.sleep(0.2);
        } else if (sx.kind === 'wrong') {
          // DOUBLE d'une AUTRE couleur : la chaîne s'arrête, on encaisse le palier (plus petit nombre × palier)
          var wc = HCOL[segs[sx.idx].d];
          Sfx.furyFail && Sfx.furyFail(); Sfx.curse(); FX.flash(0.35, wc.a); FX.shake(14, 0.5); FX.ring(tp.x, tp.y, wc.a, g.R * 0.5, 0.7); FX.dust(tp.x, tp.y, 16, '#8a7a5a'); vig = Math.max(vig, 0.9);
          banner(T.handWrong, T.handWrongSub, wc.a);
          await G.sleep(1.2);
          banner('×' + fb(sx.pay, B), T.handWrongSub, '#ffd86a');
          Sfx.fanfare(1); FX.coins(G.cx, g.cy, 28, 800, 90); FX.flash(0.25, '#ffe9a0'); FX.spark(G.cx, g.cy, 30, '#ffe9a0', 360);
          bump(S, data.total * B);
          await endBanner(1.4);
        } else if (sx.kind === 'band') {
          // bande de bonus : le bonus imbriqué se joue, son gain est multiplié par ×N de la bande puis par le palier
          var bc = HBAND[sx.band][0];
          Sfx.bonus(); FX.flash(0.5, bc); FX.shake(16, 0.6); FX.ring(tp.x, tp.y, bc, g.R * 0.6, 0.8); FX.ring(G.cx, g.cy, '#ffffff', g.R, 0.9); FX.spark(tp.x, tp.y, 50, bc, 420); rays = 1; raysCol = bc;
          banner(T.bandName[sx.band] + ' ×' + sx.x, T.handBandAt + (sx.mult * B > 1 ? ' · ' + T.handTier + ' ×' + G.fmt(sx.mult * B) : ''), bc);
          await endBanner(quick() ? 0.8 : 1.6);
          await playNested(sx, bet);
          banner('×' + fb(sx.bonus.total * sx.x * sx.mult, B), T.bandName[sx.band] + ' ×' + sx.x, bc);   // gain de la bande : déjà multiplié (N × palier × B)
          Sfx.fanfare(1); FX.coins(G.cx, g.cy, 40, 900, 110); FX.flash(0.35, '#ffe9a0'); FX.shake(10, 0.5); FX.ring(G.cx, g.cy, '#ffd86a', g.R * 1.1, 1);
          bump(S, data.total * B);
          await endBanner(1.6);
        } else {
          banner('×' + fb(sx.pay, B), T.handNum, '#ffd86a');
          var big = clamp(mult / 4, 0.5, 2.5);
          Sfx.fanfare(1); FX.coins(G.cx, g.cy, Math.round(36 + 24 * big), 900, 100 + 40 * big); FX.flash(0.4, '#ffe9a0'); FX.shake(10 + 8 * big, 0.5); rays = 1; raysCol = '#ffd86a';
          FX.ring(G.cx, g.cy, '#ffd86a', g.R * 1.1, 1); FX.ring(G.cx, g.cy, '#ffffff', g.R * 0.7, 0.8); FX.spark(G.cx, g.cy, 60, '#ffe9a0', 500); if (mult > 1) FX.rain(G.w, Math.round(20 * big));
          bump(S, data.total * B);
          await endBanner(1.5);
        }
      }
      G.say('');
      // apothéose finale : explosion de lumière avant le décompte
      rays = 1.4; raysCol = '#ffe9a0'; Sfx.lightning(); FX.flash(0.7, '#fff1b8'); FX.shake(22, 0.9); shock = 1; bolts = 1;
      FX.ring(G.cx, g.cy, '#ffd86a', g.u * 0.9, 1.3); FX.ring(G.cx, g.cy, '#ffffff', g.u * 0.5, 0.9); FX.spark(G.cx, g.cy, 110, '#ffd86a', 640); FX.rain(G.w, 70); FX.coins(G.cx, g.cy, 60, 1000, 160);
      await G.sleep(0.8);
      await settle(S, sp, bet);
    };
    return S;
  }

  /* ---------------- choix de la couleur (avant la Fureur d'Anubis) ---------------- */
  // Trois scripts de même loi sont déjà dans le tour (un par couleur) ; la carte choisie révèle l'un d'eux.
  function handColorScene(sp) {
    var T = I18N.t(), S = newScene(T.handColorTitle), cards = [], hover = -1, g = {}, sel = -1, tt = 0, segs = M.HAND_SEGS;
    S.showTotal = false; S.dim = 0.8; S.bgImg = 'hand';
    var names = M.HAND_COLORS;
    S.layout = function () {
      var w = G.w, h = G.h, top = T0() + EX(80), bot = h - hudH() - (h < 520 ? 8 : 56), narrow = w < 640 && h > 520, foot = h < 520 ? 0 : (narrow ? 64 : 46);
      cards = [];
      for (var i = 0; i < 3; i++) {
        if (narrow) { var ch = (bot - foot - top - 16) / 3; cards.push({ x: w * 0.06, y: top + i * (ch + 8), w: w * 0.88, h: ch, row: true }); }
        else { var cw = Math.min((w * 0.94 - 24) / 3, 300), tw = cw * 3 + 24; cards.push({ x: G.cx - tw / 2 + i * (cw + 12), y: top, w: cw, h: Math.min(bot - foot - top, 380), row: false }); }
      }
    };
    function ring(cx, cy, r, ownI) {   // mini-roue : où sont les 2 cases DOUBLE de cette couleur
      sv(function () {
        for (var k = 0; k < segs.length; k++) {
          var a = k / segs.length * TAU - Math.PI / 2, s = segs[k], x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, dr = r * 0.12;
          if (s.d != null) { var own = s.d === ownI; ctx.beginPath(); ctx.arc(x, y, dr * (own ? 1.5 : 1), 0, TAU); ctx.fillStyle = HCOL[s.d].a; ctx.globalAlpha = own ? 1 : 0.4; ctx.fill(); if (own) { ctx.lineWidth = 1.5; ctx.strokeStyle = '#fff'; ctx.stroke(); } ctx.globalAlpha = 1; }
          else { ctx.beginPath(); ctx.arc(x, y, dr * 0.8, 0, TAU); ctx.fillStyle = s.b ? '#c28bff' : 'rgba(205,185,138,.55)'; ctx.fill(); }
        }
      });
    }
    function drawCard(c, i) {
      var hv = hover === i || sel === i, lift = hv ? 6 : 0, y = c.y - lift, col = HCOL[i], name = T.handColorName[names[i]];
      sv(function () {
        A.roundRect(ctx, c.x, y, c.w, c.h, UI.r);
        var gg = ctx.createLinearGradient(0, y, 0, y + c.h); gg.addColorStop(0, hv ? UI.pnlHi[0] : UI.pnl[0]); gg.addColorStop(1, hv ? UI.pnlHi[1] : UI.pnl[1]);
        ctx.fillStyle = gg; ctx.shadowColor = hv ? col.a : 'rgba(0,0,0,.7)'; ctx.shadowBlur = hv ? 30 : 14; ctx.fill(); ctx.shadowBlur = 0;
        ctx.lineWidth = 2; ctx.strokeStyle = hv ? col.a : UI.edge; ctx.stroke();
        var fs = c.row ? clamp(c.h * 0.2, 14, 22) : clamp(c.w * 0.085, 15, 24), pulse = 1 + 0.05 * Math.sin(tt * 3 + i);
        if (c.row) {
          var gx = c.x + c.h * 0.55, gy = y + c.h / 2; gem(gx, gy, c.h * 0.3 * pulse, i);
          var tx = c.x + c.h * 1.1;
          G.txt(name, tx, y + c.h * 0.36, { size: fs, weight: 900, fill: col.a, stroke: '#2a1802', sw: 3, align: 'left', spacing: 2 });
          G.txt(T.handColorSub, tx, y + c.h * 0.36 + fs * 1.4, { size: Math.max(10, fs * 0.56), family: G.TEXT, weight: 700, fill: '#cdb98a', align: 'left' });
          G.txt('[' + (i + 1) + ']', tx, y + c.h * 0.8, { size: Math.max(11, fs * 0.6), family: G.TEXT, weight: 800, fill: 'rgba(255,241,184,.7)', align: 'left' });
          ring(c.x + c.w - c.h * 0.5, y + c.h / 2, c.h * 0.36, i);
        } else {
          gem(c.x + c.w / 2, y + c.h * 0.2, c.w * 0.16 * pulse, i);
          G.txt(name, c.x + c.w / 2, y + c.h * 0.4, { size: fs, weight: 900, fill: col.a, stroke: '#2a1802', sw: 3, spacing: 2 });
          G.txt(T.handColorSub, c.x + c.w / 2, y + c.h * 0.4 + fs * 1.5, { size: Math.max(10, fs * 0.58), family: G.TEXT, weight: 700, fill: '#cdb98a' });
          ring(c.x + c.w / 2, y + c.h * 0.745, Math.min(c.w * 0.2, c.h * 0.15), i);
          G.txt('[' + (i + 1) + ']', c.x + c.w / 2, y + c.h * 0.93, { size: Math.max(11, fs * 0.6), family: G.TEXT, weight: 800, fill: 'rgba(255,241,184,.7)' });
        }
      });
    }
    S.update = function (dt) { tt += dt; };
    S.draw = function () {
      cards.forEach(drawCard);
      if (cards.length && G.h >= 520) {
        var by = cards[2].y + cards[2].h + 12, narrow = cards[0].row, fs = narrow ? 11 : 12;
        var lines = wrapLines(T.handColorRule, Math.min(G.w - 28, 760), '700 ' + fs + 'px ' + G.TEXT);
        sv(function () { lines.forEach(function (ln, k) { G.txt(ln, G.cx, by + k * (fs + 4), { size: fs, family: G.TEXT, weight: 700, fill: 'rgba(232,216,168,.95)', stroke: 'rgba(0,0,0,.8)', sw: 3 }); }); });
      }
      chrome(S);
    };
    S.run = function () {
      return new Promise(function (res) {
        var done = false;
        function fin(i) { if (!done) { done = true; S.pointer = function () {}; window.removeEventListener('keydown', key, true); res(names[i]); } }
        function key(e) { if (!$('modal').hidden) return; var n = { Digit1: 0, Digit2: 1, Digit3: 2, Numpad1: 0, Numpad2: 1, Numpad3: 2 }[e.code]; if (n != null && sel < 0) { e.preventDefault(); e.stopImmediatePropagation(); sel = n; Sfx.shield(); G.sleep(0.35).then(function () { fin(n); }); } }
        window.addEventListener('keydown', key, true);
        S.pointer = function (x, y, type) {
          var h = -1; cards.forEach(function (c, i) { if (x >= c.x && x <= c.x + c.w && y >= c.y - 6 && y <= c.y + c.h) h = i; });
          if (sel < 0) hover = h;
          if (type === 'down' && h >= 0 && sel < 0) { sel = h; Sfx.shield(); FX.spark(cards[h].x + cards[h].w / 2, cards[h].y + cards[h].h / 2, 24, HCOL[h].a, 300); G.sleep(0.35).then(function () { fin(h); }); }
        };
        G.say(G.h >= 520 ? T.handColorHint : '');   // paysage de téléphone : la bulle recouvrirait la première carte
        G.sleep(20).then(function () { if (sel < 0) sel = Math.floor(Math.random() * 3); fin(sel); });   // sans réponse : couleur au hasard (les trois sont équivalentes)
      });
    }
    return S;
  }

  /* ======================================================================
   * 5. CRYPTE D'ANUBIS — bonus SECRET : 5 colonnes de multiplicateurs, 9 blocs qui tombent (script pré-tiré, aucune décision ici)
   * ====================================================================== */
  var CRY_PAL = {
    skull:   { a: '#2c4a52', b: '#0f1e24', rim: '#9fe8f2', ink: '#e9fbff', tag: '#9fe8f2' },
    epic:    { a: '#ffe9a0', b: '#9a6a10', rim: '#fff6d0', ink: '#3a2203', tag: '#ffe08a' },
    anubis:  { a: '#3b4fb8', b: '#10173f', rim: '#9fb6ff', ink: '#ffffff', tag: '#9fb6ff' },
    epicx:   { a: '#ffd86a', b: '#7a4a08', rim: '#fff6d0', ink: '#3a2203', tag: '#ffe08a' },
    ice:     { a: '#e4fcff', b: '#58b0e4', rim: '#ffffff', ink: '#0b3a55', tag: '#bfefff' },
    crusher: { a: '#6b7380', b: '#252a32', rim: '#ffd86a', ink: '#ffd86a', tag: '#ffb347' }
  };
  function cryStar(x, y, r, col) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  }
  // bloc vectoriel centré en (x, y), taille s ; o : sc, sx, sy, a, glow, rot, charge, jaw, crack
  function cryBlock(t, x, y, s, v, o) {
    o = o || {};
    var pal = CRY_PAL[t], h = s / 2, epic = t === 'epic' || t === 'epicx', lab = o.nolabel ? '' : (t === 'skull' || t === 'epic') ? '+' + G.fmt(Math.round(v * (o.B || 1) * 100) / 100) : (t === 'anubis' || t === 'epicx') ? '×' + G.fmt(v) : '';
    ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
    var sc = o.sc == null ? 1 : o.sc; ctx.scale(sc * (o.sx || 1), sc * (o.sy || 1));
    if (o.a != null) ctx.globalAlpha *= o.a;
    var gl = (epic ? 0.7 : 0.25) + (o.glow || 0) + (o.charge || 0) * 0.6;
    var hg = ctx.createRadialGradient(0, 0, h * 0.3, 0, 0, h * (1.5 + gl));
    hg.addColorStop(0, t === 'ice' ? 'rgba(160,230,255,' + gl * 0.6 + ')' : epic ? 'rgba(255,216,106,' + gl * 0.7 + ')' : 'rgba(' + (t === 'anubis' ? '120,150,255' : t === 'crusher' ? '255,140,60' : '120,230,240') + ',' + gl * 0.5 + ')'); hg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = hg; ctx.fillRect(-h * 3, -h * 3, h * 6, h * 6);
    A.roundRect(ctx, -h, -h, s, s, s * 0.16);
    var bg = ctx.createLinearGradient(0, -h, 0, h); bg.addColorStop(0, pal.a); bg.addColorStop(1, pal.b);
    ctx.globalAlpha *= (t === 'ice' ? 0.92 : 1); ctx.fillStyle = bg; ctx.fill(); ctx.globalAlpha = o.a == null ? 1 : o.a;
    ctx.lineWidth = Math.max(2, s * 0.05); ctx.strokeStyle = pal.rim; ctx.stroke();
    ctx.save(); A.roundRect(ctx, -h, -h, s, s, s * 0.16); ctx.clip();
    var sh = ctx.createLinearGradient(-h, -h, h, h); sh.addColorStop(0, 'rgba(255,255,255,.35)'); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); ctx.fillStyle = sh; ctx.fillRect(-h, -h, s, s);
    if (t === 'skull') { A.skull(ctx, 0, -s * 0.1, s * 0.66, '#e8f6f0', '#0c1a1e'); }
    else if (t === 'epic') { if (!G.icon(ctx, 'skull', 0, -s * 0.08, s * 0.95)) A.skull(ctx, 0, -s * 0.1, s * 0.66, '#fff1b8', '#3a2203'); }
    else if (t === 'anubis') { A.jackal(ctx, 0, -s * 0.3, s * 0.3, { glow: 0.3 }); }
    else if (t === 'epicx') { A.jackal(ctx, 0, -s * 0.3, s * 0.3, { glow: 0.6, nemesColor: '#c8921c' }); }
    else if (t === 'ice') {
      ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = Math.max(1.5, s * 0.04); ctx.lineCap = 'round';
      for (var i = 0; i < 3; i++) { var a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * s * 0.3, Math.sin(a) * s * 0.3); ctx.lineTo(-Math.cos(a) * s * 0.3, -Math.sin(a) * s * 0.3); ctx.stroke(); }
      ctx.lineWidth = Math.max(1, s * 0.025); ctx.strokeStyle = 'rgba(40,120,180,.55)';
      ctx.beginPath(); ctx.moveTo(-h * 0.9, -h * 0.2); ctx.lineTo(-h * 0.2, -h * 0.5); ctx.lineTo(h * 0.3, -h * 0.1); ctx.lineTo(h * 0.9, -h * 0.55); ctx.stroke();
      if (o.crack) { ctx.beginPath(); ctx.moveTo(0, -h); ctx.lineTo(h * 0.1, -h * 0.2); ctx.lineTo(-h * 0.2, h * 0.3); ctx.lineTo(0, h); ctx.stroke(); }
    } else if (t === 'crusher') {
      var jaw = o.jaw == null ? 1 : o.jaw, gap = jaw * s * 0.16, th = s * 0.2, n = 5, tw = s / n;
      ctx.fillStyle = '#10131a'; ctx.fillRect(-h, -h, s, s);
      ctx.fillStyle = 'rgba(255,90,40,' + (0.25 + (1 - jaw) * 0.5) + ')'; ctx.fillRect(-h, -s * 0.03, s, s * 0.06);
      for (var sd = -1; sd <= 1; sd += 2) {
        var by = sd * (h * 0.92 - gap * 0.0), g2 = ctx.createLinearGradient(0, sd * h, 0, sd * s * 0.1); g2.addColorStop(0, '#9aa3b2'); g2.addColorStop(1, '#4a525e');
        ctx.fillStyle = g2; ctx.fillRect(-h, sd > 0 ? s * 0.18 + gap : -h, s, sd > 0 ? h - s * 0.18 - gap : h - s * 0.18 - gap);
        ctx.fillStyle = '#e6ebf2';
        for (var k = 0; k < n; k++) { var tx = -h + k * tw; ctx.beginPath(); ctx.moveTo(tx, sd * (s * 0.18 + gap)); ctx.lineTo(tx + tw, sd * (s * 0.18 + gap)); ctx.lineTo(tx + tw / 2, sd * (s * 0.18 + gap - th)); ctx.closePath(); ctx.fill(); }
      }
    }
    ctx.restore();
    if (lab) {
      A.roundRect(ctx, -h * 0.86, h * 0.36, s * 0.86, s * 0.3, s * 0.08); ctx.fillStyle = 'rgba(0,0,0,.62)'; ctx.fill();
      G.txt(lab, 0, h * 0.52, { size: Math.max(11, s * 0.27), weight: 900, fill: pal.tag, stroke: 'rgba(0,0,0,.6)', sw: 3 });
    }
    if (epic) cryStar(h * 0.72, -h * 0.72, s * 0.17, '#fff6d0');
    ctx.restore();
  }
  // bloc fixe (valeur figée par la glace) : plaque sombre à liseré de glace
  function cryFixed(x, y, w, h, v, o) {
    o = o || {};
    ctx.save(); ctx.translate(x, y); ctx.scale((o.sc == null ? 1 : o.sc), (o.sc == null ? 1 : o.sc) * (o.sy == null ? 1 : o.sy));
    if (o.a != null) ctx.globalAlpha *= o.a;
    var gl = o.glow || 0;
    A.roundRect(ctx, -w / 2, -h / 2, w, h, Math.min(10, h * 0.25));
    var g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#3b3018'); g.addColorStop(1, '#17100a');
    ctx.shadowColor = 'rgba(150,225,255,' + (0.3 + gl * 0.7) + ')'; ctx.shadowBlur = 8 + gl * 22; ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 2; ctx.strokeStyle = gl > 0.3 ? '#ffffff' : '#8fdcf0'; ctx.stroke();
    var sg = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); sg.addColorStop(0, 'rgba(160,230,255,.28)'); sg.addColorStop(0.5, 'rgba(160,230,255,0)'); ctx.fillStyle = sg; ctx.fill();
    G.goldText('×' + G.fmt(v), 0, 1, Math.min(h * 0.62, w * 0.9 / Math.max(2, ('×' + G.fmt(v)).length * 0.62)), { blur: 6 });
    ctx.restore();
  }

  function cryptScene(sp, bet) {
    var T = I18N.t(), data = sp.bonus, steps = data.steps, NC = M.CRYPT_COLS, CAP = M.CRYPT_CAP, B = bf(sp);
    var S = newScene(T.cryptIntro), g = {}; S.bgImg = 'vault'; S.dim = 0.86; S.showTotal = false;
    var cols = [], blk = null, shards = [], tt = 0, hl = [], hlA = 0, idx = 0, rush = false, floats = [], legPulse = -1;
    for (var c0 = 0; c0 < NC; c0++) cols.push({ top: M.CRYPT_START, fx: [], flash: 0, tint: '#fff', wave: 0, pulse: 0 });
    function lerp2(a, b, k) { return a + (b - a) * k; }
    function K() { return quick() ? 0.4 : rush ? 0.55 : 1; }
    function avgOf(st) { var s = 0; for (var c = 0; c < NC; c++) { s += st.tops[c]; st.fixed[c].forEach(function (x) { s += x; }); } return s / NC; }
    S.layout = function () {
      var w = G.w, h = G.h, land = h < 520, narrow = w < 640;
      var top = land ? T0() + 40 : T0() + clamp(w * 0.034, 17, 34) * 1.9 + 52 + clamp(w * 0.03, 20, 36) * 0.9 + 10;
      var bot = h - hudH() - (land ? 6 : 46), legH = land ? 30 : 48, availH = bot - legH - top - 4;
      var colW = Math.min(w * 0.94 / NC, land ? 112 : 132), bs = Math.min(colW * 0.84, availH / 5.6);
      g.land = land; g.colW = Math.max(colW, bs * 1.1); g.bs = bs;
      g.dropY = top + bs * 0.52; g.shaftTop = top + bs * 1.7; g.plateH = bs * 0.82; g.plateCY = g.shaftTop + g.plateH / 2;
      g.stackTop = g.shaftTop + g.plateH + bs * 0.08;
      g.sh = clamp((availH - bs * (1.7 + 0.82 + 0.08 + 0.45 + 0.1)) / CAP, bs * 0.5, bs * 0.95);
      g.stackBot = g.stackTop + CAP * g.sh; g.chipY = g.stackBot + bs * 0.27; g.legY = bot - legH / 2 + 2; g.legH = legH; g.top = top;
      g.fw = g.colW * 0.86; g.shaftW = g.colW * 0.9;
    };
    function colX(c) { return G.cx + (c - (NC - 1) / 2) * g.colW; }
    function slotY(s) { return g.stackBot - (s + 0.5) * g.sh; }
    function colSum(c) { var s = cols[c].top; cols[c].fx.forEach(function (f) { s += f.v; }); return s; }
    S.update = function (dt) {
      chromeUpdate(S, dt); tt += dt; hlA += ((hl.length ? 1 : 0) - hlA) * Math.min(1, dt * 8);
      cols.forEach(function (c) { c.flash = Math.max(0, c.flash - dt * 2.4); c.wave = Math.max(0, c.wave - dt * 1.6); c.pulse = Math.max(0, c.pulse - dt * 2); c.fx.forEach(function (f) { f.glow = Math.max(0, (f.glow || 0) - dt * 1.6); }); });
      for (var i = shards.length - 1; i >= 0; i--) { var p = shards[i]; p.t += dt; if (p.t > p.life) { shards.splice(i, 1); continue; } p.vy += 1100 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }
      for (i = floats.length - 1; i >= 0; i--) { floats[i].t += dt; if (floats[i].t > 1.2) floats.splice(i, 1); }
      if (legPulse >= 0) legPulse = Math.max(-1, legPulse - dt * 2);
    };
    function drawLegend() {
      var types = ['skull', 'epic', 'anubis', 'epicx', 'ice', 'crusher'], w = Math.min(G.w * 0.98, 6 * 150), cw = w / 6, x0 = G.cx - w / 2, inline = cw >= 100;
      var ls = Math.min(g.legH * (inline ? 0.8 : 0.56), cw * 0.5), fs = clamp(cw * 0.115, 8, 12);
      ctx.save(); A.roundRect(ctx, x0, g.legY - g.legH / 2, w, g.legH, 10); ctx.fillStyle = 'rgba(8,6,3,.62)'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,216,106,.45)'; ctx.stroke(); ctx.restore();
      types.forEach(function (t, i) {
        var cx = x0 + (i + 0.5) * cw;
        if (inline) { cryBlock(t, cx - cw * 0.5 + ls * 0.7, g.legY, ls, 0, { nolabel: true }); G.txt(T.cryptLeg[i], cx - cw * 0.5 + ls * 1.4, g.legY, { size: fs, family: G.TEXT, weight: 800, fill: '#e9d9aa', align: 'left' }); }
        else { cryBlock(t, cx, g.legY - g.legH * 0.15, ls, 0, { nolabel: true }); G.txt(T.cryptLeg[i], cx, g.legY + g.legH * 0.33, { size: fs, family: G.TEXT, weight: 800, fill: '#e9d9aa' }); }
      });
    }
    S.draw = function () {
      var w = G.w, bs = g.bs, c, i;
      // colonnes : puits sombres + emplacements
      for (c = 0; c < NC; c++) {
        var x = colX(c), cl = cols[c], hot = hl.indexOf(c) >= 0 ? hlA : 0, sw = g.shaftW, y0 = g.shaftTop - 4, y1 = g.stackBot + 6;
        ctx.save(); A.roundRect(ctx, x - sw / 2, y0, sw, y1 - y0, 12);
        var sg = ctx.createLinearGradient(0, y0, 0, y1); sg.addColorStop(0, 'rgba(18,14,8,.78)'); sg.addColorStop(1, 'rgba(6,4,2,.82)'); ctx.fillStyle = sg; ctx.fill();
        ctx.lineWidth = 2 + hot * 2 + cl.wave * 3; ctx.strokeStyle = cl.wave > 0 ? 'rgba(255,240,170,' + (0.5 + cl.wave * 0.5) + ')' : 'rgba(255,216,106,' + (0.35 + hot * 0.55) + ')'; ctx.stroke();
        ctx.setLineDash([4, 5]); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(160,225,255,.28)';
        for (i = 0; i < CAP; i++) { A.roundRect(ctx, x - g.fw / 2, slotY(i) - g.sh * 0.44, g.fw, g.sh * 0.88, 7); ctx.stroke(); }
        ctx.setLineDash([]); ctx.restore();
        if (hot > 0.02 && blk && blk.c >= 0) { var bgl = ctx.createLinearGradient(0, blk.y, 0, g.shaftTop); bgl.addColorStop(0, 'rgba(255,230,140,0)'); bgl.addColorStop(1, 'rgba(255,230,140,' + 0.3 * hot + ')'); ctx.fillStyle = bgl; ctx.fillRect(x - sw / 2, blk.y, sw, g.shaftTop - blk.y); }
        // blocs fixes
        cl.fx.forEach(function (f) { cryFixed(x, slotY(f.slot), g.fw, g.sh * 0.88, r2(f.v * B), { sc: f.sc, sy: f.sy, a: f.a, glow: f.glow }); });
        // plaque du haut
        var py = g.plateCY, pw = g.fw, ph = g.plateH;
        ctx.save(); ctx.translate(x, py + cl.pulse * -3);
        A.roundRect(ctx, -pw / 2, -ph / 2, pw, ph, 10); var pg = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2); pg.addColorStop(0, '#3a2c16'); pg.addColorStop(1, '#130d06');
        ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 10; ctx.fillStyle = pg; ctx.fill(); ctx.shadowBlur = 0;
        ctx.lineWidth = 2.5; ctx.strokeStyle = A.goldGrad(ctx, -pw / 2, -ph / 2, pw / 2, ph / 2); ctx.stroke();
        if (cl.flash > 0) { A.roundRect(ctx, -pw / 2, -ph / 2, pw, ph, 10); ctx.fillStyle = cl.tint === 'ice' ? 'rgba(170,235,255,' + cl.flash * 0.7 + ')' : 'rgba(255,240,180,' + cl.flash * 0.7 + ')'; ctx.fill(); }
        var tv = '×' + G.fmt(Math.round(cl.top * B)), fs = Math.min(ph * 0.62, pw * 0.92 / Math.max(2.2, tv.length * 0.6));
        G.goldText(tv, 0, 2, fs * (1 + cl.pulse * 0.25), { blur: 8 });
        ctx.restore();
        // total de la colonne
        var ct = '= ×' + G.fmt(Math.round(colSum(c) * B)), cfs = clamp(bs * 0.26, 10, 17);
        G.txt(ct, x, g.chipY, { size: Math.min(cfs, g.fw * 0.9 / Math.max(3, ct.length * 0.58)), family: G.TEXT, weight: 800, fill: '#fff1b8', stroke: 'rgba(0,0,0,.6)', sw: 3 });
      }
      // éclats
      shards.forEach(function (p) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = 1 - p.t / p.life; ctx.fillStyle = p.c; ctx.beginPath(); ctx.moveTo(-p.s, p.s * 0.6); ctx.lineTo(p.s, 0); ctx.lineTo(-p.s * 0.2, -p.s); ctx.closePath(); ctx.fill(); ctx.restore(); });
      // bloc en chute
      if (blk) {
        var bob = blk.hover ? Math.sin(tt * 4) * bs * 0.04 : 0, shx = blk.shake ? (Math.random() - 0.5) * bs * 0.1 * blk.shake : 0;
        cryBlock(blk.t, blk.x + shx, blk.y + bob, blk.t === 'epic' || blk.t === 'epicx' ? bs * 1.12 : bs, blk.v, { B: B, sc: blk.sc, a: blk.a, charge: blk.charge, jaw: blk.jaw, crack: blk.crack, sy: blk.sy, rot: blk.rot });
      }
      floats.forEach(function (f) { ctx.globalAlpha = 1 - clamp((f.t - 0.7) / 0.5, 0, 1); G.txt(f.text, f.x, f.y - f.t * 38, { size: f.size, weight: 900, fill: f.col, stroke: '#1a1006', sw: 4, shadow: 'rgba(0,0,0,.6)' }); }); ctx.globalAlpha = 1;
      if (blk && !g.land) G.txt(T.cryptCount.replace('{n}', Math.min(idx + 1, steps.length)).replace('{m}', steps.length), G.cx - g.colW * 2.4, g.top + 4, { size: clamp(bs * 0.2, 9, 13), family: G.TEXT, weight: 800, fill: '#b9a780', align: 'left', spacing: 2 });
      drawLegend();
      var tfs = clamp(w * 0.03, 20, 36);
      if (g.land) { ctx.save(); ctx.translate(w - 64 - G.cx, 62); totalBox(S, 40, T.cryptAvg); ctx.restore(); }
      else totalBox(S, T0() + clamp(w * 0.034, 17, 34) * 1.9 + 52, T.cryptAvg);
      chrome(S);
    };
    function addFloat(text, x, y, col, size) { floats.push({ text: text, x: x, y: y, t: 0, col: col || '#fff1b8', size: size || clamp(g.bs * 0.4, 16, 30) }); }
    function burst(x, y, n, col) { FX.spark(x, y, n, col, 300); }
    async function roll(c, to, dur) {
      var cl = cols[c], from = cl.top, last = -1;
      await G.tween(dur, function (u) { cl.top = lerp2(from, to, FX.ease.out3(u)); var q = Math.floor(u * 8); if (q !== last) { last = q; Sfx.countTick(u); } }, null);
      cl.top = to;
    }
    function hit(c, tint) { var cl = cols[c]; cl.flash = 1; cl.tint = tint || ''; cl.wave = 1; cl.pulse = 1; }
    function shatter(x, y, n) {
      for (var i = 0; i < n; i++) { var a = Math.random() * TAU, v = 160 + Math.random() * 380; shards.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 220, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 16, s: g.bs * (0.06 + Math.random() * 0.1), life: 0.8 + Math.random() * 0.5, t: 0, c: Math.random() < 0.5 ? '#e8fbff' : '#7fcdf0' }); }
      FX.spark(x, y, 16, '#bfefff', 300);
    }
    async function dropStep(i) {
      var st = steps[i], d = data.drops[i], all = d.c < 0, bs = g.bs, t = d.t, D = function (x) { return x * K(); }, x0 = all ? G.cx : colX(d.c);
      var epic = t === 'epic' || t === 'epicx';
      blk = { t: t, v: d.v, c: d.c, x: x0, y: g.dropY - bs * 1.2, sc: 0.3, a: 0, charge: 0, jaw: 1, shake: 0, hover: false };
      hl = all ? [0, 1, 2, 3, 4] : [d.c]; rush = false;
      Sfx.tick(0.5); FX.ring(x0, g.dropY, CRY_PAL[t].tag, bs * 1.6, 0.5);
      await G.tween(D(0.3), function (u) { var e = FX.ease.outBack(u); blk.y = lerp2(g.dropY - bs * 1.2, g.dropY, e); blk.a = Math.min(1, u * 3); blk.sc = 0.4 + 0.6 * e; }, null);
      blk.hover = true;
      if (!quick()) { G.say(T.cryptHint[t]); await waitTap(S, 14); G.say(''); }
      else await G.sleep(0.12);
      blk.hover = false;
      S.tap = function () { rush = true; };
      if (!quick()) {
        var last = 0;
        await G.tween(D(0.34), function (u) { blk.charge = u; blk.shake = u; var q = Math.floor(u * 6); if (q !== last) { last = q; Sfx.tick(0.3 + u * 0.7); } }, null);
        blk.shake = 0;
      }
      var Y0 = g.dropY, fallDur = D(0.7), hitDone = null;
      if (t === 'skull' || t === 'epic' || t === 'anubis' || t === 'epicx') {
        var yl = g.shaftTop - bs * (epic ? 0.5 : 0.42), P = [];
        var effect = function () {
          Sfx.thud && !epic ? Sfx.drum(0.22) : 0; FX.shake(epic ? 12 : 5, 0.3);
          var order = all ? [2, 1, 3, 0, 4] : [d.c];
          order.forEach(function (c, k) {
            P.push(G.sleep(all ? Math.abs(c - 2) * 0.09 / Math.max(G.speed, 0.1) * K() : 0).then(function () {
              hit(c, ''); burst(colX(c), g.plateCY, epic ? 22 : 12, epic ? '#ffe9a0' : t === 'anubis' ? '#9fb6ff' : '#9fe8f2');
              FX.ring(colX(c), g.plateCY, epic ? '#ffd86a' : '#fff1b8', bs * 1.5, 0.6);
              addFloat(t === 'skull' || t === 'epic' ? '+' + fb(d.v, B) : '×' + d.v, colX(c), g.plateCY - bs * 0.5, epic ? '#fff1b8' : t === 'anubis' ? '#c8d4ff' : '#bff4ff');
              if (t === 'skull' || t === 'epic') { Sfx.coin(0.8 + k * 0.08); Sfx.chime(d.v * (epic ? 4 : 1)); } else { Sfx.reveal(); if (epic) Sfx.lightning(); else Sfx.chime(d.v * 2); }
              return roll(c, st.tops[c], D(0.55));
            }));
          });
          if (epic) { Sfx.sparkle(); FX.flash(0.35, '#ffe9a0'); }
          bump(S, avgOf(st) * B);
        };
        await G.tween(fallDur, function (u) {
          blk.y = lerp2(Y0, yl, FX.ease.outBounce(u)); blk.rot = (1 - u) * 0.2 * (d.c % 2 ? 1 : -1);
          if (!hitDone && u >= 0.364) { hitDone = true; effect(); }
        }, null);
        blk.rot = 0;
        await G.tween(D(0.22), function (u) { blk.y = lerp2(yl, g.plateCY, u); blk.sc = 1 - u; blk.a = 1 - u * u; }, null);
        blk = null; hl = [];
        await Promise.all(P);
      } else if (t === 'ice') {
        var n0 = i ? steps[i - 1].fixed[d.c].length : 0, ty = st.full ? g.stackTop - bs * 0.1 : slotY(n0);
        await G.tween(D(0.5), function (u) { blk.y = lerp2(Y0, ty, u * u); blk.rot = Math.sin(u * 9) * 0.1; }, null);
        hl = [];
        if (st.full) {
          Sfx.shield(); addFloat(T.cryptFull, colX(d.c), g.stackTop + g.sh, '#bfefff');
          await G.tween(D(0.6), function (u) { blk.sy = 1 - u * 0.9; blk.a = 1 - u; blk.y = ty + u * bs * 0.4; if (Math.random() < 0.3) FX.dust(colX(d.c), ty + bs * 0.4, 1, '#9fd8f0'); }, null);
          blk = null;
        } else {
          shatter(colX(d.c), ty, 18); Sfx.shield(); Sfx.coin(1.3); FX.shake(6, 0.25); FX.ring(colX(d.c), ty, '#bfefff', bs * 1.6, 0.6);
          blk = null;
          var f = { v: st.froze, slot: n0, sc: 0, sy: 1, a: 1, glow: 1 }; cols[d.c].fx.push(f);
          hit(d.c, 'ice'); addFloat('×' + fb(st.froze, B), colX(d.c), ty - g.sh, '#bfefff'); bump(S, avgOf(st) * B);
          await Promise.all([G.tween(D(0.4), function (u) { f.sc = FX.ease.outBack(u); }, null), roll(d.c, st.tops[d.c], D(0.5))]);
        }
      } else if (t === 'crusher') {
        var cl2 = cols[d.c], nf = cl2.fx.length, topY = slotY(Math.max(0, nf - 1)) - g.sh / 2 - bs * 0.5;
        if (!nf) topY = g.stackBot - bs * 0.5;
        await G.tween(fallDur, function (u) {
          blk.y = lerp2(Y0, topY, FX.ease.outBounce(u));
          if (!hitDone && u >= 0.364) { hitDone = true; FX.shake(5, 0.2); Sfx.drum(0.25); }
        }, null);
        hl = [];
        if (st.crushed) {
          Sfx.roll(4, 0.07); var fx0 = cl2.fx.map(function (f) { return f.slot; });
          await G.tween(D(0.55), function (u) {
            var e = FX.ease.inOut(u); blk.jaw = 1 - e; blk.y = topY + g.sh * nf * 0.7 * e;
            cl2.fx.forEach(function (f, j) { f.slot = lerp2(fx0[j], 0, e); f.sy = 1 - e * 0.6; f.glow = e; });
            if (Math.random() < 0.4) FX.dust(colX(d.c), blk.y + bs * 0.5, 1, '#c8b890');
          }, null);
          Sfx.thud(); FX.shake(12, 0.4); FX.ring(colX(d.c), slotY(0), '#ffd86a', bs * 1.8, 0.6); burst(colX(d.c), slotY(0), 22, '#ffd86a'); FX.dust(colX(d.c), slotY(0), 10);
          var sum = st.fixed[d.c][0], mf = { v: sum, slot: 0, sc: 0, sy: 1, a: 1, glow: 1 };
          cl2.fx = [mf]; hit(d.c, ''); addFloat('= ×' + fb(sum, B), colX(d.c), slotY(0) - g.sh, '#ffe08a'); bump(S, avgOf(st) * B);
          await Promise.all([G.tween(D(0.4), function (u) { mf.sc = FX.ease.outBack(u); blk.a = 1 - u; blk.y = lerp2(blk.y, blk.y - bs * 0.8, u); }, null)]);
        } else {
          await G.tween(D(0.3), function (u) { blk.jaw = 1 - Math.sin(u * Math.PI); }, null);
          await G.tween(D(0.3), function (u) { blk.a = 1 - u; }, null);
        }
        blk = null;
      }
      S.tap = null; hl = [];
      await G.sleep(D(0.3));
    }
    S.run = function () {
      return new Promise(function (resolve) {
        var finished = false;
        function key(e) {
          if (!$('modal').hidden || (e.target && e.target.tagName === 'BUTTON')) return;
          if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); if (S.tap) S.tap(); }
        }
        window.addEventListener('keydown', key, true);
        function done() { if (finished) return; finished = true; window.removeEventListener('keydown', key, true); resolve(); }
        (async function () {
          try {
            G.say(T.cryptRule); await G.sleep(quick() ? 0.2 : 1.6);
            await boostIntro(S, sp);
            for (idx = 0; idx < steps.length; idx++) await dropStep(idx);
            idx = steps.length - 1; hl = [];
            await G.sleep(quick() ? 0.2 : 0.5);
            for (var c = 0; c < NC; c++) { cols[c].pulse = 1; cols[c].flash = 0.8; Sfx.coin(0.7 + c * 0.12); FX.spark(colX(c), g.chipY, 6, '#ffe9a0', 200); await G.sleep(quick() ? 0.03 : 0.14); }
            bump(S, data.total * B); S.totalT = data.total * B;
            var dsp = data.total * B, tier = dsp >= 100 ? 3 : dsp >= 30 ? 2 : dsp >= 12 ? 1 : 0;
            if (tier > 0) { Sfx.fanfare(tier); FX.shake(8 + tier * 3, 0.5); FX.flash(0.3 + tier * 0.1, '#ffe9a0'); FX.coins(G.cx, G.cy, 10 + tier * 12, 900, 200); }
            if (data.capped) { S.banner = { text: T.cryptCapped, t: 0 }; await G.sleep(1.2); S.banner = null; }
            await settle(S, sp, bet);
          } catch (e) { if (root.console) console.error(e); }
          done();
        })();
        G.sleep(300).then(done);
      });
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
      G.txt(T.profDesc[p], tx, ty + fs * 1.5, { size: Math.max(10, fs * 0.58), family: G.TEXT, weight: 700, fill: '#cdb98a', align: al });
      G.txt(line(p), tx, ty + fs * 2.7, { size: Math.max(11, fs * 0.66), family: G.TEXT, weight: 800, fill: '#fff1b8', align: al });
      // volatilité : 1 à 3 gemmes
      var vy = c.row ? y + c.h * 0.84 : y + c.h * 0.9;
      for (var k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc((c.row ? tx + 7 : c.x + c.w / 2 - 22) + k * 22, vy, 6, 0, TAU); ctx.fillStyle = k <= i ? (i === 2 ? '#ff7a5a' : i === 1 ? '#ffd86a' : '#6ff0dd') : 'rgba(255,255,255,.12)'; ctx.fill(); }
      ctx.restore();
    }
    S.draw = function () {
      cards.forEach(drawCard);
      var bw = G.w, by = cards.length ? cards[2].y + cards[2].h + 14 : 0;
      if (G.h >= 520 && by < G.h - hudH() - 20) G.txt(T.chooseRtp, G.cx, by, { size: 12, family: G.TEXT, weight: 700, fill: 'rgba(205,185,138,.9)', spacing: 1 });
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
    var T = I18N.t(), kind = sp.secret ? 'crypt' : sp.upgraded ? 'hand' : sp.kind, S = newScene(sp.secret ? T.secretWord : T.bonusUnlocked), t = 0, btn = { x: 0, y: 0, w: 0, h: 0 }, hover = false, go = false, sparkT = 0, L = { ty: 0, ny: 0, size: 100, cy: 0 };
    S.showTotal = false; S.dim = 0.78; S.bgImg = kind === 'scarab' ? 'abyss' : kind === 'weigh' ? 'judgment' : kind === 'vault' ? 'vault' : kind === 'crypt' ? 'key' : 'hand';
    var ICN = { scarab: 'scarab', weigh: 'weigh', vault: 'vault', hand: 'hand', crypt: 'skull' };
    S.layout = function () {
      var bw = clamp(G.w * 0.6, 220, 420), bh = clamp(G.h * 0.1, 52, 76);
      btn = { w: bw, h: bh, x: G.cx - bw / 2, y: G.h - hudH() - bh - (G.h < 520 ? 10 : G.h < 640 ? 26 : 50) };
      var fs = clamp(Math.min(G.w * (sp.secret ? 0.07 : 0.085), G.h * (sp.secret ? 0.1 : 0.13)), sp.secret ? 18 : 22, 86), ns = clamp(Math.min(G.w * 0.034, G.h * 0.05), 13, 32);
      L.ty = T0() + fs * 0.9; L.ny = btn.y - 14 - ns * (sp.boost > 1 ? 2.2 : 1);
      var top = L.ty + fs * 0.55 + (sp.secret ? fs * 1.0 : 0), avail = L.ny - ns - top - 6;
      L.size = Math.max(36, Math.min(avail, G.w * 0.8, G.h * 0.62)); L.cy = top + 4 + L.size / 2;
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
      if (sp.secret) { var rg = ctx.createRadialGradient(0, 0, R * 0.3, 0, 0, R * 1.5); rg.addColorStop(0, 'rgba(255,50,30,' + (0.3 + 0.15 * Math.sin(t * 4)) + ')'); rg.addColorStop(1, 'rgba(255,50,30,0)'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(0, 0, R * 1.5, 0, TAU); ctx.fill(); }
      ctx.rotate(Math.sin(t * 1.6) * 0.05);
      G.icon(ctx, ICN[kind], 0, 0, L.size);
      ctx.restore();
      var ks = G.ease.outBack(clamp((t - 0.25) / 0.45, 0, 1)) * (1 + Math.max(0, 0.6 - t) * 0.6), ty = L.ty;
      ctx.save(); ctx.translate(G.cx, ty); ctx.scale(ks, ks);
      if (sp.secret) {
        var sfs = clamp(Math.min(w * 0.07, h * 0.1), 18, 86);
        G.goldText(T.secretWord, 0, 0, sfs, { blur: 40, spacing: 5 }); G.goldText(T.secretUnlocked, 0, sfs * 1.05, sfs, { blur: 40, spacing: 5 });
      } else G.goldText(T.bonusWord, 0, 0, clamp(Math.min(w * 0.085, h * 0.13), 22, 86), { blur: 40, spacing: 8 });
      ctx.restore();
      var na = clamp((t - 0.7) / 0.4, 0, 1), ns = clamp(Math.min(w * 0.034, h * 0.05), 13, 32);
      ctx.save(); ctx.globalAlpha = na;
      G.txt(sp.secret ? T.kindsLong.crypt : sp.upgraded ? T.kindsLong.hand : T.kindsLong[sp.kind], G.cx, L.ny + (1 - na) * 14, { size: ns, weight: 900, fill: '#ffe08a', stroke: '#2a1802', sw: 4, spacing: 3, shadow: 'rgba(255,200,80,.6)', blur: 18 });
      if (sp.boost > 1) G.txt(T.boostApplied + ' ×' + sp.boost, G.cx, L.ny + ns * 1.4, { size: clamp(w * 0.02, 12, 18), family: G.TEXT, weight: 800, fill: '#fff1b8' });
      ctx.restore();
      if (t > 1.0) {
        var ba = clamp((t - 1.0) / 0.4, 0, 1), bp = 1 + Math.sin(t * 5) * 0.035 + (hover ? 0.05 : 0), bx = btn.x + btn.w / 2, by = btn.y + btn.h / 2;
        ctx.save(); ctx.globalAlpha = ba; ctx.translate(bx, by + (1 - ba) * 20); ctx.scale(bp, bp);
        goButton(btn.w, btn.h, T.launchBonus, 0.55 + Math.sin(t * 5) * 0.25);
        ctx.restore();
      }
    };
    S.run = function () {
      Sfx.bonusReveal ? Sfx.bonusReveal() : Sfx.bonus(); if (sp.secret) { Sfx.fanfare(3); Sfx.sparkle(); FX.shake(16, 0.9); FX.coins(G.cx, G.cy, 24, 900, 260); } FX.shake(10, 0.5); FX.flash(0.4, '#ffe9a0'); FX.ring(G.cx, G.cy, '#ffe9a0', G.R * 1.2, 1);
      if (!quick()) G.say(sp.secret ? T.secretHint : T.launchHint);
      return new Promise(function (res) {
        function fin() {
          if (go) return; go = true; S.pointer = function () {}; window.removeEventListener('keydown', key, true);
          (Sfx.bonusLaunch || Sfx.shield)(); FX.flash(0.6, '#fff1b8'); FX.shake(12, 0.4); FX.spark(G.cx, btn.y + btn.h / 2, 40, '#ffe9a0', 400); FX.ring(G.cx, G.cy, '#fff1b8', G.R * 1.5, 0.7);
          G.sleep(0.5).then(res);
        }
        function key(e) { if (!$('modal').hidden || (e.target && e.target.tagName === 'BUTTON')) return; if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); if (t >= 1.1) fin(); } }
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
  var FACT = { scarab: scarabScene, weigh: weighScene, vault: vaultScene, hand: handScene, crypt: cryptScene };
  G.runBonus = async function (sp, bet) {
    var speed0 = G.speed;
    if (G.turbo) G.speed = G.ultra ? 8 : 3.4;   // turbo / ultra : les bonus restent rapides aussi (la vitesse ne retombe plus à la normale)
    $('oracle').hidden = true;
    Sfx.bonus(); G.wheel.flashLamps = 1.4; FX.shake(14, 0.6); FX.flash(0.5, '#ffe9a0'); FX.ring(G.cx, G.cy, '#ffe9a0', G.R * 1.3, 1);
    // Anubis surgit du centre de la roue : une apparition différente par bonus (scarabées, plume + cœur, coffre d'or, yeux rouges, crânes)
    if (G.emerge) await G.emerge(sp.secret ? 'crypt' : sp.upgraded ? 'hand' : sp.kind, quick());
    else await G.sleep(G.turbo ? 0.5 : 1.1);
    await G.setFade(1, 0.35);
    var is = introScene(sp);
    G.setScene(is); await G.setFade(0, 0.4);
    await is.run();
    await G.setFade(1, 0.35);
    if (sp.options && sp.upgraded) {   // Fureur d'Anubis : le joueur choisit sa couleur (au hasard en turbo / auto : les trois sont équivalentes)
      var ck = M.HAND_COLORS[Math.floor(Math.random() * 3)];
      if (!quick()) {
        var hc = handColorScene(sp);
        G.setScene(hc); await G.setFade(0, 0.5);
        ck = await hc.run();
        await G.setFade(1, 0.35);
      }
      sp.bonus = sp.options[ck]; sp.profile = ck; sp.base = sp.bonus.total; sp.pay = sp.base * (sp.boost || 1);
      if (G.onBonusChoice) G.onBonusChoice();
    } else if (sp.options && sp.options.std && sp.profile !== 'std') {
      // plus de choix de profil (Prudent / Équilibré / Audacieux) : le bonus se joue toujours en profil équilibré
      sp.bonus = sp.options.std; sp.profile = 'std'; sp.base = sp.bonus.total; sp.pay = sp.base * (sp.boost || 1);
      if (G.onBonusChoice) G.onBonusChoice();
    }
    var scene = FACT[sp.secret ? 'crypt' : sp.upgraded ? 'hand' : sp.kind](sp, bet);
    G.setScene(scene);
    await G.setFade(0, 0.5);
    if (Sfx.bonusTheme) Sfx.bonusTheme(sp.secret ? 'crypt' : sp.upgraded ? 'hand' : sp.kind);   // musique propre à chaque bonus
    try { await scene.run(); } finally { if (Sfx.stopBonusTheme) Sfx.stopBonusTheme(); G.speed = speed0; }
    await G.setFade(1, 0.35);
    G.setScene(null); G.say('');
    await G.setFade(0, 0.5);
    G.speed = speed0;
  };

  // test manuel : G.testBonus('vault'|'scarab'|'weigh'|'crypt', boost, upgraded, forced) ; forced = indices de cases imposés à la Fureur (liste pour les 3 couleurs, ou {turq:[..], gold:[..], ruby:[..]})
  G.testBonus = function (kind, boost, upg, forced) {
    var rng = M.cryptoRng(), opts, b, bo = boost || 1, prof = 'std';
    if (kind === 'crypt') { b = M._bonus.crypt(rng, forced); return G.runBonus({ kind: 'vault', secret: true, boost: bo, bonus: b, profile: 'crypt', base: b.total, pay: b.total * bo }, 100); }
    if (upg) {
      opts = M.handOptions(rng);
      if (forced) M.HAND_COLORS.forEach(function (c, i) { var f = Array.isArray(forced) ? forced : forced[c]; if (f) opts[c] = M._bonus.hand(rng, i, f); });
      prof = 'turq'; b = opts.turq;
    } else { opts = M.drawOptions(rng, kind); b = opts.std; }
    return G.runBonus({ kind: kind, boost: bo, bonus: b, options: opts, profile: prof, upgraded: !!upg, base: b.total, pay: b.total * bo }, 100);
  };
})(window);
