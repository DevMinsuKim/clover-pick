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

// Exercise the real AI SDK, provider and Zod parser without network or database writes.
describe("lotto number generation validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isRestricted.mockReturnValue(false);
    vi.stubEnv("OPENAI_API_KEY", "migration-test-key");
    createMany.mockResolvedValue({ count: 1 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("keeps Chat Completions and saves the parsed, sorted numbers", async () => {
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
  ])("rejects malformed output before persistence: %s", async (content) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(completion(content)));

    await expect(lottoCreateNumberActions({ repeat: 1 })).rejects.toThrow(
      "2000",
    );
    expect(createMany).not.toHaveBeenCalled();
    expect(captureException).toHaveBeenCalled();
  });

  it("does not persist a provider authentication error", async () => {
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

describe("lotto request and response boundaries", () => {
  const first = { numbers: [1, 2, 3, 4, 5, 6] };
  const second = { numbers: [7, 8, 9, 10, 11, 12] };
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("OPENAI_API_KEY", "validation-test-key");
    isRestricted.mockReturnValue(false);
    createMany.mockResolvedValue({ count: 1 });
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
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
  ])(
    "rejects invalid input without calling OpenAI or DB: %j",
    async (input) => {
      await expect(
        lottoCreateNumberActions(
          input as Parameters<typeof lottoCreateNumberActions>[0],
        ),
      ).rejects.toThrow("2000");
      expect(fetchMock).not.toHaveBeenCalled();
      expect(createMany).not.toHaveBeenCalled();
    },
  );

  it("rejects requests during the restricted period before external calls", async () => {
    isRestricted.mockReturnValue(true);
    await expect(lottoCreateNumberActions({ repeat: 1 })).rejects.toThrow(
      "2000",
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(createMany).not.toHaveBeenCalled();
  });

  it.each([
    { name: "empty response", repeat: 1, tickets: [] },
    { name: "too few combinations", repeat: 2, tickets: [first] },
    { name: "too many combinations", repeat: 1, tickets: [first, second] },
    {
      name: "duplicate number",
      repeat: 1,
      tickets: [{ numbers: [1, 2, 3, 4, 5, 5] }],
    },
    {
      name: "fractional number",
      repeat: 1,
      tickets: [{ numbers: [1, 2, 3, 4, 5, 6.5] }],
    },
    { name: "zero", repeat: 1, tickets: [{ numbers: [0, 2, 3, 4, 5, 6] }] },
    {
      name: "extra number",
      repeat: 1,
      tickets: [{ numbers: [1, 2, 3, 4, 5, 6, 7] }],
    },
    { name: "duplicate combination", repeat: 2, tickets: [first, first] },
    {
      name: "reordered duplicate combination",
      repeat: 2,
      tickets: [first, { numbers: [6, 5, 4, 3, 2, 1] }],
    },
  ])(
    "rejects $name without saving any partial output",
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

  it("accepts exactly five distinct combinations, including numbers shared across combinations", async () => {
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

  it("does not return success if persistence fails", async () => {
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
