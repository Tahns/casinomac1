/* ANUBIS UNCHAINED — PACTES (animation et icône). Le joueur scelle un pacte AVANT le tour (voir docs/GAMEPLAY.md) :
 *   Scribe (safe)   -> les chaînes se referment sur la plaque : Anubis reste lié, la Colère est bridée (×10 au plus)
 *   Balance (std)   -> une chaîne tendue, à l'équilibre : le jugement classique
 *   Chacal (bold)   -> les chaînes éclatent : la Colère part de ×3 et monte jusqu'à ×250
 * Purement visuel : le pacte choisit le MODE DE MISE du prochain tour (M.modeFor), jamais un résultat déjà tiré. Non bloquant : un nouveau tour
 * efface l'animation (G.pactFx.reset). Vitesses : G.speed ; FX.reduced : fondu seul, sans chaînes ni secousse. Textes : bloc « pact » de i18n.js.
 * Icône : G.pactFx.icon(pact) = jauge de trois maillons (1, 2 ou 3 allumés), SVG en ligne pour le bouton du haut et les cartes de la fenêtre. */
(function (root) {
  'use strict';
  var G = root.G, FX = root.FX, M = root.AnubisMath, I18N = root.I18N, Chains = root.Chains;
  if (!G || !FX || !M || !M.PACTS || !I18N) return;
  var LEVEL = { safe: 1, std: 2, bold: 3 }, TAU = Math.PI * 2;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sfx(n, a, b) { try { if (root.Sfx && root.Sfx[n]) root.Sfx[n](a, b); } catch (e) {} }
  function red() { return !!FX.reduced; }

  // jauge : trois maillons ovales, allumés jusqu'au niveau du pacte (Scribe 1, Balance 2, Chacal 3) ; le Chacal a un maillon ouvert (chaîne brisée)
  function icon(pact) {
    var lv = LEVEL[pact] || 2, out = '<svg class="pactIco" viewBox="0 0 36 16" aria-hidden="true">';
    for (var i = 0; i < 3; i++) {
      var on = i < lv, x = 6 + i * 12, broken = pact === 'bold' && i === 2;
      out += '<rect x="' + (x - 5) + '" y="3" width="10" height="10" rx="5" fill="none" stroke="' + (on ? 'currentColor' : 'rgba(205,185,138,.32)') + '" stroke-width="2.4"' +
        (broken ? ' stroke-dasharray="12 4"' : '') + '/>';
    }
    return out + '</svg>';
  }

  var S = { on: false, a: 0, veil: 0, t: 0, pact: 'std', pop: 0, chain: null, anim: null, shk: 0, id: 0 };

  function geo() {
    var w = Math.min(G.w - 32, Math.max(240, G.R * 2.1)), h = clamp(G.R * 0.62, 84, 150);
    return { x: G.cx, y: clamp(G.cy - G.R * 0.05, h, G.h - h), w: w, h: h };
  }
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.arc(x + w - r, y + r, r, -Math.PI / 2, 0); c.lineTo(x + w, y + h - r);
    c.arc(x + w - r, y + h - r, r, 0, Math.PI / 2); c.lineTo(x + r, y + h); c.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    c.lineTo(x, y + r); c.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5); c.closePath();
  }
  function fit(ctx, str, size, maxW, family) { ctx.font = '900 ' + size + 'px ' + family; var m = ctx.measureText(str).width; return m > maxW ? size * maxW / m : size; }

  function draw(ctx) {
    var g = geo(), P = I18N.block('pact'), a = S.a, k = 1 + 0.08 * S.pop * S.pop;
    if (S.veil > 0.01) { ctx.fillStyle = 'rgba(5,3,2,' + 0.55 * S.veil + ')'; ctx.fillRect(-30, -30, G.w + 60, G.h + 60); }
    if (a <= 0.01) return;
    var jx = red() ? 0 : Math.sin(S.t * 71) * S.shk * 3, jy = red() ? 0 : Math.cos(S.t * 59) * S.shk * 2;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(g.x + jx, g.y + jy); ctx.scale(k, k);
    var w = g.w, h = g.h;
    // cartouche d'obsidienne cerclé d'or (même matière que la plaque de la Colère)
    ctx.beginPath(); rr(ctx, -w / 2 + 5, -h / 2 + 6, w, h, h * 0.22); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill();
    var bg = ctx.createLinearGradient(0, -h / 2, 0, h / 2); bg.addColorStop(0, '#2a1d11'); bg.addColorStop(0.5, '#120c07'); bg.addColorStop(1, '#0a0705');
    ctx.beginPath(); rr(ctx, -w / 2, -h / 2, w, h, h * 0.22); ctx.fillStyle = bg; ctx.fill();
    var bd = ctx.createLinearGradient(0, -h / 2, 0, h / 2); bd.addColorStop(0, '#fff1b8'); bd.addColorStop(0.35, '#e6b94a'); bd.addColorStop(0.7, '#8a6a1e'); bd.addColorStop(1, '#4a350c');
    ctx.lineWidth = Math.max(2, h * 0.04); ctx.strokeStyle = bd; ctx.stroke();
    // titre « PACTE SCELLÉ » puis nom du pacte et sa devise
    var name = P.name[S.pact], ts = Math.max(10, fit(ctx, P.sealed, h * 0.15, w * 0.8, G.TEXT));
    G.txt(P.sealed, 0, -h * 0.3, { size: ts, family: G.TEXT, weight: 800, fill: '#cdb98a', stroke: '#1a0e02', sw: 2 });
    var ns = Math.max(12, fit(ctx, name, h * 0.24, w * 0.86, G.TITLE));
    G.goldText(name, 0, -h * 0.04, ns, { blur: 18, spacing: 2, shadow: 'rgba(255,190,70,.55)' });
    var tg = P.tag[S.pact], gs = Math.max(10, fit(ctx, tg, h * 0.13, w * 0.86, G.TEXT));
    G.txt(tg, 0, h * 0.19, { size: gs, family: G.TEXT, weight: 700, fill: '#fff1b8', stroke: '#1a0e02', sw: 2 });
    // jauge de trois maillons
    var lv = LEVEL[S.pact] || 2, pr = clamp(h * 0.07, 5, 10), py = h * 0.36;
    for (var i = 0; i < 3; i++) {
      var on = i < lv, qx = (i - 1) * pr * 3.2;
      ctx.beginPath(); ctx.ellipse(qx, py, pr * 1.25, pr, 0, 0, TAU); ctx.lineWidth = pr * 0.5;
      ctx.strokeStyle = on ? (S.pact === 'bold' ? '#ffd86a' : '#e6b94a') : 'rgba(138,106,30,.45)';
      if (on && !FX.lite) { ctx.shadowColor = '#ffd86a'; ctx.shadowBlur = 8 * S.pop + 2; }
      ctx.stroke(); ctx.shadowBlur = 0;
    }
    ctx.restore();
  }
  function onFrame(dt) {
    if (!S.on && S.a <= 0.01 && S.veil <= 0.01 && !S.anim) return;
    var sdt = Math.min(dt, 0.05) * Math.min(G.speed || 1, 4);
    S.t += sdt; S.pop = Math.max(0, S.pop - sdt * 2.2);
    if (S.anim && !S.anim.done) { for (var q = sdt; q > 0; q -= 1 / 60) S.anim.update(Math.min(q, 1 / 60)); }
    if (S.anim && S.anim.done) S.anim = null;
    var ctx = G.ctx, so = FX.shakeOffset();
    ctx.save(); ctx.translate(so[0], so[1]);
    draw(ctx);
    if (S.chain && Chains && !red()) { ctx.save(); ctx.globalAlpha = S.a; Chains.draw(ctx, S.chain, S.t, { still: true, shadow: 2, dpr: G.dpr }); ctx.restore(); }
    if (S.anim) S.anim.draw(ctx, G.dpr);
    ctx.restore();
  }
  G.onFrame.push(onFrame);

  function alive(id) { return S.id === id; }
  var Pf = G.pactFx = {
    icon: icon,
    level: function (p) { return LEVEL[p] || 2; },
    active: function () { return S.on; },
    // scelle le pacte p (safe | std | bold) : animation non bloquante, renvoie une promesse résolue à la fin (ou à l'interruption)
    seal: async function (p) {
      var id = ++S.id, g = geo();
      S.on = true; S.pact = M.PACTS[p] ? p : 'std'; S.a = 0; S.veil = 0; S.chain = null; S.anim = null; S.shk = 0; S.pop = 0;
      if (red() || !Chains) {
        sfx('click'); await G.tween(0.25, function (u) { if (alive(id)) { S.a = u; S.veil = u * 0.6; } }, null);
        if (alive(id)) { S.pop = 0.4; await G.sleep(0.9); }
        if (alive(id)) await G.tween(0.3, function (u) { if (alive(id)) { S.a = 1 - u; S.veil = 0.6 * (1 - u); } }, null);
        if (alive(id)) Pf.reset(); return;
      }
      var size = clamp(g.h * 0.16, 10, 22), y = g.y + g.h * 0.5 + size * 0.2;
      sfx('runes');
      await G.tween(0.3, function (u) { if (alive(id)) { S.a = u; S.veil = u * 0.7; } }, null);
      if (!alive(id)) return;
      if (S.pact === 'safe') {
        // les chaînes se reforment autour du cartouche : Anubis reste lié
        var c1 = Chains.make(g.x - g.w / 2 - size, y, g.x + g.w / 2 + size, y, { size: size, sag: 0.02 });
        S.anim = Chains.reform([c1], { x: g.x, y: y, dur: 0.7, onDone: function () { if (alive(id)) S.chain = c1; } });
        sfx('chainTense', 0.7 / Math.max(1, G.speed));
        await G.sleep(0.75); if (!alive(id)) return;
        S.pop = 1; sfx('chainSlam'); FX.shake(6, 0.3); FX.ring(g.x, g.y, '#e6b94a', g.w * 0.5, 0.6);
      } else if (S.pact === 'bold') {
        // les chaînes éclatent : la Colère se déchaîne
        var b1 = Chains.make(g.x - g.w / 2 - size, y, g.x, y, { size: size, sag: 0.02 }), b2 = Chains.make(g.x, y, g.x + g.w / 2 + size, y, { size: size, sag: 0.02 });
        S.chain = null; S.anim = null;
        var tense = { c: [b1, b2] };
        sfx('chainTense', 0.6 / Math.max(1, G.speed)); sfx('drum', 0.3);
        S.chain = b1; await G.tween(0.6, function (u) { if (alive(id)) { S.shk = u; } }, null); if (!alive(id)) return;
        S.chain = null; S.shk = 0; S.pop = 1;
        S.anim = Chains.shatter(tense.c, { x: g.x, y: y, power: 1.1 });
        sfx('chainBreak'); sfx('thunder'); FX.flash(0.6, '#fff1b8'); FX.shake(18, 0.6);
        FX.ring(g.x, g.y, '#ffd86a', Math.max(G.w, G.h) * 0.5, 0.8); FX.spark(g.x, g.y, 50, '#ffd86a', 600);
      } else {
        // une chaîne tendue à l'équilibre : le jugement classique
        S.chain = Chains.make(g.x - g.w / 2 - size, y, g.x + g.w / 2 + size, y, { size: size, sag: 0.05 });
        S.pop = 1; sfx('chime', 2); FX.ring(g.x, g.y, '#e6b94a', g.w * 0.45, 0.6);
      }
      await G.sleep(1.0); if (!alive(id)) return;
      await G.tween(0.4, function (u) { if (alive(id)) { S.a = 1 - u; S.veil = 0.7 * (1 - u); } }, null);
      if (alive(id)) Pf.reset();
    },
    reset: function () { S.id++; S.on = false; S.a = 0; S.veil = 0; S.chain = null; S.anim = null; S.shk = 0; S.pop = 0; }
  };
})(window);
