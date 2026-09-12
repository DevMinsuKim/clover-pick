"use server";

import * as Sentry from "@sentry/nextjs";
import { getPensionCurrentRound } from "@/constants/lotteryRounds";

export async function pensionActions() {
  try {
    return { success: { draw_number: getPensionCurrentRound() } };
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("2000");
  }
}
