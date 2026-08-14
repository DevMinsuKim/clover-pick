import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import prisma from "@/libs/prisma";
import {
  mapPensionDrawJsonToRows,
  type PensionDrawJsonItem,
} from "@/utils/pensionDrawMapper";

const APPLY = process.argv.includes("--apply");
const dataPath = resolve(
  process.cwd(),
  "scripts/data/pension-draws-295-328.json",
);

async function main() {
  const payload = JSON.parse(readFileSync(dataPath, "utf8")) as {
    data: { result: PensionDrawJsonItem[] };
  };
  const rows = mapPensionDrawJsonToRows(payload.data.result);
  const drawNumbers = rows.map((row) => row.draw_number);

  const existing = await prisma.pension.findMany({
    where: { draw_number: { in: drawNumbers } },
    select: { draw_number: true },
  });
  const existingSet = new Set(existing.map((row) => row.draw_number));

  const toInsert = rows.filter((row) => !existingSet.has(row.draw_number));
  const skipped = rows.filter((row) => existingSet.has(row.draw_number));

  console.log(
    APPLY
      ? "모드: APPLY (pension 테이블에 반영합니다)"
      : "모드: DRY-RUN (출력만 하고 INSERT하지 않습니다. 반영하려면 --apply)",
  );
  console.log(
    `JSON 회차: ${rows.length}건 (${Math.min(...drawNumbers)}~${Math.max(...drawNumbers)})`,
  );
  console.log(
    `이미 존재: ${skipped.map((row) => row.draw_number).sort((a, b) => a - b).join(", ") || "없음"}`,
  );
  console.log(`삽입 예정: ${toInsert.length}건`);

  for (const row of toInsert) {
    const date = row.draw_date.toISOString().slice(0, 10);
    console.log(
      `${row.draw_number}회 ${date}  ${row.winning_number[0]}조 ${row.winning_number.slice(1)}  보너스 ${row.bonus_number}`,
    );
  }

  if (APPLY && toInsert.length > 0) {
    await prisma.pension.createMany({
      data: toInsert,
      skipDuplicates: true,
    });
    console.log("pension INSERT 완료");
  }

  if (!APPLY) {
    console.log("실제 반영: bun scripts/backfill-pension-draws.ts --apply");
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
