# Maison

A store for a fictional furniture atelier between Copenhagen and Mumbai, with a live 3D configurator as its hero. A concept site by [GLAZY](https://glazy-portfolio.vercel.app), a freelance web & SaaS agency.

**Live:** https://maison-glazy.vercel.app

## Technically interesting

- **3D configurator** in React Three Fiber and drei. Turn the Ilse chair or the Sora sofa, and five velvets and three finishes tween live on the model's sheen material. Drag it, or use the arrow keys when the viewer has focus; it turns on its own when idle.
- **No first-frame freeze.** The velvet's physical shader, and the environment pre-filter it triggers, compile in parallel with `compileAsync` before the first frame.
- **Opening sequence driven by real loading** (fonts, model bytes, first rendered frame). A line drawing of the chair draws itself, then the curtain parts. Behind the closed curtain the scene renders only on demand. It plays once per session, `Esc` skips it, and it stays still under reduced motion.
- **Studio lighting without an HDR download.** Light panels generate the environment, the key and rim lights follow the camera, and ground shadows are baked from each model's geometry.
- **Every product photo is a render of the same scene**, including four pieces modelled in code.
- **A cart saved in the browser.** Checkout stops with a note, since nothing is for sale.
- Rendering pauses off screen, the pixel ratio is capped, and without WebGL a still takes the canvas's place.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, three.js, @react-three/fiber, @react-three/drei, Motion.

## Run locally

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run lint
npm run typecheck
```

## Credits and licences

- **Sheen Chair** by Eric Chadwick, © 2020 Wayfair, LLC. [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/legalcode). From the [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SheenChair). Shown as the Ilse chair; the care-label mesh was removed and the file was compressed (meshopt, WebP textures).
- **Glam Velvet Sofa** by Eric Chadwick, © 2021 Wayfair, LLC. [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode). From the [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/GlamVelvetSofa). Shown as the Sora sofa: it is recoloured at runtime, its embedded light and material variants were removed, and the file was compressed.
- Cormorant Garamond and Instrument Sans: SIL Open Font License, self-hosted through `next/font`.
- Maison, its pieces, prices and story are fictional.
