import { z } from "zod";

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
