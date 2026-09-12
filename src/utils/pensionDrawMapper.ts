import { z } from "zod";

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
  if (!/^[0-9]{8}$/.test(ymd))
    throw new Error("추첨일 형식이 올바르지 않습니다.");
  const iso = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
  const date = new Date(`${iso}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso)
    throw new Error("실제 존재하는 추첨일이 아닙니다.");
  return date;
}
const drawItemSchema = z.object({
  wnSqNo: z.number().int(),
  wnBndNo: z.string().nullable(),
  wnRnkVl: z.string().regex(/^[0-9]{1,6}$/),
  psltRflYmd: z.string(),
  psltEpsd: z.number().int().positive(),
});

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

  for (const raw of items) {
    if (raw.wnSqNo !== 1 && raw.wnSqNo !== 21) continue;
    const item = drawItemSchema.parse(raw);
    const prior = (item.wnSqNo === 1 ? firstByRound : bonusByRound).get(
      item.psltEpsd,
    );
    if (
      prior &&
      (prior.wnBndNo !== item.wnBndNo ||
        prior.wnRnkVl !== item.wnRnkVl ||
        prior.psltRflYmd !== item.psltRflYmd)
    )
      throw new Error(`${item.psltEpsd}회 추첨 데이터가 서로 다릅니다.`);
    if (item.wnSqNo === 1) {
      firstByRound.set(item.psltEpsd, item);
    } else if (item.wnSqNo === 21) {
      bonusByRound.set(item.psltEpsd, item);
    }
  }

  if ([...bonusByRound.keys()].some((round) => !firstByRound.has(round)))
    throw new Error("1등 번호가 없는 보너스 회차가 있습니다.");
  const rows: PensionDrawRow[] = [];
  firstByRound.forEach((first, drawNumber) => {
    const bonus = bonusByRound.get(drawNumber);
    if (!first.wnBndNo || !/^[1-5]$/.test(first.wnBndNo) || !bonus) {
      throw new Error(`${drawNumber}회 1등 조 또는 보너스 번호가 없습니다.`);
    }

    if (first.psltRflYmd !== bonus.psltRflYmd)
      throw new Error(`${drawNumber}회 추첨일이 서로 다릅니다.`);
    if (first.wnRnkVl.padStart(6, "0") === bonus.wnRnkVl.padStart(6, "0"))
      throw new Error(`${drawNumber}회 1등과 보너스 번호가 같습니다.`);
    rows.push({
      draw_number: drawNumber,
      draw_date: parseDrawDate(first.psltRflYmd),
      winning_number: `${first.wnBndNo}${first.wnRnkVl.padStart(6, "0")}`,
      bonus_number: bonus.wnRnkVl.padStart(6, "0"),
    });
  });

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
