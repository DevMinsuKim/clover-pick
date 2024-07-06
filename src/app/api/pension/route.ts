import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    const lastDrawNumber = await prisma.pension.findFirst({
      orderBy: { draw_number: "desc" },
      select: {
        draw_number: true,
      },
    });

    if (lastDrawNumber == null) {
      Sentry.captureMessage(
        "연금복권 회차 데이터가 존재하지 않습니다.",
        "error",
      );
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

    if (day === 4 && hours >= 17 && hours < 24) {
      Sentry.captureMessage("연금복권 번호 생성 시간이 아닙니다.", "warning");
      return Response.json({ error: { code: "1102" } }, { status: 400 });
    }

    const { repeat, isAllGroup } = await req.json();

    if (repeat > 5) {
      Sentry.captureMessage(
        "연금복권 번호 생성 회차가 5회를 초과했습니다.",
        "error",
      );
      return Response.json({ error: { code: "1101" } }, { status: 400 });
    }

    let pensionNumbers;

    if (isAllGroup) {
      console.log("1111");
      const result = await generateObject({
        model: openai("gpt-4o"),
        system: "Generate pension lottery numbers in JSON.",
        prompt: `Generate 5 sets of 7-digit numbers.
  - First digit: 1 to 5 in order
  - Next 6 digits: random numbers between 0 and 9, same for each set
  - Ensure the entire 7-digit number is unique in each set
    `,
        schema: z.object({
          winning_numbers: z.array(
            z
              .string()
              .regex(/^[1-5][0-9]{6}$/)
              .length(7),
          ),
        }),
      });
      pensionNumbers = result.object;
    } else {
      const { object: data } = await generateObject({
        model: openai("gpt-4o"),
        system: "lotto",
        prompt: `${repeat}`,
        schema: z.object({
          data: z.array(
            z.object({
              winning_numbers: z
                .string()
                .describe("Name of a fictional person"),
            }),
          ),
        }),
      });
      console.log(data);
      pensionNumbers = data;
    }

    const lastDrawNumber = await prisma.pension.findFirst({
      orderBy: { draw_number: "desc" },
      select: {
        draw_number: true,
      },
    });

    if (lastDrawNumber == null) {
      Sentry.captureMessage(
        "연금복권 회차 데이터가 존재하지 않습니다.",
        "error",
      );
      return Response.json({ error: { code: "1000" } }, { status: 404 });
    }

    // const pensionNumbersDB = pensionNumbers.winning_numbers.map((number) => {
    //   return {
    //     draw_number: lastDrawNumber.draw_number + 1,
    //     winning_number1: number[0],
    //     winning_number2: number[1],
    //     winning_number3: number[2],
    //     winning_number4: number[3],
    //     winning_number5: number[4],
    //     winning_number6: number[5],
    //   };
    // });

    // console.log(pensionNumbersDB);

    // await prisma.created_pension.createMany({
    //   data: pensionNumbersDB,
    // });

    return NextResponse.json(pensionNumbers, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: { code: "2000" } }, { status: 500 });
  }
}
