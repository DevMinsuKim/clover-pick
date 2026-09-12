import { z } from "zod";

export const LOTTO_MAX_SETS = 5;
export const LOTTO_PROMPT_MAX_LENGTH = 300;
export const lottoSetCountSchema = z.number().int().min(1).max(LOTTO_MAX_SETS);
const number = z.number().int().min(1).max(45);
export const lottoConstraintsSchema = z.strictObject({
  include: z.array(number).max(6),
  exclude: z.array(number).max(45),
  oddCount: z.number().int().min(0).max(6).nullable(),
  frequent: z.boolean(),
});
export type LottoConstraints = z.infer<typeof lottoConstraintsSchema>;
export const emptyLottoConstraints: LottoConstraints = {
  include: [],
  exclude: [],
  oddCount: null,
  frequent: false,
};
export const lottoQuickConditions = [
  { id: "even", label: "짝수만", oddCount: 0 },
  { id: "odd", label: "홀수만", oddCount: 6 },
  { id: "frequent", label: "최근 많이 나온 번호", oddCount: null },
] as const;
export type LottoQuickCondition = (typeof lottoQuickConditions)[number]["id"];
export const lottoAnalyzeInputSchema = z
  .strictObject({
    prompt: z.string().max(LOTTO_PROMPT_MAX_LENGTH).trim(),
    repeat: lottoSetCountSchema,
    presets: z.array(z.enum(["even", "odd", "frequent"])).max(2),
  })
  .refine(
    (input) => Boolean(input.prompt || input.presets.length),
    "조건을 입력하거나 선택해 주세요.",
  );
export type LottoAnalyzeInput = z.infer<typeof lottoAnalyzeInputSchema>;
export const lottoCreateInputSchema = z.strictObject({
  repeat: lottoSetCountSchema,
  requestId: z.uuid(),
  expectedRound: z.number().int().positive(),
  constraints: lottoConstraintsSchema.optional(),
});
export type LottoCreateInput = z.infer<typeof lottoCreateInputSchema>;
export interface LottoFrequencySource {
  fromRound: number;
  toRound: number;
  drawCount: number;
  pool: number[];
}
export interface LottoPlan {
  constraints: LottoConstraints;
  repeat: number;
  round: number;
  combinationCount: number;
  frequency: LottoFrequencySource | null;
}
export interface LottoGeneration {
  lottoNumbers: { numbers: number[] }[];
  round: number;
}
export type LottoActionResult<T> =
  | { success: T; error?: never }
  | { error: string; success?: never };
export function describeLottoConditions(constraints: LottoConstraints) {
  return [
    ...(constraints.include.length
      ? [`${constraints.include.join(" · ")} 포함`]
      : []),
    ...(constraints.exclude.length
      ? [`${constraints.exclude.join(" · ")} 제외`]
      : []),
    ...(constraints.oddCount === null
      ? []
      : [
          constraints.oddCount === 0
            ? "짝수만"
            : constraints.oddCount === 6
              ? "홀수만"
              : `홀수 ${constraints.oddCount}개 · 짝수 ${6 - constraints.oddCount}개`,
        ]),
    ...(constraints.frequent ? ["최근 많이 나온 20개 번호 중 선택"] : []),
  ];
}
