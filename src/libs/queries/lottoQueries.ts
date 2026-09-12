import { queryOptions } from "@tanstack/react-query";
import type { LotteryRecordsInput } from "@/server/lottery/lotteryRecordsContracts";
import { lottoActions } from "@/server/lotto/lottoActions";
import { lottoHistoryActions } from "@/server/lotto/lottoHistoryActions";
import { lottoWinningActions } from "@/server/lotto/lottoWinningActions";

export const getLottoQuery = queryOptions({
  queryKey: ["lotto"],
  queryFn: () => lottoActions(),
});

export const getLottoHistoryQuery = (input: LotteryRecordsInput = {}) =>
  queryOptions({
    queryKey: ["lottoHistory", input.page ?? 1, input.snapshotId ?? null],
    queryFn: () => lottoHistoryActions(input),
    staleTime: 30_000,
  });

export const getLottoWinningQuery = (input: LotteryRecordsInput = {}) =>
  queryOptions({
    queryKey: ["lottoWinning", input.page ?? 1, input.snapshotId ?? null],
    queryFn: () => lottoWinningActions(input),
    staleTime: 30_000,
  });
