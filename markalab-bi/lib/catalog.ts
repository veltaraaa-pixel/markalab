/**
 * Catálogo maestro de la demostración.
 *
 * Cadenas, colecciones, estados y sucursales. Todo lo que aquí se declara
 * es la base sobre la que el generador construye 52 semanas de historia.
 *
 * Los colores de cadena son diseño propio de MarkaLab: evocan la casa de cada
 * socio comercial sin reproducir su identidad gráfica.
 */

export type Cadena = {
  id: string;
  nombre: string;
  monograma: string;
  color: string;
  colorOscuro: string;
  formato: string;
  /** Semanas de cobertura que esta cadena tolera antes de considerarse saturada. */
  umbralCadena: number;
};

export const CADENAS: Cadena[] = [
  {
    id: "LIV",
    nombre: "Liverpool",
    monograma: "LIV",
    color: "#c2185b",
    colorOscuro: "#f06292",
    formato: "Departamental",
    umbralCadena: 12,
  },
  {
    id: "PDH",
    nombre: "El Palacio de Hierro",
    monograma: "PDH",
    color: "#a07400",
    colorOscuro: "#e0b43c",
    formato: "Departamental premium",
    umbralCadena: 14,
  },
  {
    id: "SEA",
    nombre: "Sears",
    monograma: "SEA",
    color: "#1565c0",
    colorOscuro: "#64b5f6",
    formato: "Departamental",
    umbralCadena: 10,
  },
  {
    id: "SAN",
    nombre: "Sanborns",
    monograma: "SAN",
    color: "#00796b",
    colorOscuro: "#4db6ac",
    formato: "Especializado",
    umbralCadena: 8,
  },
];

export type Coleccion = {
  id: string;
  nombre: string;
  segmento: "Acceso" | "Medio" | "Premium" | "Alta gama";
  linea: "Caballero" | "Dama" | "Unisex";
  /** Precio de lista promedio en pesos. */
  precio: number;
  /** Margen bruto objetivo de la colección. */
  margen: number;
  /** Velocidad base: piezas por tienda por semana en una plaza promedio. */
  velocidad: number;
  /** Qué tan sensible es a diciembre y a las temporadas de regalo. */
  estacionalidad: number;
  nota: string;
};

export const COLECCIONES: Coleccion[] = [
  {
    id: "TSU",
    nombre: "Tsuyosa",
    segmento: "Medio",
    linea: "Unisex",
    precio: 7490,
    margen: 0.52,
    velocidad: 3.4,
    estacionalidad: 1.35,
    nota: "La colección viral. Brazalete integrado, alta demanda en redes y rotación muy por encima del resto.",
  },
  {
    id: "ECO",
    nombre: "Eco-Drive",
    segmento: "Acceso",
    linea: "Unisex",
    precio: 5290,
    margen: 0.48,
    velocidad: 2.9,
    estacionalidad: 1.25,
    nota: "El caballo de batalla. Volumen alto, presente en las cuatro cadenas y en todos los estados.",
  },
  {
    id: "PRO",
    nombre: "Promaster",
    segmento: "Premium",
    linea: "Caballero",
    precio: 14900,
    margen: 0.55,
    velocidad: 1.1,
    estacionalidad: 1.15,
    nota: "Deportivo técnico. Buceo y aviación. Ticket alto y comprador informado.",
  },
  {
    id: "S8",
    nombre: "Series 8",
    segmento: "Alta gama",
    linea: "Caballero",
    precio: 27500,
    margen: 0.58,
    velocidad: 0.42,
    estacionalidad: 1.1,
    nota: "Mecánico de manufactura japonesa. Rotación lenta por diseño, margen alto.",
  },
  {
    id: "ATT",
    nombre: "Attesa",
    segmento: "Alta gama",
    linea: "Caballero",
    precio: 32400,
    margen: 0.57,
    velocidad: 0.34,
    estacionalidad: 1.08,
    nota: "Titanio y radiocontrol. Solo tiene sentido en plazas de ticket alto.",
  },
  {
    id: "CTL",
    nombre: "Citizen L",
    segmento: "Premium",
    linea: "Dama",
    precio: 11800,
    margen: 0.54,
    velocidad: 1.6,
    estacionalidad: 1.45,
    nota: "Línea femenina de diseño. El pico de mayo y diciembre es el más marcado del portafolio.",
  },
  {
    id: "COR",
    nombre: "Corso",
    segmento: "Medio",
    linea: "Caballero",
    precio: 8900,
    margen: 0.5,
    velocidad: 1.4,
    estacionalidad: 1.2,
    nota: "Vestir clásico. Comprador mayor, rotación estable, riesgo de envejecer en anaquel.",
  },
  {
    id: "AXI",
    nombre: "Axiom",
    segmento: "Medio",
    linea: "Unisex",
    precio: 6900,
    margen: 0.49,
    velocidad: 1.25,
    estacionalidad: 1.18,
    nota: "Perfil ultradelgado. Compite de frente con moda y se mueve mejor en plazas urbanas.",
  },
  {
    id: "SAT",
    nombre: "Satellite Wave",
    segmento: "Alta gama",
    linea: "Caballero",
    precio: 41900,
    margen: 0.56,
    velocidad: 0.16,
    estacionalidad: 1.05,
    nota: "Sincronía satelital. Pieza de escaparate: vende poco y sostiene la percepción de marca.",
  },
  {
    id: "TCZ",
    nombre: "The Citizen",
    segmento: "Alta gama",
    linea: "Caballero",
    precio: 68000,
    margen: 0.6,
    velocidad: 0.07,
    estacionalidad: 1.02,
    nota: "Tope de gama. Una pieza por tienda en pocas plazas. Su métrica no es rotación, es prestigio.",
  },
];

/**
 * Modelo: la referencia concreta que se vende.
 *
 * Una colección agrupa varios modelos. Tsuyosa es la colección; CTZ-TS1525 es
 * el modelo. La jerarquía completa del producto es:
 *
 *   Segmento  ->  Colección  ->  Modelo (SKU)
 *
 * Los indicadores se pueden leer en cualquiera de los tres niveles, y las
 * alertas se calculan siempre al más fino: tienda x modelo.
 */
export type Modelo = {
  sku: string;
  nombre: string;
  coleccionId: string;
  /** Multiplicador de precio sobre el precio base de su colección. */
  precioRel: number;
  /** Peso dentro de la colección: cuánto del volumen se lleva este modelo. */
  peso: number;
};

/** [coleccionId, sufijo, nombre, precioRel, peso] */
const MODELOS_SEMILLA: [string, string, string, number, number][] = [
  ["TSU", "1525", "Tsuyosa Acero Azul 40mm", 1.0, 0.34],
  ["TSU", "1402", "Tsuyosa Acero Verde 40mm", 1.0, 0.27],
  ["TSU", "1760", "Tsuyosa Bicolor Champaña 40mm", 1.18, 0.22],
  ["TSU", "1883", "Tsuyosa Acero Negro 37mm", 0.96, 0.17],

  ["ECO", "1312", "Eco-Drive Piel Negra 42mm", 0.94, 0.3],
  ["ECO", "1248", "Eco-Drive Acero 41mm", 1.0, 0.28],
  ["ECO", "1868", "Eco-Drive Acero Dorado 40mm", 1.12, 0.23],
  ["ECO", "1091", "Eco-Drive Piel Café 44mm", 0.9, 0.19],

  ["PRO", "1476", "Promaster Diver 200m", 1.0, 0.38],
  ["PRO", "1200", "Promaster Sky Titanio", 1.24, 0.33],
  ["PRO", "1560", "Promaster Land Piel 44mm", 0.88, 0.29],

  ["S8", "1731", "Series 8 Mecánico 831", 1.0, 0.41],
  ["S8", "1944", "Series 8 Acero Azul 870", 1.12, 0.33],
  ["S8", "1605", "Series 8 Titanio 880", 1.3, 0.26],

  ["ATT", "1328", "Attesa Titanio Radiocontrol", 1.0, 0.44],
  ["ATT", "1917", "Attesa Cronógrafo Negro", 1.09, 0.31],
  ["ATT", "1452", "Attesa Acttline Bicolor", 1.21, 0.25],

  ["CTL", "1183", "Citizen L Ambiluna Nácar", 1.0, 0.36],
  ["CTL", "1620", "Citizen L Eco Dorado 29mm", 1.14, 0.28],
  ["CTL", "1055", "Citizen L Sunrise Acero", 0.92, 0.21],
  ["CTL", "1799", "Citizen L Diamond 30mm", 1.42, 0.15],

  ["COR", "1518", "Corso Acero 41mm", 1.0, 0.39],
  ["COR", "1341", "Corso Piel Negra 40mm", 0.93, 0.34],
  ["COR", "1207", "Corso Bicolor 42mm", 1.15, 0.27],

  ["AXI", "1581", "Axiom Acero Ultradelgado", 1.0, 0.4],
  ["AXI", "1928", "Axiom Piel Negra 40mm", 0.95, 0.33],
  ["AXI", "1274", "Axiom Bicolor 38mm", 1.11, 0.27],

  ["SAT", "1130", "Satellite Wave GPS F990", 1.0, 0.55],
  ["SAT", "1467", "Satellite Wave Titanio F950", 0.89, 0.45],

  ["TCZ", "1001", "The Citizen Caliber 0100", 1.0, 0.58],
  ["TCZ", "1288", "The Citizen Urushi Dial", 0.84, 0.42],
];

export const MODELOS: Modelo[] = MODELOS_SEMILLA.map(
  ([coleccionId, sufijo, nombre, precioRel, peso]) => ({
    sku: `CTZ-${coleccionId.slice(0, 2)}${sufijo}`,
    nombre,
    coleccionId,
    precioRel,
    peso,
  })
);

export const modelosDe = (coleccionId: string) =>
  MODELOS.filter((m) => m.coleccionId === coleccionId);

export const modeloPorSku = (sku: string) => MODELOS.find((m) => m.sku === sku);

export type Estado = {
  id: string;
  nombre: string;
  corto: string;
  /** Índice de poder adquisitivo relativo, 1.0 = promedio nacional. */
  poder: number;
  /** Peso turístico: eleva la demanda de ticket alto y la estacionalidad. */
  turismo: number;
};

export const ESTADOS: Estado[] = [
  { id: "CMX", nombre: "Ciudad de México", corto: "CDMX", poder: 1.38, turismo: 1.15 },
  { id: "MEX", nombre: "Estado de México", corto: "Edomex", poder: 0.94, turismo: 0.9 },
  { id: "NLE", nombre: "Nuevo León", corto: "N. León", poder: 1.34, turismo: 1.0 },
  { id: "JAL", nombre: "Jalisco", corto: "Jalisco", poder: 1.12, turismo: 1.1 },
  { id: "QUE", nombre: "Querétaro", corto: "Querétaro", poder: 1.18, turismo: 1.05 },
  { id: "PUE", nombre: "Puebla", corto: "Puebla", poder: 0.92, turismo: 1.0 },
  { id: "ROO", nombre: "Quintana Roo", corto: "Q. Roo", poder: 1.08, turismo: 1.85 },
  { id: "YUC", nombre: "Yucatán", corto: "Yucatán", poder: 1.02, turismo: 1.3 },
  { id: "GUA", nombre: "Guanajuato", corto: "Guanajuato", poder: 1.05, turismo: 1.08 },
  { id: "BCN", nombre: "Baja California", corto: "B. California", poder: 1.16, turismo: 1.2 },
  { id: "BCS", nombre: "Baja California Sur", corto: "B.C. Sur", poder: 1.14, turismo: 1.75 },
  { id: "CHH", nombre: "Chihuahua", corto: "Chihuahua", poder: 1.04, turismo: 0.9 },
  { id: "COA", nombre: "Coahuila", corto: "Coahuila", poder: 1.07, turismo: 0.88 },
  { id: "SIN", nombre: "Sinaloa", corto: "Sinaloa", poder: 0.98, turismo: 1.25 },
  { id: "SON", nombre: "Sonora", corto: "Sonora", poder: 1.03, turismo: 0.95 },
  { id: "VER", nombre: "Veracruz", corto: "Veracruz", poder: 0.86, turismo: 1.05 },
  { id: "TAM", nombre: "Tamaulipas", corto: "Tamaulipas", poder: 0.95, turismo: 0.85 },
  { id: "AGU", nombre: "Aguascalientes", corto: "Aguascalientes", poder: 1.06, turismo: 0.92 },
  { id: "SLP", nombre: "San Luis Potosí", corto: "S.L.P.", poder: 0.97, turismo: 0.95 },
  { id: "MIC", nombre: "Michoacán", corto: "Michoacán", poder: 0.83, turismo: 1.0 },
  { id: "TAB", nombre: "Tabasco", corto: "Tabasco", poder: 0.88, turismo: 0.9 },
  { id: "CHP", nombre: "Chiapas", corto: "Chiapas", poder: 0.74, turismo: 1.15 },
  { id: "OAX", nombre: "Oaxaca", corto: "Oaxaca", poder: 0.78, turismo: 1.2 },
  { id: "MOR", nombre: "Morelos", corto: "Morelos", poder: 0.96, turismo: 1.1 },
  { id: "HID", nombre: "Hidalgo", corto: "Hidalgo", poder: 0.85, turismo: 0.9 },
  { id: "DUR", nombre: "Durango", corto: "Durango", poder: 0.9, turismo: 0.85 },
];

export type Sucursal = {
  clave: string;
  nombre: string;
  /** Centro comercial o zona donde está la tienda: Perisur, Valle Oriente. */
  plaza: string;
  /** Municipio o ciudad. Es el nivel entre el estado y la sucursal. */
  ciudad: string;
  cadenaId: string;
  estadoId: string;
  /** Fuerza comercial de la tienda: 1.0 = tienda promedio de su cadena. */
  fuerza: number;
  /** Semana de apertura. 0 = abierta desde antes del periodo cargado. */
  apertura: number;
  /** Si la sucursal entrega información de sell-out. */
  reporta: boolean;
};

type Semilla = [string, string, string, string, number, number?, boolean?];

/** [cadena, plaza, ciudad, estado, fuerza, aperturaSemana?, reporta?] */
const SEMILLAS: Semilla[] = [
  // Liverpool — la red más amplia
  ["LIV", "Polanco", "Ciudad de México", "CMX", 1.62],
  ["LIV", "Perisur", "Ciudad de México", "CMX", 1.44],
  ["LIV", "Santa Fe", "Ciudad de México", "CMX", 1.38],
  ["LIV", "Insurgentes", "Ciudad de México", "CMX", 1.12],
  ["LIV", "Coapa", "Ciudad de México", "CMX", 0.96],
  ["LIV", "Satélite", "Naucalpan", "MEX", 1.24],
  ["LIV", "Interlomas", "Huixquilucan", "MEX", 1.3],
  ["LIV", "Las Américas", "Ecatepec", "MEX", 0.92],
  ["LIV", "Toluca", "Toluca", "MEX", 0.84],
  ["LIV", "Valle Oriente", "San Pedro Garza García", "NLE", 1.46],
  ["LIV", "Monterrey Centro", "Monterrey", "NLE", 1.02],
  ["LIV", "Andares", "Zapopan", "JAL", 1.41],
  ["LIV", "Galerías Guadalajara", "Guadalajara", "JAL", 1.08],
  ["LIV", "Antea Querétaro", "Querétaro", "QUE", 1.22],
  ["LIV", "Angelópolis", "Puebla", "PUE", 1.06],
  ["LIV", "La Isla Cancún", "Cancún", "ROO", 1.34],
  ["LIV", "Altabrisa Mérida", "Mérida", "YUC", 0.98],
  ["LIV", "León Centro Max", "León", "GUA", 1.04],
  ["LIV", "Tijuana Río", "Tijuana", "BCN", 1.09],
  ["LIV", "Chihuahua Fashion Mall", "Chihuahua", "CHH", 0.88],
  ["LIV", "Saltillo", "Saltillo", "COA", 0.82],
  ["LIV", "Culiacán", "Culiacán", "SIN", 0.86],
  ["LIV", "Hermosillo", "Hermosillo", "SON", 0.9],
  ["LIV", "Veracruz Andamar", "Veracruz", "VER", 0.79],
  ["LIV", "Aguascalientes Altaria", "Aguascalientes", "AGU", 0.94],
  ["LIV", "San Luis Potosí", "San Luis Potosí", "SLP", 0.87],
  ["LIV", "Morelia", "Morelia", "MIC", 0.76],
  ["LIV", "Villahermosa", "Villahermosa", "TAB", 0.74],
  ["LIV", "Cuernavaca", "Cuernavaca", "MOR", 0.89],
  ["LIV", "Los Cabos", "San José del Cabo", "BCS", 1.18, 14],
  // El Palacio de Hierro — pocas plazas, ticket alto
  ["PDH", "Polanco", "Ciudad de México", "CMX", 1.95],
  ["PDH", "Perisur", "Ciudad de México", "CMX", 1.52],
  ["PDH", "Santa Fe", "Ciudad de México", "CMX", 1.48],
  ["PDH", "Durango", "Ciudad de México", "CMX", 1.16],
  ["PDH", "Interlomas", "Huixquilucan", "MEX", 1.38],
  ["PDH", "Satélite", "Naucalpan", "MEX", 1.12],
  ["PDH", "Valle Oriente", "San Pedro Garza García", "NLE", 1.56],
  ["PDH", "Guadalajara", "Guadalajara", "JAL", 1.34],
  ["PDH", "Querétaro", "Querétaro", "QUE", 1.19],
  ["PDH", "Puebla", "Puebla", "PUE", 1.02],
  ["PDH", "Cancún", "Cancún", "ROO", 1.28],
  ["PDH", "Mérida", "Mérida", "YUC", 0.95],
  ["PDH", "Veracruz", "Veracruz", "VER", 0.81],
  ["PDH", "Monterrey Centro", "Monterrey", "NLE", 1.11],
  // Sears — red amplia, ticket medio
  ["SEA", "Insurgentes", "Ciudad de México", "CMX", 1.06],
  ["SEA", "Universidad", "Ciudad de México", "CMX", 0.94],
  ["SEA", "Lindavista", "Ciudad de México", "CMX", 0.88],
  ["SEA", "Satélite", "Naucalpan", "MEX", 0.96],
  ["SEA", "Ecatepec", "Ecatepec", "MEX", 0.72],
  ["SEA", "Toluca", "Toluca", "MEX", 0.78],
  ["SEA", "Cumbres", "Monterrey", "NLE", 0.98],
  ["SEA", "Guadalajara Centro", "Guadalajara", "JAL", 0.92],
  ["SEA", "Zapopan", "Zapopan", "JAL", 0.86],
  ["SEA", "Querétaro", "Querétaro", "QUE", 0.91],
  ["SEA", "Puebla Explanada", "Puebla", "PUE", 0.84],
  ["SEA", "Cancún", "Cancún", "ROO", 0.97],
  ["SEA", "Mérida", "Mérida", "YUC", 0.83],
  ["SEA", "Irapuato", "Irapuato", "GUA", 0.76],
  ["SEA", "Mexicali", "Mexicali", "BCN", 0.81],
  ["SEA", "Ciudad Juárez", "Ciudad Juárez", "CHH", 0.79],
  ["SEA", "Torreón", "Torreón", "COA", 0.82],
  ["SEA", "Mazatlán", "Mazatlán", "SIN", 0.85],
  ["SEA", "Obregón", "Ciudad Obregón", "SON", 0.73],
  ["SEA", "Xalapa", "Xalapa", "VER", 0.71],
  ["SEA", "Tampico", "Tampico", "TAM", 0.77],
  ["SEA", "Pachuca", "Pachuca", "HID", 0.7],
  ["SEA", "Durango", "Durango", "DUR", 0.68],
  ["SEA", "Oaxaca", "Oaxaca de Juárez", "OAX", 0.66],
  // Sanborns — muchas plazas pequeñas, es la que peor reporta
  ["SAN", "Reforma", "Ciudad de México", "CMX", 0.92],
  ["SAN", "Coyoacán", "Ciudad de México", "CMX", 0.84],
  ["SAN", "Patriotismo", "Ciudad de México", "CMX", 0.74],
  ["SAN", "Naucalpan", "Naucalpan", "MEX", 0.7],
  ["SAN", "Tlalnepantla", "Tlalnepantla", "MEX", 0.66, 0, false],
  ["SAN", "San Pedro", "San Pedro Garza García", "NLE", 0.95],
  ["SAN", "Chapalita", "Guadalajara", "JAL", 0.79],
  ["SAN", "Querétaro Centro", "Querétaro", "QUE", 0.76],
  ["SAN", "Puebla Juárez", "Puebla", "PUE", 0.68, 0, false],
  ["SAN", "Playa del Carmen", "Playa del Carmen", "ROO", 0.88],
  ["SAN", "Mérida Centro", "Mérida", "YUC", 0.72],
  ["SAN", "León", "León", "GUA", 0.71],
  ["SAN", "Ensenada", "Ensenada", "BCN", 0.64, 0, false],
  ["SAN", "La Paz", "La Paz", "BCS", 0.69],
  ["SAN", "Tuxtla Gutiérrez", "Tuxtla Gutiérrez", "CHP", 0.58],
  ["SAN", "Oaxaca Centro", "Oaxaca de Juárez", "OAX", 0.61],
  ["SAN", "Cuernavaca", "Cuernavaca", "MOR", 0.73],
  ["SAN", "Veracruz Malecón", "Veracruz", "VER", 0.67],
  ["SAN", "Villahermosa", "Villahermosa", "TAB", 0.62, 0, false],
  ["SAN", "Culiacán", "Culiacán", "SIN", 0.7],
  ["SAN", "Aguascalientes", "Aguascalientes", "AGU", 0.74],
  ["SAN", "Pachuca", "Pachuca", "HID", 0.63],];

export const SUCURSALES: Sucursal[] = SEMILLAS.map((s, i) => {
  const [cadenaId, plaza, ciudad, estadoId, fuerza, apertura = 0, reporta = true] = s;
  const cadena = CADENAS.find((c) => c.id === cadenaId)!;
  return {
    clave: `${cadenaId}-${String(i + 1).padStart(3, "0")}`,
    nombre: `${cadena.nombre} ${plaza}`,
    plaza,
    ciudad,
    cadenaId,
    estadoId,
    fuerza,
    apertura,
    reporta,
  };
});

export const cadenaPorId = (id: string) => CADENAS.find((c) => c.id === id)!;
export const estadoPorId = (id: string) => ESTADOS.find((e) => e.id === id)!;
export const coleccionPorId = (id: string) => COLECCIONES.find((c) => c.id === id)!;
export const sucursalPorClave = (clave: string) =>
  SUCURSALES.find((s) => s.clave === clave)!;

/** Ciudades con presencia, agrupadas por estado. */
export const CIUDADES = Array.from(
  SUCURSALES.reduce((m, s) => {
    const k = `${s.estadoId}|${s.ciudad}`;
    if (!m.has(k)) m.set(k, { ciudad: s.ciudad, estadoId: s.estadoId, sucursales: 0 });
    m.get(k)!.sucursales++;
    return m;
  }, new Map<string, { ciudad: string; estadoId: string; sucursales: number }>())
).map(([, v]) => v).sort((a, b) => a.ciudad.localeCompare(b.ciudad, "es"));
