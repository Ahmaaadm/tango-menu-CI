import React, { useState } from 'react';
import { VENUE } from '../lib/venue.js';

/* The restaurant's banner lives at public/header.jpg — a plain file, not an
   import, so it can be replaced without a rebuild. If it is missing the band
   falls back to a brass hatch and the masthead still reads correctly.

   The plaque overlaps the bottom of the band on purpose, and the two taglines
   are split so that nothing is said twice: the roundel in the artwork carries
   `kind` (Brasserie · Cuisine & Table), so the plaque carries `tagline`
   (Charcoal Grill & Kitchen) — which is the line the overlap covers. In the
   no-photo fallback there is no roundel, so `kind` moves up to the eyebrow.

   OVERLAP is tuned to this artwork: it hides the bottom strip of the image.
   Swapping in a picture with something important down there means raising the
   band or reducing this. */
const BAND = 248;
const OVERLAP = 40;

export default function Masthead() {
  const [banner, setBanner] = useState(true);

  return (
    <header>
      <div style={{ position: 'relative', height: BAND, background: 'var(--band)', overflow: 'hidden' }}>
        {banner ? (
          /* Cover, not contain: the artwork is 2.5:1 and a phone column is
             not. Filling the band keeps the roundel — and the wording inside
             it — readable; what gets cropped is the empty margin either side
             of the centred logo. */
          <img src="/header.jpg" onError={() => setBanner(false)}
            alt={`${VENUE.name} — ${VENUE.kind}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
        ) : (
          <>
            <div style={{
              position: 'absolute', inset: 0, opacity: .5,
              background: 'repeating-linear-gradient(58deg,rgba(217,193,147,.5) 0 1px,transparent 1px 15px)'
            }} />
            <div style={{
              position: 'absolute', top: 24, left: 0, right: 0, textAlign: 'center',
              font: '400 9.5px/1 var(--ui)', letterSpacing: '.3em', textTransform: 'uppercase',
              color: 'var(--on-band-2)'
            }}>{VENUE.kind}</div>
          </>
        )}
      </div>

      <div style={{
        position: 'relative', margin: `-${OVERLAP}px 22px 0`, padding: '24px 18px 20px',
        background: 'var(--panel)', border: '1px solid var(--brass-soft)',
        boxShadow: '0 14px 34px var(--shade-lift)', textAlign: 'center'
      }}>
        <h1 className="display" style={{
          margin: 0, fontSize: 46, lineHeight: .92, letterSpacing: '.24em',
          paddingLeft: '.24em', color: 'var(--ink)'
        }}>TANGO</h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '15px auto 12px', width: 168 }}>
          <span style={{ flex: 1, height: 1, background: 'var(--brass-soft)' }} />
          <span style={{ width: 6, height: 6, border: '1px solid var(--brass)', transform: 'rotate(45deg)' }} />
          <span style={{ flex: 1, height: 1, background: 'var(--brass-soft)' }} />
        </div>

        <div style={{
          font: '400 9.5px/1.6 var(--ui)', letterSpacing: '.3em', textTransform: 'uppercase',
          color: 'var(--ink-2)'
        }}>{VENUE.tagline}</div>
      </div>
    </header>
  );
}
