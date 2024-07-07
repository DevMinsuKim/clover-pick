export const dynamic = "force-dynamic";

import axios from "axios";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import * as Sentry from "@sentry/nextjs";
import iconv from "iconv-lite";
import prisma from "@/libs/prisma";

export async function GET() {
  try {
    const url = process.env.LOTTO_DATA_API_URL;

    if (!url) {
      throw new Error("LOTTO_DATA_API_URL 값이 올바르지 않습니다.");
    }

    const response = await axios.get(url, { responseType: "arraybuffer" });

    const decodedData = iconv.decode(Buffer.from(response.data), "EUC-KR");

    const $ = cheerio.load(decodedData);

    const table = $('table[border="1"]');
    const rows: string[][] = [];
    table
      .find("tr")
      .slice(2)
      .each((index, element) => {
        let rowData: string[] = [];
        $(element)
          .find("td")
          .each((idx, td) => {
            let text = $(td).text().trim();
            if (text.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
              text = text.replace(/\./g, "-");
            }
            text = text.replace(/,/g, "").replace(/원/g, "");

            rowData.push(text);
          });
        if (rowData.length === 20) {
          rowData = rowData.slice(1);
        }
        if (rowData.length > 0) {
          rows.push(rowData);
        }
      });

    const data = rows.map((row) => {
      return {
        draw_number: parseInt(row[0], 10),
        draw_date: new Date(row[1]),
        first_prize_winners: parseInt(row[2], 10),
        first_prize_amount: BigInt(row[3]),
        second_prize_winners: parseInt(row[4], 10),
        second_prize_amount: BigInt(row[5]),
        third_prize_winners: parseInt(row[6], 10),
        third_prize_amount: BigInt(row[7]),
        fourth_prize_winners: parseInt(row[8], 10),
        fourth_prize_amount: BigInt(row[9]),
        fifth_prize_winners: parseInt(row[10], 10),
        fifth_prize_amount: BigInt(row[11]),
        winning_number_1: parseInt(row[12], 10),
        winning_number_2: parseInt(row[13], 10),
        winning_number_3: parseInt(row[14], 10),
        winning_number_4: parseInt(row[15], 10),
        winning_number_5: parseInt(row[16], 10),
        winning_number_6: parseInt(row[17], 10),
        bonus_number: parseInt(row[18], 10),
      };
    });

    if (data.length > 0) {
      await prisma.lotto.createMany({
        data,
        skipDuplicates: true,
      });
    }

    const latestLotto = data[0];

    const winningData = [];
    const userLottos = await prisma.created_lotto.findMany({
      orderBy: { id: "desc" },
      where: { draw_number: latestLotto.draw_number },
    });

    for (const userLotto of userLottos) {
      const userNumbers = [
        userLotto.number1,
        userLotto.number2,
        userLotto.number3,
        userLotto.number4,
        userLotto.number5,
        userLotto.number6,
      ];

      const winningNumbers = [
        latestLotto.winning_number_1,
        latestLotto.winning_number_2,
        latestLotto.winning_number_3,
        latestLotto.winning_number_4,
        latestLotto.winning_number_5,
        latestLotto.winning_number_6,
      ];

      const bonusNumber = latestLotto.bonus_number;

      const matchCount = userNumbers.filter((num) =>
        winningNumbers.includes(num),
      ).length;

      let ranking = 0;

      if (matchCount === 6) {
        ranking = 1; // 1등: 6개 번호 일치
      } else if (matchCount === 5 && userNumbers.includes(bonusNumber)) {
        ranking = 2; // 2등: 5개 번호 일치 + 보너스 번호 일치
      } else if (matchCount === 5) {
        ranking = 3; // 3등: 5개 번호 일치
      } else if (matchCount === 4) {
        ranking = 4; // 4등: 4개 번호 일치
      } else if (matchCount === 3) {
        ranking = 5; // 5등: 3개 번호 일치
      }

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
