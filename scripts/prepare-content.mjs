// Builds data/articles.json and copies covers + PDFs from the local Gastro Book Bank.
// Picks the 30 smallest books that have a cover.
import fs from "node:fs";
import path from "node:path";

const GBB = process.env.GBB_DIR || "/home/spectrum/Documents/library/gastroentrology_book_bank";
const books = JSON.parse(fs.readFileSync(path.join(GBB, "scripts/data/books.json"), "utf8"));
const bySlug = Object.fromEntries(books.map((b) => [b.slug, b]));
const dir = path.join(GBB, "private/books");

fs.mkdirSync("storage/uploads/books", { recursive: true });
fs.mkdirSync("public/covers", { recursive: true });
const rows = fs.readdirSync(dir)
  .filter((f) => f.endsWith(".pdf") && bySlug[f.slice(0, -4)])
  .map((f) => ({ slug: f.slice(0, -4), size: fs.statSync(path.join(dir, f)).size }))
  .filter((r) => fs.existsSync(path.join(GBB, "public/covers", r.slug + ".webp")))
  .sort((a, b) => a.size - b.size)
  .slice(0, 30);

const articles = rows.map((r, i) => {
  const b = bySlug[r.slug];
  fs.copyFileSync(path.join(GBB, "public/covers", r.slug + ".webp"), `public/covers/${r.slug}.webp`);
  fs.copyFileSync(path.join(dir, r.slug + ".pdf"), `storage/uploads/books/${r.slug}.pdf`);
  return {
    id: r.slug,
    slug: r.slug,
    order: i + 1,
    title: b.title,
    subtitle: b.subtitle || "",
    author: b.authorDisplay || "",
    publisher: b.publisher || "",
    year: b.year || null,
    pages: b.pages || null,
    summary: b.description || "",
    category: (b.subjectId || "").replace(/^sub-/, "").replace(/-/g, " "),
    cover: `/covers/${r.slug}.webp`,
    file: `${r.slug}.pdf`, // key in the private store; served only to signed-in readers
    sizeMb: +(r.size / 1048576).toFixed(1),
    published: true,
    createdAt: new Date().toISOString(),
  };
});

fs.writeFileSync("data/articles.json", JSON.stringify(articles, null, 2));
console.log(`Wrote ${articles.length} articles, ${(rows.reduce((a, r) => a + r.size, 0) / 1048576).toFixed(0)} MB of PDFs`);
