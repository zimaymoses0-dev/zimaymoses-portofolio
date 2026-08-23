import { Float } from "@react-three/drei";
import { MiniScene } from "../lib/MiniScene";
import { BrowserWindow, UICard, AbstractCube, GlassSphere } from "./ThreeObjects";

export function LabScene() {
  return (
    <MiniScene cameraZ={5}>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.6}>
        <BrowserWindow position={[0, 0.2, 0]} rotation={[0, -0.15, 0]} />
      </Float>
      <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.9} position={[-1.5, -0.6, 0.5]}>
        <UICard position={[0, 0, 0]} rotation={[0, 0.3, 0.15]} color="#ff0099" />
      </Float>
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8} position={[1.6, -0.4, 0.6]}>
        <UICard position={[0, 0, 0]} rotation={[0, -0.4, -0.1]} color="#181818" />
      </Float>
      <Float speed={1.6} rotationIntensity={0.4} floatIntensity={1} position={[1.3, 0.9, -0.5]}>
        <AbstractCube position={[0, 0, 0]} rotation={[0.3, 0.5, 0]} />
      </Float>
      <Float speed={1.8} rotationIntensity={0.2} floatIntensity={1.1} position={[-1.4, 1, -0.4]}>
        <GlassSphere position={[0, 0, 0]} scale={0.9} />
      </Float>
    </MiniScene>
  );
}
