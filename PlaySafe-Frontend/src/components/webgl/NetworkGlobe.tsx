import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 32;
const EDGE_PAIRS = 50;

function NetworkNodes() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const { positions, linePositions, colors } = useMemo(() => {
    const pos = new Float32Array(NODE_COUNT * 3);
    const col = new Float32Array(NODE_COUNT * 3);
    const cyan = new THREE.Color("hsl(187, 100%, 50%)");
    const accent = new THREE.Color("hsl(36, 100%, 55%)");

    for (let i = 0; i < NODE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1.5 + Math.random() * 0.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const c = Math.random() < 0.3 ? accent : cyan;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    const linePosArr = new Float32Array(EDGE_PAIRS * 6);
    for (let i = 0; i < EDGE_PAIRS; i++) {
      const a = Math.floor(Math.random() * NODE_COUNT);
      const b = Math.floor(Math.random() * NODE_COUNT);
      linePosArr[i * 6] = pos[a * 3];
      linePosArr[i * 6 + 1] = pos[a * 3 + 1];
      linePosArr[i * 6 + 2] = pos[a * 3 + 2];
      linePosArr[i * 6 + 3] = pos[b * 3];
      linePosArr[i * 6 + 4] = pos[b * 3 + 1];
      linePosArr[i * 6 + 5] = pos[b * 3 + 2];
    }

    return { positions: pos, linePositions: linePosArr, colors: col };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.2;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t;
      pointsRef.current.rotation.x = Math.sin(t * 0.5) * 0.15;
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = t;
      linesRef.current.rotation.x = Math.sin(t * 0.5) * 0.15;
    }
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} vertexColors transparent opacity={0.9} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="hsl(187, 100%, 50%)" transparent opacity={0.08} />
      </lineSegments>
    </>
  );
}

interface NetworkGlobeProps {
  className?: string;
}

const NetworkGlobe = ({ className = "" }: NetworkGlobeProps) => (
  <div className={`pointer-events-none ${className}`}>
    <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 1.5]} style={{ background: "transparent" }} gl={{ alpha: true, antialias: false }}>
      <NetworkNodes />
    </Canvas>
  </div>
);

export default NetworkGlobe;
