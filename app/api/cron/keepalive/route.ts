import { NextResponse } from "next/server";
import { hasSupabase, must, supabase } from "@/lib/supabase";

/**
 * Keep-alive for the free Supabase project, which pauses after 7 days without
 * activity. Called daily by Vercel Cron (vercel.json) and every 2 days by a
 * GitHub Action as a backup. It does a real write and a real read, so the
 * database always has recent activity.
 *
 * Protected by CRON_SECRET: Vercel Cron sends it as "Authorization: Bearer <secret>".
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasSupabase()) return NextResponse.json({ ok: false, reason: "Supabase not configured" }, { status: 503 });

  const source = req.headers.get("user-agent")?.includes("vercel-cron") ? "vercel-cron" : "external";
  const db = supabase();
  must(await db.from("sage_heartbeat").upsert({ id: 1, pinged_at: new Date().toISOString(), source }).select(), "Heartbeat write");
  const { count, error } = await db.from("articles").select("id", { count: "exact", head: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  // touch storage too
  await db.storage.from("covers").list("", { limit: 1 });

  return NextResponse.json({ ok: true, source, articles: count, at: new Date().toISOString() });
}
