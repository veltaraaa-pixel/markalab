'use client';
/**
 * Chrome.tsx · v1.0
 * Lo que está siempre en pantalla: la barra superior y el riel de etapas.
 * Poco y discreto, como el tablero de un taller.
 */
import { useEffect, useRef } from 'react';
import { STAGES } from '@/lib/content';
import { goToStage, scroller } from '@/lib/scroll';
import { useShop } from '@/lib/store';

export function Header() {
  const stage = useShop((s) => s.stage);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (s: number) => {
      if (bar.current) bar.current.style.transform = `scaleX(${s / (STAGES.length - 1)})`;
    };
    scroller.listeners.push(fn);
    return () => {
      scroller.listeners = scroller.listeners.filter((f) => f !== fn);
    };
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="flex items-center gap-4 px-5 pt-[max(14px,env(safe-area-inset-top))] pb-3 sm:px-8">
        <button
          type="button"
          onClick={() => goToStage(0)}
          className="pointer-events-auto flex items-center cursor-pointer"
          aria-label="MarkaLab, volver al inicio"
        >
          {/* Logo oficial transparente, versión clara para fondo oscuro */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-markalab-claro.png" alt="MarkaLab" width={223} height={59} className="h-9 w-auto" />
        </button>
        <span className="label hidden text-dim sm:inline">Talleres</span>
        <span className="label tnum ml-auto text-muted" aria-live="polite">
          <span className="text-amber">{STAGES[stage].n}</span>
          <span className="mx-1.5 text-dim">/</span>06
          <span className="ml-3 text-fg">{STAGES[stage].name}</span>
        </span>
        <button
          type="button"
          onClick={() => goToStage(5)}
          className="label pointer-events-auto hidden rounded-full border border-line bg-ink/60 px-4 py-2.5 text-fg backdrop-blur-md transition-colors hover:border-amber hover:text-amber-hot sm:block cursor-pointer"
        >
          Diagnóstico gratis
        </button>
      </div>
      <div className="h-px w-full bg-line/60">
        <div ref={bar} className="h-full origin-left bg-amber" style={{ transform: 'scaleX(0)' }} />
      </div>
    </header>
  );
}

export function StageRail() {
  const stage = useShop((s) => s.stage);
  return (
    <nav className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block" aria-label="Etapas de la orden">
      <ol className="flex flex-col items-end gap-2">
        {STAGES.map((st, i) => {
          const on = i === stage;
          return (
            <li key={st.id}>
              <button
                type="button"
                onClick={() => goToStage(i)}
                aria-current={on ? 'step' : undefined}
                className="group flex items-center gap-3 py-1 cursor-pointer"
              >
                <span
                  className="label translate-x-1 rounded-full bg-ink/80 px-2.5 py-1 text-fg opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                >
                  {st.name}
                </span>
                <span className={`block h-[2px] rounded-full transition-all duration-500 ${on ? 'w-7 bg-amber' : 'w-3 bg-dim group-hover:w-5 group-hover:bg-fg'}`} />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
