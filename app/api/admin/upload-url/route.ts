import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { uploadTarget, validateUpload, type Kind } from "@/lib/files";

// Admin asks where to upload a file; the browser then PUTs it straight to storage
// (so big PDFs never pass through a Vercel function and its 4.5 MB body limit).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { kind?: string; filename?: string; type?: string; size?: number } | null;
  const kind = body?.kind as Kind;
  if (!body || (kind !== "covers" && kind !== "books") || !body.filename) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const invalid = validateUpload(kind, String(body.type ?? ""), Number(body.size ?? 0));
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
  try {
    return NextResponse.json(await uploadTarget(kind, body.filename));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
  }
}
