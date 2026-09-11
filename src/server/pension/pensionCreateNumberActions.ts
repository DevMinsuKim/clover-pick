"use server";

import * as Sentry from "@sentry/nextjs";
import { getPensionCurrentRound } from "@/constants/lotteryRounds";
import prisma from "@/libs/prisma";
import { isPensionGenerationRestricted } from "@/utils/generationRestriction";

interface PensionNumber {
  number: string;
}

export async function pensionCreateNumberActions({
  repeat,
  isAllGroup,
}: {
  repeat: number;
  isAllGroup: boolean;
}) {
  try {
    if (isPensionGenerationRestricted()) {
      Sentry.captureMessage("연금복권 번호 생성 시간이 아닙니다.", "warning");
      throw new Error("1102");
    }

    if (repeat > 5) {
      Sentry.captureMessage(
        "연금복권 번호 생성 회차가 5회를 초과했습니다.",
        "error",
      );
      throw new Error("1101");
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

      while (uniqueNumbers.size < repeat) {
        const firstDigit = Math.floor(Math.random() * 5) + 1;
        const remainingDigits = Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0");
        const number = `${firstDigit}${remainingDigits}`;

        uniqueNumbers.add(number);
      }
      pensionNumbers = Array.from(uniqueNumbers).map((number) => ({ number }));
    }

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
