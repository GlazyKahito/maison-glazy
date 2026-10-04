"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cart, cartCount, cartTotal, useCartItems, useCartOpen } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CartDrawer() {
  const open = useCartOpen();
  const items = useCartItems();
  const count = cartCount(items);
  const total = cartTotal(items);
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const id = window.requestAnimationFrame(() => closeBtn.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cart.close();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const focusables = panel.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prev;
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  const close = () => {
    setNotice(false);
    cart.close();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            className="absolute inset-0 bg-ink-900/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={close}
            aria-hidden
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-oat-100 shadow-[-30px_0_80px_-30px_rgba(40,25,10,0.35)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-ink-900/8 px-6 py-5">
              <div>
                <h2 id="cart-title" className="font-serif text-[2rem] leading-none">
                  Your cart <span className="tabular text-ink-400">({count})</span>
                </h2>
                <p className="label mt-2 text-clay-600">Concept store</p>
              </div>
              <button
                ref={closeBtn}
                type="button"
                onClick={close}
                className="grid size-10 place-items-center rounded-full border border-ink-900/12 transition-colors hover:bg-oat-200"
                aria-label="Close cart"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <p className="font-serif text-[2.25rem] leading-tight italic">Nothing here yet.</p>
                <p className="mt-3 max-w-[30ch] text-ink-500">Dress the Ilse chair in a velvet you love, then add it here.</p>
                <a
                  href="#configure"
                  onClick={close}
                  className="mt-8 inline-flex h-12 items-center rounded-full bg-ink-900 px-6 text-[0.9375rem] text-oat-50 transition-colors hover:bg-clay-700"
                >
                  Open the configurator
                </a>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-ink-900/8 overflow-y-auto overscroll-contain px-6" aria-label="Items in your cart">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.key}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="flex gap-4 py-5"
                      >
                        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-oat-200">
                          <Image src={item.image} alt="" fill sizes="96px" className="scale-[1.3] object-contain" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-serif text-[1.5rem] leading-none">{item.name}</p>
                              <p className="mt-1 text-[0.8125rem] text-ink-500">{item.type}</p>
                            </div>
                            <p className="tabular text-[0.9375rem]">{formatPrice(item.unitPrice * item.qty)}</p>
                          </div>
                          {item.options.length > 0 && (
                            <p className="mt-2 flex items-center gap-2 text-[0.8125rem] text-ink-700">
                              {item.swatch && <span className="size-3 rounded-full ring-1 ring-ink-900/15" style={{ background: item.swatch }} aria-hidden />}
                              {item.options.join(" · ")}
                            </p>
                          )}
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="flex items-center rounded-full border border-ink-900/12" role="group" aria-label={`Quantity of ${item.name}`}>
                              <button
                                type="button"
                                className="grid size-8 place-items-center rounded-full text-lg leading-none transition-colors hover:bg-oat-200"
                                onClick={() => cart.setQty(item.key, item.qty - 1)}
                                aria-label={item.qty === 1 ? `Remove ${item.name}` : `Decrease quantity of ${item.name}`}
                              >
                                −
                              </button>
                              <span className="tabular w-7 text-center text-[0.875rem]" aria-live="polite">
                                {item.qty}
                              </span>
                              <button
                                type="button"
                                className="grid size-8 place-items-center rounded-full text-lg leading-none transition-colors hover:bg-oat-200 disabled:opacity-30"
                                onClick={() => cart.setQty(item.key, item.qty + 1)}
                                disabled={item.qty >= 9}
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => cart.remove(item.key)}
                              className="text-[0.8125rem] text-ink-500 underline decoration-ink-900/20 underline-offset-4 transition-colors hover:text-ink-900"
                            >
                              Remove<span className="sr-only"> {item.name}</span>
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="border-t border-ink-900/8 bg-oat-50/60 px-6 pt-5 pb-6">
                  <div className="flex items-baseline justify-between">
                    <p className="text-ink-700">Subtotal</p>
                    <p className="tabular font-serif text-[1.75rem] leading-none">{formatPrice(total)}</p>
                  </div>
                  <p className="mt-1 text-[0.8125rem] text-ink-500">White-glove delivery and assembly included.</p>
                  <button
                    type="button"
                    onClick={() => setNotice(true)}
                    className="mt-5 flex h-14 w-full items-center justify-center rounded-full bg-ink-900 text-[0.9375rem] text-oat-50 transition-colors hover:bg-clay-700"
                  >
                    Checkout
                  </button>
                  <p role="status" className="mt-3 min-h-[2.5em] text-center text-[0.8125rem] leading-snug text-ink-500">
                    {notice
                      ? "Maison is a concept store, so checkout stops here. Nothing has been charged or ordered."
                      : "Your cart is saved on this device only."}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
