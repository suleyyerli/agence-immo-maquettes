/*
 * Mes biens : recherche, filtres, changement de statut en un clic,
 * dupliquer, masquer / afficher, supprimer (avec possibilité d'annuler).
 */
(function () {
  'use strict';

  var store = window.Immo.store;
  var A = window.Immo.admin;
  var B = window.Immo.biens;
  var esc = A.esc;

  var conteneur = document.querySelector('[data-liste-biens]');
  var vide = document.querySelector('[data-vide]');
  var recherche = document.querySelector('[data-recherche]');
  var filtreStatut = document.querySelector('[data-filtre-statut]');
  var segment = document.querySelector('[data-filtre-transaction]');
  var transaction = '';

  // Filtre de statut passé dans l'URL (liens du tableau de bord)
  var params = new URLSearchParams(location.search);
  if (params.get('statut')) filtreStatut.value = params.get('statut');

  function normaliser(t) {
    return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function optionsStatut(b) {
    return Object.keys(window.Immo.data.listes.statuts).map(function (s) {
      var lib = s === 'vendu' && b.transaction === 'location' ? 'Loué' : window.Immo.data.listes.statuts[s];
      return '<option value="' + s + '"' + (b.statut === s ? ' selected' : '') + '>' + lib + '</option>';
    }).join('');
  }

  function ligne(b) {
    var masque = b.visible === false;
    return '' +
      '<div class="bien-ligne' + (masque ? ' est-masque' : '') + '" role="row" data-id="' + esc(b.id) + '">' +
        '<a class="bien-ligne__principal" role="cell" href="bien-edition.html?id=' + encodeURIComponent(b.id) + '">' +
          (b.photos[0] ? '<img src="' + esc(B.photoUrl(b.photos[0], 200)) + '" alt="" loading="lazy">' : '<span class="bien-ligne__sans-photo">Pas de photo</span>') +
          '<span class="bien-ligne__texte">' +
            '<strong>' + esc(b.titre) + '</strong>' +
            '<span>' + esc(b.ref || '') + ' · ' + esc(B.lieu(b)) + '</span>' +
          '</span>' +
        '</a>' +
        '<span class="bien-ligne__prix" role="cell">' + B.prix(b) + '</span>' +
        '<span role="cell"><span class="etiquette etiquette--' + b.transaction + '">' + (b.transaction === 'location' ? 'Location' : 'Vente') + '</span></span>' +
        '<span class="bien-ligne__statut" role="cell">' +
          '<label class="sr-only" for="statut-' + esc(b.id) + '">Statut de « ' + esc(b.titre) + ' »</label>' +
          '<select id="statut-' + esc(b.id) + '" class="select-statut select-statut--' + b.statut + '" data-changer-statut>' + optionsStatut(b) + '</select>' +
          (masque ? '<span class="etiquette etiquette--masque">Masqué</span>' : '') +
        '</span>' +
        '<span class="bien-ligne__actions" role="cell">' +
          '<a class="icone-bouton" href="bien-edition.html?id=' + encodeURIComponent(b.id) + '" title="Modifier"><svg class="ico"><use href="#i-crayon"/></svg><span class="sr-only">Modifier</span></a>' +
          '<button class="icone-bouton" type="button" data-action="dupliquer" title="Dupliquer"><svg class="ico"><use href="#i-copier"/></svg><span class="sr-only">Dupliquer</span></button>' +
          '<button class="icone-bouton" type="button" data-action="visibilite" title="' + (masque ? 'Afficher sur le site' : 'Masquer du site') + '"><svg class="ico"><use href="#i-' + (masque ? 'oeil' : 'oeil-barre') + '"/></svg><span class="sr-only">' + (masque ? 'Afficher sur le site' : 'Masquer du site') + '</span></button>' +
          '<button class="icone-bouton icone-bouton--danger" type="button" data-action="supprimer" title="Supprimer"><svg class="ico"><use href="#i-poubelle"/></svg><span class="sr-only">Supprimer</span></button>' +
        '</span>' +
      '</div>';
  }

  function afficher() {
    var q = normaliser(recherche.value);
    var statut = filtreStatut.value;
    var tous = store.biens();
    var liste = tous.filter(function (b) {
      if (transaction && b.transaction !== transaction) return false;
      if (statut === 'masque' && b.visible !== false) return false;
      if (statut && statut !== 'masque' && b.statut !== statut) return false;
      if (q && normaliser([b.titre, b.quartier, b.ville, b.ref, b.type].join(' ')).indexOf(q) === -1) return false;
      return true;
    });

    conteneur.innerHTML = liste.length ? '<div class="bien-ligne bien-ligne--entete" role="row">' +
      '<span role="columnheader">Bien</span><span role="columnheader">Prix</span><span role="columnheader">Type</span>' +
      '<span role="columnheader">Statut</span><span role="columnheader"><span class="sr-only">Actions</span></span></div>' +
      liste.map(ligne).join('') : '';
    vide.hidden = liste.length > 0;

    var enLigne = tous.filter(function (b) { return b.statut !== 'brouillon' && b.visible !== false; }).length;
    document.querySelector('[data-resume-biens]').textContent =
      tous.length + ' biens au total, dont ' + enLigne + ' visibles sur le site.';
    A.compteurs();
  }

  /* Filtres */
  recherche.addEventListener('input', afficher);
  filtreStatut.addEventListener('change', afficher);
  segment.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-valeur]');
    if (!btn) return;
    transaction = btn.dataset.valeur;
    segment.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
    afficher();
  });

  /* Changement de statut directement dans la liste */
  conteneur.addEventListener('change', function (e) {
    if (!e.target.matches('[data-changer-statut]')) return;
    var b = store.bien(e.target.closest('[data-id]').dataset.id);
    b.statut = e.target.value;
    if (b.statut !== 'brouillon') b.visible = true;
    store.enregistrerBien(b);
    A.toast('Statut mis à jour : ' + A.statutLibelle(b));
    afficher();
  });

  /* Actions */
  conteneur.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var id = btn.closest('[data-id]').dataset.id;
    var b = store.bien(id);

    if (btn.dataset.action === 'dupliquer') {
      var copie = store.dupliquerBien(id);
      afficher();
      A.toast('Bien dupliqué en brouillon', { action: 'Modifier', onAction: function () { location.href = 'bien-edition.html?id=' + encodeURIComponent(copie.id); } });
    }

    if (btn.dataset.action === 'visibilite') {
      b.visible = b.visible === false;
      store.enregistrerBien(b);
      afficher();
      A.toast(b.visible ? 'Bien de nouveau visible sur le site' : 'Bien masqué : il n’apparaît plus sur le site');
    }

    if (btn.dataset.action === 'supprimer') {
      A.confirmer({
        titre: 'Supprimer ce bien ?',
        texte: '« ' + b.titre + ' » disparaîtra du site et de votre liste.',
        bouton: 'Supprimer'
      }).then(function (ok) {
        if (!ok) return;
        var position = store.biens().indexOf(b);
        store.supprimerBien(id);
        afficher();
        A.toast('Bien supprimé', {
          action: 'Annuler',
          onAction: function () {
            store.biens().splice(position, 0, b);
            store.enregistrerBien(b);
            afficher();
            A.toast('Suppression annulée');
          }
        });
      });
    }
  });

  afficher();
})();
