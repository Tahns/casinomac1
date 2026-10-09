/* HAND OF ANUBIS — audio 100 % synthétisé (WebAudio) : zéro fichier, zéro droit à gérer. */
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
    startAmbient: function () {
      if (!ensure() || ambNodes) return;
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o1.type = 'sawtooth'; o2.type = 'sawtooth'; o1.frequency.value = 82.4; o2.frequency.value = 82.9; lfo.frequency.value = 0.12; lg.gain.value = 260;
      f.type = 'lowpass'; f.frequency.value = 520; lfo.connect(lg); lg.connect(f.frequency);
      g.gain.value = 0; g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 3);
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(musBus); o1.start(); o2.start(); lfo.start();
      ambNodes = { o1: o1, o2: o2, lfo: lfo, g: g };
    },
    stopAmbient: function () {
      if (!ambNodes) return; var n = ambNodes; ambNodes = null;
      n.g.gain.cancelScheduledValues(ctx.currentTime); n.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      setTimeout(function () { try { n.o1.stop(); n.o2.stop(); n.lfo.stop(); } catch (e) {} }, 700);
    },
    setMuted: function (m) { muted = m; if (master) master.gain.value = m ? 0 : 0.85; },
    isMuted: function () { return muted; }
  };
  root.Sfx = A;
})(window);
