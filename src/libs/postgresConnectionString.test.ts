import { describe, expect, it } from "vitest";
import { postgresConnectionString } from "./postgresConnectionString";

describe("PostgreSQL SSL compatibility", () => {
  it.each(["prefer", "require", "verify-ca"])(
    "preserves full certificate validation for the pg 8 alias %s",
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
  ])("preserves an explicit or local connection setting: %s", (url) => {
    expect(postgresConnectionString(url)).toBe(url);
  });
});
