import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { saveArticle } from "@/lib/store";
import { fieldsFromJson } from "@/lib/articleForm";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const fields = fieldsFromJson((await req.json()) as Record<string, unknown>);
    if (!fields.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!fields.cover) return NextResponse.json({ error: "Cover image is required" }, { status: 400 });
    const article = await saveArticle(fields);
    return NextResponse.json(article);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}
