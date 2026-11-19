/**
 * store.ts · v1.0
 *
 * Dos formas de compartir estado entre la página (HTML) y la escena (WebGL):
 *
 *   live      → objeto mutable, sin React. Lo escribe el scroll y lo lee la
 *               escena 60 veces por segundo. Si esto pasara por React, cada
 *               píxel de scroll volvería a pintar la página entera.
 *
 *   useShop   → estado de interfaz (zustand). Cambia pocas veces: etapa
 *               activa, solución elegida, color de pintura, formulario enviado.
 */
import { create } from 'zustand';

export const live = {
  /** Etapa como número continuo: 0 = Recepción … 5 = Entrega. 2.5 = a medio camino. */
  s: 0,
  /** Puntero normalizado, -1 a 1. */
  px: 0,
  py: 0,
  /** Giro que el visitante le dio al coche arrastrando, en radianes. */
  drag: 0,
  dragging: false,
  /** La página se abrió ya avanzada (recarga a media orden): el coche no entra, ya está. */
  skipIntro: false,
};

type Shop = {
  /** La escena ya pintó su primer cuadro. */
  ready: boolean;
  /** El telón de carga ya se levantó. */
  open: boolean;
  /** WebGL disponible. Si no, la página funciona igual, sin coche. */
  webgl: boolean;
  stage: number;
  /** Solución resaltada en la vista explotada, o null. */
  solution: number | null;
  paint: number;
  /** Autos al mes del calculador; acelera el escaneo. */
  autos: number;
  /** Sube cada vez que el coche debe hacer cambio de luces. */
  flash: number;
  /** El formulario se envió: el coche se va. */
  sent: boolean;
  set: (p: Partial<Shop>) => void;
  blink: () => void;
};

export const useShop = create<Shop>((set) => ({
  ready: false,
  open: false,
  webgl: true,
  stage: 0,
  solution: null,
  paint: 0,
  autos: 120,
  flash: 0,
  sent: false,
  set: (p) => set(p),
  blink: () => set((s) => ({ flash: s.flash + 1 })),
}));
