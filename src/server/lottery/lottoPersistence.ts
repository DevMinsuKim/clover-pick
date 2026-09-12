import { createHash } from "node:crypto";
import { getLottoCurrentRound } from "@/constants/lotteryRounds";
import prisma from "@/libs/prisma";
import { isLottoGenerationRestricted } from "@/utils/generationRestriction";
import type {
  LottoConstraints,
  LottoCreateInput,
  LottoGeneration,
} from "./lottoContracts";
import { LottoInputError } from "./lottoEngine";
import { lottoGenerationOutputSchema } from "./numberGenerationSchemas";

export function assertLottoRound(expectedRound: number) {
  if (isLottoGenerationRestricted())
    throw new LottoInputError(
      "추첨 결과를 반영하는 중이에요. 토요일 오후 11시 30분부터 다시 생성할 수 있어요.",
    );
  if (expectedRound !== getLottoCurrentRound())
    throw new LottoInputError(
      "생성 대상 회차가 바뀌었어요. 화면을 새로고침하고 다시 시도해 주세요.",
    );
}

export function lottoRequestHash(
  input: LottoCreateInput,
  constraints: LottoConstraints,
) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        repeat: input.repeat,
        round: input.expectedRound,
        constraints,
      }),
    )
    .digest("hex");
}

export async function findLottoBatch(
  requestId: string,
  hash: string,
  repeat: number,
): Promise<LottoGeneration | null> {
  const batch = await prisma.lotto_generation_batch.findUnique({
    where: { request_id: requestId },
  });
  if (!batch) return null;
  if (batch.input_hash !== hash)
    throw new LottoInputError(
      "조건을 다시 확인해 주세요. 화면을 새로고침한 뒤 생성할 수 있어요.",
    );
  const parsed = lottoGenerationOutputSchema(repeat).parse(batch.numbers);
  return { ...parsed, round: batch.draw_number };
}

export async function saveLottoBatch(
  input: LottoCreateInput,
  hash: string,
  numbers: LottoGeneration["lottoNumbers"],
): Promise<LottoGeneration> {
  return prisma.$transaction(async (tx) => {
    assertLottoRound(input.expectedRound);
    const inserted = await tx.$queryRaw<{ request_id: string }[]>`
      INSERT INTO lotto_generation_batch (request_id, input_hash, draw_number, numbers)
      VALUES (${input.requestId}::uuid, ${hash}, ${input.expectedRound}, ${JSON.stringify({ lottoNumbers: numbers })}::jsonb)
      ON CONFLICT (request_id) DO NOTHING
      RETURNING request_id
    `;
    if (!inserted.length) {
      const existing = await tx.lotto_generation_batch.findUniqueOrThrow({
        where: { request_id: input.requestId },
      });
      if (existing.input_hash !== hash)
        throw new LottoInputError(
          "조건을 다시 확인해 주세요. 화면을 새로고침한 뒤 생성할 수 있어요.",
        );
      return {
        ...lottoGenerationOutputSchema(input.repeat).parse(existing.numbers),
        round: existing.draw_number,
      };
    }
    await tx.created_lotto.createMany({
      data: numbers.map(({ numbers: n }) => ({
        draw_number: input.expectedRound,
        number1: n[0],
        number2: n[1],
        number3: n[2],
        number4: n[3],
        number5: n[4],
        number6: n[5],
      })),
    });
    return { lottoNumbers: numbers, round: input.expectedRound };
  });
}
