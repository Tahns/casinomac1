/* ANUBIS UNCHAINED — COLÈRE D'ANUBIS (animation). Rejoue les événements du book (voir docs/VOLATILITE.md §3) :
 *   wrath     -> G.wrath.begin(round.wrath) : les chaînes d'Anubis se tendent, le cadenas se fissure, tout se brise ; la poussière et les nombres sont
 *                grisés et enchaînés sur la roue, la plaque du multiplicateur s'allume au cran de départ
 *   wrathUp   -> G.wrath.up(mult)           : après un Ankh, une chaîne casse sur la plaque ; suspense (tambour, vacillement entre l'ancienne et la
 *                nouvelle valeur — jamais d'autre valeur), silence, puis le nouveau multiplicateur claque
 *   fin du tour -> G.wrath.end()
 * Purement visuel : l'issue est déjà tirée, le gain reste base × boost (sp.pay). Vitesses : tweens et pauses suivent G.speed (turbo / ultra) ;
 * FX.reduced : pas de chaînes, de secousse ni de vacillement, seulement des fondus. Aucun texte en dur : bloc « rules » de i18n.js (wrathT, wrathS).
 * Dessin : G.onFrame (par-dessus la roue) ; le grisé des cases est dans W.draw (game.js), lu sur G.wheel.wrath.shade. */
(function (root) {
  'use strict';
  var G = root.G, FX = root.FX, M = root.AnubisMath, I18N = root.I18N, Chains = root.Chains;
  if (!G || !FX || !M || !M.WRATH_LADDER || !I18N) return;
  var L = M.WRATH_LADDER, TOP = M.WRATH_TOP, TAU = Math.PI * 2;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sfx(n, a, b) { try { if (root.Sfx && root.Sfx[n]) root.Sfx[n](a, b); } catch (e) {} }
  function txt() { return I18N.block('rules'); }
  function red() { return !!FX.reduced; }

  var S = G.wheel.wrath = {
    on: false, a: 0, lvl: 0, veil: 0, shade: 0, t: 0, pop: 0, shk: 0, glow: 0, tense: 0, flick: null, banner: null,
    intro: null, anim: null, pch: null, pcAnim: null, key: ''
  };

  /* ---------- géométrie de la plaque : au-dessus de la roue s'il y a la place, sinon en dessous ---------- */
  function geo() {
    var R = G.R, pw = Math.min(G.w - 24, Math.max(170, R * 1.3)), ph = clamp(R * 0.3, 46, 84), y = G.cy - R * 1.1 - ph / 2 - 4;
    if (y - ph / 2 >= 46) return { x: G.cx, y: y, w: pw, h: ph };   // au-dessus de la roue (téléphone en portrait)
    var room = G.w - (G.cx + R * 1.12) - 16;                          // sinon à droite de la roue (écran large)
    if (room >= 150) { pw = Math.min(room, 280); return { x: G.cx + R * 1.12 + 8 + pw / 2, y: G.cy - R * 0.45, w: pw, h: ph }; }
    return { x: G.cx, y: G.cy + R * 0.58, w: pw * 0.8, h: ph };       // en dernier recours : sur la roue, au-dessus du pointeur du bas
  }
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.arc(x + w - r, y + r, r, -Math.PI / 2, 0); c.lineTo(x + w, y + h - r);
    c.arc(x + w - r, y + h - r, r, 0, Math.PI / 2); c.lineTo(x + r, y + h); c.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    c.lineTo(x, y + r); c.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5); c.closePath();
  }
  var HOT = ['#ffe9a0', '#ffd86a', '#ffc247', '#ffae33', '#ff9a26', '#ff8a1a', '#fff6d0'];   // or de plus en plus chaud (le rouge reste réservé à la Fureur)

  // couleur d'un cran, quelle que soit la longueur de l'échelle du pacte : le dernier cran est toujours le blanc-or
  function hot(i) { i = clamp(i, 0, TOP); return i >= TOP ? HOT[HOT.length - 1] : HOT[Math.round(i * (HOT.length - 2) / Math.max(1, TOP - 1))]; }
  /* ---------- dessin ---------- */
  function drawPlaque(ctx, g) {
    var R = G.R, a = S.a * (!G.scene || G.scene.showsWheel ? 1 : 0) * (G.winOv ? 0 : 1);
    if (a <= 0.01) return;
    var x = g.x, y = g.y, w = g.w, h = g.h, lv = S.lvl, k = 1 + 0.12 * S.pop * S.pop, col = hot(lv);
    if (S.flick) { var sh = (Math.floor(S.t * S.flick.f) % 2) === 0; lv = sh ? S.flick.from : S.flick.to; col = hot(lv); }
    var jx = red() ? 0 : (Math.sin(S.t * 71) * S.shk * 2.4), jy = red() ? 0 : (Math.cos(S.t * 63) * S.shk * 1.8);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x + jx, y + jy);
    // lueur
    var gl = ctx.createRadialGradient(0, 0, h * 0.2, 0, 0, w * 0.62);
    gl.addColorStop(0, 'rgba(255,196,80,' + (0.16 + 0.34 * S.glow + 0.08 * (lv / TOP)) + ')'); gl.addColorStop(1, 'rgba(255,196,80,0)');
    ctx.fillStyle = gl; ctx.fillRect(-w * 0.62, -w * 0.62, w * 1.24, w * 1.24);
    // plaque d'obsidienne cerclée d'or
    ctx.beginPath(); rr(ctx, -w / 2 + 4, -h / 2 + 5, w, h, h * 0.2); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill();
    var bg = ctx.createLinearGradient(0, -h / 2, 0, h / 2); bg.addColorStop(0, '#2a1d11'); bg.addColorStop(0.5, '#120c07'); bg.addColorStop(1, '#0a0705');
    ctx.beginPath(); rr(ctx, -w / 2, -h / 2, w, h, h * 0.2); ctx.fillStyle = bg; ctx.fill();
    var bd = ctx.createLinearGradient(0, -h / 2, 0, h / 2); bd.addColorStop(0, '#fff1b8'); bd.addColorStop(0.35, '#e6b94a'); bd.addColorStop(0.7, '#8a6a1e'); bd.addColorStop(1, '#4a350c');
    ctx.lineWidth = Math.max(2, h * 0.045); ctx.strokeStyle = bd; ctx.stroke();
    ctx.beginPath(); rr(ctx, -w / 2 + h * 0.07, -h / 2 + h * 0.07, w - h * 0.14, h - h * 0.14, h * 0.15); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,241,184,.22)'; ctx.stroke();
    // échelle : un maillon par cran, allumés jusqu'au cran courant
    var n = L.length, px0 = -w / 2 + w * 0.12, px1 = w / 2 - w * 0.12, py = h * 0.33, pr = Math.max(3, Math.min(h * 0.075, w * 0.022)), i, on;
    ctx.lineWidth = Math.max(1, pr * 0.45); ctx.strokeStyle = 'rgba(138,106,30,.55)'; ctx.beginPath(); ctx.moveTo(px0, py); ctx.lineTo(px1, py); ctx.stroke();
    for (i = 0; i < n; i++) {
      var qx = px0 + (px1 - px0) * i / (n - 1); on = i <= lv;
      ctx.beginPath(); ctx.arc(qx, py, pr * (i === lv ? 1.35 + 0.15 * S.glow : 1), 0, TAU);
      var hc = hot(i); ctx.fillStyle = on ? hc : '#1b130b'; if (on && !FX.lite) { ctx.shadowColor = hc; ctx.shadowBlur = i === lv ? 10 : 3; }
      ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 1; ctx.strokeStyle = on ? '#5b4311' : 'rgba(138,106,30,.7)'; ctx.stroke();
    }
    // multiplicateur courant
    var fs = clamp(h * 0.6, 22, 60) * k;
    ctx.save(); ctx.translate(0, -h * 0.12);
    G.txt('×' + G.fmt(L[clamp(lv, 0, TOP)]), 0, 0, { size: fs, weight: 900, fill: col, stroke: '#2a1802', sw: fs * 0.12, shadow: 'rgba(255,190,70,' + (0.5 + 0.4 * S.glow) + ')', blur: 14 + 18 * S.glow });
    ctx.restore();
    // chaîne tendue en travers de la plaque pendant le suspense, puis éclats
    if (S.pch && Chains && !red()) {
      ctx.save(); ctx.translate(Math.sin(S.t * 97) * S.tense * 1.6, 0); Chains.draw(ctx, S.pch, S.t, { still: true, shadow: 2, dpr: G.dpr }); ctx.restore();
    }
    ctx.restore();
    if (S.pcAnim) S.pcAnim.draw(ctx, G.dpr);
  }
  function fitFont(ctx, str, size, maxW, weight, family) {
    ctx.font = weight + ' ' + size + 'px ' + family;
    var m = ctx.measureText(str).width; return m > maxW ? size * maxW / m : size;
  }
  function drawBanner(ctx) {
    var b = S.banner; if (!b || b.a <= 0.01) return;
    var T = txt(), R = G.R, w = G.w, h = G.h, size = Math.min(w * 0.075, h * 0.1, R * 0.22), maxW = w * 0.9, cx = G.cx, cy = clamp(G.cy - R * 0.12, h * 0.22, h * 0.8);
    size = Math.max(16, fitFont(ctx, T.wrathT, size, maxW, 900, G.TITLE));
    var u = clamp(b.t / 0.5, 0, 1), sc = red() ? 1 : 1.25 - 0.25 * G.ease.outBack(u);
    ctx.save(); ctx.globalAlpha = b.a; ctx.translate(cx, cy); ctx.scale(sc, sc);
    var bandH = size * 2.6, bg = ctx.createLinearGradient(0, -bandH / 2, 0, bandH / 2);
    bg.addColorStop(0, 'rgba(8,4,2,0)'); bg.addColorStop(0.25, 'rgba(8,4,2,.82)'); bg.addColorStop(0.75, 'rgba(8,4,2,.82)'); bg.addColorStop(1, 'rgba(8,4,2,0)');
    ctx.fillStyle = bg; ctx.fillRect(-w, -bandH / 2, w * 2, bandH);
    G.goldText(T.wrathT, 0, -size * 0.28, size, { blur: 36, spacing: 4, shadow: 'rgba(255,170,60,.7)' });
    var sb = subText(T), ss = Math.max(11, fitFont(ctx, sb, size * 0.34, maxW, 800, G.TEXT));
    G.txt(sb, 0, size * 0.62, { size: ss, family: G.TEXT, weight: 800, fill: '#fff1b8', stroke: '#1a0e02', sw: 3 });
    ctx.restore();
  }
  function subText(T) { return String(T.wrathS).replace(/\{ankh\}/g, String(I18N.t().kinds.ankh)); }

  function drawIntro(ctx) {
    var c = S.intro; if (!c || !Chains) return;
    var R = G.R, size = c.size, jx = Math.sin(S.t * 83) * c.tense * 2.2, jy = Math.cos(S.t * 77) * c.tense * 1.6;
    ctx.save(); ctx.translate(jx, jy);
    [[c.c1, -1], [c.c2, 1]].forEach(function (p) {
      ctx.save(); ctx.globalAlpha = c.r; ctx.translate(p[1] * (1 - c.r) * G.w * 0.25, 0); Chains.draw(ctx, p[0], S.t, { still: true, shadow: 3, dpr: G.dpr }); ctx.restore();
    });
    ctx.globalAlpha = c.r; Chains.lock(ctx, G.cx, G.cy, R * 0.44, { crack: c.crack, t: S.t }); ctx.globalAlpha = 1;
    ctx.restore();
  }
  function step(dt) {
    var sdt = Math.min(dt, 0.05) * Math.min(G.speed || 1, 4);
    S.t += sdt; S.pop = Math.max(0, S.pop - sdt * 2.4); S.glow = Math.max(0, S.glow - sdt * 1.4);
    [S.anim, S.pcAnim].forEach(function (an) { if (an && !an.done) { for (var q = sdt; q > 0; q -= 1 / 60) an.update(Math.min(q, 1 / 60)); } });
    if (S.anim && S.anim.done) S.anim = null;
    if (S.pcAnim && S.pcAnim.done) S.pcAnim = null;
  }
  function onFrame(dt) {
    if (!S.on && S.a <= 0.01 && S.veil <= 0.01 && !S.banner && !S.intro && !S.anim && !S.pcAnim) return;
    step(dt);
    var ctx = G.ctx, so = FX.shakeOffset(), w = G.w, h = G.h, g = geo();
    ctx.save(); ctx.translate(so[0], so[1]);
    if (S.veil > 0.01) {
      ctx.fillStyle = 'rgba(5,3,2,' + 0.62 * S.veil + ')'; ctx.fillRect(-30, -30, w + 60, h + 60);
      if (S.intro && S.intro.crack > 0 && !FX.lite) {
        var gl = ctx.createRadialGradient(G.cx, G.cy, 0, G.cx, G.cy, G.R * 1.2); gl.addColorStop(0, 'rgba(255,200,90,' + 0.35 * S.intro.crack * S.veil + ')'); gl.addColorStop(1, 'rgba(255,200,90,0)');
        ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h);
      }
    }
    drawIntro(ctx);
    if (S.anim) S.anim.draw(ctx, G.dpr);
    drawPlaque(ctx, g);
    drawBanner(ctx);
    ctx.restore();
  }
  G.onFrame.push(onFrame);

  /* ---------- plaque : chaîne en travers ---------- */
  function plaqueChain() {
    if (!Chains) return null;
    var g = geo(), size = clamp(g.h * 0.24, 9, 18);
    return Chains.make(g.x - g.w / 2 + 6, g.y, g.x + g.w / 2 - 6, g.y, { size: size, sag: 0.0 });
  }

  /* ---------- API ---------- */
  var Wr = G.wrath = {
    active: function () { return S.on; },
    level: function () { return S.lvl; },
    // wrath = round.wrath ({ start, level, mult }) ; renvoie quand la scène est finie
    begin: async function (wr) {
      if (!wr || S.on) return;
      // échelle du pacte du tour (Scribe ×2…×10, Balance ×2…×100, Chacal ×3…×250) : portée par l'événement « wrath » du book
      L = Array.isArray(wr.ladder) && wr.ladder.length ? wr.ladder : M.WRATH_LADDER; TOP = L.length - 1;
      var T = txt(), r = red(), start = clamp(wr.start == null ? 0 : wr.start, 0, TOP);
      S.on = true; S.lvl = start; S.a = 0; S.shade = 0; S.shk = 0; S.tense = 0; S.flick = null;
      if (G.say) G.say(T.wrathT + ' ×' + G.fmt(L[start]));
      if (r || !Chains) {
        sfx('oracle'); S.banner = { t: 0, a: 0 };
        await G.tween(0.35, function (u) { S.veil = 0.7 * u; S.banner.a = u; S.banner.t = u * 0.5; }, null);
        await G.tween(0.5, function (u) { S.shade = u; S.a = u; }, null);
        S.pop = 0.4; await G.sleep(0.8);
        await G.tween(0.4, function (u) { S.veil = 0.7 * (1 - u); S.banner.a = 1 - u; }, null);
        S.veil = 0; S.banner = null; return;
      }
      // 1. deux chaînes d'or traversent l'écran et tiennent un cadenas au centre de la roue
      var size = clamp(G.R * 0.1, 15, 32), lw = G.R * 0.2;
      var c = S.intro = { size: size, r: 0, tense: 0, crack: 0, c1: Chains.make(-size, G.cy, G.cx - lw, G.cy, { size: size, sag: 0.015 }), c2: Chains.make(G.w + size, G.cy, G.cx + lw, G.cy, { size: size, sag: 0.015 }) };
      sfx('runes'); sfx('chainSlam');
      await G.tween(0.5, function (u) { S.veil = u; c.r = G.ease.out3 ? G.ease.out3(u) : u; }, null);
      // 2. tension : le cadenas se fissure, tout tremble
      sfx('chainTense', 1.0 / Math.max(1, G.speed)); sfx('drum', 0.3);
      await G.tween(1.0, function (u) { c.tense = u; c.crack = u; S.shk = 0; if (u > 0.2) FX.shake(1 + 5 * u, 0.08); }, null);
      // 3. les chaînes se brisent
      S.anim = Chains.shatter([c.c1, c.c2], { x: G.cx, y: G.cy, power: 1.15 });
      S.intro = null; S.glow = 1; S.pop = 1;
      sfx('chainBreak'); sfx('thunder'); FX.flash(0.9, '#fff1b8'); FX.shake(26, 0.9);
      FX.ring(G.cx, G.cy, '#fff1b8', Math.max(G.w, G.h) * 0.7, 1.0); FX.ring(G.cx, G.cy, '#ffd86a', G.R * 0.9, 0.7); FX.spark(G.cx, G.cy, 70, '#ffd86a', 700); FX.links(G.cx, G.cy, 18, 700);
      S.banner = { t: 0, a: 1 };
      var from = S.veil;
      await G.tween(1.1, function (u) { S.veil = from + (0.45 - from) * u; S.shade = G.ease.out3 ? G.ease.out3(u) : u; S.a = clamp(u * 2, 0, 1); S.banner.t = u * 1.1; }, null);
      sfx('divine');
      FX.ring(G.cx, geo().y, '#ffd86a', G.R * 0.6, 0.7); S.glow = 1; S.pop = 1;
      await G.sleep(1.1);
      await G.tween(0.5, function (u) { S.veil = 0.45 * (1 - u); S.banner.a = 1 - u; }, null);
      S.veil = 0; S.banner = null;
    },
    // un Ankh a cassé une chaîne : mult = nouveau multiplicateur (wrathUp du book)
    up: async function (mult) {
      if (!S.on) return;
      var nl = L.indexOf(mult); if (nl < 0 || nl === S.lvl) return;
      var from = S.lvl, big = nl / TOP, T = txt(), g = geo();
      if (G.say) G.say(T.wrathT + ' ×' + G.fmt(L[nl]));
      if (red() || !Chains) { S.lvl = nl; S.pop = 0.5; S.glow = 0.6; sfx('chime', L[nl]); await G.sleep(0.6); return; }
      // suspense : la chaîne se tend en travers de la plaque, le chiffre vacille entre l'ancienne et la nouvelle valeur, les lumières s'éteignent
      S.pch = plaqueChain();
      var dur = 0.9 + 0.8 * big;
      sfx('chainTense', dur / Math.max(1, G.speed)); sfx('drum', 0.22 + 0.2 * big);
      S.flick = { from: from, to: nl, f: 5 };
      await G.tween(dur, function (u) { S.tense = u; S.shk = u; S.flick.f = 5 + 24 * u * u; S.veil = 0.4 * u; S.glow = Math.max(S.glow, 0.5 * u); }, null);
      // silence, un battement
      S.flick = null; S.shk = 0; S.lvl = from; S.veil = 0.5;
      await G.sleep(0.22 + 0.3 * big);
      // la chaîne casse, le nouveau multiplicateur claque
      S.lvl = nl; S.pop = 1; S.glow = 1; S.tense = 0; S.veil = 0;
      S.pcAnim = Chains.shatter([S.pch], { x: g.x, y: g.y, power: 0.6 + 0.5 * big }); S.pch = null;
      sfx('chainSlam'); if (nl >= 3) sfx('thunder'); if (nl === TOP) sfx('chainBreak');
      FX.flash(nl === TOP ? 0.9 : 0.25 + 0.4 * big, nl === TOP ? '#ffffff' : '#fff1b8'); FX.shake(8 + 22 * big, 0.5 + 0.5 * big);
      FX.ring(g.x, g.y, '#ffd86a', G.R * (0.5 + 0.4 * big), 0.7); FX.spark(g.x, g.y, 24 + 50 * big, '#ffd86a', 420 + 300 * big);
      if (nl === TOP) { FX.ring(G.cx, G.cy, '#fff1b8', Math.max(G.w, G.h) * 0.6, 1.0); FX.spark(G.cx, G.cy, 80, '#fff1b8', 760); }
      await G.sleep(0.7 + 0.5 * big);
    },
    // rétablit la valeur sans animation (reprise, saut de tour)
    sync: function (mult) { var nl = L.indexOf(mult); if (S.on && nl >= 0) S.lvl = nl; },
    end: async function () {
      if (!S.on) return;
      S.flick = null; S.pch = null; S.shk = 0; S.tense = 0; S.veil = 0;
      var a0 = S.a, s0 = S.shade;
      await G.tween(red() ? 0.3 : 0.6, function (u) { S.a = a0 * (1 - u); S.shade = s0 * (1 - u); }, null);
      Wr.reset();
    },
    // arrêt immédiat (erreur de scène, nouveau tour)
    reset: function () {
      S.on = false; S.a = 0; S.shade = 0; S.veil = 0; S.banner = null; S.intro = null; S.anim = null; S.pch = null; S.pcAnim = null; S.flick = null; S.shk = 0; S.tense = 0;
    },
    // tour de bonus : lignes à afficher en clair, « Colère ×N » séparée de l'Oracle (sp.oracleBoost) ; null hors Colère
    boostLines: function (sp) {
      if (!sp || !(sp.wrath > 1)) return null;
      var T = txt(), TT = I18N.t(), o = sp.oracleBoost > 1 ? sp.oracleBoost : 0;
      return { text: T.wrathT + ' ×' + G.fmt(sp.wrath), sub: o ? TT.boostApplied + ' ×' + G.fmt(o) + '  ·  ×' + G.fmt(sp.boost) : TT.boostIntroSub };
    }
  };
})(window);
