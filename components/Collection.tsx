"use client";

import Image from "next/image";
import { useState } from "react";
import { COLLECTION, formatPrice, type CollectionItem } from "@/lib/catalog";
import { cart } from "@/lib/cart";
import { useConfigurator } from "@/lib/configurator";
import { Reveal, RevealItem, RevealLine } from "@/components/Reveal";

function ProductCard({ item, index }: { item: CollectionItem; index: number }) {
  const { showInConfigurator } = useConfigurator();
  const [added, setAdded] = useState(false);

  const add = () => {
    cart.add({
      key: item.id,
      productId: item.id,
      name: item.name,
      type: item.type,
      options: [item.material],
      swatch: item.swatches[0],
      image: item.image,
      unitPrice: item.price,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] bg-oat-200">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_30%,rgba(255,255,255,0.55),transparent_60%)]"
        />
        <Image
          src={item.image}
          alt={item.alt}
          fill
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 92vw"
          className="object-contain transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.04]"
        />
        {item.hoverImage && (
          <Image
            src={item.hoverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 92vw"
            className="object-contain opacity-0 transition-[opacity,transform] duration-[1200ms] ease-out-expo group-hover:scale-[1.04] group-hover:opacity-100"
          />
        )}
        <span className="label absolute top-4 left-4 text-ink-500">No. {String(index + 1).padStart(2, "0")}</span>
        {item.configurable && (
          <span className="label absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-oat-50/85 px-2.5 py-1.5 text-ink-700 backdrop-blur">
            <span className="size-1.5 rounded-full bg-clay-500" aria-hidden />
            Live 3D
          </span>
        )}
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-[2.1rem] leading-none">
          {item.name}
          <span className="ml-2.5 font-sans text-[0.875rem] tracking-normal text-ink-500">{item.type}</span>
        </h3>
        <p className="tabular shrink-0 text-[0.9375rem] text-ink-900">{formatPrice(item.price)}</p>
      </div>
      <p className="mt-2 text-[0.875rem] text-ink-500">{item.material}</p>

      <div className="mt-5 flex items-center justify-between border-t border-ink-900/8 pt-4">
        <div className="flex items-center gap-2.5">
          <span className="flex -space-x-1" aria-hidden>
            {item.swatches.map((s) => (
              <span key={s} className="size-4 rounded-full ring-2 ring-oat-100" style={{ background: s }} />
            ))}
          </span>
          <span className="text-[0.8125rem] text-ink-500">
            {item.swatches.length} {item.swatches.length === 1 ? "finish" : item.configurable ? "velvets" : "finishes"}
          </span>
        </div>
        {item.configurable ? (
          <button
            type="button"
            onClick={() => showInConfigurator(item.configurable!)}
            className="group/btn flex items-center gap-2 text-[0.875rem] text-ink-900"
          >
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-expo group-hover/btn:bg-[length:100%_1px]">
              Configure in 3D
            </span>
            <span aria-hidden className="transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-1">
              →
            </span>
            <span className="sr-only">: {item.name} {item.type.toLowerCase()}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={add}
            className="flex h-9 items-center gap-2 rounded-full border border-ink-900/15 px-4 text-[0.8125rem] transition-colors hover:border-ink-900 hover:bg-ink-900 hover:text-oat-50"
            aria-live="polite"
          >
            {added ? "Added" : "Add to cart"}
            <span className="sr-only">: {item.name} {item.type.toLowerCase()}</span>
          </button>
        )}
      </div>
    </article>
  );
}

export function Collection() {
  return (
    <section id="collection" aria-labelledby="collection-title" className="relative mx-auto max-w-[1680px] scroll-mt-16 px-5 py-24 md:px-8 md:py-32 lg:px-12 lg:py-40">
      <Reveal className="grid items-end gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <RevealItem as="p" className="label text-ink-500">
            The collection <span className="mx-2 text-clay-600">/</span> {String(COLLECTION.length).padStart(2, "0")} pieces
          </RevealItem>
          <h2 id="collection-title" className="mt-5 font-serif text-title font-light tracking-[-0.02em]">
            <RevealLine>Six pieces for</RevealLine>
            <RevealLine>
              <span className="italic text-clay-600">slow rooms.</span>
            </RevealLine>
          </h2>
        </div>
        <RevealItem as="p" className="max-w-[40ch] text-[1.0625rem] leading-relaxed text-ink-700 lg:col-span-4 lg:col-start-9">
          Everything is made to order in small batches. Two pieces can be dressed live in 3D; the rest arrive exactly as
          you see them here.
        </RevealItem>
      </Reveal>

      <Reveal as="ul" className="mt-14 grid gap-x-5 gap-y-16 sm:grid-cols-2 md:mt-20 lg:grid-cols-3 lg:gap-x-6" stagger={0.1} amount={0.05}>
        {COLLECTION.map((item, i) => (
          <RevealItem as="li" key={item.id}>
            <ProductCard item={item} index={i} />
          </RevealItem>
        ))}
      </Reveal>
    </section>
  );
}
