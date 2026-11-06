"use client";

import { useEffect, useRef, useState } from "react";
import { getLenis } from "./SmoothScroll";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Stacked, pinned sections in the style of flshfrm.com: each panel sticks
 * while the next one slides up over it; the outgoing panel eases back
 * (scale + dim + lift) and the incoming one rounds its top corners and
 * drifts its content up. Everything is driven by two CSS variables per panel
 * (--arrive, --leave), written once per frame, so React never re-renders on scroll.
 */
export default function Stack({ children, dots = true }: { children: React.ReactNode; dots?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const panels = Array.from(el.querySelectorAll<HTMLElement>(":scope > [data-panel]"));
    setIds(panels.filter((p) => p.hasAttribute("data-dot")).map((p) => p.dataset.id!));

    let vh = window.innerHeight;
    let heights: number[] = [];

    // Panels taller than the screen stick by their bottom edge, so all of
    // their content is seen before the next panel covers them.
    const layout = () => {
      vh = window.innerHeight;
      heights = panels.map((p) => p.offsetHeight);
      panels.forEach((p, i) => {
        p.style.top = `${Math.min(0, vh - heights[i])}px`;
        p.style.setProperty("--origin", `${Math.max(vh / 2, heights[i] - vh / 2)}px`);
      });
    };

    let lastActive = -1;
    let frame = 0;
    const update = () => {
      frame = 0;
      const tops = panels.map((p) => p.getBoundingClientRect().top);
      let current = 0;
      panels.forEach((p, i) => {
        // A panel has "arrived" once its top edge reaches the top of the screen
        // (tall panels then scroll normally until they pin by their bottom edge),
        // and it "leaves" as the next panel's top edge climbs over it.
        const arrive = i === 0 ? 1 : clamp(1 - Math.max(0, tops[i]) / vh);
        const next = panels[i + 1];
        const leave = next ? clamp(1 - Math.max(0, tops[i + 1]) / vh) : 0;
        if (reduce) return;
        p.style.setProperty("--arrive", arrive.toFixed(4));
        p.style.setProperty("--leave", leave.toFixed(4));
        // transforms create a containing block (breaks position:fixed inside),
        // so only apply them while the panel is actually moving
        p.toggleAttribute("data-moving", arrive < 0.999 || leave > 0.001);
        const covered = leave > 0.995;
        if (covered !== p.hasAttribute("data-covered")) p.toggleAttribute("data-covered", covered);
        if (tops[i] < vh * 0.5) current = i;
      });
      const dotIndex = panels.slice(0, current + 1).filter((p) => p.hasAttribute("data-dot")).length - 1;
      if (dotIndex !== lastActive) {
        lastActive = dotIndex;
        setActive(Math.max(0, dotIndex));
      }
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    layout();
    update();
    const ro = new ResizeObserver(() => {
      layout();
      request();
    });
    panels.forEach((p) => ro.observe(p));
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      cancelAnimationFrame(frame);
    };
  }, []);

  const go = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
    else target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={root} className="relative">
      {children}
      {dots && ids.length > 1 && (
        <nav className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex" aria-label="Sections">
          {ids.map((id, i) => (
            <button
              key={id}
              onClick={() => go(id)}
              aria-label={`Go to ${id}`}
              className={`block w-2.5 rounded-full transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${active === i ? "h-9 bg-mint shadow-[0_0_14px_rgba(95,224,207,.9)]" : "h-2.5 bg-white/35 hover:bg-white/70"}`}
            />
          ))}
        </nav>
      )}
    </div>
  );
}
