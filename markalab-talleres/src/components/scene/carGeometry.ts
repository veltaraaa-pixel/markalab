/**
 * carGeometry.ts · v1.0
 *
 * El coche no es un modelo descargado: se genera con código. Así el repositorio
 * no carga un archivo .glb de varios megas ni depende de la licencia de nadie,
 * y el coche pesa lo que pesan estas funciones.
 *
 * Cómo se arma
 * ------------
 * La carrocería es un "loft": se define el corte transversal del coche en cada
 * punto de su largo (halfSection) y se cosen los cortes entre sí. Cuatro curvas
 * mandan sobre la silueta:
 *
 *   deck   → cofre, base del parabrisas y tapa de cajuela
 *   roofC  → la línea del techo, solo donde hay cabina
 *   base   → el piso de la carrocería (los pasos de rueda se restan aparte)
 *   halfW  → el ancho visto desde arriba
 *
 * Para cambiar la silueta basta mover los puntos de esas curvas.
 *
 * Ejes: X hacia el frente del coche, Y hacia arriba, Z hacia la derecha.
 * Unidades en metros.
 */
import * as THREE from 'three';

export const CAR = {
  /** Mitad del largo total */
  L: 2.42,
  /** Mitad del ancho máximo */
  HW: 0.95,
  wheelX: 1.46,
  wheelR: 0.355,
  wheelZ: 0.785,
  archR: 0.44,
} as const;

type Pt = [number, number];

/** Interpolación cúbica de Hermite por una lista de puntos (x, y). */
function curve(pts: Pt[]) {
  const n = pts.length;
  const m = pts.map((_, i) => {
    const a = pts[Math.max(i - 1, 0)];
    const b = pts[Math.min(i + 1, n - 1)];
    return (b[1] - a[1]) / (b[0] - a[0]);
  });
  return (x: number) => {
    if (x <= pts[0][0]) return pts[0][1];
    if (x >= pts[n - 1][0]) return pts[n - 1][1];
    let i = 0;
    while (x > pts[i + 1][0]) i++;
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const h = x1 - x0;
    const t = (x - x0) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * y0 +
      (t3 - 2 * t2 + t) * h * m[i] +
      (-2 * t3 + 3 * t2) * y1 +
      (t3 - t2) * h * m[i + 1]
    );
  };
}

const deck = curve([
  [-2.42, 0.8],
  [-2.36, 0.97],
  [-2.05, 1.035],
  [-1.5, 1.03],
  [0, 1.0],
  [1.0, 0.995],
  [1.5, 0.965],
  [2.0, 0.885],
  [2.28, 0.78],
  [2.42, 0.63],
]);

const ROOF_X0 = -2.02;
const ROOF_X1 = 1.08;
const roofC = curve([
  [ROOF_X0, 1.03],
  [-1.6, 1.125],
  [-1.05, 1.275],
  [-0.5, 1.365],
  [-0.05, 1.385],
  [0.38, 1.35],
  [0.72, 1.215],
  [ROOF_X1, 0.992],
]);

const base = curve([
  [-2.42, 0.52],
  [-2.3, 0.36],
  [-1.95, 0.225],
  [1.95, 0.205],
  [2.3, 0.3],
  [2.42, 0.44],
]);

export function halfW(x: number) {
  const u = Math.min(1, Math.abs(x) / CAR.L);
  return x >= 0
    ? CAR.HW * Math.pow(Math.max(0, 1 - Math.pow(u, 8)), 1 / 3)
    : CAR.HW * Math.pow(Math.max(0, 1 - Math.pow(u, 10)), 1 / 3.2);
}

function bottom(x: number) {
  let y = base(x);
  for (const xw of [CAR.wheelX, -CAR.wheelX]) {
    const d = Math.abs(x - xw);
    if (d < CAR.archR) y = Math.max(y, CAR.wheelR + Math.sqrt(CAR.archR ** 2 - d * d));
  }
  return y;
}

/** Altura de la cabina sobre la línea de cintura. Cero en cofre y cajuela. */
function cabin(x: number) {
  if (x <= ROOF_X0 || x >= ROOF_X1) return 0;
  return Math.max(0, roofC(x) - deck(x));
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Perfil del costado, del estribo (t = 0) al hombro (t = 1), como fracción del
 * medio ancho. El punto más ancho queda a media puerta y de ahí hacia arriba la
 * lámina se mete un poco: esa caída es la que atrapa la luz y dibuja el hombro.
 */
const SIDE_PEAK = 0.6;
function sideProfile(t: number) {
  if (t < SIDE_PEAK) return 0.8 + 0.2 * (1 - Math.pow(1 - t / SIDE_PEAK, 3));
  const u = (t - SIDE_PEAK) / (1 - SIDE_PEAK);
  return 1 - 0.045 * u * u;
}

// Cuántos puntos lleva cada tramo del medio corte.
const NA = 4; // piso
const NB = 10; // estribo y costado
const NC = 6; // hombro
const ND = 6; // cristal lateral
const NE = 8; // techo
/** Puntos del medio corte, del centro del piso al centro del techo. */
export const NH = NA + NB + NC + ND + NE;
/** Puntos del corte completo. */
export const NR = 2 * NH - 2;
/** Índice (en el medio corte) donde termina la lámina y empieza el cristal. */
const GLASS_FROM = NA + NB + NC - 1;

/**
 * Medio corte transversal en la estación x: pares (z, y) del centro del piso
 * al centro del techo. La otra mitad es el espejo.
 */
export function halfSection(x: number, out: number[] = []): number[] {
  const hw = halfW(x);
  const yb = bottom(x);
  const yd = deck(x);
  const ys = Math.max(yb + 0.02, yd - 0.055);
  const g = cabin(x);
  const k = smooth(0, 0.12, g);
  let n = 0;
  const push = (z: number, y: number) => {
    out[n++] = z;
    out[n++] = y;
  };

  for (let i = 0; i < NA; i++) push(hw * 0.8 * (i / (NA - 1)), yb);

  for (let i = 1; i <= NB; i++) {
    const t = i / NB;
    push(hw * sideProfile(t), yb + (ys - yb) * t);
  }

  const zS = hw * sideProfile(1);
  const zE = mix(hw * 0.7, hw - 0.13, k);
  const yE = mix(yd - 0.01, ys + 0.05, k);
  for (let i = 1; i <= NC; i++) {
    const a = ((i / NC) * Math.PI) / 2;
    push(zS + (zE - zS) * (1 - Math.cos(a)), ys + (yE - ys) * Math.sin(a));
  }

  const yTop = yd + g;
  const zF = zE - 0.6 * g;
  const yF = yE + (yTop - yE) * 0.84;
  for (let i = 1; i <= ND; i++) {
    const t = i / ND;
    push(zE + (zF - zE) * t + 0.025 * k * Math.sin(Math.PI * t), yE + (yF - yE) * t);
  }

  for (let i = 1; i <= NE; i++) {
    const t = i / NE;
    push(zF * (1 - t), yF + (yTop - yF) * (1 - Math.pow(1 - t, 2.2)));
  }
  out.length = n;
  return out;
}

/** Estaciones a lo largo del coche, más densas en puntas y pasos de rueda. */
function stations(): number[] {
  const xs: number[] = [];
  const STEP = 0.034;
  for (let x = -CAR.L; x <= CAR.L + 1e-6; x += STEP) xs.push(x);
  // Puntas: el ancho cae rápido y hace falta resolución para que redondee.
  for (let i = 0; i <= 26; i++) {
    const d = 0.3 * Math.pow(i / 26, 2.4);
    xs.push(CAR.L - d, -CAR.L + d);
  }
  // Pasos de rueda: se muestrea por ángulo para que el arco salga limpio.
  for (const xw of [CAR.wheelX, -CAR.wheelX]) {
    for (let i = 0; i <= 44; i++) xs.push(xw + CAR.archR * Math.cos((i / 44) * Math.PI));
    xs.push(xw + CAR.archR + 0.0008, xw - CAR.archR - 0.0008);
    xs.push(xw + CAR.archR - 0.0008, xw - CAR.archR + 0.0008);
  }
  xs.sort((a, b) => a - b);
  const outXs: number[] = [];
  for (const x of xs) {
    const c = Math.min(CAR.L, Math.max(-CAR.L, x));
    if (!outXs.length || c - outXs[outXs.length - 1] > 0.0006) outXs.push(c);
  }
  return outXs;
}

export type CarGeometry = {
  body: THREE.BufferGeometry;
  glass: THREE.BufferGeometry;
  trim: THREE.BufferGeometry;
  cuts: THREE.BufferGeometry;
  wire: THREE.BufferGeometry;
};

export function buildCar(): CarGeometry {
  const xs = stations();
  const S = xs.length;
  const pos = new Float32Array(S * NR * 3);
  const half: number[] = [];

  for (let i = 0; i < S; i++) {
    halfSection(xs[i], half);
    for (let j = 0; j < NR; j++) {
      const mIdx = j < NH ? j : NR - j;
      const sign = j < NH ? 1 : -1;
      const o = (i * NR + j) * 3;
      pos[o] = xs[i];
      pos[o + 1] = half[mIdx * 2 + 1];
      pos[o + 2] = half[mIdx * 2] * sign;
    }
  }

  const idx: number[] = [];
  for (let i = 0; i < S - 1; i++) {
    for (let j = 0; j < NR; j++) {
      const j2 = (j + 1) % NR;
      const a = i * NR + j;
      const b = (i + 1) * NR + j;
      const c = (i + 1) * NR + j2;
      const d = i * NR + j2;
      idx.push(a, b, c, a, c, d);
    }
  }

  const body = new THREE.BufferGeometry();
  body.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  body.setIndex(idx);
  body.computeVertexNormals();

  // ---- Piezas superpuestas: copian un grupo de caras de la carrocería y las
  // separan unos milímetros hacia afuera, para darles otro material.
  const nrm = body.getAttribute('normal') as THREE.BufferAttribute;
  const strip = (offset: number, want: (i: number, j: number) => boolean) => {
    const p: number[] = [];
    const ix: number[] = [];
    const remap = new Map<number, number>();
    const v = (n: number) => {
      let r = remap.get(n);
      if (r === undefined) {
        r = p.length / 3;
        p.push(pos[n * 3] + nrm.getX(n) * offset, pos[n * 3 + 1] + nrm.getY(n) * offset, pos[n * 3 + 2] + nrm.getZ(n) * offset);
        remap.set(n, r);
      }
      return r;
    };
    for (let i = 0; i < S - 1; i++) {
      for (let j = 0; j < NR; j++) {
        if (!want(i, j)) continue;
        const j2 = (j + 1) % NR;
        const a = v(i * NR + j);
        const b = v((i + 1) * NR + j);
        const c = v((i + 1) * NR + j2);
        const d = v(i * NR + j2);
        ix.push(a, b, c, a, c, d);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    g.setIndex(ix);
    g.computeVertexNormals();
    return g;
  };

  // Cristal: una sola cúpula de la cintura hacia arriba.
  const glass = strip(
    0.007,
    (i, j) => j >= GLASS_FROM && j < NR - GLASS_FROM && (cabin(xs[i]) >= 0.006 || cabin(xs[i + 1]) >= 0.006),
  );
  // Faldón: la parte baja en negro mate. Aligera la silueta y marca el estribo.
  const TRIM_TO = NA + 2;
  const trim = strip(0.004, (_i, j) => j < TRIM_TO || j >= NR - TRIM_TO);

  // Cortes de puerta, cofre y cajuela: líneas finas sobre la lámina.
  const cPos: number[] = [];
  const cut = (x: number, from: number, to: number) => {
    let i = 0;
    while (i < S - 1 && xs[i] < x) i++;
    for (const side of [0, 1]) {
      for (let m = from; m < to; m++) {
        const j0 = side ? NR - m : m;
        const j1 = side ? NR - m - 1 : m + 1;
        for (const j of [j0, j1]) {
          const n = i * NR + j;
          cPos.push(pos[n * 3] + nrm.getX(n) * 0.003, pos[n * 3 + 1] + nrm.getY(n) * 0.003, pos[n * 3 + 2] + nrm.getZ(n) * 0.003);
        }
      }
    }
  };
  cut(0.98, TRIM_TO, GLASS_FROM);
  cut(-0.12, TRIM_TO, GLASS_FROM);
  cut(-1.02, TRIM_TO + 5, GLASS_FROM);
  cut(1.02, GLASS_FROM, NH - 1);
  cut(-2.0, GLASS_FROM - 3, NH - 1);
  const cuts = new THREE.BufferGeometry();
  cuts.setAttribute('position', new THREE.Float32BufferAttribute(cPos, 3));

  // ---- Malla de plano técnico: costillas y largueros, sin diagonales.
  const wPos: number[] = [];
  const seg = (a: number, b: number) => {
    wPos.push(pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2], pos[b * 3], pos[b * 3 + 1], pos[b * 3 + 2]);
  };
  let lastRib = -99;
  for (let i = 0; i < S; i++) {
    if (xs[i] - lastRib < 0.2 && i !== S - 1) continue;
    lastRib = xs[i];
    for (let j = 0; j < NR; j++) seg(i * NR + j, i * NR + ((j + 1) % NR));
  }
  const longs = [0, 3, 8, 13, 16, 19, 22, 25, 28, 31, NH - 1];
  for (const mIdx of longs) {
    const js = mIdx === 0 || mIdx === NH - 1 ? [mIdx] : [mIdx, NR - mIdx];
    for (const j of js) for (let i = 0; i < S - 1; i++) seg(i * NR + j, (i + 1) * NR + j);
  }
  const wire = new THREE.BufferGeometry();
  wire.setAttribute('position', new THREE.Float32BufferAttribute(wPos, 3));

  return { body, glass, trim, cuts, wire };
}

/** Contorno cerrado del coche en la estación x. Lo usa el anillo de escaneo. */
export function ringAt(x: number, target: Float32Array) {
  const half = halfSection(Math.min(CAR.L - 0.01, Math.max(-CAR.L + 0.01, x)));
  for (let j = 0; j <= NR; j++) {
    const jj = j % NR;
    const mIdx = jj < NH ? jj : NR - jj;
    const sign = jj < NH ? 1 : -1;
    target[j * 3] = x;
    target[j * 3 + 1] = half[mIdx * 2 + 1];
    target[j * 3 + 2] = half[mIdx * 2] * sign * 1.012;
  }
}

/**
 * Curva que recorre la carrocería a una altura fija, de x0 a x1, por el lado
 * indicado. Como el ancho se cierra en las puntas, la curva "da la vuelta" a la
 * esquina sola: con eso se dibujan las luces.
 */
export function surfaceLine(x0: number, x1: number, y: number, side: 1 | -1, steps = 40): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = mix(x0, x1, i / steps);
    const hw = halfW(x);
    const yb = bottom(x);
    const ys = Math.max(yb + 0.02, deck(x) - 0.055);
    const t = Math.min(0.96, Math.max(0.05, (y - yb) / (ys - yb)));
    const z = hw * sideProfile(t);
    pts.push(new THREE.Vector3(x, yb + (ys - yb) * t, z * side));
  }
  return pts;
}

/** Altura del techo en x; sirve para colocar la antena y las etiquetas. */
export function topAt(x: number) {
  return deck(x) + cabin(x);
}
