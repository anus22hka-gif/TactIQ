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
  { name: "Head", pos: [0, 3.8, 0], risk: "low", size: 0.28 },
  { name: "Neck", pos: [0, 3.2, 0], risk: "low", size: 0.16 },
  { name: "L.Shoulder", pos: [-0.8, 2.9, 0], risk: "low", size: 0.18 },
  { name: "R.Shoulder", pos: [0.8, 2.9, 0], risk: "low", size: 0.18 },
  { name: "L.Elbow", pos: [-1.2, 2.2, 0], risk: "low", size: 0.14 },
  { name: "R.Elbow", pos: [1.2, 2.2, 0], risk: "low", size: 0.14 },
  { name: "L.Wrist", pos: [-1.4, 1.5, 0], risk: "low", size: 0.1 },
  { name: "R.Wrist", pos: [1.4, 1.5, 0], risk: "low", size: 0.1 },
  { name: "Spine", pos: [0, 2.5, 0], risk: "medium", size: 0.18 },
  { name: "Pelvis", pos: [0, 1.8, 0], risk: "low", size: 0.2 },
  { name: "L.Hip", pos: [-0.5, 1.6, 0], risk: "low", size: 0.16 },
  { name: "R.Hip", pos: [0.5, 1.6, 0], risk: "high", size: 0.16 },
  { name: "L.Knee", pos: [-0.55, 0.9, 0.05], risk: "high", size: 0.16 },
  { name: "R.Knee", pos: [0.55, 0.9, 0.05], risk: "medium", size: 0.16 },
  { name: "L.Ankle", pos: [-0.55, 0.1, 0.08], risk: "medium", size: 0.12 },
  { name: "R.Ankle", pos: [0.55, 0.1, 0.08], risk: "low", size: 0.12 },
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

interface SkeletonProps {
  zones?: { id: string; level: "low" | "medium" | "high" }[];
}

function Skeleton({ zones }: SkeletonProps) {
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

  const jointRisks = useMemo(() => {
    const map: Record<string, "low" | "medium" | "high"> = {};
    const zoneMap: Record<string, string> = {
      "L.Shoulder": "left_shoulder",
      "R.Shoulder": "right_shoulder",
      "L.Hip": "left_hip",
      "R.Hip": "right_hip",
      "L.Knee": "left_knee",
      "R.Knee": "right_knee",
      "L.Ankle": "left_ankle",
      "R.Ankle": "right_ankle",
      Spine: "lower_back",
      Pelvis: "lower_back",
    };

    const riskByZone: Record<string, "low" | "medium" | "high"> = {};
    zones?.forEach((z) => {
      riskByZone[z.id] = z.level;
    });

    return joints.map((joint) => {
      const zoneId = zoneMap[joint.name];
      if (zoneId && riskByZone[zoneId]) {
        map[joint.name] = riskByZone[zoneId];
        return riskByZone[zoneId];
      }
      return joint.risk;
    });
  }, [zones]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    time.current = clock.getElapsedTime();

    groupRef.current.rotation.y = Math.sin(time.current * 0.3) * 0.25;
    groupRef.current.position.y = Math.sin(time.current * 0.5) * 0.05;

    jointRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const baseJoint = joints[i];
      const risk = jointRisks[i] || baseJoint.risk;
      if (risk === "high") {
        const pulse = 1 + Math.sin(time.current * 3 + i) * 0.3;
        mesh.scale.setScalar(pulse);
      } else if (risk === "medium") {
        const pulse = 1 + Math.sin(time.current * 2 + i) * 0.18;
        mesh.scale.setScalar(pulse);
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, -1.8, 0]}>
      <lineSegments geometry={boneGeom}>
        <lineBasicMaterial
          color="white"
          transparent
          opacity={0.85}
          linewidth={2}
        />
      </lineSegments>

      {joints.map((joint, i) => (
        <mesh
          key={joint.name}
          ref={(el) => { if (el) jointRefs.current[i] = el; }}
          position={joint.pos}
        >
          <sphereGeometry args={[joint.size, 24, 24]} />
          <meshStandardMaterial
            color={riskColors[jointRisks[i] || joint.risk]}
            emissive={riskColors[jointRisks[i] || joint.risk]}
            emissiveIntensity={(jointRisks[i] || joint.risk) === "high" ? 0.8 : (jointRisks[i] || joint.risk) === "medium" ? 0.4 : 0.15}
            transparent
            opacity={(jointRisks[i] || joint.risk) === "high" ? 0.95 : 0.75}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
      ))}

      {joints.map((joint, i) => {
        const risk = jointRisks[i] || joint.risk;
        if (risk !== "high") return null;
        return (
        <mesh key={`ring-${joint.name}`} position={joint.pos} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[joint.size * 2.2, 0.02, 10, 40]} />
          <meshBasicMaterial color={riskColors.high} transparent opacity={0.5} />
        </mesh>
      )})}
    </group>
  );
}

interface SkeletonModelProps {
  className?: string;
  zones?: { id: string; level: "low" | "medium" | "high" }[];
}

const SkeletonModel = ({ className = "", zones }: SkeletonModelProps) => (
  <div className={className}>
    <Canvas
      camera={{ position: [0, 1.2, 5.2], fov: 38 }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 6, 6]} intensity={0.9} color="hsl(187, 100%, 80%)" />
      <pointLight position={[-3, -2, 4]} intensity={0.5} color="hsl(36, 100%, 70%)" />
      <directionalLight position={[0, 4, 3]} intensity={0.4} color="white" />
      <Skeleton zones={zones} />
    </Canvas>
  </div>
);

export default SkeletonModel;
