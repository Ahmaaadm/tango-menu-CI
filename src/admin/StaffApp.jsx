import React, { useMemo, useRef, useState, useEffect } from 'react';
import { adapter, toCarte, usingSupabase, useCarte } from '../lib/store.js';
import PrintCarte from '../components/PrintCarte.jsx';
import { money, PRICE_STEP } from '../lib/money.js';
import { readTags } from '../lib/tags.js';
import {
  Button, Card, Empty, Field, ImagePicker, TagPicker, Text, Toggle, inputStyle, label
} from './ui.jsx';

const byOrder = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

const slugify = s =>
  (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

/* Ids are readable but never guessed twice — two dishes may share a name. */
const newId = name => `${slugify(name) || 'row'}-${Math.random().toString(36).slice(2, 6)}`;

/* ----------------------------------------------------------------- login */

function Login({ onIn }) {
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      onIn(await adapter.signIn({ password }));
    } catch (ex) {
      setErr(ex.message);
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--band)' }}>
      <form onSubmit={submit} style={{
        width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 17,
        background: 'var(--paper)', padding: '28px 24px', border: '1px solid var(--brass-soft)'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="display" style={{ fontSize: 33, lineHeight: .9, letterSpacing: '.22em', paddingLeft: '.22em', color: 'var(--ink)' }}>TANGO</span>
          <span style={{ font: '400 9px/1 var(--ui)', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Staff panel</span>
        </div>

        <Field title="Passcode">
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            autoComplete="current-password" style={inputStyle} />
        </Field>

        {err && <div style={{ font: '400 12px/1.45 var(--ui)', color: 'var(--ember-deep)' }}>{err}</div>}

        {/* A native submit button, so Enter in the passcode field works. */}
        <button type="submit" disabled={busy} style={{
          padding: 13, borderRadius: 2, border: '1px solid var(--ember)',
          background: 'var(--ember)', color: 'var(--on-band)', cursor: busy ? 'not-allowed' : 'pointer',
          font: '500 11.5px/1 var(--ui)', letterSpacing: '.12em', textTransform: 'uppercase',
          opacity: busy ? .45 : 1
        }}>
          {busy ? 'Checking…' : 'Sign in'}
        </button>

        <div style={{ font: '300 11px/1.55 var(--ui)', color: 'var(--ink-3)', textAlign: 'center' }}>
          {usingSupabase
            ? 'Edits are saved to the shared database and go live at once.'
            : 'Local mode — edits are saved in this browser only.'}
        </div>
        <a href="#/" style={{ textAlign: 'center', font: '400 10px/1 var(--ui)', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Back to the carte</a>
      </form>
    </div>
  );
}

/* --------------------------------------------------------------- editors */

/* A photo is uploaded the moment it is picked, so editing strands files: the
   one that was replaced, and any uploaded and then replaced again. Deleting
   inside the picker would be wrong — closing an editor without saving must
   not remove the photo the stored row still points at — so the editor
   remembers every superseded URL and settles up once, at the end. */
function usePhotoCleanup(row, form, set) {
  const original = row.image_url ?? null;
  const stale = useRef([]);
  const settled = useRef(false);

  const seal = urls => {
    settled.current = true;
    return adapter.deleteImages([...new Set(urls.filter(Boolean))]);
  };

  return {
    /* The picker uploaded a replacement, or Remove cleared the field. */
    change: next => {
      if (form.image_url && form.image_url !== next) stale.current.push(form.image_url);
      set({ image_url: next });
    },
    /* Saved: everything superseded is unreferenced now, including the photo
       the row arrived with. */
    kept: saved => seal(stale.current.filter(u => u !== saved)),
    /* Row deleted: nothing it ever pointed at is referenced any more. `extra`
       carries the dishes a deleted section takes down with it. */
    purged: (extra = []) => seal([...stale.current, form.image_url, original, ...extra]),
    /* Closed without saving: drop only what this sitting uploaded. Runs on
       every close, so it no-ops once a save or a delete has settled. */
    dropped: () => {
      if (settled.current) return;
      return seal([...stale.current, form.image_url].filter(u => u !== original));
    }
  };
}

function Editor({ title, onClose, onSave, onDelete, canSave, children }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const guard = fn => async () => {
    setBusy(true);
    setErr('');
    try {
      await fn();
      onClose();
    } catch (ex) {
      setErr(ex.message);
      setBusy(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--veil)' }} />

      <div style={{
        position: 'relative', width: '100%', maxWidth: 520, maxHeight: '92vh',
        background: 'var(--paper)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'tgRise .24s cubic-bezier(.2,.8,.2,1)'
      }}>
        <div style={{ padding: '16px 20px', background: 'var(--band)', color: 'var(--on-band)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="display" style={{ fontSize: 21, letterSpacing: '.06em' }}>{title}</span>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ width: 32, height: 32, borderRadius: 2, border: '1px solid var(--rule-on-band)', background: 'transparent', color: 'var(--on-band)', font: '400 17px/1 var(--ui)', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {children}
          {err && <div style={{ font: '400 12px/1.45 var(--ui)', color: 'var(--ember-deep)' }}>{err}</div>}
        </div>

        <div style={{ padding: '14px 20px 20px', borderTop: '1px solid var(--rule)', background: 'var(--panel)', display: 'flex', gap: 10 }}>
          {onDelete && (
            <Button tone="danger" disabled={busy}
              onClick={() => { if (confirm('Delete this permanently?')) guard(onDelete)(); }}>Delete</Button>
          )}
          <Button tone="primary" disabled={busy || !canSave} onClick={guard(onSave)} style={{ flex: 1 }}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DishEditor({ row, categories, onClose, run }) {
  const [f, setF] = useState({ ...row, tags: readTags(row) });
  const set = patch => setF(v => ({ ...v, ...patch }));
  const photos = usePhotoCleanup(row, f, set);

  return (
    <Editor title={row.id ? 'Edit dish' : 'New dish'}
      onClose={() => { photos.dropped(); onClose(); }}
      canSave={Boolean(f.name?.trim() && f.category_id)}
      onSave={async () => {
        const next = {
          ...f,
          id: f.id || newId(f.name),
          name: f.name.trim(),
          french: f.french?.trim() || null,
          price: Math.round(Number(f.price)) || 0,
          hint: f.hint?.trim() || f.name.trim().toLowerCase(),
          tags: readTags(f)
        };
        await run('saveDish', next);
        await photos.kept(next.image_url ?? null);
      }}
      onDelete={row.id ? async () => { await run('deleteDish', row.id); await photos.purged(); } : null}>

      <ImagePicker value={f.image_url} onChange={photos.change} upload={adapter.uploadImage} slotLabel={f.hint || 'dish'} />

      <Field title="Dish name"><Text value={f.name} onChange={e => set({ name: e.target.value })} placeholder="Rib Eye" /></Field>

      <Field title="French" hint="The line printed beneath the name, on screen and on the carte.">
        <Text italic value={f.french || ''} onChange={e => set({ french: e.target.value })} placeholder="Entrecôte 300 g" />
      </Field>

      <Field title="Section">
        <select value={f.category_id || ''} onChange={e => set({ category_id: e.target.value })} style={inputStyle}>
          <option value="" disabled>Choose a section…</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>

      <Field title="Price" hint="Whole FCFA — no decimals.">
        <Text type="number" min="0" step={PRICE_STEP} value={f.price} onChange={e => set({ price: e.target.value })} />
      </Field>

      <TagPicker value={f.tags} onChange={tags => set({ tags })} />

      <Field title="Placeholder label" hint="Shown in the empty photo frame until a picture is uploaded.">
        <Text value={f.hint || ''} onChange={e => set({ hint: e.target.value })} placeholder="rib eye" />
      </Field>

      <Toggle on={f.available !== false} onChange={v => set({ available: v })}>
        {f.available !== false ? 'On the carte' : 'Sold out — hidden from guests'}
      </Toggle>
    </Editor>
  );
}

function SectionEditor({ row, dishCount, dishPhotos, onClose, run }) {
  const [f, setF] = useState(row);
  const set = patch => setF(v => ({ ...v, ...patch }));
  const photos = usePhotoCleanup(row, f, set);

  return (
    <Editor title={row.id ? 'Edit section' : 'New section'}
      onClose={() => { photos.dropped(); onClose(); }}
      canSave={Boolean(f.name?.trim())}
      onSave={async () => {
        const next = {
          ...f,
          id: f.id || newId(f.name),
          name: f.name.trim(),
          french: f.french?.trim() || null,
          note: f.note?.trim() || null,
          note_french: f.note_french?.trim() || null
        };
        await run('saveCategory', next);
        await photos.kept(next.image_url ?? null);
      }}
      onDelete={row.id
        ? async () => { await run('deleteCategory', row.id); await photos.purged(dishPhotos); }
        : null}>

      <ImagePicker value={f.image_url} onChange={photos.change} upload={adapter.uploadImage} slotLabel="section" />

      <Field title="Section name"><Text value={f.name} onChange={e => set({ name: e.target.value })} placeholder="From the Grill" /></Field>

      <Field title="French"><Text italic value={f.french || ''} onChange={e => set({ french: e.target.value })} placeholder="Grillades" /></Field>

      <Field title="Serving note" hint="A small line under the section name. Optional — leave it empty and nothing shows.">
        <Text value={f.note || ''} onChange={e => set({ note: e.target.value })} placeholder="Choose a side and a sauce" />
      </Field>

      <Field title="Serving note · French">
        <Text italic value={f.note_french || ''} onChange={e => set({ note_french: e.target.value })} placeholder="Au choix : un accompagnement et une sauce" />
      </Field>

      {row.id && dishCount > 0 && (
        <div style={{ font: '300 11.5px/1.55 var(--ui)', color: 'var(--ember-deep)', padding: '11px 12px', border: '1px solid var(--ember-soft)' }}>
          Deleting this section also deletes its {dishCount} {dishCount === 1 ? 'dish' : 'dishes'}.
        </div>
      )}

      <div style={{ font: '300 11.5px/1.55 var(--ui)', color: 'var(--ink-3)' }}>
        A section with no dishes is hidden from the carte until something is added to it.
      </div>
    </Editor>
  );
}

/* ----------------------------------------------------------------- lists */

function Row({ item, subtitle, meta, dim, onEdit, onMove, first, last }) {
  const arrow = enabled => ({
    width: 30, height: 21, borderRadius: 2, border: '1px solid var(--rule)',
    background: 'var(--panel)', color: enabled ? 'var(--ink-2)' : 'var(--rule-strong)',
    cursor: enabled ? 'pointer' : 'default', font: '400 9px/1 var(--ui)'
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderBottom: '1px solid var(--rule-soft)', opacity: dim ? .5 : 1 }}>
      <div style={{ width: 46, height: 46, flex: 'none', borderRadius: 2, overflow: 'hidden', border: '1px solid var(--rule)', background: 'var(--thumb)', position: 'relative' }}>
        {item.image_url
          ? <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ position: 'absolute', top: '50%', left: '50%', width: 9, height: 9, marginLeft: -5, marginTop: -5, border: '1px solid var(--brass-soft)', transform: 'rotate(45deg)' }} />}
      </div>

      <button type="button" onClick={onEdit}
        style={{ flex: 1, minWidth: 0, textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ font: '500 13.5px/1.3 var(--ui)', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
        {subtitle && <span style={{ font: '300 11.5px/1.3 var(--ui)', color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{subtitle}</span>}
        {meta && <span style={{ font: '500 11.5px/1 var(--ui)', color: 'var(--ember)' }}>{meta}</span>}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 'none' }}>
        <button type="button" aria-label="Move up" disabled={first} onClick={() => onMove(-1)} style={arrow(!first)}>▲</button>
        <button type="button" aria-label="Move down" disabled={last} onClick={() => onMove(1)} style={arrow(!last)}>▼</button>
      </div>
    </div>
  );
}

function Group({ title, count, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, padding: '0 2px' }}>
        <span className="display" style={{ fontSize: 20, letterSpacing: '.04em', color: 'var(--ink)' }}>{title}</span>
        <span style={label}>{count}</span>
      </div>
      <Card>{children}</Card>
    </div>
  );
}

/* ------------------------------------------------------------------ app */

const TABS = [
  { id: 'dishes', name: 'Dishes' },
  { id: 'sections', name: 'Sections' }
];

function Panel({ onOut }) {
  const { db, loading, error, run } = useCarte();
  const [tab, setTab] = useState('dishes');
  const [editing, setEditing] = useState(null);
  const [exporting, setExporting] = useState(false);

  const categories = useMemo(() => [...(db.categories ?? [])].sort(byOrder), [db]);
  const dishesIn = id => (db.dishes ?? []).filter(d => d.category_id === id).sort(byOrder);

  /* What the A4 export receives: the whole carte minus empty sections. */
  const printable = useMemo(() => toCarte(db).filter(c => c.items.length > 0), [db]);

  const totalDishes = (db.dishes ?? []).length;
  const soldOut = (db.dishes ?? []).filter(d => d.available === false).length;

  /* Renumbers the whole group so a move can never collide with a stale
     sort_order left over from an earlier ordering. */
  const reorder = (kind, list, from, dir) => {
    const to = from + dir;
    if (to < 0 || to >= list.length) return;
    const next = [...list];
    next.splice(to, 0, next.splice(from, 1)[0]);
    const changed = next
      .map((r, i) => ({ ...r, sort_order: i }))
      .filter(r => r.sort_order !== list.find(x => x.id === r.id).sort_order);
    return run('saveMany', kind, changed);
  };

  const add = () => setEditing(
    tab === 'dishes'
      ? {
        kind: 'dish',
        row: {
          name: '', french: '', price: '', image_url: null, hint: '', tags: [],
          available: true, category_id: categories[0]?.id ?? '', sort_order: 999
        }
      }
      : {
        kind: 'section',
        row: { name: '', french: '', note: '', note_french: '', image_url: null, sort_order: categories.length }
      }
  );

  if (loading) return <Middle>Loading the carte…</Middle>;
  if (error) return <Middle>{error}</Middle>;

  return (
    <>
      <div className="screen-only" style={{ minHeight: '100vh', background: 'var(--panel-2)' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', minHeight: '100vh', background: 'var(--paper)', paddingBottom: 110 }}>

          <header style={{ padding: '18px 20px 16px', background: 'var(--band)', color: 'var(--on-band)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="display" style={{ fontSize: 24, lineHeight: 1, letterSpacing: '.16em' }}>TANGO</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 5, height: 5, background: usingSupabase ? 'var(--brass-soft)' : 'var(--ember-soft)' }} />
                <span style={{ font: '400 9px/1 var(--ui)', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--on-band-3)' }}>
                  {usingSupabase ? 'Supabase' : 'Local browser storage'}
                </span>
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <a href="#/" style={{ padding: '9px 13px', borderRadius: 2, border: '1px solid var(--rule-on-band)', color: 'var(--on-band)', font: '400 10px/1 var(--ui)', letterSpacing: '.16em', textTransform: 'uppercase' }}>Carte</a>
              <button type="button" onClick={async () => { await adapter.signOut(); onOut(); }}
                style={{ padding: '9px 13px', borderRadius: 2, border: '1px solid var(--rule-on-band)', background: 'transparent', color: 'var(--on-band)', font: '400 10px/1 var(--ui)', letterSpacing: '.16em', textTransform: 'uppercase', cursor: 'pointer' }}>Sign out</button>
            </div>
          </header>

          <div style={{ padding: '13px 20px', borderBottom: '1px solid var(--rule)', display: 'flex', gap: 22 }}>
            {[
              ['Sections', categories.length],
              ['Dishes', totalDishes],
              ['Sold out', soldOut]
            ].map(([name, n]) => (
              <span key={name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ font: '500 17px/1 var(--ui)', color: 'var(--ink)' }}>{n}</span>
                <span style={label}>{name}</span>
              </span>
            ))}
          </div>

          <nav className="no-bar" style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', background: 'var(--paper-blur)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--rule)' }}>
            {TABS.map(t => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                style={{
                  flex: 'none', padding: '9px 15px', borderRadius: 2, cursor: 'pointer',
                  font: '400 11px/1 var(--ui)', letterSpacing: '.14em', textTransform: 'uppercase',
                  border: `1px solid ${tab === t.id ? 'var(--ember)' : 'var(--rule)'}`,
                  background: tab === t.id ? 'var(--ember)' : 'transparent',
                  color: tab === t.id ? 'var(--on-band)' : 'var(--ink-2)'
                }}>{t.name}</button>
            ))}
          </nav>

          <main style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 22 }}>
            {tab === 'dishes' && (
              categories.length === 0
                ? <Card><Empty>Create a section first — every dish belongs to one.</Empty></Card>
                : categories.map(c => {
                  const list = dishesIn(c.id);
                  return (
                    <Group key={c.id} title={c.name} count={`${list.length} ${list.length === 1 ? 'dish' : 'dishes'}`}>
                      {list.length === 0
                        ? <Empty>Nothing here yet.</Empty>
                        : list.map((d, i) => (
                          <Row key={d.id} item={d} subtitle={d.french} dim={d.available === false}
                            meta={`${money(d.price)}${d.available === false ? ' · sold out' : ''}`}
                            first={i === 0} last={i === list.length - 1}
                            onMove={dir => reorder('dishes', list, i, dir)}
                            onEdit={() => setEditing({ kind: 'dish', row: d })} />
                        ))}
                    </Group>
                  );
                })
            )}

            {tab === 'sections' && (
              <Group title="Sections" count={`${categories.length}`}>
                {categories.length === 0
                  ? <Empty>No sections yet.</Empty>
                  : categories.map((c, i) => (
                    <Row key={c.id} item={c} subtitle={c.french}
                      meta={`${dishesIn(c.id).length} dishes`}
                      first={i === 0} last={i === categories.length - 1}
                      onMove={d => reorder('categories', categories, i, d)}
                      onEdit={() => setEditing({ kind: 'section', row: c })} />
                  ))}
              </Group>
            )}
          </main>

          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: '100%', maxWidth: 520, pointerEvents: 'auto', padding: '12px 16px calc(18px + env(safe-area-inset-bottom))', background: 'var(--paper-blur)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--rule)', display: 'flex', gap: 10 }}>
              <Button tone="dark" style={{ flex: 1, padding: 14 }} onClick={add}
                disabled={tab === 'dishes' && categories.length === 0}>
                + Add {tab === 'dishes' ? 'dish' : 'section'}
              </Button>

              {/* Staff-only: printing the carte is a back-office job, and
                  keeping it here keeps PrintCarte inside this lazy chunk. */}
              <Button onClick={() => setExporting(true)} disabled={exporting || printable.length === 0}
                title="Export the whole carte as an A4 PDF"
                style={{ flex: 'none', padding: '14px 15px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9V2h12v7" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <path d="M6 14h12v8H6z" />
                </svg>
                {exporting ? '…' : 'A4'}
              </Button>
            </div>
          </div>
        </div>

        {editing?.kind === 'dish' && (
          <DishEditor row={editing.row} categories={categories} run={run} onClose={() => setEditing(null)} />
        )}
        {editing?.kind === 'section' && (
          <SectionEditor row={editing.row}
            dishCount={dishesIn(editing.row.id).length}
            dishPhotos={dishesIn(editing.row.id).map(d => d.image_url)}
            run={run} onClose={() => setEditing(null)} />
        )}
      </div>

      {exporting && <PrintCarte carte={printable} onDone={() => setExporting(false)} />}
    </>
  );
}

function Middle({ children }) {
  return (
    <div className="display" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center', fontSize: 17, fontStyle: 'italic', color: 'var(--ink-2)' }}>
      {children}
    </div>
  );
}

export default function StaffApp() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    adapter.getSession().then(s => setSession(s ?? null)).catch(() => setSession(null));
  }, []);

  if (session === undefined) return <Middle>…</Middle>;
  if (!session) return <Login onIn={setSession} />;
  return <Panel onOut={() => setSession(null)} />;
}
