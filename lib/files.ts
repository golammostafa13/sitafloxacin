import "server-only";
import path from "node:path";
import { BUCKET_ARTICLES, BUCKET_COVERS, hasSupabase, must, supabase } from "./supabase";
import { slugify } from "./store";

/**
 * File storage. Supabase Storage when configured (public "covers" bucket,
 * private "articles" bucket); otherwise local files under storage/uploads.
 */

export type Kind = "covers" | "books";

const READ_TTL = 60 * 60 * 2; // signed PDF links last 2 hours

const IMAGE_TYPES = ["image/webp", "image/png", "image/jpeg", "image/avif"];
export function validateUpload(kind: Kind, type: string, size: number) {
  if (kind === "covers" && !IMAGE_TYPES.includes(type)) return "Cover must be a WebP, PNG, JPEG or AVIF image";
  if (kind === "covers" && size > 10 * 1024 * 1024) return "Cover must be under 10 MB";
  if (kind === "books" && type !== "application/pdf") return "Article file must be a PDF";
  if (kind === "books" && size > 50 * 1024 * 1024) return "PDF must be under 50 MB (Supabase free plan limit)";
  return null;
}

function objectKey(filename: string) {
  const ext = path.extname(filename).toLowerCase().replace(/[^.\w]/g, "");
  return `${Date.now()}-${slugify(path.basename(filename, ext))}${ext}`;
}

/**
 * Where the browser should PUT a new upload, and what to store afterwards.
 * `stored` is the cover URL (covers) or the object key (PDFs).
 */
export async function uploadTarget(kind: Kind, filename: string) {
  const key = objectKey(filename);
  if (hasSupabase()) {
    const bucket = kind === "covers" ? BUCKET_COVERS : BUCKET_ARTICLES;
    const signed = must(await supabase().storage.from(bucket).createSignedUploadUrl(key), "Create upload URL");
    const stored = kind === "covers" ? supabase().storage.from(BUCKET_COVERS).getPublicUrl(key).data.publicUrl : key;
    return { uploadUrl: signed.signedUrl, stored };
  }
  return {
    uploadUrl: `/api/admin/local-upload?kind=${kind}&key=${encodeURIComponent(key)}`,
    stored: kind === "covers" ? `/media/covers/${key}` : key,
  };
}

/** A URL the PDF reader can open (signed + short-lived on Supabase). */
export async function readUrl(fileKey: string) {
  if (hasSupabase()) {
    return must(await supabase().storage.from(BUCKET_ARTICLES).createSignedUrl(fileKey, READ_TTL), "Sign article URL").signedUrl;
  }
  return `/media/books/${encodeURIComponent(fileKey)}`;
}
