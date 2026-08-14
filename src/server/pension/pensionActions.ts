"use server";

import { getPensionCurrentRound } from "@/constants/lotteryRounds";
import * as Sentry from "@sentry/nextjs";

export async function pensionActions() {
  try {
    return { success: { draw_number: getPensionCurrentRound() } };
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("2000");
  }
}
