"use client";

import { useId, useRef, useState } from "react";
import {
  LotteryActionButton,
  LotteryInlineError,
} from "@/components/lottery/LotteryGenerationControls";
import {
  describePensionConditions,
  PENSION_PROMPT_MAX_LENGTH,
  type PensionPlan,
  type PensionQuickCondition,
  pensionQuickConditions,
} from "@/server/lottery/pensionContracts";
import { analyzePensionConditionsActions } from "@/server/pension/analyzePensionConditionsActions";
import {
  PensionGenerationResult,
  PensionTicketSelector,
} from "./PensionGenerationControls";
import { usePensionGeneration } from "./usePensionGeneration";

export default function PensionCustomGenerator({
  onBusyChange,
}: {
  onBusyChange: (busy: boolean) => void;
}) {
  const inputId = useId();
  const [prompt, setPrompt] = useState("");
  const [presets, setPresets] = useState<PensionQuickCondition[]>([]);
  const [repeat, setRepeat] = useState(1);
  const [isAllGroup, setIsAllGroup] = useState(false);
  const [plan, setPlan] = useState<PensionPlan | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const active = useRef(false);
  const generation = usePensionGeneration(onBusyChange);
  const busy = analyzing || generation.busy;

  function toggle(id: PensionQuickCondition) {
    setError("");
    setPresets((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }
  async function analyze() {
    if (active.current || busy) return;
    active.current = true;
    setAnalyzing(true);
    onBusyChange(true);
    setError("");
    try {
      const response = await analyzePensionConditionsActions({
        prompt,
        repeat,
        presets,
        isAllGroup,
      });
      if (response.error) setError(response.error);
      else if (response.success) {
        setPlan(response.success);
        setRepeat(response.success.repeat);
        setIsAllGroup(response.success.isAllGroup);
      }
    } catch {
      setError(
        "조건을 확인하지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.",
      );
    } finally {
      active.current = false;
      setAnalyzing(false);
      onBusyChange(false);
    }
  }
  function generate() {
    if (plan)
      void generation.generate({
        repeat: plan.repeat,
        constraints: plan.constraints,
        isAllGroup: plan.isAllGroup,
        expectedRound: plan.round,
      });
  }
  function edit() {
    setPlan(null);
    generation.clear();
    setError("");
  }

  return (
    <div className="px-5 pb-5 pt-6 text-left sm:px-6" aria-busy={busy}>
      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary1 dark:text-primary">
        맞춤 생성
      </span>
      <h2 className="mt-3 text-xl font-bold">
        {generation.result
          ? "나만의 번호가 준비됐어요"
          : plan
            ? "조건을 확인해 주세요"
            : "원하는 조건으로 골라보세요"}
      </h2>
      <p
        id={`${inputId}-hint`}
        className="mt-2 text-sm leading-6 text-content3"
      >
        {plan
          ? "확인한 조건을 모두 만족하는 번호를 무작위로 골라요."
          : "원하는 조, 앞·끝자리, 포함·제외할 숫자를 적어 주세요. 숫자 조건은 조를 제외한 여섯 자리에 적용해요."}
      </p>
      {!plan ? (
        <form
          className="mt-5"
          onSubmit={(event) => {
            event.preventDefault();
            void analyze();
          }}
        >
          <label htmlFor={inputId} className="mb-2 block text-sm font-semibold">
            나만의 번호 조건{" "}
            <span className="font-normal text-content3">· 선택 입력</span>
          </label>
          <textarea
            id={inputId}
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              setError("");
            }}
            disabled={busy}
            maxLength={PENSION_PROMPT_MAX_LENGTH}
            rows={3}
            placeholder="예: 3조로, 끝 두 자리는 07로 고정해서 3게임 만들어줘."
            aria-describedby={`${inputId}-hint ${inputId}-count ${inputId}-privacy${error ? ` ${inputId}-error` : ""}`}
            aria-invalid={Boolean(error)}
            className="sentry-mask block max-h-48 min-h-28 w-full resize-y rounded-lg border border-divider dark:border-zinc-600 bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-content3 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
          <p
            id={`${inputId}-count`}
            className="mt-1 text-right text-xs text-content3"
          >
            {prompt.length}/{PENSION_PROMPT_MAX_LENGTH}자
          </p>
          <fieldset disabled={busy} className="mt-4">
            <legend className="text-xs text-content3">
              빠른 조건 · 원하는 조건을 골라보세요
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {pensionQuickConditions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={presets.includes(item.id)}
                  onClick={() => toggle(item.id)}
                  className={`min-h-11 rounded-full border px-3 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 ${presets.includes(item.id) ? "border-primary bg-primary/10 text-primary1 dark:text-primary" : "border-divider dark:border-zinc-600 hover:border-primary hover:bg-primary/5"}`}
                >
                  {presets.includes(item.id) ? "✓ " : ""}
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>
          <PensionTicketSelector
            repeat={repeat}
            isAllGroup={isAllGroup}
            onChange={(count, all) => {
              setRepeat(count);
              setIsAllGroup(all);
              setError("");
            }}
            disabled={busy}
          />
          <p className="mt-2 text-xs leading-5 text-content3">
            문장에 게임 수를 적으면 그 수를 우선 적용해요. 모든 조는 총
            5게임이에요.
          </p>
          <LotteryInlineError message={error} id={`${inputId}-error`} />
          <LotteryActionButton
            type="submit"
            busy={analyzing}
            disabled={
              busy || (!prompt.trim() && !presets.length && !isAllGroup)
            }
            className="mt-6"
          >
            {analyzing ? "조건 확인 중..." : "조건 확인하기"}
          </LotteryActionButton>
          <p
            id={`${inputId}-privacy`}
            className="mt-3 text-xs leading-5 text-content3"
          >
            입력한 문장은 조건을 정리하기 위해 AI(OpenAI)에 전달돼요. 생성
            목록에는 입력 문장을 저장하지 않아요. 이름·연락처 등 개인정보는
            입력하지 마세요.
          </p>
        </form>
      ) : (
        <div className="mt-5">
          <div className="mb-2 flex min-h-11 items-center justify-between gap-2">
            <h3 className="text-sm font-bold">이 조건으로 만들게요</h3>
            <button
              type="button"
              disabled={busy}
              onClick={edit}
              className="min-h-11 shrink-0 px-1 text-xs underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
            >
              조건 수정
            </button>
          </div>
          <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
            {prompt && (
              <p className="sentry-mask break-words text-sm leading-6 text-content3">
                {prompt}
              </p>
            )}
            <ul aria-label="확인한 생성 조건" className="flex flex-wrap gap-2">
              {[
                `${plan.round}회 · ${plan.repeat}게임`,
                ...(plan.isAllGroup ? ["같은 번호로 1~5조"] : []),
                ...describePensionConditions(plan.constraints),
              ].map((condition) => (
                <li
                  key={condition}
                  className="max-w-full break-words rounded-xl border border-primary/20 bg-background px-3 py-1.5 text-xs font-semibold leading-5 text-primary1 dark:text-primary"
                >
                  {condition}
                </li>
              ))}
            </ul>
          </div>
          <LotteryInlineError message={generation.error} />
          {generation.result ? (
            <PensionGenerationResult
              key={JSON.stringify(generation.result)}
              result={generation.result}
              busy={generation.busy}
              onAgain={generate}
            />
          ) : (
            <LotteryActionButton
              type="button"
              busy={generation.busy}
              disabled={busy}
              onClick={generate}
              className="mt-5"
            >
              {generation.busy
                ? "번호 생성 중..."
                : `${plan.repeat}게임 번호 생성하기`}
            </LotteryActionButton>
          )}
        </div>
      )}
      <p role="status" className="sr-only">
        {analyzing
          ? "조건을 확인하고 있어요."
          : generation.busy
            ? "번호를 생성하고 있어요."
            : plan
              ? "조건 확인이 끝났어요."
              : ""}
      </p>
    </div>
  );
}
