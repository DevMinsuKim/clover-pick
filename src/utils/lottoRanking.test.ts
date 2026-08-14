import { describe, expect, it } from "vitest";
import { getLottoRanking } from "./lottoRanking";

const winningNumbers = [1, 2, 3, 4, 5, 6];
const bonusNumber = 7;

describe("getLottoRanking", () => {
  it("1등: 6개 일치", () => {
    expect(
      getLottoRanking([1, 2, 3, 4, 5, 6], winningNumbers, bonusNumber),
    ).toBe(1);
  });

  it("2등: 5개 + 보너스 일치", () => {
    expect(
      getLottoRanking([1, 2, 3, 4, 5, 7], winningNumbers, bonusNumber),
    ).toBe(2);
  });

  it("3등: 5개 일치, 보너스 불일치", () => {
    expect(
      getLottoRanking([1, 2, 3, 4, 5, 8], winningNumbers, bonusNumber),
    ).toBe(3);
  });

  it("4등: 4개 일치", () => {
    expect(
      getLottoRanking([1, 2, 3, 4, 8, 9], winningNumbers, bonusNumber),
    ).toBe(4);
  });

  it("5등: 3개 일치", () => {
    expect(
      getLottoRanking([1, 2, 3, 8, 9, 10], winningNumbers, bonusNumber),
    ).toBe(5);
  });

  it("낙첨: 2개 이하 일치", () => {
    expect(
      getLottoRanking([1, 2, 8, 9, 10, 11], winningNumbers, bonusNumber),
    ).toBe(0);
    expect(
      getLottoRanking([8, 9, 10, 11, 12, 13], winningNumbers, bonusNumber),
    ).toBe(0);
  });
});
