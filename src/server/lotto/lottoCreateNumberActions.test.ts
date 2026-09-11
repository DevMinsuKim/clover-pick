import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lottoCreateNumberActions } from "./lottoCreateNumberActions";

const { createMany, captureException, isRestricted } = vi.hoisted(() => ({
  createMany: vi.fn(),
  captureException: vi.fn(),
  isRestricted: vi.fn(),
}));

vi.mock("@/libs/prisma", () => ({
  default: { created_lotto: { createMany } },
}));
vi.mock("@sentry/nextjs", () => ({
  captureException,
  captureMessage: vi.fn(),
}));
vi.mock("@/utils/generationRestriction", () => ({
  isLottoGenerationRestricted: isRestricted,
}));

function completion(content: string) {
  return new Response(
    JSON.stringify({
      id: "chatcmpl-migration-test",
      object: "chat.completion",
      created: 1,
      model: "gpt-4o",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

// 실제 AI SDK와 Zod 파서를 실행하되 HTTP 응답과 DB 저장은 mock으로 대체한다.
describe("로또 번호 생성과 AI 응답 검증", () => {
  beforeEach(() => {
    isRestricted.mockReturnValue(false);
    vi.stubEnv("OPENAI_API_KEY", "migration-test-key");
    createMany.mockResolvedValue({ count: 1 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("Chat Completions의 구조화 응답을 검증하고 번호를 정렬해 저장한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      completion(
        JSON.stringify({
          lottoNumbers: [{ numbers: [45, 2, 30, 4, 16, 7] }],
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await lottoCreateNumberActions({ repeat: 1 });

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://api.openai.com/v1/chat/completions",
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe("gpt-4o");
    expect(body.response_format.type).toBe("json_schema");
    expect(result.success.lottoNumbers[0].numbers).toEqual([
      2, 4, 7, 16, 30, 45,
    ]);
    expect(createMany).toHaveBeenCalledWith({
      data: [
        {
          draw_number: expect.any(Number),
          number1: 2,
          number2: 4,
          number3: 7,
          number4: 16,
          number5: 30,
          number6: 45,
        },
      ],
    });
  });

  it.each([
    "not JSON",
    JSON.stringify({ lottoNumbers: [{ numbers: [1, 2, 3] }] }),
    JSON.stringify({ lottoNumbers: [{ numbers: [1, 2, 3, 4, 5, 46] }] }),
  ])("잘못된 AI 응답은 저장 전에 거부한다: %s", async (content) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(completion(content)));

    await expect(lottoCreateNumberActions({ repeat: 1 })).rejects.toThrow(
      "2000",
    );
    expect(createMany).not.toHaveBeenCalled();
    expect(captureException).toHaveBeenCalled();
  });

  it("OpenAI 인증에 실패하면 저장하지 않는다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              message: "Test authentication failure",
              type: "invalid_request_error",
              code: "invalid_api_key",
            },
          }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(lottoCreateNumberActions({ repeat: 1 })).rejects.toThrow(
      "2000",
    );
    expect(createMany).not.toHaveBeenCalled();
  });
});

describe("로또 생성 요청과 응답의 경계 조건", () => {
  const first = { numbers: [1, 2, 3, 4, 5, 6] };
  const second = { numbers: [7, 8, 9, 10, 11, 12] };
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "validation-test-key");
    isRestricted.mockReturnValue(false);
    createMany.mockResolvedValue({ count: 1 });
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it.each([
    undefined,
    null,
    {},
    { repeat: 0 },
    { repeat: -1 },
    { repeat: 1.5 },
    { repeat: 6 },
    { repeat: NaN },
    { repeat: Infinity },
    { repeat: "1" },
    { repeat: true },
  ])("잘못된 입력은 OpenAI 호출과 DB 저장 전에 거부한다: %o", async (input) => {
    await expect(
      lottoCreateNumberActions(
        input as Parameters<typeof lottoCreateNumberActions>[0],
      ),
    ).rejects.toThrow("2000");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(createMany).not.toHaveBeenCalled();
  });

  it("생성 제한 시간에는 OpenAI 호출과 DB 저장 전에 요청을 거부한다", async () => {
    isRestricted.mockReturnValue(true);
    await expect(lottoCreateNumberActions({ repeat: 1 })).rejects.toThrow(
      "2000",
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(createMany).not.toHaveBeenCalled();
  });

  it.each([
    { name: "빈 응답", repeat: 1, tickets: [] },
    { name: "요청보다 적은 조합", repeat: 2, tickets: [first] },
    { name: "요청보다 많은 조합", repeat: 1, tickets: [first, second] },
    {
      name: "조합 내부의 중복 번호",
      repeat: 1,
      tickets: [{ numbers: [1, 2, 3, 4, 5, 5] }],
    },
    {
      name: "소수인 번호",
      repeat: 1,
      tickets: [{ numbers: [1, 2, 3, 4, 5, 6.5] }],
    },
    { name: "0인 번호", repeat: 1, tickets: [{ numbers: [0, 2, 3, 4, 5, 6] }] },
    {
      name: "번호가 7개인 조합",
      repeat: 1,
      tickets: [{ numbers: [1, 2, 3, 4, 5, 6, 7] }],
    },
    { name: "동일한 조합", repeat: 2, tickets: [first, first] },
    {
      name: "순서만 다른 중복 조합",
      repeat: 2,
      tickets: [first, { numbers: [6, 5, 4, 3, 2, 1] }],
    },
  ])(
    "$name 응답은 일부도 저장하지 않고 거부한다",
    async ({ repeat, tickets }) => {
      fetchMock.mockResolvedValue(
        completion(JSON.stringify({ lottoNumbers: tickets })),
      );
      await expect(lottoCreateNumberActions({ repeat })).rejects.toThrow(
        "2000",
      );
      expect(createMany).not.toHaveBeenCalled();
    },
  );

  it("서로 다른 조합 5개를 허용하고 조합 간 개별 번호의 재사용은 허용한다", async () => {
    const tickets = Array.from({ length: 5 }, (_, i) => ({
      numbers: [45 - i, 1, 2, 3, 4, 5],
    }));
    fetchMock.mockResolvedValue(
      completion(JSON.stringify({ lottoNumbers: tickets })),
    );
    createMany.mockResolvedValue({ count: 5 });
    const result = await lottoCreateNumberActions({ repeat: 5 });
    expect(result.success.lottoNumbers).toHaveLength(5);
    expect(result.success.lottoNumbers[0].numbers).toEqual([1, 2, 3, 4, 5, 45]);
    expect(createMany).toHaveBeenCalledOnce();
    expect(createMany.mock.calls[0][0].data).toHaveLength(5);
  });

  it("DB 저장에 실패하면 성공 응답을 반환하지 않는다", async () => {
    fetchMock.mockResolvedValue(
      completion(JSON.stringify({ lottoNumbers: [first] })),
    );
    createMany.mockRejectedValue(new Error("Test database failure"));
    await expect(lottoCreateNumberActions({ repeat: 1 })).rejects.toThrow(
      "2000",
    );
    expect(captureException).toHaveBeenCalled();
  });
});
