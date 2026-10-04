"use client";

import { useSyncExternalStore } from "react";

let cached: boolean | null = null;

function detect(): boolean {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement("canvas");
    cached = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    cached = false;
  }
  return cached;
}

const noop = () => () => {};

/** True on the server and until proven otherwise, so markup stays stable through hydration. */
export function useWebGLSupport(): boolean {
  return useSyncExternalStore(noop, detect, () => true);
}
