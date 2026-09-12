import { beforeEach, describe, expect, it, vi } from "vitest";
import { emptyLottoConstraints } from "@/server/lottery/lottoContracts";
import { analyzeLottoConditionsActions } from "./analyzeLottoConditionsActions";

const { parse, limit, frequency, assertRound } = vi.hoisted(() => ({
  parse: vi.fn(),
  limit: vi.fn(),
  frequency: vi.fn(),
  assertRound: vi.fn(),
}));
vi.mock("@/server/lottery/parseLottoPrompt", () => ({
  parseLottoPrompt: parse,
}));
vi.mock("@/server/lottery/lottoRequestLimit", () => ({
  limitLottoRequest: limit,
}));
vi.mock("@/server/lottery/lottoFrequency", () => ({
  getLottoFrequency: frequency,
}));
vi.mock("@/server/lottery/lottoPersistence", () => ({
  assertLottoRound: assertRound,
}));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
beforeEach(() => {
  vi.resetAllMocks();
  parse.mockResolvedValue({
    constraints: { ...emptyLottoConstraints },
    requestedSets: null,
  });
});
describe("로또 조건 확인", () => {
  it("빠른 조건만 선택하면 AI 없이 확인한다", async () => {
    const result = await analyzeLottoConditionsActions({
      prompt: "",
      repeat: 3,
      presets: ["even"],
    });
    expect(result.success?.constraints.oddCount).toBe(0);
    expect(result.success?.repeat).toBe(3);
    expect(parse).not.toHaveBeenCalled();
    expect(limit).toHaveBeenCalledWith("quick");
  });
  it("문장에 명시한 세트 수를 반영하되 최대 5개를 넘기지 않는다", async () => {
    parse.mockResolvedValue({
      constraints: emptyLottoConstraints,
      requestedSets: 3,
    });
    expect(
      (
        await analyzeLottoConditionsActions({
          prompt: "3세트",
          repeat: 1,
          presets: [],
        })
      ).success?.repeat,
    ).toBe(3);
    parse.mockResolvedValue({
      constraints: emptyLottoConstraints,
      requestedSets: 6,
    });
    expect(
      (
        await analyzeLottoConditionsActions({
          prompt: "6세트",
          repeat: 1,
          presets: [],
        })
      ).error,
    ).toBeTruthy();
  });
  it("문장과 칩의 상충하는 조건을 덮어쓰지 않는다", async () => {
    parse.mockResolvedValue({
      constraints: { ...emptyLottoConstraints, oddCount: 6 },
      requestedSets: null,
    });
    const result = await analyzeLottoConditionsActions({
      prompt: "홀수만",
      repeat: 1,
      presets: ["even"],
    });
    expect(result.error).toContain("달라요");
  });
  it.each([
    { prompt: "", repeat: 1, presets: [] },
    { prompt: "가".repeat(301), repeat: 1, presets: [] },
    { prompt: "", repeat: 1, presets: ["even", "odd"] },
    { prompt: "", repeat: 1, presets: ["even", "even"] },
  ] as const)(
    "비어 있거나 잘못된 요청은 유료 해석 전에 거부한다: %o",
    async (input) => {
      const result = await analyzeLottoConditionsActions({
        ...input,
        presets: [...input.presets],
      });
      expect(result.error).toBeTruthy();
      expect(parse).not.toHaveBeenCalled();
      expect(limit).not.toHaveBeenCalled();
    },
  );
  it("AI 해석 도중 회차가 바뀌면 이전 계획을 반환하지 않는다", async () => {
    assertRound
      .mockImplementationOnce(() => undefined)
      .mockImplementationOnce(() => {
        throw new Error("round changed");
      });
    expect(
      (
        await analyzeLottoConditionsActions({
          prompt: "짝수만",
          repeat: 1,
          presets: [],
        })
      ).success,
    ).toBeUndefined();
  });
});
