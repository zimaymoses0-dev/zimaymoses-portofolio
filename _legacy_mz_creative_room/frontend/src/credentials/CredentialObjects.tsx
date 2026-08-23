import { RoundedBox, Text } from "@react-three/drei";

const PINK = "#ff0099";
const VIOLET = "#7c4dff";

export function Certificate3D(props: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={props.position} rotation={props.rotation} scale={props.scale ?? 1}>
      <RoundedBox args={[1.6, 1.15, 0.03]} radius={0.03} smoothness={4}>
        <meshStandardMaterial color="#f2ede4" roughness={0.85} metalness={0} />
      </RoundedBox>
      <mesh position={[0, 0, 0.017]}>
        <planeGeometry args={[1.44, 0.99]} />
        <meshStandardMaterial color="#f8f5ef" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.4, 0.019]}>
        <planeGeometry args={[0.5, 0.02]} />
        <meshStandardMaterial color={PINK} emissive={PINK} emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, 0.24, 0.02]} fontSize={0.075} color="#161116" anchorX="center" anchorY="middle">
        CERTIFICATE
      </Text>
      <Text position={[0, 0.02, 0.02]} fontSize={0.05} color="#3a3238" anchorX="center" anchorY="middle">
        MOSES Z. ZIMAY
      </Text>
      <Text position={[0, -0.14, 0.02]} fontSize={0.038} color="#6b6167" anchorX="center" anchorY="middle">
        CREATIVE / DIGITAL
      </Text>
      <mesh position={[0, -0.34, 0.02]}>
        <circleGeometry args={[0.045, 32]} />
        <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={0.4} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function Badge3D(props: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={props.position} rotation={props.rotation}>
      <mesh>
        <icosahedronGeometry args={[0.32, 1]} />
        <meshStandardMaterial color="#111111" metalness={0.85} roughness={0.15} emissive={PINK} emissiveIntensity={0.08} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.02, 16, 48]} />
        <meshStandardMaterial color={PINK} emissive={PINK} emissiveIntensity={0.5} metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function FloatingDocument(props: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={props.position} rotation={props.rotation}>
      <RoundedBox args={[0.9, 1.2, 0.02]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color="#efeae1" roughness={0.9} />
      </RoundedBox>
      {[0.32, 0.14, -0.04, -0.22].map((y) => (
        <mesh key={y} position={[0, y, 0.012]}>
          <planeGeometry args={[0.6, 0.03]} />
          <meshStandardMaterial color="#c9c2b8" />
        </mesh>
      ))}
    </group>
  );
}
