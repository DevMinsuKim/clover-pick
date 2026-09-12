import { describe, expect, it } from "vitest";
import { postgresConnectionString } from "./postgresConnectionString";

describe("PostgreSQL SSL 연결 호환성", () => {
  it.each(["prefer", "require", "verify-ca"])(
    "pg 8의 SSL 별칭 %s를 바꿔 인증서 검증을 유지한다",
    (mode) => {
      const original = new URL(
        `postgresql://user:p%40ss@db.example:5432/app?sslmode=${mode}&application_name=cloverpick`,
      );
      const result = new URL(postgresConnectionString(original.toString()));
      expect(result.searchParams.get("sslmode")).toBe("verify-full");
      expect(result.username).toBe(original.username);
      expect(result.password).toBe(original.password);
      expect(result.host).toBe(original.host);
      expect(result.pathname).toBe(original.pathname);
      expect(result.searchParams.get("application_name")).toBe("cloverpick");
    },
  );

  it.each([
    "postgresql://localhost:5432/test",
    "postgresql://db.example/app?sslmode=verify-full",
    "postgresql://localhost/test?sslmode=disable",
    "postgresql://db.example/app?sslmode=require&uselibpqcompat=true",
  ])("명시적인 SSL 설정과 로컬 연결 문자열은 유지한다: %s", (url) => {
    expect(postgresConnectionString(url)).toBe(url);
  });
});
