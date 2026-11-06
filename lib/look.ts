import type { SceneVariant } from "@/components/scene/SitamaxScene";

const VARIANTS: SceneVariant[] = ["molecule", "shatter", "orbit", "swarm"];
const LENSES = ["/sitamax/lens-bacteria.webp", "/sitamax/lens-shatter.webp", "/sitamax/lungs.webp", "/sitamax/molecule.webp", "/sitamax/card-lungs.webp", "/sitamax/chest.webp"];
const GLOWS = ["#1e5bd8", "#1fb5a5", "#5fb4f0", "#2a49c9", "#139c9a", "#3c7be8"];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A unique, deterministic Sitamax look for each article. */
export function lookFor(slug: string, order: number) {
  const h = hash(slug);
  return {
    variant: VARIANTS[(order - 1) % VARIANTS.length],
    lens: LENSES[h % LENSES.length],
    glow: GLOWS[(h >>> 4) % GLOWS.length],
    seed: h % 997,
    angle: 20 + (h % 140),
    side: (h & 1 ? "right" : "left") as "left" | "right",
  };
}
