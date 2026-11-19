import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Puente hacia n8n.
 *
 * La página llama aquí; aquí se llama al webhook de n8n. Nunca al revés y nunca
 * desde el navegador: así la URL del webhook y su credencial viven solo en el
 * servidor y no viajan al cliente.
 *
 * Regla de la demostración: si n8n no contesta en TIEMPO_LIMITE, se responde
 * `{ fuente: "local" }` y la página usa su motor de reglas. Nunca se queda
 * colgada delante de una sala.
 */

const TIEMPO_LIMITE = Number(process.env.COPILOTO_TIMEOUT_MS ?? 4000);

export async function POST(req: NextRequest) {
  const url = process.env.N8N_WEBHOOK_URL;
  const inicio = Date.now();

  if (!url) {
    return NextResponse.json({
      fuente: "local",
      motivo: "sin-configurar",
      detalle: "Sin modelo conectado en este ambiente.",
      ms: 0,
    });
  }

  let cuerpo: Record<string, unknown>;
  try {
    const recibido = (await req.json()) as Record<string, unknown>;
    // El identificador de cliente se pone aquí, no en el navegador: así un
    // mismo despliegue puede servir a varias marcas sin que la página sepa
    // de cuál se trata, y la memoria de cada una queda separada en Supabase.
    cuerpo = { ...recibido, cliente_id: Number(process.env.BI_CLIENTE_ID ?? 0) };
  } catch {
    return NextResponse.json({ fuente: "local", motivo: "peticion-invalida", ms: 0 }, { status: 400 });
  }

  const ctrl = new AbortController();
  const reloj = setTimeout(() => ctrl.abort(), TIEMPO_LIMITE);

  try {
    const cabeceras: Record<string, string> = { "content-type": "application/json" };
    if (process.env.N8N_WEBHOOK_TOKEN) {
      cabeceras.authorization = `Bearer ${process.env.N8N_WEBHOOK_TOKEN}`;
    }

    const r = await fetch(url, {
      method: "POST",
      headers: cabeceras,
      body: JSON.stringify(cuerpo),
      signal: ctrl.signal,
      cache: "no-store",
    });
    clearTimeout(reloj);

    if (!r.ok) {
      return NextResponse.json({
        fuente: "local",
        motivo: "n8n-error",
        detalle: `n8n respondió ${r.status}`,
        ms: Date.now() - inicio,
      });
    }

    const texto = await r.text();
    let datos: unknown;
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = { respuesta: texto };
    }

    // n8n a veces devuelve [{ json: {...} }] según cómo termine el flujo.
    let n: Record<string, unknown> = {};
    if (Array.isArray(datos)) {
      const p = datos[0] as Record<string, unknown> | undefined;
      n = (p?.json as Record<string, unknown>) ?? p ?? {};
    } else if (datos && typeof datos === "object") {
      n = datos as Record<string, unknown>;
    }

    const respuesta =
      (n.respuesta as string) ??
      (n.output as string) ??
      (n.text as string) ??
      (n.message as string) ??
      "";

    if (!respuesta.trim()) {
      return NextResponse.json({
        fuente: "local",
        motivo: "n8n-vacio",
        detalle: "El flujo contestó sin texto utilizable.",
        ms: Date.now() - inicio,
      });
    }

    return NextResponse.json({
      fuente: "n8n",
      respuesta,
      prioridades: Array.isArray(n.prioridades) ? n.prioridades : undefined,
      modelo: typeof n.modelo === "string" ? n.modelo : undefined,
      ms: Date.now() - inicio,
    });
  } catch (e) {
    clearTimeout(reloj);
    const abortado = e instanceof Error && e.name === "AbortError";
    return NextResponse.json({
      fuente: "local",
      motivo: abortado ? "tiempo-agotado" : "sin-conexion",
      detalle: abortado
        ? `n8n no respondió en ${TIEMPO_LIMITE} ms.`
        : "No se pudo alcanzar el webhook de n8n.",
      ms: Date.now() - inicio,
    });
  }
}
