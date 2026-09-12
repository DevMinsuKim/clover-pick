import { createHash } from "node:crypto";
import { getPensionCurrentRound } from "@/constants/lotteryRounds";
import prisma from "@/libs/prisma";
import { isPensionGenerationRestricted } from "@/utils/generationRestriction";
import { LotteryInputError } from "./lotteryInputError";
import {
  type PensionConstraints,
  type PensionCreateInput,
  type PensionGeneration,
  pensionOutputSchema,
} from "./pensionContracts";

export function assertPensionRound(expectedRound: number) {
  if (isPensionGenerationRestricted())
    throw new LotteryInputError(
      "추첨 결과를 반영하는 중이에요. 목요일 오후 10시부터 다시 생성할 수 있어요.",
    );
  if (expectedRound !== getPensionCurrentRound())
    throw new LotteryInputError(
      "생성 대상 회차가 바뀌었어요. 화면을 새로고침하고 다시 시도해 주세요.",
    );
}
export function pensionRequestHash(
  input: PensionCreateInput,
  constraints: PensionConstraints,
) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        repeat: input.repeat,
        isAllGroup: input.isAllGroup,
        round: input.expectedRound,
        constraints,
      }),
    )
    .digest("hex");
}
function readBatch(
  batch: { input_hash: string; numbers: unknown; draw_number: number },
  hash: string,
  input: Pick<PensionCreateInput, "repeat" | "isAllGroup">,
): PensionGeneration {
  if (batch.input_hash !== hash)
    throw new LotteryInputError(
      "조건을 다시 확인해 주세요. 화면을 새로고침한 뒤 생성할 수 있어요.",
    );
  return {
    pensionNumbers: pensionOutputSchema(input).parse(batch.numbers),
    round: batch.draw_number,
    isAllGroup: input.isAllGroup,
  };
}
export async function findPensionBatch(
  input: PensionCreateInput,
  hash: string,
): Promise<PensionGeneration | null> {
  const batch = await prisma.pension_generation_batch.findUnique({
    where: { request_id: input.requestId },
  });
  return batch ? readBatch(batch, hash, input) : null;
}
export async function savePensionBatch(
  input: PensionCreateInput,
  hash: string,
  numbers: PensionGeneration["pensionNumbers"],
): Promise<PensionGeneration> {
  const tickets = pensionOutputSchema(input).parse(numbers);
  return prisma.$transaction(async (tx) => {
    assertPensionRound(input.expectedRound);
    const inserted = await tx.$queryRaw<{ request_id: string }[]>`
      INSERT INTO pension_generation_batch (request_id, input_hash, draw_number, numbers)
      VALUES (${input.requestId}::uuid, ${hash}, ${input.expectedRound}, ${JSON.stringify(tickets)}::jsonb)
      ON CONFLICT (request_id) DO NOTHING RETURNING request_id
    `;
    if (!inserted.length) {
      const existing = await tx.pension_generation_batch.findUniqueOrThrow({
        where: { request_id: input.requestId },
      });
      return readBatch(existing, hash, input);
    }
    await tx.created_pension.createMany({
      data: tickets.map((ticket) => ({
        ...ticket,
        draw_number: input.expectedRound,
      })),
    });
    assertPensionRound(input.expectedRound);
    return {
      pensionNumbers: tickets,
      round: input.expectedRound,
      isAllGroup: input.isAllGroup,
    };
  });
}
