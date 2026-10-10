// node tools/contrast.js — contraste WCAG des couples texte/fond du jeu (AA : 4,5 texte normal, 3 grand texte). Sortie 1 si échec.
function lum(h) { var n = parseInt(h.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
// [description, texte, fond, minimum]  (fonds dégradés : on prend le pire cas). À tenir en phase avec css/style.css et js/game.js (VIS).
var P = [
  ['HUD : libellés (SOLDE, MISE, GAIN) 10 px',        '#b9a780', '#0b0907', 4.5],
  ['HUD : montants',                                  '#f6ead0', '#0b0907', 4.5],
  ['Boutons Turbo/Auto inactifs',                     '#b9a780', '#14100c', 4.5],
  ['Boutons actifs',                                  '#fff1b8', '#171109', 4.5],
  ['Bouton Acheter (texte sombre, bas du dégradé)',    '#1a0f00', '#c9962a', 4.5],
  ['Bouton Tourner (texte sombre, coin le plus sombre)', '#140a00', '#b8861e', 4.5],
  ['Pastille de statut',                              '#fff1b8', '#14100c', 4.5],
  ['Historique : puce neutre',                        '#b9a780', '#0e0a06', 4.5],
  ['Fenêtre : texte',                                 '#f6ead0', '#1a130b', 4.5],
  ['Fenêtre : texte secondaire',                      '#b9a780', '#1a130b', 4.5],
  ['Carte d\'achat : description 11 px',              '#b9a780', '#1d1710', 4.5],
  ['Carte d\'achat : bouton (bas du dégradé)',         '#140a00', '#c9962a', 4.5],
  ['Roue : « 0 » sur case Poussière',                 '#8d7c60', '#14100b', 3],
  ['Roue : 0,25× sur bronze sombre',                  '#fff6e0', '#7c6038', 4.5],
  ['Roue : 0,5× sur bronze',                          '#fff1c8', '#a67c3d', 3],
  ['Roue : 1× sur lapis',                             '#ffffff', '#3e74e8', 3],
  ['Roue : 2× sur turquoise',                         '#032b26', '#22d3be', 3],
  ['Roue : 3× sur émeraude',                          '#032616', '#35d98c', 3],
  ['Roue : Ankh (texte sombre sur or)',               '#3a2706', '#b4861f', 3],
  ['Roue : Scarabées sur cornaline',                  '#fff1d8', '#e0503a', 3],
  ['Roue : Pesée (texte sombre sur ivoire)',          '#4a3410', '#cfae62', 3],
  ['Roue : Trésor sur améthyste',                     '#fff0ff', '#b36ae8', 3],
  ['Bonus : sous-titre du bandeau',                   '#cdb98a', '#0a0704', 4.5]
];
var fails = 0, fs = require('fs'), path = require('path');
// garde-fou : les couleurs testées ci-dessus doivent être celles réellement utilisées
var css = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8'), gm = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
[[css, '#140a00'], [css, '#1a0f00'], [css, '#c9962a'], [css, '#b8861e'], [gm, "tx: '#fff6e0'"], [gm, "'#7c6038'"]].forEach(function (c) {
  if (c[0].indexOf(c[1]) < 0) { fails++; console.log('ÉCHEC  couleur testée absente du code : ' + c[1]); }
});
P.forEach(function (p) {
  var r = ratio(p[1], p[2]), ok = r >= p[3];
  if (!ok) fails++;
  console.log((ok ? 'ok     ' : 'ÉCHEC  ') + r.toFixed(2).padStart(5) + ' ≥ ' + p[3] + '  ' + p[0]);
});
console.log(fails ? '\n' + fails + ' couple(s) sous le seuil' : '\ntous les couples passent');
process.exit(fails ? 1 : 0);
