import { describe, expect, it } from "vitest";
import { getPensionRanking } from "./pensionRanking";

const winningNumber = "3123456";
const bonusNumber = "654321";

describe("연금복권 등수 판정 (getPensionRanking)", () => {
  it("1등: 조와 6자리 모두 일치", () => {
    expect(getPensionRanking("3123456", winningNumber, bonusNumber)).toBe(1);
  });

  it("2등: 조만 다르고 끝 6자리 일치", () => {
    expect(getPensionRanking("4123456", winningNumber, bonusNumber)).toBe(2);
  });

  it("3등: 끝 5자리 일치", () => {
    expect(getPensionRanking("3023456", winningNumber, bonusNumber)).toBe(3);
  });

  it("4등: 끝 4자리 일치", () => {
    expect(getPensionRanking("3013456", winningNumber, bonusNumber)).toBe(4);
  });

  it("5등: 끝 3자리 일치", () => {
    expect(getPensionRanking("3012456", winningNumber, bonusNumber)).toBe(5);
  });

  it("6등: 끝 2자리 일치", () => {
    expect(getPensionRanking("3012356", winningNumber, bonusNumber)).toBe(6);
  });

  it("7등: 끝 1자리 일치", () => {
    expect(getPensionRanking("3012346", winningNumber, bonusNumber)).toBe(7);
  });

  it("보너스 등위: 보너스 번호와 끝 6자리 일치", () => {
    expect(getPensionRanking("1654321", winningNumber, bonusNumber)).toBe(8);
  });

  it("낙첨: 끝자리와 보너스가 모두 불일치", () => {
    expect(getPensionRanking("4123450", winningNumber, bonusNumber)).toBe(0);
  });
});

describe("보너스 중복 당첨과 잘못된 번호", () => {
  it.each(["023456", "003456", "000456", "000056", "000006"])(
    "보너스 %s와 3~7등이 겹치면 보너스를 적용한다",
    (bonus) => {
      expect(getPensionRanking(`1${bonus}`, "3123456", bonus)).toBe(8);
    },
  );
  it("여섯 자리 앞의 0과 조를 보존한다", () => {
    expect(getPensionRanking("1000007", "2000007", "123456")).toBe(2);
    expect(getPensionRanking("1000007", "2123456", "000007")).toBe(8);
  });
  it.each(["", "0000000", "6123456", "100000", "1abcdef"])(
    "잘못된 번호 %s를 당첨으로 처리하지 않는다",
    (number) => {
      expect(() =>
        getPensionRanking(number, winningNumber, bonusNumber),
      ).toThrow();
    },
  );
});
