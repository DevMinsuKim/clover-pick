import axios from "axios";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const url = process.env.LOTTO_DATA_API_URL;
    if (!url) {
      throw new Error("LOTTO_DATA_API_URL is not defined");
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
        let row_data: string[] = [];
        $(element)
          .find("td")
          .each((idx, td) => {
            let text = $(td).text().trim();
            if (text.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
              text = text.replace(/\./g, "-");
            }
            text = text.replace(/,/g, "").replace(/원/g, "");

            row_data.push(text);
          });
        if (row_data.length === 20) {
          row_data = row_data.slice(1);
        }
        if (row_data.length > 0) {
          rows.push(row_data);
        }
      });

    const data = rows.map((row) => {
      const [
        draw_number_str,
        draw_date_str,
        first_prize_winners_str,
        first_prize_amount_str,
        second_prize_winners_str,
        second_prize_amount_str,
        third_prize_winners_str,
        third_prize_amount_str,
        fourth_prize_winners_str,
        fourth_prize_amount_str,
        fifth_prize_winners_str,
        fifth_prize_amount_str,
        winning_number_1_str,
        winning_number_2_str,
        winning_number_3_str,
        winning_number_4_str,
        winning_number_5_str,
        winning_number_6_str,
        bonus_number_str,
      ] = row;

      return {
        draw_number: parseInt(draw_number_str, 10),
        draw_date: new Date(draw_date_str),
        first_prize_winners: parseInt(first_prize_winners_str, 10),
        first_prize_amount: BigInt(first_prize_amount_str),
        second_prize_winners: parseInt(second_prize_winners_str, 10),
        second_prize_amount: BigInt(second_prize_amount_str),
        third_prize_winners: parseInt(third_prize_winners_str, 10),
        third_prize_amount: BigInt(third_prize_amount_str),
        fourth_prize_winners: parseInt(fourth_prize_winners_str, 10),
        fourth_prize_amount: BigInt(fourth_prize_amount_str),
        fifth_prize_winners: parseInt(fifth_prize_winners_str, 10),
        fifth_prize_amount: BigInt(fifth_prize_amount_str),
        winning_number_1: parseInt(winning_number_1_str, 10),
        winning_number_2: parseInt(winning_number_2_str, 10),
        winning_number_3: parseInt(winning_number_3_str, 10),
        winning_number_4: parseInt(winning_number_4_str, 10),
        winning_number_5: parseInt(winning_number_5_str, 10),
        winning_number_6: parseInt(winning_number_6_str, 10),
        bonus_number: parseInt(bonus_number_str, 10),
      };
    });

    if (data.length > 0) {
      await prisma.lotto.createMany({
        data,
        skipDuplicates: true,
      });
      console.log(`Added new draws to the database, skipping duplicates.`);
    } else {
      console.log("No new draws to add.");
    }

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error("Error processing lotto data:", error);
    return new NextResponse(
      JSON.stringify({ error: "Error processing data" }),
      { status: 500 },
    );
  }
}
