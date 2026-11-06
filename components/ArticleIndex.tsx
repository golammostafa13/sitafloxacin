"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import type { Article } from "@/lib/types";

export default function ArticleIndex({ articles }: { articles: Article[] }) {
  const [active, setActive] = useState<Article | null>(null);
  const [filter, setFilter] = useState("all");
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 180, damping: 22, mass: 0.6 });
  const rotate = useSpring(0, { stiffness: 120, damping: 14 });

  const pointer = useRef<{ x: number; y: number } | null>(null);

  // Preview half-size (w-56 cover ≈ 224×315) + margin, so it never leaves the window.
  const place = (cx: number, cy: number) => {
    x.set(Math.min(Math.max(cx, 140), window.innerWidth - 140));
    y.set(Math.min(Math.max(cy, 200), window.innerHeight - 190));
  };

  // Scrolling moves rows under a still cursor: re-pick the row under it.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame || !pointer.current) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const p = pointer.current;
        if (!p) return;
        const row = document.elementFromPoint(p.x, p.y)?.closest<HTMLElement>("[data-article]");
        const next = row ? articles.find((a) => a.id === row.dataset.article) ?? null : null;
        setActive((cur) => (cur?.id === next?.id ? cur : next));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [articles]);

  const categories = useMemo(() => ["all", ...Array.from(new Set(articles.map((a) => a.category).filter(Boolean)))], [articles]);
  const shown = filter === "all" ? articles : articles.filter((a) => a.category === filter);

  return (
    <div
      className="relative"
      onPointerMove={(e) => {
        rotate.set(Math.max(-12, Math.min(12, (e.clientX - x.get()) * 0.15)));
        pointer.current = { x: e.clientX, y: e.clientY };
        place(e.clientX, e.clientY);
      }}
      onPointerLeave={() => {
        pointer.current = null;
        setActive(null);
      }}
    >
      <div className="mb-10 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize tracking-wide transition ${filter === c ? "bg-aqua text-white shadow-[0_0_20px_rgba(31,181,165,.6)]" : "glass text-white/75 hover:text-white"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="border-t border-white/15">
        {shown.map((a) => (
          <li key={a.id} data-article={a.id} onPointerEnter={() => setActive(a)}>
            <Link
              href={`/articles/${a.slug}`}
              className="group grid grid-cols-[auto_1fr] items-center gap-4 border-b border-white/15 py-5 sm:grid-cols-[4rem_1fr_auto] sm:gap-8 sm:py-7"
            >
              <span className="font-display text-sm font-bold text-mint/80 tabular-nums">{String(a.order).padStart(2, "0")}</span>
              <span className="flex items-center gap-4">
                <Image src={a.cover} alt="" width={56} height={78} className="h-16 w-auto rounded-md shadow-lg sm:hidden" />
                <span>
                  <span className="block font-display text-[clamp(1.25rem,5.5vw,3rem)] font-extrabold italic leading-tight [overflow-wrap:anywhere] text-white transition duration-500 group-hover:translate-x-3 group-hover:text-mint">
                    {a.title}
                  </span>
                  {a.subtitle && <span className="mt-1 block text-sm text-white/55 sm:text-base">{a.subtitle}</span>}
                </span>
              </span>
              <span className="hidden text-right text-xs font-semibold uppercase tracking-[0.2em] text-white/45 sm:block">
                {a.category}
                {a.year ? <span className="block text-white/30">{a.year}</span> : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Floating cover that follows the cursor (desktop) */}
      <motion.div className="pointer-events-none fixed left-0 top-0 z-30 hidden md:block" style={{ x: sx, y: sy, rotate }}>
        <AnimatePresence mode="popLayout">
          {active && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 0.6, rotateY: -35 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotateY: 30 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]"
            >
              <div className="absolute -inset-8 rounded-full bg-aqua/40 blur-3xl" />
              <Image src={active.cover} alt="" width={260} height={366} className="relative w-56 rounded-lg shadow-[0_40px_80px_-20px_rgba(0,0,0,.8)] ring-1 ring-white/30" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
