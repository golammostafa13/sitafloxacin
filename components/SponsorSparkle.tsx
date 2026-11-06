import Image from "next/image";
import clsx from "clsx";

// Deterministic star positions (no Math.random, so server and client match).
const STARS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 100,
  size: 8 + ((i * 7) % 4) * 4,
  delay: ((i * 0.37) % 2.6).toFixed(2),
}));

function Star({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="drop-shadow-[0_0_6px_rgba(255,255,255,0.95)]">
      <path d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z" fill="white" />
    </svg>
  );
}

export default function SponsorSparkle({
  src, alt, width, height, className, priority, rounded = "rounded-3xl", sizes,
}: { src: string; alt: string; width: number; height: number; className?: string; priority?: boolean; rounded?: string; sizes?: string }) {
  return (
    <div className={clsx("group relative [perspective:1200px]", className)}>
      <div className={clsx("relative overflow-hidden animate-glow transition-transform duration-700 ease-out group-hover:[transform:rotateX(4deg)_rotateY(-6deg)_scale(1.02)]", rounded)}>
        <Image src={src} alt={alt} width={width} height={height} priority={priority} sizes={sizes} className="block h-auto w-full" />
        {/* light sweep */}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-sweep bg-gradient-to-r from-transparent via-white/55 to-transparent mix-blend-overlay" />
      </div>
      {/* twinkling stars */}
      <div aria-hidden className="pointer-events-none absolute -inset-3">
        {STARS.map((s, i) => (
          <span key={i} className="absolute animate-twinkle" style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }}>
            <Star size={s.size} />
          </span>
        ))}
      </div>
    </div>
  );
}
