import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getArticleById } from "@/lib/store";
import AdminShell from "../AdminShell";
import ArticleForm from "../ArticleForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit article" };

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const article = await getArticleById(decodeURIComponent((await params).id));
  if (!article) notFound();
  return <AdminShell title="Edit article"><ArticleForm article={article} /></AdminShell>;
}
