import Image from "next/image";
import clsx from "clsx";

/** A glowing circular "microscope lens" holding a Sitamax visual. */
export default function Lens({ src, className, sizes = "(max-width:768px) 60vw, 28vw" }: { src: string; className?: string; sizes?: string }) {
  return (
    <div className={clsx("relative aspect-square animate-float", className)} aria-hidden>
      <div className="absolute -inset-6 rounded-full bg-sky/25 blur-3xl" />
      <div className="relative h-full w-full overflow-hidden rounded-full ring-2 ring-white/70 animate-glow">
        <Image src={src} alt="" fill sizes={sizes} className="object-cover scale-110" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,.45),transparent_45%)]" />
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-sweep bg-gradient-to-r from-transparent via-white/45 to-transparent" />
      </div>
    </div>
  );
}
