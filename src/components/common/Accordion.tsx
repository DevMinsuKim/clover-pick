import type { ReactNode } from "react";
import { HiChevronDown } from "react-icons/hi2";

export default function Accordion({
  summary,
  children,
  name,
  className = "",
  summaryClassName = "",
  indicator = "chevron",
}: {
  summary: ReactNode;
  children: ReactNode;
  name?: string;
  className?: string;
  summaryClassName?: string;
  indicator?: "chevron" | "plus";
}) {
  return (
    <details name={name} className={`accordion ${className}`}>
      <summary
        className={`flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden ${summaryClassName}`}
      >
        <span>{summary}</span>
        {indicator === "plus" ? (
          <span
            aria-hidden="true"
            className="accordion-indicator accordion-plus shrink-0 text-xl font-normal text-content3"
          >
            +
          </span>
        ) : (
          <HiChevronDown
            aria-hidden="true"
            className="accordion-indicator size-4 shrink-0 text-content3"
          />
        )}
      </summary>
      <div className="accordion-panel">
        <div className="flow-root">{children}</div>
      </div>
    </details>
  );
}
