"use client";

import { useMemo } from "react";
import { useBI } from "@/lib/store";
import { Tile } from "@/components/ui";
import { fmt, moneyCorto, pct } from "@/lib/engine";
import { proyectar, estadoResultados } from "@/lib/plan";

export default function Resultados() {
  const { vista, ind, escenarios, escenarioId, setEscenarioId } = useBI();
  const activo = escenarios.find((e) => e.id === escenarioId) ?? escenarios[0];
  const plan = escenarios.find((e) => e.id === "plan")!;

  const p = useMemo(
    () => proyectar(activo, vista, ind.perdida, ind.capital),
    [activo, vista, ind.perdida, ind.capital]
  );
  const pPlan = useMemo(
    () => proyectar(plan, vista, ind.perdida, ind.capital),
    [plan, vista, ind.perdida, ind.capital]
  );

  const renglones = useMemo(() => estadoResultados(p), [p]);
  const renglonesPlan = useMemo(() => estadoResultados(pPlan), [pPlan]);

  return (
    <div className="view">
      <div className="card" style={{ paddingBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px" }}>
            <h3>Estado de resultados proyectado</h3>
            <p className="sub">
              Doce meses bajo el escenario <strong>{activo.nombre}</strong>, comparado contra el
              Plan 2027 comprometido. Cambiar un supuesto en Escenarios recalcula esta tabla
              completa.
            </p>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {escenarios.map((e) => (
              <button
                key={e.id}
                className={`btn ${e.id === escenarioId ? "on" : "ghost"} sm`}
                onClick={() => setEscenarioId(e.id)}
              >
                {e.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tiles">
        <Tile k="Ingreso neto" v={moneyCorto(p.ingreso)} n="Doce meses" />
        <Tile k="Margen bruto" v={moneyCorto(p.margenBruto)} n={`${pct(p.margenPct)} sobre ingreso`} />
        <Tile
          k="EBITDA"
          v={moneyCorto(p.ebitda)}
          tono={p.ebitda >= pPlan.ebitda ? "ok" : "flag"}
          n={`${pct(p.ebitdaPct)} sobre ingreso`}
        />
        <Tile
          k="Contra el Plan 2027"
          v={moneyCorto(p.ebitda - pPlan.ebitda)}
          tono={p.ebitda >= pPlan.ebitda ? "ok" : "flag"}
          n={p.ebitda >= pPlan.ebitda ? "Por encima del compromiso" : "Por debajo del compromiso"}
        />
      </div>

      <div className="card">
        <h3>Por trimestre</h3>
        <p className="sub">
          Los renglones con sangría suman al subtotal que los sigue. La columna de variación compara
          contra el Plan 2027.
        </p>
        <div className="tablewrap" style={{ maxHeight: "none" }}>
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th className="n">Q1</th>
                <th className="n">Q2</th>
                <th className="n">Q3</th>
                <th className="n">Q4</th>
                <th className="n">Año</th>
                <th className="n">vs Plan</th>
              </tr>
            </thead>
            <tbody>
              {renglones.map((r, i) => {
                const ref = renglonesPlan[i];
                const dif = r.total - (ref?.total ?? 0);
                const fuerte = r.tipo === "subtotal" || r.tipo === "resultado";
                const positivo = r.tipo === "costo" || r.tipo === "gasto" ? dif < 0 : dif > 0;
                return (
                  <tr
                    key={r.etiqueta}
                    style={
                      r.tipo === "resultado"
                        ? { borderTop: "2px solid var(--axis)" }
                        : undefined
                    }
                  >
                    <td
                      className="name"
                      style={{
                        paddingLeft: r.sangria ? 28 : undefined,
                        fontWeight: fuerte ? 700 : 400,
                      }}
                    >
                      {r.etiqueta}
                    </td>
                    {r.valores.map((v, j) => (
                      <td key={j} className="n" style={{ fontWeight: fuerte ? 700 : 400 }}>
                        {moneyCorto(r.tipo === "costo" || r.tipo === "gasto" ? -v : v)}
                      </td>
                    ))}
                    <td className="n" style={{ fontWeight: 700 }}>
                      {moneyCorto(r.tipo === "costo" || r.tipo === "gasto" ? -r.total : r.total)}
                    </td>
                    <td
                      className="n"
                      style={{
                        color:
                          activo.id === "plan"
                            ? "var(--ink-3)"
                            : positivo
                              ? "var(--good-ink)"
                              : "var(--crit-ink)",
                        fontWeight: fuerte ? 700 : 400,
                      }}
                    >
                      {activo.id === "plan" ? "—" : moneyCorto(dif)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="note">
          Costos y gastos se presentan en negativo para que cada subtotal se lea como una suma.
          Cifras de demostración, en pesos mexicanos.
        </p>
      </div>

      <div className="cols-2">
        <div className="card">
          <h3>Comparación de escenarios</h3>
          <p className="sub">Los cinco escenarios sobre la misma base de datos.</p>
          <div className="tablewrap" style={{ maxHeight: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Escenario</th>
                  <th className="n">Ingreso</th>
                  <th className="n">Margen %</th>
                  <th className="n">EBITDA</th>
                  <th className="n">EBITDA %</th>
                  <th className="n">Caja liberada</th>
                </tr>
              </thead>
              <tbody>
                {escenarios.map((e) => {
                  const q = proyectar(e, vista, ind.perdida, ind.capital);
                  return (
                    <tr
                      key={e.id}
                      className="clic"
                      onClick={() => setEscenarioId(e.id)}
                      style={
                        e.id === escenarioId
                          ? { background: "var(--accent-soft)", fontWeight: 600 }
                          : undefined
                      }
                    >
                      <td className="name">
                        <span
                          style={{
                            display: "inline-block",
                            width: 9,
                            height: 9,
                            borderRadius: 3,
                            background: e.color,
                            marginRight: 8,
                          }}
                        />
                        <strong>{e.nombre}</strong>
                      </td>
                      <td className="n">{moneyCorto(q.ingreso)}</td>
                      <td className="n">{pct(q.margenPct)}</td>
                      <td className="n">{moneyCorto(q.ebitda)}</td>
                      <td className="n">{pct(q.ebitdaPct)}</td>
                      <td className="n">{moneyCorto(q.cajaLiberada)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Ingreso y margen por cadena</h3>
          <p className="sub">
            Reparto proporcional al peso que cada socio tiene en la corrida actual.
          </p>
          <div className="tablewrap" style={{ maxHeight: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Cadena</th>
                  <th className="n">Unidades</th>
                  <th className="n">Ingreso</th>
                  <th className="n">Margen</th>
                  <th className="n">Peso</th>
                </tr>
              </thead>
              <tbody>
                {p.porCadena.map((c) => (
                  <tr key={c.id}>
                    <td className="name">
                      <strong>{c.nombre}</strong>
                    </td>
                    <td className="n">{fmt(Math.round(c.unidades))}</td>
                    <td className="n">{moneyCorto(c.ingreso)}</td>
                    <td className="n">{moneyCorto(c.margen)}</td>
                    <td className="n">{pct(p.ingreso ? (c.ingreso / p.ingreso) * 100 : 0, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
