'use client';
/**
 * PhoneDemo.tsx · v1.0
 *
 * El simulador: lo que recibe el cliente del taller en su WhatsApp, etapa por
 * etapa. Arranca solo la primera vez que se llega a la sección y se detiene en
 * la autorización hasta que el visitante contesta: es el momento que la
 * landing quiere que se sienta.
 *
 * Al autorizar, el coche de la escena hace cambio de luces (useShop.blink).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DEMO } from '@/lib/content';
import { useShop } from '@/lib/store';

type Msg = { id: number; from: 'shop' | 'me'; text: string; k?: string; t?: string };

const STEP_MS = 1500;
const TYPING_MS = 750;
const AUTO_YES_MS = 12000;

export function PhoneDemo() {
  const active = useShop((s) => s.stage === 2);
  const blink = useShop((s) => s.blink);
  const [car, setCar] = useState(0);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [step, setStep] = useState(-1);
  const [typing, setTyping] = useState(false);
  const [asking, setAsking] = useState(false);
  const timers = useRef<number[]>([]);
  const started = useRef(false);
  const id = useRef(0);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const play = useCallback((from: number, carIdx: number) => {
    const c = DEMO.cars[carIdx];
    const run = (i: number) => {
      if (i >= DEMO.steps.length) return;
      const st = DEMO.steps[i];
      setTyping(true);
      later(() => {
        setTyping(false);
        setStep(i);
        setMsgs((m) => [
          ...m,
          { id: ++id.current, from: 'shop', k: st.k, t: st.t, text: st.msg.replace('{M}', c.m).replace('{KM}', c.odo) },
        ]);
        if ('ask' in st && st.ask) {
          setAsking(true);
          later(() => answer(carIdx, true), AUTO_YES_MS);
        } else {
          later(() => run(i + 1), STEP_MS);
        }
      }, TYPING_MS);
    };
    const answer = (cIdx: number, auto = false) => {
      clear();
      setAsking(false);
      setMsgs((m) => [...m, { id: ++id.current, from: 'me', text: 'Sí, autorizo' }]);
      if (!auto) blink();
      const next = DEMO.steps.findIndex((s) => 'ask' in s && s.ask) + 1;
      later(() => run(next), 900);
    };
    answerRef.current = () => answer(carIdx);
    run(from);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const answerRef = useRef<() => void>(() => {});

  const start = useCallback(
    (carIdx: number) => {
      clear();
      setCar(carIdx);
      setMsgs([]);
      setStep(-1);
      setAsking(false);
      setTyping(false);
      later(() => play(0, carIdx), 350);
    },
    [play],
  );

  useEffect(() => {
    if (active && !started.current) {
      started.current = true;
      start(0);
    }
  }, [active, start]);
  useEffect(() => clear, []);

  const done = step === DEMO.steps.length - 1;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-1.5" role="group" aria-label="Elige un auto">
        {DEMO.cars.map((c, i) => (
          <button
            key={c.n}
            type="button"
            onClick={() => start(i)}
            aria-pressed={i === car}
            className={`label rounded-full border px-3 py-2 transition-colors cursor-pointer ${i === car ? 'border-amber bg-amber/15 text-amber-hot' : 'border-line bg-ink/60 text-muted backdrop-blur-md hover:border-fg/40 hover:text-fg'}`}
          >
            {c.n}
          </button>
        ))}
      </div>

      <div
        className="phone relative flex flex-col overflow-hidden rounded-[30px] border border-line bg-[#0A0E13]/92 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 border-b border-line/70 px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-amber text-[#0b0b0b]">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.5 17.3a1.5 1.5 0 0 0 0 2.1l1.1 1.1a1.5 1.5 0 0 0 2.1 0l5.8-5.8a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[14px] font-semibold">Servicio · {DEMO.cars[car].n}</p>
            <p className="text-[11.5px] text-ok">{typing ? 'escribiendo…' : 'en línea'}</p>
          </div>
          <div className="ml-auto flex gap-[3px]" aria-hidden="true">
            {DEMO.steps.map((_, i) => (
              <span key={i} className={`h-[3px] w-3 rounded-full transition-colors duration-500 ${i <= step ? 'bg-amber' : 'bg-line'}`} />
            ))}
          </div>
        </div>

        <div className="relative flex flex-1 flex-col justify-end gap-2 overflow-hidden px-3.5 pb-3.5" aria-live="polite">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-[#0A0E13] to-transparent" />
          <AnimatePresence initial={false} mode="popLayout">
            {msgs.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className={
                  m.from === 'shop'
                    ? 'max-w-[86%] self-start rounded-2xl rounded-bl-md bg-[#18212B] px-3.5 py-2.5'
                    : 'max-w-[86%] self-end rounded-2xl rounded-br-md bg-[#0E5A47] px-3.5 py-2.5'
                }
              >
                {m.k && (
                  <p className="label mb-1 flex gap-2 !text-[9.5px] text-amber-hot">
                    {m.k}
                    <span className="text-dim">{m.t}</span>
                  </p>
                )}
                <p className="text-[13.5px] leading-snug">{m.text}</p>
              </motion.div>
            ))}
            {typing && (
              <motion.div
                key="typing"
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className="flex gap-1 self-start rounded-2xl rounded-bl-md bg-[#18212B] px-3.5 py-3"
                aria-hidden="true"
              >
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="h-1.5 w-1.5 rounded-full bg-muted"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                  />
                ))}
              </motion.div>
            )}
            {asking && (
              <motion.div
                key="ask"
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                className="mt-1 flex gap-2"
              >
                <motion.button
                  type="button"
                  onClick={() => answerRef.current()}
                  whileTap={{ scale: 0.96 }}
                  animate={{ boxShadow: ['0 0 0 0 rgba(47,177,132,0.55)', '0 0 0 12px rgba(47,177,132,0)'] }}
                  transition={{ boxShadow: { duration: 1.5, repeat: Infinity } }}
                  className="flex-1 rounded-full bg-ok py-3 text-[14px] font-bold text-[#04130E] cursor-pointer"
                >
                  Sí, autorizo
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="label text-muted">
          <span className="tnum text-amber-hot">{step + 1}</span> avisos <span className="mx-1 text-dim">·</span>
          <span className="tnum text-amber-hot">0</span> llamadas
        </p>
        <AnimatePresence>
          {done && (
            <motion.button
              type="button"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => start((car + 1) % DEMO.cars.length)}
              className="label text-fg underline decoration-amber underline-offset-4 cursor-pointer"
            >
              Recibir otro
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
