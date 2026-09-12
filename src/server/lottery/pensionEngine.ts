import { LotteryInputError } from "./lotteryInputError";
import {
  type PensionConstraints,
  pensionConstraintsSchema,
  pensionCountSchema,
  pensionOutputSchema,
} from "./pensionContracts";
import { sampleDistinctRanks } from "./sampleDistinctRanks";

export function normalizePensionConstraints(
  input: PensionConstraints,
): PensionConstraints {
  const parsed = pensionConstraintsSchema.parse(input);
  const sorted = (values: number[]) =>
    [...new Set(values)].sort((a, b) => a - b);
  const constraints = {
    ...parsed,
    groups: sorted(parsed.groups),
    includeDigits: sorted(parsed.includeDigits),
    excludeDigits: sorted(parsed.excludeDigits),
  };
  if (
    constraints.includeDigits.some((n) => constraints.excludeDigits.includes(n))
  )
    throw new LotteryInputError(
      "같은 숫자를 포함하면서 제외할 수는 없어요. 조건을 수정해 주세요.",
    );
  return constraints;
}

/** Count six-digit strings by position and used-digit mask; preserve order and leading zeros. */
export function preparePensionSpace(
  input: PensionConstraints,
  isAllGroup = false,
) {
  const constraints = normalizePensionConstraints(input);
  if (isAllGroup && constraints.groups.length !== 5)
    throw new LotteryInputError(
      "특정 조와 모든 조를 함께 선택할 수 없어요. 조 조건을 하나로 맞춰 주세요.",
    );
  const allowed = Array.from({ length: 6 }, (_, position) =>
    Array.from({ length: 10 }, (_, digit) => digit).filter((digit) => {
      const prefixDigit = constraints.prefix[position];
      const suffixDigit =
        constraints.suffix[position - (6 - constraints.suffix.length)];
      return (
        !constraints.excludeDigits.includes(digit) &&
        (constraints.parity === "any" ||
          digit % 2 === (constraints.parity === "odd" ? 1 : 0)) &&
        (prefixDigit === undefined || Number(prefixDigit) === digit) &&
        (suffixDigit === undefined || Number(suffixDigit) === digit)
      );
    }),
  );
  const requiredMask = constraints.includeDigits.reduce(
    (mask, digit) => mask | (1 << digit),
    0,
  );
  const memo = new Map<number, number>();
  function countFrom(position: number, mask: number): number {
    if (position === 6) return (mask & requiredMask) === requiredMask ? 1 : 0;
    const key = position * 1024 + mask;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;
    let count = 0;
    for (const digit of allowed[position]) {
      if (constraints.uniqueDigits && mask & (1 << digit)) continue;
      count += countFrom(position + 1, mask | (1 << digit));
    }
    memo.set(key, count);
    return count;
  }
  const digitCount = countFrom(0, 0);
  const count = digitCount * (isAllGroup ? 1 : constraints.groups.length);
  if (!count)
    throw new LotteryInputError(
      "조건을 모두 만족하는 여섯 자리 번호를 만들 수 없어요. 고정한 자리나 포함·제외할 숫자를 확인해 주세요.",
    );
  return {
    constraints,
    count,
    at(rank: number) {
      if (!Number.isInteger(rank) || rank < 0 || rank >= count)
        throw new RangeError("Invalid pension rank");
      const group = constraints.groups[Math.floor(rank / digitCount)];
      let remaining = rank % digitCount;
      let digits = "";
      let mask = 0;
      for (let position = 0; position < 6; position++) {
        for (const digit of allowed[position]) {
          if (constraints.uniqueDigits && mask & (1 << digit)) continue;
          const block = countFrom(position + 1, mask | (1 << digit));
          if (remaining < block) {
            digits += digit;
            mask |= 1 << digit;
            break;
          }
          remaining -= block;
        }
      }
      return isAllGroup ? digits : `${group}${digits}`;
    },
  };
}
export function assertPensionCapacity(
  repeat: number,
  isAllGroup: boolean,
  count: number,
) {
  pensionCountSchema.parse(repeat);
  if (isAllGroup && repeat !== 5)
    throw new LotteryInputError(
      "모든 조를 선택하면 같은 번호로 1~5조, 총 5게임을 생성해요.",
    );
  if (!isAllGroup && repeat > count)
    throw new LotteryInputError(
      `이 조건으로는 서로 다른 번호로 ${count}게임까지 만들 수 있어요. 게임 수를 줄여 주세요.`,
    );
}
export function generatePensionNumbers(
  input: PensionConstraints,
  repeat: number,
  isAllGroup: boolean,
) {
  const space = preparePensionSpace(input, isAllGroup);
  assertPensionCapacity(repeat, isAllGroup, space.count);
  const values = sampleDistinctRanks(space.count, isAllGroup ? 1 : repeat).map(
    space.at,
  );
  const tickets = isAllGroup
    ? [1, 2, 3, 4, 5].map((group) => ({ number: `${group}${values[0]}` }))
    : values.map((number) => ({ number }));
  return pensionOutputSchema({ repeat, isAllGroup }).parse(tickets);
}
