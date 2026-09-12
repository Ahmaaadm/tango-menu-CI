import React from 'react';

/* Every photo slot in the carte, in one place. Until a real picture is
   uploaded the frame still occupies its space and says what belongs there —
   a missing photo must never reflow the line it sits on. */
export default function Photo({ src, label, size = 76, radius = 4, ring = 'var(--rule)' }) {
  return (
    <div style={{
      position: 'relative', flex: 'none', width: size, height: size,
      borderRadius: radius, overflow: 'hidden',
      background: 'var(--thumb)', border: `1px solid ${ring}`
    }}>
      {src ? (
        <img src={src} alt="" loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: size > 60 ? 5 : 0, padding: 4
        }}>
          <span style={{
            width: size > 60 ? 11 : 8, height: size > 60 ? 11 : 8,
            border: '1px solid var(--brass-soft)', transform: 'rotate(45deg)'
          }} />
          {size > 60 && (
            <span style={{
              font: '400 7px/1.2 var(--ui)', letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'var(--thumb-ink)', textAlign: 'center', overflow: 'hidden'
            }}>{label}</span>
          )}
        </div>
      )}
    </div>
  );
}
