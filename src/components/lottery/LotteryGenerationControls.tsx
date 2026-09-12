"use client";
import { type ButtonHTMLAttributes, type ReactNode, useState } from "react";
import { primaryActionClassName } from "../common/actionStyles";
import Button from "../common/Button";
export function LotteryActionButton({
  busy = false,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <Button {...props} className={`${primaryActionClassName} ${className}`}>
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

export function LotteryCountSelector({
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
        생성할 게임 수{" "}
        <span className="font-normal text-content3">· 최대 5게임</span>
      </legend>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }, (_, index) => index + 1).map((count) => (
          <button
            key={count}
            type="button"
            aria-pressed={count === value}
            onClick={() => onChange(count)}
            className={`min-h-11 rounded-lg border px-1 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 ${value === count ? "border-primary bg-primary/10 text-primary1 dark:text-primary" : "border-divider dark:border-zinc-600 hover:bg-content1Hover"}`}
          >
            {count}게임
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function LotteryInlineError({
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

export function LotteryResultActions({
  children,
  copyText,
  onAgain,
  busy,
  againLabel = "같은 조건으로 다시 생성",
}: {
  children: ReactNode;
  copyText: string;
  onAgain: () => void;
  busy: boolean;
  againLabel?: string;
}) {
  const [copyMessage, setCopyMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopyMessage("번호를 복사했어요.");
    } catch {
      setCopyMessage(
        "복사하지 못했어요. 표시된 번호를 직접 선택해 복사해 주세요.",
      );
    }
  }
  return (
    <div className="mt-6">
      {children}
      <LotteryActionButton
        type="button"
        onClick={copy}
        disabled={busy}
        className="mt-5"
      >
        번호 복사하기
      </LotteryActionButton>
      <button
        type="button"
        onClick={() => {
          setCopyMessage("");
          onAgain();
        }}
        disabled={busy}
        className="mt-3 min-h-12 w-full rounded-lg border border-divider dark:border-zinc-600 px-4 py-3 text-sm font-semibold hover:bg-content1Hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
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
