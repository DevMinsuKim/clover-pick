import prisma from "@/libs/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.lotto.findFirst({
      orderBy: { draw_number: "desc" },
      select: {
        draw_number: true,
      },
    });

    if (data == null) {
      return new Response("Bad Request!!!!", { status: 400 });
    }

    // await new Promise((resolve) => setTimeout(resolve, 10000));

    return NextResponse.json(data);
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }
}
