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

  var S = { on: false, a: 0, veil: 0, t: 0, pact: 'std', pop: 0, chain: null, anim: null, shk: 0, id: 0, pa: null, pb: null, head: 0, lockK: 0, scatter: 0, beam: null, bt: 0, bw: null };
  var B = FX.Break;

  function geo() {
    var w = Math.min(G.w - 32, Math.max(240, G.R * 2.1)), h = clamp(G.R * 0.66, 100, 156);
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
    ctx.beginPath(); rr(ctx, -w / 2, -h / 2, w, h, h * 0.22); ctx.fillStyle = '#120c07'; ctx.fill(); Art.grain(ctx); ctx.beginPath(); rr(ctx, -w / 2, -h / 2, w, h, h * 0.22);
    ctx.lineWidth = Math.max(2, h * 0.04); ctx.strokeStyle = Art.goldGrad(ctx, 0, -h / 2, 0, h / 2); ctx.stroke();
    // titre « PACTE SCELLÉ » puis nom du pacte et sa devise
    var name = P.name[S.pact], ts = Math.max(10, fit(ctx, P.sealed, h * 0.15, w * 0.8, G.TEXT));
    G.txt(P.sealed, 0, -h * 0.34, { size: ts, family: G.TEXT, weight: 800, fill: '#cdb98a', stroke: '#1a0e02', sw: 2 });
    var ns = Math.max(12, fit(ctx, name, h * 0.24, w * 0.86, G.TITLE));
    G.goldText(name, 0, -h * 0.12, ns, { spacing: 2 });
    var tg = P.tag[S.pact], gs = Math.max(10, fit(ctx, tg, h * 0.13, w * 0.86, G.TEXT));
    G.txt(tg, 0, h * 0.12, { size: gs, family: G.TEXT, weight: 700, fill: '#efdfa8', stroke: '#1a0e02', sw: 2 });
    // jauge de trois maillons
    var lv = LEVEL[S.pact] || 2, pr = clamp(h * 0.052, 4, 8), py = h * 0.36;
    for (var i = 0; i < 3; i++) {
      var on = i < lv, qx = (i - 1) * pr * 3.2;
      ctx.beginPath(); ctx.ellipse(qx, py, pr * 1.25, pr, 0, 0, TAU); ctx.lineWidth = pr * 0.5;
      ctx.strokeStyle = on ? (S.pact === 'bold' ? '#d9b857' : '#cfa94c') : 'rgba(138,106,30,.45)';
      ctx.stroke();
    }
    ctx.restore();
  }
  function wrapPath(g, size, sgn) {   // chaîne qui vient du bord de l'écran, contourne un coin du cartouche, descend et finit au bas, au centre
    var off = size * 0.3, xL = g.x - g.w / 2 - off, yT = g.y - g.h / 2 - off, yB = g.y + g.h / 2 + off, r = g.h * 0.22 + off, pts = [], k, a;
    pts.push(-size * 2, yT, xL + r, yT);
    for (k = 1; k <= 8; k++) { a = -Math.PI / 2 - (Math.PI / 2) * k / 8; pts.push(xL + r + Math.cos(a) * r, yT + r + Math.sin(a) * r); }
    pts.push(xL, yB - r);
    for (k = 1; k <= 8; k++) { a = Math.PI - (Math.PI / 2) * k / 8; pts.push(xL + r + Math.cos(a) * r, yB - r + Math.sin(a) * r); }
    pts.push(g.x, yB);
    if (sgn > 0) for (k = 0; k < pts.length; k += 2) pts[k] = 2 * g.x - pts[k];
    return B.path(pts, size);
  }
  function stud(ctx, x, y, r) {   // goujon d'or : disque à arête claire
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = '#a8802e'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#1a1004'; ctx.stroke();
    ctx.beginPath(); ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.4, 0, TAU); ctx.fillStyle = '#efdfa8'; ctx.fill();
  }
  function drawBind(ctx) {
    var g = geo(), a = S.a, size, yB;
    if (a <= 0.01 || !B.ready()) return;
    size = clamp(g.h * 0.15, 10, 20); yB = g.y + g.h / 2 + size * 0.3;
    if (S.pa) {
      ctx.save(); ctx.globalAlpha = a; B.drawPath(ctx, S.pa, S.head, S.t, 1, S.scatter); B.drawPath(ctx, S.pb, S.head, S.t, 1, S.scatter);
      if (S.lockK > 0.01) { var lk = S.lockK, ls = g.h * 0.34; ctx.translate(g.x, yB); ctx.scale(lk, lk); Chains.lock(ctx, 0, 0, ls, { t: S.t }); }
      ctx.restore();
    }
    if (S.beam) {   // balance : la chaîne bascule autour de son pivot et se stabilise
      var th = 0.24 * Math.exp(-3.2 * S.bt) * Math.cos(10 * S.bt), hf = g.w / 2 + size * 2.5, cs = Math.cos(th), sn = Math.sin(th), bm = S.beam;
      bm.x0 = g.x - cs * hf; bm.y0 = yB - sn * hf; bm.x1 = g.x + cs * hf; bm.y1 = yB + sn * hf; bm.size = size;
      ctx.save(); ctx.globalAlpha = a; B.drawChain(ctx, bm, S.t, 1);
      stud(ctx, g.x, yB, size * 0.75);
      [[bm.x0, bm.y0], [bm.x1, bm.y1]].forEach(function (e) {   // deux poids de pierre pendus à des maillons
        B.link(ctx, e[0], e[1] + size * 0.9, HP_, size * 0.9, 0.05);
        ctx.beginPath(); ctx.moveTo(e[0] - size * 0.7, e[1] + size * 1.9); ctx.lineTo(e[0] + size * 0.7, e[1] + size * 1.9); ctx.lineTo(e[0] + size * 0.95, e[1] + size * 3.1); ctx.lineTo(e[0] - size * 0.95, e[1] + size * 3.1); ctx.closePath();
        ctx.fillStyle = '#2a2018'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#a8802e'; ctx.stroke();
      });
      ctx.restore();
    }
    if (S.bw) { ctx.save(); ctx.globalAlpha = a; B.drawChain(ctx, S.bw[0], S.t, S.bt); B.drawChain(ctx, S.bw[1], S.t, S.bt); ctx.restore(); }
  }
  var HP_ = Math.PI / 2;
  function onFrame(dt) {
    if (!S.on && S.a <= 0.01 && S.veil <= 0.01 && !S.anim) return;
    var sdt = Math.min(dt, 0.05) * Math.min(G.speed || 1, 4);
    S.t += sdt; S.pop = Math.max(0, S.pop - sdt * 2.2); if (S.beam) S.bt += sdt;
    if (S.anim && !S.anim.done) { for (var q = sdt; q > 0; q -= 1 / 60) S.anim.update(Math.min(q, 1 / 60)); }
    if (S.anim && S.anim.done) S.anim = null;
    var ctx = G.ctx, so = FX.shakeOffset();
    ctx.save(); ctx.translate(so[0], so[1]);
    draw(ctx);
    if (S.chain && Chains && !red()) { ctx.save(); ctx.globalAlpha = S.a; Chains.draw(ctx, S.chain, S.t, { still: true, shadow: 2, dpr: G.dpr }); ctx.restore(); }
    if (S.anim) S.anim.draw(ctx, G.dpr);
    if (!red() && S.on) { try { drawBind(ctx); } catch (e) {} }
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
      var size = clamp(g.h * 0.15, 10, 20), yT = g.y - g.h / 2 - size * 0.3, yB = g.y + g.h / 2 + size * 0.3, spd = Math.max(1, G.speed);
      sfx('runes');
      await G.tween(0.3, function (u) { if (alive(id)) { S.a = u; S.veil = u * 0.7; } }, null);
      if (!alive(id)) return;
      if (!B.ready()) { S.pop = 1; sfx('chime', 2); await G.sleep(0.6); if (!alive(id)) return; }
      else if (S.pact === 'safe') {
        // les chaînes viennent des deux bords, s'enroulent autour du cartouche (les maillons s'emboîtent un à un) et se verrouillent sous un cadenas
        S.pa = wrapPath(g, size, -1); S.pb = wrapPath(g, size, 1); S.pb.par = 1; S.head = 0; S.scatter = 1; S.lockK = 0;
        var len = S.pa.len, dur = 1.7, ck = 0;
        sfx('chainTense', dur / spd);
        await G.tween(dur, function (u) {
          if (!alive(id)) return; S.head = len * (u < 1 ? G.ease.inOut(u) * 0.9 + u * 0.1 : 1);
          ck += 0.5; if (ck >= 6 && u < 0.97) { ck = 0; var e1 = B.pathPoint(S.pa, S.head); B.stress(e1.x, e1.y, 0.4, size); }
        }, null);
        if (!alive(id)) return;
        S.head = len + size; S.scatter = 0;
        await G.tween(0.26, function (u) { if (alive(id)) S.lockK = u; }, G.ease.outBack);
        if (!alive(id)) return;
        S.pop = 1; sfx('chainSlam'); FX.shake(6, 0.3); B.impact(g.x, yB, 0.4, { size: size * 0.9, links: 0 });
      } else if (S.pact === 'bold') {
        // deux chaînes tendues d'un bord à l'autre le long du cartouche : elles vibrent, cèdent et fouettent — la Colère se déchaîne
        S.bw = [B.chain(-size * 2, yT, G.w + size * 2, yT, size, { sag: 0.02 }), B.chain(-size * 2, yB, G.w + size * 2, yB, size, { sag: 0.02, par: 1 })]; S.bt = 0.5;
        sfx('chainTense', 0.7 / spd); sfx('drum', 0.3); var sk = 0;
        await G.tween(0.7, function (u) { if (!alive(id)) return; S.shk = u; S.bt = 0.5 + 0.5 * u; sk += u; if (sk >= 3) { sk = 0; B.stress(g.x + (Math.random() - 0.5) * g.w, Math.random() < 0.5 ? yT : yB, u, size); } }, null);
        if (!alive(id)) return;
        S.shk = 0; S.pop = 1; var bw = S.bw; S.bw = null;
        B.slow(0.6, 0.2);
        B.snap(bw[0], { power: 1.1, at: 0.35 + Math.random() * 0.3, tens: 1 }); B.snap(bw[1], { power: 1.1, at: 0.35 + Math.random() * 0.3, tens: 1 });
        B.ring(g.x, g.y, Math.max(G.w, G.h) * 0.55, 5, 0.8, '#d9b857', 0, 0.04);
        sfx('chainBreak'); sfx('thunder'); FX.flash(0.3, '#efdfa8'); FX.shake(18, 0.6);
      } else {
        // une chaîne en équilibre : elle bascule autour de son pivot, oscille, se stabilise à l'horizontale (le jugement classique)
        S.beam = B.chain(g.x - g.w / 2, yB, g.x + g.w / 2, yB, size, { sag: 0 }); S.bt = 0;
        sfx('chime', 2);
        await G.sleep(1.0); if (!alive(id)) return;
        S.pop = 1; sfx('chime', 3); FX.ring(g.x, yB, '#cfa94c', g.w * 0.45, 0.6); B.impact(g.x, yB, 0.25, { size: size * 0.8, links: 0 });
      }
      await G.sleep(1.0); if (!alive(id)) return;
      await G.tween(0.4, function (u) { if (alive(id)) { S.a = 1 - u; S.veil = 0.7 * (1 - u); } }, null);
      if (alive(id)) Pf.reset();
    },
    reset: function () { S.id++; S.on = false; S.a = 0; S.veil = 0; S.chain = null; S.anim = null; S.shk = 0; S.pop = 0; S.pa = S.pb = S.beam = S.bw = null; S.head = 0; S.lockK = 0; S.scatter = 0; }
  };
})(window);
