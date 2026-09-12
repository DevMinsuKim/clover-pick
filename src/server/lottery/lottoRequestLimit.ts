import { createHash } from "node:crypto";
import { headers } from "next/headers";
import prisma from "@/libs/prisma";
import { LottoInputError } from "./lottoEngine";

export interface RateBucket {
  key: string;
  limit: number;
  period: "minute" | "day";
  expires: Date;
}

// PostgreSQL serializes each bucket increment, including across server instances.
export async function consumeBuckets(buckets: RateBucket[]) {
  await prisma.$transaction(async (tx) => {
    for (const bucket of buckets) {
      const rows = await tx.$queryRaw<{ count: number }[]>`
        INSERT INTO lottery_request_limit (key, count, expires)
        VALUES (${bucket.key}, 1, ${bucket.expires})
        ON CONFLICT (key) DO UPDATE SET count = lottery_request_limit.count + 1
        WHERE lottery_request_limit.count < ${bucket.limit}
        RETURNING count
      `;
      if (!rows.length)
        throw new LottoInputError(
          bucket.period === "day"
            ? "오늘 이용 가능한 횟수를 모두 사용했어요. 내일 다시 이용해 주세요."
            : "이용 요청이 많아요. 잠시 후 다시 시도해 주세요.",
        );
    }
    await tx.lottery_request_limit.deleteMany({
      where: { expires: { lt: new Date() } },
    });
  });
}

export async function limitLottoRequest(
  kind: "analysis" | "generation" | "quick",
) {
  const requestHeaders = await headers();
  // Vercel overwrites x-vercel-forwarded-for. Other hosts must sanitize their proxy header.
  const forwarded = process.env.VERCEL
    ? requestHeaders.get("x-vercel-forwarded-for")
    : requestHeaders.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim().slice(0, 128) || "shared-anonymous";
  const now = Date.now();
  const seoulOffset = 9 * 60 * 60 * 1000;
  const day = Math.floor((now + seoulOffset) / 86_400_000);
  const minute = Math.floor(now / 60_000);
  const identity = createHash("sha256").update(`${day}:${ip}`).digest("hex");
  const expires = new Date((day + 2) * 86_400_000 - seoulOffset);
  await consumeBuckets([
    {
      key: `${kind}:minute:${minute}:${identity}`,
      limit: kind === "analysis" ? 5 : 30,
      period: "minute",
      expires: new Date((minute + 2) * 60_000),
    },
    {
      key: `${kind}:day:${day}:${identity}`,
      limit: kind === "analysis" ? 30 : 300,
      period: "day",
      expires,
    },
    {
      key: `${kind}:global:${day}`,
      limit: kind === "analysis" ? 300 : 20_000,
      period: "day",
      expires,
    },
  ]);
}
