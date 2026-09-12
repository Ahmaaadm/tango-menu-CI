import React, { useEffect, useState } from 'react';
import { money } from '../lib/money.js';
import { whatsappNumber, whatsappUrl } from '../lib/whatsapp.js';

function WhatsAppMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flex: 'none' }}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23z" />
      <path d="M16.9 14.2c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.72-1.34-1.6-1.5-1.87-.16-.27-.02-.42.12-.55.12-.12.27-.32.4-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.44-.46-.61-.47h-.52c-.18 0-.47.07-.72.34-.25.27-.95.92-.95 2.25s.97 2.61 1.11 2.79c.14.18 1.91 2.92 4.63 4.09.65.28 1.15.45 1.54.58.65.2 1.24.18 1.7.11.52-.08 1.6-.65 1.83-1.29.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.31z" />
    </svg>
  );
}

/* Full-height panel that comes in from the right. Deliberately a whole screen
   rather than a half-height sheet: an order of a dozen lines needs the room,
   and the guest is finished browsing by the time they open it. */
export default function OrderPanel({ lines, total, count, onClose, onBump, onClear }) {
  const [guest, setGuest] = useState('');
  const href = whatsappUrl(lines, total, guest);

  /* Escape closes it, and the carte behind must not scroll while it is up. */
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const nudge = {
    width: 30, height: 30, flex: 'none', borderRadius: 2, cursor: 'pointer',
    border: '1px solid var(--rule)', background: 'var(--panel)', color: 'var(--ink)',
    font: '400 15px/1 var(--ui)'
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Your order"
      style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--veil)', animation: 'tgFade .2s ease-out' }} />

      <section style={{
        position: 'relative', width: '100%', maxWidth: 'var(--column)', height: '100%',
        background: 'var(--paper)', display: 'flex', flexDirection: 'column',
        animation: 'tgSlide .3s cubic-bezier(.22,.85,.25,1)', boxShadow: '-10px 0 40px var(--shade-deep)'
      }}>
        <header style={{
          padding: '20px 22px 18px', background: 'var(--band)', color: 'var(--on-band)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span className="display" style={{ fontSize: 25, lineHeight: 1, letterSpacing: '.08em' }}>Your Order</span>
            <span style={{ font: '400 10px/1 var(--ui)', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--on-band-3)' }}>
              {count === 0 ? 'Nothing yet' : `${count} ${count === 1 ? 'item' : 'items'}`}
            </span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ width: 34, height: 34, borderRadius: 2, border: '1px solid var(--rule-on-band)', background: 'transparent', color: 'var(--on-band)', font: '400 17px/1 var(--ui)', cursor: 'pointer' }}>×</button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 22px' }}>
          {lines.length === 0 ? (
            <div style={{ padding: '70px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <span style={{ width: 14, height: 14, border: '1px solid var(--brass)', transform: 'rotate(45deg)' }} />
              <p className="display" style={{ margin: 0, fontSize: 19, color: 'var(--ink-2)' }}>Nothing selected yet</p>
              <p style={{ margin: 0, font: '300 12.5px/1.5 var(--ui)', color: 'var(--ink-3)', maxWidth: 240 }}>
                Press <b style={{ fontWeight: 500, color: 'var(--ember)' }}>Add</b> on any dish and it collects here.
              </p>
            </div>
          ) : lines.map(l => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 0', borderBottom: '1px solid var(--rule-soft)' }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ font: '500 14px/1.3 var(--ui)', color: 'var(--ink)' }}>{l.name}</span>
                <span style={{ font: '300 11.5px/1 var(--ui)', color: 'var(--ink-3)' }}>{money(l.price)} each</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 'none' }}>
                <button type="button" style={nudge} onClick={() => onBump(l.id, -1)} aria-label={`One less ${l.name}`}>−</button>
                <span style={{ minWidth: 16, textAlign: 'center', font: '600 13px/1 var(--ui)' }}>{l.qty}</span>
                <button type="button" style={nudge} onClick={() => onBump(l.id, 1)} aria-label={`One more ${l.name}`}>+</button>
              </div>

              <span style={{ width: 92, textAlign: 'right', flex: 'none', font: '500 13px/1.2 var(--ui)', color: 'var(--ember)' }}>
                {money(l.price * l.qty)}
              </span>
            </div>
          ))}
        </div>

        <footer style={{
          padding: '18px 22px calc(22px + env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--rule)', background: 'var(--panel)',
          display: 'flex', flexDirection: 'column', gap: 13
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ font: '400 10.5px/1 var(--ui)', letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Total</span>
            <span style={{ font: '600 23px/1 var(--ui)', color: 'var(--ink)' }}>{money(total)}</span>
          </div>

          {lines.length > 0 && whatsappNumber && (
            <>
              <input value={guest} onChange={e => setGuest(e.target.value)} maxLength={60}
                placeholder="Your name or table number (optional)"
                style={{
                  width: '100%', padding: '12px 13px', borderRadius: 2,
                  border: '1px solid var(--rule)', background: 'var(--paper)',
                  color: 'var(--ink)', font: '400 13px/1.2 var(--ui)'
                }} />

              <a href={href} target="_blank" rel="noopener noreferrer"
                style={{
                  width: '100%', padding: 15, borderRadius: 2, background: '#1f9c4d', color: '#fff',
                  font: '500 13px/1 var(--ui)', letterSpacing: '.12em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9
                }}>
                <WhatsAppMark />
                Send on WhatsApp
              </a>

              <p style={{ margin: 0, font: '300 11px/1.5 var(--ui)', color: 'var(--ink-3)', textAlign: 'center' }}>
                WhatsApp opens with the order already written — you still press send. Nothing is paid here.
              </p>
            </>
          )}

          {lines.length > 0 && (
            <button type="button" onClick={onClear}
              style={{
                width: '100%', padding: 12, borderRadius: 2, border: '1px solid var(--rule)',
                background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer',
                font: '400 11px/1 var(--ui)', letterSpacing: '.16em', textTransform: 'uppercase'
              }}>Clear the order</button>
          )}
        </footer>
      </section>
    </div>
  );
}
