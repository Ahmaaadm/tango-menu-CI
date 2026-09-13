/* Tango's real carte, transcribed from the printed menu (photos, 2026-09-12).
   This is the shape every row in the data layer takes, what local mode is
   populated from, and what scripts/gen-seed.mjs turns into both
   supabase/seed.sql and supabase/replace-menu.sql.

   THE CARTE IS IN FRENCH, like the printed one — San Pédro reads French, and
   the owner asked for the menu to match the book on the table. So `name` is
   the French wording and `french` (the optional second line under a name) is
   null throughout. It stays in the schema: fill it in and a second line
   appears under every dish, which is where an English translation would go if
   the restaurant ever wants one.

   name       — the dish, in French, as printed (spelling corrected)
   french     — optional second line under the name; unused here
   hint       — what belongs in the empty photo frame until a photo is uploaded
   tags       — see src/lib/tags.js; only where the name makes it certain
   price      — whole FCFA, no decimals
   available  — false hides a dish from guests. Used below for the dishes the
                printed menu lists WITHOUT a price: they exist, so staff can
                fill the price in from #/staff and switch them on, but a guest
                must never see "0 FCFA".

   One price per row, so a dish sold in two sizes (entier / demi, grand / petit
   modèle) is two rows side by side. */

const SIDES = 'Nos plats sont servis avec la garniture de votre choix : riz, brocoli, chou-fleur, pommes de terre sautées, frites, alloco, légumes sautés, purée de pommes de terre ou gratin';

export const MENU = [
  {
    id: 'entrees', name: 'Entrées', french: null, image: null,
    items: [
      { id: 'en-avocat-thon', name: 'Salade d’avocat au thon', french: null, price: 7000, hint: 'avocat thon', tags: [] },
      { id: 'en-grecque', name: 'Salade grecque', french: null, price: 6000, hint: 'salade grecque', tags: ['veg'] },
      { id: 'en-carpaccio', name: 'Carpaccio de poisson', french: null, price: 6000, hint: 'carpaccio', tags: [] },
      { id: 'en-avocat-crevettes', name: 'Avocat crevettes', french: null, price: 7000, hint: 'avocat crevettes', tags: [] },
      { id: 'en-cesar', name: 'Salade César', french: null, price: 6000, hint: 'salade cesar', tags: [] },
      { id: 'en-mozzarella', name: 'Salade à la mozzarella', french: null, price: 6500, hint: 'mozzarella', tags: [] },
      { id: 'en-chevre', name: 'Salade de fromage de chèvre', french: null, price: 7000, hint: 'chevre chaud', tags: [] },
      { id: 'en-trio', name: 'Trio de salades', french: null, price: 9000, hint: 'trio salades', tags: [] }
    ]
  },
  {
    id: 'pizzas', name: 'Pizzas et sandwich', french: null, image: null,
    items: [
      { id: 'pz-margherita-gm', name: 'Pizza marguerite · grand modèle', french: null, price: 7000, hint: 'marguerite', tags: ['veg'] },
      { id: 'pz-margherita-pm', name: 'Pizza marguerite · petit modèle', french: null, price: 5000, hint: 'marguerite', tags: ['veg'] },
      /* No price on the printed menu — hidden until staff set one. */
      { id: 'pz-royale', name: 'Pizza royale', french: null, price: 0, hint: 'pizza royale', tags: [], available: false },
      { id: 'pz-vegetarienne', name: 'Pizza végétarienne', french: null, price: 0, hint: 'pizza vegetarienne', tags: ['veg'], available: false },
      { id: 'pz-reine-crevettes', name: 'Pizza reine crevettes', french: null, price: 0, hint: 'reine crevettes', tags: [], available: false },
      { id: 'pz-soujouk', name: 'Pizza soujouk', french: null, price: 0, hint: 'soujouk', tags: [], available: false },
      { id: 'pz-pepperoni', name: 'Pizza pepperoni', french: null, price: 0, hint: 'pepperoni', tags: [], available: false },
      { id: 'pz-saumon-fume', name: 'Pizza saumon fumé', french: null, price: 0, hint: 'saumon fume', tags: [], available: false },
      { id: 'pz-sandwich-burger', name: 'Sandwich burger', french: null, price: 4000, hint: 'sandwich burger', tags: [] }
    ]
  },
  {
    id: 'plats', name: 'Plats', french: null, image: null,
    items: [
      { id: 'pl-filet-champignon', name: 'Filet de bœuf crème champignons', french: null, price: 11000, hint: 'filet de boeuf', tags: [] },
      { id: 'pl-pave-merou', name: 'Pavé de mérou', french: null, price: 10000, hint: 'pave de merou', tags: [] },
      { id: 'pl-entrecote', name: 'Entrecôte', french: null, price: 18000, hint: 'entrecote', tags: [] },
      { id: 'pl-ecrevisses-sautees', name: 'Écrevisses sautées', french: null, price: 9000, hint: 'ecrevisses', tags: [] },
      { id: 'pl-langouste', name: 'Langouste braisée au beurre d’ail', french: null, price: 12000, hint: 'langouste', tags: [] },
      { id: 'pl-spaghetti-mer', name: 'Spaghetti aux fruits de mer', french: null, price: 10000, hint: 'spaghetti mer', tags: [] },
      { id: 'pl-souris-agneau', name: 'Souris d’agneau', french: null, price: 13000, hint: 'souris agneau', tags: [] },
      { id: 'pl-brochettes-estragon', name: 'Brochettes de mérou à l’estragon', french: null, price: 10000, hint: 'brochettes merou', tags: [] },
      /* No price on the printed menu — hidden until staff set one. */
      { id: 'pl-merou-tomate', name: 'Filet de mérou tomate basilic', french: null, price: 0, hint: 'filet de merou', tags: [], available: false },
      { id: 'pl-burger', name: 'Plat de burger', french: null, price: 6000, hint: 'burger', tags: [] },
      { id: 'pl-filet-moutarde', name: 'Filet de bœuf moutarde à l’ancienne', french: null, price: 12000, hint: 'filet moutarde', tags: [] },
      { id: 'pl-poulet-pane', name: 'Poulet pané', french: null, price: 10000, hint: 'poulet pane', tags: [] },
      { id: 'pl-sole-meuniere', name: 'Sole meunière', french: null, price: 10000, hint: 'sole', tags: [] },
      { id: 'pl-bolognaise', name: 'Spaghetti à la bolognaise', french: null, price: 9000, hint: 'bolognaise', tags: [] }
    ]
  },
  {
    id: 'braises', name: 'Plats africains · braisés', french: null, image: null,
    note: SIDES, note_french: null,
    items: [
      { id: 'af-poulet-braise-entier', name: 'Poulet braisé · entier', french: null, price: 10000, hint: 'poulet braise', tags: [] },
      { id: 'af-poulet-braise-demi', name: 'Poulet braisé · demi', french: null, price: 5000, hint: 'poulet braise', tags: [] },
      { id: 'af-brochette-merou', name: 'Brochette de mérou', french: null, price: 10000, hint: 'brochette merou', tags: [] },
      { id: 'af-brochette-ecrevisses', name: 'Brochette d’écrevisses', french: null, price: 11000, hint: 'brochette ecrevisses', tags: [] }
    ]
  },
  {
    id: 'soupes', name: 'Plats africains · soupes', french: null, image: null,
    note: SIDES, note_french: null,
    items: [
      { id: 'af-kedjenou-poisson', name: 'Kedjenou de poisson', french: null, price: 9000, hint: 'kedjenou poisson', tags: [] },
      { id: 'af-kedjenou-poulet-entier', name: 'Kedjenou de poulet · entier', french: null, price: 10000, hint: 'kedjenou poulet', tags: [] },
      { id: 'af-kedjenou-poulet-demi', name: 'Kedjenou de poulet · demi', french: null, price: 5000, hint: 'kedjenou poulet', tags: [] },
      /* Price partly hidden by glare on the photo; read as 9 000. */
      { id: 'af-kedjenou-ecrevisses', name: 'Kedjenou d’écrevisses', french: null, price: 9000, hint: 'kedjenou ecrevisses', tags: [] }
    ]
  },
  {
    id: 'boissons', name: 'Boissons', french: null, image: null,
    items: [
      { id: 'bo-jus-pomme', name: 'Jus de pomme', french: null, price: 3000, hint: 'jus de pomme', tags: [] },
      { id: 'bo-jus-carotte', name: 'Jus de carotte', french: null, price: 3000, hint: 'jus de carotte', tags: [] },
      { id: 'bo-jus-orange', name: 'Jus d’orange', french: null, price: 2500, hint: 'jus orange', tags: [] },
      { id: 'bo-sucrerie', name: 'Sucrerie', french: null, price: 1000, hint: 'sucrerie', tags: [] },
      { id: 'bo-energisante', name: 'Boisson énergisante', french: null, price: 1000, hint: 'energisante', tags: [] },
      { id: 'bo-eau-15', name: 'Eau 1,5 L', french: null, price: 1500, hint: 'eau 1.5l', tags: [] },
      { id: 'bo-eau-05', name: 'Eau 0,5 L', french: null, price: 500, hint: 'eau 0.5l', tags: [] },
      { id: 'bo-nespresso', name: 'Café Nespresso', french: null, price: 2000, hint: 'nespresso', tags: [] },
      { id: 'bo-the-arabe', name: 'Thé arabe', french: null, price: 2000, hint: 'the arabe', tags: [] },
      { id: 'bo-perrier', name: 'Perrier', french: null, price: 2000, hint: 'perrier', tags: [] },
      { id: 'bo-cafe-arabe', name: 'Café arabe', french: null, price: 2500, hint: 'cafe arabe', tags: [] }
    ]
  }
];

export const ALL_ITEMS = MENU.flatMap(g => g.items);
