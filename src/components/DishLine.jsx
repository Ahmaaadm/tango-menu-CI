import React from 'react';
import Photo from './Photo.jsx';
import { TagMarks } from './TagMarks.jsx';
import { money } from '../lib/money.js';

/* Squared geometry throughout — 2px corners, hairline borders. The stepper is
   the only control on the line: the row itself is not tappable, so scrolling
   a long carte on a phone can never add a dish by accident. */
const box = {
  border: '1px solid var(--ember)', borderRadius: 2, background: 'transparent',
  color: 'var(--ember)', cursor: 'pointer', font: '500 12px/1 var(--ui)',
  letterSpacing: '.12em', textTransform: 'uppercase', padding: '9px 15px',
  transition: 'background .16s ease, color .16s ease'
};

function Stepper({ qty, onBump, name }) {
  if (qty === 0) {
    return (
      <button type="button" style={box} onClick={() => onBump(1)} aria-label={`Add ${name}`}>Add</button>
    );
  }

  const nudge = {
    width: 32, height: 32, flex: 'none', border: 'none', background: 'transparent',
    color: 'var(--on-band)', cursor: 'pointer', font: '400 16px/1 var(--ui)'
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', borderRadius: 2,
      background: 'var(--ember)', animation: 'tgPop .2s ease-out'
    }}>
      <button type="button" style={nudge} onClick={() => onBump(-1)}
        aria-label={qty === 1 ? `Remove ${name}` : `One less ${name}`}>−</button>
      <span aria-live="polite" style={{
        minWidth: 18, textAlign: 'center', font: '600 13px/1 var(--ui)', color: 'var(--on-band)'
      }}>{qty}</span>
      <button type="button" style={nudge} onClick={() => onBump(1)} aria-label={`One more ${name}`}>+</button>
    </div>
  );
}

export default function DishLine({ dish, qty, onBump, showSection }) {
  return (
    <article style={{
      display: 'flex', gap: 14, alignItems: 'flex-start',
      padding: '16px 0', borderBottom: '1px solid var(--rule-soft)'
    }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* Name, dotted leader, price — the carte convention, on screen as
            well as on paper, so the printed sheet is recognisably this menu. */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <h3 style={{ margin: 0, font: '500 15.5px/1.3 var(--ui)', color: 'var(--ink)' }}>{dish.name}</h3>
          <TagMarks row={dish} />
          <span style={{ flex: 1, height: 0, borderBottom: '1px dotted var(--rule-strong)', transform: 'translateY(-4px)' }} />
          <span style={{ flex: 'none', font: '500 14px/1 var(--ui)', color: 'var(--ember)' }}>{money(dish.price)}</span>
        </div>

        {dish.french && (
          <p style={{ margin: 0, font: '300 12.5px/1.45 var(--ui)', color: 'var(--ink-2)' }}>{dish.french}</p>
        )}

        {showSection && (
          <span style={{
            font: '400 9px/1 var(--ui)', letterSpacing: '.16em', textTransform: 'uppercase',
            color: 'var(--ink-3)'
          }}>{dish.section}</span>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 3 }}>
          <Stepper qty={qty} name={dish.name} onBump={d => onBump(dish.id, d)} />
        </div>
      </div>

      <Photo src={dish.image_url} label={dish.hint || dish.name} size={78} />
    </article>
  );
}
