import { describe, expect, it } from "vitest";
import { mapPensionDrawJsonToRows } from "./pensionDrawMapper";

describe("mapPensionDrawJsonToRows", () => {
  it("회차 8행을 조+6자리 당첨번호와 보너스 6자리로 접는다", () => {
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
});
