import Link from "next/link";
import Image from "next/image";
import Scene from "@/components/Scene";
import SponsorSparkle from "@/components/SponsorSparkle";
import SplitText from "@/components/SplitText";
import Reveal from "@/components/Reveal";
import BodyScan from "./BodyScan";

export default function AuthScreen({ title, children, wide, hideBody }: { title: string; children: React.ReactNode; wide?: boolean; hideBody?: boolean }) {
  return (
    <main className="relative min-h-svh overflow-hidden bg-abyss text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_45%,#1e5bd8_0%,#0b2a6f_35%,#030d26_75%)]" />
      <div className="hex-grid absolute inset-0 opacity-40" />
      <Scene variant="halo" side="left" seed={7} />

      <div className={`relative z-10 mx-auto grid min-h-svh max-w-7xl items-center gap-10 px-4 py-20 sm:px-8 ${hideBody ? "justify-items-center" : "lg:grid-cols-[1fr_minmax(0,560px)]"}`}>
        {/* Sitamax visual side */}
        {!hideBody && (
          <div className="hidden lg:block">
            <Reveal>
              <BodyScan />
            </Reveal>
          </div>
        )}

        {/* Form */}
        <div className={wide ? "" : `mx-auto w-full max-w-md ${hideBody ? "" : "lg:max-w-none"}`}>
          <Link href="/" className="mb-6 inline-block font-display text-lg font-black italic">
            SAGE <span className="text-mint">MANUAL</span>
          </Link>
          <div className="glass rounded-3xl p-6 shadow-[0_40px_120px_-30px_rgba(0,0,0,.9)] sm:p-8">
            <SplitText as="h1" text={title} wordClassName="text-chrome" className="mb-6 block font-display text-4xl font-black italic leading-none sm:text-5xl" />
            {children}
          </div>
          <div className="mt-8">
            <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">Sponsored by</p>
            <SponsorSparkle src="/sponsor/card-front.webp" alt="Sitamax 50 Smart Medical Access Card" width={984} height={469} sizes="(max-width:640px) 90vw, 520px" />
          </div>
          <div className="mt-6 flex justify-center lg:hidden">
            <Image src="/sponsor/square-wordmark.webp" alt="Square Pharmaceuticals PLC." width={300} height={80} className="h-8 w-auto opacity-80" />
          </div>
        </div>
      </div>
    </main>
  );
}
