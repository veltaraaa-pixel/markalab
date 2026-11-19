"use client";

import { type ReactNode, useEffect } from "react";
import { cadenaPorId } from "@/lib/catalog";
import { ETIQUETA_CLASE, type ClaseEstado } from "@/lib/engine";

/* ---------- monograma de cadena ---------- */

const ICONO: Record<ClaseEstado, string> = {
  sano: "●",
  quiebre: "▼",
  alto: "▲",
  saturado: "■",
};

export function Mono({ cadenaId, titulo }: { cadenaId: string; titulo?: string }) {
  const c = cadenaPorId(cadenaId);
  return (
    <span
      className="mono"
      style={{ background: c.color }}
      title={titulo ?? c.nombre}
      aria-label={c.nombre}
    >
      {c.monograma}
    </span>
  );
}

export function Chip({ clase, texto }: { clase: ClaseEstado; texto?: string }) {
  return (
    <span className={`chip ${clase}`}>
      <b aria-hidden>{ICONO[clase]}</b>
      {texto ?? ETIQUETA_CLASE[clase]}
    </span>
  );
}

/* ---------- indicador ---------- */

export function Tile({
  k,
  v,
  u,
  n,
  tono,
  delta,
}: {
  k: string;
  v: string;
  u?: string;
  n?: ReactNode;
  tono?: "flag" | "ok" | "accent";
  delta?: { valor: string; arriba: boolean };
}) {
  return (
    <div className={`tile${tono ? " " + tono : ""}`}>
      <div className="k">{k}</div>
      <div className="v">
        {v}
        {u ? <small>{u}</small> : null}
      </div>
      {n ? (
        <div className="n">
          {delta ? (
            <span className={`delta ${delta.arriba ? "up" : "down"}`}>
              {delta.arriba ? "▲" : "▼"} {delta.valor}
            </span>
          ) : null}
          {delta ? " · " : ""}
          {n}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- panel lateral ---------- */

export function Drawer({
  abierto,
  onCerrar,
  eyebrow,
  titulo,
  pie,
  children,
}: {
  abierto: boolean;
  onCerrar: () => void;
  eyebrow: string;
  titulo: string;
  pie?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!abierto) return;
    const t = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", t);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", t);
      document.body.style.overflow = prev;
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;
  return (
    <div className="drawer">
      <div className="scrim" onClick={onCerrar} />
      <div className="panel" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="head">
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h3>{titulo}</h3>
          </div>
          <button className="x" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="body">{children}</div>
        {pie ? <div className="foot">{pie}</div> : null}
      </div>
    </div>
  );
}

/* ---------- bloque de acción ---------- */

export function Accion({
  tipo,
  titulo,
  nota,
  children,
}: {
  tipo: "no" | "mv" | "re" | "ok";
  titulo: string;
  nota?: string;
  children: ReactNode;
}) {
  return (
    <div className={`act ${tipo}`}>
      <h5>
        {titulo}
        {nota ? <span>{nota}</span> : null}
      </h5>
      <ul>{children}</ul>
    </div>
  );
}

/* ---------- tabla ---------- */

export type Col<T> = {
  t: string;
  n?: boolean;
  cls?: string;
  f: (r: T) => ReactNode;
  orden?: (r: T) => number;
};

export function Tabla<T>({
  cols,
  filas,
  limite = 200,
  onFila,
  vacio = "Ninguna fila coincide con los filtros.",
}: {
  cols: Col<T>[];
  filas: T[];
  limite?: number;
  onFila?: (r: T) => void;
  vacio?: string;
}) {
  const vis = filas.slice(0, limite);
  return (
    <table>
      <thead>
        <tr>
          {cols.map((c, i) => (
            <th key={i} className={c.n ? "n" : undefined}>
              {c.t}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {vis.length === 0 ? (
          <tr>
            <td colSpan={cols.length}>
              <div className="empty">{vacio}</div>
            </td>
          </tr>
        ) : (
          vis.map((r, i) => (
            <tr
              key={i}
              className={onFila ? "clic" : undefined}
              onClick={onFila ? () => onFila(r) : undefined}
              tabIndex={onFila ? 0 : undefined}
              onKeyDown={
                onFila
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onFila(r);
                      }
                    }
                  : undefined
              }
            >
              {cols.map((c, j) => (
                <td key={j} className={[c.n ? "n" : "", c.cls ?? ""].join(" ").trim() || undefined}>
                  {c.f(r)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
