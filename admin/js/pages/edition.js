/*
 * Ajout / modification d'un bien (bien-edition.html?id=…).
 *
 * Le formulaire est rempli à partir du bien, puis relu à chaque
 * enregistrement. Les photos sont réduites dans le navigateur avant d'être
 * stockées, et l'aperçu de la carte se met à jour en direct.
 */
(function () {
  'use strict';

  var store = window.Immo.store;
  var A = window.Immo.admin;
  var B = window.Immo.biens;
  var esc = A.esc;
  var listes = window.Immo.data.listes;
  var LETTRES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  var form = document.querySelector('[data-edition]');
  var f = form.elements;
  var params = new URLSearchParams(location.search);
  var existant = params.get('id') ? store.bien(params.get('id')) : null;

  if (params.get('id') && !existant) {
    A.flash('Ce bien n’existe plus (il a peut-être été supprimé)');
    location.replace('biens.html');
    return;
  }

  // On travaille sur une copie : rien n'est enregistré tant qu'on ne clique pas
  var bien = existant ? JSON.parse(JSON.stringify(existant)) : {
    transaction: 'vente', type: 'Maison', ville: store.agence().ville || '',
    statut: 'brouillon', visible: true, photos: [], pointsForts: []
  };
  var photos = bien.photos || [];
  var modifie = false;

  /* ==========================================================
     Construction des listes (types, lettres DPE, points forts)
     ========================================================== */

  f.type.innerHTML = listes.types.map(function (t) { return '<option>' + t + '</option>'; }).join('');

  document.querySelectorAll('[data-lettres]').forEach(function (zone) {
    var nom = zone.dataset.lettres;
    zone.innerHTML = LETTRES.map(function (l) {
      return '<label class="lettre lettre--' + l.toLowerCase() + '"><input type="radio" name="' + nom + '" value="' + l + '"><span>' + l + '</span></label>';
    }).join('') + '<label class="lettre lettre--vide"><input type="radio" name="' + nom + '" value=""><span>Non renseigné</span></label>';
  });

  document.querySelector('[data-points-forts]').innerHTML = listes.pointsForts.map(function (p, i) {
    return '<label class="puce"><input type="checkbox" name="pointsForts" value="' + esc(p) + '" id="pf-' + i + '"><span>' + esc(p) + '</span></label>';
  }).join('');

  var villes = store.biens().map(function (b) { return b.ville; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; });
  document.querySelector('[data-liste-villes]').innerHTML = villes.map(function (v) { return '<option value="' + esc(v) + '"></option>'; }).join('');

  /* ==========================================================
     Remplir le formulaire / relire le formulaire
     ========================================================== */

  var CHAMPS_TEXTE = ['type', 'titre', 'ville', 'quartier', 'repere', 'adresse', 'etage', 'chauffage', 'description', 'statut'];
  var CHAMPS_NOMBRE = ['prix', 'chargesMensuelles', 'depot', 'honorairesLocataire', 'lots', 'charges', 'surface', 'terrain', 'pieces', 'chambres', 'sdb', 'annee'];

  function remplir() {
    form.querySelector('[name="transaction"][value="' + bien.transaction + '"]').checked = true;
    CHAMPS_TEXTE.concat(CHAMPS_NOMBRE).forEach(function (nom) {
      if (bien[nom] != null) f[nom].value = bien[nom];
    });
    f.visible.checked = bien.visible !== false;
    f.coupDeCoeur.checked = !!bien.coupDeCoeur;
    cocher('dpe', bien.dpe ? bien.dpe.classe : '');
    cocher('ges', bien.ges ? bien.ges.classe : '');
    if (bien.dpe && bien.dpe.valeur) f.dpeValeur.value = bien.dpe.valeur;
    if (bien.ges && bien.ges.valeur) f.gesValeur.value = bien.ges.valeur;
    (bien.pointsForts || []).forEach(function (p) {
      var c = form.querySelector('[name="pointsForts"][value="' + p.replace(/"/g, '\\"') + '"]');
      if (c) c.checked = true;
    });
  }

  function cocher(nom, valeur) {
    var r = form.querySelector('[name="' + nom + '"][value="' + (valeur || '') + '"]');
    if (r) r.checked = true;
  }

  function radio(nom) {
    var r = form.querySelector('[name="' + nom + '"]:checked');
    return r ? r.value : '';
  }

  function collecter() {
    var d = Object.assign({}, bien);
    d.transaction = radio('transaction') || 'vente';
    CHAMPS_TEXTE.forEach(function (nom) { d[nom] = f[nom].value.trim(); });
    CHAMPS_NOMBRE.forEach(function (nom) {
      var v = f[nom].value === '' ? undefined : Number(f[nom].value);
      if (v === undefined) delete d[nom]; else d[nom] = v;
    });
    d.visible = f.visible.checked;
    d.coupDeCoeur = f.coupDeCoeur.checked;
    var terrain = d.type === 'Terrain';
    d.dpe = !terrain && radio('dpe') ? { classe: radio('dpe'), valeur: Number(f.dpeValeur.value) || undefined } : null;
    d.ges = !terrain && radio('ges') ? { classe: radio('ges'), valeur: Number(f.gesValeur.value) || undefined } : null;
    if (terrain) d.terrain = d.surface;
    d.pointsForts = Array.from(form.querySelectorAll('[name="pointsForts"]:checked')).map(function (c) { return c.value; });
    d.photos = photos;
    return d;
  }

  /* ==========================================================
     Affichage selon le type de bien et la transaction
     ========================================================== */

  function adapter() {
    var estLocation = radio('transaction') === 'location';
    var terrain = f.type.value === 'Terrain';
    document.querySelector('[data-si-location]').hidden = !estLocation;
    document.querySelector('[data-si-vente]').hidden = estLocation || terrain;
    document.querySelectorAll('[data-sauf-terrain]').forEach(function (el) { el.hidden = terrain; });
    document.querySelector('[data-libelle-prix]').textContent = estLocation ? 'Loyer mensuel hors charges' : 'Prix de vente';
    document.querySelector('[data-unite-prix]').textContent = estLocation ? '€ / mois' : '€';
    document.querySelector('[data-libelle-surface]').textContent = terrain ? 'Surface du terrain' : 'Surface habitable';
    document.querySelector('[data-libelle-vendu]').textContent = estLocation ? 'Loué' : 'Vendu';
    document.querySelector('[data-compteur-titre]').textContent = f.titre.value.length + ' / 80';
  }

  function majEntete() {
    var d = collecter();
    document.querySelector('[data-titre-page]').textContent = existant ? 'Modifier le bien' : 'Ajouter un bien';
    var pastille = document.querySelector('[data-statut-actuel]');
    var ref = existant ? store.bien(bien.id) : null;
    var statut = ref ? ref.statut : 'brouillon';
    pastille.className = 'statut statut--' + statut;
    pastille.textContent = ref ? A.statutLibelle(ref) + (ref.visible === false ? ' · masqué' : '') : 'Pas encore enregistré';
    document.querySelector('[data-derniere-modif]').textContent = ref && ref.dateModif ? 'Modifié ' + A.dateRelative(ref.dateModif) : '';
    document.querySelector('[data-zone-suppression]').hidden = !existant;
    document.title = (d.titre || 'Nouveau bien') + ' · Espace agence';
  }

  function apercu() {
    var d = collecter();
    if (!d.titre) d.titre = 'Titre de l’annonce';
    if (!d.surface) d.surface = 0;
    if (!d.dateAjout) d.dateAjout = new Date().toISOString();
    document.querySelector('[data-apercu]').innerHTML = B.carte(d, { niveau: 3 });
  }

  /* ==========================================================
     Photos : ajout, glisser-déposer, ordre, photo principale
     ========================================================== */

  var listePhotos = document.querySelector('[data-photos]');
  var depot = document.querySelector('[data-depot]');
  var champPhotos = document.querySelector('[data-champ-photos]');
  var enCours = 0;

  function afficherPhotos() {
    listePhotos.innerHTML = photos.map(function (p, i) {
      return '<li class="photo" draggable="true" data-index="' + i + '">' +
        '<div class="photo__image"><img src="' + esc(B.photoUrl(p, 400)) + '" alt="">' +
        (i === 0 ? '<span class="photo__principale">Photo principale</span>' : '') + '</div>' +
        '<label class="sr-only" for="legende-' + i + '">Légende de la photo ' + (i + 1) + '</label>' +
        '<input class="photo__legende" id="legende-' + i + '" type="text" value="' + esc(p.alt || '') + '" placeholder="Légende (ex. Séjour)" data-legende>' +
        '<div class="photo__actions">' +
          '<button type="button" class="icone-bouton" data-photo="gauche" title="Avancer"' + (i === 0 ? ' disabled' : '') + '><svg class="ico"><use href="#i-gauche"/></svg><span class="sr-only">Déplacer vers la gauche</span></button>' +
          '<button type="button" class="icone-bouton" data-photo="droite" title="Reculer"' + (i === photos.length - 1 ? ' disabled' : '') + '><svg class="ico"><use href="#i-droite"/></svg><span class="sr-only">Déplacer vers la droite</span></button>' +
          '<button type="button" class="icone-bouton" data-photo="principale" title="Choisir comme photo principale"' + (i === 0 ? ' disabled' : '') + '><svg class="ico"><use href="#i-etoile"/></svg><span class="sr-only">Choisir comme photo principale</span></button>' +
          '<button type="button" class="icone-bouton icone-bouton--danger" data-photo="supprimer" title="Retirer la photo"><svg class="ico"><use href="#i-poubelle"/></svg><span class="sr-only">Retirer la photo</span></button>' +
        '</div></li>';
    }).join('') + (enCours ? Array(enCours + 1).join('<li class="photo photo--chargement" aria-hidden="true"><div class="photo__image"></div></li>') : '');
    document.querySelector('[data-compte-photos]').textContent = photos.length + ' photo' + (photos.length > 1 ? 's' : '');
    apercu();
  }

  function ajouterFichiers(fichiers) {
    var images = Array.from(fichiers).filter(function (fi) { return /^image\//.test(fi.type); });
    if (!images.length) return;
    enCours += images.length;
    afficherPhotos();
    images.forEach(function (fi) {
      A.lireFichierImage(fi, 1400, 0.72).then(function (src) {
        photos.push({ src: src, alt: '' });
      }).catch(function () {
        A.toast('Impossible de lire « ' + fi.name + ' »', { type: 'erreur' });
      }).then(function () {
        enCours--;
        marquerModifie();
        afficherPhotos();
      });
    });
  }

  function deplacer(de, vers) {
    if (vers < 0 || vers >= photos.length) return;
    var p = photos.splice(de, 1)[0];
    photos.splice(vers, 0, p);
    marquerModifie();
    afficherPhotos();
  }

  champPhotos.addEventListener('change', function () { ajouterFichiers(champPhotos.files); champPhotos.value = ''; });
  depot.addEventListener('click', function (e) { if (!e.target.closest('label')) champPhotos.click(); });
  ['dragenter', 'dragover'].forEach(function (ev) {
    depot.addEventListener(ev, function (e) {
      if (e.dataTransfer.types.indexOf('Files') === -1) return;
      e.preventDefault();
      depot.classList.add('est-survole');
    });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    depot.addEventListener(ev, function () { depot.classList.remove('est-survole'); });
  });
  depot.addEventListener('drop', function (e) {
    e.preventDefault();
    ajouterFichiers(e.dataTransfer.files);
  });

  listePhotos.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-photo]');
    if (!btn) return;
    var i = parseInt(btn.closest('[data-index]').dataset.index, 10);
    var action = btn.dataset.photo;
    if (action === 'gauche') deplacer(i, i - 1);
    if (action === 'droite') deplacer(i, i + 1);
    if (action === 'principale') { deplacer(i, 0); A.toast('Photo principale changée'); }
    if (action === 'supprimer') { photos.splice(i, 1); marquerModifie(); afficherPhotos(); }
  });
  listePhotos.addEventListener('input', function (e) {
    if (!e.target.matches('[data-legende]')) return;
    photos[parseInt(e.target.closest('[data-index]').dataset.index, 10)].alt = e.target.value;
    marquerModifie();
  });

  // Réorganisation à la souris (sur téléphone : les flèches)
  var glisse = null;
  listePhotos.addEventListener('dragstart', function (e) {
    var li = e.target.closest('[data-index]');
    if (!li) return;
    glisse = parseInt(li.dataset.index, 10);
    li.classList.add('est-deplace');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(glisse));
  });
  listePhotos.addEventListener('dragover', function (e) {
    if (glisse === null) return;
    e.preventDefault();
    var li = e.target.closest('[data-index]');
    listePhotos.querySelectorAll('.est-cible').forEach(function (x) { x.classList.remove('est-cible'); });
    if (li) li.classList.add('est-cible');
  });
  listePhotos.addEventListener('drop', function (e) {
    if (glisse === null) return;
    e.preventDefault();
    var li = e.target.closest('[data-index]');
    if (li) deplacer(glisse, parseInt(li.dataset.index, 10));
  });
  listePhotos.addEventListener('dragend', function () {
    glisse = null;
    listePhotos.querySelectorAll('.est-deplace, .est-cible').forEach(function (x) { x.classList.remove('est-deplace', 'est-cible'); });
  });

  /* ==========================================================
     Validation et enregistrement
     ========================================================== */

  var zoneErreurs = document.querySelector('[data-erreurs]');

  function valider(d, pourPublier) {
    var erreurs = [];
    if (!d.titre) erreurs.push(['titre', 'Donnez un titre à l’annonce.']);
    if (pourPublier) {
      if (!d.prix) erreurs.push(['prix', 'Indiquez le ' + (d.transaction === 'location' ? 'loyer' : 'prix') + '.']);
      if (!d.ville) erreurs.push(['ville', 'Indiquez la ville.']);
      if (!d.surface) erreurs.push(['surface', 'Indiquez la surface.']);
      if (!d.photos.length) erreurs.push(['photos', 'Ajoutez au moins une photo : c’est ce qu’on regarde en premier.']);
    }
    form.querySelectorAll('.est-invalide').forEach(function (el) { el.classList.remove('est-invalide'); el.removeAttribute('aria-invalid'); });
    erreurs.forEach(function (er) {
      var champ = f[er[0]];
      if (champ && champ.classList) { champ.classList.add('est-invalide'); champ.setAttribute('aria-invalid', 'true'); }
    });
    if (erreurs.length) {
      zoneErreurs.innerHTML = '<strong>Il manque ' + (erreurs.length > 1 ? 'quelques informations' : 'une information') + ' :</strong><ul>' +
        erreurs.map(function (er) { return '<li><a href="#' + (er[0] === 'photos' ? 't-photos' : er[0]) + '">' + er[1] + '</a></li>'; }).join('') + '</ul>';
      zoneErreurs.hidden = false;
      zoneErreurs.focus();
    } else {
      zoneErreurs.hidden = true;
    }
    return erreurs.length === 0;
  }

  // mode : 'brouillon' | 'publier' | 'apercu'
  function enregistrer(mode) {
    var d = collecter();
    if (!valider(d, mode === 'publier')) return null;
    var avant = existant ? store.bien(bien.id) : null;
    var etaitPublic = avant && avant.statut !== 'brouillon' && avant.visible !== false;

    if (mode === 'brouillon') d.statut = 'brouillon';
    if (mode === 'publier') {
      if (d.statut === 'brouillon') d.statut = 'en-ligne';
      d.visible = true;
    }
    if (mode === 'apercu' && !existant) d.statut = 'brouillon';

    var resultat = store.enregistrerBien(d);
    if (!resultat) {
      A.toast('Les photos sont trop lourdes pour la démo. Retirez-en une ou deux puis réessayez.', { type: 'erreur' });
      return null;
    }
    bien = resultat;
    existant = resultat;
    f.statut.value = bien.statut;
    f.visible.checked = bien.visible !== false;
    modifie = false;
    history.replaceState(null, '', 'bien-edition.html?id=' + encodeURIComponent(bien.id));
    majEntete();
    A.compteurs();

    if (mode === 'publier') A.toast(etaitPublic ? 'Modifications publiées sur le site' : 'Bien publié : il est en ligne sur les trois sites');
    if (mode === 'brouillon') A.toast('Brouillon enregistré');
    return bien;
  }

  function marquerModifie() { modifie = true; }

  form.addEventListener('input', function () { marquerModifie(); adapter(); apercu(); });
  form.addEventListener('change', function () { marquerModifie(); adapter(); apercu(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); enregistrer('publier'); });

  document.querySelector('[data-barre-actions]').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'brouillon') enregistrer('brouillon');
    if (btn.dataset.action === 'publier') enregistrer('publier');
    if (btn.dataset.action === 'voir') A.voirSite();
  });

  // « Voir sur le site » : on enregistre d'abord, puis on ouvre la fiche
  A.definirPageSite(function () {
    var b = enregistrer('apercu');
    if (!b) return false;
    return 'bien.html?id=' + encodeURIComponent(b.id) + '&apercu=1';
  });

  document.querySelector('[data-action="supprimer"]').addEventListener('click', function () {
    A.confirmer({
      titre: 'Supprimer ce bien ?',
      texte: '« ' + bien.titre + ' » disparaîtra du site et de votre liste. Cette action est définitive.',
      bouton: 'Supprimer'
    }).then(function (ok) {
      if (!ok) return;
      store.supprimerBien(bien.id);
      modifie = false;
      A.flash('Bien supprimé');
      location.href = 'biens.html';
    });
  });

  // Ctrl+S / Cmd+S : enregistre sans changer le statut
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      enregistrer(f.statut.value === 'brouillon' ? 'brouillon' : 'publier');
    }
  });

  window.addEventListener('beforeunload', function (e) {
    if (!modifie) return;
    e.preventDefault();
    e.returnValue = '';
  });

  remplir();
  adapter();
  afficherPhotos();
  majEntete();
})();
