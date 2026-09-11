import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pensionCreateNumberActions } from "./pensionCreateNumberActions";

const { createMany, isRestricted } = vi.hoisted(() => ({
  createMany: vi.fn(),
  isRestricted: vi.fn(),
}));
vi.mock("@/libs/prisma", () => ({
  default: { created_pension: { createMany } },
}));
vi.mock("@/utils/generationRestriction", () => ({
  isPensionGenerationRestricted: isRestricted,
}));
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

describe("연금복권 번호 생성 검증", () => {
  beforeEach(() => {
    isRestricted.mockReturnValue(false);
    createMany.mockResolvedValue({ count: 1 });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    undefined,
    null,
    {},
    { repeat: 1 },
    { repeat: "1", isAllGroup: false },
    { repeat: 1, isAllGroup: "false" },
    { repeat: 1, isAllGroup: 1 },
    ...[0, -1, 1.5, 6, NaN, Infinity].map((repeat) => ({
      repeat,
      isAllGroup: false,
    })),
    { repeat: 0, isAllGroup: true },
  ])("잘못된 입력은 난수 생성과 DB 저장 전에 거부한다: %o", async (input) => {
    const random = vi.spyOn(Math, "random");
    await expect(
      pensionCreateNumberActions(
        input as Parameters<typeof pensionCreateNumberActions>[0],
      ),
    ).rejects.toThrow("2000");
    expect(random).not.toHaveBeenCalled();
    expect(createMany).not.toHaveBeenCalled();
  });

  it("서버에서도 생성 제한 시간을 검사한다", async () => {
    const random = vi.spyOn(Math, "random");
    isRestricted.mockReturnValue(true);
    await expect(
      pensionCreateNumberActions({ repeat: 1, isAllGroup: false }),
    ).rejects.toThrow("2000");
    expect(random).not.toHaveBeenCalled();
    expect(createMany).not.toHaveBeenCalled();
  });

  it.each([
    { value: 0, expected: "1000000" },
    { value: 0.9999999, expected: "5999999" },
  ])(
    "조 번호와 여섯 자리 번호의 경계값을 올바르게 저장한다: $expected",
    async ({ value, expected }) => {
      vi.spyOn(Math, "random").mockReturnValue(value);
      const result = await pensionCreateNumberActions({
        repeat: 1,
        isAllGroup: false,
      });
      expect(result.success).toEqual([{ number: expected }]);
      expect(createMany).toHaveBeenCalledWith({
        data: [{ number: expected, draw_number: expect.any(Number) }],
      });
    },
  );

  it.each([1, 5])(
    "모든 조 선택 시 요청 개수와 관계없이 같은 번호로 1~5조를 생성한다 (repeat=%i)",
    async (repeat) => {
      vi.spyOn(Math, "random").mockReturnValue(0);
      const result = await pensionCreateNumberActions({
        repeat,
        isAllGroup: true,
      });
      expect(result.success.map(({ number }) => number)).toEqual([
        "1000000",
        "2000000",
        "3000000",
        "4000000",
        "5000000",
      ]);
      expect(createMany.mock.calls[0][0].data).toHaveLength(5);
    },
  );

  it("중복 조합이 나오면 다시 생성해 요청한 개수를 채운다", async () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValue(0.5);
    const result = await pensionCreateNumberActions({
      repeat: 2,
      isAllGroup: false,
    });
    expect(result.success).toEqual([
      { number: "1000000" },
      { number: "3500000" },
    ]);
    expect(createMany.mock.calls[0][0].data).toHaveLength(2);
  });

  it("일반 모드에서 서로 다른 조합 5개를 생성한다", async () => {
    const random = vi.spyOn(Math, "random");
    for (const value of [0, 0.2, 0.4, 0.6, 0.8])
      random.mockReturnValueOnce(value).mockReturnValueOnce(0);
    const result = await pensionCreateNumberActions({
      repeat: 5,
      isAllGroup: false,
    });
    expect(result.success.map(({ number }) => number)).toEqual([
      "1000000",
      "2000000",
      "3000000",
      "4000000",
      "5000000",
    ]);
  });

  it("중복이 계속되면 무한 반복하거나 일부를 저장하지 않고 실패한다", async () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    await expect(
      pensionCreateNumberActions({ repeat: 2, isAllGroup: false }),
    ).rejects.toThrow("2000");
    expect(random.mock.calls.length).toBeLessThan(1000);
    expect(createMany).not.toHaveBeenCalled();
  });

  it("DB 저장에 실패하면 성공 응답을 반환하지 않는다", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    createMany.mockRejectedValue(new Error("Test database failure"));
    await expect(
      pensionCreateNumberActions({ repeat: 1, isAllGroup: false }),
    ).rejects.toThrow("2000");
  });
});
