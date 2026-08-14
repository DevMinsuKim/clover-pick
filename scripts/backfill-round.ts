import { getLottoRoundAt, getPensionRoundAt } from "@/constants/lotteryRounds";
import prisma from "@/libs/prisma";

const APPLY = process.argv.includes("--apply");

function formatCreated(date: Date): string {
  return date.toISOString();
}

async function backfillCreatedLotto() {
  const rows = await prisma.created_lotto.findMany({
    orderBy: { id: "asc" },
  });

  const changes = rows
    .map((row) => ({
      id: row.id,
      created: row.created,
      oldRound: row.draw_number,
      newRound: getLottoRoundAt(row.created),
    }))
    .filter((row) => row.oldRound !== row.newRound);

  console.log("\n[created_lotto]");
  if (changes.length === 0) {
    console.log("변경할 레코드가 없습니다.");
  } else {
    for (const row of changes) {
      console.log(
        `id=${row.id}  ${row.oldRound} → ${row.newRound}  created=${formatCreated(row.created)}`,
      );
    }
  }
  console.log(`변경 예정: ${changes.length} / 전체 ${rows.length}`);

  if (APPLY && changes.length > 0) {
    await prisma.$transaction(
      changes.map((row) =>
        prisma.created_lotto.update({
          where: { id: row.id },
          data: { draw_number: row.newRound },
        }),
      ),
    );
    console.log("created_lotto UPDATE 완료");
  }

  return changes.length;
}

async function backfillCreatedPension() {
  const rows = await prisma.created_pension.findMany({
    orderBy: { id: "asc" },
  });

  const changes = rows
    .map((row) => ({
      id: row.id,
      created: row.created,
      oldRound: row.draw_number,
      newRound: getPensionRoundAt(row.created),
    }))
    .filter((row) => row.oldRound !== row.newRound);

  console.log("\n[created_pension]");
  if (changes.length === 0) {
    console.log("변경할 레코드가 없습니다.");
  } else {
    for (const row of changes) {
      console.log(
        `id=${row.id}  ${row.oldRound} → ${row.newRound}  created=${formatCreated(row.created)}`,
      );
    }
  }
  console.log(`변경 예정: ${changes.length} / 전체 ${rows.length}`);

  if (APPLY && changes.length > 0) {
    await prisma.$transaction(
      changes.map((row) =>
        prisma.created_pension.update({
          where: { id: row.id },
          data: { draw_number: row.newRound },
        }),
      ),
    );
    console.log("created_pension UPDATE 완료");
  }

  return changes.length;
}

async function main() {
  console.log(
    APPLY
      ? "모드: APPLY (DB에 반영합니다)"
      : "모드: DRY-RUN (출력만 하고 UPDATE하지 않습니다. 반영하려면 --apply)",
  );

  const lottoChanged = await backfillCreatedLotto();
  const pensionChanged = await backfillCreatedPension();

  console.log(
    `\n합계 변경 예정: ${lottoChanged + pensionChanged}건 (로또 ${lottoChanged}, 연금 ${pensionChanged})`,
  );

  if (!APPLY) {
    console.log("실제 반영: bun scripts/backfill-round.ts --apply");
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
