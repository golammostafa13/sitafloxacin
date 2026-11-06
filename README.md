# Sage Manual

The site behind the Sitamax 50 "Scan to access Sage Manual" card: 30 books
in a 3D, image-led library, with an admin who uploads new ones..

## Run locally

```bash
npm install
npm run prepare-content   # copies the 30 smallest Gastro Book Bank PDFs + covers in as articles
npm run dev               # http://localhost:3000
```

Admin: http://localhost:3000/admin. Password is `ADMIN_PASSWORD` in `.env.local`.

Readers sign up at `/signup` (name, mobile, email, district, thana, date of
birth, gender) and sign in at `/signin` with their email or mobile. There is no
email verification yet. Articles and their PDFs need a signed-in reader. The
QR address is `/open`: it sends a new browser to Sign up and a returning one to
Sign in.

## Where things live

| | |
|---|---|
| `data/articles.json` | the article list (local dev store) |
| `public/covers` | seeded covers (public) |
| `storage/uploads` | article PDFs + admin uploads, served by `/media/...` (PDFs only to signed-in readers) |
| `public/sponsor`, `public/sitamax` | sponsor images and crops used as backgrounds |
| `components/scene` | the real-time 3D scenes (molecule, shatter, orbit, swarm) |
| `lib/look.ts` | gives each article its own scene, lens and glow |
| `lib/store.ts`, `lib/readers.ts` | data layer (articles, readers); swap for Supabase when deploying |
| `components/stack` | smooth scrolling and the stacked, pinned sections |
| `components/PdfReader.tsx` | the reading room (progress, milestones, resume, page map) |
