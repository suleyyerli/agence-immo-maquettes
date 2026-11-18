# Agence immo — maquettes

Trois propositions de site vitrine pour une agence immobilière indépendante, et un espace agence (démo) commun.
Tout est statique : HTML, CSS et un peu de JavaScript, sans framework ni dépendance. Ça tourne tel quel sur GitHub Pages.

- `index.html` : la page de présentation envoyée à la cliente (les trois styles + l'admin)
- `site-classique/`, `site-moderne/`, `site-urbain/` : les trois sites
- `admin/` : l'espace agence (démo front, données dans le `localStorage`)
- `shared/` : données et logique communes aux trois sites et à l'admin

## Lancer en local

N'importe quel serveur statique fait l'affaire, par exemple :

```bash
cd ~/dev/agence-immo
python3 -m http.server 8000
# puis http://localhost:8000/
```

Ouvrir les fichiers directement (`file://`) marche aussi, mais le `localStorage` est alors propre à chaque dossier selon le navigateur : passer par un serveur pour tester l'admin.

## Organisation du JavaScript

| Fichier | Rôle |
| --- | --- |
| `shared/data.js` | Biens, demandes et réglages d'exemple (`Immo.data`) |
| `shared/store.js` | Lecture / écriture `localStorage`, réinitialisation (`Immo.store`) |
| `shared/ui.js` | Header qui se réduit, menu mobile, apparitions au défilement, formulaires publics |
| `shared/biens.js` | Cartes, liste + filtres + tri + pagination, fiche bien, galerie et visionneuse, DPE |
| `site-*/js/main.js` | Les quelques réglages propres à chaque style |
| `admin/js/admin.js` | Socle de l'admin : menu, toasts, fenêtres de confirmation, « Voir sur le site » |
| `admin/js/pages/*.js` | Un petit fichier par écran de l'admin |

Les trois sites et l'admin sont servis depuis la même origine (`<user>.github.io`), ils partagent donc le même `localStorage` : un bien ajouté dans l'admin apparaît aussitôt sur les trois sites.

Clé de stockage : `immo-demo-v1`. Le bouton « Réinitialiser la démo » (ou `Immo.store.reinitialiser()` dans la console) remet les données d'exemple.

## Ce qui reste à personnaliser

Tous les textes à remplacer sont entre crochets : `[Nom de l'agence]`, `[Votre ville]`, `[Prénom]`, `[Téléphone]`, `[Adresse]`, `[horaires]`, `[n° carte pro]`…

```bash
# lister ce qu'il reste à remplacer
grep -rhoE "\[[^]]{2,40}\]" --include=*.html --include=*.js . | sort | uniq -c | sort -rn
```

Les photos viennent d'Unsplash (licence libre, URL directes `images.unsplash.com`). À remplacer par les vraies photos des biens.

## Bonnes pratiques retenues (étude des sites de référence)

Sites étudiés : Orpi, Laforêt, Century 21, Nestenn (grand public), Barnes et Engel & Völkers (haut de gamme). SeLoger et Bien'ici bloquent la lecture automatisée ; j'ai repris ce que l'on connaît de leurs filtres et fiches.

Ce que j'ai gardé :

1. **Recherche courte** : onglets Acheter / Louer et trois champs maximum (ville, type, budget). Le détail se fait ensuite sur la page des biens.
2. **L'estimation partout** : c'est la porte d'entrée des mandats. Lien dans le header, bloc sur l'accueil, page dédiée avec formulaire.
3. **Cartes de biens sobres** : photo, prix, surface, pièces, lieu, et un seul badge (Nouveau, Sous offre, Vendu).
4. **Fiche bien complète** : galerie avec compteur et visionneuse, bloc « l'essentiel » en haut, caractéristiques détaillées, DPE et GES avec l'échelle A à G et la consommation, honoraires affichés à côté du prix (obligatoire), formulaire de visite visible sans scroller sur ordinateur, biens similaires.
5. **Localisation approximative** : on donne le quartier et un repère, pas l'adresse exacte, pour protéger les vendeurs.
6. **Formulaires courts** et bouton « Appeler » toujours visible sur mobile : beaucoup de gens préfèrent téléphoner.
7. **Barème d'honoraires** accessible depuis chaque page (pied de page) et depuis chaque fiche.
8. **Mentions obligatoires** dans le pied de page : carte professionnelle, garantie financière, médiateur.
9. **Le côté humain** : là où les réseaux mettent en avant leurs chiffres, une agence indépendante met en avant une personne. La fondatrice parle à la première personne, avec sa photo.
10. **Admin inspirée de Shopify / Airbnb** : un tableau de bord qui dit quoi faire, des actions en un clic, des messages de confirmation, rien de technique.

Ce que j'ai évité : carrousels automatiques, pop-ups, chiffres invérifiables, avis clients inventés (l'agence ouvre, elle n'en a pas encore : on ajoutera les vrais avis Google plus tard).

## Accessibilité, SEO, performance

- HTML sémantique, un seul `h1` par page, labels sur tous les champs, focus visible, navigation clavier (menu, galerie, visionneuse, fenêtres de l'admin).
- `title`, `meta description` et balises Open Graph propres à chaque page ; l'admin est en `noindex`.
- Images en `loading="lazy"` avec `srcset`, polices Google Fonts en `display=swap`, aucun framework.
- Animations désactivées si l'utilisateur a demandé à réduire les animations (`prefers-reduced-motion`).
