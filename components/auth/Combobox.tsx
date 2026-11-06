"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

export type Option = { id: string; label: string; hint?: string; search?: string };

/** A small searchable select (type to filter, arrows + Enter to pick). */
export default function Combobox({
  name, options, value, onChange, placeholder, disabled, invalid,
}: { name: string; options: Option[]; value: string; onChange: (id: string) => void; placeholder: string; disabled?: boolean; invalid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const selected = options.find((o) => o.id === value);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => (o.label + " " + (o.hint ?? "") + " " + (o.search ?? "")).toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    const close = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  useEffect(() => {
    list.current?.children[cursor]?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const pick = (o: Option) => {
    onChange(o.id);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={box} className="relative">
      <input type="hidden" name={name} value={value} />
      <div className={clsx("flex items-center rounded-xl border bg-white/5 transition focus-within:border-mint", invalid ? "border-signal" : "border-white/15", disabled && "opacity-50")}>
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          value={open ? query : selected?.label ?? ""}
          placeholder={selected?.label ?? placeholder}
          onFocus={() => { setOpen(true); setCursor(0); }}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setCursor(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setCursor((c) => Math.min(c + 1, shown.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
            else if (e.key === "Enter" && open && shown[cursor]) { e.preventDefault(); pick(shown[cursor]); }
            else if (e.key === "Escape") setOpen(false);
          }}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder:text-white/40"
        />
        <ChevronDown className={clsx("mr-3 h-4 w-4 text-white/50 transition", open && "rotate-180")} />
      </div>
      {open && !disabled && (
        <ul ref={list} data-lenis-prevent className="absolute z-30 mt-2 max-h-60 w-full overflow-auto overscroll-contain rounded-xl border border-white/15 bg-ink/95 p-1 shadow-2xl backdrop-blur-xl">
          {shown.length === 0 && <li className="px-3 py-2 text-sm text-white/50">No match</li>}
          {shown.map((o, i) => (
            <li
              key={o.id}
              onPointerDown={(e) => { e.preventDefault(); pick(o); }}
              onPointerEnter={() => setCursor(i)}
              className={clsx("flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm", i === cursor ? "bg-aqua/25 text-white" : "text-white/80", o.id === value && "font-semibold text-mint")}
            >
              {o.label}
              {o.hint && <span className="text-xs text-white/40">{o.hint}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
