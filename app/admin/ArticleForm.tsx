"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Article } from "@/lib/types";

const input = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-mint";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">{label}</span>
      {children}
    </label>
  );
}

export default function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();
  const [preview, setPreview] = useState(article?.cover ?? "");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  /** Ask the server where to put the file, then PUT it there directly (with progress). */
  const upload = async (file: File, kind: "covers" | "books", from: number, to: number) => {
    const res = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, filename: file.name, type: file.type, size: file.size }),
    });
    const target = await res.json();
    if (!res.ok) throw new Error(target.error ?? "Upload failed");
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", target.uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.setRequestHeader("x-upsert", "false");
      xhr.upload.onprogress = (ev) => ev.lengthComputable && setProgress(Math.round(from + (ev.loaded / ev.total) * (to - from)));
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(file);
    });
    return target.stored as string;
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const cover = form.get("cover");
    const pdf = form.get("pdf");
    const hasCover = cover instanceof File && cover.size > 0;
    const hasPdf = pdf instanceof File && pdf.size > 0;
    if (!article && !hasCover) return setError("Please choose a cover image");
    setProgress(0);
    try {
      const body: Record<string, unknown> = Object.fromEntries(["title", "subtitle", "author", "publisher", "category", "summary", "year", "pages", "order"].map((k) => [k, form.get(k)]));
      body.published = form.get("published") === "on";
      if (hasCover) body.cover = await upload(cover, "covers", 0, hasPdf ? 10 : 95);
      if (hasPdf) {
        body.file = await upload(pdf, "books", hasCover ? 10 : 0, 95);
        body.sizeMb = pdf.size / 1048576;
      }
      const res = await fetch(article ? `/api/admin/articles/${encodeURIComponent(article.id)}` : "/api/admin/articles", {
        method: article ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const saved = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(saved.error ?? "Save failed");
      setProgress(100);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setProgress(null);
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-8 md:grid-cols-[240px_1fr]">
      <div>
        <Field label="Cover image (high resolution)">
          <div className="relative mb-3 aspect-[640/900] overflow-hidden rounded-xl border border-dashed border-white/25 bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-xs text-white/40">No cover</span>}
          </div>
          <input type="file" name="cover" accept="image/webp,image/png,image/jpeg,image/avif" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)); }} className="text-xs text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/15 file:px-3 file:py-1.5 file:text-white" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" className="sm:col-span-2"><input name="title" required defaultValue={article?.title} className={input} /></Field>
        <Field label="Subtitle" className="sm:col-span-2"><input name="subtitle" defaultValue={article?.subtitle} className={input} /></Field>
        <Field label="Author"><input name="author" defaultValue={article?.author} className={input} /></Field>
        <Field label="Publisher"><input name="publisher" defaultValue={article?.publisher} className={input} /></Field>
        <Field label="Category"><input name="category" defaultValue={article?.category} placeholder="e.g. hepatology" className={input} /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Year"><input name="year" type="number" defaultValue={article?.year ?? ""} className={input} /></Field>
          <Field label="Pages"><input name="pages" type="number" defaultValue={article?.pages ?? ""} className={input} /></Field>
          <Field label="Order"><input name="order" type="number" defaultValue={article?.order ?? ""} className={input} /></Field>
        </div>
        <Field label="Short summary" className="sm:col-span-2"><textarea name="summary" rows={4} defaultValue={article?.summary} className={input} /></Field>
        <Field label={article?.file ? `Replace PDF (current: ${article.sizeMb} MB)` : "Article PDF"} className="sm:col-span-2">
          <input type="file" name="pdf" accept="application/pdf" className="text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/15 file:px-3 file:py-1.5 file:text-white" />
        </Field>
        <label className="flex items-center gap-3 text-sm sm:col-span-2">
          <input type="checkbox" name="published" defaultChecked={article?.published ?? true} className="h-4 w-4 accent-[#1fb5a5]" /> Published
        </label>

        {error && <p className="text-sm text-signal sm:col-span-2">{error}</p>}
        <div className="flex items-center gap-4 sm:col-span-2">
          <button disabled={progress !== null} className="rounded-full bg-mint px-8 py-3 font-display font-extrabold italic text-abyss hover:bg-white disabled:opacity-60">
            {progress !== null ? `Uploading ${progress}%` : article ? "Save changes" : "Create article"}
          </button>
          {progress !== null && <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-mint transition-all" style={{ width: `${progress}%` }} /></div>}
        </div>
      </div>
    </form>
  );
}
