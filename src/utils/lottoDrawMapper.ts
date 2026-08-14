export interface LottoDrawJsonItem {
  ltEpsd: number;
  ltRflYmd: string;
  tm1WnNo: number;
  tm2WnNo: number;
  tm3WnNo: number;
  tm4WnNo: number;
  tm5WnNo: number;
  tm6WnNo: number;
  bnsWnNo: number;
  rnk1WnNope: number;
  rnk1WnAmt: number;
  rnk2WnNope: number;
  rnk2WnAmt: number;
  rnk3WnNope: number;
  rnk3WnAmt: number;
  rnk4WnNope: number;
  rnk4WnAmt: number;
  rnk5WnNope: number;
  rnk5WnAmt: number;
}

export interface LottoDrawRow {
  draw_number: number;
  draw_date: Date;
  first_prize_winners: number;
  first_prize_amount: bigint;
  second_prize_winners: number;
  second_prize_amount: bigint;
  third_prize_winners: number;
  third_prize_amount: bigint;
  fourth_prize_winners: number;
  fourth_prize_amount: bigint;
  fifth_prize_winners: number;
  fifth_prize_amount: bigint;
  winning_number_1: number;
  winning_number_2: number;
  winning_number_3: number;
  winning_number_4: number;
  winning_number_5: number;
  winning_number_6: number;
  bonus_number: number;
}

function parseDrawDate(ymd: string): Date {
  return new Date(
    `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}T00:00:00.000Z`,
  );
}

/** 동행복권 최근 당첨 JSON 1건을 lotto 테이블 행으로 변환한다. 당첨금은 등수별 1인당 금액(rnkNWnAmt)을 쓴다. */
export function mapLottoDrawJsonToRow(item: LottoDrawJsonItem): LottoDrawRow {
  return {
    draw_number: item.ltEpsd,
    draw_date: parseDrawDate(item.ltRflYmd),
    first_prize_winners: item.rnk1WnNope,
    first_prize_amount: BigInt(item.rnk1WnAmt),
    second_prize_winners: item.rnk2WnNope,
    second_prize_amount: BigInt(item.rnk2WnAmt),
    third_prize_winners: item.rnk3WnNope,
    third_prize_amount: BigInt(item.rnk3WnAmt),
    fourth_prize_winners: item.rnk4WnNope,
    fourth_prize_amount: BigInt(item.rnk4WnAmt),
    fifth_prize_winners: item.rnk5WnNope,
    fifth_prize_amount: BigInt(item.rnk5WnAmt),
    winning_number_1: item.tm1WnNo,
    winning_number_2: item.tm2WnNo,
    winning_number_3: item.tm3WnNo,
    winning_number_4: item.tm4WnNo,
    winning_number_5: item.tm5WnNo,
    winning_number_6: item.tm6WnNo,
    bonus_number: item.bnsWnNo,
  };
}
