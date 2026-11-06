"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* ---------- Molecule (stylised fluoroquinolone core: two fused rings + side groups) ---------- */

type Atom = { p: THREE.Vector3; el: "C" | "N" | "O" | "H" };
const COLORS = { C: "#9fb3c8", N: "#2563eb", O: "#e0313a", H: "#f1f6ff" } as const;
const RADII = { C: 0.3, N: 0.32, O: 0.32, H: 0.18 } as const;

function buildMolecule() {
  const atoms: Atom[] = [];
  const bonds: [number, number][] = [];
  const R = 1.25;
  const dx = R * Math.sqrt(3);
  const ring = (cx: number) =>
    Array.from({ length: 6 }, (_, k) => {
      const a = Math.PI / 6 + (k * Math.PI) / 3;
      return new THREE.Vector3(cx + R * Math.cos(a), R * Math.sin(a), 0);
    });
  const add = (p: THREE.Vector3, el: Atom["el"]) => {
    const near = atoms.findIndex((a) => a.p.distanceTo(p) < 0.05);
    if (near >= 0) return near;
    atoms.push({ p, el });
    return atoms.length - 1;
  };
  const ringA = ring(-dx / 2).map((p, k) => add(p, k === 3 ? "N" : "C"));
  const ringB = ring(dx / 2).map((p, k) => add(p, k === 4 ? "N" : "C"));
  for (const r of [ringA, ringB]) for (let k = 0; k < 6; k++) bonds.push([r[k], r[(k + 1) % 6]]);
  const sub = (from: number, dir: THREE.Vector3, el: Atom["el"], len = 1.2) => {
    const i = add(atoms[from].p.clone().add(dir.clone().normalize().multiplyScalar(len)), el);
    bonds.push([from, i]);
    return i;
  };
  // carbonyl + carboxylic acid on ring B
  const top = ringB[1];
  sub(top, new THREE.Vector3(0, 1, 0), "O");
  const c = sub(ringB[0], new THREE.Vector3(1, 0.6, 0), "C");
  sub(c, new THREE.Vector3(0.4, 1, 0), "O");
  const oh = sub(c, new THREE.Vector3(1, -0.4, 0), "O");
  sub(oh, new THREE.Vector3(1, -0.6, 0.3), "H", 0.8);
  // amine side chain + hydrogens on ring A
  const n = sub(ringA[2], new THREE.Vector3(-1, 0.6, 0), "N");
  sub(n, new THREE.Vector3(-1, 0.7, 0.4), "H", 0.8);
  const me = sub(ringA[4], new THREE.Vector3(-0.3, -1, 0), "C");
  sub(me, new THREE.Vector3(-1, -0.4, 0.5), "H", 0.8);
  sub(me, new THREE.Vector3(0.6, -0.8, -0.5), "H", 0.8);
  sub(ringA[1], new THREE.Vector3(0, 1, 0.2), "H", 0.8);
  sub(ringB[5], new THREE.Vector3(0.3, -1, 0.2), "H", 0.8);
  // centre on origin
  const centre = atoms.reduce((s, a) => s.add(a.p), new THREE.Vector3()).divideScalar(atoms.length);
  atoms.forEach((a) => a.p.sub(centre));
  return { atoms, bonds };
}

export function Molecule(props: React.ComponentProps<"group">) {
  const group = useRef<THREE.Group>(null);
  const { atoms, bonds } = useMemo(buildMolecule, []);
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 32, 32), []);
  const stick = useMemo(() => new THREE.CylinderGeometry(0.07, 0.07, 1, 12), []);
  const bondMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c7d6ea", metalness: 0.6, roughness: 0.25 }), []);
  const mats = useMemo(
    () => Object.fromEntries(Object.entries(COLORS).map(([k, c]) => [k, new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.15, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.1 })])) as unknown as Record<Atom["el"], THREE.Material>,
    [],
  );
  const sticks = useMemo(() => {
    const up = new THREE.Vector3(0, 1, 0);
    return bonds.map(([a, b]) => {
      const pa = atoms[a].p, pb = atoms[b].p;
      const mid = pa.clone().add(pb).multiplyScalar(0.5);
      const dir = pb.clone().sub(pa);
      const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
      return { mid, q, len: dir.length() };
    });
  }, [atoms, bonds]);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.25;
  });

  return (
    <group ref={group} {...props}>
      {atoms.map((a, i) => (
        <mesh key={i} geometry={sphere} material={mats[a.el]} position={a.p} scale={RADII[a.el]} />
      ))}
      {sticks.map((s, i) => (
        <mesh key={i} geometry={stick} material={bondMat} position={s.mid} quaternion={s.q} scale={[1, s.len, 1]} />
      ))}
    </group>
  );
}

/* ---------- Drifting bacteria (instanced capsules) ---------- */

export function Bacteria({ count = 26, seed = 0 }: { count?: number; seed?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (n: number) => ((Math.sin((i + seed * 31) * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
        return {
          x: (r(1) - 0.5) * 22,
          y: (r(2) - 0.5) * 12,
          z: -4 - r(3) * 10,
          s: 0.35 + r(4) * 0.6,
          speed: 0.15 + r(5) * 0.35,
          rot: r(6) * Math.PI,
        };
      }),
    [count],
  );
  const geom = useMemo(() => new THREE.CapsuleGeometry(0.35, 1.4, 8, 16), []);
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#5fb4f0", emissive: "#1e5bd8", emissiveIntensity: 0.35, roughness: 0.2, transmission: 0.4, thickness: 0.8, transparent: true, opacity: 0.75 }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const m = ref.current;
    if (!m) return;
    seeds.forEach((s, i) => {
      dummy.position.set(s.x + Math.sin(t * s.speed + i) * 0.8, s.y + Math.cos(t * s.speed * 0.8 + i) * 0.6, s.z);
      dummy.rotation.set(s.rot + t * s.speed * 0.4, t * s.speed * 0.3, s.rot);
      dummy.scale.setScalar(s.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geom, mat, count]} frustumCulled={false} />;
}

/* ---------- Glowing particle dust ---------- */

export function Dust({ count = 1400, color = "#9fd8ff" }: { count?: number; color?: string }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = (n: number) => ((Math.sin(i * 91.17 + n * 13.7) * 10000) % 1 + 1) % 1;
      p[i * 3] = (r(1) - 0.5) * 30;
      p[i * 3 + 1] = (r(2) - 0.5) * 18;
      p[i * 3 + 2] = -r(3) * 14;
    }
    return p;
  }, [count]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.01;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={color} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
    </points>
  );
}

/* ---------- Mouse parallax ---------- */

export function Rig() {
  useFrame(({ camera, pointer }, dt) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 1.2, 3, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * 0.7, 3, dt);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

