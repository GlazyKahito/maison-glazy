"use client";

import * as THREE from "three";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import { fabricById, finishById, PRODUCTS, type ProductId } from "@/lib/catalog";

type Fit = {
  scale: number;
  position: [number, number, number];
  /** Canvas aspect below which the camera backs off to keep the piece in frame. */
  fitAspect: number;
  /** Extra camera distance on wide screens, where the piece shares the frame with copy and controls. */
  wideZoom: number;
  /** Ground shadow baked from the model's own geometry (model units). */
  shadow: { src: string; half: number; center: [number, number] };
};

/** Each model is normalised so both pieces sit in the same frame. */
export const MODEL_FIT: Record<ProductId, Fit> = {
  ilse: {
    scale: 1.32,
    position: [0, 0, -0.011],
    fitAspect: 0.95,
    wideZoom: 1.3,
    shadow: { src: "/models/ilse-shadow.png", half: 0.85, center: [0, 0] },
  },
  sora: {
    scale: 0.64,
    position: [0.013, 0, 0.075],
    fitAspect: 1.5,
    wideZoom: 1.62,
    shadow: { src: "/models/sora-shadow.png", half: 1.55, center: [-0.02, -0.12] },
  },
};

export const CAMERA = {
  fov: 24,
  distance: 4.0,
  target: [0, 0.42, 0] as [number, number, number],
  polar: 1.2,
  azimuth: 0.62,
};

export function cameraStartPosition(distance = CAMERA.distance): [number, number, number] {
  const s = new THREE.Spherical(distance, CAMERA.polar, CAMERA.azimuth);
  const v = new THREE.Vector3().setFromSpherical(s);
  return [v.x + CAMERA.target[0], v.y + CAMERA.target[1], v.z + CAMERA.target[2]];
}

/**
 * A warm, soft studio built from light panels, so no HDR file has to be fetched.
 * Key and rim lights travel with the camera: velvet sheen needs a grazing
 * punctual light, and this keeps every angle lit like a product shot.
 */
export function StudioLighting() {
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const camera = useThree((s) => s.camera);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (key.current) key.current.position.copy(camera.localToWorld(tmp.set(-2.4, 2.8, 1.4)));
    if (rim.current) rim.current.position.copy(camera.localToWorld(tmp.set(2.2, 2.4, -6)));
  });

  return (
    <>
      <ambientLight intensity={0.08} color="#fff1e0" />
      <directionalLight ref={key} intensity={2.7} color="#fff0de" />
      <directionalLight ref={rim} intensity={1.8} color="#ffe6cc" />
      <Environment resolution={256} frames={1} environmentIntensity={0.7}>
        <Lightformer form="rect" intensity={2.6} color="#fff6ea" position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={[8, 5, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#ffe7cf" position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#f6efe6" position={[6, 1.5, 1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={1.4} color="#fff3e4" position={[0, 2, -7]} scale={4} />
        <mesh scale={30}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color="#a8927a" side={THREE.BackSide} />
        </mesh>
      </Environment>
    </>
  );
}

type Targets = {
  color: THREE.Color;
  sheen: THREE.Color;
  sheenRoughness: number;
  roughness: number;
  metalness: number;
  finishColor: THREE.Color;
  finishRoughness: number;
  finishMetalness: number;
};

function approach(current: number, target: number, k: number) {
  const next = current + (target - current) * k;
  return Math.abs(target - next) < 1e-4 ? target : next;
}

function approachColor(c: THREE.Color, t: THREE.Color, k: number) {
  c.r = approach(c.r, t.r, k);
  c.g = approach(c.g, t.g, k);
  c.b = approach(c.b, t.b, k);
  return c.r !== t.r || c.g !== t.g || c.b !== t.b;
}

type ModelProps = { productId: ProductId; fabricId: string; finishId: string; instant?: boolean; shadow?: boolean };

/** Loads a piece and tweens its upholstery and finish towards the chosen options. */
export function ProductModel({ productId, fabricId, finishId, instant = false, shadow = true }: ModelProps) {
  const product = PRODUCTS[productId];
  const gltf = useGLTF(product.model, false, true);
  const fit = MODEL_FIT[productId];

  // Materials live in a ref: they are mutated every frame while a tween runs.
  const mats = useRef<{ fabric: THREE.MeshPhysicalMaterial; finish: THREE.MeshStandardMaterial } | null>(null);
  useLayoutEffect(() => {
    mats.current = {
      fabric: gltf.materials.fabric as THREE.MeshPhysicalMaterial,
      finish: (productId === "ilse" ? gltf.materials.wood : gltf.materials.feet) as THREE.MeshStandardMaterial,
    };
  }, [gltf, productId]);

  const targets = useMemo<Targets>(() => {
    const f = fabricById(fabricId);
    const fin = finishById(product, finishId);
    return {
      color: new THREE.Color(...f.color),
      sheen: new THREE.Color(...f.sheen),
      sheenRoughness: f.sheenRoughness,
      roughness: f.roughness,
      metalness: f.metalness,
      finishColor: new THREE.Color(...fin.color),
      finishRoughness: fin.roughness,
      finishMetalness: fin.metalness,
    };
  }, [fabricId, finishId, product]);

  const settled = useRef(false);
  const lastTargets = useRef<Targets | null>(null);
  const invalidate = useThree((st) => st.invalidate);

  // With an on-demand render loop, a new selection has to ask for the first frame itself.
  useEffect(() => {
    invalidate();
  }, [targets, invalidate]);

  useFrame((state, delta) => {
    const m = mats.current;
    if (!m) return;
    // A new selection starts a fresh tween; the very first frame snaps straight to it.
    if (lastTargets.current !== targets) settled.current = false;
    const snap = instant || lastTargets.current === null;
    lastTargets.current = targets;
    if (settled.current) return;

    const k = snap ? 1 : 1 - Math.exp(-delta * 6.5);
    const { fabric, finish } = m;
    let moving = false;
    moving = approachColor(fabric.color, targets.color, k) || moving;
    moving = approachColor(fabric.sheenColor, targets.sheen, k) || moving;
    if (productId === "sora") {
      // The sofa fabric also colourises its facing reflections.
      moving = approachColor(fabric.specularColor, targets.sheen, k) || moving;
    }
    fabric.sheenRoughness = approach(fabric.sheenRoughness, targets.sheenRoughness, k);
    fabric.roughness = approach(fabric.roughness, targets.roughness, k);
    fabric.metalness = approach(fabric.metalness, targets.metalness, k);
    moving = approachColor(finish.color, targets.finishColor, k) || moving;
    finish.roughness = approach(finish.roughness, targets.finishRoughness, k);
    finish.metalness = approach(finish.metalness, targets.finishMetalness, k);
    moving =
      moving ||
      fabric.roughness !== targets.roughness ||
      fabric.metalness !== targets.metalness ||
      finish.roughness !== targets.finishRoughness;

    if (moving) state.invalidate();
    else settled.current = true;
  });

  return (
    <group scale={fit.scale} position={fit.position}>
      <primitive object={gltf.scene} />
      {shadow && <GroundShadow {...fit.shadow} />}
    </group>
  );
}

/**
 * Contact shadow and soft occlusion, baked offline from the piece's geometry.
 * It is a child of the model, so it turns with it and costs nothing per frame.
 */
function GroundShadow({ src, half, center }: Fit["shadow"]) {
  const map = useTexture(src);
  return (
    <mesh position={[center[0], 0.002, center[1]]} rotation-x={-Math.PI / 2} renderOrder={-1}>
      <planeGeometry args={[half * 2, half * 2]} />
      <meshBasicMaterial color="#2e1d12" alphaMap={map} transparent depthWrite={false} opacity={0.8} toneMapped={false} />
    </mesh>
  );
}

/** Entrance: the piece turns into its hero pose and settles. */
export function Turntable({
  children,
  play,
  reducedMotion,
  onSettled,
}: {
  children: React.ReactNode;
  play: boolean;
  reducedMotion: boolean;
  onSettled?: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const progress = useRef(reducedMotion ? 1 : 0);
  const [done, setDone] = useState(reducedMotion);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    if (play && progress.current < 1) {
      progress.current = Math.min(1, progress.current + delta / 1.9);
      state.invalidate();
      if (progress.current >= 1 && !done) {
        setDone(true);
        onSettled?.();
      }
    }
    const p = reducedMotion ? 1 : progress.current;
    const e = 1 - Math.pow(1 - p, 4);
    g.rotation.y = (1 - e) * -1.15;
    const s = 0.9 + 0.1 * e;
    g.scale.setScalar(s);
  });

  return <group ref={group}>{children}</group>;
}
