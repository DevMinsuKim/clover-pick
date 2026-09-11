/** JSON이 아직 이전 회차이면 적재하지 않고 실패한다. */
export function assertExpectedDrawRound(
  actualRound: number,
  expectedRound: number,
  gameLabel: string,
): void {
  if (!Number.isInteger(actualRound) || actualRound <= 0) {
    throw new Error(
      `${gameLabel} 응답 회차가 올바르지 않습니다: ${actualRound}`,
    );
  }

  if (actualRound !== expectedRound) {
    throw new Error(
      `${gameLabel} ${expectedRound}회 결과가 없습니다. 응답 회차: ${actualRound}`,
    );
  }
}
