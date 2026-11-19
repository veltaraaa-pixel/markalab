"use client";

import { useState, type ReactNode } from "react";
import { fmt, moneyCorto } from "@/lib/engine";

type Punto = { et: string; a: number; b: number; pie?: string };

/* ------------------------------------------------------------------ *
 * Dos series en el tiempo: sell-in contra sell-out
 * ------------------------------------------------------------------ */

export function Lineas({
  datos,
  etiquetaA,
  etiquetaB,
  alto = 250,
}: {
  datos: Punto[];
  etiquetaA: string;
  etiquetaB: string;
  alto?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640,
    H = alto,
    L = 54,
    R = 64,
    T = 14,
    B = 30;
  const max = Math.max(...datos.flatMap((d) => [d.a, d.b])) * 1.15 || 10;
  const iw = W - L - R,
    ih = H - T - B;
  const X = (i: number) => L + (iw / Math.max(1, datos.length - 1)) * i;
  const Y = (v: number) => T + ih - (v / max) * ih;
  const paso = Math.max(200, Math.round(max / 4 / 200) * 200);

  const linea = (k: "a" | "b") =>
    datos.map((d, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(d[k]).toFixed(1)}`).join(" ");
  const area = (k: "a" | "b") =>
    `${linea(k)} L${X(datos.length - 1).toFixed(1)} ${Y(0)} L${X(0).toFixed(1)} ${Y(0)} Z`;

  const d = hover !== null ? datos[hover] : null;

  return (
    <div className="chartwrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${etiquetaA} contra ${etiquetaB} por semana`}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const x = ((e.clientX - r.left) * W) / r.width;
          const i = Math.round((x - L) / (iw / Math.max(1, datos.length - 1)));
          setHover(Math.max(0, Math.min(datos.length - 1, i)));
        }}
      >
        <defs>
          <linearGradient id="gradB" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--s2)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--s2)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: Math.floor(max / paso) + 1 }, (_, i) => i * paso).map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="var(--grid)" />
            <text
              x={L - 9}
              y={Y(v) + 4}
              textAnchor="end"
              fontSize="10.5"
              fill="var(--ink-3)"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {fmt(v)}
            </text>
          </g>
        ))}
        <line x1={L} x2={W - R} y1={Y(0)} y2={Y(0)} stroke="var(--axis)" />
        {datos.map((p, i) =>
          datos.length <= 14 || i % 2 === 0 ? (
            <text
              key={i}
              x={X(i)}
              y={H - 10}
              textAnchor="middle"
              fontSize="10.5"
              fill="var(--ink-3)"
            >
              {p.et}
            </text>
          ) : null
        )}
        <path d={area("b")} fill="url(#gradB)" />
        <path d={linea("a")} fill="none" stroke="var(--s1)" strokeWidth="2.2" strokeLinejoin="round" />
        <path d={linea("b")} fill="none" stroke="var(--s2)" strokeWidth="2.2" strokeLinejoin="round" />
        {datos.map((p, i) => (
          <g key={i}>
            <circle cx={X(i)} cy={Y(p.a)} r="3.4" fill="var(--s1)" stroke="var(--surface)" strokeWidth="1.6" />
            <circle cx={X(i)} cy={Y(p.b)} r="3.4" fill="var(--s2)" stroke="var(--surface)" strokeWidth="1.6" />
          </g>
        ))}
        {hover !== null ? (
          <line
            x1={X(hover)}
            x2={X(hover)}
            y1={T}
            y2={T + ih}
            stroke="var(--axis)"
            strokeDasharray="3 3"
          />
        ) : null}
        <text x={W - R + 8} y={Y(datos[datos.length - 1].a) + 4} fontSize="11.5" fontWeight="600" fill="var(--s1)">
          {etiquetaA}
        </text>
        <text x={W - R + 8} y={Y(datos[datos.length - 1].b) + 4} fontSize="11.5" fontWeight="600" fill="var(--s2)">
          {etiquetaB}
        </text>
      </svg>
      {d ? (
        <div
          className="tip"
          style={{
            left: `${(X(hover!) / W) * 100}%`,
            top: `${(Y(Math.max(d.a, d.b)) / H) * 100}%`,
          }}
        >
          <div className="t">{d.pie ?? d.et}</div>
          <div className="r">
            <span>
              <i style={{ background: "var(--s1)", display: "inline-block", width: 9, height: 9, borderRadius: 2, marginRight: 6 }} />
              {etiquetaA}
            </span>
            <b>{fmt(d.a)}</b>
          </div>
          <div className="r">
            <span>
              <i style={{ background: "var(--s2)", display: "inline-block", width: 9, height: 9, borderRadius: 2, marginRight: 6 }} />
              {etiquetaB}
            </span>
            <b>{fmt(d.b)}</b>
          </div>
          <div className="r">
            <span>Diferencia</span>
            <b>
              {d.a - d.b >= 0 ? "+" : ""}
              {fmt(d.a - d.b)}
            </b>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Barras horizontales con línea de referencia
 * ------------------------------------------------------------------ */

export type Barra = { n: string; v: number; c: string; lbl: string; tip?: ReactNode };

export function Barras({
  datos,
  referencia,
  etiquetaRef,
  anchoEtiqueta = 150,
}: {
  datos: Barra[];
  referencia?: number;
  etiquetaRef?: string;
  anchoEtiqueta?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640,
    L = anchoEtiqueta,
    R = 86,
    T = referencia ? 30 : 10,
    B = 26;
  const bh = 22,
    gap = 12;
  const H = T + datos.length * (bh + gap) + B;
  let max = Math.max(...datos.map((d) => d.v)) * 1.1 || 1;
  if (referencia) max = Math.max(max, referencia * 1.4);
  const iw = W - L - R;
  const X = (v: number) => L + (v / max) * iw;

  return (
    <div className="chartwrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Comparación por categoría">
        {datos.map((d, i) => {
          const y = T + i * (bh + gap);
          return (
            <g
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <text x={L - 11} y={y + bh / 2 + 4} textAnchor="end" fontSize="12" fill="var(--ink)">
                {d.n}
              </text>
              <rect x={L} y={y} width={iw} height={bh} rx="4" fill="var(--surface-2)" />
              <rect
                x={L}
                y={y}
                width={Math.max(3, X(d.v) - L)}
                height={bh}
                rx="4"
                fill={d.c}
                opacity={hover === null || hover === i ? 1 : 0.45}
              />
              <text
                x={X(d.v) + 9}
                y={y + bh / 2 + 4}
                fontSize="12"
                fontWeight="600"
                fill="var(--ink)"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {d.lbl}
              </text>
            </g>
          );
        })}
        {referencia ? (
          <>
            <line
              x1={X(referencia)}
              x2={X(referencia)}
              y1={T - 14}
              y2={H - B}
              stroke="var(--ink-2)"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            <text x={X(referencia) + 7} y={T - 18} fontSize="10.5" fontWeight="600" fill="var(--ink-2)">
              {etiquetaRef}
            </text>
          </>
        ) : null}
      </svg>
      {hover !== null && datos[hover].tip ? (
        <div className="tip" style={{ left: "50%", top: `${((T + hover * (bh + gap)) / H) * 100}%` }}>
          <div className="t">{datos[hover].n}</div>
          {datos[hover].tip}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Mapa de árbol: margen por colección
 * ------------------------------------------------------------------ */

export type Baldosa = { nombre: string; valor: number; intensidad: number; nota: string };

export function Treemap({ datos }: { datos: Baldosa[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640,
    H = 300;
  const total = datos.reduce((a, d) => a + d.valor, 0) || 1;

  // Squarify sencillo por filas
  const cajas: { x: number; y: number; w: number; h: number; d: Baldosa; i: number }[] = [];
  let y = 0,
    i = 0;
  const porFila = [3, 3, 4];
  let fila = 0;
  while (i < datos.length && fila < porFila.length + 2) {
    const n = Math.min(porFila[Math.min(fila, porFila.length - 1)], datos.length - i);
    const grupo = datos.slice(i, i + n);
    const suma = grupo.reduce((a, d) => a + d.valor, 0) || 1;
    const h = Math.max(42, (suma / total) * H);
    let x = 0;
    grupo.forEach((d, j) => {
      const w = (d.valor / suma) * W;
      cajas.push({ x, y, w, h: Math.min(h, H - y), d, i: i + j });
      x += w;
    });
    y += h;
    i += n;
    fila++;
    if (y >= H) break;
  }

  return (
    <div className="chartwrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Margen por colección">
        {cajas.map((c) => {
          const fuerte = c.d.intensidad;
          return (
            <g
              key={c.i}
              onMouseEnter={() => setHover(c.i)}
              onMouseLeave={() => setHover(null)}
            >
              <rect
                x={c.x + 1}
                y={c.y + 1}
                width={Math.max(0, c.w - 2)}
                height={Math.max(0, c.h - 2)}
                rx="6"
                fill="var(--s1)"
                fillOpacity={0.14 + fuerte * 0.62}
                stroke="var(--surface)"
                strokeWidth="2"
                opacity={hover === null || hover === c.i ? 1 : 0.6}
              />
              {c.w > 68 && c.h > 34 ? (
                <>
                  <text
                    x={c.x + 11}
                    y={c.y + 21}
                    fontSize="12"
                    fontWeight="600"
                    fill={fuerte > 0.55 ? "#fff" : "var(--ink)"}
                  >
                    {c.d.nombre}
                  </text>
                  <text
                    x={c.x + 11}
                    y={c.y + 37}
                    fontSize="11"
                    fill={fuerte > 0.55 ? "rgba(255,255,255,.85)" : "var(--ink-2)"}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {moneyCorto(c.d.valor)}
                  </text>
                </>
              ) : null}
            </g>
          );
        })}
      </svg>
      {hover !== null ? (
        <div
          className="tip"
          style={{
            left: `${((cajas[hover].x + cajas[hover].w / 2) / W) * 100}%`,
            top: `${(cajas[hover].y / H) * 100}%`,
          }}
        >
          <div className="t">{cajas[hover].d.nombre}</div>
          <div className="r">
            <span>Margen</span>
            <b>{moneyCorto(cajas[hover].d.valor)}</b>
          </div>
          <div className="r">
            <span>{cajas[hover].d.nota}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Minigráfica de 12 semanas
 * ------------------------------------------------------------------ */

export function Sparkline({ valores, color = "var(--s1)" }: { valores: number[]; color?: string }) {
  if (!valores.length) return null;
  const W = 72,
    H = 20;
  const max = Math.max(...valores) || 1;
  const d = valores
    .map((v, i) => `${i ? "L" : "M"}${((i / (valores.length - 1)) * W).toFixed(1)} ${(H - (v / max) * H).toFixed(1)}`)
    .join(" ");
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Columnas: EBITDA por trimestre, con negativos
 * ------------------------------------------------------------------ */

export function Columnas({ datos }: { datos: { et: string; v: number }[] }) {
  const W = 420,
    H = 170,
    T = 16,
    B = 26,
    L = 10;
  const max = Math.max(...datos.map((d) => Math.abs(d.v))) * 1.2 || 1;
  const ih = H - T - B;
  const cero = T + ih / 2 + (max > 0 ? 0 : 0);
  const Y = (v: number) => cero - (v / max) * (ih / 2);
  const bw = (W - L * 2) / datos.length - 14;

  return (
    <div className="chartwrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Resultado por trimestre">
        <line x1={L} x2={W - L} y1={cero} y2={cero} stroke="var(--axis)" />
        {datos.map((d, i) => {
          const x = L + i * ((W - L * 2) / datos.length) + 7;
          const y = d.v >= 0 ? Y(d.v) : cero;
          const h = Math.max(2, Math.abs(Y(d.v) - cero));
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={bw}
                height={h}
                rx="4"
                fill={d.v >= 0 ? "var(--s1)" : "var(--crit)"}
              />
              <text
                x={x + bw / 2}
                y={d.v >= 0 ? y - 6 : y + h + 13}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="600"
                fill="var(--ink)"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {moneyCorto(d.v)}
              </text>
              <text
                x={x + bw / 2}
                y={H - 8}
                textAnchor="middle"
                fontSize="10.5"
                fill="var(--ink-3)"
              >
                {d.et}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
