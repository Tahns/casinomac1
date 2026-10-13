// Plafond des tests : jamais plus de 100 000 tours/tirages (demande du joueur), sauf si HOA_BIG=1 est défini explicitement.
module.exports = function cap(n) { return process.env.HOA_BIG === '1' ? n : Math.min(n, 100000); };
