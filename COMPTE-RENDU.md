# Compte rendu — maquettes du site d'agence immobilière

## 1. Ce qui a été fait

1. **Mise en place** : dépôt git (branche `main`), dépôt GitHub public `agence-immo-maquettes`, GitHub Pages activé sur `main` à la racine. Les commits sont signés avec l'adresse anonyme GitHub (noreply).
2. **Étude des sites de référence** : Orpi, Laforêt, Century 21, Nestenn, Barnes et Engel & Völkers. SeLoger et Bien'ici refusent la lecture automatisée. Les bonnes pratiques retenues sont dans le README.
3. **Socle commun** (`shared/`) : 12 biens d'exemple (vente, location, maison, T2, T3, T4, studio, loft, maison de ville, terrain, dernier étage, T1 bis), 8 demandes, un barème d'honoraires. Les fichiers JS sont `data.js`, `store.js` (localStorage), `ui.js` (header, menu, onglets, formulaires) et `biens.js` (cartes, filtres, tri, pagination, fiche, galerie, visionneuse, DPE).
4. **Site Classique** : crème, Cormorant Garamond + Inter, doré. 11 pages.
5. **Site Moderne** : blanc, Plus Jakarta Sans, vert profond, coins arrondis. Recherche sur l'accueil, filtres en colonne, simulateur d'honoraires, comparatif de gestion. 11 pages.
6. **Site Urbain** : sombre, Archivo condensé en capitales, IBM Plex Mono, orange. Biens en lignes façon index, « ticket » de gestion, page de règles. 11 pages.
7. **Espace agence commun** (`admin/`) :
   - connexion, tableau de bord, liste des biens (recherche, filtres, statut en un clic, dupliquer, masquer, supprimer avec « Annuler ») ;
   - édition d'un bien (photos en glisser-déposer, réduites dans le navigateur, réorganisation, photo principale, aperçu en direct, validation, Ctrl+S) ;
   - boîte de réception des demandes (appeler, répondre par e-mail, statut, note) et paramètres (agence, logo, réseaux, barème repris sur les sites) ;
   - menu latéral sur ordinateur, menu du bas sur téléphone, bandeau « Démo », réinitialisation.
8. **Page de présentation** (`index.html`) : les trois styles avec captures ordinateur et mobile, l'espace agence, les prochaines étapes. 404 racine qui redirige vers la 404 du style visité.
9. **Relecture** :
   - captures de chaque page sur ordinateur, tablette et mobile ;
   - corrections : pluriels, photo incohérente, espacements, menu tablette, grille de la liste Urbain, contrastes portés au niveau AA ;
   - vérification automatique des liens, d'un seul H1 par page, des title/description et des alt ;
   - test de bout en bout de la démo (32 vérifications).
10. **Vérification en ligne** : 41 pages en HTTP 200, 98 images chargées, carte OSM affichée, publication depuis l'admin visible sur les sites, redirection 404.
11. **Documents client** rédigés, hors du dépôt : lien et message à envoyer, liste « à fournir », guide d'utilisation, compte rendu simplifié. Le devis est rangé avec.

## 2. Arborescence

### Code (ce dépôt)

```
index.html              page de présentation des 3 styles + admin
presentation.css        styles de cette page
404.html                404 GitHub Pages (redirige vers celle du style)
apercus/                captures utilisées par index.html (.webp)
shared/
  data.js  store.js  ui.js  biens.js
admin/
  connexion.html  index.html  biens.html  bien-edition.html  demandes.html  parametres.html
  css/admin.css
  js/admin.js
  js/pages/connexion.js  tableau-de-bord.js  biens.js  edition.js  demandes.js  parametres.js
site-classique/ site-moderne/ site-urbain/
  index.html  biens.html  bien.html  vendre.html  location-gestion.html  agence.html
  contact.html  honoraires.html  mentions-legales.html  confidentialite.html  404.html
  css/style.css  js/main.js  favicon.svg
README.md  COMPTE-RENDU.md  .gitignore
```

### Documents client (hors dépôt, dans Documents/Clients/agence-immo/)

```
devis/devis.pdf
comptes-rendus/2026-11-18-maquettes-du-site.md
documentation/guide-de-votre-site.md
a-fournir.md
lien-maquettes.md
```

## 3. Liens

- Dépôt : https://github.com/suleyyerli/agence-immo-maquettes
- Présentation (lien à envoyer) : https://suleyyerli.github.io/agence-immo-maquettes/
- Classique : https://suleyyerli.github.io/agence-immo-maquettes/site-classique/
- Moderne : https://suleyyerli.github.io/agence-immo-maquettes/site-moderne/
- Urbain : https://suleyyerli.github.io/agence-immo-maquettes/site-urbain/
- Espace agence : https://suleyyerli.github.io/agence-immo-maquettes/admin/connexion.html

## 4. Commits

- Initialisation du projet : README et bonnes pratiques retenues
- Ajout des données et de la logique communes aux trois sites
- Ajout du site classique : accueil, biens, fiche, vendre, location, agence, contact, honoraires et pages légales
- Mise à jour du compte rendu
- Ajout du site moderne : recherche, filtres en colonne, simulateur d'honoraires et comparatif de gestion
- Ajout du site urbain : liste façon index, plan de vente, ticket de gestion et règles de l'agence
- Ajout de l'espace agence : connexion, tableau de bord, biens, édition avec photos, demandes et paramètres
- Ajout de la page de présentation des trois styles et de la 404 racine
- Contrastes AA et 404 racine
- Menu du style moderne sur une ligne en largeur tablette
- Compte rendu final

## 5. Ce qui reste à faire ou à remplacer

- **Textes entre crochets** : `[Nom de l'agence]`, `[Votre ville]`, `[Commune voisine]`, `[Prénom]`, `[Téléphone]`, `[e-mail]`, `[Adresse]`, `[Code postal]`, `[horaires]`, `[n° carte pro]`, `[ville]` (CCI), `[organisme]`, `[assureur]`, `[X]` (années d'expérience), `[année]`, mentions légales (forme juridique, capital, SIRET, RCS, TVA, médiateur, hébergeur). Sur la page de présentation : `[Votre nom]`, `[Votre e-mail]`, `[Votre téléphone]`. La commande pour tout lister est dans le README.
- **Photos** : celles d'Unsplash sont à remplacer par les vraies photos des biens, de la fondatrice et de l'agence.
- **Plan** : remplacer `bbox` et `marker` des iframes OpenStreetMap (commentaire dans le code) par les coordonnées de l'agence.
- **Barème** : les montants sont des exemples. À aligner avec la cliente, aussi dans le simulateur du style Moderne (`site-moderne/js/main.js`).
- **Biens d'exemple** : à vider avant la mise en production.
- **Robots** : la page de présentation est en `noindex`. En production, ajouter `link rel="canonical"`, un `sitemap.xml` et un `robots.txt` sur le vrai domaine.
- À demander à la cliente : voir `a-fournir.md` dans les documents client.

## 6. Pour que l'admin fonctionne en production

Aujourd'hui, tout est stocké dans le navigateur (localStorage) : rien n'est partagé entre appareils et rien n'est sécurisé. Il faut trois briques :

| Besoin | Options | Coût indicatif |
| --- | --- | --- |
| **Connexion sécurisée** | Supabase Auth ou Firebase Auth (e-mail + mot de passe, lien magique) ; ou un petit back-end PHP avec sessions chez l'hébergeur | Gratuit au volume d'une agence |
| **Stockage des biens et des demandes** | Supabase (Postgres) ou Firebase Firestore, branché à la place de `store.js` ; ou PHP + MySQL inclus dans un hébergement mutualisé | 0 € (offres gratuites) à ~25 €/mois (Supabase Pro) ; MySQL inclus dans l'hébergement |
| **Stockage des photos** | Supabase Storage / Firebase Storage ; ou dossier de l'hébergement ; ou Cloudinary pour le redimensionnement automatique | Gratuit jusqu'à 1 à 5 Go ; Cloudinary gratuit jusqu'à 25 crédits/mois |
| **Envoi des formulaires par e-mail** | Formspree, Web3Forms, Brevo (API transactionnelle) ; ou `mail()` / SMTP en PHP chez l'hébergeur | Gratuit jusqu'à ~50 à 300 envois/mois ; Brevo gratuit jusqu'à 300 e-mails/jour |
| **Anti-spam** | Champ piège (honeypot) + Cloudflare Turnstile | Gratuit |

**Recommandation pour tenir les 10 €/mois** : un hébergement mutualisé avec PHP et MySQL (o2switch, OVH, Infomaniak : 4 à 8 €/mois avec le nom de domaine), plus une petite API PHP qui remplace `store.js` (mêmes fonctions). L'alternative la plus rapide à développer est Supabase en offre gratuite, avec un site statique hébergé gratuitement (Netlify, Cloudflare Pages) : il ne reste alors que le nom de domaine, ~10 €/an.

## 7. Problèmes rencontrés et solutions

- **Lecture de SeLoger et Bien'ici impossible** (blocage des robots, contenu généré en JavaScript) : étude faite sur les autres sites, plus les pratiques connues des portails.
- **Recherche Unsplash automatisée refusée** (API interne non autorisée) : photos choisies parmi des URL directes `images.unsplash.com`, vérifiées une par une sur une planche contact avant d'être attribuées aux biens. Une photo de piscine peu crédible en centre-ville a été retirée.
- **Captures d'écran** : navigateur automatisé installé dans un dossier temporaire, supprimé à la fin. Le défilement « smooth » faussait les captures ; défilement instantané dans le script de test.
- **Espaces parasites dans des boutons** (« Tous les biens ( 10 ) ») dus à `inline-flex` : liens passés en `inline-block`.
- **Contrastes trop faibles** sur les textes secondaires des trois styles et de l'admin : couleurs ajustées pour atteindre 4,4 à 5,4:1.
- **Une seule page 404 servie par GitHub Pages** : 404 racine qui redirige vers celle du style visité.
- **Informations personnelles dans l'historique** (e-mail perso en auteur des premiers commits, une mention du poste dans ce fichier) : historique réécrit une fois, avec l'accord explicite du propriétaire, puis un push forcé unique. Les commits utilisent désormais l'adresse anonyme GitHub.
- **Limite du localStorage (~5 Mo)** pour les photos de la démo : réduction à 1 400 px en JPEG avant stockage, et message clair si la limite est atteinte.
