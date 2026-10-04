"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { PRODUCTS, type ProductId } from "@/lib/catalog";

type Selection = Record<ProductId, { fabric: string; finish: string }>;

type ConfiguratorValue = {
  productId: ProductId;
  selection: Selection;
  setProduct: (id: ProductId) => void;
  setFabric: (fabric: string) => void;
  setFinish: (finish: string) => void;
  /** Jump to the configurator with a product (and optionally a fabric or finish) selected. */
  showInConfigurator: (id: ProductId, options?: { fabric?: string; finish?: string }) => void;
};

const ConfiguratorContext = createContext<ConfiguratorValue | null>(null);

const initialSelection: Selection = {
  ilse: { fabric: PRODUCTS.ilse.defaultFabric, finish: PRODUCTS.ilse.finishes[0].id },
  sora: { fabric: PRODUCTS.sora.defaultFabric, finish: PRODUCTS.sora.finishes[0].id },
};

export function ConfiguratorProvider({ children }: { children: React.ReactNode }) {
  const [productId, setProductId] = useState<ProductId>("ilse");
  const [selection, setSelection] = useState<Selection>(initialSelection);

  const setFabric = useCallback(
    (fabric: string) =>
      setSelection((s) => ({ ...s, [productId]: { ...s[productId], fabric } })),
    [productId],
  );

  const setFinish = useCallback(
    (finish: string) =>
      setSelection((s) => ({ ...s, [productId]: { ...s[productId], finish } })),
    [productId],
  );

  const showInConfigurator = useCallback((id: ProductId, options?: { fabric?: string; finish?: string }) => {
    setProductId(id);
    if (options) setSelection((s) => ({ ...s, [id]: { ...s[id], ...options } }));
    const target = document.getElementById("configure");
    if (target) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      // Hand focus to the configurator so keyboard users land where they asked to go.
      window.setTimeout(() => document.getElementById("configurator-heading")?.focus({ preventScroll: true }), reduce ? 0 : 700);
    }
  }, []);

  const value = useMemo(
    () => ({ productId, selection, setProduct: setProductId, setFabric, setFinish, showInConfigurator }),
    [productId, selection, setFabric, setFinish, showInConfigurator],
  );

  return <ConfiguratorContext.Provider value={value}>{children}</ConfiguratorContext.Provider>;
}

export function useConfigurator() {
  const ctx = useContext(ConfiguratorContext);
  if (!ctx) throw new Error("useConfigurator must be used inside ConfiguratorProvider");
  return ctx;
}
