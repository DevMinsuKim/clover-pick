const koreaDateTime = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatDate(dateString: string): string {
  const parts = koreaDateTime.formatToParts(new Date(dateString));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value;
  return `${part("year")}.${part("month")}.${part("day")} ${part("hour")}:${part("minute")}`;
}

/** Accept the YYYY-MM-DD calendar date returned for a PostgreSQL DATE. */
export function formatDrawDate(date: string): string {
  return date.replaceAll("-", ".");
}
