"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import clsx from "clsx";

const MAX_PIXELS = 12_000_000; // stay under mobile canvas limits

/**
 * One PDF page. Renders at device resolution only while near the viewport and
 * frees its bitmap when far away, so long articles stay light on memory.
 * Rises into place with a soft 3D tilt the first time it appears.
 */
function ReaderPage({
  doc, n, width, aspect, current, onMeasure, register,
}: {
  doc: PDFDocumentProxy;
  n: number;
  width: number;
  aspect: number;
  current: boolean;
  onMeasure: (aspect: number) => void;
  register: (n: number, el: HTMLDivElement | null) => void;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(n <= 2);
  const [done, setDone] = useState(false);

  useEffect(() => {
    register(n, holder.current);
    return () => register(n, null);
  }, [n, register]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "1600px 0px" });
    if (holder.current) io.observe(holder.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near || !width) {
      // far away: free the bitmap
      if (canvas.current) canvas.current.width = canvas.current.height = 0;
      setDone(false);
      return;
    }
    let cancelled = false;
    let task: RenderTask | null = null;
    const buffer = document.createElement("canvas");
    (async () => {
      const page = await doc.getPage(n).catch(() => null);
      if (!page || cancelled) return;
      const base = page.getViewport({ scale: 1 });
      onMeasure(base.height / base.width);
      const viewport = page.getViewport({ scale: width / base.width });
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, Math.sqrt(MAX_PIXELS / (viewport.width * viewport.height))));
      buffer.width = Math.floor(viewport.width * dpr);
      buffer.height = Math.floor(viewport.height * dpr);
      task = page.render({ canvas: buffer, viewport, transform: dpr === 1 ? undefined : [dpr, 0, 0, dpr, 0, 0] });
      try {
        await task.promise;
      } catch {
        return;
      }
      if (cancelled || !canvas.current) return;
      canvas.current.width = buffer.width;
      canvas.current.height = buffer.height;
      canvas.current.getContext("2d")?.drawImage(buffer, 0, 0);
      buffer.width = buffer.height = 0;
      setDone(true);
    })();
    return () => {
      cancelled = true;
      task?.cancel();
      buffer.width = buffer.height = 0;
    };
  }, [doc, n, near, width, onMeasure]);

  return (
    <div ref={holder} data-page={n} className="[perspective:1600px]">
      <motion.div
        initial={{ opacity: 0, y: 70, rotateX: 14, scale: 0.94, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={clsx(
          "relative mx-auto origin-top overflow-hidden rounded-lg bg-white transition-[box-shadow,filter] duration-700",
          current ? "shadow-[0_0_0_1px_rgba(95,224,207,.6),0_40px_90px_-20px_rgba(0,0,0,.9),0_0_60px_-10px_rgba(31,181,165,.55)]" : "shadow-[0_30px_70px_-25px_rgba(0,0,0,.85)] brightness-[.82]",
        )}
        style={{ width, height: Math.round(width * aspect) }}
      >
        <canvas ref={canvas} className={clsx("block h-full w-full transition-opacity duration-500", done ? "opacity-100" : "opacity-0")} />
        {!done && (
          <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-ice to-white">
            <div className="absolute inset-y-0 -left-1/2 w-1/2 animate-[sweep_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-sky/30 to-transparent" />
          </div>
        )}
        <span className="absolute bottom-2 right-3 rounded-full bg-navy/75 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white backdrop-blur">{n}</span>
      </motion.div>
    </div>
  );
}

export default memo(ReaderPage);
