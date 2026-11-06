// Uploads the 30 articles (covers + PDFs) and their records to Supabase.
// Run after supabase/schema.sql:   npm run seed
// Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local. Safe to re-run (upserts).
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const articles = JSON.parse(fs.readFileSync("data/articles.json", "utf8"));

// Schema check: the tables and buckets come from supabase/schema.sql
{
  const { error } = await db.from("articles").select("id", { head: true, count: "exact" });
  if (error) {
    console.error(`The "articles" table is missing (${error.message}).\nRun supabase/schema.sql in the Supabase SQL Editor first.`);
    process.exit(1);
  }
  const { data: buckets } = await db.storage.listBuckets();
  for (const b of ["covers", "articles"]) {
    if (!buckets?.some((x) => x.id === b)) {
      console.error(`The "${b}" storage bucket is missing. Run supabase/schema.sql first.`);
      process.exit(1);
    }
  }
}

async function upload(bucket, key, file, contentType) {
  const { error } = await db.storage.from(bucket).upload(key, fs.readFileSync(file), { contentType, upsert: true, cacheControl: "31536000" });
  if (error) throw new Error(`${bucket}/${key}: ${error.message}`);
}

let done = 0;
async function seedOne(a) {
  const coverFile = path.join("public", a.cover); // /covers/<slug>.webp
  const pdfFile = path.join("storage/uploads/books", a.file);
  const coverKey = path.basename(a.cover);
  await upload("covers", coverKey, coverFile, "image/webp");
  await upload("articles", a.file, pdfFile, "application/pdf");
  const cover = db.storage.from("covers").getPublicUrl(coverKey).data.publicUrl;
  const { error } = await db.from("articles").upsert({
    id: a.id, slug: a.slug, position: a.order, title: a.title, subtitle: a.subtitle, author: a.author, publisher: a.publisher,
    year: a.year, pages: a.pages, summary: a.summary, category: a.category, cover, file: a.file, size_mb: a.sizeMb,
    published: a.published,
  });
  if (error) throw new Error(`row ${a.slug}: ${error.message}`);
  done++;
  console.log(`[${String(done).padStart(2)}/${articles.length}] ${a.title} (${a.sizeMb} MB)`);
}

// a few at a time
const queue = [...articles];
await Promise.all(Array.from({ length: 3 }, async () => {
  while (queue.length) await seedOne(queue.shift());
}));
console.log(`\nDone: ${done} articles in Supabase.`);
