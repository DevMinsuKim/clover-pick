import prisma from "@/libs/prisma";
import { convertToKoreaTime } from "@/utils/convertToKoreaTime";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const lottoCreateCount = await prisma.created_lotto.count();

    const lottoWinningCount = await prisma.winning_lotto.count();

    const lottoCreateListData = await prisma.created_lotto.findMany({
      orderBy: { id: "desc" },
      take: 5,
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

    const lottoCreateList = lottoCreateListData.map((item) => ({
      ...item,
      created: convertToKoreaTime(new Date(item.created)),
    }));

    if (
      lottoCreateCount == null ||
      lottoCreateList == null ||
      lottoWinningCount == null
    ) {
      Sentry.captureMessage("데이터 생성 중 오류가 발생했습니다.", "error");
      return NextResponse.json({ error: { code: "1000" } }, { status: 404 });
    }

    const responseData = {
      lottoCreateCount,
      lottoWinningCount,
      lottoCreateList,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: { code: "2000" } }, { status: 500 });
  }
}
