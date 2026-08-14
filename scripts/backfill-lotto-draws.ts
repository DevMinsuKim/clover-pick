import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import prisma from "@/libs/prisma";
import {
  mapLottoDrawJsonToRow,
  type LottoDrawJsonItem,
} from "@/utils/lottoDrawMapper";

const APPLY = process.argv.includes("--apply");
const dataPath = resolve(
  process.cwd(),
  "scripts/data/lotto-draws-1204-1236.json",
);

async function main() {
  const payload = JSON.parse(readFileSync(dataPath, "utf8")) as {
    data: { list: LottoDrawJsonItem[] };
  };
  const rows = payload.data.list.map(mapLottoDrawJsonToRow);
  const drawNumbers = rows.map((row) => row.draw_number);

  const existing = await prisma.lotto.findMany({
    where: { draw_number: { in: drawNumbers } },
    select: { draw_number: true },
  });
  const existingSet = new Set(existing.map((row) => row.draw_number));

  const toInsert = rows.filter((row) => !existingSet.has(row.draw_number));
  const skipped = rows.filter((row) => existingSet.has(row.draw_number));

  console.log(
    APPLY
      ? "모드: APPLY (lotto 테이블에 반영합니다)"
      : "모드: DRY-RUN (출력만 하고 INSERT하지 않습니다. 반영하려면 --apply)",
  );
  console.log(`JSON 회차: ${rows.length}건 (${Math.min(...drawNumbers)}~${Math.max(...drawNumbers)})`);
  console.log(`이미 존재: ${skipped.map((row) => row.draw_number).sort((a, b) => a - b).join(", ") || "없음"}`);
  console.log(`삽입 예정: ${toInsert.length}건`);

  for (const row of toInsert.sort((a, b) => a.draw_number - b.draw_number)) {
    const date = row.draw_date.toISOString().slice(0, 10);
    console.log(
      `${row.draw_number}회 ${date}  ${row.winning_number_1},${row.winning_number_2},${row.winning_number_3},${row.winning_number_4},${row.winning_number_5},${row.winning_number_6} +${row.bonus_number}  1등 ${row.first_prize_winners}명 ${row.first_prize_amount}원`,
    );
  }

  if (APPLY && toInsert.length > 0) {
    await prisma.lotto.createMany({
      data: toInsert,
      skipDuplicates: true,
    });
    console.log("lotto INSERT 완료");
  }

  if (!APPLY) {
    console.log("실제 반영: bun scripts/backfill-lotto-draws.ts --apply");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
