"use client";

import { useMemo, useState } from "react";
import { GEO_ESTADOS, LIENZO } from "@/lib/geo";
import { cadenaPorId } from "@/lib/catalog";
import {
  fmt,
  moneyCorto,
  ETIQUETA_CLASE,
  type ClaseEstado,
  type ResumenEstado,
  type ResumenSucursal,
} from "@/lib/engine";

const RELLENO: Record<ClaseEstado, string> = {
  sano: "var(--good)",
  quiebre: "var(--warn)",
  alto: "var(--serious)",
  saturado: "var(--crit)",
};

/** Opacidad del relleno según la intensidad del problema del estado. */
function intensidad(r: ResumenEstado, maxImpacto: number) {
  if (r.clase === "sano") return 0.2;
  const p = maxImpacto > 0 ? r.impacto / maxImpacto : 0;
  return 0.3 + Math.min(0.55, Math.sqrt(p) * 0.55);
}

type Bandera = {
  suc: ResumenSucursal;
  x: number;
  y: number;
  gx: number;
  gy: number;
};

/**
 * Coloca una bandera por sucursal con alerta cerca del centroide de su estado
 * y las separa hasta que ninguna se encima.
 */
function colocar(
  sucs: ResumenSucursal[],
  porEstado: Map<string, { cx: number; cy: number }>
): Bandera[] {
  const grupos = new Map<string, ResumenSucursal[]>();
  for (const s of sucs) {
    const k = s.sucursal.estadoId;
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k)!.push(s);
  }

  const puntos: Bandera[] = [];
  for (const [estadoId, lista] of grupos) {
    const c = porEstado.get(estadoId);
    if (!c) continue;
    lista.forEach((suc, i) => {
      // espiral compacta alrededor del centroide
      const ang = i * 2.39996;
      const rad = i === 0 ? 0 : 9 + Math.sqrt(i) * 9;
      puntos.push({
        suc,
        gx: c.cx,
        gy: c.cy,
        x: c.cx + Math.cos(ang) * rad,
        y: c.cy + Math.sin(ang) * rad * 0.8,
      });
    });
  }

  // Separación: el paño va de x−11 a x+13 y la chincheta llega a x+17, con
  // 25 px de alto contando el asta. Se deja holgura para que nada se encime.
  const RX = 30,
    RY = 25;
  for (let it = 0; it < 260; it++) {
    for (let i = 0; i < puntos.length; i++) {
      for (let j = i + 1; j < puntos.length; j++) {
        const a = puntos[i],
          b = puntos[j];
        const dx = b.x - a.x,
          dy = b.y - a.y;
        const sx = Math.abs(dx) / RX,
          sy = Math.abs(dy) / RY;
        if (sx < 1 && sy < 1) {
          const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
          const emp = (1 - Math.max(sx, sy)) * 5;
          puntos[i].x -= (dx / d) * emp;
          puntos[i].y -= (dy / d) * emp;
          puntos[j].x += (dx / d) * emp;
          puntos[j].y += (dy / d) * emp;
        }
      }
    }
    for (const p of puntos) {
      p.x = Math.max(18, Math.min(LIENZO.w - 18, p.x));
      p.y = Math.max(26, Math.min(LIENZO.h - 10, p.y));
    }
  }
  return puntos;
}

export function MapaMexico({
  estados,
  sucursales,
  onEstado,
  onSucursal,
}: {
  estados: ResumenEstado[];
  sucursales: ResumenSucursal[];
  onEstado: (id: string) => void;
  onSucursal: (clave: string) => void;
  onNota?: (n: string) => void;
}) {
  const [hoverEstado, setHoverEstado] = useState<string | null>(null);
  const [hoverSuc, setHoverSuc] = useState<string | null>(null);

  const porId = useMemo(() => new Map(estados.map((e) => [e.estado.id, e])), [estados]);
  const centroides = useMemo(
    () => new Map(GEO_ESTADOS.map((g) => [g.id, { cx: g.cx, cy: g.cy }])),
    []
  );
  const maxImpacto = useMemo(
    () => Math.max(...estados.map((e) => e.impacto), 1),
    [estados]
  );

  // Solo las sucursales con alerta llevan bandera, y a nivel nacional solo las
  // de mayor impacto: noventa banderas encimadas no se leen de un vistazo.
  // Al filtrar por un estado se muestran todas las de esa plaza.
  const conAlerta = useMemo(
    () => sucursales.filter((s) => s.clase !== "sano"),
    [sucursales]
  );
  const visibles = useMemo(() => {
    const ordenadas = [...conAlerta].sort(
      (a, b) => b.capital + b.perdida * 4 - (a.capital + a.perdida * 4)
    );
    const estadosPresentes = new Set(conAlerta.map((s) => s.sucursal.estadoId));
    return estadosPresentes.size <= 3 ? ordenadas : ordenadas.slice(0, 26);
  }, [conAlerta]);
  const banderas = useMemo(() => colocar(visibles, centroides), [visibles, centroides]);
  const ocultas = conAlerta.length - visibles.length;

  const estadoHover = hoverEstado ? porId.get(hoverEstado) : null;
  const sucHover = hoverSuc ? banderas.find((b) => b.suc.sucursal.clave === hoverSuc) : null;

  return (
    <div className="chartwrap" style={{ marginTop: 10 }}>
      <svg
        viewBox={`0 0 ${LIENZO.w} ${LIENZO.h}`}
        role="img"
        aria-label="Mapa de alertas por estado y sucursal"
      >
        <defs>
          <filter id="sombraBandera" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Estados */}
        <g>
          {GEO_ESTADOS.map((g) => {
            const r = porId.get(g.id);
            const activo = hoverEstado === g.id;
            return (
              <path
                key={g.id}
                d={g.d}
                fill={r ? RELLENO[r.clase] : "var(--surface-2)"}
                fillOpacity={r ? intensidad(r, maxImpacto) : 0.4}
                stroke={activo ? "var(--ink)" : "var(--axis)"}
                strokeWidth={activo ? 1.6 : 0.7}
                style={{ cursor: r ? "pointer" : "default", transition: "fill-opacity .12s" }}
                onMouseEnter={() => r && setHoverEstado(g.id)}
                onMouseLeave={() => setHoverEstado(null)}
                onClick={() => r && onEstado(g.id)}
                aria-label={
                  r ? `${g.nombre}: ${ETIQUETA_CLASE[r.clase]}` : `${g.nombre}: sin presencia`
                }
              />
            );
          })}
        </g>

        {/* Banderas por sucursal con alerta */}
        <g>
          {banderas.map((b) => {
            const cad = cadenaPorId(b.suc.sucursal.cadenaId);
            const color = RELLENO[b.suc.clase];
            const activo = hoverSuc === b.suc.sucursal.clave;
            const movida =
              Math.abs(b.x - b.gx) > 12 || Math.abs(b.y - b.gy) > 12;
            return (
              <g
                key={b.suc.sucursal.clave}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoverSuc(b.suc.sucursal.clave)}
                onMouseLeave={() => setHoverSuc(null)}
                onClick={() => onSucursal(b.suc.sucursal.clave)}
                role="button"
                aria-label={`${b.suc.sucursal.nombre}: ${ETIQUETA_CLASE[b.suc.clase]}`}
              >
                {movida ? (
                  <line
                    x1={b.gx}
                    y1={b.gy}
                    x2={b.x}
                    y2={b.y + 12}
                    stroke="var(--axis)"
                    strokeWidth="0.6"
                  />
                ) : null}
                {/* asta */}
                <line
                  x1={b.x - 11}
                  y1={b.y - 11}
                  x2={b.x - 11}
                  y2={b.y + 13}
                  stroke="var(--ink-2)"
                  strokeWidth="1.1"
                />
                <circle cx={b.x - 11} cy={b.y + 13} r="1.6" fill="var(--ink-2)" />
                {/* paño con el monograma de la cadena */}
                <g filter="url(#sombraBandera)">
                  <rect
                    x={b.x - 11}
                    y={b.y - 12}
                    width="24"
                    height="15"
                    rx="2"
                    fill={cad.color}
                    stroke={activo ? "var(--ink)" : "rgba(255,255,255,.55)"}
                    strokeWidth={activo ? 1.4 : 0.8}
                  />
                  <text
                    x={b.x + 1}
                    y={b.y - 1.5}
                    textAnchor="middle"
                    fontSize="8.2"
                    fontWeight="700"
                    fill="#fff"
                    style={{ letterSpacing: "0.03em" }}
                  >
                    {cad.monograma}
                  </text>
                </g>
                {/* chincheta de severidad */}
                <circle
                  cx={b.x + 13}
                  cy={b.y - 12}
                  r="3.6"
                  fill={color}
                  stroke="var(--surface)"
                  strokeWidth="1.2"
                />
              </g>
            );
          })}
        </g>

        {ocultas > 0 ? (
          <text
            x={LIENZO.w - 8}
            y={LIENZO.h - 8}
            textAnchor="end"
            fontSize="11"
            fill="var(--ink-3)"
          >
            {`Se muestran las ${visibles.length} sucursales de mayor impacto · ${ocultas} más al filtrar por estado`}
          </text>
        ) : null}
      </svg>

      {estadoHover && !sucHover ? (
        <div
          className="tip"
          style={{
            left: `${((centroides.get(estadoHover.estado.id)?.cx ?? 0) / LIENZO.w) * 100}%`,
            top: `${((centroides.get(estadoHover.estado.id)?.cy ?? 0) / LIENZO.h) * 100}%`,
          }}
        >
          <div className="t">{estadoHover.estado.nombre}</div>
          <div className="r">
            <span>Sucursales</span>
            <b>{fmt(estadoHover.sucursales)}</b>
          </div>
          <div className="r">
            <span>Piezas en canal</span>
            <b>{fmt(estadoHover.inv)}</b>
          </div>
          <div className="r">
            <span>Cobertura</span>
            <b>{estadoHover.cob > 50 ? "∞" : fmt(estadoHover.cob, 1)} sem</b>
          </div>
          <div className="r">
            <span>Quiebres</span>
            <b>{fmt(estadoHover.quiebres)}</b>
          </div>
          <div className="r">
            <span>Impacto</span>
            <b>{moneyCorto(estadoHover.impacto)}</b>
          </div>
          <div className="r">
            <span>Estado</span>
            <b>{ETIQUETA_CLASE[estadoHover.clase]}</b>
          </div>
        </div>
      ) : null}

      {sucHover ? (
        <div
          className="tip"
          style={{
            left: `${(sucHover.x / LIENZO.w) * 100}%`,
            top: `${((sucHover.y - 14) / LIENZO.h) * 100}%`,
          }}
        >
          <div className="t">{sucHover.suc.sucursal.nombre}</div>
          <div className="r">
            <span>Combinaciones</span>
            <b>{fmt(sucHover.suc.combos)}</b>
          </div>
          <div className="r">
            <span>Piezas en canal</span>
            <b>{fmt(sucHover.suc.inv)}</b>
          </div>
          <div className="r">
            <span>Cobertura</span>
            <b>{sucHover.suc.cob > 50 ? "∞" : fmt(sucHover.suc.cob, 1)} sem</b>
          </div>
          <div className="r">
            <span>Quiebres</span>
            <b>{fmt(sucHover.suc.quiebres)}</b>
          </div>
          <div className="r">
            <span>Capital parado</span>
            <b>{moneyCorto(sucHover.suc.capital)}</b>
          </div>
          <div className="r">
            <span>Estado</span>
            <b>{ETIQUETA_CLASE[sucHover.suc.clase]}</b>
          </div>
        </div>
      ) : null}
    </div>
  );
}
