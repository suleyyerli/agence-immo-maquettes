/*
 * Site Classique : tout le comportement vient de /shared.
 * Ce fichier ne fait que lancer les modules, dans l'ordre :
 * d'abord les biens (qui génèrent du contenu), puis l'interface.
 */
(function () {
  'use strict';
  window.Immo.biens.demarrer();
  window.Immo.ui.demarrer();
})();
