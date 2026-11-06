import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteArticle, getArticleById, saveArticle } from "@/lib/store";
import { fieldsFromJson } from "@/lib/articleForm";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!(await getArticleById(id))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const fields = fieldsFromJson((await req.json()) as Record<string, unknown>);
    if (!fields.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    return NextResponse.json(await saveArticle(fields, id));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}

/** Quick toggle from the list: { published: boolean } */
export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const current = await getArticleById(id);
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = (await req.json()) as { published?: boolean };
  return NextResponse.json(await saveArticle({ title: current.title, published: !!body.published }, id));
}

export async function DELETE(_: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await deleteArticle((await params).id);
  return NextResponse.json({ ok: true });
}
