"use client";

import { useState } from "react";
import { getLottoCurrentRound } from "@/constants/lotteryRounds";
import LottoCustomGenerator from "./LottoCustomGenerator";
import {
  LottoActionButton,
  LottoGenerationResult,
  LottoInlineError,
  LottoSetSelector,
} from "./LottoGenerationControls";
import { useLottoGeneration } from "./useLottoGeneration";

function LottoRandomGenerator({
  onBusyChange,
}: {
  onBusyChange: (busy: boolean) => void;
}) {
  const [repeat, setRepeat] = useState(1);
  const generation = useLottoGeneration(onBusyChange);
  function generate() {
    void generation.generate({ repeat, expectedRound: getLottoCurrentRound() });
  }
  return (
    <div
      className="px-5 pb-5 pt-6 text-left sm:px-6"
      aria-busy={generation.busy}
    >
      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary1 dark:text-primary">
        랜덤 생성
      </span>
      <h2 className="mt-3 text-xl font-bold">
        {generation.result
          ? "번호가 준비됐어요"
          : "가볍게, 랜덤으로 골라보세요"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-content3">
        1부터 45까지의 번호 중 6개를 무작위로 골라요.
        <br />한 번에 생성한 게임끼리는 같은 조합이 나오지 않아요.
      </p>
      <LottoSetSelector
        value={repeat}
        onChange={(value) => {
          setRepeat(value);
          generation.clearError();
        }}
        disabled={generation.busy}
      />
      <LottoInlineError message={generation.error} />
      {generation.result ? (
        <LottoGenerationResult
          key={JSON.stringify(generation.result)}
          result={generation.result}
          busy={generation.busy}
          onAgain={generate}
          againLabel={
            repeat === generation.result.lottoNumbers.length
              ? `${repeat}게임 다시 생성하기`
              : `선택한 ${repeat}게임으로 다시 생성`
          }
        />
      ) : (
        <LottoActionButton
          type="button"
          busy={generation.busy}
          disabled={generation.busy}
          onClick={generate}
          className="mt-6"
        >
          {generation.busy ? "번호 생성 중..." : `${repeat}게임 랜덤 생성하기`}
        </LottoActionButton>
      )}
    </div>
  );
}

export default function LottoGenerator() {
  const [mode, setMode] = useState<"random" | "custom">("random");
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mt-8 w-full max-w-lg rounded-xl border bg-content1 shadow-md dark:border-none">
        <fieldset
          aria-label="번호 생성 방식"
          disabled={busy}
          className="mx-5 mt-5 flex rounded-lg bg-content1Hover p-1"
        >
          {(["random", "custom"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={mode === item}
              onClick={() => setMode(item)}
              className={`min-h-11 flex-1 rounded-md px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 ${mode === item ? "bg-background text-primary1 shadow-sm dark:text-primary" : "text-content3 hover:text-foreground"}`}
            >
              {item === "random" ? "랜덤 생성" : "맞춤 생성"}
            </button>
          ))}
        </fieldset>
        <div hidden={mode !== "random"}>
          <LottoRandomGenerator onBusyChange={setBusy} />
        </div>
        <div hidden={mode !== "custom"}>
          <LottoCustomGenerator onBusyChange={setBusy} />
        </div>
        <div className="border-t border-divider dark:border-zinc-600 px-5 py-4 text-center text-xs leading-5 text-content3">
          {mode === "custom" && <p>조건을 선택해도 당첨확률은 같아요.</p>}
          <p>생성한 번호는 생성 목록에 보여요.</p>
        </div>
      </div>
    </div>
  );
}
