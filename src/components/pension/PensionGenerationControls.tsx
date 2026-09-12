"use client";
import { useId } from "react";
import {
  LotteryCountSelector,
  LotteryResultActions,
} from "@/components/lottery/LotteryGenerationControls";
import type { PensionGeneration } from "@/server/lottery/pensionContracts";
import PensionNumbers from "./PensionNumbers";

export function PensionTicketSelector({
  repeat,
  isAllGroup,
  onChange,
  disabled,
}: {
  repeat: number;
  isAllGroup: boolean;
  onChange: (repeat: number, isAllGroup: boolean) => void;
  disabled: boolean;
}) {
  const id = useId();
  return (
    <>
      <LotteryCountSelector
        value={isAllGroup ? 5 : repeat}
        onChange={(value) => onChange(value, false)}
        disabled={disabled || isAllGroup}
        unit="개"
      />
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-divider bg-background p-4 dark:border-zinc-600">
        <input
          type="checkbox"
          checked={isAllGroup}
          disabled={disabled}
          onChange={(event) =>
            onChange(event.target.checked ? 5 : repeat, event.target.checked)
          }
          aria-describedby={`${id}-hint`}
          className="mt-0.5 size-5 shrink-0 accent-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
        <span>
          <span className="block text-sm font-semibold">
            같은 번호로 모든 조 생성
          </span>
          <span
            id={`${id}-hint`}
            className="mt-1 block text-xs leading-5 text-content3"
          >
            여섯 자리 번호 하나에 1~5조를 붙여, 총 5개를 만들어요.
          </span>
        </span>
      </label>
    </>
  );
}
export function PensionGenerationResult({
  result,
  onAgain,
  busy,
  againLabel,
}: {
  result: PensionGeneration;
  onAgain: () => void;
  busy: boolean;
  againLabel?: string;
}) {
  const copyText =
    `${result.round}회 연금복권720+\n` +
    result.pensionNumbers
      .map(
        ({ number }, index) =>
          `${index + 1}. [${number[0]}조 ${number.slice(1)}]`,
      )
      .join("\n");
  return (
    <LotteryResultActions
      copyText={copyText}
      onAgain={onAgain}
      busy={busy}
      againLabel={againLabel}
    >
      <h3 className="text-sm font-bold">
        {result.round}회 · 번호 {result.pensionNumbers.length}개
        {result.isAllGroup ? " · 모든 조" : ""}
      </h3>
      <ul className="mt-3 space-y-3" aria-label="생성한 연금복권 번호">
        {result.pensionNumbers.map(({ number }) => (
          <li key={number} className="rounded-lg bg-content1Hover/50 p-3">
            <PensionNumbers number={number} />
          </li>
        ))}
      </ul>
    </LotteryResultActions>
  );
}
