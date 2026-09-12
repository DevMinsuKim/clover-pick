import { randomInt } from "node:crypto";

/** Floyd sampling: fixed iteration count, no collisions or biased fallback. */
export function sampleDistinctRanks(size: number, count: number) {
  if (
    !Number.isSafeInteger(size) ||
    size < 1 ||
    size >= 2 ** 48 ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > 5 ||
    count > size
  )
    throw new RangeError("Invalid sample size");
  const ranks = new Set<number>();
  for (let i = size - count; i < size; i++) {
    const rank = randomInt(i + 1);
    ranks.add(ranks.has(rank) ? i : rank);
  }
  return [...ranks];
}
