# Tango Online Carte — project conventions

Phone-first online menu for **Tango · Brasserie · Cuisine & Table**, a full-service
restaurant. Display only: **no checkout, no payment, no delivery tracking** — pressing *Add* on
a dish puts it in a local selection so guests can tally what they want. The selection is handed
to the restaurant's WhatsApp as a pre-written message (`src/lib/whatsapp.js`); the guest presses
send and the restaurant confirms in the chat. **Never add a payment step.**

## Rules

- **There is no plat du jour, and no `specials` table.** Tango serves one carte. A dish that is
  only on today does not exist in this model — do not reintroduce one. Something temporary is a
  dish with `available` toggled, or a section the staff add and remove.
- Menu content comes from the data layer (`src/lib/store.js`), never hardcoded in JSX.
  `src/menuData.js` is the **seed** for local mode and the reference row shape — keep it valid,
  but the live carte is whatever the adapter returns.
- Two adapters, one interface: `localAdapter.js` (localStorage, zero setup) and
  `supabaseAdapter.js` (Postgres + storage). Supabase is used when `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_ANON_KEY` are both set. **Any new persistence goes in both adapters.**
- **The carte is in French** — dish and section names are the French wording of the printed menu,
  because that is what San Pédro reads and what the book on the table says. The owner asked for
  this explicitly after a first pass in English; do not translate the dish names back.
- `french` is an optional **second line** under a name, and is currently null on every row, so
  each dish shows one line. It stays in the schema: fill it in and a translation appears under
  every dish. Same for `note` / `note_french` under a section name, where only `note` is used.
  All four render only when they have text — a null must produce no empty line and no
  placeholder.
- The **interface** around the carte (buttons, "Search the carte…", the order panel) is still in
  English. That is not a decision anyone has made — it simply has not been asked for. If it is
  ever translated, `src/lib/tags.js` already carries a `french` label for every tag.
- Styling is inline React style objects plus the tokens and keyframes in `src/index.css`.
  Don't add a CSS framework or Tailwind unless asked.
- Colours are **role tokens** on `:root` (`--paper`, `--panel`, `--band`, `--ink*`, `--ember*`,
  `--brass*`, `--rule*`), never raw hex in JSX — including in the staff panel. Adding a literal
  breaks the repaint.
- One palette: **ember** — warm paper ground, espresso ink, terracotta accent, brass hairlines.
  It is light on purpose, which is why screen and paper want nearly the same ink. Two contrast
  facts are load-bearing: `--ember` clears 5.4:1 on `--paper`, so it is safe for prices;
  `--brass` is 3.2:1 and is for **rules, marks and dividers only** — never body text.
- Geometry is squared: 2–4px radii and hairline borders throughout. Pills and large radii are
  not this design.
- Fonts: Bodoni Moda (display) and Jost (UI), loaded in `index.html`. Bodoni's hairlines break up
  at small sizes — use `.display` only at 15px and above, and never inside a transform.
- Touch targets ≥ 30px; body copy ≥ 11.5px.
- `image_url: null` renders the diamond placeholder frame (`src/components/Photo.jsx`) at the
  same size as a real photo. Do not delete that fallback — a missing photo must not reflow a row.
- `public/header.jpg` is the restaurant's **own branded artwork**, not a dining-room photograph:
  a roundel reading *Brasserie / Tango / Cuisine & Table* over a dark red band, with *Charcoal
  Grill & Kitchen* beneath it. The Bodoni **TANGO** plaque stays below it — that is a deliberate
  choice by the owner, so do not "de-duplicate" the name away again.
- What must not duplicate is the **taglines**, and they are split to guarantee it. The roundel
  carries `VENUE.kind` (*Brasserie · Cuisine & Table*), so the plaque carries `VENUE.tagline`
  (*Charcoal Grill & Kitchen*) — which is exactly the strip of artwork the plaque's `OVERLAP`
  covers. With no photo there is no roundel, so `kind` moves up to the eyebrow over the hatch.
  Both lines appear exactly once in either state; keep it that way, and keep them matching the
  artwork.
- `OVERLAP` in `Masthead.jsx` is tuned to this artwork: 40px hides its bottom tagline and frame
  rule without touching the roundel, which sits at ~79% of the band height. A different picture
  with something important low in the frame needs a taller `BAND` or a smaller `OVERLAP`.
- The banner is `object-fit: cover` on screen (a 2.5:1 artwork in a phone column: cropping the
  empty side margins is what keeps the roundel legible) and `object-fit: contain` in print (the
  print box is much wider than 2.5:1, and `cover` there would crop the roundel out entirely).
  Because print shows the artwork whole, the printed masthead drops the typeset tagline line and
  keeps only the banner and the wordmark — `PrintCarte.jsx` branches on that.
- Dish tags are a **closed vocabulary** in `src/lib/tags.js`. Read them through `readTags()`,
  which normalises Postgres `text[]`, a local array, and a row that predates tags, and drops
  unknown keys — so removing a tag from the file can never break a stored row. On screen and on
  paper a tag shows as its brass mark beside the name, explained once by the legend in the
  footer; the words live in `title`/`aria-label`. Do not add a second, wordier rendering.
- The section rail **scrolls to** a section, it does not filter. Narrowing the carte is what the
  search field is for, and the rail hides itself while there is a query. Scroll-spy in `App.jsx`
  uses `SPY_OFFSET`, which must stay in step with the `scroll-margin-top` on `[data-section]`
  in `index.css`.
- Search is accent-insensitive (`searchCarte` in `store.js`) — half this carte carries accents
  and nobody types them on a phone keyboard.
- Order state is a plain `{ dishId: qty }` object in `App.jsx`. No state library. A dish the
  staff have since deleted simply stops resolving and drops out of the total.
- The staff panel is at `#/staff` (hash routing, no router dependency) and is lazy-loaded so
  guests never download it. Keep it that way.
- Staff sign-in is a static passcode (`VITE_ADMIN_PASSCODE`, default `tango`) in
  `src/lib/gate.js`, shared by both adapters. There is no Supabase Auth. That means RLS has to
  allow anonymous writes (`supabase/open-writes.sql`), so treat the panel as unprotected and
  never put anything sensitive behind it.
- Photos are resized in the browser before upload (`src/lib/images.js`) — the Supabase free tier
  has no server-side image transformation.
- A photo is deleted once nothing references it. Replacing or removing one in an editor, or
  deleting the row, cleans the bucket through `deleteImage`/`deleteImages` on **both** adapters
  (a no-op locally, where the photo is a data URL inside the row). `usePhotoCleanup` settles on
  save or close, never inside `ImagePicker` — closing an editor without saving must not delete
  the photo the stored row still points at. Cleanup is best effort and swallows storage errors:
  an orphaned file is harmless, a blocked menu edit is not.
- The A4 export (`src/components/PrintCarte.jsx` + the `@media print` block in `index.css`) is a
  separate document, not the screen carte reflowed. It is **staff-only** — mounted from
  `StaffApp`, so it stays in the lazy chunk. It mounts only while exporting, waits for the
  banner to decode, then calls `window.print()`. It carries **no dish photographs** on purpose:
  a forty-dish carte with a thumbnail per line turns three sheets into eight. Both the guest
  shell and the staff panel carry `.screen-only` so print hides them; keep that.
- Print styling must not rely on `background` or gradients — Chrome's "Background graphics" box
  is unchecked by default and drops them. Use rules, borders and the one `<img>`.

## Commands

- **Deploying**: GitHub (`Ahmaaadm/tango-menu-CI`) → Cloudflare Workers Builds, Worker
  `tango-menu-ci`. `tango-sanpedro.com` + `www` are attached by `routes` in `wrangler.toml` (DNS moved
  from GoDaddy to Cloudflare; the domain stays registered at GoDaddy). A route to a zone that is
  not Active fails the whole deploy. `VITE_*` are *build* variables in the dashboard. Full runbook in
  `DEPLOY.md` — keep it in step with any change to env vars, SQL files or `wrangler.toml`.

- `npm run dev` — dev server on :5174
- `npm run build` — production build to `dist/`
- `npm run seed:sql` — regenerate `supabase/seed.sql` (adds to an empty DB) **and**
  `supabase/replace-menu.sql` (erases every section and dish, then inserts, in one transaction) from
  `src/menuData.js`. Both are generated — never hand-edit them. `menuData.js` is the restaurant's
  real carte; dishes the printed menu gives no price carry `available: false` so guests never see
  `0 FCFA` — staff price them in `#/staff` and switch them on.
- `npm run clear:photos` — delete bucket photos nothing points at (`--all` empties the bucket).
  Dry run unless `--yes`. Run it from the project root; it reads `.env` relative to the cwd.
  This is the only way to actually free storage — SQL can delete a file's metadata, not the file.
- `supabase/schema.sql` — run once in the Supabase SQL editor: tables, RLS, photo bucket
- `supabase/open-writes.sql` — required in Supabase mode; read its header first
- `supabase/clear-menu.sql` — wipe sections and dishes to start fresh. It cannot remove photos,
  so it lists the files it orphans.
