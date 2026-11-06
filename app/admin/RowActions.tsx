"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

export default function RowActions({ id, published, title }: { id: string; published: boolean; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const call = async (method: string, body?: object) => {
    setBusy(true);
    await fetch(`/api/admin/articles/${encodeURIComponent(id)}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    setBusy(false);
    router.refresh();
  };
  const Status = published ? Eye : EyeOff;
  return (
    <div className="flex items-center gap-1.5">
      <button
        disabled={busy}
        onClick={() => call("PATCH", { published: !published })}
        title={published ? "Published: click to make draft" : "Draft: click to publish"}
        className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold disabled:opacity-50 ${published ? "bg-aqua/20 text-mint" : "bg-white/10 text-white/50"}`}
      >
        <Status className="h-3.5 w-3.5" /> {published ? "Published" : "Draft"}
      </button>
      <Link href={`/admin/${encodeURIComponent(id)}`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label="Edit" title="Edit">
        <Pencil className="h-4 w-4" />
      </Link>
      <button disabled={busy} onClick={() => confirm(`Delete "${title}"?`) && call("DELETE")} className="grid h-9 w-9 place-items-center rounded-full text-signal hover:bg-signal/10" aria-label="Delete" title="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
