"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function RowActions({ id, published, title }: { id: string; published: boolean; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const call = async (method: string, body?: object) => {
    setBusy(true);
    await fetch(`/api/admin/articles/${encodeURIComponent(id)}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    setBusy(false);
    router.refresh();
  };
  return (
    <div className="flex items-center gap-2">
      <button
        disabled={busy}
        onClick={() => call("PATCH", { published: !published })}
        className={`rounded-full px-3 py-1 text-xs font-semibold ${published ? "bg-aqua/20 text-mint" : "bg-white/10 text-white/50"}`}
      >
        {published ? "Published" : "Draft"}
      </button>
      <Link href={`/admin/${encodeURIComponent(id)}`} className="rounded-full p-2 hover:bg-white/10" aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
      <button disabled={busy} onClick={() => confirm(`Delete "${title}"?`) && call("DELETE")} className="rounded-full p-2 text-signal hover:bg-signal/10" aria-label="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
