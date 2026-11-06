"use client";

import dynamic from "next/dynamic";
import type { SceneVariant } from "./scene/SitamaxScene";

// three.js is loaded only in the browser and only when a scene is on the page.
const SitamaxScene = dynamic(() => import("./scene/SitamaxScene"), { ssr: false });

export default function Scene(props: { variant: SceneVariant; seed?: number; side?: "left" | "right" | "center" }) {
  return <SitamaxScene {...props} />;
}
