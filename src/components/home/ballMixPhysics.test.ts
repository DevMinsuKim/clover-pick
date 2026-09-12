import { describe, expect, it } from "vitest";
import { BALL_MIX_CONFIG, boundedSetting } from "./ballMixConfig";
import {
  BALL_CENTER_LIMIT,
  BALL_DEPTH_LIMIT,
  type BallVector,
  burstImpulse,
  constrainBall,
  MAX_BALL_SPEED,
  mixingImpulse,
} from "./ballMixPhysics";

describe("추첨기 공의 경계와 속도", () => {
  it("빠르게 통과한 공도 반지름과 깊이 안으로 복원하고 바깥쪽 속도를 되돌린다", () => {
    for (let index = 0; index < 64; index++) {
      const angle = (index / 64) * Math.PI * 2;
      const nx = Math.cos(angle),
        ny = Math.sin(angle);
      const side = index % 2 ? 1 : -1;
      const state = constrainBall(
        [nx * 20, ny * 20, side * 8],
        [nx * 50, ny * 50, side * 20],
      );
      expect(
        Math.hypot(state.position[0], state.position[1]),
      ).toBeLessThanOrEqual(BALL_CENTER_LIMIT + 1e-10);
      expect(Math.abs(state.position[2])).toBeLessThanOrEqual(BALL_DEPTH_LIMIT);
      expect(Math.hypot(...state.velocity)).toBeLessThanOrEqual(
        MAX_BALL_SPEED + 1e-10,
      );
      expect(state.velocity[0] * nx + state.velocity[1] * ny).toBeLessThan(0);
      expect(state.velocity[2] * side).toBeLessThan(0);
    }
  });

  it("안쪽으로 돌아오는 공의 방향과 정상 범위의 공은 보존한다", () => {
    const returning = constrainBall([4, 0, 0], [-1, 0.2, 0]);
    expect(returning.velocity).toEqual([-1, 0.2, 0]);
    const position: BallVector = [0, 0, 0];
    const velocity: BallVector = [0, 0, 0];
    const resting = constrainBall(position, velocity);
    expect(resting.corrected).toBe(false);
    expect(resting.position).toEqual(position);
    expect(resting.velocity).toEqual(velocity);
  });

  it("화면 갱신 빈도가 달라도 같은 시간 동안 전달하는 힘은 같다", () => {
    function totalImpulse(fps: number) {
      const result = [0, 0, 0];
      for (let frame = 0; frame < fps; frame++) {
        const impulse = mixingImpulse(
          [1, -1, 0.4],
          [0.2, 0.3, 0],
          2,
          7,
          1 / fps,
        );
        for (let axis = 0; axis < 3; axis++) result[axis] += impulse[axis];
      }
      return result;
    }
    const baseline = totalImpulse(60);
    for (const fps of [30, 120, 144]) {
      totalImpulse(fps).forEach((value, axis) => {
        expect(value).toBeCloseTo(baseline[axis], 10);
      });
    }
  });

  it("복귀 직후 긴 프레임에도 기본 섞기 힘이 급증하지 않는다", () => {
    const longFrame = mixingImpulse([1, 0, 0], [0, 0, 0], 1, 0, 10);
    const normalFrame = mixingImpulse([1, 0, 0], [0, 0, 0], 1, 0, 1 / 30);
    expect(longFrame).toEqual(normalFrame);
    expect(longFrame.every(Number.isFinite)).toBe(true);
    expect(Math.hypot(...longFrame)).toBeLessThan(0.1);
  });
});

describe("클릭·탭 충격과 조정 범위", () => {
  it("충격 반경 안쪽 공만 클릭 위치에서 바깥 방향으로 밀어낸다", () => {
    const radius = BALL_MIX_CONFIG.burstRadius;
    const near = burstImpulse([radius * 0.2, 0, 0], [0, 0, 0], 1);
    const far = burstImpulse([radius * 0.8, 0, 0], [0, 0, 0], 1);
    expect(near[0]).toBeGreaterThan(far[0]);
    expect(far[0]).toBeGreaterThan(0);
    expect(near[1]).toBe(0);
    expect(burstImpulse([radius, 0, 0], [0, 0, 0], 1)).toEqual([0, 0, 0]);
  });

  it("클릭 지점에 겹친 공에도 유한한 충격을 주고 연속 충격은 속도 상한으로 제한한다", () => {
    const kick = burstImpulse([0, 0, 0], [0, 0, 0], 0);
    expect(kick.every(Number.isFinite)).toBe(true);
    expect(Math.hypot(...kick)).toBeCloseTo(BALL_MIX_CONFIG.burstStrength);
    let velocity: BallVector = [0, 0, 0];
    for (let tap = 0; tap < 20; tap++) {
      velocity = constrainBall(
        [0, 0, 0],
        [velocity[0] + kick[0], velocity[1] + kick[1], velocity[2] + kick[2]],
      ).velocity;
    }
    expect(Math.hypot(...velocity)).toBeLessThanOrEqual(MAX_BALL_SPEED);
  });

  it("직접 수정한 설정값이 범위를 넘거나 숫자가 아니면 허용 범위로 보정한다", () => {
    expect(boundedSetting({ value: 100, min: 1, max: 7 })).toBe(7);
    expect(boundedSetting({ value: -2, min: 1, max: 7 })).toBe(1);
    expect(boundedSetting({ value: Number.NaN, min: 1, max: 7 })).toBe(1);
    expect(boundedSetting({ value: 4.8, min: 1, max: 7 })).toBe(4.8);
  });
});
