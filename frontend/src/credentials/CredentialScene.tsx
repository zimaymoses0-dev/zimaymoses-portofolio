import { Float } from "@react-three/drei";
import { MiniScene } from "../lib/MiniScene";
import { Certificate3D, Badge3D } from "./CredentialObjects";

export function CredentialHeroScene() {
  return (
    <MiniScene cameraZ={4.2} fallbackClassName="cred-scene-fallback" lightColorA="#ff0099" lightColorB="#7c4dff">
      <Float speed={1} rotationIntensity={0.25} floatIntensity={0.7}>
        <Certificate3D position={[0, 0.1, 0]} rotation={[0.08, -0.25, 0.05]} scale={1.5} />
      </Float>
      <Float speed={1.6} rotationIntensity={0.3} floatIntensity={1} position={[1.4, -0.9, 0.5]}>
        <Badge3D position={[0, 0, 0]} rotation={[0.3, 0.4, 0]} />
      </Float>
    </MiniScene>
  );
}

export function CredentialFinalScene() {
  return (
    <MiniScene cameraZ={5} fallbackClassName="cred-scene-fallback" lightColorA="#ff0099" lightColorB="#7c4dff">
      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.6}>
        <Certificate3D position={[0, 0, 0]} rotation={[0.1, 0.3, -0.05]} scale={1.1} />
      </Float>
    </MiniScene>
  );
}
