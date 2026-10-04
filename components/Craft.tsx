"use client";

import Image from "next/image";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
import { CHAIR_PATHS, CHAIR_VIEWBOX } from "@/components/chair-outline";
import { Reveal, RevealItem } from "@/components/Reveal";
import { usePrefersReducedMotion } from "@/lib/media";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    title: "Drawn at full size",
    body: "Every piece starts as a full-scale elevation in our Copenhagen studio. We sit in cardboard mock-ups for weeks before a single board is cut.",
  },
  {
    title: "A frame that rests",
    body: "In the Mumbai workshop, hardwood is cut, joined and bolted with solid brass, then left to settle for a week so it never creaks later.",
  },
  {
    title: "Tufted by hand",
    body: "Each button is set by hand and pulled to the same tension, so the velvet reads as one calm, quilted surface.",
  },
  {
    title: "Finished slowly",
    body: "Frames are oiled three times, brass is polished, and every piece is signed underneath by the person who built it.",
  },
];

const VISUALS = [
  { kind: "drawing" as const },
  { kind: "image" as const, src: "/craft/frame.webp", alt: "Close-up of a walnut chair leg joined to the seat rail with solid brass bolts" },
  { kind: "image" as const, src: "/craft/tufting.webp", alt: "Buttoned, quilted seat of the Ilse chair in Chai velvet, seen from above" },
  { kind: "image" as const, src: "/craft/finish.webp", alt: "The Ilse chair in Peacock velvet with an ebonised frame, seen from a low angle" },
];

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block whitespace-pre">
      {word}{" "}
    </motion.span>
  );
}

/** A paragraph that inks itself in, word by word, as it scrolls through the viewport. */
function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {reduce
        ? text
        : words.map((w, i) => (
            <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
          ))}
    </p>
  );
}

function Drawing({ active }: { active: boolean }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-oat-50">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(28,25,22,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(28,25,22,0.06)_1px,transparent_1px)] [background-size:28px_28px]"
      />
      <svg viewBox={CHAIR_VIEWBOX} className="relative h-[62%] w-auto overflow-visible text-ink-900" fill="none" role="img" aria-label="Line drawing of the Ilse chair">
        {CHAIR_PATHS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke="currentColor"
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: active ? 1 : 0 }}
            transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1], delay: active ? 0.1 + i * 0.08 : 0 }}
          />
        ))}
        {/* Dimension lines */}
        <g className="text-clay-600" stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke">
          <path d="M 8 846 H 760 M 8 834 V 858 M 760 834 V 858" vectorEffect="non-scaling-stroke" />
          <path d="M 806 4 V 796 M 794 4 H 818 M 794 796 H 818" vectorEffect="non-scaling-stroke" />
        </g>
        <text x="384" y="896" textAnchor="middle" className="fill-clay-600 font-sans text-[26px] tracking-[0.12em]">
          83 CM
        </text>
        <text x="852" y="410" textAnchor="middle" className="fill-clay-600 font-sans text-[26px] tracking-[0.12em]" transform="rotate(90 852 410)">
          69 CM
        </text>
      </svg>
      <p className="label absolute bottom-5 left-5 text-ink-500">Ilse · elevation study · 1:10</p>
    </div>
  );
}

export function Craft() {
  const steps = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: steps, offset: ["start 0.6", "end 0.6"] });
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const drift = useTransform(scrollYProgress, [0, 1], [1.06, 1]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length)));
    setActive((a) => (a === next ? a : next));
  });

  return (
    <section id="craft" aria-labelledby="craft-title" className="relative scroll-mt-16 bg-oat-150">
      <div className="mx-auto max-w-[1680px] px-5 pt-24 md:px-8 md:pt-32 lg:px-12 lg:pt-40">
        <Reveal>
          <RevealItem as="p" className="label text-ink-500">
            The craft
          </RevealItem>
          <h2 id="craft-title" className="sr-only">
            How a Maison piece is made
          </h2>
        </Reveal>
        <ScrollWords
          className="mt-8 max-w-[24ch] font-serif text-[clamp(2.1rem,4.6vw,4.4rem)] leading-[1.06] font-light tracking-[-0.015em] text-ink-900"
          text="We make fewer things, and we make them slowly. Drawn in Copenhagen, built by hand in Mumbai, and meant to outlive their first owners."
        />
      </div>

      <div className="mx-auto grid max-w-[1680px] gap-10 px-5 pt-20 pb-24 md:px-8 md:pb-32 lg:grid-cols-12 lg:px-12 lg:pt-28 lg:pb-40">
        {/* Sticky visual (desktop) */}
        <div className="hidden lg:col-span-6 lg:block">
          <div className="sticky top-[calc(var(--header-h)+2rem)] h-[calc(100svh-var(--header-h)-4rem)] max-h-[860px] overflow-hidden rounded-[1.25rem] bg-oat-200">
            {VISUALS.map((v, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 bg-oat-200"
                initial={false}
                animate={{ clipPath: i <= active ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
                transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
                style={{ zIndex: i }}
              >
                {v.kind === "drawing" ? (
                  <Drawing active={active === 0} />
                ) : (
                  <motion.div className="relative h-full w-full" style={{ scale: drift }}>
                    <Image src={v.src} alt={v.alt} fill sizes="50vw" className="object-cover" />
                  </motion.div>
                )}
              </motion.div>
            ))}
            <div className="label absolute right-5 bottom-5 z-10 rounded-full bg-oat-50/80 px-3 py-2 text-ink-700 backdrop-blur">
              <span className="tabular">0{active + 1}</span> / 0{STEPS.length}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="relative lg:col-span-5 lg:col-start-8">
          <div aria-hidden className="absolute top-0 bottom-0 left-0 hidden w-px bg-ink-900/10 lg:block">
            <motion.div className="h-full w-full origin-top bg-clay-600" style={{ scaleY: fill }} />
          </div>
          <ol ref={steps} className="flex flex-col gap-16 lg:gap-0">
            {STEPS.map((s, i) => (
              <li key={s.title} className="lg:flex lg:min-h-[78svh] lg:items-center lg:pl-12">
                <div className="mb-6 aspect-[4/5] overflow-hidden rounded-[1rem] bg-oat-200 lg:hidden">
                  {VISUALS[i].kind === "drawing" ? (
                    <Drawing active />
                  ) : (
                    <div className="relative h-full w-full">
                      <Image src={(VISUALS[i] as { src: string }).src} alt={(VISUALS[i] as { alt: string }).alt} fill sizes="100vw" className="object-cover" />
                    </div>
                  )}
                </div>
                <motion.div
                  initial={false}
                  animate={{ opacity: active === i ? 1 : 0.32 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="max-lg:!opacity-100"
                >
                  <p className="tabular font-serif text-[1.25rem] text-clay-600 italic">0{i + 1}</p>
                  <h3 className="mt-3 font-serif text-[clamp(2.25rem,3.4vw,3.25rem)] leading-[1.02] font-light">{s.title}</h3>
                  <p className="mt-5 max-w-[38ch] text-[1.0625rem] leading-relaxed text-ink-700">{s.body}</p>
                </motion.div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
