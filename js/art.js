/* ANUBIS UNCHAINED — direction artistique procédurale.
 * Aucune image externe : tout est tracé en canvas (net à toutes les densités, 0 Ko d'assets, bundle Stake léger).
 * Palette : obsidienne, or massif, lapis-lazuli, turquoise, cornaline, améthyste. */
(function (root) {
  'use strict';
  var TAU = Math.PI * 2;

  // palette « Égypte antique sombre » : noir obsidienne, or PATINÉ (jamais de jaune vif), lapis-lazuli, turquoise ; cornaline / améthyste / émeraude
  // sont des accents sourds (pierres de joaillerie), pas des couleurs d'interface
  var C = {
    ink: '#0b0907', obsid: '#14100c', obsid2: '#1d1710', basalt: '#2a2118',
    gold: '#cfa94c', goldHi: '#efdfa8', goldLo: '#7c6122', goldDeep: '#4f3a12',
    sand: '#bfa267', lapis: '#274f9e', lapisHi: '#5b84d0', turq: '#1fa596', turqHi: '#6cd8c6',
    carn: '#ab3f2e', carnHi: '#d9735a', amet: '#5e4a82', ametHi: '#a08cc8', emer: '#2f8a63', emerHi: '#74c9a0',
    white: '#f4ecd6'
  };

  // or patiné : bandes dures claire / médiane / sombre / médiane / claire (métal brossé, pas de dégradé lisse « plastique »)
  function goldGrad(ctx, x0, y0, x1, y1) {
    var g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, C.goldHi); g.addColorStop(0.16, C.gold); g.addColorStop(0.46, C.gold); g.addColorStop(0.5, C.goldLo);
    g.addColorStop(0.72, C.goldLo); g.addColorStop(0.76, C.gold); g.addColorStop(0.92, C.gold); g.addColorStop(1, C.goldHi);
    return g;
  }
  // grain de métal martelé : traits brossés, piqûres, vert-de-gris (tuile 128 px tracée une fois, graine fixe : même rendu partout)
  var grain = null;
  function grainPat(ctx) {
    if (!grain) {
      var c = document.createElement('canvas'), x, s = 7, i; c.width = c.height = 128; x = c.getContext('2d');
      var r = function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (i = 0; i < 1100; i++) { x.fillStyle = r() < 0.5 ? 'rgba(255,238,170,' + (0.05 + r() * 0.12) + ')' : 'rgba(36,22,4,' + (0.07 + r() * 0.15) + ')'; x.fillRect(r() * 128, r() * 128, 2 + r() * 14, 1); }
      for (i = 0; i < 300; i++) { x.fillStyle = 'rgba(28,20,6,' + (0.06 + r() * 0.14) + ')'; x.beginPath(); x.arc(r() * 128, r() * 128, 0.5 + r() * 1.7, 0, TAU); x.fill(); }
      for (i = 0; i < 46; i++) { x.fillStyle = 'rgba(52,118,96,' + (0.05 + r() * 0.09) + ')'; x.beginPath(); x.arc(r() * 128, r() * 128, 1 + r() * 3.2, 0, TAU); x.fill(); }
      grain = c;
    }
    return ctx.createPattern(grain, 'repeat');
  }
  // remplit le tracé courant en or patiné : bandes dures dans le sens x0,y0 → x1,y1 (à poser en travers de la pièce) + grain + arête haute claire
  function fillMetal(ctx, x0, y0, x1, y1, rule) {
    ctx.fillStyle = goldGrad(ctx, x0, y0, x1, y1); ctx.fill(rule);
    ctx.save(); ctx.clip(rule); ctx.fillStyle = grainPat(ctx); ctx.fillRect(-9999, -9999, 19998, 19998); ctx.restore();
  }
  // pierre : basalte grenu (éclats clairs, piqûres sombres, fines fissures), tuile 96 px à graine fixe ; se pose en voile sur un aplat de pierre
  var stone = null;
  function stonePat(ctx) {
    if (!stone) {
      var c = document.createElement('canvas'), x, s = 11, i; c.width = c.height = 96; x = c.getContext('2d');
      var r = function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (i = 0; i < 520; i++) { x.fillStyle = r() < 0.5 ? 'rgba(191,162,103,' + (0.05 + r() * 0.1) + ')' : 'rgba(11,9,7,' + (0.12 + r() * 0.2) + ')'; x.fillRect(r() * 96, r() * 96, 1 + r() * 3, 1 + r() * 2); }
      x.lineWidth = 1; for (i = 0; i < 7; i++) { x.strokeStyle = 'rgba(11,9,7,' + (0.25 + r() * 0.2) + ')'; x.beginPath(); var px = r() * 96, py = r() * 96; x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 26, py + (r() - 0.5) * 26); x.lineTo(px + (r() - 0.5) * 40, py + (r() - 0.5) * 40); x.stroke(); }
      stone = c;
    }
    return ctx.createPattern(stone, 'repeat');
  }
  function rgba(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function mix(h1, h2, t) {
    var a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
    var r = Math.round((a >> 16) * (1 - t) + (b >> 16) * t), g = Math.round(((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t), bl = Math.round((a & 255) * (1 - t) + (b & 255) * t);
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }

  /* ---------- glyphes (centrés en 0,0, taille ≈ s) ---------- */
  function ankh(ctx, x, y, s, fill, stroke) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24);
    ctx.beginPath();
    ctx.ellipse(0, -8, 5.6, 7.4, 0, 0, TAU);
    ctx.moveTo(0, -0.4); ctx.lineTo(0, 0);
    ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = fill; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -0.6); ctx.lineTo(0, 15); ctx.moveTo(-8, 4.8); ctx.lineTo(8, 4.8); ctx.stroke();
    if (stroke) { ctx.lineWidth = 0.9; ctx.strokeStyle = stroke; ctx.beginPath(); ctx.ellipse(0, -8, 5.6, 7.4, 0, 0, TAU); ctx.stroke(); }
    ctx.restore();
  }
  function eye(ctx, x, y, w, color, pupil) {
    ctx.save(); ctx.translate(x, y); var k = w / 48; ctx.scale(k, k);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(-22, 2); ctx.quadraticCurveTo(-4, -16, 22, -2); ctx.quadraticCurveTo(4, 12, -22, 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(2, -1, 5.6, 0, TAU); ctx.fillStyle = pupil || color; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-22, 2); ctx.lineTo(-27, 8); ctx.moveTo(10, 8); ctx.quadraticCurveTo(10, 16, 4, 20); ctx.moveTo(10, 9); ctx.lineTo(18, 16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-20, -6); ctx.quadraticCurveTo(-4, -22, 24, -9); ctx.stroke();
    ctx.restore();
  }
  function scarab(ctx, x, y, s, color, hi) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24);
    ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 1.7; ctx.lineCap = 'round';
    // pattes
    [[-1, -4, -11, -9], [-1, 0, -12, 0], [-1, 4, -11, 9], [1, -4, 11, -9], [1, 0, 12, 0], [1, 4, 11, 9]].forEach(function (l) {
      ctx.beginPath(); ctx.moveTo(l[0] * 6, l[1]); ctx.lineTo(l[2], l[3]); ctx.stroke();
    });
    // élytres
    ctx.beginPath(); ctx.ellipse(0, 2, 7.6, 9.6, 0, 0, TAU); ctx.fill();
    // tête
    ctx.beginPath(); ctx.ellipse(0, -9, 4.6, 3.2, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-3, -11); ctx.lineTo(-5, -14); ctx.moveTo(3, -11); ctx.lineTo(5, -14); ctx.stroke();
    ctx.strokeStyle = hi || 'rgba(0,0,0,.45)'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, 11.6); ctx.moveTo(-4.4, 0); ctx.quadraticCurveTo(0, -3, 4.4, 0); ctx.stroke();
    ctx.restore();
  }
  function feather(ctx, x, y, h, color, hi) {
    ctx.save(); ctx.translate(x, y); var k = h / 40; ctx.scale(k, k);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, -20);
    ctx.bezierCurveTo(11, -12, 11, 8, 3, 14); ctx.lineTo(0, 20); ctx.lineTo(-3, 14);
    ctx.bezierCurveTo(-11, 8, -11, -12, 0, -20); ctx.fill();
    ctx.strokeStyle = hi || 'rgba(0,0,0,.5)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, -17); ctx.lineTo(0, 20); ctx.stroke();
    ctx.lineWidth = 1;
    for (var i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * 4 + 2); ctx.lineTo(-6 + Math.abs(i) * 0.6, i * 4 - 2); ctx.moveTo(0, i * 4 + 2); ctx.lineTo(6 - Math.abs(i) * 0.6, i * 4 - 2); ctx.stroke();
    }
    ctx.restore();
  }
  function pyramid(ctx, x, y, s, color, hi) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(13, 10); ctx.lineTo(-13, 10); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = hi || 'rgba(0,0,0,.5)'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(3, 10); ctx.moveTo(-8, 2); ctx.lineTo(8, 2); ctx.moveTo(-4, -5); ctx.lineTo(4, -5); ctx.stroke();
    ctx.restore();
  }
  function skullX(ctx, x, y, s, color) { // « poussière » : disque solaire éteint
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24);
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.stroke();
    for (var i = 0; i < 8; i++) { var a = i * TAU / 8 + 0.2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 10, Math.sin(a) * 10); ctx.lineTo(Math.cos(a) * 13, Math.sin(a) * 13); ctx.stroke(); }
    ctx.restore();
  }
  function cobra(ctx, x, y, s, color, hi) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -13); ctx.bezierCurveTo(6, -13, 7, -6, 5, -3);
    ctx.bezierCurveTo(11, -1, 12, 7, 6, 11); ctx.bezierCurveTo(2, 14, -6, 14, -8, 10);
    ctx.bezierCurveTo(-10, 6, -4, 5, -2, 7); ctx.bezierCurveTo(1, 9, 3, 6, -1, 3);
    ctx.bezierCurveTo(-6, 0, -6, -4, -5, -3); ctx.bezierCurveTo(-7, -6, -6, -13, 0, -13); ctx.fill();
    ctx.fillStyle = hi || '#000'; ctx.beginPath(); ctx.arc(-1.2, -8.5, 1.1, 0, TAU); ctx.fill();
    ctx.restore();
  }

  /* ---------- Anubis (vue de face, symétrique) ---------- */
  function mirrorPath(ctx, pts, cx, cy, s) {
    ctx.beginPath();
    var i, p;
    ctx.moveTo(cx + pts[0][0] * s, cy + pts[0][1] * s);
    for (i = 1; i < pts.length; i++) { p = pts[i]; ctx.lineTo(cx + p[0] * s, cy + p[1] * s); }
    for (i = pts.length - 1; i >= 0; i--) { p = pts[i]; ctx.lineTo(cx - p[0] * s, cy + p[1] * s); }
    ctx.closePath();
  }
  // s = demi-largeur de la tête en px ; (cx,cy) = centre du front
  function jackal(ctx, cx, cy, s, o) {
    o = o || {};
    var glow = o.glow == null ? 1 : o.glow;
    ctx.save();
    // nemes (coiffe rayée) — derrière
    var nemes = [[0.0, -0.78], [0.62, -0.62], [0.98, -0.1], [1.22, 0.95], [1.1, 1.75], [0.55, 1.9], [0.38, 1.1], [0.36, 0.6]];
    mirrorPath(ctx, nemes, cx, cy, s);
    var gn = ctx.createLinearGradient(cx - s, cy, cx + s, cy + s * 1.5);
    gn.addColorStop(0, '#1a2b6e'); gn.addColorStop(0.5, '#2c4cb0'); gn.addColorStop(1, '#14204f');
    ctx.fillStyle = o.nemesColor || gn; ctx.fill();
    ctx.lineWidth = Math.max(1, s * 0.03); ctx.strokeStyle = goldGrad(ctx, cx - s, cy, cx + s, cy + s); ctx.stroke();
    // rayures dorées
    ctx.save(); mirrorPath(ctx, nemes, cx, cy, s); ctx.clip();
    ctx.strokeStyle = rgba(C.gold, 0.55); ctx.lineWidth = Math.max(1, s * 0.022);
    for (var side = -1; side <= 1; side += 2) {
      for (var i = 0; i < 9; i++) {
        var yy = cy + s * (0.1 + i * 0.2);
        ctx.beginPath(); ctx.moveTo(cx + side * s * 0.36, yy); ctx.lineTo(cx + side * s * (1.2 + i * 0.01), yy + s * 0.12); ctx.stroke();
      }
    }
    ctx.restore();
    // oreilles
    var ear = [[0.26, -0.7], [0.56, -1.55], [0.84, -0.42], [0.74, -0.1]];
    mirrorPath(ctx, ear, cx, cy, s);
    var ge = ctx.createLinearGradient(cx, cy - s * 1.5, cx, cy);
    ge.addColorStop(0, '#2b2b33'); ge.addColorStop(1, '#0c0c10');
    ctx.fillStyle = ge; ctx.fill(); ctx.strokeStyle = goldGrad(ctx, cx - s, cy - s, cx + s, cy); ctx.lineWidth = Math.max(1, s * 0.03); ctx.stroke();
    var earIn = [[0.34, -0.72], [0.56, -1.3], [0.7, -0.5]];
    mirrorPath(ctx, earIn, cx, cy, s); ctx.fillStyle = rgba(C.gold, 0.5); ctx.fill();
    // tête
    var head = [[0.0, -0.72], [0.34, -0.66], [0.66, -0.2], [0.58, 0.28], [0.34, 0.62], [0.27, 1.08], [0.17, 1.28], [0.0, 1.3]];
    mirrorPath(ctx, head, cx, cy, s);
    var gh = ctx.createLinearGradient(cx - s * 0.6, cy - s * 0.7, cx + s * 0.6, cy + s * 1.3);
    gh.addColorStop(0, '#34343d'); gh.addColorStop(0.5, '#16161b'); gh.addColorStop(1, '#08080b');
    ctx.fillStyle = gh; ctx.fill(); ctx.strokeStyle = goldGrad(ctx, cx - s, cy, cx + s, cy + s); ctx.lineWidth = Math.max(1, s * 0.035); ctx.stroke();
    // reflet de chanfrein
    ctx.beginPath(); ctx.moveTo(cx - s * 0.06, cy - s * 0.6); ctx.lineTo(cx - s * 0.2, cy + s * 1.15);
    ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = s * 0.05; ctx.stroke();
    // truffe
    ctx.beginPath(); ctx.ellipse(cx, cy + s * 1.22, s * 0.15, s * 0.09, 0, 0, TAU); ctx.fillStyle = '#000'; ctx.fill();
    // yeux fardés
    [-1, 1].forEach(function (sd) {
      var ex = cx + sd * s * 0.31, ey = cy + s * 0.12;
      ctx.beginPath(); ctx.moveTo(ex - sd * s * 0.2, ey - s * 0.02);
      ctx.quadraticCurveTo(ex, ey - s * 0.17, ex + sd * s * 0.24, ey - s * 0.08);
      ctx.quadraticCurveTo(ex + sd * s * 0.06, ey + s * 0.1, ex - sd * s * 0.2, ey - s * 0.02); ctx.closePath();
      ctx.fillStyle = '#060606'; ctx.fill();
      // iris lumineux
      if (glow > 0) {
        var gr = ctx.createRadialGradient(ex, ey - s * 0.02, 0, ex, ey - s * 0.02, s * 0.2);
        gr.addColorStop(0, rgba('#ffffff', glow)); gr.addColorStop(0.25, rgba(C.turqHi, glow)); gr.addColorStop(1, rgba(C.turq, 0));
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(ex, ey - s * 0.02, s * 0.2, 0, TAU); ctx.fill();
      }
      ctx.beginPath(); ctx.moveTo(ex + sd * s * 0.22, ey - s * 0.08); ctx.lineTo(ex + sd * s * 0.5, ey + s * 0.02);
      ctx.strokeStyle = '#000'; ctx.lineWidth = s * 0.05; ctx.stroke();
    });
    // front : uraeus / disque d'or
    ctx.beginPath(); ctx.arc(cx, cy - s * 0.52, s * 0.1, 0, TAU); ctx.fillStyle = goldGrad(ctx, cx - s * 0.1, cy - s * 0.6, cx + s * 0.1, cy - s * 0.4); ctx.fill();
    // collier usekh
    for (var r = 0; r < 4; r++) {
      ctx.beginPath(); ctx.ellipse(cx, cy + s * (1.5 + r * 0.1), s * (0.78 - r * 0.02), s * (0.3 + r * 0.02), 0, 0.05, Math.PI - 0.05);
      ctx.strokeStyle = r % 2 ? C.lapisHi : goldGrad(ctx, cx - s, cy, cx + s, cy); ctx.lineWidth = s * 0.07; ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------- Fureur d'Anubis (géante, paume vers le bas) ---------- */
  function hand(ctx, cx, cy, s, o) {
    o = o || {};
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s / 100, s / 100);
    var g = goldGrad(ctx, -60, -80, 60, 90);
    ctx.fillStyle = g; ctx.strokeStyle = C.goldDeep; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // manche + manchette lapis
    ctx.beginPath(); ctx.rect(-30, -170, 60, 90); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.lapis; ctx.fillRect(-32, -118, 64, 14); ctx.fillStyle = C.gold; ctx.fillRect(-32, -104, 64, 4); ctx.fillStyle = g;
    // paume
    ctx.beginPath(); ctx.moveTo(-36, -84); ctx.lineTo(36, -84); ctx.quadraticCurveTo(54, -34, 50, 12); ctx.lineTo(-50, 12); ctx.quadraticCurveTo(-54, -34, -36, -84); ctx.closePath(); ctx.fill(); ctx.stroke();
    // doigts épais, légèrement évasés
    [[-50, 12, 24, 66, -0.05], [-24, 12, 24, 86, -0.015], [2, 12, 24, 78, 0.015], [28, 12, 22, 60, 0.05]].forEach(function (f) {
      ctx.save(); ctx.translate(f[0] + f[2] / 2, f[1]); ctx.rotate(f[4]);
      ctx.beginPath(); ctx.moveTo(-f[2] / 2, 0); ctx.lineTo(f[2] / 2, 0); ctx.lineTo(f[2] / 2 - 1, f[3] - f[2] / 2); ctx.arc(0, f[3] - f[2] / 2, f[2] / 2 - 1, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(70,45,5,.5)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-f[2] / 2 + 3, f[3] * 0.4); ctx.lineTo(f[2] / 2 - 3, f[3] * 0.4); ctx.moveTo(-f[2] / 2 + 3, f[3] * 0.72); ctx.lineTo(f[2] / 2 - 3, f[3] * 0.72); ctx.stroke();
      ctx.restore(); ctx.strokeStyle = C.goldDeep; ctx.lineWidth = 2.4;
    });
    // pouce
    ctx.beginPath(); ctx.moveTo(-50, -20); ctx.bezierCurveTo(-78, -14, -94, 10, -90, 40); ctx.quadraticCurveTo(-84, 52, -74, 44); ctx.bezierCurveTo(-68, 22, -62, 8, -48, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    // œil d'Anubis sur la paume
    eye(ctx, 0, -36, 62, C.goldDeep, C.carn);
    ctx.restore();
  }

  function skull(ctx, x, y, s, color, dark) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(-9, 2); ctx.bezierCurveTo(-11, -14, 11, -14, 9, 2); ctx.lineTo(6, 6); ctx.lineTo(6, 11); ctx.lineTo(-6, 11); ctx.lineTo(-6, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = dark || '#000';
    ctx.beginPath(); ctx.ellipse(-4, 0, 3, 3.6, 0, 0, TAU); ctx.ellipse(4, 0, 3, 3.6, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 3.5); ctx.lineTo(-1.6, 7); ctx.lineTo(1.6, 7); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = dark || '#000'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-3, 11); ctx.lineTo(-3, 8); ctx.moveTo(0, 11); ctx.lineTo(0, 8); ctx.moveTo(3, 11); ctx.lineTo(3, 8); ctx.stroke();
    ctx.restore();
  }

  /* ---------- frises de hiéroglyphes (décor) ---------- */
  var GLYPHS = [ankh, function (c, x, y, s, col) { eye(c, x, y, s * 1.2, col); }, scarab, feather, pyramid];
  function glyphStrip(ctx, x, y, w, h, color, seed) {
    var n = Math.max(2, Math.floor(h / (w * 1.25))), step = h / n, i;
    ctx.save(); ctx.globalAlpha *= 0.85;
    for (i = 0; i < n; i++) {
      var gi = Math.floor((Math.sin(seed * 91 + i * 12.9898) * 43758.5453 % 1 + 1) * 5) % 5;
      var gy = y + step * (i + 0.5);
      GLYPHS[gi](ctx, x + w / 2, gy, w * 0.62, color);
    }
    ctx.restore();
  }

  function glyphRow(ctx, x, y, w, h, color, seed) {
    var n = Math.max(3, Math.floor(w / (h * 1.5))), step = w / n, i;
    for (i = 0; i < n; i++) {
      var gi = Math.floor((Math.sin(seed * 91 + i * 12.9898) * 43758.5453 % 1 + 1) * 5) % 5;
      GLYPHS[gi](ctx, x + step * (i + 0.5), y + h / 2, h * 0.62, color);
    }
  }
  function noiseTile(size, alpha) {
    var c = document.createElement('canvas'); c.width = c.height = size; var x = c.getContext('2d'), d = x.createImageData(size, size);
    for (var i = 0; i < d.data.length; i += 4) { var v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = alpha * 255; }
    x.putImageData(d, 0, 0); return c;
  }

  /* ---------- étoile de lumière ---------- */
  function rays(ctx, cx, cy, r, n, rot, color, alpha) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.globalAlpha = alpha; ctx.fillStyle = color;
    for (var i = 0; i < n; i++) {
      var a = i * TAU / n;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a, a + TAU / n * 0.38); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  root.Art = {
    C: C, TAU: TAU, goldGrad: goldGrad, fillMetal: fillMetal, stonePat: stonePat, rgba: rgba, mix: mix,
    ankh: ankh, eye: eye, scarab: scarab, feather: feather, pyramid: pyramid, skullX: skullX, cobra: cobra, skull: skull,
    jackal: jackal, hand: hand, glyphStrip: glyphStrip, glyphRow: glyphRow, noiseTile: noiseTile, rays: rays, roundRect: roundRect
  };
})(window);
