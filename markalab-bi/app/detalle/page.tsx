"use client";

import { useMemo, useState } from "react";
import { useBI } from "@/lib/store";
import { Tile, Chip, Mono, Tabla, type Col } from "@/components/ui";
import { Sparkline } from "@/components/charts";
import { fmt, moneyCorto, type Combo, type ClaseEstado } from "@/lib/engine";

type Orden = "impacto" | "inv" | "cob" | "so" | "edad";

export default function Detalle() {
  const { vista } = useBI();
  const [busca, setBusca] = useState("");
  const [clase, setClase] = useState<ClaseEstado | "">("");
  const [orden, setOrden] = useState<Orden>("impacto");

  const filas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    let f = vista;
    if (clase) f = f.filter((c) => c.clase === clase);
    if (q) {
      f = f.filter((c) =>
        `${c.sucursal.nombre} ${c.sucursal.plaza} ${c.sucursal.ciudad} ${c.coleccion.nombre} ${c.modelo.sku} ${c.modelo.nombre} ${c.coleccion.segmento}`
          .toLowerCase()
          .includes(q)
      );
    }
    const key = (c: Combo) =>
      orden === "inv"
        ? c.inv
        : orden === "cob"
          ? c.cob
          : orden === "so"
            ? c.so
            : orden === "edad"
              ? c.edad
              : c.impacto;
    return [...f].sort((a, b) => key(b) - key(a));
  }, [vista, busca, clase, orden]);

  const cols: Col<Combo>[] = [
    {
      t: "Punto de venta",
      cls: "name",
      f: (c) => (
        <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <Mono cadenaId={c.sucursal.cadenaId} />
          <span>
            <strong>{c.sucursal.nombre}</strong>
            <br />
            <span>
              {c.sucursal.ciudad}
              {c.sucursal.apertura > 0 ? " · tienda nueva" : ""}
              {!c.sucursal.reporta ? " · sin reporte" : ""}
            </span>
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
          <span>{c.modelo.nombre}</span>
        </>
      ),
    },
    {
      t: "Colección",
      f: (c) => (
        <>
          {c.coleccion.nombre}
          <br />
          <span style={{ color: "var(--ink-3)" }}>{c.coleccion.segmento}</span>
        </>
      ),
    },
    { t: "Precio", n: true, f: (c) => moneyCorto(c.precio) },
    { t: "12 semanas", f: (c) => <Sparkline valores={c.hist} /> },
    { t: "Exist.", n: true, f: (c) => fmt(c.inv) },
    { t: "Tránsito", n: true, f: (c) => fmt(c.tr) },
    { t: "Sell-out/sem", n: true, f: (c) => (c.sucursal.reporta ? fmt(c.so, 1) : "—") },
    {
      t: "Cobertura",
      n: true,
      f: (c) => (!c.sucursal.reporta ? "—" : c.cob > 50 ? "∞" : fmt(c.cob, 1)),
    },
    { t: "Días en canal", n: true, f: (c) => fmt(c.edad) },
    { t: "Sugerido", n: true, f: (c) => fmt(c.sug) },
    { t: "Impacto", n: true, f: (c) => moneyCorto(c.impacto) },
    {
      t: "Estado",
      f: (c) =>
        c.sucursal.reporta ? <Chip clase={c.clase} /> : <span className="chip neutro">Sin dato</span>,
    },
  ];

  const inv = filas.reduce((a, c) => a + c.inv, 0);

  return (
    <div className="view">
      <div className="tiles">
        <Tile k="Combinaciones" v={fmt(filas.length)} n={`de ${fmt(vista.length)} en el alcance`} />
        <Tile k="Piezas en canal" v={fmt(inv)} n="En la semana de corte" />
        <Tile
          k="Desplazamiento"
          v={fmt(filas.reduce((a, c) => a + c.so, 0), 1)}
          u="pzas/sem"
          n="Promedio de ocho semanas"
        />
        <Tile
          k="Impacto acumulado"
          v={moneyCorto(filas.reduce((a, c) => a + c.impacto, 0))}
          tono="flag"
          n="Capital parado más venta perdida"
        />
      </div>

      <div className="card">
        <h3>Inventario y desplazamiento por tienda y modelo</h3>
        <p className="sub">
          El detalle crudo, sin interpretación. Es la pantalla a la que se baja cuando alguien
          pregunta por una tienda específica.
        </p>

        <div
          style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginTop: 12 }}
        >
          <label className="sel" style={{ flex: "1 1 260px" }}>
            <span>Buscar</span>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Tienda, ciudad, SKU, modelo o colección"
            />
          </label>
          <label className="sel">
            <span>Estado</span>
            <select value={clase} onChange={(e) => setClase(e.target.value as ClaseEstado | "")}>
              <option value="">Todos</option>
              <option value="saturado">Saturado</option>
              <option value="alto">Cobertura alta</option>
              <option value="sano">Sano</option>
              <option value="quiebre">Quiebre</option>
            </select>
          </label>
          <label className="sel">
            <span>Ordenar por</span>
            <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)}>
              <option value="impacto">Impacto en pesos</option>
              <option value="inv">Existencia</option>
              <option value="cob">Cobertura</option>
              <option value="so">Desplazamiento</option>
              <option value="edad">Días en canal</option>
            </select>
          </label>
        </div>

        <div className="tablewrap">
          <Tabla cols={cols} filas={filas} limite={250} />
        </div>
        <div className="tfoot">
          <span>
            Mostrando {fmt(Math.min(250, filas.length))} de {fmt(filas.length)} combinaciones
          </span>
          <span>
            Las tiendas sin reporte muestran existencia pero no cobertura: sin denominador no hay
            cálculo.
          </span>
        </div>
      </div>
    </div>
  );
}
