import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Maison: furniture made slowly",
    short_name: "Maison",
    description: "A concept furniture atelier with a live 3D configurator.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe6",
    theme_color: "#f5efe6",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
