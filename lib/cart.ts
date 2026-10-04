"use client";

import { useSyncExternalStore } from "react";

export type CartItem = {
  /** Unique per product + configuration, so the same build stacks. */
  key: string;
  productId: string;
  name: string;
  type: string;
  options: string[];
  swatch?: string;
  image: string;
  unitPrice: number;
  qty: number;
};

const STORAGE_KEY = "maison-cart-v1";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
let open = false;
let lastAdded: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    if (Array.isArray(parsed)) items = parsed.filter((i) => i && typeof i.key === "string" && i.qty > 0);
  } catch {
    items = EMPTY;
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota or privacy mode: the cart still works for this visit */
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    loaded = false;
    load();
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function setItems(next: CartItem[]) {
  items = next;
  persist();
  emit();
}

export const cart = {
  add(item: Omit<CartItem, "qty">, qty = 1) {
    load();
    const existing = items.find((i) => i.key === item.key);
    lastAdded = item.key;
    setItems(
      existing
        ? items.map((i) => (i.key === item.key ? { ...i, qty: Math.min(9, i.qty + qty) } : i))
        : [...items, { ...item, qty }],
    );
  },
  setQty(key: string, qty: number) {
    load();
    if (qty <= 0) return cart.remove(key);
    setItems(items.map((i) => (i.key === key ? { ...i, qty: Math.min(9, qty) } : i)));
  },
  remove(key: string) {
    load();
    setItems(items.filter((i) => i.key !== key));
  },
  clear() {
    setItems(EMPTY);
  },
  open() {
    open = true;
    emit();
  },
  close() {
    open = false;
    emit();
  },
};

function getItems() {
  load();
  return items;
}

export function useCartItems(): CartItem[] {
  return useSyncExternalStore(subscribe, getItems, () => EMPTY);
}

export function useCartOpen(): boolean {
  return useSyncExternalStore(subscribe, () => open, () => false);
}

export function useLastAdded(): string | null {
  return useSyncExternalStore(subscribe, () => lastAdded, () => null);
}

export function cartCount(list: CartItem[]) {
  return list.reduce((n, i) => n + i.qty, 0);
}

export function cartTotal(list: CartItem[]) {
  return list.reduce((n, i) => n + i.qty * i.unitPrice, 0);
}
