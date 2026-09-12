import { describe, expect, it } from "vitest";
import {
  getPensionCurrentRound,
  getPensionLastCompletedRound,
} from "@/constants/lotteryRounds";
import {
  isLottoGenerationRestricted,
  isPensionGenerationRestricted,
} from "./generationRestriction";

describe("한국 시간의 생성 제한과 연금복권 판매·추첨 경계", () => {
  it.each([
    ["2026-09-10T16:59:59+09:00", false],
    ["2026-09-10T17:00:00+09:00", true],
    ["2026-09-10T21:59:59+09:00", true],
    ["2026-09-10T22:00:00+09:00", false],
    ["2026-09-11T00:00:00+09:00", false],
  ])("%s의 연금복권 생성 제한은 %s다", (date, blocked) => {
    expect(isPensionGenerationRestricted(new Date(date))).toBe(blocked);
  });
  it("목요일 17시 판매 마감과 19시05분 추첨을 구분한다", () => {
    expect(getPensionCurrentRound(new Date("2026-09-10T16:59:59+09:00"))).toBe(
      332,
    );
    expect(getPensionCurrentRound(new Date("2026-09-10T17:00:00+09:00"))).toBe(
      333,
    );
    expect(
      getPensionLastCompletedRound(new Date("2026-09-10T19:04:59+09:00")),
    ).toBe(331);
    expect(
      getPensionLastCompletedRound(new Date("2026-09-10T19:05:00+09:00")),
    ).toBe(332);
  });
  it("공통 시간 계산 변경 후에도 로또 토요일 제한 경계를 유지한다", () => {
    expect(
      isLottoGenerationRestricted(new Date("2026-09-12T19:59:59+09:00")),
    ).toBe(false);
    expect(
      isLottoGenerationRestricted(new Date("2026-09-12T20:00:00+09:00")),
    ).toBe(true);
    expect(
      isLottoGenerationRestricted(new Date("2026-09-12T23:30:00+09:00")),
    ).toBe(false);
  });
});
