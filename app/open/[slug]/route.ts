import type { NextRequest } from "next/server";
import { openRedirect } from "@/lib/open";

/** The per-article QR address: opens that article, via Sign in / Sign up when needed. */
export async function GET(req: NextRequest, ctx: RouteContext<"/open/[slug]">) {
  const { slug } = await ctx.params;
  return openRedirect(req, `/articles/${encodeURIComponent(slug)}`);
}
