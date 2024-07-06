import prisma from "@/libs/prisma";
import { convertToKoreaTime } from "@/utils/convertToKoreaTime";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const lottoCreateListData = await prisma.created_lotto.findMany({
      orderBy: { id: "desc" },
      take: 18,
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

    const lottoCreateList = lottoCreateListData.map((item) => ({
      ...item,
      created: convertToKoreaTime(new Date(item.created)),
    }));

    if (lottoCreateList == null) {
      Sentry.captureMessage(
        "로또 번호 생성 내역 데이터가 존재하지 않습니다.",
        "error",
      );
      return Response.json({ error: { code: "1000" } }, { status: 404 });
    }

    return NextResponse.json(lottoCreateList, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: { code: "2000" } }, { status: 500 });
  }
}
