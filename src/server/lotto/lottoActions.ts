"use server";

import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

export async function lottoActions() {
  try {
    const lastDrawNumber = await prisma.lotto.findFirst({
      orderBy: { draw_number: "desc" },
      select: {
        draw_number: true,
      },
    });

    if (lastDrawNumber == null) {
      Sentry.captureMessage("로또 회차 데이터가 존재하지 않습니다.", "error");
      throw new Error("1000");
    }

    return { success: { draw_number: lastDrawNumber.draw_number + 1 } };
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("2000");
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

    const { object: data } = await generateObject({
      model: openai("gpt-4o"),
      system: "You're a lotto number prediction system",
      prompt: `Predict ${repeat} sets of 6 winning numbers from 1 to 45`,
      schema: z.object({
        lottoNumbers: z.array(
          z.object({
            numbers: z.array(z.number().min(1).max(45)).length(6),
          }),
        ),
      }),
    });

    data.lottoNumbers.forEach((obj) => {
      obj.numbers.sort((a, b) => a - b);
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

    const lottoNumbersDB = data.lottoNumbers.map((item) => {
      return {
        draw_number: lastDrawNumber.draw_number + 1,
        number1: item.numbers[0],
        number2: item.numbers[1],
        number3: item.numbers[2],
        number4: item.numbers[3],
        number5: item.numbers[4],
        number6: item.numbers[5],
      };
    });

    await prisma.created_lotto.createMany({
      data: lottoNumbersDB,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: { code: "2000" } }, { status: 500 });
  }
}
