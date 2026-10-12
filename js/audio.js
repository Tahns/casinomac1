/* ANUBIS UNCHAINED — audio 100 % synthétisé (WebAudio) : zéro fichier, zéro droit à gérer. */
(function (root) {
  'use strict';
  var ctx = null, master, sfxBus, musBus, verb, muted = false, ambNodes = null;
  // gamme phrygienne dominante (couleur « orientale ») : E F G# A B C D
  var SCALE = [164.81, 174.61, 207.65, 220, 246.94, 261.63, 293.66];

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.85;
    var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master);
    musBus = ctx.createGain(); musBus.gain.value = 0.5; musBus.connect(master);
    // réverbération : bruit décroissant
    var len = ctx.sampleRate * 1.8, imp = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = imp.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    verb = ctx.createConvolver(); verb.buffer = imp;
    var vg = ctx.createGain(); vg.gain.value = 0.32; verb.connect(vg); vg.connect(master);
    return ctx;
  }

  function tone(f, dur, type, vol, delay, glide, wet, bus) {
    if (!ensure()) return;
    var t = ctx.currentTime + (delay || 0), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, glide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus || sfxBus); if (wet) g.connect(verb);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, delay, freq, type, endFreq) {
    if (!ensure()) return;
    var t = ctx.currentTime + (delay || 0), n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = ctx.createBufferSource(); s.buffer = buf;
    var f = ctx.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.setValueAtTime(freq || 1500, t);
    if (endFreq) f.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    var g = ctx.createGain(); g.gain.setValueAtTime(vol || 0.1, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t);
  }

  var A = {
    unlock: ensure,
    tick: function (speed) { tone(1500 + (speed || 0) * 700, 0.04, 'square', 0.035); tone(520, 0.05, 'triangle', 0.05); },
    click: function () { tone(740, 0.05, 'triangle', 0.08); tone(1110, 0.06, 'sine', 0.05, 0.03); },
    whoosh: function () { noise(1.1, 0.14, 0, 300, 'bandpass', 3200); },
    drum: function (v) { tone(95, 0.35, 'sine', v || 0.34, 0, 42); noise(0.2, (v || 0.34) * 0.4, 0, 400); },
    thud: function () { tone(60, 0.6, 'sine', 0.5, 0, 30); noise(0.5, 0.25, 0, 260); },
    roll: function (n, step) { step = step || 0.09; for (var i = 0; i < n; i++) { tone(100, 0.12, 'sine', 0.1 + i * 0.015, i * step, 60); noise(0.08, 0.04 + i * 0.01, i * step, 500); } },
    coin: function (p) { var f = 1250 * (p || 1); tone(f, 0.09, 'triangle', 0.1); tone(f * 1.5, 0.16, 'triangle', 0.07, 0.05, null, true); },
    reveal: function () { tone(660, 0.1, 'sine', 0.1, 0, null, true); tone(990, 0.16, 'sine', 0.08, 0.07, null, true); },
    sparkle: function () { for (var i = 0; i < 5; i++) tone(1800 + Math.random() * 2400, 0.12, 'sine', 0.04, i * 0.04, null, true); },
    oracle: function () { [0, 2, 4, 6].forEach(function (k, i) { tone(SCALE[k] * 4, 0.5, 'sine', 0.09, i * 0.11, null, true); }); tone(80, 0.8, 'sine', 0.25, 0, 50); },
    bonus: function () {
      noise(1.4, 0.2, 0, 200, 'lowpass', 4000);
      [0, 2, 3, 4, 5, 6].forEach(function (k, i) { tone(SCALE[k] * 2, 0.7, 'sawtooth', 0.05, 0.1 + i * 0.1, null, true); tone(SCALE[k], 0.9, 'sine', 0.12, 0.1 + i * 0.1, null, true); });
      A.thud();
    },
    curse: function () { tone(180, 0.9, 'sawtooth', 0.14, 0, 40, true); tone(135, 0.9, 'square', 0.08, 0.05, 30); noise(0.6, 0.15, 0, 900, 'lowpass', 120); },
    shield: function () { tone(520, 0.3, 'triangle', 0.1, 0, 1040, true); tone(780, 0.4, 'sine', 0.08, 0.1, null, true); },
    lightning: function () { noise(0.35, 0.34, 0, 5000, 'highpass'); tone(2400, 0.16, 'sawtooth', 0.07, 0, 300); A.thud(); },
    chime: function (mult) {
      var n = Math.min(7, 2 + Math.floor(Math.log(Math.max(1, mult) + 1) * 1.5));
      for (var i = 0; i < n; i++) { var f = SCALE[(i * 2) % 7] * (i > 3 ? 4 : 2); tone(f, 0.8, 'sine', 0.13, i * 0.09, null, true); tone(f * 2, 0.5, 'triangle', 0.05, i * 0.09 + 0.02, null, true); }
      if (mult >= 15) { A.thud(); }
    },
    fanfare: function (tier) {
      var seq = [0, 2, 4, 5, 6, 4, 6, 5];
      var n = 4 + tier * 2;
      for (var i = 0; i < n; i++) { var f = SCALE[seq[i % seq.length]] * 4; tone(f, 0.38, 'sawtooth', 0.06, i * 0.12, null, true); tone(f / 2, 0.5, 'sine', 0.12, i * 0.12, null, true); }
      A.thud();
    },
    countTick: function (p) { tone(900 + p * 900, 0.03, 'square', 0.03); },
    // ambiance du temple : bourdon grave (ré, gamme phrygienne dominante), vent, cloches rares, battement sourd
    startAmbient: function () {
      if (!ensure() || ambNodes) return;
      var t0 = ctx.currentTime, nodes = [], g = ctx.createGain(), f = ctx.createBiquadFilter(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      f.type = 'lowpass'; f.frequency.value = 420; lfo.frequency.value = 0.07; lg.gain.value = 220; lfo.connect(lg); lg.connect(f.frequency);
      g.gain.value = 0; g.gain.linearRampToValueAtTime(0.07, t0 + 4);
      [[73.4, 'sawtooth'], [73.9, 'sawtooth'], [110.2, 'triangle'], [36.7, 'sine']].forEach(function (p, i) {
        var o = ctx.createOscillator(), og = ctx.createGain(); o.type = p[1]; o.frequency.value = p[0]; og.gain.value = i === 3 ? 1.6 : i === 2 ? 0.5 : 0.8;
        o.connect(og); og.connect(f); o.start(); nodes.push(o);
      });
      f.connect(g); g.connect(musBus); lfo.start(); nodes.push(lfo);
      // vent : bruit filtré dont la fréquence respire
      var len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var ns = ctx.createBufferSource(); ns.buffer = buf; ns.loop = true;
      var bf = ctx.createBiquadFilter(), wg = ctx.createGain(), wl = ctx.createOscillator(), wlg = ctx.createGain();
      bf.type = 'bandpass'; bf.frequency.value = 520; bf.Q.value = 0.8; wg.gain.value = 0.035;
      wl.frequency.value = 0.09; wlg.gain.value = 260; wl.connect(wlg); wlg.connect(bf.frequency);
      ns.connect(bf); bf.connect(wg); wg.connect(musBus); ns.start(); wl.start(); nodes.push(ns, wl);
      ambNodes = { nodes: nodes, g: g, alive: true };
      // cloches et battements aléatoires
      var PHRYG = [293.66, 311.13, 369.99, 392.0, 440.0, 466.16, 523.25, 587.33];
      (function next() {
        if (!ambNodes || !ambNodes.alive) return;
        setTimeout(function () {
          if (!ambNodes || !ambNodes.alive) return;
          if (!muted) {
            var r = Math.random();
            if (r < 0.7) { var fq = PHRYG[Math.floor(Math.random() * PHRYG.length)] * (Math.random() < 0.4 ? 2 : 1); tone(fq, 2.4, 'sine', 0.035, 0, null, true, musBus); tone(fq * 2.01, 1.4, 'sine', 0.012, 0.01, null, true, musBus); }
            else { tone(55, 0.5, 'sine', 0.09, 0, 36, false, musBus); tone(55, 0.5, 'sine', 0.06, 0.28, 36, false, musBus); }
          }
          next();
        }, 4500 + Math.random() * 7000);
      })();
    },
    stopAmbient: function () {
      if (!ambNodes) return; var n = ambNodes; ambNodes = null; n.alive = false;
      n.g.gain.cancelScheduledValues(ctx.currentTime); n.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      setTimeout(function () { n.nodes.forEach(function (o) { try { o.stop(); } catch (e) {} }); }, 700);
    },
    // annonce « BONUS » : montée dramatique (souffle + arpège ascendant + accord final + coup grave)
    bonusReveal: function () {
      noise(1.6, 0.16, 0, 180, 'bandpass', 3800);
      tone(55, 1.8, 'sine', 0.2, 0, 110, true);
      [0, 2, 4, 5, 6, 4, 6].forEach(function (k, i) {
        var f = SCALE[k] * (i > 3 ? 4 : 2), t = 0.15 + i * 0.17;
        tone(f, 0.5, 'sawtooth', 0.045 + i * 0.004, t, null, true);
        tone(f / 2, 0.6, 'sine', 0.1, t, null, true);
      });
      var tf = 1.45;
      [0, 2, 4].forEach(function (k) { tone(SCALE[k] * 4, 1.4, 'sawtooth', 0.05, tf, null, true); tone(SCALE[k] * 2, 1.6, 'sine', 0.1, tf, null, true); });
      tone(SCALE[0], 1.8, 'sine', 0.3, tf, null, true);
      tone(70, 0.7, 'sine', 0.45, tf, 30); noise(0.5, 0.22, tf, 400);
      for (var i = 0; i < 6; i++) tone(2000 + Math.random() * 2600, 0.14, 'sine', 0.035, tf + 0.05 + i * 0.05, null, true);
    },
    // bouton LANCER LE BONUS : impact + souffle
    bonusLaunch: function () {
      tone(120, 0.7, 'sine', 0.55, 0, 28);
      tone(60, 0.9, 'sine', 0.4, 0, 30);
      noise(0.12, 0.3, 0, 6000, 'highpass');
      noise(1.3, 0.2, 0.04, 400, 'bandpass', 5200);
      tone(440, 0.8, 'sawtooth', 0.06, 0.05, 1760, true);
      [2, 4, 6].forEach(function (k, i) { tone(SCALE[k] * 4, 0.6, 'triangle', 0.07, 0.18 + i * 0.07, null, true); });
    },
    // pulsation douce (deux battements) pour le suspense ; s = intensité 0..1
    heartbeat: function (s) {
      s = s == null ? 0.5 : Math.max(0, Math.min(1, s));
      var v = 0.16 + s * 0.2;
      tone(58, 0.22, 'sine', v, 0, 38);
      tone(48, 0.26, 'sine', v * 0.7, 0.2, 34);
      noise(0.08, v * 0.2, 0, 220);
    },
    setMuted: function (m) { muted = m; if (master) master.gain.value = m ? 0 : 0.85; },
    isMuted: function () { return muted; }
  };
  root.Sfx = A;
})(window);
