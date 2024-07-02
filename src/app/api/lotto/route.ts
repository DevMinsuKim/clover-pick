import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    const data = await prisma.lotto.findFirst({
      orderBy: { draw_number: "desc" },
      select: {
        draw_number: true,
      },
    });

    if (data == null) {
      Sentry.captureMessage("로또 회차 데이터가 존재하지 않습니다.");
      return NextResponse.json({ error: { code: "1000" } }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: { code: "2000" } }, { status: 500 });
  }
}
