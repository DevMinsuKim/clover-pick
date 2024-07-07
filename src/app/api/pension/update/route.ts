export const dynamic = "force-dynamic";

import axios from "axios";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import * as Sentry from "@sentry/nextjs";
import prisma from "@/libs/prisma";
import iconv from "iconv-lite";

export async function GET() {
  try {
    const url = process.env.PENSION_DATA_API_URL;

    if (!url) {
      throw new Error("PENSION_DATA_API_URL 값이 올바르지 않습니다.");
    }

    const response = await axios.get(url, { responseType: "arraybuffer" });
    const decodedData = iconv.decode(Buffer.from(response.data), "EUC-KR");

    const $ = cheerio.load(decodedData);
    $('td[bgcolor="#ccffff"]').remove();
    $("td")
      .filter((_, element) => $(element).text().includes("년도"))
      .remove();

    const table = $('table[border="1"]');
    const rows: string[][] = [];
    table
      .find("tr")
      .slice(1)
      .each((_, row) => {
        const cols = $(row).find("td");
        const rowData: string[] = [];
        cols.each((_, col) => {
          rowData.push($(col).text().trim());
        });
        if (rowData.length === 10) {
          rows.push(rowData);
        }
      });

    const formatDate = (dateStr: string): string => {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${year}-${month}-${day}`;
    };

    const data = rows.map((row) => {
      return {
        draw_number: parseInt(row[0], 10),
        draw_date: new Date(formatDate(row[1])),
        winning_number: row[2].replace("조", ""),
        bonus_number: row[9],
      };
    });

    if (data.length > 0) {
      await prisma.pension.createMany({
        data,
        skipDuplicates: true,
      });
    }

    const latestPension = data[0];

    const winningData = [];
    const userPensions = await prisma.created_pension.findMany({
      orderBy: { id: "desc" },
      where: { draw_number: latestPension.draw_number },
    });

    for (const userPension of userPensions) {
      const userNumber = userPension.number;
      const winningNumber = latestPension.winning_number;
      const bonusNumber = latestPension.bonus_number;

      let ranking = 0;

      if (userNumber === winningNumber) {
        ranking = 1; // 1등
      } else if (userNumber.slice(-6) === winningNumber.slice(-6)) {
        ranking = 2; // 2등
      } else if (userNumber.slice(-5) === winningNumber.slice(-5)) {
        ranking = 3; // 3등
      } else if (userNumber.slice(-4) === winningNumber.slice(-4)) {
        ranking = 4; // 4등
      } else if (userNumber.slice(-3) === winningNumber.slice(-3)) {
        ranking = 5; // 5등
      } else if (userNumber.slice(-2) === winningNumber.slice(-2)) {
        ranking = 6; // 6등
      } else if (userNumber.slice(-1) === winningNumber.slice(-1)) {
        ranking = 7; // 7등
      } else if (userNumber.slice(-6) === bonusNumber.slice(-6)) {
        ranking = 8; // 보너스 등위
      }

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
