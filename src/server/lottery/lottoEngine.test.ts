import { describe, expect, it } from "vitest";
import { emptyLottoConstraints as defaults } from "./lottoContracts";
import { generateLottoNumbers, prepareLottoSpace } from "./lottoEngine";

describe("조건에 맞는 로또 조합", () => {
  it("전체 조합 수와 시작·끝 조합을 정확히 계산한다", () => {
    const space = prepareLottoSpace(defaults);
    expect(space.count).toBe(8_145_060);
    expect(space.at(0)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(space.at(space.count - 1)).toEqual([40, 41, 42, 43, 44, 45]);
  });
  it("작은 홀짝 조합 공간을 누락이나 중복 없이 열거한다", () => {
    const space = prepareLottoSpace({
      ...defaults,
      include: [1, 2, 3, 4],
      oddCount: 3,
      exclude: Array.from({ length: 37 }, (_, i) => i + 9),
    });
    expect(space.count).toBe(4);
    expect(Array.from({ length: space.count }, (_, i) => space.at(i))).toEqual([
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4, 5, 8],
      [1, 2, 3, 4, 6, 7],
      [1, 2, 3, 4, 7, 8],
    ]);
  });
  it("최대 5세트를 생성하며 포함·제외·홀짝과 세트 간 중복 제한을 지킨다", () => {
    const results = generateLottoNumbers(
      { ...defaults, include: [7, 21], exclude: [2, 4, 6], oddCount: 3 },
      5,
    );
    expect(new Set(results.map((row) => row.numbers.join(","))).size).toBe(5);
    for (const { numbers } of results) {
      expect(numbers).toHaveLength(6);
      expect(new Set(numbers).size).toBe(6);
      expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
      expect(numbers).toEqual(expect.arrayContaining([7, 21]));
      expect(
        numbers.every((n) => n >= 1 && n <= 45 && ![2, 4, 6].includes(n)),
      ).toBe(true);
      expect(numbers.filter((n) => n % 2).length).toBe(3);
    }
  });
  it("6개 고정 번호로 2세트를 요청하면 개수를 줄이라고 안내한다", () => {
    const constraints = { ...defaults, include: [6, 5, 4, 3, 2, 1] };
    expect(generateLottoNumbers(constraints, 1)[0].numbers).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(() => generateLottoNumbers(constraints, 2)).toThrow("1게임까지");
  });
  it.each([
    { ...defaults, include: [1], exclude: [1] },
    { ...defaults, include: [1], oddCount: 0 },
    { ...defaults, include: [46] },
    { ...defaults, exclude: Array.from({ length: 40 }, (_, i) => i + 1) },
  ])("만족할 수 없거나 범위를 벗어난 조건을 거부한다: %o", (constraints) => {
    expect(() => prepareLottoSpace(constraints)).toThrow();
  });
  it("서버가 계산한 출현 상위 범위만 사용하고 포함 번호와의 충돌을 거부한다", () => {
    const pool = Array.from({ length: 20 }, (_, i) => i + 10);
    const results = generateLottoNumbers(
      { ...defaults, frequent: true },
      5,
      pool,
    );
    expect(
      results.every((row) => row.numbers.every((n) => pool.includes(n))),
    ).toBe(true);
    expect(() =>
      prepareLottoSpace({ ...defaults, frequent: true, include: [1] }, pool),
    ).toThrow("최근 많이 나온");
  });
});
