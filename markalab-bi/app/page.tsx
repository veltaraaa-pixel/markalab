"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useBI } from "@/lib/store";
import { Tile, Chip, Mono } from "@/components/ui";
import { Lineas, Barras, Sparkline } from "@/components/charts";
import {
  fmt,
  money,
  moneyCorto,
  pct,
  porEstado,
  clasificar,
  SITUACIONES,
  PARAMS,
  type Combo,
} from "@/lib/engine";
import { proyectar, ESCENARIOS_BASE } from "@/lib/plan";

export default function Resumen() {
  const { data, vista, ind, filtro, setEstado } = useBI();

  const indice = ind.sellIn > 0 ? (ind.sellOut / ind.sellIn) * 100 : 0;
  const brecha = ind.sellIn - ind.sellOut;

  const serie = useMemo(() => {
    const prop = data.combos.length ? vista.length / data.combos.length : 1;
    return data.serie.map((s) => ({
      et: s.etiqueta,
      pie: `Semana ${s.semana} de 2026`,
      a: Math.round(s.sellIn * prop),
      b: Math.round(s.sellOut * prop),
    }));
  }, [data, vista]);

  const porCadena = useMemo(() => {
    return data.cadenas
      .map((cd) => {
        const f = vista.filter((c) => c.sucursal.cadenaId === cd.id);
        const inv = f.reduce((a, c) => a + c.inv, 0);
        const so = f.reduce((a, c) => a + c.so, 0);
        const cob = so > 0.05 ? inv / so : 0;
        const sobre = f.filter((c) => c.clase === "alto" || c.clase === "saturado").length;
        const cl = clasificar({ cob, so, inv, sucursal: { reporta: true } } as Combo, filtro.umbral);
        return {
          n: cd.nombre,
          v: cob,
          c:
            cl === "saturado"
              ? "var(--crit)"
              : cl === "alto"
                ? "var(--serious)"
                : cl === "quiebre"
                  ? "var(--warn)"
                  : "var(--good)",
          lbl: `${fmt(cob, 1)} sem`,
          tip: (
            <>
              <div className="r">
                <span>Inventario</span>
                <b>{fmt(inv)} pzas</b>
              </div>
              <div className="r">
                <span>Sobre umbral</span>
                <b>
                  {sobre} de {f.length}
                </b>
              </div>
              <div className="r">
                <span>Capital parado</span>
                <b>{moneyCorto(f.reduce((a, c) => a + c.capital, 0))}</b>
              </div>
            </>
          ),
        };
      })
      .filter((x) => x.v > 0)
      .sort((a, b) => b.v - a.v);
  }, [data.cadenas, vista, filtro.umbral]);

  const estados = useMemo(() => porEstado(vista, filtro.umbral), [vista, filtro.umbral]);
  const peores = estados.slice(0, 5);

  const atender = useMemo(() => {
    const sat = vista
      .filter((c) => c.clase === "saturado")
      .sort((a, b) => b.capital - a.capital)
      .slice(0, 4);
    const qui = vista
      .filter((c) => c.clase === "quiebre")
      .sort((a, b) => b.perdida - a.perdida)
      .slice(0, 4);
    return [...sat, ...qui].sort((a, b) => b.impacto - a.impacto);
  }, [vista]);

  const corregido = useMemo(() => {
    const base = proyectar(ESCENARIOS_BASE[0], vista, ind.perdida, ind.capital);
    const corr = proyectar(ESCENARIOS_BASE[2], vista, ind.perdida, ind.capital);
    return { base, corr, delta: corr.ebitda - base.ebitda };
  }, [vista, ind.perdida, ind.capital]);

  return (
    <div className="view">
      <div className="tiles">
        <Tile
          k="Sell-out 12 semanas"
          v={fmt(ind.sellOut)}
          u="pzas"
          n="Vendido al consumidor"
        />
        <Tile k="Sell-in 12 semanas" v={fmt(ind.sellIn)} u="pzas" n="Embarcado al canal" />
        <Tile
          k="Índice de desplazamiento"
          v={fmt(indice, 1)}
          u="%"
          tono={indice < 90 ? "flag" : "ok"}
          n={indice < 90 ? "Se embarca más de lo que se desplaza" : "Embarque y desplazamiento en línea"}
        />
        <Tile
          k="Cobertura promedio"
          v={fmt(ind.cobertura, 1)}
          u="sem"
          tono={ind.cobertura > filtro.umbral ? "flag" : undefined}
          n={`Umbral configurado: ${filtro.umbral} semanas`}
        />
        <Tile
          k="Capital inmovilizado"
          v={moneyCorto(ind.capital)}
          tono="flag"
          n={`${fmt(ind.excedente)} piezas sobre el umbral`}
        />
        <Tile
          k="Venta perdida semanal"
          v={moneyCorto(ind.perdida)}
          tono="flag"
          n={`${fmt(ind.quiebres)} combinaciones en cero`}
        />
      </div>

      <div className="cols-2">
        <div className="card">
          <h3>Sell-in contra sell-out por semana</h3>
          <p className="sub">
            {brecha > 0
              ? `En 12 semanas se embarcaron ${fmt(brecha)} piezas más de las que se desplazaron. Ese excedente es el que satura el anaquel.`
              : "El desplazamiento va por delante del embarque en el periodo."}
          </p>
          <Lineas datos={serie} etiquetaA="Sell-in" etiquetaB="Sell-out" alto={260} />
          <div className="legend">
            <span>
              <i style={{ background: "var(--s1)" }} />
              Sell-in · embarcado al canal
            </span>
            <span>
              <i style={{ background: "var(--s2)" }} />
              Sell-out · vendido al consumidor
            </span>
          </div>
          <p className="note">
            Los cuatro picos de la línea azul son los embarques de cierre de mes. Ninguno
            corresponde a un repunte de la demanda.
          </p>
        </div>

        <div className="card">
          <h3>Semanas de cobertura por cadena</h3>
          <p className="sub">
            Inventario en canal dividido entre el desplazamiento semanal.
            {porCadena.length
              ? ` ${porCadena[0].n} es la cadena con más semanas sobre el anaquel.`
              : ""}
          </p>
          <Barras
            datos={porCadena}
            referencia={filtro.umbral}
            etiquetaRef={`umbral ${filtro.umbral} semanas`}
            anchoEtiqueta={168}
          />
        </div>
      </div>

      <div className="cols-2">
        <div className="card">
          <h3>Qué atender esta semana</h3>
          <p className="sub">
            Las combinaciones de mayor impacto en pesos: capital parado más venta perdida de las
            próximas cuatro semanas.
          </p>
          <div className="rows">
            {atender.length === 0 ? (
              <div className="empty">Sin alertas con los filtros actuales.</div>
            ) : (
              atender.map((c) => (
                <div className="row" key={c.id}>
                  <div className="who" style={{ display: "flex", gap: 9, alignItems: "center" }}>
                    <Mono cadenaId={c.sucursal.cadenaId} />
                    <div style={{ minWidth: 0 }}>
                      <strong>{c.sucursal.nombre}</strong>
                      <span>
                        {c.modelo.sku} · {c.coleccion.nombre} · {c.sucursal.ciudad}
                      </span>
                    </div>
                  </div>
                  <Sparkline
                    valores={c.hist}
                    color={c.clase === "quiebre" ? "var(--warn)" : "var(--s1)"}
                  />
                  <Chip clase={c.clase} />
                  <div className="val num">{moneyCorto(c.impacto)}</div>
                </div>
              ))
            )}
          </div>
          <div className="tfoot">
            <span>Ordenado por impacto en pesos</span>
            <Link className="btn ghost sm" href="/ejecucion">
              Ver todo y actuar
            </Link>
          </div>
        </div>

        <div className="card">
          <h3>Estados con mayor impacto</h3>
          <p className="sub">Clic en un estado para filtrar toda la plataforma por esa plaza.</p>
          <div className="rows">
            {peores.map((e) => (
              <div
                className="row clic"
                key={e.estado.id}
                onClick={() => setEstado(e.estado.id)}
                tabIndex={0}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter") setEstado(e.estado.id);
                }}
              >
                <div className="who">
                  <strong>{e.estado.nombre}</strong>
                  <span>
                    {fmt(e.sucursales)} sucursales · {fmt(e.combos)} combinaciones
                  </span>
                </div>
                <Chip clase={e.clase} />
                <div className="val num">{moneyCorto(e.impacto)}</div>
              </div>
            ))}
          </div>
          <div className="tfoot">
            <span>
              {estados.filter((e) => e.clase === "sano").length} estados operando dentro del umbral
            </span>
            <Link className="btn ghost sm" href="/mapa">
              Abrir el mapa
            </Link>
          </div>
        </div>
      </div>

      <div className="card" style={{ borderColor: "color-mix(in srgb, var(--accent) 35%, var(--hair))" }}>
        <h3>Lo que vale corregir el canal</h3>
        <p className="sub">
          Comparación entre dejar la operación como está y el escenario que ataca la saturación.
          Ambos proyectan doce meses sobre las mismas cifras de hoy.
        </p>
        <div className="tiles" style={{ marginTop: 12 }}>
          <Tile
            k="EBITDA sin cambiar nada"
            v={moneyCorto(corregido.base.ebitda)}
            n={`${pct(corregido.base.ebitdaPct)} sobre ingreso`}
          />
          <Tile
            k="EBITDA con el canal corregido"
            v={moneyCorto(corregido.corr.ebitda)}
            tono="ok"
            n={`${pct(corregido.corr.ebitdaPct)} sobre ingreso`}
          />
          <Tile
            k="Diferencia"
            v={moneyCorto(corregido.delta)}
            tono="accent"
            n="Asumiendo cinco puntos de crecimiento, no ocho"
          />
          <Tile
            k="Caja liberada"
            v={moneyCorto(corregido.corr.cajaLiberada)}
            tono="accent"
            n="Menos días de inventario y liquidación del envejecido"
          />
        </div>
        <p className="note">
          El argumento no es vender más. Es dejar de embarcar a plazas que ya no pueden desplazar,
          mover lo que ya está pagado y recuperar la venta que hoy se pierde por quiebre.{" "}
          <Link href="/planeacion" style={{ color: "var(--accent-ink)" }}>
            Ver el modelo completo
          </Link>
          .
        </p>
      </div>

      <div className="card">
        <h3>Situaciones visibles en estos datos</h3>
        <p className="sub">
          Cada una es comprobable en la plataforma. No son ejemplos: salen del mismo corte.
        </p>
        <div className="rows">
          {SITUACIONES.slice(0, 6).map((s) => (
            <div className="row" key={s.id}>
              <div className="who" style={{ flex: "1 1 100%" }}>
                <strong>{s.titulo}</strong>
                <span>{s.resumen}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="note">
          Corte {PARAMS.ventana} semanas de promedio · cifras de demostración construidas con la
          estructura real del canal departamental mexicano.
        </p>
      </div>
    </div>
  );
}
