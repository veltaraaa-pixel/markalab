'use client';
/**
 * Car.tsx · v1.0
 *
 * El coche y todo lo que le pasa: entra a la bahía, sube al elevador, se deja
 * ver por dentro, se desarma en seis piezas, se vuelve a armar y se va.
 *
 * No hay animaciones grabadas. En cada cuadro se lee la etapa del scroll
 * (live.s), se interpola el cuadro clave (stages.ts) y se colocan las piezas.
 * Por eso el coche responde al scroll hacia adelante y hacia atrás por igual.
 */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { buildCar, CAR, ringAt, surfaceLine, topAt, NR } from './carGeometry';
import { anchorEls, FINDING } from '@/lib/anchors';
import { live, useShop } from '@/lib/store';
import { sample, KEYS, type Key } from '@/lib/stages';
import { RESULTS } from '@/lib/content';

const AMBER = new THREE.Color('#E8621A');
const damp = THREE.MathUtils.damp;

/** Altura de la plataforma del elevador y del coche para un valor de lift 0–1. */
export function liftHeights(lift: number) {
  const runway = 0.07 + lift * 1.2;
  return { runway, car: Math.max(0, runway - 0.2) };
}

function useWheelGeometry() {
  return useMemo(() => {
    const prof = [
      [0.236, -0.122],
      [0.3, -0.134],
      [0.343, -0.112],
      [0.355, -0.07],
      [0.355, 0.07],
      [0.343, 0.112],
      [0.3, 0.134],
      [0.236, 0.122],
    ].map(([r, a]) => new THREE.Vector2(r, a));
    const tyre = new THREE.LatheGeometry(prof, 56).rotateX(Math.PI / 2);

    const parts: THREE.BufferGeometry[] = [];
    const barrel = new THREE.CylinderGeometry(0.238, 0.238, 0.22, 48, 1, true).rotateX(Math.PI / 2);
    parts.push(barrel);
    const lip = new THREE.TorusGeometry(0.236, 0.012, 8, 56).translate(0, 0, 0.112);
    parts.push(lip);
    for (let i = 0; i < 5; i++) {
      for (const off of [-0.11, 0.11]) {
        const spoke = new THREE.BoxGeometry(0.205, 0.024, 0.022)
          .translate(0.135, 0, 0.096)
          .rotateZ(off)
          .rotateZ((i / 5) * Math.PI * 2);
        parts.push(spoke);
      }
    }
    parts.push(new THREE.CylinderGeometry(0.05, 0.058, 0.03, 24).rotateX(Math.PI / 2).translate(0, 0, 0.1));
    const rim = mergeGeometries(parts.map((g) => g.toNonIndexed()))!;
    const disc = new THREE.CylinderGeometry(0.175, 0.175, 0.018, 40).rotateX(Math.PI / 2).translate(0, 0, 0.03);
    const caliper = new THREE.BoxGeometry(0.075, 0.15, 0.06).translate(0.165, 0, 0.035);
    return { tyre, rim, disc, caliper };
  }, []);
}

function lightTube(pts: THREE.Vector3[], r = 0.013) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, r, 6, false);
}

export function Car() {
  const geo = useMemo(() => buildCar(), []);
  const wheel = useWheelGeometry();

  const mats = useMemo(() => {
    const paint = new THREE.MeshPhysicalMaterial({
      color: RESULTS.paints[0].hex,
      metalness: 0.78,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.7,
      side: THREE.DoubleSide,
    });
    const glass = new THREE.MeshPhysicalMaterial({
      color: '#04070A',
      metalness: 0.9,
      roughness: 0.04,
      envMapIntensity: 1.9,
      transparent: true,
      opacity: 0.9,
    });
    const wire = new THREE.LineBasicMaterial({
      color: new THREE.Color(2.0, 0.62, 0.14),
      transparent: true,
      opacity: 0,
      toneMapped: false,
      depthWrite: false,
    });
    const scan = new THREE.LineBasicMaterial({
      color: new THREE.Color(4.5, 1.5, 0.4),
      transparent: true,
      opacity: 0,
      toneMapped: false,
      depthTest: false,
    });
    const trim = new THREE.MeshStandardMaterial({ color: '#0A0C0F', roughness: 0.7, metalness: 0.2, transparent: true });
    const cuts = new THREE.LineBasicMaterial({ color: '#000000', transparent: true, opacity: 0.55 });
    const tyre = new THREE.MeshStandardMaterial({ color: '#08090A', roughness: 0.92 });
    const rim = new THREE.MeshStandardMaterial({ color: '#AEB6C0', metalness: 1, roughness: 0.28, side: THREE.DoubleSide });
    const disc = new THREE.MeshStandardMaterial({ color: '#6E7680', metalness: 1, roughness: 0.4 });
    const caliper = new THREE.MeshStandardMaterial({ color: AMBER, roughness: 0.45, emissive: AMBER, emissiveIntensity: 0.25 });
    const steel = new THREE.MeshStandardMaterial({ color: '#1A2028', metalness: 0.7, roughness: 0.5 });
    const cabin = new THREE.MeshStandardMaterial({ color: '#2A313B', roughness: 0.75 });
    const edge = new THREE.LineBasicMaterial({ color: new THREE.Color(1.8, 0.56, 0.13), transparent: true, opacity: 0.3, toneMapped: false });
    const head = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
    const tail = new THREE.MeshBasicMaterial({ color: '#ff2a12', toneMapped: false });
    return { paint, glass, trim, cuts, wire, scan, tyre, rim, disc, caliper, steel, cabin, edge, head, tail };
  }, []);

  const lights = useMemo(() => {
    const fr = lightTube(surfaceLine(1.96, 2.392, 0.67, 1));
    const fl = lightTube(surfaceLine(1.96, 2.392, 0.67, -1));
    const right = surfaceLine(-1.96, -2.4185, 0.79, 1);
    const left = surfaceLine(-1.96, -2.4185, 0.79, -1).reverse();
    const rear = lightTube([...right, ...left], 0.012);
    return { fr, fl, rear };
  }, []);

  // Piezas del chasis: lo que queda a la vista cuando la carrocería sube.
  const chassis = useMemo(() => {
    const box = (w: number, h: number, d: number, x: number, y: number, z: number): THREE.BufferGeometry =>
      new THREE.BoxGeometry(w, h, d).translate(x, y, z);
    const solid: THREE.BufferGeometry[] = [
      box(3.5, 0.05, 1.46, 0, 0.27, 0),
      box(2.2, 0.1, 1.24, -0.05, 0.345, 0),
      box(0.62, 0.3, 0.86, 1.52, 0.5, 0),
      box(0.5, 0.26, 0.74, -1.52, 0.47, 0),
      box(0.16, 0.13, 1.36, 0.98, 0.86, 0),
    ];
    for (const sx of [1, -1]) {
      solid.push(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 12).rotateX(Math.PI / 2).translate(sx * CAR.wheelX, CAR.wheelR, 0));
      for (const sz of [1, -1]) {
        solid.push(new THREE.CylinderGeometry(0.04, 0.04, 0.46, 12).translate(sx * CAR.wheelX, 0.6, sz * 0.56));
      }
    }
    const frame = mergeGeometries(solid.map((g) => g.toNonIndexed()))!;
    const edges = mergeGeometries(
      [box(2.2, 0.1, 1.24, -0.05, 0.345, 0), box(0.62, 0.3, 0.86, 1.52, 0.5, 0), box(0.5, 0.26, 0.74, -1.52, 0.47, 0)].map(
        (g) => new THREE.EdgesGeometry(g),
      ),
    )!;
    // Divisiones del paquete de baterías
    const cells: number[] = [];
    for (let i = 1; i < 6; i++) {
      const x = -1.15 + (i * 2.2) / 6;
      cells.push(x, 0.397, -0.62, x, 0.397, 0.62);
    }
    cells.push(-1.15, 0.397, 0, 1.05, 0.397, 0);
    const cellLines = new THREE.BufferGeometry();
    cellLines.setAttribute('position', new THREE.Float32BufferAttribute(cells, 3));

    const seat: THREE.BufferGeometry[] = [];
    for (const [x, z] of [
      [0.22, 0.37],
      [0.22, -0.37],
      [-0.8, 0.37],
      [-0.8, -0.37],
    ]) {
      seat.push(box(0.5, 0.13, 0.5, x, 0.5, z));
      seat.push(new THREE.BoxGeometry(0.11, 0.56, 0.48).rotateZ(0.2).translate(x - 0.27, 0.8, z));
      seat.push(box(0.09, 0.14, 0.24, x - 0.34, 1.13, z));
    }
    seat.push(new THREE.TorusGeometry(0.16, 0.018, 8, 32).rotateY(Math.PI / 2).rotateZ(-0.35).translate(0.82, 0.93, 0.37));
    const seats = mergeGeometries(seat.map((g) => g.toNonIndexed()))!;
    return { frame, edges, cellLines, seats };
  }, []);

  const scanGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((NR + 1) * 3), 3));
    return g;
  }, []);
  const scanLine = useMemo(() => new THREE.Line(scanGeo, mats.scan), [scanGeo, mats.scan]);
  const wireLines = useMemo(() => new THREE.LineSegments(geo.wire, mats.wire), [geo.wire, mats.wire]);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geo, mats],
  );

  const root = useRef<THREE.Group>(null!);
  const lifted = useRef<THREE.Group>(null!);
  const shell = useRef<THREE.Group>(null!);
  const seats = useRef<THREE.Group>(null!);
  const wheels = useRef<THREE.Group[]>([]);
  // Puntos del coche a los que se anclan las etiquetas HTML (lib/anchors.ts).
  // Cada uno es un grupo vacío con nombre; se localizan una vez, al montar.
  const anchors = useRef<(THREE.Object3D | undefined)[]>([]);
  useEffect(() => {
    anchors.current = Array.from({ length: FINDING + 1 }, (_, i) => root.current.getObjectByName(`ancla-${i}`));
  }, []);
  const v3 = useMemo(() => new THREE.Vector3(), []);
  const spins = useRef<THREE.Group[]>([]);

  const st = useRef({
    key: { ...KEYS[0] } as Key,
    lift: 0,
    xray: 0,
    explode: 0,
    head: 0,
    tail: 0,
    intro: 0,
    exit: 0,
    x: -11,
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
    if (shop.open && s.intro < 1) s.intro = Math.min(1, s.intro + dt / 2.6);
    const inE = 1 - Math.pow(1 - s.intro, 3);
    // Salida, cuando se envía el formulario.
    if (shop.sent) s.exit = Math.min(1, s.exit + dt / 3.2);
    else s.exit = Math.max(0, s.exit - dt / 1.2);
    const outE = s.exit * s.exit * s.exit;

    const prevX = s.x;
    s.x = -11 * (1 - inE) + 16 * outE;
    root.current.position.x = s.x;
    const roll = (s.x - prevX) / CAR.wheelR;

    const { car: carY } = liftHeights(s.lift);
    lifted.current.position.y = carY;

    // Vista explotada
    const e = s.explode;
    shell.current.position.y = e * 1.42;
    seats.current.position.y = e * 0.3;
    wheels.current.forEach((w, i) => {
      if (!w) return;
      const side = i % 2 === 0 ? 1 : -1;
      w.position.z = side * (CAR.wheelZ + e * 0.72);
    });
    // Las ruedas giran con el avance del coche y, apenas, con el scroll.
    spins.current.forEach((g, i) => {
      if (!g) return;
      const side = i % 2 === 0 ? 1 : -1;
      g.rotation.z -= roll * side;
    });

    // Radiografía
    const x = s.xray;
    mats.paint.transparent = x > 0.01;
    mats.paint.opacity = 1 - 0.9 * x;
    mats.paint.depthWrite = x < 0.5;
    mats.glass.opacity = 0.9 - 0.72 * x;
    mats.trim.opacity = 1 - 0.9 * x;
    mats.trim.depthWrite = x < 0.5;
    mats.cuts.opacity = 0.55 * (1 - x);
    mats.wire.opacity = x * 0.55;
    wireLines.visible = x > 0.01;
    mats.edge.opacity = 0.28 + 0.6 * Math.max(x, e);

    // Anillo de escaneo: recorre el coche; más autos al mes, más rápido.
    scanLine.visible = x > 0.03;
    if (scanLine.visible) {
      const speed = 0.55 + (shop.autos / 400) * 1.3;
      const sx = Math.sin(state.clock.elapsedTime * speed) * (CAR.L - 0.06);
      ringAt(sx, scanGeo.attributes.position.array as Float32Array);
      scanGeo.attributes.position.needsUpdate = true;
      mats.scan.opacity = x;
    }

    // Pintura
    s.paint.set(RESULTS.paints[shop.paint].hex);
    mats.paint.color.lerp(s.paint, 1 - Math.exp(-5 * dt));

    // Luces. Cambio de luces cuando la página lo pide.
    if (shop.flash !== s.flashSeen) {
      s.flashSeen = shop.flash;
      s.flashT = 0;
    }
    s.flashT += dt;
    const blink = s.flashT < 0.9 ? (Math.sin(s.flashT * 21) > 0 ? 1.6 : 0.1) : 0;
    const h = Math.max(s.head * (0.35 + 0.65 * inE), blink) * (1 - x * 0.6);
    mats.head.color.setRGB(0.25 + 5.5 * h, 0.25 + 5.5 * h, 0.3 + 6 * h);
    const t = Math.max(s.tail, blink * 0.8, outE > 0 ? 1.4 : 0);
    mats.tail.color.setRGB(0.22 + 3.4 * t, 0.015 + 0.1 * t, 0.012 + 0.04 * t);

    // Etiquetas: se proyecta cada ancla a pantalla y se mueve su elemento HTML.
    const { width, height } = state.size;
    for (let i = 0; i < anchors.current.length; i++) {
      const a = anchors.current[i];
      const el = anchorEls[i];
      if (!a || !el) continue;
      a.getWorldPosition(v3).project(state.camera);
      const px = (v3.x * 0.5 + 0.5) * width;
      const py = (-v3.y * 0.5 + 0.5) * height;
      el.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;
    }
  });

  const wheelPos: [number, number][] = [
    [CAR.wheelX, 1],
    [CAR.wheelX, -1],
    [-CAR.wheelX, 1],
    [-CAR.wheelX, -1],
  ];

  return (
    <group ref={root} position={[-11, 0, 0]}>
      <group ref={lifted}>
        <group ref={shell}>
          <mesh geometry={geo.body} material={mats.paint} />
          <mesh geometry={geo.glass} material={mats.glass} renderOrder={2} />
          <mesh geometry={geo.trim} material={mats.trim} />
          <lineSegments geometry={geo.cuts} material={mats.cuts} />
          {[1, -1].map((side) => (
            <mesh key={side} position={[0.88, 1.0, side * 0.97]} scale={[1.5, 0.75, 1]} material={mats.paint}>
              <sphereGeometry args={[0.075, 20, 14]} />
            </mesh>
          ))}
          <primitive object={wireLines} />
          <primitive object={scanLine} renderOrder={5} />
          <mesh geometry={lights.fr} material={mats.head} />
          <mesh geometry={lights.fl} material={mats.head} />
          <mesh geometry={lights.rear} material={mats.tail} />
          <group name={`ancla-${0}`} position={[2.25, 0.82, 0.62]} />
          <group name={`ancla-${4}`} position={[-1.35, 1.02, 0.86]} />
          <group name={`ancla-${5}`} position={[-0.75, topAt(-0.75) + 0.05, 0]} />
        </group>

        <mesh geometry={chassis.frame} material={mats.steel} />
        <lineSegments geometry={chassis.edges} material={mats.edge} />
        <lineSegments geometry={chassis.cellLines} material={mats.edge} />
        <group name={`ancla-${3}`} position={[1.52, 0.74, 0]} />
        <group ref={seats}>
          <mesh geometry={chassis.seats} material={mats.cabin} />
          <group name={`ancla-${1}`} position={[0.05, 1.28, 0.37]} />
        </group>

        {wheelPos.map(([x, side], i) => (
          <group
            key={i}
            ref={(g) => {
              if (g) wheels.current[i] = g;
            }}
            position={[x, CAR.wheelR, side * CAR.wheelZ]}
            rotation={[0, side === 1 ? 0 : Math.PI, 0]}
          >
            <group
              ref={(g) => {
                if (g) spins.current[i] = g;
              }}
            >
              <mesh geometry={wheel.tyre} material={mats.tyre} />
              <mesh geometry={wheel.rim} material={mats.rim} />
              <mesh geometry={wheel.disc} material={mats.disc} />
            </group>
            <mesh geometry={wheel.caliper} material={mats.caliper} rotation={[0, 0, side === 1 ? 0.5 : Math.PI - 0.5]} />
            {i === 0 && (
              <>
                <group name={`ancla-${2}`} position={[0, 0.2, 0.24]} />
                <group name={`ancla-${FINDING}`} position={[0, 0.02, 0.2]} />
              </>
            )}
          </group>
        ))}
      </group>
    </group>
  );
}
