import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { isKnownBrowser, readerId } from "@/lib/auth";

/**
 * Where a scanned QR code lands: signed in → `dest`; this browser has an
 * account → Sign in; otherwise → Sign up. Both forms return to `dest` after.
 */
export async function openRedirect(req: Request, dest: string) {
  const back = dest === "/" ? "" : `?next=${encodeURIComponent(dest)}`;
  const to = (await readerId()) ? dest : (await isKnownBrowser()) ? `/signin${back}` : `/signup${back}`;
  return NextResponse.redirect(new URL(to, req.url), { status: 307 });
}

/** The public address printed in QR codes: SITE_URL if set, else the domain this request came in on. */
export async function siteOrigin() {
  const fixed = process.env.SITE_URL?.replace(/\/+$/, "");
  if (fixed) return fixed;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
