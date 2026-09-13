/* Generates the two SQL files that load src/menuData.js into Supabase.
   Run after editing the carte:  npm run seed:sql

   supabase/seed.sql          — adds the carte to an EMPTY database. Existing
                                rows are left untouched (on conflict do nothing).
   supabase/replace-menu.sql  — ERASES every section and dish, then inserts the
                                carte. One transaction: if any insert fails,
                                nothing is erased. */
import { writeFileSync } from 'node:fs';
import { MENU } from '../src/menuData.js';

const q = v =>
  v === null || v === undefined || v === '' ? 'null' : `'${String(v).replace(/'/g, "''")}'`;

/* Postgres array literal. Tag keys are [a-z] by construction, so no quoting
   games are needed — but an empty list must still be '{}', not null. */
const arr = list => `'{${(list ?? []).join(',')}}'`;

const categoryCols = 'id, name, french, note, note_french, image_url, sort_order';
const dishCols = 'id, category_id, name, french, price, image_url, hint, tags, available, sort_order';

const categories = MENU.map((g, i) =>
  `  (${q(g.id)}, ${q(g.name)}, ${q(g.french)}, ${q(g.note)}, ${q(g.note_french)}, ${q(g.image)}, ${i})`);

/* sort_order restarts inside each section — dishes are grouped, then sorted.
   `available` defaults to true; menuData sets it false only for dishes that
   have no price yet. */
const dishes = MENU.flatMap(g =>
  g.items.map((it, i) =>
    `  (${q(it.id)}, ${q(g.id)}, ${q(it.name)}, ${q(it.french)}, ${Math.round(it.price)}, ${q(it.image)}, ${q(it.hint)}, ${arr(it.tags)}, ${it.available !== false}, ${i})`));

const insert = (table, cols, rows, tail = '') =>
  `insert into ${table} (${cols}) values\n${rows.join(',\n')}${tail};`;

const total = MENU.flatMap(g => g.items).length;
const hidden = MENU.flatMap(g => g.items.filter(it => it.available === false).map(it => `--   · ${it.french}`));

const seed = [
  '-- Tango seed carte, generated from src/menuData.js by scripts/gen-seed.mjs.',
  '-- Run AFTER schema.sql, on an empty database. Safe to re-run: existing rows',
  '-- are left untouched. To swap an existing carte for this one, run',
  '-- replace-menu.sql instead.',
  '',
  insert('categories', categoryCols, categories, '\non conflict (id) do nothing'),
  '',
  insert('dishes', dishCols, dishes, '\non conflict (id) do nothing'),
  ''
].join('\n');

const replace = [
  '-- Tango — ERASE the whole carte and load the real one.',
  '-- Generated from src/menuData.js by scripts/gen-seed.mjs. Do not edit by hand:',
  '-- change menuData.js and run `npm run seed:sql`.',
  '--',
  '-- Paste the whole file into Supabase → SQL Editor → Run.',
  '--',
  `-- Result: ${MENU.length} sections, ${total} dishes.`,
  ...(hidden.length ? [
    `-- ${hidden.length} of them are HIDDEN from guests, because the printed menu gives no price.`,
    '-- Set a price in #/staff, then switch "On the carte" on:',
    ...hidden
  ] : []),
  '--',
  '-- Everything runs as one transaction: if any line fails, nothing is erased.',
  '--',
  '-- THIS CANNOT BE UNDONE, and it does not delete uploaded photos — SQL only',
  '-- reaches the tables. If sections or dishes had photos, run',
  '-- `npm run clear:photos` afterwards (dry run first) to remove the orphans.',
  '',
  'begin;',
  '',
  '-- Dishes first, so the count is their own rather than a silent cascade.',
  'delete from dishes;',
  'delete from categories;',
  '',
  insert('categories', categoryCols, categories),
  '',
  insert('dishes', dishCols, dishes),
  '',
  'commit;',
  '',
  '-- Check: the numbers must match the header above.',
  'select',
  '  (select count(*) from categories)                    as sections,',
  '  (select count(*) from dishes)                        as dishes,',
  '  (select count(*) from dishes where not available)    as hidden_until_priced;',
  ''
].join('\n');

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), seed);
writeFileSync(new URL('../supabase/replace-menu.sql', import.meta.url), replace);
console.log(`seed.sql + replace-menu.sql written — ${MENU.length} sections, ${total} dishes, ${hidden.length} hidden (no price)`);
