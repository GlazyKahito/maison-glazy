"use client";

import { animate } from "motion/react";
import { useEffect, useRef } from "react";
import { PRODUCTS } from "@/lib/catalog";
import { getProgress, reportProgress, setIntroPhase, useIntroPhase } from "@/lib/intro";
import { CHAIR_PATHS, CHAIR_VIEWBOX } from "@/components/chair-outline";

const MIN_MS = 1150;
const MAX_MS = 9000;
const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const;

async function trackModel(url: string) {
  try {
    const res = await fetch(url);
    const total = Number(res.headers.get("content-length")) || 0;
    if (!res.body || !total) {
      await res.arrayBuffer();
      reportProgress("model", 1);
      return;
    }
    const reader = res.body.getReader();
    let loaded = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      loaded += value.byteLength;
      reportProgress("model", loaded / total);
    }
    reportProgress("model", 1);
  } catch {
    reportProgress("model", 1);
  }
}

export function Intro() {
  const phase = useIntroPhase();
  const root = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLParagraphElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const art = useRef<SVGSVGElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLDivElement>(null);
  const pleats = useRef<(HTMLDivElement | null)[]>([]);
  const exiting = useRef(false);

  useEffect(() => {
    if (phase !== "loading") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let shown = 0;
    let raf = 0;
    let cancelled = false;

    document.fonts?.ready.then(() => reportProgress("fonts", 1)).catch(() => reportProgress("fonts", 1));
    void trackModel(PRODUCTS.ilse.model);

    const finish = async (skipped: boolean) => {
      if (exiting.current || cancelled) return;
      exiting.current = true;
      cancelAnimationFrame(raf);
      const el = root.current;
      if (!el) {
        setIntroPhase("done");
        return;
      }

      if (skipped || reduce) {
        setIntroPhase("reveal");
        await animate(el, { opacity: 0 }, { duration: reduce ? 0.5 : 0.35, ease: "easeOut" });
        setIntroPhase("done");
        return;
      }

      // 1. Captions and the drawing step back.
      for (const el of [meta.current, skip.current]) if (el) animate(el, { opacity: 0 }, { duration: 0.35, ease: "easeOut" });
      if (art.current) animate(art.current, { opacity: 0, y: -12 }, { duration: 0.5, ease: "easeOut" });

      // 2. The wordmark flies to its seat in the header.
      const target = document.getElementById("site-wordmark");
      if (word.current && target) {
        const a = word.current.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        animate(
          word.current,
          {
            x: b.left + b.width / 2 - (a.left + a.width / 2),
            y: b.top + b.height / 2 - (a.top + a.height / 2),
            scale: b.width / a.width,
          },
          { duration: 1.05, ease: CURTAIN_EASE, delay: 0.12 },
        );
      }

      // 3. Curtains part from the centre out; the hero starts its entrance underneath.
      window.setTimeout(() => setIntroPhase("reveal"), 380);
      const moves = pleats.current.map((p, i) => {
        if (!p) return Promise.resolve();
        const left = i < 3;
        const depth = left ? 3 - i : i - 2; // innermost pleats travel furthest
        return animate(
          p,
          { x: `${(left ? -1 : 1) * depth * 100}%` },
          { duration: 1.15, ease: CURTAIN_EASE, delay: 0.3 + (3 - depth) * 0.07 },
        );
      });
      await Promise.all(moves);
      setIntroPhase("done");
    };

    const tick = () => {
      const now = performance.now();
      const elapsed = now - start;
      const real = elapsed > MAX_MS ? 1 : getProgress();
      // Ease the visible number towards real progress, never faster than the minimum duration allows.
      const cap = Math.min(1, elapsed / MIN_MS);
      shown += (Math.min(real, cap) - shown) * 0.14;
      if (Math.min(real, cap) >= 1 && 1 - shown < 0.004) shown = 1;
      const v = Math.floor(shown * 100);
      if (pct.current) pct.current.textContent = String(v).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${shown})`;
      art.current?.style.setProperty("--draw", String(1 - shown));
      root.current?.setAttribute("aria-valuenow", String(v));
      if (shown >= 1) {
        void finish(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") void finish(true);
    };
    const onSkip = () => void finish(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("maison:skip-intro", onSkip);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("maison:skip-intro", onSkip);
    };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      ref={root}
      className="intro fixed inset-0 z-[90] select-none"
      role="progressbar"
      aria-label="Loading Maison"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      {/* Curtain: six pleats that part from the centre */}
      <div className="absolute inset-0 flex" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            ref={(el) => {
              pleats.current[i] = el;
            }}
            className="relative h-full flex-1 bg-oat-100 will-change-transform"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(120,90,60,0.035), rgba(255,255,255,0.12) 38%, rgba(120,90,60,0.015) 72%, rgba(120,90,60,0.05))",
              boxShadow: i < 3 ? "18px 0 40px -22px rgba(60,40,20,0.22)" : "-18px 0 40px -22px rgba(60,40,20,0.22)",
              zIndex: i < 3 ? i : 5 - i,
            }}
          />
        ))}
      </div>

      {/* Drawing + wordmark */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
        <svg
          ref={art}
          viewBox={CHAIR_VIEWBOX}
          className="h-[min(34vh,22rem)] w-auto overflow-visible text-ink-900"
          fill="none"
          aria-hidden
        >
          {CHAIR_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              pathLength={1}
              className="intro-line"
              stroke="currentColor"
              strokeWidth={1.1}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
        <p
          ref={word}
          className="mt-[min(5vh,2.75rem)] origin-center font-serif text-[clamp(2.75rem,7.5vw,5.75rem)] leading-none font-medium tracking-[0.34em] text-ink-900 will-change-transform"
        >
          MAISON
        </p>
      </div>

      {/* Captions */}
      <div ref={meta} className="absolute inset-0 z-10 px-5 py-5 md:px-8 md:py-7 lg:px-12" aria-hidden>
        <div className="label flex justify-between text-ink-500">
          <span>Atelier Maison</span>
          <span>Copenhagen · Mumbai</span>
        </div>
        <div className="absolute inset-x-5 bottom-5 md:inset-x-8 md:bottom-7 lg:inset-x-12">
          <div className="flex items-end justify-between">
            <span className="label text-ink-500">Setting up the studio</span>
            <span className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[0.8] font-light text-ink-900">
              <span ref={pct} className="tabular">
                000
              </span>
              <span className="ml-1 text-[0.45em] text-ink-400">%</span>
            </span>
          </div>
          <span className="mt-4 block h-px w-full bg-ink-900/10">
            <span ref={bar} className="block h-full origin-left scale-x-0 bg-ink-900" />
          </span>
        </div>
      </div>

      <div ref={skip} className="relative z-20">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("maison:skip-intro"))}
          className="label absolute top-5 left-1/2 z-10 -translate-x-1/2 rounded-full border border-ink-900/15 bg-oat-100/60 px-4 py-2.5 text-ink-700 transition-colors hover:bg-oat-200 md:top-6"
        >
          Skip intro <span className="ml-1 hidden text-ink-400 md:inline">Esc</span>
        </button>
      </div>
    </div>
  );
}
