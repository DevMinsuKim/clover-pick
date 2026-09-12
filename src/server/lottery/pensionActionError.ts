import { captureException } from "@sentry/nextjs";
import { z } from "zod";
import { LotteryInputError } from "./lotteryInputError";
export function pensionActionError(
  error: unknown,
  operation: "analysis" | "generation",
) {
  if (error instanceof LotteryInputError) return { error: error.message };
  if (error instanceof z.ZodError)
    return {
      error:
        "입력한 조건을 확인해 주세요. 조는 1~5, 각 자리 숫자는 0~9, 게임 수는 1~5게임까지 사용할 수 있어요.",
    };
  // Never report SDK payloads, user prompts or database credentials.
  captureException(new Error(`Pension ${operation} failed`));
  return {
    error:
      operation === "analysis"
        ? "조건을 확인하지 못했어요. 잠시 후 다시 시도해 주세요."
        : "번호를 생성하지 못했어요. 잠시 후 다시 시도해 주세요.",
  };
}
