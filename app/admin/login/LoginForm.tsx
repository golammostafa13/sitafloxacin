"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="glass w-full max-w-sm rounded-3xl p-8">
      <h1 className="mb-6 font-display text-3xl font-black italic text-white">Admin</h1>
      <input
        type="email"
        name="email"
        required
        autoFocus
        autoComplete="username"
        placeholder="Email"
        className="mb-3 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-mint"
      />
      <input
        type="password"
        name="password"
        required
        autoComplete="current-password"
        placeholder="Password"
        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-mint"
      />
      {error && <p className="mt-3 text-sm text-signal">{error}</p>}
      <button disabled={pending} className="mt-6 w-full rounded-xl bg-mint py-3 font-display font-extrabold italic text-abyss transition hover:bg-white disabled:opacity-60">
        {pending ? "…" : "Sign in"}
      </button>
    </form>
  );
}
