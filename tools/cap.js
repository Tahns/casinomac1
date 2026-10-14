// Plafond des tests : jamais plus de 1000 tours/tirages (demande du joueur), sauf si ANUBIS_BIG=1 est défini explicitement.
module.exports = function cap(n) { return process.env.ANUBIS_BIG === '1' ? n : Math.min(n, 1000); };
