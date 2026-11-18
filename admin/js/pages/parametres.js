/*
 * Paramètres : informations de l'agence, logo, réseaux sociaux
 * et barème des honoraires (repris sur la page Honoraires des sites).
 */
(function () {
  'use strict';

  var store = window.Immo.store;
  var A = window.Immo.admin;
  var esc = A.esc;

  var form = document.querySelector('[data-parametres]');
  var agence = JSON.parse(JSON.stringify(store.agence()));
  var CHAMPS = ['nom', 'prenom', 'adresse', 'ville', 'telephone', 'email', 'cartePro', 'horaires', 'facebook', 'instagram', 'linkedin'];
  var modifie = false;

  CHAMPS.forEach(function (c) { if (form.elements[c]) form.elements[c].value = agence[c] || ''; });

  /* Logo */
  var apercuLogo = document.querySelector('[data-logo-apercu]');
  var retirer = document.querySelector('[data-logo-retirer]');
  function afficherLogo() {
    apercuLogo.innerHTML = agence.logo ? '<img src="' + esc(agence.logo) + '" alt="Logo de l’agence">' : '<span>Pas encore de logo</span>';
    retirer.hidden = !agence.logo;
  }
  document.querySelector('[data-logo-champ]').addEventListener('change', function (e) {
    var fichier = e.target.files[0];
    if (!fichier) return;
    A.lireFichierImage(fichier, 600, 0.9).then(function (src) {
      agence.logo = src;
      modifie = true;
      afficherLogo();
    });
  });
  retirer.addEventListener('click', function () { agence.logo = ''; modifie = true; afficherLogo(); });

  /* Barème : une ligne = une tranche + un montant */
  function afficherBareme(cle) {
    var zone = document.querySelector('[data-bareme="' + cle + '"]');
    zone.innerHTML = (agence[cle] || []).map(function (l, i) {
      return '<div class="bareme__ligne" data-index="' + i + '">' +
        '<label class="sr-only" for="' + cle + '-t-' + i + '">Tranche ' + (i + 1) + '</label>' +
        '<input id="' + cle + '-t-' + i + '" type="text" value="' + esc(l.tranche) + '" data-cle="tranche">' +
        '<label class="sr-only" for="' + cle + '-m-' + i + '">Montant ' + (i + 1) + '</label>' +
        '<input id="' + cle + '-m-' + i + '" type="text" value="' + esc(l.montant) + '" data-cle="montant">' +
        '<button class="icone-bouton icone-bouton--danger" type="button" data-retirer-ligne title="Retirer cette ligne"><svg class="ico"><use href="#i-poubelle"/></svg><span class="sr-only">Retirer cette ligne</span></button>' +
      '</div>';
    }).join('');
  }

  document.querySelectorAll('[data-bareme]').forEach(function (zone) {
    var cle = zone.dataset.bareme;
    afficherBareme(cle);
    zone.addEventListener('input', function (e) {
      var i = e.target.closest('[data-index]').dataset.index;
      agence[cle][i][e.target.dataset.cle] = e.target.value;
      modifie = true;
    });
    zone.addEventListener('click', function (e) {
      if (!e.target.closest('[data-retirer-ligne]')) return;
      agence[cle].splice(e.target.closest('[data-index]').dataset.index, 1);
      modifie = true;
      afficherBareme(cle);
    });
  });
  document.querySelectorAll('[data-ajout-ligne]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cle = btn.dataset.ajoutLigne;
      agence[cle].push({ tranche: '', montant: '' });
      afficherBareme(cle);
      var champs = document.querySelectorAll('[data-bareme="' + cle + '"] [data-cle="tranche"]');
      champs[champs.length - 1].focus();
    });
  });

  form.addEventListener('input', function (e) { if (CHAMPS.indexOf(e.target.name) !== -1) modifie = true; });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    CHAMPS.forEach(function (c) { agence[c] = form.elements[c].value.trim(); });
    ['honorairesVente', 'honorairesLocation'].forEach(function (cle) {
      agence[cle] = agence[cle].filter(function (l) { return l.tranche || l.montant; });
      afficherBareme(cle);
    });
    if (store.enregistrerAgence(agence)) {
      modifie = false;
      A.toast('Paramètres enregistrés');
    } else {
      A.toast('Le logo est trop lourd pour la démo, essayez une image plus petite.', { type: 'erreur' });
    }
  });

  window.addEventListener('beforeunload', function (e) {
    if (modifie) { e.preventDefault(); e.returnValue = ''; }
  });

  afficherLogo();
})();
