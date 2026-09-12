/* Hands a finished selection to the restaurant's WhatsApp.
   There is no checkout anywhere in this app — this composes a message and
   opens WhatsApp. The guest presses send themselves and the restaurant
   confirms in the chat. */
import { money } from './money.js';

/* wa.me wants digits only: full country code, no +, spaces or dashes. */
export const normalizeNumber = raw => (raw || '').replace(/\D/g, '');

export const whatsappNumber = normalizeNumber(import.meta.env.VITE_WHATSAPP_NUMBER);

export const RESTAURANT = 'TANGO';

export function buildOrderMessage(lines, total, guest) {
  const seat = guest?.trim();

  return [
    `*${RESTAURANT} — new order*`,
    '',
    ...lines.map(l => `${l.qty} × ${l.name} — ${money(l.price * l.qty)}`),
    '',
    `*Total: ${money(total)}*`,
    ...(seat ? ['', `Name / table: ${seat}`] : [])
  ].join('\n');
}

export function whatsappUrl(lines, total, guest) {
  if (!whatsappNumber) return null;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildOrderMessage(lines, total, guest))}`;
}
