import { queryOptions } from "@tanstack/react-query";
import type { LottoRecordsInput } from "@/server/lottery/lottoRecordsContracts";
import { lottoActions } from "@/server/lotto/lottoActions";
import { lottoHistoryActions } from "@/server/lotto/lottoHistoryActions";
import { lottoWinningActions } from "@/server/lotto/lottoWinningActions";

export const getLottoQuery = queryOptions({
  queryKey: ["lotto"],
  queryFn: () => lottoActions(),
});

export const getLottoHistoryQuery = (input: LottoRecordsInput = {}) =>
  queryOptions({
    queryKey: ["lottoHistory", input.page ?? 1, input.snapshotId ?? null],
    queryFn: () => lottoHistoryActions(input),
    staleTime: 30_000,
  });

export const getLottoWinningQuery = (input: LottoRecordsInput = {}) =>
  queryOptions({
    queryKey: ["lottoWinning", input.page ?? 1, input.snapshotId ?? null],
    queryFn: () => lottoWinningActions(input),
    staleTime: 30_000,
  });
