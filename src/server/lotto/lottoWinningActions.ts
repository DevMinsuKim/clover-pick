"use server";

import * as Sentry from "@sentry/nextjs";
import type { LotteryRecordsInput } from "@/server/lottery/lotteryRecordsContracts";
import { getLottoRecords } from "@/server/lottery/lottoRecords";

export async function lottoWinningActions(input: LotteryRecordsInput = {}) {
  try {
    return await getLottoRecords("winning", input);
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("당첨 내역을 불러오지 못했어요.");
  }
}
