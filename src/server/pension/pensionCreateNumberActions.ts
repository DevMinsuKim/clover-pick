"use server";

import * as Sentry from "@sentry/nextjs";
import { getPensionCurrentRound } from "@/constants/lotteryRounds";
import prisma from "@/libs/prisma";
import {
  type PensionGenerationInput,
  pensionGenerationInputSchema,
  pensionGenerationOutputSchema,
} from "@/server/lottery/numberGenerationSchemas";
import { isPensionGenerationRestricted } from "@/utils/generationRestriction";

interface PensionNumber {
  number: string;
}

export async function pensionCreateNumberActions(
  input: PensionGenerationInput,
) {
  try {
    const { repeat, isAllGroup } = pensionGenerationInputSchema.parse(input);
    if (isPensionGenerationRestricted()) {
      Sentry.captureMessage("연금복권 번호 생성 시간이 아닙니다.", "warning");
      throw new Error("1102");
    }

    let pensionNumbers: PensionNumber[] = [];

    if (isAllGroup) {
      const uniqueNumbers: PensionNumber[] = [];
      const remainingDigits = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0");

      for (let i = 1; i <= 5; i++) {
        const number = `${i}${remainingDigits}`;
        uniqueNumbers.push({ number });
      }
      pensionNumbers = uniqueNumbers;
    } else {
      const uniqueNumbers = new Set<string>();

      // Bound collision retries so a faulty random source cannot stall the request.
      const maxAttempts = 100;
      for (
        let attempt = 0;
        attempt < maxAttempts && uniqueNumbers.size < repeat;
        attempt++
      ) {
        const firstDigit = Math.floor(Math.random() * 5) + 1;
        const remainingDigits = Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0");
        const number = `${firstDigit}${remainingDigits}`;

        uniqueNumbers.add(number);
      }
      pensionNumbers = Array.from(uniqueNumbers).map((number) => ({ number }));
    }

    // A partial set after repeated collisions is an error, not a successful response.
    pensionNumbers = pensionGenerationOutputSchema({
      repeat,
      isAllGroup,
    }).parse(pensionNumbers);

    const currentRound = getPensionCurrentRound();

    const pensionNumbersDB = pensionNumbers.map((item) => ({
      ...item,
      draw_number: currentRound,
      number: String(item.number),
    }));

    await prisma.created_pension.createMany({
      data: pensionNumbersDB,
    });

    return { success: pensionNumbers };
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("2000");
  }
}
