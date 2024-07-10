import { queryOptions } from "@tanstack/react-query";
import { lottoActions } from "@/server/lotto/lottoActions";
import { lottoHistoryActions } from "@/server/lotto/lottoHistoryActions";
import { lottoWinningActions } from "@/server/lotto/lottoWinningActions";

export const getLottoQuery = queryOptions({
  queryKey: ["lotto"],
  queryFn: () => {
    return lottoActions();
  },
});

export const getLottoHistoryQuery = queryOptions({
  queryKey: ["lottoHistory"],
  queryFn: () => {
    return lottoHistoryActions();
  },
});

export const getLottoWinningQuery = queryOptions({
  queryKey: ["lottoWinning"],
  queryFn: () => {
    return lottoWinningActions();
  },
});
