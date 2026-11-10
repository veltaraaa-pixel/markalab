import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // La escena 3D mueve objetos de three.js dentro del ciclo de cuadros
    // (useFrame): posiciones, materiales, la cámara. Es la forma normal de
    // trabajar con React Three Fiber, y esta regla, pensada para estado de
    // React, lo marca como error. Se apaga solo en esa carpeta.
    files: ['src/components/scene/**'],
    rules: { 'react-hooks/immutability': 'off' },
  },
  globalIgnores(['.next/**', 'node_modules/**', 'next-env.d.ts']),
]);
