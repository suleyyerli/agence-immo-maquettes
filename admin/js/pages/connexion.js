/*
 * Connexion (démo) : aucune vérification, le bouton mène au tableau de bord.
 */
(function () {
  'use strict';

  var form = document.querySelector('[data-connexion]');
  var mdp = document.getElementById('mdp');
  var afficher = document.querySelector('[data-afficher-mdp]');
  var oubli = document.querySelector('[data-mdp-oublie]');
  var messageOubli = document.querySelector('[data-message-oubli]');

  afficher.addEventListener('click', function () {
    var visible = mdp.type === 'text';
    mdp.type = visible ? 'password' : 'text';
    afficher.textContent = visible ? 'Afficher' : 'Masquer';
    afficher.setAttribute('aria-pressed', String(!visible));
  });

  oubli.addEventListener('click', function () {
    messageOubli.hidden = false;
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bouton = form.querySelector('[type="submit"]');
    bouton.disabled = true;
    bouton.textContent = 'Connexion…';
    // Un court délai pour que la transition ne paraisse pas brutale
    setTimeout(function () { location.href = 'index.html'; }, 450);
  });
})();
