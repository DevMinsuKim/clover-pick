import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lottoCreateNumberActions } from "./lottoCreateNumberActions";

const { createMany, captureException } = vi.hoisted(() => ({
  createMany: vi.fn(),
  captureException: vi.fn(),
}));

vi.mock("@/libs/prisma", () => ({
  default: { created_lotto: { createMany } },
}));
vi.mock("@sentry/nextjs", () => ({
  captureException,
  captureMessage: vi.fn(),
}));
vi.mock("@/utils/generationRestriction", () => ({
  isLottoGenerationRestricted: () => false,
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
describe("AI SDK structured output migration", () => {
  beforeEach(() => {
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
