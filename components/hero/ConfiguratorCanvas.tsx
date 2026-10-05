"use client";

import * as THREE from "three";
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { PRODUCTS, type ProductId } from "@/lib/catalog";
import { reportProgress } from "@/lib/intro";
import {
  CAMERA,
  MODEL_FIT,
  ProductModel,
  StudioLighting,
  Turntable,
  cameraStartPosition,
} from "@/components/three/Scene";

type Props = {
  productId: ProductId;
  fabricId: string;
  finishId: string;
  /** Curtains have parted: play the entrance. */
  revealed: boolean;
  /** In the viewport: keep rendering. */
  active: boolean;
  reducedMotion: boolean;
  nudgeRef: React.RefObject<number>;
  /** Wide layout: the piece shares the frame with the headline and the controls. */
  wide: boolean;
  onFirstFrame: () => void;
};

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Frames the piece: backs the camera off on narrow canvases so it never crops, and on wide
 * screens shifts the lens so the piece sits between the headline and the controls.
 */
function CameraFit({ productId, wide }: { productId: ProductId; wide: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const want = useRef(CAMERA.distance);
  const snapped = useRef(false);
  const offset = useMemo(() => new THREE.Vector3(), []);
  const fallbackTarget = useMemo(() => new THREE.Vector3(...CAMERA.target), []);

  useLayoutEffect(() => {
    const fit = MODEL_FIT[productId];
    const aspect = size.width / Math.max(1, size.height);
    want.current = CAMERA.distance * (wide ? fit.wideZoom : 1) * Math.max(1, fit.fitAspect / aspect);
    // Narrower wide screens leave less room beside the controls, so the piece moves a little further left.
    const shift = Math.min(0.04, Math.max(0.01, 0.01 + ((1440 - size.width) / 160) * 0.03));
    if (wide) camera.setViewOffset(size.width, size.height, size.width * shift, 0, size.width, size.height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }, [size, productId, wide, camera]);

  useFrame((state, delta) => {
    const target = controls?.target ?? fallbackTarget;
    offset.copy(camera.position).sub(target);
    const d = offset.length();
    if (Math.abs(d - want.current) < 1e-3) return;
    const next = snapped.current ? d + (want.current - d) * (1 - Math.exp(-delta * 5)) : want.current;
    snapped.current = true;
    offset.setLength(next);
    camera.position.copy(target).add(offset);
    state.invalidate();
  });
  return null;
}

/** Seconds on a clock that keeps running when the render loop pauses (R3F restarts its own clock then). */
const now = () => performance.now() / 1000;

function Controls({
  reducedMotion,
  revealed,
  nudgeRef,
}: {
  reducedMotion: boolean;
  revealed: boolean;
  nudgeRef: React.RefObject<number>;
}) {
  const ref = useRef<OrbitControlsImpl>(null);
  const interacting = useRef(false);
  // Idle time counts from when the stage mounted, whether or not the loop is running.
  const idleAt = useRef(Infinity);
  const offset = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    idleAt.current = now();
  }, []);

  useEffect(() => {
    // Let vertical swipes scroll the page on touch screens; horizontal drags turn the piece.
    const el = ref.current?.domElement as HTMLElement | undefined;
    if (el) el.style.touchAction = "pan-y";
  });

  useFrame((state, delta) => {
    const c = ref.current;
    if (!c) return;
    // Keyboard turns arrive as a pending angle; ease it in over a few frames.
    const pending = nudgeRef.current ?? 0;
    if (Math.abs(pending) > 1e-4) {
      const step = pending * (1 - Math.exp(-delta * 9));
      nudgeRef.current = pending - step;
      offset.copy(c.object.position).sub(c.target).applyAxisAngle(UP, step);
      c.object.position.copy(c.target).add(offset);
      idleAt.current = now();
      state.invalidate();
    }
    if (interacting.current) idleAt.current = now();
    const idle = now() - idleAt.current > 2.5;
    // Auto-turn only once the curtain is open: each turn asks for the next frame, which would
    // keep the on-demand loop running (and drift the camera) unseen behind the curtain.
    c.autoRotate = !reducedMotion && revealed && idle;
    // three's auto-rotate is per frame; convert to a steady 0.16 rad/s whatever the refresh rate.
    c.autoRotateSpeed = (0.16 * Math.min(delta, 0.05) * 3600) / (2 * Math.PI);
  });

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      target={CAMERA.target}
      enableZoom={false}
      enablePan={false}
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.55}
      minPolarAngle={0.95}
      maxPolarAngle={1.42}
      onStart={() => {
        interacting.current = true;
      }}
      onEnd={() => {
        interacting.current = false;
      }}
    />
  );
}

/** The parts of three's PMREMGenerator needed to compile its filter shaders ahead of time. */
type FilterInternals = {
  _setSize?: (cubeSize: number) => void;
  _allocateTargets?: () => THREE.WebGLRenderTarget;
  _ggxMaterial?: THREE.Material | null;
  _blurMaterial?: THREE.Material | null;
  _cubemapMaterial?: THREE.Material | null;
};

const warmedEnvironments = new WeakSet<THREE.Texture>();

/**
 * The first physical material to meet the light-panel environment makes three pre-filter it
 * (PMREM) with a heavy GGX shader that is compiled on the spot and blocks for about a second.
 * Compiling an identical filter in parallel first lets that conversion find its shaders ready.
 * It leans on three internals, so it is guarded: if they change, it does nothing and the
 * conversion simply compiles as before. Returns a function that frees the warm-up resources.
 */
async function warmEnvironmentFilter(gl: THREE.WebGLRenderer, environment: THREE.Texture | null) {
  const faces = environment?.image as { width?: number }[] | undefined;
  if (!environment || warmedEnvironments.has(environment) || !Array.isArray(faces)) return () => {};

  const pmrem = new THREE.PMREMGenerator(gl);
  const internals = pmrem as unknown as FilterInternals;
  if (typeof internals._setSize !== "function" || typeof internals._allocateTargets !== "function") {
    pmrem.dispose();
    return () => {};
  }
  warmedEnvironments.add(environment);

  // Same cube size as the real conversion, so the shader defines (and the cached programs) match.
  internals._setSize(faces[0]?.width || 16);
  const target = internals._allocateTargets();
  // The filter renders into a linear half-float target: compile for that, not for the screen.
  const previous = gl.getRenderTarget();
  gl.setRenderTarget(target);
  pmrem.compileCubemapShader();
  // The filter's planes carry positions and no normals, which is part of the program's cache key.
  const planes = new THREE.BufferGeometry();
  planes.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
  const filters = new THREE.Scene();
  for (const material of [internals._ggxMaterial, internals._blurMaterial, internals._cubemapMaterial]) {
    if (material) filters.add(new THREE.Mesh(planes, material));
  }
  const ready = gl.compileAsync(filters, new THREE.OrthographicCamera());
  gl.setRenderTarget(previous);
  await ready;

  return () => {
    planes.dispose();
    target.dispose();
    pmrem.dispose();
  };
}

/**
 * Compiles every shader the piece needs before its first frame, off the main thread.
 * The velvet is a physical material with sheen: compiled on first draw it froze the
 * page for seconds (notably on Windows), stalling the opening counter.
 * It sits inside the model's Suspense boundary, so it runs once the piece is in the scene.
 */
function Precompile({ onDone }: { onDone: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    let alive = true;
    const done = () => {
      if (alive) onDone();
    };

    // Without parallel compilation there is nothing to gain: draw straight away.
    if (!gl.extensions.has("KHR_parallel_shader_compile")) {
      done();
      return;
    }

    const run = async () => {
      const release = await warmEnvironmentFilter(gl, scene.environment).catch(() => () => {});
      try {
        await gl.compileAsync(scene, camera);
      } finally {
        release();
      }
    };
    run().then(done, done);
    return () => {
      alive = false;
    };
  }, [gl, scene, camera, onDone]);

  return null;
}

/** Reports the first frame that actually contains the model. */
function FirstFrame({ onFirstFrame }: { onFirstFrame: () => void }) {
  const frames = useRef(0);
  const fired = useRef(false);
  useFrame((state) => {
    if (fired.current) return;
    frames.current += 1;
    state.invalidate();
    if (frames.current >= 2) {
      fired.current = true;
      onFirstFrame();
    }
  });
  return null;
}

function Piece({
  productId,
  fabricId,
  finishId,
  revealed,
  reducedMotion,
}: Pick<Props, "productId" | "fabricId" | "finishId" | "revealed" | "reducedMotion">) {
  return (
    <Turntable play={revealed} reducedMotion={reducedMotion}>
      <ProductModel productId={productId} fabricId={fabricId} finishId={finishId} instant={reducedMotion} />
    </Turntable>
  );
}

export default function ConfiguratorCanvas(props: Props) {
  const { productId, fabricId, finishId, revealed, active, reducedMotion, nudgeRef, wide, onFirstFrame } = props;

  useEffect(() => {
    reportProgress("scene", 1);
  }, []);

  // Once the hero is settled, warm the other piece so switching is instant.
  useEffect(() => {
    if (!revealed) return;
    const other = productId === "ilse" ? PRODUCTS.sora.model : PRODUCTS.ilse.model;
    const id = window.setTimeout(() => useGLTF.preload(other, false, true), 2500);
    return () => window.clearTimeout(id);
  }, [revealed, productId]);

  // Nothing is drawn until the piece's shaders are ready, so no frame waits on a compile.
  const [compiled, setCompiled] = useState<ProductId | null>(null);
  const onCompiled = useCallback(() => setCompiled(productId), [productId]);
  const running = active && compiled === productId;
  // While the curtain is closed nobody sees the stage: draw only the frames the scene asks for.
  const frameloop = !running ? "never" : reducedMotion || !revealed ? "demand" : "always";

  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={frameloop}
      camera={{ fov: CAMERA.fov, near: 0.1, far: 40, position: cameraStartPosition() }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.0;
        gl.setClearColor(0x000000, 0);
      }}
      aria-hidden="true"
    >
      <StudioLighting />
      <Suspense fallback={null}>
        <Piece
          key={productId}
          productId={productId}
          fabricId={fabricId}
          finishId={finishId}
          revealed={revealed}
          reducedMotion={reducedMotion}
        />
        <Precompile key={`pc-${productId}`} onDone={onCompiled} />
        <FirstFrame key={`ff-${productId}`} onFirstFrame={onFirstFrame} />
      </Suspense>
      <Controls reducedMotion={reducedMotion} revealed={revealed} nudgeRef={nudgeRef} />
      <CameraFit productId={productId} wide={wide} />
    </Canvas>
  );
}
