"use client";

import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { Bacteria, Dust, Molecule, Rig } from "./parts";
import { Orbits, Shatter } from "./effects";

export type SceneVariant = "molecule" | "shatter" | "orbit" | "swarm" | "halo";

type Props = {
  variant: SceneVariant;
  /** Different seeds give each page its own arrangement. */
  seed?: number;
  /** Which side the hero object sits on (text goes on the other side). */
  side?: "left" | "right" | "center";
};

/**
 * Real-time 3D backdrop. Renders at device resolution (sharp on any screen),
 * caps DPR, and stops rendering while scrolled out of view.
 */
export default function SitamaxScene({ variant, seed = 0, side = "right" }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [small, setSmall] = useState(false);

  useEffect(() => {
    setSmall(window.matchMedia("(max-width: 768px)").matches);
    // Render only while on screen and not covered by the next stacked panel.
    let onScreen = false;
    const panel = wrap.current?.closest<HTMLElement>("[data-panel]") ?? null;
    const sync = () => setVisible(onScreen && !panel?.hasAttribute("data-covered"));
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }, { rootMargin: "100px" });
    if (wrap.current) io.observe(wrap.current);
    const mo = new MutationObserver(sync);
    if (panel) mo.observe(panel, { attributes: true, attributeFilter: ["data-covered"] });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);

  const x = small || side === "center" ? 0 : side === "right" ? 3.4 : -3.4;
  const y = small ? 1.6 : 0;
  const s = small ? 0.62 : 1;
  const tilt = ((seed % 7) - 3) * 0.12;

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 9], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 6, 5]} intensity={2.2} />
        <pointLight position={[-6, -2, 3]} intensity={30} color="#1fb5a5" />
        <pointLight position={[6, 3, 2]} intensity={25} color="#5fb4f0" />

        {variant === "molecule" && (
          <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
            <Molecule position={[x, y, 0]} scale={0.75 * s} rotation={[0.3, tilt, 0.15]} />
          </Float>
        )}
        {variant === "shatter" && (
          <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
            <Shatter position={[x, y, 0]} scale={s} rotation={[0, 0, tilt]} />
          </Float>
        )}
        {variant === "orbit" && (
          <group position={[x, y, -1]} scale={s}>
            <Orbits rotation={[0, 0, tilt]} />
            <Float speed={1.2} floatIntensity={0.6}>
              <Molecule scale={0.55} rotation={[0.3, 0, 0.1]} />
            </Float>
          </group>
        )}
        {variant === "halo" && (
          <group position={[x, y, -1.5]} scale={s * 1.05}>
            <Orbits rotation={[0.1, 0, tilt]} />
          </group>
        )}
        {variant === "swarm" && (
          <Float speed={1.2} floatIntensity={0.6}>
            <Molecule position={[x, y, 1]} scale={0.5 * s} rotation={[0.6, tilt, 0.2]} />
          </Float>
        )}

        <Bacteria count={(variant === "swarm" ? 30 : 14) >> (small ? 1 : 0)} seed={seed} />
        <Dust count={small ? 600 : 1300} />
        <Rig />
      </Canvas>
    </div>
  );
}
