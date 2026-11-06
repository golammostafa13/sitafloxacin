"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "motion/react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import Lenis from "lenis";
import { ChevronDown, ChevronUp, Clock, Flame, Loader2, Minus, Plus, X } from "lucide-react";
import { getLenis } from "./stack/SmoothScroll";
import ReaderPage from "./reader/ReaderPage";
import { Milestone, ProgressRing, RailCover, RollingNumber, SponsorBreak } from "./reader/ReaderBits";
import SponsorSparkle from "./SponsorSparkle";

const MILESTONES = [10, 25, 50, 75, 100];
const SPONSOR_EVERY = 20;

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjs;
}

const store = {
  get<T>(k: string, fallback: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};

const fmtTime = (s: number) => (s >= 3600 ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);

type Props = { src: string; title: string; cover?: string; author?: string; onClose: () => void };

export default function PdfReader({ src, title, cover, author, onClose }: Props) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const lenis = useRef<Lenis | null>(null);
  const pages = useRef(new Map<number, HTMLDivElement>());

  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState("");
  const [loadPct, setLoadPct] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [base, setBase] = useState(0);
  const [aspect, setAspect] = useState(1.414);
  const [current, setCurrent] = useState(1);
  const [pct, setPct] = useState(0);
  const [furthest, setFurthest] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [resume, setResume] = useState<number | null>(null);
  const [milestone, setMilestone] = useState<{ pct: number; key: number } | null>(null);
  const [hoverPage, setHoverPage] = useState<number | null>(null);

  const progress = useMotionValue(0);
  const bar = useSpring(progress, { stiffness: 120, damping: 24 });
  const numPages = doc?.numPages ?? 0;
  const key = (k: string) => `sm:${k}:${src}`;

  /* ---------- open the PDF ---------- */
  useEffect(() => {
    let destroyed = false;
    let destroy: (() => unknown) | null = null;
    (async () => {
      try {
        // src is our /api/read/<slug> endpoint: it returns a short-lived signed link
        const res = await fetch(src, { cache: "no-store" });
        const link = await res.json().catch(() => ({}));
        if (!res.ok || !link.url) throw new Error(link.error ?? "Could not open the article");
        const pdfjs = await loadPdfjs();
        const task = pdfjs.getDocument({ url: link.url, disableAutoFetch: true, disableStream: true, rangeChunkSize: 1 << 20 });
        destroy = () => task.destroy();
        task.onProgress = ({ loaded, total }: { loaded: number; total: number }) => total && setLoadPct(Math.round((loaded / total) * 100));
        const loaded = await task.promise;
        if (destroyed) return;
        setDoc(loaded);
        const saved = store.get<{ page: number }>(key("last"), { page: 1 }).page;
        if (saved > 2 && saved <= loaded.numPages) setResume(saved);
        setSeconds(store.get(key("time"), 0));
      } catch (e) {
        if (!destroyed) setError(e instanceof Error ? e.message : "Could not open the article");
      }
    })();
    return () => {
      destroyed = true;
      destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  /* ---------- layout, body lock, pause the page's own smooth scroll ---------- */
  useEffect(() => {
    const measure = () => setBase(Math.min(860, (wrapper.current?.clientWidth ?? 800) - 40));
    measure();
    window.addEventListener("resize", measure);
    const outer = getLenis();
    outer?.stop();
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", measure);
      outer?.start();
      document.body.style.overflow = "";
    };
  }, []);

  /* ---------- smooth inertia scroll inside the reader ---------- */
  useEffect(() => {
    if (!doc || !wrapper.current || !content.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const l = new Lenis({ wrapper: wrapper.current, content: content.current, lerp: reduce ? 1 : 0.075, smoothWheel: !reduce, wheelMultiplier: 0.95 });
    lenis.current = l;
    let id = requestAnimationFrame(function raf(t) {
      l.raf(t);
      id = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(id);
      l.destroy();
      lenis.current = null;
    };
  }, [doc]);

  /* ---------- track current page + progress ---------- */
  useEffect(() => {
    const el = wrapper.current;
    if (!el || !doc) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? Math.min(1, el.scrollTop / max) : 0;
      progress.set(p);
      setPct(Math.round(p * 100));
      const mid = el.scrollTop + el.clientHeight * 0.45;
      let best = 1;
      for (const [n, node] of pages.current) {
        if (node.offsetTop <= mid) best = Math.max(best, n);
      }
      setCurrent(best);
      setFurthest((f) => Math.max(f, best));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [doc, progress]);

  /* ---------- remember position ---------- */
  useEffect(() => {
    if (!doc) return;
    const t = setTimeout(() => store.set(key("last"), { page: current }), 400);
    if (current > 2) setResume(null);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, doc]);

  /* ---------- milestones ---------- */
  useEffect(() => {
    if (!doc) return;
    const done = store.get<number[]>(key("ms"), []);
    const hit = MILESTONES.filter((m) => pct >= m && !done.includes(m)).pop();
    if (hit === undefined) return;
    store.set(key("ms"), [...done, ...MILESTONES.filter((m) => m <= hit && !done.includes(m))]);
    setMilestone({ pct: hit, key: Date.now() });
    const t = setTimeout(() => setMilestone(null), 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct, doc]);

  /* ---------- reading time ---------- */
  useEffect(() => {
    if (!doc) return;
    const t = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setSeconds((s) => {
        store.set(key("time"), s + 1);
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  const goTo = useCallback((n: number, immediate = false) => {
    const target = pages.current.get(Math.max(1, Math.min(n, doc?.numPages ?? 1)));
    if (!target) return;
    if (lenis.current) lenis.current.scrollTo(target, { offset: -24, duration: immediate ? 0 : 1.1, immediate, easing: (x) => 1 - Math.pow(1 - x, 4) });
    else target.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  }, [doc]);

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (["ArrowDown", "PageDown", "j", " "].includes(e.key)) { e.preventDefault(); goTo(current + 1); }
      else if (["ArrowUp", "PageUp", "k"].includes(e.key)) { e.preventDefault(); goTo(current - 1); }
      else if (e.key === "Home") { e.preventDefault(); goTo(1); }
      else if (e.key === "End") { e.preventDefault(); goTo(numPages); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, numPages, goTo, onClose]);

  const register = useCallback((n: number, el: HTMLDivElement | null) => {
    if (el) pages.current.set(n, el);
    else pages.current.delete(n);
  }, []);
  const onMeasure = useCallback((a: number) => setAspect((prev) => (Math.abs(prev - a) > 0.01 ? a : prev)), []);

  const width = Math.round(base * zoom);
  const ringValue = numPages ? current / numPages : 0;

  return (
    <motion.div
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-abyss text-white"
      role="dialog"
      aria-label={title}
    >
      {/* living background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#0b2a6f_0%,#030d26_65%)]" />
        <div className="hex-grid absolute inset-0 opacity-30" />
        <div className="absolute -left-40 top-1/4 h-[50vmax] w-[50vmax] animate-float rounded-full bg-royal/25 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[45vmax] w-[45vmax] animate-float rounded-full bg-aqua/20 blur-[120px] [animation-delay:-3s]" />
        {[12, 28, 46, 63, 81, 92].map((l, i) => (
          <span key={i} className="absolute h-3 w-9 animate-float rounded-full bg-sky/20 blur-[1px]" style={{ left: `${l}%`, top: `${(i * 37) % 90}%`, rotate: `${i * 40}deg`, animationDelay: `${-i * 1.3}s`, animationDuration: `${7 + i}s` }} />
        ))}
      </div>

      {/* top bar */}
      <div className="relative z-10 flex items-center gap-3 border-b border-white/10 bg-abyss/60 px-4 py-3 backdrop-blur-xl">
        <p className="min-w-0 flex-1 truncate font-display text-sm font-bold italic">{title}</p>
        {numPages > 0 && (
          <span className="hidden items-center gap-1 text-sm text-white/70 sm:flex">
            Page <RollingNumber value={current} className="font-bold text-mint" /> of {numPages}
          </span>
        )}
        <button onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} className="glass rounded-full p-2" aria-label="Zoom out"><Minus className="h-4 w-4" /></button>
        <span className="w-10 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))} className="glass rounded-full p-2" aria-label="Zoom in"><Plus className="h-4 w-4" /></button>
        <button onClick={onClose} className="rounded-full bg-white p-2 text-navy transition hover:rotate-90" aria-label="Close"><X className="h-4 w-4" /></button>
        <motion.div className="absolute inset-x-0 -bottom-px h-[3px] origin-left bg-gradient-to-r from-sky via-mint to-aqua shadow-[0_0_14px_#5fe0cf]" style={{ scaleX: bar }} />
      </div>

      <div className="relative z-10 grid min-h-0 flex-1 xl:grid-cols-[280px_minmax(0,1fr)_260px]">
        {/* left rail: the article + your stats */}
        <motion.aside
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="hidden flex-col items-center gap-6 overflow-y-auto border-r border-white/10 px-6 py-8 xl:flex"
        >
          <RailCover src={cover} title={title} />
          <div className="text-center">
            <p className="font-display text-lg font-extrabold italic leading-tight">{title}</p>
            {author && <p className="mt-1 text-xs text-white/50">{author}</p>}
          </div>
          <ProgressRing value={ringValue}>
            <div>
              <p className="font-display text-3xl font-black italic text-white">{numPages ? Math.round(ringValue * 100) : 0}%</p>
              <p className="text-[10px] uppercase tracking-widest text-white/45">read</p>
            </div>
          </ProgressRing>
          <div className="grid w-full grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-3 text-center">
              <Clock className="mx-auto mb-1 h-4 w-4 text-mint" />
              <p className="font-display text-lg font-extrabold tabular-nums">{fmtTime(seconds)}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/45">reading</p>
            </div>
            <div className="glass rounded-2xl p-3 text-center">
              <Flame className="mx-auto mb-1 h-4 w-4 text-[#ff9a5c]" />
              <p className="font-display text-lg font-extrabold tabular-nums">{furthest}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/45">furthest page</p>
            </div>
          </div>
          <div className="flex w-full flex-wrap justify-center gap-2">
            {MILESTONES.map((m) => (
              <span key={m} className={`rounded-full px-3 py-1 text-xs font-bold transition duration-700 ${pct >= m ? "bg-mint text-abyss shadow-[0_0_14px_rgba(95,224,207,.7)]" : "bg-white/5 text-white/35"}`}>{m}%</span>
            ))}
          </div>
        </motion.aside>

        {/* pages */}
        <div ref={wrapper} className="relative min-h-0 overflow-y-auto overscroll-contain">
          <div ref={content} className="px-5 py-10 [overflow-anchor:none]">
            {error && <p className="mt-20 text-center text-white/70">{error}</p>}
            {!doc && !error && (
              <div className="mt-28 flex flex-col items-center gap-4 text-white/70">
                <ProgressRing value={loadPct / 100} size={90} stroke={6}>
                  <Loader2 className="h-6 w-6 animate-spin text-mint" />
                </ProgressRing>
                <span className="text-xs tracking-widest">OPENING…</span>
              </div>
            )}
            {doc && width > 0 && (
              <div className="flex flex-col gap-8 pb-[30vh]">
                {Array.from({ length: numPages }, (_, i) => (
                  <Fragment key={i}>
                    <ReaderPage doc={doc} n={i + 1} width={width} aspect={aspect} current={current === i + 1} onMeasure={onMeasure} register={register} />
                    {(i + 1) % SPONSOR_EVERY === 0 && i + 1 < numPages && <SponsorBreak width={width} />}
                  </Fragment>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mx-auto mt-6 flex flex-col items-center gap-4 text-center"
                >
                  <p className="font-display text-4xl font-black italic text-chrome">The end</p>
                  <p className="text-sm text-white/60">You read {furthest} of {numPages} pages in {fmtTime(seconds)}</p>
                  <button onClick={onClose} className="rounded-full bg-mint px-6 py-3 font-display font-extrabold italic text-abyss hover:bg-white">Back to article</button>
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* right rail: page map + sponsor */}
        <motion.aside
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          className="hidden flex-col gap-6 border-l border-white/10 px-6 py-8 xl:flex"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-white/50">
            <span>Pages</span>
            <span className="flex gap-1">
              <button onClick={() => goTo(current - 1)} className="glass rounded-full p-1.5" aria-label="Previous page"><ChevronUp className="h-3.5 w-3.5" /></button>
              <button onClick={() => goTo(current + 1)} className="glass rounded-full p-1.5" aria-label="Next page"><ChevronDown className="h-3.5 w-3.5" /></button>
            </span>
          </div>
          {/* minimap: click anywhere to jump */}
          <div
            className="relative min-h-0 flex-1 cursor-pointer rounded-2xl bg-white/5"
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setHoverPage(Math.max(1, Math.min(numPages, Math.ceil(((e.clientY - r.top) / r.height) * numPages))));
            }}
            onPointerLeave={() => setHoverPage(null)}
            onClick={() => hoverPage && goTo(hoverPage)}
          >
            {numPages > 0 &&
              Array.from({ length: Math.min(numPages, 60) }, (_, i) => {
                const page = Math.round(((i + 0.5) / Math.min(numPages, 60)) * numPages);
                return (
                  <span
                    key={i}
                    className={`absolute left-3 right-3 h-[2px] rounded-full transition-colors duration-500 ${page <= furthest ? "bg-mint/50" : "bg-white/12"}`}
                    style={{ top: `${((i + 0.5) / Math.min(numPages, 60)) * 100}%` }}
                  />
                );
              })}
            <motion.span
              className="absolute left-1 right-1 h-7 -translate-y-1/2 rounded-lg border border-mint bg-mint/15 shadow-[0_0_18px_rgba(95,224,207,.6)]"
              animate={{ top: `${numPages ? ((current - 0.5) / numPages) * 100 : 0}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
            />
            <AnimatePresence>
              {hoverPage && (
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute -left-16 -translate-y-1/2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-navy"
                  style={{ top: `${((hoverPage - 0.5) / numPages) * 100}%` }}
                >
                  p. {hoverPage}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div>
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">Courtesy of</p>
            <SponsorSparkle src="/sponsor/card-back.webp" alt="Sitamax 50" width={1002} height={466} sizes="220px" rounded="rounded-xl" />
          </div>
        </motion.aside>
      </div>

      {/* mobile bottom bar */}
      {numPages > 0 && (
        <div className="relative z-10 flex items-center gap-3 border-t border-white/10 bg-abyss/80 px-4 py-2 backdrop-blur-xl xl:hidden">
          <ProgressRing value={ringValue} size={40} stroke={4}>
            <span className="text-[9px] font-bold">{Math.round(ringValue * 100)}%</span>
          </ProgressRing>
          <span className="flex flex-1 items-center gap-1 text-sm text-white/70">
            Page <RollingNumber value={current} className="font-bold text-mint" /> / {numPages}
          </span>
          <span className="flex items-center gap-1 text-xs text-white/60"><Clock className="h-3.5 w-3.5 text-mint" />{fmtTime(seconds)}</span>
          <button onClick={() => goTo(current - 1)} className="glass rounded-full p-2" aria-label="Previous page"><ChevronUp className="h-4 w-4" /></button>
          <button onClick={() => goTo(current + 1)} className="glass rounded-full p-2" aria-label="Next page"><ChevronDown className="h-4 w-4" /></button>
        </div>
      )}

      {/* resume toast */}
      <AnimatePresence>
        {resume && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.6 }}
            className="glass fixed bottom-20 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-full py-2 pl-5 pr-2 shadow-[0_0_40px_rgba(95,224,207,.35)] xl:bottom-8"
          >
            <span className="text-sm">Continue from page <b className="text-mint">{resume}</b>?</span>
            <button onClick={() => { goTo(resume); setResume(null); }} className="rounded-full bg-mint px-4 py-1.5 text-sm font-bold text-abyss">Continue</button>
            <button onClick={() => setResume(null)} className="rounded-full p-1.5 text-white/60 hover:text-white" aria-label="Dismiss"><X className="h-4 w-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <Milestone milestone={milestone} />
    </motion.div>
  );
}
