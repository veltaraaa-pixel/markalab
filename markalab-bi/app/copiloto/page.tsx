"use client";

import { useEffect, useMemo, useState } from "react";
import { useBI } from "@/lib/store";
import { Tile } from "@/components/ui";
import {
  analizar,
  construirContexto,
  resumenDeterminista,
  ETIQUETA_SEVERIDAD,
  type Hallazgo,
  type Severidad,
} from "@/lib/copiloto";
import { CORTE, fmt, money, moneyCorto } from "@/lib/engine";

const TONO: Record<Severidad, string> = {
  critica: "crit",
  alta: "serious",
  media: "warn",
  oportunidad: "good",
};

const SUGERIDAS = [
  "¿Qué tres cosas haría esta semana si solo pudiera hacer tres?",
  "¿Cuánto cuesta no hacer nada durante un mes más?",
  "Explícame el caso de Nuevo León como se lo diría al comprador.",
  "¿Qué pregunta debería hacerle al equipo que no me estoy haciendo?",
];

export default function Copiloto() {
  const { vista, ind, filtro, bitacora, registrar } = useBI();
  const [pregunta, setPregunta] = useState("");
  const [cargando, setCargando] = useState(false);
  const [respuesta, setRespuesta] = useState<string>("");
  const [fuente, setFuente] = useState<"n8n" | "local" | null>(null);
  const [detalle, setDetalle] = useState<string>("");
  const [ms, setMs] = useState<number>(0);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [sesion, setSesion] = useState<string>("");
  const [aprendido, setAprendido] = useState<string>("");

  /* El identificador de sesión se genera en el navegador, después del montaje:
     generarlo durante el render daría un valor distinto en el servidor y en el
     cliente, y eso rompe la hidratación de React. */
  useEffect(() => {
    setSesion(`s-${Date.now().toString(36)}`);
  }, []);

  const hallazgos = useMemo(
    () => analizar(vista, ind, filtro.umbral, bitacora),
    [vista, ind, filtro.umbral, bitacora]
  );

  const recuperable = hallazgos
    .filter((h) => h.unidad === "recuperable")
    .reduce((a, h) => a + h.valor, 0);
  const liberable = hallazgos
    .filter((h) => h.unidad === "liberable")
    .reduce((a, h) => a + h.valor, 0);
  const criticas = hallazgos.filter((h) => h.severidad === "critica").length;

  async function preguntar(texto: string) {
    setCargando(true);
    setRespuesta("");
    setDetalle("");
    setAprendido("");
    const ctx = construirContexto(hallazgos, ind, filtro.umbral, CORTE.etiqueta, bitacora, texto);
    try {
      const r = await fetch("/api/copiloto", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...ctx, sesion }),
      });
      const d = await r.json();
      setMs(d.ms ?? 0);
      if (d.fuente === "n8n" && d.respuesta) {
        setFuente("n8n");
        setRespuesta(d.respuesta);
      } else {
        setFuente("local");
        setDetalle(d.detalle ?? "");
        setRespuesta(responderLocal(texto, hallazgos, ind));
      }
    } catch {
      setFuente("local");
      setDetalle("No se pudo alcanzar el servicio.");
      setRespuesta(responderLocal(texto, hallazgos, ind));
    } finally {
      setCargando(false);
    }
  }

  /* Lo que hace autodidacta al copiloto. Cada señal que deja el equipo se
     destila en una lección de una línea que entra al contexto de la próxima
     consulta. Si el flujo de aprendizaje no está conectado se dice en pantalla:
     la memoria se queda en esta sesión y nada más. */
  async function enseñar(payload: {
    tipo: "util" | "rechazo" | "decision";
    hallazgo?: string;
    area?: string;
    comentario?: string;
  }) {
    setAprendido("Guardando la lección…");
    try {
      const r = await fetch("/api/copiloto/aprender", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, sesion }),
      });
      const d = await r.json();
      setAprendido(
        d.guardado
          ? "Aprendido. Entra al contexto de la siguiente consulta."
          : "Memoria de esta sesión: el flujo de aprendizaje no está conectado."
      );
    } catch {
      setAprendido("Memoria de esta sesión: el flujo de aprendizaje no está conectado.");
    }
  }

  return (
    <div className="view">
      <div className="tiles">
        <Tile
          k="Hallazgos del corte"
          v={fmt(hallazgos.length)}
          tono={criticas ? "flag" : undefined}
          n={`${criticas} críticos`}
        />
        <Tile k="Capital liberable" v={moneyCorto(liberable)} tono="accent" n="Dejando de embarcar y liquidando" />
        <Tile
          k="Venta recuperable"
          v={moneyCorto(recuperable)}
          tono="ok"
          n="Doce meses, cerrando quiebres y trasladando"
        />
        <Tile
          k="Decisiones registradas"
          v={fmt(bitacora.length)}
          n="Alimentan la priorización siguiente"
        />
      </div>

      <div className="card">
        <h3>Preguntar al copiloto</h3>
        <p className="sub">
          El copiloto recibe los hallazgos ya calculados con sus cifras. No inventa números: redacta,
          prioriza y contesta sobre ellos.
        </p>
        <div style={{ display: "flex", gap: 9, marginTop: 12, flexWrap: "wrap" }}>
          <input
            type="text"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && pregunta.trim()) preguntar(pregunta);
            }}
            placeholder="Escribe una pregunta sobre el canal, el inventario o el plan"
            style={{ flex: "1 1 340px", minHeight: 38 }}
          />
          <button
            className="btn"
            disabled={cargando || !pregunta.trim()}
            onClick={() => preguntar(pregunta)}
          >
            {cargando ? "Pensando…" : "Preguntar"}
          </button>
          <button
            className="btn ghost"
            disabled={cargando}
            onClick={() => preguntar("Dame el resumen ejecutivo del corte.")}
          >
            Resumen ejecutivo
          </button>
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
          {SUGERIDAS.map((s) => (
            <button
              key={s}
              className="btn ghost sm"
              disabled={cargando}
              onClick={() => {
                setPregunta(s);
                preguntar(s);
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {respuesta ? (
          <div
            style={{
              marginTop: 14,
              padding: "14px 16px",
              background: "var(--surface-2)",
              border: "1px solid var(--hair)",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <span className={`chip ${fuente === "n8n" ? "sano" : "neutro"}`}>
                <b aria-hidden>●</b>
                {fuente === "n8n" ? "Modelo vía n8n" : "Motor de reglas"}
              </span>
              <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                {ms} ms{detalle ? ` · ${detalle}` : ""}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {respuesta}
            </p>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
                marginTop: 12,
                paddingTop: 10,
                borderTop: "1px solid var(--hair)",
              }}
            >
              <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                ¿Esto le sirvió al equipo?
              </span>
              <button
                className="btn ghost sm"
                onClick={() =>
                  enseñar({
                    tipo: "util",
                    hallazgo: hallazgos[0]?.id,
                    area: hallazgos[0]?.area,
                    comentario: pregunta,
                  })
                }
              >
                Sí, priorizar esto
              </button>
              <button
                className="btn ghost sm"
                onClick={() =>
                  enseñar({
                    tipo: "rechazo",
                    hallazgo: hallazgos[0]?.id,
                    area: hallazgos[0]?.area,
                    comentario: pregunta,
                  })
                }
              >
                No aplica aquí
              </button>
              {aprendido ? (
                <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{aprendido}</span>
              ) : null}
            </div>
          </div>
        ) : null}

        <p className="note">
          Si el flujo de n8n no contesta en cuatro segundos, el motor de reglas responde en su lugar
          y lo declara arriba. La plataforma nunca se queda esperando.
        </p>
      </div>

      <div className="card">
        <h3>Hallazgos priorizados</h3>
        <p className="sub">
          Cada uno declara la regla que lo disparó. Abrir un hallazgo muestra la regla y el número
          que la cumplió.
        </p>
        <div className="rows">
          {hallazgos.map((h) => (
            <HallazgoFila
              key={h.id}
              h={h}
              abierto={abierto === h.id}
              onAbrir={() => setAbierto(abierto === h.id ? null : h.id)}
              onDecidir={(accion) => {
                registrar({ alertaId: h.id, titulo: h.titulo, accion, valor: h.valor });
                setAbierto(null);
                // La decisión es la señal más fuerte que deja el equipo: un
                // hallazgo descartado no se vuelve a proponer, y uno aceptado
                // sube de prioridad en los cortes siguientes.
                if (accion !== "pospuesta") {
                  enseñar({
                    tipo: accion === "descartada" ? "rechazo" : "decision",
                    hallazgo: h.id,
                    area: h.area,
                    comentario:
                      accion === "descartada"
                        ? `descartó "${h.titulo}"`
                        : `ejecutar "${h.titulo}" (${h.accion})`,
                  });
                }
              }}
            />
          ))}
        </div>
      </div>

      {bitacora.length ? (
        <div className="card">
          <h3>Bitácora de decisiones</h3>
          <p className="sub">
            Esto es lo que vuelve útil al copiloto con el uso: un hallazgo descartado deja de
            proponerse, y la bitácora viaja como contexto en la siguiente consulta.
          </p>
          <div className="rows">
            {bitacora.map((d) => (
              <div className="row" key={d.sello}>
                <div className="who">
                  <strong>{d.titulo}</strong>
                  <span>
                    {d.accion === "aceptada"
                      ? "Aceptada"
                      : d.accion === "descartada"
                        ? "Descartada"
                        : "Pospuesta"}
                    {d.motivo ? ` · ${d.motivo}` : ""}
                  </span>
                </div>
                <div className="val num">{d.valor ? moneyCorto(d.valor) : "—"}</div>
              </div>
            ))}
          </div>
          <p className="note">
            En producción esta bitácora se guarda y es la que permite responder, al tercer mes,
            cuántas recomendaciones se atendieron y qué pasó con las que no.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function HallazgoFila({
  h,
  abierto,
  onAbrir,
  onDecidir,
}: {
  h: Hallazgo;
  abierto: boolean;
  onAbrir: () => void;
  onDecidir: (a: "aceptada" | "descartada" | "pospuesta") => void;
}) {
  return (
    <div className="row" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
      <div
        style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer", flexWrap: "wrap" }}
        onClick={onAbrir}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onAbrir();
          }
        }}
      >
        <span className={`chip ${TONO[h.severidad]}`}>
          <b aria-hidden>●</b>
          {ETIQUETA_SEVERIDAD[h.severidad]}
        </span>
        <div className="who" style={{ flex: "1 1 240px" }}>
          <strong>{h.titulo}</strong>
          <span>
            {h.area}
            {h.valor > 0
              ? ` · ${moneyCorto(h.valor)} ${
                  h.unidad === "recuperable"
                    ? "recuperables"
                    : h.unidad === "liberable"
                      ? "liberables"
                      : "en riesgo"
                }`
              : ""}
          </span>
        </div>
        <span style={{ color: "var(--ink-3)", fontSize: 12 }}>{abierto ? "Cerrar" : "Ver"}</span>
      </div>

      {abierto ? (
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--hair)",
            borderRadius: 9,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55 }}>{h.cuerpo}</p>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55 }}>
            <strong>Qué hacer: </strong>
            {h.accion}
          </p>
          <p style={{ margin: 0, fontSize: 11.5, color: "var(--ink-3)" }}>
            <strong style={{ color: "var(--ink-2)" }}>Regla: </strong>
            <code>{h.regla}</code>
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn sm" onClick={() => onDecidir("aceptada")}>
              Aceptar
            </button>
            <button className="btn ghost sm" onClick={() => onDecidir("pospuesta")}>
              Posponer
            </button>
            <button className="btn ghost sm" onClick={() => onDecidir("descartada")}>
              Descartar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Respuesta sin modelo: se arma con los mismos hallazgos. */
function responderLocal(
  pregunta: string,
  hallazgos: Hallazgo[],
  ind: Parameters<typeof resumenDeterminista>[1]
): string {
  const q = pregunta.toLowerCase();

  if (q.includes("tres") || q.includes("prioridad") || q.includes("semana")) {
    const tres = hallazgos.slice(0, 3);
    return (
      "Tres cosas, en este orden:\n\n" +
      tres
        .map((h, i) => `${i + 1}. ${h.titulo}. ${h.accion}`)
        .join("\n\n") +
      "\n\nLas tres se pueden iniciar sin esperar a nadie más."
    );
  }

  if (q.includes("no hacer nada") || q.includes("cuesta") || q.includes("costo")) {
    const perdidaMes = ind.perdida * 4.3;
    const costoCapital = (ind.capital * 0.18) / 12;
    return (
      `Un mes más sin actuar cuesta ${money(perdidaMes + costoCapital)}.\n\n` +
      `${money(perdidaMes)} de venta que no ocurre porque el producto no está en el anaquel donde sí se vende, y ` +
      `${money(costoCapital)} de costo financiero del inventario parado, a una tasa anual del 18%.\n\n` +
      `No incluye el efecto de perder espacio de anaquel con el comprador, que es real y no se mide en esta cifra.`
    );
  }

  if (q.includes("nuevo león") || q.includes("monterrey") || q.includes("comprador")) {
    const h = hallazgos.find((x) => x.id.startsWith("sat-")) ?? hallazgos[0];
    return (
      `Para el comprador, en sus términos:\n\n` +
      `"${h.cuerpo}"\n\n` +
      `La propuesta no es dejar de surtirlos: es cambiar la mezcla. ${h.accion}\n\n` +
      `El argumento que suele funcionar es el espacio: cada pieza que no rota ocupa un lugar que podría ` +
      `tener producto que sí desplaza, y eso también es dinero para ellos, no solo para nosotros.`
    );
  }

  if (q.includes("pregunta") && q.includes("equipo")) {
    return (
      "La pregunta que no se está haciendo es por qué el embarque se concentra en la última semana de cada mes.\n\n" +
      "El patrón de los datos no corresponde a demanda, corresponde a cierre de cuota. Mientras el incentivo " +
      "del equipo comercial siga atado al sell-in mensual y no al sell-out, cualquier corrección del inventario " +
      "se va a deshacer sola en el siguiente cierre.\n\n" +
      "Es una conversación de compensación, no de inventarios."
    );
  }

  return resumenDeterminista(hallazgos, ind);
}
