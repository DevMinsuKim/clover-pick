import { queryOptions } from "@tanstack/react-query";
import type { LotteryRecordsInput } from "@/server/lottery/lotteryRecordsContracts";
import { pensionActions } from "@/server/pension/pensionActions";
import { pensionHistoryActions } from "@/server/pension/pensionHistoryActions";
import { pensionWinningActions } from "@/server/pension/pensionWinningActions";

export const getPensionQuery = queryOptions({
  queryKey: ["pension"],
  queryFn: () => pensionActions(),
});

export const getPensionHistoryQuery = (input: LotteryRecordsInput = {}) =>
  queryOptions({
    queryKey: ["pensionHistory", input.page ?? 1, input.snapshotId ?? null],
    queryFn: () => pensionHistoryActions(input),
    staleTime: 30_000,
  });

export const getPensionWinningQuery = (input: LotteryRecordsInput = {}) =>
  queryOptions({
    queryKey: ["pensionWinning", input.page ?? 1, input.snapshotId ?? null],
    queryFn: () => pensionWinningActions(input),
    staleTime: 30_000,
  });
