import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lo que hace al copiloto autodidacta.
 *
 * Cuando alguien marca una recomendación como útil, la descarta o registra una
 * decisión, la página llama aquí y aquí se llama al webhook de aprendizaje de
 * n8n, que destila la retroalimentación en una lección de una línea y la
 * guarda en Supabase. En la siguiente consulta esa lección entra al prompt.
 *
 * Reglas de este endpoint:
 *  - Nunca bloquea ni falla hacia el usuario. Aprender es deseable, no crítico.
 *  - Tiene su propio presupuesto de tiempo, más corto que el de la consulta:
 *    nadie está esperando esta respuesta delante de una sala.
 *  - Si no hay webhook configurado, responde `guardado: false` y la página lo
 *    muestra como «memoria local», que es la verdad.
 */

const TIEMPO_LIMITE = Number(process.env.APRENDER_TIMEOUT_MS ?? 2500);

/** Deriva la URL de aprendizaje de la de consulta si no se declaró aparte. */
function destino(): string | null {
  const propia = process.env.N8N_APRENDER_URL;
  if (propia) return propia;
  const consulta = process.env.N8N_WEBHOOK_URL;
  if (!consulta) return null;
  return consulta.replace(/\/copiloto\/?$/, "/aprender");
}

export async function POST(req: NextRequest) {
  const url = destino();
  if (!url) {
    return NextResponse.json({ guardado: false, motivo: "sin-configurar" });
  }

  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ guardado: false, motivo: "peticion-invalida" }, { status: 400 });
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
      body: JSON.stringify({
        ...cuerpo,
        cliente_id: Number(process.env.BI_CLIENTE_ID ?? 0),
      }),
      signal: ctrl.signal,
      cache: "no-store",
    });
    clearTimeout(reloj);

    if (!r.ok) return NextResponse.json({ guardado: false, motivo: `n8n-${r.status}` });

    const d = (await r.json().catch(() => ({}))) as Record<string, unknown>;
    return NextResponse.json({ guardado: true, aprendido: d.aprendido ?? null });
  } catch (e) {
    clearTimeout(reloj);
    const abortado = e instanceof Error && e.name === "AbortError";
    return NextResponse.json({
      guardado: false,
      motivo: abortado ? "tiempo-agotado" : "sin-conexion",
    });
  }
}
