import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // return new NextResponse("test");
  // const lotto = await prisma.created_lotto.findMany();
  return NextResponse.json("test@@@");
}
