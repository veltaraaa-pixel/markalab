/**
 * anchors.ts · v1.0
 *
 * Puente entre el coche (WebGL) y sus etiquetas (HTML). La página registra
 * aquí cada etiqueta; la escena, en cada cuadro, proyecta la pieza a pantalla
 * y mueve la etiqueta. Así las etiquetas son HTML normal —accesibles, con foco
 * y con el mismo CSS que el resto— y aun así viajan pegadas a su pieza.
 *
 * Índices 0–5: las seis soluciones. Índice 6: el hallazgo del diagnóstico.
 */
export const anchorEls: (HTMLElement | null)[] = [];
export const FINDING = 6;
