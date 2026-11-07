import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { canRead } from "@/lib/auth";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getArticle, listArticles } from "@/lib/store";
import { lookFor } from "@/lib/look";
import Scene from "@/components/Scene";
import Lens from "@/components/Lens";
import Reveal from "@/components/Reveal";
import SiteHeader from "@/components/SiteHeader";
import OpenBookCover from "@/components/OpenBookCover";
import SponsorSparkle from "@/components/SponsorSparkle";
import SponsorFooter from "@/components/SponsorFooter";
import ReadButton from "@/components/ReadButton";
import SmoothScroll from "@/components/stack/SmoothScroll";
import Stack from "@/components/stack/Stack";
import Panel from "@/components/stack/Panel";
import SplitText from "@/components/SplitText";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticle((await params).slug);
  return { title: a?.title ?? "Not found", description: a?.subtitle };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await canRead())) redirect(`/signin?next=${encodeURIComponent(`/articles/${slug}`)}`);
  const article = await getArticle(slug);
  if (!article || !article.published) notFound();

  const all = await listArticles();
  const idx = all.findIndex((a) => a.id === article.id);
  const prev = all[(idx - 1 + all.length) % all.length];
  const next = all[(idx + 1) % all.length];
  const look = lookFor(article.slug, article.order);
  const coverLeft = look.side === "left";
  const meta = [article.author, article.publisher, article.year, article.pages ? `${article.pages} pages` : ""].filter(Boolean);

  return (
    <main className="bg-abyss text-white">
      <SmoothScroll />
      <SiteHeader />
      <Stack dots={false}>

      {/* Unique Sitamax backdrop for this article */}
      <Panel id="article" className="flex items-center py-28">
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at ${coverLeft ? "30%" : "70%"} 45%, ${look.glow}aa 0%, #061a47 45%, #030d26 85%), linear-gradient(${look.angle}deg, #030d26, #0b2a6f)` }}
        />
        <div className="hex-grid absolute inset-0 opacity-30" />
        <Scene variant={look.variant} seed={look.seed} side={coverLeft ? "left" : "right"} />
        <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(${coverLeft ? "270deg" : "90deg"}, rgba(3,13,38,.85) 0%, rgba(3,13,38,.55) 40%, transparent 65%)` }} />

        <div className={`relative z-10 mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-14 px-6 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] ${coverLeft ? "" : "lg:[&>*:first-child]:order-2"}`}>
          <Reveal className="relative mx-auto w-64 sm:w-80">
            <Lens src={look.lens} className={`absolute -top-14 w-36 sm:w-44 ${coverLeft ? "-right-16" : "-left-16"}`} />
            <div className="absolute -inset-10 rounded-full blur-3xl" style={{ background: `${look.glow}55` }} />
            <div className="[perspective:1200px]">
              <OpenBookCover label={`Read ${article.title}`}>
              <Image
                src={article.cover}
                alt={article.title}
                width={640}
                height={900}
                priority
                sizes="(max-width:640px) 64vw, 320px"
                className={`relative rounded-lg shadow-[0_60px_120px_-25px_rgba(0,0,0,.95)] ring-1 ring-white/25 transition duration-700 ${coverLeft ? "[transform:rotateY(16deg)_rotateX(4deg)]" : "[transform:rotateY(-16deg)_rotateX(4deg)]"} hover:[transform:none]`}
              />
              </OpenBookCover>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-mint">
              {String(article.order).padStart(2, "0")} · {article.category}
            </p>
            <SplitText as="h1" text={article.title} wordClassName="text-chrome" className="block font-display text-[clamp(2rem,8.5vw,4.5rem)] font-black italic leading-[0.95] [overflow-wrap:anywhere]" />
            {article.subtitle && <p className="mt-4 text-xl text-white/70">{article.subtitle}</p>}
            {meta.length > 0 && <p className="mt-6 text-sm text-white/45">{meta.join("  ·  ")}</p>}
            {article.summary && <p className="mt-8 line-clamp-4 max-w-xl leading-relaxed text-white/75">{article.summary}</p>}
            <div className="mt-10">
              <ReadButton src={article.file ? `/api/read/${article.slug}` : ""} title={article.title} cover={article.cover} author={article.author} />
            </div>
          </Reveal>
        </div>
      </Panel>

      {/* Sponsor + prev / next */}
      <Panel id="more" className="flex flex-col bg-gradient-to-b from-abyss to-ink">
        <div className="hex-grid absolute inset-0 opacity-25" />
        <div className="relative flex flex-1 items-center px-6 py-24 sm:px-10">
          <Reveal className="mx-auto w-full max-w-3xl">
            <SponsorSparkle src="/sponsor/card-back.webp" alt="Sitamax 50: scan to access Sage Manual" width={1002} height={466} sizes="(max-width:768px) 95vw, 760px" />
          </Reveal>
        </div>
      <nav className="relative grid grid-cols-2 border-t border-white/10 bg-ink/80 backdrop-blur">
        {[{ a: prev, label: "Previous", Icon: ArrowLeft }, { a: next, label: "Next", Icon: ArrowRight }].map(({ a, label, Icon }, i) => (
          <Link key={label} href={`/articles/${a.slug}`} className={`group relative flex items-center gap-5 overflow-hidden p-6 sm:p-10 ${i ? "flex-row-reverse text-right" : "border-r border-white/10"}`}>
            <Image src={a.cover} alt="" width={90} height={126} className="hidden h-28 w-auto rounded shadow-xl transition duration-500 group-hover:scale-105 sm:block" />
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-mint" style={{ justifyContent: i ? "flex-end" : "flex-start" }}>
                <Icon className="h-4 w-4" /> {label}
              </span>
              <span className="mt-2 line-clamp-2 block font-display text-lg font-extrabold italic sm:text-2xl">{a.title}</span>
            </span>
          </Link>
        ))}
      </nav>
      </Panel>

      <Panel id="footer" dot={false} fit>
        <SponsorFooter />
      </Panel>
      </Stack>
    </main>
  );
}
