"use client";

import { useSyncExternalStore } from "react";

/**
 * Shared state for the opening sequence.
 *
 * `loading`  the intro screen is up and tracking real progress
 * `reveal`   curtains are parting, the wordmark is flying to the header
 * `done`     the page is fully handed over
 *
 * Progress comes from three real sources: web fonts, the 3D model bytes and
 * the first rendered frame of the configurator.
 */
export type IntroPhase = "loading" | "reveal" | "done";

type Sources = { fonts: number; scene: number; model: number; ready: number };

const WEIGHTS: Sources = { fonts: 0.1, scene: 0.1, model: 0.6, ready: 0.2 };

const state = {
  phase: "loading" as IntroPhase,
  sources: { fonts: 0, scene: 0, model: 0, ready: 0 } as Sources,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Whether the intro was already played this session (set by the inline head script). */
export function introSkippedAtBoot(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.intro !== "on";
}

function clientPhase(): IntroPhase {
  if (state.phase === "loading" && introSkippedAtBoot()) state.phase = "done";
  return state.phase;
}

export function setIntroPhase(phase: IntroPhase) {
  if (state.phase === phase) return;
  state.phase = phase;
  if (phase === "done" && typeof document !== "undefined") {
    document.documentElement.dataset.intro = "off";
    try {
      sessionStorage.setItem("maison-intro", "seen");
    } catch {
      /* storage can be unavailable in private modes */
    }
  }
  emit();
}

export function reportProgress(source: keyof Sources, value: number) {
  const v = Math.max(0, Math.min(1, value));
  if (v <= state.sources[source]) return;
  state.sources[source] = v;
  emit();
}

export function getProgress(): number {
  let total = 0;
  for (const key of Object.keys(WEIGHTS) as (keyof Sources)[]) {
    total += WEIGHTS[key] * state.sources[key];
  }
  return Math.min(1, total);
}

export function useIntroPhase(): IntroPhase {
  return useSyncExternalStore(subscribe, clientPhase, () => "loading");
}

export function useLoadProgress(): number {
  return useSyncExternalStore(subscribe, getProgress, () => 0);
}

/** Hero content may animate in once the curtains start to part. */
export function useHeroReady(): boolean {
  return useIntroPhase() !== "loading";
}
