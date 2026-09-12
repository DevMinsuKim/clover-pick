import { z } from "zod";

const repeatSchema = z.number().int().min(1).max(5);
export const pensionGenerationInputSchema = z.object({
  repeat: repeatSchema,
  isAllGroup: z.boolean(),
});
export type PensionGenerationInput = z.infer<
  typeof pensionGenerationInputSchema
>;

export function lottoGenerationOutputSchema(repeat: number) {
  return z.object({
    lottoNumbers: z
      .array(
        z.object({
          numbers: z
            .array(z.number().int().min(1).max(45))
            .length(6)
            .refine(
              (numbers) => new Set(numbers).size === 6,
              "A lotto combination must contain six distinct numbers",
            ),
        }),
      )
      .length(repeat)
      .refine(
        (tickets) =>
          new Set(
            tickets.map(({ numbers }) =>
              [...numbers].sort((a, b) => a - b).join(","),
            ),
          ).size === tickets.length,
        "Lotto combinations must be distinct within one request",
      ),
  });
}

export function pensionGenerationOutputSchema({
  repeat,
  isAllGroup,
}: PensionGenerationInput) {
  return z
    .array(z.object({ number: z.string().regex(/^[1-5]\d{6}$/) }))
    .length(isAllGroup ? 5 : repeat)
    .refine(
      (tickets) =>
        new Set(tickets.map(({ number }) => number)).size === tickets.length,
      "Pension tickets must be distinct within one request",
    )
    .refine(
      (tickets) =>
        !isAllGroup ||
        new Set(tickets.map(({ number }) => number.slice(1))).size === 1,
      "All-group tickets must share the same six-digit number",
    );
}
