import { NextResponse } from "next/server";

export async function GET() {
  console.log(process.env.LOTTO_DATA_API_URL);

  return new NextResponse("test!!!!!!!! update@@");
}
