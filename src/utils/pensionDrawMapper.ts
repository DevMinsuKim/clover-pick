export interface PensionDrawJsonItem {
  wnSqNo: number;
  wnBndNo: string | null;
  wnRnkVl: string;
  psltRflYmd: string;
  psltEpsd: number;
}

export interface PensionDrawRow {
  draw_number: number;
  draw_date: Date;
  winning_number: string;
  bonus_number: string;
}

function parseDrawDate(ymd: string): Date {
  return new Date(
    `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}T00:00:00.000Z`,
  );
}

/**
 * 회차당 8행(1~7등 + 보너스) JSON을 pension 1행으로 접는다.
 * 1등(wnSqNo=1): 조(wnBndNo) + 6자리(wnRnkVl)
 * 보너스(wnSqNo=21): 6자리(wnRnkVl)
 */
export function mapPensionDrawJsonToRows(
  items: PensionDrawJsonItem[],
): PensionDrawRow[] {
  const firstByRound = new Map<number, PensionDrawJsonItem>();
  const bonusByRound = new Map<number, PensionDrawJsonItem>();

  for (const item of items) {
    if (item.wnSqNo === 1) {
      firstByRound.set(item.psltEpsd, item);
    } else if (item.wnSqNo === 21) {
      bonusByRound.set(item.psltEpsd, item);
    }
  }

  const rows: PensionDrawRow[] = [];
  for (const [drawNumber, first] of firstByRound) {
    const bonus = bonusByRound.get(drawNumber);
    if (!first.wnBndNo || !bonus) {
      throw new Error(`${drawNumber}회 1등 조 또는 보너스 번호가 없습니다.`);
    }

    rows.push({
      draw_number: drawNumber,
      draw_date: parseDrawDate(first.psltRflYmd),
      winning_number: `${first.wnBndNo}${first.wnRnkVl.padStart(6, "0")}`,
      bonus_number: bonus.wnRnkVl.padStart(6, "0"),
    });
  }

  return rows.sort((a, b) => a.draw_number - b.draw_number);
}

export function mapPensionDrawJsonToLatestRow(
  items: PensionDrawJsonItem[],
): PensionDrawRow {
  const rows = mapPensionDrawJsonToRows(items);
  if (rows.length === 0) {
    throw new Error("연금복권 당첨 JSON에 1등/보너스 행이 없습니다.");
  }
  return rows[rows.length - 1];
}
