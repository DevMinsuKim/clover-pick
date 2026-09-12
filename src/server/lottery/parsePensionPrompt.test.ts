import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parsePensionPrompt } from "./parsePensionPrompt";
import { emptyPensionConstraints } from "./pensionContracts";

import { aiResponse as response } from "./testFixtures/aiResponse";

describe("실제 AI SDK의 조건 응답 검증", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "unit-test-key");
    vi.stubEnv("OPENAI_PENSION_MODEL", "gpt-5.4-nano-2026-03-17");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
  it("Responses의 구조화 응답을 파싱하고 응답 저장을 끈다", async () => {
    const output = {
      constraints: {
        ...emptyPensionConstraints,
        groups: [3],
        prefix: "00",
        suffix: "7",
      },
      requestedCount: 3,
      allGroups: false,
      issue: "none",
    };
    const fetchMock = vi.fn().mockResolvedValue(response(output));
    vi.stubGlobal("fetch", fetchMock);
    expect(await parsePensionPrompt("3조, 앞00 끝7로 3개")).toEqual(output);
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
            constraints: emptyPensionConstraints,
            requestedCount: null,
            allGroups: null,
            issue,
          }),
        ),
      );
      await expect(parsePensionPrompt("테스트 조건")).rejects.toThrow(
        "조건을 정확히",
      );
    },
  );
  it("범위를 벗어난 AI 응답은 스키마 단계에서 거부한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({
          constraints: { ...emptyPensionConstraints, groups: [9] },
          requestedCount: null,
          allGroups: null,
          issue: "none",
        }),
      ),
    );
    await expect(parsePensionPrompt("99 포함")).rejects.toThrow();
  });
  it("키가 없거나 입력이 300자를 넘으면 API를 호출하지 않는다", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("OPENAI_API_KEY", "");
    await expect(parsePensionPrompt("짝수만")).rejects.toThrow("빠른 조건");
    await expect(parsePensionPrompt("가".repeat(301))).rejects.toThrow();
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
    await expect(parsePensionPrompt("짝수만")).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
