// Plafond des tests : jamais plus de 1000 tours/tirages (demande du joueur), sauf si ANUBIS_BIG=1 est défini explicitement.
// ANUBIS_CAP=n abaisse encore le plafond de chaque boucle (ex. ANUBIS_CAP=8 : au plus 8 tirages par boucle), pour tenir un budget global.
module.exports = function cap(n) {
  if (process.env.ANUBIS_BIG === '1') return n;
  var c = parseInt(process.env.ANUBIS_CAP || '', 10);
  return Math.min(n, 1000, c > 0 ? c : 1000);
};
