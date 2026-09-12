import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { getLottoCurrentRound } from "@/constants/lotteryRounds";
import { emptyLottoConstraints } from "./lottoContracts";

// Opt-in only: never inherit the project's .env production database.
const testUrl = process.env.TEST_DATABASE_URL;
let prisma: typeof import("@/libs/prisma")["default"];
let persistence: typeof import("./lottoPersistence");
let consumeBuckets: typeof import("./lottoRequestLimit")["consumeBuckets"];
const requestIds: string[] = [];
const ratePrefix = `integration:${randomUUID()}`;

describe.skipIf(!testUrl)("격리된 PostgreSQL의 저장·동시성 검증", () => {
  beforeAll(async () => {
    const url = new URL(testUrl ?? "");
    const safeLocal =
      ["localhost", "127.0.0.1"].includes(url.hostname) &&
      url.pathname === "/cloverpick_test";
    if (!safeLocal)
      throw new Error(
        "TEST_DATABASE_URL must point to the isolated local test database",
      );
    vi.stubEnv("POSTGRES_PRISMA_URL", testUrl);
    // Freeze Date only; network and timeout timers remain real.
    vi.setSystemTime(new Date("2026-09-08T10:00:00+09:00"));
    prisma = (await import("@/libs/prisma")).default;
    persistence = await import("./lottoPersistence");
    consumeBuckets = (await import("./lottoRequestLimit")).consumeBuckets;
  });
  afterAll(async () => {
    if (prisma) {
      for (const requestId of requestIds) {
        const batch = await prisma.lotto_generation_batch.findUnique({
          where: { request_id: requestId },
        });
        if (batch) {
          const rows = batch.numbers as {
            lottoNumbers: { numbers: number[] }[];
          };
          await prisma.created_lotto.deleteMany({
            where: {
              draw_number: batch.draw_number,
              OR: rows.lottoNumbers.map(({ numbers: n }) => ({
                number1: n[0],
                number2: n[1],
                number3: n[2],
                number4: n[3],
                number5: n[4],
                number6: n[5],
              })),
            },
          });
        }
      }
      await prisma.lotto_generation_batch.deleteMany({
        where: { request_id: { in: requestIds } },
      });
      await prisma.lottery_request_limit.deleteMany({
        where: { key: { startsWith: ratePrefix } },
      });
      await prisma.$disconnect();
    }
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });
  it("동일 요청을 동시에 저장해도 번호 5세트를 한 번만 적재한다", async () => {
    const requestId = randomUUID();
    requestIds.push(requestId);
    const input = {
      repeat: 5,
      requestId,
      expectedRound: getLottoCurrentRound(),
    };
    const hash = persistence.lottoRequestHash(input, emptyLottoConstraints);
    const numbers = Array.from({ length: 5 }, (_, i) => ({
      numbers: [1, 2, 3, 4, 5, 40 + i],
    }));
    const before = await prisma.created_lotto.count();
    const results = await Promise.all(
      Array.from({ length: 6 }, () =>
        persistence.saveLottoBatch(input, hash, numbers),
      ),
    );
    expect(
      results.every(
        (result) => JSON.stringify(result) === JSON.stringify(results[0]),
      ),
    ).toBe(true);
    expect(await prisma.created_lotto.count()).toBe(before + 5);
    expect(await persistence.findLottoBatch(requestId, hash, 5)).toEqual(
      results[0],
    );
    await expect(
      persistence.findLottoBatch(requestId, "different-hash", 5),
    ).rejects.toThrow("조건을 다시 확인");
  });
  it("번호 저장이 실패하면 요청 기록도 함께 롤백한다", async () => {
    const requestId = randomUUID();
    requestIds.push(requestId);
    await expect(
      persistence.saveLottoBatch(
        { repeat: 1, requestId, expectedRound: getLottoCurrentRound() },
        "invalid-row",
        [{ numbers: [1] }],
      ),
    ).rejects.toThrow();
    expect(
      await prisma.lotto_generation_batch.findUnique({
        where: { request_id: requestId },
      }),
    ).toBeNull();
  });
  it("확인했던 회차가 바뀌면 저장하지 않는다", async () => {
    const requestId = randomUUID();
    requestIds.push(requestId);
    await expect(
      persistence.saveLottoBatch(
        { repeat: 1, requestId, expectedRound: getLottoCurrentRound() - 1 },
        "old-round",
        [{ numbers: [1, 2, 3, 4, 5, 6] }],
      ),
    ).rejects.toThrow("회차가 바뀌었어요");
    expect(
      await prisma.lotto_generation_batch.findUnique({
        where: { request_id: requestId },
      }),
    ).toBeNull();
  });
  it("동시 요청에서도 제한을 넘기지 않고 후속 버킷 실패 시 앞선 증가를 롤백한다", async () => {
    const bucket = {
      key: `${ratePrefix}:concurrent`,
      limit: 3,
      period: "minute" as const,
      expires: new Date("2026-09-20"),
    };
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () => consumeBuckets([bucket])),
    );
    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(3);
    expect(
      (
        await prisma.lottery_request_limit.findUnique({
          where: { key: bucket.key },
        })
      )?.count,
    ).toBe(3);
    const first = { ...bucket, key: `${ratePrefix}:rollback` };
    await expect(consumeBuckets([first, bucket])).rejects.toThrow(
      "이용 요청이 많아요",
    );
    expect(
      await prisma.lottery_request_limit.findUnique({
        where: { key: first.key },
      }),
    ).toBeNull();
  });
  it("하루 한도를 소진하면 잠시 후가 아닌 다음 날 이용을 안내한다", async () => {
    const daily = {
      key: `${ratePrefix}:daily`,
      limit: 1,
      period: "day" as const,
      expires: new Date("2026-09-20"),
    };
    await consumeBuckets([daily]);
    await expect(consumeBuckets([daily])).rejects.toThrow(
      "내일 다시 이용해 주세요",
    );
    expect(
      (
        await prisma.lottery_request_limit.findUniqueOrThrow({
          where: { key: daily.key },
        })
      ).count,
    ).toBe(1);
  });
  it("목록은 6개씩 조회하고 신규 등록 중에도 다음 페이지가 밀리지 않는다", async () => {
    const { getLottoRecords } = await import("./lottoRecords");
    const ids: number[] = [];
    const row = {
      draw_number: 1_999_000_000,
      number1: 1,
      number2: 2,
      number3: 3,
      number4: 4,
      number5: 5,
      number6: 6,
    };
    try {
      const fixtures = await prisma.created_lotto.createManyAndReturn({
        data: Array.from({ length: 7 }, () => row),
        select: { id: true },
      });
      ids.push(...fixtures.map((item) => item.id));
      const first = await getLottoRecords("history");
      expect(first.items.map((item) => item.id)).toEqual(
        [...ids].reverse().slice(0, 6),
      );
      const extra = await prisma.created_lotto.create({
        data: row,
        select: { id: true },
      });
      ids.push(extra.id);
      const second = await getLottoRecords("history", {
        page: 2,
        snapshotId: first.snapshotId,
      });
      expect(second.totalCount).toBe(first.totalCount);
      expect(second.items[0].id).toBe(fixtures[0].id);
      expect(
        second.items.some((item) =>
          first.items.some((old) => item.id === old.id),
        ),
      ).toBe(false);
      expect((await getLottoRecords("history")).items[0].id).toBe(extra.id);
      const last = await getLottoRecords("history", {
        page: 2_147_483_647,
        snapshotId: first.snapshotId,
      });
      expect(last.page).toBe(last.totalPages);
      expect(last.items.length).toBeGreaterThan(0);
      expect(last.items.length).toBeLessThanOrEqual(6);
      expect(await getLottoRecords("history", { snapshotId: 0 })).toMatchObject(
        { items: [], page: 1, totalPages: 1, totalCount: 0 },
      );
      await expect(getLottoRecords("history", { page: -1 })).rejects.toThrow();
      await expect(getLottoRecords("history", { page: 1.5 })).rejects.toThrow();
    } finally {
      await prisma.created_lotto.deleteMany({ where: { id: { in: ids } } });
    }
  });
  it("당첨 내역은 추첨일을 연결하고 회차 누락 시 생성일로 대체하지 않는다", async () => {
    const { getLottoRecords } = await import("./lottoRecords");
    const round = 1_999_000_001;
    const ids: number[] = [];
    let drawInserted = false;
    try {
      await prisma.lotto.create({
        data: {
          draw_number: round,
          draw_date: new Date("2030-03-09T00:00:00Z"),
          first_prize_winners: 0,
          first_prize_amount: 0n,
          second_prize_winners: 0,
          second_prize_amount: 0n,
          third_prize_winners: 0,
          third_prize_amount: 0n,
          fourth_prize_winners: 0,
          fourth_prize_amount: 0n,
          fifth_prize_winners: 0,
          fifth_prize_amount: 0n,
          winning_number_1: 1,
          winning_number_2: 2,
          winning_number_3: 3,
          winning_number_4: 4,
          winning_number_5: 5,
          winning_number_6: 6,
          bonus_number: 7,
        },
      });
      drawInserted = true;
      const generatedAt = new Date("2020-01-01T01:02:03Z");
      for (const draw_number of [round, round - 1]) {
        const row = await prisma.winning_lotto.create({
          data: {
            draw_number,
            ranking: 5,
            winning_number1: 1,
            winning_number2: 2,
            winning_number3: 3,
            winning_number4: 4,
            winning_number5: 5,
            winning_number6: 6,
            winning_created: generatedAt,
          },
          select: { id: true },
        });
        ids.push(row.id);
      }
      const result = await getLottoRecords("winning");
      expect(result.items[0]).toMatchObject({
        id: ids[0],
        round,
        drawDate: "2030-03-09",
        generatedAt: generatedAt.toISOString(),
      });
      expect(result.items[1]).toMatchObject({
        id: ids[1],
        drawDate: null,
        generatedAt: generatedAt.toISOString(),
      });
      expect(
        (
          await prisma.winning_lotto.findUniqueOrThrow({
            where: { id: ids[0] },
          })
        ).winning_created,
      ).toEqual(generatedAt);
    } finally {
      await prisma.winning_lotto.deleteMany({ where: { id: { in: ids } } });
      if (drawInserted)
        await prisma.lotto.delete({ where: { draw_number: round } });
    }
  });
});
