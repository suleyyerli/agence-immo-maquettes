/*
 * Stockage de la démo dans le localStorage.
 *
 * Les trois sites et l'admin partagent la même origine, donc la même clé :
 * ce que la cliente fait dans l'admin se voit tout de suite sur les sites.
 * Si le localStorage est indisponible (navigation privée stricte…), on
 * travaille en mémoire avec les données d'exemple, sans planter.
 */
window.Immo = window.Immo || {};

(function () {
  'use strict';

  var CLE = 'immo-demo-v1';
  var memoire = null;

  function copie(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function donneesInitiales() {
    var d = window.Immo.data;
    return { biens: copie(d.biens), demandes: copie(d.demandes), agence: copie(d.agence) };
  }

  function lire() {
    if (memoire) return memoire;
    try {
      var brut = localStorage.getItem(CLE);
      memoire = brut ? JSON.parse(brut) : donneesInitiales();
    } catch (e) {
      memoire = donneesInitiales();
    }
    return memoire;
  }

  // Renvoie false si l'écriture a échoué (quota dépassé : photos trop lourdes)
  function ecrire() {
    try {
      localStorage.setItem(CLE, JSON.stringify(memoire));
      return true;
    } catch (e) {
      return false;
    }
  }

  function idDepuisTitre(titre) {
    var base = (titre || 'bien').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      .slice(0, 40) || 'bien';
    var id = base;
    var n = 2;
    while (lire().biens.some(function (b) { return b.id === id; })) id = base + '-' + n++;
    return id;
  }

  function prochaineRef(transaction) {
    var prefixe = transaction === 'location' ? 'L-' : 'V-';
    var max = lire().biens.reduce(function (m, b) {
      if (!b.ref || b.ref.indexOf(prefixe) !== 0) return m;
      return Math.max(m, parseInt(b.ref.slice(2), 10) || 0);
    }, transaction === 'location' ? 2000 : 1000);
    return prefixe + (max + 1);
  }

  var store = {
    /* ---------- Biens ---------- */
    biens: function () {
      return lire().biens;
    },

    bien: function (id) {
      return lire().biens.find(function (b) { return b.id === id; }) || null;
    },

    // Ce que voit le public : pas de brouillon, rien de masqué
    biensPublics: function () {
      return lire().biens.filter(function (b) {
        return b.visible !== false && b.statut !== 'brouillon';
      });
    },

    enregistrerBien: function (bien) {
      var liste = lire().biens;
      if (!bien.id) {
        bien.id = idDepuisTitre(bien.titre);
        bien.ref = bien.ref || prochaineRef(bien.transaction);
        bien.dateAjout = new Date().toISOString();
        liste.unshift(bien);
      } else {
        var i = liste.findIndex(function (b) { return b.id === bien.id; });
        if (i === -1) liste.unshift(bien); else liste[i] = bien;
      }
      bien.dateModif = new Date().toISOString();
      return ecrire() ? bien : null;
    },

    dupliquerBien: function (id) {
      var source = store.bien(id);
      if (!source) return null;
      var double = copie(source);
      delete double.id;
      delete double.ref;
      double.titre = source.titre + ' (copie)';
      double.statut = 'brouillon';
      return store.enregistrerBien(double);
    },

    supprimerBien: function (id) {
      var d = lire();
      d.biens = d.biens.filter(function (b) { return b.id !== id; });
      return ecrire();
    },

    /* ---------- Demandes ---------- */
    demandes: function () {
      return lire().demandes.slice().sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
    },

    ajouterDemande: function (demande) {
      demande.id = 'd-' + Date.now();
      demande.date = new Date().toISOString();
      demande.statut = 'nouveau';
      lire().demandes.unshift(demande);
      return ecrire();
    },

    modifierDemande: function (id, changements) {
      var dem = lire().demandes.find(function (x) { return x.id === id; });
      if (!dem) return false;
      Object.assign(dem, changements);
      return ecrire();
    },

    /* ---------- Réglages de l'agence ---------- */
    agence: function () {
      return lire().agence;
    },

    enregistrerAgence: function (agence) {
      lire().agence = agence;
      return ecrire();
    },

    /* ---------- Démo ---------- */
    reinitialiser: function () {
      memoire = donneesInitiales();
      return ecrire();
    }
  };

  // Si un autre onglet modifie les données (l'admin pendant qu'on regarde un site), on relit
  window.addEventListener('storage', function (e) {
    if (e.key === CLE) memoire = null;
  });

  window.Immo.store = store;
})();
