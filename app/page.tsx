import { CartDrawer } from "@/components/CartDrawer";
import { Collection } from "@/components/Collection";
import { Craft } from "@/components/Craft";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Intro } from "@/components/Intro";
import { Materials } from "@/components/Materials";
import { Newsletter } from "@/components/Newsletter";
import { Ribbon } from "@/components/Ribbon";
import { Configurator } from "@/components/hero/Configurator";

export default function Home() {
  return (
    <>
      <Intro />
      <a
        href="#collection"
        className="label fixed top-3 left-3 z-[95] -translate-y-20 rounded-full bg-ink-900 px-4 py-3 text-oat-50 transition-transform focus:translate-y-0"
      >
        Skip to the collection
      </a>
      <Header />
      <main id="top">
        <Configurator />
        <Ribbon />
        <Collection />
        <Craft />
        <Materials />
        <Newsletter />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
