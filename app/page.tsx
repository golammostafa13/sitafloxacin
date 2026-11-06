import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { listArticles } from "@/lib/store";
import Scene from "@/components/Scene";
import Lens from "@/components/Lens";
import Reveal from "@/components/Reveal";
import SiteHeader from "@/components/SiteHeader";
import SmoothScroll from "@/components/stack/SmoothScroll";
import Stack from "@/components/stack/Stack";
import Panel from "@/components/stack/Panel";
import SplitText from "@/components/SplitText";
import SponsorSparkle from "@/components/SponsorSparkle";
import ArticleIndex from "@/components/ArticleIndex";
import SponsorFooter from "@/components/SponsorFooter";
import type { SceneVariant } from "@/components/scene/SitamaxScene";

export const dynamic = "force-dynamic";

// Each featured section gets its own Sitamax visual + 3D scene.
const FEATURE_LOOKS: { variant: SceneVariant; lens: string; side: "left" | "right"; glow: string }[] = [
  { variant: "shatter", lens: "/sitamax/lens-shatter.webp", side: "right", glow: "#1e5bd8" },
  { variant: "orbit", lens: "/sitamax/lungs.webp", side: "left", glow: "#1fb5a5" },
  { variant: "swarm", lens: "/sitamax/lens-bacteria.webp", side: "right", glow: "#5fb4f0" },
];

export default async function Home() {
  const articles = await listArticles();
  const featured = articles.slice(0, 3);

  return (
    <main className="bg-abyss text-white">
      <SmoothScroll />
      <SiteHeader />
      <Stack>

      {/* 1. Hero */}
      <Panel id="intro" className="flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,#1e5bd8_0%,#0b2a6f_35%,#030d26_75%)]" />
        <div className="hex-grid absolute inset-0 opacity-60" />
        <Image src="/sitamax/figure.webp" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-25 mix-blend-screen" />
        <Scene variant="molecule" side="right" seed={1} />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 sm:px-10">
          <Reveal>
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.5em] text-mint">Scan · Read · Learn</p>
          </Reveal>
          <h1 className="font-display text-[clamp(3.5rem,13vw,11rem)] font-black italic leading-[0.85] tracking-tight" aria-label="Sage Manual">
            <SplitText text="SAGE" className="block" wordClassName="text-chrome drop-shadow-[0_8px_40px_rgba(95,180,240,.45)]" delay={0.1} />
            <SplitText text="MANUAL" className="block" wordClassName="text-mint drop-shadow-[0_0_30px_rgba(95,224,207,.55)]" delay={0.25} />
          </h1>
          <Reveal delay={0.25}>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link href="#articles" className="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 font-display text-sm font-extrabold italic text-navy shadow-[0_0_40px_rgba(95,224,207,.5)] transition hover:bg-mint">
                All articles <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <div className="rounded-full bg-white/95 px-4 py-2">
                <Image src="/sponsor/sitamax-logo.webp" alt="Sitamax 50" width={535} height={155} className="h-7 w-auto" />
              </div>
            </div>
          </Reveal>
        </div>
        <a href="#sponsor" aria-label="Scroll" className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-white/70">
          <ArrowDown />
        </a>
      </Panel>

      {/* 2. Sponsor showcase */}
      <Panel id="sponsor" className="flex items-center bg-gradient-to-b from-abyss via-ink to-navy py-28">
        <div className="hex-grid absolute inset-0 opacity-40" />
        <div className="absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal/30 blur-[120px]" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 sm:px-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal className="mx-auto w-full max-w-sm">
            <SponsorSparkle src="/sponsor/magazine-cover.webp" alt="Sitafloxacin: Sitamax 50 magazine cover" width={905} height={1280} rounded="rounded-2xl" sizes="(max-width:1024px) 80vw, 30vw" />
          </Reveal>
          <div className="flex flex-col gap-8">
            <Reveal delay={0.15}>
              <SponsorSparkle src="/sponsor/card-front.webp" alt="Sitamax 50 Smart Medical Access Card, front" width={984} height={469} sizes="(max-width:1024px) 95vw, 55vw" />
            </Reveal>
            <Reveal delay={0.3}>
              <SponsorSparkle src="/sponsor/card-back.webp" alt="Sitamax 50 card, back: scan to access Sage Manual" width={1002} height={466} sizes="(max-width:1024px) 95vw, 55vw" />
            </Reveal>
          </div>
        </div>
      </Panel>

      {/* 3. Featured articles, each with its own Sitamax visual */}
      {featured.map((a, i) => {
        const look = FEATURE_LOOKS[i % FEATURE_LOOKS.length];
        const textLeft = look.side === "right";
        return (
          <Panel key={a.id} id={`feature-${i + 1}`} className="flex items-center py-24">
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at ${textLeft ? "75%" : "25%"} 50%, ${look.glow}99 0%, #061a47 45%, #030d26 80%)` }} />
            <div className="hex-grid absolute inset-0 opacity-30" />
            <Scene variant={look.variant} side={look.side} seed={i + 3} />
            <div className={`relative z-10 mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-6 sm:px-10 md:grid-cols-2 ${textLeft ? "" : "md:[&>*:first-child]:order-2"}`}>
              <Reveal>
                <p className="font-display text-7xl font-black italic text-white/10 sm:text-9xl">{String(a.order).padStart(2, "0")}</p>
                <SplitText as="h2" text={a.title} className="-mt-6 block font-display text-[clamp(1.9rem,8.5vw,3.75rem)] font-black italic leading-[0.95] [overflow-wrap:anywhere]" />
                {a.subtitle && <p className="mt-4 max-w-md text-lg text-white/65">{a.subtitle}</p>}
                <Link href={`/articles/${a.slug}`} className="group mt-8 inline-flex items-center gap-3 rounded-full border border-mint/60 px-6 py-3 font-display text-sm font-bold italic text-mint transition hover:bg-mint hover:text-abyss">
                  Read <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              </Reveal>
              <Reveal delay={0.2} className="relative mx-auto flex w-full max-w-md items-center justify-center">
                <Lens src={look.lens} className="absolute -top-10 right-0 w-40 sm:w-52" />
                <Link href={`/articles/${a.slug}`} className="relative block w-56 [perspective:1000px] sm:w-64">
                  <Image src={a.cover} alt={a.title} width={640} height={900} sizes="(max-width:640px) 60vw, 260px" className="rounded-lg shadow-[0_50px_100px_-20px_rgba(0,0,0,.9)] ring-1 ring-white/25 transition duration-700 [transform:rotateY(-14deg)_rotateX(4deg)] hover:[transform:rotateY(0)_rotateX(0)_scale(1.04)]" />
                </Link>
              </Reveal>
            </div>
          </Panel>
        );
      })}

      {/* 4. Article index */}
      <Panel id="articles" className="bg-gradient-to-b from-abyss via-ink to-abyss px-6 py-28 sm:px-10">
        <div className="hex-grid absolute inset-0 opacity-25" />
        <Lens src="/sitamax/molecule.webp" className="absolute -right-20 top-16 hidden w-80 opacity-60 lg:block" />
        <div className="relative mx-auto max-w-7xl">
          <h2 className="mb-12 font-display text-6xl font-black italic leading-none sm:text-8xl">
            <SplitText text="Articles" wordClassName="text-chrome" />
          </h2>
          <ArticleIndex articles={articles} />
        </div>
      </Panel>

      <Panel id="footer" dot={false} fit>
        <SponsorFooter />
      </Panel>
      </Stack>
    </main>
  );
}
