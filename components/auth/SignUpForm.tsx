"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import Combobox from "./Combobox";
import { Field, inputClass, safeNext } from "./fields";
import { districts, thanasOf } from "@/lib/data/bd-geo";
import { parseProfile, type ProfileErrors } from "@/lib/profile";

export default function SignUpForm({ next }: { next?: string }) {
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const districtOptions = useMemo(
    () => districts.map((d) => ({ id: d.id, label: d.name, hint: d.division, search: [d.nameBn, ...(d.aliases ?? [])].join(" ") })),
    [],
  );
  const thanaOptions = useMemo(
    () => thanasOf(district).map((t) => ({ id: t.id, label: t.name, hint: t.metro ? "City" : undefined, search: [t.nameBn, ...(t.aliases ?? [])].join(" ") })),
    [district],
  );

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const checked = parseProfile(data);
    if (!checked.ok) {
      setErrors(checked.errors);
      return;
    }
    setErrors({});
    setBusy(true);
    const res = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      location.assign(safeNext(next));
      return;
    }
    setBusy(false);
    setErrors(body.fields ?? {});
    setMessage(body.error ?? "Something went wrong");
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name" error={errors.name} className="sm:col-span-2">
        <input name="name" autoComplete="name" className={inputClass(!!errors.name)} />
      </Field>
      <Field label="Mobile" error={errors.phone}>
        <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" className={inputClass(!!errors.phone)} />
      </Field>
      <Field label="Email" error={errors.email}>
        <input name="email" type="email" autoComplete="email" placeholder="you@example.com" className={inputClass(!!errors.email)} />
      </Field>
      <Field label="District" error={errors.district}>
        <Combobox name="district" options={districtOptions} value={district} onChange={(id) => { setDistrict(id); setThana(""); }} placeholder="Search district" invalid={!!errors.district} />
      </Field>
      <Field label="Thana / City" error={errors.thana}>
        <Combobox name="thana" options={thanaOptions} value={thana} onChange={setThana} placeholder={district ? "Search thana" : "Choose district first"} disabled={!district} invalid={!!errors.thana} />
      </Field>
      <Field label="Date of birth" error={errors.dob}>
        <input name="dob" type="date" max={today} className={inputClass(!!errors.dob)} />
      </Field>
      <Field label="Gender" error={errors.gender}>
        <input type="hidden" name="gender" value={gender} />
        <div className="grid grid-cols-2 gap-2">
          {(["male", "female"] as const).map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => setGender(g)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition ${gender === g ? "border-mint bg-aqua/25 text-white" : errors.gender ? "border-signal text-white/70" : "border-white/15 text-white/70 hover:border-white/40"}`}
            >
              {g}
            </button>
          ))}
        </div>
      </Field>

      {message && <p className="text-sm text-[#ff7a80] sm:col-span-2">{message}</p>}
      <button disabled={busy} className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-mint py-3.5 font-display font-extrabold italic text-abyss shadow-[0_0_30px_rgba(95,224,207,.45)] transition hover:bg-white disabled:opacity-60 sm:col-span-2">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account
      </button>
      <p className="text-center text-sm text-white/60 sm:col-span-2">
        Already have an account?{" "}
        <Link href={`/signin${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-mint hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
