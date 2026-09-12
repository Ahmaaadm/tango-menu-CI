/* Deletes photographs from the Supabase storage bucket.

   SQL cannot do this: storage.objects is only the metadata index, so deleting
   rows there leaves the real file behind, untracked and still counting against
   the free tier. Files have to go through the storage API, which is this.

   By default only orphans go — files nothing on the carte points at any more —
   so a photo still in use can never be deleted. Pass --all to empty the bucket.

     node scripts/clear-photos.mjs              # dry run: list the orphans
     node scripts/clear-photos.mjs --yes        # delete them
     node scripts/clear-photos.mjs --all --yes  # empty the bucket completely

   Run it from the project root — it reads .env relative to the cwd.
*/
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'tango-photos';
const PAGE = 100;
const MARKER = `/storage/v1/object/public/${BUCKET}/`;
const TABLES = ['categories', 'dishes'];

const all = process.argv.includes('--all');
const go = process.argv.includes('--yes');

/* The real environment wins and .env is the fallback — the order Vite uses. */
function env(name) {
  if (process.env[name]) return process.env[name];
  for (const file of ['.env.local', '.env']) {
    try {
      const line = readFileSync(file, 'utf8').split('\n').find(l => l.trim().startsWith(`${name}=`));
      const value = line?.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
      if (value) return value;
    } catch { /* no such file — try the next */ }
  }
  return '';
}

const url = env('VITE_SUPABASE_URL');
const key = env('VITE_SUPABASE_ANON_KEY');
if (!url || !key) {
  console.error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set, so there is no bucket to clear.');
  console.error('In local mode a photo lives inside the row in browser storage and goes when the row does.');
  process.exit(1);
}

const sb = createClient(url, key);
const check = ({ data, error }) => { if (error) throw new Error(error.message); return data; };

/* Everything in the bucket. Uploads are flat, so the root listing is the lot. */
async function listAll() {
  const files = [];
  for (let offset = 0; ; offset += PAGE) {
    const page = check(await sb.storage.from(BUCKET).list('', { limit: PAGE, offset }));
    files.push(...page.filter(f => f.id));   /* folders come back with a null id */
    if (page.length < PAGE) return files;
  }
}

/* Filenames the carte still points at. */
async function referenced() {
  const rows = await Promise.all(TABLES.map(t => sb.from(t).select('image_url').then(check)));
  return new Set(rows.flat()
    .map(r => r.image_url)
    .filter(u => typeof u === 'string' && u.includes(MARKER))
    .map(u => decodeURIComponent(u.slice(u.indexOf(MARKER) + MARKER.length).split('?')[0])));
}

const size = n =>
  n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`;

const files = await listAll();
if (!files.length) {
  console.log(`${BUCKET} is already empty.`);
  process.exit(0);
}

const keep = all ? new Set() : await referenced();
const doomed = files.filter(f => !keep.has(f.name));
const bytes = doomed.reduce((n, f) => n + (f.metadata?.size ?? 0), 0);

console.log(`${files.length} file${files.length === 1 ? '' : 's'} in ${BUCKET}, ${files.length - doomed.length} still on the carte.`);

if (!doomed.length) {
  console.log('Nothing to delete — every photo is in use.');
  process.exit(0);
}

for (const f of doomed.slice(0, 40)) console.log(`  ${f.name}  ${size(f.metadata?.size ?? 0)}`);
if (doomed.length > 40) console.log(`  …and ${doomed.length - 40} more`);

const what = all ? 'every file in the bucket' : `${doomed.length} orphaned photo${doomed.length === 1 ? '' : 's'}`;

if (!go) {
  console.log(`\nDry run. This would delete ${what} (${size(bytes)}).`);
  console.log(`Re-run with --yes to do it${all ? '' : ', or --all --yes to empty the bucket'}.`);
  process.exit(0);
}

/* remove() takes a batch, but not an unbounded one. */
let gone = 0;
for (let i = 0; i < doomed.length; i += PAGE) {
  const batch = doomed.slice(i, i + PAGE).map(f => f.name);
  check(await sb.storage.from(BUCKET).remove(batch));
  gone += batch.length;
}
console.log(`\nDeleted ${gone} file${gone === 1 ? '' : 's'}, ${size(bytes)} reclaimed.`);
