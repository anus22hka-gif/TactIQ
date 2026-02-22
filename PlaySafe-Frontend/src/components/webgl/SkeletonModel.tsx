import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Joint {
  name: string;
  pos: [number, number, number];
  risk: "low" | "medium" | "high";
  size: number;
}

const joints: Joint[] = [
  { name: "Head", pos: [0, 3.6, 0], risk: "low", size: 0.22 },
  { name: "Neck", pos: [0, 3.2, 0], risk: "low", size: 0.12 },
  { name: "L.Shoulder", pos: [-0.7, 2.9, 0], risk: "low", size: 0.14 },
  { name: "R.Shoulder", pos: [0.7, 2.9, 0], risk: "low", size: 0.14 },
  { name: "L.Elbow", pos: [-1.1, 2.2, 0], risk: "low", size: 0.1 },
  { name: "R.Elbow", pos: [1.1, 2.2, 0], risk: "low", size: 0.1 },
  { name: "L.Wrist", pos: [-1.3, 1.5, 0], risk: "low", size: 0.08 },
  { name: "R.Wrist", pos: [1.3, 1.5, 0], risk: "low", size: 0.08 },
  { name: "Spine", pos: [0, 2.5, 0], risk: "medium", size: 0.14 },
  { name: "Pelvis", pos: [0, 1.8, 0], risk: "low", size: 0.16 },
  { name: "L.Hip", pos: [-0.4, 1.6, 0], risk: "low", size: 0.13 },
  { name: "R.Hip", pos: [0.4, 1.6, 0], risk: "high", size: 0.13 },
  { name: "L.Knee", pos: [-0.45, 0.9, 0.05], risk: "high", size: 0.12 },
  { name: "R.Knee", pos: [0.45, 0.9, 0.05], risk: "medium", size: 0.12 },
  { name: "L.Ankle", pos: [-0.45, 0.15, 0.08], risk: "medium", size: 0.1 },
  { name: "R.Ankle", pos: [0.45, 0.15, 0.08], risk: "low", size: 0.1 },
];

const bones: [number, number][] = [
  [0, 1], // head -> neck
  [1, 2], [1, 3], // neck -> shoulders
  [2, 4], [3, 5], // shoulders -> elbows
  [4, 6], [5, 7], // elbows -> wrists
  [1, 8], // neck -> spine
  [8, 9], // spine -> pelvis
  [9, 10], [9, 11], // pelvis -> hips
  [10, 12], [11, 13], // hips -> knees
  [12, 14], [13, 15], // knees -> ankles
];

const riskColors = {
  low: new THREE.Color("hsl(152, 70%, 45%)"),
  medium: new THREE.Color("hsl(36, 100%, 55%)"),
  high: new THREE.Color("hsl(0, 72%, 55%)"),
};

function Skeleton() {
  const groupRef = useRef<THREE.Group>(null);
  const jointRefs = useRef<THREE.Mesh[]>([]);
  const time = useRef(0);

  const boneGeom = useMemo(() => {
    const positions: number[] = [];
    bones.forEach(([a, b]) => {
      positions.push(...joints[a].pos, ...joints[b].pos);
    });
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geom;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    time.current = clock.getElapsedTime();
    
    // Gentle idle sway
    groupRef.current.rotation.y = Math.sin(time.current * 0.3) * 0.25;
    groupRef.current.position.y = Math.sin(time.current * 0.5) * 0.05;

    // Pulse high-risk joints
    jointRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const joint = joints[i];
      if (joint.risk === "high") {
        const pulse = 1 + Math.sin(time.current * 3 + i) * 0.25;
        mesh.scale.setScalar(pulse);
      } else if (joint.risk === "medium") {
        const pulse = 1 + Math.sin(time.current * 2 + i) * 0.12;
        mesh.scale.setScalar(pulse);
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, -1.9, 0]}>
      {/* Bones */}
      <lineSegments geometry={boneGeom}>
        <lineBasicMaterial
          color="hsl(210, 20%, 50%)"
          transparent
          opacity={0.5}
          linewidth={1}
        />
      </lineSegments>

      {/* Joints */}
      {joints.map((joint, i) => (
        <mesh
          key={joint.name}
          ref={(el) => { if (el) jointRefs.current[i] = el; }}
          position={joint.pos}
        >
          <sphereGeometry args={[joint.size, 16, 16]} />
          <meshStandardMaterial
            color={riskColors[joint.risk]}
            emissive={riskColors[joint.risk]}
            emissiveIntensity={joint.risk === "high" ? 0.8 : joint.risk === "medium" ? 0.4 : 0.15}
            transparent
            opacity={joint.risk === "high" ? 0.95 : 0.75}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
      ))}

      {/* Glow rings on high-risk joints */}
      {joints.filter((j) => j.risk === "high").map((joint) => (
        <mesh key={`ring-${joint.name}`} position={joint.pos} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[joint.size * 2, 0.015, 8, 32]} />
          <meshBasicMaterial color={riskColors.high} transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

interface SkeletonModelProps {
  className?: string;
}

const SkeletonModel = ({ className = "" }: SkeletonModelProps) => (
  <div className={className}>
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 40 }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 5, 5]} intensity={0.8} color="hsl(187, 100%, 80%)" />
      <pointLight position={[-3, -2, 3]} intensity={0.4} color="hsl(36, 100%, 70%)" />
      <Skeleton />
    </Canvas>
  </div>
);

export default SkeletonModel;
