/* Picks an adapter and exposes the carte to React.
   Supabase is used when both env vars are set; otherwise everything runs
   locally, so the app works with zero setup. */
import { useCallback, useEffect, useState } from 'react';
import { createLocalAdapter } from './localAdapter.js';
import { createSupabaseAdapter } from './supabaseAdapter.js';

export const usingSupabase = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const adapter = usingSupabase ? createSupabaseAdapter() : createLocalAdapter();

const byOrder = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

/* Rebuilds the nested { category, items[] } shape the carte renders from.
   Sold-out dishes drop out here, which is why the guest UI never has to
   think about `available`. */
export function toCarte(db) {
  return [...(db.categories ?? [])].sort(byOrder).map(c => ({
    ...c,
    items: (db.dishes ?? [])
      .filter(d => d.category_id === c.id && d.available !== false)
      .sort(byOrder)
  }));
}

/* Accent-insensitive, so "creme" finds "Crème" — most guests type on a phone
   keyboard without accents, and half this carte carries them. */
const fold = s =>
  (s ?? '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* Flat list of matching dishes, each carrying the section it came from so a
   result can still say where it lives on the carte. */
export function searchCarte(carte, query) {
  const q = fold(query).trim();
  if (!q) return [];
  return carte.flatMap(c =>
    c.items
      .filter(d => fold(d.name).includes(q) || fold(d.french).includes(q))
      .map(d => ({ ...d, section: c.name }))
  );
}

const EMPTY = { categories: [], dishes: [] };

export function useCarte() {
  const [db, setDb] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setDb(await adapter.load());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  /* Every mutation returns the fresh database, so the UI never guesses at
     what the write did. */
  const run = useCallback(async (fn, ...args) => {
    const next = await adapter[fn](...args);
    setDb(next ?? (await adapter.load()));
  }, []);

  return { db, loading, error, refresh, run };
}
