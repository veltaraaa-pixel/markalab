/**
 * La costura entre la demostración y la producción.
 *
 * Todo lo que la plataforma muestra sale de un único `Dataset`. Hoy ese
 * Dataset lo produce un generador determinista; en producción lo produce el
 * sistema del cliente. Ese es el ÚNICO punto del código donde se decide de
 * dónde vienen los datos, y está aquí a propósito: pasar de la demostración a
 * un cliente real no debe ser tocar diez pantallas, debe ser escribir una
 * función.
 *
 * Lo que NO cambia al pasar a producción, y por eso no está aquí:
 *  - Las fórmulas (cobertura, capital inmovilizado, venta perdida, traslados).
 *    Viven en engine.ts y son las mismas con datos reales.
 *  - Las nueve reglas del copiloto. Viven en copiloto.ts.
 *  - Las pantallas. Leen del store, no de la fuente.
 *
 * ---------------------------------------------------------------------------
 * CÓMO SE CONECTA UN CLIENTE REAL
 * ---------------------------------------------------------------------------
 * 1. Se implementa una fuente nueva que devuelva un `Dataset` con la misma
 *    forma: cadenas, colecciones, modelos, estados, sucursales y combos.
 *    El contrato está en `engine.ts` (`type Dataset`).
 * 2. Se registra abajo en `FUENTES`.
 * 3. Se cambia `NEXT_PUBLIC_BI_FUENTE` en Vercel. Nada más.
 *
 * El nombre de esa variable sí lleva `NEXT_PUBLIC_` porque la decisión se toma
 * en el navegador. No transporta ningún secreto: solo dice cuál de las fuentes
 * registradas se usa. Las credenciales de la fuente real viven del lado del
 * servidor, detrás de su propio endpoint.
 * ---------------------------------------------------------------------------
 */

import { generar, type Dataset } from "./engine";

export type NombreFuente = "sintetica" | "api";

export type Fuente = {
  nombre: NombreFuente;
  /** Lo que se muestra en la pantalla «Salud del dato». */
  etiqueta: string;
  /** Si es false, la plataforma declara en pantalla que los datos son simulados. */
  productiva: boolean;
  cargar: () => Dataset;
};

/**
 * Fuente de demostración. Determinista: la misma semilla produce siempre las
 * mismas cifras, así que nadie ve números distintos entre dos aperturas.
 */
const sintetica: Fuente = {
  nombre: "sintetica",
  etiqueta: "Datos simulados · generador determinista",
  productiva: false,
  cargar: generar,
};

/**
 * Hueco para el cliente real. Cuando exista, esta función pide el corte al
 * endpoint del servidor —que es quien guarda las credenciales— y lo devuelve
 * con la forma de `Dataset`.
 *
 * Se deja declarada y sin implementar a propósito: así el día que entre un
 * cliente, el trabajo está acotado a este archivo y no hay que buscarlo.
 */
const api: Fuente = {
  nombre: "api",
  etiqueta: "Datos del cliente · vía /api/corte",
  productiva: true,
  cargar: () => {
    throw new Error(
      "La fuente 'api' todavía no está implementada. Ver lib/fuente.ts."
    );
  },
};

const FUENTES: Record<NombreFuente, Fuente> = { sintetica, api };

/** La fuente activa según el ambiente. Por omisión, la de demostración. */
export function fuenteActiva(): Fuente {
  const pedida = process.env.NEXT_PUBLIC_BI_FUENTE as NombreFuente | undefined;
  return (pedida && FUENTES[pedida]) || FUENTES.sintetica;
}

/** El Dataset del corte vigente. Es lo único que consume el store. */
export function cargarCorte(): Dataset {
  return fuenteActiva().cargar();
}
