import { useFrame } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  type Mesh,
  type MeshBasicMaterial,
} from "three";
import { BALL_MIX_CONFIG } from "./ballMixConfig";
import { type BallVector, CHAMBER_RADIUS } from "./ballMixPhysics";

export type BurstWave = { position: BallVector; age: number; active: boolean };
const SEGMENTS = 72;
const DURATION = 0.42;

export default function BallMixBurst({
  wave,
  running,
}: {
  wave: RefObject<BurstWave>;
  running: boolean;
}) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const geometry = useMemo(() => {
    const value = new BufferGeometry();
    value.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(SEGMENTS * 6 * 3), 3),
    );
    value.setDrawRange(0, 0);
    return value;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (!mesh.current || !material.current) return;
    const state = wave.current;
    if (!running) state.active = false;
    mesh.current.visible = state.active;
    if (!state.active) return;
    state.age += Math.min(delta, 1 / 30);
    const progress = Math.min(state.age / DURATION, 1);
    if (progress === 1) {
      state.active = false;
      mesh.current.visible = false;
      return;
    }
    const radius =
      0.12 + (BALL_MIX_CONFIG.burstRadius + 0.25) * (1 - (1 - progress) ** 2);
    const attribute = geometry.getAttribute("position");
    let vertex = 0;
    for (let segment = 0; segment < SEGMENTS; segment++) {
      const a = (segment / SEGMENTS) * Math.PI * 2;
      const b = ((segment + 1) / SEGMENTS) * Math.PI * 2;
      const points = [a, b].flatMap((angle) =>
        [radius - 0.025, radius + 0.025].map((r) => [
          state.position[0] + Math.cos(angle) * r,
          state.position[1] + Math.sin(angle) * r,
        ]),
      );
      // Trim the ring at the drum wall instead of drawing outside the chamber.
      if (points.some(([x, y]) => Math.hypot(x, y) > CHAMBER_RADIUS - 0.04))
        continue;
      for (const index of [0, 1, 2, 2, 1, 3]) {
        attribute.setXYZ(vertex++, points[index][0], points[index][1], 1.15);
      }
    }
    attribute.needsUpdate = true;
    geometry.setDrawRange(0, vertex);
    material.current.opacity = (1 - progress) * 0.65;
  });
  return (
    <mesh ref={mesh} geometry={geometry} visible={false} frustumCulled={false}>
      <meshBasicMaterial
        ref={material}
        color="#71bb94"
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
