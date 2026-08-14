"use server";

import { getLottoCurrentRound } from "@/constants/lotteryRounds";
import * as Sentry from "@sentry/nextjs";

export async function lottoActions() {
  try {
    return { success: { draw_number: getLottoCurrentRound() } };
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("2000");
  }
}
