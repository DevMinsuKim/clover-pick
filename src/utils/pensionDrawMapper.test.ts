import { describe, expect, it } from "vitest";
import {
  mapPensionDrawJsonToLatestRow,
  mapPensionDrawJsonToRows,
} from "./pensionDrawMapper";

describe("연금복권 추첨 응답 변환 (mapPensionDrawJsonToRows)", () => {
  it("같은 회차의 응답 행을 조와 여섯 자리 당첨번호 및 보너스 번호로 합친다", () => {
    const rows = mapPensionDrawJsonToRows([
      {
        wnSqNo: 1,
        wnBndNo: "3",
        wnRnkVl: "644513",
        psltRflYmd: "20260813",
        psltEpsd: 328,
      },
      {
        wnSqNo: 2,
        wnBndNo: null,
        wnRnkVl: "644513",
        psltRflYmd: "20260813",
        psltEpsd: 328,
      },
      {
        wnSqNo: 21,
        wnBndNo: null,
        wnRnkVl: "177237",
        psltRflYmd: "20260813",
        psltEpsd: 328,
      },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].draw_number).toBe(328);
    expect(rows[0].draw_date.toISOString().slice(0, 10)).toBe("2026-08-13");
    expect(rows[0].winning_number).toBe("3644513");
    expect(rows[0].bonus_number).toBe("177237");
  });

  it("빈 추첨 응답이면 예외를 던진다", () => {
    expect(() => mapPensionDrawJsonToLatestRow([])).toThrow(
      "연금복권 당첨 JSON에 1등/보너스 행이 없습니다.",
    );
  });
});

describe("외부 연금복권 응답의 잘못된 값 차단", () => {
  const first = {
    wnSqNo: 1,
    wnBndNo: "1",
    wnRnkVl: "7",
    psltRflYmd: "20260910",
    psltEpsd: 332,
  };
  const bonus = { ...first, wnSqNo: 21, wnBndNo: null, wnRnkVl: "123456" };
  it("여섯 자리에 미달하는 숫자는 앞의 0을 보존해 맞춘다", () => {
    expect(mapPensionDrawJsonToLatestRow([first, bonus]).winning_number).toBe(
      "1000007",
    );
  });
  it.each([
    { wnBndNo: "6" },
    { wnRnkVl: "1234567" },
    { wnRnkVl: "abc" },
    { psltRflYmd: "20260230" },
    { psltEpsd: -1 },
  ])("잘못된 공식 번호나 날짜 %o는 저장 전에 거부한다", (changes) => {
    expect(() =>
      mapPensionDrawJsonToLatestRow([
        { ...first, ...changes },
        { ...bonus, psltRflYmd: changes.psltRflYmd ?? bonus.psltRflYmd },
      ]),
    ).toThrow();
  });
  it("서로 다른 추첨일과 동일한 1등·보너스 번호를 거부한다", () => {
    expect(() =>
      mapPensionDrawJsonToLatestRow([
        first,
        { ...bonus, psltRflYmd: "20260917" },
      ]),
    ).toThrow();
    expect(() =>
      mapPensionDrawJsonToLatestRow([first, { ...bonus, wnRnkVl: "000007" }]),
    ).toThrow();
  });
  it("최신 회차 일부가 빠졌거나 중복 회차가 서로 다르면 이전 회차로 대신하지 않는다", () => {
    expect(() =>
      mapPensionDrawJsonToLatestRow([
        first,
        bonus,
        { ...first, psltEpsd: 333 },
      ]),
    ).toThrow();
    expect(() =>
      mapPensionDrawJsonToLatestRow([
        first,
        bonus,
        { ...bonus, wnRnkVl: "222222" },
      ]),
    ).toThrow();
  });
});
