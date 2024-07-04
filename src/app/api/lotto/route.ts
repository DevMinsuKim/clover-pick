import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    const lastDrawNumber = await prisma.lotto.findFirst({
      orderBy: { draw_number: "desc" },
      select: {
        draw_number: true,
      },
    });

    if (lastDrawNumber == null) {
      Sentry.captureMessage("로또 회차 데이터가 존재하지 않습니다.", "error");
      return Response.json({ error: { code: "1000" } }, { status: 404 });
    }

    return NextResponse.json(
      { draw_number: lastDrawNumber.draw_number + 1 },
      { status: 200 },
    );
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: { code: "2000" } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const now = new Date();
    const options = { timeZone: "Asia/Seoul", hour12: false };
    const seoulTime = new Date(now.toLocaleString("en-US", options));

    const day = seoulTime.getDay();
    const hours = seoulTime.getHours();

    if (day === 6 && hours >= 20 && hours < 22) {
      Sentry.captureMessage("로또 번호 생성 시간이 아닙니다.", "warning");
      return Response.json({ error: { code: "1102" } }, { status: 400 });
    }

    const { repeat } = await req.json();

    if (repeat > 5) {
      Sentry.captureMessage(
        "로또 번호 생성 회차가 5회를 초과했습니다.",
        "error",
      );
      return Response.json({ error: { code: "1101" } }, { status: 400 });
    }

    const { object: lottoNumbers } = await generateObject({
      model: openai("gpt-4o"),
      system:
        "You are a useful secretary designed to analyze lotto numbers and print them out in JSON",
      prompt: `Predict ${repeat} sets of 6 winning numbers from 1 to 45 in JSON format with key 'winning_numbers'`,
      schema: z.object({
        winning_numbers: z.array(
          z.array(z.number().int().min(1).max(45)).length(6),
        ),
      }),
    });

    const lastDrawNumber = await prisma.lotto.findFirst({
      orderBy: { draw_number: "desc" },
      select: {
        draw_number: true,
      },
    });

    if (lastDrawNumber == null) {
      Sentry.captureMessage("로또 회차 데이터가 존재하지 않습니다.", "error");
      return Response.json({ error: { code: "1000" } }, { status: 404 });
    }

    const lottoNumbersDB = lottoNumbers.winning_numbers.map((number) => {
      return {
        draw_number: lastDrawNumber.draw_number + 1,
        winning_number1: number[0],
        winning_number2: number[1],
        winning_number3: number[2],
        winning_number4: number[3],
        winning_number5: number[4],
        winning_number6: number[5],
      };
    });

    await prisma.created_lotto.createMany({
      data: lottoNumbersDB,
    });

    return NextResponse.json(lottoNumbers, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: { code: "2000" } }, { status: 500 });
  }
}
