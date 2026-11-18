/*
 * Site Moderne : lance les modules communs, puis le simulateur
 * d'honoraires de la page Vendre (propre à ce style).
 */
(function () {
  'use strict';

  window.Immo.biens.demarrer();
  window.Immo.ui.demarrer();

  // Barème d'exemple : à garder cohérent avec la page honoraires.html
  var TRANCHES = [
    { max: 80000, forfait: 5000 },
    { max: 150000, taux: 0.06 },
    { max: 250000, taux: 0.05 },
    { max: 400000, taux: 0.045 },
    { max: Infinity, taux: 0.04 }
  ];

  function honoraires(prix) {
    var t = TRANCHES.find(function (tr) { return prix <= tr.max; });
    return t.forfait ? { montant: t.forfait, libelle: 'Forfait' } : { montant: Math.round(prix * t.taux), libelle: String(t.taux * 100).replace('.', ',') + ' %' };
  }

  var bloc = document.querySelector('[data-simulateur]');
  if (!bloc) return;

  var euros = function (n) { return window.Immo.biens.nombre(n) + ' €'; };
  var curseur = bloc.querySelector('[data-simulateur-curseur]');
  var sorties = {
    prix: bloc.querySelector('[data-simulateur-prix]'),
    honoraires: bloc.querySelector('[data-simulateur-honoraires]'),
    taux: bloc.querySelector('[data-simulateur-taux]'),
    net: bloc.querySelector('[data-simulateur-net]')
  };

  function maj() {
    var prix = parseInt(curseur.value, 10);
    var h = honoraires(prix);
    sorties.prix.textContent = euros(prix);
    sorties.honoraires.textContent = euros(h.montant);
    sorties.taux.textContent = h.libelle;
    sorties.net.textContent = euros(prix - h.montant);
    curseur.setAttribute('aria-valuetext', euros(prix));
  }

  curseur.addEventListener('input', maj);
  maj();
})();
