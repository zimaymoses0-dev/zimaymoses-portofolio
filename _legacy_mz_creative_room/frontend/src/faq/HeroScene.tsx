import { Float } from "@react-three/drei";
import { MiniScene } from "../lib/MiniScene";
import { MiniMonitor, MiniCamera, MiniPhone, GlassSphere } from "./ThreeObjects";

export function HeroScene() {
  return (
    <MiniScene cameraZ={4.5}>
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8}>
        <MiniMonitor position={[0.3, 0.5, 0]} rotation={[0, -0.2, 0]} />
      </Float>
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1} position={[-1.4, -0.6, 0.6]}>
        <MiniCamera position={[0, 0, 0]} rotation={[0.1, 0.5, 0]} />
      </Float>
      <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.7} position={[1.5, -0.7, 0.4]}>
        <MiniPhone position={[0, 0, 0]} rotation={[0, -0.3, 0.1]} />
      </Float>
      <Float speed={1.8} rotationIntensity={0.2} floatIntensity={1.2} position={[-0.7, 1.1, -0.3]}>
        <GlassSphere position={[0, 0, 0]} scale={1.1} />
      </Float>
    </MiniScene>
  );
}
