import { z } from "zod";

export const PENSION_MAX_TICKETS = 5;
export const PENSION_PROMPT_MAX_LENGTH = 300;
export const pensionCountSchema = z
  .number()
  .int()
  .min(1)
  .max(PENSION_MAX_TICKETS);
export const pensionNumberSchema = z.string().regex(/^[1-5][0-9]{6}$/);
export const pensionDigitsSchema = z.string().regex(/^[0-9]{6}$/);
const digit = z.number().int().min(0).max(9);
export const pensionConstraintsSchema = z.strictObject({
  groups: z.array(z.number().int().min(1).max(5)).min(1).max(5),
  prefix: z.string().regex(/^[0-9]{0,6}$/),
  suffix: z.string().regex(/^[0-9]{0,6}$/),
  includeDigits: z.array(digit).max(10),
  excludeDigits: z.array(digit).max(10),
  parity: z.enum(["any", "even", "odd"]),
  uniqueDigits: z.boolean(),
});
export type PensionConstraints = z.infer<typeof pensionConstraintsSchema>;
export const emptyPensionConstraints: PensionConstraints = {
  groups: [1, 2, 3, 4, 5],
  prefix: "",
  suffix: "",
  includeDigits: [],
  excludeDigits: [],
  parity: "any",
  uniqueDigits: false,
};
export const pensionQuickConditions = [
  { id: "unique", label: "중복 숫자 없이" },
  { id: "no-zero", label: "0 제외" },
  { id: "last-seven", label: "끝자리 7" },
] as const;
export type PensionQuickCondition =
  (typeof pensionQuickConditions)[number]["id"];
export const pensionAnalyzeInputSchema = z
  .strictObject({
    prompt: z.string().max(PENSION_PROMPT_MAX_LENGTH).trim(),
    repeat: pensionCountSchema,
    isAllGroup: z.boolean(),
    presets: z.array(z.enum(["unique", "no-zero", "last-seven"])).max(3),
  })
  .refine(
    (input) =>
      Boolean(input.prompt || input.presets.length || input.isAllGroup),
    "조건을 입력하거나 선택해 주세요.",
  );
export type PensionAnalyzeInput = z.infer<typeof pensionAnalyzeInputSchema>;
export const pensionCreateInputSchema = z
  .strictObject({
    repeat: pensionCountSchema,
    isAllGroup: z.boolean(),
    requestId: z.uuid(),
    expectedRound: z.number().int().positive(),
    constraints: pensionConstraintsSchema.optional(),
  })
  .refine(
    (input) => !input.isAllGroup || input.repeat === 5,
    "모든 조를 선택하면 5게임을 생성해요.",
  );
export type PensionCreateInput = z.infer<typeof pensionCreateInputSchema>;
export function pensionOutputSchema(input: {
  repeat: number;
  isAllGroup: boolean;
}) {
  return z
    .array(z.strictObject({ number: pensionNumberSchema }))
    .length(input.repeat)
    .refine(
      (tickets) =>
        new Set(tickets.map((t) => t.number)).size === tickets.length,
    )
    .refine(
      (tickets) =>
        !input.isAllGroup ||
        (tickets.length === 5 &&
          new Set(tickets.map((t) => t.number.slice(1))).size === 1),
    );
}
export interface PensionPlan {
  constraints: PensionConstraints;
  repeat: number;
  isAllGroup: boolean;
  round: number;
  combinationCount: number;
}
export interface PensionGeneration {
  pensionNumbers: { number: string }[];
  round: number;
  isAllGroup: boolean;
}
export type PensionActionResult<T> =
  | { success: T; error?: never }
  | { error: string; success?: never };
export function describePensionConditions(c: PensionConstraints) {
  return [
    ...(c.groups.length < 5
      ? [
          c.groups.length === 1
            ? `${c.groups[0]}조`
            : `${c.groups.join("·")}조 중 선택`,
        ]
      : []),
    ...(c.prefix ? [`앞 ${c.prefix.length}자리 ${c.prefix}`] : []),
    ...(c.suffix ? [`끝 ${c.suffix.length}자리 ${c.suffix}`] : []),
    ...(c.includeDigits.length
      ? [`숫자 ${c.includeDigits.join("·")} 포함`]
      : []),
    ...(c.excludeDigits.length
      ? [`숫자 ${c.excludeDigits.join("·")} 제외`]
      : []),
    ...(c.parity === "any"
      ? []
      : [c.parity === "even" ? "여섯 자리 모두 짝수" : "여섯 자리 모두 홀수"]),
    ...(c.uniqueDigits ? ["여섯 자리 중복 숫자 없이"] : []),
  ];
}
