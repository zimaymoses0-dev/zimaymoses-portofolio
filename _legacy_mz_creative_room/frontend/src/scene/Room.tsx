import { useState } from "react";
import { OrbitControls, ContactShadows, Sparkles } from "@react-three/drei";
import {
  ScreenObject,
  NotebookObject,
  FilesObject,
  PhoneObject,
  CameraObject,
  CardObject,
} from "./SceneObjects";
import { IntroCameraRig } from "./IntroCameraRig";
import { ResponsiveCamera } from "./ResponsiveCamera";
import { useAppStore } from "../store/useAppStore";

export function Room() {
  const entered = useAppStore((s) => s.entered);
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      <ResponsiveCamera />
      <color attach="background" args={["#08080c"]} />
      <fog attach="fog" args={["#08080c", 8, 18]} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} color="#ffffff" />
      <pointLight position={[-4, 2, -3]} intensity={20} color="#5865ff" />
      <pointLight position={[4, 1, -2]} intensity={15} color="#ff5c8a" />

      <Sparkles count={80} scale={[10, 6, 10]} size={2} speed={0.3} opacity={0.4} color="#ffffff" />

      <group position={[0, 0, 0]}>
        <ScreenObject position={[2.1, 0.6, 0]} />
        <NotebookObject position={[1.05, 0.1, 1.8]} />
        <FilesObject position={[-1.05, 0.1, 1.8]} />
        <PhoneObject position={[-2.1, 0.5, 0]} />
        <CameraObject position={[-1.05, 0.2, -1.8]} />
        <CardObject position={[1.05, 0.3, -1.8]} />
      </group>

      <ContactShadows position={[0, -0.9, 0]} opacity={0.5} scale={12} blur={2.5} far={4} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.92, 0]}>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#0d0d12" />
      </mesh>

      {entered && !introDone && <IntroCameraRig onDone={() => setIntroDone(true)} />}

      {introDone && (
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={6}
          maxDistance={11}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate
          autoRotateSpeed={0.4}
        />
      )}
    </>
  );
}
