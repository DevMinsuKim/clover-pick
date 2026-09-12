import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emptyLottoConstraints } from "./lottoContracts";
import { parseLottoPrompt } from "./parseLottoPrompt";

function response(output: unknown) {
  return new Response(
    JSON.stringify({
      id: "resp-test",
      created_at: 1,
      model: "gpt-5.4-nano-2026-03-17",
      status: "completed",
      output: [
        {
          type: "message",
          id: "msg-test",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "output_text",
              text: JSON.stringify(output),
              annotations: [],
            },
          ],
        },
      ],
      usage: {
        input_tokens: 10,
        output_tokens: 20,
        total_tokens: 30,
        input_tokens_details: { cached_tokens: 0 },
        output_tokens_details: { reasoning_tokens: 0 },
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

describe("실제 AI SDK의 조건 응답 검증", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "unit-test-key");
    vi.stubEnv("OPENAI_LOTTO_MODEL", "gpt-5.4-nano-2026-03-17");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
  it("Responses의 구조화 응답을 파싱하고 응답 저장을 끈다", async () => {
    const output = {
      constraints: { ...emptyLottoConstraints, include: [7, 21] },
      requestedSets: 3,
      issue: "none",
    };
    const fetchMock = vi.fn().mockResolvedValue(response(output));
    vi.stubGlobal("fetch", fetchMock);
    expect(await parseLottoPrompt("7과 21 포함 3세트")).toEqual(output);
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://api.openai.com/v1/responses",
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.store).toBe(false);
    expect(body.text.format.type).toBe("json_schema");
    expect(body.model).toBe("gpt-5.4-nano-2026-03-17");
  });
  it.each(["unsupported", "ambiguous", "not_lottery"])(
    "%s 응답의 일부 조건도 조용히 적용하지 않는다",
    async (issue) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          response({
            constraints: emptyLottoConstraints,
            requestedSets: null,
            issue,
          }),
        ),
      );
      await expect(parseLottoPrompt("테스트 조건")).rejects.toThrow(
        "조건을 정확히",
      );
    },
  );
  it("범위를 벗어난 AI 응답은 스키마 단계에서 거부한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({
          constraints: { ...emptyLottoConstraints, include: [99] },
          requestedSets: null,
          issue: "none",
        }),
      ),
    );
    await expect(parseLottoPrompt("99 포함")).rejects.toThrow();
  });
  it("키가 없거나 입력이 300자를 넘으면 API를 호출하지 않는다", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("OPENAI_API_KEY", "");
    await expect(parseLottoPrompt("짝수만")).rejects.toThrow("빠른 조건");
    await expect(parseLottoPrompt("가".repeat(301))).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("API 오류에는 재시도 없이 실패를 전달한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: "Unavailable" } }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(parseLottoPrompt("짝수만")).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
