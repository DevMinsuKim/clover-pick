import { LotteryInputError as LottoInputError } from "./lotteryInputError";
import {
  type LottoConstraints,
  lottoConstraintsSchema,
  lottoSetCountSchema,
} from "./lottoContracts";
import { sampleDistinctRanks } from "./sampleDistinctRanks";

export { LotteryInputError as LottoInputError } from "./lotteryInputError";

export function assertLottoSetCapacity(
  repeat: number,
  combinationCount: number,
) {
  if (repeat > combinationCount)
    throw new LottoInputError(
      `이 조건으로는 서로 다른 조합을 ${combinationCount}개까지 만들 수 있어요. 세트 수를 줄여 주세요.`,
    );
}

export function normalizeLottoConstraints(
  input: LottoConstraints,
): LottoConstraints {
  const parsed = lottoConstraintsSchema.parse(input);
  const include = [...new Set(parsed.include)].sort((a, b) => a - b);
  const exclude = [...new Set(parsed.exclude)].sort((a, b) => a - b);
  if (include.some((number) => exclude.includes(number))) {
    throw new LottoInputError(
      "같은 번호를 포함하면서 제외할 수는 없어요. 조건을 수정해 주세요.",
    );
  }
  return { ...parsed, include, exclude };
}

function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let count = 1;
  for (let i = 1; i <= k; i++) count = (count * (n - i + 1)) / i;
  return Math.round(count);
}

function unrank(pool: number[], count: number, rank: number) {
  const selected: number[] = [];
  for (let i = 0; i < pool.length && count > 0; i++) {
    const block = choose(pool.length - i - 1, count - 1);
    if (rank < block) {
      selected.push(pool[i]);
      count--;
    } else rank -= block;
  }
  return selected;
}

// Count valid combinations first; sample ranks without retry loops or biased fallback.
export function prepareLottoSpace(
  input: LottoConstraints,
  frequentPool?: number[],
) {
  const constraints = normalizeLottoConstraints(input);
  if (constraints.frequent && !frequentPool)
    throw new LottoInputError(
      "최근 당첨 번호를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.",
    );
  const pool = Array.from({ length: 45 }, (_, i) => i + 1).filter(
    (number) =>
      !constraints.exclude.includes(number) &&
      (!constraints.frequent || frequentPool?.includes(number)),
  );
  if (constraints.include.some((number) => !pool.includes(number))) {
    throw new LottoInputError(
      "포함할 번호가 최근 많이 나온 20개 번호에 없어요. 포함할 번호를 바꾸거나 ‘최근 많이 나온 번호’ 조건을 해제해 주세요.",
    );
  }
  const available = pool.filter(
    (number) => !constraints.include.includes(number),
  );
  const needed = 6 - constraints.include.length;
  const odd = available.filter((number) => number % 2 === 1);
  const even = available.filter((number) => number % 2 === 0);
  const oddNeeded =
    constraints.oddCount === null
      ? null
      : constraints.oddCount -
        constraints.include.filter((number) => number % 2 === 1).length;
  const evenWays =
    oddNeeded === null ? 0 : choose(even.length, needed - oddNeeded);
  const count =
    oddNeeded === null
      ? choose(available.length, needed)
      : choose(odd.length, oddNeeded) * evenWays;
  if (count === 0)
    throw new LottoInputError(
      "조건을 모두 만족하는 6개 번호를 만들 수 없어요. 포함·제외 번호나 홀수·짝수 조건을 수정해 주세요.",
    );
  return {
    constraints,
    count,
    at(rank: number) {
      const picked =
        oddNeeded === null
          ? unrank(available, needed, rank)
          : [
              ...unrank(odd, oddNeeded, Math.floor(rank / evenWays)),
              ...unrank(even, needed - oddNeeded, rank % evenWays),
            ];
      return [...constraints.include, ...picked].sort((a, b) => a - b);
    },
  };
}

export function generateLottoNumbers(
  input: LottoConstraints,
  repeat: number,
  frequentPool?: number[],
) {
  lottoSetCountSchema.parse(repeat);
  const space = prepareLottoSpace(input, frequentPool);
  assertLottoSetCapacity(repeat, space.count);
  return sampleDistinctRanks(space.count, repeat).map((rank) => ({
    numbers: space.at(rank),
  }));
}
