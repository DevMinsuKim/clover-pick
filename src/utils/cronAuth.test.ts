import { afterEach, describe, expect, it, vi } from "vitest";
import { isAuthorizedCronRequest } from "./cronAuth";

describe("예약 작업 요청 인증 (isAuthorizedCronRequest)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("시크릿과 Bearer 헤더가 같으면 통과한다", () => {
    vi.stubEnv("CRON_SECRET", "test-cron-secret-value");
    expect(isAuthorizedCronRequest("Bearer test-cron-secret-value")).toBe(true);
  });

  it("헤더가 없거나 값이 다르면 거부한다", () => {
    vi.stubEnv("CRON_SECRET", "test-cron-secret-value");
    expect(isAuthorizedCronRequest(null)).toBe(false);
    expect(isAuthorizedCronRequest("Bearer other")).toBe(false);
  });

  it("CRON_SECRET이 없으면 거부한다", () => {
    vi.stubEnv("CRON_SECRET", "");
    expect(isAuthorizedCronRequest("Bearer test-cron-secret-value")).toBe(
      false,
    );
  });
});
