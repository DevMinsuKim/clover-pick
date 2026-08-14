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

/** 연금복권720+ 1회차 추첨일 (목) */
export const PENSION_ANCHOR_DATE = new Date("2020-05-07T00:00:00+09:00");
export const PENSION_ANCHOR_ROUND = 1;
export const PENSION_DRAW_SCHEDULE: DrawSchedule = {
  drawDayOfWeek: 4,
  drawHour: 17,
  drawMinute: 0,
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
    PENSION_DRAW_SCHEDULE,
  );
}

/** 생성일 기준 해당 시점의 예정 회차 */
export function getLottoRoundAt(createdAt: Date): number {
  return getLottoCurrentRound(createdAt);
}

export function getPensionRoundAt(createdAt: Date): number {
  return getPensionCurrentRound(createdAt);
}
