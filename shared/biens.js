/*
 * Affichage des biens, commun aux trois sites.
 *
 * Chaque page déclare ce dont elle a besoin avec des attributs data-* :
 *   [data-biens-grille]   une sélection de cartes (accueil, vendus récemment…)
 *   [data-filtres]        la page « Nos biens » : filtres, tri, pagination
 *   [data-fiche]          la fiche d'un bien (bien.html?id=…)
 * Le HTML généré est le même partout ; c'est le CSS de chaque site qui lui
 * donne son allure.
 */
window.Immo = window.Immo || {};

(function () {
  'use strict';

  var store = window.Immo.store;
  var JOURS_NOUVEAU = 7;

  /* ==========================================================
     Outils de formatage
     ========================================================== */

  function esc(texte) {
    return String(texte == null ? '' : texte)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function nombre(n) {
    return Number(n || 0).toLocaleString('fr-FR').replace(/ /g, ' ');
  }

  function prix(b) {
    if (!b.prix) return 'Prix sur demande';
    return nombre(b.prix) + ' €' + (b.transaction === 'location' ? ' / mois' : '');
  }

  function pluriel(n, mot) {
    return n + ' ' + mot + (n > 1 ? 's' : '');
  }

  function estTerrain(b) {
    return b.type === 'Terrain';
  }

  function lieu(b) {
    return [b.quartier, b.ville].filter(Boolean).join(' · ');
  }

  function infos(b) {
    if (estTerrain(b)) return [nombre(b.surface) + ' m² de terrain'];
    var liste = [b.surface + ' m²'];
    if (b.pieces) liste.push(pluriel(b.pieces, 'pièce'));
    if (b.chambres) liste.push(pluriel(b.chambres, 'chambre'));
    else if (b.terrain) liste.push(nombre(b.terrain) + ' m² de terrain');
    return liste;
  }

  function estNouveau(b) {
    var jours = (Date.now() - new Date(b.dateAjout)) / 86400000;
    return b.statut === 'en-ligne' && jours <= JOURS_NOUVEAU;
  }

  function badge(b) {
    if (b.statut === 'vendu') return { classe: 'vendu', texte: b.transaction === 'location' ? 'Loué' : 'Vendu' };
    if (b.statut === 'sous-offre') return { classe: 'offre', texte: 'Sous offre' };
    if (estNouveau(b)) return { classe: 'nouveau', texte: 'Nouveau' };
    return null;
  }

  /* ==========================================================
     Images : les photos Unsplash sont redimensionnées à la volée,
     les photos ajoutées dans l'admin sont déjà réduites.
     ========================================================== */

  function estUnsplash(src) {
    return /images\.unsplash\.com/.test(src);
  }

  function photoUrl(photo, largeur) {
    if (!photo) return '';
    return estUnsplash(photo.src) ? photo.src + '&w=' + largeur : photo.src;
  }

  function img(photo, opts) {
    opts = opts || {};
    if (!photo) return '<span class="photo-absente">Photo à venir</span>';
    var attrs = ' src="' + esc(photoUrl(photo, opts.largeur || 900)) + '" alt="' + esc(opts.alt != null ? opts.alt : photo.alt) + '"';
    if (estUnsplash(photo.src)) {
      attrs += ' srcset="' + [480, 800, 1200, 1800].map(function (w) {
        return esc(photo.src + '&w=' + w) + ' ' + w + 'w';
      }).join(', ') + '" sizes="' + (opts.sizes || '(max-width: 700px) 100vw, 50vw') + '"';
    }
    attrs += opts.eager ? ' fetchpriority="high"' : ' loading="lazy"';
    return '<img' + attrs + ' decoding="async">';
  }

  /* ==========================================================
     Carte d'un bien
     ========================================================== */

  function carte(b, opts) {
    opts = opts || {};
    var h = opts.niveau || 3;
    var bdg = badge(b);
    var url = (opts.base || '') + 'bien.html?id=' + encodeURIComponent(b.id);
    return '' +
      '<article class="carte-bien carte-bien--' + b.statut + '">' +
        '<a class="carte-bien__lien" href="' + url + '">' +
          '<div class="carte-bien__media">' +
            img(b.photos[0], { sizes: opts.sizes, alt: '' }) +
            (bdg ? '<span class="badge badge--' + bdg.classe + '">' + bdg.texte + '</span>' : '') +
          '</div>' +
          '<div class="carte-bien__corps">' +
            '<p class="carte-bien__lieu">' + esc(lieu(b)) + '</p>' +
            '<h' + h + ' class="carte-bien__titre">' + esc(b.titre) + '</h' + h + '>' +
            '<ul class="carte-bien__infos">' + infos(b).map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>' +
            '<p class="carte-bien__prix">' + prix(b) + '</p>' +
          '</div>' +
        '</a>' +
      '</article>';
  }

  // Tri par défaut : biens disponibles d'abord (coups de cœur en tête), vendus à la fin
  function triRecent(a, b) {
    var va = a.statut === 'vendu' ? 1 : 0;
    var vb = b.statut === 'vendu' ? 1 : 0;
    if (va !== vb) return va - vb;
    return new Date(b.dateAjout) - new Date(a.dateAjout);
  }

  /* ==========================================================
     Sélections de biens : [data-biens-grille]
       data-transaction="vente|location"  data-statut="vendu|disponible"
       data-nombre="3"  data-niveau="3"   data-coups-de-coeur
     ========================================================== */

  function grille(el) {
    var d = el.dataset;
    var liste = store.biensPublics().filter(function (b) {
      if (d.transaction && b.transaction !== d.transaction) return false;
      if (d.statut === 'vendu') return b.statut === 'vendu';
      return b.statut !== 'vendu';
    });
    liste.sort(function (a, b) {
      if (d.coupsDeCoeur !== undefined && !!a.coupDeCoeur !== !!b.coupDeCoeur) return a.coupDeCoeur ? -1 : 1;
      return triRecent(a, b);
    });
    liste = liste.slice(0, parseInt(d.nombre, 10) || 3);
    el.innerHTML = liste.map(function (b, i) {
      return carte(b, { niveau: d.niveau, sizes: i === 0 && d.uneGrande !== undefined ? '(max-width: 700px) 100vw, 60vw' : '(max-width: 700px) 100vw, 33vw' });
    }).join('');
    el.classList.toggle('est-vide', !liste.length);
  }

  // [data-biens-compte="vente|location|tous"] : nombre de biens disponibles
  function compteurs() {
    var dispo = store.biensPublics().filter(function (b) { return b.statut !== 'vendu'; });
    document.querySelectorAll('[data-biens-compte]').forEach(function (el) {
      var t = el.dataset.biensCompte;
      el.textContent = dispo.filter(function (b) { return t === 'tous' || b.transaction === t; }).length;
    });
  }

  /* ==========================================================
     Page « Nos biens » : filtres, tri et pagination
     ========================================================== */

  var BUDGETS = {
    vente: [100000, 150000, 200000, 250000, 300000, 400000, 500000],
    location: [500, 600, 800, 1000, 1200, 1500]
  };

  function remplirSelect(select, valeurs, libelleVide, formatter) {
    if (!select) return;
    var actuelle = select.value;
    select.innerHTML = '<option value="">' + libelleVide + '</option>' + valeurs.map(function (v) {
      return '<option value="' + esc(v) + '">' + esc(formatter ? formatter(v) : v) + '</option>';
    }).join('');
    if (valeurs.map(String).indexOf(actuelle) !== -1) select.value = actuelle;
  }

  function liste(form) {
    var conteneur = document.querySelector('[data-resultats]');
    var compte = document.querySelector('[data-resultats-compte]');
    var pagination = document.querySelector('[data-pagination]');
    var vide = document.querySelector('[data-resultats-vide]');
    var parPage = parseInt(conteneur.dataset.parPage, 10) || 6;
    var page = 1;
    var tous = store.biensPublics();

    // Options construites à partir des biens réellement en ligne
    var villes = tous.map(function (b) { return b.ville; })
      .filter(function (v, i, arr) { return v && arr.indexOf(v) === i; }).sort();
    remplirSelect(form.elements.type, window.Immo.data.listes.types, 'Tous les types');
    remplirSelect(form.elements.ville, villes, 'Toutes les villes');

    function majBudgets() {
      var t = valeur('transaction') || 'vente';
      remplirSelect(form.elements.budget, BUDGETS[t], 'Pas de maximum', function (v) {
        return 'Jusqu’à ' + nombre(v) + ' €' + (t === 'location' ? ' / mois' : '');
      });
    }

    function valeur(nom) {
      var champ = form.elements[nom];
      if (!champ) return '';
      if (champ.type === 'checkbox') return champ.checked;
      return champ.value || '';
    }

    // Les paramètres d'URL pré-remplissent les filtres (recherche depuis l'accueil)
    var params = new URLSearchParams(location.search);
    ['transaction', 'type', 'ville', 'pieces', 'tri'].forEach(function (nom) {
      if (params.has(nom) && form.elements[nom]) form.elements[nom].value = params.get(nom);
    });
    majBudgets();
    if (params.has('budget')) form.elements.budget.value = params.get('budget');
    page = parseInt(params.get('page'), 10) || 1;

    // Nombre de biens disponibles sur chaque onglet Acheter / Louer
    document.querySelectorAll('[data-compte-transaction]').forEach(function (el) {
      el.textContent = tous.filter(function (b) {
        return b.transaction === el.dataset.compteTransaction && b.statut !== 'vendu';
      }).length;
    });

    function filtrer() {
      var t = valeur('transaction') || 'vente';
      var type = valeur('type');
      var ville = valeur('ville');
      var budget = parseInt(valeur('budget'), 10);
      var pieces = parseInt(valeur('pieces'), 10);
      var sansVendus = valeur('masquerVendus');
      var res = tous.filter(function (b) {
        if (b.transaction !== t) return false;
        if (type && b.type !== type) return false;
        if (ville && b.ville !== ville) return false;
        if (budget && b.prix > budget) return false;
        if (pieces && (b.pieces || 0) < pieces) return false;
        if (sansVendus && b.statut === 'vendu') return false;
        return true;
      });
      var tri = valeur('tri');
      res.sort(function (a, b) {
        if (tri === 'prix-asc') return a.prix - b.prix;
        if (tri === 'prix-desc') return b.prix - a.prix;
        if (tri === 'surface-desc') return b.surface - a.surface;
        return triRecent(a, b);
      });
      return res;
    }

    function majUrl() {
      var p = new URLSearchParams();
      ['transaction', 'type', 'ville', 'budget', 'pieces', 'tri'].forEach(function (nom) {
        var v = valeur(nom);
        if (v && !(nom === 'transaction' && v === 'vente')) p.set(nom, v);
      });
      if (page > 1) p.set('page', page);
      var qs = p.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
    }

    function afficher(defiler) {
      var res = filtrer();
      var pages = Math.max(1, Math.ceil(res.length / parPage));
      page = Math.min(page, pages);
      var extrait = res.slice((page - 1) * parPage, page * parPage);

      conteneur.innerHTML = extrait.map(function (b) {
        return carte(b, { niveau: 2, sizes: '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw' });
      }).join('');
      if (vide) vide.hidden = res.length > 0;

      var dispo = res.filter(function (b) { return b.statut !== 'vendu'; }).length;
      compte.textContent = res.length
        ? pluriel(res.length, 'bien') + (dispo < res.length ? ', dont ' + dispo + ' disponible' + (dispo > 1 ? 's' : '') : '')
        : 'Aucun bien';

      pagination.innerHTML = pages < 2 ? '' : Array.from({ length: pages }, function (_, i) {
        var n = i + 1;
        return '<button type="button" class="pagination__page" data-page="' + n + '"' +
          (n === page ? ' aria-current="page"' : '') + ' aria-label="Page ' + n + '">' + n + '</button>';
      }).join('');

      majUrl();
      if (defiler) conteneur.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.Immo.ui) window.Immo.ui.reveler(conteneur);
    }

    // Les champs liés par l'attribut form="" (le tri) ne remontent pas l'événement au formulaire
    document.addEventListener('change', function (e) {
      if (e.target.form !== form) return;
      if (e.target.name === 'transaction') majBudgets();
      page = 1;
      afficher();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    form.addEventListener('reset', function () {
      setTimeout(function () { majBudgets(); page = 1; afficher(); });
    });
    pagination.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-page]');
      if (!btn) return;
      page = parseInt(btn.dataset.page, 10);
      afficher(true);
    });

    // Sur mobile, les filtres se replient derrière un bouton
    var bascule = document.querySelector('[data-filtres-bascule]');
    if (bascule) {
      bascule.addEventListener('click', function () {
        var ouvert = bascule.getAttribute('aria-expanded') === 'true';
        bascule.setAttribute('aria-expanded', String(!ouvert));
        form.classList.toggle('est-ouvert', !ouvert);
      });
    }

    afficher();
  }

  /* ==========================================================
     Visionneuse plein écran (dialog natif : Échap, focus piégé)
     ========================================================== */

  var visionneuse = (function () {
    var dlg, imgEl, legende, compteur, photos = [], index = 0, titre = '';

    function construire() {
      dlg = document.createElement('dialog');
      dlg.className = 'visionneuse';
      dlg.setAttribute('aria-label', 'Photos du bien');
      dlg.innerHTML =
        '<div class="visionneuse__barre">' +
          '<p class="visionneuse__compteur" aria-live="polite"></p>' +
          '<button type="button" class="visionneuse__fermer" data-v="fermer">Fermer<span aria-hidden="true"> ×</span></button>' +
        '</div>' +
        '<figure class="visionneuse__scene">' +
          '<img class="visionneuse__img" alt="">' +
          '<figcaption class="visionneuse__legende"></figcaption>' +
        '</figure>' +
        '<button type="button" class="visionneuse__nav visionneuse__nav--prec" data-v="prec" aria-label="Photo précédente"><span aria-hidden="true">‹</span></button>' +
        '<button type="button" class="visionneuse__nav visionneuse__nav--suiv" data-v="suiv" aria-label="Photo suivante"><span aria-hidden="true">›</span></button>';
      document.body.appendChild(dlg);
      imgEl = dlg.querySelector('.visionneuse__img');
      legende = dlg.querySelector('.visionneuse__legende');
      compteur = dlg.querySelector('.visionneuse__compteur');

      dlg.addEventListener('click', function (e) {
        var action = e.target.closest('[data-v]');
        if (action) {
          if (action.dataset.v === 'fermer') dlg.close();
          if (action.dataset.v === 'prec') aller(index - 1);
          if (action.dataset.v === 'suiv') aller(index + 1);
        } else if (e.target === dlg || e.target.classList.contains('visionneuse__scene')) {
          dlg.close();
        }
      });
      dlg.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') aller(index - 1);
        if (e.key === 'ArrowRight') aller(index + 1);
      });
      dlg.addEventListener('close', function () { document.documentElement.classList.remove('sans-defilement'); });

      // Balayage au doigt
      var x0 = null;
      dlg.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      dlg.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 50) aller(index + (dx < 0 ? 1 : -1));
        x0 = null;
      });
    }

    function aller(i) {
      index = (i + photos.length) % photos.length;
      var p = photos[index];
      imgEl.classList.remove('est-chargee');
      imgEl.onload = function () { imgEl.classList.add('est-chargee'); };
      imgEl.src = photoUrl(p, 1800);
      imgEl.alt = p.alt || titre;
      legende.textContent = p.alt || '';
      compteur.textContent = (index + 1) + ' / ' + photos.length;
      // On précharge la suivante pour que la navigation reste fluide
      if (photos.length > 1) new Image().src = photoUrl(photos[(index + 1) % photos.length], 1800);
    }

    return {
      ouvrir: function (liste, depart, t) {
        if (!dlg) construire();
        photos = liste;
        titre = t || '';
        dlg.classList.toggle('est-unique', photos.length < 2);
        aller(depart || 0);
        document.documentElement.classList.add('sans-defilement');
        dlg.showModal();
      }
    };
  })();

  /* ==========================================================
     Fiche bien
     ========================================================== */

  var DPE_SEUILS = { energie: [70, 110, 180, 250, 330, 420], climat: [6, 11, 30, 50, 70, 100] };
  var LETTRES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  function echelle(genre, mesure, titre, unite) {
    if (!mesure || !mesure.classe) return '';
    return '' +
      '<div class="dpe__bloc dpe__bloc--' + genre + '">' +
        '<h3 class="dpe__titre">' + titre + '</h3>' +
        '<p class="sr-only">Classe ' + mesure.classe + (mesure.valeur ? ', ' + mesure.valeur + ' ' + unite : '') + '</p>' +
        '<ol class="dpe__echelle" aria-hidden="true">' +
          LETTRES.map(function (l, i) {
            var actif = l === mesure.classe;
            var borne = i === 0 ? '≤ ' + DPE_SEUILS[genre][0]
              : i === 6 ? '> ' + DPE_SEUILS[genre][5]
              : (DPE_SEUILS[genre][i - 1] + 1) + ' à ' + DPE_SEUILS[genre][i];
            return '<li class="dpe__classe dpe__classe--' + l.toLowerCase() + (actif ? ' est-active' : '') + '">' +
              '<span class="dpe__lettre">' + l + '</span>' +
              '<span class="dpe__borne">' + borne + '</span>' +
              (actif && mesure.valeur ? '<span class="dpe__valeur">' + mesure.valeur + ' <small>' + unite + '</small></span>' : '') +
            '</li>';
          }).join('') +
        '</ol>' +
      '</div>';
  }

  function dpe(b) {
    if (!b.dpe) return '<p class="dpe__non-soumis">Ce bien n’est pas soumis au diagnostic de performance énergétique.</p>';
    var html = echelle('energie', b.dpe, 'Consommation énergétique', 'kWh/m²/an') +
      echelle('climat', b.ges, 'Émissions de gaz à effet de serre', 'kg CO₂/m²/an');
    if (b.dpe.valeur && b.surface) {
      // Fourchette indicative, calculée comme sur les DPE (prix moyens de l'énergie)
      var cout = b.dpe.valeur * b.surface * 0.115;
      var arrondi = function (n) { return nombre(Math.round(n / 10) * 10); };
      html += '<p class="dpe__cout">Estimation des coûts annuels d’énergie : entre ' + arrondi(cout * 0.8) +
        ' € et ' + arrondi(cout * 1.15) + ' € par an (prix moyens des énergies indexés au 1<sup>er</sup> janvier 2021).</p>';
    }
    return html;
  }

  function galerie(b) {
    var photos = b.photos || [];
    if (!photos.length) return '<div class="galerie galerie--vide"><span class="photo-absente">Photos à venir</span></div>';
    var visibles = photos.slice(0, 5);
    return '<div class="galerie galerie--' + visibles.length + '">' +
      visibles.map(function (p, i) {
        return '<button type="button" class="galerie__item" data-photo="' + i + '" aria-label="Agrandir la photo ' + (i + 1) + ' : ' + esc(p.alt || '') + '">' +
          img(p, { eager: i === 0, largeur: i === 0 ? 1400 : 700, sizes: i === 0 ? '(max-width: 900px) 100vw, 60vw' : '(max-width: 900px) 100vw, 25vw' }) +
        '</button>';
      }).join('') +
      '<button type="button" class="galerie__tout" data-photo="0">Voir les ' + pluriel(photos.length, 'photo') + '</button>' +
    '</div>';
  }

  function caracteristiques(b) {
    var lignes = [
      ['Type de bien', b.type],
      ['Référence', b.ref],
      [estTerrain(b) ? 'Surface du terrain' : 'Surface habitable', b.surface ? nombre(b.surface) + ' m²' : ''],
      ['Terrain', !estTerrain(b) && b.terrain ? nombre(b.terrain) + ' m²' : ''],
      ['Pièces', b.pieces || ''],
      ['Chambres', b.chambres || ''],
      ['Salles d’eau / de bains', b.sdb || ''],
      ['Étage', b.etage],
      ['Chauffage', b.chauffage],
      ['Année de construction', b.annee]
    ];
    return '<dl class="caracteristiques">' + lignes.filter(function (l) { return l[1]; }).map(function (l) {
      return '<div class="caracteristiques__ligne"><dt>' + l[0] + '</dt><dd>' + esc(l[1]) + '</dd></div>';
    }).join('') + '</dl>';
  }

  function detailsPrix(b) {
    if (b.transaction === 'location') {
      var cc = (b.prix || 0) + (b.chargesMensuelles || 0);
      return '<p>Loyer ' + nombre(b.prix) + ' € + ' + nombre(b.chargesMensuelles || 0) + ' € de charges, soit <strong>' +
        nombre(cc) + ' € charges comprises</strong> par mois.</p>' +
        '<p>Dépôt de garantie : ' + nombre(b.depot || b.prix) + ' €. Honoraires à la charge du locataire : ' +
        nombre(b.honorairesLocataire || 0) + ' € TTC, dont ' + nombre(Math.round((b.surface || 0) * 3)) + ' € pour l’état des lieux.</p>';
    }
    var html = '<p>Honoraires à la charge du vendeur. <a href="honoraires.html">Voir le barème</a></p>';
    if (b.lots) {
      html += '<p>Copropriété de ' + b.lots + ' lots, charges annuelles de ' + nombre(b.charges) +
        ' €. Aucune procédure en cours contre le syndicat des copropriétaires.</p>';
    }
    return html;
  }

  function fiche(racine) {
    var params = new URLSearchParams(location.search);
    var b = store.bien(params.get('id'));
    var apercu = params.has('apercu');
    var publicOk = b && b.visible !== false && b.statut !== 'brouillon';
    var absent = document.querySelector('[data-fiche-absent]');

    if (!b || (!publicOk && !apercu)) {
      racine.hidden = true;
      if (absent) absent.hidden = false;
      document.title = 'Bien introuvable | ' + document.title.split(' | ').pop();
      return;
    }

    var champs = {
      titre: b.titre,
      prix: prix(b),
      lieu: lieu(b),
      ref: 'Réf. ' + b.ref,
      repere: b.repere,
      type: b.type,
      transaction: b.transaction === 'location' ? 'À louer' : 'À vendre',
      prixM2: b.transaction === 'vente' && b.surface && !estTerrain(b) ? nombre(Math.round(b.prix / b.surface)) + ' €/m²' : ''
    };
    racine.querySelectorAll('[data-champ]').forEach(function (el) {
      var v = champs[el.dataset.champ];
      el.textContent = v || '';
      if (!v && el.dataset.champ !== 'titre') el.hidden = true;
    });

    var bdg = badge(b);
    var zoneBadge = racine.querySelector('[data-fiche-badge]');
    if (zoneBadge) zoneBadge.innerHTML = bdg ? '<span class="badge badge--' + bdg.classe + '">' + bdg.texte + '</span>' : '';

    var blocs = {
      galerie: galerie(b),
      essentiel: '<ul class="essentiel">' + infos(b).concat(b.etage ? [b.etage] : []).map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>',
      description: (b.description || '').split(/\n\s*\n/).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join(''),
      caracteristiques: caracteristiques(b),
      points: (b.pointsForts || []).length ? '<ul class="points-forts">' + b.pointsForts.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' : '',
      dpe: '<div class="dpe">' + dpe(b) + '</div>',
      prixDetails: detailsPrix(b)
    };
    Object.keys(blocs).forEach(function (cle) {
      var el = racine.querySelector('[data-fiche-' + cle.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); }) + ']');
      if (el) el.innerHTML = blocs[cle];
    });
    racine.querySelectorAll('[data-si-points]').forEach(function (el) { el.hidden = !blocs.points; });

    racine.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-photo]');
      if (btn) visionneuse.ouvrir(b.photos, parseInt(btn.dataset.photo, 10), b.titre);
    });

    // Formulaire de visite : on rattache la demande au bien
    var form = document.querySelector('form[data-form="visite"]');
    if (form) {
      var cache = document.createElement('input');
      cache.type = 'hidden';
      cache.name = 'bienId';
      cache.value = b.id;
      form.appendChild(cache);
      var msg = form.elements.message;
      if (msg && !msg.value) msg.placeholder = 'Bonjour, je souhaite visiter « ' + b.titre + ' ». Je suis disponible…';
    }

    if (b.statut === 'vendu') racine.classList.add('est-vendu');
    var bandeau = document.querySelector('[data-fiche-apercu]');
    if (bandeau) bandeau.hidden = publicOk;

    // Biens similaires : même projet, prix le plus proche
    var zoneSim = document.querySelector('[data-fiche-similaires]');
    if (zoneSim) {
      var sim = store.biensPublics().filter(function (x) {
        return x.id !== b.id && x.transaction === b.transaction && x.statut !== 'vendu';
      }).sort(function (x, y) { return Math.abs(x.prix - b.prix) - Math.abs(y.prix - b.prix); }).slice(0, 3);
      zoneSim.innerHTML = sim.map(function (x) { return carte(x, { niveau: 3, sizes: '(max-width: 700px) 100vw, 33vw' }); }).join('');
      var section = zoneSim.closest('section');
      if (section && !sim.length) section.hidden = true;
    }

    // Titre et description de l'onglet propres au bien
    var suffixe = document.title.split(' | ').pop();
    document.title = b.titre + ' — ' + prix(b) + ' | ' + suffixe;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', b.type + ' ' + champs.transaction.toLowerCase() + ', ' + infos(b).join(', ') + ', ' + lieu(b) + '. ' + (b.description || '').split('\n')[0].slice(0, 110));
  }

  /* ==========================================================
     Recherche rapide de l'accueil : [data-recherche]
     Un simple formulaire GET vers biens.html, dont on remplit les listes.
     ========================================================== */

  function recherche(form) {
    var tous = store.biensPublics();
    var villes = tous.map(function (b) { return b.ville; })
      .filter(function (v, i, arr) { return v && arr.indexOf(v) === i; }).sort();
    remplirSelect(form.elements.type, window.Immo.data.listes.types, 'Tous les types');
    remplirSelect(form.elements.ville, villes, 'Toutes les villes');
    function majBudgets() {
      var coche = form.querySelector('[name="transaction"]:checked');
      var t = coche ? coche.value : 'vente';
      remplirSelect(form.elements.budget, BUDGETS[t], 'Budget max', function (v) {
        return nombre(v) + ' €' + (t === 'location' ? ' / mois' : '');
      });
    }
    form.addEventListener('change', function (e) {
      if (e.target.name === 'transaction') majBudgets();
    });
    majBudgets();
  }

  /* ==========================================================
     Démarrage automatique selon ce que contient la page
     ========================================================== */

  function demarrer() {
    document.querySelectorAll('form[data-recherche]').forEach(recherche);
    document.querySelectorAll('[data-biens-grille]').forEach(grille);
    compteurs();
    var form = document.querySelector('form[data-filtres]');
    if (form) liste(form);
    var racine = document.querySelector('[data-fiche]');
    if (racine) fiche(racine);
  }

  window.Immo.biens = {
    carte: carte,
    prix: prix,
    infos: infos,
    lieu: lieu,
    badge: badge,
    photoUrl: photoUrl,
    nombre: nombre,
    esc: esc,
    demarrer: demarrer
  };
})();
