import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";

const TARGET_HORIZONTAL_FOV_DEG = 68;

export function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!("fov" in camera)) return;

    const aspect = size.width / size.height;
    const hFovRad = (TARGET_HORIZONTAL_FOV_DEG * Math.PI) / 180;
    const vFovRad = 2 * Math.atan(Math.tan(hFovRad / 2) / aspect);
    const vFovDeg = (vFovRad * 180) / Math.PI;
    const clamped = Math.min(120, Math.max(45, vFovDeg));

    const perspectiveCamera = camera as PerspectiveCamera;
    perspectiveCamera.fov = clamped;
    perspectiveCamera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}
