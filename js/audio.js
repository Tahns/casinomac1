/* ANUBIS UNCHAINED — audio 100 % synthétisé (WebAudio) : zéro fichier, zéro droit à gérer.
 * Palette : cloches FM (gains), nappes douces (annonces), impacts graves filtrés ; une ambiance « pad » très discrète.
 * Réglages joueur : hauteur globale (demi-tons), volume, ambiance on/off. */
(function (root) {
  'use strict';
  var ctx = null, master, sfxBus, musBus, verb, muted = false, ambNodes = null, tens = null, tenseNodes = null;
  var pitchSemi = 0, PK = 1, vol = 1, musicOn = true, toneV = 0.3, softA = null, softB = null;
  var sfxOn = true, inMusic = false;   // effets sonores (hors musique) : coupés à part ; inMusic = les sons d'un thème de bonus comptent comme musique
  function gate(bus) { return !sfxOn && !inMusic && (!bus || bus === sfxBus); }   // vrai : cet effet est coupé
  function toneHz() { return 1200 * Math.pow(7.5, toneV); }     // 0 = très sourd (1,2 kHz) … 1 = brillant (9 kHz)
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
    // pas de sons aigus : deux filtres passe-bas en cascade (24 dB/oct), réglables avec « Aigus »
    softB = ctx.createBiquadFilter(); softB.type = 'lowpass'; softB.frequency.value = toneHz(); softB.Q.value = 0.5; softB.connect(master);
    softA = ctx.createBiquadFilter(); softA.type = 'lowpass'; softA.frequency.value = toneHz(); softA.Q.value = 0.5; softA.connect(softB);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(softA);
    musBus = ctx.createGain(); musBus.gain.value = 0.5; musBus.connect(softA);
    // réverbération : bruit décroissant, filtré pour rester chaud
    var len = ctx.sampleRate * 2.2, imp = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = imp.getChannelData(c), lp = 0; for (var i = 0; i < len; i++) { lp += ((Math.random() * 2 - 1) - lp) * 0.35; d[i] = lp * Math.pow(1 - i / len, 2.8); } }
    verb = ctx.createConvolver(); verb.buffer = imp;
    var vg = ctx.createGain(); vg.gain.value = 0.34; verb.connect(vg); vg.connect(master);
    return ctx;
  }

  // note simple (la hauteur globale PK s'applique à toutes les fréquences)
  function tone(f, dur, type, vol0, delay, glide, wet, bus) {
    if (!ensure() || gate(bus)) return;
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
    if (!ensure() || gate(bus)) return;
    var t = ctx.currentTime + (delay || 0), c = ctx.createOscillator(), m = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
    c.type = 'sine'; m.type = 'sine'; c.frequency.value = f * PK; m.frequency.value = f * PK * (ratio || 3.51);
    mg.gain.setValueAtTime(f * PK * 0.9, t); mg.gain.exponentialRampToValueAtTime(Math.max(1, f * PK * 0.02), t + dur * 0.6);
    m.connect(mg); mg.connect(c.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol0 || 0.1, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    c.connect(g); g.connect(bus || sfxBus); if (wet !== false) g.connect(verb);
    c.start(t); m.start(t); c.stop(t + dur + 0.05); m.stop(t + dur + 0.05);
  }
  // nappe : accord aux attaques/relâchements lents (sinus + triangle légèrement désaccordés)
  function pad(freqs, dur, vol0, delay, attack, bus) {
    if (!ensure() || gate(bus)) return;
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
    if (!ensure() || gate()) return;
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
    if (!ensure() || gate()) return;
    var t = ctx.currentTime + (delay || 0), n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = ctx.createBufferSource(); s.buffer = buf; var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(f0 * PK, t); f.frequency.exponentialRampToValueAtTime(f1 * PK, t + dur);
    var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol0, t + dur * 0.85); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus); g.connect(verb); s.start(t);
  }
  // cor chaud : deux dents de scie désaccordées, filtre qui s'ouvre à l'attaque, léger vibrato
  function horn(f, dur, vol0, delay, wet) {
    if (!ensure() || gate()) return;
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

  // ----- briques « épiques » : basse saturée, taïko, cuivres, voix -----
  function shaperCurve(k) { var n = 1024, c = new Float32Array(n); for (var i = 0; i < n; i++) { var x = i * 2 / n - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); } return c; }
  var SHAPER = null;
  // basse grondante : dent de scie + sous-octave saturées, filtre grave
  function growl(f, dur, vol0, delay) {
    if (!ensure() || gate()) return; if (!SHAPER) SHAPER = shaperCurve(30);
    var t = ctx.currentTime + (delay || 0), ws = ctx.createWaveShaper(), lp = ctx.createBiquadFilter(), g = ctx.createGain(); ws.curve = SHAPER; ws.oversample = '2x';
    lp.type = 'lowpass'; lp.Q.value = 3; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(240, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol0, t + 0.02); g.gain.setValueAtTime(vol0, t + dur * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    [['sawtooth', 1], ['sine', 0.5], ['sawtooth', 1.005]].forEach(function (p) { var o = ctx.createOscillator(); o.type = p[0]; o.frequency.value = f * PK * p[1]; o.connect(ws); o.start(t); o.stop(t + dur + 0.05); });
    ws.connect(lp); lp.connect(g); g.connect(sfxBus);
  }
  // taïko : peau grave qui plonge + corps + claque de baguette ; deep = gros tambour de guerre
  function taiko(vol0, delay, deep) {
    tone(deep ? 72 : 98, deep ? 0.9 : 0.5, 'sine', vol0, delay, deep ? 30 : 46, true); tone(deep ? 150 : 200, 0.2, 'triangle', vol0 * 0.4, delay, 70);
    noise(0.24, vol0 * 0.5, delay, deep ? 600 : 900, 'lowpass', 140); noise(0.05, vol0 * 0.3, delay, 3800, 'bandpass', undefined, 1.2);
  }
  function dumF(v, d) { tone(105, 0.3, 'sine', v, d, 48); noise(0.12, v * 0.35, d, 420, 'lowpass', 150); }
  function takF(v, d) { noise(0.06, v, d, 2200, 'bandpass', 1500, 2.5); tone(780, 0.05, 'triangle', v * 0.5, d, 520); }
  // montée de tambours qui s'accélère (suspense)
  function drumRoll(n, dur, vol0, delay) { for (var i = 0; i < n; i++) { var u = i / n, tt = (delay || 0) + dur * (1 - Math.pow(1 - u, 1.8)); taiko(vol0 * (0.35 + 0.65 * u), tt, false); } }

  // ----- thèmes sonores des bonus : boucles légères (pas de 1/8 de temps) qui jouent pendant tout le bonus -----
  var theme = null, themeLevel = 0, ambWas = false;
  var THEMES = {
    // Scarabées : désert, darbouka + sistre + flûte de roseau
    scarab: { bpm: 104, step: function (n) {
      var s = n % 16; if (s === 0 || s === 6 || s === 10) dumF(0.2, 0); if (s === 4 || s === 8 || s === 12 || s === 14) takF(0.06, 0); noise(0.04, 0.01 + (s % 2 ? 0.006 : 0), 0, 6500, 'highpass');
      if (s % 4 === 0) { var k = [0, 2, 3, 2, 0, 3, 4, 2][(n / 4 | 0) % 8]; tone(SCALE[k] * 2, 0.36, 'triangle', 0.045, 0, null, true); tone(SCALE[k] * 4.01, 0.3, 'sine', 0.012, 0, null, true); }
      if (s === 0) pad([SCALE[0] / 2, SCALE[4] / 2], 4.2, 0.1, 0, 1.4);
    } },
    // Pesée : sacré, pouls lent, voix, cloche de temple
    weigh: { bpm: 60, step: function (n) {
      var s = n % 16; if (s === 0 || s === 8) A.heartbeat(0.35); if (s === 3 || s === 11) A.heartbeat(0.2);
      if (s === 0) pad([SCALE[0], SCALE[4], SCALE[0] * 2, SCALE[2] * 2], 6.5, 0.14, 0, 2.2);
      if (s === 8 && (n / 16 | 0) % 2) pad([SCALE[1], SCALE[3], SCALE[1] * 2], 6.0, 0.1, 0, 2);
      if (s === 6 || s === 14) bell(SCALE[[4, 2, 6, 0][(n / 8 | 0) % 4]] * 4, 1.8, 0.04, 0, true, 2.9);
    } },
    // Trésor : arpège de cloches qui scintille, bourdon d'or, éclats de pièces
    vault: { bpm: 108, step: function (n) {
      var s = n % 16, k = [0, 2, 4, 2, 5, 4, 2, 0][s % 8]; bell(SCALE[k] * 4, 0.5, 0.034, 0, true, 3.51);
      if (s === 0) pad([SCALE[0] / 2, SCALE[0], SCALE[4]], 4.2, 0.12, 0, 1);
      if (s === 8 || s === 13) tone(SCALE[0] / 2, 0.4, 'sine', 0.12, 0, SCALE[0] / 2.2);
      if (Math.random() < 0.18) bell(2400 + Math.random() * 2400, 0.3, 0.02, 0, true, 3.6);
    } },
    // Fureur d'Anubis : GUERRE — taïkos géants, basse saturée, cuivres, chœur ; monte avec chaque DOUBLE
    hand: { bpm: 116, step: function (n, lv) {
      var s = n % 16, bar = n / 16 | 0, vb = 1 + lv * 0.12;
      if (s === 0) { taiko(0.55 * vb, 0, true); if (lv >= 1) noise(0.9, 0.05 + lv * 0.02, 0, 5000, 'highpass'); } if (s === 8) taiko(0.46 * vb, 0, true);
      if (s === 4 || s === 12) taiko(0.3 * vb, 0, false); if (s === 6 || s === 14) taiko(0.18, 0, false); if (s === 15 && lv >= 2) taiko(0.2, 0, false);
      if (s % 4 === 0) growl([82.41, 82.41, 87.31, 82.41][s / 4], 0.5, 0.17 + lv * 0.025, 0);
      if (lv >= 1 && s % 2 === 1) noise(0.03, 0.025 + lv * 0.006, 0, 7000, 'highpass');
      if (s === 0 && bar % 2 === 0) {            // motif de cuivres : mi - fa - sol# - mi
        var m = [0, 1, 2, 0]; m.forEach(function (k, j) { horn(WIN[k] * 0.5, 0.42, 0.08 + lv * 0.01, j * 0.26, true); if (lv >= 2) horn(WIN[k], 0.42, 0.05, j * 0.26, true); });
        pad([WIN[0] / 2, WIN[4] / 2, WIN[0], WIN[2]], 4.0, 0.2 + lv * 0.03, 0, 0.7);
      }
      if (s === 8 && bar % 4 === 3) { A.swell ? A.swell(1.9, 0.16, 0, 160, 5200) : 0; drumRoll(10, 1.9, 0.22, 0); }
      if (lv >= 3 && s === 0) { noise(1.4, 0.1, 0, 3000, 'bandpass', 900, 0.8); bell(WIN[0] * 4, 2.4, 0.05, 0, true); }
    } },
    // Crypte : glacial et inquiétant — pouls sourd, cloches désaccordées, craquements de glace
    crypt: { bpm: 70, step: function (n) {
      var s = n % 16; if (s === 0 || s === 4) { tone(55, 0.5, 'sine', 0.2, 0, 36); noise(0.1, 0.05, 0, 200); }
      if (s === 0) pad([SCALE[0] / 2, SCALE[1] / 2, SCALE[3] / 2], 6, 0.16, 0, 2);
      if (s === 8) pad([SCALE[1], SCALE[3], SCALE[1] * 2.01], 5, 0.07, 0, 2);
      if (Math.random() < 0.3) bell(1500 + Math.random() * 2000, 1.4, 0.02, 0, true, 2.7);
      if (Math.random() < 0.12) noise(0.07, 0.05, 0, 5500 + Math.random() * 2500, 'highpass');
    } }
  };
  function stopTheme() { if (theme) { clearInterval(theme.timer); theme.alive = false; theme = null; } }

  /* ===== MUSIQUE DU TEMPLE : boucle égyptienne générée en direct (mode phrygien dominant, mi fa sol# la si do ré) =====
   * Instruments synthétisés : bourdon + nappe, bendir (tambour sur cadre) et darbouka (rythme maqsoum), oud (corde pincée, Karplus-Strong),
   * ney (flûte soufflée), arpège de cloches lent. Un séquenceur à anticipation (0,3 s) place les notes sur l'horloge audio : aucun décalage.
   * Forme de 4 mesures bouclée (accords mi, fa, mi, ré mineur) ; l'orchestration s'étoffe puis respire. Humeur « base » (84 bpm, 4/4) ou
   * « bonus » (108 bpm, plus dense). Tous les volumes sont bornés (<= 0,18 par voix) et passent par le compresseur maître. */
  var BPM = { base: 84, bonus: 108 };
  var SEMI = [0, 1, 4, 5, 7, 8, 10];
  function deg(i) { return 164.81 * Math.pow(2, SEMI[((i % 7) + 7) % 7] / 12 + Math.floor(i / 7)); }   // degré 0 = mi3
  var CHORDS = [[0, 2, 4], [1, 3, 5], [0, 2, 4], [6, 8, 10]];                    // indices de degrés : mi sol# si | fa la do | mi sol# si | ré fa la
  var ROOT = [82.41, 87.31, 82.41, 73.42];                                        // basses : mi fa mi ré
  // phrases de l'oud : [pas sur 32, degré] (2 mesures)
  var OUD = [
    [[0, 7], [3, 8], [4, 7], [8, 9], [10, 8], [12, 7], [16, 6], [19, 7], [20, 8], [24, 7], [28, 0]],
    [[0, 9], [2, 10], [4, 9], [6, 8], [8, 7], [12, 8], [14, 9], [16, 11], [18, 12], [20, 11], [22, 9], [24, 8], [28, 7]],
    [[0, 7], [8, 9], [12, 8], [16, 7], [24, 6], [28, 7]],
    [[0, 11], [4, 9], [6, 8], [8, 9], [10, 10], [12, 9], [14, 8], [16, 7], [24, 7]]
  ];
  var NEY = [[14, 11], [12, 13], [14, 9], [13, 14]];                              // 2 notes longues par bloc de 4 mesures
  var KSB = {}, NZB = null, MU = null;
  function noiseBuf() {
    if (NZB) return NZB;
    NZB = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); var d = NZB.getChannelData(0), s = 12345;
    for (var i = 0; i < d.length; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = (s / 0x3fffffff) - 1; }
    return NZB;
  }
  function nzAt(t, dur, v, freq, type, q, bus) {   // claque de bruit filtré, à l'heure t de l'horloge audio
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf(); f.type = type || 'bandpass'; f.frequency.value = freq * PK; f.Q.value = q || 1;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(bus || musBus); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  }
  function ksBuf(f) {   // corde pincée (Karplus-Strong) : bruit adouci qui tourne dans une boucle de longueur sr/f et perd ses aigus
    var key = Math.round(f * 10); if (KSB[key]) return KSB[key];
    var sr = ctx.sampleRate, n = Math.max(2, Math.round(sr / f)), len = Math.floor(sr * 1.5), b = ctx.createBuffer(1, len, sr), d = b.getChannelData(0), ring = new Float32Array(n), i, lp = 0, sd = key * 7919 + 1, idx = 0, pk = 0;
    for (i = 0; i < n; i++) { sd = (sd * 1103515245 + 12345) & 0x7fffffff; lp += ((sd / 0x3fffffff - 1) - lp) * 0.5; ring[i] = lp; }
    for (i = 0; i < len; i++) { var nx = idx + 1 === n ? 0 : idx + 1; d[i] = ring[idx]; ring[idx] = (ring[idx] + ring[nx]) * 0.498; idx = nx; if (Math.abs(d[i]) > pk) pk = Math.abs(d[i]); }
    var k = pk > 0 ? 0.9 / pk : 1; for (i = 0; i < len; i++) d[i] *= k;
    var fade = Math.floor(sr * 0.08); for (i = 0; i < fade; i++) d[len - 1 - i] *= i / fade;   // fin de buffer sans clic
    return (KSB[key] = b);
  }
  function oudNote(f, t, v) {   // deux cordes légèrement désaccordées (chœur de l'oud), filtre doux
    f *= PK; var g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2300; lp.Q.value = 0.6;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    [1, 1.0035].forEach(function (r) { var s = ctx.createBufferSource(); s.buffer = ksBuf(f); s.playbackRate.value = r; s.connect(lp); s.start(t); s.stop(t + 1.4); });
    lp.connect(g); g.connect(musBus); var w = ctx.createGain(); w.gain.value = 0.3; g.connect(w); w.connect(verb);
  }
  function neyNote(f, t, dur, v) {   // flûte de roseau : sinus + octave, souffle bruité, vibrato qui s'installe
    f *= PK; var g = ctx.createGain(), lp = ctx.createBiquadFilter(), lfo = ctx.createOscillator(), lg = ctx.createGain(), o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g2 = ctx.createGain(), br = ctx.createBufferSource(), bf = ctx.createBiquadFilter(), bg = ctx.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 3200; o1.type = 'sine'; o2.type = 'triangle'; o1.frequency.value = f; o2.frequency.value = f * 2; g2.gain.value = 0.16;
    lfo.frequency.value = 5.1; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.011, t + dur * 0.6); lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
    bf.type = 'bandpass'; bf.frequency.value = f * 2.2; bf.Q.value = 2.5; bg.gain.value = 0.22; br.buffer = noiseBuf(); br.loop = true;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.16); g.gain.setValueAtTime(v, t + dur - 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o1.connect(lp); o2.connect(g2); g2.connect(lp); br.connect(bf); bf.connect(bg); bg.connect(lp); lp.connect(g); g.connect(musBus); var w = ctx.createGain(); w.gain.value = 0.5; g.connect(w); w.connect(verb);
    [o1, o2, lfo].forEach(function (o) { o.start(t); o.stop(t + dur + 0.05); }); br.start(t, Math.random()); br.stop(t + dur + 0.05);
  }
  function mPad(freqs, t, dur, v) {   // nappe de l'accord : sinus + triangle, attaque lente
    freqs.forEach(function (f) {
      [0, 1].forEach(function (k) {
        var o = ctx.createOscillator(), g = ctx.createGain(); o.type = k ? 'triangle' : 'sine'; o.frequency.value = f * PK * (k ? 1.004 : 1);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v / (k ? 2.4 : 1) / Math.sqrt(freqs.length), t + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(musBus); var w = ctx.createGain(); w.gain.value = 0.5; g.connect(w); w.connect(verb); o.start(t); o.stop(t + dur + 0.05);
      });
    });
  }
  // percussions : bendir (doum grave + tak sec) et darbouka (plus aiguë, plus vive)
  function pDum(t, v, hi) {
    var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime((hi ? 170 : 128) * PK, t); o.frequency.exponentialRampToValueAtTime((hi ? 88 : 60) * PK, t + 0.15);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + (hi ? 0.28 : 0.38)); o.connect(g); g.connect(musBus); o.start(t); o.stop(t + 0.45); nzAt(t, 0.08, v * 0.45, 650, 'lowpass', 0.7);
  }
  function pTak(t, v, hi) {
    nzAt(t, 0.055, v, hi ? 3000 : 2300, 'bandpass', 2.2); var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime((hi ? 1100 : 850) * PK, t); o.frequency.exponentialRampToValueAtTime(520 * PK, t + 0.04);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * 0.4, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); o.connect(g); g.connect(musBus); o.start(t); o.stop(t + 0.08);
  }
  function pKa(t, v) { nzAt(t, 0.035, v, 3800, 'bandpass', 1.6); }
  function pZil(t, v) { nzAt(t, 0.16, v, 7200, 'highpass', 0.8); }

  function musicStep(n, t, M) {
    var bar = n >> 4, s = n & 15, ci = bar & 3, now = ctx.currentTime, dl = t - now, bonus = M.mood === 'bonus', lvl;
    if (bonus) lvl = 3; else if (bar < 2) lvl = 0; else { var c = (bar - 2) % 20; lvl = c < 2 ? 1 : c < 6 ? 2 : c < 18 ? 3 : 2; }
    // nappe de l'accord, une par mesure
    if (s === 0) { var ch = CHORDS[ci].map(function (i) { return deg(i); }); mPad(ch, t, bonus ? 2.4 : 3.4, bonus ? 0.085 : 0.07); }
    if (lvl >= 1 && (s === 0 || s === 8)) { tone(ROOT[ci] * 2, 1.1, 'sine', 0.085, dl, null, false, musBus); tone(ROOT[ci] * 4.01, 0.6, 'triangle', 0.012, dl, null, false, musBus); }
    // percussions (maqsoum : doum . tak . . tak doum . . tak . . ) ; l'orchestration s'étoffe avec le niveau
    if (lvl >= 1) {
      var dv = bonus ? 0.17 : 0.13;
      if (s === 0 || s === 8) pDum(t, dv * (s ? 0.85 : 1), bonus);
      if (lvl >= 2 && (s === 6 || s === 12)) pTak(t, bonus ? 0.07 : 0.05, bonus);
      if (lvl >= 3) {
        if (s === 2) pTak(t, 0.04, bonus);
        if (s === 4 || s === 10 || s === 14) pKa(t, 0.028);
        if (bonus && (s === 3 || s === 11)) pDum(t, 0.07, true);
        if (s % 2 === 1) pZil(t, 0.006 + (s % 4 === 3 ? 0.004 : 0));
        if ((bar & 3) === 3 && s >= 12) pKa(t, 0.03 + (s - 12) * 0.01);                // petite relance avant le retour
      }
    }
    // arpège de cloches : sur l'accord, lent ; un peu plus dense aux niveaux hauts
    if (lvl >= 1 && s % 4 === 0) { var a = CHORDS[ci][[0, 1, 2, 1][s >> 2]]; bell(deg(a + 7), 1.2, 0.017, dl, true, 3.0, musBus); }
    if (lvl >= 2 && s % 4 === 2 && Math.random() < 0.55) bell(deg(CHORDS[ci][Math.floor(Math.random() * 3)] + 14), 1.0, 0.009, dl, true, 3.2, musBus);
    // oud : une phrase de 2 mesures ; niveau 2 = phrases 1 et 3 seulement
    if (lvl >= 2 && !M.tense) {
      var pi = (bar >> 1) & 3;
      if (lvl >= 3 || pi % 2 === 0) { var lp = ((bar & 1) << 4) + s; OUD[pi].forEach(function (e) { if (e[0] === lp) oudNote(deg(e[1]), t, e[0] % 8 === 0 ? 0.17 : 0.14); }); }
    }
    // ney : deux notes longues par bloc de 4 mesures (mesures 3 et 4)
    if (lvl >= 3 && !M.tense && s === 0 && (bar & 3) >= 2) neyNote(deg(NEY[(bar >> 2) & 3][(bar & 3) - 2]), t, 2.7, 0.05);
    // tension : doum de plus en plus serrés
    if (M.tense && s % 2 === 0) pDum(t, 0.05 + M.tense * 0.1, false);
  }
  function musicSched() {
    if (!MU || !MU.alive || !ctx) return;
    var now = ctx.currentTime;
    if (document.hidden || muted || !musicOn) { MU.next = now + 0.1; return; }
    if (MU.next < now - 0.4) MU.next = now + 0.05;                                     // retard (onglet endormi) : on repart sans rattraper
    var sd = 60 / BPM[MU.mood] / 4;
    while (MU.next < now + 0.3) { try { musicStep(MU.step, MU.next, MU); } catch (e) {} MU.next += sd; MU.step++; }
  }
  function musicStart(mood) {
    if (!ensure() || MU) return false;
    var t0 = ctx.currentTime, dg = ctx.createGain(), lp = ctx.createBiquadFilter(), lfo = ctx.createOscillator(), lg = ctx.createGain(), nodes = [lfo];
    lp.type = 'lowpass'; lp.frequency.value = 340; lp.Q.value = 0.7; lfo.frequency.value = 0.07; lg.gain.value = 90; lfo.connect(lg); lg.connect(lp.frequency);
    dg.gain.setValueAtTime(0.0001, t0); dg.gain.exponentialRampToValueAtTime(0.06, t0 + 4);   // bourdon sur mi : fondamentale + quinte, deux dents de scie désaccordées
    [[82.41, 'sawtooth', -6, 1], [82.41, 'sawtooth', 6, 1], [123.47, 'sine', 0, 0.7], [41.2, 'sine', 0, 0.9]].forEach(function (p) {
      var o = ctx.createOscillator(), og = ctx.createGain(); o.type = p[1]; o.frequency.value = p[0] * PK * Math.pow(2, p[2] / 1200); og.gain.value = p[3] * (p[1] === 'sawtooth' ? 0.5 : 1);
      o.connect(og); og.connect(lp); o.start(t0); nodes.push(o);
    });
    lfo.start(t0); lp.connect(dg); dg.connect(musBus);
    MU = { alive: true, step: 0, next: t0 + 0.12, mood: mood || 'base', tense: 0, g: dg, nodes: nodes, timer: setInterval(musicSched, 60) };
    return true;
  }
  function musicStop() {
    if (!MU) return; var m = MU; MU = null; m.alive = false; clearInterval(m.timer);
    if (ctx) { m.g.gain.cancelScheduledValues(ctx.currentTime); m.g.gain.setValueAtTime(Math.max(0.0001, m.g.gain.value), ctx.currentTime); m.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5); }
    setTimeout(function () { m.nodes.forEach(function (o) { try { o.stop(); } catch (e) {} }); }, 650);
  }
  // baisse brève de la musique sous un effet fort (brisure, tension), puis retour en douceur
  function duck(level, dur) {
    if (!musBus) return; var t = ctx.currentTime; musBus.gain.cancelScheduledValues(t); musBus.gain.setValueAtTime(musBus.gain.value, t);
    musBus.gain.linearRampToValueAtTime(0.5 * level, t + 0.08); musBus.gain.linearRampToValueAtTime(0.5, t + dur);
  }

  var A = {
    unlock: ensure,
    tick: function (speed) { tone(950 + (speed || 0) * 350, 0.03, 'triangle', 0.035); tone(520, 0.04, 'sine', 0.05); },
    click: function () { bell(880, 0.25, 0.07, 0, false); },
    whoosh: function () { swell(0.9, 0.16, 0, 300, 3600); },
    // Anubis surgit : grondement qui monte, grognement filtré, battement sourd, puis coup rouge
    anubisRise: function () {
      if (!ensure() || gate()) return; var t = ctx.currentTime;
      noise(2.4, 0.2, 0, 90, 'lowpass', 600);
      tone(46, 2.6, 'sine', 0.3, 0, 90, true);
      var o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain();       // grognement : dent de scie grave, filtre et trémolo
      o.type = 'sawtooth'; o.frequency.setValueAtTime(62 * PK, t + 0.3); o.frequency.exponentialRampToValueAtTime(41 * PK, t + 2.4);
      f.type = 'lowpass'; f.Q.value = 4; f.frequency.setValueAtTime(260, t + 0.3); f.frequency.exponentialRampToValueAtTime(900, t + 1.9); f.frequency.exponentialRampToValueAtTime(200, t + 2.5);
      l.frequency.value = 14; lg.gain.value = 0.05; l.connect(lg); lg.connect(g.gain);
      g.gain.setValueAtTime(0.0001, t + 0.3); g.gain.exponentialRampToValueAtTime(0.16, t + 1.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      o.connect(f); f.connect(g); g.connect(sfxBus); g.connect(verb); o.start(t + 0.3); o.stop(t + 2.7); l.start(t + 0.3); l.stop(t + 2.7);
      A.heartbeat(0.6); setTimeout(function () { A.heartbeat(0.9); }, 650); setTimeout(function () { A.heartbeat(1); }, 1250);
      swell(1.6, 0.12, 1.0, 120, 2400);
      boom(0.5, 1.95);
    },
    // apparition d'Anubis propre à chaque bonus
    emerge: function (kind) {
      if (kind === 'hand') { A.anubisRise(); return; }
      if (kind === 'scarab') { swell(1.4, 0.14, 0, 300, 5200); for (var i = 0; i < 18; i++) noise(0.05, 0.03 + (i % 3) * 0.01, 0.4 + i * 0.05, 4500 + Math.random() * 2500, 'bandpass', undefined, 3); pad([SCALE[0] / 2, SCALE[2] / 2], 2.0, 0.14, 0, 0.6); boom(0.3, 1.9); }
      else if (kind === 'weigh') { pad([SCALE[0], SCALE[4], SCALE[0] * 2], 2.4, 0.16, 0, 0.7); [0, 0.6, 1.2].forEach(function (t, j) { A.heartbeat(0.4 + j * 0.25); setTimeout(function () { A.heartbeat(0.4 + j * 0.25); }, t * 1000); }); bell(SCALE[4] * 4, 1.6, 0.07, 1.3, true); boom(0.3, 1.9); }
      else if (kind === 'vault') { tone(70, 1.6, 'sine', 0.3, 0, 40, true); noise(1.4, 0.16, 0.2, 200, 'lowpass', 1200); swell(1.0, 0.12, 0.8, 300, 4000); [0, 1, 2, 3, 4, 5].forEach(function (j) { A.coin(1 + j * 0.1); }); boom(0.34, 1.25); bell(SCALE[0] * 8, 1.4, 0.06, 1.3, true); }
      else if (kind === 'crypt') { pad([SCALE[0] / 2, SCALE[1] / 2, SCALE[3] / 2], 2.6, 0.2, 0, 0.5); noise(2.2, 0.1, 0, 3000, 'bandpass', 700, 2); for (var j = 0; j < 8; j++) bell(1400 + Math.random() * 1800, 1.2, 0.03, 0.6 + j * 0.2, true, 2.7); A.curse(); boom(0.4, 1.9); }
      else boom(0.3);
    },
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
    coin: function (p) { var f = 880 * (p || 1); bell(f, 0.4, 0.09, 0, true, 2.4); bell(f * 1.5, 0.5, 0.05, 0.05, true, 2.4); },
    reveal: function () { bell(660, 0.4, 0.08, 0, true); bell(990, 0.5, 0.06, 0.07, true); },
    sparkle: function () { for (var i = 0; i < 6; i++) bell(820 + Math.random() * 900, 0.35, 0.03, i * 0.05, true, 2.4); },
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
    sealShut: function () { tone(120, 0.9, 'sine', 0.22, 0, 46, true); noise(0.8, 0.14, 0, 900, 'lowpass', 140); noise(0.25, 0.1, 0.55, 1600, 'bandpass', 600, 1.5); boom(0.32, 0.5); bell(SCALE[0] * 2, 1.0, 0.05, 0.62, true); },
    keyGet: function () { [0, 2, 4].forEach(function (k, i) { bell(SCALE[k] * 8, 0.6, 0.07, i * 0.07, true, 3); }); noise(0.06, 0.05, 0, 5200, 'highpass'); },
    thunder: function () { noise(0.3, 0.22, 0, 1800, 'bandpass', 500, 0.8); tone(900, 0.2, 'triangle', 0.06, 0, 150); boom(0.3, 0.03); },
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
      if (tier >= 3) for (i = 0; i < 12; i++) bell(900 + Math.random() * 600, 0.5, 0.03, tEnd + 0.1 + i * 0.07, true, 3.1);
    },
    // le total se pose : accord résolu + petit éclat (fin du décompte)
    winLand: function (tier) {
      tier = Math.max(1, Math.min(4, tier || 1));
      [0, 2, 4].forEach(function (k, j) { bell(winNote(k, 1), 1.4, 0.09, j * 0.04, true); });
      bell(winNote(0, 2), 1.8, 0.06, 0.12, true); pad([winNote(0, 0), winNote(4, 0)], 1.4, 0.1, 0, 0.1);
      if (tier >= 2) A.sparkle();
    },
    // montée en puissance pendant le décompte (EXTRA, MEGA, DIVIN) : souffle grave qui s'ouvre, nappe qui monte, roulement de timbales qui s'accélère. Doux, sans aigu.
    rise: function (tier, dur) {
      tier = Math.max(2, Math.min(4, tier || 2)); dur = Math.max(0.8, dur || 3);
      swell(dur, 0.1 + tier * 0.025, 0.1, 160, 1100);
      pad([winNote(0, -1), winNote(4, -1)], dur + 0.4, 0.1, 0.1, dur * 0.8);
      if (tier >= 3) pad([winNote(0, 0), winNote(2, 0), winNote(4, 0)], dur * 0.6, 0.09, dur * 0.45, dur * 0.4);
      var n = tier * 5;
      for (var i = 0; i < n; i++) { var u = i / n, at = 0.2 + dur * (1 - Math.pow(1 - u, 1.6)) * 0.95; tone(92 + u * 20, 0.16, 'sine', 0.06 + u * 0.1, at, 52); noise(0.06, 0.02 + u * 0.04, at, 480); }
    },
    // pluie de pièces : tintements rapprochés (limitée pour ne pas saturer)
    coinShower: function (n) {
      if (!ensure() || gate()) return; var now = ctx.currentTime; if (now - lastShower < 0.18) return; lastShower = now;
      n = Math.max(3, Math.min(14, n | 0));
      for (var i = 0; i < n; i++) bell(700 + Math.random() * 700, 0.26 + Math.random() * 0.12, 0.024 + Math.random() * 0.015, i * (0.04 + Math.random() * 0.03), true, 2.4);
    },
    // décompte du gain : petite mélodie de cloches qui monte avec le total (pentatonique, une note sur deux plus douce)
    countTick: function (p) {
      p = Math.max(0, Math.min(1, p || 0)); var k = Math.floor(p * 15);
      bell(winNote(k % 10, 1), 0.2, 0.03 + p * 0.025, 0, true, 3.51);
    },

    // musique du temple (voir plus haut) : remplace l'ancienne nappe ; mêmes noms d'appel. Jamais par-dessus un thème de bonus.
    startAmbient: function () {
      if (!musicOn || !ensure() || MU || theme) return;
      musicStart('base'); ambNodes = MU;
    },
    stopAmbient: function () { ambNodes = null; musicStop(); },
    // humeur de la musique : 'base' (calme) ou 'bonus' (plus rapide, plus dense)
    musicMood: function (m) { m = m === 'bonus' ? 'bonus' : 'base'; if (MU) MU.mood = m; },
    isMusicPlaying: function () { return !!MU; },
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


    // ---- thèmes de bonus ----
    bonusTheme: function (kind) {
      if (!ensure()) return; var T = THEMES[kind]; if (!T) return;
      stopTheme(); ambWas = !!ambNodes; A.stopAmbient(); themeLevel = 0;
      var tm = theme = { kind: kind, step: 0, alive: true, timer: null }, ms = 60000 / T.bpm / 2;
      tm.timer = setInterval(function () { if (!tm.alive || muted || !musicOn || document.hidden) return; inMusic = true; try { T.step(tm.step++, themeLevel); } catch (e) {} inMusic = false; }, ms);
    },
    stopBonusTheme: function () { stopTheme(); if (musicOn && !muted) setTimeout(function () { if (!theme) A.startAmbient(); }, 900); },
    bonusUp: function () { themeLevel = Math.min(4, themeLevel + 1); },
    bonusLevel: function (n) { themeLevel = Math.max(0, Math.min(4, n | 0)); },
    swell: function (dur, v, d, f0, f1) { swell(dur, v, d, f0, f1); },
    // ---- animations de la roue : départ, arrêt, suspense ----
    windup: function () {                        // le bois se tend : grincement grave + craquements
      tone(150, 0.5, 'triangle', 0.07, 0, 70, true); noise(0.5, 0.06, 0, 1400, 'bandpass', 300, 3);
      for (var i = 0; i < 5; i++) noise(0.03, 0.03, 0.05 + i * 0.09, 3000 - i * 350, 'bandpass', undefined, 4);
    },
    clack: function (v) {                        // le pointeur claque contre la cheville
      v = v == null ? 1 : v; noise(0.05, 0.16 * v, 0, 2600, 'bandpass', 900, 3); tone(1500, 0.05, 'square', 0.03 * v, 0, 700); tone(180, 0.14, 'sine', 0.2 * v, 0, 70);
    },
    tickTense: function (x) {                    // tic de suspense : de plus en plus grave et espacé (le visuel fait l'espacement)
      x = Math.max(0, Math.min(1, x || 0));
      tone(330 - x * 90, 0.16, 'sine', 0.1 + 0.08 * x, 0, 150, true); noise(0.05, 0.05 + 0.05 * x, 0, 1800, 'bandpass', 900, 2);
      if (x > 0.55) bell(SCALE[0] * 4, 0.7, 0.03 + 0.03 * x, 0.02, true);
    },
    tensionStart: function () {                  // bourdon qui monte pendant l'approche d'une case bonus ; l'ambiance se tait
      if (!ensure() || tens) return; var t = ctx.currentTime;
      var o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = 48 * PK; o2.type = 'sine'; o2.frequency.value = 96 * PK;
      f.type = 'lowpass'; f.Q.value = 5; f.frequency.value = 160; g.gain.value = 0.0001;
      o.connect(f); o2.connect(f); f.connect(g); g.connect(sfxBus); g.connect(verb); o.start(t); o2.start(t);
      tens = { o: o, o2: o2, f: f, g: g }; if (musBus) musBus.gain.setTargetAtTime(0.03, t, 0.3);
    },
    tensionSet: function (x) {                   // 0..1 ; valeur négative = silence total
      if (!tens || !ctx) return; var t = ctx.currentTime;
      if (x < 0) { tens.g.gain.setTargetAtTime(0.0001, t, 0.05); return; }
      tens.g.gain.setTargetAtTime(0.012 + 0.1 * x * x, t, 0.1); tens.o.frequency.setTargetAtTime((48 + 70 * x) * PK, t, 0.15); tens.o2.frequency.setTargetAtTime((96 + 140 * x) * PK, t, 0.15); tens.f.frequency.setTargetAtTime(160 + 1000 * x, t, 0.15);
    },
    tensionStop: function () {
      if (!tens || !ctx) return; var t = ctx.currentTime, k = tens; tens = null;
      k.g.gain.setTargetAtTime(0.0001, t, 0.08); try { k.o.stop(t + 0.5); k.o2.stop(t + 0.5); } catch (e) {}
      if (musBus) musBus.gain.setTargetAtTime(0.5, t + 0.4, 0.5);
    },
    tensionHit: function () {                    // la roue s'arrête sur un bonus : le silence se brise
      boom(0.5); noise(0.3, 0.2, 0, 5000, 'highpass'); swell(0.5, 0.14, 0, 300, 4500);
      [0, 2, 4, 6].forEach(function (k, i) { bell(SCALE[k] * 4, 1.2, 0.07, 0.08 + i * 0.06, true); });
    },
    nearMiss: function () {                      // faux espoir : le bonus est frôlé puis perdu
      tone(420, 0.7, 'triangle', 0.08, 0, 130, true); pad([SCALE[2] / 2, SCALE[0]], 0.9, 0.08, 0, 0.1); noise(0.4, 0.05, 0, 900, 'lowpass', 150);
    },
    // ---- chaînes (transition de bonus) ----
    chainSlam: function () {
      boom(0.3); noise(0.25, 0.16, 0, 5000, 'highpass');
      for (var i = 0; i < 7; i++) tone(2200 + Math.random() * 1800, 0.09, 'triangle', 0.03, i * 0.022, 1100, true);
    },
    chainTense: function (dur) {
      dur = Math.max(0.3, dur || 0.6); swell(dur, 0.1, 0, 200, 2600); tone(180, dur, 'sawtooth', 0.025, 0, 520, true);
      for (var i = 0; i < 9; i++) noise(0.035, 0.02 + i * 0.004, dur * (i / 9) * 0.95, 2800 + i * 250, 'bandpass', undefined, 5);
    },
    chainBreak: function () {
      noise(0.5, 0.26, 0, 6000, 'highpass', 1500); boom(0.5); swell(0.8, 0.14, 0, 400, 6000);
      for (var i = 0; i < 14; i++) tone(1800 + Math.random() * 2600, 0.12, 'triangle', 0.045, i * 0.03, 900, true);
      pad([SCALE[0] * 2, SCALE[4] * 2, SCALE[0] * 4], 2.0, 0.16, 0.05, 0.2);
      [0, 2, 4, 6, 4].forEach(function (k, j) { bell(SCALE[k] * 4, 1.3, 0.07, 0.1 + j * 0.07, true); });
    },
    chainForge: function () {                    // sortie de bonus : les maillons se rassemblent, le verrou claque
      swell(0.55, 0.12, 0, 3200, 300);
      for (var i = 0; i < 8; i++) tone(1400 + i * 260, 0.08, 'triangle', 0.03 + i * 0.004, 0.05 + i * 0.05, 800, true);
      boom(0.34, 0.58); noise(0.2, 0.14, 0.58, 4200, 'bandpass', 1500, 3); bell(SCALE[0] * 4, 1.4, 0.06, 0.62, true);
    },
    // ---- victoires par case ----
    dustFall: function () { noise(0.7, 0.09, 0, 1100, 'lowpass', 160); tone(220, 0.6, 'sine', 0.06, 0, 70, true); },
    divine: function () {                        // Ankh : lumière divine, les chaînes cèdent
      pad([SCALE[0], SCALE[4], SCALE[0] * 2], 1.8, 0.14, 0, 0.3); swell(0.8, 0.1, 0, 400, 5000);
      [0, 2, 4, 6, 7].forEach(function (k, i) { bell(SCALE[k % 7] * (k > 6 ? 8 : 4), 1.2, 0.07, 0.2 + i * 0.1, true); });
    },
    scarabFly: function () { swell(0.9, 0.14, 0, 300, 5000); for (var i = 0; i < 12; i++) noise(0.04, 0.025, 0.1 + i * 0.05, 4500 + Math.random() * 2500, 'bandpass', undefined, 3); },
    featherDrop: function () { tone(1320, 0.9, 'sine', 0.05, 0, 520, true); bell(SCALE[4] * 4, 1.0, 0.05, 0.05, true); bell(SCALE[2] * 8, 1.1, 0.04, 0.3, true); },
    featherLand: function () { boom(0.22); bell(SCALE[0] * 8, 1.4, 0.07, 0, true); noise(0.2, 0.06, 0, 5000, 'highpass'); },
    pyramidOpen: function () { noise(0.9, 0.16, 0, 500, 'lowpass', 120); tone(70, 0.9, 'sine', 0.22, 0, 40, true); swell(0.8, 0.1, 0.4, 300, 4000); [0, 1, 2, 3, 4].forEach(function (j) { A.coin(1 + j * 0.12); }); },
    anubisBolt: function () { A.thunder(); growl(58, 0.9, 0.2, 0.05); boom(0.4, 0.1); noise(0.5, 0.12, 0.1, 6000, 'highpass'); },
    runes: function () { pad([SCALE[0] / 2, SCALE[1] / 2, SCALE[3] / 2], 1.8, 0.16, 0, 0.3); for (var j = 0; j < 7; j++) bell(1200 + Math.random() * 1400, 1.0, 0.035, j * 0.1, true, 2.7); },
    // ---- gros gains ----
    hitStop: function () { noise(0.08, 0.25, 0, 300, 'lowpass', 100); tone(60, 0.25, 'sine', 0.3, 0, 30); },
    // ---- fureur d'Anubis : les temps forts ----
    furySlam: function () {                      // la Main s'abat : impact colossal
      taiko(0.7, 0, true); taiko(0.55, 0.12, true); growl(55, 1.6, 0.3, 0); boom(0.7, 0);
      [0, 2, 4].forEach(function (k) { horn(WIN[k] * 0.5, 1.4, 0.1, 0.02, true); horn(WIN[k], 1.2, 0.07, 0.02, true); });
      noise(1.6, 0.2, 0, 4000, 'lowpass', 120); swell(0.9, 0.14, 0, 5000, 300);
    },
    furyCharge: function () {                    // la roue est lancée : tambours qui s'accélèrent + souffle
      swell(2.4, 0.18, 0, 150, 6000); drumRoll(16, 2.4, 0.26, 0); growl(41.2, 2.4, 0.2, 0);
    },
    furyHit: function () {                       // la roue s'arrête : coup de tonnerre
      taiko(0.55, 0, true); boom(0.5, 0.02); horn(WIN[0], 0.9, 0.1, 0, true); horn(WIN[2], 0.9, 0.08, 0, true); noise(0.5, 0.18, 0, 5200, 'highpass');
    },
    furyDouble: function (lvl) {                 // DOUBLE de votre couleur : explosion de puissance, de plus en plus grosse
      lvl = Math.max(1, Math.min(3, lvl || 1)); A.bonusUp();
      boom(0.55 + lvl * 0.07, 0); taiko(0.6, 0, true); taiko(0.45, 0.14, true); growl(55, 1.4, 0.26, 0);
      swell(0.7, 0.16, 0, 300, 6200);
      for (var i = 0; i < 4 + lvl * 2; i++) horn(winNote(i, 0) * (i > 4 ? 2 : 1), 0.4, 0.08, 0.15 + i * 0.08, true);
      pad([WIN[0] / 2, WIN[2] / 2, WIN[4] / 2, WIN[0], WIN[2], WIN[4]], 3.2, 0.26, 0.1, 0.3);
      for (i = 0; i < 6 + lvl * 3; i++) bell(2000 + Math.random() * 3000, 0.6, 0.03, 0.3 + i * 0.05, true, 3.1);
    },
    // ---- Fureur d'Anubis : suspense de la roue (nappe qui monte, tic espacés, battements, silence puis impact) ----
    furyTense: function (dur) {                  // nappe grave (deux scies désaccordées + tierce mineure) qui s'ouvre sur toute la durée de la rotation
      A.furyHush(true);
      if (!ensure() || muted) return;
      try {
        dur = Math.max(0.6, dur || 4); var t = ctx.currentTime, g = ctx.createGain(), f = ctx.createBiquadFilter(), oscs = [];
        f.type = 'lowpass'; f.Q.value = 3; f.frequency.setValueAtTime(180 * PK, t); f.frequency.exponentialRampToValueAtTime(2400 * PK, t + dur * 0.92);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.13, t + dur * 0.92);
        [[55, 'sawtooth', 1], [55.7, 'sawtooth', 1], [65.4 * 1.19, 'sine', 1], [27.5, 'sine', 1]].forEach(function (d) {
          var o = ctx.createOscillator(); o.type = d[1]; o.frequency.setValueAtTime(d[0] * PK, t); o.frequency.exponentialRampToValueAtTime(d[0] * PK * 2.1, t + dur * 0.95);
          o.connect(f); o.start(t); o.stop(t + dur + 1); oscs.push(o);
        });
        f.connect(g); g.connect(sfxBus); g.connect(verb);
        tenseNodes = { g: g, oscs: oscs };
      } catch (e) { tenseNodes = null; }
    },
    furyHush: function (quiet) {                 // coupe net la nappe : le silence juste avant l'arrêt
      var n = tenseNodes; tenseNodes = null;
      if (!n || !ctx) return;
      try { var t = ctx.currentTime; n.g.gain.cancelScheduledValues(t); n.g.gain.setValueAtTime(Math.max(0.0001, n.g.gain.value), t); n.g.gain.exponentialRampToValueAtTime(0.0001, t + (quiet ? 0.05 : 0.12)); n.oscs.forEach(function (o) { try { o.stop(t + 0.2); } catch (e) {} }); } catch (e) {}
    },
    furyTick: function (level, hot, back) {      // tic de la roue en fin de course : de plus en plus gros et grave ; cloche si la case convoitée passe
      level = Math.max(0, Math.min(1, level || 0));
      var v = 0.05 + 0.09 * level, fq = (back ? 0.7 : 1) * (1500 - 650 * level);
      tone(fq, 0.06, 'triangle', v * 0.8); tone(300 - 110 * level, 0.14, 'sine', v * 1.6, 0, 150); noise(0.04, v * 0.8, 0, 2200, 'bandpass', 900, 2);
      if (level > 0.5) tone(70, 0.22, 'sine', 0.06 * level, 0, 45);
      if (hot) bell(1568, 0.7, 0.025 + 0.03 * level, 0.01, true, 3.5);
    },
    furyHeart: function (level) {                // battement de coeur sourd
      level = Math.max(0, Math.min(1, level || 0));
      tone(72, 0.22, 'sine', 0.12 + 0.1 * level, 0, 40); tone(64, 0.24, 'sine', 0.08 + 0.08 * level, 0.17, 36);
    },
    furyFail: function () {                      // mauvaise couleur : tout retombe
      tone(130, 1.5, 'sawtooth', 0.12, 0, 30, true); growl(41.2, 1.6, 0.22, 0); taiko(0.4, 0.2, true); noise(1.2, 0.12, 0, 900, 'lowpass', 90);
    },
    // ---- sons du motif « Unchained » et de la roue ----
    // brisure d'une chaîne : coup de métal, maillons qui tombent, éclat de lumière divine (accord + souffle), choc grave ; la musique baisse un instant
    chainBreak: function (light) {   // light : version courte (chaîne d'en-tête à l'ouverture d'un bonus, déjà couverte par l'annonce du bonus)
      if (!ensure()) return; duck(light ? 0.6 : 0.25, light ? 1.2 : 2.4);
      noise(0.09, 0.2, 0, 5200, 'highpass'); noise(0.22, 0.16, 0, 2400, 'bandpass', 900, 1.2);                       // claque du métal
      bell(1180, 0.9, 0.09, 0, true, 5.4); bell(1760, 0.7, 0.06, 0.01, true, 6.1); tone(210, 0.18, 'square', 0.04, 0, 70);
      for (var i = 0; i < 11; i++) bell(1500 + Math.random() * 3800, 0.18 + Math.random() * 0.25, 0.05 * (1 - i / 14), 0.06 + i * 0.055 + Math.random() * 0.03, true, 5.8 + Math.random());   // maillons qui rebondissent
      if (light) { boom(0.25, 0); return; }
      swell(0.7, 0.16, 0.02, 500, 8000);                                                                             // éclat
      pad([winNote(0, 0), winNote(2, 0), winNote(4, 0), winNote(0, 1)], 2.2, 0.16, 0.12, 0.3);
      [0, 2, 4, 6].forEach(function (k, j) { bell(winNote(k, 2), 1.6, 0.05, 0.2 + j * 0.06, true, 3.0); });
      boom(0.45, 0);
    },
    // chaîne qui se reforme : cliquetis de plus en plus serré, puis verrou
    chainForge: function () {
      if (!ensure()) return;
      for (var i = 0; i < 9; i++) { var t = 0.55 * (1 - Math.pow(1 - i / 9, 1.6)); bell(1300 + i * 150, 0.2, 0.04 + i * 0.004, t, false, 5.6); noise(0.03, 0.04, t, 4200, 'bandpass', undefined, 2); }
      tone(150, 0.3, 'sine', 0.12, 0.58, 70, true); bell(SCALE[0] * 4, 0.9, 0.05, 0.6, true, 3.0); noise(0.1, 0.1, 0.58, 3000, 'bandpass', 1200, 1.4);
    },
    // anticipation : montée de tension de dur secondes (battements qui s'accélèrent, souffle grave qui s'ouvre, hauteur qui grimpe, dissonance finale)
    tension: function (dur) {
      if (!ensure()) return; dur = Math.max(0.8, Math.min(6, +dur || 2.4)); duck(0.55, dur + 0.6);
      swell(dur, 0.14, 0, 140, 3400);
      if (!gate()) {
        var t0 = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(110 * PK, t0); o.frequency.exponentialRampToValueAtTime(330 * PK, t0 + dur);
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.07, t0 + dur * 0.92); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.15);
        o.connect(g); g.connect(sfxBus); g.connect(verb); o.start(t0); o.stop(t0 + dur + 0.2);
      }
      var tt = 0, gap = 0.62, k = 0;
      while (tt < dur - 0.1) { tone(58, 0.2, 'sine', 0.1 + 0.1 * (tt / dur), tt, 38); tone(48, 0.22, 'sine', 0.07 + 0.08 * (tt / dur), tt + Math.min(0.2, gap * 0.4), 34); tt += gap; gap = Math.max(0.2, gap * 0.82); k++; }
      bell(SCALE[0] * 8, 1.0, 0.03, dur - 0.1, true, 3.1); bell(SCALE[1] * 8, 1.0, 0.03, dur - 0.1, true, 3.1);
    },
    // arrêt de la roue : le pointeur claque sur une cheville, pierre grave, petite cloche
    stopHit: function (strong) {
      var v = strong ? 1 : 0.7;
      tone(190, 0.14, 'triangle', 0.1 * v, 0, 80); noise(0.07, 0.1 * v, 0, 1800, 'bandpass', 900, 1.5);
      tone(70, 0.4, 'sine', 0.14 * v, 0, 42, true); bell(SCALE[0] * 4, 0.6, 0.03 * v, 0.02, true, 2.6);
    },
    // ---- réglages joueur ----
    // effets sonores : coupés séparément de la musique (« Son » = tout couper reste le réglage général exigé par Stake)
    setSfx: function (on) { sfxOn = !!on; },
    isSfx: function () { return sfxOn; },
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
    // aigus : 0 (très doux) … 1 (brillant)
    setTone: function (v) { toneV = Math.max(0, Math.min(1, +v)); if (softA) { softA.frequency.value = toneHz(); softB.frequency.value = toneHz(); } },
    getTone: function () { return toneV; },
    setMusic: function (on) { musicOn = !!on; if (!musicOn) A.stopAmbient(); else if (ctx && !muted) A.startAmbient(); },
    isMusic: function () { return musicOn; }
  };
  root.Sfx = A;
})(window);
