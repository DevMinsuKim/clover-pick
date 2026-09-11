import { describe, expect, it, vi } from "vitest";
import { errorHandler } from "./errorHandler";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

describe("오류 화면의 예외 값 처리", () => {
  it.each([undefined, null, "failure", 42, { message: 42 }])(
    "Error가 아닌 값에도 기본 오류 안내를 반환한다: %s",
    (value) => {
      expect(errorHandler(value)).toEqual({
        title: "이용에 불편을 드려 죄송합니다.",
        description:
          "현재 문제를 해결하기 위해 최선을 다하고 있습니다.\n잠시 후 다시 시도해 주세요.",
        btnText: "다시 시도하기",
      });
    },
  );

  it("정의된 오류 코드는 해당 안내로 변환한다", () => {
    expect(errorHandler(new Error("1000")).title).toBe(
      "데이터를 로드하는데 실패했습니다.",
    );
  });
});
