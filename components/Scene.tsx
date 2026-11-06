"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { SceneVariant } from "./scene/SitamaxScene";

// three.js is loaded only in the browser and only when a scene is on the page.
const SitamaxScene = dynamic(() => import("./scene/SitamaxScene"), { ssr: false });

/** True when this browser can create a WebGL context (some phones and battery-saver modes can't). */
function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Scene(props: { variant: SceneVariant; seed?: number; side?: "left" | "right" | "center" }) {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(hasWebGL()), []);
  return ok ? <SitamaxScene {...props} /> : null;
}
