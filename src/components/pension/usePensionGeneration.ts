"use client";
import { useLotteryGeneration } from "@/components/lottery/useLotteryGeneration";
import { pensionCreateNumberActions } from "@/server/pension/pensionCreateNumberActions";
export function usePensionGeneration(onBusyChange: (busy: boolean) => void) {
  return useLotteryGeneration(
    pensionCreateNumberActions,
    "pensionHistory",
    onBusyChange,
  );
}
