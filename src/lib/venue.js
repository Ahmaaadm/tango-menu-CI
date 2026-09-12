/* How the restaurant names itself, plus the contact details, kept out of the
   components so the masthead, the footer and the printed carte all read from
   one place.

   `tagline` and `kind` are the two lines the roundel in public/header.jpg
   carries. They are typeset only where that artwork is not shown — the
   no-banner fallback and the printed carte without a banner — so the wording
   has to match the logo, or the fallback contradicts it.

   Every contact field is optional; anything left empty in .env renders nothing. */
const env = import.meta.env;

export const VENUE = {
  name: 'Tango',
  tagline: 'Charcoal Grill & Kitchen',
  kind: 'Brasserie · Cuisine & Table',
  address: env.VITE_ADDRESS || '',
  phone: env.VITE_PHONE || '',
  hours: env.VITE_HOURS || ''
};

export const VENUE_LINES = [VENUE.address, VENUE.phone, VENUE.hours].filter(Boolean);
