import { describe, expect, it } from "vitest";
import { assertExpectedDrawRound } from "./assertExpectedDrawRound";

describe("assertExpectedDrawRound", () => {
  it("응답 회차가 기대 회차와 같으면 통과한다", () => {
    expect(() => assertExpectedDrawRound(1237, 1237, "로또")).not.toThrow();
  });

  it("동행복권이 아직 이전 회차면 적재하지 않고 예외를 던진다", () => {
    expect(() => assertExpectedDrawRound(1236, 1237, "로또")).toThrow(
      "로또 1237회 결과가 없습니다. 응답 회차: 1236",
    );
  });

  it("응답 회차가 기대보다 앞서도 예외를 던진다", () => {
    expect(() => assertExpectedDrawRound(1238, 1237, "로또")).toThrow(
      "로또 1237회 결과가 없습니다. 응답 회차: 1238",
    );
  });
});
