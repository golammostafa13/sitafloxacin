import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import type { Article } from "./types";
import { hasSupabase, maybe, must, supabase } from "./supabase";

/**
 * Articles. Supabase when configured, otherwise a local JSON file (development).
 * `file` is the PDF's key in the private store (e.g. "autoimmune-hepatitis.pdf");
 * `cover` is a ready-to-use image URL.
 */

export const UPLOADS = path.join(process.cwd(), "storage/uploads");
const DATA = path.join(process.cwd(), "data/articles.json");

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").slice(0, 80) || "article";
}

/* ---------- Supabase rows <-> Article ---------- */

type Row = {
  id: string; slug: string; position: number; title: string; subtitle: string; author: string; publisher: string;
  year: number | null; pages: number | null; summary: string; category: string; cover: string; file: string;
  size_mb: number; published: boolean; created_at: string;
};

const fromRow = (r: Row): Article => ({
  id: r.id, slug: r.slug, order: r.position, title: r.title, subtitle: r.subtitle, author: r.author, publisher: r.publisher,
  year: r.year, pages: r.pages, summary: r.summary, category: r.category, cover: r.cover, file: r.file,
  sizeMb: r.size_mb, published: r.published, createdAt: r.created_at,
});

const toRow = (a: Partial<Article>): Partial<Row> => {
  const r: Partial<Row> = {};
  if (a.id !== undefined) r.id = a.id;
  if (a.slug !== undefined) r.slug = a.slug;
  if (a.order !== undefined) r.position = a.order;
  if (a.title !== undefined) r.title = a.title;
  if (a.subtitle !== undefined) r.subtitle = a.subtitle;
  if (a.author !== undefined) r.author = a.author;
  if (a.publisher !== undefined) r.publisher = a.publisher;
  if (a.year !== undefined) r.year = a.year;
  if (a.pages !== undefined) r.pages = a.pages;
  if (a.summary !== undefined) r.summary = a.summary;
  if (a.category !== undefined) r.category = a.category;
  if (a.cover !== undefined) r.cover = a.cover;
  if (a.file !== undefined) r.file = a.file;
  if (a.sizeMb !== undefined) r.size_mb = a.sizeMb;
  if (a.published !== undefined) r.published = a.published;
  return r;
};

/* ---------- local JSON ---------- */

async function readLocal(): Promise<Article[]> {
  return (JSON.parse(await fs.readFile(DATA, "utf8")) as Article[]).sort((a, b) => a.order - b.order);
}
async function writeLocal(list: Article[]) {
  await fs.writeFile(DATA + ".tmp", JSON.stringify(list, null, 2));
  await fs.rename(DATA + ".tmp", DATA);
}

/* ---------- API ---------- */

export async function listArticles({ includeDrafts = false } = {}): Promise<Article[]> {
  if (hasSupabase()) {
    let q = supabase().from("articles").select("*").order("position", { ascending: true });
    if (!includeDrafts) q = q.eq("published", true);
    return must(await q, "List articles").map(fromRow);
  }
  const all = await readLocal();
  return includeDrafts ? all : all.filter((a) => a.published);
}

export async function getArticle(slug: string) {
  if (hasSupabase()) {
    const row = maybe(await supabase().from("articles").select("*").eq("slug", slug).maybeSingle(), "Get article");
    return row ? fromRow(row) : null;
  }
  return (await readLocal()).find((a) => a.slug === slug) ?? null;
}

export async function getArticleById(id: string) {
  if (hasSupabase()) {
    const row = maybe(await supabase().from("articles").select("*").eq("id", id).maybeSingle(), "Get article");
    return row ? fromRow(row) : null;
  }
  return (await readLocal()).find((a) => a.id === id) ?? null;
}

export async function saveArticle(input: Partial<Article> & { title: string }, id?: string): Promise<Article> {
  const all = await listArticles({ includeDrafts: true });

  if (id) {
    const current = all.find((a) => a.id === id);
    if (!current) throw new Error("Not found");
    const merged: Article = { ...current, ...input, id: current.id, slug: current.slug };
    if (hasSupabase()) {
      const row = must(await supabase().from("articles").update(toRow(merged)).eq("id", id).select().single(), "Update article");
      return fromRow(row);
    }
    await writeLocal(all.map((a) => (a.id === id ? merged : a)));
    return merged;
  }

  let slug = slugify(input.title);
  while (all.some((a) => a.slug === slug)) slug += "-" + Math.random().toString(36).slice(2, 5);
  const article: Article = {
    id: slug,
    slug,
    order: input.order ?? Math.max(0, ...all.map((a) => a.order)) + 1,
    title: input.title,
    subtitle: input.subtitle ?? "",
    author: input.author ?? "",
    publisher: input.publisher ?? "",
    year: input.year ?? null,
    pages: input.pages ?? null,
    summary: input.summary ?? "",
    category: input.category ?? "",
    cover: input.cover ?? "",
    file: input.file ?? "",
    sizeMb: input.sizeMb ?? 0,
    published: input.published ?? true,
    createdAt: new Date().toISOString(),
  };
  if (hasSupabase()) {
    return fromRow(must(await supabase().from("articles").insert(toRow(article)).select().single(), "Create article"));
  }
  await writeLocal([...all, article]);
  return article;
}

export async function deleteArticle(id: string) {
  if (hasSupabase()) {
    maybe(await supabase().from("articles").delete().eq("id", id), "Delete article");
    return;
  }
  await writeLocal((await readLocal()).filter((a) => a.id !== id));
}
