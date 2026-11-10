'use client';
/**
 * Bay.tsx · v1.0
 *
 * La bahía: piso pulido, marcas pintadas, tubos de luz y el elevador de tijera.
 * Las texturas se dibujan en un <canvas> al vuelo, así que no hay imágenes que
 * descargar.
 */
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import { live } from '@/lib/store';
import { sample, KEYS, type Key } from '@/lib/stages';
import { liftHeights } from './Car';

const damp = THREE.MathUtils.damp;

function useMarkings() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 2048;
    c.height = 1024;
    const g = c.getContext('2d')!;
    const W = c.width;
    const H = c.height;
    g.clearRect(0, 0, W, H);
    // Marco de la bahía: solo esquinas, como se pinta en un taller limpio.
    g.strokeStyle = 'rgba(234,239,245,0.85)';
    g.lineWidth = 10;
    const m = 70;
    const L = 190;
    const corner = (x: number, y: number, dx: number, dy: number) => {
      g.beginPath();
      g.moveTo(x + dx * L, y);
      g.lineTo(x, y);
      g.lineTo(x, y + dy * L);
      g.stroke();
    };
    corner(m, m, 1, 1);
    corner(W - m, m, -1, 1);
    corner(m, H - m, 1, -1);
    corner(W - m, H - m, -1, -1);
    // Franja de seguridad en la entrada
    g.save();
    g.beginPath();
    g.rect(m + 30, H / 2 - 250, 46, 500);
    g.clip();
    g.fillStyle = 'rgba(232,98,26,0.95)';
    for (let y = -100; y < H; y += 56) {
      g.beginPath();
      g.moveTo(m, y);
      g.lineTo(m + 120, y + 60);
      g.lineTo(m + 120, y + 88);
      g.lineTo(m, y + 28);
      g.fill();
    }
    g.restore();
    // Número de bahía
    g.fillStyle = 'rgba(234,239,245,0.8)';
    g.font = '900 150px Arial, Helvetica, sans-serif';
    g.textAlign = 'right';
    g.textBaseline = 'alphabetic';
    g.fillText('B-04', W - m - 40, H - m - 40);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 8;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

function useRadial(inner: string, outer: string) {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [inner, outer]);
}

export function Bay({ reflective }: { reflective: boolean }) {
  const markings = useMarkings();
  const shadowTex = useRadial('rgba(0,0,0,0.92)', 'rgba(0,0,0,0)');
  const poolTex = useRadial('rgba(255,244,230,0.5)', 'rgba(255,244,230,0)');
  const spotTex = useRadial('rgba(130,145,170,0.12)', 'rgba(130,145,170,0)');
  const rail = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 0.2, 0.06), toneMapped: false }), []);

  // El piso no debe recibir la luz del estudio (los paneles existen para el
  // reflejo del coche). Desde three r163 la luz ambiente de la escena no se
  // apaga con envMapIntensity: hay que darle al material su propio entorno,
  // y aquí ese entorno es negro.
  const noEnv = useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    t.mapping = THREE.EquirectangularReflectionMapping;
    t.needsUpdate = true;
    return t;
  }, []);

  const shadow = useRef<THREE.Mesh>(null!);
  const pool = useRef<THREE.Mesh>(null!);
  const runways = useRef<THREE.Group>(null!);
  const bars = useRef<THREE.Mesh[]>([]);
  const st = useRef({ key: { ...KEYS[0] } as Key, lift: 0, head: 0 });

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    const s = st.current;
    const k = sample(live.s, s.key);
    s.lift = damp(s.lift, k.lift, 3.2, dt);
    s.head = damp(s.head, k.head * (1 - k.xray) * (1 - k.explode), 4, dt);
    const { runway, car } = liftHeights(s.lift);

    // En reposo la plataforma queda al ras del piso; sale al empezar a subir.
    runways.current.position.y = runway - 0.035 - (1 - Math.min(1, s.lift * 5)) * 0.062;
    // Tijera: dos barras cruzadas por lado que se abren con la altura.
    const BAR = 2.1;
    const rise = Math.max(0.0001, runway - 0.07);
    const ang = Math.asin(Math.min(0.98, rise / BAR));
    bars.current.forEach((b, i) => {
      if (!b) return;
      b.rotation.z = i % 2 === 0 ? ang : -ang;
      b.position.y = 0.035 + rise / 2;
      b.visible = rise > 0.02;
    });

    (shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.85 - Math.min(0.5, car * 0.45);
    const sc = 1 + car * 0.25;
    shadow.current.scale.set(6.4 * sc, 3.3 * sc, 1);
    (pool.current.material as THREE.MeshBasicMaterial).opacity = 0.55 * s.head * (1 - Math.min(1, car));
    // El filo de la plataforma se enciende al subir.
    const glow = 0.03 + 0.97 * Math.min(1, s.lift * 1.6);
    rail.color.setRGB(2.2 * glow, 0.68 * glow, 0.15 * glow);
  });

  return (
    <group>
      {/* Piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[90, 90]} />
        {reflective ? (
          <MeshReflectorMaterial
            resolution={1024}
            blur={[380, 110]}
            mixBlur={1}
            mixStrength={1.6}
            roughness={1}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.3}
            color="#030405"
            metalness={0.3}
            mirror={0}
            envMap={noEnv}
            envMapIntensity={0}
          />
        ) : (
          <meshStandardMaterial color="#030405" roughness={0.75} metalness={0.3} envMap={noEnv} envMapIntensity={0} />
        )}
      </mesh>

      {/* Luz de estudio sobre el piso: lo ilumina cerca del coche y lo deja caer a negro */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} scale={[18, 18, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={spotTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Marcas pintadas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[8.6, 4.3]} />
        <meshBasicMaterial map={markings} transparent opacity={0.34} depthWrite={false} />
      </mesh>

      {/* Sombra de contacto y charco de luz de los faros */}
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]} scale={[6.4, 3.3, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
      </mesh>
      <mesh ref={pool} rotation={[-Math.PI / 2, 0, 0]} position={[4.6, 0.01, 0]} scale={[5.2, 3.6, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={poolTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Tubos de luz del techo */}
      {[-1.9, 0, 1.9].map((z) => (
        // Planos que miran hacia abajo: desde arriba no se ven.
        <mesh key={z} position={[0, 4.6, z]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7.5, 0.14]} />
          <meshBasicMaterial color={[2.4, 2.5, 2.7]} toneMapped={false} />
        </mesh>
      ))}

      {/* Elevador de tijera */}
      <group ref={runways}>
        {[0.46, -0.46].map((z) => (
          <group key={z} position={[0, 0, z]}>
            <mesh>
              <boxGeometry args={[2.3, 0.07, 0.44]} />
              <meshStandardMaterial color="#0C1014" metalness={0.5} roughness={0.6} />
            </mesh>
            <mesh position={[0, 0, z > 0 ? 0.225 : -0.225]}>
              <boxGeometry args={[2.3, 0.074, 0.012]} />
              <primitive object={rail} attach="material" />
            </mesh>
          </group>
        ))}
      </group>
      {[0.46, 0.46, -0.46, -0.46].map((z, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) bars.current[i] = m;
          }}
          position={[0, 0.035, z + (i % 2 === 0 ? 0.06 : -0.06)]}
        >
          <boxGeometry args={[2.1, 0.06, 0.05]} />
          <meshStandardMaterial color="#2A323D" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
