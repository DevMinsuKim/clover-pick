"use client";

import { type ButtonHTMLAttributes, useState } from "react";
import type { LottoGeneration } from "@/server/lottery/lottoContracts";
import { LOTTO_MAX_SETS } from "@/server/lottery/lottoContracts";
import { lottoNumberBg } from "@/utils/lottoNumberBg";
import Button from "../common/Button";

export function LottoActionButton({
  busy = false,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <Button
      {...props}
      className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-lg! px-4 py-3 text-sm leading-5 text-white! bg-green-700! hover:bg-green-800! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {busy && (
        <span
          aria-hidden="true"
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"
        />
      )}
      {children}
    </Button>
  );
}

export function LottoSetSelector({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="mt-5">
      <legend className="text-sm font-semibold">
        생성할 세트 수{" "}
        <span className="font-normal text-content3">
          · 최대 {LOTTO_MAX_SETS}세트
        </span>
      </legend>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {Array.from({ length: LOTTO_MAX_SETS }, (_, index) => index + 1).map(
          (count) => (
            <button
              key={count}
              type="button"
              aria-pressed={count === value}
              onClick={() => onChange(count)}
              className={`min-h-11 rounded-lg border px-1 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 ${value === count ? "border-primary bg-primary/10 text-primary1 dark:text-primary" : "border-divider dark:border-zinc-600 hover:bg-content1Hover"}`}
            >
              {count}세트
            </button>
          ),
        )}
      </div>
    </fieldset>
  );
}

export function LottoInlineError({
  message,
  id,
}: {
  message: string;
  id?: string;
}) {
  return message ? (
    <p
      id={id}
      role="alert"
      className="mt-3 text-sm leading-6 text-red-700 dark:text-red-300"
    >
      {message}
    </p>
  ) : null;
}

export function LottoGenerationResult({
  result,
  onAgain,
  busy,
  againLabel = "같은 조건으로 다시 생성",
}: {
  result: LottoGeneration;
  onAgain: () => void;
  busy: boolean;
  againLabel?: string;
}) {
  const [copyMessage, setCopyMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `${result.round}회 로또\n` +
          result.lottoNumbers
            .map(
              ({ numbers }, index) => `${index + 1}. [${numbers.join(", ")}]`,
            )
            .join("\n"),
      );
      setCopyMessage("번호를 복사했어요.");
    } catch {
      setCopyMessage(
        "복사하지 못했어요. 표시된 번호를 직접 선택해 복사해 주세요.",
      );
    }
  }
  return (
    <div className="mt-6">
      <h3 className="text-sm font-bold">
        {result.round}회 · {result.lottoNumbers.length}세트
      </h3>
      <ul className="mt-3 space-y-3" aria-label="생성한 로또 번호">
        {result.lottoNumbers.map(({ numbers }, index) => (
          <li
            key={numbers.join(",")}
            className="flex justify-between gap-1 rounded-lg bg-content1Hover/50 p-3"
            aria-label={`${index + 1}세트: ${numbers.join(", ")}`}
          >
            {numbers.map((number) => (
              <span
                key={number}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white xs:h-9 xs:w-9 xs:text-base sm:h-12 sm:w-12 sm:text-xl"
                style={{
                  backgroundColor: lottoNumberBg(number),
                  textShadow: "0px 0px 3px rgba(73, 57, 0, .8)",
                }}
              >
                {number}
              </span>
            ))}
          </li>
        ))}
      </ul>
      <LottoActionButton
        type="button"
        onClick={copy}
        disabled={busy}
        className="mt-5"
      >
        번호 복사하기
      </LottoActionButton>
      <button
        type="button"
        onClick={() => {
          setCopyMessage("");
          onAgain();
        }}
        disabled={busy}
        className="mt-3 min-h-11 w-full rounded-lg border border-divider dark:border-zinc-600 px-4 py-3 text-sm font-semibold hover:bg-content1Hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
      >
        {busy ? "번호 생성 중..." : againLabel}
      </button>
      <p
        role="status"
        className={
          copyMessage
            ? "mt-3 text-center text-xs leading-5 text-content3"
            : "sr-only"
        }
      >
        {copyMessage}
      </p>
    </div>
  );
}
