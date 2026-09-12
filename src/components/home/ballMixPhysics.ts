import { BALL_MIX_CONFIG } from "./ballMixConfig";

export type BallVector = [number, number, number];
export const BALL_RADIUS = 0.3;
export const CHAMBER_RADIUS = 3.6;
export const CHAMBER_HALF_DEPTH = 1.05;
// Leave room for a fast burst between physics steps, before the visible wall.
const BOUNDARY_MARGIN = 0.12;
export const BALL_CENTER_LIMIT = CHAMBER_RADIUS - BALL_RADIUS - BOUNDARY_MARGIN;
export const BALL_DEPTH_LIMIT =
  CHAMBER_HALF_DEPTH - BALL_RADIUS - BOUNDARY_MARGIN;
export const MAX_BALL_SPEED = BALL_MIX_CONFIG.maxBallSpeed;

// A closed safety boundary complements discrete collision detection, including
// delayed Worker frames. Keep the rendered position and physics body in sync.
export function constrainBall(position: BallVector, velocity: BallVector) {
  const nextPosition: BallVector = [...position];
  const nextVelocity: BallVector = [...velocity];
  const radius = Math.hypot(position[0], position[1]);
  let corrected = false;
  if (radius > BALL_CENTER_LIMIT) {
    const nx = position[0] / radius;
    const ny = position[1] / radius;
    nextPosition[0] = nx * BALL_CENTER_LIMIT;
    nextPosition[1] = ny * BALL_CENTER_LIMIT;
    const outward = velocity[0] * nx + velocity[1] * ny;
    if (outward > 0) {
      nextVelocity[0] -= nx * outward * 1.25;
      nextVelocity[1] -= ny * outward * 1.25;
    }
    corrected = true;
  }
  if (Math.abs(position[2]) > BALL_DEPTH_LIMIT) {
    nextPosition[2] = Math.sign(position[2]) * BALL_DEPTH_LIMIT;
    if (velocity[2] * position[2] > 0) nextVelocity[2] *= -0.25;
    corrected = true;
  }
  const speed = Math.hypot(...nextVelocity);
  if (speed > MAX_BALL_SPEED) {
    const scale = MAX_BALL_SPEED / speed;
    nextVelocity[0] *= scale;
    nextVelocity[1] *= scale;
    nextVelocity[2] *= scale;
    corrected = true;
  }
  return { position: nextPosition, velocity: nextVelocity, corrected };
}

// Apply impulses over elapsed time, instead of accumulating a force every
// render frame. High-refresh-rate displays must not mix the balls faster.
export function mixingImpulse(
  position: BallVector,
  velocity: BallVector,
  time: number,
  index: number,
  delta: number,
): BallVector {
  const [x, y, z] = position;
  const speed = BALL_MIX_CONFIG.mixSpeed;
  const ax =
    (-y * 0.34 * speed - velocity[0]) * 0.7 -
    x * 0.1 +
    Math.sin(time * 0.65 * speed + index) * 0.38 * Math.sqrt(speed);
  const ay =
    (x * 0.34 * speed - velocity[1]) * 0.7 -
    y * 0.1 +
    1.2 +
    Math.cos(time * 0.55 * speed + index * 1.7) * 0.38 * Math.sqrt(speed);
  const az = -z * 1.4 - velocity[2] * 0.5 + Math.sin(time * 0.5 + index) * 0.3;
  const dt = Math.min(Math.max(delta, 0), 1 / 30);
  return [ax * dt, ay * dt, az * dt];
}

// A tap supplies a single radial impulse, independent of the render frame rate.
export function burstImpulse(
  position: BallVector,
  center: BallVector,
  index: number,
): BallVector {
  const dx = position[0] - center[0];
  const dy = position[1] - center[1];
  const distance = Math.hypot(dx, dy);
  if (distance >= BALL_MIX_CONFIG.burstRadius) return [0, 0, 0];
  // A ball directly under the pointer still gets a defined outward direction.
  const angle = index * 2.399963;
  const nx = distance > 0.001 ? dx / distance : Math.cos(angle);
  const ny = distance > 0.001 ? dy / distance : Math.sin(angle);
  const falloff = 1 - (distance / BALL_MIX_CONFIG.burstRadius) ** 2;
  const strength = BALL_MIX_CONFIG.burstStrength * falloff;
  return [nx * strength, ny * strength, 0];
}
