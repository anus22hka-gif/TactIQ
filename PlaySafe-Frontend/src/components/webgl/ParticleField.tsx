import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";

const PARTICLE_COUNT = 800;

function Particles() {
  const meshRef = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const sz = new Float32Array(PARTICLE_COUNT);
    const green = new THREE.Color("hsl(152, 68%, 45%)");
    const lime = new THREE.Color("hsl(140, 60%, 50%)");
    const dim = new THREE.Color("hsl(152, 20%, 80%)");

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6.5;

      const t = Math.random();
      const c = t < 0.18 ? green : t < 0.36 ? lime : dim;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      sz[i] = Math.random() * 3 + 0.6;
    }
    return [pos, col, sz];
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime() * 0.18;
    meshRef.current.rotation.y = time;
    meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.12;
    const posArr = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      posArr[i * 3 + 1] += Math.sin(time * 2 + i * 0.1) * 0.0012;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.x = t * 0.22;
    ref.current.rotation.z = t * 0.16;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <torusGeometry args={[2.2, 0.015, 16, 100]} />
      <meshBasicMaterial color="hsl(152, 68%, 45%)" transparent opacity={0.22} />
    </mesh>
  );
}

function FloatingRing2() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.26;
    ref.current.rotation.x = t * 0.12 + 1;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <torusGeometry args={[1.6, 0.01, 16, 80]} />
      <meshBasicMaterial color="hsl(140, 60%, 50%)" transparent opacity={0.18} />
    </mesh>
  );
}

const ParticleField = () => (
  <div className="absolute inset-0 pointer-events-none">
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
      gl={{ alpha: true, antialias: false }}
    >
      <ambientLight intensity={0.3} />
      <spotLight position={[5, 8, 5]} angle={0.35} penumbra={0.6} intensity={0.9} color={"#34d399"} />
      <spotLight position={[-5, -6, -4]} angle={0.3} penumbra={0.6} intensity={0.6} color={"#22c55e"} />
      <Grid args={[30, 30]} cellSize={0.6} cellThickness={0.7} sectionSize={3} sectionThickness={1.2} fadeDistance={20} position={[0, -2.5, -4]} infinite gridColor={"#16a34a"} sectionColor={"#34d399"} />
      <Particles />
      <FloatingRing />
      <FloatingRing2 />
    </Canvas>
  </div>
);

export default ParticleField;
