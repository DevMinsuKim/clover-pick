import { describe, expect, it } from "vitest";
import { calculateRoundNumber } from "./calculateRoundNumber";
import {
  LOTTO_ANCHOR_DATE,
  LOTTO_ANCHOR_ROUND,
  LOTTO_DRAW_SCHEDULE,
  PENSION_ANCHOR_DATE,
  PENSION_ANCHOR_ROUND,
  PENSION_DRAW_SCHEDULE,
  getLottoCurrentRound,
  getPensionCurrentRound,
} from "@/constants/lotteryRounds";

describe("calculateRoundNumber", () => {
  describe("로또 6/45 (앵커 2002-12-07, 토 20:00 KST)", () => {
    it("1회차 추첨 전에는 1회차를 반환한다", () => {
      const beforeFirstDraw = new Date("2002-12-07T19:59:00+09:00");
      expect(
        calculateRoundNumber(
          LOTTO_ANCHOR_DATE,
          LOTTO_ANCHOR_ROUND,
          beforeFirstDraw,
          LOTTO_DRAW_SCHEDULE,
        ),
      ).toBe(1);
    });

    it("1회차 추첨 직후에는 2회차를 반환한다", () => {
      const afterFirstDraw = new Date("2002-12-07T20:00:00+09:00");
      expect(
        calculateRoundNumber(
          LOTTO_ANCHOR_DATE,
          LOTTO_ANCHOR_ROUND,
          afterFirstDraw,
          LOTTO_DRAW_SCHEDULE,
        ),
      ).toBe(2);
    });

    it("2회차 추첨일(2002-12-14) 추첨 전에는 2회차를 반환한다", () => {
      const beforeSecondDraw = new Date("2002-12-14T19:59:00+09:00");
      expect(
        calculateRoundNumber(
          LOTTO_ANCHOR_DATE,
          LOTTO_ANCHOR_ROUND,
          beforeSecondDraw,
          LOTTO_DRAW_SCHEDULE,
        ),
      ).toBe(2);
    });

    it("2회차 추첨일(2002-12-14) 추첨 직후에는 3회차를 반환한다", () => {
      const afterSecondDraw = new Date("2002-12-14T20:00:00+09:00");
      expect(
        calculateRoundNumber(
          LOTTO_ANCHOR_DATE,
          LOTTO_ANCHOR_ROUND,
          afterSecondDraw,
          LOTTO_DRAW_SCHEDULE,
        ),
      ).toBe(3);
    });

    it("2026-08-14(금) 기준 현재 회차 1237을 반환한다", () => {
      const today = new Date("2026-08-14T12:00:00+09:00");
      expect(getLottoCurrentRound(today)).toBe(1237);
    });

    it("2026-08-15(토) 추첨 전에는 1237, 추첨 직후에는 1238", () => {
      const beforeDraw = new Date("2026-08-15T19:59:00+09:00");
      const afterDraw = new Date("2026-08-15T20:00:00+09:00");
      expect(getLottoCurrentRound(beforeDraw)).toBe(1237);
      expect(getLottoCurrentRound(afterDraw)).toBe(1238);
    });
  });

  describe("연금복권720+ (앵커 2020-05-07, 목 17:00 KST)", () => {
    it("1회차 추첨 전에는 1회차를 반환한다", () => {
      const beforeFirstDraw = new Date("2020-05-07T16:59:00+09:00");
      expect(
        calculateRoundNumber(
          PENSION_ANCHOR_DATE,
          PENSION_ANCHOR_ROUND,
          beforeFirstDraw,
          PENSION_DRAW_SCHEDULE,
        ),
      ).toBe(1);
    });

    it("1회차 추첨 직후에는 2회차를 반환한다", () => {
      const afterFirstDraw = new Date("2020-05-07T17:00:00+09:00");
      expect(
        calculateRoundNumber(
          PENSION_ANCHOR_DATE,
          PENSION_ANCHOR_ROUND,
          afterFirstDraw,
          PENSION_DRAW_SCHEDULE,
        ),
      ).toBe(2);
    });

    it("2026-08-14(금) 기준 현재 회차 329를 반환한다", () => {
      const today = new Date("2026-08-14T12:00:00+09:00");
      expect(getPensionCurrentRound(today)).toBe(329);
    });

    it("2026-08-20(목) 추첨 전에는 329, 추첨 직후에는 330", () => {
      const beforeDraw = new Date("2026-08-20T16:59:00+09:00");
      const afterDraw = new Date("2026-08-20T17:00:00+09:00");
      expect(getPensionCurrentRound(beforeDraw)).toBe(329);
      expect(getPensionCurrentRound(afterDraw)).toBe(330);
    });
  });
});
