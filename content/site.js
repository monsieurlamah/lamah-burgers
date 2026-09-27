// ─────────────────────────────────────────────────────────────────────────────
// LAMAH BURGER — contenu éditable du site
//
// Tout le texte, le menu, les coordonnées, les appels à l'action et la timeline
// du vol (beats) sont ici. Modifiez ce fichier puis rechargez la page.
//
// Les valeurs `null` s'affichent « À confirmer » et masquent les boutons associés.
// Les éléments marqués  // À CONFIRMER  sont des propositions de démonstration :
// ils décrivent le concept tel que filmé, pas des faits vérifiés sur l'entreprise.
// ─────────────────────────────────────────────────────────────────────────────

export default {
  demo: true, // affiche la mention « site de démonstration » dans le pied de page

  brand: {
    name: 'Lamah Burger',
    city: 'Conakry',
    country: 'Guinée',
    tagline: 'Burgers grillés à la flamme', // À CONFIRMER
  },

  nav: [
    { label: 'La visite', href: '#vol' },
    { label: 'Menu', href: '#menu' },
    { label: 'Savoir-faire', href: '#savoir-faire' },
    { label: 'Nous trouver', href: '#visite' },
  ],
  navCta: { label: 'Commander', href: '#commander' },

  // ── Coordonnées ── (null = « À confirmer », les boutons liés sont masqués)
  contact: {
    address: null, // ex. « Route du Niger, Kaloum »
    hours: null, // ex. [['Lun – Jeu', '11 h – 23 h'], ['Ven – Dim', '11 h – 1 h']]
    phone: null, // ex. '+224 6XX XX XX XX'
    whatsapp: null, // numéro international sans « + » ni espaces, ex. '2246XXXXXXXX'
    email: null,
    mapUrl: null, // lien Google Maps de l'établissement
    // Destination réelle du formulaire (ex. un endpoint Formspree). Tant qu'elle
    // est vide, le formulaire fonctionne en mode démo et l'indique clairement.
    formEndpoint: null,
  },

  // ── Chapitres de texte portés par le vol ──
  // `still` : instant (secondes du film maître) utilisé comme image fixe en mode
  // mouvement réduit / appareil limité. `align` : zone réservée au texte sur ordinateur.
  chapters: [
    {
      id: 'arrivee',
      scene: '01 — Arrivée',
      align: 'left',
      still: 0,
      eyebrow: 'Conakry · Grillé à la flamme',
      heading: 'Le burger, <em>en grand.</em>',
      level: 1,
      body: "La rapidité d'un fast-food, l'exigence d'une grande table : steaks grillés à la minute, pain brioché doré, frites maison.", // À CONFIRMER
      actions: [
        { label: 'Voir le menu', href: '#menu', style: 'primary' },
        { label: 'Nous trouver', href: '#visite', style: 'ghost' },
      ],
    },
    {
      id: 'salle',
      scene: '02 — La salle',
      align: 'right',
      still: 9,
      eyebrow: 'Sur place · À emporter',
      heading: 'Commandez. <em>On s’occupe du reste.</em>',
      body: 'Un comptoir ouvert, une salle chaleureuse, une cuisine à vue. Votre commande part au grill dès qu’elle est passée.', // À CONFIRMER
      actions: [{ label: 'Découvrir les burgers', href: '#menu', style: 'primary' }],
    },
    {
      id: 'cuisine',
      scene: '03 — La cuisine',
      align: 'left',
      still: 19,
      eyebrow: 'Cuisine ouverte',
      heading: 'Grillé à la minute, <em>jamais à l’avance.</em>',
      body: 'Le steak est pressé sur la plaque, saisi à la flamme, le cheddar fond, le pain dore. Puis on assemble, on emballe, on vous appelle.', // À CONFIRMER
      actions: [{ label: 'Notre savoir-faire', href: '#savoir-faire', style: 'ghost' }],
    },
    {
      id: 'frais',
      scene: '04 — Le frais',
      align: 'right',
      still: 27,
      eyebrow: 'Réserve & préparation',
      heading: 'Le frais <em>d’abord.</em>',
      body: 'Tomates, oignons, salades et pains : tout est lavé, taillé et préparé sur place, chaque jour.', // À CONFIRMER
      actions: [],
    },
    {
      id: 'visite',
      scene: '05 — Nous trouver',
      align: 'left',
      still: 45,
      eyebrow: 'Sur place · À emporter · Au volant',
      heading: 'Venez nous voir <em>à Conakry.</em>',
      body: 'Salle, terrasse et voie drive : arrêtez-vous le temps d’un repas ou repartez sans descendre de voiture.', // À CONFIRMER
      showContact: true, // affiche adresse + horaires sous le texte
      actions: [
        { label: 'Commander', href: '#commander', style: 'primary' },
        { label: 'Itinéraire', href: 'contact.mapUrl', style: 'ghost' }, // masqué tant que mapUrl est vide
      ],
    },
  ],

  // ── Timeline du vol ──
  // Chaque beat associe une distance de scroll (vh = hauteurs d'écran) à un
  // intervalle du film maître (secondes). from === to = arrêt sur image.
  // `chapter` = texte affiché pendant ce beat (null = pas de texte, le mouvement parle).
  // `focusX` (0–1, optionnel) = cadrage horizontal sur écran vertical (0,5 = centre).
  // Durées provisoires sur un film maître de 45 s (3 segments de 15 s) : à ajuster
  // une fois les clips générés — voir production/README.md.
  flight: {
    fadeVh: 0.3, // durée des fondus de texte, en hauteurs d'écran
    beats: [
      { id: 'b01-hold', vh: 0.8, from: 0, to: 0, chapter: 'arrivee', focusX: 0.5, note: 'Plan d’ouverture tenu — le titre se lit' },
      { id: 'b02-approach', vh: 1.4, from: 0, to: 5.5, chapter: 'arrivee', focusX: 0.5, note: 'Approche, arc devant la terrasse, entrée par les portes ouvertes' },
      { id: 'b03-counter', vh: 1.3, from: 5.5, to: 9.5, chapter: 'salle', focusX: 0.4, note: 'Ralentit et glisse le long du comptoir' },
      { id: 'b04-dining', vh: 1.1, from: 9.5, to: 13, chapter: 'salle', focusX: 0.55, note: 'Courbe en S autour de la grande table, lacet vers la cuisine' },
      { id: 't1-door', vh: 0.6, from: 13, to: 16, chapter: null, focusX: 0.5, note: 'Porte battante ouverte par un équipier, passage en cuisine' },
      { id: 'b05-grill', vh: 1.7, from: 16, to: 22, chapter: 'cuisine', focusX: 0.5, note: 'Arc autour du grill, plongée sur le fromage qui fond' },
      { id: 'b06-assembly', vh: 0.9, from: 22, to: 25, chapter: 'cuisine', focusX: 0.45, note: 'Courbe le long de la ligne d’assemblage' },
      { id: 'b07-prep', vh: 1.4, from: 25, to: 30, chapter: 'frais', focusX: 0.5, note: 'Porte latérale, allée de rayonnages, virage au bout' },
      { id: 't2-exit', vh: 0.7, from: 30, to: 34, chapter: null, focusX: 0.5, note: 'Sortie par la porte arrière dans la cour de service' },
      { id: 't3-yaw', vh: 0.6, from: 34, to: 37, chapter: null, focusX: 0.5, note: 'Demi-tour de 180° en mouvement, face au bâtiment' },
      { id: 'b08-reveal', vh: 1.6, from: 37, to: 45, chapter: 'visite', focusX: 0.5, note: 'Recul et montée : révélation aérienne' },
      { id: 'b09-hold', vh: 0.9, from: 45, to: 45, chapter: 'visite', focusX: 0.5, note: 'Plan aérien final tenu' },
    ],
  },

  // ── Médias ──
  media: {
    manifest: 'media/frames/manifest.json', // séquence d'images du vol (voir scripts/make-frames.sh)
    devManifest: 'media/dev-frames/manifest.json', // mire de test locale (?frames=dev)
  },

  // ── Menu ──
  menu: {
    heading: 'Le <em>menu</em>',
    intro: 'Des burgers pensés comme des plats : peu d’ingrédients, tous choisis, tous assemblés à la commande.',
    note: 'Prix indicatifs de démonstration, à confirmer.', // À CONFIRMER
    currency: 'GNF',
    categories: [
      {
        id: 'burgers',
        name: 'Burgers',
        items: [
          { name: 'Le Lamah', desc: 'Double steak de bœuf smashé, cheddar affiné, oignons caramélisés, sauce Lamah, pain brioché.', price: 95000, tags: ['Signature'], image: null },
          { name: 'Le Kaloum', desc: 'Steak de bœuf grillé à la flamme, fromage fondu, bœuf fumé, cornichons, moutarde douce.', price: 85000, tags: [], image: null },
          { name: 'Le Soumbala', desc: 'Bœuf grillé, sauce pimentée au soumbala, oignons frits, piment frais.', price: 90000, tags: ['Épicé'], image: null },
          { name: 'Le Fouta', desc: 'Poulet mariné grillé, salade croquante, avocat, mayonnaise au citron vert.', price: 80000, tags: ['Poulet'], image: null },
          { name: 'Le Nimba', desc: 'Galette de haricots et patate douce, légumes grillés, sauce yaourt aux herbes.', price: 75000, tags: ['Végétarien'], image: null },
        ],
      },
      {
        id: 'accompagnements',
        name: 'Accompagnements',
        items: [
          { name: 'Frites maison', desc: 'Coupées sur place, double cuisson, sel fin.', price: 25000, tags: [] },
          { name: 'Alloco', desc: 'Banane plantain frite, piment doux.', price: 25000, tags: [] },
          { name: 'Rondelles d’oignon', desc: 'Panure croustillante, sauce fumée.', price: 25000, tags: [] },
        ],
      },
      {
        id: 'boissons',
        name: 'Boissons & desserts',
        items: [
          { name: 'Bissap maison', desc: 'Infusion d’hibiscus glacée, menthe.', price: 15000, tags: [] },
          { name: 'Gingembre pressé', desc: 'Jus de gingembre frais, citron vert.', price: 15000, tags: [] },
          { name: 'Milkshake vanille', desc: 'Glace vanille, lait entier, crème fouettée.', price: 35000, tags: [] },
        ],
      },
    ],
  },

  // ── Savoir-faire ──
  craft: {
    heading: 'Trois gestes, <em>tous les jours.</em>',
    intro: 'Ce que la caméra traverse dans la visite, en clair.',
    pillars: [
      { title: 'La flamme', body: 'Chaque steak est pressé puis saisi à la commande, pour une croûte dorée et un cœur juteux.', still: 19 }, // À CONFIRMER
      { title: 'Le pain', body: 'Pain brioché toasté sur la plaque au moment d’assembler, pour qu’il tienne jusqu’à la dernière bouchée.', still: 22 }, // À CONFIRMER
      { title: 'Le frais', body: 'Légumes lavés et taillés sur place chaque jour, sauces préparées en cuisine.', still: 27 }, // À CONFIRMER
    ],
  },

  // ── Commander ──
  order: {
    heading: 'Trois façons de <em>venir chercher.</em>',
    modes: [
      { title: 'Sur place', body: 'En salle ou en terrasse, servi sur plateau, au calme.' }, // À CONFIRMER
      { title: 'À emporter', body: 'Commandez au comptoir ou par téléphone, repartez en quelques minutes.' }, // À CONFIRMER
      { title: 'Au volant', body: 'La voie drive fait le tour du restaurant : commandez, payez, repartez.' }, // À CONFIRMER
    ],
  },

  // ── Visite ──
  visit: {
    heading: 'Nous <em>trouver.</em>',
    body: 'Un restaurant indépendant, avec parking, terrasse et voie drive.', // À CONFIRMER
    still: 45,
  },

  // ── Formulaire ──
  form: {
    heading: 'Réserver <em>une table.</em>',
    intro: 'Groupe, anniversaire, commande pour le bureau : laissez-nous vos coordonnées, nous vous rappelons.',
    submitLabel: 'Envoyer la demande',
    demoMessage: 'Mode démonstration : ce formulaire n’est encore relié à aucun service. Aucun message n’a été envoyé.',
    successMessage: 'Merci, votre demande a bien été envoyée. Nous vous rappelons rapidement.',
    errorMessage: 'L’envoi a échoué. Réessayez ou contactez-nous par téléphone.',
  },

  footer: {
    note: 'Site de démonstration : textes, prix, adresse et horaires à valider par Lamah Burger.',
  },
};
