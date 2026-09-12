"use client";
import { LotteryResultActions } from "@/components/lottery/LotteryGenerationControls";
import type { LottoGeneration } from "@/server/lottery/lottoContracts";
import { lottoNumberBg } from "@/utils/lottoNumberBg";

export {
  LotteryActionButton as LottoActionButton,
  LotteryCountSelector as LottoSetSelector,
  LotteryInlineError as LottoInlineError,
} from "@/components/lottery/LotteryGenerationControls";
export function LottoGenerationResult({
  result,
  onAgain,
  busy,
  againLabel,
}: {
  result: LottoGeneration;
  onAgain: () => void;
  busy: boolean;
  againLabel?: string;
}) {
  const copyText =
    `${result.round}회 로또\n` +
    result.lottoNumbers
      .map(({ numbers }, index) => `${index + 1}. [${numbers.join(", ")}]`)
      .join("\n");
  return (
    <LotteryResultActions
      copyText={copyText}
      onAgain={onAgain}
      busy={busy}
      againLabel={againLabel}
    >
      <h3 className="text-sm font-bold">
        {result.round}회 · {result.lottoNumbers.length}게임
      </h3>
      <ul className="mt-3 space-y-3" aria-label="생성한 로또 번호">
        {result.lottoNumbers.map(({ numbers }, index) => (
          <li
            key={numbers.join(",")}
            className="flex justify-between gap-1 rounded-lg bg-content1Hover/50 p-3"
            aria-label={`${index + 1}게임: ${numbers.join(", ")}`}
          >
            {numbers.map((number) => (
              <span
                key={number}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white xs:h-9 xs:w-9 xs:text-base sm:h-12 sm:w-12 sm:text-xl"
                style={{
                  backgroundColor: lottoNumberBg(number),
                  textShadow: "0px 0px 3px rgba(73, 57, 0, .8)",
                }}
              >
                {number}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </LotteryResultActions>
  );
}
