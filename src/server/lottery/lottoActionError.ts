import { captureException } from "@sentry/nextjs";
import { z } from "zod";
import { LottoInputError } from "./lottoEngine";

export function lottoActionError(
  error: unknown,
  operation: "analysis" | "generation",
) {
  if (error instanceof LottoInputError) return { error: error.message };
  if (error instanceof z.ZodError)
    return {
      error:
        "입력한 조건을 확인해 주세요. 번호는 1~45, 게임 수는 1~5게임까지 사용할 수 있어요.",
    };
  // SDK/DB exceptions can contain prompts, connection details or provider payloads.
  captureException(new Error(`Lotto ${operation} failed`));
  return {
    error:
      operation === "analysis"
        ? "조건을 확인하지 못했어요. 잠시 후 다시 시도해 주세요."
        : "번호를 생성하지 못했어요. 잠시 후 다시 시도해 주세요.",
  };
}
