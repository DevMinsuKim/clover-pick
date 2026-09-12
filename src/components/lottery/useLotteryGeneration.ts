"use client";

import { useRef, useState } from "react";
import { getQueryClient } from "@/libs/getQueryClient";

export function useLotteryGeneration<
  TInput extends { requestId: string },
  TResult,
>(
  action: (
    input: TInput,
  ) => Promise<
    { success: TResult; error?: never } | { error: string; success?: never }
  >,
  historyKey: string,
  onBusyChange: (busy: boolean) => void,
) {
  const [result, setResult] = useState<TResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const active = useRef(false);
  const pending = useRef<{ signature: string; requestId: string } | null>(null);

  async function generate(input: Omit<TInput, "requestId">) {
    if (active.current) return;
    active.current = true;
    setBusy(true);
    onBusyChange(true);
    setError("");
    try {
      const signature = JSON.stringify(input);
      if (pending.current?.signature !== signature)
        pending.current = { signature, requestId: crypto.randomUUID() };
      const response = await action({
        ...input,
        requestId: pending.current.requestId,
      } as TInput);
      if (response.error) {
        setError(response.error);
        return;
      }
      if (response.success) {
        setResult(response.success);
        pending.current = null;
        const client = getQueryClient();
        // Refresh errors must not turn a successful save into a failed generation.
        void Promise.allSettled([
          client.invalidateQueries({ queryKey: [historyKey] }),
          client.invalidateQueries({ queryKey: ["home"] }),
        ]);
      }
    } catch {
      setError("연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.");
    } finally {
      active.current = false;
      setBusy(false);
      onBusyChange(false);
    }
  }
  function clear() {
    setResult(null);
    setError("");
  }
  function clearError() {
    setError("");
  }
  return { result, error, busy, generate, clear, clearError };
}
