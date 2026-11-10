'use client';
/**
 * Scene.tsx · v1.0
 *
 * El lienzo WebGL que queda fijo detrás de toda la página. Se carga aparte del
 * resto (import dinámico en Experience.tsx) para que el texto y el botón
 * principal aparezcan sin esperar a three.js.
 *
 * Piezas:
 *   Rig     → la cámara. Lee la etapa del scroll y encuadra.
 *   Studio  → la iluminación: paneles de luz que solo existen en el reflejo.
 *   Bay     → piso, marcas, elevador.
 *   Car     → el coche.
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { Car } from './Car';
import { Bay } from './Bay';
import { live, useShop } from '@/lib/store';
import { sample, KEYS, type Key } from '@/lib/stages';

const DEG = Math.PI / 180;
const damp = THREE.MathUtils.damp;
/** Cuánto gira la cámara hacia cada pieza al elegir su solución (radianes). */
const FOCUS_AZ = [0.34, -0.1, 0.42, 0.16, -0.5, -0.26];
const BG = '#07090C';

function Rig() {
  const { camera, size } = useThree();
  const st = useRef({
    key: { ...KEYS[0] } as Key,
    az: KEYS[0].az - 0.5,
    el: KEYS[0].el + 0.12,
    dist: 15,
    ty: KEYS[0].ty,
    sx: 0,
    sy: 0,
    drag: 0,
    focus: 0,
    focusAz: 0,
  });

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    const s = st.current;
    const shop = useShop.getState();
    const cam = camera as THREE.PerspectiveCamera;
    const k = sample(live.s, s.key);
    const mobile = size.width < 860;
    const aspect = size.width / size.height;

    // El giro manual se conserva en Calidad y se suelta al cambiar de etapa.
    if (!live.dragging && Math.round(live.s) !== 4) live.drag = damp(live.drag, 0, 2.5, dt);
    s.drag = damp(s.drag, live.drag, 8, dt);

    const fov = mobile ? 36 : 30;
    if (cam.fov !== fov) cam.fov = fov;

    // Con una solución elegida la cámara se asoma hacia su pieza.
    const picked = shop.stage === 3 && shop.solution !== null;
    s.focus = damp(s.focus, picked ? 1 : 0, 3, dt);
    s.focusAz = damp(s.focusAz, picked ? FOCUS_AZ[shop.solution!] : 0, 2.6, dt);
    // Un vaivén muy lento mantiene viva la imagen cuando nadie mueve nada.
    const idle = Math.sin(state.clock.elapsedTime * 0.28) * 0.022;
    const az = k.az + s.drag + live.px * 0.05 + s.focusAz * k.explode + idle;
    const el = k.el - live.py * 0.025;

    // Distancia para que el coche quepa en la parte de pantalla que le toca.
    const hf = 2 * Math.atan(Math.tan((fov * DEG) / 2) * aspect);
    const foot = (Math.abs(Math.sin(az)) * 4.95 + Math.abs(Math.cos(az)) * 2.0) * (1 + k.explode * 0.3);
    const avail = mobile ? 0.9 : 0.5 + 0.14 * (1 - Math.min(1, Math.abs(k.sx) / 0.2));
    const fit = foot / (2 * Math.tan(hf / 2) * avail);
    const dist = Math.max(k.dist, fit) * (1 - 0.07 * s.focus);

    const L = 3.4;
    s.az = damp(s.az, az, L, dt);
    s.el = damp(s.el, el, L, dt);
    s.dist = damp(s.dist, dist, L, dt);
    s.ty = damp(s.ty, k.ty, L, dt);
    s.sx = damp(s.sx, mobile ? 0 : k.sx, L, dt);
    s.sy = damp(s.sy, mobile ? k.sy : k.sx === 0 ? 0.12 : 0.02, L, dt);

    const ce = Math.cos(s.el);
    cam.position.set(Math.cos(s.az) * ce * s.dist, s.ty + Math.sin(s.el) * s.dist, Math.sin(s.az) * ce * s.dist);
    cam.lookAt(0, s.ty, 0);
    // Corre la imagen sin deformar la perspectiva: deja libre el lado del texto.
    cam.setViewOffset(size.width, size.height, -s.sx * size.width, s.sy * size.height, size.width, size.height);
  });
  return null;
}

function Studio() {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={1.2}>
      <color attach="background" args={['#020304']} />
      {/* Tubos del techo: son los brillos largos sobre cofre y techo */}
      {[-2.4, 0, 2.4].map((z) => (
        <Lightformer key={z} form="rect" intensity={z === 0 ? 11 : 7} position={[0, 5, z]} rotation-x={Math.PI / 2} scale={[13, 0.9, 1]} />
      ))}
      {/* Cajas de luz laterales: dibujan el costado */}
      <Lightformer form="rect" intensity={2.4} position={[0, 2.0, 7]} rotation-y={Math.PI} scale={[16, 3.6, 1]} />
      <Lightformer form="rect" intensity={2.4} position={[0, 2.0, -7]} scale={[16, 3.6, 1]} />
      {/* Acentos: ámbar por detrás, frío por delante */}
      <Lightformer form="rect" intensity={3} color="#FF8A3D" position={[-9, 1.4, 3]} scale={[4, 2.4, 1]} target={[0, 0.6, 0]} />
      <Lightformer form="rect" intensity={2.2} color="#A9C3FF" position={[9, 2.4, -3]} scale={[5, 3, 1]} target={[0, 0.6, 0]} />
    </Environment>
  );
}

function Ready() {
  // Avisa a la página cuando ya hay algo pintado, para levantar el telón.
  const done = useRef(0);
  useFrame(() => {
    if (done.current < 4) {
      done.current++;
      if (done.current === 4) useShop.getState().set({ ready: true });
    }
  });
  return null;
}

export default function Scene() {
  const wrap = useRef<HTMLDivElement>(null);
  // Este componente solo existe en el navegador (se importa con ssr: false),
  // así que puede leer la pantalla al nacer. En teléfonos se parte sin piso
  // reflejante ni resplandor, que son lo más caro de pintar.
  const [tier, setTier] = useState<'high' | 'low'>(() =>
    window.matchMedia('(max-width: 860px)').matches || window.matchMedia('(pointer: coarse)').matches ? 'low' : 'high',
  );
  const [dpr, setDpr] = useState(() =>
    Math.min(window.devicePixelRatio || 1, window.matchMedia('(max-width: 860px)').matches ? 1.5 : 1.75),
  );

  // Arrastrar para girar el coche. En táctil solo cuenta el gesto horizontal:
  // el vertical sigue siendo scroll (touch-action: pan-y).
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let lastX = 0;
    const down = (e: PointerEvent) => {
      live.dragging = true;
      lastX = e.clientX;
    };
    const move = (e: PointerEvent) => {
      live.px = (e.clientX / window.innerWidth) * 2 - 1;
      live.py = (e.clientY / window.innerHeight) * 2 - 1;
      if (!live.dragging) return;
      live.drag -= (e.clientX - lastX) * 0.006;
      lastX = e.clientX;
    };
    const up = () => {
      live.dragging = false;
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);

  return (
    <div ref={wrap} className="scene" aria-hidden="true">
      <Canvas
        dpr={dpr}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        camera={{ fov: 30, near: 0.5, far: 140, position: [10, 3, 8] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, 18, 52]} />
        <PerformanceMonitor
          onDecline={() => {
            setDpr((d) => Math.max(1, d - 0.25));
            setTier('low');
          }}
        />
        <ambientLight intensity={0.22} />
        <directionalLight position={[3, 8, 4]} intensity={0.9} />
        <Studio />
        <Rig />
        <Bay reflective={tier === 'high'} />
        <Car />
        <Ready />
        {tier === 'high' && (
          <EffectComposer multisampling={4}>
            <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.72} luminanceSmoothing={0.2} radius={0.72} />
            <Vignette offset={0.22} darkness={0.72} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
