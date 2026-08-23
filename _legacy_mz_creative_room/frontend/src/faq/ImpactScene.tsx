import { Float } from "@react-three/drei";
import { MiniScene } from "../lib/MiniScene";
import { MiniPhone, MiniCamera, AbstractCube, GlassSphere, UICard } from "./ThreeObjects";

export function ImpactScene() {
  return (
    <MiniScene cameraZ={5.5}>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.6}>
        <UICard position={[-1, 0.3, 0]} rotation={[0, 0.3, 0.1]} color="#161616" />
      </Float>
      <Float speed={1.3} rotationIntensity={0.3} floatIntensity={0.9} position={[0.9, -0.2, 0.5]}>
        <MiniPhone position={[0, 0, 0]} rotation={[0, -0.4, 0]} />
      </Float>
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1} position={[-1.6, -0.8, -0.4]}>
        <MiniCamera position={[0, 0, 0]} rotation={[0, 0.6, 0]} />
      </Float>
      <Float speed={1.6} rotationIntensity={0.2} floatIntensity={1.1} position={[1.7, 0.9, -0.6]}>
        <AbstractCube position={[0, 0, 0]} rotation={[0.4, 0.4, 0]} />
      </Float>
      <Float speed={1.9} rotationIntensity={0.1} floatIntensity={1.3} position={[0.2, 1.2, 0.3]}>
        <GlassSphere position={[0, 0, 0]} scale={0.8} />
      </Float>
    </MiniScene>
  );
}
