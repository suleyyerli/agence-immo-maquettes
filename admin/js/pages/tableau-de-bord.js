/*
 * Tableau de bord : bonjour, chiffres de la semaine, dernières demandes,
 * derniers biens modifiés.
 */
(function () {
  'use strict';

  var store = window.Immo.store;
  var A = window.Immo.admin;
  var B = window.Immo.biens;
  var esc = A.esc;
  var listes = window.Immo.data.listes;

  var agence = store.agence();
  var biens = store.biens();
  var demandes = store.demandes();
  var ilYa7Jours = Date.now() - 7 * 86400000;

  document.querySelector('[data-prenom]').textContent = agence.prenom || '';
  var dateJour = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  document.querySelector('[data-date-du-jour]').textContent = dateJour.charAt(0).toUpperCase() + dateJour.slice(1);

  /* Chiffres */
  var enLigne = biens.filter(function (b) { return b.visible !== false && (b.statut === 'en-ligne' || b.statut === 'sous-offre'); });
  var semaine = demandes.filter(function (d) { return new Date(d.date) >= ilYa7Jours; });
  var nouvelles = demandes.filter(function (d) { return d.statut === 'nouveau'; });
  var brouillons = biens.filter(function (b) { return b.statut === 'brouillon'; });

  function parType(liste, type) { return liste.filter(function (d) { return d.type === type; }).length; }
  function pluriel(n, mot) { return n + ' ' + mot + (n > 1 ? 's' : ''); }

  var valeurs = { enLigne: enLigne.length, semaine: semaine.length, nouvelles: nouvelles.length, brouillons: brouillons.length };
  Object.keys(valeurs).forEach(function (k) { document.querySelector('[data-chiffre="' + k + '"]').textContent = valeurs[k]; });
  var sousOffre = enLigne.filter(function (b) { return b.statut === 'sous-offre'; }).length;
  document.querySelector('[data-chiffre-detail="enLigne"]').textContent =
    enLigne.filter(function (b) { return b.transaction === 'vente'; }).length + ' en vente, ' +
    enLigne.filter(function (b) { return b.transaction === 'location'; }).length + ' en location' +
    (sousOffre ? ', dont ' + sousOffre + ' sous offre' : '');
  document.querySelector('[data-chiffre-detail="semaine"]').textContent =
    pluriel(parType(semaine, 'visite'), 'visite') + ' · ' + pluriel(parType(semaine, 'estimation'), 'estimation') + ' · ' + pluriel(parType(semaine, 'contact'), 'contact');

  /* Une phrase qui dit quoi faire en premier */
  var resume = document.querySelector('[data-resume]');
  if (nouvelles.length) {
    var plusAncienne = nouvelles[nouvelles.length - 1];
    var bien = plusAncienne.bienId ? store.bien(plusAncienne.bienId) : null;
    var n = nouvelles.length, x = n > 1 ? 's' : '';
    var heures = Math.round((Date.now() - new Date(plusAncienne.date)) / 3600000);
    var attente = heures < 1 ? 'quelques minutes' : heures < 24 ? heures + ' h' : Math.round(heures / 24) + ' jour' + (heures >= 36 ? 's' : '');
    resume.innerHTML = 'Vous avez <strong>' + n + ' nouvelle' + x + ' demande' + x + '</strong>. ' +
      'Commencez par <a href="demandes.html?id=' + encodeURIComponent(plusAncienne.id) + '">' + esc(plusAncienne.prenom) + ' ' + esc(plusAncienne.nom) + '</a>' +
      (bien ? ', pour « ' + esc(bien.titre) + ' »' : '') + ', qui attend depuis ' + attente + '.';
  } else {
    resume.textContent = 'Tout est à jour : aucune demande en attente. Belle journée !';
  }

  /* Dernières demandes */
  var zone = document.querySelector('[data-dernieres-demandes]');
  zone.innerHTML = demandes.slice(0, 5).map(function (d) {
    var b = d.bienId ? store.bien(d.bienId) : null;
    return '<li><a class="ligne-demande" href="demandes.html?id=' + encodeURIComponent(d.id) + '">' +
      '<span class="avatar avatar--' + d.type + '" aria-hidden="true">' + esc((d.prenom || '?').charAt(0)) + '</span>' +
      '<span class="ligne-demande__corps"><strong>' + esc(d.prenom + ' ' + d.nom) + '</strong>' +
      '<span>' + listes.typesDemande[d.type] + (b ? ' · ' + esc(b.titre) : '') + '</span></span>' +
      '<span class="ligne-demande__meta"><span class="statut statut--' + d.statut + '">' + listes.statutsDemande[d.statut] + '</span>' +
      '<time datetime="' + d.date + '">' + A.dateRelative(d.date) + '</time></span>' +
      '</a></li>';
  }).join('') || '<li class="vide">Aucune demande pour l’instant.</li>';

  /* Derniers biens modifiés */
  var recents = biens.slice().sort(function (a, b) {
    return new Date(b.dateModif || b.dateAjout) - new Date(a.dateModif || a.dateAjout);
  }).slice(0, 4);
  document.querySelector('[data-derniers-biens]').innerHTML = recents.map(function (b) {
    return '<li><a href="bien-edition.html?id=' + encodeURIComponent(b.id) + '">' +
      (b.photos[0] ? '<img src="' + esc(B.photoUrl(b.photos[0], 160)) + '" alt="" loading="lazy">' : '<span class="mini-biens__vide"></span>') +
      '<span><strong>' + esc(b.titre) + '</strong><span>' + B.prix(b) + '</span></span>' +
      '<span class="statut statut--' + b.statut + '">' + A.statutLibelle(b) + '</span></a></li>';
  }).join('');
})();
