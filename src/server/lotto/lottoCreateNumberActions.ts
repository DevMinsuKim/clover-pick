"use server";

import { lottoActionError } from "@/server/lottery/lottoActionError";
import {
  emptyLottoConstraints,
  type LottoActionResult,
  type LottoCreateInput,
  type LottoGeneration,
  lottoCreateInputSchema,
} from "@/server/lottery/lottoContracts";
import {
  generateLottoNumbers,
  normalizeLottoConstraints,
} from "@/server/lottery/lottoEngine";
import { getLottoFrequency } from "@/server/lottery/lottoFrequency";
import {
  assertLottoRound,
  findLottoBatch,
  lottoRequestHash,
  saveLottoBatch,
} from "@/server/lottery/lottoPersistence";
import { limitLottoRequest } from "@/server/lottery/lottoRequestLimit";

export async function lottoCreateNumberActions(
  input: LottoCreateInput,
): Promise<LottoActionResult<LottoGeneration>> {
  try {
    const parsed = lottoCreateInputSchema.parse(input);
    const constraints = normalizeLottoConstraints(
      parsed.constraints ?? emptyLottoConstraints,
    );
    const hash = lottoRequestHash(parsed, constraints);
    const existing = await findLottoBatch(
      parsed.requestId,
      hash,
      parsed.repeat,
    );
    // A retry after a lost response returns its saved result without spending quota again.
    if (existing) return { success: existing };
    assertLottoRound(parsed.expectedRound);
    await limitLottoRequest("generation");
    const frequency = constraints.frequent ? await getLottoFrequency() : null;
    const numbers = generateLottoNumbers(
      constraints,
      parsed.repeat,
      frequency?.pool,
    );
    return { success: await saveLottoBatch(parsed, hash, numbers) };
  } catch (error) {
    return lottoActionError(error, "generation");
  }
}
