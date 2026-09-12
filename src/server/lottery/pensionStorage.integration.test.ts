import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { getPensionCurrentRound } from "@/constants/lotteryRounds";
import { emptyPensionConstraints } from "./pensionContracts";

const testUrl = process.env.TEST_DATABASE_URL;
let prisma: typeof import("@/libs/prisma")["default"];
let persistence: typeof import("./pensionPersistence");
const requests: string[] = [];
const ids: number[] = [];
const marker = new Date("2026-09-08T02:03:04.567Z");
const round = 1_999_000_002;

describe.skipIf(!testUrl)("격리된 PostgreSQL의 연금복권 저장·조회", () => {
  beforeAll(async () => {
    const url = new URL(testUrl ?? "");
    if (
      !["localhost", "127.0.0.1"].includes(url.hostname) ||
      url.pathname !== "/cloverpick_test"
    )
      throw new Error("Only isolated local test database is allowed");
    vi.stubEnv("POSTGRES_PRISMA_URL", testUrl);
    vi.setSystemTime(new Date("2026-09-08T10:00:00+09:00"));
    prisma = (await import("@/libs/prisma")).default;
    persistence = await import("./pensionPersistence");
  });
  afterAll(async () => {
    if (prisma) {
      await prisma.created_pension.deleteMany({ where: { id: { in: ids } } });
      await prisma.pension_generation_batch.deleteMany({
        where: { request_id: { in: requests } },
      });
      await prisma.winning_pension.deleteMany({
        where: { winning_created: marker },
      });
      await prisma.pension.deleteMany({ where: { draw_number: round } });
      await prisma.$disconnect();
    }
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });
  it("동시 요청 6개에도 모든 조 5개는 한 번만 저장하고 같은 결과를 반환한다", async () => {
    const requestId = randomUUID();
    requests.push(requestId);
    const input = {
      requestId,
      repeat: 5,
      isAllGroup: true,
      expectedRound: getPensionCurrentRound(),
    };
    const hash = persistence.pensionRequestHash(input, emptyPensionConstraints);
    const numbers = [1, 2, 3, 4, 5].map((n) => ({ number: `${n}000007` }));
    const oldIds = new Set(
      (await prisma.created_pension.findMany({ select: { id: true } })).map(
        (r) => r.id,
      ),
    );
    const results = await Promise.all(
      Array.from({ length: 6 }, () =>
        persistence.savePensionBatch(input, hash, numbers),
      ),
    );
    const newRows = (
      await prisma.created_pension.findMany({ select: { id: true } })
    ).filter((r) => !oldIds.has(r.id));
    ids.push(...newRows.map((r) => r.id));
    expect(newRows).toHaveLength(5);
    expect(
      results.every((r) => JSON.stringify(r) === JSON.stringify(results[0])),
    ).toBe(true);
    expect(await persistence.findPensionBatch(input, hash)).toEqual(results[0]);
    await expect(
      persistence.findPensionBatch(input, "wrong-hash"),
    ).rejects.toThrow("조건을 다시 확인");
  });
  it("같은 요청 ID에 다른 조건이 동시에 들어오면 하나만 성공한다", async () => {
    const requestId = randomUUID();
    requests.push(requestId);
    const input = {
      requestId,
      repeat: 1,
      isAllGroup: false,
      expectedRound: getPensionCurrentRound(),
    };
    const oldIds = new Set(
      (await prisma.created_pension.findMany({ select: { id: true } })).map(
        (r) => r.id,
      ),
    );
    const results = await Promise.allSettled([
      persistence.savePensionBatch(input, "a", [{ number: "1123456" }]),
      persistence.savePensionBatch(input, "b", [{ number: "2654321" }]),
    ]);
    const newRows = (
      await prisma.created_pension.findMany({ select: { id: true } })
    ).filter((r) => !oldIds.has(r.id));
    ids.push(...newRows.map((r) => r.id));
    expect(newRows).toHaveLength(1);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  });
  it("DB에서 번호 삽입이 실패하면 요청 기록까지 롤백한다", async () => {
    const requestId = randomUUID();
    requests.push(requestId);
    // A temporary trigger affects only this exact test ticket in the isolated local DB.
    try {
      await prisma.$executeRawUnsafe(
        `CREATE FUNCTION pension_test_reject() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.number='5999988' THEN RAISE EXCEPTION 'test insertion failure'; END IF; RETURN NEW; END $$`,
      );
      await prisma.$executeRawUnsafe(
        `CREATE TRIGGER pension_test_reject BEFORE INSERT ON created_pension FOR EACH ROW EXECUTE FUNCTION pension_test_reject()`,
      );
      await expect(
        persistence.savePensionBatch(
          {
            requestId,
            repeat: 1,
            isAllGroup: false,
            expectedRound: getPensionCurrentRound(),
          },
          "rollback",
          [{ number: "5999988" }],
        ),
      ).rejects.toThrow();
      expect(
        await prisma.pension_generation_batch.findUnique({
          where: { request_id: requestId },
        }),
      ).toBeNull();
    } finally {
      await prisma.$executeRawUnsafe(
        "DROP TRIGGER IF EXISTS pension_test_reject ON created_pension",
      );
      await prisma.$executeRawUnsafe(
        "DROP FUNCTION IF EXISTS pension_test_reject()",
      );
    }
  });
  it("추첨 제한 시간과 회차 변경 후에는 신규 저장하지 않는다", async () => {
    const requestId = randomUUID();
    requests.push(requestId);
    const input = {
      requestId,
      repeat: 1,
      isAllGroup: false,
      expectedRound: getPensionCurrentRound() - 1,
    };
    await expect(
      persistence.savePensionBatch(input, "old", [{ number: "1000007" }]),
    ).rejects.toThrow("회차가 바뀌었어요");
    vi.setSystemTime(new Date("2026-09-10T17:00:00+09:00"));
    try {
      await expect(
        persistence.savePensionBatch(
          { ...input, expectedRound: getPensionCurrentRound() },
          "blocked",
          [{ number: "1000007" }],
        ),
      ).rejects.toThrow("오후 10시");
    } finally {
      vi.setSystemTime(new Date("2026-09-08T10:00:00+09:00"));
    }
    expect(
      await prisma.pension_generation_batch.findUnique({
        where: { request_id: requestId },
      }),
    ).toBeNull();
  });
  it("6개씩 조회하며 새 번호가 등록되어도 페이지가 밀리지 않고 빈 결과·끝 페이지를 처리한다", async () => {
    const { getPensionRecords } = await import("./pensionRecords");
    const rows = await prisma.created_pension.createManyAndReturn({
      data: Array.from({ length: 7 }, (_, i) => ({
        draw_number: round,
        number: `100000${i}`,
      })),
      select: { id: true },
    });
    ids.push(...rows.map((r) => r.id));
    const first = await getPensionRecords("history");
    expect(first.items.map((r) => r.id)).toEqual(
      rows
        .map((r) => r.id)
        .reverse()
        .slice(0, 6),
    );
    const extra = await prisma.created_pension.create({
      data: { draw_number: round, number: "2000000" },
    });
    ids.push(extra.id);
    const second = await getPensionRecords("history", {
      page: 2,
      snapshotId: first.snapshotId,
    });
    expect(second.totalCount).toBe(first.totalCount);
    expect(second.items[0].id).toBe(rows[0].id);
    expect(first.items[0].numbers.join("")).toBe("1000006");
    const last = await getPensionRecords("history", { page: 2_147_483_647 });
    expect(last.page).toBe(last.totalPages);
    expect(await getPensionRecords("history", { snapshotId: 0 })).toMatchObject(
      { items: [], totalCount: 0, page: 1 },
    );
    await expect(getPensionRecords("history", { page: 0 })).rejects.toThrow();
  });
  it("보너스 등수와 실제 추첨일을 연결하며 생성일로 대체하지 않는다", async () => {
    const { getPensionRecords } = await import("./pensionRecords");
    await prisma.pension.create({
      data: {
        draw_number: round,
        draw_date: new Date("2030-03-07T00:00:00Z"),
        winning_number: "3123456",
        bonus_number: "000007",
      },
    });
    await prisma.winning_pension.createMany({
      data: [round, round - 1].map((draw_number) => ({
        draw_number,
        ranking: 8,
        winning_number: "1000007",
        winning_created: marker,
      })),
    });
    const result = await getPensionRecords("winning");
    expect(result.items[0]).toMatchObject({
      round,
      ranking: 8,
      numbers: [1, 0, 0, 0, 0, 0, 7],
      drawDate: "2030-03-07",
      generatedAt: marker.toISOString(),
    });
    expect(result.items[1].drawDate).toBeNull();
  });
});
