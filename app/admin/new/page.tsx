import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import AdminShell from "../AdminShell";
import ArticleForm from "../ArticleForm";

export const metadata = { title: "New article" };

export default async function NewArticle() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminShell title="New article"><ArticleForm /></AdminShell>;
}
