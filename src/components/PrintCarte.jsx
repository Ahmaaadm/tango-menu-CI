import React, { useEffect, useRef, useState } from 'react';
import { money } from '../lib/money.js';
import { TAGS, readTags } from '../lib/tags.js';
import { VENUE, VENUE_LINES } from '../lib/venue.js';

/* The A4 carte. A separate document, not the phone layout reflowed: one dish
   per line with a dotted leader to the price, the way a printed menu reads.

   No dish photographs on purpose — a full carte is forty-odd dishes, and a
   thumbnail beside each would turn three sheets into eight. The banner at the
   top is the only image.

   Chrome prints with "Background graphics" off by default, which drops every
   background and gradient, so nothing here depends on one: the structure is
   rules, borders and that single <img>. */

const pad2 = n => String(n).padStart(2, '0');

function Line({ dish }) {
  const marks = readTags(dish).map(k => TAGS[k].mark).join(' ');

  return (
    <article className="ct-dish">
      <div className="ct-line">
        <h3>{dish.name}</h3>
        {marks && <span className="ct-mark">{marks}</span>}
        <span className="ct-leader" />
        <span className="ct-price">{money(dish.price)}</span>
      </div>
      {dish.french && <p className="ct-fr">{dish.french}</p>}
    </article>
  );
}

function Section({ category, index }) {
  return (
    <section className="ct-section">
      <header className="ct-sec-head">
        <span className="ct-num">{pad2(index + 1)}</span>
        <h2>{category.name}</h2>
        {category.french && <span className="ct-sec-fr">{category.french}</span>}
        <span className="ct-count">
          {category.items.length} {category.items.length === 1 ? 'dish' : 'dishes'}
        </span>
      </header>

      {(category.note || category.note_french) && (
        <p className="ct-note">
          {category.note}
          {category.note && category.note_french ? ' · ' : ''}
          {category.note_french && <em>{category.note_french}</em>}
        </p>
      )}

      <div className="ct-items">
        {category.items.map(d => <Line key={d.id} dish={d} />)}
      </div>
    </section>
  );
}

export default function PrintCarte({ carte, onDone }) {
  const ref = useRef(null);
  /* No public/header.jpg means no banner at all — a broken-image box would
     print as an empty ruled rectangle at the top of the carte. */
  const [banner, setBanner] = useState(true);

  /* The banner has to be decoded before the dialog opens or it prints blank. */
  useEffect(() => {
    let cancelled = false;
    const node = ref.current;
    if (!node) return;

    const images = [...node.querySelectorAll('img')];
    const ready = images.map(img =>
      img.complete ? Promise.resolve() : new Promise(res => { img.onload = img.onerror = res; }));

    const done = () => { if (!cancelled) onDone(); };

    Promise.all(ready).then(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        window.addEventListener('afterprint', done, { once: true });
        window.print();
        /* Some Linux builds never fire afterprint, which would strand the
           document mounted and the button stuck on "…". */
        setTimeout(done, 1200);
      });
    });

    return () => { cancelled = true; window.removeEventListener('afterprint', done); };
  }, [onDone]);

  return (
    <div className="carte" ref={ref}>
      <header className="ct-head">
        {/* Same rule as the screen masthead: the artwork already carries the
            name and both taglines, so it is not repeated underneath. Without
            it, the masthead is typeset instead. */}
        {banner && (
          <div className="ct-banner">
            <img src="/header.jpg" alt={`${VENUE.name} — ${VENUE.kind}`}
              onError={() => setBanner(false)} />
          </div>
        )}
        <h1 className="ct-word">TANGO</h1>
        <div className="ct-rule"><span /><i /><span /></div>
        {/* The contained banner shows the artwork's own taglines in full, so
            typesetting them again underneath would only repeat it. Without a
            banner there is nothing to repeat, and they are the masthead. */}
        {!banner && <p className="ct-tagline">{VENUE.kind} · {VENUE.tagline}</p>}
        {VENUE_LINES.length > 0 && <p className="ct-venue">{VENUE_LINES.join(' · ')}</p>}
      </header>

      {carte.map((c, i) => <Section key={c.id} category={c} index={i} />)}

      <footer className="ct-foot">
        <div className="ct-legend">
          {Object.entries(TAGS).map(([k, t]) => (
            <span key={k}><b>{t.mark}</b> {t.label} · {t.french}</span>
          ))}
        </div>
        <p className="ct-endnote">All prices in FCFA · the kitchen adapts to the market</p>
      </footer>
    </div>
  );
}
