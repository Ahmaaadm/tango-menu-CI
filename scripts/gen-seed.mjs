/* Regenerates supabase/seed.sql from src/menuData.js.
   Run after editing the seed carte:  npm run seed:sql  */
import { writeFileSync } from 'node:fs';
import { MENU } from '../src/menuData.js';

const q = v =>
  v === null || v === undefined || v === '' ? 'null' : `'${String(v).replace(/'/g, "''")}'`;

/* Postgres array literal. Tag keys are [a-z] by construction, so no quoting
   games are needed — but an empty list must still be '{}', not null. */
const arr = list => `'{${(list ?? []).join(',')}}'`;

const block = (table, cols, rows) =>
  `insert into ${table} (${cols}) values\n${rows.join(',\n')}\non conflict (id) do nothing;`;

const categories = MENU.map((g, i) =>
  `  (${q(g.id)}, ${q(g.name)}, ${q(g.french)}, ${q(g.note)}, ${q(g.note_french)}, ${q(g.image)}, ${i})`);

/* sort_order restarts inside each section — dishes are grouped, then sorted. */
const dishes = MENU.flatMap(g =>
  g.items.map((it, i) =>
    `  (${q(it.id)}, ${q(g.id)}, ${q(it.name)}, ${q(it.french)}, ${Math.round(it.price)}, ${q(it.image)}, ${q(it.hint)}, ${arr(it.tags)}, true, ${i})`));

const sql = [
  '-- Tango seed carte, generated from src/menuData.js by scripts/gen-seed.mjs.',
  '-- Run AFTER schema.sql. Safe to re-run: existing rows are left untouched.',
  '',
  block('categories', 'id, name, french, note, note_french, image_url, sort_order', categories),
  '',
  block('dishes', 'id, category_id, name, french, price, image_url, hint, tags, available, sort_order', dishes),
  ''
].join('\n');

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql);
console.log(`seed.sql written — ${MENU.length} sections, ${MENU.flatMap(g => g.items).length} dishes`);
