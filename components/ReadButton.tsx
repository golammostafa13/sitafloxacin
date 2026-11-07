"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { AnimatePresence } from "motion/react";
import { BookOpen } from "lucide-react";
import BookOpening from "./BookOpening";

const PdfReader = dynamic(() => import("./PdfReader"), { ssr: false });

/** Fired by the clickable cover (OpenBookCover) so it opens the same reader. */
export const OPEN_BOOK_EVENT = "sage:open-book";

export default function ReadButton({ src, title, cover, author }: { src: string; title: string; cover?: string; author?: string }) {
  const [open, setOpen] = useState(false);
  const [intro, setIntro] = useState(false);

  const start = useCallback(() => {
    if (!src) return;
    setOpen(true);
    setIntro(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, [src]);
  const endIntro = useCallback(() => setIntro(false), []);

  useEffect(() => {
    window.addEventListener(OPEN_BOOK_EVENT, start);
    return () => window.removeEventListener(OPEN_BOOK_EVENT, start);
  }, [start]);

  if (!src) return null;
  return (
    <>
      <button
        onClick={start}
        className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-display text-base font-extrabold italic text-navy shadow-[0_0_50px_rgba(95,224,207,.55)] transition hover:bg-mint"
      >
        <BookOpen className="h-5 w-5 transition group-hover:scale-110" /> Read now
      </button>
      {open && createPortal(
        <>
          <PdfReader src={src} title={title} cover={cover} author={author} onClose={() => { setOpen(false); setIntro(false); }} />
          <AnimatePresence>{intro && <BookOpening key="intro" cover={cover} title={title} onDone={endIntro} />}</AnimatePresence>
        </>,
        document.body,
      )}
    </>
  );
}
