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
