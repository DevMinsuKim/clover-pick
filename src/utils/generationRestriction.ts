function getSeoulWeekdayAndClock(now: Date) {
  const seoulTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return {
    day: seoulTime.getUTCDay(),
    totalMinutes: seoulTime.getUTCHours() * 60 + seoulTime.getUTCMinutes(),
  };
}

/** 로또 생성 제한: 토 20:00 이상 23:30 미만 (KST) */
export function isLottoGenerationRestricted(now: Date = new Date()): boolean {
  const { day, totalMinutes } = getSeoulWeekdayAndClock(now);
  return day === 6 && totalMinutes >= 20 * 60 && totalMinutes < 23 * 60 + 30;
}

/** 연금복권 생성 제한: 목 17:00 이상 22:00 미만 (KST) */
export function isPensionGenerationRestricted(now: Date = new Date()): boolean {
  const { day, totalMinutes } = getSeoulWeekdayAndClock(now);
  return day === 4 && totalMinutes >= 17 * 60 && totalMinutes < 22 * 60;
}
