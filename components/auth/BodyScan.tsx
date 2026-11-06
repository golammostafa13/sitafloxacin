import Image from "next/image";
import Lens from "@/components/Lens";

const HOTSPOTS = [
  { left: "38%", top: "46%", delay: "0s" },
  { left: "60%", top: "50%", delay: "1.2s" },
  { left: "49%", top: "30%", delay: "2.1s" },
];

/** The Sitamax figure, breathing, with a scan line, pulsing hotspots and floating bacteria lenses. */
export default function BodyScan() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md" aria-hidden>
      {/* halo */}
      <div className="absolute inset-[8%] rounded-full bg-sky/25 blur-[90px]" />

      {/* breathing body, faded at the edges */}
      <div className="absolute inset-0 animate-[breathe_5s_ease-in-out_infinite] [mask-image:radial-gradient(ellipse_55%_60%_at_50%_48%,#000_55%,transparent_100%)]">
        <Image src="/sitamax/chest.webp" alt="" fill priority sizes="(max-width:1024px) 0px, 448px" className="object-cover object-[50%_40%] mix-blend-screen" />
      </div>

      {/* scan line */}
      <div className="absolute inset-x-[12%] h-px animate-[scan_4.5s_cubic-bezier(.45,0,.55,1)_infinite] bg-gradient-to-r from-transparent via-mint to-transparent shadow-[0_0_20px_4px_rgba(95,224,207,.6)]" />

      {/* pulsing hotspots */}
      {HOTSPOTS.map((h, i) => (
        <span key={i} className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2" style={{ left: h.left, top: h.top }}>
          <span className="absolute inset-0 animate-ping rounded-full bg-mint/70" style={{ animationDelay: h.delay, animationDuration: "2.4s" }} />
          <span className="absolute inset-1 rounded-full bg-white shadow-[0_0_12px_#5fe0cf]" />
        </span>
      ))}

      {/* floating lenses */}
      <Lens src="/sitamax/lens-bacteria.webp" className="absolute -left-6 top-[12%] w-28" sizes="112px" />
      <Lens src="/sitamax/lens-shatter.webp" className="absolute -right-4 bottom-[14%] w-32 [animation-delay:-3s]" sizes="128px" />
    </div>
  );
}
