const ITEMS = [
  "Made to order",
  "Designed in Copenhagen",
  "Hand-tufted in Mumbai",
  "Five house velvets",
  "Solid hardwood frames",
  "Signed by the maker",
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {ITEMS.map((t) => (
        <li key={t} className="flex items-center whitespace-nowrap">
          <span className="px-7 font-serif text-[clamp(1.5rem,2.4vw,2.25rem)] font-light italic">{t}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-clay-600" aria-hidden>
            <path d="M6 0l1.3 4.7L12 6l-4.7 1.3L6 12l-1.3-4.7L0 6l4.7-1.3z" fill="currentColor" />
          </svg>
        </li>
      ))}
    </ul>
  );
}

/** A slow ticker of house principles between the hero and the collection. */
export function Ribbon() {
  return (
    <div className="relative overflow-hidden border-y border-ink-900/10 py-5">
      <div className="marquee-track flex w-max">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
