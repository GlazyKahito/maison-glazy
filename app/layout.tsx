import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Instrument_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://maison-glazy.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Maison | Furniture made slowly, configured live",
    template: "%s | Maison",
  },
  description:
    "Maison is a concept furniture atelier between Copenhagen and Mumbai. Turn the Ilse lounge chair and Sora sofa in 3D, try five house velvets and three finishes live, then build a cart.",
  applicationName: "Maison",
  authors: [{ name: "GLAZY", url: "https://glazy-portfolio.vercel.app" }],
  creator: "GLAZY",
  keywords: ["furniture", "3D configurator", "velvet lounge chair", "sofa", "concept store", "Mumbai", "Scandinavian design"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Maison",
    title: "Maison | Furniture made slowly, configured live",
    description:
      "A concept furniture atelier with a live 3D configurator: five house velvets, three frame finishes, one very comfortable chair.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maison | Furniture made slowly, configured live",
    description: "A concept furniture atelier with a live 3D configurator.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f5efe6",
  colorScheme: "light",
};

/* Decide before first paint whether the opening sequence plays (once per session, never on deep links). */
const introScript = `(function(){var d=document.documentElement;try{var seen=sessionStorage.getItem("maison-intro");d.dataset.intro=(seen||location.hash)?"off":"on";}catch(e){d.dataset.intro="off";}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="grain">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
