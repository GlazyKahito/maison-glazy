"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FABRICS,
  PRODUCT_ORDER,
  PRODUCTS,
  fabricById,
  finishById,
  formatPrice,
  type ProductId,
} from "@/lib/catalog";
import { cart } from "@/lib/cart";
import { useConfigurator } from "@/lib/configurator";
import { reportProgress, useHeroReady } from "@/lib/intro";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/media";
import { useWebGLSupport } from "@/lib/webgl";
import { MODEL_FIT } from "@/components/three/Scene";
import { CanvasBoundary } from "./CanvasBoundary";

const ConfiguratorCanvas = dynamic(() => import("./ConfiguratorCanvas"), { ssr: false });

const EASE = [0.16, 1, 0.3, 1] as const;

const rise: Variants = {
  out: { opacity: 0, y: 28 },
  in: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE, delay } }),
};

const line: Variants = {
  out: { y: "108%" },
  in: (delay: number = 0) => ({ y: "0%", transition: { duration: 1.2, ease: EASE, delay } }),
};

const fade: Variants = {
  out: { opacity: 0 },
  in: (delay: number = 0) => ({ opacity: 1, transition: { duration: 1.2, ease: EASE, delay } }),
};

/** Still of the piece in the same framing as the 3D camera (no-WebGL fallback and first paint). */
function Poster({ productId }: { productId: ProductId }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center xl:-translate-x-[1%]"
      style={{ "--fit": MODEL_FIT[productId].fitAspect } as React.CSSProperties}
    >
      <Image
        src={productId === "ilse" ? "/hero/ilse.png" : "/products/sora-monsoon.webp"}
        alt={
          productId === "ilse"
            ? "The Ilse lounge chair in Mango velvet with a walnut frame"
            : "The Sora sofa in Monsoon velvet"
        }
        width={productId === "ilse" ? 1185 : 800}
        height={1000}
        priority={productId === "ilse"}
        sizes="(min-width: 1280px) 80vw, 100vw"
        className="poster-fit select-none object-contain xl:scale-[0.769]"
        draggable={false}
      />
    </div>
  );
}

export function Configurator() {
  const { productId, selection, setProduct, setFabric, setFinish } = useConfigurator();
  const reducedMotion = usePrefersReducedMotion();
  const heroReady = useHeroReady();
  const webgl = useWebGLSupport();
  const wide = useMediaQuery("(min-width: 1280px)");

  const product = PRODUCTS[productId];
  const sel = selection[productId];
  const fabric = fabricById(sel.fabric);
  const finish = finishById(product, sel.finish);

  const stageRef = useRef<HTMLDivElement>(null);
  const nudgeRef = useRef(0);
  const [active, setActive] = useState(true);
  const [rendered, setRendered] = useState<Partial<Record<ProductId, boolean>>>({});
  const [switching, setSwitching] = useState(false);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const [added, setAdded] = useState(false);
  const [interacted, setInteracted] = useState(false);

  const show3D = webgl && !canvasFailed;

  // Without WebGL the still is the final state: tell the intro there is nothing to wait for.
  useEffect(() => {
    if (show3D) return;
    reportProgress("scene", 1);
    reportProgress("ready", 1);
  }, [show3D]);

  // Pause the render loop whenever the stage is off screen.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "120px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!added) return;
    const id = window.setTimeout(() => setAdded(false), 2200);
    return () => window.clearTimeout(id);
  }, [added]);

  const onFirstFrame = useCallback(() => {
    reportProgress("ready", 1);
    setRendered((r) => (r[productId] ? r : { ...r, [productId]: true }));
  }, [productId]);

  const switchProduct = (id: ProductId) => {
    if (id === productId || switching) return;
    if (reducedMotion) {
      setProduct(id);
      return;
    }
    setSwitching(true);
    window.setTimeout(() => {
      setProduct(id);
      setSwitching(false);
    }, 260);
  };

  const onStageKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      nudgeRef.current += e.key === "ArrowLeft" ? -0.4 : 0.4;
      setInteracted(true);
    }
  };

  const addToCart = () => {
    cart.add({
      key: `${product.id}:${fabric.id}:${finish.id}`,
      productId: product.id,
      name: product.name,
      type: product.type,
      options: [`${fabric.name} velvet`, `${finish.name} ${product.finishLabel.toLowerCase()}`],
      swatch: fabric.swatch,
      image: `/products/${product.id}-${fabric.id}.webp`,
      unitPrice: product.price,
    });
    setAdded(true);
    cart.open();
  };

  const isRendered = !!rendered[productId];
  const stageVisible = heroReady && !switching && (isRendered || !show3D);
  const animState = heroReady ? "in" : "out";
  const showPoster = !show3D || (reducedMotion && !isRendered && productId === "ilse");

  return (
    <section
      id="configure"
      aria-labelledby="configurator-heading"
      className="relative isolate overflow-hidden xl:h-[100svh] xl:min-h-[700px]"
    >
      {/* ---------- Stage: full bleed on wide screens, a block above the copy on smaller ones ---------- */}
      <div
        ref={stageRef}
        className="relative mt-[var(--header-h)] h-[56svh] min-h-[360px] md:h-[62svh] xl:absolute xl:inset-0 xl:mt-0 xl:h-auto"
      >
        {/* Giant name behind the piece */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden [container-type:inline-size] xl:pr-[2%]"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1, ease: EASE, delay: heroReady ? 0.15 : 0 }}
              className="block select-none font-serif text-[clamp(9rem,44cqw,30rem)] leading-none font-light tracking-[-0.03em] text-oat-200 italic xl:-translate-y-[4%] xl:text-[min(27vw,44vh)]"
            >
              {product.name}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* The 3D view */}
        <div
          className="absolute inset-0 [container-type:size] focus-visible:outline-offset-[-8px]"
          tabIndex={0}
          role="group"
          aria-roledescription="3D viewer"
          aria-label={`${product.name} ${product.type.toLowerCase()} in ${fabric.name} velvet with a ${finish.name.toLowerCase()} ${product.finishLabel.toLowerCase()}`}
          aria-describedby="stage-hint"
          onKeyDown={onStageKey}
          onPointerDown={() => setInteracted(true)}
        >
          {showPoster && (
            <div className={`transition-opacity duration-700 ${heroReady ? "opacity-100" : "opacity-0"}`}>
              <Poster productId={productId} />
            </div>
          )}
          {show3D && (
            <div
              className="absolute inset-0 transition-opacity ease-out"
              style={{ opacity: stageVisible ? 1 : 0, transitionDuration: switching ? "240ms" : "900ms" }}
            >
              <CanvasBoundary fallback={<Poster productId={productId} />} onError={() => setCanvasFailed(true)}>
                <ConfiguratorCanvas
                  productId={productId}
                  fabricId={sel.fabric}
                  finishId={sel.finish}
                  revealed={heroReady}
                  active={active}
                  reducedMotion={reducedMotion}
                  nudgeRef={nudgeRef}
                  wide={wide}
                  onFirstFrame={onFirstFrame}
                />
              </CanvasBoundary>
            </div>
          )}
          {show3D && heroReady && !isRendered && !switching && (
            <p className="label absolute inset-x-0 top-1/2 text-center text-ink-400 xl:pr-[2%]" role="status">
              Bringing {product.name} into the studio…
            </p>
          )}
        </div>

        {/* Piece switcher */}
        <motion.div
          variants={fade}
          initial="out"
          animate={animState}
          custom={1.1}
          className="absolute top-4 left-5 md:left-8 xl:top-[calc(var(--header-h)+1.25rem)] xl:right-12 xl:left-auto"
        >
          <div
            role="group"
            aria-label="Choose a piece"
            className="flex gap-1 rounded-full border border-ink-900/10 bg-oat-50/70 p-1 backdrop-blur-md"
          >
            {PRODUCT_ORDER.map((id) => {
              const p = PRODUCTS[id];
              const on = id === productId;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => switchProduct(id)}
                  className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.8125rem] transition-colors duration-300 ${
                    on ? "bg-ink-900 text-oat-50" : "text-ink-700 hover:bg-oat-200"
                  }`}
                >
                  <span className="tabular text-[0.6875rem] opacity-60">{p.index}</span>
                  {p.name}
                  <span className="sr-only">, {p.type}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Hint */}
        <motion.p
          id="stage-hint"
          variants={fade}
          initial="out"
          animate={animState}
          custom={1.4}
          className="label pointer-events-none absolute top-6 right-5 flex items-center gap-2.5 whitespace-nowrap text-ink-500 md:right-8 xl:top-auto xl:right-auto xl:bottom-9 xl:left-[49%] xl:-translate-x-1/2"
        >
          <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden className={interacted ? "opacity-40" : ""}>
            <path
              d="M1 5h20M1 5l3.5-3.5M1 5l3.5 3.5M21 5l-3.5-3.5M21 5l-3.5 3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
          <span className="hidden md:inline">Drag to turn · arrow keys when focused</span>
          <span className="md:hidden">Swipe to turn</span>
        </motion.p>
      </div>

      {/* ---------- Foreground: headline and controls ---------- */}
      <div className="pointer-events-none relative z-10 mx-auto grid max-w-[1680px] gap-8 px-5 pb-14 md:grid-cols-2 md:gap-10 md:px-8 md:pb-20 xl:absolute xl:inset-0 xl:block xl:px-12 xl:pb-0">
        <div className="-mt-12 md:-mt-20 xl:absolute xl:top-[calc(var(--header-h)+clamp(1.5rem,8vh,5.5rem))] xl:left-12 xl:mt-0 xl:w-[min(46rem,50vw)]">
          <motion.p variants={rise} initial="out" animate={animState} custom={0.3} className="label text-ink-500">
            Atelier Maison <span className="mx-2 text-clay-600">/</span> Collection 2026
          </motion.p>
          <h1 className="mt-4 font-serif text-display font-light tracking-[-0.025em] text-ink-900 xl:mt-5">
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span variants={line} initial="out" animate={animState} custom={0.38} className="block">
                Velvet, wood
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span variants={line} initial="out" animate={animState} custom={0.5} className="block">
                <span className="text-clay-600 italic">&amp; patience.</span>
              </motion.span>
            </span>
          </h1>
          <motion.p
            variants={rise}
            initial="out"
            animate={animState}
            custom={0.7}
            className="mt-5 max-w-[34ch] text-[1.0625rem] leading-relaxed text-ink-700 xl:mt-6"
          >
            Pieces drawn in Copenhagen and built by hand in Mumbai. Pick a velvet and a finish: the piece changes as
            you do.
          </motion.p>
        </div>

        {/* Scroll cue (wide screens) */}
        <motion.a
          href="#collection"
          variants={fade}
          initial="out"
          animate={animState}
          custom={1.5}
          className="label pointer-events-auto absolute bottom-9 left-12 hidden items-center gap-3 text-ink-500 transition-colors hover:text-ink-900 xl:flex"
        >
          <span className="relative block h-9 w-px overflow-hidden bg-ink-900/15" aria-hidden>
            <span className="scroll-cue absolute inset-x-0 top-0 block h-1/2 bg-ink-900" />
          </span>
          Scroll to the collection
        </motion.a>

        {/* Dock */}
        <motion.div
          variants={rise}
          initial="out"
          animate={animState}
          custom={0.85}
          className="pointer-events-auto md:mt-4 xl:absolute xl:right-12 xl:bottom-[clamp(1.25rem,4.5vh,3rem)] xl:mt-0 xl:w-[23.5rem]"
        >
          <div className="rounded-[1.25rem] border border-ink-900/8 bg-oat-50/80 p-5 shadow-[0_30px_80px_-40px_rgba(60,40,20,0.35)] backdrop-blur-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="configurator-heading"
                  tabIndex={-1}
                  className="font-serif text-[2.3rem] leading-none font-normal focus:outline-none"
                >
                  {product.name}
                </h2>
                <p className="label mt-2 text-ink-500">{product.type}</p>
              </div>
              <p className="tabular pt-1 text-[1.125rem] text-ink-900">{formatPrice(product.price)}</p>
            </div>

            <div className="mt-4 border-t border-ink-900/8 pt-4">
              <div className="flex items-baseline justify-between">
                <p id="fabric-label" className="label text-ink-500">
                  Velvet
                </p>
                <p className="text-[0.875rem] text-ink-900" aria-live="polite">
                  {fabric.name}
                </p>
              </div>
              <div role="group" aria-labelledby="fabric-label" className="mt-3 flex flex-wrap gap-2">
                {FABRICS.map((f, i) => {
                  const on = f.id === fabric.id;
                  return (
                    <motion.button
                      key={f.id}
                      type="button"
                      aria-pressed={on}
                      aria-label={`${f.name} velvet`}
                      title={`${f.name} velvet`}
                      onClick={() => setFabric(f.id)}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={heroReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.7, ease: EASE, delay: heroReady ? 1.0 + i * 0.06 : 0 }}
                      className={`relative grid size-11 place-items-center rounded-full transition-shadow duration-300 ${
                        on
                          ? "shadow-[0_0_0_1.5px_var(--color-ink-900)]"
                          : "shadow-[0_0_0_1px_rgba(28,25,22,0.12)] hover:shadow-[0_0_0_1px_rgba(28,25,22,0.4)]"
                      }`}
                    >
                      <span
                        className="size-8 rounded-full"
                        style={{
                          background: `radial-gradient(circle at 32% 28%, color-mix(in oklab, ${f.swatch} 72%, white) 0%, ${f.swatch} 48%, color-mix(in oklab, ${f.swatch} 72%, black) 100%)`,
                        }}
                      />
                    </motion.button>
                  );
                })}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={fabric.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                  className="mt-3 min-h-[2.6em] text-[0.8125rem] leading-snug text-ink-500"
                >
                  {fabric.note}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-3 border-t border-ink-900/8 pt-4">
              <p id="finish-label" className="label text-ink-500">
                {product.finishLabel}
              </p>
              <div
                role="group"
                aria-labelledby="finish-label"
                className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-oat-200/70 p-1"
              >
                {product.finishes.map((f) => {
                  const on = f.id === finish.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setFinish(f.id)}
                      className={`flex items-center justify-center gap-1.5 rounded-full px-1.5 py-2.5 text-[0.8125rem] transition-all duration-300 ${
                        on
                          ? "bg-oat-50 text-ink-900 shadow-[0_2px_10px_-4px_rgba(60,40,20,0.35)]"
                          : "text-ink-700 hover:text-ink-900"
                      }`}
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full ring-1 ring-ink-900/15"
                        style={{ background: f.swatch }}
                        aria-hidden
                      />
                      <span className="truncate">{f.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={addToCart}
              className="mt-5 flex h-14 w-full items-center justify-between overflow-hidden rounded-full bg-ink-900 pr-2 pl-6 text-oat-50 transition-colors duration-300 hover:bg-clay-700"
            >
              <span className="relative block h-5 overflow-hidden text-[0.9375rem]">
                <span
                  className={`block transition-transform duration-500 ease-out-expo ${added ? "-translate-y-full" : ""}`}
                >
                  Add to cart
                </span>
                <span
                  className={`absolute inset-0 block transition-transform duration-500 ease-out-expo ${added ? "" : "translate-y-full"}`}
                  aria-hidden
                >
                  Added
                </span>
              </span>
              <span className="tabular flex h-10 items-center rounded-full bg-oat-50/12 px-4 text-[0.875rem]">
                {formatPrice(product.price)}
              </span>
            </button>
            <p className="mt-3.5 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[0.8125rem] text-ink-500">
              <span className="tabular">
                W {product.dimensions.w} · D {product.dimensions.d} · H {product.dimensions.h} cm
              </span>
              <span>Made to order, 8–10 weeks</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
