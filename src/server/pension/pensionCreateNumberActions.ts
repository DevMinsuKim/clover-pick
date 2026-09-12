"use server";
import { limitLotteryRequest } from "@/server/lottery/lotteryRequestLimit";
import { pensionActionError } from "@/server/lottery/pensionActionError";
import {
  emptyPensionConstraints,
  type PensionActionResult,
  type PensionCreateInput,
  type PensionGeneration,
  pensionCreateInputSchema,
} from "@/server/lottery/pensionContracts";
import {
  generatePensionNumbers,
  normalizePensionConstraints,
} from "@/server/lottery/pensionEngine";
import {
  assertPensionRound,
  findPensionBatch,
  pensionRequestHash,
  savePensionBatch,
} from "@/server/lottery/pensionPersistence";

export async function pensionCreateNumberActions(
  input: PensionCreateInput,
): Promise<PensionActionResult<PensionGeneration>> {
  try {
    const parsed = pensionCreateInputSchema.parse(input);
    const constraints = normalizePensionConstraints(
      parsed.constraints ?? emptyPensionConstraints,
    );
    const hash = pensionRequestHash(parsed, constraints);
    const existing = await findPensionBatch(parsed, hash);
    // Lost-response retries remain available even after the daily quota is exhausted.
    if (existing) return { success: existing };
    assertPensionRound(parsed.expectedRound);
    await limitLotteryRequest("generation");
    const numbers = generatePensionNumbers(
      constraints,
      parsed.repeat,
      parsed.isAllGroup,
    );
    return { success: await savePensionBatch(parsed, hash, numbers) };
  } catch (error) {
    return pensionActionError(error, "generation");
  }
}
