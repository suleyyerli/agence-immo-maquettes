/*
 * Demandes : boîte de réception (contact, visite, estimation).
 * Liste à gauche, détail à droite ; sur téléphone, le détail
 * s'ouvre par-dessus la liste avec un bouton retour.
 */
(function () {
  'use strict';

  var store = window.Immo.store;
  var A = window.Immo.admin;
  var B = window.Immo.biens;
  var esc = A.esc;
  var listes = window.Immo.data.listes;

  var boite = document.querySelector('[data-boite]');
  var liste = document.querySelector('[data-liste-demandes]');
  var detail = document.querySelector('[data-detail]');
  var segment = document.querySelector('[data-filtre-type]');
  var filtreStatut = document.querySelector('[data-filtre-statut]');
  var mobile = window.matchMedia('(max-width: 899px)');

  var params = new URLSearchParams(location.search);
  var type = '';
  var selection = params.get('id');
  if (params.get('statut')) filtreStatut.value = params.get('statut');

  function telLien(tel) { return 'tel:' + String(tel || '').replace(/[^\d+]/g, ''); }

  function filtrees() {
    return store.demandes().filter(function (d) {
      return (!type || d.type === type) && (!filtreStatut.value || d.statut === filtreStatut.value);
    });
  }

  function afficherListe() {
    var toutes = store.demandes();
    document.querySelectorAll('[data-compte-type]').forEach(function (el) {
      var t = el.dataset.compteType;
      el.textContent = toutes.filter(function (d) { return !t || d.type === t; }).length;
    });
    var nouvelles = toutes.filter(function (d) { return d.statut === 'nouveau'; }).length;
    document.querySelector('[data-resume-demandes]').textContent = nouvelles
      ? nouvelles + ' demande' + (nouvelles > 1 ? 's' : '') + ' à traiter. Les plus récentes sont en haut.'
      : 'Tout est traité. Bravo !';

    var items = filtrees();
    liste.innerHTML = items.map(function (d) {
      var b = d.bienId ? store.bien(d.bienId) : null;
      return '<li><button type="button" class="demande' + (d.statut === 'nouveau' ? ' est-nouvelle' : '') + '" data-id="' + esc(d.id) + '"' + (d.id === selection ? ' aria-current="true"' : '') + '>' +
        '<span class="avatar avatar--' + d.type + '" aria-hidden="true">' + esc((d.prenom || '?').charAt(0)) + '</span>' +
        '<span class="demande__corps">' +
          '<span class="demande__ligne"><strong>' + esc(d.prenom + ' ' + d.nom) + '</strong><time datetime="' + d.date + '">' + A.dateRelative(d.date) + '</time></span>' +
          '<span class="demande__sujet">' + listes.typesDemande[d.type] + (b ? ' · ' + esc(b.titre) : '') + '</span>' +
          '<span class="demande__extrait">' + esc(d.message) + '</span>' +
        '</span>' +
        '<span class="statut statut--' + d.statut + '">' + listes.statutsDemande[d.statut] + '</span>' +
      '</button></li>';
    }).join('') || '<li class="vide"><p class="vide__titre">Aucune demande</p><p>Rien pour ces filtres.</p></li>';
    A.compteurs();
  }

  function afficherDetail() {
    var d = store.demandes().find(function (x) { return x.id === selection; });
    boite.classList.toggle('montre-detail', !!d);
    if (!d) {
      detail.innerHTML = '<div class="vide"><p class="vide__titre">Choisissez une demande</p><p>Son détail s’affichera ici.</p></div>';
      return;
    }
    var b = d.bienId ? store.bien(d.bienId) : null;
    var sujet = listes.typesDemande[d.type] === 'Visite' && b ? 'Votre demande de visite : ' + b.titre
      : d.type === 'estimation' ? 'Votre demande d’estimation' : 'Votre message à l’agence';
    var corps = 'Bonjour ' + d.prenom + ',\n\nMerci pour votre message. \n\nBien cordialement,\n' + (store.agence().prenom || '');
    var mailto = 'mailto:' + encodeURIComponent(d.email) + '?subject=' + encodeURIComponent(sujet) + '&body=' + encodeURIComponent(corps);

    var details = '';
    if (d.details) {
      var lignes = [['Adresse du bien', d.details.adresse], ['Type', d.details.typeBien], ['Surface', d.details.surface && d.details.surface + ' m²'], ['Pièces', d.details.pieces], ['Projet', d.details.delai]]
        .filter(function (l) { return l[1]; });
      if (lignes.length) details = '<dl class="details">' + lignes.map(function (l) { return '<div><dt>' + l[0] + '</dt><dd>' + esc(l[1]) + '</dd></div>'; }).join('') + '</dl>';
    }

    detail.innerHTML = '' +
      '<button type="button" class="retour retour--mobile" data-retour><svg class="ico"><use href="#i-retour"/></svg>Toutes les demandes</button>' +
      '<header class="detail__entete">' +
        '<span class="avatar avatar--grand avatar--' + d.type + '" aria-hidden="true">' + esc((d.prenom || '?').charAt(0)) + '</span>' +
        '<div><h2 class="detail__nom">' + esc(d.prenom + ' ' + d.nom) + '</h2>' +
        '<p class="detail__meta"><span class="etiquette etiquette--' + d.type + '">' + listes.typesDemande[d.type] + '</span> Reçue ' + A.dateLongue(d.date) + '</p></div>' +
      '</header>' +
      '<div class="detail__actions">' +
        (d.tel ? '<a class="bouton bouton--accent" href="' + telLien(d.tel) + '"><svg class="ico"><use href="#i-tel"/></svg>Appeler ' + esc(d.tel) + '</a>' : '') +
        (d.email ? '<a class="bouton bouton--secondaire" href="' + mailto + '"><svg class="ico"><use href="#i-mail"/></svg>Répondre par e-mail</a>' : '') +
      '</div>' +
      (b ? '<div class="detail__bien">' +
        (b.photos[0] ? '<img src="' + esc(B.photoUrl(b.photos[0], 240)) + '" alt="">' : '') +
        '<div><p class="detail__bien-titre">' + esc(b.titre) + '</p><p>' + B.prix(b) + ' · ' + esc(b.ref) + '</p>' +
        '<p class="detail__liens"><a class="lien" href="bien-edition.html?id=' + encodeURIComponent(b.id) + '">Modifier le bien</a>' +
        '<button type="button" class="lien" data-voir-bien="' + esc(b.id) + '">Voir l’annonce</button></p></div></div>' : '') +
      (d.message ? '<blockquote class="detail__message"><p>' + esc(d.message).replace(/\n/g, '<br>') + '</p></blockquote>'
        : '<p class="detail__sans-message">Pas de message, seulement les coordonnées.</p>') +
      details +
      '<dl class="details details--contact"><div><dt>Téléphone</dt><dd>' + esc(d.tel || '—') + '</dd></div><div><dt>E-mail</dt><dd>' + esc(d.email || '—') + '</dd></div></dl>' +
      '<fieldset class="detail__statut"><legend>Où en êtes-vous ?</legend><div class="segment segment--large">' +
        Object.keys(listes.statutsDemande).map(function (s) {
          return '<label><input type="radio" name="statut-demande" value="' + s + '"' + (d.statut === s ? ' checked' : '') + '><span>' + listes.statutsDemande[s] + '</span></label>';
        }).join('') +
      '</div></fieldset>' +
      '<div class="champ"><label for="note">Note pour moi <span class="champ__option">(visible seulement ici)</span></label>' +
      '<textarea id="note" rows="3" data-note placeholder="Rappeler samedi matin, a déjà visité le T3…">' + esc(d.note || '') + '</textarea></div>';
  }

  function selectionner(id, focus) {
    selection = id;
    history.replaceState(null, '', 'demandes.html' + (id ? '?id=' + encodeURIComponent(id) : ''));
    afficherListe();
    afficherDetail();
    if (focus && mobile.matches) window.scrollTo({ top: 0 });
  }

  liste.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-id]');
    if (btn) selectionner(btn.dataset.id, true);
  });

  detail.addEventListener('change', function (e) {
    if (e.target.name === 'statut-demande') {
      store.modifierDemande(selection, { statut: e.target.value });
      A.toast('Demande marquée « ' + listes.statutsDemande[e.target.value] + ' »');
      afficherListe();
    }
    if (e.target.matches('[data-note]')) {
      store.modifierDemande(selection, { note: e.target.value });
      A.toast('Note enregistrée');
    }
  });

  detail.addEventListener('click', function (e) {
    if (e.target.closest('[data-retour]')) selectionner(null);
    var voir = e.target.closest('[data-voir-bien]');
    if (voir) A.voirSite('bien.html?id=' + encodeURIComponent(voir.dataset.voirBien) + '&apercu=1');
  });

  segment.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-valeur]');
    if (!btn) return;
    type = btn.dataset.valeur;
    segment.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
    afficherListe();
  });
  filtreStatut.addEventListener('change', afficherListe);

  // Sur ordinateur, on ouvre directement la demande la plus récente
  if (!selection && !mobile.matches) {
    var premiere = filtrees()[0];
    if (premiere) selection = premiere.id;
  }
  afficherListe();
  afficherDetail();
})();
