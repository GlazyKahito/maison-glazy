export type RGB = readonly [number, number, number];

/**
 * House velvets. `color` and `sheen` are linear-space factors fed straight to
 * the physical material; `swatch` is the sRGB tone used for UI chips.
 */
export type Fabric = {
  id: string;
  name: string;
  note: string;
  swatch: string;
  color: RGB;
  sheen: RGB;
  sheenRoughness: number;
  roughness: number;
  metalness: number;
};

export const FABRICS: Fabric[] = [
  {
    id: "mango",
    name: "Mango",
    note: "A ripe, sunlit orange cotton velvet with a dense, short pile.",
    swatch: "#C9692B",
    color: [0.6, 0.13, 0.016],
    sheen: [0.95, 0.42, 0.14],
    sheenRoughness: 0.8,
    roughness: 0.8,
    metalness: 0,
  },
  {
    id: "peacock",
    name: "Peacock",
    note: "Deep teal that turns emerald where the light catches the pile.",
    swatch: "#1D5C5E",
    color: [0.0, 0.094, 0.099],
    sheen: [0.013, 0.284, 0.298],
    sheenRoughness: 0.8,
    roughness: 0.8,
    metalness: 1,
  },
  {
    id: "sindoor",
    name: "Sindoor",
    note: "Our signature vermilion, dyed in small lots for a living, uneven depth.",
    swatch: "#A63A26",
    color: [0.36, 0.028, 0.012],
    sheen: [0.86, 0.2, 0.11],
    sheenRoughness: 0.75,
    roughness: 0.8,
    metalness: 0.25,
  },
  {
    id: "chai",
    name: "Chai",
    note: "Milky oat with a warm cast. Soft, forgiving and endlessly calm.",
    swatch: "#CDB89C",
    color: [0.4, 0.31, 0.22],
    sheen: [0.86, 0.76, 0.64],
    sheenRoughness: 0.85,
    roughness: 0.85,
    metalness: 0,
  },
  {
    id: "monsoon",
    name: "Monsoon",
    note: "Slate blue, borrowed from the sky over the Arabian Sea in July.",
    swatch: "#34465A",
    color: [0.022, 0.04, 0.07],
    sheen: [0.2, 0.32, 0.46],
    sheenRoughness: 0.7,
    roughness: 0.8,
    metalness: 0.5,
  },
];

export type Finish = {
  id: string;
  name: string;
  swatch: string;
  color: RGB;
  roughness: number;
  metalness: number;
};

export type ProductId = "ilse" | "sora";

export type ConfigurableProduct = {
  id: ProductId;
  index: string;
  name: string;
  type: string;
  price: number;
  model: string;
  dimensions: { w: number; d: number; h: number };
  finishLabel: string;
  finishes: Finish[];
  defaultFabric: string;
  blurb: string;
};

export const PRODUCTS: Record<ProductId, ConfigurableProduct> = {
  ilse: {
    id: "ilse",
    index: "01",
    name: "Ilse",
    type: "Lounge chair",
    price: 64000,
    model: "/models/ilse-chair.glb",
    dimensions: { w: 83, d: 57, h: 69 },
    finishLabel: "Frame",
    finishes: [
      { id: "walnut", name: "Walnut", swatch: "#5B3A22", color: [0.14, 0.07, 0.01], roughness: 1, metalness: 0 },
      { id: "oak", name: "Natural oak", swatch: "#B48B5E", color: [0.52, 0.33, 0.17], roughness: 1, metalness: 0 },
      { id: "ebonised", name: "Ebonised", swatch: "#1F1C1A", color: [0.036, 0.036, 0.036], roughness: 0.32, metalness: 0 },
    ],
    defaultFabric: "mango",
    blurb:
      "A low, generous lounge chair with a deep-buttoned back, a hand-shaped hardwood frame and solid brass hardware.",
  },
  sora: {
    id: "sora",
    index: "02",
    name: "Sora",
    type: "Three-seat sofa",
    price: 168000,
    model: "/models/sora-sofa.glb",
    dimensions: { w: 219, d: 102, h: 79 },
    finishLabel: "Feet",
    finishes: [
      { id: "brass", name: "Brass", swatch: "#C9A46A", color: [1.0, 0.8, 0.7], roughness: 0.4, metalness: 1 },
      { id: "bronze", name: "Bronze", swatch: "#7A5236", color: [0.55, 0.33, 0.2], roughness: 0.45, metalness: 1 },
      { id: "blackened", name: "Blackened", swatch: "#26231F", color: [0.06, 0.055, 0.05], roughness: 0.55, metalness: 1 },
    ],
    defaultFabric: "monsoon",
    blurb:
      "A recessed-arm sofa in a single sweep of velvet, set on slim tapered legs with turned metal feet.",
  },
};

export const PRODUCT_ORDER: ProductId[] = ["ilse", "sora"];

export function fabricById(id: string): Fabric {
  return FABRICS.find((f) => f.id === id) ?? FABRICS[0];
}

export function finishById(product: ConfigurableProduct, id: string): Finish {
  return product.finishes.find((f) => f.id === id) ?? product.finishes[0];
}

/** Pieces in the collection grid. Configurable pieces link back to the hero. */
export type CollectionItem = {
  id: string;
  name: string;
  type: string;
  price: number;
  material: string;
  image: string;
  alt: string;
  hoverImage?: string;
  swatches: string[];
  configurable?: ProductId;
};

export const COLLECTION: CollectionItem[] = [
  {
    id: "ilse",
    name: "Ilse",
    type: "Lounge chair",
    price: PRODUCTS.ilse.price,
    material: "Cotton velvet, walnut, brass",
    image: "/products/ilse-mango.webp",
    alt: "Ilse lounge chair in Mango velvet with a walnut frame",
    hoverImage: "/products/ilse-peacock.webp",
    swatches: FABRICS.map((f) => f.swatch),
    configurable: "ilse",
  },
  {
    id: "sora",
    name: "Sora",
    type: "Three-seat sofa",
    price: PRODUCTS.sora.price,
    material: "Cotton velvet, beech, brass",
    image: "/products/sora-monsoon.webp",
    alt: "Sora three-seat sofa in Monsoon velvet on slim legs with brass feet",
    hoverImage: "/products/sora-chai.webp",
    swatches: FABRICS.map((f) => f.swatch),
    configurable: "sora",
  },
  {
    id: "tide",
    name: "Tide",
    type: "Side table",
    price: 22500,
    material: "Turned walnut, oiled",
    image: "/products/tide-table.webp",
    alt: "Tide pedestal side table in turned walnut",
    swatches: ["#5B3A22", "#B48B5E"],
  },
  {
    id: "mira",
    name: "Mira",
    type: "Pouf",
    price: 18900,
    material: "Cotton velvet, hand-tufted",
    image: "/products/mira-pouf.webp",
    alt: "Mira round pouf in Sindoor velvet with a single centre button",
    swatches: ["#A63A26", "#1D5C5E", "#CDB79A"],
  },
  {
    id: "lune",
    name: "Lune",
    type: "Table lamp",
    price: 14500,
    material: "Glazed stoneware, linen, brass",
    image: "/products/lune-lamp.webp",
    alt: "Lune table lamp with a fluted, glazed stoneware base and a pleated linen shade",
    swatches: ["#A63A26", "#E8DCC6"],
  },
  {
    id: "kora",
    name: "Kora",
    type: "Stool",
    price: 12800,
    material: "Solid oak, turned by hand",
    image: "/products/kora-stool.webp",
    alt: "Kora three-legged oak stool with a turned seat and footring",
    swatches: ["#B48B5E", "#1F1C1A"],
  },
];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return inr.format(value);
}
