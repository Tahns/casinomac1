/* ANUBIS UNCHAINED — audio 100 % synthétisé (WebAudio) : zéro fichier, zéro droit à gérer.
 * Palette : cloches FM (gains), nappes douces (annonces), impacts graves filtrés ; une ambiance « pad » très discrète.
 * Réglages joueur : hauteur globale (demi-tons), volume, ambiance on/off. */
(function (root) {
  'use strict';
  var ctx = null, master, sfxBus, musBus, verb, muted = false, ambNodes = null;
  var pitchSemi = 0, PK = 1, vol = 1, musicOn = true;
  // gamme phrygienne dominante (couleur « orientale ») : E F G# A B C D
  var SCALE = [164.81, 174.61, 207.65, 220, 246.94, 261.63, 293.66];
  // pentatonique douce (ré mineur) pour l'ambiance : D F G A C
  var PENTA = [146.83, 174.61, 196.0, 220.0, 261.63, 293.66, 349.23, 392.0, 440.0];

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.85 * vol;
    var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.25;
    master.connect(comp); comp.connect(ctx.destination);
    // adoucit les aigus durs de tous les effets
    var soft = ctx.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = 9500; soft.Q.value = 0.5; soft.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(soft);
    musBus = ctx.createGain(); musBus.gain.value = 0.5; musBus.connect(master);
    // réverbération : bruit décroissant, filtré pour rester chaud
    var len = ctx.sampleRate * 2.2, imp = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = imp.getChannelData(c), lp = 0; for (var i = 0; i < len; i++) { lp += ((Math.random() * 2 - 1) - lp) * 0.35; d[i] = lp * Math.pow(1 - i / len, 2.8); } }
    verb = ctx.createConvolver(); verb.buffer = imp;
    var vg = ctx.createGain(); vg.gain.value = 0.34; verb.connect(vg); vg.connect(master);
    return ctx;
  }

  // note simple (la hauteur globale PK s'applique à toutes les fréquences)
  function tone(f, dur, type, vol0, delay, glide, wet, bus) {
    if (!ensure()) return;
    var t = ctx.currentTime + (delay || 0), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f * PK, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, glide * PK), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol0 || 0.1, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus || sfxBus); if (wet) g.connect(verb);
    o.start(t); o.stop(t + dur + 0.05);
  }
  // cloche FM : porteuse + modulatrice dont l'indice retombe vite (timbre de glockenspiel / cloche de temple)
  function bell(f, dur, vol0, delay, wet, ratio, bus) {
    if (!ensure()) return;
    var t = ctx.currentTime + (delay || 0), c = ctx.createOscillator(), m = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
    c.type = 'sine'; m.type = 'sine'; c.frequency.value = f * PK; m.frequency.value = f * PK * (ratio || 3.51);
    mg.gain.setValueAtTime(f * PK * 1.4, t); mg.gain.exponentialRampToValueAtTime(Math.max(1, f * PK * 0.02), t + dur * 0.6);
    m.connect(mg); mg.connect(c.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol0 || 0.1, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    c.connect(g); g.connect(bus || sfxBus); if (wet !== false) g.connect(verb);
    c.start(t); m.start(t); c.stop(t + dur + 0.05); m.stop(t + dur + 0.05);
  }
  // nappe : accord aux attaques/relâchements lents (sinus + triangle légèrement désaccordés)
  function pad(freqs, dur, vol0, delay, attack, bus) {
    if (!ensure()) return;
    var t = ctx.currentTime + (delay || 0), a = attack || dur * 0.4;
    freqs.forEach(function (f, i) {
      [0, 1].forEach(function (k) {
        var o = ctx.createOscillator(), g = ctx.createGain(); o.type = k ? 'triangle' : 'sine'; o.frequency.value = f * PK * (k ? 1.003 : 1);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime((vol0 || 0.06) / (k ? 2.2 : 1) / Math.sqrt(freqs.length), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(bus || sfxBus); g.connect(verb); o.start(t); o.stop(t + dur + 0.05);
      });
    });
  }
  function noise(dur, vol0, delay, freq, type, endFreq, q) {
    if (!ensure()) return;
    var t = ctx.currentTime + (delay || 0), n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = ctx.createBufferSource(); s.buffer = buf;
    var f = ctx.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.setValueAtTime((freq || 1500) * PK, t); if (q) f.Q.value = q;
    if (endFreq) f.frequency.exponentialRampToValueAtTime(endFreq * PK, t + dur);
    var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol0 || 0.1, t + Math.min(0.03, dur * 0.2)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t);
  }
  // souffle montant (swoosh) : bruit passe-bande dont la fréquence grimpe, volume en cloche
  function swell(dur, vol0, delay, f0, f1) {
    if (!ensure()) return;
    var t = ctx.currentTime + (delay || 0), n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = ctx.createBufferSource(); s.buffer = buf; var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(f0 * PK, t); f.frequency.exponentialRampToValueAtTime(f1 * PK, t + dur);
    var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol0, t + dur * 0.85); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus); g.connect(verb); s.start(t);
  }
  // cor chaud : deux dents de scie désaccordées, filtre qui s'ouvre à l'attaque, léger vibrato
  function horn(f, dur, vol0, delay, wet) {
    if (!ensure()) return;
    var t = ctx.currentTime + (delay || 0), flt = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    flt.type = 'lowpass'; flt.Q.value = 1.1; flt.frequency.setValueAtTime(500 * PK, t); flt.frequency.exponentialRampToValueAtTime(Math.min(7000, f * PK * 6), t + Math.min(0.18, dur * 0.4)); flt.frequency.exponentialRampToValueAtTime(900 * PK, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol0 || 0.08, t + 0.05); g.gain.setValueAtTime(vol0 || 0.08, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    lfo.frequency.value = 5.5; lg.gain.value = f * PK * 0.006; lfo.connect(lg);
    [-5, 5].forEach(function (c) {
      var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * PK * Math.pow(2, c / 1200); lg.connect(o.frequency); o.connect(flt); o.start(t); o.stop(t + dur + 0.05);
    });
    lfo.start(t); lfo.stop(t + dur + 0.05);
    flt.connect(g); g.connect(sfxBus); if (wet !== false) g.connect(verb);
  }
  // gamme des gains : phrygienne dominante (mi fa sol# la si do ré), couleur égyptienne ; les phrases se résolvent sur la tonique (mi)
  var WIN = [329.63, 349.23, 415.3, 440.0, 493.88, 523.25, 587.33];
  function winNote(i, oct) { return WIN[((i % 7) + 7) % 7] * Math.pow(2, Math.floor(i / 7) + (oct || 0)); }
  var lastShower = 0;
  // impact grave : sinus qui plonge + claque filtrée
  function boom(vol0, delay) { tone(110, 0.8, 'sine', vol0, delay, 32); tone(55, 1.1, 'sine', vol0 * 0.8, delay, 28); noise(0.35, vol0 * 0.5, delay, 900, 'lowpass', 120); }

  var A = {
    unlock: ensure,
    tick: function (speed) { tone(1700 + (speed || 0) * 900, 0.03, 'triangle', 0.035); tone(620, 0.04, 'sine', 0.045); },
    click: function () { bell(880, 0.25, 0.07, 0, false); },
    whoosh: function () { swell(0.9, 0.16, 0, 300, 3600); },
    // lancement d'un tour : rythme de darbouka (dum-tak-tak-dum), sistre qui frémit, souffle qui monte, cloche de départ
    spinStart: function () {
      var i;
      function dum(t, v) { tone(105, 0.3, 'sine', v, t, 48); noise(0.12, v * 0.35, t, 420, 'lowpass', 150); }
      function tak(t, v) { noise(0.06, v, t, 2200, 'bandpass', 1500, 2.5); tone(780, 0.05, 'triangle', v * 0.5, t, 520); }
      dum(0, 0.34); tak(0.12, 0.1); tak(0.22, 0.08); dum(0.32, 0.28); tak(0.44, 0.1);
      for (i = 0; i < 9; i++) noise(0.045, 0.014 + i * 0.004, 0.04 + i * 0.05, 6500, 'highpass');       // sistre
      swell(0.9, 0.12, 0.05, 220, 3000);
      bell(WIN[0] * 2, 0.9, 0.06, 0.02, true); bell(WIN[4] * 2, 0.9, 0.04, 0.1, true);
    },
    drum: function (v) { v = v || 0.34; tone(100, 0.38, 'sine', v, 0, 44); noise(0.16, v * 0.35, 0, 450, 'lowpass', 150); },
    thud: function () { boom(0.34); },
    roll: function (n, step) { step = step || 0.09; for (var i = 0; i < n; i++) { tone(105, 0.12, 'sine', 0.1 + i * 0.015, i * step, 62); noise(0.07, 0.035 + i * 0.008, i * step, 520); } },
    coin: function (p) { var f = 1318 * (p || 1); bell(f, 0.35, 0.09, 0, true, 3.51); bell(f * 1.5, 0.45, 0.05, 0.05, true, 4.2); },
    reveal: function () { bell(660, 0.4, 0.08, 0, true); bell(990, 0.5, 0.06, 0.07, true); },
    sparkle: function () { for (var i = 0; i < 6; i++) bell(2000 + Math.random() * 2400, 0.28, 0.025, i * 0.045, true, 3.1); },
    oracle: function () { [0, 2, 4, 6].forEach(function (k, i) { bell(SCALE[k] * 4, 0.9, 0.07, i * 0.12, true); }); pad([SCALE[0], SCALE[4]], 1.4, 0.1, 0, 0.5); },
    // démarrage d'un bonus : souffle qui monte + nappe + cloches + impact
    bonus: function () {
      swell(1.3, 0.2, 0, 220, 5200);
      pad([SCALE[0] / 2, SCALE[0], SCALE[4], SCALE[0] * 2], 2.2, 0.16, 0.05, 0.9);
      [0, 2, 4, 5, 6].forEach(function (k, i) { bell(SCALE[k] * 4, 1.0, 0.07, 0.35 + i * 0.1, true); });
      boom(0.4, 1.15);
    },
    curse: function () { tone(190, 1.1, 'triangle', 0.13, 0, 42, true); tone(143, 1.1, 'sine', 0.12, 0.04, 34, true); pad([SCALE[0] / 2, SCALE[1] / 2, SCALE[0]], 1.3, 0.14, 0, 0.1); noise(0.7, 0.1, 0, 800, 'lowpass', 110); },
    shield: function () { tone(520, 0.35, 'sine', 0.08, 0, 1040, true); bell(1046, 0.7, 0.08, 0.1, true); bell(1568, 0.8, 0.06, 0.22, true); },
    lightning: function () { noise(0.28, 0.26, 0, 5200, 'highpass'); tone(2400, 0.16, 'triangle', 0.06, 0, 300); boom(0.3, 0.03); },
    // jingle de gain : plus le multiplicateur est grand, plus la phrase est longue, riche et brillante
    chime: function (mult) {
      mult = Math.max(0, +mult || 0);
      var n = mult < 1 ? 2 : mult < 3 ? 3 : mult < 8 ? 5 : mult < 20 ? 7 : 9, st = mult < 8 ? 0.075 : 0.065, i;
      for (i = 0; i < n; i++) {
        var f = winNote(i + (mult < 3 ? 2 : 0), 1), t = i * st;
        bell(f, 0.8 + i * 0.05, 0.085, t, true); bell(f * 2, 0.5, 0.03, t + 0.01, true, 4.2);
      }
      var tail = n * st;
      bell(WIN[0] * 2, 1.4, 0.1, tail, true); bell(WIN[0] * 4, 1.1, 0.04, tail + 0.02, true, 4.2);          // note d'arrivée sur la tonique, plus longue
      if (mult >= 3) A.sparkle();
      if (mult >= 8) pad([winNote(0, 0), winNote(2, 0), winNote(4, 0)], 1.8, 0.12, tail - 0.1, 0.25);
      if (mult >= 12) { horn(winNote(0, 1), 0.9, 0.05, tail, true); horn(winNote(4, 1), 0.9, 0.04, tail, true); }
      if (mult >= 15) boom(0.26, 0.02);
    },
    // fanfare des gros gains : cors + cloches + timbales ; tier 1 (grand) à 4 (jugement divin) : plus long, plus riche
    fanfare: function (tier) {
      tier = Math.max(1, Math.min(4, tier || 1));
      var motif = [0, 2, 4, 2, 4, 5, 4, 5, 6, 7], n = 4 + tier * 2, st = 0.13 - tier * 0.006, i;
      swell(0.5 + tier * 0.12, 0.12, 0, 300, 4200);
      for (i = 0; i < n; i++) {
        var f = winNote(motif[i % motif.length], 0), t = 0.1 + i * st;
        horn(f, 0.42 + (i === n - 1 ? 0.6 : 0), 0.055, t, true); bell(f * 2, 0.8, 0.06, t, true); tone(f / 2, 0.45, 'sine', 0.09, t, null, true);
      }
      var tEnd = 0.1 + n * st;
      pad([winNote(0, -1), winNote(2, -1), winNote(4, -1), winNote(0, 0), winNote(2, 0)], 2.0 + tier * 0.5, 0.2, tEnd - 0.1, 0.25);
      [0, 2, 4].forEach(function (k, j) { horn(winNote(k, 0), 1.2 + tier * 0.3, 0.06, tEnd, true); bell(winNote(k, 2), 1.4, 0.05, tEnd + j * 0.05, true); });
      boom(0.36 + tier * 0.03, tEnd);
      for (i = 0; i < tier * 2 + 2; i++) { tone(95, 0.18, 'sine', 0.2, 0.02 + i * 0.065, 48); noise(0.07, 0.06, 0.02 + i * 0.065, 500); }          // roulement de timbale
      if (tier >= 3) for (i = 0; i < 12; i++) bell(1800 + Math.random() * 2600, 0.5, 0.03, tEnd + 0.1 + i * 0.07, true, 3.1);
    },
    // le total se pose : accord résolu + petit éclat (fin du décompte)
    winLand: function (tier) {
      tier = Math.max(1, Math.min(4, tier || 1));
      [0, 2, 4].forEach(function (k, j) { bell(winNote(k, 1), 1.4, 0.09, j * 0.04, true); });
      bell(winNote(0, 2), 1.8, 0.06, 0.12, true); pad([winNote(0, 0), winNote(4, 0)], 1.4, 0.1, 0, 0.1);
      if (tier >= 2) A.sparkle();
    },
    // pluie de pièces : tintements rapprochés (limitée pour ne pas saturer)
    coinShower: function (n) {
      if (!ensure()) return; var now = ctx.currentTime; if (now - lastShower < 0.18) return; lastShower = now;
      n = Math.max(3, Math.min(14, n | 0));
      for (var i = 0; i < n; i++) bell(1700 + Math.random() * 2300, 0.22 + Math.random() * 0.12, 0.022 + Math.random() * 0.015, i * (0.035 + Math.random() * 0.03), true, 3.6);
    },
    // décompte du gain : petite mélodie de cloches qui monte avec le total (pentatonique, une note sur deux plus douce)
    countTick: function (p) {
      p = Math.max(0, Math.min(1, p || 0)); var k = Math.floor(p * 15);
      bell(winNote(k % 10, 1), 0.2, 0.03 + p * 0.025, 0, true, 3.51);
    },

    // ambiance très douce : nappe de ré mineur (sinus filtrés), respiration lente, rares cloches lointaines. Aucun bourdon, aucun battement.
    startAmbient: function () {
      if (!musicOn || !ensure() || ambNodes) return;
      var t0 = ctx.currentTime, nodes = [], g = ctx.createGain(), f = ctx.createBiquadFilter(), lfo = ctx.createOscillator(), lg = ctx.createGain(), br = ctx.createOscillator(), brg = ctx.createGain();
      f.type = 'lowpass'; f.frequency.value = 650; f.Q.value = 0.4;
      lfo.frequency.value = 0.045; lg.gain.value = 140; lfo.connect(lg); lg.connect(f.frequency);
      g.gain.value = 0; g.gain.linearRampToValueAtTime(0.045, t0 + 6);
      br.frequency.value = 0.06; brg.gain.value = 0.012; br.connect(brg); brg.connect(g.gain);   // respiration
      [[73.42, 0.9], [110.0, 0.8], [146.83, 0.7], [174.61, 0.45], [220.0, 0.4]].forEach(function (p) {
        [-3, 3].forEach(function (cents) {
          var o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sine'; o.frequency.value = p[0] * PK * Math.pow(2, cents / 1200); og.gain.value = p[1] / 2;
          o.connect(og); og.connect(f); o.start(); nodes.push(o);
        });
      });
      f.connect(g); g.connect(musBus); verb && g.connect(verb); lfo.start(); br.start(); nodes.push(lfo, br);
      ambNodes = { nodes: nodes, g: g, alive: true };
      (function next() {
        if (!ambNodes || !ambNodes.alive) return;
        setTimeout(function () {
          if (!ambNodes || !ambNodes.alive) return;
          if (!muted) { var fq = PENTA[Math.floor(Math.random() * PENTA.length)]; bell(fq * 2, 3.2, 0.016, 0, true, 3.0, musBus); }
          next();
        }, 7000 + Math.random() * 9000);
      })();
    },
    stopAmbient: function () {
      if (!ambNodes) return; var n = ambNodes; ambNodes = null; n.alive = false;
      n.g.gain.cancelScheduledValues(ctx.currentTime); n.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setTimeout(function () { n.nodes.forEach(function (o) { try { o.stop(); } catch (e) {} }); }, 650);
    },
    // annonce « BONUS » : montée dramatique (souffle + arpège de cloches + nappe + coup grave)
    bonusReveal: function () {
      swell(1.6, 0.17, 0, 180, 4200);
      tone(55, 1.8, 'sine', 0.2, 0, 110, true);
      [0, 2, 4, 5, 6, 4, 6].forEach(function (k, i) {
        var f = SCALE[k] * (i > 3 ? 4 : 2), t = 0.15 + i * 0.17;
        bell(f * 2, 0.9, 0.07 + i * 0.004, t, true); tone(f / 2, 0.6, 'sine', 0.09, t, null, true);
      });
      var tf = 1.45;
      pad([SCALE[0], SCALE[2], SCALE[4], SCALE[0] * 2, SCALE[2] * 2], 2.4, 0.2, tf - 0.05, 0.25);
      [0, 2, 4].forEach(function (k, i) { bell(SCALE[k] * 4, 1.6, 0.07, tf + i * 0.04, true); });
      boom(0.45, tf);
      for (var i = 0; i < 6; i++) bell(2200 + Math.random() * 2400, 0.4, 0.025, tf + 0.05 + i * 0.05, true, 3.1);
    },
    // bouton LANCER LE BONUS : impact + souffle + montée de cloches
    bonusLaunch: function () {
      boom(0.5);
      noise(0.1, 0.22, 0, 6000, 'highpass');
      swell(1.2, 0.18, 0.04, 400, 5600);
      [2, 4, 6, 4].forEach(function (k, i) { bell(SCALE[k] * 4, 0.9, 0.07, 0.16 + i * 0.08, true); });
      pad([SCALE[0], SCALE[4]], 1.4, 0.12, 0.1, 0.3);
    },
    // pulsation douce (deux battements) pour le suspense ; s = intensité 0..1
    heartbeat: function (s) {
      s = s == null ? 0.5 : Math.max(0, Math.min(1, s));
      var v = 0.16 + s * 0.2;
      tone(58, 0.22, 'sine', v, 0, 38);
      tone(48, 0.26, 'sine', v * 0.7, 0.2, 34);
      noise(0.08, v * 0.2, 0, 220);
    },

    // ---- réglages joueur ----
    setMuted: function (m) { muted = m; if (master) master.gain.value = m ? 0 : 0.85 * vol; },
    isMuted: function () { return muted; },
    // hauteur globale en demi-tons (-12 … +12) ; les notes déjà en cours ne bougent pas, l'ambiance est relancée
    setPitch: function (semi) {
      semi = Math.max(-12, Math.min(12, Math.round(+semi || 0))); pitchSemi = semi; PK = Math.pow(2, semi / 12);
      if (ambNodes) { A.stopAmbient(); setTimeout(function () { A.startAmbient(); }, 700); }
    },
    getPitch: function () { return pitchSemi; },
    setVolume: function (v) { vol = Math.max(0, Math.min(1, +v)); if (master && !muted) master.gain.value = 0.85 * vol; },
    getVolume: function () { return vol; },
    setMusic: function (on) { musicOn = !!on; if (!musicOn) A.stopAmbient(); else if (ctx && !muted) A.startAmbient(); },
    isMusic: function () { return musicOn; }
  };
  root.Sfx = A;
})(window);
