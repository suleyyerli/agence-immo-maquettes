/*
 * Comportements d'interface communs aux trois sites :
 * header qui se réduit, menu mobile, onglets, apparitions au défilement,
 * formulaires publics et tableau des honoraires.
 */
window.Immo = window.Immo || {};

(function () {
  'use strict';

  var store = window.Immo.store;
  var reduireAnimations = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header : se réduit dès qu'on a un peu défilé ---------- */
  function header() {
    var el = document.querySelector('[data-header]');
    if (!el) return;
    var reduit = false;
    function maj() {
      var doit = window.scrollY > 40;
      if (doit !== reduit) {
        reduit = doit;
        el.classList.toggle('est-reduit', reduit);
      }
    }
    window.addEventListener('scroll', maj, { passive: true });
    maj();
  }

  /* ---------- Menu mobile ---------- */
  function menu() {
    var bouton = document.querySelector('[data-menu-bouton]');
    if (!bouton) return;
    var panneau = document.getElementById(bouton.getAttribute('aria-controls'));

    function basculer(ouvrir) {
      bouton.setAttribute('aria-expanded', String(ouvrir));
      bouton.setAttribute('aria-label', ouvrir ? 'Fermer le menu' : 'Ouvrir le menu');
      panneau.classList.toggle('est-ouvert', ouvrir);
      document.documentElement.classList.toggle('menu-ouvert', ouvrir);
      if (ouvrir) {
        var premier = panneau.querySelector('a, button');
        if (premier) setTimeout(function () { premier.focus(); }, 50);
      }
    }

    bouton.addEventListener('click', function () {
      basculer(bouton.getAttribute('aria-expanded') !== 'true');
    });
    panneau.addEventListener('click', function (e) {
      if (e.target.closest('a')) basculer(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && bouton.getAttribute('aria-expanded') === 'true') {
        basculer(false);
        bouton.focus();
      }
    });
    // Si on repasse en affichage large, on referme proprement
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) {
      if (mq.matches) basculer(false);
    });
  }

  /* ---------- Onglets accessibles : [data-onglets] ---------- */
  function onglets() {
    document.querySelectorAll('[data-onglets]').forEach(function (groupe) {
      var tabs = Array.from(groupe.querySelectorAll('[role="tab"]'));
      function activer(tab, focus) {
        tabs.forEach(function (t) {
          var actif = t === tab;
          t.setAttribute('aria-selected', String(actif));
          t.tabIndex = actif ? 0 : -1;
          document.getElementById(t.getAttribute('aria-controls')).hidden = !actif;
        });
        if (focus) tab.focus();
      }
      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { activer(tab); });
        tab.addEventListener('keydown', function (e) {
          var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (dir) activer(tabs[(i + dir + tabs.length) % tabs.length], true);
        });
      });
    });
  }

  /* ---------- Apparition douce au défilement : [data-reveler] ---------- */
  var observateur = null;

  function reveler(racine) {
    var elements = (racine || document).querySelectorAll('[data-reveler]:not(.est-visible)');
    if (reduireAnimations || !('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('est-visible'); });
      return;
    }
    if (!observateur) {
      observateur = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('est-visible');
            observateur.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    elements.forEach(function (el) { observateur.observe(el); });
  }

  /* ---------- Formulaires publics ----------
     Rien n'est envoyé : la demande est rangée dans la boîte de réception
     de la démo (admin > Demandes), puis on affiche un message de remerciement. */
  function formulaires() {
    var params = new URLSearchParams(location.search);

    document.querySelectorAll('form[data-form]').forEach(function (form) {
      // Pré-remplissage depuis l'URL (mini-formulaire d'estimation de l'accueil)
      params.forEach(function (valeur, cle) {
        var champ = form.elements[cle];
        if (champ && champ.type !== 'checkbox' && champ.type !== 'hidden' && !champ.value) champ.value = valeur;
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        var f = form.elements;
        var val = function (nom) { return f[nom] ? f[nom].value.trim() : ''; };
        var complet = val('nom').split(/\s+/);
        var demande = {
          type: form.dataset.form,
          prenom: val('prenom') || complet.shift() || '',
          nom: val('prenom') ? val('nom') : complet.join(' '),
          tel: val('tel'),
          email: val('email'),
          message: val('message'),
          bienId: val('bienId') || undefined
        };
        if (form.dataset.form === 'estimation') {
          demande.details = {
            adresse: val('adresse'),
            typeBien: val('typeBien'),
            surface: val('surface'),
            pieces: val('pieces'),
            delai: val('delai')
          };
          if (!demande.message) demande.message = 'Demande d’estimation pour : ' + [demande.details.typeBien, demande.details.surface && demande.details.surface + ' m²', demande.details.adresse].filter(Boolean).join(', ') + '.';
        }
        if (form.dataset.form === 'contact' && val('sujet')) demande.message = '[' + val('sujet') + '] ' + demande.message;
        store.ajouterDemande(demande);

        var merci = form.parentElement.querySelector('[data-form-merci]');
        if (merci) {
          merci.querySelectorAll('[data-merci-prenom]').forEach(function (el) { el.textContent = demande.prenom; });
          form.hidden = true;
          merci.hidden = false;
          merci.setAttribute('tabindex', '-1');
          merci.focus();
        }
        form.reset();
      });
    });

    document.querySelectorAll('[data-form-recommencer]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var merci = btn.closest('[data-form-merci]');
        var form = merci.parentElement.querySelector('form[data-form]');
        merci.hidden = true;
        form.hidden = false;
        form.querySelector('input, select, textarea').focus();
      });
    });
  }

  /* ---------- Barème d'honoraires (modifiable dans l'admin) ---------- */
  function honoraires() {
    var agence = store.agence();
    document.querySelectorAll('[data-honoraires]').forEach(function (tbody) {
      var lignes = tbody.dataset.honoraires === 'location' ? agence.honorairesLocation : agence.honorairesVente;
      if (!lignes || !lignes.length) return;
      var esc = window.Immo.biens.esc;
      tbody.innerHTML = lignes.map(function (l) {
        return '<tr><th scope="row">' + esc(l.tranche) + '</th><td>' + esc(l.montant) + '</td></tr>';
      }).join('');
    });
  }

  function annee() {
    document.querySelectorAll('[data-annee]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  function demarrer() {
    header();
    menu();
    onglets();
    formulaires();
    honoraires();
    annee();
    reveler();
  }

  window.Immo.ui = { demarrer: demarrer, reveler: reveler };
})();
