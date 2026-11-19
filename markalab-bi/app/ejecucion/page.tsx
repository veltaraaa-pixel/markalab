"use client";

import { useMemo, useState } from "react";
import { useBI } from "@/lib/store";
import { Tile, Chip, Mono, Accion, Tabla, type Col } from "@/components/ui";
import { Sparkline, Barras } from "@/components/charts";
import {
  fmt,
  money,
  moneyCorto,
  traslados,
  PARAMS,
  type Combo,
} from "@/lib/engine";

type Pestana = "todo" | "noembarcar" | "trasladar" | "resurtir" | "liquidar";

export default function Ejecucion() {
  const { vista, filtro, registrar, bitacora } = useBI();
  const [tab, setTab] = useState<Pestana>("todo");

  const sobre = useMemo(
    () => vista.filter((c) => c.clase === "alto" || c.clase === "saturado"),
    [vista]
  );
  const quiebres = useMemo(() => vista.filter((c) => c.clase === "quiebre"), [vista]);
  const viejos = useMemo(
    () => vista.filter((c) => c.edad > 360 && c.inv > 0),
    [vista]
  );
  const mover = useMemo(() => traslados(sobre, vista, 14), [sobre, vista]);

  const capital = sobre.reduce((a, c) => a + c.capital, 0);
  const perdida = quiebres.reduce((a, c) => a + c.perdida, 0);
  const fleteTotal = mover.reduce((a, t) => a + t.costo, 0);
  const recuperaTotal = mover.reduce((a, t) => a + t.recupera, 0);

  const porColeccion = useMemo(() => {
    const m = new Map<string, { n: string; perdida: number; quiebres: number }>();
    for (const c of quiebres) {
      const k = c.coleccion.id;
      if (!m.has(k)) m.set(k, { n: c.coleccion.nombre, perdida: 0, quiebres: 0 });
      const r = m.get(k)!;
      r.perdida += c.perdida;
      r.quiebres++;
    }
    return [...m.values()]
      .sort((a, b) => b.perdida - a.perdida)
      .slice(0, 7)
      .map((r) => ({
        n: r.n,
        v: r.perdida,
        c: "var(--warn)",
        lbl: moneyCorto(r.perdida),
        tip: (
          <div className="r">
            <span>Tiendas en cero</span>
            <b>{r.quiebres}</b>
          </div>
        ),
      }));
  }, [quiebres]);

  const colsCombo = (modo: "sat" | "qui" | "vie"): Col<Combo>[] => [
    {
      t: "Sucursal",
      cls: "name",
      f: (c) => (
        <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <Mono cadenaId={c.sucursal.cadenaId} />
          <span>
            <strong>{c.sucursal.plaza}</strong>
            <br />
            <span>{c.sucursal.nombre.split(" ")[0]}</span>
          </span>
        </span>
      ),
    },
    {
      t: "Modelo",
      cls: "name",
      f: (c) => (
        <>
          <strong>{c.modelo.sku}</strong>
          <br />
          <span>{c.coleccion.nombre}</span>
        </>
      ),
    },
    { t: "12 sem", f: (c) => <Sparkline valores={c.hist} color={modo === "qui" ? "var(--warn)" : "var(--s1)"} /> },
    { t: "Exist.", n: true, f: (c) => fmt(c.inv) },
    { t: "Sell-out/sem", n: true, f: (c) => fmt(c.so, 1) },
    ...(modo === "sat"
      ? ([
          { t: "Cobertura", n: true, f: (c: Combo) => (c.cob > 50 ? "∞" : fmt(c.cob, 1)) },
          { t: "Sobre umbral", n: true, f: (c: Combo) => fmt(c.exc) },
          { t: "Capital", n: true, f: (c: Combo) => moneyCorto(c.capital) },
        ] as Col<Combo>[])
      : modo === "qui"
        ? ([
            { t: "Tránsito", n: true, f: (c: Combo) => fmt(c.tr) },
            { t: "Sugerido", n: true, f: (c: Combo) => <strong>{fmt(c.sug)}</strong> },
            { t: "Venta perdida/sem", n: true, f: (c: Combo) => money(c.perdida) },
          ] as Col<Combo>[])
        : ([
            { t: "Días en canal", n: true, f: (c: Combo) => fmt(c.edad) },
            {
              t: "Valor a costo",
              n: true,
              f: (c: Combo) =>
                moneyCorto(c.inv * c.coleccion.precio * (1 - c.coleccion.margen)),
            },
          ] as Col<Combo>[])),
    { t: "Estado", f: (c) => <Chip clase={c.clase} /> },
  ];

  const pestanas: { k: Pestana; t: string; n: number }[] = [
    { k: "todo", t: "Resumen", n: 0 },
    { k: "noembarcar", t: "No embarcar", n: sobre.length },
    { k: "trasladar", t: "Trasladar", n: mover.length },
    { k: "resurtir", t: "Resurtir", n: quiebres.length },
    { k: "liquidar", t: "Liquidar", n: viejos.length },
  ];

  return (
    <div className="view">
      <div className="tiles">
        <Tile
          k="No embarcar"
          v={fmt(sobre.length)}
          tono="flag"
          n={`${moneyCorto(capital)} de capital parado`}
        />
        <Tile
          k="Traslados que pagan flete"
          v={fmt(mover.length)}
          tono="accent"
          n={`${money(fleteTotal)} de flete contra ${money(recuperaTotal)}/sem`}
        />
        <Tile
          k="Resurtir"
          v={fmt(quiebres.length)}
          tono="flag"
          n={`${moneyCorto(perdida)} de venta perdida semanal`}
        />
        <Tile
          k="Liquidar"
          v={fmt(viejos.length)}
          n={`${fmt(viejos.reduce((a, c) => a + c.inv, 0))} piezas con más de un año`}
        />
        <Tile
          k="Costo de no hacer nada"
          v={moneyCorto(perdida * 4.3 + (capital * 0.18) / 12)}
          tono="flag"
          n="Un mes más con la operación igual"
        />
        <Tile k="Decisiones registradas" v={fmt(bitacora.length)} n="En esta sesión" />
      </div>

      <div className="card" style={{ paddingTop: 12, paddingBottom: 12 }}>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {pestanas.map((x) => (
            <button
              key={x.k}
              className={`btn ${tab === x.k ? "on" : "ghost"} sm`}
              onClick={() => setTab(x.k)}
            >
              {x.t}
              {x.n ? (
                <span
                  style={{
                    background: tab === x.k ? "var(--accent)" : "var(--surface-2)",
                    color: tab === x.k ? "#fff" : "var(--ink-3)",
                    borderRadius: 999,
                    padding: "0 7px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {fmt(x.n)}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {tab === "todo" ? (
        <>
          <div className="cols-2">
            <div className="card">
              <h3>El orden de las decisiones</h3>
              <p className="sub">
                Primero mover lo que ya está pagado, después dejar de embarcar lo saturado, y solo
                al final comprometer piezas nuevas.
              </p>
              <Accion
                tipo="mv"
                titulo="1. Trasladar"
                nota={`${mover.length} movimientos dentro de la misma cadena`}
              >
                {mover.slice(0, 4).map((t, i) => (
                  <li key={i}>
                    <em>{fmt(t.piezas)} pzas</em> de <b>{t.origen.sucursal.plaza}</b> a{" "}
                    <b>{t.destino.sucursal.plaza}</b> — {t.origen.modelo.sku}. Cubre{" "}
                    <em>{fmt(t.semanas, 1)}</em> semanas y frena <em>{money(t.recupera)}</em> por
                    semana, con {money(t.costo)} de flete.
                  </li>
                ))}
                {mover.length === 0 ? <li>No hay traslados que paguen su flete con estos filtros.</li> : null}
              </Accion>
              <div style={{ height: 10 }} />
              <Accion
                tipo="no"
                titulo="2. No embarcar"
                nota={`${sobre.length} combinaciones sobre el umbral`}
              >
                {sobre
                  .slice()
                  .sort((a, b) => b.capital - a.capital)
                  .slice(0, 4)
                  .map((c) => (
                    <li key={c.id}>
                      <b>{c.sucursal.plaza}</b> · {c.modelo.sku} — <em>{fmt(c.inv)} pzas</em>,{" "}
                      {c.cob > 50 ? "∞" : fmt(c.cob, 1)} semanas, <em>{moneyCorto(c.capital)}</em> a
                      costo
                      {c.tr ? ` · ${c.tr} ya van en tránsito` : ""}
                    </li>
                  ))}
              </Accion>
              <div style={{ height: 10 }} />
              <Accion
                tipo="re"
                titulo="3. Resurtir"
                nota={`${quiebres.length} en cero con desplazamiento`}
              >
                {quiebres
                  .slice()
                  .sort((a, b) => b.perdida - a.perdida)
                  .slice(0, 4)
                  .map((c) => (
                    <li key={c.id}>
                      <b>{c.sucursal.plaza}</b> · {c.modelo.sku} — sugerido{" "}
                      <em>{fmt(c.sug)} pzas</em>, venta perdida <em>{money(c.perdida)}</em> por
                      semana
                      {c.tr ? ` · ${c.tr} en tránsito` : ""}
                    </li>
                  ))}
              </Accion>
            </div>

            <div className="card">
              <h3>Venta perdida por colección</h3>
              <p className="sub">
                Dónde duele más el quiebre. Es la lista que decide la prioridad del siguiente
                embarque.
              </p>
              {porColeccion.length ? (
                <Barras datos={porColeccion} anchoEtiqueta={140} />
              ) : (
                <div className="empty">Sin quiebres con los filtros actuales.</div>
              )}
              <p className="note">
                Estimada a precio de lista sobre el desplazamiento promedio de {PARAMS.ventana}{" "}
                semanas. Es un techo, no una cifra contable.
              </p>
            </div>
          </div>
        </>
      ) : null}

      {tab === "noembarcar" ? (
        <div className="card">
          <h3>Combinaciones sobre el umbral</h3>
          <p className="sub">
            Ordenadas por capital parado. Estas son las que no deberían recibir una pieza más hasta
            que bajen del umbral de {filtro.umbral} semanas.
          </p>
          <div className="tablewrap">
            <Tabla
              cols={colsCombo("sat")}
              filas={sobre.slice().sort((a, b) => b.capital - a.capital)}
            />
          </div>
          <div className="tfoot">
            <span>
              {fmt(sobre.length)} combinaciones · {moneyCorto(capital)} a costo
            </span>
          </div>
        </div>
      ) : null}

      {tab === "trasladar" ? (
        <div className="card">
          <h3>Traslados sugeridos</h3>
          <p className="sub">
            Solo dentro de la misma cadena: una pieza ya embarcada pertenece al retailer que la
            compró. Entre cadenas distintas no hay traslado, hay renegociación de embarque.
          </p>
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Modelo</th>
                  <th className="n">Piezas</th>
                  <th className="n">Cubre</th>
                  <th className="n">Frena/sem</th>
                  <th className="n">Flete</th>
                  <th>Alcance</th>
                </tr>
              </thead>
              <tbody>
                {mover.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty">
                        No hay traslados que cumplan los criterios con estos filtros.
                      </div>
                    </td>
                  </tr>
                ) : (
                  mover.map((t, i) => (
                    <tr key={i}>
                      <td className="name">
                        <strong>{t.origen.sucursal.plaza}</strong>
                        <br />
                        <span>{fmt(t.origen.exc)} excedentes</span>
                      </td>
                      <td className="name">
                        <strong>{t.destino.sucursal.plaza}</strong>
                        <br />
                        <span>en cero</span>
                      </td>
                      <td className="name">
                        <strong>{t.origen.modelo.sku}</strong>
                        <br />
                        <span>{t.origen.coleccion.nombre}</span>
                      </td>
                      <td className="n">
                        <strong>{fmt(t.piezas)}</strong>
                      </td>
                      <td className="n">{fmt(t.semanas, 1)} sem</td>
                      <td className="n">{money(t.recupera)}</td>
                      <td className="n">{money(t.costo)}</td>
                      <td>
                        <span className="chip neutro">
                          {t.salto === 0 ? "Misma plaza" : "Entre plazas"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="tfoot">
            <span>
              {money(fleteTotal)} de flete total contra {money(recuperaTotal)} de venta perdida
              semanal que deja de correr
            </span>
            <button
              className="btn sm"
              disabled={!mover.length}
              onClick={() =>
                registrar({
                  alertaId: "traslados",
                  titulo: `${mover.length} traslados autorizados`,
                  accion: "aceptada",
                  valor: recuperaTotal * 4 - fleteTotal,
                })
              }
            >
              Autorizar todos
            </button>
          </div>
        </div>
      ) : null}

      {tab === "resurtir" ? (
        <div className="card">
          <h3>Resurtido sugerido</h3>
          <p className="sub">
            Stock objetivo menos existencia menos unidades en tránsito. Nunca propone más que la
            brecha, y no genera ni envía órdenes: se exporta para que una persona lo capture.
          </p>
          <div className="tablewrap">
            <Tabla
              cols={colsCombo("qui")}
              filas={quiebres.slice().sort((a, b) => b.perdida - a.perdida)}
            />
          </div>
          <div className="tfoot">
            <span>
              {fmt(quiebres.reduce((a, c) => a + c.sug, 0))} piezas sugeridas ·{" "}
              {moneyCorto(perdida)} de venta perdida semanal
            </span>
          </div>
        </div>
      ) : null}

      {tab === "liquidar" ? (
        <div className="card">
          <h3>Inventario con más de un año en canal</h3>
          <p className="sub">
            Cada semana que pasa vale menos y ocupa un espacio de anaquel que el comprador puede
            reasignar a otra marca.
          </p>
          <div className="tablewrap">
            <Tabla
              cols={colsCombo("vie")}
              filas={viejos.slice().sort((a, b) => b.edad - a.edad)}
            />
          </div>
          <div className="tfoot">
            <span>
              {fmt(viejos.reduce((a, c) => a + c.inv, 0))} piezas ·{" "}
              {moneyCorto(
                viejos.reduce(
                  (a, c) => a + c.inv * c.coleccion.precio * (1 - c.coleccion.margen),
                  0
                )
              )}{" "}
              a costo
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
