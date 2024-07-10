"use server";

import prisma from "@/libs/prisma";
import { convertToKoreaTime } from "@/utils/convertToKoreaTime";
import * as Sentry from "@sentry/nextjs";

export async function pensionHistoryActions() {
  try {
    const pensionCreateListData = await prisma.created_pension.findMany({
      orderBy: { id: "desc" },
      take: 18,
      select: {
        draw_number: true,
        number: true,
        created: true,
      },
    });

    const pensionCreateList = pensionCreateListData.map((item) => ({
      ...item,
      created: convertToKoreaTime(new Date(item.created)),
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
