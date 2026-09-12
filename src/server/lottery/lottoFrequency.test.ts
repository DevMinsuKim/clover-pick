import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLottoFrequency } from "./lottoFrequency";

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock("@/libs/prisma", () => ({ default: { lotto: { findMany } } }));
vi.mock("@/constants/lotteryRounds", () => ({
  getLottoLastCompletedRound: () => 1200,
}));
const rows = Array.from({ length: 100 }, (_, i) => ({
  draw_number: 1200 - i,
  winning_number_1: 40,
  winning_number_2: 41,
  winning_number_3: 42,
  winning_number_4: 43,
  winning_number_5: 44,
  winning_number_6: 45,
}));
beforeEach(() => {
  findMany.mockResolvedValue(rows);
});
describe("최근 출현 번호의 근거 집계", () => {
  it("최신 100회 본번호만 집계하고 동률은 번호 오름차순으로 고른다", async () => {
    expect(await getLottoFrequency()).toEqual({
      fromRound: 1101,
      toRound: 1200,
      drawCount: 100,
      pool: [
        ...Array.from({ length: 14 }, (_, i) => i + 1),
        40,
        41,
        42,
        43,
        44,
        45,
      ],
    });
    expect(findMany.mock.calls[0][0].select).not.toHaveProperty("bonus_number");
  });
  it.each(
    [
      rows.slice(1),
      [],
      rows.map((row, i) => ({
        ...row,
        draw_number: row.draw_number - (i > 50 ? 1 : 0),
      })),
    ].map((data) => ({ data })),
  )(
    "회차가 부족하거나 누락되면 근거 없는 빈도 조건을 제공하지 않는다",
    async ({ data }) => {
      findMany.mockResolvedValue(data);
      await expect(getLottoFrequency()).rejects.toThrow("갱신 중");
    },
  );
});
