"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const rand = (i: number, n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
const smooth = (x: number) => x * x * (3 - 2 * x);

/** A bacterium that smoothly bursts into ice shards and re-forms (the antibacterial moment). */
export function Shatter({ shards = 140, ...props }: { shards?: number } & React.ComponentProps<"group">) {
  const body = useRef<THREE.Mesh>(null);
  const inst = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(
    () =>
      Array.from({ length: shards }, (_, i) => {
        // start on the capsule surface, fly outward
        const y = (rand(i, 1) - 0.5) * 2.6;
        const a = rand(i, 2) * Math.PI * 2;
        const start = new THREE.Vector3(Math.cos(a) * 0.6, y, Math.sin(a) * 0.6);
        const dir = start.clone().add(new THREE.Vector3(rand(i, 3) - 0.3, rand(i, 4) - 0.5, rand(i, 5) - 0.5)).normalize();
        return { start, dir, dist: 1.2 + rand(i, 6) * 2.2, spin: rand(i, 7) * 4, s: 0.05 + rand(i, 8) * 0.12 };
      }),
    [shards],
  );
  const shardGeom = useMemo(() => new THREE.OctahedronGeometry(1, 0), []);
  const shardMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#cdeeff", emissive: "#5fb4f0", emissiveIntensity: 0.6, roughness: 0.05, metalness: 0.1, clearcoat: 1, transparent: true, opacity: 0.95 }), []);
  const bodyGeom = useMemo(() => new THREE.CapsuleGeometry(0.62, 1.9, 12, 32), []);
  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#5fb4f0", emissive: "#1e5bd8", emissiveIntensity: 0.4, roughness: 0.25, clearcoat: 1, transparent: true }), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // 8 s cycle: rest intact, burst, drift, re-form
    const c = (t % 8) / 8;
    const e = c < 0.35 ? 0 : c < 0.55 ? smooth((c - 0.35) / 0.2) : c < 0.8 ? 1 : 1 - smooth((c - 0.8) / 0.2);
    if (body.current) {
      body.current.rotation.set(0.4, t * 0.3, Math.PI / 2.4);
      body.current.scale.setScalar(Math.max(0.001, 1 - e));
      (body.current.material as THREE.MeshPhysicalMaterial).opacity = 1 - e * 0.9;
    }
    const m = inst.current;
    if (!m) return;
    data.forEach((d, i) => {
      dummy.position.copy(d.start).applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2.4).addScaledVector(d.dir, e * d.dist);
      dummy.rotation.set(t * d.spin, t * d.spin * 0.7, 0);
      dummy.scale.setScalar(d.s * e);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group {...props}>
      <mesh ref={body} geometry={bodyGeom} material={bodyMat} />
      <instancedMesh ref={inst} args={[shardGeom, shardMat, shards]} frustumCulled={false} />
    </group>
  );
}

/** Glowing energy rings, like the halo around the figure on the cover. */
export function Orbits(props: React.ComponentProps<"group">) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const rings = useMemo(
    () => [
      { r: 3.2, tube: 0.025, color: "#5fe0cf", tilt: [1.2, 0, 0.2], speed: 0.35 },
      { r: 3.8, tube: 0.018, color: "#5fb4f0", tilt: [1.35, 0.3, -0.3], speed: -0.22 },
      { r: 4.5, tube: 0.012, color: "#ffffff", tilt: [1.05, -0.2, 0.5], speed: 0.15 },
    ],
    [],
  );
  useFrame((_, dt) => {
    refs.current.forEach((m, i) => {
      if (m) m.rotation.z += dt * rings[i].speed;
    });
  });
  return (
    <group {...props}>
      {rings.map((r, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} rotation={r.tilt as [number, number, number]}>
          <torusGeometry args={[r.r, r.tube, 16, 220]} />
          <meshBasicMaterial color={r.color} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      {/* soft halo glows */}
      {rings.map((r, i) => (
        <mesh key={`h${i}`} rotation={r.tilt as [number, number, number]}>
          <torusGeometry args={[r.r, r.tube * 8, 12, 160]} />
          <meshBasicMaterial color={r.color} transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
