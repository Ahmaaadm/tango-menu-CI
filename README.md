# Tango — Online Carte (React + Vite)

Phone-first online menu for **Tango · Brasserie · Cuisine & Table**. Press *Add* on a dish, the
basket bar shows the running total, *View order* opens the order panel, and the selection can be
sent to the restaurant over WhatsApp. No payment, no delivery tracking — the order is a message,
not a checkout.

A full carte, so it is built to be read: sections you jump between, an accent-insensitive search
across every dish, and a printable A4 version for the dining room. Staff manage everything from
a panel at `#/staff`.

## Run it

Requires Node 18+.

```bash
npm install
npm run dev     # http://localhost:5174
npm run build   # production bundle in dist/
```

## Open in VS Code + Claude Code

```bash
code tango-restaurant-menu   # open the folder in VS Code
claude                       # start Claude Code in that folder
```

Then ask for things like "add a wine list section" or "show a photo on the printed carte".
`CLAUDE.md` in this folder tells it the project conventions.

## What a guest sees

| Piece | What it does |
| --- | --- |
| Masthead | The restaurant's branded banner, full width |
| Search | Filters every dish by name, accents and apostrophes optional — `cesar` finds *Salade César*, `boeuf` finds *bœuf* |
| Section rail | Sticky; **jumps** to a section and highlights whichever one you are reading |
| Dish line | Name, brass tag marks, dotted leader, price, and an Add/stepper control |
| Basket bar | Appears only once something is selected: count, total, *View order* |
| Order panel | Full-height panel — adjust quantities, add a name or table, send on WhatsApp |

Tapping a dish row does nothing on purpose: only the *Add* control adds, so scrolling a long
carte on a phone can never add a dish by accident.

## Ordering over WhatsApp

Set the restaurant's number in `.env` and the order panel grows a **Send on WhatsApp** button:

```
VITE_WHATSAPP_NUMBER=2250701234567   # 225 + the 10-digit number, digits only, no + or spaces
```

Leave it empty and the button never renders — the carte stays purely display-only.

The guest optionally types a name or table number, taps the button, and WhatsApp opens with the
order already written:

```
*TANGO — new order*

2 × Rib Eye — 33 000 FCFA
1 × Bissap — 2 000 FCFA

*Total: 35 000 FCFA*

Name / table: Ahmad — table 4
```

They press send themselves; the restaurant confirms in the chat. Nothing is stored and nothing
is charged — it is a handoff, not a checkout.

## Dish tags

Four tags, a closed set defined in [`src/lib/tags.js`](src/lib/tags.js):

| Mark | Tag | French |
| --- | --- | --- |
| ★ | Chef's pick | Choix du chef |
| ◇ | New | Nouveau |
| ❃ | Vegetarian | Végétarien |
| ▲ | Spicy | Épicé |

They show as the brass mark beside a dish name — on screen and on the printed carte — with the
legend in the footer, the way a restaurant menu normally does it. The words are in the tooltip
and the accessible label, so nothing depends on reading the glyph. Staff pick them from toggles
in the dish editor; the vocabulary is closed on purpose, because free-text labels drift into
"veggie" / "Vegetarian" / "VEG" within a month and stop being usable.

## Staff panel

Open `#/staff` (or tap **Staff** at the bottom of the carte). Two tabs:

| Tab | What you can do |
| --- | --- |
| Dishes | Add/edit any dish, move it between sections, set tags, mark it sold out, reorder |
| Sections | Add/edit/reorder sections. Deleting one deletes its dishes. Empty sections are hidden |

A counter across the top shows sections, dishes and how many are currently sold out. Photos are
resized and compressed in the browser before they are stored.

**There is no plat du jour.** Tango serves one carte; a dish that is off today is toggled to
*Sold out* and disappears from the guest menu until it comes back.

## Data: local mode vs Supabase

The app runs on a swappable data layer, so it works with **zero setup** and upgrades without a
rewrite.

**Local mode (default).** No account, no cost. The carte is seeded from `src/menuData.js` into
`localStorage` and edits stay in that one browser. Sign in at `#/staff` with the passcode
`tango` (override with `VITE_ADMIN_PASSCODE`). Good for trying the panel out; not for a real
restaurant, since edits never reach another device.

**Supabase mode.** Real Postgres, shared across every device, CDN-hosted photos — free tier, no
card:

1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → run [`supabase/schema.sql`](supabase/schema.sql) (tables, row-level security,
   photo bucket).
3. SQL Editor → run [`supabase/seed.sql`](supabase/seed.sql) (Tango's carte).
4. SQL Editor → run [`supabase/open-writes.sql`](supabase/open-writes.sql) — required, because
   the panel uses a static passcode rather than Supabase Auth. **Read the header comment in that
   file first.**
5. Copy `.env.example` to `.env` and fill in:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co     # bare project URL, no /rest/v1
   VITE_SUPABASE_ANON_KEY=sb_publishable_...      # anon / publishable, never service_role
   ```

6. Restart `npm run dev` — Vite reads `.env` only at startup. The panel header now reads
   **Supabase** instead of **Local browser storage**.

Local-mode edits live in one browser and do **not** migrate. The carte comes in through
`supabase/seed.sql`; regenerate it with `npm run seed:sql` if you have edited `src/menuData.js`.

### About the passcode

There are no accounts. `#/staff` asks for `VITE_ADMIN_PASSCODE` (default `tango`) and that is
the whole gate, in both modes.

The comparison happens in the visitor's browser, so it keeps people out of the *panel* but not
out of the *database*: `open-writes.sql` lets the publishable key write, and that key is in the
page source. Anyone motivated enough to open DevTools can change the carte through the REST API
without ever seeing the passcode screen.

For a display-only menu that is usually an acceptable trade. To close it later, re-run
`supabase/schema.sql` (which restores authenticated-only writes) and switch the login to
`signInWithPassword`.

## Print the carte as A4

**Staff only.** Sign in at `#/staff` and press the **A4** button in the bottom bar. It opens the
browser print dialog — print it, or choose *Save as PDF* for something you can email or hand to
a printer. Guests never see it and never download the code for it: the document lives in the
lazy-loaded staff chunk.

The printed carte ([`src/components/PrintCarte.jsx`](src/components/PrintCarte.jsx) plus the
`@media print` block in [`src/index.css`](src/index.css)) is a separate document, not the phone
layout squeezed onto paper:

- A masthead with the banner photo, the wordmark and a brass rule
- Numbered section headers with the French name and the serving note
- One dish per line, tag marks, a dotted leader to the price, French beneath
- A tag legend and the endnote at the foot

**No dish photographs**, deliberately: forty-six dishes with a thumbnail each turns three sheets
into eight. Nothing in it depends on CSS backgrounds either, because Chrome's print dialog ships
with **Background graphics** unchecked and silently drops them — structure comes from rules,
borders and the one banner image. The document is built only while you are exporting, and waits
for the banner to decode so nothing prints blank. If `public/header.jpg` is missing the banner
is left out entirely rather than printing an empty box.

## The banner

**`public/header.jpg`** is the restaurant's own artwork — the roundel, the name, *Brasserie ·
Cuisine & Table* and *Charcoal Grill & Kitchen*. It is served as a plain file rather than
imported, so it can be swapped without touching any code.

The Bodoni **TANGO** plaque sits below it, overlapping the bottom of the band. The two taglines
are split so nothing is said twice: the roundel carries *Brasserie · Cuisine & Table*, so the
plaque carries *Charcoal Grill & Kitchen* — which is precisely the strip of artwork the overlap
hides. Both lines appear once.

If the file is missing, the band falls back to a brass hatch with *Brasserie · Cuisine & Table*
as an eyebrow, and the plaque is unchanged — so the masthead still reads correctly and the app
never looks broken without it. Those words come from `VENUE` in
[`src/lib/venue.js`](src/lib/venue.js); keep them matching the logo.

Replacing it: any landscape image works. On screen it is `cover`-cropped into a 248px band, so
keep the subject centred — the side margins are what gets trimmed on a narrow phone — and expect
the bottom ~40px to sit behind the plaque. In print it is `contain`-fitted into a 40mm band, so
the whole image is always visible there, which is why the printed masthead shows the banner and
the wordmark but no typeset tagline.

The file shipped here is 1600×633 and 134 KB, re-encoded from a 1.6 MB PNG. If you swap in a new
one, compress it: it is the single heaviest asset on the page and it loads before anything
else.

## Adding real photos

Upload them from the staff panel — that is the whole workflow. Any dish or section without a
photo shows the diamond placeholder frame, labelled with what belongs there, at exactly the size
the real photo will take.

Photos are resized and re-encoded in the browser before upload (1200px in Supabase mode, 700px
in local mode, where they become base64 inside a ~5MB `localStorage` budget). When a photo stops
being referenced — replaced, removed, or its row deleted — it is deleted from the bucket too.
`npm run clear:photos` sweeps up anything that slipped through.

## Palette

**Ember**: a warm paper ground, espresso ink, terracotta accent, brass hairlines. Every colour is
a role token on `:root` in [`src/index.css`](src/index.css), so a repaint means editing that one
block — no component changes.

Two constraints are baked in and worth keeping:

- `--ember` measures **5.4:1** on `--paper`, clear of the 4.5:1 floor, which is why prices can
  use it at 14px.
- `--brass` is **3.2:1**. It is for rules, marks and dividers only — never body text.

The carte is light on purpose: paper is white, so screen and print want nearly the same ink and
the print stylesheet has almost nothing to override.

## Design tokens

- Paper `#f7f2ea`, panel `#fffdf9`, tinted band `#efe6d8`, dark band `#241d19`
- Ink `#221c18`, secondary `#6b5d52`, meta `#857465`
- Ember `#b23a20`, deep `#8e2d18`, soft `#d9603f` · Brass `#a9822f`, soft `#d9c193`
- Display serif: Bodoni Moda · UI sans: Jost
- Radii 2–4px throughout, hairline borders, no pills
- Max column width 440px, centred

## Files

| File | What's in it |
| --- | --- |
| `src/menuData.js` | The carte — sections, dishes (in French), prices, tags |
| `src/App.jsx` | The guest carte: shell, sections, scroll-spy, search, order state |
| `src/components/Masthead.jsx` | The banner, and the typeset fallback when it is missing |
| `src/components/SectionNav.jsx` | Sticky search field and section rail |
| `src/components/DishLine.jsx` | One dish: leader, price, Add/stepper |
| `src/components/OrderPanel.jsx` | The order panel and the WhatsApp handoff |
| `src/components/PrintCarte.jsx` | The A4 carte |
| `src/components/Photo.jsx` | Photo frame and its placeholder |
| `src/components/TagMarks.jsx` | The brass tag marks beside a dish name |
| `src/lib/store.js` | Picks an adapter, exposes `useCarte()`, search and shaping |
| `src/lib/localAdapter.js` | localStorage implementation |
| `src/lib/supabaseAdapter.js` | Supabase implementation (lazy-loaded) |
| `src/lib/tags.js` | The tag vocabulary and `readTags()` |
| `src/lib/images.js` | Browser-side resize and compress before upload |
| `src/lib/money.js` | FCFA formatting, shared by carte, panel and WhatsApp |
| `src/lib/whatsapp.js` | Builds the order message and the `wa.me` link |
| `src/lib/venue.js` | Address, phone and hours from `.env` |
| `src/admin/StaffApp.jsx` | The staff panel — login, tabs, editors, A4 export |
| `src/admin/ui.jsx` | Shared form controls for the panel |
| `src/index.css` | Role tokens, resets, keyframes, the whole print stylesheet |
| `index.html` | Google Fonts (Bodoni Moda + Jost), viewport, theme colour |
| `supabase/schema.sql` | Tables, row-level security, storage bucket |
| `scripts/gen-seed.mjs` | Generates `supabase/seed.sql` and `supabase/replace-menu.sql` from the carte |
| `scripts/clear-photos.mjs` | Deletes orphaned photos from the bucket |

## Deploy to Cloudflare

> **Going live on tango-sanpedro.com with Supabase?** Follow [DEPLOY.md](DEPLOY.md) — the
> step-by-step checklist. This section is the background.

The build is a static bundle, and [`wrangler.toml`](wrangler.toml) is already set up for it:
Workers Static Assets, no Worker script, with `not_found_handling = "single-page-application"`
so a stray deep link returns the app instead of a 404.

Pick one of the two routes. They differ in **where the `VITE_*` values come from**, which is the
one thing that catches people out.

### Route A — build here, upload from your machine

```bash
cp .env.example .env     # fill in your values first — see below
npm run build            # bakes .env into dist/
npx wrangler login       # opens the browser, once per machine
npx wrangler deploy      # uploads ./dist
```

Live at `https://tango-restaurant-menu.<your-subdomain>.workers.dev`. To publish a change:
`npm run build && npx wrangler deploy` again.

On this route the dashboard's build variables are **never read** — the values come from your
local `.env` at build time. Change `.env`, and you must rebuild before deploying.

### Route B — let Cloudflare build from Git

1. Push the repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository**.
3. Build command `npm run build`, output directory `dist`.
4. Add the `VITE_*` values under **Settings → Variables → Build variables**. They must be *build*
   variables, not runtime ones: Vite reads them when it compiles, and nothing in this app reads
   an environment variable at runtime.
5. Every push to the branch redeploys.

### The variables to set

| Variable | Needed? | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | for shared editing | Bare project URL, no `/rest/v1` |
| `VITE_SUPABASE_ANON_KEY` | for shared editing | anon / publishable — **never** `service_role` |
| `VITE_ADMIN_PASSCODE` | recommended | Defaults to `tango` if unset |
| `VITE_WHATSAPP_NUMBER` | for ordering | Digits only; leave empty to hide the button |
| `VITE_ADDRESS` / `VITE_PHONE` / `VITE_HOURS` | optional | Footer and printed carte |

Leave the two Supabase variables unset and the deployed site runs in **local mode** — each
visitor gets their own copy of the seed carte in their own browser, and staff edits reach nobody
else. That is fine for a demo and wrong for a real dining room.

Everything prefixed `VITE_` is compiled into the JavaScript and is readable by anyone who opens
the page. That is expected for the publishable Supabase key, and it is why the staff passcode
gates the *panel* and not the database — see [About the passcode](#about-the-passcode).

### Before the first real deploy

- Run `supabase/schema.sql`, `supabase/seed.sql` and `supabase/open-writes.sql` in the Supabase
  SQL editor, or the live site will load with an error instead of a carte.
- Put the banner photo at `public/header.jpg` — it is part of the build, not an upload.
- Check `#/staff` on the deployed URL and sign in once.

### Custom domain

`tango-sanpedro.com` and `www.tango-sanpedro.com` are attached in
[`wrangler.toml`](wrangler.toml) under `routes`, so every deploy re-attaches them and nothing needs
adding by hand in the dashboard — don't, or there are two places to keep in sync. The zone has
to be active in the same Cloudflare account, and neither hostname may already have a DNS record.
[DEPLOY.md](DEPLOY.md) step 4 walks through both.

For a QR-code table menu, point the QR at `https://tango-sanpedro.com`, never the
`workers.dev` address, so the printed cards survive any change behind it.
