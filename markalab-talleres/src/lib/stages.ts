/**
 * stages.ts · v1.0
 *
 * La coreografía. Cada etapa de la orden de servicio es un cuadro clave: dónde
 * está la cámara y en qué estado está el coche. Entre una etapa y la siguiente
 * la escena interpola, así que para cambiar un encuadre basta editar su fila.
 */

const DEG = Math.PI / 180;

export type Key = {
  /** Azimut de la cámara alrededor del coche, en radianes. 0 = de frente. */
  az: number;
  /** Elevación de la cámara. */
  el: number;
  /** Distancia mínima; la escena la aumenta si el coche no cabe. */
  dist: number;
  /** Altura a la que mira la cámara. */
  ty: number;
  /** Cuánto se corre el coche en pantalla (fracción del ancho). Escritorio. */
  sx: number;
  /** Cuánto sube el coche en pantalla (fracción del alto). Móvil. */
  sy: number;
  /** 0 = en el piso, 1 = elevador arriba. */
  lift: number;
  /** 0 = pintura, 1 = radiografía. */
  xray: number;
  /** 0 = armado, 1 = vista explotada. */
  explode: number;
  head: number;
  tail: number;
};

export const KEYS: Key[] = [
  // 01 Recepción · entra a la bahía, tres cuartos de frente
  { az: 38 * DEG, el: 8 * DEG, dist: 7.6, ty: 0.72, sx: 0.25, sy: 0.17, lift: 0, xray: 0, explode: 0, head: 1, tail: 0.5 },
  // 02 Diagnóstico · arriba, en radiografía, cámara baja
  { az: -40 * DEG, el: 1 * DEG, dist: 7.8, ty: 1.25, sx: -0.2, sy: 0.2, lift: 1, xray: 1, explode: 0, head: 0.25, tail: 0.2 },
  // 03 Autorización · de perfil, esperando en el elevador
  { az: -84 * DEG, el: 5 * DEG, dist: 8.6, ty: 1.2, sx: -0.21, sy: 0.33, lift: 1, xray: 0, explode: 0, head: 0.6, tail: 0.5 },
  // 04 Intervención · vista explotada desde arriba
  { az: 52 * DEG, el: 27 * DEG, dist: 9.6, ty: 1.15, sx: 0.2, sy: 0.3, lift: 0, xray: 0, explode: 1, head: 0.6, tail: 0.4 },
  // 05 Calidad · armado, tres cuartos trasero
  { az: 148 * DEG, el: 11 * DEG, dist: 7.6, ty: 0.7, sx: 0, sy: 0.2, lift: 0, xray: 0, explode: 0, head: 0.5, tail: 1 },
  // 06 Entrega · de salida
  { az: 212 * DEG, el: 7 * DEG, dist: 7.8, ty: 0.72, sx: -0.25, sy: 0.3, lift: 0, xray: 0, explode: 0, head: 1, tail: 1 },
];

const ease = (t: number) => t * t * (3 - 2 * t);

/** Cuadro interpolado para una etapa continua s (0 … KEYS.length - 1). */
export function sample(s: number, out: Key): Key {
  const c = Math.min(KEYS.length - 1, Math.max(0, s));
  const i = Math.min(KEYS.length - 2, Math.floor(c));
  const t = ease(c - i);
  const a = KEYS[i];
  const b = KEYS[i + 1];
  (Object.keys(a) as (keyof Key)[]).forEach((k) => {
    out[k] = a[k] + (b[k] - a[k]) * t;
  });
  return out;
}
