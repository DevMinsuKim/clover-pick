"use server";
import { captureException } from "@sentry/nextjs";
import type { LotteryRecordsInput } from "@/server/lottery/lotteryRecordsContracts";
import { getPensionRecords } from "@/server/lottery/pensionRecords";
export async function pensionWinningActions(input: LotteryRecordsInput = {}) {
  try {
    return await getPensionRecords("winning", input);
  } catch {
    captureException(new Error("Pension winning query failed"));
    throw new Error("목록을 불러오지 못했어요.");
  }
}
