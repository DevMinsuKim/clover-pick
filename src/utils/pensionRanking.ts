/** 낙첨은 0. 8은 보너스 등위 동행복권 연금복권 규칙과 같다. */
export function getPensionRanking(
  userNumber: string,
  winningNumber: string,
  bonusNumber: string,
): number {
  if (userNumber === winningNumber) {
    return 1;
  }
  if (userNumber.slice(-6) === winningNumber.slice(-6)) {
    return 2;
  }
  if (userNumber.slice(-5) === winningNumber.slice(-5)) {
    return 3;
  }
  if (userNumber.slice(-4) === winningNumber.slice(-4)) {
    return 4;
  }
  if (userNumber.slice(-3) === winningNumber.slice(-3)) {
    return 5;
  }
  if (userNumber.slice(-2) === winningNumber.slice(-2)) {
    return 6;
  }
  if (userNumber.slice(-1) === winningNumber.slice(-1)) {
    return 7;
  }
  if (userNumber.slice(-6) === bonusNumber.slice(-6)) {
    return 8;
  }
  return 0;
}
