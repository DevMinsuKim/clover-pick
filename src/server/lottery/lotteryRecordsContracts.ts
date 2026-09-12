import { z } from "zod";

export const LOTTERY_RECORDS_PAGE_SIZE = 6;
export type LotteryRecordsKind = "history" | "winning";

export const LotteryRecordsInputSchema = z.strictObject({
  page: z.number().int().min(1).max(2_147_483_647).default(1),
  snapshotId: z.number().int().min(0).max(2_147_483_647).optional(),
});
export type LotteryRecordsInput = z.input<typeof LotteryRecordsInputSchema>;

export type LotteryRecord = {
  id: number;
  round: number;
  numbers: number[];
  generatedAt: string;
  drawDate: string | null;
  ranking: number | null;
};

export type LotteryRecordsPage = {
  items: LotteryRecord[];
  page: number;
  totalPages: number;
  totalCount: number;
  snapshotId: number;
};
