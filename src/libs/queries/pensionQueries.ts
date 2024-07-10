import { queryOptions } from "@tanstack/react-query";
import { pensionActions } from "@/server/pension/pensionActions";
import { pensionHistoryActions } from "@/server/pension/pensionHistoryActions";
import { pensionWinningActions } from "@/server/pension/pensionWinningActions";

export const getPensionQuery = queryOptions({
  queryKey: ["pension"],
  queryFn: () => {
    return pensionActions();
  },
});

export const getPensionHistoryQuery = queryOptions({
  queryKey: ["pensionHistory"],
  queryFn: () => {
    return pensionHistoryActions();
  },
});

export const getPensionWinningQuery = queryOptions({
  queryKey: ["pensionWinning"],
  queryFn: async () => {
    return pensionWinningActions();
  },
});
