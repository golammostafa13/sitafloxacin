import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { listArticles } from "@/lib/store";
import AdminShell from "./AdminShell";
import RowActions from "./RowActions";
import QrDownload from "@/components/admin/QrDownload";
import { siteOrigin } from "@/lib/open";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [articles, origin] = await Promise.all([listArticles({ includeDrafts: true }), siteOrigin()]);
  return (
    <AdminShell title={`Articles (${articles.length})`}>
      <Link href="/admin/new" className="mb-6 inline-flex items-center gap-2 rounded-full bg-mint px-5 py-2.5 font-display text-sm font-extrabold italic text-abyss hover:bg-white">
        <Plus className="h-4 w-4" /> New article
      </Link>
      <div className="mb-6 ml-3 inline-flex flex-wrap items-center gap-3">
        <QrDownload url={`${origin}/open`} filename="qr-sage-manual" label="Card QR" />
        <span className="text-xs text-white/45">QR codes point to <span className="text-white/70">{origin}</span></span>
      </div>
      <ul className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {articles.map((a) => (
          <li key={a.id} className="flex items-center gap-4 px-4 py-3">
            <span className="w-7 text-right text-xs tabular-nums text-white/40">{a.order}</span>
            {a.cover ? <Image src={a.cover} alt="" width={40} height={56} className="h-14 w-10 rounded object-cover" /> : <span className="h-14 w-10 rounded bg-white/10" />}
            <div className="min-w-0 flex-1">
              <Link href={`/articles/${a.slug}`} target="_blank" className="block truncate font-semibold hover:text-mint">{a.title}</Link>
              <p className="truncate text-xs text-white/45">{[a.category, a.year, a.file ? `${a.sizeMb} MB PDF` : "no PDF"].filter(Boolean).join(" · ")}</p>
            </div>
            <QrDownload url={`${origin}/open/${a.slug}`} filename={`qr-${a.slug}`} label="QR" />
            <RowActions id={a.id} published={a.published} title={a.title} />
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
