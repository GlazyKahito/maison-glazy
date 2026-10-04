"use client";

import Image from "next/image";
import { FABRICS, PRODUCTS } from "@/lib/catalog";
import { useConfigurator } from "@/lib/configurator";
import { Reveal, RevealItem, RevealLine } from "@/components/Reveal";

const WOOD_NOTES: Record<string, string> = {
  walnut: "Deep, warm and quietly figured. Oiled by hand three times.",
  oak: "Pale, open-grained oak with a soft matte oil finish.",
  ebonised: "Oak stained to near black, then lacquered to a low sheen.",
};

function TryButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/btn mt-4 flex items-center gap-2 text-[0.8125rem] text-oat-100/80 transition-colors hover:text-oat-50"
    >
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1px] bg-left-bottom bg-no-repeat pb-0.5">Try it on Ilse</span>
      <span aria-hidden className="transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-1">
        →
      </span>
      <span className="sr-only">: {label}</span>
    </button>
  );
}

export function Materials() {
  const { showInConfigurator } = useConfigurator();
  const woods = PRODUCTS.ilse.finishes;

  return (
    <section id="materials" aria-labelledby="materials-title" className="relative scroll-mt-16 bg-ink-900 text-oat-100">
      <div className="mx-auto max-w-[1680px] px-5 py-24 md:px-8 md:py-32 lg:px-12 lg:py-40">
        <Reveal className="grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <RevealItem as="p" className="label text-oat-100/60">
              Materials
            </RevealItem>
            <h2 id="materials-title" className="mt-5 font-serif text-title font-light tracking-[-0.02em]">
              <RevealLine>Five velvets,</RevealLine>
              <RevealLine>
                <span className="italic text-clay-500">three woods.</span>
              </RevealLine>
            </h2>
          </div>
          <RevealItem as="p" className="max-w-[40ch] text-[1.0625rem] leading-relaxed text-oat-100/70 lg:col-span-4 lg:col-start-9">
            Our house velvet is a cotton weave with a short, dense pile that holds colour deeply and catches light at
            every edge. Frames are solid hardwood, never veneer.
          </RevealItem>
        </Reveal>

        <Reveal
          as="ul"
          className="-mx-5 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:mx-0 md:mt-20 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-5"
          stagger={0.08}
          amount={0.15}
        >
          {FABRICS.map((f, i) => (
            <RevealItem as="li" key={f.id} className="w-[72vw] shrink-0 snap-start sm:w-[44vw] md:w-auto">
              <div className="group relative aspect-square overflow-hidden rounded-[1rem] bg-ink-800">
                <Image
                  src={`/materials/fabric-${f.id}.webp`}
                  alt={`Close-up of the Ilse chair's buttoned back in ${f.name} velvet`}
                  fill
                  sizes="(min-width: 1024px) 19vw, (min-width: 768px) 31vw, 72vw"
                  className="object-cover transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.06]"
                />
                <span className="label absolute top-3 left-3 rounded-full bg-ink-900/55 px-2.5 py-1.5 text-oat-100/85 backdrop-blur">
                  V/{String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2.5">
                <span className="size-3 rounded-full ring-1 ring-oat-100/25" style={{ background: f.swatch }} aria-hidden />
                <h3 className="font-serif text-[1.75rem] leading-none">{f.name}</h3>
              </div>
              <p className="mt-2 text-[0.875rem] leading-snug text-oat-100/60">{f.note}</p>
              <TryButton label={`${f.name} velvet`} onClick={() => showInConfigurator("ilse", { fabric: f.id })} />
            </RevealItem>
          ))}
        </Reveal>

        <div className="mt-20 border-t border-oat-100/12 pt-10 md:mt-28">
          <Reveal as="ul" className="grid gap-10 md:grid-cols-3 md:gap-6" stagger={0.1} amount={0.2}>
            {woods.map((w) => (
              <RevealItem as="li" key={w.id} className="grid grid-cols-[7.5rem_1fr] items-center gap-5 lg:grid-cols-[9.5rem_1fr]">
                <div className="relative aspect-square overflow-hidden rounded-full bg-ink-800">
                  <Image
                    src={`/materials/finish-${w.id}.webp`}
                    alt={`Close-up of a chair leg and brass bolts in ${w.name.toLowerCase()}`}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-[1.75rem] leading-none">{w.name}</h3>
                  <p className="mt-2 text-[0.875rem] leading-snug text-oat-100/60">{WOOD_NOTES[w.id]}</p>
                  <TryButton label={`${w.name} frame`} onClick={() => showInConfigurator("ilse", { finish: w.id })} />
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
