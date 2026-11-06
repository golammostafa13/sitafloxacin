# Deploying Sage Manual (Supabase + Vercel, free tiers)

The app runs on local files until Supabase keys are set. With
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set, it uses Supabase for
everything. Your local `npm run dev` switches as soon as you add them.

## 1. Supabase (about 5 minutes)

1. Sign in at https://supabase.com and create a **New project**:
   - **Region:** Southeast Asia (Singapore), the closest to Bangladesh.
   - **Database password:** save it somewhere safe. The app doesn't need it.
2. Open **SQL Editor**, then **New query**. Paste all of `supabase/schema.sql` and click **Run**.
   It creates the `articles`, `readers` and `heartbeat` tables and the
   `covers` (public) and `articles` (private) storage buckets.
3. Open **Project Settings**, then **API**, and copy two values:
   - **Project URL**, for `SUPABASE_URL`.
   - The **service_role** key (or the new **secret** key), for `SUPABASE_SERVICE_ROLE_KEY`.
     Keep it secret. It goes in server environment variables only.

## 2. Load the 30 articles (from this computer)

Add the two values to `.env.local`:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

Then run:

```bash
npm run seed      # uploads 30 covers + 30 PDFs (~160 MB) and their records; safe to re-run
npm run dev       # now running on Supabase: sign up, read, and upload in admin to check
```

## 3. GitHub

Create a **private** repository and push this folder to it. `.env.local`,
the PDFs and the local reader data are already in `.gitignore`.

## 4. Vercel (about 5 minutes)

1. Sign in at https://vercel.com with GitHub. Click **Add New**, then **Project**, and import the repository.
2. Under **Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | from step 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from step 1 |
   | `ADMIN_EMAILS` | `mostafarmstu@gmail.com,<apu roy's email>` |
   | `ADMIN_PASSWORD` | the admin password |
   | `READER_PASSWORD` | `Sitamax` (the shared password readers type when signing in) |
   | `SESSION_SECRET` | a new random value: `openssl rand -hex 32` |
   | `CRON_SECRET` | another random value: `openssl rand -hex 32` |

3. Click **Deploy**. The site is live at `https://<project>.vercel.app`.

## 5. Keep Supabase awake

Free Supabase projects pause after **7 days without activity**. Two jobs
prevent that. Each calls `/api/cron/keepalive`, which writes a heartbeat row
and reads the database.

- **Vercel Cron (main).** `vercel.json` schedules it daily at 03:17 UTC, and it
  turns on automatically with the production deploy. To check it, open
  **Project**, **Settings**, then **Cron Jobs**, and click **Run** once. The
  logs should show `{"ok":true,...}`.
- **GitHub Action (backup).** `.github/workflows/keepalive.yml` runs every 2 days.
  1. In the repository, open **Settings**, **Secrets and variables**, **Actions**,
     and add two secrets:
     - `SITE_URL`: `https://<project>.vercel.app`
     - `CRON_SECRET`: the same value you gave Vercel
  2. Open **Actions**, then **Supabase keep-alive**, and click **Run workflow** once to test it.
  3. GitHub switches off scheduled workflows after 60 days with no commits. If
     that happens, re-enable it from the Actions tab. The Vercel cron still runs.

To check it worked, open the Supabase **Table Editor**, then **heartbeat**:
`pinged_at` should be within the last day.

## 6. Before the demo

- On a phone, go through: sign up, sign in, open an article, read, sign out.
  Then in admin: upload an article, toggle it to draft, and export the readers CSV.
- Point the QR code at **`https://<your-address>/open`**. Never change this
  address after printing. If you want a custom domain, add it in Vercel
  (**Settings**, **Domains**) before you print.

## Free-tier limits to know

- **Supabase storage:** 1 GB. The articles use about 160 MB. Each PDF can be at most 50 MB.
- **Supabase bandwidth:** each full read of an article downloads its PDF
  (2.5–8 MB here). Check the current free egress allowance in Supabase's
  pricing before a large launch.
- **Vercel Hobby** is for non-commercial use. For a commercial sponsor launch,
  plan on Vercel Pro (or moving hosting).
