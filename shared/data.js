/*
 * Données d'exemple : biens, demandes et réglages de l'agence.
 *
 * C'est le point de départ de la démo. Dès que quelque chose est modifié dans
 * l'admin, c'est la copie du localStorage qui fait foi (voir store.js).
 * Les dates sont calculées par rapport à aujourd'hui pour que les badges
 * « Nouveau » et les demandes « de la semaine » restent crédibles.
 */
window.Immo = window.Immo || {};

(function () {
  'use strict';

  // Date ISO il y a n jours (avec une heure fixe pour éviter les surprises)
  function ilYa(jours, heure) {
    var d = new Date();
    d.setDate(d.getDate() - jours);
    d.setHours(heure || 10, (jours * 17) % 60, 0, 0);
    return d.toISOString();
  }

  // Photo Unsplash : on stocke l'URL de base, la taille est ajoutée à l'affichage
  function u(id, alt) {
    return { src: 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&q=75', alt: alt };
  }

  var biens = [
    {
      id: 'maison-70-jardin',
      ref: 'V-1031',
      transaction: 'vente',
      type: 'Maison',
      titre: 'Maison des années 70 avec un grand jardin',
      prix: 289000,
      ville: '[Votre ville]',
      quartier: 'Les Tilleuls',
      repere: 'Rue calme, à 5 minutes à pied de l’école des Tilleuls',
      surface: 118,
      terrain: 820,
      pieces: 5,
      chambres: 4,
      sdb: 1,
      etage: 'Plain-pied + étage',
      chauffage: 'Gaz, chaudière de 2019',
      annee: 1974,
      dpe: { classe: 'D', valeur: 212 },
      ges: { classe: 'D', valeur: 41 },
      description:
        'Une maison comme on n’en trouve plus beaucoup dans le quartier : construite en 1974, entretenue par la même famille depuis le début, posée au milieu de 820 m² de jardin.\n\n' +
        'Au rez-de-chaussée, un séjour de 34 m² avec sa cheminée, une cuisine séparée qui donne sur le jardin et une chambre avec salle d’eau, pratique pour des parents ou des amis de passage. À l’étage, trois chambres, une salle de bains et un grand palier qui ferait un bon coin bureau.\n\n' +
        'Le jardin est plat, bien exposé, avec un vieux cerisier et un abri en bois. Garage attenant et sous-sol complet. Il y a des travaux de rafraîchissement à prévoir (salle de bains, peintures), mais la structure, la toiture et la chaudière sont saines.',
      pointsForts: ['Jardin', 'Garage', 'Cheminée', 'Calme', 'Proche écoles'],
      photos: [
        u('1572120360610-d971b9d7767c', 'Façade de la maison et allée, entourées d’arbres'),
        u('1501183638710-841dd1904471', 'Séjour lumineux avec cheminée'),
        u('1600489000022-c2086d79f9d4', 'Cuisine avec fenêtre sur le jardin'),
        u('1615874959474-d609969a20ed', 'Chambre avec plantes et grande fenêtre'),
        u('1585320806297-9794b3e4eeae', 'Allée du jardin bordée de rosiers')
      ],
      statut: 'en-ligne',
      visible: true,
      coupDeCoeur: true,
      dateAjout: ilYa(3)
    },
    {
      id: 't3-balcon-marche',
      ref: 'V-1028',
      transaction: 'vente',
      type: 'Appartement',
      titre: 'T3 lumineux avec balcon, à deux pas du marché',
      prix: 189000,
      ville: '[Votre ville]',
      quartier: 'Centre-ville',
      repere: 'Place du marché, au-dessus de la librairie',
      surface: 64,
      pieces: 3,
      chambres: 2,
      sdb: 1,
      etage: '3e étage sur 4, ascenseur',
      chauffage: 'Collectif au gaz',
      annee: 1968,
      charges: 1450,
      lots: 24,
      dpe: { classe: 'C', valeur: 148 },
      ges: { classe: 'C', valeur: 26 },
      description:
        'Traversant est-ouest, cet appartement a du soleil du matin au soir. Le séjour s’ouvre sur un balcon où l’on tient à deux pour le café, avec vue sur les toits du centre.\n\n' +
        'La cuisine a été refaite il y a trois ans et reste ouverte sur le séjour. Les deux chambres donnent côté cour, donc au calme, même les jours de marché. Salle de bains avec fenêtre, WC séparés, cave au sous-sol.\n\n' +
        'Copropriété bien tenue, ravalement voté et payé par le vendeur. Boulangerie, pharmacie et arrêt de bus en bas de l’immeuble.',
      pointsForts: ['Balcon', 'Ascenseur', 'Cave', 'Lumineux', 'Proche commerces'],
      photos: [
        u('1522708323590-d24dbb6b0267', 'Séjour avec grandes fenêtres et vue sur la ville'),
        u('1493809842364-78817add7ffb', 'Coin salon avec canapé bleu et parquet'),
        u('1484154218962-a197022b5858', 'Cuisine ouverte refaite à neuf'),
        u('1522771739844-6a9f6d5f14af', 'Chambre côté cour'),
        u('1552321554-5fefe8c9ef14', 'Salle de bains avec fenêtre')
      ],
      statut: 'en-ligne',
      visible: true,
      coupDeCoeur: true,
      dateAjout: ilYa(6)
    },
    {
      id: 'studio-gare',
      ref: 'L-2014',
      transaction: 'location',
      type: 'Studio',
      titre: 'Studio meublé refait à neuf, quartier de la gare',
      prix: 480,
      chargesMensuelles: 45,
      depot: 870,
      honorairesLocataire: 240,
      ville: '[Votre ville]',
      quartier: 'Quartier de la gare',
      repere: 'À 4 minutes à pied de la gare',
      surface: 24,
      pieces: 1,
      chambres: 0,
      sdb: 1,
      etage: '2e étage sans ascenseur',
      chauffage: 'Électrique, radiateurs neufs',
      annee: 1930,
      dpe: { classe: 'E', valeur: 268 },
      ges: { classe: 'B', valeur: 8 },
      description:
        'Idéal pour un étudiant ou un premier poste : le studio a été entièrement refait cet été, du sol au plafond.\n\n' +
        'Pièce de vie avec un vrai lit en 140, rangements sur mesure, coin cuisine équipé (plaques, four, frigo, lave-linge) et salle d’eau avec douche à l’italienne. Tout le mobilier est neuf.\n\n' +
        'Loyer de 480 € plus 45 € de charges (eau froide et entretien des communs). Disponible tout de suite.',
      pointsForts: ['Meublé', 'Refait à neuf', 'Proche gare'],
      photos: [
        u('1502672023488-70e25813eb80', 'Pièce de vie avec bureau et étagères'),
        u('1502672260266-1c1ef2d93688', 'Coin salon avec plantes'),
        u('1523755231516-e43fd2e8dca5', 'Canapé gris près de la fenêtre'),
        u('1556185781-a47769abb7ee', 'Coin cuisine équipé')
      ],
      statut: 'en-ligne',
      visible: true,
      dateAjout: ilYa(2)
    },
    {
      id: 'loft-imprimerie',
      ref: 'V-1024',
      transaction: 'vente',
      type: 'Loft',
      titre: 'Loft dans une ancienne imprimerie, 4 m sous plafond',
      prix: 395000,
      ville: '[Votre ville]',
      quartier: 'Faubourg Saint-Jean',
      repere: 'Dans une cour pavée, derrière la rue Saint-Jean',
      surface: 142,
      pieces: 4,
      chambres: 3,
      sdb: 2,
      etage: 'Rez-de-chaussée et mezzanine',
      chauffage: 'Pompe à chaleur et poêle à bois',
      annee: 1912,
      dpe: { classe: 'C', valeur: 132 },
      ges: { classe: 'A', valeur: 5 },
      description:
        'L’imprimerie a fermé en 1987. Elle a été transformée il y a dix ans par un architecte qui a gardé ce qui faisait son caractère : les briques, les poutres métalliques et la verrière.\n\n' +
        'L’espace de vie fait 70 m² d’un seul tenant, avec 4 mètres sous plafond et une cuisine en îlot. Un escalier en acier mène à la mezzanine, où se trouvent deux chambres et une salle d’eau. La suite parentale est au rez-de-chaussée, côté cour.\n\n' +
        'On entre par une cour pavée partagée avec deux autres logements. Une place de parking couverte est comprise dans le prix.',
      pointsForts: ['Parking', 'Cheminée', 'Lumineux', 'Calme', 'Fibre'],
      photos: [
        u('1505873242700-f289a29e1e0f', 'Grand volume du loft avec murs en brique'),
        u('1536376072261-38c75010e6c9', 'Séjour sous verrière avec bibliothèque'),
        u('1592928302636-c83cf1e1c887', 'Cuisine ouverte et mezzanine'),
        u('1494203484021-3c454daf695d', 'Coin bureau devant le mur de briques'),
        u('1502005229762-cf1b2da7c5d6', 'Escalier en acier vers la mezzanine')
      ],
      statut: 'en-ligne',
      visible: true,
      coupDeCoeur: true,
      dateAjout: ilYa(12)
    },
    {
      id: 'maison-ville-cour',
      ref: 'V-1029',
      transaction: 'vente',
      type: 'Maison de ville',
      titre: 'Maison de ville avec cour intérieure, en face de la boulangerie',
      prix: 245000,
      ville: '[Votre ville]',
      quartier: 'Vieux bourg',
      repere: 'Rue de l’Église, en face de la boulangerie',
      surface: 96,
      terrain: 40,
      pieces: 4,
      chambres: 3,
      sdb: 1,
      etage: 'R+2',
      chauffage: 'Gaz, plancher chauffant au rez-de-chaussée',
      annee: 1890,
      dpe: { classe: 'D', valeur: 198 },
      ges: { classe: 'D', valeur: 38 },
      description:
        'De la rue, on ne s’attend pas à ça. Derrière la porte, une maison en pierre sur trois niveaux, avec une petite cour intérieure où l’on peut déjeuner à l’abri des regards.\n\n' +
        'Au rez-de-chaussée, la pièce de vie avec ses fenêtres cintrées et la cuisine. Au premier, deux chambres et la salle de bains. Au deuxième, une grande chambre sous les combles avec ses poutres.\n\n' +
        'Tout se fait à pied : la boulangerie en face, l’école à 200 m, le marché le samedi sur la place. Fenêtres en double vitrage changées en 2021.',
      pointsForts: ['Terrasse', 'Double vitrage', 'Proche commerces', 'Proche écoles'],
      photos: [
        u('1494526585095-c41746248156', 'Façade de la maison en fin de journée'),
        u('1600210491892-03d54c0aaf87', 'Pièce de vie avec fenêtres cintrées'),
        u('1600047508788-786f3865b4b9', 'Séjour et escalier en bois'),
        u('1586105251261-72a756497a11', 'Chambre au calme'),
        u('1617850687395-620757feb1f3', 'Cour intérieure aménagée')
      ],
      statut: 'en-ligne',
      visible: true,
      dateAjout: ilYa(9)
    },
    {
      id: 'terrain-vue-degagee',
      ref: 'V-1019',
      transaction: 'vente',
      type: 'Terrain',
      titre: 'Terrain constructible de 950 m², viabilisé, vue dégagée',
      prix: 79000,
      ville: '[Commune voisine]',
      quartier: 'Chemin des Vignes',
      repere: 'En haut du chemin des Vignes, à 8 minutes du centre',
      surface: 950,
      terrain: 950,
      pieces: 0,
      chambres: 0,
      chauffage: '',
      dpe: null,
      ges: null,
      description:
        'Un terrain plat, exposé sud-ouest, en bordure de champs : la vue restera dégagée, la parcelle voisine est en zone agricole.\n\n' +
        'Il est viabilisé (eau, électricité, fibre et tout-à-l’égout en limite de propriété) et hors lotissement, donc libre de constructeur. Le certificat d’urbanisme est disponible à l’agence.\n\n' +
        'Façade de 24 m sur le chemin, accès facile pour les engins. Étude de sol déjà faite par le vendeur.',
      pointsForts: ['Vue dégagée', 'Calme', 'Fibre'],
      photos: [
        u('1500382017468-9049fed747ef', 'Vue sur les champs au coucher du soleil'),
        u('1500076656116-558758c991c1', 'Paysage autour du terrain'),
        u('1558904541-efa843a96f01', 'Herbe du terrain au premier plan')
      ],
      statut: 'en-ligne',
      visible: true,
      dateAjout: ilYa(28)
    },
    {
      id: 't2-vue-parc',
      ref: 'L-2011',
      transaction: 'location',
      type: 'Appartement',
      titre: 'T2 avec vue sur le parc, cuisine équipée',
      prix: 690,
      chargesMensuelles: 60,
      depot: 690,
      honorairesLocataire: 368,
      ville: '[Votre ville]',
      quartier: 'Parc des Sources',
      repere: 'Face à l’entrée du parc des Sources',
      surface: 46,
      pieces: 2,
      chambres: 1,
      sdb: 1,
      etage: '2e étage sur 5, ascenseur',
      chauffage: 'Individuel au gaz',
      annee: 2008,
      dpe: { classe: 'C', valeur: 121 },
      ges: { classe: 'C', valeur: 22 },
      description:
        'Le séjour donne directement sur les arbres du parc : on oublie qu’on est en ville. Résidence récente et calme, avec gardien.\n\n' +
        'Cuisine ouverte entièrement équipée (four, plaques, hotte, lave-vaisselle), chambre avec placard, salle de bains avec baignoire. Une place de parking en sous-sol est comprise.\n\n' +
        'Loyer de 690 € plus 60 € de provision sur charges (chauffage de l’eau, ascenseur, gardien). Libre au 1er du mois prochain.',
      pointsForts: ['Ascenseur', 'Parking', 'Vue dégagée', 'Calme'],
      photos: [
        u('1567767292278-a4f21aa2d36e', 'Séjour clair avec grandes fenêtres'),
        u('1556911220-bff31c812dba', 'Cuisine équipée'),
        u('1600607687644-c7171b42498f', 'Chambre lumineuse'),
        u('1574362848149-11496d93a7c7', 'Résidence entourée d’arbres')
      ],
      statut: 'en-ligne',
      visible: true,
      dateAjout: ilYa(5)
    },
    {
      id: 'maison-contemporaine',
      ref: 'V-1026',
      transaction: 'vente',
      type: 'Maison',
      titre: 'Maison contemporaine de plain-pied, garage et terrasse',
      prix: 435000,
      ville: '[Commune voisine]',
      quartier: 'Les Hauts du Moulin',
      repere: 'Impasse au calme, à 10 minutes du centre en voiture',
      surface: 135,
      terrain: 640,
      pieces: 5,
      chambres: 4,
      sdb: 2,
      etage: 'Plain-pied',
      chauffage: 'Pompe à chaleur, plancher chauffant',
      annee: 2017,
      dpe: { classe: 'A', valeur: 58 },
      ges: { classe: 'A', valeur: 2 },
      description:
        'Construite en 2017 par un constructeur local, cette maison a été pensée pour vivre de plain-pied, sans un seul escalier.\n\n' +
        'La pièce de vie de 55 m² s’ouvre entièrement sur la terrasse et le jardin par de grandes baies. Quatre chambres, dont une suite avec dressing et salle d’eau, une salle de bains familiale, un cellier et un garage double.\n\n' +
        'Classée A au DPE : comptez une quarantaine d’euros par mois pour le chauffage. Jardin clos et arboré, sans vis-à-vis.',
      pointsForts: ['Jardin', 'Terrasse', 'Garage', 'Plain-pied', 'Calme', 'Fibre'],
      photos: [
        u('1600585154340-be6161a56a0c', 'Façade contemporaine et jardin au crépuscule'),
        u('1600607688969-a5bfcd646154', 'Jardin et grand arbre devant la maison'),
        u('1600607687939-ce8a6c25118c', 'Pièce de vie ouverte'),
        u('1600585152220-90363fe7e115', 'Cuisine avec îlot central'),
        u('1595526114035-0d45ed16cfbf', 'Chambre parentale'),
        u('1620626011761-996317b8d101', 'Salle de bains avec baignoire îlot')
      ],
      statut: 'sous-offre',
      visible: true,
      dateAjout: ilYa(21)
    },
    {
      id: 't4-familial',
      ref: 'V-1015',
      transaction: 'vente',
      type: 'Appartement',
      titre: 'Grand T4 familial avec deux salles d’eau et cave',
      prix: 229000,
      ville: '[Votre ville]',
      quartier: 'Saint-Martin',
      repere: 'Près du collège Saint-Martin',
      surface: 88,
      pieces: 4,
      chambres: 3,
      sdb: 2,
      etage: '1er étage sur 3',
      chauffage: 'Individuel au gaz',
      annee: 1985,
      charges: 1680,
      lots: 18,
      dpe: { classe: 'C', valeur: 165 },
      ges: { classe: 'C', valeur: 29 },
      description:
        'Vendu en cinq semaines à une famille qui cherchait près du collège.\n\n' +
        'Grand séjour double, cuisine fermée, trois chambres et deux salles d’eau : de quoi éviter les embouteillages le matin. Cave et place de parking.',
      pointsForts: ['Cave', 'Parking', 'Proche écoles'],
      photos: [
        u('1560448204-e02f11c3d0e2', 'Séjour double lumineux'),
        u('1560185007-cde436f6a4d0', 'Salle à manger'),
        u('1507089947368-19c1da9775ae', 'Cuisine blanche'),
        u('1540518614846-7eded433c457', 'Chambre principale'),
        u('1584622650111-993a426fbf0a', 'Salle d’eau avec douche vitrée')
      ],
      statut: 'vendu',
      visible: true,
      dateAjout: ilYa(64)
    },
    {
      id: 'maison-jardinet-location',
      ref: 'L-2009',
      transaction: 'location',
      type: 'Maison',
      titre: 'Petite maison avec jardinet, idéale pour un premier couple',
      prix: 950,
      chargesMensuelles: 0,
      depot: 950,
      honorairesLocataire: 576,
      ville: '[Commune voisine]',
      quartier: 'Le Bourg',
      repere: 'À deux rues de la mairie et de l’arrêt de bus',
      surface: 72,
      terrain: 180,
      pieces: 3,
      chambres: 2,
      sdb: 1,
      etage: 'R+1',
      chauffage: 'Électrique et poêle à granulés',
      annee: 1955,
      dpe: { classe: 'D', valeur: 236 },
      ges: { classe: 'B', valeur: 9 },
      description:
        'Une maison de bourg à taille humaine, avec un jardinet clos à l’arrière, assez grand pour un barbecue et quelques tomates.\n\n' +
        'Au rez-de-chaussée, le séjour avec son poêle à granulés et la cuisine équipée. À l’étage, deux chambres et la salle de bains. Petit cellier pour les vélos.\n\n' +
        'Pas de charges : l’entretien du jardin est à la charge du locataire. Animaux acceptés.',
      pointsForts: ['Jardin', 'Calme', 'Double vitrage'],
      photos: [
        u('1480074568708-e7b720bb3f09', 'Façade blanche et petite clôture'),
        u('1484101403633-562f891dc89a', 'Séjour avec canapé'),
        u('1617228069096-4638a7ffc906', 'Cuisine avec fenêtre sur le jardin'),
        u('1519710164239-da123dc03ef4', 'Coin repas près de la fenêtre')
      ],
      statut: 'en-ligne',
      visible: true,
      dateAjout: ilYa(1)
    },
    {
      id: 'dernier-etage-terrasse',
      ref: 'V-1033',
      transaction: 'vente',
      type: 'Appartement',
      titre: 'Dernier étage avec terrasse de 30 m² plein sud',
      prix: 265000,
      ville: '[Votre ville]',
      quartier: 'Centre-ville',
      repere: 'Rue des Halles, à 2 minutes de la place du marché',
      surface: 74,
      pieces: 3,
      chambres: 2,
      sdb: 1,
      etage: '4e et dernier étage, ascenseur',
      chauffage: 'Individuel au gaz',
      annee: 1992,
      charges: 1320,
      lots: 12,
      dpe: { classe: 'C', valeur: 139 },
      ges: { classe: 'C', valeur: 24 },
      description:
        'Il y a peu de terrasses comme celle-ci en centre-ville : 30 m² au dernier étage, sans vis-à-vis, avec le soleil toute la journée.\n\n' +
        'Le séjour et la cuisine ouverte donnent de plain-pied sur la terrasse par une grande baie vitrée. Deux chambres au calme, une salle de bains et un cellier.\n\n' +
        'Petite copropriété de 12 lots, sans travaux prévus. Garage fermé en sous-sol en option (15 000 €).',
      pointsForts: ['Terrasse', 'Ascenseur', 'Lumineux', 'Vue dégagée', 'Proche commerces'],
      photos: [
        u('1600573472550-8090b5e0745e', 'Baie vitrée ouverte sur la terrasse'),
        u('1616486338812-3dadae4b4ace', 'Séjour clair et chaleureux'),
        u('1615529182904-14819c35db37', 'Coin salon avec suspensions en osier'),
        u('1588854337236-6889d631faa8', 'Cuisine ouverte moderne'),
        u('1559599238-308793637427', 'Chambre avec tête de lit capitonnée'),
        u('1564540583246-934409427776', 'Salle de bains en marbre')
      ],
      statut: 'en-ligne',
      visible: true,
      coupDeCoeur: true,
      dateAjout: ilYa(0)
    },
    {
      id: 't1-sous-les-toits',
      ref: 'L-2006',
      transaction: 'location',
      type: 'Appartement',
      titre: 'T1 bis sous les toits, poutres apparentes',
      prix: 540,
      chargesMensuelles: 35,
      depot: 540,
      honorairesLocataire: 248,
      ville: '[Votre ville]',
      quartier: 'Vieux bourg',
      repere: 'Rue des Tanneurs, près de la médiathèque',
      surface: 31,
      pieces: 2,
      chambres: 1,
      sdb: 1,
      etage: '3e et dernier étage',
      chauffage: 'Électrique',
      annee: 1900,
      dpe: { classe: 'D', valeur: 241 },
      ges: { classe: 'B', valeur: 7 },
      description:
        'Loué en quatre jours. Un T1 bis plein de charme sous les toits, avec un coin nuit séparé et des poutres partout.',
      pointsForts: ['Lumineux', 'Calme'],
      photos: [
        u('1524758631624-e2822e304c36', 'Pièce de vie lumineuse'),
        u('1513694203232-719a280e022f', 'Coin salon épuré'),
        u('1586023492125-27b2c045efd7', 'Fauteuil jaune près de la fenêtre')
      ],
      statut: 'vendu',
      visible: true,
      dateAjout: ilYa(40)
    }
  ];

  var demandes = [
    {
      id: 'd-101', type: 'visite', prenom: 'Camille', nom: 'Laurent',
      tel: '06 12 48 75 30', email: 'camille.laurent@exemple.fr',
      bienId: 'maison-70-jardin', date: ilYa(0, 9),
      message: 'Bonjour, la maison des Tilleuls nous plaît beaucoup. Nous avons deux enfants à l’école juste à côté. Serait-il possible de la visiter samedi matin ? Notre prêt est déjà accordé.',
      statut: 'nouveau'
    },
    {
      id: 'd-102', type: 'estimation', prenom: 'Bernard', nom: 'Moreau',
      tel: '06 71 22 09 64', email: 'b.moreau@exemple.fr',
      date: ilYa(1, 18),
      message: 'Je suis à la retraite et je pense vendre ma maison de la rue des Lilas d’ici l’été prochain (110 m², 4 chambres, 600 m² de terrain). J’aimerais avoir une idée du prix, sans engagement.',
      details: { adresse: '12 rue des Lilas', typeBien: 'Maison', surface: 110 },
      statut: 'nouveau'
    },
    {
      id: 'd-103', type: 'visite', prenom: 'Inès', nom: 'Benali',
      tel: '07 68 33 14 02', email: 'ines.benali@exemple.fr',
      bienId: 'studio-gare', date: ilYa(1, 11),
      message: 'Bonjour, je commence un CDI à la rentrée et le studio m’intéresse. Je peux venir en fin de journée n’importe quel jour de la semaine. Mon garant est mon père.',
      statut: 'rappele'
    },
    {
      id: 'd-104', type: 'contact', prenom: 'Thomas', nom: 'Girard',
      tel: '06 45 90 18 77', email: 'thomas.girard@exemple.fr',
      date: ilYa(2, 14),
      message: 'Bonjour, nous cherchons une maison avec au moins 3 chambres et un jardin, budget 300 000 € maximum, dans le secteur. Pouvez-vous nous prévenir si quelque chose se présente avant d’être en ligne ?',
      statut: 'nouveau'
    },
    {
      id: 'd-105', type: 'visite', prenom: 'Julie', nom: 'Fontaine',
      tel: '06 03 57 81 49', email: 'julie.fontaine@exemple.fr',
      bienId: 'dernier-etage-terrasse', date: ilYa(3, 20),
      message: 'La terrasse est exactement ce qu’on cherche depuis des mois ! On est disponibles mardi ou jeudi après 18 h.',
      statut: 'traite'
    },
    {
      id: 'd-106', type: 'estimation', prenom: 'Martine', nom: 'Petit',
      tel: '06 88 14 26 51', email: 'martine.petit@exemple.fr',
      date: ilYa(4, 10),
      message: 'Appartement T3 hérité de ma mère, centre-ville, 2e étage. Je ne sais pas encore si je vends ou si je loue. Pouvez-vous me conseiller ?',
      details: { adresse: '5 place du Marché', typeBien: 'Appartement', surface: 68 },
      statut: 'rappele'
    },
    {
      id: 'd-107', type: 'contact', prenom: 'Karim', nom: 'Haddad',
      tel: '07 52 66 30 18', email: 'karim.haddad@exemple.fr',
      date: ilYa(6, 16),
      message: 'Bonjour, je suis propriétaire de deux appartements que je gère moi-même et ça commence à me prendre trop de temps. Quels sont vos tarifs pour la gestion locative ?',
      statut: 'traite'
    },
    {
      id: 'd-108', type: 'visite', prenom: 'Sophie', nom: 'Marchand',
      tel: '06 29 75 43 10', email: 'sophie.marchand@exemple.fr',
      bienId: 'loft-imprimerie', date: ilYa(9, 12),
      message: 'Bonjour, je suis architecte d’intérieur et le loft m’intrigue beaucoup. Est-il possible de voir les plans avant la visite ?',
      statut: 'traite'
    }
  ];

  var agence = {
    nom: '[Nom de l\'agence]',
    prenom: '[Prénom]',
    adresse: '[Adresse]',
    ville: '[Votre ville]',
    telephone: '[Téléphone]',
    email: '[e-mail]',
    horaires: '[horaires]',
    cartePro: '[n° carte pro]',
    facebook: '',
    instagram: '',
    linkedin: '',
    logo: '',
    // Barème d'honoraires d'exemple (TTC). Modifiable dans Paramètres.
    honorairesVente: [
      { tranche: 'Jusqu’à 80 000 €', montant: 'Forfait de 5 000 €' },
      { tranche: 'De 80 001 € à 150 000 €', montant: '6 % du prix de vente' },
      { tranche: 'De 150 001 € à 250 000 €', montant: '5 % du prix de vente' },
      { tranche: 'De 250 001 € à 400 000 €', montant: '4,5 % du prix de vente' },
      { tranche: 'Au-delà de 400 000 €', montant: '4 % du prix de vente' }
    ],
    honorairesLocation: [
      { tranche: 'Visite, constitution du dossier et rédaction du bail', montant: '8 € par m² (locataire) et 8 € par m² (propriétaire)' },
      { tranche: 'État des lieux d’entrée', montant: '3 € par m² (locataire) et 3 € par m² (propriétaire)' },
      { tranche: 'Gestion locative', montant: '6 % des loyers encaissés' },
      { tranche: 'Garantie des loyers impayés (option)', montant: '2,5 % des loyers encaissés' }
    ]
  };

  // Listes de référence utilisées par les filtres et le formulaire d'édition
  var listes = {
    types: ['Appartement', 'Maison', 'Maison de ville', 'Studio', 'Loft', 'Terrain'],
    pointsForts: [
      'Jardin', 'Terrasse', 'Balcon', 'Garage', 'Parking', 'Cave', 'Ascenseur',
      'Cheminée', 'Piscine', 'Plain-pied', 'Vue dégagée', 'Calme', 'Lumineux',
      'Refait à neuf', 'Meublé', 'Double vitrage', 'Fibre',
      'Proche écoles', 'Proche commerces', 'Proche gare'
    ],
    statuts: {
      'en-ligne': 'En ligne',
      'sous-offre': 'Sous offre',
      'vendu': 'Vendu',
      'brouillon': 'Brouillon'
    },
    typesDemande: { visite: 'Visite', estimation: 'Estimation', contact: 'Contact' },
    statutsDemande: { nouveau: 'Nouveau', rappele: 'Rappelé', traite: 'Traité' }
  };

  window.Immo.data = { biens: biens, demandes: demandes, agence: agence, listes: listes };
})();
