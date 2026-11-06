import clsx from "clsx";

export const inputClass = (invalid?: boolean) =>
  clsx("w-full rounded-xl border bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-mint [color-scheme:dark]", invalid ? "border-signal" : "border-white/15");

export function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/55">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-[#ff7a80]">{error}</span>}
    </div>
  );
}

export function safeNext(next: string | undefined | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
