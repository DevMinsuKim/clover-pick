/** Vercel Cron이 보내는 Authorization: Bearer CRON_SECRET 과 일치하는지 확인한다. */
export function isAuthorizedCronRequest(authHeader: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET;
  return Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`;
}
