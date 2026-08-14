import { describe, expect, it } from "vitest";
import { mapLottoDrawJsonToRow } from "./lottoDrawMapper";

describe("mapLottoDrawJsonToRow", () => {
  it("1236회 JSON을 lotto 스키마 행으로 변환한다", () => {
    const row = mapLottoDrawJsonToRow({
      ltEpsd: 1236,
      ltRflYmd: "20260808",
      tm1WnNo: 12,
      tm2WnNo: 18,
      tm3WnNo: 21,
      tm4WnNo: 29,
      tm5WnNo: 34,
      tm6WnNo: 38,
      bnsWnNo: 10,
      rnk1WnNope: 11,
      rnk1WnAmt: 2441919375,
      rnk2WnNope: 84,
      rnk2WnAmt: 53295860,
      rnk3WnNope: 3371,
      rnk3WnAmt: 1328049,
      rnk4WnNope: 161927,
      rnk4WnAmt: 50000,
      rnk5WnNope: 2624850,
      rnk5WnAmt: 5000,
    });

    expect(row.draw_number).toBe(1236);
    expect(row.draw_date.toISOString().slice(0, 10)).toBe("2026-08-08");
    expect(row.winning_number_1).toBe(12);
    expect(row.winning_number_6).toBe(38);
    expect(row.bonus_number).toBe(10);
    expect(row.first_prize_winners).toBe(11);
    expect(row.first_prize_amount).toBe(2441919375n);
    expect(row.fifth_prize_amount).toBe(5000n);
  });
});
