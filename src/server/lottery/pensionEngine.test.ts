import { describe, expect, it } from "vitest";
import {
  emptyPensionConstraints as empty,
  type PensionConstraints,
  pensionOutputSchema,
} from "./pensionContracts";
import { generatePensionNumbers, preparePensionSpace } from "./pensionEngine";

const c = (changes: Partial<PensionConstraints>) => ({ ...empty, ...changes });
describe("연금복권의 순서 있는 번호 생성", () => {
  it("전체 500만 조합에 0으로 시작하는 번호와 반복 숫자를 포함한다", () => {
    const space = preparePensionSpace(empty);
    expect(space.count).toBe(5_000_000);
    expect(space.at(0)).toBe("1000000");
    expect(space.at(space.count - 1)).toBe("5999999");
    expect(space.at(1_000_000)).toBe("2000000");
  });
  it("앞·끝자리와 포함·제외 숫자를 동시에 적용하며 작은 공간은 전수 결과와 일치한다", () => {
    const constraints = c({
      groups: [3],
      prefix: "001",
      suffix: "7",
      includeDigits: [2],
      excludeDigits: [4],
    });
    const expected: string[] = [];
    for (let n = 0; n < 100; n++) {
      const digits = `001${String(n).padStart(2, "0")}7`;
      if (digits.includes("2") && !digits.includes("4"))
        expected.push(`3${digits}`);
    }
    const space = preparePensionSpace(constraints);
    expect(Array.from({ length: space.count }, (_, i) => space.at(i))).toEqual(
      expected,
    );
  });
  it("중복 숫자 제외는 자리 순서를 유지하고 조 숫자는 검사에서 제외한다", () => {
    const space = preparePensionSpace(
      c({ groups: [3], prefix: "3012", uniqueDigits: true }),
    );
    expect(space.count).toBe(30);
    const values = Array.from({ length: space.count }, (_, i) => space.at(i));
    expect(values).toContain("3301245");
    expect(values).toContain("3301254");
    expect(values.every((n) => new Set(n.slice(1)).size === 6)).toBe(true);
  });
  it("짝수 0을 허용하고 가능한 조합만 추출한다", () => {
    const space = preparePensionSpace(c({ parity: "even", groups: [1] }));
    expect(space.count).toBe(5 ** 6);
    expect(space.at(0)).toBe("1000000");
    expect(space.at(space.count - 1)).toBe("1888888");
    expect(() =>
      preparePensionSpace(c({ parity: "even", uniqueDigits: true })),
    ).toThrow("만들 수 없어요");
  });
  it("모든 조는 고정 여섯 자리 후보가 하나여도 총 5개를 만든다", () => {
    const result = generatePensionNumbers(c({ prefix: "000007" }), 5, true);
    expect(result.map((n) => n.number)).toEqual([
      "1000007",
      "2000007",
      "3000007",
      "4000007",
      "5000007",
    ]);
  });
  it("낱개 요청의 결과 개수와 유일성을 지키고 서로 다른 조를 허용한다", () => {
    const result = generatePensionNumbers(c({ prefix: "000007" }), 5, false);
    expect(new Set(result.map((n) => n.number))).toEqual(
      new Set(["1000007", "2000007", "3000007", "4000007", "5000007"]),
    );
    expect(() =>
      generatePensionNumbers(c({ groups: [1], prefix: "000007" }), 2, false),
    ).toThrow("1개까지");
  });
  it.each([
    { groups: [0] },
    { prefix: "1234567" },
    { suffix: "ab" },
    { includeDigits: [7], excludeDigits: [7] },
    { prefix: "1234", suffix: "9999" },
    { prefix: "00", uniqueDigits: true },
    { includeDigits: [0, 1, 2, 3, 4, 5, 6] },
    { includeDigits: [3], parity: "even" },
  ])("잘못되거나 실현 불가능한 조건을 거부한다: %o", (changes) => {
    expect(() =>
      preparePensionSpace(c(changes as Partial<PensionConstraints>)),
    ).toThrow();
  });
  it("모든 조와 일부 조 조건, 5개가 아닌 개수의 충돌을 거부한다", () => {
    expect(() => generatePensionNumbers(c({ groups: [2] }), 5, true)).toThrow(
      "특정 조",
    );
    expect(() => generatePensionNumbers(empty, 1, true)).toThrow("총 5개");
    expect(() => generatePensionNumbers(empty, 6, false)).toThrow();
  });
  it("출력에서 중복 번호·개수 부족·서로 다른 모든 조 번호를 거부한다", () => {
    expect(() =>
      pensionOutputSchema({ repeat: 2, isAllGroup: false }).parse([
        { number: "1000000" },
        { number: "1000000" },
      ]),
    ).toThrow();
    expect(() =>
      pensionOutputSchema({ repeat: 5, isAllGroup: true }).parse(
        [1, 2, 3, 4, 5].map((n) => ({ number: `${n}00000${n}` })),
      ),
    ).toThrow();
  });
});
