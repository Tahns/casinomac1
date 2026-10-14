// node tools/tune-vault.js — cale le poids du SCEAU de chaque profil de la Chambre du Trésor pour que son espérance (calcul exact, aucun tirage)
// égale la cible. Cibles = espérances d'avant la refonte (avec Bouclier Ankh) : 10,6324 / 10,6329 / 10,6297. Affiche les poids à reporter dans js/math.js.
var R = require('./rtp-exact.js'), M = require('../js/math.js');
var tgt = { safe: 10.632420762124385, std: 10.63286054291105, bold: 10.629673138073647 };
['safe', 'std', 'bold'].forEach(function (p) {
  var vp = M.VAULT_PROFILES[p], lo = 1, hi = 400, k, mid;
  for (k = 0; k < 60; k++) { mid = (lo + hi) / 2; vp.seal = mid; if (R.vaultOf(vp)[0] > tgt[p]) lo = mid; else hi = mid; }   // l'espérance décroît quand le sceau grossit
  var m = R.vaultOf(vp);
  console.log(p.padEnd(5), 'seal', vp.seal.toFixed(2), ' EV', m[0].toFixed(4), ' sd', Math.sqrt(m[1] - m[0] * m[0]).toFixed(1));
});
