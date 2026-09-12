import { z } from "zod";

export const LOTTO_RECORDS_PAGE_SIZE = 6;
export type LottoRecordsKind = "history" | "winning";

export const LottoRecordsInputSchema = z.strictObject({
  page: z.number().int().min(1).max(2_147_483_647).default(1),
  snapshotId: z.number().int().min(0).max(2_147_483_647).optional(),
});
export type LottoRecordsInput = z.input<typeof LottoRecordsInputSchema>;

export type LottoRecord = {
  id: number;
  round: number;
  numbers: number[];
  generatedAt: string;
  drawDate: string | null;
  ranking: number | null;
};

export type LottoRecordsPage = {
  items: LottoRecord[];
  page: number;
  totalPages: number;
  totalCount: number;
  snapshotId: number;
};
