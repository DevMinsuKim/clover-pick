import { describe, expect, it } from "vitest";
import { formatDate, formatDrawDate } from "./formatDate";

describe("목록 날짜 표시", () => {
  it("시간대가 다른 입력도 한국 날짜와 24시간제로 표시한다", () => {
    expect(formatDate("2026-09-12T02:52:17Z")).toBe("2026.09.12 11:52");
    expect(formatDate("2026-09-12T11:52:17+09:00")).toBe("2026.09.12 11:52");
  });
  it("한국 자정에서 날짜를 넘기고 시간을 00시로 표시한다", () => {
    expect(formatDate("2026-09-12T15:00:00Z")).toBe("2026.09.13 00:00");
  });
  it("추첨일은 시간대 변환 없이 날짜만 표시한다", () => {
    expect(formatDrawDate("2026-09-12")).toBe("2026.09.12");
  });
});
