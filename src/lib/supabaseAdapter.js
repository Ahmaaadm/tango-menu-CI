/* Supabase adapter — real Postgres, shared across every device, CDN photos.
   Tables and row-level security live in supabase/schema.sql. The client is
   imported lazily so guests in local mode never download it. */
import { resizeImage } from './images.js';
import { gate } from './gate.js';

const BUCKET = 'tango-photos';

/* Public URL back to an object path, so a photo can be removed again.
   Anything that is not one of our own uploads — an external URL, a local-mode
   data: URL, null — yields null and is never handed to storage. */
function bucketPath(url) {
  if (typeof url !== 'string') return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const at = url.indexOf(marker);
  return at === -1 ? null : decodeURIComponent(url.slice(at + marker.length).split('?')[0]);
}

async function client() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
}

let cached = null;
const sb = async () => (cached ??= await client());

function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

export function createSupabaseAdapter() {
  return {
    mode: 'supabase',

    async load() {
      const c = await sb();
      const [categories, dishes] = await Promise.all([
        c.from('categories').select('*').order('sort_order').then(check),
        c.from('dishes').select('*').order('sort_order').then(check)
      ]);
      return { categories, dishes };
    },

    async saveCategory(row) {
      check(await (await sb()).from('categories').upsert(row));
      return this.load();
    },
    async deleteCategory(id) {
      check(await (await sb()).from('categories').delete().eq('id', id));
      return this.load();
    },

    async saveDish(row) {
      check(await (await sb()).from('dishes').upsert(row));
      return this.load();
    },
    async deleteDish(id) {
      check(await (await sb()).from('dishes').delete().eq('id', id));
      return this.load();
    },

    /* One round trip for bulk work like renumbering a whole group. */
    async saveMany(table, rows) {
      if (rows.length) check(await (await sb()).from(table).upsert(rows));
      return this.load();
    },

    async deleteMany(table, ids) {
      if (ids.length) check(await (await sb()).from(table).delete().in('id', ids));
      return this.load();
    },

    async uploadImage(file) {
      const blob = await resizeImage(file, { maxSize: 1200, quality: 0.82 });
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const c = await sb();
      check(await c.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' }));
      return c.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    },

    async deleteImage(url) {
      return this.deleteImages([url]);
    },

    /* Best effort on purpose. An orphaned file is harmless; a cleanup failure
       that blocks a menu edit is not, so storage errors are swallowed. */
    async deleteImages(urls) {
      const paths = [...new Set(urls.map(bucketPath).filter(Boolean))];
      if (!paths.length) return;
      try {
        await (await sb()).storage.from(BUCKET).remove(paths);
      } catch { /* the file stays in the bucket; the carte is still correct */ }
    },

    ...gate
  };
}
