/**
 * scroll.ts · v1.0
 *
 * Traduce el scroll a "etapa de la orden de servicio".
 *
 * Cada sección es más alta que la pantalla y su contenido queda fijo (sticky)
 * mientras se recorre. Eso da dos fases:
 *
 *   reposo      → la sección está fija: la etapa vale un entero (2, 3…) y la
 *                 cámara descansa. Aquí es donde el visitante interactúa.
 *   transición  → una pantalla de scroll entre dos secciones: la etapa avanza
 *                 de i a i+1 y el coche cambia de estado.
 */
import type Lenis from 'lenis';
import { live, useShop } from './store';

type Layout = { tops: number[]; heights: number[]; vh: number };

export const scroller: { lenis: Lenis | null; layout: Layout; listeners: ((s: number) => void)[] } = {
  lenis: null,
  layout: { tops: [], heights: [], vh: 1 },
  listeners: [],
};

export function measure() {
  const secs = Array.from(document.querySelectorAll<HTMLElement>('[data-stage]'));
  const pin = document.querySelector<HTMLElement>('.stage-pin');
  scroller.layout = {
    tops: secs.map((el) => el.offsetTop),
    heights: secs.map((el) => el.offsetHeight),
    vh: pin?.offsetHeight || window.innerHeight,
  };
}

export function stageAt(y: number): number {
  const { tops, heights, vh } = scroller.layout;
  const n = tops.length;
  if (!n) return 0;
  for (let i = 0; i < n - 1; i++) {
    const holdEnd = tops[i] + heights[i] - vh;
    if (y <= holdEnd) return i;
    if (y < tops[i + 1]) return i + (y - holdEnd) / (tops[i + 1] - holdEnd);
  }
  return n - 1;
}

/** Se llama en cada evento de scroll. */
export function onScroll(y: number) {
  const s = stageAt(y);
  live.s = s;
  const stage = Math.round(s);
  const shop = useShop.getState();
  if (shop.stage !== stage) shop.set({ stage });
  for (const fn of scroller.listeners) fn(s);
}

export function goToStage(i: number) {
  const { tops } = scroller.layout;
  if (tops[i] === undefined) return;
  const y = tops[i] + 2;
  if (scroller.lenis) scroller.lenis.scrollTo(y, { duration: 1.6 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}
