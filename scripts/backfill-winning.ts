import { getLottoRoundAt, getPensionRoundAt } from "@/constants/lotteryRounds";
import prisma from "@/libs/prisma";
import { getLottoRanking } from "@/utils/lottoRanking";
import { getPensionRanking } from "@/utils/pensionRanking";

const APPLY = process.argv.includes("--apply");

type WinningAction = "insert" | "update" | "delete" | "skip-undrawn";

function formatRank(ranking: number): string {
  return ranking === 0 ? "낙첨" : `${ranking}등`;
}

async function backfillWinningLotto() {
  const [createdRows, draws, winningRows] = await Promise.all([
    prisma.created_lotto.findMany({ orderBy: { id: "asc" } }),
    prisma.lotto.findMany(),
    prisma.winning_lotto.findMany(),
  ]);

  const drawByRound = new Map(draws.map((draw) => [draw.draw_number, draw]));

  const plans: {
    action: WinningAction;
    createdId: number;
    oldRound: number;
    newRound: number;
    oldRanking: number | null;
    newRanking: number | null;
    winningId?: number;
  }[] = [];

  for (const row of createdRows) {
    const newRound = getLottoRoundAt(row.created);
    const draw = drawByRound.get(newRound);
    const existing = winningRows.find(
      (winning) =>
        winning.winning_created.getTime() === row.created.getTime() &&
        winning.winning_number1 === row.number1 &&
        winning.winning_number2 === row.number2 &&
        winning.winning_number3 === row.number3 &&
        winning.winning_number4 === row.number4 &&
        winning.winning_number5 === row.number5 &&
        winning.winning_number6 === row.number6,
    );

    if (!draw) {
      if (existing) {
        plans.push({
          action: "skip-undrawn",
          createdId: row.id,
          oldRound: existing.draw_number,
          newRound,
          oldRanking: existing.ranking,
          newRanking: null,
          winningId: existing.id,
        });
      }
      continue;
    }

    const newRanking = getLottoRanking(
      [
        row.number1,
        row.number2,
        row.number3,
        row.number4,
        row.number5,
        row.number6,
      ],
      [
        draw.winning_number_1,
        draw.winning_number_2,
        draw.winning_number_3,
        draw.winning_number_4,
        draw.winning_number_5,
        draw.winning_number_6,
      ],
      draw.bonus_number,
    );

    if (newRanking === 0) {
      if (existing) {
        plans.push({
          action: "delete",
          createdId: row.id,
          oldRound: existing.draw_number,
          newRound,
          oldRanking: existing.ranking,
          newRanking: 0,
          winningId: existing.id,
        });
      }
      continue;
    }

    if (!existing) {
      plans.push({
        action: "insert",
        createdId: row.id,
        oldRound: row.draw_number,
        newRound,
        oldRanking: null,
        newRanking,
      });
      continue;
    }

    if (
      existing.draw_number !== newRound ||
      existing.ranking !== newRanking
    ) {
      plans.push({
        action: "update",
        createdId: row.id,
        oldRound: existing.draw_number,
        newRound,
        oldRanking: existing.ranking,
        newRanking,
        winningId: existing.id,
      });
    }
  }

  console.log("\n[winning_lotto]");
  if (plans.length === 0) {
    console.log("변경할 레코드가 없습니다.");
  } else {
    for (const plan of plans) {
      if (plan.action === "skip-undrawn") {
        console.log(
          `created_id=${plan.createdId}  ${plan.oldRound}회 ${formatRank(plan.oldRanking ?? 0)} → ${plan.newRound}회 미추첨 (등수 계산 안 함, 기존 당첨 내역은 삭제 예정)`,
        );
        continue;
      }

      const oldLabel =
        plan.oldRanking == null
          ? "없음"
          : `${plan.oldRound}회 ${formatRank(plan.oldRanking)}`;
      const newLabel =
        plan.newRanking === 0
          ? `${plan.newRound}회 낙첨`
          : `${plan.newRound}회 ${formatRank(plan.newRanking ?? 0)}`;
      console.log(
        `created_id=${plan.createdId}  ${oldLabel} → ${newLabel}  [${plan.action}]`,
      );
    }
  }
  console.log(`변경 예정: ${plans.length} / 생성 내역 ${createdRows.length}`);

  if (APPLY && plans.length > 0) {
    for (const plan of plans) {
      if (plan.action === "skip-undrawn" || plan.action === "delete") {
        if (plan.winningId != null) {
          await prisma.winning_lotto.delete({ where: { id: plan.winningId } });
        }
        continue;
      }

      const created = createdRows.find((row) => row.id === plan.createdId);
      if (!created || plan.newRanking == null) {
        continue;
      }

      const payload = {
        draw_number: plan.newRound,
        ranking: plan.newRanking,
        winning_number1: created.number1,
        winning_number2: created.number2,
        winning_number3: created.number3,
        winning_number4: created.number4,
        winning_number5: created.number5,
        winning_number6: created.number6,
        winning_created: created.created,
      };

      if (plan.action === "update" && plan.winningId != null) {
        await prisma.winning_lotto.update({
          where: { id: plan.winningId },
          data: payload,
        });
      } else if (plan.action === "insert") {
        await prisma.winning_lotto.create({ data: payload });
      }
    }
    console.log("winning_lotto 반영 완료");
  }

  return plans.length;
}

async function backfillWinningPension() {
  const [createdRows, draws, winningRows] = await Promise.all([
    prisma.created_pension.findMany({ orderBy: { id: "asc" } }),
    prisma.pension.findMany(),
    prisma.winning_pension.findMany(),
  ]);

  const drawByRound = new Map(draws.map((draw) => [draw.draw_number, draw]));

  const plans: {
    action: WinningAction;
    createdId: number;
    oldRound: number;
    newRound: number;
    oldRanking: number | null;
    newRanking: number | null;
    winningId?: number;
  }[] = [];

  for (const row of createdRows) {
    const newRound = getPensionRoundAt(row.created);
    const draw = drawByRound.get(newRound);
    const existing = winningRows.find(
      (winning) =>
        winning.winning_created.getTime() === row.created.getTime() &&
        winning.winning_number === row.number,
    );

    if (!draw) {
      if (existing) {
        plans.push({
          action: "skip-undrawn",
          createdId: row.id,
          oldRound: existing.draw_number,
          newRound,
          oldRanking: existing.ranking,
          newRanking: null,
          winningId: existing.id,
        });
      }
      continue;
    }

    const newRanking = getPensionRanking(
      row.number,
      draw.winning_number,
      draw.bonus_number,
    );

    if (newRanking === 0) {
      if (existing) {
        plans.push({
          action: "delete",
          createdId: row.id,
          oldRound: existing.draw_number,
          newRound,
          oldRanking: existing.ranking,
          newRanking: 0,
          winningId: existing.id,
        });
      }
      continue;
    }

    if (!existing) {
      plans.push({
        action: "insert",
        createdId: row.id,
        oldRound: row.draw_number,
        newRound,
        oldRanking: null,
        newRanking,
      });
      continue;
    }

    if (
      existing.draw_number !== newRound ||
      existing.ranking !== newRanking
    ) {
      plans.push({
        action: "update",
        createdId: row.id,
        oldRound: existing.draw_number,
        newRound,
        oldRanking: existing.ranking,
        newRanking,
        winningId: existing.id,
      });
    }
  }

  console.log("\n[winning_pension]");
  if (plans.length === 0) {
    console.log("변경할 레코드가 없습니다.");
  } else {
    for (const plan of plans) {
      if (plan.action === "skip-undrawn") {
        console.log(
          `created_id=${plan.createdId}  ${plan.oldRound}회 ${formatRank(plan.oldRanking ?? 0)} → ${plan.newRound}회 미추첨 (등수 계산 안 함, 기존 당첨 내역은 삭제 예정)`,
        );
        continue;
      }

      const oldLabel =
        plan.oldRanking == null
          ? "없음"
          : `${plan.oldRound}회 ${formatRank(plan.oldRanking)}`;
      const newLabel =
        plan.newRanking === 0
          ? `${plan.newRound}회 낙첨`
          : `${plan.newRound}회 ${formatRank(plan.newRanking ?? 0)}`;
      console.log(
        `created_id=${plan.createdId}  ${oldLabel} → ${newLabel}  [${plan.action}]`,
      );
    }
  }
  console.log(`변경 예정: ${plans.length} / 생성 내역 ${createdRows.length}`);

  if (APPLY && plans.length > 0) {
    for (const plan of plans) {
      if (plan.action === "skip-undrawn" || plan.action === "delete") {
        if (plan.winningId != null) {
          await prisma.winning_pension.delete({
            where: { id: plan.winningId },
          });
        }
        continue;
      }

      const created = createdRows.find((row) => row.id === plan.createdId);
      if (!created || plan.newRanking == null) {
        continue;
      }

      const payload = {
        draw_number: plan.newRound,
        ranking: plan.newRanking,
        winning_number: created.number,
        winning_created: created.created,
      };

      if (plan.action === "update" && plan.winningId != null) {
        await prisma.winning_pension.update({
          where: { id: plan.winningId },
          data: payload,
        });
      } else if (plan.action === "insert") {
        await prisma.winning_pension.create({ data: payload });
      }
    }
    console.log("winning_pension 반영 완료");
  }

  return plans.length;
}

async function main() {
  console.log(
    APPLY
      ? "모드: APPLY (DB에 반영합니다)"
      : "모드: DRY-RUN (출력만 하고 UPDATE하지 않습니다. 반영하려면 --apply)",
  );

  const lottoChanged = await backfillWinningLotto();
  const pensionChanged = await backfillWinningPension();

  console.log(
    `\n합계 변경 예정: ${lottoChanged + pensionChanged}건 (로또 ${lottoChanged}, 연금 ${pensionChanged})`,
  );

  if (!APPLY) {
    console.log("실제 반영: bun scripts/backfill-winning.ts --apply");
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
