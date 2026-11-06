import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { UPLOADS } from "@/lib/store";
import { canRead } from "@/lib/auth";

const TYPES: Record<string, string> = { ".pdf": "application/pdf", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".avif": "image/avif", ".gif": "image/gif" };

// Serves admin uploads (with Range support so the PDF reader can fetch pieces).
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  // Article PDFs are for signed-in readers only; covers are public.
  if (parts[0] === "books" && !(await canRead())) return new Response("Sign in to read", { status: 401 });
  const rel = parts.join("/");
  const file = path.resolve(UPLOADS, rel);
  if (!file.startsWith(UPLOADS + path.sep) || !fs.existsSync(file)) return new Response("Not found", { status: 404 });
  const size = fs.statSync(file).size;
  const type = TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream";
  const headers = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": parts[0] === "books" ? "private, max-age=3600" : "public, max-age=31536000, immutable" };
  const range = req.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
  if (range) {
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    const stream = Readable.toWeb(fs.createReadStream(file, { start, end })) as ReadableStream;
    return new Response(stream, { status: 206, headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) } });
  }
  return new Response(Readable.toWeb(fs.createReadStream(file)) as ReadableStream, { headers: { ...headers, "Content-Length": String(size) } });
}
