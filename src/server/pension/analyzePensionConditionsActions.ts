"use server";
import { getPensionCurrentRound } from "@/constants/lotteryRounds";
import { LotteryInputError } from "@/server/lottery/lotteryInputError";
import { limitLotteryRequest } from "@/server/lottery/lotteryRequestLimit";
import { parsePensionPrompt } from "@/server/lottery/parsePensionPrompt";
import { pensionActionError } from "@/server/lottery/pensionActionError";
import {
  emptyPensionConstraints,
  type PensionActionResult,
  type PensionAnalyzeInput,
  type PensionPlan,
  pensionAnalyzeInputSchema,
  pensionCountSchema,
} from "@/server/lottery/pensionContracts";
import {
  assertPensionCapacity,
  preparePensionSpace,
} from "@/server/lottery/pensionEngine";
import { assertPensionRound } from "@/server/lottery/pensionPersistence";

export async function analyzePensionConditionsActions(
  input: PensionAnalyzeInput,
): Promise<PensionActionResult<PensionPlan>> {
  try {
    const { prompt, repeat, isAllGroup, presets } =
      pensionAnalyzeInputSchema.parse(input);
    if (new Set(presets).size !== presets.length)
      throw new LotteryInputError("같은 조건을 여러 번 선택할 수 없어요.");
    const round = getPensionCurrentRound();
    assertPensionRound(round);
    await limitLotteryRequest(prompt ? "analysis" : "quick");
    const extraction = prompt
      ? await parsePensionPrompt(prompt)
      : {
          constraints: { ...emptyPensionConstraints },
          requestedCount: null,
          allGroups: null,
        };
    if (isAllGroup && extraction.allGroups === false)
      throw new LotteryInputError(
        "입력한 조 조건과 모든 조 선택이 달라요. 같은 조건으로 맞춰 주세요.",
      );
    const allGroups = extraction.allGroups ?? isAllGroup;
    const count = pensionCountSchema.parse(
      extraction.requestedCount ?? (allGroups ? 5 : repeat),
    );
    const constraints = { ...extraction.constraints };
    if (presets.includes("no-zero"))
      constraints.excludeDigits = [
        ...new Set([...constraints.excludeDigits, 0]),
      ];
    if (presets.includes("unique")) constraints.uniqueDigits = true;
    if (presets.includes("last-seven")) {
      if (constraints.suffix && !constraints.suffix.endsWith("7"))
        throw new LotteryInputError(
          "입력한 끝자리와 빠른 조건의 끝자리 7이 달라요. 같은 조건으로 맞춰 주세요.",
        );
      constraints.suffix ||= "7";
    }
    const space = preparePensionSpace(constraints, allGroups);
    assertPensionCapacity(count, allGroups, space.count);
    assertPensionRound(round);
    return {
      success: {
        constraints: space.constraints,
        repeat: count,
        isAllGroup: allGroups,
        round,
        combinationCount: space.count,
      },
    };
  } catch (error) {
    return pensionActionError(error, "analysis");
  }
}
