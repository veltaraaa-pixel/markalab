'use client';
/**
 * Car.tsx · v2.1
 *
 * El coche y todo lo que le pasa: entra a la bahía, sube al elevador, se deja
 * ver por dentro, se desarma en piezas, se vuelve a armar y se va.
 *
 * Usa un modelo 3D real (public/models/car.glb): un deportivo alemán de motor
 * central al que se le quitaron todos los emblemas, letreros y placas (ver
 * public/models/LICENCIA-car.txt). Al cargarlo se orienta, se escala a 4.84 m y
 * se separa en grupos por nombre de pieza (PARTS, abajo): carrocería, asientos,
 * ruedas e interior.
 *
 * No hay animaciones grabadas. En cada cuadro se lee la etapa del scroll
 * (live.s), se interpola el cuadro clave (stages.ts) y se colocan las piezas.
 */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { anchorEls, FINDING } from '@/lib/anchors';
import { live, useShop } from '@/lib/store';
import { sample, KEYS, type Key } from '@/lib/stages';
import { RESULTS } from '@/lib/content';

/** En celulares y tabletas se carga una versión con menos polígonos: misma
 *  forma a esa distancia, una fracción del trabajo para el procesador. */
const LITE =
  typeof window !== 'undefined' &&
  (window.matchMedia('(max-width: 860px)').matches || window.matchMedia('(pointer: coarse)').matches);
export const CAR_URL = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/models/${LITE ? 'car-lite' : 'car'}.glb`;
if (typeof window !== 'undefined') useGLTF.preload(CAR_URL);
/** De dónde arranca el coche al entrar: lejos, al fondo de la bahía, en lo oscuro. */
const START_X = -26;

const damp = THREE.MathUtils.damp;
/** Largo del coche en la escena (m). La bahía y la cámara están hechas a esta medida. */
const LENGTH = 4.84;

/** Altura de la plataforma del elevador y del coche para un valor de lift 0–1. */
export function liftHeights(lift: number) {
  const runway = 0.07 + lift * 1.2;
  return { runway, car: Math.max(0, runway - 0.2) };
}

type Wheel = { outer: THREE.Group; spin: THREE.Group; baseZ: number; side: 1 | -1 };
type Door = { g: THREE.Group; side: 1 | -1 };
type Prepared = {
  root: THREE.Group;
  shell: THREE.Group;
  seats: THREE.Group;
  doors: Door[];
  wheels: Wheel[];
  xrayMats: { m: THREE.Material & { opacity: number }; base: number }[];
  wire: THREE.LineBasicMaterial;
  edge: THREE.LineBasicMaterial;
  scan: THREE.LineLoop;
  scanMat: THREE.LineBasicMaterial;
  paint: THREE.MeshPhysicalMaterial[];
  head: THREE.MeshStandardMaterial[];
  tail: THREE.MeshStandardMaterial[];
  signal: THREE.MeshStandardMaterial[];
  size: THREE.Vector3;
  dispose: () => void;
};

/**
 * Qué pieza del modelo es qué. El .glb se preparó (ver LICENCIA-car.txt) con
 * nombres por función:
 *   shell_*            carrocería: sube en la vista explotada, se transparenta
 *   seat_*             asientos: se asoman en la vista explotada
 *   cabin_*            interior fijo (tablero, puertas por dentro)
 *   wheel{N}_spin_*    piezas de la rueda N que giran (llanta, rin, disco)
 *   wheel{N}_fix_*     piezas de la rueda N que no giran (mordaza)
 */
const PARTS = {
  /** Faros y calaveras: con ellos se sabe hacia dónde mira el coche. */
  front: 'shell_headlights',
  rear: 'shell_taillights',
  shell: (n: string) => n.startsWith('shell_'),
  seats: (n: string) => n.startsWith('seat_'),
  door: (n: string) => n.startsWith('door_'),
  wheel: (n: string) => /^wheel(\d)_(spin|fix)_/.exec(n),
  paint: (m: string) => m === 'Body_color',
  head: (m: string) => m === 'headlight_lamp',
  tail: (m: string) => m === 'taillights',
  signal: (m: string) => m === 'blinkers',
  chassisEdges: /^cabin_/,
  tone: {} as Record<string, string>,
};

/** Orienta, escala y separa el modelo en los grupos que anima la escena. */
function prepare(source: THREE.Group): Prepared {
  const model = source.clone(true);
  // Materiales propios para esta copia: se van a modificar cuadro a cuadro.
  const matCache = new Map<THREE.Material, THREE.Material>();
  model.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    // La versión ligera viene sin normales (pesa menos); se calculan aquí.
    if (!m.geometry.attributes.normal) m.geometry.computeVertexNormals();
    const list = (Array.isArray(m.material) ? m.material : [m.material]).map((mat) => {
      if (!matCache.has(mat)) {
        // La pintura pasa a material físico para tener barniz (clearcoat).
        const src = mat as THREE.MeshStandardMaterial;
        matCache.set(
          mat,
          PARTS.paint(mat.name)
            ? new THREE.MeshPhysicalMaterial({ name: mat.name, color: src.color, metalness: src.metalness, roughness: src.roughness, side: src.side })
            : mat.clone(),
        );
      }
      return matCache.get(mat)!;
    });
    m.material = Array.isArray(m.material) ? list : list[0];
  });

  // 1. Orientación: los faros miran a +X, Y hacia arriba.
  const wrap = new THREE.Group();
  wrap.add(model);
  wrap.updateMatrixWorld(true);
  const centerOf = (name: string) => {
    const o = model.getObjectByName(name);
    return o ? new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()) : new THREE.Vector3();
  };
  const dir = centerOf(PARTS.front).sub(centerOf(PARTS.rear));
  wrap.rotation.y = Math.atan2(dir.z, dir.x);
  wrap.updateMatrixWorld(true);
  // 2. Escala y centro: largo fijo, centrado, llantas sobre el piso.
  let box = new THREE.Box3().setFromObject(wrap);
  const len = box.max.x - box.min.x;
  wrap.scale.setScalar(LENGTH / len);
  wrap.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(wrap);
  const c = box.getCenter(new THREE.Vector3());
  wrap.position.set(-c.x, -box.min.y, -c.z);
  const root = new THREE.Group();
  root.add(wrap);
  root.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());

  // 3. Grupos. attach() conserva la posición en el mundo.
  const shell = new THREE.Group();
  const seats = new THREE.Group();
  root.add(shell, seats);

  // Nodos de primer nivel del modelo, ya con su nombre de función.
  const nodes: THREE.Object3D[] = [];
  model.traverse((o) => {
    if (o !== model && o.name && (PARTS.shell(o.name) || PARTS.seats(o.name) || PARTS.door(o.name) || PARTS.wheel(o.name))) nodes.push(o);
  });
  root.updateMatrixWorld(true);

  const doors: Door[] = [];
  for (const o of nodes.filter((n) => PARTS.door(n.name))) {
    const g = new THREE.Group();
    root.add(g);
    g.attach(o);
    const z = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()).z;
    doors.push({ g, side: (z >= 0 ? 1 : -1) as 1 | -1 });
  }

  // Ruedas: el centro sale de la llanta; giran alrededor del eje Z del mundo.
  const wheels: Wheel[] = [];
  const byWheel = new Map<string, { spin: THREE.Object3D[]; fix: THREE.Object3D[] }>();
  for (const o of nodes) {
    const m = PARTS.wheel(o.name);
    if (!m) continue;
    if (!byWheel.has(m[1])) byWheel.set(m[1], { spin: [], fix: [] });
    byWheel.get(m[1])![m[2] as 'spin' | 'fix'].push(o);
  }
  byWheel.forEach(({ spin: spinParts, fix }) => {
    const tyre = spinParts.find((o) => o.name.endsWith('_tyre')) ?? spinParts[0];
    if (!tyre) return;
    const ctr = new THREE.Box3().setFromObject(tyre).getCenter(new THREE.Vector3());
    const outer = new THREE.Group();
    outer.position.copy(ctr);
    const spin = new THREE.Group();
    outer.add(spin);
    root.add(outer);
    root.updateMatrixWorld(true);
    spinParts.forEach((o) => spin.attach(o));
    fix.forEach((o) => outer.attach(o));
    wheels.push({ outer, spin, baseZ: ctr.z, side: (ctr.z >= 0 ? 1 : -1) as 1 | -1 });
  });

  root.updateMatrixWorld(true);
  nodes.filter((n) => PARTS.seats(n.name)).forEach((o) => seats.attach(o));
  nodes.filter((n) => PARTS.shell(n.name)).forEach((o) => shell.attach(o));

  // 4. Materiales
  const paint: THREE.MeshPhysicalMaterial[] = [];
  const head: THREE.MeshStandardMaterial[] = [];
  const tail: THREE.MeshStandardMaterial[] = [];
  const signal: THREE.MeshStandardMaterial[] = [];
  const xrayMats: Prepared['xrayMats'] = [];
  const seen = new Set<THREE.Material>();
  const wire = new THREE.LineBasicMaterial({
    color: new THREE.Color(2.0, 0.62, 0.14),
    transparent: true,
    opacity: 0,
    toneMapped: false,
    depthWrite: false,
  });
  const edge = new THREE.LineBasicMaterial({ color: new THREE.Color(1.8, 0.56, 0.13), transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const extra: THREE.BufferGeometry[] = [];

  const inShell = new Set<THREE.Object3D>();
  [shell, ...doors.map((d) => d.g)].forEach((g) => g.traverse((o) => inShell.add(o)));
  // Materiales que también usa el interior o el chasis: esos no se transparentan,
  // para que en la radiografía el interior se vea sólido.
  const usedInside = new Set<THREE.Material>();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || inShell.has(mesh)) return;
    (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => usedInside.add(m));
  });

  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = false;
    const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as THREE.MeshStandardMaterial[];
    for (const m of mats) {
      if (seen.has(m)) continue;
      seen.add(m);
      const name = m.name || '';
      m.envMapIntensity = 0.85;
      // Micas de los faros: reflejo bajo para que no se vean "encendidos" en blanco.
      // Rines: reflejo más contenido (si no, se ven blancos bajo las luces del estudio).
      if (name === 'Rim') m.envMapIntensity = 0.7;
      if (name === 'Glass_Lights') {
        m.envMapIntensity = 0.18;
        m.roughness = Math.max(m.roughness, 0.18);
      }
      // Piezas que el modelo trae en gris claro sin textura: se oscurecen para
      // que el interior y la fibra de carbono no se vean blancos.
      const tone = PARTS.tone[name];
      if (tone) m.color.set(tone);
      if (PARTS.paint(name)) {
        const p = m as THREE.MeshPhysicalMaterial;
        p.color.set(RESULTS.paints[0].hex);
        // Pintura sólida con barniz suave: color vivo y solo el reflejo necesario.
        p.metalness = 0.25;
        p.roughness = 0.42;
        if ('clearcoat' in p) {
          p.clearcoat = 0.55;
          p.clearcoatRoughness = 0.16;
        }
        p.envMapIntensity = 0.75;
        paint.push(p);
      }
      if (PARTS.head(name)) {
        m.emissive.setRGB(0.85, 0.9, 1);
        head.push(m);
      }
      if (PARTS.tail(name)) {
        m.emissive.setRGB(1, 0.05, 0.02);
        m.toneMapped = false;
        tail.push(m);
      }
      if (PARTS.signal(name)) {
        m.emissive.setRGB(1, 0.42, 0.05);
        m.toneMapped = false;
        signal.push(m);
      }
    }
    // Lo que se vuelve transparente en la radiografía: carrocería y puertas.
    if (inShell.has(mesh)) {
      for (const m of mats) {
        if (usedInside.has(m) || xrayMats.some((x) => x.m === m)) continue;
        xrayMats.push({ m: m as THREE.Material & { opacity: number }, base: m.transparent ? m.opacity : 1 });
      }
      // Trazo de la radiografía: aristas de las piezas pintadas.
      if (mats.some((m) => PARTS.paint(m.name || ''))) {
        const eg = new THREE.EdgesGeometry(mesh.geometry, 28);
        extra.push(eg);
        const ls = new THREE.LineSegments(eg, wire);
        ls.renderOrder = 4;
        mesh.add(ls);
      }
    } else if (PARTS.chassisEdges.test(mesh.name)) {
      const eg = new THREE.EdgesGeometry(mesh.geometry, 30);
      extra.push(eg);
      mesh.add(new THREE.LineSegments(eg, edge));
    }
  });

  // 5. Anillo de escaneo: sección del coche (superelipse) que recorre el largo.
  const pts: THREE.Vector3[] = [];
  const hw = size.z / 2 + 0.05;
  const hh = size.y / 2 + 0.04;
  for (let i = 0; i < 96; i++) {
    const t = (i / 96) * Math.PI * 2;
    const cs = Math.cos(t);
    const sn = Math.sin(t);
    pts.push(new THREE.Vector3(0, hh + hh * Math.sign(sn) * Math.abs(sn) ** 0.6, hw * Math.sign(cs) * Math.abs(cs) ** 0.6));
  }
  const scanGeo = new THREE.BufferGeometry().setFromPoints(pts);
  extra.push(scanGeo);
  const scanMat = new THREE.LineBasicMaterial({ color: new THREE.Color(4.5, 1.5, 0.4), transparent: true, opacity: 0, toneMapped: false, depthTest: false });
  const scan = new THREE.LineLoop(scanGeo, scanMat);
  scan.renderOrder = 5;
  root.add(scan);

  // 6. Anclas de las etiquetas (lib/anchors.ts).
  const L = size.x / 2;
  const H = size.y;
  const W = size.z / 2;
  const anchor = (i: number, parent: THREE.Object3D, p: [number, number, number]) => {
    const g = new THREE.Group();
    g.name = `ancla-${i}`;
    g.position.set(...p);
    parent.add(g);
  };
  anchor(0, shell, [L - 0.22, H * 0.5, W * 0.62]); // faros
  const seatBox = new THREE.Box3().setFromObject(seats);
  anchor(1, seats, [seatBox.getCenter(new THREE.Vector3()).x, seatBox.max.y + 0.06, W * 0.4]); // asiento
  const fw = wheels.find((w) => w.outer.position.x > 0 && w.side === 1) ?? wheels[0];
  if (fw) {
    anchor(2, fw.outer, [0, 0.2, 0.24]); // freno
    anchor(FINDING, fw.outer, [0, 0.02, 0.2]);
  }
  anchor(3, root, [L * 0.62, H * 0.55, 0]); // motor / frente
  anchor(4, shell, [-L * 0.56, H * 0.72, W * 0.92]); // carrocería
  anchor(5, shell, [-L * 0.2, H + 0.04, 0]); // techo / antena

  return {
    root,
    shell,
    seats,
    doors,
    wheels,
    xrayMats,
    wire,
    edge,
    scan,
    scanMat,
    paint,
    head,
    tail,
    signal,
    size,
    dispose: () => {
      extra.forEach((g) => g.dispose());
      matCache.forEach((m) => m.dispose());
      [wire, edge, scanMat].forEach((m) => m.dispose());
    },
  };
}

export function Car() {
  const { scene } = useGLTF(CAR_URL);
  const car = useMemo(() => prepare(scene as THREE.Group), [scene]);
  useEffect(() => () => car.dispose(), [car]);

  const root = useRef<THREE.Group>(null!);
  const lifted = useRef<THREE.Group>(null!);
  const anchors = useRef<(THREE.Object3D | undefined)[]>([]);
  useEffect(() => {
    anchors.current = Array.from({ length: FINDING + 1 }, (_, i) => car.root.getObjectByName(`ancla-${i}`));
  }, [car]);
  const v3 = useMemo(() => new THREE.Vector3(), []);

  const st = useRef({
    key: { ...KEYS[0] } as Key,
    lift: 0,
    xray: 0,
    explode: 0,
    head: 0,
    tail: 0,
    intro: 0,
    exit: 0,
    x: START_X,
    /** Segundos desde que el coche llegó al frente (para el doble destello). */
    arriveT: -1,
    flashSeen: 0,
    flashT: 9,
    paint: new THREE.Color(RESULTS.paints[0].hex),
  });

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    const s = st.current;
    const shop = useShop.getState();
    const k = sample(live.s, s.key);

    s.lift = damp(s.lift, k.lift, 3.2, dt);
    s.xray = damp(s.xray, k.xray, 4.5, dt);
    s.explode = damp(s.explode, k.explode, 3.4, dt);
    s.head = damp(s.head, k.head, 4, dt);
    s.tail = damp(s.tail, k.tail, 4, dt);

    // Entrada a la bahía, cuando se levanta el telón de carga.
    if (live.skipIntro) s.intro = 1;
    if (shop.open && s.intro < 1) s.intro = Math.min(1, s.intro + dt / 3.4);
    const inE = 1 - Math.pow(1 - s.intro, 3);
    // Salida, cuando se envía el formulario.
    if (shop.sent) s.exit = Math.min(1, s.exit + dt / 3.2);
    else s.exit = Math.max(0, s.exit - dt / 1.2);
    const outE = s.exit * s.exit * s.exit;

    const prevX = s.x;
    s.x = START_X * (1 - inE) + 16 * outE;
    root.current.position.x = s.x;
    const roll = (s.x - prevX) / 0.36;

    lifted.current.position.y = liftHeights(s.lift).car;

    // Vista explotada: la carrocería sube, las puertas se abren hacia afuera,
    // los asientos se asoman y las ruedas se separan.
    const e = s.explode;
    car.shell.position.y = e * 1.42;
    car.seats.position.y = e * 0.3;
    car.doors.forEach((d) => {
      d.g.position.y = e * 1.05;
      d.g.position.z = d.side * e * 0.75;
    });
    car.wheels.forEach((w) => {
      w.outer.position.z = w.baseZ + w.side * e * 0.72;
      w.spin.rotation.z -= roll;
    });

    // Radiografía
    const x = s.xray;
    for (const { m, base } of car.xrayMats) {
      m.transparent = x > 0.01 || base < 1;
      m.opacity = base * (1 - 0.9 * x);
      m.depthWrite = x < 0.5;
    }
    car.wire.opacity = x * 0.5;
    car.edge.opacity = 0.6 * Math.max(x, e);

    // Anillo de escaneo: recorre el coche; más autos al mes, más rápido.
    car.scan.visible = x > 0.03;
    if (car.scan.visible) {
      const speed = 0.55 + (shop.autos / 400) * 1.3;
      car.scan.position.x = Math.sin(state.clock.elapsedTime * speed) * (car.size.x / 2 - 0.08);
      car.scanMat.opacity = x;
    }

    // Pintura
    s.paint.set(RESULTS.paints[shop.paint].hex);
    const a = 1 - Math.exp(-5 * dt);
    car.paint.forEach((p) => p.color.lerp(s.paint, a));

    // Luces. Cambio de luces cuando la página lo pide.
    if (shop.flash !== s.flashSeen) {
      s.flashSeen = shop.flash;
      s.flashT = 0;
    }
    s.flashT += dt;
    const blink = s.flashT < 0.9 ? (Math.sin(s.flashT * 21) > 0 ? 1.6 : 0.1) : 0;
    // Entrada: viene con los faros encendidos; al llegar al frente destella
    // dos veces y los apaga.
    let intro = 0;
    if (live.skipIntro) s.arriveT = 99;
    else if (s.intro > 0 && s.intro < 1) intro = 1;
    else if (s.intro >= 1) {
      if (s.arriveT < 0) s.arriveT = 0;
      s.arriveT += dt;
      const t2 = s.arriveT;
      intro = t2 < 0.15 ? 0 : t2 < 0.4 ? 1.5 : t2 < 0.58 ? 0 : t2 < 0.83 ? 1.5 : 0;
    }
    const h = Math.max(s.head, intro, blink) * (1 - x * 0.6);
    car.head.forEach((m) => (m.emissiveIntensity = 0.04 + 1.3 * h));
    const t = Math.max(s.tail, blink * 0.8, outE > 0 ? 1.4 : 0);
    car.tail.forEach((m) => (m.emissiveIntensity = 0.25 + 2.6 * t));
    car.signal.forEach((m) => (m.emissiveIntensity = blink > 1 ? 3 : 0.05));

    // Etiquetas: se proyecta cada ancla a pantalla y se mueve su elemento HTML.
    const { width, height } = state.size;
    for (let i = 0; i < anchors.current.length; i++) {
      const an = anchors.current[i];
      const el = anchorEls[i];
      if (!an || !el) continue;
      an.getWorldPosition(v3).project(state.camera);
      const px = (v3.x * 0.5 + 0.5) * width;
      const py = (-v3.y * 0.5 + 0.5) * height;
      el.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;
    }
  });

  return (
    <group ref={root} position={[START_X, 0, 0]}>
      <group ref={lifted}>
        <primitive object={car.root} />
      </group>
    </group>
  );
}
