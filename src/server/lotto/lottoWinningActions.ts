"use server";

import * as Sentry from "@sentry/nextjs";
import { getLottoRecords } from "@/server/lottery/lottoRecords";
import type { LottoRecordsInput } from "@/server/lottery/lottoRecordsContracts";

export async function lottoWinningActions(input: LottoRecordsInput = {}) {
  try {
    return await getLottoRecords("winning", input);
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("당첨 내역을 불러오지 못했어요.");
  }
}
