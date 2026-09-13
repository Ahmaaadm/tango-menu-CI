-- Tango — ERASE the whole carte and load the real one.
-- Generated from src/menuData.js by scripts/gen-seed.mjs. Do not edit by hand:
-- change menuData.js and run `npm run seed:sql`.
--
-- Paste the whole file into Supabase → SQL Editor → Run.
--
-- Result: 6 sections, 50 dishes.
-- 7 of them are HIDDEN from guests, because the printed menu gives no price.
-- Set a price in #/staff, then switch "On the carte" on:
--   · null
--   · null
--   · null
--   · null
--   · null
--   · null
--   · null
--
-- Everything runs as one transaction: if any line fails, nothing is erased.
--
-- THIS CANNOT BE UNDONE, and it does not delete uploaded photos — SQL only
-- reaches the tables. If sections or dishes had photos, run
-- `npm run clear:photos` afterwards (dry run first) to remove the orphans.

begin;

-- Dishes first, so the count is their own rather than a silent cascade.
delete from dishes;
delete from categories;

insert into categories (id, name, french, note, note_french, image_url, sort_order) values
  ('entrees', 'Entrées', null, null, null, null, 0),
  ('pizzas', 'Pizzas et sandwich', null, null, null, null, 1),
  ('plats', 'Plats', null, null, null, null, 2),
  ('braises', 'Plats africains · braisés', null, 'Nos plats sont servis avec la garniture de votre choix : riz, brocoli, chou-fleur, pommes de terre sautées, frites, alloco, légumes sautés, purée de pommes de terre ou gratin', null, null, 3),
  ('soupes', 'Plats africains · soupes', null, 'Nos plats sont servis avec la garniture de votre choix : riz, brocoli, chou-fleur, pommes de terre sautées, frites, alloco, légumes sautés, purée de pommes de terre ou gratin', null, null, 4),
  ('boissons', 'Boissons', null, null, null, null, 5);

insert into dishes (id, category_id, name, french, price, image_url, hint, tags, available, sort_order) values
  ('en-avocat-thon', 'entrees', 'Salade d’avocat au thon', null, 7000, null, 'avocat thon', '{}', true, 0),
  ('en-grecque', 'entrees', 'Salade grecque', null, 6000, null, 'salade grecque', '{veg}', true, 1),
  ('en-carpaccio', 'entrees', 'Carpaccio de poisson', null, 6000, null, 'carpaccio', '{}', true, 2),
  ('en-avocat-crevettes', 'entrees', 'Avocat crevettes', null, 7000, null, 'avocat crevettes', '{}', true, 3),
  ('en-cesar', 'entrees', 'Salade César', null, 6000, null, 'salade cesar', '{}', true, 4),
  ('en-mozzarella', 'entrees', 'Salade à la mozzarella', null, 6500, null, 'mozzarella', '{}', true, 5),
  ('en-chevre', 'entrees', 'Salade de fromage de chèvre', null, 7000, null, 'chevre chaud', '{}', true, 6),
  ('en-trio', 'entrees', 'Trio de salades', null, 9000, null, 'trio salades', '{}', true, 7),
  ('pz-margherita-gm', 'pizzas', 'Pizza marguerite · grand modèle', null, 7000, null, 'marguerite', '{veg}', true, 0),
  ('pz-margherita-pm', 'pizzas', 'Pizza marguerite · petit modèle', null, 5000, null, 'marguerite', '{veg}', true, 1),
  ('pz-royale', 'pizzas', 'Pizza royale', null, 0, null, 'pizza royale', '{}', false, 2),
  ('pz-vegetarienne', 'pizzas', 'Pizza végétarienne', null, 0, null, 'pizza vegetarienne', '{veg}', false, 3),
  ('pz-reine-crevettes', 'pizzas', 'Pizza reine crevettes', null, 0, null, 'reine crevettes', '{}', false, 4),
  ('pz-soujouk', 'pizzas', 'Pizza soujouk', null, 0, null, 'soujouk', '{}', false, 5),
  ('pz-pepperoni', 'pizzas', 'Pizza pepperoni', null, 0, null, 'pepperoni', '{}', false, 6),
  ('pz-saumon-fume', 'pizzas', 'Pizza saumon fumé', null, 0, null, 'saumon fume', '{}', false, 7),
  ('pz-sandwich-burger', 'pizzas', 'Sandwich burger', null, 4000, null, 'sandwich burger', '{}', true, 8),
  ('pl-filet-champignon', 'plats', 'Filet de bœuf crème champignons', null, 11000, null, 'filet de boeuf', '{}', true, 0),
  ('pl-pave-merou', 'plats', 'Pavé de mérou', null, 10000, null, 'pave de merou', '{}', true, 1),
  ('pl-entrecote', 'plats', 'Entrecôte', null, 18000, null, 'entrecote', '{}', true, 2),
  ('pl-ecrevisses-sautees', 'plats', 'Écrevisses sautées', null, 9000, null, 'ecrevisses', '{}', true, 3),
  ('pl-langouste', 'plats', 'Langouste braisée au beurre d’ail', null, 12000, null, 'langouste', '{}', true, 4),
  ('pl-spaghetti-mer', 'plats', 'Spaghetti aux fruits de mer', null, 10000, null, 'spaghetti mer', '{}', true, 5),
  ('pl-souris-agneau', 'plats', 'Souris d’agneau', null, 13000, null, 'souris agneau', '{}', true, 6),
  ('pl-brochettes-estragon', 'plats', 'Brochettes de mérou à l’estragon', null, 10000, null, 'brochettes merou', '{}', true, 7),
  ('pl-merou-tomate', 'plats', 'Filet de mérou tomate basilic', null, 0, null, 'filet de merou', '{}', false, 8),
  ('pl-burger', 'plats', 'Plat de burger', null, 6000, null, 'burger', '{}', true, 9),
  ('pl-filet-moutarde', 'plats', 'Filet de bœuf moutarde à l’ancienne', null, 12000, null, 'filet moutarde', '{}', true, 10),
  ('pl-poulet-pane', 'plats', 'Poulet pané', null, 10000, null, 'poulet pane', '{}', true, 11),
  ('pl-sole-meuniere', 'plats', 'Sole meunière', null, 10000, null, 'sole', '{}', true, 12),
  ('pl-bolognaise', 'plats', 'Spaghetti à la bolognaise', null, 9000, null, 'bolognaise', '{}', true, 13),
  ('af-poulet-braise-entier', 'braises', 'Poulet braisé · entier', null, 10000, null, 'poulet braise', '{}', true, 0),
  ('af-poulet-braise-demi', 'braises', 'Poulet braisé · demi', null, 5000, null, 'poulet braise', '{}', true, 1),
  ('af-brochette-merou', 'braises', 'Brochette de mérou', null, 10000, null, 'brochette merou', '{}', true, 2),
  ('af-brochette-ecrevisses', 'braises', 'Brochette d’écrevisses', null, 11000, null, 'brochette ecrevisses', '{}', true, 3),
  ('af-kedjenou-poisson', 'soupes', 'Kedjenou de poisson', null, 9000, null, 'kedjenou poisson', '{}', true, 0),
  ('af-kedjenou-poulet-entier', 'soupes', 'Kedjenou de poulet · entier', null, 10000, null, 'kedjenou poulet', '{}', true, 1),
  ('af-kedjenou-poulet-demi', 'soupes', 'Kedjenou de poulet · demi', null, 5000, null, 'kedjenou poulet', '{}', true, 2),
  ('af-kedjenou-ecrevisses', 'soupes', 'Kedjenou d’écrevisses', null, 9000, null, 'kedjenou ecrevisses', '{}', true, 3),
  ('bo-jus-pomme', 'boissons', 'Jus de pomme', null, 3000, null, 'jus de pomme', '{}', true, 0),
  ('bo-jus-carotte', 'boissons', 'Jus de carotte', null, 3000, null, 'jus de carotte', '{}', true, 1),
  ('bo-jus-orange', 'boissons', 'Jus d’orange', null, 2500, null, 'jus orange', '{}', true, 2),
  ('bo-sucrerie', 'boissons', 'Sucrerie', null, 1000, null, 'sucrerie', '{}', true, 3),
  ('bo-energisante', 'boissons', 'Boisson énergisante', null, 1000, null, 'energisante', '{}', true, 4),
  ('bo-eau-15', 'boissons', 'Eau 1,5 L', null, 1500, null, 'eau 1.5l', '{}', true, 5),
  ('bo-eau-05', 'boissons', 'Eau 0,5 L', null, 500, null, 'eau 0.5l', '{}', true, 6),
  ('bo-nespresso', 'boissons', 'Café Nespresso', null, 2000, null, 'nespresso', '{}', true, 7),
  ('bo-the-arabe', 'boissons', 'Thé arabe', null, 2000, null, 'the arabe', '{}', true, 8),
  ('bo-perrier', 'boissons', 'Perrier', null, 2000, null, 'perrier', '{}', true, 9),
  ('bo-cafe-arabe', 'boissons', 'Café arabe', null, 2500, null, 'cafe arabe', '{}', true, 10);

commit;

-- Check: the numbers must match the header above.
select
  (select count(*) from categories)                    as sections,
  (select count(*) from dishes)                        as dishes,
  (select count(*) from dishes where not available)    as hidden_until_priced;
