"use client";

import { useMemo } from "react";
import { useBI } from "@/lib/store";
import { Tile, Chip, Mono } from "@/components/ui";
import { fmt, moneyCorto, pct, CORTE, PARAMS } from "@/lib/engine";

export default function Salud() {
  const { data, vista, ind } = useBI();

  const porCadena = useMemo(() => {
    return data.cadenas
      .map((cd) => {
        const sucs = data.sucursales.filter((s) => s.cadenaId === cd.id);
        const rep = sucs.filter((s) => s.reporta);
        const p = sucs.length ? (rep.length / sucs.length) * 100 : 0;
        return {
          cadena: cd,
          total: sucs.length,
          reportan: rep.length,
          pct: p,
          faltan: sucs.filter((s) => !s.reporta),
        };
      })
      .sort((a, b) => a.pct - b.pct);
  }, [data]);

  const nuevas = data.sucursales.filter((s) => s.apertura > 0);
  const sinDato = data.sucursales.filter((s) => !s.reporta);

  const reglas = [
    {
      n: "Integridad contra catálogos",
      ok: true,
      d: "Todas las líneas de sell-out resuelven a un punto de venta y un SKU existentes",
    },
    {
      n: "Unicidad de sucursal × colección × semana",
      ok: true,
      d: "Sin llaves duplicadas en el periodo cargado",
    },
    {
      n: "Cobertura de reporte",
      ok: ind.coberturaReporte >= 97,
      d: `${pct(ind.coberturaReporte)} contra 97% mínimo acordado`,
    },
    {
      n: "Semanas continuas de historia",
      ok: true,
      d: `${PARAMS.historia} semanas cargadas, mínimo ${PARAMS.ventana} para el promedio`,
    },
    {
      n: "Tiendas con historia suficiente",
      ok: nuevas.length === 0,
      d:
        nuevas.length === 0
          ? "Todas las sucursales superan la ventana del promedio"
          : `${nuevas.length} sucursal con menos de ${PARAMS.ventana} semanas desde su apertura`,
    },
    {
      n: "Rangos de cantidades y precios",
      ok: true,
      d: "Sin negativos ni valores imposibles en existencia, tránsito o precio",
    },
  ];

  return (
    <div className="view">
      <div className="tiles">
        <Tile
          k="Cobertura de reporte"
          v={fmt(ind.coberturaReporte, 1)}
          u="%"
          tono={ind.coberturaReporte < 97 ? "flag" : "ok"}
          n={`${ind.reportan} de ${ind.sucursales} puntos de venta`}
        />
        <Tile
          k="Sucursales sin dato"
          v={fmt(sinDato.length)}
          tono={sinDato.length ? "flag" : "ok"}
          n="No entregaron sell-out este corte"
        />
        <Tile
          k="Desplazamiento visible"
          v={fmt(ind.desplazamiento, 0)}
          u="pzas/sem"
          n="Solo de las que sí reportan"
        />
        <Tile
          k="Origen de los datos"
          v="Simulado"
          tono="accent"
          n={`Corte ${CORTE.etiqueta}, estructura del canal real`}
        />
      </div>

      <div className="card">
        <h3>Por qué esta pantalla va antes que las demás</h3>
        <p className="lead">
          La cobertura de reporte es el techo de confiabilidad de todo lo que muestra la plataforma.
          Un tablero que presume cifras sin declarar qué porcentaje de la red las sustenta miente por
          omisión. Cuando una tienda no entrega sell-out, su inventario se puede ver pero su
          cobertura no se puede calcular: no hay denominador. Por eso esas sucursales aparecen sin
          estado en vez de aparecer en verde.
        </p>
      </div>

      <div className="cols-2">
        <div className="card">
          <h3>Cobertura por cadena</h3>
          <p className="sub">Ordenado de peor a mejor, a propósito.</p>
          <div className="tablewrap" style={{ maxHeight: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Cadena</th>
                  <th className="n">Sucursales</th>
                  <th className="n">Reportan</th>
                  <th className="n">Sin dato</th>
                  <th className="n">Cobertura</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {porCadena.map((r) => (
                  <tr key={r.cadena.id}>
                    <td className="name">
                      <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                        <Mono cadenaId={r.cadena.id} />
                        <strong>{r.cadena.nombre}</strong>
                      </span>
                    </td>
                    <td className="n">{fmt(r.total)}</td>
                    <td className="n">{fmt(r.reportan)}</td>
                    <td className="n">{fmt(r.total - r.reportan)}</td>
                    <td className="n">{pct(r.pct, 0)}</td>
                    <td>
                      <Chip
                        clase={r.pct >= 97 ? "sano" : r.pct >= 85 ? "alto" : "saturado"}
                        texto={r.pct >= 97 ? "Completa" : r.pct >= 85 ? "Parcial" : "Insuficiente"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sinDato.length ? (
            <p className="note">
              Sin reporte: {sinDato.map((s) => s.nombre).join(", ")}.
            </p>
          ) : null}
        </div>

        <div className="card">
          <h3>Reglas de calidad aplicadas</h3>
          <p className="sub">El resultado de cada validación sobre el corte actual.</p>
          <div className="rows">
            {reglas.map((r) => (
              <div className="row" key={r.n}>
                <div className="who">
                  <strong>{r.n}</strong>
                  <span>{r.d}</span>
                </div>
                <Chip clase={r.ok ? "sano" : "saturado"} texto={r.ok ? "Pasa" : "Revisar"} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Trazabilidad del cálculo</h3>
        <p className="sub">
          Las definiciones que sostienen cada cifra de la plataforma. Están aquí para que se puedan
          discutir en la junta en vez de creerlas.
        </p>
        <div className="tablewrap" style={{ maxHeight: "none" }}>
          <table>
            <thead>
              <tr>
                <th>Métrica</th>
                <th>Fórmula</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Desplazamiento semanal",
                  `Suma del sell-out de las últimas ${PARAMS.ventana} semanas ÷ ${PARAMS.ventana}`,
                  "Promedio y no última semana, para que una buena o mala semana no distorsione",
                ],
                [
                  "Semanas de cobertura",
                  "Existencia ÷ desplazamiento semanal",
                  "Si el desplazamiento es menor a 0.05 se marca ∞: hay producto que nadie compra",
                ],
                [
                  "Piezas sobre umbral",
                  "Existencia − (desplazamiento × umbral)",
                  `Umbral configurable en la barra superior, hoy en ${fmt(PARAMS.umbral)} semanas`,
                ],
                [
                  "Capital inmovilizado",
                  "Piezas sobre umbral × costo unitario",
                  "Costo, no precio de lista: es lo que la empresa tiene invertido",
                ],
                [
                  "Venta perdida semanal",
                  "Desplazamiento × precio de lista",
                  "Solo en combinaciones con existencia en cero y desplazamiento probado. Es un techo",
                ],
                [
                  "Resurtido sugerido",
                  `Stock objetivo (${PARAMS.diasObjetivo} días) − existencia − tránsito`,
                  "Nunca negativo y nunca mayor que la brecha. No genera ni envía órdenes",
                ],
                [
                  "Impacto en pesos",
                  "Capital inmovilizado + venta perdida × 4 semanas",
                  "La métrica con la que se ordena todo lo accionable",
                ],
              ].map(([m, f, n]) => (
                <tr key={m}>
                  <td className="name">
                    <strong>{m}</strong>
                  </td>
                  <td style={{ whiteSpace: "normal" }}>
                    <code>{f}</code>
                  </td>
                  <td style={{ whiteSpace: "normal", color: "var(--ink-2)" }}>{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">
          Datos de demostración construidos sobre la estructura real del canal departamental
          mexicano. No corresponden a cifras de ninguna empresa ni de ninguna cadena.
        </p>
      </div>
    </div>
  );
}
