import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Text } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import type { SectionId } from "../data/sections";
import { sections } from "../data/sections";
import { useAppStore } from "../store/useAppStore";

interface ObjectSlotProps {
  sectionId: SectionId;
  position: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
}

function ObjectSlot({ sectionId, position, rotation = [0, 0, 0], children }: ObjectSlotProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<Group>(null);
  const openSection = useAppStore((s) => s.openSection);
  const section = sections[sectionId];

  useFrame(() => {
    if (!groupRef.current) return;
    const targetScale = hovered ? 1.12 : 1;
    const next = MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15);
    groupRef.current.scale.setScalar(next);
  });

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          openSection(sectionId);
        }}
      >
        {children}
        <Text
          position={[0, -0.95, 0]}
          fontSize={0.14}
          color={hovered ? "#ffffff" : "#8a8a99"}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.15}
        >
          {section.objectLabel}
        </Text>
      </group>
    </Float>
  );
}

export function ScreenObject(props: { position: [number, number, number] }) {
  return (
    <ObjectSlot sectionId="work" position={props.position}>
      <RoundedBox args={[1.4, 0.9, 0.08]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#15151d" />
      </RoundedBox>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[1.2, 0.7]} />
        <meshStandardMaterial color="#5865ff" emissive="#5865ff" emissiveIntensity={0.6} />
      </mesh>
      <RoundedBox args={[0.5, 0.06, 0.06]} radius={0.02} position={[0, -0.55, 0]}>
        <meshStandardMaterial color="#15151d" />
      </RoundedBox>
    </ObjectSlot>
  );
}

export function NotebookObject(props: { position: [number, number, number] }) {
  return (
    <ObjectSlot sectionId="about" position={props.position} rotation={[-0.3, 0, 0]}>
      <RoundedBox args={[1.1, 0.75, 0.06]} radius={0.03} smoothness={4}>
        <meshStandardMaterial color="#f4f1ea" />
      </RoundedBox>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[0.9, 0.55]} />
        <meshStandardMaterial color="#dedad0" />
      </mesh>
    </ObjectSlot>
  );
}

export function FilesObject(props: { position: [number, number, number] }) {
  return (
    <ObjectSlot sectionId="services" position={props.position}>
      {[0, 1, 2].map((i) => (
        <RoundedBox
          key={i}
          args={[1.0, 0.7, 0.08]}
          radius={0.04}
          smoothness={4}
          position={[i * 0.06, -i * 0.12, -i * 0.08]}
        >
          <meshStandardMaterial color={i === 0 ? "#ffb84d" : "#caa15f"} />
        </RoundedBox>
      ))}
    </ObjectSlot>
  );
}

export function PhoneObject(props: { position: [number, number, number] }) {
  return (
    <ObjectSlot sectionId="digital-lab" position={props.position}>
      <RoundedBox args={[0.55, 1.1, 0.08]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color="#1c1c24" />
      </RoundedBox>
      <mesh position={[0, 0.03, 0.045]}>
        <planeGeometry args={[0.45, 0.85]} />
        <meshStandardMaterial color="#ff5c8a" emissive="#ff5c8a" emissiveIntensity={0.5} />
      </mesh>
    </ObjectSlot>
  );
}

export function CameraObject(props: { position: [number, number, number] }) {
  return (
    <ObjectSlot sectionId="visual-lab" position={props.position}>
      <RoundedBox args={[1.0, 0.6, 0.5]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color="#2b2b33" />
      </RoundedBox>
      <mesh position={[0, 0.1, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.35, 24]} />
        <meshStandardMaterial color="#0d0d10" />
      </mesh>
      <mesh position={[0, 0.1, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.05, 24]} />
        <meshStandardMaterial color="#5cd0ff" emissive="#5cd0ff" emissiveIntensity={0.4} />
      </mesh>
    </ObjectSlot>
  );
}

export function CardObject(props: { position: [number, number, number] }) {
  return (
    <ObjectSlot sectionId="contact" position={props.position} rotation={[0, 0.4, 0]}>
      <RoundedBox args={[1.0, 0.6, 0.03]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#101014" />
      </RoundedBox>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.7, 0.15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </ObjectSlot>
  );
}
