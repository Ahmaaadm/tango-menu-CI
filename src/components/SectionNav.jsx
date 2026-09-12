import React, { useEffect, useRef } from 'react';

function Glass() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" />
    </svg>
  );
}

/* Search plus the section rail, in one sticky block so a guest can always
   reach both. The rail jumps to a section rather than filtering the carte —
   a full restaurant menu is meant to be read past, not narrowed down. That is
   what the search field is for, and while it has text the rail steps aside. */
export default function SectionNav({ sections, active, onJump, query, onQuery }) {
  const railRef = useRef(null);

  /* Keep the highlighted chip on screen as the guest scrolls the carte. */
  useEffect(() => {
    const chip = railRef.current?.querySelector(`[data-chip="${active}"]`);
    chip?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [active]);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'var(--paper-blur)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--rule)'
    }}>
      <div style={{ padding: '11px 20px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9, padding: '0 12px',
          border: '1px solid var(--rule)', borderRadius: 2, background: 'var(--panel)',
          color: 'var(--ink-3)'
        }}>
          <Glass />
          <input value={query} onChange={e => onQuery(e.target.value)}
            type="search" placeholder="Search the carte…" aria-label="Search the carte"
            style={{
              flex: 1, minWidth: 0, padding: '10px 0', border: 'none', outline: 'none',
              background: 'transparent', color: 'var(--ink)', font: '400 13.5px/1.2 var(--ui)'
            }} />
          {query && (
            <button type="button" onClick={() => onQuery('')} aria-label="Clear search"
              style={{ border: 'none', background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer', font: '400 16px/1 var(--ui)', padding: 0 }}>×</button>
          )}
        </div>
      </div>

      {!query && (
        <div ref={railRef} className="no-bar" style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '0 20px 11px' }}>
          {sections.map(s => {
            const on = s.id === active;
            return (
              <button key={s.id} type="button" data-chip={s.id} onClick={() => onJump(s.id)}
                style={{
                  flex: 'none', padding: '8px 13px', borderRadius: 2, cursor: 'pointer',
                  border: `1px solid ${on ? 'var(--ember)' : 'var(--rule)'}`,
                  background: on ? 'var(--ember)' : 'transparent',
                  color: on ? 'var(--on-band)' : 'var(--ink-2)',
                  font: '400 11px/1 var(--ui)', letterSpacing: '.14em', textTransform: 'uppercase',
                  transition: 'all .16s ease', whiteSpace: 'nowrap'
                }}>{s.name}</button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
