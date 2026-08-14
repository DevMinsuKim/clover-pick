/** 낙첨은 0. 1~5등은 동행복권 로또 6/45 등수 규칙과 같다. */
export function getLottoRanking(
  userNumbers: number[],
  winningNumbers: number[],
  bonusNumber: number,
): number {
  const matchCount = userNumbers.filter((num) =>
    winningNumbers.includes(num),
  ).length;

  if (matchCount === 6) {
    return 1;
  }
  if (matchCount === 5 && userNumbers.includes(bonusNumber)) {
    return 2;
  }
  if (matchCount === 5) {
    return 3;
  }
  if (matchCount === 4) {
    return 4;
  }
  if (matchCount === 3) {
    return 5;
  }
  return 0;
}
