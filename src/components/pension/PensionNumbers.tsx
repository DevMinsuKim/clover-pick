import { Fragment } from "react";
import { pensionNumberBg } from "@/utils/pensionNumberBg";

export default function PensionNumbers({
  number,
  compact = false,
}: {
  number: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex w-full items-center justify-between gap-0.5 ${compact ? "max-w-72" : ""}`}
      role="img"
      aria-label={`${number[0]}조 ${number.slice(1).split("").join(" ")}`}
    >
      {number.split("").map((digit, index) => (
        <Fragment key={index}>
          <span
            aria-hidden="true"
            className={`flex shrink-0 items-center justify-center rounded-full border-2 bg-background font-bold text-foreground tabular-nums ${compact ? "size-7 text-sm xs:size-8 xs:text-base" : "size-6 text-sm xs:size-8 xs:text-base sm:size-10 sm:text-xl"}`}
            style={{ borderColor: pensionNumberBg(index) }}
          >
            {digit}
          </span>
          {index === 0 && (
            <span
              aria-hidden="true"
              className="shrink-0 text-xs text-content3 sm:text-sm"
            >
              조
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}
