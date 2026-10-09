/* HAND OF ANUBIS — particules, secousses, flashs, compteurs. */
(function (root) {
  'use strict';
  var TAU = Math.PI * 2;
  var parts = [];
  var shake = { t: 0, mag: 0 };
  var flash = { a: 0, color: '#fff1b8' };
  var floaters = [];

  var FX = {
    parts: parts,
    reduced: false,
    lite: false,
    spark: function (x, y, n, color, spd, life) {
      if (FX.lite) n = Math.ceil(n * 0.45);
      for (var i = 0; i < n; i++) {
        var a = Math.random() * TAU, v = (0.3 + Math.random()) * (spd || 260);
        parts.push({ k: 'spark', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 120, life: (life || 0.9) * (0.6 + Math.random() * 0.8), t: 0, s: 1.5 + Math.random() * 2.5, c: color || '#ffd86a' });
      }
    },
    coins: function (x, y, n, power, spreadX) {
      if (FX.lite) n = Math.ceil(n * 0.45);
      for (var i = 0; i < n; i++) {
        var a = -Math.PI / 2 + (Math.random() - 0.5) * 1.5, v = (0.55 + Math.random() * 0.7) * (power || 700);
        parts.push({ k: 'coin', x: x + (Math.random() - 0.5) * (spreadX || 40), y: y, vx: Math.cos(a) * v * 0.55, vy: Math.sin(a) * v, g: 1500, life: 2.2 + Math.random() * 0.8, t: 0, s: 7 + Math.random() * 6, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 14, bounce: 0.45 });
      }
    },
    rain: function (w, n) { // pluie d'or depuis le haut
      if (FX.lite) n = Math.ceil(n * 0.45);
      for (var i = 0; i < n; i++) {
        parts.push({ k: 'coin', x: Math.random() * w, y: -20 - Math.random() * 200, vx: (Math.random() - 0.5) * 80, vy: 200 + Math.random() * 300, g: 700, life: 3.5 + Math.random() * 1.5, t: 0, s: 6 + Math.random() * 7, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 12, bounce: 0.35 });
      }
    },
    dust: function (x, y, n, color) {
      if (FX.lite) n = Math.ceil(n * 0.45);
      for (var i = 0; i < n; i++) parts.push({ k: 'dust', x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 12, vx: (Math.random() - 0.5) * 90, vy: -Math.random() * 60, g: -10, life: 0.9 + Math.random() * 0.6, t: 0, s: 6 + Math.random() * 10, c: color || '#caa45f' });
    },
    ring: function (x, y, color, maxR, life) { parts.push({ k: 'ring', x: x, y: y, life: life || 0.8, t: 0, r: maxR || 200, c: color || '#ffd86a' }); },
    shake: function (mag, dur) { if (FX.reduced) mag *= 0.3; shake.mag = Math.max(shake.mag, mag); shake.t = Math.max(shake.t, dur || 0.4); shake.d = shake.t; },
    flash: function (a, color) { flash.a = Math.max(flash.a, FX.reduced ? a * 0.4 : a); flash.color = color || '#fff1b8'; },
    float: function (text, x, y, color, size) { floaters.push({ text: text, x: x, y: y, t: 0, life: 1.3, color: color || '#ffe9a0', size: size || 28 }); },

    update: function (dt) {
      var i, p;
      for (i = parts.length - 1; i >= 0; i--) {
        p = parts[i]; p.t += dt;
        if (p.t >= p.life) { parts.splice(i, 1); continue; }
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
        } else if (p.k === 'ring') {
          ctx.globalAlpha = Math.max(0, a); ctx.strokeStyle = p.c; ctx.lineWidth = 2 + 8 * a;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 - a * a), 0, TAU); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      for (i = 0; i < floaters.length; i++) {
        var f = floaters[i], q = f.t / f.life;
        ctx.globalAlpha = q < 0.7 ? 1 : 1 - (q - 0.7) / 0.3;
        ctx.font = '800 ' + f.size + 'px Cinzel, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
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
