"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useBI } from "@/lib/store";
import { Tile } from "@/components/ui";
import { Treemap, Columnas } from "@/components/charts";
import { fmt, money, moneyCorto, pct } from "@/lib/engine";
import { proyectar, CAMPOS_SUPUESTO, MESES, ESCENARIOS_BASE } from "@/lib/plan";

export default function Planeacion() {
  const {
    vista,
    ind,
    escenarios,
    escenarioId,
    setEscenarioId,
    actualizarEscenario,
    reiniciarEscenario,
  } = useBI();

  const activo = escenarios.find((e) => e.id === escenarioId) ?? escenarios[0];
  const base = escenarios.find((e) => e.id === "base")!;

  const p = useMemo(
    () => proyectar(activo, vista, ind.perdida, ind.capital),
    [activo, vista, ind.perdida, ind.capital]
  );
  const pBase = useMemo(
    () => proyectar(base, vista, ind.perdida, ind.capital),
    [base, vista, ind.perdida, ind.capital]
  );

  const d = {
    ingreso: p.ingreso - pBase.ingreso,
    margen: p.margenBruto - pBase.margenBruto,
    ebitda: p.ebitda - pBase.ebitda,
    caja: p.cajaLiberada - pBase.cajaLiberada,
  };

  const baldosas = p.lineas.slice(0, 10).map((l) => {
    const maxM = Math.max(...p.lineas.map((x) => x.margenPct));
    const minM = Math.min(...p.lineas.map((x) => x.margenPct));
    return {
      nombre: l.nombre,
      valor: l.totalMargen,
      intensidad: maxM > minM ? (l.margenPct - minM) / (maxM - minM) : 0.5,
      nota: `${fmt(Math.round(l.totalUnidades))} pzas · margen ${pct(l.margenPct)}`,
    };
  });

  const trimestres = [0, 1, 2, 3].map((i) => ({
    et: `Q${i + 1}`,
    v: p.ebitdaMes.slice(i * 3, i * 3 + 3).reduce((a, b) => a + b, 0),
  }));

  return (
    <div className="view">
      {/* Selector de escenario */}
      <div className="card" style={{ paddingBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px" }}>
            <h3>Escenario activo</h3>
            <p className="sub">{activo.descripcion}</p>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {escenarios.map((e) => (
              <button
                key={e.id}
                className={`btn ${e.id === escenarioId ? "on" : "ghost"} sm`}
                onClick={() => setEscenarioId(e.id)}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 3,
                    background: e.color,
                    display: "inline-block",
                  }}
                />
                {e.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tiles">
        <Tile
          k="Ingreso proyectado"
          v={moneyCorto(p.ingreso)}
          n={`${fmt(Math.round(p.unidades))} piezas en doce meses`}
          delta={
            activo.id !== "base"
              ? { valor: moneyCorto(Math.abs(d.ingreso)), arriba: d.ingreso >= 0 }
              : undefined
          }
        />
        <Tile
          k="Margen bruto"
          v={moneyCorto(p.margenBruto)}
          n={`${pct(p.margenPct)} sobre ingreso`}
          delta={
            activo.id !== "base"
              ? { valor: moneyCorto(Math.abs(d.margen)), arriba: d.margen >= 0 }
              : undefined
          }
        />
        <Tile
          k="EBITDA"
          v={moneyCorto(p.ebitda)}
          tono={p.ebitda >= pBase.ebitda ? "ok" : "flag"}
          n={`${pct(p.ebitdaPct)} sobre ingreso`}
          delta={
            activo.id !== "base"
              ? { valor: moneyCorto(Math.abs(d.ebitda)), arriba: d.ebitda >= 0 }
              : undefined
          }
        />
        <Tile
          k="Caja liberada"
          v={moneyCorto(p.cajaLiberada)}
          tono="accent"
          n="Menos días de inventario y liquidación"
        />
        <Tile
          k="Venta recuperada"
          v={moneyCorto(p.recuperado)}
          tono="accent"
          n={`Nivel de servicio al ${fmt(activo.supuestos.servicio, 0)}%`}
        />
        <Tile
          k="Inventario promedio"
          v={moneyCorto(p.inventarioPromedio)}
          n={`${fmt(activo.supuestos.diasObjetivo, 0)} días objetivo`}
        />
      </div>

      <div className="cols-2">
        {/* Hoja de supuestos */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 auto" }}>
              <h3>Supuestos</h3>
              <p className="sub">
                Mueve cualquiera y observa cómo se propaga por el modelo completo, hasta EBITDA.
              </p>
            </div>
            {!activo.bloqueado ? (
              <button className="btn ghost sm" onClick={() => reiniciarEscenario(activo.id)}>
                Reiniciar
              </button>
            ) : null}
          </div>

          {activo.bloqueado ? (
            <p className="note" style={{ marginTop: 10 }}>
              <strong>{activo.nombre}</strong> es un escenario de referencia y no se edita. Para
              probar cambios, usa <em>Canal corregido</em>, <em>Conservador</em> o{" "}
              <em>Mi escenario</em>.
            </p>
          ) : null}

          <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 14 }}>
            {CAMPOS_SUPUESTO.map((c) => {
              const v = activo.supuestos[c.k];
              const vBase = ESCENARIOS_BASE[0].supuestos[c.k];
              const cambiado = Math.abs(v - vBase) > 1e-9;
              return (
                <div key={c.k}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "baseline",
                    }}
                  >
                    <label
                      htmlFor={`sup-${c.k}`}
                      style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}
                    >
                      {c.etiqueta}
                    </label>
                    <span
                      className="num"
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: cambiado ? "var(--accent-ink)" : "var(--ink-2)",
                      }}
                    >
                      {c.unidad === "M$" ? "$" : ""}
                      {fmt(v, c.paso < 1 ? 1 : 0)}
                      {c.unidad === "M$" ? " M" : c.unidad === "%" ? "%" : ` ${c.unidad}`}
                    </span>
                  </div>
                  <input
                    id={`sup-${c.k}`}
                    type="range"
                    min={c.min}
                    max={c.max}
                    step={c.paso}
                    value={v}
                    disabled={activo.bloqueado}
                    onChange={(e) =>
                      actualizarEscenario(activo.id, { [c.k]: Number(e.target.value) })
                    }
                    style={{ width: "100%", accentColor: "var(--accent)", marginTop: 4 }}
                  />
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{c.ayuda}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cómo se propaga */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <h3>Cómo se propaga el cambio</h3>
            <p className="sub">
              La cadena completa, del supuesto al resultado. Es el mismo orden en que recalcula el
              modelo.
            </p>
            <div className="rows">
              {[
                { k: "Unidades", v: fmt(Math.round(p.unidades)) + " pzas", b: fmt(Math.round(pBase.unidades)) + " pzas" },
                { k: "Ingreso neto", v: moneyCorto(p.ingreso), b: moneyCorto(pBase.ingreso) },
                { k: "Costo de ventas", v: moneyCorto(-p.costo), b: moneyCorto(-pBase.costo) },
                { k: "Margen bruto", v: moneyCorto(p.margenBruto), b: moneyCorto(pBase.margenBruto) },
                { k: "Gasto operativo", v: moneyCorto(-p.gastoOperativo), b: moneyCorto(-pBase.gastoOperativo) },
                { k: "Costo del inventario", v: moneyCorto(-p.costoInventario), b: moneyCorto(-pBase.costoInventario) },
                { k: "EBITDA", v: moneyCorto(p.ebitda), b: moneyCorto(pBase.ebitda) },
              ].map((r, i, arr) => (
                <div
                  className="row"
                  key={r.k}
                  style={
                    i === arr.length - 1
                      ? { borderTop: "2px solid var(--axis)", fontWeight: 700 }
                      : undefined
                  }
                >
                  <div className="who">
                    <strong style={{ fontWeight: i === arr.length - 1 ? 700 : 600 }}>{r.k}</strong>
                    {activo.id !== "base" ? <span>Base: {r.b}</span> : null}
                  </div>
                  <div className="val num">{r.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>EBITDA por trimestre</h3>
            <p className="sub">
              La estacionalidad del portafolio concentra el resultado en el último trimestre.
            </p>
            <Columnas datos={trimestres} />
            <div className="tfoot">
              <span>Escenario {activo.nombre}</span>
              <Link className="btn ghost sm" href="/resultados">
                Ver el estado de resultados
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="cols-2">
        <div className="card">
          <h3>Margen por colección</h3>
          <p className="sub">
            El tamaño es el margen absoluto; la intensidad, el porcentaje de margen. Las piezas
            grandes y claras son las que mueven volumen con margen bajo.
          </p>
          <Treemap datos={baldosas} />
        </div>

        <div className="card">
          <h3>Proyección por colección</h3>
          <p className="sub">Doce meses bajo el escenario {activo.nombre}.</p>
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Colección</th>
                  <th>Segmento</th>
                  <th className="n">Unidades</th>
                  <th className="n">Ingreso</th>
                  <th className="n">Margen</th>
                  <th className="n">Margen %</th>
                </tr>
              </thead>
              <tbody>
                {p.lineas.map((l) => (
                  <tr key={l.coleccionId}>
                    <td className="name">
                      <strong>{l.nombre}</strong>
                    </td>
                    <td>{l.segmento}</td>
                    <td className="n">{fmt(Math.round(l.totalUnidades))}</td>
                    <td className="n">{moneyCorto(l.totalIngreso)}</td>
                    <td className="n">{moneyCorto(l.totalMargen)}</td>
                    <td className="n">{pct(l.margenPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Ingreso mes a mes</h3>
        <p className="sub">
          Escenario {activo.nombre} contra Base. Diciembre concentra el doble de un mes promedio.
        </p>
        <div className="tablewrap" style={{ maxHeight: "none" }}>
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                {MESES.map((m) => (
                  <th key={m} className="n">
                    {m}
                  </th>
                ))}
                <th className="n">Año</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="name">
                  <strong>Ingreso</strong>
                </td>
                {p.ingresoMes.map((v, i) => (
                  <td key={i} className="n">
                    {moneyCorto(v)}
                  </td>
                ))}
                <td className="n">
                  <strong>{moneyCorto(p.ingreso)}</strong>
                </td>
              </tr>
              <tr>
                <td className="name">Margen bruto</td>
                {p.margenMes.map((v, i) => (
                  <td key={i} className="n">
                    {moneyCorto(v)}
                  </td>
                ))}
                <td className="n">
                  <strong>{moneyCorto(p.margenBruto)}</strong>
                </td>
              </tr>
              <tr>
                <td className="name">EBITDA</td>
                {p.ebitdaMes.map((v, i) => (
                  <td key={i} className="n" style={{ color: v < 0 ? "var(--crit-ink)" : undefined }}>
                    {moneyCorto(v)}
                  </td>
                ))}
                <td className="n">
                  <strong>{moneyCorto(p.ebitda)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="note">
          Cifras de demostración. Las fórmulas de propagación están declaradas en el código y son
          discutibles renglón por renglón: unidades = base × crecimiento × efecto precio × servicio ×
          mercadotecnia.
        </p>
      </div>
    </div>
  );
}
