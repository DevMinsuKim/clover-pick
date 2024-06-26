import axios from "axios";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import * as Sentry from "@sentry/nextjs";
import prisma from "@/lib/prisma";
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
        winning_number: parseInt(row[2].replace("조", ""), 10),
        bonus_number: row[9],
      };
    });

    if (data.length > 0) {
      await prisma.pension.createMany({
        data,
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ message: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ message: false }, { status: 500 });
  }
}
