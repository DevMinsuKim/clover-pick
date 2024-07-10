"use server";

import prisma from "@/libs/prisma";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

export async function lottoCreateNumberActions({ repeat }: { repeat: number }) {
  try {
    const now = new Date();
    const options = { timeZone: "Asia/Seoul", hour12: false };
    const seoulTime = new Date(now.toLocaleString("en-US", options));

    const day = seoulTime.getDay();
    const hours = seoulTime.getHours();

    if (day === 6 && hours >= 20 && hours < 22) {
      Sentry.captureMessage("로또 번호 생성 시간이 아닙니다.", "warning");
      throw new Error("1102");
    }

    if (repeat > 5) {
      Sentry.captureMessage(
        "로또 번호 생성 회차가 5회를 초과했습니다.",
        "error",
      );
      throw new Error("1101");
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
      throw new Error("1000");
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

    return { success: data };
  } catch (error) {
    Sentry.captureException(error);
    throw new Error("2000");
  }
}
