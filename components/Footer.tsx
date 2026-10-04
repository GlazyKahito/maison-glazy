const LINKS = [
  { href: "#configure", label: "Configurator" },
  { href: "#collection", label: "Collection" },
  { href: "#craft", label: "Craft" },
  { href: "#materials", label: "Materials" },
  { href: "#letters", label: "Letters" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-900 text-oat-100">
      <div className="mx-auto max-w-[1680px] px-5 pt-20 pb-10 md:px-8 lg:px-12 lg:pt-28">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-serif text-[2.25rem] leading-[1.05] font-light text-oat-50 md:text-[2.75rem]">
              Furniture made slowly,
              <br />
              <span className="italic text-clay-500">for rooms that stay.</span>
            </p>
            <p className="mt-6 max-w-[40ch] text-[0.9375rem] leading-relaxed text-oat-100/60">
              Maison is a fictional atelier between Copenhagen and Mumbai. Prices are illustrative and nothing here is for
              sale.
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3 md:col-start-7">
            <p className="label text-oat-100/45">Explore</p>
            <ul className="mt-5 space-y-3">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-[0.9375rem] text-oat-100/80 transition-colors hover:text-oat-50">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="label text-oat-100/45">3D models</p>
            <ul className="mt-5 space-y-4 text-[0.8125rem] leading-relaxed text-oat-100/65">
              <li>
                <a
                  className="text-oat-100/90 underline decoration-oat-100/25 underline-offset-4 hover:decoration-oat-100"
                  href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SheenChair"
                  target="_blank"
                  rel="noreferrer"
                >
                  Sheen Chair
                </a>{" "}
                © 2020 Wayfair, LLC, by Eric Chadwick.{" "}
                <a className="underline decoration-oat-100/25 underline-offset-4 hover:decoration-oat-100" href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">
                  CC0 1.0
                </a>
                .
              </li>
              <li>
                <a
                  className="text-oat-100/90 underline decoration-oat-100/25 underline-offset-4 hover:decoration-oat-100"
                  href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/GlamVelvetSofa"
                  target="_blank"
                  rel="noreferrer"
                >
                  Glam Velvet Sofa
                </a>{" "}
                © 2021 Wayfair, LLC, by Eric Chadwick.{" "}
                <a className="underline decoration-oat-100/25 underline-offset-4 hover:decoration-oat-100" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
                  CC BY 4.0
                </a>
                . Recoloured and compressed for this site.
              </li>
              <li>Both from the Khronos glTF Sample Assets. All other pieces are modelled for Maison.</li>
            </ul>
          </div>
        </div>

        <p
          aria-hidden
          className="mt-20 -mb-[0.12em] text-center font-serif text-[clamp(4.5rem,21vw,22rem)] leading-[0.8] font-light tracking-[0.12em] text-oat-100/[0.07] select-none md:mt-28"
        >
          MAISON
        </p>

        <div className="flex flex-col gap-4 border-t border-oat-100/12 pt-6 text-[0.8125rem] text-oat-100/55 md:flex-row md:items-center md:justify-between">
          <p>
            Maison is a concept store designed and built by{" "}
            <a
              href="https://glazy-portfolio.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="text-oat-50 underline decoration-clay-500 decoration-1 underline-offset-4 transition-colors hover:text-clay-500"
            >
              GLAZY
            </a>
            .
          </p>
          <p>© 2026 Maison (concept). Nothing is sold or shipped.</p>
        </div>
      </div>
    </footer>
  );
}
