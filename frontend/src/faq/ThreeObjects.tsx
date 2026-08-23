import { RoundedBox, Text } from "@react-three/drei";

const MAGENTA = "#ff0099";
const VIOLET = "#d900ff";

export function MiniMonitor(props: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={props.position} rotation={props.rotation}>
      <RoundedBox args={[1.3, 0.85, 0.06]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#111111" metalness={0.4} roughness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[1.1, 0.65]} />
        <meshStandardMaterial color="#0a0a0a" emissive={MAGENTA} emissiveIntensity={0.25} />
      </mesh>
      <Text position={[0, 0.1, 0.05]} fontSize={0.11} color="#f5f5f5" anchorX="center" anchorY="middle">
        MZ
      </Text>
      <Text position={[0, -0.08, 0.05]} fontSize={0.07} color="#f5f5f5" anchorX="center" anchorY="middle">
        CREATIVE ROOM
      </Text>
      <RoundedBox args={[0.4, 0.06, 0.06]} radius={0.02} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#111111" />
      </RoundedBox>
    </group>
  );
}

export function MiniCamera(props: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={props.position} rotation={props.rotation}>
      <RoundedBox args={[0.75, 0.5, 0.4]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color="#161616" metalness={0.6} roughness={0.25} />
      </RoundedBox>
      <mesh position={[0, 0.08, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.3, 24]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.08, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.04, 24]} />
        <meshStandardMaterial color={MAGENTA} emissive={MAGENTA} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export function MiniPhone(props: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={props.position} rotation={props.rotation}>
      <RoundedBox args={[0.42, 0.85, 0.05]} radius={0.07} smoothness={4}>
        <meshStandardMaterial color="#0e0e0e" metalness={0.5} roughness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[0.34, 0.68]} />
        <meshStandardMaterial color="#0a0a0a" emissive={VIOLET} emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, 0.14, 0.04]} fontSize={0.045} color="#f5f5f5" anchorX="center">
        IDEAS
      </Text>
      <Text position={[0, 0, 0.04]} fontSize={0.045} color="#f5f5f5" anchorX="center">
        DIGITAL
      </Text>
      <Text position={[0, -0.14, 0.04]} fontSize={0.045} color="#f5f5f5" anchorX="center">
        EXPERIENCE
      </Text>
    </group>
  );
}

export function GlassSphere(props: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={props.position} scale={props.scale ?? 1}>
      <sphereGeometry args={[0.35, 32, 32]} />
      <meshPhysicalMaterial
        color="#ffffff"
        transmission={0.9}
        roughness={0.05}
        thickness={0.5}
        metalness={0}
        clearcoat={1}
      />
    </mesh>
  );
}

export function AbstractCube(props: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <mesh position={props.position} rotation={props.rotation}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.2} emissive={MAGENTA} emissiveIntensity={0.08} />
    </mesh>
  );
}

export function BrowserWindow(props: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={props.position} rotation={props.rotation}>
      <RoundedBox args={[1.4, 0.95, 0.04]} radius={0.04} smoothness={4}>
        <meshStandardMaterial color="#111111" metalness={0.3} roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0.02, 0.03]}>
        <planeGeometry args={[1.28, 0.7]} />
        <meshStandardMaterial color="#0a0a0a" emissive={VIOLET} emissiveIntensity={0.2} />
      </mesh>
      {[-0.55, -0.45, -0.35].map((x, i) => (
        <mesh key={x} position={[x, 0.42, 0.03]}>
          <circleGeometry args={[0.02, 16]} />
          <meshStandardMaterial color={i === 0 ? MAGENTA : "#555"} />
        </mesh>
      ))}
    </group>
  );
}

export function UICard(props: { position: [number, number, number]; rotation?: [number, number, number]; color?: string }) {
  return (
    <RoundedBox
      args={[0.5, 0.35, 0.03]}
      radius={0.03}
      smoothness={4}
      position={props.position}
      rotation={props.rotation}
    >
      <meshStandardMaterial color={props.color ?? "#181818"} metalness={0.3} roughness={0.5} />
    </RoundedBox>
  );
}

export function QuestionMarkBlob(props: { position: [number, number, number] }) {
  return (
    <group position={props.position}>
      <mesh position={[0, 0.18, 0]}>
        <torusGeometry args={[0.16, 0.06, 16, 32, Math.PI * 1.4]} />
        <meshStandardMaterial color={MAGENTA} emissive={MAGENTA} emissiveIntensity={0.3} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0.05, -0.05, 0]} rotation={[0, 0, -0.5]}>
        <capsuleGeometry args={[0.05, 0.15, 6, 12]} />
        <meshStandardMaterial color={MAGENTA} emissive={MAGENTA} emissiveIntensity={0.3} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.32, 0]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color={MAGENTA} emissive={MAGENTA} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

export function MessageBubble(props: { position: [number, number, number] }) {
  return (
    <group position={props.position}>
      <RoundedBox args={[0.9, 0.55, 0.08]} radius={0.18} smoothness={4}>
        <meshStandardMaterial color="#161616" metalness={0.3} roughness={0.4} emissive={VIOLET} emissiveIntensity={0.12} />
      </RoundedBox>
      <mesh position={[-0.25, -0.32, 0]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.16, 0.16, 0.06]} />
        <meshStandardMaterial color="#161616" />
      </mesh>
    </group>
  );
}
