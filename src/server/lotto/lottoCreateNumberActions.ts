"use server";

import { openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
import { generateText, Output } from "ai";
import { getLottoCurrentRound } from "@/constants/lotteryRounds";
import prisma from "@/libs/prisma";
import {
  type LottoGenerationInput,
  lottoGenerationInputSchema,
  lottoGenerationOutputSchema,
} from "@/server/lottery/numberGenerationSchemas";
import { isLottoGenerationRestricted } from "@/utils/generationRestriction";

export async function lottoCreateNumberActions(input: LottoGenerationInput) {
  try {
    const { repeat } = lottoGenerationInputSchema.parse(input);
    if (isLottoGenerationRestricted()) {
      Sentry.captureMessage("로또 번호 생성 시간이 아닙니다.", "warning");
      throw new Error("1102");
    }

    const { output: data } = await generateText({
      model: openai.chat("gpt-4o"),
      instructions:
        "Generate lottery number combinations, without predicting winning numbers.",
      prompt: `Generate exactly ${repeat} distinct combinations. Each combination must contain 6 distinct integers from 1 to 45. Do not repeat a combination in a different order.`,
      output: Output.object({
        schema: lottoGenerationOutputSchema(repeat),
      }),
    });

    data.lottoNumbers.forEach((obj) => {
      obj.numbers.sort((a, b) => a - b);
    });

    const currentRound = getLottoCurrentRound();

    const lottoNumbersDB = data.lottoNumbers.map((item) => {
      return {
        draw_number: currentRound,
        number1: item.numbers[0],
        number2: item.numbers[1],
        number3: item.numbers[2],
        number4: item.numbers[3],
        number5: item.numbers[4],
        number6: item.numbers[5],
      };
    });

    await prisma.created_lotto.createMany({
      data: lottoNumbersDB,
    });

    return { success: data };
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("2000");
  }
}
