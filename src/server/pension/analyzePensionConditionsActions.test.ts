import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  emptyPensionConstraints,
  type PensionAnalyzeInput,
} from "@/server/lottery/pensionContracts";

const { parse, rate, round, capture } = vi.hoisted(() => ({
  parse: vi.fn(),
  rate: vi.fn(),
  round: vi.fn(),
  capture: vi.fn(),
}));
vi.mock("@/server/lottery/parsePensionPrompt", () => ({
  parsePensionPrompt: parse,
}));
vi.mock("@/server/lottery/lotteryRequestLimit", () => ({
  limitLotteryRequest: rate,
}));
vi.mock("@/server/lottery/pensionPersistence", () => ({
  assertPensionRound: round,
}));
vi.mock("@sentry/nextjs", () => ({ captureException: capture }));

import { analyzePensionConditionsActions as analyze } from "./analyzePensionConditionsActions";

const base: PensionAnalyzeInput = {
  prompt: "",
  repeat: 1,
  isAllGroup: false,
  presets: [],
};
const extraction = (changes = {}) => ({
  constraints: { ...emptyPensionConstraints },
  requestedCount: null,
  allGroups: null,
  issue: "none",
  ...changes,
});
describe("연금복권 맞춤 조건 확인", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    parse.mockResolvedValue(extraction());
  });
  it("빠른 조건만 선택하면 AI 호출 없이 모두 반영한다", async () => {
    const response = await analyze({
      ...base,
      presets: ["unique", "no-zero", "last-seven"],
    });
    expect(parse).not.toHaveBeenCalled();
    expect(rate).toHaveBeenCalledWith("quick");
    expect(response.success?.constraints).toMatchObject({
      uniqueDigits: true,
      excludeDigits: [0],
      suffix: "7",
    });
  });
  it("모든 조만 선택해도 AI 없이 5개 계획을 반환한다", async () => {
    const response = await analyze({ ...base, isAllGroup: true, repeat: 5 });
    expect(response.success).toMatchObject({ isAllGroup: true, repeat: 5 });
    expect(parse).not.toHaveBeenCalled();
  });
  it("문장의 개수·조·앞자리 0을 보존한다", async () => {
    parse.mockResolvedValue(
      extraction({
        constraints: {
          ...emptyPensionConstraints,
          groups: [3],
          prefix: "00",
          suffix: "7",
        },
        requestedCount: 3,
        allGroups: false,
      }),
    );
    expect(
      (await analyze({ ...base, prompt: "3조 앞00 끝7로 3개" })).success,
    ).toMatchObject({
      repeat: 3,
      constraints: { groups: [3], prefix: "00", suffix: "7" },
    });
  });
  it("모든 조와 특정 조, 빠른 조건과 문장의 끝자리 충돌을 거부한다", async () => {
    parse.mockResolvedValue(extraction({ allGroups: false }));
    expect(
      (await analyze({ ...base, prompt: "2조", isAllGroup: true, repeat: 5 }))
        .error,
    ).toContain("조 조건");
    parse.mockResolvedValue(
      extraction({ constraints: { ...emptyPensionConstraints, suffix: "00" } }),
    );
    expect(
      (await analyze({ ...base, prompt: "끝00", presets: ["last-seven"] }))
        .error,
    ).toContain("끝자리");
  });
  it("고정번호보다 많은 개수와 범위 밖 개수를 임의로 줄이지 않는다", async () => {
    parse.mockResolvedValue(
      extraction({
        constraints: {
          ...emptyPensionConstraints,
          groups: [1],
          prefix: "000000",
        },
        requestedCount: 2,
      }),
    );
    expect((await analyze({ ...base, prompt: "고정번호2개" })).error).toContain(
      "1개까지",
    );
    parse.mockResolvedValue(
      extraction({ requestedCount: 10, allGroups: true }),
    );
    expect((await analyze({ ...base, prompt: "모든조2세트" })).error).toContain(
      "1~5개",
    );
  });
  it("300자를 초과하거나 빈 입력이면 AI와 한도를 사용하지 않는다", async () => {
    expect((await analyze(base)).error).toBeTruthy();
    expect(
      (await analyze({ ...base, prompt: "가".repeat(301) })).error,
    ).toBeTruthy();
    expect(parse).not.toHaveBeenCalled();
    expect(rate).not.toHaveBeenCalled();
  });
  it("구조화 응답의 예외를 사용자 안내로 바꾸고 원문을 기록하지 않는다", async () => {
    parse.mockRejectedValue(new Error("private prompt"));
    expect((await analyze({ ...base, prompt: "조건" })).error).toContain(
      "조건을 확인하지 못했어요",
    );
    expect(capture.mock.calls[0][0].message).toBe("Pension analysis failed");
  });
});
