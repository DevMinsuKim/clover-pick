const KOREA_TIME_OFFSET_MS = 9 * 60 * 60 * 1000;

export const convertToKoreaTime = (date: Date): string => {
  const koreaDate = new Date(date.getTime() + KOREA_TIME_OFFSET_MS);
  return koreaDate.toISOString().replace("Z", "+09:00");
};
