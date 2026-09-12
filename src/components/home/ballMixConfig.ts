export const BALL_MIX_SETTINGS = {
  // 기본 섞기 속도 배율: 이전의 느린 속도 = 1.
  mixSpeed: { value: 2, min: 0.5, max: 3 },
  // 클릭/탭 한 번의 충격 강도. 클수록 주변 공이 힘차게 퍼집니다.
  burstStrength: { value: 4.8, min: 1, max: 7 },
  // 충격의 반경. 통의 내부 반지름은 3.6입니다.
  burstRadius: { value: 1.7, min: 0.8, max: 2.5 },
  // 충돌·연속 클릭 후에도 적용되는 공의 이동 속도 상한.
  maxBallSpeed: { value: 6, min: 3, max: 8 },
  // 연속 충격 사이의 최소 간격(ms). 길게 누르고 있어도 반복하지 않습니다.
  burstCooldownMs: { value: 180, min: 100, max: 600 },
} as const;

export function boundedSetting(setting: {
  value: number;
  min: number;
  max: number;
}) {
  return Math.min(
    setting.max,
    Math.max(
      setting.min,
      Number.isFinite(setting.value) ? setting.value : setting.min,
    ),
  );
}

export const BALL_MIX_CONFIG = {
  mixSpeed: boundedSetting(BALL_MIX_SETTINGS.mixSpeed),
  burstStrength: boundedSetting(BALL_MIX_SETTINGS.burstStrength),
  burstRadius: boundedSetting(BALL_MIX_SETTINGS.burstRadius),
  maxBallSpeed: boundedSetting(BALL_MIX_SETTINGS.maxBallSpeed),
  burstCooldownMs: boundedSetting(BALL_MIX_SETTINGS.burstCooldownMs),
};
