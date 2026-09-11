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

describe("pension number generation validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  ])(
    "rejects invalid input before random generation and DB writes: %j",
    async (input) => {
      const random = vi.spyOn(Math, "random");
      await expect(
        pensionCreateNumberActions(
          input as Parameters<typeof pensionCreateNumberActions>[0],
        ),
      ).rejects.toThrow("2000");
      expect(random).not.toHaveBeenCalled();
      expect(createMany).not.toHaveBeenCalled();
    },
  );

  it("enforces the server-side generation restriction", async () => {
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
    "preserves leading zeros and valid repeated digits: $expected",
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
    "all-group mode returns five groups with one shared six-digit number (repeat=%i)",
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

  it("retries a duplicate ticket and returns exactly the requested count", async () => {
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

  it("supports five distinct tickets in ordinary mode", async () => {
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

  it("stops repeated collisions without hanging or saving a partial set", async () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    await expect(
      pensionCreateNumberActions({ repeat: 2, isAllGroup: false }),
    ).rejects.toThrow("2000");
    expect(random.mock.calls.length).toBeLessThan(1000);
    expect(createMany).not.toHaveBeenCalled();
  });

  it("rejects an invalid generated ticket before persistence", async () => {
    vi.spyOn(Math, "random").mockReturnValue(1);
    await expect(
      pensionCreateNumberActions({ repeat: 1, isAllGroup: false }),
    ).rejects.toThrow("2000");
    expect(createMany).not.toHaveBeenCalled();
  });

  it("does not return success if persistence fails", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    createMany.mockRejectedValue(new Error("Test database failure"));
    await expect(
      pensionCreateNumberActions({ repeat: 1, isAllGroup: false }),
    ).rejects.toThrow("2000");
  });
});
