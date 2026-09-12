import prisma from "@/libs/prisma";
import {
  LOTTERY_RECORDS_PAGE_SIZE,
  type LotteryRecordsInput,
  LotteryRecordsInputSchema,
  type LotteryRecordsKind,
  type LotteryRecordsPage,
} from "./lotteryRecordsContracts";

export async function getLottoRecords(
  kind: LotteryRecordsKind,
  input: LotteryRecordsInput = {},
): Promise<LotteryRecordsPage> {
  const parsed = LotteryRecordsInputSchema.parse(input);
  // Count, page boundaries and rows must come from the same database snapshot.
  return prisma.$transaction(
    async (tx) => {
      const latestArgs = {
        where:
          parsed.snapshotId === undefined
            ? {}
            : { id: { lte: parsed.snapshotId } },
        orderBy: { id: "desc" as const },
        select: { id: true as const },
      };
      const latest =
        kind === "history"
          ? await tx.created_lotto.findFirst(latestArgs)
          : await tx.winning_lotto.findFirst(latestArgs);
      const snapshotId = latest?.id ?? 0;
      // Keep newly inserted rows from shifting later pages while someone browses.
      const where = { id: { lte: snapshotId } };
      const totalCount =
        kind === "history"
          ? await tx.created_lotto.count({ where })
          : await tx.winning_lotto.count({ where });
      const totalPages = Math.max(
        1,
        Math.ceil(totalCount / LOTTERY_RECORDS_PAGE_SIZE),
      );
      const page = Math.min(parsed.page, totalPages);
      const window = {
        where,
        take: LOTTERY_RECORDS_PAGE_SIZE,
        skip: (page - 1) * LOTTERY_RECORDS_PAGE_SIZE,
      };
      const metadata = { page, totalPages, totalCount, snapshotId };

      if (kind === "history") {
        const rows = await tx.created_lotto.findMany({
          ...window,
          orderBy: { id: "desc" },
          select: {
            id: true,
            draw_number: true,
            number1: true,
            number2: true,
            number3: true,
            number4: true,
            number5: true,
            number6: true,
            created: true,
          },
        });
        return {
          ...metadata,
          items: rows.map((row) => ({
            id: row.id,
            round: row.draw_number,
            numbers: [
              row.number1,
              row.number2,
              row.number3,
              row.number4,
              row.number5,
              row.number6,
            ],
            generatedAt: row.created.toISOString(),
            drawDate: null,
            ranking: null,
          })),
        };
      }

      const rows = await tx.winning_lotto.findMany({
        ...window,
        orderBy: [{ draw_number: "desc" }, { id: "desc" }],
        select: {
          id: true,
          draw_number: true,
          ranking: true,
          winning_number1: true,
          winning_number2: true,
          winning_number3: true,
          winning_number4: true,
          winning_number5: true,
          winning_number6: true,
          winning_created: true,
        },
      });
      const draws = rows.length
        ? await tx.lotto.findMany({
            where: {
              draw_number: {
                in: [...new Set(rows.map((row) => row.draw_number))],
              },
            },
            select: { draw_number: true, draw_date: true },
          })
        : [];
      // PostgreSQL DATE is a calendar date; serialize it without inventing a time.
      const dates = new Map(
        draws.map((draw) => [
          draw.draw_number,
          draw.draw_date.toISOString().slice(0, 10),
        ]),
      );
      return {
        ...metadata,
        items: rows.map((row) => ({
          id: row.id,
          round: row.draw_number,
          numbers: [
            row.winning_number1,
            row.winning_number2,
            row.winning_number3,
            row.winning_number4,
            row.winning_number5,
            row.winning_number6,
          ],
          generatedAt: row.winning_created.toISOString(),
          drawDate: dates.get(row.draw_number) ?? null,
          ranking: row.ranking,
        })),
      };
    },
    { isolationLevel: "RepeatableRead" },
  );
}
