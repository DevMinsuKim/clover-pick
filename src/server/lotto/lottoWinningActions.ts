"use server";

import prisma from "@/libs/prisma";
import { convertToKoreaTime } from "@/utils/convertToKoreaTime";
import * as Sentry from "@sentry/nextjs";

export async function lottoWinningActions() {
  try {
    const winningNumbers = await prisma.winning_lotto.findMany({
      orderBy: { id: "desc" },
      take: 18,
      select: {
        draw_number: true,
        ranking: true,
        winning_number1: true,
        winning_number2: true,
        winning_number3: true,
        winning_number4: true,
        winning_number5: true,
        winning_number6: true,
        winning_created: true,
      },
    });

    const lottoWinningList = winningNumbers.map((lotto) => ({
      ...lotto,
      winning_created: convertToKoreaTime(new Date(lotto.winning_created)),
    }));

    if (lottoWinningList == null) {
      Sentry.captureMessage(
        "로또 번호 당첨 내역 데이터가 존재하지 않습니다.",
        "error",
      );
      throw new Error("1000");
    }

    return { success: lottoWinningList };
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("2000");
  }
}
