/* ANUBIS UNCHAINED - color grading: a light CSS filter on the stage and the interface (richer colors on screen).
 * Selectable in the mixer (top bar): natural / vivid / golden / cinema. Persisted in localStorage. */
(function (root) {
  'use strict';
  var KEY = 'anubis_grade', OLD_KEY = 'hoa_grade', PRESETS = {
    natural: '',
    vivid: 'saturate(1.28) contrast(1.08) brightness(1.05)',
    gold: 'sepia(.14) saturate(1.32) contrast(1.07) brightness(1.04)',
    cine: 'contrast(1.16) saturate(1.12) brightness(1.03) hue-rotate(-3deg)'
  }, ORDER = ['natural', 'vivid', 'gold', 'cine'], cur = 'vivid', lite = false;   // lite : qualité basse, aucun filtre (coût GPU d'un filtre sur un élément plein écran)
  try { var s = localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY); if (s && PRESETS.hasOwnProperty(s)) cur = s; } catch (e) {}
  function $(id) { return document.getElementById(id); }
  function apply() {
    var f = lite ? '' : PRESETS[cur] || '';
    ['stage', 'ui'].forEach(function (id) { var el = $(id); if (el) el.style.filter = f || 'none'; });
    var m = $('mxGrade'); if (m) Array.prototype.forEach.call(m.querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-g') === cur); });
  }
  function labels() {
    var T = root.I18N ? I18N.t() : {}, row = $('mxGradeRow'); if (!row) return;
    $('mxGradeL').textContent = T.gradeTitle || '';
    Array.prototype.forEach.call($('mxGrade').querySelectorAll('button'), function (b) { var k = b.getAttribute('data-g'); b.textContent = T['grade' + k.charAt(0).toUpperCase() + k.slice(1)] || ''; });
  }
  function build() {
    var mixer = $('mixer'); if (!mixer || $('mxGradeRow')) return;
    var row = document.createElement('div'); row.className = 'mx-row mx-grade'; row.id = 'mxGradeRow';
    row.innerHTML = '<label id="mxGradeL"></label><div id="mxGrade" class="mx-chips"></div>';
    var grid = row.querySelector('#mxGrade');
    ORDER.forEach(function (k) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.setAttribute('data-g', k);
      b.addEventListener('click', function () { cur = k; try { localStorage.setItem(KEY, k); } catch (e) {} apply(); });
      grid.appendChild(b);
    });
    mixer.insertBefore(row, mixer.querySelector('.mx-row'));   // en tête des réglages, sous le titre
    labels(); apply();
    new MutationObserver(labels).observe(mixer, { attributes: true });
    var lb = $('btnLang'); if (lb) lb.addEventListener('click', function () { setTimeout(labels, 0); });
  }
  root.Grade = { set: function (k) { if (PRESETS.hasOwnProperty(k)) { cur = k; apply(); } }, get: function () { return cur; }, lite: function (on) { on = !!on; if (on !== lite) { lite = on; apply(); } } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { build(); apply(); }); else { build(); apply(); }
})(window);
