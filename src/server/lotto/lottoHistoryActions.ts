"use server";

import * as Sentry from "@sentry/nextjs";
import type { LotteryRecordsInput } from "@/server/lottery/lotteryRecordsContracts";
import { getLottoRecords } from "@/server/lottery/lottoRecords";

export async function lottoHistoryActions(input: LotteryRecordsInput = {}) {
  try {
    return await getLottoRecords("history", input);
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("생성 목록을 불러오지 못했어요.");
  }
}
