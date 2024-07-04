import prisma from "@/libs/prisma";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const historyNumbers = await prisma.created_lotto.findMany({
      orderBy: { id: "desc" },
      take: 18,
      select: {
        draw_number: true,
        winning_number1: true,
        winning_number2: true,
        winning_number3: true,
        winning_number4: true,
        winning_number5: true,
        winning_number6: true,
        created: true,
      },
    });

    const koreaTimeOffset = 9 * 60 * 60 * 1000;

    const transformDateToKoreaTime = (date: Date) => {
      const koreaDate = new Date(date.getTime() + koreaTimeOffset);
      return koreaDate.toISOString().replace("Z", "+09:00");
    };

    const transformedData = historyNumbers.map((lotto) => ({
      ...lotto,
      created: transformDateToKoreaTime(new Date(lotto.created)),
    }));

    if (transformedData == null) {
      Sentry.captureMessage(
        "로또 번호 생성 내역 데이터가 존재하지 않습니다.",
        "error",
      );
      return Response.json({ error: { code: "1000" } }, { status: 404 });
    }

    return NextResponse.json(transformedData, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: { code: "2000" } }, { status: 500 });
  }
}
