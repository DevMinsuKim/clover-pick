"use server";

import * as Sentry from "@sentry/nextjs";
import { getLottoRecords } from "@/server/lottery/lottoRecords";
import type { LottoRecordsInput } from "@/server/lottery/lottoRecordsContracts";

export async function lottoHistoryActions(input: LottoRecordsInput = {}) {
  try {
    return await getLottoRecords("history", input);
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("생성 목록을 불러오지 못했어요.");
  }
}
