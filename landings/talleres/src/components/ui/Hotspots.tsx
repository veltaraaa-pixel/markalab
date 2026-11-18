'use client';
/**
 * Hotspots.tsx · v1.0
 *
 * Las etiquetas que flotan sobre el coche. Su posición la escribe la escena
 * (ver lib/anchors.ts); aquí solo se decide cuándo se ven y qué hacen.
 */
import { anchorEls, FINDING } from '@/lib/anchors';
import { useShop } from '@/lib/store';
import { SOLUTIONS } from '@/lib/content';

export function Hotspots() {
  const stage = useShop((s) => s.stage);
  const solution = useShop((s) => s.solution);
  const set = useShop((s) => s.set);
  const on = stage === 3;
  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-clip">
      {SOLUTIONS.map((sol, i) => (
        <button
          key={sol.n}
          ref={(el) => {
            anchorEls[i] = el;
          }}
          type="button"
          tabIndex={on ? 0 : -1}
          aria-label={sol.name}
          aria-pressed={solution === i}
          data-on={on}
          data-active={solution === i}
          className="hotspot"
          style={{ pointerEvents: on ? 'auto' : 'none' }}
          onPointerEnter={() => set({ solution: i })}
          onFocus={() => set({ solution: i })}
          onClick={() => set({ solution: i })}
        >
          <span className="hotspot-in">
            <span className="hotspot-dot">{sol.n}</span>
            <span className="hotspot-label">{sol.name}</span>
          </span>
        </button>
      ))}
      <div
        ref={(el) => {
          anchorEls[FINDING] = el;
        }}
        className="finding"
        data-on={stage === 1}
        aria-hidden="true"
      >
        <span className="finding-in">
          <span className="finding-ping" />
          <span className="finding-tag">
            Balatas <b>15 %</b>
          </span>
        </span>
      </div>
    </div>
  );
}
