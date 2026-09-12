"use client";
import { useLotteryGeneration } from "@/components/lottery/useLotteryGeneration";
import { lottoCreateNumberActions } from "@/server/lotto/lottoCreateNumberActions";
export function useLottoGeneration(onBusyChange: (busy: boolean) => void) {
  return useLotteryGeneration(
    lottoCreateNumberActions,
    "lottoHistory",
    onBusyChange,
  );
}
