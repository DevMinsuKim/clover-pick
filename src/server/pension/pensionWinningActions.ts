"use server";

import prisma from "@/libs/prisma";
import { convertToKoreaTime } from "@/utils/convertToKoreaTime";
import * as Sentry from "@sentry/nextjs";

export async function pensionWinningActions() {
  try {
    const pensionCreateListData = await prisma.winning_pension.findMany({
      orderBy: { id: "desc" },
      take: 18,
      select: {
        draw_number: true,
        ranking: true,
        winning_number: true,
        winning_created: true,
      },
    });

    const pensionCreateList = pensionCreateListData.map((item) => ({
      ...item,
      winning_created: convertToKoreaTime(new Date(item.winning_created)),
    }));

    if (pensionCreateList == null) {
      Sentry.captureMessage(
        "연금복권 번호 생성 내역 데이터가 존재하지 않습니다.",
        "error",
      );
      throw new Error("1000");
    }

    return { success: pensionCreateList };
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("2000");
  }
}
