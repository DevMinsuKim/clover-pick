export interface DrawSchedule {
  /** 0=일요일 … 6=토요일 */
  drawDayOfWeek: number;
  /** KST 기준 추첨 시작 시각 (시) */
  drawHour: number;
  /** KST 기준 추첨 시작 시각 (분), 기본 0 */
  drawMinute?: number;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

interface KstDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function getKstParts(date: Date): KstDateTimeParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "0";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
  };
}

/** KST 시각을 UTC epoch ms로 변환 */
function kstToUtcMs(parts: KstDateTimeParts): number {
  return (
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    ) - KST_OFFSET_MS
  );
}

/**
 * 앵커 날짜·회차와 주간 추첨 일정으로 "다음 예정 회차"를 계산한다.
 * 추첨 요일 당일에는 drawHour:drawMinute 이전/이후로 회차가 갈린다.
 */
export function calculateRoundNumber(
  anchorDate: Date,
  anchorRound: number,
  today: Date,
  schedule: DrawSchedule,
): number {
  const anchorParts = getKstParts(anchorDate);
  const anchorDrawMs = kstToUtcMs({
    ...anchorParts,
    hour: schedule.drawHour,
    minute: schedule.drawMinute ?? 0,
    second: 0,
  });

  const nowMs = kstToUtcMs(getKstParts(today));

  if (nowMs < anchorDrawMs) {
    return anchorRound;
  }

  const completedDraws = Math.floor((nowMs - anchorDrawMs) / WEEK_MS) + 1;
  return anchorRound + completedDraws;
}
