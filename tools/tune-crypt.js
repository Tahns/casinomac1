// node tools/tune-crypt.js — moments exacts du bonus secret (Sanctuaire des Marées), sans aucun tirage, et comparaison avec l'espérance du bonus remplacé.
var R = require('./rtp-exact.js'), M = require('../js/math.js');
var m = R.cryptMoments(), ev = m[0], sd = Math.sqrt(m[1] - m[0] * m[0]);
var c = R();
console.log('Sanctuaire : EV ' + ev.toFixed(4) + '×   écart-type ' + sd.toFixed(1) + '×   bonus remplacé (moyenne roue + Fureur) : ' + c.replaced.toFixed(4) + '×   écart ' + (ev - c.replaced).toFixed(4) + '×');
