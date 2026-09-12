import { getLottoLastCompletedRound } from "@/constants/lotteryRounds";
import prisma from "@/libs/prisma";
import type { LottoFrequencySource } from "./lottoContracts";
import { LottoInputError } from "./lottoEngine";

export async function getLottoFrequency(): Promise<LottoFrequencySource> {
  const latestRound = getLottoLastCompletedRound();
  const draws = await prisma.lotto.findMany({
    where: { draw_number: { lte: latestRound } },
    orderBy: { draw_number: "desc" },
    take: 100,
    select: {
      draw_number: true,
      winning_number_1: true,
      winning_number_2: true,
      winning_number_3: true,
      winning_number_4: true,
      winning_number_5: true,
      winning_number_6: true,
    },
  });
  if (
    draws.length !== 100 ||
    draws[0].draw_number !== latestRound ||
    draws.some((draw, i) => draw.draw_number !== latestRound - i)
  ) {
    throw new LottoInputError(
      "최근 당첨 번호를 갱신 중이에요. ‘최근 많이 나온 번호’ 조건을 해제하거나 잠시 후 다시 시도해 주세요.",
    );
  }
  const counts = Array.from({ length: 45 }, (_, i) => ({
    number: i + 1,
    count: 0,
  }));
  for (const draw of draws) {
    for (const number of [
      draw.winning_number_1,
      draw.winning_number_2,
      draw.winning_number_3,
      draw.winning_number_4,
      draw.winning_number_5,
      draw.winning_number_6,
    ])
      counts[number - 1].count++;
  }
  const pool = counts
    .sort((a, b) => b.count - a.count || a.number - b.number)
    .slice(0, 20)
    .map((item) => item.number)
    .sort((a, b) => a - b);
  return {
    fromRound: draws[draws.length - 1].draw_number,
    toRound: latestRound,
    drawCount: draws.length,
    pool,
  };
}
