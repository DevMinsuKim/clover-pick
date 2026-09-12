import {
  calculateRoundNumber,
  type DrawSchedule,
} from "@/utils/calculateRoundNumber";

/** 로또 6/45 1회차 추첨일 (토) */
export const LOTTO_ANCHOR_DATE = new Date("2002-12-07T00:00:00+09:00");
export const LOTTO_ANCHOR_ROUND = 1;
export const LOTTO_DRAW_SCHEDULE: DrawSchedule = {
  drawDayOfWeek: 6,
  drawHour: 20,
  drawMinute: 0,
};

/** 연금복권720+ 1회차 추첨일 (목). 생성 대상 회차는 판매 마감 17:00에 전환한다. */
export const PENSION_ANCHOR_DATE = new Date("2020-05-07T00:00:00+09:00");
export const PENSION_ANCHOR_ROUND = 1;
export const PENSION_SALES_CLOSE_SCHEDULE: DrawSchedule = {
  drawDayOfWeek: 4,
  drawHour: 17,
  drawMinute: 0,
};

/** 공식 추첨 방송 시각. 결과 수집 시에는 실제 응답 회차도 별도로 검증한다. */
export const PENSION_DRAW_SCHEDULE: DrawSchedule = {
  drawDayOfWeek: 4,
  drawHour: 19,
  drawMinute: 5,
};

export function getLottoCurrentRound(today: Date = new Date()): number {
  return calculateRoundNumber(
    LOTTO_ANCHOR_DATE,
    LOTTO_ANCHOR_ROUND,
    today,
    LOTTO_DRAW_SCHEDULE,
  );
}

export function getPensionCurrentRound(today: Date = new Date()): number {
  return calculateRoundNumber(
    PENSION_ANCHOR_DATE,
    PENSION_ANCHOR_ROUND,
    today,
    PENSION_SALES_CLOSE_SCHEDULE,
  );
}

/** 이미 추첨이 끝난 가장 최근 회차 */
export function getLottoLastCompletedRound(today: Date = new Date()): number {
  return getLottoCurrentRound(today) - 1;
}

export function getPensionLastCompletedRound(today: Date = new Date()): number {
  return (
    calculateRoundNumber(
      PENSION_ANCHOR_DATE,
      PENSION_ANCHOR_ROUND,
      today,
      PENSION_DRAW_SCHEDULE,
    ) - 1
  );
}

/** 생성일 기준 해당 시점의 예정 회차 */
export function getLottoRoundAt(createdAt: Date): number {
  return getLottoCurrentRound(createdAt);
}

export function getPensionRoundAt(createdAt: Date): number {
  return getPensionCurrentRound(createdAt);
}
