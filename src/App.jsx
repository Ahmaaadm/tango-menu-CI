import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCarte, toCarte, searchCarte } from './lib/store.js';
import Masthead from './components/Masthead.jsx';
import SectionNav from './components/SectionNav.jsx';
import DishLine from './components/DishLine.jsx';
import OrderPanel from './components/OrderPanel.jsx';
import { money } from './lib/money.js';
import { TAGS } from './lib/tags.js';
import { VENUE_LINES } from './lib/venue.js';

/* Distance from the top at which a section counts as "the one being read".
   It clears the sticky nav — see the scroll-margin-top rule in index.css,
   which has to stay in step with this. */
const SPY_OFFSET = 130;

function Shell({ children }) {
  return (
    <div className="screen-only" style={{
      width: '100%', maxWidth: 'var(--column)', margin: '0 auto', minHeight: '100vh',
      background: 'var(--paper)', position: 'relative',
      paddingBottom: 'calc(96px + env(safe-area-inset-bottom))',
      boxShadow: '0 0 50px var(--shade)'
    }}>
      {children}
    </div>
  );
}

function Interlude({ title, detail, spinner }) {
  return (
    <div style={{ padding: '76px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
      {spinner
        ? <span style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--rule)', borderTopColor: 'var(--ember)', animation: 'tgSpin .9s linear infinite' }} />
        : <span style={{ width: 12, height: 12, border: '1px solid var(--brass)', transform: 'rotate(45deg)' }} />}
      <p className="display" style={{ margin: 0, fontSize: 20, color: 'var(--ink-2)' }}>{title}</p>
      {detail && <p style={{ margin: 0, font: '300 12.5px/1.55 var(--ui)', color: 'var(--ink-3)' }}>{detail}</p>}
    </div>
  );
}

function SectionHead({ category, index }) {
  return (
    <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--ink)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ flex: 'none', font: '400 10px/1 var(--ui)', letterSpacing: '.2em', color: 'var(--brass)' }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="display" style={{ margin: 0, fontSize: 26, lineHeight: 1.05, letterSpacing: '.04em', color: 'var(--ink)' }}>
          {category.name}
        </h2>
        <span style={{ flex: 1 }} />
        <span style={{ flex: 'none', font: '400 9px/1 var(--ui)', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          {category.items.length} {category.items.length === 1 ? 'dish' : 'dishes'}
        </span>
      </div>

      {category.french && (
        <p style={{ margin: '6px 0 0 26px', font: '300 italic 13px/1.3 var(--ui)', color: 'var(--ink-2)' }}>
          {category.french}
        </p>
      )}

      {/* Both serving notes are optional and independent: a section can carry
          one, the other, both, or neither, and neither leaves a gap. */}
      {(category.note || category.note_french) && (
        <div style={{ margin: '9px 0 0 26px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {category.note && <p style={{ margin: 0, font: '300 11.5px/1.45 var(--ui)', color: 'var(--ink-3)' }}>{category.note}</p>}
          {category.note_french && <p style={{ margin: 0, font: '300 italic 11.5px/1.45 var(--ui)', color: 'var(--ink-3)' }}>{category.note_french}</p>}
        </div>
      )}
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '7px 16px' }}>
      {Object.entries(TAGS).map(([k, t]) => (
        <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, font: '300 10.5px/1 var(--ui)', color: 'var(--ink-3)' }}>
          <b style={{ font: '400 10px/1 var(--ui)', color: 'var(--brass)' }}>{t.mark}</b>
          {t.label}
        </span>
      ))}
    </div>
  );
}

export default function App() {
  const { db, loading, error } = useCarte();
  const [order, setOrder] = useState({});
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);

  const carte = useMemo(() => toCarte(db).filter(c => c.items.length > 0), [db]);
  const results = useMemo(() => searchCarte(carte, query), [carte, query]);

  const bump = useCallback((id, delta) => setOrder(o => {
    const next = { ...o };
    const n = (next[id] || 0) + delta;
    if (n <= 0) delete next[id]; else next[id] = n;
    return next;
  }), []);

  /* Which section is being read. A plain scroll listener rather than an
     IntersectionObserver: sections are taller than the viewport, so "the last
     heading scrolled past" is the answer, which observers make awkward. */
  useEffect(() => {
    if (query || !carte.length) return;

    const spy = () => {
      let current = carte[0].id;
      for (const c of carte) {
        const el = document.getElementById(`sec-${c.id}`);
        if (el && el.getBoundingClientRect().top <= SPY_OFFSET) current = c.id;
      }
      setActive(current);
    };

    spy();
    window.addEventListener('scroll', spy, { passive: true });
    window.addEventListener('resize', spy);
    return () => {
      window.removeEventListener('scroll', spy);
      window.removeEventListener('resize', spy);
    };
  }, [carte, query]);

  const jump = id =>
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* The order is a plain { dishId: qty } map, so a dish that has since been
     removed from the carte simply stops resolving and drops out of the total. */
  const allDishes = useMemo(() => carte.flatMap(c => c.items), [carte]);
  const lines = allDishes.filter(d => order[d.id]).map(d => ({ ...d, qty: order[d.id] }));
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);

  if (loading) return <Shell><Masthead /><Interlude spinner title="Laying the table…" /></Shell>;
  if (error) return <Shell><Masthead /><Interlude title="The carte could not be loaded" detail={error} /></Shell>;

  return (
    <Shell>
      <Masthead />

      <div style={{ padding: '22px 22px 16px', textAlign: 'center' }}>
        <p style={{ margin: 0, font: '300 12px/1.6 var(--ui)', letterSpacing: '.1em', color: 'var(--ink-2)' }}>
          Browse the carte, build your order, send it to the kitchen on WhatsApp.
        </p>
      </div>

      <SectionNav sections={carte} active={active} onJump={jump} query={query} onQuery={setQuery} />

      {query ? (
        <section style={{ padding: '20px 22px 0' }}>
          <div style={{ paddingBottom: 10, borderBottom: '1px solid var(--ink)' }}>
            <h2 className="display" style={{ margin: 0, fontSize: 22, letterSpacing: '.04em' }}>
              {results.length === 0 ? 'No match' : `${results.length} ${results.length === 1 ? 'dish' : 'dishes'}`}
            </h2>
          </div>
          {results.length === 0
            ? <Interlude title="Nothing on the carte matches that" detail="Try a shorter word, or clear the search to browse." />
            : results.map(d => (
              <DishLine key={d.id} dish={d} qty={order[d.id] || 0} onBump={bump} showSection />
            ))}
        </section>
      ) : (
        carte.map((c, i) => (
          <section key={c.id} id={`sec-${c.id}`} data-section style={{ padding: '30px 22px 0' }}>
            <SectionHead category={c} index={i} />
            {c.items.map(d => <DishLine key={d.id} dish={d} qty={order[d.id] || 0} onBump={bump} />)}
          </section>
        ))
      )}

      {carte.length === 0 && (
        <Interlude title="The carte is empty" detail="Add a section and a few dishes from the staff panel." />
      )}

      <footer style={{ padding: '38px 22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 168 }}>
          <span style={{ flex: 1, height: 1, background: 'var(--brass-soft)' }} />
          <span style={{ width: 6, height: 6, border: '1px solid var(--brass)', transform: 'rotate(45deg)' }} />
          <span style={{ flex: 1, height: 1, background: 'var(--brass-soft)' }} />
        </div>

        <Legend />

        {VENUE_LINES.length > 0 && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {VENUE_LINES.map(line => (
              <span key={line} style={{ font: '300 12px/1.5 var(--ui)', color: 'var(--ink-2)' }}>{line}</span>
            ))}
          </div>
        )}

        <p className="display" style={{ margin: 0, fontSize: 15, fontStyle: 'italic', color: 'var(--ink-3)', textAlign: 'center' }}>
          All prices in FCFA · the kitchen adapts to the market
        </p>

        <a href="#/staff" style={{ font: '400 9.5px/1 var(--ui)', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Staff</a>
      </footer>

      {/* The basket only exists once something is in it — an empty bar taking
          up the bottom of every screen would earn nothing. */}
      {count > 0 && !panelOpen && (
        <div style={{
          position: 'fixed', bottom: 'calc(18px + env(safe-area-inset-bottom))',
          left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'center',
          padding: '0 22px', pointerEvents: 'none'
        }}>
          <button type="button" onClick={() => setPanelOpen(true)}
            style={{
              width: '100%', maxWidth: 'calc(var(--column) - 44px)', pointerEvents: 'auto',
              display: 'flex', alignItems: 'center', gap: 14, padding: '13px 15px 13px 18px',
              borderRadius: 2, border: 'none', cursor: 'pointer', background: 'var(--band)',
              color: 'var(--on-band)', boxShadow: '0 12px 30px var(--shade-deep)',
              animation: 'tgRise .24s ease-out'
            }}>
            <span style={{
              width: 26, height: 26, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--ember)', font: '600 12px/1 var(--ui)'
            }}>{count}</span>
            <span style={{ flex: 1, textAlign: 'left', font: '500 15px/1 var(--ui)' }}>{money(total)}</span>
            <span style={{ font: '400 11px/1 var(--ui)', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--on-band-2)' }}>
              View order →
            </span>
          </button>
        </div>
      )}

      {panelOpen && (
        <OrderPanel lines={lines} total={total} count={count}
          onBump={bump} onClose={() => setPanelOpen(false)}
          onClear={() => { setOrder({}); setPanelOpen(false); }} />
      )}
    </Shell>
  );
}
