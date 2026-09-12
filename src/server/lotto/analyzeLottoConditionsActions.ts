"use server";

import { getLottoCurrentRound } from "@/constants/lotteryRounds";
import { lottoActionError } from "@/server/lottery/lottoActionError";
import {
  emptyLottoConstraints,
  type LottoActionResult,
  type LottoAnalyzeInput,
  type LottoPlan,
  lottoAnalyzeInputSchema,
  lottoQuickConditions,
  lottoSetCountSchema,
} from "@/server/lottery/lottoContracts";
import {
  assertLottoSetCapacity,
  LottoInputError,
  prepareLottoSpace,
} from "@/server/lottery/lottoEngine";
import { getLottoFrequency } from "@/server/lottery/lottoFrequency";
import { assertLottoRound } from "@/server/lottery/lottoPersistence";
import { limitLottoRequest } from "@/server/lottery/lottoRequestLimit";
import { parseLottoPrompt } from "@/server/lottery/parseLottoPrompt";

export async function analyzeLottoConditionsActions(
  input: LottoAnalyzeInput,
): Promise<LottoActionResult<LottoPlan>> {
  try {
    const { prompt, repeat, presets } = lottoAnalyzeInputSchema.parse(input);
    const selectedParity = lottoQuickConditions.filter(
      (item) => presets.includes(item.id) && item.oddCount !== null,
    );
    if (new Set(presets).size !== presets.length || selectedParity.length > 1)
      throw new LottoInputError("홀수·짝수 조건은 한 가지만 선택해 주세요.");
    const round = getLottoCurrentRound();
    assertLottoRound(round);
    await limitLottoRequest(prompt ? "analysis" : "quick");
    const extraction = prompt
      ? await parseLottoPrompt(prompt)
      : { constraints: { ...emptyLottoConstraints }, requestedSets: null };
    const constraints = { ...extraction.constraints };
    if (selectedParity.length) {
      const oddCount = selectedParity[0].oddCount;
      if (constraints.oddCount !== null && constraints.oddCount !== oddCount)
        throw new LottoInputError(
          "입력한 문장과 선택한 홀수·짝수 조건이 달라요. 같은 조건으로 맞춰 주세요.",
        );
      constraints.oddCount = oddCount;
    }
    constraints.frequent ||= presets.includes("frequent");
    const sets = lottoSetCountSchema.parse(extraction.requestedSets ?? repeat);
    const frequency = constraints.frequent ? await getLottoFrequency() : null;
    const space = prepareLottoSpace(constraints, frequency?.pool);
    assertLottoSetCapacity(sets, space.count);
    assertLottoRound(round);
    return {
      success: {
        constraints: space.constraints,
        repeat: sets,
        round,
        combinationCount: space.count,
        frequency,
      },
    };
  } catch (error) {
    return lottoActionError(error, "analysis");
  }
}
