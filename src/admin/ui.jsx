import React, { useRef, useState } from 'react';
import { TAGS, TAG_KEYS, readTags } from '../lib/tags.js';

/* Form controls for the staff panel. They read the same role tokens as the
   guest carte (src/index.css), so the panel repaints with the restaurant —
   there are no colour literals in here. */

export const label = {
  font: '400 9.5px/1 var(--ui)', letterSpacing: '.2em',
  textTransform: 'uppercase', color: 'var(--ink-3)'
};

export const inputStyle = {
  width: '100%', padding: '11px 12px', borderRadius: 2,
  border: '1px solid var(--rule)', background: 'var(--panel)',
  color: 'var(--ink)', font: '400 14px/1.2 var(--ui)'
};

export function Field({ title, hint, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={label}>{title}</span>
      {children}
      {hint && <span style={{ font: '300 11px/1.45 var(--ui)', color: 'var(--ink-3)' }}>{hint}</span>}
    </label>
  );
}

export function Text({ italic, ...props }) {
  return <input {...props} style={{ ...inputStyle, ...(italic ? { fontStyle: 'italic' } : null) }} />;
}

export function Button({ tone = 'ghost', children, ...props }) {
  const tones = {
    primary: { background: 'var(--ember)', color: 'var(--on-band)', border: '1px solid var(--ember)' },
    dark: { background: 'var(--band)', color: 'var(--on-band)', border: '1px solid var(--band)' },
    ghost: { background: 'var(--panel)', color: 'var(--ink-2)', border: '1px solid var(--rule)' },
    danger: { background: 'var(--panel)', color: 'var(--ember-deep)', border: '1px solid var(--ember-soft)' }
  };

  return (
    <button type="button" {...props}
      style={{
        padding: '11px 16px', borderRadius: 2, cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? .45 : 1, font: '500 11.5px/1 var(--ui)',
        letterSpacing: '.12em', textTransform: 'uppercase', transition: 'opacity .16s ease',
        ...tones[tone], ...props.style
      }}>
      {children}
    </button>
  );
}

export function Toggle({ on, onChange, children }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      style={{
        display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 2,
        border: `1px solid ${on ? 'var(--ember)' : 'var(--rule)'}`, background: 'var(--panel)',
        cursor: 'pointer', font: '400 12.5px/1 var(--ui)', color: on ? 'var(--ember)' : 'var(--ink-3)'
      }}>
      <span style={{
        width: 34, height: 19, flex: 'none', position: 'relative', borderRadius: 2,
        background: on ? 'var(--ember)' : 'var(--rule)', transition: 'background .18s ease'
      }}>
        <span style={{
          position: 'absolute', top: 2, left: on ? 17 : 2, width: 15, height: 15,
          borderRadius: 1, background: 'var(--panel)', transition: 'left .18s ease'
        }} />
      </span>
      {children}
    </button>
  );
}

/* The tag vocabulary is closed (src/lib/tags.js), so this is a fixed set of
   toggles rather than a free-text field — which is the whole point of having
   a vocabulary at all. */
export function TagPicker({ value, onChange }) {
  const on = readTags({ tags: value });

  const flip = key => onChange(on.includes(key) ? on.filter(k => k !== key) : [...on, key]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={label}>Tags</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {TAG_KEYS.map(k => {
          const picked = on.includes(k);
          return (
            <button key={k} type="button" onClick={() => flip(k)} aria-pressed={picked}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 11px', borderRadius: 2,
                cursor: 'pointer', border: `1px solid ${picked ? 'var(--ember)' : 'var(--rule)'}`,
                background: 'var(--panel)', color: picked ? 'var(--ember)' : 'var(--ink-3)',
                font: '400 11px/1 var(--ui)', letterSpacing: '.1em', textTransform: 'uppercase'
              }}>
              <span style={{ color: picked ? 'var(--ember)' : 'var(--brass)' }}>{TAGS[k].mark}</span>
              {TAGS[k].label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Picks a photo, hands the raw File to the adapter (which resizes and stores
   it) and reports back the URL. It never deletes anything — see
   usePhotoCleanup in StaffApp.jsx for why that has to happen on save. */
export function ImagePicker({ value, onChange, upload, slotLabel }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pick = async e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setErr('');
    try {
      onChange(await upload(file));
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={label}>Photo</span>
      <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
        <div style={{
          position: 'relative', width: 66, height: 66, flex: 'none', borderRadius: 2,
          overflow: 'hidden', border: '1px solid var(--rule)', background: 'var(--thumb)'
        }}>
          {value ? (
            <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 4 }}>
              <span style={{ width: 10, height: 10, border: '1px solid var(--brass-soft)', transform: 'rotate(45deg)' }} />
              <span style={{ font: '400 6.5px/1.2 var(--ui)', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--thumb-ink)', textAlign: 'center' }}>
                {slotLabel || 'no photo'}
              </span>
            </div>
          )}
          {busy && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,253,249,.78)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--rule)', borderTopColor: 'var(--ember)', animation: 'tgSpin .9s linear infinite' }} />
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => ref.current?.click()} disabled={busy} style={{ flex: 1, padding: '9px 12px' }}>
              {busy ? 'Uploading…' : value ? 'Replace' : 'Choose photo'}
            </Button>
            {value && <Button tone="danger" onClick={() => onChange(null)} style={{ padding: '9px 12px' }}>Remove</Button>}
          </div>
          <span style={{ font: '300 11px/1.45 var(--ui)', color: 'var(--ink-3)' }}>Resized and compressed before it is stored.</span>
        </div>
      </div>
      {err && <span style={{ font: '400 11.5px/1.45 var(--ui)', color: 'var(--ember-deep)' }}>{err}</span>}
      <input ref={ref} type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} />
    </div>
  );
}

export function Card({ children, style }) {
  return (
    <div style={{ background: 'var(--panel)', borderRadius: 2, border: '1px solid var(--rule)', ...style }}>
      {children}
    </div>
  );
}

export function Empty({ children }) {
  return (
    <div className="display" style={{ padding: '34px 20px', textAlign: 'center', fontSize: 16, fontStyle: 'italic', color: 'var(--ink-3)' }}>
      {children}
    </div>
  );
}
