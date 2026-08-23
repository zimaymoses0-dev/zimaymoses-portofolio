import { useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { isWebGLSupported } from "./webglSupport";

function ParallaxGroup({ children, reduceMotion }: { children: ReactNode; reduceMotion: boolean }) {
  const ref = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reduceMotion) return;
    function handleMove(e: MouseEvent) {
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [reduceMotion]);

  useFrame((_, delta) => {
    if (!ref.current || reduceMotion) return;
    ref.current.rotation.y += delta * 0.08;
    const targetX = pointer.current.y * 0.15;
    ref.current.rotation.x += (targetX - ref.current.rotation.x) * 0.05;
  });

  return <group ref={ref}>{children}</group>;
}

export function MiniScene({
  children,
  cameraZ = 4,
  fallbackClassName = "faq-scene-fallback",
  lightColorA = "#ff0099",
  lightColorB = "#d900ff",
}: {
  children: ReactNode;
  cameraZ?: number;
  fallbackClassName?: string;
  lightColorA?: string;
  lightColorB?: string;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [supported] = useState(isWebGLSupported);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (!supported) {
    return <div className={fallbackClassName} />;
  }

  return (
    <Canvas camera={{ position: [0, 0, cameraZ], fov: 40 }} gl={{ alpha: true }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 3]} intensity={1} color="#ffffff" />
      <pointLight position={[-3, -1, 2]} intensity={12} color={lightColorA} />
      <pointLight position={[3, 2, -2]} intensity={10} color={lightColorB} />
      <ParallaxGroup reduceMotion={reduceMotion}>{children}</ParallaxGroup>
    </Canvas>
  );
}
