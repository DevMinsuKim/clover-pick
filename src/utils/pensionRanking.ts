/** 낙첨은 0, 보너스는 8. 여러 등위가 겹치면 가장 큰 당첨금 하나만 적용한다.
 * 기준: https://www.dhlottery.co.kr/pt720/intro
 */
export function getPensionRanking(
  userNumber: string,
  winningNumber: string,
  bonusNumber: string,
): number {
  if (
    !/^[1-5][0-9]{6}$/.test(userNumber) ||
    !/^[1-5][0-9]{6}$/.test(winningNumber) ||
    !/^[0-9]{6}$/.test(bonusNumber)
  )
    throw new Error("연금복권 번호 형식이 올바르지 않습니다.");
  if (userNumber === winningNumber) return 1;
  if (userNumber.slice(1) === winningNumber.slice(1)) return 2;
  if (userNumber.slice(1) === bonusNumber) return 8;
  for (let length = 5; length >= 1; length--) {
    if (userNumber.slice(-length) === winningNumber.slice(-length))
      return 8 - length;
  }
  return 0;
}
