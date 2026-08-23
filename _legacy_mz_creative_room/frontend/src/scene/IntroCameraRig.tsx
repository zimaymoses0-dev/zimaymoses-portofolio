import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";

const START = new Vector3(0, 5, 22);
const SETTLED = new Vector3(0, 2, 9);
const DURATION = 1.8;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function IntroCameraRig({ onDone }: { onDone: () => void }) {
  const { camera } = useThree();
  const elapsed = useRef(0);
  const finished = useRef(false);

  useEffect(() => {
    camera.position.copy(START);
    camera.lookAt(0, 0.3, 0);
  }, [camera]);

  useFrame((_, delta) => {
    if (finished.current) return;

    elapsed.current += delta;
    const t = Math.min(1, elapsed.current / DURATION);
    camera.position.lerpVectors(START, SETTLED, easeOutCubic(t));
    camera.lookAt(0, 0.3, 0);

    if (t >= 1) {
      finished.current = true;
      onDone();
    }
  });

  return null;
}
