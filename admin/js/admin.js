/*
 * Socle de l'espace agence : ce qui sert sur tous les écrans.
 *   - messages de confirmation (toasts), avec bouton « Annuler » si besoin
 *   - fenêtre de confirmation (suppression, réinitialisation)
 *   - « Voir sur le site » avec le choix du style
 *   - compteurs du menu, réinitialisation de la démo
 * Chaque écran a ensuite son petit fichier dans js/pages/.
 */
window.Immo = window.Immo || {};

(function () {
  'use strict';

  var store = window.Immo.store;
  var esc = window.Immo.biens.esc;
  var CLE_FLASH = 'immo-flash';
  var CLE_STYLE = 'immo-style-prefere';

  /* ---------- Toasts ---------- */

  function toast(message, opts) {
    opts = opts || {};
    var zone = document.querySelector('.toasts');
    var el = document.createElement('div');
    el.className = 'toast' + (opts.type ? ' toast--' + opts.type : '');
    el.setAttribute('role', opts.type === 'erreur' ? 'alert' : 'status');
    el.innerHTML = '<span class="toast__texte">' + esc(message) + '</span>';
    if (opts.action) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toast__action';
      btn.textContent = opts.action;
      btn.addEventListener('click', function () {
        opts.onAction();
        fermer();
      });
      el.appendChild(btn);
    }
    zone.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('est-visible'); });

    var minuterie = setTimeout(fermer, opts.action ? 7000 : 3800);
    function fermer() {
      clearTimeout(minuterie);
      el.classList.remove('est-visible');
      setTimeout(function () { el.remove(); }, 300);
    }
  }

  // Message à afficher sur la page suivante (après une redirection)
  function flash(message) {
    try { sessionStorage.setItem(CLE_FLASH, message); } catch (e) { /* tant pis */ }
  }

  function afficherFlash() {
    try {
      var m = sessionStorage.getItem(CLE_FLASH);
      if (m) {
        sessionStorage.removeItem(CLE_FLASH);
        setTimeout(function () { toast(m); }, 150);
      }
    } catch (e) { /* rien */ }
  }

  /* ---------- Fenêtre de confirmation ---------- */

  function confirmer(o) {
    var dlg = document.getElementById('modale-confirmation');
    dlg.querySelector('.modale__titre').textContent = o.titre;
    dlg.querySelector('[data-modale-texte]').textContent = o.texte || '';
    var ok = dlg.querySelector('[data-modale-ok]');
    ok.textContent = o.bouton || 'Confirmer';
    ok.className = 'bouton ' + (o.danger === false ? 'bouton--accent' : 'bouton--danger');
    dlg.returnValue = '';
    dlg.showModal();
    // Le bouton sûr (Annuler) reçoit le focus par défaut
    dlg.querySelector('[value="non"]').focus();
    return new Promise(function (resoudre) {
      dlg.addEventListener('close', function () { resoudre(dlg.returnValue === 'oui'); }, { once: true });
    });
  }

  /* ---------- Voir sur le site ---------- */

  var STYLES = { classique: '../site-classique/', moderne: '../site-moderne/', urbain: '../site-urbain/' };

  // Un écran peut définir la page à ouvrir (ex. la fiche du bien en cours d'édition)
  var pageSite = function () { return 'index.html'; };

  function voirSite(page) {
    var dlg = document.getElementById('modale-site');
    var cible = page || pageSite();
    if (typeof cible === 'function') cible = cible();
    if (cible === false) return; // l'écran a refusé (formulaire invalide…)
    dlg.dataset.cible = cible;
    var prefere;
    try { prefere = localStorage.getItem(CLE_STYLE); } catch (e) { prefere = null; }
    dlg.querySelectorAll('[data-style]').forEach(function (b) {
      b.classList.toggle('est-prefere', b.dataset.style === prefere);
    });
    dlg.showModal();
    var focus = dlg.querySelector('.est-prefere') || dlg.querySelector('[data-style]');
    focus.focus();
  }

  function brancherModaleSite() {
    var dlg = document.getElementById('modale-site');
    if (!dlg) return;
    dlg.addEventListener('click', function (e) {
      var choix = e.target.closest('[data-style]');
      if (choix) {
        try { localStorage.setItem(CLE_STYLE, choix.dataset.style); } catch (err) { /* rien */ }
        window.open(STYLES[choix.dataset.style] + dlg.dataset.cible, '_blank', 'noopener');
        dlg.close();
      }
      if (e.target.closest('[data-fermer-modale]') || e.target === dlg) dlg.close();
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-voir-site]')) voirSite();
    });
  }

  /* ---------- Compteurs du menu ---------- */

  function compteurs() {
    var nbBiens = store.biens().length;
    var nouvelles = store.demandes().filter(function (d) { return d.statut === 'nouveau'; }).length;
    document.querySelectorAll('[data-compte-biens]').forEach(function (el) { el.textContent = nbBiens; });
    document.querySelectorAll('[data-compte-nouvelles]').forEach(function (el) {
      el.textContent = nouvelles;
      el.hidden = !nouvelles;
      el.setAttribute('aria-label', nouvelles + ' nouvelle' + (nouvelles > 1 ? 's' : ''));
    });
  }

  /* ---------- Réinitialisation de la démo ---------- */

  function brancherReinitialisation() {
    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-reinitialiser]')) return;
      confirmer({
        titre: 'Réinitialiser la démo ?',
        texte: 'Les biens, les demandes et les paramètres reviennent aux exemples de départ. Ce que vous avez ajouté ou modifié sera effacé.',
        bouton: 'Réinitialiser'
      }).then(function (ok) {
        if (!ok) return;
        store.reinitialiser();
        flash('Démo réinitialisée : les biens d’exemple sont de retour');
        location.href = location.pathname.replace(/[^/]*$/, '') + 'index.html';
      });
    });
  }

  /* ---------- Petits outils partagés par les écrans ---------- */

  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  function heure(d) {
    return d.getHours() + ' h ' + String(d.getMinutes()).padStart(2, '0');
  }

  function dateRelative(iso) {
    var d = new Date(iso);
    var maintenant = new Date();
    var minutes = Math.round((maintenant - d) / 60000);
    if (minutes < 1) return 'à l’instant';
    if (minutes < 60) return 'il y a ' + minutes + ' min';
    var debutJour = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
    if (d >= debutJour) return 'aujourd’hui, ' + heure(d);
    var hier = new Date(debutJour - 86400000);
    if (d >= hier) return 'hier, ' + heure(d);
    if (maintenant - d < 6 * 86400000) return JOURS[d.getDay()];
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  function dateLongue(iso) {
    return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' à ' + heure(new Date(iso));
  }

  function statutLibelle(b) {
    if (b.statut === 'vendu') return b.transaction === 'location' ? 'Loué' : 'Vendu';
    return window.Immo.data.listes.statuts[b.statut] || b.statut;
  }

  function lireFichierImage(fichier, largeurMax, qualite) {
    // Réduit la photo avant de la stocker : le localStorage est limité (~5 Mo)
    return new Promise(function (resoudre, rejeter) {
      var lecteur = new FileReader();
      lecteur.onerror = rejeter;
      lecteur.onload = function () {
        var img = new Image();
        img.onerror = rejeter;
        img.onload = function () {
          var ratio = Math.min(1, largeurMax / img.width);
          var canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resoudre(canvas.toDataURL('image/jpeg', qualite || 0.72));
        };
        img.src = lecteur.result;
      };
      lecteur.readAsDataURL(fichier);
    });
  }

  window.Immo.admin = {
    toast: toast,
    flash: flash,
    confirmer: confirmer,
    voirSite: voirSite,
    definirPageSite: function (fn) { pageSite = fn; },
    compteurs: compteurs,
    dateRelative: dateRelative,
    dateLongue: dateLongue,
    statutLibelle: statutLibelle,
    lireFichierImage: lireFichierImage,
    esc: esc
  };

  brancherModaleSite();
  brancherReinitialisation();
  compteurs();
  afficherFlash();
})();
