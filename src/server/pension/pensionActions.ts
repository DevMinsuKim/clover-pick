"use server";

import prisma from "@/libs/prisma";
import * as Sentry from "@sentry/nextjs";

export async function pensionActions() {
  try {
    const lastDrawNumber = await prisma.pension.findFirst({
      orderBy: { draw_number: "desc" },
      select: {
        draw_number: true,
      },
    });

    if (lastDrawNumber == null) {
      Sentry.captureMessage(
        "연금복권 회차 데이터가 존재하지 않습니다.",
        "error",
      );
      throw new Error("1000");
    }

    return { success: { draw_number: lastDrawNumber.draw_number + 1 } };
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("2000");
  }
}
