# Going live — tango-sanpedro.com

The whole path from this folder to **https://tango-sanpedro.com**, with Supabase holding the carte
and Cloudflare serving the site. Same setup as Salinas: the code lives on GitHub, and Cloudflare
rebuilds the site on every push.

Do the steps **in order** — a few of them fail in confusing ways if one before them is skipped.
Budget about an hour, most of it waiting for the domain to switch over.

```
1 Supabase     create the database, load the carte       ~10 min
2 Local test   prove the app talks to Supabase           ~5 min
3 GitHub       push the code                              ~5 min
4 Domain       move tango-sanpedro.com onto Cloudflare   5 min + waiting
5 Cloudflare   connect GitHub, set variables, deploy     ~10 min
6 Check        the go-live checklist                      ~5 min
```

---

## 1 · Supabase — the database

1. Sign in at [supabase.com](https://supabase.com) → **New project**.
   - Name: `tango`
   - Database password: generate one and **save it somewhere** — you will not be shown it again.
   - Region: **West EU (Paris)** — the closest to San Pédro, so the carte loads fastest there.
   - Plan: Free.
2. Wait for the project to finish setting up (a minute or two).
3. Left sidebar → **SQL Editor** → **New query**. Run these three files **in this order**, each one
   pasted in full and then **Run**:

   | Order | File | What it does |
   | --- | --- | --- |
   | 1st | [`supabase/schema.sql`](supabase/schema.sql) | Creates the `categories` and `dishes` tables, their security rules, and the `tango-photos` bucket |
   | 2nd | [`supabase/seed.sql`](supabase/seed.sql) | Loads the starter carte — 10 sections, 46 dishes |
   | 3rd | [`supabase/open-writes.sql`](supabase/open-writes.sql) | Lets the staff panel save. **Read the comment at the top first** |

   Each should end with *Success. No rows returned*.
4. Check it worked:
   - **Table Editor** → `categories` shows 10 rows, `dishes` shows 46.
   - **Storage** → a bucket called `tango-photos` exists.
5. Get the two values the app needs. Click **Connect** at the top of the project (or
   **Project Settings → API Keys**) and copy:
   - **Project URL** — looks like `https://abcdefghijkl.supabase.co`
   - **Publishable key** — starts with `sb_publishable_` (older projects call it the **anon** key)

   ⚠️ **Never** use the `secret` / `service_role` key. It bypasses every security rule, and
   anything in this app ends up readable in the page source.

---

## 2 · Local test — before anything goes public

This proves the app and the database talk to each other while it is still easy to fix.

1. In this folder, copy the example file:

   ```bash
   cd ~/Projects/tango-restaurant-menu
   cp .env.example .env
   ```

2. Open `.env` and fill it in:

   ```
   VITE_SUPABASE_URL=https://abcdefghijkl.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxx
   VITE_ADMIN_PASSCODE=pick-something-that-is-not-tango
   VITE_WHATSAPP_NUMBER=2250701234567
   VITE_ADDRESS=San Pédro, Côte d'Ivoire
   VITE_PHONE=+225 07 01 23 45 67
   VITE_HOURS=Open daily · 12:00 – 23:00
   ```

   - **WhatsApp number**: `225` followed by the restaurant's **10-digit** number, digits only — no
     `+`, no spaces. `+225 07 01 23 45 67` becomes `2250701234567`.
   - **Passcode**: change it from the default `tango`. The default is written in the README.
   - Address, phone and hours are optional — leave any of them empty and it simply doesn't show.

3. Start it:

   ```bash
   npm install
   npm run dev
   ```

4. Check, at http://localhost:5174:
   - [ ] The carte loads — 10 sections.
   - [ ] Open `#/staff`, sign in with your passcode. The dark header says **Supabase**
         (not *Local browser storage*).
   - [ ] Change one price, **Save**, reload the carte — the new price is there.
   - [ ] Add a dish to the order, open the order panel — the green **Send on WhatsApp** button
         appears, and tapping it opens WhatsApp to the right number.
   - [ ] Optional: on a phone on the same Wi-Fi, open the `Network:` address the dev server
         printed. Edits made on the laptop show up on the phone.

   Put the price back. If the header says *Local browser storage*, the two Supabase lines in `.env`
   are wrong or empty — fix them and **restart** `npm run dev`; Vite only reads `.env` at startup.

Stop the server with `Ctrl+C`. The `.env` file **stays on your machine** — it is in `.gitignore`
and never goes to GitHub. Cloudflare gets the same values separately in step 5.

---

## 3 · GitHub — push the code

1. On [github.com](https://github.com/new), create a new repository:
   - Owner: `Ahmaaadm`, name: `tango-menu-CI`
   - **Private** is fine and is the safer choice
   - **Do not** tick *Add a README*, *.gitignore* or *license* — the repo must start empty
2. Push this folder to it:

   ```bash
   cd ~/Projects/tango-restaurant-menu
   git init
   git add .
   git commit -m "Tango online carte"
   git branch -M main
   git remote add origin https://github.com/Ahmaaadm/tango-menu-CI.git
   git push -u origin main
   ```

3. Check on GitHub: you should see `src/`, `supabase/`, `public/header.jpg`, `wrangler.toml`.
   You should **not** see `.env`, `node_modules/` or `dist/`. If `.env` is there, stop and delete
   the repo — then rotate the publishable key in Supabase before trying again.

---

## 4 · The domain — put tango-sanpedro.com on Cloudflare

Cloudflare can only attach the site to a domain whose DNS it runs. Which case are you?

### A — you bought it on Cloudflare (Domain Registration)

It is already in your account. Skip to the **DNS clean-up** below.

### B — you bought it somewhere else (GoDaddy — this one — Namecheap, OVH…)

1. Cloudflare dashboard → **Add a domain** (also shown as *Onboard a domain*) → type
   `tango-sanpedro.com` → **Free** plan.
2. Cloudflare scans the existing records, then shows **two nameservers**, like
   `ada.ns.cloudflare.com` and `bob.ns.cloudflare.com`. Keep that tab open.
3. At the company you bought the domain from, replace its nameservers with Cloudflare's two.
   **On GoDaddy**: *My Products* → `tango-sanpedro.com` → **DNS** → **Nameservers** tab →
   **Change Nameservers** → *I'll use my own nameservers* → enter both → **Save** → confirm the
   warning. The current ones are `ns19.domaincontrol.com` / `ns20.domaincontrol.com`; after the
   change GoDaddy's own DNS page stops mattering — all records are managed in Cloudflare.
4. Back in Cloudflare, press **Check nameservers**. (You can check from a terminal too:
   `dig +short NS tango-sanpedro.com` shows `…ns.cloudflare.com` once GoDaddy has saved the change.)
    The domain turns **Active** anywhere from a
   few minutes to 24 hours later; Cloudflare emails you when it does.

   **Do not continue to step 5 until it says Active.**

### DNS clean-up — both cases

Cloudflare → `tango-sanpedro.com` → **DNS → Records**. Delete any **A**, **AAAA** or **CNAME**
record whose name is `tango-sanpedro.com` (shown as `@`) or `www` — typically a registrar's
parking page. Leave **MX** and **TXT** records alone; those are email.

This matters: the deploy creates those two records itself, and it **fails** if they already exist.

---

## 5 · Cloudflare — connect GitHub and deploy

> **Current state:** the site is deployed to its free `workers.dev` address, and the domain is
> switched **off** in `wrangler.toml` until step 4 is finished. To switch it on: wait for
> **Active**, uncomment the `routes` block in `wrangler.toml`, then
> `git commit -am "Attach tango-sanpedro.com" && git push`. The push redeploys with the domain.

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository** → connect
   GitHub if asked, and give Cloudflare access to the `tango-menu-CI` repository.
2. Select `tango-menu-CI` and set:

   | Setting | Value |
   | --- | --- |
   | Project name | `tango-menu-ci` — it must match `name` in `wrangler.toml` |
   | Production branch | `main` |
   | Build command | `npm run build` |
   | Deploy command | `npx wrangler deploy` (the default) |
   | Root directory | leave empty |

3. Open **Advanced settings → Build variables** (after creation: **Settings → Build → Variables
   and secrets**) and add **the same values as your `.env`**:

   | Variable | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | your Project URL |
   | `VITE_SUPABASE_ANON_KEY` | your `sb_publishable_…` key |
   | `VITE_ADMIN_PASSCODE` | your passcode |
   | `VITE_WHATSAPP_NUMBER` | e.g. `2250701234567` |
   | `VITE_ADDRESS` · `VITE_PHONE` · `VITE_HOURS` | optional |
   | `NODE_VERSION` | `22` |

   They must be **build** variables. The Worker's own *runtime* variables do nothing for this
   site — Vite writes these values into the code while it builds, and nothing reads them later.
   This is the most common reason a deployed menu opens in local mode.

4. **Deploy**. Watch the build log: it installs, runs `vite build`, then `wrangler deploy`. Near
   the end it should list both domains:

   ```
   tango-sanpedro.com (custom domain)
   www.tango-sanpedro.com (custom domain)
   ```

   The domains come from [`wrangler.toml`](wrangler.toml), so **don't also add them by hand** under
   *Domains & Routes* — one place, not two.

5. The certificate takes a few minutes the first time. Until then `https://` may show a security
   warning — wait, don't change anything.

If the build fails, the log says why. The usual three:

| Message mentions | Cause | Fix |
| --- | --- | --- |
| a record already exists / hostname conflict | a leftover DNS record | Step 4 *DNS clean-up*, then **Retry deployment** |
| zone not found / not active | nameservers not switched yet | Wait for **Active** in step 4, then retry |
| name mismatch | project name ≠ `tango-restaurant-menu` | Rename the project, or change `name` in `wrangler.toml` and push |

---

## 6 · Go-live checklist

On your **phone, on mobile data** (not the restaurant Wi-Fi — you want to see what a guest sees):

- [ ] https://tango-sanpedro.com loads with the banner and the TANGO plaque, padlock shown.
- [ ] https://www.tango-sanpedro.com loads too.
- [ ] Search `creme` finds *Crème caramel*.
- [ ] Add two dishes → *View order* → **Send on WhatsApp** opens a chat with the restaurant's
      number and the order already written.
- [ ] https://tango-sanpedro.com/#/staff → sign in → the header says **Supabase**.
- [ ] Change a price on the laptop, reload on the phone — it changed. Put it back.
- [ ] Upload one real dish photo; it appears on the phone.
- [ ] **A4** (in the staff panel, on a laptop) → *Save as PDF* — the carte prints with the banner.

---

## Day to day — what needs a deploy and what doesn't

| You want to… | Do this | Redeploy? |
| --- | --- | --- |
| Change a price, dish, photo, section, mark something sold out | `#/staff` | **No** — live immediately |
| Change the code or `public/header.jpg` | `git add . && git commit -m "…" && git push` | Automatic on push |
| Change the passcode, WhatsApp number, address or hours | Edit the **build variable** in Cloudflare, then **Deployments → Retry deployment** (and update your local `.env` to match) | **Yes** — a variable only takes effect in a new build |
| Rotate the Supabase key | Supabase → API Keys, then as the row above | Yes |

## QR codes for the tables

Point them at **`https://tango-sanpedro.com`** — the domain, never the `*.workers.dev` address,
so printed cards keep working whatever happens to the hosting behind it.

## Worth knowing

- **The passcode is not a lock on the database.** `open-writes.sql` lets the publishable key write,
  and that key is in the page source. Anyone who opens the developer tools could change the carte
  without the passcode. For a menu that is usually acceptable; never put anything private behind
  it. To close that door later, see *About the passcode* in the README.
- **Free Supabase projects can pause** after about a week with no activity. A menu guests open
  every day stays awake; if the restaurant closes for a while and the carte shows an error on
  reopening, go to the Supabase dashboard and press **Restore project**.
- **Photo storage**: the free tier holds 1 GB, and photos are compressed to roughly 150 KB before
  upload — room for thousands. Replaced and deleted photos are removed automatically;
  `npm run clear:photos` sweeps up anything left over.
- **Backups**: the free tier has no point-in-time restore. Once the carte is finished, export
  both tables (**Table Editor → … → Export to CSV**) and keep the files.
