"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Field, inputClass, safeNext } from "./fields";

export default function SignInForm({ next }: { next?: string }) {
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setNotFound(false);
    setBusy(true);
    const identifier = String(new FormData(e.currentTarget).get("identifier") ?? "");
    const res = await fetch("/api/auth/signin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier }) });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      location.assign(safeNext(next));
      return;
    }
    setBusy(false);
    setError(body.error ?? "Something went wrong");
    setNotFound(!!body.notFound);
  };

  const signupHref = `/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <Field label="Email or mobile" error={error}>
        <input name="identifier" autoComplete="username" autoFocus placeholder="you@example.com or 01XXXXXXXXX" className={inputClass(!!error)} />
      </Field>
      {notFound && (
        <Link href={signupHref} className="rounded-xl border border-mint/50 px-4 py-2.5 text-center text-sm font-semibold text-mint hover:bg-mint/10">Create an account</Link>
      )}
      <button disabled={busy} className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-mint py-3.5 font-display font-extrabold italic text-abyss shadow-[0_0_30px_rgba(95,224,207,.45)] transition hover:bg-white disabled:opacity-60">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
      </button>
      <p className="text-center text-sm text-white/60">
        New here? <Link href={signupHref} className="font-semibold text-mint hover:underline">Sign up</Link>
      </p>
    </form>
  );
}
