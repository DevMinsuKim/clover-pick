export const dynamic = "force-dynamic";

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getPensionLastCompletedRound } from "@/constants/lotteryRounds";
import prisma from "@/libs/prisma";
import { assertExpectedDrawRound } from "@/utils/assertExpectedDrawRound";
import { isAuthorizedCronRequest } from "@/utils/cronAuth";
import {
  mapPensionDrawJsonToLatestRow,
  type PensionDrawJsonItem,
} from "@/utils/pensionDrawMapper";
import { getPensionRanking } from "@/utils/pensionRanking";

interface PensionLatestDrawResponse {
  data?: {
    result?: PensionDrawJsonItem[];
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request.headers.get("authorization"))) {
    return NextResponse.json({ message: false }, { status: 401 });
  }

  try {
    const url = process.env.PENSION_LATEST_DRAW_URL;
    if (!url) {
      throw new Error("PENSION_LATEST_DRAW_URL 값이 올바르지 않습니다.");
    }

    const response = await axios.get<PensionLatestDrawResponse>(
      url,
      {
        timeout: 15000,
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      },
    );

    const items = response.data.data?.result;
    if (!items || items.length === 0) {
      throw new Error("연금복권 당첨 JSON이 비어 있습니다.");
    }

    const latestPension = mapPensionDrawJsonToLatestRow(items);
    assertExpectedDrawRound(
      latestPension.draw_number,
      getPensionLastCompletedRound(),
      "연금복권",
    );

    await prisma.pension.createMany({
      data: [latestPension],
      skipDuplicates: true,
    });

    const winningData = [];
    const userPensions = await prisma.created_pension.findMany({
      orderBy: { id: "desc" },
      where: { draw_number: latestPension.draw_number },
    });

    for (const userPension of userPensions) {
      const ranking = getPensionRanking(
        userPension.number,
        latestPension.winning_number,
        latestPension.bonus_number,
      );

      if (ranking > 0) {
        winningData.push({
          draw_number: latestPension.draw_number,
          ranking,
          winning_number: userPension.number,
          winning_created: userPension.created,
        });
      }
    }

    if (winningData.length > 0) {
      await prisma.winning_pension.createMany({
        data: winningData,
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ message: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ message: false }, { status: 500 });
  }
}
