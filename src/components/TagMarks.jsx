import React from 'react';
import { TAGS, readTags } from '../lib/tags.js';

/* The brass glyph row beside a dish name. Deliberately the same notation the
   printed carte uses, explained once by the legend in the footer — the
   restaurant convention, and the only thing that fits on a line already
   carrying a name, a leader and a price. The words live in the title and the
   aria-label, so nothing depends on reading the glyph. */
export function TagMarks({ row }) {
  const keys = readTags(row);
  if (!keys.length) return null;

  return (
    <span style={{ display: 'inline-flex', gap: 5, flex: 'none', paddingLeft: 2 }}>
      {keys.map(k => (
        <span key={k} title={TAGS[k].label} aria-label={TAGS[k].label} role="img"
          style={{ font: '400 9px/1 var(--ui)', color: 'var(--brass)' }}>{TAGS[k].mark}</span>
      ))}
    </span>
  );
}
