/**
 * Motor de datos y de cálculo.
 *
 * Genera 52 semanas de historia de forma determinista: la misma semilla produce
 * siempre las mismas cifras, de modo que nadie ve números distintos entre dos
 * aperturas de la demostración.
 *
 * Sobre la base estadística se inyectan situaciones concretas y narrables
 * (SITUACIONES, abajo). Esas son las que se cuentan en la junta.
 */

import {
  CADENAS,
  COLECCIONES,
  ESTADOS,
  SUCURSALES,
  type Cadena,
  type Coleccion,
  type Estado,
  type Modelo,
  type Sucursal,
  cadenaPorId,
  estadoPorId,
  modelosDe,
} from "./catalog";

/* ------------------------------------------------------------------ *
 * Aleatoriedad determinista
 * ------------------------------------------------------------------ */

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Semilla fija: la demostración es idéntica en cada apertura. */
const SEMILLA = 20261118;

/* ------------------------------------------------------------------ *
 * Parámetros de negocio
 * ------------------------------------------------------------------ */

export const PARAMS = {
  /** Semanas de cobertura por encima de las cuales se considera saturado. */
  umbral: 12,
  /** Múltiplo del umbral a partir del cual la saturación es crítica. */
  factorCritico: 1.45,
  /** Por debajo de esto hay riesgo de quiebre. */
  coberturaMinima: 2.5,
  /** Días de inventario objetivo para calcular resurtido. */
  diasObjetivo: 56,
  /** Semanas usadas para el promedio de desplazamiento. */
  ventana: 8,
  /** Semanas de historia que se conservan por combinación. */
  historia: 12,
  /** Costo financiero anual del inventario parado. */
  costoCapitalAnual: 0.18,
  /** Costo logístico de un traslado entre tiendas, por pieza. */
  costoTraslado: 38,
};

/** Semana de corte del reporte. */
export const CORTE = { anio: 2026, semana: 46, etiqueta: "2026-S46", fecha: "2026-11-15" };

/* ------------------------------------------------------------------ *
 * Situaciones inyectadas: lo que se narra en la junta
 * ------------------------------------------------------------------ */

export type Situacion = {
  id: string;
  titulo: string;
  resumen: string;
  /** Qué debería ver el director en pantalla. */
  evidencia: string;
};

export const SITUACIONES: Situacion[] = [
  {
    id: "saturacion-premium",
    titulo: "Alta gama estancada en el norte",
    resumen:
      "Series 8 y Attesa llevan meses acumulándose en Palacio de Hierro Valle Oriente y Monterrey Centro.",
    evidencia: "Nuevo León en rojo en el mapa, con más de 25 semanas de cobertura en alta gama.",
  },
  {
    id: "quiebre-turismo",
    titulo: "Tsuyosa agotada donde más se vende",
    resumen:
      "Las plazas turísticas venden Tsuyosa al doble del ritmo nacional y son las que se quedaron en cero.",
    evidencia: "Quintana Roo y Baja California Sur con quiebres y la mayor venta perdida semanal.",
  },
  {
    id: "mal-asignado",
    titulo: "Producto colocado en la plaza equivocada",
    resumen:
      "Hay piezas de alta gama en tiendas cuyo ticket promedio no las sostiene. No es un problema de inventario, es de asignación.",
    evidencia: "Oaxaca, Chiapas y Tabasco con inventario premium que no registra desplazamiento.",
  },
  {
    id: "traslado-jalisco",
    titulo: "Sobra en Jalisco, falta en Querétaro",
    resumen:
      "La misma colección, la misma cadena, 400 kilómetros de distancia y ningún mecanismo que lo detecte.",
    evidencia: "El panel de acción propone el traslado antes que un embarque nuevo.",
  },
  {
    id: "sin-reporte",
    titulo: "Cuatro tiendas que no entregan información",
    resumen:
      "Sanborns tiene cuatro sucursales sin reportar sell-out. Todo lo que se decida sobre ellas es a ciegas.",
    evidencia: "Salud del dato marca la cobertura de reporte por debajo del mínimo acordado.",
  },
  {
    id: "estacional",
    titulo: "El pico de diciembre llegó sin inventario",
    resumen:
      "Citizen L multiplica su desplazamiento en la última semana de noviembre y el embarque no lo anticipó.",
    evidencia: "La curva de sell-out se despega del sell-in justo antes del cierre del año.",
  },
  {
    id: "plaza-sana",
    titulo: "Querétaro y Aguascalientes operando en rango",
    resumen:
      "No todo está mal. Dos estados sostienen cobertura dentro del umbral y sirven de referencia.",
    evidencia: "Verde en el mapa, para que el semáforo signifique algo.",
  },
  {
    id: "envejecido",
    titulo: "Corso envejeciendo en el anaquel",
    resumen:
      "Más de un año en canal en varias tiendas Sears. Cada semana que pasa vale menos.",
    evidencia: "El tramo de más de 360 días concentra capital de una sola colección.",
  },
  {
    id: "apertura",
    titulo: "Los Cabos abrió hace catorce semanas",
    resumen:
      "Una tienda nueva no tiene historia suficiente para un promedio de ocho semanas. El sistema lo declara en vez de inventar una cifra.",
    evidencia: "Aparece marcada como tienda nueva y se excluye de los promedios comparables.",
  },
  {
    id: "empuje-cierre",
    titulo: "Embarque de cierre de mes",
    resumen:
      "El sell-in se dispara la última semana de cada mes, muy por encima de lo que el canal desplaza.",
    evidencia: "Los picos de la línea azul contra la línea naranja, cuatro veces en el periodo.",
  },
];

/* ------------------------------------------------------------------ *
 * Tipos del modelo
 * ------------------------------------------------------------------ */

export type ClaseEstado = "sano" | "quiebre" | "alto" | "saturado";

export type Combo = {
  id: string;
  sucursal: Sucursal;
  coleccion: Coleccion;
  /** La referencia concreta. Las alertas se calculan a este nivel. */
  modelo: Modelo;
  /** Precio de lista del modelo, no de la colección. */
  precio: number;
  /** Costo unitario del modelo. */
  costo: number;
  /** Existencia en la semana de corte. */
  inv: number;
  /** Unidades en tránsito. */
  tr: number;
  /** Desplazamiento promedio semanal de la ventana. */
  so: number;
  /** Sell-out semana a semana, el más reciente al final. */
  hist: number[];
  /** Días que el inventario lleva en el canal. */
  edad: number;
  /** Semanas de cobertura. 99 significa inventario sin desplazamiento. */
  cob: number;
  /** Stock objetivo en piezas. */
  objetivo: number;
  /** Resurtido sugerido: objetivo menos existencia menos tránsito. */
  sug: number;
  /** Piezas por encima del umbral. */
  exc: number;
  /** Capital inmovilizado a costo, en pesos. */
  capital: number;
  /** Venta perdida semanal estimada a precio de lista. */
  perdida: number;
  /** Clasificación del semáforo. */
  clase: ClaseEstado;
  /** Impacto en pesos: capital parado más venta perdida de cuatro semanas. */
  impacto: number;
};

export type SemanaSerie = {
  semana: number;
  etiqueta: string;
  sellIn: number;
  sellOut: number;
  inventario: number;
};

export type Dataset = {
  combos: Combo[];
  serie: SemanaSerie[];
  cadenas: Cadena[];
  colecciones: Coleccion[];
  estados: Estado[];
  sucursales: Sucursal[];
};

/* ------------------------------------------------------------------ *
 * Generación
 * ------------------------------------------------------------------ */

/** Multiplicador estacional por semana del año, centrado en el cierre de año. */
function estacional(semana: number, fuerza: number) {
  const base =
    1 +
    0.1 * Math.sin((semana / 52) * Math.PI * 2 - 1.2) +
    (semana >= 44 ? (semana - 43) * 0.085 : 0) +
    (semana >= 18 && semana <= 20 ? 0.22 : 0);
  return 1 + (base - 1) * fuerza;
}

/** Afinidad de una colección con un estado y una cadena. */
function afinidad(col: Coleccion, est: Estado, cad: Cadena) {
  let a = 1;
  if (col.segmento === "Alta gama") a *= Math.pow(est.poder, 2.4);
  else if (col.segmento === "Premium") a *= Math.pow(est.poder, 1.5);
  else if (col.segmento === "Medio") a *= Math.pow(est.poder, 0.6);
  else a *= Math.pow(est.poder, 0.2);

  if (col.segmento === "Alta gama" && cad.id === "SAN") a *= 0.18;
  if (col.segmento === "Alta gama" && cad.id === "PDH") a *= 1.75;
  if (col.segmento === "Acceso" && cad.id === "PDH") a *= 0.55;
  if (col.segmento === "Acceso" && cad.id === "SAN") a *= 1.3;
  if (col.id === "TSU") a *= 0.85 + est.turismo * 0.45;
  if (col.id === "CTL" && cad.id === "LIV") a *= 1.2;
  return a;
}

/**
 * Qué modelos tiene surtidos cada sucursal.
 *
 * Primero decide qué colecciones entran por formato y plaza, y después qué
 * referencias de cada colección. Una tienda chica no trae los cuatro modelos
 * de Tsuyosa: trae los que más rotan.
 */
function surtido(suc: Sucursal, rnd: () => number): { col: Coleccion; mod: Modelo }[] {
  const cad = cadenaPorId(suc.cadenaId);
  const est = estadoPorId(suc.estadoId);
  const cols = COLECCIONES.filter((col) => {
    if (col.id === "TCZ") return cad.id === "PDH" && est.poder > 1.15;
    if (col.id === "SAT") return cad.id === "PDH" || (cad.id === "LIV" && suc.fuerza > 1.2);
    if (col.segmento === "Alta gama" && cad.id === "SAN") return false;
    if (col.segmento === "Alta gama") return suc.fuerza > 0.75 || rnd() < 0.3;
    return rnd() > 0.06;
  });

  const salida: { col: Coleccion; mod: Modelo }[] = [];
  for (const col of cols) {
    const mods = modelosDe(col.id);
    const cuantos =
      col.segmento === "Alta gama"
        ? Math.max(1, Math.round(mods.length * Math.min(1, suc.fuerza * 0.62)))
        : Math.max(1, Math.round(mods.length * Math.min(1, 0.45 + suc.fuerza * 0.45)));
    for (const mod of mods.slice(0, cuantos)) salida.push({ col, mod });
  }
  return salida;
}

export function generar(): Dataset {
  const rnd = mulberry32(SEMILLA);
  const combos: Combo[] = [];

  for (const suc of SUCURSALES) {
    const cad = cadenaPorId(suc.cadenaId);
    const est = estadoPorId(suc.estadoId);
    const nueva = suc.apertura > 0;

    for (const { col, mod } of surtido(suc, rnd)) {
      const af = afinidad(col, est, cad);
      // El peso reparte la velocidad de la colección entre sus modelos. El
      // factor compensa que una tienda rara vez trae el surtido completo, sin
      // inflar el total nacional: la colección entera sigue valiendo lo mismo.
      const base =
        col.velocidad * mod.peso * 1.1 * suc.fuerza * af * (0.78 + rnd() * 0.44);
      const precio = Math.round(col.precio * mod.precioRel);
      const costo = Math.round(precio * (1 - col.margen));

      // Historia semanal
      const hist: number[] = [];
      for (let i = 0; i < PARAMS.historia; i++) {
        const semana = CORTE.semana - (PARAMS.historia - 1 - i);
        if (nueva && semana < suc.apertura) {
          hist.push(0);
          continue;
        }
        const e = estacional(semana, col.estacionalidad - 1);
        hist.push(Math.max(0, base * e * (0.72 + rnd() * 0.58)));
      }

      // Promedio de la ventana, sin contar semanas previas a la apertura
      const ventana = hist.slice(-PARAMS.ventana);
      const validas = nueva
        ? ventana.filter((_, i) => CORTE.semana - (PARAMS.ventana - 1 - i) >= suc.apertura)
        : ventana;
      const so = validas.length
        ? validas.reduce((a, b) => a + b, 0) / validas.length
        : 0;

      // Inventario: semanas de cobertura objetivo por cadena, con dispersión
      const objetivoSemanas = cad.umbralCadena * (0.6 + rnd() * 0.95);
      let inv = Math.round(so * objetivoSemanas);
      let edad = Math.round(20 + objetivoSemanas * 7 * (0.7 + rnd() * 0.7));
      let tr = rnd() < 0.22 ? Math.round(1 + rnd() * 6) : 0;

      combos.push({
        id: `${suc.clave}|${mod.sku}`,
        sucursal: suc,
        coleccion: col,
        modelo: mod,
        precio,
        costo,
        inv,
        tr,
        so,
        hist,
        edad,
        cob: 0,
        objetivo: 0,
        sug: 0,
        exc: 0,
        capital: 0,
        perdida: 0,
        clase: "sano",
        impacto: 0,
      });
    }
  }

  aplicarSituaciones(combos, mulberry32(SEMILLA + 7));
  for (const c of combos) derivar(c);

  return {
    combos,
    serie: construirSerie(combos),
    cadenas: CADENAS,
    colecciones: COLECCIONES,
    estados: ESTADOS,
    sucursales: SUCURSALES,
  };
}

/* ------------------------------------------------------------------ *
 * Inyección de las situaciones narrables
 * ------------------------------------------------------------------ */

function aplicarSituaciones(combos: Combo[], rnd: () => number) {
  const busca = (pred: (c: Combo) => boolean) => combos.filter(pred);

  // 1. Alta gama estancada en Nuevo León: toda la gama alta de la plaza
  for (const c of busca(
    (c) =>
      c.sucursal.estadoId === "NLE" &&
      (c.coleccion.segmento === "Alta gama" || c.coleccion.id === "PRO")
  )) {
    c.inv = Math.max(14, Math.round(c.so * (27 + rnd() * 11)));
    c.edad = Math.round(230 + rnd() * 140);
    c.tr = rnd() < 0.5 ? Math.round(2 + rnd() * 4) : 0;
  }
  // y el resto del surtido regiomontano, por encima del umbral sin llegar a crítico
  for (const c of busca(
    (c) => c.sucursal.estadoId === "NLE" && c.coleccion.segmento !== "Alta gama"
  )) {
    if (c.so > 0.05) c.inv = Math.round(c.so * (16 + rnd() * 6));
  }

  // 2. Tsuyosa agotada en plazas turísticas
  for (const c of busca(
    (c) =>
      c.coleccion.id === "TSU" &&
      ["ROO", "BCS", "SIN", "YUC"].includes(c.sucursal.estadoId)
  )) {
    c.so = c.so * 1.75;
    c.hist = c.hist.map((h, i) => h * (1.4 + i * 0.05));
    c.inv = 0;
    c.tr = rnd() < 0.4 ? Math.round(2 + rnd() * 5) : 0;
    c.edad = 0;
  }

  // 2b. Eco-Drive agotado en las tiendas de más tráfico: el volumen también quiebra
  for (const c of busca(
    (c) =>
      c.coleccion.id === "ECO" &&
      c.sucursal.fuerza > 1.05 &&
      ["CMX", "MEX", "JAL", "ROO", "BCN"].includes(c.sucursal.estadoId)
  )) {
    if (rnd() < 0.62) {
      c.inv = 0;
      c.tr = rnd() < 0.5 ? Math.round(3 + rnd() * 8) : 0;
      c.edad = 0;
      c.so = c.so * 1.2;
    }
  }

  // 3. Alta gama colocada donde no hay ticket
  for (const c of busca(
    (c) =>
      c.coleccion.segmento === "Alta gama" &&
      ["OAX", "CHP", "TAB", "MIC", "HID"].includes(c.sucursal.estadoId)
  )) {
    c.so = c.so * 0.04;
    c.hist = c.hist.map(() => 0);
    c.inv = Math.max(2, Math.round(2 + rnd() * 4));
    c.edad = Math.round(300 + rnd() * 180);
  }

  // 4. Sobra en Jalisco, falta en Querétaro — misma cadena, misma colección
  for (const c of busca(
    (c) =>
      c.sucursal.estadoId === "JAL" &&
      c.sucursal.cadenaId === "LIV" &&
      ["TSU", "ECO", "AXI"].includes(c.coleccion.id)
  )) {
    c.inv = Math.round(c.so * (24 + rnd() * 8));
    c.edad = Math.round(150 + rnd() * 70);
  }
  for (const c of busca(
    (c) =>
      c.sucursal.estadoId === "QUE" &&
      c.sucursal.cadenaId === "LIV" &&
      ["TSU", "ECO", "AXI"].includes(c.coleccion.id)
  )) {
    c.inv = 0;
    c.tr = 0;
    c.edad = 0;
    c.so = c.so * 1.25;
  }

  // 6. Pico de Citizen L en el cierre de año, sin inventario que lo acompañe
  for (const c of busca((c) => c.coleccion.id === "CTL")) {
    c.hist = c.hist.map((h, i) => h * (i >= PARAMS.historia - 3 ? 1.9 + i * 0.05 : 1));
    const ventana = c.hist.slice(-PARAMS.ventana);
    c.so = ventana.reduce((a, b) => a + b, 0) / ventana.length;
    c.inv = Math.round(c.inv * (rnd() < 0.45 ? 0.1 : 0.5));
  }

  // 7. Querétaro y Aguascalientes operando en rango
  for (const c of busca(
    (c) =>
      ["QUE", "AGU"].includes(c.sucursal.estadoId) &&
      !(c.sucursal.cadenaId === "LIV" && ["TSU", "ECO", "AXI"].includes(c.coleccion.id))
  )) {
    if (c.so > 0.05) {
      c.inv = Math.round(c.so * (6 + rnd() * 5));
      c.edad = Math.round(45 + rnd() * 60);
    }
  }

  // 8. Corso envejeciendo en Sears
  for (const c of busca(
    (c) => c.coleccion.id === "COR" && c.sucursal.cadenaId === "SEA"
  )) {
    c.edad = Math.round(380 + rnd() * 160);
    c.inv = Math.round(c.inv * 1.65);
    c.so = c.so * 0.55;
  }

  // 9. Tienda nueva: sin historia suficiente
  for (const c of busca((c) => c.sucursal.apertura > 0)) {
    c.edad = Math.min(c.edad, (CORTE.semana - c.sucursal.apertura) * 7);
  }

  // 5. Tiendas sin reporte: el inventario existe, el desplazamiento se desconoce
  for (const c of busca((c) => !c.sucursal.reporta)) {
    c.so = 0;
    c.hist = c.hist.map(() => 0);
  }
}

/* ------------------------------------------------------------------ *
 * Derivados
 * ------------------------------------------------------------------ */

export function derivar(c: Combo, umbral = PARAMS.umbral) {
  c.cob = c.so > 0.05 ? c.inv / c.so : c.inv > 0 ? 99 : 0;
  c.objetivo = Math.round((c.so * PARAMS.diasObjetivo) / 7);
  c.sug = Math.max(0, c.objetivo - c.inv - c.tr);

  // Una tienda que no entrega sell-out no tiene excedente calculable: sin
  // denominador no hay cobertura, y declarar un excedente sería inventarlo.
  if (!c.sucursal.reporta) {
    c.exc = 0;
    c.capital = 0;
    c.perdida = 0;
    c.sug = 0;
    c.clase = "sano";
    c.impacto = 0;
    return c;
  }

  c.exc = Math.max(0, Math.round(c.inv - c.so * umbral));
  c.capital = Math.round(c.exc * c.costo);
  c.perdida = c.inv === 0 && c.so > 0.15 ? c.so * c.precio : 0;
  c.clase = clasificar(c, umbral);
  c.impacto = Math.round(c.capital + c.perdida * 4);
  return c;
}

export function clasificar(c: Combo, umbral = PARAMS.umbral): ClaseEstado {
  if (!c.sucursal.reporta) return "sano";
  if (c.cob < PARAMS.coberturaMinima && c.so > 0.15) return "quiebre";
  if (c.cob <= umbral) return "sano";
  if (c.cob <= umbral * PARAMS.factorCritico) return "alto";
  return "saturado";
}

export const ETIQUETA_CLASE: Record<ClaseEstado, string> = {
  sano: "Sano",
  quiebre: "Quiebre",
  alto: "Cobertura alta",
  saturado: "Saturado",
};

/* ------------------------------------------------------------------ *
 * Serie nacional sell-in contra sell-out
 * ------------------------------------------------------------------ */

function construirSerie(combos: Combo[]): SemanaSerie[] {
  const rnd = mulberry32(SEMILLA + 31);
  const serie: SemanaSerie[] = [];
  const invTotal = combos.reduce((a, c) => a + c.inv, 0);

  for (let i = 0; i < PARAMS.historia; i++) {
    const semana = CORTE.semana - (PARAMS.historia - 1 - i);
    const sellOut = Math.round(
      combos.reduce((a, c) => a + (c.hist[i] ?? 0), 0)
    );
    // Embarque de cierre de mes: cada cuarta semana el sell-in se dispara
    const cierre = (semana + 1) % 4 === 0;
    const factor = cierre ? 2.55 + rnd() * 0.5 : 0.66 + rnd() * 0.22;
    serie.push({
      semana,
      etiqueta: `S${semana}`,
      sellIn: Math.round(sellOut * factor),
      sellOut,
      inventario: Math.round(invTotal * (0.86 + i * 0.013)),
    });
  }
  return serie;
}

/* ------------------------------------------------------------------ *
 * Agregaciones
 * ------------------------------------------------------------------ */

export type Filtro = {
  estado?: string;
  ciudad?: string;
  cadena?: string;
  coleccion?: string;
  /** SKU del modelo. */
  modelo?: string;
  umbral: number;
};

export function filtrar(combos: Combo[], f: Filtro): Combo[] {
  return combos.filter((c) => {
    if (f.estado && c.sucursal.estadoId !== f.estado) return false;
    if (f.ciudad && c.sucursal.ciudad !== f.ciudad) return false;
    if (f.cadena && c.sucursal.cadenaId !== f.cadena) return false;
    if (f.coleccion && c.coleccion.id !== f.coleccion) return false;
    if (f.modelo && c.modelo.sku !== f.modelo) return false;
    return true;
  });
}

/** Cuántos filtros hay puestos, sin contar el umbral. */
export const filtrosActivos = (f: Filtro) =>
  [f.estado, f.ciudad, f.cadena, f.coleccion, f.modelo].filter(Boolean).length;

export type ResumenEstado = {
  estado: Estado;
  combos: number;
  sucursales: number;
  inv: number;
  so: number;
  cob: number;
  exc: number;
  capital: number;
  quiebres: number;
  perdida: number;
  clase: ClaseEstado;
  sinReporte: number;
  /** Combinaciones por encima del umbral, de cualquier intensidad. */
  sobreUmbral: number;
  /** Impacto total en pesos: capital parado más cuatro semanas de venta perdida. */
  impacto: number;
};

export function porEstado(combos: Combo[], umbral: number): ResumenEstado[] {
  const mapa = new Map<string, ResumenEstado>();
  const sucs = new Map<string, Set<string>>();

  for (const c of combos) {
    const id = c.sucursal.estadoId;
    if (!mapa.has(id)) {
      mapa.set(id, {
        estado: estadoPorId(id),
        combos: 0,
        sucursales: 0,
        inv: 0,
        so: 0,
        cob: 0,
        exc: 0,
        capital: 0,
        quiebres: 0,
        perdida: 0,
        clase: "sano",
        sinReporte: 0,
        sobreUmbral: 0,
        impacto: 0,
      });
      sucs.set(id, new Set());
    }
    const r = mapa.get(id)!;
    sucs.get(id)!.add(c.sucursal.clave);
    r.combos++;
    r.inv += c.inv;
    r.so += c.so;
    r.exc += c.exc;
    r.capital += c.capital;
    if (c.clase === "alto" || c.clase === "saturado") r.sobreUmbral++;
    if (c.clase === "quiebre") {
      r.quiebres++;
      r.perdida += c.perdida;
    }
    if (!c.sucursal.reporta) r.sinReporte++;
  }

  const salida: ResumenEstado[] = [];
  for (const [id, r] of mapa) {
    r.sucursales = sucs.get(id)!.size;
    r.cob = r.so > 0.05 ? r.inv / r.so : r.inv > 0 ? 99 : 0;
    r.impacto = Math.round(r.capital + r.perdida * 4);
    r.clase = claseEstado(r, umbral);
    salida.push(r);
  }
  return salida.sort((a, b) => b.impacto - a.impacto);
}

/**
 * La cobertura promedio de un estado esconde su problema: una plaza con la
 * mitad del surtido saturado y la otra mitad en quiebre promedia "sana".
 * Por eso el estado se clasifica por dónde está su dinero, no por su promedio.
 */
function claseEstado(r: ResumenEstado, umbral: number): ClaseEstado {
  const base = Math.max(1, r.combos);
  const parteSaturada = r.sobreUmbral / base;
  const parteQuiebre = r.quiebres / base;
  const dineroQuiebre = r.perdida * 4;
  const quiebreMarcado = r.quiebres >= 2 && parteQuiebre >= 0.05;

  if (quiebreMarcado && dineroQuiebre > r.capital) return "quiebre";
  if (r.cob > umbral * PARAMS.factorCritico || parteSaturada > 0.5) return "saturado";
  if (r.cob > umbral || parteSaturada > 0.3) return "alto";
  if (quiebreMarcado) return "quiebre";
  return "sano";
}

export type ResumenSucursal = {
  sucursal: Sucursal;
  combos: number;
  inv: number;
  so: number;
  cob: number;
  exc: number;
  capital: number;
  quiebres: number;
  perdida: number;
  clase: ClaseEstado;
};

export function porSucursal(combos: Combo[], umbral: number): ResumenSucursal[] {
  const mapa = new Map<string, ResumenSucursal>();
  for (const c of combos) {
    const k = c.sucursal.clave;
    if (!mapa.has(k)) {
      mapa.set(k, {
        sucursal: c.sucursal,
        combos: 0,
        inv: 0,
        so: 0,
        cob: 0,
        exc: 0,
        capital: 0,
        quiebres: 0,
        perdida: 0,
        clase: "sano",
      });
    }
    const r = mapa.get(k)!;
    r.combos++;
    r.inv += c.inv;
    r.so += c.so;
    r.exc += c.exc;
    r.capital += c.capital;
    if (c.clase === "quiebre") {
      r.quiebres++;
      r.perdida += c.perdida;
    }
  }
  const salida: ResumenSucursal[] = [];
  for (const r of mapa.values()) {
    r.cob = r.so > 0.05 ? r.inv / r.so : r.inv > 0 ? 99 : 0;
    if (!r.sucursal.reporta) r.clase = "sano";
    else if (r.cob > umbral * PARAMS.factorCritico) r.clase = "saturado";
    else if (r.cob > umbral) r.clase = "alto";
    else if (r.quiebres >= Math.max(1, Math.round(r.combos * 0.12))) r.clase = "quiebre";
    else r.clase = "sano";
    salida.push(r);
  }
  return salida;
}

export type Indicadores = {
  sellOut: number;
  sellIn: number;
  desplazamiento: number;
  inventario: number;
  cobertura: number;
  saturadas: number;
  quiebres: number;
  perdida: number;
  capital: number;
  excedente: number;
  coberturaReporte: number;
  sucursales: number;
  reportan: number;
  ingreso: number;
  margen: number;
};

export function indicadores(
  combos: Combo[],
  serie: SemanaSerie[],
  todos: Combo[]
): Indicadores {
  const proporcion = todos.length ? combos.length / todos.length : 1;
  const sellOut = serie.reduce((a, s) => a + s.sellOut, 0) * proporcion;
  const sellIn = serie.reduce((a, s) => a + s.sellIn, 0) * proporcion;
  const inv = combos.reduce((a, c) => a + c.inv, 0);
  const so = combos.reduce((a, c) => a + c.so, 0);
  const sucs = new Set(combos.map((c) => c.sucursal.clave));
  const reportan = new Set(
    combos.filter((c) => c.sucursal.reporta).map((c) => c.sucursal.clave)
  );
  const quiebres = combos.filter((c) => c.clase === "quiebre");
  const ingreso = combos.reduce((a, c) => a + c.so * 52 * c.precio, 0);
  const margen = combos.reduce((a, c) => a + c.so * 52 * (c.precio - c.costo), 0);

  return {
    sellOut: Math.round(sellOut),
    sellIn: Math.round(sellIn),
    desplazamiento: so,
    inventario: inv,
    cobertura: so > 0.05 ? inv / so : 0,
    saturadas: combos.filter((c) => c.clase === "alto" || c.clase === "saturado").length,
    quiebres: quiebres.length,
    perdida: quiebres.reduce((a, c) => a + c.perdida, 0),
    capital: combos.reduce((a, c) => a + c.capital, 0),
    excedente: combos.reduce((a, c) => a + c.exc, 0),
    coberturaReporte: sucs.size ? (reportan.size / sucs.size) * 100 : 0,
    sucursales: sucs.size,
    reportan: reportan.size,
    ingreso,
    margen,
  };
}

/* ------------------------------------------------------------------ *
 * Traslados: mover lo que ya está pagado antes de embarcar
 * ------------------------------------------------------------------ */

export type Traslado = {
  origen: Combo;
  destino: Combo;
  piezas: number;
  /** Semanas de desplazamiento que el traslado cubre en destino. */
  semanas: number;
  /** Venta perdida semanal que deja de correr. */
  recupera: number;
  /** Costo logístico estimado. */
  costo: number;
  /** 0 = misma plaza, 1 = entre estados de la misma cadena. */
  salto: number;
};

export function traslados(
  candidatos: Combo[],
  universo: Combo[],
  limite = 8
): Traslado[] {
  // Se agrupa por MODELO, no por colección: un quiebre de CTZ-TS1525 no se
  // cubre con un CTZ-TS1402. Es la misma colección pero no la misma pieza.
  const porModelo = new Map<string, Combo[]>();
  for (const c of universo) {
    const k = c.modelo.sku;
    if (!porModelo.has(k)) porModelo.set(k, []);
    porModelo.get(k)!.push(c);
  }

  const usados = new Set<string>();
  const salida: Traslado[] = [];

  for (const o of [...candidatos].sort((a, b) => b.exc - a.exc)) {
    if (o.exc < 3 || !o.sucursal.reporta) continue;
    // Mismo estado primero; el traslado entre plazas lejanas rara vez paga el flete.
    const cerca = (d: Combo) => (d.sucursal.estadoId === o.sucursal.estadoId ? 0 : 1);

    const destinos = (porModelo.get(o.modelo.sku) ?? [])
      .filter(
        (d) =>
          // Una pieza ya embarcada pertenece a la cadena que la compró: el
          // traslado solo existe dentro de la misma cadena. Entre cadenas
          // distintas no hay traslado, hay renegociación de embarque.
          d.sucursal.cadenaId === o.sucursal.cadenaId &&
          d.sucursal.clave !== o.sucursal.clave &&
          d.so > 0.2 &&
          d.clase === "quiebre" &&
          !usados.has(d.id)
      )
      .sort((a, b) => cerca(a) - cerca(b) || b.perdida - a.perdida);

    const d = destinos[0];
    if (!d) continue;

    const falta = Math.max(1, d.objetivo - d.inv - d.tr);
    const piezas = Math.min(o.exc, falta);
    if (piezas < 3) continue;
    const semanas = d.so > 0.05 ? piezas / d.so : 0;
    if (semanas < 1.5) continue;

    usados.add(d.id);
    salida.push({
      origen: o,
      destino: d,
      piezas,
      semanas,
      recupera: d.perdida,
      costo: Math.round(piezas * PARAMS.costoTraslado),
      salto: cerca(d),
    });
  }

  return salida
    .sort((a, b) => a.salto - b.salto || b.recupera - a.recupera)
    .slice(0, limite);
}

/* ------------------------------------------------------------------ *
 * Utilidades de formato
 * ------------------------------------------------------------------ */

/**
 * Formato de número propio, no `toLocaleString`.
 *
 * Node y el navegador no siempre traen los mismos datos de localización: el
 * separador de millares puede salir distinto en el servidor y en el cliente, y
 * eso rompe la hidratación de React. Formateando a mano, el servidor y el
 * navegador producen exactamente el mismo texto.
 */
export const fmt = (n: number, d = 0) => {
  const v = isFinite(n) ? n : 0;
  const neg = v < 0;
  const abs = Math.abs(v);
  const fijo = abs.toFixed(d);
  const [ent, dec] = fijo.split(".");
  const conMiles = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "-" : "") + conMiles + (dec ? "." + dec : "");
};

/** El signo va antes del símbolo de moneda: −$333 M, no $−333 M. */
const conSigno = (n: number, cuerpo: string) => (n < 0 ? "−$" : "$") + cuerpo;

export const money = (n: number) => {
  const v = Math.round(isFinite(n) ? n : 0);
  return conSigno(v, fmt(Math.abs(v)));
};

export const moneyCorto = (n: number) => {
  const v = isFinite(n) ? n : 0;
  const a = Math.abs(v);
  if (a >= 1e9) return conSigno(v, fmt(a / 1e9, 1) + " MMM");
  if (a >= 1e6) return conSigno(v, fmt(a / 1e6, 1) + " M");
  if (a >= 1e3) return conSigno(v, fmt(a / 1e3, 0) + " mil");
  return conSigno(v, fmt(a));
};

export const pct = (n: number, d = 1) => fmt(n, d) + "%";
