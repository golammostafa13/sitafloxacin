"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import SponsorSparkle from "@/components/SponsorSparkle";

/** Number that slides up when it changes. */
export function RollingNumber({ value, className }: { value: number; className?: string }) {
  return (
    <span className={`relative inline-flex overflow-hidden tabular-nums ${className ?? ""}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Circular progress ring. */
export function ProgressRing({ value, size = 120, stroke = 8, children }: { value: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5fb4f0" />
            <stop offset="1" stopColor="#5fe0cf" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          animate={{ strokeDashoffset: c * (1 - value) }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
          style={{ filter: "drop-shadow(0 0 8px rgba(95,224,207,.7))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/** A short sponsor moment between pages. */
export function SponsorBreak({ width }: { width: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 40 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto flex flex-col items-center gap-3 py-6"
      style={{ width: Math.min(width, 560) }}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/45">Courtesy of</span>
      <SponsorSparkle src="/sponsor/card-front.webp" alt="Sitamax 50" width={984} height={469} sizes="560px" />
    </motion.div>
  );
}

const BURST = Array.from({ length: 16 }, (_, i) => ({ a: (i / 16) * Math.PI * 2, d: 70 + (i % 3) * 30 }));

/** Milestone celebration: a sparkle burst + message. */
export function Milestone({ milestone }: { milestone: { pct: number; key: number } | null }) {
  const text = (p: number) => (p >= 100 ? "Finished! Brilliant work" : p >= 75 ? "75% read, almost there" : p >= 50 ? "Halfway through!" : p >= 25 ? "25% read, keep going" : "Great start!");
  return (
    <AnimatePresence>
      {milestone && (
        <motion.div
          key={milestone.key}
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="pointer-events-none fixed left-1/2 top-24 z-[60] -translate-x-1/2"
        >
          <div className="relative">
            {BURST.map((b, i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-mint shadow-[0_0_10px_#5fe0cf]"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos(b.a) * b.d * 2, y: Math.sin(b.a) * b.d, opacity: 0, scale: 0.2 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            ))}
            <div className="glass flex items-center gap-3 rounded-full px-5 py-3 shadow-[0_0_40px_rgba(95,224,207,.45)]">
              <span className="font-display text-2xl font-black italic text-mint">{milestone.pct}%</span>
              <span className="text-sm font-semibold text-white">{text(milestone.pct)}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Small cover used in the side rail. */
export function RailCover({ src, title }: { src?: string; title: string }) {
  if (!src) return null;
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -30, y: 20 }}
      animate={{ opacity: 1, rotateY: 0, y: 0 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="relative mx-auto w-40 animate-float [perspective:900px]"
    >
      <div className="absolute -inset-6 rounded-full bg-aqua/30 blur-2xl" />
      <Image src={src} alt={title} width={320} height={450} className="relative rounded-md shadow-[0_30px_60px_-15px_rgba(0,0,0,.9)] ring-1 ring-white/25 [transform:rotateY(-12deg)]" />
    </motion.div>
  );
}
