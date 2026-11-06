"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { BookOpen } from "lucide-react";

const PdfReader = dynamic(() => import("./PdfReader"), { ssr: false });

export default function ReadButton({ src, title, cover, author }: { src: string; title: string; cover?: string; author?: string }) {
  const [open, setOpen] = useState(false);
  if (!src) return null;
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-display text-base font-extrabold italic text-navy shadow-[0_0_50px_rgba(95,224,207,.55)] transition hover:bg-mint"
      >
        <BookOpen className="h-5 w-5 transition group-hover:scale-110" /> Read now
      </button>
      {open && createPortal(<PdfReader src={src} title={title} cover={cover} author={author} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}
