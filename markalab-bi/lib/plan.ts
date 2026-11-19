/**
 * Planeación: escenarios, supuestos y propagación.
 *
 * Es la parte que iguala a IBM Planning Analytics. Un supuesto se mueve y el
 * cambio recorre toda la cadena hasta EBITDA, sin que nadie recalcule nada a
 * mano. Las fórmulas están declaradas abajo para que cualquiera pueda
 * discutirlas en la junta en vez de creerlas.
 *
 *   unidades  = base × crecimiento × efecto precio × servicio × mercadotecnia
 *   ingreso   = unidades × precio neto
 *   costo     = unidades × costo unitario
 *   margen    = ingreso − costo
 *   EBITDA    = margen − gasto operativo − costo financiero del inventario
 */

import { COLECCIONES, CADENAS, type Coleccion } from "./catalog";
import type { Combo } from "./engine";

/* ------------------------------------------------------------------ *
 * Supuestos
 * ------------------------------------------------------------------ */

export type Supuestos = {
  /** Crecimiento de volumen contra la corrida actual, en puntos porcentuales. */
  crecimiento: number;
  /** Movimiento de precio de lista, en puntos porcentuales. */
  precio: number;
  /** Movimiento del costo de producto, en puntos porcentuales. */
  costo: number;
  /** Elasticidad precio-demanda. 1.0 = un punto de precio cuesta un punto de volumen. */
  elasticidad: number;
  /** Nivel de servicio objetivo: qué parte de los quiebres se evita. */
  servicio: number;
  /** Inversión anual en mercadotecnia, en millones de pesos. */
  mercadotecnia: number;
  /** Días de inventario objetivo en el canal. */
  diasObjetivo: number;
  /** Descuento promedio de liquidación sobre el inventario envejecido. */
  liquidacion: number;
  /** Gasto operativo fijo anual, en millones de pesos. */
  gastoFijo: number;
  /** Gasto operativo variable como porcentaje del ingreso. */
  gastoVariable: number;
};

export type Escenario = {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  /** Un escenario bloqueado no se edita: es la referencia contra la que se compara. */
  bloqueado: boolean;
  supuestos: Supuestos;
};

const BASE: Supuestos = {
  crecimiento: 0,
  precio: 0,
  costo: 0,
  elasticidad: 1.1,
  servicio: 0,
  mercadotecnia: 42,
  diasObjetivo: 56,
  liquidacion: 0,
  gastoFijo: 186,
  gastoVariable: 11.5,
};

export const ESCENARIOS_BASE: Escenario[] = [
  {
    id: "base",
    nombre: "Base",
    descripcion:
      "La corrida actual proyectada doce meses sin cambiar nada. Es el escenario contra el que se mide todo lo demás.",
    color: "var(--ink-2)",
    bloqueado: true,
    supuestos: { ...BASE },
  },
  {
    id: "plan",
    nombre: "Plan 2027",
    descripcion:
      "El presupuesto comprometido: crecimiento de ocho puntos, un punto de precio y servicio al 60 por ciento.",
    color: "var(--s1)",
    bloqueado: true,
    supuestos: {
      ...BASE,
      crecimiento: 8,
      precio: 3.5,
      costo: 2.2,
      servicio: 60,
      mercadotecnia: 54,
      diasObjetivo: 49,
    },
  },
  {
    id: "corregido",
    nombre: "Canal corregido",
    descripcion:
      "Lo que pasa si se ataca la saturación: menos días de inventario objetivo, liquidación del producto envejecido y servicio alto en las plazas que sí venden.",
    color: "var(--s4)",
    bloqueado: false,
    supuestos: {
      ...BASE,
      crecimiento: 5,
      precio: 2,
      costo: 2.2,
      servicio: 85,
      mercadotecnia: 48,
      diasObjetivo: 38,
      liquidacion: 18,
    },
  },
  {
    id: "conservador",
    nombre: "Conservador",
    descripcion:
      "Mercado plano, presión de costo y sin corrección del canal. El piso razonable.",
    color: "var(--s2)",
    bloqueado: false,
    supuestos: {
      ...BASE,
      crecimiento: -2,
      precio: 1,
      costo: 4.5,
      servicio: 15,
      mercadotecnia: 36,
      diasObjetivo: 62,
    },
  },
  {
    id: "mio",
    nombre: "Mi escenario",
    descripcion:
      "Libre. Mueve cualquier supuesto y observa cómo se propaga hasta EBITDA.",
    color: "var(--s3)",
    bloqueado: false,
    supuestos: { ...BASE },
  },
];

export const CAMPOS_SUPUESTO: {
  k: keyof Supuestos;
  etiqueta: string;
  unidad: string;
  min: number;
  max: number;
  paso: number;
  ayuda: string;
}[] = [
  {
    k: "crecimiento",
    etiqueta: "Crecimiento de volumen",
    unidad: "%",
    min: -20,
    max: 35,
    paso: 0.5,
    ayuda: "Contra la corrida actual del canal, antes de cualquier efecto de precio.",
  },
  {
    k: "precio",
    etiqueta: "Movimiento de precio",
    unidad: "%",
    min: -10,
    max: 20,
    paso: 0.5,
    ayuda: "Sube el ingreso por pieza y baja el volumen según la elasticidad.",
  },
  {
    k: "costo",
    etiqueta: "Movimiento de costo",
    unidad: "%",
    min: -5,
    max: 20,
    paso: 0.5,
    ayuda: "Costo de producto puesto en almacén. Pega directo al margen bruto.",
  },
  {
    k: "elasticidad",
    etiqueta: "Elasticidad precio",
    unidad: "×",
    min: 0,
    max: 2.5,
    paso: 0.1,
    ayuda: "Cuántos puntos de volumen cuesta cada punto de precio.",
  },
  {
    k: "servicio",
    etiqueta: "Nivel de servicio",
    unidad: "%",
    min: 0,
    max: 100,
    paso: 5,
    ayuda: "Qué parte de la venta perdida por quiebre se recupera.",
  },
  {
    k: "mercadotecnia",
    etiqueta: "Inversión en mercadotecnia",
    unidad: "M$",
    min: 0,
    max: 140,
    paso: 2,
    ayuda: "Rendimiento decreciente: duplicar la inversión no duplica el volumen.",
  },
  {
    k: "diasObjetivo",
    etiqueta: "Días de inventario objetivo",
    unidad: "días",
    min: 21,
    max: 120,
    paso: 1,
    ayuda: "Menos días liberan capital pero acercan el riesgo de quiebre.",
  },
  {
    k: "liquidacion",
    etiqueta: "Liquidación de envejecido",
    unidad: "%",
    min: 0,
    max: 45,
    paso: 1,
    ayuda: "Descuento sobre el inventario de más de 360 días. Recupera caja, sacrifica margen.",
  },
  {
    k: "gastoFijo",
    etiqueta: "Gasto operativo fijo",
    unidad: "M$",
    min: 100,
    max: 320,
    paso: 2,
    ayuda: "Estructura, nómina y operación que no se mueve con la venta.",
  },
  {
    k: "gastoVariable",
    etiqueta: "Gasto variable sobre ingreso",
    unidad: "%",
    min: 4,
    max: 24,
    paso: 0.5,
    ayuda: "Comisiones, fletes y gasto que escala con la facturación.",
  },
];

/* ------------------------------------------------------------------ *
 * Proyección
 * ------------------------------------------------------------------ */

export const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

/** Estacionalidad mensual del portafolio: diciembre y mayo mandan. */
const CURVA = [0.74, 0.7, 0.82, 0.88, 1.18, 0.9, 0.86, 0.84, 0.88, 0.96, 1.12, 2.02];

export type LineaPlan = {
  coleccionId: string;
  nombre: string;
  segmento: string;
  /** Unidades por mes. */
  unidades: number[];
  ingreso: number[];
  costo: number[];
  margen: number[];
  /** Totales del año. */
  totalUnidades: number;
  totalIngreso: number;
  totalCosto: number;
  totalMargen: number;
  margenPct: number;
  precioNeto: number;
};

export type Proyeccion = {
  escenario: Escenario;
  lineas: LineaPlan[];
  /** Totales por mes. */
  ingresoMes: number[];
  costoMes: number[];
  margenMes: number[];
  gastoMes: number[];
  ebitdaMes: number[];
  /** Totales del año. */
  unidades: number;
  ingreso: number;
  costo: number;
  margenBruto: number;
  margenPct: number;
  gastoOperativo: number;
  costoInventario: number;
  ebitda: number;
  ebitdaPct: number;
  /** Capital promedio inmovilizado en el canal. */
  inventarioPromedio: number;
  /** Venta recuperada por mejorar el nivel de servicio. */
  recuperado: number;
  /** Caja liberada por bajar los días de inventario objetivo. */
  cajaLiberada: number;
  /** Por cadena. */
  porCadena: { id: string; nombre: string; ingreso: number; margen: number; unidades: number }[];
};

/** Rendimiento decreciente de la inversión en mercadotecnia. */
function efectoMercadotecnia(millones: number, base: number) {
  if (millones <= 0) return 0.94;
  return 1 + 0.085 * Math.log(millones / Math.max(1, base));
}

export function proyectar(
  escenario: Escenario,
  combos: Combo[],
  perdidaSemanal: number,
  capitalParado: number
): Proyeccion {
  const s = escenario.supuestos;

  // Corrida base por colección: desplazamiento semanal observado × 52
  const corrida = new Map<string, number>();
  for (const c of combos) {
    corrida.set(c.coleccion.id, (corrida.get(c.coleccion.id) ?? 0) + c.so * 52);
  }

  const fPrecio = Math.pow(1 + s.precio / 100, -s.elasticidad);
  const fCrec = 1 + s.crecimiento / 100;
  const fMkt = efectoMercadotecnia(s.mercadotecnia, BASE.mercadotecnia);
  // Días de inventario por debajo de lo razonable empiezan a costar servicio.
  const riesgoDias = s.diasObjetivo < 35 ? 1 - (35 - s.diasObjetivo) * 0.006 : 1;
  // Liquidar el envejecido libera anaquel para el producto que sí rota.
  const fAnaquel = 1 + (s.liquidacion / 100) * 0.14;

  const lineas: LineaPlan[] = [];
  const ingresoMes = Array(12).fill(0);
  const costoMes = Array(12).fill(0);

  for (const col of COLECCIONES) {
    const anual = corrida.get(col.id) ?? 0;
    if (anual <= 0) continue;

    // El descuento de liquidación afecta al inventario envejecido, no al precio
    // de lista de todo el año: se cobra una sola vez, más abajo, contra margen.
    const precioNeto = col.precio * (1 + s.precio / 100);
    const costoUnit = col.precio * (1 - col.margen) * (1 + s.costo / 100);

    const unidades: number[] = [];
    const ingreso: number[] = [];
    const costo: number[] = [];
    const margen: number[] = [];

    for (let m = 0; m < 12; m++) {
      const estac = 1 + (CURVA[m] - 1) * (col.estacionalidad - 1) * 2.1;
      const u = (anual / 12) * estac * fCrec * fPrecio * fMkt * riesgoDias * fAnaquel;
      const i = u * precioNeto;
      const k = u * costoUnit;
      unidades.push(u);
      ingreso.push(i);
      costo.push(k);
      margen.push(i - k);
      ingresoMes[m] += i;
      costoMes[m] += k;
    }

    const totalIngreso = ingreso.reduce((a, b) => a + b, 0);
    const totalCosto = costo.reduce((a, b) => a + b, 0);
    lineas.push({
      coleccionId: col.id,
      nombre: col.nombre,
      segmento: col.segmento,
      unidades,
      ingreso,
      costo,
      margen,
      totalUnidades: unidades.reduce((a, b) => a + b, 0),
      totalIngreso,
      totalCosto,
      totalMargen: totalIngreso - totalCosto,
      margenPct: totalIngreso > 0 ? ((totalIngreso - totalCosto) / totalIngreso) * 100 : 0,
      precioNeto,
    });
  }

  // Venta recuperada al cerrar quiebres
  const recuperado = perdidaSemanal * 52 * (s.servicio / 100);
  const margenRecuperado = recuperado * 0.52;
  for (let m = 0; m < 12; m++) {
    const peso = CURVA[m] / CURVA.reduce((a, b) => a + b, 0);
    ingresoMes[m] += recuperado * peso;
    costoMes[m] += recuperado * 0.48 * peso;
  }

  const ingreso = ingresoMes.reduce((a, b) => a + b, 0);
  const costo = costoMes.reduce((a, b) => a + b, 0);
  const margenBruto = ingreso - costo;

  // Inventario promedio implícito en los días objetivo
  const inventarioPromedio = (costo / 365) * s.diasObjetivo;
  const costoInventario = inventarioPromedio * 0.18;

  // Liquidación: recupera caja del envejecido a cambio de margen, una sola vez
  const perdidaLiquidacion = capitalParado * (s.liquidacion / 100) * 0.45;
  const cajaLiberada =
    (costo / 365) * (BASE.diasObjetivo - s.diasObjetivo) +
    capitalParado * (s.liquidacion / 100);

  const gastoOperativo =
    s.gastoFijo * 1e6 + ingreso * (s.gastoVariable / 100) + s.mercadotecnia * 1e6;

  const margenMes: number[] = [];
  const gastoMes: number[] = [];
  const ebitdaMes: number[] = [];
  for (let m = 0; m < 12; m++) {
    const mg = ingresoMes[m] - costoMes[m];
    const gs =
      (s.gastoFijo * 1e6) / 12 +
      ingresoMes[m] * (s.gastoVariable / 100) +
      (s.mercadotecnia * 1e6) / 12 +
      costoInventario / 12 +
      perdidaLiquidacion / 12;
    margenMes.push(mg);
    gastoMes.push(gs);
    ebitdaMes.push(mg - gs);
  }

  const ebitda = margenBruto - gastoOperativo - costoInventario - perdidaLiquidacion;

  // Reparto por cadena, con el peso que cada una tiene en la corrida actual
  const pesoCadena = new Map<string, number>();
  let totalPeso = 0;
  for (const c of combos) {
    const v = c.so * 52 * c.coleccion.precio;
    pesoCadena.set(c.sucursal.cadenaId, (pesoCadena.get(c.sucursal.cadenaId) ?? 0) + v);
    totalPeso += v;
  }
  const porCadena = CADENAS.map((cd) => {
    const p = totalPeso > 0 ? (pesoCadena.get(cd.id) ?? 0) / totalPeso : 0;
    return {
      id: cd.id,
      nombre: cd.nombre,
      ingreso: ingreso * p,
      margen: margenBruto * p,
      unidades: lineas.reduce((a, l) => a + l.totalUnidades, 0) * p,
    };
  }).filter((c) => c.ingreso > 0);

  return {
    escenario,
    lineas: lineas.sort((a, b) => b.totalIngreso - a.totalIngreso),
    ingresoMes,
    costoMes,
    margenMes,
    gastoMes,
    ebitdaMes,
    unidades: lineas.reduce((a, l) => a + l.totalUnidades, 0),
    ingreso,
    costo,
    margenBruto,
    margenPct: ingreso > 0 ? (margenBruto / ingreso) * 100 : 0,
    gastoOperativo,
    costoInventario: costoInventario + perdidaLiquidacion,
    ebitda,
    ebitdaPct: ingreso > 0 ? (ebitda / ingreso) * 100 : 0,
    inventarioPromedio,
    recuperado: margenRecuperado,
    cajaLiberada,
    porCadena,
  };
}

/** Renglones del estado de resultados, en el orden en que se leen. */
export type RenglonPL = {
  etiqueta: string;
  valores: number[];
  total: number;
  tipo: "ingreso" | "costo" | "subtotal" | "gasto" | "resultado";
  sangria?: boolean;
};

export function estadoResultados(p: Proyeccion): RenglonPL[] {
  const q = (arr: number[]) => [0, 1, 2, 3].map((i) => arr.slice(i * 3, i * 3 + 3).reduce((a, b) => a + b, 0));
  const s = p.escenario.supuestos;
  const fijoQ = Array(4).fill((s.gastoFijo * 1e6) / 4);
  const mktQ = Array(4).fill((s.mercadotecnia * 1e6) / 4);
  const varQ = q(p.ingresoMes).map((v) => v * (s.gastoVariable / 100));
  const invQ = Array(4).fill(p.costoInventario / 4);

  const ingresoQ = q(p.ingresoMes);
  const costoQ = q(p.costoMes);
  const margenQ = ingresoQ.map((v, i) => v - costoQ[i]);
  const gastoQ = fijoQ.map((v, i) => v + mktQ[i] + varQ[i] + invQ[i]);
  const ebitdaQ = margenQ.map((v, i) => v - gastoQ[i]);

  const fila = (
    etiqueta: string,
    valores: number[],
    tipo: RenglonPL["tipo"],
    sangria = false
  ): RenglonPL => ({
    etiqueta,
    valores,
    total: valores.reduce((a, b) => a + b, 0),
    tipo,
    sangria,
  });

  return [
    fila("Ingreso neto", ingresoQ, "ingreso"),
    fila("Costo de ventas", costoQ, "costo", true),
    fila("Margen bruto", margenQ, "subtotal"),
    fila("Gasto fijo de operación", fijoQ, "gasto", true),
    fila("Gasto variable", varQ, "gasto", true),
    fila("Mercadotecnia", mktQ, "gasto", true),
    fila("Costo financiero del inventario", invQ, "gasto", true),
    fila("Gasto operativo total", gastoQ, "subtotal"),
    fila("EBITDA", ebitdaQ, "resultado"),
  ];
}

export const coleccionDePlan = (id: string): Coleccion | undefined =>
  COLECCIONES.find((c) => c.id === id);
