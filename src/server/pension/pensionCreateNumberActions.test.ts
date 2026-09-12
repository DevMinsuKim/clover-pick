import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LotteryInputError } from "@/server/lottery/lotteryInputError";
import type { PensionCreateInput } from "@/server/lottery/pensionContracts";

const { findBatch, saveBatch, assertRound, rate, capture } = vi.hoisted(() => ({
  findBatch: vi.fn(),
  saveBatch: vi.fn(),
  assertRound: vi.fn(),
  rate: vi.fn(),
  capture: vi.fn(),
}));
vi.mock("@/server/lottery/pensionPersistence", () => ({
  findPensionBatch: findBatch,
  savePensionBatch: saveBatch,
  assertPensionRound: assertRound,
  pensionRequestHash: () => "hash",
}));
vi.mock("@/server/lottery/lotteryRequestLimit", () => ({
  limitLotteryRequest: rate,
}));
vi.mock("@sentry/nextjs", () => ({ captureException: capture }));

import { pensionCreateNumberActions } from "./pensionCreateNumberActions";

const input = (): PensionCreateInput => ({
  repeat: 1,
  isAllGroup: false,
  requestId: randomUUID(),
  expectedRound: 333,
});
describe("연금복권 생성 요청의 검증과 오류 복구", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    findBatch.mockResolvedValue(null);
    saveBatch.mockImplementation(async (i, _hash, numbers) => ({
      pensionNumbers: numbers,
      round: i.expectedRound,
      isAllGroup: i.isAllGroup,
    }));
  });
  it.each([
    undefined,
    null,
    {},
    { repeat: 6 },
    { repeat: "1" },
    { repeat: 0 },
    { isAllGroup: "true" },
    { requestId: "invalid" },
    { expectedRound: -1 },
  ])("잘못된 요청은 저장·한도 차감 전에 거부한다: %o", async (changes) => {
    const value =
      changes == null
        ? changes
        : {
            ...input(),
            ...changes,
            ...(Object.keys(changes).length ? {} : { requestId: undefined }),
          };
    expect(
      (await pensionCreateNumberActions(value as PensionCreateInput)).error,
    ).toBeTruthy();
    expect(rate).not.toHaveBeenCalled();
    expect(saveBatch).not.toHaveBeenCalled();
  });
  it("모든 조 요청은 정확히 5개를 저장한다", async () => {
    const response = await pensionCreateNumberActions({
      ...input(),
      repeat: 5,
      isAllGroup: true,
    });
    expect(response.success?.pensionNumbers).toHaveLength(5);
    expect(
      new Set(response.success?.pensionNumbers.map((n) => n.number.slice(1)))
        .size,
    ).toBe(1);
  });
  it("응답 유실 후 재시도는 한도가 소진되고 회차가 바뀌어도 저장된 결과를 반환한다", async () => {
    const saved = {
      pensionNumbers: [{ number: "1000007" }],
      round: 332,
      isAllGroup: false,
    };
    findBatch.mockResolvedValue(saved);
    rate.mockRejectedValue(new LotteryInputError("내일 다시 이용해 주세요."));
    assertRound.mockImplementation(() => {
      throw new LotteryInputError("회차가 바뀌었어요.");
    });
    expect(await pensionCreateNumberActions(input())).toEqual({
      success: saved,
    });
    expect(rate).not.toHaveBeenCalled();
    expect(assertRound).not.toHaveBeenCalled();
    expect(saveBatch).not.toHaveBeenCalled();
  });
  it("제한 시간의 신규 요청은 저장하지 않는다", async () => {
    assertRound.mockImplementation(() => {
      throw new LotteryInputError(
        "목요일 오후 10시부터 다시 생성할 수 있어요.",
      );
    });
    expect((await pensionCreateNumberActions(input())).error).toContain(
      "오후 10시",
    );
    expect(rate).not.toHaveBeenCalled();
    expect(saveBatch).not.toHaveBeenCalled();
  });
  it("DB·SDK 원문은 사용자와 Sentry에 노출하지 않는다", async () => {
    saveBatch.mockRejectedValue(new Error("secret connection and user prompt"));
    const response = await pensionCreateNumberActions(input());
    expect(response.error).toBe(
      "번호를 생성하지 못했어요. 잠시 후 다시 시도해 주세요.",
    );
    expect(capture.mock.calls[0][0].message).toBe("Pension generation failed");
  });
});
