"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cart, cartCount, useCartItems } from "@/lib/cart";
import { useHeroReady } from "@/lib/intro";

const NAV = [
  { href: "#configure", label: "Configure" },
  { href: "#collection", label: "Collection" },
  { href: "#craft", label: "Craft" },
  { href: "#materials", label: "Materials" },
];

export function Header() {
  const items = useCartItems();
  const count = cartCount(items);
  const ready = useHeroReady();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`absolute inset-0 border-b transition-all duration-500 ${
          scrolled || menuOpen ? "border-ink-900/8 bg-oat-100/80 backdrop-blur-xl" : "border-transparent bg-transparent"
        }`}
        aria-hidden
      />
      <div className="relative mx-auto flex h-[var(--header-h)] max-w-[1680px] items-center justify-between px-5 md:px-8 lg:px-12">
        <a
          href="#top"
          id="site-wordmark"
          data-wordmark
          className="font-serif text-[1.375rem] leading-none font-medium tracking-[0.34em] text-ink-900 md:text-[1.5rem]"
          aria-label="Maison, back to top"
        >
          MAISON
        </a>

        <motion.nav
          aria-label="Primary"
          initial={{ opacity: 0, y: -8 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: ready ? 0.9 : 0 }}
          className="absolute left-1/2 hidden -translate-x-1/2 md:block"
        >
          <ul className="flex items-center gap-9">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="group relative py-2 text-[0.875rem] text-ink-700 transition-colors hover:text-ink-900">
                  {n.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-ink-900 transition-transform duration-500 ease-out-expo group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
        </motion.nav>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: ready ? 1.0 : 0 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <span className="label hidden rounded-full border border-ink-900/12 px-3 py-2 text-ink-500 lg:inline-block">Concept store</span>
          <button
            type="button"
            onClick={() => cart.open()}
            className="flex h-10 items-center gap-2.5 rounded-full bg-ink-900 pr-1.5 pl-4 text-[0.875rem] text-oat-50 transition-colors hover:bg-clay-700"
            aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
          >
            Cart
            <span className="tabular grid h-7 min-w-7 place-items-center rounded-full bg-oat-50 px-1.5 text-[0.75rem] text-ink-900">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={count}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </span>
          </button>
          <button
            ref={menuButton}
            type="button"
            className="grid size-10 place-items-center rounded-full border border-ink-900/12 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="relative block h-2.5 w-4" aria-hidden>
              <span className={`absolute left-0 h-px w-4 bg-ink-900 transition-transform duration-300 ${menuOpen ? "top-1 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-px w-4 bg-ink-900 transition-transform duration-300 ${menuOpen ? "top-1 -rotate-45" : "top-2"}`} />
            </span>
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative border-b border-ink-900/8 bg-oat-100/95 px-5 pt-2 pb-8 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col">
              {NAV.map((n, i) => (
                <li key={n.href} className="border-b border-ink-900/8 last:border-0">
                  <a
                    ref={i === 0 ? firstLink : undefined}
                    href={n.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-baseline justify-between py-4 font-serif text-[2rem] leading-none"
                  >
                    {n.label}
                    <span className="tabular text-xs text-ink-400">0{i + 1}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="label mt-6 text-ink-500">Concept store · nothing here is for sale</p>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
