import Image from "next/image";
import SponsorSparkle from "./SponsorSparkle";

/** Dark Sitamax-blue footer with a slow aurora glow; logos sit on a frosted chip so they stay readable. */
export default function SponsorFooter() {
  return (
    <footer className="relative overflow-hidden bg-[linear-gradient(180deg,#030d26_0%,#061a47_45%,#0b2a6f_100%)] px-4 pb-10 pt-20 text-white sm:px-8">
      {/* aurora */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-0 h-[120%] w-[70%] animate-[aurora_18s_ease-in-out_infinite] rounded-full bg-[radial-gradient(closest-side,rgba(31,181,165,.35),transparent)] blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-[110%] w-[65%] animate-[aurora_22s_ease-in-out_infinite_reverse] rounded-full bg-[radial-gradient(closest-side,rgba(30,91,216,.45),transparent)] blur-3xl" />
        <div className="hex-grid absolute inset-0 opacity-40" />
      </div>
      {/* glowing top edge */}
      <svg className="absolute inset-x-0 top-0 h-12 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
        <path d="M0 30C240 70 480 0 720 30S1200 60 1440 20" fill="none" stroke="url(#edge)" strokeWidth="2" />
        <defs>
          <linearGradient id="edge" x1="0" x2="1">
            <stop offset="0" stopColor="#5fb4f0" stopOpacity="0" />
            <stop offset=".5" stopColor="#5fe0cf" />
            <stop offset="1" stopColor="#5fb4f0" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.2fr_1fr]">
        <SponsorSparkle src="/sponsor/card-front.webp" alt="Sitamax 50 Smart Medical Access Card" width={984} height={469} sizes="(max-width:768px) 100vw, 55vw" />
        <div className="flex flex-col items-center gap-5 md:items-start">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-mint/80">Courtesy of</p>
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,.8),0_0_40px_-10px_rgba(95,224,207,.5)] ring-1 ring-white/60 backdrop-blur md:items-start">
            <Image src="/sponsor/sitamax-logo.webp" alt="Sitamax 50, Sitafloxacin 50 mg" width={535} height={155} className="h-16 w-auto mix-blend-multiply" />
            <Image src="/sponsor/square-wordmark.webp" alt="Square Pharmaceuticals PLC." width={300} height={80} className="h-8 w-auto" />
          </div>
        </div>
      </div>
      <p className="relative mx-auto mt-12 max-w-6xl border-t border-white/10 pt-6 text-center text-xs text-white/45">© {new Date().getFullYear()} Sage Manual</p>
    </footer>
  );
}
