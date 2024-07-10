"use server";

import prisma from "@/libs/prisma";
import { convertToKoreaTime } from "@/utils/convertToKoreaTime";
import * as Sentry from "@sentry/nextjs";

export const getHome = async () => {
  try {
    const lottoCreateCount = await prisma.created_lotto.count();

    const lottoWinningCount = await prisma.winning_lotto.count();

    const pensionCreateCount = await prisma.created_pension.count();

    const pensionWinningCount = await prisma.winning_pension.count();

    const lottoCreateListData = await prisma.created_lotto.findMany({
      orderBy: { id: "desc" },
      take: 7,
      select: {
        draw_number: true,
        number1: true,
        number2: true,
        number3: true,
        number4: true,
        number5: true,
        number6: true,
        created: true,
      },
    });

    const pensionCreateListData = await prisma.created_pension.findMany({
      orderBy: { id: "desc" },
      take: 7,
      select: {
        draw_number: true,
        number: true,
        created: true,
      },
    });

    const lottoCreateList = lottoCreateListData.map((item) => ({
      ...item,
      created: convertToKoreaTime(new Date(item.created)),
    }));

    const pensionCreateList = pensionCreateListData.map((item) => ({
      ...item,
      created: convertToKoreaTime(new Date(item.created)),
    }));

    if (
      lottoCreateCount == null ||
      lottoCreateList == null ||
      pensionCreateCount == null ||
      pensionWinningCount == null ||
      lottoWinningCount == null ||
      pensionCreateList == null
    ) {
      Sentry.captureMessage("데이터 생성 중 오류가 발생했습니다.", "error");
      throw new Error("1000");
    }

    const responseData = {
      lottoCreateCount,
      lottoWinningCount,
      pensionCreateCount,
      pensionWinningCount,
      lottoCreateList,
      pensionCreateList,
    };

    return { success: responseData };
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("2000");
  }
};
