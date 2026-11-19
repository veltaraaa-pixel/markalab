"use client";

import { useMemo, useState } from "react";
import { useBI } from "@/lib/store";
import { MapaMexico } from "@/components/mapa";
import { Tile, Chip, Mono, Drawer, Accion, Tabla, type Col } from "@/components/ui";
import { Sparkline } from "@/components/charts";
import {
  fmt,
  money,
  moneyCorto,
  porEstado,
  porSucursal,
  traslados,
  ETIQUETA_CLASE,
  type Combo,
  type ResumenEstado,
  type ResumenSucursal,
} from "@/lib/engine";
import { cadenaPorId } from "@/lib/catalog";

type Foco =
  | { tipo: "estado"; id: string }
  | { tipo: "sucursal"; clave: string }
  | null;

export default function Mapa() {
  const { vista, filtro, setEstado, registrar } = useBI();
  const [foco, setFoco] = useState<Foco>(null);

  const estados = useMemo(() => porEstado(vista, filtro.umbral), [vista, filtro.umbral]);
  const sucursales = useMemo(() => porSucursal(vista, filtro.umbral), [vista, filtro.umbral]);

  const conAlerta = sucursales.filter((s) => s.clase !== "sano");
  const saturados = estados.filter((e) => e.clase === "saturado");
  const enQuiebre = estados.filter((e) => e.clase === "quiebre");
  const sanos = estados.filter((e) => e.clase === "sano");

  // Combinaciones del foco actual
  const combosFoco = useMemo(() => {
    if (!foco) return [];
    return foco.tipo === "estado"
      ? vista.filter((c) => c.sucursal.estadoId === foco.id)
      : vista.filter((c) => c.sucursal.clave === foco.clave);
  }, [foco, vista]);

  const tituloFoco = useMemo(() => {
    if (!foco) return "";
    if (foco.tipo === "estado")
      return estados.find((e) => e.estado.id === foco.id)?.estado.nombre ?? "";
    return sucursales.find((s) => s.sucursal.clave === foco.clave)?.sucursal.nombre ?? "";
  }, [foco, estados, sucursales]);

  const resumenFoco = useMemo(() => {
    const inv = combosFoco.reduce((a, c) => a + c.inv, 0);
    const so = combosFoco.reduce((a, c) => a + c.so, 0);
    const qui = combosFoco.filter((c) => c.clase === "quiebre");
    const sobre = combosFoco.filter((c) => c.clase === "alto" || c.clase === "saturado");
    return {
      inv,
      so,
      cob: so > 0.05 ? inv / so : inv > 0 ? 99 : 0,
      exc: combosFoco.reduce((a, c) => a + c.exc, 0),
      capital: combosFoco.reduce((a, c) => a + c.capital, 0),
      perdida: qui.reduce((a, c) => a + c.perdida, 0),
      qui,
      sobre,
      pdv: new Set(combosFoco.map((c) => c.sucursal.clave)).size,
    };
  }, [combosFoco]);

  const mover = useMemo(
    () => traslados(resumenFoco.sobre, vista, 5),
    [resumenFoco.sobre, vista]
  );

  const colsEstado: Col<ResumenEstado>[] = [
    {
      t: "Estado",
      cls: "name",
      f: (e) => (
        <>
          <strong>{e.estado.nombre}</strong>
          {e.sinReporte > 0 ? <span> · {e.sinReporte} sin reporte</span> : null}
        </>
      ),
    },
    { t: "Sucursales", n: true, f: (e) => fmt(e.sucursales) },
    { t: "Combinaciones", n: true, f: (e) => fmt(e.combos) },
    { t: "Piezas en canal", n: true, f: (e) => fmt(e.inv) },
    { t: "Cobertura", n: true, f: (e) => (e.cob > 50 ? "∞" : fmt(e.cob, 1)) },
    { t: "Sobre umbral", n: true, f: (e) => fmt(e.exc) },
    { t: "Quiebres", n: true, f: (e) => fmt(e.quiebres) },
    { t: "Capital parado", n: true, f: (e) => moneyCorto(e.capital) },
    { t: "Impacto", n: true, f: (e) => <strong>{moneyCorto(e.impacto)}</strong> },
    { t: "Estado", f: (e) => <Chip clase={e.clase} /> },
  ];

  const colsCombo: Col<Combo>[] = [
    {
      t: "Sucursal",
      cls: "name",
      f: (c) => (
        <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <Mono cadenaId={c.sucursal.cadenaId} />
          <span>
            <strong>{c.sucursal.plaza}</strong>
            <br />
            <span>{cadenaPorId(c.sucursal.cadenaId).nombre}</span>
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
    { t: "12 sem", f: (c) => <Sparkline valores={c.hist} /> },
    { t: "Exist.", n: true, f: (c) => fmt(c.inv) },
    { t: "Sem.", n: true, f: (c) => (c.cob > 50 ? "∞" : fmt(c.cob, 1)) },
    { t: "Sobre umbral", n: true, f: (c) => fmt(c.exc) },
    { t: "Impacto", n: true, f: (c) => moneyCorto(c.impacto) },
    { t: "Estado", f: (c) => <Chip clase={c.clase} /> },
  ];

  const unaSucursal = resumenFoco.pdv === 1;

  return (
    <div className="view">
      <div className="tiles">
        <Tile
          k="Estados saturados"
          v={fmt(saturados.length)}
          tono={saturados.length ? "flag" : undefined}
          n={`${enQuiebre.length} en quiebre · ${sanos.length} en rango`}
        />
        <Tile
          k="Sucursales con alerta"
          v={fmt(conAlerta.length)}
          tono="flag"
          n={`de ${fmt(sucursales.length)} en la red visible`}
        />
        <Tile
          k="Capital inmovilizado"
          v={moneyCorto(estados.reduce((a, e) => a + e.capital, 0))}
          tono="flag"
          n="Excedente valorizado a costo"
        />
        <Tile
          k="Venta perdida semanal"
          v={moneyCorto(estados.reduce((a, e) => a + e.perdida, 0))}
          tono="flag"
          n="Por quiebres en toda la República"
        />
      </div>

      <div className="card">
        <h3>Semáforo nacional</h3>
        <p className="sub">
          El color del estado resume su situación. Cada bandera es una sucursal con alerta: el paño
          lleva la cadena y la chincheta, la severidad. Clic en un estado o en una bandera para ver
          qué hacer.
        </p>
        <MapaMexico
          estados={estados}
          sucursales={sucursales}
          onEstado={(id) => setFoco({ tipo: "estado", id })}
          onSucursal={(clave) => setFoco({ tipo: "sucursal", clave })}
        />
        <div className="legend">
          <span>
            <i style={{ background: "var(--good)" }} />
            En rango
          </span>
          <span>
            <i style={{ background: "var(--warn)" }} />
            Con quiebres
          </span>
          <span>
            <i style={{ background: "var(--serious)" }} />
            Cobertura alta
          </span>
          <span>
            <i style={{ background: "var(--crit)" }} />
            Saturado
          </span>
          <span style={{ marginLeft: "auto", color: "var(--ink-3)" }}>
            La intensidad del relleno es proporcional al impacto en pesos del estado.
          </span>
        </div>
      </div>

      <div className="card">
        <h3>Detalle por estado</h3>
        <p className="sub">
          Ordenado por impacto: capital parado más cuatro semanas de venta perdida.
        </p>
        <div className="tablewrap">
          <Tabla
            cols={colsEstado}
            filas={estados}
            onFila={(e) => setFoco({ tipo: "estado", id: e.estado.id })}
          />
        </div>
        <div className="tfoot">
          <span>
            {fmt(estados.length)} estados con presencia · clic en un renglón para ver qué hacer
          </span>
        </div>
      </div>

      <Drawer
        abierto={!!foco}
        onCerrar={() => setFoco(null)}
        eyebrow={
          foco?.tipo === "estado"
            ? "Estado · qué hacer con esta alerta"
            : "Sucursal · qué hacer con esta alerta"
        }
        titulo={tituloFoco}
        pie={
          <>
            <button
              className="btn sm"
              onClick={() => {
                registrar({
                  alertaId: foco?.tipo === "estado" ? foco.id : (foco?.clave ?? ""),
                  titulo: tituloFoco,
                  accion: "aceptada",
                  valor: resumenFoco.capital + resumenFoco.perdida * 4,
                });
                setFoco(null);
              }}
            >
              Marcar como atendida
            </button>
            {foco?.tipo === "estado" ? (
              <button
                className="btn ghost sm"
                onClick={() => {
                  setEstado(foco.id);
                  setFoco(null);
                }}
              >
                Filtrar toda la plataforma por este estado
              </button>
            ) : null}
            <div className="spacer" />
            <button className="btn ghost sm" onClick={() => setFoco(null)}>
              Cerrar
            </button>
          </>
        }
      >
        <div className="mini">
          <div>
            <div className="k">Piezas en canal</div>
            <div className="v">
              {fmt(resumenFoco.inv)}
              <small> pzas</small>
            </div>
          </div>
          <div>
            <div className="k">Cobertura</div>
            <div className="v">
              {resumenFoco.cob > 50 ? "∞" : fmt(resumenFoco.cob, 1)}
              <small> sem</small>
            </div>
          </div>
          <div>
            <div className="k">Sobre umbral</div>
            <div className="v">
              {fmt(resumenFoco.exc)}
              <small> pzas</small>
            </div>
          </div>
          <div>
            <div className="k">Venta perdida</div>
            <div className="v">
              {moneyCorto(resumenFoco.perdida)}
              <small> /sem</small>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 13, lineHeight: 1.55, margin: 0 }}>
          <strong>{tituloFoco}</strong> concentra <strong>{fmt(resumenFoco.inv)} piezas</strong> en{" "}
          {resumenFoco.pdv} {resumenFoco.pdv === 1 ? "sucursal" : "sucursales"}, equivalentes a{" "}
          <strong>
            {resumenFoco.cob > 50 ? "inventario sin desplazamiento" : `${fmt(resumenFoco.cob, 1)} semanas`}
          </strong>{" "}
          contra un umbral de {filtro.umbral}.
          {resumenFoco.exc > 0 ? (
            <>
              {" "}
              Hay <strong>{fmt(resumenFoco.exc)} piezas por encima del umbral</strong>,{" "}
              {money(resumenFoco.capital)} de capital parado a costo.
            </>
          ) : null}
          {resumenFoco.qui.length ? (
            <>
              {" "}
              Al mismo tiempo{" "}
              <strong>
                {resumenFoco.qui.length}{" "}
                {resumenFoco.qui.length === 1 ? "combinación está" : "combinaciones están"} en cero
              </strong>{" "}
              con desplazamiento histórico: {money(resumenFoco.perdida)} de venta perdida por semana.
            </>
          ) : null}
          {resumenFoco.exc > 0 && resumenFoco.qui.length ? (
            <> No es un problema de volumen, es de distribución.</>
          ) : null}
        </p>

        {resumenFoco.sobre.length ? (
          <Accion
            tipo="no"
            titulo="No embarcar"
            nota={`${resumenFoco.sobre.length} combinaciones sobre el umbral`}
          >
            {resumenFoco.sobre
              .slice()
              .sort((a, b) => b.capital - a.capital)
              .slice(0, 6)
              .map((c) => (
                <li key={c.id}>
                  {unaSucursal ? (
                    <b>{c.modelo.sku}</b>
                  ) : (
                    <>
                      <b>{c.sucursal.plaza}</b> · {c.modelo.sku}
                    </>
                  )}{" "}
                  <span style={{ color: "var(--ink-3)" }}>({c.coleccion.nombre})</span>{" "}
                  — <em>{fmt(c.inv)} pzas</em>, {c.cob > 50 ? "∞" : fmt(c.cob, 1)} semanas,{" "}
                  <em>{fmt(c.exc)}</em> por encima del umbral ({moneyCorto(c.capital)} a costo)
                  {c.tr ? ` · ojo: ${c.tr} ya van en tránsito` : ""}
                </li>
              ))}
          </Accion>
        ) : null}

        {mover.length ? (
          <Accion tipo="mv" titulo="Trasladar antes de resurtir" nota="dentro de la misma cadena">
            {mover.map((t, i) => (
              <li key={i}>
                <em>{fmt(t.piezas)} pzas</em> de <b>{t.origen.sucursal.plaza}</b> a{" "}
                <b>{t.destino.sucursal.plaza}</b>
                {t.salto === 0 ? " (misma ciudad)" : ` (${t.destino.sucursal.ciudad})`} —{" "}
                {t.origen.modelo.sku}. Cubre <em>{fmt(t.semanas, 1)}</em> semanas en destino y
                frena <em>{money(t.recupera)}</em> por semana, con un flete de {money(t.costo)}.
              </li>
            ))}
          </Accion>
        ) : null}

        {resumenFoco.qui.length ? (
          <Accion
            tipo="re"
            titulo="Resurtir"
            nota={`${resumenFoco.qui.length} combinaciones en cero con desplazamiento`}
          >
            {resumenFoco.qui
              .slice()
              .sort((a, b) => b.perdida - a.perdida)
              .slice(0, 6)
              .map((c) => (
                <li key={c.id}>
                  {unaSucursal ? (
                    <b>{c.modelo.sku}</b>
                  ) : (
                    <>
                      <b>{c.sucursal.plaza}</b> · {c.modelo.sku}
                    </>
                  )}{" "}
                  <span style={{ color: "var(--ink-3)" }}>({c.coleccion.nombre})</span>{" "}
                  — sugerido <em>{fmt(c.sug)} pzas</em>, venta perdida <em>{money(c.perdida)}</em> por
                  semana
                  {c.tr ? ` · ${c.tr} en tránsito, verifica antes de duplicar` : ""}
                </li>
              ))}
          </Accion>
        ) : null}

        {!resumenFoco.sobre.length && !resumenFoco.qui.length ? (
          <Accion tipo="ok" titulo="Sin acción pendiente" nota="dentro de rango">
            <li>
              Ninguna combinación de este alcance rebasa el umbral ni está en cero con
              desplazamiento. Mantener el ritmo de embarque actual.
            </li>
          </Accion>
        ) : null}

        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, margin: "4px 0 2px" }}>
            Combinaciones detrás de esta alerta
          </h3>
          <p className="sub" style={{ marginBottom: 0 }}>
            Ordenadas por impacto en pesos.
          </p>
          <div className="tablewrap" style={{ maxHeight: "none" }}>
            <Tabla
              cols={colsCombo}
              filas={combosFoco.slice().sort((a, b) => b.impacto - a.impacto)}
              limite={40}
            />
          </div>
        </div>
      </Drawer>
    </div>
  );
}
