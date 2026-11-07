"use client";

import { useEffect } from "react";
import { motion } from "motion/react";

/**
 * A 3D book that swings its cover open, flips a few pages and zooms in,
 * played over the reader while the PDF loads underneath.
 */
const COVER_AT = 0.45; // cover starts opening (s)
const COVER_FOR = 0.85;
const LEAVES = 3;
const DONE_AT = 2.05; // overlay finished fading (s)

const paper = "linear-gradient(90deg, #e9e4d8 0%, #fbf8f1 12%, #fffdf8 60%, #f1ece0 100%)";
const lines = "repeating-linear-gradient(180deg, transparent 0 13px, rgba(30,40,70,.09) 13px 14px)";

export default function BookOpening({ cover, title, onDone }: { cover?: string; title: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, DONE_AT * 1000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-abyss/95 [perspective:1800px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: DONE_AT, times: [0, 0.08, 0.82, 1], ease: "easeInOut" }}
    >
      <div className="absolute h-[60vmin] w-[60vmin] rounded-full bg-aqua/25 blur-[110px]" />

      {/* the book: shifts right as it opens so the two-page spread stays centred */}
      <motion.div
        className="relative aspect-[640/900] w-[min(42vw,280px)] [transform-style:preserve-3d]"
        initial={{ scale: 0.7, rotateY: -28, rotateX: 10, x: "0%", y: 30 }}
        animate={{ scale: [0.7, 1, 1, 2.6], rotateY: [-28, -8, 0, 0], rotateX: [10, 6, 0, 0], x: ["0%", "0%", "50%", "50%"], y: [30, 0, 0, 0] }}
        transition={{ duration: DONE_AT - 0.1, times: [0, 0.22, 0.6, 1], ease: [0.65, 0, 0.35, 1] }}
      >
        {/* page block under the cover (right-hand page) */}
        <div className="absolute inset-0 rounded-r-md shadow-[0_40px_90px_-20px_rgba(0,0,0,.9)]" style={{ background: `${lines}, ${paper}` }}>
          <div className="absolute inset-y-[6%] left-[10%] right-[10%]" style={{ background: lines }} />
          <div className="absolute inset-y-0 -right-[3px] w-[6px] rounded-r-sm bg-[repeating-linear-gradient(180deg,#f5f1e6_0_2px,#d8d2c2_2px_3px)]" />
        </div>

        {/* pages that flip after the cover */}
        {Array.from({ length: LEAVES }, (_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 origin-left rounded-r-md"
            // stacked just above the page block; after flipping they land above the open cover
            style={{ z: 1 + i, background: paper, boxShadow: "inset 8px 0 18px -10px rgba(0,0,0,.35)" }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: -178 + i * 2 }}
            transition={{ delay: COVER_AT + 0.35 + i * 0.16, duration: 0.7, ease: [0.45, 0, 0.2, 1] }}
          />
        ))}

        {/* cover: front shows the artwork, back is the inside of the cover */}
        <motion.div
          className="absolute inset-0 origin-left [transform-style:preserve-3d]"
          style={{ z: LEAVES + 2 }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: -180 }}
          transition={{ delay: COVER_AT, duration: COVER_FOR, ease: [0.55, 0, 0.25, 1] }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-r-md rounded-l-sm ring-1 ring-white/20 [backface-visibility:hidden]">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="h-full w-full object-cover" draggable={false} />
            ) : (
              <div className="grid h-full place-items-center bg-gradient-to-br from-royal to-navy p-4 text-center font-display font-black italic text-white">{title}</div>
            )}
            <div className="absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/45 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
          </div>
          <div className="absolute inset-0 rounded-l-md [backface-visibility:hidden] [transform:rotateY(180deg)]" style={{ background: "linear-gradient(270deg, #cfc8b6 0%, #e8e2d3 18%, #f3efe4 100%)" }} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
