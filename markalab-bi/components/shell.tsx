"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { useBI } from "@/lib/store";
import { CORTE, fmt, filtrosActivos } from "@/lib/engine";
import { CIUDADES, modelosDe, MODELOS } from "@/lib/catalog";

const SECCIONES = [
  {
    grupo: "Ejecución",
    items: [
      { href: "/", etiqueta: "Resumen", clave: "resumen" },
      { href: "/mapa", etiqueta: "Mapa de alertas", clave: "mapa" },
      { href: "/ejecucion", etiqueta: "Qué atender", clave: "ejecucion" },
      { href: "/detalle", etiqueta: "Detalle por tienda", clave: "detalle" },
    ],
  },
  {
    grupo: "Planeación",
    items: [
      { href: "/planeacion", etiqueta: "Escenarios", clave: "planeacion" },
      { href: "/resultados", etiqueta: "Estado de resultados", clave: "resultados" },
    ],
  },
  {
    grupo: "Inteligencia",
    items: [
      { href: "/copiloto", etiqueta: "Copiloto", clave: "copiloto" },
      { href: "/salud", etiqueta: "Salud del dato", clave: "salud" },
    ],
  },
];

const TITULOS: Record<string, [string, string]> = {
  "/": ["Resumen", "Salud comercial del canal en una pantalla"],
  "/mapa": ["Mapa de alertas", "Semáforo por estado y bandera por sucursal"],
  "/ejecucion": ["Qué atender", "Las decisiones de esta semana, ordenadas por impacto"],
  "/detalle": ["Detalle por tienda", "Inventario y desplazamiento por sucursal y modelo"],
  "/planeacion": ["Escenarios", "Mueve un supuesto y observa cómo se propaga hasta EBITDA"],
  "/resultados": ["Estado de resultados", "Proyección del escenario activo, por trimestre"],
  "/copiloto": ["Copiloto", "Especialista en inteligencia comercial y planeación"],
  "/salud": ["Salud del dato", "Qué porcentaje del negocio es realmente visible"],
};

export function Shell({ children }: { children: ReactNode }) {
  const ruta = usePathname();
  const {
    data,
    vista,
    ind,
    filtro,
    setEstado,
    setCiudad,
    setCadena,
    setColeccion,
    setModelo,
    setUmbral,
    limpiar,
    tema,
    setTema,
  } = useBI();

  /* Las listas se encadenan: la ciudad solo ofrece las del estado elegido, y
     el modelo solo las referencias de la colección elegida. */
  const estadosConPresencia = data.estados.filter((e) =>
    data.sucursales.some((s) => s.estadoId === e.id)
  );
  const ciudades = CIUDADES.filter((c) => !filtro.estado || c.estadoId === filtro.estado);
  const modelos = filtro.coleccion ? modelosDe(filtro.coleccion) : MODELOS;
  const activos = filtrosActivos(filtro);

  const [titulo, sub] = TITULOS[ruta] ?? ["MarkaLab BI", ""];
  const alertas = vista.filter((c) => c.clase !== "sano").length;

  const badge = (clave: string) => {
    if (clave === "mapa" || clave === "ejecucion")
      return alertas > 0 ? <span className="badge alert">{fmt(alertas)}</span> : null;
    if (clave === "salud")
      return ind.coberturaReporte < 97 ? <span className="badge">{fmt(ind.coberturaReporte, 0)}%</span> : null;
    return null;
  };

  return (
    <div className="shell">
      <nav className="rail" aria-label="Secciones">
        <div className="wordmark">
          <span>MarkaLab</span>
          <span className="bi">BI</span>
        </div>
        {SECCIONES.map((s) => (
          <div key={s.grupo}>
            <div className="grp">{s.grupo}</div>
            {s.items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="nav"
                aria-current={ruta === i.href ? "page" : undefined}
              >
                {i.etiqueta}
                {badge(i.clave)}
              </Link>
            ))}
          </div>
        ))}
        <div className="foot">
          <div>
            Corte <strong style={{ color: "var(--chrome-ink)" }}>{CORTE.etiqueta}</strong>
          </div>
          <div>
            {fmt(data.sucursales.length)} sucursales · {data.colecciones.length} colecciones
          </div>
          <button
            className="btn ghost sm"
            style={{
              background: "transparent",
              color: "var(--chrome-ink-2)",
              borderColor: "rgba(255,255,255,.15)",
            }}
            onClick={() => setTema(tema === "dark" ? "light" : "dark")}
          >
            {tema === "dark" ? "Tema claro" : "Tema oscuro"}
          </button>
        </div>
      </nav>

      <div className="main">
        <header className="topbar">
          <div>
            <h2>{titulo}</h2>
            <div className="sub">{sub}</div>
          </div>
          <div className="spacer" />
          <label className="sel">
            <span>Estado</span>
            <select value={filtro.estado ?? ""} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Todos</option>
              {estadosConPresencia.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="sel">
            <span>Ciudad</span>
            <select value={filtro.ciudad ?? ""} onChange={(e) => setCiudad(e.target.value)}>
              <option value="">
                {filtro.estado ? `Todas (${ciudades.length})` : "Todas"}
              </option>
              {ciudades.map((c) => (
                <option key={`${c.estadoId}-${c.ciudad}`} value={c.ciudad}>
                  {c.ciudad}
                  {!filtro.estado ? ` · ${c.estadoId}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="sel">
            <span>Cadena</span>
            <select value={filtro.cadena ?? ""} onChange={(e) => setCadena(e.target.value)}>
              <option value="">Todas</option>
              {data.cadenas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="sel">
            <span>Colección</span>
            <select value={filtro.coleccion ?? ""} onChange={(e) => setColeccion(e.target.value)}>
              <option value="">Todas</option>
              {data.colecciones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="sel">
            <span>Modelo</span>
            <select value={filtro.modelo ?? ""} onChange={(e) => setModelo(e.target.value)}>
              <option value="">
                {filtro.coleccion ? `Todos (${modelos.length})` : "Todos"}
              </option>
              {modelos.map((m) => (
                <option key={m.sku} value={m.sku}>
                  {m.sku} · {m.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="sel">
            <span>Umbral</span>
            <select value={filtro.umbral} onChange={(e) => setUmbral(Number(e.target.value))}>
              {[8, 10, 12, 14, 16].map((u) => (
                <option key={u} value={u}>
                  {u} semanas
                </option>
              ))}
            </select>
          </label>
          {activos > 0 ? (
            <button className="btn ghost sm" onClick={limpiar} title="Quitar todos los filtros">
              Quitar filtros
              <span
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "0 6px",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {activos}
              </span>
            </button>
          ) : null}
        </header>
        {children}
      </div>
    </div>
  );
}
