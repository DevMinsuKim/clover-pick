export const dynamic = "force-dynamic";

import axios from "axios";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getLottoLastCompletedRound } from "@/constants/lotteryRounds";
import prisma from "@/libs/prisma";
import { assertExpectedDrawRound } from "@/utils/assertExpectedDrawRound";
import {
  mapLottoDrawJsonToRow,
  type LottoDrawJsonItem,
} from "@/utils/lottoDrawMapper";
import { getLottoRanking } from "@/utils/lottoRanking";

interface LottoLatestDrawResponse {
  data?: {
    list?: LottoDrawJsonItem[];
  };
}

export async function GET() {
  try {
    const url = process.env.LOTTO_LATEST_DRAW_URL;
    if (!url) {
      throw new Error("LOTTO_LATEST_DRAW_URL 값이 올바르지 않습니다.");
    }

    const response = await axios.get<LottoLatestDrawResponse>(
      url,
      {
        timeout: 15000,
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      },
    );

    const item = response.data.data?.list?.[0];
    if (!item) {
      throw new Error("로또 당첨 JSON이 비어 있습니다.");
    }

    const latestLotto = mapLottoDrawJsonToRow(item);
    assertExpectedDrawRound(
      latestLotto.draw_number,
      getLottoLastCompletedRound(),
      "로또",
    );

    await prisma.lotto.createMany({
      data: [latestLotto],
      skipDuplicates: true,
    });

    const winningData = [];
    const userLottos = await prisma.created_lotto.findMany({
      orderBy: { id: "desc" },
      where: { draw_number: latestLotto.draw_number },
    });

    for (const userLotto of userLottos) {
      const ranking = getLottoRanking(
        [
          userLotto.number1,
          userLotto.number2,
          userLotto.number3,
          userLotto.number4,
          userLotto.number5,
          userLotto.number6,
        ],
        [
          latestLotto.winning_number_1,
          latestLotto.winning_number_2,
          latestLotto.winning_number_3,
          latestLotto.winning_number_4,
          latestLotto.winning_number_5,
          latestLotto.winning_number_6,
        ],
        latestLotto.bonus_number,
      );

      if (ranking > 0) {
        winningData.push({
          draw_number: latestLotto.draw_number,
          ranking,
          winning_number1: userLotto.number1,
          winning_number2: userLotto.number2,
          winning_number3: userLotto.number3,
          winning_number4: userLotto.number4,
          winning_number5: userLotto.number5,
          winning_number6: userLotto.number6,
          winning_created: userLotto.created,
        });
      }
    }

    if (winningData.length > 0) {
      await prisma.winning_lotto.createMany({
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
