import { NextResponse } from "next/server";
import { canRead } from "@/lib/auth";
import { getArticle } from "@/lib/store";
import { readUrl } from "@/lib/files";

// Gives a signed-in reader a short-lived link to an article's PDF.
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const noStore = { "Cache-Control": "no-store, private" };
  if (!(await canRead())) return NextResponse.json({ error: "Please sign in to read" }, { status: 401, headers: noStore });
  const article = await getArticle((await params).slug);
  if (!article || !article.published || !article.file) return NextResponse.json({ error: "Not found" }, { status: 404, headers: noStore });
  return NextResponse.json({ url: await readUrl(article.file) }, { headers: noStore });
}
