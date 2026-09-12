"use server";

import * as Sentry from "@sentry/nextjs";
import prisma from "@/libs/prisma";

export const getHome = async () => {
  try {
    const [lottoCreateCount, pensionCreateCount] = await Promise.all([
      prisma.created_lotto.count(),
      prisma.created_pension.count(),
    ]);
    return { success: { lottoCreateCount, pensionCreateCount } };
  } catch {
    Sentry.captureMessage("홈 생성 기록 조회 실패", "error");
    throw new Error("생성 기록을 불러오지 못했어요.");
  }
};
