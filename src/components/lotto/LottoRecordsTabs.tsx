"use client";

import { type KeyboardEvent, useId, useRef, useState } from "react";
import LottoRecordsList from "./LottoRecordsList";

const tabs = [
  { kind: "history", label: "생성 목록" },
  { kind: "winning", label: "당첨 내역" },
] as const;

export default function LottoRecordsTabs() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = (index + 1) % tabs.length;
        break;
      case "ArrowLeft":
        next = (index + tabs.length - 1) % tabs.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setSelected(next);
    buttons.current[next]?.focus();
  }

  return (
    <section aria-label="로또 번호 기록">
      <h2 className="mb-4 text-lg font-bold sm:text-2xl">로또 번호 기록</h2>
      <div
        role="tablist"
        aria-label="로또 번호 목록"
        className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-divider bg-content1 p-1 dark:border-zinc-600"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.kind}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            id={`${id}-tab-${tab.kind}`}
            type="button"
            role="tab"
            aria-selected={selected === index}
            aria-controls={`${id}-panel-${tab.kind}`}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`min-h-12 rounded-lg px-4 py-3 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected === index ? "bg-green-700 text-white shadow-sm" : "hover:bg-content1Hover"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.kind}
          role="tabpanel"
          id={`${id}-panel-${tab.kind}`}
          aria-labelledby={`${id}-tab-${tab.kind}`}
          hidden={selected !== index}
          className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <LottoRecordsList kind={tab.kind} active={selected === index} />
        </div>
      ))}
    </section>
  );
}
