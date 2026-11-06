import { NextResponse } from "next/server";
import { isKnownBrowser, readerId } from "@/lib/auth";

/**
 * The address printed as the QR code on the Sitamax card. It never renders:
 * signed in → home; this browser has an account → Sign in; otherwise → Sign up.
 */
export async function GET(req: Request) {
  const to = (await readerId()) ? "/" : (await isKnownBrowser()) ? "/signin" : "/signup";
  return NextResponse.redirect(new URL(to, req.url), { status: 307 });
}
