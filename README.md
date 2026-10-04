# Maison

A concept store for a fictional furniture atelier between Copenhagen and Mumbai. The hero is a live 3D configurator: turn the Ilse lounge chair or the Sora sofa, dress it in one of five house velvets and three finishes, and add the exact build to a working cart.

**Live:** https://maison-glazy.vercel.app

Concept site by GLAZY: https://glazy-portfolio.vercel.app

## What's inside

- **3D configurator** built with React Three Fiber and drei. Velvet colours tween live on the model's sheen material, frame and feet finishes swap in place, and the piece turns on its own until you drag it (or use the arrow keys when the viewer is focused).
- **Opening sequence** that tracks real loading (fonts, model bytes, first rendered frame) while a line drawing of the chair draws itself, then parts like a showroom curtain. It plays once per session, can be skipped with Esc, and is static for visitors who prefer reduced motion.
- **Studio lighting without HDR downloads**: light panels generate the environment, key and rim lights follow the camera, and the ground shadow is baked from each model's own geometry.
- **Cart drawer** with quantities, saved to the browser. Checkout stops with a note: nothing is sold.
- Every product photo on the page is a render of the same 3D scene, including four pieces (side table, pouf, lamp, stool) modelled in code for the collection.
- Respects `prefers-reduced-motion`, pauses rendering off screen, caps pixel ratio, lazy-loads the canvas and falls back to a still when WebGL is not available.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, three.js, @react-three/fiber, @react-three/drei, Motion.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. `npm run build`, `npm run lint` and `npm run typecheck` are also available.

## Assets and credits

- **Sheen Chair** by Eric Chadwick, © 2020 Wayfair, LLC. [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/legalcode). From the [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SheenChair). Shown here as the Ilse chair; the care label mesh was removed and the file was compressed (meshopt, WebP textures).
- **Glam Velvet Sofa** by Eric Chadwick, © 2021 Wayfair, LLC. [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode). From the [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/GlamVelvetSofa). Shown here as the Sora sofa; recoloured at runtime, its embedded light and material variants were removed and the file was compressed.
- Fonts: Cormorant Garamond and Instrument Sans (SIL Open Font License), served through `next/font`.

Maison, its pieces, prices and story are fictional. Nothing on the site is for sale.
