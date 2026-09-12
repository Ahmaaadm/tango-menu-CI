/* Seed carte for Tango. This is the shape every row in the data layer takes,
   and what local mode is populated from the first time the app runs.

   name    — English, the line guests read first
   french  — the line beneath it; Tango's dining room is bilingual
   hint    — what belongs in the striped box until a photo is uploaded
   tags    — see src/lib/tags.js; an empty array is normal
   price   — whole FCFA, no decimals */

export const MENU = [
  {
    id: 'starters', name: 'Starters', french: 'Entrées',
    note: 'Served with house bread', note_french: 'Servi avec le pain maison', image: null,
    items: [
      { id: 'st-1', name: 'Beef Empanadas', french: 'Empanadas au bœuf · trois pièces', price: 4500, hint: 'empanadas', tags: ['pick'] },
      { id: 'st-2', name: 'Garlic Prawns', french: 'Crevettes à l’ail et persil', price: 7500, hint: 'prawn pan', tags: [] },
      { id: 'st-3', name: 'Grilled Provolone', french: 'Provolone grillé à l’origan', price: 5500, hint: 'provoleta', tags: ['veg'] },
      { id: 'st-4', name: 'Chicken Wings', french: 'Ailes de poulet marinées', price: 5000, hint: 'wings', tags: ['spicy'] },
      { id: 'st-5', name: 'Vegetable Spring Rolls', french: 'Nems aux légumes', price: 4000, hint: 'spring rolls', tags: ['veg'] },
      { id: 'st-6', name: 'Soup of the Moment', french: 'Soupe du moment', price: 3500, hint: 'soup bowl', tags: [] }
    ]
  },
  {
    id: 'salads', name: 'Salads', french: 'Salades', image: null,
    note: 'Large enough for a light main', note_french: 'Assez copieuses pour un plat léger',
    items: [
      { id: 'sa-1', name: 'Tango Caesar', french: 'César au poulet grillé', price: 7000, hint: 'caesar', tags: ['pick'] },
      { id: 'sa-2', name: 'Avocado & Grapefruit', french: 'Avocat et pamplemousse', price: 6500, hint: 'avocado salad', tags: ['veg'] },
      { id: 'sa-3', name: 'Grilled Goat Cheese', french: 'Salade de chèvre chaud', price: 7000, hint: 'goat cheese', tags: ['veg'] },
      { id: 'sa-4', name: 'Tuna Niçoise', french: 'Niçoise au thon', price: 7500, hint: 'nicoise', tags: [] }
    ]
  },
  {
    id: 'grill', name: 'From the Grill', french: 'Grillades',
    note: 'Choose a side and a sauce', note_french: 'Au choix : un accompagnement et une sauce', image: null,
    items: [
      { id: 'gr-1', name: 'Rib Eye', french: 'Entrecôte 300 g', price: 16500, hint: 'rib eye', tags: ['pick'] },
      { id: 'gr-2', name: 'Beef Skewers', french: 'Brochettes de bœuf', price: 9500, hint: 'skewers', tags: [] },
      { id: 'gr-3', name: 'Half Chicken', french: 'Demi-poulet grillé', price: 8500, hint: 'grilled chicken', tags: [] },
      { id: 'gr-4', name: 'Lamb Chops', french: 'Côtelettes d’agneau', price: 15000, hint: 'lamb chops', tags: [] },
      { id: 'gr-5', name: 'Merguez Plate', french: 'Assiette de merguez', price: 8000, hint: 'merguez', tags: ['spicy'] },
      { id: 'gr-6', name: 'Mixed Grill for Two', french: 'Grillade mixte pour deux', price: 26000, hint: 'mixed grill', tags: ['pick'] }
    ]
  },
  {
    id: 'sea', name: 'From the Sea', french: 'Poissons et fruits de mer', image: null,
    items: [
      { id: 'se-1', name: 'Whole Grilled Sea Bream', french: 'Dorade entière grillée', price: 12000, hint: 'sea bream', tags: [] },
      { id: 'se-2', name: 'Captain Fillet', french: 'Filet de capitaine', price: 13500, hint: 'captain fillet', tags: ['pick'] },
      { id: 'se-3', name: 'Grilled Prawns', french: 'Gambas grillées', price: 15000, hint: 'gambas', tags: [] },
      { id: 'se-4', name: 'Fried Calamari', french: 'Calamars frits, sauce tartare', price: 9000, hint: 'calamari', tags: [] }
    ]
  },
  {
    id: 'house', name: 'House Specialities', french: 'Spécialités de la maison', image: null,
    note: 'The dishes the kitchen is known for', note_french: 'Les plats qui font la maison',
    items: [
      { id: 'ho-1', name: 'Braised Chicken & Attiéké', french: 'Poulet braisé et attiéké', price: 8500, hint: 'poulet braise', tags: ['pick'] },
      { id: 'ho-2', name: 'Kedjenou', french: 'Kedjenou de poulet', price: 8000, hint: 'kedjenou', tags: ['spicy'] },
      { id: 'ho-3', name: 'Peanut Stew', french: 'Sauce arachide, riz blanc', price: 7500, hint: 'peanut stew', tags: [] },
      { id: 'ho-4', name: 'Garba Deluxe', french: 'Garba revisité', price: 6000, hint: 'garba', tags: ['new'] }
    ]
  },
  {
    id: 'pasta', name: 'Pasta & Risotto', french: 'Pâtes et risottos', image: null,
    items: [
      { id: 'pa-1', name: 'Beef Bolognese', french: 'Tagliatelles bolognaise', price: 7500, hint: 'bolognese', tags: [] },
      { id: 'pa-2', name: 'Prawn Linguine', french: 'Linguine aux gambas', price: 10500, hint: 'linguine', tags: [] },
      { id: 'pa-3', name: 'Mushroom Risotto', french: 'Risotto aux champignons', price: 8000, hint: 'risotto', tags: ['veg'] },
      { id: 'pa-4', name: 'Four Cheese Penne', french: 'Penne aux quatre fromages', price: 7500, hint: 'penne', tags: ['veg'] }
    ]
  },
  {
    id: 'burgers', name: 'Burgers & Sandwiches', french: 'Burgers et sandwichs', image: null,
    note: 'All served with fries', note_french: 'Tous servis avec des frites',
    items: [
      { id: 'bu-1', name: 'Tango Burger', french: 'Burger maison, cheddar, oignons confits', price: 8000, hint: 'burger', tags: ['pick'] },
      { id: 'bu-2', name: 'Chicken Club', french: 'Club sandwich au poulet', price: 6500, hint: 'club sandwich', tags: [] },
      { id: 'bu-3', name: 'Veggie Burger', french: 'Burger végétarien', price: 6500, hint: 'veggie burger', tags: ['veg'] }
    ]
  },
  {
    id: 'sides', name: 'Sides', french: 'Accompagnements', image: null,
    items: [
      { id: 'si-1', name: 'French Fries', french: 'Frites maison', price: 2500, hint: 'fries', tags: ['veg'] },
      { id: 'si-2', name: 'Attiéké', french: 'Attiéké', price: 2000, hint: 'attieke', tags: ['veg'] },
      { id: 'si-3', name: 'Fried Plantain', french: 'Alloco', price: 2500, hint: 'alloco', tags: ['veg'] },
      { id: 'si-4', name: 'Sautéed Vegetables', french: 'Légumes sautés', price: 3000, hint: 'vegetables', tags: ['veg'] },
      { id: 'si-5', name: 'White Rice', french: 'Riz blanc', price: 2000, hint: 'rice', tags: ['veg'] }
    ]
  },
  {
    id: 'desserts', name: 'Desserts', french: 'Desserts', image: null,
    items: [
      { id: 'de-1', name: 'Chocolate Fondant', french: 'Fondant au chocolat', price: 4500, hint: 'fondant', tags: ['pick'] },
      { id: 'de-2', name: 'Crème Caramel', french: 'Crème caramel', price: 3500, hint: 'creme caramel', tags: [] },
      { id: 'de-3', name: 'Seasonal Fruit', french: 'Assiette de fruits frais', price: 4000, hint: 'fruit plate', tags: ['veg'] },
      { id: 'de-4', name: 'Ice Cream, Three Scoops', french: 'Glace, trois boules', price: 3500, hint: 'ice cream', tags: [] }
    ]
  },
  {
    id: 'drinks', name: 'Drinks', french: 'Boissons', image: null,
    items: [
      { id: 'dr-1', name: 'Bissap', french: 'Jus de bissap', price: 2000, hint: 'bissap', tags: ['veg'] },
      { id: 'dr-2', name: 'Ginger Juice', french: 'Jus de gingembre', price: 2000, hint: 'ginger juice', tags: ['spicy'] },
      { id: 'dr-3', name: 'Fresh Lemonade', french: 'Citronnade fraîche', price: 2500, hint: 'lemonade', tags: ['veg'] },
      { id: 'dr-4', name: 'Still Water', french: 'Eau plate 1 L', price: 1000, hint: 'water', tags: [] },
      { id: 'dr-5', name: 'Soft Drink', french: 'Soda au choix', price: 1500, hint: 'soda', tags: [] },
      { id: 'dr-6', name: 'Espresso', french: 'Café expresso', price: 1500, hint: 'espresso', tags: [] }
    ]
  }
];

export const ALL_ITEMS = MENU.flatMap(g => g.items);
