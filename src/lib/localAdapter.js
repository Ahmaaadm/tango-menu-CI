/* Local adapter — no account, no services, no cost. The carte lives in
   localStorage, seeded once from src/menuData.js, and edits stay in the one
   browser that made them. This is what runs until Supabase credentials exist.

   Photos become base64 inside the row here, and localStorage is a ~5 MB
   budget, so uploads are squeezed much harder than in Supabase mode. */
import { MENU } from '../menuData.js';
import { resizeImage, blobToDataUrl } from './images.js';
import { gate } from './gate.js';

const KEY = 'tango.carte.v1';

function seed() {
  const categories = MENU.map((g, i) => ({
    id: g.id,
    name: g.name,
    french: g.french,
    image_url: g.image ?? null,
    note: g.note ?? null,
    note_french: g.note_french ?? null,
    sort_order: i
  }));

  const dishes = MENU.flatMap((g, gi) =>
    g.items.map((it, i) => ({
      id: it.id,
      category_id: g.id,
      name: it.name,
      french: it.french,
      price: it.price,
      image_url: it.image ?? null,
      hint: it.hint,
      tags: it.tags ?? [],
      available: true,
      sort_order: gi * 100 + i
    }))
  );

  return { categories, dishes };
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { categories: [], dishes: [], ...JSON.parse(raw) };
  } catch { /* corrupt or unavailable — fall through and re-seed */ }
  return seed();
}

function write(db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    throw new Error('Browser storage is full. Remove a photo, or connect Supabase to store images properly.');
  }
  return db;
}

const upsert = (list, row) => {
  const i = list.findIndex(r => r.id === row.id);
  if (i === -1) return [...list, row];
  const next = [...list];
  next[i] = { ...next[i], ...row };
  return next;
};

export function createLocalAdapter() {
  return {
    mode: 'local',

    async load() {
      return read();
    },

    async saveCategory(row) {
      const db = read();
      return write({ ...db, categories: upsert(db.categories, row) });
    },

    /* Deleting a category takes its dishes with it, the same cascade the
       Postgres schema declares — the two modes must agree. */
    async deleteCategory(id) {
      const db = read();
      return write({
        ...db,
        categories: db.categories.filter(c => c.id !== id),
        dishes: db.dishes.filter(d => d.category_id !== id)
      });
    },

    async saveDish(row) {
      const db = read();
      return write({ ...db, dishes: upsert(db.dishes, row) });
    },
    async deleteDish(id) {
      const db = read();
      return write({ ...db, dishes: db.dishes.filter(d => d.id !== id) });
    },

    /* One write for bulk work like renumbering a whole group after a move. */
    async saveMany(kind, rows) {
      const db = read();
      return write({ ...db, [kind]: rows.reduce((list, row) => upsert(list, row), db[kind]) });
    },

    async deleteMany(kind, ids) {
      const db = read();
      const gone = new Set(ids);
      return write({ ...db, [kind]: db[kind].filter(r => !gone.has(r.id)) });
    },

    /* Deliberately small: these end up as base64 text inside the row. */
    async uploadImage(file) {
      return blobToDataUrl(await resizeImage(file, { maxSize: 700, quality: 0.7 }));
    },

    /* Nothing to remove — the photo is a data URL inside the row, so it goes
       when the row does. Present so both adapters expose one surface. */
    async deleteImage() {},
    async deleteImages() {},

    ...gate,

    async reset() {
      localStorage.removeItem(KEY);
      return seed();
    }
  };
}
