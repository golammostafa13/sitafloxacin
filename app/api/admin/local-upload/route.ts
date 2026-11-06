import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { UPLOADS } from "@/lib/store";
import { hasSupabase } from "@/lib/supabase";

// Development only: stands in for Supabase's signed upload URL.
export async function PUT(req: Request) {
  if (hasSupabase()) return NextResponse.json({ error: "Not available" }, { status: 404 });
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const key = url.searchParams.get("key") ?? "";
  if ((kind !== "covers" && kind !== "books") || !/^[\w.-]+$/.test(key)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const dir = path.join(UPLOADS, kind);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, key), Buffer.from(await req.arrayBuffer()));
  return NextResponse.json({ ok: true });
}
