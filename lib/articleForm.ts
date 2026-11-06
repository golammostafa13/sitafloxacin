import "server-only";
import type { Article } from "./types";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

/** Article fields from the admin form's JSON (files are already uploaded; only their URL/key arrives). */
export function fieldsFromJson(body: Record<string, unknown>) {
  const fields: Partial<Article> & { title: string } = {
    title: str(body.title),
    subtitle: str(body.subtitle),
    author: str(body.author),
    publisher: str(body.publisher),
    category: str(body.category).toLowerCase(),
    summary: str(body.summary),
    year: num(body.year),
    pages: num(body.pages),
    published: Boolean(body.published),
  };
  const order = num(body.order);
  if (order) fields.order = order;
  const cover = str(body.cover);
  if (cover) {
    if (!/^(https:\/\/|\/media\/covers\/|\/covers\/)/.test(cover)) throw new Error("Invalid cover");
    fields.cover = cover;
  }
  const file = str(body.file);
  if (file) {
    if (!/^[\w.-]+\.pdf$/i.test(file)) throw new Error("Invalid file");
    fields.file = file;
    fields.sizeMb = Math.round(Number(body.sizeMb ?? 0) * 10) / 10;
  }
  return fields;
}
