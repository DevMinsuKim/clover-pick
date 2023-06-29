import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(request: Request) {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const [page] = await browser.pages();
    // const page = await context.newPage();
    await page.goto(
      "https://el.dhlottery.co.kr/game/TotalGame.jsp?LottoId=LO40"
    );

    return new Response("test!!");
  } catch (error) {
    console.error(error);
  }
}
