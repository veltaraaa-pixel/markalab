/**
 * Copiloto: especialista en inteligencia comercial y planeación.
 *
 * Dos capas, y el orden importa:
 *
 *  1. MOTOR DE REGLAS (este archivo). Determinista, explicable y siempre
 *     disponible. Cada hallazgo declara la regla que lo disparó y los números
 *     que la cumplieron, así que nadie tiene que creer en una caja negra.
 *
 *  2. MODELO DE LENGUAJE vía n8n. Redacta, prioriza y contesta preguntas
 *     abiertas sobre los hallazgos que la capa 1 ya calculó. Nunca inventa
 *     cifras: recibe las del motor.
 *
 * Si n8n no contesta, la capa 1 responde sola. La demo no se cae.
 */

import {
  fmt,
  money,
  moneyCorto,
  traslados,
  porEstado,
  porSucursal,
  type Combo,
  type Indicadores,
} from "./engine";
import type { Decision } from "./store";

export type Severidad = "critica" | "alta" | "media" | "oportunidad";

export type Hallazgo = {
  id: string;
  severidad: Severidad;
  titulo: string;
  /** Lo que pasa, en una frase. */
  cuerpo: string;
  /** La acción concreta. */
  accion: string;
  /** Qué regla lo disparó y con qué números. Es la explicabilidad. */
  regla: string;
  /** Impacto en pesos. */
  valor: number;
  /** Unidad de lo que se gana o se deja de perder. */
  unidad: "recuperable" | "liberable" | "en riesgo";
  area: "Inventario" | "Logística" | "Comercial" | "Datos" | "Planeación";
};

export const ETIQUETA_SEVERIDAD: Record<Severidad, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Media",
  oportunidad: "Oportunidad",
};

const ORDEN: Record<Severidad, number> = {
  critica: 0,
  alta: 1,
  media: 2,
  oportunidad: 3,
};

/* ------------------------------------------------------------------ *
 * Las reglas
 * ------------------------------------------------------------------ */

export function analizar(
  combos: Combo[],
  ind: Indicadores,
  umbral: number,
  bitacora: Decision[] = []
): Hallazgo[] {
  const h: Hallazgo[] = [];
  const estados = porEstado(combos, umbral);
  const sucursales = porSucursal(combos, umbral);

  /* R1 · Estados saturados por encima del factor crítico */
  for (const e of estados.filter((x) => x.clase === "saturado").slice(0, 3)) {
    h.push({
      id: `sat-${e.estado.id}`,
      // La severidad la pone el dinero, no la etiqueta: un estado saturado con
      // doscientos mil pesos parados no compite con uno de siete millones.
      severidad: e.capital >= 2_000_000 ? "critica" : e.capital >= 500_000 ? "alta" : "media",
      titulo: `${e.estado.nombre} está saturado`,
      cuerpo: `${fmt(e.inv)} piezas en canal para un desplazamiento de ${fmt(e.so, 1)} por semana: ${fmt(e.cob, 1)} semanas de cobertura contra un umbral de ${umbral}. Son ${moneyCorto(e.capital)} de capital parado a costo.`,
      accion: `Suspender embarques a ${e.estado.nombre} hasta que la cobertura baje del umbral, y revisar con el comprador el plan de los próximos dos meses antes de comprometer más piezas.`,
      regla: `Cobertura del estado (${fmt(e.cob, 1)} sem) por encima de ${umbral} × 1.45 = ${fmt(umbral * 1.45, 1)} sem`,
      valor: e.capital,
      unidad: "liberable",
      area: "Inventario",
    });
  }

  /* R2 · Traslados: mover lo pagado antes de embarcar */
  const sobre = combos.filter((c) => c.clase === "alto" || c.clase === "saturado");
  const mover = traslados(sobre, combos, 12);
  if (mover.length) {
    const piezas = mover.reduce((a, t) => a + t.piezas, 0);
    const recupera = mover.reduce((a, t) => a + t.recupera, 0);
    const flete = mover.reduce((a, t) => a + t.costo, 0);
    h.push({
      id: "traslados",
      severidad: "alta",
      titulo: `${mover.length} traslados pagan su flete`,
      cuerpo: `Hay ${fmt(piezas)} piezas excedentes que resuelven un quiebre del mismo modelo en otra tienda de la misma cadena. El flete total es ${money(flete)} contra ${money(recupera)} de venta perdida semanal que deja de correr.`,
      accion: `Autorizar los traslados antes de liberar el siguiente embarque. El primero es ${mover[0].piezas} piezas de ${mover[0].origen.sucursal.plaza} a ${mover[0].destino.sucursal.plaza} del modelo ${mover[0].origen.modelo.sku}.`,
      regla: `Mismo SKU · excedente ≥ 3 pzas en origen · destino con cobertura < 2.5 sem · cubre ≥ 1.5 sem en destino · misma cadena`,
      valor: recupera * 4 - flete,
      unidad: "recuperable",
      area: "Logística",
    });
  }

  /* R3 · Quiebres concentrados en una referencia concreta */
  const porModelo = new Map<string, Combo[]>();
  for (const c of combos.filter((x) => x.clase === "quiebre")) {
    const k = c.modelo.sku;
    if (!porModelo.has(k)) porModelo.set(k, []);
    porModelo.get(k)!.push(c);
  }
  const modPeor = [...porModelo.entries()]
    .map(([k, v]) => ({ k, v, perdida: v.reduce((a, c) => a + c.perdida, 0) }))
    .sort((a, b) => b.perdida - a.perdida)[0];
  if (modPeor && modPeor.v.length >= 3) {
    const m = modPeor.v[0].modelo;
    const col = modPeor.v[0].coleccion.nombre;
    const ciudades = [...new Set(modPeor.v.map((c) => c.sucursal.ciudad))].slice(0, 4);
    h.push({
      id: `quiebre-${modPeor.k}`,
      severidad: "critica",
      titulo: `${m.sku} agotado en ${modPeor.v.length} tiendas`,
      cuerpo: `${m.nombre}, de la colección ${col}. Es la referencia con mayor venta perdida del corte: existencia en cero con desplazamiento probado en ${ciudades.join(", ")}${ciudades.length >= 4 ? " y otras ciudades" : ""}. Son ${money(modPeor.perdida)} por semana.`,
      accion: `Priorizar ${m.sku} en el siguiente embarque por encima de cualquier referencia saturada. No sustituirlo con otro modelo de ${col}: el consumidor que pidió este no se lleva otro.`,
      regla: `Existencia = 0 y desplazamiento > 0.15 pzas/sem en ≥ 3 sucursales del mismo SKU`,
      valor: modPeor.perdida * 52,
      unidad: "recuperable",
      area: "Comercial",
    });
  }

  /* R4 · Producto de alta gama en plazas que no lo sostienen */
  const malAsignado = combos.filter(
    (c) => c.coleccion.segmento === "Alta gama" && c.inv > 0 && c.so < 0.03
  );
  if (malAsignado.length >= 4) {
    const cap = malAsignado.reduce((a, c) => a + c.inv * c.costo, 0);
    const plazas = [...new Set(malAsignado.map((c) => c.sucursal.ciudad))];
    h.push({
      id: "mal-asignado",
      severidad: "alta",
      titulo: `Alta gama colocada donde no rota`,
      cuerpo: `${malAsignado.length} referencias de alta gama con inventario y sin una sola pieza desplazada en la ventana, en ${plazas.length} ciudades: ${plazas.slice(0, 3).join(", ")}. Entre ellas ${[...new Set(malAsignado.map((c) => c.modelo.sku))].slice(0, 3).join(", ")}. ${moneyCorto(cap)} a costo inmovilizados.`,
      accion: `No es un problema de inventario sino de asignación. Replegar estas piezas a las plazas de ticket alto o liquidarlas, y sacar la alta gama del surtido base de estas tiendas.`,
      regla: `Segmento alta gama · existencia > 0 · desplazamiento < 0.03 pzas/sem durante toda la ventana`,
      valor: cap,
      unidad: "liberable",
      area: "Comercial",
    });
  }

  /* R5 · Inventario envejecido */
  const viejo = combos.filter((c) => c.edad > 360 && c.inv > 0);
  if (viejo.length >= 3) {
    const cap = viejo.reduce((a, c) => a + c.inv * c.costo, 0);
    const col = [...new Set(viejo.map((c) => c.coleccion.nombre))];
    h.push({
      id: "envejecido",
      severidad: "media",
      titulo: `${fmt(viejo.reduce((a, c) => a + c.inv, 0))} piezas con más de un año en canal`,
      cuerpo: `Concentradas en ${col.slice(0, 2).join(" y ")}. Cada semana que pasa valen menos y ocupan un espacio de anaquel que el comprador puede reasignar a otra marca.`,
      accion: `Negociar una liquidación dirigida con descuento escalonado. El modelo de planeación tiene el supuesto de liquidación para medir el efecto antes de comprometerlo.`,
      regla: `Días en canal > 360 con existencia > 0`,
      valor: cap,
      unidad: "liberable",
      area: "Inventario",
    });
  }

  /* R6 · Sobre-embarque sistemático */
  if (ind.sellIn > 0 && ind.sellOut / ind.sellIn < 0.9) {
    const brecha = ind.sellIn - ind.sellOut;
    h.push({
      id: "sobre-embarque",
      severidad: "critica",
      titulo: `Se embarca ${fmt((1 - ind.sellOut / ind.sellIn) * 100, 0)}% más de lo que se desplaza`,
      cuerpo: `${fmt(brecha)} piezas de diferencia en doce semanas. El patrón se concentra en la última semana de cada mes, lo que apunta a cierre de cuota y no a demanda.`,
      accion: `Atar el embarque al desplazamiento de las ocho semanas previas por tienda y colección, en vez de a la cuota mensual. Es el cambio que corta la saturación en origen.`,
      regla: `Índice de desplazamiento (sell-out ÷ sell-in) por debajo de 90%`,
      valor: brecha * 2600,
      unidad: "en riesgo",
      area: "Planeación",
    });
  }

  /* R7 · Cobertura de reporte */
  if (ind.coberturaReporte < 97) {
    const sin = ind.sucursales - ind.reportan;
    h.push({
      id: "sin-reporte",
      severidad: "alta",
      titulo: `${sin} sucursales sin entregar sell-out`,
      cuerpo: `La cobertura de reporte es ${fmt(ind.coberturaReporte, 1)}%. En esas tiendas no se puede calcular cobertura ni detectar quiebres: cualquier decisión sobre ellas se toma a ciegas.`,
      accion: `Escalarlo con el contacto comercial de la cadena antes que cualquier otra cosa. Sin ese dato, el resto de las recomendaciones tiene un punto ciego.`,
      regla: `Cobertura de reporte por debajo del 97% acordado`,
      valor: 0,
      unidad: "en riesgo",
      area: "Datos",
    });
  }

  /* R8 · Plazas sanas: qué se está haciendo bien */
  const sanos = estados.filter((e) => e.clase === "sano");
  if (sanos.length >= 2) {
    h.push({
      id: "referencia",
      severidad: "oportunidad",
      titulo: `${sanos.length} estados operando dentro del umbral`,
      cuerpo: `${sanos.slice(0, 3).map((e) => e.estado.nombre).join(", ")} sostienen cobertura en rango sin quiebres relevantes. Su mezcla de surtido es la referencia replicable.`,
      accion: `Tomar el surtido de estas plazas como plantilla para reasignar las saturadas, en vez de diseñar un modelo nuevo.`,
      regla: `Cobertura ≤ umbral · menos del 30% de combinaciones sobre umbral · menos de 2 quiebres`,
      valor: 0,
      unidad: "recuperable",
      area: "Comercial",
    });
  }

  /* R9 · Tiendas nuevas sin historia suficiente */
  const nuevas = sucursales.filter((s) => s.sucursal.apertura > 0);
  if (nuevas.length) {
    h.push({
      id: "aperturas",
      severidad: "media",
      titulo: `${nuevas.length} sucursal reciente sin base comparable`,
      cuerpo: `${nuevas.map((s) => s.sucursal.nombre).join(", ")} no acumula las ocho semanas que pide el promedio. Sus cifras se muestran, pero no son comparables con el resto.`,
      accion: `Excluirla de los promedios de cadena y medirla contra su propia curva de arranque durante el primer trimestre.`,
      regla: `Semanas desde apertura < ventana del promedio (8)`,
      valor: 0,
      unidad: "en riesgo",
      area: "Datos",
    });
  }

  /* Aprendizaje: lo descartado antes baja de prioridad */
  const descartados = new Set(
    bitacora.filter((d) => d.accion === "descartada").map((d) => d.alertaId)
  );
  const resultado = h.filter((x) => !descartados.has(x.id));

  return resultado.sort(
    (a, b) => ORDEN[a.severidad] - ORDEN[b.severidad] || b.valor - a.valor
  );
}

/* ------------------------------------------------------------------ *
 * Contexto que se envía a n8n
 * ------------------------------------------------------------------ */

export type ContextoIA = {
  corte: string;
  umbral: number;
  indicadores: Record<string, number | string>;
  hallazgos: {
    id: string;
    severidad: string;
    titulo: string;
    cuerpo: string;
    regla: string;
    valor: number;
    area: string;
  }[];
  bitacora: { titulo: string; accion: string; motivo?: string }[];
  pregunta?: string;
};

export function construirContexto(
  hallazgos: Hallazgo[],
  ind: Indicadores,
  umbral: number,
  corte: string,
  bitacora: Decision[],
  pregunta?: string
): ContextoIA {
  return {
    corte,
    umbral,
    indicadores: {
      sellOut12Semanas: ind.sellOut,
      sellIn12Semanas: ind.sellIn,
      indiceDesplazamiento: ind.sellIn ? Number(((ind.sellOut / ind.sellIn) * 100).toFixed(1)) : 0,
      inventarioEnCanal: ind.inventario,
      coberturaPromedioSemanas: Number(ind.cobertura.toFixed(1)),
      combinacionesSobreUmbral: ind.saturadas,
      combinacionesEnQuiebre: ind.quiebres,
      ventaPerdidaSemanalMXN: Math.round(ind.perdida),
      capitalInmovilizadoMXN: Math.round(ind.capital),
      coberturaReportePct: Number(ind.coberturaReporte.toFixed(1)),
      moneda: "MXN",
    },
    hallazgos: hallazgos.map((x) => ({
      id: x.id,
      severidad: x.severidad,
      titulo: x.titulo,
      cuerpo: x.cuerpo,
      regla: x.regla,
      valor: Math.round(x.valor),
      area: x.area,
    })),
    bitacora: bitacora.slice(0, 12).map((d) => ({
      titulo: d.titulo,
      accion: d.accion,
      motivo: d.motivo,
    })),
    pregunta,
  };
}

/** Respuesta por defecto cuando no hay modelo disponible. */
export function resumenDeterminista(hallazgos: Hallazgo[], ind: Indicadores): string {
  const criticas = hallazgos.filter((h) => h.severidad === "critica");
  const recuperable = hallazgos
    .filter((h) => h.unidad === "recuperable")
    .reduce((a, h) => a + h.valor, 0);
  const liberable = hallazgos
    .filter((h) => h.unidad === "liberable")
    .reduce((a, h) => a + h.valor, 0);

  const partes: string[] = [];
  partes.push(
    `Del corte salen ${hallazgos.length} hallazgos, ${criticas.length} de ellos críticos.`
  );
  if (criticas.length) {
    // Sin toLowerCase: los títulos llevan nombres propios de colección y plaza.
    partes.push(`El más urgente es "${criticas[0].titulo}". ${criticas[0].accion}`);
  }
  partes.push(
    `En conjunto hay ${moneyCorto(liberable)} de capital liberable y ${moneyCorto(recuperable)} de venta recuperable en los próximos doce meses.`
  );
  if (ind.coberturaReporte < 97) {
    partes.push(
      `Antes de ejecutar nada, cerrar la brecha de información: solo ${fmt(ind.coberturaReporte, 1)}% de la red entrega sell-out.`
    );
  }
  return partes.join(" ");
}
