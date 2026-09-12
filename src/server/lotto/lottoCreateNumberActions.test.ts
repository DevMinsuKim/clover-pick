import { beforeEach, describe, expect, it, vi } from "vitest";
import { emptyLottoConstraints } from "@/server/lottery/lottoContracts";
import { LottoInputError } from "@/server/lottery/lottoEngine";
import { lottoCreateNumberActions } from "./lottoCreateNumberActions";

const { limit, find, save, round, frequency, capture } = vi.hoisted(() => ({
  limit: vi.fn(),
  find: vi.fn(),
  save: vi.fn(),
  round: vi.fn(),
  frequency: vi.fn(),
  capture: vi.fn(),
}));
vi.mock("@/server/lottery/lotteryRequestLimit", () => ({
  limitLotteryRequest: limit,
}));
vi.mock("@/server/lottery/lottoPersistence", () => ({
  findLottoBatch: find,
  saveLottoBatch: save,
  assertLottoRound: round,
  lottoRequestHash: () => "test-hash",
}));
vi.mock("@/server/lottery/lottoFrequency", () => ({
  getLottoFrequency: frequency,
}));
vi.mock("@sentry/nextjs", () => ({ captureException: capture }));
const input = {
  repeat: 5,
  expectedRound: 1234,
  requestId: "02eef3c4-f177-42e0-ac63-c42dc031765d",
};

beforeEach(() => {
  vi.resetAllMocks();
  find.mockResolvedValue(null);
  limit.mockResolvedValue(undefined);
  save.mockImplementation(async (request, _hash, numbers) => ({
    lottoNumbers: numbers,
    round: request.expectedRound,
  }));
});
describe("로또 번호 생성 요청", () => {
  it("유효한 요청은 AI 없이 5개의 고유 조합을 저장한다", async () => {
    const result = await lottoCreateNumberActions(input);
    expect(result.success?.lottoNumbers).toHaveLength(5);
    expect(save).toHaveBeenCalledOnce();
    expect(frequency).not.toHaveBeenCalled();
  });
  it.each([
    { ...input, repeat: 6 },
    { ...input, repeat: 1.5 },
    { ...input, requestId: "invalid" },
    {
      ...input,
      constraints: { ...emptyLottoConstraints, include: [1], exclude: [1] },
    },
  ])("잘못된 요청은 DB 접근 전에 거부한다: %o", async (invalid) => {
    expect((await lottoCreateNumberActions(invalid)).error).toBeTruthy();
    expect(find).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
    expect(limit).not.toHaveBeenCalled();
  });
  it("이용 한도를 소진해도 이미 저장된 요청의 결과는 다시 받을 수 있다", async () => {
    const previous = {
      lottoNumbers: [{ numbers: [1, 2, 3, 4, 5, 6] }],
      round: 1234,
    };
    find.mockResolvedValue(previous);
    limit.mockRejectedValue(new LottoInputError("요청 제한"));
    expect(
      (await lottoCreateNumberActions({ ...input, repeat: 1 })).success,
    ).toEqual(previous);
    expect(save).not.toHaveBeenCalled();
    expect(round).not.toHaveBeenCalled();
    expect(limit).not.toHaveBeenCalled();
  });
  it("회차 변경과 요청 제한 오류는 저장 전에 안내한다", async () => {
    round.mockImplementation(() => {
      throw new LottoInputError("회차 변경");
    });
    expect((await lottoCreateNumberActions(input)).error).toBe("회차 변경");
    expect(save).not.toHaveBeenCalled();
    expect(limit).not.toHaveBeenCalled();
    round.mockReset();
    limit.mockRejectedValue(new LottoInputError("요청 제한"));
    expect((await lottoCreateNumberActions(input)).error).toBe("요청 제한");
    expect(save).not.toHaveBeenCalled();
  });
  it("빈도 조건은 클라이언트가 아닌 DB 집계를 사용한다", async () => {
    frequency.mockResolvedValue({
      pool: Array.from({ length: 20 }, (_, i) => i + 10),
    });
    const result = await lottoCreateNumberActions({
      ...input,
      constraints: { ...emptyLottoConstraints, frequent: true },
    });
    expect(
      result.success?.lottoNumbers.every((row) =>
        row.numbers.every((n) => n >= 10 && n <= 29),
      ),
    ).toBe(true);
    expect(frequency).toHaveBeenCalledOnce();
  });
  it("DB 저장 실패 시 성공으로 표시하지 않고 내부 상세를 노출하지 않는다", async () => {
    save.mockRejectedValue(new Error("postgres://secret"));
    const result = await lottoCreateNumberActions(input);
    expect(result.success).toBeUndefined();
    expect(result.error).not.toContain("secret");
    expect(capture.mock.calls[0][0].message).toBe("Lotto generation failed");
  });
});
